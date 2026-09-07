/* ============================================================================================
 * BLACK / SUBJUGATION tree engine (2026-06-13c) — focus economy + control flags.
 *  - Focus watcher (preUpdateActor → updateActor, GM-side): a creature whose `foc` DROPS is
 *    ANNOUNCED as `edha-watch` kind `focus-change`. It used to name three talents; see below.
 *  - Next-test advantage flag (reuses for any "advantage on next <skill>"; round-stamped 07-05 so
 *    "this round" actually expires).
 * 2026-07-05 upgrades (Ben's Black test pass):
 *  - Hollow Command — ON ITS DOCUMENT since 07-24r (see below). Was: contest-resolved Deception vs
 *    Spiritual via edhaQueueContest, `noactions` marker, auto-firing Siphoned Will (focus = tier).
 *  - Extract Thought — PASSIVE watcher on the owner's Deception tests: total vs the target's Spiritual →
 *    on success the target wears the registered `noreactions` marker (end of the OWNER's next turn).
 *    No synced target / unreadable defense → owner-judged click-card.
 *  - Puppeteer — turn-start cue: a combatant at 0 focus in a Puppeteer owner's Attunement Range starts its
 *    turn → whispered reaction card (spend 2 Focus + 1 Inv on click; the forced action itself is GM-run).
 *  - Predatory Insight active = the first `edha-opportunity-option` menu entry (see the Opportunity menu).
 * MANUAL by nature (no Foundry enforcement): the commanded/puppeted creature's forced ACTIONS themselves
 * (volition has no hook) — the markers/cards above make the states table-visible.
 * ✅ IRON RULE 2b — Extract Thought CONVERTED 07-24q, and it is the talent that names H8's real gap.
 *   It was never "missing a payload": it is a passive watcher on EVERY Deception roll its owner
 *   makes, and `edha-def-test` fires on `use`. Its document now carries `edha-watch`
 *   {watch: skill-roll, whenSkill: dec, vs: defense/spi} plus the `noreactions` status on
 *   edha-test-success. Two behaviour notes, both benched (2bH-3, 2bH-4):
 *     · Silence on a miss needed NO field — the talent simply carries no edha-test-fail rule.
 *     · An UNREADABLE Spiritual defense now FAILS OPEN (H1's documented convention, edhaDefTestOutcome)
 *       where the hand-rolled version posted an owner-judged click-card instead. Deliberate, and the
 *       stricter direction per iron rule 3, but it IS a change.
 * ✅ IRON RULE 2b — FIVE MORE CONVERTED 07-24r, and the tree's whole focus watcher went with them.
 *   The atom here was never a talent: it was the WATCHER. Whispered Doubt, Coercive Pressure and
 *   Predatory Insight were three loops inside one function, sharing its gates and its once-per-round
 *   bookkeeping, so converting one would have left the other two reading a function that no longer
 *   ran the checks they relied on. All three moved together onto `edha-watch` {watch: focus-change}:
 *     · Whispered Doubt    — scene / enemy / rangeColor black / once round-per-target → `edha-focus`
 *                            drain 1 on the creature that spent.
 *     · Coercive Pressure  — same gates → `edha-next-test-mod` {target: victim, disadvantage,
 *                            attr: "int, wil"}, which is what the bespoke `cogDisadv` flag was.
 *     · Predatory Insight  — scene, no range, `whenTotal: at-most 0` → `edha-focus` gain 1 on self.
 *                            It is the ONE rule in the project with `chain: true`, because the 07-05
 *                            test pass proved it must still fire when Whispered Doubt's own extra
 *                            loss is what emptied the creature.
 *   And the pair the 07-24p note below said would go together, which did:
 *     · Hollow Command     — `edha-def-test` dec vs spi + the `noactions` marker (target-relative).
 *     · SIPHONED WILL      — the UPGRADE-TALENT exit (pass F): its focus = tier rides Hollow Command's
 *                            success as `edha-focus` {gain, self, @tier, whenOwnsTalent: "Siphoned
 *                            Will", label: "Siphoned Will"}. ⚑ ITS OWN DOCUMENT IS EMPTY — editing
 *                            its line means editing Hollow Command's rule. Declared, not an oversight.
 *   ⚑ Hollow Command no longer posts an owner-judged card when the Spiritual defense is unreadable;
 *   H1 fails OPEN instead. Same deliberate change as Extract Thought (2bH-11) and it wants the same
 *   ruling — benched as 2bI-8.
 * ⚑ Puppeteer converted 07-24s (H6 + the turn-start watch). Dread Presence converted 2bZ: its
 *   ENGINE-OWNED exit re-litigated into the rule-keyed `edha-move-veto` (the pass-Y shape) — the
 *   hook stays, what it consults is the document, and the adversary copies carry their own rule.
 * ============================================================================================ */
