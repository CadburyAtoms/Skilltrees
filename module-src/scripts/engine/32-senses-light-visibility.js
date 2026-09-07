/* ============================================================================================
 * SENSES, LIGHT & VISIBILITY — the geometry every range- or sight-gated talent asks: who is
 * within N feet, is this square lit, can this creature see that one. Sits between the two halves
 * of the trigger machinery because the effect resolver above it needs these answers to pick
 * targets, and the stealth talents below need them to decide whether they are hidden.
 * Ranges derive from Awareness (edhaSensesRangeFtFromAwa), so a sheet edit moves them for free.
 *
 * The DARK-VEIL sweep (07-16c, Ben's A1 ruling) is the one stateful piece: while a Veil owner's
 * token stands on an UNLIT square it gains the hidden marker, and it loses it on light. It is
 * DEBOUNCED (edhaDarkVeilSoon, 300 ms) because token movement and scene-darkness changes both
 * fire in bursts — the sweep is O(tokens) and must not run per pixel.
 * Owns — geometry/sight: edhaTokensWithin · edhaPointIlluminated · edhaSensesRangeFtFromAwa ·
 *   edhaSensesRangeFt · edhaCanSee.
 * Owns — dark veil: _edhaDarkVeilTimer · edhaDarkVeilSoon · edhaVeilSuppressed ·
 *   edhaDarkVeilSweep + the updateToken / updateScene / deleteCombat watchers.
 * Owns — reveal on damage: edhaSenseRevealShows · edhaSenseRevealOnDamage (a hidden creature
 *   that takes damage stops being hidden).
 * ============================================================================================ */

// Tokens within `ft` of a center token (Euclidean on centers → grid distance).
function edhaTokensWithin(centerTok, ft) {
  const scene = centerTok?.scene ?? canvas?.scene;
  const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
  const cx = centerTok.center?.x, cy = centerTok.center?.y;
  return (canvas?.tokens?.placeables ?? []).filter(t => {
    if (t.id === centerTok.id || !t.actor) return false;
    const px = Math.hypot((t.center?.x ?? 0) - cx, (t.center?.y ?? 0) - cy);
    return (px / gs * gd) <= ft;
  });
}

// Illumination test (Ben 07-16c — supersedes ruling R4's "darkness stays GM-judged" clause; the
// rules text is unchanged and saved: Character_Building_Rules.md §Senses Range): is this scene
// point LIT? Lit = scene daylight (global light enabled and darkness at/below its threshold, or
// darkness < 0.5 with no global-light config) OR inside any active light source's polygon (ambient
// lights + token emitters). Fails open (lit) — a missing lighting backend must never blind a
// talent. ⚑ bench: the 0.5 daylight threshold is a feel dial.
function edhaPointIlluminated(x, y) {
  try {
    const env = canvas?.scene?.environment;
    const darkness = Number(canvas?.environment?.darknessLevel ?? env?.darknessLevel ?? 0);
    const gl = env?.globalLight;
    if (gl?.enabled && darkness <= Number(gl.darkness?.max ?? 1)) return true;
    if (darkness < 0.5) return true;   // bright scene = daylight, assumed seen
    for (const src of (canvas?.effects?.lightSources ?? [])) {
      if (src?.active === false) continue;
      if (src?.shape?.contains?.(x, y)) return true;
    }
    return false;
  } catch (e) { return true; }
}
// Senses Range in ft (Character_Building_Rules.md §Senses Range): the system's derived value when
// present, else the AWA table — 0→10, 1→15, 2–3→20, 4→25, 5+→30. Pure table pinned in tests/.
function edhaSensesRangeFtFromAwa(awa) {
  const a = Number(awa) || 0;
  return a >= 5 ? 30 : a === 4 ? 25 : a >= 2 ? 20 : a === 1 ? 15 : 10;
}
function edhaSensesRangeFt(actor) {
  const v = edhaDerivedNum(actor?.system?.senses?.range, NaN);   // DerivedValueField object — one reader, edhaDerivedNum
  if (Number.isFinite(v) && v > 0) return v;
  return edhaSensesRangeFtFromAwa(actor?.system?.attributes?.awa?.value);
}

