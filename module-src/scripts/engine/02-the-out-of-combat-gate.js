/* ============================ THE OUT-OF-COMBAT GATE (R-4, TODO #28a) ============================
 * ONE question, asked by every scene/turn-keyed site in the file: **is THIS creature in a combat
 * right now, and which one?**
 *
 * It exists because `game.combat` is not that question's answer and never was. `game.combat` is the
 * CLIENT'S VIEWED combat — whatever encounter this browser has selected in the tracker. It can be
 * null while the owner is mid-fight (nobody has the tracker open on that encounter), and it can be
 * some OTHER table's combat while the owner is in a second one. Both directions had shipped
 * symptoms, and R-4 is the ruling that retires the family (Ben, 2026-09-05, "go with your
 * recommendations"):
 *   - `game.combat === null` out of combat, so every `game.combat?.round ?? 0` round key froze at
 *     **0** — per-round ledgers "reset" only when the scene ends, `once: round` degraded to
 *     once-per-session, and every rule-owner on the scene kept watching everything;
 *   - `game.combat?.started` was false out of combat, so `edhaApplyTimedStatus` never stamped an
 *     `expireAfter` — "Restrained until the end of its next turn" was **immortal**;
 *   - with two combats live, the round/turn a watch read belonged to whichever one this client
 *     happened to be looking at (bench run 27), which is the same clobber family as
 *     `edhaCombatEndGuard` above, seen from the read side instead of the write side.
 *
 * `edhaInActiveCombat(actor)` → the combat this creature is actually a combatant of, or null.
 *
 * THREE deliberate choices, each with a direction:
 *  1. **Scan `game.combats`, never `game.combat`.** The viewed combat is a UI fact; combatant
 *     membership is the game fact. `game.combat` is kept only as a fallback for a world object thin
 *     enough to lack the collection.
 *  2. **`started` OR `active`.** `started` is the engine's existing bar everywhere (round > 0), but a
 *     combat the GM has created and not yet rolled initiative for is, at the table, combat. Accepting
 *     `active` too is the generous direction. Round/turn READS still require `started` — see
 *     `edhaCombatRoundOf` — because an unstarted combat has no round to key on.
 *  3. **Match GENEROUSLY — token id, actor id, or the combatant's resolved actor uuid.** Per the
 *     twin-actor family, an unlinked token and its directory twin share an `id`, so an actor-id match
 *     can over-accept a sibling. That is on purpose. **The fail-safe direction here is "in combat":**
 *     a wrong YES leaves today's behaviour exactly as it is, while a wrong NO SILENCES A LIVE TALENT
 *     — which is 28a's named risk. Every uncertain answer, a throw included, must land on YES/keep.
 *
 * ⚠️ This gate is for scene/turn-keyed watches. A rule that legitimately runs OUT of combat — a
 * self-scoped watch on your own skill roll, a rest/recovery or exploration payload, an out-of-combat
 * status expiry — must NOT be routed through it. See `edhaWatchCombatGate` for the one place that
 * distinction is encoded, and the 2026-09-06 handoff delta for the deliberately-ungated list. */
function edhaInActiveCombat(actor) {
  try {
    if (!actor) return null;
    const tokenId = actor.isToken ? (actor.token?.id ?? null) : null;
    const all = game.combats ? [...game.combats] : (game.combat ? [game.combat] : []);
    for (const c of all) {
      if (!c || (!c.started && !c.active)) continue;
      // BOTH collections: `combatants` is the membership, `turns` the ordered view of the same
      // documents. Foundry populates both; reading either is correct, and reading both is the
      // generous direction this helper is committed to.
      for (const cb of [...(c.combatants ?? []), ...(c.turns ?? [])]) {
        if (!cb) continue;
        if (tokenId && cb.tokenId && cb.tokenId === tokenId) return c;
        if (cb.actorId && actor.id && cb.actorId === actor.id) return c;
        const cu = cb.actor?.uuid;
        if (cu && actor.uuid && cu === actor.uuid) return c;
      }
    }
    return null;
  } catch (e) { return null; }
}
/* The round of the combat this creature is in, or null when it is in none / in one that has not
 * started. `null` is what every round-keyed caller already treats as "no round" — the swap changes
 * WHICH combat answered, not what the answer means. */
function edhaCombatRoundOf(actor) {
  const c = edhaInActiveCombat(actor);
  return c?.started ? (Number(c.round) || 0) : null;
}
/* The turn SEQUENCE of the combat this creature is in, or null. Mirrors `edhaCombatRoundOf` for the
 * once-per-TURN and window helpers, which need the (round, turn) pair rather than the round. */
function edhaTurnSeqOf(actor) {
  const c = edhaInActiveCombat(actor);
  return c?.started ? edhaTurnSeq(c.round, c.turn) : null;
}
/* THE SCENE-SCOPE WATCH GATE — the "every rule-owner on the scene watches everything" and "an
 * adversary's own ability cost is taxed by enemy watches" faces of R-4, in one decision.
 *
 * The line is drawn at `scope`, not at the watched kind, because `scope` is exactly the question
 * "does this rule react to somebody ELSE's event?":
 *   - **`scope: "self"` → NEVER gated.** The watcher IS the subject; there is no cross-talk to
 *     silence, and a self-watch on your own skill roll, token move or die step is a legitimate
 *     out-of-combat rule (the exploration/social half of the tree). Gating these is precisely the
 *     failure 28a is pinned against.
 *   - **`scope: "scene"` → gated** on an active combat containing the WATCHER, plus the subject not
 *     being provably in a DIFFERENT one. All eight scene-scoped rules shipped today are combat
 *     mechanics (three `defeat`, three `focus-change`, one `damaged`, one `turn-start`); none has an
 *     out-of-combat reading.
 *   - **`outOfCombat: true` on the rule → never gated.** The authored opt-out, so a future
 *     scene-scoped rule that DOES work out of combat is one field on the document (iron rule 2b) and
 *     not an engine edit. No rule sets it today.
 *
 * An unknown subject combat ALLOWS the fire (`!sc`): a defeated non-combatant token, or a subject
 * whose actor cannot be resolved, is the uncertain case, and uncertain lands on today's behaviour. */
function edhaWatchCombatGate(h, watcher, subject) {
  try {
    if (h?.outOfCombat === true) return true;
    if (String(h?.scope || "self") !== "scene") return true;
    const wc = edhaInActiveCombat(watcher);
    if (!wc) return false;
    if (!subject) return true;
    const sc = edhaInActiveCombat(subject);
    return !sc || sc === wc;
  } catch (e) { return true; }
}
function edhaCombatantTurnIndex(combat, actor) {
  if (!combat?.turns || !actor) return -1;
  const tokenId = actor.isToken ? actor.token?.id : null;
  return combat.turns.findIndex(c => tokenId ? c.tokenId === tokenId : c.actorId === actor.id);
}
function edhaNextTurnCoord(combat, ti) {
  const R = combat.round ?? 1, T = combat.turn ?? 0;
  return ti > T ? { round: R, turn: ti } : { round: R + 1, turn: ti };   // strictly after now → the creature's next turn
}
