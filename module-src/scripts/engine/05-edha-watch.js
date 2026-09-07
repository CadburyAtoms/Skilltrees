/* ================================================================================================
 * H8 `edha-watch` (07-24q) — THE OBSERVER: react to something ANOTHER document did.
 *
 * WHY THIS HAD TO BE A HANDLER. Neither event system fans out to N observers. The system's own
 * dispatcher resolves ONE document and iterates THAT actor's items; edhaDispatchTestResult (H1)
 * mirrors it and iterates THAT ITEM's rules. So a talent that must react to something a DIFFERENT
 * document did has no way to be told — which is why ~54 talents hand-roll an owner sweep, and why
 * every one of those sweeps is keyed on a talent NAME.
 *
 * TWO fan-outs hide under that one description, and both land here:
 *   · scope "self"  — another ITEM on the SAME actor. Crown of Thorns rides every Black/Red
 *     vs-Cognitive test its owner resolves; Extract Thought rides every Deception roll. Neither is
 *     cross-actor at all; both were impossible only because a rule never sees a sibling item's
 *     event. This is the half the "cross-actor sweep" framing hid, and it is where this pass's
 *     four conversions live.
 *   · scope "scene" — another ACTOR (Dread Presence, the Shield Wall pre-pass, Covenant's proximity
 *     AE). The edhaCharacterOwnersOf(name) family, 44 call sites. ⚑ BUILT BUT UNCONSUMED this pass.
 *
 * The idiom hoisted is edhaDarkVeilSweep's inner loop — tokens → actors → talents → edhaEventRules
 * → match handler.type. It mentions no talent name, which is exactly why it is the one sweep in the
 * engine that rule 2b never objected to.
 *
 * GATE ONLY, like H1, and it dispatches H1's OWN events (edha-test-success / edha-test-fail) onto
 * the WATCHING item — so every payload handler that already works for a gated test works for an
 * observed one, with no new payload vocabulary and no hand-listed payload types. `edha-test-fail`
 * gets its first consumer in the project here (Absolute Authority's consolation Weakened).
 *
 * THE `watch` VOCABULARY (widened 07-24r). The handler, the filters, the memoized index and the
 * payload dispatch never needed to change: a new kind is a schema VALUE plus one
 * edhaDispatchWatchers() call at a hook the engine already owns and already hand-rolled a
 * name-keyed sweep on. Shipped so far:
 *   test          H1's own dispatcher                    (Crown of Thorns, Absolute Authority)
 *   skill-roll    cosmere-rpg.skillRoll                  (Extract Thought)
 *   defeat        the Death live→0 crossing watcher      (Necrotic Cascade; Cold Eyes via
 *                                                         whenOnMyList since 2bZ)    — 07-24r
 *   focus-change  edhaRunFocusWatch + edhaDrainFocus     (the three Black focus passives) — 07-24r
 * Two of those have no `victim` at all, which is what `payloadTarget: "actor"` is for. Queued and
 * measured in audit §9o: damage-applied · turn-start · token-move · attack-declared.
 * ============================================================================================= */

/* PURE (pinned in tests/): does an observed event match this watch rule's filters?
 * Split out from the sweep so the filter logic is testable with no canvas, no actors and no hooks.
 * One `whenSkill` field covers both atlases because leyline colours ARE skill ids — the same
 * reasoning H1's `skill` field is documented with, rather than a second `whenColor` field. */
