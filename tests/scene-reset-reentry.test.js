/* edhaSceneReset — the per-ACTOR re-entry claim (bench run 24, 2026-09-05; 07-27b's bug, live again).
 *
 * R-60 replaced Life's module-level `_edhaLifeClearBusy` BOOLEAN with a shared busy-set entry keyed
 * `${key}:${endedCombat.id}`. That key made the guard WEAKER, not stronger: two DIFFERENT combats
 * produce two DIFFERENT keys and never collide, and "two combats ending together" is precisely the
 * case the boolean existed for. Measured live: one `apexForm` flag on one off-canvas actor, two
 * bench combats deleted in the same tick → TWO "🌟 Apex Form ends — takes an injury" cards and TWO
 * injury Items. Unset-first/create-after does not save it, because `unsetFlag` awaits a server
 * round-trip and the second sweep reads the flag inside that window.
 *
 * The fix is a second fence at the layer the double-create actually happens on: `key:actorUuid`,
 * ACROSS combats, claimed synchronously (no `await` between `has` and `add`) and released only once
 * the winner's `extra` has settled. It sits in `edhaSceneReset`, so it protects every family's
 * `extra`, not just Life's.
 *
 * EVERY MOCK WRITE HERE YIELDS (`await sleep(0)`), because that is what a Foundry document write
 * does. Against a synchronous mock the two sweeps would never interleave and these cases would pass
 * on the broken engine.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, sleep } = require("./harness.js");

/* An actor whose flag writes are ASYNC — one macrotask, standing in for the server round-trip. */
function slowActor({ name, flags = {}, statuses = [] }) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, statuses, flags });
  const baseUnset = a.unsetFlag.bind(a);
  a.unsetFlag = async (scope, key) => { await sleep(0); return baseUnset(scope, key); };
  a.toggleStatusEffect = async (id, { active } = {}) => { await sleep(0); if (active === false) a.statuses.delete(id); };
  return a;
}

test("edhaSceneReset: two combats ending together run the create-shaped `extra` ONCE, not twice", async () => {
  const env = loadEngine();
  const bearer = slowActor({ name: "Bench Ally — Two", flags: { apexForm: { sourceName: "Apex Form" } } });
  const { undo } = stageWorld(env, { user: { isGM: true }, actors: [bearer], placeables: [], combats: [] });

  let created = 0;
  const extra = async (a) => {
    const fv = a.getFlag?.("edha-content", "apexForm");
    if (!fv) return;
    await a.unsetFlag("edha-content", "apexForm");   // unset FIRST, create after (07-27b)
    await sleep(0);                                   // the injury round-trip
    created++;
  };

  await Promise.all([
    env.edhaSceneReset({ id: "combatA" }, { key: "life", flags: ["mutation"], extra }),
    env.edhaSceneReset({ id: "combatB" }, { key: "life", flags: ["mutation"], extra }),
  ]);

  assert.strictEqual(created, 1, "two combats deleted in the same tick must mint ONE injury, not two");
  assert.strictEqual(bearer.getFlag("edha-content", "apexForm"), undefined, "and the flag is still cleared");
  undo();
});

test("edhaClearLifeState: the real Life family mints ONE injury and ONE card across two combat ends", async () => {
  const env = loadEngine();
  const bearer = slowActor({ name: "Bench Ally — Two", flags: { apexForm: { sourceName: "Apex Form" }, lifeRegen: 2 } });
  const { undo } = stageWorld(env, { user: { isGM: true }, actors: [bearer], placeables: [], combats: [] });

  let injuries = 0;
  const cards = [];
  const priorInjury = env.edhaAddInjury, priorChat = env.ChatMessage;
  env.edhaAddInjury = async () => { await sleep(0); injuries++; return "Slowed"; };
  env.ChatMessage = class { static create(d) { cards.push(String(d?.content ?? "")); } static getSpeaker() { return {}; } };
  try {
    await Promise.all([env.edhaClearLifeState({ id: "combatA" }), env.edhaClearLifeState({ id: "combatB" })]);
  } finally { env.edhaAddInjury = priorInjury; env.ChatMessage = priorChat; }

  assert.strictEqual(injuries, 1, "TWO injury Items is the exact defect bench run 24 measured");
  assert.strictEqual(cards.filter((c) => c.includes("ends —")).length, 1, "and exactly ONE 'Apex Form ends' card");
  assert.strictEqual(bearer.getFlag("edha-content", "apexForm"), undefined);
  assert.strictEqual(bearer.getFlag("edha-content", "lifeRegen"), undefined, "the flat flags still clear");
  undo();
});

