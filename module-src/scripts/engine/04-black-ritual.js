/* ============================================================================================
 * BLACK / RITUAL tree engine (2026-06-13)
 *  - ON-HIT dispatch: fire edha-triggered-effect rules whose event is `edha-on-hit` when the dealer
 *    actually APPLIES damage (a real hit), NOT merely rolls it. cosmere rolls damage on every attack
 *    (hit or miss) — so deal-damage misfires on whiffs; apply-damage = the true hit. Powers Sapping
 *    Hex, Predatory Patience (Investiture), and Dark Investiture (affliction).
 *  - AFFLICTION damage engine: the system has the `afflicted` icon but NO per-turn damage. We store
 *    the rolled amount on the victim and auto-deal it at the start of its turns.
 *  - NECROTIC GRASP: on a Black-talent hit, mark the target "healing halved" (expires end of the
 *    OWNER's next turn — reuses the expiry pass with an owner-relative coordinate); the apply path
 *    halves heals to a marked target.
 *  - RITUAL HP COST keystone + RESERVE: pay HP on use, then ANNOUNCE (edha-ritual-paid, 2bZ).
 *    Blood Price (next-test advantage) and Sanguine Reservoir (Reserve banking) ride the event
 *    off their OWN documents — the executor names no talent.
 *  - ⚑ IRON RULE 2b (07-24p): DOUBLE DIP is on its own document — `edha-def-test` black vs cog +
 *    an `edha-apply-status` mark on edha-test-success. Its bespoke per-owner `doubleDipBy` flag
 *    died with the hook; the mark is now the engine-wide `markedBy.doubledipped` shape (the Omen /
 *    Hexmark / Insight family), read back through edhaMarkOwner. One narrowing, deliberate: the
 *    house shape keeps the MOST RECENT marker, so two Black casters marking the same creature no
 *    longer both benefit. Flagged on the checklist rather than fixed with a fourth flag layout.
 *  - Isolation movement talents — the 06-13 "manual by nature" classification is OVERTURNED piecewise
 *    as the hook inventory grows (the case-studies §4 lesson):
 *    · Dread Presence — ENFORCED since 07-05; rule-keyed since 2bZ (`edha-move-veto` on its document).
 *    · Cruel Step — WIRED 07-12: authored `use` rule on the edha-move executor (10 ft toward the target,
 *      requireTargetIsolated gate; halts at walls; Reactions ignored by rule).
 *    · Unnerving Approach — ON ITS DOCUMENT since 07-24s (iron rule 2b): H6 `edha-prompt-pick` over
 *      your target's allies within 10 ft, then `edha-push` {awayFrom: anchor, sizeColor: black}. The
 *      "moved adjacent" trigger stays trust-based: YOU declare the move by using the talent.
 * ============================================================================================ */

/* --- Unnerving Approach — ON ITS DOCUMENT since 07-24s (iron rule 2b) -----------------------------
 * `edhaUnnervingApproachUse`, `edhaUnnerveClick` and the `.edha-unnerve-btn` family are deleted. The
 * talent now carries three rules: H6 `edha-prompt-pick` {source: creatures, relativeTo: victim,
 * rangeFt: 10, disposition: anchor-ally} on use, then `edha-push` {sizeColor: black, awayFrom:
 * anchor} and an `edha-note` on edha-test-success.
 *
 * Two `edha-push` widenings were what this talent actually needed, and both are generic gaps rather
 * than favours to it: [Size] could only scale off RED, and a push could only be away from YOU. The
 * shove here is away from a THIRD party — your target — which is what `awayFrom: anchor` means, the
 * anchor being whatever creature the rule's trigger measured its candidates around.
 *
 * Two deliberate differences from the hand-rolled version, both improvements:
 *  - "Once per turn" is `once: "round"`. In combat you have exactly one turn per round, so it is the
 *    same budget; outside combat both degrade to once-until-the-encounter-ends.
 *  - The budget is spent on the CLICK, not when the card posts. Declining the prompt used to burn
 *    the turn's use.
 * The move-adjacent trigger stays trust-based, as it always was: you declare the move by using the
 * talent, and the engine does the displacement. Do NOT re-add a use-hook or a card function here. */

