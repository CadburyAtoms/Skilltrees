/* REGRESSION — R-83 (a): the three `hea` writers that used to bypass the heal-cut gate.
 * (EDHA_RULINGS.md R-83, answered 2026-09-07 (a) — Ben, dashboard, verbatim "a";
 *  TODO_REPO_HYGIENE #70. ENGINE-ONLY.)
 *
 * `ENGINE_INDEX.md` has said since 2026-07-26l that every heal path writing `hea` outside
 * `applyDamage` must pass `edhaHealCutGate`. Item 68 (fix pass 8) found three that did not, and left
 * them because closing the gap MOVES HP at the table and needed a ruling:
 *
 *   1. the `edha-regen` turn-end tick   — Mending Aura, Apex Form's vital regen, the adversary
 *                                          regen rules (The Garden Sow's Nexus-Fed);
 *   2. the decay lifesteal heal-back    — the decay owner draining HP back out of its victim;
 *   3. `edhaBurstDetonate`'s heal hits  — any burst whose spec heals the tokens it catches.
 *
 * So a creature carrying a "cannot regain HP" mark kept gaining HP from all three while an ordinary
 * heal on that same creature was blocked — the mark's own card promising one thing and the HP doing
 * another, which is the §10 drift direction that costs a table the most.
 *
 * WHAT THIS FILE PINS, AND WHY IT IS ONE FILE. Three writers, three mechanisms — a turn-sweep
 * resource write, a flag-driven tick's heal-back, and a payload of burst hits handed to a GM-side
 * writer — that make ONE promise ("a Withered creature does not regain HP"). Nothing structural
 * keeps them in step, and each is reachable only through its own hook, so each gets its own driver
 * and all three get the same three cases: **blocked → 0 and the card names the mark; halved → half;
 * unmarked → unchanged**. The halved row matters as much as the blocked one: a "fix" that simply
 * skipped a marked creature entirely would pass a blocked-only suite and silently delete the
 * Healing-Halved half of the mark.
 *
 * THE OTHER DIRECTION IS PINNED NEXT DOOR. `tests/drop-to-one-family.test.js` counts the gate's call
 * sites (2 → 5 here, one declared line per new site) and asserts that `edhaApplyBurstResults` —
 * the WRITER those burst hits land through — is still ungated, because Raise Dead's stabilising
 * `{amount: 1, heal: true}` rides that same path (R-10 (3): a floor against death is not regaining).
 * That is exactly why case 3 gates in the EMITTER and not in the writer.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, mockEffect, mockItem, stageWorld, withStubs,
        captureChat, sleep } = require("./harness.js");

const WITHERED = { fraction: 0, byName: "Withering Touch" };
const HALVED = { fraction: 0.5, byName: "Necrotic Grasp" };

/* A creature, optionally carrying a heal-cut mark. `mark` null = the control row. */
function patient(name, mark, { hp = 4, max = 20, type = "npc", items = [] } = {}) {
  const a = mockActor({
    name, id: name, uuid: `Actor.${name}`, type, items,
    system: { resources: { hea: { value: hp, max: { value: max } } } },
    effects: mark ? [mockEffect({ name: `${mark.byName} — No Healing`, flags: { healCut: mark } })] : [],
  });
  a.isOwner = true;
  a.getRollData = () => ({ tier: 1, skills: {} });
  for (const it of items) it.actor = a;
  return a;
}
const hpOf = (a) => a.system.resources.hea.value;
const allText = (cards) => cards.map((c) => c.content).join("\n");
/* The gate's own announcement — posted by edhaHealCutGate wherever it is consulted. Its presence is
 * how a test tells "the gate ran" from "the amount happened to be small". */
const gateCard = (cards, name) => cards.some((c) => new RegExp(`${name}</strong> (cannot regain HP|has their healing halved)`).test(c.content));

