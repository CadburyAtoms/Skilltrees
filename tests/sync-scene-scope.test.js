/* THE SCOPED ADVERSARY SYNC KEEPS ITS SCOPE — TODO items 147 + 151, fix pass 12
 * (bench run 47, 2026-09-14).
 *
 * item 147. `edha.syncAllAdversaries({folder: …, scenes: [X], dryRun: false})` promises R-113's
 * contract: "a scene left out of `scenes` is never touched, no matter what it holds." It leaked.
 * `edhaSyncAdversaryActor`'s OWN token loop honours the filter correctly; the write came from
 * downstream — the `updateActor` sight watcher in `52-green-instinct.js` fires on
 * `changes.system.attributes.awa !== undefined`, a PRESENCE test that the sync's wholesale
 * `{recursive: false, diff: false}` system replace satisfies whether or not AWA moved, and the
 * watcher then walked `game.scenes` UNFILTERED. Measured live: Briar-Gone Grove's token on the
 * Bench Arena rewritten `sight.range` 30 → 5 by a call scoped to the Playtest Map, silently.
 *
 * These cases fire the REAL registered `updateActor` chain, so they prove the wiring — that the
 * marker the sync stamps actually reaches the watcher Foundry runs — and not just the predicate.
 *
 * item 151. The same call's `folder` filter was `a.folder?.id === folder || a.folder?.name ===
 * folder`: exact and NON-RECURSIVE. No actor sits directly in "Edha Bench" (the roster lives in
 * `Bench PCs` and `Bench Targets`), so the incantation four documents printed matched ZERO actors
 * and returned a plan that reads like success.
 */
"use strict";
const assert = require("assert");
const { loadEngine, fireHook, mockActor, stageWorld, sleep, eq } = require("./harness.js");

const env = loadEngine();

/* --- edhaUpdateSceneScope (pure) ------------------------------------------------------------- */

test("edhaUpdateSceneScope: no marker at all means NO CLAIM — null, i.e. the unfiltered footprint", () => {
  assert.strictEqual(env.edhaUpdateSceneScope(undefined), null);
  assert.strictEqual(env.edhaUpdateSceneScope({}), null);
  assert.strictEqual(env.edhaUpdateSceneScope({ edhaSceneScope: null }), null);
});

test("edhaUpdateSceneScope: an array of ids becomes exactly that set", () => {
  const scope = env.edhaUpdateSceneScope({ edhaSceneScope: ["sceneA", "sceneB"] });
  assert.strictEqual(scope.size, 2);
  assert.ok(scope.has("sceneA") && scope.has("sceneB") && !scope.has("sceneC"));
});

test("edhaUpdateSceneScope: an EMPTY array is a real, empty scope — not 'no claim'", () => {
  const scope = env.edhaUpdateSceneScope({ edhaSceneScope: [] });
  assert.notStrictEqual(scope, null, "an empty array must NOT degrade to the unfiltered null");
  assert.strictEqual(scope.size, 0);
});

/* A Set built in THIS realm is not `instanceof` the engine vm's Set — the helper duck-types on
 * `.has` for exactly this reason, and the sync passes a Set through on the real path. */
test("edhaUpdateSceneScope: a cross-realm Set is passed through, not silently emptied", () => {
  const scope = env.edhaUpdateSceneScope({ edhaSceneScope: new Set(["sceneA"]) });
  assert.strictEqual(scope.size, 1, "an instanceof check would have turned this into an empty set");
  assert.ok(scope.has("sceneA"));
});

/* --- the sight watcher honours it (hook layer — the actual leak) ------------------------------ */

/* A scene whose Token updates are recorded rather than applied. `tokens.filter` is the real
 * Array#filter the watcher calls. */
function stageScene(id, actorId) {
  const tokens = [{ id: `tok-${id}`, actorId }];
  return {
    id, name: id, tokens,
    writes: [],
    async updateEmbeddedDocuments(kind, updates) { this.writes.push({ kind, updates }); return updates; },
  };
}

/* AWA 8 → `EDHA_SENSES_RANGES_FT[ceil(8/2)]` = 100 ft — deliberately the top of the ladder, so a
 * write is unmistakable and can never be confused with a fixture default or the pack's 30. */
function stageSightActor() {
  return mockActor({
    name: "Briar-Gone Grove", id: "briar", type: "adversary",
    system: { attributes: { awa: { value: 8, bonus: 0 } } },
  });
}

