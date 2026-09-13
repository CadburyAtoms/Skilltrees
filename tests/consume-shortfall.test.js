/* REGRESSION — item 119 (engine half) / fix pass 11: an underfunded use must SAY so.
 * (TODO_REPO_HYGIENE #119; bench run 45's defect row; the 2026-09-13 changelog delta.)
 *
 * WHAT THE BENCH MEASURED. Run 45 drove `The Reckoning`'s Unbreakable Line, whose ability consumes
 * **3 Focus** against a pool whose `resources.foc.max.override` is **2**. `item.use()` produced
 * nothing a GM could see — no chat card, no notification they registered, no console line — and
 * the ability read exactly like a dead button. Raising the pool made the identical take work.
 *
 * ROOT CAUSE, AND WHERE THE REPORT'S MECHANISM WAS WRONG. The item proposed that `edhaConsumeCost`
 * should warn. It already did (`ui.notifications.warn` naming the need) — and it is not on this
 * path at all: `edhaConsumeCost` is the burst/takeover charger, while an adversary ability goes
 * through the SYSTEM's `use()`, which refuses with
 * `GENERIC.Warning.NotEnoughResource` → "Cannot consume, not enough of resource"
 * (cosmere-rpg 2.1.0 index.js ~L7120). That sentence names neither the actor, the item, the
 * resource nor the amount, leaves no console line, and is a toast that is gone in seconds. The
 * refusal was not missing; it was ANONYMOUS, which at the table is the same thing.
 *
 * THE FIX IS SHARED, NOT LOCAL. `edhaCostShortfalls` + `edhaShortfallText` (both pure) are the one
 * sentence BOTH refusal points speak: the new `preUseItem` announcer that precedes the system's
 * generic toast, and `edhaConsumeCost`, retrofitted onto the same wording so a GM reads the same
 * six facts either way — actor, item, resource, need, balance, gap.
 *
 * THE ANNOUNCER MUST NOT VETO. A use refused inside the engine would be one more silent no-op,
 * which is the bug this fixes. The last case fires the whole registered `preUseItem` chain and
 * asserts no registration returned `false` on the underfunded item.
 *
 * MUTATION: drop the `short` filter from `edhaCostShortfalls` and case 2 reports an affordable row
 * as short; restore `edhaConsumeCost`'s old warn and case 6 fails on the missing balance/gap.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, mockItem, stageWorld } = require("./harness.js");

/* The Reckoning's stat line as the bench found it: a Focus pool that maxes at 2, and an ability
 * that consumes 3. `have` is the current balance; `need` the ability's cost. */
function reckoning(have = 2, need = 3, extra = null) {
  const actor = mockActor({ name: "The Reckoning", id: "reckoning", uuid: "Actor.reckoning", type: "npc",
    system: { resources: { foc: { value: have, max: { value: 2, override: 2 } }, inv: { value: 0, max: { value: 3 } } } } });
  actor.isOwner = true;
  const consume = [{ type: "resource", resource: "foc", value: { min: need, max: need, actual: 0 } }];
  if (extra) consume.push(extra);
  const item = mockItem({ name: "Unbreakable Line", actor, system: { activation: { consume } } });
  return { actor, item };
}

/* Record what a GM would actually see: notification toasts and console lines. */
function watchWarnings(env) {
  const toasts = [], logs = [];
  env.ui.notifications = { warn: (m) => toasts.push(String(m)), info() {}, error() {} };
  env.console = { ...env.console, warn: (m) => logs.push(String(m)) };
  return { toasts, logs };
}

/* ---- 1-3. the pure decision ------------------------------------------------------------------ */

test("edhaCostShortfalls: only the rows the balances cannot cover, with need/have/gap", () => {
  const env = loadEngine();
  const out = env.edhaCostShortfalls(
    [{ resource: "foc", amount: 3 }, { resource: "inv", amount: 1 }],
    { foc: 2, inv: 4 });
  assert.strictEqual(out.length, 1, "the affordable Investiture row must not appear");
  assert.strictEqual(out[0].resource, "foc");
  assert.strictEqual(out[0].need, 3);
  assert.strictEqual(out[0].have, 2);
  assert.strictEqual(out[0].short, 1);
});

test("edhaCostShortfalls: an exactly-affordable row is not short, and a missing balance reads 0", () => {
  const env = loadEngine();
  assert.deepStrictEqual(env.edhaCostShortfalls([{ resource: "foc", amount: 2 }], { foc: 2 }).length, 0);
  const none = env.edhaCostShortfalls([{ resource: "foc", amount: 1 }], {});
  assert.strictEqual(none.length, 1);
  assert.strictEqual(none[0].have, 0);
  assert.strictEqual(none[0].short, 1);
  assert.strictEqual(env.edhaCostShortfalls(null, null).length, 0, "a listless item is never short");
});

