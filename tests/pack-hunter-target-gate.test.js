/* item 163 (fix pass 13, 2026-09-15) — Pack Hunter's banked advantage: a target gate, living hunters
 * only, and adjacency measured against a token's FOOTPRINT.
 *
 * Bench run 48 found three defects on one talent, all in the `edha-adv-attack` executor's `pack` mode
 * (module-src/scripts/engine/53-native-event-system.js) and the `advAttackNext` pipeline it feeds
 * (52-green-instinct.js):
 *   (a) the card said "2 hunter(s) gain advantage on their next attack against Rootling Swarm (2)", but
 *       the flag carried no target, and the pre-roll hook applied it to the next attack against ANYONE —
 *       Ishee's advantage banked against root2 (dead by then) rolled 2d20kh on her Staff against root1.
 *       Scent the Weak ("your first test against IT") fed the same targetless flag.
 *   (b) with Soggy Bottom at 0 HP beside root3 the count read "2 hunter(s)" — no liveness read.
 *   (c) with Ishee beside the grove's 2×2 token the count read "1 hunter(s)": `edhaAdjacent` read the
 *       centre-to-centre gap in whole squares (≤ 1.05), and a Medium creature touching a Large one's
 *       edge sits 1.5 squares from its centre. Every other `edhaAdjacent` consumer (Isolation, touch
 *       gates, the damage-reduce and damage-react adjacency gates, the aura) had the same blind spot.
 *
 * The fix: the grant stamps the target token's uuid (`edhaGrantAdvAttack(actor, source, targetUuid)`),
 * and ONE pure decision (`edhaAdvAttackApplies(flag, targetUuids)`) is read by both the pre-roll and
 * the consume hook, so a banked advantage is neither applied nor spent on another creature; a
 * targetless grant (White's rally, the Decree's Witnesses, Investiture of Command) keeps today's
 * any-target shape. Pack hunters skip a defeated ally (`edhaActorDefeated`, item 161). `edhaAdjacent`
 * reads footprints through the pure `edhaFootprintsTouch` — byte-identical for 1×1 tokens.
 *
 * Reversions: restore the pre-roll's bare flag read and the "root1" case fails with advantage applied;
 * restore the centre-distance `edhaAdjacent` and the Large-token count fails at 1 hunter.
 */
"use strict";
const assert = require("assert");
const { loadEngine, loadHandlerRegistry, fireHook, mockActor, mockItem, stageWorld, captureChat, sleep, eq } = require("./harness.js");

const GS = 100;

/* ---- (c) footprints --------------------------------------------------------------------------- */
test("edhaFootprintsTouch: 1×1 tokens read exactly the old Chebyshev ≤ 1.05 rule", () => {
  const env = loadEngine();
  const m = (x, y) => ({ x, y, w: 1, h: 1 });
  assert.strictEqual(env.edhaFootprintsTouch(m(500, 500), m(600, 500)), true, "orthogonal neighbour");
  assert.strictEqual(env.edhaFootprintsTouch(m(500, 500), m(600, 600)), true, "diagonal neighbour");
  assert.strictEqual(env.edhaFootprintsTouch(m(500, 500), m(500, 500)), true, "same square");
  assert.strictEqual(env.edhaFootprintsTouch(m(500, 500), m(605, 500)), true, "inside the 0.05 epsilon");
  assert.strictEqual(env.edhaFootprintsTouch(m(500, 500), m(700, 500)), false, "one empty square between");
  assert.strictEqual(env.edhaFootprintsTouch(m(500, 500), m(606, 500)), false, "just past the epsilon");
});

