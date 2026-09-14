/* ITEM 142 (2026-09-14) — R-122 (a)'s second half: Isolating Pressure places an Omen on a target
 * that bears none, and the ONE generic dial on H3 `edha-owner-list` that lets the talent carry both
 * branches on its own document (iron rule 2b).
 *
 * THE TRAP THIS PINS. `edhaDispatchTestResult` breaks its rule loop on the first `false`, and H3's
 * `op: release` returns `false` when the creature is not on the ledger — that is the CONDITIONAL
 * idiom (`[release] → [damage]` makes the damage ride a real removal). It also means a talent
 * cannot express the other branch: order a `place` rule AFTER the release and the halt eats it in
 * exactly the case it must fire; order it BEFORE and the release shatters the entry it just placed.
 * And a naive gate does not rescue it either — a status gate that reads the LIVE set sees the world
 * the release already made, so "the target bore an Omen" is unanswerable by the time the damage rule
 * runs.
 *
 * THE DIAL. `onMissing: "continue"` (default `"halt"` = the old behaviour, untouched) keeps the
 * do-nothing and drops the halt; `whenTargetStatus` / `unlessTargetStatus` on H3 join the pair
 * `edha-triggered-effect` already had; and BOTH now resolve through `edhaTargetStatusesAt`, which
 * reads the ENTRY SNAPSHOT the dispatcher takes before the first rule of the batch runs. The
 * branches are then mutually exclusive by construction, whatever order they sit in.
 *
 * The cases below run the REAL registered executors over the REAL authored rules in
 * `data/authored/deity-chaos.json`, so a data edit that unwires either branch fails here too:
 *   1. the snapshot survives a sibling's mutation (the primitive, in isolation);
 *   2. `edhaTargetStatusesAt` falls back to the live set for any other creature / no snapshot;
 *   3. UNMARKED target → an Omen is PLACED, nothing is removed, no shatter damage;
 *   4. MARKED target → shattered as before, damage lands, nothing is placed;
 *   5. the dial's reversion: with `onMissing` back at its default the batch halts and the
 *      placement branch never runs (delete `"continue"` from IsolPressureShat and case 3 fails);
 *   6. item 143 — `edhaClearPowerState` no longer clears the GM-applied `frightened` marker.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { loadEngine, loadHandlerRegistry, mockActor, mockItem, stageWorld, captureChat, readSourceLF, eq } = require("./harness.js");

const CHAOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "authored", "deity-chaos.json"), "utf8"));
const TALENTS = CHAOS.talents || CHAOS;

/* An actor the H3 executors can actually write to: owner-side status toggles, a roll-data tier for
 * `@tier + 1`, and a record of every status flip so a test can say what was placed vs removed. */
function actor(name, { statuses = [], tier = 2 } = {}) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, statuses });
  a.isOwner = true;
  a.toggles = [];
  a.getRollData = () => ({ tier, skills: { black: { rank: 2 } }, attr: { awa: 3 } });
  a.toggleStatusEffect = async (id, { active } = {}) => {
    a.toggles.push({ id, active });
    if (active === false) a.statuses.delete(id); else a.statuses.add(id);
  };
  return a;
}

/* Bind one authored rule to its REAL registered executor. The handler config is the authored
 * object; `execute` calls the engine's own executor with `this` bound to it, exactly as Foundry's
 * DataModel-backed rule does. */
function bindRules(handlers, events) {
  const byType = new Map(handlers.map((h) => [h.type, h]));
  return Object.values(events).map((r) => {
    const cfg = { ...r.handler };
    const def = byType.get(cfg.type);
    assert.ok(def, `no registered handler for ${cfg.type}`);
    cfg.execute = (event) => def.executor.call(cfg, event);
    return { id: r.id, event: r.event, order: r.order, handler: cfg };
  });
}

/* One Isolating Pressure activation against `victim`, driven through the real dispatcher.
 * Returns the fired triggered-effects (damage / status) and the cards that were posted. */
