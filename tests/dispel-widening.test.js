/* tests/dispel-widening.test.js — the widened DISPEL (item 54, 2026-09-06 — R-73 (b) + R-35 (a)).
 *
 * `edha-prompt-pick` `source: "effects"` (the Unravel Everything / Unweaving shape) used to list only
 * enabled `actor.effects`, so a passive authored `transfer: true` on a talent or trait — a PC's
 * Hardy, a Cinderhound's Cinder Coat, Predictive Ward's braced — could never be dispelled. Ben
 * VETOED the narrow default and asked for the safe widening: list item-owned effects too, offered as
 * a temporary DISABLE, and keep the DELETE path guarded to actor-level effects only. R-35 folds in:
 * the target's Omen ledger entries appear as a "Dispel Omen" button clearing marker + row.
 *
 * What is pinned, and the one-line reversion each catches:
 *   1. the menu lists an item-owned Hardy (revert `edhaAllEffects(subject)` → `subject.effects`);
 *   2. disabling Hardy leaves the talent's copy INTACT — same object, still on the item, only
 *      `disabled: true` (revert the item branch to `eff.delete()`);
 *   3. the delete path REFUSES an item-owned effect even when the button lies (`data-edha-mode=
 *      "delete"`) — the guard is on the document, not the HTML — and still deletes an actor-level one;
 *   4. the Omen entry: the button appears, and the click clears BOTH the marker and the ledger row
 *      (drop either half of edhaDispelLedgerMark and a pin fails);
 *   5. a ledger the rule's `ledgers` field does not name is refused; the default reads as Omen so
 *      rules authored before item 54 need no rebuild.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, mockEffect, stageWorld, withStubs, captureChat, eq } = require("./harness.js");

const env = loadEngine();

/* ---------- staging -------------------------------------------------------------------------- */

// A PC bearing three things: an engine buff on the ACTOR, a `transfer: true` Hardy on its talent,
// and (optionally) the Omen marker + a row on a Chaos character's ledger.
function target({ omen = false } = {}) {
  const buff = mockEffect({ name: "Blessing of the Hearth", id: "buff-1" });
  const hardy = mockEffect({ name: "Hardy", id: "hardy-ae", transfer: true });
  const talent = mockItem({ name: "Hardy", id: "hardy-tal", effects: [hardy] });
  const pc = mockActor({
    name: "Tem", id: "pc-tem", uuid: "Actor.pc-tem", items: [talent], effects: [buff],
    statuses: omen ? ["omen"] : [], flags: omen ? { markedBy: { omen: { actorId: "chaos-1", talent: "Unravel Everything" } } } : {},
  });
  Object.assign(pc, { isOwner: true, async toggleStatusEffect(id, { active }) { if (active) pc.statuses.add(id); else pc.statuses.delete(id); } });
  talent.actor = pc; buff.parent = pc; hardy.parent = talent;
  buff.uuid = "Actor.pc-tem.ActiveEffect.buff-1"; hardy.uuid = "Actor.pc-tem.Item.hardy-tal.ActiveEffect.hardy-ae";
  return { pc, buff, hardy, talent };
}

// The caster: Unweaving-shaped rule, `source: "effects"`, no `ledgers` field (authored before item 54).
function caster(extra = {}) {
  const rule = { handler: { type: "edha-prompt-pick", source: "effects", prompt: "unweave one:", ...extra } };
  const item = mockItem({ name: "Unweaving", id: "unweaving", uuid: "Actor.chaos-1.Item.unweaving", events: [rule] });
  const owner = mockActor({ name: "Maelith's Voice", id: "chaos-1", uuid: "Actor.chaos-1", items: [item] });
  item.actor = owner;
  return { owner, item, rule };
}

function chaosOwner(pcUuid) {
  return mockActor({ name: "Omen-caster", id: "chaos-2", uuid: "Actor.chaos-2", flags: { lists: { omens: [{ id: "r1", uuid: pcUuid, name: "Tem", talent: "Spreading Omen" }] } } });
}

function world(env, { actors = [], docs = {} } = {}) {
  const users = Object.assign([{ id: "gm1", isGM: true, active: true }], { activeGM: { isSelf: true } });
  users.filter = Array.prototype.filter;
  const staged = stageWorld(env, { user: { id: "gm1", isGM: true }, users, actors, placeables: [] });
  env.canvas.scene = { id: "scene-1" };
  const stubs = { fromUuid: async (u) => docs[u] ?? null, fromUuidSync: (u) => docs[u] ?? null };
  return { staged, stubs };
}

function clickEvent(dataset) {
  return { preventDefault() {}, currentTarget: { dataset, closest() { return null; } } };
}