// Line of sight (shared primitive): can `viewer` (token) see `target` (token)? A hidden target is
// never seen; a sight-blocking-wall ray between centers decides; and (Ben 07-16c) a target standing
// in DARKNESS is seen only within the viewer's Senses Range — "in daylight, it is assumed you can
// see; if it is dark, you see to your Senses Range (derived from Awareness)". Deliberately NOT the
// native canvas.visibility.testVisibility — that answers only for the CURRENT user's vision sources,
// and consumers (Lawkeeper's Eye) run on the ATTACKER's client asking about the OWNER's view; the
// wall ray + light polygons are deterministic on every client. Fails open (true) — vision-less
// tokens, no scene, or a missing backend must never silently disable a talent.
function edhaCanSee(viewer, target) {
  try {
    const vt = viewer?.center ? viewer : viewer?.object ?? null;
    const tt = target?.center ? target : target?.object ?? null;
    if (!vt?.center || !tt?.center) return true;
    if (tt.document?.hidden) {
      if (edhaDebugOn) edhaDebugOut(`[EDHA-TEST] edhaCanSee: ${tt.name ?? "target"} is GM-HIDDEN → unseen (right-click the token → toggle visibility if that's stale)`);
      return false;
    }
    // Darkness gate (07-16c): unlit target → the viewer's Senses Range is the sight limit.
    if (!edhaPointIlluminated(tt.center.x, tt.center.y)) {
      const ft = edhaSensesRangeFt(vt.actor);
      if (edhaTokenGapFt(vt, tt) > ft) {
        if (edhaDebugOn) edhaDebugOut(`[EDHA-TEST] edhaCanSee: ${tt.name ?? "target"} is in darkness beyond ${vt.name ?? "viewer"}'s Senses Range (${ft} ft) → unseen`);
        return false;
      }
    }
    // v13 gotcha (bench-probed 07-12): a "sight"-type collision test ALSO collides with darkness-
    // source edges and the scene-border rectangle unless told otherwise — the darkness EDGE ruling
    // is unchanged (darkness handled by the gate above, not by edges; the scene border is not a
    // wall), so both stay excluded here.
    const hit = CONFIG.Canvas?.polygonBackends?.sight?.testCollision?.(vt.center, tt.center,
      { type: "sight", mode: "any", edgeOptions: { darkness: false, innerBounds: false } });
    if (hit && edhaDebugOn) edhaDebugOut(`[EDHA-TEST] edhaCanSee: ${vt.name ?? "viewer"} → ${tt.name ?? "target"} blocked by a sight wall`);
    return !hit;
  } catch (e) { return true; }
}

/* --- Dark-veil sweep (07-16c, Veil — the A1 ruling): while the owner's token stands UNLIT, its
 * named marker AE auto-enables; re-lit → auto-disables ONLY what the engine enabled (flagged
 * autoVeil — a GM's manual cover toggle is never fought; cover stays a table read, light is data).
 * Generic handler `edha-dark-veil` {effectName}; debounced GM-side on token moves + lighting. */
let _edhaDarkVeilTimer = null;
function edhaDarkVeilSoon() { try { clearTimeout(_edhaDarkVeilTimer); _edhaDarkVeilTimer = setTimeout(() => { void edhaDarkVeilSweep(); }, 300); } catch (e) {} }
/* `edha-suppress-veil` (07-25 pass 2bS — Natural Order re-litigated off the manual list, the Dread
 * Presence lesson: the veil sweep IS a nameable hook). While an ARMED owner (the rule's
 * requireSelfStatus, written by the talent's own edha-self-status rule) stands within Attunement
 * Range of a HOSTILE token, that token's dark-veil marker stays down — the sweep refuses to raise
 * it and stands down one it had raised. A GM's MANUAL marker toggle is still never fought
 * (autoVeil-flagged effects only). Illusions / advantage-from-deception have no hook and ride the
 * talent's edha-note. */
