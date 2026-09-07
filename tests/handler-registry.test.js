/* The native event/handler REGISTRY snapshot (2026-09-06, item 24 — the table-driven registry).
 *
 * WHY THIS EXISTS. Item 24 hoists the ~2,500 lines of sequential `api.registerItemEventType` /
 * `api.registerItemEventHandlerType` calls in `edhaRegisterNativeEventSystem` into two tables
 * (`EDHA_EVENT_TYPES` / `EDHA_HANDLER_TYPES`) registered by ONE loop. "Behaviour must be
 * identical" means: the same types, in the same order, with the same labels, descriptions, hooks
 * and schema fields (in the same declaration order — the Events tab renders them in that order).
 * This file pins that shape against `tests/fixtures/handler-registry.snapshot.json`, generated
 * from the engine BEFORE the refactor through the same harness path, so the refactor's diff shows
 * the snapshot untouched. The executors themselves are proven by the rest of the suite.
 *
 * A mismatch names the TYPE it found first (a dropped or reordered row, a renamed field), then
 * falls through to the byte-for-byte comparison. Regenerate deliberately, never to make it green:
 *   node -e "const h=require('./tests/harness.js');require('fs').writeFileSync('tests/fixtures/handler-registry.snapshot.json',JSON.stringify(h.registryShape(h.loadHandlerRegistry()),null,2)+'\n')"
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { loadHandlerRegistry, registryShape } = require("./harness.js");

const SNAPSHOT = path.join(__dirname, "fixtures", "handler-registry.snapshot.json");

let registry = null, shape = null, expected = null;
test("registry: the engine registers its native event + handler types through the recording API", () => {
  registry = loadHandlerRegistry();
  shape = registryShape(registry);
  expected = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  assert.ok(shape.events.length >= 15, `expected >= 15 event types, got ${shape.events.length}`);
  assert.ok(shape.handlers.length >= 87, `expected >= 87 handler types, got ${shape.handlers.length}`);
});

for (const kind of ["events", "handlers"]) {
  test(`registry snapshot: ${kind} — same types in the same order`, () => {
    assert.ok(shape && expected, "the registry did not load");
    const got = shape[kind].map((d) => d.type), want = expected[kind].map((d) => d.type);
    const missing = want.filter((t) => !got.includes(t)), extra = got.filter((t) => !want.includes(t));
    assert.ok(!missing.length, `${kind}: registered no more — ${missing.join(", ")} (a dropped table row?)`);
    assert.ok(!extra.length, `${kind}: NEW type(s) not in the snapshot — ${extra.join(", ")} (regenerate deliberately; see the header)`);
    for (let i = 0; i < want.length; i++) {
      assert.strictEqual(got[i], want[i], `${kind}: registration order changed at index ${i} — snapshot has "${want[i]}", engine registered "${got[i]}"`);
    }
  });

  test(`registry snapshot: ${kind} — every type's label, description${kind === "events" ? ", hook" : " and ORDERED field names"} match`, () => {
    assert.ok(shape && expected, "the registry did not load");
    const byType = new Map(expected[kind].map((d) => [d.type, d]));
    for (const d of shape[kind]) {
      assert.deepStrictEqual(d, byType.get(d.type), `${kind}: "${d.type}" differs from the snapshot`);
    }
  });
}

test("registry snapshot: byte-for-byte equal to the fixture", () => {
  assert.ok(shape, "the registry did not load");
  assert.strictEqual(JSON.stringify(shape, null, 2) + "\n", fs.readFileSync(SNAPSHOT, "utf8"));
});

// Config-only rows that ship no executor. EMPTY since item 75 (2026-09-06): edha-illusion-upkeep
// left on item 71, and the eight riders it exposed (edha-zone-hazard, edha-zone-guard,
// edha-snare-react, edha-damage-bonus, edha-counter-transfer, edha-die-step-react,
// edha-unseen-ward, edha-suppress-veil, edha-heal-react) each carry the same explicit no-op now,
// so a rule the system DOES dispatch executes to nothing instead of throwing in Handler.execute.
// The set stays here so the failure message can name it: nothing may join — a config-only row
// gets the no-op executor (read by an engine sweep, doing nothing itself), never an absent one.
const EXECUTOR_LESS_CONFIG_ONLY = new Set([]);

test("registry: every handler has a function executor (no executor-less rows since item 75) and every event has a hook string", () => {
  assert.ok(registry, "the registry did not load");
  for (const d of registry.handlers) {
    if (EXECUTOR_LESS_CONFIG_ONLY.has(d.type)) { assert.strictEqual(d.executor, undefined, `${d.type}: now has an executor — drop it from EXECUTOR_LESS_CONFIG_ONLY`); continue; }
    assert.strictEqual(typeof d.executor, "function", `${d.type}: executor is ${typeof d.executor} (a row the system can throw on — give it a no-op, or name it in EXECUTOR_LESS_CONFIG_ONLY with the reason)`);
  }
  for (const d of registry.events) assert.strictEqual(typeof d.hook, "string", `${d.type} has no hook`);
  for (const d of [...registry.events, ...registry.handlers]) assert.strictEqual(d.source, "edha-content", `${d.type} source is ${d.source}`);
});

/* --- the registry is TABLE-DRIVEN: one loop, two exposed arrays (item 24) ---------------------- */

