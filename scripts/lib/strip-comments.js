/* scripts/lib/strip-comments.js — the comment-stripped-engine-text primitive.
 *
 * Moved out of scripts/lint-refs.js verbatim (2026-08-10, hygiene campaign wave 4A) so it has
 * exactly one implementation instead of five near-duplicates scattered across lint-refs.js and
 * several tests/*.test.js files, each with slightly different semantics (some kept strings,
 * some didn't; some normalized CRLF first, most didn't; one was a naive `/\*[\s\S]*?\*\//g`
 * regex with no quote-awareness at all). This is the one lint-refs.js already used to resolve
 * name-literals and event/handler types against engine CODE rather than prose — same precedent
 * as scripts/handler-schemas.js, required by both lint-refs.js and tests/handler-schemas.test.js.
 *
 * Line-by-line state machine: block-comment state carried across lines (blanking consumed lines
 * to preserve line numbers), inline `/* ... *\/` collapsed, and a `//` only treated as a line
 * comment when an even number of `"` precede it on that line (the quote-parity guard — a cheap
 * heuristic, not a tokenizer: it does not understand single-quoted or template-literal strings,
 * but it is what lint-refs.js has run against register-skills.js the whole time, and the byte
 * count of "608 talent names, 11 engine name-literals resolved" depends on this exact behavior).
 *
 * For the offset-preserving variant (comments AND string contents blanked to spaces, byte
 * offsets kept so a match index still points into the ORIGINAL source, template/regex-aware) —
 * that is `blankStringsAndComments` in scripts/lint-refs.js. It stays there: lint pass 11 is its
 * sole consumer and needs the offset-preserving property this module does not provide.
 *
 * Zero dependencies. Used by scripts/lint-refs.js and tests/harness.js (as `codeOnly`).
 */
"use strict";

// Comment-stripped source, for checks that must mean "in CODE". The tree-section headers list
// every talent by name (that IS the iron-rule-3 ledger), so a raw substring search is satisfied
// by prose — which is how pass 5's name-keyed-wiring exemption went silently vacuous when the 2b
// migration deleted the last tree-talent name from code (2026-07-26: two adversary abilities
// whose cues promised "use the item to auto-resolve" had been dead since their name-key was
// deleted, and pass 5 kept exempting them on the strength of a comment).
function stripComments(src) {
  const out = [];
  let inBlock = false;
  for (const raw of src.split("\n")) {
    let l = raw;
    if (inBlock) { const e = l.indexOf("*/"); if (e < 0) { out.push(""); continue; } l = l.slice(e + 2); inBlock = false; }
    for (;;) {
      const b = l.indexOf("/*"); if (b < 0) break;
      const e = l.indexOf("*/", b + 2);
      if (e < 0) { l = l.slice(0, b); inBlock = true; break; }
      l = l.slice(0, b) + " " + l.slice(e + 2);
    }
    const s = l.indexOf("//");
    // only treat // as a comment when it isn't inside a string literal
    if (s >= 0 && (l.slice(0, s).split('"').length - 1) % 2 === 0) l = l.slice(0, s);
    out.push(l);
  }
  return out.join("\n");
}

module.exports = { stripComments };
