/* ============================================================================================
 * WHITE / BULWARK tree engine (2026-06-14) — damage mitigation / redirection / retaliation.
 * Center of gravity is the applyDamage wrapper. OPTIONAL REACTIONS can't cleanly intervene before a
 * synchronous apply, so they use the Mender's-Instinct model: a whispered post-damage card (ruling A);
 * tests OWNER-JUDGED (ruling D). IRON RULE 2b: ON THEIR OWN DOCUMENTS — the four reactions via H25
 * `edha-damage-react` (07-25, pass 2bQ); Shield Wall + Devoted Conduit via H27 `edha-damage-reduce`
 * and Guardian Stance via H7 `edha-aura` (07-25, pass 2bR — the name-keyed pre-pass loops and the
 * guardianStance sweep are gone). Hardy is the lone data-side AE (hea.max.bonus += @level).
 * ============================================================================================ */
function edhaAdjacent(tokA, tokB) {
  if (!tokA || !tokB) return false;
  const gs = (tokA.scene ?? canvas?.scene)?.grid?.size || 100;
  const dx = Math.abs((tokA.center?.x ?? 0) - (tokB.center?.x ?? 0)) / gs;
  const dy = Math.abs((tokA.center?.y ?? 0) - (tokB.center?.y ?? 0)) / gs;
  return Math.max(dx, dy) <= 1.05;   // Chebyshev ≤ 1 square (orthogonal + diagonal), small epsilon
}
function edhaAdjacentAllies(ownerTok) {
  const disp = ownerTok?.document?.disposition;
  return (canvas?.tokens?.placeables ?? []).filter(t => t.id !== ownerTok.id && t.actor
    && edhaSideSame(t.document?.disposition, disp) && (t.actor?.system?.resources?.hea?.value ?? 1) > 0 && edhaAdjacent(ownerTok, t));
}

/* --- H7 `edha-aura` — the adjacency-managed AE sweep (07-25, iron rule 2b) -------------------------
 * Guardian Stance's shape, generalized (07-12 pass 3 re-litigated ruling E; the name-keyed sweep is
 * retired): "while an ally is adjacent to you, you both gain +N to an attribute path." A GM-side
 * sweep manages one AE per aura rule (system.deflect.bonus is the same DerivedValueField .bonus the
 * defense buffs use; the sheet's "Armor" label is just the deflect SOURCE config, not a wrong key)
 * on the owner and every adjacent living ally, applied/removed as tokens move. The AE carries
 * flags.edha-content.aura = <talent name> so a sweep can match effect → rule; legacy
 * `guardianStance`-flagged AEs (pre-07-25 deploys) are swept off unconditionally — the aura AE
 * replaces them on the next pass, so the two can't double-stack. */
