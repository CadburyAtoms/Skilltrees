/* ⟳ SYNC TALENTS refreshes every pack document type a rebuild rewrites — TODO item 146,
 * fix pass 12 (bench run 47, 2026-09-14).
 *
 * The defect: both sides of `module-src/scripts/engine/26-talent-sync.js` were gated
 * `type !== "talent"` — `edhaBuildSourceMap` never INDEXED a `path` or `action` source, and
 * `edhaSyncActorTalents` `continue`d past every owned non-talent. So the 21 per-tree `path` cards
 * and the universal `Draw Mana` `action` could never be refreshed: bench 47 measured **24 of 24
 * owned path items in the world stale, 0 current** (all three real PCs included) and 18 of 18 owned
 * Draw Mana copies still on the pre-R-126 text, while the toast said *"synced 25 talent(s)"*.
 *
 * These cases drive the REAL `edhaSyncActorTalents` against a stubbed pack, because the bug lived in
 * the two type filters and the matching between them — a pure-helper test of `edhaSrcKey` alone
 * would have passed on the broken engine.
 *
 * The type-in-the-key case is not defensive: the deity pack really does ship a `path` named
 * **Sovereignty** and a `talent` named **Sovereignty** (Verdannis's tree and its capstone), so the
 * old plain-name fallback had them overwrite each other in the source map.
 */
"use strict";
const assert = require("assert");
const { loadEngine, mockActor, mockItem, eq } = require("./harness.js");

const env = loadEngine();

/* A pack source document: `toObject()` returns plain data, exactly as a compendium doc does. */
function packDoc({ name, type = "talent", atlas, group, description, img = `icons/${name}.webp`, system = {}, effects = [] }) {
  const data = {
    name, type, img,
    system: { description: { value: description, chat: description, short: description }, events: {}, ...system },
    effects,
    flags: { "edha-content": { atlas, ...(group ? { group } : {}) } },
  };
  return { name, type, flags: data.flags, toObject: () => JSON.parse(JSON.stringify(data)) };
}

/* THE PACK CONTENTS these cases run against — one of each syncable type plus the real
 * Sovereignty path/talent name collision. `index.size` matches `docs.length` so the source map's
 * partial-collection retry loop does not spin. The three ids are spelled out rather than read from
 * `EDHA_SRC_PACKS`: the harness's vm exposes function declarations, not top-level `const`s. Only
 * the LEYLINE pack answers, so a doc is never counted three times. */
const LEYLINE_PACK_ID = "edha-content.edha-leyline";
function stubPacks(docs) {
  const pack = { index: { size: docs.length }, getDocuments: async () => docs };
  return { get: (id) => (id === LEYLINE_PACK_ID ? pack : null) };
}

const PACK_DOCS = [
  packDoc({ name: "Sapping Hex", type: "talent", atlas: "leyline", group: "Black", description: "NEW talent text",
            system: { activation: { cost: { value: 1, type: "act" } }, damage: { formula: "1d8", type: "vital" } } }),
  packDoc({ name: "Black", type: "path", atlas: "leyline", description: "NEW path text (1857 chars in the world)" }),
  packDoc({ name: "Draw Mana", type: "action", atlas: undefined, description: "Recover Investiture equal to your highest leyline rank.",
            system: { activation: { cost: { value: 1, type: "act" } }, damage: { formula: null, type: null } } }),
  packDoc({ name: "Sovereignty", type: "path", atlas: "deity", description: "PATH Sovereignty" }),
  packDoc({ name: "Sovereignty", type: "talent", atlas: "deity", group: "Sovereignty", description: "TALENT Sovereignty" }),
];

/* Run the real sync over an owned-item list; returns {result, updates} where `updates` is the single
 * updateEmbeddedDocuments payload (or [] when the sync wrote nothing). */
async function sync(items) {
  const priorPacks = env.game.packs;
  env.game.packs = stubPacks(PACK_DOCS);
  const actor = mockActor({ name: "Bench — Black", type: "character", items });
  let written = [];
  actor.updateEmbeddedDocuments = async (kind, updates) => { if (kind === "Item") written = updates; return updates; };
  for (const it of items) it.deleteEmbeddedDocuments = async () => [];
  try {
    const result = await env.edhaSyncActorTalents(actor);
    return { result, updates: written };
  } finally {
    env.game.packs = priorPacks;
  }
}

