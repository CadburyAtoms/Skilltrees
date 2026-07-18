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

// --- edhaTestCtxMatch — the 07-12 pass-3 "Predatory Patience die on NO tests" regression -------
// The system capitalizes roll contexts ('Skill' | 'Attack' | 'Item'); authored appliesTo is
// lowercase. The pass-2 gate compared them raw and rejected every roll.
test("edhaTestCtxMatch: appliesTo attack matches the system's capitalized 'Attack' context", () => {
  assert.strictEqual(env.edhaTestCtxMatch("attack", "Attack", false), true);
});
test("edhaTestCtxMatch: attack rider never rides a skill test (Ben ruling 07-12)", () => {
  assert.strictEqual(env.edhaTestCtxMatch("attack", "Skill", false), false);
  assert.strictEqual(env.edhaTestCtxMatch("attack", "Skill", true), false);
});
test("edhaTestCtxMatch: attack rider rides an Item-context roll only when the item deals damage", () => {
  assert.strictEqual(env.edhaTestCtxMatch("attack", "Item", true), true);
  assert.strictEqual(env.edhaTestCtxMatch("attack", "Item", false), false);
});
test("edhaTestCtxMatch: 'any', empty appliesTo, and unknown context never gate", () => {
  assert.strictEqual(env.edhaTestCtxMatch("any", "Skill", false), true);
  assert.strictEqual(env.edhaTestCtxMatch("", "Attack", false), true);
  assert.strictEqual(env.edhaTestCtxMatch(undefined, "Attack", false), true);
  assert.strictEqual(env.edhaTestCtxMatch("attack", undefined, false), true);
});

// --- edhaTidyFormula — the pass-3 "2d20kh+6)" formula-bar garble ------------------------------
test("edhaTidyFormula spaces the system's separator-less formula and drops the stray closer", () => {
  assert.strictEqual(env.edhaTidyFormula("2d20kh+6)"), "2d20kh + 6");
});
test("edhaTidyFormula spaces plain formulas", () => {
  assert.strictEqual(env.edhaTidyFormula("1d20+3-1"), "1d20 + 3 - 1");
});
test("edhaTidyFormula leaves balanced parens and already-clean strings alone", () => {
  assert.strictEqual(env.edhaTidyFormula("floor((1d8)/2)"), "floor((1d8)/2)");
  assert.strictEqual(env.edhaTidyFormula("2d20kh + 6"), "2d20kh + 6");
});
test("edhaTidyFormula never touches operators inside flavor labels", () => {
  assert.strictEqual(env.edhaTidyFormula("1d8[Predatory+Patience]+2"), "1d8[Predatory+Patience] + 2");
});

// --- edhaIsTalent / edhaOwnsTalent — the 07-14 W23 pipe-cleaner fallback -----------------------
// The adversary sheet renders only trait/weapon/action sections, so adversary tree-talent embeds
// are ACTION-TYPED TWINS flagged `edha-content.adversaryTalent`. Ownership gates must count both
// shapes — and the PC talent budget (edhaCountTalents) must count ONLY real talent-type items.
const pcTalent = { type: "talent", name: "Guiding Signal" };
const advTwin = { type: "action", name: "Guiding Signal", flags: { "edha-content": { adversaryTalent: true, talent: "Guiding Signal" } } };
const plainAction = { type: "action", name: "Guiding Signal", flags: { "edha-content": {} } };

test("edhaIsTalent accepts talent-type items and flagged action twins, rejects plain actions", () => {
  assert.strictEqual(env.edhaIsTalent(pcTalent), true);
  assert.strictEqual(env.edhaIsTalent(advTwin), true);
  assert.strictEqual(env.edhaIsTalent(plainAction), false);
  assert.strictEqual(env.edhaIsTalent(null), false);
});
test("edhaOwnsTalent sees a PC talent, an adversary twin, and nothing else", () => {
  assert.strictEqual(env.edhaOwnsTalent({ items: [pcTalent] }, "Guiding Signal"), true);
  assert.strictEqual(env.edhaOwnsTalent({ items: [advTwin] }, "Guiding Signal"), true);
  assert.strictEqual(env.edhaOwnsTalent({ items: [plainAction] }, "Guiding Signal"), false);
  assert.strictEqual(env.edhaOwnsTalent({ items: [advTwin] }, "Ordered Advance"), false);
  assert.strictEqual(env.edhaOwnsTalent(null, "Guiding Signal"), false);
});
test("edhaCountTalents stays type-strict: adversary twins never count toward a PC talent budget", () => {
  assert.strictEqual(env.edhaCountTalents({ items: [pcTalent, advTwin, plainAction] }), 1);
});

