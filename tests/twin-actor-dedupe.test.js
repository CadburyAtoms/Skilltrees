/* REGRESSION — an unlinked token's synthetic actor and its DIRECTORY TWIN both passed the dedupe,
 * so a scene-wide scan ran the same creature twice (found bench run 20, 2026-07-28f; fixed
 * 2026-07-28g, fix pass D).
 *
 * `edhaSutureCradleCheck` built its holder list from the two places an actor can live and deduped
 * with OBJECT IDENTITY:
 *     for (const tok of canvas.tokens.placeables) if (tok.actor && !holders.includes(tok.actor)) holders.push(tok.actor);
 *     for (const a of game.actors)                if (!holders.includes(a))                      holders.push(a);
 * An unlinked token's `token.actor` is a SYNTHETIC actor: a different object with the SAME `id`,
 * inheriting the base actor's flags. `includes` compares references, so both were pushed and the
 * Stitchmother's keep-or-lose check fired twice — two cards 75 ms apart from ONE user (attributed
 * by `userId` first, so not the two-GM duplicate), and, worse, TWO Discipline rolls against DC
 * 10 + damage, either of which could end the cradle.
 *
 * WHY `uuid` IS NOT THE FIX. The twins' uuids differ (`Scene.x.Token.y.Actor.z` vs `Actor.z`), so a
 * uuid key keeps both — six other canvas+directory unions in the engine use exactly that key and
 * get away with it only because their writes are idempotent unsets.
 * WHY `id` ALONE IS NOT THE FIX EITHER, and this is the trap: two unlinked tokens stamped from ONE
 * prototype SHARE that `id`. Keying on `id` would collapse three distinct Corvaine Raiders into
 * one — a worse bug than the one being fixed.
 *
 * So `edhaSceneActors` dedupes the CANVAS pass by `uuid` and then admits a directory actor only
 * when no canvas token already IS it — by `id`. Cases 2 and 3 below are the two halves; both must
 * hold, and a fix that satisfies only one is wrong.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, captureChat } = require("./harness.js");

/* A directory actor. `synthetic()` returns its unlinked-token twin: same id, different object,
 * different uuid, inheriting the flags — exactly what TokenDocument#actor hands back. mockActor's
 * getFlag/setFlag/unsetFlag close over their own `scopes` object (not `this.flags`), so copying
 * them onto the twin via Object.assign still shares the SAME underlying flags — the twin genuinely
 * inherits the base document's flags, exactly like a real synthetic actor. */
function directoryActor(name, { id = name, type = "adversary", flags = {} } = {}) {
  const a = mockActor({ name, id, uuid: `Actor.${id}`, type, flags });
  a.isToken = false;
  a.getRollData = () => ({});
  a.synthetic = (sceneId, tokenId) => Object.assign(Object.create(Object.getPrototypeOf(a)), a, {
    isToken: true, uuid: `Scene.${sceneId}.Token.${tokenId}.Actor.${id}`,
  });
  return a;
}

test("edhaSceneActors: an unlinked token and its directory twin count ONCE (the bug)", () => {
  const env = loadEngine();
  const base = directoryActor("Stitchmother", { id: "DtdyQdVRXolPGFOb", flags: { sutureCradle: { targetUuid: "Actor.Green" } } });
  const tokenActor = base.synthetic("s1", "t1");
  stageWorld(env, { placeables: [{ actor: tokenActor }], actors: [base] });

  const out = env.edhaSceneActors();
  assert.strictEqual(out.length, 1, "same id, two objects — one holder, not two");
  assert.strictEqual(out[0].isToken, true, "the TOKEN actor is the one on the scene; it wins");
});

test("POSITIVE CONTROL — three unlinked tokens off ONE prototype stay THREE", () => {
  const env = loadEngine();
  const base = directoryActor("Corvaine Raider", { id: "raiderBaseId000" });
  const toks = ["t1", "t2", "t3"].map(t => ({ actor: base.synthetic("s1", t) }));
  stageWorld(env, { placeables: toks, actors: [base] });

  const out = env.edhaSceneActors();
  assert.strictEqual(out.length, 3, "an id-keyed dedupe would collapse these to 1 — that is the trap");
  assert.strictEqual(new Set(out.map(a => a.uuid)).size, 3);
});

