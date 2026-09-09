// Derive a per-tree dossier: canonical depth model + full talent text, one file per tree.
const fs = require('fs'), path = require('path');
const OUT = process.argv[2];
const D = 'data';
const load = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const LEY = load('leyline.json'), HER = load('cosmere.json'), DOM = load('domain.json');
// The authored overlay is `{_meta, talents: {"<Talent Name>": {...}}}` — a NAME-KEYED OBJECT, not
// an array, and each entry's `description` is `{value, chat, short}` HTML, not a string. The first
// version of this loader did `Object.values(j)` and looked for `.name`, so it matched nothing and
// silently loaded ZERO overrides for all 365 talents: every dossier reported `events=false
// effects=false` (247 talents have events, 32 have effects) and dropped the 54 machine-readable
// damage formulas. Fixed 2026-09-09.
// KEYED BY FILE + NAME, never by name alone: 12 talent names live in more than one tree (`Hardy`
// is in seven, `Mighty` in six, `Collected` in five — see shared-talents.js), so a flat name map
// silently hands every copy whichever file was read last. That made deity/Chaos's `Shatter Focus`
// report leyline/Red's text, and would have mis-assigned roll formulas and wiring counts across
// all 41 duplicated slots.
const AUTH = {};
let authCount = 0;
for (const f of fs.readdirSync(path.join(D, 'authored'))) {
  const j = load(path.join('authored', f));
  const talents = j && j.talents ? j.talents : (Array.isArray(j) ? j : {});
  const entries = Array.isArray(talents)
    ? talents.filter(a => a && a.name).map(a => [a.name, a])
    : Object.entries(talents);
  // `deity-chaos.json` -> `deity|chaos`; matches atlas|tree lowercased on the talent rows.
  const key = f.replace(/\.json$/i, '').toLowerCase().replace('-', '|');
  for (const [name, a] of entries) if (a) { AUTH[key + '|' + String(name).trim().toLowerCase()] = a; authCount++; }
}
if (authCount < 300) {
  throw new Error(`authored overlay loaded only ${authCount} entries (expected 365) — the shape changed, fix this loader`);
}
const authOf = t => AUTH[t.atlas.toLowerCase() + '|' + t.tree.toLowerCase() + '|' + t.name.trim().toLowerCase()] || {};
// Authored description HTML -> plain body text, minus the Activation:/Cost: header paragraphs the
// build injects (they duplicate the `action`/`cost` columns) but KEEPING the italic flavour line.
const htmlText = h => String(h || '').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&mdash;/g, '—')
  .replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const authoredBody = a => String(a && a.description && a.description.value || '')
  .split(/<\/p>/).map(htmlText).filter(Boolean)
  .filter(p => !/^Activation:/i.test(p) && !/^Cost:/i.test(p))
  .join(' ');
const sizeOf = x => (x == null ? 0 : Array.isArray(x) ? x.length : (typeof x === 'object' ? Object.keys(x).length : 0));
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

