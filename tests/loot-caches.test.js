/* Item 34b (2026-09-06) — loot caches + defeated-adversary search (re-do of PR #103's loot half).
 * Pins the PURE helpers behind the double-click contents card and the `loot-take` GM relay:
 *   - edhaLootableItems / edhaLootRows — gear only; a BODY keeps its alwaysEquipped natural weapons;
 *   - edhaLootDefeated / edhaLootSourceKind — cache flag wins; defeated (HP ≤ 0 or the Dead status)
 *     adversary = body; a downed PC or a live adversary is never a source;
 *   - edhaLootGapFt / edhaLootInReach — the 5 ft edge-to-edge reach;
 *   - edhaLootClaim — the synchronous test-and-set that makes the GM the single writer: two takes on
 *     the same item yield exactly one winner, proven on the real edhaLootTakeGM with two interleaved
 *     relays racing on one event loop;
 *   - a source scan: `loot-take` is registered in EDHA_SOCKET_ACTIONS exactly once and the Take
 *     button binds through EDHA_CARD_BUTTONS (no second renderChatMessageHTML walker).
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, readEngineSource, codeOnly } = require("./harness.js");
const plain = (v) => JSON.parse(JSON.stringify(v));   // vm-realm arrays are not reference-equal to ours

const env = loadEngine();

const gear = (name, type, system = {}) => ({ id: name, name, type, system });
const bite = gear("Bite", "weapon", { alwaysEquipped: true });
const sword = gear("Shortsword", "weapon", { equipped: true });
const rations = gear("Rations", "equipment", { quantity: 3 });
const coin = gear("Coin purse", "loot");
const trait = gear("Pack Tactics", "trait");
const action = gear("Break", "action");
const talent = gear("Guiding Signal", "talent");

// --- lootable list --------------------------------------------------------------------------------
test("edhaLootableItems: gear only — traits, actions and talents are never loot", () => {
  const out = env.edhaLootableItems([sword, trait, rations, action, coin, talent]);
  assert.deepStrictEqual(out.map(i => i.name), ["Shortsword", "Rations", "Coin purse"]);
});

test("edhaLootableItems: a BODY keeps its alwaysEquipped natural weapon; a CACHE gives it up", () => {
  assert.deepStrictEqual(env.edhaLootableItems([bite, sword]).map(i => i.name), ["Shortsword"]);
  assert.deepStrictEqual(env.edhaLootableItems([bite, sword], { cache: true }).map(i => i.name), ["Bite", "Shortsword"]);
  assert.deepStrictEqual(plain(env.edhaLootableItems(null)), []);
});

test("edhaLootRows: one row per lootable item, in item order, quantity in the label", () => {
  const rows = plain(env.edhaLootRows([trait, rations, bite, sword]));
  assert.deepStrictEqual(rows, [
    { id: "Rations", name: "Rations", qty: 3, label: "Rations ×3" },
    { id: "Shortsword", name: "Shortsword", qty: 1, label: "Shortsword" },
  ]);
});

// --- defeat + source kind -------------------------------------------------------------------------
const adv = (hp, o = {}) => mockActor({ name: "Hound", type: "adversary", system: { resources: { hea: { value: hp } } }, ...o });

test("edhaLootDefeated: HP ≤ 0 OR the system's DEFEATED status", () => {
  assert.strictEqual(env.edhaLootDefeated(adv(0)), true);
  assert.strictEqual(env.edhaLootDefeated(adv(-3)), true);
  assert.strictEqual(env.edhaLootDefeated(adv(4)), false);
  assert.strictEqual(env.edhaLootDefeated(adv(4, { statuses: ["dead"] })), true);
  env.CONFIG.specialStatusEffects = { DEFEATED: "defeated" };
  assert.strictEqual(env.edhaLootDefeated(adv(4, { statuses: ["dead"] })), false, "reads CONFIG.specialStatusEffects.DEFEATED, not a hard-coded id");
  assert.strictEqual(env.edhaLootDefeated(adv(4, { statuses: ["defeated"] })), true);
  delete env.CONFIG.specialStatusEffects;
  assert.strictEqual(env.edhaLootDefeated(null), false);
});

test("edhaLootSourceKind: the cache flag wins even alive; a defeated adversary is a body; a downed PC is never a source", () => {
  assert.strictEqual(env.edhaLootSourceKind(adv(10, { flags: { lootCache: true } })), "cache");
  assert.strictEqual(env.edhaLootSourceKind(adv(0)), "body");
  assert.strictEqual(env.edhaLootSourceKind(adv(4, { statuses: ["dead"] })), "body");
  assert.strictEqual(env.edhaLootSourceKind(adv(4)), null, "a live adversary is not lootable");
  const pc = mockActor({ name: "Tem", type: "character", system: { resources: { hea: { value: 0 } } } });
  assert.strictEqual(env.edhaLootSourceKind(pc), null, "downed PCs are never lootable");
  assert.strictEqual(env.edhaLootSourceKind(null), null);
});

// --- reach ----------------------------------------------------------------------------------------
test("edhaLootGapFt + edhaLootInReach: 5 ft edge-to-edge on a 100 px / 5 ft grid", () => {
  const opts = { pxPerFt: 20, gd: 5 };
  const me = { x: 50, y: 50, w: 1, h: 1 };
  const at = (px, w = 1) => ({ x: 50 + px, y: 50, w, h: w });
  assert.strictEqual(env.edhaLootGapFt(me, at(100), opts), 0, "adjacent squares touch");
  assert.strictEqual(env.edhaLootGapFt(me, at(200), opts), 5, "one empty square between");
  assert.strictEqual(env.edhaLootGapFt(me, at(300), opts), 10);
  assert.strictEqual(env.edhaLootGapFt(me, at(250, 2), opts), 5, "a 2×2 source's edge is 5 ft nearer than its center");
  assert.strictEqual(env.edhaLootInReach(0), true);
  assert.strictEqual(env.edhaLootInReach(5), true, "exactly 5 ft is within reach");
  assert.strictEqual(env.edhaLootInReach(10), false);
  assert.strictEqual(env.edhaLootInReach(Infinity), false);
  assert.strictEqual(env.edhaLootInReach(NaN), false);
});

// --- the take guard -------------------------------------------------------------------------------
test("edhaLootClaim: the first claim of an item wins, every later one loses; release re-opens it", () => {
  const ledger = new Set();
  const a = env.edhaLootClaim(ledger, "Scene.s.Token.t", "sword");
  const b = env.edhaLootClaim(ledger, "Scene.s.Token.t", "sword");
  assert.deepStrictEqual([a, b], [true, false], "exactly one winner");
  assert.strictEqual(env.edhaLootClaim(ledger, "Scene.s.Token.t", "rations"), true, "another item on the same source is independent");
  assert.strictEqual(env.edhaLootClaim(ledger, "Scene.s.Token.u", "sword"), true, "the same item id on another source is independent");
  env.edhaLootRelease(ledger, "Scene.s.Token.t", "sword");
  assert.strictEqual(env.edhaLootClaim(ledger, "Scene.s.Token.t", "sword"), true, "a released claim (failed take) can be retried");
});

test("edhaLootTakeGM: two relays for the same item interleaved on one event loop move it exactly once", async () => {
  const e = loadEngine();
  // A source whose item lookup yields to the event loop BEFORE the delete lands — the interleave
  // that would let both relays see the item present if the guard were the existence check alone.
  let deletes = 0;
  const item = {
    id: "sword", name: "Shortsword", type: "weapon",
    toObject() { return { _id: "sword", name: "Shortsword", type: "weapon", system: { equipped: true }, flags: { "edha-content": { adversaryItem: true } } }; },
    async delete() { deletes++; source.items.delete("sword"); },
  };
  const source = { name: "Raider", items: new Map([["sword", item]]) };
  const created = [];
  const taker = { name: "Tem", uuid: "Actor.tem", async createEmbeddedDocuments(_t, docs) { await new Promise(r => setTimeout(r, 5)); created.push(...docs); } };
  e.fromUuid = async (u) => { await new Promise(r => setTimeout(r, 1)); return u === "Scene.s.Token.raider" ? { actor: source } : u === "Actor.tem" ? taker : null; };
  const posted = [];
  e.ChatMessage = class { static create(m) { posted.push(m); } static getSpeaker() { return {}; } };
  const payload = { srcTokenUuid: "Scene.s.Token.raider", itemId: "sword", takerUuid: "Actor.tem" };
  await Promise.all([e.edhaLootTakeGM(payload), e.edhaLootTakeGM({ ...payload })]);
  assert.strictEqual(created.length, 1, "exactly one copy created on the taker");
  assert.strictEqual(deletes, 1, "the source item deleted exactly once");
  assert.strictEqual(created[0]._id, undefined, "the copy is a fresh document");
  assert.strictEqual(created[0].system.equipped, false, "lands unequipped");
  assert.strictEqual(created[0].flags["edha-content"], undefined, "adversary-pack provenance shed (the sync deletes flagged items)");
  assert.strictEqual(posted.filter(m => !m.whisper).length, 1, "one public take card");
  assert.strictEqual(posted.filter(m => m.whisper).length, 1, "the loser gets a GM whisper, not a second item");
});

test("edhaLootTakeGM: a take whose item is already gone moves nothing and releases the claim", async () => {
  const e = loadEngine();
  const source = { name: "Raider", items: new Map() };
  const created = [];
  const taker = { name: "Tem", uuid: "Actor.tem", async createEmbeddedDocuments(_t, docs) { created.push(...docs); } };
  e.fromUuid = async (u) => (u === "Scene.s.Token.raider" ? { actor: source } : u === "Actor.tem" ? taker : null);
  const posted = [];
  e.ChatMessage = class { static create(m) { posted.push(m); } static getSpeaker() { return {}; } };
  await e.edhaLootTakeGM({ srcTokenUuid: "Scene.s.Token.raider", itemId: "sword", takerUuid: "Actor.tem" });
  assert.strictEqual(posted.length, 1);
  assert.ok(posted[0].whisper, "a GM whisper, never a public card");
  assert.strictEqual(created.length, 0, "nothing created");
  // The claim was released: once the item exists (the GM restocks the source), the same take succeeds.
  source.items.set("sword", { id: "sword", name: "Shortsword", type: "weapon", toObject() { return { name: "Shortsword", type: "weapon", system: {} }; }, async delete() { source.items.delete("sword"); } });
  await e.edhaLootTakeGM({ srcTokenUuid: "Scene.s.Token.raider", itemId: "sword", takerUuid: "Actor.tem" });
  assert.strictEqual(created.length, 1, "the released claim let the retry through");
});

// --- wiring: one registration each, through the shared tables -------------------------------------
test("loot-take is registered in EDHA_SOCKET_ACTIONS exactly once; the Take button binds through EDHA_CARD_BUTTONS", () => {
  const src = codeOnly(readEngineSource());
  assert.strictEqual((src.match(/"loot-take":\s*async/g) || []).length, 1, "one socket registration");
  assert.strictEqual((src.match(/action:\s*"loot-take"/g) || []).length, 1, "one emitter");
  assert.strictEqual((src.match(/"edha-loot-btn":\s*edhaLootTakeClick/g) || []).length, 1, "one card-button binding");
  assert.strictEqual((src.match(/querySelectorAll\?\.\(".edha-loot-btn"\)/g) || []).length, 0, "no private renderChatMessageHTML walker for the loot button");
  assert.ok(/createLootCache:\s*edhaCreateLootCache/.test(src), "edha.createLootCache on the console API");
  assert.ok(/Hooks\.once\("init",\s*function edhaPatchLootDblClick/.test(src), "the double-click intercept is installed at init");
});
