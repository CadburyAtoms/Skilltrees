/* ============================================================================================
 * DESTRUCTION (Razkael, deity) tree engine (2026-06-16) — the "Charge" lifecycle + dangerous terrain.
 * First deity tree wired; reuses the Red/hazard machinery wholesale (no side-engine):
 *   • damage/heal writes → edhaApplyBurstResults (+ GM socket relay), the proven burst pipeline.
 *   • dangerous terrain   → edhaDropHazard → edhaPlaceHazardRegionGM (circle OR line), the same
 *     edha-content.hazard Region behavior + edhaHazardVisual that Pyre/Fault Line already use.
 *   • opposed Speed test   → edhaFoeSkillVsColor (engine ROLLS each foe's skill vs the owner's DC,
 *     then applies the status on a failure — NOT a "trust the player" reminder card; dials on rules).
 *   • per-actor state      → the `charges` H3 LEDGER at flags.edha-content.lists.charges (REPOINTED
 *     2bY — was a flat owner flag); cleared at scene/combat end via the raw-path hand-edit.
 * CHARGE MODEL (Ben, 06-16): Set Charge drops a click-to-placed marker template, tracked in the owner
 * flag (cap = tier; oldest fizzles past cap). Detonation resolves burst damage + drops terrain at each
 * marker's REAL position via the card's Detonate / Detonate-All buttons (free) or via Cascading
 * Failure / The Unmooring (their own Inv cost + bonuses). Concussive Yield rides EVERY detonation.
 * RULINGS (Ben, 06-16): trigger conditions ("when target moves/takes damage/enters") are DECLARED
 * TEXT fired by the Detonate action (no auto-hook); zone "merge" is a damage-bump + GM-merge note
 * (no polygon union); the Prone test is engine-rolled per caught character.
 * R-5 (Ben, 2026-09-05, TODO_REPO_HYGIENE #29): Fault Line's line catches EVERY character standing
 * in it — allies and neutrals as well as foes, caster excluded — and both riders (damage with the
 * Construct multiplier, and the Speed-vs-Red save that knocks Prone) run on that whole set. The
 * card says "each character" and the card is spec. R-6 (who the dangerous-terrain REGION catches)
 * is a separate ruling, still open — that half is deliberately unchanged.
 * Now wired (no longer GM-eyeballed): ignore-deflect (Pinpoint primary + The Unmooring) bumps the hit by
 * the target's deflect so applyDamage nets to ignoring it; Fault Line TRIPLES damage vs Constructs;
 * Combustion Chain AUTO-fires off the defeat HP-sync hook when a foe drops in your terrain; Walking Ruin
 * drops terrain off updateToken; +10 ft Speed is a transfer AE.
 * Hooks/tools still to build (engine backlog — NOT silently dropped; each names the hook it needs):
 *   • Fault Line "triple damage to structures" — needs object/structure damage targets (no actor for a
 *     wall today); Constructs ARE wired.
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Pinpoint "terrain moves with the target" — the detonation centers the terrain on the primary
 *     target, tags followTokenUuid, and an updateToken watcher recenters Region + visual while the
 *     target lives (⚑ bench: a Region moved ONTO a token may not fire tokenEnter — turn-start still hits).
 *   • Pyre "spreads to one adjacent flammable square each turn" — end-of-owner-turn (the Bone-Garden
 *     combat.previous shape) whispers a FREE confirm card per Pyre zone; the button is the
 *     Spreading-Roots +5 ft Region-grow ("flammable" stays GM-judged — the confirm IS the judgment).
 *   (Shared/cross-tree backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9 — consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Set Charge triggers — WIRED 07-16c (Ben E18, superseding the 06-16 "declared text" ruling):
 *     the arm card binds "target moves" / "target takes damage" / "a creature enters (10 ft)" to
 *     real watchers that whisper a Detonate prompt; detonation stays the owner's click. "Manual"
 *     remains a valid arm for genuinely narrative conditions.
 *
 * ── IRON RULE 2b STATUS (07-25, pass 2bY — tree CLEAR) ────────────────────────────────────────
 * On their own documents now, the takeover deleted — do not re-add a case:
 *   Set Charge (edha-zone {kind: charge}) · Fault Line (edha-zone {kind: line}) · Pinpoint Charge
 *   (H3 annotate on `charges`, sourceItemUuid stamp) · Concussive Yield (edha-detonate-react) ·
 *   Combustion Chain (edha-zone-react {defeat-in-zone}) · Walking Ruin (edha-place-hazard
 *   {mode: trail}) · Pyre (edha-place-hazard {spreads}) · Cascading Failure · The Unmooring (H12,
 *   07-24s). ENGINE-OWNED, keyed on the rules (§9o): the charge place/arm/trigger/detonate card
 *   flows, the trail move watcher, the spread watcher, the ignite-spread defeat sweep.
 * ============================================================================================ */

const EDHA_CHARGE_DMG = "(@tier)d(2 * @skills.red.rank + 2)";   // [Tier][Die] energy — the Charge/terrain default
// Deflect (reduced by applyDamage on energy/impact/keen) — adding it back to a hit nets to "ignores deflect".
function edhaDeflectOf(actor) { return Math.max(0, Number(actor?.system?.deflect?.value) || 0); }
/* Cosmere creature type lives at `system.type = {id, custom}` — `CONFIG.COSMERE.creatureTypes` is
 * exactly ["custom", "humanoid", "animal"], so a Construct is {id: "custom", custom: "Construct"}.
 * The old read (`system.customType`) was a field NO cosmere actor has, so this returned false for
 * every actor and Fault Line's Constructs ×3 could never fire — measured live at bench run 4
 * (2026-07-26m defect 1; same dead-field family as 07-26l's `edhaAttackKind`). */
function edhaIsConstruct(actor) {
  const t = actor?.system?.type;
  const label = t?.id === "custom" ? (t?.custom ?? "") : (t?.id ?? "");
  return String(label).toLowerCase() === "construct";
}

/* `charges` REPOINTED onto H3 storage (flags.edha-content.lists.charges) in 2bY — the snares
 * repoint one tree over, same three properties. Entries are POINT-BOUND — no top-level uuid (the
 * trigger arms carry a NESTED trig.targetUuid, which the reconcile never sees) and NO marker
 * status — so H3's mark-wins reconcile fails OPEN on every entry and keeps it (the 2bV covenants
 * convention; there is nothing to pass, and that is correct, not a gap). The scene filter is H3's
 * sceneScoped shape (every entry carries sceneId). Writes go through edhaSetOwnerList("charges",
 * …) at each site — [] is a fine stored value (the old unset-when-empty quirk is dropped on
 * purpose; there are NO freebie semantics here). Canvas objects (MeasuredTemplate markers) and
 * the arm/trigger machinery stay with the placement/detonate handlers per §9o — every cleanup
 * path is a raw-path hand-edit onto lists.charges (§9o trap 3). H12's pre-cost veto and executor
 * read through this accessor and follow for free. */
