/* Unit tests for the H3b counter economy's read side + the die-step watch filter (07-25, pass 2bT).
 *
 * ⚠ READ THIS BEFORE TRUSTING THESE TESTS. Until 2026-07-27h this file pinned `effect.system.count`
 * — the WRONG field — and every case passed, for a year, while the mechanic was completely inert in
 * Foundry. That is the limit of a stubbed-document test: it proves the engine agrees with the STUB,
 * and the stub was written from the same wrong assumption as the code. What the field name is can
 * only be settled against the system's real DataModel, which is why `scripts/lint-refs.js` pass 11
 * exists and why the cases below assert the SYSTEM's semantics, not just the engine's arithmetic.
 *
 * Pins, in order of what would hurt most if it broke:
 *   1. OWNER ISOLATION — edhaCounterOn returns 0 when the creature carries the status but is NOT
 *      this owner's bearer. The single shared `insight` status is per-creature; a rival Gnothis
 *      PC's count leaking into another owner's math would multiply Killing Blow off someone
 *      else's study.
 *   2. THE FIELD: `effect.system.stacks`, the only count field ActiveEffectDataModel declares
 *      ({isStackable, stacks} — nothing else). A `system.count` effect must read as the system
 *      itself reads it, i.e. NOT as 3.
 *   3. The system's `stacks ?? 1` default — CosmereActiveEffect#stacks returns 1 when the field was
 *      never written, so a legacy pre-07-27h effect counts as ONE, never zero. The engine must
 *      agree with the system about the same document.
 *   4. edhaWatchMatches on the `die-step` kind: Sovereign's Favor's exact gate — whenSkill "exalt"
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
// `system` is written exactly as a real ActiveEffect stores it: the schema is {isStackable, stacks}.
const creature = (uuid, stacks) => ({
  uuid,
  effects: [{ statuses: new Set(["insight"]), system: { isStackable: true, stacks } }],
});

test("edhaCounterOn: reads system.stacks for the owner's own bearer", () => {
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

test("edhaCounterOn: no marker effect at all reads 0, not the stacks default", () => {
  const owner = bearerOwner("Actor.abc");
  // Bearer POINTER set but the status was cleared outside the engine (token-HUD toggle, hand delete).
  assert.strictEqual(env.edhaCounterOn(owner, "insight", { uuid: "Actor.abc", effects: [] }, "insight"), 0);
});

/* THE 07-27g REGRESSION. `system.count` is not in ActiveEffectDataModel's schema, so Foundry deletes
 * it: a document that "holds 3" holds nothing, and the system's own accessor reports 1 (stacks ?? 1).
 * The engine must report what the SYSTEM reports for that document — never the dropped number. */
test("edhaCounterOn: a legacy system.count effect does NOT read as its count (07-27g dead field)", () => {
  const owner = bearerOwner("Actor.abc");
  const legacy = { uuid: "Actor.abc", effects: [{ statuses: new Set(["insight"]), system: { isStackable: true, count: 3 } }] };
  const got = env.edhaCounterOn(owner, "insight", legacy, "insight");
  assert.notStrictEqual(got, 3, "reading a dropped `count` as the count is the bug this pins");
  assert.strictEqual(got, 1, "must match CosmereActiveEffect#stacks (`system.stacks ?? 1`) for the same document");
});

test("edhaEffectStacks: mirrors CosmereActiveEffect#stacks — unset field is ONE, explicit 0 is zero", () => {
  assert.strictEqual(env.edhaEffectStacks(null), 0, "no effect = no stacks");
  assert.strictEqual(env.edhaEffectStacks({ system: {} }), 1, "`system.stacks ?? 1` — the system's own default");
  assert.strictEqual(env.edhaEffectStacks({ system: { stacks: null } }), 1, "nullable field, same default");
  assert.strictEqual(env.edhaEffectStacks({ system: { stacks: 0 } }), 0);
  assert.strictEqual(env.edhaEffectStacks({ system: { stacks: 4 } }), 4);
  assert.strictEqual(env.edhaEffectStacks({ system: { stacks: "3" } }), 3, "NumberField coerces; so do we");
  assert.strictEqual(env.edhaEffectStacks({ system: { stacks: "nonsense" } }), 0);
  // The document getter is honoured when `system` is absent (a CosmereActiveEffect exposes .stacks).
  assert.strictEqual(env.edhaEffectStacks({ stacks: 5 }), 5);
});

test("edhaWatchMatches die-step: whenSkill 'exalt' takes an exalt entry and rejects investiture (Sovereign's Favor)", () => {
  const h = { watch: "die-step", whenSkill: "exalt" };
  const exalt = { kind: "die-step", skill: "exalt", ok: true, total: 1 };
  const invest = { kind: "die-step", skill: "investiture", ok: true, total: 1 };
  assert.strictEqual(env.edhaWatchMatches(h, exalt), true);
  assert.strictEqual(env.edhaWatchMatches(h, invest), false);
  assert.strictEqual(env.edhaWatchMatches({ watch: "test" }, exalt), false, "a die-step event never satisfies a test watch");
});

/* The registration seed is the third `count` site (it minted the effect with a dropped field). Read
 * it off the engine's own live CONFIG.statusEffects push rather than re-deriving the shape here. */
test("the registered `insight` status seeds system.stacks, not system.count", () => {
  env.CONFIG.COSMERE = { statuses: {} };
  env.CONFIG.statusEffects = [];
  assert.strictEqual(env.edhaRegisterStatuses("test"), true);
  const insight = env.CONFIG.statusEffects.find((s) => s.id === "insight");
  assert.ok(insight, "insight must be registered");
  assert.strictEqual(insight.system.isStackable, true);
  assert.strictEqual(insight.system.stacks, 1, "the seed must be the real schema field");
  assert.ok(!("count" in insight.system), "`count` is not in ActiveEffectDataModel's schema — seeding it stores nothing");
  // Only `insight` is stackable; a non-stackable status must carry no system block at all.
  assert.strictEqual(env.CONFIG.statusEffects.find((s) => s.id === "omen").system, undefined);
});
