/* tests/harness.js — load the engine (module-src/scripts/register-skills.js) headlessly.
 *
 * The engine is one plain script (no import/export) whose helpers are top-level `function`
 * declarations, so evaluating it in a Node `vm` context makes every helper a property of that
 * context — callable directly, no restructuring of the one-engine file needed. Foundry globals
 * are stubbed just enough for LOAD time (hook registration + the three RegionBehavior class
 * definitions); per-test behavior (canvas grid, game.user, …) is set on the returned context.
 *
 * 2026-08-10 (hygiene campaign wave 4A): the engine-source loader + comment stripper had drifted
 * into five near-duplicate implementations across the test suite with four different semantics —
 * some kept strings, some didn't, only one of seven raw-source reads normalized CRLF, and that fix
 * landed as a PROSE COMMENT in one test that a second test cited by name instead of calling. This
 * file is now the one place that reads engine/repo source (readEngineSource/readSourceLF), strips
 * comments (codeOnly, re-exporting scripts/lib/strip-comments.js), and builds the mock
 * actor/effect/world scaffolding that a growing number of tests had been hand-rolling independently.
 *
 * Zero dependencies: node:vm + node:fs + node:assert only. Used by tests/*.test.js via tests/run.js.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { stripComments } = require("../scripts/lib/strip-comments.js");

const ENGINE_PATH = path.join(__dirname, "..", "module-src", "scripts", "register-skills.js");
const REPO_ROOT = path.join(__dirname, "..");

function getProp(obj, p) {
  let v = obj;
  for (const k of String(p).split(".")) {
    if (v === undefined || v === null) return undefined;
    v = v[k];
  }
  return v;
}

/* Dotted-path write, creating intermediate objects as needed. Mirrors Foundry's
 * `foundry.utils.setProperty` (the shape loadEngine's sandbox stubs it with) — extracted to a
 * standalone function so mockActor/mockEffect's setFlag can share it instead of re-deriving it. */
function setProp(obj, p, value) {
  const keys = String(p).split(".");
  let o = obj;
  for (const k of keys.slice(0, -1)) o = o[k] ?? (o[k] = {});
  o[keys[keys.length - 1]] = value;
  return true;
}

/* Dotted-path delete. Mirrors the `unsetFlag` shape every hand-rolled actor/effect stub in the
 * suite re-implements (chaos-sweep, cross-combat-scope, timed-status-catchup, …). */
function unsetProp(obj, p) {
  const keys = String(p).split(".");
  let o = obj;
  for (const k of keys.slice(0, -1)) { if (o == null) return; o = o[k]; }
  if (o) delete o[keys[keys.length - 1]];
}

/* Read the engine source, LF-normalized (`\r\n` -> `\n`). This checkout is core.autocrlf=true, so
 * the on-disk file is CRLF; JS `.`/line-anchored regexes do not match `\r`, so a raw read silently
 * mismatches on Ben's machine while staying green on CI's LF checkout (the false-positive/negative
 * split that bit tests/terrain-ownership.test.js — see its "NORMALISE CRLF FIRST" note, now here). */
function readEngineSource() {
  return fs.readFileSync(ENGINE_PATH, "utf8").replace(/\r\n/g, "\n");
}

/* Same LF-normalized read, for any other repo-relative file (e.g. scripts/foundry-build.js). */
function readSourceLF(relPath) {
  return fs.readFileSync(path.join(REPO_ROOT, relPath), "utf8").replace(/\r\n/g, "\n");
}

/* Comment-stripped source — re-exports scripts/lib/strip-comments.js's `stripComments` under the
 * name the tests already call it (`codeOnly`), so a source-reading test and lint-refs.js always
 * agree on what "code" means. */
const codeOnly = stripComments;