const norm = s => String(s).replace(/\s+/g, ' ').replace(/[‘’]/g, "'").trim().toLowerCase();
const rows = T.map(t => {
  const a = authOf(t);
  const body = authoredBody(a);
  const gen = String(t.description || '');
  // Only surface the authored text when it actually says something different — the overlay
  // normally restates the generator prose with the flavour line prepended, and 353 of 365 match.
  const diverges = !!body && !norm(body).includes(norm(gen)) && !norm(gen).includes(norm(body));
  const dmg = a.damage && a.damage.formula ? a.damage : null;
  return {
    atlas: t.atlas, tree: t.tree, specialty: t.specialty, name: t.name,
    action: t.action, cost: t.cost, prerequisites: t.prerequisites,
    connections: t.connections || [],
    depth: depth.get(t), earliestLevel: earliestLevel(t),
    rankGate: meta.get(t).ranks.map(r => r.color + ' ' + r.rank + '+').join('; ') || '',
    tags: t.tags || '',
    description: gen,
    flavor: t.flavor || '',
    authoredDescription: diverges ? body : '',
    authoredBody: body,
    hasEvents: sizeOf(a.events) > 0, eventCount: sizeOf(a.events),
    hasEffects: sizeOf(a.effects) > 0, effectCount: sizeOf(a.effects),
    activationType: a.activation && a.activation.type || '',
    activationCost: a.activation && a.activation.cost || null,
    consumes: (a.activation && a.activation.consume) || [],
    skill: a.activation && a.activation.skill || '',
    // The Foundry-rollable damage/heal formula. Independent of any regex over prose: this is what
    // the table actually rolls. `type: "heal"` means it is a HEAL formula, not damage — Scholar's
    // three and Green's two are heals, which is why a naive count of `damage.formula` says Scholar
    // deals damage when it deals none.
    damage: dmg, damageType: dmg ? dmg.type : '', damageFormula: dmg ? dmg.formula : '',
    isDamageFormula: !!dmg && dmg.type !== 'heal', isHealFormula: !!dmg && dmg.type === 'heal',
  };
});
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'all-talents.json'), JSON.stringify(rows, null, 1));
const trees = [...new Set(rows.map(r => r.atlas + '|' + r.tree))];
for (const k of trees) {
  const [atlas, tree] = k.split('|');
  const sub = rows.filter(r => r.atlas === atlas && r.tree === tree)
    .sort((a, b) => a.depth - b.depth || a.specialty.localeCompare(b.specialty) || a.name.localeCompare(b.name));
  const nDmg = sub.filter(r => r.isDamageFormula).length, nHeal = sub.filter(r => r.isHealFormula).length;
  let md = `# ${atlas.toUpperCase()} — ${tree}\n\n${sub.length} talents. depth = how many talents in this tree you must own first; L = earliest character level reachable (1 talent/level, rank 3+ needs L6).\n\n`;
  md += `**Machine-readable roll formulas in this tree: ${nDmg} damage, ${nHeal} heal.** These come from the\n`;
  md += `authored Foundry overlay (\`data/authored/\`) and are what the table actually rolls — an\n`;
  md += `evidence stream independent of the prose. A talent can still deal damage with no formula\n`;
  md += `(fixed amounts, event-driven damage), so treat this as a floor, not a ceiling. \`type: heal\`\n`;
  md += `is a HEAL formula and is NOT damage.\n\n`;
  for (const r of sub) {
    md += `## ${r.name}\n`;
    md += `- specialty: ${r.specialty} | action: ${r.action} | cost: ${r.cost} | depth: ${r.depth} | earliest L${r.earliestLevel}\n`;
    md += `- prereq: ${r.prerequisites || '—'}${r.connections.length ? ` | connections: ${r.connections.join(', ')}` : ''}\n`;
    md += `- tags: ${r.tags || '—'}\n`;
    md += `- TEXT: ${r.description}\n`;
    if (r.authoredDescription) md += `- ⚠️ AUTHORED OVERRIDE DIVERGES (this text WINS in Foundry): ${r.authoredDescription}\n`;
    if (r.damage) md += `- ROLL FORMULA (${r.isHealFormula ? 'HEAL, not damage' : 'damage'}): \`${r.damageFormula}\` type=${r.damageType}\n`;
    md += `- wiring: events=${r.eventCount} effects=${r.effectCount}`;
    if (r.activationType) md += ` activation=${r.activationType}`;
    if (r.skill) md += ` skill=${r.skill}`;
    if (r.consumes && r.consumes.length) md += ` consumes=${r.consumes.map(c => (c.value && c.value.min != null ? c.value.min + ' ' : '') + (c.resource || c.type)).join(', ')}`;
    md += `\n`;
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

// ---- per-tree INTENT files -------------------------------------------------
// The review workflow reads INTENT-<atlas>-<Tree>.md; without this block it read nothing.
const strip = h => String(h || '')
  .replace(/<h3>/g, '\n\n### ').replace(/<\/h3>/g, '\n')
  .replace(/<\/p>/g, '\n\n').replace(/<p>/g, '')
  .replace(/<strong>|<\/strong>/g, '**').replace(/<em>|<\/em>/g, '_')
  .replace(/<li>/g, '- ').replace(/<\/li>/g, '\n').replace(/<\/?ul>/g, '\n')
  .replace(/<[^>]+>/g, '').replace(/&mdash;/g, '—').replace(/&amp;/g, '&')
  .replace(/\n{3,}/g, '\n\n').trim();
const RES = load('deity-resources.json');
const COLORS = {}, DEITY = {};
for (const t of DOM) { COLORS[t.domain] = t.colors; DEITY[t.domain] = t.deity; }
for (const [atlas, obj] of Object.entries(pd)) {
  for (const [key, html] of Object.entries(obj)) {
    // path-descriptions keys are lowercase for leyline, TitleCase elsewhere
    const tree = atlas === 'leyline' ? key[0].toUpperCase() + key.slice(1) : key;
    let md = `# STATED INTENT — ${atlas} / ${tree}\n\n`;
    md += `Source: data/path-descriptions.json. This is what the DESIGNER SAYS this path is.\n`;
    md += `It is a claim to be tested against the talents, not evidence about them.\n\n`;
    if (atlas === 'deity') {
      md += `Deity: ${DEITY[tree] || '?'} | gate colours: ${COLORS[tree] || '?'} (both at rank 2+)\n`;
      md += `Tree size: 9 talents (leyline and heroic trees have 25).\n\n`;
    }
    md += strip(html) + '\n';
    const mine = Object.entries(RES).filter(([, v]) => v.tree === tree);
    if (mine.length) {
      md += `\n### Homebrew resources this path owns\n\n`;
      for (const [n, v] of mine) {
        md += `**${n}** — source: ${v.source}; cap: ${v.cap}; duration: ${v.duration}\n`;
        md += `${v.summary}\n`;
        md += `Spent by: ${(v.spent_by || []).join(', ')}\n\n`;
      }
    }
    fs.writeFileSync(path.join(OUT, `INTENT-${atlas}-${tree}.md`), md);
  }
}
console.log('intent files:', fs.readdirSync(OUT).filter(f => f.startsWith('INTENT-')).length);

// The shared rules frame (advantage is binary, Draw Mana restores Tier, 1 Reaction/round, …).
// Without it every agent invents its own power baseline.
fs.copyFileSync(path.join(__dirname, 'SYSTEM-PRIMER.md'), path.join(OUT, 'SYSTEM-PRIMER.md'));

// ---- the SECOND intent source: the two design standards, verbatim ---------------------------
// path-descriptions.json is the in-world prose a player reads. The revision guides are the
// engineering-adjacent design standards the trees were WRITTEN against, and they make far more
// falsifiable claims (action-type percentages, per-colour key mechanics, cost curves, the deity
// colour-split rule). Where a guide and a path description disagree, that is itself a finding.
const SK = path.join('.claude', 'skills');
const slice = (file, from, to) => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  return lines.slice(from - 1, to).join('\n');
};
const LEY_GUIDE = path.join(SK, 'leyline-revision-guide', 'SKILL.md');
const DEI_GUIDE = path.join(SK, 'deity-revision-guide', 'SKILL.md');
const headOf = (file, heading) => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const i = lines.findIndex(l => l.startsWith(heading));
  if (i < 0) return -1;
  return i + 1;
};
const endOf = (file, startLine, nextPrefix) => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let i = startLine; i < lines.length; i++) if (lines[i].startsWith(nextPrefix)) return i;
  return lines.length;
};
let claims = `# Design-guide claims — the SECOND intent source, verbatim

The INTENT-*.md files carry \`data/path-descriptions.json\` — the in-world prose a player reads.
This file carries the two DESIGN STANDARDS the trees were written against. They make different,
more falsifiable claims (action-type percentages, per-colour key mechanics, cost curves, the deity
colour-split rule), and where a guide and a path description disagree that is itself a finding.
Both are claims ABOUT the talents, not evidence about them — test every line against talent text.

Sources: \`.claude/skills/leyline-revision-guide/SKILL.md\`,
\`.claude/skills/deity-revision-guide/SKILL.md\`. Extracted by derive-dossiers.js.

---

`;
try {
  const l2 = headOf(LEY_GUIDE, '## PART 2:');
  claims += '# LEYLINE GUIDE — benchmarks, revision principles, colour identities\n\n'
    + slice(LEY_GUIDE, l2, endOf(LEY_GUIDE, l2, '## PART 5:')) + '\n\n---\n\n';
  const d1 = headOf(DEI_GUIDE, '## PART 1:');
  claims += '# DEITY GUIDE — structure, benchmarks, principles, the ten identities\n\n'
    + slice(DEI_GUIDE, d1, endOf(DEI_GUIDE, d1, '## PART 5:')) + '\n\n';
  const d8 = headOf(DEI_GUIDE, '## PART 8:');
  claims += slice(DEI_GUIDE, d8, endOf(DEI_GUIDE, d8, '## PART 9:')) + '\n';
} catch (e) {
  claims += `\n> EXTRACTION FAILED: ${e.message}. Read the guides directly.\n`;
}
fs.writeFileSync(path.join(OUT, 'DESIGN-GUIDE-CLAIMS.md'), claims);
console.log('primer copied, design-guide claims extracted (' + claims.split('\n').length + ' lines).');
