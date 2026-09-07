/* ============================================================================================
 * GREEN / TERRITORY tree engine (2026-06-16) — difficult terrain as an ENFORCED map Region.
 * "Difficult terrain" = a Foundry v13 Region carrying the NATIVE `modifyMovementCost` behavior
 * (walk ×2 = real engine-enforced movement cost) + a player-visible Drawing + an ownership tag
 * (flags.edha-content.terrain = {ownerUuid, color}) so "YOUR terrain" is queryable. A creator's
 * `edha-zone-hazard` rule (Thorn Field's shape) rides every Region it creates — Thorn Field rides
 * on terrain created by its owners (Ben, 06-16). Creators: Green Draw Mana + Sudden Growth.
 * Membership talents: Apex Predator (≥3 enemies in → advantage on Physical tests), Pack Sense (an
 * ally attacks a target in → +Green mod), Spreading Roots (a turn ends in → expand).
 * Wired via contest core (reuses edhaQueueContest / edhaRollOpposedSkill / edhaReadDefense):
 *   • Grasping Vines — Green vs Physical defense (static); success → Restrained (maintain by 1 Inv/turn).
 *   • Territorial Instinct — Green vs Survival (opposed roll, Reaction); success → Immobilized (timed).
 * ⚑ IRON RULE 2b (07-24p): BOTH are on their own documents now — `edha-def-test` (Territorial
 *   Instinct is the first authored consumer of `vs: skill`, i.e. the engine rolling the foe) plus
 *   one `edha-triggered-effect` status rule each. Their engine branches are deleted; do not re-add.
 * IRON RULE 2b (07-25, pass 2bS) — the whole Territory spine is document-driven now:
 *   • Green Leyline Attunement — `edha-zone` on the edha-draw-mana event (picker/Region/relay
 *     stay ENGINE-OWNED; the rule carries colour/size/range). Left the EDHA_DRAW_MANA table.
 *   • Thorn Field — its own `edha-zone-hazard` rule; edhaOwnsThorn (the "Thorn Field"/"Thorn
 *     Hedge" name pair) is DELETED. The Fellstag's Thorn Hedge and the Briar-Gone Grove's
 *     verbatim copy carry the same rule in data/adversaries.json.
 *   • Spreading Roots — `edha-zone-react` (turn-end-in-zone → the expand offer); the sweep
 *     announces via edhaWatchersOfRule and names no talent.
 * Manual by nature (no Foundry hook): none in this specialty.
 * ============================================================================================ */

/* Thorn-hazard ownership — DOCUMENT-DRIVEN since 07-25 (iron rule 2b, pass 2bS). The old
 * edhaOwnsThorn name pair ("Thorn Field" / the Fellstag's "Thorn Hedge" alias) became an
 * `edha-zone-hazard` rule swept off the CREATOR's items: Thorn Field (PC), the Fellstag's Thorn
 * Hedge and the Briar-Gone Grove's verbatim copy each carry their own rule, so the formula, the
 * damage type and the label are editable in Foundry. `@colorRank` = skill rank for a PC, ROLE rank
 * for an adversary owner (ruling 122) — identical dice to the retired baked @skills.green.rank
 * read for every current owner. */