async function activate(env, { events, owner, victim }) {
  const { handlers } = loadHandlerRegistry(env);
  const item = mockItem({ name: "Isolating Pressure", actor: owner, events: bindRules(handlers, events) });
  const fired = [];
  const cards = captureChat(env);
  const prior = {
    fire: env.edhaFireTrigger, watchers: env.edhaDispatchWatchers,
    sync: env.fromUuidSync, async_: env.fromUuid, canvas: env.canvas,
  };
  env.edhaFireTrigger = async (_owner, name, spec, ctx) => {
    fired.push({ name, kind: spec?.effect?.kind ?? spec?.kind ?? null, statusId: spec?.effect?.statusId ?? null,
      formula: spec?.effect?.formula ?? null, victim: ctx?.victim?.name ?? null });
  };
  env.edhaDispatchWatchers = async () => {};
  const known = new Map([[owner.uuid, owner], [victim.uuid, victim]]);
  env.fromUuidSync = (u) => known.get(u) ?? null;
  env.fromUuid = async (u) => known.get(u) ?? null;
  env.canvas = { ...(env.canvas || {}), scene: { id: "scene-1" } };
  const { undo } = stageWorld(env, { user: { isGM: true }, users: { activeGM: { id: "gm" } }, actors: [owner, victim] });
  try {
    const n = await env.edhaDispatchTestResult(owner, item, victim, true, {});
    return { n, fired, cards };
  } finally {
    undo();
    Object.assign(env, { edhaFireTrigger: prior.fire, edhaDispatchWatchers: prior.watchers,
      fromUuidSync: prior.sync, fromUuid: prior.async_, canvas: prior.canvas });
  }
}

/* --- 1 + 2. the primitive: the entry snapshot, and what it falls back to ----------------------- */

test("item 142: the dispatcher snapshots the target's statuses ONCE, before the first rule runs", async () => {
  const env = loadEngine();
  const owner = actor("Caster");
  const victim = actor("Bench Target", { statuses: ["omen"] });
  const seen = [];
  // Rule A strips the marker mid-batch; rule B must still be told the target HAD it.
  const rules = [
    { id: "a", event: "edha-test-success", order: 0, handler: { type: "x", execute: async (ev) => {
      seen.push({ at: "a", snap: [...(ev.options.targetStatusesAtEntry?.statuses ?? [])], live: [...victim.statuses] });
      victim.statuses.delete("omen");
    } } },
    { id: "b", event: "edha-test-success", order: 1, handler: { type: "x", execute: async (ev) => {
      seen.push({ at: "b", snap: [...(ev.options.targetStatusesAtEntry?.statuses ?? [])], live: [...victim.statuses] });
    } } },
  ];
  const item = mockItem({ name: "Snapshot Probe", actor: owner, events: rules });
  const prior = env.edhaDispatchWatchers; env.edhaDispatchWatchers = async () => {};
  const { undo } = stageWorld(env, { user: { isGM: true }, actors: [owner, victim] });
  try {
    await env.edhaDispatchTestResult(owner, item, victim, true, {});
  } finally { undo(); env.edhaDispatchWatchers = prior; }

  assert.deepStrictEqual(seen.map((s) => s.snap), [["omen"], ["omen"]],
    "the snapshot must be the statuses at dispatch ENTRY for every rule in the batch");
  assert.deepStrictEqual(seen[1].live, [],
    "sanity: the live set really was emptied by the earlier sibling — otherwise this pin proves nothing");
});

