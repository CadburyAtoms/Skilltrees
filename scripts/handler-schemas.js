/* scripts/handler-schemas.js — the engine's registered handler-config schemas, EVALUATED.
 *
 * Foundry's DataModel SILENTLY DROPS any handler field that isn't in the handler type's
 * registered schema: the rule loads, the Events tab renders, and the mechanic just never
 * fires — the exact failure mode lint-refs pass 2 kills for TYPE names, one level down.
 * This module reports, per handler type, the set of field names the engine actually
 * registers (and, per choices-field, the closed value set + initial), so lint pass 9/9b can
 * hold every authored `handler` object to them and the item-64 build guard can refuse a
 * generated rule whose type was never registered.
 *
 * EVALUATED, not parsed (item 24, 2026-09-06). Until item 24 this file regex-parsed the engine
 * SOURCE for each `registerItemEventHandlerType({ … config: { schema: { … } } })` call, because
 * the registration only ran inside Foundry. The engine now keeps its definitions as data
 * (`EDHA_EVENT_TYPES` / `EDHA_HANDLER_TYPES`, registered by one loop), and tests/harness.js
 * `loadHandlerRegistry()` runs that registration headlessly against a recording API with a
 * `foundry.data.fields` stub — so the schemas here are the SAME objects Foundry receives, read
 * from `config.schema` in declaration order, never recovered from text. A style change in the
 * engine cannot rot a parser that no longer exists; a broken table fails at load, loudly.
 *
 * Exported signatures are unchanged for the callers (lint-refs.js pass 9/9b, foundry-build.js
 * `assertRegisteredHandlerTypes`, and their tests): `parseHandlerSchemas(src)` /
 * `parseHandlerChoices(src)` still take the engine source but no longer read it — the registry is
 * loaded once and memoized. `schemasFromRegistry` / `choicesFromRegistry` are the pure halves, for
 * a caller (a test) that wants to feed a synthetic registry. `matchBrace` / `topLevelKeys` stay:
 * scripts/dump-native-vocabulary.js still parses the SYSTEM bundle's registrations with them,
 * and that bundle is not ours to evaluate.
 *
 * Zero dependencies beyond tests/harness.js (node:vm, node:fs, node:assert).
 */
"use strict";

/* Index of the '}' matching the '{' at `start`, skipping strings and comments. */
function matchBrace(src, start) {
  if (src[start] !== "{") throw new Error(`matchBrace: src[${start}] is "${src[start]}", not "{"`);
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      for (i++; i < src.length; i++) {
        if (src[i] === "\\") { i++; continue; }
        if (src[i] === c) break;
      }
    } else if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2);
      if (i < 0) throw new Error("matchBrace: unterminated block comment");
      i++;
    } else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return i; }
  }
  throw new Error("matchBrace: unbalanced braces");
}

/* Top-level keys of an object-literal body (the text between its braces): identifiers
 * followed by ':' at nesting depth 0, strings/comments skipped. */
function topLevelKeys(body) {
  const keys = [];
  let depth = 0;
  let expectKey = true; // at start, and after each depth-0 comma
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '"' || c === "'" || c === "`") {
      for (i++; i < body.length; i++) {
        if (body[i] === "\\") { i++; continue; }
        if (body[i] === c) break;
      }
    } else if (c === "/" && body[i + 1] === "/") {
      while (i < body.length && body[i] !== "\n") i++;
    } else if (c === "/" && body[i + 1] === "*") {
      i = body.indexOf("*/", i + 2);
      if (i < 0) throw new Error("topLevelKeys: unterminated block comment");
      i++;
    } else if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    else if (depth === 0 && c === ",") expectKey = true;
    else if (depth === 0 && expectKey && /[A-Za-z_$]/.test(c)) {
      let j = i + 1;
      while (j < body.length && /[\w$]/.test(body[j])) j++;
      let k = j;
      while (k < body.length && /\s/.test(body[k])) k++;
      if (body[k] === ":") keys.push(body.slice(i, j));
      i = j - 1;
      expectKey = false;
    }
  }
  return keys;
}

/* The engine's registry, loaded once per process through the test harness (a headless engine
 * load is ~100 ms; lint-refs asks twice and foundry-build once per pack). */
let _registry = null;
function loadRegistry() {
  if (!_registry) {
    const { loadHandlerRegistry } = require("../tests/harness.js");
    _registry = loadHandlerRegistry();
  }
  return _registry;
}

