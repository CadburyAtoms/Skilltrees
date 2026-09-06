/* THE READY-HOOK ACTOR REFRESH, PINNED — fix pass 6 (2026-09-06), bench run 36's 64 ↔ 57 max-HP flip.
 *
 * The engine's `ready` hook wires the Edha derivations onto `Actor#prepareDerivedData`, then
 * refreshes every already-loaded character so the new max shows immediately. That refresh used to
 * call `a.prepareData()` — and THAT was the defect, not any ActiveEffect and not any talent.
 *
 * The mechanism, from source rather than from the report:
 *   • `DataModel#reset()` is what re-initialises a document's fields from `_source`
 *     (foundry.mjs — `reset() { this._initialize(); }`, and `ClientDocument#_initialize` ends in
 *     `_safePrepareData()`). `prepareData()` does NOT reset anything; it re-runs the prepare
 *     pipeline over whatever the fields currently hold.
 *   • cosmere-rpg deliberately moves `applyActiveEffects()` OUT of `prepareEmbeddedDocuments` and
 *     INTO `prepareDerivedData` (its own comment: so AE changes can read derived values).
 *   • `ActiveEffect#_applyAdd` reads the CURRENT value and writes `current + delta`.
 * Compose those three and a second bare `prepareData()` applies every ADD-mode change a second time.
 * `Bench — White`'s `Hardy - Max HP` (ADD `@level`, 7 at level 7) therefore read
 * `hea.max.bonus` = 8 + 7 + 7 = **22** → max **64**, where one application gives 8 + 7 = 15 → **57**.
 * Nothing is persisted, so the next real update re-initialised the actor and it snapped back to 57 —
 * the "flip", and the reason there was no residue. It hit EVERY character carrying ANY ADD-mode
 * effect, on EVERY client, at world load; `Hardy` was only how the bench noticed.
 *
 * NOTE the direction: bench run 36 hypothesised "one application is DROPPED on the partial-prepare
 * path". It is the opposite — the partial path was right (57) and the full one double-counted (64).
 * The separating fact is arithmetic: 14 is 2 × `@level`, and `@level` has no value that is 14 here.
 *
 * Mutation-sensitive: put `a.prepareData()` back in the ready hook and case 1 reads 22 / 64.
 */
"use strict";
const assert = require("assert");
const { loadEngine, stageWorld, mockActor, readEngineSource, codeOnly } = require("./harness.js");

/* A character modelled on the three real semantics above: `_source` holds bonus 8, one ADD-mode
 * change adds 7, `prepareData()` applies it to the CURRENT value (so it stacks when called twice),
 * and `reset()` re-initialises from `_source` before preparing once — exactly Foundry's split. */
function hardyActor(id = "Bench — White") {
  const actor = mockActor({ id, name: id, type: "character" });
  actor._source = { system: { resources: { hea: { max: { bonus: 8 } } } } };
  actor.calls = [];
  actor.prepareData = () => {
    actor.calls.push("prepareData");
    // cosmere: applyActiveEffects() runs here, and ADD reads the current value.
    actor.system.resources.hea.max.bonus += 7;                        // the `Hardy - Max HP` change
    actor.system.resources.hea.max.value = 42 + actor.system.resources.hea.max.bonus;
  };
  actor.reset = () => {
    actor.calls.push("reset");
    actor.system = JSON.parse(JSON.stringify(actor._source.system));  // _initialize() from source
    actor.prepareData();                                              // …which ends in _safePrepareData()
  };
  actor.reset();                                                      // world load: one prepare, bonus 15
  actor.calls.length = 0;
  return actor;
}

/* The ready registration that does the refresh — selected by its own body rather than by firing all
 * seventeen `ready` hooks, which would drag unrelated subsystems into this test. */
function readyRefreshReg(env) {
  const reg = [...env.__hooks.once, ...env.__hooks.on]
    .filter((h) => h.name === "ready")
    .find((h) => /a\.type\s*===\s*"character"/.test(String(h.fn)));
  assert.ok(reg, "the ready-hook actor refresh registration must still be findable");
  return reg;
}

test("the ready-hook refresh re-initialises from source — an ADD-mode AE lands ONCE, not twice", async () => {
  const env = loadEngine();
  const white = hardyActor();
  const world = stageWorld(env, { actors: [white] });
  const priorConfigActor = env.CONFIG.Actor;
  try {
    env.CONFIG.Actor = { documentClass: class { prepareDerivedData() {} } };
    await readyRefreshReg(env).fn();

    assert.strictEqual(white.system.resources.hea.max.bonus, 15,
      "bonus must be source 8 + ONE `@level` (7) = 15 — 22 is bench run 36's double-applied 64");
    assert.strictEqual(white.system.resources.hea.max.value, 57,
      "…which is max HP 57, the value a real update re-derives; 64 was the inflated one");
    assert.deepStrictEqual(white.calls, ["reset", "prepareData"],
      "the refresh calls reset(), which prepares once — never a bare prepareData()");
  } finally { env.CONFIG.Actor = priorConfigActor; world.undo(); }
});

test("the refresh skips non-characters and survives an actor that throws", async () => {
  const env = loadEngine();
  const npc = mockActor({ id: "adv", type: "adversary" });
  npc.reset = () => { throw new Error("adversaries are not refreshed"); };
  const angry = mockActor({ id: "angry", type: "character" });
  angry.reset = () => { throw new Error("boom"); };
  const ok = hardyActor("Bench — Blue");
  const world = stageWorld(env, { actors: [npc, angry, ok] });
  const priorConfigActor = env.CONFIG.Actor;
  try {
    env.CONFIG.Actor = { documentClass: class { prepareDerivedData() {} } };
    await readyRefreshReg(env).fn();
    assert.strictEqual(ok.system.resources.hea.max.bonus, 15,
      "one actor throwing must not abort the sweep — the per-actor try/catch is load-bearing");
  } finally { env.CONFIG.Actor = priorConfigActor; world.undo(); }
});

test("no engine site calls a bare Actor#prepareData() — the double-apply cannot regrow", () => {
  const hits = codeOnly(readEngineSource()).match(/\.prepareData\s*\(/g) ?? [];
  assert.deepStrictEqual(hits, [],
    "a bare prepareData() re-applies every ADD-mode ActiveEffect on top of the derived value; " +
    "use reset(), which re-initialises from _source and prepares exactly once");
});
