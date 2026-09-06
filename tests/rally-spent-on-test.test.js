/* R-27 / TODO item 52 — Battle Fever's rally stack is SPENT on the next test, once.
 *
 * The card: "gain +1 to your next test (max = Rank), resets at the start of your turn". The engine
 * read "next test" as "every test until turn start" — the bench saw +2[Rally] ride six consecutive
 * rolls. Ben ruled (a) THE CARD is canon (EDHA_RULINGS.md R-27, 2026-09-06).
 *
 * The shape: `edhaTestRiderApply` (pre<Ctx>Roll) reads `edhaRallyBonus` and splices `N[Rally]` into
 * the d20; `edhaRallyConsume` (<ctx>Roll) clears the stack afterwards. The consume is post-roll so a
 * cancelled dialog cannot strand the stack, and it re-reads the ACTOR flag rather than a roll option
 * because a dialog roll rebuilds `roll.options`. The turn-start clear is unchanged and pinned here
 * too, because "spent on test" must not have quietly replaced "resets at turn start".
 *
 * Mutation-proved (2026-09-06): deleting the `void edhaRallyClear(actor)` line in edhaRallyConsume
 * fails cases 1, 2 and 3; deleting the `else if (a === cur) void edhaRallyClear(a)` line fails
 * case 4. The cap is enforced TWICE (the bump's `if (cur >= cap) return cur` AND the reader's
 * `Math.min(count, rank)`), so case 3 only fails when both lines are dropped together — dropping
 * either alone stays green, which is the point of a belt-and-braces cap.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, mockItem, stageWorld, withStubs, RollStub, captureChat, sleep } = require("./harness.js");

const env = loadEngine();

function battleFeverOwner(rank = 3) {
  const actor = mockActor({ name: "Bench — Red", id: "red", type: "character", system: { skills: { red: { rank } } } });
  actor.documentName = "Actor";
  actor.effects = Object.assign([], { get: (id) => actor.effects.find((e) => e.id === id) ?? null });
  const fever = mockItem({ name: "Battle Fever", actor, events: [{ handler: { type: "edha-rally-stack", trigger: "deal-damage", resetOn: "turn" } }] });
  actor.items = [fever];
  return actor;
}

/* One dealt-damage event, settled — the real executor is void-dispatched, so each bump is awaited
 * before the next reads the count (in Foundry the hits are sequential). */
async function dealDamage(actor, times = 1) {
  for (let i = 0; i < times; i++) { env.edhaRallyOnDeal(actor); await sleep(0); }
}

/* Drive one d20 test through the engine's own pre-roll rider and post-roll consumer. Returns every
 * formula the rider constructed for THIS roll (`0 + N[Rally]` when the stack rode it). */
async function rollTest(actor) {
  const capture = [];
  const priorRoll = env.Roll;
  env.Roll = RollStub({ capture });
  const world = stageWorld(env, { user: { id: "gm-1", isGM: true, targets: new Set(), character: null } });
  const config = { data: { source: actor, context: "Skill" } };
  try {
    const roll = new env.Roll("1d20");
    env.edhaTestRiderApply(roll, null, config);
    env.edhaRallyConsume(roll, null, config);
    await sleep(0);
  } finally { env.Roll = priorRoll; world.undo(); }
  return capture.filter((f) => /\[Rally\]/.test(f));
}

/* A `combatTurnChange` at the start of the OWNER's turn, through the whole registered chain. */
async function ownerTurnStarts(actor) {
  const combatant = { actorId: actor.id, tokenId: "t-red", actor, name: actor.name };
  const combat = { id: "combat-1", started: true, round: 2, turn: 0, turns: [combatant], combatant };
  const world = stageWorld(env, {
    user: { id: "gm-1", isGM: true, targets: new Set(), character: null },
    users: { activeGM: { isSelf: true } },
    actors: [actor], placeables: [], combats: [combat],
  });
  const priorCombat = env.game.combat;
  env.game.combat = combat;
  try {
    await withStubs(env, { fromUuid: async () => actor }, async () => {
      await fireHook(env, "combatTurnChange", combat, combatant, combatant);
      await sleep(5);
    });
  } finally { env.game.combat = priorCombat; world.undo(); }
}

test("three damage events stack to +3; the next test rides the WHOLE stack, the one after rides +0", async () => {
  captureChat(env);
  const actor = battleFeverOwner(3);
  await dealDamage(actor, 3);
  assert.strictEqual(env.edhaRallyBonus(actor), 3, "three hits → a +3 stack");
  assert.deepStrictEqual(await rollTest(actor), ["0 + 3[Rally]"], "the next test carries +3[Rally]");
  assert.strictEqual(env.edhaRallyBonus(actor), 0, "the test SPENT the stack");
  assert.deepStrictEqual(await rollTest(actor), [], "the test after rides +0 — nothing to spend");
});

test("the consumer posts one 'spent' card naming the amount, and is silent with no stack", async () => {
  const cards = captureChat(env);
  const actor = battleFeverOwner(3);
  await dealDamage(actor, 2);
  cards.length = 0;
  await rollTest(actor);
  const spent = cards.filter((c) => /spent <strong>\+2<\/strong> on this test/.test(c.content));
  assert.strictEqual(spent.length, 1, "exactly one spent card, for +2");
  cards.length = 0;
  await rollTest(actor);
  assert.strictEqual(cards.length, 0, "no stack, no card");
});

test("the cap holds: four damage events at Rank 3 spend as +3, not +4", async () => {
  captureChat(env);
  const actor = battleFeverOwner(3);
  await dealDamage(actor, 4);
  assert.strictEqual(env.edhaRallyBonus(actor), 3, "capped at Red rank");
  assert.deepStrictEqual(await rollTest(actor), ["0 + 3[Rally]"]);
  assert.strictEqual(env.edhaRallyBonus(actor), 0);
});

test("an UNSPENT stack still clears at the start of the owner's turn (resetOn: turn is not replaced by consume-on-test)", async () => {
  captureChat(env);
  const actor = battleFeverOwner(3);
  await dealDamage(actor, 2);
  assert.strictEqual(env.edhaRallyBonus(actor), 2);
  await ownerTurnStarts(actor);
  assert.strictEqual(env.edhaRallyBonus(actor), 0, "turn start emptied the unspent stack");
  assert.deepStrictEqual(await rollTest(actor), [], "and the first test of the new turn rides +0");
});
