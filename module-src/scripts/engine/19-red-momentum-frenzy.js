/* ============================================================================================
 * RED / MOMENTUM + FRENZY tree engine (2026-06-15)
 * ⚑ IRON RULE 2b (07-24p): INCITE is on its own document — `edha-def-test` Intimidation vs
 *   Spiritual. It is also the pass's one genuine BEHAVIOUR UPGRADE: its old case posted "on a
 *   success…" without resolving anything, i.e. it trusted the player to have won an opposed test,
 *   which iron rule 3 forbids. The engine resolves it now; only the forced action stays volition.
 * ── IRON RULE 2b STATUS (07-26, pass 2bY — tree CLEAR) ──────────────────────────────────────
 *   Breaking Point — H8 `edha-watch {watch: damaged}` (the new generic per-round hit-count kind)
 *     + edha-apply-status payload. Frenzied Tempo — `edha-test-rider {mode: advantage,
 *     whenAttribute: pre, whenFastTurn, unlessSkills}` (the exclude-list field is new with 2bY).
 *   Shatter Focus — the RED card (focus drain) is an `edha-focus {op: drain, target: victim}`
 *     rule on ITS document; the same-named CHAOS talent rides `edha-reroll-react`. The name-keyed
 *     takeover that conflated them is deleted (see the Chaos section).
 * Pilot: this is the FIRST tree to ENFORCE forced/granted movement (auto-move the caster, push +
 * wall-collision on a target) rather than GM-narrating it (the convention used by Ordered Advance,
 * Redirect Momentum, Ghostly Walls, Living Image). See FORCED_MOVEMENT_PILOT.md for the porting plan.
 * Reused, NOT reinvented:
 *  - fast/slow turn: read combatant.getFlag("cosmere-rpg","turnSpeed") (no event, but readable at
 *    pre-roll / on-damage time — all the fast-turn talents gate a test or a deal-damage trigger).
 *  - test/(dis)advantage: the Calculation nextTestMod flag (edhaSetNextTestMod / pre-roll injector).
 *  - focus drain: the Whispered-Doubt focus-write pattern. plot die: the plotDieNext flag.
 *  - damage/affliction/status payloads: the edha-triggered-effect machinery.
 * New here: edha-move / edha-push handlers, the moved-toward + fast-turn + first-test rider gates,
 * and the rally stack (Battle Fever / Feeding Frenzy).
 * ============================================================================================ */

// --- Fast/slow turn (read-only; the cosmere system has no toggle event) --------------------------
function edhaCombatantOf(actor) {
  try {
    // R-4/#28a: the combat this creature is IN, not the one this client is looking at. Reading
    // `game.combat` here made every fast/slow-turn payoff silently inert whenever the tracker was
    // showing a different encounter (or none), which is the read side of the cross-combat family.
    const combat = edhaInActiveCombat(actor); if (!combat?.started || !actor) return null;
    const tokenId = actor.isToken ? actor.token?.id : null;
    return combat.combatants.find(c => tokenId ? c.tokenId === tokenId : c.actorId === actor.id) ?? null;
  } catch (e) { return null; }
}
function edhaIsFastTurn(actor) {
  try {
    const c = edhaCombatantOf(actor); if (!c) return false;
    const ts = c.getFlag?.("cosmere-rpg", "turnSpeed");
    if (ts == null) return false;                              // default Slow
    return String(ts).toLowerCase().includes("fast");          // TurnSpeed.Fast enum (string or "fast")
  } catch (e) { return false; }
}
/* ⚠ NOT `!edhaIsFastTurn(actor)`, and this is the whole point of the function existing (07-24y).
 * edhaIsFastTurn collapses THREE states into one `false` — (a) no combat, (b) in combat with no
 * combatant, (c) a genuine Slow turn. Only (c) is a slow turn. It can afford that because it fails
 * CLOSED: a fast-turn payoff that never fires out of combat is merely inert. The negation fails
 * OPEN, so `whenSlowTurn` written as `!edhaIsFastTurn` would grant Calculated Patience's advantage
 * on the first test of every out-of-combat scene — a buff nobody asked for, in the one place it is
 * hardest to notice. Requiring a live combatant is what makes the mirror honest.
 * An UNSET turnSpeed in combat IS Slow: the system's own getter is `?? TurnSpeed.Slow` and its
 * schema's `initial` is "slow" (cosmere-rpg index.js — verified 07-24y), while the engine reads the
 * raw flag, which is `undefined` until the player toggles. */
