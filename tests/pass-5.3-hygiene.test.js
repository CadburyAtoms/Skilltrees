/* ENGINE PASS 5.3 (hygiene campaign, cards/costs/dialogs) — pinned regression cases for the new
 * shared primitives: edhaSceneOnceUsed / edhaStampSceneOnce (Job 7, R-61), edhaSpendResource /
 * edhaGainResource (Job 6), edhaGmIds (Job 5, R-62), and edhaTreeCard's whisper option (Job 4, R-67).
 * Each case pins the CONTRACT the migration promised — zero live-behavior change on the read side,
 * one explicit fix (edha-decree's stamp polarity) — not just "the function exists".
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, withStubs, captureChat, eq } = require("./harness.js");

let _env = null;
function env() { return _env || (_env = loadEngine()); }

/* ---------------------------------------------------------------------------------------------
 * edhaSceneOnceUsed / edhaStampSceneOnce (Job 7, R-61)
 * ------------------------------------------------------------------------------------------- */

test("edhaSceneOnceUsed: neither sceneOnce nor legacy detonateUsed set -> false", () => {
  const e = env();
  const actor = mockActor({ id: "a1" });
  assert.strictEqual(e.edhaSceneOnceUsed(actor, { id: "item1" }), false);
});

test("edhaSceneOnceUsed: reads the CURRENT key (sceneOnce.<id>)", () => {
  const e = env();
  const actor = mockActor({ id: "a2", flags: { sceneOnce: { item2: true } } });
  assert.strictEqual(e.edhaSceneOnceUsed(actor, { id: "item2" }), true);
  // a DIFFERENT item id on the same actor is untouched — this is per-item, not per-actor
  assert.strictEqual(e.edhaSceneOnceUsed(actor, { id: "item2-other" }), false);
});

test("edhaSceneOnceUsed: falls back to the LEGACY detonateUsed.<id> key (R-61 merge)", () => {
  const e = env();
  const actor = mockActor({ id: "a3", flags: { detonateUsed: { item3: true } } });
  assert.strictEqual(e.edhaSceneOnceUsed(actor, { id: "item3" }), true, "a scene already mid-flight when this shipped must keep gating on its legacy stamp");
});

test("edhaSceneOnceUsed: sceneOnce wins when BOTH keys happen to be present", () => {
  const e = env();
  const actor = mockActor({ id: "a4", flags: { sceneOnce: { item4: true }, detonateUsed: { item4: false } } });
  assert.strictEqual(e.edhaSceneOnceUsed(actor, { id: "item4" }), true);
});

test("edhaStampSceneOnce: writes ONLY sceneOnce.<id>, never touches detonateUsed", async () => {
  const e = env();
  const actor = mockActor({ id: "a5" });
  await e.edhaStampSceneOnce(actor, { id: "item5" });
  assert.strictEqual(actor.getFlag("edha-content", "sceneOnce.item5"), true);
  assert.strictEqual(actor.getFlag("edha-content", "detonateUsed.item5"), undefined, "the stamp must not write the legacy namespace — it is read-only from here on");
  assert.strictEqual(e.edhaSceneOnceUsed(actor, { id: "item5" }), true, "and the gate reads the freshly-written key straight back");
});

test("edhaStampSceneOnce: a rejected setFlag (no perms) is swallowed, not thrown", async () => {
  const e = env();
  const actor = { id: "a6", setFlag: async () => { throw new Error("no perms"); } };
  await assert.doesNotReject(() => e.edhaStampSceneOnce(actor, { id: "item6" }));
});

/* THE R-61 FIX (source-pinned, matching the codebase's established convention for a single-call-site
 * control-flow fix — e.g. tests/disposition-failclosed.test.js): edhaDecreeUse used to stamp
 * sceneOnce UNCONDITIONALLY while its OWN veto (above) gated on `h.oncePerScene !== false`. The fix
 * is that the stamp call is now wrapped in the SAME condition. edhaDecreeUse is a big canvas/token
 * flow (picker dialogs, foe sweeps) that is impractical to unit-test end-to-end here — the load-
 * bearing claim is the wrapping itself, which this pins directly against the source.
 *
 * 2026-09-05 (R-69, TODO #36): the stamp MOVED — it now sits after the prohibition picker's
 * `if (!proh)` refund guard instead of on the function's first line, so a cancelled pick burns
 * nothing. The polarity this case pins is unchanged; only the offset is, so the fixed 400-char
 * window became a false failure and is now the whole function body. The ORDER is pinned in
 * tests/picker-cancel-stamp.test.js, which also drives edhaDecreeUse end-to-end with a stubbed
 * picker — "impractical to unit-test" above is no longer quite true. */
test("edhaDecreeUse: the sceneOnce stamp is now gated on the SAME polarity as its own veto", () => {
  const { readEngineSource, codeOnly } = require("./harness.js");
  const src = codeOnly(readEngineSource());
  const fnStart = src.indexOf("async function edhaDecreeUse(item, h)");
  assert.ok(fnStart >= 0, "edhaDecreeUse not found — engine shape changed");
  const body = src.slice(fnStart, src.indexOf("\n}", fnStart));
  assert.ok(
    /if\s*\(\s*h\.oncePerScene\s*!==\s*false\s*\)\s*await edhaStampSceneOnce\(owner,\s*item\)/.test(body),
    "edhaDecreeUse must gate its stamp on `h.oncePerScene !== false` — an unconditional stamp regressed R-61"
  );
});

/* ---------------------------------------------------------------------------------------------
 * edhaSpendResource / edhaGainResource (Job 6)
 * ------------------------------------------------------------------------------------------- */

