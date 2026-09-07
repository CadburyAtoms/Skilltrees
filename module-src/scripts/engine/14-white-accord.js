/* ============================================================================================
 * WHITE / ACCORD tree engine (2026-06-14c) — social control: Disoriented/Determined, accords, disadvantage.
 * The most narrative White tree (influence / verbal accords / objective tests have no Foundry events).
 * Disoriented auto-expires at the END OF THE OWNER'S NEXT TURN (timed-status expiry — ruling A).
 * Determined / Disoriented are native cosmere conditions.
 *
 * IRON RULE 2b (07-25, pass 2bR): ON THEIR OWN DOCUMENTS — the useItem switch and name loops are gone:
 *   `edha-pulse` (status)                    Collective Resolve (Determined to in-range allies)
 *   H1 `edha-def-test` (`vs: prompt-dc`) +
 *     `edha-triggered-effect`                Counterpoint (Disorient on success, 1 Inv; ruling D)
 *   H26 `edha-test-react`
 *     (disadvantage-reroll)                  Voice of Authority (enemy in-range attack; ruling E)
 *   H6 `edha-prompt-pick` +
 *     `edha-accord-forge`                    Terms of Accord (ruling B; the +1 is GM-narrated)
 * ⚑ BOUND BY WORD is off the ratchet with an EMPTY document, declared not overlooked: a pure UPGRADE
 *   talent (the Absolute Stillness class) — it is the `shareModIfOwns` gate on Terms of Accord's
 *   forge rule, and editing its rider means editing Terms of Accord.
 * ENGINE_OWNED: the accord partner watcher + Bound-by-Word offer card + the roll-rewrite relay
 *   (edhaAccordWatchSkill / edhaPostBoundCard / edhaRewriteOrRelay) — a flag-driven cross-actor,
 *   cross-client subsystem selected by the `accord` FLAG, never by a name.
 *  - Overwhelming Authority converted 07-24s (H6 + triggered-effect).
 *  - Unyielding Accord is a drag-onto-ally +1 Cog/Spi template AE (data-side — pack rebuild).
 *  - Disciplined Mind + Unyielding Accord = manual (ruling C).
 * ============================================================================================ */

// Apply a status with an owner-relative (or self) timed expiry; relays to the GM when we lack perms.
async function edhaApplyTimedStatus(target, statusId, { owner = null, expire = "owner" } = {}) {
  try {
    if (target.isOwner) {
      await target.toggleStatusEffect?.(statusId, { active: true });
      if (expire) {
        const eff = [...(target.effects ?? [])].find(e => e.statuses?.has?.(statusId));
        const who = (expire === "owner" && owner) ? owner : target;
        const cbt = edhaInActiveCombat(who);   // R-4/#28a: the reference creature's OWN combat
        const ti = cbt?.started ? edhaCombatantTurnIndex(cbt, who) : -1;
        if (eff && ti >= 0) await eff.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(cbt, ti));
        // Can't stamp yet — no combat running, or neither creature is in THIS combat. Record what the
        // rule asked for so the turn-change pass stamps it the moment a combat exists; otherwise the
        // status is IMMORTAL for every id outside EDHA_TIMED_STATUSES (Brace, before initiative).
        // Also clear any stamp left over from a previous combat: its coordinate means nothing here.
        else if (eff) {
          try { await eff.unsetFlag("edha-content", "expireAfter"); } catch (x) {}
          await eff.setFlag("edha-content", "timedExpire", { expire, ownerUuid: owner?.uuid ?? null });
        }
      }
      return true;
    }
    if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to apply ${statusId}.`); return false; }
    game.socket.emit("module.edha-content", { action: "apply-timed-status", payload: { targetUuid: target.uuid, statusId, ownerUuid: owner?.uuid, expire } });
    return true;
  } catch (e) { console.error("Edha Content | apply timed status failed", e); return false; }
}

/* Counterpoint is ON ITS OWN DOCUMENT since 07-25 (iron rule 2b): H1 `edha-def-test` with the
 * `vs: prompt-dc` mode (built this pass — the GM is asked for the influence result when the owner's
 * White test resolves) plus an `edha-triggered-effect` success payload (Disoriented, owner-relative
 * expiry, 1 Inv). Its manual no-target/declined-DC Disorient card is deleted with it: H1's
 * requireTarget veto covers no-target, and a declined DC resolves fail-open (the standing §9m q9
 * convention). edhaCounterpointContest / edhaPostDisorientCard / edhaAccordDisorientClick are gone —
 * do not re-add them. */

// Disadvantage-reroll offer (Voice of Authority's shape; ruling E) — generic since 07-25: the
// talent's H26 rule supplies the name, costs and prompt; the click re-rolls the kept d20, keeps the
// lower, and rewrites the attacker's roll card (ENGINE-OWNED — the cross-actor rewrite relay).
function edhaPostVoiceCard(owner, name, attacker, origNat, origTotal, costs = [], prompt = "") {
  try {
    const costLabel = edhaChoiceCostLabel(costs);
    const body = prompt || `${attacker.name} made a hostile action (rolled <strong>${origTotal}</strong>). If it targets an ally${costLabel ? `, spend ${costLabel}` : ""} → impose disadvantage.`;
    const row = `<button type="button" class="edha-accord-voice-btn" data-edha-owner="${owner.uuid}" data-edha-name="${encodeURIComponent(name)}" data-edha-costs="${encodeURIComponent(JSON.stringify(costs))}" data-edha-attacker="${attacker.uuid}" data-edha-nat="${origNat}" data-edha-total="${origTotal}">Use ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button>`;
    edhaPostChoiceCard(owner, { name, emoji: "📢", prompt: body, rows: row, onceGate: true });
  } catch (e) { console.error("Edha Content | voice card failed", e); }
}
async function edhaAccordVoiceClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner); if (!owner) return;
    const name = decodeURIComponent(ds.edhaName || "");
    if (!edhaCoordOPRAllowed(owner, name, "_react")) { ui.notifications?.info(`${name} already used this round.`); btn.disabled = true; return; }
    await edhaCoordOPRMark(owner, name, "_react");
    const attacker = await edhaResolveActorRef(ds.edhaAttacker);
    const origNat = Number(ds.edhaNat) || 0, origTotal = Number(ds.edhaTotal) || 0;
    let costs = []; try { costs = JSON.parse(decodeURIComponent(ds.edhaCosts || "[]")) || []; } catch (e) {}
    for (const c of costs) await edhaSpendResource(owner, c.resource, c.value);
    const newRoll = await (new Roll("1d20")).evaluate(); const newNat = Number(newRoll.total) || 0;
    const keptNat = Math.min(origNat, newNat), newTotal = origTotal - origNat + keptNat;
    btn.disabled = true; btn.textContent = `${name} used`;
    const amend = `📢 <strong>${name}</strong>: disadvantage — d20 ${origNat} vs ${newNat} → keep <strong>${keptNat}</strong>; total <strong>${newTotal}</strong> (was ${origTotal}).`;
    const rewrote = attacker ? await edhaRewriteOrRelay(attacker, origTotal, newTotal, amend) : false;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📢 <strong>${name}</strong>: ${attacker ? attacker.name + "'s" : "the"} attack rolls disadvantage — kept d20 <strong>${keptNat}</strong> (of ${origNat}/${newNat}); result <strong>${newTotal}</strong> (was ${origTotal})${rewrote ? " — <em>updated on its roll card.</em>" : " — <em>GM applies the lower.</em>"}</p>` });
  } catch (e) { edhaClickFailed("voice click", e); }
}

