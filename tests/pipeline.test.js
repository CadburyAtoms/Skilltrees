/* tests/pipeline.test.js — regression cases for the build/authoring pipeline.
 *
 * These pin two bugs that shipped to Ben's table and that every gate passed over.
 * Both are pure-function bugs in scripts/, so they belong here rather than in the
 * engine harness (tests/harness.js loads register-skills.js; nothing here needs it).
 */
"use strict";
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const { readSourceLF } = require("./harness.js");

const { applyAuthorable, isEmptyAuthored } = require(path.join(__dirname, "..", "scripts", "edha-pack-io.js"));

/* ---------------------------------------------------------------------------
 * 1. The empty-overlay wipe (found 2026-07-24, cost 10 talents their behaviour)
 *
 * authorable() writes `events: {}` for any talent that had no rules at extract time,
 * so nearly every entry in data/authored/ asserts an empty events map. applyAuthorable
 * used to write any value that wasn't null/undefined — and `{}` passes that test — so a
 * stale empty snapshot overwrote rules the generator had since learned to emit, and the
 * talent shipped with a blank Events tab in Foundry.
 * ------------------------------------------------------------------------ */

test("isEmptyAuthored: {} and [] are empty, populated values are not", () => {
  assert.strictEqual(isEmptyAuthored(undefined), true);
  assert.strictEqual(isEmptyAuthored(null), true);
  assert.strictEqual(isEmptyAuthored({}), true);
  assert.strictEqual(isEmptyAuthored([]), true);
  assert.strictEqual(isEmptyAuthored({ a: 1 }), false);
  assert.strictEqual(isEmptyAuthored([1]), false);
  assert.strictEqual(isEmptyAuthored(""), false);   // a cleared description IS an edit
  assert.strictEqual(isEmptyAuthored(0), false);
});

test("applyAuthorable: an empty authored `events` does NOT wipe generated rules", () => {
  const generated = { system: { events: { r1: { id: "r1", event: "use", handler: { type: "edha-burst" } } } }, effects: [] };
  applyAuthorable(generated, { events: {}, effects: [] });
  assert.deepStrictEqual(Object.keys(generated.system.events), ["r1"],
    "generated rule was destroyed by an empty authored overlay — the 07-24 bug");
});

test("applyAuthorable: an empty authored `effects` does NOT wipe generated ActiveEffects", () => {
  const generated = { system: { events: {} }, effects: [{ _id: "e1", name: "Guardian Stance", changes: [] }] };
  applyAuthorable(generated, { events: {}, effects: [] });
  assert.strictEqual(generated.effects.length, 1, "generated AE was destroyed by an empty overlay");
});

test("applyAuthorable: a POPULATED authored overlay still wins over the generator", () => {
  const generated = { system: { events: { r1: { id: "r1", event: "use" } } }, effects: [] };
  applyAuthorable(generated, {
    events: { r2: { id: "r2", event: "edha-apply-watch" } },
    effects: [{ _id: "e9", name: "Authored", changes: [] }],
  });
  assert.deepStrictEqual(Object.keys(generated.system.events), ["r2"], "authored events must win");
  assert.strictEqual(generated.effects[0].name, "Authored", "authored effects must win");
});

/* ---------------------------------------------------------------------------
 * 2. Tree-graph integrity — CLAUDE.md iron rule 7
 *
 * Green's `Predator's Instinct` <-> `Pack Hunter`, Red's `Burning Drive` <->
 * `Reckless Advance`, and Death's `Risen Servant` <-> `Speak with the Fallen` were all
 * live on main for the whole tracked history. The first took Green's entire Instinct
 * column out of play; a player hit it at session 0. validate.js now fails on a cycle or
 * an unreachable node, but data can regress, so pin the real files here too.
 *
 * The model mirrors foundry-build.js: `connections` = ONE OR-group, each prose group
 * = another OR-group, AND across groups.
 * ------------------------------------------------------------------------ */