test("edhaSceneReset: the per-actor claim is CROSS-combat but the whole sweep is not — combat B's own actors still reset", async () => {
  /* The fail-safe direction. `_edhaSceneResetBusy` stays combat-scoped on purpose: an actor skipped
   * by edhaStillFightingElsewhere while combat B existed must still be swept when B itself ends. A
   * "one sweep per family, full stop" guard would strand it for ever — the cost of the old boolean.
   * Sequential ends here, which is the ordinary table case. */
  const env = loadEngine();
  const inB = slowActor({ name: "Still Fighting", flags: { dieStep: 3 } });
  const idle = slowActor({ name: "Idle", flags: { dieStep: 4 } });
  const combatB = { id: "combatB", combatants: [{ actorId: inB.id, actor: inB }] };
  const st = stageWorld(env, { user: { isGM: true }, actors: [inB, idle], placeables: [], combats: [combatB] });

  await env.edhaSceneReset({ id: "combatA" }, { key: "sov", flags: ["dieStep"] });
  assert.strictEqual(inB.getFlag("edha-content", "dieStep"), 3, "R-58: combat A's end must not clobber a combatant of combat B");
  assert.strictEqual(idle.getFlag("edha-content", "dieStep"), undefined, "…while everyone else still resets");

  env.game.combats = [];                       // combat B now ends too
  await env.edhaSceneReset(combatB, { key: "sov", flags: ["dieStep"] });
  assert.strictEqual(inB.getFlag("edha-content", "dieStep"), undefined, "combat B's own end must still reach it");
  st.undo();
});

test("edhaSceneReset: a duplicate hook for the SAME combat is still dropped whole (the original busy-set)", async () => {
  const env = loadEngine();
  const a = slowActor({ name: "Bearer", flags: { charge: 1 } });
  const { undo } = stageWorld(env, { user: { isGM: true }, actors: [a], placeables: [], combats: [] });

  let ran = 0;
  const extra = async () => { await sleep(0); ran++; };
  await Promise.all([
    env.edhaSceneReset({ id: "same" }, { key: "charges", extra }),
    env.edhaSceneReset({ id: "same" }, { key: "charges", extra }),
  ]);
  assert.strictEqual(ran, 1);
  undo();
});

test("edhaSceneReset: the claim is per FAMILY — two different families sweep the same actor concurrently", async () => {
  /* Over-claiming would be its own bug: Life and Sovereignty ending together must both run. */
  const env = loadEngine();
  const a = slowActor({ name: "Bearer", flags: { apexForm: { sourceName: "Apex" }, dieStep: 3 } });
  const { undo } = stageWorld(env, { user: { isGM: true }, actors: [a], placeables: [], combats: [] });

  let life = 0, sov = 0;
  await Promise.all([
    env.edhaSceneReset({ id: "c" }, { key: "life", flags: ["apexForm"], extra: async () => { await sleep(0); life++; } }),
    env.edhaSceneReset({ id: "c" }, { key: "sov", flags: ["dieStep"], extra: async () => { await sleep(0); sov++; } }),
  ]);
  assert.strictEqual(life, 1);
  assert.strictEqual(sov, 1);
  assert.strictEqual(a.getFlag("edha-content", "apexForm"), undefined);
  assert.strictEqual(a.getFlag("edha-content", "dieStep"), undefined);
  undo();
});
