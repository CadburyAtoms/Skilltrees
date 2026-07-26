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

// --- 07-20 turn-end regen (edha-regen, the Garden Sow's Nexus-Fed): the pure clamp --------------
test("edhaRegenClamp: flat heal at turn end — never while down, never past max, 0 on nonsense", () => {
  assert.strictEqual(env.edhaRegenClamp(5, 40, 62), 5);         // plain regen
  assert.strictEqual(env.edhaRegenClamp(5, 60, 62), 2);         // clamped to max
  assert.strictEqual(env.edhaRegenClamp(5, 62, 62), 0);         // already full
  assert.strictEqual(env.edhaRegenClamp(5, 0, 62), 0);          // down — regen must not yo-yo her up
  assert.strictEqual(env.edhaRegenClamp(5, -3, 62), 0);         // below zero stays down
  assert.strictEqual(env.edhaRegenClamp(0, 40, 62), 0);         // zero amount
  assert.strictEqual(env.edhaRegenClamp("5", 40, 62), 5);       // string amount from authored JSON
  assert.strictEqual(env.edhaRegenClamp(5, 40, 0), 0);          // no readable max — no write
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

// --- 07-19 adversary-wiring audit: the ambush-belief ledger (the lightweight seeming) ----------
// Wrongwake's Thrown Voice / Stillback's Causeway Seeming write per-target belief on the CASTER;
// whenTargetFooled damage riders read it via edhaTargetFooled. These pin the pure ledger logic so
// the +1d6 ambush riders can't silently die again (the original bug: riders gated on a phantom
// copy that ambush predators never cast).
test("edhaAmbushLedgerFor: fresh ledger on first use and on scene change", () => {
  eq(env.edhaAmbushLedgerFor(null, "sceneA"), { sceneId: "sceneA", tested: {} });
  const old = { sceneId: "sceneA", tested: { "Scene.x.Token.1": { fooled: true, total: 3 } } };
  eq(env.edhaAmbushLedgerFor(old, "sceneB"), { sceneId: "sceneB", tested: {} });
});
test("edhaAmbushLedgerFor: same scene keeps tested entries (once per scene per target)", () => {
  const old = { sceneId: "sceneA", tested: { "Scene.x.Token.1": { fooled: true, total: 3 } } };
  const led = env.edhaAmbushLedgerFor(old, "sceneA");
  eq(led.tested["Scene.x.Token.1"], { fooled: true, total: 3 });
});
test("edhaAmbushFooledIn: true only for a fooled uuid in the CURRENT scene", () => {
  const belief = { sceneId: "sceneA", tested: {
    "Scene.x.Token.1": { fooled: true, total: 3 },
    "Scene.x.Token.2": { fooled: false, total: 19 },
  } };
  assert.strictEqual(env.edhaAmbushFooledIn(belief, "sceneA", ["Scene.x.Token.1"]), true);
  assert.strictEqual(env.edhaAmbushFooledIn(belief, "sceneA", ["Scene.x.Token.2"]), false, "a seer is never fooled");
  assert.strictEqual(env.edhaAmbushFooledIn(belief, "sceneB", ["Scene.x.Token.1"]), false, "stale scene = no belief");
  assert.strictEqual(env.edhaAmbushFooledIn(belief, "sceneA", ["Scene.x.Token.9"]), false, "untested = not fooled");
  assert.strictEqual(env.edhaAmbushFooledIn(null, "sceneA", ["Scene.x.Token.1"]), false, "no ledger never throws");
});

// --- W29 owner-scan widening (ruling 113) + the ruling-107 rank fallback -----------------------
// edhaOwnersOf is GONE (2bZ — its last consumer, the Dread Presence veto, is rule-keyed now), but
// the W29 guarantee it pinned must SURVIVE the repoint: the rule sweep has to see a rule carried
// by an UNLINKED adversary token that exists only on the canvas (the W28 Dirgehound regression),
// plus directory characters, deduped. This pins edhaWatchersOfRule's actor surface instead.
test("edhaWatchersOfRule: sees rules on character, adversary-token, and unlinked-token owners; dedupes; skips non-carriers", () => {
  const rule = { id: "r000000000000001", event: "edha-watch-rule", handler: { type: "edha-move-veto", moverStatus: "weakened" } };
  const talWith = (n) => ({ name: n, type: "talent", uuid: `T.${n}`, hasEvents: () => true, enabledEvents: [rule] });
  const advWith = (n) => ({ name: n, uuid: `A.${n}`, flags: { "edha-content": { adversaryTalent: true } }, hasEvents: () => true, enabledEvents: [rule] });
  const advBare = (n) => ({ name: n, uuid: `B.${n}`, flags: { "edha-content": { adversaryTalent: true } }, hasEvents: () => true, enabledEvents: [] });
  const pc = { id: "pc1", uuid: "Actor.pc1", type: "character", items: [talWith("Dread Presence")] };
  const bystander = { id: "adv2", uuid: "Actor.adv2", type: "adversary", items: [advBare("Sapping Hex")] };
  const tokenAdv = { id: "adv3", uuid: "Actor.adv3", type: "adversary", items: [advWith("Dread Presence")] };
  env.game = { actors: [pc, bystander] };
  env.canvas = { tokens: { placeables: [ { actor: tokenAdv }, { actor: tokenAdv }, { actor: null } ] } };
  env.edhaDropRuleIndex();
  try {
    const owners = [...env.edhaWatchersOfRule("edha-move-veto")].map(w => w.actor.id);
    assert.deepStrictEqual(owners.sort(), ["adv3", "pc1"], "canvas-only adversary + directory character, deduped");
    assert.ok(!owners.includes("adv2"), "a carrier of no such rule is excluded");
  } finally { env.edhaDropRuleIndex(); }
});
test("edhaOwnersOf: character-only scan behavior unchanged for edhaCharacterOwnersOf", () => {
  const pc = { id: "pc1", type: "character", items: [{ name: "Shield Wall", type: "talent" }] };
  const adv = { id: "adv1", type: "adversary", items: [{ name: "Shield Wall", flags: { "edha-content": { adversaryTalent: true } } }] };
  env.game = { actors: [pc, adv] };
  env.canvas = { tokens: { placeables: [] } };
  assert.deepStrictEqual(env.edhaCharacterOwnersOf("Shield Wall").map(o => o.id), ["pc1"], "the narrow scan stays narrow");
});
test("edhaColorRank: character ranks pass through; adversary falls back to ROLE rank at rank 0 (ruling 122)", () => {
  const pc = { type: "character", system: { skills: { white: { rank: 3 } } } };
  assert.strictEqual(env.edhaColorRank(pc, "white"), 3, "character rank unchanged");
  const rankedAdv = { type: "adversary", system: { tier: 3, role: "rival", skills: { black: { rank: 2 } } } };
  assert.strictEqual(env.edhaColorRank(rankedAdv, "black"), 2, "build-written role rank wins");
  const unrankedBoss = { type: "adversary", system: { tier: 2, role: "boss", skills: {} } };
  assert.strictEqual(env.edhaColorRank(unrankedBoss, "green"), 3, "ruling 122: boss role rank 3 at rank 0 (not tier)");
  const unrankedMinion = { type: "adversary", system: { tier: 2, role: "minion", skills: {} } };
  assert.strictEqual(env.edhaColorRank(unrankedMinion, "green"), 1, "ruling 122: minion role rank 1 at rank 0");
  const roleless = { type: "adversary", system: { tier: 2, skills: {} } };
  assert.strictEqual(env.edhaColorRank(roleless, "green"), 1, "no role field degrades safe to 1, never tier");
  const pc0 = { type: "character", system: { skills: {} } };
  assert.strictEqual(env.edhaColorRank(pc0, "red"), 0, "characters never inherit the fallback");
});

// --- edhaStanceRiderChanges — the iron-rule-2b stance conversion (07-24j) -----
// The six Warrior stances came off the engine's name-keyed EDHA_STANCE_CHANGES table; the marker
// now copies its changes off ONE ActiveEffect on the talent flagged `edha-content.stanceRider`.
// Pinned because a silent [] here is indistinguishable from "this stance has no numeric rider",
// which is exactly how a conversion regression would hide.
const stanceItem = (effects) => ({
  effects: effects.map((e) => ({
    ...e,
    getFlag: (scope, key) => (scope === "edha-content" ? e.flags?.["edha-content"]?.[key] : undefined),
  })),
});
test("edhaStanceRiderChanges reads the flagged effect's changes off the talent", () => {
  const item = stanceItem([
    { changes: [{ key: "system.deflect.bonus", mode: 2, value: "1" }], flags: { "edha-content": { stanceRider: true } } },
  ]);
  eq(env.edhaStanceRiderChanges(item), [{ key: "system.deflect.bonus", mode: 2, value: "1" }]);
});
test("edhaStanceRiderChanges ignores effects that are not flagged stanceRider", () => {
  const item = stanceItem([
    { changes: [{ key: "system.resources.hea.max.bonus", mode: 2, value: "@level" }], flags: {} },
  ]);
  eq(env.edhaStanceRiderChanges(item), []);
});
test("edhaStanceRiderChanges defaults a missing mode to 2 (ADD)", () => {
  const item = stanceItem([
    { changes: [{ key: "system.defenses.phy.bonus", value: "-2" }], flags: { "edha-content": { stanceRider: true } } },
  ]);
  eq(env.edhaStanceRiderChanges(item), [{ key: "system.defenses.phy.bonus", mode: 2, value: "-2" }]);
});
test("edhaStanceRiderChanges returns [] for a stance with no rider effect, and never throws", () => {
  eq(env.edhaStanceRiderChanges(stanceItem([])), []);
  eq(env.edhaStanceRiderChanges({}), []);
  eq(env.edhaStanceRiderChanges(null), []);
});

// --- edhaDefTestOutcome — H1's pure success/fail decision (07-24m) ------------
// Hoisted out of ~20 hand-rolled copies of `def == null ? true : total >= def`. The fail-open
// branch is the one that matters: an adversary with no written defense must not make the talent
// silently do nothing, which is what a naive `total >= Number(null)` would produce.
test("edhaDefTestOutcome vs defense: meets-or-beats succeeds, under fails", () => {
  assert.strictEqual(env.edhaDefTestOutcome(14, { vs: "defense", defValue: 14 }).ok, true, "ties succeed");
  assert.strictEqual(env.edhaDefTestOutcome(13, { vs: "defense", defValue: 14 }).ok, false);
  assert.strictEqual(env.edhaDefTestOutcome(14, { vs: "defense", defValue: 14 }).dc, 14, "card prints what was beaten");
});
test("edhaDefTestOutcome vs skill: compares against the engine-rolled foe total", () => {
  assert.strictEqual(env.edhaDefTestOutcome(18, { vs: "skill", oppRoll: 12 }).ok, true);
  assert.strictEqual(env.edhaDefTestOutcome(9, { vs: "skill", oppRoll: 12 }).ok, false);
});
test("edhaDefTestOutcome vs dc: flat number, ties succeed", () => {
  assert.strictEqual(env.edhaDefTestOutcome(15, { vs: "dc", dc: 15 }).ok, true);
  assert.strictEqual(env.edhaDefTestOutcome(14, { vs: "dc", dc: 15 }).ok, false);
});
test("edhaDefTestOutcome FAILS OPEN when the bar is unreadable (no written defense)", () => {
  for (const bad of [null, undefined, NaN, "—"]) {
    assert.strictEqual(env.edhaDefTestOutcome(3, { vs: "defense", defValue: bad }).ok, true, `defValue ${String(bad)} must fail open`);
  }
  assert.strictEqual(env.edhaDefTestOutcome(3, { vs: "defense", defValue: null }).dc, null, "and reports no dc to print");
  assert.strictEqual(env.edhaDefTestOutcome(3, { vs: "skill", oppRoll: null }).ok, true, "same for an unrollable foe");
});
test("edhaDefTestOutcome treats a 0 bar as real, not missing", () => {
  assert.strictEqual(env.edhaDefTestOutcome(0, { vs: "dc", dc: 0 }).ok, true);
  assert.strictEqual(env.edhaDefTestOutcome(-1, { vs: "dc", dc: 0 }).ok, false, "0 must not be swallowed as falsy");
});

// --- edhaRuleOwnsGate — the UPGRADE-TALENT gate (07-24p) ----------------------
// `whenOwnsTalent` on edha-note / edha-triggered-effect. It is what lets a pure upgrade talent
// (Absolute Stillness, Calm Appeal, Resolute Stand) leave the ratchet without a rule of its own:
// the PARENT's rule carries the upgrade's name as authored data. Two properties matter and both
// have a way to be got wrong — a blank field must NOT gate (or every existing rule stops firing),
// and a set field must NOT pass on a non-owner (or the upgrade becomes free for everybody).
test("edhaRuleOwnsGate: a blank field never gates — every rule without one still fires", () => {
  const nobody = { items: [] };
  for (const blank of ["", null, undefined]) {
    assert.strictEqual(env.edhaRuleOwnsGate(nobody, blank), true, `blank ${String(blank)} must not gate`);
  }
});
test("edhaRuleOwnsGate: a set field passes for the owner and blocks everyone else", () => {
  const owner = { items: [{ type: "talent", name: "Absolute Stillness" }] };
  const other = { items: [{ type: "talent", name: "Ghostly Walls" }] };
  assert.strictEqual(env.edhaRuleOwnsGate(owner, "Absolute Stillness"), true);
  assert.strictEqual(env.edhaRuleOwnsGate(other, "Absolute Stillness"), false, "the upgrade must not be free");
  assert.strictEqual(env.edhaRuleOwnsGate({ items: [] }, "Absolute Stillness"), false);
  assert.strictEqual(env.edhaRuleOwnsGate(null, "Absolute Stillness"), false, "no actor: gate closed, never thrown");
});
test("edhaRuleOwnsGate: an adversary twin of the upgrade counts, like every other ownership gate", () => {
  const twin = { items: [{ type: "action", name: "Calm Appeal", flags: { "edha-content": { adversaryTalent: true, talent: "Calm Appeal" } } }] };
  assert.strictEqual(env.edhaRuleOwnsGate(twin, "Calm Appeal"), true);
});

// --- edhaListPush — H3's capped-ledger core (07-24p) --------------------------
// The one place the six hand-rolled marker ledgers actually agreed, plus the one place they did
// NOT: Order/Fate push past the cap and fizzle the OLDEST (Ben R1), Chaos REFUSES at the cap. Both
// behaviours ship, so both are pinned — averaging them would have silently changed two trees.
const E = (n) => ({ id: `e${n}`, uuid: `Actor.${n}`, name: `T${n}` });

test("edhaListPush under the cap: appends, evicts nothing, refuses nothing", () => {
  const r = env.edhaListPush([E(1)], E(2), { cap: 3, evict: "oldest" });
  eq(r.list.map(x => x.id), ["e1", "e2"]);
  eq(r.evicted, []);
  assert.strictEqual(r.refused, false);
});
test("edhaListPush evict=oldest: at the cap the OLDEST leaves and the new one lands", () => {
  const r = env.edhaListPush([E(1), E(2)], E(3), { cap: 2, evict: "oldest" });
  eq(r.list.map(x => x.id), ["e2", "e3"], "FIFO: the survivor set is the newest `cap` entries");
  eq(r.evicted.map(x => x.id), ["e1"], "the caller needs the evicted entry to unmark its creature");
  assert.strictEqual(r.refused, false);
});
test("edhaListPush evict=refuse: at the cap NOTHING lands and the list is untouched", () => {
  const r = env.edhaListPush([E(1), E(2)], E(3), { cap: 2, evict: "refuse" });
  eq(r.list.map(x => x.id), ["e1", "e2"]);
  eq(r.evicted, []);
  assert.strictEqual(r.refused, true, "Chaos says so on the card instead of fizzling an Omen");
});
test("edhaListPush drops the whole overflow when the cap shrinks (tier can go down)", () => {
  const r = env.edhaListPush([E(1), E(2), E(3)], E(4), { cap: 2, evict: "oldest" });
  eq(r.list.map(x => x.id), ["e3", "e4"]);
  eq(r.evicted.map(x => x.id), ["e1", "e2"], "every evicted entry must be reported, not just the first");
});
test("edhaListPush never mutates the list it was given", () => {
  const src = [E(1), E(2)];
  env.edhaListPush(src, E(3), { cap: 2, evict: "oldest" });
  eq(src.map(x => x.id), ["e1", "e2"]);
});
test("edhaListPush: a cap that COMPUTED to 0 or garbage refuses instead of emptying the ledger", () => {
  // The failure this guards: @tier resolving to 0/NaN on a half-built actor. Evicting to fit a cap
  // of 0 would wipe every mark the owner is sustaining; refusing leaves the table where it was.
  for (const cap of [0, -1, null, NaN, "x"]) {
    const r = env.edhaListPush([E(1)], E(2), { cap, evict: "oldest" });
    assert.strictEqual(r.refused, true, `cap ${String(cap)} must refuse`);
    eq(r.list.map(x => x.id), ["e1"], "and must not silently empty a live ledger");
  }
});
test("edhaListPush: an OMITTED cap is the documented default of 1, not garbage", () => {
  const r = env.edhaListPush([E(1)], E(2), { evict: "oldest" });
  eq(r.list.map(x => x.id), ["e2"]);
  assert.strictEqual(r.refused, false);
});
test("edhaListPush tolerates a missing/garbage list (first use, or a wiped flag)", () => {
  for (const bad of [undefined, null, "nope", 7]) {
    const r = env.edhaListPush(bad, E(1), { cap: 2 });
    eq(r.list.map(x => x.id), ["e1"]);
  }
});

// --- edhaNextTestMatches `skill` as a COMMA-LIST (07-24w, Ben's q12 ruling) ---
// This was a scalar compare, so an authored "itm, lea, per" matched NO skill id and the gate passed
// nothing — the silent-failure direction. Pinned both ways: a list must accept each member AND reject
// a non-member, or "enforce the Command skill lists" becomes either a no-op or a lockout.
const NTM = (o = {}) => ({ source: "T", count: 1, ...o });
const SROLL = (id) => ({ data: { skill: { id, attribute: "wil" } } });

test("edhaNextTestMatches: a comma-list skill accepts every member", () => {
  for (const id of ["itm", "lea", "per"]) {
    assert.strictEqual(env.edhaNextTestMatches(NTM({ skill: "itm, lea, per" }), SROLL(id)), true, `${id} must match`);
  }
});
test("edhaNextTestMatches: a comma-list skill rejects a non-member", () => {
  assert.strictEqual(env.edhaNextTestMatches(NTM({ skill: "itm, lea, per" }), SROLL("ath")), false);
});
test("edhaNextTestMatches: a SINGLE skill id still works (every pre-07-24w consumer)", () => {
  assert.strictEqual(env.edhaNextTestMatches(NTM({ skill: "black" }), SROLL("black")), true);
  assert.strictEqual(env.edhaNextTestMatches(NTM({ skill: "black" }), SROLL("dec")), false);
});
test("edhaNextTestMatches: no skill gate matches any skill", () => {
  assert.strictEqual(env.edhaNextTestMatches(NTM(), SROLL("anything")), true);
});
test("edhaNextTestMatches: a skill gate rejects a roll carrying NO skill id", () => {
  // Fails CLOSED: a gated mod must not be spent on a roll the pipeline cannot classify.
  assert.strictEqual(env.edhaNextTestMatches(NTM({ skill: "itm, lea" }), { data: {} }), false);
});

// --- edhaNextTestMatches `appliesTo` — the damage-roll half (07-24x, Ben's q15(b) ruling) ---
// Pack Hunting's card promised a bonus on "attack OR damage roll" and the pipeline was d20-only, so
// the damage half was unreachable. Pinned in BOTH directions on BOTH callers: the default must stay
// test-only (every pre-07-24x consumer is implicitly `test`, so a leak here changes shipped talents),
// and `damage` must not fire on a d20.
test("edhaNextTestMatches: the DEFAULT mod is test-only — a damage roll must not consume it", () => {
  const m = NTM();
  assert.strictEqual(env.edhaNextTestMatches(m, SROLL("ath"), null, null, false), true, "d20 still matches");
  assert.strictEqual(env.edhaNextTestMatches(m, { data: {} }, null, null, true), false, "damage must NOT match");
});
test("edhaNextTestMatches: appliesTo 'damage' fires on damage and NOT on a d20", () => {
  const m = NTM({ appliesTo: "damage" });
  assert.strictEqual(env.edhaNextTestMatches(m, { data: {} }, null, null, true), true);
  assert.strictEqual(env.edhaNextTestMatches(m, SROLL("ath"), null, null, false), false);
});
test("edhaNextTestMatches: appliesTo 'either' fires on both", () => {
  const m = NTM({ appliesTo: "either" });
  assert.strictEqual(env.edhaNextTestMatches(m, { data: {} }, null, null, true), true);
  assert.strictEqual(env.edhaNextTestMatches(m, SROLL("ath"), null, null, false), true);
});
test("edhaNextTestMatches: a skill-gated mod never matches a damage roll (no skill id on one)", () => {
  // Belt and braces: 'either' + a skill list must not leak onto damage, because a damage roll has no
  // skill to check and the skill gate fails closed. Pack Hunting carries no skill list, deliberately.
  assert.strictEqual(env.edhaNextTestMatches(NTM({ appliesTo: "either", skill: "sur" }), { data: {} }, null, null, true), false);
});

// --- edhaListSharedHold — the shared-marker guard (07-24u, audit §9o trap 3) ---
// A marker status belongs to the CREATURE, not to one pact, and two of Order's are deliberately
// shared between owners. edhaListUnmark clears a status unconditionally, so without this check one
// owner's eviction strips another owner's icon — silently, and only at the table. Mutation-checked
// both ways: a guard that always holds makes a marker unclearable, one that never holds is the bug.
const L = (ownerId, ...uuids) => ({ ownerId, list: uuids.map(u => ({ uuid: u })) });

test("edhaListSharedHold: another owner still holding the creature blocks the unmark", () => {
  assert.strictEqual(env.edhaListSharedHold([L("a", "Actor.X"), L("b", "Actor.X")], "Actor.X", "a"), true);
});
test("edhaListSharedHold: nobody else holding it lets the unmark through", () => {
  assert.strictEqual(env.edhaListSharedHold([L("a", "Actor.X"), L("b", "Actor.Y")], "Actor.X", "a"), false);
});
test("edhaListSharedHold: the EXCLUDED owner's own entry never counts as a shared hold", () => {
  // The releasing owner's list may still be pre-write. Counting it would make the marker permanent.
  assert.strictEqual(env.edhaListSharedHold([L("a", "Actor.X")], "Actor.X", "a"), false);
});
test("edhaListSharedHold: a missing uuid is never a hold (the point-bound ledgers carry none)", () => {
  // Snares/Ordained/Charges entries have no uuid at all — audit §9o trap 2. Returning true there
  // would make every eviction a no-op; this must fail OPEN so the unmark proceeds as before.
  for (const bad of [undefined, null, ""]) {
    assert.strictEqual(env.edhaListSharedHold([L("b", "Actor.X")], bad, "a"), false);
  }
});
test("edhaListSharedHold tolerates a garbage ledger set and garbage lists", () => {
  for (const bad of [undefined, null, "nope", 7]) {
    assert.strictEqual(env.edhaListSharedHold(bad, "Actor.X", "a"), false);
  }
  assert.strictEqual(env.edhaListSharedHold([null, { ownerId: "b", list: "nope" }], "Actor.X", "a"), false);
});
test("edhaListSharedHold: with no owner excluded, any holder counts", () => {
  assert.strictEqual(env.edhaListSharedHold([L("a", "Actor.X")], "Actor.X", null), true);
});

// --- edhaOwnerLedgers — reconcile against the MARKER status, not the ledger KEY (2bV) ---
// Order's ledger keys are plural (`covenants`/`edicts`) while the marker ids are singular
// (`covenant`/`edict`). The sweep used to pass no status, so edhaOwnerList's mark-wins filter
// checked has("covenants") — false for every correctly-marked creature — and the whole sweep read
// EMPTY: the Covenant proximity AE, the break watch and the multiOwner shared-hold all silently
// died for any entry whose uuid resolved. Mutation-checked both ways (drop the status argument in
// edhaOwnerLedgers' edhaOwnerList call and the first assertion fails).
test("edhaOwnerLedgers reconciles on the passed marker status (plural key, singular marker)", () => {
  const ally = { uuid: "Actor.ally", statuses: new Set(["covenant"]) };
  const owner = { id: "own1", type: "character", flags: { "edha-content": { lists: { covenants: [{ id: "e1", uuid: "Actor.ally", name: "Ally" }] } } } };
  const oldActors = env.game.actors, oldFrom = env.fromUuidSync;
  env.game.actors = [owner];
  env.fromUuidSync = (u) => (u === "Actor.ally" ? { actor: ally } : null);
  try {
    const swept = env.edhaOwnerLedgers("covenants", "covenant");
    assert.strictEqual(swept.length, 1, "a correctly-marked, resolvable ally must be swept");
    assert.strictEqual(swept[0].list[0].uuid, "Actor.ally");
    // The regression itself, pinned: key-as-status drops the resolvable marked entry.
    assert.strictEqual(env.edhaOwnerLedgers("covenants").length, 0,
      "no status = the pre-2bV bug — reconciling vs the KEY drops every marked entry");
  } finally { env.game.actors = oldActors; env.fromUuidSync = oldFrom; }
});

// --- edhaWatchMatches — H8's pure observation filter (07-24q) -----------------
//
// H8 lets a talent react to an event that fired on a DIFFERENT document. Everything about which
// observations count is decided here, so this is the piece worth pinning: the sweep around it needs
// a canvas and actors, this needs neither. Mutation-checked in BOTH directions on every field —
// a filter that never rejects and a filter that always rejects are both silently catastrophic
// (the first makes Crown of Thorns fire on every roll in the game; the second makes it inert).
const W = (o = {}) => ({ watch: "test", ...o });
const EV = (o = {}) => ({ kind: "test", skill: "black", def: "cog", ok: true, ...o });

test("edhaWatchMatches: a bare watch rule accepts a matching kind and rejects another", () => {
  assert.strictEqual(env.edhaWatchMatches(W(), EV()), true);
  assert.strictEqual(env.edhaWatchMatches(W(), EV({ kind: "skill-roll" })), false);
  assert.strictEqual(env.edhaWatchMatches(W({ watch: "skill-roll" }), EV({ kind: "skill-roll" })), true);
});
test("edhaWatchMatches: whenSkill is a comma-list, matched case-insensitively", () => {
  // Crown of Thorns rides Black OR Red. One field covers both atlases because leyline colours ARE
  // skill ids — the same reasoning H1's `skill` field carries.
  const h = W({ whenSkill: "black,red" });
  assert.strictEqual(env.edhaWatchMatches(h, EV({ skill: "black" })), true);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ skill: "red" })), true);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ skill: "RED" })), true, "case must not decide it");
  assert.strictEqual(env.edhaWatchMatches(h, EV({ skill: "blue" })), false);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ skill: "" })), false);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ skill: null })), false);
  assert.strictEqual(env.edhaWatchMatches(W({ whenSkill: " black , red " }), EV({ skill: "red" })), true, "authored whitespace");
});
test("edhaWatchMatches: a BLANK filter means 'any', not 'none'", () => {
  // The direction that matters: a blank field must not quietly disable the whole rule.
  for (const blank of ["", null, undefined]) {
    assert.strictEqual(env.edhaWatchMatches(W({ whenSkill: blank }), EV({ skill: "green" })), true);
    assert.strictEqual(env.edhaWatchMatches(W({ whenVs: blank }), EV({ def: "spi" })), true);
  }
});
test("edhaWatchMatches: whenVs pins the defense the observed test was against", () => {
  assert.strictEqual(env.edhaWatchMatches(W({ whenVs: "cog" }), EV({ def: "cog" })), true);
  assert.strictEqual(env.edhaWatchMatches(W({ whenVs: "cog" }), EV({ def: "phy" })), false);
  assert.strictEqual(env.edhaWatchMatches(W({ whenVs: "cog" }), EV({ def: null })), false,
    "a test with no defense is not a test vs Cognitive");
});
test("edhaWatchMatches: whenOutcome filters an observed outcome both ways", () => {
  assert.strictEqual(env.edhaWatchMatches(W({ whenOutcome: "success" }), EV({ ok: true })), true);
  assert.strictEqual(env.edhaWatchMatches(W({ whenOutcome: "success" }), EV({ ok: false })), false);
  assert.strictEqual(env.edhaWatchMatches(W({ whenOutcome: "fail" }), EV({ ok: false })), true);
  assert.strictEqual(env.edhaWatchMatches(W({ whenOutcome: "fail" }), EV({ ok: true })), false);
  // Crown of Thorns bites whether the test landed or not.
  assert.strictEqual(env.edhaWatchMatches(W({ whenOutcome: "any" }), EV({ ok: false })), true);
});
test("edhaWatchMatches: an event with NO outcome is not filtered out by whenOutcome", () => {
  // The regression this pins: a raw skill roll carries ok === null. Treating that as "not a success"
  // made Extract Thought — which rides EVERY Deception roll — fire never. whenOutcome describes the
  // OBSERVED test; the watcher's own result is expressed by which sibling rule you write.
  const h = W({ watch: "skill-roll", whenOutcome: "success" });
  assert.strictEqual(env.edhaWatchMatches(h, EV({ kind: "skill-roll", ok: null })), true);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ kind: "skill-roll", ok: undefined })), true);
});
test("edhaWatchMatches: every filter ANDs — one mismatch is enough to reject", () => {
  const h = W({ whenSkill: "black,red", whenVs: "cog", whenOutcome: "success" });
  assert.strictEqual(env.edhaWatchMatches(h, EV()), true, "all three satisfied");
  assert.strictEqual(env.edhaWatchMatches(h, EV({ skill: "blue" })), false);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ def: "spi" })), false);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ ok: false })), false);
});
test("edhaWatchMatches: a missing rule or a missing event never matches", () => {
  for (const bad of [null, undefined, 0, ""]) {
    assert.strictEqual(env.edhaWatchMatches(bad, EV()), false);
    assert.strictEqual(env.edhaWatchMatches(W(), bad), false);
  }
});
test("edhaWatchMatches: watch defaults to 'test', so an unset field is not a wildcard", () => {
  // A rule saved with no `watch` must not observe skill rolls as well — that would double-fire
  // every converted talent the moment the schema default changed.
  assert.strictEqual(env.edhaWatchMatches({}, EV({ kind: "test" })), true);
  assert.strictEqual(env.edhaWatchMatches({}, EV({ kind: "skill-roll" })), false);
});

