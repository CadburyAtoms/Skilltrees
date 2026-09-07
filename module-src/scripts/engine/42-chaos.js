/* ============================================================================================
 * CHAOS (Maelith, deity) tree engine (2026-06-18) — the "Omen" fracture lifecycle. ENGINE-ONLY,
 * NO pack rebuild (all 9 talents keep events:{}; the damage formulas already live on the items —
 * read item.system.damage.formula). Reuses existing primitives wholesale — NO side-engine, NO new
 * data handler or sidecar table:
 *   • Omen = the MARKED pattern — a registered `omen` status + flags.edha-content.markedBy.omen,
 *     exactly like Diagnosed/Insight. So "bears your Omen" is a status check, the cap (= tier) counts
 *     your omen-marked enemies, the icon shows the bearer's location (Void Sense flavor), and Void
 *     Sense's Inv-recovery rides the SAME damage post-pass the existing marked-damage triggers use.
 *   • damage writes  → edhaApplyBurstResults (+ GM socket relay), the proven burst pipeline.
 *   • Isolated       → a registered, INFLICTABLE `isolated` status OR'd into edhaIsIsolated, so
 *     Maelith's applied-Isolation flows through the Black tree's Isolation engine (Severance vital-
 *     conversion, Spoils of Isolation, whenTargetIsolated) — one small additive change, shared.
 *   • Disorient      → edhaApplyTimedStatus("disoriented") (engine convention: expires at the END of
 *     the owner's next turn; the cards say "start of your next turn" — close enough, and the only
 *     timed expiry the engine offers).
 *   • reroll-lower   → edhaRewriteOrRelay (the Voice-of-Authority roll-rewrite); the kept d20 is lowered.
 *   • per-actor state→ owner once/round gate (edhaTriggerAllowed); statuses cleared at scene/combat
 *     end (deleteCombat), mirroring the Charge / Reserve / Life-flag pattern.
 * OMEN MODEL (Ben, 06-18): cap = tier; placements past the cap are lost. Every ACTIVE talent is a
 * preUseItem TAKEOVER (cancel the default single-target flow, pay the cost ourselves, refund on
 * cancel) — mirroring Destruction — so the color test is ROLLED (1d20 + @skills.<color>.mod) and
 * GATED against the target's defense via edhaReadDefense (NOT "trust the player"): the effect lands
 * only when total >= the defense. Cascade Collapse rolls once and gates EACH bearer against ITS OWN
 * Cognitive (Ben, 06-18). Attunement Range = EDHA_ATTUNE_FT[Blue rank] (Omens are Blue-placed).
 * Wired here (no longer GM-eyeballed):
 *   • Entropy Strike / Spreading Omen — Blue vs Cognitive → place Omen(s) on a success (+ Entropy
 *     Strike's own spirit damage). Spreading Omen also marks the nearest other enemy within 10 ft.
 *   • Isolating Pressure / Isolating Ruin — Black vs Physical → inflict Isolated (timed); the vital
 *     damage is the Omen payoff (remove the Omen, deal the bonus). Ruin also deals its base hit.
 *   • Cascade Collapse — Blue, per-bearer vs Cognitive → remove your Omens in range; each bearer
 *     takes spirit + Disorient.
 *   • Unweaving — Black vs Spiritual → on a success the Omen payoff (remove + Disorient) fires; the
 *     buff/stance/sustained DISPEL is a GM card (no hook enumerates arbitrary active effects).
 *   • Void Sense — name-based: once/round, when an enemy bearing YOUR Omen takes damage from any
 *     source, recover 1 Investiture (rides the damage post-pass; reuses edhaTriggerAllowed).
 *   • Shatter Focus — Reaction: remove your Omen on the targeted enemy and reroll-take-lower its most
 *     recent test (edhaRewriteOrRelay lowers the kept d20).
 *   • Unravel Everything (capstone) — place an Omen on every enemy in range up to the cap, then
 *     detonate all: spirit + Disorient, or 2[T][D] vital to bearers that are Isolated.
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Shatter Focus auto-prompt — the contest-watch Roll hooks whisper the owner the Reaction when
 *     an Omen-bearing foe rolls a test (never auto-fires; the native use pays the cost). Spam-gated:
 *     Omen-bearers only, once per foe per turn, plus a Mute button (a real use re-arms). ⚑ bench:
 *     reassess spam live.
 *   (Shared/cross-tree backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9 — consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Unweaving's dispel — "end one magical buff, stance, or sustained effect" has no hook to
 *     enumerate arbitrary active effects; the success posts a GM card and the GM removes one.
 *   • Void Sense's "sense the location through any obstruction" — WIRED 07-16c (Ben's B5 ruling):
 *     the client-veil force-SHOW half (edhaSenseRevealShows) renders Omen-bearers to Void Sense
 *     owners' clients through walls/fog (GM-hidden stays hidden).
 *   • CONTEST-EXEMPT: none — every Chaos test is vs a DEFENSE (Cognitive/Physical/Spiritual), resolved
 *     by rolling the color test and comparing to edhaReadDefense, not an opposed SKILL.
 *
 * ── IRON RULE 2b STATUS (07-25, pass 2bU — tree CLEAR) ────────────────────────────────────────
 * On their own documents now, takeovers deleted — do not re-add a case:
 *   Entropy Strike · Isolating Pressure · Isolating Ruin (07-24p) — `edha-def-test` (player-rolled)
 *   + H3 `edha-owner-list` + edha-triggered-effect. Pressure/Ruin are the reference for H3's
 *   CONDITIONAL idiom (an `op: release` rule returning false skips the rules after it).
 *   Spreading Omen (2bU) — H1 + H3 place {victim} + H3 place {near-victim, 10 ft} (the proximity
 *   auto-pick: nearest living enemy not already marked, silent card note when none).
 *   Unweaving (2bU) — H1 black-vs-spi + H6 {source: effects} (the dispel pick, GM-clicked, its
 *   deletion payload intrinsic) + the conditional Omen rider (release → Disorient).
 *   Cascade Collapse (2bU) — H1 {targetList: omens, targetListRange: blue}: ONE shared Blue roll,
 *   each bearer gated on its OWN Cognitive (Ben 06-18), release + damage + Disorient per member.
 *   Unravel Everything (2bU) — H3 place {enemies-range, blue} fill-to-cap, then H1 {targetList,
 *   vs: none} detonation (scene-wide — the card's range clause binds the placement only); the
 *   Isolated 2[T][D]-vital vs spirit+Disorient branch is whenTargetStatus / unlessTargetStatus.
 *   Void Sense (2bU) — an `edha-sense-reveal` rule (which status reveals + the once/round Inv
 *   recovery, now gated to Blue Attunement Range per its card — the hand-rolled code never was).
 *   ENGINE_OWNED: Void Sense's per-viewer sense-through RENDERING (edhaSenseRevealShows rides the
 *   local client's Token#isVisible veil wrap) — no document rule can rewire another client's veil;
 *   the rule carries the spec, the wrap stays engine and names no talent.
 *
 * 2bY: the Set is EMPTY and deleted. "Shatter Focus" was TWO talents sharing a name — deity/
 * Chaos's Omen reroll (now `edha-reroll-react` on ITS document) and leyline/Red's focus drain
 * (an `edha-focus` rule on ITS document); the name-keyed takeover always ran the Chaos flow, so
 * Red's card was unreachable until the split. The mark helpers are status-parameterized now
 * (edhaBearsMyMark / edhaRemoveMark) and H3's reconcile-on-read keeps the ledger honest when the
 * Reaction removes a marked Omen the ledger tracked.
 * ============================================================================================ */

