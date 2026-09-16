/* scripts/lib/dead-field-check.js — the DEAD `system.<field>` detector behind lint-refs.js
 * pass 11, factored out so it is reachable from a test (TODO_REPO_HYGIENE item 182).
 *
 * WHY THIS FILE EXISTS. `scripts/lint-refs.js` is a top-level CLI script — requiring it runs
 * every pass immediately and calls `process.exit(1)` on any finding, so it cannot be `require()`d
 * by a test just to reach one pass's logic. This module is the pure, side-effect-free half of
 * pass 11: given a snapshot's known fields and one file's source, it returns the list of dead
 * `system.<field>` usages. lint-refs.js calls it with the REAL tracked data/native-vocabulary.json
 * and the real scanned files (unchanged behaviour, verified by the gates); a test can call it with
 * a synthetic snippet or a fixture snapshot instead.
 *
 * ITEM 182 — PER-TYPE SHARPENING. Pass 11 has always checked a `system.<field>` usage against the
 * UNION of every top-level field any cosmere DataModel declares — deliberately, because which
 * DataModel a given expression holds is static type inference the linter cannot do in general
 * (`x.system.foo` where `x` may be an actor, a talent, a weapon, …). The union answers a weaker
 * question — "is this field name known to the system AT ALL?" — and over-approximates on purpose.
 *
 * That over-approximation has a cost the cosmere-rpg 3.1.0 compatibility check (item 177,
 * docs/analysis/cosmere-rpg-3.1.0-compatibility.md, break F8) measured directly: at 3.1.0 the
 * union still contains `activation` and `damage`, because `action` items declare them, even
 * though the TALENT DataModel no longer does (blocker B1). So a talent-level `system.activation`
 * read would pass pass 11 as "not obviously dead" when it is exactly the break the upgrade
 * introduces. Pass 11 needs to check a read against the type the call site holds WHEREVER IT CAN
 * TELL, and only fall back to the union where it cannot.
 *
 * "Wherever it can tell" is deliberately narrow — a false failure that blocks a legitimate read is
 * worse than a miss (item 182's brief) — and covers exactly two shapes, both conservative by
 * construction (return null — "unknowable" — rather than guess, in every other case):
 *
 *   (1) PROPERTY ACCESS / FLAT PATH whose base identifier's bare name is an EXACT (case-
 *       insensitive), no-fuzzing match for one of the per-type snapshot's own type keys — e.g.
 *       `talent.system.strike`. Chosen over any fuzzier match (prefix/suffix stripping, plurals)
 *       because grepping today's engine and build scripts for `<type>.system.` / `<type>?.system.`
 *       across every type name in scope found ZERO real call sites (see the PR) — the exact-match
 *       rule costs nothing against today's code and is the smallest surface that can misfire.
 *       Generic names (`item`, `it`, `actor`, single letters — the overwhelming majority of real
 *       `system.*` call sites) are simply not attributable, and stay on the union exactly as
 *       before item 182.
 *   (2) A DOCUMENT-CREATION OBJECT LITERAL — `{ …, type: "talent", …, system: { … } }` — where the
 *       `system:` key's own enclosing object literal carries a sibling `type: "<word>"` key. This
 *       is how every Foundry document this codebase builds actually declares its type, so it is a
 *       strong signal where it applies. Guarded two ways against misreading a block statement as
 *       an object literal (see `looksLikeObjectLiteralOpen`) and against stray braces inside a
 *       string (the backward scan walks the CALLER's already-blanked text, never raw `src`).
 *       A `system: {…}` used to PATCH an existing document (`update(doc, { system: {…} })`) has no
 *       such sibling and stays on the union, correctly — Foundry's real *document* type is not
 *       visible to a linter reading an update call.
 *
 * The bare STRING-PATH form (`"system.foo"` inside `update({"system.foo": v})`) has no adjacent
 * identifier to type-hint from at all and is left on the union unconditionally.
 *
 * Once a type IS determined, it is authoritative — the call site is checked ONLY against that
 * type's field set, not ALSO against the (necessarily larger) union. Checking the union too would
 * silently undo the whole feature: `strike` is real for a weapon, so it is IN the union, and a
 * union-first-if-per-type-fails order would never flag `talent.system.strike` at all.
 *
 * Zero dependencies beyond ./handler-schemas.js's pure text-scanning helpers.
 */
