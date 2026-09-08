#!/usr/bin/env node
/* scripts/lint-changelog.js — changelog hygiene gate (TODO_REPO_HYGIENE item 100).
 *
 * WHY THIS EXISTS. Twice on 2026-09-07/08 a worker's new delta went in by REPLACING the first
 * `## ` heading under the marker line instead of inserting above it — bench 44a (PR #298,
 * displaced item 94's heading) and item 99 (PR #309, displaced item 98's) — leaving the
 * displaced delta's body headless until the PM restored it at review. Both briefs said "insert
 * above the current top heading — never replace it", so wording alone did not fix it: the file
 * shape invited the mistake, because the marker line was immediately followed by the first
 * heading with NO blank line between them, so an edit anchored on "marker + first heading"
 * swallowed the heading whole. Separately, `docs/handoff-changelog/README.md`'s index count/date
 * range and each month file's own header count had drifted from the real heading count, and
 * nothing gated either failure mode.
 *
 * WHAT THIS CHECKS, for every `docs/handoff-changelog/2026-MM.md`:
 *   (a) the marker line (the same literal `handoff-split.js` writes) appears exactly once,
 *       followed by exactly one blank line, then a line that is a valid dated-delta heading;
 *   (b) every `## ` heading below the marker is a valid dated-delta heading;
 *   (c) the heading count below the marker equals BOTH the count named in the month file's own
 *       header line (`(N deltas, ...)`) and the count in `README.md`'s index row for that file —
 *       so a replaced heading (count +0 while the index says +1) and a forgotten index bump
 *       (+1 vs +0) both fail, naming the file and the numbers.
 *
 * A "valid dated-delta heading" is deliberately looser than a single fixed dash position:
 * `## YYYY-MM-DD` at the start, then an ` — ` separator somewhere after it with text following.
 * The real files carry historical suffixes a single rigid `^## \d{4}-\d{2}-\d{2} — .+` would
 * reject — a bare letter after the date (`## 2026-07-28m — ...`) and a ` DELTA` tag before the
 * dash (`## 2026-06-17 DELTA — ...`) — and those headings are VERBATIM history (never rewrite
 * them to satisfy a lint). The loose pattern still catches the real failure this gate exists
 * for: a heading swallowed by an edit, or a line that isn't a heading at all.
 *
 * REFACTORED for TODO_REPO_HYGIENE item 102: `checkMonthFile(dir, file)` and `lint(dir)` are now
 * exported and side-effect-free (no shared mutable error array, no process.exit), so
 * `tests/handoff-split.test.js` can run the same check against a fixture directory. `main()` (the
 * CLI entry, run only when this file is executed directly) keeps the exact exit codes and console
 * output this file always had. Also uses the shared `MARKER` from `scripts/lib/changelog-rules.js`
 * instead of its own copy, so it cannot drift from what `handoff-split.js` writes.
 *
 * Zero dependencies, five files (the month files + README.md), milliseconds. Exit 0 quietly on
 * success; exit 1 with every mismatch named on failure.
 *
 *   node scripts/lint-changelog.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { REPO_ROOT } = require("./lib/paths");
const { MARKER } = require("./lib/changelog-rules");

const DIR = path.join(REPO_ROOT, "docs", "handoff-changelog");
const MONTH_FILE_RE = /^2026-\d{2}\.md$/;

// A valid dated-delta heading — see the file header for why this is looser than one fixed dash
// position.
function isDeltaHeading(line) {
  if (!/^## \d{4}-\d{2}-\d{2}/.test(line)) return false;
  const i = line.indexOf(" — ");
  return i !== -1 && i + 3 < line.length;
}

function monthFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => MONTH_FILE_RE.test(f)).sort();
}

// | [`2026-09.md`](2026-09.md) | 115 | 2026-09-04 → 2026-09-08 |
function readmeCounts(text) {
  const counts = new Map();
  const rowRe = /^\|\s*\[`(2026-\d\d\.md)`\]\([^)]*\)\s*\|\s*(\d+)\s*\|/gm;
  let m;
  while ((m = rowRe.exec(text))) counts.set(m[1], Number(m[2]));
  return counts;
}

// "The dated session deltas of 2026-09 (115 deltas, 2026-09-04 → 2026-09-08), newest first,"
function headerCount(text, file, errors) {
  const m = text.match(/\((\d+)\s+deltas?,/);
  if (!m) {
    errors.push(`${file}: header line missing the "(N deltas, ..." count — cannot verify`);
    return null;
  }
  return Number(m[1]);
}

/**
 * Runs the per-file structural + count checks for one month file and returns
 * `{ count, errors }`: `count` is the number of "## " headings below the marker (or `undefined`
 * if a structural check already failed — marker cardinality, the required blank line, or the
 * first heading's shape, in which case the count comparison cannot run) and `errors` is every
 * message found, in the exact wording the CLI has always printed.
 */