test("edhaShortfallText names the actor, the item, the resource, the need, the balance and the gap", () => {
  const env = loadEngine();
  const text = env.edhaShortfallText("The Reckoning", "Unbreakable Line",
    [{ resource: "foc", need: 3, have: 2, short: 1 }]);
  for (const fragment of ["The Reckoning", "Unbreakable Line", "Focus", "needs 3", "has 2", "1 Focus short"]) {
    assert.ok(text.includes(fragment), `the sentence must carry "${fragment}": ${text}`);
  }
  assert.strictEqual(env.edhaShortfallText("x", "y", []), "", "nothing short → no sentence, so a caller can gate on it");
});

/* ---- 4-5. the announcer on the real preUseItem chain ----------------------------------------- */

async function useAnnounce({ have = 2, need = 3 } = {}) {
  const env = loadEngine();
  const seen = watchWarnings(env);
  const { actor, item } = reckoning(have, need);
  const world = stageWorld(env, {
    user: { id: "gm-1", isGM: true, targets: new Set(), character: null },
    users: Object.assign([{ id: "gm-1", isGM: true, active: true }], { activeGM: { isSelf: true } }),
    actors: [actor], placeables: [], combats: [],
  });
  try {
    const results = await fireHook(env, "cosmere-rpg.preUseItem", item);
    return { ...seen, vetoed: results.includes(false), actor };
  } finally { world.undo(); }
}

test("the bench's take: the underfunded use is announced by name, in a toast AND in the console", async () => {
  const { toasts, logs } = await useAnnounce();
  const toast = toasts.find(t => t.includes("Unbreakable Line"));
  assert.ok(toast, `a toast must name the ability: ${JSON.stringify(toasts)}`);
  assert.ok(/The Reckoning/.test(toast) && /1 Focus short/.test(toast) && /needs 3/.test(toast) && /has 2/.test(toast),
    `and the actor, resource and gap: ${toast}`);
  assert.ok(logs.some(l => /Unbreakable Line/.test(l)),
    `and a console line must survive the toast: ${JSON.stringify(logs)}`);
});

test("the announcer NEVER vetoes — a use refused here would be one more silent no-op", async () => {
  const short = await useAnnounce();
  assert.strictEqual(short.vetoed, false, "no preUseItem registration may return false on an underfunded use");
  assert.deepStrictEqual(short.actor.updates, [], "and the announcer writes nothing");
});

test("an affordable use is announced not at all", async () => {
  const { toasts, logs } = await useAnnounce({ have: 3, need: 3 });
  assert.deepStrictEqual(toasts, [], `no toast when the cost can be paid: ${JSON.stringify(toasts)}`);
  assert.deepStrictEqual(logs, [], `and no console line either: ${JSON.stringify(logs)}`);
});

/* ---- 6-7. edhaConsumeCost, retrofitted onto the same sentence -------------------------------- */

test("edhaConsumeCost refuses an underfunded cost, names the gap, and writes nothing", () => {
  const env = loadEngine();
  const seen = watchWarnings(env);
  const { actor, item } = reckoning(2, 3);
  assert.strictEqual(env.edhaConsumeCost(item), false, "an unpayable cost must refuse");
  assert.deepStrictEqual(actor.updates, [], "and must not deduct a partial payment");
  const toast = seen.toasts.join(" | ");
  assert.ok(/The Reckoning/.test(toast) && /Unbreakable Line/.test(toast) && /1 Focus short/.test(toast)
    && /needs 3/.test(toast) && /has 2/.test(toast),
    `the burst charger speaks the same sentence as the announcer: ${toast}`);
  assert.ok(seen.logs.length > 0, "and leaves a console line");
});

/* The spend TAG on this write is already pinned by tests/spend-tag.test.js; what is pinned here is
 * that the retrofit did not change what the write CONTAINS. */
test("edhaConsumeCost still pays an affordable cost, and still drops a 0-amount row", () => {
  const env = loadEngine();
  watchWarnings(env);
  const { actor, item } = reckoning(3, 3, { type: "resource", resource: "inv", value: { min: 0, max: 0, actual: 0 } });
  assert.strictEqual(env.edhaConsumeCost(item), true);
  assert.strictEqual(actor.updates.length, 1, "one update, not one per row");
  const changes = actor.updates[0];
  assert.strictEqual(changes["system.resources.foc.value"], 0, "3 Focus paid from 3");
  assert.ok(!("system.resources.inv.value" in changes), "a 0-amount row is not a cost (edhaConsumeList drops it)");
});
