/* tests/harness-source.test.js — pins for tests/harness.js's own primitives (2026-08-10, hygiene
 * campaign wave 4A).
 *
 * These exist because the loader/stripper/scaffolding this harness now centralizes used to be
 * five near-duplicate implementations scattered across the suite (see harness.js's header) — a
 * regression in the shared copy would now silently wrong-foot every test that reads engine
 * source or builds a mock actor, so the primitives themselves get pinned here once, exactly.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const {
  loadEngine, ENGINE_PATH, readEngineSource, codeOnly, mockActor, RollStub, stageWorld,
} = require("./harness.js");

/* ---- 1. readEngineSource: CRLF normalization ---------------------------------------------- */

test("readEngineSource: no \\r anywhere in the result", () => {
  const src = readEngineSource();
  assert.ok(!/\r/.test(src), "readEngineSource must fully normalize CRLF to LF");
});

test("readEngineSource: equals the raw file bytes with \\r\\n -> \\n applied", () => {
  const raw = fs.readFileSync(ENGINE_PATH, "utf8");
  assert.strictEqual(readEngineSource(), raw.replace(/\r\n/g, "\n"),
    "readEngineSource must not do anything beyond CRLF normalization (no trimming, no re-encoding)");
});

/* ---- 2. codeOnly/stripComments: fixture pin ------------------------------------------------ */
/*
 * Exercises, in one fixture: a multi-line block comment, a `//` line comment, a double-quoted
 * string CONTAINING "//" (the quote-parity guard must leave it alone), and a template literal
 * (which this heuristic does NOT understand — it tracks only double-quote parity, so a `//`
 * inside a backtick string is misread as a real comment start; that is a known, DOCUMENTED
 * limitation of this exact stripper — scripts/lib/strip-comments.js's header — not a bug this
 * test should "fix" by picking a different fixture). Exact output pinned so this and lint-refs
 * pass 7/20, which share this one implementation, cannot silently drift apart.
 */
const FIXTURE = [
  'const a = 1; /* multi',
  'line block',
  'comment */ const b = 2;',
  '// a line comment',
  'const url = "http://example.com"; // trailing comment after a // in a string',
  'const s = `hello ${name} // not a comment inside template`;',
].join("\n");

const EXPECTED = [
  'const a = 1; ',
  '',
  ' const b = 2;',
  '',
  'const url = "http://example.com"; // trailing comment after a // in a string',
  'const s = `hello ${name} ',
].join("\n");

test("codeOnly (strip-comments.js): exact fixture output", () => {
  assert.strictEqual(codeOnly(FIXTURE), EXPECTED);
});

test("codeOnly: line count is preserved (multi-line block comments blank to empty lines, not removed)", () => {
  assert.strictEqual(codeOnly(FIXTURE).split("\n").length, FIXTURE.split("\n").length);
});

test("codeOnly: the double-quoted string survives whole — quote-parity guards its embedded \"//\"", () => {
  assert.ok(codeOnly(FIXTURE).includes('"http://example.com"'),
    "a // inside a double-quoted string must not be read as a comment start");
});

/* ---- 3a. RollStub: default-vs-options sanity ------------------------------------------------ */

test("RollStub(): default behavior is unchanged — arithmetic via safeEval", () => {
  const Cls = RollStub();
  const r = new Cls("2 + 3 * (1 + 1)");
  r.evaluateSync();
  assert.strictEqual(r.total, 8);
  assert.strictEqual(Cls.safeEval("1 + 1"), 2);
  assert.strictEqual(Cls.replaceFormulaData("@a + 1", { a: 4 }), "4 + 1");
});

test("RollStub(): the default refuses a real dice formula (arithmetic-only), same as before", () => {
  const Cls = RollStub();
  const r = new Cls("2d8");
  assert.throws(() => r.evaluateSync(), /safeEval refused/);
});

test("RollStub({ total }): a fixed total bypasses safeEval entirely", () => {
  const Cls = RollStub({ total: 42 });
  const r = new Cls("2d8 + @unresolved.ref");   // would throw under the default
  r.evaluateSync();
  assert.strictEqual(r.total, 42);
});

test("RollStub({ total: fn }): a function total is evaluated per-instance", async () => {
  const Cls = RollStub({ total: (roll) => (roll.data.x ?? 0) * 2 });
  const r = new Cls("ignored", { x: 5 });
  await r.evaluate();
  assert.strictEqual(r.total, 10);
});

test("RollStub({ capture }): every constructed formula is recorded, in order", () => {
  const seen = [];
  const Cls = RollStub({ capture: seen });
  new Cls("1d6");
  new Cls("2d8 + 1");
  assert.deepStrictEqual(seen, ["1d6", "2d8 + 1"]);
});

/* ---- 3b. mockActor: dotted getFlag/setFlag/unsetFlag round-trip ----------------------------- */

