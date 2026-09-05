/* scripts/handler-schemas.js — parse the engine's registered handler-config schemas.
 *
 * Foundry's DataModel SILENTLY DROPS any handler field that isn't in the handler type's
 * registered schema: the rule loads, the Events tab renders, and the mechanic just never
 * fires — the exact failure mode lint-refs pass 2 kills for TYPE names, one level down.
 * This module extracts, per handler type, the set of field names the engine actually
 * registers (`config: { schema: { … } }` in each registerItemEventHandlerType call), so
 * lint pass 9 can hold every authored `handler` object's keys to them.
 *
 * Textual, not evaluated: the registration only runs inside Foundry (it needs the live
 * cosmereRPG API and foundry.data.fields), so the source is the only headless truth.
 * The scanner is string- and comment-aware because schema hints are full prose with
 * parentheses; it hard-fails if any call site fails to parse, so a style change in the
 * engine rots LOUDLY, not silently.
 *
 * Zero dependencies. Used by scripts/lint-refs.js (pass 9) and tests/handler-schemas.test.js.
 */
"use strict";

const CALL = "registerItemEventHandlerType(";

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

/* Map<handlerType, Set<fieldName>> for every registerItemEventHandlerType call in the
 * engine source. Throws if a call site yields no type or no parsable schema shape —
 * a rotted parser must fail the gate, never under-report. */
function parseHandlerSchemas(src) {
  const schemas = new Map();
  let sites = 0;
  // The search string ends in "(", so feature-check mentions of the API name (the engine's
  // `!api?.registerItemEventHandlerType)` guard) never match — every hit is a real call.
  for (let idx = src.indexOf(CALL); idx !== -1; idx = src.indexOf(CALL, idx + CALL.length)) {
    sites++;
    const next = src.indexOf(CALL, idx + CALL.length);
    const slice = src.slice(idx, next === -1 ? src.length : next);
    const tm = slice.match(/type:\s*"([^"]+)"/);
    if (!tm) throw new Error(`parseHandlerSchemas: call at index ${idx} has no type: "…" literal`);
    const type = tm[1];
    const cm = slice.match(/config:\s*\{\s*schema:\s*\{/);
    let fields = [];
    if (cm) {
      const schemaOpen = idx + cm.index + cm[0].length - 1;
      const close = matchBrace(src, schemaOpen);
      fields = topLevelKeys(src.slice(schemaOpen + 1, close));
    }
    if (schemas.has(type)) throw new Error(`parseHandlerSchemas: handler type "${type}" registered twice`);
    schemas.set(type, new Set(fields));
  }
  if (!sites) throw new Error("parseHandlerSchemas: no registerItemEventHandlerType call sites found — engine renamed the API?");
  if (schemas.size !== sites) throw new Error(`parseHandlerSchemas: ${sites} call sites but ${schemas.size} parsed types`);
  return schemas;
}

/* Map<handlerType, Map<fieldName, {choices:Set<string>, initial:string|null}>> — the CLOSED value
 * sets, for every schema field declared `choices: choices(…)`.
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
 * Textual for the same reason parseHandlerSchemas is: the registrations only run inside Foundry. */
function parseHandlerChoices(src) {
  const out = new Map();
  let sites = 0;
  for (let idx = src.indexOf(CALL); idx !== -1; idx = src.indexOf(CALL, idx + CALL.length)) {
    sites++;
    const next = src.indexOf(CALL, idx + CALL.length);
    const slice = src.slice(idx, next === -1 ? src.length : next);
    const tm = slice.match(/type:\s*"([^"]+)"/);
    if (!tm) throw new Error(`parseHandlerChoices: call at index ${idx} has no type: "…" literal`);
    const fields = new Map();
    const cm = slice.match(/config:\s*\{\s*schema:\s*\{/);
    if (cm) {
      const schemaOpen = idx + cm.index + cm[0].length - 1;
      const body = src.slice(schemaOpen + 1, matchBrace(src, schemaOpen));
      // `<field>: new FF.<Kind>Field({ … })` — walk to the matching brace so a hint containing
      // braces or parens cannot end the definition early.
      const decl = /([A-Za-z_$][\w$]*)\s*:\s*new\s+FF\.(\w+)\(\{/g;
      let m;
      while ((m = decl.exec(body))) {
        const braceAt = m.index + m[0].length - 1;
        const end = matchBrace(body, braceAt);
        const def = body.slice(m.index, end + 1);
        decl.lastIndex = end;
        const ch = def.match(/choices:\s*choices\(([^)]*)\)/);
        if (!ch) continue;
        const values = [...ch[1].matchAll(/"([^"]*)"/g)].map(x => x[1]);
        if (!values.length) throw new Error(`parseHandlerChoices: ${tm[1]}.${m[1]} declares choices() with no string literals`);
        const init = def.match(/initial:\s*"([^"]*)"/);
        fields.set(m[1], { choices: new Set(values), initial: init ? init[1] : null });
      }
    }
    out.set(tm[1], fields);
  }
  if (!sites) throw new Error("parseHandlerChoices: no registerItemEventHandlerType call sites found — engine renamed the API?");
  if (out.size !== sites) throw new Error(`parseHandlerChoices: ${sites} call sites but ${out.size} parsed types`);
  return out;
}

module.exports = { parseHandlerSchemas, parseHandlerChoices, matchBrace, topLevelKeys };
