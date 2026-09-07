#!/usr/bin/env node
/* scripts/engine-split.js — cut the engine into its per-section source files (item 4, 2026-09-06).
 *
 *   node scripts/engine-split.js            re-cut module-src/scripts/register-skills.js into
 *                                           module-src/scripts/engine/NN-<slug>.js
 *   node scripts/engine-split.js --dry-run  print the cut plan (file, first line, line count) only
 *
 * ONE rule, no judgment: every column-0 `/* ====…` banner line opens a new file (item 23 bannered
 * every region of the engine for exactly this purpose); everything before the first banner — the
 * file's head docblock — is file 00. The cut is a pure byte partition: each source file is an
 * exact byte range of the engine, so `engine-assemble.js` (plain concatenation in lexical order)
 * reproduces the engine byte-for-byte. No headers, separators, or trailing newlines are added or
 * removed on either side.
 *
 * Re-runnable on purpose. If the engine changes on `main` while a split-based branch is open,
 * re-run this on the NEW engine instead of hand-merging the sources: it deletes every `*.js`
 * already in the engine/ directory and re-cuts. File names derive from the banner titles, so a
 * banner that keeps its title keeps its file name across re-runs; a banner edit renames its file.
 *
 * The assembled `register-skills.js` STAYS the tracked and deployed artifact (PM-R15): the
 * sources are the EDIT surface, and gate `engine-assembly` (`engine-assemble.js --check`) proves
 * the tracked file equals their concatenation.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENGINE = path.join(ROOT, "module-src", "scripts", "register-skills.js");
const OUT_DIR = path.join(ROOT, "module-src", "scripts", "engine");
const SEAM = /^\/\* ={12,}/;

const dryRun = process.argv.includes("--dry-run");

// Cut plan: [{ start, title }] over 0-based line indices; the head docblock is segment 0.
function planCut(text) {
  const lines = text.split("\n");
  const segs = [{ start: 0, title: "file header" }];
  for (let i = 0; i < lines.length; i++) {
    if (!SEAM.test(lines[i])) continue;
    segs.push({ start: i, title: bannerTitle(lines, i) });
  }
  return { lines, segs };
}

// The banner's title: text on the `/* ===` line itself when it carries any (`/* ==== FOO ====`),
// else the first words of the line that follows (` * FOO tree engine (date) — …`).
function bannerTitle(lines, i) {
  const inline = lines[i].replace(/^\/\*/, "").replace(/=+/g, " ").trim();
  if (inline) return inline;
  const next = (lines[i + 1] || "").replace(/^\s*\*\s?/, "").trim();
  return next;
}

function slugOf(title) {
  let t = title
    .replace(/═+/g, " ")
    .trim()
    .split(/\s[—–-]{1,2}\s|\(|\s{2,}/)[0]   // cut at the first " — " / " - " / "(" / double space
    .replace(/\btree engine\b/i, "")
    .replace(/^H\d+\s+/, "")               // "H8 `edha-watch`" → "edha-watch"
    .replace(/`/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return t.slice(0, 48).replace(/-+$/, "");
}

function main() {
  const text = fs.readFileSync(ENGINE, "utf8");
  if (text.includes("\r")) {
    console.error("[engine-split] the engine contains CR bytes; it is tracked LF (git ls-files --eol). Refusing to cut.");
    process.exit(1);
  }
  const { lines, segs } = planCut(text);
  const width = String(segs.length - 1).length < 2 ? 2 : String(segs.length - 1).length;

  const files = [];
  const seen = new Map();
  for (let s = 0; s < segs.length; s++) {
    const start = segs[s].start;
    const end = s + 1 < segs.length ? segs[s + 1].start : lines.length;
    let slug = slugOf(segs[s].title) || "section";
    const n = (seen.get(slug) || 0) + 1;
    seen.set(slug, n);
    if (n > 1) slug = `${slug}-${n}`;
    const name = `${String(s).padStart(width, "0")}-${slug}.js`;
    // Byte-exact: every line but the file's last keeps its "\n"; the last segment keeps the
    // engine's own tail (trailing newline or not) because split("\n") leaves it as the final element.
    const body = lines.slice(start, end).join("\n") + (end < lines.length ? "\n" : "");
    files.push({ name, body, start: start + 1, count: end - start, title: segs[s].title });
  }

  const widest = Math.max(...files.map(f => f.name.length));
  for (const f of files) {
    console.log(`${f.name.padEnd(widest)}  L${String(f.start).padStart(5)}  ${String(f.count).padStart(5)} lines  ${f.title.slice(0, 70)}`);
  }
  const largest = files.reduce((a, b) => (b.count > a.count ? b : a));
  console.log(`\n${files.length} files; largest ${largest.name} (${largest.count} lines); engine ${lines.length - (text.endsWith("\n") ? 1 : 0)} lines.`);

  if (dryRun) return;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const old of fs.readdirSync(OUT_DIR)) {
    if (old.endsWith(".js")) fs.unlinkSync(path.join(OUT_DIR, old));
  }
  for (const f of files) fs.writeFileSync(path.join(OUT_DIR, f.name), f.body, "utf8");

  const assembled = files.map(f => f.body).join("");
  if (assembled !== text) {
    console.error("[engine-split] INTERNAL: the cut does not re-join to the engine. No files should be trusted.");
    process.exit(1);
  }
  console.log(`[engine-split] wrote ${files.length} files to module-src/scripts/engine/ (re-join verified byte-identical).`);
}

main();
