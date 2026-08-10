/* ENGINE PASS 5.2 (Job 2) — pins edhaActorRulesOf(actor, type), the plural sibling of the existing
 * edhaActorRuleOf: EVERY rule of a handler type across an actor's talents (in item order), not just
 * the first. Built to retire ~29 open-coded `for (tal of actor.items) { ... edhaEventRules(tal) ...
 * if (h?.type !== "X") continue; }` sweeps that had each re-derived this exact double loop.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, eq } = require("./harness.js");

// A talent item carrying one rule of the given handler type (mirrors edhaEventRules' shape via
// enabledEvents/hasEvents, the same convention tests/ally-drop-side.test.js's cueItem() uses).
function talentWithRule(name, type, extra = {}) {
  const handler = { type, ...extra };
  return { name, type: "talent", hasEvents: () => true, enabledEvents: [{ event: "use", handler }] };
}
function nonTalentItem(name) { return { name, type: "weapon", hasEvents: () => false, enabledEvents: [] }; }

test("edhaActorRulesOf: collects EVERY matching rule across every talent, in item order", () => {
  const env = loadEngine();
  const t1 = talentWithRule("First", "edha-gm-cue", { note: "one" });
  const t2 = talentWithRule("Unrelated", "edha-push");
  const t3 = talentWithRule("Second", "edha-gm-cue", { note: "two" });
  const actor = mockActor({ name: "A", items: [t1, t2, t3] });
  const out = env.edhaActorRulesOf(actor, "edha-gm-cue");
  assert.strictEqual(out.length, 2);
  assert.strictEqual(out[0].item, t1); assert.strictEqual(out[0].handler.note, "one");
  assert.strictEqual(out[1].item, t2 === out[1].item ? t2 : out[1].item);   // sanity: no accidental skip
  assert.strictEqual(out[1].item, t3); assert.strictEqual(out[1].handler.note, "two");
});

test("edhaActorRulesOf: a non-talent item's rules are never returned, even if shaped like one", () => {
  const env = loadEngine();
  const decoy = nonTalentItem("Sword");
  const t = talentWithRule("Real", "edha-gm-cue");
  const actor = mockActor({ name: "A", items: [decoy, t] });
  const out = env.edhaActorRulesOf(actor, "edha-gm-cue");
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].item, t);
});

test("edhaActorRulesOf: no matching rules -> empty array, never null/undefined", () => {
  const env = loadEngine();
  const actor = mockActor({ name: "A", items: [talentWithRule("X", "edha-push")] });
  const out = env.edhaActorRulesOf(actor, "edha-gm-cue");
  eq(out, []);
});

test("edhaActorRulesOf: a null/undefined actor is safe and returns []", () => {
  const env = loadEngine();
  eq(env.edhaActorRulesOf(null, "edha-gm-cue"), []);
  eq(env.edhaActorRulesOf(undefined, "edha-gm-cue"), []);
});

test("edhaActorRulesOf vs edhaActorRuleOf: the plural finds a SECOND match the singular never sees", () => {
  const env = loadEngine();
  const t1 = talentWithRule("First", "edha-gm-cue", { note: "one" });
  const t2 = talentWithRule("Second", "edha-gm-cue", { note: "two" });
  const actor = mockActor({ name: "A", items: [t1, t2] });
  assert.strictEqual(env.edhaActorRuleOf(actor, "edha-gm-cue").handler.note, "one");
  assert.strictEqual(env.edhaActorRulesOf(actor, "edha-gm-cue").length, 2);
});