/* WHOSE hit does an `edha-on-hit` rule ride? (2026-07-27n — the 2bA-5 root cause, found live at
 * bench run 1 and unexplained through a whole marathon.)
 *
 * Two opposite shapes share this event:
 *   · the talent IS the attack   — Cheap Shot's unarmed strike, Dark Investiture's Black test.
 *     Its rider must fire on ITS OWN hit only, or the Stun rides every sword swing.
 *   · the talent RIDES an attack — Shockwave Slam ("when you hit with a melee Physical test"),
 *     Sapping Hex, Startling Blow, Shattering Blow. It must fire on ANY qualifying hit its owner
 *     deals, and the dealing item is a WEAPON, never the talent.
 *
 * The gate derived that from `!!system.damage.formula` alone — a field about the card's number and
 * standalone use, not about who authored the hit. Shockwave Slam carries a formula because its card
 * quotes a COLLISION value ("collision with an obstacle deals half [Tier][Die] Impact"); the engine
 * read that as "this talent has its own attack", so `dealer.item !== tal` skipped the push on every
 * weapon hit. The push machinery itself was fine the whole time, which is why a direct use worked
 * and the trigger surface looked mysteriously dead.
 *
 * Two changes, in priority order:
 *   1. **`whenDealer` on the RULE wins** — "self" | "any". Iron rule 2b: whose hit a rider rides is
 *      the talent's business and belongs on its own document, editable on the Events tab, not
 *      inferred by the engine from a field that means something else.
 *   2. The DERIVED default is narrowed to "the talent rolls its own attack": a damage formula AND
 *      `activation.type === "skill_test"`. A `utility` talent never rolls a to-hit test at all
 *      (the system's `use()` only calls `item.roll()` for skill_test), so its formula cannot be the
 *      hit in question. Cheap Shot and Dark Investiture are both skill_test and are unchanged.
 *
 * ⚑ Volatile Strike is skill_test + damage, so it still derives ITEM-SPECIFIC — yet its card and its
 * own rule description both say "when you hit with a melee attack", i.e. it is a RIDER wearing an
 * attack talent's shape. Left alone DELIBERATELY rather than flipped: its standalone use rolls that
 * same damage, so `whenDealer: "any"` would also make it offer itself on its own hit, and which of
 * the two paths is canon is a design call. It is in the rulings batch; if Ben wants it, setting
 * `whenDealer: "any"` on the Events tab is the entire fix, with no code change.
 *
 * Pure so it is pinnable without Foundry (tests/on-hit-dealer.test.js). */