/* The lone-GM world every one of these sweeps checks for before writing (edhaDefBuffGmGate). */
function gmWorld(env, extra = {}) {
  const users = [{ id: "gm-1", isGM: true, active: true }];
  users.filter = Array.prototype.filter;
  users.activeGM = { isSelf: true };
  return stageWorld(env, {
    user: { id: "gm-1", isGM: true, targets: new Set(), character: null },
    users, placeables: [], ...extra,
  });
}

/* ================================================================================================
 * 1. THE `edha-regen` TURN-END TICK — Mending Aura's turn heals, Apex Form's vital regen, the
 *    adversary regen rules. Driven through the REAL `combatTurnChange` chain, because the sweep is
 *    only reachable from it and the tick has to survive sharing that hook with its twenty
 *    neighbours (the hook-timed-status-expiry pattern).
 * ============================================================================================= */

function combatantFor(actor, id) {
  return { id, actorId: actor.id, actor, name: actor.name,
    token: { object: { id: `t-${id}`, name: actor.name, actor, document: { disposition: 1 }, center: { x: 0, y: 0 } } } };
}

async function regenTurnEnd(env, subject) {
  const cards = captureChat(env);
  const mover = patient("Mover", null, { hp: 9, max: 9 });
  const list = [combatantFor(subject, "cb-subject"), combatantFor(mover, "cb-mover")];
  const combat = { id: "combat-regen", started: true, round: 2, turn: 1, turns: list,
    combatants: Object.assign([...list], { get: (id) => list.find((c) => c.id === id) ?? null }) };
  combat.combatant = list[1];
  const world = gmWorld(env, { actors: [subject, mover], combats: [combat] });
  const priorCombat = env.game.combat;
  env.game.combat = combat;
  try {
    await fireHook(env, "combatTurnChange", combat, { combatantId: "cb-subject" }, { combatantId: "cb-mover" });
    await sleep(5);   // the sweep is `void`-dispatched and awaits its writes
  } finally { env.game.combat = priorCombat; world.undo(); }
  return cards;
}

/* A regen carrier: one talent whose document carries the `edha-regen` rule (iron rule 2b — the
 * behaviour is ON the item, and this sweep is only its engine). */
function withRegen(name, mark, amount = 6) {
  const tal = mockItem({ name: "Mending Aura", events: [{ event: "use", handler: { type: "edha-regen", amount } }] });
  return patient(name, mark, { items: [tal] });
}

test("R-83 (a) regen tick: a WITHERED creature regains nothing, and the card names the mark", async () => {
  const env = loadEngine();
  const a = withRegen("Withered Ally", WITHERED);
  const cards = await regenTurnEnd(env, a);
  assert.strictEqual(hpOf(a), 4, "'cannot regain HP' must stop the turn-end regen tick too (R-83 (a))");
  assert.ok(gateCard(cards, "Withered Ally"), "the gate announces the mark");
  const text = allText(cards);
  assert.ok(/cannot regain HP \(Withering Touch\) — no healing lands/.test(text),
    "the regen card must SAY the mark blocked it (item 68's announcing contract)");
  assert.ok(!/\+6 HP applied/.test(text), "a blocked tick must never print the amount it wanted to heal");
});

test("R-83 (a) regen tick: a HALVED creature regains half, and the card prints the halved number", async () => {
  const env = loadEngine();
  const a = withRegen("Halved Ally", HALVED);
  const cards = await regenTurnEnd(env, a);
  assert.strictEqual(hpOf(a), 7, "6 halved is 3, on top of 4");
  const text = allText(cards);
  assert.ok(/\+3 HP applied/.test(text), "the card reports what LANDED, not what the rule rolled");
  assert.ok(!/\+6 HP applied/.test(text), "the un-gated 6 must not survive anywhere on the card");
});

test("R-83 (a) regen tick: an UNMARKED creature is untouched by the gate — full 6", async () => {
  const env = loadEngine();
  const a = withRegen("Plain Ally", null);
  const cards = await regenTurnEnd(env, a);
  assert.strictEqual(hpOf(a), 10, "no mark, no cut");
  assert.ok(/\+6 HP applied/.test(allText(cards)));
  assert.ok(!gateCard(cards, "Plain Ally"), "no mark means the gate says nothing at all");
});

