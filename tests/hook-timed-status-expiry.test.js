/* HOOK-LAYER COVERAGE — the timed-status expiry pass on `combatTurnChange` (TODO item 5, 3 of 3).
 *
 * `tests/timed-status-catchup.test.js` already pins the DECISION (`edhaTimedStampPlan`, pure) and
 * calls `edhaExpireTimedStatuses` directly. What was never covered is the wiring: that the pass is
 * actually reached from the hook Foundry fires, that ONE client runs it, and that the two writes it
 * makes — deleting an expired effect, and stamping an un-stamped one — land on the document.
 *
 * These cases fire the REAL registered `combatTurnChange` chain (20 registrations, all of them),
 * so a case here also proves the expiry pass coexists with the other nineteen turn-change watchers
 * on the same minimal combat rather than being tested in isolation from them.
 *
 * Round/turn arithmetic used throughout (combat is at round 3, turn 1, three combatants):
 *   edhaNextTurnCoord(ti) = ti > turn ? {round, turn: ti} : {round + 1, turn: ti}
 *   → carrier at index 0 stamps {round: 4, turn: 0}; the owner at index 2 stamps {round: 3, turn: 2}.
 * That asymmetry is the point of the owner-relative branch: Brace's Compelled ends on the OWNER's
 * next turn, which here is sooner than the carrier's.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, mockEffect, stageWorld, withStubs, captureChat, sleep, eq } = require("./harness.js");

const env = loadEngine();

const ROUND = 3, TURN = 1;

/* An effects collection with the `.get(id)` the expiry pass re-checks before deleting (that guard
 * is what stops a double-delete when two watchers race). */
function withEffects(actor, list) {
  actor.effects = Object.assign(list, { get: (id) => list.find((e) => e.id === id) ?? null });
  return actor;
}

function combatant(actor, tokenId) { return { actorId: actor.id, tokenId, actor, name: actor.name }; }

/* carrier (index 0) · the creature whose turn it now is (index 1) · owner (index 2). */
function stageCombat(effectsForCarrier, { isGM = true, isSelf = true } = {}) {
  const carrier = withEffects(mockActor({ name: "Husk", id: "husk", type: "npc" }), effectsForCarrier);
  const active = withEffects(mockActor({ name: "Bystander", id: "bystander", type: "npc" }), []);
  const owner = withEffects(mockActor({ name: "Bench — Order", id: "owner", type: "character" }), []);
  const combat = {
    id: "combat-1", started: true, round: ROUND, turn: TURN,
    turns: [combatant(carrier, "t-husk"), combatant(active, "t-by"), combatant(owner, "t-owner")],
  };
  combat.combatant = combat.turns[TURN];
  return { carrier, active, owner, combat, isGM, isSelf };
}

/* Fire the whole registered chain and let the `void`-dispatched async pass settle. Only the expiry
 * pass's own card shape is returned — nineteen other turn-change watchers share this hook. */
async function turnChange(stage) {
  const cards = captureChat(env);
  const world = stageWorld(env, {
    user: { id: "gm-1", isGM: stage.isGM, targets: new Set(), character: null },
    users: { activeGM: { isSelf: stage.isSelf } },
    actors: stage.combat.turns.map((c) => c.actor),
    placeables: [], combats: [stage.combat],
  });
  const priorCombat = env.game.combat;
  env.game.combat = stage.combat;
  try {
    await withStubs(env, { fromUuid: async (uuid) => stage.combat.turns.find((c) => c.actor.uuid === uuid)?.actor ?? null },
      async () => {
        await fireHook(env, "combatTurnChange", stage.combat, stage.combat.turns[0], stage.combat.turns[TURN]);
        await sleep(5);   // the pass is `void`-dispatched and awaits a uuid resolve inside
      });
  } finally { env.game.combat = priorCombat; world.undo(); }
  return { cards, expiryCards: cards.filter((c) => /ends \(end of its turn\)/.test(c.content)) };
}

const expireAfterOf = (eff) => eff.flags["edha-content"].expireAfter;

/* ---- 1. The delete write: a stamp that has passed ------------------------------------------- */

test("an effect whose `expireAfter` has PASSED is deleted on the turn change", async () => {
  const eff = mockEffect({ name: "Slowed", id: "e-past", statusId: "slowed", flags: { expireAfter: { round: ROUND, turn: 0 } } });
  const stage = stageCombat([eff]);
  const { expiryCards } = await turnChange(stage);
  assert.strictEqual(eff.deleted, true, "round 3 turn 1 is strictly past round 3 turn 0 — the status is over");
  assert.strictEqual(expiryCards.length, 1, "the table is told, once, that the status ended");
  assert.strictEqual(expiryCards[0].owner, "Husk", "spoken by the creature that carried it");
  assert.ok(expiryCards[0].content.includes("<strong>Slowed</strong>"),
    "the card names the EFFECT, not the status id — 'noactions ends' means nothing at the table");
});

test("an effect stamped for exactly NOW survives — expiry is strictly-after, not at-or-after", async () => {
  const eff = mockEffect({ name: "Slowed", id: "e-now", statusId: "slowed", flags: { expireAfter: { round: ROUND, turn: TURN } } });
  const stage = stageCombat([eff]);
  const { expiryCards } = await turnChange(stage);
  assert.strictEqual(eff.deleted, false,
    "a status stamped to end at the end of THIS turn must survive the change INTO it, or it never applies at all");
  assert.strictEqual(expiryCards.length, 0);
});

test("an effect stamped for a future round survives untouched", async () => {
  const eff = mockEffect({ name: "Weakened", id: "e-future", statusId: "weakened", flags: { expireAfter: { round: ROUND + 1, turn: 0 } } });
  const stage = stageCombat([eff]);
  await turnChange(stage);
  assert.strictEqual(eff.deleted, false);
  eq(expireAfterOf(eff), { round: ROUND + 1, turn: 0 }, "a surviving stamp must not be re-written");
});

