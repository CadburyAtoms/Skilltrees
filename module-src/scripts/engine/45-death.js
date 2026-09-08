/* ============================================================================================
 * DEATH (Morrath, deity) tree engine (2026-07-02; DOCUMENT-DRIVEN since 2bW, 07-25) — the
 * "Harvested Remains" economy. Colors Black/Green; tag prefix "Death (Morrath)."; build
 * `foundry-build deity` → pack `edha-deity`. Attunement Range follows each talent's die color
 * (Ben R0, 07-02) — the colour now rides each talent's own rule fields.
 *
 * ALL NINE TALENTS ARE ON THEIR DOCUMENTS (iron rule 2b). The EDHA_DEATH_TAKEOVER Set, the
 * name-keyed useItem switch and the per-talent flow functions are GONE (2bW). What remains here
 * is shared machinery, all of it flag- or rule-driven, no talent name in code:
 *   • Remains       = the H3 ledger at flags.edha-content.lists.remains (REPOINTED 2bW — the
 *     covenants/edicts precedent; entries {id, uuid, name} + the `harvested` marker, mark-wins
 *     reconcile, NOT scene-scoped, cleared on deleteCombat below). Cap/evict ride Reaper's
 *     Harvest's own place rule; spends are H3 `op: spend` rules (Risen Servant, Speak with the
 *     Fallen), edha-zone `costList` (Bone Garden) and edha-revive's confirm (Raise Dead). The
 *     scene-start freebie is the `sceneFreebie` FIELD on Reaper's place rule — "unset = freebie
 *     live, [] = spent" lives in edhaOwnerListAvail, generic.
 *   • defeat signal = ONE GM-side preUpdateActor→updateActor watcher (below) that fires only on a
 *     live→0 HP crossing; PC drops NEVER count (Ben R2, tree-wide), summons and Death-Warded
 *     creatures are skipped. It only ANNOUNCES (the `defeat` watch kind) — Reaper's Harvest and
 *     Necrotic Cascade are both edha-watch consumers now; Reaper's rule sets `chain: true` so a
 *     cascade's nested kills still harvest (the pre-2bW ordering, as a field).
 *   • Consuming Decay's tick (edhaDecayTurnTick), the icon-removal cleanup, Death Ward's
 *     would-drop check (edhaDeathWardCheck, called from the applyDamage post-pass ~L1204 — it
 *     SURVIVES the dismantle on purpose: it reads the `deathWard` flag, which edha-ward rules
 *     write) and the turn-end zone-hazard sweep (edhaTurnEndHazardSweep) — all flag-driven.
 * Where each talent lives now (data/authored/deity-death.json):
 *   • Withering Touch    — edha-self-status {withernext} + edha-note on use; edha-damage-bonus
 *     {armed-self-status, consumeSelfStatus, weaponOnly, meleeOnly, healCutFraction: 0}. A ranged
 *     hit stands down WITHOUT consuming (Ben's 07-04 ruling, now the meleeOnly field); Temp HP
 *     still lands under the heal cut (Ben R3).
 *   • Reaper's Harvest   — edha-watch {defeat, green range, chain} + payloads: edha-focus
 *     {resource: inv} and H3 place {list: remains, sceneFreebie} + edha-sense-reveal {harvested}
 *     (the 07-16c B6 through-walls render).
 *   • Consuming Decay    — edha-turn-dot (gates vetoed pre-cost; Ben R4's own `decaying` id).
 *   • Bone Garden        — edha-zone {terrain, green, 10 ft, costList: remains} + edha-zone-hazard
 *     {moment: turn-end} (ANY creature, allies and owner too — Ben R5; cancel refunds).
 *   • Death Ward         — H1 edha-def-test {black vs spi, skipIfAlly — Ben R6's willing branch}
 *     + edha-ward on success (activation is skill_test now, the Censure convention; a failed test
 *     still spends the cost).
 *   • Necrotic Cascade   — on its document since 07-24r (unchanged; Ben R7).
 *   • Risen Servant      — the authored edha-summon (Ben R8; sustainCap since 07-24y) + H3
 *     {op: spend, requireNonEmpty} for the Remain gate + spend.
 *   • Raise Dead         — ENGINE_OWNED: DialogV2 confirm + burst-apply revive + combatant
 *     initiative surgery + auto injury are a multi-step flow no rule chain expresses. KEYED ON its
 *     `edha-revive` rule (the edha-decree exit shape) — the rule carries every dial and the
 *     pre-cost gates (generic sceneOnce, target-at-0); no takeover, no name.
 *   • Speak with the Fallen — H3 {op: spend, confirm} + edha-note (the 3-questions card).
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Speak with the Fallen's Q&A ("truthfully but briefly") + its +2 Inv repeat cost (trusted,
 *     card-noted); Raise Dead's died-within-the-hour / touching-the-remains judgment; Death
 *     Ward's "willing" consent (owner-judged at targeting); Risen Servant's one-attack-per-turn
 *     cadence (action economy, trusted); Risen Servant's Frightened/Compelled immunity notes.
 *   • CONTEST-EXEMPT: none — the tree's only test (Death Ward) is vs a DEFENSE (Spiritual),
 *     through H1's pipeline, never an opposed SKILL.
 * ============================================================================================ */

