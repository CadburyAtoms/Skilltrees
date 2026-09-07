/* ============================================================================================
 * LIFE (Anaveth, deity) tree engine (2026-06-17) — a Blue/Green healer-buffer. Reuses the Green heal
 * machinery wholesale (edhaCrossHeal, the Resurgent-Growth regrowth-queue pattern, edhaAddAffliction,
 * the Bulwark redirect cards, edha-overflow-thp) — NO side-engine, NO new data handler or sidecar.
 * Colors Blue/Green; tag prefix "Life (Anaveth)."; build `foundry-build deity` → pack `edha-deity`.
 *
 * Wired via AUTHORED data events (already in deity-life.json — pack-built; NOT touched by this section):
 *   • Vital Diagnosis  — edha-apply-status (Diagnosed + @tier vital vs the marked creature, any ally).
 *   • Life Surge       — base heal + edha-overflow-thp (healing beyond max HP → Temp HP).
 *   • Overgrowth       — base heal + edha-overflow-thp {deflectStackMax: 3} (07-25 pass 2bS: the
 *     FIELD discriminates the Deflect rider now — Life Surge's identical overflow rule grants none;
 *     the old item.name === "Overgrowth" check is gone).
 *   • Prognosis        — edha-damage-rider (+[T][D] heal vs a conditioned creature) +
 *                        edha-marked-damage-trigger (recover 1 Inv when a Diagnosed creature is hit).
 *
 * DOCUMENT-DRIVEN since 2bW (07-25) — the useItem switch and the Surgical name-hook are GONE; all
 * five remaining ratchet talents ride their own rules (data/authored/deity-life.json). What stays
 * here is the flag-driven machinery those rules write into, no talent name in code:
 *   • Adaptive Mutation  — `edha-mutation` (the chooser card; riders as rule fields). The flag
 *     readers are unchanged: Bone Spurs rides edhaLifeOutgoingBonus in the damage PRE-pass; Venom
 *     Glands rides edhaLifeVenomOnHit in the POST-pass (edhaAddAffliction); Dense Tissue subtracts
 *     from deflectable incoming via edhaLifeDeflectReduce and refuses forced movement (the
 *     preUpdateToken veto below). One adaptation per creature; scene — ENFORCED since 07-27b
 *     (bench run 5, 2bW-12): a preUseItem veto refuses pre-cost on an already-mutated target,
 *     and the chooser click is belted the same way, so a stale card cannot replace the graft.
 *   • Primal Regeneration / Apex Form — `edha-regen-grant`: a `lifeRegen` entry parked on the
 *     OWNER (the regrowth-queue pattern); edhaResolveLifeRegen heals the target at the START OF
 *     THE TARGET'S turn via edhaCrossHeal (⚠ this resolver IS the cross-actor turn dispatcher —
 *     it predates edha-combat-timing and stays). Primal: endOnVitalSpirit + mutationFormula.
 *     Apex Form (capstone, FIVE mechanics — all five ride the one rule): the regen entry, +2
 *     Deflect + +tier vital (the `apexForm` flag), adaptation DOUBLING (every reader checks the
 *     flag — 07-16c Ben E19), and the Injury when it ends (edhaClearLifeState's apex branch).
 *   • Surgical Precision — the base skill_test heal is the system's; the cleanse is its
 *     `edha-cleanse` {trigger: success-damage-roll} rule, read by the damageRoll watcher below.
 *     ⚠ 07-27b (bench run 5, 2bW-15): the watcher DECIDES the outcome itself — captured test vs
 *     the rule's `def` (phy) — because the system binds NO DC to a skill_test talent's d20 and
 *     `roll.options.graze` only tells the twin damage rolls apart (it is the attached graze
 *     sub-roll on the main fire, absent on the graze twin — the old check posted the cleanse on
 *     every use). Test vs Physical (a DEFENSE) → base pipeline, NOT the contest core.
 *   • Lifeline — `edha-redirect` {direction: intercept, watchFlag: lifeline, linkOnUse,
 *     chooseAmount, takeType: spirit, healFormula}: use links the creature; the generic intercept
 *     sweep offers the up-to-half absorb (Spirit ignores Deflect) + [T][D] heal-back, once/round.
 *   ⚠ edhaClearLifeState's key list ("mutation", "apexForm", "lifeline", "lifeRegen") is a RAW
 *     path list (§9o trap 3) — a Lifeline rule using a different watchFlag needs its own cleanup.
 * Hooks/tools notes (07-04, unchanged): the Bone Spurs / Venom melee clause is edhaAttackKind-
 * gated (⚑ the cosmere weapon system.range shape stays the standing bench caveat); Apex's injury
 * lands from the scene-clear via edhaAddInjury.
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Adaptive Mutation Dense Tissue "immune to forced movement" — WIRED 07-16c (Ben E16): every
 *     engine push refuses at edhaRunPush + an edhaHostileMove preUpdateToken veto backstop
 *     (willing slides stamp only edhaForced and pass).
 *   • Apex Form "active mutations doubled" — WIRED 07-16c (Ben E19): Bone Spurs keen, Venom
 *     amount, and Dense Tissue's deflect all ×2 while the dealer/bearer carries apexForm.
 *   • Overgrowth's +1 Deflect — WIRED 07-12 (the AE stack, edhaOvergrowthDeflectStack; this line
 *     was stale until 07-16c; 07-25 pass 2bS: selected by the rule's deflectStackMax field, no
 *     name). (Vital Diagnosis's "know its exact HP/defenses"
 *     was UPGRADED 2026-07-04: on use, Knowledge's whispered HP/conditions/defense snapshot
 *     (edhaGnosisRevealLines, built AFTER Life declared this manual) posts for the synced target.)
 *   • CONTEST-EXEMPT: none — Surgical Precision tests vs a DEFENSE (base pipeline), not an opposed skill.
 * ============================================================================================ */
