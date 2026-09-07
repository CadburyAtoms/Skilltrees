/* ============================================================================================
 * POWER (Tyrith, deity) tree engine (2026-07-02c) — dominate (Black control) → kill → escalate (Red).
 * Colors Black/Red; tag prefix "Power (Tyrith)."; build `foundry-build deity` → pack `edha-deity`.
 * Die/range colors (Ben R0, 07-02c): BLACK = the control tests + their ranges (Kneel, Absolute
 * Authority), Crown of Thorns, Investiture of Command's [Die] + ally range, Mantle's ally aura +
 * redirect range; RED = the kinetic dice — Warlord's Advance rider + Unstoppable Advance (both
 * authored formulas FIXED black→red this pass, the roll-data note was already "Red [Die]").
 * Reuses existing primitives wholesale — NO side-engine, NO new sidecar table:
 *   • control tests  → preUseItem TAKEOVERS that ROLL 1d20+Black and GATE on edhaReadDefense(cog)
 *     (the Sovereignty/Chaos dispatch — never trust-the-player; a failed test stays spent).
 *   • kinetic riders → the applyDamage wrapper pre/post-pass with edhaDealerOf (the Withering-Touch
 *     armed-strike + Tempered-Edge injection shapes); kill/half-HP detection reads the same
 *     prevHp→newHp crossing the shared live→0 stamp uses.
 *   • cross-actor    → edhaGrantTempHpCross / edhaGrantAdvAttack / edhaApplyTimedStatus /
 *     burst-apply relays; timed expiry = the {round,turn} coordinate convention.
 * PRE-STANDARD WIRING audited vs the cards this pass (the Death R6/R7 / Civ R2 process) — both REDONE:
 *   • Warlord's Advance's authored edha-on-defeat rider was a documented HEURISTIC ("GM adjudicates
 *     kill attribution — decline if the kill came from another talent") → REMOVED (Ben R6); the
 *     armed-strike rider below attributes for real. • Investiture of Command's authored edha-temp-hp
 *     event granted the FIRST ally only, self-damage manual → REMOVED (Ben R5); takeover below.
 * Wired here (no longer GM-eyeballed):
 *   • Kneel — TAKEOVER: 1 Inv, Black vs Cognitive (edhaReadDefense) → the NEW `compelled` status
 *     (Ben R1 — NOT core prone; own id like harvested/decaying) until the start of your next turn
 *     (owner-relative expiry). The move-toward-or-nothing clause is forced volition (manual, carded).
 *     The advantage clause is a wired PASSIVE (Ben R2): a pre{Attack|Item}Roll injector — you own
 *     Kneel + the synced target bears compelled/frightened/weakened + stands in Black range →
 *     advantage (the Weakened-disadvantage shape). `frightened` is registered as a GM-applied marker.
 *   • Warlord's Advance — use arms `warlordNext` (1 Inv via activation, the witherNext shape); your
 *     next WEAPON hit (melee owner-judged) consumes it in the PRE-pass — +[T][D red] impact rolled
 *     into the SAME application so the kill check includes the rider. POST-pass on that hit:
 *     live→0 → Temp HP = tier (edhaGrantTempHpCross) + the whispered 10 ft free-move prompt;
 *     survivor → edhaSetNextTestMod advantage on your next Presence-attribute test (the Red-Key
 *     attr-gate; "vs that target / until your next turn" binding is card-noted — the flag is counted).
 *   • Crown of Thorns — CONVERTED 07-24q (document-driven; see the 2b block below). Arms the
 *     `crowned` status for the scene (2 Inv via activation);
 *     edhaCrownPing(owner, target) fires on every ENGINE-resolved Black/Red-talent vs-Cognitive test:
 *     in-tree (Kneel, Absolute Authority) plus the Sovereignty Censure/Decree sites (Ben R4 — same
 *     PC can own both trees; Edict of the Fallen is vs Spiritual, excluded). Ping = Presence (@attr.pre) spirit via
 *     burst-apply (spirit bypasses deflect = "cannot be reduced", card-noted). Tests the engine does
 *     NOT resolve get the owner-click ping button on the arming card (the Sovereignty-Expose shape).
 *   • Absolute Authority — TAKEOVER: ENFORCES the target gate (bears compelled/frightened/weakened,
 *     in Black range — the Consuming-Decay gate shape, refused pre-cost), 2 Inv, Black vs Cognitive.
 *     Success → the "you choose its next action (no direct self-harm)" card (forced volition —
 *     manual, Ben R3); failure → Weakened until the end of ITS next turn (edhaApplyTimedStatus,
 *     expire target). Both branches ping Crown of Thorns.
 *   • Momentum of Victory — name-based useItem: 1 Inv via activation, Opportunity in the Cost header
 *     but NEVER auto-deducted (the standing convention — trusted); posts the move-15-ft + free-Strike
 *     card and arms `momentumNext`: your next WEAPON hit gets +@tier impact (the item's own authored
 *     formula) in the PRE-pass, consumed on fire. The movement + Strike are player-executed.
 *   • Unstoppable Advance — name-based useItem arm (1 Inv via activation): `unstoppable` flag with
 *     the baked [T][D red], an empty hit-list, and the end-of-your-next-turn expiry coordinate.
 *     The tree's ONE new small handler (Ben R8): a GM-side MOVE-THROUGH watcher — preUpdateToken
 *     stamps the prior position (the HP-stamp shape), updateToken samples the segment against
 *     enemy-occupied squares (edhaSegPointDist); each enemy is hit ONCE per activation, its own
 *     [T][D red] roll (the Bone-Garden per-creature convention), applied via edhaApplyBurstResults
 *     with real attribution (trample drops feed Warlord's Fury). The can't-be-Slowed/Immobilized/
 *     Prone clause is ENFORCED: a createActiveEffect watcher deletes those statuses while armed.
 *     "May move through enemy spaces" isn't blocked by core Foundry (card-noted). Swept on
 *     combatTurnChange; out-of-combat arms are stamped lazily (the Sovereignty convention).
 *   • Investiture of Command — TAKEOVER (replaces the old first-ally-only data event — Ben R5):
 *     validates up to 3 targeted same-disposition allies in Black range (refused pre-cost on zero),
 *     2 Inv, ONE shared [T][D black] roll (the Necrotic-Cascade convention) → each ally gains that
 *     Temp HP (edhaGrantTempHpCross, keeps-higher) + advantage on its next attack test
 *     (edhaGrantAdvAttack, the Green primitive); then the caster takes tier spirit under
 *     _edhaInTrigger (spirit bypasses deflect = "cannot be reduced").
 *   • Warlord's Fury — use arms `fury = {belowHalf:[], kills:0}` for the scene (2 Inv via
 *     activation; re-arm refused pre-cost). POST-pass, you are the dealer: a HOSTILE non-summon
 *     NON-character victim (Ben R7 — no PC/ally farming, the Death-R2 spirit) crossing below half
 *     max HP counts once (the id set); a live→0 crossing adds 1 more (one blow can do both).
 *     PRE-pass: your WEAPON hits get +min(belowHalf+kills, 2×tier) in the dealt type.
 *   • Mantle of the Aspirant (capstone) — TAKEOVER: once/scene (`mantleUsed`), 3 Inv; then:
 *     (a) +2 all defenses = a scene AE (the Colossus shape); (b) melee +tier spirit = the PRE-pass
 *     rider on your WEAPON hits (melee owner-judged); (c) allies in Black range +1 to all tests =
 *     the NEW flat-bonus pre-roll injector (Ben R9a — appends a +1 NumericTerm to the d20 roll,
 *     live-computed ally-in-range check; ⚑ bench-verify against configureModifiers rebuilds);
 *     (d) the damage REDIRECT (Ben R9b — no intercept hook exists) = watcher-plus-prompt (the
 *     Sovereignty-Expose / Civ-Bonds shape): the mantled owner takes damage → whispered card with a
 *     budget = min(tier, HP lost); each click targets a willing ally in Black range (consent
 *     owner-judged, the Sovereignty convention), prompts an amount, applies it to the ally with
 *     edhaRedirected:true (Devoted-Conduit honest) and heals the wearer back the same.
 * Hooks/tools still to build (engine backlog — named, not dropped):
 *   • The Mantle +1 injector vs dialog-roll rebuilds — if configureModifiers/configureDialog wipes
 *     appended terms, fall back to an AE if the system grows a per-skill bonus key (named fallback).
 *   • Waypointed drags for the move-through watcher — v13 fires updateToken per movement operation;
 *     multi-waypoint paths are sampled as one straight segment per update (bench-verify).
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Melee-ness of weapon hits — edhaAttackKind gates Warlord's Advance (stays armed on a ranged
 *     hit), Warlord's Fury, and the Mantle melee spirit; unknown = owner-judged as before.
 *   • The Presence-advantage rider is now TARGET-BOUND — nextTestMod carries targetUuid and the
 *     injector/consumer fire only with the survivor as the synced target (generalizable to any
 *     future "advantage vs THAT creature" rider).
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Kneel's move-toward-or-nothing — ENFORCED 07-16c (Ben D11): kneelBy stamp + preUpdateToken
 *     veto (only distance-closing moves pass; edhaForced bypasses; stamp dies with the status).
 *     Absolute Authority's chosen ACTION stays forced-volition manual (the D10 class — no movement
 *     semantics to veto; say the word if it should freeze movement too).
 *   • Momentum's Opportunity cost (trusted) + its movement/Strike;
 *     Warlord's Advance's 10 ft free move (prompted, player-executed); "willing" ally consent
 *     (owner-judged).
 * ✅ IRON RULE 2b — Crown of Thorns + Absolute Authority CONVERTED 07-24q on H8 `edha-watch`.
 *   The unit was deferred in pass F because Kneel and Absolute Authority both called edhaCrownPing.
 *   H8 dissolved the coupling from the OTHER end: a resolved test is now ANNOUNCED
 *   (edhaDispatchWatchers), not routed to a named talent, so every firing site — Kneel here, Censure
 *   and Decree of Ruin in Sovereignty — names nothing, and Crown picks the announcement up from its
 *   own document. Crown's arming moved from the bespoke `crownActive` flag to the `crowned` STATUS,
 *   because a status is the one marker a rule can both write (edha-self-status) and read
 *   (edha-watch requireSelfStatus) — and the "already armed, nothing spent" veto that guarded it is
 *   now generic (any untimed edha-self-status talent gets it, keyed on no name at all).
 *   Absolute Authority got H1's new `requireTargetStatus` field (its compelled/frightened/weakened
 *   gate, still vetoed BEFORE cost) and is the project's FIRST consumer of `edha-test-fail` — the
 *   event shipped in pass D and dispatched to nothing for four passes.
 *   MANUAL, declared: Crown's card keeps a hand-trigger button for a qualifying vs-Cognitive test the
 *   engine did NOT resolve (GM-adjudicated, or a talent not yet on H1). It is now a GENERIC watch
 *   trigger carrying the observation as data attributes — it names no talent. Dropping it would have
 *   traded an enforcement surface for tidiness, which is what iron rule 3 forbids.
 * ── IRON RULE 2b STATUS (07-25, pass 2bU — tree CLEAR) ────────────────────────────────────────
 * All nine on their documents; EDHA_POWER_TAKEOVER, the useItem arm dispatch and the name-keyed
 * dealer pre/post passes are DELETED. Do not re-add cases:
 *   Kneel (2bU, H13) — H1 black-vs-cog {rangeColor} + edha-apply-status {compelled, expire:
 *   owner-turn, mark} (the markedBy the move veto now reads) + edha-test-rider {advantage,
 *   whenTargetStatus comma-list, rangeColor} for the standing advantage.
 *   Investiture of Command (2bU) — edha-triggered-effect {thp, maxTargets: 3, ally, black range;
 *   ONE shared roll, pre-cost veto} + edha-adv-attack {to: targets} + a self spirit rule.
 *   Warlord's Advance (2bU) — edha-self-status {warlord} + armed damage-bonus {meleeOnly,
 *   consume; onKillThpFormula/onSurviveAdvAttr — the armed-hit outcome riders}.
 *   Momentum of Victory (2bU) — edha-self-status {momentum} + edha-note (the player-executed
 *   move + free Strike) + armed damage-bonus {consume, weaponOnly}.
 *   Warlord's Fury (2bU) — edha-self-status {fury} + damage-bonus {tallyKills, min(@tally, 2*@tier)}.
 *   Unstoppable Advance (2bU) — edha-self-status {unstoppable, timed, refuseWhileActive,
 *   immuneStatuses} + edha-watch {token-move, once: arm-per-target} + a per-victim damage rule.
 *   Mantle of the Aspirant (2bU — the bucket-3 exit RE-LITIGATED into a full conversion, the
 *   Sovereignty-pair precedent) — edha-self-status {mantled, oncePerScene} + edha-defense-buff
 *   {window: scene} + armed damage-bonus {meleeOnly, spirit} + edha-test-aura + edha-redirect.
 *   ENGINE_OWNED: the redirect POSTER + multi-click budget dialog and the token-move ANNOUNCER
 *   (cross-actor click/canvas machinery) — both read rules and name no talent; only the spec
 *   (budget, range, arming, immunities) lives on the documents.
 *   • CONTEST-EXEMPT: none — both tests (Kneel, Absolute Authority) are vs a DEFENSE (Cognitive),
 *     player-rolled through H1 and gated on edhaReadDefense, never an opposed SKILL.
 * ============================================================================================ */

