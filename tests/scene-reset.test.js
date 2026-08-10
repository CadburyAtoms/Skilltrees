/* R-60 / hygiene campaign pass 5.1 (2026-08-10) — edhaSceneReset, the ONE scene-reset population +
 * applier every deleteCombat clear (edhaClearCharges / …LifeState / …ChaosState / …FateState /
 * …SovState / …DeathState / …CivState / …PowerState / …CounterState / …OrderState) now shares.
 *
 * Before this pass the ten per-tree sweeps answered "who gets reset" FIVE different ways —
 * Sovereignty reset canvas tokens ONLY (an off-scene character kept `dieStep` forever), Life alone
 * reached every directory actor including adversaries/summons, and only Chaos deduped a token actor
 * against its own directory entry. edhaSceneReset standardizes on `edhaSceneActors()` — directory ∪
 * canvas tokens, deduped by uuid/id (the Chaos pattern, and the same primitive edhaWatchActors
 * already reaches for). These pins hold: (1) an actor present both as a token and a directory entry
 * is swept exactly once, (2) an off-scene directory actor IS swept (the flagship Sovereignty bug),
 * (3) edhaStillFightingElsewhere (R-58) still skips an actor fighting in a different, still-existing
 * combat, (4) one actor's rejecting flag-unset does not starve a different actor's sweep, (5) flags
 * are unset and statuses are cleared per the caller's lists.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld } = require("./harness.js");

function makeActor({ name, type = "character", statuses = [], flags = {}, failUnsetKey = null }) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type, statuses, flags });
  a.unsets = []; a.toggles = [];
  const baseUnsetFlag = a.unsetFlag.bind(a);
  a.unsetFlag = async (scope, key) => {
    a.unsets.push(key);
    if (failUnsetKey && key === failUnsetKey) throw new Error(`synthetic failure unsetting ${key}`);
    return baseUnsetFlag(scope, key);
  };
  a.toggleStatusEffect = async (id, { active } = {}) => {
    a.toggles.push({ id, active });
    if (active === false) a.statuses.delete(id);
  };
  return a;
}

test("edhaSceneReset: an actor present both as a token AND a directory entry is swept exactly ONCE", async () => {
  const env = loadEngine();
  const both = makeActor({ name: "Both", flags: { dieStep: 3 } });
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [both],
    placeables: [{ actor: both }],
  });

  await env.edhaSceneReset(undefined, { key: "dedupe-test", flags: ["dieStep"] });

  assert.strictEqual(both.unsets.filter((k) => k === "dieStep").length, 1, "dieStep must be unset exactly once, not once per population half");
  undo();
});

test("edhaSceneReset: an off-scene (directory-only) actor IS swept — the Sovereignty flagship bug", async () => {
  const env = loadEngine();
  const offScene = makeActor({ name: "Off-Scene Sovereign", flags: { dieStep: 5, dieStepOnceBy: "x" } });
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [offScene],
    placeables: [],   // no token on the canvas at all
  });

  await env.edhaSceneReset(undefined, { key: "sov-test", flags: ["dieStep", "dieStepOnceBy"], statuses: ["exalted", "diminished"] });

  assert.strictEqual(offScene.getFlag("edha-content", "dieStep"), undefined,
    "an off-scene directory actor's dieStep must now clear — token-only sweeps left this forever");
  assert.strictEqual(offScene.getFlag("edha-content", "dieStepOnceBy"), undefined);
  undo();
});

test("edhaSceneReset: edhaStillFightingElsewhere (R-58) still skips a combatant of a different, still-existing combat", async () => {
  const env = loadEngine();
  const benched = makeActor({ name: "Bench Actor", flags: { edicts: true } });
  const campaign = makeActor({ name: "Campaign Actor", flags: { edicts: true } });
  const ended = { id: "endedCombat", combatants: [{ actorId: benched.id, actor: benched }] };
  const live = { id: "liveCombat", combatants: [{ actorId: campaign.id, actor: campaign }] };
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [benched, campaign],
    placeables: [],
    combats: [ended, live],
  });

  await env.edhaSceneReset(ended, { key: "cross-combat-test", flags: ["edicts"] });

  assert.strictEqual(benched.getFlag("edha-content", "edicts"), undefined, "POSITIVE: the ended combat's own actor still clears");
  assert.strictEqual(campaign.getFlag("edha-content", "edicts"), true, "NEGATIVE: a combatant of a different LIVE combat must be left alone");
  undo();
});

test("edhaSceneReset: one actor's rejecting unsetFlag does not starve a different actor's sweep", async () => {
  const env = loadEngine();
  const rejecting = makeActor({ name: "Rejecting Actor", flags: { counters: [1] }, failUnsetKey: "counters" });
  const clean = makeActor({ name: "Clean Actor", flags: { counters: [2] } });
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [rejecting, clean],
    placeables: [],
  });

  await env.edhaSceneReset(undefined, { key: "isolation-test", flags: ["counters"] });

  assert.strictEqual(clean.getFlag("edha-content", "counters"), undefined,
    "a different actor's sweep must complete even though an earlier actor's unset rejected");
  undo();
});

test("edhaSceneReset: flags are unset and statuses are cleared per the caller's lists", async () => {
  const env = loadEngine();
  const bearer = makeActor({ name: "Bearer", statuses: ["omen", "isolated"], flags: { "lists.omens": [{ id: "o1" }] } });
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [bearer],
    placeables: [],
  });

  await env.edhaSceneReset(undefined, { key: "flags-statuses-test", flags: ["lists.omens"], statuses: ["omen", "isolated"] });

  assert.strictEqual(bearer.getFlag("edha-content", "lists.omens"), undefined);
  assert.ok(!bearer.statuses.has("omen") && !bearer.statuses.has("isolated"), "both listed statuses must clear");
  undo();
});

test("edhaSceneReset: extra(actor) runs per actor after flags/statuses", async () => {
  const env = loadEngine();
  const a = makeActor({ name: "Extra Actor", flags: { foo: 1 } });
  const seen = [];
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [a],
    placeables: [],
  });

  await env.edhaSceneReset(undefined, { key: "extra-test", flags: ["foo"], extra: async (actor) => { seen.push(actor.name); } });

  assert.deepStrictEqual(seen, ["Extra Actor"]);
  undo();
});

test("edhaSceneReset: a rejecting extra() does not prevent that actor's own flags/statuses from having been applied", async () => {
  const env = loadEngine();
  const a = makeActor({ name: "Extra Throws", flags: { foo: 1 } });
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [a],
    placeables: [],
  });

  await env.edhaSceneReset(undefined, { key: "extra-throws-test", flags: ["foo"], extra: async () => { throw new Error("boom"); } });

  assert.strictEqual(a.getFlag("edha-content", "foo"), undefined, "the flag unset (which ran before extra) must still have taken effect");
  undo();
});

test("edhaSceneReset: the busy-set refuses to overlap the SAME family+combat while a sweep is already in flight", async () => {
  const env = loadEngine();
  let resolveGate, resolveStarted;
  const gate = new Promise((res) => { resolveGate = res; });
  const started = new Promise((res) => { resolveStarted = res; });
  const slow = makeActor({ name: "Slow Actor", flags: { foo: 1 } });
  const { undo } = stageWorld(env, {
    user: { isGM: true },
    actors: [slow],
    placeables: [],
  });
  const combat = { id: "busy-combat" };
  let extraCalls = 0;
  const first = env.edhaSceneReset(combat, {
    key: "busy-test",
    flags: ["foo"],
    extra: async () => { extraCalls++; resolveStarted(); await gate; },
  });
  await started;   // deterministic: the first call has reached extra() (so it is mid-sweep, busy-set populated) before racing the second
  // Fire a second call for the SAME key + SAME combat while the first is still awaiting the gate.
  await env.edhaSceneReset(combat, { key: "busy-test", flags: ["foo"], extra: async () => { extraCalls++; } });
  assert.strictEqual(extraCalls, 1, "the overlapping second call for the same family+combat must be a no-op while the first is in flight");
  resolveGate();
  await first;
  undo();
});