// --- edhaWatchersOfRule — H8's hoisted sweep (07-24q) -------------------------
//
// The sweep is the reason H8 exists: neither event system fans out to N observers, so finding
// "every document carrying a rule of type X" is the primitive ~54 name-keyed sweeps hand-rolled.
// It is pinned here because the two things it must get right are both invisible until they bite —
// it must find UNLINKED adversary tokens (the W29 lesson: their synthetic actors are not in
// game.actors at all), and its memo must actually invalidate.
const talent = (rules) => ({
  type: "talent", name: "t", hasEvents: () => true,
  enabledEvents: rules.map((type) => ({ handler: { type } })),
});
const actor = (uuid, type, items) => ({ uuid, id: uuid, type, items });

function withWorld(env, { directory = [], tokens = [] }, fn) {
  const oldActors = env.game.actors, oldPlaceables = env.canvas.tokens.placeables;
  env.game.actors = directory;
  env.canvas.tokens.placeables = tokens;
  env.edhaDropRuleIndex();
  try { return fn(); } finally {
    env.game.actors = oldActors; env.canvas.tokens.placeables = oldPlaceables; env.edhaDropRuleIndex();
  }
}

test("edhaWatchersOfRule finds only documents carrying that handler type", () => {
  const watcher = actor("a1", "character", [talent(["edha-watch"]), talent(["edha-note"])]);
  const bystander = actor("a2", "character", [talent(["edha-def-test"])]);
  withWorld(env, { directory: [watcher, bystander] }, () => {
    const found = env.edhaWatchersOfRule("edha-watch");
    assert.strictEqual(found.length, 1, "one rule, not one per talent on the actor");
    assert.strictEqual(found[0].actor.uuid, "a1");
    assert.strictEqual(env.edhaWatchersOfRule("edha-def-test").length, 1);
    assert.strictEqual(env.edhaWatchersOfRule("edha-nonexistent").length, 0);
  });
});
test("edhaWatchersOfRule returns one entry per RULE, not per talent", () => {
  // A talent may legitimately carry two watches (different skills, different payloads).
  const two = actor("a1", "character", [talent(["edha-watch", "edha-watch"])]);
  withWorld(env, { directory: [two] }, () => {
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch").length, 2);
  });
});
test("edhaWatchersOfRule finds an UNLINKED adversary token not present in game.actors (W29)", () => {
  // The bug this pins shipped once already: compendium-dropped adversary tokens have synthetic
  // actors that never appear in the directory, which is how the Dirgehound Pack's veto went dead.
  const synthetic = actor("tok1", "adversary", [talent(["edha-watch"])]);
  withWorld(env, { directory: [], tokens: [{ actor: synthetic }] }, () => {
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch").length, 1);
  });
});
test("edhaWatchersOfRule does not double-count an actor that is both on canvas and in the directory", () => {
  const a = actor("a1", "character", [talent(["edha-watch"])]);
  withWorld(env, { directory: [a], tokens: [{ actor: a }] }, () => {
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch").length, 1, "deduped by actor uuid");
  });
});
test("edhaWatchersOfRule skips non-character DIRECTORY actors but keeps them via their token", () => {
  // Directory adversaries are deliberately not swept wholesale (a bestiary is not the scene);
  // an adversary that is actually ON the canvas still observes.
  const off = actor("a9", "adversary", [talent(["edha-watch"])]);
  withWorld(env, { directory: [off] }, () => {
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch").length, 0, "off-canvas bestiary entry");
  });
  withWorld(env, { directory: [off], tokens: [{ actor: off }] }, () => {
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch").length, 1, "same actor, now on the scene");
  });
});
test("edhaWatchersOfRule memoizes, and edhaDropRuleIndex actually drops it", () => {
  // Both directions matter: no memo makes the applyDamage-cadence consumers O(tokens x items x rules)
  // per hit; a memo that never clears makes a newly-added talent invisible until reload.
  const a = actor("a1", "character", [talent(["edha-watch"])]);
  withWorld(env, { directory: [a] }, () => {
    const first = env.edhaWatchersOfRule("edha-watch");
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch"), first, "same array object = memo hit");
    a.items.push(talent(["edha-watch"]));
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch").length, 1, "memo still serving the old walk");
    env.edhaDropRuleIndex();
    assert.strictEqual(env.edhaWatchersOfRule("edha-watch").length, 2, "and re-walks after a document change");
  });
});
test("edhaWatchersOfRule survives a world with no canvas and no directory", () => {
  withWorld(env, { directory: [], tokens: [] }, () => {
    assert.deepStrictEqual(JSON.parse(JSON.stringify(env.edhaWatchersOfRule("edha-watch"))), []);
  });
});

