/* scripts/lib/deploy-guards.js — pure guard/verifier functions for scripts/deploy-cycle.js
 * (TODO_REPO_HYGIENE item 122: the agent-run deploy cycle becomes ONE gated script).
 *
 * WHY THIS IS A SEPARATE, PURE MODULE. `deploy-cycle.js` closes Foundry, pulls `main`, pushes the
 * live engine, rebuilds five packs, and relaunches Foundry — real filesystem, git, process, and
 * network side effects that cannot run in CI (`validate.yml` is `ubuntu-latest`; there is no
 * Foundry there, and there never should be one in a test run). Every DECISION the script makes —
 * refuse or proceed, pass or fail — is pulled out into a named function here that takes plain
 * data and returns a plain verdict, so `tests/deploy-cycle.test.js` can pin each one against a
 * fixture with no I/O at all. `deploy-cycle.js` itself only gathers the real data (git, fs,
 * PowerShell, HTTP) and hands it to these; it never re-implements the decision inline.
 *
 * Every function returns { ok, name, message } — `ok` is refuse/pass (or fail, post-flight),
 * `name` is a stable id for the CLI's per-guard verdict line, `message` is the human sentence
 * `--dry-run` and a real refusal both print.
 */
"use strict";

const crypto = require("crypto");

function verdict(ok, name, message) {
  return { ok, name, message };
}

/* --- Pre-flight guards ---------------------------------------------------------------------- */

// The repo must be on `main` with nothing uncommitted before ANY step touches it.
function checkOnMainClean({ branch, clean }) {
  if (branch !== "main") {
    return verdict(false, "on-main", `refused — on branch "${branch}", not main`);
  }
  if (!clean) {
    return verdict(false, "clean-tree", "refused — working tree is not clean (git status --short is non-empty)");
  }
  return verdict(true, "on-main-clean", "on main, working tree clean");
}

// Evaluated right after the `git pull --ff-only` step: if the branch is STILL behind origin/main,
// either the pull failed outright or local history had diverged so far that --ff-only could not
// fast-forward it — either way the deploy must not continue against a tree that is not actually
// at the tip.
function checkNotBehindOrigin({ behind }) {
  if (behind > 0) {
    return verdict(false, "not-behind-origin", `refused — ${behind} commit(s) behind origin/main after the pull`);
  }
  return verdict(true, "not-behind-origin", "even with origin/main");
}

// module-src-sync.js status's own exit code is the authority (see that file's header): 2 means
// the live engine in AppData matches NO commit in history — someone hand-edited it there — and a
// push would silently discard work that exists nowhere in git. Never overwrite that.
function checkModuleSrcSync(exitCode) {
  if (exitCode === 2) {
    return verdict(
      false,
      "module-src-hand-edited",
      "refused — module-src-sync.js status exited 2 (hand-edited live engine); " +
        "run `node scripts/module-src-sync.js` (pull) and commit the result first"
    );
  }
  return verdict(true, "module-src-sync", "live engine is not hand-edited (in sync or merely stale)");
}

// A worker holds the table if the PM's live overlay (docs/pm-live.json) lists it on lane "B", or
// its `item` or `branch` id STARTS WITH the bench-worklist shape (`bench-45`, `pm/bench-46`) —
// never free-text fields (`title`, `agent`). Item 138: the old check matched the substring
// "bench" anywhere across item/title/agent/branch joined together, so the 125+137 worker's own
// title ("deploy-cycle.js: bench guard reads worktrees…") tripped it and refused a live deploy
// that never touched Foundry.
const BENCH_WORKER_ID_RE = /^(?:pm\/)?bench-/i;
function isBenchWorker(worker) {
  if (!worker) return false;
  if (worker.lane === "B") return true;
  const isBenchId = (s) => typeof s === "string" && BENCH_WORKER_ID_RE.test(s.trim());
  return isBenchId(worker.item) || isBenchId(worker.branch);
}

// A `pm/bench-*` branch name (local, or `origin/pm/bench-*` remote) is a bench signal regardless
// of what the CURRENT checkout's tracked docs/pm-live.json says — item 125: that overlay is only
// as fresh as the checkout it was read from, and a PM that has not yet landed its own board PR
// (the normal state mid-shift) could otherwise close Foundry out from under a live bench.
function isBenchBranchName(name) {
  return /^(?:origin\/)?pm\/bench-/.test(String(name || "").replace(/^refs\/heads\//, ""));
}

// Parses `git worktree list --porcelain` output into `[{ path, branch }]` — `branch` is null for
// a detached worktree. Pure text-in/data-out so it can be pinned with no git process at all.
function parseWorktreePorcelain(text) {
  return String(text || "")
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      let wtPath = null;
      let branch = null;
      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith("worktree ")) wtPath = line.slice("worktree ".length).trim();
        else if (line.startsWith("branch ")) branch = line.slice("branch ".length).trim().replace(/^refs\/heads\//, "");
      }
      return { path: wtPath, branch };
    });
}

