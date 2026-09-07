/* ============================================================================================
 * SOVEREIGNTY (Verdannis, deity) tree engine (2026-07-01; iron rule 2b pass 2bT 2026-07-25) — the
 * "damage die step" lifecycle. Colors Black/White; tag prefix "Sovereignty (Verdannis)."; build
 * `foundry-build deity` → pack `edha-deity`. Ben 07-01: tests are always d20; the stepped die is
 * the DAMAGE die, d4→d6→d8→d10→d12. Attunement Range: BLACK rank debuff side, WHITE rank buff/
 * ally side (Ben R2).
 *
 * ALL NINE TALENTS ARE ON THEIR DOCUMENTS since pass 2bT (07-25). The takeover set and the seven
 * per-talent use functions are DELETED; behaviour is authored rules in deity-sovereignty.json:
 *   • Censure             — H1 `edha-def-test` {black vs cog, enemy, Black range} → success:
 *     H9 `edha-die-step` {−1 all, next-turn}.
 *   • Decree of Ruin      — same gate + `oncePerTarget`; success −1 scene / failure −1 next-turn.
 *   • Edict of the Fallen — black vs spi; success −2 attack scene with the failed-attack THP rider
 *     carried IN THE ENTRY (failThpFormula/failThpRange); failure −1 all next-turn.
 *   • Exalt               — H9 on use {ally, +1, next-turn} (announces `die-step` to watchers).
 *   • Sovereign's Favor   — `edha-watch` {die-step, self, whenSkill: exalt} → `edha-temp-hp`
 *     {victim, [Tier][Die white], keeps-higher = "does not stack"}.
 *   • Investiture of Authority — H9 {ally, +1, scene, replaceKeys: exalt, oncePerTarget}.
 *   • Sovereign's Balance — H9 {pair, +1/−1, next-turn, onPairHit: extend-once}.
 *   • Sovereignty         — H9 {pair, +2/−2, scene, onPairHit: no-reactions, oncePerScene}.
 *   • Expose              — `edha-die-step-react` {whenKeys: censure,decree — Ben R3; recoverInv 1
 *     (no cap — Ben R4); reactive-strike prompt for the targeted ally in White range}.
 *
 * WHAT STAYS HERE (engine machinery the rules consume — none of it keys on a talent name):
 *   • The die-step LEDGER: flags.edha-content.dieStep = [{key, steps, scope, ownerId, castRound,
 *     expire, pairId?, onPairHit?, failThpFormula?, failThpRange?}] on the affected creature +
 *     the `exalted`/`diminished` statuses + the rollDamage-wrapper rewrite (edhaSovStepOverride):
 *     bake the formula, move every ladder die by the net steps (entries STACK — Ben R6; the d4/d12
 *     clamp is the only rail; off-ladder dice untouched). scope "attack" gates to weapon/attack.
 *   • Timed expiry — entry.expire = owner-relative next-turn coordinate, swept on combatTurnChange;
 *     "scene" entries + statuses cleared on deleteCombat.
 *   • The GM-side roll watch (one client): Expose recovery/prompt, the entry-carried failed-attack
 *     THP rider, and the pair couplings — ALL selected by rule sweeps or entry data since 2bT
 *     (`edha-die-step-react` rules; entry.failThpFormula; entry.onPairHit), never by a talent name.
 *   • ENGINE-OWNED support: the Expose click card + the pair-hit cards (posters + click machinery,
 *     the H6 trade).
 * Known limits (named, not dropped): failed NON-attack tests stay an owner-click card (Foundry
 * tests carry no DC); hit detection reads the target's PHYSICAL defense (misreads err toward not
 * firing); engine-side damage that bypasses rollDamage does not step.
 * Truly manual (declared): "willing" ally consent (owner-judged at targeting); the Reactive Strike
 * itself and the capstone's reaction-denial (no hook can force/forbid another creature's action —
 * both post prompt cards, detection IS wired). CONTEST-EXEMPT: none — every test is vs a DEFENSE
 * through H1, never an opposed SKILL.
 * ============================================================================================ */

