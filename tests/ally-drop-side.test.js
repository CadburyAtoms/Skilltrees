/* REGRESSION — `ally-drops` GM cues fired ACROSS the disposition line when the victim had no token
 * (found bench run 18, 2026-07-28c; root-caused and fixed 2026-07-28d, fix pass C).
 *
 * `edhaGmCueDamageSweep` resolved the dropped creature's side as
 *     const disp = vTok?.document?.disposition;
 * and then filtered with
 *     if (disp !== undefined && (t.document?.disposition ?? null) !== disp) continue;   // same side only
 * `victim.getActiveTokens()` is a CANVAS lookup, so `disp` is `undefined` for an actor in the
 * sidebar, an actor whose token is on another scene, and an actor whose token was deleted a
 * moment earlier — which is exactly what the phantom-double break does (`updateActor` → "the
 * illusion dissipates" → `edhaDeleteActorWithTokens`, racing the applyDamage wrapper that is still
 * running this sweep). The `!== undefined` short-circuit then skipped the SAME-SIDE FILTER
 * ENTIRELY: `undefined` meant "I could not determine the victim's side", and the code read it as
 * "therefore everyone matches".
 *
 * Run 18 measured it with a matched control: breaking a disposition-**0** phantom fired all three
 * of the disposition-**−1** Corvaine "Break" cues, while a normal adversary at disposition 0 with
 * its token still present, dropped the same way, fired **0**. The harm was not only a spurious GM
 * card — `edhaPostCueCard` marks the once-per-round ledger, so it wrote `trigRound` flags onto
 * campaign token actors from a bench action.
 *
 * THE SECOND HALF, same cause, not in the report: the range filter read
 *     if (ft > 0 && vTok && edhaTokenGapFt(t, vTok) > ft) continue;
 * so a victim with no token skipped THAT filter too and a 5-ft cue fired from anywhere on the map.
 * 3 of the 5 shipped `ally-drops` rules carry a rangeFt (Roek 20, Crownox Ring 5, The Reckoning 5).
 *
 * Chosen semantics: an unknown side is a FAILED LOOKUP, never "a creature with no side", so
 *   1. prefer the live token's disposition;
 *   2. fall back to `prototypeToken.disposition` (required + numeric on every Actor; `edhaSummon`
 *      stamps a phantom copy's from the DUPLICATED token, so a copy behaves like what it copies);
 *   3. if even that is missing, fail CLOSED — nobody fires.
 * Range fails closed unconditionally: with no position, "within N ft" cannot be true.
 *
 * These cases pin the CROSS-DISPOSITION outcome specifically. A test that only asserted "the cue
 * fired" passes on the broken code — the bug fired MORE cues, not fewer.
 *
 * Geometry: grid.size 100 px / grid.distance 5 ft → 20 px/ft.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, withStubs, captureChat, readEngineSource, codeOnly } = require("./harness.js");

const GS = 100, DIST = 5, PPF = GS / DIST;   // 20 px/ft

const HOSTILE = -1, NEUTRAL = 0, FRIENDLY = 1;

// A talent-shaped item carrying one `edha-gm-cue` {trigger: "ally-drops"} rule, exactly as the
// five shipped adversary abilities do (data/adversaries.json).
function cueItem(name, rangeFt) {
  const handler = { type: "edha-gm-cue", trigger: "ally-drops", note: `${name} reacts.` };
  if (rangeFt !== undefined) handler.rangeFt = rangeFt;
  return {
    name, type: "talent",
    hasEvents: () => true,
    enabledEvents: [{ event: "edha-apply-watch", handler }],
  };
}

// An actor + its placeable. `side` is the TOKEN disposition; `protoSide` the prototype's.
function makeActor(name, { side = HOSTILE, protoSide = null, items = [], token = true, x = 0, y = 0 } = {}) {
  const actor = mockActor({ name, items });
  actor.prototypeToken = { disposition: protoSide === null ? side : protoSide };
  const tok = token
    ? { actor, document: { disposition: side }, center: { x, y } }
    : null;
  actor.getActiveTokens = () => (tok ? [tok] : []);
  return { actor, tok };
}

/* Stage the scene and run the real sweep. Returns the owner names that got a card, plus every
 * actor that had a `trigRound` ledger written to it (the second, quieter half of the harm).
 * Read the OWNER off the message SPEAKER, never by matching names inside the content: "Ally" is
 * a substring of all three ally names, and the victim's own name rides in the extra text —
 * captureChat's speaker-attributing default is exactly that lesson. */