/* Arithmetic-only expression evaluator — mirrors the slice of Foundry's Roll.safeEval the
 * engine's pure helpers rely on (numbers, + - * / % ( ), Math.<fn>, and the BARE math functions
 * `floor(x)` / `ceil(x)` / … that Foundry exposes through its Roll math proxy — authored formulas
 * are written `floor(@dealt / 2)`, never `Math.floor(...)`. Modelling the bare form matters: while
 * this stub refused it, `edhaEvalSync("floor((2d8) / 2)")` returned 0 in the harness for the same
 * shape that was failing in Foundry for an unrelated reason, so a test could pass on a wrong
 * value. 2026-07-26j). Throws on anything else. */
const SAFE_MATH_FNS = "abs|ceil|floor|max|min|round|sqrt|pow|sign|trunc";
function safeEval(expr) {
  const s = String(expr).replace(new RegExp(`(?<!\\w\\.?)\\b(${SAFE_MATH_FNS})\\s*\\(`, "g"), "Math.$1(");
  const stripped = s.replace(new RegExp(`\\bMath\\.(${SAFE_MATH_FNS})\\b`, "g"), "");
  if (!/^[0-9+\-*/%().,\s]*$/.test(stripped)) throw new Error(`safeEval refused: ${expr}`);
  const v = Function(`"use strict"; return (${s});`)();
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`safeEval non-numeric: ${expr}`);
  return v;
}

/* @path substitution — mirrors Roll.replaceFormulaData ({ missing } fills unresolved refs). */
function replaceFormulaData(formula, data, { missing } = {}) {
  return String(formula ?? "").replace(/@([a-zA-Z0-9_.]+)/g, (m, p) => {
    const v = getProp(data, p);
    if (v === undefined || v === null) return missing !== undefined ? String(missing) : m;
    return String(v);
  });
}

/* A Foundry Roll stand-in, parameterized: `{ total, capture }`.
 *   - total:   fixed number (or a `(rollInstance) => number` function) returned by evaluate/
 *              evaluateSync, bypassing safeEval — for formulas the arithmetic-only evaluator
 *              cannot handle (real dice terms, unresolved @refs). Omit it and the default
 *              (safeEval-based) behavior is unchanged.
 *   - capture: an array; every formula built is pushed onto it, so a test can assert on the
 *              FORMULA a helper constructed even when it cannot evaluate it (contest-attr.test.js's
 *              `withCapturingRoll`, card-labels.test.js's deterministic DiceRoll).
 * Calling with no options — `RollStub()` — reproduces the harness's original hardcoded class
 * exactly; that is what loadEngine wires up as the sandbox's `Roll`. */
function RollStub({ total, capture } = {}) {
  return class RollStub {
    constructor(formula, data = {}) {
      this.formula = String(formula);
      this.data = data;
      this.total = undefined;
      this.terms = [{ operand: 0 }]; // leading operand, mirrors "0 + …" term-splice usage
      this.options = {};
      if (capture) capture.push(this.formula);
    }
    evaluateSync() {
      this.total = total === undefined ? safeEval(this.formula) : (typeof total === "function" ? total(this) : total);
      return this;
    }
    async evaluate() { return this.evaluateSync(); }
    resetFormula() { return this.formula; }
    static safeEval(expr) { return safeEval(expr); }
    static replaceFormulaData(formula, data, opts) { return replaceFormulaData(formula, data, opts); }
  };
}

/* Load the engine into a fresh vm context. Returns the context: engine helpers are its
 * properties (env.edhaFoldDieMath(…)), and env.__hooks records every Hooks.on/once call. */
