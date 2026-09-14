/* A STATUS CARD NEVER CLAIMS A CONDITION IMMUNITY REFUSED — TODO item 149 (card half),
 * fix pass 12 (bench run 47, 2026-09-14).
 *
 * Measured while driving BR-1. A Risen Servant summoned by `Bench — Death` correctly carries
 * `system.immunities.condition` `{compelled: true, disoriented: true, frightened: true}`, and
 * `Bench — Power`'s **Kneel** rolled 25 vs COG 11, SUCCESS. The status was REFUSED — the cosmere
 * Actor's `toggleStatusEffect` override warned *"Risen Servant is immune to Compelled"* and
 * `statuses` stayed `[]` — and the talent's card posted anyway, verbatim:
 *   "🎯 Kneel: Risen Servant (Bench — Death) is Compelled (by Bench — Power). Next action: move
 *    toward the compeller or do nothing — movement ENFORCED (only distance-closing moves pass)."
 * A GM reading the chat log rules the servant Compelled. Same class as item 120 / item 124 on the
 * healing side, where `edhaDeliveredNote` exists so a card cannot claim a delivery that never was.
 *
 * The COST half is deliberately untouched here — that is R-127, still open with Ben.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, eq } = require("./harness.js");

const env = loadEngine();

/* --- edhaConditionImmune (pure) --------------------------------------------------------------- */

const RISEN_SERVANT = { immunities: { condition: { compelled: true, disoriented: true, frightened: true } } };

test("edhaConditionImmune: reads system.immunities.condition the way the system's own override does", () => {
  const servant = mockActor({ name: "Risen Servant", type: "adversary", system: RISEN_SERVANT });
  assert.strictEqual(env.edhaConditionImmune(servant, "compelled"), true);
  assert.strictEqual(env.edhaConditionImmune(servant, "slowed"), false, "an UNLISTED status is not immune — the control the bench used");
});

test("edhaConditionImmune: a FALSE entry is not an immunity (the map holds both)", () => {
  const actor = mockActor({ name: "Trooper", type: "adversary", system: { immunities: { condition: { compelled: false } } } });
  assert.strictEqual(env.edhaConditionImmune(actor, "compelled"), false);
});

test("edhaConditionImmune: an actor with no immunities block at all is never immune, and never throws", () => {
  assert.strictEqual(env.edhaConditionImmune(mockActor({ name: "Plain" }), "compelled"), false);
  assert.strictEqual(env.edhaConditionImmune(null, "compelled"), false);
  assert.strictEqual(env.edhaConditionImmune(mockActor({ name: "Plain" }), ""), false);
});

/* --- edhaStatusApplyCard (pure) — the sentence itself ------------------------------------------ */

test("item 149: a REFUSED status names the immunity and claims nothing", () => {
  const card = env.edhaStatusApplyCard(false, "Kneel", "Risen Servant", "Compelled", "Bench — Power");
  assert.ok(/immune to <strong>?Compelled/.test(card) || /<strong>immune to Compelled<\/strong>/.test(card), `card did not name the immunity: ${card}`);
  assert.ok(/no status applied/.test(card), `card did not say nothing landed: ${card}`);
  assert.ok(!/is <strong>Compelled<\/strong>/.test(card), `the card STILL claims the condition landed: ${card}`);
});

/* The tail and the note describe a condition that is not there, so neither may survive a refusal —
 * `edhaDeliveredNote`'s rule, applied to statuses. Kneel's note is the exact bench-47 string. */
test("item 149: a refusal drops the bonus-damage clause AND the authored note", () => {
  const card = env.edhaStatusApplyCard(false, "Kneel", "Risen Servant", "Compelled", "Bench — Power",
    " — damage against it gains +2 vital (auto-applied)",
    " <span>Next action: move toward the compeller or do nothing — movement ENFORCED.</span>");
  assert.ok(!/auto-applied/.test(card), `a refused status must not promise bonus damage: ${card}`);
  assert.ok(!/movement ENFORCED/.test(card), `a refused status must not print its authored rider: ${card}`);
});