test("item 142: edhaTargetStatusesAt uses the snapshot only for the creature it was taken from", () => {
  const env = loadEngine();
  const marked = { uuid: "Actor.A", statuses: new Set() };          // live: nothing
  const other = { uuid: "Actor.B", statuses: new Set(["omen"]) };
  const ev = { options: { targetStatusesAtEntry: { uuid: "Actor.A", statuses: new Set(["omen"]) } } };

  assert.strictEqual(env.edhaTargetStatusesAt(ev, marked).has("omen"), true, "same uuid → the snapshot");
  assert.strictEqual(env.edhaTargetStatusesAt(ev, other).has("omen"), true, "different uuid → its own LIVE set");
  assert.strictEqual(env.edhaTargetStatusesAt(ev, { uuid: "Actor.C", statuses: new Set() }).has("omen"), false,
    "different uuid with nothing live → no gate passes on another creature's snapshot");
  assert.strictEqual(env.edhaTargetStatusesAt({ options: {} }, other).has("omen"), true,
    "no snapshot on the event → the live read, unchanged");
  assert.strictEqual(env.edhaTargetStatusesAt({}, null), null, "no target at all → null, and every gate skips");
});

/* --- 3 + 4. Isolating Pressure's two branches, over its REAL authored rules -------------------- */

test("item 142: Isolating Pressure on an UNMARKED target places an Omen — and removes nothing", async () => {
  const env = loadEngine();
  const owner = actor("Caster");
  const victim = actor("Unmarked Target");
  const { fired, cards } = await activate(env, { events: TALENTS["Isolating Pressure"].events, owner, victim });

  const ledger = owner.flags["edha-content"]?.lists?.omens ?? [];
  eq(ledger.map((e) => e.name), ["Unmarked Target"]);   // the placement branch must land exactly one Omen
  assert.strictEqual(victim.statuses.has("omen"), true, "the marker status must be on the creature");
  eq(victim.toggles.filter((t) => t.id === "omen"), [{ id: "omen", active: true }]);   // placed, never toggled back off — a place-then-release would show both
  eq(fired.map((f) => f.kind), ["status"]);   // only Isolated fires: no shatter damage on a target that bore no Omen
  assert.strictEqual(fired[0].statusId, "isolated");
  assert.ok(cards.some((c) => /bears your/.test(c.content) && /Unmarked Target/.test(c.content)),
    `expected a placement card, got: ${cards.map((c) => c.content).join(" | ")}`);
  assert.ok(!cards.some((c) => /is spent/.test(c.content)), "nothing was spent — no release card may be posted");
});

test("item 142: Isolating Pressure on a MARKED target still shatters and still deals the damage", async () => {
  const env = loadEngine();
  const owner = actor("Caster");
  const victim = actor("Bench Target", { statuses: ["omen"] });
  await owner.setFlag("edha-content", "lists.omens",
    [{ id: "e1", uuid: victim.uuid, name: victim.name, talent: "Entropy Strike", sceneId: "scene-1" }]);

  const { fired, cards } = await activate(env, { events: TALENTS["Isolating Pressure"].events, owner, victim });

  eq(owner.flags["edha-content"].lists.omens, []);   // the Omen must be released from the ledger
  assert.strictEqual(victim.statuses.has("omen"), false, "the marker status must be cleared");
  eq(fired.map((f) => f.kind), ["status", "damage"]);   // Isolated, then the shatter damage — the damage rule must survive its own release running first
  assert.strictEqual(fired[1].formula, TALENTS["Isolating Pressure"].events.IsolPressureDmg0.handler.formula);
  assert.ok(cards.some((c) => /is spent/.test(c.content)), "the release card must still be posted");
  assert.ok(!cards.some((c) => /bears your/.test(c.content)),
    `the placement branch must NOT also run: ${cards.map((c) => c.content).join(" | ")}`);
});

test("item 150: every Chaos Omen rule — place AND release — quotes the same @tier + 1 cap", () => {
  const offenders = [];
  for (const [name, t] of Object.entries(TALENTS)) {
    for (const [rid, r] of Object.entries((t && t.events) || {})) {
      const h = (r || {}).handler || {};
      if (h.type !== "edha-owner-list" || h.list !== "omens") continue;
      if (h.capFormula !== "@tier + 1") offenders.push(`${name}/${rid} (op ${h.op}) → ${h.capFormula ?? "<unset, defaults to @tier>"}`);
    }
  }
  assert.deepStrictEqual(offenders, [],
    "a release rule that omits capFormula prints a denominator of @tier against a live cap of @tier + 1 (bench run 47)");
});

