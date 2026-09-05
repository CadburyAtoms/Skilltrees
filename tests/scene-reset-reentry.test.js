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

/* An actor whose flag writes are ASYNC — one macrotask, standing in for the server round-trip.
 * `.unsets` records every key an unsetFlag was actually ISSUED for, which is what the write-volume
 * cases below count: in Foundry each of those is a full `update()` on the actor document. */
function slowActor({ name, flags = {}, statuses = [] }) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, statuses, flags });
  a.unsets = [];
  const baseUnset = a.unsetFlag.bind(a);
  a.unsetFlag = async (scope, key) => { a.unsets.push(key); await sleep(0); return baseUnset(scope, key); };
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

/* ---------------------------------------------------------------------------------------------
 * The write-volume half (bench run 24's third finding). `Document#unsetFlag` ALWAYS ends in an
 * `update()`, so R-60's directory∪canvas population made one combat end write ~40 keys to every
 * actor in the world: on a 51-actor world it left empty `lists: {}` / `markedBy: {}` on 33 actors
 * that had neither (the dotted `-=` delete creates its parent), and tripped Foundry's socket
 * limiter, which then silently ate an unrelated talent use.
 * ------------------------------------------------------------------------------------------- */

test("edhaFlagKeyPresent: only `undefined` is absent — null/false/0 are set values and must still clear", () => {
  const env = loadEngine();
  const a = mockActor({ name: "A", flags: { zero: 0, no: false, nul: null, lists: { omens: [] } } });
  assert.strictEqual(env.edhaFlagKeyPresent(a, "zero"), true);
  assert.strictEqual(env.edhaFlagKeyPresent(a, "no"), true);
  assert.strictEqual(env.edhaFlagKeyPresent(a, "nul"), true);
  assert.strictEqual(env.edhaFlagKeyPresent(a, "lists.omens"), true, "dotted keys resolve through getProperty");
  assert.strictEqual(env.edhaFlagKeyPresent(a, "lists.remains"), false, "an absent dotted key is absent");
  assert.strictEqual(env.edhaFlagKeyPresent(a, "markedBy.insight"), false, "…including one whose PARENT is absent too");
  assert.strictEqual(env.edhaFlagKeyPresent(a, "nope"), false);
});

test("edhaFlagKeyPresent: every uncertain answer is TRUE — the write still happens, never stale state", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaFlagKeyPresent(null, "x"), true);
  assert.strictEqual(env.edhaFlagKeyPresent({}, "x"), true, "no getFlag at all → cannot tell → write");
  assert.strictEqual(env.edhaFlagKeyPresent({ getFlag() { throw new Error("scope not active"); } }, "x"), true);
});

test("edhaSceneReset: an actor carrying NONE of the family's keys costs ZERO document updates", async () => {
  const env = loadEngine();
  const bystander = slowActor({ name: "Tem parinaem" });                       // no edha flags at all
  const bearer = slowActor({ name: "Bench — Blue", flags: { lists: { omens: [1] } } });
  const { undo } = stageWorld(env, { user: { isGM: true }, actors: [bystander, bearer], placeables: [], combats: [] });

  await env.edhaSceneReset({ id: "c" }, { key: "chaos", flags: ["lists.omens", "markedBy.omen", "counters", "decay"] });

  assert.deepStrictEqual(bystander.unsets, [], "33 uninvolved actors used to take ~40 updates EACH, and got empty parents for it");
  assert.deepStrictEqual(bystander.flags["edha-content"], {}, "…and no `lists: {}` / `markedBy: {}` left behind");
  assert.deepStrictEqual(bearer.unsets, ["lists.omens"], "the actor that HOLDS state is written, once, for the key it holds");
  assert.strictEqual(bearer.getFlag("edha-content", "lists.omens"), undefined);
  undo();
});

test("edhaSceneReset: skipping absent keys changes no OUTCOME — every present key still clears", async () => {
  const env = loadEngine();
  const a = slowActor({
    name: "Loaded",
    flags: { decay: 0, deathWard: false, lists: { remains: [{ id: "r" }] }, markedBy: { hexmark: null } },
    statuses: ["decaying"],
  });
  const { undo } = stageWorld(env, { user: { isGM: true }, actors: [a], placeables: [], combats: [] });

  await env.edhaSceneReset({ id: "c" }, {
    key: "death",
    flags: ["decay", "deathWard", "lists.remains", "markedBy.hexmark", "neverSet"],
    statuses: ["decaying", "harvested"],
  });

  for (const k of ["decay", "deathWard", "lists.remains", "markedBy.hexmark"]) {
    assert.strictEqual(a.getFlag("edha-content", k), undefined, `${k} must still clear — falsy is not absent`);
  }
  assert.ok(!a.unsets.includes("neverSet"), "only the absent key is skipped");
  assert.strictEqual(a.statuses.has("decaying"), false, "the status half is untouched by this change");
  undo();
});