// `extra.worktrees`: [{ path, branch }] (from parseWorktreePorcelain). `extra.branches`: { local,
// remote }, each a list of { name, merged } — the caller has already resolved merged-ness via
// `git branch --merged origin/main` / `git branch -r --merged origin/main`, since that needs a
// live git process; this function only decides given the plain data. A branch merged into
// origin/main does NOT count as a bench signal (it is done, not in flight).
function checkNoBenchWorker(pmLive, forceBench, extra) {
  const workers = (pmLive && Array.isArray(pmLive.workers)) ? pmLive.workers : [];
  const holders = workers.filter(isBenchWorker);

  const worktrees = (extra && Array.isArray(extra.worktrees)) ? extra.worktrees : [];
  const benchWorktrees = worktrees.filter((wt) => wt && isBenchBranchName(wt.branch));

  const branches = (extra && extra.branches) || {};
  const unmergedLocal = (branches.local || []).filter((b) => b && !b.merged);
  const unmergedRemote = (branches.remote || []).filter((b) => b && !b.merged);

  const names = [
    ...holders.map((w) => w.item || w.title || "?"),
    ...benchWorktrees.map((wt) => `worktree ${wt.path} (${wt.branch})`),
    ...unmergedLocal.map((b) => b.name),
    ...unmergedRemote.map((b) => b.name),
  ];

  if (names.length && !forceBench) {
    return verdict(false, "no-bench-worker", `refused — bench signal(s) held: ${names.join(", ")} (pass --force-bench to override)`);
  }
  if (names.length) {
    return verdict(true, "no-bench-worker", `${names.length} bench signal(s) present, overridden by --force-bench`);
  }
  return verdict(true, "no-bench-worker", "no worker holds the table");
}

// The five compendium packs this deploy rebuilds — shared with deploy-cycle.js so both files name
// the same set exactly once.
const PACKS = ["edha-leyline", "edha-deity", "edha-heroic", "edha-adversaries", "edha-items"];

function checkPacksExist(existsMap) {
  const missing = PACKS.filter((p) => !(existsMap && existsMap[p]));
  if (missing.length) {
    return verdict(false, "packs-exist", `refused — missing pack directory(ies): ${missing.join(", ")}`);
  }
  return verdict(true, "packs-exist", "all five pack directories exist");
}

// Config/options.json must name a world, or the relaunch stops at the setup screen instead of
// opening straight into it — catch that before Foundry is even closed, not after the relaunch.
// `expectedTitle` (item 139) is optional and purely informational here — it is the TITLE the
// post-flight /join check will look for (see `expectedWorldTitle` below), printed so a --dry-run
// shows what the post-flight check expects before anything is touched.
function checkWorldConfigured(optionsJson, expectedTitle) {
  const world = optionsJson && optionsJson.world;
  if (!world) {
    return verdict(false, "world-configured", "refused — Config/options.json names no world; a relaunch would stop at the setup screen");
  }
  const titleNote = expectedTitle ? ` (join title expected: "${expectedTitle}")` : "";
  return verdict(true, "world-configured", `world "${world}" configured${titleNote}`);
}

// The /join page prints the world's TITLE (world.json's `title`, e.g. "Edha"), never its id
// (`"edha"`) — item 139: `deploy-cycle.js` used to pass the id itself as `worldTitle` into
// `checkJoinRedirect`, so a case-sensitive substring check against the id NEVER matched the
// page's actual title and refused every otherwise-good deploy. Resolves the title `world.json`
// declares when it can be read; falls back to the id itself (still checked case-insensitively by
// `checkJoinRedirect` below) when `world.json` is missing or unreadable.
function expectedWorldTitle({ worldId, worldJson }) {
  const title = worldJson && typeof worldJson.title === "string" && worldJson.title.trim();
  return title || worldId || null;
}

// The Foundry executable must exist at the resolved path before a relaunch is attempted.
function checkFoundryExe(exePath, exists) {
  if (!exists) {
    return verdict(false, "foundry-exe-exists", `refused — Foundry executable not found at "${exePath}"`);
  }
  return verdict(true, "foundry-exe-exists", `found at "${exePath}"`);
}

