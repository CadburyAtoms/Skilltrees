/* REGRESSION — R-38: a move the Dread-Presence veto refuses SAYS SO, in chat, once per round.
 * (EDHA_RULINGS.md R-38, answered 2026-09-06 (a); TODO_REPO_HYGIENE #48, fix pass 7b.)
 *
 * The `preUpdateToken` veto works exactly as designed: a Weakened creature inside a rule owner's
 * range cannot willingly move closer to any of its allies, and the update is refused. The problem
 * was the EVIDENCE. The only trace anywhere was a `ui.notifications` toast on the moving client —
 * transient, unlogged, gone before anyone looked. At bench run 21 three moves "resolved with no
 * error and did nothing", which is byte-for-byte how a broken range gate presents, and cost the
 * run real time before the toast was caught.
 *
 * So the refusal posts a whispered card to the mover's owners + the GMs, naming the talent that
 * stopped it. THROTTLED per token per round, because a dragged path re-fires `preUpdateToken` for
 * every waypoint and each one is refused: one card per waypoint would be the same silence wearing
 * a louder costume.
 *
 * Two halves, pinned separately:
 *   • the GATE (`edhaMoveVetoAnnounceGate`) — pure, with the ledger injected, so the round
 *     semantics are provable without a combat;
 *   • the HOOK — the real `preUpdateToken` registration, driven through fireHook, proving the move
 *     is still refused, the card is whispered to the right audience, and it names the talent.
 *
 * Mutation: drop the `if (edhaMoveVetoAnnounceGate(...))` guard around the ChatMessage.create and
 * the "two refused moves in one round → ONE card" case fails with 2 cards; drop the whole
 * ChatMessage.create and the first hook case fails with 0.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, captureChat, fireHook } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");

/* --- the gate, pure ---------------------------------------------------------------------------- */

test("R-38 gate: two refused moves in ONE round announce once; a NEW round announces again", () => {
  const env = loadEngine();
  const ledger = new Map();
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", 3, ledger), true,  "the first refusal speaks");
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", 3, ledger), false, "the dragged path's second waypoint is silent");
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", 3, ledger), false, "…and the third");
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", 4, ledger), true,  "next round, say it again");
});

test("R-38 gate: the throttle is PER TOKEN — one creature's card never silences another's", () => {
  const env = loadEngine();
  const ledger = new Map();
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", 3, ledger), true);
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok2", 3, ledger), true);
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", 3, ledger), false);
});

test("R-38 gate: out of combat (round null) it still throttles, and an id-less token always speaks", () => {
  const env = loadEngine();
  const ledger = new Map();
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", null, ledger), true);
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", null, ledger), false);
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("tok1", 1, ledger), true, "combat starting is a new beat");
  // No identity to throttle on: never swallow the card — a missing id must not mean a missing reason.
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("", null, ledger), true);
  assert.strictEqual(env.edhaMoveVetoAnnounceGate("", null, ledger), true);
});

/* --- the hook, end to end ---------------------------------------------------------------------- */

/* One Weakened mover, one ally it is trying to close on, one adversary carrying the move-veto
 * rule. `edhaWatchersOfRule` is the only stub: it is the rule-lookup this hook reads, and staging
 * a whole owned-talent world to produce one watcher would test the lookup, not the announcement. */
