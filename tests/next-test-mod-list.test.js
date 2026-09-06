/* THE NEXT-TEST MOD LIST — item 49, Ben's R-15(b): "that needs to be a list not one slot".
 *
 * `flags.edha-content.nextTestMod` was ONE object, so the second writer silently overwrote the
 * first: Coercive Pressure's Cognitive disadvantage and Probability Net's −1d6 could not sit on the
 * same victim, and the loser left no trace anywhere (R-15, checklist 2bI-4). R-57 named the other
 * half of the same shape — an expired round-scoped mod was LEFT on the actor, cleared only by being
 * overwritten — and R-20 settled that a "this round" mod really does die at the round change.
 *
 * These four pins are the ones the item's "Done when" names, plus the writer half:
 *   1. two riders on ONE target both apply, and each clears independently;
 *   2. flat/dice modifiers SUM, and a disadvantage entry rides alongside a formula-only one;
 *   3. a round-scoped entry is PRUNED off the document when the round turns, an unstamped one is not;
 *   4. a legacy single object still reads (and normalises) as a one-entry list.
 *
 * Every case drives the REAL readers (`edhaNextTestPreRoll` / `edhaNextTestConsume`) rather than
 * asserting on a helper in isolation — the defect was never in the matcher, it was in the slot.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, withStubs, RollStub, eq, sleep } = require("./harness.js");

const env = loadEngine();

/* A d20 roll the pre-roll/consume pair will accept: `data.skill` for the gates, `options` for the
 * advantageMode write, `terms` for the formula splice. */
const ROLL = (skill = "dec", attribute = "int") => ({
  data: { skill: { id: skill, attribute } },
  options: {},
  terms: [{ operand: 0 }],
  resetFormula() { return ""; },
  configureModifiers() {},
});
const CFG = (actor) => ({ data: { source: { actor } } });

function bearer(nextTestMod) {
  const a = mockActor({ name: "Victim", flags: nextTestMod === undefined ? {} : { nextTestMod } });
  a.isOwner = true;                       // edhaSetEdhaFlag writes locally rather than relaying
  return a;
}
const stored = (a) => a.getFlag("edha-content", "nextTestMod");
// Read through edhaNextModList so a REGRESSION to the single slot fails as a readable list diff
// ("expected two sources, got one") instead of a TypeError on a non-array flag.
const sources = (a) => env.edhaNextModList(stored(a)).map((m) => m.source);

/* Run the pre-roll with a capturing Roll so the SUMMED formula terms are observable (the harness's
 * Roll stub has no real terms, but it records every formula the engine builds). */
async function pre(actor, roll) {
  const seen = [];
  await withStubs(env, { Roll: RollStub({ capture: seen }) }, async () => {
    env.edhaNextTestPreRoll(roll, null, CFG(actor));
  });
  return seen;
}
async function consume(actor, roll) {
  env.edhaNextTestConsume(roll, null, CFG(actor));
  await sleep(0);                          // the write is `void`ed, as it has always been
}

const COERCIVE = { source: "Coercive Pressure", mode: "disadvantage", attr: "int, wil", count: 1, gid: "G-COERCIVE" };
const PNET = { source: "Probability Net", formula: "-1d6", count: 1, gid: "G-PNET" };

// --- 1. THE DONE-WHEN: two riders on one target ------------------------------------------------

test("item 49: a second writer APPENDS — Coercive Pressure and Probability Net both survive (R-15)", async () => {
  const a = bearer();
  await env.edhaSetNextTestMod(a, { source: "Coercive Pressure", mode: "disadvantage", attr: "int, wil", count: 1 });
  await env.edhaSetNextTestMod(a, { source: "Probability Net", formula: "-1d6", count: 1 });
  eq(sources(a), ["Coercive Pressure", "Probability Net"]);
});

test("item 49: both riders APPLY to one matching test (2bI-4's narrowing is gone)", async () => {
  const a = bearer([COERCIVE, PNET]);
  const roll = ROLL("dec", "int");
  const seen = await pre(a, roll);
  assert.strictEqual(roll.options.advantageMode, "disadvantage", "Coercive Pressure's disadvantage applied");
  assert.ok(seen.some((f) => f.includes("1d6") && f.includes("Probability Net")),
    `Probability Net's die applied too — built formulas were ${JSON.stringify(seen)}`);
});

test("item 49: each clears INDEPENDENTLY — a Physical test spends only the ungated rider", async () => {
  const a = bearer([COERCIVE, PNET]);
  // Athletics/str: Coercive's Cognitive gate rejects it, Probability Net is ungated and rides.
  const physical = ROLL("ath", "str");
  const seen = await pre(a, physical);
  assert.strictEqual(physical.options.advantageMode, undefined, "the Cognitive gate still filters PER ENTRY");
  assert.ok(seen.some((f) => f.includes("Probability Net")), "the ungated rider still applied");
  await consume(a, physical);
  eq(sources(a), ["Coercive Pressure"], "only the entry that matched was spent");

  // And the Cognitive test then spends the survivor, leaving the flag empty.
  const cognitive = ROLL("dec", "int");
  await pre(a, cognitive);
  assert.strictEqual(cognitive.options.advantageMode, "disadvantage");
  await consume(a, cognitive);
  assert.strictEqual(stored(a) ?? null, null, "the last entry clears the flag outright");
});