const edhaGetCharges = (o) => edhaOwnerList(o, "charges");
// Enemy (different-disposition, alive) tokens within `ft` of a point — the burst capture, reused.
function edhaEnemyTokensInCircle(owner, cx, cy, ft) {
  const disp = edhaActorSide(owner);
  return edhaTokensInCircle(cx, cy, ft, null).filter(t =>
    edhaSideHostile(t.document?.disposition, disp) && (t.actor?.system?.resources?.hea?.value ?? 1) > 0);
}
/* Every LIVE token inside a length×width line that starts at (cx,cy) and runs toward (px,py),
 * EXCEPT the caster's own token — the `edha-zone {kind: line}` caught set, so every rule of that
 * kind inherits this one definition rather than each talent deciding who it catches.
 *
 * R-5 (Ben, 2026-09-05, "no it does not" — TODO_REPO_HYGIENE #29): a line zone catches **each
 * character** standing in it, allies and neutrals as readily as foes; only the caster is spared.
 * This was `edhaEnemyTokensInLine`, which dropped every same-disposition token, so an ally in the
 * line was neither damaged nor asked for the save while the card ("each character") promised both.
 * Card-is-spec: the engine is the side that drifted. The WHOLE rider set now runs on this set —
 * the damage with its Construct multiplier AND the save/failStatus rider. `edhaFoeSkillVsColor`
 * is disposition-BLIND (it rolls whatever tokens it is handed against the owner's colour DC, and
 * edhaRollOpposedSkill reads only the target's own skill/attribute), so an ally rolls exactly the
 * same save as a foe with no special case — only the helper's NAME says "foe".
 * The caster is excluded by token id AND by actor identity: id alone would fail open on an actor
 * whose token cannot be resolved, and "who cast it" is the one exclusion the card does state.
 * NOT touched: the dangerous-terrain Region this zone drops afterwards — who that catches is R-6,
 * a separate ruling still open. */
function edhaTokensInLine(owner, cx, cy, px, py, lengthFt, widthFt) {
  const scene = canvas?.scene; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
  const lenPx = (lengthFt / gd) * gs, halfW = ((widthFt / gd) * gs) / 2;
  let dx = px - cx, dy = py - cy; const mag = Math.hypot(dx, dy) || 1; dx /= mag; dy /= mag;   // unit direction
  const selfTok = edhaCasterToken(owner);
  return (canvas?.tokens?.placeables ?? []).filter(t => {
    if (!t.actor || t === selfTok || (selfTok && t.id === selfTok.id) || t.actor === owner) return false;   // the caster only
    if ((t.actor?.system?.resources?.hea?.value ?? 1) <= 0) return false;
    const vx = (t.center?.x ?? 0) - cx, vy = (t.center?.y ?? 0) - cy;
    const proj = vx * dx + vy * dy;                       // distance along the line
    const perp = Math.abs(vx * -dy + vy * dx);            // distance off the centreline
    return proj >= -halfW && proj <= lenPx + halfW && perp <= halfW;
  });
}

// Engine-resolved "each foe tests <skill> vs. your <color>; on a failure, <onFail>" — the generalized
// Destruction Concussive-Yield helper (2026-07-02, Civilization pass). Rolls the owner's color DC ONCE
// (1d20 + @skills.<color>.mod), then ROLLS each foe's skill (engine rolls the foe — never trust-the-player)
// and runs onFail(token) per failure. Callers (2bY: all rule-driven — the dials ride the rules):
// the `edha-detonate-react` sweep, the `edha-zone {kind: line}` save, Bastion, Magnum Opus.
// "Foe" is the NAME, not the contract: this helper is disposition-BLIND — it rolls whatever token
// list it is handed, and edhaRollOpposedSkill reads only the target's own skill/attribute. Who is
// caught is the CALLER's decision, which is why R-5 (2026-09-05) could widen the `kind: line` set
// to allies without touching a line of this function.
async function edhaFoeSkillVsColor(owner, tokens, { skill = "spd", label = null, color = "red", sourceName = "", failText = "fails", okText = "resists", icon = "💥", onFail = null } = {}) {
  try {
    const uniq = [...new Map((tokens || []).map(t => [t.id, t])).values()];
    if (!uniq.length) return;
    const dcRoll = await new Roll(`1d20 + @skills.${color}.mod`, owner.getRollData()).evaluate();
    const dc = Number(dcRoll.total) || 0;
    /* 07-27f: the helper LOCALIZES the skill id itself. It used to fall back to the bare id, so
     * every caller computed its own label — three of them from the raw `CONFIG.COSMERE.skills[id]
     * .label` KEY, one from a hardcoded "Agility", and two from authored English on the rule.
     * `label` now only overrides for a caller that wants different prose. */
    const skillName = label || edhaSkillLabel(skill);
    const colorName = color.charAt(0).toUpperCase() + color.slice(1);
    const lines = [];
    for (const t of uniq) {
      const opp = await edhaRollOpposedSkill(t.actor, skill);
      const failed = opp < dc;
      if (failed && onFail) await onFail(t);
      lines.push(`${t.name}: ${skillName} <strong>${opp}</strong> vs your ${colorName} <strong>${dc}</strong> — ${failed ? `<strong>${failText}</strong>` : okText}`);
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: [dcRoll],
      content: `<div class="edha-trigger-card"><p>${icon} <strong>${sourceName}</strong> — ${skillName} vs your ${colorName}:</p><p style="font-size:.95em">${lines.join("<br>")}</p></div>` });
  } catch (e) { console.error("Edha Content | foe-skill-vs-color failed", e); }
}
// (edhaSpeedVsRedProne retired 2bY — both callers now carry their save dials on their own rules.)

