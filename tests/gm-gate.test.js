/* THE ONE-APPLIER GATE, PINNED — item 12 (2026-09-06), the `primaryGmGate` ratchet 20 → 1.
 *
 * Nineteen hook bodies hand-derived the primary-GM gate as
 * `!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)` (or, in five of them,
 * as the second half alone). Every one of the nineteen performs a WORLD WRITE — an actor update, a
 * Region/Drawing/Wall write, a socket relay's apply, a chat card — which is the two-GM family from
 * bench pass 15: with Ben's `Gamemaster` and the agent's `Bench` both connected, a gate that is
 * hand-derived inconsistently double-writes.
 *
 * Migrating them was NOT a straight swap, and that is this file's real subject. The idiom was
 * serving TWO polarities:
 *
 *   • sixteen sites wanted the WHOLE gate — "am I a GM, and has no other GM claimed this?" — which
 *     is exactly `edhaDefBuffGmGate()`;
 *   • three `RegionBehavior._handleRegionEvent` bodies (Civ fortified foundation, dangerous terrain,
 *     Fate snare) checked only the SECOND half, with no `isGM` at all. That is deliberate, not an
 *     oversight: with no GM connected the trap still has to fire on the walking player's OWN client,
 *     and bolting the isGM half on would silence it — a live-behaviour change and a ruling.
 *
 * So the gate is decomposed rather than duplicated: `edhaNoOtherActiveGM()` is the primitive, and
 * `edhaDefBuffGmGate()` is `isGM &&` that. The primitive's own one-line body is the ONE occurrence
 * pass 20 still counts, the same floor `userTargets` has.
 *
 * Mutation-sensitive: re-inline the hand-derived check at either pinned hook with the polarity
 * flipped (`if (game.users?.activeGM && !game.users.activeGM.isSelf) return;` in place of
 * `if (!edhaDefBuffGmGate()) return;`) and the second-GM case below fails — a second GM writes.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { loadEngine, fireHook, stageWorld, mockActor, readEngineSource, codeOnly } = require("./harness.js");

/* The four client shapes a two-GM table actually produces, plus the GM-less one. */
const PRIMARY_GM = { user: { id: "gm-1", isGM: true }, users: { activeGM: { id: "gm-1", isSelf: true } } };
const SECOND_GM = { user: { id: "gm-2", isGM: true }, users: { activeGM: { id: "gm-1", isSelf: false } } };
const PLAYER = { user: { id: "p-1", isGM: false }, users: { activeGM: { id: "gm-1", isSelf: false } } };
const PLAYER_NO_GM = { user: { id: "p-1", isGM: false }, users: { activeGM: null } };

test("edhaDefBuffGmGate = isGM && edhaNoOtherActiveGM — the decomposition holds on every client shape", () => {
  const env = loadEngine();
  const rows = [
    [PRIMARY_GM, true, true, "the primary GM applies"],
    [SECOND_GM, false, false, "a second GM stands down — the two-GM double-write"],
    [PLAYER, false, false, "a player with a GM online defers"],
    [PLAYER_NO_GM, true, false, "GM-less: nobody has claimed it, but nobody is a GM either"],
  ];
  for (const [stage, wantPrimitive, wantGate, why] of rows) {
    const world = stageWorld(env, stage);
    try {
      assert.strictEqual(env.edhaNoOtherActiveGM(), wantPrimitive, `edhaNoOtherActiveGM — ${why}`);
      assert.strictEqual(env.edhaDefBuffGmGate(), wantGate, `edhaDefBuffGmGate — ${why}`);
      // The composition itself, not just the two truth tables side by side.
      assert.strictEqual(env.edhaDefBuffGmGate(), !!stage.user.isGM && env.edhaNoOtherActiveGM(), why);
    } finally { world.undo(); }
  }
});

/* --- migrated site 1: the deleteRegion → paired-Drawing cleanup (a scene write) ----------------- */
function mockRegionWithVisual(deletions) {
  const drawing = { id: "draw-1", getFlag: (ns, k) => (ns === "edha-content" && k === "hazardVisual" ? { regionId: "region-1" } : undefined) };
  const scene = {
    drawings: [drawing],
    deleteEmbeddedDocuments: (type, ids) => { deletions.push({ type, ids }); },
  };
  return { id: "region-1", parent: scene };
}

test("deleteRegion cleanup: ONLY the primary GM deletes the paired hazard Drawing", async () => {
  for (const [stage, want, why] of [[PRIMARY_GM, 1, "primary GM"], [SECOND_GM, 0, "second GM"], [PLAYER, 0, "player"], [PLAYER_NO_GM, 0, "GM-less player"]]) {
    const env = loadEngine();
    const deletions = [];
    const world = stageWorld(env, stage);
    try {
      await fireHook(env, "deleteRegion", mockRegionWithVisual(deletions));
      assert.strictEqual(deletions.length, want, `${why}: expected ${want} Drawing delete(s), got ${deletions.length}`);
      if (want) assert.deepStrictEqual(deletions[0], { type: "Drawing", ids: ["draw-1"] });
    } finally { world.undo(); }
  }
});

