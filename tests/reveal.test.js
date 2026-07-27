/* Unit tests for H24 `edha-reveal`'s pure half — `edhaRevealFacts` (07-25, pass 2bQ).
 *
 * Pins, in order of what would hurt most if it broke:
 *   1. `edhaGnosisRevealLines` still emits BYTE-IDENTICAL text. It was rewritten to delegate to the
 *      new helper so there is one implementation, and it is still called by Studied Mark and The
 *      Final Study — a drift there is a silent card change on talents this pass never touched.
 *   2. The `hideDefenses` subtraction, because Studied Mark deliberately withholds Cognitive and
 *      that is the ONLY thing distinguishing its card from Vital Diagnosis's.
 *   3. The below-half boundary. The retired Sharp Eye code used `<=`, so exactly half IS below
 *      half; an off-by-one here changes what a scout learns and would never throw.
 *   4. Fact order follows the AUTHORED list, not a fixed internal order — that is what lets one
 *      helper serve Vital Diagnosis's report and Sharp Eye's menu.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

// A creature whose numbers are all distinct, so "lowest" has exactly one right answer.
const creature = (over = {}) => ({
  name: "Test Subject",
  statuses: new Set(over.statuses || []),
  system: {
    resources: {
      hea: { value: 7, max: { value: 20 } },
      foc: { value: 2, max: { value: 4 } },
      inv: { value: 5, max: { value: 6 } },
      ...(over.resources || {}),
    },
    attributes: { str: { value: 4 }, spd: { value: 1 }, int: { value: 3 }, wil: { value: 2 } },
    defenses: { phy: { value: 13 }, cog: { value: 9 }, spi: { value: 11 } },
  },
});

test("edhaRevealFacts: hp / conditions / defenses render the report shape", () => {
  const out = env.edhaRevealFacts(creature(), { facts: "hp,conditions,defenses" });
  assert.strictEqual(out.length, 3);
  assert.strictEqual(out[0], "HP <strong>7/20</strong>");
  assert.strictEqual(out[1], "conditions: none");
  assert.ok(out[2].startsWith("defenses — Physical "), out[2]);
  assert.ok(out[2].includes("Cognitive"), "all three defenses shown when nothing is hidden");
  assert.ok(out[2].includes("Spiritual"), out[2]);
});

test("edhaRevealFacts: hideDefenses drops exactly the named defense (Studied Mark withholds cog)", () => {
  const shown = env.edhaRevealFacts(creature(), { facts: "defenses" })[0];
  const hidden = env.edhaRevealFacts(creature(), { facts: "defenses", hideDefenses: "cog" })[0];
  assert.ok(shown.includes("Cognitive"), "control: cog is present when not hidden");
  assert.ok(!hidden.includes("Cognitive"), "cog must be absent when hidden");
  assert.ok(hidden.includes("Physical") && hidden.includes("Spiritual"), "the other two survive");
});

test("edhaRevealFacts: lowest-attribute and lowest-defense pick the minimum, not the first", () => {
  const out = env.edhaRevealFacts(creature(), { facts: "lowest-attribute,lowest-defense" });
  assert.strictEqual(out[0], "lowest attribute <strong>spd</strong>");   // spd 1 is lowest, and is not first
  assert.strictEqual(out[1], "lowest defense <strong>cog</strong>");     // cog 9 is lowest, and is not first
});

test("edhaRevealFacts: below-half uses <=, so exactly half counts as below", () => {
  const c = creature({ resources: {
    hea: { value: 10, max: { value: 20 } },   // exactly half -> yes
    foc: { value: 3, max: { value: 4 } },     // above half   -> no
    inv: { value: 1, max: { value: 6 } },     // below half   -> yes
  } });
  const out = env.edhaRevealFacts(c, { facts: "below-half" })[0];
  assert.ok(/health: <strong>yes<\/strong>/.test(out), out);
  assert.ok(/focus: <strong>no<\/strong>/.test(out), out);
  assert.ok(/Investiture: <strong>yes<\/strong>/.test(out), out);
});

test("edhaRevealFacts: fact ORDER follows the authored list, and unknown ids are ignored", () => {
  const a = env.edhaRevealFacts(creature(), { facts: "hp,conditions" });
  const b = env.edhaRevealFacts(creature(), { facts: "conditions,hp" });
  assert.deepStrictEqual([a[0], a[1]], [b[1], b[0]], "order is the author's, not a fixed internal one");
  const c = env.edhaRevealFacts(creature(), { facts: "hp, not-a-fact ,conditions" });
  assert.strictEqual(c.length, 2, "an unrecognised fact id is skipped, not rendered as junk");
});

test("edhaRevealFacts: conditions list their labels when present", () => {
  const out = env.edhaRevealFacts(creature({ statuses: ["weakened"] }), { facts: "conditions" })[0];
  assert.ok(out.startsWith("conditions: "), out);
  assert.ok(!/none/.test(out), "a creature with a status must not read as 'none'");
});

/* --- the regression that matters: Knowledge's card text is unchanged by the refactor --- */
test("edhaGnosisRevealLines: byte-identical to the pre-refactor implementation (cog shown)", () => {
  const c = creature();
  const s = c.system;
  const hea = s.resources.hea;
  const hp = `${Number(hea.value) || 0}/${Number(hea.max.value) || 0}`;
  const conds = [];
  const legacy = `<p>${c.name} — HP <strong>${hp}</strong>; conditions: ${conds.length ? conds.join(", ") : "none"}; `
    + `defenses — Physical <strong>${env.edhaReadDefense(c, "phy") ?? "?"}</strong>, `
    + `Cognitive <strong>${env.edhaReadDefense(c, "cog") ?? "?"}</strong>, `
    + `Spiritual <strong>${env.edhaReadDefense(c, "spi") ?? "?"}</strong>. `
    + `<span style="opacity:.7">(snapshot at cast — may change.)</span></p>`;
  assert.strictEqual(env.edhaGnosisRevealLines(c, { cog: true }), legacy);
});

test("edhaGnosisRevealLines: byte-identical with cog withheld (Studied Mark's variant)", () => {
  const c = creature();
  const hea = c.system.resources.hea;
  const legacy = `<p>${c.name} — HP <strong>${Number(hea.value) || 0}/${Number(hea.max.value) || 0}</strong>; `
    + `conditions: none; `
    + `defenses — Physical <strong>${env.edhaReadDefense(c, "phy") ?? "?"}</strong>, `
    + `Spiritual <strong>${env.edhaReadDefense(c, "spi") ?? "?"}</strong>. `
    + `<span style="opacity:.7">(snapshot at cast — may change.)</span></p>`;
  assert.strictEqual(env.edhaGnosisRevealLines(c, { cog: false }), legacy);
});