// The heal-rider deflect stack ("+1 Deflect, stacks to <max>") — one AE per creature, its bonus
// stepped per heal (key system.deflect.bonus, the same DerivedValueField .bonus fold the defense
// buffs use). "End of scene" = cleared when combat ends (the Kindle-light convention). Called from
// the applyDamage heal post-pass; the applying client just healed the target, so it can write the
// AE too. 07-25 pass 2bS: label + cap come from the healing talent's rule (`deflectStackMax` on its
// edha-overflow-thp rule); the flag key stays `overgrowthDeflect` so pre-07-25 AEs on a live scene
// still clear at combat end.
async function edhaOvergrowthDeflectStack(target, label, max) {
  try {
    label = label || "Natural armor"; max = Math.max(1, Number(max) || 3);
    const ex = (target.effects ?? []).find(e => e.getFlag?.("edha-content", "overgrowthDeflect"));
    const cur = ex ? (Number(ex.getFlag("edha-content", "overgrowthDeflect")) || 1) : 0;
    if (cur >= max) { ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🌿 <strong>${label}</strong>: ${target.name}'s natural armor is already at <strong>+${max} Deflect</strong> (max).</p>` }); return; }
    const n = cur + 1;
    const changes = [{ key: "system.deflect.bonus", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(n), priority: 20 }];
    if (ex) await ex.update({ name: `${label} (+${n} Deflect)`, changes, "flags.edha-content.overgrowthDeflect": n });
    else await target.createEmbeddedDocuments("ActiveEffect", [{
      name: `${label} (+${n} Deflect)`, img: "icons/magic/nature/barrier-shield-wood-vines.webp", changes,
      description: `<p>Natural armor from ${label}: +${n} Deflect (stacks to ${max}) until the end of the scene.</p>`,
      flags: { "edha-content": { overgrowthDeflect: n } },
    }]);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🌿 <strong>${label}</strong>: ${target.name} grows natural armor — <strong>+${n} Deflect</strong>${n >= max ? " (max)" : ` (stacks to ${max})`} until end of scene.</p>` });
  } catch (e) { console.error("Edha Content | heal-rider deflect stack failed", e); }
}
Hooks.on("deleteCombat", (combat) => {   // end of encounter ≈ end of scene (Kindle-light convention)
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier (07-27b — the 2bW-13 family)
    const guard = edhaCombatEndGuard(combat);   // ⛑ cross-combat clobber guard
    for (const t of canvas?.tokens?.placeables ?? []) {
      if (edhaStillFightingElsewhere(t.actor, guard)) continue;
      const ex = t.actor?.effects?.filter(e => e.getFlag?.("edha-content", "overgrowthDeflect")) ?? [];
      if (ex.length) void t.actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id));
    }
  } catch (e) {}
});

const EDHA_LIFE_GREEN_DIE = "(@tier)d(2 * @skills.green.rank + 2)";   // [Tier][Die] on the Green heal track
const EDHA_MUTATION_LABEL = { boneSpurs: "Bone Spurs", venomGlands: "Venom Glands", denseTissue: "Dense Tissue" };   // adaptation KINDS (flag values), not talent names
const _edhaSurgicalDebounce = new Map();   // dedupe the twin (main + graze) damageRoll fire per use (the cleanse watcher)

/* --- Buff reads for the applyDamage pre/post-pass (called from the central wrapper) ---------------- */
// Extra Deflect granted by Dense Tissue / Apex Form (read off the buffed creature when IT takes damage).
function edhaLifeBonusDeflect(actor) {
  let d = 0;
  const a = actor?.getFlag?.("edha-content", "apexForm");
  const m = actor?.getFlag?.("edha-content", "mutation");
  if (m?.deflect) d += (a ? 2 : 1) * (Number(m.deflect) || 0);   // Apex Form doubles active mutations (07-16c)
  if (a?.deflect) d += Number(a.deflect) || 0;
  return Math.max(0, d);
}
// +Deflect = subtract from deflectable (energy/impact/keen) incoming instances, before they apply.
function edhaLifeDeflectReduce(target, list) {
  try {
    const d = edhaLifeBonusDeflect(target); if (d <= 0 || !list?.length) return;
    let left = d, done = 0;
    for (const inst of list) {
      if (left <= 0) break;
      if (!inst || inst.type === "heal" || !["energy", "impact", "keen"].includes(inst.type)) continue;
      const cur = Math.max(0, Math.floor(Number(inst.amount) || 0));
      const cut = Math.min(cur, left); inst.amount = cur - cut; left -= cut; done += cut;
    }
    if (done > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🧬 <strong>${target.name}</strong>'s natural armor absorbs <strong>${done}</strong> (Life — adaptation/apex +Deflect).</p>` });
  } catch (e) { console.error("Edha Content | Life deflect-reduce failed", e); }
}
// Bone Spurs (+tier keen, melee — edhaAttackKind-gated) / Apex Form (+tier vital): a bonus instance
// on the BUFFED creature's hit. A definitive ranged hit stands the Spurs down; unknown = owner-judged.
// Apex Form DOUBLES active mutations (07-16c, Ben E19 — was a GM ruling on the numbers).
// `graze` (item 56 / R-14): this application is the graze half of the card. Each rider carries its
// own dial, baked onto the flag from the rule (`mutation.onGraze`, `apexForm.vitalOnGraze`); ONLY an
// explicit `false` stands the rider down on a graze — a flag without the field behaves as before.
function edhaLifeOutgoingBonus(dealerActor, list, dealerItem = null, graze = false) {
  try {
    if (!dealerActor || !list?.length) return;
    if (!list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;   // only ride a real hit
    const m = dealerActor.getFlag?.("edha-content", "mutation");
    const a = dealerActor.getFlag?.("edha-content", "apexForm");
    const apexDbl = a ? 2 : 1;
    if (m?.kind === "boneSpurs" && m.keen > 0) {
      const kind = edhaAttackKind(dealerItem);
      if (graze && m.onGraze === false) {
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🦴 <strong>Bone Spurs</strong> (Life): graze — the rider fires on a hit only.</p>` });
      } else if (kind === "ranged") {
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🦴 <strong>Bone Spurs</strong> (Life): ranged attack — the melee rider stands down.</p>` });
      } else {
        list.push({ amount: Math.floor(m.keen) * apexDbl, type: "keen" });
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🦴 <strong>Bone Spurs</strong> (Life): +${Math.floor(m.keen) * apexDbl} keen on the strike${apexDbl > 1 ? ` (doubled — ${a?.sourceName || "apex"})` : ""}${kind === "melee" ? " (melee — auto-checked)" : " (melee — GM withholds on a ranged attack)"}.</p>` });
      }
    }
    if (a?.vital > 0 && graze && a.vitalOnGraze === false) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🌟 <strong>${a.sourceName || "Apex"}</strong> (Life): graze — the +vital rider fires on a hit only.</p>` });
    } else if (a?.vital > 0) {
      list.push({ amount: Math.floor(a.vital), type: "vital" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🌟 <strong>${a.sourceName || "Apex"}</strong> (Life): +${Math.floor(a.vital)} vital on the strike.</p>` });
    }
  } catch (e) { console.error("Edha Content | Life outgoing-bonus failed", e); }
}
// Venom Glands (melee — edhaAttackKind-gated): the buffed creature's hit afflicts the foe (½[T][D]
// vital, baked at apply). A definitive ranged hit doesn't envenom; unknown = owner-judged.
async function edhaLifeVenomOnHit(dealerActor, victim, dealerItem = null, graze = false) {
  try {
    const m = dealerActor?.getFlag?.("edha-content", "mutation");
    if (m?.kind !== "venomGlands" || !(m.venom > 0) || !victim) return;
    if (graze && m.onGraze === false) {   // item 56 / R-14: "melee HITS inflict Afflicted" — the card's own wording
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🐍 <strong>Venom Glands</strong> (Life): graze — the venom needs a melee hit.</p>` });
      return;
    }
    const kind = edhaAttackKind(dealerItem);
    if (kind === "ranged") {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🐍 <strong>Venom Glands</strong> (Life): ranged attack — the venom needs a melee hit.</p>` });
      return;
    }
    const apex = dealerActor.getFlag?.("edha-content", "apexForm");   // apex doubles active adaptations (07-16c)
    const venomDbl = apex ? 2 : 1;
    await edhaToggleStatus(victim, "afflicted", true);
    await edhaAddAffliction(victim, Math.floor(m.venom) * venomDbl, "vital", "Venom Glands");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealerActor }), content: `<p>🐍 <strong>Venom Glands</strong> (Life): ${victim.name} is Afflicted — ${Math.floor(m.venom) * venomDbl} ongoing vital${venomDbl > 1 ? ` (doubled — ${apex?.sourceName || "apex"})` : ""}${kind === "melee" ? " (melee — auto-checked)" : " (melee — GM withholds on a ranged attack)"}.</p>` });
  } catch (e) { console.error("Edha Content | Venom Glands failed", e); }
}

// Dense Tissue forced-movement VETO (07-16c, Ben E16 — backstop to the edhaRunPush early-out):
// any HOSTILE engine move (options.edhaHostileMove, stamped by pushes/pulls) against a Dense
// Tissue bearer is refused at the document layer. Willing engine slides (edhaForced only) pass.
Hooks.on("preUpdateToken", (doc, changes, options) => {
  try {
    if (!options?.edhaHostileMove) return;
    if (!("x" in changes) && !("y" in changes)) return;
    if (doc.actor?.getFlag?.("edha-content", "mutation")?.kind !== "denseTissue") return;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: doc.actor }), content: `<p>🧬 <strong>Dense Tissue</strong>: ${doc.name} is immune to forced movement — the push does nothing.</p>` });
    return false;
  } catch (e) { /* fail-open */ }
});

/* --- Primal Regeneration / Apex Form — start-of-turn regen, parked on the OWNER (regrowth pattern) -- */
async function edhaAddLifeRegen(owner, entry) {
  try {
    const list = foundry.utils.deepClone(owner.getFlag("edha-content", "lifeRegen") ?? []);
    const next = list.filter(e => !(e.targetUuid === entry.targetUuid && e.sourceName === entry.sourceName));
    next.push(entry);
    await owner.setFlag("edha-content", "lifeRegen", next);
  } catch (e) { /* perms */ }
}
async function edhaResolveLifeRegen(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const cur = combat.combatant?.actor; if (!cur) return;
    for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
      const list = owner.getFlag?.("edha-content", "lifeRegen"); if (!list?.length) continue;
      for (const e of list) {
        if (e.targetUuid !== cur.uuid) continue;
        let formula = e.formula;
        // The adaptation upgrade: rule-carried since 2bW (mutationFormula); pre-2bW entries carried
        // the boolean, kept as a fallback so a live scene survives the deploy.
        const mf = String(e.mutationFormula || "").trim() || (e.mutationBonus ? `${EDHA_LIFE_GREEN_DIE} + 1` : "");
        if (mf && cur.getFlag?.("edha-content", "mutation")) formula = mf;
        const roll = await edhaRollFormula(owner, formula);
        const amt = Math.max(0, Math.floor(roll.total));
        if (amt > 0) {
          const got = await edhaCrossHeal(cur, amt);   // item 68: announce the delivered HP
          const line = edhaHealLine(cur, amt, got, d => `${cur.name} regenerates <strong>${d}</strong> HP`);
          if (line) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🌿 <strong>${e.sourceName}</strong> (${owner.name}): ${line}.</p>` });
        }
      }
    }
  } catch (e) { console.error("Edha Content | Life regen resolve failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaResolveLifeRegen(combat); });
// Primal Regeneration ends if the target takes Vital or Spirit damage (drop matching entries everywhere).
async function edhaLifeRegenEndOnDamage(victim, list) {
  try {
    if (!victim || !list?.some(i => Number(i?.amount) > 0 && (i.type === "vital" || i.type === "spirit"))) return;
    for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
      const l = owner.getFlag?.("edha-content", "lifeRegen"); if (!l?.length) continue;
      const dropped = l.filter(e => e.targetUuid === victim.uuid && e.endOnVitalSpirit);
      if (dropped.length) {
        try { await owner.setFlag("edha-content", "lifeRegen", l.filter(e => !dropped.includes(e))); } catch (e) {}
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: victim }), content: `<p>🥀 <strong>${dropped[0]?.sourceName || "Regeneration"}</strong> on ${victim.name} ends — it took Vital/Spirit damage.</p>` });
      }
    }
  } catch (e) { console.error("Edha Content | Life regen end-check failed", e); }
}