function edhaIsSlowTurn(actor) {
  try {
    const c = edhaCombatantOf(actor); if (!c) return false;    // fails CLOSED out of combat — see above
    const ts = c.getFlag?.("cosmere-rpg", "turnSpeed");
    if (ts == null) return true;                               // unset in combat = Slow (system default)
    return !String(ts).toLowerCase().includes("fast");
  } catch (e) { return false; }
}

// --- First test this turn (Burning Drive). Client-local: the rider fires on the owner's own roll. --
const _edhaTestedThisTurn = new Set();   // actorIds that have already rolled a test this turn
function edhaStampTested(roll, source, config) { try { const a = edhaD20RollActor(config); if (a) _edhaTestedThisTurn.add(a.id); } catch (e) {} }
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaStampTested);
Hooks.on("combatTurnChange", () => _edhaTestedThisTurn.clear());
Hooks.on("combatStart",      () => _edhaTestedThisTurn.clear());
function edhaIsFirstTestThisTurn(actor) { return !!actor && !_edhaTestedThisTurn.has(actor.id); }

// --- Net distance moved toward a creature this turn (Momentum's Edge) -----------------------------
const _edhaTurnStartPos = new Map();   // tokenId -> {x,y} at the moment that token's turn began
function edhaStampTurnStart(combat) {
  try { const tok = combat?.combatant?.token; if (tok) _edhaTurnStartPos.set(tok.id, { x: tok.x, y: tok.y }); } catch (e) {}
}
Hooks.on("combatTurnChange", (combat) => edhaStampTurnStart(combat));
Hooks.on("combatStart",      (combat) => edhaStampTurnStart(combat));
function edhaPxPerFt() { const s = canvas?.scene; return (s?.grid?.size || 100) / (s?.grid?.distance || 5); }
function edhaMovedTowardFt(actor, target) {
  try {
    const tok = edhaCasterToken(actor), ttok = target ? (edhaCasterToken(target)) : null;
    if (!tok || !ttok) return 0;
    const start = _edhaTurnStartPos.get(tok.id);
    if (!start) return 0;
    const cur = { x: tok.document.x, y: tok.document.y };
    const mv = { x: cur.x - start.x, y: cur.y - start.y };
    const dir = { x: ttok.center.x - tok.center.x, y: ttok.center.y - tok.center.y };
    const dlen = Math.hypot(dir.x, dir.y) || 1;
    const projPx = (mv.x * dir.x + mv.y * dir.y) / dlen;        // displacement projected onto the line to the target
    return Math.max(0, projPx / edhaPxPerFt());
  } catch (e) { return 0; }
}

// --- Once per turn (Unstoppable) -----------------------------------------------------------------
// R-4/#28a: `edhaTurnSeqOf(actor)` — the turn sequence of the ACTOR's own combat. The old
// `edhaTurnSeqNow()` read `game.combat`, so a second combat's turn ticks moved this actor's
// once-per-turn clock (and the viewed-combat-is-null case froze it).
function edhaOncePerTurnAllowed(actor, key) { const s = edhaTurnSeqOf(actor); if (s == null) return true; return actor.getFlag?.("edha-content", "oncePerTurn")?.[key] !== s; }
async function edhaOncePerTurnMark(actor, key) {
  const s = edhaTurnSeqOf(actor); if (s == null) return;
  const m = foundry.utils.deepClone(actor.getFlag("edha-content", "oncePerTurn") ?? {}); m[key] = s;
  try { await actor.setFlag("edha-content", "oncePerTurn", m); } catch (e) {}
}

