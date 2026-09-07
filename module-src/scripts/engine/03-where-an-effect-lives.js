/* ====================== WHERE AN EFFECT LIVES (fix pass 5, 2026-09-06) ==========================
 * `actor.effects` is NOT "the effects on this creature" — it is only the ones EMBEDDED IN THE ACTOR.
 * An ActiveEffect authored on a talent or on an adversary TRAIT with `transfer: true` stays embedded
 * in that ITEM; Foundry surfaces it through `Actor#allApplicableEffects()` (v13 `client/documents/
 * actor.mjs`: yield every actor effect, then every item effect whose `transfer` is set — and
 * cosmere-rpg 2.1.0 sets `CONFIG.ActiveEffect.legacyTransferral = false`, so the item half really is
 * yielded). `Actor#statuses` is rebuilt from `allApplicableEffects()` in `applyActiveEffects()`, and
 * THAT is what makes the mismatch invisible: the status shows on the creature, the token and the
 * sheet while its effect is absent from the collection the engine searched.
 *
 * Shipped consequence (bench run 33): the Stalker's `Veil` marker is `transfer: true` on the `Veil`
 * trait, so `edhaDarkVeilSweep`'s `actor.effects` lookup resolved `undefined` every time and the
 * veil has never auto-toggled — on any map, on any Stalker, since the sweep shipped. A hand-made
 * ACTOR-level copy of the identical AE made the sweep fire, which is the matched control proving the
 * LOOKUP was the defect and the illumination test was innocent.
 *
 * `edhaAllEffects(actor)` is the widened read. Deliberately NOT Foundry's `appliedEffects` getter,
 * which filters on `effect.active` (`!disabled && !isSuppressed`): every marker in this family is
 * stored DISABLED and the engine's whole job is to find it and switch it on, so `appliedEffects`
 * would have been exactly as blind as `actor.effects`.
 *
 * ⚠️ REACH FOR THIS ONLY WHEN THE EFFECT COULD HAVE BEEN AUTHORED ON AN ITEM. An effect the engine
 * itself created on the actor — every `flags.edha-content.*` buff, marker, stance, counter and
 * timed status — can never be item-transferred, and widening those reads would be a NEW bug:
 * `update()` / `delete()` on a yielded ITEM effect writes to the item, permanently altering that
 * creature's copy of the talent or trait. The site-by-site verdict table is in the 2026-09-06
 * FIX PASS 5 handoff delta. */
function edhaAllEffects(actor) {
  try {
    if (typeof actor?.allApplicableEffects === "function") return [...actor.allApplicableEffects()];
  } catch (e) { /* fall through to the actor-level read */ }
  try { return [...(actor?.effects ?? [])]; } catch (e) { return []; }
}

/* Statuses that auto-expire at the END of the affected creature's next turn NO MATTER HOW THEY WERE
 * APPLIED — including a GM hand-toggling the icon on the token HUD. Weakened (Black disadvantage)
 * and Immobilized (Sovereign of Solitude's movement-stop) both ride this.
 *
 * ⚠️ This is NOT the list of "statuses that can be timed", and adding to it is almost never the fix
 * for "X never expired". A rule that authors `timed: true` (or `expire: owner-turn/target-turn`)
 * carries its own intent and is stamped by `edhaApplyTimedStatus`; five such status ids are
 * deliberately absent here — `braced`, `tagged`, `unstoppable`, `compelled`, `disoriented` — because
 * each ALSO has an untimed life (the Frostbinder's Predictive Ward is a permanent `braced`; a GM may
 * mark someone Compelled indefinitely). Putting them here would expire those too. See the
 * `timedExpire` intent flag below, which is what actually makes an authored `timed: true` durable. */
const EDHA_TIMED_STATUSES = new Set(["weakened", "immobilized", "slowed", "noactions", "noreactions"]);   // noactions/noreactions: Black/Subjugation markers (07-05); owner-relative appliers overwrite the auto-stamp
function edhaIsTimedStatus(carrier) {
  try { for (const s of (carrier?.statuses ?? [])) if (EDHA_TIMED_STATUSES.has(s)) return true; } catch (e) {}
  return false;
}
/* PURE. The turn-change CATCH-UP decision for one effect that carries no `expireAfter` yet: must the
 * pass stamp it, and relative to whom?
 *
 * Two sources, and the second is the one that was missing (bench run 20, 2026-07-28f). Brace authors
 * `edha-self-status {statusId: "braced", timed: true}`, whose executor calls `edhaApplyTimedStatus`.
 * That stamps only `if (game.combat?.started)` and only when the creature is in THAT combat — so a
 * Brace used before initiative is rolled (or while `game.combat` is some other combat) lands with no
 * coordinate, and the catch-up pass then skipped it because it keyed on EDHA_TIMED_STATUSES, which
 * `braced` is deliberately not in. Result: immortal. Same hole for `tagged`, `unstoppable`,
 * `compelled` and `disoriented` — 7 authored rules across 5 status ids, all relying on the one stamp.
 *
 * `intent` is the `timedExpire` flag the applier writes when it could not stamp. Honouring it keys
 * the behaviour on WHAT THE RULE ASKED FOR rather than on a status name — so a talent renamed or a
 * new timed status needs no engine edit, and an effect that never went through `edhaApplyTimedStatus`
 * (Predictive Ward's transfer AE) can never be caught by it. */
