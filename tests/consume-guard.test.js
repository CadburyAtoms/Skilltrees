/* Pinned cases for lint-refs PASS 23 — the R-22 under-refund guard (item 60, 2026-09-06).
 *
 * WHY THIS EXISTS. `edhaConsumeList` (register-skills.js) reads `value.min` as both the deduct
 * amount and the refund amount; it never reads `value.max`. A `consume` entry that ever shipped
 * `min !== max` would let a real spend of `max` refund only `min` — silently, because nothing in
 * Foundry errors on it. Ben's ruling (R-22) is to close the door with a build guard rather than an
 * engine change, so this pins BOTH halves of that guard:
 *
 *   1. `checkConsumeEntries` (scripts/lib/consume-guard.js) — the pure scan/decide function — over
 *      a fixture with one bad entry and one good one, asserting the failure names the bad one and
 *      that the scan count is right.
 *   2. The real `scripts/lint-refs.js` process, spawned against a fixture authored file (same
 *      fixture-writes-its-own-file-and-deletes-it discipline as macro-gate.test.js /
 *      handler-schemas.test.js), so the wiring from authored data through pass 23 to a failing
 *      build is pinned end to end, not just the helper in isolation.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const { checkConsumeEntries } = require(path.join(REPO, "scripts", "lib", "consume-guard.js"));

/* --- 1. the pure function, over a small fixture ------------------------------------------------ */

test("checkConsumeEntries: a fixture with one bad entry and one good one names only the bad one, and reports the right scan count", () => {
  const entries = [
    { source: "fixture-a", name: "Good Talent", consume: [
      { type: "resource", resource: "inv", value: { min: 2, max: 2, actual: 0 } },
    ] },
    { source: "fixture-b", name: "Bad Talent", consume: [
      { type: "resource", resource: "foc", value: { min: 1, max: 3, actual: 0 } },
    ] },
    // Non-resource and resource-less entries must not count toward the scan — only real
    // { type: "resource", resource } entries are consume entries edhaConsumeList would read.
    { source: "fixture-c", name: "Irrelevant Entry", consume: [
      { type: "narrative" },
      { type: "resource" },       // no `resource` — not countable
    ] },
    // A non-array `consume` (never authored) must be skipped, not throw.
    { source: "fixture-d", name: "No Consume", consume: undefined },
  ];

  const { scanned, findings } = checkConsumeEntries(entries);

  assert.strictEqual(scanned, 2, `expected 2 real resource consume entries scanned, got ${scanned}`);
  assert.strictEqual(findings.length, 1, `expected exactly 1 finding, got ${findings.length}: ${JSON.stringify(findings)}`);
  assert.strictEqual(findings[0].name, "Bad Talent");
  assert.strictEqual(findings[0].resource, "foc");
  assert.strictEqual(findings[0].min, 1);
  assert.strictEqual(findings[0].max, 3);
});

test("checkConsumeEntries: min === max (including 0) never reports", () => {
  const entries = [
    { source: "fixture-e", name: "Zero Cost", consume: [
      { type: "resource", resource: "inv", value: { min: 0, max: 0, actual: 0 } },
    ] },
    { source: "fixture-f", name: "Equal Cost", consume: [
      { type: "resource", resource: "foc", value: { min: 3, max: 3, actual: 0 } },
    ] },
  ];
  const { scanned, findings } = checkConsumeEntries(entries);
  assert.strictEqual(scanned, 2);
  assert.strictEqual(findings.length, 0);
});

/* --- 2. the real lint-refs.js process, against a fixture authored file ------------------------- */

const FIXTURE = path.join(REPO, "data/authored/_consume-guard-fixture.json");

function pass23ErrorsFor(talents) {
  fs.writeFileSync(
    FIXTURE,
    JSON.stringify({ _meta: { group: "Lint fixture (tests/consume-guard.test.js)" }, talents }, null, 2) + "\n"
  );
  try {
    const r = cp.spawnSync("node", ["scripts/lint-refs.js"], { cwd: REPO, encoding: "utf8" });
    return { code: r.status, lines: ((r.stdout || "") + (r.stderr || "")).split("\n").filter((l) => l.includes("pass 23")) };
  } finally {
    try { fs.unlinkSync(FIXTURE); } catch (e) {}
  }
}

test("lint-refs pass 23 PASSES a min === max consume entry (mutation baseline)", () => {
  const { code, lines } = pass23ErrorsFor({
    "Fixture Consume Good": {
      activation: { consume: [{ type: "resource", resource: "inv", value: { min: 2, max: 2, actual: 0 } }] },
    },
  });
  assert.strictEqual(code, 0, `expected lint-refs to pass, got exit ${code} with pass-23 lines:\n  ${lines.join("\n  ")}`);
  assert.strictEqual(lines.length, 0, `expected no pass-23 findings, got:\n  ${lines.join("\n  ")}`);
});

test("lint-refs pass 23 FAILS a min !== max consume entry and names the talent (the mutation)", () => {
  const { code, lines } = pass23ErrorsFor({
    "Fixture Consume Good": {
      activation: { consume: [{ type: "resource", resource: "inv", value: { min: 2, max: 2, actual: 0 } }] },
    },
    "Fixture Consume Bad": {
      activation: { consume: [{ type: "resource", resource: "foc", value: { min: 1, max: 3, actual: 0 } }] },
    },
  });
  assert.notStrictEqual(code, 0, "expected lint-refs to fail on a min !== max consume entry");
  const hit = lines.find((l) => l.includes("Fixture Consume Bad") && l.includes("foc") && l.includes("min 1") && l.includes("max 3"));
  assert.ok(hit, `expected a pass-23 line naming "Fixture Consume Bad" (resource foc, min 1, max 3), got:\n  ${lines.join("\n  ")}`);
  // The good entry in the SAME run must not be reported alongside the bad one.
  assert.ok(!lines.some((l) => l.includes("Fixture Consume Good")), `the good entry must not be reported:\n  ${lines.join("\n  ")}`);
});

test("lint-refs pass 23 scans real repo data and clears the pinned floor (a guard that scans nothing is the failure mode)", () => {
  const r = cp.spawnSync("node", ["scripts/lint-refs.js"], { cwd: REPO, encoding: "utf8" });
  const rotted = ((r.stdout || "") + (r.stderr || "")).split("\n").filter((l) => l.includes("pass 23") && l.includes("the scan rotted"));
  assert.strictEqual(r.status, 0, `expected the real repo data to pass lint-refs clean, got exit ${r.status}`);
  assert.strictEqual(rotted.length, 0, `pass 23 reported an empty/rotted scan against real data:\n  ${rotted.join("\n  ")}`);
});
