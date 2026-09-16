/* tests/dead-field-by-type.test.js — TODO_REPO_HYGIENE item 182: pins lint-refs.js pass 11's new
 * per-type sharpening (scripts/lib/dead-field-check.js) against a fixture 3.x-shaped snapshot.
 *
 * THE FIXTURE. tests/fixtures/native-vocabulary-3.1.0.json is HAND-BUILT from
 * docs/analysis/cosmere-rpg-3.1.0-compatibility.md (blockers B1/B4/B5, breaks F1/F6, Appendix D),
 * not a real dump-native-vocabulary.js run — see its own _README for exactly which facts are
 * cited vs. approximated. It exists because the item's own brief says the tracked
 * data/native-vocabulary.json must STAY at 2.1.0 until Ben's install is actually upgraded (item
 * 187), so this is the only 3.1.0-shaped snapshot available to prove the new lint logic against.
 *
 * THE PROOF THIS FILE CARRIES (the item's "Done when" bar):
 *   1. A mutation — `talent.system.strike` — fails against the fixture (talent's real 3.1.0 shape
 *      never carries `strike`; only weapon does; the UNION alone contains it, which is exactly why
 *      break F8 existed before item 182).
 *   2. Today's reads still pass. Two separate, both-true claims:
 *      (a) THE REAL GATE IS UNCHANGED: checking the real tracked data/native-vocabulary.json
 *          (which has no systemSchemaFieldsByType key at all) never activates the per-type path —
 *          every call site falls back to the union, exactly as pass 11 behaved before item 182.
 *          Pinned below against the actual engine + build sources; also true of `node
 *          scripts/gates.js`, which is the operative check this item promises not to break.
 *      (b) THE ENGINE'S type-attributable call sites, run against the FIXTURE, are the real ones
 *          the compatibility doc already names (29-summons.js's weapon-typed summon attack,
 *          B4/B5) — this file pins those specific findings as a DEMONSTRATION that the check
 *          catches real code, not just the synthetic mutation. It is not a claim that the whole
 *          engine is 3.1.0-clean; items 183-187 exist because it is not.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { checkDeadFields, baseIdentifierBefore, looksLikeObjectLiteralOpen, enclosingDocumentType } = require("../scripts/lib/dead-field-check.js");
const { blankStringsAndComments } = require("../scripts/lib/blank-strings.js");
const { readEngineSource } = require("./harness.js");   // the ONE engine-source reader (pass 21) — never a hard-coded register-skills.js path

const REPO = path.join(__dirname, "..");
const fixture = JSON.parse(fs.readFileSync(path.join(REPO, "tests", "fixtures", "native-vocabulary-3.1.0.json"), "utf8"));
const realSnapshot = JSON.parse(fs.readFileSync(path.join(REPO, "data", "native-vocabulary.json"), "utf8"));

const fixtureKnown = new Set(fixture.systemSchemaTopLevelFields);
const fixtureByType = new Map(Object.entries(fixture.systemSchemaFieldsByType).map(([k, v]) => [k, new Set(v)]));
const realKnown = new Set(realSnapshot.systemSchemaTopLevelFields);

function scan(src, known, knownByType) {
  const blanked = blankStringsAndComments(src);
  const noComments = blankStringsAndComments(src, { keepStrings: true });
  return checkDeadFields({ src, blanked, noComments, known, knownByType });
}

test("fixture sanity: the union is the real 2.1.0 file's 87 fields + Appendix D's 16 additions, 0 removed", () => {
  const old = new Set(realSnapshot.systemSchemaTopLevelFields);
  const added = fixture.systemSchemaTopLevelFields.filter((f) => !old.has(f));
  const removed = [...old].filter((f) => !fixtureKnown.has(f));
  assert.strictEqual(fixture.systemSchemaTopLevelFields.length, 103, "expected 87 + 16 = 103");
  assert.strictEqual(added.length, 16, `expected 16 net-new fields, got ${added.length}: ${added.join(", ")}`);
  assert.strictEqual(removed.length, 0, `Appendix D says 0 removed, got: ${removed.join(", ")}`);
});

test("fixture sanity: every per-type field also appears in the union (no orphaned per-type field)", () => {
  for (const [type, fields] of Object.entries(fixture.systemSchemaFieldsByType)) {
    for (const f of fields) {
      assert.ok(fixtureKnown.has(f), `fixture per-type "${type}" names "${f}", which is not in its own union`);
    }
  }
});

test("THE MUTATION: talent.system.strike fails against the fixture (talent has no strike at 3.1.0)", () => {
  const hits = scan("const x = talent.system.strike;", fixtureKnown, fixtureByType);
  assert.strictEqual(hits.length, 1, JSON.stringify(hits));
  assert.strictEqual(hits[0].field, "strike");
  assert.strictEqual(hits[0].type, "talent");
  assert.strictEqual(hits[0].kind, "read");
});

test("control: weapon.system.strike passes (strike is real for a weapon at 3.1.0)", () => {
  assert.deepStrictEqual(scan("const x = weapon.system.strike;", fixtureKnown, fixtureByType), []);
});

test("control: action.system.activation passes (activation lives on action at 3.1.0)", () => {
  assert.deepStrictEqual(scan("const x = action.system.activation;", fixtureKnown, fixtureByType), []);
});

test("control: talent.system.description passes (description is common to every type)", () => {
  assert.deepStrictEqual(scan("const x = talent.system.description;", fixtureKnown, fixtureByType), []);
});

test("conservative fallback: a GENERIC identifier stays on the union even when it names a field only some types drop", () => {
  // "item" is not a type key in the fixture, so it is unattributable — per item 182's brief
  // ("a false failure is worse than a miss"), this must NOT be flagged even though a "talent"
  // holding the same field name so precisely would be.
  assert.deepStrictEqual(scan("const x = item.system.strike;", fixtureKnown, fixtureByType), []);
});

test("conservative fallback: a truly dead field with NO determinable type still fails the plain union check", () => {
  // Proves the per-type feature does not accidentally swallow pass 11's original job: a field in
  // NEITHER the union nor any per-type set, on a generic identifier, is still caught.
  const hits = scan("const x = item.system.totallyMadeUpField;", fixtureKnown, fixtureByType);
  assert.strictEqual(hits.length, 1);
  assert.strictEqual(hits[0].field, "totallyMadeUpField");
  assert.strictEqual(hits[0].type, null, "an unattributable call site must report type: null (union path), not a guess");
});

test("conservative fallback: an update-patch object literal with no sibling `type:` stays on the union", () => {
  // No document-creation context at all — Foundry's real type is not visible to a linter reading
  // an update() call, so this must be treated as unknowable, never guessed.
  const hits = scan('update(doc, { system: { totallyMadeUpField: 1 } });', fixtureKnown, fixtureByType);
  assert.strictEqual(hits.length, 1);
  assert.strictEqual(hits[0].type, null);
});

test("object-literal form: a real-shaped talentDoc literal (activation/damage/modality as shorthand + full syntax) is caught for type=talent", () => {
  const src = `
    const talentDoc = {
      name: t.name, type: "talent", _id: t.docId, img: pickTalentIcon({ name: t.name, specialty: t.specialty, fallback: talentImg(tree) }),
      system: {
        id: t.slug, type: "path",
        description: { value: descValue },
        activation,
        damage,
        path: tree.color || slugify(tree.group), ancestry: null,
        modality: STANCE_TALENTS.has(t.name) ? "stance" : null,
        events,
      },
    };
  `;
  const hits = scan(src, fixtureKnown, fixtureByType);
  const fields = hits.map((h) => h.field).sort();
  assert.deepStrictEqual(fields, ["activation", "damage", "modality"].sort(), JSON.stringify(hits));
  assert.ok(hits.every((h) => h.type === "talent"), JSON.stringify(hits));
});

test("REGRESSION SAFETY: checking the REAL tracked data/native-vocabulary.json (no systemSchemaFieldsByType) never activates the per-type path", () => {
  assert.strictEqual(realSnapshot.systemSchemaFieldsByType, undefined,
    "this test's premise is that the tracked file has no per-type key yet (item 182's brief: it stays at 2.1.0) — if this fails, item 187 has landed and this whole test should be revisited");
  // A field real at 2.1.0 for every type: no hit at all, exactly as pass 11 has always behaved.
  assert.deepStrictEqual(scan("const x = talent.system.description;", realKnown, undefined), []);
  // A field dead in EVERY snapshot, real or fixture: still caught, but ONLY via the union path
  // (type: null) — knownByType absent entirely (as lint-refs.js builds it from the real file
  // today) means there is no per-type path to take, matching pass 11's pre-item-182 behaviour.
  const hits = scan("const x = talent.system.totallyMadeUpField;", realKnown, undefined);
  assert.strictEqual(hits.length, 1);
  assert.strictEqual(hits[0].type, null, "no snapshot key means no type attribution is possible, ever");
});

test("DEMONSTRATION on real code: the engine's summon-attack weapon literal (29-summons.js's B4/B5 call site) is flagged against the fixture", () => {
  const engineSrc = readEngineSource();
  const hits = scan(engineSrc, fixtureKnown, fixtureByType);
  const weaponHits = hits.filter((h) => h.type === "weapon");
  const fields = new Set(weaponHits.map((h) => h.field));
  // The exact fields the real code writes onto a `type: "weapon"` system object that the
  // fixture's weapon set does not carry (activation/damage per B5; alwaysEquipped/attack/traits/
  // expertise are this repo's own additions on top) — see docs/analysis/cosmere-rpg-3.1.0-
  // compatibility.md blocker B4 (`29-summons.js:144-184`).
  for (const f of ["activation", "damage"]) {
    assert.ok(fields.has(f), `expected the summon-attack weapon literal to be flagged for "${f}"; got ${[...fields].join(", ")}`);
  }
});

test("REGRESSION SAFETY: the same engine source, checked against the REAL tracked snapshot's union, has zero per-type hits (there is no per-type path to activate)", () => {
  const engineSrc = readEngineSource();
  const hits = scan(engineSrc, realKnown, undefined);
  const typed = hits.filter((h) => h.type !== null);
  assert.deepStrictEqual(typed, [], "no hit should ever carry a type when knownByType is absent");
});

test("DEMONSTRATION on real code: foundry-build.js's real talentDoc construction (blocker B1/F6) is flagged against the fixture", () => {
  const buildSrc = fs.readFileSync(path.join(REPO, "scripts", "foundry-build.js"), "utf8");
  const hits = scan(buildSrc, fixtureKnown, fixtureByType);
  const talentHits = hits.filter((h) => h.type === "talent");
  const fields = new Set(talentHits.map((h) => h.field));
  for (const f of ["activation", "damage", "modality"]) {
    assert.ok(fields.has(f), `expected foundry-build.js's talentDoc to be flagged for "${f}"; got ${[...fields].join(", ")}`);
  }
});

// --- helper-level pins (the detection heuristics in isolation) ---------------------------------

test("baseIdentifierBefore: exact identifier, optional-chained, and \"unknowable\" cases", () => {
  const knownTypes = new Map([["talent", new Set()], ["weapon", new Set()]]);
  const blankedA = blankStringsAndComments("x = talent.system.foo");
  const idxA = blankedA.indexOf("system");
  assert.strictEqual(baseIdentifierBefore(blankedA, idxA), "talent");

  const blankedB = blankStringsAndComments("x = talent?.system.foo");
  const idxB = blankedB.indexOf("system");
  assert.strictEqual(baseIdentifierBefore(blankedB, idxB), "talent");

  const blankedC = blankStringsAndComments("x = getSystemThing().system.foo");
  const idxC = blankedC.lastIndexOf("system");
  // preceded by `).` — not a bare identifier, so unknowable.
  assert.strictEqual(baseIdentifierBefore(blankedC, idxC), null);
});

test("looksLikeObjectLiteralOpen: assignment/return/call/array positions are literals; a block statement is not", () => {
  const assign = blankStringsAndComments("const x = { a: 1 };");
  assert.strictEqual(looksLikeObjectLiteralOpen(assign, assign.indexOf("{")), true);

  const ret = blankStringsAndComments("function f() { return { a: 1 }; }");
  assert.strictEqual(looksLikeObjectLiteralOpen(ret, ret.indexOf("{", ret.indexOf("return"))), true);

  const arg = blankStringsAndComments("foo({ a: 1 });");
  assert.strictEqual(looksLikeObjectLiteralOpen(arg, arg.indexOf("{")), true);

  const block = blankStringsAndComments("if (x) { a.system.foo; }");
  assert.strictEqual(looksLikeObjectLiteralOpen(block, block.indexOf("{")), false);
});

test("enclosingDocumentType: finds a sibling type across a nested call-argument object without being fooled by it", () => {
  const src = `const doc = { name: x, type: "talent", img: pick({ a: 1, b: 2 }), system: { activation: 1 } };`;
  const blanked = blankStringsAndComments(src);
  const systemKeyIdx = blanked.indexOf("system");
  assert.strictEqual(enclosingDocumentType(src, blanked, systemKeyIdx), "talent");
});

test("enclosingDocumentType: returns null when the enclosing brace is a block statement, not an object literal", () => {
  const src = `if (x) { doTheThing(); system: { activation: 1 }; }`;
  const blanked = blankStringsAndComments(src);
  const systemKeyIdx = blanked.indexOf("system");
  assert.strictEqual(enclosingDocumentType(src, blanked, systemKeyIdx), null);
});
