/* REGRESSION — the OUT-OF-COMBAT GATE (ruling R-4, TODO_REPO_HYGIENE #28a, 2026-09-06).
 *
 * Ben answered R-4 on 2026-09-05 ("go with your recommendations"): gate scene/turn-keyed watches on
 * an ACTIVE combat containing the owner. Every run of both bench marathons saw some face of the
 * family this retires — per-round ledgers that never reset, "Restrained until your next turn" that
 * never expires, every rule-owner on the scene watching everything, an adversary's own ability cost
 * taxed by enemy watches.
 *
 * The root cause is one read repeated ~60 times: **`game.combat` is the CLIENT'S VIEWED combat**,
 * not the owner's and not necessarily an active one (bench run 27). It is `null` when nobody has the
 * tracker open, and it is the WRONG combat whenever two are live. `edhaInActiveCombat(actor)` asks
 * the real question instead — which started/active combat is this creature a combatant of?
 *
 * ⚠ THIS FILE MUST PIN BOTH DIRECTIONS, and that is the whole reason it exists. A gate that
 * silenced everything would pass a one-sided "does not fire out of combat" suite, and #28a's named
 * risk is exactly that: **wrongly silencing a legitimate out-of-combat rule**. So every case below
 * comes in a pair — the turn-keyed thing must go quiet out of combat AND the out-of-combat thing
 * must still fire.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, stageWorld, sleep, eq } = require("./harness.js");

/* A combat stub shaped like Foundry's: `combatants` is the membership, `turns` the ordered view of
 * the same documents, and BOTH are populated (the engine reads either, depending on the site). */
function makeCombat(id, actors, { round = 3, turn = 0, started = true, active = true } = {}) {
  const members = actors.map((a) => ({ actor: a, actorId: a.id, tokenId: a.token?.id ?? null }));
  return { id, started, active, round, turn, combatants: members, turns: members };
}
function actorNamed(name, opts = {}) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, ...opts });
  a.getActiveTokens = () => [];
  a.isOwner = true;
  return a;
}

/* ---- 1. the gate helper itself — the pinned decision table ------------------------------------- */

test("edhaInActiveCombat: the OWNER's combat, never the viewed one", () => {
  const env = loadEngine();
  const inFight = actorNamed("InFight"), bystander = actorNamed("Bystander"), other = actorNamed("Other");
  const mine = makeCombat("c1", [inFight]);
  const theirs = makeCombat("c2", [other]);
  const undo = stageWorld(env, { combats: [theirs, mine] });   // `theirs` FIRST: order must not decide
  try {
    // The viewed combat is the OTHER table's. That used to be the only combat any of these sites saw.
    env.game.combat = theirs;
    assert.strictEqual(env.edhaInActiveCombat(inFight), mine, "a combatant resolves to its OWN combat");
    assert.strictEqual(env.edhaInActiveCombat(other), theirs, "…and so does the other table's");
    assert.strictEqual(env.edhaInActiveCombat(bystander), null, "a non-combatant is in no combat");
    assert.strictEqual(env.edhaInActiveCombat(null), null, "no actor = no combat, never a throw");

    // Round/turn READS require `started`; membership alone does not.
    assert.strictEqual(env.edhaCombatRoundOf(inFight), 3);
    assert.strictEqual(env.edhaCombatRoundOf(bystander), null, "no combat = no round (NOT 0)");
    assert.strictEqual(env.edhaTurnSeqOf(inFight), env.edhaTurnSeq(3, 0));
    assert.strictEqual(env.edhaTurnSeqOf(bystander), null);
  } finally { undo.undo(); env.game.combat = null; }
});

test("edhaInActiveCombat: unstarted-but-active counts as combat; a dead combat does not", () => {
  const env = loadEngine();
  const a = actorNamed("A");
  const staged = makeCombat("c1", [a], { started: false, active: true, round: 0 });
  let undo = stageWorld(env, { combats: [staged] });
  try {
    assert.strictEqual(env.edhaInActiveCombat(a), staged,
      "initiative not rolled yet is still 'in combat' — the generous direction");
    assert.strictEqual(env.edhaCombatRoundOf(a), null, "…but an unstarted combat has no round to key on");
  } finally { undo.undo(); }
  const dead = makeCombat("c1", [a], { started: false, active: false });
  undo = stageWorld(env, { combats: [dead] });
  try {
    assert.strictEqual(env.edhaInActiveCombat(a), null, "neither started nor active = not in combat");
  } finally { undo.undo(); }
});