test("item 49: a counted entry keeps its remaining uses while its neighbour is spent", async () => {
  const cascade = { source: "Probability Cascade", mode: "disadvantage", count: 2, gid: "G-CASCADE" };
  const a = bearer([cascade, PNET]);
  const roll = ROLL();
  await pre(a, roll);
  await consume(a, roll);
  // count decrements on its OWN entry; the spent one is removed and nothing else is touched.
  eq(env.edhaNextModList(stored(a)).map((m) => [m.source, m.count]), [["Probability Cascade", 1]]);
});

// --- 2. FOLDING: modifiers sum, modes OR ------------------------------------------------------

test("edhaNextModFoldMode: boolean-OR per direction, and a mixed pair cancels to null", () => {
  assert.strictEqual(env.edhaNextModFoldMode([{ mode: "advantage" }, { formula: "3" }]), "advantage");
  assert.strictEqual(env.edhaNextModFoldMode([{ mode: "disadvantage" }, { formula: "3" }]), "disadvantage");
  assert.strictEqual(env.edhaNextModFoldMode([{ mode: "advantage" }, { mode: "advantage" }]), "advantage",
    "two of the same direction is still that direction, not a double");
  assert.strictEqual(env.edhaNextModFoldMode([{ mode: "advantage" }, { mode: "disadvantage" }]), null,
    "opposite directions cancel — the caller then writes nothing at all");
  assert.strictEqual(env.edhaNextModFoldMode([{ formula: "3" }]), null,
    "a formula-only mod must not force a mode (07-16b)");
});

test("item 49: two dice/flat modifiers SUM onto the same roll, each flavored with its own source", async () => {
  const a = bearer([
    { source: "Decisive Command", formula: "3", count: 1, gid: "G-DC" },
    PNET,
    { source: "Pattern Recognition", mode: "disadvantage", count: 1, gid: "G-PR" },
  ]);
  const roll = ROLL();
  const seen = await pre(a, roll);
  assert.ok(seen.some((f) => f.includes("[Decisive Command]")), `Decisive Command's term — ${JSON.stringify(seen)}`);
  assert.ok(seen.some((f) => f.includes("[Probability Net]")), `Probability Net's term — ${JSON.stringify(seen)}`);
  assert.strictEqual(roll.options.advantageMode, "disadvantage", "the mode entry rides alongside both modifiers");
});

test("item 49: a mixed advantage/disadvantage pair leaves the roll exactly as the player set it", async () => {
  const a = bearer([
    { source: "Anticipate", mode: "advantage", count: 1, gid: "G-ANT" },
    { source: "Pattern Recognition", mode: "disadvantage", count: 1, gid: "G-PR" },
  ]);
  const roll = ROLL();
  roll.options.advantageMode = "advantage";          // the player's own dialog choice
  await pre(a, roll);
  assert.strictEqual(roll.options.advantageMode, "advantage", "a cancelling pair must not stomp it");
});

// --- 3. PER-ENTRY EXPIRY, PRUNED ON READ (R-20 + R-57) ----------------------------------------

test("edhaNextModExpired: only a round-stamped entry can die, and never out of combat", () => {
  assert.strictEqual(env.edhaNextModExpired({ round: 4 }, 5), true);
  assert.strictEqual(env.edhaNextModExpired({ round: 4 }, 4), false);
  assert.strictEqual(env.edhaNextModExpired({ round: 4 }, null), false, "no combat = the stamp is inert");
  assert.strictEqual(env.edhaNextModExpired({ mode: "advantage" }, 9), false, "unstamped entries wait");
});

test("item 49: the round-scoped entry is PRUNED off the document when the round turns (R-57)", async () => {
  const a = bearer([
    { source: "Pattern Recognition", mode: "disadvantage", count: 1, round: 4, gid: "G-PR" },
    { source: "Anticipate", mode: "advantage", count: 1, gid: "G-ANT" },
  ]);
  eq(env.edhaNextModsOf(a, 4).map((m) => m.source), ["Pattern Recognition", "Anticipate"], "both live in round 4");
  eq(env.edhaNextModsOf(a, 5).map((m) => m.source), ["Anticipate"], "the stamped one stops applying in round 5");
  await sleep(0);
  eq(sources(a), ["Anticipate"],
    "and it is REMOVED, not merely filtered — the stale flag R-57 complained about is gone");
});

// --- 4. LEGACY MIGRATION ----------------------------------------------------------------------

test("edhaNextModList: an array stays, a single object becomes one entry, garbage becomes none", () => {
  eq(env.edhaNextModList([{ source: "A" }, { source: "B" }]).map((m) => m.source), ["A", "B"]);
  eq(env.edhaNextModList({ source: "A" }).map((m) => m.source), ["A"]);
  for (const bad of [undefined, null, "nope", 7, true]) eq(env.edhaNextModList(bad), []);
});

test("item 49: a stored LEGACY single object still applies, and normalises to an array on read", async () => {
  const a = bearer({ source: "Coercive Pressure", mode: "disadvantage", count: 1 });
  assert.strictEqual(env.edhaNextModsOf(a).length, 1, "the old shape reads as a one-entry list");
  await sleep(0);
  assert.ok(Array.isArray(stored(a)), "the first read migrates the document to an array");
  const roll = ROLL();
  await pre(a, roll);
  assert.strictEqual(roll.options.advantageMode, "disadvantage", "and it still does what it did before");
});