/* --- Dangerous-terrain placement (circle OR line), GM-side with a player→GM relay ------------------ */
async function edhaPlaceHazardRegionGM(scene, owner, shape, bakedFormula, type, color, label, extraFlags = null, exemptActorUuid = "") {
  try {
    if (!scene || !owner || !shape) return null;
    const hex = EDHA_COLOR_HEX[color] || "#d23b2e";
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${owner.name} — Dangerous Terrain`, color: hex,
      shapes: [{ ...shape, hole: false }],
      behaviors: [{ type: "edha-content.hazard", name: "Dangerous Terrain", system: { damageFormula: bakedFormula || "1d6", damageType: type || "energy", sourceName: `Dangerous Terrain — ${owner.name}`, exemptActorUuid: exemptActorUuid || "" } }],
      flags: { "edha-content": { hazard: true, scope: "scene", terrain: { ownerUuid: owner.uuid, color }, ...(extraFlags || {}) } },
    }]);
    if (!region) return null;
    if (shape.type === "circle") {
      await edhaHazardVisual(scene, shape.x, shape.y, shape.radius, hex, region.id, label || "🔥");
    } else if (shape.type === "rectangle") {   // line: a player-visible rotated rectangle Drawing
      try {
        await scene.createEmbeddedDocuments("Drawing", [{
          x: shape.x, y: shape.y, rotation: shape.rotation || 0,
          shape: { type: "r", width: shape.width, height: shape.height },
          strokeColor: hex, strokeWidth: 4, strokeAlpha: 0.9,
          fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: hex, fillAlpha: 0.18,
          text: label || "🔥 Dangerous Terrain", fontSize: 18, textColor: hex, textAlpha: 0.9,
          flags: { "edha-content": { hazardVisual: { regionId: region.id } } },
        }]);
      } catch (e) {}
    }
    return region;
  } catch (e) { console.error("Edha Content | place hazard region failed", e); return null; }
}
// Drop a hazard: bake the formula against the OWNER, then write GM-side (direct or via socket for players).
// `extraFlags` merges into the Region's edha-content flags (e.g. Pinpoint's followTokenUuid).
// `exemptActorUuid` (R-6) rides the BEHAVIOR, not the flags — the tick reads it. Blank = nobody,
// which is every caller but Fault Line, so no shipped hazard changes behaviour.
async function edhaDropHazard(owner, scene, shape, formulaRaw, type, color, label, extraFlags = null, exemptActorUuid = "") {
  const baked = edhaFoldDieMath(Roll.replaceFormulaData(formulaRaw || EDHA_CHARGE_DMG, owner.getRollData(), { missing: "0" }));
  if (game.user?.isGM) return edhaPlaceHazardRegionGM(scene, owner, shape, baked, type, color, label, extraFlags, exemptActorUuid);
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to place dangerous terrain."); return null; }
  try { game.socket.emit("module.edha-content", { action: "place-hazard-region", payload: { sceneId: scene.id, ownerUuid: owner.uuid, shape, baked, type, color, label, extraFlags, exemptActorUuid } }); } catch (e) {}
  return null;
}

/* --- Charge marker + the Detonate card (`edha-zone` kind "charge", 2bY — was the preUse takeover).
 * ENGINE-OWNED per §9o (picker, MeasuredTemplate, the arm buttons + watchers, GM relays), keyed on
 * the RULE: the system charges the activation cost and every cancel/out-of-range pick REFUNDS it
 * (the Fate place-core convention). Cap/evict/size/range ride the rule; the blast damage formula
 * and type ride ITS document. The Attunement-Range gate is new with 2bY — the card always said
 * "in Attunement Range" and the retired takeover never checked it (card-is-spec, §9m q11). */
async function edhaSetChargeMarker(item, h) {
  try {
    const owner = item.actor; if (!owner) return;
    const scene = canvas?.scene;
    if (!scene) { edhaRefundCost(item); ui.notifications?.warn(`Edha: need an active scene to set a Charge — cost refunded.`); return; }
    const sizeFt = Number(h.sizeFt) > 0 ? Number(h.sizeFt) : 10;   // detonation radius
    const color = h.color || "red";
    const hex = EDHA_COLOR_HEX[color] || EDHA_COLOR_HEX.red;
    const tok = edhaCasterToken(owner);
    const ft = Number(h.rangeFt) > 0 ? Number(h.rangeFt) : (EDHA_ATTUNE_FT[edhaColorRank(owner, color) || 1] || EDHA_ATTUNE_FT[1]);
    const gd = scene.grid?.distance || 5, gs = scene.grid?.size || 100;
    let ring = null;
    if (tok) { try { ring = await edhaDrawCircle(tok.center.x, tok.center.y, ft, EDHA_RANGE_RING_HEX, 0); } catch (e) {} }
    const pt = await edhaPickPoint(`Click where to place the ${item.name} (right-click to cancel). Attunement Range ${ft} ft.`);
    try { if (ring) await ring.delete(); } catch (e) {}
    if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return; }
    if (tok && Math.hypot(pt.x - tok.center.x, pt.y - tok.center.y) / gs * gd > ft + gd / 2) {
      edhaRefundCost(item); ui.notifications?.warn(`Edha: that point is beyond Attunement Range (${ft} ft) — cost refunded.`); return;
    }
    const [tpl] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: pt.x, y: pt.y, distance: sizeFt, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, fillAlpha: 0.12, flags: { "edha-content": { charge: item.name } },
    }]);
    const cap = edhaListCap(owner, h.capFormula || "@tier");
    const entry = { id: foundry.utils.randomID(), sceneId: scene.id, templateId: tpl?.id, x: pt.x, y: pt.y, sizeFt,
                    pinpoint: false, formula: item.system?.damage?.formula || EDHA_CHARGE_DMG, type: item.system?.damage?.type || "energy" };
    // Queued RMW (07-26n): the push runs against a FRESH read inside the per-owner queue. The
    // user's pick-point already resolved above — nothing interactive sits inside the lock.
    const committed = await edhaOwnerListQueue(owner, "charges", async () => {
      const { list, evicted, refused } = edhaListPush(foundry.utils.deepClone(edhaGetCharges(owner)), entry, { cap, evict: h.evict || "oldest" });
      if (refused) {   // evict: refuse at the cap — the new Charge doesn't land, nothing spent
        try { void scene.templates?.get(tpl?.id)?.delete()?.catch(() => {}); } catch (e) {}
        edhaRefundCost(item); ui.notifications?.warn(`Edha: you already sustain ${cap} Charge(s) — cost refunded.`); return null;
      }
      for (const drop of evicted) { try { void scene.templates?.get(drop.templateId)?.delete()?.catch(() => {}); } catch (e) {} }   // canvas cleanup stays here, by hand (§9o trap 3)
      await edhaSetOwnerList(owner, "charges", list);
      return list;
    });
    if (!committed) return;
    edhaPostChargesCard(owner);
    edhaPostChargeArmCard(owner, committed[committed.length - 1], committed.length);
  } catch (e) { console.error("Edha Content | set charge failed", e); }
}
/* --- Charge trigger arming + watchers (07-16c, Ben E18 — supersedes the 06-16 "declared text,
 * no auto-hook" ruling: all three declared conditions ARE nameable hooks now). Arm a trigger on
 * the freshly placed Charge; the watchers whisper a Detonate prompt (the same edha-charge-btn
 * machinery) the moment it fires — detonation stays the owner's click, never automatic. */
function edhaPostChargeArmCard(owner, charge, n) {
  if (!charge) return;
  const mk = (kind, label) => `<button type="button" class="edha-charge-arm" data-owner="${owner.uuid}" data-charge="${charge.id}" data-kind="${kind}">${label}</button>`;
  ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>🧨 <strong>Set Charge #${n}</strong> — arm its trigger (for the target-bound arms, TARGET the creature first; the engine prompts you to detonate when it fires):</p>` +
      `${mk("enter", "A creature enters the blast (10 ft)")} ${mk("target-moves", "My TARGET moves")} ${mk("target-damaged", "My TARGET takes damage")} ${mk("manual", "Manual (table call)")}</div>` });
}
async function edhaChargeArmClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.owner); if (!owner) return;
    await edhaOwnerListQueue(owner, "charges", async () => {   // queued RMW (07-26n) — fresh read inside
      const list = foundry.utils.deepClone(edhaGetCharges(owner));
      const ch = list.find(c => c.id === ds.charge); if (!ch) { ui.notifications?.warn("Edha: that Charge is gone (past the cap or detonated)."); return; }
      if (ds.kind === "manual") delete ch.trig;
      else if (ds.kind === "enter") ch.trig = { kind: "enter" };
      else {
        const t = edhaUserTargetToken();
        if (!t?.actor) { ui.notifications?.warn("Edha: target the creature first, then click the arm button."); return; }
        ch.trig = { kind: ds.kind, targetUuid: t.actor.uuid, targetName: t.name };
      }
      await edhaSetOwnerList(owner, "charges", list);   // raw path (§9o trap 3): trig is a NESTED write the H3 ops never touch
      btn.closest(".edha-trigger-card")?.querySelectorAll("button").forEach(b => b.disabled = true);
      btn.textContent += " ✓";
      void edhaMarkCardResolved(edhaMessageIdOf(btn), btn.textContent);   // R-66: persists past F5/second client
    });
  } catch (e) { edhaClickFailed("charge arm", e); }
}
async function edhaChargeTrigFire(owner, chargeId, why) {
  try {
    // Queued RMW (07-26n): one AoE damaging two armed targets fires two of these in the same
    // tick — unserialised, the second write clobbered the first `fired` stamp (H3 race family).
    await edhaOwnerListQueue(owner, "charges", async () => {
      const list = foundry.utils.deepClone(edhaGetCharges(owner));
      const idx = list.findIndex(c => c.id === chargeId); if (idx < 0) return;
      if (!list[idx].trig || list[idx].trig.fired) return;
      list[idx].trig.fired = true;   // one prompt per arm — re-arm from the card if it should watch again
      await edhaSetOwnerList(owner, "charges", list);   // raw path (§9o trap 3)
      ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🧨 <strong>Set Charge trigger</strong>: ${why} — detonate?</p><button type="button" class="edha-charge-btn" data-owner="${owner.uuid}" data-charge="${chargeId}">Detonate #${idx + 1}</button></div>` });
    });
  } catch (e) { console.error("Edha Content | charge trigger fire failed", e); }
}
Hooks.on("updateToken", (doc, changes) => {
  try {
    if (!("x" in changes) && !("y" in changes)) return;
    if (!edhaDefBuffGmGate()) return;   // one watcher
    const moverActor = doc.actor; if (!moverActor) return;
    const gs = doc.parent?.grid?.size || 100, gd = doc.parent?.grid?.distance || 5;
    const w = (doc.width ?? 1) * gs / 2, h = (doc.height ?? 1) * gs / 2;
    const newC = { x: (changes.x ?? doc.x) + w, y: (changes.y ?? doc.y) + h };
    for (const owner of (game.actors ?? [])) {
      const charges = edhaGetCharges(owner); if (!charges.length) continue;
      for (const ch of charges) {
        const trig = ch.trig; if (!trig || trig.fired) continue;
        if (trig.kind === "target-moves" && trig.targetUuid === moverActor.uuid) { void edhaChargeTrigFire(owner, ch.id, `<strong>${trig.targetName}</strong> moved`); continue; }
        if (trig.kind === "enter" && Math.hypot(newC.x - ch.x, newC.y - ch.y) / gs * gd <= (ch.sizeFt || 10)) {
          void edhaChargeTrigFire(owner, ch.id, `<strong>${doc.name}</strong> entered the blast radius`);
        }
      }
    }
  } catch (e) { /* non-fatal */ }
});
// The target-damaged arm is checked from the applyDamage post-pass (edhaChargeDamagedCheck).
async function edhaChargeDamagedCheck(victim) {
  try {
    if (!victim) return;
    if (!edhaDefBuffGmGate()) return;
    for (const owner of (game.actors ?? [])) {
      for (const ch of edhaGetCharges(owner)) {
        if (ch.trig?.kind === "target-damaged" && !ch.trig.fired && ch.trig.targetUuid === victim.uuid) {
          void edhaChargeTrigFire(owner, ch.id, `<strong>${ch.trig.targetName}</strong> took damage`);
        }
      }
    }
  } catch (e) { /* non-fatal */ }
}
function edhaPostChargesCard(owner) {
  const list = edhaGetCharges(owner);
  if (!list.length) return;
  const rows = list.map((c, i) =>
    `<button type="button" class="edha-charge-btn" data-owner="${owner.uuid}" data-charge="${c.id}">Detonate #${i + 1}${c.pinpoint ? " ⊕" : ""}</button>`).join(" ");
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
    content:
      `<div class="edha-burst-card"><p>🧨 <strong>Charges set:</strong> ${list.length} (cap = tier).</p>` +
      `<p style="opacity:.85;font-size:.9em">Declare each Charge's trigger at the table; detonate as a Free Action on your turn. ⊕ = Pinpoint.</p>` +
      `${rows} <button type="button" class="edha-charge-all" data-owner="${owner.uuid}">Detonate ALL</button></div>` });
}

