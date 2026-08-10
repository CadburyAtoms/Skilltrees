/* ENGINE PASS 5.2 (Job 3) — pins edhaResolveActorRef(uuid), the single reader that replaced ~94
 * hand-rolled `await fromUuid(x).catch(() => null)` + `ref?.actor ?? ref` pairs: a Token(Document)
 * uuid normalizes to its `.actor`, an Actor uuid resolves directly, a falsy uuid short-circuits
 * WITHOUT calling fromUuid at all (so every ternary-guarded call site could drop its own `uuid ? … :
 * null` wrapper), and a failed lookup returns null rather than throwing.
 */
"use strict";
const assert = require("assert");
const { loadEngine, withStubs } = require("./harness.js");

test("edhaResolveActorRef: an Actor-document uuid resolves to itself (.actor is undefined on an Actor, so the ?? fallback returns the actor)", async () => {
  const env = loadEngine();
  const actor = { name: "Actor Doc", uuid: "Actor.abc" };
  await withStubs(env, { fromUuid: async (uuid) => (uuid === actor.uuid ? actor : null) }, async () => {
    assert.strictEqual(await env.edhaResolveActorRef(actor.uuid), actor);
  });
});

test("edhaResolveActorRef: a Token(Document) uuid normalizes through its .actor", async () => {
  const env = loadEngine();
  const actor = { name: "Owner" };
  const tokenDoc = { actor, uuid: "Scene.x.Token.y" };
  await withStubs(env, { fromUuid: async (uuid) => (uuid === tokenDoc.uuid ? tokenDoc : null) }, async () => {
    assert.strictEqual(await env.edhaResolveActorRef(tokenDoc.uuid), actor,
      "the token-uuid case: ref.actor wins over the token document itself");
  });
});

test("edhaResolveActorRef: a falsy uuid returns null WITHOUT calling fromUuid at all", async () => {
  const env = loadEngine();
  let called = false;
  await withStubs(env, { fromUuid: async () => { called = true; return null; } }, async () => {
    for (const bad of [null, undefined, "", 0]) {
      assert.strictEqual(await env.edhaResolveActorRef(bad), null);
    }
  });
  assert.strictEqual(called, false, "every ternary-guarded call site (`uuid ? await fromUuid(uuid) : null`) could drop its own guard because this is a no-op on a blank uuid");
});

test("edhaResolveActorRef: a failed/deleted-document lookup resolves to null, never throws", async () => {
  const env = loadEngine();
  await withStubs(env, { fromUuid: async () => { throw new Error("no such document"); } }, async () => {
    assert.strictEqual(await env.edhaResolveActorRef("Actor.deleted"), null);
  });
  await withStubs(env, { fromUuid: async () => null }, async () => {
    assert.strictEqual(await env.edhaResolveActorRef("Actor.gone"), null);
  });
});