function edhaZoneHazardRule(owner) { return edhaActorRuleOf(owner, "edha-zone-hazard"); }
// GM-side: create ONE green difficult-terrain Region (enforced walk ×2 + owner tag + the creator's
// optional edha-zone-hazard rider) plus its player-visible drawing. Returns the Region (or null). All
// Region writes are GM-only, so the player paths relay here via the burst-apply / green-terrain socket actions.
async function edhaCreateGreenTerrain(owner, scene, cx, cy, sizeFt, sourceItem = null) {
  try {
    if (!owner || !scene) return null;
    const gd = scene.grid?.distance || 5;
    // SQUARE region (07-12 rework — Ben: Green terrain follows Pyre's lead) — sizeFt square, snapped.
    const sq = edhaSnapCellRect(scene, cx, cy, Math.max(1, Math.round(Number(sizeFt) / gd)));
    // Hazard rider: a rule on the PLACING item wins (Bone Garden — 2bW, so a Green+Death owner's
    // Attunement terrain never inherits the wrong rider); else the actor-wide sweep (Thorn Field's
    // "terrain you create" wording is deliberately actor-wide).
    const srcRule = sourceItem ? edhaRuleOf(sourceItem, "edha-zone-hazard") : null;
    const thorn = srcRule ? { item: sourceItem, handler: srcRule } : edhaZoneHazardRule(owner);
    const thornLabel = thorn ? (thorn.handler.label || thorn.item.name) : null;
    const behaviors = [{ type: "modifyMovementCost", name: "Difficult Terrain", system: { difficulties: { walk: 2 } } }];
    let turnEnd = null;
    if (thorn) {   // hazard rider (Thorn Field's shape): terrain you create also damages on enter / turn-start — or at turn END (moment, 2bW).
      const h = thorn.handler;
      const f = edhaSubstRankTier(h.damageFormula || "0", edhaColorRank(owner, h.color || "green") || 1, Number(owner.system?.tier) || 1);
      const baked = edhaFoldDieMath(Roll.replaceFormulaData(f, owner.getRollData(), { missing: "0" }));
      if ((h.moment || "enter-turn-start") === "turn-end")
        turnEnd = { formula: baked, type: h.damageType || "keen", source: `${thornLabel} — ${owner.name}` };
      else behaviors.push({ type: "edha-content.hazard", name: thornLabel, system: { damageFormula: baked, damageType: h.damageType || "keen", sourceName: `${thornLabel} — ${owner.name}` } });
    }
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${owner.name} — ${turnEnd ? thornLabel : "Difficult Terrain"}`, color: EDHA_COLOR_HEX.green,
      shapes: [{ type: "rectangle", x: sq.x, y: sq.y, width: sq.w, height: sq.h, rotation: 0, hole: false }],
      behaviors,
      flags: { "edha-content": { hazard: !!(thorn && !turnEnd), scope: "scene", terrain: { ownerUuid: owner.uuid, color: "green" },
               ...(turnEnd ? { turnEndDamage: turnEnd } : {}) } },
    }]);
    if (region) await edhaSquareVisual(scene, sq.x, sq.y, sq.w, sq.h, EDHA_COLOR_HEX.green, region.id, thornLabel ? `🌿 ${thornLabel}` : "🌿 Difficult Terrain");
    return region ?? null;
  } catch (e) { console.error("Edha Content | create green terrain failed", e); return null; }
}
// Player → GM relay to drop green terrain (Green Draw Mana, used by a player who can't write Regions).
async function edhaDropGreenTerrain(owner, scene, cx, cy, sizeFt, sourceItem = null) {
  if (game.user?.isGM) return edhaCreateGreenTerrain(owner, scene, cx, cy, sizeFt, sourceItem);
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to place difficult terrain."); return null; }
  try { game.socket.emit("module.edha-content", { action: "green-terrain", payload: { ownerUuid: owner.uuid, sceneId: scene.id, cx, cy, sizeFt, itemUuid: sourceItem?.uuid ?? null } }); } catch (e) {}
  return null;
}

/* --- "Your difficult terrain" membership (the Territory spine) -----------------------------------
 * ⚠ THE ONE PLACE THAT KNOWS HOW A REGION SPELLS ITS OWNER (07-27s). Every hazard/terrain placer
 * stamps `flags.edha-content.terrain = {ownerUuid, color}` and every consumer asks THIS function —
 * because for two days they did not. `edhaPlaceHazard` (the `edha-place-hazard` handler behind Pyre,
 * Walking Ruin's trail rule and Fire the Wrack) stamped a FLAT `sourceOwnerUuid` instead, read only
 * by the Pyre spread watcher, so a Pyre zone was invisible to the entire membership spine and
 * Combustion Chain could never fire off one — the canonical Destruction pairing, measured dead at
 * bench run 14 against a matched Walking-Ruin control that fired instantly. Two placers, two
 * vocabularies, two readers each matching only one. `lint-refs` pass 16 now fails the build on a
 * hazard Region that does not carry `terrain.ownerUuid`, so the split cannot re-open.
 * The flat key is read here ONLY as a legacy tolerance: hazard Regions are `scope: "scene"` and can
 * outlive a deploy (the same caveat the spread watcher already carries), so a zone placed by a
 * pre-07-27s engine would otherwise be stranded. Nothing writes it any more — delete this arm once
 * no live scene carries one. */
function edhaTerrainOwnerUuid(region) {
  return region?.getFlag?.("edha-content", "terrain")?.ownerUuid
      ?? region?.getFlag?.("edha-content", "sourceOwnerUuid")   // legacy (pre-07-27s edhaPlaceHazard) — see above
      ?? null;
}
function edhaOwnedTerrainRegions(owner, scene) {
  scene = scene || canvas?.scene; if (!owner || !scene) return [];
  return (scene.regions ?? []).filter(r => edhaTerrainOwnerUuid(r) === owner.uuid);
}
function edhaPointInRegion(region, x, y) {
  for (const s of (region.shapes ?? [])) {
    if (s.hole) continue;
    if (s.type === "circle") { if (Math.hypot(x - s.x, y - s.y) <= (Number(s.radius) || 0)) return true; }
    else if (s.type === "rectangle" && !(Number(s.rotation) || 0)) {   // square terrain (07-12) — no canvas object needed
      if (x >= s.x && x <= s.x + (Number(s.width) || 0) && y >= s.y && y <= s.y + (Number(s.height) || 0)) return true;
    }
    else { try { if (region.object?.testPoint?.({ x, y }, 0)) return true; } catch (e) {} }
  }
  return false;
}
function edhaTokenInOwnedTerrain(tok, owner) {
  if (!tok) return false;
  return edhaOwnedTerrainRegions(owner, tok.scene ?? canvas?.scene).some(r => edhaPointInRegion(r, tok.center?.x ?? 0, tok.center?.y ?? 0));
}
function edhaEnemiesInOwnedTerrain(owner) {
  const disp = edhaActorSide(owner);
  const regions = edhaOwnedTerrainRegions(owner);
  if (!regions.length) return [];
  return (canvas?.tokens?.placeables ?? []).filter(t => t.actor
    && edhaSideHostile(t.document?.disposition, disp)
    && (t.actor?.system?.resources?.hea?.value ?? 1) > 0
    && regions.some(r => edhaPointInRegion(r, t.center?.x ?? 0, t.center?.y ?? 0)));
}
function edhaSameDisposition(owner, tok) {
  const ot = edhaCasterToken(owner); if (!ot || !tok || ot.id === tok.id) return false;
  // R-63: was `?? 1` on both sides (unknown defaults to FRIENDLY) — Number.isFinite fails CLOSED
  // instead, matching edhaAllyDropEligible/edhaDisposHostile. 🤖 bench row.
  const od = ot.document?.disposition, td = tok.document?.disposition;
  if (!Number.isFinite(od) || !Number.isFinite(td)) return false;
  return od === td;
}

/* --- Apex Predator — ON ITS OWN DOCUMENT since 07-25 pass 2bS (iron rule 2b): an `edha-test-rider`
 * rule ({mode: advantage · whenAttribute str,spd · whenEnemiesInMyZone 3 · unlessDisadvantage}).
 * The bespoke edhaApexPreRoll hook trio is deleted — the generic injector (edhaTestRiderApply)
 * gained the two gate fields, so any future "advantage while my terrain is crowded" talent is
 * authoring, not engine work. edhaEnemiesInOwnedTerrain stays (the gate reads it). */

/* --- Pack Sense — ON ITS OWN DOCUMENT since 07-25 (iron rule 2b): an H26 `edha-test-react` rule
 * ({rolls: attack,item · requireTargetInMyTerrain · modFormula Green}) — the fifth caller of
 * edhaPostCoordReactionCard, converted in the same build as the White coord family. Only the
 * target-sync helper stays here (the terrain gate reads it). */
// The roller's target travels via synced user targets (target pips are broadcast to all clients).
function edhaTargetsOfRoller(roller) {
  const toks = new Set();
  for (const u of (game.users ?? [])) { if (!u.active || !roller.testUserPermission?.(u, "OWNER")) continue; for (const t of (u.targets ?? [])) toks.add(t); }
  return [...toks];
}

/* --- Zone turn-end reactions (`edha-zone-react`, 07-25 pass 2bS — was the Spreading Roots loop) ---- */
function edhaPostSpreadCard(owner, regionId, sceneId, sizeFt, { label = "Expand Terrain", cost = 1 } = {}) {
  try {
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🌱 <strong>${label}</strong> — a creature ended its turn in your difficult terrain. ${cost > 0 ? `Spend ${cost} Investiture to expand` : "Expand"} it ${sizeFt} ft.</p>`
        + `<button type="button" class="edha-spread-btn" data-edha-owner="${owner.uuid}" data-edha-region="${regionId}" data-edha-scene="${sceneId}" data-edha-size="${sizeFt}" data-edha-label="${encodeURIComponent(label)}" data-edha-cost="${cost}">Expand terrain${cost > 0 ? ` (−${cost} Investiture)` : ""}</button></div>`,
    });
  } catch (e) { console.error("Edha Content | zone-spread card failed", e); }
}
/* --- Region SHAPE writes: always edit the SOURCE, never the live models (bench run 26) ----------
 * `region.shapes` is an array of shape DataModel instances (RectangleShapeData / CircleShapeData /
 * …), and `foundry.utils.deepClone` returns any object whose constructor is not `Object` BY
 * REFERENCE (common/utils/helpers.mjs `_deepClone`: "Unsupported advanced objects" → `return
 * original` unless `strict`). So `deepClone(region.shapes)` hands back a new ARRAY holding the LIVE
 * models — mutating `r.x` only touches that model's initialized accessor, never its `_source`, and
 * `region.update({shapes})` then re-reads the source on the way in (`EmbeddedDataField._cast` calls
 * `value.toObject()`, which is `deepClone(this._source)`) and diffs to NOTHING. The write returns
 * cleanly, no error anywhere, and the Region never moves.
 *
 * That is exactly how Spreading Roots charged its Investiture, posted "the terrain expands 10 ft",
 * grew the player-visible Drawing to 1200×1200 (those lines write explicit numbers read off the
 * mutated live model) and left the Region enforcing 600×600 (bench run 26, measured: re-running the
 * old path in the page changed nothing; the same mutation over `region.toObject().shapes` grew it).
 *
 * THE RULE: every writer of `shapes` goes through `edhaRegionShapes(region)`, which hands back plain
 * source objects that are safe to mutate. `tests/region-shape-write.test.js` pins it, including a
 * source scan so a future `deepClone(<x>.shapes)` cannot land again. */
