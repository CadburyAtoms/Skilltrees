/* ============================================================================================
 * ADVERSARY PACK SYNC (2026-07-18b) — the same problem as talent sync one document up: a placed
 * adversary is a copy, so a rebuilt bestiary never reaches the actors already on a scene. This
 * replaces the per-deploy "delete and re-drag every adversary", which lost tokens and their
 * placement every time. Runs from a button on the adversary sheet or in bulk from the actor
 * directory; edhaAdvSyncPlan is the pure add/update/remove diff, kept separate so it is testable.
 * Owns: EDHA_ADV_PACK_ID · edhaAdvSyncPlan · edhaAdvSrcFor · edhaSyncAdversaryActor ·
 *   edhaSyncAllAdversaries + the renderAdversarySheet and renderActorDirectory buttons.
 * ============================================================================================ */

/* --- Adversary pack sync (2026-07-18b) — replaces the per-deploy "re-drag every adversary" -----
 * World adversary actors are snapshots frozen at drag-time; a pack rebuild updates only the
 * COMPENDIUM, so every deploy used to end with re-dragging each placed adversary. This syncs a
 * world adversary IN PLACE to fresh-drag parity while KEEPING its actor id — the actual win over
 * a re-drag: scene tokens stay attached, holding their position/HP/combat state (unlinked-token
 * damage lives in the token delta, which the sync never touches).
 *   - Items: every pack-built copy (edha-content-flagged) or source-colliding item is deleted and
 *     re-created from the pack source WITH its pack `_id` (build ids are deterministic sha1 fids,
 *     so token-delta references keep resolving); hand-added items (no flag) survive.
 *   - Actor data: `system` + `prototypeToken` replaced WHOLESALE (recursive:false — a merge would
 *     keep removed skills/overrides forever); `img` + `flags.edha-content` refreshed. Name,
 *     folder, ownership, and sort stay the world actor's own.
 *   - Placed tokens: token docs are placement-time copies an actor update never touches, so the
 *     prototype's token-level fields (texture / sight / disposition / bars / display / size) are
 *     pushed onto every scene token of this actor — vision-model and art changes land without
 *     re-placing.
 * Matching: `_stats.compendiumSource` (stamped on drag; stays valid across rebuilds because pack
 * ids are deterministic) → legacy flags.core.sourceId → exact-name lookup in the adversary pack.
 * Bulk sync SKIPS a world copy whose name differs from its resolved source (a rename = a
 * customized variant); the sheet button syncs whatever it resolves (explicit intent). GM-only. */
const EDHA_ADV_PACK_ID = "edha-content.edha-adversaries";

// Pure decision: which owned items does a pack sync replace? Pack-built copies (edha-content-
// flagged) plus anything colliding with a source item by id or name drop and re-create from
// source; the rest (hand-added) survive. Items are plain {id, name, flags} shapes. (Pinned in tests/.)
function edhaAdvSyncPlan(ownedItems, srcItems) {
  const srcIds = new Set(srcItems.map(i => i._id));
  const srcNames = new Set(srcItems.map(i => i.name));
  const drop = [], keep = [];
  for (const it of ownedItems) {
    ((it.flags?.["edha-content"] != null || srcIds.has(it.id) || srcNames.has(it.name)) ? drop : keep).push(it.id);
  }
  return { drop, keep };
}

async function edhaAdvSrcFor(actor) {
  const pack = game.packs?.get(EDHA_ADV_PACK_ID);
  if (!pack) return null;
  const uuid = actor?._stats?.compendiumSource || actor?.flags?.core?.sourceId || "";
  if (typeof uuid === "string" && uuid.startsWith(`Compendium.${EDHA_ADV_PACK_ID}.`)) {
    try { const d = await fromUuid(uuid); if (d) return d; } catch (e) { /* entry renamed/removed — fall through to name */ }
  }
  const entry = pack.index?.find?.(e => e.name === actor?.name);
  return entry ? await pack.getDocument(entry._id) : null;
}

async function edhaSyncAdversaryActor(actor, src) {
  if (!actor || actor.type !== "adversary" || actor.pack) return null;   // world actors only — the compendium doc IS the source
  src ??= await edhaAdvSrcFor(actor);
  if (!src) return { synced: false, name: actor?.name, reason: "no pack source (name not in edha-adversaries)" };
  const so = src.toObject();
  const { drop } = edhaAdvSyncPlan(actor.items.map(i => ({ id: i.id, name: i.name, flags: i.flags })), so.items);
  if (drop.length) await actor.deleteEmbeddedDocuments("Item", drop);
  if (so.items.length) await actor.createEmbeddedDocuments("Item", so.items, { keepId: true });
  // Wholesale replace = fresh-drag parity (importFromJSON semantics, minus name/folder/ownership).
  await actor.update({ img: so.img, system: so.system, prototypeToken: so.prototypeToken }, { recursive: false, diff: false });
  await actor.update({ "flags.edha-content": so.flags?.["edha-content"] ?? {} });
  const proto = so.prototypeToken ?? {};
  let tokens = 0;
  for (const scene of game.scenes ?? []) {
    const updates = (scene.tokens ?? []).filter(t => t.actorId === actor.id).map(t => ({
      _id: t.id,
      texture: foundry.utils.deepClone(proto.texture),
      sight: foundry.utils.deepClone(proto.sight),
      disposition: proto.disposition, displayName: proto.displayName, displayBars: proto.displayBars,
      bar1: foundry.utils.deepClone(proto.bar1), bar2: foundry.utils.deepClone(proto.bar2),
      width: proto.width, height: proto.height,
    }));
    if (updates.length) { await scene.updateEmbeddedDocuments("Token", updates); tokens += updates.length; }
  }
  return { synced: true, name: actor.name, items: so.items.length, dropped: drop.length, tokens };
}

