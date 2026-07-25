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
// edhaCharacterOwnersOf filtered type "character", so every name-scan passive (Dread Presence,
// Shield Wall, the focus watcher) was DEAD on adversary owners — the W28 Dirgehound Pack shipped
// its headline veto that way. edhaOwnersOf must see: character actors, adversary actors in
// game.actors, and UNLINKED adversary token copies that exist only on the canvas.
test("edhaOwnersOf: sees character, adversary, and unlinked-token owners; dedupes; skips non-owners", () => {
  const talent = (n) => ({ name: n, type: "talent" });
  const advTalent = (n) => ({ name: n, flags: { "edha-content": { adversaryTalent: true } } });
  const pc = { id: "pc1", type: "character", items: [talent("Dread Presence")] };
  const linkedAdv = { id: "adv1", type: "adversary", items: [advTalent("Dread Presence")] };
  const bystander = { id: "adv2", type: "adversary", items: [advTalent("Sapping Hex")] };
  const tokenAdv = { id: "adv3", type: "adversary", items: [advTalent("Dread Presence")] };
  env.game = { actors: [pc, linkedAdv, bystander] };
  env.canvas = { tokens: { placeables: [ { actor: tokenAdv }, { actor: linkedAdv }, { actor: null } ] } };
  const owners = env.edhaOwnersOf("Dread Presence");
  assert.deepStrictEqual(owners.map(o => o.id).sort(), ["adv1", "adv3", "pc1"], "all three surfaces, deduped");
  assert.ok(!owners.includes(bystander), "non-owner adversary excluded");
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