function edhaRegionShapes(region) {
  const src = region?.toObject?.()?.shapes;                       // toObject() = deepClone(_source)
  if (Array.isArray(src)) return src;
  return (region?.shapes ?? []).map(s => (s?.toObject ? s.toObject() : foundry.utils.deepClone(s)));
}
/* PURE. Grow a terrain Region's shape array in place by `addPx` and report which shape grew:
 * a solid circle gains radius, a solid square/rect grows SYMMETRICALLY (07-12 rework — the patch
 * stays centred and stays square). Returns null when the Region carries neither, so the caller
 * writes nothing. Split out of edhaGrowTerrain so the geometry is testable without a canvas. */
function edhaGrowShapes(shapes, addPx) {
  const list = Array.isArray(shapes) ? shapes : [];
  const c = list.find(s => s && s.type === "circle" && !s.hole);
  if (c) { c.radius = (Number(c.radius) || 0) + addPx; return { kind: "circle", shape: c }; }
  const r0 = list.find(s => s && s.type === "rectangle" && !s.hole);
  if (r0) {
    r0.x = (Number(r0.x) || 0) - addPx / 2; r0.y = (Number(r0.y) || 0) - addPx / 2;
    r0.width = (Number(r0.width) || 0) + addPx; r0.height = (Number(r0.height) || 0) + addPx;
    return { kind: "rectangle", shape: r0 };
  }
  return null;
}
async function edhaGrowTerrain(sceneId, regionId, sizeFt) {
  try {
    const scene = game.scenes?.get(sceneId); const region = scene?.regions?.get(regionId); if (!region) return;
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    const addPx = Math.round((Number(sizeFt) / gd) * gs);
    const shapes = edhaRegionShapes(region);    // SOURCE objects — mutating region.shapes writes nothing
    const grown = edhaGrowShapes(shapes, addPx);
    if (!grown) return;
    await region.update({ shapes });
    const draw = (scene.drawings ?? []).find(d => d.getFlag?.("edha-content", "hazardVisual")?.regionId === region.id);
    if (!draw) return;
    if (grown.kind === "circle") {              // legacy circle terrain
      const c = grown.shape, r = c.radius;
      await draw.update({ x: c.x - r, y: c.y - r, "shape.width": r * 2, "shape.height": r * 2 });
    } else {                                    // square terrain (07-12 rework): grow symmetrically, stays square
      const r0 = grown.shape;
      await draw.update({ x: r0.x, y: r0.y, "shape.width": r0.width, "shape.height": r0.height });
    }
  } catch (e) { console.error("Edha Content | grow terrain failed", e); }
}
async function edhaSpreadClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner); if (!owner) return;
    const free = ds.edhaFree === "1";                        // Pyre's turn-end spread costs nothing
    const cost = free ? 0 : Math.max(0, edhaNumOr(ds.edhaCost, 1));   // Job 6: unified onto edhaNumOr (was already falsy-zero-safe, no behavior change)
    if (cost > 0) {
      const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
      await edhaSpendResource(owner, "inv", cost);
    }
    if (game.user?.isGM) await edhaGrowTerrain(ds.edhaScene, ds.edhaRegion, Number(ds.edhaSize));
    else { try { game.socket.emit("module.edha-content", { action: "grow-terrain", payload: { sceneId: ds.edhaScene, regionId: ds.edhaRegion, sizeFt: Number(ds.edhaSize) } }); } catch (e) {} }
    btn.disabled = true; btn.textContent = "Terrain expanded";
    const label = ds.edhaLabel ? decodeURIComponent(ds.edhaLabel) : "The terrain";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>${free ? "🔥" : "🌱"} <strong>${label}</strong> (${owner.name}): the terrain expands ${ds.edhaSize} ft${cost > 0 ? ` (−${cost} Investiture)` : ""}.</p>` });
  } catch (e) { edhaClickFailed("terrain-spread click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-spread-btn"] (Job 1, pass 5.3, end of file).
// Square-by-square spread (07-12 rework): the GM clicks the adjacent square the fire burns into.
async function edhaSpreadSquareClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    if (!game.user?.isGM) { ui.notifications?.info("Edha: the GM picks the spread square."); return; }
    const pt = await edhaPickPoint(`Click the adjacent square the ${ds.edhaLabel || "terrain"} spreads into (right-click to cancel).`);
    if (!pt) return;
    const grown = await edhaGrowTerrainSquareGM(ds.edhaScene, ds.edhaRegion, pt.x, pt.y);
    if (!grown) return;   // warned already (occupied / not adjacent) — button stays live for a re-pick
    btn.disabled = true; btn.textContent = "✓ Spread";
    ChatMessage.create({ content: `<p>🔥 <strong>${ds.edhaLabel || "Terrain"}</strong> spreads one square.</p>` });
  } catch (e) { edhaClickFailed("square-spread click", e); }
}
// Player extinguish (07-12 rework): the region + its visuals go away; players relay through the GM.
async function edhaExtinguishClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    await edhaRemoveTerrain(ds.edhaScene, ds.edhaRegion);
    btn.closest(".edha-trigger-card")?.querySelectorAll("button").forEach(b => b.disabled = true);
    btn.textContent = "✓ Extinguished";
    void edhaMarkCardResolved(edhaMessageIdOf(btn), "✓ Extinguished");   // R-66: persists past F5/second client
    ChatMessage.create({ content: `<p>💨 <strong>${ds.edhaLabel || "The terrain"}</strong> is put out.</p>` });
  } catch (e) { edhaClickFailed("extinguish click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-spread-sq-btn"], ["edha-extinguish-btn"] (Job 1, pass 5.3, end of file).
/* `edha-zone-react` (07-25, pass 2bS — was the name-keyed Spreading Roots loop): a creature ends
 * its turn in one of your zones → the rule's whispered expand offer. The sweep ANNOUNCES
 * (edhaWatchersOfRule) and the spec — size, colour, Investiture cost — rides each talent's
 * document; the grow machinery and the GM relay stay ENGINE-OWNED. One offer per owner per round
 * (the retired behaviour), budgeted on the talent's name at runtime, not a literal. */
async function edhaZoneTurnEndCheck(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const prevTurn = combat.previous?.turn; if (prevTurn == null) return;
    const tdoc = combat.turns?.[prevTurn]?.token; const tok = tdoc?.object; if (!tok) return;   // creature whose turn just ended
    const scene = tok.scene ?? canvas?.scene;
    for (const { actor: owner, item: tal, handler: h } of edhaWatchersOfRule("edha-zone-react")) {
      try {
        if (String(h.when || "turn-end-in-zone") !== "turn-end-in-zone") continue;
        const region = edhaOwnedTerrainRegions(owner, scene).find(r => edhaPointInRegion(r, tok.center?.x ?? 0, tok.center?.y ?? 0));
        if (!region) continue;
        if (!edhaCoordOPRAllowed(owner, tal.name, "_spread")) continue;     // one offer per owner per round
        await edhaCoordOPRMark(owner, tal.name, "_spread");
        const sizeFt = Number(h.sizeFt) > 0 ? Number(h.sizeFt) : (EDHA_SIZE_FT[edhaColorRank(owner, h.color || "green")] || EDHA_SIZE_FT[1]);
        const cost = h.costInv == null ? 1 : Math.max(0, Number(h.costInv) || 0);
        edhaPostSpreadCard(owner, region.id, scene.id, sizeFt, { label: tal.name, cost });
      } catch (e) { console.error(`Edha Content | edha-zone-react (${tal?.name}) failed`, e); }
    }
  } catch (e) { console.error("Edha Content | zone turn-end check failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaZoneTurnEndCheck(combat); });

/* --- Grasping Vines / Territorial Instinct moved onto their documents 07-24p (iron rule 2b) --------
 * Both are `edha-def-test` (green vs Physical defense / green vs the foe's Survival — the second is
 * the first authored consumer of H1's `vs: skill` mode) plus one `edha-triggered-effect` status rule
 * on edha-test-success.
 * `edhaApplyConditionToTarget` went with them. Its comment claimed other paths called it; a
 * repo-wide grep at conversion time found ZERO — it had been dead since the two callers above were
 * its only ones. `edha-triggered-effect` kind=status is the surviving generic form. */