/* --- The adaptation chooser (edha-mutation's support surface — field-driven since 2bW) -------------- */
function edhaPostMutationCard(owner, target, label, h) {
  try {
    const t = target ?? owner;
    const opts = [];
    const keenF = String(h?.keenFormula || "").trim();
    const venomF = String(h?.venomFormula || "").trim();
    const defl = Math.max(0, Number(h?.deflectAmount) || 0);
    // The per-rider graze dial rides the card into the flag (item 56 / R-14): "0" = hit only.
    const og = (v) => (v === false ? `data-edha-ongraze="0"` : `data-edha-ongraze="1"`);
    if (keenF) opts.push(["boneSpurs", "Bone Spurs (+keen on melee hits)", `data-edha-keenf="${encodeURIComponent(keenF)}" ${og(h?.keenOnGraze)}`]);
    if (venomF) opts.push(["venomGlands", "Venom Glands (Afflicted — ongoing vital, melee)", `data-edha-venomf="${encodeURIComponent(venomF)}" ${og(h?.venomOnGraze)}`]);
    if (defl > 0) opts.push(["denseTissue", `Dense Tissue (+${defl} Deflect, no forced movement)`, `data-edha-deflect="${defl}"`]);
    if (!opts.length) return;
    const rows = opts.map(([k, l, extra]) => `<button type="button" class="edha-mutation-btn" data-edha-owner="${owner.uuid}" data-edha-target="${t.uuid}" data-edha-kind="${k}" ${extra}>${l}</button>`).join(" ");
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🧬 <strong>${label}</strong> — choose ${t.name}'s adaptation (scene; one per creature):${h?.note ? ` <span style="opacity:.8">${h.note}</span>` : ""}</p>${rows}</div>` });
  } catch (e) { console.error("Edha Content | mutation card failed", e); }
}
async function edhaMutationClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner);
    const target = await edhaResolveActorRef(ds.edhaTarget);
    if (!owner || !target || !ds.edhaKind) return;
    /* The once-per-creature BELT (2026-07-27b — bench run 5, 2bW-12): a stale chooser card (posted
     * before the pre-cost veto below existed, or a second chooser whispered before the first was
     * clicked) must not silently REPLACE the graft — the first pick binds for the scene. */
    const cur = target.getFlag?.("edha-content", "mutation");
    if (cur) {
      btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-mutation-btn").forEach(b => b.disabled = true);
      btn.textContent = "already adapted";
      void edhaMarkCardResolved(edhaMessageIdOf(btn), "already adapted");   // R-66: persists past F5/second client
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🧬 ${target.name} already carries <strong>${EDHA_MUTATION_LABEL[cur.kind] || "an adaptation"}</strong> — one adaptation per creature per scene; the earlier pick stands.</p>` });
      return;
    }
    const kind = ds.edhaKind, rd = owner.getRollData();
    let keen = 0, venom = 0;
    if (kind === "boneSpurs") keen = Math.max(0, Math.floor(edhaEvalSync(decodeURIComponent(ds.edhaKeenf || "@tier"), rd)));
    if (kind === "venomGlands") { const r = await edhaRollFormula(rd, decodeURIComponent(ds.edhaVenomf || "0")); venom = Math.max(0, Math.floor(r.total)); }
    const flag = { kind, sceneId: canvas?.scene?.id ?? null, ownerUuid: owner.uuid,
      keen, venom, deflect: kind === "denseTissue" ? Math.max(0, Number(ds.edhaDeflect) || 0) : 0 };
    if (ds.edhaOngraze !== undefined) flag.onGraze = ds.edhaOngraze !== "0";   // item 56 / R-14: the rule's dial, baked; absent = fires on a graze (as before)
    await edhaSetEdhaFlag(target, "mutation", flag);   // Job 6: edhaSetActorFlagCross retired (literal twin of edhaSetEdhaFlag)
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-mutation-btn").forEach(b => b.disabled = true);
    btn.textContent = "✓ applied";
    void edhaMarkCardResolved(edhaMessageIdOf(btn), "✓ applied");   // R-66: persists past F5/second client
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🧬 ${target.name} gains <strong>${EDHA_MUTATION_LABEL[kind] || kind}</strong> for the scene.</p>` });
  } catch (e) { edhaClickFailed("mutation click", e); }
}
/* (edhaApplyApexForm / edhaApplyPrimalRegen retired 2bW — `edha-regen-grant` writes the same
 * apexForm flag + lifeRegen entry from the talents' own rules. edhaLinkLifeline / the Lifeline
 * card + click retired the same pass — `edha-redirect` {intercept, watchFlag, chooseAmount} and
 * the generic intercept sweep/click carry the link, the offer and the absorb.) */