/* ================================================================================================
 * 2. THE DECAY LIFESTEAL HEAL-BACK — `edhaDecayTurnTick`'s heal on the decay's OWNER. The victim
 *    still rots either way; only the drain-back is gated.
 * ============================================================================================= */

async function decayTick(env, owner, { healFraction = 0.5, formula = "6" } = {}) {
  const cards = captureChat(env);
  const victim = patient("Decaying Victim", null, { hp: 12, max: 12 });
  victim.statuses = new Set(["decaying"]);
  victim.applyDamage = async (instances) => {
    const amt = instances.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    victim.system.resources.hea.value -= amt;
  };
  await victim.setFlag("edha-content", "decay",
    { status: "decaying", formula, ownerId: owner.id, healFraction, sourceName: "Rot of the Nine", type: "vital" });
  const combat = { id: "combat-decay", started: true, round: 2, turn: 0,
    combatant: { actorId: victim.id, actor: victim }, turns: [], combatants: [] };
  const world = gmWorld(env, { actors: [owner, victim], combats: [combat] });
  const priorCombat = env.game.combat;
  env.game.combat = combat;
  try {
    await fireHook(env, "combatTurnChange", combat, null, null);
    await sleep(5);
  } finally { env.game.combat = priorCombat; world.undo(); }
  return { cards, victim };
}

test("R-83 (a) decay lifesteal: a WITHERED owner drains nothing back, and the card names the mark", async () => {
  const env = loadEngine();
  const owner = patient("Withered Necromancer", WITHERED, { hp: 5, max: 30, type: "character" });
  const { cards, victim } = await decayTick(env, owner);
  assert.strictEqual(hpOf(owner), 5, "'cannot regain HP' must stop the lifesteal heal-back too (R-83 (a))");
  assert.strictEqual(hpOf(victim), 6, "the decay DAMAGE is untouched — the victim still rots");
  assert.ok(gateCard(cards, "Withered Necromancer"), "the gate announces the mark");
  const text = allText(cards);
  assert.ok(/cannot regain HP \(Withering Touch\) — no healing lands/.test(text),
    "the decay card must SAY the mark blocked the drain-back");
  assert.ok(!/regains <strong>3<\/strong> HP/.test(text), "a blocked drain-back must not print a number");
});

test("R-83 (a) decay lifesteal: a HALVED owner drains half back, and the card prints the halved number", async () => {
  const env = loadEngine();
  const owner = patient("Halved Necromancer", HALVED, { hp: 5, max: 30, type: "character" });
  const { cards } = await decayTick(env, owner);
  assert.strictEqual(hpOf(owner), 6, "half of the 3-HP drain-back is 1");
  assert.ok(/regains <strong>1<\/strong> HP/.test(allText(cards)), "the card reports what LANDED");
});

test("R-83 (a) decay lifesteal: an UNMARKED owner drains the full half — unchanged behaviour", async () => {
  const env = loadEngine();
  const owner = patient("Plain Necromancer", null, { hp: 5, max: 30, type: "character" });
  const { cards } = await decayTick(env, owner);
  assert.strictEqual(hpOf(owner), 8, "half of 6 is 3, on top of 5");
  assert.ok(/regains <strong>3<\/strong> HP/.test(allText(cards)));
  assert.ok(!gateCard(cards, "Plain Necromancer"), "no mark means the gate says nothing at all");
});

/* ================================================================================================
 * 3. `edhaBurstDetonate`'s HEAL HITS — gated PER CAUGHT TOKEN as the payload is built, so a blocked
 *    creature contributes no hit at all and the relay leg never sees it. The whole cast → detonate
 *    lifecycle is driven, because `EDHA_BURST_PENDING` is a lexical const with `edhaCastBurst` as
 *    its only door — which also proves the gate sits on the path a real click takes.
 * ============================================================================================= */

