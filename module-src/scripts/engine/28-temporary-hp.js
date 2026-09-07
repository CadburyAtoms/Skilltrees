/* ============================================================================================
 * TEMPORARY HP (backlog K) — Edha's own temp-HP pool, because the cosmere system has none.
 * Stored as a module flag, not a system resource, and spent in `cosmere-rpg.preApplyDamage` by
 * reducing the incoming instances before the system's own write lands — so it works with every
 * damage source in the file (riders, bursts, triggers) without any of them knowing about it.
 * Consumed BEFORE deflect and before real HP; the pool does not stack, a larger grant replaces
 * a smaller one, and edhaThpTarget resolves who a granting talent's pool belongs to.
 * Owns: edhaGetTempHp · edhaWriteTempHp · edhaSetTempHp · edhaThpTarget + the preApplyDamage
 *   consumer.
 * ============================================================================================ */

/* --- K: Edha-custom Temporary HP ---------------------------------------------------------------
 * House rules: only ONE source of Temp HP at a time (a new grant OVERWRITES the old, even if
 * smaller); incoming damage is removed from Temp HP BEFORE normal HP; Temp HP cannot be healed,
 * only replaced or spent. Stored on the actor as flags.edha-content.tempHp = {value, source}.
 *
 * Absorption hooks the system's cancelable `cosmere-rpg.preApplyDamage(actor, damage)`. The system
 * passes `damage` BY REFERENCE and, right after the hook, applies `damage.calculated` to health —
 * so reducing it here makes Temp HP soak first. Healing arrives as calculated <= 0 and is ignored,
 * so Temp HP is never replenished by healing.
 *
 * Granting is auto-on-use: a talent's own `edha-temp-hp` rule (Events tab) rolls its formula on use
 * and sets the result as the target's Temp HP (native executor below).
 */
function edhaGetTempHp(actor) {
  const t = actor?.flags?.["edha-content"]?.tempHp;
  if (!t) return null;
  const value = Math.max(0, Math.floor(Number(t.value) || 0));
  return value > 0 ? { value, source: t.source || "" } : null;
}
async function edhaWriteTempHp(actor, value, source) {
  if (!actor) return 0;
  value = Math.max(0, Math.floor(Number(value) || 0));
  try {
    if (value <= 0) await actor.unsetFlag("edha-content", "tempHp");
    else await actor.setFlag("edha-content", "tempHp", { value, source: source || "" });
  } catch (e) { console.error("Edha Content | Temp HP write failed", e); }
  return value;
}
// Public: set (replace) an actor's Temp HP — overwrites any existing source.
async function edhaSetTempHp(actor, amount, source) {
  const v = await edhaWriteTempHp(actor, amount, source);
  ui.notifications?.info(`Edha: ${actor?.name ?? "actor"} now has ${v} Temp HP${source ? ` (${source})` : ""}.`);
  return v;
}

// Absorption — damage hits Temp HP before normal HP. Do NOT return false (let the remainder through).
Hooks.on("cosmere-rpg.preApplyDamage", (actor, damage) => {
  try {
    const thp = edhaGetTempHp(actor);
    if (!thp) return;
    const incoming = Number(damage?.calculated) || 0;
    if (incoming <= 0) return;                       // healing / zero never touches Temp HP
    const absorbed = Math.min(thp.value, incoming);
    damage.calculated = incoming - absorbed;          // by reference → system applies the remainder
    const left = thp.value - absorbed;
    const toHp = incoming - absorbed;
    void edhaWriteTempHp(actor, left, thp.source);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-thp-msg"><strong>${actor.name}</strong>'s Temp HP absorbs <strong>${absorbed}</strong> of ${incoming} damage` +
               (toHp > 0 ? ` — <strong>${toHp}</strong> carries through to HP` : "") +
               (left > 0 ? ` · ${left} Temp HP left.</div>` : ` · Temp HP depleted.</div>`),
    });
  } catch (e) { console.error("Edha Content | Temp HP absorption failed", e); }
});

// Auto-apply: when a registered THP talent is used, roll its formula and set the target's Temp HP.
function edhaThpTarget(item, mode) {
  if (mode === "self") return { actor: item.actor ?? null, via: "self" };
  const t0 = edhaUserTargetToken();
  if (t0?.actor) return { actor: t0.actor, via: "target" };
  const sel = canvas?.tokens?.controlled?.[0]?.actor;
  if (sel && sel !== item.actor) return { actor: sel, via: "selected token" };
  return { actor: item.actor ?? null, via: "caster (no target)" };
}
