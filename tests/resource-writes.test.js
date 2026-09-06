/* REGRESSION — THE RESOURCE-PATH WRITER (TODO_REPO_HYGIENE #13, 2026-09-06).
 *
 * `scripts/engine-idiom-ratchet.json`'s `resourceWrite` key counted hand-rolled
 * `"system.resources.<id>.value"` update keys: 17 at the freeze, 12 when this item was dispatched,
 * 0 now. The item's premise was that the survivors were spends waiting for `edhaSpendResource` /
 * `edhaConsumeCost`. **Measurement says none of them was.** Every cost deduction in the engine
 * already went through those two; the twelve were gains, heals, restores, a lifesteal, a
 * revive-to-1, a Colossus max-HP override, and one drain whose classification is an OPEN RULING.
 *
 * That matters because of #28b, which landed the day before: an update's `options` are where a
 * write says what KIND of write it is, and `edhaIsSpend` reads exactly that. A hand-rolled
 * `actor.update({...})` with no options says nothing at all. So the twelve moved onto
 * `edhaResourceWrite(actor, resource, changes, options)` — the writer that OWNS the path and takes
 * the classification as an argument.
 *
 * ⚠ WHAT THIS FILE GUARDS, in the order the cases run:
 *   1. the writer's contract — the path it builds, that it passes `options` through UNCHANGED
 *      (so a spend stamp survives it), and that it neither clamps nor catches;
 *   2. the bookkeeping direction — a migrated heal/gain declares itself, and `edhaIsSpend` reads
 *      that declaration;
 *   3. **the R-72 pin, FLIPPED 2026-09-06** — `edhaDrainFocus` now carries `edhaBookkeepingTag`
 *      alongside its focus-watch skip. This case used to assert the OPPOSITE ("a bookkeeping tag
 *      there would answer an open ruling by the back door, and this case fails if one appears").
 *      **R-72 is answered — Ben (b): an involuntary drain is NOT a spend** — so the absence of the
 *      tag is now the regression;
 *   4. **the same flip at H10** — the Investiture branch's `op === "drain" ? edhaSpendTag(…)`
 *      ternary is gone; both arms are bookkeeping, and the engine's remaining `edhaSpendTag` call
 *      sites are exactly the two writers that deduct a cost its OWNER paid;
 *   5. the ratchet itself, measured the way `lint-refs.js` pass 20 measures it.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, stageWorld, captureChat, readEngineSource, codeOnly, eq } = require("./harness.js");

/* An actor whose `update()` records the OPTIONS as well as the change — mockActor's shell keeps
 * only the change, and options are the whole subject here. (Same shape spend-tag.test.js uses.) */
function writeActor(name, resources, extra = {}) {
  const a = mockActor({ name, id: name, uuid: `Actor.${name}`, system: { resources } });
  Object.assign(a, extra);
  a.writes = [];
  const base = a.update.bind(a);
  a.update = async (change = {}, options = {}) => { a.writes.push({ change, options }); return base(change); };
  return a;
}

/* ---- 1. the writer's contract ------------------------------------------------------------------ */

test("edhaResourceWrite: builds the resource path from the id, and keys `changes` RELATIVE to it", async () => {
  const env = loadEngine();
  const a = writeActor("Patient", { hea: { value: 4 } });

  await env.edhaResourceWrite(a, "hea", { value: 7 }, {});
  eq(a.writes[0].change, { "system.resources.hea.value": 7 });

  // The Colossus transform is why `changes` is a MAP and not a single value: one update carries the
  // max override, its useOverride switch and the matching current-HP bump, in that order.
  await env.edhaResourceWrite(a, "hea", { "max.override": 30, "max.useOverride": true, value: 30 }, {});
  eq(a.writes[1].change, {
    "system.resources.hea.max.override": 30,
    "system.resources.hea.max.useOverride": true,
    "system.resources.hea.value": 30,
  });

  await env.edhaResourceWrite(a, "inv", { value: 2 }, {});
  eq(a.writes[2].change, { "system.resources.inv.value": 2 });
});

test("edhaResourceWrite: passes `options` through UNCHANGED — a spend stamp survives the writer", async () => {
  const env = loadEngine();
  const a = writeActor("Foe", { inv: { value: 5 } });

  // The H10 drain's shape. If the writer dropped, replaced or "helpfully" re-classified options,
  // the Order Investiture watch would stop seeing a real drain — the exact regression #28b fixed.
  await env.edhaResourceWrite(a, "inv", { value: 3 }, env.edhaSpendTag("Reaper's Harvest (drain)"));
  const opts = a.writes[0].options;
  assert.strictEqual(opts.edha?.spend, true, "the spend stamp reached the update");
  assert.strictEqual(opts.edha?.source, "Reaper's Harvest (drain)");
  assert.strictEqual(env.edhaIsSpend(a, "inv", opts, 5, 3), true, "…and the predicate reads it as a spend");

  // A site that merges its own options with a tag keeps both (edhaGainFocus does exactly this).
  await env.edhaResourceWrite(a, "foc", { value: 6 }, { edhaFocusWatch: true, ...env.edhaBookkeepingTag("x") });
  assert.strictEqual(a.writes[1].options.edhaFocusWatch, true);
  assert.strictEqual(a.writes[1].options.edha?.bookkeeping, true);

  // No options at all is legal and writes none — the writer invents nothing.
  await env.edhaResourceWrite(a, "foc", { value: 1 });
  eq(a.writes[2].options, {});
});