async function sweepDrop(env, victim, placeables, { round = 1 } = {}) {
  const cards = captureChat(env);
  return withStubs(env, {
    canvas: { scene: { grid: { size: GS, distance: DIST } }, tokens: { placeables, controlled: [] } },
    game: { ...env.game, combat: { round }, users: null },   // oncePerRound is live, so the trigRound writes are real; no connected users → whisper list is []
  }, async () => {
    await env.edhaGmCueDamageSweep(victim, 7, 0, 7);
    const fired = cards.map(c => c.owner);
    const ledgered = placeables.filter(p => p.actor.getFlag("edha-content", "trigRound") !== undefined).map(p => p.actor.name);
    return { cards, fired, ledgered };
  });
}

/* The cast, mirroring run 18's control: a NEUTRAL (disposition 0) victim, one HOSTILE cue owner
 * (the Corvaine shape — no rangeFt), and three same-side owners exercising the range dial. */
function cast() {
  const enemy   = makeActor("Enemy Raider",  { side: HOSTILE, items: [cueItem("Break", undefined)],   x: 0,   y: 0 });
  const allyAny = makeActor("Ally Anywhere", { side: NEUTRAL, items: [cueItem("Fade", undefined)],    x: 500, y: 0 });   // 25 ft away, no range dial
  const allyFar = makeActor("Ally Far",      { side: NEUTRAL, items: [cueItem("Press the Line", 5)],  x: 500, y: 0 });   // 25 ft, 5-ft cue → out
  const allyNear= makeActor("Ally Near",     { side: NEUTRAL, items: [cueItem("Cover Retreat", 5)],   x: 60,  y: 0 });   // 3 ft, 5-ft cue → in
  return { enemy, allyAny, allyFar, allyNear,
    placeables: [enemy.tok, allyAny.tok, allyFar.tok, allyNear.tok] };
}

/* -------------------------------------------------------------------------------------------- */
/* The pure decision                                                                             */
/* -------------------------------------------------------------------------------------------- */

test("edhaAllyDropEligible: an UNKNOWN victim side fires NOBODY (the bug: it used to fire everybody)", () => {
  const env = loadEngine();
  for (const unknown of [null, undefined, NaN, "0"]) {
    assert.strictEqual(env.edhaAllyDropEligible(unknown, HOSTILE, 0, null), false, `victimSide=${String(unknown)} vs hostile`);
    assert.strictEqual(env.edhaAllyDropEligible(unknown, NEUTRAL, 0, null), false, `victimSide=${String(unknown)} vs neutral`);
    assert.strictEqual(env.edhaAllyDropEligible(unknown, FRIENDLY, 0, null), false, `victimSide=${String(unknown)} vs friendly`);
  }
});

test("edhaAllyDropEligible: an unknown OWNER side fires too (a placeable with no disposition)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, undefined, 0, null), false);
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, null, 0, null), false);
});

test("edhaAllyDropEligible: same side passes, every other side is refused — 0 is a real side, not absence", () => {
  const env = loadEngine();
  for (const s of [HOSTILE, NEUTRAL, FRIENDLY]) {
    assert.strictEqual(env.edhaAllyDropEligible(s, s, 0, null), true, `same side ${s}`);
    for (const o of [HOSTILE, NEUTRAL, FRIENDLY].filter(x => x !== s)) {
      assert.strictEqual(env.edhaAllyDropEligible(s, o, 0, null), false, `${s} vs ${o}`);
    }
  }
});

