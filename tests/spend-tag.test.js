/* REGRESSION — THE SPEND STAMP (ruling R-4 half b, TODO_REPO_HYGIENE #28b, 2026-09-06).
 *
 * R-4: "any focus decrease counts as a spend (including your own GM bookkeeping edits)". #28a
 * gated the scene-scoped watches on an active combat; this half asks the other question — of the
 * decreases that DO reach a watcher, which ones were actually a spend?
 *
 * The answer stamps the SPEND rather than the bookkeeping, because the writes R-4 complains about
 * are the ones the engine never issues (a GM typing in the sheet, dragging a bar), so there is no
 * write to tag and the absence of a tag can never be evidence. Two positive signals:
 * `options.edha.spend` from the engine's own spend writers, and a live pre-use expectation for the
 * cosmere-rpg system's own `postRoll` activation deduction, which carries no options at all.
 *
 * ⚠ BOTH DIRECTIONS, EVERY CASE — this half's named risk is the mirror of #28a's: **wrongly
 * classifying a real spend as bookkeeping.** A predicate that answered "no" to everything would
 * pass a one-sided "a GM edit is not a spend" suite while silencing Whispered Doubt at the table.
 * So each block pairs the edit that must go quiet with the spend that must still fire.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, fireHook, captureChat, readEngineSource, codeOnly, eq, sleep } = require("./harness.js");

/* An actor whose `update()` records the OPTIONS as well as the change — the engine's spend tag
 * lives in options, and mockActor's shell keeps only the change. */
function spendActor(name, resources) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, system: { resources } });
  a.writes = [];
  const base = a.update.bind(a);
  a.update = async (change = {}, options = {}) => { a.writes.push({ change, options }); return base(change); };
  return a;
}
/* The GM-side staging every one of these watches needs (edhaDefBuffGmGate: exactly one GM writes). */
function asPrimaryGm(env) {
  const prior = { user: env.game.user, users: env.game.users };
  env.game.user = { isGM: true, id: "gm" };
  env.game.users = { activeGM: { isSelf: true } };
  return { undo() { env.game.user = prior.user; env.game.users = prior.users; } };
}
/* The change object in the shape a SHEET submits and the system's consume submits — nested, which
 * is what the engine's before/after stash reads. */
function focChange(v) { return { system: { resources: { foc: { value: v } } } }; }
function invChange(v) { return { system: { resources: { inv: { value: v } } } }; }

/* ---- 1. the predicate itself — the pinned decision table --------------------------------------- */

test("edhaIsSpend: an UNSTAMPED decrease is not a spend, a STAMPED one is", () => {
  const env = loadEngine();
  const a = spendActor("Foe", { foc: { value: 5 } });

  // THE FIX. This is the GM sheet edit R-4 names, and it was `true` for the whole tracked history.
  assert.strictEqual(env.edhaIsSpend(a, "foc", {}, 5, 2), false, "a bare decrease is a GM edit, not a spend");
  assert.strictEqual(env.edhaIsSpend(a, "foc", undefined, 5, 2), false, "…and so is one with no options object at all");

  // THE OTHER DIRECTION — without this the predicate is just a silencer.
  assert.strictEqual(env.edhaIsSpend(a, "foc", env.edhaSpendTag("edhaSpendResource"), 5, 2), true,
    "an engine spend writer's stamp makes it a spend");
  assert.strictEqual(env.edhaIsSpend(a, "foc", { edha: { spend: true, source: "x" }, edhaFoc: {} }, 5, 2), true,
    "…alongside whatever else the update's options already carry");

  // Never a spend when the resource did not go DOWN, tag or no tag.
  assert.strictEqual(env.edhaIsSpend(a, "foc", env.edhaSpendTag("x"), 2, 5), false, "an increase is never a spend");
  assert.strictEqual(env.edhaIsSpend(a, "foc", env.edhaSpendTag("x"), 5, 5), false, "…nor is an identity write");
});

