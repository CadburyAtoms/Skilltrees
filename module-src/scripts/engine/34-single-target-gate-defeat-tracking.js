/* ============================================================================================
 * SINGLE-TARGET GATE + DEFEAT TRACKING — two small guards that stop the most common table
 * mistakes, and the bookkeeping that answers "who killed that".
 *   • The gate (REUSABLE primitive, Ben ruling R1 07-12): a talent declared single-target is
 *     VETOED at preUseItem when the user has zero or several targets, with a pick-target card
 *     instead of a silent misfire. edhaSetUserTargets is the one writer of game.user.targets.
 *   • Defeat tracking: an updateActor watcher notices HP crossing zero and records the plausible
 *     killer(s) — edhaKillerCandidates — which is what every "when you defeat a creature" talent
 *     in the atlas reads. The cosmere system fires no defeat event of its own.
 * Owns: edhaSetUserTargets · edhaPickTargetClick · edhaKillerCandidates + the preUseItem gate
 *   and the updateActor defeat sync.
 * ============================================================================================ */

/* --- Single-target gate (REUSABLE primitive — Ben ruling R1, 07-12) --------------------------------
 * Talents in this set affect ONE creature; with several tokens targeted the system rolls/applies for
 * all of them (Withering Ray rolled twice; Verdant Mend healed a stale target). With >1 target the
 * use is cancelled BEFORE any cost and a whispered picker card lists the current targets — R1: a
 * prompt, never a hard block (a stray extra target can be off-screen/overlapped and invisible).
 * Clicking retargets to that one token and re-uses the talent. Add future single-target talents here. */
// EDHA_SINGLE_TARGET retired 07-24v: the gate is now the talent's own `edha-single-target` rule, so
// adding a single-target talent is authoring a rule rather than editing this file (iron rule 2b).
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (!edhaIsTalent(item) || !edhaRuleOf(item, "edha-single-target")) return;
    const targets = edhaUserTargetTokens();
    if (targets.length <= 1) return;
    const btns = targets.map(t => `<button type="button" class="edha-pick-target-btn" data-edha-item="${item.uuid}" data-edha-token="${t.id}">${t.name}</button>`).join(" ");
    ChatMessage.create({ whisper: [game.user.id], speaker: ChatMessage.getSpeaker({ actor: item.actor }),
      content: `<div class="edha-trigger-card"><p>🎯 <strong>${item.name}</strong> is single-target, but <strong>${targets.length}</strong> tokens are targeted. Pick one:</p><p>${btns}</p>`
        + `${edhaRuleOf(item, "edha-single-target")?.note ? `<p style="opacity:.8">${edhaRuleOf(item, "edha-single-target").note}</p>` : ""}</div>` });
    return false;
  } catch (e) { console.error("Edha Content | single-target gate failed", e); }
});
// Set the local user's targets (REUSABLE primitive): Foundry v13 REMOVED User#updateTokenTargets
// (zero hits in 13.351's foundry.mjs) — the supported client API is Token#setTarget. The first
// token releases the previous target set; an empty list clears it. Every engine retarget goes
// through here so the next core rename breaks ONE line.
function edhaSetUserTargets(tokens) {
  const list = (tokens || []).filter(t => typeof t?.setTarget === "function");
  if (!list.length) { for (const t of edhaUserTargetTokens()) t.setTarget(false, { releaseOthers: false }); return; }
  list.forEach((t, i) => t.setTarget(true, { releaseOthers: i === 0 }));
}
async function edhaPickTargetClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const item = await fromUuid(btn.dataset.edhaItem).catch(() => null);
    const tok = canvas?.tokens?.get(btn.dataset.edhaToken);
    if (!item || !tok) { ui.notifications?.warn("Edha: token or talent no longer available — retarget and re-use."); return; }
    edhaSetUserTargets([tok]);
    await edhaMarkCardResolved(edhaMessageIdOf(btn), `✓ ${tok.name}`);
    await item.use();
  } catch (e) { edhaClickFailed("single-target pick", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-pick-target-btn"] (Job 1, pass 5.3, end of file).

// Presumed-killer candidates for on-defeat events (the applyDamage hook only names the victim).
function edhaKillerCandidates() {
  const set = new Set();
  for (const t of (canvas?.tokens?.controlled ?? [])) if (t.actor) set.add(t.actor);
  if (game.user?.character) set.add(game.user.character);
  if (!set.size && game.user?.isGM) { const a = game.combat?.combatant?.actor; if (a) set.add(a); }
  return [...set];
}

// Defeated overlay TIED TO HP: a non-PC at 0 HP shows the skull; healing it above 0 (or a manual HP
// edit) removes it. updateActor catches every HP change (applyDamage does actor.update, and manual
// sheet edits too), so the skull stays in sync with health. PCs use the system's injury/death rules.
// ONE APPLIER (07-27q): this branch announces AND deletes, and a raw isGM runs it on every connected
// GM — bench run 13 caught the dissipates card posting twice, 1 ms apart, authored by `Bench` and
// `Gamemaster`. The isolating control was the recast break card in the Illusion section, which is
// activeGM-gated and posted exactly once in the same session. Same family as 07-27b's 2bW-13 sweep.
Hooks.on("updateActor", async (actor, changes) => {
  try {
    if (!edhaDefBuffGmGate() || actor.type === "character") return;
    const hp = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (hp === undefined) return;                                   // only react to HP changes
    // An illusory copy (edha-illusion-copy): any hit drops its 1 HP → the illusion ends; remove it
    // outright. The label is the copy's stamped source, so an adversary's seeming reads as itself.
    if (hp <= 0 && actor.getFlag?.("edha-content", "phantomDouble")) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🌫️ <strong>${actor.getFlag?.("edha-content", "phantomSource") || "Illusion"}</strong>: the illusion of ${actor.name} is struck and dissipates.</p>` });
      await edhaDeleteActorWithTokens(actor);                        // token-FIRST: Foundry never cascades actor→token
      return;
    }
    // A barrier (edha-barrier) at 0 HP is DESTROYED — the card's own wording — so it and its walls
    // go, rather than standing there wearing a skull and still blocking the corridor.
    const barrierId = actor.getFlag?.("edha-content", "barrierId");
    if (hp <= 0 && barrierId) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🛡️ <strong>${actor.name}</strong> is destroyed — the barrier comes down.</p>` });
      await edhaBarrierClearGM(barrierId);
      await edhaDeleteActorWithTokens(actor);                        // same orphan-token shape as the illusion above
      return;
    }
    const dead = CONFIG.specialStatusEffects?.DEFEATED || "dead";
    const has = !!actor.statuses?.has?.(dead);
    if (hp <= 0 && !has) await actor.toggleStatusEffect(dead, { active: true, overlay: true });
    else if (hp > 0 && has) await actor.toggleStatusEffect(dead, { active: false, overlay: true });
  } catch (e) { console.error("Edha Content | defeated HP-sync failed", e); }
});

