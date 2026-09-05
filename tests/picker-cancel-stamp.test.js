/* R-69 — a CANCELLED picker must leave no once-per-scene stamp (TODO_REPO_HYGIENE #36).
 *
 * Bench run 25 measured it live: Final Decree → prohibition picker → Cancel refunded the
 * Investiture correctly (4 → 1 → 4, no card, no `decree` flag) but left
 * `sceneOnce.<itemId> === true`. The scene's only use was spent on a dialog that never resolved,
 * because `edhaDecreeUse` stamped on its FIRST line, before the picker opened.
 *
 * Ben answered R-69 on 2026-09-05 16:30: **"stamp only after a successful pick."** Cost and use
 * must agree — a cancel costs nothing and burns nothing.
 *
 * R-61's polarity is NOT what changed. A *repeat* use is still vetoed BEFORE the system charges
 * (the `edha-decree` preUseItem hook, pinned below). R-69 is only about the ordering INSIDE the
 * use flow, between the stamp and a cancellable prompt.
 *
 * Three layers here:
 *   1. behavioural — drive edhaDecreeUse with a stubbed pick: null → no stamp, a value → stamp;
 *   2. the veto — a stamped actor is still refused pre-cost (R-61 unchanged);
 *   3. a GENERIC source-shape pin — no function in the engine may reach an `edhaRefundCost(...)`
 *      cancel guard with an `edhaStampSceneOnce(...)` already behind it. `edhaRefundCost` + an
 *      early `return` is this engine's idiom for "the user backed out, undo the cost", so a stamp
 *      standing in front of one is exactly the R-69 defect wherever it appears. That layer is what
 *      makes this a primitive-level regression rather than a one-talent patch: it fails for the
 *      next handler that grows a picker, not just for the Decree.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, readEngineSource, codeOnly, withStubs } = require("./harness.js");

const ITEM_ID = "decree-item";

/* A talent item carrying exactly ONE rule: `edha-decree`. Shaped for edhaEventRules (hasEvents /
 * enabledEvents) so edhaRuleOf and edhaIsTalent both resolve it, which is what the pre-cost veto
 * hook needs. */
function decreeItem(owner, handler = {}) {
  const h = { type: "edha-decree", rangeColor: "blue", ...handler };
  return {
    id: ITEM_ID, name: "Final Decree", type: "talent", uuid: `Item.${ITEM_ID}`, actor: owner,
    hasEvents: () => true,
    enabledEvents: [{ handler: h }],
    system: { events: [{ handler: h }] },
  };
}

/* The world both the veto and the use flow read: a caster token and ONE live hostile inside
 * Attunement Range (the veto refuses without either, so it has to be stubbed for the R-61 case
 * as much as for the use case). */
const worldStubs = {
  edhaCasterToken: () => ({ id: "tok-owner" }),
  edhaAttuneFtColor: () => 30,
  edhaTokensWithin: () => [{ name: "Bench Target", actor: { uuid: "Actor.foe", name: "Bench Target", system: { resources: { hea: { value: 10 } } } } }],
  edhaDisposHostile: () => true,
};

/* Everything else edhaDecreeUse reaches out to, EXCEPT edhaStampSceneOnce — that one stays real,
 * because the flag it writes is the whole measurement. `pick` is the stubbed picker result. */
function decreeStubs(pick, counters) {
  return {
    ...worldStubs,
    edhaOwnerList: () => [],
    edhaToggleStatus: async () => {},
    edhaTreeCard: (...a) => { counters.cards.push(a); },
    edhaPickProhibition: async () => { counters.picks++; return pick; },
    edhaRefundCost: async () => { counters.refunds++; },
  };
}

async function runDecree(env, pick, handler = {}) {
  const owner = mockActor({ name: "Bench — Blue", id: "owner-1" });
  const item = decreeItem(owner, handler);
  const counters = { picks: 0, refunds: 0, cards: [] };
  await withStubs(env, decreeStubs(pick, counters), () => env.edhaDecreeUse(item, item.enabledEvents[0].handler));
  return {
    owner, item, counters,
    stamped: owner.getFlag("edha-content", `sceneOnce.${ITEM_ID}`) === true,
    decree: owner.getFlag("edha-content", "decree") ?? null,
  };
}

