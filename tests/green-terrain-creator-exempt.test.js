/* item 162 (fix pass 13, 2026-09-15) — a creature's own Green terrain never burns it.
 *
 * Bench run 48 (YARD-3): the Briar-Gone Grove's Draw Mana square landed under its own 2×2 token and the
 * card read "Briar-Gone Grove takes 1 keen from dangerous terrain (Thorn Field — Briar-Gone Grove)"; at
 * its next turn start it took 3 keen from the same square. `edhaCreateGreenTerrain`
 * (module-src/scripts/engine/50-green-territory.js) built the Thorn Field `edha-content.hazard`
 * behaviour with `{damageFormula, damageType, sourceName}` only. The behaviour has had a generic
 * `exemptActorUuid` dial since R-6 (Fault Line spares its caster), honoured by
 * `EdhaHazardRegionBehavior._handleRegionEvent`; Green terrain simply never filled it in.
 *
 * Every Green creator reaches that one function — Green Leyline Attunement's Draw Mana zone, Sudden
 * Growth's burst detonation, the Fellstag's Thorn Hedge and the grove's own copy, and a player's relay
 * (the GM-side receiver resolves the owner and calls the same function), so the exemption is computed
 * where the Region is written and needs no socket field.
 *
 * NOT changed: the turn-END moment (`moment: "turn-end"`, Bone Garden) is a region flag read by
 * `edhaTurnEndHazardSweep`, which by Ben's R5 damages "ANY creature, allies and the owner too". That
 * path builds no hazard behaviour and gains no exemption; the last case pins that it still does not.
 *
 * Reversion: drop `exemptActorUuid: owner.uuid` from the behaviour in 50-green-territory.js and the
 * first case fails (the field is missing), then the tick case fails with the grove taking 3 keen.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, stageWorld, captureChat, readEngineSource, codeOnly } = require("./harness.js");

const THORN = { type: "edha-zone-hazard", color: "green", damageFormula: "floor(((@tier)d(2 * @colorRank + 2)) / 2)", damageType: "keen", label: "" };

function grove({ moment } = {}) {
  const handler = moment ? { ...THORN, moment } : THORN;
  const item = mockItem({ name: "Thorn Field", type: "talent", events: [{ event: "edha-apply-watch", handler }] });
  const actor = mockActor({ name: "Briar-Gone Grove", id: "grove", uuid: "Scene.s1.Token.grove.Actor.grove", type: "adversary",
                            items: [item], system: { tier: 2, role: "boss", resources: { hea: { value: 60 } } } });
  actor.getRollData = () => ({ tier: 2, skills: {} });
  item.actor = actor;
  return actor;
}
function stubScene() {
  const created = [];
  return { created, scene: { id: "s1", grid: { size: 100, distance: 5 },
    createEmbeddedDocuments: async (type, docs) => { created.push({ type, docs }); return docs.map((d, i) => ({ id: `${type}-${i}`, ...d })); } } };
}
async function placeTerrain(env, owner) {
  const { created, scene } = stubScene();
  await env.edhaCreateGreenTerrain(owner, scene, 1400, 1100, 10);
  const region = created.find((c) => c.type === "Region")?.docs?.[0];
  assert.ok(region, "no Region was created");
  return region;
}

test("item 162: Green terrain's Thorn Field hazard behaviour exempts its creator", async () => {
  const env = loadEngine();
  const owner = grove();
  const region = await placeTerrain(env, owner);
  const hazard = (region.behaviors || []).find((b) => b.type === "edha-content.hazard");
  assert.ok(hazard, "the Thorn Field rider did not build a hazard behaviour");
  assert.strictEqual(hazard.system.exemptActorUuid, owner.uuid, "the creator is not exempt from its own briar");
  assert.strictEqual(hazard.system.damageType, "keen");
  assert.strictEqual(region.flags["edha-content"].terrain.ownerUuid, owner.uuid, "ownership is unchanged");
});

test("item 162: the tick spares the grove in its own square and still catches a hostile standing in it", async () => {
  const env = loadEngine();
  const owner = grove();
  const region = await placeTerrain(env, owner);
  const sys = region.behaviors.find((b) => b.type === "edha-content.hazard").system;
  env.edhaRegisterNativeEventSystem();
  const Hazard = env.CONFIG.RegionBehavior.dataModels["edha-content.hazard"];
  const b = new Hazard();
  Object.assign(b, sys, { damageFormula: "3" });
  const tick = async (actor) => {
    const applied = [];
    actor.applyDamage = (hits) => applied.push(...hits);
    const cards = captureChat(env);
    const world = stageWorld(env, { user: { isGM: true, id: "gm1" }, users: Object.assign([], { activeGM: { isSelf: true } }) });
    const priorRoll = env.Roll;
    env.Roll = class { constructor() {} async evaluate() { this.total = 3; return this; } };
    try { await b._handleRegionEvent({ data: { token: { actor } } }); }
    finally { env.Roll = priorRoll; world.undo(); }
    return { applied, cards };
  };
  const self = await tick(owner);
  assert.deepStrictEqual(self.applied, [], "the grove took damage from its own briar");
  assert.strictEqual(self.cards.length, 0, "…and a card said so");
  const foe = await tick(mockActor({ name: "Bench Copy — Ishee", uuid: "Actor.ishee", system: { resources: { hea: { value: 11 } } } }));
  assert.strictEqual(foe.applied.length, 1, "a character entering the briar must still be caught");
  assert.strictEqual(foe.applied[0].amount, 3);
});

test("item 162: every Green creator reaches the one exempting function (the player relay included)", () => {
  const code = codeOnly(readEngineSource());
  assert.ok(/"green-terrain": async[\s\S]{0,400}edhaCreateGreenTerrain\(owner, scene, p\.cx, p\.cy, p\.sizeFt, srcItem\)/.test(code),
    "the player→GM green-terrain relay no longer calls edhaCreateGreenTerrain with the resolved owner");
  assert.ok(/edhaCreateGreenTerrain\(caster, scene, tr\.x, tr\.y, tr\.sizeFt\)/.test(code),
    "the burst detonation no longer drops Green terrain through edhaCreateGreenTerrain");
});

test("item 162 boundary: a turn-END hazard (Bone Garden's moment) is untouched — no behaviour, no exemption (R5)", async () => {
  const env = loadEngine();
  const owner = grove({ moment: "turn-end" });
  const region = await placeTerrain(env, owner);
  assert.ok(!(region.behaviors || []).some((b) => b.type === "edha-content.hazard"), "a turn-end rider must not build a hazard behaviour");
  const ted = region.flags["edha-content"].turnEndDamage;
  assert.ok(ted && ted.formula, "the turn-end damage flag is still written");
  assert.ok(!("exemptActorUuid" in ted), "the turn-end flag must not grow an exemption — R5 catches the owner too");
});
