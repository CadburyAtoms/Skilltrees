#!/usr/bin/env node
/* docs/analysis/talent-comparison/shape-corpus.js — TODO_REPO_HYGIENE item 192.
 *
 * WHY THIS EXISTS. Item 177's migration check (PR 4 = item 185) pinned its Embedded-Actions
 * fixture diff against exactly two hand-picked files — the SYSTEM's own `subtle-takedown.json`
 * and `fatal-thrust.json`. The installed Mistborn Handbook module (206 talents, 67 powers, one
 * embedded action per non-passive talent and none per passive) is the best oracle for the whole
 * shape family the 3.x builder has to emit: consumption rows carrying the ancestor-Actor
 * `matchDocument` step, `item_resource` charges, `skill_test` + `@scalar` damage, `modality` on
 * both the talent and its action, `power` prerequisites on talent-tree nodes. This script turns a
 * dump of those packs (`dump-packs.js`'s output) into a fixture item 185's validator can diff
 * against instead of two files: 200+ real 3.x documents, reduced to structure only.
 *
 * WHAT "SHAPE" MEANS. For every item document — a talent, a power, an action, a path/goal/tree
 * node, and every action embedded at `system.__embedded.items[]` (recursively) — this keeps every
 * key PATH and every field's TYPE, and drops the field's actual VALUE:
 *   - a string becomes the literal "string"; a number becomes 0; a boolean becomes false; null
 *     stays null;
 *   - an array of objects keeps ONE representative shape (every element's shape merged into one),
 *     not one shape per element — `[]` if the array is empty in every example seen;
 *   - `name`, `description`, `img`, `_id`, `_stats`, `folder`, `sort`, `ownership` and `flags` are
 *     DROPPED ENTIRELY (key and value), at every depth — no title, no card text, no icon path, no
 *     Foundry-assigned id ever reaches the shape;
 *   - an object whose values are ALL themselves plain objects is a DICTIONARY, not a fixed schema
 *     (a genuine fixed schema in this corpus always mixes in a primitive or a null among its
 *     sibling fields — see `isDictLike`'s own comment): it collapses to one
 *     `{"*": <merged shape of every value>}` entry instead of one literal key per instance —
 *     otherwise 61 talent-tree documents' `nodes` objects, a `grant-expertises` handler's
 *     free-text-keyed `expertises` map, and every `events` list keyed by a generated rule id
 *     would each explode into thousands of one-off "shapes" that are really the same shape
 *     repeated, OR leak the free-text key itself into the fixture.
 *
 * NO LICENSED TEXT REACHES THIS FIXTURE OR THE REPO. Every string becomes the literal marker
 * "string" and the fields above are dropped outright, so no card name, description, chat text or
 * icon path is ever written into the committed fixture — only which keys exist and what type each
 * one holds. The dumped pack JSON itself (which DOES carry the licensed text) never leaves
 * $TEMP — see docs/analysis/talent-comparison/README.md.
 *
 *   node docs/analysis/talent-comparison/dump-packs.js <copied-packs-dir> <scratch>/mistborn-json
 *   node docs/analysis/talent-comparison/shape-corpus.js <scratch>/mistborn-json tests/fixtures/embedded-actions-shapes.json [--module-version X.Y.Z]
 *
 * Deterministic given the same input dump — no dates or paths inside the shapes themselves, only
 * in the `_header` block (which DOES record the generation date, so a stale fixture is visible at
 * a glance; there is no automated staleness gate for it, unlike bestiary-census.js, because
 * regenerating it needs a real Foundry install with the module — see item 192's "Done when").
 */
"use strict";

const fs = require("fs");
const path = require("path");

