/* Unit tests for the engine's pure helpers (register-skills.js via tests/harness.js).
 *
 * These pin the logic behind past table bugs — most importantly the 07-05 roll-label family
 * (garbled "1d(2 x 3 + 2)" breakdowns from replaceFormulaData computing nothing), so a future
 * edit can't quietly re-break every tree's rider formulas at once.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

// Values built inside the vm context carry that realm's prototypes, which deepStrictEqual
// rejects; JSON-normalize the actual value before structural comparison.
const eq = (actual, expected) => assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)), expected);

test("engine loads headlessly and registers its hooks", () => {
  assert.ok(env.__hooks.on.length > 100, `expected >100 Hooks.on registrations, got ${env.__hooks.on.length}`);
  assert.ok(env.__hooks.once.length >= 3, `expected init/ready registrations, got ${env.__hooks.once.length}`);
  const names = new Set(env.__hooks.on.map((h) => h.name).concat(env.__hooks.once.map((h) => h.name)));
  for (const expected of ["cosmere-rpg.preUseItem", "cosmere-rpg.useItem", "init", "ready"]) {
    assert.ok(names.has(expected), `no registration for hook "${expected}"`);
  }
});

// --- edhaFoldDieMath — the 07-05 garbled-formula regression -------------------
test("edhaFoldDieMath folds computed faces: 1d(2 * 3 + 2) -> 1d8", () => {
  assert.strictEqual(env.edhaFoldDieMath("1d(2 * 3 + 2)"), "1d8");
});
test("edhaFoldDieMath folds computed die count: (1 + 1)d6 -> 2d6", () => {
  assert.strictEqual(env.edhaFoldDieMath("(1 + 1)d6"), "2d6");
});
test("edhaFoldDieMath folds count and faces together: (2)d(2 * 3 + 2) -> 2d8", () => {
  assert.strictEqual(env.edhaFoldDieMath("(2)d(2 * 3 + 2)"), "2d8");
});
test("edhaFoldDieMath folds every die in a multi-term formula", () => {
  assert.strictEqual(env.edhaFoldDieMath("1d(2 + 2) + (1 + 1)d(3 * 2)"), "1d4 + 2d6");
});
test("edhaFoldDieMath leaves plain formulas alone", () => {
  assert.strictEqual(env.edhaFoldDieMath("2d6 + 3"), "2d6 + 3");
});
test("edhaFoldDieMath leaves unresolved @refs alone (can't safely evaluate)", () => {
  assert.strictEqual(env.edhaFoldDieMath("1d(2 * @rank + 2)"), "1d(2 * @rank + 2)");
});
test("edhaFoldDieMath clamps degenerate faces to 1 and floors fractions", () => {
  assert.strictEqual(env.edhaFoldDieMath("1d(0)"), "1d1");
  assert.strictEqual(env.edhaFoldDieMath("1d(7 / 2)"), "1d3");
});

test("[Tier][Die] convention end-to-end: substitute then fold reads clean", () => {
  // The canonical damage shape from ENGINE_INDEX: (@tier)d(2 * @skills.<color>.rank + 2).
  const rd = { tier: 2, skills: { red: { rank: 3 } } };
  const substituted = env.Roll.replaceFormulaData("(@tier)d(2 * @skills.red.rank + 2)", rd, { missing: "0" });
  assert.strictEqual(env.edhaFoldDieMath(substituted), "2d8");
});

// --- edhaEvalSync -------------------------------------------------------------
test("edhaEvalSync evaluates flat formulas against roll data", () => {
  assert.strictEqual(env.edhaEvalSync("@skills.red.mod + 1", { skills: { red: { mod: 4 } } }), 5);
  assert.strictEqual(env.edhaEvalSync("2 + 3", {}), 5);
});
test("edhaEvalSync fills missing refs with 0 and never throws", () => {
  assert.strictEqual(env.edhaEvalSync("@no.such.ref + 2", {}), 2);
  assert.strictEqual(env.edhaEvalSync("not a formula", {}), 0);
  assert.strictEqual(env.edhaEvalSync(null, {}), 0);
});

// --- edhaEventRules / edhaRuleOf (the on-talent behaviour store) ---------------
function fakeTalent(rules) {
  return { hasEvents: () => true, enabledEvents: rules };
}
test("edhaEventRules lists enabled rules; tolerates items without events", () => {
  const rules = [{ handler: { type: "edha-burst" } }];
  eq(env.edhaEventRules(fakeTalent(rules)), rules);
  eq(env.edhaEventRules({}), []);
  eq(env.edhaEventRules(null), []);
  eq(env.edhaEventRules({ hasEvents: () => { throw new Error("boom"); } }), []);
});
test("edhaRuleOf returns the FIRST rule of the given handler type, else null", () => {
  const item = fakeTalent([
    { handler: { type: "edha-move", distance: 5 } },
    { handler: { type: "edha-burst", sizeFt: 10 } },
    { handler: { type: "edha-burst", sizeFt: 99 } },
  ]);
  assert.strictEqual(env.edhaRuleOf(item, "edha-burst").sizeFt, 10);
  assert.strictEqual(env.edhaRuleOf(item, "edha-summon"), null);
});

// --- edhaRiderMatches (damage-rider appliesTo matching) ------------------------
test("edhaRiderMatches: 'any'/empty match everything, comma-lists match members", () => {
  assert.strictEqual(env.edhaRiderMatches("any", "energy"), true);
  assert.strictEqual(env.edhaRiderMatches(null, "energy"), true);
  assert.strictEqual(env.edhaRiderMatches("energy,impact", "impact"), true);
  assert.strictEqual(env.edhaRiderMatches("energy impact", "impact"), true);
  assert.strictEqual(env.edhaRiderMatches("energy", "keen"), false);
  assert.strictEqual(env.edhaRiderMatches(["keen", "vital"], "vital"), true);
});

// --- edhaColorRank -------------------------------------------------------------
test("edhaColorRank clamps to 0..5 and defaults to 0", () => {
  const actor = (rank) => ({ system: { skills: { red: { rank } } } });
  assert.strictEqual(env.edhaColorRank(actor(3), "red"), 3);
  assert.strictEqual(env.edhaColorRank(actor(7), "red"), 5);
  assert.strictEqual(env.edhaColorRank(actor(-2), "red"), 0);
  assert.strictEqual(env.edhaColorRank(actor("3"), "red"), 3);
  assert.strictEqual(env.edhaColorRank(actor(3), "blue"), 0);
  assert.strictEqual(env.edhaColorRank(null, "red"), 0);
});

// --- edhaFtToPx (grid math) ----------------------------------------------------
test("edhaFtToPx converts feet via the scene grid, min half a grid square", () => {
  env.canvas.scene = { grid: { size: 100, distance: 5 } };
  assert.strictEqual(env.edhaFtToPx(30), 600);
  assert.strictEqual(env.edhaFtToPx(5), 100);
  assert.strictEqual(env.edhaFtToPx(0), 50); // never collapses below half a square
  env.canvas.scene = null;
  assert.strictEqual(env.edhaFtToPx(5), 100); // 100/5 defaults hold without a scene
});

// --- edhaBurstSpecFromCfg (flat rule -> burst spec) ------------------------------
test("edhaBurstSpecFromCfg maps a full edha-burst rule", () => {
  const spec = env.edhaBurstSpecFromCfg({
    color: "red", affects: "allies", sizeByRank: true, sizeFt: 10,
    rangeByRank: false, rangeFt: 60, saveSkill: "ath", saveVs: "red",
    addSkillMod: "red", heal: false, terrain: true,
  });
  eq(spec, {
    color: "red", affects: "allies",
    area: { shape: "circle", sizeByRank: true, sizeFt: 10 },
    burst: { rangeByRank: false, rangeFt: 60, save: { skill: "ath", vs: "red" }, addSkillMod: "red", heal: false, terrain: true },
  });
});
test("edhaBurstSpecFromCfg defaults: enemies, no save without saveSkill, save.vs falls back to color", () => {
  const bare = env.edhaBurstSpecFromCfg({});
  assert.strictEqual(bare.affects, "enemies");
  assert.strictEqual(bare.burst.save, null);
  assert.strictEqual(bare.area.sizeFt, 0);
  const fallback = env.edhaBurstSpecFromCfg({ color: "green", saveSkill: "ath" });
  eq(fallback.burst.save, { skill: "ath", vs: "green" });
});