const EDHA_SOV_LADDER = [4, 6, 8, 10, 12];   // the damage-die ladder ([Tier][Die] = d(2·rank+2), ranks 1–5)
// (EDHA_SOV_DEBUFF_KEYS retired 2bT — the keys Expose rides are its rule's own `whenKeys` field.)

function edhaSovSteps(actor) {
  const l = actor?.flags?.["edha-content"]?.dieStep;
  return Array.isArray(l) ? l.filter(e => e && Number(e.steps)) : [];
}
async function edhaSovSetSteps(target, list) {
  const value = list?.length ? list : null;
  try {
    return await edhaSetEdhaFlag(target, "dieStep", value);   // Job 6a: routed through the canonical helper (setFlag(key, null) reads the same as unset for every edhaSovSteps consumer)
  } catch (e) { console.error("Edha Content | set dieStep failed", e); return false; }
}
// Keep the exalted/diminished token icons in sync with the entry list (idempotent toggles).
async function edhaSovSyncStatuses(target, list) {
  const up = (list ?? []).some(e => Number(e.steps) > 0), down = (list ?? []).some(e => Number(e.steps) < 0);
  if (up !== !!target.statuses?.has?.("exalted")) await edhaToggleStatus(target, "exalted", up);
  if (down !== !!target.statuses?.has?.("diminished")) await edhaToggleStatus(target, "diminished", down);
}
// The owner-relative timed expiry: the coordinate of the OWNER's next turn ("start of your next
// turn" lands end-of-owner-next-turn, the engine convention). Out of combat → "owner-next", lazily
// stamped by the sweep once combat runs.
function edhaSovTimedExpire(owner) {
  const c = edhaInActiveCombat(owner); if (!c?.started) return "owner-next";   // R-4/#28a: the OWNER's combat
  const ti = edhaCombatantTurnIndex(c, owner);
  return ti >= 0 ? edhaNextTurnCoord(c, ti) : "owner-next";
}
async function edhaSovAddStep(owner, target, entry) {
  const list = [...edhaSovSteps(target), { ...entry, ownerId: owner.id, castRound: edhaCombatRoundOf(owner) }];   // R-4/#28a
  const ok = await edhaSovSetSteps(target, list);
  if (ok) await edhaSovSyncStatuses(target, list);
  return ok;
}

/* --- The damage-die rewrite (called from the rollDamage wrapper) ----------------------------------- */
function edhaSovStepFaces(faces, steps) {
  const i = EDHA_SOV_LADDER.indexOf(Number(faces));
  if (i < 0) return null;                                   // off-ladder die (d3/d20/d100) — leave it alone
  return EDHA_SOV_LADDER[Math.max(0, Math.min(EDHA_SOV_LADDER.length - 1, i + steps))];
}
function edhaSovIsAttackItem(item) {
  return item?.type === "weapon" || !!item?.system?.attack || String(item?.system?.activation?.type || "").includes("attack");
}
function edhaSovNetSteps(actor, isAttack) {
  let n = 0;
  for (const e of edhaSovSteps(actor)) { if (e.scope === "attack" && !isAttack) continue; n += Number(e.steps) || 0; }
  return n;   // entries stack (Ben R6); the d4/d12 face clamp is the only rail
}
// Bake the formula against the roller, then move every ladder die by `steps`. One pass handles both
// the [Tier][Die] shape ("(1)d(2 * 3 + 2)" post-bake) and plain "2d8"; the [^A-Za-z_.] guard keeps
// "round(" / "@attr.spd" out. Returns null when nothing on the ladder changed (keep the native roll).
function edhaSovStepFormula(formulaRaw, actor, steps) {
  let baked;
  try { baked = Roll.replaceFormulaData(String(formulaRaw), actor?.getRollData?.() ?? {}, { missing: "0" }); } catch (e) { return null; }
  let changed = false;
  const out = baked.replace(/(^|[^A-Za-z_.])d\s*(?:\(([^()]+)\)|(\d+))/gi, (m, pre, expr, num) => {
    const f = expr != null ? Math.floor(edhaEvalSync(expr, {})) : Number(num);
    const nf = edhaSovStepFaces(f, steps);
    if (nf == null || nf === f) return m;
    changed = true;
    return `${pre}d${nf}`;
  });
  return changed ? out : null;
}
function edhaSovStepOverride(item, base) {
  try {
    const actor = item?.actor; if (!actor || !base) return null;
    const steps = edhaSovNetSteps(actor, edhaSovIsAttackItem(item));
    return steps ? edhaSovStepFormula(base, actor, steps) : null;
  } catch (e) { return null; }
}

