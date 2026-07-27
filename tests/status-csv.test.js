/* Unit tests for edhaStatusCsvMatch (07-25, pass 2bU — the H13 comma-list widening).
 *
 * Pins, in order of what would hurt most if it broke:
 *   1. SINGLE-VALUE PARITY — a one-status csv behaves exactly as the pre-2bU equality check did;
 *      every existing whenTargetStatus consumer (Predatory Patience's "weakened") rides this.
 *   2. ANY-OF — Kneel's standing advantage fires on compelled OR frightened OR weakened; missing
 *      all three fails.
 *   3. BLANK FAILS CLOSED — a blank csv matches NOTHING here. Callers gate on the field being set
 *      at all; a blank reaching the matcher must not read as "no filter" or an empty rule field
 *      would grant advantage on every roll.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

test("edhaStatusCsvMatch: single value matches exactly as the old equality check", () => {
  assert.strictEqual(env.edhaStatusCsvMatch("weakened", new Set(["weakened", "prone"])), true);
  assert.strictEqual(env.edhaStatusCsvMatch("weakened", new Set(["prone"])), false);
});

test("edhaStatusCsvMatch: comma-list is ANY-OF (Kneel's prey set)", () => {
  const csv = "compelled,frightened,weakened";
  assert.strictEqual(env.edhaStatusCsvMatch(csv, new Set(["frightened"])), true);
  assert.strictEqual(env.edhaStatusCsvMatch(csv, new Set(["weakened"])), true);
  assert.strictEqual(env.edhaStatusCsvMatch(csv, new Set(["slowed", "prone"])), false);
});

test("edhaStatusCsvMatch: whitespace and case in the authored csv are forgiven", () => {
  assert.strictEqual(env.edhaStatusCsvMatch(" Compelled , Frightened ", new Set(["compelled"])), true);
});

test("edhaStatusCsvMatch: blank csv or missing statuses match NOTHING (fails closed)", () => {
  assert.strictEqual(env.edhaStatusCsvMatch("", new Set(["weakened"])), false);
  assert.strictEqual(env.edhaStatusCsvMatch("weakened", null), false);
});

test("edhaStatusCsvMatch: a plain iterable works where no Set is handy", () => {
  assert.strictEqual(env.edhaStatusCsvMatch("weakened", ["weakened"]), true);
  assert.strictEqual(env.edhaStatusCsvMatch("weakened", []), false);
});
