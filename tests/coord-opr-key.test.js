/* Fix pass 9 (TODO 72), defect 1 — the once-per-round coordRound store must be KEY-SAFE for any
 * caller, because Foundry expands dotted keys at every depth of an update payload.
 *
 * The defect, root-caused at bench run 40 and re-derived here from the Foundry source rather than
 * from the report: `edhaPromptPickClick` marks its `once: "round"` budget with the talent's UUID —
 * `edhaCoordOPRMark(owner, item.uuid, "_pick")` — so the write was
 * `setFlag("edha-content", "coordRound", { "Actor.<id>.Item.<id>": { _pick: 4 } })`.
 * `ClientDatabaseBackend#_updateDocuments` runs `foundry.utils.expandObject(update)` on EVERY update
 * (client/data/client-backend.mjs:208) and that helper recurses into every plain object it meets
 * (common/utils/helpers.mjs:495, `_expand`), so the document stored
 * `coordRound.Actor.<id>.Item.<id>._pick` while `edhaCoordOPRAllowed` read the FLAT key and got
 * `undefined` — for ever. Measured live: after two accepted Unnerving Approach picks in round 4 the
 * flag read `{"Actor":{"2vSISUi8NZ66KM9B":{"Item":{"Lt4bBgGwLZx7TyiZ":{"_pick":4}}}}}` and a third
 * pick in the same round still fired. Blast radius: all three `edha-prompt-pick` rules that carry
 * `once: "round"` (Black's Unnerving Approach and Puppeteer, plus Unnerving Approach's adversary
 * twin). It hid because every other `edhaCoordOPR*` caller passes a talent name or an item id, and
 * no name, ability name or id in `data/` carries a dot.
 *
 * The fix reuses the EXISTING ledger-boundary escape `edhaFlagKey` (`.` → `_`), which the
 * ambush-belief and `trigRound` ledgers already run for exactly this reason; `coordRound` is the
 * third instance of the class. BOTH sides run it, so any caller may pass any string, and it is a
 * no-op on every dot-free key already persisted. Reversion shown failing in the PR body: restore the
 * pre-fix pair (flat read, raw mark) and three of the six cases below fail.
 *
 * `setFlag` here APPLIES Foundry's expansion, which the harness's plain mock does not — without
 * that the defect is invisible headlessly, which is exactly why it took a live bench to find.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, setProp, withStubs } = require("./harness.js");

/* foundry.utils.expandObject, modelled: recursive, every plain object, dot-notation keys become
 * nested paths (common/utils/helpers.mjs:495). */
function expandLikeFoundry(value, depth = 0) {
  if (depth > 32) throw new Error("Maximum object expansion depth exceeded");
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => expandLikeFoundry(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) setProp(out, k, expandLikeFoundry(v, depth + 1));
  return out;
}

/* An actor whose setFlag stores what FOUNDRY would store, not what it was handed. */
function foundryActor(opts = {}) {
  const actor = mockActor(opts);
  const raw = actor.setFlag;
  actor.setFlag = async (scope, key, value) => raw(scope, key, expandLikeFoundry(value));
  return actor;
}

const UUID = "Actor.2vSISUi8NZ66KM9B.Item.Lt4bBgGwLZx7TyiZ";
const store = (a) => a.getFlag("edha-content", "coordRound");

/* ---- 1. THE FIX — a dotted key (an item uuid) marks and then GATES ---------------------------- */

test("a dotted key marks the round and edhaCoordOPRAllowed then refuses in that round", async () => {
  const env = loadEngine();
  const owner = foundryActor({ name: "Bench — Black" });
  await withStubs(env, { edhaCombatRoundOf: () => 4 }, async () => {
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, UUID, "_pick"), true, "unmarked: the first pick is allowed");
    await env.edhaCoordOPRMark(owner, UUID, "_pick");
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, UUID, "_pick"), false,
      "THE FIX: the second pick in the same round is refused");
  });
  assert.strictEqual(store(owner).Actor, undefined, "a dotted key is not expanded away into an Actor branch");
  assert.deepStrictEqual(Object.keys(store(owner)), ["Actor_2vSISUi8NZ66KM9B_Item_Lt4bBgGwLZx7TyiZ"],
    "the mark lands under ONE flat, sanitised key");
});