test("edhaAllyDropEligible: rangeFt 0/absent still means the whole scene (an authored dial, not a failed lookup)", () => {
  const env = loadEngine();
  for (const ft of [0, undefined, null, "", NaN]) {
    assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, ft, null), true, `rangeFt=${String(ft)} with no gap`);
    assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, ft, 999), true, `rangeFt=${String(ft)} at 999 ft`);
  }
});

test("edhaAllyDropEligible: a ranged cue with an UNKNOWN gap fails CLOSED (was: fired from anywhere)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, null), false);
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 20, undefined), false);
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, NaN), false);
  // …and the boundary is inclusive, so the fail-closed change did not narrow a real reading.
  // Since R-52 the boundary sits at rangeFt + 2.5 (see the block below).
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, 5), true);
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, 7.5), true);
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, 7.51), false);
});

/* -------------------------------------------------------------------------------------------- */
/* R-52 (c)(i) — the +2.5 ft half-square slack (answered 2026-09-06, item 47)                     */
/* -------------------------------------------------------------------------------------------- */

/* Bench run 19 (2026-07-28e) measured the defect FOUR ways rather than asserting it, and those four
 * gaps are the pin. `edhaTokenGapFt` is centre-to-centre, so an "adjacent" ally is 5.0 ft
 * (Medium orthogonal), 7.07 ft (Medium diagonal) or 7.5 ft (Large 2×2 owner, orthogonal) away, and
 * a 5-ft cue with NO slack reached only the first — plus the absurd case of an ally standing INSIDE
 * a Large owner's own footprint (0 ft), which passed. Both cards promise adjacency works:
 *   "an ADJACENT ox may spend 3 Focus" (Crownox Ring) · "a pack-mate dropped WITHIN 5 ft" (The Reckoning)
 * The engine's `enemy-turn-start` sweep already added `+ 2.5` for exactly this ("half-square slack
 * for adjacency reads"); `ally-drops` did not, so the file disagreed with itself.
 *
 * ⚠ These are the MEASURED gaps from the run, not geometry re-derived here — re-deriving them is
 * how a pin quietly starts testing the test's own arithmetic. Item 62 (edge-to-edge measurement for
 * sized tokens) is the separate, larger answer; slack is not a substitute for it. */
test("R-52: all four bench-run-19 gaps now reach a 5-ft ally-drops cue", () => {
  const env = loadEngine();
  const reach = (gapFt) => env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, gapFt);

  assert.strictEqual(reach(0),    true,  "Crownox Ring (Large 2×2), ally inside the ring's own square — always worked");
  assert.strictEqual(reach(5.0),  true,  "The Reckoning (Medium), orthogonally adjacent — the only one that worked before");
  assert.strictEqual(reach(7.07), true,  "The Reckoning (Medium), DIAGONALLY adjacent — was ❌, the reported miss");
  assert.strictEqual(reach(7.5),  true,  "Crownox Ring (Large 2×2), orthogonally adjacent — was ❌, 'an adjacent ox' was false");
});

test("R-52: the slack is HALF A SQUARE, not a widening — one square out is still out", () => {
  const env = loadEngine();
  // 10 ft is the next square, and the whole risk of this change is a cue that now fires too far.
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, 10), false, "a 5-ft cue does not reach 10 ft");
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, 8), false);
  // Roek's 20-ft cue: unaffected in substance, and its own boundary moves by the same half square.
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 20, 22.5), true);
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 20, 25), false);
  // The slack never rescues an unknown position or a cross-side owner.
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, NEUTRAL, 5, null), false);
  assert.strictEqual(env.edhaAllyDropEligible(NEUTRAL, HOSTILE, 5, 0), false);
});

test("R-52: `ally-drops` and `enemy-turn-start` now read the SAME slack constant", () => {
  // The two reads disagreed for the whole tracked history, which is what made this a ruling rather
  // than a bug report. Source-scoped because the enemy-turn-start gate is an inline expression
  // inside a combat hook: a future edit that re-inlines `+ 2.5` on one side fails here.
  const code = codeOnly(readEngineSource());
  assert.ok(/const EDHA_ADJACENCY_SLACK_FT = 2\.5;/.test(code), "the slack is one named constant");
  const uses = code.match(/EDHA_ADJACENCY_SLACK_FT/g) || [];
  assert.strictEqual(uses.length, 3, "the declaration + both adjacency reads, and no fourth consumer without a ruling");
  assert.ok(!/>\s*ft\s*\+\s*2\.5\b/.test(code), "no hand-inlined 2.5 slack survives beside the constant");
});