// edhaDeathCard moved onto edhaTreeCard(owner, rolls, html, opts) — Job 4, pass 5.3 (call sites below updated directly).
// Range gate vs a target TOKEN (unknown positions don't hard-block — the owner judged the targeting).
function edhaDeathInRange(owner, targetTok, color) {
  const otok = edhaCasterToken(owner); if (!otok || !targetTok) return true;
  return edhaTokensWithin(otok, edhaAttuneFtColor(owner, color)).some(t => t.id === targetTok.id);
}

/* --- The Remains list — REPOINTED onto the H3 ledger (2bW; the covenants/edicts precedent) --------
 * Storage: flags.edha-content.lists.remains, H3-shaped entries {id, uuid, name} + the `harvested`
 * marker (mark-wins reconcile; a no-uuid entry is kept, fail-open). NOT scene-scoped — the flat
 * flag never was; the whole ledger clears on deleteCombat below. The scene-start freebie is
 * DECLARED by a `sceneFreebie` place rule on the granting talent's own document and read by the
 * generic edhaOwnerListAvail, so "unset = freebie live, [] = spent" survives the repoint with no
 * talent name in code. The named accessors (edhaRemainsList/edhaSetRemains/edhaSpendRemain)
 * retired 07-26 (the pre-deploy orphan sweep): every reader is rule-keyed through the generic
 * ledger machinery now. Still do NOT add a second path to the flat key. */

/* --- The defeat watcher: live→0 crossing, ANNOUNCED to the `defeat` watch kind ---------------------- */
Hooks.on("preUpdateActor", (actor, changes, options) => {
  try {
    const nh = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (nh === undefined) return;
    options.edhaHea = { old: Number(actor.system?.resources?.hea?.value) || 0, new: Number(nh) || 0 };
  } catch (e) {}
});
Hooks.on("updateActor", async (victim, changes, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier
    const h = options?.edhaHea;
    if (!h || h.new > 0 || h.old <= 0) return;                     // only a live→0 crossing counts
    if (victim.type === "character") return;                       // PC drops don't count (Ben R2)
    if (victim.getFlag?.("edha-content", "summon")) return;        // summons dissolve — no corpse
    if (victim.getFlag?.("edha-content", "deathWard")) return;     // the Ward restores them (post-pass)
    const vtok = edhaCasterToken(victim); if (!vtok) return;
    /* ANNOUNCE the drop (07-24r) — this is the `defeat` watch kind, and everything above it is the
     * SHARED precondition set the announcement inherits for free: one applier, a real live→0 crossing,
     * not a PC, not a summon, not saved by a Death Ward. Necrotic Cascade converted onto it 07-24r;
     * Reaper's Harvest followed 2bW — its name-keyed loop (Inv gain + edhaGainRemain) is gone, its
     * edha-watch rule sets `chain: true` so a cascade's NESTED kills still harvest (the pre-2bW
     * ordering, as a field), and the Remain lands via its own H3 place payload.
     * `chainBounded` (07-27b, bench run 5): a defeat cannot recur for the same creature (this very
     * hook's live→0 gate), so simultaneous nested kills CLAMP to chain level instead of the 2nd+
     * being dropped at the dispatcher's door — the harvest DISPATCH loss the cap-isolation control
     * reproduced with an empty ledger. See edhaWatchEntryLevel. */
    await edhaDispatchWatchers({ kind: "defeat", owner: victim, victim: null, skill: null, def: null, ok: null, total: 0, chainBounded: true });
  } catch (e) { console.error("Edha Content | Death defeat watcher failed", e); }
});