// Post the offer card for `pc` and return its HTML.
async function offer(env, { item, rule }, pc, docs, actors = []) {
  const { staged, stubs } = world(env, { actors, docs });
  try {
    return await withStubs(env, stubs, async () => {
      const cards = captureChat(env);
      await env.edhaRunPromptPick(item, rule.handler, { options: { victim: pc } });
      return cards.map((c) => c.content).join("\n");
    });
  } finally { staged.undo(); }
}

async function click(env, dataset, docs, actors = []) {
  const { staged, stubs } = world(env, { actors, docs });
  try {
    return await withStubs(env, stubs, async () => {
      const cards = captureChat(env);
      await env.edhaDispelPickClick(clickEvent(dataset));
      return cards.map((c) => c.content).join("\n");
    });
  } finally { staged.undo(); }
}

/* ---------- 1. the widened read ---------------------------------------------------------------- */

async function menuListsItemOwnedHardy() {
  const { pc, buff, hardy } = target();
  const c = caster();
  const html = await offer(env, c, pc, {});
  assert.ok(html.includes(`data-edha-eff="${buff.uuid}"`) && html.includes('data-edha-mode="delete"'),
    "the actor-level buff is still offered as a DELETE (the 2bU shape survives the widening)");
  assert.ok(html.includes(`data-edha-eff="${hardy.uuid}"`),
    "the item-transferred Hardy must be OFFERED — R-73's defect: actor.effects never held it");
  assert.ok(/data-edha-eff="[^"]*hardy-ae"[^>]*data-edha-mode="disable"/.test(html),
    "…and offered as a DISABLE, never a delete");
  assert.ok(!html.includes("data-edha-ledger"), "no Omen on this creature → no ledger button (negative control)");
}

/* ---------- 2. the DISABLE branch leaves the talent's copy intact ------------------------------ */