/* --- migrated site 2: the PC sight-range resync on an Awareness change (an actor write) --------- */
async function fireAwarenessChange(env) {
  const actor = mockActor({ name: "Tem parinaem", type: "character", system: { attributes: { awa: { value: 4 } } } });
  await fireHook(env, "updateActor", actor, { system: { attributes: { awa: { value: 4 } } } }, {});
  return actor.updates.filter((u) => Object.prototype.hasOwnProperty.call(u, "prototypeToken.sight.range"));
}

test("PC sight resync: ONLY the primary GM writes prototypeToken.sight.range", async () => {
  for (const [stage, want, why] of [[PRIMARY_GM, 1, "primary GM"], [SECOND_GM, 0, "second GM"], [PLAYER, 0, "player"], [PLAYER_NO_GM, 0, "GM-less player"]]) {
    const env = loadEngine();
    const world = stageWorld(env, stage);
    try {
      const writes = await fireAwarenessChange(env);
      assert.strictEqual(writes.length, want, `${why}: expected ${want} sight write(s), got ${writes.length}`);
      if (want) assert.strictEqual(typeof writes[0]["prototypeToken.sight.range"], "number");
    } finally { world.undo(); }
  }
});

/* --- the THREE region behaviours keep the primitive half, on purpose ---------------------------- */
test("a region trap still springs on a GM-less table — the polarity the three RegionBehaviors need", async () => {
  const env = loadEngine();
  env.edhaRegisterNativeEventSystem();
  const Hazard = env.CONFIG?.RegionBehavior?.dataModels?.["edha-content.hazard"];
  assert.ok(Hazard, "the dangerous-terrain RegionBehavior registered");
  const behavior = new Hazard();
  behavior.damageFormula = "1d6";
  behavior.damageType = "energy";

  const run = async (stage) => {
    const applied = [];
    const actor = { name: "Pawn", system: { resources: { hea: { value: 10 } } }, applyDamage: (hits) => { applied.push(hits); } };
    const world = stageWorld(env, stage);
    const priorRoll = env.Roll;
    env.Roll = class { constructor() {} async evaluate() { this.total = 4; return this; } };
    try { await behavior._handleRegionEvent({ data: { token: { actor } } }); }
    finally { env.Roll = priorRoll; world.undo(); }
    return applied.length;
  };

  assert.strictEqual(await run(PRIMARY_GM), 1, "the primary GM applies the terrain damage");
  assert.strictEqual(await run(SECOND_GM), 0, "the second GM stands down — no double damage");
  // THE POINT: no GM is connected, so nobody has claimed the event and the walking player's own
  // client still resolves the trap. Migrating this site to edhaDefBuffGmGate() would return 0 here.
  assert.strictEqual(await run(PLAYER_NO_GM), 1, "GM-less: the trap still fires on the player's client");
});

test("the three _handleRegionEvent bodies call the PRIMITIVE, and nothing hand-derives the gate", () => {
  const src = codeOnly(readEngineSource());
  const primitiveCalls = (src.match(/if \(!edhaNoOtherActiveGM\(\)\) return;/g) || []).length;
  assert.strictEqual(primitiveCalls, 3, "exactly the three RegionBehavior traps use the primitive half");
  // Every remaining hand-derived copy is gone; the ONE survivor is the primitive's own body.
  const raw = (src.match(/activeGM\s*&&\s*!game\.users\.activeGM\.isSelf/g) || []).length;
  assert.strictEqual(raw, 1, "the only occurrence left is edhaNoOtherActiveGM's own one-line body");
  assert.ok(/function edhaNoOtherActiveGM\(\) \{ return !\(game\.users\?\.activeGM && !game\.users\.activeGM\.isSelf\); \}/.test(src),
    "that occurrence IS the primitive's definition");
  assert.ok(/function edhaDefBuffGmGate\(\) \{ return !!game\.user\?\.isGM && edhaNoOtherActiveGM\(\); \}/.test(src),
    "edhaDefBuffGmGate composes the primitive rather than repeating it");
});

test("the primaryGmGate ratchet records the floor it actually reached", () => {
  const ratchet = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "scripts", "engine-idiom-ratchet.json"), "utf8"));
  const measured = (codeOnly(readEngineSource()).match(/activeGM\s*&&\s*!game\.users\.activeGM\.isSelf/g) || []).length;
  assert.strictEqual(measured, 1, "the idiom floors at 1 (the primitive's own body)");
  assert.strictEqual(ratchet.counts.primaryGmGate, measured, "engine-idiom-ratchet.json must not become fiction");
  assert.strictEqual(ratchet.originalCounts.primaryGmGate, 20, "the freeze this migration started from");
});