/* edha-mutation's pre-cost VETO (2026-07-27b — bench run 5, 2bW-12). The card's own clause —
 * "(scene; one per creature)" — was enforced NOWHERE: a second use on an already-mutated creature
 * posted a second chooser, charged the cost again, and the click silently REPLACED the graft.
 * An executor runs AFTER the system charges the cost, so the gate lives here and refuses with
 * nothing spent (the H1/H12/H3 precedent). Keyed on the rule, never a name. The gate reads bare
 * flag EXISTENCE, no sceneId check, because that is what every mutation reader does — the flag
 * lives until the Life scene reset (deleteCombat) clears it, and that IS "the scene" engine-wide. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-mutation"); if (!h) return;
    const target = edhaUserTargetActor() ?? actor;
    const cur = target.getFlag?.("edha-content", "mutation");
    if (cur) {
      ui.notifications?.warn(`Edha: ${target.name} already carries ${EDHA_MUTATION_LABEL[cur.kind] || "an adaptation"} — one adaptation per creature per scene. Nothing spent.`);
      return false;
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* --- The cleanse-on-success watcher (edha-cleanse {trigger: success-damage-roll} — 2bW) ------------- */
/* --- edhaPostCleanseCard / edhaCleanseOfferClick (ENGINE PASS 5.3, Job 8) — ONE poster + ONE click
 * for "offer to remove one of these conditions from a target" cards. Life's edhaPostLifeCleanseCard/
 * edhaLifeCleanseClick and Restoration's edhaPostNaturalRecoveryCard/edhaNaturalRecoveryClick built
 * near-identical versions, differing only in: WHICH conditions to offer (each caller's own filter —
 * unchanged, computed before calling this), the emoji, the exact prompt/result text, and whether a
 * cost note is shown. Cost note is now supported on BOTH — additive: Life's caller below passes none,
 * so its card and confirmation message keep their EXACT prior text (no parenthetical); nothing
 * before this pass could have asked Life for one. */
