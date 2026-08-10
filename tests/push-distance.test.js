/* REGRESSION — "Shockwave Slam pushes 0 ft" (bench run 17, root-caused 2026-07-28).
 *
 * Run 17 filed this as a regression against run 12, which had driven the SAME rule to a correct
 * 10 ft five days earlier. It is not one: `edhaRunPush`, `edhaApplyMove`, `edhaComputeMove`,
 * `edhaTokenAtDest`, `edhaPxPerFt`, `edhaColorRank` and `edhaCasterToken` are all byte-identical
 * between the two runs (verified by diff over 038ebf9..2bc33ef; the only edit in that whole region
 * was `edhaSpeedFt`, which the push path never calls — it reads `bySize`/`distanceFt`, never
 * `byHalfSpeed`).
 *
 * What differed was the NUMBER. Run 12 pushed at red rank 3 -> 10 ft -> two grid squares. Run 17
 * pushed at red rank 2 -> 5 ft -> exactly ONE. And `edhaTokenAtDest` is a bounding-box overlap, so
 * the step-back loop's whole-square step has no intermediate stop for a one-square push: it either
 * travels the full square or returns to the origin. A two-square push degrades to 5 ft and looks
 * fine; a one-square push collapses to 0 and looks broken. Same code, different geometry.
 *
 * So 0 ft can be the CORRECT answer (a body is in the way and there is nowhere to go). The defect
 * was that the engine could not say so: a blocked push, a walled push and a directionless push all
 * posted the identical bare "pushed 0 ft", which is why run 17 could not root-cause it at the
 * table and had to hand it on. These cases pin the DISTANCE (not merely that a push occurred) and
 * the reason attached to it.
 *
 * Geometry throughout is the Playtest Map's: grid.size 300 px / grid.distance 5 ft -> 60 px/ft,
 * the scale run 17 measured (Unstoppable moved 1200 px = 20 ft).
 */
"use strict";
const assert = require("assert");
const { loadEngine, withStubs } = require("./harness.js");

/* A lazy, file-shared engine context: every test stages its own canvas/CONFIG via withStubs and
 * restores it afterward, so one engine load safely serves the whole file — deferred to the first
 * test that actually runs rather than paid at require() time. */
let _env = null;
function getEnv() { return _env || (_env = loadEngine()); }

const GS = 300, DIST = 5, PPF = GS / DIST;   // 60 px/ft

// The scene/CONFIG shape edhaComputeMove needs, as a withStubs patch (auto-restored after the test).
function canvasPatch(env, placeables, testCollision = null) {
  return {
    canvas: { scene: { grid: { size: GS, distance: DIST } }, tokens: { placeables, controlled: [] } },
    CONFIG: { ...env.CONFIG, Canvas: { polygonBackends: { move: { testCollision: testCollision || (() => null) } } } },
  };
}
const tok = (id, cx, cy, w = GS) => ({
  id, w, h: w, center: { x: cx, y: cy },
  actor: { name: id }, document: { id, hidden: false },
});

/* The push aim exactly as edhaRunPush builds it: maxFt feet directly away from the anchor. */
function pushFrom(env, victim, anchor, maxFt) {
  const dx = victim.center.x - anchor.center.x, dy = victim.center.y - anchor.center.y;
  const len = Math.hypot(dx, dy);
  const aim = { x: victim.center.x + (dx / len) * (maxFt * PPF), y: victim.center.y + (dy / len) * (maxFt * PPF) };
  return env.edhaComputeMove(victim.center, aim, maxFt, victim);
}

const SLAGBULL = tok("Slagbull", 0, 0, 2 * GS);          // Large 2x2 attacker

// --- the POSITIVE control: a clear lane moves the whole distance --------------------------------
test("push: a clear 5-ft lane moves exactly 5 ft (the run-17 dial, unobstructed)", () => {
  const env = getEnv();
  const v = tok("victim", 450, 0);
  return withStubs(env, canvasPatch(env, [v, SLAGBULL]), () => {
    const r = pushFrom(env, v, SLAGBULL, 5);
    assert.strictEqual(Math.round(r.movedFt), 5, "a clear 5-ft push must travel 5 ft");
    assert.strictEqual(r.collided, false);
    assert.strictEqual(r.blockedBy, null, "nothing blocked it, so no reason may be reported");
  });
});

