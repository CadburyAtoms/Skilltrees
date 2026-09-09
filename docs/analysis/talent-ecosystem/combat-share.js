// How much of each tree does nothing in a fight? "Every tree is good at something" is a weaker
// claim if the something only happens during a long rest. This is a heuristic classifier — it
// flags DOWNTIME talents (crafting, resting, library access, reassigning skills, treating injuries
// between scenes) and PURE-SOCIAL talents, and reports the remainder as combat-relevant.
// Read the flagged lists; the point is the shape, not the exact number.
const fs = require('fs');
const OUT = process.argv[2];
const rows = JSON.parse(fs.readFileSync(OUT + '/all-talents.json', 'utf8'));
const T = r => String(r.authoredDescription || r.description || '');

const DOWNTIME = /\b(when crafting|crafting time|material cost|long rest|during a rest|library access|reassign|reconfigure|downtime|upgrade instead of|Opportunity range expands)\b/i;
const SOCIAL_ONLY = /\b(expertise|high society|fashion|reputation|contacts?)\b/i;
const COMBATY = /\b(damage|attack|Strike|Reaction|defense|health|HP|round|turn|initiative|enemy|enemies|Deflect|condition|Disoriented|Restrained|Prone|Slowed|Weakened|Immobilized|Stunned|Afflicted|movement|move|adjacent|within \d|Attunement Range)\b/i;

const by = {};
for (const r of rows) (by[r.atlas + '/' + r.tree] ||= []).push(r);

console.log('COMBAT SHARE — talents that do nothing once initiative is rolled');
console.log('');
console.log('TREE                   n  downtime  combat  %combat   the downtime ones');
const out = {};
for (const [k, v] of Object.entries(by)) {
  const down = v.filter(r => {
    const t = T(r);
    if (DOWNTIME.test(t)) return true;
    // expertise-only talents with no combat verb at all
    if (SOCIAL_ONLY.test(t) && !COMBATY.test(t)) return true;
    return false;
  });
  const n = v.length, d = down.length;
  out[k] = { n, d, names: down.map(r => r.name) };
  console.log(k.padEnd(21), String(n).padStart(3), String(d).padStart(9), String(n - d).padStart(7),
    ((100 * (n - d) / n).toFixed(0) + '%').padStart(8), '  ' + down.map(r => r.name).join(', '));
}

console.log('');
console.log('=== the same question restricted to what a character can hold by LEVEL 5 ===');
console.log('(rank cap 2 until L6, so every rank-3+ talent is out of reach; 1 talent per level)');
console.log('TREE                   reachable-by-L5  of which downtime  combat-useful by L5');
for (const [k, v] of Object.entries(by)) {
  const reach = v.filter(r => r.earliestLevel <= 5);
  const d = reach.filter(r => out[k].names.includes(r.name)).length;
  console.log(k.padEnd(21), String(reach.length).padStart(15), String(d).padStart(18), String(reach.length - d).padStart(20));
}

console.log('');
console.log('=== resource cost of a full round, per tree ===');
console.log('A leyline character has ~4 Investiture at L1 (2 + max(AWA,PRE)) and Draw Mana returns');
console.log('TIER per Action — 1 at levels 1-5. A heroic character has 2+WIL Focus and no Draw Mana.');
console.log('');
console.log('TREE                   Inv-costers  Focus-costers  free (no cost)  bonus regen');
const REGEN_INV = /\b(regain|recover|restore)\b[^.;]{0,30}\bInvestiture\b/i;
const REGEN_FOC = /\b(regain|recover|restore)\b[^.;]{0,30}\bfocus\b/i;
for (const [k, v] of Object.entries(by)) {
  const inv = v.filter(r => /Investiture/i.test(String(r.cost || ''))).length;
  const foc = v.filter(r => /focus/i.test(String(r.cost || ''))).length;
  const free = v.filter(r => !String(r.cost || '').trim() || String(r.cost).trim() === '—' || String(r.cost) === 'undefined').length;
  const regen = v.filter(r => REGEN_INV.test(T(r)) || REGEN_FOC.test(T(r))).map(r => r.name);
  console.log(k.padEnd(21), String(inv).padStart(11), String(foc).padStart(14), String(free).padStart(15), '  ' + (regen.join(', ') || '—'));
}
