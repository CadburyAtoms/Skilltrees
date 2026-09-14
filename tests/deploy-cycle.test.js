/* Pinned cases for TODO_REPO_HYGIENE item 122 — the agent-run deploy cycle.
 *
 * WHY THIS EXISTS. `scripts/deploy-cycle.js` closes Foundry, pulls `main`, pushes the live
 * engine, rebuilds five packs, and relaunches Foundry — real process/filesystem/network side
 * effects that must never run in CI (`validate.yml` is `ubuntu-latest`; there is no Foundry
 * there, and the first LIVE run of this script is deliberately the PM's own 🤖 row, not a test).
 * So every refuse/pass/fail DECISION the script makes lives as a named PURE function in
 * `scripts/lib/deploy-guards.js`, and this file pins each one against a fixture with no I/O at
 * all — the same discipline `tests/consume-guard.test.js` and `tests/handler-type-guard.test.js`
 * use for their own build guards. The one thing here that DOES spawn the real script
 * (`deploy-cycle.js --dry-run`) never touches PowerShell, the module dir, or the network in a way
 * that can fail off a live Foundry — it only reads git/fs state and prints a plan.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const guards = require(path.join(REPO, "scripts", "lib", "deploy-guards.js"));

/* --- checkOnMainClean ---------------------------------------------------------------------- */

test("checkOnMainClean: a dirty tree refuses", () => {
  const v = guards.checkOnMainClean({ branch: "main", clean: false });
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "clean-tree");
});

test("checkOnMainClean: a branch other than main refuses", () => {
  const v = guards.checkOnMainClean({ branch: "pm/122-deploy-cycle-script", clean: true });
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "on-main");
});

test("checkOnMainClean: on main and clean passes", () => {
  const v = guards.checkOnMainClean({ branch: "main", clean: true });
  assert.strictEqual(v.ok, true);
});

/* --- checkNotBehindOrigin ------------------------------------------------------------------- */

test("checkNotBehindOrigin: behind origin/main refuses", () => {
  const v = guards.checkNotBehindOrigin({ behind: 3 });
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "not-behind-origin");
  assert.ok(v.message.includes("3"));
});

test("checkNotBehindOrigin: even with origin/main passes", () => {
  const v = guards.checkNotBehindOrigin({ behind: 0 });
  assert.strictEqual(v.ok, true);
});

/* --- checkModuleSrcSync --------------------------------------------------------------------- */

test("checkModuleSrcSync: exit code 2 (hand-edited) refuses", () => {
  const v = guards.checkModuleSrcSync(2);
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "module-src-hand-edited");
});

test("checkModuleSrcSync: exit code 0 (in sync or merely stale) passes", () => {
  const v = guards.checkModuleSrcSync(0);
  assert.strictEqual(v.ok, true);
});

/* --- checkNoBenchWorker --------------------------------------------------------------------- */

test("checkNoBenchWorker: a lane-B worker on the overlay refuses", () => {
  const pmLive = { workers: [{ item: "45", title: "bench run 46", lane: "B" }] };
  const v = guards.checkNoBenchWorker(pmLive, false);
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "no-bench-worker");
  assert.ok(v.message.includes("45"));
});

/* --- checkNoBenchWorker: the overlay signal is lane/item/branch, never title text (item 138) --
 * Pins named in the brief: a lane-R worker titled "bench guard reads worktrees" passes;
 * `item: "bench-47"` refuses; `lane: "B"` refuses (covered above); `branch: "pm/bench-48"`
 * refuses.
 */

test("checkNoBenchWorker: a lane-R worker whose TITLE names bench passes — title text is not a signal", () => {
  const pmLive = { workers: [{ item: "125+137", title: "deploy-cycle.js: bench guard reads worktrees and branches", lane: "R" }] };
  const v = guards.checkNoBenchWorker(pmLive, false);
  assert.strictEqual(v.ok, true);
});

test("checkNoBenchWorker: an item id starting with bench- refuses", () => {
  const pmLive = { workers: [{ item: "bench-47", title: "some worker", lane: "R" }] };
  const v = guards.checkNoBenchWorker(pmLive, false);
  assert.strictEqual(v.ok, false);
  assert.ok(v.message.includes("bench-47"));
});

test("checkNoBenchWorker: a branch starting with pm/bench- refuses, even with an unrelated item/title", () => {
  const pmLive = { workers: [{ item: "48", title: "some worker", branch: "pm/bench-48", lane: "R" }] };
  const v = guards.checkNoBenchWorker(pmLive, false);
  assert.strictEqual(v.ok, false);
});

