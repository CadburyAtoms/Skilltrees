/* REGRESSION — Shockwave Slam's weapon-hit trigger surface was dead (2bA-5; found bench run 1,
 * 2026-07-26h, root-caused 2026-07-27n after surviving an entire marathon unexplained).
 *
 * `edhaDispatchOnHit` decided "does this rider only fire on the talent's OWN hit?" from
 * `!!tal.system.damage.formula` alone. That field is about the card's number and about standalone
 * use — NOT about who authored the hit. Shockwave Slam carries a formula because its card quotes a
 * COLLISION value ("collision with an obstacle deals half [Tier][Die] Impact"), so the gate read it
 * as an attack talent and `dealer.item !== tal` skipped the push on every weapon hit. The push
 * machinery was correct throughout — a DIRECT use produced "💥 Shockwave Slam — pushed 10 ft" with
 * the right direction — which is exactly why the trigger surface looked mysteriously dead.
 *
 * The gate must NOT simply be removed. Bench run 9 proved it has a legitimate consumer: Cheap Shot
 * is the only on-hit talent on Bench — Heroic carrying its own `system.damage.formula`
 * (`@scalar.damage.unarmed`) and the only one that did NOT fire on a Sidesword hit — correctly, as
 * an unarmed-strike talent whose Stunned should ride its own hit. Every other on-hit rider (all
 * `damage.formula: null`) fired. So the fix is the DISCRIMINATION, not the gate.
 *
 * These pins hold both halves of `edhaOnHitIsItemSpecific`:
 *   · the explicit `whenDealer` on the rule wins (iron rule 2b — the intent lives on the document)
 *   · the derived default is "the talent rolls its own attack" = damage formula AND skill_test
 * plus the four real shipped talents, so a future edit cannot quietly re-break either direction.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

// The four shipped talents that carry BOTH an edha-on-hit rule and a damage formula — the only
// ones the derivation can possibly affect. Values read from data/authored/ on 2026-07-27n.
const SHOCKWAVE_SLAM = { system: { activation: { type: "utility" }, damage: { formula: "floor((@tier)d(2 * @skills.red.rank + 2) / 2)" } } };
const CHEAP_SHOT     = { system: { activation: { type: "skill_test", skill: "thv" }, damage: { formula: "@scalar.damage.unarmed" } } };
const DARK_INVEST    = { system: { activation: { type: "skill_test", skill: "black" }, damage: { formula: "(@tier)d(2 * @skills.black.rank + 2)" } } };
const VOLATILE       = { system: { activation: { type: "skill_test", skill: "red" }, damage: { formula: "floor((@tier)d(2 * @skills.red.rank + 2) / 2)" } } };
// The eight riders with no damage formula at all (Sapping Hex, Startling Blow, Shattering Blow, …).
const PASSIVE_RIDER  = { system: { activation: { type: "none" }, damage: { formula: null } } };

const rule = (handler = {}) => ({ event: "edha-on-hit", handler });

test("THE BUG: Shockwave Slam is NOT item-specific — it rides any melee impact hit", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaOnHitIsItemSpecific(SHOCKWAVE_SLAM, rule({ type: "edha-push", whenDamageType: "impact" })), false,
    "a `utility` talent never rolls a to-hit test, so its damage formula cannot be the hit in question");
});

test("THE GUARD: Cheap Shot and Dark Investiture stay item-specific (their Stun/Affliction must not ride a sword)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaOnHitIsItemSpecific(CHEAP_SHOT, rule({ type: "edha-triggered-effect" })), true);
  assert.strictEqual(env.edhaOnHitIsItemSpecific(DARK_INVEST, rule({ type: "edha-triggered-effect" })), true);
});

test("riders with no damage formula were never item-specific and still are not", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaOnHitIsItemSpecific(PASSIVE_RIDER, rule({ type: "edha-triggered-effect" })), false);
});

test("`whenDealer` on the RULE wins over the derivation, both directions (iron rule 2b)", () => {
  const env = loadEngine();
  // "any" un-gates an attack-shaped talent — the lever Ben can pull on Volatile Strike with no code change.
  assert.strictEqual(env.edhaOnHitIsItemSpecific(VOLATILE, rule({ whenDealer: "any" })), false);
  assert.strictEqual(env.edhaOnHitIsItemSpecific(CHEAP_SHOT, rule({ whenDealer: "any" })), false);
  // "self" gates a rider-shaped talent.
  assert.strictEqual(env.edhaOnHitIsItemSpecific(SHOCKWAVE_SLAM, rule({ whenDealer: "self" })), true);
  assert.strictEqual(env.edhaOnHitIsItemSpecific(PASSIVE_RIDER, rule({ whenDealer: "self" })), true);
});

test("an absent / blank / unknown `whenDealer` falls back to the derivation (no silent third mode)", () => {
  const env = loadEngine();
  for (const v of [undefined, null, "", "   ", "yes", "true", 1]) {
    assert.strictEqual(env.edhaOnHitIsItemSpecific(SHOCKWAVE_SLAM, rule({ whenDealer: v })), false, `whenDealer=${JSON.stringify(v)}`);
    assert.strictEqual(env.edhaOnHitIsItemSpecific(CHEAP_SHOT, rule({ whenDealer: v })), true, `whenDealer=${JSON.stringify(v)}`);
  }
  assert.strictEqual(env.edhaOnHitIsItemSpecific(SHOCKWAVE_SLAM, rule({ whenDealer: " any " })), false, "whitespace is trimmed");
});

test("Volatile Strike is left ITEM-SPECIFIC on purpose — flipping it is Ben's ruling, not a side effect", () => {
  const env = loadEngine();
  // If this ever flips without `whenDealer` being authored on the rule, the derivation drifted.
  assert.strictEqual(env.edhaOnHitIsItemSpecific(VOLATILE, rule({ type: "edha-triggered-effect", whenDamageType: "impact" })), true);
});

test("a missing/garbage talent document never throws (the dispatcher must not die on one bad item)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaOnHitIsItemSpecific(undefined, undefined), false);
  assert.strictEqual(env.edhaOnHitIsItemSpecific({}, {}), false);
  assert.strictEqual(env.edhaOnHitIsItemSpecific({ system: {} }, { handler: {} }), false);
});

/* The authored data must keep matching the shapes pinned above — a re-extract that changed
 * Shockwave Slam's activation would otherwise silently un-fix the bug while these pins stayed green. */
