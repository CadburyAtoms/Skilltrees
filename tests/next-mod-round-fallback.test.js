/* R-85 (fix pass 9 / TODO 72, applied as the recommended default — vetoable) — an
 * `expireEndOfRound` rider granted by a NON-COMBATANT must expire against the BEARER's combat.
 *
 * WHAT THE BENCH MEASURED (run 40, driving 2bI-4c). `edha-next-test-mod` stamped
 * `mod.round = edhaCombatRoundOf(owner)` — the GRANTER's combat, which is right at the table
 * because `edhaNextTestMatches` reads the BEARER's and they are the same combat. But a granter who
 * is not in the tracker has no round, so the stamp was `round: null`, and `edhaNextModExpired`
 * requires `mod.round != null` before it will prune anything: a `null` stamp can NEVER expire. A
 * "this round" rider granted from outside the tracker therefore sat on the victim for ever.
 * Reproduced both ways: Pattern Recognition cast by a `Bench — Blue` that was not a combatant wrote
 * `{source: "Pattern Recognition", round: null, …}`; adding Blue to the tracker and re-casting wrote
 * `round: 8` and the rider then expired on schedule.
 *
 * THE FIX is one `??`: `edhaCombatRoundOf(owner) ?? edhaCombatRoundOf(target)`. A "this round"
 * rider then always means the round the victim is living in. With BOTH out of combat the stamp is
 * still null — which is honest, because there is no round to expire against.
 *
 * The executor is driven for real (the shipped config object, through the shipped registration), so
 * these cases exercise the same code path a use in Foundry does. Reversion: drop the
 * `?? edhaCombatRoundOf(target)` and case 2 fails (`round` comes back null and the rider is
 * immortal).
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, stageWorld, captureChat, withStubs } = require("./harness.js");

function handlerTypes(env) {
  const types = new Map();
  class Field { constructor(o) { Object.assign(this, o || {}); } }
  env.foundry.data.fields = new Proxy({}, { get: () => Field });
  env.cosmereRPG = { api: {
    registerItemEventType() {},
    registerItemEventHandlerType(def) { types.set(def.type, def); },
  } };
  assert.strictEqual(env.edhaRegisterNativeEventSystem(), true, "the native registration must succeed");
  return types;
}

/* Pattern Recognition's shape: a `use` rule that hands the creature the trigger resolved against a
 * `+1d6` rider good only for the rest of this round. `rounds` says which combat each side is in —
 * null = not a combatant. */
async function grant({ granterRound, bearerRound, expireEndOfRound = true }) {
  const env = loadEngine();
  captureChat(env);
  const types = handlerTypes(env);
  const owner = mockActor({ name: "Bench — Blue", id: "blue", uuid: "Actor.blue" });
  owner.isOwner = true;
  owner.getRollData = () => ({ tier: 2 });
  const victim = mockActor({ name: "Bench — Black", id: "black", uuid: "Actor.black" });
  victim.isOwner = true;
  const item = mockItem({ name: "Pattern Recognition", actor: owner,
    events: [{ event: "use", handler: { type: "edha-next-test-mod", target: "victim", formula: "1d6", expireEndOfRound } }] });
  const cfg = item.system.events[0].handler;
  const world = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } }, actors: [owner, victim] });
  try {
    await withStubs(env, { edhaCombatRoundOf: (a) => (a === owner ? granterRound : a === victim ? bearerRound : null) }, async () => {
      await types.get("edha-next-test-mod").executor.call(cfg, { item, options: { victim } });
    });
  } finally { world.undo(); }
  const list = victim.getFlag("edha-content", "nextTestMod") || [];
  assert.strictEqual(list.length, 1, "exactly one rider was written to the bearer");
  return { env, mod: list[0] };
}

/* ---- 1. The in-combat case is UNCHANGED — the granter's round still wins ---------------------- */

test("R-85: a granter who IS a combatant still stamps its own round", async () => {
  const { env, mod } = await grant({ granterRound: 8, bearerRound: 8 });
  assert.strictEqual(mod.round, 8, "the granter's combat, exactly as before");
  assert.strictEqual(env.edhaNextModExpired(mod, 8), false, "…live in round 8");
  assert.strictEqual(env.edhaNextModExpired(mod, 9), true, "…and dead in round 9");
});

test("R-85: the granter's round wins even when the bearer is in a different one", async () => {
  const { mod } = await grant({ granterRound: 3, bearerRound: 8 });
  assert.strictEqual(mod.round, 3, "the fallback is a FALLBACK — it never overrides a real granter round");
});

/* ---- 2. THE FIX — a non-combatant granter falls back to the bearer ---------------------------- */

test("R-85: a granter with no combat stamps the BEARER's round, and the rider then expires", async () => {
  const { env, mod } = await grant({ granterRound: null, bearerRound: 8 });
  assert.strictEqual(mod.round, 8, "THE FIX: bench run 40 measured null here, and a null stamp never expires");
  assert.strictEqual(env.edhaNextModExpired(mod, 8), false, "still live in the round it was granted in");
  assert.strictEqual(env.edhaNextModExpired(mod, 9), true, "…and gone once the round moves on");
});

/* ---- 3. Both out of combat — still null, and that is the honest answer ------------------------ */

test("R-85: with neither side in a combat the stamp stays null (there is no round to expire against)", async () => {
  const { env, mod } = await grant({ granterRound: null, bearerRound: null });
  assert.strictEqual(mod.round, null);
  assert.strictEqual(env.edhaNextModExpired(mod, null), false, "out of combat a stamp is inert, not expired");
});

/* ---- 4. NEGATIVE CONTROL — a rule without the dial carries no round at all -------------------- */

test("R-85: expireEndOfRound off writes no round key, in or out of combat", async () => {
  const { mod } = await grant({ granterRound: null, bearerRound: 8, expireEndOfRound: false });
  assert.ok(!("round" in mod), "no stamp is written when the talent does not say 'this round'");
});
