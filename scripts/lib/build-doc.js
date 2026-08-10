#!/usr/bin/env node
/* scripts/lib/build-doc.js — shared --check/write/exit skeleton for the generated-doc builders
 * (build-dashboard.js, build-canon-codex.js, build-player-primer.js, dump-native-vocabulary.js).
 *
 * Added 2026-08-10 (hygiene campaign, wave 2A). All four builders reimplemented the same LF-
 * normalized read() (two of them byte-identical, the third — build-canon-codex.js — inlined it
 * twice instead of factoring a helper) and the same four-part --check dance: read the committed
 * file (LF-tolerant of a CRLF checkout), diff against the freshly-built content, either
 * console.error + exit(1) on drift or console.log a specific "in sync" message, and on a real
 * (non-check) run write the file and print a builder-specific summary. Only the MESSAGES and the
 * post-write side effects (build-dashboard.js's row-count floor; dump-native-vocabulary.js's
 * multi-line event/handler listing) differ — factored out here as callbacks so each builder keeps
 * its own wording.
 */
"use strict";
const fs = require("fs");
const path = require("path");

// read(rel, rootDir) — LF-normalized read. `rel` may be repo-relative (resolved against rootDir)
// or already absolute (used as-is, rootDir ignored) — matches scripts/lib/data.js's loadJson
// convention, since build-canon-codex.js's SRC_MD/SRC_GAZ are precomputed absolute paths.
function read(rel, rootDir) {
  const p = path.isAbsolute(rel) ? rel : path.join(rootDir, rel);
  return fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
}

// emit(outPath, content, opts) — the --check/write/exit dance shared by all four builders.
//   opts.checkMode      — required: true under --check, false for a real (re)write.
//   opts.staleMessage()   -> string, console.error'd then process.exit(1) when --check finds drift.
//   opts.upToDateMessage()-> string, console.log'd when --check finds none.
//   opts.checkExitCode   — if given, process.exit(this) after a clean --check pass (matches
//                          dump-native-vocabulary.js's explicit exit(0); the other three builders
//                          just fall off the end of main(), which is exit 0 anyway — omit it there).
//   opts.afterWrite(content, outPath) — called after a real write; may itself exit non-zero (the
//                          dashboard's row-count floor) or just print a summary.
// CRLF-tolerant both sides: the on-disk file is read raw and normalized only for the comparison,
// same as every builder's original inline check.
function emit(outPath, content, opts) {
  opts = opts || {};
  const norm = (s) => s.replace(/\r\n/g, "\n");
  if (opts.checkMode) {
    const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
    if (norm(existing) !== norm(content)) {
      console.error(opts.staleMessage ? opts.staleMessage() : `${outPath} is stale`);
      process.exit(1);
    }
    console.log(opts.upToDateMessage ? opts.upToDateMessage() : `${outPath} is up to date`);
    if (typeof opts.checkExitCode === "number") process.exit(opts.checkExitCode);
    return;
  }
  fs.writeFileSync(outPath, content);
  if (opts.afterWrite) opts.afterWrite(content, outPath);
}

module.exports = { read, emit };
