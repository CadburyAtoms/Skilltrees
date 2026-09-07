/* REGRESSION — item 68 / fix pass 8: a heal card states what was DELIVERED, never what was rolled.
 * (TODO_REPO_HYGIENE #68; bench run 39's defect row; EDHA_FOUNDRY_HANDOFF.md 2026-09-06 delta.)
 *
 * WHAT THE BENCH MEASURED. On run 39, a withered `B39 Victim` (`healCut {fraction: 0}` — Withering
 * Touch) took a plain no-test heal from an `edha-focus` `resource: hea` rule, formula 5. HP stayed
 * **4 → 4** — correct, the gate did its job — the gate's own card printed *"🩸 B39 Victim cannot
 * regain HP (Withering Touch)"* — also correct — and then the engine printed *"⚕️ Field Medicine:
 * B39 Victim heals 5."* The write was right and the card lied, one line below the card that said
 * why. That is the §10 drift direction that costs a table the most: the players read the card.
 *
 * THE ROOT CAUSE IS ONE SHAPE, NOT ONE TALENT. `edhaCrossHeal` scales its write through
 * `edhaHealCutGate` and returned nothing, so every announcer built its sentence from the number it
 * had — the roll. Six sites did that (H10's `hea` arm, Interposing Shield, Shared Burden, the Life
 * regen tick, the regrowth tick, the pulse sweep) and every one of them misreports a blocked heal,
 * and a HALVED one too. So the fix is the contract, not the talent: `edhaCrossHeal` RETURNS what it
 * delivered, and `edhaHealLine(who, requested, delivered, phrase)` is the one place that decides
 * whether a number may be printed at all.
 *
 * WHY THE EXECUTOR IS DRIVEN FOR REAL. H10's `hea` arm lives inside a `registerItemEventHandlerType`
 * config object, which is why earlier passes reached it only through source reads (see
 * spend-tag.test.js's note). `handlerTypes()` below registers the native event system against a
 * recording api stub, so these cases call the SHIPPED executor with the SHIPPED config — the same
 * pair of cards Ben would read, in the same order.
 *
 * MUTATION (each stated on its own case): restore `await edhaCrossHeal(who, n)` + a card built from
 * `n`, and the blocked case reads "heals 5" against HP 4 → 4 while the halved case reads "heals 5"
 * against HP 4 → 6. Drop `edhaHealLine`'s zero branch and the blocked case prints a number again.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, mockEffect, stageWorld, captureChat,
        readEngineSource, codeOnly } = require("./harness.js");

const text = (html) => String(html).replace(/<[^>]*>/g, "");
const hp = (a) => a.system.resources.hea.value;

/* A creature carrying a heal-cut mark (or none). `fraction: 0` is Withering Touch's "cannot regain
 * HP"; `0.5` is Necrotic Grasp's halving — the case the bench row predicted would misreport too. */
function patient(name, mark, { value = 4, max = 20 } = {}) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, type: "npc",
    system: { resources: { hea: { value, max: { value: max } } } },
    effects: mark ? [mockEffect({ name: mark.byName, flags: { healCut: mark } })] : [] });
  a.isOwner = true;
  return a;
}
const WITHERED = { fraction: 0, byName: "Withering Touch" };
const HALVED = { fraction: 0.5, byName: "Necrotic Grasp" };

/* Register the native event/handler types against a recording api stub and hand back the
 * registrations by type, so a test can call a handler's real executor. `foundry.data.fields` is a
 * proxy of one inert Field class — the schemas are only stored, never validated, at load. */
function handlerTypes(env) {
  const types = new Map();
  class Field { constructor(o) { Object.assign(this, o || {}); } }
  env.foundry.data.fields = new Proxy({}, { get: () => Field });
  env.cosmereRPG = { api: {
    registerItemEventType() {},
    registerItemEventHandlerType(def) { types.set(def.type, def); },
  } };
  assert.strictEqual(env.edhaRegisterNativeEventSystem(), true, "the native registration must succeed");
  return types;
}

/* Bench run 39's exact take: Field Medicine as an `edha-focus` {gain, hea, victim, formula 5} rule,
 * used on `who`, by a lone GM. Returns the patient and every card, in order. */