test("checkNoBenchWorker: an AGENT field naming bench is not a signal either", () => {
  const pmLive = { workers: [{ item: "49", title: "ordinary work", agent: "bench-run agent", lane: "R" }] };
  const v = guards.checkNoBenchWorker(pmLive, false);
  assert.strictEqual(v.ok, true);
});

test("checkNoBenchWorker: --force-bench overrides a lane-B worker", () => {
  const pmLive = { workers: [{ item: "45", title: "bench run 46", lane: "B" }] };
  const v = guards.checkNoBenchWorker(pmLive, true);
  assert.strictEqual(v.ok, true);
});

test("checkNoBenchWorker: an empty overlay passes", () => {
  const v = guards.checkNoBenchWorker({ workers: [] }, false);
  assert.strictEqual(v.ok, true);
});

test("checkNoBenchWorker: a lane-R worker unrelated to the bench passes", () => {
  const pmLive = { workers: [{ item: "105", title: "R-96 (a) changes", lane: "R" }] };
  const v = guards.checkNoBenchWorker(pmLive, false);
  assert.strictEqual(v.ok, true);
});

/* --- checkNoBenchWorker: worktrees + branches (item 125) ------------------------------------ */

test("checkNoBenchWorker: a worktree line on pm/bench-46 refuses and names it", () => {
  const v = guards.checkNoBenchWorker({ workers: [] }, false, {
    worktrees: [{ path: "C:/dev/Skilltrees/.claude/worktrees/agent-x", branch: "pm/bench-46" }],
  });
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "no-bench-worker");
  assert.ok(v.message.includes("pm/bench-46"));
});

test("checkNoBenchWorker: the same worktree with --force-bench passes", () => {
  const v = guards.checkNoBenchWorker({ workers: [] }, true, {
    worktrees: [{ path: "C:/dev/Skilltrees/.claude/worktrees/agent-x", branch: "pm/bench-46" }],
  });
  assert.strictEqual(v.ok, true);
});

test("checkNoBenchWorker: an unmerged remote origin/pm/bench-47 refuses and names it", () => {
  const v = guards.checkNoBenchWorker({ workers: [] }, false, {
    branches: { remote: [{ name: "origin/pm/bench-47", merged: false }] },
  });
  assert.strictEqual(v.ok, false);
  assert.ok(v.message.includes("origin/pm/bench-47"));
});

test("checkNoBenchWorker: a merged origin/pm/bench-47 passes (merged into origin/main does not count)", () => {
  const v = guards.checkNoBenchWorker({ workers: [] }, false, {
    branches: { remote: [{ name: "origin/pm/bench-47", merged: true }] },
  });
  assert.strictEqual(v.ok, true);
});

test("checkNoBenchWorker: an unmerged LOCAL pm/bench-* branch also refuses", () => {
  const v = guards.checkNoBenchWorker({ workers: [] }, false, {
    branches: { local: [{ name: "pm/bench-50", merged: false }] },
  });
  assert.strictEqual(v.ok, false);
  assert.ok(v.message.includes("pm/bench-50"));
});

test("checkNoBenchWorker: the overlay-only case is unchanged when no worktree/branch data is given", () => {
  const pmLive = { workers: [{ item: "45", title: "bench run 46", lane: "B" }] };
  const v = guards.checkNoBenchWorker(pmLive, false);
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "no-bench-worker");
});

test("checkNoBenchWorker: a plain non-bench worktree (e.g. main branch) passes", () => {
  const v = guards.checkNoBenchWorker({ workers: [] }, false, {
    worktrees: [{ path: "C:/dev/Skilltrees", branch: "main" }],
    branches: { local: [], remote: [] },
  });
  assert.strictEqual(v.ok, true);
});

/* --- parseWorktreePorcelain -------------------------------------------------------------------- */

test("parseWorktreePorcelain: extracts path + branch, stripping refs/heads/", () => {
  const text = [
    "worktree C:/dev/Skilltrees",
    "HEAD 75629ae0000000000000000000000000000000",
    "branch refs/heads/main",
    "",
    "worktree C:/dev/Skilltrees/.claude/worktrees/agent-x",
    "HEAD abcdef0000000000000000000000000000000a",
    "branch refs/heads/pm/bench-46",
    "",
  ].join("\n");
  const result = guards.parseWorktreePorcelain(text);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].branch, "main");
  assert.strictEqual(result[1].branch, "pm/bench-46");
  assert.strictEqual(result[1].path, "C:/dev/Skilltrees/.claude/worktrees/agent-x");
});

