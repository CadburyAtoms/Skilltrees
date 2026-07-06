#!/usr/bin/env node
/* tests/run.js — zero-dependency test runner.
 *
 *   node tests/run.js
 *
 * Requires every tests/*.test.js in order; each file registers cases with the global
 * `test(name, fn)` (sync, throw = fail — use node:assert). Exit 0 iff every case passes.
 * Part of the pre-commit/CI gate alongside validate.js, lint-refs.js, and audit.py.
 */
"use strict";
const fs = require("fs");
const path = require("path");

let pass = 0;
const failures = [];
let currentFile = "";

global.test = (name, fn) => {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures.push({ file: currentFile, name, e });
    console.log(`  ✗ ${name}`);
    console.log(`    ${String(e.message || e).split("\n").join("\n    ")}`);
  }
};

const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".test.js")).sort();
for (const f of files) {
  currentFile = f;
  console.log(`\n${f}`);
  require(path.join(__dirname, f));
}

console.log(`\n${pass} passed, ${failures.length} failed.`);
process.exit(failures.length ? 1 : 0);