// --- Movement primitives (the pilot) -------------------------------------------------------------
// Move from origin toward aim, capped at maxFt, halted at the first MOVEMENT wall. Degrades to the
// full move if the collision backend is unavailable (logged, never throws).
// Is another (visible, living-actor) token occupying the square a move would end on? Engine moves
// must never stack tokens (Ben R2, 07-12 — pass-2's Unnerving pushes left Troopers stacked, and a
// stacked pair later read as a phantom third Flame Surge target). Overlap = bound-box centers closer
// than the tokens' combined half-sizes. Manual GM drags are deliberately NOT policed (R2: engine only).
function edhaTokenAtDest(movingTok, center) {
  try {
    const gs = canvas?.scene?.grid?.size || 100;
    const selfId = movingTok?.id ?? movingTok?.document?.id;
    for (const t of canvas?.tokens?.placeables ?? []) {
      if (!t?.actor || t.id === selfId || t.document?.hidden) continue;
      const minSep = ((t.w || gs) + (movingTok?.w || gs)) / 2 - 2;
      if (Math.abs(t.center.x - center.x) < minSep && Math.abs(t.center.y - center.y) < minSep) return t;
    }
  } catch (e) {}
  return null;
}
/* Returns { dest, movedFt, collided, blockedBy, blocker }.
 * `blockedBy` (2026-07-28, bench run 17) names WHY a move fell short: "direction" (the aim collapsed
 * onto the origin — no direction to travel), "wall", or "token" (with `blocker` = the occupier's
 * name). It exists because a 0-ft result used to be indistinguishable from a broken engine: run 17
 * spent a whole pass on "Shockwave Slam pushes 0 ft" and could not tell a body in the way from a
 * wall from a dead handler, because every one of those posts the identical bare card. A fallback
 * that hides the reason hides YOUR bug too — the callers now print it. */