// Pure priority pick for the Foundry exe path — an explicit --exe flag wins, then the path
// Windows reports for the process while Foundry is still running, then the Program Files
// default. Never touches the filesystem or a process list itself; the orchestrator gathers each
// candidate and this just decides between them.
function pickExePath({ argExe, runningProcessPath, defaultPath }) {
  return argExe || runningProcessPath || defaultPath;
}

// A backup never needs the still-open pack's LevelDB LOCK file (proactively skipped by name), and
// a file Windows still has an open handle on throws EBUSY/EPERM instead of copying (reactively
// skipped by the copy error) — either way the file is skipped and logged, never treated as a
// fatal backup failure (item 129: the first live run backed up BEFORE closing Foundry, so the
// still-open LOCK file threw EBUSY and killed the whole run). Any OTHER error code is NOT a skip
// — it is a real failure (disk full, a destination permissions problem, …) and must still abort.
function shouldSkipBackupFile(name, err) {
  if (name === "LOCK") return true;
  if (err && (err.code === "EBUSY" || err.code === "EPERM")) return true;
  return false;
}

// Whether a failing step's name is the backup-packs step: Foundry is already closed by then, and
// backupPacks() only READS from MODROOT (it never writes there), so a failure here means nothing
// in Foundry's live directories has been touched — unlike a failure during pull/push/rebuild,
// which DOES write to MODROOT and might leave it half-built. So relaunching Foundry immediately
// is safe, and kinder than leaving the table down for no reason.
function isBackupStepFailure(stepName) {
  return /back ?up/i.test(stepName || "");
}

/* --- Post-flight verifiers ------------------------------------------------------------------ */

// Every rebuilt pack directory's newest file must be stamped AFTER the run's own start time —
// proves the rebuild step actually touched disk, rather than silently no-op'ing on a scratch dir
// or a clock running backward. `stats`: [{ pack, mtimeMs }].
function stampsNewerThan(stats, t0) {
  const stale = (stats || []).filter((s) => !(s.mtimeMs > t0));
  if (stale.length) {
    return verdict(false, "stamps-newer-than-start", `refused — stale pack stamp(s): ${stale.map((s) => s.pack).join(", ")}`);
  }
  return verdict(true, "stamps-newer-than-start", "all pack stamps are newer than the run's start");
}

// Same normalisation the bench runbook's own hash-check convention uses (run 8, 2026-07-27g): a
// CRLF checkout and an LF one must compare EQUAL when the bytes are otherwise identical.
function normalizeCRLF(text) {
  return String(text == null ? "" : text).replace(/\r\n/g, "\n");
}

function enginesMatch(servedText, repoText) {
  const ok = normalizeCRLF(servedText) === normalizeCRLF(repoText);
  return verdict(ok, "engine-matches-head", ok ? "served engine equals HEAD (CRLF-normalised)" : "refused — served engine differs from HEAD (CRLF-normalised)");
}

// `/` must answer 302 to `/join` (never `/setup`, which means no world is loaded), and the join
// page must name the configured world — catches a relaunch that silently landed on the setup
// screen or joined the wrong world. `worldTitle` (item 139) must already be the world's TITLE
// (see `expectedWorldTitle` above), not its id — the caller resolves that once; this function's
// only remaining job is a case-insensitive substring check, since Foundry's `<title>` casing
// (e.g. "Edha") need not match how the id itself is cased.
function checkJoinRedirect({ status, location, joinBody, worldTitle }) {
  if (status !== 302) {
    return verdict(false, "join-redirect", `refused — / answered ${status}, not 302`);
  }
  if (!location || !location.includes("/join")) {
    return verdict(false, "join-redirect", `refused — / redirected to "${location}", not /join`);
  }
  if (worldTitle && !String(joinBody || "").toLowerCase().includes(String(worldTitle).toLowerCase())) {
    return verdict(false, "join-redirect", `refused — /join does not name world "${worldTitle}"`);
  }
  return verdict(true, "join-redirect", "/ -> /join, world confirmed");
}

/* --- Post-flight retry policy (item 137: the post-flight verification races Foundry's boot) ----
 *
 * Foundry's relaunch poll (`pollUntilRedirect`) only waits for `/` to answer 302 — it says nothing
 * about whether the world's static files (the engine script, the join page) are fully served yet.
 * A live run on 2026-09-13 saw exactly that: all eight steps green, but the immediate post-flight
 * fetch of the engine raced the boot and had to be hand-verified two minutes later. So the
 * post-flight checks must RETRY with a bounded backoff (`--wait-seconds`, default 90) instead of
 * failing on the first not-yet-ready response — and only FAIL once that deadline passes.
 */

