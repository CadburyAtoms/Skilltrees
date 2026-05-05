// Column-aware layered layout for collapsed trees (Key + N specialty columns).
// Each tree has `columns: [{id, label, talentIdxs[]}]` plus an optional Key talent.
// Layout strategy:
//   - Key talent (if present) sits at top center (y ≈ 0.05).
//   - Each column gets a horizontal slot. Within a column, talents are layered by depth
//     (computed via prereq edges among that column's nodes).
//   - x within a column is the column's slot center, with small barycenter ordering when
//     multiple talents share a depth row.
//
// Backwards-compatible: also handles trees with no `columns` (treats all talents as one column).

function splitPrereqs(s) {
  if (!s || s === '—' || s === '-') return [];
  return s.split(/,|;|\sand\s|\sor\s/).map(x => x.trim()).filter(Boolean);
}

function layoutTree(talents, treeMeta) {
  const N = talents.length;
  const nameIdx = {};
  talents.forEach((t, i) => { nameIdx[t.name.toLowerCase()] = i; });

  // Resolve prereqs by name -> idx.
  // Prefer the baked-in `connections` array (list of prereq names) when present;
  // fall back to parsing the legacy prereq string.
  const prereqs = talents.map(t => {
    if (Array.isArray(t.connections) && t.connections.length) {
      return t.connections
        .map(n => nameIdx[(n || '').toLowerCase()])
        .filter(x => x !== undefined);
    }
    const raw = splitPrereqs(t.prereqs);
    return raw
      .map(p => nameIdx[p.toLowerCase()])
      .filter(x => x !== undefined);
  });

  // Determine columns
  let columns;
  if (treeMeta && treeMeta.columns && treeMeta.columns.length) {
    columns = treeMeta.columns.map(c => ({ ...c, talentIdxs: c.talentIdxs.slice() }));
  } else {
    columns = [{ id: 'all', label: '', talentIdxs: talents.map((_, i) => i).filter(i => !talents[i].isKey) }];
  }

  // Find Key talent index (isKey or columnId 'key')
  const keyIdx = talents.findIndex(t => t.isKey || t.columnId === 'key');

  // Per-column depth: ignore inter-column prereqs for visual depth (they cross columns naturally)
  const depth = new Array(N).fill(0);
  for (const col of columns) {
    const idxs = col.talentIdxs;
    const inCol = new Set(idxs);
    function d(i, stack) {
      if (depth[i] !== 0) return depth[i];
      if (stack.has(i)) return 0;
      stack.add(i);
      const ps = prereqs[i].filter(p => inCol.has(p));
      const dd = ps.length ? 1 + Math.max(...ps.map(p => d(p, stack))) : 0;
      depth[i] = dd;
      stack.delete(i);
      return dd;
    }
    for (const i of idxs) d(i, new Set());
  }
  const maxColDepth = Math.max(0, ...depth);

  // Assign positions
  const positions = new Array(N);

  // Key at top
  if (keyIdx >= 0) {
    positions[keyIdx] = { x: 0.5, y: 0.04 };
  }

  // For each column, lay out vertically. Columns are evenly spaced horizontally.
  const C = columns.length;
  // Vertical band starts below key (or near top if no key)
  const yTop = keyIdx >= 0 ? 0.18 : 0.06;
  const yBot = 0.96;

  columns.forEach((col, ci) => {
    const idxs = col.talentIdxs;
    if (!idxs.length) return;
    // Group by depth
    const byDepth = {};
    let localMax = 0;
    for (const i of idxs) {
      const dd = depth[i];
      (byDepth[dd] = byDepth[dd] || []).push(i);
      if (dd > localMax) localMax = dd;
    }
    // Column x slot — each column gets a horizontal band of width 1/C centered at (ci + 0.5)/C
    const colCenter = (ci + 0.5) / C;
    const colWidth = 1 / C;
    // Within a column we may need to spread sibling-row nodes horizontally a bit
    for (let dd = 0; dd <= localMax; dd++) {
      const row = byDepth[dd] || [];
      // Order row by name for stability
      row.sort((a, b) => talents[a].name.localeCompare(talents[b].name));
      const n = row.length;
      const yFrac = localMax === 0 ? 0.5 : dd / localMax;
      const y = yTop + yFrac * (yBot - yTop);
      row.forEach((i, k) => {
        let x;
        if (n === 1) x = colCenter;
        else {
          // spread within ~92% of column width
          const spread = colWidth * 0.92;
          x = colCenter - spread / 2 + (k * spread) / (n - 1);
        }
        positions[i] = { x, y };
      });
    }
  });

  // Any orphan talents (not in any column and not the key) — push to far right
  let orphanIdx = 0;
  for (let i = 0; i < N; i++) {
    if (!positions[i]) {
      positions[i] = { x: 0.05 + (orphanIdx * 0.06), y: 0.02 };
      orphanIdx++;
    }
  }

  // Apply baked-in per-talent layout overrides last so they always win.
  for (let i = 0; i < N; i++) {
    const t = talents[i];
    if (t.layout && typeof t.layout.x === 'number' && typeof t.layout.y === 'number') {
      positions[i] = { x: t.layout.x, y: t.layout.y };
    }
  }

  // children lookup
  const children = talents.map(() => []);
  prereqs.forEach((ps, i) => ps.forEach(p => children[p].push(i)));

  // Edges: every prereq is an edge p -> i
  const edges = prereqs.flatMap((ps, i) => ps.map(p => [p, i]));

  return {
    positions,
    depth,
    maxDepth: Math.max(maxColDepth, 1),
    prereqs,
    children,
    edges,
    columns,
    keyIdx,
  };
}

window.Layout = { layoutTree, splitPrereqs };