/* -------------------------------------------------------------------------------------------- */
/* R-51 — a phantom double's break is not "an ally dropped" (answered 2026-09-06, item 47)        */
/* -------------------------------------------------------------------------------------------- */

/* Fix pass C left this deliberately undone: the CROSS-SIDE defect above was a bug and got fixed,
 * but once a phantom copy resolved to the side of the creature it duplicates, breaking one started
 * cueing THAT side's ally-drops owners ("an ally dropped: the Raider may immediately Disengage and
 * flee") — and whether that should happen at all was a design question the old bug had been hiding.
 * Ben answered (a): NO. A phantom never had a life to lose, its own side are exactly the people who
 * know it was never real, and the fooled ENEMIES are on the other side of the same-side filter. The
 * phantom's break already has its own signal, the `seeming-break` cue kind.
 *
 * BOTH DIRECTIONS: the flag must silence the phantom AND leave a real drop alone — a gate that
 * silenced everything would pass a one-sided suite while deleting a live adversary cue. */
test("R-51: a phantomDouble's break fires NO ally-drops cue", async () => {
  const env = loadEngine();
  const c = cast();
  const victim = makeActor("Phantom of the Raider", { side: NEUTRAL, x: 0, y: 0 });
  await victim.actor.setFlag("edha-content", "phantomDouble", true);

  const { fired, ledgered } = await sweepDrop(env, victim.actor, [...c.placeables, victim.tok]);
  assert.deepStrictEqual(fired, [], "no ally-drops card on any side when the victim is an illusion");
  assert.deepStrictEqual(ledgered, [], "…and no trigRound ledger write either");
});

test("R-51 THE CONTROL: the SAME drop by a real creature still cues its side", async () => {
  const env = loadEngine();
  const c = cast();
  const victim = makeActor("Real Raider", { side: NEUTRAL, x: 0, y: 0 });   // identical, minus the flag

  const { fired } = await sweepDrop(env, victim.actor, [...c.placeables, victim.tok]);
  assert.deepStrictEqual(fired.sort(), ["Ally Anywhere", "Ally Near"],
    "the gate keys on the flag, not on the drop");
});

test("R-51: the phantom's OWN damaged cue is untouched — only ally-drops is silenced", async () => {
  const env = loadEngine();
  const c = cast();
  const own = cueItem("Flicker", undefined);
  own.enabledEvents[0].handler.trigger = "damaged";
  const victim = makeActor("Phantom with its own cue", { side: NEUTRAL, x: 0, y: 0, items: [own] });
  await victim.actor.setFlag("edha-content", "phantomDouble", true);

  const { fired } = await sweepDrop(env, victim.actor, [...c.placeables, victim.tok]);
  assert.deepStrictEqual(fired, ["Phantom with its own cue"],
    "a copy of a creature that carries a `damaged` cue still carries it; R-51 narrows ally-drops only");
});

/* -------------------------------------------------------------------------------------------- */
/* The side resolver                                                                             */
/* -------------------------------------------------------------------------------------------- */

test("edhaActorSide: the live token wins, and 0 (NEUTRAL) survives the fallback chain", () => {
  const env = loadEngine();
  const { actor } = makeActor("Neutral", { side: NEUTRAL, protoSide: HOSTILE });
  assert.strictEqual(env.edhaActorSide(actor), NEUTRAL, "a placed token overrides its own prototype");
});