// Core: detonate the given charges, roll/apply damage, run Concussive Yield, drop terrain at each.
async function edhaResolveCharges(owner, charges, { radiusFt = null, bonusFormula = "", ignoreDeflect = false, doubleCaughtFormula = "", doubleCaughtType = "energy", merged = false, mergeFormula = "", label = "Detonation" } = {}) {
  try {
    const scene = canvas?.scene; if (!scene || !charges?.length) { ui.notifications?.info("No active Charges to detonate."); return; }
    const rd = owner.getRollData();
    const allRolls = [], hits = [], lines = [], everyCaught = [];
    const countById = new Map();
    for (const ch of charges) {
      /* The pinpoint rider reads its dials off the ANNOTATING DOCUMENT via the entry's
       * sourceItemUuid (2bY — the Pinpoint correction, the 2bX Inevitable-Snare shape): the extra
       * keen is that item's own damage formula, so editing it in Foundry changes what detonates.
       * A pre-repoint entry without the stamp gets no rider (charges are combat-scoped, so a mixed
       * state is one live combat crossing a deploy). */
      const pinDoc = (ch.pinpoint && ch.sourceItemUuid && typeof fromUuidSync === "function") ? fromUuidSync(ch.sourceItemUuid) : null;
      const sizeFt = radiusFt || ch.sizeFt || 10;
      const caught = edhaEnemyTokensInCircle(owner, ch.x, ch.y, sizeFt);
      for (const t of caught) { countById.set(t.id, (countById.get(t.id) || 0) + 1); everyCaught.push(t); }
      const dice = await edhaRollFormula(rd, (ch.formula || EDHA_CHARGE_DMG) + (bonusFormula || ""));
      allRolls.push(dice);
      const amt = Math.max(0, Math.floor(dice.total));
      for (const t of caught) {
        const a = amt + (ignoreDeflect ? edhaDeflectOf(t.actor) : 0);   // The Unmooring ignores deflect
        hits.push({ actorUuid: t.actor.uuid, amount: a, type: ch.type || "energy", heal: false });
        lines.push(`${t.name}: ${a} ${ch.type || "energy"}${ignoreDeflect && edhaDeflectOf(t.actor) ? " (deflect ignored)" : ""}`);
      }
      if (ch.pinpoint && pinDoc && caught[0]) {   // Pinpoint: extra keen to the primary target, ignoring its deflect
        const pin = await edhaRollFormula(rd, pinDoc.system?.damage?.formula || "(@tier)d6");
        allRolls.push(pin);
        const pa = Math.max(0, Math.floor(pin.total)) + edhaDeflectOf(caught[0].actor);
        hits.push({ actorUuid: caught[0].actor.uuid, amount: pa, type: pinDoc.system?.damage?.type || "keen", heal: false });
        lines.push(`${caught[0].name}: +${pa} ${pinDoc.system?.damage?.type || "keen"} (${pinDoc.name} — ignores deflect)`);
      }
      // Terrain at the marker (bumped formula if a merge talent fired). A Pinpoint's terrain is
      // instead CENTERED on the primary target and tagged to FOLLOW it while it lives (the card:
      // "if the target survives, the dangerous terrain moves with the target for the scene").
      const pin0 = (ch.pinpoint && pinDoc && caught[0]) ? caught[0] : null;
      await edhaDropHazard(owner, scene,
        { type: "circle", x: pin0 ? pin0.center.x : ch.x, y: pin0 ? pin0.center.y : ch.y, radius: edhaFtToPx(sizeFt) },
        merged ? (mergeFormula || EDHA_CHARGE_DMG) : (ch.formula || EDHA_CHARGE_DMG), ch.type || "energy", "red", merged ? "🔥 Merged Hazard" : "🔥",
        pin0 ? { followTokenUuid: pin0.document?.uuid ?? null } : null);
    }
    // Cascading Failure: a foe caught in 2+ detonations takes an extra [Tier][Die].
    if (doubleCaughtFormula) {
      for (const [id, n] of countById) {
        if (n < 2) continue;
        const t = everyCaught.find(x => x.id === id); if (!t) continue;
        const extra = await edhaRollFormula(rd, doubleCaughtFormula);
        allRolls.push(extra);
        // 07-24s: the type was hard-coded "energy". Both shipped consumers still are, so this is a
        // schema field with no behaviour change — it exists because the NEXT one will not be.
        const dcType = doubleCaughtType || "energy";
        hits.push({ actorUuid: t.actor.uuid, amount: Math.max(0, Math.floor(extra.total)), type: dcType, heal: false });
        lines.push(`${t.name}: +${Math.max(0, Math.floor(extra.total))} ${dcType} (caught in ${n} blasts)`);
      }
    }
    // Apply damage (GM direct, else relay), post the summary, then Concussive Yield + cleanup.
    const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (hits.length) { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply detonation damage."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: allRolls,
      content: `<div class="edha-burst-card"><p>💥 <strong>${label}</strong> — ${charges.length} Charge(s)${ignoreDeflect ? " (ignores deflect — GM applies full)" : ""}:</p><p style="font-size:.95em">${lines.length ? lines.join("<br>") : "no creatures caught"}</p>${merged ? `<p style="opacity:.8;font-size:.9em">Dangerous-terrain zones merge into one contiguous hazard (GM treats overlapping zones as one).</p>` : ""}</div>` });
    /* `edha-detonate-react` sweep (2bY — was the name-keyed edhaOwnsTalent rider on the
     * Concussive Yield name; the 2bX edha-snare-react shape): config rules on the OWNER's talents
     * ride every detonation, each with its own save dials. The sweep names no talent. */
    for (const { item: tal, handler: dh } of edhaActorRulesOf(owner, "edha-detonate-react")) {
        const st = String(dh.failStatus || "prone").trim() || "prone";
        await edhaFoeSkillVsColor(owner, everyCaught, {
          skill: dh.skill || "spd", label: dh.skillLabel || null, color: dh.color || "red", sourceName: tal.name,
          failText: edhaConditionLabel(st) || st, okText: "stays up",
          onFail: (t) => edhaToggleStatus(t.actor, st, true) });
    }
    // Remove the detonated charges + their markers (canvas cleanup by hand — §9o trap 3).
    const dets = new Set(charges.map(c => c.id));
    for (const c of charges) { try { void scene.templates?.get(c.templateId)?.delete()?.catch(() => {}); } catch (e) {} }
    // Queued RMW (07-26n): the filter reads inside the queue, so a placement or trigger-arm
    // landing mid-detonation is not clobbered by this commit.
    await edhaOwnerListQueue(owner, "charges", () => edhaSetOwnerList(owner, "charges", edhaGetCharges(owner).filter(c => !dets.has(c.id))));
  } catch (e) { console.error("Edha Content | resolve charges failed", e); }
}
function edhaFtToPx(ft) { const s = canvas?.scene; const gs = s?.grid?.size || 100, gd = s?.grid?.distance || 5; return Math.max(Math.round(gs / 2), Math.round((ft / gd) * gs)); }