/* --- The decay tick — flag-driven since 07-02, written by `edha-turn-dot` rules since 2bW ---------- */
async function edhaDecayTurnTick(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const actor = combat.combatant?.actor; if (!actor) return;
    const d = actor.getFlag?.("edha-content", "decay"); if (!d) return;
    const dst = d.status || "decaying";
    if (!actor.statuses?.has?.(dst)) { try { await actor.unsetFlag("edha-content", "decay"); } catch (e) {} return; }   // icon removed = decay ended
    if ((actor.system?.resources?.hea?.value ?? 0) <= 0) return;   // corpses don't decay further
    const dr = await new Roll(d.formula || "0").evaluate();
    const amt = Math.max(0, Math.floor(dr.total));
    if (amt > 0) {
      _edhaInTrigger = true;   // the tick's damage must not re-trigger on-hit / native dispatch
      try { await actor.applyDamage([{ amount: amt, type: d.type || "vital" }], { chatMessage: false }); }
      finally { _edhaInTrigger = false; }
    }
    const owner = game.actors?.get(d.ownerId);
    const back = Math.floor(amt * (d.healFraction ?? 0.5));
    let healed = "";
    /* R-83 (a) — ANSWERED 2026-09-07 (Ben, "a"), item 70. The lifesteal heal-back is a HEAL on the
     * decay's OWNER, and it used to reach `hea` without the No-Healing / Healing-Halved gate: a
     * Withered necromancer kept draining HP back out of its victim while an ordinary heal on it was
     * blocked. Gated HERE, at the emitter; the delivered amount is what lands and what the card
     * says (item 68's contract), so a blocked heal-back names the mark instead of a number and the
     * decay DAMAGE above is untouched — the victim still rots either way. */
    if (owner && back > 0 && (Number(owner.system?.resources?.hea?.value) || 0) > 0) {
      const ohea = owner.system.resources.hea;
      const omax = Number(ohea?.max?.value ?? ohea?.max) || 0;
      let got = edhaHealCutGate(owner, back);
      if (got > 0) {
        const next = Math.min(omax || Infinity, (Number(ohea?.value) || 0) + got);
        try { await edhaResourceWrite(owner, "hea", { value: next }, edhaBookkeepingTag(`${d.sourceName || "Decay"} (lifesteal)`)); }
        catch (e) { got = 0; }   // the write failed — never claim HP that did not land (the pre-gate try/catch said the same)
      }
      const line = edhaHealLine(owner, back, got, n => `${owner.name} regains <strong>${n}</strong> HP`);
      healed = line ? ` ${line}.` : "";
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), rolls: [dr],
      content: `<p>🦠 <strong>${d.sourceName || "Decay"}</strong> — ${actor.name} takes <strong>${amt}</strong> ${d.type || "vital"} (start of turn).${healed}</p>` });
  } catch (e) { console.error("Edha Content | decay tick failed", e); }
}
Hooks.on("combatStart",      (combat) => { if (edhaDefBuffGmGate()) void edhaDecayTurnTick(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaDecayTurnTick(combat); });
// Removing the decay marker icon ends the decay (mirrors the affliction cleanup hook).
Hooks.on("deleteActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    const dst = a.getFlag?.("edha-content", "decay")?.status || "decaying";
    if (!effect?.statuses?.has?.(dst)) return;
    if (!a.statuses?.has?.(dst)) void a.unsetFlag("edha-content", "decay");
  } catch (e) { console.error("Edha Content | decay cleanup failed", e); }
});

/* --- The turn-end zone-hazard sweep (Spreading-Roots shape; GENERIC since 2bW) --------------------
 * Any Region flagged `turnEndDamage` damages the creature whose turn just ended inside it — ANY
 * creature, allies and the owner too (Ben R5). The flag is baked by the zone creator when the
 * placing talent's edha-zone-hazard rule says `moment: turn-end` (Bone Garden). */
