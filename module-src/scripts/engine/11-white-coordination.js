/* ============================================================================================
 * WHITE / COORDINATION tree engine (2026-06-14) — Plot Die ("raise the stakes") + ally support.
 * The tree's signature is granting allies a Plot Die and manipulating Complications. The Plot Die
 * injects EXACTLY like advantage: D20Roll.hasPlotDie reads options.plotDie and configureModifiers()
 * pushes the PlotDie term (system index.js ~L3780 / L4017), so this mirrors the advTest flag pattern.
 *
 * IRON RULE 2b (07-25, pass 2bR): ON THEIR OWN DOCUMENTS — the name-keyed watcher loops and use
 * hooks are gone; do not re-add a branch:
 *   H26 `edha-test-react`   Concordant Presence (grant-plot-die, requireSeen — the 07-12 ruling) ·
 *                           Shared Conviction (contest boost) · Pillar of Order (Complication negate)
 *   `edha-designate`        Guiding Signal (Tool A2 primitive; card text is canon, Ben 07-14)
 *   `edha-move-window`      Ordered Advance (round-window arm; the updateToken watcher reads the FLAG)
 *   `edha-pulse` + `edha-cleanse` (on H20's edha-draw-mana event)
 *                           White Leyline Attunement · Beacon of Stability
 * "Success" / "would fail" stay OWNER-JUDGED — Foundry skill tests carry no DC (ruling 1c).
 * ENGINE_OWNED: the posters and click machinery (edhaPostCoordReactionCard / edhaPostPlotGrantCard /
 *   the designate mark + plot-die pre-roll/consume pair, cross-actor writes via the GM `set-flag`
 *   relay) — multi-client card/flag state machines; the rules above are what select and spec them.
 *  - Plot-die grant flag (flags.edha-content.plotDieNext = { skill:<id>|null, source:<talent> }):
 *    the pre-roll injector adds the Plot Die to the recipient's next (optionally skill-gated) test.
 *  - Manual by nature: Unity of Purpose (aid is untracked → edha.raiseStakes API + a note).
 * ============================================================================================ */