// edhaPowerCard moved onto edhaTreeCard(owner, rolls, html, opts) — Job 4, pass 5.3 (call sites below updated directly).

/* Kneel moved onto its document 07-25 (pass 2bU, iron rule 2b — H13): H1 black-vs-cog +
 * edha-apply-status {compelled, expire: owner-turn, mark} + edha-test-rider {advantage,
 * whenTargetStatus comma-list, rangeColor} for the standing advantage. Do not re-add a case. */
// The move-toward-or-nothing VETO (07-16c, Ben D11 — the Dread Presence shape; re-keyed 2bU off the
// house markedBy.compelled mark, which a document rule can write): while Compelled with a mark, a
// willing move must CLOSE distance to the compeller's token; anything else is blocked on the moving
// client. Engine-forced movement (edhaForced) bypasses. A stale mark without the status is inert
// (the veto checks both); the mark dies with the status (deleteActiveEffect below).
Hooks.on("preUpdateToken", (doc, changes, options) => {
  try {
    if (options?.edhaForced) return;
    if (!("x" in changes) && !("y" in changes)) return;
    const actor = doc.actor;
    if (!actor?.statuses?.has?.("compelled")) return;
    const mk = actor.flags?.["edha-content"]?.markedBy?.compelled; if (!mk?.actorId) return;
    const compeller = game.actors?.get(mk.actorId); if (!compeller) return;
    const oTok = edhaCasterToken(compeller); if (!oTok?.center) return;
    const gs = (doc.parent?.grid?.size || 100);
    const w = (doc.width ?? 1) * gs / 2, h = (doc.height ?? 1) * gs / 2;
    const oldD = Math.hypot(doc.x + w - oTok.center.x, doc.y + h - oTok.center.y);
    const newD = Math.hypot((changes.x ?? doc.x) + w - oTok.center.x, (changes.y ?? doc.y) + h - oTok.center.y);
    if (newD < oldD - 1) return;   // closing distance — allowed
    ui.notifications?.warn(`Edha: ${doc.name} is Compelled (${mk.talent || "compelled"}) — it may only move toward ${compeller.name}, or stay put.`);
    return false;
  } catch (e) { /* fail-open */ }
});
Hooks.on("deleteActiveEffect", (eff) => {
  try { if (eff?.statuses?.has?.("compelled") && eff.parent?.flags?.["edha-content"]?.markedBy?.compelled) void eff.parent.unsetFlag("edha-content", "markedBy.compelled"); } catch (e) {}
});

