#!/usr/bin/env node
/* scripts/deploy-cycle.js — the agent-run deploy cycle (TODO_REPO_HYGIENE item 122).
 *
 * Reproduces, as ONE gated script, what the PM ran by hand as an ad-hoc shell chain on
 * 2026-09-13 14:41 ET (docs/PM_BOARD.md run log) — itself a faithful re-run of
 * `scripts/deploy-to-foundry.bat` steps 1–8 with the `pause` prompts skipped, PLUS the two things
 * the bat never did: closing Foundry gracefully beforehand, and relaunching + verifying it
 * afterward. Ben, chat 2026-09-13: *"I'm confirming that there's no way for you to close Foundry,
 * run the deploy.bat, reopen Foundry, and log in to the GM bench profile? … I would love if you
 * could handle that for me."* — then, after the PM's ad-hoc run: *"Can we test and write a few
 * gates and guardrails that are needed?"* This file is the answer: guards before anything is
 * touched, a timestamped backup of the packs AFTER Foundry has actually closed (item 129: the
 * first live run backed up BEFORE the close and died on the still-open LevelDB `LOCK` file), the
 * nine steps fail-fast with a log, and a post-flight verification before the run is ever called
 * done.
 *
 * Usage:
 *   node scripts/deploy-cycle.js                 same as --dry-run (the safe default)
 *   node scripts/deploy-cycle.js --dry-run        print every step + every guard's verdict; touch nothing
 *   node scripts/deploy-cycle.js --yes             actually run it (guards must all pass first)
 *   node scripts/deploy-cycle.js --yes --force-bench   override the "no bench worker" guard (Ben's call)
 *   node scripts/deploy-cycle.js --exe "<path>"        override the resolved Foundry executable path
 *   node scripts/deploy-cycle.js --wait-seconds 90     bound on the post-relaunch poll (default 90)
 *
 * ARCHITECTURE. Every refuse/pass/fail DECISION is a named pure function imported from
 * `scripts/lib/deploy-guards.js` — this file's only job is to gather the real data (git, fs,
 * PowerShell for process control ONLY, plain `http` for the localhost poll) and hand it to those
 * functions. That split is what lets `tests/deploy-cycle.test.js` pin every guard against a
 * fixture with no Foundry, no live git remote, and no Windows (CI is `ubuntu-latest`) — the ONLY
 * thing CI's smoke test does with this file itself is spawn it with `--dry-run`, which never
 * calls PowerShell, never touches the module dir, and never writes outside `tmp/`.
 *
 * The five packs this rebuilds/verifies, in build order (bat step 7): leyline, deity, heroic,
 * adversaries, items — see `deploy-guards.js`'s `PACKS` (adversaries/items are actor/item packs,
 * not atlases, but bat step 7 and this script build all five the same way).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const http = require("http");
const { execFileSync, spawnSync } = require("child_process");

const { REPO_ROOT, MODROOT, FOUNDRY_USERDATA } = require("./lib/paths.js");
const guards = require("./lib/deploy-guards.js");

const SCRIPTS_DIR = __dirname;
const CHECKLIST_PATH = path.join(REPO_ROOT, "EDHA_FOUNDRY_TEST_CHECKLIST.md");
const ENGINE_REPO_PATH = path.join(REPO_ROOT, "module-src", "scripts", "register-skills.js");
const DEFAULT_EXE = "C:/Program Files/Foundry Virtual Tabletop/Foundry Virtual Tabletop.exe";
const FOUNDRY_PROCESS_NAME = "Foundry Virtual Tabletop";

/* --- CLI args --------------------------------------------------------------------------------- */

function flagValue(args, name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : null;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const yes = args.includes("--yes");
  return {
    yes,
    dryRun: !yes, // --dry-run is the default whenever --yes is not explicitly given
    forceBench: args.includes("--force-bench"),
    exe: flagValue(args, "--exe"),
    waitSeconds: Number(flagValue(args, "--wait-seconds") || 90),
  };
}

/* --- Small helpers ----------------------------------------------------------------------------- */

function nowIso() {
  return new Date().toISOString();
}

