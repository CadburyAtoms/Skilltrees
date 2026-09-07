#!/usr/bin/env node
/* scripts/lib/fold-die-math.js — the build-time twin of the engine's `edhaFoldDieMath`
 * (module-src/scripts/register-skills.js, R-65/2026-08-10). TODO_REPO_HYGIENE #59 / R-71.
 *
 * WHY A TWIN, NOT AN IMPORT: the engine's copy calls `Roll.safeEval`, a Foundry global that does
 * not exist under plain Node — and `foundry-build.js` must not import the engine (iron rule 2a
 * territory: the build has no Foundry runtime to load one into). So this file re-implements the
 * exact same fold ALGORITHM (the two-regex, up-to-4-pass loop over `d(...)` and `(...)d\d`) against
 * a pure, Node-only arithmetic evaluator standing in for `Roll.safeEval` — the same restricted
 * grammar tests/harness.js's `safeEval` already uses to exercise the engine's copy headlessly
 * (numbers, `+ - * / % ( )`, and the bare Math functions Foundry's Roll math proxy exposes:
 * abs/ceil/floor/max/min/round/sqrt/pow/sign/trunc). `tests/fold-die-math.test.js` pins this
 * module's output against the engine's own `edhaFoldDieMath` (loaded via tests/harness.js) across
 * the same formulas, so the two copies cannot silently drift apart.
 *
 * SAFE BY CONSTRUCTION for a still-symbolic formula: an authored `[Tier][Die]` formula such as
 * "(@tier)d(2 * @skills.blue.rank + 2)" still carries unresolved `@`-refs at BUILD time (there is
 * no actor to substitute them from), so the inner evaluator throws on the `@` character and the
 * fold below leaves the string untouched — exactly what the engine's own copy does before runtime
 * substitution (see engine-helpers.test.js: "edhaFoldDieMath leaves unresolved @refs alone"). This
 * module only ever changes a `damage.formula` whose computed dice math is ALREADY fully numeric
 * (no `@`-refs at all) — e.g. a flat, non-rank-scaled ability — folding it into plain dice once,
 * at build time, instead of leaving the ugly parenthetical for the system's own item-damage card
 * to print verbatim.
 *
 * Zero dependencies (no Foundry, no classic-level) — safe for foundry-build.js's module-load-time
 * require() and for a plain `node tests/run.js` test file.
 */
"use strict";

const SAFE_MATH_FNS = "abs|ceil|floor|max|min|round|sqrt|pow|sign|trunc";

// Arithmetic-only expression evaluator standing in for Foundry's `Roll.safeEval` (see file header).
// Throws on anything outside the allowed grammar — including a leftover `@ref` — so a caller that
// treats a throw as "leave it alone" (foldDieMath's evalOr, below) never corrupts a symbolic formula.
function safeEvalArith(expr) {
  const s = String(expr).replace(new RegExp(`(?<!\\w\\.?)\\b(${SAFE_MATH_FNS})\\s*\\(`, "g"), "Math.$1(");
  const stripped = s.replace(new RegExp(`\\bMath\\.(${SAFE_MATH_FNS})\\b`, "g"), "");
  if (!/^[0-9+\-*/%().,\s]*$/.test(stripped)) throw new Error(`safeEvalArith refused: ${expr}`);
  const v = Function(`"use strict"; return (${s});`)();
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`safeEvalArith non-numeric: ${expr}`);
  return v;
}

// Behaviourally identical to the engine's `edhaFoldDieMath` (register-skills.js) modulo the
// Roll.safeEval -> safeEvalArith swap described above. Keep the two in lockstep by hand; do not
// let this drift from the engine's copy without updating both plus the pinned equivalence test.
function foldDieMath(f) {
  const evalOr = (expr) => {
    try {
      const v = safeEvalArith(expr);
      return Number.isFinite(v) ? String(Math.max(1, Math.floor(v))) : null;
    } catch (e) {
      return null;
    }
  };
  let s = String(f);
  for (let i = 0; i < 4; i++) {
    const n = s
      .replace(/d\(([^()]+)\)/g, (m, expr) => { const v = evalOr(expr); return v == null ? m : `d${v}`; })
      .replace(/\(([^()]+)\)(?=d\d)/g, (m, expr) => { const v = evalOr(expr); return v == null ? m : v; });
    if (n === s) break;
    s = n;
  }
  return s;
}

module.exports = { foldDieMath, safeEvalArith };
