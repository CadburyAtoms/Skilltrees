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

test("registry: every handler's executor is a function (or absent — a config-only rule) and every event has a hook string", () => {
  assert.ok(registry, "the registry did not load");
  // edha-illusion-upkeep ships no executor at all (a config-only rule the engine reads elsewhere);
  // that is pre-existing and out of item 24's scope — the pin is "a function or nothing", never a
  // non-function value.
  for (const d of registry.handlers) assert.ok(d.executor === undefined || typeof d.executor === "function", `${d.type}: executor is ${typeof d.executor}`);
  for (const d of registry.events) assert.strictEqual(typeof d.hook, "string", `${d.type} has no hook`);
  for (const d of [...registry.events, ...registry.handlers]) assert.strictEqual(d.source, "edha-content", `${d.type} source is ${d.source}`);
});