test("mockActor: defaults — id from name, uuid from id, type character, empty Set/arrays", () => {
  const a = mockActor({ name: "Bench Dummy" });
  assert.strictEqual(a.name, "Bench Dummy");
  assert.strictEqual(a.id, "Bench Dummy");
  assert.strictEqual(a.uuid, "Actor.Bench Dummy");
  assert.strictEqual(a.type, "character");
  assert.ok(a.statuses instanceof Set && a.statuses.size === 0);
  assert.deepStrictEqual(a.items, []);
  assert.deepStrictEqual(a.effects, []);
});

test("mockActor: opts.flags seeds the edha-content scope, read back through dotted getFlag", () => {
  const a = mockActor({ name: "Corvaine", flags: { lists: { covenants: [{ id: "c1" }] } } });
  assert.deepStrictEqual(a.getFlag("edha-content", "lists.covenants"), [{ id: "c1" }]);
  assert.strictEqual(a.getFlag("edha-content", "nope"), undefined);
  assert.strictEqual(a.getFlag("some-other-scope", "lists.covenants"), undefined);
});

test("mockActor: setFlag writes a DOTTED path, creating intermediate objects", async () => {
  const a = mockActor({ name: "Trooper" });
  await a.setFlag("edha-content", "trigRound.Foresight", 2);
  assert.strictEqual(a.getFlag("edha-content", "trigRound.Foresight"), 2);
  assert.deepStrictEqual(a.flags["edha-content"].trigRound, { Foresight: 2 });
});

test("mockActor: unsetFlag deletes a dotted leaf without disturbing siblings", async () => {
  const a = mockActor({ name: "Trooper", flags: { trigRound: { Foresight: 2, Other: 1 } } });
  await a.unsetFlag("edha-content", "trigRound.Foresight");
  assert.strictEqual(a.getFlag("edha-content", "trigRound.Foresight"), undefined);
  assert.strictEqual(a.getFlag("edha-content", "trigRound.Other"), 1);
});

test("mockActor: an explicit statuses array is accepted and converted to a Set", () => {
  const a = mockActor({ name: "Marked", statuses: ["omen", "isolated"] });
  assert.ok(a.statuses.has("omen") && a.statuses.has("isolated"));
});

/* ---- 3c. stageWorld: undo restores prior values --------------------------------------------- */

test("stageWorld: stages the requested fields, undo() restores every one of them", () => {
  const env = loadEngine();
  const priorUser = env.game.user;             // null, per loadEngine's sandbox
  const priorActors = env.game.actors;          // undefined — not set by loadEngine
  const priorPlaceables = env.canvas.tokens.placeables; // [] — the same array reference
  const priorScenes = env.game.scenes;          // { current: null }
  const priorCombats = env.game.combats;        // undefined
  const priorGrid = env.canvas.grid;            // null

  const actorA = mockActor({ name: "A" });
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [actorA],
    placeables: [{ actor: actorA }],
    scenes: [{ id: "s1" }],
    combats: [{ id: "c1" }],
    grid: { size: 100, distance: 5 },
  });

  // Staged: the values took, and the actors incantation is present.
  assert.strictEqual(env.game.user.isGM, true);
  assert.strictEqual(env.game.actors.length, 1);
  assert.strictEqual(env.game.actors.get("A"), actorA, "game.actors.get(id) must resolve");
  assert.strictEqual(env.game.actors.filter, Array.prototype.filter,
    "the cross-combat-scope incantation must be reattached");
  assert.strictEqual(env.canvas.tokens.placeables.length, 1);
  assert.strictEqual(env.game.scenes[0].id, "s1");
  assert.strictEqual(env.game.combats[0].id, "c1");
  assert.strictEqual(env.canvas.grid.size, 100);

  undo();

  // Restored: every field back to its pre-stage value.
  assert.strictEqual(env.game.user, priorUser);
  assert.strictEqual(env.game.actors, priorActors);
  assert.strictEqual(env.canvas.tokens.placeables, priorPlaceables);
  assert.strictEqual(env.game.scenes, priorScenes);
  assert.strictEqual(env.game.combats, priorCombats);
  assert.strictEqual(env.canvas.grid, priorGrid);
});

test("stageWorld: an omitted field is left untouched (only named fields are staged/restored)", () => {
  const env = loadEngine();
  env.game.user = { isGM: true, name: "left alone" };
  const { undo } = stageWorld(env, { grid: { size: 50, distance: 5 } });
  assert.strictEqual(env.game.user.name, "left alone", "user was not passed — must not be staged");
  assert.strictEqual(env.canvas.grid.size, 50);
  undo();
  assert.strictEqual(env.game.user.name, "left alone", "still untouched after undo");
  assert.strictEqual(env.canvas.grid, null, "grid restored to its pre-stage value");
});
