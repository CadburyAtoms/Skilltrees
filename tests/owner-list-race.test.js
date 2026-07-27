/* REGRESSION — the H3 owner-list write race (bench run 4, 2026-07-26m defect 2).
 *
 * One Necrotic Cascade dropping three adversaries in the same tick ran three concurrent harvest
 * placements. Each was a read-modify-write on flags.edha-content.lists.remains with no
 * serialisation: all three read the SAME stored list, so the last write won — two cards both said
 * "(1/2)" and the ledger ended holding ONE entry where two should have survived (cap @tier = 2,
 * eviction oldest). Sequential drops accumulated correctly — concurrency, not cap.
 *
 * The fix is `edhaOwnerListQueue(owner, key, task)`: a per-owner-per-key promise queue in the H3
 * core. Every ledger mutation enters the queue, re-READS inside it, and commits before the next
 * mutation reads. These cases pin: (1) the exact bench scenario — N same-tick placements all
 * survive, in order, with cap/eviction honoured; (2) the double-spend shape — two same-tick
 * spends consume two DIFFERENT entries; (3) the chain never wedges after a failed task; (4) the
 * queue isolates owners and keys from each other.
 *
 * The fake owner's setFlag awaits a macrotask before committing, which is what makes the OLD
 * unserialised interleaving reproducible: without the queue, every concurrent task reads the
 * same pre-write list (the failure the bench measured), and test (1) here fails with a
 * one-entry ledger.
 */
"use strict";
const assert = require("assert");
const { loadEngine } = require("./harness.js");

const env = loadEngine();

// A minimal actor whose flag write has the async gap real Foundry writes have.
function fakeOwner(uuid = "Actor.race-owner") {
  return {
    uuid, id: uuid.split(".").pop(), name: "Race Owner",
    flags: { "edha-content": { lists: {} } },
    async setFlag(scope, key, value) {
      await new Promise((r) => setTimeout(r, 1));   // the server round-trip
      // key is e.g. "lists.remains" — walk it under the scope namespace.
      const parts = key.split(".");
      let o = this.flags[scope] ?? (this.flags[scope] = {});
      for (const k of parts.slice(0, -1)) o = o[k] ?? (o[k] = {});
      o[parts[parts.length - 1]] = JSON.parse(JSON.stringify(value));
      return this;
    },
  };
}

// The executor's place-shaped RMW, exactly as it now runs INSIDE the queue: fresh read →
// dup-check → push (cap/evict) → commit.
function placeTask(owner, key, entry, cap) {
  return env.edhaOwnerListQueue(owner, key, async () => {
    const cur = env.edhaOwnerList(owner, key);
    if (cur.some((e) => e.uuid === entry.uuid)) return "dup";
    const res = env.edhaListPush(cur, entry, { cap, evict: "oldest" });
    await owner.setFlag("edha-content", `lists.${key}`, res.list);
    return res.list.length;
  });
}

test("the bench scenario: three same-tick placements, cap 2, evict oldest -> TWO survive (V2, V3)", async () => {
  const owner = fakeOwner();
  await Promise.all([
    placeTask(owner, "remains", { id: "e1", uuid: "Actor.v1", name: "V1" }, 2),
    placeTask(owner, "remains", { id: "e2", uuid: "Actor.v2", name: "V2" }, 2),
    placeTask(owner, "remains", { id: "e3", uuid: "Actor.v3", name: "V3" }, 2),
  ]);
  const list = owner.flags["edha-content"].lists.remains;
  assert.deepStrictEqual(list.map((e) => e.name), ["V2", "V3"],
    `expected the two newest to survive (oldest evicted at cap 2), got [${list.map((e) => e.name)}]`);
});

test("under the cap, EVERY same-tick placement survives (the lost-entry shape, directly)", async () => {
  const owner = fakeOwner();
  await Promise.all(["a", "b", "c"].map((n, i) =>
    placeTask(owner, "remains", { id: `e${i}`, uuid: `Actor.${n}`, name: n.toUpperCase() }, 5)));
  assert.deepStrictEqual(owner.flags["edha-content"].lists.remains.map((e) => e.name), ["A", "B", "C"]);
});

test("same-tick duplicate placements: the dup-check inside the queue catches the second", async () => {
  const owner = fakeOwner();
  const results = await Promise.all([
    placeTask(owner, "remains", { id: "e1", uuid: "Actor.same", name: "Same" }, 5),
    placeTask(owner, "remains", { id: "e2", uuid: "Actor.same", name: "Same" }, 5),
  ]);
  assert.deepStrictEqual(results.sort(), [1, "dup"].sort());
  assert.strictEqual(owner.flags["edha-content"].lists.remains.length, 1);
});

test("two same-tick spends consume two DIFFERENT entries (not the same head twice)", async () => {
  const owner = fakeOwner();
  owner.flags["edha-content"].lists.remains = [
    { id: "e1", uuid: null, name: "V1" },   // uuid null → the mark-wins reconcile keeps them
    { id: "e2", uuid: null, name: "V2" },
  ];
  const spendTask = () => env.edhaOwnerListQueue(owner, "remains", async () => {
    const cur = env.edhaOwnerList(owner, "remains");
    if (!cur.length) return null;
    const spent = cur.shift();
    await owner.setFlag("edha-content", "lists.remains", cur);
    return spent.name;
  });
  const spent = await Promise.all([spendTask(), spendTask()]);
  assert.deepStrictEqual(spent.sort(), ["V1", "V2"]);
  assert.deepStrictEqual(owner.flags["edha-content"].lists.remains, []);
});

test("a failed task never wedges the chain — the next mutation still runs", async () => {
  const owner = fakeOwner();
  const boom = env.edhaOwnerListQueue(owner, "remains", async () => { throw new Error("boom"); });
  await assert.rejects(boom, /boom/);
  await placeTask(owner, "remains", { id: "e1", uuid: "Actor.v1", name: "V1" }, 5);
  assert.strictEqual(owner.flags["edha-content"].lists.remains.length, 1);
});

test("queues are per-owner-per-key: other owners and other ledgers are not serialised behind this one", async () => {
  const a = fakeOwner("Actor.a"), b = fakeOwner("Actor.b");
  const order = [];
  let releaseA;
  const gate = new Promise((r) => { releaseA = r; });
  const slow = env.edhaOwnerListQueue(a, "remains", async () => { await gate; order.push("a-remains"); });
  await env.edhaOwnerListQueue(a, "charges", async () => { order.push("a-charges"); });
  await env.edhaOwnerListQueue(b, "remains", async () => { order.push("b-remains"); });
  releaseA();
  await slow;
  // The blocked a-remains task finished LAST; the other queues never waited on it.
  assert.deepStrictEqual(order, ["a-charges", "b-remains", "a-remains"]);
});