const ownedTalent = () => mockItem({
  name: "Sapping Hex", id: "own-talent", type: "talent",
  flags: { atlas: "leyline", group: "Black" },
  system: { description: { value: "OLD talent text" }, events: {}, activation: {}, damage: {} },
});
const ownedPath = () => mockItem({
  name: "Black", id: "own-path", type: "path",
  flags: { atlas: "leyline" },
  system: { description: { value: "OLD path text (1154 chars)" }, events: {}, relationships: { keep: "me" } },
});
const ownedDrawMana = () => mockItem({
  name: "Draw Mana", id: "own-action", type: "action",
  flags: { core: true, drawMana: true },
  system: { description: { value: "recover Investiture equal to your Tier" }, events: {}, activation: {}, damage: {} },
});

/* The headline: the FAIL row 111-2 measured. Revert `26-talent-sync.js`'s owned-loop line to
 * `if (item.type !== "talent") continue;` and this case fails (the path is never in `updates`). */
test("item 146: an owned PATH item is refreshed from its pack source", async () => {
  const { result, updates } = await sync([ownedPath()]);
  const u = updates.find((x) => x._id === "own-path");
  assert.ok(u, "the owned path item was not refreshed at all");
  assert.strictEqual(u["system.description"].value, "NEW path text (1857 chars in the world)");
  eq(result.missing, []);
  assert.strictEqual(result.updated, 1);
});

/* The other half of the same filter — DM-2's caveat. */
test("item 146: an owned Draw Mana ACTION is refreshed from its pack source", async () => {
  const { updates } = await sync([ownedDrawMana()]);
  const u = updates.find((x) => x._id === "own-action");
  assert.ok(u, "the owned Draw Mana action was not refreshed at all");
  assert.strictEqual(u["system.description"].value, "Recover Investiture equal to your highest leyline rank.");
});

/* Reverting the SOURCE-side line (`edhaBuildSourceMap`'s `if (d.type !== "talent") continue;`)
 * fails this one too — the item 146 root cause needed both sides, and this case says so. */
test("item 146: the source map indexes path and action docs, not only talents", async () => {
  const priorPacks = env.game.packs;
  env.game.packs = stubPacks(PACK_DOCS);
  try {
    const map = await env.edhaBuildSourceMap();
    assert.ok(map.get(env.edhaSrcKey("path", "leyline", null, "Black")), "the Black path doc was not indexed");
    assert.ok(map.get(env.edhaSrcKey("action", null, null, "Draw Mana")), "the Draw Mana action doc was not indexed");
    assert.ok(map.get(env.edhaSrcKey("talent", "leyline", "Black", "Sapping Hex")), "the talent doc was not indexed");
  } finally {
    env.game.packs = priorPacks;
  }
});

/* THE NEGATIVE, and the reason `type` is in the key. A path and a talent named Sovereignty both
 * exist in the deity pack. These two owned copies carry NO `edha-content` flags — the case that
 * actually reaches the NAME FALLBACK, which is where the collision lived: the map's plain-name
 * entry could only hold one of the two docs, so whichever `pack.getDocuments()` yielded second
 * silently won and the other owned item was refreshed from the wrong type's card.
 * Drop `type` from `edhaSrcKey` and the path assertion below fails with "TALENT Sovereignty". */
test("item 146: the Sovereignty path and the Sovereignty talent never resolve to each other", async () => {
  const path = mockItem({ name: "Sovereignty", id: "own-sov-path", type: "path",
                          system: { description: { value: "old" }, events: {} } });
  const talent = mockItem({ name: "Sovereignty", id: "own-sov-talent", type: "talent",
                            system: { description: { value: "old" }, events: {} } });
  const { updates } = await sync([path, talent]);
  assert.strictEqual(updates.find((u) => u._id === "own-sov-path")["system.description"].value, "PATH Sovereignty");
  assert.strictEqual(updates.find((u) => u._id === "own-sov-talent")["system.description"].value, "TALENT Sovereignty");
});