const vm = require("vm");
const { readEngineSource, codeOnly } = require("./harness.js");

test("exactly ONE registration loop: no direct registerItemEventType / registerItemEventHandlerType call outside it", () => {
  const code = codeOnly(readEngineSource());
  const handlerCalls = code.match(/registerItemEventHandlerType\(/g) || [];
  const eventCalls = code.match(/registerItemEventType\(/g) || [];
  assert.strictEqual(handlerCalls.length, 1, `expected the loop to be the only registerItemEventHandlerType( site, found ${handlerCalls.length}`);
  assert.strictEqual(eventCalls.length, 1, `expected the loop to be the only registerItemEventType( site, found ${eventCalls.length}`);
  assert.ok(code.includes("for (const def of EDHA_EVENT_TYPES) api.registerItemEventType(def);"), "the event loop reads EDHA_EVENT_TYPES");
  assert.ok(code.includes("for (const def of EDHA_HANDLER_TYPES) api.registerItemEventHandlerType(def);"), "the handler loop reads EDHA_HANDLER_TYPES");
});

test("the tables ARE what gets registered: EDHA_EVENT_TYPES / EDHA_HANDLER_TYPES elements are the recorded defs, same order", () => {
  assert.ok(registry, "the registry did not load");
  const events = vm.runInContext("EDHA_EVENT_TYPES", registry.env);
  const handlers = vm.runInContext("EDHA_HANDLER_TYPES", registry.env);
  assert.ok(Array.isArray(events) && Array.isArray(handlers), "the tables are arrays");
  assert.strictEqual(events.length, registry.events.length);
  assert.strictEqual(handlers.length, registry.handlers.length);
  events.forEach((d, i) => assert.strictEqual(d, registry.events[i], `event row ${i} (${d.type}) is not the registered object`));
  handlers.forEach((d, i) => assert.strictEqual(d, registry.handlers[i], `handler row ${i} (${d.type}) is not the registered object`));
});

test("both tables are exposed on the edha API (game.modules.get('edha-content').api / globalThis.edha)", () => {
  const code = codeOnly(readEngineSource());
  const apiLine = code.split("\n").find((l) => l.includes("const api = {") && l.includes("createLootCache: edhaCreateLootCache"));
  assert.ok(apiLine, "the ready-hook api object literal is where it was");
  assert.ok(/\bEDHA_EVENT_TYPES\b/.test(apiLine) && /\bEDHA_HANDLER_TYPES\b/.test(apiLine), "the api object carries EDHA_EVENT_TYPES and EDHA_HANDLER_TYPES");
});