// Dropped at EVERY depth — title/description/icon/Foundry-id fields. Not "type": a document's own
// `type` ("talent" / "power" / "action" / ...) is closed-vocabulary structure, not licensed prose,
// and item 185's validator needs it to tell an action's shape from a talent's.
const DROP_KEYS = new Set(["name", "description", "img", "_id", "_stats", "folder", "sort", "ownership", "flags"]);

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// An object counts as a dictionary (collapse every key to one wildcard entry) whenever EVERY one
// of its values is itself a plain object. A genuinely fixed schema container in this corpus always
// mixes in a primitive or a null somewhere among its sibling fields — `damage: {formula, type}`,
// `resources: {uses, charges, ammo}` (only one of the three is ever an object at a time; the other
// two are null) — so this stays literal for those and only fires on the actual dynamically-keyed
// maps: talent-tree `nodes`/`prerequisites`, a required-talent list keyed by slug, an `events`
// list keyed by a generated rule id, and a `grant-expertises` handler's `expertises` map keyed by
// a free-text `"<type>:<name>"` composite (the leak this rule exists to catch — an early version
// keyed the collapse off id/slug-SHAPED keys alone and missed exactly this one).
function isDictLike(obj) {
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  return keys.every((k) => isPlainObject(obj[k]));
}

function sortedObject(obj) {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
}

// Merge two already-REDUCED shapes (never raw data) into one that represents both — used to fold
// an array's elements into one representative shape, and a dictionary's values into one `"*"`
// entry. Prefers the more structured side on a genuine mismatch (rare: a field that is sometimes
// an object and sometimes null/a scalar across examples) rather than trying to express a union;
// this fixture only needs to know a key CAN exist and roughly what it holds, per its own header.
function mergeShapes(a, b) {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (a === null) return b;
  if (b === null) return a;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length === 0) return b;
    if (b.length === 0) return a;
    return [mergeShapes(a[0], b[0])];
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const out = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      out[k] = mergeShapes(a[k], b[k]);
    }
    return sortedObject(out);
  }
  if (isPlainObject(a) || Array.isArray(a)) return a;
  if (isPlainObject(b) || Array.isArray(b)) return b;
  return a;
}

function reduceValue(v) {
  if (v === null) return null;
  if (Array.isArray(v)) return reduceArray(v);
  const t = typeof v;
  if (t === "string") return "string";
  if (t === "number") return 0;
  if (t === "boolean") return false;
  if (t === "object") return reduceObject(v);
  return null; // undefined and anything else JSON cannot carry anyway
}

function reduceArray(arr) {
  if (arr.length === 0) return [];
  let merged;
  for (const el of arr) merged = mergeShapes(merged, reduceValue(el));
  return [merged];
}

function reduceObject(obj) {
  if (isDictLike(obj)) {
    let merged;
    for (const k of Object.keys(obj)) merged = mergeShapes(merged, reduceObject(obj[k]));
    return { "*": merged };
  }
  const out = {};
  for (const k of Object.keys(obj)) {
    if (DROP_KEYS.has(k)) continue;
    out[k] = reduceValue(obj[k]);
  }
  return sortedObject(out);
}

/* --- Walking the dumped packs --------------------------------------------------------------- */

// Every top-level Item document (a talent/power/action/path/goal/talent_tree/equipment), plus
// every action embedded at `system.__embedded.items[]`, recursively — an embedded action can in
// principle carry its own `system.__embedded.items[]` too, though none in this corpus do.
function collectDocuments(jsonDir) {
  const docs = [];
  const files = fs.readdirSync(jsonDir).filter((f) => f.endsWith(".json")).sort();
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(jsonDir, file), "utf8"));
    for (const rec of data.items || []) {
      const doc = rec && rec.value;
      if (!doc || typeof doc.type !== "string") continue;
      docs.push({ kind: doc.type, raw: doc, pack: file });
      collectEmbedded(doc, docs, file);
    }
  }
  return docs;
}

function collectEmbedded(doc, docs, pack) {
  const embedded = doc && doc.system && doc.system.__embedded && doc.system.__embedded.items;
  if (!Array.isArray(embedded)) return;
  for (const item of embedded) {
    if (!item || typeof item.type !== "string") continue;
    docs.push({ kind: item.type, raw: item, pack });
    collectEmbedded(item, docs, pack);
  }
}

function buildShapeIndex(docs) {
  const byKind = new Map();
  for (const { kind, raw } of docs) {
    const shape = reduceObject(raw);
    const sig = JSON.stringify(shape);
    if (!byKind.has(kind)) byKind.set(kind, new Map());
    const shapes = byKind.get(kind);
    if (!shapes.has(sig)) shapes.set(sig, { shape, count: 0 });
    shapes.get(sig).count += 1;
  }
  const out = [];
  for (const [kind, shapes] of byKind) {
    for (const { shape, count } of shapes.values()) out.push({ kind, count, shape });
  }
  out.sort((a, b) => (a.kind === b.kind ? b.count - a.count : a.kind.localeCompare(b.kind)));
  return out;
}

