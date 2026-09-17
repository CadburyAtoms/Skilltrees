/* REGRESSION — item 189: two more "(target a token)" fallbacks in the trigger-card family, the
 * same shape items 173/176 fixed (tests/no-candidate-no-card.test.js) but in the branches their
 * "What to do" did not name. (TODO_REPO_HYGIENE #189.)
 *
 * PART A — `edhaRunTriggerEffect`'s `affliction` branch (Dark Investiture,
 * data/authored/leyline-black.json, `target: "victim"`) used to post, publicly, on every fire
 * where the supplied victim was culled to nothing: "(target a token) is Afflicted [...]" — there
 * is no token to target, because an on-hit dispatch always supplies its own ctx.victim (or the
 * whenTargetIsolated filter culled a real one). Only a genuine hand-fired PROMPT rule (Red's
 * Conflagration rider, `target: "prompt"`, "Target the creature, then accept the prompt.") is
 * actually the user's own canvas miss.
 *
 * PART B — `edhaRunTriggerEffect`'s `thp` branch's pre-07-24u single-target path
 * (`found[0] ?? owner`) used to silently redirect an empty supplied-victim/near-victim Temp HP
 * grant onto the OWNER and post a public "OWNER gains N Temp HP" card for a target that was never
 * there — worse than blaming the user, it misattributed the grant. Same fix: a supplied mode that
 * resolves to nobody gets a quiet GM audit line; only "prompt" keeps the re-fire wording.
 *
 * PART C — `edhaPostTriggerCard`'s `needsTargeting` check excluded only `victim`/`triggering`/
 * `self` from "Target the creature on the canvas, then click below." — so a hand-fired reaction
 * whose effect targets `near-victim` (auto-picks near the trigger's victim) or `list-members`
 * (sweeps a ledger) still told the player to target the canvas, though neither mode reads it.
 * Cosmetic (no card posted from that instruction changes any resolution), and no live authored
 * rule combines cost-optional with either mode today — caught reading the code, not the bench.
 *
 * MUTATION (each stated on its own case): reverting Part A's `culledByIsolation || eff.target !==
 * "prompt"` guard to the old unconditional `targets.map(...).join(", ") || "(target a token)"`
 * fails case 1. Reverting Part B's `found.length` guard to the old `found[0] ?? owner` fails case
 * 3 (the card again names the OWNER, not "no target"). Reverting Part C's widened exclusion list
 * to the old three-name list fails case 5.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, captureChat } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");

// Dark Investiture's real on-hit rule shape (data/authored/leyline-black.json, DarkInvAfflict01).
function darkInvestitureSpec() {
  return { effect: { kind: "affliction", target: "victim", damageType: "vital", formula: "3" },
    whenTargetIsolated: false, note: "" };
}

// The Conflagration rider's real hand-fired shape (data/authored/leyline-red.json) — target: prompt.
function conflagrationRiderSpec() {
  return { effect: { kind: "affliction", target: "prompt", damageType: "energy", formula: "3" },
    whenTargetIsolated: false, note: "" };
}

/* ---- 1 + 2. Part A: affliction's supplied-victim culled vs a genuine prompt miss --------------- */

test("item 189: an affliction rule whose supplied victim is missing posts no public card", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const gmCards = [];
  env.edhaPostGmCard = async (_o, html) => { gmCards.push(html); };
  const owner = mockActor({ name: "Bench — Black", id: "black" });
  owner.getRollData = () => ({ tier: 2 });
  await env.edhaRunTriggerEffect(owner, "Dark Investiture", darkInvestitureSpec(), {});   // no ctx.victim

  assert.deepStrictEqual(cards, [], "no public card — there is no token to target and nothing to re-fire");
  assert.strictEqual(gmCards.length, 1, "a GM-only audit line still exists");
  assert.match(gmCards[0], /target to afflict/);
});