/* Fire the REAL registered updateActor chain with the sync's own change shape: a wholesale
 * `system` replace, which is what makes `changes.system.attributes.awa` present. */
async function fireSyncUpdate(actor, scenes, options) {
  const world = stageWorld(env, {
    user: { id: "gm-1", isGM: true, targets: new Set(), character: null },
    users: { activeGM: { isSelf: true } },
    actors: [actor], placeables: [], scenes, combats: [],
  });
  try {
    await fireHook(env, "updateActor", actor, { system: actor.system }, options, "gm-1");
    await sleep(5);   // the watcher's scene writes are void-dispatched
  } finally { world.undo(); }
}

/* THE BUG. Revert `52-green-instinct.js`'s `if (scope && !scope.size) return;` (or the
 * `if (scope && !scope.has(sc.id)) continue;` inside the loop) and the out-of-scope scene below
 * collects a `sight.range` write — the Bench Arena's 30 → 5. */
test("item 147: the sync's marker stops the sight watcher writing tokens on ANY scene", async () => {
  const actor = stageSightActor();
  const inScope = stageScene("scenePlaytest", "briar");
  const outOfScope = stageScene("sceneBenchArena", "briar");
  await fireSyncUpdate(actor, [inScope, outOfScope], { recursive: false, diff: false, edhaSceneScope: [] });
  eq(outOfScope.writes, [], "a scene the sync never named was written to — this IS the item 147 leak");
  eq(inScope.writes, [], "the sync stamps its own in-scope tokens from the PACK; the watcher must not race it");
});

/* The prototype half of the same stand-down: the sync just replaced `prototypeToken` wholesale
 * from the pack, and the watcher's AWA ladder does not honour a bespoke `senses` override. */
test("item 147: the marker also stops the watcher rewriting prototypeToken.sight.range", async () => {
  const actor = stageSightActor();
  await fireSyncUpdate(actor, [stageScene("scenePlaytest", "briar")], { recursive: false, diff: false, edhaSceneScope: [] });
  const sightWrites = actor.updates.filter((u) => "prototypeToken.sight.range" in u);
  eq(sightWrites, [], "the pack's prototype is canonical during a sync — the AWA ladder must not overwrite it");
});

/* A NARROWED scope (not empty) still restamps, but only the scenes it names. */
test("item 147: a NARROWED scope restamps the listed scene and nothing else", async () => {
  const actor = stageSightActor();
  const listed = stageScene("scenePlaytest", "briar");
  const unlisted = stageScene("sceneBenchArena", "briar");
  await fireSyncUpdate(actor, [listed, unlisted], { edhaSceneScope: ["scenePlaytest"] });
  assert.strictEqual(listed.writes.length, 1, "the listed scene should still be restamped");
  assert.strictEqual(listed.writes[0].updates[0]["sight.range"], 100);
  eq(unlisted.writes, [], "a scene left out of the scope must be untouched");
});

/* THE REGRESSION GUARD: an ordinary AWA edit on a sheet carries no marker and must keep working
 * exactly as before — every scene, prototype included. If this fails the fix has broken the
 * watcher's whole reason for existing. */
test("item 147: an UNMARKED AWA change still restamps every scene and the prototype (unchanged)", async () => {
  const actor = stageSightActor();
  const a = stageScene("scenePlaytest", "briar");
  const b = stageScene("sceneBenchArena", "briar");
  await fireSyncUpdate(actor, [a, b], {});
  assert.strictEqual(a.writes.length, 1, "an unmarked AWA change must still restamp scene A");
  assert.strictEqual(b.writes.length, 1, "an unmarked AWA change must still restamp scene B");
  assert.strictEqual(b.writes[0].updates[0]["sight.range"], 100);
  assert.ok(actor.updates.some((u) => u["prototypeToken.sight.range"] === 100), "the prototype must still be kept in step");
});

/* --- item 151: the folder filter matches descendants ------------------------------------------ */

const EDHA_BENCH = { id: "f-root", name: "Edha Bench" };
const BENCH_TARGETS = { id: "f-targets", name: "Bench Targets", ancestors: [EDHA_BENCH] };
const OTHER = { id: "f-other", name: "Ben's Menagerie", ancestors: [] };
const chainOf = (folder) => [folder, ...(folder.ancestors ?? [])];

