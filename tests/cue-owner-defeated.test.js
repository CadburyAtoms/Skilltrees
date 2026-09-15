/* item 161 (fix pass 13, 2026-09-15) — a DEFEATED creature's GM cues stay silent.
 *
 * Bench run 48 (YARD-1, docs/analysis/bestiary/YARDSTICK-2026-09-14.md): Rootling Swarm (2) dropped
 * to 0 in round 1 — the system's `dead` status on it — and at round 2's first hostile turn start still
 * whispered "⏰ Territorial Instinct … (Bench Copy — Ishee's turn starts in range.)" beside the two
 * living rootlings. `edhaTurnCueSweep`'s enemy-turn-start loop filtered on hostility and on
 * `edhaStillFightingElsewhere`, nothing else. The same sweep's turn-end branch and the damage sweep's
 * `ally-drops` OWNER loop read no liveness either, and the victim's own `damaged` cue fired on a corpse
 * struck again — the applyDamage wrapper's `dealt` counts damage INSTANCES, not HP that moved.
 *
 * One pure predicate, `edhaActorDefeated(actor, combatant)` — HP at or below 0, the system's DEFEATED
 * status, or a combatant marked defeated — now gates every cue OWNER. The victim's `damaged` cue is
 * gated on the HP it had BEFORE the write (its `hp-below` crossings already needed prevHp above the
 * line). `edhaLootDefeated` delegates to the same predicate, so the engine has one "defeated".
 *
 * The turn cases fire the WHOLE registered `combatTurnChange` chain (tests/harness.js fireHook), staged
 * the way tests/gated-note.test.js stages the same sweep's turn-end half: an un-started combat, one GM
 * who is the active GM, no `game.combat` (so the once-per-round slot is unrestricted).
 *
 * Reversion: remove the `edhaActorDefeated` gate from the enemy-turn-start loop and the "bench's take"
 * case fails with the dead rootling's card beside the living one's.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, mockItem, stageWorld, captureChat, sleep } = require("./harness.js");

const GS = 100;   // 100 px per square, 5 ft per square (the harness's distance fallback)

function cueItem(name, trigger, dials = {}) {
  return mockItem({ name, type: "talent",
    events: [{ event: "edha-apply-watch", handler: { type: "edha-gm-cue", trigger, note: `${name} reacts.`, ...dials } }] });
}
function creature(name, { hp = 5, dead = false, side = -1, x = 0, y = 0, items = [] } = {}) {
  const actor = mockActor({ name, type: "adversary", items, statuses: dead ? ["dead"] : [],
                            system: { resources: { hea: { value: hp, max: { value: 10 } } } } });
  actor.prototypeToken = { disposition: side };
  const tok = { id: `tok-${name}`, name, actor, document: { id: `tok-${name}`, disposition: side }, center: { x, y } };
  actor.getActiveTokens = () => [tok];
  for (const it of items) it.actor = actor;
  return { actor, tok };
}
function gmWorld(env, placeables, actors) {
  const users = Object.assign([{ id: "gm-1", isGM: true, active: true }], { activeGM: { isSelf: true } });
  return stageWorld(env, { user: { id: "gm-1", isGM: true, targets: new Set(), character: null },
                           users, actors, placeables, combats: [] });
}
function combatOf(entries) {   // entries: [{id, tok, defeated}]
  const list = entries.map((e) => ({ id: e.id, tokenId: e.tok.document.id, defeated: !!e.defeated, token: { object: e.tok } }));
  return { id: "c1", started: false, round: 2, turn: 0, combatant: null,
    combatants: { get: (id) => list.find((c) => c.id === id) ?? null, find: (fn) => list.find(fn) } };
}

/* ---- the predicate ---------------------------------------------------------------------------- */
test("edhaActorDefeated: HP at or below 0, the DEFEATED status, or a defeated combatant — nothing else", () => {
  const env = loadEngine();
  const a = (hp, o = {}) => mockActor({ name: "X", system: { resources: { hea: { value: hp } } }, ...o });
  assert.strictEqual(env.edhaActorDefeated(a(0)), true);
  assert.strictEqual(env.edhaActorDefeated(a(-2)), true);
  assert.strictEqual(env.edhaActorDefeated(a(5)), false);
  assert.strictEqual(env.edhaActorDefeated(a(5, { statuses: ["dead"] })), true, "the system's DEFEATED marker");
  assert.strictEqual(env.edhaActorDefeated(a(5), { defeated: true }), true, "a combatant marked defeated in the tracker");
  assert.strictEqual(env.edhaActorDefeated(a(5), { defeated: false }), false);
  assert.strictEqual(env.edhaActorDefeated(mockActor({ name: "no HP resource" })), false, "a MISSING HP is a failed read, not a defeat");
  assert.strictEqual(env.edhaActorDefeated(null), false);
  env.CONFIG.specialStatusEffects = { DEFEATED: "defeated" };
  assert.strictEqual(env.edhaActorDefeated(a(5, { statuses: ["dead"] })), false, "reads CONFIG.specialStatusEffects.DEFEATED");
  assert.strictEqual(env.edhaActorDefeated(a(5, { statuses: ["defeated"] })), true);
  delete env.CONFIG.specialStatusEffects;
  // one definition: loot's predicate is the same answer
  assert.strictEqual(env.edhaLootDefeated(a(0)), true);
  assert.strictEqual(env.edhaLootDefeated(a(5, { statuses: ["dead"] })), true);
  assert.strictEqual(env.edhaLootDefeated(a(5)), false);
});