test("edhaFootprintsTouch: a Medium creature touching a Large or Huge token's edge IS adjacent", () => {
  const env = loadEngine();
  const large = { x: 1400, y: 1100, w: 2, h: 2 };   // spans 1300–1500 × 1000–1200
  assert.strictEqual(env.edhaFootprintsTouch({ x: 1550, y: 1050, w: 1, h: 1 }, large), true, "orthogonal to the Large edge (1.5 squares from its centre)");
  assert.strictEqual(env.edhaFootprintsTouch({ x: 1550, y: 1250, w: 1, h: 1 }, large), true, "diagonal to the Large corner");
  assert.strictEqual(env.edhaFootprintsTouch({ x: 1650, y: 1050, w: 1, h: 1 }, large), false, "one square off the Large edge");
  const huge = { x: 1450, y: 1150, w: 3, h: 3 };    // spans 1300–1600 × 1000–1300
  assert.strictEqual(env.edhaFootprintsTouch({ x: 1650, y: 1150, w: 1, h: 1 }, huge), true, "orthogonal to the Huge edge (2 squares from its centre)");
});

test("edhaAdjacent reads token footprints from the placeables", () => {
  const env = loadEngine();
  const tok = (x, y, width = 1, height = 1) => ({ center: { x, y }, document: { width, height } });
  assert.strictEqual(env.edhaAdjacent(tok(1550, 1050), tok(1400, 1100, 2, 2)), true);
  assert.strictEqual(env.edhaAdjacent(tok(500, 500), tok(600, 600)), true);
  assert.strictEqual(env.edhaAdjacent(tok(500, 500), tok(700, 500)), false);
  assert.strictEqual(env.edhaAdjacent(null, tok(0, 0)), false);
});

/* ---- (a) the decision both hooks read ------------------------------------------------------------- */
test("edhaAdvAttackApplies: a targeted grant applies only against its target; a targetless one against anyone", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaAdvAttackApplies(undefined, ["A"]), false);
  assert.strictEqual(env.edhaAdvAttackApplies(null, ["A"]), false);
  assert.strictEqual(env.edhaAdvAttackApplies(true, []), true, "targetless (legacy boolean)");
  assert.strictEqual(env.edhaAdvAttackApplies("Pack Hunter", ["B"]), true, "targetless (legacy string — a flag banked before this deploy)");
  assert.strictEqual(env.edhaAdvAttackApplies({ source: "Rally", targetUuid: null }, ["B"]), true, "targetless object");
  assert.strictEqual(env.edhaAdvAttackApplies({ source: "Pack Hunter", targetUuid: "A" }, ["A"]), true);
  assert.strictEqual(env.edhaAdvAttackApplies({ source: "Pack Hunter", targetUuid: "A" }, ["B", "A"]), true, "the target among several");
  assert.strictEqual(env.edhaAdvAttackApplies({ source: "Pack Hunter", targetUuid: "A" }, ["B"]), false);
  assert.strictEqual(env.edhaAdvAttackApplies({ source: "Pack Hunter", targetUuid: "A" }, []), false, "no target selected");
});

/* ---- the executor: YARD-3's positions ------------------------------------------------------------- */
function hunter(env, name, { side = 1, hp = 11, x, y, width = 1, height = 1, items = [] } = {}) {
  const actor = mockActor({ name, id: name, type: side === 1 ? "character" : "adversary", items,
                            system: { resources: { hea: { value: hp, max: { value: 11 } } } } });
  actor.isOwner = true;
  actor.prototypeToken = { disposition: side };
  const tok = { id: `tok-${name}`, name, actor, center: { x, y },
                document: { id: `tok-${name}`, uuid: `Scene.s1.Token.${name}`, disposition: side, width, height } };
  actor.getActiveTokens = () => [tok];
  for (const it of items) it.actor = actor;
  return { actor, tok };
}
async function packHunter({ targetName = "Briar-Gone Grove" } = {}) {
  const env = loadEngine();
  const cards = captureChat(env);
  const { handlers } = loadHandlerRegistry(env);
  const def = handlers.find((h) => h.type === "edha-adv-attack");
  const item = mockItem({ name: "Pack Hunter", type: "talent", events: [{ event: "use", handler: { type: "edha-adv-attack", to: "pack" } }] });
  const grove = hunter(env, "Briar-Gone Grove", { side: -1, hp: 60, x: 1400, y: 1100, width: 2, height: 2 });   // 1300–1500 × 1000–1200
  const ishee = hunter(env, "Ishee", { x: 1550, y: 1050, items: [item] });          // touching the grove's east edge
  const soggy = hunter(env, "Soggy Bottom", { x: 1250, y: 1150 });                   // touching its west edge
  const tem = hunter(env, "Tem parinaem", { hp: 0, x: 1350, y: 950 });               // touching its north edge — DOWN
  const far = hunter(env, "Far Ally", { x: 1850, y: 1100 });                         // not adjacent
  const target = [grove, ishee, soggy, tem, far].find((h) => h.actor.name === targetName);
  const all = [grove, ishee, soggy, tem, far];
  const world = stageWorld(env, { user: { id: "u1", isGM: false, targets: new Set([target.tok]) },
                                  actors: all.map((h) => h.actor), placeables: all.map((h) => h.tok), combats: [] });
  try { await def.executor.call({ to: "pack" }, { item }); await sleep(5); }
  finally { world.undo(); }
  const flag = (h) => h.actor.getFlag("edha-content", "advAttackNext");
  return { cards, grove, ishee, soggy, tem, far, flag };
}