// --- edhaWatchMatches, the WIDENED vocabulary (07-24r) ------------------------
//
// H8 shipped watching two kinds. The kinds added here (`defeat`, `focus-change`) carry a NUMBER
// rather than an outcome, and `whenTotal` is how a rule filters on it. The bound that matters is
// ZERO — Predatory Insight fires when a creature reaches 0 focus — so "unset" can never be spelled
// as 0, which is the whole reason this is two fields and not a nullable number. Both directions
// pinned on every branch: a gate that never rejects makes a scene-wide passive fire on every focus
// tick in the encounter; a gate that always rejects makes it inert.
test("edhaWatchMatches: the widened kinds are matched like any other, and still do not cross-match", () => {
  assert.strictEqual(env.edhaWatchMatches(W({ watch: "defeat" }), EV({ kind: "defeat" })), true);
  assert.strictEqual(env.edhaWatchMatches(W({ watch: "focus-change" }), EV({ kind: "focus-change" })), true);
  assert.strictEqual(env.edhaWatchMatches(W({ watch: "defeat" }), EV({ kind: "focus-change" })), false);
  assert.strictEqual(env.edhaWatchMatches(W({ watch: "focus-change" }), EV({ kind: "defeat" })), false);
  assert.strictEqual(env.edhaWatchMatches(W({ watch: "test" }), EV({ kind: "defeat" })), false,
    "a converted test-watcher must not start firing on drops");
});
test("edhaWatchMatches: whenTotal 'at-most 0' is Predatory Insight, and 0 is a real bound", () => {
  // The regression this pins: treating an unset/zero bound as "no gate" would make the talent fire
  // on EVERY focus loss instead of only on the ones that empty a creature.
  const h = W({ watch: "focus-change", whenTotal: "at-most", whenTotalValue: 0 });
  const ev = (total) => EV({ kind: "focus-change", skill: null, def: null, ok: null, total });
  assert.strictEqual(env.edhaWatchMatches(h, ev(0)), true, "reached zero");
  assert.strictEqual(env.edhaWatchMatches(h, ev(1)), false, "spent one, still holding some");
  assert.strictEqual(env.edhaWatchMatches(h, ev(5)), false);
});
test("edhaWatchMatches: whenTotal 'at-least' is the other direction, boundary inclusive", () => {
  const h = W({ whenTotal: "at-least", whenTotalValue: 15 });
  assert.strictEqual(env.edhaWatchMatches(h, EV({ total: 15 })), true, "the bound itself counts");
  assert.strictEqual(env.edhaWatchMatches(h, EV({ total: 16 })), true);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ total: 14 })), false);
});
test("edhaWatchMatches: whenTotal 'any' (and unset) ignores the value entirely", () => {
  // Whispered Doubt and Coercive Pressure gate on range and disposition, never on the number.
  for (const gate of [undefined, null, "", "any"]) {
    const h = W({ watch: "focus-change", whenTotal: gate, whenTotalValue: 0 });
    for (const total of [0, 3, -2, null, undefined]) {
      assert.strictEqual(env.edhaWatchMatches(h, EV({ kind: "focus-change", total })), true,
        `gate=${gate} total=${total}`);
    }
  }
});
test("edhaWatchMatches: an UNREADABLE value cannot satisfy a numeric gate", () => {
  // Fails CLOSED here, deliberately and unlike H1's defense read: "at most 0 focus" about a creature
  // whose focus we could not read is not a fact, and a scene-wide passive that fires on non-facts is
  // the worse failure.
  const h = W({ watch: "focus-change", whenTotal: "at-most", whenTotalValue: 0 });
  for (const bad of [null, undefined, "x", NaN]) {
    assert.strictEqual(env.edhaWatchMatches(h, EV({ kind: "focus-change", total: bad })), false, String(bad));
  }
});
test("edhaWatchMatches: whenTotal ANDs with the other filters like everything else", () => {
  const h = W({ watch: "focus-change", whenTotal: "at-most", whenTotalValue: 0, whenSkill: "dec" });
  assert.strictEqual(env.edhaWatchMatches(h, EV({ kind: "focus-change", skill: "dec", total: 0 })), true);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ kind: "focus-change", skill: "ath", total: 0 })), false);
  assert.strictEqual(env.edhaWatchMatches(h, EV({ kind: "focus-change", skill: "dec", total: 2 })), false);
});