function edhaVeilSuppressed(tok) {
  try {
    for (const { actor: owner, handler: h } of edhaWatchersOfRule("edha-suppress-veil")) {
      if (h.requireSelfStatus && !owner.statuses?.has?.(h.requireSelfStatus)) continue;
      const otok = edhaCasterToken(owner); if (!otok || otok.id === tok.id) continue;
      if (!edhaSideHostile(otok.document?.disposition, tok.document?.disposition)) continue;   // enemies of the owner only — item 77: was `if (same) continue`, which let an UNRESOLVED side through as an enemy; both tokens are in hand, so the value-level predicate (R-63, fail CLOSED) 🤖 bench row
      if (edhaTokensWithin(otok, edhaAttuneFtColor(owner, h.rangeColor || "green")).some(t => t.id === tok.id)) return true;
    }
  } catch (e) {}
  return false;
}
async function edhaDarkVeilSweep() {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      for (const { item: tal, handler: h } of edhaActorRulesOf(a, "edha-dark-veil")) {
          const effName = h.effectName || tal.name;
          // edhaAllEffects, NOT a.effects (fix pass 5, bench run 33): the marker is a MARKER — it is
          // authored on the talent/trait that carries the rule, so `transfer: true` puts it on the
          // ITEM and out of `actor.effects` entirely. See the "WHERE AN EFFECT LIVES" banner.
          const eff = edhaAllEffects(a).find(e => String(e.name || e.label || "").startsWith(effName));
          if (!eff) continue;
          const unlit = !edhaPointIlluminated(tok.center.x, tok.center.y);
          const suppressed = unlit && edhaVeilSuppressed(tok);   // only worth computing when the veil would be up
          if (unlit && !suppressed && eff.disabled) {
            await eff.update({ disabled: false, "flags.edha-content.autoVeil": true });
            ChatMessage.create({ whisper: edhaGmIds(), content: `<p>🌒 <strong>${tal.name}</strong>: ${tok.name} stands in darkness — the marker is ON (auto).</p>` });   // R-62: record card → all GMs, was active-only (🤖 bench row: audience flip)
          } else if ((!unlit || suppressed) && !eff.disabled && eff.getFlag?.("edha-content", "autoVeil")) {
            await eff.update({ disabled: true, "flags.edha-content.autoVeil": false });
            if (suppressed) ChatMessage.create({ whisper: edhaGmIds(), content: `<p>🌿 <strong>${tal.name}</strong>: ${tok.name}'s veil is SUPPRESSED — an armed veil-suppressing enemy holds it within Attunement Range.</p>` });   // R-62: record card → all GMs, was active-only (🤖 bench row: audience flip)
          }
      }
    }
  } catch (e) { console.error("Edha Content | dark-veil sweep failed", e); }
}
Hooks.on("updateToken", (doc, changes) => { try { if ("x" in changes || "y" in changes) edhaDarkVeilSoon(); } catch (e) {} });
Hooks.on("updateScene", (scene, changes) => { try { if (changes.environment !== undefined || changes.darkness !== undefined) edhaDarkVeilSoon(); } catch (e) {} });
for (const h of ["createAmbientLight", "updateAmbientLight", "deleteAmbientLight"]) Hooks.on(h, () => edhaDarkVeilSoon());
// Arming/disarming a suppressor is an ActiveEffect change (statuses are AEs) — re-check the veils.
for (const h of ["createActiveEffect", "deleteActiveEffect"]) Hooks.on(h, () => edhaDarkVeilSoon());
// "For the scene": the clearsight arm clears when combat ends (the Kindle-light convention).
Hooks.on("deleteCombat", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier (07-27b — the 2bW-13 family)
    const guard = edhaCombatEndGuard(combat);   // ⛑ cross-combat clobber guard
    for (const t of (canvas?.tokens?.placeables ?? [])) if (!edhaStillFightingElsewhere(t.actor, guard) && t.actor?.statuses?.has?.("clearsight")) { try { void t.actor.toggleStatusEffect?.("clearsight", { active: false }); } catch (e) {} }
  } catch (e) {}
});