test("item 163 — YARD-3: a Medium hunter beside the grove's 2×2 edge counts, a downed one does not, and the grant names the grove", async () => {
  const { cards, grove, ishee, soggy, tem, far, flag } = await packHunter();
  const card = cards.map((c) => c.content).find((c) => /hunter\(s\)/.test(c)) || "";
  assert.ok(/2 hunter\(s\) gain advantage on their next attack against Briar-Gone Grove/.test(card), `card: ${card}`);
  eq(flag(ishee), { source: "Pack Hunter", targetUuid: grove.tok.document.uuid });
  eq(flag(soggy), { source: "Pack Hunter", targetUuid: grove.tok.document.uuid });
  assert.strictEqual(flag(tem), undefined, "a hunter at 0 HP must not be granted or counted");
  assert.strictEqual(flag(far), undefined, "a non-adjacent ally must not be granted");
});

/* ---- the two hooks: a banked advantage is neither applied nor spent against someone else --------- */
async function attackWith(flagValue, targetTokUuid) {
  const env = loadEngine();
  const cards = captureChat(env);
  const actor = mockActor({ name: "Ishee", flags: { advAttackNext: flagValue } });
  actor.isOwner = true;
  const tgt = { id: "t", document: { uuid: targetTokUuid } };
  const world = stageWorld(env, { user: { id: "u1", isGM: false, targets: new Set([tgt]) }, actors: [actor], placeables: [] });
  const roll = { options: {}, configureModifiers() {} };
  const config = { data: { source: { actor } } };
  try {
    await fireHook(env, "cosmere-rpg.preAttackRoll", roll, config.data.source, config);
    await fireHook(env, "cosmere-rpg.attackRoll", roll, config.data.source, config);
    await sleep(5);
  } finally { world.undo(); }
  return { mode: roll.options.advantageMode, left: actor.getFlag("edha-content", "advAttackNext"), cards };
}

test("item 163 — the bench's take: advantage banked against root2 is NOT applied, and NOT spent, on an attack against root1", async () => {
  const banked = { source: "Pack Hunter", targetUuid: "Scene.s1.Token.root2" };
  const r = await attackWith(banked, "Scene.s1.Token.root1");
  assert.notStrictEqual(r.mode, "advantage", "the banked advantage was applied to an attack on a different creature");
  eq(r.left, banked);
});

test("item 163: the same banked advantage IS applied and spent against its own target", async () => {
  const r = await attackWith({ source: "Pack Hunter", targetUuid: "Scene.s1.Token.root2" }, "Scene.s1.Token.root2");
  assert.strictEqual(r.mode, "advantage");
  assert.strictEqual(r.left, undefined, "the flag must be consumed by the attack it applied to");
  assert.ok(r.cards.some((c) => /Pack Hunter<\/strong> — advantage spent/.test(c.content)), "the spend card names the source");
});

test("item 163: a targetless grant (a flag banked before this deploy, or White's rally) still applies to any target", async () => {
  const r = await attackWith("Pack Hunter", "Scene.s1.Token.root1");
  assert.strictEqual(r.mode, "advantage");
  assert.strictEqual(r.left, undefined);
});