test("parseWorktreePorcelain: a detached worktree has a null branch", () => {
  const text = ["worktree C:/somewhere", "HEAD abc123", "detached", ""].join("\n");
  const result = guards.parseWorktreePorcelain(text);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].branch, null);
});

/* --- checkPacksExist ------------------------------------------------------------------------ */

test("checkPacksExist: a missing pack directory refuses and names it", () => {
  const map = { "edha-leyline": true, "edha-deity": true, "edha-heroic": false, "edha-adversaries": true, "edha-items": true };
  const v = guards.checkPacksExist(map);
  assert.strictEqual(v.ok, false);
  assert.ok(v.message.includes("edha-heroic"));
});

test("checkPacksExist: all five present passes", () => {
  const map = Object.fromEntries(guards.PACKS.map((p) => [p, true]));
  const v = guards.checkPacksExist(map);
  assert.strictEqual(v.ok, true);
});

/* --- checkWorldConfigured ------------------------------------------------------------------- */

test("checkWorldConfigured: no world key refuses", () => {
  const v = guards.checkWorldConfigured({});
  assert.strictEqual(v.ok, false);
});

test("checkWorldConfigured: null options.json (file absent) refuses", () => {
  const v = guards.checkWorldConfigured(null);
  assert.strictEqual(v.ok, false);
});

test("checkWorldConfigured: a configured world passes", () => {
  const v = guards.checkWorldConfigured({ world: "edha" });
  assert.strictEqual(v.ok, true);
});

/* --- checkFoundryExe ------------------------------------------------------------------------ */

test("checkFoundryExe: a missing executable refuses", () => {
  const v = guards.checkFoundryExe("C:/nowhere/Foundry.exe", false);
  assert.strictEqual(v.ok, false);
});

test("checkFoundryExe: an existing executable passes", () => {
  const v = guards.checkFoundryExe("C:/somewhere/Foundry.exe", true);
  assert.strictEqual(v.ok, true);
});

/* --- pickExePath (priority: --exe > running process > default) ------------------------------ */

test("pickExePath: an explicit --exe wins over everything", () => {
  const p = guards.pickExePath({ argExe: "C:/custom/Foundry.exe", runningProcessPath: "C:/running/Foundry.exe", defaultPath: "C:/default/Foundry.exe" });
  assert.strictEqual(p, "C:/custom/Foundry.exe");
});

test("pickExePath: the running process's path wins over the default", () => {
  const p = guards.pickExePath({ argExe: null, runningProcessPath: "C:/running/Foundry.exe", defaultPath: "C:/default/Foundry.exe" });
  assert.strictEqual(p, "C:/running/Foundry.exe");
});

test("pickExePath: falls back to the default when nothing else is given", () => {
  const p = guards.pickExePath({ argExe: null, runningProcessPath: null, defaultPath: "C:/default/Foundry.exe" });
  assert.strictEqual(p, "C:/default/Foundry.exe");
});

/* --- stampsNewerThan ------------------------------------------------------------------------- */

test("stampsNewerThan: a pack stamped before the run's start fails, and names it", () => {
  const t0 = 1000;
  const stats = [
    { pack: "edha-leyline", mtimeMs: 2000 },
    { pack: "edha-deity", mtimeMs: 500 }, // stale — older than t0
  ];
  const v = guards.stampsNewerThan(stats, t0);
  assert.strictEqual(v.ok, false);
  assert.ok(v.message.includes("edha-deity"));
  assert.ok(!v.message.includes("edha-leyline"));
});

test("stampsNewerThan: every pack stamped after the run's start passes", () => {
  const t0 = 1000;
  const stats = guards.PACKS.map((pack) => ({ pack, mtimeMs: 2000 }));
  const v = guards.stampsNewerThan(stats, t0);
  assert.strictEqual(v.ok, true);
});

/* --- enginesMatch (CRLF vs LF) ---------------------------------------------------------------- */

test("enginesMatch: a CRLF-served engine matches its LF twin (byte content identical)", () => {
  const lf = "function edhaFoo() {\n  return 1;\n}\n";
  const crlf = lf.replace(/\n/g, "\r\n");
  const v = guards.enginesMatch(crlf, lf);
  assert.strictEqual(v.ok, true, v.message);
});