function edhaBearsMyMark(owner, actor, status = "omen") {
  return !!(actor?.statuses?.has?.(status)) && (actor?.flags?.["edha-content"]?.markedBy?.[status]?.actorId === owner?.id);
}
// (edhaRollColorTest retired 2bW — its last caller, Death Ward's hand-rolled Black test, now rides H1.)
/* --- edhaTreeCard (ENGINE PASS 5.3, Job 4; R-67) — ONE poster for "post a burst-card carrying this
 * tree's dice". Six near-identical functions (Chaos/Fate/Death/Civ/Power/Order) built the exact same
 * ChatMessage.create; Death/Civ/Power/Order already carried the optional `{whisper}` R-62-style
 * option, Chaos/Fate did not — R-67 adds it to all six uniformly (additive only: no call site below
 * passes `whisper: true` for Chaos or Fate today, so nothing whispers that didn't before). Each tree
 * section's own call sites now call this directly (rule 3: the section header is still the ledger of
 * what posts through it — see "Button binding" style pointer comments left where each wrapper lived). */
function edhaTreeCard(owner, rolls, html, { whisper = false } = {}) {
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), rolls: rolls || [],
    ...(whisper ? { whisper: edhaWhisperIds(owner) } : {}), content: `<div class="edha-burst-card">${html}</div>` });
}
// edhaChaosCard moved onto edhaTreeCard(owner, rolls, html, opts) — Job 4, pass 5.3 (call sites below updated directly).