function loadEngine() {
  const hooks = { on: [], once: [] };
  const sandbox = {
    console: { log() {}, warn() {}, error() {}, info() {}, debug() {} },
    setTimeout, clearTimeout, setInterval, clearInterval,
    Hooks: {
      on: (name, fn) => hooks.on.push({ name, fn }),
      once: (name, fn) => hooks.once.push({ name, fn }),
      off() {}, call() {}, callAll() {},
    },
    foundry: {
      utils: {
        getProperty: getProp,
        setProperty: setProp,
        duplicate: (o) => JSON.parse(JSON.stringify(o)),
        deepClone: (o) => JSON.parse(JSON.stringify(o)),
        mergeObject: (a, b) => Object.assign(a, b ?? {}),
        debounce: (fn) => fn,
        expandObject: (o) => o,
        flattenObject: (o) => o,
        randomID: (n = 16) => Array.from({ length: n }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join(""),
      },
      data: {
        fields: {},
        regionBehaviors: { RegionBehaviorType: class RegionBehaviorType { static _createEventsField() { return {}; } } },
      },
      applications: { api: {} },
      canvas: {},
    },
    game: {
      user: null, users: null,
      settings: { register() {}, get() { return undefined; } },
      i18n: { localize: (s) => s, format: (s) => s },
      socket: { on() {}, emit() {} },
      modules: { get: () => ({ active: true }) },
      packs: { get: () => null },
      scenes: { current: null },
      combat: null,
    },
    CONFIG: { COSMERE: { statuses: {} }, statusEffects: [], RegionBehavior: { dataModels: {}, typeIcons: {}, typeLabels: {} } },
    canvas: { scene: null, tokens: { placeables: [] }, grid: null },
    ui: { notifications: { warn() {}, info() {}, error() {} } },
    Roll: RollStub(),
    ChatMessage: class ChatMessage { static create() {} static getSpeaker() { return {}; } },
    Dialog: class Dialog {},
    Handlebars: { registerHelper() {} },
    fromUuid: async () => null,
    fromUuidSync: () => null,
    AudioHelper: { play() {} },
    PIXI: {},
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const code = fs.readFileSync(ENGINE_PATH, "utf8");
  vm.runInContext(code, sandbox, { filename: "register-skills.js" });
  sandbox.__hooks = hooks;
  return sandbox;
}

/* A minimal actor document: {name, id, uuid, type, statuses, items, effects, flags}, with
 * DOTTED-PATH getFlag/setFlag/unsetFlag built on getProp/setProp/unsetProp above. `opts.flags`
 * is the CONTENT of the "edha-content" scope (the only scope this shell stores), matching the
 * shape every hand-rolled `makeActor` in the suite already passes (chaos-sweep.test.js,
 * cross-combat-scope.test.js, …). Layer any extra per-test methods with Object.assign — this is
 * the common shell, not a replacement for a test's bespoke behavior (toggleStatusEffect,
 * deleteEmbeddedDocuments, getActiveTokens, …). */
function mockActor(opts = {}) {
  const {
    name = "Mock Actor", id = name, uuid = `Actor.${id}`, type = "character",
    statuses = new Set(), items = [], effects = [], flags = {},
  } = opts;
  const scopes = { "edha-content": { ...flags } };
  return {
    name, id, uuid, type,
    statuses: statuses instanceof Set ? statuses : new Set(statuses),
    items, effects,
    flags: scopes,
    getFlag(scope, key) { return getProp(scopes[scope], key); },
    async setFlag(scope, key, value) { scopes[scope] = scopes[scope] || {}; setProp(scopes[scope], key, value); return value; },
    async unsetFlag(scope, key) { unsetProp(scopes[scope], key); },
  };
}

/* A minimal ActiveEffect document: {id, name, statuses, deleted, flags}, same dotted-path flag
 * trio as mockActor, plus `delete()` (records `.deleted = true`, mirroring
 * timed-status-catchup.test.js's makeEffect). `opts.statusId` is sugar for the common
 * one-status case; `opts.statuses` (an array or Set) wins if both are given. */
function mockEffect(opts = {}) {
  const {
    name = "Mock Effect", id = `eff-${name}`, statusId, statuses,
    flags = {},
  } = opts;
  const scopes = { "edha-content": { ...flags } };
  const eff = {
    id, name,
    statuses: statuses ? (statuses instanceof Set ? statuses : new Set(statuses)) : new Set(statusId ? [statusId] : []),
    deleted: false,
    flags: scopes,
    getFlag(scope, key) { return getProp(scopes[scope], key); },
    async setFlag(scope, key, value) { scopes[scope] = scopes[scope] || {}; setProp(scopes[scope], key, value); return value; },
    async unsetFlag(scope, key) { unsetProp(scopes[scope], key); },
    async delete() { eff.deleted = true; },
  };
  return eff;
}

/* Stage game/canvas globals for one test, returning `{ undo() }` to restore the prior values.
 * `actors` gets the `env.game.actors.filter = Array.prototype.filter` incantation
 * (cross-combat-scope.test.js) — game.actors built outside the vm's realm needs it reattached
 * before engine code (running inside the vm) can rely on Array methods behaving normally — plus
 * a `.get(id)` lookup, the other half of every hand-rolled `game.actors` stub in the suite.
 * Every field is optional and independently undoable; omitted fields are left untouched. */
function stageWorld(env, opts = {}) {
  const { user, users, actors, placeables, scenes, combats, grid } = opts;
  const prior = {
    user: env.game.user, users: env.game.users, actors: env.game.actors,
    placeables: env.canvas?.tokens?.placeables, scenes: env.game.scenes,
    combats: env.game.combats, grid: env.canvas?.grid,
  };
  if (user !== undefined) env.game.user = user;
  if (users !== undefined) env.game.users = users;
  if (actors !== undefined) {
    const list = Object.assign([...actors], { get: (id) => actors.find((a) => a.id === id) ?? null });
    list.filter = Array.prototype.filter;
    env.game.actors = list;
  }
  if (placeables !== undefined) {
    env.canvas = env.canvas || {};
    env.canvas.tokens = env.canvas.tokens || {};
    env.canvas.tokens.placeables = placeables;
  }
  if (scenes !== undefined) env.game.scenes = scenes;
  if (combats !== undefined) env.game.combats = combats;
  if (grid !== undefined) { env.canvas = env.canvas || {}; env.canvas.grid = grid; }
  return {
    undo() {
      env.game.user = prior.user;
      env.game.users = prior.users;
      env.game.actors = prior.actors;
      if (env.canvas?.tokens) env.canvas.tokens.placeables = prior.placeables;
      env.game.scenes = prior.scenes;
      env.game.combats = prior.combats;
      if (env.canvas) env.canvas.grid = prior.grid;
    },
  };
}

/* Save/patch/run/restore-in-finally for ad hoc env overrides (env.ChatMessage, env.fromUuid, …).
 * `patchFn` is either a plain object of {envKey: value} or a `(env) => ({envKey: value})`
 * function; every key it names is saved before the patch and put back after `fn()` settles,
 * pass or fail. `fn` may be sync or async — its return value (or resolved value) is returned. */
async function withStubs(env, patchFn, fn) {
  const patch = typeof patchFn === "function" ? patchFn(env) : (patchFn || {});
  const prior = {};
  for (const k of Object.keys(patch)) prior[k] = env[k];
  Object.assign(env, patch);
  try {
    return await fn();
  } finally {
    for (const k of Object.keys(patch)) env[k] = prior[k];
  }
}

/* Replace env.ChatMessage with a capturing stub; returns the array of posted cards. Reads the
 * OWNER off the message SPEAKER, never by matching names inside the content — ally-drop-side's
 * lesson (three of its own ally names are substrings of each other and of the victim's name, so
 * a content-substring match would misattribute a card) is the default here, not an opt-in. */
function captureChat(env) {
  const cards = [];
  env.ChatMessage = class ChatMessage {
    static create(data) { cards.push({ owner: data?.speaker?.alias ?? null, content: String(data?.content ?? ""), data }); }
    static getSpeaker({ actor } = {}) { return { alias: actor?.name }; }
  };
  return cards;
}

/* Values built inside the vm context carry that realm's prototypes, which deepStrictEqual
 * rejects; JSON-normalize the actual value before structural comparison (the cross-realm guard —
 * engine-helpers.test.js's original `const eq`). */
function eq(actual, expected) {
  assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)), expected);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  loadEngine, ENGINE_PATH, safeEval, replaceFormulaData,
  readEngineSource, readSourceLF, codeOnly,
  getProp, setProp,
  mockActor, mockEffect,
  stageWorld, withStubs, RollStub, captureChat,
  eq, sleep,
};
