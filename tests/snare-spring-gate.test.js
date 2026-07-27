/* REGRESSION — the snare spring DOUBLE-FIRE (bench run 6, 2026-07-27c).
 *
 * v13 fires tokenEnter AND tokenMoveIn for ONE movement entry (~2 ms apart — the same
 * double-event the Civ fortified Region already debounces via _edhaCivEnterGuard). The
 * fate-snare Region's stale-check reads the snares ledger BEFORE the first spring's queued
 * consume lands, so both events found the snare: two spring cards, two independent damage
 * rolls, two Hexmark offers per walk-in (damage applied once — the burst pipeline landed
 * before the twin's). Command-click and placement springs post once, which is what isolated
 * the Region movement path.
 *
 * The fix is an in-flight guard ON THE SPRING (edhaFateSpringSnare), not per caller: a snare
 * is a consumable that springs at most once, so every path — Region event, Foreknown click,
 * insta-spring, Thread resolve — shares the same idempotence. edhaSnareSpringGate is the pure
 * decision pinned here: reverting the guard makes the twin-event case admit both calls again.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

test("edhaSnareSpringGate: the twin Region event (tokenEnter + tokenMoveIn) is dropped", () => {
  const env = loadEngine();
  const inflight = new Set();
  // First event (tokenMoveIn) enters and marks the snare in flight.
  assert.strictEqual(env.edhaSnareSpringGate(inflight, "snareA0000000001"), true);
  // Second event ~2 ms later (tokenEnter), consume not yet landed: DROPPED.
  assert.strictEqual(env.edhaSnareSpringGate(inflight, "snareA0000000001"), false);
  // A DIFFERENT snare springing in the same window is unaffected (group walk-in).
  assert.strictEqual(env.edhaSnareSpringGate(inflight, "snareB0000000001"), true);
});

test("edhaSnareSpringGate: completion releases the id (a failed spring stays retryable)", () => {
  const env = loadEngine();
  const inflight = new Set();
  assert.strictEqual(env.edhaSnareSpringGate(inflight, "snareA0000000001"), true);
  inflight.delete("snareA0000000001");   // the finally clause
  // After release the ledger stale-check owns dedupe; the gate itself re-admits.
  assert.strictEqual(env.edhaSnareSpringGate(inflight, "snareA0000000001"), true);
});

test("edhaSnareSpringGate: an id-less snare passes (defensive, untracked)", () => {
  const env = loadEngine();
  const inflight = new Set();
  assert.strictEqual(env.edhaSnareSpringGate(inflight, undefined), true);
  assert.strictEqual(env.edhaSnareSpringGate(inflight, undefined), true);
  assert.strictEqual(inflight.size, 0);
});