function edhaWatchMatches(h, ev) {
  if (!h || !ev) return false;
  const list = (s) => String(s ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (String(h.watch || "test") !== String(ev.kind || "")) return false;
  const skills = list(h.whenSkill);
  if (skills.length && !skills.includes(String(ev.skill ?? "").toLowerCase())) return false;
  if (h.whenVs && String(h.whenVs).toLowerCase() !== String(ev.def ?? "").toLowerCase()) return false;
  // Only meaningful when the observed event HAD an outcome. A raw skill roll carries ev.ok === null
  // and must not be filtered out by it — the WATCHER's own result is expressed by which sibling rule
  // you write (edha-test-success / edha-test-fail), the same way a gated test expresses it.
  const out = String(h.whenOutcome || "any");
  if (out !== "any" && typeof ev.ok === "boolean") {
    if (out === "success" && ev.ok !== true) return false;
    if (out === "fail" && ev.ok !== false) return false;
  }
  /* Numeric gate on the observed VALUE (07-24r, the watch-kind widening). The kinds that are not
   * tests carry a NUMBER rather than an outcome — `focus-change` carries the creature's new focus —
   * so Predatory Insight's "when any character reaches 0 focus" is expressed as
   * {whenTotal: "at-most", whenTotalValue: 0} and needs no kind-specific field. Two fields rather
   * than a nullable number because 0 is a MEANINGFUL bound here, so "unset" cannot be spelled 0. */
  const gate = String(h.whenTotal || "any");
  if (gate !== "any") {
    // null/""/undefined must NOT coerce: Number(null) is 0, which would let an event carrying no
    // value at all satisfy "at most 0" — i.e. Predatory Insight firing on every observation whose
    // number the engine could not read. Fails CLOSED, unlike H1's defense read, because a scene-wide
    // passive triggering on a non-fact is the worse of the two failures.
    const bound = Number(h.whenTotalValue) || 0;
    const n = (ev.total === null || ev.total === undefined || ev.total === "") ? NaN : Number(ev.total);
    if (!Number.isFinite(n)) return false;
    if (gate === "at-most" && !(n <= bound)) return false;
    if (gate === "at-least" && !(n >= bound)) return false;
  }
  return true;
}

/* The hoisted sweep. Memoized per handler type: the walk is O(tokens × items × rules) and the
 * applyDamage-cadence consumers (§9c) run it per hit. Every entry point is a DOCUMENT change, so a
 * stale cache is impossible for the data the sweep reads — deliberately NOT invalidated on
 * updateActor, which fires on every HP change and would make the cache useless without making it
 * more correct (rule enable/disable lives on the item, i.e. updateItem). */
let _edhaRuleIndex = new Map();
/* ⚠ IT IS WIRED — the registration is the LOOP on the next line, not a call site, so a grep for
 * `edhaDropRuleIndex(` finds only the definition and reads as dead code. Bench run 14 reported
 * exactly that ("defined at L1939 and called from nowhere; the index never invalidates"), which is
 * wrong: it has been registered on all EIGHT hooks below since the index was introduced (dcd51a7,
 * 2026-07-24), and `_edhaRuleIndex` is a module-level `let` reassigned wholesale, so every reader
 * sees the drop. Do not "fix" this. (The symptom that report was chasing — a freshly imported
 * adversary getting no automation until F5 — is still open and unexplained; it is NOT this.) */
function edhaDropRuleIndex() { _edhaRuleIndex = new Map(); }
for (const h of ["createItem", "updateItem", "deleteItem", "createToken", "deleteToken", "createActor", "deleteActor", "canvasReady"]) Hooks.on(h, edhaDropRuleIndex);

/* Every DISTINCT actor that can currently carry scene-scoped state or a rule: the canvas's token
 * actors, plus the directory actors no token here already represents.
 *
 * ⛑ The two hazards, and why each key ALONE gets one of them wrong (bench run 20, 2026-07-28f):
 *  - An UNLINKED token's synthetic actor and its directory twin are DIFFERENT OBJECTS with the
 *    SAME `id`, and the synthetic one INHERITS the base's flags. So object identity keeps both —
 *    `edhaSutureCradleCheck` used `holders.includes(tok.actor)` and fired twice, 75 ms apart, from
 *    one user, doubling a Discipline roll that decides whether the cradle ends. `uuid` keeps both
 *    too: they read `Scene.x.Token.y.Actor.z` vs `Actor.z`.
 *  - But two unlinked tokens stamped from ONE prototype SHARE that `id`, so keying on `id` alone
 *    would collapse three distinct combatants into one — the opposite bug, and a worse one.
 * So: dedupe the canvas pass by `uuid` (distinct tokens stay distinct; one linked actor's two
 * tokens collapse), then admit a directory actor only when no canvas token already IS it — by
 * `id`. An off-canvas actor is still included: "parked in the sidebar" is a real holder (07-28d).
 *
 * `directoryFilter` narrows the second pass only (watchers want characters; scene state wants
 * everyone). Reach for this instead of hand-rolling the canvas+directory union — six other sites
 * roll their own, all write-idempotent, listed in ENGINE_INDEX's ⛑ twin-actor family. */
function edhaSceneActors({ directoryFilter = null } = {}) {
  const out = [], seenUuid = new Set(), canvasIds = new Set();
  for (const tok of (canvas?.tokens?.placeables ?? [])) {
    const a = tok?.actor; if (!a) continue;
    const k = a.uuid ?? a.id; if (!k || seenUuid.has(k)) continue;
    seenUuid.add(k); if (a.id) canvasIds.add(a.id);
    out.push(a);
  }
  for (const a of (game.actors ?? [])) {
    if (!a || (directoryFilter && !directoryFilter(a))) continue;
    if (a.id && canvasIds.has(a.id)) continue;   // a token on this scene already IS this actor
    const k = a.uuid ?? a.id; if (!k || seenUuid.has(k)) continue;
    seenUuid.add(k); out.push(a);
  }
  return out;
}
// Every actor that can currently carry a rule: canvas tokens (unlinked adversaries live ONLY here —
// the W29 lesson) plus every character in the directory (off-canvas owners still observe).
function edhaWatchActors() { return edhaSceneActors({ directoryFilter: (a) => a.type === "character" }); }

/* ⛑ THE CROSS-COMBAT CLOBBER GUARD (bench run 23, 2026-07-28) — build one per sweep, then test
 * each actor before you write to it.
 *
 * THE DEFECT CLASS. `deleteCombat` and `combatTurnChange` are per-COMBAT events, but ~20 of the
 * engine's scene-reset sweeps ignore the combat they are handed and iterate the WORLD
 * (`game.actors`, `canvas.tokens.placeables`, `game.scenes`). With exactly one combat in play —
 * the case every one of them was written for — that is correct and stays correct. With TWO, the
 * end of one encounter reaches into the other and deletes live state: run 23 measured deleting a
 * bench combat clearing `lists.covenants` off an actor in Ben's still-running combat, and runs
 * 19/20 measured a bench combat's turn change stamping `trigRound` onto his campaign actors.
 * That is player data, and it is destroyed silently.
 *
 * WHY THIS SHAPE AND NOT "SWEEP ONLY THIS COMBAT'S COMBATANTS". Because the wide enumeration is
 * DELIBERATE and is pinned: `tempHp` is swept across canvas token actors AND the directory on
 * purpose (L1845's note — the grant lands on adversaries, summons and unlinked token actors that
 * are frequently not combatants), and `tests/temphp-scene-reset.test.js` asserts exactly that for
 * a token-only actor. Narrowing to `combat.combatants` would break intended behaviour and that
 * test. The invariant that is actually wanted is narrower and costs nothing:
 *
 *      ending combat A must not clear state on an actor that is a combatant in a
 *      different, still-existing combat B.
 *
 * Single-combat play is therefore byte-identical to before; only the cross-combat case changes.
 *
 * FAIL-SAFE DIRECTION, stated. A wrong SKIP leaves stale state (recoverable — the next scene reset
 * or the reset-triggers macro clears it). A wrong CLEAR destroys another table's live encounter.
 * So every ambiguity resolves toward skipping: any other combat that still exists counts, started
 * or not, and matching is by `id` OR `uuid`. Per the twin-actor note above, two unlinked tokens
 * stamped from one prototype share an `id` — so a sibling token of a real combatant is also
 * skipped. That is over-skipping, which is the safe side, and it is why `uuid` is checked too. */
function edhaCombatEndGuard(endedCombat) {
  const keys = new Set();
  try {
    const endedId = endedCombat?.id ?? null;
    for (const c of (game.combats ?? [])) {
      if (!c || (endedId && c.id === endedId)) continue;   // the combat that just ended is not "elsewhere"
      for (const cbt of (c.combatants ?? [])) {
        if (cbt?.actorId) keys.add(cbt.actorId);
        try { const u = cbt?.actor?.uuid; if (u) keys.add(u); } catch (e) { /* synthetic actor may not resolve */ }
      }
    }
  } catch (e) { /* no combats collection (out of combat, or a headless load) → guard is empty */ }
  return keys;
}
/* Is an `edha-content` flag key actually SET on this actor? Dotted keys included ("lists.omens",
 * "markedBy.insight") — `Document#getFlag` resolves those through `foundry.utils.getProperty`, and
 * returns `undefined` when the whole scope is absent. PURE apart from the read, so the skip-absent
 * contract is pinned without Foundry (tests/scene-reset-reentry.test.js).
 * FAIL-SAFE DIRECTION, stated: every uncertain answer is TRUE — no readable `getFlag`, or a throw —
 * so the write still happens and the worst case is the old behaviour, never stale state left behind.
 * A stored `null` / `false` / `0` is PRESENT and must still be cleared; only `undefined` is absent. */
function edhaFlagKeyPresent(actor, key) {
  if (typeof actor?.getFlag !== "function") return true;
  try { return actor.getFlag("edha-content", key) !== undefined; }
  catch (e) { return true; }
}
// True when this actor is still fighting in ANOTHER combat, so this combat's reset must leave it alone.
function edhaStillFightingElsewhere(actor, guard) {
  if (!actor || !guard || !guard.size) return false;
  try { return (actor.id && guard.has(actor.id)) || (actor.uuid && guard.has(actor.uuid)); }
  catch (e) { return false; }
}

/* R-60 (hygiene campaign 2026-08-10): the ONE scene-reset population + applier every deleteCombat
 * clear now shares, replacing ten hand-rolled sweeps that answered "who gets reset" FIVE different
 * ways — Sovereignty swept canvas tokens ONLY (an off-scene character kept `dieStep` forever), Life
 * alone reached every directory actor including adversaries/summons, and only Chaos deduped a token
 * actor against its own directory entry (the rest could double-visit the same actor harmlessly, but
 * still inconsistently). The population is `edhaSceneActors()` — directory ∪ canvas tokens, deduped
 * by uuid/id, the SAME primitive `edhaWatchActors` already reaches for instead of hand-rolling the
 * union (see its comment above) — so Chaos's pattern is now everyone's pattern. Each family keeps
 * its OWN flag/status lists, UNCHANGED by this pass; only WHO they reach moves, which is the whole
 * point (Sovereignty's off-scene actor now resets; Life's population widens to match the other
 * nine instead of staying the one outlier). `edhaStillFightingElsewhere` (R-58) still applies per
 * actor, and every step — each flag unset, each status clear, the bespoke `extra` — is its own
 * try/catch so one actor's rejection (Chaos's proven shape: a concurrent sweep already deleted the
 * AE `toggleStatusEffect` is trying to touch) never starves the rest of the sweep.
 * `key` generalizes Life's `_edhaLifeClearBusy` (07-27b: two combats ending back-to-back could
 * overlap the SAME family's sweep mid-actor, double-creating Apex Form's ended-injury) into one
 * shared busy-set entry per family per ended combat, instead of a bespoke module-level boolean only
 * Life had.
 *
 * ⛑ THE COMBAT ID IN THAT BUSY KEY IS WHY THE GUARD GOT WEAKER, NOT STRONGER (bench run 24,
 * 2026-09-05 — 07-27b's bug, live again). `${key}:${endedCombat.id}` means two DIFFERENT combats
 * never collide in the set, and TWO combats ending together is the exact case the guard exists for:
 * one `apexForm` flag, two sweeps, TWO "🌟 Apex Form ends — takes an injury" cards and TWO injury
 * Items. The boolean it replaced could not miss this; the scoped key can, and does. Unset-first /
 * create-after does not save it either — `unsetFlag` awaits a server round-trip, and the second
 * sweep reads the flag inside that window.
 *
 * So there are now TWO fences, and they answer different questions:
 *   • `_edhaSceneResetBusy` — "is this family already sweeping FOR THIS COMBAT?" Drops a duplicate
 *     hook for one combat. Combat-scoped on purpose: a SECOND combat's sweep must still run, or its
 *     actors (skipped by `edhaStillFightingElsewhere` while that combat existed) keep their state
 *     for ever.
 *   • `_edhaSceneResetActorBusy` — "is this family already mid-sweep ON THIS ACTOR?", `key:uuid`,
 *     ACROSS combats. This is the one that stops the double-create. The check-and-claim is
 *     synchronous with no `await` between, so it is atomic on JS's single thread; the loser skips
 *     the actor entirely (every step is idempotent and the winner is doing exactly the same work),
 *     and the claim releases only once the winner's `extra` has settled — by which time the flag
 *     the second sweep would have re-read is gone.
 * Both are per-client Sets; the ONE-applier half is `edhaDefBuffGmGate` above, unchanged (07-27b's
 * other half was two GM clients, one applier each).
 *
 * ⛑ AN UNSET OF AN ABSENT FLAG IS NOT FREE — IT IS A FULL DOCUMENT UPDATE (bench run 24). Every
 * `Document#unsetFlag` ends in `this.update({[`flags.<scope>.<head>.-=<tail>`]: null})` whether or
 * not the key is there, so R-60's directory∪canvas population turned one combat end into ~40 flag
 * writes × EVERY ACTOR IN THE WORLD. Measured on a 51-actor world: it left an empty `lists: {}` and
 * `markedBy: {}` on 33 actors that had NEITHER (a dotted `-=` delete creates its parent object on
 * the way past — that is `flags.edha-content.lists.-=omens` expanding), `Tem parinaem` and
 * `Soggy Bottom` included, and the volume tripped Foundry's own socket limiter — *"Exceeded maximum
 * number of update-actor events in a short period of time. Aborting event execution."* — which then
 * silently swallowed an UNRELATED talent use for the rest of that window. Silent, on a hook nobody
 * is watching, on other people's actors.
 * The fix is the guard the STATUS loop has always had, one line down: test before you write. Flags
 * now gate on `edhaFlagKeyPresent`, so an actor carrying none of a family's keys costs ZERO updates
 * and the only actors written are the ones that actually hold state. A stored `null`/`false`/`0` is
 * still present and still cleared; only genuinely-absent keys are skipped, so no sweep's outcome
 * changes. (Batching a family's keys into ONE `a.update()` per actor was considered and NOT taken:
 * it would trade the per-key try/catch — the isolation that keeps one rejecting write from starving
 * the rest — for a marginal saving on the handful of actors that are left after this gate.) */
const _edhaSceneResetBusy = new Set();
const _edhaSceneResetActorBusy = new Set();
async function edhaSceneReset(endedCombat, { flags = [], statuses = [], extra = null, key = "" } = {}) {
  if (!edhaDefBuffGmGate()) return;
  const fam = key || "?";
  const busyKey = `${fam}:${endedCombat?.id ?? "?"}`;
  if (_edhaSceneResetBusy.has(busyKey)) return;
  _edhaSceneResetBusy.add(busyKey);
  try {
    const guard = edhaCombatEndGuard(endedCombat);   // ⛑ cross-combat clobber guard (R-58)
    for (const a of edhaSceneActors()) {
      if (edhaStillFightingElsewhere(a, guard)) continue;
      // ⛑ per-actor claim, ACROSS combats — see the note above. No `await` between has() and add().
      const claim = `${fam}:${a?.uuid ?? a?.id ?? ""}`;
      if (_edhaSceneResetActorBusy.has(claim)) continue;
      _edhaSceneResetActorBusy.add(claim);
      try {
        for (const fkey of flags) {
          if (!edhaFlagKeyPresent(a, fkey)) continue;   // ⛑ absent → skip; unsetFlag ALWAYS writes (see above)
          try { await a.unsetFlag("edha-content", fkey); }
          catch (e) { console.warn(`Edha Content | scene reset (${fam}): unset ${fkey} failed on ${a?.name ?? "?"}`, e); }
        }
        for (const st of statuses) {
          try { if (a.statuses?.has?.(st)) await a.toggleStatusEffect?.(st, { active: false }); }
          catch (e) { console.warn(`Edha Content | scene reset (${fam}): status ${st} clear failed on ${a?.name ?? "?"}`, e); }
        }
        try { await extra?.(a); }
        catch (e) { console.warn(`Edha Content | scene reset (${fam}): extra step failed on ${a?.name ?? "?"}`, e); }
      } finally { _edhaSceneResetActorBusy.delete(claim); }
    }
  } catch (e) { console.error(`Edha Content | scene reset (${fam}) failed`, e); }
  finally { _edhaSceneResetBusy.delete(busyKey); }
}

/* ⛑ A CLICK HANDLER'S OUTER CATCH IS NEVER "non-fatal" (bench run 23, 2026-07-28).
 * Reaching it means the user pressed a button and the thing the button promises did not happen.
 * Every one of the 33 chat-card handlers used to end in a bare `console.error`, which at the table
 * is indistinguishable from a no-op: Living Image's "Pay N Investiture" button was read as
 * "charges nothing, for any user, ever" across FOUR bench runs while a TypeError was being
 * swallowed here on every single click. The console line was there the whole time and nobody was
 * looking at the console. So: log for the trace AND raise, so the next one announces itself in the
 * moment it happens. Deliberately NOT applied to the ~270 inner defensive catches — those guard
 * optional work (a missing permission, an absent flag) and are legitimately non-fatal. */
function edhaClickFailed(what, e) {
  try { console.error(`Edha Content | ${what} failed`, e); } catch (_) {}
  try { ui.notifications?.error(`Edha: ${what} failed — ${e?.message || e}. Details in the console (F12).`); } catch (_) {}
}
/* --- edhaSceneOnceUsed / edhaStampSceneOnce (ENGINE PASS 5.3, Job 7; R-61) — ONE oncePerScene GATE
 * READ + ONE STAMP WRITE. The same idea ("has this rule already fired this scene?") was checked four
 * ways: `h.oncePerScene &&` (default-OFF — the gate only applies when the rule opts in),
 * `h.oncePerScene !== false` (default-ON — applies unless the rule opts out), `h.oncePerScene ===
 * true` (STRICT — only a literal `true` gates), plus a whole separate `detonateUsed.<id>` flag
 * namespace or the detonate-list family, with its own scene-clear. No live behavior changes here:
 * every call site keeps its OWN polarity expression on `h.oncePerScene` (that decision is caller
 * logic, not this helper's job) and just swaps its flag READ for `edhaSceneOnceUsed`, which checks
 * BOTH `sceneOnce.<id>` and the legacy `detonateUsed.<id>` — a scene already mid-flight when this
 * shipped keeps working. `edhaStampSceneOnce` writes ONLY `sceneOnce.<id>` from here on;
 * `detonateUsed.*` becomes a read-only legacy fallback, same shape as the terrain-ownership flat-key
 * precedent (07-27s). One real fix rides along: `edha-decree` stamped UNCONDITIONALLY while its OWN
 * veto gated on `h.oncePerScene !== false` — the stamp now takes the SAME polarity as its veto
 * (visible change, 🤖 bench row: a Decree authored with `oncePerScene: false` used to still burn a
 * scene-stamp nothing could ever read; now it stamps nothing, matching its veto exactly). */
function edhaSceneOnceUsed(actor, item) {
  return !!(actor?.getFlag?.("edha-content", `sceneOnce.${item.id}`) || actor?.getFlag?.("edha-content", `detonateUsed.${item.id}`));
}
async function edhaStampSceneOnce(actor, item) {
  try { await actor.setFlag("edha-content", `sceneOnce.${item.id}`, true); } catch (e) {}
}
function edhaWatchersOfRule(type) {
  const hit = _edhaRuleIndex.get(type);
  if (hit) return hit;
  const out = [];
  try {
    for (const actor of edhaWatchActors()) {
      for (const { item: tal, handler } of edhaActorRulesOf(actor, type)) out.push({ actor, item: tal, handler });
    }
  } catch (e) { console.error("Edha Content | rule sweep failed", e); }
  _edhaRuleIndex.set(type, out);
  return out;
}

/* Per-round / per-round-per-target budget. MUTATES on check, so it is called LAST — after every
 * other filter has passed — or a rejected watcher would burn the budget for the one that fires.
 * Outside combat game.combat is null and round 0 is used, so "once per round" degrades to
 * once-until-the-encounter-ends rather than firing every time; that is the safer direction. */
const _edhaWatchBudget = new Map();
function edhaWatchBudgetGate(h, item, victim) {
  const per = String(h.once || "no");
  if (per === "no") return true;
  // R-4/#28a: the round of the RULE OWNER's own combat. Out of combat this is still 0 (the safer
  // degradation the comment above describes, unchanged); what it no longer does is key a budget on
  // whichever encounter this client happened to be viewing.
  const round = edhaCombatRoundOf(item?.actor ?? item?.parent ?? null) ?? 0;
  const key = per === "round" ? `${item?.uuid}|*|${round}` : `${item?.uuid}|${victim?.uuid ?? "?"}|${round}`;
  if (_edhaWatchBudget.has(key)) return false;
  _edhaWatchBudget.set(key, true);
  return true;
}
Hooks.on("deleteCombat", () => _edhaWatchBudget.clear());
Hooks.on("createCombat", () => _edhaWatchBudget.clear());

/* Fan one observed event out to every talent watching for it.
 * ev = { kind, owner, victim, skill, def, ok, total, chainBounded? }
 *   owner  = the SUBJECT — the actor whose test/roll/defeat/focus-change this was
 *   victim = the creature it resolved against (test kinds only; null for the subject-only kinds)
 *   skill  = the skill/colour id rolled               def    = the defense id it was tested against
 *   total  = the observed NUMBER — a roll total for the test kinds, the new focus for focus-change
 *   chainBounded = set by an ANNOUNCE SITE whose event kind is structurally non-repeating (defeat:
 *            the live→0 crossing fires once per creature) — see edhaWatchEntryLevel below
 *
 * RE-ENTRANCY (widened 07-24r). A watcher's own payload must not normally be observed by the next
 * watcher — Crown of Thorns' spirit damage would cascade — so the sweep runs under a depth guard.
 * A boolean was not enough once `focus-change` landed: Whispered Doubt's extra focus loss taking a
 * creature to 0 is a REAL second focus-change that Predatory Insight must see, and the hand-rolled
 * code said so (it re-ran the zero check by hand — the 07-05 test-pass lesson). So the guard is a
 * DEPTH counter and rules opt in with `chain`. Default off preserves pass H's behaviour exactly. */

/* PURE (pinned in tests/watch-dispatch.test.js): may a dispatch enter, and at what causal LEVEL?
 * `openCount` = how many dispatches are currently OPEN (running or suspended mid-await). It
 * approximates causal depth for sequential flows but OVER-counts when SIBLING events from one
 * payload overlap — bench run 5's harvest DISPATCH loss: one Necrotic Cascade tick dropped V1+V2;
 * V1's chain-level dispatch was still awaiting its (queued) ledger write when V2's updateActor
 * hook fired, so V2's dispatch read "2 open" as its own ancestry and was dropped at the door — no
 * ✨ card, no ledger entry, no eviction, with ZERO cap pressure (the cap-isolation control).
 * `chainBounded` is the discriminator: an event kind whose recurrence is STRUCTURALLY bounded
 * (defeat — a creature crosses live→0 at most once per drop, so a defeat chain can never loop)
 * CLAMPS to chain level (2) instead of being dropped, which is always safe and always right for
 * the 2nd+ simultaneous nested kill. Unbounded kinds (focus-change ping-pong) keep the hard
 * drop — that backstop is what ends their loops. Behaviour at openCount 0/1 is unchanged. */
function edhaWatchEntryLevel(openCount, chainBounded) {
  const open = Math.max(0, Number(openCount) || 0);
  if (open >= 2 && chainBounded !== true) return null;   // dropped — the unbounded-cascade backstop
  return Math.min(open + 1, 2);                          // 1 = top-level (all rules) · 2 = chain-only
}
let _edhaWatchDepth = 0;   // count of OPEN dispatches — a COUNT, not this dispatch's level (see above)
async function edhaDispatchWatchers(ev) {
  if (!ev?.owner) return 0;
  const depth = edhaWatchEntryLevel(_edhaWatchDepth, ev.chainBounded === true);
  if (depth === null) return 0;   // depth 2 is the backstop, not the feature
  const watchers = edhaWatchersOfRule("edha-watch");
  if (!watchers.length) return 0;
  let fired = 0;
  _edhaWatchDepth++;
  try {
    for (const w of watchers) {
      try {
        const h = w.handler;
        /* THIS dispatch's LOCAL level, never the shared counter — a sibling dispatch entering
         * mid-loop mutates the counter, and reading it here would wrongly chain-gate the REST of
         * a top-level dispatch's watchers (07-27b, the same bench interleaving). */
        if (depth > 1 && h.chain !== true) continue;   // caused by (or concurrent with) another watcher: opt-in only
        const scope = String(h.scope || "self");
        if (scope === "self" && w.actor !== ev.owner) continue;
        if (scope === "scene" && w.actor === ev.owner && h.includeSelf === false) continue;
        // R-4/#28a — the out-of-combat gate. Scene-scoped only; a self-scoped watch is never gated.
        if (!edhaWatchCombatGate(h, w.actor, ev.owner)) continue;
        if (!edhaWatchMatches(h, ev)) continue;
        if (h.requireSelfStatus && !w.actor?.statuses?.has?.(h.requireSelfStatus)) continue;
        if (h.requireTargetStatus && !ev.victim?.statuses?.has?.(h.requireTargetStatus)) continue;
        /* Own-ledger gate (2bZ — Cold Eyes): the observed SUBJECT must sit on the WATCHER's ledger.
         * Reads the same subject the payload will act on, so a defeat kind gates on the creature
         * that dropped. Lives here, not in edhaWatchMatches — list membership needs the watcher. */
        if (h.whenOnMyList) {
          const lkey = String(h.whenOnMyList).trim();
          const lst = String(h.whenOnMyListStatus || lkey).trim();
          const lsub = String(h.payloadTarget || "victim") === "actor" ? ev.owner : ev.victim;
          if (!lkey || !lsub?.uuid || !edhaOwnerList(w.actor, lkey, lst).some((e) => e.uuid === lsub.uuid)) continue;
        }

        // scope "scene": where the WATCHER stands relative to the actor who acted.
        if (scope === "scene") {
          const otok = edhaCasterToken(ev.owner), wtok = edhaCasterToken(w.actor);
          const disp = String(h.disposition || "any");
          if (disp !== "any") {
            const od = otok?.document?.disposition, wd = wtok?.document?.disposition;
            if (disp === "enemy" && !edhaSideHostile(od, wd)) continue;   // R-63: an unresolvable side matches NEITHER filter
            if (disp === "ally" && !edhaSideSame(od, wd)) continue;
          }
          // Both tokens are REQUIRED once a range gate is set (07-24r): "within your Attunement
          // Range" is unanswerable when one side is not on the map, and edhaDeathInRange fails OPEN
          // on a missing owner token — which would have let an off-canvas armed owner cascade.
          if (h.rangeColor && (!otok || !wtok || !edhaDeathInRange(w.actor, otok, h.rangeColor))) continue;
          const ft = Number(h.rangeFt) || 0;
          if (ft > 0 && (!wtok || !otok || !edhaTokensWithin(wtok, ft).some((t) => t.id === otok.id))) continue;
        }

        // The watcher's OWN comparison, reusing H1's pinned decision helper. vs "none" = no test at
        // all: the observation itself IS the trigger (Crown of Thorns fires on success or failure).
        let ok = true, dc = null;
        const vs = String(h.vs || "none");
        if (vs !== "none" && !ev.victim) continue;   // you cannot test against nobody (Extract Thought with no target)
        if (vs !== "none") {
          const total = Number(ev.total) || 0;
          let defValue = null, oppRoll = null;
          if (vs === "defense") defValue = ev.victim ? edhaReadDefense(ev.victim, h.def || "cog") : null;
          else if (vs === "skill") oppRoll = ev.victim ? await edhaRollOpposedSkill(ev.victim, h.targetSkill) : null;
          const res = edhaDefTestOutcome(total, { vs, dc: Number(h.dc) || 0, defValue, oppRoll });
          ok = res.ok; dc = res.dc;
        }
        /* WHO THE PAYLOAD ACTS ON (07-24r). A test has two parties and the payload wants the one the
         * test resolved AGAINST (Crown of Thorns damages Kneel's target). The subject-only kinds have
         * exactly one party and the payload wants IT — the creature that dropped, the creature that
         * lost focus — so `payloadTarget: "actor"` binds to ev.owner instead. It also decides the
         * per-target budget key, or Whispered Doubt's "once per round per enemy" would degrade to
         * once per round for want of a victim. */
        const subject = String(h.payloadTarget || "victim") === "actor" ? ev.owner : (ev.victim ?? null);
        /* arm-per-target (2bU): once per creature for the LIFETIME of the arming status. The ledger
         * is a flag (survives an F5 mid-combat, matching the retired hand-rolled hit set) keyed on
         * the arming STATUS and cleared when it drops (the deleteActiveEffect sweep). Meaningless
         * without requireSelfStatus, so it skips rather than degrading to always-fire. */
        if (String(h.once || "no") === "arm-per-target") {
          const armSt = String(h.requireSelfStatus || "").trim();
          if (!armSt || !subject?.uuid) continue;
          const done = w.actor.getFlag?.("edha-content", `armOnce.${armSt}`) ?? [];
          if (done.includes(subject.uuid)) continue;
          try { await w.actor.setFlag("edha-content", `armOnce.${armSt}`, [...done, subject.uuid]); } catch (e) { continue; }
        } else if (!edhaWatchBudgetGate(h, w.item, subject)) continue;   // LAST — it spends the budget

        fired += await edhaDispatchTestResult(w.actor, w.item, subject, ok, { total: ev.total ?? null, dc, watched: ev.kind });
        if (h.note) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: w.actor }),
          content: `<p>👁️ <strong>${w.item.name}</strong>: ${h.note}</p>` });
      } catch (e) { console.error(`Edha Content | watcher ${w?.item?.name} failed`, e); }
    }
  } finally { _edhaWatchDepth = Math.max(0, _edhaWatchDepth - 1); }
  return fired;
}