function timestampSlug(d = new Date()) {
  return d.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function git(args) {
  return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" }).trim();
}

function sha256(text) {
  return require("crypto").createHash("sha256").update(text).digest("hex");
}

/* --- Gathering real state (the only non-pure code in this file) ------------------------------- */

function gatherGitState() {
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  const statusOut = execFileSync("git", ["status", "--porcelain"], { cwd: REPO_ROOT, encoding: "utf8" });
  const clean = statusOut.trim() === "";
  let ahead = 0, behind = 0, fetchError = null;
  try {
    execFileSync("git", ["fetch", "origin", "main"], { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const counts = git(["rev-list", "--left-right", "--count", "HEAD...origin/main"]);
    const parts = counts.split(/\s+/).map(Number);
    ahead = parts[0] || 0;
    behind = parts[1] || 0;
  } catch (e) {
    fetchError = e.message;
  }
  const sha = git(["rev-parse", "--short", "HEAD"]);
  return { branch, clean, ahead, behind, sha, fetchError };
}

function moduleSrcSyncStatus() {
  const r = spawnSync(process.execPath, [path.join(SCRIPTS_DIR, "module-src-sync.js"), "status"], {
    cwd: SCRIPTS_DIR,
    encoding: "utf8",
  });
  return { exitCode: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

function readJsonSafe(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function readPmLive() {
  return readJsonSafe(path.join(REPO_ROOT, "docs", "pm-live.json")) || { workers: [] };
}

function readOptionsJson() {
  return readJsonSafe(path.join(FOUNDRY_USERDATA, "Config", "options.json"));
}

function packDirExistsMap() {
  const map = {};
  for (const pack of guards.PACKS) {
    map[pack] = fs.existsSync(path.join(MODROOT, "packs", pack));
  }
  return map;
}

function isWindows() {
  return process.platform === "win32";
}

// Read-only: the path Windows reports for the executable of an already-running Foundry process
// (Get-Process's ProcessName, unlike `tasklist`, is NOT truncated at 25 chars — see the bat's own
// comment on that trap). Returns null off-Windows, if Foundry isn't running, or on any error.
function runningFoundryExePath() {
  if (!isWindows()) return null;
  try {
    const r = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `(Get-Process -Name "${FOUNDRY_PROCESS_NAME}" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)`,
      ],
      { encoding: "utf8" }
    );
    const out = (r.stdout || "").trim();
    return out || null;
  } catch {
    return null;
  }
}

function isFoundryRunning() {
  if (!isWindows()) return false;
  try {
    const r = spawnSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", `@(Get-Process -Name "${FOUNDRY_PROCESS_NAME}" -ErrorAction SilentlyContinue).Count`],
      { encoding: "utf8" }
    );
    return Number((r.stdout || "0").trim()) > 0;
  } catch {
    return false;
  }
}

function resolveExe(cliExe) {
  const running = runningFoundryExePath();
  const chosen = guards.pickExePath({ argExe: cliExe, runningProcessPath: running, defaultPath: DEFAULT_EXE });
  return { chosen, exists: fs.existsSync(chosen) };
}

/* --- Guard evaluation (dry-run AND real run both call this) ------------------------------------ */

function evaluateGuards(ctx, flags) {
  const results = [];
  results.push(guards.checkOnMainClean({ branch: ctx.git.branch, clean: ctx.git.clean }));
  results.push(guards.checkModuleSrcSync(ctx.moduleSrcStatus.exitCode));
  results.push(guards.checkNoBenchWorker(ctx.pmLive, flags.forceBench));
  results.push(guards.checkPacksExist(ctx.packExists));
  results.push(guards.checkWorldConfigured(ctx.optionsJson));
  results.push(guards.checkFoundryExe(ctx.exe.chosen, ctx.exe.exists));
  return results;
}

function printVerdicts(label, results) {
  console.log(`\n${label}`);
  for (const r of results) {
    console.log(`  ${r.ok ? "PASS" : "REFUSE"}  ${r.name} — ${r.message}`);
  }
}

/* --- Backups ------------------------------------------------------------------------------------
 * Copies the five pack directories into a timestamped folder under tmp/deploy-backups/ (gitignored
 * — `tmp/` is already in .gitignore) — step 2, run AFTER Foundry has actually closed (step 1) and
 * BEFORE anything is overwritten. item 129: the first live run backed up BEFORE the close, so the
 * copy hit a running Foundry's open LevelDB `LOCK` file and died on EBUSY. copyDirRecursive skips
 * `LOCK` itself, and any file whose copy throws EBUSY/EPERM (a handle Windows hasn't released
 * yet) — see `shouldSkipBackupFile` in deploy-guards.js — logging the skip via `onSkip` rather
 * than aborting the whole backup over a file the restore command never needs anyway.
 * module-src-sync.js push makes its own copy of the engine it replaces under
 * %TEMP%\edha-engine-backups — noted here, not duplicated.
 */

function copyDirRecursive(src, dst, onSkip) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(s, d, onSkip);
      continue;
    }
    if (guards.shouldSkipBackupFile(entry.name, null)) {
      if (onSkip) onSkip(entry.name, null);
      continue;
    }
    try {
      fs.copyFileSync(s, d);
    } catch (err) {
      if (guards.shouldSkipBackupFile(entry.name, err)) {
        if (onSkip) onSkip(entry.name, err);
        continue;
      }
      throw err;
    }
  }
}

