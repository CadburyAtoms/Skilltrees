/* ============================================================================================
 * TALENT SYNC — the "⟳ Sync" half of AUTHORING_WORKFLOW.md, engine side (backlog G).
 * An owned talent is a COPY taken when the player dragged it, so every pack rebuild leaves every
 * character holding a stale snapshot: old description, old events, old img. This section walks
 * the three source packs, matches each owned talent back to its source, and refreshes it in
 * place — which is why a card-text fix needs "REBUILD + ⟳ Sync" and not just a rebuild.
 * Matching is by (type | atlas | group | name) — edhaSrcKey — with a (type | name) fallback, so a
 * RENAMED item does not match and is left alone rather than silently overwritten with the wrong card.
 * Owns: EDHA_SRC_PACKS · EDHA_SYNC_TYPES · edhaSrcKey · edhaSyncTypeLabel · edhaBuildSourceMap ·
 *   edhaSrcFor · edhaSyncActorTalents · edhaSyncAllCharacters · edhaSyncNow.
 * ============================================================================================ */

/* --- G: "Sync Edha Talents" utility -----------------------------------------------------------
 * Talents already on an actor are SNAPSHOTS frozen at add-time; a pack rebuild does NOT update
 * them, so after editing roll data (talent-rolls.json) the owned copies keep stale activation/
 * damage and won't roll. This re-pulls the content fields from the three Edha packs onto the
 * actor's talents, matched by exact name. It DELIBERATELY does not touch system.relationships
 * (the talent's Parent link to its path, which drives the per-path Actions grouping).
 */
const EDHA_SRC_PACKS = ["edha-content.edha-leyline", "edha-content.edha-deity", "edha-content.edha-heroic"];

/* The pack document types ⟳ Sync refreshes — item 146 (2026-09-14, bench run 47). A rebuild rewrites
 * the card of EVERY document the three atlases ship, not just the talents: each tree also ships a
 * `path` item (21 of them) and the leyline pack ships the universal `Draw Mana` `action`. Both sides
 * of this section used to be gated `type !== "talent"`, so an owned path or Draw Mana copy could
 * never be matched — measured live at bench 47: **24 of 24 owned path items in the world stale, 0
 * current** (including all three real PCs), and 18 of 18 owned Draw Mana copies still reading the
 * pre-R-126 text, with no button in Foundry able to fix either. The toast said "synced 25 talent(s)"
 * over the top of it, which is how it stayed invisible for a whole deploy cycle.
 * Add a type here only when a rebuild can change that type's CARD and an owned copy is a snapshot. */
const EDHA_SYNC_TYPES = ["talent", "path", "action"];

/* Source map for syncing. Keyed two ways: "<type>|<atlas>|<group>|<name>" (exact identity — 28 talent
 * names collide across trees, so name alone is ambiguous) and "<type>|<name>" as a fallback.
 * TYPE IS PART OF BOTH KEYS AND IT IS LOAD-BEARING, not defensive (item 146): the deity pack ships a
 * `path` named **Sovereignty** AND a `talent` named **Sovereignty** (Verdannis's tree and its
 * capstone). Under the old plain-name fallback the two overwrote each other in the map, so whichever
 * `pack.getDocuments()` yielded last would have been pulled onto the other — a path card written over
 * a talent, or the reverse. Nothing else in the three packs collides across types today, and nothing
 * has to: the key makes the class impossible rather than the instance. */
function edhaSrcKey(type, atlas, group, name) { return `${type ?? "talent"}|${atlas ?? ""}|${group ?? ""}|${name}`; }

/* PURE. The ⟳ Sync toast's breakdown — "25 talents, 1 path, 1 action" (item 146). The old toast
 * counted one type and named it for all of them; a count that reads like success while a whole
 * document type is being skipped is the thing that hid this defect, so the toast now says what it
 * actually touched. Types print in EDHA_SYNC_TYPES order; zero counts are omitted. Pinned in tests/. */