async function disableLeavesTheTalentCopyIntact() {
  const { pc, hardy, talent } = target();
  const c = caster();
  const docs = { [c.item.uuid]: c.item, [hardy.uuid]: hardy };
  const html = await click(env, { edhaItem: c.item.uuid, edhaEff: hardy.uuid, edhaMode: "disable" }, docs);
  assert.strictEqual(hardy.disabled, true, "the item-owned effect is DISABLED");
  assert.strictEqual(hardy.deleted, false, "…and NOT deleted");
  assert.strictEqual(talent.effects[0], hardy, "the talent's own copy is the same, intact object");
  eq(hardy.updates, [{ disabled: true }]); assert.ok(true, "exactly one write, `disabled: true`, nothing else touched");
  assert.ok(/suppressed on Tem/.test(html) && /Hardy's copy is intact/.test(html), "the card says it is a suppression, not a removal");
  assert.ok([...pc.allApplicableEffects()].includes(hardy), "Foundry would still yield it (disabled) — a re-enable on the Effects tab brings it back");
}

/* ---------- 3. the DELETE guard is on the DOCUMENT ------------------------------------------- */

async function deleteRefusesItemOwnedEvenWhenTheButtonLies() {
  const { hardy, talent } = target();
  const c = caster();
  const docs = { [c.item.uuid]: c.item, [hardy.uuid]: hardy };
  await click(env, { edhaItem: c.item.uuid, edhaEff: hardy.uuid, edhaMode: "delete" }, docs);   // forged mode
  assert.strictEqual(hardy.deleted, false, "a forged data-edha-mode=\"delete\" must NOT delete an item-owned effect");
  assert.strictEqual(hardy.disabled, true, "it lands on the disable branch instead");
  assert.strictEqual(talent.effects.length, 1, "the talent still carries its effect");
}

async function deleteStillRemovesAnActorLevelEffect() {
  const { buff } = target();
  const c = caster();
  const docs = { [c.item.uuid]: c.item, [buff.uuid]: buff };
  const html = await click(env, { edhaItem: c.item.uuid, edhaEff: buff.uuid, edhaMode: "delete" }, docs);
  assert.strictEqual(buff.deleted, true, "an ACTOR-level effect is deleted (2bU, unchanged)");
  eq(buff.updates, []); assert.ok(true, "…and never disabled first");
  assert.ok(/unravels from Tem/.test(html));
}

function ownerItemFailsClosed() {
  const a = mockActor({ name: "A" });
  const it = mockItem({ name: "T" });
  assert.strictEqual(env.edhaEffectOwnerItem({ parent: a }, a), null, "the subject itself → actor-level");
  assert.strictEqual(env.edhaEffectOwnerItem({ parent: { documentName: "Actor" } }), null, "documentName Actor → actor-level");
  assert.strictEqual(env.edhaEffectOwnerItem({ parent: it }), it, "an item shell → item-owned");
  assert.strictEqual(env.edhaEffectOwnerItem({ parent: { documentName: "Item", name: "X" } }).name, "X", "documentName Item → item-owned");
  assert.strictEqual(env.edhaEffectOwnerItem({ parent: { name: "?" } })?.name, "?", "an UNKNOWN parent shape is item-owned (fail closed: disable, never delete)");
}

/* ---------- 4. the Omen ledger entry (R-35) --------------------------------------------------- */

async function omenButtonAppearsAndClearsMarkerAndRow() {
  const { pc } = target({ omen: true });
  const c = caster();
  const chaos = chaosOwner(pc.uuid);
  const docs = { [c.item.uuid]: c.item, [pc.uuid]: pc };
  const html = await offer(env, c, pc, docs, [chaos, c.owner]);
  assert.ok(/data-edha-ledger="omens"[^>]*data-edha-subject="Actor\.pc-tem"[^>]*>Dispel Omen</.test(html),
    "an Omen-bearer's card carries a 'Dispel Omen' button (R-35 (a))");

  await click(env, { edhaItem: c.item.uuid, edhaLedger: "omens", edhaSubject: pc.uuid }, docs, [chaos, c.owner]);
  assert.strictEqual(pc.statuses.has("omen"), false, "the Omen MARKER is cleared");
  assert.strictEqual(pc.getFlag("edha-content", "markedBy.omen"), null, "…and markedBy with it");
  eq(chaos.getFlag("edha-content", "lists.omens"), []); assert.ok(true, "the LEDGER ROW is gone from the Chaos caster's list");
}

async function omenMarkerWithoutARowStillComesOff() {
  const { pc } = target({ omen: true });                       // legacy edhaRemoveMark-era marker: no row anywhere
  const c = caster();
  const docs = { [c.item.uuid]: c.item, [pc.uuid]: pc };
  const html = await offer(env, c, pc, docs, [c.owner]);
  assert.ok(html.includes('data-edha-ledger="omens"'), "the marker alone is enough to offer the button");
  const card = await click(env, { edhaItem: c.item.uuid, edhaLedger: "omens", edhaSubject: pc.uuid }, docs, [c.owner]);
  assert.strictEqual(pc.statuses.has("omen"), false, "the marker is cleared even with no ledger row to drop");
  assert.ok(/no ledger entry held it/.test(card));
}

/* ---------- 5. the `ledgers` field: default = Omen; an unnamed ledger is refused --------------- */

function ledgersFieldParsesAndDefaults() {
  const d = env.edhaDispelLedgers({ source: "effects" });
  eq(d.map((l) => [l.key, l.status, l.label]), [["omens", "omen", "Omen"]]); assert.ok(true,
    "a rule with NO ledgers field (authored before item 54) reads as the Omen ledger — no rebuild needed");
  eq(env.edhaDispelLedgers({ ledgers: "" }), []);   // blank = none (eq: cross-realm)
  eq(env.edhaDispelLedgers({ ledgers: "edicts:edict, charges" }).map((l) => [l.key, l.status]),
    [["edicts", "edict"], ["charges", "charges"]]);   // pairs parse; the status defaults to the key
}

async function anUnnamedLedgerIsRefused() {
  const { pc } = target({ omen: true });
  const c = caster({ ledgers: "" });
  const chaos = chaosOwner(pc.uuid);
  const docs = { [c.item.uuid]: c.item, [pc.uuid]: pc };
  await click(env, { edhaItem: c.item.uuid, edhaLedger: "omens", edhaSubject: pc.uuid }, docs, [chaos, c.owner]);
  assert.strictEqual(pc.statuses.has("omen"), true, "a forged ledger button for a ledger the RULE does not name changes nothing");
  assert.strictEqual(chaos.getFlag("edha-content", "lists.omens").length, 1);
}

/* ---------- runner ---------------------------------------------------------------------------- */

test("the dispel menu lists an item-owned Hardy as a DISABLE (R-73's defect)", menuListsItemOwnedHardy);
test("disabling an item-owned effect leaves the talent's copy intact", disableLeavesTheTalentCopyIntact);
test("the delete path refuses an item-owned effect even when the button lies", deleteRefusesItemOwnedEvenWhenTheButtonLies);
test("the delete path still deletes an actor-level effect", deleteStillRemovesAnActorLevelEffect);
test("edhaEffectOwnerItem fails closed", ownerItemFailsClosed);
test("an Omen entry dispelled clears both the marker and the ledger row (R-35)", omenButtonAppearsAndClearsMarkerAndRow);
test("an Omen marker with no ledger row still comes off", omenMarkerWithoutARowStillComesOff);
test("the ledgers field defaults to Omen and parses pairs", ledgersFieldParsesAndDefaults);
test("a ledger the rule does not name is refused", anUnnamedLedgerIsRefused);
