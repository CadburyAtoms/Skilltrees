/* REGRESSION — `edha-summon-effect`'s pre-cost veto looked up the WRONG talent (bench run 7,
 * 2026-07-27e; fixed 07-27f).
 *
 * Siege Form / Arsenal / Magnum Opus CONSUME a Construct that Forge Construct forged. Their veto
 * and executor both called `edhaOwnedSummons(actor, item.name, h.summonName)` with the CONSUMING
 * talent's name, and `edhaSummonIsFrom` short-circuited on the summon's stamp
 * (`if (st) return st === talentName`). A Construct stamped `summonTalent: "Forge Construct"`
 * therefore matched NOTHING for `"Siege Form"`, and the name-prefix fallback was unreachable
 * *because the flag was present* — so all three refused pre-cost with a live, healthy, correctly
 * flagged Construct standing. Measured live: `lookup_ForgeConstruct: true`,
 * `lookup_SiegeForm/Arsenal/MagnumOpus: false`; unsetting `summonTalent` made all three work.
 * Only LEGACY un-stamped Constructs worked — the exact inverse of the intent.
 *
 * The two pure decisions are pinned here. Reverting either half of the fix fails these:
 *   • `edhaSummonIsFrom(a, null, name)` must ignore the stamp entirely (consumer-side identity is
 *     the summon's own), while a NAMED forging talent still gets the stamp-authoritative branch
 *     the sustain-cap veto depends on.
 *   • `edhaSummonSourceTalent(h)` must turn a blank/absent `summonTalent` field into null, so the
 *     authored default routes through the consumer branch.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor } = require("./harness.js");

// A summon actor stub: `name` + the edha-content flags edhaSummonIsFrom / edhaOwnedSummons read.
function summon({ name = "Combat Construct (Bench)", stamp = null, summoner = "own1", hp = 20, at = 1 } = {}) {
  const actor = mockActor({ name, flags: { summon: true, summoner, summonTalent: stamp, summonedAt: at } });
  actor.system = { resources: { hea: { value: hp } } };
  return actor;
}

test("edhaSummonIsFrom: a CONSUMER (null talentName) finds a stamped summon by name — the run-7 defect", () => {
  const env = loadEngine();
  const forged = summon({ stamp: "Forge Construct" });
  // The three consumers, as they now ask: no forging talent named.
  assert.strictEqual(env.edhaSummonIsFrom(forged, null, "Combat Construct"), true);
  // The pre-fix call — the consuming talent's own name — is what returned false at the table.
  assert.strictEqual(env.edhaSummonIsFrom(forged, "Siege Form", "Combat Construct"), false);
  assert.strictEqual(env.edhaSummonIsFrom(forged, "Arsenal", "Combat Construct"), false);
  assert.strictEqual(env.edhaSummonIsFrom(forged, "Magnum Opus", "Combat Construct"), false);
});

test("edhaSummonIsFrom: the FORGING talent's stamp branch is untouched (sustain-cap still works)", () => {
  const env = loadEngine();
  const forged = summon({ stamp: "Forge Construct" });
  assert.strictEqual(env.edhaSummonIsFrom(forged, "Forge Construct", "Combat Construct"), true);
  // A different forger's summon must NOT count against this talent's cap, name match or not.
  assert.strictEqual(env.edhaSummonIsFrom(forged, "Raise Dead", "Combat Construct"), false);
});

test("edhaSummonIsFrom: legacy un-stamped summons still resolve by name prefix (both callers)", () => {
  const env = loadEngine();
  const legacy = summon({ stamp: null });                       // pre-07-24y, no stamp
  assert.strictEqual(env.edhaSummonIsFrom(legacy, "Forge Construct", "Combat Construct"), true);
  assert.strictEqual(env.edhaSummonIsFrom(legacy, null, "Combat Construct"), true);
  // 2bP-8/2bP-9 retired on exactly this fallback — it must not regress.
  assert.strictEqual(env.edhaSummonIsFrom(legacy, "Forge Construct", "Bone Servant"), false);
});

test("edhaSummonIsFrom: a consumer with no summonName matches nothing (no accidental wildcard)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaSummonIsFrom(summon({ stamp: "Forge Construct" }), null, ""), false);
  assert.strictEqual(env.edhaSummonIsFrom(summon({ stamp: null }), null, null), false);
});

test("edhaSummonSourceTalent: blank/absent → null (the authored default is the consumer branch)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaSummonSourceTalent({}), null);
  assert.strictEqual(env.edhaSummonSourceTalent({ summonTalent: "" }), null);
  assert.strictEqual(env.edhaSummonSourceTalent({ summonTalent: "   " }), null);
  assert.strictEqual(env.edhaSummonSourceTalent(null), null);
  // Pinned by an author who WANTS one forger: the stamp branch is then used, trimmed.
  assert.strictEqual(env.edhaSummonSourceTalent({ summonTalent: " Forge Construct " }), "Forge Construct");
});

test("edhaOwnedSummons: the consumer census sees the forged Construct, oldest first", () => {
  const env = loadEngine();
  const mine = summon({ stamp: "Forge Construct", summoner: "own1", at: 200 });
  const older = summon({ name: "Combat Construct (Old)", stamp: null, summoner: "own1", at: 100 });
  const theirs = summon({ name: "Combat Construct (Theirs)", stamp: "Forge Construct", summoner: "own2", at: 150 });
  const dead = summon({ name: "Combat Construct (Dead)", stamp: "Forge Construct", summoner: "own1", hp: 0, at: 50 });
  env.game.actors = [mine, older, theirs, dead];
  const found = env.edhaOwnedSummons({ id: "own1" }, env.edhaSummonSourceTalent({}), "Combat Construct");
  // Another owner's summon and a dead one are excluded; oldest-first ordering preserved.
  assert.deepStrictEqual(found.map(a => a.name), ["Combat Construct (Old)", "Combat Construct (Bench)"]);
  // Pre-fix, the same census with the consuming talent's name returned NOTHING but the legacy one.
  const preFix = env.edhaOwnedSummons({ id: "own1" }, "Siege Form", "Combat Construct");
  assert.deepStrictEqual(preFix.map(a => a.name), ["Combat Construct (Old)"]);
});