async function fieldMedicine(mark, { formula = "5" } = {}) {
  const env = loadEngine();
  const cards = captureChat(env);
  const types = handlerTypes(env);
  const victim = patient("B39 Victim", mark);
  const owner = mockActor({ name: "Bench — White", id: "white", uuid: "Actor.white" });
  owner.getRollData = () => ({ tier: 2 });
  const item = mockItem({ name: "Field Medicine", actor: owner,
    events: [{ event: "use", handler: { type: "edha-focus", op: "gain", resource: "hea", target: "victim", formula } }] });
  const cfg = item.system.events[0].handler;
  const world = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } }, actors: [owner, victim] });
  try {
    await types.get("edha-focus").executor.call(cfg, { item, options: { victim } });
  } finally { world.undo(); }
  return { victim, cards: cards.map(c => text(c.content)) };
}

/* ---- 1. THE REPORTED DEFECT — the blocked heal --------------------------------------------------- */

test("item 68: a blocked heal never prints a number — the card names the mark instead", async () => {
  const { victim, cards } = await fieldMedicine(WITHERED);
  assert.strictEqual(hp(victim), 4, "the gate still blocks the write — bench run 39 measured 4 → 4");
  assert.strictEqual(cards.length, 2, "the gate's card, then the talent's");
  assert.match(cards[0], /cannot regain HP \(Withering Touch\)/, "the gate still explains itself first");
  assert.match(cards[1], /^⚕️ Field Medicine: B39 Victim cannot regain HP \(Withering Touch\) — no healing lands\.$/,
    "the talent's own card must agree with the HP it produced");
  assert.ok(!/\b5\b/.test(cards[1]),
    "THE DEFECT: the announcement was built from the ROLL, so it read 'heals 5' one line under " +
    "'cannot regain HP'. A blocked heal has no number to print.");
});

/* ---- 2. THE HALVED CASE — the bench row predicted this one and never drove it -------------------- */

test("item 68: a HALVED heal prints the halved number, not the full one", async () => {
  const { victim, cards } = await fieldMedicine(HALVED);
  assert.strictEqual(hp(victim), 6, "4 + floor(5 × 0.5) = 6");
  assert.match(cards[0], /has their healing halved \(Necrotic Grasp\)/);
  assert.match(cards[1], /^⚕️ Field Medicine: B39 Victim heals 2\.$/,
    "2 is what landed; the pre-fix card said 5, which is neither the roll's effect nor the HP");
});

/* ---- 3. THE NEGATIVE CONTROL — an unmarked heal is untouched ------------------------------------- */

test("item 68: with no mark the card is unchanged — 'heals 5', and the gate stays silent", async () => {
  const { victim, cards } = await fieldMedicine(null);
  assert.strictEqual(hp(victim), 9, "4 + 5");
  assert.strictEqual(cards.length, 1, "no mark, no gate card");
  assert.strictEqual(cards[0], "⚕️ Field Medicine: B39 Victim heals 5.",
    "the fix must not reword the ordinary case — this is the sentence Ben has been reading");
});

test("item 68: a 0-amount heal with no mark still says nothing (the 07-05 blank-card convention)", async () => {
  const { victim, cards } = await fieldMedicine(null, { formula: "0" });
  assert.strictEqual(hp(victim), 4, "nothing to heal");
  assert.deepStrictEqual(cards, [], "no roll, no gate, no card");
});

/* ---- 4. THE CONTRACT — edhaCrossHeal reports what it delivered ----------------------------------- */