// Sense-through-obstruction reveals (07-16c, the B5/B6 rulings; RULE-DRIVEN since 07-25 pass 2bU —
// the name-keyed EDHA_SENSE_REVEALS table is retired): a client whose user owns an actor carrying an
// `edha-sense-reveal` rule renders tokens bearing that rule's marker status through walls/fog.
// Rides the phantom-veil Token#isVisible wrap (force-SHOW half). GM-hidden always stays hidden — a
// deliberate GM hide is never revealed; the GM client is untouched (sees all anyway). The RENDERING
// stays ENGINE-OWNED (a rule cannot rewire another client's veil); the rule carries WHICH status
// reveals and the damage-recovery rider, which is what makes the talent editable (Void Sense,
// Reaper's Harvest).
function edhaSenseRevealShows(tok) {
  try {
    if (!canvas?.ready || game.user?.isGM) return false;
    const a = tok?.actor; if (!a || tok.document?.hidden) return false;
    for (const w of edhaWatchersOfRule("edha-sense-reveal")) {
      const st = String(w.handler?.status || "").trim();
      if (!st || !a.statuses?.has?.(st)) continue;
      if (w.actor?.testUserPermission?.(game.user, "OWNER")) return true;
    }
    return false;
  } catch (e) { return false; }
}
// The marks appearing/leaving must re-evaluate every client's canvas.
for (const h of ["createActiveEffect", "deleteActiveEffect"]) Hooks.on(h, (eff) => {
  try {
    const ids = [...(eff?.statuses ?? [])];
    if (!ids.length) return;
    if (ids.some(s => edhaWatchersOfRule("edha-sense-reveal").some(w => String(w.handler?.status || "") === s))) canvas?.perception?.update?.({ refreshVision: true });
  } catch (e) {}
});
/* The recovery rider (2bU — was the name-keyed edhaVoidSenseOnDamage): a creature bearing YOUR
 * marker takes damage → you recover the rule's resource, once per round, range-gated when the rule
 * says so (Void Sense's card: "in Attunement Range" — a gate the hand-rolled code never enforced;
 * the card is the spec). Runs on the damage post-pass, on the applying client. */
async function edhaSenseRevealOnDamage(victim, list) {
  try {
    if (!list?.some(i => Number(i?.amount) > 0 && i?.type !== "heal")) return;
    for (const w of edhaWatchersOfRule("edha-sense-reveal")) {
      const h = w.handler;
      const amt = Number(h?.recoverAmount) || 0, res = String(h?.recoverResource || "");
      if (amt <= 0 || !res) continue;
      const st = String(h?.status || "").trim();
      if (!st || !victim?.statuses?.has?.(st)) continue;
      const mk = victim.flags?.["edha-content"]?.markedBy?.[st];
      if (!mk?.actorId || mk.actorId !== w.actor?.id) continue;                     // YOUR marker only
      if (h.rangeColor) {
        const vtok = edhaCasterToken(victim);
        if (!vtok || !edhaDeathInRange(w.actor, vtok, h.rangeColor)) continue;      // both tokens or no
      }
      const spec = h.oncePerRound === false ? {} : { oncePerRound: true };
      if (!edhaTriggerAllowed(w.actor, w.item.name, spec)) continue;
      await edhaMarkTriggerUsed(w.actor, w.item.name, spec);
      await edhaGainResource(w.actor, res, amt);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: w.actor }),
        content: `<p>👁️ <strong>${w.item.name}</strong>: a marked creature (${victim.name}) took damage — ${w.actor.name} recovers ${amt} ${EDHA_RES_LABEL[res] || res}.</p>` });
    }
  } catch (e) { console.error("Edha Content | sense-reveal recovery failed", e); }
}