test("edhaInActiveCombat matches GENEROUSLY — token id, actor id, or combatant actor uuid", () => {
  const env = loadEngine();
  // An unlinked token actor: `isToken` with its own token id, sharing `id` with its directory twin.
  const tokenActor = actorNamed("Twin"); tokenActor.isToken = true; tokenActor.token = { id: "tok-9" };
  const byToken = { id: "c1", started: true, active: true, round: 1, turn: 0,
    combatants: [{ actorId: null, tokenId: "tok-9" }], turns: [] };
  let undo = stageWorld(env, { combats: [byToken] });
  try { assert.strictEqual(env.edhaInActiveCombat(tokenActor), byToken, "token id alone must match"); }
  finally { undo.undo(); }

  const uuidOnly = { id: "c2", started: true, active: true, round: 1, turn: 0,
    combatants: [{ actorId: null, tokenId: null, actor: { uuid: "Actor.Twin" } }], turns: [] };
  undo = stageWorld(env, { combats: [uuidOnly] });
  try { assert.strictEqual(env.edhaInActiveCombat(tokenActor), uuidOnly, "a resolved combatant uuid must match"); }
  finally { undo.undo(); }
});

/* ---- 2. the scene-scope watch gate — BOTH directions ------------------------------------------- */

test("edhaWatchCombatGate: scene-scope is gated, self-scope NEVER is", () => {
  const env = loadEngine();
  const watcher = actorNamed("Watcher"), subject = actorNamed("Subject");
  const combat = makeCombat("c1", [watcher, subject]);
  const undo = stageWorld(env, { combats: [combat] });
  try {
    assert.strictEqual(env.edhaWatchCombatGate({ scope: "scene" }, watcher, subject), true,
      "in the same combat, a scene watcher fires exactly as before");
  } finally { undo.undo(); }

  // ── OUT OF COMBAT — no combats in the world at all.
  const none = stageWorld(env, { combats: [] });
  try {
    assert.strictEqual(env.edhaWatchCombatGate({ scope: "scene" }, watcher, subject), false,
      "R-4: a scene-scoped watcher must NOT fire out of combat (the cross-talk face)");
    // THE OTHER DIRECTION — this is what stops the gate becoming a silencer.
    assert.strictEqual(env.edhaWatchCombatGate({ scope: "self" }, watcher, watcher), true,
      "a SELF-scoped watch is legitimate out of combat and must still fire");
    assert.strictEqual(env.edhaWatchCombatGate({}, watcher, watcher), true,
      "scope defaults to self — an unset scope must not be gated");
    assert.strictEqual(env.edhaWatchCombatGate({ scope: "scene", outOfCombat: true }, watcher, subject), true,
      "the authored opt-out un-gates a scene rule that really does work out of combat");
  } finally { none.undo(); }
});

test("edhaWatchCombatGate: a watcher in ANOTHER combat does not react to this one", () => {
  const env = loadEngine();
  const watcher = actorNamed("Watcher"), subject = actorNamed("Subject"), lone = actorNamed("Lone");
  const mine = makeCombat("c1", [watcher]);
  const theirs = makeCombat("c2", [subject]);
  const undo = stageWorld(env, { combats: [mine, theirs] });
  try {
    assert.strictEqual(env.edhaWatchCombatGate({ scope: "scene" }, watcher, subject), false,
      "two tables at once: the other encounter's events are not yours");
    assert.strictEqual(env.edhaWatchCombatGate({ scope: "scene" }, watcher, lone), true,
      "a subject in NO combat is the uncertain case — it fires (fail toward today's behaviour)");
  } finally { undo.undo(); }
});