const REPO = path.join(__dirname, "..");
const load = (f) => JSON.parse(fs.readFileSync(path.join(REPO, "data", f), "utf8"));
const rowName = (r) => r.name || r["Talent Name"] || r.Name || "";
const groups = (s) => (!s || /^\s*[—-]\s*$/.test(String(s)))
  ? []
  : String(s).split(/\s*[;,]\s*|\s+and\s+/i).map(p => p.trim()).filter(Boolean)
      .map(p => p.split(/\s+or\s+/i).map(x => x.trim()).filter(Boolean));

function treesOf(rows, keyFn) {
  const out = {};
  for (const r of rows) {
    if (!r || !rowName(r)) continue;
    const k = keyFn(r);
    if (k) (out[k] = out[k] || []).push(r);
  }
  return out;
}

// Returns { dead:[names], cycles:true|false } for one tree's rows.
function analyse(rows) {
  const byName = {};
  for (const r of rows) byName[rowName(r).toLowerCase()] = r;
  const local = (n) => byName[String(n).trim().toLowerCase()];
  const req = {};
  for (const r of rows) {
    const gs = [];
    const conn = (Array.isArray(r.connections) ? r.connections : []).filter(local).map(n => rowName(local(n)));
    if (conn.length) gs.push(conn);
    for (const g of groups(r.prerequisites || r.Prerequisites)) {
      const t = g.filter(local).map(x => rowName(local(x)));
      if (t.length) gs.push(t);
    }
    req[rowName(r)] = gs;
  }
  const ok = {};
  for (const r of rows) if (!req[rowName(r)].length) ok[rowName(r)] = true;
  for (let changed = true; changed; ) {
    changed = false;
    for (const r of rows) {
      const n = rowName(r);
      if (ok[n]) continue;
      if (req[n].every(g => g.some(p => ok[p]))) { ok[n] = true; changed = true; }
    }
  }
  return { dead: rows.map(rowName).filter(n => !ok[n]), req };
}

function hasCycle(req) {
  const state = {};
  let found = false;
  const walk = (n) => {
    if (state[n] === 1) { found = true; return; }
    if (state[n] === 2) return;
    state[n] = 1;
    for (const g of req[n] || []) for (const p of g) walk(p);
    state[n] = 2;
  };
  for (const n of Object.keys(req)) walk(n);
  return found;
}

const ATLASES = [
  ["leyline.json", (r) => r.path || r.Color],
  ["domain.json",  (r) => r.Deity || r.deity],
  ["cosmere.json", (r) => r.Path || r.path],
];

test("every talent tree is walkable — no unreachable talents (iron rule 7)", () => {
  const bad = [];
  for (const [file, keyFn] of ATLASES) {
    for (const [tree, rows] of Object.entries(treesOf(load(file), keyFn))) {
      const { dead } = analyse(rows);
      if (dead.length) bad.push(`${file} / ${tree}: ${dead.length} unreachable — ${dead.join(", ")}`);
    }
  }
  assert.deepStrictEqual(bad, [], "unreachable talents:\n  " + bad.join("\n  "));
});

test("no talent tree contains a prerequisite cycle (iron rule 7)", () => {
  const bad = [];
  for (const [file, keyFn] of ATLASES) {
    for (const [tree, rows] of Object.entries(treesOf(load(file), keyFn))) {
      const { req } = analyse(rows);
      if (hasCycle(req)) bad.push(`${file} / ${tree}`);
    }
  }
  assert.deepStrictEqual(bad, [], "trees with a prerequisite cycle: " + bad.join(", "));
});

/* ---------------------------------------------------------------------------
 * 3. Prerequisite text that silently does nothing (found 2026-07-24)
 *
 * The separators in a prerequisite string are ENGLISH WORDS, and a token that resolves to
 * nothing is classified "narrative" and quietly dropped — so a malformed prereq looks fine
 * on the card and enforces nothing. Four shipped instances, one per failure mode.
 * ------------------------------------------------------------------------ */

