/* item 164 (fix pass 13, 2026-09-15) — an even-sized terrain square is centred on the grid VERTEX nearest
 * the click; an odd-sized one on the nearest cell centre.
 *
 * Bench run 48 (YARD-3): Green Draw Mana's "Click where the 10 ft difficult-terrain square grows" was
 * answered between two PC tokens and the 2×2 Region landed at (1400, 1100) — one cell right and one
 * down of a square centred there, under no PC.
 *
 * THE SNAP RULE, read from Foundry's own code (C:\Program Files\Foundry Virtual Tabletop\resources\app,
 * read-only): `edhaPickPoint` snapped every click with `GRID_SNAPPING_MODES.CENTER` (0x1, common/
 * constants.mjs) at resolution 1, and `SquareGrid#getSnappedPoint` (common/grid/square.mjs) routes that
 * to `#snapToCenter`: `round((x - s/2) / s) * s + s/2` — the centre of the cell the click is in. The
 * click's position INSIDE that cell is gone before `edhaSnapCellRect(scene, x, y, 2)` sees it, and a
 * 2-cell square cannot be centred on a cell centre: `round((x - 100) / 100)` meets an exact .5 there and
 * `Math.round` breaks the tie upward. So under the old picker an even square ALWAYS had the clicked cell
 * at its top-left, whatever the click; a click on the edge or vertex between two tokens snapped into the
 * lower/right token's cell and the square grew away from the other token.
 *
 * (Bench run 48's two recorded click coordinates cannot both be reproduced from this arithmetic — a
 * click at world (1348, 1100) gives (1300, 1100), not the measured (1400, 1100); a click AT the vertex
 * (1400, 1100) gives exactly the measured rect. Bench run 49a later found that a coordinate click sends
 * no pointer-move, so `canvas.mousePosition` can be stale; the 🤖 row re-measures with a hover first.
 * The defect below does not depend on either coordinate.)
 *
 * The fix: `edhaSnapModeForCells(cells)` — VERTEX (0xF0, `#snapToVertex`) for an even footprint, CENTER
 * for an odd one — and `edhaPickPoint(prompt, {cells})`. `edhaSnapCellRect` was already right when fed
 * a point of the matching kind. The three square-laying pickers pass their footprint: Green terrain's
 * `edha-zone` placement, Lay Foundation's 10 ft square, and a Green terrain burst (Sudden Growth and its
 * adversary copies). Every other picker (5 ft markers, Charges, directions, links) stays CENTER.
 *
 * The grid stub below is Foundry's `#snapToCenter` / `#snapToVertex` arithmetic, line for line.
 *
 * Reversion: make `edhaSnapModeForCells` always return CENTER and the vertex and shared-edge cases fail
 * — the vertex case with the bench's own (1400, 1100).
 */
"use strict";
const assert = require("assert");
const { loadEngine, stageWorld, readEngineSource, codeOnly } = require("./harness.js");

const CENTER = 0x1, VERTEX = 0xF0;
function foundrySquareGrid(size = 100) {
  return {
    size,
    getSnappedPoint({ x, y }, { mode, resolution = 1 }) {
      const s = size / resolution, t = size / 2;
      if (mode === CENTER) return { x: (Math.round((x - t) / s) * s) + t, y: (Math.round((y - t) / s) * s) + t };                // square.mjs #snapToCenter
      if (mode === VERTEX) return { x: ((Math.floor((x - t) / s) + 0.5) * s) + t, y: ((Math.floor((y - t) / s) + 0.5) * s) + t };  // square.mjs #snapToVertex
      throw new Error(`snapping mode ${mode} is not modelled by this stub`);
    },
  };
}
const SCENE = { grid: { size: 100, distance: 5 } };
function cellsCovered(r) {
  const out = [];
  for (let cx = r.x; cx < r.x + r.w; cx += 100) for (let cy = r.y; cy < r.y + r.h; cy += 100) out.push(`${cx / 100},${cy / 100}`);
  return out.sort();
}
function place(env, click, cells) {
  const world = stageWorld(env, { grid: foundrySquareGrid(100) });
  try {
    const p = env.edhaSnapPoint(click, cells);
    return env.edhaSnapCellRect(SCENE, p.x, p.y, cells);
  } finally { world.undo(); }
}