/* THE REGRESSION GUARD: a normal target's card is unchanged, byte for byte. */
test("item 149: a LANDED status keeps the pre-fix wording exactly", () => {
  const card = env.edhaStatusApplyCard(true, "Vital Diagnosis", "Cullwolf Pack", "Diagnosed", "Bench — Life",
    " — damage against it gains +2 vital (auto-applied)", " <span style=\"opacity:.8\">note</span>");
  assert.strictEqual(card,
    "🎯 <strong>Vital Diagnosis</strong>: <strong>Cullwolf Pack</strong> is <strong>Diagnosed</strong> (by Bench — Life)" +
    " — damage against it gains +2 vital (auto-applied). <span style=\"opacity:.8\">note</span>");
});

test("item 149: a landed status with no rider and no note is the plain sentence", () => {
  assert.strictEqual(env.edhaStatusApplyCard(true, "Kneel", "Trooper", "Compelled", "Bench — Power"),
    "🎯 <strong>Kneel</strong>: <strong>Trooper</strong> is <strong>Compelled</strong> (by Bench — Power).");
});

/* --- edhaStatusSplitNote (pure) — the multi-target sibling ------------------------------------- */

test("item 149: an ALL-LANDED triggered-effect keeps the pre-fix wording byte-for-byte", () => {
  assert.strictEqual(env.edhaStatusSplitNote(["Trooper", "Cinderhound"], [], "Weakened", " <span>(note)</span>"),
    "Trooper, Cinderhound are <strong>Weakened</strong> <span>(note)</span>");
  assert.strictEqual(env.edhaStatusSplitNote(["Trooper"], [], "Weakened", ""),
    "Trooper is <strong>Weakened</strong>");
});

test("item 149: a MIXED list says which targets took it and which refused", () => {
  const s = env.edhaStatusSplitNote(["Trooper"], ["Risen Servant"], "Compelled", " <span>(note)</span>");
  assert.strictEqual(s, "Trooper is <strong>Compelled</strong> <span>(note)</span>; Risen Servant is <strong>immune to Compelled</strong> — no status applied");
});

test("item 149: an ALL-REFUSED list carries only the immunity clause — the note goes with the claim", () => {
  const s = env.edhaStatusSplitNote([], ["Risen Servant", "Husk"], "Compelled", " <span>(movement ENFORCED)</span>");
  assert.strictEqual(s, "Risen Servant, Husk are <strong>immune to Compelled</strong> — no status applied");
  assert.ok(!/ENFORCED/.test(s), "the authored note must not survive a card that says nothing landed");
});

/* --- the WRITERS report what landed ------------------------------------------------------------ */

/* The shared write bodies used to return `true` for a refused status: `toggleStatusEffect` resolves
 * `false` on an immune target and nobody read it, and the GM-RELAY path has no return value at all.
 * Worse, `edhaWriteStatusMark` then wrote `markedBy.<status>` — a marker-owner flag stranded on a
 * creature with no status, which the damage post-pass reads to add a marker's bonus damage. */
async function withQuietUi(fn) {
  const priorUi = env.ui;
  const warns = [];
  env.ui = { ...priorUi, notifications: { warn: (m) => warns.push(m), info: () => {}, error: () => {} } };
  try { return { result: await fn(), warns }; } finally { env.ui = priorUi; }
}

function immuneTarget() {
  const a = mockActor({ name: "Risen Servant", type: "adversary", system: RISEN_SERVANT });
  a.isOwner = true;
  a.toggled = [];
  a.toggleStatusEffect = async (id, opts) => { a.toggled.push([id, opts]); return false; };
  return a;
}

test("item 149: edhaWriteStatusMark returns false on an immune target and writes NO markedBy flag", async () => {
  const victim = immuneTarget();
  const { result, warns } = await withQuietUi(() =>
    env.edhaWriteStatusMark(victim, "compelled", { actorId: "power", talent: "Kneel" }));
  assert.strictEqual(result, false, "a refused write must not report success");
  eq(victim.toggled, [], "the write must be skipped, not attempted and ignored");
  assert.strictEqual(victim.getFlag("edha-content", "markedBy.compelled"), undefined,
    "a marker-owner flag on a creature with no status is what the damage post-pass reads");
  assert.strictEqual(warns.length, 1, "the refusal must be visible on the client that asked (the relay path never sees the system's own warning)");
  assert.ok(/immune to/.test(warns[0]), warns[0]);
});

