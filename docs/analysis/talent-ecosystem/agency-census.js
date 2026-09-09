// AGENCY: how many talents in a tree can a player actually spend an Action on?
//
// This is the number the whole review turned on, and it arrived last. The trigger for the review
// was "two PCs have no damage talents", but what those players experience is not "I deal zero
// damage" — it is "I have three Actions on a Slow turn and my twenty-five-talent tree gives me two
// things to spend them on". Reactions, Specials, Free Actions and Passives are all real value, but
// none of them is something you CHOOSE to do on your own initiative.
//
// Counts 1 Action / 2 Actions / 3 Actions only. The leyline atlas writes Passive as `∞` and Special
// as `★`, so normalise before counting or leyline reads as all-Action.
const fs = require('fs');
const OUT = process.argv[2];
const rows = JSON.parse(fs.readFileSync(OUT + '/all-talents.json', 'utf8'));
const N = a => {
  a = String(a || '').trim();
  if (a === '∞') return 'Passive'; if (a === '★') return 'Special';
  if (a === '◇') return 'Free Action'; if (a === '⟲') return 'Reaction';
  if (a === 'Action') return '1 Action';
  return a;
};
const COSTS_ACTION = a => a === '1 Action' || a === '2 Actions' || a === '3 Actions';

const by = {};
for (const r of rows) (by[r.atlas + '/' + r.tree] ||= []).push(r);
const out = [];
for (const [k, v] of Object.entries(by)) {
  const act = v.filter(r => COSTS_ACTION(N(r.action)));
  const early = act.filter(r => r.earliestLevel <= 5);
  out.push({ k, n: v.length, act: act.length, early: early.length,
    names: act.sort((a, b) => a.earliestLevel - b.earliestLevel).map(r => `${r.name} (${N(r.action).replace(' Action', 'A').replace('s', '')}, L${r.earliestLevel})`) });
}
out.sort((a, b) => (a.act / a.n) - (b.act / b.n));
console.log('AGENCY — talents a player can spend an ACTION on (1A / 2A / 3A only)');
console.log('');
console.log('TREE                   n   action-costing   % of tree   of those, by L5');
for (const o of out) {
  console.log('  ' + o.k.padEnd(20) + String(o.n).padStart(3) + String(o.act).padStart(14)
    + ((100 * o.act / o.n).toFixed(0) + '%').padStart(12) + String(o.early).padStart(17));
}
console.log('');
console.log('=== the bottom four, in full ===');
for (const o of out.slice(0, 4)) console.log('  ' + o.k.padEnd(20) + o.names.join(' · '));
console.log('');
const atlas = { leyline: [0, 0], heroic: [0, 0], deity: [0, 0] };
for (const o of out) { const a = o.k.split('/')[0]; atlas[a][0] += o.act; atlas[a][1] += o.n; }
for (const [a, [x, y]] of Object.entries(atlas)) {
  console.log('  ' + a.padEnd(10) + x + ' of ' + y + ' (' + (100 * x / y).toFixed(0) + '%)');
}
console.log('');
console.log('A Slow turn is 3 Actions. A tree that offers two of them across 25 talents is not a');
console.log('low-damage tree, it is a tree with nothing to do — which is a different fix.');