test("edhaSnapModeForCells: VERTEX for an even footprint, CENTER for an odd one (and for nonsense)", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaSnapModeForCells(1), CENTER);
  assert.strictEqual(env.edhaSnapModeForCells(2), VERTEX);
  assert.strictEqual(env.edhaSnapModeForCells(3), CENTER);
  assert.strictEqual(env.edhaSnapModeForCells(4), VERTEX);
  assert.strictEqual(env.edhaSnapModeForCells(undefined), CENTER);
  assert.strictEqual(env.edhaSnapModeForCells("x"), CENTER);
});

test("item 164 — a click AT a grid vertex covers the four cells around it (the old picker gave the bench's (1400, 1100))", () => {
  const env = loadEngine();
  const r = place(env, { x: 1400, y: 1100 }, 2);
  assert.deepStrictEqual({ x: r.x, y: r.y, w: r.w }, { x: 1300, y: 1000, w: 200 });
  assert.deepStrictEqual(cellsCovered(r), ["13,10", "13,11", "14,10", "14,11"]);
});

test("item 164 — a click between two adjacent tokens covers BOTH (stacked, and side by side)", () => {
  const env = loadEngine();
  // stacked: tokens in cells (13,10) and (13,11); the click lands on their shared horizontal edge
  const stacked = cellsCovered(place(env, { x: 1348, y: 1100 }, 2));
  for (const cell of ["13,10", "13,11"]) assert.ok(stacked.includes(cell), `stacked tokens: ${cell} not covered by [${stacked}]`);
  // side by side: tokens in cells (13,11) and (14,11); the click lands on their shared vertical edge
  const sideBySide = cellsCovered(place(env, { x: 1400, y: 1150 }, 2));
  for (const cell of ["13,11", "14,11"]) assert.ok(sideBySide.includes(cell), `side-by-side tokens: ${cell} not covered by [${sideBySide}]`);
});

test("item 164 — odd sizes are unchanged: a 5 ft square covers the clicked cell, a 15 ft square is centred on it", () => {
  const env = loadEngine();
  assert.deepStrictEqual(cellsCovered(place(env, { x: 1348, y: 1130 }, 1)), ["13,11"]);
  const r3 = place(env, { x: 1310, y: 1190 }, 3);
  assert.deepStrictEqual({ x: r3.x, y: r3.y, w: r3.w }, { x: 1200, y: 1000, w: 300 }, "a 3×3 square centred on cell (13,11)");
});

test("item 164 — the three square-laying pickers pass their footprint; the rest keep the centre snap", () => {
  const code = codeOnly(readEngineSource());
  assert.ok(/const pt = await edhaPickPoint\(`Click where the \$\{sizeFt\} ft difficult-terrain square grows[^`]*`, \{ cells \}\)/.test(code),
    "the Green terrain (edha-zone) picker no longer passes its footprint");
  assert.ok(/const pt = await edhaPickPoint\(`Click the center of the \$\{sqFt\} ft Foundation square[^`]*`, \{ cells \}\)/.test(code),
    "the Lay Foundation picker no longer passes its footprint");
  assert.ok(/const pt = await edhaPickPoint\(`Click the \$\{item\.name\} burst center[^`]*`, \{ cells: burstCells \}\)/.test(code),
    "the burst picker no longer passes the Green terrain footprint");
  assert.strictEqual((code.match(/edhaSnapPoint\(/g) || []).length, 2, "one definition and one caller (the picker's snap) — no hand-rolled snaps");
});
