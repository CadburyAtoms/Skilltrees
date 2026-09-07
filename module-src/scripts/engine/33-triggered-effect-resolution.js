/* ============================================================================================
 * TRIGGERED-EFFECT RESOLUTION — the second half of the trigger machinery (gating and cost are
 * two banners above; the senses block between them is what target resolution reads). This is the
 * runner: resolve WHO the effect lands on, apply the payload, post the card, charge the cost.
 *
 * The pipeline, in order: edhaEffectTargets (an `eff.target` of self / victim / target /
 * allies / enemies / list-member → concrete actors) → edhaRunTriggerEffect (the payload switch:
 * damage, heal, status, resource, move, card) → edhaPostTriggerCard → edhaDeductCost.
 * edhaFireTrigger is the entry point the tree sections and the native-event handlers call.
 *
 * ⚠️ "victim" and "target" are NOT synonyms — edhaResolveVictim resolves the creature the
 * observed event happened TO, which for a reaction is usually not the user's current target.
 * Conflating them is a bug this file has shipped more than once.
 * ⚠️ Card state persists: edhaMarkCardResolved / edhaMessageIdOf stamp a clicked button so a
 * reload (or a second player) cannot resolve the same card twice (REUSABLE, Ben pass 3 07-12).
 * Owns — targeting: edhaUserTargetTokens · edhaUserTargetToken · edhaUserTargetActor ·
 *   edhaResolveVictim · edhaEffectTargets.
 * Owns — payload + cards: edhaToggleStatus · edhaRollCard · edhaRunTriggerEffect ·
 *   edhaFireTrigger · edhaPostTriggerCard · edhaDeductCost · edhaTriggerCardClick.
 * Owns — card-state persistence: edhaMarkCardResolved · edhaMessageIdOf.
 * ============================================================================================ */

/* R-64 (hygiene campaign 2026-08-10, ENGINE PASS 5.2). The single reader every inline
 * `Array.from(game.user?.targets ?? [])[0]` site used to hand-roll (four spellings: Array.from vs
 * spread, `?? null` vs bare, wanting the TOKEN vs its `.actor`) — one place now, so a future
 * Foundry API change (User#targets is already a Set, not an array) breaks one line.
 *
 * Item 14 (2026-09-06) finished the same job for the PLURAL shape. Nine sites still wanted the
 * WHOLE target list — `Array.from(game.user?.targets ?? [])` / `[...(game.user?.targets ?? [])]`,
 * then their own `.filter`/`.find`/`.some`/`.slice` — so they hand-rolled the read instead of the
 * pick. They all call edhaUserTargetTokens now, which makes this function's body the ONE place in
 * the engine that touches `game.user.targets` at all (edhaUserTargetToken is a `[0]` of it), so
 * lint-refs pass 20's `userTargets` ratchet FLOORS AT 1, not 0 — a reader cannot read through
 * itself. What the reader guarantees, and every hand-rolled copy also happened to: a fresh Array
 * every call, never the live Set, so a caller may filter/slice/sort it and a mid-loop retarget
 * (edhaSetUserTargets releasing the old set) cannot mutate it underfoot; and `[]`, never
 * undefined, when there is no `game.user` at all (pre-ready, or a hook firing on a headless run). */
function edhaUserTargetTokens() {
  return Array.from(game.user?.targets ?? []);
}
function edhaUserTargetToken() {
  return edhaUserTargetTokens()[0] ?? null;
}
function edhaUserTargetActor() {
  return edhaUserTargetToken()?.actor ?? null;
}

/* R-64's full 3-term victim chain: an explicit hand-off (`options.victim`) beats the event's own
 * target (`options.target`, e.g. a contest payload) beats whatever the CLICKING user currently has
 * targeted. Six+ sites skipped the middle term, so an event carrying `options.target` but no
 * `victim` fell through straight to the clicking user's targets — a different creature than the one
 * the event was actually about. `owner` is an optional trailing fallback for call sites that used to
 * read `?? actor` / `?? owner` after the chain — pass it, don't OR it in at the call site. */
function edhaResolveVictim(event, { owner = null } = {}) {
  return event?.options?.victim ?? event?.options?.target ?? edhaUserTargetActor() ?? owner ?? null;
}