function backupPacks(runTimestamp, onSkip) {
  const backupDir = path.join(REPO_ROOT, "tmp", "deploy-backups", runTimestamp);
  let backedUp = 0;
  for (const pack of guards.PACKS) {
    const src = path.join(MODROOT, "packs", pack);
    if (!fs.existsSync(src)) continue;
    copyDirRecursive(src, path.join(backupDir, "packs", pack), onSkip);
    backedUp++;
  }
  return { backupDir, backedUp };
}

function restoreCommand(backupDir) {
  const src = path.join(backupDir, "packs").replace(/\//g, "\\");
  const dst = path.join(MODROOT, "packs").replace(/\//g, "\\");
  return `Copy-Item -Recurse -Force "${src}\\*" "${dst}\\"   (PowerShell; Foundry must be closed first)`;
}

/* --- Logging ------------------------------------------------------------------------------------ */

function makeLogger(runTimestamp) {
  const logDir = path.join(REPO_ROOT, "tmp", "deploy-logs");
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `${runTimestamp}.log`);
  const stream = fs.createWriteStream(logPath, { flags: "a" });
  return {
    logPath,
    write(text) {
      stream.write(text.endsWith("\n") ? text : text + "\n");
    },
    close() {
      stream.end();
    },
  };
}

/* --- The nine steps (bat's order, backup moved after the close — item 129) ---------------------- */

function runNode(scriptRelPath, args, logger) {
  const r = spawnSync(process.execPath, [path.join(SCRIPTS_DIR, scriptRelPath), ...args], {
    cwd: SCRIPTS_DIR,
    encoding: "utf8",
  });
  logger.write(`$ node ${scriptRelPath} ${args.join(" ")}\n${r.stdout || ""}${r.stderr || ""}`);
  if (r.status !== 0) {
    throw new Error(`${scriptRelPath} ${args.join(" ")} exited ${r.status}\n${r.stderr || r.stdout || ""}`);
  }
  return r.stdout || "";
}

function closeFoundryStep(logger) {
  if (!isWindows()) {
    logger.write("closeFoundryStep: non-Windows platform — nothing to close, treating as already closed.");
    return;
  }
  if (!isFoundryRunning()) {
    logger.write("closeFoundryStep: Foundry was not running.");
    return;
  }
  const script = [
    `$procs = Get-Process -Name "${FOUNDRY_PROCESS_NAME}" -ErrorAction SilentlyContinue`,
    `if ($procs) { $procs | ForEach-Object { $_.CloseMainWindow() | Out-Null } }`,
    `$deadline = (Get-Date).AddSeconds(20)`,
    `while ((Get-Date) -lt $deadline) {`,
    `  $remaining = Get-Process -Name "${FOUNDRY_PROCESS_NAME}" -ErrorAction SilentlyContinue`,
    `  if (-not $remaining) { break }`,
    `  Start-Sleep -Milliseconds 500`,
    `}`,
    `$remaining = Get-Process -Name "${FOUNDRY_PROCESS_NAME}" -ErrorAction SilentlyContinue`,
    `if ($remaining) { $remaining | Stop-Process -Force }`,
    `$final = @(Get-Process -Name "${FOUNDRY_PROCESS_NAME}" -ErrorAction SilentlyContinue)`,
    `Write-Output ("REMAINING=" + $final.Count)`,
  ].join("\n");
  const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { encoding: "utf8" });
  logger.write(`closeFoundryStep:\n${r.stdout || ""}${r.stderr || ""}`);
  if (r.status !== 0) throw new Error(`Foundry close script failed (exit ${r.status}): ${r.stderr}`);
  if (!/REMAINING=0/.test(r.stdout || "")) {
    throw new Error(`Foundry did not fully close: ${(r.stdout || "").trim()}`);
  }
}

