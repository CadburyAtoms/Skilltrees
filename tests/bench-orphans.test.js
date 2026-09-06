/* tests/bench-orphans.test.js — pins `benchOrphanPlan` in scripts/bench-setup-console.js
 * (TODO_REPO_HYGIENE #37).
 *
 * WHY. Bench run 27 (2026-09-05) found three Playtest-Map tokens whose `actorId` resolved to no
 * actor — "Bench — Green", "Bench — Heroic", "Bench Target — Floater". The token pass matched an
 * existing token only by `t.actorId === a.id`, so an orphan never matched and the script silently
 * placed a SECOND token beside it while reporting "zero ⚠". `benchOrphanPlan` is the pure planner
 * the wired-in repair now consults; this file pins its four outcomes and the hard guard.
 *
 * Fixture covers, in one pass, every branch the function has:
 *   - a token whose actor resolves — must not appear in any bucket at all;
 *   - an orphan with a same-named roster actor — repair;
 *   - an orphan whose roster entry has no live actor — replace;
 *   - a PROTECTED orphan (a PC name) — skipped, never repaired or replaced;
 *   - a token whose name isn't on the roster at all — ignored entirely.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const { benchOrphanPlan } = require(path.join(__dirname, "..", "scripts", "bench-setup-console.js"));

const PROTECTED = ["tem parinaem", "soggy bottom"];

// resolveActor: only "actor-live" and "tem-actor" (Tem's real actor) resolve to something.
function resolveActor(id) {
  if (id === "actor-live") return { id: "actor-live" };
  if (id === "tem-actor") return { id: "tem-actor" };
  return null; // "actor-gone-1", "actor-gone-2", "actor-gone-tem", undefined, etc. — orphaned
}

// rosterByName: "Bench — Green" has a live roster actor to repoint to; "Bench Target — Floater"
// is a known roster name but currently has NO live actor (the replace case).
const rosterByName = new Map([
  ["Bench — White", { id: "actor-live" }],
  ["Bench — Green", { id: "roster-green-actor" }],
  ["Bench Target — Floater", null],
]);

function fixtureTokens() {
  return [
    { id: "tok-1", name: "Bench — White", actorId: "actor-live", x: 0, y: 0 }, // resolves — ignored
    { id: "tok-2", name: "Bench — Green", actorId: "actor-gone-1", x: 100, y: 200 }, // orphan -> repair
    { id: "tok-3", name: "Bench Target — Floater", actorId: "actor-gone-2", x: 700, y: 900 }, // orphan, no roster actor -> replace
    { id: "tok-4", name: "Tem parinaem", actorId: "actor-gone-tem", x: 50, y: 50 }, // protected orphan -> skipped
    { id: "tok-5", name: "Random Wandering Merchant", actorId: "actor-gone-3", x: 9, y: 9 }, // not a roster name -> ignored
  ];
}

test("benchOrphanPlan: a token whose actor resolves appears in no bucket", () => {
  const plan = benchOrphanPlan(fixtureTokens(), resolveActor, rosterByName, PROTECTED);
  const all = [...plan.repair.map(r => r.tokenId), ...plan.replace.map(r => r.tokenId)];
  assert.ok(!all.includes("tok-1"), "a resolving token must never appear in repair or replace");
  assert.ok(!plan.skipped.includes("Bench — White"), "a resolving token must not appear in skipped either");
});

test("benchOrphanPlan: an orphan with a same-named roster actor plans a repair", () => {
  const plan = benchOrphanPlan(fixtureTokens(), resolveActor, rosterByName, PROTECTED);
  assert.strictEqual(plan.repair.length, 1);
  assert.deepStrictEqual(plan.repair[0], { tokenId: "tok-2", name: "Bench — Green", actorId: "roster-green-actor" });
});

test("benchOrphanPlan: an orphan whose roster entry has no live actor plans a replace, at its own x/y", () => {
  const plan = benchOrphanPlan(fixtureTokens(), resolveActor, rosterByName, PROTECTED);
  assert.strictEqual(plan.replace.length, 1);
  assert.deepStrictEqual(plan.replace[0], { tokenId: "tok-3", name: "Bench Target — Floater", x: 700, y: 900 });
});

test("benchOrphanPlan: a protected orphan is skipped and NEVER planned for repair or replace", () => {
  const plan = benchOrphanPlan(fixtureTokens(), resolveActor, rosterByName, PROTECTED);
  assert.deepStrictEqual(plan.skipped, ["Tem parinaem"]);
  const touched = [...plan.repair, ...plan.replace].map(r => r.name);
  assert.ok(!touched.includes("Tem parinaem"), "a protected token must never be repaired or replaced");
});

test("benchOrphanPlan: a non-roster orphan is ignored entirely (not repair/replace/skipped)", () => {
  const plan = benchOrphanPlan(fixtureTokens(), resolveActor, rosterByName, PROTECTED);
  const everywhere = [...plan.repair.map(r => r.name), ...plan.replace.map(r => r.name), ...plan.skipped];
  assert.ok(!everywhere.includes("Random Wandering Merchant"), "a token off the bench roster must never be touched");
});

test("benchOrphanPlan: protection is case-insensitive, per the script's own PROTECTED list", () => {
  const tokens = [{ id: "tok-6", name: "SOGGY BOTTOM", actorId: "actor-gone-soggy", x: 1, y: 1 }];
  const plan = benchOrphanPlan(tokens, resolveActor, rosterByName, PROTECTED);
  assert.deepStrictEqual(plan.skipped, ["SOGGY BOTTOM"]);
  assert.strictEqual(plan.repair.length, 0);
  assert.strictEqual(plan.replace.length, 0);
});

test("benchOrphanPlan: an empty token list plans nothing", () => {
  const plan = benchOrphanPlan([], resolveActor, rosterByName, PROTECTED);
  assert.deepStrictEqual(plan, { repair: [], replace: [], skipped: [] });
});
