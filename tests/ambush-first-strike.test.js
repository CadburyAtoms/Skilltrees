/* REGRESSION — R-50: an ambush-belief rider benefits its OWN first strike.
 * (EDHA_RULINGS.md R-50, answered 2026-09-06 (b); TODO_REPO_HYGIENE #53.)
 *
 * Bench run 18 saw the +1d6 / +1d8 `whenTargetFooled` rider first appear on the SECOND strike:
 * the belief test was a fire-and-forget `await Roll.evaluate()` kicked off from the use hook,
 * while the rider is chosen when the damage formula is ASSEMBLED — synchronously, before that
 * promise settles — so the ledger write always landed after the number was fixed. Ben read the ten
 * carrier cards ("Its first attack from unbroken stillness is made from ambush") and ruled (b):
 * the strike that fools them is the strike that benefits.
 *
 * The fix makes the DECISION synchronous — `edhaAmbushBeliefRoll`, the one pure place the roll /
 * DC / advantage maths lives, drawn through the engine's own `edhaRandomFace` — and leaves only
 * the ledger write + cards async. Nothing is awaited inside the use hook (the takeover bug class).
 *
 * FOUR THINGS THIS FILE INSISTS ON:
 *   1. A first strike against an UNTESTED target rolls the test right there and applies the rider
 *      on a fail — in the same tick, before any write lands.
 *   2. A second strike against the same target reads the ledger and rolls NO second test; the use
 *      hook firing first in the same tick does not roll twice either (the pending map).
 *   3. The Mistheron path (a placed phantom copy, no `edha-ambush-belief` rule) is unchanged: it
 *      reads `phantomBelief` and never rolls.
 *   4. The shared helper is the ONLY place the roll / DC / advantage logic lives — a source-scan pin.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, fireHook, stageWorld, withStubs, captureChat, readEngineSource, codeOnly, sleep } = require("./harness.js");

const SCENE = "sceneA";
const TOK = "Scene.sceneA.Token.1111111111111111";   // real uuids are dotted — the ledger escapes them

/* A Stillback: the seeming TRAIT carries the ambush-belief rule, the bite carries the rider. */
function stillback(env, { advantage = false } = {}) {
  const owner = mockActor({ name: "Stillback", id: "stillback", uuid: "Actor.stillback", type: "npc",
    system: { defenses: { cog: { value: 14 } } } });
  const seeming = mockItem({ name: "Causeway Seeming", actor: owner,
    events: [{ handler: { type: "edha-ambush-belief", dcFrom: "cog", perceptionAdvantage: advantage, note: "" } }] });
  const bite = mockItem({ name: "Ambush Bite", actor: owner,
    events: [{ handler: { type: "edha-damage-rider", bonusFormula: "1d6", appliesTo: "any", whenTargetFooled: true } }],
    system: { activation: { type: "skill_test" }, damage: { type: "keen", formula: "1d10 + 3" } } });
  owner.items = [seeming, bite];
  return { owner, seeming, bite };
}
/* A victim with a real Perception mod and ONE token on the scene. */
function victim(env, { prcMod = 2 } = {}) {
  const v = mockActor({ name: "Tem", id: "tem", uuid: "Actor.tem", type: "character",
    system: { skills: { prc: { mod: prcMod, rank: 1 } } } });
  const token = { name: v.name, actor: v, document: { uuid: TOK } };
  v.getActiveTokens = () => [token];
  return { v, token };
}
/* Foundry's RNG, counted: every d20 face the engine draws goes through CONFIG.Dice.randomUniform.
 * `u` fixes the face — 0.01 → 1 (a fail against DC 14), 0.99 → 20 (a pass). */
