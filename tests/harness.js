/* tests/harness.js — load the engine (module-src/scripts/register-skills.js) headlessly.
 *
 * The engine is one plain script (no import/export) whose helpers are top-level `function`
 * declarations, so evaluating it in a Node `vm` context makes every helper a property of that
 * context — callable directly, no restructuring of the one-engine file needed. Foundry globals
 * are stubbed just enough for LOAD time (hook registration + the three RegionBehavior class
 * definitions); per-test behavior (canvas grid, game.user, …) is set on the returned context.
 *
 * Zero dependencies: node:vm + node:fs only. Used by tests/*.test.js via tests/run.js.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ENGINE_PATH = path.join(__dirname, "..", "module-src", "scripts", "register-skills.js");

function getProp(obj, p) {
  let v = obj;
  for (const k of String(p).split(".")) {
    if (v === undefined || v === null) return undefined;
    v = v[k];
  }
  return v;
}

/* Arithmetic-only expression evaluator — mirrors the slice of Foundry's Roll.safeEval the
 * engine's pure helpers rely on (numbers, + - * / % ( ), Math.<fn>). Throws on anything else. */
function safeEval(expr) {
  const s = String(expr);
  const stripped = s.replace(/\bMath\.(abs|ceil|floor|max|min|round|sqrt|pow|sign|trunc)\b/g, "");
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

class RollStub {
  constructor(formula, data = {}) {
    this.formula = String(formula);
    this.data = data;
    this.total = undefined;
    this.terms = [{ operand: 0 }]; // leading operand, mirrors "0 + …" term-splice usage
    this.options = {};
  }
  evaluateSync() { this.total = safeEval(this.formula); return this; }
  async evaluate() { return this.evaluateSync(); }
  resetFormula() { return this.formula; }
  static safeEval(expr) { return safeEval(expr); }
  static replaceFormulaData(formula, data, opts) { return replaceFormulaData(formula, data, opts); }
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
        setProperty: (obj, p, value) => {
          const keys = String(p).split(".");
          let o = obj;
          for (const k of keys.slice(0, -1)) o = o[k] ?? (o[k] = {});
          o[keys[keys.length - 1]] = value;
          return true;
        },
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
    Roll: RollStub,
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

module.exports = { loadEngine, ENGINE_PATH, safeEval, replaceFormulaData };