function edhaOnHitIsItemSpecific(tal, rule) {
  const declared = String(rule?.handler?.whenDealer ?? "").trim();
  if (declared === "self") return true;
  if (declared === "any") return false;
  return !!tal?.system?.damage?.formula && tal?.system?.activation?.type === "skill_test";
}
// ON-HIT dispatch: run the dealer's `edha-on-hit` triggered-effect rules against the creature actually
// hit. Owner-wide for passives (Sapping Hex/Predatory Patience); item-specific for attack talents that
// carry their own damage (Dark Investiture only afflicts on ITS OWN hit) — see edhaOnHitIsItemSpecific,
// which is now decided PER RULE so one talent can carry both shapes. Guarded against re-entrancy.
async function edhaDispatchOnHit(dealer, target, list) {
  const owner = dealer?.actor;
  if (!owner || _edhaInTrigger || owner === target) return;
  const dealtTypes = list.filter(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal").map(i => i.type);
  if (!dealtTypes.length) return;
  // ENGINE PASS 5.2 (Job 2): edhaRulesForEvent replaces the hand-rolled actor.items double loop —
  // it already filters by event and rule-bearer-ness (talents + weapons since item 84), ordered
  // exactly the same way. The weapon half is what carries the migrated adversary attacks' cues.
  for (const { item: tal, rule } of edhaRulesForEvent(owner, "edha-on-hit")) {
    if (edhaOnHitIsItemSpecific(tal, rule) && dealer.item !== tal) continue;
    // GM cue on the owner's own hit (Press the Line: allied Raider reaction shot, 07-16).
    if (rule?.handler?.type === "edha-gm-cue") {
      await edhaPostCueCard(owner, tal, rule.handler, ` <em>(hit ${target.name}.)</em>`);
      continue;
    }
    // Shockwave Slam: push the creature you just hit (Red movement pilot) — runs alongside triggered effects.
    if (rule?.handler?.type === "edha-push") {
      const hp = rule.handler;
      if (hp.whenDamageType && hp.whenDamageType !== "any" && !dealtTypes.some(dt => edhaRiderMatches(hp.whenDamageType, dt))) continue;
      await edhaRunPush(owner, target, hp);
      continue;
    }
    /* ANY OTHER handler type runs its own executor (07-24s). This dispatcher used to hand-list the
     * three types it knew, so an `edha-focus` or `edha-cae-grant` rule on `edha-on-hit` was
     * SILENTLY INERT — which is why Feinting Strike's focus drain and Reaction burn had to stay
     * name-keyed in edhaHeroicOnHit. It is the pass-D lesson one level down: edhaDispatchTestResult
     * deliberately knows no payload type, and hand-listing them here reproduced the name-keyed
     * mistake in the dispatcher instead of the talent. Provably inert for existing data — every
     * shipped edha-on-hit rule in data/ uses one of the three cases above and never reaches here. */
    if (rule.handler?.type !== "edha-triggered-effect") {
      try { await rule.handler?.execute?.({ item: tal, rule, options: { victim: target, target, owner, dealtTypes } }); }
      catch (e) { console.error(`Edha Content | ${tal.name} on-hit payload failed`, e); }
      continue;
    }
    const h = rule.handler;
    if (h.whenDamageType && h.whenDamageType !== "any" && !dealtTypes.some(dt => edhaRiderMatches(h.whenDamageType, dt))) continue;
    if (h.whenTargetStatus && !target?.statuses?.has?.(h.whenTargetStatus)) continue;
    const spec = edhaTrigSpecFromCfg(h);
    const ctx = { victim: target };
    if (spec.cost?.optional) edhaPostTriggerCard(owner, tal.name, spec, ctx);
    else await edhaFireTrigger(owner, tal.name, spec, ctx);
  }
}

/* H1 `edha-def-test` (07-24m) — fire THIS talent's payload rules once its test has resolved.
 *
 * Deliberately GENERIC: it does not know any payload handler type. Every rule carries its own
 * executor (`rule.handler.execute`, the same call the system's own fireEvent makes), so a payload
 * can be any handler that exists now or later — edha-triggered-effect, edha-apply-status,
 * edha-next-test-mod, edha-push, the coming edha-cae-grant, or a NATIVE one. Hand-listing the
 * payload types here is exactly the name-keyed mistake one level up, so don't.
 *
 * Two events rather than one event + a `whenTest` field: a field would have to be added to every
 * payload handler's schema, whereas two events cost nothing anywhere and the rule editor's event
 * picker documents the success/fail branch by itself.
 *
 * Order and short-circuit follow the system: `order`-sorted, and a handler returning false stops
 * the rest (mirrors fireEvent). */
/* The `edha-combat-timing` DISPATCHER (07-24n). That event type has been registered since 07-18
 * with **zero dispatchers** — every combat-timed passive was a bespoke name-keyed combatStart hook
 * instead. Wiring it once unlocks the CAE passive grants (Foresight, Sidestep), stance entry
 * (Practiced Kata) and anything combat-timed later.
 *
 * MOMENTS: `combat-start` (since 07-24n) and `round-start` (07-24u, built with Bear Witness — its
 * only consumer). Single GM applier so a grant lands once whatever clients are open.
 *
 * ⚠ A SECOND MOMENT NEEDS DISCRIMINATION, and that is why `whenMoment` exists. Round 1 begins at
 * combat start, so without a filter every existing consumer (Foresight, Sidestep, Practiced Kata)
 * would fire TWICE on the first round. The filter lives in the dispatcher and reads the rule's own
 * `whenMoment`, defaulting to "combat-start" — so a rule that does not carry the field behaves
 * exactly as it did before this change, which makes the widening provably inert for all three
 * shipped consumers. A handler opts a moment IN by putting `whenMoment` on its schema (Ben edits it
 * in Foundry); the dispatcher needs no per-handler knowledge.
 *
 * NOTE — a deliberate widening: the hooks this replaces were gated `a.type === "character"`.
 * Rule-driven dispatch does not need that gate (only an actor actually carrying the rule fires),
 * so an adversary with an embedded twin now gets its combat-start grant too. That is the correct
 * scope for a rule, but it IS a behaviour change — flagged on the checklist. */
function edhaDispatchCombatTiming(combat, moment) {
  try {
    if (!edhaDefBuffGmGate()) return;
    for (const c of combat?.combatants ?? []) {
      const a = c?.actor; if (!a?.items) continue;
      // ENGINE PASS 5.2 (Job 2): edhaRulesForEvent replaces the hand-rolled items double loop.
      for (const { item: tal, rule } of edhaRulesForEvent(a, "edha-combat-timing")) {
        if ((rule.handler?.whenMoment || "combat-start") !== moment) continue;
        try { void rule.handler?.execute?.({ item: tal, rule, options: { moment, combat } }); }
        catch (e) { console.error(`Edha Content | ${tal.name} combat-timing rule failed`, e); }
      }
    }
  } catch (e) { console.error("Edha Content | combat-timing dispatch failed", e); }
}
/* --- DRAW MANA (07-24y, H20) — the event that lets an Attunement Key hold its own rule ----------
 * The five Leyline Attunement Keys are `activation.type: "none"`, so they can NEVER fire a `use`
 * event and therefore could never carry a rule at all — their riders had to live in the name-keyed
 * EDHA_DRAW_MANA table. That is the third leg of the 07-24v readiness test (executor / schema field
 * / EVENT) failing, and it is the whole reason this event exists: the payload handlers were ready
 * months ago and nothing could reach them.
 *
 * Deliberately NOT GM-gated, unlike edhaDispatchCombatTiming: Draw Mana fires on the OWNER's client
 * (the engine's standing convention — that is where they hold their target), and the payload
 * handlers relay to the GM themselves where they need to.
 *
 * It sweeps the actor's OWN items rather than the EDHA_DRAW_MANA table, so a rule on any talent
 * fires — a Key, or anything else that wants to ride Draw Mana. */
/* Pure: every rule on the actor's RULE-BEARING items listening for `type`, ordered. Split out from
 * the dispatcher so the SELECTION is unit-testable (the dispatch itself is async and the runner is
 * sync). `order` sorts WITHIN an item, matching edhaDispatchTestResult — across items the item
 * order stands, which is what lets Red's reminder follow Red's grant.
 *
 * ITEM 84 (2026-09-07): gates on `edhaRuleBearer` (talents + weapons), NOT `edhaIsTalent`. Item 34a
 * widened the two actor-wide harvest loops (edhaActorRuleOf / edhaActorRulesOf) when it moved the
 * adversaries' attacks onto weapon-type documents, and left THIS selection behind — so every
 * `edha-on-hit` rule the migration put on a weapon was silently inert (bench run 42: Surecat's
 * Pounce cue posted nothing on four applied hits; six shipped rules affected). The widening covers
 * all four dispatchers that read this — on-hit, combat-timing, draw-mana, ritual-paid — because a
 * weapon can carry any of those events and dropping them is the identical bug. */
function edhaRulesForEvent(actor, type) {
  const out = [];
  try {
    for (const item of actor?.items ?? []) {
      if (!edhaRuleBearer(item)) continue;   // talents + weapons — item 84, matching item 34a's loops
      const rules = edhaEventRules(item).filter(r => r?.event === type)
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      for (const rule of rules) out.push({ item, rule });
    }
  } catch (e) { console.error("Edha Content | rule lookup failed", e); }
  return out;
}
async function edhaDispatchDrawMana(actor, item) {
  try {
    for (const { item: tal, rule } of edhaRulesForEvent(actor, "edha-draw-mana")) {
      try {
        const res = await rule.handler?.execute?.({ item: tal, rule, options: { source: item ?? null, drawMana: true } });
        if (res === false) break;   // mirrors fireEvent / edhaDispatchTestResult
      } catch (e) { console.error(`Edha Content | ${tal.name} draw-mana rule failed`, e); }
    }
  } catch (e) { console.error("Edha Content | draw-mana dispatch failed", e); }
}
/* The RITUAL-PAID announcement (2bZ — the edha-draw-mana shape again: an engine moment that used
 * to route to named talents now says what happened, and the riders read it off their own
 * documents). Fired by edhaRitualHpCost AFTER the health deduction; NOT fired when the price was
 * paid from Reserve instead (not a health loss — stated on Double Dip's card). `options.paid`
 * carries the amount so a banking rule needs no formula of its own. Knows no payload type. */
async function edhaDispatchRitualPaid(actor, item, paid) {
  try {
    for (const { item: tal, rule } of edhaRulesForEvent(actor, "edha-ritual-paid")) {
      try {
        const res = await rule.handler?.execute?.({ item: tal, rule, options: { source: item ?? null, paid: Math.max(0, Math.floor(Number(paid) || 0)) } });
        if (res === false) break;   // mirrors fireEvent / edhaDispatchTestResult
      } catch (e) { console.error(`Edha Content | ${tal.name} ritual-paid rule failed`, e); }
    }
  } catch (e) { console.error("Edha Content | ritual-paid dispatch failed", e); }
}
/* The ROUND boundary. Foundry has no "new round" hook, so it is latched off combatTurnChange the
 * same way the retired Bear Witness code did — including its reload guard: a client that first sees
 * a combat already past round 1 STAMPS the round without firing, so re-opening the world mid-combat
 * never double-grants. */
const _edhaTimingRoundSeen = new Map();   // combat.id -> last round dispatched
function edhaAnnounceRoundStart(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    const round = combat.round ?? 1;
    const seen = _edhaTimingRoundSeen.get(combat.id);
    if (seen === round) return;
    _edhaTimingRoundSeen.set(combat.id, round);
    if (seen === undefined && round > 1) return;      // mid-combat reload — stamp only, never fire
    edhaDispatchCombatTiming(combat, "round-start");
  } catch (e) { console.error("Edha Content | round-start announce failed", e); }
}
Hooks.on("combatStart", (combat) => {
  try { _edhaTimingRoundSeen.delete(combat?.id); } catch (e) {}
  edhaDispatchCombatTiming(combat, "combat-start");
  edhaAnnounceRoundStart(combat);                     // round 1 IS a round start
});
Hooks.on("combatTurnChange", (combat) => edhaAnnounceRoundStart(combat));
Hooks.on("deleteCombat", (combat) => { try { _edhaTimingRoundSeen.delete(combat?.id); } catch (e) {} });

