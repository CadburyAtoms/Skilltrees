/* tests/bench-arena.test.js — pins `benchArenaSpec` and `benchArenaPlan` in
 * scripts/bench-setup-console.js (TODO_REPO_HYGIENE #128 / PM-R19, 2026-09-13).
 *
 * WHY. Ben's phone-board grant ("I also need to give permission to create new scenes
 * specifically for future test bench runs") lets the bench find-or-create a standing "Bench
 * Arena" scene instead of only ever using the existing "Playtest Map". The two decisions that
 * matter are pure and headless-testable without Foundry:
 *   - benchArenaSpec: the Scene.create() data always names the scene "Bench Arena" and sizes
 *     its footprint to fit the roster (a column of PCs plus the fixed target/ally cluster and
 *     the far-out Isolated dummy) — including when the roster grows past today's 16 PCs.
 *   - benchArenaPlan: idempotency — a scene already named "Bench Arena" is REUSED, never
 *     duplicated; only its absence plans a create.
 * These are the same two guarantees the checklist's 128-1 row proves live: created once, found
 * on the second run, sized to actually hold the placement layout in the console block below.
 */
"use strict";
const assert = require("assert");
const path = require("path");
const { benchArenaSpec, benchArenaPlan, BENCH_ARENA_NAME } = require(
  path.join(__dirname, "..", "scripts", "bench-setup-console.js")
);

test("BENCH_ARENA_NAME is the standing scene's name, and the spec uses it", () => {
  assert.strictEqual(BENCH_ARENA_NAME, "Bench Arena");
  assert.strictEqual(benchArenaSpec({ pcCount: 16 }).name, BENCH_ARENA_NAME);
});

test("benchArenaSpec: a plain background colour and a 100px/5ft square grid", () => {
  const spec = benchArenaSpec({ pcCount: 16 });
  assert.strictEqual(typeof spec.backgroundColor, "string");
  assert.ok(/^#[0-9a-f]{6}$/i.test(spec.backgroundColor), "backgroundColor must be a hex colour");
  assert.deepStrictEqual(spec.grid, { type: 1, size: 100, distance: 5, units: "ft" });
});

test("benchArenaSpec: the footprint fits the fixed target/ally cluster and the Isolated dummy even at pcCount=0", () => {
  // Mirrors the console block's own SPOTS: Isolated sits at cx=24; the ally/target cluster tops
  // out at cy=9. Even an empty roster must still fit those fixed fixtures.
  const spec = benchArenaSpec({ pcCount: 0 });
  const origin = { x: 200, y: 200 };
  const g = 100;
  assert.ok(spec.width > origin.x + g * 24, "width must clear the Isolated dummy's column (cx=24)");
  assert.ok(spec.height > origin.y + g * 9, "height must clear the target/ally cluster's row (cy=9)");
});

test("benchArenaSpec: the footprint grows with the roster so a bigger PC column still fits", () => {
  const small = benchArenaSpec({ pcCount: 4 });
  const big = benchArenaSpec({ pcCount: 40 });
  assert.ok(big.height > small.height, "a taller PC column must widen the scene's height");
  assert.strictEqual(small.width, big.width, "pcCount only affects the column's height, not width");
  // The PC column itself (cy = pcCount - 1) must fit under the computed height.
  const origin = { x: 200, y: 200 };
  assert.ok(big.height > origin.y + 100 * 39, "the 40th PC's row (cy=39) must be inside the scene");
});

test("benchArenaPlan: no existing 'Bench Arena' scene plans a create with a matching spec", () => {
  const plan = benchArenaPlan([{ id: "s1", name: "Playtest Map" }], { pcCount: 16 });
  assert.strictEqual(plan.action, "create");
  assert.strictEqual(plan.spec.name, BENCH_ARENA_NAME);
});

test("benchArenaPlan: an existing 'Bench Arena' scene is found, never re-created (idempotency)", () => {
  const plan = benchArenaPlan(
    [{ id: "s1", name: "Playtest Map" }, { id: "s2", name: "Bench Arena" }],
    { pcCount: 16 }
  );
  assert.deepStrictEqual(plan, { action: "found", id: "s2" });
});

test("benchArenaPlan: an empty scene list plans a create, never throws", () => {
  const plan = benchArenaPlan([], { pcCount: 16 });
  assert.strictEqual(plan.action, "create");
});

test("benchArenaPlan: a scene list of undefined plans a create, never throws (defensive)", () => {
  const plan = benchArenaPlan(undefined, { pcCount: 16 });
  assert.strictEqual(plan.action, "create");
});