/* A talent's behaviour is UNCHANGED — the regression guard on the type widening. */
test("item 146: a talent still gets its activation, damage, description, img and events", async () => {
  const { updates } = await sync([ownedTalent()]);
  const u = updates.find((x) => x._id === "own-talent");
  assert.strictEqual(u["system.description"].value, "NEW talent text");
  eq(u["system.damage"], { formula: "1d8", type: "vital" });
  eq(u["system.activation"], { cost: { value: 1, type: "act" } });
  assert.strictEqual(u.img, "icons/Sapping Hex.webp");
  eq(u["system.events"], {});
});

/* A `path` DataModel has no Activatable/Damaging mixin, so the sync must not write those keys for
 * one — the dead-field trap in its writing direction. */
test("item 146: a path update carries no system.activation / system.damage key at all", async () => {
  const { updates } = await sync([ownedPath()]);
  const u = updates.find((x) => x._id === "own-path");
  assert.ok(!("system.activation" in u), "a path has no activation field — the sync must not write one");
  assert.ok(!("system.damage" in u), "a path has no damage field — the sync must not write one");
  assert.ok(!("system.relationships" in u), "system.relationships is the path Parent link — never synced");
});

/* THE RENAME GUARD, unchanged by the widening: a renamed owned item matches neither key and is
 * reported missing rather than overwritten with the wrong card. */
test("item 146: a RENAMED owned path is left alone and reported missing", async () => {
  const renamed = mockItem({ name: "Black (Ben's variant)", id: "own-renamed", type: "path", flags: { atlas: "leyline" },
                             system: { description: { value: "hand-edited" }, events: {} } });
  const { result, updates } = await sync([renamed]);
  eq(updates, []);
  eq(result.missing, ["Black (Ben's variant)"]);
  assert.strictEqual(result.updated, 0);
});

/* THE NEGATIVE the brief asks for: an owned item with no pack source is untouched. */
test("item 146: an owned item with no pack source at all is untouched", async () => {
  const homebrew = mockItem({ name: "Ben's Homebrew Action", id: "own-hb", type: "action",
                              system: { description: { value: "mine" }, events: {} } });
  const { result, updates } = await sync([homebrew]);
  eq(updates, []);
  eq(result.missing, ["Ben's Homebrew Action"]);
});

/* ONE OWNER PER GRANT (case study §10): an adversary's embedded ability is an `action` the
 * ADVERSARY pack sync re-creates. Widening the type filter must not make ⟳ Sync Talents a second
 * writer of it. */
test("item 146: an adversary-flagged embedded action is left to the adversary sync", async () => {
  const embed = mockItem({ name: "Draw Mana", id: "own-adv-dm", type: "action",
                           flags: { adversary: "Cullwolf Pack", drawMana: true },
                           system: { description: { value: "stale" }, events: {} } });
  const { result, updates } = await sync([embed]);
  eq(updates, []);
  eq(result.missing, []);   // not "missing" — deliberately out of scope, not unresolvable
});

/* The toast: an honest count is what would have surfaced this defect the first time. */
test("item 146: the sync reports a per-type breakdown", async () => {
  const { result } = await sync([ownedTalent(), ownedPath(), ownedDrawMana()]);
  eq(result.byType, { talent: 1, path: 1, action: 1 });
  assert.strictEqual(env.edhaSyncTypeLabel(result.byType), "1 talent, 1 path, 1 action");
});

test("edhaSyncTypeLabel: pluralises, omits zero counts, and keeps EDHA_SYNC_TYPES order", () => {
  assert.strictEqual(env.edhaSyncTypeLabel({ talent: 25, path: 1, action: 1 }), "25 talents, 1 path, 1 action");
  assert.strictEqual(env.edhaSyncTypeLabel({ path: 2 }), "2 paths");
  assert.strictEqual(env.edhaSyncTypeLabel({ talent: 0, path: 0 }), "");
  assert.strictEqual(env.edhaSyncTypeLabel(undefined), "");
});