test("prereqGroups: a talent name containing ' and ' survives the separator split", () => {
  // Scholar's "Mind and Body" was torn into "Mind" + "Body", so Know Your Moment's talent
  // prerequisite was dropped entirely and the card demanded only Deduction 2+.
  const { prereqGroups } = require(path.join(REPO, "scripts", "foundry-build-parts.js"));
  const isName = (x) => ["Mind and Body", "Hardy"].includes(String(x).trim());
  assert.deepStrictEqual(prereqGroups("Mind and Body; Deduction 2+", isName),
    [["Mind and Body"], ["Deduction 2+"]]);
  // …and without a resolver the old behaviour is preserved (pure-string callers).
  assert.deepStrictEqual(prereqGroups("Mind and Body; Deduction 2+"),
    [["Mind"], ["Body"], ["Deduction 2+"]]);
  // ordinary AND/OR splitting is untouched
  assert.deepStrictEqual(prereqGroups("Hardy; Green 2+ or Green 3+", isName),
    [["Hardy"], ["Green 2+", "Green 3+"]]);
});

test("no shipped prereq uses a malformed rank or a colon separator", () => {
  const bad = [];
  for (const [file, keyFn] of ATLASES) {
    for (const [tree, rows] of Object.entries(treesOf(load(file), keyFn))) {
      // heroic: only the six real paths ship; Radiant orders in cosmere.json are not built
      if (file === "cosmere.json" && !["Agent", "Envoy", "Hunter", "Leader", "Scholar", "Warrior"].includes(tree)) continue;
      for (const r of rows) {
        const p = String(r.prerequisites || r.Prerequisites || "");
        if (/[A-Za-z]\s*\+\s*\d/.test(p)) bad.push(`${tree}/${rowName(r)}: "${p}" — rank written "+N", must be "N+"`);
        if (/:/.test(p)) bad.push(`${tree}/${rowName(r)}: "${p}" — ":" is not a separator; use ";" for AND`);
      }
    }
  }
  assert.deepStrictEqual(bad, [], "malformed prerequisite text (silently becomes narrative):\n  " + bad.join("\n  "));
});

test("the three historic cycles stay fixed (Green / Red / Death)", () => {
  const ley = load("leyline.json"), dom = load("domain.json");
  const find = (rows, n) => rows.find(r => rowName(r) === n);
  const conn = (r) => (Array.isArray(r.connections) ? r.connections : []);

  // Green: Pack Hunter is the branch root (layout y=0.2, skill-gated) — it must not
  // depend on its own child Predator's Instinct.
  assert.ok(!conn(find(ley, "Pack Hunter")).includes("Predator's Instinct"),
    "Green cycle is back: Pack Hunter must not connect to its child Predator's Instinct");

  // Red: Reckless Advance is the branch root (layout y=0.2); Burning Drive is drawn below it,
  // so the card must not demand Burning Drive.
  assert.notStrictEqual(find(ley, "Reckless Advance").prerequisites, "Burning Drive",
    "Red cycle is back: Reckless Advance is the root, it cannot require its own child");

  // Death: Speak with the Fallen hangs off Reaper's Harvest; Risen Servant is drawn below it.
  assert.notStrictEqual(find(dom, "Speak with the Fallen").Prerequisites, "Risen Servant",
    "Death cycle is back: Speak with the Fallen cannot require its own child Risen Servant");
});

