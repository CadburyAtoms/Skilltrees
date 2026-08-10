/* ENGINE PASS 5.2 (Job 6) — pins edhaSetEdhaFlag (the sole GM-relay flag writer after this pass;
 * its literal twin edhaSetActorFlagCross is deleted) and edhaWriteStatusMark (the shared body behind
 * every "toggle a status ON + record markedBy.<status>" site). Both share the same no-GM behavior:
 * warn + return false — the majority convention seven inline isOwner/socket splits now follow,
 * including four that used to drop the write SILENTLY (no warning at all).
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, withStubs, eq } = require("./harness.js");

test("edhaSetEdhaFlag: the owner writes directly, no socket emit", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Owner" }); actor.isOwner = true;
  let emitted = false;
  await withStubs(env, { game: { ...env.game, socket: { on() {}, emit: () => { emitted = true; } } } }, async () => {
    const ok = await env.edhaSetEdhaFlag(actor, "someKey", { a: 1 });
    assert.strictEqual(ok, true);
  });
  assert.deepStrictEqual(actor.getFlag("edha-content", "someKey"), { a: 1 });
  assert.strictEqual(emitted, false);
});

test("edhaSetEdhaFlag: not the owner, a GM is online -> relays via the set-flag socket action", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Someone Else's" }); actor.isOwner = false; actor.uuid = "Actor.x";
  let payload = null;
  const undo = stageWorld(env, { users: { activeGM: { id: "gm1" } } }).undo;
  try {
    await withStubs(env, { game: { ...env.game, users: { activeGM: { id: "gm1" } }, socket: { on() {}, emit: (channel, data) => { payload = { channel, data }; } } } }, async () => {
      const ok = await env.edhaSetEdhaFlag(actor, "someKey", { b: 2 });
      assert.strictEqual(ok, true);
    });
  } finally { undo(); }
  assert.strictEqual(payload.channel, "module.edha-content");
  assert.strictEqual(payload.data.action, "set-flag");
  eq(payload.data.payload, { actorUuid: "Actor.x", key: "someKey", value: { b: 2 } });
});

test("edhaSetEdhaFlag: not the owner, NO GM online -> warns and returns false (the unified no-GM convention)", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Someone Else's" }); actor.isOwner = false;
  let warned = null, emitted = false;
  await withStubs(env, {
    game: { ...env.game, users: { activeGM: null }, socket: { on() {}, emit: () => { emitted = true; } } },
    ui: { notifications: { warn: (msg) => { warned = msg; }, info() {}, error() {} } },
  }, async () => {
    const ok = await env.edhaSetEdhaFlag(actor, "someKey", "v");
    assert.strictEqual(ok, false);
  });
  assert.ok(warned, "must warn — this is the majority convention every Job 6a site now follows");
  assert.strictEqual(emitted, false, "must not silently emit anyway");
});

test("edhaSetEdhaFlag: value null clears (documented — 'pass value null to clear')", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Owner", flags: { markedBy: { omen: { actorId: "x" } } } });
  actor.isOwner = true;
  await env.edhaSetEdhaFlag(actor, "markedBy.omen", null);
  assert.strictEqual(actor.getFlag("edha-content", "markedBy.omen"), null);
});

/* -------------------------------------------------------------------------------------------- */
/* edhaWriteStatusMark — the shared status+markedBy body                                         */
/* -------------------------------------------------------------------------------------------- */

test("edhaWriteStatusMark: the owner toggles the status AND records the mark", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Target" }); actor.isOwner = true;
  const toggled = [];
  actor.toggleStatusEffect = async (status, opts) => toggled.push({ status, opts });
  const mark = { actorId: "owner1", talent: "Omen" };
  const ok = await env.edhaWriteStatusMark(actor, "omen", mark);
  assert.strictEqual(ok, true);
  eq(toggled, [{ status: "omen", opts: { active: true } }]);
  eq(actor.getFlag("edha-content", "markedBy.omen"), mark);
});

test("edhaWriteStatusMark: combatExpire is forwarded to the OWNER write path when set", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Target" }); actor.isOwner = true;
  actor.toggleStatusEffect = async () => {};
  await env.edhaWriteStatusMark(actor, "decaying", { actorId: "owner1" }, { combatExpire: true });
  assert.strictEqual(actor.getFlag("edha-content", "combatExpire.decaying"), true);
});

test("edhaWriteStatusMark: not the owner, a GM is online -> relays via apply-status-mark, carrying combatExpire", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Someone Else's" }); actor.isOwner = false; actor.uuid = "Actor.y";
  let payload = null;
  await withStubs(env, { game: { ...env.game, users: { activeGM: { id: "gm1" } }, socket: { on() {}, emit: (channel, data) => { payload = { channel, data }; } } } }, async () => {
    const ok = await env.edhaWriteStatusMark(actor, "decaying", { actorId: "owner1" }, { combatExpire: true });
    assert.strictEqual(ok, true);
  });
  assert.strictEqual(payload.data.action, "apply-status-mark");
  eq(payload.data.payload, { actorUuid: "Actor.y", statusId: "decaying", mark: { actorId: "owner1" }, combatExpire: true });
});

test("edhaWriteStatusMark: not the owner, NO GM online -> warns and returns false (was a SILENT drop at 4 call sites before this pass)", async () => {
  const env = loadEngine();
  const actor = mockActor({ name: "Someone Else's" }); actor.isOwner = false;
  let warned = null, emitted = false;
  await withStubs(env, {
    game: { ...env.game, users: { activeGM: null }, socket: { on() {}, emit: () => { emitted = true; } } },
    ui: { notifications: { warn: (msg) => { warned = msg; }, info() {}, error() {} } },
  }, async () => {
    const ok = await env.edhaWriteStatusMark(actor, "omen", { actorId: "owner1" });
    assert.strictEqual(ok, false);
  });
  assert.ok(warned, "the four sites that used to fall through with NO else-branch now warn via this shared body");
  assert.strictEqual(emitted, false);
});

test("edhaWriteStatusMark: a falsy target or statusId is a no-op false, never throws", async () => {
  const env = loadEngine();
  assert.strictEqual(await env.edhaWriteStatusMark(null, "omen", {}), false);
  const actor = mockActor({ name: "X" }); actor.isOwner = true;
  assert.strictEqual(await env.edhaWriteStatusMark(actor, "", {}), false);
});