/* The H1 pre-use VETO. Returning false from preUseItem cancels with NO cost paid, so the "nothing
 * spent" guarantee the deity takeovers hand-rolled survives their retirement — but unlike a
 * takeover this does not swallow the card or the roll, so the player still rolls their own test.
 * Gate only; never resolves anything. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    if (!edhaIsTalent(item) || !item.actor) return;
    const h = edhaRuleOf(item, "edha-def-test"); if (!h) return;
    // Scene-once and counter-bearer gates (07-25, 2bT), both pre-cost like everything else here.
    if (h.oncePerScene && edhaSceneOnceUsed(item.actor, item)) {
      ui.notifications?.warn(`Edha: ${item.name} was already used this scene — nothing spent.`);
      return false;
    }
    if (h.targetCounter) {
      if (!edhaCounterBearerUuid(item.actor, String(h.targetCounter).trim())) {
        ui.notifications?.warn(`Edha: you have no creature bearing your ${edhaConditionLabel(h.targetCounter) || h.targetCounter} for ${item.name}. Nothing spent.`);
        return false;
      }
      return;   // the bearer IS the target — none of the user-target gates below apply
    }
    if (h.targetList) return;   // owner-sweep mode (2bU) reads the ledger, never a user target — an
                                // empty ledger still spends, matching the hand-rolled Chaos sweeps
    const ttok = edhaUserTargetToken();
    if (h.requireTarget !== false && !ttok?.actor) {
      ui.notifications?.warn(`Edha: ${item.name} — target the creature first (nothing spent).`);
      return false;
    }
    if (h.requireDisposition && ttok?.actor) {
      const otok = edhaCasterToken(item.actor);
      // R-63: Number.isFinite fail-closed (was `?? 1` on both sides) — unknown disposition refuses the
      // use exactly like the missing-token branch already did. 🤖 bench row.
      const td = ttok.document?.disposition, od = otok?.document?.disposition;
      const dispKnown = Number.isFinite(td) && Number.isFinite(od);
      const same = dispKnown && td === od;
      if (!otok || !dispKnown || same !== (h.requireDisposition === "ally")) {
        ui.notifications?.warn(`Edha: ${ttok.actor.name} is not ${h.requireDisposition === "ally" ? "an ally" : "an enemy"} — nothing spent.`);
        return false;
      }
    }
    if (h.rangeColor && ttok && !edhaDeathInRange(item.actor, ttok, h.rangeColor)) {
      ui.notifications?.warn(`Edha: ${ttok.actor?.name ?? "that creature"} is outside your Attunement Range (${h.rangeColor}) — nothing spent.`);
      return false;
    }
    // Target-state gate, also pre-cost (07-24q): Absolute Authority only reaches a creature that is
    // already Compelled, Frightened or Weakened. A comma-list is an OR, matching the hand-rolled
    // EDHA_POWER_PREY test it replaces.
    if (h.requireTargetStatus && ttok?.actor) {
      const want = String(h.requireTargetStatus).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (want.length && !want.some((s) => ttok.actor.statuses?.has?.(s))) {
        ui.notifications?.warn(`Edha: ${ttok.actor.name} must be ${want.join(" / ")} for ${item.name} — nothing spent.`);
        return false;
      }
    }
    // Own-ledger gate, also pre-cost (2bV): Verdict only reaches a creature bound by one of YOUR
    // Edicts — the shared `edict` status is not enough, the entry must be on the roller's ledger.
    if (h.requireTargetOnList && ttok?.actor) {
      const key = String(h.requireTargetOnList).trim();
      const st = String(h.requireTargetOnListStatus || key).trim();
      if (key && !edhaOwnerList(item.actor, key, st).some(e => e.uuid === ttok.actor.uuid)) {
        ui.notifications?.warn(`Edha: ${ttok.actor.name} is not on your ${key} for ${item.name} — nothing spent.`);
        return false;
      }
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* The generic scene-once stamp (07-25, 2bT): `sceneOnce.<item.id>` flags written by the H1, H9 and
 * edha-self-status executors, read by their vetoes, cleared here — one sweep instead of a bespoke
 * flag per capstone (finalStudyUsed / sovereigntyUsed / mantleUsed died with their takeovers).
 * 2bU adds the other scene-lived generics to the same sweep: the `bonusTally.<item.id>` kill
 * tallies, the `armOnce.<status>` watch ledgers, and AEs flagged `sceneDefBuff` (window: scene
 * defense buffs). */