function stageVeto(env, { round = 3 } = {}) {
  const mover = mockActor({ name: "Bench — Red", id: "mover", statuses: ["weakened"], system: { resources: { hea: { value: 10 } } } });
  const ally = mockActor({ name: "Soggy Bottom", id: "ally", system: { resources: { hea: { value: 10 } } } });
  const presence = mockActor({ name: "Dirgehound", id: "hound", type: "npc" });
  const moverTok = { id: "tm", actor: mover, document: { disposition: 1 }, center: { x: 500, y: 500 } };
  const allyTok = { id: "ta", actor: ally, document: { disposition: 1 }, center: { x: 100, y: 500 } };
  const houndTok = { id: "th", actor: presence, document: { disposition: -1 }, center: { x: 520, y: 520 } };

  const cards = captureChat(env);
  const world = stageWorld(env, {
    actors: [mover, ally, presence],
    placeables: [moverTok, allyTok, houndTok],
    user: { isGM: true, id: "gm1" },
    users: Object.assign([{ id: "gm1", isGM: true, active: true }, { id: "p1", isGM: false, active: true }], { activeGM: { isSelf: true } }),
  });
  env.game.users.filter = Array.prototype.filter;
  mover.testUserPermission = (u, lvl) => u.id === "p1" && lvl === "OWNER";
  const prior = { watch: env.edhaWatchersOfRule, tok: env.edhaCasterToken, within: env.edhaTokensWithin, combat: env.game.combat };
  env.game.combat = { round };
  env.edhaWatchersOfRule = (type) => (type === "edha-move-veto"
    ? [{ actor: presence, item: { name: "Dread Presence" }, handler: { moverStatus: "weakened", rangeFt: 30 } }] : []);
  env.edhaCasterToken = (a) => (a === presence ? houndTok : null);
  env.edhaTokensWithin = () => [moverTok];
  return {
    cards,
    // A move WESTWARD closes on the ally at x=100 — the refusal case.
    async move(toX = 400) {
      return fireHook(env, "preUpdateToken",
        { id: "tm", uuid: "Scene.s1.Token.tm", object: moverTok, actor: mover, x: 500, y: 500, width: 1, height: 1, disposition: 1, parent: { grid: { size: 100, distance: 5 } } },
        { x: toX }, {});
    },
    undo() { Object.assign(env, { edhaWatchersOfRule: prior.watch, edhaCasterToken: prior.tok, edhaTokensWithin: prior.within }); env.game.combat = prior.combat; world.undo(); },
  };
}

test("R-38: a refused move posts ONE whispered card naming the talent that stopped it", async () => {
  const env = loadEngine();
  const s = stageVeto(env);
  try {
    const results = await s.move();
    assert.ok(results.includes(false), "the move is still refused — the announcement must not soften the veto");
    assert.strictEqual(s.cards.length, 1, "exactly one card");
    const said = text(s.cards[0].content);
    assert.ok(said.startsWith("🚫 Dread Presence:"), `the card must name the talent: ${said}`);
    assert.ok(said.includes("Bench — Red is Weakened and cannot willingly move closer to Soggy Bottom"), said);
  } finally { s.undo(); }
});

test("R-38: the card is WHISPERED to the mover's owners + the GM, not posted publicly", async () => {
  const env = loadEngine();
  const s = stageVeto(env);
  try {
    await s.move();
    const w = s.cards[0].whisper;
    assert.ok(Array.isArray(w) && w.length, "a public card would tell the whole table which ally is pinning them");
    assert.deepStrictEqual([...w].sort(), ["gm1", "p1"]);
  } finally { s.undo(); }
});

test("R-38: a dragged path — two refusals in one round — posts ONE card; the next round posts another", async () => {
  const env = loadEngine();
  const s = stageVeto(env, { round: 3 });
  try {
    await s.move(400);
    await s.move(300);                       // the same drag's next waypoint
    assert.strictEqual(s.cards.length, 1, "the drag spammed the log");
    env.game.combat.round = 4;
    await s.move(400);
    assert.strictEqual(s.cards.length, 2, "a new round is a new beat and must speak again");
  } finally { s.undo(); }
});

test("R-38: a move that does NOT close on an ally is neither refused nor announced", async () => {
  const env = loadEngine();
  const s = stageVeto(env);
  try {
    const results = await s.move(900);       // away from the ally at x = 100
    assert.ok(!results.includes(false), "a legal move must still resolve");
    assert.strictEqual(s.cards.length, 0, "nothing to announce");
  } finally { s.undo(); }
});
