/* REGRESSION — the Chaos scene-end sweep's dead halves (bench run 6, 2026-07-27c; FINAL attempt).
 *
 * The 07-27b sweep's canvas-statuses half ran at the table while `lists.omens` survived raw and
 * the OFF-CANVAS bearer kept omen + markedBy. Mechanism: it was the only deleteCombat clear whose
 * per-actor awaits were UNGUARDED (Death wraps every toggle/unset individually) — all ~17 scene
 * clears launch concurrently off one deleteCombat, and a single rejection (the proven shape:
 * toggleStatusEffect's deleteEmbeddedDocuments throwing on an AE a concurrent sweep already
 * deleted) aborted everything after it via the outer catch: the rest of the canvas loop, the
 * whole directory loop, and the ledger unset.
 *
 * This case drives the REAL edhaClearChaosState through that exact shape: a canvas bearer whose
 * status toggle REJECTS mid-sweep. The fixed sweep must still (1) unset the owner's omens ledger
 * — now ordered FIRST — and (2) sweep the off-canvas directory bearer. Reverting either the
 * per-call guards or the ledger-first ordering makes this fail exactly like the bench did.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

function makeActor({ name, type = "npc", statuses = [], flags = {}, rejectToggle = false }) {
  const a = {
    name, type, id: name, uuid: `Actor.${name}`,
    statuses: new Set(statuses),
    flags: { "edha-content": flags },
    toggles: [], unsets: [],
    getFlag(scope, key) {
      let v = this.flags[scope];
      for (const k of String(key).split(".")) { if (v == null) return undefined; v = v[k]; }
      return v;
    },
    async unsetFlag(scope, key) {
      this.unsets.push(key);
      const parts = String(key).split("."); let o = this.flags[scope];
      for (const k of parts.slice(0, -1)) { if (o == null) return; o = o[k]; }
      if (o) delete o[parts[parts.length - 1]];
    },
    async toggleStatusEffect(id, { active } = {}) {
      if (rejectToggle) throw new Error(`concurrent sweep already deleted the ${id} AE`);
      this.toggles.push({ id, active });
      if (active === false) this.statuses.delete(id);
    },
  };
  return a;
}

test("edhaClearChaosState: one bearer's rejecting toggle no longer starves the ledger or the off-canvas bearer", async () => {
  const env = loadEngine();
  const owner = makeActor({ name: "Chaos Owner", type: "character", flags: { lists: { omens: [{ id: "o1" }, { id: "o2" }] } } });
  // Canvas bearer whose omen-AE delete REJECTS (the concurrent-sweep double-delete shape).
  const canvasBearer = makeActor({ name: "Canvas Bearer", statuses: ["omen"], flags: { markedBy: { omen: { actorId: "Chaos Owner" } } }, rejectToggle: true });
  // Off-canvas bearer — the directory half that never ran at the bench.
  const offCanvas = makeActor({ name: "Offcanvas Bearer", statuses: ["omen"], flags: { markedBy: { omen: { actorId: "Chaos Owner" } } } });
  env.game.user = { isGM: true };
  env.game.actors = [owner, canvasBearer, offCanvas];
  env.game.actors.filter = Array.prototype.filter;
  env.canvas.tokens.placeables = [{ actor: canvasBearer }];

  await env.edhaClearChaosState();

  // (1) The owner's ledger is unset — the run-6 surviving half, now ordered first.
  assert.strictEqual(owner.getFlag("edha-content", "lists.omens"), undefined, "lists.omens must be unset");
  // (2) The off-canvas bearer is swept despite the earlier rejection.
  assert.ok(!offCanvas.statuses.has("omen"), "off-canvas bearer's omen status must be cleared");
  assert.ok(offCanvas.unsets.includes("markedBy.omen"), "off-canvas bearer's markedBy.omen must be unset");
  // (3) The rejecting bearer's markedBy STILL clears — the per-call guard isolates only the toggle.
  assert.ok(canvasBearer.unsets.includes("markedBy.omen"), "rejecting bearer's markedBy.omen must still be unset");
});

test("edhaClearChaosState: the clean path sweeps statuses, marks, and the ledger", async () => {
  const env = loadEngine();
  const owner = makeActor({ name: "Chaos Owner", type: "character", flags: { lists: { omens: [{ id: "o1" }] } } });
  const bearer = makeActor({ name: "Bearer", statuses: ["omen", "isolated"], flags: { markedBy: { omen: {}, isolated: {} } } });
  env.game.user = { isGM: true };
  env.game.actors = [owner, bearer];
  env.game.actors.filter = Array.prototype.filter;
  env.canvas.tokens.placeables = [];

  await env.edhaClearChaosState();

  assert.strictEqual(owner.getFlag("edha-content", "lists.omens"), undefined);
  assert.ok(!bearer.statuses.has("omen") && !bearer.statuses.has("isolated"));
  assert.ok(bearer.unsets.includes("markedBy.omen") && bearer.unsets.includes("markedBy.isolated"));
});
