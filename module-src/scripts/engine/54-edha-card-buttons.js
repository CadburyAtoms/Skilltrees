/* ================================================================================================
 * EDHA_CARD_BUTTONS (ENGINE PASS 5.3, Job 1) — ONE binder table for every chat-card button.
 * 29 `renderChatMessageHTML` registrations (12 named `edhaBind*` wrappers + ~17 inline) all did the
 * same three steps: resolve root, `querySelectorAll(".edha-X-btn")`, `addEventListener` per button.
 * Placed at the very end of the file (after every handler it references has been defined/hoisted)
 * so the object literal below never hits a TDZ/undefined reference regardless of declaration style.
 * Each tree section that used to carry a binder now has a one-line pointer comment naming its entry
 * here (rule 3's ledger stays in the section headers; the WIRING lives in exactly one place).
 *
 * Handler signature is `(ev, msg)` — `msg` is the ChatMessage document, read only by
 * `edha-watch-manual`. Guard style unifies to try/catch on every entry, and R-59's error-toast
 * convention (`edhaClickFailed`) now covers EVERY outer handler — eleven entries (burst-btn,
 * burst-cancel, charge-btn, charge-all, combustion, shatter-mute, and the four Fate buttons) had NO
 * outer catch before this pass, so a rejected promise from one of those clicks failed completely
 * silently (an unhandled rejection, not even a console line) instead of raising R-59's toast. That
 * is a visible behavior change (a user now SEES an error where before nothing happened) — 🤖 bench
 * row: force one of these to throw (e.g. an unresolvable owner ref) and confirm the toast appears.
 * ============================================================================================== */
