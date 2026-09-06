#!/usr/bin/env node
/* scripts/check-scripts-readme.js — keep scripts/README.md honest against the filesystem.
 *
 * WHY THIS EXISTS (TODO_REPO_HYGIENE item 21). The README's file table had drifted from
 * `git ls-files scripts`: 22 tracked scripts (all of `lib/`, the whole `map/` toolchain,
 * `bench-setup-console.js`, `dump-native-vocabulary.js`, `check-2b-classification.js`,
 * `author-rules.js`, `handler-schemas.js`, three doc builders, `sync-art.js`,
 * `deploy-to-foundry.bat`, the two ratchet JSONs, …) were present in the repo but undocumented,
 * and one documented row (`playtest-setup-console.js`) named a file deleted 2026-08-10. Nothing
 * caught either direction, so the table kept drifting.
 *
 * This is a stand-alone checker, NOT wired into `scripts/gates.js` — the item asks for it as a
 * candidate; the PM decides whether it joins the gate list.
 *
 *   node scripts/check-scripts-readme.js
 *
 * Compares `git ls-files scripts` (every path under `scripts/`, collapsing anything under
 * `scripts/map/` into one virtual `map/` entry, and excluding `README.md` itself — the README
 * does not need to document its own existence) against the backtick-quoted first column of
 * every `| \`name\` | ... |` row in the "## Files" table of scripts/README.md. Exits 1 and
 * prints both directions of drift; exits 0 with a one-line OK when the table matches.
 */
"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { REPO_ROOT } = require("./lib/paths");

const README_PATH = path.join(REPO_ROOT, "scripts", "README.md");

function trackedScriptPaths() {
  const out = execFileSync("git", ["ls-files", "--", "scripts"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((p) => p.slice("scripts/".length)); // relative to scripts/
}

// Collapse the map/ toolchain into one virtual row and drop this file's own directory listing
// (README.md documents itself implicitly via this file's header, not a table row).
function expectedRows(trackedPaths) {
  const expected = new Set();
  for (const rel of trackedPaths) {
    if (rel === "README.md") continue;
    if (rel.startsWith("map/")) {
      expected.add("map/");
      continue;
    }
    expected.add(rel);
  }
  return expected;
}

// Pull every `` `name` `` that opens a markdown table row: lines shaped `| `name` | ... |`.
function documentedRows(readmeText) {
  const documented = new Set();
  const rowPattern = /^\|\s*`([^`]+)`/;
  for (const line of readmeText.split("\n")) {
    const m = rowPattern.exec(line);
    if (m) documented.add(m[1]);
  }
  return documented;
}

function main() {
  if (!fs.existsSync(README_PATH)) {
    console.error(`[check-scripts-readme] missing ${README_PATH}`);
    process.exit(1);
  }

  const tracked = trackedScriptPaths();
  const expected = expectedRows(tracked);
  const readmeText = fs.readFileSync(README_PATH, "utf8");
  const documented = documentedRows(readmeText);

  const missing = [...expected].filter((f) => !documented.has(f)).sort();
  const stale = [...documented].filter((f) => !expected.has(f)).sort();

  if (missing.length === 0 && stale.length === 0) {
    console.log(
      `[check-scripts-readme] OK — scripts/README.md matches git ls-files scripts (${tracked.length} tracked paths, ${documented.size} table rows).`
    );
    process.exit(0);
  }

  if (missing.length) {
    console.error(
      `[check-scripts-readme] tracked under scripts/ but NOT documented in scripts/README.md (${missing.length}):`
    );
    for (const f of missing) console.error(`  - ${f}`);
  }
  if (stale.length) {
    console.error(
      `[check-scripts-readme] documented in scripts/README.md but NOT tracked under scripts/ (${stale.length}):`
    );
    for (const f of stale) console.error(`  - ${f}`);
  }
  console.error(
    "[check-scripts-readme] fix scripts/README.md's Files table (add/remove/re-point rows) and re-run."
  );
  process.exit(1);
}

main();