// --- 07-14 W23 round-2 helpers: round windows, half-Speed, token renumbering -------------------
test("edhaRoundWindowValid: out-of-combat marks stay open; in-combat marks bind to combat+round", () => {
  assert.strictEqual(env.edhaRoundWindowValid(null, null), false);
  assert.strictEqual(env.edhaRoundWindowValid({ round: null, combatId: null }, null), true);            // armed outside combat
  const mark = { round: 3, combatId: "c1" };
  assert.strictEqual(env.edhaRoundWindowValid(mark, { id: "c1", round: 3 }), true);
  assert.strictEqual(env.edhaRoundWindowValid(mark, { id: "c1", round: 4 }), false);                    // round rolled over
  assert.strictEqual(env.edhaRoundWindowValid(mark, { id: "c2", round: 3 }), false);                    // different combat
  assert.strictEqual(env.edhaRoundWindowValid(mark, null), false);                                      // combat ended
});
test("edhaHalfSpeed reads .value (PC) or .override (adversary), halves to the 2.5-ft step, defaults 25", () => {
  assert.strictEqual(env.edhaHalfSpeed({ system: { movement: { walk: { rate: { value: 30 } } } } }), 15);
  assert.strictEqual(env.edhaHalfSpeed({ system: { movement: { walk: { rate: { override: 25 } } } } }), 12.5);
  assert.strictEqual(env.edhaHalfSpeed({ system: { movement: { walk: { rate: 35 } } } }), 17.5);
  assert.strictEqual(env.edhaHalfSpeed({}), 12.5);                                                      // default walk 25
});
test("edhaNextTokenName renumbers only on collision, picking the lowest free number", () => {
  assert.strictEqual(env.edhaNextTokenName("Mistheron (1)", ["Mistheron (1)"]), "Mistheron (2)");       // the 07-14 report
  assert.strictEqual(env.edhaNextTokenName("Mistheron (1)", ["Mistheron (1)", "Mistheron (2)"]), "Mistheron (3)");
  assert.strictEqual(env.edhaNextTokenName("Mistheron (1)", ["Mistheron (2)", "Mistheron (3)"]), null); // no collision — core was right
  assert.strictEqual(env.edhaNextTokenName("Mistheron (2)", ["Mistheron (1)", "Mistheron (3)"]), null);
  assert.strictEqual(env.edhaNextTokenName("Mistheron", ["Mistheron"]), null);                          // un-numbered names untouched
  assert.strictEqual(env.edhaNextTokenName("Roek (+) (1)", ["Roek (+) (1)"]), "Roek (+) (2)");          // regex metachars in the base
});

// --- 07-14 the phantom client veil (pure decision) ---------------------------------------------
const veilBelief = { fooled: [{ uuid: "tokA" }], saw: [{ uuid: "tokB" }] };
test("edhaPhantomVeilHides: fooled client hides the ORIGINAL, seer client hides the COPY", () => {
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, ["tokA"], "origTok", "origTok", "copyTok"), true);   // fooled → no original
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, ["tokA"], "copyTok", "origTok", "copyTok"), false);  // fooled → copy stays
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, ["tokB"], "copyTok", "origTok", "copyTok"), true);   // seer → no copy
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, ["tokB"], "origTok", "origTok", "copyTok"), false);  // seer → original stays
});
test("edhaPhantomVeilHides: untested clients and the GM path see both; saw beats fooled on one client", () => {
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, [], "origTok", "origTok", "copyTok"), false);        // untested observer
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, ["tokA", "tokB"], "origTok", "origTok", "copyTok"), false);  // mixed ownership: seer knowledge wins
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, ["tokA", "tokB"], "copyTok", "origTok", "copyTok"), true);
  assert.strictEqual(env.edhaPhantomVeilHides(veilBelief, ["tokA"], "someTok", null, "copyTok"), false);       // no original recorded → nothing to veil
});

// --- 07-16 whenTargetFooled damage-rider condition (pure decision) ------------------------------
test("edhaTargetFooledIn: fooled token uuids match; seers and untested don't", () => {
  const belief = { fooled: [{ uuid: "tokA" }, { uuid: "tokC" }], saw: [{ uuid: "tokB" }] };
  assert.strictEqual(env.edhaTargetFooledIn(belief, ["tokA"]), true);            // the believer eats the +1d6
  assert.strictEqual(env.edhaTargetFooledIn(belief, ["tokB"]), false);           // a seer never does
  assert.strictEqual(env.edhaTargetFooledIn(belief, ["tokZ"]), false);           // untested observer
  assert.strictEqual(env.edhaTargetFooledIn(belief, ["tokB", "tokC"]), true);    // any owned token fooled suffices
  assert.strictEqual(env.edhaTargetFooledIn(belief, []), false);
  assert.strictEqual(env.edhaTargetFooledIn(null, ["tokA"]), false);             // no belief ledger yet
  assert.strictEqual(env.edhaTargetFooledIn({}, ["tokA"]), false);
});

