/* TreeView — column-aware layout (Key + N specialty columns).
   Renders one canvas per tree. Supports drag-to-reposition, edge editing,
   and prereq-aware learn/lock states driven by the character store.
*/

const { useMemo: useM_tv, useState: useS_tv, useRef: useR_tv, useEffect: useE_tv, useCallback: useC_tv } = React;

/* Action-cost icon (used INSIDE each node). */
function TalentIcon({ actionType, size = 30 }) {
  const raw = (actionType || '').trim();
  const at = raw.toLowerCase();

  // Glyph normalization — accept both glyph (new data) and word labels (old data).
  // Glyphs: ∞ passive, ★ special, ⟲ reaction, ◇ free, ▶ 1-action, ▶▶ 2, ▶▶▶ 3.
  const isPassive  = at === 'passive'  || raw === '∞' || at.includes('passiv');
  const isSpecial  = at === 'special'  || raw === '★' || at.includes('specia');
  const isReaction = at === 'reaction' || raw === '⟲' || raw === '↺' || raw === '↻' || at.includes('react');
  const isFree     = at.includes('free') || raw === '◇';
  const triCount = (raw.match(/▶/g) || []).length;
  const wordCount = at.includes('3 action') ? 3 : at.includes('2 action') ? 2 : at.includes('1 action') ? 1 : 0;

  const s = size;

  // Passive — hollow infinity / lemniscate (stroke only)
  if (isPassive) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path
          d="M 4 12 C 4 8, 9 8, 12 12 C 15 16, 20 16, 20 12 C 20 8, 15 8, 12 12 C 9 16, 4 16, 4 12 Z"
          fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>);
  }

  // Special — filled 5-point star
  if (isSpecial) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path
          d="M12 2.5 L14.6 9.4 L22 9.9 L16.2 14.4 L18.2 21.5 L12 17.6 L5.8 21.5 L7.8 14.4 L2 9.9 L9.4 9.4 Z"
          fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
      </svg>);
  }

  // Reaction — U-turn arrow
  if (isReaction) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        {/* curved U-turn body */}
        <path d="M6 18 L6 11 A5 5 0 0 1 16 11 L16 16"
          fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* arrowhead at end */}
        <path d="M16 20 L13 16 L19 16 Z"
          fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
      </svg>);
  }

  // Free Action — hollow play triangle
  if (isFree) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M7 5 L19 12 L7 19 Z"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />
      </svg>);
  }

  // N Action — N filled play triangles. Prefer glyph-derived count, then word, then default 1.
  const count = triCount > 0 ? Math.min(triCount, 3) : (wordCount || 1);

  // Triangle dimensions tuned for 24-unit viewBox
  const triW = 6;
  const triH = 12;
  const gap = 1.5;
  const groupW = count * triW + (count - 1) * gap;
  const startX = 12 - groupW / 2;
  const cy = 12;
  const tris = [];
  for (let i = 0; i < count; i++) {
    const x = startX + i * (triW + gap);
    tris.push(
      <path key={i}
        d={`M${x} ${cy - triH / 2} L${x + triW} ${cy} L${x} ${cy + triH / 2} Z`}
        fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" />);
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24">{tris}</svg>);
}

// Cost → array of small badge pips. Each pip is {label, kind}.
function parseCostPips(cost) {
  if (!cost) return [];
  const s = String(cost);
  if (s === '—' || s === '-' || !s.trim()) return [];
  const pips = [];
  let m;
  if (/variable\s*Investit/i.test(s)) {
    pips.push({ label: 'X', kind: 'I' });
  } else if ((m = s.match(/(\d+)\s*Investit/i))) {
    const n = +m[1];
    pips.push({ label: n === 1 ? 'I' : n + 'I', kind: 'I' });
  }
  if ((m = s.match(/(\d+)\s*Focus/i))) {
    const n = +m[1];
    pips.push({ label: n === 1 ? 'F' : n + 'F', kind: 'F' });
  }
  if (/Opportunity/i.test(s)) pips.push({ label: 'Op', kind: 'O' });
  if (/Lose\s*HP|HP\s*=/i.test(s)) pips.push({ label: 'HP', kind: 'HP' });
  return pips;
}

const PIP_COLORS = {
  I:  { bg: 'var(--ink-1)',      fg: 'var(--parch-0)' },
  F:  { bg: 'var(--accent-ink)', fg: 'var(--parch-0)' },
  O:  { bg: 'var(--accent-2)',   fg: 'var(--ink-1)'   },
  HP: { bg: 'var(--rubric)',     fg: 'var(--parch-0)' },
};
const SNAP = 0.02;
function snap(v) {return Math.round(v / SNAP) * SNAP;}

function loadOverrides(treeId) {
  try {return JSON.parse(localStorage.getItem(`skilltrees:layout:${treeId}`) || '{}');}
  catch {return {};}
}
function saveOverrides(treeId, obj) {
  if (!obj || !Object.keys(obj).length) localStorage.removeItem(`skilltrees:layout:${treeId}`);else
  localStorage.setItem(`skilltrees:layout:${treeId}`, JSON.stringify(obj));
}

function loadConnections(treeId) {
  try {
    const raw = localStorage.getItem(`skilltrees:conns:${treeId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {return null;}
}
function saveConnections(treeId, arr) {
  if (arr == null) localStorage.removeItem(`skilltrees:conns:${treeId}`);else
  localStorage.setItem(`skilltrees:conns:${treeId}`, JSON.stringify(arr));
}

function wouldCreateCycle(edges, src, tgt, N) {
  const adj = Array.from({ length: N }, () => []);
  for (const [p, c] of edges) adj[p].push(c);
  adj[src].push(tgt);
  const seen = new Set([tgt]);
  const stack = [tgt];
  while (stack.length) {
    const n = stack.pop();
    if (n === src) return true;
    for (const m of adj[n]) if (!seen.has(m)) {seen.add(m);stack.push(m);}
  }
  return false;
}

function TreeView({
  tree,
  selected, onSelect,
  character, // live character state (for learned/canLearn)
  prereqResults, // map: tid -> { ok, groups }
  editMode,
  buildMode, // toggles allocation mode visuals
  onResetLayout, onResetConnections, onExport
}) {
  const talents = tree.talents;

  // Pass tree as second arg so layout can use columns
  const layout = useM_tv(() => window.Layout.layoutTree(talents, tree), [talents, tree]);
  const wrapRef = useR_tv(null);
  const svgRef = useR_tv(null);
  const [dims, setDims] = useS_tv({ w: 1000, h: 720 });
  const [overrides, setOverrides] = useS_tv(() => loadOverrides(tree.id));
  const [dragIdx, setDragIdx] = useS_tv(null);
  const [connOverride, setConnOverride] = useS_tv(() => loadConnections(tree.id));
  const [connectSource, setConnectSource] = useS_tv(null);
  const [selectedEdge, setSelectedEdge] = useS_tv(null);
  const [cycleWarn, setCycleWarn] = useS_tv(null);

  useE_tv(() => {
    setOverrides(loadOverrides(tree.id));
    setConnOverride(loadConnections(tree.id));
    setDragIdx(null);setConnectSource(null);setSelectedEdge(null);setCycleWarn(null);
  }, [tree.id]);

  useE_tv(() => {
    const loaded = loadConnections(tree.id);
    if (!Array.isArray(loaded)) {
      setConnOverride(loaded);
      return;
    }
    const cleaned = loaded.filter(([s, t]) =>
      Number.isInteger(s) && Number.isInteger(t) &&
      s >= 0 && t >= 0 && s < talents.length && t < talents.length && s !== t
    );
    setConnOverride(cleaned);
    if (cleaned.length !== loaded.length) saveConnections(tree.id, cleaned);
  }, [tree.id, talents]);

  useE_tv(() => {
    if (onResetLayout) onResetLayout.current = () => {
      setOverrides({});
      saveOverrides(tree.id, {});
    };
  }, [tree.id, onResetLayout]);

  useE_tv(() => {
    if (onResetConnections) onResetConnections.current = () => {
      setConnOverride(null);
      saveConnections(tree.id, null);
      setSelectedEdge(null);
    };
  }, [tree.id, onResetConnections]);

  useE_tv(() => {
    if (onExport) onExport.current = () => {
      const effEdges = connOverride != null ?
      connOverride.map(([s, t]) => [talents[s].name, talents[t].name]) :
      layout.edges.map(([s, t]) => [talents[s].name, talents[t].name]);
      const positions = {};
      talents.forEach((t, i) => {
        const p = overrides[t.name] || layout.positions[i];
        positions[t.name] = { x: +p.x.toFixed(4), y: +p.y.toFixed(4) };
      });
      return {
        tree: { id: tree.id, name: tree.fullName || tree.name, atlas: tree.atlas, group: tree.group, color: tree.color },
        columns: tree.columns,
        talents: talents.map((t) => ({
          tid: t.tid,
          name: t.name,
          isKey: t.isKey,
          specialty: t.specialty,
          action: t.action,
          cost: t.cost,
          description: t.description,
          flavor: t.flavor,
          tags: t.tags
        })),
        connections: effEdges.map(([s, t]) => ({ prereq: s, talent: t })),
        positions
      };
    };
  }, [tree, talents, layout, connOverride, overrides, onExport]);

  useE_tv(() => {
    const el = wrapRef.current;
    if (!el) return;
    // Initial measurement (RO may not fire on mount if size is already settled)
    const initial = el.getBoundingClientRect();
    setDims({ w: initial.width, h: initial.height });
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setDims({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useE_tv(() => {
    if (!editMode || !selectedEdge) return;
    function onKey(e) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeEdge(selectedEdge);
      } else if (e.key === 'Escape') {
        setSelectedEdge(null);setConnectSource(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editMode, selectedEdge]);

  // Effective edges: per-tree connection override OR layout's resolved-by-name edges.
  const effEdges = useM_tv(() => {
    if (connOverride != null) return connOverride.map((e) => [e[0], e[1]]);
    return layout.edges.slice();
  }, [connOverride, layout]);

  const effPrereqs = useM_tv(() => {
    const out = talents.map(() => []);
    for (const [s, t] of effEdges) out[t].push(s);
    return out;
  }, [effEdges, talents]);

  const chain = useM_tv(() => {
    if (selected == null) return { nodes: new Set(), edges: new Set() };
    const nodes = new Set([selected]);
    const edges = new Set();
    const up = [selected];
    const seenUp = new Set([selected]);
    while (up.length) {
      const n = up.pop();
      for (const p of effPrereqs[n]) {
        edges.add(`${p}->${n}`);
        if (!seenUp.has(p)) {seenUp.add(p);nodes.add(p);up.push(p);}
      }
    }
    const down = [selected];
    const seenDn = new Set([selected]);
    while (down.length) {
      const n = down.pop();
      for (const [s, t] of effEdges) if (s === n && !seenDn.has(t)) {
        seenDn.add(t);nodes.add(t);edges.add(`${n}->${t}`);down.push(t);
      }
    }
    return { nodes, edges };
  }, [selected, effEdges, effPrereqs]);

  // Adaptive canvas: width auto-fills; height scales with column count.
  // Tight padding so the user can drag nodes nearly to the wrap edge.
  const pad = { top: 50, bottom: 50, left: 12, right: 12 };
  const W = dims.w,H = dims.h;
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  function px(x) {return pad.left + x * innerW;}
  function py(y) {return pad.top + y * innerH;}

  const n = talents.length;
  const R = Math.max(20, Math.min(30, Math.sqrt(innerW * innerH / n) / 3.4));

  const treeKey = tree.id.replace(/[^a-z0-9]/gi, '-');
  const LEYLINE_ORDER = ['white', 'blue', 'black', 'red', 'green'];
  const LEYLINE_STOPS = {
    white: ['#f4eacc', '#c9a35c'],
    blue:  ['#d7e4ee', '#3d6c92'],
    black: ['#cfc7bd', '#2d2723'],
    red:   ['#f0d1bf', '#a33a22'],
    green: ['#cfd8b3', '#4a6a33'],
  };
  const HEROIC_STOPS = {
    agent:   ['#d8c4e5', '#6e3a82'],
    envoy:   ['#f1d4a8', '#c47026'],
    hunter:  ['#bedede', '#2f7575'],
    leader:  ['#f0c8d1', '#a8456b'],
    scholar: ['#c4c4dd', '#3a3a72'],
    warrior: ['#e5cda6', '#8a5a2b'],
  };
  const ALL_STOPS = { ...LEYLINE_STOPS, ...HEROIC_STOPS };
  const COLOR_INKS = {
    white: '#6b4f1a',
    blue:  '#1d3a55',
    black: '#1a1714',
    red:   '#5e1c10',
    green: '#2a3d1c',
    agent: '#3a1f4a', envoy: '#6b3812', hunter: '#163838',
    leader: '#5a1f36', scholar: '#1f1f44', warrior: '#4a2f12',
  };
  const TIE_PAIRS = [];
  for (let i = 0; i < LEYLINE_ORDER.length; i++) {
    for (let j = i + 1; j < LEYLINE_ORDER.length; j++) {
      TIE_PAIRS.push([LEYLINE_ORDER[i], LEYLINE_ORDER[j]]);
    }
  }
  function gradIdFor(color) { return `grad-${color}-${treeKey}`; }
  function tieGradIdFor(c1, c2) {
    const [a, b] = [c1, c2].sort((x, y) => LEYLINE_ORDER.indexOf(x) - LEYLINE_ORDER.indexOf(y));
    return `grad-tie-${a}-${b}-${treeKey}`;
  }
  // Pick the dominant leyline colors from a prereqs string.
  // Returns array: [] if none, [c] if clear winner, [c1, c2, ...] in canonical order on tie.
  function dominantLeylineColors(prereqText) {
    if (!prereqText) return [];
    const ranks = {};
    const re = /\b(White|Blue|Black|Red|Green)\s+(?:rank\s+)?(\d+)\s*\+?/gi;
    let m;
    while ((m = re.exec(prereqText)) !== null) {
      const c = m[1].toLowerCase();
      const r = parseInt(m[2], 10);
      ranks[c] = Math.max(ranks[c] || 0, r);
    }
    const entries = Object.entries(ranks);
    if (!entries.length) return [];
    const maxRank = Math.max(...entries.map(e => e[1]));
    return entries
      .filter(([, r]) => r === maxRank)
      .map(([c]) => c)
      .sort((a, b) => LEYLINE_ORDER.indexOf(a) - LEYLINE_ORDER.indexOf(b));
  }
  // Deity tree's two leyline colors (e.g. "White/Blue"), parsed once for fallback.
  const deityTreeColors = useM_tv(() => {
    if (tree.atlas !== 'deity' || !tree.colorsStr) return [];
    return tree.colorsStr.split(/[\/,]/).map(s => s.trim().toLowerCase()).filter(c => LEYLINE_ORDER.includes(c));
  }, [tree.atlas, tree.colorsStr]);

  // Per-node fill: deity nodes pick by dominant prereq color; ties use a split gradient.
  // Fallback for deity nodes with no prereq colors: use the tree's dual-color gradient.
  function nodeFillId(t) {
    if (tree.atlas !== 'deity') return gradIdFor(tree.color);
    const colors = dominantLeylineColors(t.prereqs);
    if (colors.length === 0) {
      if (deityTreeColors.length >= 2) return tieGradIdFor(deityTreeColors[0], deityTreeColors[1]);
      return gradIdFor(tree.color);
    }
    if (colors.length === 1) return gradIdFor(colors[0]);
    return tieGradIdFor(colors[0], colors[1]);
  }
  // Per-node icon color: matches the node's dominant color; ties use neutral ink.
  function nodeIconColor(t) {
    if (tree.atlas !== 'deity') return null;
    const colors = dominantLeylineColors(t.prereqs);
    if (colors.length === 0) return null; // tree.color already drives --accent-ink
    if (colors.length === 1) {
      return colors[0] === tree.color ? null : COLOR_INKS[colors[0]];
    }
    return 'var(--ink-1)';
  }

  function getPos(i) {
    const key = talents[i].name;
    if (overrides[key]) return overrides[key];
    return layout.positions[i];
  }

  function clientToNorm(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    const nx = (local.x - pad.left) / innerW;
    const ny = (local.y - pad.top) / innerH;
    // Allow dragging into the padding area: nodes can sit anywhere in the wrap,
    // not just within the central inner-rect. Clamp to keep node fully inside the SVG viewBox.
    const xMin = -pad.left / innerW + (R / innerW);
    const xMax = 1 + pad.right / innerW - (R / innerW);
    const yMin = -pad.top / innerH + (R / innerH);
    const yMax = 1 + pad.bottom / innerH - (R / innerH);
    return { x: Math.max(xMin, Math.min(xMax, nx)), y: Math.max(yMin, Math.min(yMax, ny)) };
  }

  const onPointerDown = useC_tv((e, i) => {
    if (!editMode) return;
    e.stopPropagation();
    setDragIdx(i);
    try {e.currentTarget.setPointerCapture(e.pointerId);} catch {}
  }, [editMode]);

  const onPointerMove = useC_tv((e) => {
    if (dragIdx == null) return;
    const n = clientToNorm(e.clientX, e.clientY);
    if (!n) return;
    setOverrides((prev) => ({
      ...prev,
      [talents[dragIdx].name]: { x: snap(n.x), y: snap(n.y) }
    }));
  }, [dragIdx, talents]);

  const onPointerUp = useC_tv(() => {
    if (dragIdx == null) return;
    setDragIdx(null);
    setOverrides((prev) => {saveOverrides(tree.id, prev);return prev;});
  }, [dragIdx, tree.id]);

  function currentEdges() {return effEdges.map((e) => [e[0], e[1]]);}

  function addEdge(src, tgt) {
    if (src === tgt) return;
    const edges = currentEdges();
    if (edges.some(([s, t]) => s === src && t === tgt)) return;
    const cycles = wouldCreateCycle(edges, src, tgt, talents.length);
    const next = [...edges, [src, tgt]];
    setConnOverride(next);
    saveConnections(tree.id, next);
    if (cycles) {
      setCycleWarn(`Warning: cycle created with ${talents[src].name} → ${talents[tgt].name}`);
      setTimeout(() => setCycleWarn(null), 4000);
    }
  }
  function removeEdge(edgeKey) {
    const [s, t] = edgeKey.split('->').map(Number);
    const edges = currentEdges().filter(([a, b]) => !(a === s && b === t));
    setConnOverride(edges);
    saveConnections(tree.id, edges);
    setSelectedEdge(null);
  }

  function handleNodeClick(i) {
    if (editMode) {
      setSelectedEdge(null);
      if (connectSource == null) {
        setConnectSource(i);
      } else if (connectSource === i) {
        setConnectSource(null);
      } else {
        addEdge(connectSource, i);
        setConnectSource(null);
      }
      return;
    }
    onSelect(i === selected ? null : i);
  }

  // Grid lines (edit mode)
  const gridLines = [];
  if (editMode) {
    const steps = Math.round(1 / SNAP);
    for (let i = 0; i <= steps; i++) {
      const t = i * SNAP;
      gridLines.push(['v', px(t)]);
      gridLines.push(['h', py(t)]);
    }
  }

  // Column header positions (centered above each column band, just below the Key zone)
  const colHeaders = [];
  if (tree.columns && tree.columns.length) {
    const C = tree.columns.length;
    for (let ci = 0; ci < C; ci++) {
      const col = tree.columns[ci];
      const x = px((ci + 0.5) / C);
      const y = py(0.13);
      colHeaders.push({ x, y, label: col.label || col.id });
    }
  }

  return (
    <div ref={wrapRef} className={`tree-svg-wrap ${editMode ? 'edit-mode' : ''}`} data-color={tree.color}>
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp} style={{ display: 'block' }}>
        <defs>
          <filter id="paper-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
            <feOffset dy="1" />
            <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0.45 0" />
            <feBlend in2="SourceGraphic" />
          </filter>
          {Object.entries(ALL_STOPS).map(([color, [c1, c2]]) => (
            <radialGradient key={color} id={gradIdFor(color)} cx="30%" cy="30%">
              <stop offset="0%" stopColor="var(--parch-0)" />
              <stop offset="60%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </radialGradient>
          ))}
          {TIE_PAIRS.map(([c1, c2]) => (
            <linearGradient key={`${c1}-${c2}`} id={tieGradIdFor(c1, c2)} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={LEYLINE_STOPS[c1][0]} />
              <stop offset="45%" stopColor={LEYLINE_STOPS[c1][1]} />
              <stop offset="55%" stopColor={LEYLINE_STOPS[c2][1]} />
              <stop offset="100%" stopColor={LEYLINE_STOPS[c2][0]} />
            </linearGradient>
          ))}
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink-3)" strokeWidth="1" opacity="0.4" />
          </pattern>
        </defs>

        {/* Grid */}
        {editMode && gridLines.map(([dir, v], i) =>
        dir === 'v' ?
        <line key={`gv${i}`} x1={v} x2={v} y1={pad.top} y2={H - pad.bottom} stroke="var(--parch-4)" strokeWidth="0.5" opacity="0.35" /> :
        <line key={`gh${i}`} x1={pad.left} x2={W - pad.right} y1={v} y2={v} stroke="var(--parch-4)" strokeWidth="0.5" opacity="0.35" />
        )}

        {/* Column dividers (faint vertical lines between specialty columns) */}
        {!editMode && tree.columns && tree.columns.length > 1 && tree.columns.slice(0, -1).map((_, ci) => {
          const x = px((ci + 1) / tree.columns.length);
          return (
            <line key={'cd' + ci} x1={x} x2={x} y1={py(0.16)} y2={py(0.98)}
            stroke="var(--parch-4)" strokeWidth="0.6" opacity="0.45" strokeDasharray="3 5" />);

        })}

        {/* Column headers */}
        {!editMode && colHeaders.map((h, ci) =>
        <g key={'ch' + ci}>
            <text x={h.x} y={h.y} textAnchor="middle"
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '17px',
            letterSpacing: '0.18em', fill: 'var(--accent-ink)', textTransform: 'uppercase' }}>
              {h.label}
            </text>
            <line x1={h.x - 30} x2={h.x + 30} y1={h.y + 8} y2={h.y + 8}
          stroke="var(--accent-2)" strokeWidth="0.6" opacity="0.7" />
          </g>
        )}

        {/* Edges */}
        {effEdges.map(([p, c], i) => {
          const pp = getPos(p),cp = getPos(c);
          const x1 = px(pp.x),y1 = py(pp.y);
          const x2 = px(cp.x),y2 = py(cp.y);
          const dx = x2 - x1,dy = y2 - y1;
          const vertical = Math.abs(dy) > Math.abs(dx);
          const c1x = vertical ? x1 : x1 + dx * 0.3;
          const c1y = vertical ? y1 + dy * 0.5 : y1;
          const c2x = vertical ? x2 : x2 - dx * 0.3;
          const c2y = vertical ? y2 - dy * 0.5 : y2;
          const path = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
          const key = `${p}->${c}`;
          const isChain = chain.edges.has(key);
          const isEdgeSel = selectedEdge === key;
          let stroke = isChain ? 'var(--accent-2)' : 'var(--ink-3)';
          if (isEdgeSel) stroke = '#c0392b';
          const w = isEdgeSel ? 3 : isChain ? 2.4 : 1.2;
          const opacity = selected != null && !isChain && !isEdgeSel ? 0.2 : 0.65;
          return (
            <g key={i}>
              {editMode &&
              <path d={path} fill="none" stroke="transparent" strokeWidth="14"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {e.stopPropagation();setSelectedEdge(isEdgeSel ? null : key);setConnectSource(null);}} />
              }
              <path d={path} fill="none" stroke={stroke} strokeWidth={w} opacity={opacity} strokeLinecap="round"
              style={{ pointerEvents: 'none' }} />
              <EdgeArrow x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} opacity={opacity} hw={Math.round(R * 3.3) / 2} hh={Math.round(R * 2.9) / 2} />
            </g>);

        })}

        {editMode && connectSource != null &&
        <ConnectPreview source={getPos(connectSource)} svgRef={svgRef} px={px} py={py} />
        }

        {/* Nodes */}
        {talents.map((t, i) => {
          const { x, y } = getPos(i);
          const cx = px(x),cy = py(y);
          const isSel = selected === i;
          const isChain = chain.nodes.has(i);

          const isLearned = !!(character && character.learnedTids && character.learnedTids.has(t.tid));
          const pres = prereqResults && prereqResults[t.tid];
          // Edge prereqs (in-tree) must also be satisfied:
          const edgesMet = effPrereqs[i].length === 0 || effPrereqs[i].some((p) => character && character.learnedTids.has(talents[p].tid));
          const stringMet = !pres || pres.ok;
          const canLearn = !isLearned && edgesMet && stringMet;

          const dim = selected != null && !isChain;
          const isDragging = dragIdx === i;
          const hasOverride = !!overrides[t.name];
          const isConnectSrc = connectSource === i;

          const ringStroke = isConnectSrc ? '#c0392b' :
          isLearned ? 'var(--accent-2)' :
          isSel ? 'var(--ink-1)' :
          buildMode && canLearn ? 'var(--rubric)' :
          'var(--accent-2)';
          const ringW = isConnectSrc || isSel ? 2.4 : isLearned ? 2.2 : 1.4;

          // New layout: NAME on top (parchment plate), action icon + cost cells share an equal-width strip at the BOTTOM (colored band).
          const NW = Math.round(R * 3.3);
          const NH = Math.round(R * 2.9);
          const RAD = Math.max(8, Math.round(R * 0.42));

          // Bottom strip geometry
          const stripH = Math.round(R * 1.15);
          const stripTop = NH / 2 - stripH;
          const divY = stripTop;

          // Name zone is everything above the strip
          const nameZoneTop = -NH / 2 + 4;
          const nameZoneBot = divY - 3;

          const nameFontPx = t.isKey ? Math.round(R * 0.48) : Math.round(R * 0.44);
          const nameLineH = Math.round(nameFontPx * 1.08);
          const TEXT_INSET_X = 6;
          const TEXT_W = NW - TEXT_INSET_X * 2;
          const nameCharW = nameFontPx * 0.52;
          const maxNameChars = Math.max(6, Math.floor(TEXT_W / nameCharW));

          const MAX_LINES = 3;
          const nameLines = (() => {
            const words = String(t.name || '').split(/\s+/);
            const out = [];
            let cur = '';
            for (const w of words) {
              const test = cur ? cur + ' ' + w : w;
              if (test.length <= maxNameChars) { cur = test; }
              else { if (cur) out.push(cur); cur = w; }
            }
            if (cur) out.push(cur);
            for (let i = 0; i < out.length; i++) {
              if (out[i].length > maxNameChars) out[i] = out[i].slice(0, maxNameChars - 1) + '…';
            }
            if (out.length > MAX_LINES) {
              const kept = out.slice(0, MAX_LINES);
              let last = kept[MAX_LINES - 1];
              if (last.length > maxNameChars - 1) last = last.slice(0, maxNameChars - 1);
              kept[MAX_LINES - 1] = last + '…';
              return kept;
            }
            return out;
          })();

          // Vertically center the name lines inside the top plate.
          const nameZoneH = nameZoneBot - nameZoneTop;
          const totalNameH = nameLines.length * nameLineH;
          const nameStartBaselineY = nameZoneTop + (nameZoneH - totalNameH) / 2 + nameFontPx * 0.85;

          // Cost pips: each becomes a bottom-strip cell sharing equal width with the action icon.
          const pips = parseCostPips(t.cost);
          const cellCount = 1 + pips.length;
          const stripPadX = 6;
          const stripInnerW = NW - stripPadX * 2;
          const cellW = stripInnerW / cellCount;
          const cellCY = stripTop + stripH / 2;
          const iconSize = Math.round(Math.min(stripH - 8, cellW - 6));

          // Pip badge geometry: pill, sized to fit its cell.
          const pipH = Math.round(stripH - 10);
          const pipFontPx = Math.max(10, Math.round(pipH * 0.65));

          const iconInk = t.isKey ? 'var(--rubric)' : (nodeIconColor(t) || 'var(--accent-ink)');

          return (
            <g key={i}
            className={`talent-node ${isLearned ? 'learned' : ''} ${editMode ? 'draggable' : ''} ${isDragging ? 'dragging' : ''} ${t.isKey ? 'key-node' : ''}`}
            transform={`translate(${cx},${cy})`}
            opacity={dim ? 0.45 : 1}
            style={{ cursor: editMode ? isDragging ? 'grabbing' : 'pointer' : 'pointer' }}
            onPointerDown={(e) => onPointerDown(e, i)}
            onClick={(e) => {e.stopPropagation();handleNodeClick(i);}}>

              {/* Key talent: decorative outer dashed frame */}
              {t.isKey &&
              <rect x={-NW / 2 - 6} y={-NH / 2 - 6} width={NW + 12} height={NH + 12} rx={RAD + 5} ry={RAD + 5}
              fill="none" stroke="var(--accent-2)" strokeWidth="0.8" opacity="0.55" strokeDasharray="2 4" />
              }

              {/* Card body — gradient fill + colored border */}
              <rect x={-NW / 2} y={-NH / 2} width={NW} height={NH} rx={RAD} ry={RAD}
              fill={`url(#${nodeFillId(t)})`}
              stroke={ringStroke} strokeWidth={ringW}
              className="node-ring"
              filter="url(#paper-shadow)" />

              {/* Inner parchment plate fills the TOP name area */}
              <rect x={-NW / 2 + 4} y={nameZoneTop - 2}
              width={NW - 8} height={(divY - 3) - (nameZoneTop - 2)}
              rx={Math.max(4, RAD - 4)} ry={Math.max(4, RAD - 4)}
              fill="var(--parch-1)" stroke="var(--accent-2)" strokeWidth="0.5" opacity="0.92" className="node-body" />

              {/* Horizontal divider between name and bottom strip */}
              <line x1={-NW / 2 + 8} x2={NW / 2 - 8} y1={divY} y2={divY}
              stroke="var(--accent-2)" strokeWidth="0.6" opacity="0.6" />

              {/* Locked hatch overlay (build mode) */}
              {!isLearned && buildMode && !canLearn &&
              <rect x={-NW / 2} y={-NH / 2} width={NW} height={NH} rx={RAD} ry={RAD} fill="url(#hatch)" opacity="0.55" />
              }

              {/* Edit-mode override dashed frame */}
              {hasOverride && editMode &&
              <rect x={-NW / 2 - 3} y={-NH / 2 - 3} width={NW + 6} height={NH + 6} rx={RAD + 2} ry={RAD + 2}
              fill="none" stroke="var(--accent-2)" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
              }

              {/* Connect-source pulse */}
              {isConnectSrc &&
              <rect x={-NW / 2 - 6} y={-NH / 2 - 6} width={NW + 12} height={NH + 12} rx={RAD + 4} ry={RAD + 4}
              fill="none" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85">
                  <animate attributeName="stroke-dashoffset" values="0;12" dur="0.8s" repeatCount="indefinite" />
                </rect>
              }

              {/* Name — fills top parchment plate */}
              <text x={0} y={nameStartBaselineY} textAnchor="middle"
              style={{ fontFamily: "'IM Fell English SC', serif",
                fontSize: nameFontPx + 'px',
                fontWeight: t.isKey ? 700 : 500,
                fill: 'var(--ink-1)', letterSpacing: '0.03em', pointerEvents: 'none' }}>
                {nameLines.map((ln, li) => (
                  <tspan key={li} x={0} dy={li === 0 ? 0 : nameLineH}>{ln}</tspan>
                ))}
              </text>

              {/* Bottom strip: action icon + cost cells share equal width */}
              <g>
                {/* Action icon cell (always present, leftmost) */}
                <g style={{ color: iconInk }}
                transform={`translate(${-NW / 2 + stripPadX + cellW * 0.5 - iconSize / 2},${cellCY - iconSize / 2})`}>
                  <TalentIcon actionType={t.action} size={iconSize} />
                </g>

                {/* Cell dividers between strip cells */}
                {pips.map((_, pi) => {
                  const dx = -NW / 2 + stripPadX + cellW * (pi + 1);
                  return (
                    <line key={'div' + pi}
                    x1={dx} x2={dx} y1={stripTop + 4} y2={stripTop + stripH - 4}
                    stroke="var(--accent-2)" strokeWidth="0.5" opacity="0.45" />
                  );
                })}

                {/* Cost pip cells */}
                {pips.map((p, pi) => {
                  const c = PIP_COLORS[p.kind] || PIP_COLORS.I;
                  const cellCx = -NW / 2 + stripPadX + cellW * (pi + 1) + cellW * 0.5;
                  // pip width sized to fit label inside the cell
                  const labelW = p.label.length * pipFontPx * 0.62 + 10;
                  const pw = Math.min(cellW - 6, Math.max(pipH, labelW));
                  return (
                    <g key={'pip' + pi} transform={`translate(${cellCx - pw / 2},${cellCY - pipH / 2})`}>
                      <rect x={0} y={0} width={pw} height={pipH} rx={pipH / 2} ry={pipH / 2}
                      fill={c.bg} stroke="var(--parch-0)" strokeWidth="0.8" />
                      <text x={pw / 2} y={pipH / 2 + pipFontPx * 0.35} textAnchor="middle"
                      style={{ fontFamily: 'JetBrains Mono, monospace',
                        fontSize: pipFontPx + 'px',
                        fontWeight: 700,
                        fill: c.fg,
                        letterSpacing: '0.02em',
                        pointerEvents: 'none' }}>
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Learned checkmark — top-right corner */}
              {isLearned &&
              <g transform={`translate(${NW / 2 - 4},${-NH / 2 + 4})`}>
                  <circle r="7" fill="var(--accent-2)" stroke="var(--parch-0)" strokeWidth="1.2" />
                  <path d="M -4 0 L -1 3 L 4 -3" stroke="var(--parch-0)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              }
            </g>);

        })}
      </svg>
      {editMode &&
      <div className="edit-hint">
          {connectSource != null ?
        `Click a second node to wire ${talents[connectSource].name} → (prereq of…). Esc cancels.` :
        selectedEdge ?
        'Edge selected. Delete key to remove. Esc to deselect.' :
        'Click a node to start a connection · Drag to reposition · Click a line to select it'}
        </div>
      }
      {editMode && selectedEdge &&
      <button className="edge-delete-btn" onClick={() => removeEdge(selectedEdge)}>✕ Delete Edge</button>
      }
      {cycleWarn && <div className="cycle-warn">{cycleWarn}</div>}
    </div>);

}

function EdgeArrow({ x1, y1, x2, y2, stroke, opacity, hw, hh }) {
  const dx = x2 - x1,dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L,uy = dy / L;
  // Distance from target center to its rect boundary along (-ux,-uy)
  const tx = Math.abs(ux) > 1e-6 ? hw / Math.abs(ux) : Infinity;
  const ty = Math.abs(uy) > 1e-6 ? hh / Math.abs(uy) : Infinity;
  const t = Math.min(tx, ty);
  const tipX = x2 - ux * t;
  const tipY = y2 - uy * t;
  const size = 7;
  const baseX = tipX - ux * size;
  const baseY = tipY - uy * size;
  const pX = -uy,pY = ux;
  const l = { x: baseX + pX * size * 0.5, y: baseY + pY * size * 0.5 };
  const ri = { x: baseX - pX * size * 0.5, y: baseY - pY * size * 0.5 };
  return (
    <path d={`M ${tipX} ${tipY} L ${l.x} ${l.y} L ${ri.x} ${ri.y} Z`}
    fill={stroke} opacity={opacity} style={{ pointerEvents: 'none' }} />);

}

function ConnectPreview({ source, svgRef, px, py }) {
  const [mouse, setMouse] = useS_tv(null);
  useE_tv(() => {
    function onMove(e) {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const local = pt.matrixTransform(ctm.inverse());
      setMouse({ x: local.x, y: local.y });
    }
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [svgRef]);
  if (!mouse) return null;
  const x1 = px(source.x),y1 = py(source.y);
  return (
    <line x1={x1} y1={y1} x2={mouse.x} y2={mouse.y}
    stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8"
    style={{ pointerEvents: 'none' }} />);

}

Object.assign(window, { TreeView, TalentIcon });