// Resolve the actor list an effect lands on.
function edhaEffectTargets(owner, eff, ctx) {
  switch (eff.target) {
    case "self": return [owner];
    case "victim": case "triggering": return ctx.victim ? [ctx.victim] : [];
    case "near-victim": {
      const vtok = edhaCasterToken(ctx.victim);
      if (!vtok) return [];
      // edhaTokensWithin already excludes the centre token, so the victim itself is never caught.
      // `nearAffects` (07-24r) is the splash's disposition filter: Necrotic Cascade detonates a corpse
      // and must hit ENEMIES of the owner, not everyone standing near the body. Default "all" keeps
      // every earlier consumer unchanged. Downed creatures are skipped — a body cannot be splashed twice.
      const want = String(eff.nearAffects || "all");
      const odisp = edhaActorSide(owner);
      return edhaTokensWithin(vtok, Number(eff.radius) || 5).filter(t => {
        if (!t.actor || t.actor === owner) return false;
        if (want === "all") return true;
        if ((t.actor.system?.resources?.hea?.value ?? 1) <= 0) return false;
        const same = edhaSideSame(t.document?.disposition, odisp);
        return want === "allies" ? same : edhaSideHostile(t.document?.disposition, odisp);   // R-63: NOT-same is not hostile — an unresolvable side is in neither splash
      }).map(t => t.actor);
    }
    /* EVERY MEMBER OF A LEDGER (07-24u). The payload shape the marker trees had no way to express:
     * Bear Witness grants Temp HP to each of your Covenant allies, and the old code re-derived that
     * list from a name-keyed owner scan. `listName` addresses the H3 ledger, so this reads exactly
     * what H3 wrote (including its "the mark wins" reconciliation) and the range gate is a field.
     * Final Decree's Witness block and Concord's roster are the same shape, for later. */
    case "list-members": {
      const key = String(eff.listName || "").trim(); if (!key) return [];
      const otok = edhaCasterToken(owner);
      const ft = eff.rangeColor ? edhaAttuneFtColor(owner, eff.rangeColor) : 0;
      const inRange = ft > 0 ? edhaTokensWithin(otok, ft) : null;   // excludes the centre token
      const out = [];
      for (const e of edhaOwnerList(owner, key, String(eff.listStatus || key).trim())) {
        const ref = (typeof fromUuidSync === "function" ? fromUuidSync(e.uuid) : null);
        const a = ref?.actor ?? ref; if (!a || a === owner) continue;
        if ((Number(a.system?.resources?.hea?.value) || 0) <= 0) continue;   // skip the downed
        if (inRange) {
          const atok = edhaCasterToken(a);
          // A range gate needs BOTH tokens on the map — the same rule H8's rangeColor follows.
          if (!otok || !atok || !inRange.some(t => t.id === atok.id)) continue;
        }
        out.push(a);
      }
      return out;
    }
    default: { // "prompt" → your current targets
      const toks = edhaUserTargetTokens().filter(t => t.actor);
      const max = Number(eff.maxTargets) || 0;
      if (max <= 0) return toks.map(t => t.actor);   // the pre-2bU behaviour, untouched
      /* MULTI-TARGET mode (2bU — Investiture of Command): filter the user's targets by side, range
       * and life, then cap. The same filters back the pre-cost veto, so "nothing spent" holds. */
      const otok = edhaCasterToken(owner);
      const ft = eff.rangeColor ? edhaAttuneFtColor(owner, eff.rangeColor) : 0;
      const inRange = ft > 0 && otok ? edhaTokensWithin(otok, ft) : null;
      return toks.filter(t => {
        if (t.actor === owner) return false;
        if ((t.actor.system?.resources?.hea?.value ?? 0) <= 0) return false;
        if (eff.requireDisposition && otok) {
          // R-63: Number.isFinite fail-closed (was `?? 1` on both sides) — 🤖 bench row.
          const td = t.document?.disposition, od = otok.document?.disposition;
          if (!Number.isFinite(td) || !Number.isFinite(od)) return false;
          if ((td === od) !== (eff.requireDisposition === "ally")) return false;
        }
        if (inRange && !inRange.some(x => x.id === t.id)) return false;
        return true;
      }).slice(0, max).map(t => t.actor);
    }
  }
}