/* ---- enemy-turn-start: the bench's take ---------------------------------------------------------- */
async function hostileTurnStarts({ deadHp = 0, deadStatus = true, combatantDefeated = false } = {}) {
  const env = loadEngine();
  const cards = captureChat(env);
  const ishee = creature("Bench Copy — Ishee", { side: 1, x: 5 * GS, y: 5 * GS });
  const live = creature("Rootling Swarm (1)", { hp: 5, x: 6 * GS, y: 5 * GS,
    items: [cueItem("Territorial Instinct", "enemy-turn-start", { rangeFt: 5 })] });
  const dead = creature("Rootling Swarm (2)", { hp: deadHp, dead: deadStatus, x: 5 * GS, y: 6 * GS,
    items: [cueItem("Territorial Instinct", "enemy-turn-start", { rangeFt: 5 })] });
  const combat = combatOf([{ id: "cbt-ishee", tok: ishee.tok }, { id: "cbt-live", tok: live.tok },
                           { id: "cbt-dead", tok: dead.tok, defeated: combatantDefeated }]);
  const world = gmWorld(env, [ishee.tok, live.tok, dead.tok], [ishee.actor, live.actor, dead.actor]);
  try {
    await fireHook(env, "combatTurnChange", combat, undefined, { combatantId: "cbt-ishee" });
    await sleep(5);
  } finally { world.undo(); }
  return cards.filter((c) => /Territorial Instinct/.test(c.content)).map((c) => c.owner);
}

test("item 161 — the bench's take: a DEAD rootling posts nothing at a hostile's turn start; the living one still cues", async () => {
  const owners = await hostileTurnStarts();
  assert.deepStrictEqual(owners, ["Rootling Swarm (1)"], `expected only the living rootling to cue — got [${owners.join(", ")}]`);
});

test("item 161: HP 0 alone silences it (no dead marker yet), and so does a combatant marked defeated at HP 5", async () => {
  assert.deepStrictEqual(await hostileTurnStarts({ deadHp: 0, deadStatus: false }), ["Rootling Swarm (1)"]);
  assert.deepStrictEqual(await hostileTurnStarts({ deadHp: 5, deadStatus: false, combatantDefeated: true }), ["Rootling Swarm (1)"]);
});

test("item 161 control: with both rootlings alive, both cue — the gate removes the dead, nobody else", async () => {
  const owners = await hostileTurnStarts({ deadHp: 5, deadStatus: false });
  assert.deepStrictEqual(owners.slice().sort(), ["Rootling Swarm (1)", "Rootling Swarm (2)"]);
});

/* ---- turn-end: the owner's own cue after it died on its turn ---------------------------------------- */
test("item 161: a creature that ends its turn defeated posts no turn-end cue", async () => {
  const run = async (hp, dead) => {
    const env = loadEngine();
    const cards = captureChat(env);
    const glyph = creature("Glyph Warden", { hp, dead, items: [cueItem("Glyph Pulse", "turn-end", { everyNRounds: 1 })] });
    const combat = combatOf([{ id: "cbt-glyph", tok: glyph.tok }]);
    const world = gmWorld(env, [glyph.tok], [glyph.actor]);
    try { await fireHook(env, "combatTurnChange", combat, { combatantId: "cbt-glyph" }, undefined); await sleep(5); }
    finally { world.undo(); }
    return cards.filter((c) => /Glyph Pulse/.test(c.content)).length;
  };
  assert.strictEqual(await run(0, true), 0, "a defeated owner's turn-end cue fired");
  assert.strictEqual(await run(6, false), 1, "control: a living owner's turn-end cue must still fire");
});

/* ---- the damage sweep: ally-drops owners, and a corpse struck again --------------------------------- */
test("item 161: a fallen pack-mate's ally-drops cue stays silent when the next one drops", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const victim = creature("Cullwolf (3)", { hp: 0, x: 5 * GS, y: 5 * GS });
  const liveMate = creature("Cullwolf (1)", { hp: 7, x: 6 * GS, y: 5 * GS, items: [cueItem("Pack Grief", "ally-drops")] });
  const deadMate = creature("Cullwolf (2)", { hp: 0, dead: true, x: 4 * GS, y: 5 * GS, items: [cueItem("Pack Grief", "ally-drops")] });
  const world = gmWorld(env, [victim.tok, liveMate.tok, deadMate.tok], [victim.actor, liveMate.actor, deadMate.actor]);
  try { await env.edhaGmCueDamageSweep(victim.actor, 4, 0, 10); await sleep(5); }
  finally { world.undo(); }
  assert.deepStrictEqual(cards.filter((c) => /Pack Grief/.test(c.content)).map((c) => c.owner), ["Cullwolf (1)"]);
});

test("item 161: a corpse struck again posts no `damaged` cue; the same creature alive does", async () => {
  const run = async (prevHp, newHp) => {
    const env = loadEngine();
    const cards = captureChat(env);
    const stalker = creature("Stalker", { hp: newHp, dead: newHp <= 0, items: [cueItem("Fade", "damaged")] });
    const world = gmWorld(env, [stalker.tok], [stalker.actor]);
    try { await env.edhaGmCueDamageSweep(stalker.actor, prevHp, newHp, 10); await sleep(5); }
    finally { world.undo(); }
    return cards.filter((c) => /Fade/.test(c.content)).length;
  };
  assert.strictEqual(await run(0, 0), 0, "a creature already at 0 before the hit reacted to it");
  assert.strictEqual(await run(6, 2), 1, "control: a living creature's damaged cue must still fire");
  assert.strictEqual(await run(4, 0), 1, "the killing blow itself is still a hit on a living creature");
});