function resActor(id, value, max) {
  const updates = [];
  return {
    id, uuid: `Actor.${id}`, system: { resources: { inv: { value, max: { value: max } } } },
    async update(patch) { updates.push(patch); const v = patch["system.resources.inv.value"]; if (v !== undefined) this.system.resources.inv.value = v; },
    _updates: updates,
  };
}

test("edhaSpendResource: clamps at 0 (never negative)", async () => {
  const e = env();
  const a = resActor("s1", 2, 10);
  await e.edhaSpendResource(a, "inv", 5);
  assert.strictEqual(a.system.resources.inv.value, 0);
});

test("edhaSpendResource: an actor sitting at EXACTLY 0 is read correctly (falsy-zero-safe)", async () => {
  const e = env();
  const a = resActor("s2", 0, 10);
  await e.edhaSpendResource(a, "inv", 3);
  assert.strictEqual(a.system.resources.inv.value, 0, "0 - 3 clamped to 0, not skipped as though the actor's current value were 'unset'");
});

test("edhaSpendResource: n <= 0 is a no-op — no update() call at all", async () => {
  const e = env();
  const a = resActor("s3", 5, 10);
  await e.edhaSpendResource(a, "inv", 0);
  await e.edhaSpendResource(a, "inv", -1);
  assert.strictEqual(a._updates.length, 0);
  assert.strictEqual(a.system.resources.inv.value, 5);
});

test("edhaSpendResource: a normal spend subtracts exactly", async () => {
  const e = env();
  const a = resActor("s4", 7, 10);
  await e.edhaSpendResource(a, "inv", 3);
  assert.strictEqual(a.system.resources.inv.value, 4);
});

test("edhaGainResource: clamps at the resource's derived max", async () => {
  const e = env();
  const a = resActor("g1", 8, 10);
  await e.edhaGainResource(a, "inv", 5);
  assert.strictEqual(a.system.resources.inv.value, 10);
});

test("edhaGainResource: with no readable max, the gain is uncapped at cur + n", async () => {
  const e = env();
  const a = { id: "g2", system: { resources: { inv: { value: 3 } } }, async update(patch) { this.system.resources.inv.value = patch["system.resources.inv.value"]; } };
  await e.edhaGainResource(a, "inv", 4);
  assert.strictEqual(a.system.resources.inv.value, 7);
});

test("edhaGainResource: n <= 0 is a no-op", async () => {
  const e = env();
  const a = resActor("g3", 5, 10);
  await e.edhaGainResource(a, "inv", 0);
  assert.strictEqual(a._updates.length, 0);
});

/* ---------------------------------------------------------------------------------------------
 * edhaGmIds (Job 5, R-62)
 * ------------------------------------------------------------------------------------------- */

function gmWorld(users) { return { users: Object.assign([...users], { filter: Array.prototype.filter }) }; }

test("edhaGmIds(): all GMs, including offline ones", () => {
  const e = env();
  const users = [
    { id: "gm-on", isGM: true, active: true },
    { id: "gm-off", isGM: true, active: false },
    { id: "player", isGM: false, active: true },
  ];
  const undo = stageWorld(e, { users: gmWorld(users).users });
  try { eq(e.edhaGmIds().sort(), ["gm-off", "gm-on"]); }
  finally { undo.undo(); }
});

test("edhaGmIds({ activeOnly: true }): online GMs only", () => {
  const e = env();
  const users = [
    { id: "gm-on", isGM: true, active: true },
    { id: "gm-off", isGM: true, active: false },
    { id: "player", isGM: false, active: true },
  ];
  const undo = stageWorld(e, { users: gmWorld(users).users });
  try { eq(e.edhaGmIds({ activeOnly: true }), ["gm-on"]); }
  finally { undo.undo(); }
});

test("edhaGmIds(): no game.users -> empty array, never throws", () => {
  const e = env();
  const undo = stageWorld(e, { users: undefined });
  try { eq(e.edhaGmIds(), []); }
  finally { undo.undo(); }
});

/* ---------------------------------------------------------------------------------------------
 * edhaTreeCard whisper option (Job 4, R-67) — additive: default behavior is unchanged, whisper
 * is opt-in and only appears in the ChatMessage payload when requested.
 * ------------------------------------------------------------------------------------------- */

test("edhaTreeCard: default (no opts) posts publicly — no whisper key at all", () => {
  const e = env();
  const cards = captureChat(e);
  const owner = mockActor({ id: "tc1", name: "Owner" });
  e.edhaTreeCard(owner, null, "<p>hi</p>");
  assert.strictEqual(cards.length, 1);
  assert.strictEqual("whisper" in cards[0].data, false);
  assert.strictEqual(cards[0].content, '<div class="edha-burst-card"><p>hi</p></div>');
});

test("edhaTreeCard: rolls defaults to [] when omitted/null", () => {
  const e = env();
  const cards = captureChat(e);
  const owner = mockActor({ id: "tc2", name: "Owner2" });
  e.edhaTreeCard(owner, null, "<p>x</p>");
  eq(cards[0].data.rolls, []);
});

test("edhaTreeCard({ whisper: true }): whispers to the GM list, additive only", () => {
  const e = env();
  const cards = captureChat(e);
  const owner = mockActor({ id: "tc3", name: "Owner3" });
  const users = [{ id: "gm1", isGM: true, active: true }];
  const undo = stageWorld(e, { users: gmWorld(users).users });
  try {
    e.edhaTreeCard(owner, [{ total: 5 }], "<p>whispered</p>", { whisper: true });
    assert.strictEqual(cards.length, 1);
    eq(cards[0].data.whisper, ["gm1"]);
    eq(cards[0].data.rolls, [{ total: 5 }]);
  } finally { undo.undo(); }
});