test("the real dispatcher honours the gate — a scene watcher goes quiet out of combat, a self one does not", async () => {
  const env = loadEngine();
  const fired = [];
  const rule = (scope) => ({ event: "edha-watch-rule", handler: {
    type: "edha-watch", watch: "defeat", scope, payloadTarget: "actor",
    vs: "none", whenOutcome: "any", whenTotal: "any", once: "no" } });
  const payload = { event: "edha-test-success", order: 0, handler: {
    type: "edha-triggered-effect", execute: async ({ item }) => { fired.push(item.name); } } };
  const mkTalent = (name, scope) => ({ type: "talent", name, uuid: `Item.${name}`, id: name,
    hasEvents: () => true, enabledEvents: [rule(scope), payload] });

  const sceneOwner = actorNamed("SceneOwner"); sceneOwner.items = [mkTalent("SceneRule", "scene")];
  const selfOwner  = actorNamed("SelfOwner");  selfOwner.items  = [mkTalent("SelfRule", "self")];
  const victim = actorNamed("Victim");
  const ev = (owner) => ({ kind: "defeat", owner, victim: null, skill: null, def: null, ok: null, total: 0, chainBounded: true });

  // ── OUT OF COMBAT: the scene rule must not fire; the self rule (owner IS the subject) must.
  let undo = stageWorld(env, { actors: [sceneOwner, selfOwner], combats: [] });
  try {
    env.edhaDropRuleIndex();
    await env.edhaDispatchWatchers(ev(victim));       // somebody else's defeat
    await env.edhaDispatchWatchers(ev(selfOwner));    // the self-watcher's own event
    await sleep(0);
    assert.ok(!fired.includes("SceneRule"), `the scene rule must be silent out of combat — fired [${fired}]`);
    assert.ok(fired.includes("SelfRule"), `the self rule must STILL fire out of combat — fired [${fired}]`);
  } finally { undo.undo(); }

  // ── IN COMBAT: the scene rule is back, unchanged.
  fired.length = 0;
  const combat = makeCombat("c1", [sceneOwner, selfOwner, victim]);
  undo = stageWorld(env, { actors: [sceneOwner, selfOwner], combats: [combat] });
  try {
    env.edhaDropRuleIndex();
    await env.edhaDispatchWatchers(ev(victim));
    await sleep(0);
    assert.ok(fired.includes("SceneRule"), `in combat the scene rule fires exactly as before — fired [${fired}]`);
  } finally { undo.undo(); }
});

/* ---- 3. per-round ledgers — "never reset" ------------------------------------------------------ */

test("once-per-round gates read the OWNER's combat, not the viewed one", async () => {
  const env = loadEngine();
  const owner = actorNamed("Owner"), other = actorNamed("Other");
  const mine = makeCombat("c1", [owner], { round: 3 });
  const theirs = makeCombat("c2", [other], { round: 9 });
  const undo = stageWorld(env, { combats: [mine, theirs] });
  try {
    env.game.combat = theirs;                                   // the client is watching the OTHER table
    const spec = { oncePerRound: true };
    assert.strictEqual(env.edhaTriggerAllowed(owner, "Talent", spec), true, "first use in the round is allowed");
    await env.edhaMarkTriggerUsed(owner, "Talent", spec);
    assert.strictEqual(env.edhaTriggerAllowed(owner, "Talent", spec), false, "the second is not");
    assert.strictEqual(owner.getFlag("edha-content", "trigRound").Talent, 3,
      "the stamp must be the OWNER's round (3), not the viewed combat's (9)");

    // Same clock for the Coordination gate — reader and writer must agree.
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, "Pillar", "k"), true);
    await env.edhaCoordOPRMark(owner, "Pillar", "k");
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, "Pillar", "k"), false);
    assert.strictEqual(owner.getFlag("edha-content", "coordRound").Pillar.k, 3);
  } finally { undo.undo(); env.game.combat = null; }
});

test("out of combat a once-per-round gate stays UNRESTRICTED — it must not silence the talent", async () => {
  const env = loadEngine();
  const owner = actorNamed("Owner");
  const undo = stageWorld(env, { combats: [] });
  try {
    const spec = { oncePerRound: true };
    assert.strictEqual(env.edhaTriggerAllowed(owner, "Talent", spec), true);
    await env.edhaMarkTriggerUsed(owner, "Talent", spec);
    assert.strictEqual(env.edhaTriggerAllowed(owner, "Talent", spec), true,
      "no round to be 'once per' — the talent stays usable rather than locking out for the session");
    assert.strictEqual(owner.getFlag("edha-content", "trigRound"), undefined, "and nothing is stamped");
  } finally { undo.undo(); }
});

