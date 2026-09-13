/* REGRESSION — item 120 / fix pass 11: a GATED tick's card may not print the un-gated number.
 * (TODO_REPO_HYGIENE #120; bench run 45's defect row; the 2026-09-13 changelog delta.)
 *
 * WHAT THE BENCH MEASURED. Run 45 drove the `B45 Garden Sow`'s `Nexus-Fed` (`edha-regen`, amount 5)
 * at turn end while the Sow carried a Withering Touch `healCut {fraction: 0}` mark. The HP write
 * was correctly suppressed and the card's parenthetical said so — and the SAME card's body said
 * *"Nexus-Fed — the Sow regains 5 HP."* first:
 *
 *   ⏰ Nexus-Fed (B45 Garden Sow): **Nexus-Fed — the Sow regains 5 HP.**
 *   (no HP applied — B45 Garden Sow cannot regain HP (Withering Touch) — no healing lands.)
 *
 * The GM reads the 5. Item 68's contract — a heal card is built from what was DELIVERED — was
 * honoured in the parenthetical and broken in the body of the same sentence.
 *
 * ROOT CAUSE, AND WHY IT IS ONE SITE. The sweep composed the body as `h.note || line`: a rule that
 * carries its own static `note` WINS over the line `edhaHealLine` composed from the delivered
 * amount. That note was authored before any gate existed, so it is un-gated by construction. A
 * sweep of every heal announcer in the engine (the twelve `edhaHealLine` callers) found this to be
 * the ONLY site holding both a static note and a delivered line — 70-1's Apex Form tick, the
 * regrowth tick, H10's `hea` arm, the Bulwark pair, Death, Power and the burst relay all compose
 * from `line` alone, and `edhaDispatchTestResult` appends its rule note as a parenthetical *why*
 * rather than in place of the line. So the fix is one shared decision, `edhaDeliveredNote`, not a
 * family sweep.
 *
 * MUTATION (re-verified for this pass): restore `note: h.note || \`${line}.\`` at the sweep's
 * `edhaPostCueCard` call and case 1 below fails with the bench's exact body — "regains 5 HP" on a
 * card whose own parenthetical says no healing lands. Change the helper's `got < asked` to
 * `got <= 0` and case 2 (the HALVED tick) fails the same way, printing 5 where 2 landed.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, mockItem, mockEffect, stageWorld, captureChat, sleep } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");
const NOTE = "Nexus-Fed — the Sow regains 5 HP.";

/* ---- 1. the pure decision ------------------------------------------------------------------- */

test("edhaDeliveredNote: an UNGATED payload keeps the author's static note", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaDeliveredNote(NOTE, "regains 5 HP.", 5, 5), NOTE);
});

test("edhaDeliveredNote: a BLOCKED payload drops the static note for the composed line", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaDeliveredNote(NOTE, "cannot regain HP — no healing lands.", 5, 0),
    "cannot regain HP — no healing lands.");
});

test("edhaDeliveredNote: a HALVED payload is gated too — less landed than was asked for", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaDeliveredNote(NOTE, "regains 2 HP.", 5, 2), "regains 2 HP.");
});

test("edhaDeliveredNote: no static note at all falls through to the line, gated or not", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaDeliveredNote("", "regains 5 HP.", 5, 5), "regains 5 HP.");
  assert.strictEqual(env.edhaDeliveredNote(undefined, "regains 5 HP.", 5, 5), "regains 5 HP.");
  assert.strictEqual(env.edhaDeliveredNote("   ", "regains 5 HP.", 5, 5), "regains 5 HP.");
});

test("edhaDeliveredNote: nothing to say returns \"\" rather than a bare separator", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaDeliveredNote("", "", 0, 0), "");
  assert.strictEqual(env.edhaDeliveredNote(null, "", 5, 0), "");
});

test("edhaDeliveredNote: a payload that OVER-delivers is not gated (defensive, not a live case)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaDeliveredNote(NOTE, "regains 7 HP.", 5, 7), NOTE);
});

/* ---- 2. the shipped sweep, driven through the real combatTurnChange chain -------------------- */

/* The Garden Sow as the bench built it: hurt (so the clamp has room), carrying `Nexus-Fed` as an
 * `edha-regen` rule with BOTH an amount and its own static note — the shape that produced the bug.
 * `mark` is the healCut flag Withering Touch / Necrotic Grasp write. */
