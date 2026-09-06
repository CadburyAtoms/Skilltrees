/* REGRESSION — R-55: the sheet's three budget chips all read SPENT / total.
 * (EDHA_RULINGS.md R-55, answered 2026-09-06 (a); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * The header strip prints three chips through ONE helper, `edhaBudgetRow(label, spent, granted)`,
 * which printed `granted - spent` — remaining/total. That reading is invisible on the Talents chip,
 * because a correctly built L1 PC has taken 2 of 4 and therefore reads "2 / 4" whichever convention
 * you use. Beside it sat "Attr pts 0 / 12" and "Skill rnks 0 / 5" — the SAME sheet, fully spent,
 * reading like an error. Ben's answer: all three say what was spent.
 *
 * The chips are built by string concatenation into `panel.innerHTML`, so the pin is on the helper's
 * output for the three real L1 numbers, plus the classes — which stay keyed on what REMAINS,
 * because that is what they colour and the ruling did not touch it. The separator is a thin space
 * (U+2009) on either side of the slash, so the expected strings carry it verbatim rather than a
 * plain "/" that would pass while the sheet rendered something else.
 *
 * Mutation: put `${rem}` back in place of `${spent}` and the first three cases fail with
 * "0 / 12" where "12 / 12" is expected.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const THIN = " ";   // the sheet's own separator is a NARROW NO-BREAK SPACE, not a plain one — " / " would pass while the chip rendered something else
const value = (html) => (html.match(/<span class="edha-budget-value">([^<]*)<\/span>/) || [])[1] ?? null;
const cls = (html) => (html.match(/class="edha-budget-row([^"]*)"/) || [])[1] ?? null;

/* The built L1 PC of the ruling, term for term: 12 attribute points spent of 12, 5 skill ranks
 * spent of 5 (the EDHA budget, not the system table's 4), 2 talents taken of 4. */
test("R-55: a built L1 PC reads 12/12, 5/5 and 2/4 — spent over total, all three", () => {
  const env = loadEngine();
  assert.strictEqual(value(env.edhaBudgetRow("Attr pts", 12, 12)), `12${THIN}/${THIN}12`);
  assert.strictEqual(value(env.edhaBudgetRow("Skill rnks", 5, 5)), `5${THIN}/${THIN}5`);
  assert.strictEqual(value(env.edhaBudgetRow("Talents", 2, 4)), `2${THIN}/${THIN}4`);
});

/* The case the OLD convention hid behind: Talents 2-of-4 reads "2 / 4" under both readings, which
 * is exactly why the strip could carry two conventions for months without anyone seeing it. A
 * LOPSIDED talent count separates them. */
test("R-55: 1 of 4 talents taken reads 1 / 4, not 3 / 4 — the case the old chip could not distinguish", () => {
  const env = loadEngine();
  assert.strictEqual(value(env.edhaBudgetRow("Talents", 1, 4)), `1${THIN}/${THIN}4`);
  assert.strictEqual(value(env.edhaBudgetRow("Talents", 3, 4)), `3${THIN}/${THIN}4`);
});

test("R-55: a FRESH sheet reads 0 spent — the other end of the flip", () => {
  const env = loadEngine();
  assert.strictEqual(value(env.edhaBudgetRow("Attr pts", 0, 12)), `0${THIN}/${THIN}12`);
});

test("R-55: the classes still describe what is LEFT (full = nothing remains, over = overspent)", () => {
  const env = loadEngine();
  assert.strictEqual(cls(env.edhaBudgetRow("Attr pts", 12, 12)), " edha-budget-full");
  assert.strictEqual(cls(env.edhaBudgetRow("Attr pts", 13, 12)), " edha-budget-over");
  assert.strictEqual(cls(env.edhaBudgetRow("Attr pts", 4, 12)), "");
});

test("R-55: the panel tooltip names the convention it now uses", () => {
  const { readEngineSource } = require("./harness.js");
  const src = readEngineSource();
  assert.ok(/panel\.title = "Budget spent \(spent/.test(src), "the tooltip still advertises remaining/total");
  assert.ok(!/Remaining budget \(remaining/.test(src), "the old tooltip text survived");
});