async function edhaTurnEndHazardSweep(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const prevTurn = combat.previous?.turn; if (prevTurn == null) return;
    const tdoc = combat.turns?.[prevTurn]?.token; const tok = tdoc?.object; if (!tok?.actor) return;
    if ((tok.actor.system?.resources?.hea?.value ?? 1) <= 0) return;
    const scene = tok.scene ?? canvas?.scene;
    for (const region of (scene?.regions ?? [])) {
      const cfg = region.getFlag?.("edha-content", "turnEndDamage"); if (!cfg) continue;
      if (!edhaPointInRegion(region, tok.center?.x ?? 0, tok.center?.y ?? 0)) continue;
      const dr = await new Roll(cfg.formula || "0").evaluate();
      const amt = Math.max(0, Math.floor(dr.total));
      if (amt <= 0) continue;
      _edhaInTrigger = true;
      try { await tok.actor.applyDamage([{ amount: amt, type: cfg.type || "keen" }], { chatMessage: false }); }
      finally { _edhaInTrigger = false; }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: tok.actor }), rolls: [dr],
        content: `<p>🦴 <strong>${tok.actor.name}</strong> ends its turn in the ${cfg.source || "hazard"} — takes <strong>${amt}</strong> ${cfg.type || "keen"}.</p>` });
    }
  } catch (e) { console.error("Edha Content | turn-end hazard sweep failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaTurnEndHazardSweep(combat); });

/* --- Death Ward's would-drop check — flag-driven; the flag is written by `edha-ward` rules (2bW) ----
 * Called from the applyDamage POST-pass on EVERY application (cheap flag read). Runs on the applying
 * client — the one that just wrote the target's HP, so it can write it back. ⚠ This block is the
 * ward's ONLY enforcement — it deliberately SURVIVED the 2bW hook dismantle (the "deleting a hook
 * can delete a different talent's only presence" lesson). */
async function edhaDeathWardCheck(target, prevHp) {
  try {
    const ward = target?.getFlag?.("edha-content", "deathWard"); if (!ward) return;
    const hp = Number(target.system?.resources?.hea?.value) || 0;
    if (hp > 0 || prevHp <= 0) return;                             // only the lethal drop fires it
    try { await target.unsetFlag("edha-content", "deathWard"); } catch (e) {}
    const dr = await new Roll(ward.formula || "0").evaluate();
    const thp = Math.max(0, Math.floor(dr.total));
    if (target.isOwner || game.user?.isGM) await edhaResourceWrite(target, "hea", { value: 1 }, edhaBookkeepingTag(`${ward.sourceName || "Ward"} (drop to 1)`));
    else game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: target.uuid, amount: 1, heal: true }] } });
    await edhaGrantTempHpCross(target, thp, ward.sourceName || "Ward");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), rolls: [dr],
      content: `<p>💀 <strong>${ward.sourceName || "Ward"}</strong> (${ward.ownerName}): ${target.name} drops to <strong>1 HP</strong> instead of 0 and gains <strong>${thp}</strong> Temp HP. The ward ends.</p>` });
  } catch (e) { console.error("Edha Content | ward check failed", e); }
}

/* --- The revive flow — ENGINE-OWNED, keyed on `edha-revive` rules (2bW; the edha-decree shape) ------
 * Necrotic Cascade note (07-24r, unchanged): its arm is the `cascadearmed` STATUS, written by the
 * talent's own `edha-self-status` rule and read by its `edha-watch` rule's requireSelfStatus. The
 * EDHA_DEATH_TAKEOVER Set and the name-keyed useItem switch that used to live here are GONE (2bW):
 * costs are the system's, gates ride the generic pre-cost vetoes, and each talent's behaviour is
 * on its document. */
