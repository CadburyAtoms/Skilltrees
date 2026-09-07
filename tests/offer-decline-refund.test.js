/* R-17 — a DECLINED or IGNORED offer refunds its system-charged Investiture; the once-per-round
 * budget still spends on the CLICK (TODO_REPO_HYGIENE #51, 2026-09-06).
 *
 * The defect: an H6 `edha-prompt-pick` offer posted from the talent's own `use` event (Unnerving
 * Approach's shape) has ALREADY been charged its activation cost by the system before the rule ran.
 * The click budget waited for the click (2bJ-10, verified 07-26k), but the Investiture did not —
 * declining or ignoring the card kept the cost. Ben (R-17, 2026-09-06): keep the click budget AND
 * refund, consistent with R-69.
 *
 * R-69's mechanism is "charge on post, refund on back-out" — `edhaRefundCost(item)` after the user
 * cancels. This item reuses exactly that, through ONE path: `edhaOfferDecline` (the Decline button
 * and the round-change sweep for an ignored card both call it, and nothing else in the offer family
 * may credit a resource). The offer posted from a watch / success rule (Puppeteer) was never
 * system-charged — its `costs` land on the click — so it is NOT refundable and a decline credits
 * nothing (a refund there would MINT Investiture).
 *
 * Four pins, each shown failing under a one-line reversion (see the PR):
 *   1. declined  — Investiture back to its pre-use value, the round's use still available;
 *   2. ignored   — the sweep on a LATER round refunds; the same round does not; a non-refundable
 *                  (watch-posted) offer is left alone;
 *   3. accepted  — charged exactly once: no refund on accept, none from a later sweep, none from a
 *                  late Decline; and an accept AFTER the sweep refunded is refused (no free use);
 *   4. source    — the refund goes through the one shared path.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, withStubs, captureChat, readEngineSource, codeOnly } = require("./harness.js");

const PICK = { type: "edha-prompt-pick", source: "confirm", once: "round", label: "Push" };

/* An owner at 4/4 Investiture, a foe to resolve the offer against, and a talent whose ONLY rule is
 * the offer on its own `use` event, consuming 1 Investiture (the Unnerving Approach shape). */
function world({ consume = true } = {}) {
  const owner = mockActor({ name: "Bench Owner", id: "owner", system: { resources: { inv: { value: 4, max: { value: 4 } } } } });
  owner.isOwner = true;
  const foe = mockActor({ name: "Bench Target", id: "foe" });
  const item = mockItem({
    name: "Bench Offer", id: "offer-tal", actor: owner,
    events: [{ id: "r1", event: "use", handler: PICK }],
    system: { activation: { consume: consume ? [{ type: "resource", resource: "inv", value: { min: 1, max: 1 } }] : [] } },
  });
  const docs = { [item.uuid]: item, [foe.uuid]: foe };
  return { owner, foe, item, docs };
}

/* The chat message a posted card becomes — flags + the resolved marker, the two things the engine
 * reads back off a message. */
function messageOf(card, id = "m1") {
  const flags = JSON.parse(JSON.stringify(card.data?.flags ?? {}));
  return {
    id, isAuthor: true, flags,
    getFlag(scope, key) { return flags[scope]?.[key]; },
    async setFlag(scope, key, value) { (flags[scope] ??= {})[key] = value; return value; },
  };
}
function clickEvent(dataset) {
  return { preventDefault() {}, currentTarget: { dataset, textContent: "", closest() { return null; } } };
}
const inv = (a) => a.system.resources.inv.value;

/* Post the offer the way the SYSTEM fires a `use` rule (event carries `type`), or the way the
 * engine's own dispatch fires a success rule (`{item, rule, options}` — Puppeteer's route). */
