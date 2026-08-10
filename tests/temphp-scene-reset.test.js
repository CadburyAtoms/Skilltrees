/* REGRESSION — `tempHp` survives every scene reset (bench run 6, 2026-07-27c).
 *
 * Bulwark's {2}, Edict's {2} and Sovereign's Favor's {15} all rode through THREE combat deletes
 * on three trees while AEs, ledgers, statuses and markedBy swept clean: flags.edha-content.tempHp
 * had a getter, a setter, an absorption hook and a GM socket relay — and NO scene-end clear
 * anywhere. A stale grant silently absorbs damage next scene. Every grant surface is
 * combat/scene-scoped by its card (Death Ward and Edict of the Fallen say "for the scene"
 * outright), so the clear is mechanically determinable, not a ruling.
 *
 * This case fires the engine's REAL deleteCombat hook family (harness-recorded) and asserts the
 * flag clears on a character, a directory adversary, AND an unlinked token-only actor — the
 * grant targets the character-only generic sweep never sees. Removing the tempHp sweep fails it.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, sleep } = require("./harness.js");

function makeActor({ name, type = "npc", flags = {} }) {
  const actor = mockActor({ name, id: name, uuid: `Actor.${name}`, type, flags });
  return Object.assign(actor, {
    async toggleStatusEffect() {}, async deleteEmbeddedDocuments() {},
    getActiveTokens: () => [], getRollData: () => ({}),
  });
}

test("deleteCombat clears tempHp on characters, directory adversaries, and token-only actors", async () => {
  const env = loadEngine();
  const pc = makeActor({ name: "Bench PC", type: "character", flags: { tempHp: { value: 2, source: "Bulwark Ground" } } });
  const adv = makeActor({ name: "Directory Adv", type: "adversary", flags: { tempHp: { value: 15, source: "Sovereign's Favor" } } });
  const tokOnly = makeActor({ name: "Unlinked Token", type: "adversary", flags: { tempHp: { value: 2, source: "Edict of the Fallen" } } });
  const { undo } = stageWorld(env, {
    user: { isGM: true }, users: null,          // edhaDefBuffGmGate: lone GM applies
    actors: [pc, adv],
    placeables: [{ actor: tokOnly }],
    scenes: Object.assign([], { current: null }),   // sibling clears iterate game.scenes
    combats: Object.assign([], { active: null }),
  });
  env.game.combat = null;

  for (const h of env.__hooks.on.filter(x => x.name === "deleteCombat")) {
    try { await h.fn({}, {}, "user"); } catch (e) { /* sibling clears may want richer stubs */ }
  }
  await sleep(0);  // flush the void-fired unsets

  assert.strictEqual(pc.getFlag("edha-content", "tempHp"), undefined, "character tempHp must clear");
  assert.strictEqual(adv.getFlag("edha-content", "tempHp"), undefined, "directory adversary tempHp must clear");
  assert.strictEqual(tokOnly.getFlag("edha-content", "tempHp"), undefined, "token-only actor tempHp must clear");
  undo();
});