let _edhaAuraTimer = null;
function edhaAuraSweepSoon() {
  if (!edhaDefBuffGmGate()) return;
  if (!edhaWatchersOfRule("edha-aura").length) return;
  clearTimeout(_edhaAuraTimer);
  _edhaAuraTimer = setTimeout(() => { void edhaAuraSweep(); }, 250);
}
async function edhaAuraSweep() {
  try {
    const want = new Map();   // actor id -> Map(auraName -> spec) that should be on them right now
    for (const { actor: owner, item: tal, handler: h } of edhaWatchersOfRule("edha-aura")) {
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if ((owner.system?.resources?.hea?.value ?? 1) <= 0) continue;
      const allies = edhaAdjacentAllies(otok);
      if (!allies.length) continue;   // the aura needs at least one adjacent living ally to exist at all
      const amount = Number(h.amount) || 1;
      const spec = {
        name: h.label || `${tal.name} (+${amount})`,
        img: h.img || "icons/magic/defensive/shield-barrier-blue.webp",
        key: h.key || "system.deflect.bonus", amount,
        description: `<p>+${amount} while the ${tal.name} adjacency holds (auto-managed — move apart to remove).</p>`,
      };
      const put = (a) => { if (!a) return; if (!want.has(a.id)) want.set(a.id, new Map()); want.get(a.id).set(tal.name, spec); };
      put(owner);
      if (h.alsoAllies !== false) for (const t of allies) put(t.actor);
    }
    const seen = new Set();
    for (const t of canvas?.tokens?.placeables ?? []) {
      const a = t.actor; if (!a || seen.has(a.id)) continue;
      seen.add(a.id);
      const wantHere = want.get(a.id) ?? new Map();
      for (const eff of [...(a.effects ?? [])]) {
        if (eff.getFlag?.("edha-content", "guardianStance")) { await a.deleteEmbeddedDocuments("ActiveEffect", [eff.id]); continue; }   // legacy pre-07-25 AE
        const auraName = eff.getFlag?.("edha-content", "aura");
        if (!auraName) continue;
        if (wantHere.has(auraName)) wantHere.delete(auraName);            // already there — keep it
        else await a.deleteEmbeddedDocuments("ActiveEffect", [eff.id]);   // no longer wanted
      }
      for (const [auraName, spec] of wantHere) {
        await a.createEmbeddedDocuments("ActiveEffect", [{
          name: spec.name, img: spec.img,
          changes: [{ key: spec.key, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(spec.amount), priority: 20 }],
          description: spec.description,
          flags: { "edha-content": { aura: auraName } },
        }]);
      }
    }
  } catch (e) { console.error("Edha Content | aura sweep failed", e); }
}
Hooks.on("updateToken", (doc, changes) => { try { if ("x" in changes || "y" in changes) edhaAuraSweepSoon(); } catch (e) {} });
Hooks.on("createToken", () => edhaAuraSweepSoon());
Hooks.on("deleteToken", () => edhaAuraSweepSoon());
Hooks.on("combatStart", () => edhaAuraSweepSoon());
Hooks.once("ready", () => edhaAuraSweepSoon());
// Subtract `amount` total HP-damage from the non-heal instances (in place); returns the amount removed.
function edhaReduceInstances(list, amount) {
  let rem = Math.max(0, Math.floor(amount)), done = 0;
  for (const inst of list) {
    if (rem <= 0) break;
    if (!inst || inst.type === "heal" || !(Number(inst.amount) > 0)) continue;
    const cut = Math.min(rem, Number(inst.amount));
    inst.amount = Number(inst.amount) - cut; rem -= cut; done += cut;
  }
  return done;
}
// Cross-actor heal/damage: do it directly if we own the target, else relay to the GM (burst-apply).
// Every rule-driven heal riding this path respects the No-Healing/Healing-Halved mark (defect 5);
// bypassHealCut is for drop-to-1 PREVENTIONS only (Unbreakable Line — the Death Ward parity case).
// R-10 (b), 2026-09-06: that bypass is the RULING, not a shortcut — stabilizing at 1 is a floor
// against death, not regaining, so "cannot regain HP" must not stop it. See edhaHealCutGate's
// header for the whole drop-to-1 family; do not add a caller that passes this for a real heal.
// RETURNS THE AMOUNT DELIVERED (item 68, fix pass 8) — the gated number on both the owned and the
// relayed leg, 0 when the mark blocked it or there was nothing to heal. Every caller that ANNOUNCES
// a heal builds its card from this return value through edhaHealLine, never from the roll.
async function edhaCrossHeal(actor, amount, { bypassHealCut = false } = {}) {
  if (!actor || !(amount > 0)) return 0;
  if (!bypassHealCut) { amount = edhaHealCutGate(actor, amount); if (!(amount > 0)) return 0; }
  // Return what LANDED (item 68's contract), not what was asked for: edhaHealActor clamps at max.
  if (actor.isOwner) return await edhaHealActor(actor, amount);
  // Relay branch: the write happens on another client, so the delivered delta is not knowable here
  // — the requested amount is the honest best estimate. Cards on this path may still over-report a
  // target that was already at full HP.  (bench run 44, 2026-09-09)
  try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: actor.uuid, amount, heal: true }] } }); return amount; } catch (e) { return 0; }
}
async function edhaCrossDamage(actor, amount, type, opts = {}) {
  if (!actor || !(amount > 0)) return;
  if (actor.isOwner) { try { await actor.applyDamage([{ amount, type }], { chatMessage: false, ...opts }); } catch (e) {} return; }
  try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: actor.uuid, amount, type }] } }); } catch (e) {}
}
// Post a GM-ONLY whispered card that must never reach the players. A whisper is ALWAYS visible to its
// author, so a player who authored a "GM-only" card would see exactly the information it means to hide
// (Black Draw Mana's behind-a-wall / hidden enemy counts — 07-12b ruling, 07-17 playtest regression).
// The card is therefore CREATED BY THE GM: directly if we're the GM, else relayed. No GM online → no
// one to hide it from and no one to post it, so nothing is created.
async function edhaPostGmCard(actor, content) {
  try {
    if (game.user?.isGM) {
      const gmIds = edhaGmIds();   // R-62: hidden-info record card → all GMs (unchanged)
      if (gmIds.length && content) await ChatMessage.create({ whisper: gmIds, speaker: ChatMessage.getSpeaker({ actor }), content });
      return;
    }
    if (!game.users?.activeGM) return;
    game.socket.emit("module.edha-content", { action: "gm-card", payload: { actorUuid: actor?.uuid ?? null, content } });
  } catch (e) { console.error("Edha Content | GM card post failed", e); }
}