test("item 189: a hand-fired prompt affliction rule with nothing targeted still asks for a target — unchanged", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Red", id: "red" });
  owner.getRollData = () => ({ tier: 2 });
  await env.edhaRunTriggerEffect(owner, "Conflagration Rider", conflagrationRiderSpec(), {});   // prompt, nothing targeted

  assert.strictEqual(cards.length, 1, "today's message must still post — this is the OTHER, older problem");
  const said = text(cards[0].content);
  assert.match(said, /\(target a token\) is.*Afflicted/, `expected today's message: ${said}`);
});

/* ---- 3 + 4. Part B: thp's legacy single-target path ------------------------------------------- */

function thpVictimSpec() {
  return { effect: { kind: "thp", target: "victim", formula: "5" }, note: "" };
}

test("item 189: a thp rule whose supplied victim is missing does not grant Temp HP to the owner", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const gmCards = [];
  env.edhaPostGmCard = async (_o, html) => { gmCards.push(html); };
  const owner = mockActor({ name: "Bench — Order", id: "order" });
  owner.getRollData = () => ({ tier: 2 });
  await env.edhaRunTriggerEffect(owner, "Some Thp Rule", thpVictimSpec(), {});   // no ctx.victim

  assert.deepStrictEqual(cards, [], "no public card — no misattributed grant to the owner");
  assert.strictEqual(owner.getFlag("edha-content", "tempHp"), undefined, "the owner must not receive the grant meant for a missing victim");
  assert.strictEqual(gmCards.length, 1, "a GM-only audit line still exists");
  assert.match(gmCards[0], /no target for the Temp HP grant/);
});

test("item 189: a thp rule with a real supplied victim still grants Temp HP to THAT creature, not the owner", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Order", id: "order" });
  owner.getRollData = () => ({ tier: 2 });
  const victim = mockActor({ name: "Bench — Ally", id: "ally" });
  await env.edhaRunTriggerEffect(owner, "Some Thp Rule", thpVictimSpec(), { victim });

  assert.strictEqual(cards.length, 1, "the normal card still posts");
  const said = text(cards[0].content);
  assert.match(said, /Bench — Ally gains/, `expected the real target's grant: ${said}`);
  assert.strictEqual(owner.getFlag("edha-content", "tempHp"), undefined, "the owner must not receive a grant that names the victim");
  assert.ok(victim.getFlag("edha-content", "tempHp")?.value > 0, "the victim must hold the Temp HP");
});

/* ---- 5. Part C: needsTargeting's widened exclusion --------------------------------------------- */

test("item 189: a hand-fired near-victim/list-members reaction card carries no canvas-target instruction", () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Any", id: "any" });
  const specNearVictim = { effect: { kind: "damage", target: "near-victim", radius: 5, formula: "3" }, cost: { resource: "foc", value: 1, optional: true }, note: "" };
  const specListMembers = { effect: { kind: "thp", target: "list-members", listName: "covenants", formula: "3" }, cost: { resource: "foc", value: 1, optional: true }, note: "" };
  env.edhaTriggerAllowed = () => true;
  env.edhaPostTriggerCard(owner, "Near-Victim Reaction", specNearVictim, { victim: mockActor({ name: "V", id: "v" }) });
  env.edhaPostTriggerCard(owner, "List-Members Reaction", specListMembers, {});

  assert.strictEqual(cards.length, 2);
  for (const c of cards) {
    const said = text(c.content);
    assert.doesNotMatch(said, /Target the creature on the canvas/, `must not ask for a canvas target: ${said}`);
  }
});

test("item 189: a hand-fired prompt reaction card STILL carries the canvas-target instruction — unchanged", () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Any", id: "any" });
  const specPrompt = { effect: { kind: "damage", target: "prompt", formula: "3" }, cost: { resource: "foc", value: 1, optional: true }, note: "" };
  env.edhaTriggerAllowed = () => true;
  env.edhaPostTriggerCard(owner, "Prompt Reaction", specPrompt, {});

  assert.strictEqual(cards.length, 1);
  const said = text(cards[0].content);
  assert.match(said, /Target the creature on the canvas/, `expected the instruction: ${said}`);
});