/* ---- 2. The stamp write: the catch-up for anything applied out of combat -------------------- */

test("an un-stamped effect carrying a TARGET-relative intent is stamped to the carrier's next turn", async () => {
  const eff = mockEffect({ name: "Braced", id: "e-intent", statusId: "braced", flags: { timedExpire: { expire: "target", ownerUuid: "Actor.owner" } } });
  const stage = stageCombat([eff]);
  await turnChange(stage);
  assert.strictEqual(eff.deleted, false, "the catch-up stamps; it never expires on the same pass");
  eq(expireAfterOf(eff), { round: ROUND + 1, turn: 0 },
    "carrier is combatant 0 and turn 1 has already passed it, so its next turn is next round");
  assert.strictEqual(eff.flags["edha-content"].timedExpire, undefined,
    "the intent is CONSUMED — leaving it would re-stamp (and so extend) the status every turn change");
});

test("an OWNER-relative intent is stamped to the OWNER's next turn, which here is sooner", async () => {
  const eff = mockEffect({ name: "Compelled", id: "e-owner", statusId: "compelled", flags: { timedExpire: { expire: "owner", ownerUuid: "Actor.owner" } } });
  const stage = stageCombat([eff]);
  await turnChange(stage);
  eq(expireAfterOf(eff), { round: ROUND, turn: 2 },
    "the owner is combatant 2, still to act this round — 'until the end of YOUR next turn' is that, " +
    "not the carrier's; resolving it off the carrier would have given round 4");
  assert.strictEqual(eff.flags["edha-content"].timedExpire, undefined);
});

test("an owner-relative intent whose owner is NOT in this combat falls back to the carrier", async () => {
  const eff = mockEffect({ name: "Disoriented", id: "e-absent", statusId: "disoriented", flags: { timedExpire: { expire: "owner", ownerUuid: "Actor.somewhere-else" } } });
  const stage = stageCombat([eff]);
  await turnChange(stage);
  eq(expireAfterOf(eff), { round: ROUND + 1, turn: 0 },
    "an off-combat owner must not leave the status un-stamped and therefore immortal");
});

test("an ALLOWLISTED status with no intent at all is still caught up (the hand-toggled case)", async () => {
  const eff = mockEffect({ name: "Weakened", id: "e-allow", statusId: "weakened" });
  const stage = stageCombat([eff]);
  await turnChange(stage);
  eq(expireAfterOf(eff), { round: ROUND + 1, turn: 0 },
    "EDHA_TIMED_STATUSES means 'expire HOWEVER applied' — a GM toggling the icon is a legitimate path in");
});

test("an un-stamped effect that is NEITHER allowlisted NOR intent-carrying is left permanent", async () => {
  const ward = mockEffect({ name: "Predictive Ward", id: "e-ward", statusId: "braced" });
  const plain = mockEffect({ name: "Some Buff", id: "e-plain", statuses: [] });
  const stage = stageCombat([ward, plain]);
  await turnChange(stage);
  for (const eff of [ward, plain]) {
    assert.strictEqual(eff.deleted, false);
    assert.strictEqual(expireAfterOf(eff), undefined,
      `${eff.name} must stay permanent — 'braced' is deliberately OUT of EDHA_TIMED_STATUSES precisely ` +
      "so a transfer:true AE like the Frostbinder's ward is safe BY CONSTRUCTION, not by coincidence");
  }
});

/* ---- 3. ONE client writes ------------------------------------------------------------------- */

test("a SECOND GM client writes nothing — the pass is primary-activeGM only", async () => {
  const eff = mockEffect({ name: "Slowed", id: "e-second-gm", statusId: "slowed", flags: { expireAfter: { round: ROUND, turn: 0 } } });
  const stage = stageCombat([eff], { isGM: true, isSelf: false });
  const { expiryCards } = await turnChange(stage);
  assert.strictEqual(eff.deleted, false,
    "two GMs both deleting is a double-write and a doubled card — edhaDefBuffGmGate elects exactly one");
  assert.strictEqual(expiryCards.length, 0);
});

test("a PLAYER client writes nothing", async () => {
  const eff = mockEffect({ name: "Slowed", id: "e-player", statusId: "slowed", flags: { expireAfter: { round: ROUND, turn: 0 } } });
  const stage = stageCombat([eff], { isGM: false, isSelf: false });
  const { expiryCards } = await turnChange(stage);
  assert.strictEqual(eff.deleted, false, "a player has no permission to delete an effect on someone else's actor");
  assert.strictEqual(expiryCards.length, 0);
});

/* ---- 4. Mixed load: the pass must not stop at the first effect ------------------------------ */

test("expire, stamp and leave-alone all happen in ONE pass over the same actor", async () => {
  const expired = mockEffect({ name: "Slowed", id: "m-exp", statusId: "slowed", flags: { expireAfter: { round: ROUND, turn: 0 } } });
  const toStamp = mockEffect({ name: "Weakened", id: "m-stamp", statusId: "weakened" });
  const permanent = mockEffect({ name: "Predictive Ward", id: "m-perm", statusId: "braced" });
  const stage = stageCombat([expired, toStamp, permanent]);
  const { expiryCards } = await turnChange(stage);
  assert.strictEqual(expired.deleted, true, "an early delete must not abort the rest of the sweep");
  eq(expireAfterOf(toStamp), { round: ROUND + 1, turn: 0 });
  assert.strictEqual(expireAfterOf(permanent), undefined);
  assert.strictEqual(expiryCards.length, 1, "one card for the one thing that actually ended");
});