const EDHA_CARD_BUTTONS = {
  "edha-list-release": edhaListReleaseClick,
  "edha-loot-btn": edhaLootTakeClick,
  "edha-watch-manual": (ev, msg) => edhaWatchManualClick(ev, msg),
  "edha-pick-btn": edhaPromptPickClick,
  "edha-pick-decline-btn": edhaPromptPickDeclineClick,
  "edha-dispel-btn": edhaDispelPickClick,
  "edha-opp-btn": edhaOpportunityClick,
  "edha-plotgrant-btn": edhaPlotGrantClick,
  "edha-designate-btn": edhaDesignateClick,
  "edha-coordreact-btn": edhaCoordReactClick,
  "edha-beacon-btn": edhaBeaconClick,
  "edha-bulwark-btn": edhaBulwarkClick,
  "edha-accord-voice-btn": edhaAccordVoiceClick,
  "edha-accord-bound-btn": edhaAccordBoundClick,
  "edha-illusion-retest": edhaIllusionRetestClick,
  "edha-upkeep-inv-btn": edhaUpkeepInvClick,
  "edha-trigger-btn": edhaTriggerCardClick,
  "edha-pick-target-btn": edhaPickTargetClick,
  "edha-charge-arm": edhaChargeArmClick,
  "edha-mutation-btn": edhaMutationClick,
  "edha-lifecleanse-btn": edhaCleanseOfferClick,   // Job 8: shared with edha-natrec-btn
  "edha-sov-expose-btn": edhaSovExposeClick,
  "edha-redirect-btn": edhaRedirectClick,
  "edha-intercept-btn": edhaInterceptClick,
  "edha-counter-transfer-btn": edhaCounterTransferClick,
  "edha-counter-burst-btn": edhaCounterBurstClick,
  "edha-order-btn": edhaOrderBtnClick,
  "edha-spread-btn": edhaSpreadClick,
  "edha-spread-sq-btn": edhaSpreadSquareClick,
  "edha-extinguish-btn": edhaExtinguishClick,
  "edha-vitalsurge-btn": edhaVitalSurgeClick,
  "edha-natrec-btn": edhaCleanseOfferClick,   // Job 8: shared with edha-lifecleanse-btn
  "edha-reknit-btn": edhaReknitClick,
  // Dispatcher: one css class, routed by data-edha-action (was edhaBindCivButtons's forEach).
  "edha-civ-btn": (ev) => {
    const act = ev.currentTarget?.dataset?.edhaAction;
    if (act === "teleport") return edhaCivTeleportClick(ev);
    if (act === "summon-effect-end") return edhaCivSummonEffectEndClick(ev);
  },
  // The eleven entries below were inline handlers with NO outer try/catch — extracted here verbatim
  // (same body, same dataset reads) and given the same R-59 outer catch every other entry already had.
  "edha-burst-btn": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault();
      btn.disabled = true; btn.textContent = "Detonating…";
      await edhaBurstDetonate(btn.dataset.edhaBurst, edhaMessageIdOf(btn));
    } catch (e) { edhaClickFailed("burst detonate", e); }
  },
  "edha-burst-cancel": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault();
      btn.disabled = true; edhaBurstCancel(btn.dataset.edhaBurst);
      await edhaMarkCardResolved(edhaMessageIdOf(btn), "Cancelled — refunded ✓");
    } catch (e) { edhaClickFailed("burst cancel", e); }
  },
  "edha-charge-btn": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault();
      btn.disabled = true; await edhaDetonateOne(btn.dataset.owner, btn.dataset.charge);
    } catch (e) { edhaClickFailed("charge detonate", e); }
  },
  "edha-charge-all": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault();
      btn.disabled = true; await edhaDetonateAllFree(btn.dataset.owner);
    } catch (e) { edhaClickFailed("charge detonate all", e); }
  },
  "edha-combustion": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault(); btn.disabled = true;
      const owner = await edhaResolveActorRef(btn.dataset.owner); if (!owner) return;
      const label = btn.dataset.label || "Ignite"; const spreadFt = Number(btn.dataset.spread) || 5; const igniteFt = Number(btn.dataset.ignite) || 10;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>🔥 <strong>${label}</strong>: each of ${owner.name}'s dangerous-terrain zones spreads ${spreadFt} ft, and a ${igniteFt} ft zone ignites on the fallen character. GM grows the Regions / drops the new zone.</p>` });
    } catch (e) { edhaClickFailed("combustion spread", e); }
  },
  "edha-shatter-mute": async (ev) => {
    try {
      const b = ev.currentTarget; ev.preventDefault(); b.disabled = true;
      const owner = await edhaResolveActorRef(b.dataset.edhaOwner); if (!owner) return;
      try { await owner.setFlag("edha-content", b.dataset.edhaItem ? `promptOff.${b.dataset.edhaItem}` : "shatterPromptOff", true); } catch (e) {}
      b.textContent = "Prompts muted";
    } catch (e) { edhaClickFailed("shatter mute", e); }
  },
  "edha-mark-offer": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault(); btn.disabled = true;
      const owner = await edhaResolveActorRef(btn.dataset.owner);
      const target = await edhaResolveActorRef(btn.dataset.target);
      const tal = await fromUuid(btn.dataset.item).catch(() => null);
      const h = tal ? edhaEventRules(tal).map(r => r?.handler).find(x => x?.type === "edha-snare-react" && (x.mode || "offer-mark") === "offer-mark") : null;
      if (owner && target) await edhaFateApplyMark(owner, target, tal, h);
    } catch (e) { edhaClickFailed("fate mark offer", e); }
  },
  "edha-fate-reposition": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault(); btn.disabled = true;
      const owner = await edhaResolveActorRef(btn.dataset.owner);
      if (owner) await edhaFateReposition(owner, btn.dataset.key, btn.dataset.id, btn.dataset.ft);
    } catch (e) { edhaClickFailed("fate reposition", e); }
  },
  "edha-fate-springsnare": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault(); btn.disabled = true;
      const owner = await edhaResolveActorRef(btn.dataset.owner);
      const it = await fromUuid(btn.dataset.item).catch(() => null);
      // The bonus is the commanding item's OWN damage formula (2bX — was a hard-coded module constant).
      const f = it?.system?.damage?.formula || "";
      if (owner) await edhaFateSpringFromCard(owner, btn.dataset.snare, f ? ` + (${f})` : "", it?.name || "");
    } catch (e) { edhaClickFailed("fate spring snare", e); }
  },
  "edha-fate-thread": async (ev) => {
    try {
      const btn = ev.currentTarget; ev.preventDefault(); btn.disabled = true;
      const owner = await edhaResolveActorRef(btn.dataset.owner);
      const it = await fromUuid(btn.dataset.item).catch(() => null);
      if (owner) await edhaFateThreadResolve(owner, it);
    } catch (e) { edhaClickFailed("fate thread", e); }
  },
};
// The ONE walking hook. try/catch is PER ENTRY so one bad selector/handler binding can't stop the
// rest of the table from binding on the same render pass.
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root) return;
  for (const cls of Object.keys(EDHA_CARD_BUTTONS)) {
    try {
      const handler = EDHA_CARD_BUTTONS[cls];
      root.querySelectorAll?.(`.${cls}`)?.forEach((b) => b.addEventListener("click", (ev) => handler(ev, msg)));
    } catch (e) {}
  }
});
// The second (and last) renderChatMessageHTML registration: post-render DECORATIONS that are NOT a
// button dispatch, so they don't belong in the table above — the dice-formula display tidy, and
// R-66's card-resolved disable-ALL-buttons (a message-level flag, not a per-class button).
Hooks.on("renderChatMessageHTML", (msg, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root) return;
  try { root.querySelectorAll?.(".dice-formula").forEach(el => { const t = edhaTidyFormula(el.textContent); if (t && t !== el.textContent) el.textContent = t; }); } catch (e) {}
  try {
    const r = msg?.getFlag?.("edha-content", "cardResolved");
    if (r) {
      const btns = root.querySelectorAll?.("button") ?? [];
      btns.forEach(b => { b.disabled = true; });
      if (btns[0] && r.label) btns[0].textContent = r.label;
    }
  } catch (e) {}
});

// EDHA test-debug tracer: all edha-content registrations are done — restore the untraced
// Hooks.on so later registrations (other modules, late system wiring) are NOT traced.
Hooks.on = edhaHooksOnRaw;
// end of file (v3 engine pass 2026-06-11)