test("edhaResourceWrite: does NOT clamp and does NOT swallow — each migrated site kept its own", async () => {
  const env = loadEngine();
  // Every one of the twelve had its own max math (edhaResVal, `max.value ?? max`, `|| Infinity`)
  // and its own failure handling (a socket relay, a `return`, a bare catch). The writer clamping
  // or catching would have silently changed all of them, so it does neither.
  const a = writeActor("Patient", { hea: { value: 4, max: { value: 6 } } });
  await env.edhaResourceWrite(a, "hea", { value: 99 }, {});
  assert.strictEqual(a.system.resources.hea.value, 99, "the caller's number is written verbatim");

  const boom = writeActor("NoPerms", { hea: { value: 4 } });
  boom.update = async () => { throw new Error("User lacks permission to update Actor"); };
  await assert.rejects(() => env.edhaResourceWrite(boom, "hea", { value: 5 }, {}), /permission/,
    "the failure reaches the caller, whose own catch decides whether to relay");
});

/* ---- 2. the bookkeeping direction — a migrated non-spend DECLARES itself --------------------- */

test("edhaHealActor: writes hea through the writer and declares the write bookkeeping", async () => {
  const env = loadEngine();
  const a = writeActor("Ally", { hea: { value: 3, max: { value: 10 } } });

  await env.edhaHealActor(a, 4);
  eq(a.writes[0].change, { "system.resources.hea.value": 7 });          // clamped by the SITE, not the writer
  assert.strictEqual(a.writes[0].options.edha?.bookkeeping, true, "a heal is a declared non-spend");
  // The declaration is not decoration: it is what the predicate reads.
  assert.strictEqual(env.edhaIsSpend(a, "hea", a.writes[0].options, 9, 7), false,
    "even read as a decrease, a declared bookkeeping write is never a spend");
});

test("edhaGainFocus: carries BOTH the focus-watch skip flag and the bookkeeping declaration", async () => {
  const env = loadEngine();
  const cards = captureChat(env);
  const a = writeActor("Owner", { foc: { value: 1, max: { value: 5 } } });

  await env.edhaGainFocus(a, 2, "Predatory Insight");
  eq(a.writes[0].change, { "system.resources.foc.value": 3 });
  assert.strictEqual(a.writes[0].options.edhaFocusWatch, true, "the 07-05 watcher skip is untouched");
  assert.strictEqual(a.writes[0].options.edha?.bookkeeping, true, "a gain is a declared non-spend");
  assert.ok(cards.some((c) => /regains 2 focus/.test(c.content)), "the gain still announces itself");
});

/* ---- 3. THE R-72 PIN, FLIPPED — an involuntary drain DECLARES ITSELF BOOKKEEPING -------------- */

/* ⚠ THIS CASE USED TO ASSERT ITS OPPOSITE. Until 2026-09-06 it read "writes with
 * `{ edhaFocusWatch: true }` and NOTHING else (R-72 stays open)" and failed if a bookkeeping tag
 * ever appeared here, because a tag either way would have answered an open ruling by the back door.
 * **R-72 is now ANSWERED — Ben (b), 2026-09-06: a drain is NOT a spend** — so the guard inverts:
 * the tag must be here, and its absence is the regression. The reason the answer matters at the
 * table: an Edict-bound creature drained by an ENEMY gets no violation prompt, while its own wired
 * spend still does. Do not "restore" this case to its old shape. */
test("R-72: edhaDrainFocus declares the involuntary drain BOOKKEEPING, alongside the focus-watch skip", async () => {
  const env = loadEngine();
  captureChat(env);
  const a = writeActor("Victim", { foc: { value: 4 } }, { isOwner: true, items: [] });
  const undo = stageWorld(env, { user: { isGM: true, id: "gm" }, users: { activeGM: { isSelf: true } } }).undo;
  try {
    env.edhaDispatchWatchers = async () => {};
    await env.edhaDrainFocus(a, 2, "Whispered Doubt");
    eq(a.writes[0].change, { "system.resources.foc.value": 2 });
    const opts = a.writes[0].options;
    assert.deepStrictEqual(Object.keys(JSON.parse(JSON.stringify(opts))).sort(), ["edha", "edhaFocusWatch"],
      "both signals ride: the R-72 classification AND the 07-05 watcher skip. They say different " +
      "things — the skip stops the focus watcher re-announcing, the tag tells every OTHER reader " +
      "(the Order Investiture watch included) that nobody spent anything.");
    assert.strictEqual(opts.edha?.bookkeeping, true, "R-72 (b): an involuntary drain is not a spend");
    assert.strictEqual(opts.edha?.spend, undefined, "…and it is emphatically not stamped as one");
    assert.strictEqual(opts.edhaFocusWatch, true, "…and the 07-05 watcher skip is still on it");
    // The declaration is not decoration: it is what the predicate reads.
    assert.strictEqual(env.edhaIsSpend(a, "foc", opts, 4, 2), false,
      "read as a decrease by the predicate itself, the drain is not a spend");
  } finally { undo(); }
});

