/* ============================================================================================
 * ══ END OF THE RED TREE SECTION ══  Everything from here down to the DESTRUCTION banner is
 * CROSS-TREE MACHINERY, not Red. It sat under Red's banner purely by accident of append order —
 * ~3,700 lines with no `=== ` banner header of its own, which meant the section index could not
 * find any of it and a cold reader had to scroll. Bannered 2026-09-05 (item 23, comment-only;
 * prep for the #4 split, which needs named seams to cut on).
 *
 * Twenty subsystems follow, each with its own banner below and a row in ENGINE_INDEX.md:
 *   defence buffs · consume-dialog title · talent budget · sheet path slots · the
 *   character-creation wizard · sheet QoL · talent sync · adversary sync · temporary HP ·
 *   summons · injuries · trigger gating & cost · senses/light/visibility · triggered-effect
 *   resolution · the single-target gate · targeting & AoE templates · point-targeted bursts ·
 *   synchronous formula evaluation · the refund race · burst execution + the GM socket relay.
 * ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
 * DEFENCE BUFFS (`edha-defense-buff`) — +N to chosen defences for a combat-timing window.
 * Document-driven (iron rule 2b): amount / defenses / window are all editable on the talent's
 * Events tab. GM-side, and exactly ONE GM writes (edhaDefBuffGmGate) so a two-GM table does not
 * double-apply. The note below explains why "round-until-turn" RECOMPUTES every combatant on
 * each turn/round change instead of incrementing — the cosmere system fires no turn hooks.
 * Owns: edhaDefBuffGmGate · edhaDefBuffFor · edhaApplyDefBuff · edhaRemoveDefBuff ·
 *   edhaRefreshDefBuffs, plus the ready (mid-combat reload restore) / combatStart /
 *   combatTurnChange / deleteCombat watchers.
 * ============================================================================================ */

/* --- Defense-buff talents (e.g. Know Your Moment): +N defenses for a combat-timing window ----------
 * Driven by the talent's own `edha-defense-buff` rule (Events tab — amount/defenses/window editable
 * there). "round-until-turn" = a toggled ActiveEffect (+amount to each defense's .bonus, which the
 * DerivedValueField folds into .value) that's ON from the start of each round until the owner takes
 * its turn. The cosmere system has NO turn hooks, so we use Foundry core combat hooks and RECOMPUTE
 * every combatant's state on each turn/round change by initiative order: anyone later in the order
 * than the current turn hasn't acted yet this round → +N; the current/earlier actors → none.
 * That captures the round boundary for free (turn resets to 0 → everyone but the new first re-arms). GM-side.
 */
Hooks.once("ready", () => {
  try { if (game.combat?.started && edhaDefBuffGmGate()) void edhaRefreshDefBuffs(game.combat); }   // restore state after a mid-combat reload
  catch (e) { console.warn("Edha Content | def-buff restore failed", e); }
});
/* The one-applier gate, in TWO HALVES — because three RegionBehavior sites need only the second.
 * `edhaNoOtherActiveGM()` is the primitive: "no OTHER GM client has claimed this" — true on the
 * primary GM, true when NO GM is connected at all, false on a second GM and on any player while a
 * GM is online. `edhaDefBuffGmGate()` is that AND being a GM ("am I the single applier?"), and is
 * what every world-writing hook gates on. The three region behaviours (Civ fortified foundation,
 * dangerous terrain, Fate snare) call the PRIMITIVE deliberately: their trap still has to fire on a
 * player's own client in a GM-less session, so bolting the isGM half on there is a live-behaviour
 * change and a ruling, not hygiene. Item 12 (2026-09-06) moved 19 hand-derived copies onto these
 * two; pass 20's `primaryGmGate` ratchet therefore FLOORS AT 1 — the primitive's own body. */
function edhaNoOtherActiveGM() { return !(game.users?.activeGM && !game.users.activeGM.isSelf); }   // no OTHER GM has claimed it
function edhaDefBuffGmGate() { return !!game.user?.isGM && edhaNoOtherActiveGM(); }   // exactly one GM writes
function edhaDefBuffFor(actor) {
  if (!actor?.items) return null;
  for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-defense-buff")) {
    if ((h.window || "round-until-turn") === "round-until-turn") {
      return { name: tal.name, spec: { amount: h.amount, defenses: String(h.defenses || "phy, cog, spi").split(/[\s,]+/).filter(Boolean), label: h.label || `${tal.name} (Ready)`, img: h.img } };
    }
  }
  return null;
}
async function edhaApplyDefBuff(actor) {
  const hit = edhaDefBuffFor(actor); if (!hit) return;
  if (actor.effects.find(e => e.getFlag?.("edha-content", "defBuff"))) return;          // already armed
  // `amount: 0` means "no bonus" — the SAME field on this handler's scene-window branch already
  // reads it that way (`|| 0; if (!amt) return`). `|| 2` made the round-until-turn branch hand out
  // +2 instead. Latent (no shipped rule authors 0) but the two branches must not disagree.
  const s = hit.spec; const amt = edhaNumOr(s.amount, 2); if (!amt) return;
  const defs = (Array.isArray(s.defenses) && s.defenses.length) ? s.defenses : ["phy", "cog", "spi"];
  const changes = defs.map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(amt), priority: 20 }));
  try {
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: s.label || hit.name, img: s.img || "icons/svg/shield.svg", changes,
      description: `<p>+${amt} to ${defs.map(d => d.toUpperCase()).join("/")} defense until you take your turn (${hit.name}).</p>`,
      flags: { "edha-content": { defBuff: hit.name } },
    }]);
  } catch (e) { console.error("Edha Content | def-buff apply failed", e); }
}
async function edhaRemoveDefBuff(actor) {
  const ex = actor?.effects?.filter(e => e.getFlag?.("edha-content", "defBuff")) ?? [];
  if (ex.length) { try { await actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id)); } catch (e) { console.error("Edha Content | def-buff remove failed", e); } }
}
// Single source of truth: re-derive every combatant's buff state from initiative order vs the current turn.
async function edhaRefreshDefBuffs(combat) {
  combat = combat || game.combat; if (!combat?.started) return;
  const curTurn = combat.turn ?? 0; const turns = combat.turns ?? [];
  for (let i = 0; i < turns.length; i++) {
    const a = turns[i]?.actor; if (!a) continue;
    if (i > curTurn) await edhaApplyDefBuff(a);   // later in initiative → hasn't acted this round → +N
    else await edhaRemoveDefBuff(a);              // acting now or already acted → no bonus
  }
}
Hooks.on("combatStart", (combat) => { if (edhaDefBuffGmGate()) void edhaRefreshDefBuffs(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaRefreshDefBuffs(combat); });
Hooks.on("deleteCombat", (combat) => { if (!edhaDefBuffGmGate()) return; for (const c of (combat?.combatants ?? [])) if (c.actor) void edhaRemoveDefBuff(c.actor); });

