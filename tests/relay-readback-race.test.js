/* REGRESSION — the fire-and-forget RELAY read-back race (bench run 31, 2026-09-05 defect ③).
 *
 * `Unravel Everything` places an Omen on every enemy in range (rule `order: 0`) and then detonates
 * every Omen on its ledger (rule `order: 1`) — one activation, two ordered `use` rules. On the
 * bench the sweep printed "no creatures on the ledger" on a fresh cast and only worked on a SECOND
 * cast, once the marks from the first had landed.
 *
 * The bench's hypothesis was the rule dispatcher. It is NOT: the cosmere system's `fireEvent`
 * sorts by `order` and reduces with `await prev` + `return await rule.handler.execute(...)`, and
 * `edhaOwnerListQueue` genuinely serialises and commits. The un-awaited write is one level DOWN.
 * `game.socket.emit` carries no acknowledgement, so `edhaWriteStatusMark`'s GM-relay branch used
 * to `return true` a full round trip before the status existed anywhere. `edhaOwnerList`'s
 * mark-wins reconcile then dropped every entry whose creature did not carry the marker status ON
 * THIS CLIENT — which, in the same tick as the relay, is all of them.
 *
 * Only a client that owns the CASTER but not the TARGET can see it: a GM is `isOwner` on
 * everything, takes the direct branch, and awaits a real write. That is why fifteen green Chaos
 * bench rows never caught it and the player-client window did.
 *
 * The fix is `edhaAwaitLocal(test, {timeoutMs, stepMs, label})` — poll the local documents until
 * the relayed write is observable — adopted by `edhaWriteStatusMark` and `edhaCounterWriteRemote`.
 *
 * The fake socket applies the GM-side write after a macrotask delay, which is what makes the OLD
 * behaviour reproducible: case 3 below models the pre-fix relay inline (emit; return true) as a
 * NEGATIVE CONTROL and asserts it still reproduces the bench's exact symptom, so this file pins
 * the diagnosis and not just the patch.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, sleep, eq } = require("./harness.js");

/* Lazy load: each test stages its own world through stageWorld/undo and overwrites
 * env.game.socket + env.fromUuidSync, so one engine instance safely serves the whole file — via a
 * Proxy so the parse is deferred to the first case that runs. */
let _env = null;
const env = new Proxy({}, {
  get(_, prop) { return (_env || (_env = loadEngine()))[prop]; },
  set(_, prop, value) { (_env || (_env = loadEngine()))[prop] = value; return true; },
});

const GM_LAG_MS = 5;   // the socket round trip + the GM's own write, well under the poll timeout

/* A caster the local user owns, and N targets it does not — the exact ownership split that makes
 * `edhaWriteStatusMark` take its relay branch. `flags.lists` is the H3 ledger store. */
function stageRelayWorld(targetCount = 2) {
  const owner = mockActor({ name: "Caster", id: "caster", uuid: "Actor.caster", flags: { lists: {} } });
  owner.isOwner = true;
  const targets = Array.from({ length: targetCount }, (_, i) => {
    const t = mockActor({ name: `Target ${i + 1}`, id: `t${i}`, uuid: `Actor.t${i}` });
    t.isOwner = false;   // GM-owned enemy: every write to it is relayed
    return t;
  });
  const byUuid = new Map([[owner.uuid, owner], ...targets.map((t) => [t.uuid, t])]);

  const staged = stageWorld(env, { users: { activeGM: { id: "gm", isGM: true, active: true } } });
  const priorSocket = env.game.socket, priorSync = env.fromUuidSync, priorScene = env.canvas?.scene;
  env.canvas = env.canvas || {};
  env.canvas.scene = null;   // entries carry no sceneId here, so the scene gate never fires
  env.fromUuidSync = (uuid) => byUuid.get(uuid) ?? null;

  const emitted = [];
  // The GM end of the relay, applied ONE MACROTASK LATE — the round trip the old code did not wait for.
  env.game.socket = {
    on() {},
    emit(_channel, data) {
      emitted.push(data);
      const p = data?.payload || {};
      const a = byUuid.get(p.actorUuid ?? p.targetUuid);
      if (!a) return;
      setTimeout(() => {
        if (data.action === "apply-status-mark") {
          a.statuses.add(p.statusId);
          if (p.mark) void a.setFlag("edha-content", `markedBy.${p.statusId}`, p.mark);
        }
      }, GM_LAG_MS);
    },
  };
  return {
    owner, targets, emitted,
    undo() {
      staged.undo();
      env.game.socket = priorSocket;
      env.fromUuidSync = priorSync;
      if (env.canvas) env.canvas.scene = priorScene;
    },
  };
}

/* Rule `order: 0` — the H3 `place {target: enemies-range}` body, in the shape the executor runs it:
 * mark FIRST, commit the ledger only once it landed (the 07-24v ordering), one commit for the fill. */
async function fillRule(owner, targets, { key = "omens", status = "omen", writeMark } = {}) {
  const mark = { actorId: owner.id, talent: "Unravel Everything" };
  return env.edhaOwnerListQueue(owner, key, async () => {
    let list = env.edhaOwnerList(owner, key, status).slice();
    const placed = [];
    for (const t of targets) {
      const entry = { id: `e-${t.id}`, uuid: t.uuid, name: t.name, talent: "Unravel Everything" };
      if (!(await writeMark(t, status, mark))) break;
      list.push(entry);
      placed.push(t.name);
    }
    if (placed.length) await env.edhaSetOwnerList(owner, key, list);
    return placed;
  });
}

