/* REGRESSION — the split hazard-Region flag vocabulary (bench run 14; fixed 2026-07-27s).
 *
 * Two placers wrote two different spellings of "who owns this dangerous terrain", and each of the
 * two readers understood only one of them:
 *
 *   edhaPlaceHazardRegionGM / the burst path / green terrain  ->  flags.edha-content.terrain.ownerUuid
 *   edhaPlaceHazard (the `edha-place-hazard` handler)         ->  flags.edha-content.sourceOwnerUuid  (FLAT)
 *
 * `edhaOwnedTerrainRegions` — the membership spine behind `edhaTokenInOwnedTerrain` (which gates the
 * ENTIRE `edha-zone-react {defeat-in-zone}` ignite sweep), behind `edhaEnemiesInOwnedTerrain` (Apex
 * Predator's crowd gate) and behind Pack Sense's target gate — read only the nested shape. So every
 * Region placed by `edha-place-hazard` was invisible to it, and **Combustion Chain could never fire
 * off a Pyre zone**, which is the canonical Destruction pairing. Bench run 14 proved it with a
 * matched control rather than by inference: a victim dropped to 0 HP inside a Pyre zone that was
 * actively ticking it for 12 energy produced 0 cards and 0 Regions, while the same victim, talent
 * and owner dropped inside a Walking Ruin trail patch — placed by the OTHER helper — fired at once.
 *
 * The fix is one vocabulary: `edhaPlaceHazard` now stamps `terrain.ownerUuid` like everything else,
 * and `edhaTerrainOwnerUuid` is the single function that knows how a Region spells its owner. The
 * flat key survives there ONLY as a legacy tolerance, because hazard Regions are `scope: "scene"`
 * and can outlive a deploy.
 *
 * These cases pin BOTH directions: the canonical shape must be seen (or the fix is vacuous) and the
 * legacy shape must still be seen (or a live Pyre zone is stranded by the deploy that fixes it).
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

// A Region document stub: only `getFlag` and `shapes` are consulted by the spine.
function fakeRegion(flags, shapes = []) {
  return {
    shapes,
    getFlag(scope, key) { return scope === "edha-content" ? flags[key] : undefined; },
  };
}

const OWNER = "Actor.owner-1";
const OTHER = "Actor.owner-2";

// Exactly what each placer writes today, transcribed from register-skills.js.
const canonical = () => fakeRegion({ hazard: true, scope: "scene", terrain: { ownerUuid: OWNER, color: "red" } },
  [{ type: "rectangle", x: 0, y: 0, width: 100, height: 100 }]);
const legacyFlat = () => fakeRegion({ hazard: true, scope: "scene", sourceItem: "Pyre", sourceOwnerUuid: OWNER, spreads: true },
  [{ type: "rectangle", x: 0, y: 0, width: 100, height: 100 }]);
const foreign = () => fakeRegion({ hazard: true, scope: "scene", terrain: { ownerUuid: OTHER, color: "red" } },
  [{ type: "rectangle", x: 0, y: 0, width: 100, height: 100 }]);

test("edhaTerrainOwnerUuid reads the canonical nested shape every placer now writes", () => {
  assert.strictEqual(env.edhaTerrainOwnerUuid(canonical()), OWNER);
});

test("edhaTerrainOwnerUuid still reads a pre-07-27s flat sourceOwnerUuid (scene Regions outlive a deploy)", () => {
  assert.strictEqual(env.edhaTerrainOwnerUuid(legacyFlat()), OWNER,
    "a Pyre zone standing on a live scene when this fix deploys must not be stranded");
});

test("edhaTerrainOwnerUuid returns null for a Region that claims no owner at all", () => {
  assert.strictEqual(env.edhaTerrainOwnerUuid(fakeRegion({ hazard: true, scope: "scene" })), null);
  assert.strictEqual(env.edhaTerrainOwnerUuid(null), null);
});

test("the membership spine sees BOTH shapes as the same owner — this is the bug itself", () => {
  const scene = { regions: [canonical(), legacyFlat(), foreign()] };
  const mine = env.edhaOwnedTerrainRegions({ uuid: OWNER }, scene);
  assert.strictEqual(mine.length, 2,
    "before the fix the flat-shaped Region was invisible here, so the defeat-in-zone gate could " +
    "never open on a Pyre zone");
  const theirs = env.edhaOwnedTerrainRegions({ uuid: OTHER }, scene);
  assert.strictEqual(theirs.length, 1, "NEGATIVE: another caster's terrain must not become mine");
});

test("edhaTokenInOwnedTerrain opens on a Pyre-shaped zone, and stays shut outside it", () => {
  const scene = { regions: [legacyFlat()] };
  const inside = { scene, center: { x: 50, y: 50 } };
  const outside = { scene, center: { x: 500, y: 500 } };
  assert.strictEqual(env.edhaTokenInOwnedTerrain(inside, { uuid: OWNER }), true,
    "the gate behind the whole edha-zone-react {defeat-in-zone} sweep");
  assert.strictEqual(env.edhaTokenInOwnedTerrain(outside, { uuid: OWNER }), false,
    "NEGATIVE: a body that fell OUTSIDE the zone must not ignite one");
  assert.strictEqual(env.edhaTokenInOwnedTerrain(inside, { uuid: OTHER }), false,
    "NEGATIVE: standing in someone ELSE'S fire is not standing in yours");
});

test("no placer writes the flat key any more — the vocabulary is one, not two", () => {
  const fs = require("fs");
  const path = require("path");
  // ⚠ NORMALISE CRLF FIRST. Ben's checkout has core.autocrlf=true, so the working copy is CRLF,
  // and JS `.` does not match `\r` — `/\/\/.*$/` therefore stripped NOTHING on his machine, the
  // prose mention counted as a hit, and this test failed 2 !== 1 on a clean tree. CI is Linux/LF,
  // so it stayed green there and the false red only ever hit the pre-commit hook (found 07-28,
  // fix pass F). Any test that reasons about engine source lines must do this.
  const engine = fs.readFileSync(
    path.join(__dirname, "..", "module-src", "scripts", "register-skills.js"), "utf8").replace(/\r\n/g, "\n");
  // Comments are stripped first: the tree-section headers and this fix's own notes MENTION the flat
  // key on purpose, and a prose mention is not a write (the lint pass-7 convention).
  const code = engine.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((l) => l.replace(/\/\/.*$/, ""));
  // The ONLY surviving mention is the legacy read arm inside edhaTerrainOwnerUuid.
  const hits = code.filter((l) => /sourceOwnerUuid/.test(l));
  assert.strictEqual(hits.length, 1,
    `expected exactly one surviving sourceOwnerUuid reference (the legacy read arm); found ${hits.length}:\n` +
    hits.join("\n"));
  assert.ok(/\?\?/.test(hits[0]), "the survivor must be the fallback READ, never a write");
});