async function healBurst(env, targets) {
  const cards = captureChat(env);
  const caster = patient("Bench — White", null, { hp: 20, max: 20, type: "character" });
  const item = mockItem({ name: "Renewing Burst", actor: caster, system: { damage: { formula: "6", type: "heal" } } });
  const byUuid = new Map([[caster.uuid, caster], [item.uuid, item], ...targets.map((t) => [t.uuid, t])]);
  const tokens = targets.map((t, i) => ({ id: `tok-${i}`, name: t.name, actor: t, document: { disposition: 1 }, center: { x: 500, y: 500 } }));
  const tpl = { id: "tpl-1", x: 500, y: 500, async delete() {} };
  const scene = { id: "scene-1", dimensions: { width: 1000, height: 1000 },
    templates: { get: (id) => (id === "tpl-1" ? tpl : null) },
    async createEmbeddedDocuments() { return [tpl]; } };
  const priorCanvas = env.canvas.scene;
  env.canvas.scene = scene;
  const world = gmWorld(env, { actors: [caster, ...targets], scenes: { current: scene } });
  try {
    await withStubs(env, {
      fromUuid: async (uuid) => byUuid.get(uuid) ?? null,
      edhaConsumeCost: () => true,
      edhaRefundCost: () => {},
      edhaDrawCircle: async () => null,
      edhaPickPoint: async () => ({ x: 500, y: 500 }),
      edhaTokensInCircle: () => tokens,
      edhaActorSide: () => 1,
      edhaCheckMultiHit: () => {},
    }, async () => {
      await env.edhaCastBurst(item, { color: "white", affects: "allies", area: { sizeFt: 10 }, burst: { heal: true, rangeFt: 30 } });
      const pid = (allText(cards).match(/data-edha-burst="([^"]+)"/) || [])[1];
      assert.ok(pid, "edhaCastBurst must post a Detonate card carrying the pending id");
      await env.edhaBurstDetonate(pid, null);
      await sleep(5);
    });
  } finally { world.undo(); env.canvas.scene = priorCanvas; }
  return cards;
}

test("R-83 (a) burst heal: a WITHERED token under the burst gains nothing, and its line names the mark", async () => {
  const env = loadEngine();
  const withered = patient("Withered Target", WITHERED, { hp: 4, max: 20 });
  const plain = patient("Plain Target", null, { hp: 4, max: 20 });
  const cards = await healBurst(env, [withered, plain]);
  assert.strictEqual(hpOf(withered), 4, "'cannot regain HP' must stop a burst heal too (R-83 (a))");
  assert.strictEqual(hpOf(plain), 10, "and the same burst still heals everyone else in it, in full");
  assert.ok(gateCard(cards, "Withered Target"), "the gate announces the mark");
  const text = allText(cards);
  assert.ok(/Withered Target cannot regain HP \(Withering Touch\) — no healing lands/.test(text),
    "the burst card's line for the blocked creature must name the mark, not print +6");
  assert.ok(!/Withered Target: \+6 HP/.test(text), "a blocked target must never be reported as healed");
  assert.ok(/Plain Target: \+6 HP \(capped at max\)/.test(text), "the unmarked line is untouched");
});

test("R-83 (a) burst heal: a HALVED token gains half, and its line prints the halved number", async () => {
  const env = loadEngine();
  const halved = patient("Halved Target", HALVED, { hp: 4, max: 20 });
  const cards = await healBurst(env, [halved]);
  assert.strictEqual(hpOf(halved), 7, "6 halved is 3, on top of 4");
  const text = allText(cards);
  assert.ok(/Halved Target: \+3 HP \(capped at max\)/.test(text), "the card reports what LANDED");
  assert.ok(!/\+6 HP/.test(text), "the un-gated 6 must not survive anywhere on the card");
});

test("R-83 (a) burst heal: an UNMARKED token is untouched by the gate — full 6", async () => {
  const env = loadEngine();
  const plain = patient("Plain Target", null, { hp: 4, max: 20 });
  const cards = await healBurst(env, [plain]);
  assert.strictEqual(hpOf(plain), 10, "no mark, no cut");
  assert.ok(!gateCard(cards, "Plain Target"), "no mark means the gate says nothing at all");
});
