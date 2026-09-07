/* Pinned cases for the item-64 build guard (2026-09-06): the pack writers refuse any document whose
 * `system.events` carries an `edha-*` handler type the engine does not register.
 *
 * WHY THIS EXISTS. Item 48 (R-78) retired the `edha-aoe-template` handler, but
 * `scripts/foundry-build.js` kept a generator for it (`TALENT_TARGETING[...].area` without
 * `.burst`), masked only because the one qualifying talent (Lay Foundation) has an authored overlay
 * that replaces the generated events. lint-refs pass 9 holds AUTHORED rules to the engine's
 * `registerItemEventHandlerType` calls, but a generated rule never appears in `data/`, so nothing
 * could see it. `scripts/lib/handler-type-guard.js` is the pure decide function both writers call;
 * this pins (1) the function on fixtures, (2) it against the REAL engine registrations, so the
 * retired type is rejected and a live one accepted, and (3) that the build's generator is gone.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const { checkHandlerTypes, ruleTypesOf, formatFindings } = require(path.join(REPO, "scripts", "lib", "handler-type-guard.js"));
const { parseHandlerSchemas } = require(path.join(REPO, "scripts", "handler-schemas.js"));
const { readEngineSource, codeOnly } = require("./harness.js");
const ENGINE = readEngineSource();

const doc = (name, events) => ({ name, system: { events } });

/* --- 1. the pure function, over fixtures ------------------------------------------------------ */

test("checkHandlerTypes: an unregistered edha-* type is named with its talent and rule id; registered and native types pass", () => {
  const registered = new Set(["edha-burst", "edha-zone"]);
  const docs = [
    doc("Good Burst", { r1: { id: "r1", event: "edha-pre-use", handler: { type: "edha-burst" } } }),
    doc("Retired AoE", { r2: { id: "r2", event: "use", handler: { type: "edha-aoe-template" } } }),
    doc("Native Only", { r3: { id: "r3", event: "use", handler: { type: "grant-power" } } }),   // native type = pass 2's business
    doc("No Events", {}),
    { name: "No System" },
  ];
  const { scanned, findings } = checkHandlerTypes(docs, registered);
  assert.strictEqual(scanned, 3, `expected 3 rules scanned, got ${scanned}`);
  assert.strictEqual(findings.length, 1, `expected exactly 1 finding, got ${JSON.stringify(findings)}`);
  assert.deepStrictEqual(findings[0], { name: "Retired AoE", ruleId: "r2", type: "edha-aoe-template" });
  const msg = formatFindings("packs/fixture", findings)[0];
  assert.ok(msg.includes('"Retired AoE"') && msg.includes("edha-aoe-template") && msg.includes("r2"), msg);
});

test("checkHandlerTypes: reads the adversary ARRAY shape and accepts a Map (parseHandlerSchemas output) as the registered set", () => {
  const registered = new Map([["edha-triggered-effect", new Set()]]);
  const docs = [
    doc("Array Shape", [{ event: "use", handler: { type: "edha-triggered-effect" } }, { event: "use", handler: { type: "edha-nope" } }]),
  ];
  assert.deepStrictEqual(ruleTypesOf(docs[0]).map(r => r.type), ["edha-triggered-effect", "edha-nope"]);
  const { scanned, findings } = checkHandlerTypes(docs, registered);
  assert.strictEqual(scanned, 2);
  assert.deepStrictEqual(findings, [{ name: "Array Shape", ruleId: "1", type: "edha-nope" }]);
});

/* --- 2. against the real engine registrations ------------------------------------------------- */

test("real engine: edha-aoe-template (retired, R-78) is rejected; edha-burst (live) is accepted", () => {
  const registered = parseHandlerSchemas(ENGINE);
  assert.ok(registered.has("edha-burst"), "edha-burst must be registered — the parse rotted?");
  assert.ok(!registered.has("edha-aoe-template"), "edha-aoe-template is registered again — R-78 reverted?");
  const { findings } = checkHandlerTypes([
    doc("Lay Foundation (mutation)", { a: { id: "a", event: "use", handler: { type: "edha-aoe-template" } } }),
    doc("Flame Surge", { b: { id: "b", event: "edha-pre-use", handler: { type: "edha-burst" } } }),
  ], registered);
  assert.deepStrictEqual(findings.map(f => [f.name, f.type]), [["Lay Foundation (mutation)", "edha-aoe-template"]]);
});

/* --- 3. the generator is gone and the writers are guarded --------------------------------------- */

test("foundry-build.js no longer mints edha-aoe-template, and both pack writers call the guard", () => {
  const build = fs.readFileSync(path.join(REPO, "scripts", "foundry-build.js"), "utf8");
  const code = codeOnly(build);
  assert.ok(!/aoeRule/.test(code), "aoeRule is back in foundry-build.js code");
  assert.ok(!/"edha-aoe-template"/.test(code), 'a literal "edha-aoe-template" is back in foundry-build.js code');
  const calls = (code.match(/assertRegisteredHandlerTypes\(/g) || []).length;
  assert.strictEqual(calls, 3, `expected the definition + 2 writer calls of assertRegisteredHandlerTypes, got ${calls}`);
});