// Post-damage reaction cards (whispered, GM-posted). `redirected` short-circuits so Shared Burden's own
// redirected hit doesn't cascade into more reactions.
async function edhaBulwarkReactions(victim, dealer, dealtAmt, prevHp, newHp, redirected) {
  try {
    if (!edhaDefBuffGmGate() || redirected || dealtAmt <= 0) return;
    const vtok = edhaCasterToken(victim); if (!vtok) return;
    const vdisp = vtok.document?.disposition;   // R-63: no `?? 1` default — allyOwnerTok below Number.isFinite-guards it
    const attacker = (dealer?.actor && dealer.actor !== victim) ? dealer.actor : null;
    const atok = attacker ? (edhaCasterToken(attacker)) : null;
    // R-63: Number.isFinite fail-closed (was `?? 1` on both sides, comparing against the captured
    // vdisp) — an owner whose token's disposition cannot be resolved no longer counts as an ally by
    // default. 🤖 bench row.
    const allyOwnerTok = (owner) => { const o = edhaCasterToken(owner); const od = o?.document?.disposition; return (o && owner !== victim && Number.isFinite(od) && Number.isFinite(vdisp) && od === vdisp) ? o : null; };

    /* H25 `edha-damage-react` (07-25) — the four White Bulwark reactions used to be four
     * hand-written blocks here, each one an edhaCharacterOwnersOf(NAME) loop followed by a
     * hard-coded spec. They were ALREADY one shape: watch → gate → amount → action → cost →
     * prompt, and `edhaPostBulwarkCard` / `edhaBulwarkClick` were already generic off data
     * attributes. Only the SELECTION and the SPEC were name-keyed, so this dispatcher now
     * ANNOUNCES (sweeps rules) instead of hand-listing, and the spec rides each talent's document.
     * Adding a fifth reaction is now authoring, not engine work. */
    const dcOf = (h) => h.dcFormula ? Math.max(1, Math.ceil(edhaEvalSync(String(h.dcFormula).replace(/@dealt\b/g, String(dealtAmt)), {}))) : 0;
    for (const { actor: owner, item: tal, handler: h } of edhaWatchersOfRule("edha-damage-react")) {
      try {
        if ((h.when || "damaged") === "dropped-to-0" && !(newHp <= 0 && prevHp > 0)) continue;
        // rally-zone fires whoever fell — enemy, ally, even the owner (Ben R5: PCs/allies COUNT,
        // and the MAIN case is an enemy dropping in your Foundation). Every other action keeps the
        // same-side-not-victim gate.
        const otok = (h.action === "rally-zone") ? edhaCasterToken(owner) : allyOwnerTok(owner);
        if (!otok) continue;
        if (h.requireVictimInMyZone) {                                               // Bonds of Community (2bV)
          if (victim.getFlag?.("edha-content", "summon")) continue;                  // summons dissolve — the city doesn't mourn them
          const zscene = vtok.document?.parent ?? canvas?.scene;
          if (!edhaFoundationsOn(zscene, owner.id).some(d => edhaCivPointInFoundation(d, vtok.center.x, vtok.center.y))) continue;
        }
        if (h.requireAdjacent && !edhaAdjacent(otok, vtok)) continue;
        const ft = Number(h.rangeFt) || 0;
        if (ft > 0 && !edhaTokensWithin(otok, ft).some(t => t.id === vtok.id)) continue;
        if (h.requireAttackerWithinColor) {                                          // Retributive Guard
          if (!attacker || !atok) continue;
          if (!edhaSideHostile(atok.document?.disposition, otok.document?.disposition)) continue;   // the attacker must be a resolvable ENEMY of the owner (R-63)
          if (!edhaTokensWithin(otok, edhaAttuneFtColor(owner, h.requireAttackerWithinColor)).some(t => t.id === atok.id)) continue;
        }
        const f = String(h.amountFormula || "0").replace(/@dealt\b/g, String(dealtAmt));
        let amt = Math.floor(edhaEvalSync(f, owner.getRollData()));
        if (h.capAtDealt) amt = Math.min(dealtAmt, amt);
        if (!(amt > 0) && h.action !== "rally-zone") continue;   // rally-zone still grants advantage at 0 Temp HP
        amt = Math.max(0, amt);
        const dc = dcOf(h);
        const costs = h.costResource ? [{ resource: h.costResource, value: Number(h.costValue) || 0 }] : [];
        const prompt = String(h.prompt || "")
          .replace(/\{victim\}/g, victim.name).replace(/\{attacker\}/g, attacker?.name ?? "the attacker")
          .replace(/\{dealt\}/g, String(dealtAmt)).replace(/\{amount\}/g, `<strong>${amt}</strong>`)
          .replace(/\{dc\}/g, String(dc));
        edhaPostBulwarkCard(owner, tal.name, {
          victim: h.action === "retaliate" ? null : victim,
          attacker: h.action === "retaliate" ? attacker : null,
          action: h.action || "heal-ally", amount: amt, costs, prompt, oncePerRound: !!h.oncePerRound,
        });
      } catch (e) { console.error(`Edha Content | edha-damage-react (${tal?.name}) failed`, e); }
    }
    // (Lifeline's linked-creature offer rides the generic intercept sweep since 2bW —
    // `edha-redirect` {direction: intercept, watchFlag} — no name-keyed block here.)
  } catch (e) { console.error("Edha Content | Bulwark reactions failed", e); }
}
function edhaPostBulwarkCard(owner, name, { victim = null, attacker = null, action = "", amount = 0, costs = [], prompt = "", oncePerRound = false } = {}) {
  const costLabel = edhaChoiceCostLabel(costs);
  const attrs = [`data-edha-owner="${owner.uuid}"`, `data-edha-name="${encodeURIComponent(name)}"`, `data-edha-action="${action}"`,
    `data-edha-amount="${amount}"`, `data-edha-costs="${encodeURIComponent(JSON.stringify(costs))}"`, `data-edha-once="${oncePerRound ? 1 : 0}"`];
  if (victim) attrs.push(`data-edha-victim="${victim.uuid}"`);
  if (attacker) attrs.push(`data-edha-attacker="${attacker.uuid}"`);
  const row = `<button type="button" class="edha-bulwark-btn" ${attrs.join(" ")}>Use ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button>`;
  edhaPostChoiceCard(owner, { name, emoji: "🛡️", prompt, rows: row, onceGate: oncePerRound });
}
async function edhaBulwarkClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner); if (!owner) return;
    const name = decodeURIComponent(ds.edhaName || ""), action = ds.edhaAction || "";
    const amount = Math.max(0, Math.floor(Number(ds.edhaAmount) || 0)), once = ds.edhaOnce === "1";
    let costs = []; try { costs = JSON.parse(decodeURIComponent(ds.edhaCosts || "[]")) || []; } catch (e) {}
    if (once && !edhaCoordOPRAllowed(owner, name, "_react")) { ui.notifications?.info(`${name} already used this round.`); btn.disabled = true; return; }
    const victim = await edhaResolveActorRef(ds.edhaVictim);
    const attacker = await edhaResolveActorRef(ds.edhaAttacker);
    if (once) await edhaCoordOPRMark(owner, name, "_react");
    for (const c of costs) await edhaSpendResource(owner, c.resource, c.value);
    let note = "";
    if (action === "heal-ally" && victim) {
      /* item 68: the reduction IS a heal, so it is what the gate scales — the note reports the
       * delivered number (or names the mark), and the move happens either way. */
      const got = await edhaCrossHeal(victim, amount);
      const line = edhaHealLine(victim, amount, got, d => `${owner.name} reduces ${victim.name}'s damage by ${d}`);
      note = `${line ? `${line}; ` : ""}${owner.name} moves up to 10 ft toward ${victim.name} (Interposing Shield).`;
    }
    else if (action === "redirect" && victim) {
      const got = await edhaCrossHeal(victim, amount);
      try { await owner.applyDamage([{ amount, type: "vital" }], { chatMessage: false, edhaRedirected: true }); } catch (e) {}
      /* item 68: the owner ALWAYS takes the full amount — that number is measured and stays. What
       * a mark can change is how much of it comes back off the victim, so say so when it differs
       * (blocked, or halved); silent in the ordinary case, which is what the note always meant. */
      const short = edhaHealLine(victim, amount, got, d => (d < amount ? `only <strong>${d}</strong> of it is undone on ${victim.name}` : ""));
      note = `${owner.name} takes ${amount} in ${victim.name}'s place (Shared Burden).${short ? ` — ${short}.` : ""}`;
    }
    else if (action === "retaliate" && attacker) { await edhaCrossDamage(attacker, amount, "spirit", { edhaSource: owner }); note = `${owner.name} deals ${amount} spirit to ${attacker.name} (Retributive Guard — on a successful White test).`; }
    else if (action === "revive" && victim) { const cur = Number(victim.system?.resources?.hea?.value) || 0; await edhaCrossHeal(victim, Math.max(1, 1 - cur), { bypassHealCut: true }); note = `${victim.name} drops to 1 health instead of 0 (Unbreakable Line — on a successful White test).`; }   // prevention, not a heal — Death Ward parity (R-10 (b), 2026-09-06: a floor against death, not regaining)
    else if (action === "rally-zone") {
      const founds = edhaFoundationsOn(canvas?.scene, owner.id);
      const disp = edhaActorSide(owner);
      const allies = (canvas?.tokens?.placeables ?? []).filter(t => t.actor
        && edhaSideSame(t.document?.disposition, disp)
        && (t.actor.system?.resources?.hea?.value ?? 0) > 0
        && founds.some(d => edhaCivPointInFoundation(d, t.center.x, t.center.y)));
      if (!allies.length) { note = "no standing allies in your Foundations."; }
      else {
        for (const t of allies) {
          if (amount > 0) await edhaGrantTempHpCross(t.actor, amount, name);
          await edhaGrantAdvAttack(t.actor, name);
        }
        note = `${allies.map(t => t.name).join(", ")} gain${allies.length === 1 ? "s" : ""} ${amount} Temp HP and advantage on their next attack test.`;
      }
    }
    else { note = "(no valid target — re-target and retry)"; }
    btn.disabled = true; btn.textContent = `${name} used`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🛡️ <strong>${name}</strong>: ${note}</p>` });
  } catch (e) { edhaClickFailed("Bulwark click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-bulwark-btn"] (Job 1, pass 5.3, end of file).