/* --- 5. the reversion: the dial is what makes case 3 possible --------------------------------- */

test("item 142: onMissing defaults to halt — a release that finds nothing still STOPS the later rules", async () => {
  const env = loadEngine();
  const { handlers } = loadHandlerRegistry(env);
  const owner = actor("Caster");
  const victim = actor("Unmarked Target");
  const ran = [];

  const run = async (onMissing) => {
    ran.length = 0;
    const release = { type: "edha-owner-list", list: "omens", op: "release", status: "omen", target: "victim",
      ...(onMissing ? { onMissing } : {}) };
    const def = handlers.find((h) => h.type === "edha-owner-list");
    const events = [
      { id: "rel", event: "edha-test-success", order: 0,
        handler: { ...release, execute: (ev) => def.executor.call(release, ev) } },
      { id: "after", event: "edha-test-success", order: 1,
        handler: { type: "probe", execute: async () => { ran.push("after"); } } },
    ];
    const item = mockItem({ name: "Dial Probe", actor: owner, events });
    const priorW = env.edhaDispatchWatchers, priorS = env.fromUuidSync, priorC = env.canvas;
    captureChat(env);
    env.edhaDispatchWatchers = async () => {};
    env.fromUuidSync = () => null;
    env.canvas = { ...(env.canvas || {}), scene: { id: "scene-1" } };
    const { undo } = stageWorld(env, { user: { isGM: true }, actors: [owner, victim] });
    try { await env.edhaDispatchTestResult(owner, item, victim, true, {}); }
    finally { undo(); Object.assign(env, { edhaDispatchWatchers: priorW, fromUuidSync: priorS, canvas: priorC }); }
    return [...ran];
  };

  assert.deepStrictEqual(await run(null), [],
    "unchanged default: a release with nothing to release halts the batch (the conditional idiom)");
  assert.deepStrictEqual(await run("halt"), [], "the default written out explicitly behaves the same");
  assert.deepStrictEqual(await run("continue"), ["after"],
    "the dial: `continue` keeps the do-nothing and lets the sibling branch run (item 142)");
});

/* --- 6. item 143 — Power's scene reset stops clearing a GM-applied marker ---------------------- */

test("item 143: edhaClearPowerState's reset list no longer clears the GM-applied `frightened`", async () => {
  const env = loadEngine();
  const cleared = [];
  const prior = env.edhaSceneReset;
  env.edhaSceneReset = async (_combat, opts) => { cleared.push(opts); };
  try { await env.edhaClearPowerState(undefined); } finally { env.edhaSceneReset = prior; }

  assert.strictEqual(cleared.length, 1, "the Power reset must still run through the shared edhaSceneReset");
  const statuses = cleared[0].statuses;
  assert.ok(!statuses.includes("frightened"),
    `Frightened is a GM-applied marker no talent reads (item 135 / R-125 (a)) — Power ending combat must not undo a GM's toggle. Got: ${statuses.join(", ")}`);
  assert.ok(statuses.includes("compelled"), "Compelled stays: Kneel still applies it");
  for (const s of ["crowned", "warlord", "momentum", "fury", "unstoppable", "mantled"]) {
    assert.ok(statuses.includes(s), `${s} is one of Power's own arming markers and must still be swept`);
  }

  const registry = readSourceLF(path.join("module-src", "scripts", "engine", "01-shared-core.js"));
  assert.ok(/frightened:\s*\{[^}]*\}/.test(registry),
    "the status stays REGISTERED — it is still a marker a GM may apply by hand, just not Power's to reset");
});