// --- edhaNextTestMatches — the "…this round" stamp (07-24r) -------------------
//
// Predatory Insight's bespoke `advTest` flag existed only because the shared nextTestMod pipeline
// could not expire at the end of a round. The stamp closes that, and `round` is a parameter so the
// decision stays pinnable with no combat object.
const RL = (skill = "dec", attribute = "int") => ({ data: { skill: { id: skill, attribute } } });

test("edhaNextTestMatches: an unstamped mod is unaffected by the round", () => {
  const mod = { mode: "advantage", count: 1 };
  assert.strictEqual(env.edhaNextTestMatches(mod, RL(), null, 3), true);
  assert.strictEqual(env.edhaNextTestMatches(mod, RL(), null, null), true);
});
test("edhaNextTestMatches: a round-stamped mod matches in its round and stops after it", () => {
  const mod = { mode: "advantage", count: 1, round: 4 };
  assert.strictEqual(env.edhaNextTestMatches(mod, RL(), null, 4), true, "granted this round");
  assert.strictEqual(env.edhaNextTestMatches(mod, RL(), null, 5), false, "the round moved on");
  assert.strictEqual(env.edhaNextTestMatches(mod, RL(), null, 3), false, "and it is not retroactive");
});
test("edhaNextTestMatches: out of combat a stamp is inert rather than blocking", () => {
  // round === null means there is no combat to have moved on; the grant must still apply.
  assert.strictEqual(env.edhaNextTestMatches({ mode: "advantage", round: 4 }, RL(), null, null), true);
  assert.strictEqual(env.edhaNextTestMatches({ mode: "advantage", round: null }, RL(), null, 7), true);
});
test("edhaNextTestMatches: the attr gate is a comma-list and it is what Cognitive means", () => {
  // Coercive Pressure's disadvantage replaced a bespoke `cogDisadv` flag whose whole content was
  // "int or wil". If this stopped filtering, the debuff would land on every test the creature makes.
  const mod = { mode: "disadvantage", attr: "int, wil" };
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("dec", "int"), null, null), true);
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("lor", "wil"), null, null), true);
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("ath", "str"), null, null), false);
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("ath", "spd"), null, null), false);
  assert.strictEqual(env.edhaNextTestMatches({ mode: "disadvantage" }, RL("ath", "str"), null, null), true,
    "no attr gate = any test");
});
test("edhaNextTestMatches: skill and attr and round all AND together", () => {
  const mod = { mode: "advantage", skill: "dec", attr: "int, wil", round: 2 };
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("dec", "int"), null, 2), true);
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("dis", "int"), null, 2), false, "wrong skill");
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("dec", "str"), null, 2), false, "wrong attribute");
  assert.strictEqual(env.edhaNextTestMatches(mod, RL("dec", "int"), null, 9), false, "wrong round");
});
test("edhaNextTestMatches: a missing mod never matches", () => {
  for (const bad of [null, undefined, 0, ""]) {
    assert.strictEqual(env.edhaNextTestMatches(bad, RL(), null, 1), false);
  }
});