test("the watch budget keys on the RULE OWNER's round", () => {
  const env = loadEngine();
  const owner = actorNamed("Owner"), other = actorNamed("Other"), victim = actorNamed("Victim");
  const item = mockItem({ name: "Whispered Doubt", actor: owner });
  const mine = makeCombat("c1", [owner], { round: 3 });
  const theirs = makeCombat("c2", [other], { round: 9 });
  const undo = stageWorld(env, { combats: [mine, theirs] });
  try {
    env.game.combat = theirs;
    const h = { once: "round" };
    assert.strictEqual(env.edhaWatchBudgetGate(h, item, victim), true, "first fire this round");
    assert.strictEqual(env.edhaWatchBudgetGate(h, item, victim), false, "second is budgeted out");
    // The budget key must be the owner's round: advance the OWNER's combat and it re-opens.
    mine.round = 4;
    assert.strictEqual(env.edhaWatchBudgetGate(h, item, victim), true,
      "the OWNER's round advancing re-opens the budget");
    // Advancing the OTHER table's round must do nothing.
    theirs.round = 10;
    assert.strictEqual(env.edhaWatchBudgetGate(h, item, victim), false,
      "another combat's round tick must NOT reset this ledger");
  } finally { undo.undo(); env.game.combat = null; }
});

test("focus-fire: no round means no 'this round' ledger, and the record is per target", () => {
  const env = loadEngine();
  const hunter = actorNamed("Hunter"), prey = actorNamed("Prey");
  const hTok = { id: "tok-h", actor: hunter }, pTok = { id: "tok-p", actor: prey };

  // OUT OF COMBAT — the old `?? 0` made every attack permanent. Nothing may be recorded.
  let undo = stageWorld(env, { combats: [] });
  try {
    env.edhaRecordFocusFire(hTok, [pTok]);
    assert.strictEqual(env.edhaFocusFireSet(pTok).size, 0,
      "'who attacked whom this round' is unanswerable out of combat — it must not answer");
  } finally { undo.undo(); }

  // IN COMBAT — records, and lapses when the round turns over.
  const combat = makeCombat("c1", [hunter, prey], { round: 2 });
  undo = stageWorld(env, { combats: [combat] });
  try {
    env.edhaRecordFocusFire(hTok, [pTok]);
    assert.deepStrictEqual([...env.edhaFocusFireSet(pTok)], ["tok-h"], "in combat it records normally");
    combat.round = 3;
    assert.strictEqual(env.edhaFocusFireSet(pTok).size, 0, "and the record lapses with the round");
  } finally { undo.undo(); }
});

/* ---- 4. "until your next turn" — the expiry face ----------------------------------------------- */

test("a timed status stamps against the reference creature's OWN combat", async () => {
  const env = loadEngine();
  const owner = actorNamed("Owner"), target = actorNamed("Target"), stranger = actorNamed("Stranger");
  const effects = [];
  target.effects = effects;
  target.toggleStatusEffect = async (statusId) => {
    if (!effects.some((e) => e.statuses.has(statusId))) {
      const flags = {};
      effects.push({ id: `eff-${statusId}`, name: statusId, statuses: new Set([statusId]),
        getFlag: (s, k) => flags[k], setFlag: async (s, k, v) => { flags[k] = v; },
        unsetFlag: async (s, k) => { delete flags[k]; } });
    }
    return true;
  };
  // owner is combatant 0, target combatant 1, and the VIEWED combat holds neither of them.
  const mine = makeCombat("c1", [owner, target], { round: 2, turn: 1 });
  const theirs = makeCombat("c2", [stranger], { round: 9 });
  const undo = stageWorld(env, { combats: [theirs, mine] });
  try {
    env.game.combat = theirs;
    await env.edhaApplyTimedStatus(target, "restrained", { owner, expire: "owner" });
    const eff = effects[0];
    eq(eff.getFlag("edha-content", "expireAfter"), { round: 3, turn: 0 },
      "R-4: stamped from the OWNER's combat (owner is turn 0, already past → next round)");
    assert.strictEqual(eff.getFlag("edha-content", "timedExpire"), undefined,
      "a real stamp leaves no catch-up intent — 'Restrained until your next turn' is no longer immortal");
  } finally { undo.undo(); env.game.combat = null; }
});

test("OUT OF COMBAT the timed status still records its intent — the gate must not eat it", async () => {
  const env = loadEngine();
  const owner = actorNamed("Owner"), target = actorNamed("Target");
  const effects = [];
  target.effects = effects;
  target.toggleStatusEffect = async (statusId) => {
    const flags = {};
    effects.push({ id: `eff-${statusId}`, name: statusId, statuses: new Set([statusId]),
      getFlag: (s, k) => flags[k], setFlag: async (s, k, v) => { flags[k] = v; },
      unsetFlag: async (s, k) => { delete flags[k]; } });
    return true;
  };
  const undo = stageWorld(env, { combats: [] });
  try {
    await env.edhaApplyTimedStatus(target, "restrained", { owner, expire: "owner" });
    const eff = effects[0];
    assert.strictEqual(eff.getFlag("edha-content", "expireAfter"), undefined, "no combat = no coordinate yet");
    eq(eff.getFlag("edha-content", "timedExpire"),
      { expire: "owner", ownerUuid: "Actor.Owner" },
      "the catch-up intent must survive — the expiry pass stamps it the moment combat starts");
  } finally { undo.undo(); }
});

