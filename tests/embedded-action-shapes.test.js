/* Pins for TODO_REPO_HYGIENE item 192 — the shape-only fixture corpus.
 *
 * WHY THIS EXISTS. Item 177's migration check (item 185) pinned its Embedded-Actions builder
 * diff against exactly two hand-picked system compendium files. Item 192 built a much bigger
 * oracle instead: every item document (talent/power/action/path/goal/talent_tree/equipment) in
 * the installed Mistborn Handbook module (881 documents once embedded actions are counted),
 * reduced to key paths + field TYPES only (docs/analysis/talent-comparison/shape-corpus.js),
 * committed as tests/fixtures/embedded-actions-shapes.json. This file proves the fixture is
 * usable: the two system files item 177 named — `subtle-takedown.json` (agent/spy) and
 * `fatal-thrust.json` (hunter/assassin), reduced the SAME way and pinned (with no licensed text)
 * in tests/fixtures/system-talent-shapes-3.1.0.json — are compatible with what the fixture
 * already catalogues.
 *
 * WHY "COMPATIBLE" AND NOT "IDENTICAL". The Mistborn Handbook module's packs are built against
 * system 3.0.0 (`_stats.systemVersion` in the raw LevelDB dump); the two named files come from
 * the 3.1.0 system's own source archive. Checked by hand while building this fixture: the 3.1.0
 * talent schema has picked up derived fields the 3.0.0-era corpus never carries — `hasPath`,
 * `hasSpecialty`, `hasAncestry`, `prerequisitesMet`, `specialty`, and a top-level `prerequisites`
 * (the corpus only ever carries prerequisites on the talent-tree NODE, never the talent itself) —
 * plus a `_key` field that is an artifact of how the system's own source JSON was unpacked, not a
 * real document field. So no talent in the fixture is byte-for-byte IDENTICAL to either system
 * file's full shape (pinned below as a fact, not a defect). What DOES hold, and is what item
 * 185's future validator actually needs: every key path the fixture's talent shapes use also
 * exists on the real 3.1.0 talent (the fixture is a subset — a smaller, older-schema sibling, not
 * a mismatched one), and each system talent's EMBEDDED ACTION — the actual subject the fixture is
 * named for — matches a cataloged action shape exactly on key paths (leaf TYPE markers aside: a
 * nullable leaf like `damage.formula` legitimately differs between an attack that deals damage
 * and a talent that does not, without the SHAPE differing — see `keyPaths`' own comment).
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const shapeCorpus = require(path.join(REPO, "docs", "analysis", "talent-comparison", "shape-corpus.js"));
const { keyPaths } = shapeCorpus;

const FIXTURE_PATH = path.join(REPO, "tests", "fixtures", "embedded-actions-shapes.json");
const SYSTEM_TALENTS_PATH = path.join(REPO, "tests", "fixtures", "system-talent-shapes-3.1.0.json");

const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
const systemTalents = JSON.parse(fs.readFileSync(SYSTEM_TALENTS_PATH, "utf8"));

function keyPathSet(shape) {
  return new Set(keyPaths(shape));
}

const fixtureActionKeySigs = new Set(
  fixture.shapes.filter((s) => s.kind === "action").map((s) => keyPaths(s.shape).join("|"))
);
const fixtureTalentShapes = fixture.shapes.filter((s) => s.kind === "talent");

const NAMED_FILES = [
  "heroic-paths/agent/spy/talents/subtle-takedown.json",
  "heroic-paths/hunter/assassin/talents/fatal-thrust.json",
];

test("embedded-actions-shapes.json fixture: has a header recording how it was made, and is non-trivial", () => {
  assert.ok(fixture._header, "fixture must carry a _header block");
  assert.strictEqual(fixture._header.sourceModule, "cosmere-rpg-mistborn-handbook");
  assert.ok(fixture._header.sourceModuleVersion, "must record the source module version");
  assert.ok(fixture._header.command, "must record the regeneration command");
  assert.ok(fixture._header.totalDocuments > 200, `expected > 200 source documents, got ${fixture._header.totalDocuments}`);
  assert.ok(Array.isArray(fixture.shapes) && fixture.shapes.length > 0);
});

test("embedded-actions-shapes.json fixture: no shape carries a dropped field or a non-identifier key (no licensed text leaks)", () => {
  const DROPPED = ["name", "description", "img", "_id", "_stats", "folder", "sort", "ownership", "flags"];
  const badKeys = [];
  (function walk(v, trail) {
    if (Array.isArray(v)) { v.forEach((x) => walk(x, trail)); return; }
    if (v !== null && typeof v === "object") {
      for (const k of Object.keys(v)) {
        if (DROPPED.includes(k)) badKeys.push(`${trail}.${k} (dropped field present)`);
        else if (k !== "*" && /[^A-Za-z0-9_]/.test(k)) badKeys.push(`${trail}.${k} (non-identifier key)`);
        walk(v[k], `${trail}.${k}`);
      }
    }
  })(fixture.shapes.map((s) => s.shape), "shapes");
  assert.deepStrictEqual(badKeys, []);
});

for (const file of NAMED_FILES) {
  test(`system-talent-shapes-3.1.0.json: ${file} is present with a talent shape and an embedded action shape`, () => {
    const entry = systemTalents[file];
    assert.ok(entry, `expected an entry for ${file}`);
    assert.strictEqual(entry.documentType, "talent");
    assert.ok(entry.talentShape && typeof entry.talentShape === "object");
    assert.ok(entry.embeddedActionShape && typeof entry.embeddedActionShape === "object");
  });

  test(`system-talent-shapes-3.1.0.json: ${file}'s embedded action matches a cataloged action shape (item 192's own claim)`, () => {
    const entry = systemTalents[file];
    const sig = keyPaths(entry.embeddedActionShape).join("|");
    assert.ok(
      fixtureActionKeySigs.has(sig),
      `${file}'s embedded action's key paths are not in the fixture's action-kind shapes — either a real gap ` +
        `(a shape the 200-document corpus never hits) or the fixture went stale; regenerate and compare by hand.`
    );
  });

  test(`system-talent-shapes-3.1.0.json: ${file}'s talent shape is a superset of at least one fixture talent shape's key paths`, () => {
    const entry = systemTalents[file];
    const sysKeys = keyPathSet(entry.talentShape);
    const covers = fixtureTalentShapes.some((t) => keyPaths(t.shape).every((k) => sysKeys.has(k)));
    assert.ok(
      covers,
      `${file}'s talent shape does not contain every key path of any single fixture talent shape — the 3.1.0 ` +
        `schema may have dropped a field the 3.0.0-era corpus relies on, which item 185 needs to know about.`
    );
  });
}

// item 192's own documented finding, pinned so a future fixture regeneration cannot silently
// "fix" it without someone noticing: today's corpus (system 3.0.0) has no talent shape that is
// byte-identical to a 3.1.0 talent's full shape, because 3.1.0 added derived fields the corpus
// never carries (hasPath/hasSpecialty/hasAncestry/prerequisitesMet/specialty, a top-level
// `prerequisites`) plus the packaging artifact `_key`. If this ever starts passing, the schema
// gap has closed and this test (and the header comment above) should be removed, not loosened.
test("system-talent-shapes-3.1.0.json: neither named talent's FULL shape is byte-identical to any fixture talent shape (documented 3.0.0-vs-3.1.0 schema gap)", () => {
  const fixtureTalentSigs = new Set(fixtureTalentShapes.map((t) => JSON.stringify(t.shape)));
  for (const file of NAMED_FILES) {
    const sig = JSON.stringify(systemTalents[file].talentShape);
    assert.ok(!fixtureTalentSigs.has(sig), `${file} was expected to differ from every 3.0.0-era fixture talent shape`);
  }
});