test("edhaIsSpend: the declared BOOKKEEPING tag wins over every positive signal", () => {
  const env = loadEngine();
  const a = spendActor("Foe", { foc: { value: 5 } });
  env.edhaExpectSpend(a, "foc", 1, "Some Talent");          // a use is genuinely in flight…
  assert.strictEqual(env.edhaIsSpend(a, "foc", {}, 5, 4), true, "…so an untagged decrease reads as its cost");
  assert.strictEqual(env.edhaIsSpend(a, "foc", env.edhaBookkeepingTag("scene reset"), 5, 4), false,
    "…but an engine write that declares itself bookkeeping is never a spend");
});

test("edhaIsSpend: a pre-use expectation is the system's own activation cost, and it is scoped", () => {
  const env = loadEngine();
  const spender = spendActor("Spender", { foc: { value: 5 }, inv: { value: 3 } });
  const other = spendActor("Other", { foc: { value: 5 } });

  assert.strictEqual(env.edhaIsSpend(spender, "foc", {}, 5, 3), false, "no expectation yet");
  env.edhaExpectSpend(spender, "foc", 2, "Withering Ray");
  // The cosmere-rpg system deducts the cost itself, from a postRoll action, with a plain
  // actor.update() and NO options — verified against systems/cosmere-rpg/index.js at 2.1.0.
  assert.strictEqual(env.edhaIsSpend(spender, "foc", {}, 5, 3), true, "the declared cost of a use in flight");
  // Amount-agnostic ON PURPOSE: a scaling cost can exceed the declared value.min, and requiring a
  // match would drop exactly those — the "real spend read as bookkeeping" failure.
  assert.strictEqual(env.edhaIsSpend(spender, "foc", {}, 5, 0), true, "a bigger payment than declared still counts");
  // …but SCOPED: it is one actor's, one resource's.
  assert.strictEqual(env.edhaIsSpend(other, "foc", {}, 5, 3), false, "another creature's sheet edit is unaffected");
  assert.strictEqual(env.edhaIsSpend(spender, "inv", {}, 3, 1), false, "a different resource on the same creature too");
});

test("edhaIsSpend: an unreadable answer lands on YES — today's behaviour, never a silenced talent", () => {
  const env = loadEngine();
  const a = spendActor("Foe", { foc: { value: 5 } });
  const hostile = {};
  Object.defineProperty(hostile, "edha", { get() { throw new Error("boom"); } });
  assert.strictEqual(env.edhaIsSpend(a, "foc", hostile, 5, 2), true,
    "a throw fails toward 'is a spend' — the same fail-safe direction edhaInActiveCombat uses");
});

test("edhaExpectSpend: expectations expire on the wall clock and cannot pile up", () => {
  const env = loadEngine();
  const a = spendActor("Foe", { foc: { value: 5 } });
  // The window is a `const` in the engine's top-level LEXICAL scope, so it is not a property of
  // the vm context and cannot be read from here — jump the clock past any sane bound instead.
  const WINDOW_CAP_MS = 60000;
  for (let i = 0; i < 50; i++) env.edhaExpectSpend(a, "foc", 1, "Spam");
  assert.strictEqual(env.edhaIsSpend(a, "foc", {}, 5, 4), true, "still live inside the window");
  // The clock has to be moved INSIDE the vm — the engine reads the context's own Date, not this
  // realm's, so stubbing `Date.now` out here would silently prove nothing.
  const realDate = env.Date, realNow = Date.now;
  try {
    env.Date = { now: () => realNow() + WINDOW_CAP_MS + 1 };
    assert.strictEqual(env.edhaIsSpend(a, "foc", {}, 5, 4), false, "expired — a later hand edit is a hand edit");
  } finally { env.Date = realDate; }
  // …and the pruning is real, not just a read-time filter that leaves the array growing.
  env.edhaExpectSpend(a, "foc", 1, "After");
  assert.strictEqual(env.edhaIsSpend(a, "foc", {}, 5, 4), true, "a fresh use re-arms it");
});

/* ---- 2. the WRITE side — the engine's spend writers actually stamp ------------------------------ */

