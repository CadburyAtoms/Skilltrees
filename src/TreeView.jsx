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

  // Passive — infinity / lemniscate
  if (isPassive) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path
          d="M7 12 C7 9.5, 9 8, 10.5 9.5 L13.5 14.5 C15 16, 17 14.5, 17 12 C17 9.5, 15 8, 13.5 9.5 L10.5 14.5 C9 16, 7 14.5, 7 12 Z"
          fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
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
  const R = Math.max(22, Math.min(34, Math.sqrt(innerW * innerH / n) / 3.4));

  const treeKey = tree.id.replace(/[^a-z0-9]/gi, '-');
  const LEYLINE_ORDER = ['white', 'blue', 'black', 'red', 'green'];
  const LEYLINE_STOPS = {
    white: ['#f4eacc', '#c9a35c'],
    blue:  ['#d7e4ee', '#3d6c92'],
    black: ['#cfc7bd', '#2d2723'],
    red:   ['#f0d1bf', '#a33a22'],
    green: ['#cfd8b3', '#4a6a33'],
  };
  const COLOR_INKS = {
    white: '#6b4f1a',
    blue:  '#1d3a55',
    black: '#1a1714',
    red:   '#5e1c10',
    green: '#2a3d1c',
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
  // Per-node fill: deity nodes pick by dominant prereq color; ties use a split gradient.
  function nodeFillId(t) {
    if (tree.atlas !== 'deity') return gradIdFor(tree.color);
    const colors = dominantLeylineColors(t.prereqs);
    if (colors.length === 0) return gradIdFor(tree.color);
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
          {Object.entries(LEYLINE_STOPS).map(([color, [c1, c2]]) => (
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
              <EdgeArrow x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} opacity={opacity} r={R} />
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
          const edgesMet = effPrereqs[i].every((p) => character && character.learnedTids.has(talents[p].tid));
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
          const ringW = isConnectSrc || isSel ? 3 : isLearned ? 2.5 : 1.6;

          return (
            <g key={i}
            className={`talent-node ${isLearned ? 'learned' : ''} ${editMode ? 'draggable' : ''} ${isDragging ? 'dragging' : ''} ${t.isKey ? 'key-node' : ''}`}
            transform={`translate(${cx},${cy})`}
            opacity={dim ? 0.45 : 1}
            style={{ cursor: editMode ? isDragging ? 'grabbing' : 'pointer' : 'pointer' }}
            onPointerDown={(e) => onPointerDown(e, i)}
            onClick={(e) => {e.stopPropagation();handleNodeClick(i);}}>

              {t.isKey &&
              <circle r={R + 8} fill="none" stroke="var(--accent-2)" strokeWidth="0.8" opacity="0.55" strokeDasharray="2 4" />
              }
              <circle r={R} fill={`url(#${nodeFillId(t)})`}
              stroke={ringStroke} strokeWidth={ringW}
              className="node-ring"
              filter="url(#paper-shadow)" />
              <circle r={R - 4} fill="var(--parch-1)" stroke="var(--accent-2)" strokeWidth="0.6" opacity="0.95" className="node-body" />
              {!isLearned && buildMode && !canLearn &&
              <circle r={R - 4} fill="url(#hatch)" opacity="0.6" />
              }
              {hasOverride && editMode &&
              <circle r={R + 5} fill="none" stroke="var(--accent-2)" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
              }
              {isConnectSrc &&
              <circle r={R + 9} fill="none" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85">
                  <animate attributeName="r" values={`${R + 6};${R + 11};${R + 6}`} dur="1.2s" repeatCount="indefinite" />
                </circle>
              }

              {/* Action-cost icon centered in node */}
              <g style={{ color: t.isKey ? 'var(--rubric)' : (nodeIconColor(t) || 'var(--accent-ink)') }} transform={`translate(${-Math.round(R * 0.55)},${-Math.round(R * 0.55)})`}>
                <TalentIcon actionType={t.action} size={Math.round(R * 1.1)} />
              </g>

              {isLearned &&
              <g transform={`translate(${R - 3},${-(R - 3)})`}>
                  <circle r="7" fill="var(--accent-2)" stroke="var(--parch-0)" strokeWidth="1.2" />
                  <path d="M -4 0 L -1 3 L 4 -3" stroke="var(--parch-0)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              }

              <text y={R + 18} textAnchor="middle"
              style={{ fontFamily: "'IM Fell English SC', serif",
                fontSize: t.isKey ? '18px' : '16px',
                fontWeight: t.isKey ? 700 : 500,
                fill: 'var(--ink-1)', letterSpacing: '0.04em', pointerEvents: 'none' }}>
                {t.name}
              </text>
              {t.cost && t.cost !== '—' && t.cost !== '-' &&
              <text y={R + 34} textAnchor="middle"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fill: 'var(--accent-ink)', opacity: 0.75, pointerEvents: 'none' }}>
                  {t.cost.length > 30 ? t.cost.slice(0, 28) + '…' : t.cost}
                </text>
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

function EdgeArrow({ x1, y1, x2, y2, stroke, opacity, r }) {
  const dx = x2 - x1,dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L,uy = dy / L;
  const tipX = x2 - ux * r;
  const tipY = y2 - uy * r;
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