/* --- Tool A: the Plot-Die grant primitive ------------------------------------------------------- */
// "Raise the stakes on your next (optionally skill-gated) test." Mirrors edhaAdvTest{PreRoll,Consume}.
function edhaPlotDieInject(roll) {
  roll.options.plotDie = true; roll.configureModifiers?.();      // adds the PlotDie term on fast-forward rolls
  const orig = roll.configureDialog?.bind(roll);                 // dialog rolls: pre-check the "Raise the Stakes" box
  if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.raiseStakes = true; data.plotDie ??= {}; } catch (e) {} return orig(data); };
}
function edhaPlotDiePreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = actor?.getFlag?.("edha-content", "plotDieNext");
    if (g) {
      if (g.skill && roll?.data?.skill?.id !== g.skill) return;   // skill-gated grant waits for the matching test
      return edhaPlotDieInject(roll);
    }
    if (edhaFindMarkGrant(actor)) return edhaPlotDieInject(roll); // designate mark: ally testing the marked target
  } catch (e) { console.error("Edha Content | plot-die pre-roll failed", e); }
}
function edhaPlotDieConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = actor?.getFlag?.("edha-content", "plotDieNext");
    if (g) {
      if (g.skill && roll?.data?.skill?.id !== g.skill) return;
      void actor.unsetFlag("edha-content", "plotDieNext");
      const skl = g.skill ? ` ${String(g.skill).toUpperCase()}` : "";
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>${g.source || "Raise the Stakes"}</strong> — ${actor.name} raises the stakes on this${skl} test (Plot Die added).</p>` });
      return;
    }
    const mk = edhaFindMarkGrant(actor);
    if (mk) {
      void edhaSetEdhaFlag(mk.designator, "plotDieMark", null);   // one grant — clear the designator's mark (GM relay)
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎲 <strong>${mk.mark.source || "Raise the Stakes"}</strong> (${mk.designator.name}) — ${actor.name} raises the stakes on this test against <strong>${mk.mark.targetName || "the designated target"}</strong> (Plot Die added).</p>` });
    }
  } catch (e) { console.error("Edha Content | plot-die consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaPlotDiePreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaPlotDieConsume);
}

// In-range ally helpers (same disposition as the owner, within the owner's <color> Attunement Range).
function edhaAttuneFtColor(owner, color) { return EDHA_ATTUNE_FT[edhaColorRank(owner, color)] || EDHA_ATTUNE_FT[1]; }
function edhaAlliesInAttune(owner, color) {
  const ot = edhaCasterToken(owner); if (!ot) return [];
  const disp = ot.document?.disposition, ft = edhaAttuneFtColor(owner, color);
  return edhaTokensWithin(ot, ft).filter(t => t.actor && edhaSideSame(t.document?.disposition, disp));
}
function edhaAllyInAttune(owner, tok, color) {
  if (!tok) return false;
  const ot = edhaCasterToken(owner); if (!ot || ot.id === tok.id) return false;
  if (!edhaSideSame(tok.document?.disposition, ot.document?.disposition)) return false;   // R-63
  return edhaTokensWithin(ot, edhaAttuneFtColor(owner, color)).some(t => t.id === tok.id);
}

// Generic edha-content flag write with the GM relay (a player rarely owns another actor).
// Pass value null to clear. Returns false only when no write path exists.
async function edhaSetEdhaFlag(actor, key, value) {
  try {
    if (actor.isOwner) { await actor.setFlag("edha-content", key, value); return true; }
    if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online for this."); return false; }
    game.socket.emit("module.edha-content", { action: "set-flag", payload: { actorUuid: actor.uuid, key, value } });
    return true;
  } catch (e) { console.error(`Edha Content | set flag ${key} failed`, e); return false; }
}
// Is a round-scoped window ({ round, combatId }) still open? Armed OUT of combat = open until
// consumed; armed IN combat = open only during that combat's same round. Pure — pinned in tests/.
function edhaRoundWindowValid(mark, combat) {
  if (!mark) return false;
  if (mark.combatId) return !!combat && combat.id === mark.combatId && Number(combat.round) === Number(mark.round);
  return true;
}
// Set the plotDieNext flag on a target actor; cross-actor writes relay to the GM (a player rarely owns
// another PC). source/skill are stored for the consume note + the skill gate.
async function edhaGrantPlotDie(actor, { skill = null, source = "Raise the Stakes" } = {}) {
  return edhaSetEdhaFlag(actor, "plotDieNext", { skill: skill || null, source });
}
/* ENGINE PASS 5.2 (Job 3): `await fromUuid(x).catch(() => null)` + `ref?.actor ?? ref` was hand-rolled
 * ~94 times — a socket-relay payload uuid, a chat-card button's dataset, a stored owner/target/victim
 * ref. One place to resolve "this uuid, whatever it points at (Token or Actor), as an ACTOR":
 * - a Token(Document) uuid resolves via its `.actor`; an Actor uuid resolves directly (`.actor` is
 *   undefined on an Actor document, so the `?? ref` fallback returns the actor itself)
 * - a falsy/blank uuid returns null WITHOUT calling fromUuid — every call site that used to guard
 *   with `uuid ? await fromUuid(...) : null` can now just pass the (possibly blank) uuid straight in
 * - a failed lookup (deleted document, bad uuid) returns null rather than throwing */
async function edhaResolveActorRef(uuid) {
  if (!uuid) return null;
  try {
    const ref = await fromUuid(uuid).catch(() => null);
    return ref?.actor ?? ref ?? null;
  } catch (e) { return null; }
}
// console/macro API: edha.raiseStakes(tokenOrActorOrName, skillId?, source?) — manual Unity of Purpose etc.
function edhaResolveActorArg(arg) {
  if (!arg) return canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
  if (arg.documentName === "Actor") return arg;
  if (arg.actor) return arg.actor;                                // a token
  if (typeof arg === "string") return game.actors?.getName?.(arg) ?? null;
  return null;
}
async function edhaRaiseStakesApi(actorArg, skill = null, source = "Raise the Stakes") {
  const a = edhaResolveActorArg(actorArg);
  if (!a) { ui.notifications?.warn("Edha: select a token or pass an actor/name to raiseStakes."); return false; }
  const ok = await edhaGrantPlotDie(a, { skill, source });
  if (ok) ChatMessage.create({ content: `<p>🎲 <strong>${source}</strong>: ${a.name}'s next ${skill ? String(skill).toUpperCase() + " " : ""}test raises the stakes.</p>` });
  return ok;
}

// Whisper recipients for a Coordination card: the owner's player(s) + the GM (so the owner sees the
// prompt without flooding the public log).
/* --- edhaGmIds({ activeOnly }) (ENGINE PASS 5.3, Job 5; R-62) — ONE whisper-recipient reader for
 * "the GM(s)". Two incompatible spellings existed: `ChatMessage.getWhisperRecipients("GM")` reaches
 * EVERY GM account, including offline ones (3 sites); `game.users?.filter(u => u.active && u.isGM)`
 * reaches ONLINE GMs only (6 sites). R-62's rule, applied by reading what each card actually does:
 * an ACTION-PROMPT (someone must click NOW, while the situation is still live — e.g. the Pyre spread
 * card, which needs a GM to place the burn before the encounter moves on) → active GMs only, so a
 * GM who logs in later isn't shown a dead button; a RECORD/AUDIT card (information worth finding
 * later — Foundry's whisper list is fixed at POST time, so an offline GM's id must already be in it
 * for them to ever see the message, even after logging back in) → all GMs. */
function edhaGmIds({ activeOnly = false } = {}) {
  // `game.users.filter(u => u.isGM)` is exactly what Foundry core's ChatMessage.getWhisperRecipients("GM")
  // does internally — computed directly here so this helper depends on ONE Foundry surface (game.users),
  // not two, and stays testable without a ChatMessage stub.
  return (game.users?.filter(u => u.isGM && (!activeOnly || u.active)) ?? []).map(u => u.id);
}
function edhaWhisperIds(owner) {
  const gmSet = new Set(edhaGmIds({ activeOnly: true }));
  return (game.users?.filter(u => u.active && (gmSet.has(u.id) || owner.testUserPermission?.(u, "OWNER"))) ?? []).map(u => u.id);
}

// Why did an in-range sweep come back empty? Accounts for the cause instead of a bare "none in
// range" (07-12b sweep-transparency convention — the bare message cost a bench cycle on 07-14:
// it can't distinguish no-token-on-scene / wrong side / genuinely out of range).
function edhaSweepEmptyNote(owner, ft, sameSide) {
  try {
    const ot = edhaCasterToken(owner);
    if (!ot) return `${owner.name} has no token on the current scene — use the talent from a PLACED token's sheet (a compendium or sidebar sheet has no position to measure from).`;
    const scene = ot.scene ?? canvas?.scene; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
    // Item 10 batch 2 (R-63): the note counts the SAME candidates the sweep it explains would have
    // matched, so a token whose side did not resolve is neither "same-side" nor "opposing" here and
    // is never named as the nearest; an owner whose own side did not resolve gets told exactly that.
    const disp = ot.document?.disposition;
    if (!Number.isFinite(disp)) return `${owner.name}'s token has no disposition set — allies and targets cannot be told apart, so nothing is in range.`;
    const cands = (canvas?.tokens?.placeables ?? []).filter(t => t.id !== ot.id && t.actor && (sameSide ? edhaSideSame(t.document?.disposition, disp) : edhaSideHostile(t.document?.disposition, disp)));
    if (!cands.length) return `No ${sameSide ? "same-side" : "opposing"} tokens on the scene at all.`;
    const dists = cands.map(t => ({ t, d: Math.hypot((t.center?.x ?? 0) - ot.center.x, (t.center?.y ?? 0) - ot.center.y) / gs * gd })).sort((a, b) => a.d - b.d);
    return `No ${sameSide ? "allies" : "targets"} within ${ft} ft — nearest (${dists[0].t.actor.name}) is ${Math.round(dists[0].d)} ft away; ${cands.length} candidate${cands.length === 1 ? "" : "s"} on the scene.`;
  } catch (e) { return "No candidates in range."; }
}

/* --- edhaPostChoiceCard (ENGINE PASS 5.3, Job 3) — ONE poster for the "whisper (or post) an offer,
 * maybe list costs, wait for a click" card family. Five talents shared this shape near-byte-for-byte
 * (CoordReaction, Beacon, Bulwark, Accord/Voice, PlotGrant) but diverged on three axes, each now an
 * explicit spec field so every current behavior survives unchanged — verified against each family's
 * pre-pass source, not assumed:
 *   - onceGate: CoordReaction/Voice checked the round gate UNCONDITIONALLY before posting (pass
 *     `true`); Bulwark gated only when ITS OWN CALLER asked for it (pass the caller's own boolean —
 *     the "optional" case); Beacon/PlotGrant never gated at post time (pass `false`/omit).
 *   - whisper: true for CoordReaction/Beacon/Bulwark/Voice (always whispered); PlotGrant defaults
 *     PUBLIC and whispers only when its own caller opts in (`whisperToOwner`) — pass that through.
 *   - rows / emptyNote: each family still builds its OWN button markup — the data-attributes differ
 *     too much between families (and matter to their click handlers) to genericize safely. This
 *     function owns only the shared shell: the empty-rows decision (no card at all — Beacon — vs a
 *     card with an explanatory note in place of buttons — PlotGrant's `edhaSweepEmptyNote`, passed as
 *     a THUNK so it is only ever computed when actually needed), the emoji/name/prompt wrapper, the
 *     optional secondary note paragraph (PlotGrant's `note`), and the ChatMessage.create + whisper
 *     choice.
 * Cost-LABEL formatting is unified onto edhaChoiceCostLabel below for all five posters. */
function edhaChoiceCostLabel(costs, { signed = false } = {}) {
  if (!costs?.length) return "";
  return costs.map(c => `${signed ? "−" : ""}${c.value} ${EDHA_RES_LABEL[c.resource] || c.resource}`).join(signed ? ", " : " + ");
}
function edhaPostChoiceCard(owner, { name, emoji = "", prompt = "", rows, onceGate = false, whisper = true, emptyNote = null, noteHtml = "" } = {}) {
  try {
    if (onceGate && !edhaCoordOPRAllowed(owner, name, "_react")) return;
    const rowsHtml = Array.isArray(rows) ? rows.join(" ") : (rows || "");
    let body = rowsHtml;
    if (!body) {
      const note = typeof emptyNote === "function" ? emptyNote() : emptyNote;
      body = note ? `<p style="opacity:.8">${note}</p>` : null;
    }
    if (body == null) return;   // nothing to offer, and no empty-state note configured → no card
    const data = {
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>${emoji}${emoji ? " " : ""}<strong>${name}</strong> — ${prompt}</p>`
        + (noteHtml ? `<p style="opacity:.85;font-size:.9em">${noteHtml}</p>` : "") + body + `</div>`,
    };
    if (whisper) data.whisper = edhaWhisperIds(owner);
    ChatMessage.create(data);
  } catch (e) { console.error(`Edha Content | ${name || "choice"} card failed`, e); }
}

// Plot-die grant card: pick an in-range ally to receive a Plot Die on their next (skill-gated) test.
// Payload lives in data-* attributes (NOT a client-local map) — the watcher posts these GM-side but the
// OWNER's client clicks them, so the data has to travel with the chat HTML.
function edhaPostPlotGrantCard(owner, name, { skill = null, allies = null, whisperToOwner = false, note = "", gate = null } = {}) {
  const list = (allies ?? edhaAlliesInAttune(owner, "white"));
  const skillLabel = skill ? ` (next ${String(skill).toUpperCase()} test)` : " (next test)";
  const gateAttr = gate ? ` data-edha-gate="${encodeURIComponent(JSON.stringify(gate))}"` : "";
  const rows = list.map(t =>
    `<button type="button" class="edha-plotgrant-btn" data-edha-ally="${t.actor.uuid}" data-edha-skill="${skill || ""}" data-edha-source="${encodeURIComponent(name)}"${gateAttr}>${t.name || t.actor.name}</button>`
  );   // TOKEN name — two unlinked "Trooper" drops share an actor name (Ben's 07-14 screenshot)
  edhaPostChoiceCard(owner, {
    name, emoji: "🎲", prompt: `grant Raise the Stakes${skillLabel} to an ally:`, rows,
    whisper: whisperToOwner, noteHtml: note,
    emptyNote: () => edhaSweepEmptyNote(owner, edhaAttuneFtColor(owner, "white"), true),
  });
}
async function edhaPlotGrantClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const ally = await edhaResolveActorRef(btn.dataset.edhaAlly);
    if (!ally) return;
    const skill = btn.dataset.edhaSkill || null;
    const src = decodeURIComponent(btn.dataset.edhaSource || "Raise the Stakes");
    // Concordant Presence gates the grant on the first ally actually succeeding: prompt for the DC.
    let gate = null; try { gate = btn.dataset.edhaGate ? JSON.parse(decodeURIComponent(btn.dataset.edhaGate)) : null; } catch (e) {}
    if (gate) {
      const dc = await edhaPromptDC(`${src} — did the first test succeed?`, `${gate.rollerName || "The ally"} rolled <strong>${gate.rollerTotal}</strong>. Enter the test's DC; the Plot Die is granted only on a success.`);
      if (typeof dc === "number" && Number(gate.rollerTotal) < dc) {
        ui.notifications?.info(`${gate.rollerName || "The ally"} fell short of DC ${dc} — no Plot Die granted.`);
        btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-plotgrant-btn").forEach(b => b.disabled = true);
        btn.textContent = "no success — no grant";
        void edhaMarkCardResolved(edhaMessageIdOf(btn), "no success — no grant");   // R-66: persists past F5/second client
        return;
      }
    }
    await edhaGrantPlotDie(ally, { skill, source: src });
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-plotgrant-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ ${ally.name}`;
    void edhaMarkCardResolved(edhaMessageIdOf(btn), `✓ ${ally.name}`);   // R-66: persists past F5/second client
    ChatMessage.create({ content: `<p>🎲 <strong>${src}</strong>: ${ally.name}'s next ${skill ? String(skill).toUpperCase() + " " : ""}test raises the stakes.</p>` });
  } catch (e) { edhaClickFailed("plot-grant click", e); }
}
/* --- Tool A2: the designate-mark primitive (Guiding Signal shape, Ben 07-14) ---------------------
 * "Designate a character within Attunement Range; the NEXT ally who tests against them this round
 * raises the stakes." The card lists OPPOSING tokens in range (when the Line-Caller runs it, the
 * PCs; when a PC runs it, the adversaries). Clicking stores a round-scoped `plotDieMark` on the
 * DESIGNATOR; the plot-die pre-roll/consume pair injects for the first same-side roller whose
 * user-targets include the marked token, then clears the mark (GM relay). One flag, no per-ally
 * writes. Any later "mark an enemy, reward allies engaging it" talent is one designate call. */
function edhaPostDesignateCard(owner, name, { color = "white", note = "" } = {}) {
  try {
    const ot = edhaCasterToken(owner);
    const ft = edhaAttuneFtColor(owner, color);
    const targets = ot ? edhaTokensWithin(ot, ft).filter(t => t.actor && edhaDisposHostile(owner, t.actor)) : [];   // R-63 🤖 bench row
    const body = !targets.length
      ? `<p style="opacity:.8">${edhaSweepEmptyNote(owner, ft, false)}</p>`
      : targets.map(t => `<button type="button" class="edha-designate-btn" data-edha-target="${t.document.uuid}" data-edha-owner="${owner.uuid}" data-edha-source="${encodeURIComponent(name)}">${t.name || t.actor.name}</button>`).join(" ");   // TOKEN name — duplicate unlinked drops share an actor name
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🎯 <strong>${name}</strong> — designate a character within ${ft} ft:</p>`
        + (note ? `<p style="opacity:.85;font-size:.9em">${note}</p>` : "") + body + `</div>`,
    });
  } catch (e) { console.error("Edha Content | designate card failed", e); }
}
async function edhaDesignateClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const owner = await edhaResolveActorRef(btn.dataset.edhaOwner); if (!owner) return;
    const tDoc = await fromUuid(btn.dataset.edhaTarget).catch(() => null); if (!tDoc) return;
    const src = decodeURIComponent(btn.dataset.edhaSource || "Designate");
    const c = edhaInActiveCombat(owner);   // R-4/#28a: stamp the DESIGNATOR's combat, so the window reads back in it
    const ok = await edhaSetEdhaFlag(owner, "plotDieMark", { target: btn.dataset.edhaTarget, targetName: tDoc.name, source: src, round: c ? Number(c.round) : null, combatId: c?.id ?? null });
    if (!ok) return;
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-designate-btn").forEach(b => b.disabled = true);
    void edhaMarkCardResolved(edhaMessageIdOf(btn), `✓ ${tDoc.name}`);   // R-66: persists past F5/second client
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎯 <strong>${src}</strong>: ${owner.name} designates <strong>${tDoc.name}</strong> — the next ally to test against them this round raises the stakes. <span style="opacity:.8">(target ${tDoc.name}'s token when rolling)</span></p>` });
  } catch (e) { edhaClickFailed("designate click", e); }
}
// The mark grant a roller qualifies for: some same-side DESIGNATOR (not the roller) holds a live
// plotDieMark whose marked token is among the rolling user's targets.
function edhaFindMarkGrant(actor) {
  try {
    const rTok = edhaCasterToken(actor); if (!rTok) return null;
    const rDisp = rTok.document?.disposition;
    const targeted = new Set(edhaUserTargetTokens().map(t => t.document?.uuid).filter(Boolean));
    if (!targeted.size) return null;
    for (const t of canvas?.tokens?.placeables ?? []) {
      const a = t.actor; if (!a || a.uuid === actor.uuid || t.id === rTok.id) continue;
      if (!edhaSideSame(t.document?.disposition, rDisp)) continue;   // a same-side DESIGNATOR only — unknown fails CLOSED (R-63)
      const m = a.getFlag?.("edha-content", "plotDieMark");
      if (!m || !edhaRoundWindowValid(m, edhaInActiveCombat(a))) continue;   // R-4/#28a: the DESIGNATOR's combat
      if (targeted.has(m.target)) return { designator: a, mark: m };
    }
    return null;
  } catch (e) { return null; }
}