async function edhaDetonateOne(ownerUuid, chargeId) {
  const owner = await edhaResolveActorRef(ownerUuid); if (!owner) return;
  const ch = edhaGetCharges(owner).find(c => c.id === chargeId); if (!ch) { ui.notifications?.info("That Charge is already gone."); return; }
  await edhaResolveCharges(owner, [ch], { label: "Detonate Charge" });
  edhaPostChargesCard(owner);
}
async function edhaDetonateAllFree(ownerUuid) {
  const owner = await edhaResolveActorRef(ownerUuid); if (!owner) return;
  await edhaResolveCharges(owner, edhaGetCharges(owner), { label: "Detonate All" });
}
// Button binding: EDHA_CARD_BUTTONS["edha-charge-arm"], ["edha-charge-btn"], ["edha-charge-all"]
// (Job 1, pass 5.3, end of file — the click-btn/all bodies moved there too, since they were inline;
// both GAIN an R-59 outer catch they didn't have before, via edhaClickFailed).

/* --- Destruction dispatch: DELETED 2bY (iron rule 2b) — the preUse takeover and its
 * EDHA_DESTRUCTION_TALENTS Set are gone; every member rides its own document now. Do not re-add:
 *   Set Charge     — `edha-zone {kind: charge}` (system cost, refund-on-cancel, range gate).
 *   Fault Line     — `edha-zone {kind: line}` (save/construct dials as fields).
 *   Pinpoint Charge — H3 `edha-owner-list {op: annotate, list: charges}` (sourceItemUuid stamp;
 *                     the detonate resolver reads the rider off the annotating document).
 *   Combustion Chain — `edha-zone-react {when: defeat-in-zone}` (the defeat sweep reads it).
 *   Walking Ruin   — `edha-place-hazard {mode: trail}` (the move watcher reads it).
 *   Cascading Failure · The Unmooring — H12 `edha-detonate-list` since 07-24s. */