/* edhaOwnersOf + edhaWithinAttune are GONE (2bZ): their last consumer was the Dread Presence
 * movement veto, which is rule-keyed now (`edha-move-veto`). The W29/ruling-113 adversary-owner
 * widening they carried is inherited for free — edhaWatchersOfRule sweeps canvas tokens, which is
 * exactly where unlinked adversary owners live. edhaCharacterOwnersOf(name) followed 07-26 (the
 * pre-deploy orphan sweep): it was the name-keyed sweeps' entry point, and the migration deleted
 * its last caller — a name-keyed owner scan has no legitimate future consumer. */
function edhaDisposHostile(owner, target) {
  // R-63 (hygiene campaign 2026-08-10): was `!ot || !tt` -> true (fail OPEN to "enemy"), and even with
  // both tokens present the `?? 0` defaults an unresolvable disposition to NEUTRAL on either side —
  // one known + one unknown compared unequal and read as hostile. Number.isFinite unifies both cases:
  // no token AND a token with a non-numeric disposition both fail CLOSED (not hostile) the same way
  // edhaAllyDropEligible already does. Behavior flip: a genuinely tokenless/unset-disposition actor
  // used to count as hostile; it does not now. 🤖 bench row.
  const od = edhaCasterToken(owner)?.document?.disposition;
  const td = edhaCasterToken(target)?.document?.disposition;
  if (!Number.isFinite(od) || !Number.isFinite(td)) return false;
  return od !== td;
}
// The once-per-round-per-creature pair (flags.edha-content.focusRound, keyed by talent NAME) retired
// 07-24r with its only two callers. H8's `once: "round-per-target"` budget is the generic form and it
// keys on the RULE's item uuid, so it needs no name at all.
async function edhaGainFocus(actor, n, source) {
  const foc = actor?.system?.resources?.foc; if (!foc) return;
  const max = edhaResVal(foc) ?? ((foc.value ?? 0) + n);
  const cur = Number(foc.value) || 0, next = Math.min(max, cur + n);
  if (next <= cur) return;
  _edhaInFocusWatch = true;
  try { await edhaResourceWrite(actor, "foc", { value: next }, { edhaFocusWatch: true, ...edhaBookkeepingTag(`${source} (focus gain)`) }); } finally { _edhaInFocusWatch = false; }
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧠 <strong>${source}</strong>: ${actor.name} regains ${next - cur} focus.</p>` });
}
let _edhaInFocusWatch = false;
// Capture old→new focus on the in-flight update (the post hook only sees the new value).
Hooks.on("preUpdateActor", (actor, changes, options) => {
  try {
    const nf = foundry.utils.getProperty(changes, "system.resources.foc.value");
    if (nf === undefined) return;
    options.edhaFoc = { old: Number(actor.system?.resources?.foc?.value) || 0, new: Number(nf) || 0 };
  } catch (e) {}
});
Hooks.on("updateActor", async (actor, changes, options) => {
  try {
    if (options?.edhaFocusWatch || _edhaInFocusWatch) return;   // our own follow-up writes
    if (!edhaDefBuffGmGate()) return;
    const f = options?.edhaFoc;
    if (!f || f.new >= f.old) return;                            // only on a DECREASE
    // R-4 / #28b: …and only a decrease something SAID was a spend. A GM correcting the sheet is
    // not one, and used to tax the creature through every enemy focus-change watcher.
    if (!edhaIsSpend(actor, "foc", options, f.old, f.new)) return;
    await edhaRunFocusWatch(actor, f.old, f.new);
  } catch (e) { console.error("Edha Content | focus watch failed", e); }
});
/* IRON RULE 2b, 07-24r — this WAS the three-talent name-keyed focus watcher. It is now one
 * ANNOUNCEMENT (pass H's move: make the call site say what happened rather than route it to a
 * named talent), and all three passives read it off their own documents via `edha-watch`
 * {watch: "focus-change"}. Everything the hand-rolled loops enforced is re-provided generically:
 *   in-range          → the watch rule's `rangeColor: "black"`
 *   enemies only      → `disposition: "enemy"` (Ben pass 3, 07-12 — an ALLY spending focus must
 *                        not hand the owner the debuff)
 *   once/round/enemy  → `once: "round-per-target"` keyed on the payload subject
 *   "reaches 0 focus" → `whenTotal: "at-most", whenTotalValue: 0`
 *   adversary owners  → edhaWatchActors() already sweeps canvas tokens (W29 ruling 113)
 * The one thing an announcement cannot inherit is the 07-05 lesson that a SECONDARY loss (Whispered
 * Doubt's own extra focus) must still be seen — hence `chain` on the watch rule and the announcement
 * at the tail of edhaDrainFocus. */
async function edhaRunFocusWatch(target, oldFoc, newFoc) {
  await edhaDispatchWatchers({ kind: "focus-change", owner: target, victim: null, skill: null, def: null, ok: null, total: Number(newFoc) || 0 });
}
/* The bespoke `cogDisadv` flag and its pre-roll/consume pair went with Coercive Pressure (07-24r).
 * It was a private second copy of the nextTestMod pipeline — same advantageMode write, same
 * consume-and-announce — differing only in that it filtered on the test's ATTRIBUTE. nextTestMod
 * has carried an `attr` gate since the Red/Blue Attunement keys (07-03c), so the enforcement is
 * re-provided in full by `edha-next-test-mod` {target: victim, mode: disadvantage, attr: "int, wil"}
 * and nothing is lost. ✅ The narrowing benched as 2bI-4 is GONE (item 49, Ben's R-15(b)):
 * nextTestMod is a LIST, so a creature already carrying another next-test rider now keeps BOTH as
 * independent, independently-consumed entries. Any cogDisadv flag left on a live actor by the
 * pre-deploy build is inert from now on — nothing reads it. */
// "Advantage on your next <skill> test" flag (Predatory Insight → Deception). Consumed on the matching
// test. Flag shape: "dec" (legacy) OR { skill, round, source } — a round-stamped grant silently expires
// once the combat round moves on (the talent text says "this round"; the old flag lived forever).
function edhaAdvTestRead(actor) {
  const g = actor?.getFlag?.("edha-content", "advTest");
  if (!g) return null;
  const sk = typeof g === "string" ? g : g.skill;
  const round = (typeof g === "object" && g.round != null) ? g.round : null;
  const now = edhaCombatRoundOf(actor);   // R-4/#28a: the BEARER's combat decides whether its round is over
  if (round != null && now != null && now !== round) {
    void actor.unsetFlag("edha-content", "advTest");   // stale — the granting round is over
    return null;
  }
  // The label defaults generically (07-24r). It used to name the talent that was this flag's only
  // writer; the sole writer is now the Opportunity menu, which always stamps its own item's name, so
  // the fallback is only reachable by a legacy string-shaped flag written before 07-05.
  return sk ? { skill: sk, source: (typeof g === "object" && g.source) || "Opportunity" } : null;
}
function edhaAdvTestPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = edhaAdvTestRead(actor);
    if (!g || roll?.data?.skill?.id !== g.skill) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | adv-test pre-roll failed", e); }
}
function edhaAdvTestConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const g = edhaAdvTestRead(actor);
    if (!g || roll?.data?.skill?.id !== g.skill) return;
    void actor.unsetFlag("edha-content", "advTest");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>👁️ <strong>${g.source}</strong> — advantage spent on this ${g.skill.toUpperCase()} test.</p>` });
  } catch (e) { console.error("Edha Content | adv-test consume failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaAdvTestPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaAdvTestConsume);
}
/* The Subjugation on-use hook is GONE (07-24r). Both of its branches moved onto their documents:
 *   · Predatory Insight's direct-use fallback → `edha-next-test-mod` {target: self, mode: advantage,
 *     skill: dec, expireEndOfRound}. The two fields that conversion needed are the ones the bespoke
 *     `advTest` flag had and nextTestMod did not; adding them retires a private duplicate of the same
 *     pipeline rather than adding a mechanism.
 *   · Hollow Command → `edha-def-test` dec vs spi (its own hand-rolled contest was already exactly
 *     H1's shape) + the `noactions` marker + SIPHONED WILL's focus as a `whenOwnsTalent`-gated
 *     `edha-focus` rule on the SAME success. That is the UPGRADE-TALENT exit pass F established:
 *     Siphoned Will's own document is empty and its line lives on its parent's rule — declared in the
 *     tree-section header above, not silently.
 * ⚑ One behaviour change, benched as 2bI-8: the owner-judged fallback card for an UNREADABLE
 * Spiritual defense is gone, because H1 fails OPEN on an unreadable bar. Same trade Extract Thought
 * took in pass H (2bH-11) and it wants the same single ruling. */

/* Puppeteer — ON ITS DOCUMENT since 07-24s (iron rule 2b). `edhaPuppeteerTurnCue` and its two combat
 * hooks are deleted; the talent carries an `edha-watch` {watch: turn-start, scope: scene,
 * payloadTarget: actor, whenTotal: at-most 0, rangeColor: black, includeSelf: false} and an H6
 * `edha-prompt-pick` {source: confirm, costs: "foc:2, inv:1", once: round} on edha-test-success.
 *
 * IT IS THE FIRST CONSUMER OF THE `turn-start` WATCH KIND, and the kind was built WITH it rather
 * than schema-only — audit §9o's rule for the remaining kinds, applied. The other four consumers
 * queued under `turn-start` (Apex Form, Primal Regeneration, Consuming Decay, Bear Witness) each
 * still need a payload that does not exist; Puppeteer's payload is H6's own offer card, so it is the
 * one that could land. `total` carries the combatant's CURRENT FOCUS, which is what makes "starts
 * its turn at 0 focus" a plain numeric gate rather than a kind-specific field.
 *
 * The borrowed action itself stays GM-run — the talent carries no payload rule at all, which is
 * exactly what makes H6 post its `note` instead. Do NOT re-add a turn-change hook here. */

/* R-38 — the move veto's ANNOUNCE throttle. One whispered card per TOKEN per ROUND: a dragged
 * path fires preUpdateToken once per waypoint and every one of them is refused, so an unthrottled
 * card would post a wall of identical whispers for a single failed drag. Keyed on the round when
 * there is a combat and on the combat-less encounter otherwise (`null` round = one card until a
 * combat starts, which is the same "once per beat" the player experiences out of initiative).
 * Pure but for the module-level ledger, which is passed in so a test can drive it. */
const _edhaMoveVetoSaid = new Map();
function edhaMoveVetoAnnounceGate(tokenKey, round = game.combat?.round ?? null, ledger = _edhaMoveVetoSaid) {
  const key = String(tokenKey ?? "");
  if (!key) return true;                       // no identity to throttle on — never swallow the card
  const seen = ledger.get(key);
  if (seen !== undefined && seen === round) return false;
  ledger.set(key, round);
  return true;
}
// The MOVE VETO (2bZ — was Dread Presence's name-keyed hook, rule-keyed now: the pass-Y shape). A
// creature bearing the rule's status inside a rule owner's range cannot WILLINGLY move closer to
// any of its allies — vetoed on the moving client (preUpdateToken runs there) with a warning
// naming the blocked ally. Engine-forced movement (push/slide/teleport relays) sets
// options.edhaForced and bypasses. The sweep ANNOUNCES (edhaWatchersOfRule), which inherits the
// W29/ruling-113 adversary-owner widening for free: the Dirgehound/Cragdrake/Elder copies in the
// ADVERSARY pack carry the same rule on their own trait documents (rangeFt pinned where the block
// prints a fixed figure).
Hooks.on("preUpdateToken", (doc, changes, options) => {
  try {
    if (options?.edhaForced) return;                              // pushes/slides are not willing movement
    if (!("x" in changes) && !("y" in changes)) return;
    const tok = doc.object, actor = doc.actor;
    if (!tok || !actor) return;
    let live = null;
    for (const w of edhaWatchersOfRule("edha-move-veto")) {
      const h = w.handler;
      if (w.actor === actor) continue;                            // your own presence never pins you
      const st = String(h.moverStatus || "weakened").trim();
      if (st && !actor.statuses?.has?.(st)) continue;
      const otok = edhaCasterToken(w.actor); if (!otok) continue;
      const ft = Number(h.rangeFt) > 0 ? Number(h.rangeFt) : edhaAttuneFtColor(w.actor, h.rangeColor || "black");
      if (!edhaTokensWithin(otok, ft).some(t => t.id === tok.id)) continue;
      live = w; break;
    }
    if (!live) return;
    const gs = (doc.parent?.grid?.size || 100), gd = (doc.parent?.grid?.distance || 5);
    const w = (doc.width ?? 1) * gs / 2, h = (doc.height ?? 1) * gs / 2;
    const oldC = { x: doc.x + w, y: doc.y + h };
    const newC = { x: (changes.x ?? doc.x) + w, y: (changes.y ?? doc.y) + h };
    const disp = doc.disposition;
    for (const t of (canvas?.tokens?.placeables ?? [])) {
      if (t.id === doc.id || !t.actor) continue;
      if (!edhaSideSame(t.document?.disposition, disp)) continue;   // allies only — unknown side fails CLOSED (R-63): no ally, no move veto
      if ((t.actor.system?.resources?.hea?.value ?? 1) <= 0) continue;
      const dOld = Math.hypot(t.center.x - oldC.x, t.center.y - oldC.y);
      const dNew = Math.hypot(t.center.x - newC.x, t.center.y - newC.y);
      if (dNew < dOld - 1) {                                       // measurably closer to this ally
        const why = `${actor.name} is ${edhaConditionLabel(String(live.handler.moverStatus || "weakened")) || "Weakened"} and cannot willingly move closer to ${t.actor.name}. (Engine-forced movement bypasses this.)`;
        ui.notifications?.warn(`${live.item.name}: ${why}`);
        /* R-38 (Ben 2026-09-06 (a)): a refused move used to leave NOTHING but a transient toast on
         * the mover's own client — three refused moves at bench run 21 read exactly like a broken
         * range gate and cost the run real time. The veto now says so in chat, whispered to the
         * mover's owners + the GMs, naming the talent that stopped it. Throttled per token per
         * ROUND: a dragged path re-fires preUpdateToken for every waypoint, and one card per
         * waypoint would be the same silence wearing a different costume. */
        if (edhaMoveVetoAnnounceGate(doc.id ?? doc.uuid ?? actor.id)) {
          ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
            content: `<p>🚫 <strong>${live.item.name}</strong>: ${why}</p>` });
        }
        return false;
      }
    }
  } catch (e) { console.error("Edha Content | move-veto failed", e); }
});