// Toggle a status on an actor, relaying to the GM when the local user lacks permission (player
// trigger vs a GM-owned enemy). Mirrors the burst-apply relay pattern.
async function edhaToggleStatus(actor, statusId, active = true) {
  try {
    if (actor.isOwner) { await actor.toggleStatusEffect?.(statusId, { active }); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to apply ${statusId}.`); return false; }
    game.socket.emit("module.edha-content", { action: "toggle-status", payload: { actorUuid: actor.uuid, statusId, active } });
    return true;
  } catch (e) { console.error("Edha Content | toggle status failed", e); return false; }
}

// Post an engine roll as a LABELED chat card. The system's chat template does not render a plain roll's
// `flavor`, which is why Predator's Due showed up as an anonymous die (Ben, 07-05) — so the label goes in
// the message CONTENT above the rendered dice: every engine card names its source talent and what it did.
async function edhaRollCard(owner, name, roll, text) {
  const speaker = ChatMessage.getSpeaker({ actor: owner });
  let dice = "";
  try { dice = await roll.render(); } catch (e) {}
  return ChatMessage.create({ speaker, rolls: [roll], sound: CONFIG.sounds?.dice, content: `<p>⚡ <strong>${name}</strong> (${owner.name}) — ${text}</p>${dice}` });
}
async function edhaRunTriggerEffect(owner, name, spec, ctx) {
  const eff = spec.effect; if (!eff) return;
  const rollData = owner.getRollData();
  // Fold BEFORE constructing: the rendered card's formula bar shows the Roll's own formula string, so
  // "(3)d(2 * 3 + 2)" must become "3d8" here — folding only the breakdown missed this surface (Ben 07-12,
  // Predator's Due; same family as the 07-05 roll-label fixes).
  const roll = await edhaRollFormula(rollData, eff.formula || "0");
  const amt = Math.max(0, Math.floor(roll.total));
  const speaker = ChatMessage.getSpeaker({ actor: owner });
  const rolled = (roll.dice?.length ?? 0) > 0;   // a flat "0" formula posts NO naked roll card (the 07-05 "blank card" bug)
  const gainNote = eff.resourceGain ? `${eff.resourceGain.value} ${EDHA_RES_LABEL[eff.resourceGain.resource] || eff.resourceGain.resource}` : "";

  if (eff.kind === "heal") {
    // target "victim"/"triggering" → heal the context creature (Mender's Instinct); default → owner.
    const healee = ((eff.target === "victim" || eff.target === "triggering") && ctx.victim) ? ctx.victim : owner;
    const hea = healee.system?.resources?.hea;
    const prevHealee = Number(hea?.value) || 0;
    // No-Healing / Healing-Halved gate (defect 5): this branch writes hea directly, never through
    // applyDamage, so the mark must be honoured HERE — the cut amount is what lands, what the card
    // says, and what the heal-react dispatch sees. (The click's cost was already paid; the gate's
    // own card explains the 0, and the GM can refund — same convention as a mistargeted Cruel Step.)
    const healAmt = edhaHealCutGate(healee, amt);
    const max = edhaResVal(hea) ?? (hea?.value ?? 0) + healAmt;
    if (healAmt > 0) {
      try { await edhaResourceWrite(healee, "hea", { value: Math.min(max, (hea?.value ?? 0) + healAmt) }, edhaBookkeepingTag("effect heal")); }
      catch (e) { // no perms on the healee (another player's PC) → relay as a burst-style heal hit
        try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: healee.uuid, amount: healAmt, type: "heal", heal: true }] } }); } catch (e2) {}
      }
    }
    if (eff.resourceGain) {
      const r = eff.resourceGain;
      await edhaGainResource(owner, r.resource, r.value);
    }
    // Next-test modifier payoff (Flashpoint: advantage on your next Red test — ENFORCED 07-12; was a
    // "manual reminder" until the nextTestMod primitive was re-checked against it. Generic: any
    // trigger card can arm one).
    if (eff.nextTestMod) {
      try { await edhaSetNextTestMod(owner, { mode: eff.nextTestMod.mode || "advantage", count: 1, skill: eff.nextTestMod.skill || null, attr: eff.nextTestMod.attr || null, source: name }); } catch (e) {}
    }
    // The card says WHY it fired (Ben 07-12: "we should know why it's happening") — the rule's note.
    const why = spec.note ? ` <span style="opacity:.8">(${spec.note})</span>` : "";
    /* item 68: this branch already GATED before announcing (it is where the contract came from),
     * but a blocked heal still read "regains 0 health" — a number where the family now names the
     * mark. The bare-0 fallback stays for a genuine 0-amount roll with no mark: without it a
     * gain-less card would come out empty (the 07-05 "blank card" case). */
    const healLine = edhaHealLine(healee, amt, healAmt, d => `${healee.name} regains <strong>${d}</strong> health`)
      || (!gainNote ? `${healee.name} regains <strong>0</strong> health` : "");
    const what = [healLine, gainNote ? `${owner.name} regains <strong>${gainNote}</strong>` : ""].filter(Boolean).join("; ") + "." + why;
    if (rolled && healAmt > 0) await edhaRollCard(owner, name, roll, what);
    else ChatMessage.create({ speaker, content: `<p>⚡ <strong>${name}</strong> — ${what}</p>` });
    // On-heal reactions (`edha-heal-react`, 07-25 pass 2bS) — e.g. Mender's Instinct feeding the
    // Restoration riders. The colour gate rides each rule now, not this chokepoint.
    const healTal = owner.items?.find?.(i => edhaIsTalent(i) && i.name === name);
    if (healAmt > 0 && healTal) await edhaDispatchHealReact(owner, healTal, healee, healAmt, prevHealee);
    return;
  }
  if (eff.kind === "thp") {
    const found = edhaEffectTargets(owner, eff, ctx);
    if (eff.target === "list-members") {
      /* The ledger-wide grant (07-24u). THREE deliberate differences from the single-target path
       * below, each one preserving what the hand-rolled Bear Witness did — a conversion that quietly
       * dropped any of them would be a balance change dressed as a refactor (Ben, 07-24t):
       *   · edhaGrantTempHpCross, NOT edhaWriteTempHp — Temp HP does not stack, it KEEPS THE HIGHER.
       *     Writing it would silently nerf a partner already holding more from another source.
       *   · that writer also RELAYS through the GM when the local client does not own the creature,
       *     which a bare setFlag cannot do — and every member of this list is somebody else's.
       *   · a zero grant is SILENT. The old code skipped an owner whose White rank was 0 rather than
       *     posting "gains 0 Temp HP", and an empty ledger said nothing at all. */
      if (amt <= 0 || !found.length) return;
      for (const t of found) await edhaGrantTempHpCross(t, amt, name);
      const what = `${found.map(t => t.name).join(", ")} gain${found.length > 1 ? "" : "s"} <strong>${amt}</strong> Temp HP.${spec.note ? ` <span style="opacity:.8">(${spec.note})</span>` : ""}`;
      if (rolled) await edhaRollCard(owner, name, roll, what);
      else ChatMessage.create({ speaker, content: `<p>⚡ <strong>${name}</strong> — ${what}</p>` });
      return;
    }
    /* Multi-target prompt mode (2bU — Investiture of Command): ONE shared roll (amt above), each
     * filtered target through the keeps-higher cross-writer — the same three list-members
     * differences apply (never nerf stacked Temp HP, relay for other players' PCs, zero is silent). */
    if ((Number(eff.maxTargets) || 0) > 0) {
      if (amt <= 0 || !found.length) return;
      for (const t of found) await edhaGrantTempHpCross(t, amt, name);
      const what = `${found.map(t => t.name).join(", ")} gain${found.length > 1 ? "" : "s"} <strong>${amt}</strong> Temp HP (one shared roll).${spec.note ? ` <span style="opacity:.8">(${spec.note})</span>` : ""}`;
      if (rolled) await edhaRollCard(owner, name, roll, what);
      else ChatMessage.create({ speaker, content: `<p>⚡ <strong>${name}</strong> — ${what}</p>` });
      return;
    }
    // Every pre-07-24u mode: first target only, replace-not-keep. Unchanged on purpose.
    const tgt = found[0] ?? owner;
    await edhaWriteTempHp(tgt, amt, name);
    if (rolled) await edhaRollCard(owner, name, roll, `${tgt.name} gains <strong>${amt}</strong> Temp HP.`);
    else ChatMessage.create({ speaker, content: `<p>⚡ <strong>${name}</strong> — ${tgt.name} gains <strong>${amt}</strong> Temp HP.</p>` });
    return;
  }
  let targets = edhaEffectTargets(owner, eff, ctx);
  if (spec.whenTargetIsolated) targets = targets.filter(a => edhaIsIsolated(a));   // state filter (Sapping Hex)
  if (eff.kind === "status") {
    // Apply an Edha/native status to each (state-filtered) target — e.g. Sapping Hex → Weakened.
    // statusExpire "owner"/"target" (07-16b) stamps timed expiry instead of a permanent toggle
    // (Frost Lance: Slowed until the end of the TARGET's next turn).
    if (!targets.length) { ChatMessage.create({ speaker, content: `<p><strong>${name}</strong> — no ${spec.whenTargetIsolated ? "Isolated " : ""}target to affect (target a token, then re-fire).</p>` }); return; }
    for (const a of targets) {
      if (eff.statusExpire) await edhaApplyTimedStatus(a, eff.statusId || "weakened", { owner, expire: eff.statusExpire });
      else await edhaToggleStatus(a, eff.statusId || "weakened", true);
    }
    if (spec.selfResourceGain) {   // e.g. the Hollow Command fallback card also pays Siphoned Will's focus
      const r = spec.selfResourceGain;
      if (r.resource === "foc") await edhaGainFocus(owner, r.value, name);
      else await edhaGainResource(owner, r.resource, r.value);
    }
    const label = edhaConditionLabel(eff.statusId);   // 07-27f: same lookup, one helper (see edhaLocalizeLabel)
    ChatMessage.create({ speaker, content: `<p><strong>${name}</strong> — ${targets.map(a => a.name).join(", ")} ${targets.length > 1 ? "are" : "is"} <strong>${label}</strong>${spec.note ? ` <span style="opacity:.8">(${spec.note})</span>` : ""}.</p>` });
    return;
  }
  if (eff.kind === "affliction") {
    for (const a of targets) {
      try { await a.toggleStatusEffect?.("afflicted", { active: true }); await edhaAddAffliction(a, amt, eff.damageType, name); } catch (e) {}
    }
    await edhaRollCard(owner, name, roll, `${targets.map(a => a.name).join(", ") || "(target a token)"} is <strong>Afflicted [${amt} ${eff.damageType}]</strong> — auto-deals at the start of its turns until the condition is removed.`);
    return;
  }
  // damage / damage-aoe — apply silently, post one combined message with the dice. A target the local
  // client cannot write (a GM-owned foe hit from a player's payload — Killing Blow's bearer) relays
  // through burst-apply, the same move the heal branch above has always made (07-25, 2bT).
  for (const a of targets) {
    if (!a.isOwner && game.users?.activeGM) {
      try { game.socket.emit("module.edha-content", { action: "burst-apply", payload: { casterActorUuid: owner.uuid, hits: [{ actorUuid: a.uuid, amount: amt, type: eff.damageType, heal: false }] } }); } catch (e) {}
      continue;
    }
    try { await a.applyDamage([{ amount: amt, type: eff.damageType }], { chatMessage: false }); } catch (e) { console.error("Edha Content | trigger applyDamage failed", e); }
  }
  await edhaRollCard(owner, name, roll, `<strong>${amt} ${eff.damageType}</strong> to ${targets.map(a => a.name).join(", ") || "(no target — target a token, then re-fire)"}.`);
}

// One owner × one trigger: gate (round + cost), mark, resolve (guarded against re-entrancy).
async function edhaFireTrigger(owner, name, spec, ctx) {
  if (!edhaTriggerAllowed(owner, name, spec)) return;
  if (!(await edhaResolveCost(owner, name, spec))) return;
  await edhaMarkTriggerUsed(owner, name, spec);
  _edhaInTrigger = true;
  try { await edhaRunTriggerEffect(owner, name, spec, ctx); }
  finally { _edhaInTrigger = false; }
}

// Post a clickable chat card for an optional-cost trigger (respects once-per-round before posting).
// A chat-card BUTTON is reliable: always visible in the log, never blocks canvas targeting (unlike a
// modal dialog), and can't render hidden behind a sheet (unlike a non-modal dialog).
function edhaPostTriggerCard(owner, name, spec, ctx) {
  try {
    if (!edhaTriggerAllowed(owner, name, spec)) return;
    const cost = spec.cost;
    const costLabel = cost ? `${cost.value} ${EDHA_RES_LABEL[cost.resource] || cost.resource}` : "";
    const pid = foundry.utils.randomID();
    EDHA_TRIG_PENDING[pid] = { spec, ctx: ctx || {} };
    // Ben pass 3 (07-12, Mender's Instinct): the card was wordy AND told you to target the creature
    // when the effect already knows its recipient (victim/self) — the instruction only appears when
    // the effect actually reads your user targets.
    const needsTargeting = !["victim", "triggering", "self"].includes(spec.effect?.target);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content:
        `<div class="edha-trigger-card">` +
        `<p>⚡ <strong>${name}</strong>${costLabel ? ` — <strong>${costLabel}</strong>` : ""}${spec.note ? ` <span style="opacity:.85;font-size:.9em">${spec.note}</span>` : ""}</p>` +
        (needsTargeting ? `<p style="opacity:.85;font-size:.9em">Target the creature on the canvas, then click below.</p>` : "") +
        `<button type="button" class="edha-trigger-btn" data-edha-name="${name}" data-edha-actor="${owner.uuid}" data-edha-spec="${pid}">Fire ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button>` +
        `</div>`,
    });
  } catch (e) { console.error("Edha Content | trigger card post failed", e); }
}
function edhaDeductCost(owner, cost) {
  if (!cost) return;
  if (cost.resource === "inv" || cost.resource === "foc") {
    const res = owner.system?.resources?.[cost.resource], cur = res?.value ?? 0;
    if (cur < cost.value) ui.notifications?.warn(`Edha: ${owner.name} lacks ${cost.value} ${EDHA_RES_LABEL[cost.resource]} (firing anyway).`);
    void edhaSpendResource(owner, cost.resource, cost.value);
  }
  // opportunity: trusted (no auto-deduct)
}
async function edhaTriggerCardClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const name = btn.dataset.edhaName;
    const owner = await fromUuid(btn.dataset.edhaActor);
    const pending = EDHA_TRIG_PENDING[btn.dataset.edhaSpec];
    const spec = pending?.spec, ctx = pending?.ctx || {};
    if (!owner || !spec) return;
    if (!edhaTriggerAllowed(owner, name, spec)) { ui.notifications?.info(`${name} was already used this round.`); btn.disabled = true; return; }
    edhaDeductCost(owner, spec.cost);
    await edhaMarkTriggerUsed(owner, name, spec);
    _edhaInTrigger = true;
    try { await edhaRunTriggerEffect(owner, name, spec, ctx); } finally { _edhaInTrigger = false; }
    btn.disabled = true; btn.textContent = `${name} fired`;
    void edhaMarkCardResolved(edhaMessageIdOf(btn), `${name} fired ✓`);   // survives refresh (card-persistence family)
  } catch (e) { edhaClickFailed("trigger card click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-trigger-btn"] (Job 1, pass 5.3, end of file).

/* --- Card-state persistence (REUSABLE, Ben pass 3 07-12) ------------------------------------------
 * Flame Surge's "Detonating…" reverted to a live "Detonate" button on refresh: one-shot chat-card
 * button state lived only in the DOM. A resolved card now stamps a flag ON THE MESSAGE; the render
 * hook below re-disables its buttons (relabeling the first) on every client, forever. Cards that are
 * MEANT to stay clickable (Trade Routes' once-per-turn Teleport, Puppeteer cues) simply never call it. */
async function edhaMarkCardResolved(messageId, label) {
  try {
    if (!messageId) return;
    const msg = game.messages?.get(messageId); if (!msg) return;
    if (msg.isAuthor || game.user?.isGM) await msg.setFlag("edha-content", "cardResolved", { label: label || "Resolved ✓" });
    else if (game.users?.activeGM) game.socket.emit("module.edha-content", { action: "resolve-card", payload: { messageId, label } });
  } catch (e) {}
}
function edhaMessageIdOf(btn) { return btn?.closest?.("[data-message-id]")?.dataset?.messageId ?? null; }
// The card-resolved disable-all binding moved into the ONE renderChatMessageHTML decorations hook
// (Job 1, pass 5.3, end of file, alongside the dice-formula tidy — same "not a button dispatch" bucket).