function gitPullStep(logger) {
  const out = execFileSync("git", ["-c", "maintenance.auto=false", "-c", "gc.auto=0", "pull", "--ff-only"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  logger.write(`git pull --ff-only:\n${out}`);
}

function moduleSrcSyncPushStep(logger) {
  runNode("module-src-sync.js", ["push"], logger);
}

function syncArtStep(logger) {
  runNode("sync-art.js", [], logger);
}

function rebuildPacksStep(logger) {
  for (const scope of ["leyline", "deity", "heroic", "adversaries", "items"]) {
    runNode("foundry-build.js", [scope], logger);
  }
}

function validatePacksStep(logger) {
  runNode("validate-packs.js", [], logger);
  runNode("validate-adversaries.js", [], logger);
}

function relaunchAndPollStep(exePath, waitSeconds, logger) {
  const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `Start-Process -FilePath "${exePath}"`], {
    encoding: "utf8",
  });
  logger.write(`relaunch:\n${r.stdout || ""}${r.stderr || ""}`);
  if (r.status !== 0) throw new Error(`Foundry relaunch failed (exit ${r.status}): ${r.stderr}`);
  return pollUntilRedirect(waitSeconds).then((res) => {
    logger.write(`poll: ${res.status} -> ${res.location}`);
    return res;
  });
}

function pollUntilRedirect(waitSeconds) {
  const deadline = Date.now() + waitSeconds * 1000;
  return new Promise((resolve, reject) => {
    function attempt() {
      const req = http.get({ host: "localhost", port: 30000, path: "/", timeout: 3000 }, (res) => {
        res.resume();
        if (res.statusCode === 302) {
          resolve({ status: res.statusCode, location: res.headers.location });
          return;
        }
        retryOrFail(new Error(`answered ${res.statusCode}, not 302`));
      });
      req.on("error", retryOrFail);
      req.on("timeout", () => {
        req.destroy();
        retryOrFail(new Error("timed out"));
      });
      function retryOrFail(err) {
        if (Date.now() > deadline) reject(new Error(`Foundry did not answer 302 within ${waitSeconds}s (${err.message})`));
        else setTimeout(attempt, 1000);
      }
    }
    attempt();
  });
}

function fetchText(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: "localhost", port: 30000, path: urlPath, timeout: 5000 }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timed out"));
    });
  });
}

/* --- Post-flight verification -------------------------------------------------------------------- */

async function postFlightVerify(t0, worldTitle) {
  const results = [];

  const stats = guards.PACKS.map((pack) => {
    const dir = path.join(MODROOT, "packs", pack);
    let mtimeMs = -Infinity;
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        const m = fs.statSync(path.join(dir, f)).mtimeMs;
        if (m > mtimeMs) mtimeMs = m;
      }
    }
    return { pack, mtimeMs };
  });
  results.push(guards.stampsNewerThan(stats, t0));

  const repoText = fs.readFileSync(ENGINE_REPO_PATH, "utf8");
  let servedText = "";
  try {
    const r = await fetchText(`/modules/edha-content/scripts/register-skills.js?bust=${Date.now()}`);
    servedText = r.body;
  } catch (e) {
    results.push({ ok: false, name: "engine-matches-head", message: `refused — could not fetch served engine: ${e.message}` });
  }
  if (servedText) results.push(guards.enginesMatch(servedText, repoText));

  try {
    const root = await fetchText("/");
    let joinBody = "";
    if (root.status === 302 && root.headers) joinBody = "";
    try {
      const join = await fetchText("/join");
      joinBody = join.body;
    } catch {
      /* ignore — checkJoinRedirect below will still fail on missing location if root itself failed */
    }
    results.push(guards.checkJoinRedirect({ status: root.status, location: root.headers ? root.headers.location : undefined, joinBody, worldTitle }));
  } catch (e) {
    results.push({ ok: false, name: "join-redirect", message: `refused — could not reach localhost:30000: ${e.message}` });
  }

  return { results, stats, engineSha8: sha256(guards.normalizeCRLF(repoText)).slice(0, 8) };
}