function sha256(text) {
  return crypto.createHash("sha256").update(String(text == null ? "" : text)).digest("hex");
}

// The same 8-hex-char engine fingerprint used in the DEPLOY STATE record line — one copy so
// deploy-cycle.js never re-implements the hashing.
function engineSha8(text) {
  return sha256(normalizeCRLF(text)).slice(0, 8);
}

// Generic bounded-retry wrapper: given an already-pure ok/name/message verdict, decides whether
// the caller should try again ("retry" — not yet a FAIL), stop with success ("pass"), or stop
// with failure ("fail") because `elapsed` has reached `deadline`. A passing verdict is always an
// immediate "pass" regardless of elapsed time.
function retryUntilDeadline(verdictResult, elapsed, deadline) {
  if (verdictResult.ok) return Object.assign({ outcome: "pass" }, verdictResult);
  if (elapsed >= deadline) return Object.assign({ outcome: "fail" }, verdictResult);
  return Object.assign({ outcome: "retry" }, verdictResult);
}

// The engine-fetch decision: a non-200 status, a fetch error (status 0), or a body whose sha does
// not match HEAD's engine is NOT YET a failure — it is a retry until `elapsed` reaches `deadline`.
function checkEngineShaMatches({ status, body, expectedSha }) {
  if (status !== 200) {
    return verdict(false, "engine-matches-head", `served status ${status}, not 200`);
  }
  const actualSha = engineSha8(body || "");
  if (actualSha !== expectedSha) {
    return verdict(false, "engine-matches-head", `served engine sha ${actualSha} != HEAD's ${expectedSha}`);
  }
  return verdict(true, "engine-matches-head", `served engine sha ${actualSha} = HEAD's ${expectedSha}`);
}

function shouldRetryVerify({ status, body, expectedSha, elapsed, deadline }) {
  return retryUntilDeadline(checkEngineShaMatches({ status, body, expectedSha }), elapsed, deadline);
}

// The /join-title check, wrapped with the same bounded-retry policy — reuses checkJoinRedirect
// itself rather than re-deciding what a good /join response looks like.
function shouldRetryJoin({ status, location, joinBody, worldTitle, elapsed, deadline }) {
  return retryUntilDeadline(checkJoinRedirect({ status, location, joinBody, worldTitle }), elapsed, deadline);
}

/* --- The DEPLOY STATE record line (checklist §"⚑ DEPLOY STATE") --------------------------------
 * Pure text formatting/insertion so tests/deploy-cycle.test.js can pin it against a fixture
 * string rather than the real (huge) checklist file.
 */

function formatDeployRecordLine({ iso, sha, packStamp, engineSha8 }) {
  return `Agent-run deploy ${iso} from main @ ${sha}: packs ${packStamp}, engine ${engineSha8} = HEAD, validators PASS`;
}

const DEPLOY_STATE_HEADING_RE = /^# ⚑ DEPLOY STATE.*$/m;

// Inserts `line` (wrapped as its own bold paragraph) as the FIRST paragraph of the checklist's
// "# ⚑ DEPLOY STATE" section — directly under the heading's blank line, above whatever paragraph
// was first before this call. Throws if the heading cannot be found (the checklist's shape
// changed and this needs a human, not a silent no-op).
function insertDeployStateRecord(checklistText, line) {
  const m = DEPLOY_STATE_HEADING_RE.exec(checklistText);
  if (!m) throw new Error('insertDeployStateRecord: no "# ⚑ DEPLOY STATE" heading found');
  const insertAt = m.index + m[0].length;
  const before = checklistText.slice(0, insertAt);
  const after = checklistText.slice(insertAt);
  return `${before}\n\n**${line}**\n${after}`;
}

module.exports = {
  PACKS,
  checkOnMainClean,
  checkNotBehindOrigin,
  checkModuleSrcSync,
  isBenchWorker,
  isBenchBranchName,
  parseWorktreePorcelain,
  checkNoBenchWorker,
  checkPacksExist,
  checkWorldConfigured,
  expectedWorldTitle,
  checkFoundryExe,
  pickExePath,
  shouldSkipBackupFile,
  isBackupStepFailure,
  stampsNewerThan,
  normalizeCRLF,
  enginesMatch,
  checkJoinRedirect,
  engineSha8,
  retryUntilDeadline,
  shouldRetryVerify,
  shouldRetryJoin,
  formatDeployRecordLine,
  insertDeployStateRecord,
};