test("item 68: edhaCrossHeal RETURNS the delivered amount on both legs (owned and relayed)", async () => {
  const env = loadEngine();
  captureChat(env);
  const world = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } } });
  const emitted = [];
  env.game.socket = { on() {}, emit: (_c, m) => emitted.push(m) };
  try {
    assert.strictEqual(await env.edhaCrossHeal(patient("Plain", null), 5), 5, "no mark: all of it");
    assert.strictEqual(await env.edhaCrossHeal(patient("Withered", WITHERED), 5), 0, "blocked: none of it");
    assert.strictEqual(await env.edhaCrossHeal(patient("Halved", HALVED), 5), 2, "halved: floor(5 × 0.5)");
    assert.strictEqual(await env.edhaCrossHeal(patient("Nobody", null), 0), 0, "nothing asked, nothing done");

    // The relay leg must report the SAME number, or a player healing an ally they do not own would
    // get a card built from 0 while the GM's client applied the gated amount.
    const remote = patient("Remote", HALVED); remote.isOwner = false;
    assert.strictEqual(await env.edhaCrossHeal(remote, 5), 2, "the relayed hit carries the gated 2");
    assert.strictEqual(emitted.at(-1)?.payload?.hits?.[0]?.amount, 2, "…and that is what was sent");

    // The drop-to-1 bypass (R-10) reports its full amount — it never was a heal to gate.
    assert.strictEqual(await env.edhaCrossHeal(patient("Stabilized", WITHERED, { value: 0 }), 1, { bypassHealCut: true }), 1);
  } finally { world.undo(); }
});

test("item 68: edhaHealLine — a number only when one landed; otherwise the mark, in the gate's words", () => {
  const env = loadEngine();
  captureChat(env);
  const phrase = (d) => `X heals ${d}`;
  assert.strictEqual(env.edhaHealLine(patient("A", null), 5, 5, phrase), "X heals 5");
  assert.strictEqual(env.edhaHealLine(patient("A", HALVED), 5, 2, phrase), "X heals 2",
    "a halved heal is still a heal — phrase() sees the delivered number");
  assert.strictEqual(env.edhaHealLine(patient("B39 Victim", WITHERED), 5, 0, phrase),
    "B39 Victim cannot regain HP (Withering Touch) — no healing lands");
  assert.strictEqual(env.edhaHealLine(patient("B39 Victim", HALVED), 1, 0, phrase),
    "B39 Victim has their healing halved (Necrotic Grasp) — no healing lands",
    "floor(1 × 0.5) = 0: halved to nothing still names the halving, not a 0");
  assert.strictEqual(env.edhaHealLine(patient("A", null), 0, 0, phrase), "",
    "nothing asked and no mark: say nothing rather than 'heals 0'");
  assert.strictEqual(env.edhaHealLine(patient("A", null), 5, 0, phrase), "",
    "no mark to name and nothing delivered: still silent, never a fabricated blame");
});

/* ---- 4b. THE SAME DRIFT ONE ARM OVER — H10's Investiture branch ---------------------------------- */

/* The TODO asked for the `inv` / `foc` arms to be audited beside the `hea` one. `foc` was already
 * honest (edhaGainFocus/edhaDrainFocus announce `next - cur` and go silent at 0 — the precedent
 * this whole pass generalizes); `inv` announced the rolled `n` against a CLAMPED write, so a gain
 * onto a nearly-full pool overstated by whatever the clamp ate. */
async function investiture(op, value, max, formula) {
  const env = loadEngine();
  const cards = captureChat(env);
  const types = handlerTypes(env);
  const who = mockActor({ name: "Reaper", id: "reaper", uuid: "Actor.reaper",
    system: { resources: { inv: { value, max: { value: max } } } } });
  who.isOwner = true;
  const owner = mockActor({ name: "Bench — Death", id: "death", uuid: "Actor.death" });
  owner.getRollData = () => ({ tier: 2 });
  const item = mockItem({ name: "Reaper's Harvest", actor: owner });
  const cfg = { op, resource: "inv", target: "victim", formula };
  const world = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } }, actors: [owner, who] });
  try {
    await types.get("edha-focus").executor.call(cfg, { item, options: { victim: who } });
  } finally { world.undo(); }
  return { inv: who.system.resources.inv.value, cards: cards.map(c => text(c.content)) };
}

