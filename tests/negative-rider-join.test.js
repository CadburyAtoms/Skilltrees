/* NEGATIVE NEXT-TEST RIDERS ON THE DAMAGE PATH — item 66 (2026-09-06).
 *
 * Item 49 made `edhaWrapRollDamage` fold the taken next-test riders onto the damage formula with a
 * plain `${f} + ${m.formula}` reduce, so a rider whose formula starts with a minus (Probability Net's
 * `-1d6` as an `either` rider) produced `2d6 + -1d6` — a string Foundry's parser dislikes. The d20
 * path (`edhaNextTestPreRoll`) already turned a leading minus into an explicit subtraction carrying
 * the source label (`0 - 1d6[Probability Net]`). Item 66 lifts that into ONE pure join helper,
 * `edhaJoinRiderTerm`, and routes BOTH paths through it.
 *
 * The four pins the brief names:
 *   1. a negative damage rider joins as `base - 1d6[label]`   (fails under a reversion to raw concat);
 *   2. a positive damage rider's built formula is BYTE-IDENTICAL to the pre-change string;
 *   3. the d20 path still produces its existing strings for `-1d6` and `+1d6`;
 *   4. a source scan: exactly one join helper exists, and both paths call it.
 */
"use strict";
const assert = require("assert");
const {
  loadEngine, mockActor, mockItem, withStubs, RollStub, readEngineSource, codeOnly,
} = require("./harness.js");

const env = loadEngine();

/* ---- the damage path ------------------------------------------------------------------------ */

function damageRoll(mods, baseFormula = "2d6") {
  const actor = mockActor({ name: "Ally", flags: { nextTestMod: mods } });
  actor.isOwner = true;                    // edhaSetEdhaFlag writes locally rather than relaying
  const item = mockItem({ name: "Sabre", actor, system: { damage: { formula: baseFormula, type: "keen" } } });
  const seen = [];
  const originalCall = (options) => { seen.push(options); return Promise.resolve(null); };
  env.edhaWrapRollDamage.call(item, originalCall, {});
  return { actor, seen, formula: seen[0]?.overrideFormula };
}

const PNET_DMG = { source: "Probability Net", formula: "-1d6", count: 1, appliesTo: "either", gid: "G-PNET" };
const PACK_DMG = { source: "Pack Hunting", formula: "1d6", count: 1, appliesTo: "either", gid: "G-PACK" };

// --- 1. THE DEFECT ------------------------------------------------------------------------------

test("item 66: a NEGATIVE damage rider joins as an explicit, labelled subtraction — never `base + -1d6`", () => {
  const { formula } = damageRoll([PNET_DMG]);
  assert.strictEqual(formula, "2d6 - 1d6[Probability Net]");
  assert.ok(!/\+\s*-/.test(formula), `no "+ -" anywhere in ${JSON.stringify(formula)}`);
});

// --- 2. BYTE-IDENTICAL POSITIVE ----------------------------------------------------------------

test("item 66: a POSITIVE damage rider builds the pre-change string exactly (`2d6 + 1d6`)", () => {
  // The pre-item-66 reduce, verbatim: `taken.reduce((f, m) => `${f} + ${m.formula}`, base)`.
  const before = [PACK_DMG].reduce((f, m) => `${f} + ${m.formula}`, "2d6");
  const { formula } = damageRoll([PACK_DMG]);
  assert.strictEqual(formula, before);
  assert.strictEqual(formula, "2d6 + 1d6");
});

test("item 66: several riders still SUM (item 49), each with its own sign", () => {
  const { formula } = damageRoll([PACK_DMG, PNET_DMG]);
  assert.strictEqual(formula, "2d6 + 1d6 - 1d6[Probability Net]");
});

// --- 3. THE d20 PATH IS UNCHANGED --------------------------------------------------------------

const ROLL = () => ({
  data: { skill: { id: "dec", attribute: "int" } },
  options: {},
  terms: [{ operand: 0 }],
  resetFormula() { return ""; },
  configureModifiers() {},
});
const CFG = (actor) => ({ data: { source: { actor } } });

async function d20Formulas(mod) {
  const actor = mockActor({ name: "Victim", flags: { nextTestMod: [mod] } });
  actor.isOwner = true;
  const seen = [];
  await withStubs(env, { Roll: RollStub({ capture: seen }) }, async () => {
    env.edhaNextTestPreRoll(ROLL(), null, CFG(actor));
  });
  return seen;
}

test("item 66: the d20 path still writes `0 - 1d6[label]` for a leading minus", async () => {
  const seen = await d20Formulas({ source: "Probability Net", formula: "-1d6", count: 1, gid: "G-PNET" });
  assert.deepStrictEqual(seen, ["0 - 1d6[Probability Net]"]);
});

test("item 66: the d20 path still writes `0 + …[label]` for `1d6` and for an explicit `+1d6`", async () => {
  const plain = await d20Formulas({ source: "Pack Hunting", formula: "1d6", count: 1, gid: "G-PACK" });
  assert.deepStrictEqual(plain, ["0 + 1d6[Pack Hunting]"]);
  // `+1d6` is whatever the pre-change inline expression produced from the same resolved string —
  // pinned against that expression, not a guess, so a fold-side change cannot false-fail this.
  const resolved = env.edhaFoldDieMath(env.Roll.replaceFormulaData("+1d6", {}, { missing: "0" })).trim();
  const before = resolved.startsWith("-") ? `0 - ${resolved.slice(1)}[Pack Hunting]` : `0 + ${resolved}[Pack Hunting]`;
  const plus = await d20Formulas({ source: "Pack Hunting", formula: "+1d6", count: 1, gid: "G-PACK" });
  assert.deepStrictEqual(plus, [before]);
});

// --- 4. THE HELPER IS THE ONE PLACE ------------------------------------------------------------

test("item 66: edhaJoinRiderTerm is PURE and handles the sign + label matrix", () => {
  const j = env.edhaJoinRiderTerm;
  assert.strictEqual(j("2d6", "-1d6", "Probability Net"), "2d6 - 1d6[Probability Net]");
  assert.strictEqual(j("2d6", "1d6", "Pack Hunting"), "2d6 + 1d6[Pack Hunting]");
  assert.strictEqual(j("2d6", "1d6", null), "2d6 + 1d6");
  assert.strictEqual(j("2d6", "-1d6", null), "2d6 - 1d6");
  assert.strictEqual(j("0", " -1d6 ", "X"), "0 - 1d6[X]", "whitespace around the term is trimmed");
});

test("item 66: source scan — exactly ONE join helper, and BOTH next-test paths call it", () => {
  const src = codeOnly(readEngineSource());
  const defs = src.match(/function edhaJoinRiderTerm\(/g) || [];
  assert.strictEqual(defs.length, 1, "exactly one definition of edhaJoinRiderTerm");
  const body = (name) => {
    const start = src.indexOf(`function ${name}(`);
    assert.ok(start >= 0, `${name} exists`);
    const end = src.indexOf("\nfunction ", start + 1);
    return src.slice(start, end < 0 ? undefined : end);
  };
  const dmg = body("edhaWrapRollDamage");
  const d20 = body("edhaNextTestPreRoll");
  assert.ok(dmg.includes("edhaJoinRiderTerm("), "edhaWrapRollDamage joins riders through the helper");
  assert.ok(d20.includes("edhaJoinRiderTerm("), "edhaNextTestPreRoll joins riders through the helper");
  assert.ok(!dmg.includes("`${f} + ${m.formula}`"), "the raw-concat reduce is gone from the damage path");
  assert.ok(!d20.includes("`0 - ${"), "the inline sign branch is gone from the d20 path");
});