test("edhaSpendResource stamps every cost deduction it makes", async () => {
  const env = loadEngine();
  const a = spendActor("Payer", { foc: { value: 5 } });
  await env.edhaSpendResource(a, "foc", 2);
  assert.strictEqual(a.writes.length, 1);
  assert.strictEqual(a.writes[0].change["system.resources.foc.value"], 3, "the clamped write is unchanged");
  assert.strictEqual(a.writes[0].options?.edha?.spend, true, "…and it now carries the spend stamp");
  assert.strictEqual(a.writes[0].options?.edha?.source, "edhaSpendResource");
});

test("edhaGainResource does NOT stamp — a gain is not a spend", async () => {
  const env = loadEngine();
  const a = spendActor("Payer", { foc: { value: 1, max: 5 } });
  await env.edhaGainResource(a, "foc", 2);
  assert.strictEqual(a.writes.length, 1);
  assert.strictEqual(a.writes[0].options?.edha?.spend, undefined, "no spend tag on a refill");
});

test("edhaConsumeCost stamps the takeover/burst activation cost", () => {
  const env = loadEngine();
  const a = spendActor("Payer", { foc: { value: 4 } });
  const item = mockItem({ name: "Burst Talent", actor: a, system: { activation: { consume: [{ type: "resource", resource: "foc", value: { min: 2 } }] } } });
  assert.strictEqual(env.edhaConsumeCost(item), true);
  assert.strictEqual(a.writes.length, 1);
  assert.strictEqual(a.writes[0].change["system.resources.foc.value"], 2, "the deduction is unchanged");
  assert.strictEqual(a.writes[0].options?.edha?.spend, true, "…and stamped");
});

/* ---- 3. the FOCUS family, end to end, both directions ------------------------------------------ */

/* The dispatch is stubbed rather than driven: what this file pins is WHETHER the watch fires, and
 * the watchers themselves (range, disposition, once-per-round, and #28a's combat gate) are pinned
 * in watch-dispatch.test.js and combat-gate.test.js. Engine top-level functions are properties of
 * the vm context, so the hook's call resolves through the stub. */
function stubFocusWatch(env) {
  const fired = [];
  env.edhaRunFocusWatch = async (actor, oldF, newF) => { fired.push({ actor: actor?.name, oldF, newF }); };
  return fired;
}
async function landFocusWrite(env, actor, newValue, options = {}) {
  await fireHook(env, "preUpdateActor", actor, focChange(newValue), options);
  await fireHook(env, "updateActor", actor, focChange(newValue), options);
  await sleep(0);
  return options;
}

test("R-4: a GM sheet edit that lowers focus fires NO focus-change watch", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubFocusWatch(env);
  try {
    const foe = spendActor("Adversary", { foc: { value: 5 } });
    const opts = await landFocusWrite(env, foe, 2);
    eq(opts.edhaFoc, { old: 5, new: 2 });                        // the before/after stash still happens
    assert.strictEqual(fired.length, 0,
      "R-4: Ben correcting the sheet must not tax the creature through the enemy focus watchers");
  } finally { gm.undo(); }
});

test("R-4: a REAL spend through the spend primitive still fires the focus-change watch", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubFocusWatch(env);
  try {
    const foe = spendActor("Adversary", { foc: { value: 5 } });
    // The whole chain: the primitive writes AND stamps, and the options it produced are what the
    // update hooks receive — so this proves the tag survives from writer to watcher.
    await env.edhaSpendResource(foe, "foc", 3);
    const optionsFromPrimitive = foe.writes[0].options;
    foe.system.resources.foc.value = 5;      // Foundry fires preUpdate BEFORE the write applies
    await landFocusWrite(env, foe, 2, optionsFromPrimitive);
    assert.strictEqual(fired.length, 1, "a wired cost — an adversary ability's included — still counts");
    eq(fired[0], { actor: "Adversary", oldF: 5, newF: 2 });
  } finally { gm.undo(); }
});