Hooks.on("deleteCombat", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier (07-27b — the 2bW-13 family)
    const guard = edhaCombatEndGuard(combat);   // ⛑ cross-combat clobber guard
    for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
      if (edhaStillFightingElsewhere(a, guard)) continue;
      // `trigRound` joined 07-27b (bench run 5 saw it survive combat delete): it maps trigger name
      // → the round it last fired, and rounds RESTART next combat — a stale entry silently eats the
      // trigger in the next combat's same-numbered round. Scene end is exactly when it expires.
      for (const key of ["sceneOnce", "bonusTally", "armOnce", "trigRound"]) {
        if (a.getFlag?.("edha-content", key) !== undefined) { try { void a.unsetFlag("edha-content", key); } catch (e) {} }
      }
      const fx = a.effects?.filter(e => e.getFlag?.("edha-content", "sceneDefBuff")) ?? [];
      if (fx.length) { try { void a.deleteEmbeddedDocuments("ActiveEffect", fx.map(e => e.id)); } catch (e) {} }
    }
    // `tempHp` joined 07-27d (bench run 6: Bulwark {2}, Edict {2}, Favor {15} rode through THREE
    // combat deletes on three trees while AEs/ledgers/statuses/markedBy swept clean — Temp HP was
    // the ONLY transient the scene reset never learned, so a stale grant silently absorbed damage
    // next scene). Determinable, not a ruling: every grant surface is combat/scene-scoped by its
    // card (Death Ward and Edict of the Fallen say "for the scene" outright; Bulwark/Bear Witness
    // are per-round combat grants; the victory-surge and Favor riders are in-combat watches).
    // WIDER enumeration than the character loop above on purpose: edhaGrantTempHpCross lands on
    // adversaries, summons, and unlinked token actors too — sweep canvas token actors AND the
    // directory, each unset its own guard (the Chaos-sweep lesson, same pass).
    const seenThp = new Set();
    const thpClear = (a) => {
      if (!a || edhaStillFightingElsewhere(a, guard)) return;
      const k = a.uuid ?? a.id; if (seenThp.has(k)) return; seenThp.add(k);
      if (a.flags?.["edha-content"]?.tempHp !== undefined) { try { void a.unsetFlag("edha-content", "tempHp"); } catch (e) {} }
    };
    for (const t of (canvas?.tokens?.placeables ?? [])) thpClear(t.actor);
    for (const a of (game.actors ?? [])) thpClear(a);
  } catch (e) { /* non-fatal */ }
});
/* An arming status dropping clears its arm-per-target watch ledger (2bU): the next arming starts
 * fresh, exactly as the retired hand-rolled hit set died with its flag. Status-keyed, no names. */