/* Rule `order: 1` — what the `edha-def-test {vs: none, targetList: omens}` sweep reads. The sweep
 * resolves its roster through `edhaEffectTargets(..., "list-members")`, which is `edhaOwnerList`
 * plus a downed/range filter; the reconcile is the half that decided the bench's outcome. */
function sweepRule(owner, { key = "omens", status = "omen" } = {}) {
  return env.edhaOwnerList(owner, key, status).map((e) => e.name);
}

test("edhaAwaitLocal resolves as soon as the predicate holds, without burning the timeout", async () => {
  let ready = false;
  setTimeout(() => { ready = true; }, GM_LAG_MS);
  const t0 = Date.now();
  assert.strictEqual(await env.edhaAwaitLocal(() => ready, { timeoutMs: 2000, stepMs: 5 }), true);
  assert.ok(Date.now() - t0 < 500, "should return on the first passing poll, not at the timeout");
});

test("edhaAwaitLocal fails OPEN on timeout (returns false) and a throwing predicate never wedges it", async () => {
  assert.strictEqual(await env.edhaAwaitLocal(() => false, { timeoutMs: 30, stepMs: 5 }), false);
  assert.strictEqual(await env.edhaAwaitLocal(() => { throw new Error("boom"); }, { timeoutMs: 30, stepMs: 5 }), false);
  assert.strictEqual(await env.edhaAwaitLocal(() => true, { timeoutMs: 0, stepMs: 5 }), true,
    "an already-true predicate must not wait even one step");
});

test("edhaWriteStatusMark's relay branch does not return until the mark is visible on THIS client", async () => {
  const w = stageRelayWorld(1);
  try {
    const t = w.targets[0];
    assert.strictEqual(t.statuses.has("omen"), false, "precondition: unmarked");
    const ok = await env.edhaWriteStatusMark(t, "omen", { actorId: "caster", talent: "Unravel Everything" });
    assert.strictEqual(ok, true);
    assert.strictEqual(w.emitted.length, 1, "the write is still relayed, not done locally");
    assert.strictEqual(t.statuses.has("omen"), true,
      "the status must be observable locally before the caller is told the mark landed");
    assert.deepStrictEqual(t.getFlag("edha-content", "markedBy.omen"), { actorId: "caster", talent: "Unravel Everything" },
      "the markedBy flag is the other half the damage post-pass reads — wait for it too");
  } finally { w.undo(); }
});

test("THE BENCH CASE: fill (order 0) then sweep (order 1) in one activation — the sweep sees both Omens", async () => {
  const w = stageRelayWorld(2);
  try {
    // `fireEvent` sequences ordered rules with `await prev` — modelled exactly.
    const placed = await fillRule(w.owner, w.targets, { writeMark: env.edhaWriteStatusMark });
    const swept = sweepRule(w.owner);
    eq(placed, ["Target 1", "Target 2"]);                                           // the fill places both
    eq(w.owner.flags["edha-content"].lists.omens.map((e) => e.name), ["Target 1", "Target 2"]);   // …and commits both
    eq(swept, ["Target 1", "Target 2"]);   // the order-1 sweep must see the order-0 fill
  } finally { w.undo(); }
});

test("NEGATIVE CONTROL: the pre-fix un-awaited relay still reproduces 'no creatures on the ledger'", async () => {
  const w = stageRelayWorld(2);
  try {
    // The two lines edhaWriteStatusMark used to end with: emit, then claim success immediately.
    const unawaitedWriteMark = async (target, statusId, mark) => {
      env.game.socket.emit("module.edha-content", { action: "apply-status-mark", payload: { actorUuid: target.uuid, statusId, mark } });
      return true;
    };
    const placed = await fillRule(w.owner, w.targets, { writeMark: unawaitedWriteMark });
    const swept = sweepRule(w.owner);
    eq(placed, ["Target 1", "Target 2"]);   // the fill still reports both placed…
    assert.strictEqual(w.owner.flags["edha-content"].lists.omens.length, 2, "…and the ledger really holds both…");
    assert.deepStrictEqual([...swept], [],
      "…but the mark-wins reconcile drops both, which is the bench's exact symptom. If this case " +
      "starts passing with a non-empty sweep the diagnosis has changed — re-derive it before editing.");
    await sleep(GM_LAG_MS * 4);
    eq(sweepRule(w.owner), ["Target 1", "Target 2"]);   // once the relay lands the SAME ledger reads fine — the bench's second cast
  } finally { w.undo(); }
});

test("Spreading Omen's shape: place on the victim, then place near-victim — neither entry is clobbered", async () => {
  const w = stageRelayWorld(2);
  try {
    const [victim, near] = w.targets;
    const mark = { actorId: "caster", talent: "Spreading Omen" };
    // Two SEPARATE ordered rules, each its own queued read-modify-write against a fresh read —
    // the second used to read a reconcile-emptied list and commit over the first.
    const place = (t) => env.edhaOwnerListQueue(w.owner, "omens", async () => {
      const cur = env.edhaOwnerList(w.owner, "omens", "omen");
      if (cur.some((e) => e.uuid === t.uuid)) return;
      if (!(await env.edhaWriteStatusMark(t, "omen", mark))) return;
      await env.edhaSetOwnerList(w.owner, "omens", [...cur, { id: `e-${t.id}`, uuid: t.uuid, name: t.name }]);
    });
    await place(victim);
    await place(near);
    eq(w.owner.flags["edha-content"].lists.omens.map((e) => e.name), ["Target 1", "Target 2"]);
    // ^ the second placement must not commit over the first (silent ledger loss; the card reads 1/2)
  } finally { w.undo(); }
});
