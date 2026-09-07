/* ==============================================================================================
 * NATIVE EVENT SYSTEM  (Edha behaviours hosted on the talent's own system.events / effects)
 * ----------------------------------------------------------------------------------------------
 * Talents carry their behaviour as native cosmere-rpg event rules — visible and editable on the
 * talent's Events tab — instead of (only) the parallel global hooks above. The generator emits
 * these rules from the data/talent-*.json tables. The executors below REUSE the existing helper
 * logic, so behaviour is identical; only the trigger path becomes native + inspectable.
 *
 * Registered at `init` (after the system's init exposes cosmereRPG.api): Foundry v13 initializes
 * world documents BEFORE the "setup" hook, so event/handler types must exist by end of init or
 * owned talents fail schema validation and are dropped. The system wires per-type hooks at
 * `ready` (index.js ~L11975). Handlers/behaviours are read at fire time, so timing is loose.
 * ============================================================================================ */

// Resolve the presumed killer for an on-defeat event (the hook only names the victim).
function edhaResolveKiller(victim) {
  for (const t of (canvas?.tokens?.controlled ?? [])) if (t.actor && t.actor !== victim) return t.actor;
  if (game.user?.character && game.user.character !== victim) return game.user.character;
  if (game.user?.isGM) { const a = game.combat?.combatant?.actor; if (a && a !== victim) return a; }
  return null;
}

// Build the legacy trigger `spec` (consumed by edhaFireTrigger/edhaRunTriggerEffect) from a native
// edha-triggered-effect handler's flat config fields.
function edhaTrigSpecFromCfg(cfg) {
  return {
    effect: {
      kind: cfg.kind, formula: cfg.formula, damageType: cfg.damageType,
      target: cfg.target, radius: cfg.radius, nearAffects: cfg.nearAffects || "all", statusId: cfg.statusId || "",
      statusExpire: cfg.statusExpire || "",   // "owner"/"target" → timed stamp instead of a permanent toggle (07-16b)
      // target: "list-members" (07-24u) — the ledger to read and how to gate it by range.
      listName: cfg.listName || "", listStatus: cfg.listStatus || "", rangeColor: cfg.rangeColor || "",
      // multi-target prompt mode (2bU — Investiture of Command's "up to 3 allies").
      maxTargets: Number(cfg.maxTargets) || 0, requireDisposition: cfg.requireDisposition || "",
      resourceGain: cfg.resourceGainResource ? { resource: cfg.resourceGainResource, value: cfg.resourceGainValue || 0 } : null,
    },
    cost: cfg.costResource ? { resource: cfg.costResource, value: cfg.costValue || 0, optional: !!cfg.costOptional } : null,
    oncePerRound: !!cfg.oncePerRound,
    whenTargetIsolated: !!cfg.whenTargetIsolated,
    note: cfg.note || "",
  };
}

// Temp HP grant from a native edha-temp-hp rule (mirrors the legacy useItem THP path).
// target "victim" (07-25, 2bT): the creature the rule's trigger resolved against — written through
// edhaGrantTempHpCross, which KEEPS THE HIGHER ("does not stack") and relays through the GM when the
// local client cannot write the creature. Sovereign's Favor's grant, verbatim.
async function edhaApplyTempHp(item, cfg, options = null) {
  if (!item?.actor || !cfg?.formula) return;
  const roll = await (new Roll(cfg.formula, item.actor.getRollData())).evaluate();
  if (cfg.target === "victim") {
    const victim = options?.victim ?? null;
    if (!victim) { ui.notifications?.warn(`Edha: ${item.name} found no creature for its Temp HP.`); return; }
    const thp = Math.max(0, Math.floor(roll.total));
    await edhaGrantTempHpCross(victim, thp, item.name);
    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: item.actor }), flavor: `${item.name} — Temp HP → <strong>${victim.name}</strong>: ${thp} (keeps the higher — does not stack).` });
    return;
  }
  const { actor: target, via } = edhaThpTarget(item, cfg.target || "targeted");
  if (!target) { ui.notifications?.warn(`Edha: ${item.name} found no target for Temp HP.`); return; }
  await edhaWriteTempHp(target, roll.total, item.name);
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: item.actor }), flavor: `${item.name} — Temp HP → <strong>${target.name}</strong> (${via}): ${roll.total}, replacing any previous.` });
}

/* --- Dangerous terrain: Foundry v13 Region with the edha-content.hazard behaviour ------------- */
/* Regions render as GM-only overlays — at the 2026-06-11 playtest, players walked into Demolisher's
 * Pyre because the fire was INVISIBLE to them. Every hazard Region now gets a paired player-visible
 * Drawing (flame-colored circle); deleting the Region (or the GM clearing terrain) removes it too. */
async function edhaHazardVisual(scene, cx, cy, radiusPx, hex, regionId, label) {
  try {
    const [d] = await scene.createEmbeddedDocuments("Drawing", [{
      x: cx - radiusPx, y: cy - radiusPx,
      shape: { type: "e", width: radiusPx * 2, height: radiusPx * 2 },
      strokeColor: hex, strokeWidth: 4, strokeAlpha: 0.9,
      fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: hex, fillAlpha: 0.18,
      text: label || "🔥 Dangerous Terrain", fontSize: Math.max(16, Math.round(radiusPx / 3)), textColor: hex, textAlpha: 0.9,
      flags: { "edha-content": { hazardVisual: { regionId } } },
    }]);
    return d ?? null;
  } catch (e) { console.error("Edha Content | hazard visual failed", e); return null; }
}
Hooks.on("deleteRegion", (region) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const scene = region.parent; if (!scene) return;
    const paired = (scene.drawings ?? []).filter(d => d.getFlag?.("edha-content", "hazardVisual")?.regionId === region.id);
    if (paired.length) void scene.deleteEmbeddedDocuments("Drawing", paired.map(d => d.id));
  } catch (e) { console.error("Edha Content | hazard visual cleanup failed", e); }
});
/* --- SQUARE terrain toolkit (2026-07-12 region rework, Ben pass 3: "I do not like circular Pyre
 * regions. Make them the same shape as the Foundation … expansion square-by-square … a way to
 * remove the region by the player") --------------------------------------------------------------
 * Regions hold MULTIPLE rectangle shapes — square-by-square growth = pushing one grid-cell rect
 * per expansion, each with its own small visual Drawing (same hazardVisual.regionId flag, so the
 * deleteRegion sweep above clears them all). */
function edhaSnapCellRect(scene, x, y, cells = 1) {
  const gs = scene?.grid?.size || 100;
  const w = gs * cells;
  return { x: Math.round((x - w / 2) / gs) * gs, y: Math.round((y - w / 2) / gs) * gs, w, h: w };
}
async function edhaSquareVisual(scene, x, y, w, h, hex, regionId, label) {
  try {
    const [d] = await scene.createEmbeddedDocuments("Drawing", [{
      x, y, shape: { type: "r", width: w, height: h },
      strokeColor: hex, strokeWidth: 4, strokeAlpha: 0.9,
      fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: hex, fillAlpha: 0.18,
      text: label || "", fontSize: Math.max(14, Math.round(w / 5)), textColor: hex, textAlpha: 0.9,
      flags: { "edha-content": { hazardVisual: { regionId } } },
    }]);
    return d ?? null;
  } catch (e) { console.error("Edha Content | square visual failed", e); return null; }
}
function edhaRectsOf(region) { return (region?.shapes ?? []).filter(s => s.type === "rectangle" && !s.hole); }
function edhaRectAdjacent(region, r) {   // touching or overlapping any existing rect (Chebyshev on bounds)
  return edhaRectsOf(region).some(s =>
    r.x <= s.x + s.width + 1 && r.x + r.w >= s.x - 1 && r.y <= s.y + s.height + 1 && r.y + r.h >= s.y - 1);
}
function edhaRectCovered(region, r) {    // the cell's center is already inside an existing rect
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return edhaRectsOf(region).some(s => cx >= s.x && cx <= s.x + s.width && cy >= s.y && cy <= s.y + s.height);
}
// GM-side: add one grid cell to a square-terrain Region + its visual. Returns true if grown.
async function edhaGrowTerrainSquareGM(sceneId, regionId, x, y) {
  try {
    const scene = game.scenes?.get(sceneId); const region = scene?.regions?.get(regionId); if (!region) return false;
    const cell = edhaSnapCellRect(scene, x, y, 1);
    if (edhaRectCovered(region, cell)) { ui.notifications?.warn("Edha: that square is already burning."); return false; }
    if (!edhaRectAdjacent(region, cell)) { ui.notifications?.warn("Edha: pick a square ADJACENT to the existing terrain."); return false; }
    // This one PUSHES (the array length changes, so the diff was never empty and the square spread
    // did work) — but it goes through the same door so the family has exactly one shape reader.
    const shapes = edhaRegionShapes(region);
    shapes.push({ type: "rectangle", x: cell.x, y: cell.y, width: cell.w, height: cell.h, rotation: 0, hole: false });
    await region.update({ shapes });
    const hex = region.color?.css ?? region.color ?? "#d23b2e";
    await edhaSquareVisual(scene, cell.x, cell.y, cell.w, cell.h, typeof hex === "string" ? hex : "#d23b2e", region.id, "");
    return true;
  } catch (e) { console.error("Edha Content | square grow failed", e); return false; }
}
// Remove a terrain Region entirely (its visuals follow via the deleteRegion sweep). Player-safe:
// non-GMs relay ("turn off this magic fire before it burns the building down with us inside").
async function edhaRemoveTerrain(sceneId, regionId) {
  if (game.user?.isGM) { try { await game.scenes?.get(sceneId)?.regions?.get(regionId)?.delete(); } catch (e) {} return; }
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to remove the terrain."); return; }
  try { game.socket.emit("module.edha-content", { action: "remove-terrain", payload: { sceneId, regionId } }); } catch (e) {}
}
class EdhaHazardRegionBehavior extends foundry.data.regionBehaviors.RegionBehaviorType {
  static defineSchema() {
    const FF = foundry.data.fields;
    return {
      events: this._createEventsField({ events: ["tokenEnter", "tokenTurnStart"], initial: ["tokenEnter", "tokenTurnStart"] }),
      damageFormula: new FF.StringField({ required: true, initial: "1d6", label: "Damage formula (baked dice)" }),
      damageType: new FF.StringField({ required: true, initial: "energy", label: "Damage type" }),
      sourceName: new FF.StringField({ required: false, initial: "", label: "Source" }),
      /* R-6 (Ben 2026-09-06 (b)) — one actor this terrain never burns. A GENERIC dial, blank by
       * default, so no existing hazard changes behaviour; Fault Line is the only caller that fills
       * it in (see edhaFaultLine). Allies and enemies inside are still caught — the ruling spares
       * the CASTER and nobody else. */
      exemptActorUuid: new FF.StringField({ required: false, blank: true, initial: "", label: "This actor is immune to it (blank = nobody)" }),
    };
  }
  async _handleRegionEvent(event) {
    try {
      if (!edhaNoOtherActiveGM()) return;   // one applier — the PRIMITIVE half on purpose (no isGM: a GM-less table still springs it)
      const actor = event?.data?.token?.actor;
      if (!actor) return;
      if (this.exemptActorUuid && actor.uuid === this.exemptActorUuid) return;   // R-6
      const roll = await (new Roll(this.damageFormula || "0")).evaluate();
      const amt = Math.max(0, Math.floor(roll.total));
      if (amt <= 0) return;
      await actor.applyDamage?.([{ amount: amt, type: this.damageType || "energy" }], { chatMessage: false });
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p>🔥 <strong>${actor.name}</strong> takes <strong>${amt}</strong> ${this.damageType || "energy"} from dangerous terrain${this.sourceName ? ` (${this.sourceName})` : ""}.</p>`,
      });
    } catch (e) { console.error("Edha Content | hazard region event failed", e); }
  }
}

// FATE / Olvarra — Snare trigger Region. Fires on tokenEnter (stops on the square) AND tokenMoveIn (a
// PASS-THROUGH along the move path), so a foe that merely crosses the square springs the Snare. Mirrors
// the hazard behavior; carries the owner + snareId so it can resolve the right Snare and gate to enemies.
// ⚠ v13 fires BOTH events for one walk-in (~2 ms apart — the trap _edhaCivEnterGuard documents); the
// stale-check below reads the ledger before the first spring's queued consume lands, so dedupe lives
// in edhaFateSpringSnare's in-flight guard (bench run 6, 2026-07-27c), NOT here — every spring path
// shares it. `displace` does NOT bypass these events (run-6 runbook fact).
/* R-13 — the ARM decision, split out pure so it is pinnable without a Region. `armedOver` is the
 * set of token uuids that were ALREADY in the square when the snare was laid (stamped by
 * edhaFateCreateSnareRegionGM). For them the creation-time `tokenEnter` is not an entry and is
 * ignored; the first time one of them MOVES (out of the square, or within it) that IS the
 * pass-through the card promises, and the snare springs. Everyone else is unchanged: they spring
 * on enter / move-in and never on a move event, because by then the snare is consumed anyway. */
function edhaSnareArmedSpringDecision(eventName, tokenUuid, armedOver = []) {
  const grandfathered = (armedOver ?? []).includes(tokenUuid);
  const isMove = eventName === "tokenMoveOut" || eventName === "tokenMoveWithin";
  return grandfathered ? isMove : !isMove;
}
class EdhaFateSnareRegionBehavior extends foundry.data.regionBehaviors.RegionBehaviorType {
  static defineSchema() {
    const FF = foundry.data.fields;
    return {
      /* tokenMoveOut / tokenMoveWithin joined for R-13 alone: they are the ONLY events a creature
       * that was standing on the square at placement can produce, and the decision below ignores
       * them for everybody else. */
      events: this._createEventsField({ events: ["tokenEnter", "tokenMoveIn", "tokenMoveOut", "tokenMoveWithin"], initial: ["tokenEnter", "tokenMoveIn", "tokenMoveOut", "tokenMoveWithin"] }),
      ownerUuid: new FF.StringField({ required: true, initial: "", label: "Snare owner UUID" }),
      snareId: new FF.StringField({ required: true, initial: "", label: "Snare id" }),
      armedOver: new FF.ArrayField(new FF.StringField(), { required: false, initial: [], label: "Tokens standing here when it was laid (armed, not sprung)" }),
    };
  }
  async _handleRegionEvent(event) {
    try {
      if (!edhaNoOtherActiveGM()) return;   // one applier — the PRIMITIVE half on purpose (no isGM: a GM-less table still springs it)
      const actor = event?.data?.token?.actor; if (!actor) return;
      if ((actor.system?.resources?.hea?.value ?? 1) <= 0) return;       // dead tokens don't spring traps
      if (!edhaSnareArmedSpringDecision(event?.name, event?.data?.token?.uuid, this.armedOver)) return;   // R-13
      const owner = await edhaResolveActorRef(this.ownerUuid);
      if (!owner) return;
      const snare = edhaGetSnares(owner).find(s => s.id === this.snareId); if (!snare) return;   // already sprung / stale
      if (edhaSameDisposition(owner, edhaCasterToken(actor))) return;   // only ENEMIES of the owner spring it — R-63 🤖 bench row
      await edhaFateSpringSnare(owner, snare, actor);   // label = the entry's own `talent` stamp (2bX)
    } catch (e) { console.error("Edha Content | fate-snare region event failed", e); }
  }
}

// Place a scene-scoped dangerous-terrain Region centred on the caster's target (GM-side).
async function edhaPlaceHazard(item, cfg) {
  try {
    const actor = item?.actor; const scene = canvas?.scene;
    if (!actor || !scene) return null;
    if (!game.user?.isGM) { ui.notifications?.warn(`Edha: placing ${item.name}'s dangerous terrain is GM-side (ask your GM).`); return null; }
    const color = cfg.color || edhaTalentColor(item) || "red";
    const rank = edhaColorRank(actor, color);
    const sizeFt = cfg.sizeByRank ? (EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1]) : (Number(cfg.sizeFt) || EDHA_SIZE_FT[2]);
    const center = edhaUserTargetToken() ?? edhaCasterToken(actor);
    if (!center) { ui.notifications?.warn(`Edha: target a token/point for ${item.name}'s dangerous terrain.`); return null; }
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    // SQUARE region (07-12 rework, Ben: same shape as the Foundation) — sizeFt square, grid-snapped.
    const sq = edhaSnapCellRect(scene, center.center.x, center.center.y, Math.max(1, Math.round(sizeFt / gd)));
    const baked = edhaFoldDieMath(Roll.replaceFormulaData(cfg.damageFormula || "(@tier)d6", actor.getRollData(), { missing: "0" }));
    const hex = EDHA_COLOR_HEX[color] || "#d23b2e";
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${item.name} — Dangerous Terrain`,
      color: hex,
      shapes: [{ type: "rectangle", x: sq.x, y: sq.y, width: sq.w, height: sq.h, rotation: 0, hole: false }],
      behaviors: [{
        type: "edha-content.hazard", name: "Dangerous Terrain",
        system: { damageFormula: baked, damageType: cfg.damageType || "energy", sourceName: `${item.name} — ${actor.name}` },
      }],
      /* OWNERSHIP IS `terrain.ownerUuid` — the one vocabulary (07-27s; this site used to stamp a flat
       * `sourceOwnerUuid`, which no membership reader understood — see edhaTerrainOwnerUuid). */
      flags: { "edha-content": { hazard: true, scope: "scene", sourceItem: item.name,
                                 terrain: { ownerUuid: actor.uuid, color },
                                 ...(cfg.spreads ? { spreads: true } : {}) } },   // `spreads` read by the end-of-turn spread watcher (2bY — was the EDHA_PYRE_SOURCES name list)
    }]);
    if (region) await edhaSquareVisual(scene, sq.x, sq.y, sq.w, sq.h, hex, region.id, `🔥 ${item.name}`);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-trigger-card"><p>🔥 <strong>${item.name}</strong> leaves a <strong>${sizeFt} ft square</strong> of dangerous terrain — ${baked} ${cfg.damageType || "energy"} on enter / start of turn, for the scene.</p>`
        + (region ? `<button type="button" class="edha-extinguish-btn" data-edha-scene="${scene.id}" data-edha-region="${region.id}" data-edha-label="${item.name}">Extinguish (put the fire out)</button>` : "") + `</div>`,
    });
    return region;
  } catch (e) { console.error("Edha Content | place hazard failed", e); return null; }
}

function edhaRegisterNativeEventSystem() {
  const api = globalThis.cosmereRPG?.api || globalThis.game?.cosmereRPG?.api;
  // Region behaviour type (dangerous terrain) — declared in module.json documentTypes.
  try {
    if (CONFIG.RegionBehavior) {
      CONFIG.RegionBehavior.dataModels ??= {};
      CONFIG.RegionBehavior.typeLabels ??= {};
      CONFIG.RegionBehavior.dataModels["edha-content.hazard"] = EdhaHazardRegionBehavior;
      CONFIG.RegionBehavior.typeLabels["edha-content.hazard"] = "Edha: Dangerous Terrain";
      if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.hazard"] = "fa-solid fa-fire";
      CONFIG.RegionBehavior.dataModels["edha-content.fate-snare"] = EdhaFateSnareRegionBehavior;
      CONFIG.RegionBehavior.typeLabels["edha-content.fate-snare"] = "Edha: Snare Trigger";
      if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.fate-snare"] = "fa-solid fa-link";
      CONFIG.RegionBehavior.dataModels["edha-content.fortified"] = EdhaCivFortifiedRegionBehavior;
      CONFIG.RegionBehavior.typeLabels["edha-content.fortified"] = "Edha: Fortified Foundation";
      if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.fortified"] = "fa-solid fa-chess-rook";
      // EXPERIMENT (no-ship-on-failure): the disposition-filtered movement cost — its own try so a
      // throw here can never take the three types above down with it.
      try {
        const EnemyCost = edhaBuildEnemyCostBehavior();
        if (EnemyCost) {
          CONFIG.RegionBehavior.dataModels["edha-content.enemy-cost"] = EnemyCost;
          CONFIG.RegionBehavior.typeLabels["edha-content.enemy-cost"] = "Edha: Difficult Terrain (enemies only)";
          if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons["edha-content.enemy-cost"] = "fa-solid fa-person-walking-dashed-line-arrow-right";
          _edhaEnemyCostRegistered = true;
        }
      } catch (e) { console.warn("Edha Content | enemy-cost experiment NOT registered — Bastion keeps the native blind cost (Ben R3)", e); }
    }
  } catch (e) { console.warn("Edha Content | hazard region behaviour registration failed", e); }

  if (!api?.registerItemEventType || !api?.registerItemEventHandlerType) {
    console.warn("Edha Content | cosmereRPG API not available — native event/handler types NOT registered.");
    return false;
  }
  // ONE registration loop (item 24, 2026-09-06). The definitions live in EDHA_EVENT_TYPES /
  // EDHA_HANDLER_TYPES below — same order, same objects the sequential calls used to pass. Adding a
  // type = adding a row; tests/handler-registry.test.js pins the registered shape and that this
  // loop is the only registration site.
  for (const def of EDHA_EVENT_TYPES) api.registerItemEventType(def);
  for (const def of EDHA_HANDLER_TYPES) api.registerItemEventHandlerType(def);

  // Derived from the tables so the line can never list a retired type again (it named
  // `aoe-template` for a day after R-78 / item 48 retired it — item 71).
  const edhaTypeList = (defs) => defs.map((d) => String(d.type).replace(/^edha-/, "")).join(", ");
  const edhaRegionList = Object.keys(globalThis.CONFIG?.RegionBehavior?.dataModels ?? {}).filter((k) => k.startsWith("edha-content.")).join(", ");
  console.log(`Edha Content | native event system registered (${EDHA_EVENT_TYPES.length} events: ${edhaTypeList(EDHA_EVENT_TYPES)}; ${EDHA_HANDLER_TYPES.length} handlers: ${edhaTypeList(EDHA_HANDLER_TYPES)}; region: ${edhaRegionList || "none"}).`);
  return true;
}

/* ---- THE REGISTRY TABLES (item 24, 2026-09-06) ------------------------------------------------
 * EDHA_EVENT_TYPES / EDHA_HANDLER_TYPES are the definitions edhaRegisterNativeEventSystem() used
 * to make as ~100 sequential api.register*Type(...) calls. They are DATA now: one array element
 * per type, in the original registration order, each the exact object the system's
 * registerItemEventType / registerItemEventHandlerType receives (the system binds `this` in an
 * executor to the handler DataModel via executor.call(this, event) — the element shape is the
 * call's argument, untouched, so that binding and every closure are preserved). Built inside an
 * IIFE so `FF`, `choices` and the deal-damage debounce map stay private to the tables rather
 * than leaking into module scope. Exposed read-only on the edha API (edha.EDHA_HANDLER_TYPES) and
 * evaluated headlessly by tests/harness.js loadHandlerRegistry() — which is how
 * scripts/handler-schemas.js (lint pass 9/9b, the item-64 build guard) reads the schemas now
 * instead of regex-parsing this source. To add a handler: add a row. Keep the tables next to the
 * loop above; the section banner's ledger of what each type owns is unchanged. */
