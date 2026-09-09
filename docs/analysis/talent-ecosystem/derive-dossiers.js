// Derive a per-tree dossier: canonical depth model + full talent text, one file per tree.
const fs = require('fs'), path = require('path');
const OUT = process.argv[2];
const D = 'data';
const load = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const LEY = load('leyline.json'), HER = load('cosmere.json'), DOM = load('domain.json');
const AUTH = {};
for (const f of fs.readdirSync(path.join(D, 'authored'))) {
  const j = load(path.join('authored', f));
  const arr = Array.isArray(j) ? j : Object.values(j);
  for (const a of arr) if (a && a.name) AUTH[a.name.trim().toLowerCase()] = a;
}
const T = [];
for (const t of LEY) T.push({ ...t, atlas: 'leyline', tree: t.path });
for (const t of HER) T.push({ ...t, atlas: 'heroic', tree: t.path });
for (const t of DOM) T.push({ ...t, atlas: 'deity', tree: t.domain });

const BY_TREE = {};
for (const t of T) (BY_TREE[t.atlas + '|' + t.tree] ||= {})[t.name.trim().toLowerCase()] = t;

// requirement groups, mirroring validate-build.py
const RANK_RE = /^(white|blue|black|red|green)\s+(\d)\+$/i;
function groups(t) {
  const tt = BY_TREE[t.atlas + '|' + t.tree];
  const g = [];
  const conn = (t.connections || []).map(c => c.trim().toLowerCase()).filter(c => tt[c]);
  if (conn.length) g.push(conn);
  const ranks = [];
  const prose = String(t.prerequisites || '').trim();
  if (prose && prose !== '—') {
    for (const part of prose.split(/;|,/).map(s => s.trim()).filter(Boolean)) {
      const m = part.match(RANK_RE);
      if (m) { ranks.push({ color: m[1], rank: +m[2] }); continue; }
      const ors = part.split(/\bor\b/i).map(s => s.trim().toLowerCase()).filter(Boolean);
      const resolved = ors.filter(o => tt[o]);
      if (resolved.length) g.push(resolved);
    }
  }
  return { talentGroups: g, ranks };
}
// min graph depth: 0 for no talent-groups; else 1 + min over each group's min member depth (AND across groups -> max)
const meta = new Map();
for (const t of T) meta.set(t, groups(t));
const depth = new Map();
function calcDepth(t, seen = new Set()) {
  if (depth.has(t)) return depth.get(t);
  const key = t.atlas + '|' + t.tree + '|' + t.name;
  if (seen.has(key)) return 99; // cycle guard
  seen.add(key);
  const g = meta.get(t).talentGroups;
  if (!g.length) { depth.set(t, 0); return 0; }
  const tt = BY_TREE[t.atlas + '|' + t.tree];
  let d = 0;
  for (const grp of g) {
    let best = 99;
    for (const m of grp) best = Math.min(best, calcDepth(tt[m], new Set(seen)));
    d = Math.max(d, best + 1);
  }
  depth.set(t, d); return d;
}
for (const t of T) calcDepth(t);

// earliest level: rank cap 2 up to L5, 3 from L6. Need `rank` in a colour => level>= (rank<=2?1:6).
// plus depth: you need `depth` prior talents in this tree, 1 talent/level from L1.
function earliestLevel(t) {
  const { ranks } = meta.get(t);
  let lv = 1 + depth.get(t);              // own depth-many prereq talents first
  for (const r of ranks) if (r.rank >= 3) lv = Math.max(lv, 6);
  return lv;
}

const rows = T.map(t => {
  const a = AUTH[t.name.trim().toLowerCase()] || {};
  return {
    atlas: t.atlas, tree: t.tree, specialty: t.specialty, name: t.name,
    action: t.action, cost: t.cost, prerequisites: t.prerequisites,
    connections: t.connections || [],
    depth: depth.get(t), earliestLevel: earliestLevel(t),
    rankGate: meta.get(t).ranks.map(r => r.color + ' ' + r.rank + '+').join('; ') || '',
    tags: t.tags || '',
    description: t.description || '',
    flavor: t.flavor || '',
    authoredDescription: a.description && a.description !== t.description ? a.description : '',
    hasEvents: !!(a.events && a.events.length), hasEffects: !!(a.effects && a.effects.length),
    activation: a.activation || '', damage: a.damage || null,
  };
});
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'all-talents.json'), JSON.stringify(rows, null, 1));
const trees = [...new Set(rows.map(r => r.atlas + '|' + r.tree))];
for (const k of trees) {
  const [atlas, tree] = k.split('|');
  const sub = rows.filter(r => r.atlas === atlas && r.tree === tree)
    .sort((a, b) => a.depth - b.depth || a.specialty.localeCompare(b.specialty) || a.name.localeCompare(b.name));
  let md = `# ${atlas.toUpperCase()} — ${tree}\n\n${sub.length} talents. depth = how many talents in this tree you must own first; L = earliest character level reachable (1 talent/level, rank 3+ needs L6).\n\n`;
  for (const r of sub) {
    md += `## ${r.name}\n`;
    md += `- specialty: ${r.specialty} | action: ${r.action} | cost: ${r.cost} | depth: ${r.depth} | earliest L${r.earliestLevel}\n`;
    md += `- prereq: ${r.prerequisites || '—'}${r.connections.length ? ` | connections: ${r.connections.join(', ')}` : ''}\n`;
    md += `- tags: ${r.tags || '—'}\n`;
    md += `- TEXT: ${r.description}\n`;
    if (r.authoredDescription) md += `- AUTHORED-OVERRIDE TEXT: ${r.authoredDescription}\n`;
    if (r.damage) md += `- damage field: ${JSON.stringify(r.damage)}\n`;
    md += `- wiring: events=${r.hasEvents} effects=${r.hasEffects}${r.activation ? ' activation=' + r.activation : ''}\n`;
    if (r.flavor) md += `- flavor: ${r.flavor}\n`;
    md += `\n`;
  }
  fs.writeFileSync(path.join(OUT, `${atlas}-${tree}.md`), md);
}
// path-description intent
const pd = load('path-descriptions.json');
fs.writeFileSync(path.join(OUT, 'intent.json'), JSON.stringify(pd, null, 1));
console.log('trees:', trees.length, 'rows:', rows.length);
const byTree = {};
for (const r of rows) { const k = r.atlas + '|' + r.tree; (byTree[k] ||= []).push(r); }
for (const [k, v] of Object.entries(byTree)) {
  const ds = v.map(r => r.depth);
  console.log(k.padEnd(20), 'n=' + v.length, 'depth 0-' + Math.max(...ds), 'maxL=' + Math.max(...v.map(r => r.earliestLevel)));
}