/* --- Targeting -------------------------------------------------------------------------------------- */
// Split the user's current targets by disposition relative to the owner.
function edhaSovTargets(owner) {
  const disp = edhaActorSide(owner);   // R-63: a targeted creature is sorted into NEITHER bucket when a side will not resolve
  const toks = edhaUserTargetTokens();
  return {
    allies: toks.filter(t => t.actor && t.actor !== owner && edhaSideSame(t.document?.disposition, disp)),
    enemies: toks.filter(t => t.actor && edhaSideHostile(t.document?.disposition, disp)),
  };
}
const edhaSovEnemy = (owner) => edhaSovTargets(owner).enemies[0]?.actor ?? null;
const edhaSovAlly = (owner) => edhaSovTargets(owner).allies[0]?.actor ?? null;

/* --- GM-side watchers: die-step-react rules (Expose) + entry-carried riders (Edict THP, pair hits) --- */
// Attack-fail read: the roller's synced target's PHYSICAL defense (see the section-header backlog note).
function edhaSovAttackRead(roller, roll) {
  const targets = edhaTargetsOfRoller(roller);
  const ta = targets[0]?.actor ?? null;
  const def = ta ? edhaReadDefense(ta, "phy") : null;
  if (def == null) return null;
  return { target: ta, targetTok: targets[0], def, failed: (Number(roll.total) || 0) < def };
}
async function edhaSovRecoverInv(owner, sourceName, victimName, n = 1) {
  try {
    const gain = Math.max(1, Number(n) || 1);
    await edhaGainResource(owner, "inv", gain);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>👁️ <strong>${sourceName}</strong>: ${victimName} failed a test — ${owner.name} recovers ${gain} Investiture.</p>` });
  } catch (e) { console.error("Edha Content | Sovereignty Inv recovery failed", e); }
}
// The owner-click fallback for NON-attack tests (Foundry tests carry no DC — owner judges).
// Parameterized by the RULE's talent since 2bT — the card names no talent of its own.
function edhaSovPostExposeCard(owner, sourceName, victim, total, recoverN) {
  ChatMessage.create({
    whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>👁️ <strong>${sourceName}</strong>: <strong>${victim.name}</strong> (Diminished by you) rolled a test — total <strong>${total}</strong>. If it FAILED, click to recover ${recoverN} Investiture.</p>
      <button type="button" class="edha-sov-expose-btn" data-edha-owner="${owner.uuid}" data-edha-source="${encodeURIComponent(sourceName)}" data-edha-victim="${victim.name}" data-edha-n="${recoverN}">It failed — recover ${recoverN} Investiture</button></div>`,
  });
}
async function edhaSovExposeClick(ev) {
  try {
    const btn = ev.currentTarget;
    const owner = await edhaResolveActorRef(btn.dataset.edhaOwner);
    if (!owner) return;
    btn.disabled = true; btn.textContent = "✓ recovered";
    await edhaSovRecoverInv(owner, decodeURIComponent(btn.dataset.edhaSource || "the talent"), btn.dataset.edhaVictim || "the creature", Number(btn.dataset.edhaN) || 1);
  } catch (e) { edhaClickFailed("expose click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-sov-expose-btn"] (Job 1, pass 5.3, end of file).

// One GM client inspects each completed test by a die-stepped creature. Since 2bT everything here
// is selected by RULES (`edha-die-step-react`) or by ENTRY data (failThpFormula, onPairHit) — the
// watch itself never names a talent.
async function edhaSovRollWatch(ctx, roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const entries = edhaSovSteps(roller); if (!entries.length) return;
    const isAttackCtx = ctx !== "skill";
    const read = isAttackCtx ? edhaSovAttackRead(roller, roll) : null;

    // ---- `edha-die-step-react` rules (Expose): a debuffed-by-you creature fails a test
    for (const w of edhaWatchersOfRule("edha-die-step-react")) {
      const hh = w.handler, owner = w.actor;
      const keys = new Set(String(hh.whenKeys || "censure,decree").split(",").map(s => s.trim()).filter(Boolean));
      if (!entries.some(e => e.steps < 0 && keys.has(e.key) && e.ownerId === owner.id)) continue;
      const recoverN = Math.max(1, Number(hh.recoverInv) || 1);
      if (read) {                                       // readable attack → auto-resolve the failure
        if (!read.failed) continue;
        await edhaSovRecoverInv(owner, w.item.name, roller.name, recoverN);
        if (hh.reactiveStrike !== false && read.targetTok && edhaAllyInAttune(owner, read.targetTok, hh.allyRange || "white")) {
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<div class="edha-trigger-card"><p>👁️ <strong>${w.item.name}</strong>: ${roller.name}'s attack on <strong>${read.target.name}</strong> failed — ${read.target.name} may make a <strong>Reactive Strike</strong> against it (take it by hand).</p></div>` });
        }
      } else {                                          // non-attack test / unreadable target → owner-judged click card
        edhaSovPostExposeCard(owner, w.item.name, roller, Number(roll.total) || 0, recoverN);
      }
    }

    // ---- Entry-carried failed-attack rider (Edict's THP): the rider travels IN the entry
    if (read?.failed) {
      for (const e of entries.filter(x => x.failThpFormula && x.scope === "attack")) {
        const owner = game.actors?.get(e.ownerId); if (!owner) continue;
        const amt = Math.max(0, Math.floor(edhaEvalSync(e.failThpFormula, owner.getRollData())));
        if (!amt) continue;
        const allies = edhaAlliesInAttune(owner, e.failThpRange || "white");
        for (const t of allies) await edhaGrantTempHpCross(t.actor, amt, e.source || "die-step rider");
        if (allies.length) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<p>👑 <strong>${e.source || "Die-step rider"}</strong>: ${roller.name} failed an attack test — ${allies.length} ally(ies) in range gain ${amt} temporary HP.</p>` });
      }
    }

    // ---- Pair couplings (entry.onPairHit): the exalted half HITS the paired diminished enemy
    if (!read || read.failed) return;
    const plus = entries.filter(e => e.steps > 0 && e.onPairHit && e.pairId);
    if (!plus.length) return;
    const minus = edhaSovSteps(read.target).filter(e => e.steps < 0 && e.onPairHit && e.pairId);
    for (const pe of plus) for (const me of minus) {
      if (pe.pairId !== me.pairId || pe.ownerId !== me.ownerId) continue;
      const owner = game.actors?.get(pe.ownerId);
      if (pe.onPairHit === "no-reactions") {
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner ?? roller }),
          content: `<div class="edha-trigger-card"><p>👑 <strong>${pe.source || "Pair"}</strong>: ${roller.name} hit <strong>${read.target.name}</strong> — it cannot take <strong>reactions</strong> until the start of its next turn (GM-enforced).</p></div>` });
        continue;
      }
      // extend-once — extend both entries one round, once, cast round only
      if (pe.extended || edhaCombatRoundOf(owner ?? roller) !== pe.castRound) continue;   // R-4/#28a: the CASTER's combat round, matching edhaSovAddStep's stamp
      if (typeof pe.expire !== "object" || typeof me.expire !== "object") continue;   // out-of-combat cast — nothing to extend
      const bump = (a, entry) => {
        const list = edhaSovSteps(a).map(x => (x.pairId === entry.pairId && x.onPairHit === "extend-once")
          ? { ...x, extended: true, expire: { ...x.expire, round: (Number(x.expire.round) || 0) + 1 } } : x);
        return a.setFlag("edha-content", "dieStep", list);
      };
      await bump(roller, pe); await bump(read.target, me);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner ?? roller }),
        content: `<p>👑 <strong>${pe.source || "Pair"}</strong>: ${roller.name} hit ${read.target.name} — both effects extend one additional round.</p>` });
    }
  } catch (e) { console.error("Edha Content | Sovereignty roll watch failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, (r, s, c) => edhaSovRollWatch(ctx, r, s, c));

/* --- Timed sweep (combatTurnChange) + scene cleanup (deleteCombat) ---------------------------------- */
async function edhaSovSweep(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const curSeq = edhaTurnSeq(combat.round, combat.turn);
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      const list = edhaSovSteps(a); if (!list.length) continue;
      let changed = false; const keep = [];
      for (const e of list) {
        if (e.expire === "owner-next") {   // cast out of combat — stamp the owner's next turn now
          const owner = game.actors?.get(e.ownerId);
          const ti = owner ? edhaCombatantTurnIndex(combat, owner) : -1;
          if (ti >= 0) { keep.push({ ...e, expire: edhaNextTurnCoord(combat, ti) }); changed = true; } else keep.push(e);
          continue;
        }
        if (e.expire && typeof e.expire === "object" && curSeq > edhaTurnSeq(e.expire.round, e.expire.turn)) { changed = true; continue; }   // expired
        keep.push(e);   // "scene" entries wait for deleteCombat
      }
      if (!changed) continue;
      if (keep.length) await a.setFlag("edha-content", "dieStep", keep); else await a.unsetFlag("edha-content", "dieStep");
      await edhaSovSyncStatuses(a, keep);
    }
  } catch (e) { console.error("Edha Content | Sovereignty sweep failed", e); }
}
Hooks.on("combatTurnChange", (c) => { if (edhaDefBuffGmGate()) void edhaSovSweep(c); });

// R-60 FLAGSHIP CASE: population widens from "canvas tokens ONLY" to edhaSceneReset's directory∪
// tokens dedup — an off-scene character used to keep `dieStep` forever (the bug R-60 names). Flags
// and statuses are verbatim.
async function edhaClearSovState(endedCombat) {
  await edhaSceneReset(endedCombat, {
    key: "sov",
    flags: ["dieStep", "dieStepOnceBy"],
    statuses: ["exalted", "diminished"],
  });
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

/* --- H9 `edha-die-step`'s pre-cost VETO (2bT). Rules on `use` need their own targeting gates (a
 * willing ally / an ally-and-enemy pair); the once-per-target and once-per-scene stamps veto for
 * rules on ANY event, since a rule on edha-test-success can only refuse here, before H1's cost.
 * The same "nothing spent" move H1 / H3 / H12 / H15 all make. ------------------------------------- */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const rules = edhaEventRules(item).filter(r => r?.handler?.type === "edha-die-step");
    if (!rules.length) return;
    const { allies, enemies } = edhaSovTargets(actor);
    for (const rule of rules) {
      const h = rule.handler;
      if (h.oncePerScene && edhaSceneOnceUsed(actor, item)) {
        ui.notifications?.warn(`Edha: ${item.name} was already used this scene — nothing spent.`);
        return false;
      }
      const mode = h.target || "victim";
      const prospect = mode === "ally" || mode === "pair" ? allies[0]?.actor
        : mode === "enemy" ? enemies[0]?.actor
        : (edhaUserTargetActor());
      if (h.oncePerTarget && prospect
          && prospect.flags?.["edha-content"]?.dieStepOnceBy?.[h.key || "step"]?.[actor.id]) {
        ui.notifications?.warn(`Edha: ${item.name} was already used on ${prospect.name} this scene.`);
        return false;
      }
      if (rule.event !== "use") continue;   // targeting gates below only bind the on-use rules
      if (mode === "ally" && !allies[0]) { ui.notifications?.warn(`Edha: target a willing ally for ${item.name}. Nothing spent.`); return false; }
      if (mode === "enemy" && !enemies[0]) { ui.notifications?.warn(`Edha: target an enemy for ${item.name}. Nothing spent.`); return false; }
      if (mode === "pair" && (!allies[0] || !enemies[0])) { ui.notifications?.warn(`Edha: target one willing ally AND one enemy for ${item.name}. Nothing spent.`); return false; }
    }
  } catch (e) { /* never block a use on a guard failure */ }
});
// Expose + Sovereign's Favor are passives — no use rules; they ride the roll watcher / the die-step watch kind.