/* ---- 1. the behaviour R-69 rules on --------------------------------------------------------- */

test("R-69: a CANCELLED prohibition pick writes NO sceneOnce stamp (the run-25 defect)", async () => {
  const env = loadEngine();
  const r = await runDecree(env, null);
  assert.strictEqual(r.counters.picks, 1, "the picker must actually have opened");
  assert.strictEqual(r.stamped, false, "a cancel must leave the scene's use intact — this is R-69");
  assert.strictEqual(r.decree, null, "a cancel must arm no Decree");
  assert.strictEqual(r.counters.refunds, 1, "the refund half was already correct and must not regress");
  assert.strictEqual(r.counters.cards.length, 0, "a cancel posts no card");
});

test("R-69: a dismissed window (undefined, not null) also leaves no stamp", async () => {
  /* edhaDialogPick resolves `undefined` when the window is dismissed and `null` for a parse-less
   * Cancel (tests/dialog-pick-box.test.js). Both are falsy; both must burn nothing. */
  const env = loadEngine();
  const r = await runDecree(env, undefined);
  assert.strictEqual(r.stamped, false);
  assert.strictEqual(r.counters.refunds, 1);
});

test("R-69: a SUCCESSFUL pick still stamps sceneOnce and arms the Decree", async () => {
  const env = loadEngine();
  const r = await runDecree(env, { kind: "move", text: "move" });
  assert.strictEqual(r.stamped, true, "the once-per-scene use is spent only when the pick resolved");
  assert.strictEqual(r.counters.refunds, 0, "a resolved use keeps its cost");
  assert.ok(r.decree && r.decree.proh, "the Decree flag is armed with the chosen prohibition");
  assert.strictEqual(r.decree.itemId, ITEM_ID);
  assert.strictEqual(r.counters.cards.length, 1, "the resolved use posts its card");
});

test("R-69: `oncePerScene: false` stamps nothing even on a successful pick (R-61 polarity kept)", async () => {
  const env = loadEngine();
  const r = await runDecree(env, { kind: "move", text: "move" }, { oncePerScene: false });
  assert.strictEqual(r.stamped, false, "the stamp still carries the SAME polarity as this rule's own veto");
  assert.ok(r.decree, "the use itself resolves normally");
});

/* ---- 2. R-61 is untouched: a repeat is still refused BEFORE the cost ------------------------- */

/* Every `cosmere-rpg.preUseItem` veto, run against this item. Only the `edha-decree` one engages —
 * the rest early-return on their own rule type — so a `false` anywhere in the list is the Decree's
 * pre-cost refusal. */
function preUseVerdicts(env, item) {
  return withStubs(env, worldStubs, () =>
    env.__hooks.on.filter((h) => h.name === "cosmere-rpg.preUseItem").map((h) => h.fn(item)));
}

test("R-61 unchanged: an already-stamped Decree is vetoed pre-cost (the anti-repeat gate survives)", async () => {
  const env = loadEngine();
  const clean = mockActor({ name: "Bench — Blue", id: "owner-2" });
  assert.ok(!(await preUseVerdicts(env, decreeItem(clean))).includes(false),
    "a fresh Decree must not be refused");
  const burnt = mockActor({ name: "Bench — Blue", id: "owner-3", flags: { sceneOnce: { [ITEM_ID]: true } } });
  assert.ok((await preUseVerdicts(env, decreeItem(burnt))).includes(false),
    "a stamped Decree must still be refused BEFORE the system charges — that is R-61, not R-69");
});