/* --- The DEPLOY STATE record ---------------------------------------------------------------------- */

function writeDeployStateRecord(line) {
  const text = fs.readFileSync(CHECKLIST_PATH, "utf8");
  const updated = guards.insertDeployStateRecord(text, line);
  fs.writeFileSync(CHECKLIST_PATH, updated);
}

/* --- Main ---------------------------------------------------------------------------------------- */

async function main() {
  const flags = parseArgs(process.argv);
  const runTimestamp = timestampSlug();
  const t0 = Date.now();

  console.log(`deploy-cycle.js — ${flags.dryRun ? "DRY RUN (no changes will be made)" : "LIVE RUN"}`);
  console.log(`run id: ${runTimestamp}`);

  const gitState = gatherGitState();
  const moduleSrcStatus = moduleSrcSyncStatus();
  const pmLive = readPmLive();
  const packExists = packDirExistsMap();
  const optionsJson = readOptionsJson();
  const exe = resolveExe(flags.exe);

  const ctx = { git: gitState, moduleSrcStatus, pmLive, packExists, optionsJson, exe };
  const preflight = evaluateGuards(ctx, flags);
  printVerdicts("Pre-flight guards:", preflight);

  console.log("\nThe nine steps (bat's order, backup moved after the close):");
  const stepList = [
    "1. Close Foundry gracefully (CloseMainWindow, bounded wait, force leftovers, verify zero remain)",
    "2. Back up the five packs to tmp/deploy-backups/<run id> (LOCK and other EBUSY/EPERM files skipped)",
    "3. git pull --ff-only on main",
    "4. module-src-sync.js status (refuse on hand-edited exit 2)",
    "5. module-src-sync.js push (engine backed up to %TEMP%\\edha-engine-backups first)",
    "6. sync-art.js",
    "7. foundry-build.js leyline | deity | heroic | adversaries | items",
    "8. validate-packs.js + validate-adversaries.js",
    "9. Relaunch the exe, poll http://localhost:30000/ until it answers 302 -> /join",
  ];
  for (const s of stepList) console.log(`  ${s}`);

  console.log("\nPost-flight verification: pack stamps newer than run start; served engine sha256 == HEAD's (CRLF-normalised); / -> /join names the world.");

  const guardsPass = preflight.every((r) => r.ok);

  if (flags.dryRun) {
    console.log(`\n[dry-run] guards would ${guardsPass ? "ALL PASS" : "REFUSE — see above"}; nothing was changed.`);
    if (gitState.fetchError) console.log(`[dry-run] note: git fetch origin main failed (${gitState.fetchError}) — ahead/behind above may be stale.`);
    process.exit(guardsPass ? 0 : 1);
    return;
  }

  if (!guardsPass) {
    console.error("\nREFUSED — one or more pre-flight guards failed. Nothing was changed. Fix the guard(s) above and re-run.");
    process.exit(1);
    return;
  }

  const logger = makeLogger(runTimestamp);
  let backupDir = null; // set once step 2 (backup) completes; used by restoreCommand below

  const steps = [
    ["1/9 close Foundry", () => closeFoundryStep(logger)],
    ["2/9 back up packs", () => {
      const backup = backupPacks(runTimestamp, (name, err) =>
        logger.write(`backup: skipped ${name}${err ? ` (${err.code || err.message})` : ""}`)
      );
      backupDir = backup.backupDir;
      console.log(`  backed up ${backup.backedUp} pack dir(s) to ${backupDir}`);
      console.log(`  restore command if a later step fails: ${restoreCommand(backupDir)}`);
      logger.write(`Backed up ${backup.backedUp} pack dir(s) to ${backupDir}`);
    }],
    ["3/9 git pull --ff-only", () => gitPullStep(logger)],
    ["4/9 module-src-sync status", () => {
      const s = moduleSrcSyncStatus();
      const v = guards.checkModuleSrcSync(s.exitCode);
      logger.write(`module-src-sync status: ${v.message}`);
      if (!v.ok) throw new Error(v.message);
    }],
    ["5/9 module-src-sync push", () => moduleSrcSyncPushStep(logger)],
    ["6/9 sync-art", () => syncArtStep(logger)],
    ["7/9 rebuild packs", () => rebuildPacksStep(logger)],
    ["8/9 validate packs", () => validatePacksStep(logger)],
    ["9/9 relaunch + poll", () => relaunchAndPollStep(exe.chosen, flags.waitSeconds, logger)],
  ];

  let joinResult = null;
  for (const [name, fn] of steps) {
    console.log(`\n> ${name}`);
    try {
      const out = await fn();
      if (name.includes("relaunch")) joinResult = out;
      console.log(`  ok`);
    } catch (e) {
      console.error(`\nSTOPPED at step "${name}": ${e.message}`);
      console.error(`Log: ${logger.logPath}`);
      if (guards.isBackupStepFailure(name)) {
        // Foundry is already closed and backupPacks() only READS from MODROOT, so a failure here
        // means nothing in Foundry's live directories has been touched — safe to relaunch now
        // rather than leaving the table down for no reason.
        console.error(`Nothing has been written yet — Foundry is closed; relaunching it now: "${exe.chosen}"`);
        const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `Start-Process -FilePath "${exe.chosen}"`], { encoding: "utf8" });
        logger.write(`auto-relaunch after backup-step failure:\n${r.stdout || ""}${r.stderr || ""}`);
        if (r.status !== 0) {
          console.error(`Automatic relaunch ALSO failed (exit ${r.status}): ${r.stderr}. Relaunch it yourself: "${exe.chosen}"`);
        }
      } else {
        console.error(
          name.includes("relaunch")
            ? "Foundry relaunch/verification could not be confirmed — check the machine by hand before assuming anything is wrong with the packs."
            : "Foundry is left CLOSED. Do not relaunch on a half-built pack set."
        );
        console.error(
          backupDir
            ? `Restore command: ${restoreCommand(backupDir)}`
            : "No backup exists yet — nothing has been written that needs restoring."
        );
      }
      logger.close();
      process.exit(1);
      return;
    }
  }

  // Re-check the git state after the pull actually ran.
  const postPull = gatherGitState();
  const notBehind = guards.checkNotBehindOrigin({ behind: postPull.behind });
  logger.write(`post-pull: ${notBehind.message}`);
  if (!notBehind.ok) {
    console.error(`\n${notBehind.message} — deploy proceeded on stale content. Investigate before trusting this run.`);
  }

  const worldTitle = optionsJson && optionsJson.world ? optionsJson.world : null;
  const verify = await postFlightVerify(t0, worldTitle);
  printVerdicts("Post-flight verification:", verify.results);
  const verifyPass = verify.results.every((r) => r.ok);

  const record = guards.formatDeployRecordLine({
    iso: nowIso(),
    sha: postPull.sha,
    packStamp: nowIso(),
    engineSha8: verify.engineSha8,
  });

  if (verifyPass) {
    writeDeployStateRecord(record);
    console.log(`\n${record}`);
    console.log("\nDEPLOY SUCCEEDED. The line above is also the checklist's new DEPLOY STATE record — paste it into the PM run log.");
  } else {
    console.error("\nDEPLOY STEPS SUCCEEDED BUT POST-FLIGHT VERIFICATION FAILED — see above. NOT recording a DEPLOY STATE line.");
    console.error(`Restore command if you need to roll back the packs: ${restoreCommand(backupDir)}`);
  }

  logger.write(`final: ${verifyPass ? record : "post-flight verification FAILED"}`);
  logger.close();
  process.exit(verifyPass ? 0 : 1);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e.stack || e.message || e);
    process.exit(1);
  });
}

module.exports = {
  parseArgs,
  gatherGitState,
  packDirExistsMap,
  evaluateGuards,
  backupPacks,
  restoreCommand,
};