async function post(env, w, { via = "use", round = 2 } = {}) {
  const stubs = {
    fromUuid: async (u) => w.docs[u] ?? null,
    edhaCombatRoundOf: () => round,
    edhaWhisperIds: () => [],
  };
  return withStubs(env, stubs, async () => {
    const cards = captureChat(env);
    const event = via === "use"
      ? { type: "use", item: w.item, rule: { event: "use", handler: PICK }, options: { victim: w.foe } }
      : { item: w.item, rule: { event: "edha-test-success", handler: PICK }, options: { victim: w.foe } };
    await env.edhaRunPromptPick(w.item, PICK, event);
    assert.strictEqual(cards.length, 1, "one offer card");
    return cards[0];
  });
}
function gmWorld(env, msgs) {
  env.game.user = { isGM: true };
  env.game.users = null;
  env.game.messages = { get: (id) => msgs.find((m) => m.id === id) ?? null, contents: msgs };
}
async function withWorld(env, w, msgs, fn) {
  gmWorld(env, msgs);
  return withStubs(env, { fromUuid: async (u) => w.docs[u] ?? null, edhaCombatRoundOf: () => 2, edhaWhisperIds: () => [] }, fn);
}

test("offer-decline-refund: a refundable offer carries the Decline button and the flag; a watch-posted one does not", async () => {
  const env = loadEngine();
  const w = world();
  const card = await post(env, w, { via: "use" });
  assert.ok(card.content.includes('class="edha-pick-decline-btn"'), "Decline button on a system-charged offer");
  assert.deepStrictEqual(JSON.parse(JSON.stringify(card.data.flags["edha-content"].offer)), { itemUuid: w.item.uuid, round: 2, refund: true });
  // Puppeteer's route: posted from a success rule, costs on the click → nothing to refund.
  const w2 = world();
  const card2 = await post(env, w2, { via: "success" });
  assert.ok(!card2.content.includes("edha-pick-decline-btn"), "no Decline button on a watch-posted offer");
  assert.strictEqual(card2.data.flags["edha-content"].offer.refund, false);
  // A `use` offer on a talent that consumes nothing has nothing to refund either.
  const w3 = world({ consume: false });
  const card3 = await post(env, w3, { via: "use" });
  assert.strictEqual(card3.data.flags["edha-content"].offer.refund, false);
  assert.strictEqual(env.edhaOfferRefundable(w.item, { type: "use" }), true);
  assert.strictEqual(env.edhaOfferRefundable(w.item, { rule: { event: "edha-test-success" } }), false);
});

test("offer-decline-refund: DECLINED — Investiture back to 4, the round's use still available (pin 1)", async () => {
  const env = loadEngine();
  const w = world();
  const card = await post(env, w);
  const msg = messageOf(card);
  w.owner.system.resources.inv.value = 3;                       // the SYSTEM charged the use
  await withWorld(env, w, [msg], async () => {
    await env.edhaPromptPickDeclineClick(clickEvent({ edhaItem: w.item.uuid }), msg);
  });
  assert.strictEqual(inv(w.owner), 4, "declined: Investiture refunded");
  await withStubs(env, { edhaCombatRoundOf: () => 2 }, () => {
    assert.strictEqual(env.edhaCoordOPRAllowed(w.owner, w.item.uuid, "_pick"), true, "declined: the round's use is still available");
  });
  assert.ok(msg.getFlag("edha-content", "cardResolved"), "the card is resolved");
  // A second Decline on the resolved card credits nothing more.
  await withWorld(env, w, [msg], async () => {
    await env.edhaPromptPickDeclineClick(clickEvent({ edhaItem: w.item.uuid }), msg);
  });
  assert.strictEqual(inv(w.owner), 4, "no double refund");
});

test("offer-decline-refund: IGNORED — the sweep on a later round refunds; the same round does not; a watch-posted offer is left alone (pin 2)", async () => {
  const env = loadEngine();
  const w = world();
  const card = await post(env, w, { round: 2 });
  const msg = messageOf(card);
  w.owner.system.resources.inv.value = 3;
  await withWorld(env, w, [msg], async () => {
    await env.edhaSweepIgnoredOffers({ started: true, round: 2 });
    assert.strictEqual(inv(w.owner), 3, "same round: still deciding, nothing refunded");
    assert.ok(!msg.getFlag("edha-content", "cardResolved"));
    await env.edhaSweepIgnoredOffers({ started: true, round: 3 });
  });
  assert.strictEqual(inv(w.owner), 4, "ignored into the next round: refunded");
  assert.ok(msg.getFlag("edha-content", "cardResolved"), "the ignored card is resolved");
  await withStubs(env, { edhaCombatRoundOf: () => 3 }, () => {
    assert.strictEqual(env.edhaCoordOPRAllowed(w.owner, w.item.uuid, "_pick"), true, "ignored: no round use spent");
  });
  // The watch-posted (non-refundable) offer: the sweep must not mint Investiture for it.
  const w2 = world();
  const card2 = await post(env, w2, { via: "success", round: 2 });
  const msg2 = messageOf(card2, "m2");
  await withWorld(env, w2, [msg2], async () => { await env.edhaSweepIgnoredOffers({ started: true, round: 3 }); });
  assert.strictEqual(inv(w2.owner), 4, "never charged, never refunded");
  assert.ok(!msg2.getFlag("edha-content", "cardResolved"), "a non-refundable card is not the sweep's business");
});