// Fault Line (`edha-zone` kind "line", 2bY — was the takeover case): a click-direction line AoE
// off ITS document's damage, an engine-rolled save (iron rule 3), and a line hazard. The
// system charges the activation cost; a cancelled direction pick REFUNDS it.
// R-5 (2026-09-05, #29): the caught set is edhaTokensInLine — EVERY character in the line except
// the caster — and both riders run on that one set (damage + Construct multiplier, then the
// save/failStatus). The hazard Region dropped afterwards is untouched (that scope is R-6, open).
async function edhaFaultLine(item, h) {
  try {
    const owner = item.actor; if (!owner) return;
    const scene = canvas?.scene;
    if (!scene) { edhaRefundCost(item); ui.notifications?.warn(`Edha: need an active scene for ${item.name} — cost refunded.`); return; }
    const tok = edhaCasterToken(owner);
    if (!tok) { edhaRefundCost(item); ui.notifications?.warn(`Edha: drop/select your token first — cost refunded.`); return; }
    const cx = tok.center.x, cy = tok.center.y;
    const lengthFt = Number(h.lengthFt) > 0 ? Number(h.lengthFt) : 60, widthFt = Number(h.widthFt) > 0 ? Number(h.widthFt) : 5;
    const pt = await edhaPickPoint(`Click the direction the ${item.name} runs (${lengthFt} ft from you).`);
    if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return; }
    const caught = edhaTokensInLine(owner, cx, cy, pt.x, pt.y, lengthFt, widthFt);   // R-5: every character in the line but the caster
    const rd = owner.getRollData();
    const dice = await edhaRollFormula(rd, item.system?.damage?.formula || EDHA_CHARGE_DMG);
    const amt = Math.max(0, Math.floor(dice.total));
    const dtype = item.system?.damage?.type || "energy";
    const mult = Number(h.constructMult) > 1 ? Number(h.constructMult) : 3;
    const hits = caught.map(t => ({ actorUuid: t.actor.uuid, amount: edhaIsConstruct(t.actor) ? amt * mult : amt, type: dtype, heal: false }));   // structures/Constructs take the multiplier
    const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (hits.length) { if (!game.users?.activeGM) ui.notifications?.warn(`Edha: a GM must be online to apply ${item.name}.`); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
    // Line dangerous terrain: a rotated rectangle, one end at the caster, running toward the click.
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    const lenPx = Math.round((lengthFt / gd) * gs), wPx = Math.round((widthFt / gd) * gs);
    const ang = Math.atan2(pt.y - cy, pt.x - cx), angleDeg = ang * 180 / Math.PI;
    const ccx = cx + Math.cos(ang) * lenPx / 2, ccy = cy + Math.sin(ang) * lenPx / 2;   // line centre
    /* R-6 (Ben 2026-09-06 (b)) — the Region spares the CASTER and nobody else, matching R-5 / item
     * 29 on the line half so both halves of the talent follow one rule. Of the two exits Ben left
     * open, this takes the SECOND (exempt the caster's token) and keeps the rectangle exactly the
     * line that was just damaged: laying it a square out would make the terrain's footprint and the
     * damaged line disagree — a creature at the far end of the line would stand on no terrain, or
     * terrain would cover ground nothing was damaged on. The footprint on the map stays honest
     * (that square IS dangerous, to everyone but the one who split it open); only the caster is
     * immune, which is a property of the caster, not of the ground. Allies inside are still caught,
     * and the ally-in-the-line burst + terrain double hit stays. */
    await edhaDropHazard(owner, scene, { type: "rectangle", x: ccx - lenPx / 2, y: ccy - wPx / 2, width: lenPx, height: wPx, rotation: angleDeg },
      item.system?.damage?.formula || EDHA_CHARGE_DMG, dtype, h.color || "red", `🔥 ${item.name}`, null, owner.uuid);
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: [dice],
      content: `<div class="edha-burst-card"><p>💥 <strong>${item.name}</strong> — ${caught.length} in the line take <strong>${amt}</strong> ${dtype} (Constructs ×${mult}). Structures take ×${mult} too (GM-side, no actor for a wall).</p></div>` });
    const st = String(h.failStatus || "prone").trim() || "prone";
    await edhaFoeSkillVsColor(owner, caught, { skill: h.saveSkill || "spd", label: h.saveLabel || null, color: h.saveColor || "red",
      sourceName: item.name, failText: edhaConditionLabel(st) || st, okText: "stays up", onFail: (t) => edhaToggleStatus(t.actor, st, true) });
  } catch (e) { console.error("Edha Content | Fault Line failed", e); }
}

