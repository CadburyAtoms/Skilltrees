/* ============================================================================================
 * GREEN / RESTORATION tree engine (2026-06-16) — the "you restored health" trigger family + injuries.
 * IRON RULE 2b (07-25, pass 2bS) — the whole family is document-driven now:
 *   • Resurgent Growth / Vital Surge / Natural Recovery — `edha-heal-react` rules (queue-regrowth /
 *     offer-thp / offer-cleanse); edhaDispatchHealReact announces from the two heal chokepoints
 *     (the applyDamage heal post-pass and the trigger-heal path) and the Green colour gate rides
 *     each rule (`whenColor`), not the chokepoints.
 *   • Reknit Form — `edha-remove-injury` on its own use event (2 Inv temporary / 3 Inv permanent
 *     as rule fields); the name-gated useItem hook is deleted.
 * The card posters + click machinery below are generic off data attributes and stay ENGINE-OWNED.
 * Hardy = data-side +@level max-HP AE (clone). Collected + Verdant Mend already done.
 * ============================================================================================ */
const EDHA_NATREC_CONDITIONS = ["afflicted", "disoriented", "stunned", "weakened"];   // default cleanse set (offer-cleanse)

/* `edha-heal-react` (07-25 pass 2bS — was the name-keyed edhaGreenHealRiders trio): when YOU
 * restore health, your OWN rules react. Announced from the two heal chokepoints (the applyDamage
 * heal post-pass and the trigger-heal path); the colour gate and the payload ride each talent's
 * document. Actions: queue-regrowth (auto; resolves at your next turn start, range re-checked) ·
 * offer-thp (whispered card, below-half gate, cost + roll on the CLICK) · offer-cleanse
 * (whispered card, one button per present condition; the Opportunity cost stays honour-system,
 * exactly as retired). */
async function edhaDispatchHealReact(healer, healItem, target, amount, prevHp) {
  try {
    if (!healer || !target || !(amount > 0)) return;
    for (const { item: tal, handler: h } of edhaActorRulesOf(healer, "edha-heal-react")) {
        try {
          if (h.whenColor && (!healItem || edhaTalentColor(healItem) !== h.whenColor)) continue;
          const action = String(h.action || "");
          if (action === "queue-regrowth") {
            if (h.allyOnly !== false && (target === healer || !edhaSameDisposition(healer, edhaCasterToken(target)))) continue;
            await edhaQueueRegrowth(healer, target);
          } else if (action === "offer-thp") {
            const maxHp = edhaResVal(target.system?.resources?.hea) || 0;
            if (h.requireBelowHalf !== false && !(prevHp != null && maxHp > 0 && prevHp < maxHp / 2)) continue;
            edhaPostVitalSurgeCard(healer, target, tal, h);
          } else if (action === "offer-cleanse") {
            edhaPostNaturalRecoveryCard(healer, target, tal, h);
          }
        } catch (e) { console.error(`Edha Content | edha-heal-react (${tal?.name}) failed`, e); }
    }
  } catch (e) { console.error("Edha Content | heal-react dispatch failed", e); }
}

/* --- Regrowth queue — filled by `edha-heal-react` {queue-regrowth}, resolved at the owner's next
 * turn start. The formula, the range re-check colour and the card label ride the owner's own rule
 * (07-25 pass 2bS — was name-keyed to Resurgent Growth). ------------------------------------------ */
