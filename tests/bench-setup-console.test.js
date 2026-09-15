/* tests/bench-setup-console.test.js — pins the PROTECTED-player guard in
 * scripts/bench-setup-console.js (TODO_REPO_HYGIENE #165).
 *
 * WHY. The guard used to be name-only: `PROTECTED = ["tem parinaem", "soggy bottom",
 * "temp name hannah character"]`. Bench run 48 (2026-09-14) found the third player's actor
 * renamed to "Ishee" in the world — the placeholder name resolves to nothing, so a roster or
 * orphan-repair pass trusting the old list would not have treated her as protected (PM-R17 covers
 * all three players' actors alike: refresh only, never edited by this script). Two fixes:
 *   - "ishee" added to the fixed PROTECTED list (this file's first block).
 *   - `benchProtectedFolderIds` + `benchProtectedNames`: EVERY actor currently sitting in the
 *     players' "Edha PCs" folder (or a subfolder of it, at any depth) is protected BY FOLDER
 *     MEMBERSHIP, not by a name someone remembered to add — so the next rename cannot reopen the
 *     gap the way the stale placeholder name did for Ishee (this file's second and third blocks).
 * `benchOrphanPlan` already accepted a `protectedNames` array; the console block now merges the
 * folder-derived names into it before calling — the fourth block below pins that merged list
 * still reaches `benchOrphanPlan` and is honoured there, using a name that is NOT in the fixed
 * PROTECTED list at all, so it can only pass because of folder membership.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const {
  benchOrphanPlan, benchProtectedFolderIds, benchProtectedNames, PROTECTED, PLAYER_FOLDER_NAME,
} = require(path.join(__dirname, "..", "scripts", "bench-setup-console.js"));

// ---- fixed PROTECTED list --------------------------------------------------------------------

test("PROTECTED names Ishee, and keeps the retired placeholder so a rename back can't unguard her", () => {
  assert.ok(PROTECTED.includes("ishee"), "PROTECTED must include \"ishee\" (item 165)");
  assert.ok(PROTECTED.includes("temp name hannah character"), "the placeholder name must stay listed too");
  assert.ok(PROTECTED.includes("tem parinaem"));
  assert.ok(PROTECTED.includes("soggy bottom"));
});

test("PLAYER_FOLDER_NAME is the players' own Actor folder, the wizard's \"Edha PCs\"", () => {
  assert.strictEqual(PLAYER_FOLDER_NAME, "Edha PCs");
});

// ---- folder resolution: id + every descendant subfolder, transitively -----------------------

// Two-deep nesting under "Edha PCs" (id "f-pcs"), plus an unrelated folder tree ("Edha Bench")
// that must never be pulled in.
function fixtureFolders() {
  return [
    { id: "f-pcs", name: "Edha PCs", folder: null },
    { id: "f-pcs-archive", name: "Retired PCs", folder: "f-pcs" }, // direct subfolder
    { id: "f-pcs-archive-2", name: "Old Retired PCs", folder: "f-pcs-archive" }, // nested two deep
    { id: "f-bench", name: "Edha Bench", folder: null },
    { id: "f-bench-pcs", name: "Bench PCs", folder: "f-bench" },
  ];
}

test("benchProtectedFolderIds: resolves the root id plus every subfolder id, at any depth", () => {
  const ids = benchProtectedFolderIds(fixtureFolders(), "Edha PCs");
  assert.deepStrictEqual([...ids].sort(), ["f-pcs", "f-pcs-archive", "f-pcs-archive-2"].sort());
});

test("benchProtectedFolderIds: an unrelated folder tree is never included", () => {
  const ids = benchProtectedFolderIds(fixtureFolders(), "Edha PCs");
  assert.ok(!ids.includes("f-bench"));
  assert.ok(!ids.includes("f-bench-pcs"));
});

test("benchProtectedFolderIds: no folder named rootFolderName returns [], not an error", () => {
  assert.deepStrictEqual(benchProtectedFolderIds(fixtureFolders(), "Nonexistent Folder"), []);
  assert.deepStrictEqual(benchProtectedFolderIds([], "Edha PCs"), []);
});

// ---- name derivation: every actor currently in one of those folder ids ------------------------

function fixtureActors() {
  return [
    { name: "Ishee", folder: "f-pcs" }, // direct member
    { name: "Some Renamed PC", folder: "f-pcs-archive-2" }, // two-deep member — must still count
    { name: "Bench — White", folder: "f-bench-pcs" }, // a different folder tree — must not count
    { name: "Loose Actor", folder: null }, // no folder at all
  ];
}

test("benchProtectedNames: folds in every actor in the resolved folder ids, lowercased", () => {
  const folderIds = benchProtectedFolderIds(fixtureFolders(), "Edha PCs");
  const names = benchProtectedNames(["tem parinaem", "soggy bottom"], fixtureActors(), folderIds);
  assert.ok(names.has("ishee"), "a direct member of the players' folder must be protected");
  assert.ok(names.has("some renamed pc"), "a member of a SUBFOLDER must be protected too");
  assert.ok(names.has("tem parinaem"), "the fixed list must still be present");
  assert.ok(!names.has("bench — white"), "an actor outside the players' folder tree must not be swept in");
  assert.ok(!names.has("loose actor"), "an actor with no folder must not be protected by folder rule");
});

test("benchProtectedNames: the FOLDER rule alone (no fixed names) still protects a folder member", () => {
  // Deliberately pass an EMPTY fixed list — if this passes, it is proof the folder rule, not the
  // hard-coded PROTECTED array, is what protected "ishee" here. This is the failure this test is
  // built to catch if the folder-derivation loop is ever removed from benchProtectedNames.
  const folderIds = benchProtectedFolderIds(fixtureFolders(), "Edha PCs");
  const names = benchProtectedNames([], fixtureActors(), folderIds);
  assert.ok(names.has("ishee"));
  assert.ok(names.has("some renamed pc"));
});

// ---- integration: the merged set actually reaches benchOrphanPlan and is honoured there -------

test("benchOrphanPlan: a renamed player actor stays protected by folder membership alone, with its name hardcoded nowhere", () => {
  const folderIds = benchProtectedFolderIds(fixtureFolders(), "Edha PCs");
  // "Some Renamed PC" is in neither a fixed PROTECTED-style list nor the bench roster — the ONLY
  // reason it must be skipped is that benchProtectedNames found it living under "Edha PCs".
  const protectedNames = [...benchProtectedNames([], fixtureActors(), folderIds)];
  const tokens = [{ id: "tok-x", name: "Some Renamed PC", actorId: "actor-gone", x: 5, y: 5 }];
  const plan = benchOrphanPlan(tokens, () => null, new Map(), protectedNames);
  assert.deepStrictEqual(plan.skipped, ["Some Renamed PC"]);
  assert.strictEqual(plan.repair.length, 0, "a folder-protected orphan must never be planned for repair");
  assert.strictEqual(plan.replace.length, 0, "a folder-protected orphan must never be planned for replace");
});

test("benchOrphanPlan: Ishee specifically (fixed PROTECTED list, resolved lowercase) is skipped, never repaired or replaced", () => {
  const tokens = [{ id: "tok-y", name: "Ishee", actorId: "actor-gone-ishee", x: 1, y: 1 }];
  const plan = benchOrphanPlan(tokens, () => null, new Map(), PROTECTED);
  assert.deepStrictEqual(plan.skipped, ["Ishee"]);
  assert.strictEqual(plan.repair.length, 0);
  assert.strictEqual(plan.replace.length, 0);
});