function dice(env, u) {
  const counter = { rolls: 0 };
  env.CONFIG.Dice = { randomUniform: () => { counter.rolls++; return u; } };
  return counter;
}
function withTable(env, { owner, token, actors = [owner] }, fn) {
  const users = Object.assign([{ id: "gm", isGM: true, active: true }], { activeGM: { isSelf: true } });
  users.filter = Array.prototype.filter;
  const undo = stageWorld(env, { user: { isGM: true, id: "gm", targets: new Set([token]) }, users, actors }).undo;
  return withStubs(env, { canvas: { scene: { id: SCENE }, tokens: { placeables: [] } } }, fn).finally(undo);
}
const ledgerOf = (owner) => owner.getFlag("edha-content", "ambushBelief") ?? null;
const entryOf = (env, owner) => env.edhaAmbushEntry(ledgerOf(owner), TOK);

/* ---- 1. the first strike rolls the test and benefits on a fail ---------------------------------- */

test("R-50: the FIRST strike against an untested target rolls the belief test and carries the rider on a fail", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const { owner, bite } = stillback(env);
  const { token } = victim(env);
  const d = dice(env, 0.01);   // face 1 + mod 2 = 3 vs DC 14 → fooled

  await withTable(env, { owner, token }, async () => {
    assert.strictEqual(ledgerOf(owner), null, "untested — no ledger entry yet");
    const bonus = env.edhaRiderBonus(bite, owner);   // the SYNC damage-formula assembly
    assert.strictEqual(bonus, "(1d6)[Ambush Bite]", "THE FIX: the rider is on the strike that fools them");
    assert.strictEqual(d.rolls, 1, "exactly one d20 was drawn, synchronously, before any write");
    assert.strictEqual(cards.length, 0, "…and the card is not posted yet — the decision came first");
    await sleep(0);
  });
  const e = entryOf(env, owner);
  assert.ok(e, "the ledger write landed afterwards");
  assert.strictEqual(e.fooled, true);
  assert.strictEqual(e.total, 3, "1d20 (face 1) + Perception mod 2");
  assert.ok(cards.some((c) => /Perception <strong>3<\/strong> vs 14 .*taken in/.test(c.content)),
    "the GM record card reads exactly as the async path always did");
});

test("R-50 NEGATIVE: a first strike the target SEES THROUGH carries no rider — the test still ran, once", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const { owner, bite } = stillback(env);
  const { token } = victim(env);
  const d = dice(env, 0.99);   // face 20 + 2 = 22 vs 14 → sees through

  await withTable(env, { owner, token }, async () => {
    assert.strictEqual(env.edhaRiderBonus(bite, owner), null, "no rider on a pass");
    assert.strictEqual(d.rolls, 1);
    await sleep(0);
    // The SECOND strike after a pass is the case only the sync test's own ledger read serves
    // (edhaTargetFooled answers "not fooled" for both an untested and a seen-through target).
    d.rolls = 0;
    env.CONFIG.Dice.randomUniform = () => { d.rolls++; return 0.01; };   // a re-roll here WOULD fool them
    assert.strictEqual(env.edhaRiderBonus(bite, owner), null, "still no rider — they saw through it once, for the scene");
    assert.strictEqual(d.rolls, 0, "NEGATIVE CONTROL: a seen-through target is not re-tested");
    await sleep(0);
  });
  const e = entryOf(env, owner);
  assert.strictEqual(e?.fooled, false, "…but the pass IS recorded, so later strikes do not re-test");
  assert.strictEqual(cards.filter((c) => /sees through it/.test(c.content)).length, 1, "one card, one test");
});

test("R-50: advantage on the seeming draws TWO d20s and keeps the higher", () => {
  const env = loadEngine();
  let i = 0;
  const faces = [3, 17];
  const r = env.edhaAmbushBeliefRoll({ dc: 14, mod: 2, advantage: true }, () => faces[i++]);
  assert.strictEqual(i, 2, "two dice");
  assert.strictEqual(r.total, 19, "kept the 17, + mod 2");
  assert.strictEqual(r.fooled, false);
  assert.strictEqual(r.formula, "2d20kh + 2");
  const flat = env.edhaAmbushBeliefRoll({ dc: 14, mod: 2, advantage: false }, () => 3);
  assert.deepStrictEqual({ total: flat.total, fooled: flat.fooled, formula: flat.formula }, { total: 5, fooled: true, formula: "1d20 + 2" });
  assert.strictEqual(env.edhaAmbushBeliefRoll({ dc: 0, mod: 0 }, () => 9).dc, 10, "a missing DC falls back to 10, as the async path always did");
});