// --- edhaPickAccepts / edhaParseCosts — H6's pure core (07-24s) ---------------
//
// H6 asks a question the payload then answers, so a wrong filter is invisible: the card simply
// offers the wrong names and nobody can tell it was ever meant to offer others. Both directions are
// mutation-checked below.
const C = (o = {}) => ({ disposition: 1, anchorDisposition: 1, ownerDisposition: 1, hp: 10, statuses: [], ...o });

test("edhaPickAccepts: no filters = everybody qualifies", () => {
  assert.strictEqual(env.edhaPickAccepts({}, C()), true);
  assert.strictEqual(env.edhaPickAccepts({ source: "creatures" }, C({ disposition: -1 })), true);
});
test("edhaPickAccepts: enemy/ally are relative to YOU", () => {
  assert.strictEqual(env.edhaPickAccepts({ disposition: "ally" }, C({ disposition: 1, ownerDisposition: 1 })), true);
  assert.strictEqual(env.edhaPickAccepts({ disposition: "ally" }, C({ disposition: -1, ownerDisposition: 1 })), false);
  assert.strictEqual(env.edhaPickAccepts({ disposition: "enemy" }, C({ disposition: -1, ownerDisposition: 1 })), true);
  assert.strictEqual(env.edhaPickAccepts({ disposition: "enemy" }, C({ disposition: 1, ownerDisposition: 1 })), false);
});
test("edhaPickAccepts: anchor-ally is relative to the ANCHOR, and plain ally gets it backwards", () => {
  // Unnerving Approach: I target an ENEMY, then push one of THAT enemy's allies. Those creatures are
  // hostile to me, so `ally` would offer nobody and `enemy` would also offer my own party.
  const foesFriend = C({ disposition: -1, anchorDisposition: -1, ownerDisposition: 1 });
  const myFriend = C({ disposition: 1, anchorDisposition: -1, ownerDisposition: 1 });
  assert.strictEqual(env.edhaPickAccepts({ disposition: "anchor-ally" }, foesFriend), true);
  assert.strictEqual(env.edhaPickAccepts({ disposition: "anchor-ally" }, myFriend), false);
  assert.strictEqual(env.edhaPickAccepts({ disposition: "ally" }, foesFriend), false, "the backwards reading");
  assert.strictEqual(env.edhaPickAccepts({ disposition: "anchor-enemy" }, myFriend), true);
  assert.strictEqual(env.edhaPickAccepts({ disposition: "anchor-enemy" }, foesFriend), false);
});
test("edhaPickAccepts: aliveOnly drops a downed creature, and can be turned off", () => {
  assert.strictEqual(env.edhaPickAccepts({}, C({ hp: 0 })), false);
  assert.strictEqual(env.edhaPickAccepts({}, C({ hp: -3 })), false);
  assert.strictEqual(env.edhaPickAccepts({ aliveOnly: false }, C({ hp: 0 })), true);
});
test("edhaPickAccepts: an UNREADABLE hp stays a candidate — fails OPEN, unlike whenTotal", () => {
  // The asymmetry is deliberate and is the reason both are pinned. A watch's numeric gate fails
  // CLOSED because a scene-wide passive firing on a non-fact is silent; a pick fails OPEN because
  // the worst case is one extra name on a whispered card the owner can ignore. The hand-rolled
  // Unnerving Approach read `(hea?.value ?? 1) > 0` and made the same call.
  for (const unknown of [null, undefined, "", "x", NaN]) {
    assert.strictEqual(env.edhaPickAccepts({}, C({ hp: unknown })), true, String(unknown));
  }
});
test("edhaPickAccepts: requireStatus is an OR over a comma-list", () => {
  const h = { requireStatus: "weakened, frightened" };
  assert.strictEqual(env.edhaPickAccepts(h, C({ statuses: ["weakened"] })), true);
  assert.strictEqual(env.edhaPickAccepts(h, C({ statuses: ["frightened", "prone"] })), true);
  assert.strictEqual(env.edhaPickAccepts(h, C({ statuses: ["prone"] })), false);
  assert.strictEqual(env.edhaPickAccepts(h, C({ statuses: [] })), false);
  assert.strictEqual(env.edhaPickAccepts({ requireStatus: "" }, C({ statuses: [] })), true, "blank = no filter");
});
test("edhaPickAccepts: the filters AND together", () => {
  const h = { disposition: "enemy", requireStatus: "weakened" };
  const base = { ownerDisposition: 1, anchorDisposition: 1 };
  assert.strictEqual(env.edhaPickAccepts(h, C({ ...base, disposition: -1, statuses: ["weakened"] })), true);
  assert.strictEqual(env.edhaPickAccepts(h, C({ ...base, disposition: 1, statuses: ["weakened"] })), false);
  assert.strictEqual(env.edhaPickAccepts(h, C({ ...base, disposition: -1, statuses: [] })), false);
  assert.strictEqual(env.edhaPickAccepts(h, C({ ...base, disposition: -1, statuses: ["weakened"], hp: 0 })), false);
});
test("edhaPickAccepts: a missing rule or candidate never qualifies", () => {
  assert.strictEqual(env.edhaPickAccepts(null, C()), false);
  assert.strictEqual(env.edhaPickAccepts({}, null), false);
});

