/* scripts/foundry-build-parts.js — pure, dependency-free pieces of the generator.
 *
 * `foundry-build.js` cannot be require()d from a test: it resolves `classic-level` at load and
 * then runs its whole build in a top-level async IIFE. Anything in it that is worth pinning with
 * a unit test therefore has to live here instead, and be required BY the generator — never
 * copy-pasted, or the copy drifts from the shipped behaviour and the test starts lying.
 *
 * Required by: scripts/foundry-build.js, tests/pipeline.test.js.
 *
 * `loadJson` (from ./lib/data.js, required below) pulls in ./edha-pack-io.js for `slugify` —
 * that module resolves classic-level LAZILY inside readPack() only, so requiring it here does
 * NOT require classic-level to be installed (verified: this file loads fine with no
 * node_modules/classic-level present, which is the state a bare test run is in).
 */
"use strict";
const fs = require("fs");
const { loadJson } = require("./lib/data.js");

// Split a prerequisite string into AND-groups of OR-alternatives.
//   "Bone Garden or Speak with the Fallen; Green 2+"  ->  [[Bone Garden, Speak with the Fallen], [Green 2+]]
//
// `isName` (optional) resolves a string to a real talent name. It exists because the separators
// are ENGLISH WORDS that also occur inside talent names: splitting unconditionally on /\s+and\s+/
// tore Scholar's "Mind and Body" into "Mind" + "Body", neither of which resolves, so Know Your
// Moment's talent prerequisite was silently DROPPED and the card demanded only Deduction 2+
// (found 2026-07-24). Any talent whose name contains " and " / " or " was unreferenceable.
// So: try the whole fragment as a name BEFORE splitting it further, at each level. Without an
// `isName` the behaviour is exactly as before, which keeps any pure-string caller working.
function prereqGroups(s, isName) {
  if (!s || /^\s*[—-]\s*$/.test(String(s))) return [];
  const known = (x) => typeof isName === "function" && !!isName(x);
  const out = [];
  for (const chunk of String(s).split(/\s*[;,]\s*/).map(p => p.trim()).filter(Boolean)) {
    // A whole ;-delimited chunk that IS a talent name is one group, never split on and/or.
    if (known(chunk)) { out.push([chunk]); continue; }
    for (const part of chunk.split(/\s+and\s+/i).map(p => p.trim()).filter(Boolean)) {
      if (known(part)) { out.push([part]); continue; }
      out.push(part.split(/\s+or\s+/i).map(x => x.trim()).filter(Boolean));
    }
  }
  return out;
}

// Build the authored-overlay index: <dataDir>/authored/*.json -> { byId, byName, count }.
//
// TODO_REPO_HYGIENE #16: foundry-build.js used to read this directory inline with
// `try { j = JSON.parse(...) } catch { continue; }` per file — a malformed authored file was
// dropped with NO message, and the build shipped that whole tree from the generator + side
// tables (bootstrap text, no automation) instead of failing. Each file is now read through
// `loadJson` (scripts/lib/data.js), which THROWS, naming the file, on a read or parse failure —
// the caller (foundry-build.js) is expected to let that propagate and fail the build loudly.
//
// A MISSING `authored/` directory itself is not an error (matches the pre-existing behaviour:
// some data dirs used in tests/scratch builds omit it entirely) — only a per-file read/parse
// failure throws.
function loadAuthoredIndex(dataDir) {
  const byId = {}, byName = {};
  let files = [];
  try { files = fs.readdirSync(`${dataDir}/authored`).filter((f) => f.endsWith(".json")); }
  catch { return { byId, byName, count: 0 }; }
  let count = 0;
  for (const f of files) {
    const j = loadJson(`${dataDir}/authored/${f}`);   // throws, naming the file, on a broken read/parse
    for (const [name, entry] of Object.entries(j.talents || {})) {
      if (entry && entry.docId) byId[entry.docId] = entry;
      byName[name] = entry; count++;
    }
  }
  return { byId, byName, count };
}

module.exports = { prereqGroups, loadAuthoredIndex };