function edhaTimedStampPlan(intent, allowlisted) {
  if (intent && typeof intent === "object") return { expire: intent.expire || "target", ownerUuid: intent.ownerUuid || null, fromIntent: true };
  if (allowlisted) return { expire: "target", ownerUuid: null, fromIntent: false };
  return null;
}
// Stamp a timed status with its expiry coordinate the moment it is applied (any path: Sapping Hex, Black
// Draw Mana, Sovereign of Solitude, manual toggle, edha.toggleStatus). GM-side; out-of-combat applications
// are left for the pass.
Hooks.on("createActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!edhaIsTimedStatus(effect)) return;
    if (effect.getFlag?.("edha-content", "expireAfter")) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    // R-4/#28a: the CARRIER's own combat. Reading `game.combat` meant a status applied while this
    // client viewed a different encounter (or none) was left unstamped — and then immortal.
    const combat = edhaInActiveCombat(a); if (!combat?.started) return;
    const ti = edhaCombatantTurnIndex(combat, a); if (ti < 0) return;   // creature isn't in this combat
    void effect.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(combat, ti));
  } catch (e) { console.error("Edha Content | timed-status stamp failed", e); }
});
// Each turn change: drop any effect whose expireAfter has passed; lazily stamp anything still
// un-stamped — an allowlisted status, OR an effect carrying an applier's `timedExpire` intent.
async function edhaExpireTimedStatuses(combat) {
  combat = combat || game.combat; if (!combat?.started) return;
  const curSeq = edhaTurnSeq(combat.round, combat.turn);
  const turns = combat.turns ?? [];
  for (let i = 0; i < turns.length; i++) {
    const a = turns[i]?.actor; if (!a?.effects) continue;
    for (const e of [...a.effects]) {
      const exp = e.getFlag?.("edha-content", "expireAfter");
      if (exp) {
        if (curSeq > edhaTurnSeq(exp.round, exp.turn)) {
          const label = e.name || "Status";
          try { if (a.effects.get(e.id)) await e.delete(); } catch (x) { console.error("Edha Content | timed-status expire failed", x); }
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>💢 <strong>${label}</strong> on ${a.name} ends (end of its turn).</p>` });
        }
        continue;
      }
      // Applied out of combat / by hand / before this combat existed → stamp now, expire normally.
      const plan = edhaTimedStampPlan(e.getFlag?.("edha-content", "timedExpire"), edhaIsTimedStatus(e));
      if (!plan) continue;
      let ti = i;   // default: the CARRIER's own turn
      if (plan.expire === "owner" && plan.ownerUuid) {   // owner-relative (Brace, Kneel's Compelled, Disorient)
        const oa = await edhaResolveActorRef(plan.ownerUuid);
        const oi = oa ? edhaCombatantTurnIndex(combat, oa) : -1;
        if (oi >= 0) ti = oi;
      }
      try {
        await e.setFlag("edha-content", "expireAfter", edhaNextTurnCoord(combat, ti));
        if (plan.fromIntent) await e.unsetFlag("edha-content", "timedExpire");   // consumed
      } catch (x) {}
    }
  }
}
Hooks.on("combatStart",      (combat) => { if (edhaDefBuffGmGate()) void edhaExpireTimedStatuses(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaExpireTimedStatuses(combat); });
Hooks.once("ready", () => { try { if (game.combat?.started && edhaDefBuffGmGate()) void edhaExpireTimedStatuses(game.combat); } catch (e) {} });

/* --- Passive damage riders --------------------------------------------------------------------
 * Some talents add bonus damage to OTHER talents' rolls when owned (e.g. Kindle: "+Red modifier
 * to energy damage"). The system has no hook for this, so we wrap CosmereItem#rollDamage: for each
 * `edha-damage-rider` rule on the rolling actor's talents whose `appliesTo` matches the damage type,
 * we append its `bonusFormula` via the system's own `overrideFormula` option. The rider lives ON the
 * talent (Events tab, editable); this wrapper is only the generic applicator that reads it.
 */
let _edhaLastDealer = null;   // {actor,type,ts}: last damage roll — attributes card-applied damage for Kindle light

// All enabled event rules on an item (the on-talent behaviour store).
function edhaEventRules(item) {
  try { return (item?.hasEvents?.() ? item.enabledEvents : []) || []; }
  catch (e) { return []; }
}
// First enabled rule on the item with the given handler type (or null).
function edhaRuleOf(item, type) {
  for (const r of edhaEventRules(item)) if (r?.handler?.type === type) return r.handler;
  return null;
}
// Match a rider's appliesTo (comma-list string or "any") against a damage type.
function edhaRiderMatches(at, dtype) {
  if (!at || at === "any") return true;
  if (Array.isArray(at)) return at.includes(dtype);
  return String(at).split(/[,\s]+/).filter(Boolean).includes(dtype);
}

// Does this actor currently have any CONDITION status (per CONFIG.COSMERE.statuses[x].condition)?
function edhaHasCondition(actor) {
  try {
    for (const s of (actor?.statuses ?? [])) if (CONFIG.COSMERE?.statuses?.[s]?.condition) return true;
    return false;
  } catch (e) { return false; }
}
// Rider components as [{formula, name}] — the name labels the term so the table can SEE which talent
// added what (Ben pass 3, 07-12: "how can I tell if the Kindle bonus is applied?" — the answer must
// be on the roll/card, not in the GM's head). Same convention as the 07-05 roll-label family.
function edhaRiderParts(item, actor) {
  try {
    if (!actor || !item?.system?.damage) return [];
    const dtype = item.system.damage.type;
    if (!dtype) return [];
    const target = edhaUserTargetActor();   // for target-conditional riders
    const parts = [];
    for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-damage-rider")) {
        if (!h.bonusFormula) continue;
        if (!edhaRiderMatches(h.appliesTo, dtype)) continue;
        // Conditional riders (Prognosis: "+[Tier][Die] when healing a creature that has a condition"):
        // only apply when the current target carries a condition / the named status.
        if (h.whenTargetCondition) { if (!target || !edhaHasCondition(target)) continue; }
        if (h.whenTargetStatus)    { if (!target || !target.statuses?.has?.(h.whenTargetStatus)) continue; }
        if (h.whenMovedTowardFt)   { if (!target || edhaMovedTowardFt(actor, target) < Number(h.whenMovedTowardFt)) continue; }   // Momentum's Edge: charged ≥ N ft toward it
        if (h.whenTargetFooled)    { if (!target || !edhaTargetFooledOrTest(actor, target)) continue; }   // Spearing Beak: only vs a believer in the roller's seeming — R-50: an UNTESTED target is tested right here, so the first strike benefits
        parts.push({ formula: h.bonusFormula, name: tal.name });
    }
    return parts;
  } catch (e) {
    console.error("Edha Content | rider bonus computation failed", e);
    return [];
  }
}
/* R-71's runtime die-math fold, extended to the RIDER half (fix pass 10, TODO 78). Item 69 folds the
 * BASE formula in `edhaWrapRollDamage` below, so a scaled talent's own damage prints `2d8` and not
 * `(2)d(2 * 3 + 2)`; the rider joined onto it was still handed over raw, so bench run 41 read
 * Prognosis as `2d8 + 2 + ((2)d(2 * 3 + 2))[Prognosis]` — the base folded, the rider not, on the
 * same bar. Same defect, same fix, one function apart.
 * SAFETY, and why this substitutes twice: the rider is resolved here against the ROLLER's data,
 * whereas the system resolves it a moment later against `getDamageRollData` — which is
 * `{...actor.getRollData(), mod, skill, attribute, source}`. Those four extra keys are the only
 * divergence, so the substitution is only safe when nothing needs them. `Roll.replaceFormulaData`
 * with NO `missing` leaves an unresolved `@ref` in the string (client/dice/roll.mjs), so an
 * `@mod`/`@skill`/`@attribute` rider is DETECTED and handed on raw, exactly as before — the fold
 * only ever touches a formula that fully resolved here. Every current `edha-damage-rider`
 * bonusFormula references `@tier` / `@skills.*` / a literal only. PURE, pinned in tests/. */
function edhaFoldRiderFormula(formula, rollData) {
  try {
    if (!rollData) return String(formula);
    const sub = Roll.replaceFormulaData(String(formula), rollData);
    return sub.includes("@") ? String(formula) : edhaFoldDieMath(sub);
  } catch (e) { return String(formula); }
}
function edhaRiderBonus(item, actor) {
  const parts = edhaRiderParts(item, actor);
  if (!parts.length) return null;
  // NOTE the fold is HERE and not in edhaRiderParts: the OTHER consumer of the parts (the burst
  // executor in the GM relay) evaluates each one NUMERICALLY against its own roll data, so it wants
  // the raw formula. Only the string that reaches a chat formula bar is folded.
  const rollData = actor?.getRollData?.();
  return parts.map(p => `(${edhaFoldRiderFormula(p.formula, rollData)})[${p.name}]`).join(" + ");   // flavor-labeled terms
}

// The wrapper logic, shared by the libWrapper and manual-patch paths. (Deal-damage TRIGGERS are
// dispatched natively by the system's event engine off cosmere-rpg.damageRoll — not from here.)
function edhaWrapRollDamage(originalCall, options = {}) {
  /* R-71, RUNTIME half (item 69). The system rolls a talent's own `system.damage.formula` straight
   * off the field and prints it verbatim, so a rank/tier-scaled `(@tier)d(2 * @skills.blue.rank + 2)`
   * reached the chat card as `(2)d(2 * 3 + 2)` while the same talent's engine-rolled card (R-65,
   * `edhaRollFormula`) read `2d8`. Item 59's BUILD-time fold is a proven no-op on every current
   * formula — there is no actor at build time — so the fold happens HERE, with the roller's data in
   * hand, before the system builds its roll and before any rider joins onto the base. A formula that
   * is already plain resolves to itself and `options` is left untouched (byte-identical by design).
   * Generic: reads the document's field, never a talent's name. Pinned in tests/runtime-formula-fold. */
  try {
    const raw = options.overrideFormula ?? this.system?.damage?.formula;
    const rollData = this.actor?.getRollData?.();
    if (raw && rollData) {
      const folded = edhaFoldDieMath(Roll.replaceFormulaData(String(raw), rollData, { missing: "0" }));
      if (folded !== String(raw)) options = { ...options, overrideFormula: folded };
    }
  } catch (e) { /* never break a damage roll on a fold failure — the raw formula still rolls correctly */ }
  const bonus = edhaRiderBonus(this, this.actor);
  if (bonus) {
    const base = options.overrideFormula ?? this.system?.damage?.formula;
    if (base) options = { ...options, overrideFormula: `${base} + ${bonus}` };
  }
  /* DAMAGE-ROLL next-test mods (07-24x, Ben's q15(b) ruling to BUILD this rather than delete the
   * clause from the card). Pack Hunting's card offers its bonus on "your ally's attack OR damage
   * roll"; the next-test pipeline was registered on d20 contexts only, so the damage half was
   * unreachable and the card had been promising something impossible.
   *
   * Only mods that OPT IN (appliesTo damage|either) are eligible — every pre-07-24x consumer is
   * implicitly `test`, so this is inert for all of them. Consumed here rather than in a post-roll
   * hook because the formula has to be in the roll before it is evaluated. */
  try {
    const dmgMods = edhaNextTestDamageMods(this.actor, this).filter((m) => m?.formula);
    if (dmgMods.length) {
      const base = options.overrideFormula ?? this.system?.damage?.formula;
      // The claim is taken only where the bonus is actually APPLIED (07-27j) — claiming on a roll
      // with no damage formula would silently eat the d20 half's turn at it.
      const taken = base ? dmgMods.filter((m) => edhaNextModClaimOk(this.actor, m, "damage")) : [];
      if (taken.length) {   // item 49: several riders SUM onto the one damage roll
        // item 66: a NEGATIVE rider (`-1d6`) joins as an explicit, source-labelled subtraction; a
        // positive one joins exactly as before (`base + 1d6`, unlabelled — byte-identical by design).
        options = { ...options, overrideFormula: taken.reduce((f, m) => edhaJoinRiderTerm(f, m.formula, String(m.formula).trim().startsWith("-") ? (m.source || "Next-test mod") : null), base) };
        void edhaNextTestConsumeDamage(this.actor, taken);
      }
    }
  } catch (e) { /* never break a damage roll on a rider failure */ }
  // Sovereignty (Verdannis): a die-stepped roller (Exalted/Diminished) has its damage dice moved
  // along the d4–d12 ladder before the roll (riders included — they're the roller's own damage).
  const stepped = edhaSovStepOverride(this, options.overrideFormula ?? this.system?.damage?.formula);
  if (stepped) options = { ...options, overrideFormula: stepped };
  const result = originalCall(options);
  const item = this;
  try { Promise.resolve(result).then(() => { _edhaLastDealer = { actor: item.actor, item, type: item.system?.damage?.type, ts: Date.now() }; }).catch(() => {}); } catch (e) { /* non-fatal */ }
  return result;
}

Hooks.once("ready", async () => {
  // Wrap CosmereItem#rollDamage. Prefer libWrapper (update-resilient); fall back to a prototype patch.
  const ItemCls = CONFIG.Item?.documentClass;
  if (!ItemCls?.prototype?.rollDamage) {
    console.warn("Edha Content | CosmereItem#rollDamage not found — riders not wired.");
    return;
  }
  if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
    libWrapper.register("edha-content", "CONFIG.Item.documentClass.prototype.rollDamage",
      function (wrapped, options = {}) { return edhaWrapRollDamage.call(this, wrapped, options); }, "MIXED");
    console.log("Edha Content | damage riders wired via libWrapper.");
  } else {
    const orig = ItemCls.prototype.rollDamage;
    ItemCls.prototype.rollDamage = function (options = {}) {
      return edhaWrapRollDamage.call(this, (o) => orig.call(this, o), options);
    };
    console.log("Edha Content | damage riders wired via prototype patch (libWrapper not active).");
  }

  // GRAZE-CLONE GUARD (bench 07-17, Spearing Beak's dead icon — a FAMILY bug under system 2.1.0):
  // rollDamage clones the hit roll for graze ("@damage.dice" strips non-dice terms, incl. our
  // injected parenthetical rider), then DamageRoll#replaceDieResults copies die results by index
  // from the FULL hit roll into the SMALLER graze clone — the rider die overruns the clone's dice
  // array and the TypeError kills use() before any card posts. So EVERY rider-injected damage roll
  // (edha-damage-rider with a bonusFormula: Spearing Beak, Prognosis, Momentum's Edge, ...) died
  // silently on the sheet since the 2.1.0 upgrade. Guard: copy only into dice that exist — the
  // graze keeps mirroring the BASE damage dice, and the rider (a hit bonus) stays out of graze,
  // which is also the correct rule. Patched on the registered class so all entry points share it.
  try {
    const DR = (CONFIG.Dice?.rolls ?? []).find(r => typeof r?.prototype?.replaceDieResults === "function");
    if (DR && !DR.prototype.replaceDieResults._edhaGuarded) {
      const origRDR = DR.prototype.replaceDieResults;
      DR.prototype.replaceDieResults = function (sourceDicePool) {
        const have = this.dice?.length ?? 0;
        const pool = (sourceDicePool ?? []).slice(0, have);
        return origRDR.call(this, pool);
      };
      DR.prototype.replaceDieResults._edhaGuarded = true;
      console.log("Edha Content | DamageRoll graze-clone die-count guard installed.");
    } else if (!DR) {
      console.warn("Edha Content | DamageRoll.replaceDieResults not found — graze guard not installed (riders may crash rollDamage).");
    }
  } catch (e) { console.error("Edha Content | graze guard install failed", e); }
});

/* --- Kindle light: creatures you deal energy damage to shed light (5 ft) until end of scene --------
 * Driven by the talent's own `edha-damage-rider` rule: a rider with lightRadiusFt > 0 makes any
 * creature that takes that rider's damage type (from an owner of the rider) emit a flame light +
 * lose concealment. Wired by wrapping CosmereActor#applyDamage, so it catches bursts, chat-card
 * applies, and triggered damage alike.
 */
function edhaLightSpecFor(actor, dtype) {
  if (!actor?.items || !dtype) return null;
  for (const { handler: h } of edhaActorRulesOf(actor, "edha-damage-rider")) {
    const radiusFt = Number(h.lightRadiusFt) || 0;
    if (radiusFt > 0 && edhaRiderMatches(h.appliesTo, dtype)) return { radiusFt };
  }
  return null;
}
// Who dealt this damage? Trust an explicit source (burst / system originatingItem); else the recent
// damage-roll breadcrumb (type-matched, fresh); else the same heuristic the kill-trigger dispatch uses.
function edhaLightSource(options, dtype) {
  const test = (a) => { const a2 = a?.actor ?? a; const light = a2 ? edhaLightSpecFor(a2, dtype) : null; return light ? { actor: a2, light } : null; };
  if (options?.edhaSource) return test(options.edhaSource);                 // bursts — authoritative
  if (options?.originatingItem) return test(options.originatingItem.actor); // system apply — authoritative
  // 120s window (was 15s — Ben pass 3: Kindle's light never applied; at table pace the GM reads the
  // card before clicking Apply, and the breadcrumb had already expired).
  if (_edhaLastDealer && _edhaLastDealer.type === dtype && (Date.now() - _edhaLastDealer.ts) < 120000) { const h = test(_edhaLastDealer.actor); if (h) return h; }
  for (const a of edhaKillerCandidates()) { const h = test(a); if (h) return h; }
  return null;
}
async function edhaLightTokensOf(actor) {
  if (!actor) return [];
  if (actor.isToken && actor.token) return [actor.token];
  try { return actor.getActiveTokens?.(false, true) || []; } catch (e) { return []; }
}
async function edhaApplyKindleLight(targetActor, light) {
  try {
    const radius = Number(light?.radiusFt) || 5;
    for (const td of await edhaLightTokensOf(targetActor)) {
      if (!td?.update) continue;
      if (foundry.utils.getProperty(td, "flags.edha-content.kindleLit")) continue;   // already lit this scene
      const prev = td.light?.toObject ? td.light.toObject() : foundry.utils.deepClone(td.light ?? {});
      await td.update({
        light: { dim: radius, bright: Math.max(2.5, radius / 2), color: "#ff7a1a", alpha: 0.5, animation: { type: "flame", speed: 2, intensity: 2 } },
        "flags.edha-content.kindleLit": true,
        "flags.edha-content.kindleLightPrev": prev,
      });
    }
  } catch (e) { console.error("Edha Content | kindle light apply failed", e); }
}
// Restore the pre-Kindle light on every lit token (end of scene/encounter). GM-side.
async function edhaClearKindleLights(endedCombat) {
  try {
    if (!game.user?.isGM) { ui.notifications?.warn("Edha: clearing Kindle lights is GM-side."); return 0; }
    let n = 0;
    const guard = edhaCombatEndGuard(endedCombat);   // ⛑ cross-combat clobber guard
    for (const scene of game.scenes ?? []) {
      const updates = [];
      for (const td of scene.tokens) {
        if (!foundry.utils.getProperty(td, "flags.edha-content.kindleLit")) continue;
        if (edhaStillFightingElsewhere(td.actor, guard)) continue;   // lit for a combat that is still running
        const prev = foundry.utils.getProperty(td, "flags.edha-content.kindleLightPrev") ?? {};
        updates.push({ _id: td.id, light: prev, "flags.edha-content.-=kindleLit": null, "flags.edha-content.-=kindleLightPrev": null });
      }
      if (updates.length) { await scene.updateEmbeddedDocuments("Token", updates); n += updates.length; }
    }
    ui.notifications?.info(`Edha: cleared Kindle light from ${n} token(s).`);
    return n;
  } catch (e) { console.error("Edha Content | clear kindle lights failed", e); return 0; }
}
/* Apply-time state checks (v3; Isolated re-ruled 2026-07-05) --------------------------------------
 * Isolated = no living ally (same-disposition token) ADJACENT — within 5 ft, incl. diagonals — of the
 * victim's token (Ben's 07-05 ruling: text + engine + icon all say "within 5 feet"; the old 10 ft
 * center-to-center math played as adjacency-only at the table anyway).
 * Marked   = the victim carries an Edha status (diagnosed/insight) placed by an edha-apply-status
 *            rule; flags.edha-content.markedBy.{status} = { actorId, talent } names the marker owner.
 */
function edhaIsIsolated(actor, tok = null) {
  try {
    // Chaos (Maelith) — INFLICTED Isolation counts the same as positional. Positional marker icons
    // (flags.edha-content.isoMarker, placed by the sync below) are display-only and must NOT feed back.
    // edhaAllEffects (fix pass 5): `actor.statuses` is built from allApplicableEffects(), so a
    // trait-transferred `isolated` reads as ON the creature while being absent from actor.effects.
    // Read-only scan — the marker find/delete below stays actor-level on purpose (it owns what it
    // created, and deleting a yielded ITEM effect would strip the trait).
    for (const e of edhaAllEffects(actor))
      if (e.statuses?.has?.("isolated") && !e.getFlag?.("edha-content", "isoMarker")) return true;
    tok = tok ?? edhaCasterToken(actor) ?? (actor?.isToken ? actor.token?.object : null);
    if (!tok) return false;
    const disp = tok.document?.disposition; if (!Number.isFinite(disp)) return false;   // R-63: own side unresolvable → isolation is not judgeable
    return !(canvas?.tokens?.placeables ?? []).some(t =>
      t.id !== tok.id && t.actor
      && !edhaSideHostile(t.document?.disposition, disp)   // R-63: a neighbour whose side will not resolve is not PROVABLY an enemy, so it counts as company — this predicate gates a status APPLICATION, so it fails toward NOT isolated
      && (t.actor.system?.resources?.hea?.value ?? 1) > 0
      && edhaAdjacent(tok, t));
  } catch (e) { return false; }
}
/* --- ISOLATED marker sync (2026-07-05) -----------------------------------------------------------
 * "Sapping Hex works but the table can't SEE Isolated" (Ben). While a combat runs on the viewed scene,
 * the GM client keeps the registered `isolated` status icon in sync with POSITIONAL isolation for every
 * combatant: icon on when the creature has no living adjacent ally, off when it regains one. Marker
 * effects carry flags.edha-content.isoMarker so they never feed back into edhaIsIsolated (above) and
 * never collide with Maelith's INFLICTED Isolated (which has no isoMarker flag and is left alone).
 */
async function edhaSyncIsolatedMarkers() {
  try {
    if (!edhaDefBuffGmGate()) return;
    // ⛑ EVERY started combat on this scene, not just `game.combat` (07-28, the cross-combat family).
    // `game.combat` is the ACTIVE one; with a second combat running, every token in it read
    // `inCombat === false` and had its positional marker stripped by the other combat's ticks.
    const live = (game.combats ?? []).filter(c => c?.started && (!c.scene || c.scene.id === canvas?.scene?.id));
    for (const t of (canvas?.tokens?.placeables ?? [])) {
      const a = t.actor; if (!a) continue;
      const marker = a.effects?.find?.(e => e.getFlag?.("edha-content", "isoMarker"));
      const inCombat = live.some(c => (c.turns ?? []).some(x => (x.tokenId && x.tokenId === t.id) || x.actorId === a.id));
      const dead = (a.system?.resources?.hea?.value ?? 1) <= 0;
      const inflicted = edhaAllEffects(a).some(e => e.statuses?.has?.("isolated") && !e.getFlag?.("edha-content", "isoMarker"));   // must agree with edhaIsIsolated's scan (fix pass 5)
      const want = inCombat && !dead && !inflicted && edhaIsIsolated(a, t);
      if (want && !marker) {
        try {
          await a.createEmbeddedDocuments("ActiveEffect", [{
            name: "Isolated", img: EDHA_STATUSES.isolated.icon, statuses: ["isolated"],
            description: "<p>No ally within 5 feet (positional — auto-synced by the engine while combat runs).</p>",
            flags: { "edha-content": { isoMarker: true } },
          }]);
        } catch (e) { /* perms */ }
      } else if (!want && marker) {
        try { if (a.effects.get(marker.id)) await marker.delete(); } catch (e) {}
      }
    }
  } catch (e) { console.error("Edha Content | isolated marker sync failed", e); }
}
const edhaSyncIsolatedMarkersSoon = foundry.utils.debounce(() => { void edhaSyncIsolatedMarkers(); }, 250);
Hooks.on("updateToken", (doc, changes) => { try { if (("x" in changes) || ("y" in changes) || ("disposition" in changes)) edhaSyncIsolatedMarkersSoon(); } catch (e) {} });
Hooks.on("createToken",       () => edhaSyncIsolatedMarkersSoon());
Hooks.on("deleteToken",       () => edhaSyncIsolatedMarkersSoon());
Hooks.on("combatStart",       () => edhaSyncIsolatedMarkersSoon());
Hooks.on("combatTurnChange",  () => edhaSyncIsolatedMarkersSoon());
Hooks.on("deleteCombat",      () => edhaSyncIsolatedMarkersSoon());   // combat over → the pass strips every marker
Hooks.on("updateActor", (a, changes) => { try { if (foundry.utils.getProperty(changes, "system.resources.hea.value") !== undefined) edhaSyncIsolatedMarkersSoon(); } catch (e) {} });   // an ally dying (or reviving) changes neighbours' isolation
function edhaMarkOwner(victim, status) {
  try {
    const m = victim?.flags?.["edha-content"]?.markedBy?.[status];
    return m?.actorId ? { owner: game.actors?.get(m.actorId) ?? null, talent: m.talent || "" } : null;
  } catch (e) { return null; }
}
/* Was this application the GRAZE half of a damage card? (item 56 / R-14, 2026-09-06.) The system
 * decides hit-vs-graze on the CHAT MESSAGE (`CosmereChatMessage#useGraze`, toggled on the card) and
 * calls `actor.applyDamage(instances, { originatingItem })` with no marker — the graze total arrives
 * as a plain number. So the discriminator is a breadcrumb stamped by the `onClickApplyButton` wrap
 * (below, at ready) for the lifetime of that click, and every engine caller may say it outright
 * with `options.edhaGraze`. Read it SYNCHRONOUSLY at the top of edhaWrapApplyDamage — the post-pass
 * runs after awaits, by which time the click (and its breadcrumb) may be over. */
let _edhaApplyGrazeCtx = null;   // { graze: boolean } while a damage-card Apply click is running
function edhaApplyIsGraze(options) {
  if (options?.edhaGraze === true) return true;
  if (options?.edhaGraze === false) return false;
  return _edhaApplyGrazeCtx?.graze === true;
}
async function edhaWrapApplyClick(originalCall, event, forceRolls) {
  _edhaApplyGrazeCtx = { graze: this?.useGraze === true };
  try { return await originalCall(event, forceRolls); }
  finally { _edhaApplyGrazeCtx = null; }
}
Hooks.once("ready", () => {
  try {
    const MsgCls = CONFIG.ChatMessage?.documentClass;
    if (typeof MsgCls?.prototype?.onClickApplyButton !== "function") { console.warn("Edha Content | CosmereChatMessage#onClickApplyButton not found — graze-aware riders fall back to hit behaviour."); return; }
    if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
      libWrapper.register("edha-content", "CONFIG.ChatMessage.documentClass.prototype.onClickApplyButton",
        function (wrapped, event, forceRolls = null) { return edhaWrapApplyClick.call(this, wrapped, event, forceRolls); }, "MIXED");
    } else {
      const orig = MsgCls.prototype.onClickApplyButton;
      MsgCls.prototype.onClickApplyButton = function (event, forceRolls = null) { return edhaWrapApplyClick.call(this, (e, f) => orig.call(this, e, f), event, forceRolls); };
    }
    console.log("Edha Content | damage-card Apply click wrapped (graze discriminator).");
  } catch (e) { console.error("Edha Content | onClickApplyButton wrap failed", e); }
});
// Who dealt this application? (authoritative options first, else the fresh rollDamage breadcrumb)
function edhaDealerOf(options) {
  const a = options?.edhaSource?.actor ?? options?.edhaSource ?? options?.originatingItem?.actor ?? null;
  if (a) return { actor: a, item: options?.originatingItem ?? null };
  if (_edhaLastDealer && (Date.now() - _edhaLastDealer.ts) < 15000) return { actor: _edhaLastDealer.actor, item: _edhaLastDealer.item ?? null };
  return null;
}
// Melee-vs-ranged discriminator (shared primitive): classify the dealing item so "melee only" riders
// can stand down on a definitive ranged attack. Returns "melee" | "ranged" | null; null = can't tell
// → consumers keep today's owner-judged behavior (fire + the GM-withhold note). Reads, in order: an
// explicit flags.edha-content.attackKind stamp (edhaSummon bakes one onto its attack weapon), then a
// weapon's system.attack.type — the cosmere 2.1.0 discriminator ("melee"/"ranged", schema initial
// "melee"), verified against the system SCHEMA$i AttackingItemMixin AND live at bench run 3
// (2026-07-26k defect 7: the old read was `system.range`, a field the DataModel strips, so EVERY
// weapon returned null and every meleeOnly/rangedOnly gate was inert). system.attack.range {value}
// is the tiebreak only when type is absent (schema drift). Thrown/reach is partial BY DESIGN — a
// thrown melee weapon reads "melee" and the owner judges.
function edhaAttackKind(item) {
  try {
    if (!item) return null;
    const stamped = item.flags?.["edha-content"]?.attackKind;
    if (stamped === "melee" || stamped === "ranged") return stamped;
    if (item.type !== "weapon") return null;
    const t = String(item.system?.attack?.type ?? "").toLowerCase();
    if (t === "melee" || t === "ranged") return t;
    const r = item.system?.attack?.range;
    if (r == null) return null;                             // schema drift — owner judges
    return (Number(r?.value) > 0) ? "ranged" : "melee";
  } catch (e) { return null; }
}
// First rule of the given handler type across an actor's rule-bearing items → { item, handler } | null.
// Rule bearers = talents + weapons (edhaRuleBearer, item 34a): the migrated adversary attacks carry
// their riders on the weapon document, and an edhaIsTalent gate here would drop them silently.
function edhaActorRuleOf(actor, type) {
  for (const tal of (actor?.items ?? [])) {
    if (!edhaRuleBearer(tal)) continue;
    const h = edhaRuleOf(tal, type);
    if (h) return { item: tal, handler: h };
  }
  return null;
}
/* ALL rules of the given handler type across an actor's talents, in item order → [{ item, handler }].
 * ENGINE PASS 5.2 (2026-08-10): the plural half of edhaActorRuleOf, built to retire the 27
 * open-coded `for (tal of actor.items) { if (!edhaIsTalent) continue; for (rule of
 * edhaEventRules(tal)) { if (h?.type !== "X") continue; ... } }` sweeps that had grown their own
 * copy of this exact double loop. A talent carrying two rules of the SAME handler type (rare, but
 * not schema-forbidden) yields two entries here — matching what the hand-rolled sweeps already did,
 * since they iterated `edhaEventRules(tal)` (every rule) rather than stopping at one per item. */
function edhaActorRulesOf(actor, type) {
  const out = [];
  for (const tal of (actor?.items ?? [])) {
    if (!edhaRuleBearer(tal)) continue;   // talents + weapons — see edhaRuleBearer (item 34a)
    for (const rule of edhaEventRules(tal)) {
      if (rule?.handler?.type === type) out.push({ item: tal, handler: rule.handler });
    }
  }
  return out;
}
/* `edha-damage-bonus` placeCounter queue (07-25 pass 2bT): a bonus rule that also PLACES counter
 * points (Predatory Strike's 1 Insight, the armed pack riders' first-hit point) must write AFTER the
 * damage lands, so the pre-pass queues the write and the post-pass below drains it — the generic
 * form of the retired `_edhaGnosisPredatoryHit` breadcrumb. */
let _edhaBonusPlaceQueue = [];
/* The armed-hit OUTCOME queue (07-25 pass 2bU): a consumed armed-self-status rule with kill/survive
 * riders (Warlord's Advance) resolves them here, where the HP crossing is knowable. */
let _edhaBonusOutcomeQueue = [];
async function edhaDamageBonusPost(dealer, target, prevHp = null) {
  try {
    const now = Date.now();
    const q = _edhaBonusPlaceQueue; _edhaBonusPlaceQueue = [];
    for (const e of q) {
      if (e.targetUuid !== target.uuid || now - e.ts > 15000) continue;
      const owner = e.owner; if (!owner) continue;
      if (e.placeOnce === "round") {
        if (!edhaTriggerAllowed(owner, e.itemName, { oncePerRound: true })) continue;
        await edhaMarkTriggerUsed(owner, e.itemName, { oncePerRound: true });
      }
      /* kind "list" (2bX — `placeList`): the victim joins the owner's SUSTAINED ledger, not a
       * counter. Mark FIRST, commit once it landed (the 07-24v H3 ordering); evicted entries
       * unmark; a creature already on the list is never double-marked. */
      if (e.kind === "list") {
        await edhaOwnerListQueue(owner, e.key, async () => {   // queued RMW (07-26n) — fresh read inside
          const cur = edhaOwnerList(owner, e.key, e.status);
          if (cur.some(x => x.uuid === target.uuid)) return;
          const mark = { actorId: owner.id, talent: e.itemName };
          if (!(await edhaWriteStatusMark(target, e.status, mark))) return;   // Job 6b: shared body (warns on no-GM)
          const entry = { id: foundry.utils.randomID(), uuid: target.uuid, name: target.name, talent: e.itemName };
          const res = edhaListPush(cur, entry, { cap: e.cap, evict: "oldest" });
          await edhaSetOwnerList(owner, e.key, res.list);
          for (const ev2 of res.evicted) await edhaListUnmark(ev2, e.status, { key: e.key, ownerId: owner.id });
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<p>🎯 <strong>${e.itemName}</strong>: <strong>${target.name}</strong> bears your ${edhaConditionLabel(e.status) || e.status} (${res.list.length}/${e.cap}).</p>` });
        });
        continue;
      }
      const n = await edhaCounterAdd(owner, target, e.place, { key: e.key, status: e.status, cap: e.cap, talent: e.itemName });
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>📖 <strong>${e.itemName}</strong>: ${e.place} ${edhaConditionLabel(e.status) || e.status} placed on ${target.name} (now <strong>${n}</strong>).</p>` });
    }
    const hp = Number(target?.system?.resources?.hea?.value) || 0;
    const oq = _edhaBonusOutcomeQueue; _edhaBonusOutcomeQueue = [];
    for (const e of oq) {
      if (e.targetUuid !== target.uuid || now - e.ts > 15000) continue;
      const owner = e.owner; if (!owner) continue;
      const killed = prevHp != null && prevHp > 0 && hp <= 0;
      const say = (html) => ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-burst-card"><p>👑 <strong>${e.itemName}</strong>: ${html}</p></div>` });
      if (killed) {
        if (!e.onKillThpFormula && !e.onKillNote) continue;
        const thp = Math.max(0, Math.floor(edhaEvalSync(e.onKillThpFormula || "0", owner.getRollData?.() ?? {})));
        if (thp > 0) await edhaGrantTempHpCross(owner, thp, e.itemName);
        say(`${target.name} falls${thp > 0 ? ` — ${owner.name} gains <strong>${thp}</strong> Temp HP` : ""}.${e.onKillNote ? ` ${String(e.onKillNote).split("{name}").join(target.name)}` : ""}`);
      } else {
        if (!e.onSurviveAdvAttr && !e.onSurviveNote) continue;
        if (e.onSurviveAdvAttr) await edhaSetNextTestMod(owner, { mode: "advantage", attr: e.onSurviveAdvAttr, count: 1, targetUuid: target.uuid, source: e.itemName });
        say(`${target.name} survives.${e.onSurviveNote ? ` ${String(e.onSurviveNote).split("{name}").join(target.name)}` : ""}`);
      }
    }
    /* The kill tally (2bU — Warlord's Fury): any dealer rule with tallyKills whose arming status
     * holds counts hostile non-summon NPC crossings — below-half once per victim, +1 per kill (one
     * blow can do both; Ben R7). Keyed per RULE ITEM, so two tally talents never share a count. */
    if (prevHp != null && dealer?.actor && target !== dealer.actor && target.type !== "character"
        && !target.getFlag?.("edha-content", "summon") && edhaDisposHostile(dealer.actor, target)) {
      const hea = target?.system?.resources?.hea;
      const maxHp = Number(hea?.max?.value ?? hea?.max) || 0;
      for (const { item: tal, handler: h } of edhaActorRulesOf(dealer.actor, "edha-damage-bonus")) {
          if (h.tallyKills !== true) continue;
          if (h.requireSelfStatus && !dealer.actor.statuses?.has?.(h.requireSelfStatus)) continue;
          const rec = foundry.utils.deepClone(dealer.actor.getFlag?.("edha-content", `bonusTally.${tal.id}`) ?? { belowHalf: [], kills: 0 });
          rec.belowHalf = rec.belowHalf || []; rec.kills = Number(rec.kills) || 0;
          let changed = false;
          if (maxHp > 0 && prevHp > maxHp / 2 && hp <= maxHp / 2 && !rec.belowHalf.includes(target.id)) { rec.belowHalf.push(target.id); changed = true; }
          if (prevHp > 0 && hp <= 0) { rec.kills += 1; changed = true; }
          if (changed) {
            try { await dealer.actor.setFlag("edha-content", `bonusTally.${tal.id}`, rec); } catch (e) {}
            ChatMessage.create({ whisper: edhaWhisperIds(dealer.actor), speaker: ChatMessage.getSpeaker({ actor: dealer.actor }),
              content: `<p>🗡️ <strong>${tal.name}</strong>: the tally rises — now <strong>${rec.belowHalf.length + rec.kills}</strong> (the formula caps it).</p>` });
          }
      }
    }
  } catch (e) { console.error("Edha Content | damage-bonus post-pass failed", e); }
}
function edhaWrapApplyDamage(originalCall, instances, options = {}) {
  const target = this;
  const list = (Array.isArray(instances) ? instances : [instances]).filter(Boolean);
  const graze = edhaApplyIsGraze(options);   // item 56 / R-14: read NOW — the click breadcrumb is gone by the post-pass
  let prevHp = null, maxHp = null, halfNote = null;
  try {
    const hea = target?.system?.resources?.hea;
    prevHp = Number(hea?.value) || 0;
    maxHp = Number(hea?.max?.value ?? hea?.max) || 0;
    // Necrotic Grasp: halve healing to a heal-cut-marked target BEFORE it lands.
    const hcf = edhaHealCutFactor(target);
    if (hcf != null) {
      let cut = false;
      for (const inst of list) if (inst.type === "heal" && Number(inst.amount) > 0) { inst.amount = Math.max(0, Math.floor(Number(inst.amount) * hcf)); cut = true; }
      if (cut) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🩸 <strong>${target.name}</strong> ${hcf === 0 ? "cannot regain HP (Withering Touch)" : "has their healing halved (Necrotic Grasp)"}.</p>` });
    }
    // PASSIVE pre-reductions (synchronous — must land before apply; dice roll via evaluateSync).
    // H27 `edha-damage-reduce` (07-25, iron rule 2b): the Shield Wall / Devoted Conduit name loops
    // became a rule sweep — the gates and the amount ride each talent's document; this pass only
    // announces. W29 (ruling 113) + ruling 122 still hold: adversary owners ride the same sweep
    // (edhaWatchersOfRule covers canvas adversaries too), `@colorRank` substitutes the ROLE rank for
    // an adversary and the skill rank for a PC (edhaColorRank), `@tier` substitutes system.tier.
    // First qualifying owner per TALENT wins, exactly as the retired loops' `break` had it.
    try {
      const vtok = edhaCasterToken(target);
      if (vtok && list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) {
        let reduce = 0; const why = []; const doneNames = new Set();
        for (const { actor: owner, item: tal, handler: h } of edhaWatchersOfRule("edha-damage-reduce")) {
          try {
            if (owner === target || doneNames.has(tal.name)) continue;
            if (String(h.when || "damaged") === "redirected" && !options?.edhaRedirected) continue;
            const otok = edhaCasterToken(owner);
            if (!edhaSameDisposition(owner, vtok)) continue;   // R-63: routed through the shared helper (Number.isFinite fail-closed) — 🤖 bench row
            if (h.requireVictimAdjacent && !edhaAdjacent(otok, vtok)) continue;
            if (h.rangeColor && !edhaAllyInAttune(owner, vtok, h.rangeColor)) continue;
            const needAllies = Number(h.requireAdjacentAllies) || 0;
            if (needAllies > 0 && edhaAdjacentAllies(otok).length < needAllies) continue;
            doneNames.add(tal.name);
            const tier = Number(owner.system?.tier) || 1;
            const rank = h.color ? (edhaColorRank(owner, h.color) || 1) : 1;
            const f = edhaSubstRankTier(h.amountFormula || "0", rank, tier);
            const amt = Math.floor(edhaEvalSync(f, owner.getRollData()));
            if (amt > 0) { reduce += amt; why.push(`${tal.name} (${owner.name})`); }
          } catch (e) { console.error(`Edha Content | edha-damage-reduce (${tal?.name}) failed`, e); }
        }
        if (reduce > 0) {
          const done = edhaReduceInstances(list, reduce);
          if (done > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🛡️ <strong>${target.name}</strong>'s damage reduced by <strong>${done}</strong> — ${why.join(", ")}.</p>` });
        }
      }
      edhaLifeDeflectReduce(target, list);   // LIFE / Anaveth — Dense Tissue / Apex Form +Deflect (deflectable types)
    edhaMarkedNearZonesBonus(target, list); // marked-foe-near-my-zones rider (`edha-snare-react` offer-mark rules — 2bX; was the name-keyed Hexmark call)
    } catch (e) { console.error("Edha Content | Bulwark pre-reduce failed", e); }
    const dealer = edhaDealerOf(options);
    const dealing = list.some(i => (Number(i?.amount) > 0) && i?.type && i.type !== "heal");
    if (dealing && dealer?.actor && dealer.actor !== target) {
      // Severance-style damage CONVERSION: dealer owns an edha-damage-convert rule and the victim is
      // Isolated → instances change type (e.g. → vital, which bypasses default Deflect) BEFORE apply.
      const conv = edhaActorRuleOf(dealer.actor, "edha-damage-convert");
      if (conv?.handler && (!conv.handler.whenTargetIsolated || edhaIsIsolated(target))) {
        const to = conv.handler.toType || "vital";
        const changed = [];
        for (const inst of list) if (inst.type && inst.type !== "heal" && inst.type !== to) { changed.push(inst.type); inst.type = to; }
        if (changed.length) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🗡️ <strong>${conv.item.name}</strong>: ${target.name} is Isolated — ${changed.join("/")} damage becomes <strong>${to}</strong>.</p>` });
      }
      // Marked-target bonus damage (Vital Diagnosis: "+Tier vital vs the Diagnosed creature", any ally):
      // the victim's mark names its owner; the owner's edha-apply-status rule carries the bonus.
      for (const status of (target?.statuses ?? [])) {
        const mk = edhaMarkOwner(target, status);
        if (!mk?.owner) continue;
        const rule = edhaActorRuleOf(mk.owner, "edha-apply-status");
        const h = rule?.handler;
        if (!h || h.status !== status || !h.bonusDamageFormula) continue;
        const amt = edhaEvalSync(h.bonusDamageFormula, mk.owner.getRollData());
        if (amt > 0) {
          list.push({ amount: amt, type: h.bonusDamageType || "vital" });
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🎯 <strong>${rule.item.name}</strong> (${mk.owner.name}): +${amt} ${h.bonusDamageType || "vital"} vs the ${edhaConditionLabel(status)} target.</p>` });
        }
      }
      // Dealer-side passive bonus damage (`edha-damage-bonus`, 07-25 pass 2bS — was the name-keyed
      // GREEN/INSTINCT pre-pass pair; widened 2bT for the KNOWLEDGE dealer riders). Added to the
      // single apply, no recursion; the gate and the amount ride the dealer's own documents.
      // `@hunters` = how many different attackers hit this victim this round (the focus-fire
      // tracker); `@colorRank` per ruling 122; `@counter` = the rule owner's counter count on the
      // victim (0 unless the victim IS their bearer). 2bT require modes: "armed-self-status"
      // (Predatory Strike — consumes the arming status on the hit, then placeCounter queues the
      // post-apply counter write) and "self-hits-counter-bearer" (Hunter's Discipline).
      const dealtType0 = list.find(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")?.type || "energy";
      const runBonusRule = (ruleOwner, tal, h) => {
        try {
          let hunters = 0;
          const req = String(h.require || "window");
          if (req === "pack-on-target") {
            const vtok3 = edhaCasterToken(target);
            const otok3 = edhaCasterToken(ruleOwner);
            if (!vtok3 || !otok3) return;
            const atk = edhaFocusFireSet(vtok3);
            const ally = [...atk].some(id => {
              const t = canvas?.tokens?.get(id); if (!t || t.id === otok3.id) return false;
              // R-63: Number.isFinite fail-closed (was `?? 1`, defaulting an unresolvable side to FRIENDLY) — 🤖 bench row
              const td = t.document?.disposition, od = otok3.document?.disposition;
              return Number.isFinite(td) && Number.isFinite(od) && td === od;
            });
            if (!atk.has(otok3.id) || !ally) return;
            hunters = atk.size;
          } else if (req === "window") {
            if (!edhaStrikeWindowActive(ruleOwner)) return;
          } else if (req === "armed-self-status") {
            if (!h.requireSelfStatus || !ruleOwner.statuses?.has?.(h.requireSelfStatus)) return;
            if (h.weaponOnly && dealer.item?.type !== "weapon") return;
            // Melee gate BEFORE the consume: a definitively ranged hit stands down and the arm
            // SURVIVES (Warlord's Advance, 2bU); unknown = owner-judged, fires as before.
            if (h.meleeOnly && edhaAttackKind(dealer.item) === "ranged") return;
            // …and the mirror (2bX — Tagging Shot): a definitively melee hit stands down, arm survives.
            if (h.rangedOnly && edhaAttackKind(dealer.item) === "melee") return;
            if (h.consumeSelfStatus) {
              void edhaToggleStatus(ruleOwner, h.requireSelfStatus, false);
              // The consumed armed hit may carry kill/survive riders — resolved post-apply, where
              // the HP crossing is knowable (edhaDamageBonusPost drains this).
              if (h.onKillThpFormula || h.onSurviveAdvAttr || h.onKillNote || h.onSurviveNote) {
                _edhaBonusOutcomeQueue.push({ owner: ruleOwner, itemName: tal.name, targetUuid: target.uuid,
                  onKillThpFormula: h.onKillThpFormula || "", onKillNote: h.onKillNote || "",
                  onSurviveAdvAttr: h.onSurviveAdvAttr || "", onSurviveNote: h.onSurviveNote || "", ts: Date.now() });
              }
            }
          } else if (req === "self-hits-counter-bearer") {
            const key = String(h.counterStatus || "insight").trim();
            if (!edhaCounterIsBearer(ruleOwner, key, target)) return;
          } else if (req === "ally-hits-counter-bearer") {
            // The rule owner is NOT the dealer: an ally's hit on the owner's bearer, in the owner's range.
            if (ruleOwner === dealer.actor) return;
            if (h.requireSelfStatus && !ruleOwner.statuses?.has?.(h.requireSelfStatus)) return;
            const key = String(h.counterStatus || "insight").trim();
            if (!edhaCounterIsBearer(ruleOwner, key, target)) return;
            const dtok = edhaCasterToken(dealer.actor);
            if (!dtok || !edhaAllyInAttune(ruleOwner, dtok, h.color || "green")) return;
          } else if (req === "list-member-hits") {
            // 2bV (Concord): a creature on MY sustained ledger hits an enemy of mine while I am armed.
            if (ruleOwner === dealer.actor) return;                        // "each Covenant ALLY" — not the lawgiver
            if (h.requireSelfStatus && !ruleOwner.statuses?.has?.(h.requireSelfStatus)) return;
            const lkey = String(h.listName || "").trim(); if (!lkey) return;
            if (!edhaOwnerList(ruleOwner, lkey, String(h.listStatus || lkey).trim()).some(e => e.uuid === dealer.actor.uuid)) return;
            if (!edhaDisposHostile(ruleOwner, target)) return;             // an attack ON AN ENEMY
            if (h.oncePerRoundPerDealer) {                                 // per-dealer budget — checked LAST (it mutates)
              const okey = `${tal.id}:${dealer.actor.id}`; const spec = { oncePerRound: true };
              if (!edhaTriggerAllowed(ruleOwner, okey, spec)) return;
              void edhaMarkTriggerUsed(ruleOwner, okey, spec);
            }
          } else if (req === "summon-hits") {
            // 2bV (Tempered Edge): MY summon's own hit — the dealer is a summon whose summoner is me.
            const c = dealer.actor;
            if (!c?.getFlag?.("edha-content", "summon") || c.getFlag?.("edha-content", "summoner") !== ruleOwner.id) return;
            if (h.whenDealerItem && String(dealer.item?.name || "") !== String(h.whenDealerItem)) return;
          }
          const key = String(h.counterStatus || "insight").trim();
          const tallyRec = h.tallyKills ? (ruleOwner.getFlag?.("edha-content", `bonusTally.${tal.id}`) ?? null) : null;
          const f = edhaSubstRankTier(h.amountFormula || "0", h.color ? (edhaColorRank(ruleOwner, h.color) || 1) : 1, Number(ruleOwner.system?.tier) || 1)
            .replace(/@hunters\b/g, String(hunters))
            .replace(/@tally\b/g, String((tallyRec?.belowHalf?.length || 0) + (Number(tallyRec?.kills) || 0)))
            .replace(/@counter\b/g, String(edhaCounterOn(ruleOwner, key, target, key)));
          const amt = Math.max(0, Math.floor(edhaEvalSync(f, ruleOwner.getRollData())));
          const dtype = h.damageType || dealtType0;
          /* Ignore-deflect = bump the hit by the target's deflect (the Pinpoint-Charge fact; 2bV).
           * ⚠ The system's calc line will STILL print "… − ${defl}" — deflect is applied to the
           * summed instances and this bump pre-pays it, so the NET equals base + rider with the
           * deflect ignored. Bench run 3 (2bAD-2) read that calc line as the mechanic failing;
           * verified 2026-07-26l against the system's applyDamage (damageIgnore + max(0,
           * damageDeflect − deflect)): the bump lands in the same list the wrap hands to the
           * original call. WORKS AS DESIGNED — the card below now SAYS so, which is the fix. */
          const defl = h.addTargetDeflect ? (Number(target?.system?.deflect?.value) || 0) : 0;
          if (defl > 0) list.push({ amount: defl, type: "impact" });
          const deflNote = defl > 0 ? ` and the hit ignores ${target.name}'s deflect <span style="opacity:.8">(+${defl} added here pre-pays the −${defl} the system's calc line will show — the net is the full hit)</span>` : "";
          if (amt > 0) {
            list.push({ amount: amt, type: dtype });
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ruleOwner }), content: `<p>🐺 <strong>${tal.name}</strong> (${ruleOwner.name}): +${amt} ${dtype}${deflNote}${hunters ? ` (${hunters} hunters on ${target.name})` : ruleOwner === dealer.actor ? " strike" : ` on ${dealer.actor.name}'s hit`}.</p>` });
          } else if (defl > 0) {
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ruleOwner }), content: `<p>🐺 <strong>${tal.name}</strong> (${ruleOwner.name}): the hit ignores ${target.name}'s deflect <span style="opacity:.8">(+${defl} added here pre-pays the −${defl} the system's calc line will show)</span>.</p>` });
          }
          // Heal-cut rider (2bW — Withering Touch): the qualifying hit also blocks/halves the
          // victim's healing until the end of the rule owner's next turn (Temp HP still lands).
          const hcf = String(h.healCutFraction ?? "").trim();
          if (hcf !== "") {
            const frac = Math.max(0, Math.min(1, Number(hcf) || 0));
            void edhaApplyHealCut(target, ruleOwner, frac, tal.name);
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ruleOwner }), content: `<p>🥀 <strong>${tal.name}</strong>: ${target.name} ${frac === 0 ? "cannot regain HP" : "has healing reduced"} until the end of ${ruleOwner.name}'s next turn.</p>` });
          }
          // Counter placement is a POST-apply write (the hit must land first) — queue it for
          // edhaDamageBonusPost. `placeOnce: round` is the first-ally-to-hit gate (Ben R11:
          // per-talent, tracked independently).
          /* NOT conditional on the numeric bonus (07-27h ruling default — run 8 sighting 1): the
           * require-gates above are the real filter. The Pack's card places 1 Insight on the first
           * ally hit each round UNCONDITIONALLY, but its `+@counter` reads 0 whenever the bearer's
           * marker was cleared outside the engine (token-HUD toggle, the sheet's own stack-cycle
           * down to 0, a hand-deleted effect) — all of which leave the owner's bearer POINTER set.
           * The old `amt > 0 || req === "armed-self-status"` gate therefore made the talent place
           * nothing in precisely the state it exists to recover from. */
          if (Number(h.placeCounter) > 0) {
            _edhaBonusPlaceQueue.push({ owner: ruleOwner, itemName: tal.name, targetUuid: target.uuid,
              place: Number(h.placeCounter), placeOnce: h.placeOnce || "no", key, status: key,
              cap: edhaListCap(ruleOwner, h.capFormula || "5"), ts: Date.now() });
          }
          /* Sustained-LEDGER placement is a post-apply write too (2bX — Tagging Shot's quarry
           * mark): the victim joins the rule owner's ledger at the rule's cap (oldest fizzles),
           * follows the creature (no sceneId), and fires at +0 bonus too — same reasoning as the
           * placeCounter gate directly above (07-27h). */
          if (h.placeList) {
            _edhaBonusPlaceQueue.push({ owner: ruleOwner, itemName: tal.name, targetUuid: target.uuid,
              kind: "list", key: String(h.placeList).trim(), status: String(h.placeListStatus || h.placeList).trim(),
              cap: edhaListCap(ruleOwner, h.placeListCapFormula || "1"), placeOnce: h.placeOnce || "no", ts: Date.now() });
          }
        } catch (e) { console.error(`Edha Content | edha-damage-bonus (${tal?.name}) failed`, e); }
      };
      // The three CROSS-ACTOR require modes ride the arming owner's document, not the dealer's —
      // the dealer walk below must skip them and the scene sweep must carry them (2bT; +2 in 2bV).
      const crossModes = ["ally-hits-counter-bearer", "list-member-hits", "summon-hits"];
      for (const { item: tal, handler: h } of edhaActorRulesOf(dealer.actor, "edha-damage-bonus")) {
          if (crossModes.includes(String(h.require || "window"))) continue;
          runBonusRule(dealer.actor, tal, h);
      }
      // The cross-actor sweep (2bT): rules that ride SOMEONE ELSE's hit live on the arming owner's
      // document, so the dealer's item walk above can never see them — sweep the scene's rules
      // (memoized, name-free — the H8 idiom) for the require modes that are cross-actor.
      for (const w of edhaWatchersOfRule("edha-damage-bonus")) {
        if (!crossModes.includes(String(w.handler?.require || "window"))) continue;
        runBonusRule(w.actor, w.item, w.handler);
      }
      edhaLifeOutgoingBonus(dealer.actor, list, dealer.item, graze);   // LIFE / Anaveth — Bone Spurs (+keen, melee-gated) / Apex Form (+vital) on the buffed creature's hit; each rider's own onGraze dial decides the graze half (R-14)
      // (Tempered Edge + Concord ride the generic edha-damage-bonus sweep above since 2bV.)
      edhaOrderDealerPre(dealer, target, list);    // ORDER / Tessavain — the Covenant-break watch
    }
  } catch (e) { console.error("Edha Content | applyDamage pre-pass failed", e); }
  const result = originalCall(list, options);
  try {
    Promise.resolve(result).then(async () => {
      // DEATH / Morrath — Death Ward: the first lethal drop lands on 1 HP + Temp HP instead (see the Death section).
      await edhaDeathWardCheck(target, prevHp);
      // Kindle light (any damaging instance whose dealer has a light rider)
      for (const inst of list) {
        if (!(Number(inst?.amount) > 0) || !inst?.type || inst.type === "heal") continue;
        const src = edhaLightSource(options, inst.type);
        if (src) { void edhaApplyKindleLight(target, src.light); break; }
      }
      const dealer = edhaDealerOf(options);
      // Heal-overflow → Temp HP (Life Surge / Overgrowth): the healing talent carries an
      // edha-overflow-thp rule; overflow = (prev HP + heal) − max HP, set as Edha Temp HP.
      const healAmt = list.filter(i => i?.type === "heal").reduce((s, i) => s + Math.abs(Number(i.amount) || 0), 0);
      if (healAmt > 0 && maxHp > 0 && dealer?.item && edhaRuleOf(dealer.item, "edha-overflow-thp")) {
        const overflow = Math.max(0, prevHp + healAmt - maxHp);
        if (overflow > 0) {
          await edhaWriteTempHp(target, overflow, dealer.item.name);
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>💚 <strong>${dealer.item.name}</strong> overflow: ${target.name} gains <strong>${overflow}</strong> Temp HP.</p>` });
        }
      }
      // On-heal reactions (`edha-heal-react`, 07-25 pass 2bS): the healer's own rules decide —
      // the Green colour gate rides each rule now, not this chokepoint.
      if (healAmt > 0 && dealer?.actor && dealer.item)
        await edhaDispatchHealReact(dealer.actor, dealer.item, target, healAmt, prevHp);
      // Deflect rider (Overgrowth, Life/Anaveth 07-12): the healed creature grows natural armor —
      // +1 Deflect, stacking to the rule's cap, until combat ends. 07-25 pass 2bS: the
      // `deflectStackMax` FIELD is the discriminator now, not the talent's name — Life Surge
      // carries the identical overflow rule and grants no Deflect, which is why deleting the old
      // name check outright would have shipped a bug (ENGINE_INDEX / pass M).
      if (healAmt > 0 && dealer?.item) {
        const ot = edhaRuleOf(dealer.item, "edha-overflow-thp");
        if (ot && Number(ot.deflectStackMax) > 0) await edhaOvergrowthDeflectStack(target, dealer.item.name, Number(ot.deflectStackMax));
      }
      const dealt = list.some(i => (Number(i?.amount) > 0) && i?.type && i.type !== "heal");
      // ON-HIT (real hit) dealer-side effects — Black/Ritual + retrofitted Isolation triggers.
      if (dealt && dealer?.actor && dealer.actor !== target) {
        await edhaDispatchOnHit(dealer, target, list);   // Sapping Hex, Predatory Patience, Dark Investiture
        // (Withering Touch's armed strike rides the generic edha-damage-bonus armed-self-status
        // mode + healCutFraction since 2bW — edhaWitherStrike is gone.)
        // Necrotic Grasp: on a Black-talent hit, halve the target's healing (end of owner's next turn).
        const hc = edhaActorRuleOf(dealer.actor, "edha-heal-cut");
        if (hc?.handler) {
          const color = hc.handler.color || "black";
          if (!color || edhaTalentColor(dealer.item) === color) {
            // `fraction: 0` = CANNOT REGAIN HP AT ALL — edhaHealCutInfo implements it (`fraction === 0`
            // → "full"), and the sibling `healCutFraction` writer preserves it. `|| 0.5` halved instead.
            await edhaApplyHealCut(target, dealer.actor, edhaNumOr(hc.handler.fraction, 0.5), hc.item.name);
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: dealer.actor }), content: `<p>🩸 <strong>${hc.item.name}</strong>: ${target.name}'s healing is halved until the end of ${dealer.actor.name}'s next turn.</p>` });
          }
        }
        await edhaLifeVenomOnHit(dealer.actor, target, dealer.item, graze);   // LIFE / Anaveth — Venom Glands (melee-gated) afflicts the foe on the buffed creature's hit (its onGraze dial decides the graze half — R-14)
        await edhaCivConstructHitRiders(dealer, target, prevHp);   // CIVILIZATION / Kethane — Magnum Opus Colossus splash + Arsenal kill-chase prompt
        await edhaDamageBonusPost(dealer, target, prevHp);   // drains the placeCounter + armed-outcome queues, feeds the kill tally (2bT/2bU)
      }
      if (dealt) await edhaLifeRegenEndOnDamage(target, list);   // LIFE / Anaveth — Primal Regeneration ends on Vital/Spirit damage
      if (dealt) await edhaSenseRevealOnDamage(target, list);    // edha-sense-reveal recovery riders (Void Sense's 1 Inv — rule-driven since 2bU)
      // Marked-damage triggers (Prognosis / Gnothis Insight regen): the mark's owner recovers a
      // resource when the marked creature takes damage from ANY source (once per round).
      if (dealt) {
        for (const status of (target?.statuses ?? [])) {
          const mk = edhaMarkOwner(target, status);
          if (!mk?.owner) continue;
          const rule = edhaActorRuleOf(mk.owner, "edha-marked-damage-trigger");
          const h = rule?.handler;
          if (!h || h.status !== status) continue;
          const spec = { oncePerRound: h.oncePerRound !== false };
          if (!edhaTriggerAllowed(mk.owner, rule.item.name, spec)) continue;
          await edhaMarkTriggerUsed(mk.owner, rule.item.name, spec);
          const resKey = h.resource || "inv", gain = Number(h.value) || 1;
          await edhaGainResource(mk.owner, resKey, gain);
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: mk.owner }), content: `<p>🔮 <strong>${rule.item.name}</strong>: the ${edhaConditionLabel(status)} creature took damage — ${mk.owner.name} recovers ${gain} ${EDHA_RES_LABEL[resKey] || resKey}.</p>` });
        }
      }
      // HP-threshold prompt (Mender's Instinct): an ALLY character just dropped to ≤ half HP → offer
      // each owner of an edha-hp-threshold rule the reaction (chat-card button; heal lands on the ally).
      // 2026-07-26l (bench run 3 defect 4): the sweep said "ally" and enforced NOTHING — a HOSTILE
      // crossing drew the offer (4a) and every rule-owning world actor got a card, token or no
      // token (4b: The Vivisectionist, parked in the directory, posted from off-scene). The gates
      // now: the owner must have a token on the scene (you cannot be "in Attunement Range" from the
      // sidebar), the victim's token must share its disposition (unknown positions fail CLOSED, the
      // watch-dispatch precedent), and an authored rangeColor enforces the card's Attunement Range.
      // Owner === target (includeSelf) skips the gates — you are wherever you are. The COMBAT-gating
      // question stays Ben's queued ruling; nothing here keys on game.combat.
      if (dealt && target?.type === "character" && maxHp > 0) {
        const newHp = Number(target.system?.resources?.hea?.value) || 0;
        const half = maxHp / 2;
        if (prevHp > half && newHp <= half) {
          const ttok = edhaCasterToken(target) ?? null;
          for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
            const rule = edhaActorRuleOf(owner, "edha-hp-threshold");
            const h = rule?.handler;
            if (!h) continue;
            if (owner === target && h.includeSelf === false) continue;
            if (owner !== target) {
              const otok = edhaCasterToken(owner);
              if (!otok) continue;                                                                   // (4b) no token on the scene → no reaction
              if (!ttok || !edhaSideSame(otok.document?.disposition, ttok.document?.disposition)) continue;   // (4a) allies only; unknown side now really does fail CLOSED (R-63 — the ?? 0 pair read two unknowns as the SAME side)
              if (h.rangeColor && !edhaAllyInAttune(owner, ttok, h.rangeColor)) continue;             // the card's "in Attunement Range"
            }
            const spec = {
              effect: { kind: "heal", formula: h.healFormula || "0", target: "victim" },
              cost: h.costResource ? { resource: h.costResource, value: Number(h.costValue) || 0, optional: true } : null,
              oncePerRound: h.oncePerRound !== false,
              note: h.note || `${target.name} dropped to ${newHp}/${maxHp} HP — you may react to heal them.`,
            };
            edhaPostTriggerCard(owner, rule.item.name, spec, { victim: target });
          }
        }
      }
      // GM CUE CARDS (07-16, Ben: adversary ability text converts to hooks, not prose) — generic
      // `edha-gm-cue` sentinels: the victim's own "damaged"/"hp-below" cues, then same-side
      // "ally-drops" cues. Whispered to the GM at the crossing; the decision stays at the table.
      if (dealt) await edhaGmCueDamageSweep(target, prevHp, Number(target.system?.resources?.hea?.value) || 0, maxHp);
      // Thorns splash-back + the Suture Cradle discipline check (07-16b playtest pass).
      if (dealt) {
        const dealtAmt = list.filter(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal").reduce((s, i) => s + Number(i.amount), 0);
        await edhaThornsCheck(target, dealer, options);
        await edhaSutureCradleCheck(target, dealtAmt);
        await edhaChargeDamagedCheck(target);   // Set Charge's target-damaged arm (07-16c)
      }
      // WHITE / BULWARK — ally-damage reactions (heal-back / redirect / retaliate / revive cards).
      if (dealt) {
        const newHpB = Number(target.system?.resources?.hea?.value) || 0;
        void edhaBulwarkReactions(target, dealer, Math.max(0, prevHp - newHpB), prevHp, newHpB, !!options?.edhaRedirected);
        // Intercept redirects (2bV — was the name-keyed Shoulder the Oath prompt): a ledger ally
        // lost HP → each watching `edha-redirect` {direction: intercept} rule offers its Reaction.
        void edhaInterceptPromptSweep(target, dealer, Math.max(0, prevHp - newHpB), list, !!options?.edhaRedirected);
      }
      // POWER / Tyrith — Mantle of the Aspirant: the mantled owner takes damage → redirect prompt card.
      if (dealt && !options?.edhaRedirected) void edhaRedirectPromptSweep(target, list, prevHp);
    }).catch((e) => { console.error("Edha Content | applyDamage post-pass failed", e); });
  } catch (e) { /* non-fatal */ }
  return result;
}
Hooks.once("ready", () => {
  try {
    const ActorCls = CONFIG.Actor?.documentClass;
    if (!ActorCls?.prototype?.applyDamage) { console.warn("Edha Content | CosmereActor#applyDamage not found - Kindle light not wired."); return; }
    if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
      libWrapper.register("edha-content", "CONFIG.Actor.documentClass.prototype.applyDamage",
        function (wrapped, instances, options = {}) { return edhaWrapApplyDamage.call(this, wrapped, instances, options); }, "MIXED");
      console.log("Edha Content | Kindle light wired via libWrapper.");
    } else {
      const orig = ActorCls.prototype.applyDamage;
      ActorCls.prototype.applyDamage = function (instances, options = {}) { return edhaWrapApplyDamage.call(this, (i, o) => orig.call(this, i, o), instances, options); };
      console.log("Edha Content | Kindle light wired via prototype patch.");
    }
  } catch (e) { console.error("Edha Content | applyDamage wrap failed", e); }
});
// Auto-clear Kindle lights when an encounter ends (a reasonable "end of scene" trigger).
// (deleteCombat registration centralized 2026-08-10 (R-60) — see EDHA_SCENE_RESET_FAMILIES / the shared hook after edhaClearOrderState.)