/* --- The dealer riders: Warlord's Advance / Momentum arms + Fury bonus + Mantle spirit (PRE-pass) --- */
/* Warlord's Advance · Momentum of Victory · Warlord's Fury moved onto their documents 07-25 (pass
 * 2bU, iron rule 2b): each is an edha-self-status arm + an armed-self-status edha-damage-bonus rule
 * (2bU widenings: meleeOnly, tallyKills/@tally, the onKill/onSurvive armed-hit outcome riders).
 * The name-keyed dealer pre/post passes are DELETED — the generic edha-damage-bonus sweep is the
 * only path. Do not re-add them. */

/* --- The token-move announcer (2bU — H8 watch kind `token-move`, built WITH its first consumer:
 * Unstoppable Advance's trample). GM-side, one applier: preUpdateToken stamps the prior position
 * (the shared HP-stamp shape); updateToken samples the straight segment against OTHER-side living
 * tokens' spaces and ANNOUNCES one event per crossed creature. The mover's own watch rules decide
 * everything else (requireSelfStatus arming, once: arm-per-target, the damage payload) — this
 * announcer names no talent. ⚑ Waypointed drags still sample one straight segment per update,
 * unchanged from the hand-rolled watcher this replaces. */
function edhaSegPointDist(a, b, p) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  const t = len2 ? Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2)) : 0;
  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}
