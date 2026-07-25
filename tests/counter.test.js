/* Unit tests for the H3b counter economy's read side + the die-step watch filter (07-25, pass 2bT).
 *
 * Pins, in order of what would hurt most if it broke:
 *   1. OWNER ISOLATION — edhaCounterOn returns 0 when the creature carries the status but is NOT
 *      this owner's bearer. The single shared `insight` status is per-creature; a rival Gnothis
 *      PC's count leaking into another owner's math would multiply Killing Blow off someone
 *      else's study.
 *   2. The count read: `effect.system.count`, floored, negative clamped to 0. This is the
 *      ⚑ bench-verify field — if the field name ever changes, THIS is the test that localises it.
 *   3. edhaWatchMatches on the `die-step` kind: Sovereign's Favor's exact gate — whenSkill "exalt"
 *      matches an exalt entry and rejects an investiture one (the hand-rolled rider fired only
 *      from Exalt, never Investiture of Authority; the filter is what preserves that).
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

const flagStore = (flags) => ({ getFlag: (scope, key) => {
  let v = flags;
  for (const k of `${scope === "edha-content" ? "" : "MISS."}${key}`.split(".").filter(Boolean)) {
    if (v === undefined || v === null) return undefined;
    v = v[k];
  }
  return v;
} });

const bearerOwner = (uuid) => flagStore({ counters: { insight: uuid } });
const creature = (uuid, count) => ({
  uuid,
  effects: [{ statuses: new Set(["insight"]), system: { count } }],
});

test("edhaCounterOn: reads system.count for the owner's own bearer", () => {
  const owner = bearerOwner("Actor.abc");
  assert.strictEqual(env.edhaCounterOn(owner, "insight", creature("Actor.abc", 3), "insight"), 3);
});

test("edhaCounterOn: OWNER ISOLATION — a rival's marked creature reads 0 for a non-bearer owner", () => {
  const rivalMarked = creature("Actor.abc", 4);
  const notMyBearer = bearerOwner("Actor.other");
  const noBearerAtAll = flagStore({});
  assert.strictEqual(env.edhaCounterOn(notMyBearer, "insight", rivalMarked, "insight"), 0);
  assert.strictEqual(env.edhaCounterOn(noBearerAtAll, "insight", rivalMarked, "insight"), 0);
});

test("edhaCounterOn: floors fractional counts and clamps negatives to 0", () => {
  const owner = bearerOwner("Actor.abc");
  assert.strictEqual(env.edhaCounterOn(owner, "insight", creature("Actor.abc", 2.9), "insight"), 2);
  assert.strictEqual(env.edhaCounterOn(owner, "insight", creature("Actor.abc", -2), "insight"), 0);
});

test("edhaCounterIsBearer: strict pointer match on the counter key", () => {
  const owner = bearerOwner("Actor.abc");
  assert.strictEqual(env.edhaCounterIsBearer(owner, "insight", { uuid: "Actor.abc" }), true);
  assert.strictEqual(env.edhaCounterIsBearer(owner, "insight", { uuid: "Actor.xyz" }), false);
  assert.strictEqual(env.edhaCounterIsBearer(owner, "fury", { uuid: "Actor.abc" }), false);
});

test("edhaWatchMatches die-step: whenSkill 'exalt' takes an exalt entry and rejects investiture (Sovereign's Favor)", () => {
  const h = { watch: "die-step", whenSkill: "exalt" };
  const exalt = { kind: "die-step", skill: "exalt", ok: true, total: 1 };
  const invest = { kind: "die-step", skill: "investiture", ok: true, total: 1 };
  assert.strictEqual(env.edhaWatchMatches(h, exalt), true);
  assert.strictEqual(env.edhaWatchMatches(h, invest), false);
  assert.strictEqual(env.edhaWatchMatches({ watch: "test" }, exalt), false, "a die-step event never satisfies a test watch");
});