Hooks.on("deleteActiveEffect", (eff) => {
  try {
    const a = eff?.parent; if (a?.documentName !== "Actor") return;
    for (const s of (eff.statuses ?? [])) {
      if (a.getFlag?.("edha-content", `armOnce.${s}`) !== undefined) { try { void a.unsetFlag("edha-content", `armOnce.${s}`); } catch (e) {} }
    }
  } catch (e) {}
});

async function edhaDispatchTestResult(owner, item, target, ok, ctx = {}) {
  const want = ok ? "edha-test-success" : "edha-test-fail";
  const rules = edhaEventRules(item).filter(r => r?.event === want)
    /* A pick's payload must never re-ask (07-24s). H6 posts its card FROM a success rule (Puppeteer's
     * watch fires the offer) and then dispatches the same event again with the picked creature — so
     * without this the prompt rule would re-run and post a fresh card on every click, for ever.
     * Filtered rather than skipped inside the loop so `rules.length` stays honest: it is what tells
     * H6's click "this talent carried no payload, post the table-run note instead". */
    .filter(r => !(ctx.viaPick && r?.handler?.type === "edha-prompt-pick"))
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  for (const rule of rules) {
    try {
      // `victim` as well as `target` (07-24p): the trigger family resolves eff.target === "victim"
      // from ctx.victim, and binding the payload to the creature the TEST RESOLVED AGAINST is
      // strictly better than re-reading game.user.targets — with two tokens targeted the test used
      // the first one, and a "prompt" payload would have hit both.
      const res = await rule.handler?.execute?.({ item, rule, options: { ...ctx, target, victim: target, owner, testOk: ok } });
      if (res === false) break;
    } catch (e) { console.error(`Edha Content | ${item?.name} ${want} payload failed`, e); }
  }
  /* H8: the same resolved test is then offered to every WATCHING document (Crown of Thorns rides
   * Kneel's test from a different item on the same actor). Deliberately after the item's own rules,
   * outside the return value — `rules.length` still answers "did THIS talent carry a payload", which
   * is what H1's card note reports. edhaDispatchWatchers is re-entrancy-guarded, so a watcher's own
   * dispatch landing back here cannot loop.
   *
   * `announce: false` (07-24s) — H6 re-uses this dispatcher to run a talent's success rules against
   * a PICKED creature, and a pick is not a test. Announcing one would let a `watch: test` rule with
   * no skill/defense filters fire on every choice anybody makes. */
  if (ctx.announce !== false) void edhaDispatchWatchers({ kind: "test", owner, victim: target, skill: ctx.skill ?? null, def: ctx.def ?? null, ok, total: ctx.total ?? null });
  return rules.length;
}