/* ---- 2. the second strike reads the ledger — no second test ------------------------------------- */

test("R-50: the SECOND strike against the same target reads the ledger and rolls NO second test", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const { owner, bite } = stillback(env);
  const { token } = victim(env);
  const d = dice(env, 0.01);

  await withTable(env, { owner, token }, async () => {
    env.edhaRiderBonus(bite, owner);
    await sleep(0);                                    // the first strike's ledger write lands
    assert.strictEqual(d.rolls, 1);
    assert.strictEqual(cards.length, 1);
    d.rolls = 0;
    assert.strictEqual(env.edhaRiderBonus(bite, owner), "(1d6)[Ambush Bite]", "still fooled — read from the ledger");
    assert.strictEqual(d.rolls, 0, "NEGATIVE CONTROL: no second d20");
    await sleep(0);
  });
  assert.strictEqual(cards.length, 1, "and no second belief card");
});

test("R-50: the use hook and the rider in the SAME tick roll once and agree (the pending map)", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const { owner, bite } = stillback(env);
  const { token } = victim(env);
  const d = dice(env, 0.01);
  // A real Foundry setFlag is a server round-trip; give the mock the same async gap so the window
  // between the hook's decision and its ledger write is REAL here, not an accident of the stub.
  const base = owner.setFlag.bind(owner);
  owner.setFlag = async (...a) => { await sleep(5); return base(...a); };

  await withTable(env, { owner, token }, async () => {
    await fireHook(env, "cosmere-rpg.useItem", bite);   // the hook's handler is sync; its write is still in flight
    assert.strictEqual(d.rolls, 1, "the hook rolled");
    assert.strictEqual(ledgerOf(owner), null, "…and has NOT written yet");
    assert.strictEqual(env.edhaRiderBonus(bite, owner), "(1d6)[Ambush Bite]", "the rider reads the pending result");
    assert.strictEqual(d.rolls, 1, "no second roll while the write is in flight");
    await sleep(20);
    assert.strictEqual(entryOf(env, owner)?.fooled, true);
    d.rolls = 0;
    env.edhaRiderBonus(bite, owner);
    assert.strictEqual(d.rolls, 0, "after the write, the ledger serves it");
  });
  assert.strictEqual(cards.filter((c) => /Perception/.test(c.content)).length, 1, "ONE belief card for the whole exchange");
});

test("R-50: the use-hook path has no target → the reminder card only, no roll, no ledger", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const { owner, bite } = stillback(env);
  const d = dice(env, 0.01);
  const users = Object.assign([{ id: "gm", isGM: true, active: true }], { activeGM: { isSelf: true } });
  users.filter = Array.prototype.filter;
  const undo = stageWorld(env, { user: { isGM: true, id: "gm", targets: new Set() }, users, actors: [owner] }).undo;
  try {
    await withStubs(env, { canvas: { scene: { id: SCENE }, tokens: { placeables: [] } } }, async () => {
      await fireHook(env, "cosmere-rpg.useItem", bite);
      assert.strictEqual(env.edhaRiderBonus(bite, owner), null, "no target, no rider");
      await sleep(0);
    });
  } finally { undo(); }
  assert.strictEqual(d.rolls, 0);
  assert.strictEqual(ledgerOf(owner), null);
  assert.ok(cards.some((c) => /target the victim before rolling/.test(c.content)), "the fallback reminder still posts");
});

/* ---- 3. the Mistheron path is unchanged ------------------------------------------------------- */