// Button binding: EDHA_CARD_BUTTONS["edha-plotgrant-btn"], ["edha-designate-btn"] (Job 1, pass 5.3, end of file).

/* --- Tool B: the Coordination post-roll watcher (Concordant Presence / Shared Conviction / Pillar) - */
// Once-per-round gate, parallel to the focus economy's (keyed off a separate "coordRound" store).
/* ⛑ THE DOTTED-FLAG-KEY CLASS, third instance — `coordRound` joins the ambush-belief and `trigRound`
 * ledgers behind `edhaFlagKey` (fix pass 9, TODO 72; bench run 40's root-caused defect).
 *
 * `edhaPromptPickClick` marks its `once: "round"` budget with the TALENT'S UUID —
 * `edhaCoordOPRMark(owner, item.uuid, "_pick")` — and Foundry expands dotted keys at every depth of
 * an update payload (`ClientDatabaseBackend#_updateDocuments` runs `foundry.utils.expandObject` on
 * every update, client/data/client-backend.mjs:208; that helper recurses into every plain object,
 * common/utils/helpers.mjs:495). So the document stored `coordRound.Actor.<id>.Item.<id>._pick`
 * while the reader looked up the FLAT key and got `undefined` — for ever. Measured live: three
 * Unnerving Approach picks in round 4 with the round-4 mark present. Blast radius: every
 * `edha-prompt-pick` rule carrying `once: "round"` (Black's Unnerving Approach and Puppeteer, plus
 * Unnerving Approach's adversary twin). It hid because every other caller here passes a talent name
 * or an item id, and nothing in `data/` carries a dot in a name or an id.
 *
 * Escaped at the LEDGER BOUNDARY, not the call site (the standing rule — ENGINE_INDEX "⛑ A DOTTED
 * KEY IN A FLAG VALUE"), so any caller may pass any string. A no-op on every dot-free key already
 * persisted, so no migration is needed for the eight other call sites. */
