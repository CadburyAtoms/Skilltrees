/* Range checks must measure on FOUNDRY'S RULER, not on Euclidean hypot.
 *
 * Bench run 44 (2026-09-09, Palewater Ford) measured the failure live: Ordered Advance's 10 ft
 * move window excluded two raiders standing at a ruler-measured 10 ft, because every range check
 * in the engine computed its own `Math.hypot(dx, dy) / gridSize * gridDistance`. On Ben's world
 * (`gridDiagonals: 0`, Equidistant) those two tokens measured 11.18 ft and 14.14 ft to hypot, so
 * the card read "no allies were within 10 ft" while the ruler in the same scene read 10.
 *
 * Ben's ruling (2026-09-09): "Engine range checks need to agree to Foundry's ruler. Honestly,
 * range checks should just use the Foundry Ruler."
 *
 * These pin: (a) edhaMeasureFt delegates to canvas.grid.measurePath when it exists — which IS the
 * ruler, so it inherits the scene's grid type and the world's diagonal rule for free; (b) the
 * pure-Euclidean answer is NOT what a diagonal returns any more; (c) the no-canvas fallback still
 * works headlessly. The diagonal case is the whole point — orthogonal distances agree under both
 * metrics, so an orthogonal-only test would have passed against the broken code.
 */
"use strict";
const assert = require("assert");
const { loadEngine, stageWorld } = require("./harness.js");

const env = loadEngine();
const GS = 300, GD = 5;   // Playtest Map / Palewater Ford: 300 px per 5 ft square

// A stand-in for Foundry's square-grid ruler under the Equidistant diagonal rule
// (gridDiagonals: 0): a diagonal step costs the same as an orthogonal one.
function equidistantRuler(pts) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = Math.abs(pts[i].x - pts[i - 1].x) / GS, dy = Math.abs(pts[i].y - pts[i - 1].y) / GS;
    total += Math.max(dx, dy) * GD;
  }
  return { distance: total };
}

function withRuler(fn) {
  const staged = stageWorld(env, { grid: { size: GS, distance: GD, measurePath: equidistantRuler } });
  try { return fn(); } finally { staged.undo(); }
}

test("edhaMeasureFt uses the ruler: a pure diagonal is 10 ft, not hypot's 14.14", () => {
  withRuler(() => {
    // two squares diagonally: the ruler says 10 ft, Euclidean says 5 * sqrt(8) = 14.14
    const ft = env.edhaMeasureFt(0, 0, 2 * GS, 2 * GS);
    assert.strictEqual(ft, 10);
    assert.notStrictEqual(Math.round(ft * 100) / 100, 14.14);
  });
});

test("edhaMeasureFt uses the ruler: the run-44 knight's-move reads 10 ft, not 11.18", () => {
  withRuler(() => {
    // Line-Caller (15,14) -> Raider A (17,13): dx 2, dy 1. Ruler 10 ft; hypot 11.18 ft.
    const ft = env.edhaMeasureFt(15 * GS, 14 * GS, 17 * GS, 13 * GS);
    assert.strictEqual(ft, 10);
    assert.ok(ft <= 10, "must fall INSIDE a 10 ft window — this is the run-44 regression");
  });
});

test("edhaMeasureFt agrees with hypot on orthogonal distances (both metrics coincide)", () => {
  withRuler(() => {
    assert.strictEqual(env.edhaMeasureFt(0, 0, 4 * GS, 0), 20);
    assert.strictEqual(env.edhaMeasureFt(0, 0, 0, 3 * GS), 15);
  });
});

test("edhaTokenGapFt / edhaPointGapFt route through the ruler too", () => {
  withRuler(() => {
    const a = { center: { x: 15 * GS, y: 14 * GS } }, b = { center: { x: 17 * GS, y: 13 * GS } };
    assert.strictEqual(env.edhaTokenGapFt(a, b), 10);
    assert.strictEqual(env.edhaPointGapFt({ x: 15 * GS, y: 14 * GS }, b), 10);
  });
});

test("edhaMeasureFt falls back to Euclidean feet when there is no canvas grid", () => {
  const staged = stageWorld(env, { grid: null });
  try {
    // no measurePath -> hypot / gridSize * gridDistance, with the harness's default 100px/5ft
    assert.strictEqual(env.edhaMeasureFt(0, 0, 300, 400), 25);
  } finally { staged.undo(); }
});

test("edhaMeasureFt survives a ruler that throws or returns a non-number", () => {
  for (const bad of [() => { throw new Error("boom"); }, () => ({ distance: NaN }), () => ({})]) {
    const staged = stageWorld(env, { grid: { size: GS, distance: GD, measurePath: bad } });
    try {
      const ft = env.edhaMeasureFt(0, 0, 2 * GS, 2 * GS);
      assert.ok(Number.isFinite(ft), "must fall back to a finite Euclidean answer");
    } finally { staged.undo(); }
  }
});