test("item 149: edhaToggleStatus returns false on an immune APPLY", async () => {
  const victim = immuneTarget();
  const { result } = await withQuietUi(() => env.edhaToggleStatus(victim, "compelled", true));
  assert.strictEqual(result, false);
  eq(victim.toggled, []);
});

/* Only the APPLY direction is gated — a removal on an immune creature is a no-op either way, and
 * silently changing removal semantics would be a different bug. */
test("item 149: edhaToggleStatus still performs a REMOVAL on an immune creature", async () => {
  const victim = immuneTarget();
  const { result } = await withQuietUi(() => env.edhaToggleStatus(victim, "compelled", false));
  assert.strictEqual(result, true);
  assert.strictEqual(victim.toggled.length, 1, "the removal must still be attempted");
  eq(victim.toggled[0][1], { active: false });
});

test("item 149: edhaApplyTimedStatus returns false on an immune target rather than stamping an expiry", async () => {
  const victim = immuneTarget();
  const { result } = await withQuietUi(() => env.edhaApplyTimedStatus(victim, "compelled", { owner: null, expire: "owner" }));
  assert.strictEqual(result, false);
  eq(victim.toggled, []);
});

/* THE REGRESSION GUARD on the writers: a NON-immune target is written exactly as before. */
test("item 149: a non-immune target is still marked, flagged and reported true", async () => {
  const victim = immuneTarget();
  victim.toggleStatusEffect = async (id, opts) => { victim.toggled.push([id, opts]); return {}; };
  const { result } = await withQuietUi(() =>
    env.edhaWriteStatusMark(victim, "slowed", { actorId: "power", talent: "Kneel" }));
  assert.strictEqual(result, true);
  assert.strictEqual(victim.toggled.length, 1);
  eq(victim.getFlag("edha-content", "markedBy.slowed"), { actorId: "power", talent: "Kneel" });
});

/* --- THE REPORTED SITE, driven end to end ----------------------------------------------------- */

/* `edha-apply-status`'s executor, run the way Kneel's success payload runs it: the victim is BOUND
 * (H1's victim doctrine — the creature the TEST resolved against), so no targeting stub is needed.
 * Disable the executor's immunity branch and the first case below posts the bench-47 card verbatim. */
async function applyStatus(victim, cfg) {
  const { captureChat, mockItem } = require("./harness.js");
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Power", id: "power", type: "character" });
  owner.getRollData = () => ({ tier: 2 });
  const item = mockItem({ name: "Kneel", type: "talent", actor: owner });
  const { warns } = await withQuietUi(() => env.edhaApplyStatusMark(item, cfg, victim));
  return { cards, warns };
}

test("item 149: Kneel vs a Risen Servant posts the REFUSAL card, not the Compelled claim", async () => {
  const victim = immuneTarget();
  const { cards } = await applyStatus(victim, {
    status: "compelled", expire: "owner-turn", mark: true,
    note: "Next action: move toward the compeller or do nothing — movement ENFORCED.",
  });
  assert.strictEqual(cards.length, 1, `expected exactly one card, got ${cards.length}`);
  const body = cards[0].content;
  assert.ok(!/is <strong>Compelled<\/strong>/.test(body), `the bench-47 defect is back — the card claims the condition: ${body}`);
  assert.ok(/immune to/.test(body) && /no status applied/.test(body), `the card does not say what happened: ${body}`);
  assert.ok(!/movement ENFORCED/.test(body), `the authored rider outlived the claim it belonged to: ${body}`);
  assert.strictEqual(victim.getFlag("edha-content", "markedBy.compelled"), undefined, "a refusal must cost no phantom mark");
  eq(victim.toggled, [], "nothing may be written for a refused status");
});

test("item 149: the same executor on a NON-immune target still marks and still claims it", async () => {
  const victim = immuneTarget();
  victim.toggleStatusEffect = async (id, opts) => { victim.toggled.push([id, opts]); return {}; };
  const { cards } = await applyStatus(victim, { status: "slowed", mark: true, note: "" });
  const body = cards[0].content;
  assert.ok(/is <strong>Slowed<\/strong>|is <strong>slowed<\/strong>/.test(body), `a landed status must still be announced: ${body}`);
  assert.ok(!/immune/.test(body), body);
  eq(victim.getFlag("edha-content", "markedBy.slowed"), { actorId: "power", talent: "Kneel" });
});