test("R-69 end to end: cancel, then use again in the same scene — the second use is NOT refused", async () => {
  const env = loadEngine();
  const owner = mockActor({ name: "Bench — Blue", id: "owner-4" });
  const item = decreeItem(owner);
  const counters = { picks: 0, refunds: 0, cards: [] };
  await withStubs(env, decreeStubs(null, counters), () => env.edhaDecreeUse(item, item.enabledEvents[0].handler));
  assert.ok(!(await preUseVerdicts(env, item)).includes(false),
    "pre-fix this was refused: the cancel had stamped, so the scene's only use was gone");
  await withStubs(env, decreeStubs({ kind: "move", text: "move" }, counters), () => env.edhaDecreeUse(item, item.enabledEvents[0].handler));
  assert.strictEqual(owner.getFlag("edha-content", `sceneOnce.${ITEM_ID}`), true);
  assert.ok((await preUseVerdicts(env, item)).includes(false), "and NOW a third use is refused");
});

/* ---- 3. the generic pin: no stamp may stand in front of a cancel refund ---------------------- */

/* Split the comment-stripped engine at every `function` keyword. Every stamp/refund pair this
 * check cares about sits in one such segment (the Decree's stamp, picker and refund guard are
 * eight consecutive statements with no nested `function` between them — the `.filter(t => …)` in
 * the middle is an arrow, which does not split). Coarse on purpose: a segment can only ever be
 * SMALLER than the real function body plus its trailing sibling code, so the check cannot invent
 * a pairing across two unrelated functions. */
function functionSegments(src) {
  const starts = [];
  const re = /\bfunction\b/g;
  let m;
  while ((m = re.exec(src))) starts.push(m.index);
  return starts.map((s, i) => ({ start: s, text: src.slice(s, starts[i + 1] ?? src.length) }));
}

function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

test("R-69 (generic): no engine function stamps sceneOnce BEFORE a cancel-refund guard", () => {
  const src = codeOnly(readEngineSource());
  const offenders = [];
  for (const seg of functionSegments(src)) {
    const stamp = seg.text.indexOf("edhaStampSceneOnce(");
    if (stamp < 0) continue;
    // Only a refund that ABORTS the use is an R-69 hazard; that idiom is `edhaRefundCost(item);`
    // followed by a `return` on the same line (every cancel guard in this engine is written that
    // way — see the Trade-Routes / Charge / zone guards).
    const guard = /edhaRefundCost\([^)]*\)[^\n]*\breturn\b/g;
    let g;
    while ((g = guard.exec(seg.text))) {
      if (g.index > stamp) offenders.push(`line ${lineOf(src, seg.start + g.index)}: ${seg.text.slice(g.index, g.index + 60).trim()}`);
    }
  }
  assert.deepStrictEqual(offenders, [],
    "a cancel guard reached with a sceneOnce stamp already written burns the scene's use for nothing (R-69):\n  " + offenders.join("\n  "));
});

test("R-69 (shape): edhaDecreeUse's stamp comes AFTER its prohibition picker and its refund guard", () => {
  const src = codeOnly(readEngineSource());
  const fnStart = src.indexOf("async function edhaDecreeUse(item, h)");
  assert.ok(fnStart >= 0, "edhaDecreeUse not found — engine shape changed");
  const body = src.slice(fnStart, src.indexOf("\n}", fnStart));
  const pick = body.indexOf("edhaPickProhibition(");
  const refund = body.indexOf("edhaRefundCost(");
  const stamp = body.indexOf("edhaStampSceneOnce(");
  assert.ok(pick >= 0 && refund >= 0 && stamp >= 0, "picker, refund guard and stamp must all still be here");
  assert.ok(stamp > pick, "R-69: the stamp must follow the pick, never precede it");
  assert.ok(stamp > refund, "R-69: the stamp must follow the cancel refund guard");
  assert.ok(/if\s*\(\s*h\.oncePerScene\s*!==\s*false\s*\)\s*await edhaStampSceneOnce\(owner,\s*item\)/.test(body),
    "R-61: the stamp keeps this rule's own veto polarity — moving it must not make it unconditional");
});