/* ---- 4. THE SAME FLIP AT H10 — the Investiture drain is bookkeeping too ----------------------- */

test("R-72: the edha-focus executor's Investiture branch writes through edhaResourceWrite as BOOKKEEPING", () => {
  // Source-scoped, the way spend-tag.test.js pins the set-resource relay: the executor lives inside
  // a registerItemEventHandlerType config object, so no headless harness can call it. Both halves
  // are asserted, so re-inlining the raw `who.update({"system.resources.inv.value": next})` fails
  // here as well as at the ratchet case below.
  //
  // ⚠ ALSO A FLIPPED ASSERTION (2026-09-06). This case used to demand
  // `this.op === "drain" ? edhaSpendTag(` on the grounds that #28b stamped it; R-72 (b) says an
  // involuntary drain is not a spend, so the ternary is gone and BOTH arms are bookkeeping.
  const code = codeOnly(readEngineSource());
  const start = code.indexOf('type: "edha-focus"');
  assert.ok(start > 0, "the H10 handler type is still registered under that name");
  const end = code.indexOf('type: "edha-note"', start);
  const block = code.slice(start, end > start ? end : start + 12000);

  const write = /edhaResourceWrite\(\s*who\s*,\s*"inv"/.test(block);
  assert.ok(write, "the Investiture branch writes through edhaResourceWrite, not a hand-rolled path");
  assert.ok(/edhaResourceWrite\(who, "inv", \{ value: next \}, edhaBookkeepingTag\(/.test(block),
    "R-72 (b): the Investiture write declares itself bookkeeping on BOTH arms — drain and gain.");
  assert.ok(!/edhaSpendTag\(/.test(block),
    "no spend stamp survives in the H10 handler: a drained creature has activated nothing, so the " +
    "Order Investiture watch must not see a violation.");
});

test("R-72: the spend stamp now belongs to the OWNER-PAYS writers and nothing else", () => {
  // The whole point of #28b is that `edha.spend` means "a cost its owner paid". After R-72 the
  // engine has exactly two such writers left. A third appearing without a ruling is the regression
  // this case exists to catch — as is the stamp creeping back onto either drain site.
  const code = codeOnly(readEngineSource());
  const calls = code.match(/(?<!function )\bedhaSpendTag\(/g) || [];
  assert.strictEqual(calls.length, 2,
    `expected edhaSpendResource + edhaConsumeCost, found ${calls.length} edhaSpendTag call sites. ` +
    "R-72 (b) moved the set-resource relay and H10's Investiture drain onto edhaBookkeepingTag.");
  assert.ok(/edhaSpendTag\("edhaSpendResource"\)/.test(code), "the canonical clamped spend still stamps");
  assert.ok(/edhaSpendTag\("edhaConsumeCost"\)/.test(code), "…and so does the takeover/burst activation cost");
});

/* ---- 5. THE RATCHET PIN — the mutation-sensitive case ----------------------------------------- */

test("no hand-rolled resource-path write survives in the engine (resourceWrite floors at 0)", () => {
  // The same measurement scripts/lint-refs.js pass 20 makes: comment-stripped source, strings kept.
  const code = codeOnly(readEngineSource());
  const hits = code.match(/["']system\.resources\.[a-z]{2,4}\.(value|max)["']\s*(?::|\]\s*[=:])/g) || [];
  assert.strictEqual(hits.length, 0,
    `expected 0 hand-rolled "system.resources.<id>.value" update keys, found ${hits.length}: ` +
    `${hits.join(", ")}. Use edhaSpendResource/edhaConsumeCost for a cost, edhaGainResource for a ` +
    `plain clamped gain, or edhaResourceWrite(actor, resource, changes, options) for everything ` +
    `else. See scripts/engine-idiom-ratchet.json.`);

  // 0 is reachable HERE (unlike userTargets' floor of 1) because every canonical writer builds its
  // path from a VARIABLE. Pin that, so a future edit cannot quietly re-literalise the writer's body
  // and leave the ratchet reading 0 while the idiom is back.
  const body = code.match(/function edhaResourceWrite\([^)]*\)\s*\{[\s\S]{0,400}?\n\}/);
  assert.ok(body, "edhaResourceWrite is still a top-level function declaration");
  assert.ok(/\[`system\.resources\.\$\{resource\}\.\$\{k\}`\]/.test(body[0]),
    "the writer still composes the path from its arguments");
});

test("the ratchet file records what the engine actually contains", () => {
  const ratchet = require("../scripts/engine-idiom-ratchet.json");
  assert.strictEqual(ratchet.counts.resourceWrite, 0,
    "counts.resourceWrite must track the measurement above — the ratchet must not become fiction");
  assert.strictEqual(ratchet.originalCounts.resourceWrite, 17, "the 2026-08-10 freeze is history, not a knob");
});
