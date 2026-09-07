/* ITEM 77 (2026-09-06) — the batch-1 corollary at the ACTOR-level sites the `dispoFailOpen`
 * ratchet never counted: `!edhaSameDisposition(owner, tok)` is NOT `edhaDisposHostile(owner, actor)`.
 *
 * Both helpers fail CLOSED (R-63): an unresolvable side is neither "same" nor "hostile". A branch
 * that wants ENEMIES but is written `if (same) continue` therefore lets an unset-disposition token
 * THROUGH — the exact re-widening item 10 batch 1 found on the splash and burst filters, at a site
 * outside the ratchet because it reads through the actor-level helper instead of a `?? 1` literal.
 *
 * Six sites carried the shape; every pin below drives the real function with the two helpers left
 * REAL (only the world around them is stubbed), so each fails under reversion of its own site:
 *   · 47-power.js  edhaTestAuraApply       — `affects: "enemies"` (Mantle of the Aspirant's aura)
 *   · 32-senses    edhaVeilSuppressed      — hostile tokens only (Natural Order)
 *   · 12-contest   edhaTestReactWatch      — `rollerIs: "enemy"` (Voice of Authority)
 *   · 42-chaos     edhaChaosShatterPrompt  — enemies only (Shatter Focus)
 *   · 53-native    edha-def-test skipIfAlly — the WILLING bypass (Death Ward) — the mirror image:
 *                                            `!edhaDisposHostile` read an unresolved target as willing
 *   · 53-native    EdhaFateSnareRegionBehavior — pinned in tests/snare-arm-under.test.js
 */
"use strict";
const assert = require("assert");
const { loadEngine, loadHandlerRegistry, mockActor, mockItem, stageWorld, withStubs, captureChat } = require("./harness.js");

const HOSTILE = -1, FRIENDLY = 1;

// An actor with ONE canvas token. `disposition === undefined` → the token document carries no
// disposition at all: the genuinely unset side R-63 is about.
let _n = 0;
function tokened(name, disposition, extra = {}) {
  const actor = mockActor({ name, id: `${name}-${++_n}`, ...extra });
  const tok = { id: `tok-${_n}`, actor, center: { x: 0, y: 0 }, document: disposition === undefined ? {} : { disposition } };
  actor.getActiveTokens = () => [tok];
  actor.getRollData = () => ({});
  return { actor, tok };
}

/* ---------------- 47-power.js — the named site: the test aura's ally/enemy filter ---------------- */

async function auraApplied(env, affects, rollerDisposition) {
  const owner = tokened("Owner", FRIENDLY), roller = tokened("Roller", rollerDisposition);
  const roll = { terms: [] };
  const T = { OperatorTerm: class { constructor(o) { Object.assign(this, o); } }, NumericTerm: class { constructor(o) { Object.assign(this, o); } } };
  const priorDice = env.foundry.dice, priorGetFormula = env.Roll.getFormula;
  env.foundry.dice = { terms: T };
  env.Roll.getFormula = () => "1d20 + 1";
  try {
    await withStubs(env, {
      edhaWatchersOfRule: (type) => type === "edha-test-aura" ? [{ actor: owner.actor, item: { name: "Mantle of the Aspirant" }, handler: { affects, rangeFt: 30, amountFormula: "1" } }] : [],
      edhaD20RollActor: () => roller.actor,
      edhaTokensWithin: () => [roller.tok],
      edhaEvalSync: () => 1,
    }, () => env.edhaTestAuraApply(roll, null, {}));
  } finally { env.foundry.dice = priorDice; env.Roll.getFormula = priorGetFormula; }
  return roll.terms.length > 0;
}

test("test aura `affects: enemies` — a HOSTILE roller gets the bonus (control)", async () => {
  assert.strictEqual(await auraApplied(loadEngine(), "enemies", HOSTILE), true);
});

test("test aura `affects: allies` — a same-side roller gets the bonus, a hostile one does not (control)", async () => {
  const env = loadEngine();
  assert.strictEqual(await auraApplied(env, "allies", FRIENDLY), true);
  assert.strictEqual(await auraApplied(env, "allies", HOSTILE), false);
});

test("test aura — a roller whose side did NOT resolve is omitted from `enemies` AND from `allies` (item 77: was `if (same) continue`, which let it through `enemies`)", async () => {
  const env = loadEngine();
  assert.strictEqual(await auraApplied(env, "enemies", undefined), false, "unset side must not read as an enemy");
  assert.strictEqual(await auraApplied(env, "allies", undefined), false, "unset side must not read as an ally");
});

/* ---------------- 32-senses — the dark-veil suppression: hostile tokens only ---------------- */

async function veilSuppressed(env, walkerDisposition) {
  const owner = tokened("Owner", FRIENDLY), walker = tokened("Walker", walkerDisposition);
  return withStubs(env, {
    edhaWatchersOfRule: (type) => type === "edha-suppress-veil" ? [{ actor: owner.actor, handler: {} }] : [],
    edhaAttuneFtColor: () => 30,
    edhaTokensWithin: () => [walker.tok],
  }, () => env.edhaVeilSuppressed(walker.tok));
}

test("veil suppression — a HOSTILE token in range is suppressed; a same-side one is not (control)", async () => {
  const env = loadEngine();
  assert.strictEqual(await veilSuppressed(env, HOSTILE), true);
  assert.strictEqual(await veilSuppressed(env, FRIENDLY), false);
});

