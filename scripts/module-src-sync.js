#!/usr/bin/env node
/* Mirror the hand-edited edha-content module runtime into the repo (and back).
 *
 * The Foundry module dir (AppData) is NOT under OneDrive or git — without this
 * mirror, register-skills.js (the entire runtime engine) has no backup at all.
 *
 *   node module-src-sync.js          pull (default): module dir -> repo module-src/
 *   node module-src-sync.js push     repo module-src/ -> module dir (restore/deploy)
 *
 * Workflow: after any engine/style/lang/module.json edit in the module dir,
 * run a pull and commit module-src/. `push` restores the module from git on a
 * fresh machine or after an accident. Packs/, data/, backgrounds/ are NOT
 * mirrored — foundry-build.js regenerates those from source.
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
if (!["pull", "push"].includes(mode)) {
  console.error(`Unknown mode "${process.argv[2]}" — use pull or push.`);
  process.exit(1);
}

const hash = p => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 12);

let copied = 0, unchanged = 0, missing = 0;
for (const rel of FILES) {
  const modPath = path.join(MODROOT, rel);
  const repoPath = path.join(REPO_SRC, rel);
  const [src, dst] = mode === "pull" ? [modPath, repoPath] : [repoPath, modPath];
  if (!fs.existsSync(src)) { console.warn(`  ✗ MISSING ${mode === "pull" ? "module" : "repo"} file: ${rel}`); missing++; continue; }
  if (fs.existsSync(dst) && hash(src) === hash(dst)) { console.log(`  = unchanged ${rel}`); unchanged++; continue; }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`  → ${mode === "pull" ? "captured" : "deployed"} ${rel} (${fs.statSync(src).size} bytes)`);
  copied++;
}
console.log(`\n${mode}: ${copied} copied, ${unchanged} unchanged${missing ? `, ${missing} MISSING` : ""}.`);
if (mode === "pull" && copied) console.log("Commit module-src/ in the skilltrees repo to make the backup permanent.");
if (missing) process.exit(1);