test("enginesMatch: genuinely different content fails even after CRLF normalisation", () => {
  const repoText = "function edhaFoo() {\n  return 1;\n}\n";
  const servedText = "function edhaFoo() {\n  return 2;\n}\n";
  const v = guards.enginesMatch(servedText, repoText);
  assert.strictEqual(v.ok, false);
});

/* --- shouldSkipBackupFile (item 129: LOCK + EBUSY/EPERM) ---------------------------------------- */

test("shouldSkipBackupFile: the LevelDB LOCK file is always skipped", () => {
  assert.strictEqual(guards.shouldSkipBackupFile("LOCK", null), true);
});

test("shouldSkipBackupFile: an EBUSY error on an ordinary file is skipped", () => {
  const err = Object.assign(new Error("busy"), { code: "EBUSY" });
  assert.strictEqual(guards.shouldSkipBackupFile("000123.log", err), true);
});

test("shouldSkipBackupFile: an EPERM error is skipped", () => {
  const err = Object.assign(new Error("perm"), { code: "EPERM" });
  assert.strictEqual(guards.shouldSkipBackupFile("MANIFEST-000001", err), true);
});

test("shouldSkipBackupFile: an ordinary file with no error is NOT skipped", () => {
  assert.strictEqual(guards.shouldSkipBackupFile("000123.ldb", null), false);
});

test("shouldSkipBackupFile: a different error code is NOT skipped (a real failure must still abort)", () => {
  const err = Object.assign(new Error("disk full"), { code: "ENOSPC" });
  assert.strictEqual(guards.shouldSkipBackupFile("000123.ldb", err), false);
});

/* --- isBackupStepFailure (item 129) -------------------------------------------------------------- */

test("isBackupStepFailure: matches the backup step's name", () => {
  assert.strictEqual(guards.isBackupStepFailure("2/9 back up packs"), true);
});

test("isBackupStepFailure: does not match the close or relaunch steps", () => {
  assert.strictEqual(guards.isBackupStepFailure("1/9 close Foundry"), false);
  assert.strictEqual(guards.isBackupStepFailure("9/9 relaunch + poll"), false);
});

/* --- checkJoinRedirect -------------------------------------------------------------------------- */

test("checkJoinRedirect: a /setup redirect fails (no world loaded)", () => {
  const v = guards.checkJoinRedirect({ status: 302, location: "/setup", joinBody: "", worldTitle: "edha" });
  assert.strictEqual(v.ok, false);
  assert.strictEqual(v.name, "join-redirect");
});

test("checkJoinRedirect: a non-302 status fails", () => {
  const v = guards.checkJoinRedirect({ status: 200, location: "/join", joinBody: "edha", worldTitle: "edha" });
  assert.strictEqual(v.ok, false);
});

test("checkJoinRedirect: /join without the world's title fails", () => {
  const v = guards.checkJoinRedirect({ status: 302, location: "/join", joinBody: "some other world", worldTitle: "edha" });
  assert.strictEqual(v.ok, false);
});

test("checkJoinRedirect: a proper 302 -> /join naming the world passes", () => {
  const v = guards.checkJoinRedirect({ status: 302, location: "/join", joinBody: "<title>edha</title>", worldTitle: "edha" });
  assert.strictEqual(v.ok, true);
});

/* --- engineSha8 (item 137) ---------------------------------------------------------------------- */

test("engineSha8: a CRLF-served body hashes the same as its LF twin", () => {
  const lf = "function edhaFoo() {\n  return 1;\n}\n";
  const crlf = lf.replace(/\n/g, "\r\n");
  assert.strictEqual(guards.engineSha8(lf), guards.engineSha8(crlf));
});

/* --- shouldRetryVerify (item 137: the post-flight verification races Foundry's boot) ------------
 * Pins named in the brief: a 404 at 5s retries; a wrong sha at 10s retries; the right sha passes;
 * a wrong sha AT the deadline fails.
 */

test("shouldRetryVerify: a 404 at 5s retries", () => {
  const d = guards.shouldRetryVerify({ status: 404, body: "", expectedSha: "abcd1234", elapsed: 5000, deadline: 90000 });
  assert.strictEqual(d.outcome, "retry");
});

test("shouldRetryVerify: a wrong sha at 10s retries", () => {
  const d = guards.shouldRetryVerify({ status: 200, body: "not the engine", expectedSha: "abcd1234", elapsed: 10000, deadline: 90000 });
  assert.strictEqual(d.outcome, "retry");
});