function edhaComputeMove(origin, aim, maxFt, movingTok = null) {
  const ppf = edhaPxPerFt();
  const dx = aim.x - origin.x, dy = aim.y - origin.y, len = Math.hypot(dx, dy);
  if (len < 1) return { dest: { ...origin }, movedFt: 0, collided: false, blockedBy: "direction", blocker: "" };
  const travel = Math.min(len, maxFt * ppf);
  let dest = { x: origin.x + dx / len * travel, y: origin.y + dy / len * travel };
  let collided = false, blockedBy = null, blocker = "";
  try {
    /* Straddle guard (2026-07-26l, bench run 3 defect 3). When the mover's own square straddles a
     * wall — its CENTER sitting on/within rounding distance of the wall line (the bench staged
     * exactly that against the Playtest Map's x=5156 wall) — the sweep behind testCollision
     * degenerates around a collinear origin and returns a spurious "closest" hit on a lane the
     * backend itself reports CLEAR ("moves 3 ft (stopped at an obstacle)"). The origin IS the
     * token center (v13 Token#center → document.getCenterPoint — the bench's corner-origin guess
     * is refuted in code); the degeneracy is the collinear origin, the exact case core guards in
     * Token#getMovementAdjustedPoint ("edges collinear with the point" get a ±1px offset). Core
     * resolves the ambiguous side by movement HISTORY; an engine slide knows its INTENT, so the
     * test ray starts 2px along the direction of travel — a wall genuinely ahead (≥3px) still
     * blocks, the wall under the token no longer participates. movedFt stays measured from the
     * true origin. ⚑ residual: travel near-PARALLEL to the straddled wall can still round onto
     * the line; not stageable from here — bench run 4 re-tests the x=5156 case. */
    const nudge = Math.min(2, travel);
    const torigin = { x: origin.x + dx / len * nudge, y: origin.y + dy / len * nudge };
    const hit = CONFIG.Canvas?.polygonBackends?.move?.testCollision?.(torigin, dest, { type: "move", mode: "closest" });
    if (hit) { collided = true; blockedBy = "wall"; dest = { x: hit.x, y: hit.y }; }
  } catch (e) { /* no movement backend → travel the full distance */ }
  /* Occupied destination → step back toward the origin one grid square at a time until clear (R2).
   * Note the step is a WHOLE square deliberately: `edhaTokenAtDest` is a bounding-box overlap, so
   * for a push of exactly one square there is no intermediate position that clears the occupier —
   * the origin is the only legal stop, and 0 ft is then the CORRECT answer, not a failure. That is
   * why a 1-square push is all-or-nothing while run 12's 2-square push degraded to 5 ft; the bug
   * was never the arithmetic, it was that the card never said a body was in the way. */
  if (movingTok) {
    try {
      const gs = canvas?.scene?.grid?.size || 100;
      let d = Math.hypot(dest.x - origin.x, dest.y - origin.y);
      let occ;
      while (d > 1 && (occ = edhaTokenAtDest(movingTok, dest))) {
        collided = true; blockedBy = "token"; blocker = occ.actor?.name ?? occ.name ?? "";
        const nd = Math.max(0, d - gs);
        dest = { x: origin.x + dx / len * nd, y: origin.y + dy / len * nd };
        d = nd;
      }
    } catch (e) {}
  }
  return { dest, movedFt: Math.hypot(dest.x - origin.x, dest.y - origin.y) / ppf, collided, blockedBy, blocker };
}
// One phrasing for "the move stopped short, and here is what stopped it" — shared by every mover.
function edhaBlockedText(blockedBy, blocker) {
  if (blockedBy === "wall") return " (stopped by a wall)";
  if (blockedBy === "token") return ` (stopped by ${blocker || "another creature"})`;
  if (blockedBy === "direction") return " (no direction to move)";
  return "";
}
// Write a token to a CENTER destination — directly if we own it, else relay to the GM (push vs an enemy).
// Every engine-driven relocation (edha-move/edha-push slides, Trade Routes teleport) funnels through
// here and stamps `options.edhaForced`, so move watchers can tell an engine move from a walk; GM
// hand-drags carry no stamp and stay ambiguous (Order's violation prompt covers those).
async function edhaMoveTokenTo(tok, centerDest, { teleport = false, hostile = false } = {}) {
  // `hostile` (07-16c, Dense Tissue): pushes/pulls AGAINST the victim's volition stamp
  // options.edhaHostileMove so immunity vetoes can tell them from willing engine slides
  // (Cruel Step / Trade Routes), which stamp only edhaForced.
  const doc = tok.document ?? tok;
  const gs = canvas?.scene?.grid?.size || 100;
  const w = tok.w || ((doc.width || 1) * gs), h = tok.h || ((doc.height || 1) * gs);
  const x = Math.round(centerDest.x - w / 2), y = Math.round(centerDest.y - h / 2);
  const opts = hostile ? { edhaForced: true, edhaHostileMove: true } : { edhaForced: true };
  if (doc.isOwner) {
    try {
      // Teleport (Trade Routes): v13 animates plain updates along a WALL-CONSTRAINED walk path — the
      // pass-3 teleport got stuck on a wall. "displace" is core's own unconstrained teleport action
      // (walls: null, no animation — the same action Region teleports use).
      if (teleport && typeof doc.move === "function") { await doc.move({ x, y, action: "displace" }, opts); return true; }
      await doc.update({ x, y }, { animate: !teleport, teleport, ...opts }); return true;
    } catch (e) {}
  }   // engine push/slide = not willing movement (Order violation watcher + Dread Presence veto both read this)
  if (game.users?.activeGM) { try { game.socket.emit("module.edha-content", { action: "move-token", payload: { tokenUuid: doc.uuid, x, y, teleport, hostile } }); return true; } catch (e) {} }
  return false;
}
// Slide `tok` toward `destCenter`, optionally stopping `gapPx` short (so a charge lands adjacent, not on top).
async function edhaApplyMove(tok, destCenter, maxFt, { gapPx = 0, hostile = false } = {}) {
  const origin = tok.center;
  let aim = destCenter;
  if (gapPx > 0) {
    const dx = destCenter.x - origin.x, dy = destCenter.y - origin.y, len = Math.hypot(dx, dy) || 1;
    aim = { x: destCenter.x - dx / len * gapPx, y: destCenter.y - dy / len * gapPx };
  }
  const r = edhaComputeMove(origin, aim, maxFt, tok);
  await edhaMoveTokenTo(tok, r.dest, { hostile });
  return r;
}
// Walking Speed in ft. `movement.walk.rate` is a DerivedValueField OBJECT — read it through
// edhaDerivedNum (07-27y: the raw Number() here was NaN → 0, so every `edha-move {byHalfSpeed}`
// moved 0 ft — the three "Unstoppable" blocks). Pure — pinned in tests/.
function edhaSpeedFt(actor) { return Math.max(0, edhaDerivedNum(actor?.system?.movement?.walk?.rate, 0)); }
function edhaMoveAllowanceFt(actor, cfg) {
  if (cfg.byHalfSpeed) return Math.floor(edhaSpeedFt(actor) / 2);
  if (cfg.bySize) return EDHA_SIZE_FT[edhaColorRank(actor, "red")] || EDHA_SIZE_FT[1];
  return Number(cfg.distanceFt) || 0;
}