function checkMonthFile(dir, file) {
  const errors = [];
  const full = path.join(dir, file);
  const text = fs.readFileSync(full, "utf8");
  const lines = text.split("\n");

  const markerIdxs = [];
  lines.forEach((l, i) => { if (l === MARKER) markerIdxs.push(i); });
  if (markerIdxs.length !== 1) {
    errors.push(`${file}: marker line found ${markerIdxs.length} time(s) (expected exactly 1)`);
    return { count: undefined, errors };
  }
  const mi = markerIdxs[0];

  if (lines[mi + 1] !== "") {
    errors.push(`${file}: no blank line between the marker (line ${mi + 1}) and what follows it — insert exactly one`);
    return { count: undefined, errors };
  }
  if (lines[mi + 2] === "") {
    errors.push(`${file}: more than one blank line after the marker (line ${mi + 1}) — exactly one is required`);
    return { count: undefined, errors };
  }
  if (!isDeltaHeading(lines[mi + 2] || "")) {
    errors.push(`${file}:${mi + 3}: first line after the marker's blank line is not a dated delta heading: ${JSON.stringify(lines[mi + 2] || "")}`);
    return { count: undefined, errors };
  }

  const headingLines = [];
  for (let i = mi + 2; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) headingLines.push({ n: i + 1, text: lines[i] });
  }
  for (const h of headingLines) {
    if (!isDeltaHeading(h.text)) {
      errors.push(`${file}:${h.n}: heading is not a valid dated delta ("## YYYY-MM-DD ... — ..."): ${h.text}`);
    }
  }

  const count = headingLines.length;
  const hCount = headerCount(text, file, errors);
  if (hCount !== null && hCount !== count) {
    errors.push(`${file}: header says ${hCount} deltas, but ${count} "## " heading(s) are below the marker`);
  }
  return { count, errors };
}

/**
 * Runs every check against `dir` (a `docs/handoff-changelog`-shaped directory: month files plus
 * a `README.md` index) and returns the flat list of error messages — empty means clean. No
 * console output, no process.exit; `main()` below is the only thing that prints/exits.
 */
function lint(dir) {
  const errors = [];
  const readmePath = path.join(dir, "README.md");

  if (!fs.existsSync(readmePath)) {
    errors.push(`README.md not found at ${readmePath}`);
  }
  const readmeText = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
  const readmeMap = readmeCounts(readmeText);

  const files = monthFiles(dir);
  if (!files.length) {
    errors.push(`no docs/handoff-changelog/2026-MM.md files found in ${dir}`);
  }

  for (const file of files) {
    const { count, errors: fileErrors } = checkMonthFile(dir, file);
    errors.push(...fileErrors);
    if (count === undefined) continue; // already erred (marker / blank-line / heading-shape)
    if (!readmeMap.has(file)) {
      errors.push(`README.md: no index row found for ${file}`);
      continue;
    }
    const rCount = readmeMap.get(file);
    if (rCount !== count) {
      errors.push(`README.md: index says ${file} has ${rCount} deltas, but ${count} "## " heading(s) are below its marker`);
    }
  }

  return { errors, fileCount: files.length };
}

function main() {
  const { errors, fileCount } = lint(DIR);

  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n${errors.length} error${errors.length === 1 ? "" : "s"}.`);
    process.exit(1);
    return;
  }
  console.log(`✓ lint-changelog: ${fileCount} month files, blank-line + heading-shape + count checks clean.`);
}

if (require.main === module) main();

module.exports = { lint, checkMonthFile, isDeltaHeading, monthFiles, readmeCounts, MARKER };