test("offer-decline-refund: ACCEPTED — charged exactly once; no refund on accept, from the sweep, or from a late Decline (pin 3)", async () => {
  const env = loadEngine();
  const w = world();
  const card = await post(env, w);
  const msg = messageOf(card);
  w.owner.system.resources.inv.value = 3;
  await withWorld(env, w, [msg], async () => {
    await env.edhaPromptPickClick(clickEvent({ edhaItem: w.item.uuid, edhaPick: w.foe.uuid }), msg);
    assert.strictEqual(inv(w.owner), 3, "accepted: the system's charge stands");
    assert.strictEqual(env.edhaCoordOPRAllowed(w.owner, w.item.uuid, "_pick"), false, "accepted: the round's use is spent on the click");
    assert.ok(msg.getFlag("edha-content", "cardResolved"));
    await env.edhaSweepIgnoredOffers({ started: true, round: 3 });
    assert.strictEqual(inv(w.owner), 3, "a resolved card is not swept");
    await env.edhaPromptPickDeclineClick(clickEvent({ edhaItem: w.item.uuid }), msg);
    assert.strictEqual(inv(w.owner), 3, "a late Decline on an accepted card credits nothing");
  });
  // The other order: the sweep refunded, THEN the player clicks accept — refused, nothing spent.
  const w2 = world();
  const card2 = await post(env, w2);
  const msg2 = messageOf(card2, "m2");
  w2.owner.system.resources.inv.value = 3;
  await withWorld(env, w2, [msg2], async () => {
    await env.edhaSweepIgnoredOffers({ started: true, round: 3 });
    assert.strictEqual(inv(w2.owner), 4);
    await env.edhaPromptPickClick(clickEvent({ edhaItem: w2.item.uuid, edhaPick: w2.foe.uuid }), msg2);
    assert.strictEqual(inv(w2.owner), 4, "accept after the refund: refused");
    assert.strictEqual(env.edhaCoordOPRAllowed(w2.owner, w2.item.uuid, "_pick"), true, "accept after the refund: no use spent");
  });
});

test("offer-decline-refund: ONE refund path — Decline and the sweep both go through edhaOfferDecline, which alone calls edhaRefundCost (pin 4)", () => {
  const src = codeOnly(readEngineSource());
  const fn = (name) => {
    const i = src.indexOf(`async function ${name}(`);
    assert.ok(i >= 0, `${name} exists`);
    const j = src.indexOf("\nasync function ", i + 1), k = src.indexOf("\nfunction ", i + 1), l = src.indexOf("\nHooks.on(", i + 1);
    const end = Math.min(...[j, k, l].filter((x) => x > 0));
    return src.slice(i, end);
  };
  const region = src.slice(src.indexOf("async function edhaRunPromptPick("), src.indexOf("function edhaEffectOwnerItem("));
  assert.ok(region.length > 0, "the offer family region");
  const refunds = region.split("edhaRefundCost(").length - 1;
  assert.strictEqual(refunds, 1, "exactly one edhaRefundCost call in the offer family");
  assert.ok(fn("edhaOfferDecline").includes("edhaRefundCost("), "…and it is edhaOfferDecline's");
  for (const caller of ["edhaPromptPickDeclineClick", "edhaSweepIgnoredOffers"]) {
    const body = fn(caller);
    assert.ok(body.includes("edhaOfferDecline("), `${caller} declines through the shared path`);
    for (const forbidden of ["edhaRefundCost(", "edhaGainResource(", "system.resources"]) assert.ok(!body.includes(forbidden), `${caller} never credits a resource itself (${forbidden})`);
  }
  assert.ok(src.includes('"edha-pick-decline-btn": edhaPromptPickDeclineClick'), "the Decline button is bound in EDHA_CARD_BUTTONS");
});