test("edhaParseCosts: resource:amount pairs, in order", () => {
  eq(env.edhaParseCosts("foc:2, inv:1"), [{ resource: "foc", value: 2 }, { resource: "inv", value: 1 }]);
  eq(env.edhaParseCosts("  INV : 3  "), [{ resource: "inv", value: 3 }]);
});
test("edhaParseCosts: a bare resource name means 1", () => {
  eq(env.edhaParseCosts("foc"), [{ resource: "foc", value: 1 }]);
  eq(env.edhaParseCosts("foc, inv:2"), [{ resource: "foc", value: 1 }, { resource: "inv", value: 2 }]);
});
test("edhaParseCosts: nothing to spend parses to nothing", () => {
  for (const empty of ["", "   ", ",,", null, undefined]) eq(env.edhaParseCosts(empty), []);
});
test("edhaParseCosts: a cost that does not parse is DROPPED, never defaulted to 0", () => {
  // A silent 0 would hand out a free reaction every round and look exactly like a working card.
  eq(env.edhaParseCosts("foc:0"), []);
  eq(env.edhaParseCosts("foc:-2"), []);
  eq(env.edhaParseCosts("foc:x"), []);
  eq(env.edhaParseCosts(":4"), []);
  eq(env.edhaParseCosts("foc:0, inv:1"), [{ resource: "inv", value: 1 }], "one bad entry does not eat the good one");
});
test("edhaParseCosts: a fractional amount floors rather than charging a fraction", () => {
  eq(env.edhaParseCosts("foc:2.7"), [{ resource: "foc", value: 2 }]);
  eq(env.edhaParseCosts("foc:0.5"), [], "…and floors to nothing rather than to a free use");
});

// --- edhaIsSlowTurn — H19 (07-24y). NOT the negation of edhaIsFastTurn -------------
// edhaIsFastTurn returns false for THREE different states (no combat / no combatant / genuinely
// slow) and gets away with it because a fast-turn payoff that never fires is merely inert. Writing
// whenSlowTurn as `!edhaIsFastTurn` inverts that into a fail-OPEN bug: Calculated Patience would
// grant advantage on the first test of every out-of-combat scene. These pin the asymmetry.
const CP_ACTOR = { id: "cp1", isToken: false };
const cpCombatant = (turnSpeed) => ({
  actorId: "cp1",
  getFlag: (ns, key) => (ns === "cosmere-rpg" && key === "turnSpeed" ? turnSpeed : undefined),
});
const withCombat = (combat, fn) => {
  const old = env.game.combat;
  env.game.combat = combat;
  try { return fn(); } finally { env.game.combat = old; }
};

test("edhaIsSlowTurn: OUT OF COMBAT it is false — the fail-open case a naive !fast would get wrong", () => {
  withCombat(null, () => {
    assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), false);
    // The mutation check that matters: the naive implementation would have returned TRUE here,
    // because edhaIsFastTurn is also false out of combat. Both false is the correct answer.
    assert.strictEqual(env.edhaIsFastTurn(CP_ACTOR), false);
  });
});

test("edhaIsSlowTurn: a combat that has not STARTED is still not a slow turn", () => {
  withCombat({ started: false, combatants: [cpCombatant("slow")] }, () => {
    assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), false);
  });
});

test("edhaIsSlowTurn: in combat but NOT a combatant is false (a bystander gets no rider)", () => {
  withCombat({ started: true, combatants: [{ actorId: "someone-else", getFlag: () => undefined }] }, () => {
    assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), false);
  });
});

