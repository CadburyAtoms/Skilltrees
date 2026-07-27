/* The ADVANTAGE-CHANNEL family (2026-07-27l) — the wrong SHAPE written into a system channel.
 *
 * THE FAMILY. `AdvantageMode` in the cosmere system is a STRING enum (index.js L262-267):
 *
 *     AdvantageMode = { None: "none", Advantage: "advantage", Disadvantage: "disadvantage" }
 *
 * and `D20Roll.hasAdvantage` is literally `this.options.advantageMode === AdvantageMode.Advantage`.
 * Write the NUMBER 1 and `configureModifiers()` takes its else-branch — `d20.number = 1` — so the
 * roll is a plain `1d20`. Nothing throws, nothing warns, and the roll's own options still *read*
 * `advantageMode: 1`, so a console probe sees "advantage is set" and the dice disagree.
 *
 * There are TWO halves, and a site that does only one is still broken:
 *   1. the VALUE — the string, not a number, not a CONFIG index;
 *   2. the DIALOG — `d20Roll` fires `preRoll` BEFORE `roll.configureDialog(...)`, and
 *      configureDialog ends with `this.options.advantageMode = result.advantageMode` (index.js
 *      L3903). On any non-fast-forward roll the dialog therefore OVERWRITES whatever pre-roll set,
 *      unless the site wraps `configureDialog` to pre-seed `data.skillTest.advantageMode`.
 *
 * TWO instances shipped, and NEITHER ever worked in its life:
 *   · the retired `edhaStanceAdvPreRoll` — stance skill advantage, both halves wrong;
 *   · `edhaQuarryAdvPreRoll` (07-27l) — bench run 10: four attacks on a correctly-marked quarry all
 *     rolled `1d20 + 4`, never `2d20kh`, with `advantageMode: 1` visible on the roll object.
 *
 * `scripts/lint-refs.js` pass 13 is the gate. THIS file is the ledger that fires even if the pass is
 * disabled or edited: every advantage-channel write in the engine, checked in TEXT, plus the two
 * fixed instances held fixed.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO = path.join(__dirname, "..");
const ENGINE = path.join(REPO, "module-src", "scripts", "register-skills.js");
const engine = fs.readFileSync(ENGINE, "utf8");

/* Comment- and template-free engine text. The file's own prose quotes `= 1` while EXPLAINING the
 * bug, so a ledger assertion over the raw source would fail on its own documentation. */
function codeOnly(src) {
  let out = "";
  for (let i = 0; i < src.length; ) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      out += c; i++;
      for (; i < src.length; i++) { out += src[i]; if (src[i] === "\\") { out += src[++i] ?? ""; continue; } if (src[i] === c) { i++; break; } }
      continue;
    }
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; continue; }
    out += c; i++;
  }
  return out;
}
const code = codeOnly(engine);
const codeLines = code.split("\n");

/* Every `<something>.advantageMode = <rhs>` ASSIGNMENT in engine code, with its 1-based line.
 * The lookarounds matter: `advantageMode === "disadvantage"` is a READ (the Apex Predator guard),
 * and a scanner that counts it as a write fails on correct code. */
const ASSIGN = /\.(advantageMode|advantageModePlot)\s*(?<![=!<>+\-*/&|?])=(?!=)\s*([^;]+?)\s*;/g;
const WRITES = [];
for (let i = 0; i < codeLines.length; i++) {
  for (const m of codeLines[i].matchAll(ASSIGN)) {
    WRITES.push({ line: i + 1, field: m[1], rhs: m[2].trim(), text: codeLines[i] });
  }
}

/* The enclosing top-level function body for a code line. Every advantage site in this engine is a
 * `function edha…(` at column 0 closed by a `}` at column 0, so scoping the dialog-wrapper check to
 * the FUNCTION (rather than to N following lines) is both exact and immune to a site being
 * reordered or gaining a line. */
function enclosingFn(line) {
  let start = -1;
  for (let i = line - 1; i >= 0; i--) if (/^function\s+\w+\s*\(/.test(codeLines[i])) { start = i; break; }
  if (start < 0) return null;
  let end = codeLines.length - 1;
  for (let i = start + 1; i < codeLines.length; i++) if (/^\}/.test(codeLines[i])) { end = i; break; }
  return { name: codeLines[start].match(/^function\s+(\w+)/)[1], body: codeLines.slice(start, end + 1).join("\n"), start, end };
}

const LEGAL = new Set(['"advantage"', '"disadvantage"', '"none"', "'advantage'", "'disadvantage'", "'none'"]);
const IDENT = /^[A-Za-z_$][\w$]*$/;   // a variable (mode / m) — its own value is checked below