// The prior position comes off the SHARED `options.edhaPrevPos` stamp — this block used to OWN that
// stamp (it was written for the trample), which is what made it look private enough that Walking
// Ruin's trail rolled a document stash of its own instead of reading it. The stamp is now declared
// once, up with the move veto; only the read stayed here (2026-09-05, fix pass 3).
Hooks.on("updateToken", (tokenDoc, changed, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;                                  // one applier (the primary GM)
    const prev = edhaPrevTokenPos(options); if (!prev) return;
    const mover = tokenDoc?.actor; if (!mover) return;
    if (!edhaWatchersOfRule("edha-watch").some(w => String(w.handler?.watch) === "token-move")) return;   // cheap out — nothing watches movement
    void edhaAnnounceTokenMove(tokenDoc, mover, prev);
  } catch (e) { console.error("Edha Content | token-move announce failed", e); }
});
async function edhaAnnounceTokenMove(tokenDoc, mover, prev) {
  try {
    const scene = tokenDoc.parent; if (!scene) return;
    const gs = scene.grid?.size || 100;
    const w = (tokenDoc.width ?? 1) * gs, h = (tokenDoc.height ?? 1) * gs;
    const p0 = { x: prev.x + w / 2, y: prev.y + h / 2 };
    const p1 = { x: tokenDoc.x + w / 2, y: tokenDoc.y + h / 2 };
    if (p0.x === p1.x && p0.y === p1.y) return;
    const disp = tokenDoc.disposition;
    for (const t of (scene.tokens ?? [])) {
      if (t.id === tokenDoc.id || !t.actor) continue;
      if (!edhaSideHostile(t.disposition, disp)) continue;             // the OTHER side's spaces (trample semantics; widen with a field when an ally consumer exists). R-63: the two ends defaulted to DIFFERENT values (1 vs 0), so TWO unknowns read as opposite sides and the sweep fired.
      if ((t.actor.system?.resources?.hea?.value ?? 0) <= 0) continue;
      const ew = (t.width ?? 1) * gs;
      const c = { x: t.x + ew / 2, y: t.y + ((t.height ?? 1) * gs) / 2 };
      if (edhaSegPointDist(p0, p1, c) > ew / 2 + 1) continue;          // the path misses its space
      await edhaDispatchWatchers({ kind: "token-move", owner: mover, victim: t.actor, skill: null, def: null, ok: true, total: 0 });
    }
  } catch (e) { console.error("Edha Content | token-move sweep failed", e); }
}
/* The status-immunity shrug (2bU — generic; was Unstoppable's hand-rolled watcher): while an actor
 * carries the arming status of one of its own edha-self-status rules that lists immuneStatuses,
 * those statuses landing on it are deleted with a card. Reads the DOCUMENT, names no talent. */
