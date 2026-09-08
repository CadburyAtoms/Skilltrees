/* ============================================================================================
 * BURST EXECUTION + THE GM SOCKET RELAY — the last section before the DESTRUCTION banner, and
 * the end of the cross-tree run that began at the defence buffs.
 * The burst lifecycle: edhaCastBurst drops a draggable template and posts the Detonate card →
 * edhaBurstDetonate captures every token under the template at its REAL dragged position and
 * rolls the payload → edhaApplyBurstResults writes it. edhaBurstCancel refunds through the
 * section above. edhaBurstSpecFromCfg builds a spec from an authored `events` rule, which is how
 * a document-driven talent reaches this machinery without the engine knowing its name.
 *
 * ⚠️ EDHA_SOCKET_ACTIONS is the file-wide GM RELAY TABLE — the single dispatch every
 * player→GM operation in the engine goes through (damage/heal writes, summon creation, region
 * placement, cross-actor item creation). A player cannot write another actor, so anything that
 * must is registered here and invoked over the module socket, applied by exactly one GM. Adding
 * a cross-actor write means adding an action to THIS table, not opening a second channel.
 * Owns: edhaCastBurst · edhaBurstDetonate · edhaBurstCancel · edhaApplyBurstResults ·
 *   EDHA_SOCKET_ACTIONS + its `ready` socket registration · edhaBurstSpecFromCfg, and the two
 *   preUseItem interceptors that route a burst-flagged talent into this flow.
 * ============================================================================================ */

// Drop a draggable [Size] template + a range ring, then post the Detonate card.
async function edhaCastBurst(item, spec) {
  try {
    const actor = item?.actor; const scene = canvas?.scene;
    if (!actor) return;
    if (!scene) { ui.notifications?.warn("Edha: need an active scene to place a burst."); return; }
    const color = spec.color || edhaTalentColor(item) || "red";
    const rank = edhaColorRank(actor, color);
    const area = spec.area || {};
    const sizeFt = area.sizeByRank ? (EDHA_SIZE_FT[rank] || EDHA_SIZE_FT[1]) : (Number(area.sizeFt) || EDHA_SIZE_FT[1]);
    const b = spec.burst || {};
    const rangeFt = b.rangeByRank ? (EDHA_ATTUNE_FT[rank] || EDHA_ATTUNE_FT[1]) : (Number(b.rangeFt) || EDHA_ATTUNE_FT[rank] || 60);
    const hex = EDHA_COLOR_HEX[color] || "#d23b2e";
    if (!edhaConsumeCost(item)) return;
    // Show the Attunement Range boundary in a DISTINCT pale-blue (so it doesn't blend with the red
    // burst), then CLICK to place the burst point — no dragging or Templates-layer switching needed.
    const tok = edhaCasterToken(actor);
    const ox = tok?.center?.x ?? (scene.dimensions?.width ?? 1000) / 2;
    const oy = tok?.center?.y ?? (scene.dimensions?.height ?? 1000) / 2;
    let ring = null;
    try { ring = await edhaDrawCircle(ox, oy, rangeFt, EDHA_RANGE_RING_HEX, 0); } catch (e) {}
    const pt = await edhaPickPoint(`Click the ${item.name} burst center (right-click to cancel). Attunement Range ${rangeFt} ft.`);
    if (!pt) { try { if (ring && scene.templates?.get(ring.id)) void ring.delete()?.catch(() => {}); } catch (e) {} edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return; }
    const [tpl] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: pt.x, y: pt.y, distance: sizeFt, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, flags: { "edha-content": { burst: item.name } },
    }]);
    const pid = foundry.utils.randomID();
    EDHA_BURST_PENDING[pid] = { itemUuid: item.uuid, templateId: tpl?.id, ringId: ring?.id, spec, sizeFt, color };
    const affects = spec.affects || "enemies";
    const verb = affects === "allies" ? "heal" : (affects === "none" ? "drop terrain on" : "hit");
    const saveTxt = b.save ? ` Enemies auto-roll Athletics vs your ${(b.save.vs || color).toUpperCase()} for half.` : "";
    const termTxt = b.terrain ? " Leaves dangerous terrain (GM-side)." : "";
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content:
        `<div class="edha-burst-card">` +
        `<p>\u{1F4A5} <strong>${item.name}</strong> — ${sizeFt} ft burst (Attunement Range ${rangeFt} ft).</p>` +
        `<p style="opacity:.85;font-size:.9em">Burst placed — click Detonate to ${verb} everyone inside.${saveTxt}${termTxt} (Cancel refunds &amp; lets you re-place.)</p>` +
        `<button type="button" class="edha-burst-btn" data-edha-burst="${pid}">Detonate ${item.name}</button> ` +
        `<button type="button" class="edha-burst-cancel" data-edha-burst="${pid}">Cancel (refund)</button>` +
        `</div>`,
    });
  } catch (e) { console.error("Edha Content | cast burst failed", e); }
}