test("item 68: the Investiture arm announces the clamped delta, and says nothing when it moved nothing", async () => {
  const full = await investiture("gain", 4, 5, "3");
  assert.strictEqual(full.inv, 5, "clamped at the maximum");
  assert.deepStrictEqual(full.cards, ["✨ Reaper's Harvest: Reaper recovers 1 Investiture."],
    "1 is what it gained; the card used to say 3");

  const room = await investiture("gain", 1, 5, "3");
  assert.deepStrictEqual(room.cards, ["✨ Reaper's Harvest: Reaper recovers 3 Investiture."], "the ordinary case is unchanged");

  const floored = await investiture("drain", 1, 5, "3");
  assert.strictEqual(floored.inv, 0, "floored at 0");
  assert.deepStrictEqual(floored.cards, ["✨ Reaper's Harvest: Reaper loses 1 Investiture."], "1 is what it lost");

  const nothing = await investiture("gain", 5, 5, "3");
  assert.strictEqual(nothing.inv, 5);
  assert.deepStrictEqual(nothing.cards, [],
    "already full: no write, no card — the edhaGainFocus convention this arm now shares");
});

/* ---- 5. THE FAMILY — the other announcers on the same contract ----------------------------------- */

test("item 68: the regrowth tick announces the delivered HP, not the queued amount", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Life", id: "life", uuid: "Actor.life" });
  owner.getRollData = () => ({ tier: 2 });
  owner.items = [mockItem({ name: "Resurgent Growth", actor: owner,
    events: [{ event: "use", handler: { type: "edha-heal-react", action: "queue-regrowth", amountFormula: "6" } }] })];
  const withered = patient("Withered Ally", WITHERED);
  const healthy = patient("Healthy Ally", null);
  await owner.setFlag("edha-content", "regrowth", [{ targetUuid: withered.uuid }, { targetUuid: healthy.uuid }]);
  const world = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } }, actors: [owner, withered, healthy] });
  const priorRef = env.edhaResolveActorRef;
  env.edhaResolveActorRef = async (u) => [withered, healthy].find(a => a.uuid === u) ?? null;
  try {
    await env.edhaResolveRegrowth({ started: true, combatant: { actor: owner } });
  } finally { env.edhaResolveActorRef = priorRef; world.undo(); }

  assert.strictEqual(hp(withered), 4, "blocked");
  assert.strictEqual(hp(healthy), 10, "4 + 6");
  const talent = cards.map(c => text(c.content)).filter(c => c.includes("Resurgent Growth"));
  assert.strictEqual(talent.length, 2, "one card per queued ally");
  assert.match(talent[0], /Withered Ally cannot regain HP \(Withering Touch\) — no healing lands\.$/,
    "the same queued 6 that healed the other ally must not be announced on this one");
  assert.match(talent[1], /Healthy Ally regains 6 health\.$/, "the unmarked ally's card is unchanged");
});

test("item 68: the Life regen tick announces the delivered HP", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — Green", id: "green", uuid: "Actor.green", type: "character" });
  owner.getRollData = () => ({ tier: 2 });
  const target = patient("Regenerating Ally", HALVED);
  await owner.setFlag("edha-content", "lifeRegen", [{ targetUuid: target.uuid, sourceName: "Primal Regeneration", formula: "6" }]);
  const world = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } }, actors: [owner, target] });
  try {
    await env.edhaResolveLifeRegen({ started: true, combatant: { actor: target } });
  } finally { world.undo(); }

  assert.strictEqual(hp(target), 7, "4 + floor(6 × 0.5)");
  const talent = cards.map(c => text(c.content)).filter(c => c.includes("Primal Regeneration"));
  assert.strictEqual(talent.length, 1);
  assert.match(talent[0], /regenerates 3 HP\.$/, "3 landed; the card used to say 6");
});

