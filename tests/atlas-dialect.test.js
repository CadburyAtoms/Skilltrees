/* tests/atlas-dialect.test.js — pins the ONE atlas key dialect (TODO_REPO_HYGIENE #22,
 * 2026-09-05).
 *
 * WHY. data/leyline.json, data/domain.json and data/cosmere.json used to spell the same concept
 * three ways (`name` / `Name` / `"Talent Name"`, `flavor` / `"Flavor Text"` / absent), and the
 * whole reconciliation was one multi-key getter inside `normRow` in scripts/lib/data.js. Because
 * every field was optional in three spellings, scripts/validate.js could not check a real field
 * name: a row that lost its `name` key simply had two more places to look, and a row wearing the
 * WRONG dialect for its file validated exactly as well as a right one. The dialects are gone; the
 * aliases are gone with them. Three things are pinned so they cannot quietly come back:
 *
 *   1. normRow reads ONE key per field. A row carrying only the retired capitalized keys yields
 *      an EMPTY talent — that is the point: the aliases are not "fallbacks kept just in case",
 *      they are deleted, and this test fails the moment one is re-added.
 *   2. validate.js REJECTS each retired key by name, naming the replacement, and does so on rows
 *      that isLoadedByApp would otherwise skip (a row with `Deity` instead of `deity` is not
 *      "loaded", so before this it was never checked at all).
 *   3. The three live files actually hold the one dialect — and data/cosmere.json holds only the
 *      six built heroic paths, the nine Knights Radiant orders having been parked in
 *      source-materials/radiant-orders.json in the same pass.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const { normRow, rowName } = require(path.join(REPO, "scripts", "lib", "data.js"));
const { LEGACY_KEYS, validateOneFile } = require(path.join(REPO, "scripts", "validate.js"));

const load = (rel) => JSON.parse(fs.readFileSync(path.join(REPO, rel), "utf8"));
const HEROIC_PATHS = ["Agent", "Envoy", "Hunter", "Leader", "Scholar", "Warrior"];

// --------------------------------------------------------------------------
// 1. normRow's new contract
// --------------------------------------------------------------------------
test("normRow: reads the one lowercase dialect and injects the tree coordinates", () => {
  const row = {
    atlas: "leyline", path: "White", specialty: "Accord", name: "Guiding Signal",
    action: "1 Action", cost: "1 Investiture", prerequisites: "White 2+",
    description: "d", flavor: "f", tags: "t",
    layout: { x: 0.25, y: 0.5 }, connections: ["Root"],
  };
  assert.deepStrictEqual(normRow(row, "leyline", "White", "leyline/White"), {
    atlas: "leyline", group: "White", treeId: "leyline/White",
    name: "Guiding Signal", action: "1 Action", cost: "1 Investiture",
    prereqs: "White 2+",          // the ONE deliberate rename: prerequisites -> prereqs
    description: "d", flavor: "f", tags: "t", specialty: "Accord",
    layout: { x: 0.25, y: 0.5 }, connections: ["Root"],
  });
});

test("normRow: the retired capitalized aliases are GONE — an old-dialect row normalises to empty", () => {
  const old = {
    "Talent Name": "Entropy Strike", "Action Type": "1 Action", "Cost": "1 Investiture",
    "Prerequisites": "Blue 2+", "Description": "d", "Flavor Text": "f", "Tags": "t",
    "Tree": "Chaos", "Name": "Entropy Strike", "Specialty": "Key", "Action": "Special",
  };
  const t = normRow(old, "deity", "Chaos", "deity/Maelith");
  assert.strictEqual(t.name, "", 'normRow must not fall back to "Talent Name" / "Name"');
  assert.strictEqual(t.action, "", 'normRow must not fall back to "Action Type" / "Action"');
  assert.strictEqual(t.prereqs, "", 'normRow must not fall back to "Prerequisites"');
  assert.strictEqual(t.description, "", 'normRow must not fall back to "Description"');
  assert.strictEqual(t.flavor, "", 'normRow must not fall back to "Flavor Text"');
  assert.strictEqual(t.tags, "", 'normRow must not fall back to "Tags"');
  assert.strictEqual(t.specialty, "", 'normRow must not fall back to "Specialty" / "Tree"');
  assert.strictEqual(t.cost, "—", 'normRow must not fall back to "Cost" (missing cost is the em dash)');
  assert.strictEqual(rowName(old), "", "rowName must read only `name`");
});

test("normRow: the defaults and the sanitising survive the alias removal", () => {
  const bare = normRow({ name: "X" }, "heroic", "Agent", "heroic/Agent");
  assert.strictEqual(bare.cost, "—", "a missing cost is the em dash, not empty");
  assert.strictEqual(bare.layout, null);
  assert.strictEqual(bare.connections, null);
  assert.strictEqual(normRow({ name: "X", cost: "" }, "heroic", "Agent", "x").cost, "—",
    'an EMPTY cost is also the em dash — normRow treats "" as absent, as the old getter did');
  assert.strictEqual(normRow({ name: "X", layout: { y: 3 } }, "heroic", "Agent", "x").layout, null,
    "a layout without a numeric x is dropped, not passed through half-formed");
  const conn = ["A"];
  const out = normRow({ name: "X", connections: conn }, "heroic", "Agent", "x");
  assert.deepStrictEqual(out.connections, ["A"]);
  assert.notStrictEqual(out.connections, conn, "connections must be a copy — the caller mutates talents");
});

// --------------------------------------------------------------------------
// 2. validate.js rejects the retired keys, by name
// --------------------------------------------------------------------------
const runOne = (rows, atlas) => {
  const errors = [], warnings = [];
  validateOneFile(rows, "scratch.json", atlas, errors, warnings, new Map());
  return { errors, warnings };
};

test("validate.js: every retired capitalized key is rejected, naming its replacement", () => {
  for (const [legacy, replacement] of Object.entries(LEGACY_KEYS)) {
    const row = { atlas: "deity", deity: "Maelith", domain: "Chaos", specialty: "Chaos", name: "X" };
    row[legacy] = "whatever";
    const { errors } = runOne([row], "deity");
    const hit = errors.find((e) => e.msg.includes(`key "${legacy}"`));
    assert.ok(hit, `validate.js did not reject the retired key "${legacy}"`);
    assert.ok(hit.msg.includes(`use "${replacement}"`),
      `the rejection of "${legacy}" must name its replacement "${replacement}" — got: ${hit.msg}`);
  }
});

test("validate.js: the legacy-key check runs on rows isLoadedByApp would skip", () => {
  // No lowercase `deity`, so this row is NOT "loaded by the app" — before #22 that meant it was
  // never checked at all, which is exactly how a whole file could wear the wrong dialect.
  const { errors } = runOne([{ Deity: "Maelith", "Talent Name": "X" }], "deity");
  assert.ok(errors.some((e) => e.msg.includes('key "Deity"')), "an unloaded row must still be dialect-checked");
  assert.ok(errors.some((e) => e.msg.includes('key "Talent Name"')));
});

test("validate.js: a clean lowercase row produces no dialect error", () => {
  const { errors } = runOne(
    [{ atlas: "deity", deity: "Maelith", domain: "Chaos", specialty: "Chaos", name: "X", action: "1 Action",
       cost: "1 Investiture", prerequisites: "—", description: "d", flavor: "f", tags: "" }], "deity");
  assert.deepStrictEqual(errors, []);
});

// --------------------------------------------------------------------------
// 3. the live files
// --------------------------------------------------------------------------
test("the three structure files speak one lowercase dialect (live data)", () => {
  const bad = [];
  for (const rel of ["data/leyline.json", "data/domain.json", "data/cosmere.json"]) {
    load(rel).forEach((row, i) => {
      for (const k of Object.keys(row)) {
        if (Object.prototype.hasOwnProperty.call(LEGACY_KEYS, k)) bad.push(`${rel} row ${i}: "${k}"`);
        else if (/[A-Z]/.test(k[0]) || / /.test(k)) bad.push(`${rel} row ${i}: "${k}" (not lowercase/one word)`);
      }
    });
  }
  assert.deepStrictEqual(bad, [], "retired-dialect keys are back in the structure files:\n  " + bad.join("\n  "));
});

test("data/cosmere.json holds only the six built heroic paths; the Radiant orders are parked", () => {
  const cos = load("data/cosmere.json");
  const paths = [...new Set(cos.map((r) => r.path))].sort();
  assert.deepStrictEqual(paths, HEROIC_PATHS.slice().sort());
  assert.strictEqual(cos.length, 150, "6 paths x 25 talents");

  const parked = load("source-materials/radiant-orders.json");
  assert.ok(typeof parked._note === "string" && parked._note.length > 0,
    "the parked file must carry a header note saying what it is and why it is not live");
  assert.strictEqual(parked.rows.length, 225, "9 Radiant orders x 25 rows");
  assert.deepStrictEqual([...new Set(parked.rows.map((r) => r.path))].sort(), parked._orders.slice().sort());
  // parked in the LIVE dialect, so un-parking is a straight paste — no key translation
  for (const row of parked.rows) {
    for (const k of Object.keys(row)) {
      assert.ok(!Object.prototype.hasOwnProperty.call(LEGACY_KEYS, k),
        `parked row "${row.name}" still wears the retired key "${k}"`);
    }
  }
});