test("edhaActorSide: with no token it falls back to the prototype — a phantom reads as what it copies", () => {
  const env = loadEngine();
  // edhaSummon stamps prototypeToken.disposition from the DUPLICATED token, so the copy of a
  // neutral creature is neutral even after its own token is deleted by the break handler.
  const { actor } = makeActor("Phantom of a neutral", { side: NEUTRAL, token: false });
  assert.strictEqual(env.edhaActorSide(actor), NEUTRAL);
  const { actor: hostileCopy } = makeActor("Phantom of a hostile", { side: HOSTILE, token: false });
  assert.strictEqual(env.edhaActorSide(hostileCopy), HOSTILE);
});

test("edhaActorSide: no token and no usable prototype → null (fail closed), never a guessed default", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaActorSide({ getActiveTokens: () => [], prototypeToken: {} }), null);
  assert.strictEqual(env.edhaActorSide({ getActiveTokens: () => [] }), null);
  assert.strictEqual(env.edhaActorSide(null), null);
  assert.strictEqual(env.edhaActorSide(undefined), null);
});

/* -------------------------------------------------------------------------------------------- */
/* The real sweep — the end-to-end pins                                                          */
/* -------------------------------------------------------------------------------------------- */

test("POSITIVE CONTROL — victim WITH a token: same-side cues fire, the hostile one does not", async () => {
  const env = loadEngine();
  const c = cast();
  const victim = makeActor("Victim", { side: NEUTRAL, x: 0, y: 0 });
  const { fired } = await sweepDrop(env, victim.actor, [...c.placeables, victim.tok]);
  assert.deepStrictEqual(fired.sort(), ["Ally Anywhere", "Ally Near"],
    "unranged same-side cue + the in-range 5-ft cue; the 25-ft one and the hostile one stay silent");
});

test("THE BUG — victim with NO token: the hostile cue must NOT fire (it fired all of them)", async () => {
  const env = loadEngine();
  const c = cast();
  // The phantom-break shape: the actor still exists, its token is already gone, and its prototype
  // says NEUTRAL because that is the side of the creature it was a copy of.
  const victim = makeActor("Broken Illusion", { side: NEUTRAL, token: false });
  const { fired, cards, ledgered } = await sweepDrop(env, victim.actor, c.placeables);
  assert.ok(!fired.includes("Enemy Raider"),
    "a disposition -1 owner must never be cued by a disposition 0 drop — this is the whole defect");
  assert.ok(!cards.some(x => x.content.includes("Break")), "no Break card at all, not merely a different label");
  assert.ok(!ledgered.includes("Enemy Raider"),
    "and no trigRound ledger write either — the stray writes onto campaign actors were the real harm");
});

test("…and the legitimate same-side cue is NOT silenced by the fix (the prototype resolved the side)", async () => {
  const env = loadEngine();
  const c = cast();
  const victim = makeActor("Broken Illusion", { side: NEUTRAL, token: false });
  const { fired } = await sweepDrop(env, victim.actor, c.placeables);
  assert.ok(fired.includes("Ally Anywhere"),
    "failing CLOSED on the SIDE would have been the easy fix and would have cost a real cue");
  assert.deepStrictEqual(fired.sort(), ["Ally Anywhere"],
    "…while both RANGED cues stay silent: with no token there is no position, so 'within 5 ft' cannot be true");
});

test("no token AND no prototype side → nobody fires at all (the last resort really is closed)", async () => {
  const env = loadEngine();
  const c = cast();
  const victim = { name: "Sideless", items: [], getActiveTokens: () => [], prototypeToken: {} };
  const { fired, cards } = await sweepDrop(env, victim, c.placeables);
  assert.deepStrictEqual(fired, [], `expected silence, got: ${JSON.stringify(cards)}`);
});

test("a victim on the OTHER side: only its own side is cued, both with and without a token", async () => {
  const env = loadEngine();
  for (const withToken of [true, false]) {
    const c = cast();
    const victim = makeActor("Hostile Victim", { side: HOSTILE, token: withToken, x: 0, y: 0 });
    const placeables = withToken ? [...c.placeables, victim.tok] : c.placeables;
    const { fired } = await sweepDrop(env, victim.actor, placeables);
    assert.deepStrictEqual(fired, ["Enemy Raider"],
      `a hostile drop cues the hostile owner only (token present: ${withToken})`);
  }
});