function edhaSyncTypeLabel(byType) {
  const parts = [];
  for (const t of EDHA_SYNC_TYPES) {
    const n = Math.max(0, Math.floor(Number(byType?.[t]) || 0));
    if (n) parts.push(`${n} ${t}${n === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}
async function edhaBuildSourceMap() {
  const byName = new Map();
  for (const packId of EDHA_SRC_PACKS) {
    const pack = game.packs?.get(packId);
    if (!pack) continue;
    let docs = await pack.getDocuments();
    // Right after a pack write the collection can return a PARTIAL set (cache mid-invalidation) —
    // retry with backoff until the doc count matches the pack index (max 5 tries).
    for (let tries = 0; pack.index?.size && docs.length < pack.index.size && tries < 5; tries++) {
      await new Promise(r => setTimeout(r, 300 + tries * 200));
      docs = await pack.getDocuments();
    }
    if (pack.index?.size && docs.length < pack.index.size) console.warn(`Edha Content | sync: ${packId} returned ${docs.length}/${pack.index.size} docs after retries — re-run ⟳ Sync.`);
    for (const d of docs) {
      if (!EDHA_SYNC_TYPES.includes(d.type)) continue;   // item 146: talents AND the path / action cards a rebuild also rewrites
      const f = d.flags?.["edha-content"] ?? {};
      byName.set(edhaSrcKey(d.type, f.atlas, f.group, d.name), d);
      byName.set(edhaSrcKey(d.type, null, null, d.name), d);
    }
  }
  return byName;
}
/* Resolve an owned item's pack source: exact identity first, then (type | name). A `path` doc carries
 * no `group` flag (the build stamps only `{atlas}`), so its exact key degenerates to
 * "path|<atlas>||<name>" on BOTH sides and matches without a special case; Draw Mana carries neither
 * and matches on "action|||Draw Mana". The rename guard is unchanged and still the whole point: a
 * renamed owned item misses both keys, so it is reported missing and left alone rather than
 * overwritten with the wrong card. */
function edhaSrcFor(byName, item) {
  const f = item.flags?.["edha-content"] ?? {};
  return byName.get(edhaSrcKey(item.type, f.atlas, f.group, item.name)) ?? byName.get(edhaSrcKey(item.type, null, null, item.name));
}

async function edhaSyncActorTalents(actor, byName) {
  if (!actor) return { updated: 0, missing: [], byType: {} };
  byName ??= await edhaBuildSourceMap();
  const updates = [], missing = [], effectPrunes = [], byType = {};
  for (const item of actor.items) {
    if (!EDHA_SYNC_TYPES.includes(item.type)) continue;   // item 146: talent + path + action (see EDHA_SYNC_TYPES)
    /* ONE OWNER PER GRANT (case study §10). An adversary's embedded ability is an `action` carrying
     * `flags.edha-content.adversary`, and it is the ADVERSARY PACK SYNC's to refresh — it re-creates
     * every flagged item from `edha-adversaries` with its pack `_id`. Before item 146 the type gate
     * hid that overlap; now that `action` is in scope, a GM who runs `edha.syncNow()` on a selected
     * adversary token would otherwise pull its Draw Mana embed from the LEYLINE pack and replace the
     * `{adversary}` flag with the leyline copy's `{core}` one. Skip them: not this button's items. */
    if (item.flags?.["edha-content"]?.adversary) continue;
    const src = edhaSrcFor(byName, item);
    if (!src) { missing.push(item.name); continue; }
    const so = src.toObject();             // plain data (not the live DataModel)
    // Item updates MERGE object fields, so stale event rules would linger forever. Replace wholesale:
    // emit a `-=<id>` deletion for every existing rule that the pack source no longer carries.
    const newEvents = foundry.utils.deepClone(so.system.events ?? {});
    for (const oldId of Object.keys(item._source?.system?.events ?? {})) {
      if (!(oldId in newEvents)) newEvents[`-=${oldId}`] = null;
    }
    // Same for embedded ActiveEffects: updating merges/adds by _id but never deletes, so prune any
    // owned effect the pack source doesn't have (after the update applies).
    const srcEffIds = new Set((so.effects ?? []).map(e => e._id));
    const stale = item.effects.filter(e => !srcEffIds.has(e.id)).map(e => e.id);
    if (stale.length) effectPrunes.push({ item, stale });
    const update = {
      _id: item.id,
      img: so.img,
      "system.events": newEvents,                  // native event rules (replaced wholesale via -= deletions)
      effects: so.effects ?? [],                   // passive ActiveEffects (e.g. +Speed); merged by _id
      "flags.edha-content": so.flags?.["edha-content"] ?? {}, // specialty flag (budget Key check)
    };
    /* Only the content fields the SOURCE ITSELF carries (item 146). `activation` and `damage` are
     * Activatable/Damaging-mixin fields: a talent and an action have both, a `path` has NEITHER, and
     * writing a key the DataModel does not define is the dead-field trap in its writing direction —
     * it resolves with no error and leaves junk (or nothing) behind. `description` is guarded the
     * same way rather than assumed. Spelled out one key at a time ON PURPOSE: a
     * `update["system." + f]` loop would hide every field name from `lint-refs.js` pass 11, which is
     * the gate that catches a field the cosmere DataModel does not declare. `system.relationships` is
     * deliberately absent and always has been — the Parent link drives the Actions grouping. */
    const ss = so.system ?? {};
    if ("activation" in ss) update["system.activation"] = ss.activation;    // cost/consume + skill_test config
    if ("damage" in ss) update["system.damage"] = ss.damage;                // formula/type → makes the roll fire
    if ("description" in ss) update["system.description"] = ss.description; // refreshed prose
    updates.push(update);
    byType[item.type] = (byType[item.type] ?? 0) + 1;
  }
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);
  for (const { item, stale } of effectPrunes) {
    try { await item.deleteEmbeddedDocuments("ActiveEffect", stale); }
    catch (e) { console.warn(`Edha Content | could not prune stale effect(s) on ${item.name}`, e); }
  }
  return { updated: updates.length, missing, byType };
}

async function edhaSyncAllCharacters() {
  const byName = await edhaBuildSourceMap();
  let total = 0; const results = [];
  for (const a of (game.actors?.filter(a => a.type === "character") ?? [])) {
    const r = await edhaSyncActorTalents(a, byName);
    total += r.updated; results.push({ name: a.name, ...r });
  }
  console.log("Edha Content | synced all characters:", results);
  return { total, results };
}

// One-click entrypoint: resolve an actor (passed → controlled token → player character), sync, notify.
async function edhaSyncNow(actor) {
  actor ??= canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
  if (!actor) { ui.notifications?.warn("Edha: select a token (or set a player character) to sync."); return null; }
  const r = await edhaSyncActorTalents(actor);
  // item 146: "item(s)" + the per-type breakdown, because the button refreshes paths and actions too
  // and the old "N talent(s)" line read like success while it skipped both.
  const breakdown = edhaSyncTypeLabel(r.byType);
  ui.notifications?.info(
    `Edha: synced ${r.updated} item(s) on ${actor.name}` +
    (breakdown ? ` (${breakdown})` : "") +
    (r.missing.length ? ` — ${r.missing.length} not found in packs (see console).` : ".")
  );
  if (r.missing.length) console.warn("Edha Content | items not found in any Edha pack:", r.missing);
  return r;
}

