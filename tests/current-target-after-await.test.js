/* REGRESSION — a click handler must read `ev.currentTarget` BEFORE its first `await`
 * (bench run 23, 2026-07-28l → fix pass F).
 *
 * THE BUG. `Event.currentTarget` is only set while the event is being DISPATCHED. An `await` in an
 * async listener returns control to the browser, dispatch completes, and the browser sets
 * `currentTarget` back to null — so a read AFTER the await throws
 * `TypeError: Cannot read properties of null (reading 'dataset')`. `edhaUpkeepInvClick` captured
 * the actor uuid correctly on its first line and then re-read `ev.currentTarget.dataset.item` one
 * line later, after `await fromUuid(...)`. The handler's outer catch swallowed the TypeError into
 * a console line, so Living Image's "Pay N Investiture" button looked like a silent no-op — for
 * every user, on every click — across four bench runs.
 *
 * THE MODEL. `ev.currentTarget` here is a GETTER that returns the element while `dispatching` is
 * true and `null` afterwards, and the `fromUuid` stub flips `dispatching` to false — because
 * reaching an awaited call is exactly the moment dispatch ends. That is the browser's contract,
 * not an approximation of it.
 *
 * MUTATION-VERIFIED: restoring either `ev.currentTarget.dataset.item` read in the engine fails
 * case 1 (the resource is never charged) — checked by re-introducing it before this file landed.
 * Case 2 pins the model itself, so a stub that quietly stopped nulling could not make case 1 pass
 * vacuously.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

function upkeepTalent(costPer) {
  return {
    name: "Living Image", uuid: "Item.LivingImage", type: "talent",
    hasEvents: () => true,
    enabledEvents: [{ handler: { type: "edha-illusion-upkeep", costPer, resource: "inv", qualifier: "COMPLEX" } }],
  };
}
function mage() {
  return {
    name: "Bench — Blue", id: "mage", uuid: "Actor.mage", type: "character",
    system: { resources: { inv: { value: 4, max: { value: 4 } } } },
    items: [], effects: [], statuses: new Set(), flags: { "edha-content": {} },
    getFlag() { return undefined; },
    async update(patch) {
      for (const [k, v] of Object.entries(patch)) {
        const parts = k.split("."); let o = this;
        for (const p of parts.slice(0, -1)) o = o[p];
        o[parts[parts.length - 1]] = v;
      }
    },
  };
}

/* An event whose `currentTarget` behaves the way a real browser's does. */
function dispatchedEvent(el) {
  const state = { dispatching: true };
  return {
    state,
    ev: { preventDefault() {}, get currentTarget() { return state.dispatching ? el : null; } },
  };
}

test("edhaUpkeepInvClick charges the resource — the dataset survives the await", async () => {
  const env = loadEngine();
  const a = mage();
  const tal = upkeepTalent(1);
  const el = { dataset: { actor: "Actor.mage", item: "Item.LivingImage" } };
  const { ev, state } = dispatchedEvent(el);

  env.game.user = { isGM: true };
  env.game.users = null;
  env.game.actors = Object.assign([a], { get: (id) => (id === a.id ? a : null) });
  const posted = [];
  env.ChatMessage = class { static create(m) { posted.push(m); } static getSpeaker() { return {}; } };
  env.fromUuid = async (uuid) => {
    state.dispatching = false;          // ⚠ awaiting is what ends dispatch — the browser nulls currentTarget here
    return uuid === "Actor.mage" ? a : uuid === "Item.LivingImage" ? tal : null;
  };

  await env.edhaUpkeepInvClick(ev);

  assert.strictEqual(a.system.resources.inv.value, 3, "1 Investiture must be charged (4 → 3)");
  assert.strictEqual(posted.length, 1, "the upkeep-paid card must post");
  assert.ok(/pays 1 Investiture/.test(posted[0].content), `card should state the payment, got: ${posted[0].content}`);
});

test("edhaUpkeepInvClick reads the COST off the document, not a default", async () => {
  const env = loadEngine();
  const a = mage();
  const el = { dataset: { actor: "Actor.mage", item: "Item.LivingImage" } };
  const { ev, state } = dispatchedEvent(el);

  env.game.user = { isGM: true };
  env.game.users = null;
  env.game.actors = Object.assign([a], { get: () => null });
  const posted = [];
  env.ChatMessage = class { static create(m) { posted.push(m); } static getSpeaker() { return {}; } };
  env.fromUuid = async (uuid) => {
    state.dispatching = false;
    return uuid === "Actor.mage" ? a : uuid === "Item.LivingImage" ? upkeepTalent(2) : null;
  };

  await env.edhaUpkeepInvClick(ev);
  assert.strictEqual(a.system.resources.inv.value, 2, "costPer 2 on the document must charge 2 (4 → 2)");
});

test("the harness models the browser: currentTarget IS null once dispatch ends", async () => {
  const el = { dataset: { actor: "Actor.mage" } };
  const { ev, state } = dispatchedEvent(el);
  assert.strictEqual(ev.currentTarget, el, "during dispatch the handler sees the element");
  state.dispatching = false;
  assert.strictEqual(ev.currentTarget, null, "after the first await it must read null — this is what made the engine throw");
  assert.throws(() => ev.currentTarget.dataset, TypeError, "and reading .dataset off it must throw TypeError");
});