test("item 68: the pulse sweep counts who was HEALED and totals what landed, and names who was not", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const owner = mockActor({ name: "Bench — White", id: "white", uuid: "Actor.white" });
  owner.getRollData = () => ({ tier: 2 });
  owner.isOwner = true;
  owner.system = { resources: { hea: { value: 4, max: { value: 20 } } } };
  const item = mockItem({ name: "Mending Aura", actor: owner });
  const allies = [patient("Ally One", null), patient("Ally Two", WITHERED), patient("Ally Three", HALVED)];
  const ownTok = { id: "t0", center: { x: 0, y: 0 }, document: { disposition: 1 } };
  const toks = allies.map((a, i) => ({ id: `t${i + 1}`, actor: a, document: { disposition: 1, hidden: false }, center: { x: 10 * i, y: 0 } }));
  const world = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } }, actors: [owner, ...allies], placeables: [ownTok, ...toks] });
  const prior = { tok: env.edhaCasterToken, ft: env.edhaAttuneFtColor, circ: env.edhaTokensInCircle };
  env.edhaCasterToken = () => ownTok;
  env.edhaAttuneFtColor = () => 30;
  env.edhaTokensInCircle = () => toks;
  try {
    await env.edhaRunPulse(item, { kind: "heal", who: "allies", rangeColor: "white", formula: "4", includeSelf: false });
  } finally { Object.assign(env, { edhaCasterToken: prior.tok, edhaAttuneFtColor: prior.ft, edhaTokensInCircle: prior.circ }); world.undo(); }

  assert.deepStrictEqual(allies.map(hp), [8, 4, 6], "4 landed, 0 landed, 2 landed");
  const card = cards.map(c => text(c.content)).find(c => c.includes("Mending Aura"));
  assert.match(card, /healed 2 of 3 ally\(ies\) for 6 HP within 30 ft/,
    "A SWEEP IS THE ONE PLACE ONE NUMBER CANNOT BE TRUE FOR EVERYONE — each creature carries its " +
    "own mark. The card used to read 'healed 3 of 3 ally(ies) 4 HP', counting reach as healing " +
    "and quoting a per-target amount two of the three never got.");
  assert.match(card, /no healing landed on Ally Two/, "…and it names whoever the mark stopped");
});

/* ---- 6. THE PIN — no announcer may go back to building its sentence from the roll ---------------- */

test("item 68: every edhaCrossHeal caller that announces a heal builds the clause from edhaHealLine", () => {
  const code = codeOnly(readEngineSource());

  // The contract itself: one helper, and the cross-heal that feeds it returns on every path.
  assert.ok(/function edhaHealLine\(who, requested, delivered, phrase\)/.test(code),
    "edhaHealLine is the one place that decides whether a heal number may be printed");
  const crossHeal = code.slice(code.indexOf("async function edhaCrossHeal("));
  const body = crossHeal.slice(0, crossHeal.indexOf("\nasync function edhaCrossDamage"));
  assert.ok(!/\breturn;/.test(body),
    "every exit of edhaCrossHeal must report a number — a bare `return` hands its caller undefined, " +
    "which is exactly how the card and the write drifted apart");

  /* The six announcers, by the shape that makes them honest. A seventh heal card is welcome — it
   * just has to join this list AND this contract. Counted, not merely present, so deleting one
   * site's edhaHealLine while leaving the others fails here. */
  const uses = code.match(/edhaHealLine\(/g) || [];
  assert.ok(uses.length >= 8,
    `expected the helper's declaration + at least 7 call sites, found ${uses.length}`);
  for (const [what, re] of [
    ["H10's `hea` arm (Field Medicine — the reported row)", /const got = await edhaCrossHeal\(who, n\);[\s\S]{0,200}?edhaHealLine\(who, n, got,/],
    ["Interposing Shield's heal-ally button", /edhaHealLine\(victim, amount, got, d => `\$\{owner\.name\} reduces/],
    ["Shared Burden's redirect button", /edhaHealLine\(victim, amount, got, d => \(d < amount/],
    ["the triggered-effect heal", /edhaHealLine\(healee, amt, healAmt,/],
    ["the Life regen tick", /edhaHealLine\(cur, amt, got,/],
    ["the regrowth tick", /edhaHealLine\(t, amount, got,/],
    ["Lifeline's intercept card", /edhaHealLine\(victim, heal, got,/],
  ]) assert.ok(re.test(code), `${what} must build its clause from what edhaCrossHeal delivered`);

  // The pulse is the one group card, so it counts deliveries instead of a single clause.
  assert.ok(/if \(got > 0\) \{ healedCount\+\+; delivered \+= got; \} else cutNames\.push\(a\.name\);/.test(code),
    "the pulse sweep must count who was healed and total what landed, per creature");
});
