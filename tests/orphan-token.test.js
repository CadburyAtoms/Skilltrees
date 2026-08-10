/* REGRESSION — the orphaned summon token (bench run 13, reproduced 3x; fixed 2026-07-27q).
 *
 * Deleting a summon/phantom ACTOR left its TOKEN standing on the scene. Foundry never cascades
 * actor -> token: neither the client `Actor` class nor `dist/database/documents/actor.mjs` has any
 * dependent-token delete, so `actor.delete()` alone orphans the placeable. The engine already knew
 * this — the Illusion section learned it at bench 07-17 and its comment says so — but three OTHER
 * sites had each open-coded the wrong half (the illusion "dissipates" branch, the barrier
 * "destroyed" branch, and the scene-end barrier sweep), one of them carrying a comment that
 * asserted the opposite.
 *
 * The tail is what made it worth a primitive rather than three patches: Foundry DOES cascade
 * token -> combatant (`TokenDocument._onDeleteOperation` deletes combatants whose tokenId went
 * away) but nothing cascades actor -> combatant. So the orphan kept a live combatant, and Advanced
 * Encounters then threw from that combatant's `initiative` getter on every later combatant add —
 * one dead summon could wedge the tracker mid-combat. Deleting the TOKENS is the load-bearing half.
 *
 * These cases pin the ORDER and the ownership split, which is the whole content of the fix.
 */
"use strict";
const assert = require("assert");
const { loadEngine, readEngineSource } = require("./harness.js");

const env = loadEngine();

function fakeScene(tokens) {
  return {
    id: "scene-1",
    tokens: tokens.slice(),
    deleted: [],
    async deleteEmbeddedDocuments(type, ids) {
      assert.strictEqual(type, "Token", "the teardown must delete Tokens, not anything else");
      this.deleted.push(...ids);
      this.tokens = this.tokens.filter((t) => !ids.includes(t.id));
      return [];
    },
  };
}

function fakeActor({ id = "summon-1", summon = true } = {}) {
  return {
    id, name: "Combat Construct", deleted: false,
    getFlag(scope, key) { return scope === "edha-content" && key === "summon" ? summon : undefined; },
    async delete() { this.deleted = true; return this; },
  };
}

function withScenes(scenes, fn) {
  const prior = env.game.scenes;
  env.game.scenes = scenes;
  return Promise.resolve(fn()).finally(() => { env.game.scenes = prior; });
}

test("a summon's tokens are deleted, and its actor is left to the last-token cleanup", async () => {
  const actor = fakeActor({ summon: true });
  const scene = fakeScene([{ id: "tok-a", actorId: "summon-1" }, { id: "tok-b", actorId: "other" }]);
  await withScenes([scene], () => env.edhaDeleteActorWithTokens(actor));
  assert.deepStrictEqual(scene.deleted, ["tok-a"], "exactly the summon's own token must be deleted");
  assert.deepStrictEqual(scene.tokens.map((t) => t.id), ["tok-b"], "another actor's token must be untouched");
  assert.strictEqual(actor.deleted, false,
    "a summon that HAD a token must not be deleted here — the last-token cleanup owns it, and a " +
    "second delete races it into a server-side 'Actor does not exist'");
});

test("a TOKENLESS summon is deleted directly (nothing else will ever fire for it)", async () => {
  const actor = fakeActor({ summon: true });
  const scene = fakeScene([{ id: "tok-b", actorId: "other" }]);
  await withScenes([scene], () => env.edhaDeleteActorWithTokens(actor));
  assert.deepStrictEqual(scene.deleted, [], "nothing to delete on the canvas");
  assert.strictEqual(actor.deleted, true, "with no token there is no last-token cleanup — delete it here");
});

test("a NON-summon actor gets both halves: tokens first, then the actor", async () => {
  const actor = fakeActor({ summon: false });
  const scene = fakeScene([{ id: "tok-a", actorId: "summon-1" }]);
  await withScenes([scene], () => env.edhaDeleteActorWithTokens(actor));
  assert.deepStrictEqual(scene.deleted, ["tok-a"], "the token must go");
  assert.strictEqual(actor.deleted, true, "and nothing else owns this actor's delete");
});