function edhaCoordOPRAllowed(owner, name, key) {
  const round = edhaCombatRoundOf(owner); if (round == null) return true;   // R-4/#28a: the OWNER's combat
  const store = owner.getFlag?.("edha-content", "coordRound") ?? null;
  if (!store) return true;
  /* The escaped key is the only one written from here on. The `getProperty` fallback is a ONE-TIME
   * tolerance for a document stamped BEFORE this fix: those marks are really stored at the expanded
   * PATH, and reading them keeps a budget already spent this round spent across the F5. */
  const bucket = store[edhaFlagKey(name)]
    ?? (String(name ?? "").includes(".") ? foundry.utils.getProperty(store, String(name)) : null);
  return bucket?.[edhaFlagKey(key)] !== round && bucket?.[key] !== round;
}
async function edhaCoordOPRMark(owner, name, key) {
  const round = edhaCombatRoundOf(owner); if (round == null) return;   // R-4/#28a: the OWNER's combat
  const m = foundry.utils.deepClone(owner.getFlag("edha-content", "coordRound") ?? {});
  (m[edhaFlagKey(name)] ??= {})[edhaFlagKey(key)] = round;
  try { await owner.setFlag("edha-content", "coordRound", m); } catch (e) {}
}
// The kept (active) d20 natural result — for Shared Conviction's "plausible failure" heuristic.
function edhaKeptD20Nat(roll) {
  const d = roll?.dice?.find(x => x.faces === 20); if (!d) return null;
  const r = d.results?.find(x => x.active) ?? d.results?.[0];
  return r ? (Number(r.result) || 0) : null;
}

