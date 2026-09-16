/* REGRESSION — items 173 & 176: an auto-resolved trigger effect that finds nobody eligible must
 * not tell the table to "target a token, then re-fire" — there is no token to target, because
 * nothing was ever waiting on the user's canvas target in the first place. (TODO_REPO_HYGIENE
 * #173, #176; bench runs 49b and 50, 2026-09-15.)
 *
 * ITEM 173. The Reeve-Owl's Sapping Hex (`edha-on-hit`, `whenTargetIsolated: true`, `target:
 * "victim"`) posted, publicly, on every hit against a creature that was not Isolated: "Sapping Hex
 * — no Isolated target to affect (target a token, then re-fire)." `edhaDispatchOnHit` always
 * supplies `ctx.victim` (04-black-ritual.js), so an empty list AFTER the whenTargetIsolated filter
 * means "the creature hit is not Isolated" — the rule working exactly as designed — not a missing
 * target. The Tollbird Flock's Sapping Hex against an ACTUALLY Isolated PC carded correctly.
 *
 * ITEM 176. Chain Detonation (`edha-on-defeat`, `damage-aoe`, `target: "near-victim"`, `radius:
 * 5`) fired on a Rootling Swarm's death with nobody else within 5 ft, and still rolled its damage
 * and posted "6 energy to (no target — target a token, then re-fire)." publicly. near-victim
 * already means "whoever was near the victim, if anyone" — an empty splash is the rule correctly
 * finding nobody in range, not a missing target either.
 *
 * THE SHARED FIX. Both branches of edhaRunTriggerEffect (33-triggered-effect-resolution.js) now
 * post NO public card when an auto-resolved effect's own condition was not met — there is no token
 * to target and nothing to re-fire — and route a quiet audit line through edhaPostGmCard instead
 * (the house GM-only-card primitive, 13-white-bulwark.js) so a GM who wants to know why nothing
 * happened still can. The status branch distinguishes "a real victim existed and whenTargetIsolated
 * culled it" (culledByIsolation) from "nothing ever resolved" (ctx carried no victim at all, or a
 * hand-fired prompt card with nothing on the canvas) — only the SECOND keeps today's public
 * message. The damage/damage-aoe branch checks `eff.target === "near-victim"` specifically, since
 * many OTHER damage rules target "victim" directly and an empty list there (a truly missing ctx)
 * is still worth surfacing loudly, not silently swallowed.
 *
 * MUTATION (each stated on its own case): drop the `culledByIsolation` branch and case 1 fails —
 * the not-Isolated hit goes back to posting the public re-fire card. Drop the near-victim check in
 * the damage branch and case 4 fails the same way. Cases 2, 3 and 5 are the negative controls that
 * prove the fix did not touch the paths it must leave alone.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockEffect, stageWorld, captureChat } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");

// Sapping Hex's real on-hit rule shape (data/adversaries.json, the Reeve-Owl / Tollbird Flock).
function sappingHexSpec() {
  return { effect: { kind: "status", statusId: "weakened", target: "victim", damageType: "energy" },
    whenTargetIsolated: true, note: "" };
}

// Chain Detonation's real on-defeat rule shape (data/authored/leyline-red.json).
function chainDetonationSpec() {
  return { effect: { kind: "damage-aoe", formula: "6", damageType: "energy", target: "near-victim",
    radius: 5, nearAffects: "all" }, note: "" };
}

/* ---- 1 + 2. item 173: Sapping Hex's whenTargetIsolated gate ------------------------------------- */

test("item 173: a hit on a target that is NOT Isolated posts no Sapping Hex card — bench run 49b", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const gmCards = [];
  env.edhaPostGmCard = async (_o, html) => { gmCards.push(html); };
  const owner = mockActor({ name: "Reeve-Owl", id: "owl" });
  owner.getRollData = () => ({ tier: 2 });
  const victim = mockActor({ name: "Bench Fixture", id: "fixture" });   // no isolation marker, no token -> not Isolated
  victim.isOwner = true;
  victim.toggled = [];
  victim.toggleStatusEffect = async (id, { active } = {}) => { victim.toggled.push({ id, active }); };
  await env.edhaRunTriggerEffect(owner, "Sapping Hex", sappingHexSpec(), { victim });

  assert.deepStrictEqual(cards, [], "no public card — there is no token to target and nothing to re-fire");
  assert.strictEqual(victim.toggled.length, 0, "the status must never be toggled on an unqualified target");
  assert.strictEqual(gmCards.length, 1, "a GM-only audit line still exists");
  assert.match(gmCards[0], /not Isolated/);
});