test("shouldRetryVerify: the right sha passes", () => {
  const body = "function edhaFoo() { return 1; }\n";
  const expectedSha = guards.engineSha8(body);
  const d = guards.shouldRetryVerify({ status: 200, body, expectedSha, elapsed: 500, deadline: 90000 });
  assert.strictEqual(d.outcome, "pass");
  assert.strictEqual(d.ok, true);
});

test("shouldRetryVerify: a wrong sha AT the deadline fails, naming the last observed status/sha", () => {
  const d = guards.shouldRetryVerify({ status: 200, body: "still wrong", expectedSha: "abcd1234", elapsed: 90000, deadline: 90000 });
  assert.strictEqual(d.outcome, "fail");
  assert.strictEqual(d.ok, false);
  assert.ok(d.message.includes("abcd1234"));
});

test("shouldRetryVerify: a fetch error (status 0) before the deadline retries, not fails", () => {
  const d = guards.shouldRetryVerify({ status: 0, body: "", expectedSha: "abcd1234", elapsed: 1000, deadline: 90000 });
  assert.strictEqual(d.outcome, "retry");
});

/* --- shouldRetryJoin (item 137, the /join title check gets the same bounded-retry policy) ------- */

test("shouldRetryJoin: a /setup redirect before the deadline retries", () => {
  const d = guards.shouldRetryJoin({ status: 302, location: "/setup", joinBody: "", worldTitle: "edha", elapsed: 1000, deadline: 90000 });
  assert.strictEqual(d.outcome, "retry");
});

test("shouldRetryJoin: a /setup redirect AT the deadline fails", () => {
  const d = guards.shouldRetryJoin({ status: 302, location: "/setup", joinBody: "", worldTitle: "edha", elapsed: 90000, deadline: 90000 });
  assert.strictEqual(d.outcome, "fail");
});

test("shouldRetryJoin: a proper /join naming the world passes immediately", () => {
  const d = guards.shouldRetryJoin({ status: 302, location: "/join", joinBody: "<title>edha</title>", worldTitle: "edha", elapsed: 500, deadline: 90000 });
  assert.strictEqual(d.outcome, "pass");
});

/* --- formatDeployRecordLine / insertDeployStateRecord ------------------------------------------ */

test("formatDeployRecordLine: renders the exact shape the checklist/run-log expect", () => {
  const line = guards.formatDeployRecordLine({ iso: "2026-09-14T02:15:00.000Z", sha: "5bfa8ff", packStamp: "2026-09-14T02:15:03.000Z", engineSha8: "921132b0" });
  assert.strictEqual(
    line,
    "Agent-run deploy 2026-09-14T02:15:00.000Z from main @ 5bfa8ff: packs 2026-09-14T02:15:03.000Z, engine 921132b0 = HEAD, validators PASS"
  );
});

test("insertDeployStateRecord: inserts as the FIRST paragraph under the heading, above what was first before", () => {
  const fixture = [
    "# ⚑ DEPLOY STATE (confirmed by Ben 2026-07-26 — the migration deploy is LIVE)",
    "",
    "**What is live on Ben's machine:** the existing paragraph, untouched.",
    "",
  ].join("\n");
  const line = "Agent-run deploy 2026-09-14T02:15:00Z from main @ 5bfa8ff: packs 2026-09-14T02:15:03Z, engine 921132b0 = HEAD, validators PASS";
  const updated = guards.insertDeployStateRecord(fixture, line);

  const headingIdx = updated.indexOf("# ⚑ DEPLOY STATE");
  const newLineIdx = updated.indexOf(line);
  const oldParaIdx = updated.indexOf("**What is live on Ben's machine:**");

  assert.ok(headingIdx !== -1 && newLineIdx !== -1 && oldParaIdx !== -1);
  assert.ok(headingIdx < newLineIdx, "the new line must come after the heading");
  assert.ok(newLineIdx < oldParaIdx, "the new line must come BEFORE the paragraph that used to be first");
  // The old paragraph itself must survive verbatim.
  assert.ok(updated.includes("the existing paragraph, untouched."));
});

test("insertDeployStateRecord: throws (does not silently no-op) when the heading is missing", () => {
  assert.throws(() => guards.insertDeployStateRecord("no heading here at all", "some line"));
});