test("push: run 12's dial still moves its full 10 ft on a clear lane", () => {
  const env = getEnv();
  const v = tok("victim", 450, 0);
  return withStubs(env, canvasPatch(env, [v, SLAGBULL]), () => {
    const r = pushFrom(env, v, SLAGBULL, 10);
    assert.strictEqual(Math.round(r.movedFt), 10);
    assert.strictEqual(r.blockedBy, null);
  });
});

// --- the reported case: one square, destination occupied ---------------------------------------
test("push: a 1-square push into an occupied square is 0 ft AND names the occupier", () => {
  const env = getEnv();
  const v = tok("victim", 450, 0);
  return withStubs(env, canvasPatch(env, [v, SLAGBULL, tok("Cinderbrock", 750, 0)]), () => {   // sits exactly on the destination
    const r = pushFrom(env, v, SLAGBULL, 5);
    assert.strictEqual(Math.round(r.movedFt), 0, "there is no intermediate square, so 0 ft is correct");
    assert.strictEqual(r.blockedBy, "token", "the card must be able to say a BODY stopped it");
    assert.strictEqual(r.blocker, "Cinderbrock", "and must name it");
  });
});

/* The asymmetry that made run 17 look like a regression against run 12: identical obstruction,
 * different dial. Two squares degrade visibly; one square collapses to nothing. */
test("push: the SAME obstruction at run 12's 10-ft dial degrades to 5 ft, not to 0", () => {
  const env = getEnv();
  const v = tok("victim", 450, 0);
  return withStubs(env, canvasPatch(env, [v, SLAGBULL, tok("Cinderbrock", 1050, 0)]), () => {   // occupies the far square
    const r = pushFrom(env, v, SLAGBULL, 10);
    assert.strictEqual(Math.round(r.movedFt), 5, "a 2-square push steps back one square and still moves");
    assert.strictEqual(r.blockedBy, "token");
  });
});

test("push: a token one square BEYOND the destination does not block it", () => {
  const env = getEnv();
  const v = tok("victim", 450, 0);
  return withStubs(env, canvasPatch(env, [v, SLAGBULL, tok("bystander", 1050, 0)]), () => {
    const r = pushFrom(env, v, SLAGBULL, 5);
    assert.strictEqual(Math.round(r.movedFt), 5);
    assert.strictEqual(r.blockedBy, null);
  });
});

// --- walls report as walls, not as bodies ------------------------------------------------------
test("push: a wall in the lane stops the push and reports 'wall'", () => {
  const env = getEnv();
  const v = tok("victim", 450, 0);
  return withStubs(env, canvasPatch(env, [v, SLAGBULL], () => ({ x: 600, y: 0 })), () => {   // wall 150 px = 2.5 ft out
    const r = pushFrom(env, v, SLAGBULL, 5);
    assert.strictEqual(r.movedFt, 2.5, "the push stops at the wall, not short of it or past it");
    assert.strictEqual(r.collided, true);
    assert.strictEqual(r.blockedBy, "wall");
  });
});

// --- the silent-zero branch: stacked tokens have no direction -----------------------------------
test("push: a victim stacked on the anchor yields blockedBy 'direction', not a bare 0", () => {
  const env = getEnv();
  const v = tok("victim", 0, 0);
  return withStubs(env, canvasPatch(env, [v, SLAGBULL]), () => {
    // aim collapses onto the origin — edhaRunPush refuses out loud before reaching here, but the
    // primitive must still classify it rather than returning an unexplained zero.
    const r = env.edhaComputeMove(v.center, { ...v.center }, 5, v);
    assert.strictEqual(r.movedFt, 0);
    assert.strictEqual(r.blockedBy, "direction");
  });
});

// --- the phrasing every mover shares -----------------------------------------------------------
test("edhaBlockedText phrases each blocker, and says nothing when nothing blocked", () => {
  const env = getEnv();
  assert.strictEqual(env.edhaBlockedText(null, ""), "");
  assert.strictEqual(env.edhaBlockedText("wall", ""), " (stopped by a wall)");
  assert.strictEqual(env.edhaBlockedText("token", "Cinderbrock"), " (stopped by Cinderbrock)");
  assert.strictEqual(env.edhaBlockedText("token", ""), " (stopped by another creature)");
  assert.strictEqual(env.edhaBlockedText("direction", ""), " (no direction to move)");
});