"use strict";
const { matchBrace, topLevelKeys } = require("../handler-schemas.js");

/* Base identifier immediately before a `.system` match, e.g. the "talent" in `talent.system.foo`
 * or `talent?.system.foo`. `text` is the CALLER's blanked copy (comments/strings already replaced
 * with spaces) so a stray identifier-shaped run inside a string or comment can never match; `idx`
 * is the match index of `system` itself. Returns the lowercased name, or null if there is none
 * (start of file, or the preceding token cannot be a bare identifier — `)`, `]`, a keyword, …). */
function baseIdentifierBefore(text, idx) {
  const before = text.slice(Math.max(0, idx - 60), idx);
  const m = before.match(/([A-Za-z_$][\w$]*)\??\.\s*$/);
  return m ? m[1].toLowerCase() : null;
}

/* Does the `{` at `openIdx` (an index into the CALLER's blanked text) look like the start of an
 * OBJECT LITERAL rather than a block statement? Checked by the token immediately before it — an
 * object literal is always an assignment RHS (`=`), a `return`, an array element (`[` or `,`), or
 * a call argument (`(` or `,`); a block statement is preceded by a `)` (if/for/while/function
 * params), a fresh-statement `;`/`}`, or a block-introducing keyword (`else`, `try`, `finally`,
 * `do`). Conservative: anything not recognised as the object-literal shape returns false, which
 * makes the caller give up (null) rather than guess. */
function looksLikeObjectLiteralOpen(blanked, openIdx) {
  let j = openIdx - 1;
  while (j >= 0 && /\s/.test(blanked[j])) j--;
  if (j < 0) return true;   // start of file — cannot be a block statement
  const p = blanked[j];
  if ("=(,:[".includes(p)) return true;
  return /\breturn$/.test(blanked.slice(Math.max(0, j - 5), j + 1));
}

/* The string VALUE of a top-level `keyName: "…"` entry in an object-literal BODY (the text
 * strictly between its braces) — or null if that key is absent, or present with a non-string-
 * literal value (a variable, a ternary, …: unknowable, not a guess). Deliberately mirrors
 * handler-schemas.js's `topLevelKeys` scanning discipline (quotes and comments skipped as opaque
 * tokens, `{`/`(`/`[` all deepen nesting by one) so it agrees with that function about what
 * "top-level" means, but reads the UNBLANKED body — it needs the actual characters of `"talent"`,
 * and, being its own string/comment-safe scanner, it does not need a pre-blanked copy to stay
 * brace-safe the way the caller's BACKWARD scan does. Like `topLevelKeys`, this does not recognise
 * a quoted key (`"type": …`) — this codebase does not write one, and neither does the function it
 * mirrors. */
function topLevelStringValue(body, keyName) {
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      for (; j < body.length; j++) {
        if (body[j] === "\\") { j++; continue; }
        if (body[j] === c) break;
      }
      i = j; continue;
    }
    if (c === "/" && body[i + 1] === "/") { while (i < body.length && body[i] !== "\n") i++; continue; }
    if (c === "/" && body[i + 1] === "*") {
      const e = body.indexOf("*/", i + 2);
      if (e < 0) throw new Error("topLevelStringValue: unterminated block comment");
      i = e + 1; continue;
    }
    if (c === "{" || c === "(" || c === "[") { depth++; continue; }
    if (c === "}" || c === ")" || c === "]") { depth--; continue; }
    if (depth === 0 && /[A-Za-z_$]/.test(c) && (i === 0 || !/[\w$]/.test(body[i - 1]))) {
      let j = i + 1;
      while (j < body.length && /[\w$]/.test(body[j])) j++;
      const word = body.slice(i, j);
      let k = j;
      while (k < body.length && /\s/.test(body[k])) k++;
      if (body[k] === ":" && word === keyName) {
        let v = k + 1;
        while (v < body.length && /\s/.test(body[v])) v++;
        const q = body[v];
        if (q === '"' || q === "'" || q === "`") {
          let e = v + 1;
          for (; e < body.length; e++) {
            if (body[e] === "\\") { e++; continue; }
            if (body[e] === q) break;
          }
          return body.slice(v + 1, e);
        }
        return null;   // key present but its value isn't a plain string literal
      }
      i = j - 1; continue;
    }
  }
  return null;
}

