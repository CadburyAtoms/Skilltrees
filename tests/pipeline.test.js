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