test("the pinned shapes still match data/authored (extract drift guard)", () => {
  const fs = require("fs"), path = require("path");
  const root = path.join(__dirname, "..", "data", "authored");
  const red = JSON.parse(fs.readFileSync(path.join(root, "leyline-red.json"), "utf8")).talents;
  const agent = JSON.parse(fs.readFileSync(path.join(root, "heroic-agent.json"), "utf8")).talents;
  const black = JSON.parse(fs.readFileSync(path.join(root, "leyline-black.json"), "utf8")).talents;

  assert.strictEqual(red["Shockwave Slam"].activation.type, "utility");
  assert.ok(red["Shockwave Slam"].damage.formula, "Shockwave Slam still carries the collision formula");
  assert.strictEqual(agent["Cheap Shot"].activation.type, "skill_test");
  assert.strictEqual(black["Dark Investiture"].activation.type, "skill_test");
  assert.strictEqual(red["Volatile Strike"].activation.type, "skill_test");

  const env = loadEngine();
  const shape = (t) => ({ system: { activation: t.activation, damage: t.damage } });
  assert.strictEqual(env.edhaOnHitIsItemSpecific(shape(red["Shockwave Slam"]), rule({ type: "edha-push" })), false);
  assert.strictEqual(env.edhaOnHitIsItemSpecific(shape(agent["Cheap Shot"]), rule({ type: "edha-triggered-effect" })), true);
});