/* THE BUG. `edhaFolderChainMatches` with the exact, non-recursive predicate
 * (`chain[0].name === folder`) fails this case — which is precisely what four documents printed. */
test("item 151: 'Edha Bench' matches an actor sitting in its CHILD folder", () => {
  assert.strictEqual(env.edhaFolderChainMatches(chainOf(BENCH_TARGETS), "Edha Bench"), true);
  assert.strictEqual(env.edhaFolderChainMatches(chainOf(BENCH_TARGETS), "f-root"), true, "by folder id too");
});

test("item 151: the child folder's own name still matches (the workaround bench 47 used)", () => {
  assert.strictEqual(env.edhaFolderChainMatches(chainOf(BENCH_TARGETS), "Bench Targets"), true);
});

test("item 151: an unrelated folder does NOT match — the filter still narrows", () => {
  assert.strictEqual(env.edhaFolderChainMatches(chainOf(OTHER), "Edha Bench"), false);
  assert.strictEqual(env.edhaFolderChainMatches([], "Edha Bench"), false, "an actor in no folder at all");
});

test("item 151: a blank/absent folder option matches everything (no filter)", () => {
  assert.strictEqual(env.edhaFolderChainMatches([], ""), true);
  assert.strictEqual(env.edhaFolderChainMatches(chainOf(OTHER), null), true);
});

test("item 151: edhaActorFolderChain reads own-folder-first, then ancestors outward", () => {
  const chain = env.edhaActorFolderChain({ folder: BENCH_TARGETS });
  eq(chain.map((f) => f.name), ["Bench Targets", "Edha Bench"]);
  eq(env.edhaActorFolderChain({ folder: null }), []);
  eq(env.edhaActorFolderChain(null), []);
});

/* THE WARNING: a scoped call that resolves to nothing must not read like a success. */
test("item 151: a zero-candidate folder filter WARNS instead of returning silently", async () => {
  const priorPacks = env.game.packs;
  const priorUi = env.ui;
  const warns = [];
  env.game.packs = { get: () => ({}) };
  env.ui = { ...priorUi, notifications: { warn: (m) => warns.push(m), info: () => {}, error: () => {} } };
  const staged = stageWorld(env, { user: { isGM: true }, actors: [], scenes: [], combats: [] });
  try {
    const result = await env.edhaSyncAllAdversaries({ folder: "No Such Folder" });
    eq(result.actors, []);
    assert.strictEqual(warns.length, 1, `expected exactly one zero-candidate warning, got ${warns.length}`);
    assert.ok(/matched ZERO adversary actors/.test(warns[0]), `warning did not say what happened: ${warns[0]}`);
    assert.ok(/No Such Folder/.test(warns[0]), "the warning must name the filter that matched nothing");
  } finally {
    staged.undo();
    env.game.packs = priorPacks;
    env.ui = priorUi;
  }
});

/* …and an UNSCOPED call that finds nothing does not warn — an empty world is not a typo. */
test("item 151: an unscoped call with no candidates does not warn", async () => {
  const priorPacks = env.game.packs;
  const priorUi = env.ui;
  const warns = [];
  env.game.packs = { get: () => ({}) };
  env.ui = { ...priorUi, notifications: { warn: (m) => warns.push(m), info: () => {}, error: () => {} } };
  const staged = stageWorld(env, { user: { isGM: true }, actors: [], scenes: [], combats: [] });
  try {
    await env.edhaSyncAllAdversaries({});
    eq(warns, []);
  } finally {
    staged.undo();
    env.game.packs = priorPacks;
    env.ui = priorUi;
  }
});

/* --- wiring: the marker is actually stamped at the sync's own update ---------------------------- */
test("wiring: edhaSyncAdversaryActor's wholesale replace carries edhaSceneScope: []", () => {
  const { readEngineSource, codeOnly } = require("./harness.js");
  const code = codeOnly(readEngineSource());
  const start = code.indexOf("async function edhaSyncAdversaryActor");
  assert.ok(start >= 0, "edhaSyncAdversaryActor not found in engine source");
  const body = code.slice(start, code.indexOf("async function edhaSyncAllAdversaries"));
  assert.ok(/recursive:\s*false,\s*diff:\s*false,\s*edhaSceneScope:\s*\[\]/.test(body),
    "the sync's wholesale system/prototypeToken replace must stamp edhaSceneScope: [] so downstream watchers stand down");
});
