/* ============================================================================================
 * TALENT SYNC — the "⟳ Sync" half of AUTHORING_WORKFLOW.md, engine side (backlog G).
 * An owned talent is a COPY taken when the player dragged it, so every pack rebuild leaves every
 * character holding a stale snapshot: old description, old events, old img. This section walks
 * the three source packs, matches each owned talent back to its source, and refreshes it in
 * place — which is why a card-text fix needs "REBUILD + ⟳ Sync" and not just a rebuild.
 * Matching is by (atlas | group | name) — edhaSrcKey — with a name-only fallback, so a RENAMED
 * talent does not match and is left alone rather than silently overwritten with the wrong card.
 * Owns: EDHA_SRC_PACKS · edhaSrcKey · edhaBuildSourceMap · edhaSrcFor · edhaSyncActorTalents ·
 *   edhaSyncAllCharacters · edhaSyncNow.
 * ============================================================================================ */

/* --- G: "Sync Edha Talents" utility -----------------------------------------------------------
 * Talents already on an actor are SNAPSHOTS frozen at add-time; a pack rebuild does NOT update
 * them, so after editing roll data (talent-rolls.json) the owned copies keep stale activation/
 * damage and won't roll. This re-pulls the content fields from the three Edha packs onto the
 * actor's talents, matched by exact name. It DELIBERATELY does not touch system.relationships
 * (the talent's Parent link to its path, which drives the per-path Actions grouping).
 */
const EDHA_SRC_PACKS = ["edha-content.edha-leyline", "edha-content.edha-deity", "edha-content.edha-heroic"];

// Source map for syncing. Keyed two ways: "<atlas>|<group>|<name>" (exact tree identity — 28 talent
// names collide across trees, so name alone is ambiguous) and plain name as a fallback.
function edhaSrcKey(atlas, group, name) { return `${atlas ?? ""}|${group ?? ""}|${name}`; }
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
      if (d.type !== "talent") continue;   // type-strict: compendium source docs are talent-typed
      const f = d.flags?.["edha-content"] ?? {};
      byName.set(edhaSrcKey(f.atlas, f.group, d.name), d);
      byName.set(d.name, d);
    }
  }
  return byName;
}
// Resolve an owned talent's pack source: exact tree identity first, then name.
function edhaSrcFor(byName, item) {
  const f = item.flags?.["edha-content"] ?? {};
  return byName.get(edhaSrcKey(f.atlas, f.group, item.name)) ?? byName.get(item.name);
}

async function edhaSyncActorTalents(actor, byName) {
  if (!actor) return { updated: 0, missing: [] };
  byName ??= await edhaBuildSourceMap();
  const updates = [], missing = [], effectPrunes = [];
  for (const item of actor.items) {
    if (item.type !== "talent") continue;   // type-strict: ⟳ Sync snapshots PC talents only (twins re-drag)
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
    updates.push({
      _id: item.id,
      img: so.img,
      "system.activation": so.system.activation,   // cost/consume + skill_test config
      "system.damage": so.system.damage,           // formula/type → makes the roll fire
      "system.description": so.system.description,  // refreshed prose
      "system.events": newEvents,                  // native event rules (replaced wholesale via -= deletions)
      effects: so.effects ?? [],                   // passive ActiveEffects (e.g. +Speed); merged by _id
      "flags.edha-content": so.flags?.["edha-content"] ?? {}, // specialty flag (budget Key check)
    });
  }
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);
  for (const { item, stale } of effectPrunes) {
    try { await item.deleteEmbeddedDocuments("ActiveEffect", stale); }
    catch (e) { console.warn(`Edha Content | could not prune stale effect(s) on ${item.name}`, e); }
  }
  return { updated: updates.length, missing };
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
  ui.notifications?.info(
    `Edha: synced ${r.updated} talent(s) on ${actor.name}` +
    (r.missing.length ? ` — ${r.missing.length} not found in packs (see console).` : ".")
  );
  if (r.missing.length) console.warn("Edha Content | talents not found in any Edha pack:", r.missing);
  return r;
}

