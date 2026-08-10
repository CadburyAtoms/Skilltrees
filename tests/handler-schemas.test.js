/* Pinned cases for lint-refs PASS 9 — handler FIELD names vs the registered schema (2026-07-26).
 *
 * WHY THIS EXISTS. Foundry's DataModel silently drops any handler key the registered config schema
 * doesn't define: the rule loads, the Events tab renders, and the mechanic never fires. Pass 2
 * checks handler TYPES; nothing checked the fields inside until the pre-deploy audit of the
 * finished 2b migration. The audit's first "hit" was itself instructive: a correct rule read as
 * broken because native-vocabulary.json's lang-derived keys are PascalCase LABELS, not schema
 * fields — so this test pins both directions: real typos are reported, and the label-cased trap
 * (`Target` on update-actor) is reported too, while valid camelCase rules pass untouched.
 *
 * Same fixture discipline as macro-gate.test.js: the fixture writes its OWN authored file and
 * deletes it in a finally block. If a hard kill leaves it behind, the ordinary gates fail loudly.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const { parseHandlerSchemas, topLevelKeys, matchBrace } = require(path.join(REPO, "scripts", "handler-schemas.js"));
const { readEngineSource } = require("./harness.js");
const ENGINE = readEngineSource();

/* --- the scanner primitives ------------------------------------------------------------------ */

test("topLevelKeys reads keys at depth 0 only, through prose hints with braces/parens/comments", () => {
  const body = `
    kind: new FF.StringField({ label: "What (to) do", hint: "Shown as 'Edha: <this>' — a {brace} and (parens) in prose" }),
    // a line comment with fake: keys
    /* block comment, more: fakes */
    n: new FF.NumberField({ initial: 1, nested: { deep: 1 } }),
    type: new FF.StringField({ hint: 'a field literally named type' }),
  `;
  assert.deepStrictEqual(topLevelKeys(body), ["kind", "n", "type"]);
});

test("matchBrace pairs braces through strings and comments, throws on imbalance", () => {
  const src = `{ a: "closing } in string", b: { c: 1 }, /* } */ d: 2 }`;
  assert.strictEqual(matchBrace(src, 0), src.length - 1);
  assert.throws(() => matchBrace("{ never closed", 0), /unbalanced/);
});

/* --- the parser against the REAL engine ------------------------------------------------------ */

let schemas = null;
test("parseHandlerSchemas: every engine registration parses, all types are edha-*", () => {
  schemas = parseHandlerSchemas(ENGINE);
  assert.ok(schemas.size >= 80, `expected >= 80 handler types, got ${schemas.size}`);
  for (const t of schemas.keys()) assert.ok(t.startsWith("edha-"), `non-edha type parsed: ${t}`);
});

test("parseHandlerSchemas: spot-pinned schemas (small exact, large superset)", () => {
  assert.ok(schemas, "parse did not complete");
  // Small and stable — exact.
  assert.deepStrictEqual([...schemas.get("edha-hp-floor")].sort(), ["floorFormula", "spentFlag"]);
  // Larger — pin known fields as a subset so legitimately ADDING a field never fails this test.
  for (const f of ["kind", "n", "target", "label", "whenDeflectBelow"]) {
    assert.ok(schemas.get("edha-cae-grant").has(f), `edha-cae-grant lost field ${f}`);
  }
  assert.ok(schemas.get("edha-watch").size >= 20, "edha-watch schema under-parsed");
});

test("parseHandlerSchemas rots LOUDLY: duplicate type / missing type / zero sites all throw", () => {
  const reg = (t, extra = "") => `api.registerItemEventHandlerType({ source: "x", type: "${t}", ${extra} });\n`;
  assert.throws(() => parseHandlerSchemas(reg("edha-a") + reg("edha-a")), /registered twice/);
  assert.throws(() => parseHandlerSchemas(`api.registerItemEventHandlerType({ source: "x" });`), /no type/);
  assert.throws(() => parseHandlerSchemas("nothing here"), /no registerItemEventHandlerType/);
});

