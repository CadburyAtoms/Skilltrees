// Every deity tree gates on TWO leyline colours at rank 2+ (3+ on its deepest talents). The deity
// design guide presents this as the system's designed cross-path synergy and specifies a colour
// split per deity ("Black tests for diminish; White tests for elevate"). This script asks whether
// each gate colour is paid back — and it has to read every channel through which a colour can pay.
//
// A gate colour can reward its rank in three ways, all visible in the authored Foundry overlay
// (data/authored/deity-*.json), which is what the system actually runs:
//   TESTS      — `skill: "<colour>"`, on the activation or on a handler: the colour is rolled.
//   RANK-SIZED — `@skills.<colour>.rank` / `.mod` in any formula: damage, heal, temp HP, a rider.
//   TARGETING  — any other field whose value is the colour (`rangeColor`, `color`, `allyRange`,
//                `failThpRange`, `saveColor`, …): the colour's Attunement Range sets the reach.
//
// ⚠️ CORRECTION, 2026-09-12. The first version of this script read only the activation `skill`
// and the talent's own `damage.formula`, and concluded that five deity trees get nothing from a
// gate colour and that four of those five are White. The review's problem ledger (run
// wf_0b59b6ca-5bc, `droppedAsArtefact[3]`) re-counted with the targeting channel included and
// found exactly ONE pure toll booth. Re-measured here on all three channels: it was right.
// Civilization's White sizes its Construct and Foundation dice; Knowledge's Green sets the reach of
// seven talents; Order's White sizes four formulas and two ranges. Any census that ranks deity
// gates must read every channel or it will reproduce the same error.
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const rows = JSON.parse(fs.readFileSync(OUT + '/all-talents.json', 'utf8'));
const DOM = JSON.parse(fs.readFileSync('data/domain.json', 'utf8'));
const COLOURS = ['white', 'blue', 'black', 'red', 'green'];

const gate = {}, rankDemand = {};
for (const t of DOM) {
  if (!gate[t.domain]) gate[t.domain] = String(t.colors || '').toLowerCase().split('/').map(s => s.trim());
  for (const m of String(t.prerequisites || '').matchAll(/(white|blue|black|red|green)\s*(\d)\+/gi)) {
    const d = (rankDemand[t.domain] ||= {});
    const c = m[1].toLowerCase();
    d[c] = Math.max(d[c] || 0, +m[2]);
  }
}

function channels(tree) {
  const file = path.join('data', 'authored', 'deity-' + tree.toLowerCase() + '.json');
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const res = {};
  for (const c of COLOURS) {
    res[c] = { tests: 0, rank: 0, targeting: 0, fields: {}, talents: new Set(),
      testTalents: new Set(), rankTalents: new Set(), targetTalents: new Set() };
  }
  for (const [name, a] of Object.entries(j.talents || {})) {
    const walk = (o, key) => {
      if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) walk(v, k); return; }
      if (typeof o !== 'string') return;
      const lo = o.toLowerCase();
      for (const c of COLOURS) {
        const refs = (o.match(new RegExp('skills\\.' + c + '\\.(rank|mod)', 'g')) || []).length;
        const r = res[c];
        if (refs) { r.rank += refs; r.rankTalents.add(name); r.talents.add(name); }
        if (lo === c) {
          if (key === 'skill') { r.tests++; r.testTalents.add(name); }
          else { r.targeting++; r.fields[key] = (r.fields[key] || 0) + 1; r.targetTalents.add(name); }
          r.talents.add(name);
        }
      }
    };
    walk({ activation: a.activation, damage: a.damage, events: a.events, effects: a.effects }, null);
  }
  return res;
}

const verdictOf = x => {
  const n = x.talents.size;
  if (n === 0) return 'TOLL BOOTH — the rank buys only the gate';
  if (n === 1) return 'NEAR-DEAD — one talent: ' + [...x.talents][0];
  if (x.tests === 0 && n <= 3) return 'THIN — never tested, touches ' + n + ' talents';
  if (x.tests === 0) return 'USED, NEVER TESTED';
  return 'USED';
};

console.log('DEITY GATE AUDIT — is each gate colour paid back? (tests / rank-sized / targeting)');
console.log('');
console.log('TREE           colour  rank   tests  rank-sized  targeting  talents  verdict');
const summary = { toll: [], near: [], thin: [], neverTested: [] };
for (const tree of Object.keys(gate).sort()) {
  const ch = channels(tree);
  for (const c of gate[tree]) {
    const x = ch[c];
    const demand = (rankDemand[tree] || {})[c];
    const v = verdictOf(x);
    console.log(
      tree.padEnd(14), c.padEnd(6), ((demand ? demand + '+' : '?')).padStart(4),
      String(x.tests).padStart(7), String(x.rank).padStart(11), String(x.targeting).padStart(10),
      String(x.talents.size).padStart(8), ' ' + v);
    const tag = tree + '/' + c + ' ' + (demand ? demand + '+' : '');
    if (x.talents.size === 0) summary.toll.push(tag);
    else if (x.talents.size === 1) summary.near.push(tag + ' (' + [...x.talents][0] + ')');
    else if (x.tests === 0 && x.talents.size <= 3) summary.thin.push(tag + ' (' + [...x.talents].join(', ') + ')');
    if (x.tests === 0) summary.neverTested.push(tree + '/' + c);
  }
}

console.log('');
console.log('=== what the gate buys, by verdict ===');
console.log('  TOLL BOOTH (no talent reads the colour at all): ' + (summary.toll.join('; ') || 'none'));
console.log('  NEAR-DEAD (exactly one talent reads it):        ' + (summary.near.join('; ') || 'none'));
console.log('  THIN (never tested, 2-3 talents read it):       ' + (summary.thin.join('; ') || 'none'));
console.log('  never TESTED, on any channel of use:            ' + summary.neverTested.length + ' of 20 gate colours — '
  + summary.neverTested.join(', '));
console.log('');
console.log('The guide\'s own worked example — Sovereignty, "Black tests for diminish; White tests for');
console.log('elevate" — is still false on the tests channel: see its white row above. But White is');
console.log('NOT "the colour nobody rewards": count the rank-sized and targeting columns.');

// The signature resources the intent prose promises, checked against talent text. A tree whose
// named signature mechanic appears nowhere in its own talents has a documentation-vs-data gap.
const deity = rows.filter(r => r.atlas === 'deity');
const byTree = {};
for (const r of deity) (byTree[r.tree] ||= []).push(r);
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