function edhaPostCleanseCard(owner, target, label, present, { cssClass, emoji, prompt, costNote = "" } = {}) {
  try {
    if (!present.length) return;
    const rows = present.map(c => `<button type="button" class="${cssClass}" data-edha-owner="${owner.uuid}" data-edha-target="${target.uuid}" data-edha-status="${c}" data-edha-label="${encodeURIComponent(label)}" data-edha-emoji="${encodeURIComponent(emoji)}" data-edha-costnote="${encodeURIComponent(costNote)}">${edhaConditionLabel(c)}</button>`).join(" ");
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>${emoji} <strong>${label}</strong> — ${prompt}</p>${rows}</div>` });
  } catch (e) { console.error("Edha Content | cleanse card failed", e); }
}
async function edhaCleanseOfferClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner);
    const target = await edhaResolveActorRef(ds.edhaTarget);
    if (!owner || !target || !ds.edhaStatus) return;
    await edhaToggleStatus(target, ds.edhaStatus, false);
    btn.closest(".edha-trigger-card")?.querySelectorAll("button").forEach(b => b.disabled = true);
    btn.textContent = "✓ cleansed";
    void edhaMarkCardResolved(edhaMessageIdOf(btn), "✓ cleansed");   // R-66: persists past F5/second client
    const emoji = ds.edhaEmoji ? decodeURIComponent(ds.edhaEmoji) : "🩺";
    const label = ds.edhaLabel ? decodeURIComponent(ds.edhaLabel) : "Cleanse";
    const costNote = ds.edhaCostnote ? decodeURIComponent(ds.edhaCostnote) : "";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>${emoji} <strong>${label}</strong> (${owner.name}): removed <strong>${edhaConditionLabel(ds.edhaStatus)}</strong> from ${target.name}${costNote ? ` (${costNote})` : ""}.</p>` });
  } catch (e) { edhaClickFailed("cleanse offer click", e); }
}
function edhaPostLifeCleanseCard(owner, target, label, conditions) {
  const want = (conditions && conditions.length) ? conditions : null;
  const present = [...(target.statuses ?? [])].filter(c => want ? want.includes(c) : !!CONFIG.COSMERE?.statuses?.[c]?.condition);
  edhaPostCleanseCard(owner, target, label, present, {
    cssClass: "edha-lifecleanse-btn", emoji: "🩺", prompt: `success: remove one condition from ${target.name}:`,
  });
}
/* Any talent carrying an edha-cleanse rule with `trigger: success-damage-roll` posts its cleanse
 * card for the CURRENT TARGET when the use's own TEST beat the rule's defense. The 07-27b version
 * DECIDED at damageRoll time — wrong POINT, deterministically (bench run 6, 2bW-15, attempt 2):
 * for a non-attack skill_test talent with damage, the system's use() rolls the DAMAGE before the
 * SKILL TEST (system index.js ~7246: rollDamage precedes the activation-type branch's this.roll),
 * so at damageRoll time the current use's test does not exist yet. The decider therefore read
 * either NOTHING (fail-open — the sheet path's wrong cleanse at PHY 45) or the PREVIOUS use's
 * still-TTL-fresh capture (the console path's "21 vs PHY 45" note under its own d20 of 25).
 * Not a race: one-behind by construction.
 *
 * Now the damageRoll fire only ARMS a pending decision (rule dials + the target captured while
 * the use's targeting is live), and the decision runs when the actor's OWN matching test arrives
 * on the roll hooks — the roll is read straight off the hook args, so there is no shared "last
 * roll" slot to consume off-by-one. edhaCleanseArmMode (pure, pinned) picks the path:
 *   • "immediate"    — no comparison wanted (blank def) or no test to wait for (a damage-only
 *                      activation): decide now, fail-open shape unchanged.
 *   • "consume-back" — the attack path (rollAttack rolls the TEST first, ms before damage): a
 *                      back-fresh same-skill capture within EDHA_CLEANSE_BACK_MS is THIS use's.
 *   • "arm"          — the skill_test path: wait for the test (TTL = EDHA_CONTEST_TTL for slow
 *                      roll dialogs; a cancelled use's arm is overwritten by the next or expires).
 * Meet-or-beat posts the cleanse; under posts the whispered graze note; unreadable defense still
 * FAILS OPEN (H1's convention). Was the name-keyed Surgical Precision hook (2bW). */