// edha-move executor body: relocate the caster toward their current target, ignoring Reactions.
async function edhaRunMove(item, cfg) {
  try {
    const actor = item?.actor; if (!actor) return;
    if (cfg.whenFastTurn && !edhaIsFastTurn(actor)) return;
    const key = item.name;
    if (cfg.oncePerTurn && !edhaOncePerTurnAllowed(actor, key)) return;
    const maxFt = edhaMoveAllowanceFt(actor, cfg);
    const tok = edhaCasterToken(actor);
    const ttok = edhaUserTargetToken();
    // Cruel Step (07-12): the slide is only legal toward an ISOLATED target — warn and stand down
    // otherwise (the activation cost has already been paid; the GM can refund if it was a misclick).
    if (cfg.requireTargetIsolated && ttok?.actor && !edhaIsIsolated(ttok.actor, ttok)) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🚫 <strong>${item.name}</strong> — ${ttok.actor.name} is not Isolated (a living ally is adjacent): no move. <span style="opacity:.8">(GM may refund the cost if this was a mistarget.)</span></p>` });
      return;
    }
    if (cfg.oncePerTurn) await edhaOncePerTurnMark(actor, key);
    if (!tok || !ttok) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>💨 <strong>${item.name}</strong> — ${actor.name} may move up to <strong>${maxFt} ft</strong> without provoking Reactions. <span style="opacity:.8">(no target selected — position manually)</span></p>` });
      return;
    }
    const { movedFt, collided, blockedBy, blocker } = await edhaApplyMove(tok, ttok.center, maxFt, { gapPx: (tok.w || 0) / 2 });
    const stopTxt = blockedBy ? edhaBlockedText(blockedBy, blocker) : (collided ? " (stopped at an obstacle)" : "");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>💨 <strong>${item.name}</strong> — ${actor.name} moves <strong>${Math.round(movedFt)} ft</strong> toward ${ttok.actor?.name ?? "the target"}${stopTxt}, ignoring Reactions.</p>` });
  } catch (e) { console.error("Edha Content | edha-move failed", e); }
}

// edha-push executor body (Shockwave Slam): shove the victim directly away from the attacker; if it
// slams into a wall, deal the collision damage.
async function edhaRunPush(owner, victim, cfg) {
  try {
    if (!owner || !victim) return;
    // Dense Tissue (07-16c, Ben E16 — was "volition, no hook"): the mutation makes its bearer
    // immune to forced movement, and every engine push comes through here — refuse cleanly.
    if (victim.getFlag?.("edha-content", "mutation")?.kind === "denseTissue") {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: victim }), content: `<p>🧬 <strong>Dense Tissue</strong>: ${victim.name} is immune to forced movement — the push does nothing.</p>` });
      return;
    }
    const otok = edhaCasterToken(owner), vtok = edhaCasterToken(victim);
    if (!otok || !vtok) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>💥 <strong>${cfg.note || "Push"}</strong> — push ${victim.name} (no token on canvas — apply manually).</p>` });
      return;
    }
    /* 07-24s: two widenings, both because Unnerving Approach's hand-rolled push was NOT this
     * function and could not become it. `sizeColor` — [Size] scaled off any colour, not always Red
     * (Unnerving Approach is Black). `awayFrom: "anchor"` — shove the creature away from a THIRD
     * party rather than from you, which is what "push its ally directly away from your target"
     * means; the anchor is whatever the rule's trigger handed the payload (H6 passes the creature
     * its candidate list was measured around). A missing anchor falls back to you rather than
     * refusing — the push still happens, from the wrong origin, and the card says who it was from. */
    const anchorTok = (String(cfg.awayFrom || "self") === "anchor" && cfg.anchorActor)
      ? (edhaCasterToken(cfg.anchorActor) ?? otok) : otok;
    const maxFt = cfg.bySize ? (EDHA_SIZE_FT[edhaColorRank(owner, cfg.sizeColor || "red")] || EDHA_SIZE_FT[1]) : (Number(cfg.distanceFt) || 5);
    const dx = vtok.center.x - anchorTok.center.x, dy = vtok.center.y - anchorTok.center.y, len = Math.hypot(dx, dy);
    /* A push needs a DIRECTION, and "directly away" is undefined when the victim and the anchor
     * share a centre (stacked tokens — which this engine's own R2 comment records as a thing that
     * has happened). The old `|| 1` swallowed that: the aim collapsed onto the victim's own centre
     * and the card read "pushed 0 ft" with no reason, indistinguishable from a broken handler.
     * Refuse out loud instead (iron rule 3 — no silent no-ops). */
    if (!(len >= 1)) {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>💥 <strong>${cfg.note || "Push"}</strong> — ${victim.name} is in the same space as ${anchorTok.actor?.name ?? owner.name}, so "directly away" has no direction: nothing moves. <span style="opacity:.8">(Separate the tokens and re-apply.)</span></p>` });
      return;
    }
    const aim = { x: vtok.center.x + dx / len * (maxFt * edhaPxPerFt()), y: vtok.center.y + dy / len * (maxFt * edhaPxPerFt()) };
    const { movedFt, collided, blockedBy, blocker } = await edhaApplyMove(vtok, aim, maxFt, { gapPx: 0, hostile: true });
    let dmgTxt = "";
    // A push that never travelled cannot have slammed into anything — the collision die only rolls
    // on real displacement. (Before 07-28 a victim wedged against a body ate wall-collision damage
    // while the same card said it was "pushed 0 ft".)
    if (collided && movedFt > 0 && cfg.collisionFormula) {
      const roll = await (new Roll(cfg.collisionFormula, owner.getRollData())).evaluate();
      const amt = Math.max(0, Math.floor(roll.total));
      if (amt > 0) { await edhaCrossDamage(victim, amt, cfg.collisionType || "impact", { edhaSource: owner }); dmgTxt = ` and slams into an obstacle for <strong>${amt} ${cfg.collisionType || "impact"}</strong>`; }
    }
    const fromTxt = anchorTok !== otok ? ` directly away from ${anchorTok.actor?.name ?? "your target"}` : "";
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>💥 <strong>${cfg.note || "Push"}</strong> — ${victim.name} is pushed <strong>${Math.round(movedFt)} ft</strong>${fromTxt}${edhaBlockedText(blockedBy, blocker)}${dmgTxt}.</p>` });
  } catch (e) { console.error("Edha Content | edha-push failed", e); }
}

