// Every `@path` a talent formula references, checked against what the cosmere-rpg actor actually
// puts in roll data. Written because of leyline/Red `Momentum's Edge`.
//
// THE BUG THIS EXISTS TO CATCH. `Momentum's Edge` carries
// `bonusFormula: "@movement.walk.rate"`, and its card reads "bonus impact damage equal to your
// Speed". But `system.movement.walk.rate` is a **DerivedValueField OBJECT**, not a number — the
// engine says so itself in `module-src/scripts/engine/19-red-momentum-frenzy.js`:
//
//     // Walking Speed in ft. `movement.walk.rate` is a DerivedValueField OBJECT — read it through
//     // edhaDerivedNum (07-27y: the raw Number() here was NaN → 0, so every `edha-move
//     // {byHalfSpeed}` moved 0 ft — the three "Unstoppable" blocks).
//
// That exact mistake already shipped once, in the movement handler, and was fixed there with
// `edhaDerivedNum`. The damage-rider path does NOT use that helper: it goes through
// `Roll.replaceFormulaData`, which does `String(value)` on whatever it finds. So the rider almost
// certainly does not deliver a number. Whether the roll errors or silently adds nothing is a
// question for a live table.
//
// And separately from the bug: if it DID resolve, walk rate is `20 + 5·SPD` = 30 ft at SPD 2,
// which would be ~10x every other damage rider in the game. The Speed ATTRIBUTE (`@attr.spd`,
// 0-5) is what the card's wording means and what every sibling rider's magnitude implies.
const fs = require('fs');

// Flat shorthands the cosmere-rpg actor builds in getRollData(): `attr.<id>` = the attribute
// VALUE, `skills.<id>.rank` / `.mod` = numbers, `scalar.damage.unarmed` = a formula string,
// `tier`/`level` = numbers. Everything else in `@...` is a raw `system` path, and a system path
// that lands on a DerivedValueField gives you an object.
const SAFE = [
  /^@tier$/, /^@level$/,
  /^@attr\.(str|spd|int|wil|awa|pre)$/,
  /^@skills\.[a-z]+\.(rank|mod)$/,
  /^@scalar\.damage\.unarmed$/,
  // Engine-provided substitutions, not roll-data paths — the engine resolves each before the Roll
  // is built. `@target.recoveryDie` in 37-synchronous-formula-dice-evaluation.js (Galvanize, Field
  // Medicine); `@owned` in 15-blue-calculation.js (the four Leader Command upgrades size their die
  // by how many you own).
  /^@target\.recoveryDie$/, /^@owned$/,
];
// Known DerivedValueField / object-valued paths — `{value, override, derived}`, never a number.
const DERIVED_OBJECT = [
  /^@movement\.[a-z]+\.rate$/,
  /^@resources\.[a-z]+\.(max|value)$/,
  /^@defenses\.[a-z]+$/,
  /^@deflect$/,
];

const findings = [];
for (const f of fs.readdirSync('data/authored')) {
  const j = JSON.parse(fs.readFileSync('data/authored/' + f, 'utf8'));
  const tree = f.replace('.json', '');
  for (const [name, a] of Object.entries(j.talents || {})) {
    const formulas = [];
    if (a.damage && a.damage.formula) formulas.push(['damage.formula', a.damage.formula]);
    for (const [id, e] of Object.entries(a.events || {})) {
      const h = e.handler || {};
      for (const k of ['bonusFormula', 'formula', 'thpFormula', 'healFormula', 'failThpFormula']) {
        if (h[k]) formulas.push([`events.${id}.${k}`, h[k]]);
      }
    }
    for (const [where, formula] of formulas) {
      for (const m of String(formula).matchAll(/@[A-Za-z0-9_.]+/g)) {
        const ref = m[0];
        const safe = SAFE.some(re => re.test(ref));
        const derived = DERIVED_OBJECT.some(re => re.test(ref));
        if (safe) continue;
        findings.push({ tree, name, where, formula, ref, derived });
      }
    }
  }
}

console.log('FORMULA REFERENCE AUDIT — @paths that will not resolve to a number in roll data');
console.log('');
if (!findings.length) console.log('  clean: every formula reference is a flat roll-data shorthand.');
const bad = findings.filter(f => f.derived);
const unknown = findings.filter(f => !f.derived);
if (bad.length) {
  console.log('!! RESOLVES TO AN OBJECT, NOT A NUMBER — Roll.replaceFormulaData will stringify it:');
  for (const f of bad) console.log(`   ${f.tree.padEnd(20)} ${f.name.padEnd(22)} ${f.where.padEnd(34)} ${f.ref}`);
  console.log('   Fix: use the flat shorthand (@attr.spd for the Speed ATTRIBUTE), or resolve the');
  console.log('   derived field through edhaDerivedNum before the formula is built.');
  console.log('');
}
if (unknown.length) {
  console.log('?  not a known flat shorthand — check it resolves:');
  for (const f of unknown) console.log(`   ${f.tree.padEnd(20)} ${f.name.padEnd(22)} ${f.where.padEnd(34)} ${f.ref}`);
  console.log('');
}

// Magnitude comparison: every damage rider side by side, so an outlier is visible.
console.log('=== every damage rider bonusFormula, for magnitude comparison ===');
const riders = [];
for (const f of fs.readdirSync('data/authored')) {
  const j = JSON.parse(fs.readFileSync('data/authored/' + f, 'utf8'));
  for (const [name, a] of Object.entries(j.talents || {})) {
    for (const e of Object.values(a.events || {})) {
      const h = e.handler || {};
      if (h.bonusFormula) riders.push([f.replace('.json', ''), name, h.bonusFormula]);
    }
  }
}
for (const [t, n, form] of riders.sort((a, b) => a[2].localeCompare(b[2]))) {
  console.log('  ' + t.padEnd(20) + n.padEnd(24) + form);
}
console.log('');
console.log('At tier 1 rank 2 these are worth roughly: (1+@tier)=2, @tier=1, @attr.int~3,');
console.log('@skills.red.mod~3-5, 1d6~3.5, half a rank die~1.75. `@movement.walk.rate` would be 30.');
