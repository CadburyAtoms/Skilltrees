// How much of each tree is NOT its own? A talent whose name (or whose exact text) also appears in
// another tree is shared filler, not tree identity. This matters for every overlap measurement in
// the review: two trees that both contain `Collected` are not similar because of what they ARE.
const fs = require('fs');
const OUT = process.argv[2];
const rows = JSON.parse(fs.readFileSync(OUT + '/all-talents.json', 'utf8'));
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const text = r => norm(r.authoredDescription || r.description);

const byName = {}, byText = {};
for (const r of rows) {
  (byName[r.name] ||= []).push(r);
  const t = text(r);
  if (t.length >= 30) (byText[t] ||= []).push(r);
}

const sharedName = new Set(), sharedText = new Set();
const groups = [];
for (const [n, v] of Object.entries(byName)) {
  if (v.length < 2) continue;
  v.forEach(r => sharedName.add(r.atlas + '|' + r.tree + '|' + r.name));
  groups.push({ kind: 'name', label: n, trees: v.map(r => r.atlas + '/' + r.tree) });
}
for (const [t, v] of Object.entries(byText)) {
  if (v.length < 2) continue;
  const trees = new Set(v.map(r => r.atlas + '/' + r.tree));
  if (trees.size < 2) continue;
  v.forEach(r => sharedText.add(r.atlas + '|' + r.tree + '|' + r.name));
  const names = [...new Set(v.map(r => r.name))];
  if (names.length > 1) groups.push({ kind: 'text-only', label: names.join(' == '), trees: [...trees] });
}

console.log('=== shared talents: the same talent appearing in more than one tree ===');
for (const g of groups.sort((a, b) => b.trees.length - a.trees.length)) {
  console.log(`  ${String(g.trees.length).padStart(2)}x  ${g.label.padEnd(34)} ${g.trees.join(', ')}`);
}

const shared = new Set([...sharedName, ...sharedText]);
console.log('');
console.log(`${shared.size} of ${rows.length} talent slots (${(100 * shared.size / rows.length).toFixed(0)}%) are a talent that also exists in another tree.`);
console.log('');
console.log('=== per tree: how much of it is its own? ===');
console.log('TREE                   n  shared  unique  %own   the shared ones');
const by = {};
for (const r of rows) (by[r.atlas + '/' + r.tree] ||= []).push(r);
for (const [k, v] of Object.entries(by)) {
  const s = v.filter(r => shared.has(r.atlas + '|' + r.tree + '|' + r.name));
  console.log(k.padEnd(21), String(v.length).padStart(3), String(s.length).padStart(7), String(v.length - s.length).padStart(7),
    ((100 * (v.length - s.length) / v.length).toFixed(0) + '%').padStart(6), '  ' + s.map(r => r.name).join(', '));
}

// Data hygiene — the review keeps tripping over these, and they are cheap to fix.
console.log('');
console.log('=== data hygiene: likely typos in talent text and cost fields ===');
const TYPOS = [/\bPrsentable\b/i, /\bSpriritual\b/i, /\bInvestiure\b/i, /\bgran allies\b/i,
  /\bCreatures[^.]{0,40}\bhas\b/, /\bthier\b/i, /\bteh\b/i, /\brecieve/i, /\boccured\b/i, /\bseperate/i];
for (const r of rows) {
  const T = String(r.description || ''), C = String(r.cost || '');
  for (const re of TYPOS) {
    if (re.test(T) || re.test(C)) {
      console.log(`  ${(r.atlas + '/' + r.tree).padEnd(20)} ${r.name.padEnd(24)} ${re.source}`);
      break;
    }
  }
}
console.log('');
console.log('=== cost-field vocabulary (inconsistent spellings show up here) ===');
const costs = {};
for (const r of rows) costs[String(r.cost || '').trim()] = (costs[String(r.cost || '').trim()] || 0) + 1;
for (const [c, n] of Object.entries(costs).sort((a, b) => b[1] - a[1])) console.log('  ' + String(n).padStart(4) + '  ' + (c || '(empty)'));
console.log('');
console.log('=== action-field vocabulary (the leyline atlas uses glyphs, the others words) ===');
const acts = {};
for (const r of rows) acts[String(r.action || '').trim()] = (acts[String(r.action || '').trim()] || 0) + 1;
for (const [c, n] of Object.entries(acts).sort((a, b) => b[1] - a[1])) console.log('  ' + String(n).padStart(4) + '  ' + (c || '(empty)'));