/* --- CLI ------------------------------------------------------------------------------------- */

function parseArgs(argv) {
  const positional = [];
  let moduleVersion = "1.0.0";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--module-version") {
      moduleVersion = argv[++i];
    } else {
      positional.push(argv[i]);
    }
  }
  return { jsonDir: positional[0], outFile: positional[1], moduleVersion };
}

function run(jsonDir, outFile, moduleVersion) {
  const docs = collectDocuments(jsonDir);
  const shapes = buildShapeIndex(docs);
  const fixture = {
    _header: {
      generatedBy: "docs/analysis/talent-comparison/shape-corpus.js",
      purpose:
        "Shape-only fixture (TODO_REPO_HYGIENE item 192) for item 185's Embedded-Actions builder " +
        "to diff against — key paths and field TYPES only, no names/descriptions/licensed text.",
      sourceModule: "cosmere-rpg-mistborn-handbook",
      sourceModuleVersion: moduleVersion,
      generatedDate: new Date().toISOString().slice(0, 10),
      command:
        "node docs/analysis/talent-comparison/dump-packs.js <copied-packs-dir> <scratch>/mistborn-json " +
        "&& node docs/analysis/talent-comparison/shape-corpus.js <scratch>/mistborn-json " +
        "tests/fixtures/embedded-actions-shapes.json --module-version " +
        moduleVersion,
      totalDocuments: docs.length,
      totalShapes: shapes.length,
      dictionaryCollapseNote:
        "An object collapses every key into one wildcard \"*\" entry (merging every value's " +
        "shape) when every one of its values is itself a plain object — a fixed schema in this " +
        "corpus always mixes in a primitive or a null among its sibling fields, so this only ever " +
        "fires on an actual dynamically-keyed map (talent-tree nodes, prerequisite entries, a " +
        "required-talent list keyed by slug, an events list keyed by a generated rule id, a " +
        "grant-expertises handler's free-text-keyed expertises map) — never on a real field set. " +
        "This is also what keeps a free-text dictionary KEY (an expertise name, a skill " +
        "specialization) out of the fixture, not just its value.",
    },
    shapes,
  };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(fixture, null, 1) + "\n");
  return { totalDocuments: docs.length, totalShapes: shapes.length };
}

function main() {
  const { jsonDir, outFile, moduleVersion } = parseArgs(process.argv.slice(2));
  if (!jsonDir || !outFile) {
    console.error(
      "usage: shape-corpus.js <jsonDir from dump-packs.js> <outFixture.json> [--module-version X.Y.Z]"
    );
    process.exit(2);
    return;
  }
  const { totalDocuments, totalShapes } = run(jsonDir, outFile, moduleVersion);
  console.log(`wrote ${outFile}: ${totalDocuments} documents -> ${totalShapes} distinct shapes`);
}

// Flattens an already-REDUCED shape into its sorted list of dotted key paths (arrays contribute
// one "[]" segment, matching reduceArray's one-representative-element rule) — the leaf TYPE
// markers are discarded. Two real documents of the same schema can legitimately differ on which
// nullable leaf is populated (e.g. an action's `damage.formula` is a string on one talent and
// null on another, depending only on whether that talent deals damage) without differing in
// SHAPE, so a caller comparing a real document's reduced shape against this fixture's committed
// entries should compare key-path SETS, not exact type-marker equality — see
// tests/embedded-action-shapes.test.js for the worked example (item 185's own diff should do the
// same rather than re-deriving this).
function keyPaths(shape, prefix = "") {
  if (Array.isArray(shape)) {
    return shape.length ? keyPaths(shape[0], prefix + "[]") : [prefix + "[]"];
  }
  if (isPlainObject(shape)) {
    const out = [];
    for (const k of Object.keys(shape).sort()) out.push(...keyPaths(shape[k], `${prefix}.${k}`));
    return out;
  }
  return [prefix];
}

module.exports = { reduceObject, reduceValue, mergeShapes, isDictLike, keyPaths, collectDocuments, buildShapeIndex, run };

if (require.main === module) main();