/* Map<handlerType, Set<fieldName>> from a registry `{ handlers: [def…] }`. Throws if a handler
 * has no type, a type registers twice, or the registry is empty — a broken table must fail the
 * gate, never under-report. */
function schemasFromRegistry(registry) {
  const handlers = registry?.handlers;
  if (!Array.isArray(handlers) || !handlers.length) throw new Error("schemasFromRegistry: no registerItemEventHandlerType registrations — engine renamed the API or emptied EDHA_HANDLER_TYPES?");
  const schemas = new Map();
  handlers.forEach((def, i) => {
    const type = def?.type;
    if (typeof type !== "string" || !type) throw new Error(`schemasFromRegistry: handler at index ${i} has no type`);
    if (schemas.has(type)) throw new Error(`schemasFromRegistry: handler type "${type}" registered twice`);
    schemas.set(type, new Set(Object.keys(def.config?.schema || {})));
  });
  return schemas;
}

/* Map<handlerType, Map<fieldName, {choices:Set<string>, initial:string|null}>> — the CLOSED value
 * sets, for every schema field constructed with a `choices` option.
 *
 * Pass 9 (field NAMES) exists because Foundry silently DROPS an unknown key. This is the harsher
 * twin: a value outside a StringField's `choices` is not dropped, it THROWS
 * (`common/data/fields.mjs` StringField._validateType: "<v> is not a valid choice"), and because
 * the cosmere system stores rules in a `CollectionField` whose `_validateType` throws for the whole
 * object on any bad entry, the item's ENTIRE `system.events` map then falls back to its initial
 * `{}` (SchemaField._validateType: `data[name] = failure.fallback = initial` under the fallback
 * that a non-strict document load turns on). One bad character in one field kills every rule on
 * the document — which is exactly what happened to the Reeve-Owl's Sovereign of Solitude: four
 * authored rules, zero at the table, no error, on a pack whose bytes were verified correct.
 *
 * `initial` is captured because a BLANK value is NOT the same failure: `DataField.clean` catches
 * `_validateSpecial`'s "may not be a blank string" and returns the initial, so `""` on a
 * choices-field with a legal initial is silently healed rather than fatal. Callers gate on that.
 *
 * The engine builds every closed set with its `choices("a", "b", …)` helper, which yields an
 * object keyed by value (a blank value is labelled "(none)"); Foundry also accepts an array or a
 * function. Object and array forms are read here; a function-valued `choices` cannot be enumerated
 * headlessly and throws, so it can never pass silently. */
function choicesFromRegistry(registry) {
  const handlers = registry?.handlers;
  if (!Array.isArray(handlers) || !handlers.length) throw new Error("choicesFromRegistry: no registerItemEventHandlerType registrations — engine renamed the API or emptied EDHA_HANDLER_TYPES?");
  const out = new Map();
  for (const def of handlers) {
    const type = def?.type;
    if (typeof type !== "string" || !type) throw new Error("choicesFromRegistry: a handler has no type");
    const fields = new Map();
    for (const [name, field] of Object.entries(def.config?.schema || {})) {
      const opts = field?.options ?? field ?? {};
      const ch = opts.choices;
      if (ch === undefined || ch === null) continue;
      let values;
      if (Array.isArray(ch)) values = ch.map(String);
      else if (typeof ch === "object") values = Object.keys(ch);
      else throw new Error(`choicesFromRegistry: ${type}.${name} declares choices as a ${typeof ch} — not enumerable headlessly`);
      if (!values.length) throw new Error(`choicesFromRegistry: ${type}.${name} declares an EMPTY choices set`);
      const init = typeof opts.initial === "string" ? opts.initial : null;
      fields.set(name, { choices: new Set(values), initial: init });
    }
    out.set(type, fields);
  }
  return out;
}

/* Map<handlerType, Set<fieldName>> for every handler type the engine registers. `src` is accepted
 * for signature compatibility (callers used to hand over the engine source) and ignored: the
 * registry is evaluated, not parsed. */
function parseHandlerSchemas(src) { // eslint-disable-line no-unused-vars
  return schemasFromRegistry(loadRegistry());
}

/* Map<handlerType, Map<fieldName, {choices, initial}>> for every handler type the engine
 * registers. `src` accepted and ignored, as above. */
function parseHandlerChoices(src) { // eslint-disable-line no-unused-vars
  return choicesFromRegistry(loadRegistry());
}

module.exports = { parseHandlerSchemas, parseHandlerChoices, schemasFromRegistry, choicesFromRegistry, loadRegistry, matchBrace, topLevelKeys };
