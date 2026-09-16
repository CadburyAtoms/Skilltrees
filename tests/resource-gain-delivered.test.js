/* REGRESSION — item 172: a resource-gain card must say what the pool actually took, not what the
 * rule declared. (TODO_REPO_HYGIENE #172; bench run 49b, 2026-09-15.)
 *
 * WHAT THE BENCH MEASURED. The Reeve-Owl's Predatory Patience `edha-on-hit` rule ({kind: heal,
 * formula: "0", resourceGain: {resource: foc, value: 1}}), fired by a Stoop of Office hit: against
 * a Weakened creature at Focus 1 the pool went 1 -> 2 and the card read "Reeve-Owl regains 1
 * Focus." — correct — and at Focus 3/3 the pool stayed 3 and the SAME card posted, word for word.
 * Same hour, the Briar-Gone Grove's Draw Mana at Investiture 2/2 posted "recover 3 Investiture"
 * while the pool stayed 2 -> 2.
 *
 * ROOT CAUSE. `edhaGainResource` (06-edha-prompt-pick.js) clamped its write to the resource's max
 * but returned nothing, so every caller built its "regains N" card from the RULE's declared value,
 * never the write's actual delta. `edhaDrawMana` (52-green-instinct.js) had the same shape: it
 * clamped `Math.min(max, value + gain)` and then printed the un-clamped `gain`.
 *
 * THE FIX. `edhaGainResource` now returns `next - cur` (0 at max, on a non-positive request, or on
 * a caught perms failure). The triggered-effect heal branch (33-triggered-effect-resolution.js)
 * and `edhaDrawMana` both build their card from that return, and say "already at full <resource>"
 * when it is 0. The same declared-vs-delivered mismatch also existed at edhaSovRecoverInv
 * (44-sovereignty.js), the marked-damage-trigger card (03-where-an-effect-lives.js) and
 * edhaSenseRevealOnDamage (32-senses-light-visibility.js) — the grep the item asked for — fixed
 * the same way; the source-scoped case below pins that all four still call edhaGainResource and
 * report its return, not their own request.
 *
 * MUTATION: revert edhaGainResource to `await actor.update(...)` with no return, and the "no gain
 * claim" and "already at full" tests below fail — the full-pool cases go back to claiming a gain
 * that never happened (asserted directly against the source, not just re-derived by inspection).
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, captureChat, readEngineSource, codeOnly } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");

function owlLike(name, foc, max = 3) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type: "npc",
    system: { resources: { foc: { value: foc, max: { value: max } } } } });
  a.isOwner = true;
  a.getRollData = () => ({ tier: 2 });
  return a;
}

// Predatory Patience's real on-hit rule shape (data/adversaries.json, the Reeve-Owl): a 0-formula
// heal (nothing to heal — item 68's blank-card convention) that carries a Focus resourceGain.
function predatoryPatienceSpec() {
  return { effect: { kind: "heal", formula: "0", resourceGain: { resource: "foc", value: 1 } }, note: "" };
}

function leylineChar(name, colorRank, inv, max) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type: "character",
    system: { resources: { inv: { value: inv, max: { value: max } } }, skills: { white: { rank: colorRank } } } });
  a.isOwner = true;
  return a;
}

/* ---- 1. the primitive: edhaGainResource returns what actually landed --------------------------- */

test("edhaGainResource: returns the delivered amount, not the request", async () => {
  const env = loadEngine();
  const room = mockActor({ system: { resources: { foc: { value: 1, max: { value: 3 } } } } });
  assert.strictEqual(await env.edhaGainResource(room, "foc", 1), 1, "room for all of it");
  assert.strictEqual(room.system.resources.foc.value, 2);
});

test("edhaGainResource: returns 0 at max — bench run 49b's exact case", async () => {
  const env = loadEngine();
  const full = mockActor({ system: { resources: { foc: { value: 3, max: { value: 3 } } } } });
  assert.strictEqual(await env.edhaGainResource(full, "foc", 1), 0);
  assert.strictEqual(full.system.resources.foc.value, 3, "still clamped, never past max");
});

test("edhaGainResource: returns 0 on a non-positive request or a missing actor", async () => {
  const env = loadEngine();
  const a = mockActor({ system: { resources: { foc: { value: 1, max: { value: 3 } } } } });
  assert.strictEqual(await env.edhaGainResource(a, "foc", 0), 0);
  assert.strictEqual(await env.edhaGainResource(null, "foc", 1), 0);
});