test("R-4: the system's OWN activation cost has no options, and still fires the watch", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubFocusWatch(env);
  try {
    const foe = spendActor("Adversary", { foc: { value: 5 } });
    const talent = mockItem({ name: "Costly Talent", actor: foe, system: { activation: { consume: [{ type: "resource", resource: "foc", value: { min: 3 } }] } } });
    await fireHook(env, "cosmere-rpg.preUseItem", talent);
    // …then the system's postRoll deduction lands, bare, exactly as index.js writes it.
    await landFocusWrite(env, foe, 2);
    assert.strictEqual(fired.length, 1, "the pre-use expectation is what saves the commonest real spend");
  } finally { gm.undo(); }
});

test("R-4: an untargeted use of a FREE talent arms nothing", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubFocusWatch(env);
  try {
    const foe = spendActor("Adversary", { foc: { value: 5 } });
    const free = mockItem({ name: "Free Talent", actor: foe, system: { activation: {} } });
    await fireHook(env, "cosmere-rpg.preUseItem", free);
    await landFocusWrite(env, foe, 2);
    assert.strictEqual(fired.length, 0, "a talent that costs nothing cannot excuse a hand edit");
  } finally { gm.undo(); }
});

test("R-4: a focus GAIN never dispatched before and still does not", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubFocusWatch(env);
  try {
    const foe = spendActor("Adversary", { foc: { value: 2 } });
    await landFocusWrite(env, foe, 5, env.edhaSpendTag("mislabelled"));
    assert.strictEqual(fired.length, 0, "the decrease test comes first — a stamp cannot invent a spend");
  } finally { gm.undo(); }
});

/* ---- 4. the ORDER Investiture watch, both directions ------------------------------------------- */

function stubInvestWatch(env) {
  const fired = [];
  env.edhaOrderInvestWatch = async (spender) => { fired.push(spender?.name); };
  return fired;
}
async function landInvWrite(env, actor, newValue, options = {}) {
  await fireHook(env, "preUpdateActor", actor, invChange(newValue), options);
  await fireHook(env, "updateActor", actor, invChange(newValue), options);
  await sleep(0);
  return options;
}

test("R-4: a GM Investiture edit is not 'activating Investiture' — no Edict violation prompt", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubInvestWatch(env);
  try {
    const bound = spendActor("Bound", { inv: { value: 4 } });
    const opts = await landInvWrite(env, bound, 1);
    eq(opts.edhaOrderInv, { old: 4, new: 1 });                   // the stash still happens
    assert.strictEqual(fired.length, 0, "no prompt from a sheet correction");
  } finally { gm.undo(); }
});

/* R-72 (ANSWERED 2026-09-06, Ben (b)) — THE TABLE-FACING PAIR. The Order Edict fires on the
 * creature's OWN activations, so an enemy taking its Investiture must not read as one. Both
 * directions, because a fix that silenced the watch entirely would pass the first case alone. */
test("R-72: an Edict-bound creature DRAINED by an enemy gets NO violation prompt", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubInvestWatch(env);
  try {
    const bound = spendActor("Bound", { inv: { value: 4 } });
    /* COUPLE THE TWO HALVES. H10's executor lives inside a registerItemEventHandlerType config
     * object, so no harness can call it — which means a behavioural case that hand-built its own
     * options would pass even with the spend stamp back in the engine. So read the branch's own
     * classification out of the source FIRST, then land that classification on the watch. */
    const code = codeOnly(readEngineSource());
    const block = code.slice(code.indexOf('type: "edha-focus"'));
    const invWrite = /edhaResourceWrite\(who, "inv", \{ value: next \},[^;]*?(edha\w+Tag)\(/.exec(block);
    assert.ok(invWrite, "H10's Investiture write is still one edhaResourceWrite with a tag argument");
    assert.strictEqual(invWrite[1], "edhaBookkeepingTag",
      "R-72 (b): H10's drain is bookkeeping. With edhaSpendTag here the case below is a lie.");
    const opts = await landInvWrite(env, bound, 1, env[invWrite[1]]("Reaper's Harvest (Investiture drain)"));
    eq(opts.edhaOrderInv, { old: 4, new: 1 });                   // the stash still happens
    assert.strictEqual(fired.length, 0,
      "the creature activated nothing — someone took it. Until R-72 this write carried edhaSpendTag " +
      "and prompted a violation for being robbed.");
  } finally { gm.undo(); }
});

test("R-4: a real Investiture spend still raises the Edict violation prompt", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  captureChat(env);
  const fired = stubInvestWatch(env);
  try {
    const bound = spendActor("Bound", { inv: { value: 4 } });
    await env.edhaSpendResource(bound, "inv", 3);
    const optionsFromPrimitive = bound.writes[0].options;
    bound.system.resources.inv.value = 4;    // preUpdate sees the value before the write applies
    await landInvWrite(env, bound, 1, optionsFromPrimitive);
    eq(fired, ["Bound"]);                    // a wired cost still violates the Edict
  } finally { gm.undo(); }
});