test("R-50 NEGATIVE: the Mistheron's placed-copy seeming reads phantomBelief and never rolls", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  // A caster with the rider but NO edha-ambush-belief rule — the copy tested at placement.
  const bird = mockActor({ name: "Mistheron", id: "bird", uuid: "Actor.bird", type: "npc" });
  const beak = mockItem({ name: "Spearing Beak", actor: bird,
    events: [{ handler: { type: "edha-damage-rider", bonusFormula: "1d6", appliesTo: "any", whenTargetFooled: true } }],
    system: { activation: { type: "skill_test" }, damage: { type: "keen", formula: "1d8" } } });
  bird.items = [beak];
  const copy = mockActor({ name: "Mistheron (copy)", id: "copy", uuid: "Actor.copy", type: "npc",
    flags: { phantomDouble: true, summoner: bird.id, phantomBelief: { fooled: [{ uuid: TOK }] } } });
  const { token } = victim(env);
  const d = dice(env, 0.99);   // a roll here would PASS and drop the rider — so a rider proves no roll happened

  await withTable(env, { owner: bird, token, actors: [bird, copy] }, async () => {
    assert.strictEqual(env.edhaRiderBonus(beak, bird), "(1d6)[Spearing Beak]", "fooled per the copy's ledger");
    assert.strictEqual(d.rolls, 0, "no belief roll — the placement sweep already tested them");
    copy.flags["edha-content"].phantomBelief = { fooled: [] };
    assert.strictEqual(env.edhaRiderBonus(beak, bird), null, "not fooled → no rider, and STILL no roll");
    assert.strictEqual(d.rolls, 0);
    await sleep(0);
  });
  assert.strictEqual(ledgerOf(bird), null, "no ambushBelief ledger is ever written for a phantom caster");
  assert.strictEqual(cards.length, 0);
});

/* ---- 4. the maths lives in ONE place --------------------------------------------------------- */

test("R-50: edhaAmbushBeliefRoll is the only place the roll / DC / advantage logic lives", () => {
  const code = codeOnly(readEngineSource());
  const count = (re) => (code.match(re) || []).length;
  assert.strictEqual(count(/(?<!function )\bedhaAmbushBeliefRoll\(/g), 1,
    "ONE caller (the sync test). A second means a path re-derived the roll and can drift.");
  assert.strictEqual(count(/perceptionAdvantage/g), 2,
    "the schema field + edhaAmbushBeliefParams. A third read means a path decided advantage on its own.");
  assert.strictEqual(count(/2d20kh/g), 1, "the advantage formula is spelled once, in the pure helper");
  assert.strictEqual(count(/(?<!function )\bedhaAmbushBeliefTest\(/g), 2,
    "the use hook + the rider path both go through the ONE sync test");
  assert.strictEqual(count(/(?<!function )\bedhaAmbushBeliefCommit\(/g), 1, "…and only it commits");
  // The decision must stay synchronous: no `await` and no Foundry Roll between the sync test's
  // declaration and the async commit's.
  const start = code.indexOf("function edhaAmbushBeliefTest(");
  const end = code.indexOf("async function edhaAmbushBeliefCommit(");
  assert.ok(start > 0 && end > start, "both declarations present, in that order");
  const body = code.slice(start, end);
  assert.ok(!/\bawait\b/.test(body), "no await inside the sync test");
  assert.ok(!/new Roll\(/.test(body), "no Foundry Roll inside the sync test — edhaRandomFace only");
  // …and the use hook that dispatches it never awaits (the takeover class of bug).
  const hook = code.indexOf('Hooks.on("cosmere-rpg.useItem", (item) => {', code.indexOf("function edhaAmbushFooledIn("));
  assert.ok(hook > 0 && hook < start, "the ambush use hook sits just above the sync test");
  assert.ok(!/\bawait\b/.test(code.slice(hook, start)), "the ambush use hook awaits nothing");
});