async function edhaQueueRegrowth(owner, target) {
  try {
    const list = foundry.utils.deepClone(owner.getFlag("edha-content", "regrowth") ?? []);
    if (!list.some(e => e.targetUuid === target.uuid)) list.push({ targetUuid: target.uuid });
    await owner.setFlag("edha-content", "regrowth", list);
  } catch (e) { /* perms */ }
}
function edhaRegrowthRuleOf(actor) {
  for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-heal-react")) {
    if (String(h.action) === "queue-regrowth") return { item: tal, handler: h };
  }
  return null;
}
async function edhaResolveRegrowth(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const curActor = combat.combatant?.actor; if (!curActor) return;
    const spec = edhaRegrowthRuleOf(curActor); if (!spec) return;
    const list = curActor.getFlag("edha-content", "regrowth"); if (!list?.length) return;
    const h = spec.handler;
    const otok = edhaCasterToken(curActor);
    const ft = h.rangeColor ? edhaAttuneFtColor(curActor, h.rangeColor) : 0;
    const f = edhaSubstRankTier(h.amountFormula || "0", edhaColorRank(curActor, h.color || h.rangeColor || "green") || 1, Number(curActor.system?.tier) || 1);
    const amount = Math.max(0, Math.floor(edhaEvalSync(f, curActor.getRollData())));
    for (const e of list) {
      const t = await edhaResolveActorRef(e.targetUuid); if (!t) continue;
      const ttok = edhaCasterToken(t);
      if (ft > 0 && otok && ttok && !edhaTokensWithin(otok, ft).some(x => x.id === ttok.id)) continue;   // left range → skip
      if (amount > 0) {
        const got = await edhaCrossHeal(t, amount);   // item 68: announce the delivered HP
        const line = edhaHealLine(t, amount, got, d => `${t.name} regains <strong>${d}</strong> health`);
        if (line) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: curActor }), content: `<p>🌿 <strong>${spec.item.name}</strong> (${curActor.name}): ${line}.</p>` });
      }
    }
    try { await curActor.unsetFlag("edha-content", "regrowth"); } catch (e) {}
  } catch (e) { console.error("Edha Content | resolve regrowth failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaResolveRegrowth(combat); });

/* --- Temp-HP offer card (`edha-heal-react` {offer-thp} — was name-keyed to Vital Surge) ------------ */
/* THP doesn't stack — it KEEPS THE HIGHER. R-36 (2026-09-06): the LABEL must keep the higher too.
 * Until this fix `source` was written unconditionally, so a losing grant relabelled a value it did
 * not produce: an ally holding 6 from Final Decree read "Bear Witness" after a 4, and a 99-THP ally
 * read "Investiture of Command". The number was right and the attribution lied — which is worse
 * than a wrong number, because the card is what a player reads to decide what will expire.
 * A TIE is not a win: the incumbent grant keeps both its value and its name. */
async function edhaGrantTempHpCross(target, amount, source) {
  const held = edhaGetTempHp(target);                                    // null when there is none
  const inc = Math.max(0, Math.floor(Number(amount) || 0));
  const wins = inc > (held?.value ?? 0);
  const final = wins ? inc : (held?.value ?? 0);
  const label = wins ? (source || "") : (held?.source ?? source ?? "");
  if (target.isOwner) { await edhaWriteTempHp(target, final, label); return; }
  // Job 6a (found via the setFlagEmit ratchet re-measure, an 8th split beyond the named 7): routed
  // through the canonical helper.
  await edhaSetEdhaFlag(target, "tempHp", { value: final, source: label || "" });
}
function edhaPostVitalSurgeCard(owner, target, tal, h) {
  try {
    const cost = h.costInv == null ? 1 : Math.max(0, Number(h.costInv) || 0);
    const f = edhaSubstRankTier(h.amountFormula || "0", edhaColorRank(owner, h.color || "green") || 1, Number(owner.system?.tier) || 1);
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>💚 <strong>${tal.name}</strong> — ${target.name} was below half HP. ${cost > 0 ? `Spend ${cost} Investiture to grant` : "Grant"} Temp HP${h.amountLabel ? ` = ${h.amountLabel}` : ""}.</p>`
        + `<button type="button" class="edha-vitalsurge-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target.uuid}" data-edha-label="${encodeURIComponent(tal.name)}" data-edha-formula="${encodeURIComponent(f)}" data-edha-cost="${cost}">Grant Temp HP${cost > 0 ? ` (−${cost} Investiture)` : ""}</button></div>`,
    });
  } catch (e) { console.error("Edha Content | temp-HP offer card failed", e); }
}
async function edhaVitalSurgeClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner);
    const target = await edhaResolveActorRef(ds.edhaTarget);
    if (!owner || !target) return;
    const cost = Math.max(0, edhaNumOr(ds.edhaCost, 1));   // Job 6: unified onto edhaNumOr (was already falsy-zero-safe, no behavior change)
    if (cost > 0) {
      const inv = owner.system?.resources?.inv, cur = inv?.value ?? 0;
      await edhaSpendResource(owner, "inv", cost);
    }
    const label = ds.edhaLabel ? decodeURIComponent(ds.edhaLabel) : "Temp HP";
    const roll = await new Roll(ds.edhaFormula ? decodeURIComponent(ds.edhaFormula) : "0", owner.getRollData()).evaluate();
    const amt = Math.max(0, Math.floor(roll.total));
    await edhaGrantTempHpCross(target, amt, label);
    btn.disabled = true; btn.textContent = "Temp HP granted";
    void edhaMarkCardResolved(edhaMessageIdOf(btn), "Temp HP granted");   // R-66: persists past F5/second client
    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: owner }), flavor: `💚 ${label} — ${amt} Temp HP → ${target.name}${cost > 0 ? ` (−${cost} Investiture)` : ""}.` });
  } catch (e) { edhaClickFailed("temp-HP offer click", e); }
}

/* --- Cleanse offer card (`edha-heal-react` {offer-cleanse} — was name-keyed to Natural Recovery) ---
 * Poster/click machinery is edhaPostCleanseCard / edhaCleanseOfferClick above (Job 8). */
function edhaPostNaturalRecoveryCard(owner, target, tal, h) {
  const conds = String(h.conditions || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const set = conds.length ? conds : EDHA_NATREC_CONDITIONS;
  const present = set.filter(c => [...(target.statuses ?? [])].includes(c));
  const costNote = h.costNote || "spend an Opportunity";
  edhaPostCleanseCard(owner, target, tal.name, present, {
    cssClass: "edha-natrec-btn", emoji: "🍃", costNote, prompt: `${costNote} to remove a condition from ${target.name}:`,
  });
}

/* --- Injury-removal menu (`edha-remove-injury` — was name-keyed to Reknit Form) -------------------- */
function edhaInjuryIsPermanent(inj) { return String(inj?.system?.type || "").includes("permanent") || /permanent/i.test(inj?.name || ""); }
function edhaPostReknitCard(owner, tal, h) {
  try {
    const costT = h?.costTemporary == null ? 2 : Math.max(0, Number(h.costTemporary) || 0);
    const costP = h?.costPermanent == null ? 3 : Math.max(0, Number(h.costPermanent) || 0);
    const target = edhaUserTargetActor() ?? owner;   // touch a creature (default: self)
    const injuries = (target.items ?? []).filter(i => i.type === "injury" && String(i.system?.type || "") !== "death");
    if (!injuries.length) { ui.notifications?.info(`Edha: ${target.name} has no removable injuries.`); return; }
    const rows = injuries.map(inj => {
      const cost = edhaInjuryIsPermanent(inj) ? costP : costT;
      return `<button type="button" class="edha-reknit-btn" data-edha-owner="${owner.uuid}" data-edha-target="${target.uuid}" data-edha-injury="${inj.id}" data-edha-cost="${cost}" data-edha-label="${encodeURIComponent(tal.name)}">${inj.name} (−${cost} Investiture)</button>`;
    }).join(" ");
    ChatMessage.create({
      whisper: edhaWhisperIds(owner),
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🩹 <strong>${tal.name}</strong> — remove an injury from ${target.name} (${costT} Inv temporary · ${costP} Inv permanent):</p>${rows}</div>`,
    });
  } catch (e) { console.error("Edha Content | injury-menu card failed", e); }
}
async function edhaDeleteItemCross(actor, itemId) {
  if (!actor || !itemId) return;
  if (actor.isOwner) { try { await actor.deleteEmbeddedDocuments("Item", [itemId]); } catch (e) {} return; }
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to remove that injury."); return; }
  try { game.socket.emit("module.edha-content", { action: "delete-item", payload: { actorUuid: actor.uuid, itemId } }); } catch (e) {}
}
async function edhaReknitClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner);
    const target = await edhaResolveActorRef(ds.edhaTarget);
    if (!owner || !target) return;
    const cost = edhaNumOr(ds.edhaCost, 2);   // an authored 0 is LEGAL (a free removal) — never `|| 2`
    await edhaSpendResource(owner, "inv", cost);
    const label = target.items?.get?.(ds.edhaInjury)?.name || "injury";
    const talLabel = ds.edhaLabel ? decodeURIComponent(ds.edhaLabel) : "Injury removal";
    await edhaDeleteItemCross(target, ds.edhaInjury);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-reknit-btn").forEach(b => b.disabled = true);
    btn.textContent = "✓ healed";
    void edhaMarkCardResolved(edhaMessageIdOf(btn), "✓ healed");   // R-66: persists past F5/second client
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🩹 <strong>${talLabel}</strong> (${owner.name}): removed <strong>${label}</strong> from ${target.name} (−${cost} Investiture).</p>` });
  } catch (e) { edhaClickFailed("Reknit click", e); }
}

// Button binding: EDHA_CARD_BUTTONS["edha-vitalsurge-btn"], ["edha-natrec-btn"], ["edha-reknit-btn"] (Job 1, pass 5.3, end of file).
// Reknit Form's use-hook is gone (07-25 pass 2bS): the menu posts from its own
// `edha-remove-injury` rule's executor now.