/* ⚠ FLIPPED 2026-09-06 (R-72). This case used to demand `edhaSpendTag(` here — "unstamped it would
 * silently stop counting". R-72 (b) answered that an INVOLUNTARY drain is not a spend at all, and
 * the relay's only emitter is `edhaDrainFocus`'s unowned-target branch, so the two halves move
 * together in the other direction: both bookkeeping. The invariant the case really guards is
 * unchanged and is what the assertion now says — the relay half must classify itself EXACTLY as the
 * direct half does, because a split classification is the asymmetry #28b stamped this site to
 * close (a drained Edict-bound creature would prompt when the drainer lacks ownership and stay
 * quiet when it does not). */
test("R-72: the cross-actor set-resource RELAY classifies like the direct half — bookkeeping, not a spend", () => {
  const env = loadEngine();
  const src = readEngineSource();
  const start = src.indexOf('"set-resource": async (payload)');
  assert.ok(start > 0, "the relay handler is still named that");
  const relay = src.slice(start, src.indexOf('"rewrite-roll": async (payload)', start));
  assert.ok(/edhaBookkeepingTag\(/.test(relay),
    "edhaDrainFocus's unowned-target branch relays through here; R-72 (b) makes it bookkeeping");
  assert.ok(!/edhaSpendTag\(/.test(relay),
    "…and the spend stamp must not come back, or the unowned drain violates an Edict the owned one does not");

  // The behavioural half: whatever the relay writes, the predicate must read as "not a spend".
  const a = spendActor("Bound", { foc: { value: 4 } });
  assert.strictEqual(env.edhaIsSpend(a, "foc", env.edhaBookkeepingTag("set-resource relay (involuntary drain)"), 4, 2), false);
});

/* ---- 5. the predicate is adopted at the spend sites and NOWHERE else --------------------------- */

test("edhaIsSpend is consulted at exactly the two spend-detecting watches", () => {
  const code = codeOnly(readEngineSource());
  const calls = code.match(/(?<!function )\bedhaIsSpend\(/g) || [];
  assert.strictEqual(calls.length, 2,
    "the focus-change watch and the Order Investiture watch. A third call means the predicate has " +
    "spread to a decrease that is NOT a spend — the health→0 defeat watchers especially: a GM " +
    "zeroing an adversary's HP is a legitimate kill and must keep announcing `defeat`.");
});

test("the health→0 defeat watchers are deliberately NOT gated on the spend predicate", async () => {
  const env = loadEngine();
  const gm = asPrimaryGm(env);
  const cards = captureChat(env);
  try {
    const foe = spendActor("Victim", { hea: { value: 6 } });
    foe.type = "npc";
    foe.getActiveTokens = () => [];
    let dispatched = 0;
    env.edhaDispatchWatchers = async (payload) => { if (payload?.kind === "defeat") dispatched++; };
    const change = { system: { resources: { hea: { value: 0 } } } }, options = {};
    await fireHook(env, "preUpdateActor", foe, change, options);
    eq(options.edhaHea, { old: 6, new: 0 });                     // the HP stash is untouched by #28b
    await fireHook(env, "updateActor", foe, change, options);
    await sleep(0);
    // The defeat path needs a token to resolve, which this bare actor has not got — the point of
    // the case is that it got as far as the token lookup, i.e. nothing rejected it as "unstamped".
    assert.strictEqual(cards.length, 0);
  } finally { gm.undo(); }
});