test("the budget is per ROUND — the same dotted key is allowed again once the round moves on", async () => {
  const env = loadEngine();
  const owner = foundryActor({ name: "Bench — Black" });
  let round = 4;
  await withStubs(env, { edhaCombatRoundOf: () => round }, async () => {
    await env.edhaCoordOPRMark(owner, UUID, "_pick");
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, UUID, "_pick"), false, "round 4: spent");
    round = 5;
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, UUID, "_pick"), true, "round 5: available again");
  });
});

/* ---- 2. NEGATIVE CONTROL — the eight dot-free callers are byte-identical --------------------- */

test("a dot-free caller (a talent name + _react) is unchanged: same key, same gate", async () => {
  const env = loadEngine();
  const owner = foundryActor({ name: "Bench — White" });
  await withStubs(env, { edhaCombatRoundOf: () => 2 }, async () => {
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, "Concordant Presence", "_react"), true);
    await env.edhaCoordOPRMark(owner, "Concordant Presence", "_react");
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, "Concordant Presence", "_react"), false);
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, "Shared Conviction", "_react"), true,
      "…and a different talent's budget is untouched");
  });
  assert.deepStrictEqual(store(owner), { "Concordant Presence": { _react: 2 } },
    "the stored shape for a dot-free caller is exactly what it always was");
});

/* ---- 3. Out of combat there is no round, so nothing gates and nothing is written -------------- */

test("out of combat the gate is open and no mark is written", async () => {
  const env = loadEngine();
  const owner = foundryActor({ name: "Bench — Black" });
  await withStubs(env, { edhaCombatRoundOf: () => null }, async () => {
    await env.edhaCoordOPRMark(owner, UUID, "_pick");
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, UUID, "_pick"), true);
  });
  assert.strictEqual(store(owner), undefined, "no flag write out of combat");
});

/* ---- 4. The one-time legacy tolerance — a document stamped BEFORE the fix still gates ---------- */

test("a document already carrying the EXPANDED (pre-fix) shape is still read as spent this round", async () => {
  const env = loadEngine();
  const owner = foundryActor({ name: "Bench — Black" });
  // Exactly what bench run 40 read off the live actor, verbatim.
  await owner.setFlag("edha-content", "coordRound", { [UUID]: { _pick: 4 } });
  assert.deepStrictEqual(store(owner), { Actor: { "2vSISUi8NZ66KM9B": { Item: { Lt4bBgGwLZx7TyiZ: { _pick: 4 } } } } },
    "control: that IS the shape Foundry stores for a dotted key");
  await withStubs(env, { edhaCombatRoundOf: () => 4 }, async () => {
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, UUID, "_pick"), false,
      "the legacy path read keeps a budget spent this round spent across the F5");
  });
  await withStubs(env, { edhaCombatRoundOf: () => 5 }, async () => {
    assert.strictEqual(env.edhaCoordOPRAllowed(owner, UUID, "_pick"), true, "…and it still expires with the round");
  });
});

/* ---- 5. The escape is the SHARED one ---------------------------------------------------------------------- */

test("the store runs the SHARED ledger escape (edhaFlagKey), not a second one of its own", () => {
  const env = loadEngine();
  assert.strictEqual(env.edhaFlagKey("Concordant Presence"), "Concordant Presence", "identity on a dot-free name");
  assert.strictEqual(env.edhaFlagKey("_react"), "_react");
  assert.strictEqual(env.edhaFlagKey(UUID), "Actor_2vSISUi8NZ66KM9B_Item_Lt4bBgGwLZx7TyiZ");
  const src = require("./harness.js").codeOnly(require("./harness.js").readEngineSource());
  const body = src.slice(src.indexOf("function edhaCoordOPRAllowed"), src.indexOf("function edhaKeptD20Nat"));
  assert.ok(/edhaFlagKey\(name\)/.test(body) && /edhaFlagKey\(key\)/.test(body),
    "both sides of the coordRound store escape through the shared helper");
});