test("veil suppression — a token whose side did NOT resolve is NOT suppressed (item 77: was `if (same) continue`)", async () => {
  assert.strictEqual(await veilSuppressed(loadEngine(), undefined), false);
});

/* ---------------- 12-contest — edha-test-react `rollerIs: "enemy"` ---------------- */

async function voiceCardPosted(env, rollerIs, rollerDisposition) {
  const owner = tokened("Owner", FRIENDLY), roller = tokened("Roller", rollerDisposition);
  const posted = [];
  const world = stageWorld(env, { users: Object.assign([], { activeGM: { isSelf: true } }), user: { isGM: true, id: "gm1" } });
  try {
    await withStubs(env, {
      edhaWatchersOfRule: (type) => type === "edha-test-react" ? [{ actor: owner.actor, item: { name: "Voice of Authority" }, handler: { rollerIs, rolls: "attack", action: "disadvantage-reroll" } }] : [],
      edhaD20RollActor: () => roller.actor,
      edhaPostVoiceCard: (o, name) => { posted.push(name); },
    }, () => env.edhaTestReactWatch("attack", { total: 12 }, null, {}));
  } finally { world.undo(); }
  return posted.length > 0;
}

test("edha-test-react — `rollerIs: enemy` reacts to a HOSTILE roller, `rollerIs: ally` to a same-side one (control)", async () => {
  const env = loadEngine();
  assert.strictEqual(await voiceCardPosted(env, "enemy", HOSTILE), true);
  assert.strictEqual(await voiceCardPosted(env, "enemy", FRIENDLY), false);
  assert.strictEqual(await voiceCardPosted(env, "ally", FRIENDLY), true);
  assert.strictEqual(await voiceCardPosted(env, "ally", HOSTILE), false);
});

test("edha-test-react — a roller whose side did NOT resolve matches NEITHER `rollerIs` value (item 77: the `enemy` branch skipped on `sameSide`)", async () => {
  const env = loadEngine();
  assert.strictEqual(await voiceCardPosted(env, "enemy", undefined), false);
  assert.strictEqual(await voiceCardPosted(env, "ally", undefined), false);
});

/* ---------------- 42-chaos — the Shatter Focus auto-prompt: enemies only ---------------- */

async function shatterPrompted(env, bearerDisposition) {
  const owner = tokened("Owner", FRIENDLY);
  const bearer = tokened("Bearer", bearerDisposition, { statuses: ["omen"], flags: { markedBy: { omen: { actorId: null } } } });
  bearer.actor.flags["edha-content"].markedBy.omen.actorId = owner.actor.id;
  const cards = captureChat(env);
  const world = stageWorld(env, { actors: [owner.actor, bearer.actor] });
  try {
    await withStubs(env, {
      edhaD20RollActor: () => bearer.actor,
      edhaActorRulesOf: (a, type) => (a === owner.actor && type === "edha-reroll-react") ? [{ item: { id: "shatter", name: "Shatter Focus" }, handler: { markStatus: "omen" } }] : [],
      edhaShatterPromptGate: () => true,
      edhaWhisperIds: () => [],
      edhaConditionLabel: () => "Omen",
    }, () => env.edhaChaosShatterPrompt({ total: 9 }, null, {}));
  } finally { world.undo(); }
  return cards.length > 0;
}

test("shatter prompt — a HOSTILE omen-bearer prompts, a same-side one does not (control)", async () => {
  const env = loadEngine();
  assert.strictEqual(await shatterPrompted(env, HOSTILE), true);
  assert.strictEqual(await shatterPrompted(env, FRIENDLY), false);
});

test("shatter prompt — a bearer whose side did NOT resolve does not prompt (item 77: was `if (same) continue`)", async () => {
  assert.strictEqual(await shatterPrompted(loadEngine(), undefined), false);
});

/* ---------------- 53-native — edha-def-test `skipIfAlly`: the WILLING bypass (the mirror image) ---------------- */

async function willingBypass(env, targetDisposition) {
  const { handlers } = loadHandlerRegistry(env);
  const def = handlers.find(h => h.type === "edha-def-test");
  assert.ok(def?.executor, "edha-def-test executor registered");
  const owner = tokened("Owner", FRIENDLY), target = tokened("Target", targetDisposition);
  const item = mockItem({ name: "Death Ward", actor: owner.actor });
  const outcome = { bypassed: 0, tested: 0 };
  captureChat(env);
  await withStubs(env, {
    edhaUserTargetToken: () => target.tok,
    edhaDispatchTestResult: async () => { outcome.bypassed++; return true; },
    edhaQueueContest: () => { outcome.tested++; },
  }, () => def.executor.call({ skipIfAlly: true, vs: "skill", skill: "dis", requireTarget: true }, { item }));
  return outcome;
}

test("skipIfAlly — a SAME-side target is willing (no test); a HOSTILE one still tests (control)", async () => {
  const env = loadEngine();
  assert.deepStrictEqual(await willingBypass(env, FRIENDLY), { bypassed: 1, tested: 0 });
  assert.deepStrictEqual(await willingBypass(env, HOSTILE), { bypassed: 0, tested: 1 });
});

test("skipIfAlly — a target whose side did NOT resolve is NOT willing: it tests (item 77: `!edhaDisposHostile` read it as an ally and skipped the test)", async () => {
  assert.deepStrictEqual(await willingBypass(loadEngine(), undefined), { bypassed: 0, tested: 1 });
});