/* Shared rule gate: "only when the owner also has talent <name>" (07-24p).
 * The UPGRADE-TALENT shape — Absolute Stillness sharpens Ghostly Walls, Calm Appeal rides Steadfast
 * Challenge, Resolute Stand rides Valiant Intervention. Each was a bare edhaOwnsTalent call on the
 * upgrade's name inside the parent's engine code, i.e. two talents name-keyed for one mechanic.
 *
 * A NAME in this field is fine and is NOT what iron rule 2b forbids: it is authored data on the
 * parent's rule, visible and editable on the Events tab (the same reasoning as edha-enter-stance's
 * `stance` field). What 2b forbids is the ENGINE branching on a name to decide what to do — here the
 * engine only compares two strings it was handed. Blank = no gate. */
function edhaRuleOwnsGate(owner, name) {
  if (!name) return true;
  return edhaOwnsTalent(owner, String(name));
}

/* edhaNoteTargetGate — the TARGET-CONDITION dial on edha-note (item 63, R-25 (c), 2026-09-06).
 * `whenTarget` is authored data on the rule, read here and nowhere else: blank = no gate (every
 * pre-existing edha-note keeps printing unconditionally); "downed" = the note prints only when the
 * subject creature (R-64 victim chain: options.victim → options.target → the clicking user's target)
 * is at 0 health OR carries the system's Unconscious status — the two cases Rallying Shout's card
 * names. No target at all with a dial set = closed, never thrown. Pinned in tests/note-target-gate. */
function edhaNoteTargetGate(whenTarget, target) {
  const mode = String(whenTarget || "").trim();
  if (!mode) return true;
  if (!target) return false;
  if (mode === "downed") {
    const hp = Number(target.system?.resources?.hea?.value);
    return (Number.isFinite(hp) && hp <= 0) || !!target.statuses?.has?.("unconscious");
  }
  return true;   // an unknown mode never silences a note — fail open, like a blank field
}