async function edhaSyncAllAdversaries() {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: adversary sync is GM-only."); return null; }
  if (!game.packs?.get(EDHA_ADV_PACK_ID)) { ui.notifications?.warn("Edha: the edha-adversaries pack was not found."); return null; }
  const synced = [], skipped = [], missing = [];
  for (const a of (game.actors?.filter(a => a.type === "adversary") ?? [])) {
    const src = await edhaAdvSrcFor(a);
    if (!src) { missing.push(a.name); continue; }
    if (src.name !== a.name) { skipped.push(`${a.name} (source: ${src.name})`); continue; }   // renamed = customized variant — sheet button syncs it explicitly
    const r = await edhaSyncAdversaryActor(a, src);
    if (r?.synced) synced.push(`${a.name} (${r.items} items${r.tokens ? `, ${r.tokens} token${r.tokens === 1 ? "" : "s"}` : ""})`);
  }
  console.log("Edha Content | adversary sync:", { synced, skipped, missing });
  ui.notifications?.info(
    `Edha: synced ${synced.length} adversar${synced.length === 1 ? "y" : "ies"} from the pack` +
    (skipped.length ? `, skipped ${skipped.length} renamed` : "") +
    (missing.length ? `, ${missing.length} with no pack source` : "") + " (details in console)."
  );
  return { synced, skipped, missing };
}

// GM button on the adversary sheet (the system's sheet class IS `AdversarySheet` — Ben's 07-12
// console evidence — so AppV2 fires renderAdversarySheet; ⚑ bench-verify the injection point).
Hooks.on("renderAdversarySheet", (app, element) => {
  try {
    if (!game.user?.isGM) return;
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    let actor = app?.actor;
    if (!root || !actor || actor.type !== "adversary" || actor.pack) return;
    if (actor.isToken) actor = game.actors?.get(actor.token?.actorId) ?? null;   // sync the BASE — the token re-derives through its delta
    if (!actor) return;
    root.querySelector(".edha-adv-sync-bar")?.remove();
    const bar = document.createElement("div");
    bar.className = "edha-adv-sync-bar";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edha-sync-btn";
    btn.textContent = "⟳ Sync from Pack";
    btn.title = "Re-pull this adversary from the edha-adversaries compendium (stats, abilities, token settings) — replaces the post-deploy re-drag. Placed tokens keep position and HP.";
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      btn.disabled = true;
      Promise.resolve(edhaSyncAdversaryActor(actor)).then((r) => {
        btn.disabled = false;
        if (r?.synced) { ui.notifications?.info(`Edha: ${r.name} synced from the pack (${r.items} items, ${r.tokens} placed token${r.tokens === 1 ? "" : "s"}).`); app.render(false); }
        else if (r) ui.notifications?.warn(`Edha: ${r.name} — ${r.reason}.`);
      }).catch((e) => { btn.disabled = false; console.error("Edha Content | adversary sync failed", e); });
    });
    bar.appendChild(btn);
    const sheetHeader = root.querySelector(".sheet-header");
    if (sheetHeader) sheetHeader.after(bar);
    else (root.querySelector(".sheet-content") ?? root).prepend(bar);
  } catch (e) { console.error("Edha Content | adversary sync button failed", e); }
});

// GM bulk button in the Actors sidebar footer — the ONE post-deploy click that replaces the
// re-drag list.
Hooks.on("renderActorDirectory", (app, element) => {
  try {
    if (!game.user?.isGM) return;
    const root = element instanceof HTMLElement ? element : (element?.[0] || null);
    if (!root || root.querySelector(".edha-adv-sync-all-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edha-sync-btn edha-adv-sync-all-btn";
    btn.textContent = "⟳ Sync Adversaries from Pack";
    btn.title = "After a deploy: re-pull every world adversary (and its placed tokens) from the rebuilt edha-adversaries pack — replaces re-dragging them. Renamed copies are skipped; sync those from their own sheet.";
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      btn.disabled = true;
      Promise.resolve(edhaSyncAllAdversaries()).finally(() => { btn.disabled = false; });
    });
    (root.querySelector(".directory-footer") ?? root).append(btn);
  } catch (e) { console.error("Edha Content | adversary sync-all button failed", e); }
});