test("the engine writes the advantage channel at all (the scanner still finds the sites)", () => {
  assert.ok(WRITES.length >= 16, `expected 16+ advantageMode writes in engine code, found ${WRITES.length} — ` +
    `the scanner rotted, or the sites moved; fix this test before trusting a green run`);
});

test("every advantage-channel write is a STRING enum value, never a number", () => {
  for (const w of WRITES) {
    if (LEGAL.has(w.rhs) || IDENT.test(w.rhs)) continue;
    assert.fail(`register-skills.js:${w.line} writes ${w.field} = ${w.rhs} — AdvantageMode is the ` +
      `STRING enum {none|advantage|disadvantage}; anything else reads as "no advantage" and the ` +
      `roll silently stays 1d20. Line: ${w.text.trim()}`);
  }
});

test("every VARIABLE fed to the channel is narrowed to a legal string first", () => {
  // `mode` (edha-test-rider) and `m` (edha-next-test-mod) are the only indirect writers. Both must
  // be provably one of the enum values before they reach the roll, or authored data becomes an
  // unvalidated write into a system channel.
  const vars = [...new Set(WRITES.map((w) => w.rhs).filter((r) => IDENT.test(r)))];
  assert.deepStrictEqual(vars.sort(), ["m", "mode"],
    `only 'mode' and 'm' may reach the channel indirectly; found ${vars.join(", ")} — a new indirect ` +
    `writer needs its own narrowing proof here`);
  assert.ok(/const m = mod\.mode === "advantage" \? "advantage" : "disadvantage";/.test(code),
    "edha-next-test-mod's `m` must be narrowed to one of the two enum strings (it is authored data)");
  assert.ok(/if \(h\.mode && !mode\) mode = h\.mode;/.test(code),
    "edha-test-rider's `mode` comes straight off the authored rule — lint pass 13 validates the " +
    "authored values; if this line changed shape, re-check that the gate still covers it");
});

test("every advantage-channel write also wraps configureDialog (the second half)", () => {
  // A site that sets `roll.options.advantageMode` and never seeds `data.skillTest.advantageMode` is
  // the quarry bug: correct on a fast-forward roll, silently dropped on every dialog roll.
  for (const w of WRITES) {
    if (w.field === "advantageModePlot") continue;                  // plot dice have no dialog seed of their own
    if (/data\.skillTest\.advantageMode/.test(w.text)) continue;    // this IS the dialog half
    const fn = enclosingFn(w.line);
    assert.ok(fn, `register-skills.js:${w.line} writes advantageMode outside any top-level function — ` +
      `this scanner cannot scope it; move the site or teach the test`);
    assert.ok(/data\.skillTest\.advantageMode\s*=/.test(fn.body),
      `register-skills.js:${w.line} (${fn.name}) sets options.advantageMode but never wraps ` +
      `configureDialog — on any non-fast-forward roll the dialog overwrites it from data.skillTest ` +
      `(index.js L3903) and the advantage vanishes. Line: ${w.text.trim()}`);
  }
});

test("ledger: the two historic instances stay fixed", () => {
  // 1. The retired stance site must not come back in any form.
  assert.ok(!/edhaStanceAdvPreRoll/.test(code),
    "edhaStanceAdvPreRoll is retired — stance advantage is an `edha-test-rider` rule on the talent " +
    "(iron rule 2b); re-adding the hook re-adds the bug");
  // 2. Quarry advantage: the string, the wrapper, and the guard.
  const m = code.match(/function edhaQuarryAdvPreRoll\([\s\S]*?\n\}/);
  assert.ok(m, "edhaQuarryAdvPreRoll not found — if it was renamed, repoint this ledger");
  const body = m[0];
  assert.ok(/roll\.options\.advantageMode = "advantage"/.test(body),
    'quarry advantage must write the STRING "advantage" (it wrote the number 1 until 07-27l, and ' +
    "never once applied at the table)");
  assert.ok(/data\.skillTest\.advantageMode = "advantage"/.test(body),
    "quarry advantage must wrap configureDialog, or a dialog roll drops it (07-27l)");
  assert.ok(/_edhaQuarryAdv/.test(body),
    "quarry advantage must guard against a re-fired pre-roll double-wrapping configureDialog");
});

test("the plot-die channel is a BOOLEAN and stays one (the adjacent shape)", () => {
  // `get hasPlotDie() { return !!this.options.plotDie; }` — truthy, so `= 1` would work here. Pinned
  // so nobody "fixes" it into a string by analogy with the advantage channel next door.
  const plot = code.match(/roll\.options\.plotDie\s*=\s*([^;]+);/g) ?? [];
  assert.ok(plot.length >= 1, "the engine's plot-die injection site is gone — repoint this test");
  for (const p of plot) {
    assert.ok(/=\s*(true|false)\s*;/.test(p),
      `plotDie is a boolean channel (hasPlotDie is !!options.plotDie); found: ${p}`);
  }
});
