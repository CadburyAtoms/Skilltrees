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

// The scope an authored overlay belongs to: ONE tree, keyed "<atlas>/<group>", lowercased so a
// case drift between `_meta.group` and `tree.group` can never silently miss. This is the unit the
// name fallback is allowed to search — see loadAuthoredIndex.
function authoredScopeKey(atlas, group) {
  return `${String(atlas || "").trim()}/${String(group || "").trim()}`.toLowerCase();
}

// Build the authored-overlay index: <dataDir>/authored/*.json ->
//   { byId, byTree, collisions, ambiguous, count }.
//
// TODO_REPO_HYGIENE #16: foundry-build.js used to read this directory inline with
// `try { j = JSON.parse(...) } catch { continue; }` per file — a malformed authored file was
// dropped with NO message, and the build shipped that whole tree from the generator + side
// tables (bootstrap text, no automation) instead of failing. Each file is now read through
// `loadJson` (scripts/lib/data.js), which THROWS, naming the file, on a read or parse failure —
// the caller (foundry-build.js) is expected to let that propagate and fail the build loudly.
//
// TODO_REPO_HYGIENE #18: the index used to carry a GLOBAL `byName` map, built last-file-wins
// across all 21 overlays, and foundry-build.js consulted it whenever the docId lookup missed.
// Twelve talent names live in 2–7 different overlay files (Hardy ×7, Mighty ×6, Collected ×5,
// Composed, Baleful, Surefooted, Shatter Focus, …), so that fallback could hand a talent ANOTHER
// TREE'S overlay — and the fallback is not dormant: a docId is `fid("talent:<tree>:<name>")`, so
// it changes on every rename, and deity/Knowledge's "The Final Study" already resolves by name
// today because its stored docId no longer matches its current name. It landed on the right
// overlay only by luck of file order. The global map is therefore GONE, replaced by `byTree` —
// one name map per tree scope — so the fallback cannot leave the talent's own atlas+group.
// Do not re-add a flat byName; `authoredOverlayFor` below is the only intended lookup.
//
// `collisions` = names present in ≥2 DIFFERENT scopes (harmless now that the fallback is scoped,
// but listed in the build log so the hazard stays visible); `ambiguous` = the same name defined
// twice WITHIN one scope, which is a genuine last-one-wins coin flip and is warned about loudly.
//
// A MISSING `authored/` directory itself is not an error (matches the pre-existing behaviour:
// some data dirs used in tests/scratch builds omit it entirely) — only a per-file read/parse
// failure throws.
function loadAuthoredIndex(dataDir, { warn = console.warn } = {}) {
  const byId = {}, byTree = {};
  let files = [];
  try { files = fs.readdirSync(`${dataDir}/authored`).filter((f) => f.endsWith(".json")).sort(); }
  catch { return { byId, byTree, collisions: [], ambiguous: [], count: 0 }; }
  let count = 0;
  const seen = new Map();   // talent name -> Map(scope -> [file, ...])
  for (const f of files) {
    const j = loadJson(`${dataDir}/authored/${f}`);   // throws, naming the file, on a broken read/parse
    // Convention (scripts/lib/data.js): data/authored/<atlas>-<group>.json, with the same pair
    // repeated in `_meta`. `_meta` wins; the filename is the fallback so an overlay written
    // without `_meta` still lands in a real scope instead of a catch-all bucket.
    const stem = f.replace(/\.json$/i, "");
    const dash = stem.indexOf("-");
    const meta = j._meta || {};
    const scope = authoredScopeKey(
      meta.atlas || (dash > 0 ? stem.slice(0, dash) : stem),
      meta.group || (dash > 0 ? stem.slice(dash + 1) : "")
    );
    const bucket = (byTree[scope] ||= {});
    for (const [name, entry] of Object.entries(j.talents || {})) {
      if (entry && entry.docId) byId[entry.docId] = entry;
      bucket[name] = entry; count++;
      const scopes = seen.get(name) || new Map();
      scopes.set(scope, [...(scopes.get(scope) || []), f]);
      seen.set(name, scopes);
    }
  }
  const collisions = [], ambiguous = [];
  for (const [name, scopes] of [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    for (const [scope, inScope] of scopes) {
      if (inScope.length > 1) ambiguous.push({ name, scope, files: inScope });
    }
    if (scopes.size > 1) collisions.push({ name, scopes: [...scopes.keys()].sort() });
  }
  for (const a of ambiguous) {
    warn(`  [authored] AMBIGUOUS: "${a.name}" is defined twice in scope ${a.scope} (${a.files.join(", ")}) — last file wins`);
  }
  const line = formatAuthoredCollisions(collisions);
  if (line) warn(line);
  return { byId, byTree, collisions, ambiguous, count };
}

// The ONE build-log line that makes cross-tree name collisions visible; null when there are none.
// Kept separate from loadAuthoredIndex so a test can pin the exact text the build prints.
function formatAuthoredCollisions(collisions) {
  if (!collisions || !collisions.length) return null;
  return `  [authored] ${collisions.length} talent name(s) appear in more than one overlay — the name ` +
         `fallback is scoped to each talent's own atlas+group, so these cannot cross trees: ` +
         collisions.map((c) => `${c.name} ×${c.scopes.length}`).join(", ");
}

// Resolve the authored overlay for one generated talent. The docId is authoritative; the name is
// only a fallback, and only WITHIN the talent's own tree (TODO_REPO_HYGIENE #18 — see above).
function authoredOverlayFor(index, { docId, name, atlas, group }) {
  if (docId && index.byId[docId]) return index.byId[docId];
  const bucket = index.byTree[authoredScopeKey(atlas, group)];
  return bucket ? bucket[name] : undefined;
}

module.exports = { prereqGroups, loadAuthoredIndex, authoredScopeKey, authoredOverlayFor, formatAuthoredCollisions };
