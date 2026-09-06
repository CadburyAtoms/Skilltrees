/* tests/culture-registration.test.js — the ten Edha nations must be registered at `init`
 * (fix pass 5, 2026-09-06; bench runs 32 + 33).
 *
 * The defect: `scripts/foundry-build.js` stamps `system.id = slugify(name)` on every culture doc,
 * but the cosmere-rpg culture DataModel declares that field with a CLOSED choice list —
 * `IdItemMixin({ initial: "none", choices: () => ["none", ...Object.keys(CONFIG.COSMERE.cultures)] })`
 * — and its schema factory CALLS that function once, at `defineSchema()` time, freezing the array.
 * So all ten Edha slugs were rejected on every pack load and replaced with `"none"` (run 33 measured
 * `_source.system.id === "none"` on all ten), and run 33 also measured that a RUNTIME
 * `registerCulture()` does not help, because the choices array was already frozen.
 *
 * What is pinned here:
 *   1. the set the engine registers matches `data/cultures.json` exactly — the list exists twice by
 *      necessity (init is far too early to read a compendium, and cultures.json is a generator input
 *      the module never ships), so drift is the standing risk. lint-refs pass 22 gates it too.
 *   2. the registration really is on the `init` hook — the one thing that makes it work at all;
 *   3. it goes through the system's documented `registerCulture` api when present, and falls back
 *      to the direct CONFIG write when it is not;
 *   4. it is idempotent and never overwrites the system's own six Roshar cultures;
 *   5. the BUILD still writes `system.id` on culture docs — if that ever changes, this whole fix
 *      becomes unnecessary and the test says so instead of rotting quietly.
 *
 * Asserted against OBSERVABLE state (`CONFIG.COSMERE.cultures` after the hook fires) rather than the
 * `EDHA_CULTURES` const: `const` at the top level of a vm script stays lexical and never becomes a
 * property of the context, so the const is not reachable from here — and the registered config is
 * the thing that actually matters anyway.
 *
 * NOT provable here: that our `init` callback runs before the culture DataModel's schema is built.
 * That is a Foundry load-order fact, and it is a 🤖 row for the next bench run.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, readSourceLF, codeOnly, eq } = require("./harness.js");
const { slugify } = require("../scripts/edha-pack-io.js");

const CULTURES = JSON.parse(readSourceLF("data/cultures.json"));
const EXPECTED = (CULTURES.cultures || []).map((c) => ({ id: slugify(c.name), label: c.name }));

// The six the system registers for itself — the engine must never touch these.
const ROSHAR = ["alethi", "azish", "herdazian", "thaylen", "unkalaki", "veden"];

/* A fresh engine per case: `fireHook` CONSUMES `once` registrations, and `init` is a `once` hook. */
function freshEnv({ api = true } = {}) {
  const env = loadEngine();
  const calls = [];
  env.CONFIG.COSMERE = env.CONFIG.COSMERE || {};
  env.CONFIG.COSMERE.cultures = {};
  for (const id of ROSHAR) env.CONFIG.COSMERE.cultures[id] = { label: `SYSTEM ${id}` };
  env.game.system = api
    ? { api: { registerCulture(data) { calls.push(data); env.CONFIG.COSMERE.cultures[data.id] = { label: data.label }; return true; } } }
    : {};
  return { env, calls };
}

const edhaEntries = (env) => Object.entries(env.CONFIG.COSMERE.cultures)
  .filter(([id]) => !ROSHAR.includes(id))
  .map(([id, def]) => ({ id, label: def.label }));

test("the ten Edha nations register on `init`, and the set matches data/cultures.json", async () => {
  const { env } = freshEnv({ api: true });
  assert.strictEqual(EXPECTED.length, 10, "data/cultures.json should carry the ten Edha nations");
  assert.ok([...env.__hooks.on, ...env.__hooks.once].some((h) => h.name === "init"),
    "the engine must register something on init");
  eq(edhaEntries(env), []);   // nothing registered before the hook fires

  await fireHook(env, "init");

  eq(edhaEntries(env), EXPECTED);   // every slug foundry-build.js writes is now a legal choice
});

test("registration goes through the system's documented registerCulture api", async () => {
  const { env, calls } = freshEnv({ api: true });
  await fireHook(env, "init");
  eq(calls.map((c) => ({ id: c.id, label: c.label })), EXPECTED);
  assert.ok(calls.every((c) => c.source === "edha-content"),
    "each registration declares its source, the way the system tags its own six");
});

test("no api on game.system: the direct CONFIG write still registers all ten", async () => {
  const { env, calls } = freshEnv({ api: false });
  await fireHook(env, "init");
  assert.strictEqual(calls.length, 0, "no api was available to call");
  eq(edhaEntries(env), EXPECTED);
});

test("idempotent across init + setup, and the system's own six are never overwritten", async () => {
  const { env, calls } = freshEnv({ api: true });
  await fireHook(env, "init");
  const afterInit = calls.length;
  await fireHook(env, "setup");
  assert.strictEqual(calls.length, afterInit,
    "setup is belt-and-braces: it must add nothing a second time (registerCulture is not called again)");
  for (const id of ROSHAR) eq(env.CONFIG.COSMERE.cultures[id], { label: `SYSTEM ${id}` });
  assert.strictEqual(Object.keys(env.CONFIG.COSMERE.cultures).length, ROSHAR.length + EXPECTED.length,
    "exactly six system cultures plus ten Edha ones");
});

test("a thin CONFIG (no COSMERE.cultures yet) is a no-op, never a throw", () => {
  const env = loadEngine();
  env.CONFIG.COSMERE = {};
  assert.strictEqual(env.edhaRegisterCultures("test"), false);
});

test("the build still writes system.id on culture docs — the coupling this fix exists for", () => {
  const build = codeOnly(readSourceLF("scripts/foundry-build.js"));
  const i = build.indexOf('type: "culture"');
  assert.ok(i >= 0, "foundry-build.js should still emit culture docs");
  const near = build.slice(i, i + 900);
  assert.ok(/system:\s*\{\s*id:\s*slug/.test(near),
    "foundry-build.js still stamps `system: { id: slug }` on culture docs, so the slugs MUST be " +
    "registered at init. If the build stops writing it, this whole registration becomes optional — " +
    "say so in a delta rather than deleting this test.");
});
