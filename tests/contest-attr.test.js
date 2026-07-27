/* REGRESSION — an ATTRIBUTE contest rolled a bare d20 (bench run 9 triage; fixed 2026-07-27j).
 *
 * Run 9 swept the authored data for cosmere skill ids that do not exist and found eight talents
 * wired to `itm`/`per`/`ldr` (all dead, all fixed as DATA). Two more looked like the same defect
 * and are NOT: Concussive Yield's `skill: "spd"` and Inevitable Snare's `riderSkill: "spd"`. Their
 * cards ask for an ATTRIBUTE test — "each character tests Speed vs. your Red", "the triggering
 * target tests Speed vs. your Green" — and `spd` is this engine's own default in
 * `edhaFoeSkillVsColor`, the `edha-zone` line save, and the snare-spring resolver.
 *
 * The card was right and the ENGINE was wrong (drift has two directions). cosmere rollData keys
 * `skills` off CONFIG.COSMERE.skills and `attr` off CONFIG.COSMERE.attributes, so for `spd`:
 *   · `skills.spd.rank` is absent            → the rank term was skipped
 *   · `EDHA_SKILL_ATTR` has no `spd` row     → the attribute term was skipped
 * leaving `1d20` — the target's Speed never entered its own Speed test. Silent, like every member
 * of the dead-id family: no error, no warning, and a card that PRINTED "Speed" the whole time
 * (`edhaSkillLabel` already resolved attributes after the 07-27f label fix).
 *
 * These pins hold the decision table and the built formula. The `ath` case is the guard that
 * matters most: a real SKILL must keep both terms, so the fix cannot have turned skill contests
 * into attribute-only ones.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

/* Capture the formulas `edhaRollOpposedSkill` builds. The harness's arithmetic-only RollStub
 * cannot evaluate dice or unsubstituted `@refs`, so the helper's own try/catch would swallow the
 * result and return 0 — the formula is the observable, not the total. */
function withCapturingRoll(env, { total = 11 } = {}) {
  const seen = [];
  env.Roll = class {
    constructor(formula, data = {}) { this.formula = String(formula); this.data = data; seen.push(this.formula); }
    async evaluate() { this.total = total; return this; }
    evaluateSync() { this.total = total; return this; }
  };
  return seen;
}

const ATTR_TARGET = { getRollData: () => ({ attr: { spd: 3, str: 2, awa: 1 }, skills: { ath: { rank: 2 }, prc: { rank: 4 } } }) };

test("edhaContestAttrFor: an attribute id resolves to ITSELF (the spd bug)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaContestAttrFor("spd"), "spd");
  for (const id of ["str", "spd", "int", "wil", "awa", "pre"]) {
    assert.strictEqual(env.edhaContestAttrFor(id), id, `${id} must resolve to itself`);
  }
});

test("edhaContestAttrFor: a SKILL id still maps through EDHA_SKILL_ATTR (no regression)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaContestAttrFor("ath"), "str");
  assert.strictEqual(env.edhaContestAttrFor("prc"), "awa");
  assert.strictEqual(env.edhaContestAttrFor("dis"), "wil");
  assert.strictEqual(env.edhaContestAttrFor("lea"), "pre");
});

test("edhaContestAttrFor: an explicit attrId still wins over both", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaContestAttrFor("spd", "wil"), "wil");
  assert.strictEqual(env.edhaContestAttrFor("ath", "awa"), "awa");
});

test("edhaContestAttrFor: an unmapped skill id yields null (unchanged fail-soft)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaContestAttrFor("lor"), null);
  assert.strictEqual(env.edhaContestAttrFor(""), null);
  assert.strictEqual(env.edhaContestAttrFor(null), null);
});

test("edhaIsAttributeId prefers CONFIG when the system is loaded", () => {
  const env = loadEngine();
  env.CONFIG.COSMERE.attributes = { str: {}, spd: {}, int: {}, wil: {}, awa: {}, pre: {} };
  assert.strictEqual(env.edhaIsAttributeId("spd"), true);
  assert.strictEqual(env.edhaIsAttributeId("prc"), false);
  // A skill id must never be mistaken for an attribute even when CONFIG is absent.
  delete env.CONFIG.COSMERE.attributes;
  assert.strictEqual(env.edhaIsAttributeId("spd"), true);
  assert.strictEqual(env.edhaIsAttributeId("prc"), false);
});

test("REGRESSION: a Speed contest rolls @attr.spd, not a bare d20", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);
  await env.edhaRollOpposedSkill(ATTR_TARGET, "spd");
  assert.strictEqual(seen.length, 1, "one roll, no fallback");
  assert.ok(seen[0].includes("@attr.spd"), `Speed must be in the roll — got "${seen[0]}"`);
  assert.ok(!seen[0].includes("@skills.spd"), `spd is not a skill — got "${seen[0]}"`);
  assert.notStrictEqual(seen[0].trim(), "1d20", "the pre-fix symptom was exactly a bare 1d20");
});

test("REGRESSION: a real SKILL contest keeps BOTH its rank and its attribute", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);
  await env.edhaRollOpposedSkill(ATTR_TARGET, "ath");
  assert.ok(seen[0].includes("@skills.ath.rank"), `rank term lost — got "${seen[0]}"`);
  assert.ok(seen[0].includes("@attr.str"), `attribute term lost — got "${seen[0]}"`);
});

test("a skill the target has no rank in drops only the rank term", async () => {
  const env = loadEngine();
  const seen = withCapturingRoll(env);
  await env.edhaRollOpposedSkill(ATTR_TARGET, "dec");   // no dec rank on this target; dec → pre
  assert.ok(!seen[0].includes("@skills.dec"), `absent rank must not be referenced — got "${seen[0]}"`);
  assert.ok(!seen[0].includes("@attr.pre"), `target has no pre attribute either — got "${seen[0]}"`);
  assert.strictEqual(seen[0].trim(), "1d20");
});