// --- Rally stack (Battle Fever / Feeding Frenzy): +1 per stack, SPENT on your next test, capped at Red rank, time-boxed --
// R-27 (item 52, 2026-09-06 — Ben: THE CARD is canon). "Gain +1 to your next test" per stack = the
// WHOLE stack rides ONE test, then it is gone; an unspent stack still clears at the start of the
// owner's turn (resetOn turn) or the round flip (resetOn round). Before this the bonus rode every
// test until turn start (+2[Rally] on 6+ consecutive rolls at the bench).
function edhaRallyBonus(actor) {
  try { const r = actor?.getFlag?.("edha-content", "rally"); return r ? Math.min(Number(r.count) || 0, edhaColorRank(actor, "red")) : 0; }
  catch (e) { return 0; }
}
async function edhaRallyBump(actor, resetOn = "turn") {
  const cap = edhaColorRank(actor, "red"); if (cap <= 0) return 0;
  const cur = edhaRallyBonus(actor); if (cur >= cap) return cur;
  try { await actor.setFlag("edha-content", "rally", { count: cur + 1, resetOn }); } catch (e) {}
  return cur + 1;
}
async function edhaRallyClear(actor) { try { if (actor?.getFlag?.("edha-content", "rally")) await actor.unsetFlag("edha-content", "rally"); } catch (e) {} }
// Battle Fever: the owner's own damage feeds the frenzy (enforced). Allies-in-range sharing is narrated.
function edhaRallyOnDeal(actor) {
  try {
    if (!actor?.items) return;
    for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-rally-stack")) {
      if ((h.trigger || "deal-damage") !== "deal-damage") continue;
      void edhaRallyBump(actor, h.resetOn || "turn").then((n) => {
        if (n > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔥 <strong>${tal.name}</strong> — ${actor.name} (and allies in Attunement Range) gain <strong>+${n}</strong> to their next test (max ${edhaColorRank(actor, "red")}). <span style="opacity:.8">Allies: apply +${n} yourselves.</span></p>` });
      });
      break;
    }
  } catch (e) { console.error("Edha Content | rally-on-deal failed", e); }
}
// Console/macro hook for the no-engine-hook trigger (Feeding Frenzy: "an enemy attacks another enemy").
async function edhaRallyApi(actorArg) {
  const a = edhaResolveActorArg(actorArg); if (!a) { ui.notifications?.warn("Edha: select a token or pass an actor/name to rally()."); return 0; }
  const tal = a.items?.find(i => edhaIsTalent(i) && edhaRuleOf(i, "edha-rally-stack"));
  const h = tal ? edhaRuleOf(tal, "edha-rally-stack") : null;
  const n = await edhaRallyBump(a, h?.resetOn || "round");
  if (n > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🔥 <strong>${tal?.name || "Frenzy"}</strong> — ${a.name} gains <strong>+${n}</strong> to its next test.</p>` });
  return n;
}
// Consume-on-test (R-27): the pre-roll rider (`edhaTestRiderApply`) reads `edhaRallyBonus` and adds
// the whole capped stack as `N[Rally]`; THIS post-roll consumer clears the stack so the next test
// rolls at +0. Post-roll rather than pre-roll on purpose — a cancelled roll dialog must not strand
// the stack (the same pre-apply / post-consume split `advTest` and `nextTestMod` use). It re-reads
// the actor flag, not a roll option, because a dialog roll rebuilds `roll.options` (§ pre-roll note).
function edhaRallyConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const n = edhaRallyBonus(actor); if (n <= 0) return;
    void edhaRallyClear(actor);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🔥 <strong>Rally</strong> — ${actor.name} spent <strong>+${n}</strong> on this test.</p>` });
  } catch (e) { console.error("Edha Content | rally consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaRallyConsume);
// Reset: "start of your turn" (resetOn turn) at each turn change; "start of round" (resetOn round) at the round flip.
Hooks.on("combatTurnChange", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const newRound = (combat?.turn ?? 0) === 0;
    const cur = combat?.combatant?.actor;
    for (const t of (combat?.turns ?? [])) {
      const a = t?.actor; if (!a) continue;
      const r = a.getFlag?.("edha-content", "rally"); if (!r) continue;
      if (r.resetOn === "round") { if (newRound) void edhaRallyClear(a); }
      else if (a === cur) void edhaRallyClear(a);                 // resetOn "turn" → clears when its own turn begins
    }
  } catch (e) { console.error("Edha Content | rally reset failed", e); }
});

/* --- The `damaged` watch kind (2bY — was the name-keyed Breaking Point applyDamage watcher):
 * every real damage application bumps the victim's per-round hit counter and ANNOUNCES it as a
 * watch event whose observed value is the count, so "struck a 2nd time in a round" is a plain
 * {watch: damaged, whenTotal: at-least 2, once: round-per-target} rule and any future
 * Nth-hit-this-round talent is authoring, not engine work. GM-side (the damage applier), like the
 * defeat announce. The `bpHits` flag name is the counter's legacy key, kept so a mid-combat
 * deploy doesn't double-count — it names no talent. */
async function edhaDamagedWatchAnnounce(victim, damage) {
  try {
    if (!edhaDefBuffGmGate() || _edhaInTrigger) return;
    if (!victim || (Number(damage?.dealt) || 0) <= 0) return;
    const round = edhaCombatRoundOf(victim); if (round == null) return;   // R-4/#28a: the VICTIM's combat owns its per-round hit ledger
    const key = `bpHits.${round}`;
    const hits = (Number(victim.getFlag?.("edha-content", key)) || 0) + 1;
    try { await victim.setFlag("edha-content", key, hits); } catch (e) {}
    await edhaDispatchWatchers({ kind: "damaged", owner: victim, victim: null, skill: null, def: null, ok: null, total: hits });
  } catch (e) { console.error("Edha Content | damaged watch announce failed", e); }
}
Hooks.on("cosmere-rpg.applyDamage", (target, damage) => { try { void edhaDamagedWatchAnnounce(target, damage); } catch (e) {} });

/* Frenzied Tempo moved onto its document 2bY (iron rule 2b): an `edha-test-rider` {mode:
 * advantage, whenAttribute: pre, whenFastTurn, unlessSkills: the five colours} — the generic
 * pre-roll injector applies it; `unlessSkills` is the exclude-list the classification named
 * ("Presence except the leyline casts", which whenSkill's single positive id could not say). */

/* --- The Frenzy/Momentum use dispatch: DELETED 2bY (iron rule 2b) — its last case is gone.
 * Emotional Overload · Reckless Gambit · Reckless Momentum → edha-next-test-mod (07-24/2bQ);
 * Incite → edha-def-test, engine-resolved (07-24p). Do not re-add a switch here.
 * RED's Shatter Focus (the leyline card: a character in range fails a test → it loses 1 focus)
 * → `edha-focus` {op: drain, target: victim} on use — its case here had been DEAD code for the
 * whole tracked history: the CHAOS takeover matched the shared name first, cancelled use(), and
 * routed every use into the Omen-reroll flow, so a pure Red character got "bears no Omen of
 * yours" instead of the card. TWO talents share this name (leyline-red + deity-chaos); each now
 * carries its own rules, which is exactly what rule 2b's name-keying made impossible. The
 * cross-actor focus write lives in edhaDrainFocus (the set-resource relay, folded in 2bY). */

