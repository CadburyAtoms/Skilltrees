/* ============================================================================================
 * ADVERSARY PACK SYNC (2026-07-18b) — the same problem as talent sync one document up: a placed
 * adversary is a copy, so a rebuilt bestiary never reaches the actors already on a scene. This
 * replaces the per-deploy "delete and re-drag every adversary", which lost tokens and their
 * placement every time. Runs from a button on the adversary sheet or in bulk from the actor
 * directory; edhaAdvSyncPlan is the pure add/update/remove diff, kept separate so it is testable.
 *
 * Item 123 / R-113 (2026-09-13, Ben: "agents need to be able to sync adversaries for bench
 * runs") — the bulk path (`edhaSyncAllAdversaries`) was an unfiltered `game.actors` loop that
 * replaced `system` wholesale and pushed prototype token fields onto EVERY scene, including a
 * scene holding someone else's started combat. It now takes `{folder, actorIds, scenes, dryRun,
 * allowStartedCombat}`: `dryRun` defaults to true for a bare `edha.syncAllAdversaries()` call
 * (Ben's two UI buttons pass `dryRun: false` explicitly, so they are unchanged); `folder` /
 * `actorIds` restrict the actor set; `scenes` restricts which scenes get token writes; and any
 * candidate token sitting in a STARTED combat (`started === true` or `round > 0`) refuses the
 * whole call unless `allowStartedCombat: true`. The decision is `edhaSyncPlan`, kept pure (plain
 * actor/scene/combat shapes in, `{actors, sceneTokens, refusals}` out) so it is testable without
 * a Foundry world.
 * Owns: EDHA_ADV_PACK_ID · edhaAdvSyncPlan · edhaAdvSrcFor · edhaSyncPlan · edhaSyncAdversaryActor ·
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
 * customized variant); the sheet button syncs whatever it resolves (explicit intent). GM-only.
 *
 * Item 123 / R-113 — the bulk path's scope/dry-run/refusal guard (agent-safe by default):
 *   - `dryRun` (default true when the options object is omitted, i.e. a bare
 *     `edha.syncAllAdversaries()`): computes and reports the plan — actors it would touch, and
 *     per-scene token counts it would stamp — and writes NOTHING. Ben's sheet button and his
 *     "⟳ Sync Adversaries from Pack" bulk button both pass `dryRun: false` explicitly, so they
 *     write exactly as they always have.
 *   - `folder` / `actorIds` narrow the candidate actor set (a bench passes its own folder or the
 *     ids it imported, never the whole world).
 *   - `scenes` (an array of scene ids) narrows which scenes get token writes; a scene left out is
 *     never touched, no matter what it holds.
 *   - Any candidate token that is a combatant in a STARTED combat (`combat.started === true` or
 *     `round > 0`) on an in-scope scene REFUSES the whole call — no partial write — naming the
 *     scene, the combat and the token, unless `allowStartedCombat: true`. This is what would have
 *     protected bench run 46's near-miss on "Playtest Map (Copy)".
 *   The decision (which actors, which scene token-counts, which refusals) is the pure
 *   `edhaSyncPlan(actors, scenes, combats, opts)`; the async wrapper only gathers the world state
 *   and executes what the plan allows. */
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