/* Top-level key names of an object-literal BODY, INCLUDING ES6 shorthand properties (`{ activation,
 * damage }`, equivalent to `{ activation: activation, damage: damage }`) and excluding a `...spread`
 * and a method-shorthand (`foo() { … }`, not a data field in any Foundry document literal this
 * codebase writes). handler-schemas.js's `topLevelKeys` — reused everywhere else in this file and
 * left untouched — does NOT recognise shorthand, because none of pass 9/9b's handler-config
 * schemas are ever written that way; document-creation literals in foundry-build.js and the
 * engine ARE (the real talentDoc's `activation,` / `damage,` / `events,`), so the per-type path
 * needs this to see them. Scoped to ONLY that path (see `checkDeadFields` below) — the union-only
 * check keeps using plain `topLevelKeys`, unchanged, so this function's blast radius if it is ever
 * wrong is "a per-type finding is missed or added", never a change to pass 11's existing,
 * gates-verified behaviour against the real tracked snapshot. */
function topLevelKeysIncludingShorthand(body) {
  const keys = [];
  let depth = 0;
  let expectKey = true;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      for (; j < body.length; j++) {
        if (body[j] === "\\") { j++; continue; }
        if (body[j] === c) break;
      }
      i = j; expectKey = false; continue;
    }
    if (c === "/" && body[i + 1] === "/") { while (i < body.length && body[i] !== "\n") i++; continue; }
    if (c === "/" && body[i + 1] === "*") {
      const e = body.indexOf("*/", i + 2);
      if (e < 0) throw new Error("topLevelKeysIncludingShorthand: unterminated block comment");
      i = e + 1; continue;
    }
    if (c === "{" || c === "(" || c === "[") { depth++; expectKey = false; continue; }
    if (c === "}" || c === ")" || c === "]") { depth--; continue; }
    if (depth === 0 && c === ",") { expectKey = true; continue; }
    if (depth === 0 && c === "." && body[i + 1] === "." && body[i + 2] === ".") { i += 2; expectKey = false; continue; }   // ...spread
    if (depth === 0 && expectKey && /[A-Za-z_$]/.test(c)) {
      let j = i + 1;
      while (j < body.length && /[\w$]/.test(body[j])) j++;
      const word = body.slice(i, j);
      let k = j;
      while (k < body.length && /\s/.test(body[k])) k++;
      if (body[k] === ":") { keys.push(word); }
      else if (body[k] === "(") { /* method shorthand — not a data field */ }
      else if (body[k] === "," || body[k] === "}" || k >= body.length) { keys.push(word); }
      i = j - 1; expectKey = false; continue;
    }
    if (depth === 0 && !/\s/.test(c)) expectKey = false;
  }
  return keys;
}

/* The Foundry document TYPE the object literal enclosing this `system:` key declares, if any.
 * `src` is the original (unblanked) source; `blanked` is the SAME text with comments and string
 * CONTENTS replaced by spaces (delimiters kept), offsets identical to `src` — the caller's
 * existing pass-11 copy, safe to brace-count over because a stray `{`/`}` inside a description
 * string is already gone. `systemKeyIdx` is the index of the literal word "system" in that key.
 * Walks backward counting braces to find the nearest enclosing `{`; if that brace does not look
 * like an object literal (see above), or the walk runs off the start of the file, or the found
 * object has no top-level string-valued `type` key, returns null — unknowable, not a guess. */
function enclosingDocumentType(src, blanked, systemKeyIdx) {
  let depth = 0;
  for (let i = systemKeyIdx - 1; i >= 0; i--) {
    const c = blanked[i];
    if (c === "}") { depth++; continue; }
    if (c === "{") {
      if (depth > 0) { depth--; continue; }
      if (!looksLikeObjectLiteralOpen(blanked, i)) return null;
      let close;
      try { close = matchBrace(blanked, i); } catch (e) { return null; }
      try { return topLevelStringValue(src.slice(i + 1, close), "type"); }
      catch (e) { return null; }
    }
  }
  return null;
}