/* --- Mark remove (the Marked pattern) — placement is H3's since 2bU; the reroll Reaction removes
 * by hand, and H3's reconcile-on-read drops the ledger entry when it does. Status-parameterized
 * 2bY (was omen-only). ---------------------------------------------------------------------- */
async function edhaRemoveMark(owner, target, status = "omen") {
  if (!target) return;
  await edhaToggleStatus(target, status, false);
  // Job 6a: routed through edhaSetEdhaFlag — behavior flip, was a SILENT drop with no GM online, now
  // warns + returns false like the majority convention. 🤖 bench row.
  await edhaSetEdhaFlag(target, `markedBy.${status}`, null);
}


/* Spreading Omen · Unweaving · Cascade Collapse · Unravel Everything moved onto their documents
 * 07-25 (pass 2bU, iron rule 2b) — H1 gated tests plus the 2bU widenings: H1's `targetList`
 * owner-sweep (one shared roll, per-member defense gate), H3's `near-victim` / `enemies-range`
 * placements, H6's `effects` dispel source, and `unlessTargetStatus` on the trigger family.
 * Do not re-add cases for them. */

/* --- `edha-reroll-react` (2bY — was the name-keyed Shatter Focus flow): remove your mark from
 * the targeted enemy and reroll-take-lower its most recent test. ENGINE-OWNED per §9o (the chat
 * scan, the kept-d20 rewrite and its cross-client relay are a card/message flow no rule chain
 * expresses), keyed on the RULE: the mark status rides it, the system charges the cost, and the
 * "target bears no mark of yours" refusal is vetoed BEFORE cost. Deity/Chaos's Shatter Focus is
 * the first consumer — RED's same-named talent is a different card (edha-focus drain) and no
 * longer shares its engine path. */
function edhaLatestRollMessageOf(actor) {
  const msgs = game.messages?.contents ?? [];
  for (let i = msgs.length - 1; i >= 0 && i >= msgs.length - 50; i--) {
    const m = msgs[i]; if (!m?.rolls?.length) continue;
    const spk = ChatMessage.getSpeakerActor(m.speaker);
    if (spk && actor && spk.id === actor.id) return m;
  }
  return null;
}
async function edhaRerollReactFlow(item, h) {
  try {
    const owner = item.actor; if (!owner) return;
    const status = String(h.markStatus || "omen").trim() || "omen";
    const statusLabel = edhaConditionLabel(status) || status;
    // re-arm the auto-prompts — a real use is the opt-back-in (the mute is per-rule)
    try { if (owner.getFlag?.("edha-content", `promptOff.${item.id}`)) await owner.unsetFlag("edha-content", `promptOff.${item.id}`); } catch (e) {}
    try { if (owner.getFlag?.("edha-content", "shatterPromptOff")) await owner.unsetFlag("edha-content", "shatterPromptOff"); } catch (e) {}   // legacy pre-2bY key
    const target = edhaUserTargetActor();
    if (!target) { ui.notifications?.warn("Edha: target the enemy who is making the test."); return; }
    if (!edhaBearsMyMark(owner, target, status)) { ui.notifications?.warn(`Edha: ${target.name} bears no ${statusLabel} of yours.`); return; }
    await edhaRemoveMark(owner, target, status);
    const msg = edhaLatestRollMessageOf(target);
    if (!msg) { edhaTreeCard(owner, null, `<p>🩸 <strong>${item.name}</strong>: ${statusLabel} removed from ${target.name}. No recent test found — the GM imposes the reroll-take-lower by hand.</p>`); return; }
    const oldRoll = msg.rolls[0];
    const oldTotal = Number(oldRoll.total) || 0;
    const oldNat = Number(edhaKeptD20Nat(oldRoll)) || 0;
    const reroll = await new Roll("1d20").evaluate();
    const newNat = Number(reroll.total) || 0;
    if (oldNat && newNat >= oldNat) {
      edhaTreeCard(owner, [reroll], `<p>🩸 <strong>${item.name}</strong>: ${statusLabel} removed from ${target.name}; reroll d20 = <strong>${newNat}</strong> ≥ kept ${oldNat} — the original test stands.</p>`);
      return;
    }
    const newTotal = oldTotal - (oldNat - newNat);
    await edhaRewriteOrRelay(target, oldTotal, newTotal, `<em>${item.name}</em> (${owner.name}): reroll d20 ${oldNat}→${newNat}; total ${oldTotal}→<strong>${newTotal}</strong> (take the lower).`);
    edhaTreeCard(owner, [reroll], `<p>🩸 <strong>${item.name}</strong>: ${statusLabel} removed from ${target.name}; rerolled the d20 ${oldNat}→<strong>${newNat}</strong> — ${target.name}'s test drops to <strong>${newTotal}</strong>.</p>`);
  } catch (e) { console.error("Edha Content | reroll-react flow failed", e); }
}
// The pre-cost veto: every gate the retired takeover checked before edhaConsumeCost moves here
// (the H1/H3/H12 shape) — a mistaken click spends nothing.
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const h = edhaRuleOf(item, "edha-reroll-react"); if (!h) return;
    const status = String(h.markStatus || "omen").trim() || "omen";
    const target = edhaUserTargetActor();
    if (!target) { ui.notifications?.warn(`Edha: ${item.name} — target the enemy who is making the test (nothing spent).`); return false; }
    if (!edhaBearsMyMark(actor, target, status)) {
      ui.notifications?.warn(`Edha: ${target.name} bears no ${edhaConditionLabel(status) || status} of yours — nothing spent.`);
      return false;
    }
  } catch (e) { /* never block a use on a guard failure */ }
});