// Terrain TRAIL (`edha-place-hazard` mode "trail", 2bY — was the name-keyed Walking Ruin gate):
// while the owner's trail toggle is on, drop a small dangerous-terrain patch where the token was.
// The move watcher was always flag-driven; only the name gate moved onto data — the formula, type
// and colour now ride the rule, so editing the talent in Foundry changes what the trail burns.
function edhaTrailRuleOf(actor) {
  for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-place-hazard")) {
    if (h.mode === "trail") return { item: tal, handler: h };
  }
  return null;
}
/* The prior centre comes off the SHARED `options.edhaPrevPos` stamp (see "SHARED TOKEN-MOVE STAMP").
 * It used to come off `tokenDoc._edhaPrevCenter`, written by this block's own `preUpdateToken` hook
 * — and since `pre*` hooks run only on the INITIATING client while the drop below is gated to the
 * single activeGM applier, a PLAYER moving their own token stamped their copy of the document and
 * the GM read null: nought regions, no error, for the whole life of the talent (bench run 30 caught
 * it with a matched control — player move → 0 patches, activeGM move → 3). The `"x" in changes`
 * guard went with it: the stamp already answers "was this a move?", and one question deserves one
 * answer. */
Hooks.on("updateToken", (tokenDoc, changes, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // ONE applier — avoid a per-client double-drop
    const prev = edhaPrevTokenCenter(tokenDoc, options); if (!prev) return;
    const actor = tokenDoc.actor; if (!actor) return;
    if (!actor.getFlag("edha-content", "hazardTrail") && !actor.getFlag("edha-content", "walkingRuin")) return;   // walkingRuin = pre-2bY saves
    const rule = edhaTrailRuleOf(actor); if (!rule) return;
    const scene = tokenDoc.parent ?? canvas?.scene; if (!scene) return;
    // one patch per move step, at the vacated square; skip if a trail patch is already there
    const near = (scene.regions ?? []).some(r => edhaTerrainOwnerUuid(r) === actor.uuid
      && (r.shapes ?? []).some(s => s.type === "circle" && Math.hypot((s.x ?? 0) - prev.x, (s.y ?? 0) - prev.y) < (scene.grid?.size || 100) / 2));
    if (near) return;
    void edhaDropHazard(actor, scene, { type: "circle", x: prev.x, y: prev.y, radius: Math.round((scene.grid?.size || 100) / 2) },
      rule.handler.damageFormula || EDHA_CHARGE_DMG, rule.handler.damageType || "energy", rule.handler.color || "red", "🏚️");
  } catch (e) { console.error("Edha Content | trail move-terrain failed", e); }
});

// Pinpoint Charge: terrain tagged followTokenUuid recenters on the primary target as it moves —
// "if the target survives, the dangerous terrain moves with the target" (a downed target stops
// carrying the blaze; the Region stays where it fell). Was backlog; wired 2026-07-04.
Hooks.on("updateToken", (tokenDoc, changes) => {
  try {
    if (!(("x" in changes) || ("y" in changes))) return;
    if (!edhaDefBuffGmGate()) return;   // ONE applier
    const scene = tokenDoc.parent ?? canvas?.scene; if (!scene) return;
    if ((Number(tokenDoc.actor?.system?.resources?.hea?.value) || 0) <= 0) return;
    for (const region of (scene.regions ?? [])) {
      if (region.getFlag?.("edha-content", "followTokenUuid") !== tokenDoc.uuid) continue;
      void edhaRecenterTerrain(scene, region, tokenDoc);
    }
  } catch (e) { console.error("Edha Content | Pinpoint terrain-follow failed", e); }
});
async function edhaRecenterTerrain(scene, region, tokenDoc) {
  try {
    const gs = scene.grid?.size || 100;
    const cx = Math.round(tokenDoc.x + ((tokenDoc.width || 1) * gs) / 2);
    const cy = Math.round(tokenDoc.y + ((tokenDoc.height || 1) * gs) / 2);
    // SOURCE objects (edhaRegionShapes): mutating region.shapes' live DataModels writes NOTHING —
    // the Drawing would follow the token while the Region stayed put, the bench-run-26 family.
    const shapes = edhaRegionShapes(region);
    const c = shapes.find(s => s.type === "circle" && !s.hole); if (!c) return;
    c.x = cx; c.y = cy;
    await region.update({ shapes });
    const draw = (scene.drawings ?? []).find(d => d.getFlag?.("edha-content", "hazardVisual")?.regionId === region.id);
    if (draw) await draw.update({ x: cx - (Number(c.radius) || 0), y: cy - (Number(c.radius) || 0) });   // the grow-terrain visual-sync shape
  } catch (e) { console.error("Edha Content | terrain recenter failed", e); }
}

/* --- Pyre — "at the end of each of your turns, the dangerous terrain spreads to one adjacent
 * flammable square" (was backlog; wired 2026-07-04). End-of-the-owner's-turn detection = the
 * Bone-Garden combat.previous shape; the spread itself = the Spreading-Roots +5 ft Region-grow
 * (edhaGrowTerrain), fired from a whispered confirm card so "flammable" stays GM-judged — the
 * radius grow over-covers a single square, so the GM treats non-flammable directions as unburned
 * (the zone-merge convention). The confirm is FREE (data-edha-free — no Investiture). ------------- */