test("edhaIsSlowTurn: an UNSET turnSpeed in combat IS slow (the system's default is Slow)", () => {
  // The engine reads the raw combatant flag, which stays undefined until the player toggles;
  // the system's own getter is `?? TurnSpeed.Slow` and its schema initial is "slow".
  for (const unset of [undefined, null]) {
    withCombat({ started: true, combatants: [cpCombatant(unset)] }, () => {
      assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), true, `turnSpeed ${String(unset)} should read Slow`);
      assert.strictEqual(env.edhaIsFastTurn(CP_ACTOR), false);
    });
  }
});

test("edhaIsSlowTurn: an explicit slow turn is true and an explicit fast turn is false", () => {
  withCombat({ started: true, combatants: [cpCombatant("slow")] }, () => {
    assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), true);
    assert.strictEqual(env.edhaIsFastTurn(CP_ACTOR), false);
  });
  withCombat({ started: true, combatants: [cpCombatant("fast")] }, () => {
    assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), false, "fast is never slow");
    assert.strictEqual(env.edhaIsFastTurn(CP_ACTOR), true);
  });
});

test("edhaIsSlowTurn: IN combat the two predicates are exact opposites; OUT of combat both are false", () => {
  // This is the whole invariant in one case. If someone later 'simplifies' edhaIsSlowTurn to
  // `!edhaIsFastTurn`, the in-combat half keeps passing and only this out-of-combat row fails.
  for (const ts of ["slow", "fast", undefined]) {
    withCombat({ started: true, combatants: [cpCombatant(ts)] }, () => {
      assert.notStrictEqual(env.edhaIsSlowTurn(CP_ACTOR), env.edhaIsFastTurn(CP_ACTOR), `turnSpeed ${String(ts)}`);
    });
  }
  withCombat(null, () => {
    assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), env.edhaIsFastTurn(CP_ACTOR), "out of combat neither fires");
    assert.strictEqual(env.edhaIsSlowTurn(CP_ACTOR), false);
  });
});

// --- edhaSummonIsFrom / edhaOwnedSummons — H15's sustain cap (07-24y) ---------------
// Summon identity used to be a NAME PREFIX, so renaming a summon silently broke its cap and its
// riders. The flag is authoritative now; the prefix survives only as a fallback for creatures
// summoned before the flag existed, and it compares against the RULE's own summonName.
const summonActor = (o) => ({
  name: o.name,
  system: { resources: { hea: { value: o.hp === undefined ? 5 : o.hp } } },
  getFlag: (ns, k) => (ns === "edha-content" ? o.flags[k] : undefined),
});
const construct = (o = {}) => summonActor({
  name: o.name ?? "Combat Construct",
  hp: o.hp,
  flags: { summon: true, summoner: o.summoner ?? "ben", summonTalent: o.talent, summonedAt: o.at },
});

test("edhaSummonIsFrom: the flag wins when present, and a rename does NOT break it", () => {
  const renamed = construct({ name: "Clanky", talent: "Forge Construct" });
  assert.strictEqual(env.edhaSummonIsFrom(renamed, "Forge Construct", "Combat Construct"), true);
  assert.strictEqual(env.edhaSummonIsFrom(renamed, "Risen Servant", "Risen Servant"), false);
});
test("edhaSummonIsFrom: an UNSTAMPED legacy summon still matches by its rule's summonName prefix", () => {
  const legacy = construct({ name: "Combat Construct (2)", talent: undefined });
  assert.strictEqual(env.edhaSummonIsFrom(legacy, "Forge Construct", "Combat Construct"), true);
  assert.strictEqual(env.edhaSummonIsFrom(legacy, "Forge Construct", "Risen Servant"), false);
  assert.strictEqual(env.edhaSummonIsFrom(legacy, "Forge Construct", ""), false, "no summonName = no fallback, never a blanket match");
});

test("edhaOwnedSummons: counts only MY live summons of THIS talent", () => {
  const old = env.game.actors;
  env.game.actors = [
    construct({ talent: "Forge Construct", at: 100 }),
    construct({ talent: "Forge Construct", summoner: "someone-else", at: 101 }),   // not mine
    construct({ talent: "Risen Servant", name: "Risen Servant", at: 102 }),        // different talent
    construct({ talent: "Forge Construct", at: 103, hp: 0 }),                      // dead
  ];
  try {
    const got = env.edhaOwnedSummons({ id: "ben" }, "Forge Construct", "Combat Construct");
    assert.strictEqual(got.length, 1);
  } finally { env.game.actors = old; }
});

test("edhaOwnedSummons: returns OLDEST FIRST, and un-stamped legacy summons sort as oldest", () => {
  // replaceOldest dismisses from the front of this list, so the order is load-bearing:
  // before 07-24y nothing stamped a creation time and `.find()` was only ever correct at cap 1.
  const old = env.game.actors;
  env.game.actors = [
    construct({ name: "Combat Construct newest", talent: "Forge Construct", at: 300 }),
    construct({ name: "Combat Construct legacy", talent: undefined, at: undefined }),   // unstamped -> 0
    construct({ name: "Combat Construct mid", talent: "Forge Construct", at: 200 }),
  ];
  try {
    const got = env.edhaOwnedSummons({ id: "ben" }, "Forge Construct", "Combat Construct");
    eq(got.map((a) => a.name), ["Combat Construct legacy", "Combat Construct mid", "Combat Construct newest"]);
  } finally { env.game.actors = old; }
});

// --- edhaRulesForEvent — H20's dispatch selection (07-24y) --------------------------
// The Draw Mana riders live on the Attunement Keys' own documents now, reached by the
// `edha-draw-mana` event. These pin the selection, because the dispatch itself is async and
// this runner is synchronous.
const evTalent = (name, rules) => ({ type: "talent", name, hasEvents: () => true, enabledEvents: rules });

test("edhaRulesForEvent: picks only rules on the named event", () => {
  const t = evTalent("Blue Leyline Attunement", [
    { event: "edha-draw-mana", handler: { type: "edha-next-test-mod" } },
    { event: "use", handler: { type: "edha-note" } },
    { event: "edha-pre-test", handler: { type: "edha-test-rider" } },
  ]);
  const got = env.edhaRulesForEvent({ items: [t] }, "edha-draw-mana");
  assert.strictEqual(got.length, 1);
  assert.strictEqual(got[0].rule.handler.type, "edha-next-test-mod");
  assert.strictEqual(got[0].item.name, "Blue Leyline Attunement");
});

test("edhaRulesForEvent: skips non-talent items entirely", () => {
  // A weapon carrying a same-named rule must not fire an Attunement rider.
  const weapon = { type: "weapon", name: "Sword", hasEvents: () => true,
    enabledEvents: [{ event: "edha-draw-mana", handler: { type: "edha-note" } }] };
  eq(env.edhaRulesForEvent({ items: [weapon] }, "edha-draw-mana"), []);
});

test("edhaRulesForEvent: `order` sorts within a talent — Red's reminder follows Red's grant", () => {
  const red = evTalent("Red Leyline Attunement", [
    { event: "edha-draw-mana", order: 1, handler: { type: "edha-note" } },
    { event: "edha-draw-mana", handler: { type: "edha-next-test-mod" } },
  ]);
  const got = env.edhaRulesForEvent({ items: [red] }, "edha-draw-mana");
  eq(got.map((g) => g.rule.handler.type), ["edha-next-test-mod", "edha-note"]);
});

test("edhaRulesForEvent: an actor with no items, or a broken one, yields nothing rather than throwing", () => {
  eq(env.edhaRulesForEvent(null, "edha-draw-mana"), []);
  eq(env.edhaRulesForEvent({}, "edha-draw-mana"), []);
  eq(env.edhaRulesForEvent({ items: [{ type: "talent", hasEvents: () => { throw new Error("boom"); } }] }, "edha-draw-mana"), []);
});

test("edhaRulesForEvent: gathers across several talents, so two Keys both fire", () => {
  const blue = evTalent("Blue Leyline Attunement", [{ event: "edha-draw-mana", handler: { type: "edha-next-test-mod" } }]);
  const red = evTalent("Red Leyline Attunement", [{ event: "edha-draw-mana", handler: { type: "edha-next-test-mod" } }]);
  const got = env.edhaRulesForEvent({ items: [blue, red] }, "edha-draw-mana");
  eq(got.map((g) => g.item.name), ["Blue Leyline Attunement", "Red Leyline Attunement"]);
});

