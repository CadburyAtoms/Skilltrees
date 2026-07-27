/* REGRESSION — the simultaneous-harvest DISPATCH loss (bench run 5, 2026-07-27a; narrowed from
 * run 4's Remains race, whose H3 write-queue half is fixed and VERIFIED at the table).
 *
 * One Necrotic Cascade tick dropped two nested victims. V1's defeat dispatch entered at chain
 * level and was still suspended on its (queued) ledger write when V2's updateActor hook fired —
 * so V2's dispatch read the GLOBAL open-dispatch count (2) as its own causal ancestry and was
 * dropped at the door by `_edhaWatchDepth >= 2`. No ✨ card, no ledger entry, no eviction, and a
 * cap-isolation control (capFormula 5, empty ledger) reproduced it with zero cap pressure. The
 * run's guess named a `_edhaCascadeBusy` guard; no such symbol exists — the mechanism is the
 * dispatcher's depth counter conflating SIBLINGS with ANCESTRY.
 *
 * The fix is edhaWatchEntryLevel + the `chainBounded` event field: a kind whose recurrence is
 * structurally bounded (defeat — live→0 fires once per creature, so a defeat chain cannot loop)
 * CLAMPS to chain level (2) instead of being dropped; unbounded kinds keep the hard drop that
 * ends focus ping-pong loops. The dispatch loop also chain-gates on its LOCAL level, because a
 * sibling entering mid-loop mutates the shared counter.
 *
 * Case 2 reproduces the exact bench interleaving against the REAL dispatcher: a chain:false
 * "cascade" watcher whose payload launches two un-awaited nested defeat dispatches with a
 * macrotask gap (the applyDamage round-trips), and a chain:true "reaper" watcher whose payload
 * holds its dispatch open across that gap (the queued ledger write). Reverting chainBounded (or
 * the local-level gating) makes V2's harvest vanish again and the case fail. Case 3 pins that
 * UNBOUNDED events arriving in the same window are still dropped — the backstop survives.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function talent(name, rules) {
  return { type: "talent", name, uuid: `Item.${name}`, id: name,
    hasEvents: () => true, enabledEvents: rules };
}
function watcherActor(name, items) {
  return { uuid: `Actor.${name}`, id: name, name, type: "character", items,
    statuses: new Set(), getActiveTokens: () => [], getFlag: () => undefined };
}
function subject(name) {
  return { uuid: `Actor.${name}`, id: name, name, type: "npc",
    statuses: new Set(), getActiveTokens: () => [], getFlag: () => undefined };
}
const watchRule = (chain) => ({ event: "edha-watch-rule", handler: {
  type: "edha-watch", watch: "defeat", scope: "scene", payloadTarget: "actor",
  vs: "none", whenOutcome: "any", whenTotal: "any", once: "no", chain } });
const payloadRule = (execute) => ({ event: "edha-test-success", order: 0,
  handler: { type: "edha-triggered-effect", execute } });

test("edhaWatchEntryLevel: pinned decision table (enter level / drop)", () => {
  const env = loadEngine();
  // Unbounded — exactly the pre-fix behaviour: 0->1, 1->2 (chain-only), >=2 dropped.
  assert.strictEqual(env.edhaWatchEntryLevel(0, false), 1);
  assert.strictEqual(env.edhaWatchEntryLevel(1, false), 2);
  assert.strictEqual(env.edhaWatchEntryLevel(2, false), null);
  assert.strictEqual(env.edhaWatchEntryLevel(5, false), null);
  // chainBounded — clamps to chain level instead of dropping; 0/1 unchanged.
  assert.strictEqual(env.edhaWatchEntryLevel(0, true), 1);
  assert.strictEqual(env.edhaWatchEntryLevel(1, true), 2);
  assert.strictEqual(env.edhaWatchEntryLevel(2, true), 2);
  assert.strictEqual(env.edhaWatchEntryLevel(7, true), 2);
  // Garbage counts read as 0 (top-level), never as a drop.
  assert.strictEqual(env.edhaWatchEntryLevel(undefined, false), 1);
  assert.strictEqual(env.edhaWatchEntryLevel(-3, true), 1);
});

test("the bench interleaving: BOTH simultaneous nested kills harvest; the cascade does not re-fire", async () => {
  const env = loadEngine();
  const harvests = [];          // what the chain:true watcher's payload saw
  const cascadeFired = [];      // what the chain:false watcher's payload saw
  const nested = [];            // the nested dispatches' promises (hooks are not awaited by the payload)
  const evOf = (s) => ({ kind: "defeat", owner: s, victim: null, skill: null, def: null, ok: null, total: 0, chainBounded: true });
  const V0 = subject("V0"), V1 = subject("V1"), V2 = subject("V2");

  const cascade = watcherActor("CascadeOwner", [talent("Cascade", [
    watchRule(false),
    payloadRule(async ({ options }) => {
      cascadeFired.push(options.victim?.name);
      if (options.victim?.name !== "V0") return;         // the burst only rides the trigger drop
      // The burst: two nested kills in ONE tick. Each updateActor hook dispatches WITHOUT the
      // payload awaiting it, and the applyDamage round-trip separates them by a macrotask —
      // exactly the window in which V1's dispatch is still open when V2's arrives.
      nested.push(env.edhaDispatchWatchers(evOf(V1)));
      await sleep(2);
      nested.push(env.edhaDispatchWatchers(evOf(V2)));
      await sleep(2);
    }),
  ])]);
  const reaper = watcherActor("ReaperOwner", [talent("Reaper", [
    watchRule(true),
    payloadRule(async ({ options }) => {
      await sleep(8);                                    // the queued ledger write holds this dispatch OPEN
      harvests.push(options.victim?.name);
    }),
  ])]);

  env.game.actors = [cascade, reaper];
  env.edhaDropRuleIndex();
  await env.edhaDispatchWatchers(evOf(V0));              // the adversary trigger drop
  await Promise.all(nested);

  assert.deepStrictEqual(harvests.sort(), ["V0", "V1", "V2"],
    `every drop in the tick must dispatch its harvest — got [${harvests}] (V2 missing = the run-5 loss)`);
  assert.deepStrictEqual(cascadeFired, ["V0"],
    "chain:false must still skip nested kills — the cascade rides only the top-level drop");
});

test("the backstop survives: an UNBOUNDED event in the same window is still dropped", async () => {
  const env = loadEngine();
  const harvests = [];
  const nested = [];
  const evOf = (s, bounded) => ({ kind: "defeat", owner: s, victim: null, skill: null, def: null, ok: null, total: 0, ...(bounded ? { chainBounded: true } : {}) });
  const V0 = subject("V0"), V1 = subject("V1"), V2 = subject("V2");

  const cascade = watcherActor("CascadeOwner", [talent("Cascade", [
    watchRule(false),
    payloadRule(async ({ options }) => {
      if (options.victim?.name !== "V0") return;
      nested.push(env.edhaDispatchWatchers(evOf(V1, false)));   // unbounded nested events
      await sleep(2);
      nested.push(env.edhaDispatchWatchers(evOf(V2, false)));
      await sleep(2);
    }),
  ])]);
  const reaper = watcherActor("ReaperOwner", [talent("Reaper", [
    watchRule(true),
    payloadRule(async ({ options }) => { await sleep(8); harvests.push(options.victim?.name); }),
  ])]);

  env.game.actors = [cascade, reaper];
  env.edhaDropRuleIndex();
  await env.edhaDispatchWatchers(evOf(V0, true));
  await Promise.all(nested);

  // V1 entered at open-count 1 (chain level) and fired; V2 arrived at open-count 2 WITHOUT the
  // bounded declaration and was dropped — the loop-ending backstop is intact.
  assert.deepStrictEqual(harvests.sort(), ["V0", "V1"],
    `unbounded events must keep the >=2 drop — got [${harvests}]`);
});