/* The SKILL-ROLL surface. Extract Thought rides every Deception test its owner makes — an event no
 * on-use handler can express (pass F recorded it as "wrong SHAPE, not a missing payload"). Runs on
 * the ROLLING client so game.user.targets is local, exactly as the hand-rolled watcher did. */
function edhaWatchSkillRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    const skill = roll?.data?.skill?.id; if (!skill) return;
    const victim = edhaUserTargetActor();
    if (victim === actor) return;
    void edhaDispatchWatchers({ kind: "skill-roll", owner: actor, victim, skill, def: null, ok: null, total: Number(roll.total) || 0 });
  } catch (e) { console.error("Edha Content | skill-roll watch failed", e); }
}
Hooks.on("cosmere-rpg.skillRoll", edhaWatchSkillRoll);

/* H12's pre-cost veto (07-24s). The hand-rolled Cascading Failure and The Unmooring both checked
 * "are there any Charges?" and "have I used this already?" BEFORE `edhaConsumeCost`, so a mistaken
 * click cost nothing. A handler executor runs on `use`, i.e. after the system has already charged
 * the Investiture — so the guarantee has to move here, exactly as H1's did. Keyed on the rule being
 * present, never on a talent name. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-detonate-list"); if (!h) return;
    if (h.oncePerScene && edhaSceneOnceUsed(actor, item)) {
      ui.notifications?.warn(`Edha: ${item.name} is once per scene — nothing spent.`);
      return false;
    }
    if (h.requireNonEmpty !== false) {
      const list = (h.source || "charges") === "charges" ? edhaGetCharges(actor) : [];
      if (!list.length) {
        ui.notifications?.warn(`Edha: ${item.name} — no active markers to detonate (nothing spent).`);
        return false;
      }
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* H3's pre-cost VETO (07-24u). An executor runs AFTER the system has charged the cost, so every gate
 * a hand-rolled takeover checked before `edhaConsumeCost` has to move here or the "nothing spent"
 * guarantee is lost — the same move H1 and H12 both made.
 *
 * Deliberately restricted to `op: place` with `target: "prompt"`, which is the ONLY case where H3
 * owns the gate: a `victim` rule sits on edha-test-success, where H1's veto has already vetted the
 * target, and `self` has nothing to check. That restriction is also what makes this provably inert
 * for the three shipped Chaos consumers — all of them are `target: "victim"`. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-owner-list");
    if (!h) return;
    // ANNOTATE (2bV): "no un-flagged entry" is a pre-cost refusal — Sealed Edict's "no unsealed
    // Edict to notarize. Nothing spent." The executor's return false is only the belt.
    if ((h.op || "place") === "annotate") {
      const key = String(h.list || "").trim(); if (!key) return;
      const st = String(h.status || key).trim();
      const field = String(h.annotateField || "sealed").trim() || "sealed";
      if (!edhaOwnerList(actor, key, st).some(e => e && !e[field])) {
        ui.notifications?.warn(`Edha: no ${edhaConditionLabel(st) || st} left to mark ${field} — nothing spent.`);
        return false;
      }
      return;
    }
    // SPEND (2bW): "needs a <marker>" is a pre-cost refusal — freebie-aware, so an unspent
    // scene-start freebie satisfies the gate exactly as the flat Remains accessor did.
    if ((h.op || "place") === "spend") {
      if (!h.requireNonEmpty) return;
      const key = String(h.list || "").trim(); if (!key) return;
      const st = String(h.status || key).trim();
      if (!edhaOwnerListAvail(actor, key, st).length) {
        ui.notifications?.warn(`Edha: ${item.name} needs a ${edhaConditionLabel(st) || st} — nothing spent.`);
        return false;
      }
      return;
    }
    if ((h.op || "place") !== "place" || (h.target || "victim") !== "prompt") return;
    const ttok = edhaUserTargetToken();
    if (!ttok?.actor) {
      ui.notifications?.warn(`Edha: ${item.name} — target the creature first (nothing spent).`);
      return false;
    }
    // A prohibition binds ANOTHER creature — self-target refuses pre-cost (Order's Edict).
    if (h.prohibition === true && ttok.actor === actor) {
      ui.notifications?.warn(`Edha: ${item.name} — target a creature other than yourself. Nothing spent.`);
      return false;
    }
    // Counter mode (H3b, 07-25): a counter never sits on its own owner, and the placement range
    // gate is pre-cost like every other Edha veto (Studied Mark: Green range, nothing spent).
    if ((h.mode || "list") === "counter" && ttok.actor === actor) {
      ui.notifications?.warn(`Edha: ${item.name} — target a creature other than yourself. Nothing spent.`);
      return false;
    }
    if (h.rangeColor && !edhaDeathInRange(actor, ttok, h.rangeColor)) {
      ui.notifications?.warn(`Edha: ${ttok.actor.name} is outside your Attunement Range (${String(h.rangeColor)[0].toUpperCase()}${String(h.rangeColor).slice(1)}). Nothing spent.`);
      return false;
    }
    if ((h.mode || "list") === "counter") return;   // the duplicate/cap gates below are list-shape only
    const otok = edhaCasterToken(actor);
    if (h.requireDisposition) {
      // R-63: Number.isFinite fail-closed (was `?? 1` on both sides) — 🤖 bench row.
      const td = ttok.document?.disposition, od = otok?.document?.disposition;
      const dispKnown = Number.isFinite(td) && Number.isFinite(od);
      const same = dispKnown && td === od;
      if (!otok || !dispKnown || same !== (h.requireDisposition === "ally")) {
        ui.notifications?.warn(`Edha: ${ttok.actor.name} is not ${h.requireDisposition === "ally" ? "an ally" : "an enemy"} — nothing spent.`);
        return false;
      }
    }
    if (h.requireAdjacent && (!otok || !edhaAdjacent(otok, ttok))) {
      ui.notifications?.warn(`Edha: ${item.name} requires touch — move adjacent to ${ttok.actor.name} first. Nothing spent.`);
      return false;
    }
    const key = String(h.list || "").trim(); if (!key) return;
    const status = String(h.status || key).trim();
    const cur = edhaOwnerList(actor, key, status);
    if (h.allowDuplicates !== true && cur.some(e => e.uuid === ttok.actor.uuid)) {
      ui.notifications?.warn(`Edha: ${ttok.actor.name} already bears your ${edhaConditionLabel(status) || status} — nothing spent.`);
      return false;
    }
    if ((h.evict || "oldest") === "refuse" && cur.length >= edhaListCap(actor, h.capFormula)) {
      ui.notifications?.warn(`Edha: you are at your cap of ${edhaListCap(actor, h.capFormula)} — nothing spent.`);
      return false;
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* The multi-target triggered-effect pre-cost VETO (2bU): a use-event rule with Max targets set
 * refuses when NONE of your current targets passes its filters — Investiture of Command's "nothing
 * spent" guarantee, moved out of its retired takeover. Same filters as the executor, by calling
 * the same resolver. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const rule = edhaEventRules(item).find(r => r?.event === "use" && r?.handler?.type === "edha-triggered-effect" && (Number(r.handler.maxTargets) || 0) > 0);
    if (!rule) return;
    const found = edhaEffectTargets(actor, edhaTrigSpecFromCfg(rule.handler).effect, {});
    if (!found.length) {
      ui.notifications?.warn(`Edha: ${item.name} — target up to ${rule.handler.maxTargets} valid creature(s)${rule.handler.rangeColor ? ` in your Attunement Range (${rule.handler.rangeColor})` : ""} first. Nothing spent.`);
      return false;
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-summon`'s SUSTAIN-CAP pre-cost veto (07-24y, H15). It has to be a preUseItem gate and not
 * executor logic, because a handler's executor runs on `use` — i.e. AFTER the system has already
 * charged the cost — and both talents this replaces refuse pre-cost by design ("nothing spent").
 * That is the same reason H1 / H3 / H12 / edha-next-test-mod all carry one of these, and it is why
 * H15 was never really "two schema fields".
 *
 * `replaceOldest` dismisses down to cap-1 so the incoming summon lands at exactly the cap; the
 * dismissal is the step that can REFUSE (it needs a GM to delete another client's actor), so it
 * runs before anything is spent — the 07-24v ordering lesson. A cap with no `replaceOldest` simply
 * refuses. Blank `sustainCap` = uncapped, which is every summon rule authored before today. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-summon"); if (!h) return;
    const capF = String(h.sustainCap || "").trim(); if (!capF) return;   // uncapped — today's default
    const cap = edhaListCap(actor, capF);
    const live = edhaOwnedSummons(actor, item.name, h.summonName);
    if (live.length < cap) return;                                       // room to spare
    if (!h.replaceOldest) {
      ui.notifications?.warn(`Edha: ${actor.name} already sustains ${live.length} ${h.summonName || item.name}(s) — cap ${cap}. Nothing spent.`);
      return false;
    }
    const doomed = live.slice(0, live.length - cap + 1);                 // make room for exactly one
    if (game.user?.isGM) for (const d of doomed) void edhaCivDismantleGM(d.id);
    else if (game.users?.activeGM) for (const d of doomed) game.socket.emit("module.edha-content", { action: "civ-dismantle", payload: { actorId: d.id } });
    else { ui.notifications?.warn(`Edha: a GM must be online to dismiss the old ${h.summonName || item.name}. Nothing spent.`); return false; }
    ui.notifications?.info(`Edha: ${actor.name}'s ${doomed.map(d => d.name).join(", ")} dismissed — resummoning (cap ${cap}).`);
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-next-test-mod`'s pre-cost VETO (07-24x). Decisive Command costs a focus and Pack Hunting costs
 * a focus and a Reaction, so a refusal after the executor runs burns both — the same reason H1, H12
 * and H3 all have one of these. Only gates what the rule DECLARES: a range, or a required quarry.
 * Restricted to `target: "target"` (the only mode that reads your current targets) plus the quarry
 * check, which is owner-side and applies whatever the target mode is. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-next-test-mod"); if (!h) return;
    if (h.requireQuarry && !edhaQuarryOf(actor)) {
      ui.notifications?.warn(`Edha: ${item.name} — you have no quarry (nothing spent).`);
      return false;
    }
    if ((h.target || "target") !== "target") return;
    const dbl = h.doubleIfOwns && edhaOwnsTalent(actor, String(h.doubleIfOwns).trim()) ? 2 : 1;
    const rangeFt = Math.max(0, (Number(h.rangeFt) || 0) * dbl);
    if (!rangeFt) return;
    const otok = edhaCasterToken(actor);
    const inRange = otok ? edhaTokensWithin(otok, rangeFt) : [];
    const ok = edhaUserTargetTokens().some(t => t.actor && inRange.some(x => x.id === t.id));
    if (!ok) {
      ui.notifications?.warn(`Edha: ${item.name} — target a creature within ${rangeFt} ft (nothing spent).`);
      return false;
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* The generic RELEASE button (07-24u). A sustained pact needs a manual "it's over" surface — Covenant's
 * hand-rolled card carried one, and dropping it on conversion would trade enforcement for tidiness
 * (iron rule 3). Keyed on the LEDGER and the ENTRY ID, so it names no talent and any ledger gets one. */