Hooks.on("createActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    const landing = [...(effect.statuses ?? [])]; if (!landing.length) return;
    for (const { item: tal, handler: h } of edhaActorRulesOf(a, "edha-self-status")) {
        if (!h.immuneStatuses || !h.statusId) continue;
        if (!a.statuses?.has?.(h.statusId)) continue;
        const immune = String(h.immuneStatuses).split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
        const blocked = landing.filter(s => immune.includes(s));
        if (!blocked.length) continue;
        void effect.delete().then(() => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }),
          content: `<p>🏃 <strong>${tal.name}</strong>: ${a.name} cannot be ${blocked.join("/")} — the condition is shrugged off.</p>` })).catch(() => {});
        return;
    }
  } catch (e) { console.error("Edha Content | status-immunity shrug failed", e); }
});

/* Unstoppable Advance · Kneel · Investiture of Command · Mantle of the Aspirant moved onto their
 * documents 07-25 (2bU) — see the tree-section header. The redirect machinery below stays
 * ENGINE-OWNED (the H6 trade): the SELECTION and the budget live on an `edha-redirect` rule; the
 * poster and the click are generic and name no talent. */
async function edhaRedirectPromptSweep(target, list, prevHp) {
  try {
    const rule = edhaActorRuleOf(target, "edha-redirect"); if (!rule) return;
    const h = rule.handler;
    if ((h.direction || "to-allies") !== "to-allies") return;   // intercept rules ride edhaInterceptPromptSweep (2bV)
    if (h.requireSelfStatus && !target.statuses?.has?.(h.requireSelfStatus)) return;
    const hp = Number(target.system?.resources?.hea?.value) || 0;
    const lost = Math.max(0, (Number(prevHp) || 0) - hp); if (lost <= 0) return;    // fully absorbed (Temp HP) → nothing to pass on
    const cap = Math.max(0, Math.floor(edhaEvalSync(h.budgetFormula || "@tier", target.getRollData())));
    const budget = Math.min(cap, lost); if (budget <= 0) return;
    const type = list.find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "impact";
    const range = h.rangeColor || "black";
    ChatMessage.create({
      whisper: edhaWhisperIds(target), speaker: ChatMessage.getSpeaker({ actor: target }),
      content: `<div class="edha-trigger-card"><p>👑 <strong>${rule.item.name}</strong> — ${target.name} takes ${lost} damage. You may redirect up to <strong>${budget}</strong> of it to one or more <strong>willing</strong> allies in Attunement Range (${range}; consent owner-judged): target an ally, then click (repeat until the budget is spent).</p>`
        + `<button type="button" class="edha-redirect-btn" data-edha-owner="${target.uuid}" data-edha-left="${budget}" data-edha-type="${type}" data-edha-range="${range}" data-edha-name="${rule.item.name}">Redirect (up to ${budget})</button></div>`,
    });
  } catch (e) { console.error("Edha Content | redirect prompt failed", e); }
}
async function edhaRedirectClick(ev) {
  try {
    const btn = ev.currentTarget;
    const owner = await edhaResolveActorRef(btn.dataset.edhaOwner);
    if (!owner) return;
    const talName = btn.dataset.edhaName || "Redirect", range = btn.dataset.edhaRange || "black";
    if (!owner.isOwner) { ui.notifications?.warn("Edha: only the wearer (or the GM) redirects."); return; }
    let left = Number(btn.dataset.edhaLeft) || 0;
    if (left <= 0) { btn.disabled = true; return; }
    const disp = edhaActorSide(owner);
    const at = edhaUserTargetTokens().find(t => t.actor && t.actor !== owner
      && edhaSideSame(t.document?.disposition, disp)
      && (t.actor.system?.resources?.hea?.value ?? 0) > 0
      && edhaDeathInRange(owner, t, range));
    if (!at) { ui.notifications?.warn(`Edha: target a willing ally in your Attunement Range (${range}) first.`); return; }
    let amt = left;
    try {
      const v = await foundry.applications.api.DialogV2.prompt({
        window: { title: `${talName} — redirect` },
        content: `<p>Redirect how much to <strong>${at.actor.name}</strong>? (1–${left})</p><input type="number" name="amt" value="${left}" min="1" max="${left}" autofocus>`,
        ok: { callback: (_e, button) => Number(button.form?.elements?.amt?.value) },
        modal: false, rejectClose: false,
      });
      if (v == null || Number.isNaN(Number(v))) return;
      amt = Math.max(1, Math.min(left, Math.floor(Number(v))));
    } catch (e) { return; }
    const type = btn.dataset.edhaType || "impact";
    // The ally takes it in the wearer's place (edhaRedirected keeps Devoted Conduit honest when direct).
    if (at.actor.isOwner || game.user?.isGM) {
      try { await at.actor.applyDamage([{ amount: amt, type }], { chatMessage: false, edhaRedirected: true }); } catch (e) {}
    } else if (game.users?.activeGM) {
      game.socket.emit("module.edha-content", { action: "burst-apply", payload: { hits: [{ actorUuid: at.actor.uuid, amount: amt, type, heal: false }] } });   // relay path can't carry the redirected flag (card-noted)
    } else { ui.notifications?.warn("Edha: a GM must be online to redirect to that ally."); return; }
    // The wearer takes that much less — heal the redirected amount back.
    const hea = owner.system?.resources?.hea;
    const omax = Number(hea?.max?.value ?? hea?.max) || 0;
    try { await edhaResourceWrite(owner, "hea", { value: Math.min(omax || Infinity, (Number(hea?.value) || 0) + amt) }, edhaBookkeepingTag(`${talName} (redirect unwind)`)); } catch (e) {}
    left -= amt;
    btn.dataset.edhaLeft = String(left);
    if (left <= 0) { btn.disabled = true; btn.textContent = "Redirect spent."; } else { btn.textContent = `Redirect (up to ${left} left)`; }
    edhaTreeCard(owner, null, `<p>👑 <strong>${talName}</strong>: ${at.actor.name} shoulders <strong>${amt}</strong> ${type} in ${owner.name}'s place${left > 0 ? ` (${left} redirect left on this hit)` : ""}.</p>`);
  } catch (e) { edhaClickFailed("redirect", e); }
}
/* The INTERCEPT sweep (2bV — Shoulder the Oath's shape, generic): a creature on a watcher's ledger
 * lost HP → the watcher is offered a Reaction to take floor(D × fraction) in their place, heal them
 * back min(D, fraction + bonus), and grant both the Temp HP formula. GM-side poster (the Bulwark
 * convention); the click resolves cross-actor through the burst/heal relays. The rule IS the
 * selection — this sweep names no talent. Damage fully eaten by Temp HP prompts nothing (the
 * Mantle precedent); D = HP actually lost. */
