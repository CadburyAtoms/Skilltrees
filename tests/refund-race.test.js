/* REGRESSION — the cost-refund race (bench run 13, 2bAA-8; fixed 2026-07-27q).
 *
 * Phantom Double's out-of-range case refuses correctly, but its Investiture refund landed WRONG IN
 * BOTH DIRECTIONS on two runs of the same talent: from inv 4 it ended at 2 (charged, never
 * refunded) and from inv 3 it ended at 4 (a net GAIN of 1). One helper, both signs — the signature
 * of two ABSOLUTE writes racing, not of bad arithmetic.
 *
 * Mechanism, re-derived from cosmere-rpg 2.1.0 `Item#use()`:
 *   • the cost deduction is pushed onto `postRoll` as `void actor.update({… value: current - actual})`
 *     — an absolute value computed UP FRONT and issued UN-AWAITED;
 *   • the LAST postRoll entry is `Hooks.callAll(USE_ITEM, …)` and the whole list runs via
 *     `postRoll.forEach(a => a())`, i.e. in ONE synchronous tick;
 *   • the `use` item-event's execution host defaults to "source", so the executor runs on the same
 *     client a few microtasks later — before the charge's socket round-trip has returned.
 * So the refund read the PRE-consume number and wrote `cur + amount` as a SECOND absolute value.
 * Whichever landed second won.
 *
 * Why both cases are needed: each one PASSES on the broken helper under the other's timing. A test
 * that only pinned "the refund is not lost" would have gone green on a helper that over-credits,
 * and vice versa. Case B is specifically the max-clamp shape (`Math.min(max, stale + amount)` on a
 * 3/4 actor writes 4, not 3) — the observed "+1".
 *
 * The fix is ordering, not arithmetic: `preUseItem` snapshots the pre-cost values (it runs before
 * ANY consumption), and `edhaRefundCost` waits for the charge to LAND against that snapshot before
 * it reads and credits. Mutation check for a future session: delete the `edhaAwaitCostCharged`
 * await in `edhaRefundCost` and cases A and B both fail, in opposite directions.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

/* Fire the WHOLE `cosmere-rpg.preUseItem` chain the way Foundry's `Hooks.call` does — in
 * registration order, stopping at the first handler that returns false. Calling only "the snapshot
 * hook" would not be the same test: 21 handlers are registered on this hook and several are vetoes
 * or takeovers that return false, so this also pins that the snapshot is actually REACHED for an
 * ordinary consuming item. (The engine wraps every hook in its debug tracer, so a handler cannot be
 * identified by its source text — fire the chain instead.) */
const preUseChain = env.__hooks.on.filter((h) => h.name === "cosmere-rpg.preUseItem").map((h) => h.fn);
assert.ok(preUseChain.length, "no cosmere-rpg.preUseItem handlers registered — the harness or the engine changed shape");
function firePreUseItem(item) {
  for (const fn of preUseChain) {
    let out;
    try { out = fn(item); } catch (e) { continue; }
    if (out === false) return false;
  }
  return true;
}

/* An actor whose resource write has the async gap a real Foundry write has: `update()` resolves
 * only after the round-trip, and the value it writes is ABSOLUTE (there is no delta API in the
 * cosmere system — every resource write in index.js is a raw absolute `actor.update`). */
function fakeActor({ value = 4, max = 4, writeMs = 5 } = {}) {
  return {
    uuid: "Actor.refund-race", id: "refund-race", name: "Refund Race",
    system: { resources: { inv: { value, max: { value: max } } } },
    writeMs,
    async update(updates) {
      await new Promise((r) => setTimeout(r, this.writeMs));
      for (const [k, v] of Object.entries(updates)) env.foundry.utils.setProperty(this, k, v);
      return this;
    },
  };
}

// Phantom Double's real activation shape: one resource consumption, min = max = 2 Investiture.
function fakeItem(actor, { amount = 2, uuid = "Item.phantom-double" } = {}) {
  return {
    uuid, name: "Phantom Double", actor,
    system: { activation: { consume: [{ type: "resource", resource: "inv", value: { min: amount, max: amount, actual: 0 } }] } },
  };
}

