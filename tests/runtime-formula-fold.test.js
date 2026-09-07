/* RUNTIME FORMULA FOLD ON THE SYSTEM'S DAMAGE ROLL — item 69, R-71's runtime half (2026-09-06).
 *
 * The cosmere-rpg system rolls a talent's own `system.damage.formula` straight off the field and
 * prints the raw string on the chat card. Item 59 folded the formula at BUILD time and proved that a
 * no-op on every current formula — all are rank/tier-scaled (`(@tier)d(2 * @skills.blue.rank + 2)`)
 * and need an actor to resolve. Item 69 folds INSIDE `edhaWrapRollDamage` (the engine's ONE wrapper
 * over `CosmereItem#rollDamage`, iron rule 2a) with the roller's data in hand, BEFORE the system
 * builds its roll and BEFORE any next-test rider joins onto the base.
 *
 * The pins the brief names:
 *   1. a rank-scaled formula on a tier-2 / rank-3 actor folds to plain dice (`2d8 + 5`-shaped);
 *   2. a plain formula comes out byte-identical (the wrapper leaves `options` untouched);
 *   3. a rider still joins onto the FOLDED base (`2d8 + 5 + 1d6`);
 *   4. a source scan: `edhaFoldDieMath` is called from the wrapper exactly once.
 * Each of 1–3 fails under a one-line reversion (delete the fold block or its `options =` line).
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, readEngineSource, codeOnly } = require("./harness.js");

const env = loadEngine();

const VERDICT_FORMULA = "(@tier)d(2 * @skills.blue.rank + 2) + @skills.blue.mod";
const ROLL_DATA = { tier: 2, skills: { blue: { rank: 3, mod: 5 } } };

function damageRoll(baseFormula, { mods = [], rollData = ROLL_DATA, noRollData = false } = {}) {
  const actor = mockActor({ name: "Bench Target", flags: { nextTestMod: mods } });
  actor.isOwner = true;                    // edhaSetEdhaFlag writes locally rather than relaying
  if (noRollData) delete actor.getRollData; else actor.getRollData = () => rollData;
  const item = mockItem({ name: "Sabre", actor, system: { damage: { formula: baseFormula, type: "keen" } } });
  const seen = [];
  const originalCall = (options) => { seen.push(options); return Promise.resolve(null); };
  env.edhaWrapRollDamage.call(item, originalCall, {});
  return { seen, options: seen[0], formula: seen[0]?.overrideFormula ?? item.system.damage.formula };
}

// --- 1. THE DEFECT ------------------------------------------------------------------------------

test("item 69: a rank/tier-scaled damage formula folds to plain dice on the wrapped roll (tier 2 / rank 3 → `2d8 + 5`)", () => {
  const { formula } = damageRoll(VERDICT_FORMULA);
  assert.strictEqual(formula, "2d8 + 5");
  assert.ok(!/@|\(/.test(formula), `no @-ref and no parenthetical survives in ${JSON.stringify(formula)}`);
});

test("item 69: the fold reads the ROLLER's numbers — a different actor gives different plain dice", () => {
  const { formula } = damageRoll(VERDICT_FORMULA, { rollData: { tier: 3, skills: { blue: { rank: 1, mod: 2 } } } });
  assert.strictEqual(formula, "3d4 + 2");
});

// --- 2. BYTE-IDENTICAL PLAIN ---------------------------------------------------------------------

test("item 69: a formula that is already plain comes out byte-identical and `options` is untouched", () => {
  const { options, formula } = damageRoll("2d6 + 1");
  assert.strictEqual(formula, "2d6 + 1");
  assert.strictEqual(options.overrideFormula, undefined, "no overrideFormula is minted for a plain formula");
  assert.deepStrictEqual(options, {});
});

test("item 69: an actor with no roll data leaves the formula alone (never breaks a damage roll)", () => {
  const { formula } = damageRoll(VERDICT_FORMULA, { noRollData: true });
  assert.strictEqual(formula, VERDICT_FORMULA);
});

// --- 3. RIDERS JOIN ONTO THE FOLDED BASE ---------------------------------------------------------

const PACK_DMG = { source: "Pack Hunting", formula: "1d6", count: 1, appliesTo: "either", gid: "G-PACK" };
const PNET_DMG = { source: "Probability Net", formula: "-1d6", count: 1, appliesTo: "either", gid: "G-PNET" };

test("item 69: a next-test rider still joins — onto the FOLDED base (`2d8 + 5 + 1d6`)", () => {
  const { formula } = damageRoll(VERDICT_FORMULA, { mods: [PACK_DMG] });
  assert.strictEqual(formula, "2d8 + 5 + 1d6");
});

test("item 69: item 66's labelled subtraction is unchanged on a folded base", () => {
  const { formula } = damageRoll(VERDICT_FORMULA, { mods: [PNET_DMG] });
  assert.strictEqual(formula, "2d8 + 5 - 1d6[Probability Net]");
});

test("item 69: item 66's plain-base strings are byte-identical to before", () => {
  assert.strictEqual(damageRoll("2d6", { mods: [PACK_DMG] }).formula, "2d6 + 1d6");
  assert.strictEqual(damageRoll("2d6", { mods: [PNET_DMG] }).formula, "2d6 - 1d6[Probability Net]");
});

// --- 4. THE WRAPPER IS THE ONE PLACE -------------------------------------------------------------

test("item 69: source scan — edhaWrapRollDamage calls edhaFoldDieMath exactly once, and there is still ONE wrapper", () => {
  const src = codeOnly(readEngineSource());
  const start = src.indexOf("function edhaWrapRollDamage(");
  assert.ok(start >= 0, "edhaWrapRollDamage exists");
  const end = src.indexOf("\nfunction ", start + 1);
  const body = src.slice(start, end < 0 ? undefined : end);
  const calls = body.match(/edhaFoldDieMath\(/g) || [];
  assert.strictEqual(calls.length, 1, "the wrapper folds through edhaFoldDieMath exactly once");
  assert.ok(body.includes("Roll.replaceFormulaData("), "the fold substitutes the roller's data first");
  assert.strictEqual((src.match(/function edhaWrapRollDamage\(/g) || []).length, 1, "one damage wrapper (iron rule 2a)");
});
