/* THE INVESTITURE-MAX PERSIST, PINNED TO R-77 — fix pass 6 (2026-09-06), from bench run 36.
 *
 * `edhaDeriveInvestiture` writes `system.resources.inv.max.override` to the actor's SOURCE so the
 * system's own prepare stops clamping current Investiture to 0 (the 2026-06-11 gotcha). That write
 * is a WORLD WRITE, and it was the one world-writing site item 12's one-applier consolidation did
 * not reach: it gated on `actor.isOwner` plus a PER-CLIENT `_edhaInvPersisted` Set, so with two GM
 * clients connected the writer was whichever client prepared the actor first. Bench run 36 measured
 * it in BOTH directions — Ben's non-primary `Gamemaster` wrote `override: 6` on `Bench — Red` while
 * the primary `Bench` wrote `override: 5` on `Bench — Blue`, inside one window.
 *
 * The fix is NOT `edhaDefBuffGmGate()` outright, and that is the whole point of R-77. The owner gate
 * exists so a player-owned PC can persist its own max on a table where no GM is online; the blunt
 * gate would silently stop doing that whenever the primary GM had not looked at the actor. So the
 * rule is: a GM defers to the PRIMARY GM, and a non-GM owner still writes.
 *
 * Mutation-sensitive both ways. Drop the new `mayPersist` term and case 2 fails (a second GM
 * writes). Replace it with `edhaDefBuffGmGate()` and case 4 fails (the GM-less player-owned PC
 * stops persisting, which is the regression R-77 exists to refuse).
 *
 * Harness note: `_edhaInvPersisted` is a module-scoped `const`, so it is NOT reachable from the vm
 * context and never resets. Every case therefore uses a FRESH actor id — the Set is keyed by actor
 * id, so distinct ids keep the cases independent inside one engine load.
 */
"use strict";
const assert = require("assert");
const { loadEngine, stageWorld, mockActor, sleep } = require("./harness.js");

/* The four client shapes a two-GM table produces, same staging vocabulary as gm-gate.test.js. */
const PRIMARY_GM = { user: { id: "gm-1", isGM: true }, users: { activeGM: { id: "gm-1", isSelf: true } } };
const SECOND_GM = { user: { id: "gm-2", isGM: true }, users: { activeGM: { id: "gm-1", isSelf: false } } };
const PLAYER_WITH_GM = { user: { id: "p-1", isGM: false }, users: { activeGM: { id: "gm-1", isSelf: false } } };
const PLAYER_NO_GM = { user: { id: "p-1", isGM: false }, users: { activeGM: null } };

/* A character whose Investiture max is NOT yet persisted to source: awa 3 / pre 1 → derived 5,
 * source override absent, so the persist branch wants to fire. `isOwner` is the caller's choice —
 * that is the other half of the gate. */
function invActor(id, { isOwner = true, awa = 3, pre = 1 } = {}) {
  const actor = mockActor({
    id, name: id, type: "character",
    system: { attributes: { awa: { value: awa }, pre: { value: pre } }, resources: { inv: { value: 0, max: { value: 0 } } } },
  });
  actor.isOwner = isOwner;
  actor._source = { system: { resources: { inv: { max: { useOverride: false, override: 0 } } } } };
  return actor;
}

/* Run the derivation on one client shape and report what it asked the database for.
 * The persist is dispatched through `setTimeout(…, 0)`, so settle a macrotask before reading. */
async function persistedBy(env, stage, actor) {
  const world = stageWorld(env, stage);
  try {
    env.game.ready = true;
    env.edhaDeriveInvestiture(actor);
    await sleep(1);
    return actor.updates.filter((u) => "system.resources.inv.max.override" in u);
  } finally { world.undo(); }
}

test("R-77: exactly one GM persists the Investiture max — the primary one", async () => {
  const env = loadEngine();

  const primary = invActor("inv-primary");
  assert.strictEqual((await persistedBy(env, PRIMARY_GM, primary)).length, 1,
    "the PRIMARY GM must still persist — it is the single applier");
  assert.strictEqual(primary.updates[0]["system.resources.inv.max.override"], 5,
    "and it persists the derived value, 2 + max(awa, pre)");

  const second = invActor("inv-second");
  assert.strictEqual((await persistedBy(env, SECOND_GM, second)).length, 0,
    "a SECOND GM client must stand down — this is bench run 36's measured double-write");
});

test("R-77: a non-GM owner still persists, with a GM online or none at all", async () => {
  const env = loadEngine();

  const gmless = invActor("inv-gmless-owner");
  assert.strictEqual((await persistedBy(env, PLAYER_NO_GM, gmless)).length, 1,
    "a player-owned PC on a GM-less table MUST persist — the reason the owner gate exists (R-77)");

  const withGm = invActor("inv-player-owner");
  assert.strictEqual((await persistedBy(env, PLAYER_WITH_GM, withGm)).length, 1,
    "and R-77 keeps today's behaviour for a non-GM owner even while a GM is online");
});

test("the owner half of the gate is unchanged — a non-owner never persists", async () => {
  const env = loadEngine();
  const stranger = invActor("inv-not-owner", { isOwner: false });
  assert.strictEqual((await persistedBy(env, PRIMARY_GM, stranger)).length, 0,
    "isOwner still gates the write; R-77 narrows the GM case, it does not widen anything");
});

test("the derived value itself is untouched by the gate — every client still SHOWS the right max", async () => {
  const env = loadEngine();
  const actor = invActor("inv-derive-only");
  const world = stageWorld(env, SECOND_GM);
  try {
    env.game.ready = true;
    env.edhaDeriveInvestiture(actor);
    await sleep(1);
    assert.strictEqual(actor.system.resources.inv.max.value, 5,
      "the second GM must still DERIVE 5 for display — R-77 gates the world write, not the derivation");
    assert.strictEqual(actor.updates.length, 0, "…while writing nothing");
  } finally { world.undo(); }
});
