#!/usr/bin/env node
/* Mirror Ben's hand-drawn adversary art from the repo into the live edha-content module.
 *
 * Source of truth: source-materials/art/adversaries/  (OneDrive-backed, git-tracked)
 * Destination:     <MODROOT>/art/adversaries/         (what foundry-build.js advArt() probes)
 *
 * Filenames are the contract — <slug>-portrait.<ext> / <slug>-token.<ext>, slug = the adversary
 * name in data/adversaries.json run through slugify. See EDHA_ADVERSARY_ART_WISHLIST.md.
 * Run this BEFORE `node foundry-build.js adversaries` so the build sees the files.
 *
 * Unrecognized filenames are reported, not copied — a typo'd slug otherwise looks like
 * "the art silently didn't take" at the table.
 */
const fs = require("fs");
const path = require("path");

const { MODROOT } = require("./lib/paths.js");
const REPO = path.join(__dirname, "..");
const SRC_DIR = path.join(REPO, "source-materials", "art", "adversaries");
const DST_DIR = path.join(MODROOT, "art", "adversaries");
// Keep in sync with advArt()'s probe list in foundry-build.js — a file this accepts but the
// build never probes for installs "successfully" and then silently never appears (bit us with
// .jpeg, 2026-07-15). Order here is cosmetic; in advArt() it is precedence.
const EXTS = ["jpg", "jpeg", "webp", "png"];

const { slugify } = require("./edha-pack-io.js");

const known = new Set(
  Object.keys(JSON.parse(fs.readFileSync(path.join(REPO, "data", "adversaries.json"), "utf8")))
    .filter(k => !k.startsWith("_"))
    .map(slugify)
);

if (!fs.existsSync(SRC_DIR)) {
  console.log(`  art: no ${path.relative(REPO, SRC_DIR)} yet — nothing to sync.`);
  process.exit(0);
}

const files = fs.readdirSync(SRC_DIR).filter(f => fs.statSync(path.join(SRC_DIR, f)).isFile());
const unknown = [];
let copied = 0, skipped = 0;

for (const f of files) {
  if (f.startsWith(".") || /^(Thumbs\.db|Desktop\.ini)$/i.test(f) || f.toLowerCase().endsWith(".md")) continue;
  const m = f.match(/^(.+)-(portrait|token)\.([^.]+)$/i);
  if (!m || !EXTS.includes(m[3].toLowerCase())) { unknown.push(`${f}  (not <slug>-portrait|token.${EXTS.join("|")})`); continue; }
  if (!known.has(m[1].toLowerCase())) { unknown.push(`${f}  (no adversary with slug "${m[1]}")`); continue; }

  const src = path.join(SRC_DIR, f);
  const dst = path.join(DST_DIR, f);
  const s = fs.statSync(src);
  const d = fs.existsSync(dst) ? fs.statSync(dst) : null;
  if (d && d.size === s.size && d.mtimeMs >= s.mtimeMs) { skipped++; continue; }
  fs.mkdirSync(DST_DIR, { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`  art: ${f} -> modules/edha-content/art/adversaries/`);
  copied++;
}

console.log(`  art: ${copied} copied, ${skipped} already current${unknown.length ? `, ${unknown.length} IGNORED` : ""}.`);
if (unknown.length) {
  console.log("");
  console.log("  These files were NOT installed — the filename does not match any adversary:");
  for (const u of unknown) console.log(`    - ${u}`);
  console.log("");
  console.log("  Expected names are listed in EDHA_ADVERSARY_ART_WISHLIST.md. Rename and re-run;");
  console.log("  the deploy is not broken, those creatures just keep their placeholder icons.");
}
