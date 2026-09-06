/* REGRESSION — R-6: Fault Line's dangerous-terrain Region spares the CASTER, and only the caster.
 * (EDHA_RULINGS.md R-6, answered 2026-09-06 (b); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * R-5 / item 29 fixed the LINE half: the burst catches every character in the line except the one
 * who cast it. The Region half never got the same treatment, and bench run 33 measured how wide
 * the gap was — the rectangle is laid with one end at the caster's OWN square, so both casts read
 * *"🔥 Bench — Destruction takes 8 energy from dangerous terrain"*. Not "bystanders": the caster.
 * Nobody was spared at all.
 *
 * Ben's answer is (b): spare the caster, catch everyone else including allies, so both halves of
 * the talent follow one rule. He left the HOW open — lay the rectangle a square out, or exempt the
 * caster's token from the tick. This ships the second, and the reason is the map: the rectangle
 * IS the line that was just damaged, and shifting it would make the two disagree — a creature at
 * the far end of the line would stand on no terrain, or terrain would cover ground nothing was
 * damaged on. Keeping the footprint and exempting one actor says the true thing about both: that
 * square is dangerous to everyone but the one who split it open.
 *
 * The dial is GENERIC (`exemptActorUuid` on the hazard behavior) but WIRED only from Fault Line —
 * every other hazard passes nothing and is byte-identical, because no ruling asked them to change.
 *
 * Mutation: drop the `exemptActorUuid` early return in _handleRegionEvent and the first case fails
 * with 8 damage on the caster; drop `owner.uuid` from edhaFaultLine's edhaDropHazard call and the
 * wiring case fails.
 */
"use strict";
const assert = require("assert");
const { loadEngine, stageWorld, captureChat, readEngineSource, codeOnly } = require("./harness.js");

/* The hazard tick, driven exactly as gm-gate.test.js drives the three Region traps. */
async function tick(env, { exempt = "", victimUuid = "Actor.victim" } = {}) {
  env.edhaRegisterNativeEventSystem();
  const Hazard = env.CONFIG?.RegionBehavior?.dataModels?.["edha-content.hazard"];
  assert.ok(Hazard, "the dangerous-terrain RegionBehavior registered");
  const b = new Hazard();
  b.damageFormula = "8";
  b.damageType = "energy";
  b.sourceName = "Dangerous Terrain — Bench — Destruction";
  b.exemptActorUuid = exempt;

  const applied = [];
  const actor = { name: "Victim", uuid: victimUuid, system: { resources: { hea: { value: 20 } } }, applyDamage: (hits) => applied.push(...hits) };
  const cards = captureChat(env);
  const world = stageWorld(env, { user: { isGM: true, id: "gm1" }, users: Object.assign([], { activeGM: { isSelf: true } }) });
  const priorRoll = env.Roll;
  env.Roll = class { constructor() {} async evaluate() { this.total = 8; return this; } };
  try { await b._handleRegionEvent({ data: { token: { actor } } }); }
  finally { env.Roll = priorRoll; world.undo(); }
  return { applied, cards };
}

test("R-6: the CASTER standing in their own Fault Line takes 0 — no damage, no card", async () => {
  const env = loadEngine();
  const { applied, cards } = await tick(env, { exempt: "Actor.caster", victimUuid: "Actor.caster" });
  assert.deepStrictEqual(applied, [], "the caster was burned by their own fissure");
  assert.strictEqual(cards.length, 0, "…and told about it in chat");
});

test("R-6: an ALLY in the same rectangle is still caught — the ruling spares the caster ALONE", async () => {
  const env = loadEngine();
  const { applied, cards } = await tick(env, { exempt: "Actor.caster", victimUuid: "Actor.stitchmother" });
  assert.strictEqual(applied.length, 1);
  assert.strictEqual(applied[0].amount, 8);
  assert.strictEqual(applied[0].type, "energy");
  assert.strictEqual(cards.length, 1, "the tick still announces itself");
});

test("R-6: an ENEMY is caught, and every OTHER hazard (blank exemption) is unchanged", async () => {
  const env = loadEngine();
  const enemy = await tick(env, { exempt: "Actor.caster", victimUuid: "Actor.foe" });
  assert.strictEqual(enemy.applied.length, 1);
  // The default — a Set Charge circle, Walking Ruin's trail, a Combustion zone: nobody exempt.
  const plain = await tick(env, { exempt: "", victimUuid: "Actor.caster" });
  assert.strictEqual(plain.applied.length, 1, "a blank exemption must spare nobody");
});

test("R-6: Fault Line is the one caller that fills the dial in, with the CASTER's uuid", () => {
  const code = codeOnly(readEngineSource());
  const fault = code.slice(code.indexOf("async function edhaFaultLine"));
  const call = /edhaDropHazard\(owner, scene, \{ type: "rectangle"[\s\S]*?\);/.exec(fault);
  assert.ok(call, "edhaFaultLine's hazard drop moved — re-pin it");
  assert.ok(/, null, owner\.uuid\)/.test(call[0]),
    `Fault Line no longer passes the caster as the exempt actor: ${call[0]}`);
  // …and the rectangle still starts at the caster's own centre: the footprint is the damaged line.
  assert.ok(/const ccx = cx \+ Math\.cos\(ang\) \* lenPx \/ 2/.test(fault),
    "the rectangle was moved off the line — the chosen fix was to exempt the actor, not to shift the terrain");
});

test("R-6: the exemption rides the PLAYER→GM relay too, or a player's cast would still burn them", () => {
  const code = codeOnly(readEngineSource());
  assert.ok(/action: "place-hazard-region", payload: \{[^}]*exemptActorUuid/.test(code),
    "the socket payload dropped the exemption");
  assert.ok(/edhaPlaceHazardRegionGM\(scene, owner, p\.shape, p\.baked, p\.type, p\.color, p\.label, p\.extraFlags \?\? null, p\.exemptActorUuid \?\? ""\)/.test(code),
    "the GM-side receiver ignores the relayed exemption");
});