async function edhaListReleaseClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.owner);
    if (!owner) { ui.notifications?.warn("Edha: could not work out whose ledger this is."); return; }
    if (!owner.isOwner && !game.user?.isGM) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) resolves this."); return; }
    const key = ds.list, status = ds.status || key;
    await edhaOwnerListQueue(owner, key, async () => {   // queued RMW (07-26n) — fresh read inside
      const cur = edhaOwnerList(owner, key, status);
      const idx = cur.findIndex(e => e.id === ds.entry);
      if (idx < 0) { ui.notifications?.info("Edha: that entry is no longer on the list."); btn.disabled = true; return; }
      const [gone] = cur.splice(idx, 1);
      btn.disabled = true; btn.textContent = "released";
      await edhaSetOwnerList(owner, key, cur);
      await edhaListUnmark(gone, status, { key, ownerId: owner.id, multiOwner: ds.multi === "1" });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>📋 <strong>${gone.talent || key}</strong>: ${owner.name}'s bond with <strong>${gone.name}</strong> ends (${cur.length} left).</p>` });
    });
  } catch (e) { edhaClickFailed("list release", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-list-release"] (Job 1, pass 5.3, end of file).

/* Re-arming an already-armed talent is a wasted cost, not a second arming. The Power tree hand-rolled
 * one of these per armed talent (crownActive, fury, unstoppable, mantleActive), each keyed on the
 * talent's NAME. The document-driven form needs no name at all: a talent whose own edha-self-status
 * rule is UNTIMED is a scene-arm, so if the user already carries that status the use is refused
 * BEFORE cost. Timed self-statuses (Brace) are excluded — re-applying one legitimately refreshes it. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-self-status");
    if (!h || !h.statusId) return;
    // Once per scene outlives the status itself (Mantle of the Aspirant) — the generic sceneOnce
    // stamp, checked before the active-arm gate so a worn-off mantle still refuses. 2bU.
    if (h.oncePerScene && edhaSceneOnceUsed(actor, item)) {
      ui.notifications?.warn(`Edha: ${item.name} was already used this scene — nothing spent.`);
      return false;
    }
    // An arm over a ledger refuses with the ledger empty (2bV): Concord binds your COVENANTS —
    // with none active there is nothing to bind, and nothing is spent.
    if (h.requireListNonEmpty) {
      const key = String(h.requireListNonEmpty).trim();
      const st = String(h.requireListStatus || key).trim();
      if (key && !edhaOwnerList(actor, key, st).length) {
        ui.notifications?.warn(`Edha: ${item.name} — your ${key} list is empty. Nothing spent.`);
        return false;
      }
    }
    // Untimed arms always refuse a re-arm; a timed arm refreshes unless the rule says refuse (2bU).
    if (h.timed !== false && h.refuseWhileActive !== true) return;
    if (!actor.statuses?.has?.(h.statusId)) return;
    ui.notifications?.warn(`Edha: ${item.name} is already active — nothing spent.`);
    return false;
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-decree`'s pre-cost VETO (2bV): once-per-scene + a live enemy net + a caster token, all
 * refused before the system charges — the takeover this replaces refused all three pre-cost. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-decree"); if (!h) return;
    if (h.oncePerScene !== false && edhaSceneOnceUsed(actor, item)) {
      ui.notifications?.warn(`Edha: ${item.name} is once per scene. Nothing spent.`);
      return false;
    }
    const otok = edhaCasterToken(actor);
    if (!otok) { ui.notifications?.warn("Edha: no token for the caster. Nothing spent."); return false; }
    const ft = edhaAttuneFtColor(actor, h.rangeColor || "blue");
    const foes = edhaTokensWithin(otok, ft).filter(t => t.actor && edhaDisposHostile(actor, t.actor)   // R-63 🤖 bench row
      && (Number(t.actor.system?.resources?.hea?.value) || 0) > 0);
    if (!foes.length) { ui.notifications?.warn(`Edha: no enemies within your Attunement Range (${h.rangeColor || "blue"}). Nothing spent.`); return false; }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-ward`'s pre-cost VETO (2bW): an already-warded target and a missing GM (for a creature the
 * user does not own) both refused before cost in the takeover this replaces. No-target is H1's veto. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (!edhaEventRules(item).some(r => r?.handler?.type === "edha-ward")) return;
    const t = edhaUserTargetActor(); if (!t) return;
    if (t.getFlag?.("edha-content", "deathWard")) { ui.notifications?.warn(`Edha: ${t.name} already bears a ward — nothing spent.`); return false; }
    if (!t.isOwner && !game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to ward ${t.name} — nothing spent.`); return false; }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-turn-dot`'s pre-cost VETO (2bW): every gate the Consuming-Decay takeover checked before
 * edhaConsumeCost — a real target, the range, the status-or-below-half bar, one instance per
 * creature, a GM online for another's creature. All refuse with nothing spent. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-turn-dot"); if (!h) return;
    const tTok = edhaUserTargetToken(); const target = tTok?.actor;
    if (!target || target === actor) { ui.notifications?.warn(`Edha: target the creature for ${item.name}. Nothing spent.`); return false; }
    if (h.rangeColor && !edhaDeathInRange(actor, tTok, h.rangeColor)) {
      ui.notifications?.warn(`Edha: ${target.name} is outside your Attunement Range (${h.rangeColor}). Nothing spent.`);
      return false;
    }
    const st = String(h.requireTargetStatus || "").trim();
    if (st || h.orBelowHalfHp) {
      const hea = target.system?.resources?.hea;
      const hp = Number(hea?.value) || 0, max = Number(hea?.max?.value ?? hea?.max) || 0;
      const ok = (st && target.statuses?.has?.(st)) || (h.orBelowHalfHp && max > 0 && hp < max / 2);
      if (!ok) {
        ui.notifications?.warn(`Edha: ${target.name} must be ${st ? `${edhaConditionLabel(st) || st}${h.orBelowHalfHp ? " or below half HP" : ""}` : "below half HP"} for ${item.name}. Nothing spent.`);
        return false;
      }
    }
    if (target.getFlag?.("edha-content", "decay")) { ui.notifications?.warn(`Edha: ${target.name} is already decaying (one instance per creature). Nothing spent.`); return false; }
    if (!target.isOwner && !game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to afflict ${target.name}. Nothing spent.`); return false; }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-revive`'s pre-cost VETO (2bW): once per scene + target-a-0-HP-token, both refused before
 * the system charges — the Raise-Dead takeover refused both pre-cost. The died-within-the-hour /
 * touching judgment stays owner-judged at targeting (the Sovereignty "willing" convention). */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-revive"); if (!h) return;
    if (h.oncePerScene !== false && edhaSceneOnceUsed(actor, item)) {
      ui.notifications?.warn(`Edha: ${item.name} was already used this scene. Nothing spent.`);
      return false;
    }
    const t = edhaUserTargetActor();
    if (!t) { ui.notifications?.warn(`Edha: target the remains (a token at 0 HP) for ${item.name}. Nothing spent.`); return false; }
    if ((t.system?.resources?.hea?.value ?? 1) > 0) { ui.notifications?.warn(`Edha: ${t.name} is not at 0 HP. Nothing spent.`); return false; }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* The zone-verb pre-cost VETO (2bV): fortify needs ≥1 of your Foundations, link needs 2, and both
 * need a GM online to write Regions/Drawings — the takeovers they replace refused all of it with
 * "Nothing spent". `terrain`/`foundation` need no gate (their pickers refund on cancel). */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-zone"); if (!h) return;
    const kind = h.kind || "terrain";
    // Terrain with a ledger cost (2bW — Bone Garden): an empty ledger and a missing GM both
    // refused pre-cost in the takeover this replaces. Freebie-aware, like every spend gate.
    if (kind === "terrain") {
      if (!h.costList) return;
      const key = String(h.costList).trim(), st = String(h.costListStatus || key).trim();
      if (!edhaOwnerListAvail(actor, key, st).length) {
        ui.notifications?.warn(`Edha: ${item.name} needs a ${edhaConditionLabel(st) || st} to plant. Nothing spent.`);
        return false;
      }
      if (!game.user?.isGM && !game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online for ${item.name}. Nothing spent.`); return false; }
      return;
    }
    // link-markers (2bX — Fate's Weave): two active begin-turn marker squares, checked BEFORE cost
    // exactly as the retired takeover did. Reads through edhaGetOrdained, which is the `ordained`
    // H3 ledger since the 2bAA repoint — this reader followed for free (one accessor).
    if (kind === "link-markers") {
      if (edhaGetOrdained(actor).length < 2) {
        ui.notifications?.warn(`Edha: ${item.name} needs two active Ordained Ground squares. Nothing spent.`);
        return false;
      }
      return;
    }
    if (kind !== "fortify" && kind !== "link") return;
    const founds = edhaFoundationsOn(canvas?.scene, actor.id);
    const need = kind === "link" ? 2 : 1;
    if (founds.length < need) {
      ui.notifications?.warn(`Edha: ${item.name} needs ${need === 2 ? "two active Foundations" : "at least one active Foundation"}. Nothing spent.`);
      return false;
    }
    if (!game.user?.isGM && !game.users?.activeGM) {
      ui.notifications?.warn(`Edha: a GM must be online for ${item.name}. Nothing spent.`);
      return false;
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-marker-command`'s pre-cost VETO (2bX): once-per-scene rides the generic sceneOnce stamp
 * (Thread of Inevitability). The spring/move cards themselves have no gate — an empty marker set
 * posts an "(nothing to command)" card, which is what the retired takeovers did. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-marker-command"); if (!h) return;
    if (h.oncePerScene === true && edhaSceneOnceUsed(actor, item)) {
      ui.notifications?.warn(`Edha: ${item.name} is once per scene — nothing spent.`);
      return false;
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* `edha-summon-effect`'s pre-cost VETO (2bV): a live summon, plus the per-mode gate — the baked
 * effect must exist and be off (toggle-baked), the summon must not already be armed (grant), and
 * the transform is once per scene. All were pre-cost refusals in the takeovers this replaces.
 *
 * ⚠️ The lookup key is `edhaSummonSourceTalent(h)` — the rule's OWN `summonTalent` field, blank by
 * default — NEVER `item.name`. This talent CONSUMES a summon another talent forged, so its own name
 * is not the summon's stamp. Passing `item.name` here is the 07-27f defect: it refused every
 * correctly-stamped Construct pre-cost ("needs a live Combat Construct. Nothing spent."). */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-summon-effect"); if (!h) return;
    const c = edhaOwnedSummons(actor, edhaSummonSourceTalent(h), h.summonName || "Combat Construct")[0] ?? null;
    if (!c) { ui.notifications?.warn(`Edha: ${item.name} needs a live ${h.summonName || "summon"}. Nothing spent.`); return false; }
    const mode = h.mode || "toggle-baked";
    if (mode === "toggle-baked") {
      const eff = c.effects?.find(e => e.getFlag?.("edha-content", "summonEffect") && e.name === h.effectName);
      if (!eff) { ui.notifications?.warn(`Edha: this ${h.summonName || "summon"} carries no baked ${h.effectName || "effect"} — reforge it (older summon). Nothing spent.`); return false; }
      if (!eff.disabled) { ui.notifications?.warn(`Edha: ${h.effectName || item.name} is already active. Nothing spent.`); return false; }
    } else if (mode === "grant") {
      if (c.getFlag?.("edha-content", "summonArmed")) { ui.notifications?.warn(`Edha: ${item.name} is already active this scene. Nothing spent.`); return false; }
    } else if (mode === "transform") {
      if (h.oncePerScene !== false && edhaSceneOnceUsed(actor, item)) {
        ui.notifications?.warn(`Edha: ${item.name} was already used this scene. Nothing spent.`);
        return false;
      }
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* The manual surface for a watch, and the reason it is generic. Crown of Thorns' hand-rolled card
 * carried a "ping" button for a qualifying test the ENGINE did not resolve (a GM-adjudicated one, or
 * a talent not yet on H1). Dropping that button when the talent moved onto its document would have
 * traded enforcement for tidiness — iron rule 3. So the button is now a WATCH trigger any talent can
 * post from an `edha-note` rule, carrying the observation as data attributes:
 *   <button type="button" class="edha-watch-manual" data-owner="<uuid>" data-skill="black" data-def="cog">…</button>
 * It fabricates the same event the engine would have dispatched, so the watcher's own filters and
 * payload rules decide what happens — the button knows nothing about any talent. */
async function edhaWatchManualClick(ev, msg) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    // The owner comes from the MESSAGE's speaker, not a data attribute: an edha-note resolves @-refs
    // against roll data before the card is posted, so any "@actorUuid" placeholder in the note text
    // would have been substituted to "0" long before this handler ever saw it.
    let owner = null;
    try { owner = ChatMessage.getSpeakerActor?.(msg?.speaker) ?? (msg?.speaker?.actor ? game.actors?.get(msg.speaker.actor) : null); } catch (e) {}
    if (!owner && btn.dataset.owner) { owner = await edhaResolveActorRef(btn.dataset.owner); }
    if (!owner) { ui.notifications?.warn("Edha: could not work out whose talent this is."); return; }
    if (!owner.isOwner) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) can resolve this."); return; }
    const victim = edhaUserTargetActor();
    if (!victim) { ui.notifications?.warn("Edha: target the creature whose test this was, then click."); return; }
    btn.disabled = true;
    const fired = await edhaDispatchWatchers({
      kind: btn.dataset.watch || "test", owner, victim,
      skill: btn.dataset.skill || null, def: btn.dataset.def || null,
      ok: btn.dataset.ok === "false" ? false : true, total: Number(btn.dataset.total) || 0,
    });
    if (!fired) ui.notifications?.info("Edha: nothing is watching for that right now (armed? in range?).");
  } catch (e) { edhaClickFailed("manual watch trigger", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-watch-manual"] (Job 1, pass 5.3, end of file).