async function edhaReviveUse(item, h) {
  try {
    const owner = item?.actor; if (!owner) return;
    const tok = edhaUserTargetToken(); const target = tok?.actor;
    if (!target || (target.system?.resources?.hea?.value ?? 1) > 0) { ui.notifications?.warn(`Edha: target a token at 0 HP for ${item.name}.`); return; }
    if (h.oncePerScene !== false) await edhaStampSceneOnce(owner, item);
    // The optional ledger confirm — declined consumes nothing ("died within the last hour" + touch
    // stays owner-judged at targeting).
    let spendNote = "";
    const key = String(h.ledger || "").trim();
    if (key) {
      const st = String(h.ledgerStatus || key).trim();
      if (edhaOwnerListAvail(owner, key, st).length > 0) {
        let yes = false;
        try {
          yes = await foundry.applications.api.DialogV2.confirm({
            window: { title: item.name },
            content: `<p>${(h.confirm || `Consume one ${edhaConditionLabel(st) || st} for {name}? (It is spent.)`).split("{name}").join(target.name)}</p>`,
            modal: false, rejectClose: false,
          });
        } catch (e) { yes = false; }
        if (yes && await edhaLedgerSpend(owner, key, st, item.name)) spendNote = ` A ${edhaConditionLabel(st) || st} is consumed.`;
      }
      /* R-12 (Ben (a), 2026-09-06): the RAISED creature's OWN entry and marker go too — a living
       * creature cannot also be a Remain. Separate from the spend above and unconditional on it:
       * the reported case raised a harvested adversary by spending a DIFFERENT Remain, and the
       * body's own entry may sit on another Reaper's ledger entirely, so the sweep is by uuid
       * across every owner (edhaLedgerDropCreature). Runs AFTER the spend so the two writes cannot
       * race for the same list, and before the card so the note is true when it prints. */
      if (await edhaLedgerDropCreature(target.uuid, key, String(h.ledgerStatus || key).trim()))
        spendNote += ` ${target.name} is no longer a ${edhaConditionLabel(String(h.ledgerStatus || key).trim()) || key} — its own marker and ledger entry are cleared.`;
    }
    const payload = { casterActorUuid: owner.uuid, hits: [{ actorUuid: target.uuid, amount: 1, heal: true }] };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    let statusNote = "";
    if (h.statusId) {
      await edhaApplyTimedStatus(target, h.statusId, { owner, expire: "target" });   // until the end of ITS next turn
      statusNote = `, <strong>${edhaConditionLabel(h.statusId) || h.statusId}</strong> until the end of its next turn`;
    }
    let initNote = "";
    if (h.initiative !== false) {
      initNote = " GM: move its combatant onto the caster's initiative.";
      const c = edhaInActiveCombat(owner);   // R-4/#28a: the CASTER's combat holds the initiative to copy
      if (c?.started) {
        const oc = c.combatants.find(x => x.actorId === owner.id);
        const tc = c.combatants.find(x => x.tokenId === tok.id || x.actorId === target.id);
        if (oc && tc && game.user?.isGM) { try { await tc.update({ initiative: oc.initiative }); initNote = ""; } catch (e) {} }
      } else initNote = "";
    }
    let injNote = "";
    if (h.injury !== false) {
      const injName = await edhaAddInjury(target, { source: item.name });
      injNote = injName ? ` The raising leaves its mark: <strong>${injName}</strong> (injury added).` : ` <strong>GM: add ONE additional injury</strong> to ${target.name}.`;
    }
    edhaTreeCard(owner, null, `<p>⚰️ <strong>${item.name}</strong>: ${target.name} returns to life at <strong>1 HP</strong>${statusNote}${h.initiative !== false ? `, acting on ${owner.name}'s initiative` : ""}.${spendNote}${injNote}${initNote}${h.oncePerScene !== false ? ` <span style="opacity:.8">(Once per scene.)</span>` : ""}${h.note ? ` <span style="opacity:.8">${h.note}</span>` : ""}</p>`);
  } catch (e) { console.error("Edha Content | edha-revive flow failed", e); }
}

/* --- Scene cleanup (deleteCombat): the whole Death state resets ------------------------------------- */
// Death was already ENGINE_INDEX's "template" (statuses on tokens AND directory actors, the raw
// lists.<key> unset on characters) — it just ran that as two separate, non-deduped loops. R-60
// folds both into edhaSceneReset's one deduped pass: "decay"/"deathWard" (previously token-only, so
// an off-scene bearer kept them forever — the same shape as the Sovereignty bug) now reach the wide
// population, same as "lists.remains" (previously character-only). `cascadearmed`/`withernext` were
// already effectively wide (visited via both loops when on-scene); now visited exactly once.
async function edhaClearDeathState(endedCombat) {
  await edhaSceneReset(endedCombat, {
    key: "death",
    flags: ["decay", "deathWard", "lists.remains"],   // ⚠ raw path (§9o trap 3): lists.remains is the repointed ledger key, hand-edited here
    statuses: ["decaying", "harvested", "cascadearmed", "withernext"],
  });
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