test("the deploy guard's baseline is keyed to the MODROOT, never the data dir (2026-07-26c)", () => {
  // The baseline describes ONE modroot's packs. When it lived under DATA it was shared across
  // every build target, so a session building into a scratch modroot silently re-stamped the
  // baselines describing Ben's LIVE packs - the first post-migration deploy then flagged 76
  // phantom "un-extracted Foundry edits" and the guard's real protection was long gone.
  for (const rel of ["scripts/foundry-build.js", "scripts/foundry-extract.js"]) {
    const src = readSourceLF(rel);
    assert.ok(/BASELINE_DIR = `\$\{MODROOT\}\/\.baselines`/.test(src),
      `${rel}: BASELINE_DIR must be \${MODROOT}/.baselines`);
    assert.ok(!/BASELINE_DIR = `\$\{(DATA|AUTHORED_DIR)\}/.test(src),
      `${rel}: BASELINE_DIR re-keyed to the data dir - the scratch-build clobber returns`);
  }
});

/* ---------------------------------------------------------------------------
 * 4. A malformed authored file must fail the build loudly, naming the file
 *    (TODO_REPO_HYGIENE #16)
 *
 * foundry-build.js used to read data/authored/*.json inline with
 * `try { j = JSON.parse(...) } catch { continue; }` — a broken file was dropped with NO
 * message and the build shipped that whole tree from the generator + side tables (bootstrap
 * text, no automation). The index is now built by loadAuthoredIndex() (foundry-build-parts.js),
 * which reads each file through loadJson (scripts/lib/data.js) — loadJson THROWS, naming the
 * file, on a read or parse failure, and loadAuthoredIndex does not catch that per-file.
 *
 * Fixtures: tests/fixtures/authored-broken/authored/talent-broken.json is deliberately
 * truncated JSON; tests/fixtures/authored-good/authored/talent-good.json is well-formed, to
 * prove the loader's ordinary behaviour is unchanged.
 * ------------------------------------------------------------------------ */

const { loadAuthoredIndex } = require(path.join(__dirname, "..", "scripts", "foundry-build-parts.js"));

test("loadAuthoredIndex: a malformed authored file throws, naming the file, instead of being skipped", () => {
  const dataDir = path.join(__dirname, "fixtures", "authored-broken");
  assert.throws(
    () => loadAuthoredIndex(dataDir),
    (e) => /talent-broken\.json/.test(e.message),
    "a broken authored/*.json file must fail loudly and name the file (TODO_REPO_HYGIENE #16)"
  );
});

test("loadAuthoredIndex: a well-formed authored directory still loads normally", () => {
  const dataDir = path.join(__dirname, "fixtures", "authored-good");
  const idx = loadAuthoredIndex(dataDir);
  assert.strictEqual(idx.count, 1);
  assert.ok(idx.byName["Test Talent"], "byName must carry the fixture talent");
  assert.strictEqual(idx.byId["fixture001"], idx.byName["Test Talent"], "byId must map docId to the same entry");
});

test("loadAuthoredIndex: a missing authored/ directory returns an empty index, not an error", () => {
  const dataDir = path.join(__dirname, "fixtures", "authored-directory-does-not-exist");
  assert.deepStrictEqual(loadAuthoredIndex(dataDir), { byId: {}, byName: {}, count: 0 });
});

/* ---------------------------------------------------------------------------
 * 5. The heroic-ids snapshot must fail the build loudly when missing
 *    (TODO_REPO_HYGIENE #17)
 *
 * foundry-build.js used to read the cosmere-rpg system's heroic-path talent ids from a
 * hard-coded temp path (`C:/tmp/heroic_ids.json`) with `catch { return {}; }` — on CI, or any
 * machine besides Ben's, the map silently came back {} and prose prerequisites naming a system
 * talent (e.g. "Composed") degraded to plain narrative clauses with no warning. The snapshot is
 * now tracked at data/system-heroic-ids.json (EDHA_HEROIC_IDS overrides the path) and read
 * through loadJson (scripts/lib/data.js), which throws, naming the file, instead of returning {}.
 * ------------------------------------------------------------------------ */

const { loadJson } = require(path.join(__dirname, "..", "scripts", "lib", "data.js"));

test("system-heroic-ids snapshot: a missing file throws, naming the file, instead of degrading silently", () => {
  const missingPath = path.join(__dirname, "fixtures", "system-heroic-ids-does-not-exist.json");
  assert.throws(
    () => loadJson(missingPath),
    (e) => e.message.includes(missingPath),
    "a missing heroic-ids snapshot must fail loudly and name the file (TODO_REPO_HYGIENE #17)"
  );
});

test("system-heroic-ids snapshot: the tracked file loads and exposes the heroicIds map", () => {
  const p = path.join(__dirname, "..", "data", "system-heroic-ids.json");
  const doc = loadJson(p);
  assert.ok(doc.heroicIds && typeof doc.heroicIds === "object", "must expose a heroicIds map");
  assert.ok(doc.heroicIds["Composed"], "must resolve the system talents named in the Why (e.g. \"Composed\")");
  assert.ok(Array.isArray(doc._README) && /Do not hand-edit/.test(doc._README.join(" ")),
    "must carry the native-vocabulary.json-style _README provenance convention");
});
