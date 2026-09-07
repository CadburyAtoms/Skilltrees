/* ============================================================================================
 * TRIGGER GATING & COST (the first half of the triggered-effect machinery; the resolver itself
 * is two banners below, after the senses block that its targeting depends on). This is the part
 * that decides whether a trigger is ALLOWED to fire and what it costs — the frequency ledger
 * (once per turn / round / scene), the re-entrancy guard, and the resource spend.
 *
 * ⚠️ `_edhaInTrigger` is the file-wide re-entrancy guard: it is true while ANY trigger effect is
 * resolving, and a trigger that deals damage would otherwise re-enter its own on-damage watcher.
 * Anything new that can fire from inside a payload must respect it.
 * ⚠️ edhaOwnsTalent lives here and is one of the two iron-rule-2b smells (with `item.name ===`).
 * It is on the pass-7 ratchet in `scripts/name-keyed-allowlist.json`, which may only SHRINK — do
 * not add a caller.
 * Owns: _edhaInTrigger · EDHA_TRIG_PENDING · EDHA_RES_LABEL · edhaIsTalent · edhaOwnsTalent ·
 *   edhaResVal · edhaTriggerAllowed · edhaMarkTriggerUsed · edhaResolveCost.
 * ============================================================================================ */

/* --- TRIGGERED talent effects ------------------------------------------------------------------
 * A talent's own `edha-triggered-effect` rule (Events tab) fires a secondary effect on a combat
 * event: `edha-deal-damage` (any of your items rolled damage) or `edha-on-defeat` (a creature you
 * damaged dropped to 0 HP) — both dispatched NATIVELY by the system's event engine.
 * Effects (kind): damage / damage-aoe (actor.applyDamage), heal (+ optional resourceGain), thp
 * (edhaWriteTempHp), affliction (toggle the 'afflicted' status + chat the ongoing amount).
 * Optional costs post a chat-card button (canvas stays clickable for targeting). oncePerRound
 * is tracked per combat round. A re-entrancy guard stops a trigger's own damage from chaining kills.
 */
let _edhaInTrigger = false;   // re-entrancy guard: true while resolving any trigger effect
// Optional-cost trigger cards (native + legacy) stash their resolved spec here, keyed by a per-card
// id embedded in the button, so the click handler fires the exact rule that posted it.
const EDHA_TRIG_PENDING = {};

const EDHA_RES_LABEL = { inv: "Investiture", foc: "Focus", opportunity: "an Opportunity" };

// Is this item a talent for ownership/behavior purposes? PC talents are `talent`-type; adversary
// tree-talent embeds are ACTION-TYPED TWINS (the adversary sheet only renders trait/weapon/action
// sections) carrying `flags.edha-content.adversaryTalent` — the W23 pipe-cleaner fallback (2026-07-14).
// NOT used by edhaCountTalents: embedded twins never count toward a PC talent budget.
function edhaIsTalent(i) {
  return i?.type === "talent" || i?.flags?.["edha-content"]?.adversaryTalent === true;   // type-strict: the predicate itself
}
// Can this item CARRY edha event rules the passive-rule harvest loops should read? Talents (PC +
// adversary twins/bespoke) AND weapon-type items — the fleet weapon migration (item 34a, 2026-09-06;
// design from PR #103) moved the adversaries' gear and natural attacks to weapon-type, and their
// authored riders (Spearing Beak's whenTargetFooled +1d6, Bite's Kindle light, Scalpel-Strike's
// whenTargetStatus +4) live ON the weapon. ALL weapons qualify (not just pack-flagged ones) so a
// rider Ben authors on any weapon's Events tab in Foundry harvests too; system-pack weapons carry
// no edha-* rules and cost nothing. Weapons stay OUT of edhaIsTalent on purpose (attacks are
// equipment, not talents — no useItem talent automation, no talent-budget count), so the two
// actor-wide harvest loops (edhaActorRuleOf / edhaActorRulesOf) gate on THIS predicate instead.
function edhaRuleBearer(i) {
  return edhaIsTalent(i) || i?.type === "weapon";
}
function edhaOwnsTalent(actor, name) {
  return !!actor?.items?.some(i => edhaIsTalent(i) && i.name === name);
}
function edhaResVal(res) { return (res && typeof res.max === "object") ? res.max.value : res?.max; }

// The `trigRound` ledger is a flag VALUE keyed by trigger name, so every key goes through
// edhaFlagKey: a dot anywhere in the name would be EXPANDED into nested objects on write and the
// flat read would then never match, silently disarming the once-per-round guard (see edhaFlagKey).
// No talent or adversary ability is named with a dot today, but edhaPostCueCard's key now carries
// an `atFraction` decimal, and a future rename must not be able to break the guard. Escaping is a
// no-op for every key already persisted, so no migration is needed.
function edhaTriggerAllowed(owner, name, spec) {
  if (!spec.oncePerRound) return true;
  const round = edhaCombatRoundOf(owner);   // R-4/#28a: the OWNER's combat, not whichever one is viewed
  if (round == null) return true;                                   // no combat → unrestricted
  return owner.getFlag?.("edha-content", "trigRound")?.[edhaFlagKey(name)] !== round;
}
async function edhaMarkTriggerUsed(owner, name, spec) {
  if (!spec.oncePerRound) return;
  const round = edhaCombatRoundOf(owner);   // R-4/#28a: the OWNER's combat (must match the reader above)
  if (round == null) return;
  const tr = foundry.utils.deepClone(owner.getFlag("edha-content", "trigRound") ?? {});
  tr[edhaFlagKey(name)] = round;
  try { await owner.setFlag("edha-content", "trigRound", tr); } catch (e) { /* perms */ }
}

// Yes/No prompt for an optional cost; best-effort deduct inv/foc; opportunity is trusted (player pays).
async function edhaResolveCost(owner, name, spec) {
  const cost = spec.cost;
  if (!cost) return true;
  if (cost.optional) {
    let ok = false;
    try {
      ok = await foundry.applications.api.DialogV2.confirm({
        window: { title: `${name} — Triggered Effect` },
        content: `<p>You may spend <strong>${cost.value} ${EDHA_RES_LABEL[cost.resource] || cost.resource}</strong> for <strong>${name}</strong>.</p>`
               + `<p style="opacity:.8">Target the secondary creature now (the canvas stays clickable), then choose Yes.</p>`
               + (spec.note ? `<p style="opacity:.8">${spec.note}</p>` : ""),
        modal: false, rejectClose: false,        // NON-modal so you can re-target on the canvas while it's open
      });
    } catch (e) { ok = false; }
    if (!ok) return false;
  }
  if (cost.resource === "inv" || cost.resource === "foc") {
    const res = owner.system?.resources?.[cost.resource];
    const cur = res?.value ?? 0;
    if (cur < cost.value) ui.notifications?.warn(`Edha: ${owner.name} lacks ${cost.value} ${EDHA_RES_LABEL[cost.resource]} for ${name} (proceeding anyway).`);
    await edhaSpendResource(owner, cost.resource, cost.value);
  }
  return true;
}

