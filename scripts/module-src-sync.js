#!/usr/bin/env node
/* Mirror the hand-edited edha-content module runtime into the repo (and back).
 *
 * The Foundry module dir (AppData) is NOT under OneDrive or git — without this
 * mirror, register-skills.js (the entire runtime engine) has no backup at all.
 *
 *   node module-src-sync.js          pull (default): module dir -> repo module-src/
 *   node module-src-sync.js push     repo module-src/ -> module dir (restore/deploy)
 *   node module-src-sync.js status   report drift WITHOUT writing anything
 *
 * Workflow: after any engine/style/lang/module.json edit in the module dir,
 * run a pull and commit module-src/. `push` restores the module from git on a
 * fresh machine or after an accident. Packs/, data/, backgrounds/ are NOT
 * mirrored — foundry-build.js regenerates those from source.
 *
 * `status` exists because a plain hash mismatch cannot tell the two dangerous
 * cases apart, and they want opposite responses (2026-07-27, after a marathon
 * of deploys):
 *   - the live file is simply BEHIND the repo    -> pushing is the whole point
 *   - the live file was HAND-EDITED in AppData   -> pushing destroys work that
 *     exists nowhere in git
 * It distinguishes them by asking whether the live content matches ANY historical
 * commit of that repo file. If it does, the file is merely stale; if it matches
 * nothing in history, someone edited it in place. Exit 2 = at least one hand-edited
 * file, which deploy-to-foundry.bat turns into a stop-and-ask.
 *
 * Honors EDHA_MODROOT (same as foundry-build.js).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MODROOT = process.env.EDHA_MODROOT || "C:/Users/benhe/AppData/Local/FoundryVTT/Data/modules/edha-content";
const REPO_SRC = path.join(__dirname, "..", "module-src");
const FILES = [
  "module.json",
  "scripts/register-skills.js",
  "styles/edha.css",
  "lang/en.json",
  "assets/thyrcross-map.jpg",         // creation-wizard map picker (build-map-picker-asset.js + a
  "assets/thyrcross-nations.json",    // one-time downscale of thyrcross-labeled.png — 07-19)
];

const mode = (process.argv[2] || "pull").toLowerCase();
if (!["pull", "push", "status"].includes(mode)) {
  console.error(`Unknown mode "${process.argv[2]}" — use pull, push, or status.`);
  process.exit(1);
}

const hash = p => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 12);

if (mode === "status") {
  const { execFileSync } = require("child_process");
  const git = (...args) => execFileSync("git", args, { cwd: path.join(__dirname, ".."), encoding: "utf8" }).trim();
  // git's blob id is content-addressed the same way for a working file and a committed
  // one, so a live file can be compared against history without checking anything out.
  const blobOf = file => git("hash-object", file);

  let stale = 0, handEdited = 0, synced = 0, absent = 0;
  for (const rel of FILES) {
    const modPath = path.join(MODROOT, rel);
    const repoRel = `module-src/${rel}`;
    if (!fs.existsSync(modPath)) { console.log(`  ? not installed   ${rel}`); absent++; continue; }

    const live = blobOf(modPath);
    if (live === git("rev-parse", `HEAD:${repoRel}`)) { console.log(`  = in sync        ${rel}`); synced++; continue; }

    // Walk this file's history newest-first; a match means the live copy is a real
    // past version (stale), not something typed into AppData by hand.
    const revs = git("rev-list", "-40", "HEAD", "--", repoRel).split("\n").filter(Boolean);
    const match = revs.find(sha => {
      try { return git("rev-parse", `${sha}:${repoRel}`) === live; } catch { return false; }
    });
    if (match) {
      const when = git("log", "-1", "--format=%cs", match);
      console.log(`  ~ STALE          ${rel} (live is the ${when} version, ${match.slice(0, 8)}) — a push updates it`);
      stale++;
    } else {
      console.log(`  ! HAND-EDITED    ${rel} — live content is in NO commit; a push would replace it`);
      handEdited++;
    }
  }

  console.log(`\nstatus: ${synced} in sync, ${stale} stale, ${handEdited} hand-edited${absent ? `, ${absent} not installed` : ""}.`);
  if (handEdited) {
    console.log(`\n⚠ Run a PULL first (node module-src-sync.js) to capture the live edits into the repo,`);
    console.log(`  then commit them — otherwise the next push discards work that exists nowhere in git.`);
  }
  process.exit(handEdited ? 2 : 0);
}

// push overwrites the LIVE module with no undo — and the live engine has carried hand edits
// before (see memory: module dir drifts). Cheap insurance, no decisions: every live file a push
// replaces is first copied into a timestamped folder under the OS temp dir. Silent when nothing
// is overwritten; prints the folder once when something is.
const os = require("os");
const BACKUP_DIR = path.join(os.tmpdir(), "edha-engine-backups",
  new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19));
let backedUp = 0;

let copied = 0, unchanged = 0, missing = 0;
for (const rel of FILES) {
  const modPath = path.join(MODROOT, rel);
  const repoPath = path.join(REPO_SRC, rel);
  const [src, dst] = mode === "pull" ? [modPath, repoPath] : [repoPath, modPath];
  if (!fs.existsSync(src)) { console.warn(`  ✗ MISSING ${mode === "pull" ? "module" : "repo"} file: ${rel}`); missing++; continue; }
  if (fs.existsSync(dst) && hash(src) === hash(dst)) { console.log(`  = unchanged ${rel}`); unchanged++; continue; }
  if (mode === "push" && fs.existsSync(dst)) {
    const bak = path.join(BACKUP_DIR, rel);
    fs.mkdirSync(path.dirname(bak), { recursive: true });
    fs.copyFileSync(dst, bak);
    backedUp++;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`  → ${mode === "pull" ? "captured" : "deployed"} ${rel} (${fs.statSync(src).size} bytes)`);
  copied++;
}
if (backedUp) console.log(`\nSafety copies of the ${backedUp} replaced live file(s): ${BACKUP_DIR}`);
console.log(`\n${mode}: ${copied} copied, ${unchanged} unchanged${missing ? `, ${missing} MISSING` : ""}.`);
if (mode === "pull" && copied) console.log("Commit module-src/ in the skilltrees repo to make the backup permanent.");
if (missing) process.exit(1);