/* --- deploy-cycle.js --dry-run: prints every step and every guard's verdict, changes nothing ---
 *
 * Spawns the real script (the ONLY place this test file does), pointed at scratch EDHA_MODROOT /
 * EDHA_FOUNDRY_USERDATA directories so it never reads or touches a real Foundry install — and
 * `--dry-run` itself guarantees no git/process/pack-directory write happens regardless. This is
 * the "no process control in CI" case the item's brief calls for: on ubuntu-latest (CI's actual
 * runner) every PowerShell-backed helper in deploy-cycle.js short-circuits on `process.platform`
 * before it would ever spawn `powershell.exe`, so this spawn is safe there too.
 */

test("deploy-cycle.js --dry-run: prints every step + guard verdicts, and makes no changes", () => {
  const scratchRoot = fs.mkdtempSync(path.join(os.tmpdir(), "edha-deploycycle-test-"));
  const scratchModroot = path.join(scratchRoot, "modroot");
  const scratchUserdata = path.join(scratchRoot, "userdata");
  fs.mkdirSync(scratchModroot, { recursive: true });
  fs.mkdirSync(path.join(scratchUserdata, "Config"), { recursive: true });

  const checklistBefore = fs.readFileSync(path.join(REPO, "EDHA_FOUNDRY_TEST_CHECKLIST.md"), "utf8");
  const backupsDir = path.join(REPO, "tmp", "deploy-backups");
  const backupsDirsBefore = fs.existsSync(backupsDir) ? fs.readdirSync(backupsDir) : [];

  const r = cp.spawnSync(process.execPath, [path.join(REPO, "scripts", "deploy-cycle.js"), "--dry-run"], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, EDHA_MODROOT: scratchModroot, EDHA_FOUNDRY_USERDATA: scratchUserdata },
  });

  try {
    const out = (r.stdout || "") + (r.stderr || "");

    assert.ok(out.includes("DRY RUN"), "must announce dry-run mode");
    assert.ok(out.includes("Pre-flight guards:"), "must print the guards section");
    for (const guardName of ["on-main", "no-bench-worker", "packs-exist", "world-configured", "foundry-exe-exists"]) {
      // module-src-sync's guard name varies (module-src-sync vs module-src-hand-edited) — check
      // the five whose name is fixed regardless of verdict.
      assert.ok(out.includes(guardName), `expected the ${guardName} guard's verdict line in dry-run output`);
    }
    for (const stepFragment of [
      "1. Close Foundry",
      "2. Back up the five packs",
      "3. git pull --ff-only",
      "4. module-src-sync.js status",
      "5. module-src-sync.js push",
      "6. sync-art.js",
      "7. foundry-build.js",
      "8. validate-packs.js",
      "9. Relaunch the exe",
    ]) {
      assert.ok(out.includes(stepFragment), `expected step text "${stepFragment}" in dry-run output`);
    }
    assert.ok(out.includes("nothing was changed"), "dry-run must say it changed nothing");
    assert.ok(!out.includes("Backed up"), "dry-run must never reach the backup step");

    // item 137: the post-flight description must say verification retries/waits up to
    // --wait-seconds, not just checks once.
    assert.ok(out.includes("--wait-seconds"), "dry-run must mention the post-flight verification's --wait-seconds bound");
    assert.ok(/retried with backoff/i.test(out), "dry-run must describe the post-flight checks as retried, not one-shot");

    // item 129: the backup must be PRINTED after the close, not before — this is the step-order
    // regression the item exists to pin. Reverting the order (backup before close) fails this.
    const closeIdx = out.indexOf("1. Close Foundry");
    const backupIdx = out.indexOf("2. Back up the five packs");
    assert.ok(closeIdx !== -1 && backupIdx !== -1, "both the close and backup step lines must be present");
    assert.ok(closeIdx < backupIdx, "the close step must be printed BEFORE the backup step");

    // Prove it by mutation-adjacent evidence too, not just the printed claim: the checklist file
    // and the backups directory are byte-for-byte / entry-for-entry unchanged.
    const checklistAfter = fs.readFileSync(path.join(REPO, "EDHA_FOUNDRY_TEST_CHECKLIST.md"), "utf8");
    assert.strictEqual(checklistAfter, checklistBefore, "dry-run must not touch the checklist file");
    const backupsDirsAfter = fs.existsSync(backupsDir) ? fs.readdirSync(backupsDir) : [];
    assert.deepStrictEqual(backupsDirsAfter, backupsDirsBefore, "dry-run must not create a backup directory");
  } finally {
    fs.rmSync(scratchRoot, { recursive: true, force: true });
  }
});
