#!/usr/bin/env node
/* tests/run.js — zero-dependency test runner.
 *
 *   node tests/run.js
 *
 * Requires every tests/*.test.js in order; each file registers cases with the global
 * `test(name, fn)` (throw = fail — use node:assert). Exit 0 iff every case passes.
 * Part of the pre-commit/CI gate alongside validate.js, lint-refs.js, and audit.py.
 *
 * ASYNC-AWARE since 2026-07-26n (the owner-list race regression needs to await real promise
 * interleavings): registration collects the cases during require, then one async loop runs them
 * IN ORDER, awaiting any returned promise. Sync tests behave exactly as before — same output,
 * same ordering, same exit semantics. A test that returns a promise simply gets awaited.
 */
"use strict";
const fs = require("fs");
const path = require("path");

let pass = 0;
const failures = [];
let currentFile = "";
const cases = [];

global.test = (name, fn) => cases.push({ file: currentFile, name, fn });

const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js")).sort();
for (const f of files) {
  currentFile = f;
  require(path.join(__dirname, f));
}

(async () => {
  let lastFile = "";
  for (const c of cases) {
    if (c.file !== lastFile) { console.log(`\n${c.file}`); lastFile = c.file; }
    try {
      await c.fn();
      pass++;
      console.log(`  ✓ ${c.name}`);
    } catch (e) {
      failures.push({ file: c.file, name: c.name, e });
      console.log(`  ✗ ${c.name}`);
      console.log(`    ${String(e.message || e).split("\n").join("\n    ")}`);
    }
  }
  console.log(`\n${pass} passed, ${failures.length} failed.`);
  process.exit(failures.length ? 1 : 0);
})();