/* --- pass 9 end-to-end, mutation-checked both ways ------------------------------------------- */

const FIXTURE = path.join(REPO, "data/authored/_handler-fields-fixture.json");

function fixtureErrors(talents) {
  fs.writeFileSync(FIXTURE, JSON.stringify({ _meta: { group: "Lint fixture (tests/handler-schemas.test.js)" }, talents }, null, 2) + "\n");
  try {
    const r = cp.spawnSync("node", ["scripts/lint-refs.js"], { cwd: REPO, encoding: "utf8" });
    return ((r.stdout || "") + (r.stderr || "")).split("\n").filter((l) => l.includes("_handler-fields-fixture"));
  } finally {
    try { fs.unlinkSync(FIXTURE); } catch (e) {}
  }
}

let errs = null;
test("pass 9 reports the typo'd field, the label-cased native field, the unregistered type, and the bad rule key — and NOT the valid rules", () => {
  errs = fixtureErrors({
    // Both VALID: a real edha rule and a real camelCase native rule — must produce no errors.
    "Fixture Valid": { events: { HdlrFieldProbe00: {
      id: "HdlrFieldProbe00", description: "fixture", event: "edha-draw-mana", order: 0,
      handler: { type: "edha-pulse", rangeColor: "black", kind: "status", statusId: "weakened" },
    } } },
    "Fixture Valid Native": { events: { HdlrFieldProbe05: {
      id: "HdlrFieldProbe05", description: "fixture", event: "long-rest-actor",
      handler: { type: "update-actor", target: "parent", changes: [] },
    } } },
    // A typo'd edha field: silently dropped by the DataModel, must be reported here.
    "Fixture Typo": { events: { HdlrFieldProbe01: {
      id: "HdlrFieldProbe01", description: "fixture", event: "edha-draw-mana",
      handler: { type: "edha-pulse", rangeColour: "black" },
    } } },
    // The label-cased trap that started all this: PascalCase i18n keys on a native handler.
    "Fixture Label Case": { events: { HdlrFieldProbe02: {
      id: "HdlrFieldProbe02", description: "fixture", event: "long-rest-actor",
      handler: { type: "update-actor", Target: "parent" },
    } } },
    // "edha-content" is all over the engine as a quoted literal, so pass 2 is satisfied — but it
    // is not a REGISTERED handler type. Pass 9 must catch what pass 2 cannot.
    "Fixture Unregistered": { events: { HdlrFieldProbe03: {
      id: "HdlrFieldProbe03", description: "fixture", event: "edha-draw-mana",
      handler: { type: "edha-content" },
    } } },
    // A rule-level typo: the key is dropped by the system's rule schema the same silent way.
    "Fixture Rule Key": { events: { HdlrFieldProbe04: {
      id: "HdlrFieldProbe04", description: "fixture", event: "edha-draw-mana", ordre: 1,
      handler: { type: "edha-pulse", rangeColor: "black", kind: "status", statusId: "weakened" },
    } } },
  });
  for (const name of ["Fixture Valid", "Fixture Valid Native"]) {
    assert.ok(!errs.some((l) => l.includes(name)), `valid rule falsely reported:\n  ${errs.filter((l) => l.includes(name)).join("\n  ")}`);
  }
});

for (const [label, name, expect] of [
  ["a typo'd edha handler field", "Fixture Typo", 'no field "rangeColour"'],
  ["a label-cased native field", "Fixture Label Case", 'no field "Target"'],
  ["an unregistered edha handler type", "Fixture Unregistered", "never REGISTERED"],
  ["a rule-level key outside the rule schema", "Fixture Rule Key", 'rule key "ordre"'],
]) {
  test(`pass 9 rejects: ${label}`, () => {
    assert.ok(errs, "the batch run did not complete");
    const line = errs.find((l) => l.includes(name));
    assert.ok(line, `no error mentioned ${name}; got:\n  ${errs.join("\n  ")}`);
    assert.ok(line.includes(expect), `expected "${expect}" in:\n  ${line}`);
  });
}