/* The system's charge, modelled exactly: the target is computed from the value read at postRoll
 * BUILD time, then applied un-awaited after the round-trip. */
function chargeLikeTheSystem(actor, amount, landMs) {
  const current = actor.system.resources.inv.value;
  const target = current - amount;
  setTimeout(() => { actor.system.resources.inv.value = target; }, landMs);
}

function snapshot(item) {
  assert.strictEqual(firePreUseItem(item), true,
    "a plain consuming item must survive the preUseItem chain — a veto here would mean the snapshot is never taken");
}

test("A. the charge landing LAST cannot eat the refund (inv 4 -> ended at 2)", async () => {
  const actor = fakeActor({ value: 4, max: 4, writeMs: 5 });
  const item = fakeItem(actor);
  snapshot(item);                       // preUseItem — before anything is charged
  chargeLikeTheSystem(actor, 2, 60);    // the un-awaited absolute write, slow to land
  await env.edhaRefundCost(item);       // the executor refuses in the SAME tick
  await new Promise((r) => setTimeout(r, 120));
  assert.strictEqual(actor.system.resources.inv.value, 4,
    `a refused use must leave the actor exactly as it started; got ${actor.system.resources.inv.value} (the bench measured 2)`);
});

test("B. the charge landing FIRST cannot make a stale read over-credit (inv 3 -> ended at 4)", async () => {
  const actor = fakeActor({ value: 3, max: 4, writeMs: 40 });
  const item = fakeItem(actor);
  snapshot(item);
  chargeLikeTheSystem(actor, 2, 2);     // lands almost immediately; a stale read still says 3
  await env.edhaRefundCost(item);
  await new Promise((r) => setTimeout(r, 120));
  assert.strictEqual(actor.system.resources.inv.value, 3,
    `the refund must restore 3, not clamp a stale 3+2 to the max; got ${actor.system.resources.inv.value} (the bench measured 4)`);
});

test("C. a refund with no pre-cost snapshot still credits at once (the late chat-card cancel)", async () => {
  const actor = fakeActor({ value: 1, max: 4, writeMs: 1 });
  const item = fakeItem(actor, { uuid: "Item.no-snapshot" });
  // No snapshot: the charge landed long ago (this is edhaBurstCancel / the picker paths).
  const t0 = Date.now();
  await env.edhaRefundCost(item);
  assert.strictEqual(actor.system.resources.inv.value, 3, "a snapshot-less refund must credit the full amount");
  assert.ok(Date.now() - t0 < 500, `a snapshot-less refund must not wait on anything (took ${Date.now() - t0} ms)`);
});

test("D. the refund never exceeds the resource max", async () => {
  const actor = fakeActor({ value: 4, max: 4, writeMs: 1 });
  const item = fakeItem(actor, { uuid: "Item.at-max" });
  await env.edhaRefundCost(item);
  assert.strictEqual(actor.system.resources.inv.value, 4, "crediting a full actor must clamp to max, not mint");
});

test("E. edhaAwaitCostCharged reports FALSE when nothing was ever charged (so no refund mints)", async () => {
  const actor = fakeActor({ value: 4, max: 4 });
  const list = [{ resource: "inv", amount: 2 }];
  const landed = await env.edhaAwaitCostCharged(actor, list, { inv: 4 }, 60, 10);
  assert.strictEqual(landed, false, "an unchanged resource must time out — use({shouldConsume:true}) charges nothing");
});

test("F. edhaAwaitCostCharged returns TRUE as soon as every charged resource has moved", async () => {
  const actor = fakeActor({ value: 4, max: 4 });
  const list = [{ resource: "inv", amount: 2 }];
  setTimeout(() => { actor.system.resources.inv.value = 2; }, 15);
  const landed = await env.edhaAwaitCostCharged(actor, list, { inv: 4 }, 500, 5);
  assert.strictEqual(landed, true, "the wait must end when the charge lands");
  assert.strictEqual(actor.system.resources.inv.value, 2, "and the fresh read must be the post-charge value");
});