test("edhaIsSlowTurn: a token actor matches its combatant by tokenId, not actorId", () => {
  const tokActor = { id: "world-actor", isToken: true, token: { id: "tok9" } };
  const byToken = { tokenId: "tok9", actorId: "someone-else", getFlag: () => "slow" };
  withCombat({ started: true, combatants: [byToken] }, () => {
    assert.strictEqual(env.edhaIsSlowTurn(tokActor), true);
  });
});

// --- edhaFillReactTemplate (H26, 07-25) ---------------------------------------
test("edhaFillReactTemplate fills every placeholder", () => {
  const out = env.edhaFillReactTemplate(
    "{roller} tested {skill} → {total}. +{mod} → {boosted} ({owner})",
    { rollerName: "Kal", ownerName: "Ben", total: 12, skillId: "dis", mod: 3, boosted: 15 });
  assert.strictEqual(out, "Kal tested DIS → 12. +3 → 15 (Ben)");
});
test("edhaFillReactTemplate: skill-less rolls read TEST, empty template stays empty", () => {
  assert.strictEqual(env.edhaFillReactTemplate("{skill}", { skillId: null }), "TEST");
  assert.strictEqual(env.edhaFillReactTemplate("", { rollerName: "x" }), "");
  assert.strictEqual(env.edhaFillReactTemplate(null, {}), "");
});
test("edhaFillReactTemplate repeats a placeholder everywhere it appears", () => {
  assert.strictEqual(env.edhaFillReactTemplate("{mod}+{mod}", { mod: 2 }), "2+2");
});

// --- edhaSubstRankTier (H2 zone family, 07-25 pass 2bS) -----------------------
test("edhaSubstRankTier resolves @colorRank and @tier, leaves roll-data refs alone", () => {
  assert.strictEqual(
    env.edhaSubstRankTier("floor(((@tier)d(2 * @colorRank + 2)) / 2) + @skills.green.mod", 2, 1),
    "floor(((1)d(2 * 2 + 2)) / 2) + @skills.green.mod");
});
test("edhaSubstRankTier does not touch longer identifiers (@tierX) and survives null", () => {
  assert.strictEqual(env.edhaSubstRankTier("@tierX + @colorRankY", 3, 2), "@tierX + @colorRankY");
  assert.strictEqual(env.edhaSubstRankTier(null, 1, 1), "");
});
test("edhaSubstRankTier end-to-end: substituted thorn formula folds to half [Tier][Die]", () => {
  const f = env.edhaSubstRankTier("floor(((@tier)d(2 * @colorRank + 2)) / 2)", 3, 1);
  assert.strictEqual(env.Roll.replaceFormulaData(f, {}, { missing: "0" }), "floor(((1)d(2 * 3 + 2)) / 2)");
});

// --- the `snares` repoint (07-25 pass 2bX): POINT-BOUND entries fail OPEN -----
// Fate's snares carry no uuid and NO marker status, so H3's mark-wins reconcile must KEEP every
// entry (the covenants fail-open convention — there is nothing to pass), while the scene filter
// still hides another scene's traps. Getting either wrong silently empties a live trap field.
test("edhaOwnerList keeps point-bound entries (no uuid) and scene-filters them (the snares shape)", () => {
  const oldScene = env.canvas.scene;
  env.canvas.scene = { id: "S1", grid: { size: 100, distance: 5 } };
  try {
    const owner = { flags: { "edha-content": { lists: { snares: [
      { id: "a", sceneId: "S1", x: 100, y: 100, inevitable: false },
      { id: "b", sceneId: "S2", x: 200, y: 200, inevitable: false },
    ] } } } };
    eq(env.edhaOwnerList(owner, "snares").map(e => e.id), ["a"]);
  } finally { env.canvas.scene = oldScene; }
});

// --- edhaQuarryOf — the quarry adapter over the H3 ledger (07-25 pass 2bX) ----
// The covenants-style accessor repoint did NOT transfer here (the 07-24v correction): the stored
// shape changed from a bare uuid STRING to an entry array, so this adapter is the whole bridge.
// The newest entry wins (cap 1 makes it the only one, but a mid-write cap-2 moment must not
// return the doomed older mark), and an empty/unset ledger reads null, never undefined-crash.
test("edhaQuarryOf: newest entry wins; empty and unset read null (the string→array bridge)", () => {
  const oldScene = env.canvas.scene;
  env.canvas.scene = { id: "S1", grid: { size: 100, distance: 5 } };
  try {
    const owner = { flags: { "edha-content": { lists: { quarry: [
      { id: "a", uuid: "Actor.old", name: "Old" },
      { id: "b", uuid: "Actor.new", name: "New" },
    ] } } } };
    assert.strictEqual(env.edhaQuarryOf(owner), "Actor.new");
    assert.strictEqual(env.edhaQuarryOf({ flags: { "edha-content": { lists: { quarry: [] } } } }), null);
    assert.strictEqual(env.edhaQuarryOf({}), null);
    assert.strictEqual(env.edhaQuarryOf(null), null);
  } finally { env.canvas.scene = oldScene; }
});

// --- edhaLinkedSquareNear — the Weave spring-watch gate (07-25 pass 2bX) ------
// The `linked` annotation had one write and ZERO reads pre-2bX; this is its first reader. Only
// entries explicitly linked === true count, and only within the radius — a truthy-but-not-true
// value must not count, and a garbage list must answer false rather than throw mid-spring.
test("edhaLinkedSquareNear: linked-within hits; unlinked, far, non-true and garbage do not", () => {
  const L = [{ x: 0, y: 0, linked: true }, { x: 1000, y: 0, linked: true }, { x: 10, y: 0 }];
  assert.strictEqual(env.edhaLinkedSquareNear(L, 50, 0, 100), true);
  assert.strictEqual(env.edhaLinkedSquareNear([{ x: 10, y: 0 }], 0, 0, 100), false, "unlinked never counts");
  assert.strictEqual(env.edhaLinkedSquareNear([{ x: 500, y: 0, linked: true }], 0, 0, 100), false, "beyond radius");
  assert.strictEqual(env.edhaLinkedSquareNear([{ x: 0, y: 0, linked: 1 }], 0, 0, 100), false, "linked must be === true");
  assert.strictEqual(env.edhaLinkedSquareNear(null, 0, 0, 100), false, "garbage list");
});

// --- edhaTargetFormula + edhaNormalizeDie — H17, the target-scoped resolver (2bZ) ---
// Every other @-ref in the project resolves against the OWNER; these two are why "heal the
// TARGET's recovery die" (Galvanize, Field Medicine) spent four passes engine-owned. The
// resolver substitutes @target.* BEFORE the Roll sees the formula, so the owner-scoped rest
// still resolves normally; an unreadable target path becomes 0 (smaller heal, never a crash).
test("edhaTargetFormula: @target.recoveryDie becomes the die spec; owner refs pass through", () => {
  assert.strictEqual(
    env.edhaTargetFormula("@target.recoveryDie + @skills.med.rank", {}, "1d8"),
    "1d8 + @skills.med.rank");
  assert.strictEqual(env.edhaTargetFormula("@tier + 1", { tier: 9 }, "1d8"), "@tier + 1",
    "a formula with no @target ref is untouched");
});
test("edhaTargetFormula: @target.<path> reads the target's roll data; unreadable paths read 0", () => {
  const td = { skills: { med: { rank: 3 } }, tier: 2 };
  assert.strictEqual(env.edhaTargetFormula("@target.skills.med.rank + @target.tier", td, "1d8"), "3 + 2");
  assert.strictEqual(env.edhaTargetFormula("@target.no.such.path", td, "1d8"), "0", "missing path fails to 0");
  assert.strictEqual(env.edhaTargetFormula("@target.skills", td, "1d8"), "0", "a non-numeric read fails to 0");
  assert.strictEqual(env.edhaTargetFormula(null, null, null), "", "garbage in, empty string out");
});
test("edhaNormalizeDie: bare die prefixes 1; NdM passes; object/garbage falls back to 1d8", () => {
  assert.strictEqual(env.edhaNormalizeDie("d8"), "1d8");
  assert.strictEqual(env.edhaNormalizeDie("D10"), "1d10", "case folds");
  assert.strictEqual(env.edhaNormalizeDie("2d6"), "2d6");
  assert.strictEqual(env.edhaNormalizeDie(""), "1d8");
  assert.strictEqual(env.edhaNormalizeDie(undefined), "1d8");
  assert.strictEqual(env.edhaNormalizeDie({ value: "d8" }), "1d8",
    "an object-shaped die field degrades to the default, never '[object Object]' in a Roll");
  assert.strictEqual(env.edhaNormalizeDie("d8", "1d6"), "1d8", "explicit fallback only used when needed");
  assert.strictEqual(env.edhaNormalizeDie("potato", "1d6"), "1d6");
});