// --- 07-16 GM cue cards: the hp-below crossing decision (pure) ----------------------------------
test("edhaCueCrossed: fires only when THIS write crosses maxHp×fraction, atFraction 0 = the drop", () => {
  assert.strictEqual(env.edhaCueCrossed(13, 11, 24, 0.5), true);     // 13 > 12 ≥ 11 — crossed half
  assert.strictEqual(env.edhaCueCrossed(11, 8, 24, 0.5), false);     // already below — no re-fire
  assert.strictEqual(env.edhaCueCrossed(13, 12, 24, 0.5), true);     // landing exactly ON the line counts
  assert.strictEqual(env.edhaCueCrossed(20, 14, 24, 0.5), false);    // still above
  assert.strictEqual(env.edhaCueCrossed(28, 9, 28, 0.34), true);     // Not a Bandit: crossed 1/3
  assert.strictEqual(env.edhaCueCrossed(3, 0, 12, 0), true);         // The Line Falls Apart: dropped to 0
  assert.strictEqual(env.edhaCueCrossed(0, 0, 12, 0), false);        // already down — no re-fire
  assert.strictEqual(env.edhaCueCrossed(13, 11, 24, undefined), true); // fraction defaults to half
});

// --- 07-16b per-token phantom ownership (two mistherons, one world actor) ------------------------
test("edhaPhantomOwnedBy: token-keyed when both sides know their token; actor-id fallback otherwise", () => {
  const birdA = { phantomCasterTok: "Scene.s.Token.A", summoner: "mist1" };
  assert.strictEqual(env.edhaPhantomOwnedBy(birdA, "Scene.s.Token.A", "mist1"), true);   // its own bird
  assert.strictEqual(env.edhaPhantomOwnedBy(birdA, "Scene.s.Token.B", "mist1"), false);  // the OTHER bird — same actor id!
  const preFix = { summoner: "mist1" };                                                  // copy minted before 07-16b
  assert.strictEqual(env.edhaPhantomOwnedBy(preFix, "Scene.s.Token.A", "mist1"), true);  // falls back to actor id
  assert.strictEqual(env.edhaPhantomOwnedBy(preFix, null, "mist1"), true);               // tokenless caster, same actor
  assert.strictEqual(env.edhaPhantomOwnedBy(preFix, null, "someoneElse"), false);
  assert.strictEqual(env.edhaPhantomOwnedBy(birdA, null, "mist1"), true);                // caster lost its token — actor fallback
});

// --- 07-16c the Senses Range table (pure) --------------------------------------------------------
test("edhaSensesRangeFtFromAwa follows the Character_Building_Rules table", () => {
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(0), 10);
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(1), 15);
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(2), 20);
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(3), 20);
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(4), 25);
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(5), 30);
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(6), 30);
  assert.strictEqual(env.edhaSensesRangeFtFromAwa(undefined), 10);
});

// --- 07-18b adversary pack sync: the item-replacement decision (pure) ----------------------------
test("edhaAdvSyncPlan: pack-built (flagged) and source-colliding items drop; hand-added survive", () => {
  const src = [{ _id: "packItemAAAAAAAA", name: "Spearing Beak" }, { _id: "packItemBBBBBBBB", name: "Draw Mana" }];
  const owned = [
    { id: "packItemAAAAAAAA", name: "Spearing Beak", flags: { "edha-content": { adversary: "Mistheron" } } }, // pack copy — drop
    { id: "worldRandomId001", name: "Draw Mana", flags: {} },              // unflagged but name-collides — drop (would duplicate)
    { id: "packItemBBBBBBBB", name: "Renamed By Ben", flags: {} },         // unflagged but id-collides — drop (keepId would crash)
    { id: "worldRandomId002", name: "Ben's Custom Trinket", flags: {} },   // hand-added — keep
    { id: "worldRandomId003", name: "Old Stale Ability", flags: { "edha-content": { adversary: "Mistheron" } } }, // pack-built, REMOVED from source — drop
  ];
  const plan = env.edhaAdvSyncPlan(owned, src);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.drop)), ["packItemAAAAAAAA", "worldRandomId001", "packItemBBBBBBBB", "worldRandomId003"]);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.keep)), ["worldRandomId002"]);
});
test("edhaAdvSyncPlan: missing flags object never throws; empty source drops only flagged items", () => {
  const owned = [{ id: "a", name: "X" }, { id: "b", name: "Y", flags: { "edha-content": {} } }];
  const plan = env.edhaAdvSyncPlan(owned, []);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.drop)), ["b"]);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(plan.keep)), ["a"]);
});

// --- 07-18 bench: Surefooted +10 displayed as +20 — the derivation folded rate.bonus into the
// override while DerivedValueField.value = override + bonus, double-counting every speed AE.
test("edhaDeriveSheetStats: speed override excludes rate.bonus (AE applies once via the getter)", () => {
  const actor = {
    type: "character",
    system: {
      resources: { hea: { max: { bonus: 0 } } },
      movement: { walk: { rate: { bonus: 10, override: 0, useOverride: false } } },
      attributes: { spd: { value: 2 } },
    },
    _source: { system: { resources: { hea: { max: { bonus: 0 } } }, movement: { walk: { rate: {} } } } },
  };
  env.edhaDeriveSheetStats(actor);
  const rate = actor.system.movement.walk.rate;
  assert.strictEqual(rate.override, 30, "override must be 20 + 5×SPD only — bonus stays out");
  assert.strictEqual(rate.useOverride, true);
  // displayed value = override + bonus = 40 exactly once, not 50
  assert.strictEqual(rate.override + rate.bonus, 40);
});
