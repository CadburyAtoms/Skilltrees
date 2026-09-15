/* item 181 (R-143 (a) caveat 4, 2026-09-15) — the Dodge arm button.
 *
 * Dodge is a standard SYSTEM Reaction (SR p.34), not a talent: "spend 1 focus to add a
 * disadvantage to an enemy's attack against you. Doesn't work on area attacks or multi-target
 * attacks." This pins the one pure decision (edhaDodgeShouldApply — single-target-only, ignores
 * an area/multi-target attack), the consuming pre-roll handler end to end (applies disadvantage
 * exactly once, wraps configureDialog, consumes the arm), and the arming half's resource gate
 * (edhaArmDodge: pays once, refuses when already armed or unaffordable).
 *
 * Reversion: relax `targetActors.length !== 1` to `< 1` (or drop the check) and the
 * "multi-target attack ignores the arm" case below fails — Dodge would then apply to an area or
 * multi-target attack, which SR p.34 forbids.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor } = require("./harness.js");

function makeToken(actor) { return { actor }; }

test("edhaDodgeShouldApply: single armed target = apply; everything else leaves the arm alone", () => {
  const env = loadEngine();
  const attacker = { name: "attacker" };
  const defender = { name: "defender" };
  assert.strictEqual(env.edhaDodgeShouldApply(attacker, true, [defender], true), true,
    "a genuine single-target attack against an armed defender must apply");
  assert.strictEqual(env.edhaDodgeShouldApply(attacker, false, [defender], true), false,
    "no damage formula on the source = not an attack");
  assert.strictEqual(env.edhaDodgeShouldApply(attacker, true, [], true), false,
    "no Foundry target = nothing to key off");
  assert.strictEqual(env.edhaDodgeShouldApply(attacker, true, [defender, { name: "other" }], true), false,
    "SR p.34: an area or multi-target attack (2+ Foundry targets) ignores the arm");
  assert.strictEqual(env.edhaDodgeShouldApply(attacker, true, [defender], false), false,
    "the target is not armed");
  assert.strictEqual(env.edhaDodgeShouldApply(attacker, true, [attacker], true), false,
    "the attacker cannot be its own target");
});

test("dodgearmed is registered as a non-condition status with its own id/icon", () => {
  const env = loadEngine();
  env.CONFIG.COSMERE = { statuses: {} };
  env.CONFIG.statusEffects = [];
  assert.strictEqual(env.edhaRegisterStatuses("test"), true, "the status registry did not register");
  const fx = env.CONFIG.statusEffects.find((s) => s.id === "dodgearmed");
  assert.ok(fx, "dodgearmed is missing from CONFIG.statusEffects (token HUD / toggleStatusEffect)");
  assert.strictEqual(env.CONFIG.COSMERE.statuses.dodgearmed.condition, false,
    "an arm-and-consume marker, not a formal Condition (the predprimed/tagged/warlord shape)");
  assert.notStrictEqual(fx.img, undefined);
});

test("edhaDodgeConsumePreRoll: a single-target attack against an armed defender gets disadvantage and consumes the arm (pays once)", async () => {
  const env = loadEngine();
  const attacker = mockActor({ name: "Attacker" });
  const defender = mockActor({ name: "Defender", statuses: new Set(["dodgearmed"]) });
  defender.isOwner = true;
  defender.toggleStatusEffect = async (id, { active }) => { if (active) defender.statuses.add(id); else defender.statuses.delete(id); };
  env.game.user = { targets: new Set([makeToken(defender)]) };

  const roll = { options: {} };
  let dialogSeen = null;
  roll.configureDialog = async (data) => { dialogSeen = data; return data; };
  const config = { data: { source: { actor: attacker, system: { damage: { formula: "1d6" } } } } };

  await fireHook(env, "cosmere-rpg.preAttackRoll", roll, null, config);

  assert.strictEqual(roll.options.advantageMode, "disadvantage", "the attacker's roll must carry the STRING enum, not a number (the advantage-channel shape)");
  assert.strictEqual(roll.options._edhaDodgeArm, true, "the idempotency guard must be set");
  await roll.configureDialog({});
  assert.strictEqual(dialogSeen?.skillTest?.advantageMode, "disadvantage", "a dialog (non-fast-forward) roll must also see the seeded mode");
  assert.ok(!defender.statuses.has("dodgearmed"), "the arm is consumed — it pays once");

  // A second attack against the (now-unarmed) defender must not re-apply.
  const roll2 = { options: {} };
  const config2 = { data: { source: { actor: attacker, system: { damage: { formula: "1d6" } } } } };
  await fireHook(env, "cosmere-rpg.preAttackRoll", roll2, null, config2);
  assert.strictEqual(roll2.options.advantageMode, undefined, "a consumed arm must not affect a later attack");
});

test("edhaDodgeConsumePreRoll: a multi-target attack ignores the arm (does not apply, does not consume)", async () => {
  const env = loadEngine();
  const attacker = mockActor({ name: "Attacker2" });
  const defender = mockActor({ name: "Defender2", statuses: new Set(["dodgearmed"]) });
  defender.isOwner = true;
  defender.toggleStatusEffect = async (id, { active }) => { if (active) defender.statuses.add(id); else defender.statuses.delete(id); };
  const other = mockActor({ name: "Other2" });
  env.game.user = { targets: new Set([makeToken(defender), makeToken(other)]) };

  const roll = { options: {} };
  const config = { data: { source: { actor: attacker, system: { damage: { formula: "1d6" } } } } };
  await fireHook(env, "cosmere-rpg.preAttackRoll", roll, null, config);

  assert.strictEqual(roll.options.advantageMode, undefined, "an area/multi-target attack must not gain the disadvantage write");
  assert.ok(defender.statuses.has("dodgearmed"), "an area/multi-target attack must not consume the arm either");
});

test("edhaDodgeConsumePreRoll: a non-damaging roll (no attack) leaves the arm untouched", async () => {
  const env = loadEngine();
  const attacker = mockActor({ name: "Attacker3" });
  const defender = mockActor({ name: "Defender3", statuses: new Set(["dodgearmed"]) });
  defender.isOwner = true;
  defender.toggleStatusEffect = async (id, { active }) => { if (active) defender.statuses.add(id); else defender.statuses.delete(id); };
  env.game.user = { targets: new Set([makeToken(defender)]) };

  const roll = { options: {} };
  const config = { data: { source: { actor: attacker, system: {} } } };   // no damage formula = not an attack
  await fireHook(env, "cosmere-rpg.preSkillRoll", roll, null, config);

  assert.strictEqual(roll.options.advantageMode, undefined);
  assert.ok(defender.statuses.has("dodgearmed"));
});

test("edhaArmDodge: pays 1 Focus and arms the status once; a second click while armed is a no-op", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "PC" });
  actor.isOwner = true;
  actor.toggleStatusEffect = async (id, { active }) => { if (active) actor.statuses.add(id); else actor.statuses.delete(id); };
  actor.system.resources = { foc: { value: 2 } };

  const ok = await env.edhaArmDodge(actor);
  assert.strictEqual(ok, true);
  assert.ok(actor.statuses.has("dodgearmed"));
  assert.strictEqual(actor.system.resources.foc.value, 1, "arming pays 1 Focus under the default EDHA_DODGE_PAY_ON_ARM dial");

  const again = await env.edhaArmDodge(actor);
  assert.strictEqual(again, false, "already armed — refuse, do not re-charge");
  assert.strictEqual(actor.system.resources.foc.value, 1, "a refused re-arm must not spend a second Focus");
});

test("edhaArmDodge: refuses (no toggle) when the actor cannot afford 1 Focus", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Broke" });
  actor.isOwner = true;
  actor.toggleStatusEffect = async (id, { active }) => { if (active) actor.statuses.add(id); else actor.statuses.delete(id); };
  actor.system.resources = { foc: { value: 0 } };

  const ok = await env.edhaArmDodge(actor);
  assert.strictEqual(ok, false);
  assert.ok(!actor.statuses.has("dodgearmed"), "an unaffordable arm must not toggle the status");
});