test("a LINKED token and its directory actor are the same document — counted once", () => {
  const env = loadEngine();
  const pc = directoryActor("Tem parinaem", { id: "pcId0000000000", type: "character" });
  stageWorld(env, { placeables: [{ actor: pc }, { actor: pc }], actors: [pc] });   // two tokens, one linked actor
  assert.strictEqual(env.edhaSceneActors().length, 1);
});

test("an off-canvas directory actor is still included (the sidebar precedent, 07-28d)", () => {
  const env = loadEngine();
  const onScene = directoryActor("On Scene", { id: "onScene00000000" });
  const parked = directoryActor("The Vivisectionist", { id: "parked000000000" });
  stageWorld(env, { placeables: [{ actor: onScene.synthetic("s1", "t1") }], actors: [onScene, parked] });

  const names = env.edhaSceneActors().map(a => a.name).sort().join(" | ");   // join: cross-realm arrays are not deepStrictEqual
  assert.strictEqual(names, "On Scene | The Vivisectionist");
});

test("directoryFilter narrows only the DIRECTORY pass (edhaWatchActors' characters-only rule)", () => {
  const env = loadEngine();
  const advTok = directoryActor("Adv", { id: "adv000000000000" }).synthetic("s1", "t1");
  const pc = directoryActor("PC", { id: "pc0000000000000", type: "character" });
  const dirAdv = directoryActor("Directory Adv", { id: "dirAdv000000000" });
  stageWorld(env, { placeables: [{ actor: advTok }], actors: [pc, dirAdv] });

  const names = env.edhaSceneActors({ directoryFilter: (a) => a.type === "character" }).map(a => a.name).sort().join(" | ");
  assert.strictEqual(names, "Adv | PC",
    "an adversary token on the canvas still counts; a directory-only adversary does not");
  assert.strictEqual(env.edhaWatchActors().map(a => a.name).sort().join(" | "), "Adv | PC",
    "edhaWatchActors must be exactly that call");
});

/* ---- the reported symptom, end to end -------------------------------------------------------- */

test("Suture Cradle rolls Discipline ONCE for a cradler that is both a token and a directory twin", async () => {
  const env = loadEngine();
  const base = directoryActor("Stitchmother", { id: "DtdyQdVRXolPGFOb", flags: { sutureCradle: { targetUuid: "Actor.Green", targetName: "Bench — Green" } } });
  stageWorld(env, { placeables: [{ actor: base.synthetic("s1", "t1") }], actors: [base] });

  const cards = captureChat(env);
  let rolls = 0;
  env.edhaRollOpposedSkill = async () => { rolls++; return 20; };   // 20 ≥ DC 16 → the cradle holds

  await env.edhaSutureCradleCheck({ uuid: "Actor.Green", name: "Bench — Green" }, 6);

  assert.strictEqual(rolls, 1, "ONE Discipline roll — the bug rolled twice and either result could end it");
  assert.strictEqual(cards.length, 1, "ONE keep/ends card — the bench saw two, 75 ms apart");
  assert.ok(/holds/.test(cards[0].content), "20 vs DC 10+6 holds");
});

test("NEGATIVE CONTROL — a cradler holding NOBODY rolls nothing", async () => {
  const env = loadEngine();
  const base = directoryActor("Stitchmother", { id: "DtdyQdVRXolPGFOb" });        // no sutureCradle flag
  stageWorld(env, { placeables: [{ actor: base.synthetic("s1", "t1") }], actors: [base] });
  let rolls = 0;
  captureChat(env);
  env.edhaRollOpposedSkill = async () => { rolls++; return 20; };

  await env.edhaSutureCradleCheck({ uuid: "Actor.Green", name: "Bench — Green" }, 6);
  await env.edhaSutureCradleCheck({ uuid: "Actor.Green", name: "Bench — Green" }, 0);   // 0 damage: no check at all
  assert.strictEqual(rolls, 0);
});
