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
const { loadEngine } = require("./harness.js");

function makeActor({ name, type = "npc", flags = {} }) {
  return {
    name, type, id: name, uuid: `Actor.${name}`,
    statuses: new Set(), items: [], effects: [],
    flags: { "edha-content": flags },
    getFlag(scope, key) {
      let v = this.flags[scope];
      for (const k of String(key).split(".")) { if (v == null) return undefined; v = v[k]; }
      return v;
    },
    async unsetFlag(scope, key) {
      const parts = String(key).split("."); let o = this.flags[scope];
      for (const k of parts.slice(0, -1)) { if (o == null) return; o = o[k]; }
      if (o) delete o[parts[parts.length - 1]];
    },
    async setFlag() {}, async toggleStatusEffect() {}, async deleteEmbeddedDocuments() {},
    getActiveTokens: () => [], getRollData: () => ({}),
  };
}

test("deleteCombat clears tempHp on characters, directory adversaries, and token-only actors", async () => {
  const env = loadEngine();
  const pc = makeActor({ name: "Bench PC", type: "character", flags: { tempHp: { value: 2, source: "Bulwark Ground" } } });
  const adv = makeActor({ name: "Directory Adv", type: "adversary", flags: { tempHp: { value: 15, source: "Sovereign's Favor" } } });
  const tokOnly = makeActor({ name: "Unlinked Token", type: "adversary", flags: { tempHp: { value: 2, source: "Edict of the Fallen" } } });
  env.game.user = { isGM: true };
  env.game.users = null;                       // edhaDefBuffGmGate: lone GM applies
  env.game.actors = [pc, adv];
  env.game.actors.filter = Array.prototype.filter;
  env.canvas.tokens.placeables = [{ actor: tokOnly }];
  env.game.combat = null;
  env.game.scenes = Object.assign([], { current: null });   // sibling clears iterate game.scenes
  env.game.combats = Object.assign([], { active: null });

  for (const h of env.__hooks.on.filter(x => x.name === "deleteCombat")) {
    try { await h.fn({}, {}, "user"); } catch (e) { /* sibling clears may want richer stubs */ }
  }
  await new Promise((r) => setTimeout(r, 0));  // flush the void-fired unsets

  assert.strictEqual(pc.getFlag("edha-content", "tempHp"), undefined, "character tempHp must clear");
  assert.strictEqual(adv.getFlag("edha-content", "tempHp"), undefined, "directory adversary tempHp must clear");
  assert.strictEqual(tokOnly.getFlag("edha-content", "tempHp"), undefined, "token-only actor tempHp must clear");
});