// 2bY: the EDHA_PYRE_SOURCES alias list is GONE — which hazards spread is DATA. An
// `edha-place-hazard` rule with `spreads: true` stamps its Regions at placement, and this watcher
// keys on the stamp, so Pyre and the Cinderbrock's Fire the Wrack (ruling 98) both ride it via
// their own rules and a rename changes nothing. ⚑ a Region placed BEFORE the 2bY deploy carries
// no stamp and stops prompting (scene-long Regions can outlive a deploy — re-place it).
async function edhaPyreTurnEnd(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const prevTurn = combat.previous?.turn; if (prevTurn == null) return;
    const actor = combat.turns?.[prevTurn]?.actor;
    if (!actor) return;
    const scene = canvas?.scene; if (!scene) return;
    // Owner membership goes through the SPINE (07-27s) — this watcher used to be the only reader of
    // the flat `sourceOwnerUuid` its placer wrote, which is what kept the vocabulary split alive.
    const zones = edhaOwnedTerrainRegions(actor, scene).filter(r => r.getFlag?.("edha-content", "spreads") === true);
    for (const region of zones) {
      // 07-12 rework (Ben): expansion is SQUARE-BY-SQUARE and the GM picks the square, so the
      // confirm card whispers to the GM; the owner also gets an Extinguish control on the card
      // ("turn off this magic fire before it burns the building down with us inside").
      const label = region.getFlag?.("edha-content", "sourceItem") || "Blaze";   // sourceItem is stamped DATA (the placing item's name)
      const gmIds = edhaGmIds({ activeOnly: true });   // R-62: action-prompt (Spread/Extinguish need a live click) → active GMs only, was all GMs (🤖 bench row: audience flip)
      ChatMessage.create({
        whisper: [...new Set([...gmIds, ...edhaWhisperIds(actor)])], speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div class="edha-trigger-card"><p>🔥 <strong>${label}</strong> — end of ${actor.name}'s turn: the blaze spreads to one adjacent <em>flammable</em> square (GM judges flammability; non-flammable directions stay unburned).</p>`
          + `<button type="button" class="edha-spread-sq-btn" data-edha-scene="${scene.id}" data-edha-region="${region.id}" data-edha-label="${label}">Spread — GM clicks the square it burns into</button>`
          + `<button type="button" class="edha-extinguish-btn" data-edha-scene="${scene.id}" data-edha-region="${region.id}" data-edha-label="${label}">Extinguish (put the fire out)</button></div>`,
      });
    }
  } catch (e) { console.error("Edha Content | Pyre spread failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaPyreTurnEnd(combat); });

// Ignite-spread reaction-card button: spread the owner's zones (GM-positioned). The talent name
// and spread distance ride the button's dataset — the binder names no talent (2bY).
// Button binding: EDHA_CARD_BUTTONS["edha-combustion"] (Job 1, pass 5.3, end of file — the click body
// moved there too, since it was inline; it GAINS an R-59 outer catch it didn't have before).

/* `edha-zone-react {when: defeat-in-zone}` AUTO-fire (2bY — was the name-keyed
 * edhaCharacterOwnersOf("Combustion Chain") sweep): a foe drops to 0 HP inside an owner's
 * dangerous terrain → each of that owner's defeat-in-zone rules ignites a fresh hazard on the
 * body and offers the zone-spread card. Radius, spread distance, formula and type ride the rule;
 * the sweep announces (edhaWatchersOfRule) and names no talent.
 * ONE APPLIER (07-27q): found by the sweep behind bench run 13's double-posted dissipates card, and
 * worse than that one — a raw isGM here made every connected GM both post the card AND drop its own
 * copy of the hazard Region. */
Hooks.on("updateActor", async (actor, changes) => {
  try {
    if (!edhaDefBuffGmGate() || actor.type === "character") return;
    const hp = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (hp === undefined || hp > 0) return;
    const tok = edhaCasterToken(actor); if (!tok) return;
    for (const w of edhaWatchersOfRule("edha-zone-react")) {
      const h = w.handler; if (h?.when !== "defeat-in-zone" || w.actor?.type !== "character") continue;
      const owner = w.actor;
      if (!edhaTokenInOwnedTerrain(tok, owner)) continue;            // only if the body fell in THIS owner's terrain
      const scene = tok.scene ?? canvas?.scene;
      const igniteFt = Number(h.igniteRadiusFt) > 0 ? Number(h.igniteRadiusFt) : 10;
      const spreadFt = Number(h.spreadFt) > 0 ? Number(h.spreadFt) : 5;
      await edhaDropHazard(owner, scene, { type: "circle", x: tok.center.x, y: tok.center.y, radius: edhaFtToPx(igniteFt) },
        h.damageFormula || EDHA_CHARGE_DMG, h.damageType || "energy", h.color || "red", `🔥 ${w.item.name}`);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🔥 <strong>${w.item.name}</strong> (${owner.name}): ${actor.name} fell in your dangerous terrain — a ${igniteFt} ft zone ignites on the body. Your existing zones each spread ${spreadFt} ft.<button type="button" class="edha-combustion" data-owner="${owner.uuid}" data-label="${w.item.name}" data-spread="${spreadFt}" data-ignite="${igniteFt}" style="display:block;margin-top:4px">Spread your zones ${spreadFt} ft (GM grows the Regions)</button></p></div>` });
    }
  } catch (e) { console.error("Edha Content | ignite-spread auto-fire failed", e); }
});

// Socket: GM-side line/circle hazard placement for players (mirrors burst-apply).
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      try {
        if (!edhaDefBuffGmGate()) return;
        if (data?.action !== "place-hazard-region") return;
        const p = data.payload || {}; const scene = game.scenes?.get(p.sceneId);
        const owner = await edhaResolveActorRef(p.ownerUuid);
        if (scene && owner) await edhaPlaceHazardRegionGM(scene, owner, p.shape, p.baked, p.type, p.color, p.label, p.extraFlags ?? null, p.exemptActorUuid ?? "");   // R-6 rides the relay too
      } catch (e) { console.error("Edha Content | place-hazard-region relay failed", e); }
    });
  } catch (e) {}
});

// Scene / combat end: fizzle Charges, clear markers, and reset the once-per-scene + trail flags.
// R-60: population moves from "characters only" to edhaSceneReset's directory∪tokens dedup — a
// summon/adversary carrying one of these keys (rare, never authored today) now clears too, same as
// every other family. Flag list is verbatim. The un-attributable-template cleanup is NOT per-actor
// (a charge template carries no owner) so it stays a bespoke top-level step, gated on the SAME
// guard edhaSceneReset computes internally — deleteCombat hooks fire synchronously up to the first
// await, so this second edhaCombatEndGuard(endedCombat) call reads identical game state.
async function edhaClearCharges(endedCombat) {
  try {
    await edhaSceneReset(endedCombat, {
      key: "charges",
      flags: ["lists.charges", "charges", "unmooringUsed", "detonateUsed", "hazardTrail", "walkingRuin"],
    });
    // Un-attributable world props: a charge template carries no owner, so it cannot be tested
    // against the guard. While another combat is still running, leave them ALL alone — a stale
    // template is a visible, hand-deletable nuisance; deleting a live encounter's is not.
    const guard = edhaCombatEndGuard(endedCombat);
    if (!guard.size) for (const scene of game.scenes ?? []) {
      const stale = (scene.templates ?? []).filter(t => t.getFlag?.("edha-content", "charge"));
      if (stale.length) await scene.deleteEmbeddedDocuments("MeasuredTemplate", stale.map(t => t.id));
    }
  } catch (e) { console.error("Edha Content | clear charges failed", e); }
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