async function edhaInterceptPromptSweep(victim, dealer, dealtAmt, list, redirected) {
  try {
    if (!edhaDefBuffGmGate() || redirected || dealtAmt <= 0) return;
    const vtok = edhaCasterToken(victim); if (!vtok) return;
    const dtype = (list ?? []).find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "vital";
    for (const w of edhaWatchersOfRule("edha-redirect")) {
      const h = w.handler; if ((h?.direction || "to-allies") !== "intercept") continue;
      const owner = w.actor;
      if (owner === victim || (dealer?.actor && dealer.actor === owner)) continue;
      if (h.requireSelfStatus && !owner.statuses?.has?.(h.requireSelfStatus)) continue;
      const key = String(h.watchList || "").trim();
      const fkey = String(h.watchFlag || "").trim();
      if (key) {
        if (!edhaOwnerList(owner, key, String(h.watchListStatus || key).trim()).some(e => e.uuid === victim.uuid)) continue;
      } else if (fkey) {
        if (owner.getFlag?.("edha-content", fkey)?.targetUuid !== victim.uuid) continue;   // the single linked creature (Lifeline, 2bW)
      } else continue;
      if (h.rangeColor && !edhaAllyInAttune(owner, vtok, h.rangeColor)) continue;
      if (h.oncePerRound && !edhaCoordOPRAllowed(owner, w.item.id, "_react")) continue;
      const frac = Number(h.takeFraction) > 0 ? Number(h.takeFraction) : 0.5;
      const half = Math.floor(dealtAmt * frac);
      const takeType = String(h.takeType || "").trim() || dtype;
      const thp = h.thpFormula ? Math.max(0, Math.floor(edhaEvalSync(h.thpFormula, owner.getRollData()))) : 0;
      /* CHOOSE-AMOUNT (2bW — Lifeline): the card carries a number input; the click takes UP TO
       * `half` as `takeType`, heals the victim back what was taken plus the rolled healFormula. */
      if (h.chooseAmount === true) {
        if (half <= 0) continue;
        ChatMessage.create({
          whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<div class="edha-trigger-card"><p>🩸 <strong>${w.item.name}</strong> — <strong>${victim.name}</strong> took <strong>${dealtAmt}</strong> ${dtype}. Take up to <strong>${half}</strong> of it as ${takeType}${takeType === "spirit" ? " (ignores Deflect)" : ""}; ${victim.name} then heals the amount back${h.healFormula ? " plus the talent's healing die" : ""}.${h.oncePerRound ? " (Once per round.)" : ""}</p>`
            + `<input type="number" class="edha-intercept-amt" value="${half}" min="0" max="${half}" style="width:4em">`
            + `<button type="button" class="edha-intercept-btn" data-edha-owner="${owner.uuid}" data-edha-item="${w.item.uuid}" data-edha-victim="${victim.uuid}" data-edha-half="${half}" data-edha-choose="1" data-edha-healf="${encodeURIComponent(h.healFormula || "")}" data-edha-type="${takeType}" data-edha-thp="${thp}" data-edha-once="${h.oncePerRound ? 1 : 0}">Absorb &amp; heal</button></div>`,
        });
        continue;
      }
      const bonus = h.healBonusFormula ? Math.max(0, Math.floor(edhaEvalSync(h.healBonusFormula, owner.getRollData()))) : 0;
      const heal = Math.min(dealtAmt, half + bonus);
      ChatMessage.create({
        whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🤝 <strong>${w.item.name}</strong> — <strong>${victim.name}</strong> took <strong>${dealtAmt}</strong> ${dtype}. Reaction: take <strong>${half}</strong> of it yourself${takeType !== dtype ? ` (as ${takeType})` : " (same type)"}${heal > 0 ? `, ${victim.name} heals back <strong>${heal}</strong>` : ""}${thp > 0 ? `, and BOTH of you gain <strong>${thp}</strong> Temp HP` : ""}.${h.oncePerRound ? " (Once per round.)" : ""}</p>`
          + `<button type="button" class="edha-intercept-btn" data-edha-owner="${owner.uuid}" data-edha-item="${w.item.uuid}" data-edha-victim="${victim.uuid}" data-edha-half="${half}" data-edha-heal="${heal}" data-edha-type="${takeType}" data-edha-thp="${thp}" data-edha-once="${h.oncePerRound ? 1 : 0}">Use ${w.item.name}</button></div>`,
      });
    }
  } catch (e) { console.error("Edha Content | intercept prompt failed", e); }
}
async function edhaInterceptClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner); if (!owner) return;
    if (!owner.isOwner && !game.user?.isGM) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) resolves this."); return; }
    const item = await fromUuid(ds.edhaItem).catch(() => null);
    const name = item?.name || "the Reaction";
    if (ds.edhaOnce === "1" && !edhaCoordOPRAllowed(owner, item?.id || name, "_react")) { ui.notifications?.info(`${name} already used this round.`); btn.disabled = true; return; }
    const victim = await edhaResolveActorRef(ds.edhaVictim); if (!victim) return;
    let half = Math.max(0, Math.floor(Number(ds.edhaHalf) || 0));
    let heal = Math.max(0, Math.floor(Number(ds.edhaHeal) || 0));
    /* CHOOSE-AMOUNT (2bW — Lifeline): the input decides how much is absorbed — read BEFORE the
     * once-per-round budget is spent, so a "0" declines for free. Heal-back = the amount taken
     * plus the rolled healing die, uncapped (the card's own promise). */
    if (ds.edhaChoose === "1") {
      const input = btn.closest(".edha-trigger-card")?.querySelector(".edha-intercept-amt");
      const amt = Math.min(half, Math.max(0, Math.floor(Number(input?.value) || 0)));
      if (amt <= 0) { btn.disabled = true; btn.textContent = "no absorb"; return; }
      half = amt;
      const hf = decodeURIComponent(ds.edhaHealf || "");
      const extra = hf ? Math.max(0, Math.floor((await edhaRollFormula(owner, hf)).total)) : 0;
      heal = amt + extra;
    }
    if (ds.edhaOnce === "1") await edhaCoordOPRMark(owner, item?.id || name, "_react");
    btn.disabled = true; btn.textContent = `${name} used`;
    const thp = Math.max(0, Math.floor(Number(ds.edhaThp) || 0));
    const type = ds.edhaType || "vital";
    if (half > 0) await edhaCrossDamage(owner, half, type, { edhaRedirected: true });
    const got = heal > 0 ? await edhaCrossHeal(victim, heal) : 0;
    if (thp > 0) { await edhaGrantTempHpCross(owner, thp, name); await edhaGrantTempHpCross(victim, thp, name); }
    // item 68: the heal-back clause reports what the gate let through (or names the mark). The
    // damage the owner takes is measured and unchanged — Lifeline's price is paid either way.
    const healLine = edhaHealLine(victim, heal, got, d => `${victim.name} heals <strong>${d}</strong>`);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🤝 <strong>${name}</strong>: ${owner.name} takes <strong>${half}</strong> ${type} in ${victim.name}'s place${healLine ? `; ${healLine}` : ""}${thp > 0 ? `; both gain <strong>${thp}</strong> Temp HP` : ""}.</p>` });
  } catch (e) { edhaClickFailed("intercept resolve", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-redirect-btn"], ["edha-intercept-btn"] (Job 1, pass 5.3, end of file).

/* --- The flat test aura (2bU — generic; was Mantle's name-keyed injector): +N on every d20 test a
 * qualifying creature rolls near an armed owner. Config-only `edha-test-aura` rules, swept here.
 * NumericTerm append — ⚑ bench: dialog-roll rebuilds (the standing Mantle caveat, unchanged). */
function edhaTestAuraApply(roll, source, config) {
  try {
    const auras = edhaWatchersOfRule("edha-test-aura"); if (!auras.length) return;
    const actor = edhaD20RollActor(config); if (!actor) return;
    const tok = edhaCasterToken(actor); if (!tok) return;
    for (const w of auras) {
      const h = w.handler, owner = w.actor;
      if (h.requireSelfStatus && !owner.statuses?.has?.(h.requireSelfStatus)) continue;
      if (owner === actor) { if (h.includeSelf !== true) continue; }
      else {
        const otok = edhaCasterToken(owner); if (!otok) continue;
        // Item 77: each branch names the predicate it MEANS — `!edhaSameDisposition` is NOT
        // `edhaDisposHostile` (R-63's corollary), so a roller whose side did not resolve matches
        // NEITHER filter instead of slipping through `enemies`. 🤖 bench row.
        const want = String(h.affects || "allies");
        if (want === "allies" && !edhaSameDisposition(owner, tok)) continue;
        if (want === "enemies" && !edhaDisposHostile(owner, actor)) continue;
        const ft = h.rangeColor ? edhaAttuneFtColor(owner, h.rangeColor) : (Number(h.rangeFt) || 0);
        if (!ft || !edhaTokensWithin(otok, ft).some(x => x.id === tok.id)) continue;
      }
      const amt = Math.floor(edhaEvalSync(h.amountFormula || "1", owner.getRollData())) || 0;
      if (!amt) continue;
      const T = foundry.dice?.terms ?? {};
      if (!T.OperatorTerm || !T.NumericTerm) return;
      roll.terms.push(new T.OperatorTerm({ operator: "+" }), new T.NumericTerm({ number: amt, options: { flavor: w.item.name } }));
      roll._formula = Roll.getFormula(roll.terms);
      break;   // first matching aura wins per roll (the hand-rolled Mantle behaviour)
    }
  } catch (e) { console.error("Edha Content | test-aura failed", e); }
}
for (const ctx of ["Skill", "Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${ctx}Roll`, edhaTestAuraApply);

/* --- Scene cleanup (deleteCombat): the whole Power state resets -------------------------------------- */
// R-60: the flag/effects pass (characters-only) and the statuses pass (tokens-only) both widen to
// edhaSceneReset's one deduped population. The flag list is LEGACY-ONLY since 2bU (stale
// pre-conversion worlds); live state is statuses.
async function edhaClearPowerState(endedCombat) {
  await edhaSceneReset(endedCombat, {
    key: "power",
    flags: ["crownActive", "warlordNext", "momentumNext", "fury", "unstoppable", "mantleActive", "mantleUsed", "kneelBy"],
    statuses: ["compelled", "frightened", "crowned", "warlord", "momentum", "fury", "unstoppable", "mantled"],
    extra: async (a) => {
      const fx = a.effects?.filter(e => e.getFlag?.("edha-content", "powerMantle")) ?? [];
      if (fx.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", fx.map(e => e.id)); } catch (e) {} }
    },
  });
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