const { EDHA_EVENT_TYPES, EDHA_HANDLER_TYPES } = (() => {
  const FF = foundry.data.fields;
  const choices = (...vals) => vals.reduce((o, v) => (o[v] = v || "(none)", o), {});

  /* ---- EVENT TYPES ---- */
  // The system fires cosmere-rpg.damageRoll TWICE per rollDamage (main roll + graze roll), so one
  // logical "you dealt damage" would dispatch twice. Debounce per rolling item: only the first fire
  // within 400ms counts (graze rolls also carry options.graze when distinguishable).
  const _edhaDealDebounce = new Map();
  const EDHA_EVENT_TYPES = [
  {
    source: "edha-content", type: "edha-deal-damage",
    label: "Edha: After You Deal Damage", description: "Fires after any of your items rolls damage.",
    hook: "cosmere-rpg.damageRoll",
    condition: (roll, src) => {
      try {
        if (!src?.actor) return false;                       // only owned items can trigger owner rules
        if (roll?.options?.graze) return false;              // explicit graze marker (when present)
        const key = src.uuid ?? src.id ?? src.name;
        const now = Date.now(), last = _edhaDealDebounce.get(key) || 0;
        if (now - last < 400) return false;                  // second fire of the same roll (graze)
        _edhaDealDebounce.set(key, now);
        return true;
      } catch (e) { return false; }
    },
    transform: (roll, src) => ({ document: src?.actor ?? src, options: { roll, sourceItem: src } }),
  },
  {
    source: "edha-content", type: "edha-on-defeat",
    label: "Edha: When You Defeat a Creature", description: "Fires for you when a creature you damage drops to 0 HP.",
    hook: "cosmere-rpg.applyDamage",
    condition: (target, damage) => {
      try {
        if (_edhaInTrigger) return false;                    // a trigger's own damage must not chain kills
        if ((Number(damage?.dealt) || 0) <= 0) return false; // healing / zero never defeats
        return (target?.system?.resources?.hea?.value ?? 1) <= 0;
      } catch (e) { return false; }
    },
    transform: (target, damage) => ({ document: edhaResolveKiller(target) ?? target, options: { victim: target, damage } }),
  },
  {
    source: "edha-content", type: "edha-take-damage",
    label: "Edha: After You Take Damage", description: "Fires for the victim after damage is applied to them.",
    hook: "cosmere-rpg.applyDamage",
    condition: (target, damage) => {
      try {
        if (_edhaInTrigger) return false;
        return (Number(damage?.dealt) || 0) > 0;
      } catch (e) { return false; }
    },
    transform: (target, damage) => ({ document: target, options: { damage, victim: target } }),
  },
  {
    source: "edha-content", type: "edha-apply-watch",
    label: "Edha: Damage/Heal-Application Watcher", description: "Config-only rule read by the apply-damage engine (overflow Temp HP, damage conversion, marked-target triggers, HP-threshold prompts).",
    hook: "edha-content.noop-apply-watch", // sentinel: never fired; the applyDamage wrapper reads these rules
  },
  {
    source: "edha-content", type: "edha-pre-deal-damage",
    label: "Edha: Passive Damage Rider", description: "Adds bonus damage to your matching damage rolls (applied automatically by the system).",
    hook: "edha-content.noop-rider",   // sentinel: never fired; the rollDamage wrapper reads this rule
  },
  {
    source: "edha-content", type: "edha-pre-test",
    label: "Edha: Test Modifier Rider", description: "Adds a bonus to your matching skill/attack TEST (applied automatically via the system's temporary modifier).",
    hook: "edha-content.noop-test-rider",   // sentinel: never fired; the pre{Skill|Attack|Item}Roll injector reads this rule
  },
  {
    source: "edha-content", type: "edha-on-hit",
    label: "Edha: When You Hit (Apply Damage)", description: "Fires when YOUR attack actually deals damage to a creature (a real hit — not just a roll). Pair with an Edha: Triggered Effect.",
    hook: "edha-content.noop-on-hit",   // sentinel: never fired by the system; the applyDamage wrapper dispatches these
  },
  {
    source: "edha-content", type: "edha-watch-rule",
    label: "Edha: Watch Rule (config only)", description: "Holds an Edha: Watch handler. Never fires by itself — the watch sweep reads these rules when another document resolves a test or rolls a skill. Put the payload on the sibling 'When Your Test SUCCEEDS' / 'FAILS' rules.",
    hook: "edha-content.noop-watch-rule",   // sentinel: never fired; edhaDispatchWatchers reads these rules
  },
  {
    source: "edha-content", type: "edha-pre-use",
    label: "Edha: Before This Is Used", description: "Fires on the acting client when this item is used, BEFORE its cost is paid and before it rolls — any handler works. An Edha: Point Burst rule here additionally TAKES OVER the use (the engine resolves the burst itself and cancels the default single-target flow). Anything else runs as a rider and lets the normal use proceed.",
    hook: "edha-content.noop-pre-use", // fired by the edha-pre-use dispatcher on cosmere-rpg.preUseItem (07-28); edha-burst rules are read directly by the takeover instead
  },
  {
    source: "edha-content", type: "edha-combat-timing",
    label: "Edha: Combat-Timed Passive", description: "Active during a combat-timing window (e.g. round start until your turn). The engine's combat hooks read this rule's config.",
    hook: "edha-content.noop-combat-timing", // sentinel: never fired; the combat hooks read this rule
  },
  {
    source: "edha-content", type: "edha-draw-mana",
    label: "Edha: When You Draw Mana", description: "Fires on the owner's client each time they use the Draw Mana action — this is how a Leyline Attunement Key carries its own rider. Any handler works. The Keys are Always Active, so they can never fire a plain 'use' event; this is the event they get instead.",
    hook: "edha-content.noop-draw-mana",   // sentinel: never fired; edhaDispatchDrawMana dispatches these
  },
  {
    source: "edha-content", type: "edha-ritual-paid",
    label: "Edha: When You Pay Ritual HP", description: "Fires for the caster after one of their talents' Edha: Ritual HP Cost rules deducts health — this is how an Always-Active ritual passive carries its own rider (the advantage on your next Black test, the Reserve banking). Paying the price from Reserve instead of health does NOT fire it. Any handler works.",
    hook: "edha-content.noop-ritual-paid",   // sentinel: never fired; edhaDispatchRitualPaid dispatches these
  },
  {
    source: "edha-content", type: "edha-opportunity",
    label: "Edha: When You Roll an Opportunity", description: "The PAYLOAD of an Opportunity spend. Put an Edha: Opportunity Option on this talent to add its button to the Opportunity-spend menu, then put what actually happens here — any handler works, exactly as on a gated test's success. Rules here run when the player clicks that button, after its resource cost is deducted (07-25).",
    hook: "edha-content.noop-opportunity",   // sentinel: never fired; the post-roll Opportunity watcher reads these rules
  },

  {
    source: "edha-content", type: "edha-test-success",
    label: "Edha: When Your Test SUCCEEDS", description: "Fires when this talent's own Edha: Gated Test rule beats its target. Put the talent's payload rules on this event — any handler works.",
    hook: "edha-content.noop-test-success",   // sentinel: never fired; edhaDispatchTestResult dispatches these
  },
  {
    source: "edha-content", type: "edha-test-fail",
    label: "Edha: When Your Test FAILS", description: "Fires when this talent's own Edha: Gated Test rule does NOT beat its target (Synchronized Assault's reduced effect, Absolute Authority's consolation Weakened). Leave it empty if a failure should do nothing.",
    hook: "edha-content.noop-test-fail",      // sentinel: never fired; edhaDispatchTestResult dispatches these
  },
  ];

  /* ---- HANDLER TYPES (config schemas auto-render in the rule editor) ---- */
  const EDHA_HANDLER_TYPES = [
  {
    source: "edha-content", type: "edha-cae-grant",
    label: "Edha: Grant / Burn Action Economy", description: "Add a named Action or Reaction group to the Cosmere Advanced Encounters tracker, or burn one of the target's Reactions. Falls back to a plain chat note when CAE is off or there is no combat, so the talent still reads correctly at the table.",
    config: { schema: {
      kind: new FF.StringField({ required: true, initial: "action", choices: choices("action", "reaction", "burn-reaction"), label: "What to do", hint: "action / reaction = GRANT that many. burn-reaction = spend one of the TARGET's Reactions (Tactical Ploy, Feinting Strike)." }),
      n: new FF.NumberField({ required: false, initial: 1, label: "How many" }),
      target: new FF.StringField({ required: false, initial: "self", choices: choices("self", "target", "victim"), label: "Who gets it", hint: "self = the user. target = the creature you have targeted (Through the Fray grants an ally a Reaction; burn-reaction almost always wants target). victim = the creature this rule's trigger resolved against or hit — use it on an on-hit or watch payload, where your CURRENT targets are the wrong thing to read (the damage-applying client is often the GM). 07-24s." }),
      label: new FF.StringField({ required: false, blank: true, initial: "", label: "Tracker group name", hint: "Shown on the CAE tracker as 'Edha: <this>'. Blank uses the talent's name. Say what the actions are FOR — the tracker cannot enforce it (e.g. 'Brace / Gain Advantage')." }),
      whenDeflectBelow: new FF.NumberField({ required: false, initial: 0, label: "Only while deflect is below", hint: "0 = no gate. Sidestep only grants its Dodge reaction while you are not wearing deflect-2+ armour." }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      const who = this.target === "victim" ? edhaResolveVictim(event)
        : this.target === "target" ? edhaUserTargetActor() : owner;
      if (!who) { ui.notifications?.warn(`Edha: ${item.name} — target the creature first, then use it again.`); return; }
      const gate = Number(this.whenDeflectBelow) || 0;
      if (gate > 0 && (Number(owner.system?.deflect?.value) || 0) >= gate) return;   // Sidestep in heavy armour: silent no-op
      const n = Math.max(1, Number(this.n) || 1);
      const label = this.label || item.name;
      const tracked = await edhaCaeGrant(who, this.kind, n, label);
      const burn = this.kind === "burn-reaction";
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>⚡ <strong>${item.name}</strong>: ${burn ? `${who.name} loses one Reaction` : `${who === owner ? "you gain" : `${who.name} gains`} ${n} ${this.kind}${n === 1 ? "" : "s"} — ${label}`}`
          + `${tracked ? " (on the tracker)" : " (no tracker in this scene — honour-system)"}.</p>` });
    },
  },
  {
    source: "edha-content", type: "edha-enter-stance",
    label: "Edha: Enter a Stance", description: "Put the user into one of their own stance talents. Pair with Edha: Combat-Timed Passive to start every combat in a stance (Practiced Kata).",
    config: { schema: {
      stance: new FF.StringField({ required: true, initial: "", label: "Stance talent name", hint: "The name of the stance talent to enter — it must be on the same actor and be a stance (system.modality). A NAME here is fine: it is authored data you can edit, not engine code." }),
      unlessStatus: new FF.StringField({ required: false, blank: true, initial: "surprised", label: "Skip while the user has this status", hint: "Practiced Kata does not apply while Surprised. Blank = always." }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner || !this.stance) return;
      if (this.unlessStatus && owner.statuses?.has?.(this.unlessStatus)) return;
      const target = owner.items?.find(i => edhaIsTalent(i) && i.name === this.stance && i.system?.modality === "stance");
      if (!target) { console.warn(`Edha Content | ${item.name}: no stance talent named "${this.stance}" on ${owner.name}`); return; }
      if (edhaActiveStance(owner) === target.name) return;   // already there — toggling would LEAVE it
      await edhaToggleStance(target);
    },
  },
  {
    source: "edha-content", type: "edha-def-test",
    label: "Edha: Gated Test (On Use)", description: "Roll this talent's own test and gate its payload on the result. YOU roll it on the talent's card; the engine captures that roll and compares it. Put what happens on the sibling 'When Your Test SUCCEEDS' / 'FAILS' rules — this handler only decides.",
    config: { schema: {
      skill: new FF.StringField({ required: true, initial: "", label: "Your test", hint: "The skill id YOU roll — leyline colors are skill ids too (blue, black, red, white, green), which is why one field covers both atlases. e.g. dis, ath, dec, ldr, ded, per, med." }),
      vs: new FF.StringField({ required: true, initial: "defense", choices: choices("defense", "skill", "dc", "prompt-dc", "none"), label: "Tested against", hint: "defense = a static defense · skill = an opposed SKILL the ENGINE rolls for the foe (never trust a player to have won — iron rule 3) · dc = a flat number printed on the card · prompt-dc = ask for the DC when your roll resolves (Counterpoint: the enemy's influence result, which no field can know in advance). Declining the prompt resolves fail-open, the standing §9m q9 convention. · none = NO test at all — every subject succeeds immediately, on use, with no roll captured (Unravel Everything's detonation; only meaningful with a ledger sweep below)." }),
      def: new FF.StringField({ required: false, blank: true, initial: "cog", choices: choices("", "phy", "cog", "spi"), label: "Which defense (vs = defense)" }),
      targetSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Foe's skill (vs = skill)", hint: "e.g. ath, sur, dis — the engine rolls 1d20 + rank + attribute for them." }),
      dc: new FF.NumberField({ required: false, initial: 0, label: "Flat DC (vs = dc)", hint: "Grand Deception and Field Medicine are both DC 15." }),
      requireTarget: new FF.BooleanField({ required: false, initial: true, label: "Require a target", hint: "Vetoes the use BEFORE any cost is paid when nothing is targeted." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Attunement Range colour", hint: "Blank = no range gate. Set it (e.g. black) to veto — again before cost — when the target is outside your Attunement Range for that colour." }),
      requireTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Target must have one of these statuses", hint: "Comma-list, vetoed BEFORE cost. Absolute Authority only works on a creature that is already compelled, frightened or weakened. Blank = no gate." }),
      requireDisposition: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "ally", "enemy"), label: "Target must be (checked BEFORE cost)", hint: "Blank = anyone. Censure only reaches an enemy; the veto fires before any cost is paid. 07-25." }),
      skipIfAlly: new FF.BooleanField({ required: false, initial: false, label: "A willing (same-side) target skips the test", hint: "The target's consent stands in for the roll: a same-disposition target resolves as an immediate SUCCESS with no test compared (Death Ward's willing branch — consent owner-judged at targeting). A hostile target still tests. 2bW." }),
      requireTargetOnList: new FF.StringField({ required: false, blank: true, initial: "", label: "Target must be on YOUR sustained ledger (checked BEFORE cost)", hint: "An Edha: Sustained List name (e.g. edicts). Verdict only reaches a creature bound by one of YOUR Edicts — the shared marker status is not enough. Blank = no gate. 2bV." }),
      requireTargetOnListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…that ledger's marker status", hint: "Blank = the ledger name. Order's ledger is `edicts` but its marker is `edict`." }),
      targetCounter: new FF.StringField({ required: false, blank: true, initial: "", label: "Test the bearer of this counter instead", hint: "A counter status id (e.g. insight). The test's target is then the creature bearing YOUR counter — no user target is read, and the use is vetoed pre-cost when you have no bearer (Killing Blow: 'the creature bearing your Insight'). 07-25." }),
      targetList: new FF.StringField({ required: false, blank: true, initial: "", label: "Sweep the members of this ledger instead", hint: "An Edha: Sustained List name (e.g. omens). The OWNER-SWEEP mode (Cascade Collapse / Unravel Everything): ONE shared roll, then EVERY creature on the ledger is gated on its OWN bar, and the success/fail rules run once per member (victim = that member). No user target is read. Downed members are skipped. 07-25 pass 2bU." }),
      targetListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Ledger marker status (sweep mode)", hint: "Blank = the ledger name. Chaos's ledger is `omens` but its marker is `omen`, so it has to be set." }),
      targetListRange: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Only members within Attunement Range (sweep mode)", hint: "Blank = every member, wherever it stands (Unravel Everything — the card's range clause binds the PLACEMENT, not the detonation). Cascade Collapse sweeps Blue range. Both tokens must be on the map." }),
      oncePerScene: new FF.BooleanField({ required: false, initial: false, label: "Once per scene", hint: "Vetoed BEFORE cost on a repeat (The Final Study). Cleared when the encounter ends. 07-25." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note", hint: "Appended to the result card — say what a success means when the payload is table-run." }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      if (this.oncePerScene) await edhaStampSceneOnce(owner, item);
      /* THE OWNER-SWEEP (07-25, 2bU — Cascade Collapse / Unravel Everything). One shared roll, every
       * ledger member gated on its OWN bar, the talent's success/fail rules dispatched per member.
       * Reuses edhaEffectTargets' list-members resolution wholesale (mark-wins reconcile, downed
       * skip, the both-tokens range rule) so the sweep and the payloads read the SAME roster. */
      if (this.targetList) {
        const cfgS = { vs: this.vs, dc: Number(this.dc) || 0, def: this.def, note: this.note };
        const sweep = async (total) => {
          const members = edhaEffectTargets(owner, { target: "list-members", listName: this.targetList,
            listStatus: this.targetListStatus || "", rangeColor: this.targetListRange || "" }, {});
          const lines = [];
          for (const m of members) {
            let ok = true, dc = null;
            if (cfgS.vs === "defense") ({ ok, dc } = edhaDefTestOutcome(total, { vs: "defense", dc: 0, defValue: edhaReadDefense(m, cfgS.def || "cog"), oppRoll: null }));
            else if (cfgS.vs === "dc") ({ ok, dc } = edhaDefTestOutcome(total, { vs: "dc", dc: cfgS.dc }));
            const fired = await edhaDispatchTestResult(owner, item, m, ok, { total, dc, skill: this.skill || null, def: cfgS.vs === "defense" ? (cfgS.def || "cog") : null });
            lines.push(`${m.name}: <strong>${ok ? "affected" : `resists (${String(cfgS.def || "cog").toUpperCase()} ${dc ?? "?"})`}</strong>${ok && !fired ? " (no payload rule — resolve at the table)" : ""}`);
          }
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<p><strong>${item.name}</strong>${total != null ? ` — ${total}` : ""}, sweeping your ${this.targetList}${this.targetListRange ? ` within Attunement Range (${this.targetListRange})` : ""}:</p>`
              + `<p style="font-size:.95em">${lines.length ? lines.join("<br>") : "no creatures on the ledger"}</p>`
              + `${cfgS.note ? `<p style="opacity:.85;font-size:.9em">${cfgS.note}</p>` : ""}` });
        };
        if (this.vs === "none") { await sweep(null); return; }
        edhaQueueContest(owner, this.skill, async ({ total }) => sweep(total));
        return;
      }
      const ttok = edhaUserTargetToken();
      let target = ttok?.actor ?? null;
      if (this.targetCounter) {
        target = await edhaCounterBearerOf(owner, String(this.targetCounter).trim());
        if (!target) { ui.notifications?.warn(`Edha: no creature bears your ${edhaConditionLabel(this.targetCounter) || this.targetCounter} for ${item.name}.`); return; }
      } else if (this.requireTarget !== false && !target) {
        ui.notifications?.warn(`Edha: ${item.name} — target the creature, then use it again.`);
        return;
      }
      // WILLING BYPASS (2bW — Death Ward): a same-side target consents, so there is no test to
      // compare; the payload fires as an immediate success. The system's own use card still posts.
      if (this.skipIfAlly && target && !edhaDisposHostile(owner, target)) {
        const fired = await edhaDispatchTestResult(owner, item, target, true, { total: null, dc: null, skill: this.skill || null, def: null });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p><strong>${item.name}</strong>: ${target.name} is willing — no test needed${!fired ? " (no payload rule on this talent — resolve at the table)" : ""}.${this.note ? ` <span style="opacity:.85;font-size:.9em">${this.note}</span>` : ""}</p>` });
        return;
      }
      const cfg = { vs: this.vs, dc: Number(this.dc) || 0, def: this.def, targetSkill: this.targetSkill, note: this.note };
      edhaQueueContest(owner, this.skill, async ({ total }) => {
        let defValue = null, oppRoll = null;
        if (cfg.vs === "prompt-dc") {
          // Asked at resolve time (Counterpoint: the influence result). Declined → dc null → fail-open.
          const asked = await edhaPromptDC(`${item.name} — enter the DC`, `${owner.name} rolled <strong>${total}</strong>. Enter the opposing result (the DC) to resolve.`);
          cfg.vs = "dc"; cfg.dc = (typeof asked === "number") ? asked : null;
        }
        if (cfg.vs === "defense") defValue = target ? edhaReadDefense(target, cfg.def || "cog") : null;
        else if (cfg.vs === "skill") oppRoll = target ? await edhaRollOpposedSkill(target, cfg.targetSkill) : null;
        const { ok, dc } = edhaDefTestOutcome(total, { vs: cfg.vs, dc: cfg.dc, defValue, oppRoll });
        const barLabel = cfg.vs === "skill" ? `${String(cfg.targetSkill || "").toUpperCase()} ${dc ?? "?"}`
          : cfg.vs === "dc" ? `DC ${dc ?? "?"}`
          : `${String(cfg.def || "cog").toUpperCase()} ${dc ?? "?"}`;
        // skill + def travel with the result so an H8 watcher can filter on them (Crown of Thorns
        // wants "a BLACK or RED talent tested vs COGNITIVE", which is unknowable from ok/total alone).
        const fired = await edhaDispatchTestResult(owner, item, target, ok, { total, dc, skill: this.skill, def: cfg.vs === "defense" ? (cfg.def || "cog") : null });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p><strong>${item.name}</strong>: ${total} vs ${target ? `${target.name}'s ` : ""}${barLabel} — <strong>${ok ? "SUCCESS" : "FAIL"}</strong>`
            + `${!fired && ok ? " (no payload rule on this talent — resolve at the table)" : ""}.`
            + `${cfg.note ? ` <span style="opacity:.85;font-size:.9em">${cfg.note}</span>` : ""}</p>` });
      });
    },
  },
  /* H8 (07-24q). The OBSERVER — see the block comment above edhaWatchMatches for why neither event
   * system could express this. Gate only, exactly like edha-def-test, and it dispatches the SAME two
   * events onto the watching talent, so every existing payload handler works unchanged. */
  {
    source: "edha-content", type: "edha-watch",
    label: "Edha: Watch (react to another talent's test or roll)", description: "This talent reacts to something ANOTHER document did — a test another of your talents resolved, or any skill roll you made. Put what happens on the sibling 'When Your Test SUCCEEDS' / 'FAILS' rules, exactly as for a gated test; this handler only decides whether the observation counts.",
    config: { schema: {
      watch: new FF.StringField({ required: true, initial: "test", choices: choices("test", "skill-roll", "defeat", "focus-change", "turn-start", "die-step", "token-move", "damaged"), label: "What to watch", hint: "test = a gated test (Edha: Gated Test) that resolved · skill-roll = any skill test roll, including ones no talent gated (Extract Thought rides every Deception roll) · defeat = a creature dropped to 0 HP · focus-change = a creature LOST focus (the observed value is its new focus) · turn-start = a creature began its turn (the observed value is its CURRENT focus, so 'at most 0' is Puppeteer's gate) · die-step = an Edha: Step a Damage Die entry landed (the observed skill is the ENTRY KEY — Sovereign's Favor filters whenSkill 'exalt'; the observed value is the signed steps; the payload's victim is the stepped creature) · token-move = YOUR token's movement crossed an other-side living creature's space, one event per creature crossed (Unstoppable Advance's trample — pair with requireSelfStatus + once: arm-per-target; the payload's victim is the crossed creature. 2bU) · damaged = a creature took real damage; the observed value is how many times it has been damaged THIS ROUND, so 'at least 2' + once: round-per-target is Breaking Point's second-blow gate (want payloadTarget 'actor'; set includeSelf OFF unless your own wounds count. 2bY)." }),
      scope: new FF.StringField({ required: true, initial: "self", choices: choices("self", "scene"), label: "Whose events", hint: "self = only your OWN actor's (Crown of Thorns, Extract Thought — a sibling talent's event, which rules otherwise never see) · scene = anyone's, filtered below." }),
      payloadTarget: new FF.StringField({ required: false, initial: "victim", choices: choices("victim", "actor"), label: "The payload acts on", hint: "victim = the creature the observed TEST resolved against (the usual for test / skill-roll) · actor = the creature the event happened to — the one that dropped, or the one that lost focus. The subject-only kinds want 'actor'." }),
      whenSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Only these skills/colours", hint: "Comma-list, blank = any. Leyline colours are skill ids, so one field covers both atlases: 'black,red' for Crown of Thorns, 'dec' for Extract Thought." }),
      whenVs: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "phy", "cog", "spi"), label: "Only tests against this defense", hint: "Blank = any. Crown of Thorns only rides tests vs Cognitive." }),
      whenOutcome: new FF.StringField({ required: false, initial: "any", choices: choices("any", "success", "fail"), label: "Only on this outcome", hint: "any = fires whether the observed test hit or missed (Crown of Thorns pings on either). Ignored by the kinds that have no outcome." }),
      whenTotal: new FF.StringField({ required: false, initial: "any", choices: choices("any", "at-most", "at-least"), label: "Only when the observed value is", hint: "The observed value is the roll total for a test, and the creature's NEW focus for focus-change. Predatory Insight is 'at-most 0' — it fires when any character reaches 0 focus." }),
      whenTotalValue: new FF.NumberField({ required: false, initial: 0, label: "…this number" }),
      vs: new FF.StringField({ required: false, initial: "none", choices: choices("none", "defense", "skill", "dc"), label: "Your own test against", hint: "none = the observation itself is the trigger. Otherwise the observed roll's total is compared, exactly as for a gated test — Extract Thought re-uses its Deception total against the target's Spiritual." }),
      def: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "phy", "cog", "spi"), label: "Which defense (your test vs = defense)" }),
      targetSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Foe's skill (your test vs = skill)" }),
      dc: new FF.NumberField({ required: false, initial: 0, label: "Flat DC (your test vs = dc)" }),
      requireSelfStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only while YOU have this status", hint: "The scene-arming gate: Crown of Thorns only rides tests while you are 'crowned'. Pair with an Edha: Apply Status To Yourself rule on use." }),
      requireTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the creature has this status" }),
      whenOnMyList: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the creature is on YOUR sustained ledger", hint: "An Edha: Sustained List name (e.g. quarry). The subject of the observed event must be on the WATCHER's own ledger — Cold Eyes only fires when the creature that dropped is YOUR quarry, not anyone's kill. Blank = no gate. 2bZ." }),
      whenOnMyListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…that ledger's marker status", hint: "Blank = the ledger name." }),
      disposition: new FF.StringField({ required: false, initial: "any", choices: choices("any", "enemy", "ally"), label: "Whose events (scope = scene)", hint: "Relative to you: enemy = only creatures hostile to you." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Within Attunement Range (scope = scene)", hint: "Blank = any distance." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Within this many feet (scope = scene)", hint: "0 = any distance." }),
      includeSelf: new FF.BooleanField({ required: false, initial: true, label: "Also watch your own events (scope = scene)" }),
      once: new FF.StringField({ required: false, initial: "no", choices: choices("no", "round", "round-per-target", "arm-per-target"), label: "How often it may fire", hint: "round = once per round · round-per-target = once per round against each creature. Outside combat both mean once until the next encounter ends. · arm-per-target = once per creature for the LIFETIME of the arming status (requires 'Only while YOU have this status'; the ledger clears when the status drops — Unstoppable Advance hits each trampled enemy once per activation. 2bU)." }),
      chain: new FF.BooleanField({ required: false, initial: false, label: "May fire from an event another watch caused", hint: "OFF by default, and that is usually right: a watcher's own damage must not be observed by the next watcher. Turn it ON only when the caused event is genuinely a new one — Predatory Insight must still see a creature reach 0 focus when it was Whispered Doubt's extra loss that emptied it." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note", hint: "Posted when the watch fires — say what the table must resolve if the payload is table-run." }),
    } },
    // Config-only: the sweep in edhaDispatchWatchers reads these rules. An executor would be wrong —
    // nothing ever fires this rule ON its own item; that is the whole point of the handler.
    executor: async function () {},
  },
  /* H12 (07-24s). BULK DETONATION as a rule — the whole of Destruction's non-ledger backlog.
   *
   * 2bY: the two name-keyed payloads its body used to wrap are GONE — the Pinpoint rider reads off
   * the entry's sourceItemUuid (H3ann's stamp) and the prone rider is the `edha-detonate-react`
   * sweep. The resolver names no talent now. The charges ledger is H3's (lists.charges) and this
   * handler reads it through edhaGetCharges, which followed the repoint for free.
   *
   * `mergeTerrain` MERGES NOTHING — there is no geometry union in the project (ENGINE_INDEX
   * "No merge/union exists"). It swaps the terrain formula and prints a GM instruction. Named
   * `mergeTerrain` with that stated here so nobody authors it expecting a shape operation. */
  {
    source: "edha-content", type: "edha-detonate-list",
    label: "Edha: Detonate Placed Markers", description: "Set off the markers you have placed (Charges), all at once or one at a time: each catches the creatures inside it, rolls its own damage, and leaves its dangerous terrain. Put the extra effects of THIS talent's detonation in the fields below.",
    config: { schema: {
      /* A CHOICES list of one, deliberately. A free-text flag key would let an author type
       * "fateSnares" and silently get an UNFILTERED read — edhaGetCharges scene-filters and a bare
       * getFlag does not — so the value list grows only alongside an accessor that knows the
       * ledger's rules. Adding a marker family here is adding a case below, not typing a string.
       * (`which: all | one` was drafted and cut: both consumers detonate everything, and shipping a
       * "one" the executor ignores is a UI that lies. The per-marker buttons already exist on the
       * Charges card.) */
      source: new FF.StringField({ required: true, initial: "charges", choices: choices("charges"), label: "Which placed markers", hint: "The marker family to set off. 'charges' is Destruction's Set Charge list, read scene-filtered." }),
      radiusFt: new FF.NumberField({ required: false, initial: 0, label: "Override each blast radius (ft)", hint: "0 = each marker keeps the size it was placed at. The Unmooring is 15." }),
      bonusFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Added to every marker's damage", hint: "Appended to each marker's own formula, so write it as an addition — ' + @attr.int' for The Unmooring." }),
      ignoreDeflect: new FF.BooleanField({ required: false, initial: false, label: "Ignores deflect", hint: "The card says the GM applies full damage; the engine says so on the card." }),
      doubleCaughtFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Extra damage to anyone caught by two or more", hint: "Blank = no multi-catch bonus. Cascading Failure's whole mechanic." }),
      doubleCaughtType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "…of this damage type" }),
      mergeTerrain: new FF.BooleanField({ required: false, initial: false, label: "Treat the terrain as one zone", hint: "⚠ NOTE ONLY — nothing in the project unions Region geometry. This swaps the terrain formula and prints a GM instruction on the card." }),
      mergeWhenAtLeast: new FF.NumberField({ required: false, initial: 2, label: "…when at least this many go off", hint: "Cascading Failure merges at 2; The Unmooring merges always, so set 1." }),
      mergeFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Merged terrain damage formula", hint: "Blank = the standard Charge formula." }),
      requireNonEmpty: new FF.BooleanField({ required: false, initial: true, label: "Refuse with no markers placed (nothing spent)", hint: "Vetoed BEFORE cost, like every other Edha pre-use gate." }),
      oncePerScene: new FF.BooleanField({ required: false, initial: false, label: "Once per scene", hint: "The Unmooring. Cleared when the encounter ends, with the markers." }),
      label: new FF.StringField({ required: false, blank: true, initial: "", label: "Named on the card as", hint: "Blank uses the talent's name." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const key = this.source || "charges";
        // R-61: reads both sceneOnce.<id> AND the legacy detonateUsed.<id> this rule used to own alone;
        // the stamp below now writes ONLY sceneOnce.<id> — detonateUsed.* is a read-only legacy fallback.
        if (this.oncePerScene && edhaSceneOnceUsed(owner, item)) {
          ui.notifications?.warn(`Edha: ${item.name} is once per scene.`); return false;
        }
        const list = key === "charges" ? edhaGetCharges(owner) : [];
        if (!list.length) { ui.notifications?.info(`Edha: ${item.name} — no active markers to detonate.`); return false; }
        if (this.oncePerScene) await edhaStampSceneOnce(owner, item);
        const n = Number(this.mergeWhenAtLeast) || 2;
        await edhaResolveCharges(owner, list, {
          label: this.label || item.name,
          radiusFt: Number(this.radiusFt) || null,
          bonusFormula: this.bonusFormula || "",
          ignoreDeflect: this.ignoreDeflect === true,
          doubleCaughtFormula: this.doubleCaughtFormula || "",
          doubleCaughtType: this.doubleCaughtType || "energy",
          merged: this.mergeTerrain === true && list.length >= n,
          mergeFormula: this.mergeFormula || EDHA_CHARGE_DMG,
        });
      } catch (e) { console.error("Edha Content | edha-detonate-list executor failed", e); }
    },
  },
  /* H6 (07-24s). THE OFFER. A rule can resolve a test and apply an effect; it cannot ASK, which is
   * why 31 "choose one" talents were engine code. The click DISPATCHES BACK — it fires this item's
   * own `edha-test-success` rules with the picked creature as the subject — so this handler owns no
   * payload vocabulary at all and every payload handler works on a pick unchanged. See the block
   * comment above edhaPickAccepts for why this is NOT the "schema over an existing card function"
   * §9o costed, and for the three candidate sources deliberately NOT shipped. */
  {
    source: "edha-content", type: "edha-prompt-pick",
    label: "Edha: Prompt / Pick One", description: "Whisper yourself a card that asks a question — accept an offer, or choose one creature from a filtered list. What HAPPENS goes on the sibling 'When Your Test SUCCEEDS' rules, exactly as for a gated test; the creature you pick becomes their target.",
    config: { schema: {
      source: new FF.StringField({ required: true, initial: "confirm", choices: choices("confirm", "creatures", "effects"), label: "What is being chosen", hint: "confirm = one accept button; the payload lands on the creature this rule's trigger already resolved against (Subtle Suggestion, Puppeteer) · creatures = one button per creature matching the filters below (Anticipate, Unnerving Approach) · effects = one button per enabled Active Effect the creature bears (item-transferred passives included since item 54); the click DELETES an actor-level effect and DISABLES an item-owned one (never deleted — that would strip the talent's copy), plus the ledger marks named below — the DISPEL, its payload intrinsic (Unweaving: which effect counts as magical is the table's call, so the click is GM-side). Success rules are NOT dispatched for a picked effect: no payload handler takes a THING, which is why this source shipped with its own payload (§9o's rule). 07-25 pass 2bU." }),
      ledgers: new FF.StringField({ required: false, blank: true, initial: "omens:omen", label: "Ledger marks the dispel may clear (source = effects)", hint: "Comma-list of ledger:status pairs (status defaults to the ledger key). Each ledger holding the creature — or whose marker it wears — adds a 'Dispel <Marker>' button that clears the marker AND its ledger entry (R-35: Unweaving reaches the Omen). Blank = none. Item 54." }),
      prompt: new FF.StringField({ required: false, blank: true, initial: "", label: "The question", hint: "Shown after the talent's name. Say what accepting means — the card is the only place the table sees it. {name} = the creature this rule's trigger resolved against (Puppeteer: whose turn started at 0 focus); the PICKED creature is only known later, on the accept note." }),
      label: new FF.StringField({ required: false, blank: true, initial: "", label: "Button text", hint: "Blank = 'Use <talent>' for confirm, 'Choose <name>' for a creature. For confirm, {name} = the trigger's creature." }),
      icon: new FF.StringField({ required: false, blank: true, initial: "", label: "Icon", hint: "One emoji shown before the name." }),
      costs: new FF.StringField({ required: false, blank: true, initial: "", label: "Extra cost on accept", hint: "Comma-list of resource:amount, e.g. 'foc:2, inv:1'. A bare name means 1. Spent when you CLICK, not when the card posts, so declining costs nothing. This is the reaction's extra price — the talent's own activation cost is already paid." }),
      once: new FF.StringField({ required: false, initial: "no", choices: choices("no", "round"), label: "How often it may be accepted", hint: "round = once per round (Puppeteer, Lifeline). The budget is spent on the CLICK, so an ignored card does not burn it. Outside combat this means once until the next encounter ends." }),
      relativeTo: new FF.StringField({ required: false, initial: "self", choices: choices("self", "victim"), label: "Candidates measured around", hint: "self = a circle round YOU (Anticipate's network) · victim = a circle round the creature this rule's trigger resolved against (Unnerving Approach: your target's allies within 10 ft). The creature it is measured around is passed to the payload as the ANCHOR — that is what Edha: Push's 'away from anchor' uses." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Range = that colour's Attunement Range", hint: "Your rank in the colour sets the radius. Takes precedence over the fixed distance below." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "…or this many feet", hint: "Used when no colour is set. With neither, there are no candidates — a pick over the whole scene is never what a card means." }),
      disposition: new FF.StringField({ required: false, initial: "any", choices: choices("any", "enemy", "ally", "anchor-ally", "anchor-enemy"), label: "Which creatures", hint: "enemy / ally are relative to YOU. anchor-ally / anchor-enemy are relative to the creature the circle is measured around — Unnerving Approach pushes an ally OF YOUR TARGET, which plain 'ally' gets backwards." }),
      includeSelf: new FF.BooleanField({ required: false, initial: true, label: "You are a candidate too", hint: "Anticipate grants advantage to 'you or an ally', so you appear in your own list." }),
      requireStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only creatures with this status", hint: "Comma-list = any of them. Blank = no filter." }),
      aliveOnly: new FF.BooleanField({ required: false, initial: true, label: "Skip creatures already at 0 HP" }),
      emptyNote: new FF.StringField({ required: false, blank: true, initial: "", label: "Note when nobody qualifies", hint: "Posted instead of the card when the list comes out empty. Blank = stay silent." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Note when accepted with no payload", hint: "Posted on accept only if this talent carries NO success rules — the table-run case (Puppeteer: the GM resolves the borrowed action). Write {name} where the creature you picked should appear." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item; if (!item?.actor) return;
        await edhaRunPromptPick(item, this, event);
      } catch (e) { console.error("Edha Content | edha-prompt-pick executor failed", e); }
    },
  },
  /* H10 (07-24r). INVOLUNTARY FOCUS as a rule. `edhaGainFocus` / `edhaDrainFocus` have existed since
   * the Black tree shipped and have never had a handler, so every talent that moves someone's focus
   * did it from a name-keyed branch — the shape §9k found and §9o costed at 9 consumers across 5
   * trees. This is the H6 shape (a schema over functions that are already generic): the two helpers
   * keep owning the Wary reduction, the max clamp, the GM relay and the zero announcement; the
   * handler only says who, which way, and how much. It is NOT the resource-COST pipeline — a talent
   * that spends its OWN focus as a cost still does that on its activation. */
  {
    source: "edha-content", type: "edha-focus",
    label: "Edha: Gain / Drain Focus (or Investiture)", description: "Move a creature's focus (or Investiture) involuntarily: you regain it, or the creature you affected loses it. Not for a talent's own resource cost — that lives on the activation.",
    config: { schema: {
      op: new FF.StringField({ required: true, initial: "gain", choices: choices("gain", "drain"), label: "Which way", hint: "gain = the creature regains it (capped at its maximum) · drain = it loses it (floored at 0; focus drains are reduced by the target's own focus-guard rule)." }),
      resource: new FF.StringField({ required: false, initial: "foc", choices: choices("foc", "inv", "hea"), label: "Which resource", hint: "foc = focus (the guard reduction, the max clamp, the zero-crossing announcement). inv = Investiture — a plain gain/drain with the max clamp only (Reaper's Harvest). hea = HEALTH — gain only, i.e. a HEAL, relayed to the GM when you don't own the target (Field Medicine heals the patient's recovery die + your Medicine ranks). 2bZ." }),
      target: new FF.StringField({ required: false, initial: "self", choices: choices("self", "victim"), label: "Whose focus", hint: "self = you (Siphoned Will, Predatory Insight) · victim = the creature this rule's trigger resolved against or happened to — on a plain `use` event this is the creature you have targeted (Galvanize's ally, Field Medicine's patient)." }),
      formula: new FF.StringField({ required: false, blank: true, initial: "1", label: "How much", hint: "Resolved against YOUR roll data, so '@tier' works — EXCEPT `@target.*` refs, which resolve against the creature the rule acts on: `@target.recoveryDie` is their recovery die, `@target.<path>` reads their roll data (H17, 2bZ). A formula with dice is ROLLED and the roll posted. Blank or 0 does nothing." }),
      whenOwnsTalent: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when you also have this talent", hint: "The UPGRADE-TALENT gate: blank = always. Siphoned Will's focus only pays out if you own Siphoned Will, so Hollow Command's rule carries it. A name here is authored data you can edit — declare the upgrade talent's empty document in the tree-section header." }),
      label: new FF.StringField({ required: false, blank: true, initial: "", label: "Named on the card as", hint: "Blank uses the talent's name. Set it when the focus belongs to a DIFFERENT talent than the rule's host (Hollow Command's rule pays 'Siphoned Will')." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        if (!edhaRuleOwnsGate(owner, this.whenOwnsTalent)) return;   // upgrade-talent gate (Siphoned Will)
        const who = this.target === "victim" ? edhaResolveVictim(event) : owner;
        if (!who) { ui.notifications?.warn(`Edha: ${item.name} — target the creature first, then use it again.`); return; }
        const source = this.label || item.name;
        /* H17 (2bZ): @target.* resolves against WHO the rule acts on, then the Roll resolves the
         * owner-scoped rest as before. A formula with dice is ROLLED (async) and the roll POSTED —
         * the Galvanize card fix: its recovery die used to be evaluated and discarded, so the
         * player only ever saw the focus total. Flat formulas evaluate to the same numbers as the
         * old evaluateSync path. */
        let f = String(this.formula ?? "1") || "1";
        if (f.includes("@target.")) f = edhaTargetFormula(f, who.getRollData?.() ?? {}, edhaRecoveryDie(who));
        const roll = await edhaRollFormula(owner, f);
        if (roll.dice?.length) {
          try { await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: owner }), flavor: `${source} — ${who === owner ? "your" : `${who.name}'s`} die` }); } catch (e) {}
        }
        const n = Math.max(0, Math.floor(Number(roll.total) || 0));
        if (!n) return;
        // HEALTH (2bZ): a heal, relay-safe (edhaCrossHeal — a player rarely owns the patient).
        if (this.resource === "hea") {
          if (this.op === "drain") { console.warn(`Edha Content | ${item.name}: resource 'hea' is gain-only (damage has its own handlers)`); return; }
          const got = await edhaCrossHeal(who, n);   // item 68: the card states what LANDED, not what rolled
          const line = edhaHealLine(who, n, got, d => `${who.name} heals <strong>${d}</strong>`);
          if (line) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<p>⚕️ <strong>${source}</strong>: ${line}.</p>` });
          return;
        }
        // Investiture (2bW): a plain clamped write — no Wary, no zero announcement (those are
        // focus semantics). Runs on whichever client fired the rule; a defeat payload runs GM-side.
        if ((this.resource || "foc") === "inv") {
          const res = who.system?.resources?.inv;
          const cur = Number(res?.value) || 0;
          const next = this.op === "drain" ? Math.max(0, cur - n) : Math.min(edhaResVal(res) ?? (cur + n), cur + n);
          /* R-72 (ANSWERED 2026-09-06, Ben (b)): an INVOLUNTARY DRAIN IS NOT A SPEND. #28b stamped
           * this branch `edhaSpendTag` because it was the same shape as a cost deduction; it is
           * not. A creature whose Investiture is taken by an enemy has not *activated* anything, so
           * the Order Edict must not read it as a violation — the Edict fires on the creature's own
           * activations, and its own wired spend (edhaSpendResource / edhaConsumeCost) still
           * carries the spend stamp. Both arms of this branch are therefore BOOKKEEPING.
           * R-76 (ANSWERED 2026-09-06, Ben (b)): leave the branch; a future adversary whose
           * signature ability DRAINS a PC's Investiture (edha-focus op: drain, resource: inv) would
           * be its first consumer — Ben's design seed, 2026-09-06; with R-72 the stamp is
           * bookkeeping. No shipped talent carries op:"drain" + resource:"inv" today (the only
           * `inv` rule in all three packs is Reaper's Harvest, op:"gain"), so this arm is currently
           * unconsumed ON PURPOSE — do not delete it as dead code. */
          try { await edhaResourceWrite(who, "inv", { value: next }, edhaBookkeepingTag(`${source} (Investiture ${this.op === "drain" ? "drain" : "gain"})`)); } catch (e) { /* perms */ }
          /* item 68 (fix pass 8): the SAME drift, one arm over. `next` is clamped — at the maximum
           * going up, at 0 going down — so announcing `n` overstates a gain on a nearly-full pool
           * and a drain on a nearly-empty one. Report the delta the write produced, and stay quiet
           * when it produced none: exactly what edhaGainFocus/edhaDrainFocus have always done. */
          const moved = Math.abs(next - cur);
          if (moved > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: who }),
            content: `<p>✨ <strong>${source}</strong>: ${who.name} ${this.op === "drain" ? "loses" : "recovers"} <strong>${moved}</strong> Investiture.</p>` });
          return;
        }
        if (this.op === "drain") await edhaDrainFocus(who, n, source);
        else await edhaGainFocus(who, n, source);
      } catch (e) { console.error("Edha Content | edha-focus executor failed", e); }
    },
  },
  /* The smallest possible payload, and the one bucket 3 needs most (07-24p). Every declared exit —
   * ENGINE-OWNED and MANUAL alike — owes its talent a rule that "at minimum posts a card", and until
   * now nothing could: edha-gm-cue is config-only (its watchers read it; its executor is a no-op) and
   * whispers GMs on fixed triggers. This one has a body, so it works as a payload on ANY event —
   * edha-test-success, use, edha-combat-timing — and it is what turns "the card says what happens,
   * the table resolves it" from a name-keyed ChatMessage.create into an editable rule. */
  {
    source: "edha-content", type: "edha-damage-react",
    label: "Edha: Offer a Reaction When Someone Takes Damage", description: "The Bulwark shape: an ally near you is damaged (or drops to 0) and you are offered a whispered card to spend a resource and intervene — reduce the hit, take it for them, hit back, or keep them standing. Config-only: the applyDamage watcher reads these rules and posts the card; the button already knows how to resolve each action.",
    config: { schema: {
      when: new FF.StringField({ required: false, initial: "damaged", choices: choices("damaged", "dropped-to-0"), label: "What triggers it", hint: "damaged = any damage got through. dropped-to-0 = only when the hit took them from above 0 to 0 or less (Unbreakable Line)." }),
      action: new FF.StringField({ required: true, initial: "heal-ally", choices: choices("heal-ally", "redirect", "retaliate", "revive", "rally-zone"), label: "What the button does", hint: "heal-ally = reduce/heal the damage on them (Interposing Shield). redirect = take that much of it yourself instead (Shared Burden). retaliate = deal it back to the ATTACKER (Retributive Guard). revive = they drop to 1 health instead of 0 (Unbreakable Line). rally-zone = every standing ally in any of your Foundation zones gains the amount as Temp HP + advantage on its next attack test (Bonds of Community — 2bV; fires on ANY side's drop, including your own)." }),
      requireVictimInMyZone: new FF.BooleanField({ required: false, initial: false, label: "Only when they fell inside one of your Foundation zones", hint: "Bonds of Community. Summons never trigger it — they dissolve; the city doesn't mourn them. 2bV." }),
      requireAdjacent: new FF.BooleanField({ required: false, initial: false, label: "Only if they are adjacent to you" }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Only within this many feet", hint: "0 = no distance gate. Interposing Shield is 10. Use this OR 'adjacent', not both." }),
      requireAttackerWithinColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Also require an ENEMY attacker within your Attunement Range for this colour", hint: "Blank = the damage may come from anywhere, including a fall. 'white' is Retributive Guard: there must be a hostile attacker, and they must be inside your White Attunement Range for you to strike back." }),
      amountFormula: new FF.StringField({ required: true, initial: "0", label: "How much", hint: "Resolved against YOUR roll data, then floored. `@dealt` is the damage that just landed — Shared Burden is 'floor(@dealt / 2)'. Dice work: Retributive Guard is '(@tier)d(2 * @skills.white.rank + 2)'. A flat '1' is fine (Unbreakable Line)." }),
      capAtDealt: new FF.BooleanField({ required: false, initial: false, label: "Never more than the damage dealt", hint: "Interposing Shield rolls half a die but cannot reduce more damage than actually landed." }),
      dcFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "DC shown on the card", hint: "For reactions that ask for a test. Supports `@dealt`; the result is ceilinged and floored at 1. Unbreakable Line is '@dealt / 2'. Blank = no DC. This fills {dc} in the prompt — the test itself stays at the table." }),
      costResource: new FF.StringField({ required: false, blank: true, initial: "inv", label: "Resource spent", hint: "inv / foc. Blank = free." }),
      costValue: new FF.NumberField({ required: false, initial: 1, label: "How much of it" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: false, label: "Once per round", hint: "Unbreakable Line. The budget is spent on the CLICK, so an ignored card does not burn it." }),
      prompt: new FF.StringField({ required: true, initial: "", label: "What the card says", hint: "Placeholders: {victim} {attacker} {dealt} {amount} {dc}. Write it as the offer, e.g. '{victim} took {dealt} damage adjacent to you. Spend 2 Inv → take {amount} of it in their place.'" }),
    } },
    // Config-only: the applyDamage watcher (edhaBulwarkReactions) reads these rules and posts the
    // card. An executor would be wrong — nothing ever `use`s a reaction talent to make it happen.
    executor: async function () {},
  },
  /* H26 (07-25). The coord/test-triggered twin of H25: someone rolls, you are offered a whispered
   * card to spend a resource and react. The Bulwark trade again — the posters were already generic;
   * only the selection and the spec were name-keyed, and both now ride the document. */
  {
    source: "edha-content", type: "edha-test-react",
    label: "Edha: Offer a Reaction When Someone Rolls", description: "The Coordination shape: a creature near you makes a test (or attack) and you are offered a whispered card to spend a resource and react — negate a Complication, boost the result, grant a Plot Die, or impose disadvantage. Config-only: the roll watcher reads these rules and posts the card; the buttons already know how to resolve each action.",
    config: { schema: {
      rolls: new FF.StringField({ required: false, blank: true, initial: "skill,attack,item", label: "Which rolls", hint: "Comma-list of skill / attack / item. Pack Sense only rides attack,item; a pure test watcher wants all three." }),
      rollerIs: new FF.StringField({ required: false, initial: "ally", choices: choices("ally", "enemy"), label: "Whose rolls", hint: "Relative to you. ally = same side (the Coordination reactions). enemy = the other side (Voice of Authority)." }),
      when: new FF.StringField({ required: false, initial: "any", choices: choices("any", "complication", "plausible-fail"), label: "Only when the roll", hint: "complication = at least one Complication came up (Pillar of Order). plausible-fail = a Complication OR a kept d20 of 10 or less — the owner still judges ACTUAL failure on the card (Shared Conviction). any = every matching roll." }),
      requireSkillTest: new FF.BooleanField({ required: false, initial: false, label: "Only rolls with a skill id", hint: "ON for reactions that name the skill in their card (Shared Conviction, Concordant Presence)." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Roller within your Attunement Range (colour)", hint: "Blank = any distance." }),
      requireTargetInMyTerrain: new FF.BooleanField({ required: false, initial: false, label: "Roller's target must be in your difficult terrain", hint: "Pack Sense's gate — reads the roller's synced user targets against your owned terrain Regions." }),
      requireSeen: new FF.BooleanField({ required: false, initial: false, label: "You must be able to see the roller", hint: "Concordant Presence's 07-12 nerf: no triggering through walls, and grant recipients must be seen too." }),
      action: new FF.StringField({ required: false, initial: "offer", choices: choices("offer", "grant-plot-die", "disadvantage-reroll"), label: "What the card offers", hint: "offer = spend the costs, post the result note (a contest prompt if enabled below). grant-plot-die = pick a seen in-range ally to Raise the Stakes on that skill, once per skill per round (Concordant Presence). disadvantage-reroll = re-roll the kept d20, keep the lower, rewrite the roll card (Voice of Authority)." }),
      contest: new FF.BooleanField({ required: false, initial: false, label: "Ask for the DC on click (boost contest)", hint: "Shared Conviction: the card asks for the test's DC and reports whether the boosted total turns the failure around." }),
      modFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Your modifier ({mod})", hint: "Resolved against YOUR roll data, floored. Shared Conviction is '@skills.white.rank + @attr.wil'; Pack Sense is '@skills.green.mod'. Fills {mod} and {boosted} in the texts." }),
      costs: new FF.StringField({ required: false, blank: true, initial: "", label: "Costs on click", hint: "Comma-list of resource:amount, e.g. 'foc:2, inv:1'. Spent when you CLICK, so an ignored card costs nothing." }),
      prompt: new FF.StringField({ required: false, blank: true, initial: "", label: "What the card says", hint: "Placeholders: {roller} {total} {skill} {mod} {boosted} {owner}." }),
      result: new FF.StringField({ required: false, blank: true, initial: "", label: "Result note on click", hint: "Same placeholders. Posted publicly when the reaction is used." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Grant-card note (action = grant-plot-die)", hint: "Same placeholders. Shown above the ally buttons." }),
    } },
    // Config-only: the roll watcher (edhaTestReactWatch) reads these rules and posts the card.
    executor: async function () {},
  },
  /* H27 (07-25). The synchronous half of the Bulwark family: a flat pre-reduction applied INSIDE the
   * applyDamage wrapper before the hit lands — no card, no consent, exactly what a passive means. */
  {
    source: "edha-content", type: "edha-damage-reduce",
    label: "Edha: Passive Damage Reduction For Allies", description: "An ally near you is about to take damage and it is passively reduced before it lands (Shield Wall, Devoted Conduit). Config-only: the applyDamage wrapper reads these rules; first qualifying owner per talent applies.",
    config: { schema: {
      when: new FF.StringField({ required: false, initial: "damaged", choices: choices("damaged", "redirected"), label: "Which damage", hint: "damaged = any non-heal damage. redirected = only damage taken IN ANOTHER CREATURE'S PLACE (Shared Burden's hit — Devoted Conduit's gate, ruling C1)." }),
      requireVictimAdjacent: new FF.BooleanField({ required: false, initial: false, label: "Victim must be adjacent to you" }),
      requireAdjacentAllies: new FF.NumberField({ required: false, initial: 0, label: "You need at least this many adjacent living allies", hint: "Shield Wall is 2. 0 = no gate." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Victim within your Attunement Range (colour)", hint: "Blank = no range gate. Devoted Conduit is white." }),
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Colour for @colorRank", hint: "@colorRank in the formula becomes your rank in this colour — the skill rank for a PC, the ROLE rank for an adversary owner (ruling 122)." }),
      amountFormula: new FF.StringField({ required: true, initial: "0", label: "How much is prevented", hint: "Resolved against YOUR roll data, floored; dice allowed. @colorRank and @tier substitute before rolling — Shield Wall / Devoted Conduit are 'floor(((@tier)d(2 * @colorRank + 2)) / 2)' (half [Tier][Die])." }),
    } },
    // Config-only: the applyDamage pre-pass reads these rules. An executor would run after the hit.
    executor: async function () {},
  },
  /* The FOCUS GUARD (2bZ — was Wary's two name-keyed sites, re-litigated per iron rule 3: both
   * halves stay ENFORCED, they just read a rule now). Config-only: edhaDrainFocus applies the
   * reduction in-flight, and the preCreateActiveEffect veto blocks the status while focus holds. */
  {
    source: "edha-content", type: "edha-focus-guard",
    label: "Edha: Focus Guard (passive)", description: "Wary's shape: involuntary focus loss against YOU is reduced, and a status cannot be applied to you while you hold focus. Config-only — the focus-drain path and the status-creation veto read this rule off its owner.",
    config: { schema: {
      reduceFormula: new FF.StringField({ required: false, blank: true, initial: "@skills.dis.rank", label: "Involuntary focus loss reduced by", hint: "Resolved against YOUR roll data, floored at 0. Wary is your Discipline ranks. Blank = no reduction." }),
      vetoStatus: new FF.StringField({ required: false, blank: true, initial: "surprised", label: "This status cannot be applied to you…", hint: "A status id. Blank = no veto." }),
      whileFocusAbove: new FF.NumberField({ required: false, initial: 0, label: "…while your focus is above", hint: "Wary: you can't be Surprised while you have focus (above 0)." }),
    } },
    // Config-only: edhaDrainFocus + the preCreateActiveEffect veto read this rule.
    executor: async function () {},
  },
  /* The MOVE VETO's rule (2bZ — was Dread Presence's name-keyed preUpdateToken sweep, iron rule 3
   * re-litigated: still ENFORCED, now read off the document; the adversary copies carry it too). */
  {
    source: "edha-content", type: "edha-move-veto",
    label: "Edha: Forbid Approaching Allies (movement veto)", description: "Dread Presence's shape: a creature bearing the status, inside your range, cannot willingly move closer to any of its allies. Engine-forced movement bypasses it. Config-only: the token-movement veto reads this rule off its owner — character or adversary alike.",
    config: { schema: {
      moverStatus: new FF.StringField({ required: false, blank: true, initial: "weakened", label: "The moving creature must have this status", hint: "Blank = every enemy in range is pinned (almost never what a card means)." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "black", choices: choices("", "white", "blue", "black", "red", "green"), label: "Within your Attunement Range (colour)", hint: "Your rank in the colour sets the radius — an adversary owner reads its ROLE rank (ruling 122)." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "…or this many feet", hint: "0 = use the colour. Set it when the block prints a fixed figure." }),
    } },
    // Config-only: the preUpdateToken move veto reads this rule.
    executor: async function () {},
  },
  /* The HP FLOOR (2bZ — was Resilient Hero's name-keyed preUpdateActor veto). Config-only: the
   * pre-update veto reads it. The once-per-long-rest spend is a FLAG whose key rides the rule so
   * the talent's own NATIVE rule (long-rest-actor + update-actor) can clear it — the first
   * authored native-handler rule in the project (⚑ 2bA-9). The veto's read is tolerant of the
   * native writer's stringly values ("false"/"0" read as cleared), the plot-die precedent. */
  {
    source: "edha-content", type: "edha-hp-floor",
    label: "Edha: Hold At An HP Floor (once per long rest)", description: "The first time health would hit 0, it becomes the floor formula instead. Spent until the flag below clears — pair a native 'Actor Long Rested' + 'Update Actor' rule on the same talent to clear it automatically. Config-only: the pre-update veto reads this rule.",
    config: { schema: {
      floorFormula: new FF.StringField({ required: false, blank: true, initial: "max(1, @skills.ath.mod)", label: "Health holds at", hint: "Resolved against YOUR roll data, floored at 1. Resilient Hero is your Athletics modifier." }),
      spentFlag: new FF.StringField({ required: false, blank: true, initial: "resilientSpent", label: "Spent-flag key", hint: "The flags.edha-content key that marks it used. Name it here so the talent's own long-rest clear rule can write the same path." }),
    } },
    // Config-only: the preUpdateActor HP-floor veto reads this rule.
    executor: async function () {},
  },
  /* H7 (07-25). The adjacency aura: a GM-side sweep manages one AE on you and your adjacent living
   * allies while the adjacency holds. Guardian Stance's shape, spec on the document. */
  {
    source: "edha-content", type: "edha-aura",
    label: "Edha: Adjacency Aura (managed Active Effect)", description: "While at least one living ally is adjacent to you, you (and them) carry a managed Active Effect — applied and removed automatically as tokens move. Config-only: the aura sweep reads these rules.",
    config: { schema: {
      key: new FF.StringField({ required: false, initial: "system.deflect.bonus", label: "Attribute path", hint: "The Active Effect's change key. Guardian Stance is system.deflect.bonus — the same DerivedValueField .bonus the defense buffs use." }),
      amount: new FF.NumberField({ required: false, initial: 1, label: "Bonus amount" }),
      alsoAllies: new FF.BooleanField({ required: false, initial: true, label: "Adjacent allies get it too", hint: "OFF = only you carry the effect while an ally is adjacent." }),
      label: new FF.StringField({ required: false, blank: true, initial: "", label: "Effect name (shown on the actor)", hint: "Blank = '<talent> (+N)'." }),
      img: new FF.StringField({ required: false, blank: true, initial: "icons/magic/defensive/shield-barrier-blue.webp", label: "Effect icon" }),
    } },
    // Config-only: the aura sweep (edhaAuraSweep) reads these rules on token movement.
    executor: async function () {},
  },
  /* 07-25. The Attunement pulse: something radiates from you to everyone matching in range. First
   * consumers: White Leyline Attunement (visible-gated heal on Draw Mana, the 07-12 through-walls
   * ruling as a field) and Collective Resolve (Determined to allies in range on use). */
  {
    source: "edha-content", type: "edha-pulse",
    label: "Edha: Pulse To Creatures In Range", description: "When this rule fires, every ally — or every enemy — within your Attunement Range is healed or gains a status. Put it on `use`, or on the Draw Mana event for an Attunement Key rider. An enemy pulse keeps GM information off the player card: hidden/wall skips whisper to the GM instead (07-12b).",
    config: { schema: {
      rangeColor: new FF.StringField({ required: true, initial: "white", choices: choices("white", "blue", "black", "red", "green"), label: "Attunement Range colour" }),
      kind: new FF.StringField({ required: true, initial: "heal", choices: choices("heal", "status"), label: "What the pulse does" }),
      who: new FF.StringField({ required: false, initial: "allies", choices: choices("allies", "enemies"), label: "Who it reaches", hint: "allies = your side (the White heal, Collective Resolve). enemies = the other side (the Black Key's Weaken sweep). 2bZ." }),
      formula: new FF.StringField({ required: false, blank: true, initial: "@tier", label: "Heal amount (kind = heal)", hint: "Resolved against YOUR roll data, floored." }),
      statusId: new FF.StringField({ required: false, blank: true, initial: "", label: "Status to apply (kind = status)", hint: "Collective Resolve is 'determined'; the Black Key is 'weakened' (native cosmere conditions — the icon toggles; the mechanical rules stay GM-applied)." }),
      requireIsolated: new FF.BooleanField({ required: false, initial: false, label: "Only Isolated creatures (no living ally within 5 ft)", hint: "The Black Key's 07-05 gate. Skips are accounted on the card ('skipped N with an ally adjacent')." }),
      visibleOnly: new FF.BooleanField({ required: false, initial: false, label: "Only creatures you can see", hint: "The 07-12 ruling: no pulsing through walls, every skip accounted for — publicly for allies, GM-whispered for enemies (07-12b: the player card must not reveal what they can't see)." }),
      includeSelf: new FF.BooleanField({ required: false, initial: false, label: "You too", hint: "The White Draw Mana heal includes the caster. Ignored for an enemy pulse." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Extra card text" }),
    } },
    executor: async function (event) {
      try { await edhaRunPulse(event.item, this); } catch (e) { console.error("Edha Content | edha-pulse executor failed", e); }
    },
  },
  /* 07-25. The cleanse offer: a whispered card listing every (ally, condition) in range; clicking
   * spends the costs and removes the condition. Beacon of Stability's shape, spec on the document. */
  {
    source: "edha-content", type: "edha-cleanse",
    label: "Edha: Offer To Cleanse A Condition", description: "When this rule fires, you are offered a whispered card: one button per condition on each ally in range; clicking spends the costs and removes it. Put it on the Draw Mana event for Beacon of Stability's cadence — or set the trigger to 'success-damage-roll' for a heal-test talent whose cleanse fires only on the non-graze branch (Surgical Precision; that mode reads YOUR CURRENT TARGET and the conditions list, and the rule rides an 'Edha: Watch Rule' event).",
    config: { schema: {
      trigger: new FF.StringField({ required: false, initial: "use", choices: choices("use", "success-damage-roll"), label: "When it fires", hint: "use = when this rule's event fires (Beacon). success-damage-roll = when this talent's own use SUCCEEDS: the engine captures the test you rolled and compares it against the defense below (the system binds no DC to a skill_test talent's d20, so the engine decides) — success posts the cleanse card for your current target, a graze posts a no-cleanse note (Surgical Precision). 2bW; outcome decided by the engine since 07-27b." }),
      conditions: new FF.StringField({ required: false, blank: true, initial: "", label: "Only these conditions", hint: "Comma-list of status ids, blank = every condition present. Surgical Precision: weakened,disoriented,slowed. 2bW." }),
      def: new FF.StringField({ required: false, blank: true, initial: "phy", choices: choices("", "phy", "cog", "spi"), label: "Success = your test vs this defense (trigger = success-damage-roll)", hint: "The captured test must meet or beat the CURRENT TARGET's defense for the cleanse to post; under it is a graze and nothing is removed. Unreadable defense or no captured roll fails OPEN (the cleanse posts). Blank = no comparison — always posts. Surgical Precision: phy. 2026-07-27b (bench run 5, 2bW-15)." }),
      rangeColor: new FF.StringField({ required: true, initial: "white", choices: choices("white", "blue", "black", "red", "green"), label: "Attunement Range colour (trigger = use)" }),
      visibleOnly: new FF.BooleanField({ required: false, initial: false, label: "Only allies you can see (trigger = use)" }),
      costs: new FF.StringField({ required: false, blank: true, initial: "", label: "Costs on click", hint: "Comma-list of resource:amount, e.g. 'inv:1'. Spent when you CLICK, so an ignored card costs nothing." }),
      prompt: new FF.StringField({ required: false, blank: true, initial: "", label: "What the card says", hint: "Blank = 'spend <costs> to remove a condition from an ally in range:'." }),
    } },
    executor: async function (event) {
      try {
        if ((this.trigger || "use") !== "use") return;   // success-damage-roll rules are read by the damageRoll watcher (2bW)
        const item = event.item, owner = item?.actor; if (!owner) return;
        const otok = edhaCasterToken(owner); if (!otok) return;
        const ft = edhaAttuneFtColor(owner, this.rangeColor || "white");
        const disp = otok.document?.disposition;   // item 10 batch 2 (R-63): an unresolvable side is omitted from the beacon list
        let allies = edhaTokensInCircle(otok.center.x, otok.center.y, ft, otok.id)
          .filter(t => t.actor && edhaSideSame(t.document?.disposition, disp));
        if (this.visibleOnly) allies = allies.filter(t => !t.document?.hidden && edhaCanSee(otok, t));
        edhaPostBeaconCard(owner, item.name, allies, edhaParseCosts(this.costs), this.prompt || "");
      } catch (e) { console.error("Edha Content | edha-cleanse executor failed", e); }
    },
  },
  /* 07-25. The round-scoped movement window: use arms it, and while it is open every move you make
   * posts the allies-within-range card (the updateToken watcher reads the FLAG). Ordered Advance. */
  {
    source: "edha-content", type: "edha-move-window",
    label: "Edha: Arm A Movement Window (this round)", description: "On use, arms a round-scoped window: whenever you then move, a card lists the allies within range of where you stopped, with each one's half Speed. Out of combat the window stays open until re-armed.",
    config: { schema: {
      rangeFt: new FF.NumberField({ required: false, initial: 10, label: "Allies within this many feet" }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "What the allies may do", hint: "Shown on each movement card. Blank = 'may move half their Speed without provoking Reactions' (Ordered Advance)." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, actor = item?.actor; if (!actor) return;
        const c = edhaInActiveCombat(actor);   // R-4/#28a: arm against the OWNER's combat
        void edhaSetEdhaFlag(actor, "moveWindow", { round: c ? Number(c.round) : null, combatId: c?.id ?? null,
          rangeFt: Number(this.rangeFt) || 10, source: item.name, note: this.note || "" });
        const what = this.note || "may move half their Speed without provoking Reactions";
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🚶 <strong>${item.name}</strong> (${actor.name}): this round, whenever ${actor.name} moves, a card will list the allies within ${Number(this.rangeFt) || 10} ft who ${what}.</p>` });
      } catch (e) { console.error("Edha Content | edha-move-window executor failed", e); }
    },
  },
  /* 07-25. A rule over the Tool A2 designate-mark primitive (Guiding Signal). */
  {
    source: "edha-content", type: "edha-designate",
    label: "Edha: Designate An Opposing Character", description: "On use, posts the designate card: pick an opposing token within your Attunement Range; the next ally to test against it this round raises the stakes (they target the token when rolling).",
    config: { schema: {
      color: new FF.StringField({ required: false, initial: "white", choices: choices("white", "blue", "black", "red", "green"), label: "Attunement Range colour" }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note", hint: "Say what designating means at the table." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, actor = item?.actor; if (!actor) return;
        edhaPostDesignateCard(actor, item.name, { color: this.color || "white", note: this.note || "" });
      } catch (e) { console.error("Edha Content | edha-designate executor failed", e); }
    },
  },
  /* 07-25. The accord forge payload (Terms of Accord): pair it with Edha: Prompt / Pick One — the
   * picked creature becomes the accord partner. The accord flag then drives the ENGINE-OWNED
   * partner watcher (Bound by Word's offer). */
  {
    source: "edha-content", type: "edha-accord-forge",
    label: "Edha: Forge An Accord With The Picked Creature", description: "Put this on 'When Your Test SUCCEEDS' under a Prompt / Pick One rule: the creature you picked becomes your accord partner (the accord stores your modifier so the partner watcher can offer it on their tests).",
    config: { schema: {
      modFormula: new FF.StringField({ required: false, blank: true, initial: "@skills.white.rank + @attr.wil", label: "Your stored modifier", hint: "Resolved against YOUR roll data when the accord is forged. The partner may use it in place of their own via the upgrade talent below." }),
      shareModIfOwns: new FF.StringField({ required: false, blank: true, initial: "", label: "Partner may use your modifier when you own this talent", hint: "The UPGRADE-TALENT gate: Bound by Word. A name here is authored data you can edit — declare the upgrade talent's empty document in the tree-section header." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Extra text on the forge note", hint: "e.g. 'both +1 to objective tests for the scene (GM-narrated)'." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const partner = event.options?.victim ?? null;
        if (!partner || partner === owner) return;
        const mod = Math.floor(edhaEvalSync(String(this.modFormula || "0"), owner.getRollData())) || 0;
        const bound = !!(this.shareModIfOwns && edhaRuleOwnsGate(owner, this.shareModIfOwns));
        await edhaSetEdhaFlag(partner, "accord", { ownerUuid: owner.uuid, ownerName: owner.name, ownerWhiteMod: mod, boundByWord: bound });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🤝 <strong>${item.name}</strong>: ${owner.name} & ${partner.name} share an objective${this.note ? ` — ${this.note}` : ""}${bound ? `; ${partner.name} may use ${owner.name}'s modifier (+${mod})` : ""}.</p>` });
      } catch (e) { console.error("Edha Content | edha-accord-forge executor failed", e); }
    },
  },
  {
    source: "edha-content", type: "edha-reveal",
    label: "Edha: Reveal Facts About a Creature", description: "Post a card stating facts about a creature — its HP, conditions, defenses, or which of its numbers are lowest / below half. The scouting payload: pair it with Edha: Gated Test (put it on the SUCCESS event) or fire it straight off `use`. Whispered to you and the GM by default, so learning something is not the same as telling the table.",
    config: { schema: {
      target: new FF.StringField({ required: false, initial: "target", choices: choices("target", "victim", "self", "counter-bearer"), label: "Who to read", hint: "target = the creature you currently have targeted (Vital Diagnosis). victim = the creature this rule's trigger resolved against — use it on a test-success or watch payload, where re-reading your targets would be wrong (Sharp Eye). self = you. counter-bearer = the creature bearing your counter (Pack Share reads the Insight bearer); set the counter status below. 07-25." }),
      counterStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Counter status (target = counter-bearer)", hint: "e.g. insight. With no current bearer the card says so instead of erroring — an armed reveal with nothing marked yet is a normal state." }),
      facts: new FF.StringField({ required: true, initial: "hp,conditions,defenses", label: "What to reveal", hint: "Comma-list, in the order you want them read out: hp · conditions · defenses · lowest-attribute · lowest-defense · below-half. Vital Diagnosis is 'hp,conditions,defenses'; Sharp Eye is 'lowest-attribute,lowest-defense,below-half'." }),
      hideDefenses: new FF.StringField({ required: false, blank: true, initial: "", label: "Defenses to withhold", hint: "Comma-list of phy / cog / spi dropped from the 'defenses' fact. Studied Mark deliberately withholds Cognitive. Blank = show all three." }),
      separator: new FF.StringField({ required: false, blank: true, initial: "; ", label: "Separator between facts", hint: "'; ' reads as a report (Vital Diagnosis); ' · ' reads as a menu of things you could learn (Sharp Eye)." }),
      whisper: new FF.BooleanField({ required: false, initial: true, label: "Whisper it", hint: "ON = only you and the GM see it, which is almost always right for scouting — knowing a thing and announcing it are different acts. OFF = public card." }),
      icon: new FF.StringField({ required: false, blank: true, initial: "\u{1F441}\u{FE0F}", label: "Card icon" }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Note appended to the card", hint: "Free text after the facts — Sharp Eye's 'pick ONE to learn; share only the one you chose', which is a table instruction the engine cannot enforce and should not pretend to." }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      const who = this.target === "self" ? owner
        : this.target === "victim" ? edhaResolveVictim(event)
        : this.target === "counter-bearer" ? await edhaCounterBearerOf(owner, String(this.counterStatus || "insight").trim())
        : edhaUserTargetActor();
      if (!who && this.target === "counter-bearer") {
        const lbl = edhaConditionLabel(this.counterStatus || "insight") || this.counterStatus || "counter";
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<div class="edha-trigger-card"><p>${this.icon || ""} <strong>${item.name}</strong>: no creature currently bears your ${lbl}.</p></div>` });
        return;
      }
      if (!who) { ui.notifications?.warn(`Edha: ${item.name} — target the creature first, then use it again.`); return; }
      const clauses = edhaRevealFacts(who, { facts: this.facts, hideDefenses: this.hideDefenses });
      if (!clauses.length) return;
      const sep = (this.separator === undefined || this.separator === null) ? "; " : String(this.separator);
      const body = `<p>${this.icon || ""} <strong>${item.name}</strong> on ${who.name} — ${clauses.join(sep)}.`
        + `${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>`;
      const msg = { speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<div class="edha-trigger-card">${body}</div>` };
      if (this.whisper !== false) msg.whisper = edhaWhisperIds(owner);
      ChatMessage.create(msg);
    },
  },
  {
    source: "edha-content", type: "edha-note",
    label: "Edha: Post a Note", description: "Posts a chat note when this rule fires. The table-run half of a talent: say what the players must resolve by hand. Works on any event — put it on 'When Your Test SUCCEEDS' for the payload of a gated test.",
    config: { schema: {
      text: new FF.StringField({ required: true, blank: false, initial: "", label: "Note", hint: "Shown verbatim after the talent's name. Basic HTML is allowed (<strong>, <em>). @-refs are resolved against YOUR roll data, so '@tier' and '@skills.dis.mod' print numbers." }),
      icon: new FF.StringField({ required: false, blank: true, initial: "", label: "Icon", hint: "One emoji shown before the name. Blank = no icon." }),
      whisper: new FF.StringField({ required: false, initial: "public", choices: choices("public", "owner", "gm"), label: "Who sees it", hint: "public = everyone · owner = you + the GM · gm = the GM only (secrets, or a reminder only the GM acts on)." }),
      whenOwnsTalent: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when you also have this talent", hint: "The UPGRADE-TALENT gate: blank = always. Calm Appeal's line only prints if you own Calm Appeal. A name here is authored data you can edit — declare the upgrade talent's empty document in the tree-section header." }),
      whenTarget: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "downed"), label: "Only when the target is…", hint: "Blank = always. downed = the creature this use is about (your current target) is at 0 health or Unconscious — Rallying Shout's revive reminder (R-25). No target = no note." }),
      rosterColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Append allies in this Attunement Range", hint: "Colour, blank = off. The note ends with the names of your allies currently within that range — The Final Study's free-Strike roster (player-executed). 07-25." }),
      rosterList: new FF.StringField({ required: false, blank: true, initial: "", label: "…or append the members of this sustained ledger", hint: "An Edha: Sustained List name (e.g. covenants) — the note ends with their names. Concord names the pact allies it binds. 2bV." }),
      rosterListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…that ledger's marker status", hint: "Blank = the ledger name." }),
      rosterEmpty: new FF.StringField({ required: false, blank: true, initial: "", label: "…text when no ally is in range", hint: "Posted instead of the roster when it comes out empty. Blank = 'no allies in Attunement Range.'" }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner || !this.text) return;
      if (!edhaRuleOwnsGate(owner, this.whenOwnsTalent)) return;
      if (!edhaNoteTargetGate(this.whenTarget, edhaResolveVictim(event))) return;   // target-condition dial (item 63 / R-25)
      // Resolve @-refs so a note can quote a live number (Calm Appeal: "+@skills.dis.rank focus").
      let body = String(this.text);
      try { body = String(Roll.replaceFormulaData(body, owner.getRollData(), { missing: "0" })); } catch (e) {}
      if (this.rosterColor) {
        const allies = edhaAlliesInAttune(owner, this.rosterColor).map(t => t.actor).filter(a => a && a !== owner);
        body += allies.length ? ` ${allies.map(a => a.name).join(", ")}.` : ` <span style="opacity:.8">${this.rosterEmpty || "no allies in Attunement Range."}</span>`;
      }
      if (this.rosterList) {
        const key = String(this.rosterList).trim();
        const members = edhaOwnerList(owner, key, String(this.rosterListStatus || key).trim());
        body += members.length ? ` ${members.map(m => m.name).join(", ")}.` : ` <span style="opacity:.8">${this.rosterEmpty || `no creatures on your ${key} list.`}</span>`;
      }
      const who = this.whisper === "gm" ? edhaGmIds()   // R-62: a note has no button → record → all GMs, was active-only (🤖 bench row: audience flip)
        : this.whisper === "owner" ? edhaWhisperIds(owner) : null;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        ...(who ? { whisper: who } : {}),
        content: `<p>${this.icon ? `${this.icon} ` : ""}<strong>${item.name}</strong>: ${body}</p>` });
    },
  },
  /* H3 (07-24p). The ledger only — canvas objects (Fate's templates, Destruction's Regions) stay
   * with the placement handlers, and Knowledge's counted single bearer is a different shape (see
   * the block comment above edhaListPush). `release` returning false is load-bearing: it is what
   * makes a conditional payload work without a new gate field. */
  {
    source: "edha-content", type: "edha-owner-list",
    label: "Edha: Sustained List (place / release)", description: "The capped ledger every marker tree hand-rolled: place a mark on a creature, keep at most <cap> of them, and clear one when it is spent. Put a 'release' rule BEFORE a damage rule to make the damage conditional on the creature actually bearing your mark — release stops the remaining rules when there was nothing to release. Mode 'counter' (H3b, §9m q6) is the COUNTED SINGLE BEARER instead: one creature carries 0..cap points of your counter; placing on a new creature clears the old bearer.",
    config: { schema: {
      list: new FF.StringField({ required: true, blank: false, initial: "omens", label: "Ledger name", hint: "The owner flag this list lives under, and the marker status id unless you set one below: omens, edicts, remains, charges… (counter mode: insight)" }),
      mode: new FF.StringField({ required: false, initial: "list", choices: choices("list", "counter"), label: "Shape", hint: "list = up to <cap> creatures each bearing one mark (Omen, Covenant) · counter = ONE creature bearing a 0..cap COUNT (Knowledge's Insight — H3b, §9m q6): place SETS the count and transfers the bearer, add moves it by ±N, release clears it." }),
      op: new FF.StringField({ required: true, initial: "place", choices: choices("place", "release", "count", "add", "annotate", "spend"), label: "What to do", hint: "place = add the creature (counter: set the count on it, clearing any prior bearer) · release = remove it and STOP the later rules if it wasn't on the list (counter: clear ALL points — Killing Blow's success) · add = counter mode only: move the bearer's count by ±N (Accumulate +1, Killing Blow's failure −1) · count = just report the total on the card · annotate = flag your MOST RECENT un-flagged entry (Sealed Edict notarizes the last unsealed Edict — the Inevitable-Snare/Pinpoint-Charge shape, H3ann; refused BEFORE cost when none qualifies) · spend = consume your OLDEST entry as a cost (the Remains/Charge convention, 2bW — Risen Servant, Speak with the Fallen; freebie-aware)." }),
      requireNonEmpty: new FF.BooleanField({ required: false, initial: false, label: "Refuse with the ledger empty (op = spend; checked BEFORE cost)", hint: "ON = an empty ledger vetoes the use before any cost is paid (Risen Servant needs a Harvested Remain — nothing spent). OFF = an empty ledger just skips the spend and the later rules still run (Speak with the Fallen's optional spend)." }),
      confirm: new FF.StringField({ required: false, blank: true, initial: "", label: "Ask before spending (op = spend)", hint: "A DialogV2 confirm shown when the ledger has an entry — declining posts a card and spends nothing, and the later rules still run. Speak with the Fallen: 'Spend a Harvested Remain? (Otherwise…)'. Blank = spend without asking." }),
      sceneFreebie: new FF.BooleanField({ required: false, initial: false, label: "You begin each scene with 1 (this ledger)", hint: "While you carry this rule, an UNSET ledger reads as one spendable freebie entry (Reaper's Harvest: 'You begin each scene with 1'). Spent-to-empty stays empty until the scene cleanup unsets the flag — [] ≠ unset. 2bW." }),
      freebieLabel: new FF.StringField({ required: false, blank: true, initial: "", label: "…named on the card as", hint: "Blank = 'Scene-start'." }),
      annotateField: new FF.StringField({ required: false, blank: true, initial: "sealed", label: "Annotation field (op = annotate)", hint: "The entry field set to true. Sealed Edict writes `sealed`." }),
      prohibition: new FF.BooleanField({ required: false, initial: false, label: "Entries carry a declared PROHIBITION (op = place)", hint: "On use the prohibition picker runs (move / attack a chosen ally / activate Investiture / free text) and the choice rides the entry; the engine's violation watchers prompt on the three canonical kinds and the card carries the ⚖ Violated button. Cancelling the picker refunds the cost. Order's Edict." }),
      riderSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Annotated-entry violation rider: foe's skill (op = annotate)", hint: "e.g. dis — when an annotated entry's violation resolves, the violator ALSO tests this skill vs your colour below (engine-rolled); failure = this talent's damage formula + Weakened. Blank = no rider." }),
      riderColor: new FF.StringField({ required: false, blank: true, initial: "", label: "…vs your colour (op = annotate)", hint: "Sealed Edict is blue; Inevitable Snare is green." }),
      riderFailStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…on a failed rider test, apply (op = annotate)", hint: "A status id the CONSUMING resolver applies when the rider test fails — Inevitable Snare's `disoriented` on the snare spring. Blank = the resolver's own default (Order's violation rider keeps Weakened). 2bX." }),
      placeNote: new FF.StringField({ required: false, blank: true, initial: "", label: "Printed on this ledger's PLACE cards", hint: "A sibling talent may advertise itself when an entry is placed — Sealed Edict's 'you may notarize it' hint rides Edict's card. Blank = nothing." }),
      count: new FF.NumberField({ required: false, initial: 1, label: "How many (counter mode)", hint: "place: the count set on the new bearer (Studied Mark: 2). add: the delta, negative to remove (−1)." }),
      requireBearerRange: new FF.StringField({ required: false, blank: true, initial: "", label: "Only while the bearer is in Attunement Range (counter add)", hint: "Colour, blank = no gate. Accumulate's turn-start point only lands while the bearer is within Green range — out of range is a silent skip, not an error." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Target must be within Attunement Range (checked BEFORE cost)", hint: "Colour, blank = no gate. Only applies when 'Who goes on the list' is 'prompt' — Studied Mark refuses (nothing spent) beyond Green range." }),
      capFormula: new FF.StringField({ required: false, blank: true, initial: "@tier", label: "Cap (formula)", hint: "How many you can sustain at once. Almost always @tier. Counter mode: the maximum count (Insight is 5)." }),
      evict: new FF.StringField({ required: false, initial: "oldest", choices: choices("oldest", "refuse"), label: "At the cap", hint: "oldest = the oldest fades to make room (Edict, Snare, Ordained Ground — Ben R1) · refuse = the new one simply doesn't land and the card says so (Omen)." }),
      status: new FF.StringField({ required: false, blank: true, initial: "", label: "Marker status", hint: "Applied to the creature while it is on the list, cleared when it leaves. Blank = use the ledger name." }),
      target: new FF.StringField({ required: false, initial: "victim", choices: choices("victim", "prompt", "self", "near-victim", "enemies-range"), label: "Who goes on the list", hint: "victim = the creature this talent's test resolved against (the usual) · prompt = whoever you have targeted · self = you · near-victim = the NEAREST living enemy within the feet below of the victim, auto-picked, skipping the victim and anyone already on the list (Spreading Omen's second placement — 2bU) · enemies-range = EVERY living enemy within your Attunement Range (colour above), nearest first, until the cap refuses (Unravel Everything's fill — 2bU). Both new modes place only; a silent skip when nobody qualifies." }),
      nearFt: new FF.NumberField({ required: false, initial: 10, label: "…within this many feet of the victim (near-victim)", hint: "Spreading Omen is 10." }),
      allowDuplicates: new FF.BooleanField({ required: false, initial: false, label: "Allow repeat entries on one creature", hint: "Off = a creature already on your list is never marked twice (Omen). On = each use adds its OWN entry, so the same creature can carry several (Order's Edicts — different prohibitions, each its own entry; the tree header says so). Ben, 07-24t: the tree as documented is the spec." }),
      multiOwner: new FF.BooleanField({ required: false, initial: false, label: "Marker is shared between owners", hint: "On = releasing or evicting an entry leaves the status alone while ANOTHER owner's ledger still holds that creature. Order's Covenant and Edict icons are shared this way; Chaos's Omen is not. Off strips a second owner's icon." }),
      sceneScoped: new FF.BooleanField({ required: false, initial: true, label: "Entries belong to the scene they were placed on", hint: "On (the default) = an entry is invisible on any other scene, which is what a Charge or a Snare in the ground means. Turn it OFF for a pact that follows the creature (Covenant) — otherwise moving scene silently empties the ledger." }),
      requireDisposition: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "ally", "enemy"), label: "Target must be (checked BEFORE cost)", hint: "Blank = anyone. ally / enemy = vetoes the use before any cost is paid when the targeted creature is on the wrong side. Only applies when 'Who goes on the list' is 'prompt'." }),
      requireAdjacent: new FF.BooleanField({ required: false, initial: false, label: "Requires touch (checked BEFORE cost)", hint: "On = the target must be adjacent (within 1 square). Covenant is a touch effect. Only applies when 'Who goes on the list' is 'prompt'." }),
      releaseButton: new FF.StringField({ required: false, blank: true, initial: "", label: "Card carries a 'release this entry' button", hint: "The button's label, e.g. 'Break the Covenant'. Blank = no button. Clicking it drops THAT entry and clears its marker — the manual surface a sustained pact needs, and it names no talent." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      const key = String(this.list || "").trim(); if (!key) return;
      const status = String(this.status || key).trim();
      const victim = edhaResolveVictim(event);
      const who = this.target === "self" ? owner
        : this.target === "prompt" ? edhaUserTargetActor()
        : this.target === "near-victim" ? edhaNearestListCandidate(owner, victim, Number(this.nearFt) || 10, edhaOwnerList(owner, key, status))
        : victim;
      const cap = edhaListCap(owner, this.capFormula);
      const label = edhaConditionLabel(status) || status;

      /* --- mode: counter (H3b) — one bearer, a number --------------------------------------------- */
      if ((this.mode || "list") === "counter") {
        const opts = { key, status, cap: edhaListCap(owner, this.capFormula || "5"), talent: item.name };
        const bearer = await edhaCounterBearerOf(owner, key);
        const say = (html) => edhaTreeCard(owner, null, html);   // Job 4, pass 5.3: the 7th near-identical poster, onto edhaTreeCard
        if (this.op === "count") {
          say(`<p>📖 <strong>${item.name}</strong>: ${bearer ? `${bearer.name} bears <strong>${edhaCounterOn(owner, key, bearer, status)}</strong> ${label}` : `no creature bears your ${label}`} (cap ${opts.cap}).${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>`);
          return;
        }
        if (this.op === "release") {
          if (!bearer) return false;      // nothing to clear → the dispatcher skips the rules after this one
          const had = edhaCounterOn(owner, key, bearer, status);
          await edhaCounterSet(owner, null, 0, opts);
          say(`<p>📖 <strong>${item.name}</strong>: all <strong>${had}</strong> ${label} removed from ${bearer.name}.</p>`);
          return;
        }
        if (this.op === "add") {
          if (!bearer) return;
          if (this.requireBearerRange) {
            const btok = edhaCasterToken(bearer);
            if (!edhaDeathInRange(owner, btok, this.requireBearerRange)) return;
          }
          const delta = Number(this.count) || 0; if (!delta) return;
          const cur0 = edhaCounterOn(owner, key, bearer, status);
          if (delta > 0 && cur0 >= opts.cap) return;   // at the cap — the point simply doesn't land
          const n = await edhaCounterAdd(owner, bearer, delta, opts);
          say(`<p>📖 <strong>${item.name}</strong>: ${delta > 0 ? `+${delta}` : delta} ${label} on ${bearer.name} (now <strong>${n}</strong>).</p>`);
          return;
        }
        // place — set the count on `who`, transferring the bearer (Studied Mark's literal text)
        if (!who) { ui.notifications?.warn(`Edha: ${item.name} — target the creature, then use it again.`); return; }
        const n = await edhaCounterSet(owner, who, Number(this.count) || 1, opts);
        say(`<p>📖 <strong>${item.name}</strong>: ${who.name} bears <strong>${n}</strong> ${label} (any prior bearer is cleared).${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>`);
        return;
      }

      /* SPEND (2bW — the Remains repoint's cost op): consume the OLDEST entry, freebie-aware.
       * The empty-ledger refusal is vetoed pre-cost when requireNonEmpty is on; with it off an
       * empty ledger (or a declined confirm) is a SKIP, not a stop — the rules after this one
       * still run (Speak with the Fallen's cue note posts either way). */
      if (this.op === "spend") {
        const avail = edhaOwnerListAvail(owner, key, status);
        if (!avail.length) {
          if (this.requireNonEmpty) { ui.notifications?.warn(`Edha: ${owner.name} has no ${label} for ${item.name}.`); return false; }
          return;   // optional spend, nothing held — silent skip, later rules run
        }
        if (this.confirm) {
          let yes = false;
          try {
            yes = await foundry.applications.api.DialogV2.confirm({
              window: { title: item.name }, content: `<p>${this.confirm}</p>`, modal: false, rejectClose: false,
            });
          } catch (e) { yes = false; }
          if (!yes) {
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
              content: `<p>📋 <strong>${item.name}</strong>: no ${label} spent.${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>` });
            return;
          }
        }
        await edhaLedgerSpend(owner, key, status, item.name);
        return;
      }

      if (this.op === "count") {
        const cur = edhaOwnerList(owner, key, status);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>📋 <strong>${item.name}</strong>: ${cur.length}/${cap} ${label}${cur.length === 1 ? "" : "s"} sustained.${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>` });
        return;
      }
      /* ANNOTATE (2bV — H3ann's surviving shape, built with its first consumer): flag the MOST
       * RECENT entry whose field is still falsy. Sealed Edict notarizes the last unsealed Edict;
       * Inevitable Snare and Pinpoint Charge are the other two known instances (§9o). The refusal
       * is also vetoed pre-cost; this return false is the belt. */
      if (this.op === "annotate") {
        return await edhaOwnerListQueue(owner, key, async () => {   // queued RMW (07-26n) — fresh read inside
          const field = String(this.annotateField || "sealed").trim() || "sealed";
          const list = foundry.utils.deepClone(edhaOwnerList(owner, key, status));
          const e = [...list].reverse().find(x => x && !x[field]);
          if (!e) { ui.notifications?.warn(`Edha: no ${label} left to mark ${field}.`); return false; }
          /* `sourceItemUuid` (2bX — the Pinpoint correction): the annotated entry remembers WHICH
           * document annotated it, so a downstream resolver (Fate's snare spring) reads the rider
           * formula and contest dials off that item instead of a module constant — editing the
           * talent's damage in Foundry actually changes what the spring rolls. */
          await edhaSetOwnerList(owner, key, list.map(x => x === e ? { ...x, [field]: true, sourceItemUuid: item.uuid } : x));
          // A POINT-BOUND entry (charges / snares — 2bY) has no creature name; say which marker instead.
          const eName = e.name || `${e.talent || label} #${list.indexOf(e) + 1}`;
          /* R-37(2) (Ben 2026-09-06 (a)): this sentence read "the snares on Snare #1 **is**
           * inevitable" — a plural ledger key agreeing with a singular verb, wrapped around an
           * "on <creature>" clause a point-bound marker has no creature for. `e.name` is exactly
           * the creature-bound test: a point-bound entry has none and falls back to eName above. */
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<p>📋 <strong>${item.name}</strong>: ${edhaAnnotateSentence(eName, label, field, e.proh?.text || "", !!e.name)}${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>` });
          if (key === "charges") edhaPostChargesCard(owner);   // refresh the Detonate buttons so the ⊕ shows (2bY — keyed on the LEDGER, not a talent)
        });
      }
      /* THE FILL (07-25, 2bU — Unravel Everything): place on every living enemy within the colour's
       * Attunement Range, nearest first, until the cap refuses. A fill never evicts — "up to your
       * cap" means the ones past it simply don't land. Mark-first per creature, ONE ledger commit. */
      if (this.op === "place" && this.target === "enemies-range") {
        const otok = edhaCasterToken(owner);
        if (!otok) { ui.notifications?.warn(`Edha: ${item.name} — no token on the scene to measure from.`); return; }
        const ft = this.rangeColor ? edhaAttuneFtColor(owner, this.rangeColor) : 0;
        if (!ft) { ui.notifications?.warn(`Edha: ${item.name} — set an Attunement Range colour for the enemies-range placement.`); return; }
        return await edhaOwnerListQueue(owner, key, async () => {   // queued RMW (07-26n) — fresh read inside
          let list = edhaOwnerList(owner, key, status).slice();
          const cands = edhaTokensWithin(otok, ft)
            .filter(t => t.actor && edhaSideHostile(t.document?.disposition, otok.document?.disposition)
              && (t.actor.system?.resources?.hea?.value ?? 1) > 0 && !list.some(e => e.uuid === t.actor.uuid))
            .sort((a, b) => Math.hypot(a.center.x - otok.center.x, a.center.y - otok.center.y) - Math.hypot(b.center.x - otok.center.x, b.center.y - otok.center.y));
          const placed = [];
          for (const t of cands) {
            const entry = { id: foundry.utils.randomID(), uuid: t.actor.uuid, name: t.actor.name, talent: item.name,
              ...(this.sceneScoped === false ? {} : { sceneId: canvas?.scene?.id ?? null }) };
            const res = edhaListPush(list, entry, { cap, evict: "refuse" });
            if (res.refused) break;
            const mark = { actorId: owner.id, talent: item.name };
            if (!(await edhaWriteStatusMark(t.actor, status, mark))) break;   // Job 6b: shared body (warns on no-GM)
            list = res.list; placed.push(t.actor.name);
          }
          if (placed.length) await edhaSetOwnerList(owner, key, list);
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<p>📋 <strong>${item.name}</strong>: ${placed.length ? `<strong>${placed.join(", ")}</strong> bear${placed.length === 1 ? "s" : ""} your ${label}` : "no enemy in range to mark"} (${list.length}/${cap}).${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>` });
        });
      }
      if (!who) {
        // The auto-pick coming up empty is a fact for the card, not an error (Spreading Omen: "no
        // second enemy within 10 ft"). Every other mode still asks for a target.
        if (this.target === "near-victim") ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>📋 <strong>${item.name}</strong>: no additional enemy within ${Number(this.nearFt) || 10} ft to mark.</p>` });
        else ui.notifications?.warn(`Edha: ${item.name} — target the creature, then use it again.`);
        return;
      }

      if (this.op === "release") {
        return await edhaOwnerListQueue(owner, key, async () => {   // queued RMW (07-26n) — fresh read inside
          const cur = edhaOwnerList(owner, key, status);
          const idx = cur.findIndex(e => e.uuid === who.uuid);
          if (idx < 0) return false;      // nothing to release → the dispatcher skips the rules after this one
          const [gone] = cur.splice(idx, 1);
          await edhaSetOwnerList(owner, key, cur);
          await edhaListUnmark(gone, status, { key, ownerId: owner.id, multiOwner: this.multiOwner === true });
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<p>📋 <strong>${item.name}</strong>: ${who.name}'s <strong>${label}</strong> is spent (${cur.length}/${cap} left).${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>` });
        });
      }

      /* The declared PROHIBITION (2bV — Order's Edict). The picker runs now and the choice rides
       * the entry; the engine's violation watchers key on `entry.proh`, never on a talent. The
       * system has already charged the cost, so a cancel REFUNDS it (the Trade-Routes convention)
       * — net "nothing spent" without a name-keyed takeover. USER INTERACTION, so it stays
       * OUTSIDE the queued section below (07-26n) — an open picker must not stall the ledger. */
      let proh = null;
      if (this.prohibition === true) {
        proh = event.options?.edhaProh ?? await edhaPickProhibition(owner, `${item.name} — declare ONE prohibited action`);
        if (!proh) { edhaRefundCost(item); ui.notifications?.info(`${item.name} cancelled — cost refunded.`); return false; }
      }
      // place — the queued RMW (07-26n). This is the section bench run 4 caught racing: three
      // defeats in one tick ran three of these placements concurrently, all reading the same
      // stored list, and the last write won. The dup-check, push, mark and commit now happen
      // behind the per-owner-per-key queue, against a FRESH read.
      return await edhaOwnerListQueue(owner, key, async () => {
        const cur = edhaOwnerList(owner, key, status);
        if (this.allowDuplicates !== true && cur.some(e => e.uuid === who.uuid)) return;   // already yours — never double-mark
        const entry = { id: foundry.utils.randomID(), uuid: who.uuid, name: who.name, talent: item.name,
          ...(proh ? { proh, sealed: false } : {}),
          ...(this.sceneScoped === false ? {} : { sceneId: canvas?.scene?.id ?? null }) };
        const { list, evicted, refused } = edhaListPush(cur, entry, { cap, evict: this.evict || "oldest" });
        if (refused) {
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<p>📋 <strong>${item.name}</strong>: no ${label} placed on ${who.name} — you are at your cap of ${cap}.</p>` });
          return;
        }
        /* MARK FIRST, commit the ledger only once it landed (07-24v — a real bug, found scouting).
         * The order used to be reversed, and the failure was silent in the worst way: with no GM online
         * to mark a creature the player does not own, edhaSetOwnerList had ALREADY committed, so the
         * ledger held an entry whose creature carried no status — and edhaOwnerList's
         * reconcile-on-read then filtered that entry out for ever. Net effect: the placement appeared
         * to do nothing, the cap never saw it, and junk accumulated in the flag. This affects EVERY H3
         * consumer, including the covenants ledger migrated on 07-24u. */
        const mark = { actorId: owner.id, talent: item.name };
        if (!(await edhaWriteStatusMark(who, status, mark))) return;   // Job 6b: shared body (warns on no-GM)
        await edhaSetOwnerList(owner, key, list);
        const mo = this.multiOwner === true;
        for (const e of evicted) await edhaListUnmark(e, status, { key, ownerId: owner.id, multiOwner: mo });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>📋 <strong>${item.name}</strong>: <strong>${who.name}</strong> bears your <strong>${label}</strong> (${list.length}/${cap}).`
            + `${proh ? ` It must not <strong>${proh.text}</strong>.` : ""}`
            + `${evicted.length ? ` The oldest (${evicted.map(e => e.name).join(", ")}) fades — you sustain at most ${cap}.` : ""}`
            + `${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>`
            + `${proh ? edhaListPlaceNotes(owner, key) : ""}`
            + `${proh ? `<button type="button" class="edha-order-btn" data-edha-action="violated" data-edha-owner="${owner.uuid}" data-edha-list="${key}" data-edha-edict="${entry.id}">⚖ Violated — resolve</button>` : ""}`
            + `${this.releaseButton ? `<button type="button" class="edha-list-release" data-owner="${owner.uuid}" data-list="${key}" data-status="${status}" data-entry="${entry.id}"${mo ? ` data-multi="1"` : ""}>${this.releaseButton}</button>` : ""}` });
      });
    },
  },
  {
    source: "edha-content", type: "edha-triggered-effect",
    label: "Edha: Triggered Effect", description: "Deal damage / AoE / heal / Temp HP / affliction when this rule fires.",
    config: { schema: {
      whenDamageType: new FF.StringField({ required: false, initial: "any", label: "Only when you dealt damage type(s)", hint: "'any' or a comma-list: energy, impact, keen, spirit, vital (deal-damage rules only)" }),
      whenDealer: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "self", "any"), label: "Whose hit does this ride (edha-on-hit)", hint: "Blank = work it out: a talent that rolls its own attack test (skill_test WITH a damage formula) rides only its own hit; anything else rides any hit you deal. self = ONLY this talent's own hit (Cheap Shot's Stun must not ride your sword). any = ANY qualifying hit you deal, including a weapon's. Set it explicitly whenever the talent carries a damage formula for a reason OTHER than its own attack. 2026-07-27n." }),
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Only vs Isolated targets", hint: "Isolated = no ally within 5 ft of the target (Black tree; 07-05 ruling)." }),
      whenTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the target has this status", hint: "e.g. weakened — checks the victim (or your current target) before firing. Predatory Patience: Investiture only vs Weakened." }),
      unlessTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "SKIP when the target has this status", hint: "The negation of the gate above — a silent skip, never a stop, so the rules ordered after this one still run. Unravel Everything: the spirit + Disorient half only lands on bearers that are NOT Isolated (the Isolated ones take the vital rule instead). 07-25 pass 2bU." }),
      whenOwnsTalent: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when you also have this talent", hint: "The UPGRADE-TALENT gate (07-24p): blank = always. Ghostly Walls' extra Weakened only lands if you own Absolute Stillness. A name here is authored data you can edit — the upgrade talent's own document then carries no rule, so declare it in the tree-section header." }),
      kind: new FF.StringField({ required: true, initial: "damage", choices: choices("damage", "damage-aoe", "heal", "thp", "affliction", "status"), label: "Effect kind" }),
      perCounterStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Multiply by your counter on the victim", hint: "A counter status id (e.g. insight). The rolled formula is multiplied by max(count, 1) — ONE roll, then ×N, Killing Blow's 'per Insight'. Blank = no multiplication. 07-25." }),
      statusId: new FF.StringField({ required: false, blank: true, initial: "", label: "Status to apply (kind=status)", hint: "e.g. weakened, afflicted, slowed" }),
      statusExpire: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "owner", "target"), label: "Status expiry (kind=status)", hint: "owner/target = expires end of that side's next turn (timed stamp); blank = until removed" }),
      formula: new FF.StringField({ required: true, initial: "", label: "Formula", hint: "[Tier][Die] = (@tier)d(2 * @skills.<color>.rank + 2)" }),
      damageType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital", "heal"), label: "Damage type" }),
      target: new FF.StringField({ required: true, initial: "prompt", choices: choices("self", "victim", "near-victim", "prompt", "list-members"), label: "Target", hint: "list-members = EVERY creature on one of your sustained ledgers (Bear Witness: each Covenant ally). Set the ledger below. 07-24u." }),
      listName: new FF.StringField({ required: false, blank: true, initial: "", label: "Ledger (target = list-members)", hint: "The Edha: Sustained List this reads — e.g. covenants. Must match that rule's 'Ledger name'." }),
      listStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Ledger marker status (target = list-members)", hint: "Blank = use the ledger name. Order's ledger is `covenants` but its marker is `covenant`, so it has to be set." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Only members/targets within Attunement Range (colour)", hint: "Blank = no range gate. list-members: Bear Witness's White gate. prompt with Max targets set: the multi-target filter (Investiture of Command's Black range, 2bU). Needs BOTH tokens on the map." }),
      maxTargets: new FF.NumberField({ required: false, initial: 0, label: "Max targets (target = prompt)", hint: "0 = the pre-2bU behaviour, untouched. >0 = MULTI-TARGET mode: your current targets are filtered (side, range, alive), capped here, and kind 'thp' fans out with ONE shared roll through the keeps-higher cross-writer (Investiture of Command: up to 3 allies). Vetoed pre-cost when nobody qualifies. 2bU." }),
      requireDisposition: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "ally", "enemy"), label: "Targets must be (multi-target mode)", hint: "Blank = anyone. Only read when Max targets is set." }),
      whenMoment: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "combat-start", "round-start"), label: "Combat-timing moment (event = Edha: Combat-Timed Passive)", hint: "Which moment fires this rule. Blank/combat-start = once when combat begins (the historic behaviour). round-start = the start of EVERY round, Bear Witness's cadence. Ignored on any other event." }),
      radius: new FF.NumberField({ required: false, initial: 0, label: "AoE radius (ft)" }),
      nearAffects: new FF.StringField({ required: false, initial: "all", choices: choices("all", "enemies", "allies"), label: "Who the splash catches (target = near-victim)", hint: "all = everyone within the radius except you (the default, and what every pre-07-24r consumer did) · enemies / allies = relative to YOU, and downed creatures are skipped. Necrotic Cascade's corpse detonation is enemies-only." }),
      resourceGainResource: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "inv", "foc"), label: "Resource gained" }),
      resourceGainValue: new FF.NumberField({ required: false, initial: 0, label: "Resource gained amount" }),
      costResource: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "inv", "foc", "opportunity"), label: "Cost resource" }),
      costValue: new FF.NumberField({ required: false, initial: 0, label: "Cost amount" }),
      costOptional: new FF.BooleanField({ required: false, initial: false, label: "Optional cost (prompt)" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: false, label: "Once per round" }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown to players)" }),
    } },
    executor: async function (event) {
      try {
        const item = event.item; const owner = item?.actor;
        if (!owner || _edhaInTrigger) return;
        if (!edhaRuleOwnsGate(owner, this.whenOwnsTalent)) return;   // upgrade-talent gate (Absolute Stillness)
        // Damage-type filter (deal-damage rules): match the triggering roll's damage type.
        const dtype = event.options?.roll?.options?.damageType ?? event.options?.sourceItem?.system?.damage?.type;
        if (this.whenDamageType && this.whenDamageType !== "any" && dtype && !edhaRiderMatches(this.whenDamageType, dtype)) return;
        // Target-status gate (Predatory Patience: Investiture only on a hit vs a Weakened creature). For
        // deal-damage/use events there's no event victim → fall back to your current target.
        if (this.whenTargetStatus) {
          const tgt = edhaResolveVictim(event);
          if (!tgt?.statuses?.has?.(this.whenTargetStatus)) return;
        }
        if (this.unlessTargetStatus) {
          const tgt = edhaResolveVictim(event);
          if (tgt?.statuses?.has?.(this.unlessTargetStatus)) return;   // silent skip, never a stop
        }
        const spec = edhaTrigSpecFromCfg(this);
        const ctx = { victim: event.options?.victim ?? null };
        // perCounterStatus (07-25, 2bT): one roll ×max(count,1) — Killing Blow's "per Insight". The
        // count is read NOW, so a sibling counter-release rule ordered after this one cannot zero it.
        if (this.perCounterStatus && ctx.victim) {
          const st = String(this.perCounterStatus).trim();
          const n = Math.max(1, edhaCounterOn(owner, st, ctx.victim, st));
          if (n > 1) spec.effect.formula = `(${spec.effect.formula}) * ${n}`;
        }
        // Optional-cost triggers (Arc Flash, Afterburn) need the player to target a 2nd creature and decide
        // → a chat-card button. Unconditional triggers fire immediately.
        if (spec.cost?.optional) edhaPostTriggerCard(owner, item.name, spec, ctx);
        else await edhaFireTrigger(owner, item.name, spec, ctx);
      } catch (e) { console.error("Edha Content | edha-triggered-effect executor failed", e); }
    },
  },
  {
    source: "edha-content", type: "edha-damage-rider",
    label: "Edha: Damage Rider", description: "Passively adds bonus damage to your matching damage rolls.",
    config: { schema: {
      appliesTo: new FF.StringField({ required: true, initial: "any", label: "Applies to damage type(s)", hint: "'any' or a comma-list: energy, impact, keen, spirit, vital, heal" }),
      bonusFormula: new FF.StringField({ required: true, initial: "", label: "Bonus formula", hint: "e.g. @skills.red.mod or (1 + @tier)" }),
      whenTargetCondition: new FF.BooleanField({ required: false, initial: false, label: "Only when the target has a condition", hint: "Prognosis: heal riders that apply only vs conditioned creatures (checks your current target)." }),
      whenTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the target has this status", hint: "e.g. diagnosed, weakened (checks your current target)" }),
      whenMovedTowardFt: new FF.NumberField({ required: false, initial: 0, label: "Only after charging ≥ N ft toward the target this turn", hint: "Momentum's Edge: net displacement toward your current target this turn must be ≥ this (0 = off). Bonus = your Speed via @movement.walk.rate." }),
      whenTargetFooled: new FF.BooleanField({ required: false, initial: false, label: "Only when the target believes your seeming", hint: "Spearing Beak: reads the caster's phantom-copy belief ledger (edhaTargetFooled). MUST be declared here — an unregistered schema field is silently STRIPPED by the DataModel (bench 07-17: the built rule carried it, the loaded rule didn't, so the +1d6 would have applied unconditionally)." }),
      lightRadiusFt: new FF.NumberField({ required: false, initial: 0, label: "Damaged creatures shed light (ft, 0 = none)", hint: "Kindle: creatures that take this damage type from you emit a flame light of this radius until end of scene." }),
    } },
    executor: async function () { /* applied by the rollDamage wrapper (edhaRiderBonus reads this rule) */ },
  },
  {
    source: "edha-content", type: "edha-pick-expertises",
    label: "Edha: Pick Expertises (authored list)",
    description: "Prompts a pick of N expertises from THIS rule's own entries list. (The native grant-expertises pick mode offers the system's Rosharan registries instead — bench 07-19.)",
    config: { schema: {
      pickAmount: new FF.NumberField({ required: false, initial: 1, label: "How many to pick" }),
      entries: new FF.StringField({ required: true, initial: "[]", label: "Entries (JSON)", hint: 'JSON array of {"id","type","label","text"} — id/type/label required.' }),
      title: new FF.StringField({ required: false, blank: true, initial: "", label: "Dialog title (optional)" }),
    } },
    executor: async function (event) {
      try {
        const actor = event.item?.actor;
        if (!actor) return;
        let list = [];
        try { list = JSON.parse(this.entries || "[]"); } catch (e) { console.warn("Edha Content | edha-pick-expertises: entries JSON unparsable on", event.item?.name, e); }
        list = Array.isArray(list) ? list.filter(x => x && x.id && x.type && x.label) : [];
        if (!list.length) return;
        const amount = this.pickAmount, title = this.title, itemName = event.item?.name;
        const prev = globalThis.edhaExpertisePickChain ?? Promise.resolve();
        const job = prev.catch(() => {}).then(async () => {   // serialize: one pick dialog at a time (Ashkar fires two)
          const picked = await edhaPickExpertisesDialog(actor, list, amount, title, itemName);
          if (!picked?.length) return;
          await actor.update({ system: { expertises: Object.fromEntries(picked.map(x => [`${x.type}:${x.id}`, { id: x.id, type: x.type, label: x.label, locked: false }])) } });
          // Stamp what the picker granted so Start over / ↺ Change can wipe EXACTLY these
          // (bench 07-19: lingering picks + a forced re-pick stacked to four expertises).
          try {
            const prevKeys = actor.getFlag?.("edha-content", "originPicks") ?? [];
            await actor.setFlag("edha-content", "originPicks", [...new Set([...prevKeys, ...picked.map(x => `${x.type}:${x.id}`)])]);
          } catch (e) { /* stamp is best-effort */ }
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎓 <strong>${escCw(actor.name)}</strong> picks: ${picked.map(x => `<strong>${escCw(x.label)}</strong>`).join(", ")} <em>(${escCw(itemName ?? "origin")})</em>.</p>` });
        });
        globalThis.edhaExpertisePickChain = job;
        await job;
      } catch (e) { console.error("Edha Content | edha-pick-expertises executor failed", e); }
    },
  },
  {
    source: "edha-content", type: "edha-test-rider",
    label: "Edha: Test Modifier Rider", description: "Passively adds a bonus to your matching skill/attack TEST (injected as the system's temporary modifier).",
    config: { schema: {
      appliesTo: new FF.StringField({ required: true, initial: "any", choices: choices("any", "attack", "skill", "item"), label: "Applies to test type", hint: "'any' or one of: attack, skill, item" }),
      bonusFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Bonus formula", hint: "[Die] = 1d(2 * @skills.<color>.rank + 2). Resolved against your roll data, then added to the d20 test. May be blank when Mode is set." }),
      mode: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "advantage", "disadvantage"), label: "Advantage mode", hint: "Grants advantage/disadvantage on the matching test instead of (or as well as) a formula. 07-24j: replaced the name-keyed stance table; Frenzied Tempo rides it since 2bY (with unlessSkills)." }),
      whenSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Only on tests of this skill", hint: "A single skill id, e.g. itm (Intimidation), ins (Insight), agi (Agility). Narrower than 'Only on tests of these attribute(s)' — Intimidation is Presence, but so are Persuasion and Deception." }),
      unlessSkills: new FF.StringField({ required: false, blank: true, initial: "", label: "Never on tests of these skills", hint: "Comma-list of skill ids the rider stands down for. Leyline colours are skill ids, so 'white,blue,black,red,green' says 'Presence tests except the casts' (Frenzied Tempo — black is itself a Presence skill, which a positive filter cannot express). 2bY." }),
      whileStanceActive: new FF.BooleanField({ required: false, initial: false, label: "Only while THIS talent's stance is active", hint: "For stance talents (system.modality = stance): the rider applies only while the actor stands in the stance this very talent grants." }),
      whenTargetStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the target has one of these statuses", hint: "Comma-list = any of them (checks your current target). Predatory Patience: weakened. Kneel's standing advantage: compelled,frightened,weakened. (H13, 07-25 2bU.)" }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Only while the target is within Attunement Range", hint: "Blank = any distance. Kneel's advantage only reaches Black range. Both tokens must be on the map — off-map fails closed. (H13, 07-25 2bU.)" }),
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Only vs Isolated targets", hint: "Isolated = no ally within 5 ft of the target (Black tree; 07-05 ruling)." }),
      whenAttribute: new FF.StringField({ required: false, blank: true, initial: "", label: "Only on tests of these attribute(s)", hint: "comma-list of str, spd, int, wil, awa, pre. Burning Drive: 'str, spd' (Physical)." }),
      whenFastTurn: new FF.BooleanField({ required: false, initial: false, label: "Only on a Fast turn", hint: "Reads combatant turnSpeed (Momentum fast-turn payoffs)." }),
      whenSlowTurn: new FF.BooleanField({ required: false, initial: false, label: "Only on a Slow turn", hint: "Calculated Patience. NOT the negation of Fast: it requires a real combatant, so it stays OFF out of combat (an unset turnSpeed in combat IS Slow — the system's default)." }),
      firstTestThisTurn: new FF.BooleanField({ required: false, initial: false, label: "Only on your first test this turn", hint: "Burning Drive." }),
      whenEnemiesInMyZone: new FF.NumberField({ required: false, initial: 0, label: "Only while this many enemies stand in your difficult terrain", hint: "0 = no gate. Apex Predator: 3. Living enemies inside terrain YOU created (the Green Territory tag). 07-25 pass 2bS." }),
      unlessDisadvantage: new FF.BooleanField({ required: false, initial: false, label: "Stand down if the roll is already at disadvantage", hint: "Apex Predator never stomps an active disadvantage (e.g. Weakened). Only meaningful with Mode = advantage. 07-25 pass 2bS." }),
    } },
    executor: async function () { /* applied by the pre-roll injector (edhaTestRiderApply reads this rule) */ },
  },
  {
    source: "edha-content", type: "edha-move",
    label: "Edha: Forced Movement (caster)", description: "Relocate the caster toward their current target, ignoring Reactions, halting at walls. PILOT (Red): enforced, not GM-narrated.",
    config: { schema: {
      bySize: new FF.BooleanField({ required: false, initial: true, label: "Distance = [Size] (scales with Red rank)" }),
      byHalfSpeed: new FF.BooleanField({ required: false, initial: false, label: "Distance = half your Speed", hint: "Unstoppable. Reads system.movement.walk.rate." }),
      distanceFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed distance (ft, if neither above)" }),
      whenFastTurn: new FF.BooleanField({ required: false, initial: false, label: "Only on a Fast turn", hint: "Unstoppable." }),
      oncePerTurn: new FF.BooleanField({ required: false, initial: false, label: "Once per turn" }),
      requireTargetIsolated: new FF.BooleanField({ required: false, initial: false, label: "Target must be Isolated", hint: "Cruel Step. No living ally adjacent to the target (edhaIsIsolated); otherwise warn + no move." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function (event) { try { await edhaRunMove(event.item, this); } catch (e) { console.error("Edha Content | edha-move executor failed", e); } },
  },
  {
    source: "edha-content", type: "edha-push",
    label: "Edha: Push Target + Collision", description: "Shove the creature you hit away from you (wall-aware); on a wall collision, deal the collision damage. PILOT (Red). Pair with event edha-on-hit.",
    config: { schema: {
      whenDamageType: new FF.StringField({ required: false, initial: "impact", label: "Only when you dealt damage type(s)", hint: "'any' or a comma-list. The Red pilot consumer uses impact (melee only)." }),
      whenDealer: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "self", "any"), label: "Whose hit does this ride (edha-on-hit)", hint: "Blank = work it out: a talent that rolls its own attack test (skill_test WITH a damage formula) rides only its own hit; anything else rides any hit you deal. self = ONLY this talent's own hit (an attack talent's rider — Cheap Shot's Stun must not ride your sword). any = ANY qualifying hit you deal, including a weapon's (Shockwave Slam: 'when you hit with a melee Physical test'). Set it explicitly whenever the talent carries a damage formula for a reason OTHER than its own attack — a collision or rider number reads as 'this is my attack' to the default. 2026-07-27n." }),
      bySize: new FF.BooleanField({ required: false, initial: true, label: "Push distance = [Size]" }),
      sizeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Which colour scales [Size]", hint: "Blank = Red (the pilot consumer). Unnerving Approach scales off Black." }),
      awayFrom: new FF.StringField({ required: false, initial: "self", choices: choices("self", "anchor"), label: "Pushed away from", hint: "self = you (the usual: you shoved it) · anchor = the creature this rule's trigger was measured around. Unnerving Approach pushes your target's ALLY directly away from YOUR TARGET, which 'self' gets wrong." }),
      distanceFt: new FF.NumberField({ required: false, initial: 5, label: "Fixed push distance (ft, if not by size)" }),
      collisionFormula: new FF.StringField({ required: false, blank: true, initial: "floor((@tier)d(2 * @skills.red.rank + 2) / 2)", label: "Collision damage formula (blank = none)" }),
      collisionType: new FF.StringField({ required: false, initial: "impact", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Collision damage type" }),
      // Was initial: "Shockwave Slam" — a talent-specific default on a GENERIC handler, so any new
      // push rule authored in Foundry came out labelled as another talent (every shipped consumer
      // had to override it). Blank now; edhaRunPush falls back to "Push". (2026-07-24, iron rule 2b.)
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Note (card label)" }),
    } },
    /* Was config-only (edhaDispatchOnHit reads the rule directly and calls edhaRunPush). It now ALSO
     * has an executor so a push can be the PAYLOAD of anything — a gated test, a watch, an H6 pick.
     * That does not double-fire the on-hit path: `edha-on-hit` is registered against a sentinel hook
     * the system never fires, so nothing but this executor ever calls .execute() on the rule. */
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const victim = edhaResolveVictim(event);
        if (!victim) { ui.notifications?.warn(`Edha: ${item.name} — no creature to push.`); return; }
        await edhaRunPush(owner, victim, {
          bySize: this.bySize !== false, sizeColor: this.sizeColor || "", distanceFt: this.distanceFt,
          collisionFormula: this.collisionFormula, collisionType: this.collisionType,
          note: this.note || item.name,
          awayFrom: this.awayFrom || "self", anchorActor: event.options?.anchor ?? null,
        });
      } catch (e) { console.error("Edha Content | edha-push executor failed", e); }
    },
  },
  {
    source: "edha-content", type: "edha-rally-stack",
    label: "Edha: Rally Stack", description: "A stacking +1 counter (max = Red rank) SPENT in full on your next test (R-27 — the card is canon); an unspent stack still resets at the start of your turn or the round. Battle Fever / Feeding Frenzy. Allies-in-range sharing is narrated.",
    config: { schema: {
      trigger: new FF.StringField({ required: true, initial: "deal-damage", choices: choices("deal-damage", "manual"), label: "Bump on", hint: "deal-damage = your damage feeds it (Battle Fever); manual = bumped by edha.rally() (Feeding Frenzy: enemy-attacks-enemy has no hook)." }),
      resetOn: new FF.StringField({ required: true, initial: "turn", choices: choices("turn", "round"), label: "Unspent stack resets at start of", hint: "Battle Fever: turn. Feeding Frenzy: round. (Any test spends the whole stack first.)" }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function (event) { try { if ((this.trigger || "deal-damage") === "deal-damage") edhaRallyOnDeal(event.item?.actor); } catch (e) { console.error("Edha Content | edha-rally-stack executor failed", e); } },
  },
  {
    source: "edha-content", type: "edha-burst",
    label: "Edha: Point-Targeted Burst", description: "Click-to-place a burst template, then Detonate: capture everyone inside, roll once, auto-save for half, apply, optionally drop terrain.",
    config: { schema: {
      sizeByRank: new FF.BooleanField({ required: false, initial: true, label: "Size scales with leyline rank" }),
      sizeFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed size (ft, if not by rank)" }),
      affects: new FF.StringField({ required: true, initial: "enemies", choices: choices("enemies", "allies", "all", "none"), label: "Affects" }),
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Color (scaling/override)" }),
      rangeByRank: new FF.BooleanField({ required: false, initial: true, label: "Placement range = Attunement Range (by rank)" }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed placement range (ft, if not by rank)" }),
      saveSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Save skill (blank = no save)", hint: "e.g. ath — each captured enemy rolls this vs your save DC for half damage" }),
      saveVs: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Save DC vs your color" }),
      addSkillMod: new FF.StringField({ required: false, blank: true, initial: "", label: "Add skill mod to damage", hint: "e.g. red — matches the system's skill_test full-hit damage" }),
      heal: new FF.BooleanField({ required: false, initial: false, label: "Heal (instead of damage)" }),
      terrain: new FF.BooleanField({ required: false, initial: false, label: "Leave dangerous terrain at the point" }),
    } },
    executor: async function () { /* config-only: the preUseItem takeover reads this rule (edhaBurstRule) */ },
  },
  {
    source: "edha-content", type: "edha-defense-buff",
    label: "Edha: Combat-Timed Defense Buff", description: "Grants +N to the listed defenses during a combat-timing window (managed automatically by the combat tracker), or — window 'scene' — as an Active Effect created on use and cleared when the encounter ends.",
    config: { schema: {
      amount: new FF.NumberField({ required: true, initial: 2, label: "Bonus amount" }),
      defenses: new FF.StringField({ required: true, initial: "phy, cog, spi", label: "Defenses (comma list)", hint: "any of: phy, cog, spi" }),
      window: new FF.StringField({ required: true, initial: "round-until-turn", choices: choices("round-until-turn", "scene"), label: "Active window", hint: "round-until-turn = the combat hooks manage it (config-only, the historic mode). scene = created ON USE as an AE on you, deleted when the encounter ends (Mantle of the Aspirant's +2 — 2bU)." }),
      label: new FF.StringField({ required: false, initial: "", label: "Effect name (shown on the actor)" }),
      img: new FF.StringField({ required: false, initial: "icons/svg/shield.svg", label: "Effect icon" }),
    } },
    executor: async function (event) {
      // window "scene" (2bU): an on-use AE flagged for the generic end-of-encounter sweep. The
      // round-until-turn mode stays config-only (the combat hooks read the rule — edhaDefBuffFor).
      try {
        if (this.window !== "scene") return;
        const item = event.item, actor = item?.actor; if (!actor) return;
        const defs = String(this.defenses || "phy, cog, spi").split(",").map(s => s.trim()).filter(s => ["phy", "cog", "spi"].includes(s));
        const amt = Number(this.amount) || 0; if (!defs.length || !amt) return;
        await actor.createEmbeddedDocuments("ActiveEffect", [{
          name: this.label || `${item.name} (+${amt})`, img: this.img || item.img || "icons/svg/shield.svg",
          changes: defs.map(k => ({ key: `system.defenses.${k}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(amt), priority: 20 })),
          flags: { "edha-content": { sceneDefBuff: true } },
        }]);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p>🛡️ <strong>${item.name}</strong>: ${actor.name} gains <strong>+${amt}</strong> to ${defs.join("/")} for the scene.</p>` });
      } catch (e) { console.error("Edha Content | scene defense buff failed", e); }
    },
  },
  // `edha-aoe-template` was registered here until 2026-09-06 — RETIRED per R-78 (item 48); see the
  // retirement note where edhaPlaceAoe used to live. Use `edha-burst` for every area effect.
  {
    source: "edha-content", type: "edha-place-hazard",
    label: "Edha: Place Dangerous Terrain", description: "Drop a scene-long dangerous-terrain Region that damages tokens on enter / start of turn. mode trail (2bY) makes it a TOGGLE instead: on use the trail arms/ends, and while armed every space you move through becomes a dangerous-terrain patch with this rule's damage (Walking Ruin's shape; the move watcher reads the rule).",
    config: { schema: {
      mode: new FF.StringField({ required: false, initial: "drop", choices: choices("drop", "trail"), label: "What using it does", hint: "drop = place the Region now (the pre-2bY behaviour). trail = toggle the movement trail on/off; the patches use this rule's formula/type/colour." }),
      sizeByRank: new FF.BooleanField({ required: false, initial: false, label: "Size scales with leyline rank (drop)" }),
      sizeFt: new FF.NumberField({ required: false, initial: 10, label: "Size (ft, drop)" }),
      damageFormula: new FF.StringField({ required: true, initial: "(@tier)d(2 * @skills.red.rank + 2)", label: "Damage formula" }),
      damageType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Damage type" }),
      color: new FF.StringField({ required: false, blank: true, initial: "red", choices: choices("white", "blue", "black", "red", "green"), label: "Color" }),
      spreads: new FF.BooleanField({ required: false, initial: false, label: "The blaze spreads (drop)", hint: "Stamps the Region so the end-of-your-turn spread watcher offers the GM-judged flammable-square growth (Pyre's mechanic; 2bY — replaced the EDHA_PYRE_SOURCES alias list)." }),
    } },
    executor: async function (event) {
      const item = event.item, actor = item?.actor; if (!actor) return;
      if (this.mode === "trail") {   // the toggle — the move watcher (edhaTrailRuleOf) does the dropping
        const on = !actor.getFlag("edha-content", "hazardTrail");
        try { if (on) await actor.setFlag("edha-content", "hazardTrail", true); else { await actor.unsetFlag("edha-content", "hazardTrail"); await actor.unsetFlag("edha-content", "walkingRuin"); } } catch (e) {}
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p>🏚️ <strong>${item.name}</strong> ${on ? "active" : "ended"} — ${on ? "spaces you move through become dangerous terrain (this scene)." : "no longer leaving terrain."}</p>` });
        return;
      }
      await edhaPlaceHazard(item, this);
    },
  },
  {
    source: "edha-content", type: "edha-temp-hp",
    label: "Edha: Grant Temp HP", description: "Roll a formula on use and set it as the target's Edha Temp HP. 'victim' (07-25) grants the creature this rule's trigger resolved against — as a watch payload it KEEPS THE HIGHER value ('does not stack', Sovereign's Favor) and relays through the GM.",
    config: { schema: {
      formula: new FF.StringField({ required: true, initial: "", label: "Temp HP formula" }),
      target: new FF.StringField({ required: true, initial: "targeted", choices: choices("targeted", "self", "victim"), label: "Target" }),
    } },
    executor: async function (event) { const item = event.item; if (item?.actor) await edhaApplyTempHp(item, this, event.options); },
  },
  {
    source: "edha-content", type: "edha-ritual-hp-cost",
    label: "Edha: Ritual HP Cost", description: "On use, the caster loses health = formula, then the payment is ANNOUNCED (Edha: When You Pay Ritual HP) so ritual riders on other talents fire off their own documents.",
    config: { schema: {
      formula: new FF.StringField({ required: true, initial: "@tier", label: "HP lost (formula)", hint: "Rolled on use. e.g. @tier, or floor((1d(2 * @skills.black.rank + 2)) / 2) for 'half [Die]'." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function (event) { const item = event.item; if (item?.actor) await edhaRitualHpCost(item, this); },
  },
  /* H18's payload half (2bZ). The banking rule is ALSO the Reserve-user marker: the sheet's Reserve
   * bar, the Spend-Investiture "Pay from Reserve" checkbox, the Double-Dip pay-from-Reserve offer
   * and edhaReserveCap all key on an actor carrying this rule — never on a talent name. */
  {
    source: "edha-content", type: "edha-reserve-bank",
    label: "Edha: Bank Ritual HP As Reserve", description: "Pair with event Edha: When You Pay Ritual HP — the health just paid is banked as Reserve, up to the cap. Carrying this rule is what makes its owner a Reserve user: it turns on the sheet's Reserve bar, the Spend-Investiture 'Pay from Reserve' checkbox and the Double-Dip pay-from-Reserve offer.",
    config: { schema: {
      capFormula: new FF.StringField({ required: false, blank: true, initial: "@skills.black.rank", label: "Reserve cap (formula)", hint: "Resolved against YOUR roll data. Ranks in Black on the authored rule." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const paid = Math.max(0, Math.floor(Number(event.options?.paid) || 0));
        if (!paid) return;
        const before = edhaGetReserve(owner);
        const banked = (await edhaSetReserve(owner, before + paid)) - before;
        if (banked > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>🩸 <strong>${item.name}</strong>: banked <strong>${banked}</strong> Reserve (${edhaGetReserve(owner)}/${edhaReserveCap(owner)}).</p>` });
      } catch (e) { console.error("Edha Content | edha-reserve-bank executor failed", e); }
    },
  },
  {
    source: "edha-content", type: "edha-opportunity-option",
    label: "Edha: Opportunity Option", description: "An entry on the Opportunity-spend menu card (posts when one of your tests rolls an Opportunity). Pair with event Edha: When You Roll an Opportunity. The Opportunity itself is trusted (never auto-deducted); the listed resource cost IS deducted on click.",
    config: { schema: {
      label: new FF.StringField({ required: true, initial: "", label: "Menu label", hint: "What the button offers, e.g. 'Advantage on your next Deception test this round'." }),
      costResource: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "inv", "foc"), label: "Cost resource (besides the Opportunity)" }),
      costValue: new FF.NumberField({ required: false, initial: 0, label: "Cost amount" }),
      kind: new FF.StringField({ required: true, initial: "adv-next-test", choices: choices("adv-next-test", "note"), label: "Effect", hint: "adv-next-test = advantage on your next <skill> test this round; note = post the note (table-run). IGNORED if this talent carries any rule on the 'Edha: When You Roll an Opportunity' event — those run instead, and ANY handler works there (07-25)." }),
      skill: new FF.StringField({ required: false, blank: true, initial: "", label: "Skill id (adv-next-test)", hint: "e.g. dec (Deception), ath (Athletics)" }),
      whenAttribute: new FF.StringField({ required: false, blank: true, initial: "", label: "Only after tests on these attributes", hint: "Comma-list of str, spd, int, wil, awa, pre — the attribute of the test that PRODUCED the Opportunity, so the option only appears after the right kind of roll. 'str, spd' is a Physical test (Reckless Momentum's 'when you succeed on a Physical test'). Blank = offer it after any test. 07-25." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown on the card / posted for kind=note)" }),
    } },
    executor: async function () { /* config-only: the post-roll Opportunity watcher reads this rule (edhaOpportunityMenuWatch) */ },
  },
  {
    source: "edha-content", type: "edha-heal-cut",
    label: "Edha: Halve Healing On Hit (Necrotic Grasp)", description: "When you hit a creature with a matching-color attack, its healing received is halved until the end of your next turn. Applied automatically at damage application.",
    config: { schema: {
      color: new FF.StringField({ required: false, blank: true, initial: "black", choices: choices("", "white", "blue", "black", "red", "green"), label: "Only on this color's attacks", hint: "blank = any of your attacks; 'black' = Black-talent hits only (Necrotic Grasp)." }),
      fraction: new FF.NumberField({ required: false, initial: 0.5, label: "Healing multiplier", hint: "0.5 = halved." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  },
  /* 2bW (Death). The lethal-drop ward as a PAYLOAD rule: the flag it writes was always generic —
   * edhaDeathWardCheck in the applyDamage post-pass reads `deathWard` off the victim, and the
   * defeat watcher skips warded creatures — only the WRITER was name-keyed. Put it on 'When Your
   * Test SUCCEEDS' after a gated test (Death Ward: Black vs Spiritual, willing bypass), or on
   * `use` for an untested ward. */
  {
    source: "edha-content", type: "edha-ward",
    label: "Edha: Ward the First Lethal Drop",
    description: "The subject creature is warded: the FIRST time it would drop to 0 HP this scene it drops to 1 HP instead and gains the Temp HP formula, then the ward ends. Enforced by the damage post-pass; the defeat watcher never counts a warded drop. An already-warded target (and a missing GM for another's creature) refuses BEFORE cost.",
    config: { schema: {
      thpFormula: new FF.StringField({ required: false, blank: true, initial: "(@tier)d(2 * @skills.black.rank + 2) + @attr.pre", label: "Temp HP on the save", hint: "Baked against YOUR roll data when the ward lands, rolled when it fires. Blank = this talent's own damage formula." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const victim = edhaResolveVictim(event);
        if (!victim) { ui.notifications?.warn(`Edha: ${item.name} — target the character first.`); return; }
        if (victim.getFlag?.("edha-content", "deathWard")) { ui.notifications?.info(`Edha: ${victim.name} already bears a ward.`); return; }
        const baked = edhaFoldDieMath(Roll.replaceFormulaData(this.thpFormula || item.system?.damage?.formula || "0", owner.getRollData(), { missing: "0" }));
        await edhaSetEdhaFlag(victim, "deathWard", { ownerId: owner.id, ownerName: owner.name, sourceName: item.name, formula: baked });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>💀 <strong>${item.name}</strong>: ${victim.name} is warded — the first time they would drop to 0 HP this scene, they drop to 1 HP instead and gain the Temp HP. The ward then ends.${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>` });
      } catch (e) { console.error("Edha Content | edha-ward executor failed", e); }
    },
  },
  /* 2bW (Death). The recurring-affliction shape: gated application, then a start-of-its-turn drain
   * that heals the caster. The tick, the icon-removal cleanup and the scene reset were already
   * flag-driven (`decay`); only the APPLICATION was a name-keyed takeover. One instance per
   * creature — any owner — is the flag key's own semantics. */
  {
    source: "edha-content", type: "edha-turn-dot",
    label: "Edha: Recurring Decay (start-of-turn drain)",
    description: "On use, your targeted creature starts decaying: at the start of each of its turns it takes the formula (re-rolled each turn) and you heal a fraction of the damage. Removing the marker icon ends it; the whole state clears at scene end. The target gate (marker status or below half HP, range, one instance per creature, a GM online for another's creature) refuses BEFORE cost.",
    config: { schema: {
      statusId: new FF.StringField({ required: false, initial: "decaying", label: "Marker status", hint: "Shown on the token while the decay runs; removing it ends the decay." }),
      formula: new FF.StringField({ required: false, blank: true, initial: "", label: "Damage per turn", hint: "Baked against YOUR roll data at apply, re-rolled each tick. Blank = this talent's own damage formula." }),
      damageType: new FF.StringField({ required: false, blank: true, initial: "", label: "Damage type", hint: "Blank = this talent's own damage type (vital fallback)." }),
      healOwnerFraction: new FF.NumberField({ required: false, initial: 0.5, label: "You heal this fraction of each tick", hint: "Consuming Decay is 0.5. 0 = no drain-back." }),
      requireTargetStatus: new FF.StringField({ required: false, blank: true, initial: "weakened", label: "Target must have this status… (checked BEFORE cost)", hint: "Blank with the box below off = no gate." }),
      orBelowHalfHp: new FF.BooleanField({ required: false, initial: true, label: "…OR be below half HP", hint: "Consuming Decay's gate is 'Weakened or below half HP'." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "black", choices: choices("", "white", "blue", "black", "red", "green"), label: "Target within Attunement Range (checked BEFORE cost)" }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const target = edhaUserTargetActor();
        if (!target || target === owner) { ui.notifications?.warn(`Edha: target the creature for ${item.name}.`); return; }
        if (target.getFlag?.("edha-content", "decay")) { ui.notifications?.warn(`Edha: ${target.name} is already decaying (one instance per creature).`); return; }
        const formula = edhaFoldDieMath(Roll.replaceFormulaData(this.formula || item.system?.damage?.formula || "0", owner.getRollData(), { missing: "0" }));
        const st = this.statusId || "decaying";
        const value = { ownerId: owner.id, ownerName: owner.name, formula, type: this.damageType || item.system?.damage?.type || "vital",
          healFraction: Math.max(0, Math.min(1, Number(this.healOwnerFraction ?? 0.5))), status: st, sourceName: item.name };
        await edhaSetEdhaFlag(target, "decay", value);
        await edhaToggleStatus(target, st, true);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>🦠 <strong>${item.name}</strong>: ${target.name} is <strong>${edhaConditionLabel(st) || st}</strong> — for the scene it takes the damage at the start of each of its turns${value.healFraction > 0 ? `, and ${owner.name} regains ${value.healFraction === 0.5 ? "half" : `${Math.round(value.healFraction * 100)}%`} of it as HP` : ""}. Remove the icon to end it.${this.note ? ` <span style="opacity:.8">${this.note}</span>` : ""}</p>` });
      } catch (e) { console.error("Edha Content | edha-turn-dot executor failed", e); }
    },
  },
  /* 2bW (Death). Raise Dead's exit — ENGINE-OWNED flow keyed on its rule (the edha-decree shape):
   * the DialogV2 confirm, the burst-apply revive relay, the combatant initiative surgery and the
   * auto injury are a multi-step subsystem no rule chain expresses, so the FLOW stays engine code
   * and this rule is how it is armed, gated and tuned. See the Death tree-section header. */
  {
    source: "edha-content", type: "edha-revive",
    label: "Edha: Revive a Downed Creature",
    description: "On use: the targeted 0-HP creature returns to 1 HP (GM relay), gains the status until the end of ITS next turn, moves onto your initiative (GM-side), and takes one auto-created injury. If your ledger holds an entry you are asked whether to consume one. Once per scene + the target-at-0 gate refuse BEFORE cost (the generic sceneOnce stamp).",
    config: { schema: {
      statusId: new FF.StringField({ required: false, blank: true, initial: "disoriented", label: "Status until the end of ITS next turn", hint: "Blank = none." }),
      ledger: new FF.StringField({ required: false, blank: true, initial: "remains", label: "Optional ledger spend", hint: "An Edha: Sustained List name — with an entry held, a confirm asks whether one represents the target and consumes it. Blank = no spend." }),
      ledgerStatus: new FF.StringField({ required: false, blank: true, initial: "harvested", label: "…its marker status", hint: "Blank = the ledger name." }),
      confirm: new FF.StringField({ required: false, blank: true, initial: "", label: "The confirm's wording", hint: "{name} = the target. Blank = 'Consume one <marker> for {name}?'" }),
      injury: new FF.BooleanField({ required: false, initial: true, label: "The raising leaves one additional injury (auto-created)" }),
      initiative: new FF.BooleanField({ required: false, initial: true, label: "It acts on your initiative (GM-side combatant move)" }),
      oncePerScene: new FF.BooleanField({ required: false, initial: true, label: "Once per scene", hint: "Vetoed BEFORE cost (the generic sceneOnce stamp)." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function (event) { await edhaReviveUse(event.item, this); },
  },
  /* 2bW (Life). Adaptive Mutation's chooser: a whispered card offering the rule's enabled
   * adaptations; the click bakes the picked rider onto the WILLING target's `mutation` flag, which
   * the (already name-free) applyDamage readers consume — Bone Spurs rides the outgoing pre-pass,
   * Venom the on-hit post-pass, Dense Tissue the incoming deflect reduce + the forced-movement
   * veto. One adaptation per creature, scene-scoped (the Life reset clears it). */
  {
    source: "edha-content", type: "edha-mutation",
    label: "Edha: Grant an Adaptation (pick one)",
    description: "On use, a whispered card offers the enabled adaptations for your willing target (default you): Bone Spurs (+keen on melee hits), Venom Glands (melee hits afflict ongoing vital), Dense Tissue (+Deflect and immunity to forced movement). Clicking bakes the choice onto the creature for the scene — one adaptation per creature; a talent granting apex doubling reads the same flag.",
    config: { schema: {
      keenFormula: new FF.StringField({ required: false, blank: true, initial: "@tier", label: "Bone Spurs: +keen on melee hits", hint: "Flat, computed on pick. Blank = the option is not offered." }),
      venomFormula: new FF.StringField({ required: false, blank: true, initial: "floor(((@tier)d(2 * @skills.green.rank + 2)) / 2)", label: "Venom Glands: ongoing vital (rolled on pick)", hint: "Blank = not offered." }),
      keenOnGraze: new FF.BooleanField({ required: false, initial: true, label: "Bone Spurs: also fires on a graze", hint: "R-14 (item 56): follow the card — 'melee attacks DEAL additional Keen' = grazes count (on). 'On a hit' wording = off." }),
      venomOnGraze: new FF.BooleanField({ required: false, initial: true, label: "Venom Glands: also fires on a graze", hint: "R-14 (item 56): follow the card — 'melee HITS inflict Afflicted' = hit only (off). 'When you deal damage' wording = on. Off is what Adaptive Mutation ships." }),
      deflectAmount: new FF.NumberField({ required: false, initial: 2, label: "Dense Tissue: +Deflect", hint: "0 = not offered. Dense Tissue also refuses forced movement (the engine veto reads the flag)." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const target = edhaUserTargetActor() ?? owner;
        edhaPostMutationCard(owner, target, item.name, this);
      } catch (e) { console.error("Edha Content | edha-mutation executor failed", e); }
    },
  },
  /* 2bW (Life). The start-of-THEIR-turn regen grant (Apex Form / Primal Regeneration): writes a
   * `lifeRegen` entry on YOU (the regrowth-queue pattern) that the EXISTING combatTurnChange
   * resolver heals from — edhaResolveLifeRegen was flag-driven all along, so no new hook and no
   * edha-combat-timing widening was needed. The apex half — +Deflect, +vital-on-hits, adaptation
   * doubling, the injury-on-end price — is the `apexForm` flag the (name-free) readers and the
   * Life scene reset consume. */
  {
    source: "edha-content", type: "edha-regen-grant",
    label: "Edha: Grant Start-of-Turn Regeneration",
    description: "On use, your willing target (default you) regenerates the formula at the START OF ITS TURNS for the scene. Optional: end when it takes Vital/Spirit damage (Primal Regeneration), a better formula while it carries an adaptation, and the apex package — +Deflect, +vital on its attacks, adaptations doubled, and an auto-created Injury when the effect ends at scene end (Apex Form).",
    config: { schema: {
      formula: new FF.StringField({ required: true, initial: "@tier + 1", label: "Regeneration per turn", hint: "Rolled against YOUR roll data each tick. Apex Form: (@tier)d(2 * @skills.green.rank + 2)." }),
      endOnVitalSpirit: new FF.BooleanField({ required: false, initial: false, label: "Ends if it takes Vital or Spirit damage", hint: "Primal Regeneration." }),
      mutationFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "…better formula while it carries an adaptation", hint: "Primal Regeneration: (@tier)d(2 * @skills.green.rank + 2) + 1. Blank = no upgrade." }),
      deflect: new FF.NumberField({ required: false, initial: 0, label: "Apex: +Deflect while active", hint: "Apex Form is 2. 0 with no vital formula = no apex package." }),
      vitalFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Apex: +vital on its attacks", hint: "Flat, baked at use (Apex Form: @tier). Blank = none. Any apex field also DOUBLES the target's active adaptations and prices the effect at one Injury when it ends at scene end — the flag readers do both." }),
      vitalOnGraze: new FF.BooleanField({ required: false, initial: true, label: "Apex: +vital also fires on a graze", hint: "R-14 (item 56): follow the card — 'DEALS additional Vital damage on all attacks' = grazes count (on). 'On a hit' wording = off." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card text", hint: "{name} = the target. Blank = a generic summary." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const t = edhaUserTargetActor() ?? owner;
        const deflect = Math.max(0, Number(this.deflect) || 0);
        const vital = this.vitalFormula ? Math.max(0, Math.floor(edhaEvalSync(this.vitalFormula, owner.getRollData()))) : 0;
        if (deflect > 0 || vital > 0)
          await edhaSetEdhaFlag(t, "apexForm", { deflect, vital, vitalOnGraze: this.vitalOnGraze !== false, ownerUuid: owner.uuid, sourceName: item.name, sceneId: canvas?.scene?.id ?? null });   // vitalOnGraze: the rule's dial (R-14)   // Job 6: edhaSetActorFlagCross retired
        await edhaAddLifeRegen(owner, { targetUuid: t.uuid, formula: this.formula || "@tier + 1",
          endOnVitalSpirit: this.endOnVitalSpirit === true, sourceName: item.name,
          mutationFormula: String(this.mutationFormula || "").trim() });
        const text = this.note ? String(this.note).split("{name}").join(t.name)
          : `${t.name} regenerates at the start of its turns (scene).`;
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🌟 <strong>${item.name}</strong>: ${text}</p>` });
      } catch (e) { console.error("Edha Content | edha-regen-grant executor failed", e); }
    },
  },
  {
    source: "edha-content", type: "edha-summon",
    label: "Edha: Summon", description: "Spawn a token scaled to the caster when this talent is used.",
    config: { schema: {
      summonName: new FF.StringField({ required: true, initial: "", label: "Summon name" }),
      img: new FF.StringField({ required: false, initial: "", label: "Token image" }),
      creatureType: new FF.StringField({ required: false, blank: true, initial: "", label: "Creature type", hint: "Blank = the system default (humanoid). 'Construct' mints the summon as {id: custom, custom: Construct} — what Fault Line's Constructs ×3 (and any other creature-type gate) reads. 'animal' passes through as the native id. 2026-07-26n." }),
      hpFormula: new FF.StringField({ required: true, initial: "(@tier)d6", label: "HP formula" }),
      speed: new FF.NumberField({ required: false, initial: 25, label: "Speed (ft)" }),
      defensePenalty: new FF.NumberField({ required: false, initial: 2, label: "Defenses = caster − N" }),
      deflect: new FF.NumberField({ required: false, initial: 0, label: "Deflect (0 = none)" }),
      conditionImmunities: new FF.StringField({ required: false, initial: "", label: "Condition immunities (comma list)" }),
      attackName: new FF.StringField({ required: false, initial: "Attack", label: "Attack name" }),
      attackFormula: new FF.StringField({ required: false, initial: "", label: "Attack damage formula" }),
      attackType: new FF.StringField({ required: false, initial: "keen", label: "Attack damage type" }),
      attackRange: new FF.StringField({ required: false, initial: "melee", choices: choices("melee", "ranged"), label: "Attack range" }),
      actsAfterCaster: new FF.BooleanField({ required: false, initial: true, label: "Acts on caster's initiative" }),
      sustainCap: new FF.StringField({ required: false, blank: true, initial: "", label: "How many you can sustain", hint: "A formula resolved against YOUR roll data — '1' for a single sustained summon, '@tier' for one per tier. BLANK = no limit (every pre-07-24y summon behaves this way). Enforced BEFORE the cost is charged." }),
      replaceOldest: new FF.BooleanField({ required: false, initial: false, label: "At the cap, replace instead of refusing", hint: "OFF = using the talent at your cap is refused and nothing is spent (Risen Servant). ON = the OLDEST sustained summon is dismissed and the new one takes its place (Forge Construct's sustain-ONE reforge)." }),
      /* 2bAA (the Holographic Illusion 1b). `edhaSummon` honours SIX spec fields the schema never
       * exposed — tokenName, displayName, disposition, extraFlags, anchorTok and tokenSizeFt — and
       * that is why Blue's summons lived in engine code. Widened with exactly what the Blue specs
       * need: the token's [Size] and a placement point. The other four are per-cast runtime values
       * (a duplicated token's name/hover-mode/disposition, the belief flags), not dials a GM edits,
       * and they stay with the illusion-copy flow that computes them. */
      tokenSizeFt: new FF.NumberField({ required: false, initial: 0, label: "Token size (ft)", hint: "0 = one square. 10 makes a 2x2 token on a 5 ft grid." }),
      tokenSizeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "…or size it by this colour's [Size]", hint: "Blank = the fixed size above. A colour scales the token with your rank in it ([Size] = 2.5/5/10/15/20 ft) — Holographic Illusion is 'not exceeding [Size]' on Blue." }),
      placeAt: new FF.StringField({ required: false, initial: "beside-you", choices: choices("beside-you", "pick-point"), label: "Where it appears", hint: "beside-you = the square next to your token (every pre-2bAA summon). pick-point = you CLICK the square, gated by the range below; cancelling or picking out of range REFUNDS the cost." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Placement range = this colour's Attunement Range", hint: "pick-point only. Blank and no fixed range = place anywhere on the scene." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "…or a fixed placement range (ft)", hint: "0 = use the colour above." }),
      bakedEffectsJson: new FF.StringField({ required: false, blank: true, initial: "", label: "Baked ActiveEffects (JSON array — advanced)", hint: "Toggled-off mode effects on the summon, e.g. Siege Form. [{label, icon, disabled, changes:[{key,mode,value}], description}]" }),
      extraItemsJson: new FF.StringField({ required: false, blank: true, initial: "", label: "Extra abilities (JSON array — advanced)", hint: "Additional baked actions, e.g. a Siege-Form ranged attack. [{name, actions, damageFormula, damageType, description}]" }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      const pj = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
      let at = null;
      if ((this.placeAt || "beside-you") === "pick-point") {
        at = await edhaPickPlacement(item, { color: this.rangeColor || "", rangeFt: this.rangeFt });
        if (!at) return;                                   // cancelled / out of range — already refunded
      }
      await edhaSummon(item.actor, {
        name: this.summonName || item.name, img: this.img, talentName: item.name, at,
        creatureType: String(this.creatureType || "").trim() || null,
        tokenSizeFt: this.tokenSizeColor
          ? (EDHA_SIZE_FT[edhaColorRank(item.actor, this.tokenSizeColor)] || EDHA_SIZE_FT[1])
          : (Number(this.tokenSizeFt) || null),
        hpFormula: this.hpFormula, speed: this.speed, defensePenalty: this.defensePenalty, deflect: this.deflect,
        conditionImmunities: String(this.conditionImmunities || "").split(/[,\s]+/).filter(Boolean),
        attack: this.attackFormula ? { name: this.attackName || "Attack", damageFormula: this.attackFormula, damageType: this.attackType || "keen", range: this.attackRange || "melee" } : null,
        actsAfterCaster: !!this.actsAfterCaster,
        bakedEffects: pj(this.bakedEffectsJson), extraItems: pj(this.extraItemsJson),
      });
    },
  },

  /* H22 (2bAA) — the engine's first blocks-movement capability. ENGINE-OWNED, keyed on the RULE:
   * the picker, the Wall documents and their GM relay are canvas work no rule chain expresses
   * (§9o), so the flow stays engine code and every dial is a field. See the Illusion section. */
  {
    source: "edha-content", type: "edha-barrier",
    label: "Edha: Barrier (blocks movement)", description: "Click-place an obstruction with health: a token that can be attacked and destroyed, inside a box of Foundry walls that nothing moves through. It comes down when it is destroyed, when its token is deleted, or at the end of the encounter. Put it on 'use'.",
    config: { schema: {
      barrierName: new FF.StringField({ required: false, blank: true, initial: "", label: "Barrier name", hint: "Blank = this talent's name." }),
      img: new FF.StringField({ required: false, initial: "", label: "Token image" }),
      hpFormula: new FF.StringField({ required: true, initial: "2d(2 * @skills.blue.rank + 2)", label: "Health formula", hint: "Rolled against YOU when it goes up. Phantom Barricade is 2[Die] on the Blue track." }),
      sizeFt: new FF.NumberField({ required: false, initial: 0, label: "Size (ft)", hint: "0 = one grid square. The walled box and the token are both this size." }),
      defensePenalty: new FF.NumberField({ required: false, initial: 99, label: "Defenses = yours − N", hint: "99 = no meaningful defenses; anything that swings at it hits." }),
      blocksMovement: new FF.BooleanField({ required: false, initial: true, label: "Blocks movement", hint: "ON raises real walls, which is the only thing in Foundry that stops a token moving. OFF makes it a purely visual obstruction." }),
      blocksSight: new FF.StringField({ required: false, initial: "none", choices: choices("none", "limited", "normal"), label: "Blocks line of sight", hint: "none = seen through, which is what a shimmering illusion is — and COVER stays a table read, as it does everywhere else in this system. limited/normal make it a real sight blocker." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Placement range = this colour's Attunement Range", hint: "Blank and no fixed range = place anywhere on the scene." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "…or a fixed placement range (ft)", hint: "0 = use the colour above." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card line", hint: "Say what the table resolves by hand — e.g. that it grants cover." }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      await edhaPlaceBarrier(item, this);
    },
  },

  /* ENGINE-OWNED, taken RULE-KEYED (2bAA — the edha-decree exit shape). Re-litigated per iron
   * rule 3 and the exit CONFIRMED: the per-viewer veil is a patch of the Token#isVisible getter
   * driven by a cross-actor belief ledger, and no rule chain expresses a canvas visibility patch.
   * So the FLOW stays engine code and this rule carries every dial — who is copied, the label the
   * copy stamps, its HP/speed/defenses, which of YOUR defenses sets the DC, which skill the
   * onlookers roll, the range gate, and the card line. The Mistheron's The Seeming is the second
   * consumer, on its own adversary document (lint pass 5 standard). No talent name in code. */
  {
    source: "edha-content", type: "edha-illusion-copy",
    label: "Edha: Illusory Copy (belief loop)", description: "Place an illusory duplicate that every enemy who can see it tests against. Losers lose track of the original — their client stops rendering it; winners see only empty air where the copy stands. Any hit breaks it. Put it on 'use'.",
    config: { schema: {
      copyOf: new FF.StringField({ required: false, initial: "target-or-self", choices: choices("target-or-self", "self"), label: "Who is duplicated", hint: "target-or-self = your targeted creature, or you when nothing is targeted (Phantom Double) · self = always you, targeting ignored (an adversary's self-only seeming)." }),
      sourceLabel: new FF.StringField({ required: false, blank: true, initial: "", label: "Label the copy carries", hint: "Blank = this item's name. It is stamped on the copy and read back by the break announcement, the belief cards and any damage rider keyed on 'taken in by the seeming' — so a rename follows the DOCUMENT, not a literal." }),
      hpFormula: new FF.StringField({ required: false, initial: "1", label: "Copy's health", hint: "1 = any hit breaks it (both shipped consumers)." }),
      speed: new FF.NumberField({ required: false, initial: 0, label: "Copy's speed (ft)" }),
      defensePenalty: new FF.NumberField({ required: false, initial: 99, label: "Copy's defenses = yours − N", hint: "99 = it has no meaningful defenses; anything that swings at it hits." }),
      beliefDefense: new FF.StringField({ required: false, initial: "cog", choices: choices("phy", "cog", "spi"), label: "Your defense sets the DC" }),
      beliefSkill: new FF.StringField({ required: false, initial: "prc", label: "Skill the onlookers roll", hint: "A skill id — prc (Perception) for both shipped consumers. The engine rolls it; it is never trusted to the player (iron rule 3)." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "The duplicated ALLY must be in this Attunement Range", hint: "Blank = no range gate. Copying YOURSELF is never gated. An out-of-range pick REFUNDS the cost." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card line" }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const targeted = edhaUserTargetActor();
        const dup = (this.copyOf || "target-or-self") === "self" ? owner : (targeted ?? owner);
        if (dup !== owner && this.rangeColor) {
          const dtok = edhaCasterToken(dup);
          if (!dtok || !edhaAllyInAttune(owner, dtok, this.rangeColor)) {
            edhaRefundCost(item);
            ui.notifications?.warn(`Edha: ${dup.name} is not an ally within your ${this.rangeColor} Attunement Range — ${item.name} refunded.`);
            return;
          }
        }
        await edhaCastPhantomDouble(owner, dup, {
          source: this.sourceLabel || item.name, hpFormula: this.hpFormula, speed: this.speed,
          defensePenalty: this.defensePenalty, beliefDefense: this.beliefDefense,
          beliefSkill: this.beliefSkill, note: this.note,
        });
      } catch (e) { console.error("Edha Content | edha-illusion-copy executor failed", e); }
    },
  },

  /* Config-only by design: the turn-start sweep in the Illusion section is the reader (the
   * pass-Y/Z veto shape). Nothing here executes, because Living Image's `use` payload is a note. */
  {
    source: "edha-content", type: "edha-illusion-upkeep",
    label: "Edha: Illusion Upkeep Prompt", description: "While you have living summoned illusions, your turn start whispers an upkeep prompt with a one-click payment. Config-only: the turn-start sweep reads this rule, so it needs no event of its own — put it on any event.",
    config: { schema: {
      resource: new FF.StringField({ required: false, initial: "inv", choices: choices("inv", "foc"), label: "Resource paid" }),
      costPer: new FF.NumberField({ required: false, initial: 1, label: "Cost per illusion", hint: "Charged once per click — the button pays for ONE illusion, because which of your images count stays a table call." }),
      qualifier: new FF.StringField({ required: false, blank: true, initial: "COMPLEX", label: "Which illusions cost upkeep", hint: "Printed in the prompt. Living Image charges for COMPLEX images only; simple ones are free and the table calls which is which." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Note appended to the prompt" }),
    } },
    // config-only — read by the `combatTurnChange` sweep in the Illusion section (edhaActorRuleOf)
    // and by edhaUpkeepInvClick (edhaRuleOf off the pay button's document). This no-op exists so a
    // rule placed on an event the system DOES dispatch (`use`, `add-to-actor`, …) executes to
    // nothing instead of throwing in `Handler.execute` (item 71). It must never do anything.
    executor: async function () {},
  },

  /* ---- v3 HANDLER TYPES (state marks, sweeps, apply-engine watchers) ---- */
  {
    source: "edha-content", type: "edha-apply-status",
    label: "Edha: Mark / Apply Status to Target", description: "On use, applies a status to your targeted creature and records you as the mark's owner. Optional: allies' damage vs the marked creature gains bonus damage.",
    config: { schema: {
      status: new FF.StringField({ required: true, initial: "diagnosed", label: "Status", hint: "e.g. diagnosed, weakened, insight" }),
      expire: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "combat", "owner-turn", "target-turn"), label: "When it wears off", hint: "Blank = stays until removed by hand (every pre-07-24w consumer). combat = cleared when the encounter ends (Rousing Presence, 07-24w). owner-turn / target-turn = timed — expires at the start of YOUR / the end of ITS next turn via the timed-status sweep (Kneel's Compelled is owner-turn; 2bU)." }),
      mark: new FF.BooleanField({ required: false, initial: true, label: "Record you as the mark's owner", hint: "ON (the default) for a DEBUFF you place on an enemy — it writes markedBy.<status>, which is what lets allies' damage read the bonus below. Turn it OFF for a BUFF you place on an ally (Rousing Presence's Determined): an ownership mark on a friend is semantically an enemy-debuff flag and it sits on the shared damage read path. 07-24v." }),
      whenOwnsTalent: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when you also have this talent", hint: "The UPGRADE-TALENT gate: blank = always. A name here is authored data you can edit; the upgrade talent's own document then carries no rule, so declare it in the tree-section header." }),
      bonusDamageFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Bonus damage vs the marked target (flat formula)", hint: "Vital Diagnosis: @tier — added to ANY damage applied to the marked creature" }),
      bonusDamageType: new FF.StringField({ required: false, initial: "vital", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Bonus damage type" }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown in chat)" }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      await edhaApplyStatusMark(item, this, event.options?.victim ?? null);
    },
  },
  {
    source: "edha-content", type: "edha-status-sweep",
    label: "Edha: Damage All [Status] Creatures In Range", description: "On use, every creature in range with the status takes the damage; optionally gain Temp HP equal to the total dealt (Spoils of Isolation).",
    config: { schema: {
      status: new FF.StringField({ required: true, initial: "weakened", label: "Status filter" }),
      rangeByRank: new FF.BooleanField({ required: false, initial: true, label: "Range = Attunement Range (by color rank)" }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Fixed range (ft, if not by rank)" }),
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Color (range scaling)" }),
      damageFormula: new FF.StringField({ required: true, initial: "@tier", label: "Damage per creature (formula)" }),
      damageType: new FF.StringField({ required: false, initial: "vital", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Damage type" }),
      thpFromTotal: new FF.BooleanField({ required: false, initial: false, label: "Gain Temp HP = total damage dealt" }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      await edhaStatusSweep(item, this);
    },
  },
  {
    source: "edha-content", type: "edha-overflow-thp",
    label: "Edha: Heal Overflow Becomes Temp HP", description: "When this talent's healing would exceed the target's max HP, the excess becomes Edha Temp HP (applied automatically).",
    config: { schema: {
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
      deflectStackMax: new FF.NumberField({ required: false, initial: 0, label: "Deflect rider: stack +1 Deflect per heal, up to", hint: "0 = no rider. Overgrowth: 3 — each heal by this talent also steps a +1/+2/+3 Deflect AE on the healed creature until combat ends. 07-25 pass 2bS: this FIELD is the discriminator (Life Surge carries the identical overflow rule and grants no Deflect); it replaced the item.name === 'Overgrowth' check." }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-damage-convert",
    label: "Edha: Convert Damage Type vs State", description: "Your damage changes type when the victim matches a state (Severance: vs Isolated → vital). Applied automatically at damage application.",
    config: { schema: {
      toType: new FF.StringField({ required: true, initial: "vital", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Convert to type" }),
      whenTargetIsolated: new FF.BooleanField({ required: false, initial: true, label: "Only vs Isolated targets" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-marked-damage-trigger",
    label: "Edha: When Your Marked Creature Takes Damage", description: "When the creature bearing your mark/status takes damage from any source, you recover a resource (once per round). Applied automatically.",
    config: { schema: {
      status: new FF.StringField({ required: true, initial: "diagnosed", label: "Watched status (your mark)" }),
      resource: new FF.StringField({ required: true, initial: "inv", choices: choices("inv", "foc"), label: "Resource recovered" }),
      value: new FF.NumberField({ required: true, initial: 1, label: "Amount" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-gm-cue",
    label: "Edha: GM Cue Card", description: "Whispers the GM a reminder card when the trigger crosses (damaged / hp-below / ally-drops / seeming-break / on-hit / enemy-turn-start / turn-end). Config-only: the engine's watchers read this rule. REGISTRATION IS LOAD-BEARING — an unregistered handler type is silently dropped by the DataModel, exactly like a bad rule id.",
    config: { schema: {
      trigger: new FF.StringField({ required: true, initial: "damaged", choices: choices("damaged", "hp-below", "ally-drops", "seeming-break", "on-hit", "enemy-turn-start", "turn-end"), label: "Trigger" }),
      atFraction: new FF.NumberField({ required: false, initial: 0.5, label: "HP fraction crossed (hp-below; 0 = the drop)" }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Range ft (ally-drops / enemy-turn-start; 0 = anywhere)" }),
      everyNRounds: new FF.NumberField({ required: false, initial: 1, label: "Every N rounds (turn-end)" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
      note: new FF.StringField({ required: false, initial: "", label: "Card text (author the cost into it)" }),
    } },
    executor: async function () { /* config-only: the engine's cue watchers read this rule */ },
  },
  {
    source: "edha-content", type: "edha-regen",
    label: "Edha: Turn-End Regen", description: "At the end of the owner's turn, the owner regains a flat amount of health, engine-applied (clamped: never while down, never past max) with a whispered GM card. Config-only: the turn cue sweep reads this rule. First consumer: the Garden Sow's Nexus-Fed.",
    config: { schema: {
      amount: new FF.NumberField({ required: true, initial: 5, label: "HP regained at turn end" }),
      note: new FF.StringField({ required: false, initial: "", label: "Card text" }),
    } },
    executor: async function () { /* config-only: edhaTurnCueSweep applies the regen */ },
  },
  {
    source: "edha-content", type: "edha-ambush-belief",
    label: "Edha: Ambush Seeming Belief Test", description: "On the owner's first attack against each target per scene, the target tests Perception vs the owner's chosen defense (engine-rolled); failure marks them fooled in the owner's ambushBelief ledger, which whenTargetFooled damage riders read. The lightweight seeming — no phantom copy, no client veil. Config-only: the engine's use-hook watcher reads this rule off the seeming trait.",
    config: { schema: {
      dcFrom: new FF.StringField({ required: false, initial: "cog", choices: choices("phy", "cog", "spi"), label: "Owner defense used as DC" }),
      perceptionAdvantage: new FF.BooleanField({ required: false, initial: false, label: "Target tests with advantage (frayed/imperfect seeming)" }),
      note: new FF.StringField({ required: false, initial: "", label: "GM-card suffix (the rider reminder)" }),
    } },
    executor: async function () { /* config-only: the ambush-belief use-hook reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-pack-advantage",
    label: "Edha: Pack Advantage (Aggro Ledger)", description: "Attacking a creature that a living packmate (another token carrying this same item) last attacked → this attack rolls with advantage. Config-only: the pre-roll pipeline reads this rule via the aggro ledger.",
    config: { schema: {
      note: new FF.StringField({ required: false, initial: "", label: "Note" }),
    } },
    executor: async function () { /* config-only: the pack-advantage pre-roll reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-dark-veil",
    label: "Edha: Marker Auto-On In Darkness", description: "While the owner's token stands unlit, the named marker AE auto-enables (re-lit auto-disables only engine-enabled markers — a GM's manual cover toggle is never fought). Config-only: the dark-veil sweep reads this rule.",
    config: { schema: {
      effectName: new FF.StringField({ required: false, blank: true, initial: "", label: "Marker AE name prefix (blank = this item's name)" }),
    } },
    executor: async function () { /* config-only: the dark-veil sweep reads this rule */ },
  },
  /* 2bU (07-25). The sense-through-obstruction spec as a rule — was the name-keyed
   * EDHA_SENSE_REVEALS table (Void Sense, Reaper's Harvest). The per-viewer canvas rendering stays
   * ENGINE-OWNED (edhaSenseRevealShows rewires the local client's veil, which no document rule can
   * do for another client); this rule carries which STATUS reveals and the damage-recovery rider,
   * so the talent is editable and a rename unwires nothing. */
  {
    source: "edha-content", type: "edha-sense-reveal",
    label: "Edha: Sense Marked Creatures (config only)",
    description: "You sense creatures bearing this marker status through walls and fog — their tokens render to YOUR client through any obstruction (GM-hidden stays hidden). Optionally, when a creature bearing YOUR marker takes damage, you recover a resource. Config-only: the veil wrap and the damage post-pass read this rule — put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      status: new FF.StringField({ required: true, initial: "omen", label: "Marker status", hint: "Tokens bearing this status render through obstructions to the owner's client (Void Sense: omen · Reaper's Harvest: harvested)." }),
      recoverResource: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "inv", "foc"), label: "Recover this resource on damage", hint: "Blank = no recovery rider. Void Sense recovers Investiture when a creature bearing YOUR marker takes damage from any source." }),
      recoverAmount: new FF.NumberField({ required: false, initial: 0, label: "…this much" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Recovery once per round" }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Recovery only within Attunement Range", hint: "Blank = any distance. Void Sense's card says 'in Attunement Range' (Blue). Both tokens must be on the map." }),
    } },
    executor: async function () { /* config-only: edhaSenseRevealShows + edhaSenseRevealOnDamage read this rule */ },
  },
  /* 2bU (07-25). The damage-redirect offer as a rule — was Mantle-name-keyed. The poster and the
   * click machinery stay ENGINE-OWNED (the H6 trade: a multi-click budgeted prompt is not a rule);
   * this rule carries WHO qualifies, the budget and the range, which is what makes it editable.
   * 2bV adds `direction: intercept` — the INVERSE flow (Shoulder the Oath): a creature on YOUR
   * ledger takes the hit and YOU may take a fraction of it in their place. */
  {
    source: "edha-content", type: "edha-redirect",
    label: "Edha: Redirect Damage (config only)",
    description: "to-allies: when you take damage while armed, a whispered offer lets you pass up to the budget of it to one or more willing allies in range (Mantle of the Aspirant). intercept: a creature on your sustained ledger takes damage and you are offered a Reaction — take the fraction yourself (same type), they heal back fraction + the heal bonus (never more than they lost), and BOTH of you gain the Temp HP formula (Shoulder the Oath). Config-only: the applyDamage post-pass reads this rule — put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      direction: new FF.StringField({ required: false, initial: "to-allies", choices: choices("to-allies", "intercept"), label: "Which way the damage moves", hint: "to-allies = you shed your own hit onto willing allies (the 2bU behaviour). intercept = you take part of a ledger ally's hit for them. 2bV." }),
      budgetFormula: new FF.StringField({ required: false, blank: true, initial: "@tier", label: "Redirect budget (formula, to-allies)", hint: "Capped by the HP you actually lost. Mantle of the Aspirant: @tier." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "black", choices: choices("", "white", "blue", "black", "red", "green"), label: "Attunement Range colour", hint: "to-allies: the allies you may shed onto. intercept: the victim must be within this range of you (Shoulder the Oath: white). Blank = no range gate (Lifeline's bond has none). 2bW." }),
      requireSelfStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only while YOU carry this status", hint: "The arming gate — pair with an Edha: Apply Status To Yourself rule on use (mantled). Blank = always on (intercept passives)." }),
      watchList: new FF.StringField({ required: false, blank: true, initial: "", label: "Your ledger (intercept)", hint: "An Edha: Sustained List name — Shoulder the Oath watches `covenants`." }),
      watchListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…its marker status", hint: "Blank = the ledger name (Order: `covenant`)." }),
      watchFlag: new FF.StringField({ required: false, blank: true, initial: "", label: "…or watch the SINGLE creature linked under this flag (intercept)", hint: "Instead of a ledger: the one creature bound by 'link on use' below. Lifeline: `lifeline`. ⚠ the Life scene reset clears the `lifeline` key by name — a different flag needs its own cleanup. 2bW." }),
      linkOnUse: new FF.BooleanField({ required: false, initial: false, label: "Using this talent LINKS your current target (intercept)", hint: "On use, your targeted creature (or you, untargeted) is bound under the watch flag for the scene. Lifeline. 2bW." }),
      linkNote: new FF.StringField({ required: false, blank: true, initial: "", label: "…and the link card adds", hint: "{name} = the linked creature." }),
      takeFraction: new FF.NumberField({ required: false, initial: 0.5, label: "Fraction you take (intercept)", hint: "floor(damage × fraction). Shoulder the Oath is 0.5. With 'choose the amount' on, this is the CAP instead." }),
      chooseAmount: new FF.BooleanField({ required: false, initial: false, label: "Choose the amount on the card (intercept)", hint: "The offer carries a number input — take UP TO floor(damage × fraction), your pick (Lifeline). The victim heals back what you took (plus the healing die below). 2bW." }),
      takeType: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "energy", "impact", "keen", "spirit", "vital"), label: "You take it as (intercept)", hint: "Blank = the same type that hit them. Lifeline converts to `spirit` (Spirit already ignores Deflect). 2bW." }),
      healBonusFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Heal-back bonus (intercept)", hint: "The victim heals back min(damage lost, your fraction + this). Shoulder the Oath: @skills.white.rank." }),
      healFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Healing die on top (choose-amount mode)", hint: "Rolled on the CLICK and added to the heal-back, uncapped — Lifeline heals the linked creature [Tier][Die on Green] on top of the absorbed amount. Blank = none. 2bW." }),
      thpFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Temp HP to BOTH of you (intercept)", hint: "Keeps-higher, never stacks. Shoulder the Oath: @skills.white.rank. Blank = none." }),
      oncePerRound: new FF.BooleanField({ required: false, initial: false, label: "Once per round (intercept)", hint: "The offer only posts (and the click only resolves) once per round." }),
    } },
    executor: async function (event) {
      /* linkOnUse (2bW — Lifeline): on use, bind your current target under the watch flag; the
       * intercept sweep then watches that single creature. Config-only otherwise. */
      if (this.linkOnUse !== true) return;
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const t = edhaUserTargetActor() ?? owner;
        const key = String(this.watchFlag || "lifeline").trim();
        await owner.setFlag("edha-content", key, { targetUuid: t.uuid, sceneId: canvas?.scene?.id ?? null });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>🩸 <strong>${item.name}</strong>: ${owner.name} is bound to ${t.name} for the scene${this.linkNote ? ` — ${String(this.linkNote).split("{name}").join(t.name)}` : ""}.</p>` });
      } catch (e) { console.error("Edha Content | redirect link failed", e); }
    },
  },
  /* 2bV. Lawkeeper's Eye's shape, generic: advantage against creatures bound on YOUR ledger. */
  {
    source: "edha-content", type: "edha-bound-adv",
    label: "Edha: Advantage vs Your Ledger-Bound Targets (config only)",
    description: "Any attack or item test you or an ally rolls against a creature on your sustained ledger gains advantage while YOU can see the target (hidden/wall line of sight — darkness stays GM-judged). Config-only: the pre-roll injector reads this rule — put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      list: new FF.StringField({ required: true, initial: "edicts", label: "Your ledger", hint: "Lawkeeper's Eye reads `edicts`." }),
      listStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…its marker status", hint: "Blank = the ledger name (Order: `edict`)." }),
      includeDecree: new FF.BooleanField({ required: false, initial: false, label: "Also creatures bound by your active Decree", hint: "Reads the prohibition subsystem's decree snapshot (Final Decree)." }),
      requireLos: new FF.BooleanField({ required: false, initial: true, label: "Only while YOU can see the target", hint: "edhaCanSee — hidden/wall LOS; darkness GM-judged." }),
      placeNote: new FF.StringField({ required: false, blank: true, initial: "", label: "Printed on this ledger's PLACE cards", hint: "Lawkeeper's GM-reveal + advantage line rides Edict's card. Blank = nothing." }),
    } },
    executor: async function () { /* config-only: edhaBoundAdvApply reads this rule */ },
  },
  /* 2bV. Verdict's payload — the prohibition family's resolve-as-a-rule. */
  {
    source: "edha-content", type: "edha-prohibition-resolve",
    label: "Edha: Resolve a Prohibition (On Success)",
    description: "Put it on 'When Your Test SUCCEEDS' after an Edha: Gated Test. The victim's entry on your ledger resolves as a violation (the shared resolver: damage off the PLACING talent's formula, Disoriented, any annotate rider, entry consumed). The court then turns on the accomplices: each OTHER enemy within the radius rolls the skill vs your colour (engine-rolled, never trusted); failures share ONE roll of THIS talent's damage formula + Disoriented.",
    config: { schema: {
      list: new FF.StringField({ required: true, initial: "edicts", label: "Your ledger" }),
      listStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…its marker status", hint: "Blank = the ledger name (Order: `edict`)." }),
      courtRadiusFt: new FF.NumberField({ required: false, initial: 10, label: "Court radius (ft; 0 = no court)", hint: "Verdict is 10." }),
      courtSkill: new FF.StringField({ required: false, initial: "dis", label: "Accomplices' skill", hint: "The engine rolls each foe — never trust-the-player (iron rule 3)." }),
      courtColor: new FF.StringField({ required: false, initial: "blue", label: "…vs your colour" }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        const victim = event.options?.victim; if (!victim) return;
        const key = String(this.list || "edicts").trim();
        const st = String(this.listStatus || key).trim();
        const e = edhaOwnerList(owner, key, st).find(x => x.uuid === victim.uuid);
        if (!e) { ui.notifications?.info(`Edha: ${victim.name} is no longer on your ${key}.`); return; }
        await edhaProhResolveViolation(owner, key, e.id, { via: item.name });
        const radius = Number(this.courtRadiusFt) || 0; if (radius <= 0) return;
        const vtok = edhaOrderTokenOf(victim.uuid); if (!vtok) return;
        const foes = edhaEnemyTokensInCircle(owner, vtok.center.x, vtok.center.y, radius).filter(t => t.actor && t.actor !== victim);   // "each OTHER enemy"
        if (!foes.length) return;
        const skill = this.courtSkill || "dis", color = this.courtColor || "blue";
        const slabel = edhaSkillLabel(skill);   // 07-27f: was the raw i18n KEY in the prose line below
        const dr = await edhaRollFormula(owner, item.system?.damage?.formula || EDHA_ORDER_BLUE_DIE);
        const amt = Math.max(0, Math.floor(dr.total));
        edhaTreeCard(owner, [dr], `<p>⚖️ <strong>${item.name}</strong> — the court turns on the accomplices (${foes.length} within ${radius} ft): one shared roll, <strong>${amt}</strong> ${item.system?.damage?.type || "spirit"} to each who fails ${slabel} vs your ${color[0].toUpperCase()}${color.slice(1)}.</p>`);
        await edhaFoeSkillVsColor(owner, foes, {
          skill, label: slabel, color, sourceName: item.name, icon: "⚖️",
          failText: `fails — ${amt} ${item.system?.damage?.type || "spirit"} + Disoriented`, okText: "stands firm",
          onFail: async (t) => {
            if (amt > 0) await edhaOrderApplyHits(owner, [{ actorUuid: t.actor.uuid, amount: amt, type: item.system?.damage?.type || "spirit", heal: false }]);
            await edhaApplyTimedStatus(t.actor, "disoriented", { owner, expire: "owner" });
          },
        });
      } catch (e) { console.error("Edha Content | prohibition-resolve failed", e); }
    },
  },
  /* 2bV. Final Decree's dials — the flow itself stays ENGINE-OWNED (multi-step subsystem; see the
   * Order section header) and this rule is how it is armed, gated and tuned. */
  {
    source: "edha-content", type: "edha-decree",
    label: "Edha: Scene-Wide Prohibition (Decree)",
    description: "On use: every living enemy in your Attunement Range is bound under ONE declared prohibition (picker; cancel refunds) and your ledger allies stand Witness. The violation watchers prompt; resolution fires every active Edict, grants the Witness Temp-HP die + advantage, and courts every enemy near the violator with this talent's damage formula. The flow is engine-owned; this rule carries the dials.",
    config: { schema: {
      rangeColor: new FF.StringField({ required: false, initial: "blue", choices: choices("white", "blue", "black", "red", "green"), label: "Enemy net — Attunement Range colour" }),
      witnessList: new FF.StringField({ required: false, blank: true, initial: "covenants", label: "Witness ledger", hint: "Blank = no Witnesses." }),
      witnessListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…its marker status", hint: "Blank = the ledger name (Order: `covenant`)." }),
      witnessThpFormula: new FF.StringField({ required: false, blank: true, initial: "(@tier)d(2 * @skills.white.rank + 2)", label: "Witness Temp HP (ONE shared roll)", hint: "Keeps-higher. Final Decree is the White [Tier][Die] (Ben R0/R9)." }),
      courtRadiusFt: new FF.NumberField({ required: false, initial: 10, label: "Court radius around the violator (ft)", hint: "Violator INCLUDED (the Magnum-Opus R7a precedent)." }),
      oncePerScene: new FF.BooleanField({ required: false, initial: true, label: "Once per scene", hint: "Vetoed BEFORE cost (the generic sceneOnce stamp)." }),
    } },
    executor: async function (event) { await edhaDecreeUse(event.item, this); },
  },
  /* 2bU (07-25). The flat test aura as a rule — was Mantle's name-keyed pre-roll injector. */
  {
    source: "edha-content", type: "edha-test-aura",
    label: "Edha: Flat Test Aura (config only)",
    description: "While you are armed, qualifying creatures near you add a flat bonus to every d20 test they roll (injected pre-roll; ⚑ dialog-roll rebuilds are the standing bench caveat). Config-only: the pre-roll injector reads this rule — put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      amountFormula: new FF.StringField({ required: false, blank: true, initial: "1", label: "Bonus (formula, vs YOUR roll data)", hint: "Mantle of the Aspirant: 1." }),
      affects: new FF.StringField({ required: false, initial: "allies", choices: choices("allies", "enemies", "all"), label: "Who benefits", hint: "Relative to you. Allies excludes the wearer unless 'You too' is on." }),
      includeSelf: new FF.BooleanField({ required: false, initial: false, label: "You too", hint: "Mantle's card says ALLIES — the wearer is excluded." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Within Attunement Range (colour)", hint: "Blank = use the fixed feet below." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "…or this many feet" }),
      requireSelfStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only while YOU carry this status", hint: "The arming gate (mantled)." }),
    } },
    executor: async function () { /* config-only: edhaTestAuraApply reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-self-status",
    label: "Edha: Apply Status To Yourself (On Use)", description: "On use, the user gains the status — timed (expires end of your next turn) or until removed. Brace-class defensive stances, and the arming statuses the armed damage-bonus / watch rules read.",
    config: { schema: {
      statusId: new FF.StringField({ required: true, initial: "braced", label: "Status id" }),
      timed: new FF.BooleanField({ required: false, initial: true, label: "Expires (end of your next turn)" }),
      refuseWhileActive: new FF.BooleanField({ required: false, initial: false, label: "Refuse a re-use while active (nothing spent)", hint: "An UNTIMED arm always refuses (the generic veto). A TIMED one normally refreshes on re-use — turn this ON to refuse instead (Unstoppable Advance). 2bU." }),
      oncePerScene: new FF.BooleanField({ required: false, initial: false, label: "Once per scene", hint: "Vetoed BEFORE cost on a repeat even after the status ends (the generic sceneOnce stamp, cleared when the encounter ends). Mantle of the Aspirant. 2bU." }),
      immuneStatuses: new FF.StringField({ required: false, blank: true, initial: "", label: "While active, shrug off these statuses", hint: "Comma-list. Statuses landing on you while you carry the arm are deleted with a card (Unstoppable Advance: slowed,immobilized,prone). 2bU." }),
      requireListNonEmpty: new FF.StringField({ required: false, blank: true, initial: "", label: "Refuse with this sustained ledger empty (checked BEFORE cost)", hint: "An Edha: Sustained List name. Concord binds your covenants — with none active, nothing is spent. Blank = no gate. 2bV." }),
      requireListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…that ledger's marker status", hint: "Blank = the ledger name (Order: `covenants` / `covenant`)." }),
    } },
    executor: async function (event) {
      const actor = event.item?.actor; if (!actor) return;
      if (this.oncePerScene) await edhaStampSceneOnce(actor, event.item);
      if (this.timed !== false) await edhaApplyTimedStatus(actor, this.statusId || "braced", { owner: actor, expire: "owner" });
      else await edhaToggleStatus(actor, this.statusId || "braced", true);
    },
  },
  /* ---- H2: the zone family (07-25, pass 2bS — Green's terrain talents off their names) ---- */
  {
    source: "edha-content", type: "edha-zone",
    label: "Edha: Place a Zone (terrain / Foundation / fortify / link)",
    description: "The zone family. terrain = click-to-place a [Size] difficult-terrain square Region within Attunement Range (the Green Draw-Mana rider's shape). foundation = the begin-turn defense-buff square (Civilization's Foundation: gold Drawing, tier sustain cap, +1 all defenses to allies beginning their turn inside). fortify = your existing Foundations grow teeth for the scene (enter damage off THIS talent's formula + Agility-vs-Red save, enemies-only difficult terrain, Construct +2 inside). link = pick two of your Foundations; allies teleport between them (once/turn, trusted). The pickers, Drawings, Regions and GM relays stay engine-owned; this rule carries the dials. A cancelled picker REFUNDS the cost.",
    config: { schema: {
      kind: new FF.StringField({ required: false, initial: "terrain", choices: choices("terrain", "foundation", "fortify", "link", "ordained", "snare", "link-markers", "charge", "line"), label: "Zone verb", hint: "terrain is the pre-2bV behaviour, untouched. foundation/fortify/link are Civilization's Foundation family (2bV). ordained/snare click-place a 5 ft marker square into the owner's marker ledger — cap/evict off this rule, a snare's damage off ITS document, cancel/out-of-range refunds; link-markers picks TWO of your ordained squares and links them (Fate, 2bX). charge = click-place a detonation marker into the `charges` ledger + the trigger-arm card (Destruction's Set Charge; blast radius = Square size, cap/evict/range off this rule, damage off ITS document, cancel/out-of-range refunds; 2bY). line = a click-direction line AoE off ITS document's damage + an engine-rolled foe save + a line hazard (Fault Line; the line/save dials below; 2bY)." }),
      color: new FF.StringField({ required: true, initial: "green", label: "Zone colour", hint: "terrain: tint/tag/[Size] scaling (ruling 122). foundation: the Attunement-Range colour for placement (Lay Foundation: white)." }),
      sizeFt: new FF.NumberField({ required: false, initial: 0, label: "Square size (ft, 0 = [Size] by colour rank)", hint: "Lay Foundation is 10." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Placement range (ft, 0 = Attunement Range by colour rank)" }),
      capFormula: new FF.StringField({ required: false, blank: true, initial: "@tier", label: "Sustain cap (kind = foundation)", hint: "The oldest crumbles past it." }),
      costList: new FF.StringField({ required: false, blank: true, initial: "", label: "Placing also consumes one ledger entry (kind = terrain)", hint: "An Edha: Sustained List name — Bone Garden plants a Harvested Remain (`remains`). Refused BEFORE cost when the ledger is empty; a cancelled or out-of-range pick REFUNDS the activation cost and spends nothing. Blank = no ledger cost. 2bW." }),
      costListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…its marker status", hint: "Blank = the ledger name (Death: `remains` / `harvested`)." }),
      evict: new FF.StringField({ required: false, initial: "oldest", choices: choices("oldest", "refuse"), label: "At the cap (kind = ordained / snare)", hint: "oldest = the oldest marker fizzles to make room (the Fate convention, Ben R1) · refuse = the new one doesn't land. 2bX." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note (kind = link-markers)", hint: "The granted-actions text printed when the two squares link (Weave the Thread's Aid / Reactive-Strike grants — the Ben-approved manual half). 2bX." }),
      lengthFt: new FF.NumberField({ required: false, initial: 0, label: "Line length (ft, kind = line)", hint: "0 = 60 (Fault Line)." }),
      widthFt: new FF.NumberField({ required: false, initial: 0, label: "Line width (ft, kind = line)", hint: "0 = 5." }),
      constructMult: new FF.NumberField({ required: false, initial: 0, label: "Structures/Constructs damage multiplier (kind = line)", hint: "0 = ×3 (Fault Line). Constructs are wired; structures stay GM-side (no actor for a wall)." }),
      saveSkill: new FF.StringField({ required: false, blank: true, initial: "", label: "Save skill (kind = line)", hint: "Engine-rolled for EVERY character caught in the line — allies included, caster excluded (R-5). Blank = spd." }),
      saveLabel: new FF.StringField({ required: false, blank: true, initial: "", label: "…shown on the card as", hint: "Blank = the skill id. Fault Line: Speed." }),
      saveColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "…vs your colour (kind = line)", hint: "Blank = red." }),
      failStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…status on a failed save (kind = line)", hint: "Blank = prone." }),
    } },
    executor: async function (event) {
      const item = event.item, actor = item?.actor; if (!actor) return;
      const kind = this.kind || "terrain";
      if (kind === "foundation") return edhaZoneFoundation(item, this);
      if (kind === "fortify") return edhaZoneFortify(item, this);
      if (kind === "link") return edhaZoneLink(item, this);
      if (kind === "ordained" || kind === "snare") return edhaFatePlaceCore(item, this, kind);   // 2bX
      if (kind === "link-markers") return edhaZoneLinkMarkers(item, this);                        // 2bX
      if (kind === "charge") return edhaSetChargeMarker(item, this);                              // 2bY
      if (kind === "line") return edhaFaultLine(item, this);                                      // 2bY
      const tok = edhaCasterToken(actor);
      if (!tok) { ui.notifications?.warn(`Edha: ${item.name} — no token on the scene to place terrain from.`); return; }
      const color = this.color || "green";
      const rank = edhaColorRank(actor, color) || 1;
      const ft = Number(this.rangeFt) > 0 ? Number(this.rangeFt) : (EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1]);
      const sizeFt = Number(this.sizeFt) > 0 ? Number(this.sizeFt) : (EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1]);
      let ring = null;
      try { ring = await edhaDrawCircle(tok.center.x, tok.center.y, ft, EDHA_RANGE_RING_HEX, 0); } catch (e) {}
      const pt = await edhaPickPoint(`Click where the ${sizeFt} ft difficult-terrain square grows (right-click to cancel). Attunement Range ${ft} ft.`);
      try { if (ring) await ring.delete(); } catch (e) {}
      const gd0 = canvas?.scene?.grid?.distance || 5, gs0 = canvas?.scene?.grid?.size || 100;
      if (pt && Math.hypot(pt.x - tok.center.x, pt.y - tok.center.y) / gs0 * gd0 <= ft + gd0 / 2) {
        await edhaDropGreenTerrain(actor, canvas?.scene, pt.x, pt.y, sizeFt, item);
        // Ledger cost (2bW — Bone Garden): spent only once the square actually landed.
        if (this.costList) await edhaLedgerSpend(actor, String(this.costList).trim(), String(this.costListStatus || this.costList).trim(), item.name);
        const srcRule0 = edhaRuleOf(item, "edha-zone-hazard");
        const thorn = srcRule0 ? { item, handler: srcRule0 } : edhaZoneHazardRule(actor);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p>🌿 <strong>${item.name}</strong> (${actor.name}): ${sizeFt} ft difficult-terrain square placed${thorn ? ` (${thorn.handler.label || thorn.item.name} rides it)` : ""}.</p>` });
      } else {
        if (pt) ui.notifications?.warn(`Edha: that point is beyond Attunement Range (${ft} ft) — terrain not placed.`);
        if (this.costList) { edhaRefundCost(item); ui.notifications?.info(`${item.name} cancelled — cost refunded.`); }
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p>🌿 <strong>${item.name}</strong> (${actor.name}): terrain NOT placed (${pt ? "out of range" : "cancelled"}).</p>` });
      }
    },
  },
  {
    source: "edha-content", type: "edha-zone-hazard",
    label: "Edha: Zone Hazard Rider (config only)",
    description: "Difficult terrain YOU create also damages creatures that enter or start their turn in it (Thorn Field's shape). Config-only: the zone creator reads this rule off the creator's items and bakes the hazard into the Region — put it on an 'Edha: Watch Rule' event. @colorRank = your rank in the colour (ROLE rank for an adversary), @tier = your tier.",
    config: { schema: {
      moment: new FF.StringField({ required: false, initial: "enter-turn-start", choices: choices("enter-turn-start", "turn-end"), label: "When it damages", hint: "enter-turn-start = the hazard Region behavior (Thorn Field). turn-end = ANY creature — allies and the owner too — that ENDS its turn inside takes the damage (Bone Garden's grasping bone; applied by the generic turn-end sweep). 2bW." }),
      damageFormula: new FF.StringField({ required: true, initial: "floor(((@tier)d(2 * @colorRank + 2)) / 2)", label: "Damage formula", hint: "Baked against your roll data when the terrain is placed. Thorn Field is half [Tier][Die] keen." }),
      damageType: new FF.StringField({ required: false, initial: "keen", label: "Damage type" }),
      color: new FF.StringField({ required: false, initial: "green", label: "Colour for @colorRank" }),
      label: new FF.StringField({ required: false, blank: true, initial: "", label: "Hazard label", hint: "Shown on the terrain visual and the damage cards. Blank = this talent's name." }),
    } },
  },
  {
    source: "edha-content", type: "edha-zone-react",
    label: "Edha: Zone Reaction",
    description: "What this talent does around dangerous/difficult terrain you own. turn-end-in-zone + offer-expand = a creature ends its turn in your terrain → a whispered offer to expand it (Spreading Roots' shape; config-only, read by the combat-turn sweep — put it on an 'Edha: Watch Rule' event; one offer per round). defeat-in-zone + ignite-spread = a character drops to 0 HP in your terrain → a zone ignites on the body and your zones spread (Combustion Chain's shape; the defeat sweep reads it, and using the talent posts the armed reminder card; 2bY).",
    config: { schema: {
      when: new FF.StringField({ required: true, initial: "turn-end-in-zone", choices: choices("turn-end-in-zone", "defeat-in-zone"), label: "Trigger", hint: "New zone moments are added WITH their payloads, never schema-only (§9o) — defeat-in-zone landed with the ignite-spread sweep (2bY)." }),
      action: new FF.StringField({ required: true, initial: "offer-expand", choices: choices("offer-expand", "ignite-spread"), label: "What happens" }),
      color: new FF.StringField({ required: false, initial: "green", label: "Colour for the [Size] rank (offer-expand) / the ignited zone (ignite-spread)" }),
      sizeFt: new FF.NumberField({ required: false, initial: 0, label: "Expansion (ft, 0 = [Size] by colour rank; offer-expand)" }),
      costInv: new FF.NumberField({ required: false, initial: 1, label: "Investiture cost (spent on the CLICK; offer-expand)", hint: "A declined offer costs nothing." }),
      igniteRadiusFt: new FF.NumberField({ required: false, initial: 0, label: "Ignited zone radius (ft, ignite-spread)", hint: "0 = 10 (Combustion Chain)." }),
      spreadFt: new FF.NumberField({ required: false, initial: 0, label: "Your existing zones each spread (ft, ignite-spread)", hint: "0 = 5. GM grows the Regions (no geometry union exists — the card instructs)." }),
      damageFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Ignited zone damage formula (ignite-spread)", hint: "Blank = the standard Charge formula." }),
      damageType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "…of type (ignite-spread)" }),
    } },
    executor: async function (event) {
      // defeat-in-zone (2bY): using the Reaction posts the armed reminder + the by-hand button.
      // The auto-fire itself is the defeat sweep reading this rule — config, not this executor.
      try {
        if (this.when !== "defeat-in-zone") return;   // offer-expand stays config-only
        const item = event.item, actor = item?.actor; if (!actor) return;
        const spreadFt = Number(this.spreadFt) > 0 ? Number(this.spreadFt) : 5;
        const igniteFt = Number(this.igniteRadiusFt) > 0 ? Number(this.igniteRadiusFt) : 10;
        ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="edha-trigger-card"><p>🔥 <strong>${item.name}</strong> is armed — it fires automatically (Reaction) when a character drops to 0 HP in your dangerous terrain. You can also trigger it by hand here.</p><button type="button" class="edha-combustion" data-owner="${actor.uuid}" data-label="${item.name}" data-spread="${spreadFt}" data-ignite="${igniteFt}">Spread &amp; ignite (GM positions)</button></div>` });
      } catch (e) { console.error("Edha Content | zone-react executor failed", e); }
    },
  },
  /* 2bX — the Fate marker family: what a talent does AROUND the owner's placed marker squares.
   * All three are read by engine sweeps that ANNOUNCE (edhaWatchersOfRule / the owner's-items
   * sweep) — no dispatcher hand-lists a consumer, no talent is named. */
  {
    source: "edha-content", type: "edha-zone-guard",
    label: "Edha: Marker-Square Guard (config only)",
    description: "Defender-keyed protections for allies standing on YOUR marker squares (Bulwark Ground's shape). Config-only — put it on an 'Edha: Watch Rule' event: the legacy-marker turn-start pass reads thpFormula, and the pre-roll injector reads noAdvantage (attacks against an ally on your square can't benefit from advantage — the inverse of edha-unseen-ward).",
    config: { schema: {
      thpFormula: new FF.StringField({ required: false, blank: true, initial: "@tier", label: "Turn-start Temp HP for allies on your squares", hint: "Evaluated against YOUR roll data. Blank = no Temp HP." }),
      noAdvantage: new FF.BooleanField({ required: false, initial: true, label: "Attacks against an ally on your squares can't benefit from advantage", hint: "Neutralizes advantage to none; never touches disadvantage. The GM can re-toggle in the roll dialog." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
  },
  {
    source: "edha-content", type: "edha-snare-react",
    label: "Edha: Snare-Spring Reaction (config only)",
    description: "What this talent does when one of the OWNER's snares springs (swept by the spring resolver — put it on an 'Edha: Watch Rule' event). offer-mark = a Reaction card offering to mark the triggering foe (markedBy.<markKey>); the SAME rule then feeds the applyDamage pre-pass: the marked foe takes the bonus whenever it takes damage within nearFt of your marker squares (Hexmark). prompt = post the note when the spring lies within nearFt of a LINKED marker square (Weave the Thread's Reactive-Strike grant).",
    config: { schema: {
      mode: new FF.StringField({ required: true, initial: "offer-mark", choices: choices("offer-mark", "prompt"), label: "Reaction shape" }),
      markKey: new FF.StringField({ required: false, blank: true, initial: "hexmark", label: "Mark key (offer-mark)", hint: "The markedBy.<key> flag the click writes; scene cleanup clears every key some offer-mark rule names." }),
      bonusFormula: new FF.StringField({ required: false, blank: true, initial: "@tier", label: "Bonus damage while marked near your squares (offer-mark)", hint: "Evaluated against YOUR roll data on each apply." }),
      bonusType: new FF.StringField({ required: false, initial: "keen", label: "…of type (offer-mark)" }),
      nearFt: new FF.NumberField({ required: false, initial: 10, label: "Within this many feet", hint: "offer-mark: the marked foe must be this near one of your squares (Hexmark: 10). prompt: the spring must be this near a linked square (Weave: 30)." }),
      requireLinked: new FF.BooleanField({ required: false, initial: false, label: "Only near a LINKED square (prompt)", hint: "The `linked` annotation the link-markers zone verb writes." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Prompt text (prompt)", hint: "The granted action, verbatim — GM/players execute it (the declared manual half)." }),
    } },
  },
  /* 2bY — the detonation counterpart of edha-snare-react: what this talent does when the OWNER's
   * Charges detonate. Config-only: the detonate resolver (edhaResolveCharges) sweeps the owner's
   * rules of this type after every detonation — it rides Set Charge, Cascading Failure and The
   * Unmooring alike, and the sweep names no talent. The foe save is ENGINE-ROLLED per foe (iron
   * rule 3 — never trust-the-player). Put it on an 'Edha: Watch Rule' event. */
  {
    source: "edha-content", type: "edha-detonate-react",
    label: "Edha: Detonation Rider (config only)",
    description: "When any of YOUR Charges detonate, each caught character tests a skill vs. your colour; failures gain a status (Concussive Yield's shape). Config-only — the detonate resolver sweeps this rule; put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      skill: new FF.StringField({ required: false, blank: true, initial: "spd", label: "Foe skill (engine-rolled)", hint: "Blank = spd." }),
      skillLabel: new FF.StringField({ required: false, blank: true, initial: "", label: "…shown on the card as", hint: "Blank = the skill id. Concussive Yield: Speed." }),
      color: new FF.StringField({ required: false, initial: "red", choices: choices("white", "blue", "black", "red", "green"), label: "…vs your colour" }),
      failStatus: new FF.StringField({ required: false, blank: true, initial: "prone", label: "Status on a failed save", hint: "Blank = prone." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function () { /* config-only: the detonate resolver's sweep reads this rule */ },
  },
  /* 2bY — the mark-payoff Reaction (deity/Chaos's Shatter Focus): ENGINE-OWNED flow keyed on this
   * rule (the chat-scan + kept-d20 rewrite + cross-client relay are no rule chain's job); every
   * dial is a field. The "no mark on the target" refusal is vetoed BEFORE cost. */
  {
    source: "edha-content", type: "edha-reroll-react",
    label: "Edha: Remove Your Mark, Reroll-Take-Lower (Reaction)",
    description: "Spend the Reaction when an enemy bearing your mark makes a test: the mark is removed and the test rerolls, keeping the lower d20. Refused before cost with no marked target selected. The auto-prompt whispers you when a mark-bearer rolls (mutable per card; a real use re-arms).",
    config: { schema: {
      markStatus: new FF.StringField({ required: false, blank: true, initial: "omen", label: "Your mark's status id", hint: "The markedBy.<status> ownership flag is checked too — only YOUR mark qualifies. Chaos: omen." }),
      autoPrompt: new FF.BooleanField({ required: false, initial: true, label: "Whisper me when a mark-bearer rolls a test", hint: "The reminder card (never auto-fires; you still use the talent). The card's Mute button silences it until your next real use." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function (event) { const item = event.item; if (item?.actor) await edhaRerollReactFlow(item, this); },
  },
  /* 2bX — ENGINE-OWNED card flows over the owner's placed markers, keyed on this rule (the
   * edha-decree exit shape): the spring buttons, the declared-event resolve and the ≤maxFt slide
   * are multi-step card/canvas flows no rule chain expresses. Every dial is a field; the
   * spring-pick bonus is THIS item's own damage formula. oncePerScene is vetoed pre-cost. */
  {
    source: "edha-content", type: "edha-marker-command",
    label: "Edha: Marker Command (move / spring)",
    description: "Post a card commanding YOUR placed marker squares. move = slide one marker up to maxFt (Read the Threads — put the foresight GM-reveal line in the note). spring-pick = a button per unsprung snare; the clicked spring adds this talent's own damage formula as bonus damage (Foreknown Strike). spring-all = a declare card whose resolve button springs every unsprung snare and posts the rally note (Thread of Inevitability; once/scene refuses before any cost is paid).",
    config: { schema: {
      mode: new FF.StringField({ required: true, initial: "move", choices: choices("move", "spring-pick", "spring-all"), label: "Command" }),
      maxFt: new FF.NumberField({ required: false, initial: 10, label: "Slide distance (move)", hint: "Owner-judged at the pick, as the card says." }),
      oncePerScene: new FF.BooleanField({ required: false, initial: false, label: "Once per scene (checked BEFORE cost)", hint: "The generic sceneOnce stamp." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card text", hint: "Printed after the talent name — carry the declared manual halves (free-action grants, the GM reveal) here, verbatim." }),
    } },
    executor: async function (event) {
      const item = event.item; if (!item?.actor) return;
      return edhaMarkerCommand(item, this);
    },
  },
  /* H21 (2bV) — the summon-mode family: what a talent does TO your live summon. toggle-baked is
   * Siege Form's shape (enable a baked, disabled effect the summon spec ships with); grant is
   * Arsenal's (copy THIS talent's Effects-tab template onto the summon + arm the kill-chase);
   * transform is Magnum Opus's ENGINE-OWNED colossus rewrite, keyed on this rule (see the
   * Civilization section header). All three gate pre-cost via the summon-effect veto. */
  {
    source: "edha-content", type: "edha-summon-effect",
    label: "Edha: Summon Mode (toggle / arm / transform)",
    description: "Acts on YOUR live summon. toggle-baked = enable a named baked effect the summon ships with, with an end button (Siege Form). grant = copy this talent's own Effects-tab template effect onto the summon and arm its on-kill prompt (Arsenal). transform = the engine-owned colossus rewrite: bonus HP, defense effect, splashing hits, zone-buff upgrade (Magnum Opus). Refused BEFORE cost with no live summon (and per-mode gates).",
    config: { schema: {
      mode: new FF.StringField({ required: true, initial: "toggle-baked", choices: choices("toggle-baked", "grant", "transform"), label: "What it does" }),
      summonName: new FF.StringField({ required: false, initial: "Combat Construct", label: "Summon name (prefix)", hint: "Which of your summons qualifies — matched against the creature's NAME, because this talent consumes a summon another talent forged." }),
      summonTalent: new FF.StringField({ required: false, blank: true, initial: "", label: "…forged by which talent (optional)", hint: "Blank (the default) = any of your live summons whose name matches above — the rename-proof choice. Set it to pin this rule to ONE forging talent's summons (e.g. 'Forge Construct'); it is then matched against the summonTalent stamp, with the name prefix still covering pre-07-24y summons." }),
      effectName: new FF.StringField({ required: false, blank: true, initial: "", label: "Baked effect to enable (toggle-baked)", hint: "Siege Form. An older summon without it refuses pre-cost (reforge it)." }),
      endButtonLabel: new FF.StringField({ required: false, blank: true, initial: "", label: "End button label (toggle-baked)", hint: "e.g. 'End Siege Form (Free Action)'. Blank = no button." }),
      onKillNote: new FF.StringField({ required: false, blank: true, initial: "", label: "Armed summon reduces a character to 0 HP: whisper this (grant)", hint: "Arsenal's 15 ft move + free Strike chase. Blank = no kill prompt." }),
      hpBonusFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Bonus HP (transform)", hint: "Magnum Opus: 2 * ((@tier)d(2 * @skills.white.rank + 2)) — one roll, doubled." }),
      defBonus: new FF.NumberField({ required: false, initial: 0, label: "All-defenses bonus effect (transform)" }),
      zoneBuffUpgrade: new FF.NumberField({ required: false, initial: 0, label: "Foundation begin-turn buff becomes (transform)", hint: "Magnum Opus: 2 (Ben R7b). 0 = untouched." }),
      splashRadiusFt: new FF.NumberField({ required: false, initial: 0, label: "Its hits splash enemies within (ft, transform)", hint: "Target INCLUDED (Ben R7a). 0 = no splash. The splash rolls THIS talent's damage formula." }),
      splashSaveSkill: new FF.StringField({ required: false, initial: "agi", label: "…splash save skill (engine-rolled)" }),
      splashSaveColor: new FF.StringField({ required: false, initial: "red", label: "…vs your colour" }),
      splashStatus: new FF.StringField({ required: false, blank: true, initial: "prone", label: "…status on a failed save" }),
      oncePerScene: new FF.BooleanField({ required: false, initial: false, label: "Once per scene (transform)", hint: "Vetoed BEFORE cost (the generic sceneOnce stamp)." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note" }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      const c = edhaOwnedSummons(owner, edhaSummonSourceTalent(this), this.summonName || "Combat Construct")[0] ?? null;   // 07-27f: NOT item.name — see the veto
      if (!c) { ui.notifications?.warn(`Edha: ${item.name} needs a live ${this.summonName || "summon"}.`); return; }
      if (this.mode === "grant") return edhaCivGrantSummonEffect(item, this, c);
      if (this.mode === "transform") return edhaCivTransformSummon(item, this, c);
      return edhaCivToggleBakedEffect(item, this, c);
    },
  },
  /* ---- The Green pack family (07-25, pass 2bS — Instinct's on-use / dealer-side shapes) ---- */
  {
    source: "edha-content", type: "edha-adv-attack",
    label: "Edha: Advantage On the Next Attack (On Use)",
    description: "Grants 'advantage on your next attack' (the existing advAttackNext pipeline consumes it on your next attack/item roll). 'pack' also grants it to each ally adjacent to the enemy you have targeted (Pack Hunter); Scent mode instead names the lowest-HP living enemy in Attunement Range and arms you against it (Scent the Weak).",
    config: { schema: {
      to: new FF.StringField({ required: true, initial: "self", choices: choices("self", "pack", "targets"), label: "Who gains it", hint: "self = you. pack = you + every ally adjacent to your targeted enemy. targets = each same-side living creature you have TARGETED, in the colour's range if set, capped by Max (Investiture of Command's allies — 2bU)." }),
      maxTargets: new FF.NumberField({ required: false, initial: 0, label: "Max targets (to = targets)", hint: "0 = no cap. Investiture of Command: 3." }),
      vsLowestHp: new FF.BooleanField({ required: false, initial: false, label: "Scent mode: name the lowest-HP enemy in range first", hint: "The grant only lands when a living enemy stands in the colour's Attunement Range; the card names it either way." }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Attunement Range colour (Scent / targets mode)" }),
      once: new FF.StringField({ required: false, initial: "no", choices: choices("no", "round"), label: "Budget", hint: "round = the grant lands once per round (Scent the Weak); the card still posts." }),
    } },
    executor: async function (event) {
      const item = event.item, actor = item?.actor; if (!actor) return;
      // R-63: no `?? 1` default — every `disp` comparison below Number.isFinite-guards it (🤖 bench row).
      const otok = edhaCasterToken(actor), disp = otok?.document?.disposition;
      if (this.vsLowestHp) {
        const ft = edhaAttuneFtColor(actor, this.rangeColor || "green");
        const enemies = (otok && Number.isFinite(disp)) ? edhaTokensWithin(otok, ft).filter(t => Number.isFinite(t.document?.disposition) && t.document.disposition !== disp && (t.actor?.system?.resources?.hea?.value ?? 1) > 0) : [];
        enemies.sort((a, b) => (a.actor?.system?.resources?.hea?.value ?? 0) - (b.actor?.system?.resources?.hea?.value ?? 0));
        const low = enemies[0];
        if (low && (this.once !== "round" || edhaCoordOPRAllowed(actor, item.name, "_adv"))) {
          if (this.once === "round") await edhaCoordOPRMark(actor, item.name, "_adv");
          void edhaGrantAdvAttack(actor, item.name);
        }
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: low
          ? `<p>🩸 <strong>${item.name}</strong> (${actor.name}): lowest HP in range = <strong>${low.name}</strong> (${low.actor?.system?.resources?.hea?.value} HP). Advantage on your first attack against it this round.</p>`
          : `<p>🩸 <strong>${item.name}</strong> (${actor.name}): no creatures in Attunement Range.</p>` });
        return;
      }
      /* to: "targets" (2bU — Investiture of Command): each same-side living TARGETED creature, range-
       * and cap-filtered exactly as the sibling thp rule filters, so both rules land on the same set. */
      if (this.to === "targets") {
        const max = Number(this.maxTargets) || 0;
        const ft = this.rangeColor ? edhaAttuneFtColor(actor, this.rangeColor) : 0;
        const inRange = ft > 0 && otok ? edhaTokensWithin(otok, ft) : null;
        let picked = edhaUserTargetTokens().filter(t => t.actor && t.actor !== actor
          && Number.isFinite(t.document?.disposition) && Number.isFinite(disp) && t.document.disposition === disp
          && (t.actor.system?.resources?.hea?.value ?? 0) > 0
          && (!inRange || inRange.some(x => x.id === t.id)));
        if (max > 0) picked = picked.slice(0, max);
        for (const t of picked) void edhaGrantAdvAttack(t.actor, item.name);
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: picked.length
          ? `<p>👑 <strong>${item.name}</strong> (${actor.name}): ${picked.map(t => t.actor.name).join(", ")} gain${picked.length === 1 ? "s" : ""} <strong>advantage on their next attack test</strong>.</p>`
          : `<p>👑 <strong>${item.name}</strong> (${actor.name}): no valid targeted ally to grant.</p>` });
        return;
      }
      void edhaGrantAdvAttack(actor, item.name);
      if (this.to === "pack") {
        const enemyTok = edhaUserTargetToken(); let n = 1;
        if (enemyTok && otok) for (const t of (canvas?.tokens?.placeables ?? [])) {
          if (t.id === otok.id || !t.actor || !Number.isFinite(t.document?.disposition) || !Number.isFinite(disp) || t.document.disposition !== disp || !edhaAdjacent(t, enemyTok)) continue;
          void edhaGrantAdvAttack(t.actor, item.name); n++;
        }
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐾 <strong>${item.name}</strong> (${actor.name}): ${n} hunter(s) gain advantage on their next attack${enemyTok ? ` against ${enemyTok.name}` : ""}.</p>` });
      } else {
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐾 <strong>${item.name}</strong> (${actor.name}): advantage on your next attack.</p>` });
      }
    },
  },
  {
    source: "edha-content", type: "edha-strike-window",
    label: "Edha: Open a Strike Window (On Use)",
    description: "Arms a window lasting until the start of your next turn. Your Edha: Bonus Damage rules gated 'window' apply while it is open (Pack Pressure). Put the card text — including any GM-narrated half — in the note, where it is editable.",
    config: { schema: {
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card text", hint: "Posted when the window opens. Blank = a plain 'the window is open until the start of your next turn'." }),
      icon: new FF.StringField({ required: false, blank: true, initial: "🐺", label: "Icon" }),
    } },
    executor: async function (event) {
      const item = event.item, actor = item?.actor; if (!actor) return;
      const cbt = edhaInActiveCombat(actor);   // R-4/#28a: the OWNER's combat
      const coord = cbt?.started ? edhaNextTurnCoord(cbt, edhaCombatantTurnIndex(cbt, actor)) : { round: 0, turn: 0 };
      await actor.setFlag("edha-content", "strikeWindow", coord).catch(() => {});
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${this.icon ? `${this.icon} ` : ""}<strong>${item.name}</strong> (${actor.name}): ${this.note || "the window is open until the start of your next turn."}</p>` });
    },
  },
  {
    source: "edha-content", type: "edha-damage-bonus",
    label: "Edha: Bonus Damage On Your Hits (config only)",
    description: "Adds a bonus damage instance to qualifying hits — read by the applyDamage pre-pass, so put it on an 'Edha: Watch Rule' event. 'window' = while your Edha: Strike Window is open (Pack Pressure); 'pack-on-target' = you + at least one ally attacked this victim this round, with @hunters (Coordinated Hunt); 'armed-self-status' = while you carry the arming status, consumed on the hit if set (Predatory Strike); 'self-hits-counter-bearer' = your own hit on your counter's bearer (Hunter's Discipline); 'ally-hits-counter-bearer' = an ALLY's hit on your bearer within your range while you are armed (Pack Share, The Pack).",
    config: { schema: {
      require: new FF.StringField({ required: true, initial: "window", choices: choices("window", "pack-on-target", "armed-self-status", "self-hits-counter-bearer", "ally-hits-counter-bearer", "list-member-hits", "summon-hits"), label: "Fires when", hint: "A gate is REQUIRED — an ungated always-on bonus belongs on Edha: Passive Damage Rider instead. 'list-member-hits' = a creature on YOUR sustained ledger hits an enemy of yours while you are armed (Concord). 'summon-hits' = YOUR summon's own hit (Tempered Edge). Both 2bV." }),
      listName: new FF.StringField({ required: false, blank: true, initial: "", label: "Your ledger (require = list-member-hits)", hint: "An Edha: Sustained List name — Concord rides `covenants`." }),
      listStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…its marker status", hint: "Blank = the ledger name (Order: `covenant`)." }),
      oncePerRoundPerDealer: new FF.BooleanField({ required: false, initial: false, label: "Once per round PER DEALER", hint: "Each qualifying creature's FIRST hit each round fires; later hits stand down. Tracked per this talent per dealer (Concord — each ally's first attack each round). 2bV." }),
      whenDealerItem: new FF.StringField({ required: false, blank: true, initial: "", label: "Only when the dealing item is named (require = summon-hits)", hint: "Tempered Edge rides `Construct Slam` only — the Siege Cannon (ranged) is excluded. Authored data; blank = any of the summon's hits." }),
      addTargetDeflect: new FF.BooleanField({ required: false, initial: false, label: "Also ignore the target's deflect", hint: "Adds the target's current deflect value as a second impact instance, so the hit lands as if deflect were 0 (the Pinpoint-Charge fact). Tempered Edge. 2bV." }),
      amountFormula: new FF.StringField({ required: true, initial: "(@tier)d(2 * @colorRank + 2)", label: "Bonus formula", hint: "@colorRank (via the colour below, ruling 122), @tier, @hunters (pack-on-target), and @counter = your counter count on the victim (Predatory Strike is ×max(@counter, 1); The Pack's rider is just @counter — 0 skips silently)." }),
      color: new FF.StringField({ required: false, initial: "green", label: "Colour for @colorRank / ally-mode range", hint: "Also the Attunement Range colour the ally-hits mode measures the DEALER against you with." }),
      damageType: new FF.StringField({ required: false, blank: true, initial: "", label: "Damage type", hint: "Blank = match the attack's own damage type (the pre-2bT behaviour). The Knowledge riders are all 'vital'." }),
      counterStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Counter status", hint: "e.g. insight — defines the bearer for the two counter-bearer modes and the @counter substitution." }),
      requireSelfStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "Only while YOU carry this status", hint: "The arming gate. armed-self-status REQUIRES it (predprimed); the ally-hits mode uses it as its scene-arm (packsight / packmind) — pair with an Edha: Apply Status To Yourself rule on use." }),
      consumeSelfStatus: new FF.BooleanField({ required: false, initial: false, label: "Consume the arming status on the hit", hint: "ON for a next-hit arm (Predatory Strike); OFF for a scene arm." }),
      weaponOnly: new FF.BooleanField({ required: false, initial: false, label: "Weapon hits only", hint: "Predatory Strike rides a melee or ranged WEAPON attack, never a talent's own damage." }),
      meleeOnly: new FF.BooleanField({ required: false, initial: false, label: "Melee hits only", hint: "A definitively RANGED hit stands the rule down WITHOUT consuming the arming status (Warlord's Advance stays armed); unknown = owner-judged, fires. edhaAttackKind. 2bU." }),
      healCutFraction: new FF.StringField({ required: false, blank: true, initial: "", label: "The victim's healing is cut after the hit", hint: "Blank = no cut. '0' = cannot regain HP, '0.5' = healing halved — until the end of YOUR next turn (the Necrotic-Grasp AE; Temp HP still lands, Ben R3). Withering Touch's armed hit is '0'. 2bW." }),
      tallyKills: new FF.BooleanField({ required: false, initial: false, label: "@tally counts your scene tally (hostile NPC drops)", hint: "While the arming status holds, each hostile non-summon NPC you reduce below half its max HP counts once, and each you reduce to 0 counts 1 more (one blow can do both — Ben R7: no PC/ally/summon farming). The formula reads it as @tally; cleared when the encounter ends. Warlord's Fury: min(@tally, 2 * @tier). 2bU." }),
      onKillThpFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Armed hit KILLS: you gain this much Temp HP", hint: "Only for a consumed armed-self-status hit. Warlord's Advance: @tier. Blank = no kill rider. 2bU." }),
      onKillNote: new FF.StringField({ required: false, blank: true, initial: "", label: "…and the card adds", hint: "Whispered — the player-executed half (Warlord's Advance's 10 ft free move). {name} = the creature that fell." }),
      onSurviveAdvAttr: new FF.StringField({ required: false, blank: true, initial: "", label: "Armed hit target SURVIVES: advantage on your next test of this attribute", hint: "An attribute id (pre, str, …) — target-bound via the nextTestMod pipeline (fires only with the survivor targeted). Warlord's Advance: pre. Blank = no survivor rider. 2bU." }),
      onSurviveNote: new FF.StringField({ required: false, blank: true, initial: "", label: "…and the card adds", hint: "Whispered. {name} = the creature that survived." }),
      placeCounter: new FF.NumberField({ required: false, initial: 0, label: "Place this many counter points after the hit", hint: "0 = none. Written AFTER the damage lands (post-pass); placing on a non-bearer transfers your counter to it (Predatory Strike places 1 Insight on whatever it hit)." }),
      placeOnce: new FF.StringField({ required: false, initial: "no", choices: choices("no", "round"), label: "Placement budget", hint: "round = the first qualifying hit each round places, later ones only add damage (the pack riders — Ben R11: tracked per talent, independently)." }),
      capFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Counter cap (formula)", hint: "Clamps the placement. Blank = 5 (Insight's cap)." }),
      rangedOnly: new FF.BooleanField({ required: false, initial: false, label: "Ranged hits only", hint: "The mirror of meleeOnly: a definitively MELEE hit stands the rule down WITHOUT consuming the arming status (Tagging Shot's ranged attack); unknown = owner-judged, fires. edhaAttackKind. 2bX." }),
      placeList: new FF.StringField({ required: false, blank: true, initial: "", label: "After the hit, the victim joins your sustained ledger", hint: "An Edha: Sustained List name — Tagging Shot's armed ranged hit makes the victim your `quarry`. Written AFTER the damage lands (post-pass); cap below, the oldest fizzles; the entry follows the creature (no scene scoping). Fires even at +0 bonus on an armed hit. Blank = none. 2bX." }),
      placeListStatus: new FF.StringField({ required: false, blank: true, initial: "", label: "…its marker status", hint: "Blank = the ledger name (`quarry`)." }),
      placeListCapFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "…its cap (formula)", hint: "Blank = 1 (Quarry is a single mark)." }),
    } },
  },
  /* `edha-counter-transfer` (07-25, 2bT) — the on-kill half of a counter talent: when the creature
   * bearing your counter drops to 0 HP, offer the transfer prompt (and optionally the ally burst).
   * Config-only: the live→0 sweep in the Knowledge section reads these rules; the prompt cards and
   * their click handlers are the ENGINE-OWNED support surface (the H6 trade). */
  {
    source: "edha-content", type: "edha-counter-transfer",
    label: "Edha: Counter Transfer On Kill (config only)",
    description: "When the creature bearing your counter drops to 0 HP: a whispered Free-Action prompt to place (fraction × its count) on a new creature in range — and, if enabled, a public card letting each ally in range deal the burst formula to an enemy of their choice. Put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      counter: new FF.StringField({ required: false, initial: "insight", label: "Counter status", hint: "The counter this rule watches — the bearer is read from YOUR pointer, so a rival's mark on the same creature never triggers you." }),
      fraction: new FF.NumberField({ required: false, initial: 1, label: "Fraction transferred", hint: "1 = the full slain count (Death Mark) · 0.5 = half, rounded down (Hunter's Discipline). 0 with allyBurst on = burst only." }),
      rangeColor: new FF.StringField({ required: false, initial: "green", label: "Attunement Range colour", hint: "Both the transfer candidates and the burst allies are measured in this range." }),
      capFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Counter cap (formula)", hint: "Clamps the re-placement. Blank = 5." }),
      allyBurst: new FF.BooleanField({ required: false, initial: false, label: "Allies burst on the kill", hint: "Each ally in range may click to deal the burst formula (YOUR dice — Ben R4) to any enemy of their choice. Death Mark." }),
      burstFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Burst formula", hint: "Rolled against YOUR roll data per click. Blank = (@tier)d(2 * @skills.red.rank + 2)." }),
    } },
  },
  /* H9 `edha-die-step` (07-25, 2bT — §9m q1, ruled BUILD IT): write a damage-die-step ledger entry.
   * The ledger, the rollDamage rewrite, the timed sweep and the GM roll watch are the Sovereignty
   * section's engine machinery; this handler is how a TALENT writes an entry — including the
   * couplings the watch reads back as DATA (failThp*, onPairHit), so no talent name ever reaches
   * the watch. */
  {
    source: "edha-content", type: "edha-die-step",
    label: "Edha: Step a Damage Die (On Use / On Success)", description: "Move a creature's damage die size along the d4–d12 ladder (entries stack; the clamp is the only rail). Put it on 'use' for an untested buff (Exalt), or on the 'When Your Test SUCCEEDS' / 'FAILS' events after an Edha: Gated Test (Censure, Decree of Ruin). 'pair' writes a linked ally/enemy pair whose on-hit coupling the engine watches (Sovereign's Balance, Sovereignty).",
    config: { schema: {
      key: new FF.StringField({ required: true, initial: "step", label: "Entry key", hint: "Names this effect in the ledger — censure, decree, edict, exalt, investiture, balance, sovereign. Authored data: it is what an Edha: Die-Step Reaction's whenKeys and a replaceKeys field match against." }),
      steps: new FF.NumberField({ required: false, initial: -1, label: "Steps (±)", hint: "−1 = Diminished one step, +1 = Exalted one step, −2 = Edict's success. Ignored in pair mode." }),
      scope: new FF.StringField({ required: false, initial: "all", choices: choices("all", "attack"), label: "Applies to", hint: "all = every damage roll · attack = weapon/attack damage only (Edict of the Fallen)." }),
      expire: new FF.StringField({ required: false, initial: "next-turn", choices: choices("next-turn", "scene"), label: "Lasts", hint: "next-turn = until the start of YOUR next turn (the timed sweep) · scene = until the encounter ends." }),
      target: new FF.StringField({ required: false, initial: "victim", choices: choices("victim", "ally", "enemy", "pair"), label: "Who is stepped", hint: "victim = the creature this rule's trigger resolved against (a gated test's payload) · ally / enemy = your targeted willing ally / enemy (vetoed pre-cost when missing) · pair = one targeted ally AND one targeted enemy, written as a linked pair." }),
      allySteps: new FF.NumberField({ required: false, initial: 1, label: "Ally steps (pair mode)" }),
      enemySteps: new FF.NumberField({ required: false, initial: -1, label: "Enemy steps (pair mode)" }),
      onPairHit: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "extend-once", "no-reactions"), label: "When the ally hits the paired enemy", hint: "Stamped INTO both entries — the GM roll watch reads it back as data. extend-once = both effects extend one round, once, cast round only (Sovereign's Balance) · no-reactions = the enemy loses reactions until its next turn, card per detected hit (Sovereignty)." }),
      replaceKeys: new FF.StringField({ required: false, blank: true, initial: "", label: "Replace YOUR entries with these keys first", hint: "Comma-list. Investiture of Authority replaces your own Exalt on the target before writing its scene entry." }),
      failThpFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Failed-attack rider: allies gain Temp HP", hint: "Stamped into the entry; while it lives, each attack test the stepped creature FAILS grants your allies in the range below this much Temp HP (Edict of the Fallen: @tier). Blank = no rider." }),
      failThpRange: new FF.StringField({ required: false, blank: true, initial: "", label: "…allies within this Attunement Range", hint: "Blank = white." }),
      oncePerTarget: new FF.BooleanField({ required: false, initial: false, label: "Once per creature per scene", hint: "Stamped on the creature on use (success or failure), vetoed pre-cost on a repeat. Decree of Ruin, Investiture of Authority." }),
      oncePerScene: new FF.BooleanField({ required: false, initial: false, label: "Once per scene", hint: "The capstone. Vetoed pre-cost on a repeat; cleared when the encounter ends." }),
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Card note", hint: "Appended to the result card — Edict's THP explanation, Balance's extend line." }),
    } },
    executor: async function (event) {
      try {
        const item = event.item, owner = item?.actor; if (!owner) return;
        if (this.oncePerScene) await edhaStampSceneOnce(owner, item);
        const key = this.key || "step";
        const expire = () => this.expire === "scene" ? "scene" : edhaSovTimedExpire(owner);
        const durText = this.expire === "scene" ? "for the <strong>scene</strong>" : "until the start of your next turn";
        const say = (html) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<div class="edha-burst-card"><p>👑 <strong>${item.name}</strong>: ${html}${this.note ? ` <span style="opacity:.85">${this.note}</span>` : ""}</p></div>` });
        const stampOnce = async (t) => {
          if (!this.oncePerTarget || !t) return;
          const flagKey = `dieStepOnceBy.${key}.${owner.id}`;
          // Job 6a: routed through edhaSetEdhaFlag — behavior flip, was a SILENT drop with no GM
          // online (no warning at all), now warns + returns false. 🤖 bench row.
          await edhaSetEdhaFlag(t, flagKey, true);
        };
        const announce = (t, steps) => edhaDispatchWatchers({ kind: "die-step", owner, victim: t, skill: key, def: null, ok: true, total: Number(steps) || 0 });
        const stepWord = (n) => `damage die ${n > 0 ? "+" : "−"}${Math.abs(n)} step${Math.abs(n) === 1 ? "" : "s"}`;

        if ((this.target || "victim") === "pair") {
          const { allies, enemies } = edhaSovTargets(owner);
          const ally = allies[0]?.actor, enemy = enemies[0]?.actor;
          if (!ally || !enemy) { ui.notifications?.warn(`Edha: target one willing ally AND one enemy for ${item.name}.`); return; }
          const pairId = foundry.utils.randomID();
          const up = Number(this.allySteps) || 1, down = Number(this.enemySteps) || -1;
          const coupling = this.onPairHit ? { onPairHit: this.onPairHit } : {};
          await edhaSovAddStep(owner, ally, { key, steps: up, scope: this.scope || "all", pairId, ...coupling, source: item.name, expire: expire() });
          await edhaSovAddStep(owner, enemy, { key, steps: down, scope: this.scope || "all", pairId, ...coupling, source: item.name, expire: expire() });
          await announce(ally, up); await announce(enemy, down);
          say(`${ally.name} ${stepWord(up)} / ${enemy.name} ${stepWord(down)} ${durText}.`);
          return;
        }
        const mode = this.target || "victim";
        const who = mode === "ally" ? edhaSovAlly(owner)
          : mode === "enemy" ? edhaSovEnemy(owner)
          : edhaResolveVictim(event);
        if (!who) { ui.notifications?.warn(`Edha: ${item.name} — target the creature, then use it again.`); return; }
        const steps = Number(this.steps) || -1;
        const entry = { key, steps, scope: this.scope || "all", source: item.name, expire: expire(),
          ...(this.failThpFormula ? { failThpFormula: this.failThpFormula, failThpRange: this.failThpRange || "white" } : {}) };
        if (this.replaceKeys) {
          // "replacing any existing X on that target" — drop YOUR matching entries, then add (Investiture).
          const drop = new Set(String(this.replaceKeys).split(",").map(s => s.trim()).filter(Boolean));
          const list = edhaSovSteps(who).filter(e => !(drop.has(e.key) && e.ownerId === owner.id));
          list.push({ ...entry, ownerId: owner.id, castRound: edhaCombatRoundOf(owner) });   // R-4/#28a (mirrors edhaSovAddStep)
          const ok = await edhaSovSetSteps(who, list);
          if (ok) await edhaSovSyncStatuses(who, list);
        } else {
          await edhaSovAddStep(owner, who, entry);
        }
        await stampOnce(who);
        await announce(who, steps);
        say(`${who.name} is <strong>${steps > 0 ? "Exalted" : "Diminished"}</strong> — ${stepWord(steps)} ${durText}.`);
      } catch (e) { console.error("Edha Content | edha-die-step executor failed", e); }
    },
  },
  /* The reaction half of the die-step family (2bT) — config-only: the GM roll watch in the
   * Sovereignty section sweeps these rules (Expose). */
  {
    source: "edha-content", type: "edha-die-step-react",
    label: "Edha: Die-Step Reaction (config only)",
    description: "Reacts when a creature carrying YOUR matching die-step debuff fails a test: you recover Investiture (auto on readable failed attacks; owner-click card otherwise), and a targeted ally in range may be offered a Reactive Strike. Put it on an 'Edha: Watch Rule' event (Expose).",
    config: { schema: {
      whenKeys: new FF.StringField({ required: false, initial: "censure,decree", label: "Rides entries with these keys", hint: "Comma-list of entry keys — Ben R3: Expose rides Censure AND Decree of Ruin, not Edict." }),
      recoverInv: new FF.NumberField({ required: false, initial: 1, label: "Investiture recovered per failure", hint: "Clamped to your maximum (Ben R4: no other cap)." }),
      reactiveStrike: new FF.BooleanField({ required: false, initial: true, label: "Offer the Reactive Strike", hint: "When the failed test was an attack on your ally in the range below, the card names the Strike (player-executed — no hook can force another creature's action)." }),
      allyRange: new FF.StringField({ required: false, initial: "white", label: "Ally Attunement Range colour" }),
    } },
  },
  {
    source: "edha-content", type: "edha-unseen-ward",
    label: "Edha: Ward Allies vs Unseen Attacks (config only)",
    description: "An ally near you targeted by an attack they can't see (hidden attacker, or wall LOS; darkness GM-judged) gets +N defense against it — injected as −N on the attack roll (Packmate's Warning). Config-only: the pre-roll injector reads this rule — put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      rangeFt: new FF.NumberField({ required: false, initial: 10, label: "Ally within (ft)" }),
      amount: new FF.NumberField({ required: false, initial: 2, label: "Defense bonus" }),
      excludeSelf: new FF.BooleanField({ required: false, initial: true, label: "'An ally' — never the owner itself" }),
    } },
  },
  {
    source: "edha-content", type: "edha-suppress-veil",
    label: "Edha: Suppress Enemy Veils (config only)",
    description: "While you are ARMED (the self-status below — write it with an Edha: Apply Status To Yourself rule on this talent's use), hostile dark-veil markers within Attunement Range stay DOWN: the veil sweep refuses to raise them and stands down ones it raised (Natural Order). A GM's manual marker toggle is never fought. Config-only — put it on an 'Edha: Watch Rule' event.",
    config: { schema: {
      rangeColor: new FF.StringField({ required: false, initial: "green", label: "Attunement Range colour" }),
      requireSelfStatus: new FF.StringField({ required: false, initial: "clearsight", label: "Armed while you carry this status" }),
    } },
  },
  /* ---- The Green Restoration family (07-25, pass 2bS — the on-heal riders + the injury menu) ---- */
  {
    source: "edha-content", type: "edha-heal-react",
    label: "Edha: When You Restore Health (config only)",
    description: "Reacts when YOU restore health to a creature — read at the heal chokepoints, so put it on an 'Edha: Watch Rule' event. queue-regrowth = the healed ally regains the formula at the start of your next turn while still in range (auto — Resurgent Growth). offer-thp = whispered card to grant Temp HP when the target was below half; cost and roll land on the CLICK (Vital Surge). offer-cleanse = whispered card, one button per present condition (Natural Recovery).",
    config: { schema: {
      action: new FF.StringField({ required: true, initial: "offer-thp", choices: choices("queue-regrowth", "offer-thp", "offer-cleanse"), label: "Reaction" }),
      whenColor: new FF.StringField({ required: false, blank: true, initial: "green", label: "Only heals from a talent of this colour", hint: "Blank = any heal you cause. The retired Restoration trio fired only on Green-talent heals." }),
      allyOnly: new FF.BooleanField({ required: false, initial: true, label: "Allies only, never yourself (queue-regrowth)" }),
      requireBelowHalf: new FF.BooleanField({ required: false, initial: true, label: "Target was below half HP (offer-thp)" }),
      amountFormula: new FF.StringField({ required: false, blank: true, initial: "", label: "Amount formula", hint: "queue-regrowth: the turn-start regrowth. offer-thp: the Temp HP, rolled on the CLICK. @colorRank (via the colour below, ruling 122) and @tier resolve first; the rest is your roll data." }),
      amountLabel: new FF.StringField({ required: false, blank: true, initial: "", label: "Amount label on the card", hint: "The human name of the formula, e.g. ½[Tier][Die]." }),
      color: new FF.StringField({ required: false, initial: "green", label: "Colour for @colorRank" }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", label: "Range re-check colour (queue-regrowth)", hint: "A queued target outside this Attunement Range at resolve time is skipped. Blank = no range check." }),
      costInv: new FF.NumberField({ required: false, initial: 1, label: "Investiture cost on the click (offer-thp)", hint: "A declined offer costs nothing." }),
      conditions: new FF.StringField({ required: false, blank: true, initial: "afflicted, disoriented, stunned, weakened", label: "Cleansable conditions (offer-cleanse)", hint: "Comma-list of status ids; only conditions the target actually has get a button." }),
      costNote: new FF.StringField({ required: false, blank: true, initial: "spend an Opportunity", label: "Cost wording (offer-cleanse)", hint: "Honour-system, exactly as retired — printed on the card and the result." }),
    } },
  },
  {
    source: "edha-content", type: "edha-remove-injury",
    label: "Edha: Remove an Injury (On Use)",
    description: "Posts the injury menu for your targeted creature (default: yourself) — one button per removable injury; the click spends the temporary/permanent Investiture cost and deletes the injury Item (Reknit Form). Death injuries never appear.",
    config: { schema: {
      costTemporary: new FF.NumberField({ required: false, initial: 2, label: "Cost: temporary injury (Investiture)" }),
      costPermanent: new FF.NumberField({ required: false, initial: 3, label: "Cost: permanent injury (Investiture)" }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      edhaPostReknitCard(owner, item, this);
    },
  },
  {
    source: "edha-content", type: "edha-next-test-mod",
    label: "Edha: Modify a Next Test (On Use)", description: "On use, a next test gains (dis)advantage, a dice/flat modifier (Probability Net's −1d6), a Plot Die, and/or a banked Opportunity. Target YOURSELF or the creature you have targeted. Rides the nextTestMod / plotDieNext / oppCredit pipelines; counted, consumed on the next test.",
    config: { schema: {
      target: new FF.StringField({ required: false, initial: "target", choices: choices("target", "self", "victim"), label: "Who it affects", hint: "target = the creature you currently have targeted (Probability Net, Emotional Overload). self = you (Overwhelm with Details, the Opportunity adders, Risky Behavior). victim = the creature this rule's trigger resolved against or happened to — use it on a watch payload, where re-reading your targets would be wrong (Coercive Pressure). 07-24k / 07-24r." }),
      mode: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "advantage", "disadvantage"), label: "Advantage mode" }),
      formula: new FF.StringField({ required: false, blank: true, initial: "", label: "Modifier formula (e.g. -1d6)", hint: "Resolved against YOUR roll data at use, so @skills.<x>.mod works (Overwhelm with Details banks your Lore modifier)." }),
      count: new FF.NumberField({ required: false, initial: 1, label: "Tests affected" }),
      skill: new FF.StringField({ required: false, blank: true, initial: "", label: "Only these skills", hint: "Comma-list of skill ids (dec, dis, ath …; leyline colours are skill ids too) — 'itm, lea, per' is Confident Command's list. Blank = the next test of any kind. Widened from a single id 07-24w." }),
      rangeFt: new FF.NumberField({ required: false, initial: 0, label: "Maximum range (ft, 0 = no limit)", hint: "Vetoed BEFORE cost: a targeted creature further than this refuses the use with nothing spent. Decisive Command's card says 'an ally within 20 ft'. 07-24x." }),
      maxTargets: new FF.NumberField({ required: false, initial: 1, label: "How many creatures it can affect", hint: "1 = the usual. Targets beyond this many are ignored (the first N you targeted are used). Doubled by the talent below. 07-24x." }),
      doubleIfOwns: new FF.StringField({ required: false, blank: true, initial: "", label: "Owning this talent DOUBLES the range and the target count", hint: "A talent name — Authority doubles both halves of every ally-affecting Leader talent, which is exactly what its card says. Blank = no doubling. Authored data, so it is editable; the rule-2b smell is names in engine code. 07-24x." }),
      requireQuarry: new FF.BooleanField({ required: false, initial: false, label: "Only against YOUR quarry", hint: "Stamps your current quarry on the mod; the bonus then only applies to a roll made against that creature. Vetoed BEFORE cost when you have no quarry. Pack Hunting. 07-24x." }),
      appliesTo: new FF.StringField({ required: false, initial: "test", choices: choices("test", "damage", "either"), label: "Which roll it rides", hint: "test = d20 tests only (the default, and every pre-07-24x consumer). damage = damage rolls only. either = whichever comes first — Pack Hunting's card says 'attack or damage roll'. 07-24x." }),
      ownedFrom: new FF.StringField({ required: false, blank: true, initial: "", label: "Substitute @owned with how many of these talents you have", hint: "Comma-list of talent NAMES. The count replaces @owned in the formula before it resolves, which is how a die can scale with how many upgrades you own — the command die is 1d(4 + 2 * @owned) over the three Command talents. Talent names are fine HERE: this is authored data you can edit, not engine code. 07-24w." }),
      attr: new FF.StringField({ required: false, blank: true, initial: "", label: "Only tests on these attributes", hint: "Comma-list of attribute ids — 'int, wil' is a Cognitive test, 'str, spd' a Physical one. Blank = any. Coercive Pressure's disadvantage is Cognitive-only. 07-24r." }),
      expireEndOfRound: new FF.BooleanField({ required: false, initial: false, label: "Only for the rest of this round", hint: "Stamps the current combat round; the mod stops applying once the round moves on, instead of waiting forever for a matching test. For talents whose text says 'this round'. 07-24r." }),
      bindToTarget: new FF.BooleanField({ required: false, initial: false, label: "Only against the creature you have targeted", hint: "Binds the mod to your CURRENT target, so it is spent on a test against that creature and no other — the 'advantage on your next test AGAINST THEM' shape (Reactive Analysis). With nothing targeted it stays unbound rather than failing. 07-24r." }),
      plotDie: new FF.BooleanField({ required: false, initial: false, label: "Also raise the stakes (Plot Die)", hint: "Writes plotDieNext, which the existing pre-roll injector consumes. Risky Behavior, Reckless Momentum. 07-24k." }),
      opportunity: new FF.BooleanField({ required: false, initial: false, label: "Also bank an Opportunity", hint: "Writes oppCredit, cashed by the Opportunity menu on your next test. The four Opportunity adders. 07-24k." }),
    } },
    executor: async function (event) {
      const item = event.item, owner = item?.actor; if (!owner) return;
      const toSelf = this.target === "self";
      /* MULTI-TARGET + RANGE (07-24x, Ben's q13 ruling to build Authority for real). `doubleIfOwns`
       * doubles BOTH halves at once because that is literally what Authority's card says: "Double the
       * range of Leader talents that affect allies, AND double the number of allies affected."
       * Only the `target` mode fans out — `self` is one creature by definition and `victim` is
       * whatever the trigger already resolved against. */
      const dbl = this.doubleIfOwns && edhaOwnsTalent(owner, String(this.doubleIfOwns).trim()) ? 2 : 1;
      const maxT = Math.max(1, (Number(this.maxTargets) || 1) * dbl);
      const rangeFt = Math.max(0, (Number(this.rangeFt) || 0) * dbl);
      let picked;
      if (toSelf) picked = [owner];
      else if (this.target === "victim") picked = [edhaResolveVictim(event)].filter(Boolean);
      else {
        const otok = edhaCasterToken(owner);
        picked = edhaUserTargetTokens()
          .filter(t => t.actor && (!rangeFt || (otok && edhaTokensWithin(otok, rangeFt).some(x => x.id === t.id))))
          .slice(0, maxT)
          .map(t => t.actor);
      }
      const target = picked[0] ?? null;
      if (!target) { ui.notifications?.warn(`Edha: ${item.name} — target the creature${rangeFt ? ` (within ${rangeFt} ft)` : ""}, then use again.`); return; }
      // The granter's quarry is resolved ONCE, here, not at roll time — "your quarry" means whoever it
      // was when you spent the focus, so re-marking later must not silently retarget a live bonus.
      const quarryUuid = this.requireQuarry ? (edhaQuarryOf(owner) || null) : null;
      if (this.requireQuarry && !quarryUuid) { ui.notifications?.warn(`Edha: ${item.name} — you have no quarry.`); return; }
      const bits = [];
      if (this.mode || this.formula) {
        const mod = { source: item.name, count: Math.max(1, Number(this.count) || 1) };
        if (this.skill) mod.skill = this.skill;
        if (this.attr) mod.attr = this.attr;
        /* R-85 (bench run 40, applied as the recommended default — vetoable). The stamp is the
         * GRANTER's combat, because `edhaNextTestMatches` reads the BEARER's and at the table they
         * are the same combat. But a granter who is NOT a combatant has no round, and a `null` stamp
         * can NEVER expire (`edhaNextModExpired` requires `mod.round != null`) — so a "this round"
         * rider granted from outside the tracker sat on the victim for ever. Reproduced both ways at
         * bench run 40 with Pattern Recognition. Fall back to the BEARER's combat, so a "this round"
         * rider always means the round the victim is living in; with both out of combat it is still
         * null, which is the honest answer (there is no round to expire against). */
        if (this.expireEndOfRound) mod.round = edhaCombatRoundOf(owner) ?? edhaCombatRoundOf(target);
        if (this.bindToTarget) {
          const bind = edhaUserTargetActor();
          if (bind && bind !== target) mod.targetUuid = bind.uuid;   // nothing targeted → unbound, not broken
        }
        if (this.mode) mod.mode = this.mode;
        // Resolve against the OWNER's roll data at use time — a self-mod like "+@skills.lor.mod"
        // must bank a number, not an unresolved @-ref the target's pipeline can't evaluate.
        //
        // @owned is substituted FIRST (07-24w). It is the count of `ownedFrom` talents the owner has,
        // and it exists because a die whose size depends on HOW MANY sibling talents you own cannot be
        // written as a literal on any one document — nothing in roll data exposes an owned-talent
        // count. The command die is 1d(4 + 2 * @owned) over the three Command upgrades.
        if (this.formula) {
          let f = String(this.formula);
          if (this.ownedFrom) {
            const names = String(this.ownedFrom).split(",").map(s => s.trim()).filter(Boolean);
            f = f.replace(/@owned\b/g, String(names.filter(n => edhaOwnsTalent(owner, n)).length));
          }
          mod.formula = edhaFoldDieMath(String(Roll.replaceFormulaData(f, owner.getRollData(), { missing: "0" })).trim() || f);
        }
        if (quarryUuid) mod.quarryUuid = quarryUuid;
        if (this.appliesTo && this.appliesTo !== "test") mod.appliesTo = this.appliesTo;
        for (const p of picked) await edhaSetNextTestMod(p, mod);
        if (this.mode) bits.push(`at <strong>${this.mode}</strong>`);
        if (this.formula) bits.push(`taking <strong>${mod.formula}</strong>`);
      }
      for (const p of picked) {
        if (this.plotDie) await edhaGrantPlotDie(p, { skill: null, source: item.name });
        if (this.opportunity) await edhaSetEdhaFlag(p, "oppCredit", { source: item.name });
      }
      if (this.plotDie) bits.push("raising the stakes (<strong>Plot Die</strong>)");
      if (this.opportunity) bits.push("with an <strong>Opportunity</strong> banked");
      if (!bits.length) return;
      const who = toSelf ? "your" : `${picked.map(p => p.name).join(", ")}'s`;
      const rollWord = (this.appliesTo === "damage") ? "next damage roll" : (this.appliesTo === "either") ? "next test or damage roll" : "next test";
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>🎲 <strong>${item.name}</strong>: ${who} ${rollWord} — ${bits.join(", ")}`
          + `${quarryUuid ? " (against your quarry only)" : ""}.</p>` });
    },
  },
  {
    source: "edha-content", type: "edha-single-target",
    label: "Edha: Single Target Only", description: "This talent affects ONE creature. With several tokens targeted the use is cancelled BEFORE any cost and you get a whispered picker card listing them; clicking one retargets and re-uses the talent. Config-only: the pre-use gate reads this rule.",
    config: { schema: {
      note: new FF.StringField({ required: false, blank: true, initial: "", label: "Note (shown on the picker card)" }),
    } },
    executor: async function () { /* config-only: the preUseItem single-target gate reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-thorns",
    label: "Edha: Melee Splash-Back (Thorns)", description: "When a melee attacker damages the owner, the attacker takes the splash automatically (Cinder Coat). Config-only: the applyDamage wrapper reads this rule.",
    config: { schema: {
      formula: new FF.StringField({ required: true, initial: "1d4", label: "Splash formula" }),
      damageType: new FF.StringField({ required: false, initial: "energy", choices: choices("energy", "impact", "keen", "spirit", "vital"), label: "Damage type" }),
      meleeOnly: new FF.BooleanField({ required: false, initial: true, label: "Melee/adjacent attackers only" }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-hp-threshold",
    label: "Edha: When An Ally Drops To Half HP", description: "Posts a reaction prompt (chat-card button) when an ally character drops to half HP or below: optionally pay the cost to heal them. Applied automatically.",
    config: { schema: {
      healFormula: new FF.StringField({ required: true, initial: "", label: "Heal formula", hint: "[Tier][Die] = (@tier)d(2 * @skills.<color>.rank + 2)" }),
      costResource: new FF.StringField({ required: false, blank: true, initial: "inv", choices: choices("", "inv", "foc", "opportunity"), label: "Cost resource" }),
      costValue: new FF.NumberField({ required: false, initial: 1, label: "Cost amount" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
      includeSelf: new FF.BooleanField({ required: false, initial: false, label: "Also prompt when YOU drop to half" }),
      rangeColor: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Ally must be within this colour's Attunement Range", hint: "The card's 'an ally in Attunement Range' gate — your rank in the colour sets the radius. Blank = anywhere on the scene (the ally + on-scene gates still apply). 2026-07-26l." }),
      note: new FF.StringField({ required: false, initial: "", label: "Note (shown on the prompt)", hint: "ONE tight line — the card already names who dropped and to what HP when this is blank. Do not paste the talent description here (bench run 3 defect 4c)." }),
    } },
    executor: async function () { /* config-only: the applyDamage wrapper reads this rule */ },
  },
  {
    source: "edha-content", type: "edha-multi-hit",
    label: "Edha: When You Hit Two Or More Creatures", description: "When a matching talent of yours captures 2+ creatures (burst/AoE), posts the talent's choice prompt (Flashpoint). Applied automatically.",
    config: { schema: {
      color: new FF.StringField({ required: false, blank: true, initial: "", choices: choices("", "white", "blue", "black", "red", "green"), label: "Only talents of this color" }),
      resourceGainResource: new FF.StringField({ required: false, blank: true, initial: "inv", choices: choices("", "inv", "foc"), label: "Resource regained (button option)" }),
      resourceGainValue: new FF.NumberField({ required: false, initial: 1, label: "Resource amount" }),
      oncePerRound: new FF.BooleanField({ required: false, initial: true, label: "Once per round" }),
      note: new FF.StringField({ required: false, initial: "", label: "Choice text (shown on the prompt)" }),
    } },
    executor: async function () { /* config-only: the burst/AoE engine reads this rule */ },
  },
  ];

  return { EDHA_EVENT_TYPES, EDHA_HANDLER_TYPES };
})();

/* ═══ THE RELAY IS NOT A WRITE (2026-09-05, fix pass 4 — bench run 31 defect ③) ═══════════════
 *
 * `game.socket.emit` is FIRE-AND-FORGET. Foundry's socket carries no acknowledgement for
 * `module.*` traffic, so a relayed write returns before the GM has received the packet, let alone
 * applied it, let alone broadcast the result back to this client. Every relay in this file
 * therefore `return true` a full round trip EARLY, and any caller that reads the write back in the
 * same activation reads the PRE-write world.
 *
 * That is the whole of bench run 31's `Unravel Everything` defect. Its two `use` rules are ordered
 * (fill 0, sweep 1) and both the system's dispatcher and `edhaOwnerListQueue` sequence correctly —
 * BOTH of the bench's suspects are clean. What is not clean is one level DOWN: the fill relays two
 * `omen` marks, `edhaWriteStatusMark` says "done", the ledger commits, and then `edhaOwnerList`'s
 * mark-wins reconcile drops both entries because neither creature carries the status ON THIS
 * CLIENT yet — "no creatures on the ledger". It is invisible to a GM caster (`isOwner` is true for
 * a GM, so the direct branch runs and awaits a real write) and only reachable from a client that
 * owns the caster but not the target, which is why the player-client window found it.
 *
 * `edhaAwaitLocal` closes the gap without a protocol: poll the LOCAL documents until the relayed
 * write is observable, then return. Fails OPEN on timeout — the pre-fix behaviour — but says so,
 * because a relay that never lands must not be silent (case study §9). Reach for this at any relay
 * whose result is read back in the same activation; a relay nobody reads back does not need it.
 * Generalises `edhaAwaitExpertisePicks`' poll-until idiom into something with a predicate. */
async function edhaAwaitLocal(test, { timeoutMs = 3000, stepMs = 25, label = "" } = {}) {
  const seen = () => { try { return !!test(); } catch (e) { return false; } };
  if (seen()) return true;
  const t0 = Date.now();
  while (Date.now() - t0 < Math.max(0, Number(timeoutMs) || 0)) {
    await new Promise(r => setTimeout(r, Math.max(1, Number(stepMs) || 25)));
    if (seen()) return true;
  }
  console.warn(`Edha Content | relayed write never came back to this client${label ? ` (${label})` : ""} — continuing without it`);
  return false;
}

/* ENGINE PASS 5.2 (Job 6b): the shared body behind every "toggle a status ON + record
 * markedBy.<status>" site — isOwner writes directly; else an online GM relays via the
 * apply-status-mark socket action; else warn + false. Four near-duplicate copies of this existed
 * (edhaApplyStatusMark's own non-timed branch below, plus three marker-tree placement sites) — this
 * is that shared body. NOTE: named `edhaWriteStatusMark`, not `edhaApplyStatusMark` — that name is
 * already the higher-level per-ITEM handler below (item/cfg/boundVictim, resolves its own victim,
 * posts the card); this one is the lower-level primitive it (and everything else) now calls with an
 * already-resolved target actor. `combatExpire` is opt-in and forwarded through the relay exactly
 * like the canonical H1 branch already did. */
async function edhaWriteStatusMark(targetActor, statusId, mark, { combatExpire = false } = {}) {
  if (!targetActor || !statusId) return false;
  if (targetActor.isOwner) {
    await targetActor.toggleStatusEffect?.(statusId, { active: true });
    if (mark) { try { await targetActor.setFlag("edha-content", `markedBy.${statusId}`, mark); } catch (e) {} }
    if (combatExpire) { try { await targetActor.setFlag("edha-content", `combatExpire.${statusId}`, true); } catch (e) {} }
    return true;
  }
  if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to mark ${targetActor.name}.`); return false; }
  try {
    game.socket.emit("module.edha-content", { action: "apply-status-mark", payload: { actorUuid: targetActor.uuid, statusId, ...(mark ? { mark } : {}), ...(combatExpire ? { combatExpire: true } : {}) } });
  } catch (e) { return false; }
  /* Wait for the relay to become visible HERE before telling the caller the mark landed — see the
   * edhaAwaitLocal block above. The H3 reconcile reads `statuses`, the damage post-pass reads
   * `markedBy`, so both have to be back or a later-ordered rule still reads the pre-write world. */
  if (!(await edhaAwaitLocal(
    () => !!targetActor.statuses?.has?.(statusId) && (!mark || !!targetActor.getFlag?.("edha-content", `markedBy.${statusId}`)),
    { label: `${statusId} on ${targetActor.name}` })))
    ui.notifications?.warn(`Edha: ${targetActor.name}'s ${statusId} has not come back from the GM — a rule reading it this activation may see nothing.`);
  return true;
}
/* --- v3 executors: status marks + status sweeps ------------------------------------------------ */
// Apply a status to the user's targeted creature and record the mark owner on the victim
// (flags.edha-content.markedBy.<status> = { actorId, talent }). GM-relayed when needed.
async function edhaApplyStatusMark(item, cfg, boundVictim = null) {
  try {
    const owner = item.actor;
    if (!edhaRuleOwnsGate(owner, cfg.whenOwnsTalent)) return;   // upgrade-talent gate
    // The trigger's victim wins over your current targets (2bU — H1's victim doctrine): a payload
    // rule binds to the creature the TEST resolved against, not whatever is targeted at click time.
    const victim = boundVictim ?? edhaUserTargetActor();
    if (!victim) { ui.notifications?.warn(`Edha: target a creature for ${item.name}.`); return; }
    const status = cfg.status || "diagnosed";
    const mark = { actorId: owner.id, talent: item.name };
    // `mark: false` applies the status WITHOUT claiming ownership (07-24v) — a buff on an ally must not
    // write markedBy.<status>, which the damage post-pass reads to add a marker-owner's bonus damage.
    const wantMark = cfg.mark !== false;
    // `expire: "combat"` stamps the CREATURE so the end-of-combat sweep below can find it without
    // knowing which talent applied it (07-24w). Recorded on the target rather than the owner because
    // the status lives on the target and a pact/buff can outlive its applier leaving the scene.
    const combatExpire = cfg.expire === "combat";
    // Timed expiry (2bU — Kneel's Compelled): the timed-status sweep owns duration and the relay.
    const timed = cfg.expire === "owner-turn" ? "owner" : cfg.expire === "target-turn" ? "target" : null;
    if (timed) {
      await edhaApplyTimedStatus(victim, status, { owner, expire: timed });
      // Job 6a: routed through edhaSetEdhaFlag — behavior flip, was a SILENT drop with no GM online
      // (no warning at all). 🤖 bench row.
      if (wantMark) await edhaSetEdhaFlag(victim, `markedBy.${status}`, mark);
    } else {
      const ok = await edhaWriteStatusMark(victim, status, wantMark ? mark : null, { combatExpire });
      if (!ok) return;
    }
    /* 07-27f: this three-term inline (07-24v) reached CONFIG.COSMERE.statuses for native ids and
     * printed its raw i18n KEY — bench run 1's "COSMERE.Status.Disoriented", open since 07-26h.
     * edhaConditionLabel is the same lookup order PLUS localization. */
    const label = edhaConditionLabel(status);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>🎯 <strong>${item.name}</strong>: <strong>${victim.name}</strong> is <strong>${label}</strong> (by ${owner.name})` +
        (cfg.bonusDamageFormula ? ` — damage against it gains +${edhaEvalSync(cfg.bonusDamageFormula, owner.getRollData())} ${cfg.bonusDamageType || "vital"} (auto-applied)` : "") +
        `.${cfg.note ? ` <span style="opacity:.8">${cfg.note}</span>` : ""}</p>`,
    });
  } catch (e) { console.error("Edha Content | apply status mark failed", e); }
}
/* END-OF-COMBAT status expiry (07-24w, Ben's q14 ruling). Generic: it clears whatever
 * `edha-apply-status {expire: "combat"}` stamped, keyed on the CREATURE's own
 * flags.edha-content.combatExpire.<status> map, so it names no talent and any future rule opting in
 * is swept for free. The marker flag goes with it, since a status whose owner-mark outlived it would
 * strand a phantom for the damage post-pass to read.
 *
 * Sweeps game.actors rather than canvas tokens on purpose: an ally who walked off-scene mid-fight
 * still has the status, and the token-only sweeps elsewhere in this file are exactly why some markers
 * have historically survived a scene change. One GM applier. */
async function edhaClearCombatExpiryStatuses(endedCombat) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const guard = edhaCombatEndGuard(endedCombat);   // ⛑ cross-combat clobber guard
    for (const a of (game.actors ?? [])) {
      if (edhaStillFightingElsewhere(a, guard)) continue;
      const map = a.getFlag?.("edha-content", "combatExpire");
      if (!map || typeof map !== "object") continue;
      for (const status of Object.keys(map)) {
        if (!map[status]) continue;
        try { if (a.statuses?.has?.(status)) await edhaToggleStatus(a, status, false); } catch (e) {}
        try { await a.unsetFlag("edha-content", `markedBy.${status}`); } catch (e) {}
      }
      try { await a.unsetFlag("edha-content", "combatExpire"); } catch (e) {}
    }
  } catch (e) { console.error("Edha Content | combat-expiry status sweep failed", e); }
}
Hooks.on("deleteCombat", (combat) => { try { void edhaClearCombatExpiryStatuses(combat); } catch (e) {} });

// Damage every creature in range bearing a status; optionally Temp HP = total dealt (Spoils of Isolation).
async function edhaStatusSweep(item, cfg) {
  try {
    const actor = item.actor;
    const tok = edhaCasterToken(actor);
    if (!tok) { ui.notifications?.warn(`Edha: select/drop your token to use ${item.name}.`); return; }
    const color = cfg.color || edhaTalentColor(item) || "black";
    const rank = edhaColorRank(actor, color);
    const ft = cfg.rangeByRank ? (EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1]) : (Number(cfg.rangeFt) || 30);
    const status = cfg.status || "weakened";
    const victims = edhaTokensWithin(tok, ft).map(t => t.actor).filter(a => a && a !== actor && a.statuses?.has?.(status));
    const label = edhaConditionLabel(status);   // 07-27f: printed a bare lowercase id for native statuses
    if (!victims.length) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${item.name}</strong> — no ${label} creature within ${ft} ft.</p>` });
      return;
    }
    const amt = Math.max(0, Math.floor(edhaEvalSync(cfg.damageFormula || "@tier", actor.getRollData())));
    const hits = victims.map(v => ({ actorUuid: v.uuid, amount: amt, type: cfg.damageType || "vital", heal: false }));
    const payload = { hits, casterActorUuid: actor.uuid };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else {
      if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to apply the damage."); return; }
      game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    }
    const total = amt * victims.length;
    if (cfg.thpFromTotal && total > 0) await edhaWriteTempHp(actor, total, item.name);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p>☠️ <strong>${item.name}</strong> — ${amt} ${cfg.damageType || "vital"} to each ${label} creature within ${ft} ft: ${victims.map(v => v.name).join(", ")}` +
        (cfg.thpFromTotal ? ` — <strong>${actor.name}</strong> gains <strong>${total}</strong> Temp HP (total dealt)` : "") + `.</p>`,
    });
  } catch (e) { console.error("Edha Content | status sweep failed", e); }
}
// Multi-hit prompt (Flashpoint): called by the burst/AoE engine with the number of captured creatures.
function edhaCheckMultiHit(actor, item, count) {
  try {
    if (!actor || !(count >= 2)) return;
    const rule = edhaActorRuleOf(actor, "edha-multi-hit");
    const h = rule?.handler;
    if (!h) return;
    const color = h.color || "";
    if (color && edhaTalentColor(item) !== color) return;
    const spec = {
      effect: { kind: "heal", formula: "0", target: "self",
        resourceGain: h.resourceGainResource ? { resource: h.resourceGainResource, value: Number(h.resourceGainValue) || 1 } : null,
        // Ben pass 3 (07-12): the advantage half was a "manual reminder" — the nextTestMod primitive
        // already existed (Red/Blue attunement), so the click now ARMS it (skill-gated to the color).
        nextTestMod: color ? { mode: "advantage", skill: color } : null },
      cost: null,   // free choice — the chat-card button is just the confirm
      oncePerRound: h.oncePerRound !== false,
      note: h.note || `${item.name} hit ${count} creatures — choose: all affected lose a Reaction (manual), OR click to regain ${Number(h.resourceGainValue) || 1} ${EDHA_RES_LABEL[h.resourceGainResource] || h.resourceGainResource || "Investiture"} + advantage on your next ${color || "matching"} test this turn (armed on click).`,
    };
    edhaPostTriggerCard(actor, rule.item.name, spec, {});
  } catch (e) { console.error("Edha Content | multi-hit check failed", e); }
}
// Register at init — AFTER the system's own init exposes cosmereRPG.api + CONFIG.COSMERE (system
// scripts load before module scripts, so its init listener runs first), but BEFORE world documents
// initialize. Foundry v13's setupGame() runs initializeDocuments() BEFORE the "setup" hook, so a
// setup-time registration is too late: owned talents carrying edha-* event rules fail schema
// validation ("edha-deal-damage is not a valid choice") and get dropped from their actors.
Hooks.once("init", () => { try { edhaRegisterNativeEventSystem(); } catch (e) { console.error("Edha Content | native event system registration failed", e); } });

// Expose the sync API for macros / console: game.modules.get("edha-content").api.syncNow() OR edha.syncNow()
Hooks.once("ready", () => {
  // summon: looks up the named TALENT on the caster and reads its own edha-summon rule.
  const summonByTalent = (caster, name) => {
    const tal = caster?.items?.find(i => edhaIsTalent(i) && i.name === name);
    const h = tal ? edhaRuleOf(tal, "edha-summon") : null;
    if (!h) { ui.notifications?.warn(`Edha: ${name} has no edha-summon rule on ${caster?.name ?? "actor"}.`); return null; }
    const pj = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    return edhaSummon(caster, {
      name: h.summonName || name, img: h.img, hpFormula: h.hpFormula, speed: h.speed, defensePenalty: h.defensePenalty, deflect: h.deflect,
      conditionImmunities: String(h.conditionImmunities || "").split(/[,\s]+/).filter(Boolean),
      attack: h.attackFormula ? { name: h.attackName || "Attack", damageFormula: h.attackFormula, damageType: h.attackType || "keen", range: h.attackRange || "melee" } : null,
      actsAfterCaster: !!h.actsAfterCaster,
      bakedEffects: pj(h.bakedEffectsJson), extraItems: pj(h.extraItemsJson),
    });
  };
  const api = { syncNow: edhaSyncNow, syncActorTalents: edhaSyncActorTalents, syncAllCharacters: edhaSyncAllCharacters, syncAdversary: edhaSyncAdversaryActor, syncAllAdversaries: edhaSyncAllAdversaries, createLootCache: edhaCreateLootCache, EDHA_EVENT_TYPES, EDHA_HANDLER_TYPES, setTempHp: edhaSetTempHp, getTempHp: edhaGetTempHp, summon: summonByTalent, showRange: edhaShowRange, drawMana: edhaDrawMana, grantDrawMana: edhaGrantDrawMana, resetTriggers: edhaResetTriggers, fixSettings: edhaFixSettings, clearKindleLights: edhaClearKindleLights, refreshDefBuffs: edhaRefreshDefBuffs, migrateDerivations: edhaMigrateDerivations, fixPcTokens: edhaFixPcTokens, grantStartingKit: edhaGrantStartingKit, creationWizard: edhaCreationWizard, newCharacter: edhaCreatorNewCharacter, isIsolated: edhaIsIsolated, toggleStatus: edhaToggleStatus, darkVeilSweep: edhaDarkVeilSweep, allEffects: edhaAllEffects, raiseStakes: edhaRaiseStakesApi, rally: edhaRallyApi, skipBudget: (v) => { globalThis.edhaSkipBudget = !!v; return globalThis.edhaSkipBudget; }, debug: edhaSetDebug, debugSave: edhaDebugSave, debugsave: edhaDebugSave };   // lowercase alias — Ben typed edha.debugsave() at the 07-12 bench and got a TypeError
  const mod = game.modules?.get("edha-content");
  if (mod) mod.api = api;
  globalThis.edha = Object.assign(globalThis.edha || {}, api);
  console.log("Edha Content | sync API ready — edha.syncNow() / edha.syncAllCharacters() / edha.syncAllAdversaries() / edha.debug(true) test tracing / edha.debugSave() full-log download / game.modules.get('edha-content').api");
});

