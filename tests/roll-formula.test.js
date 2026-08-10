/* R-65 / hygiene campaign pass 5.1 (2026-08-10) — edhaRollFormula, the ONE async formula-roll path
 * every damage/heal/DC roll now shares.
 *
 * BEFORE this pass, only 2 of 22 `new Roll(Roll.replaceFormulaData(...))` evaluate sites folded
 * computed die math (edhaFoldDieMath) before rolling. The documented [Tier][Die] convention —
 * "(@tier)d(2 * @colorRank + 2)" — reached Foundry's Roll with the parenthetical die-count
 * expression still UNRESOLVED after @-ref substitution (Roll has no arithmetic-inside-dice-notation
 * support), so the die term silently failed. The smoking gun (module-src/scripts/register-skills.js,
 * the burst-apply heal/damage branches) was two adjacent lines: a heal branch that didn't fold
 * sitting eight lines above its damage twin that did — same formula shape, same roll data, only one
 * of the two produced a real die.
 *
 * These pins hold: (1) computed die math folds before the Roll is built, (2) an unresolved @-ref
 * bakes to "0" (Roll.replaceFormulaData's own {missing:"0"} contract, unchanged), (3) the helper
 * accepts either an actor (calls .getRollData() once) or an already-resolved roll-data object —
 * several call sites keep a `rd` in scope and must NOT be forced to re-derive it, (4) the exact
 * heal-branch regression shape: a [Tier][Die] formula through the helper folds identically whether
 * it arrived via a "heal" or a "damage" code path, because both now call the same function.
 *
 * Uses the harness's capturing RollStub (see tests/contest-attr.test.js) — the arithmetic-only stub
 * cannot evaluate real dice notation, so the FORMULA STRING the helper builds is the observable,
 * not the total (which the stub returns as a fixed override).
 */
"use strict";
const assert = require("assert");
const { loadEngine, RollStub } = require("./harness.js");

function withCapturingRoll(env, { total = 7 } = {}) {
  const seen = [];
  env.Roll = RollStub({ total, capture: seen });
  return seen;
}

test("edhaRollFormula: a computed-die formula folds to plain dice before the Roll is built", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);

  const roll = await env.edhaRollFormula({}, "(2)d(2 * 3 + 2)");

  assert.strictEqual(seen.length, 1, "exactly one Roll must be constructed");
  assert.strictEqual(seen[0], "2d8", "the parenthetical die-count math must be folded, not left for Foundry's Roll to choke on");
  assert.strictEqual(roll.total, 7, "the evaluated Roll (the stub's fixed total) is returned");
});

test("edhaRollFormula: an unresolved @-ref bakes to \"0\", same as Roll.replaceFormulaData({missing:\"0\"})", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);

  await env.edhaRollFormula({}, "@nonexistent.path + 3");

  assert.strictEqual(seen[0], "0 + 3", "a missing @-ref must bake to 0, never survive as a literal @ in the rolled formula");
});

test("edhaRollFormula: accepts an ACTOR (.getRollData() called once) or a raw roll-data object — same result", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);
  const rd = { tier: 3 };

  await env.edhaRollFormula(rd, "@tier + 1");                              // raw roll-data object
  await env.edhaRollFormula({ getRollData: () => rd }, "@tier + 1");       // actor-shaped (has getRollData)

  assert.strictEqual(seen[0], "3 + 1", "a raw roll-data object must be used directly, not treated as an actor");
  assert.strictEqual(seen[1], "3 + 1", "an actor-shaped object must have .getRollData() called and its result used");
  assert.strictEqual(seen[0], seen[1], "both argument forms must resolve to the identical formula");
});

test("edhaRollFormula: the heal-branch regression — a [Tier][Die] formula folds through the helper regardless of which code path calls it", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);
  const rd = { tier: 2, colorRank: 3 };
  const dmgF = "(@tier)d(2 * @colorRank + 2)";   // the documented [Tier][Die] convention, verbatim

  // Both branches (the burst-apply heal branch and its damage twin) now call the SAME helper with
  // the SAME formula and roll data — before this pass only one of the two folded.
  const healRoll = await env.edhaRollFormula(rd, dmgF);
  const damageRoll = await env.edhaRollFormula(rd, dmgF);

  assert.strictEqual(seen[0], "2d8", "the heal branch must fold (@tier)d(2 * @colorRank + 2) -> 2d8, not leave it unresolved");
  assert.strictEqual(seen[1], "2d8", "the damage branch (already folding pre-pass) must be unchanged");
  assert.strictEqual(seen[0], seen[1], "heal and damage must no longer diverge — the whole point of one shared helper");
  assert.strictEqual(healRoll.total, damageRoll.total, "both evaluate through the identical path");
});

test("edhaRollFormula: a formula with no dice and no @-refs passes through unchanged", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);

  await env.edhaRollFormula({}, "5 + 3");

  assert.strictEqual(seen[0], "5 + 3");
});
