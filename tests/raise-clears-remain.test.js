/* REGRESSION — R-12: raising a creature clears its OWN Harvested Remain.
 * (EDHA_RULINGS.md R-12, answered 2026-09-06 (a); TODO_REPO_HYGIENE #47, fix pass 7a.)
 *
 * Bench found an adversary that had itself been harvested, raised by spending a DIFFERENT Remain,
 * standing at 1 HP **still wearing the `harvested` marker with its own ledger entry live** — a
 * living creature that was simultaneously somebody's corpse-resource, and therefore still spendable
 * as one. The card says nothing either way, so it was a ruling rather than a bug; Ben answered (a):
 * the raise clears the raised creature's own entry AND its marker, in the same pass.
 *
 * TWO THINGS THIS FILE INSISTS ON, both of which a smaller fix gets wrong:
 *   1. **Every owner's ledger, by uuid** — not just the raiser's. A marker is a property of the
 *      CREATURE (the `edhaListSharedHold` precedent), and the reported case is precisely one where
 *      the Remain SPENT and the body RAISED are different entries, possibly on different Reapers'
 *      lists. A sweep of `owner`'s list alone leaves the second Reaper holding a live corpse.
 *   2. **Drop the entries FIRST, unmark SECOND.** `edhaOwnerList` reconciles on read against the
 *      creature's status ("the mark wins"), so clearing the status first makes the entry invisible
 *      to the sweep and strands a phantom in stored data — holding its owner under their cap
 *      forever, with nothing on the table to explain why.
 *
 * The negative half matters as much: OTHER creatures' entries, and other ledgers, are untouched.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, stageWorld, withStubs, captureChat, eq } = require("./harness.js");

const KEY = "remains", STATUS = "harvested";

/* A marked corpse: carries the status (so the mark-wins reconcile keeps its entry) and records
 * every toggleStatusEffect call so the unmark half is observable. */
function corpse(name) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type: "npc", statuses: [STATUS] });
  a.isOwner = true;
  a.toggles = [];
  a.toggleStatusEffect = async (statusId, { active } = {}) => {
    a.toggles.push({ statusId, active });
    if (active === false) a.statuses.delete(statusId);
  };
  return a;
}

/* A Reaper holding a `remains` ledger. `entries` is [{id, uuid, name}] in oldest-first order. */
function reaper(name, entries) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type: "character",
    flags: { lists: { [KEY]: entries } } });
  a.isOwner = true;
  a.getRollData = () => ({});
  return a;
}
const ledgerOf = (owner) => (owner.getFlag("edha-content", `lists.${KEY}`) ?? []).map((e) => e.name);

/* Stage the world the ledger machinery reads: game.actors (edhaOwnerLedgers scans characters),
 * a scene id for the scene-scope filter, and uuid resolution for both the sync reconcile read and
 * the async unmark write. */
function withLedgerWorld(env, { owners, bodies }, fn) {
  const byUuid = new Map(bodies.map((b) => [b.uuid, b]));
  // `game.users` must be BOTH iterable-filterable (edhaWhisperIds computes the GM list the way
  // core's getWhisperRecipients does) and carry `.activeGM` (edhaSetEdhaFlag / edhaToggleStatus).
  // A plain `{ activeGM }` object throws inside the ledger's own chat card — which, before this
  // note existed, aborted the raise flow AFTER the spend's list write and looked like the R-12
  // sweep silently not running.
  const users = Object.assign([{ id: "gm", isGM: true, active: true }], { activeGM: { isSelf: true } });
  users.filter = Array.prototype.filter;
  const undo = stageWorld(env, {
    user: { isGM: true, id: "gm" }, users, actors: owners,
  }).undo;
  return withStubs(env, {
    canvas: { scene: { id: "scene1" }, tokens: { placeables: [] } },
    fromUuidSync: (u) => byUuid.get(u) ?? null,
    fromUuid: async (u) => byUuid.get(u) ?? null,
  }, fn).finally(undo);
}

test("R-12: the raised creature's OWN entry leaves the ledger, and its marker is cleared", async () => {
  const env = loadEngine();
  captureChat(env);
  const raised = corpse("Raised Adversary");
  const other = corpse("Someone Else");
  const rp = reaper("Reaper", [
    { id: "e1", uuid: other.uuid, name: other.name },
    { id: "e2", uuid: raised.uuid, name: raised.name },
  ]);

  await withLedgerWorld(env, { owners: [rp], bodies: [raised, other] }, async () => {
    const dropped = await env.edhaLedgerDropCreature(raised.uuid, KEY, STATUS);
    assert.strictEqual(dropped, 1, "exactly its own entry");
  });

  assert.deepStrictEqual(ledgerOf(rp), ["Someone Else"], "the ledger is ONE entry shorter");
  eq(raised.toggles, [{ statusId: STATUS, active: false }], "…and the marker came off the body");
  assert.strictEqual(raised.getFlag("edha-content", `markedBy.${STATUS}`), null, "markedBy cleared too");
  assert.deepStrictEqual(other.toggles, [], "NEGATIVE: the other corpse is untouched");
});