test("item 173: an ISOLATED hit still posts the real Sapping Hex card — the Tollbird Flock's correct case", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Tollbird Flock", id: "tollbird" });
  owner.getRollData = () => ({ tier: 2 });
  const victim = mockActor({ name: "Bench — Chaos", id: "chaos", effects: [mockEffect({ statuses: ["isolated"] })] });
  victim.isOwner = true;
  victim.toggleStatusEffect = async (id) => { victim.statuses.add(id); };
  await env.edhaRunTriggerEffect(owner, "Sapping Hex", sappingHexSpec(), { victim });

  assert.strictEqual(cards.length, 1, "the normal card still posts");
  const said = text(cards[0].content);
  assert.match(said, /Bench — Chaos.*Weakened/, `expected the real status card: ${said}`);
});

test("item 173: a hand-fired card with NOTHING targeted still asks for a target — unchanged", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Reeve-Owl", id: "owl" });
  owner.getRollData = () => ({ tier: 2 });
  await env.edhaRunTriggerEffect(owner, "Sapping Hex", sappingHexSpec(), {});   // no ctx.victim at all

  assert.strictEqual(cards.length, 1, "today's message must still post — this is the OTHER, older problem");
  const said = text(cards[0].content);
  assert.match(said, /no Isolated target to affect \(target a token, then re-fire\)/, `expected today's message: ${said}`);
});

/* ---- 3 + 4. item 176: Chain Detonation's near-victim splash ------------------------------------- */

test("item 176: a near-victim splash that catches nobody posts NO damage card — bench run 50", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const gmCards = [];
  env.edhaPostGmCard = async (_o, html) => { gmCards.push(html); };
  const owner = mockActor({ name: "Bench — Red", id: "red" });
  owner.getRollData = () => ({ tier: 2 });
  const victim = mockActor({ name: "Rootling Swarm", id: "rootling" });
  const victimTok = { id: "vtok", center: { x: 0, y: 0 }, document: { disposition: -1 } };
  const farActor = mockActor({ name: "Other Rootling", id: "other" });
  const farTok = { id: "far", actor: farActor, document: { disposition: -1 }, center: { x: 1000, y: 0 } };   // 50 ft away
  const world = stageWorld(env, { placeables: [victimTok, farTok] });
  const priorCasterTok = env.edhaCasterToken;
  env.edhaCasterToken = (a) => (a === victim ? victimTok : null);
  try {
    await env.edhaRunTriggerEffect(owner, "Chain Detonation", chainDetonationSpec(), { victim });
  } finally { env.edhaCasterToken = priorCasterTok; world.undo(); }

  assert.deepStrictEqual(cards, [], "no public card, no rolled number for nobody");
  assert.strictEqual(gmCards.length, 1, "a GM-only audit line still exists");
  assert.match(gmCards[0], /nothing to splash/);
});

test("item 176: a near-victim splash WITH a creature in range still damages and names it", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Red", id: "red" });
  owner.getRollData = () => ({ tier: 2 });
  const victim = mockActor({ name: "Rootling Swarm", id: "rootling" });
  const nearby = mockActor({ name: "Second Rootling", id: "second" });
  nearby.isOwner = true;
  nearby.damageTaken = null;
  nearby.applyDamage = async (list) => { nearby.damageTaken = list; };
  const victimTok = { id: "vtok", center: { x: 0, y: 0 }, document: { disposition: -1 } };
  const nearTok = { id: "ntok", actor: nearby, document: { disposition: -1 }, center: { x: 50, y: 0 } };   // 2.5 ft away
  const world = stageWorld(env, { placeables: [victimTok, nearTok] });
  const priorCasterTok = env.edhaCasterToken;
  env.edhaCasterToken = (a) => (a === victim ? victimTok : null);
  try {
    await env.edhaRunTriggerEffect(owner, "Chain Detonation", chainDetonationSpec(), { victim });
  } finally { env.edhaCasterToken = priorCasterTok; world.undo(); }

  assert.strictEqual(cards.length, 1, "the normal damage card still posts");
  const said = text(cards[0].content);
  assert.match(said, /energy to Second Rootling/, `expected the normal splash card: ${said}`);
  assert.ok(nearby.damageTaken, "the in-range creature must still take the damage");
});

/* ---- 5. the control shared by both items: a genuine prompt miss is UNCHANGED -------------------- */

test("item 176: a prompt-target damage rule with nothing targeted still asks for a target — unchanged", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Red", id: "red" });
  owner.getRollData = () => ({ tier: 2 });
  const spec = { effect: { kind: "damage", formula: "4", damageType: "energy" }, note: "" };   // no `target` -> default (prompt)
  await env.edhaRunTriggerEffect(owner, "Some Prompt Rule", spec, {});

  assert.strictEqual(cards.length, 1);
  const said = text(cards[0].content);
  assert.match(said, /\(no target — target a token, then re-fire\)/, `expected today's message: ${said}`);
});
