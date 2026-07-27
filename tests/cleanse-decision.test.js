/* REGRESSION — Surgical Precision's decide-point bug (bench runs 5 + 6, 2bW-15; FINAL attempt).
 *
 * The system's use() rolls the DAMAGE before the SKILL TEST for a non-attack skill_test talent
 * (system index.js ~7246), so a decider running at damageRoll time reads either NOTHING (the
 * sheet path's fail-open cleanse at PHY 45, own d20 21) or the PREVIOUS use's still-TTL-fresh
 * capture (the console path's "21 vs PHY 45" graze note under its own d20 of 25). One-behind by
 * construction — not a race.
 *
 * edhaCleanseArmMode is the pure fix pinned here: the damageRoll fire must ARM (wait for the
 * use's own test) whenever a comparison is wanted on a skill_test activation, may consume a
 * back-capture ONLY inside the attack path's ms window, and decides immediately only when there
 * is no comparison or no test to wait for. Reverting to decide-at-damageRoll makes the
 * "stale capture is NOT this use's" cases fail.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

test("edhaCleanseArmMode: the run-6 sheet path — no capture at damage time arms (never decides)", () => {
  const env = loadEngine();
  // Fresh actor, first use ever: map empty. The old code decided here (fail-open cleanse at
  // PHY 45 with an own roll of 21 still to come). The fix must WAIT for the test.
  assert.strictEqual(env.edhaCleanseArmMode({ isSkillTest: true, defId: "phy", backRoll: null, now: 10_000 }), "arm");
});

test("edhaCleanseArmMode: the run-6 console path — the PREVIOUS use's capture is not consumed", () => {
  const env = loadEngine();
  // The prior use's 21 sits in the slot, seconds old but far inside the 120 s contest TTL.
  // The old code consumed it ("21 vs PHY 45" under an own d20 of 25). The fix must ARM instead:
  // anything older than the attack path's ms window belongs to another use.
  const stale = { skill: "blue", total: 21, ts: 10_000, used: false };
  assert.strictEqual(env.edhaCleanseArmMode({ isSkillTest: true, defId: "phy", backRoll: stale, now: 18_000, wantSkill: "blue" }), "arm");
});

test("edhaCleanseArmMode: the attack path's own test (ms back-window, same skill) is consumed", () => {
  const env = loadEngine();
  const own = { skill: "blue", total: 17, ts: 10_000, used: false };
  assert.strictEqual(env.edhaCleanseArmMode({ isSkillTest: true, defId: "phy", backRoll: own, now: 10_040, wantSkill: "blue" }), "consume-back");
  // ...but not when a contest already consumed it, and not when the skill mismatches.
  assert.strictEqual(env.edhaCleanseArmMode({ isSkillTest: true, defId: "phy", backRoll: { ...own, used: true }, now: 10_040, wantSkill: "blue" }), "arm");
  assert.strictEqual(env.edhaCleanseArmMode({ isSkillTest: true, defId: "phy", backRoll: { ...own, skill: "spd" }, now: 10_040, wantSkill: "blue" }), "arm");
});

test("edhaCleanseArmMode: no comparison or no test to wait for decides immediately", () => {
  const env = loadEngine();
  // Explicitly blank def = always post (the documented rule semantics).
  assert.strictEqual(env.edhaCleanseArmMode({ isSkillTest: true, defId: "", backRoll: null, now: 0 }), "immediate");
  // A damage-only activation never rolls a test — waiting would hang the pending forever.
  assert.strictEqual(env.edhaCleanseArmMode({ isSkillTest: false, defId: "phy", backRoll: null, now: 0 }), "immediate");
});