/* Every dead `system.<field>` usage in one file's source, against `known` (Set<string>, the
 * union — required) and `knownByType` (Map<string, Set<string>> | null | undefined — the per-type
 * sets; omit/null to get EXACTLY pass 11's pre-item-182 union-only behaviour, which is what
 * running against the real tracked data/native-vocabulary.json still does today since it has no
 * `systemSchemaFieldsByType` key).
 *
 * `blanked` = blankStringsAndComments(src) and `noComments` = blankStringsAndComments(src,
 * {keepStrings:true}) are taken as inputs rather than computed here so this module has no
 * dependency on that parser beyond its OUTPUT — see ./blank-strings.js.
 *
 * Returns [{ index, field, kind, type }], `index` a character offset into `src` (for the caller's
 * own line-number lookup), `kind` one of "read" | "write path" | "stored key" (matching pass 11's
 * existing DEAD() wording), `type` the item type that made the finding possible, or null when it
 * came from the plain union check (so a caller can format the two cases differently). */
function checkDeadFields({ src, blanked, noComments, known, knownByType }) {
  const hits = [];

  // (a) property access — `system.foo`, `system?.foo`. No whitespace after the dot, so the word
  //     "system." at the end of a sentence cannot match. `game.system.*` is the SYSTEM object.
  for (const m of blanked.matchAll(/\bsystem(?:\?\.|\.)([A-Za-z_$][\w$]*)/g)) {
    if (/game\s*\??\.\s*$/.test(blanked.slice(Math.max(0, m.index - 12), m.index))) continue;
    const field = m[1];
    const base = knownByType ? baseIdentifierBefore(blanked, m.index) : null;
    const type = base && knownByType.has(base) ? base : null;
    if (type) {
      if (!knownByType.get(type).has(field)) hits.push({ index: m.index, field, kind: "read", type });
      continue;   // a determined type is authoritative — never also fall through to the union
    }
    if (!known.has(field)) hits.push({ index: m.index, field, kind: "read", type: null });
  }

  // (b) flat update paths — `update({"system.foo": v})`, `getProperty(d, "system.foo")`. These
  //     live INSIDE strings, so they are read from the comments-only-blanked copy. No adjacent
  //     identifier to type-hint from — stays on the union, exactly as before item 182.
  for (const m of noComments.matchAll(/["'`]system\.([A-Za-z_$][\w$]*)/g)) {
    const field = m[1];
    if (!known.has(field)) hits.push({ index: m.index, field, kind: "write path", type: null });
  }

  // (c) creation/update object literals — `system: { foo: … }`.
  for (const m of blanked.matchAll(/(?:^|[^\w$.])system\s*:\s*\{/g)) {
    const open = src.indexOf("{", m.index);
    let close; try { close = matchBrace(src, open); } catch (e) { continue; }
    let type = null;
    if (knownByType) {
      const systemKeyIdx = blanked.indexOf("system", m.index);
      try { type = enclosingDocumentType(src, blanked, systemKeyIdx); } catch (e) { type = null; }
      if (type && !knownByType.has(type)) type = null;   // an unrecognised type is unknowable too
    }
    // The union-only path keeps using plain topLevelKeys (pass 11's pre-item-182 behaviour,
    // unchanged); the per-type path also sees shorthand fields (`{ activation, damage }`), which
    // is where they actually appear in this codebase's real document literals.
    let keys;
    try { keys = type ? topLevelKeysIncludingShorthand(src.slice(open + 1, close)) : topLevelKeys(src.slice(open + 1, close)); }
    catch (e) { continue; }
    for (const k of keys) {
      if (type) {
        if (!knownByType.get(type).has(k)) hits.push({ index: m.index, field: k, kind: "stored key", type });
        continue;
      }
      if (!known.has(k)) hits.push({ index: m.index, field: k, kind: "stored key", type: null });
    }
  }

  return hits;
}

module.exports = {
  checkDeadFields,
  // exported for their own focused tests / debugging — not needed by lint-refs.js
  baseIdentifierBefore,
  looksLikeObjectLiteralOpen,
  topLevelStringValue,
  topLevelKeysIncludingShorthand,
  enclosingDocumentType,
};
