/* REGRESSION — the CAE grant write race (bench run 9, 2026-07-27i defect 2).
 *
 * Same family as the 07-26n H3 owner-list race, in a second place that had simply never been put
 * through the queue. `edhaCaeApplyGM` is a read-modify-write on a COMBATANT flag —
 * deepClone(getFlag) → push/decrement → setFlag — with an async server round-trip in the middle
 * and no isolation.
 *
 * At combat start Foresight and Sidestep both fire on `edha-combat-timing` in the same tick. Both
 * read the same pre-write `actionsAvailableGroups`, both push onto their own clone, and the last
 * setFlag wins: the bench saw TWO "(on the tracker)" cards and ONE group. Probe-confirmed with two
 * Through the Fray uses in one tick — two success cards, one group written.
 *
 * The fake combatant's setFlag awaits a macrotask before committing, which is what makes the OLD
 * interleaving reproducible: without the queue, case 1 below lands ONE group instead of two.
 *
 * Case 3 is the third item in the reported blast radius and the reason the queue is keyed on the
 * CAE FLAG KEY rather than on the kind: `burn-reaction` and a `reaction` grant both write
 * `reactionsAvailable`, so they must serialise against each other, not just against their own kind.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, sleep } = require("./harness.js");

/* Lazy load: nothing in this file mutates persistent env.game/env.canvas state (only
 * env.fromUuid/env.game.combat, both freshly overwritten by every fakeCombat() call), so one
 * engine instance safely serves the whole file — via a Proxy so the parse itself is deferred to
 * the first test that actually runs, not paid at require() time. */
let _env = null;
const env = new Proxy({}, {
  get(_, prop) { return (_env || (_env = loadEngine()))[prop]; },
  set(_, prop, value) { (_env || (_env = loadEngine()))[prop] = value; return true; },
});
const CAE = "cosmere-advanced-encounters";

/* A minimal combatant whose flag write has the async gap real Foundry writes have, plus the actor
 * plumbing edhaCaeApplyGM walks (fromUuid → actor → combatant lookup). Built on mockActor for the
 * flag store, with the server round-trip delay layered on top — the behavior-critical quirk that
 * makes the OLD unserialised interleaving reproducible (see the file header). */
function fakeCombat(uuid = "Combatant.cae-1") {
  const id = uuid.split(".").pop();
  const combatant = mockActor({ name: id, id, uuid, type: "combatant" });
  const baseSetFlag = combatant.setFlag.bind(combatant);
  combatant.setFlag = async (scope, key, value) => {
    await sleep(1);   // the server round-trip
    return baseSetFlag(scope, key, JSON.parse(JSON.stringify(value)));
  };
  const actor = { uuid: "Actor.cae-owner", id: "cae-owner", name: "CAE Owner" };
  combatant.actor = actor;
  combatant.actorId = actor.id;
  env.fromUuid = async (u) => (u === actor.uuid ? actor : null);
  env.game.combat = { combatants: [combatant] };
  return { combatant, actor };
}
const groupsOf = (c, key) => c.flags[CAE][key] ?? [];

test("REGRESSION: two same-tick grants both reach the tracker (the Foresight+Sidestep case)", async () => {
  const { combatant, actor } = fakeCombat();
  await Promise.all([
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "action", n: 1, label: "Foresight" }),
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "action", n: 1, label: "Sidestep" }),
  ]);
  const groups = groupsOf(combatant, "actionsAvailableGroups");
  assert.strictEqual(groups.length, 2, "both grants must survive — ONE group was the bench symptom");
  assert.deepStrictEqual(groups.map((g) => g.name).sort(), ["Edha: Foresight", "Edha: Sidestep"]);
  for (const g of groups) assert.deepStrictEqual({ max: g.max, remaining: g.remaining, used: g.used }, { max: 1, remaining: 1, used: 0 });
});

test("REGRESSION: two same-tick Through the Fray uses write TWO groups", async () => {
  const { combatant, actor } = fakeCombat();
  await Promise.all([
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "reaction", n: 1, label: "Through the Fray" }),
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "reaction", n: 1, label: "Through the Fray" }),
  ]);
  assert.strictEqual(groupsOf(combatant, "reactionsAvailable").length, 2, "two success cards must mean two groups");
});

test("a burn racing a grant on the SAME key serialises (both land, neither is lost)", async () => {
  const { combatant, actor } = fakeCombat();
  await combatant.setFlag(CAE, "reactionsAvailable", [{ max: 1, remaining: 1, used: 0, name: "Reaction" }]);
  await Promise.all([
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "burn-reaction", n: 1, label: "Feinting Strike" }),
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "reaction", n: 1, label: "Through the Fray" }),
  ]);
  const groups = groupsOf(combatant, "reactionsAvailable");
  assert.strictEqual(groups.length, 2, "the grant must not be clobbered by the burn (or vice versa)");
  const base = groups.find((g) => g.name === "Reaction");
  assert.strictEqual(base.remaining, 0, "the burn must have been applied");
  assert.strictEqual(base.used, 1);
});

test("actions and reactions are different queue keys — they do not block each other", async () => {
  const { combatant, actor } = fakeCombat();
  await Promise.all([
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "action", n: 2, label: "Cautious Advance" }),
    env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "reaction", n: 1, label: "Sidestep" }),
  ]);
  assert.strictEqual(groupsOf(combatant, "actionsAvailableGroups").length, 1);
  assert.strictEqual(groupsOf(combatant, "reactionsAvailable").length, 1);
  assert.strictEqual(groupsOf(combatant, "actionsAvailableGroups")[0].max, 2, "n must survive the queue");
});

test("burn with nothing left is a no-op and does not wedge the chain", async () => {
  const { combatant, actor } = fakeCombat();
  await combatant.setFlag(CAE, "reactionsAvailable", [{ max: 1, remaining: 0, used: 1, name: "Reaction" }]);
  await env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "burn-reaction", n: 1, label: "spent" });
  assert.strictEqual(groupsOf(combatant, "reactionsAvailable")[0].remaining, 0, "nothing to burn");
  // the queue must still accept work after an early return
  await env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "reaction", n: 1, label: "after" });
  assert.strictEqual(groupsOf(combatant, "reactionsAvailable").length, 2);
});

test("no combatant → silent no-op (unchanged pre-CAE fallback)", async () => {
  const { actor } = fakeCombat();
  env.game.combat = { combatants: [] };
  await env.edhaCaeApplyGM({ actorUuid: actor.uuid, kind: "action", n: 1, label: "nobody" });   // must not throw
});