test("the strike window reads the OWNER's turn clock", () => {
  const env = loadEngine();
  const owner = actorNamed("Owner"), other = actorNamed("Other");
  const mine = makeCombat("c1", [owner], { round: 2, turn: 0 });
  const theirs = makeCombat("c2", [other], { round: 9, turn: 0 });
  const undo = stageWorld(env, { combats: [mine, theirs] });
  try {
    env.game.combat = theirs;
    owner.flags["edha-content"].strikeWindow = { round: 3, turn: 0 };
    assert.strictEqual(env.edhaStrikeWindowActive(owner), true,
      "open until the owner's own combat reaches the coordinate — the viewed combat's round 9 is irrelevant");
    mine.round = 3;
    assert.strictEqual(env.edhaStrikeWindowActive(owner), false, "and it closes on the owner's clock");
  } finally { undo.undo(); env.game.combat = null; }
});

test("once-per-turn tracks the actor's own combat, and is unrestricted out of combat", async () => {
  const env = loadEngine();
  const actor = actorNamed("Actor"), other = actorNamed("Other");
  const mine = makeCombat("c1", [actor], { round: 1, turn: 0 });
  const theirs = makeCombat("c2", [other], { round: 5, turn: 2 });
  let undo = stageWorld(env, { combats: [mine, theirs] });
  try {
    env.game.combat = theirs;
    assert.strictEqual(env.edhaOncePerTurnAllowed(actor, "k"), true);
    await env.edhaOncePerTurnMark(actor, "k");
    assert.strictEqual(env.edhaOncePerTurnAllowed(actor, "k"), false, "spent for this turn");
    theirs.turn = 3;
    assert.strictEqual(env.edhaOncePerTurnAllowed(actor, "k"), false,
      "another combat's turn tick must NOT refresh it");
    mine.turn = 1;
    assert.strictEqual(env.edhaOncePerTurnAllowed(actor, "k"), true, "the actor's OWN turn tick does");
  } finally { undo.undo(); env.game.combat = null; }

  undo = stageWorld(env, { combats: [] });
  try {
    const loner = actorNamed("Loner");
    assert.strictEqual(env.edhaOncePerTurnAllowed(loner, "k"), true);
    await env.edhaOncePerTurnMark(loner, "k");
    assert.strictEqual(env.edhaOncePerTurnAllowed(loner, "k"), true,
      "out of combat there is no turn — the talent stays usable rather than locking out");
  } finally { undo.undo(); }
});

/* ---- 5. the negative control — what is deliberately NOT gated ---------------------------------- */

test("DELIBERATELY UNGATED: the out-of-combat prompt debounces still work with no combat", () => {
  const env = loadEngine();
  const undo = stageWorld(env, { combats: [] });
  try {
    // Both gates keep a 30-second wall-clock fallback precisely so they function out of combat.
    // They take a key, not an actor — there is no owner to gate on, and gating them would delete
    // the out-of-combat behaviour they were written to have.
    assert.strictEqual(env.edhaOrderPromptGate("k1"), true, "first prompt out of combat is offered");
    assert.strictEqual(env.edhaOrderPromptGate("k1"), false, "…and the wall-clock debounce still holds");
    assert.strictEqual(env.edhaShatterPromptGate("k2"), true);
    assert.strictEqual(env.edhaShatterPromptGate("k2"), false);
  } finally { undo.undo(); }
});

test("DELIBERATELY UNGATED: edhaRoundWindowValid still opens an out-of-combat window", () => {
  const env = loadEngine();
  // A window ARMED out of combat carries no combatId and stays open until consumed — unchanged by
  // #28a. Only WHICH combat the readers pass in changed (the owner's, not the viewed one).
  assert.strictEqual(env.edhaRoundWindowValid({ round: null, combatId: null }, null), true);
  assert.strictEqual(env.edhaRoundWindowValid({ round: 2, combatId: "c1" }, { id: "c1", round: 2 }), true);
  assert.strictEqual(env.edhaRoundWindowValid({ round: 2, combatId: "c1" }, { id: "c2", round: 2 }), false,
    "a window armed in one combat must not read as open in another");
});