test("R-12: EVERY owner's ledger is swept — a second Reaper's copy goes too", async () => {
  // The reported case raised a body whose own entry need not sit on the raiser's list at all.
  const env = loadEngine();
  captureChat(env);
  const raised = corpse("Raised Adversary");
  const spare = corpse("Spare Corpse");
  const rp1 = reaper("Reaper One", [{ id: "a1", uuid: raised.uuid, name: raised.name }]);
  const rp2 = reaper("Reaper Two", [
    { id: "b1", uuid: spare.uuid, name: spare.name },
    { id: "b2", uuid: raised.uuid, name: raised.name },
  ]);

  await withLedgerWorld(env, { owners: [rp1, rp2], bodies: [raised, spare] }, async () => {
    assert.strictEqual(await env.edhaLedgerDropCreature(raised.uuid, KEY, STATUS), 2);
  });

  assert.deepStrictEqual(ledgerOf(rp1), []);
  assert.deepStrictEqual(ledgerOf(rp2), ["Spare Corpse"]);
});

test("R-12 NEGATIVE: a creature on nobody's ledger drops nothing and unmarks nothing", async () => {
  const env = loadEngine();
  captureChat(env);
  const stranger = corpse("Unharvested Stranger");
  const spare = corpse("Spare Corpse");
  const rp = reaper("Reaper", [{ id: "b1", uuid: spare.uuid, name: spare.name }]);

  await withLedgerWorld(env, { owners: [rp], bodies: [stranger, spare] }, async () => {
    assert.strictEqual(await env.edhaLedgerDropCreature(stranger.uuid, KEY, STATUS), 0);
  });

  assert.deepStrictEqual(ledgerOf(rp), ["Spare Corpse"]);
  assert.deepStrictEqual(stranger.toggles, [],
    "no ledger entry, no unmark — the sweep must not strip a status it did not own");
  assert.deepStrictEqual(spare.toggles, []);
});

test("R-12 NEGATIVE: a blank ledger key or a missing uuid is a no-op, never a whole-list wipe", async () => {
  const env = loadEngine();
  const raised = corpse("Raised Adversary");
  const rp = reaper("Reaper", [{ id: "e2", uuid: raised.uuid, name: raised.name }]);

  await withLedgerWorld(env, { owners: [rp], bodies: [raised] }, async () => {
    assert.strictEqual(await env.edhaLedgerDropCreature(raised.uuid, "", STATUS), 0);
    assert.strictEqual(await env.edhaLedgerDropCreature(null, KEY, STATUS), 0);
    assert.strictEqual(await env.edhaLedgerDropCreature(undefined, KEY, STATUS), 0);
  });

  assert.deepStrictEqual(ledgerOf(rp), ["Raised Adversary"], "an edha-revive rule with no ledger changes nothing");
});

/* -------------------------------------------------------------------------------------------- */
/* The RAISE PATH end to end — spend one Remain, clear the body's own                             */
/* -------------------------------------------------------------------------------------------- */

test("R-12 THE REPORTED CASE: the raise spends a DIFFERENT Remain and still clears the body's own", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const raised = corpse("Raised Adversary");
  raised.system = { resources: { hea: { value: 0, max: { value: 8 } } } };
  const first = corpse("First Remain");
  const third = corpse("Third Remain");
  const rp = reaper("Reaper", [                       // oldest first — the spend takes `first`
    { id: "e1", uuid: first.uuid, name: first.name },
    { id: "e2", uuid: raised.uuid, name: raised.name },
    { id: "e3", uuid: third.uuid, name: third.name },
  ]);
  const item = mockItem({ name: "Raise Dead", actor: rp });

  await withLedgerWorld(env, { owners: [rp], bodies: [raised, first, third] }, async () => {
    return withStubs(env, {
      foundry: { ...env.foundry, applications: { api: { DialogV2: { confirm: async () => true } } } },
    }, async () => {
      env.edhaUserTargetToken = () => ({ id: "tok-raised", actor: raised });
      env.edhaAddInjury = async () => "Shattered Rib";
      await env.edhaReviveUse(item, { ledger: KEY, ledgerStatus: STATUS, oncePerScene: false,
        injury: false, initiative: false, statusId: "" });
    });
  });

  assert.deepStrictEqual(ledgerOf(rp), ["Third Remain"],
    "3 entries → the spend consumed the OLDEST and R-12 removed the raised body's own; 1 left");
  eq(raised.toggles, [{ statusId: STATUS, active: false }], "the raised creature is no longer a Remain");
  assert.deepStrictEqual(first.toggles, [{ statusId: STATUS, active: false }],
    "…and the spent Remain was unmarked by the spend, as it always was");
  assert.deepStrictEqual(third.toggles, [], "NEGATIVE: the untouched third entry keeps its marker");
  assert.strictEqual(raised.system.resources.hea.value, 1, "and it really did come back at 1 HP");
  assert.ok(cards.some((c) => /no longer a .*marker and ledger entry are cleared/.test(c.content)),
    "the table is told, rather than the ledger silently shrinking");
});
