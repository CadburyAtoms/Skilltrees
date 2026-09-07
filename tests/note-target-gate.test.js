/* edhaNoteTargetGate — the TARGET-CONDITION dial on `edha-note` (item 63, R-25 (c), 2026-09-06).
 *
 * R-25's ruling: Rallying Shout's reminder prints ONLY for an ally at 0 HP or carrying Unconscious.
 * The reminder is an authored `edha-note` rule (`RouseRallying000` on Rousing Presence), so the gate
 * had to be a generic field on the handler — `whenTarget: "downed"` — read by ONE pure helper. These
 * cases pin the helper (the executor lives inside a registerItemEventHandlerType config object, so a
 * source-scoped case pins that the executor actually consults it, the resource-writes pattern).
 *
 * Every case fails under a one-line reversion:
 *   • `if (!mode) return true;`  →  `return true;`            the 32-HP case fails (card printed)
 *   • drop the `hp <= 0` term                                 the 0-HP case fails
 *   • drop the `statuses.has("unconscious")` term             the Unconscious-above-0 case fails
 *   • `if (!mode) return true;`  →  `if (!mode) return false;` the blank-field case fails
 *   • delete the executor's `edhaNoteTargetGate(` line        the source-scoped case fails
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, readEngineSource, codeOnly } = require("./harness.js");

const env = loadEngine();

const ally = (hp, statuses = []) => mockActor({ name: `Ally ${hp}`, statuses, system: { resources: { hea: { value: hp, max: 32 } } } });

test("whenTarget=downed: an ally at 32 HP (no status) gets NO card — R-25's run-11 case", () => {
  assert.strictEqual(env.edhaNoteTargetGate("downed", ally(32)), false);
});
test("whenTarget=downed: an ally at 0 HP gets the card", () => {
  assert.strictEqual(env.edhaNoteTargetGate("downed", ally(0)), true);
  assert.strictEqual(env.edhaNoteTargetGate("downed", ally(-3)), true, "below zero is still downed");
});
test("whenTarget=downed: an Unconscious ally ABOVE 0 HP gets the card — the card's FIRST clause", () => {
  assert.strictEqual(env.edhaNoteTargetGate("downed", ally(12, ["unconscious"])), true);
  assert.strictEqual(env.edhaNoteTargetGate("downed", ally(12, ["prone"])), false, "another status is not Unconscious");
});
test("a rule WITHOUT the field prints as before — blank never gates, whatever the target", () => {
  for (const blank of ["", null, undefined, "  "]) {
    assert.strictEqual(env.edhaNoteTargetGate(blank, ally(32)), true, `blank ${String(blank)} must not gate`);
    assert.strictEqual(env.edhaNoteTargetGate(blank, null), true, `blank ${String(blank)} needs no target`);
  }
});
test("whenTarget=downed with NO target is closed, never thrown", () => {
  assert.strictEqual(env.edhaNoteTargetGate("downed", null), false);
  assert.strictEqual(env.edhaNoteTargetGate("downed", undefined), false);
  assert.strictEqual(env.edhaNoteTargetGate("downed", mockActor({ name: "no hp block" })), false, "no health data = not provably downed");
});
test("an unknown mode fails OPEN — a typo in an authored field must not silence a note", () => {
  assert.strictEqual(env.edhaNoteTargetGate("bleeding", ally(32)), true);
});

test("the edha-note executor consults edhaNoteTargetGate on the R-64 victim chain, after the owns gate", () => {
  const code = codeOnly(readEngineSource());
  const start = code.indexOf('type: "edha-note"');
  assert.ok(start > 0, "the edha-note handler type is still registered under that name");
  const end = code.indexOf("api.registerItemEventHandlerType(", start + 10);
  const block = code.slice(start, end > start ? end : start + 8000);
  assert.ok(/whenTarget: new FF\.StringField\(/.test(block), "the schema declares the whenTarget field (so it is editable on the Events tab)");
  const owns = block.indexOf("edhaRuleOwnsGate(owner, this.whenOwnsTalent)");
  const gate = block.indexOf("edhaNoteTargetGate(this.whenTarget, edhaResolveVictim(event))");
  assert.ok(owns > 0 && gate > owns, "the executor gates on whenTarget via the victim chain, after the owns gate");
});

test("the authored consumer exists: RouseRallying000 carries whenTarget=downed (the dial has a user)", () => {
  const authored = require("../data/authored/heroic-envoy.json");
  const rule = authored.talents?.["Rousing Presence"]?.events?.RouseRallying000;
  assert.ok(rule, "RouseRallying000 still lives on Rousing Presence");
  assert.strictEqual(rule.handler.type, "edha-note");
  assert.strictEqual(rule.handler.whenTarget, "downed");
});