// Pure decision (item 123 / R-113): given the resolved candidate actors, EVERY world scene, and
// EVERY world combat, decide what a bulk sync would touch — before anything is written. Plain
// shapes only, so this is testable with no Foundry world:
//   actors:  [{id, name}, ...]            — already resolved to a valid, non-renamed pack source
//   scenes:  [{id, name, tokens: [{id, actorId}, ...]}, ...]   — ALL world scenes, unfiltered
//   combats: [{id, sceneId, started, round, combatantTokenIds: [id, ...]}, ...] — ALL world combats
//   opts:    {scenes: [id, ...] | null, allowStartedCombat: bool}
// Returns {actors: [id, ...], sceneTokens: {[sceneId]: count}, refusals: [{sceneId, sceneName,
// combatId, tokenId, actorId, actorName}, ...]}. No `scenes` filter = every scene with a matching
// token is in scope (today's unfiltered footprint); a scene left out of `scenes` never appears in
// `sceneTokens` and can never produce a refusal, no matter what it holds.
function edhaSyncPlan(actors, scenes, combats, opts = {}) {
  const sceneFilter = Array.isArray(opts.scenes) ? new Set(opts.scenes) : null;
  const allowStarted = opts.allowStartedCombat === true;
  const actorIds = new Set((actors ?? []).map(a => a.id));
  const actorName = new Map((actors ?? []).map(a => [a.id, a.name]));

  const startedTokenCombat = new Map();   // tokenId -> combat, for started combats only
  for (const c of combats ?? []) {
    const isStarted = c.started === true || (typeof c.round === "number" && c.round > 0);
    if (!isStarted) continue;
    for (const tid of c.combatantTokenIds ?? []) startedTokenCombat.set(tid, c);
  }

  const sceneTokens = {};
  const refusals = [];
  for (const scene of scenes ?? []) {
    if (sceneFilter && !sceneFilter.has(scene.id)) continue;   // not in scope for this call at all
    const matched = (scene.tokens ?? []).filter(t => actorIds.has(t.actorId));
    if (!matched.length) continue;
    sceneTokens[scene.id] = matched.length;
    if (allowStarted) continue;
    for (const t of matched) {
      const combat = startedTokenCombat.get(t.id);
      if (combat) refusals.push({ sceneId: scene.id, sceneName: scene.name, combatId: combat.id, tokenId: t.id, actorId: t.actorId, actorName: actorName.get(t.actorId) });
    }
  }
  return { actors: [...actorIds], sceneTokens, refusals };
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

// `sceneFilter` (a Set of scene ids, or nullish) restricts which scenes get token writes — item
// 123 / R-113's `scenes` option, threaded through from edhaSyncAllAdversaries. The sheet button
// calls this with no filter (2 args), same as before item 123: explicit single-actor intent is
// never scene-scoped.
async function edhaSyncAdversaryActor(actor, src, sceneFilter) {
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
    if (sceneFilter && !sceneFilter.has(scene.id)) continue;   // out of scope for this call
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

// Item 123 / R-113: `opts` defaults to a DRY RUN (writes nothing, returns the plan) so a bare
// `edha.syncAllAdversaries()` from the console is always safe. Ben's two UI buttons pass
// `dryRun: false` explicitly below, so they are unaffected. `folder`/`actorIds` narrow the actor
// set; `scenes` narrows which scenes get token writes; a candidate token in a STARTED combat
// refuses the whole call unless `allowStartedCombat: true`.
async function edhaSyncAllAdversaries(opts = {}) {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: adversary sync is GM-only."); return null; }
  if (!game.packs?.get(EDHA_ADV_PACK_ID)) { ui.notifications?.warn("Edha: the edha-adversaries pack was not found."); return null; }
  const { folder = null, actorIds = null, scenes: sceneFilter = null, dryRun = true, allowStartedCombat = false } = opts;

  let candidates = game.actors?.filter(a => a.type === "adversary") ?? [];
  if (folder) candidates = candidates.filter(a => a.folder?.id === folder || a.folder?.name === folder);
  if (Array.isArray(actorIds)) { const idSet = new Set(actorIds); candidates = candidates.filter(a => idSet.has(a.id)); }

  const resolved = [], missing = [], skipped = [];
  for (const a of candidates) {
    const src = await edhaAdvSrcFor(a);
    if (!src) { missing.push(a.name); continue; }
    if (src.name !== a.name) { skipped.push(`${a.name} (source: ${src.name})`); continue; }   // renamed = customized variant — sheet button syncs it explicitly
    resolved.push({ actor: a, src });
  }

  const planScenes = (game.scenes ?? []).map(scene => ({
    id: scene.id, name: scene.name,
    tokens: (scene.tokens ?? []).map(t => ({ id: t.id, actorId: t.actorId })),
  }));
  const planCombats = (game.combats ?? []).map(c => ({
    id: c.id, sceneId: c.scene?.id ?? null,
    started: c.started === true, round: c.round ?? 0,
    combatantTokenIds: (c.combatants?.contents ?? c.combatants ?? []).map(cb => cb.tokenId).filter(Boolean),
  }));
  const plan = edhaSyncPlan(resolved.map(r => ({ id: r.actor.id, name: r.actor.name })), planScenes, planCombats, { scenes: sceneFilter, allowStartedCombat });

  if (plan.refusals.length && !allowStartedCombat) {
    const r0 = plan.refusals[0];
    const msg = `Edha: adversary sync REFUSED — ${r0.actorName ?? "an actor"}'s token is in the STARTED combat ${r0.combatId} on scene "${r0.sceneName}" (token ${r0.tokenId}). Nothing was written. Pass allowStartedCombat:true to override.`;
    console.warn("Edha Content | adversary sync refused (started combat):", plan.refusals);
    ui.notifications?.error(msg);
    return { refused: true, refusals: plan.refusals, plan, skipped, missing };
  }

  if (dryRun) {
    const names = resolved.map(r => r.actor.name);
    console.log("Edha Content | adversary sync DRY RUN:", { actors: names, sceneTokens: plan.sceneTokens, skipped, missing });
    ui.notifications?.info(
      `Edha: DRY RUN — would sync ${names.length} adversar${names.length === 1 ? "y" : "ies"}` +
      (Object.keys(plan.sceneTokens).length ? `, stamping tokens on ${Object.keys(plan.sceneTokens).length} scene(s)` : "") +
      " — nothing written (pass dryRun:false to run for real; details in console)."
    );
    return { dryRun: true, actors: names, sceneTokens: plan.sceneTokens, skipped, missing, plan };
  }

  const sceneFilterSet = Array.isArray(sceneFilter) ? new Set(sceneFilter) : null;
  const synced = [];
  for (const { actor, src } of resolved) {
    const r = await edhaSyncAdversaryActor(actor, src, sceneFilterSet);
    if (r?.synced) synced.push(`${actor.name} (${r.items} items${r.tokens ? `, ${r.tokens} token${r.tokens === 1 ? "" : "s"}` : ""})`);
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
      // item 123 / R-113: the bulk path now DEFAULTS to a dry run — Ben's own button must keep
      // writing, so it passes dryRun:false explicitly (unscoped, exactly like before this item).
      Promise.resolve(edhaSyncAllAdversaries({ dryRun: false })).finally(() => { btn.disabled = false; });
    });
    (root.querySelector(".directory-footer") ?? root).append(btn);
  } catch (e) { console.error("Edha Content | adversary sync-all button failed", e); }
});