const _edhaCleansePending = new Map();   // actorId -> { label, defId, conditions, targetUuid, want, ts }
const EDHA_CLEANSE_BACK_MS = 1500;       // attack path only: test → damage is a same-flow ms gap, never a user gap
function edhaCleanseArmMode({ isSkillTest, defId, backRoll = null, now = 0, backMs = EDHA_CLEANSE_BACK_MS, wantSkill = "" } = {}) {
  if (!defId || !isSkillTest) return "immediate";
  const fresh = backRoll && !backRoll.used && (now - backRoll.ts) <= backMs
    && (!wantSkill || !backRoll.skill || backRoll.skill === wantSkill);
  return fresh ? "consume-back" : "arm";
}
function edhaCleanseDecide(actor, target, label, defId, conditions, total) {
  try {
    let ok = true, bar = null;
    if (defId && total !== null && total !== undefined) {
      const defVal = edhaReadDefense(target, defId);
      if (defVal !== null && defVal !== undefined) ({ ok, dc: bar } = edhaDefTestOutcome(total, { vs: "defense", defValue: defVal }));
    }
    if (!ok) {
      ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p>🩺 <strong>${label}</strong> — ${total} vs ${target.name}'s ${defId.toUpperCase()} ${bar}: <strong>graze</strong> — no condition is removed (the graze heal stands).</p>` });
      return;
    }
    edhaPostLifeCleanseCard(actor, target, label, conditions);
  } catch (e) { console.error("Edha Content | cleanse decide failed", e); }
}
Hooks.on("cosmere-rpg.damageRoll", (roll, item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-cleanse");
    if (!h || (h.trigger || "use") !== "success-damage-roll") return;
    const key = item.uuid ?? item.id ?? item.name, now = Date.now();
    if (now - (_edhaSurgicalDebounce.get(key) || 0) < 600) return;     // one arm per use (the twin damageRoll fires)
    _edhaSurgicalDebounce.set(key, now);
    const target = edhaUserTargetActor() ?? actor;
    const defId = (h.def === undefined || h.def === null) ? "phy" : String(h.def).trim();   // absent (pre-07-27b rule) = phy; explicitly blank = no comparison
    const conditions = String(h.conditions || "").split(/[,\s]+/).filter(Boolean);
    const want = String(item.system?.activation?.skill || "").trim();
    const back = _edhaLastRoll.get(actor.id);
    const mode = edhaCleanseArmMode({ isSkillTest: String(item.system?.activation?.type || "") === "skill_test", defId, backRoll: back, now, wantSkill: want });
    if (mode === "immediate") { edhaCleanseDecide(actor, target, item.name, defId, conditions, null); return; }
    if (mode === "consume-back") {
      back.used = true;   // this use's own test (the attack path rolled it ms ago) — consume it
      edhaCleanseDecide(actor, target, item.name, defId, conditions, Number(back.total) || 0);
      return;
    }
    // "arm": the test hasn't rolled yet — a second use before this resolves overwrites the arm.
    _edhaCleansePending.set(actor.id, { label: item.name, defId, conditions, targetUuid: target.uuid, want, ts: now });
  } catch (e) { console.error("Edha Content | cleanse-on-success watcher failed", e); }
});
// The decision point: the use's OWN test arriving. Registered AFTER edhaContestWatch (file order),
// so contests resolve first and the roll is read straight off the hook args — no slot lifecycle.
function edhaCleanseRollWatch(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    const p = _edhaCleansePending.get(actor.id); if (!p) return;
    if (Date.now() - p.ts > EDHA_CONTEST_TTL) { _edhaCleansePending.delete(actor.id); return; }   // stale arm (cancelled use)
    const skill = roll?.data?.skill?.id ?? null;
    if (p.want && skill && skill !== p.want) return;    // a different test — keep waiting for the talent's own
    _edhaCleansePending.delete(actor.id);
    const total = Number(roll.total) || 0;
    void (async () => {
      const target = await edhaResolveActorRef(p.targetUuid);
      if (!target) return;
      edhaCleanseDecide(actor, target, p.label, p.defId, p.conditions, total);
    })();
  } catch (e) { console.error("Edha Content | cleanse roll watch failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaCleanseRollWatch);

/* --- Button binding + scene cleanup (the name-keyed useItem switch is GONE — 2bW) ------------------- */
// Button binding: EDHA_CARD_BUTTONS["edha-mutation-btn"], ["edha-lifecleanse-btn"] (Job 1, pass 5.3, end of file).

/* 2026-07-27b (bench run 5, 2bW-13): the apex clear used to CREATE the injury while the flag was
 * still set, behind a raw `game.user?.isGM` hook gate. With two GM clients connected (Ben's host
 * client + the Bench GM user), BOTH ran the clear and Apex Form's end minted TWO injuries and two
 * cards — the only visible double, because this is the one deleteCombat clear that CREATES rather
 * than idempotently unsets. Three fences now: the hook runs on the ONE active GM
 * (edhaDefBuffGmGate, the engine's one-applier convention), the function refuses to overlap
 * itself (two combats deleted together fire two hooks), and the apex branch unsets the flag
 * BEFORE the injury round-trip so a re-read inside the window finds nothing to double. */
// R-60: population widens from "every game.actors entry" (already the widest of the ten) to
// edhaSceneReset's directory∪tokens dedup — an unlinked-token-only actor now also clears, matching
// the other nine. The re-entry guard (07-27b: two combats ending back-to-back could overlap this
// SAME sweep mid-actor and double-create Apex Form's ended-injury) is now edhaSceneReset's shared
// busy-set instead of this module-level boolean. ⚠️ R-60 first scoped that set by ENDED COMBAT, which
// silently un-guarded exactly this case — bench run 24 measured two cards and two injury Items off
// one flag; the fence that actually holds is edhaSceneReset's per-ACTOR claim (`key:uuid`, across
// combats), added 2026-09-05. This function needs nothing of its own. "mutation"/"lifeline"/"lifeRegen" are
// plain flags; "apexForm" alone creates a document, so it stays bespoke `extra` — read the value
// BEFORE unsetting (unset-first-create-after, 07-27b, so a re-read inside the create's round-trip
// finds nothing to double).
async function edhaClearLifeState(endedCombat) {
  await edhaSceneReset(endedCombat, {
    key: "life",
    flags: ["mutation", "lifeline", "lifeRegen"],
    extra: async (a) => {
      const fv = a.getFlag?.("edha-content", "apexForm");
      if (!fv) return;
      // The apex price lands when it ends (scene end IS the end) — the shared injury tool
      // creates the Item GM-side; the flag carries the granting talent's name (2bW).
      // UNSET FIRST, create after (07-27b): the creation awaits a server round-trip and must
      // never be reachable twice off one still-set flag.
      await a.unsetFlag("edha-content", "apexForm");
      const src = fv?.sourceName || "Apex";
      const injName = await edhaAddInjury(a, { source: `${src} (ended)`, damageType: "vital" });
      if (injName) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🌟 <strong>${src}</strong> ends — ${a.name} takes an injury: <strong>${injName}</strong>.</p>` });
    },
  });
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