test("tokens are swept across EVERY scene, not just the viewed one", async () => {
  const actor = fakeActor({ summon: false });
  const a = fakeScene([{ id: "tok-a", actorId: "summon-1" }]);
  const b = fakeScene([{ id: "tok-b", actorId: "summon-1" }]);
  await withScenes([a, b], () => env.edhaDeleteActorWithTokens(actor));
  assert.deepStrictEqual([a.deleted, b.deleted], [["tok-a"], ["tok-b"]], "an off-scene copy is still an orphan");
});

/* --- the HAND-DELETE half (07-27s, bench run 14 attempt 2) --------------------------------------
 * Run 14 confirmed the five engine call sites are correct and the negative control held, then failed
 * the row anyway: `edhaDeleteActorWithTokens` is a helper, not a `deleteActor` hook, so a GM deleting
 * the actor from the SIDEBAR — this row's own verb — was covered by nothing. The token stayed, its
 * combatant stayed, and the next combatant add threw. `edhaSweepOrphanedTokens` is the missing half;
 * these cases pin that it sweeps by actor id across scenes and touches nothing else. The SCOPE (only
 * actors carrying the `summon` mint flag) is enforced at the hook, which is asserted separately. */

test("the hand-delete sweep removes exactly the dead actor's tokens, on every scene", async () => {
  const a = fakeScene([{ id: "tok-a", actorId: "summon-1" }, { id: "keep", actorId: "someone-else" }]);
  const b = fakeScene([{ id: "tok-b", actorId: "summon-1" }]);
  await withScenes([a, b], () => env.edhaSweepOrphanedTokens("summon-1"));
  assert.deepStrictEqual([a.deleted, b.deleted], [["tok-a"], ["tok-b"]], "the orphan goes wherever it stands");
  assert.deepStrictEqual(a.tokens.map((t) => t.id), ["keep"],
    "NEGATIVE: a bystander token on the same scene must be untouched — this cascade runs on a hook " +
    "that fires for every actor in the world");
});

test("the hand-delete sweep is a no-op when nothing points at the id (no second delete to race)", async () => {
  const a = fakeScene([{ id: "keep", actorId: "someone-else" }]);
  await withScenes([a], () => env.edhaSweepOrphanedTokens("summon-1"));
  assert.deepStrictEqual(a.deleted, [], "no tokens, no writes");
  await withScenes([a], () => env.edhaSweepOrphanedTokens(null));
  assert.deepStrictEqual(a.deleted, [], "a missing id must never mean 'match everything'");
});

test("the deleteActor cascade is scoped to engine-MINTED actors, by the flag edhaSummon stamps", () => {
  // Was a `[\s\S]{0,900}` CHARACTER window over raw (CRLF) source — CRLF costs one extra byte
  // per line, so the same char budget spans a different number of LINES depending on line-ending
  // style, which is exactly the class of bug tests/harness.js's readEngineSource exists to kill.
  // Rewritten against LF-normalized source with a line-count window instead: scan forward from
  // each `Hooks.on("deleteActor", …)` site for edhaSweepOrphanedTokens within WINDOW lines. Three
  // such sites exist in the engine; only the third (the hand-delete safety net) calls it.
  const lines = readEngineSource().split("\n");
  const WINDOW = 20;   // the real block is 6 lines; generous headroom without risking a false match
  let hookText = null;
  for (let i = 0; i < lines.length; i++) {
    if (!/Hooks\.on\("deleteActor",/.test(lines[i])) continue;
    const slice = lines.slice(i, i + WINDOW);
    const j = slice.findIndex((l) => l.includes("edhaSweepOrphanedTokens"));
    if (j >= 0) { hookText = slice.slice(0, j + 1).join("\n") + "\n"; break; }
  }
  assert.ok(hookText, "the hand-delete safety net must be registered on deleteActor");
  assert.ok(/getFlag\?\.\("edha-content", "summon"\) !== true/.test(hookText),
    "the cascade must refuse any actor the engine did not mint — a blanket deleteActor sweep would " +
    "delete tokens belonging to hand-made adversaries and imported pack actors");
  assert.ok(/edhaDefBuffGmGate\(\)/.test(hookText),
    "one applier: deleteActor fires on every client, and Ben's table runs two GMs");
  assert.ok(!/\.delete\(\)/.test(hookText),
    "it must not try to delete the actor — it is already gone, and that is the 'Actor does not exist' race");
});
