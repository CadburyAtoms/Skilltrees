/* scripts/lib/blank-strings.js — the offset-preserving comment/string blanker.
 *
 * Moved out of scripts/lint-refs.js verbatim (TODO_REPO_HYGIENE item 182) so it has one
 * implementation reachable from both lint-refs.js and a test/another script, instead of being
 * re-derived. Same precedent as ./strip-comments.js (2026-08-10, hygiene campaign wave 4A) — that
 * file's header used to say "`blankStringsAndComments` … stays [in lint-refs.js]: lint pass 11 is
 * its sole consumer". That was already stale before this move (passes 11, 15, 16, 17, 18 and 19
 * all call it), and item 182 needed a second, independent caller: scripts/lib/dead-field-check.js,
 * so pass 11's per-type sharpening is reachable from a test without executing the whole of
 * lint-refs.js (a top-level CLI script that calls process.exit(1) on any finding).
 *
 * Comments AND string contents replaced by spaces, byte offsets and line breaks preserved — so a
 * match index in the result still points at the same place in the original source. Contrast with
 * ./strip-comments.js's `stripComments`, which rebuilds line-by-line and cannot be indexed back
 * into the source, and does not understand string content at all (comments only).
 *
 * TEMPLATE-AWARE, and that is not a nicety — it was silently disabling the whole of lint-refs.js
 * at one point. The old scanner closed a backtick string at the FIRST backtick it saw, so a
 * NESTED template inside `${…}` (the engine has ~30, e.g. `…${a ? " strike" : `${x.name}'s
 * hit`}…`) closed the OUTER template early, dumped the remaining string text into "code", and the
 * next apostrophe in prose ("the victim's healing") opened a runaway span that ate real code
 * until the next stray quote. Measured on register-skills.js: 116 runaway spans, 598 code lines
 * (5.9%) blanked to nothing. Every pass built on this helper was blind on those lines, and the
 * hole was invisible because a blind pass reports SUCCESS.
 *
 * The scanner is an explicit context stack: code / quoted-string / template, with `${…}` pushing
 * a fresh CODE frame (brace-counted) so nested templates and the code inside interpolations are
 * both handled. Code inside `${…}` is EXPOSED to callers, which is correct — it is code.
 *
 * REGEX LITERALS get the standard prev-token heuristic: a `/` starts a regex when the previous
 * non-space code character cannot end an expression. Without it, `/[&<>"]/` (one line) opened a
 * fake string on its `"` and swallowed the next 36 lines. The heuristic is not a tokeniser — it
 * mis-reads `a /b/ c` as a regex — but that is division by an identifier on both sides, which does
 * not occur in this codebase, and the failure direction is the safe one (blanking too much never
 * invents a violation, it only hides one, and each caller's own rot alarms catch a collapse).
 *
 * Zero dependencies. Used by scripts/lint-refs.js and scripts/lib/dead-field-check.js.
 */
"use strict";

/* Does the `/` at `i` open a REGEX literal (rather than being division)? The standard heuristic:
 * look back past whitespace at the previous code character — if it cannot END an expression, a
 * regex must follow. `)` is deliberately treated as "can end" (so `(a+b) / c` is division), which
 * mis-reads `if (x) /re/.test(y)`; no such form exists in this codebase. */
function regexStartsHere(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  if (j < 0) return true;
  const p = src[j];
  if ("([{,;:=!&|?+-*%~^<>".includes(p)) return true;
  return /\b(return|typeof|case|in|of|new|delete|void|do|else|yield|await)$/.test(src.slice(Math.max(0, j - 9), j + 1));
}

function blankStringsAndComments(src, { keepStrings = false } = {}) {
  let out = "";
  const emit = (ch, blankIt) => { out += (ch === "\n") ? "\n" : (blankIt ? " " : ch); };
  const stack = [{ k: "code", braces: 0, root: true }];
  for (let i = 0; i < src.length; ) {
    const t = stack[stack.length - 1];
    const c = src[i];

    if (t.k === "str" || t.k === "tpl") {
      if (c === "\\") { emit(c, !keepStrings); emit(src[i + 1] ?? "", !keepStrings); i += 2; continue; }
      if (c === (t.k === "tpl" ? "`" : t.q)) { out += c; i++; stack.pop(); continue; }   // the delimiter itself stays
      if (t.k === "tpl" && c === "$" && src[i + 1] === "{") {   // interpolation: back to CODE until the matching }
        out += "${"; i += 2; stack.push({ k: "code", braces: 0 }); continue;
      }
      emit(c, !keepStrings); i++; continue;
    }

    // code frame
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") { emit(src[i], true); i++; } continue; }
    if (c === "/" && src[i + 1] === "*") {
      const e = src.indexOf("*/", i + 2);
      const end = e < 0 ? src.length : e + 2;
      for (; i < end; i++) emit(src[i], true);
      continue;
    }
    if (c === '"' || c === "'") { out += c; i++; stack.push({ k: "str", q: c }); continue; }
    if (c === "`") { out += c; i++; stack.push({ k: "tpl" }); continue; }
    if (c === "/" && regexStartsHere(src, i)) {           // a REGEX literal, not division — skip it whole
      out += c; i++;
      for (let cls = false; i < src.length; i++) {
        if (src[i] === "\\") { out += "  "; i++; continue; }
        if (src[i] === "[") cls = true; else if (src[i] === "]") cls = false;
        const done = src[i] === "/" && !cls;
        out += src[i] === "\n" ? "\n" : (done ? "/" : " ");
        if (done || src[i] === "\n") { i++; break; }       // a newline means it was division after all — bail
      }
      continue;
    }
    if (!t.root) {
      if (c === "{") { t.braces++; out += c; i++; continue; }
      if (c === "}") { out += c; i++; if (t.braces === 0) stack.pop(); else t.braces--; continue; }
    }
    out += c; i++;
  }
  return out;
}

module.exports = { blankStringsAndComments };