// Resolve a placed burst: capture tokens under the template, roll, apply, drop terrain, clean up.
async function edhaBurstDetonate(pid, messageId = null) {
  const P = EDHA_BURST_PENDING[pid];
  if (!P) { ui.notifications?.info("That burst was already resolved."); void edhaMarkCardResolved(messageId, "Detonated ✓"); return; }
  delete EDHA_BURST_PENDING[pid];   // claim immediately so a double-bound click can't resolve twice
  try {
    const scene = canvas?.scene;
    const item = await fromUuid(P.itemUuid).catch(() => null);
    const actor = item?.actor;
    const tplDoc = scene?.templates?.get(P.templateId);
    if (!actor || !tplDoc) { ui.notifications?.warn("Edha: burst template missing — re-cast the talent."); delete EDHA_BURST_PENDING[pid]; return; }
    const cx = tplDoc.x, cy = tplDoc.y;
    const spec = P.spec; const b = spec.burst || {}; const affects = spec.affects || "enemies"; const sizeFt = P.sizeFt;
    const casterDisp = edhaActorSide(actor);
    let caught = edhaTokensInCircle(cx, cy, sizeFt, null);
    if (affects === "enemies") caught = caught.filter(t => edhaSideHostile(t.document?.disposition, casterDisp));
    else if (affects === "allies") caught = caught.filter(t => edhaSideSame(t.document?.disposition, casterDisp));
    else if (affects === "none") caught = [];
    const rd = actor.getRollData();
    const rolls = []; const lines = []; const hits = [];
    const dmgF = item.system?.damage?.formula || "0";
    const dtype = item.system?.damage?.type || "energy";

    if (b.heal) {
      const hr = await edhaRollFormula(rd, dmgF);
      rolls.push(hr);
      const amt = Math.max(0, Math.floor(hr.total));
      /* R-83 (a) — ANSWERED 2026-09-07 (Ben, "a"), item 70. A burst heal is a HEAL, so the
       * No-Healing / Healing-Halved mark applies to every token it catches. The gate goes HERE, in
       * the emitter, PER TARGET — never in edhaApplyBurstResults, which must stay ungated because
       * Raise Dead's stabilising `{amount: 1, heal: true}` hit rides that same path (R-10 (3): a
       * floor against death is not regaining). Gating the writer instead of the emitter would turn
       * "cannot regain HP" into "cannot be saved". A blocked target contributes NO hit at all — the
       * relay leg never sees it — and its line names the mark instead of printing a number. */
      for (const t of caught) {
        const got = edhaHealCutGate(t.actor, amt);
        if (got > 0) hits.push({ actorUuid: t.actor.uuid, amount: got, type: "heal", heal: true });
        lines.push(edhaHealLine(t.actor, amt, got, n => `${t.name}: +${n} HP (capped at max)`) || `${t.name}: +0 HP (capped at max)`);
      }
    } else if (affects !== "none") {
      const dice = await edhaRollFormula(rd, dmgF);
      rolls.push(dice);
      let mod = 0;
      const skillModVal = b.addSkillMod ? edhaEvalSync(`@skills.${b.addSkillMod}.mod`, rd) : 0;   // match the system's full-hit skill mod
      mod += skillModVal;
      // Riders (Kindle etc.) — evaluated per part so the card can SAY which talent added what
      // (Ben pass 3: Set Charge's total was opaque; "how can I tell if Kindle is applied?").
      const riderVals = edhaRiderParts(item, actor)
        .map(rp => ({ name: rp.name, val: Math.floor(edhaEvalSync(rp.formula, rd)) }))
        .filter(r => Number.isFinite(r.val) && r.val !== 0);
      for (const r of riderVals) mod += r.val;
      const full = Math.max(0, Math.floor(dice.total) + mod);
      lines.push(`= ${dice.total} (${dice.formula})${skillModVal ? ` + ${skillModVal} (${b.addSkillMod})` : ""}${riderVals.map(r => ` + ${r.val} (${r.name})`).join("")} → <strong>${full} ${dtype}</strong>`);
      let dc = null;
      if (b.save) { const dcRoll = await new Roll(`1d20 + @skills.${b.save.vs || P.color}.mod`, rd).evaluate(); rolls.push(dcRoll); dc = dcRoll.total; }
      for (const t of caught) {
        let amt = full, note = "";
        if (b.save) {
          const sv = await edhaRollFormula(t.actor, `1d20 + @skills.${b.save.skill || "ath"}.mod`);
          const saved = sv.total >= dc; if (saved) amt = Math.floor(full / 2);
          note = ` (save ${sv.total} vs ${dc} → ${saved ? "half" : "full"})`;
        }
        hits.push({ actorUuid: t.actor.uuid, amount: amt, type: dtype, heal: false });
        lines.push(`${t.name}: ${amt} ${dtype}${note}`);
      }
    }

    const terrain = b.terrain ? { sceneId: scene.id, x: cx, y: cy, sizeFt, color: P.color, formula: dmgF, type: dtype === "heal" ? "energy" : dtype, casterActorUuid: actor.uuid } : null;
    if (terrain) lines.push("(dangerous terrain placed)");

    const verb = b.heal ? "healed" : (affects === "none" ? "" : "hit");
    const body = lines.length ? lines.join("<br>") : (affects === "none" ? "terrain placed." : "no creatures under the burst.");
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), rolls, content: `<div class="edha-burst-card"><p>\u{1F4A5} <strong>${item.name}</strong> ${verb}:</p><p style="font-size:.95em">${body}</p></div>` });
    if (affects !== "none") edhaCheckMultiHit(actor, item, caught.length);   // Flashpoint-style 2+-hit prompt
    void edhaMarkCardResolved(messageId, "Detonated ✓");   // persist the spent state ON the card (survives refresh)
    // Privileged writes (apply damage/heal to GM-owned tokens, drop terrain Regions): do them directly
    // if we are the GM, otherwise relay to the GM's client via socket so PLAYERS can Detonate too.
    const payload = { hits, terrain, casterActorUuid: actor.uuid };
    if (game.user?.isGM) { await edhaApplyBurstResults(payload); }
    else if (hits.length || terrain) {
      if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply burst damage/terrain.");
      try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) { console.error("Edha Content | burst socket emit failed", e); }
    }
    try { const t = scene.templates?.get(P.templateId); if (t) await t.delete().catch(() => {}); } catch (e) {}
    try { const r = scene.templates?.get(P.ringId); if (r) await r.delete().catch(() => {}); } catch (e) {}
    delete EDHA_BURST_PENDING[pid];
  } catch (e) { console.error("Edha Content | burst detonate failed", e); }
}
function edhaBurstCancel(pid) {
  const P = EDHA_BURST_PENDING[pid]; if (!P) return;
  const scene = canvas?.scene;
  try { void scene?.templates?.get(P.templateId)?.delete()?.catch(() => {}); } catch (e) {}
  try { void scene?.templates?.get(P.ringId)?.delete()?.catch(() => {}); } catch (e) {}
  fromUuid(P.itemUuid).then(item => { if (item) edhaRefundCost(item); }).catch(() => {});
  delete EDHA_BURST_PENDING[pid];
  ui.notifications?.info("Burst canceled — cost refunded.");
}
// Privileged writes for a resolved burst — runs on a GM client (directly when the caster IS the GM, or
// via the socket relay when a player detonates). Applies pre-rolled damage/heal and drops terrain.
async function edhaApplyBurstResults(payload) {
  try {
    const p = payload || {};
    const caster = await edhaResolveActorRef(p.casterActorUuid);   // pass as edhaSource so the Kindle-light wrapper can attribute it
    for (const h of (p.hits || [])) {
      const target = await edhaResolveActorRef(h.actorUuid);            // accept an Actor (or, defensively, a token doc)
      if (!target?.update) continue;
      if (h.heal) {
        const cur = Number(target.system?.resources?.hea?.value) || 0;
        const max = Number(target.system?.resources?.hea?.max?.value) || (cur + h.amount);
        await edhaResourceWrite(target, "hea", { value: Math.min(max, cur + h.amount) }, edhaBookkeepingTag("burst heal"));
      } else {
        try { await target.applyDamage([{ amount: h.amount, type: h.type }], { chatMessage: false, edhaSource: caster }); } catch (e) { console.error("Edha Content | burst applyDamage failed", e); }
      }
    }
    const tr = p.terrain;
    if (tr) {
      const scene = game.scenes?.get(tr.sceneId);
      const caster = await edhaResolveActorRef(tr.casterActorUuid);
      if (scene && caster) {
        if (tr.color === "green") {           // Green = ENFORCED difficult terrain (+Thorn Field keen if owned)
          await edhaCreateGreenTerrain(caster, scene, tr.x, tr.y, tr.sizeFt);
        } else {                              // Red/other = dangerous terrain (damage on enter), now owner-tagged
          const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
          const radiusPx = Math.max(Math.round(gs / 2), Math.round((tr.sizeFt / gd) * gs));
          const baked = edhaFoldDieMath(Roll.replaceFormulaData(tr.formula || "(@tier)d6", caster.getRollData(), { missing: "0" }));
          const [trRegion] = await scene.createEmbeddedDocuments("Region", [{
            name: `${caster.name} — Dangerous Terrain`, color: EDHA_COLOR_HEX[tr.color] || "#d23b2e",
            shapes: [{ type: "circle", x: tr.x, y: tr.y, radius: radiusPx, hole: false }],
            behaviors: [{ type: "edha-content.hazard", name: "Dangerous Terrain", system: { damageFormula: baked, damageType: tr.type || "energy", sourceName: `Dangerous Terrain — ${caster.name}` } }],
            flags: { "edha-content": { hazard: true, scope: "scene", terrain: { ownerUuid: caster.uuid, color: tr.color } } },
          }]);
          if (trRegion) await edhaHazardVisual(scene, tr.x, tr.y, radiusPx, EDHA_COLOR_HEX[tr.color] || "#d23b2e", trRegion.id, "🔥");
        }
      }
    }
  } catch (e) { console.error("Edha Content | apply burst results failed", e); }
}
/* ENGINE PASS 5.2 (Job 3): the socket relay's 22-branch `if (data?.action === "X") { ... return; }`
 * chain becomes an {action: handler} table — same dispatch a player's client already builds
 * (game.socket.emit({ action, payload })), just addressed by lookup instead of a sequential string
 * compare. Every handler body is copied verbatim (only the trailing `return;` is dropped, since the
 * table's own `if (handler) await handler(...)` in the socket.on callback below is the new "then
 * stop" — no branch here does anything AFTER its own return). Actor refs already went through
 * edhaResolveActorRef in Job 3's mechanical pass above; kept exactly as each branch resolved them. */