/* ---- 2. the reported defect: Predatory Patience's Focus card ------------------------------------ */

test("item 172: Predatory Patience at 3/3 Focus posts NO gain claim", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = owlLike("Reeve-Owl", 3, 3);
  await env.edhaRunTriggerEffect(owner, "Predatory Patience", predatoryPatienceSpec(), {});
  assert.strictEqual(owner.system.resources.foc.value, 3, "the pool does not move past its max");
  const said = cards.map((c) => text(c.content)).join(" | ");
  assert.ok(!/regains 1 Focus/.test(said), `must not claim a gain that did not happen: ${said}`);
  assert.match(said, /already at full Focus/, `expected the honest line: ${said}`);
});

test("item 172: Predatory Patience below full still says 'regains 1 Focus'", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = owlLike("Reeve-Owl", 1, 3);
  await env.edhaRunTriggerEffect(owner, "Predatory Patience", predatoryPatienceSpec(), {});
  assert.strictEqual(owner.system.resources.foc.value, 2, "1 -> 2");
  const said = cards.map((c) => text(c.content)).join(" | ");
  assert.match(said, /regains 1 Focus/, `expected the gain claim: ${said}`);
});

/* ---- 3. the second reported site: Draw Mana's Investiture card ---------------------------------- */

test("item 172: Draw Mana at a full Investiture pool says so, not 'recover N'", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const actor = leylineChar("Briar-Gone Grove", 3, 2, 2);   // rank 3 -> declared yield 3; pool already 2/2
  const item = mockItem({ name: "Draw Mana", actor });
  await env.edhaDrawMana(item);
  assert.strictEqual(actor.system.resources.inv.value, 2, "the pool does not move past its max");
  const said = cards.map((c) => text(c.content)).join(" | ");
  assert.ok(!/recover 3 Investiture/.test(said), `must not claim the declared 3: ${said}`);
  assert.match(said, /already at full Investiture/, `expected the honest line: ${said}`);
});

test("item 172: Draw Mana below full recovers the clamped delta, not the declared yield", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const actor = leylineChar("Well-Warden", 3, 1, 3);   // rank 3 -> declared yield 3; only 2 of room
  const item = mockItem({ name: "Draw Mana", actor });
  await env.edhaDrawMana(item);
  assert.strictEqual(actor.system.resources.inv.value, 3, "clamped at max");
  const said = cards.map((c) => text(c.content)).join(" | ");
  assert.match(said, /recover 2 Investiture/, `expected the clamped delta (2), not the declared yield (3): ${said}`);
});

test("item 172: Draw Mana with room for all of it is unchanged", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const actor = leylineChar("Fresh Caster", 2, 0, 10);   // rank 2 -> yield 2, plenty of room
  const item = mockItem({ name: "Draw Mana", actor });
  await env.edhaDrawMana(item);
  assert.strictEqual(actor.system.resources.inv.value, 2);
  const said = cards.map((c) => text(c.content)).join(" | ");
  assert.match(said, /recover 2 Investiture/);
});

/* ---- 4. the grep the item asked for: the other three declared-gain cards ------------------------ */

test("item 172: every other card built beside edhaGainResource reports its RETURN, not its request", () => {
  const code = codeOnly(readEngineSource());
  for (const [what, re] of [
    ["edhaSovRecoverInv (44-sovereignty)", /const gained = await edhaGainResource\(owner, "inv", gain\);/],
    ["the marked-damage-trigger card (03-where-an-effect-lives)", /const gained = await edhaGainResource\(mk\.owner, resKey, gain\);/],
    ["edhaSenseRevealOnDamage (32-senses-light-visibility)", /const gained = await edhaGainResource\(w\.actor, res, amt\);/],
  ]) {
    assert.ok(re.test(code), `${what} must capture edhaGainResource's return as \`gained\` and build its card from that`);
  }
  // and none of the three prints the bare declared variable as though it were what landed
  assert.ok(!/recovers \$\{gain\} Investiture/.test(code), "edhaSovRecoverInv must not print the un-clamped request");
  assert.ok(!/recovers \$\{gain\} \$\{EDHA_RES_LABEL\[resKey\]/.test(code), "the marked-damage-trigger card must not print the un-clamped request");
  assert.ok(!/recovers \$\{amt\} \$\{EDHA_RES_LABEL\[res\]/.test(code), "edhaSenseRevealOnDamage must not print the un-clamped request");
});