// Bound by Word — an accord partner may use the accord-maker's White modifier on an objective test (ruling B).
function edhaPostBoundCard(partner, accord, origNat, origTotal, skillId) {
  try {
    const newTotal = origNat + (Number(accord.ownerWhiteMod) || 0);
    ChatMessage.create({
      whisper: edhaWhisperIds(partner),
      speaker: ChatMessage.getSpeaker({ actor: partner }),
      content: `<div class="edha-trigger-card"><p>🤝 <strong>Bound by Word</strong> — if this ${String(skillId).toUpperCase()} test pursues your accord with ${accord.ownerName}, use their White modifier (+${accord.ownerWhiteMod}) in place of your own → <strong>${newTotal}</strong> (was ${origTotal}).</p>`
        + `<button type="button" class="edha-accord-bound-btn" data-edha-partner="${partner.uuid}" data-edha-total="${newTotal}" data-edha-was="${origTotal}">Use ${accord.ownerName}'s White modifier</button></div>`,
    });
  } catch (e) { console.error("Edha Content | bound card failed", e); }
}
async function edhaAccordBoundClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const partner = await edhaResolveActorRef(ds.edhaPartner); if (!partner) return;
    btn.disabled = true; btn.textContent = "Bound by Word applied";
    const newTotal = Number(ds.edhaTotal) || 0, wasTotal = Number(ds.edhaWas) || 0;
    const amend = `🤝 <strong>Bound by Word</strong>: using the accord-maker's White modifier → total <strong>${newTotal}</strong> (was ${wasTotal}).`;
    const rewrote = await edhaRewriteOrRelay(partner, wasTotal, newTotal, amend);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: partner }), content: `<p>🤝 <strong>Bound by Word</strong>: ${partner.name}'s result is <strong>${newTotal}</strong> (was ${wasTotal})${rewrote ? " — <em>updated on the roll card.</em>" : " — <em>GM applies the higher.</em>"}</p>` });
  } catch (e) { edhaClickFailed("bound click", e); }
}

// Accord partner watcher (GM-gated, whispered): a flag-driven ENGINE-OWNED subsystem since 07-25 —
// the `accord` flag (written by an edha-accord-forge rule) is what selects, never a talent name.
// Enemy attacks → the disadvantage-reroll offer moved onto Voice of Authority's own H26 rule.
async function edhaAccordWatchSkill(roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const accord = roller.getFlag?.("edha-content", "accord");
    if (!accord?.boundByWord) return;
    const skillId = roll?.data?.skill?.id ?? "test";
    if (!edhaCoordOPRAllowed(roller, "_accordBound", skillId)) return;
    await edhaCoordOPRMark(roller, "_accordBound", skillId);
    edhaPostBoundCard(roller, accord, edhaKeptD20Nat(roll) ?? 0, Number(roll.total) || 0, skillId);
  } catch (e) { console.error("Edha Content | accord skill watch failed", e); }
}
Hooks.on("cosmere-rpg.skillRoll",  edhaAccordWatchSkill);
// The Accord active-ability useItem switch is GONE (07-25, iron rule 2b) — every consumer is on its
// own document: Collective Resolve = `edha-pulse` (status) · Terms of Accord = H6 `edha-prompt-pick`
// + `edha-accord-forge` · Counterpoint = H1 `edha-def-test` (`vs: prompt-dc`) + `edha-triggered-effect`
// · Overwhelming Authority converted 07-24s. Do not re-add a name-keyed branch here.
// Button binding: EDHA_CARD_BUTTONS["edha-accord-voice-btn"], ["edha-accord-bound-btn"] (Job 1, pass 5.3, end of file).