const EDHA_SOCKET_ACTIONS = {
  "burst-apply": async (payload) => { await edhaApplyBurstResults(payload); },
  "cae-flag": async (payload) => { await edhaCaeApplyGM(payload); },                 // players lack combatant-write perms (Combat is GM-owned)
  "foundation-place": async (payload) => { await edhaFoundationPlace(payload); },    // players lack DRAWING_CREATE
  "summon-actor": async (payload) => { await edhaSummonCreateGM(payload); },         // players lack ACTOR_CREATE — spec baked owner-side
  "create-item": async (payload) => {                            // injury tool → add an Item GM-side (inverse of delete-item)
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    if (a && p.itemData) await edhaCreateItemDocs(a, p.itemData);
  },
  "toggle-status": async (payload) => {
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    if (a?.toggleStatusEffect) await a.toggleStatusEffect(p.statusId, { active: p.active !== false });
  },
  "apply-status-mark": async (payload) => {
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    if (!a) return;
    if (a.toggleStatusEffect) await a.toggleStatusEffect(p.statusId, { active: true });
    if (p.mark) await a.setFlag("edha-content", `markedBy.${p.statusId}`, p.mark);
    if (p.combatExpire) { try { await a.setFlag("edha-content", `combatExpire.${p.statusId}`, true); } catch (e) {} }
  },
  "set-flag": async (payload) => {                              // cross-actor flag write (e.g. plot-die grant onto an ally)
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    if (a && p.key) await a.setFlag("edha-content", p.key, p.value);
  },
  "apply-timed-status": async (payload) => {                     // status + owner-relative expiry (Disoriented)
    const p = payload || {};
    const t = await edhaResolveActorRef(p.targetUuid);
    if (!t?.toggleStatusEffect) return;
    await t.toggleStatusEffect(p.statusId, { active: true });
    if (p.expire) {
      const eff = [...(t.effects ?? [])].find(e => e.statuses?.has?.(p.statusId));
      let who = t;
      if (p.expire === "owner" && p.ownerUuid) { who = (await edhaResolveActorRef(p.ownerUuid)) ?? t; }
      const cbt = edhaInActiveCombat(who);   // R-4/#28a: the reference creature's OWN combat
      const ti = cbt?.started ? edhaCombatantTurnIndex(cbt, who) : -1;
      if (eff && ti >= 0) await eff.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(cbt, ti));
      else if (eff) {   // relay half of the same catch-up intent (see edhaApplyTimedStatus)
        try { await eff.unsetFlag("edha-content", "expireAfter"); } catch (x) {}
        await eff.setFlag("edha-content", "timedExpire", { expire: p.expire, ownerUuid: p.ownerUuid ?? null });
      }
    }
  },
  "move-token": async (payload) => {                             // GM-applied forced movement (Red push pilot)
    const p = payload || {};
    const td = await fromUuid(p.tokenUuid).catch(() => null);
    // Socket options don't ride the emit — re-stamp edhaForced on the GM-side write (this relay
    // only ever carries engine-driven moves). Order's violation watcher + Dread Presence's veto read it.
    const mvOpts = p.hostile ? { edhaForced: true, edhaHostileMove: true } : { edhaForced: true };
    if (p.teleport && typeof td?.move === "function") { await td.move({ x: p.x, y: p.y, action: "displace" }, mvOpts); return; }
    if (td?.update) await td.update({ x: p.x, y: p.y }, { animate: !p.teleport, teleport: !!p.teleport, ...mvOpts });
  },
  "remove-terrain": async (payload) => {                         // player extinguish (07-12 region rework)
    const p = payload || {};
    try { await game.scenes?.get(p.sceneId)?.regions?.get(p.regionId)?.delete(); } catch (e) {}
  },
  "set-resource": async (payload) => {                           // cross-actor resource write (Shatter Focus)
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    // #28b: a relayed write is ALWAYS an engine write caused by a player-facing action — the only
    // emitter is edhaDrainFocus's unowned-target branch, so the relay half must classify itself
    // exactly as the direct half does. R-72 (2026-09-06) made that classification BOOKKEEPING, not
    // a spend: leaving the spend stamp here would mean an Edict-bound creature drained by a player
    // who does not own it STILL gets a violation prompt while the owned case goes quiet — the very
    // asymmetry #28b stamped this site to close. The two halves move together, always.
    if (a && p.path) await a.update({ [p.path]: p.value }, edhaBookkeepingTag("set-resource relay (involuntary drain)"));
  },
  "rewrite-roll": async (payload) => {                           // Voice of Authority / Bound by Word — change a rendered roll's total
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    const msg = edhaFindRecentRollMessage(a, p.oldTotal);
    if (msg) await edhaApplyRollRewrite(msg, p.newTotal, p.noteHtml);
  },
  "green-terrain": async (payload) => {                          // player Green Draw Mana → drop enforced terrain GM-side
    const p = payload || {};
    const scene = game.scenes?.get(p.sceneId);
    const owner = await edhaResolveActorRef(p.ownerUuid);
    const srcItem = p.itemUuid ? await fromUuid(p.itemUuid).catch(() => null) : null;
    if (scene && owner) await edhaCreateGreenTerrain(owner, scene, p.cx, p.cy, p.sizeFt, srcItem);
  },
  "grow-terrain": async (payload) => {                           // Spreading Roots expand → GM-side Region update
    const p = payload || {};
    await edhaGrowTerrain(p.sceneId, p.regionId, p.sizeFt);
  },
  "delete-item": async (payload) => {                            // Reknit Form → remove an injury Item GM-side
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    if (a?.deleteEmbeddedDocuments && p.itemId) await a.deleteEmbeddedDocuments("Item", [p.itemId]);
  },
  "place-fate-snare": async (payload) => {                       // FATE Snare → arm its trigger Region GM-side (players lack Region create)
    const p = payload || {};
    const scene = game.scenes?.get(p.sceneId);
    const owner = await edhaResolveActorRef(p.ownerUuid);
    if (scene && owner) await edhaFateCreateSnareRegionGM(scene, owner, p.x, p.y, p.snareId);
  },
  "delete-fate-snare": async (payload) => {                      // FATE Snare sprung/moved → drop its trigger Region GM-side
    const p = payload || {};
    const scene = game.scenes?.get(p.sceneId);
    const r = scene ? edhaFateFindSnareRegion(scene, p.snareId) : null;
    if (r) await scene.deleteEmbeddedDocuments("Region", [r.id]);
  },
  "gm-card": async (payload) => {                                // GM-only card a player must not author (Black Draw Mana behind-a-wall counts)
    const p = payload || {};
    const a = await edhaResolveActorRef(p.actorUuid);
    const gmIds = edhaGmIds();   // R-62: matches edhaPostGmCard's own classification (hidden-info record → all GMs, unchanged)
    if (gmIds.length && p.content) await ChatMessage.create({ whisper: gmIds, speaker: ChatMessage.getSpeaker({ actor: a }), content: p.content });
  },
  "resolve-card": async (payload) => {                           // card-persistence: a non-author clicked a one-shot card
    const p = payload || {};
    const m = game.messages?.get(p.messageId);
    if (m) await m.setFlag("edha-content", "cardResolved", { label: p.label || "Resolved ✓" });
  },
  "counter-set": async (payload) => {                     // counter write GM-side (player lacks perms on the bearer) — was gnosis-set-insight pre-2bT
    const p = payload || {};
    const a = await edhaResolveActorRef(p.targetUuid);
    if (a) await edhaCounterApplyGM(a, String(p.status || "insight"), Number(p.count) || 0, p.mark || null);
  },
  "loot-take": async (payload) => { await edhaLootTakeGM(payload); },            // loot Take button (item 34b) — the GM is the single writer; edhaLootClaim is the double-loot guard
};
// Socket relay: a player's Detonate emits the resolved writes; only the primary active GM applies them.
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      try {
        if (!edhaDefBuffGmGate()) return;   // exactly one GM applies
        const handler = EDHA_SOCKET_ACTIONS[data?.action];
        if (handler) await handler(data.payload || {});
      } catch (e) { console.error("Edha Content | socket relay failed", e); }
    });
  } catch (e) { console.error("Edha Content | socket registration failed", e); }
});
// Button binding: EDHA_CARD_BUTTONS["edha-burst-btn"], ["edha-burst-cancel"] (Job 1, pass 5.3, end of
// file — the click bodies moved there too, since they were inline; both GAIN an R-59 outer catch
// they didn't have before, via edhaClickFailed).
// Map a talent's flat `edha-burst` rule config to the burst spec edhaCastBurst expects.
function edhaBurstSpecFromCfg(h) {
  return {
    color: h.color || null,
    affects: h.affects || "enemies",
    area: { shape: "circle", sizeByRank: !!h.sizeByRank, sizeFt: Number(h.sizeFt) || 0 },
    burst: {
      rangeByRank: !!h.rangeByRank, rangeFt: Number(h.rangeFt) || 0,
      save: h.saveSkill ? { skill: h.saveSkill, vs: h.saveVs || h.color || "" } : null,
      addSkillMod: h.addSkillMod || "", heal: !!h.heal, terrain: !!h.terrain,
    },
  };
}
/* The `edha-pre-use` DISPATCHER (2026-07-28, bench run 17 — Cinderbrock's Fire the Wrack placed
 * nothing, five drives, no card and no error).
 *
 * `edha-pre-use` was registered with the sentinel hook `edha-content.noop-pre-use`, and NOTHING
 * fired it. The only glue on `cosmere-rpg.preUseItem` that read a rule was the burst takeover
 * below, which looks its rule up by HANDLER type (`edhaRuleOf(item, "edha-burst")`) and so served
 * exactly one handler. Any other handler parked on `edha-pre-use` was unreachable — a registered
 * event type that can never fire, offered to Ben in the Events-tab dropdown like a working one.
 *
 * The fix is four lines because the sentinel is not dead by design, it is FIRE-ME-YOURSELF: the
 * system groups every registered event type by its `hook` string in its own `ready` handler and
 * does `Hooks.on(hook, …)` for each (system index.js ~11977). Our types register on `init`, so the
 * listener exists by then. Calling the hook hands the item to the system's `fireEvent`, which
 * filters `rule.event === type && !rule.disabled` and runs each rule's registered executor — so
 * EVERY handler type works here now, and any future one works without new glue (iron rule 2a: no
 * bespoke per-handler dispatch). Host is the default "source" and we pass no userId, so only the
 * acting client runs it — no two-GM double-fire.
 *
 * Deliberately NOT a takeover: it does not return false. Returning false from preUseItem cancels
 * with no cost paid and no card, which is right for a burst that resolves itself and wrong for a
 * rider like Fire the Wrack, whose Action cost and card are the system's job. Burst rules are
 * skipped outright — their executors are declared no-ops and the takeover below owns them — so
 * this changes nothing for the 8 shipped `edha-burst` rules.
 *
 * Chose this over re-authoring Fire the Wrack onto `use`: that is a data change, so it would
 * re-open the pack-rebuild list (EMPTY for the first time in the project's tracked history) and
 * cost Ben a Foundry-closed rebuild — and it would leave the trap armed for the next author. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (!edhaIsTalent(item)) return;      // covers bespoke adversary abilities: build stamps adversaryTalent
    if (!edhaEventRules(item).some(r => r?.event === "edha-pre-use" && r?.handler?.type !== "edha-burst")) return;
    Hooks.callAll("edha-content.noop-pre-use", item);
  } catch (e) { console.error("Edha Content | edha-pre-use dispatch failed", e); }
});
// Intercept burst talents BEFORE the default single-target flow rolls/posts anything. The burst
// CONFIG lives on the talent (its edha-burst rule); this hook is only the engine glue.
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (!edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-burst");
    if (!h) return;                 // only burst-rule talents are taken over
    void edhaCastBurst(item, edhaBurstSpecFromCfg(h));
    return false;                   // cancel the system's default use() (no card, no auto damage)
  } catch (e) { console.error("Edha Content | preUseItem burst intercept failed", e); }
});