function sow(mark, { value = 10, max = 30, amount = 5, note = NOTE } = {}) {
  const actor = mockActor({ name: "B45 Garden Sow", id: "sow", uuid: "Actor.sow", type: "npc",
    system: { resources: { hea: { value, max: { value: max } } } },
    effects: mark ? [mockEffect({ name: mark.byName, flags: { healCut: mark } })] : [] });
  actor.isOwner = true;
  actor.items = [mockItem({ name: "Nexus-Fed", actor,
    events: [{ event: "edha-turn", handler: { type: "edha-regen", amount, note } }] })];
  return actor;
}
const WITHERED = { fraction: 0, byName: "Withering Touch" };
const HALVED = { fraction: 0.5, byName: "Necrotic Grasp" };

/* Fire the whole registered `combatTurnChange` chain with the Sow as the combatant whose turn just
 * ENDED. `prior` is resolved through `combat.combatants.get(prior.combatantId).token.object`, which
 * is the only shape the sweep reads, and `current` is left undefined so the enemy-turn-start half
 * of the same sweep finds no mover and does nothing. No `game.combat` at all, so the once-per-round
 * slot is unrestricted (`edhaCombatRoundOf` → null) and every case starts from the same state. */
async function turnEnd(actor) {
  const env = loadEngine();
  const cards = captureChat(env);
  const token = { id: "t-sow", name: actor.name, actor, document: { disposition: -1 } };
  const combat = { id: "c1", started: false, round: 1, turn: 0, combatant: null,
    combatants: { get: (id) => (id === "cbt-sow" ? { token: { object: token } } : null) } };
  /* `game.users` must be BOTH the array `edhaGmIds` filters (the cue card is whispered to every
   * GM — R-62) and the object carrying `activeGM` that the one-applier gate reads. */
  const users = Object.assign([{ id: "gm-1", isGM: true, active: true }], { activeGM: { isSelf: true } });
  const world = stageWorld(env, {
    user: { id: "gm-1", isGM: true, targets: new Set(), character: null },
    users, actors: [actor], placeables: [token], combats: [],
  });
  try {
    await fireHook(env, "combatTurnChange", combat, { combatantId: "cbt-sow" }, undefined);
    await sleep(5);
  } finally { world.undo(); }
  return cards.filter(c => /Nexus-Fed/.test(c.content)).map(c => text(c.content));
}

test("the bench's take: a WITHERED tick's card carries no un-gated number", async () => {
  const actor = sow(WITHERED);
  const [card] = await turnEnd(actor);
  assert.ok(card, "the regen sweep must still post its card when the heal is blocked");
  assert.ok(!/regains 5 HP/.test(card), `the un-gated 5 must not appear anywhere on the card: ${card}`);
  assert.ok(/no healing lands/.test(card), `the card must say why nothing landed: ${card}`);
  assert.ok(/cannot regain HP/.test(card) && /Withering Touch/.test(card),
    `the card must name the mark: ${card}`);
  assert.strictEqual(actor.system.resources.hea.value, 10, "and no HP may be written");
});

test("a HALVED tick prints the halved number, never the rolled one", async () => {
  const actor = sow(HALVED);
  const [card] = await turnEnd(actor);
  assert.ok(card, "the regen sweep must post its card");
  assert.ok(!/regains 5 HP/.test(card), `the rolled 5 must not appear: ${card}`);
  assert.ok(/regains 2 HP/.test(card), `the delivered 2 must: ${card}`);
  assert.strictEqual(actor.system.resources.hea.value, 12, "and exactly 2 HP lands");
});

test("the UNGATED tick is unchanged — the author's note is still what the card says", async () => {
  const actor = sow(null);
  const [card] = await turnEnd(actor);
  assert.ok(card, "the regen sweep must post its card");
  assert.ok(card.includes(NOTE), `an un-gated tick keeps the rule's own note: ${card}`);
  assert.ok(/\+5 HP applied/.test(card), `and reports the applied amount: ${card}`);
  assert.strictEqual(actor.system.resources.hea.value, 15, "and the full 5 lands");
});

test("a rule with NO note still composes its card from the delivered line (ungated and gated)", async () => {
  const open = await turnEnd(sow(null, { note: "" }));
  assert.ok(/regains 5 HP/.test(open[0]), `an un-gated, note-less tick still reports: ${open[0]}`);
  const shut = await turnEnd(sow(WITHERED, { note: "" }));
  assert.ok(!/regains 5 HP/.test(shut[0]) && /no healing lands/.test(shut[0]),
    `a gated, note-less tick reports the gate: ${shut[0]}`);
});
