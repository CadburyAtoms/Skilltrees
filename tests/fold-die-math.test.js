/* tests/fold-die-math.test.js — TODO_REPO_HYGIENE #59 / R-71.
 *
 * Pins scripts/lib/fold-die-math.js (foundry-build.js's build-time fold of `system.damage.formula`)
 * against the three representative shapes item 59 names, and against the engine's OWN
 * `edhaFoldDieMath` (module-src/scripts/register-skills.js, loaded headlessly via tests/harness.js)
 * so the two copies cannot silently drift apart — the build has no Foundry runtime to import the
 * engine's copy, so a hand-duplicated twin only stays safe if something pins it to the original.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");
const { foldDieMath } = require("../scripts/lib/fold-die-math.js");

const env = loadEngine();

// --- item 59's three representative formulas ------------------------------------------------

test("fold-die-math: a rank-scaled [Tier][Die] formula still has @-refs at build time -> unchanged", () => {
  const f = "(@tier)d(2 * @skills.blue.rank + 2)";
  assert.strictEqual(foldDieMath(f), f);
});

test("fold-die-math: a plain already-folded formula -> unchanged", () => {
  const f = "2d6 + 3";
  assert.strictEqual(foldDieMath(f), f);
});

test("fold-die-math: a flat-modifier formula with fully numeric computed dice -> folds", () => {
  assert.strictEqual(foldDieMath("(1)d(2 * 3 + 2) + 5"), "1d8 + 5");
});

// --- general behaviour (mirrors engine-helpers.test.js's edhaFoldDieMath cases) --------------

test("fold-die-math: folds computed faces: 1d(2 * 3 + 2) -> 1d8", () => {
  assert.strictEqual(foldDieMath("1d(2 * 3 + 2)"), "1d8");
});

test("fold-die-math: folds computed die count: (1 + 1)d6 -> 2d6", () => {
  assert.strictEqual(foldDieMath("(1 + 1)d6"), "2d6");
});

test("fold-die-math: folds count and faces together: (2)d(2 * 3 + 2) -> 2d8", () => {
  assert.strictEqual(foldDieMath("(2)d(2 * 3 + 2)"), "2d8");
});

test("fold-die-math: folds every die in a multi-term formula", () => {
  assert.strictEqual(foldDieMath("1d(2 + 2) + (1 + 1)d(3 * 2)"), "1d4 + 2d6");
});

test("fold-die-math: clamps degenerate faces to 1 and floors fractions", () => {
  assert.strictEqual(foldDieMath("1d(0)"), "1d1");
  assert.strictEqual(foldDieMath("1d(7 / 2)"), "1d3");
});

test("fold-die-math: leaves a partially-symbolic formula's numeric die alone too (whole-formula no-op)", () => {
  // Mirrors engine-helpers.test.js: the engine's copy treats an unresolved @ref as un-evaluable
  // and leaves the WHOLE formula untouched, not just the symbolic term.
  const f = "1d(2 * @rank + 2)";
  assert.strictEqual(foldDieMath(f), f);
});

// --- pinned equivalence with the engine's own edhaFoldDieMath --------------------------------
// The build must not import the engine (no Foundry `Roll` global under Node), so
// scripts/lib/fold-die-math.js is a hand-written twin. This is what keeps the twin honest: run
// BOTH copies over the same formulas and require identical output.
test("fold-die-math: build-side twin matches the engine's edhaFoldDieMath exactly", () => {
  const formulas = [
    "(@tier)d(2 * @skills.blue.rank + 2)",
    "2d6 + 3",
    "(1)d(2 * 3 + 2) + 5",
    "1d(2 * 3 + 2)",
    "(1 + 1)d6",
    "(2)d(2 * 3 + 2)",
    "1d(2 + 2) + (1 + 1)d(3 * 2)",
    "1d(0)",
    "1d(7 / 2)",
    "1d(2 * @rank + 2)",
    "(2 * @tier)d(2 * @skills.black.rank + 2)",
    "floor((@tier)d(2 * @skills.green.rank + 2) / 2)",
  ];
  for (const f of formulas) {
    assert.strictEqual(foldDieMath(f), env.edhaFoldDieMath(f), `mismatch on: ${f}`);
  }
});

/* --- the RIDER half of the same fold — edhaFoldRiderFormula (fix pass 10, TODO 78) -------------
 * Item 69 folds the BASE damage formula at roll time, so a scaled talent prints `2d8`. The rider
 * joined onto it was still handed over raw, so bench run 41 read Prognosis as
 * `2d8 + 2 + ((2)d(2 * 3 + 2))[Prognosis]` — folded base, unfolded rider, on one bar.
 * The safety property is the load-bearing one: the rider resolves here against the ROLLER's data,
 * while the system resolves it a moment later against `getDamageRollData`
 * (= `{...actor.getRollData(), mod, skill, attribute, source}`). Substituting with no `missing`
 * leaves an unresolved `@ref` in place, so a rider needing one of those four extra keys is detected
 * and handed on RAW. REVERSION: drop the `sub.includes("@")` bail and case 3 fails; drop the call
 * in `edhaRiderBonus` and the live bar goes back to printing `(2)d(2 * 3 + 2)`. */
const RIDER_DATA = { tier: 2, skills: { green: { rank: 3 }, black: { rank: 2 }, red: { rank: 1 } } };

test("edhaFoldRiderFormula folds the three scaled rider formulas the atlas actually ships", () => {
  // Prognosis (deity-life), Black's [Tier][Die] rider, and Red's halved-die rider.
  assert.strictEqual(env.edhaFoldRiderFormula("(@tier)d(2 * @skills.green.rank + 2)", RIDER_DATA), "2d8");
  assert.strictEqual(env.edhaFoldRiderFormula("1d(2 * @skills.black.rank + 2)", RIDER_DATA), "1d6");
  assert.strictEqual(env.edhaFoldRiderFormula("floor((1d(2 * @skills.red.rank + 2)) / 2)", RIDER_DATA), "floor((1d4) / 2)");
});

test("edhaFoldRiderFormula leaves a flat rider alone and resolves a plain @-ref as the system would", () => {
  assert.strictEqual(env.edhaFoldRiderFormula("1d6", RIDER_DATA), "1d6");
  assert.strictEqual(env.edhaFoldRiderFormula("3", RIDER_DATA), "3");
  assert.strictEqual(env.edhaFoldRiderFormula("(1 + @tier)", RIDER_DATA), "(1 + 2)");
});

test("edhaFoldRiderFormula hands on a rider that needs the SYSTEM's damage roll data, raw", () => {
  // @mod / @skill / @attribute exist only in getDamageRollData, never in actor.getRollData().
  for (const f of ["1d6 + @mod", "@skill.rank", "(@attribute)d6"]) {
    assert.strictEqual(env.edhaFoldRiderFormula(f, RIDER_DATA), f, `must not pre-resolve ${f}`);
  }
});

test("edhaFoldRiderFormula is inert without roll data (and never throws)", () => {
  assert.strictEqual(env.edhaFoldRiderFormula("(@tier)d(2 * @skills.green.rank + 2)", null),
    "(@tier)d(2 * @skills.green.rank + 2)");
  assert.strictEqual(env.edhaFoldRiderFormula("1d6", undefined), "1d6");
});