/* --- Reroll-Reaction AUTO-PROMPT (wired 2026-07-04, Ben-approved shape; rule-keyed 2bY) ------------
 * On every foe TEST (the contest-watch Roll hooks — they fire once, on the rolling client), whisper
 * the Reaction reminder to the owner whose mark the roller bears — found through the owner's
 * `edha-reroll-react` rule (autoPrompt field), never a talent name. Never auto-fires: the owner
 * still uses the talent natively. Spam controls: (1) only mark-bearers prompt at all, (2) once per
 * foe per turn, (3) the card's Mute button sets promptOff.<rule item> — a real use re-arms.
 * ⚑ bench: reassess spam live. */
const _edhaShatterPrompted = new Map();
function edhaShatterPromptGate(key) {
  const c = game.combat;
  const tag = c?.started ? `r${c.round}t${c.turn}` : null;
  const prev = _edhaShatterPrompted.get(key);
  if (tag != null) { if (prev === tag) return false; _edhaShatterPrompted.set(key, tag); return true; }
  const now = Date.now();
  if (typeof prev === "number" && now - prev < 30000) return false;
  _edhaShatterPrompted.set(key, now); return true;
}
function edhaChaosShatterPrompt(roll, source, config) {
  try {
    const foe = edhaD20RollActor(config); if (!foe) return;
    const marks = foe.flags?.["edha-content"]?.markedBy; if (!marks) return;   // fast path — only mark-bearers can prompt
    for (const [status, mk] of Object.entries(marks)) {
      if (!foe.statuses?.has?.(status)) continue;
      const owner = mk?.actorId ? game.actors?.get(mk.actorId) : null;
      if (!owner || owner === foe) continue;
      let rule = null;
      for (const { item: tal, handler: rh } of edhaActorRulesOf(owner, "edha-reroll-react")) {
        if (String(rh.markStatus || "omen") === status) { rule = { item: tal, handler: rh }; break; }
      }
      if (!rule || rule.handler.autoPrompt === false) continue;
      if (owner.getFlag?.("edha-content", `promptOff.${rule.item.id}`) || owner.getFlag?.("edha-content", "shatterPromptOff")) continue;
      if (!edhaDisposHostile(owner, foe)) continue;   // enemies only — item 77: was `if (edhaSameDisposition(...)) continue`, which prompted for a bearer whose side did not resolve; the predicate the branch means fails CLOSED (R-63) 🤖 bench row
      if (!edhaShatterPromptGate(`${owner.id}:${foe.id}`)) continue;
      const statusLabel = edhaConditionLabel(status) || status;
      ChatMessage.create({
        whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🩸 <strong>${rule.item.name}</strong> — ${foe.name} (your ${statusLabel}-bearer) just rolled a test (kept total <strong>${Number(roll?.total) || "?"}</strong>). React? Target ${foe.name} and use <strong>${rule.item.name}</strong>: the ${statusLabel} is removed and the test rerolls-take-lower.</p>`
          + `<button type="button" class="edha-shatter-mute" data-edha-owner="${owner.uuid}" data-edha-item="${rule.item.id}">🔇 Mute these prompts (a real use re-arms them)</button></div>`,
      });
    }
  } catch (e) { console.error("Edha Content | reroll-react prompt failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaChaosShatterPrompt);
// Button binding: EDHA_CARD_BUTTONS["edha-shatter-mute"] (Job 1, pass 5.3, end of file — the click
// body moved there too, since it was inline; it GAINS an R-59 outer catch it didn't have before).

/* Void Sense moved onto its document 07-25 (pass 2bU): the Inv-recovery + which status reveals are
 * a generic `edha-sense-reveal` rule (see edhaSenseRevealOnDamage / edhaSenseRevealShows). The
 * per-viewer canvas RENDERING is ENGINE_OWNED — a rule cannot rewire another client's veil. */

/* --- Chaos dispatch: DELETED 2bY (iron rule 2b) — EDHA_CHAOS_TALENTS is GONE. Its last name was
 * Shatter Focus, which is TWO talents: deity/Chaos's (the Omen reroll-take-lower — now the
 * `edha-reroll-react` rule above, system cost + pre-cost veto) and leyline/Red's (the focus
 * drain — an `edha-focus` rule on ITS document). The takeover matched both by name and always ran
 * the Chaos flow, so Red's card was unreachable; each document now carries its own behaviour.
 * Entropy Strike · Isolating Pressure · Isolating Ruin (07-24p) · Spreading Omen · Unweaving ·
 * Cascade Collapse · Unravel Everything (2bU) are on their documents — do not re-add a Set. */

// Clear Omen / inflicted-Isolated statuses + markedBy at scene/combat end (GM-side), like the Charge/Life flags.
// 07-27b (bench run 5, Chaos residual (c) — triaged as a DEFECT, not a ruling): this sweep predated
// the 2bU ledger repoint and never learned about `lists.omens` — combat delete left every owner's
// Omen ledger intact, plus the markers on any OFF-CANVAS bearer (the token-only-sweep trap the
// combat-expiry sweep documents). The reconcile makes a stale entry near-harmless only while its
// token still resolves; once it doesn't, the fail-open keep becomes phantom cap pressure next
// scene. Death's clear is the established convention (statuses on tokens AND directory actors, the
// ledger key on characters) — Chaos now matches it. markedBy.isolated joins for symmetry.
//
// 07-27d (bench run 6, attempt 2 — the ledger/off-canvas halves STILL failed on the 07-27b code
// while the canvas-statuses half and the trigRound sweep both ran): the 07-27b body was the only
// deleteCombat clear whose per-actor awaits were UNGUARDED — Death wraps every toggle/unset in its
// own try/catch; this one only wrapped the flag unsets. All ~17 scene clears launch concurrently
// off one deleteCombat, so a single rejection anywhere (the proven shape: toggleStatusEffect's
// deleteEmbeddedDocuments throwing on an AE a concurrent sweep already deleted — core has no
// missing-id tolerance there) aborted the remaining canvas loop AND both later halves via the
// outer catch, which is exactly the dead-halves signature the bench saw. Three changes:
//   1. THE LEDGER UNSET RUNS FIRST — the half whose survival causes phantom cap pressure can no
//      longer be starved by a status failure later in the sweep.
//   2. Every await is individually guarded (Death's convention) AND each actor is wrapped, so a
//      statuses-getter throw skips that actor alone.
//   3. Failures console.warn WITH the actor's name — if anything still rejects at run 7, the
//      console names the culprit instead of silently eating two loops.
// Chaos was already the "Chaos-pattern population" reference (07-27d: tokens ∪ directory, deduped,
// per-call try/catch) — edhaSceneReset generalizes exactly this shape, so this collapses to one
// call. The omens ledger no longer needs to run FIRST in its own characters-only pass: since every
// flag/status now shares one per-actor try/catch block, a rejecting status toggle on one actor can
// no longer starve another actor's ledger unset (07-27d's bug) — isolation is per-actor, not by
// which half of the sweep runs first.
async function edhaClearChaosState(endedCombat) {
  await edhaSceneReset(endedCombat, {
    key: "chaos",
    flags: ["lists.omens", "markedBy.omen", "markedBy.isolated"],
    statuses: ["omen", "isolated"],
  });
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

