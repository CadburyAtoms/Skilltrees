// Every deity tree gates on TWO leyline colours at rank 2+. The deity design guide calls this a
// designed synergy and specifies a colour split per deity ("Black tests for diminish; White tests
// for elevate"). This script asks whether the gate is actually paid back: of the two colours a
// tree demands, how often does it TEST each one, and does its talent text interact with anything
// that colour does?
//
// A tree that demands Colour X at rank 2+ (and sometimes 3+, which is a level-6 gate) and never
// tests X is a toll booth, not a synergy. The skill field comes from the authored Foundry overlay
// (`activation.skill`), i.e. what the system actually rolls — not from prose.
const fs = require('fs');
const OUT = process.argv[2];
const rows = JSON.parse(fs.readFileSync(OUT + '/all-talents.json', 'utf8'));
const DOM = JSON.parse(fs.readFileSync('data/domain.json', 'utf8'));
const COLOURS = ['white', 'blue', 'black', 'red', 'green'];

const gate = {};
for (const t of DOM) if (!gate[t.domain]) gate[t.domain] = String(t.colors || '').toLowerCase().split('/').map(s => s.trim());

const deity = rows.filter(r => r.atlas === 'deity');
const byTree = {};
for (const r of deity) (byTree[r.tree] ||= []).push(r);

console.log('DEITY GATE AUDIT — does a tree test the colours it charges you for?');
console.log('');
console.log('TREE            gate colours    tests by skill field        sizes damage die     highest rank demanded');
const findings = [];
for (const [tree, v] of Object.entries(byTree)) {
  const g = gate[tree] || [];
  const skillCount = {};
  for (const r of v) if (r.skill) skillCount[r.skill] = (skillCount[r.skill] || 0) + 1;
  const proseCount = {};
  for (const r of v) {
    const T = String(r.authoredDescription || r.description || '');
    for (const c of COLOURS) {
      const re = new RegExp('test ' + c + '\\b', 'i');
      if (re.test(T)) proseCount[c] = (proseCount[c] || 0) + 1;
    }
  }
  // highest rank demanded per colour, across the tree's prerequisites
  const rank = {};
  for (const r of v) {
    for (const m of String(r.prerequisites || '').matchAll(/(white|blue|black|red|green)\s*(\d)\+/gi)) {
      const c = m[1].toLowerCase(), n = +m[2];
      rank[c] = Math.max(rank[c] || 0, n);
    }
  }
  // A colour's rank can pay off WITHOUT a test: `(@tier)d(2 * @skills.red.rank + 2)` sizes the
  // damage die off that colour's rank. So "never tested" is not yet "never rewarded" — check the
  // roll formulas too before calling a gate a toll.
  const dieCount = {};
  for (const r of v) {
    const f = String(r.damageFormula || '');
    for (const c of COLOURS) if (f.includes('skills.' + c + '.rank')) dieCount[c] = (dieCount[c] || 0) + 1;
  }
  const untested = g.filter(c => !(skillCount[c] > 0) && !(proseCount[c] > 0) && !(dieCount[c] > 0));
  console.log(
    tree.padEnd(15),
    g.join('/').padEnd(15),
    (Object.entries(skillCount).map(([k, n]) => `${k}:${n}`).join(' ') || '(none)').padEnd(27),
    (Object.entries(dieCount).map(([k, n]) => `${k}:${n}`).join(' ') || '(none)').padEnd(20),
    Object.entries(rank).map(([k, n]) => `${k} ${n}+`).join(', '));
  if (untested.length) findings.push({ tree, gate: g, untested, rankDemanded: untested.map(c => `${c} ${rank[c] || '?'}+`) });
}

console.log('');
console.log('=== TOLL BOOTHS: a gate colour the tree never tests AND never uses for a damage die ===');
if (!findings.length) console.log('  none — every deity tree tests both of its gate colours.');
for (const f of findings) {
  console.log(`  ${f.tree.padEnd(15)} demands ${f.rankDemanded.join(', ')} and never tests ${f.untested.join(', ')}`);
}

// The signature resources the intent prose promises, checked against talent text. A tree whose
// named signature mechanic appears nowhere in its own talents has a documentation-vs-data gap.
console.log('');
console.log('=== SIGNATURE RESOURCES: named in the path description, found in talent text? ===');
const SIG = {
  Chaos: 'Omen', Knowledge: 'Insight', Sovereignty: 'Decree', Life: 'Mutation', Power: 'Bounty',
  Death: 'Harvested Remain', Destruction: 'Charge', Order: 'Edict', Civilization: 'Foundation',
  Fate: 'Ordained Ground',
};
for (const [tree, res] of Object.entries(SIG)) {
  const v = byTree[tree] || [];
  const re = new RegExp('\\b' + res + '\\b', 'i');
  const inBody = v.filter(r => re.test(String(r.authoredDescription || r.description || '')));
  const inName = v.filter(r => re.test(r.name));
  const flag = inBody.length ? 'ok' : (inName.length ? 'NAME ONLY — appears in a talent title but is not a mechanic' : 'ABSENT — promised by the path description, present in no talent');
  console.log(`  ${tree.padEnd(15)} ${res.padEnd(18)} body:${String(inBody.length).padStart(2)}  title:${String(inName.length).padStart(2)}   ${flag}`);
}
