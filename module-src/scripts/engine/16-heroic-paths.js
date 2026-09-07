/* ============================== HEROIC PATHS — full wiring pass (07-18h) =========================
 * All 133 unique heroic talents accounted for (iron rule 3), in THREE classes:
 *   WIRED       — engine name-based here, or authored events/effects (works on deploy).
 *   CAE-NEXT    — action-economy behaviors that wire against **Cosmere Advanced Encounters**
 *                 (Ben 07-18: installed — per-combatant action/reaction tracker; Automated
 *                 Actions is NOT installed and won't be, Draw Mana covers its ground better).
 *                 GATED on the CAE api/flag capture in the items dump; each entry below names
 *                 its hook class: [grant-action] [grant-reaction] [burn-reaction] [cost-discount]
 *                 [cadence]. These are NOT manual and NOT §9i-parked — they are the next wiring
 *                 tranche once the dump lands.
 *   MANUAL      — genuinely no hook: motivation-knowledge (the intent precedent), disguise
 *                 identity beats, GM strength-reads, the crafting/fabrial cluster (no subsystem
 *                 in the free system), the animal-companion cluster (no companion actor — §9j
 *                 names the build), Shardplate/Shardblade gear, hit→graze adjudication.
 *
 * The Opportunity class is WIRED as of this pass: adders (High Society Contacts / Underworld
 * Contacts / Rumormonger / Well Supplied) bank a +1-Opportunity credit on use (focus paid
 * natively) that the next test's menu card cashes; spenders ride `edha-opportunity-option`
 * rules (Anatomical Insight authored; Predatory Insight was the 07-05 first consumer).
 *
 * AGENT — WIRED: Cheap Shot (on-hit Stunned, authored), Subtle Takedown (on-hit cue, authored),
 *   Risky Behavior (raise stakes), High Society/Underworld Contacts (Opportunity credit),
 *   Plausible Excuse (rolls; feign-innocence is the roll's story). CAE-NEXT: Fast Talker/Quick
 *   Analysis/Trickster's Hand [grant-action ×2], Opportunist/Double Down/Sure Outcome/Watchful
 *   Eye [cadence — once-per-round reroll tracking; the plot-die reroll itself is the player's
 *   click]. MANUAL: Cover Story/Mercurial Façade (identity beats; Surprised-on-discovery is a
 *   table read), Sleuth's Instincts + Get 'Em Talking's payoff (motivation is not data — the
 *   intent precedent), Close the Case ("backs down" — the gate posts the result), Shadow Step
 *   (per-enemy hide placement stays the GM's), Baleful (NPC focus spending isn't visible).
 * ENVOY — WIRED: Rousing Presence cluster (Determined + owned-rider options: Instill/Devoted/
 *   Stalwart/Rallying/Lessons), Steadfast Challenge (contest → Disoriented + counted disadv;
 *   Calm Appeal rides the card), Galvanize (recovery-die focus restore — authored, H17 since 2bZ),
 *   Collected/Composed/
 *   Customary Garb (AEs). CAE-NEXT: Foresight [grant-reaction], Practical Demonstration/Sage
 *   Counsel/Sound Advice [grant-action — free RP], Practiced Oratory [cost-tracking multi-
 *   target]. MANUAL: Peaceful Solution (ending combat is the GM's), Withering Retort (pre-attack
 *   reaction timing), Inspired Zeal (an ally SPENDING Determined isn't hookable), Well Dressed
 *   (attire + first-test — table read), Applied Motivation (rides engine focus-restores only).
 * HUNTER — WIRED: the QUARRY core (Seek/Tagging/Cold Eyes/Pack Hunting + attack advantage),
 *   Startling Blow (on-hit Surprised, authored), Hardy/Surefooted (AEs). CAE-NEXT: Swift
 *   Strikes/Unrelenting Salvo/Exploit Weakness [cadence/grant-action], Backstep [grant-action —
 *   free Disengage], Sidestep [grant-reaction]. MANUAL: the companion cluster (Animal Bond/
 *   Feral Connection/Hunter's Edge/Protective Bond — no companion actor; §9j names the build),
 *   Deadly Trap/Experienced Trapper (GM-side terrain; hazard Regions are the named future hook),
 *   Killing Edge (item trait edits — gear pass), Shadowing (senses are table reads), Steady Aim
 *   (range/damage read off the card at roll time), Fatal Thrust ("unsuspecting" is a table read;
 *   the attack is the system's weapon roll and the 4d4/advantage riders read off the card —
 *   Steady Aim's class. Named here 07-26: it was one of the audit's four undeclared-and-empty).
 * LEADER — WIRED: the COMMAND-DIE cluster (scaling die, self-add cards, Relentless March +
 *   Authority riders on Decisive Command), Valiant Intervention/Tactical Ploy/Synchronized
 *   Assault/Set at Odds/Turning Point/Grand Deception (gates), Resilient Hero (HP-floor veto),
 *   Rumormonger/Well Supplied (Opportunity credit), Focused Mind/Hardy/Customary Garb (AEs).
 *   CAE-NEXT: Combat Coordination [grant-action — free DC after a Strike], Through the Fray/
 *   Resolute Stand [grant-reaction / burn-reaction], Synchronized Assault + Turning Point's
 *   granted Strikes/Actions [grant-action — the gate cards name the counts today]. MANUAL:
 *   Imposing Posture (NPC influence-resist isn't visible — the Pack Tactics class), Cutthroat
 *   Tactics (the ally's plot-die choice), Authority's ally-count half (whoever the card reaches).
 * SCHOLAR — WIRED: Field Medicine (authored H1 dc-15 + H17 target-die heal since 2bZ;
 *   Resuscitation = whenOwnsTalent upsell note, declared below),
 *   Anatomical Insight (on-hit cue + Opportunity-menu option, authored), Know Your Moment
 *   (round-window defenses, authored), Swift Healer/Applied Medicine (heal riders, authored),
 *   Clear Mind (AE), Overwhelm with Details (Lore next-test), Sharp Eye-class reveal (gate).
 *   CAE-NEXT: Strategize [grant + burn-reaction half], Contingency [plot-die edit — needs the
 *   ally's roll card, cue today]. MANUAL: the ERUDITION expertise cluster — BY NAME: Mind and
 *   Body, Emotional Intelligence, Deep Study (sheet edits; the native grant-expertises handler is
 *   the named future hook, blocked on ⟳ Sync re-firing add-to-actor on every re-add — the
 *   creator's culture work owns expertise UX. Named here 07-26: two of these were among the
 *   audit's four undeclared-and-empty), the CRAFTING/FABRIAL cluster (Efficient Engineer/
 *   Experimental Tinkering/Fine Handiwork/Inventive Design/Prized Acquisition/Overcharge — no
 *   crafting subsystem in the free system), Ongoing Care (rest-time; rolls fine), Keen Insight
 *   (Gain Advantage isn't a hookable item), Deep Contemplation (Erudition reassign = sheet edit).
 * WARRIOR — ✅ NO BUCKET-2 TALENTS LEFT (07-24s). Feinting Strike was the last, and it moved onto its
 *   document — `edha-focus` drain (@skills.itm.rank, still guard-aware because edhaDrainFocus owns
 *   the focus-guard reduction) + `edha-cae-grant` burn-reaction {target: victim} + an `edha-note` for the graze half,
 *   which stays table-run because grazes are not engine-visible. It needed no new handler: both
 *   halves shipped in passes E and I, and the blocker was edhaDispatchOnHit hand-listing three
 *   handler types so every other rule on `edha-on-hit` was inert. The dispatcher now runs each
 *   rule's own executor. Do NOT re-add a name-keyed on-hit branch.
 * WARRIOR — WIRED: the STANCE machine + numeric riders + skill advantage + Practiced Kata
 *   combat-start, Shattering Blow (on-hit push,
 *   authored), Meteoric Leap (on-hit cue, authored), Devastating Blow/Wit's End (tier formulas),
 *   Wary (authored edha-focus-guard since 2bZ — Surprised veto + drain reduction, rule-keyed),
 *   Hardy/Surefooted (AEs). CAE-NEXT: Vigilant Stance
 *   [cost-discount — Dodge/Reactive Strike −1], Stonestance's attack tax [cost-discount inverse],
 *   Flame/Wind extra actions [grant-action], Combat Training's free graze [cadence], Cautious
 *   Advance [grant-action]. MANUAL: Precise Parry (hit→graze is the GM's — the Combat Training
 *   NO-HOOK class), Shard Training (Shard gear is paid content), Signature Weapon (a weapon-
 *   expertise grant + an Opportunity-range edit are sheet edits — the Erudition class, same
 *   grant-expertises blocker. Named here 07-26: it was one of the audit's four undeclared-and-
 *   empty), Vinestance's reaction test
 *   (cue; the numeric half is wired), Defensive Position/Formation Drills (Brace is the GM's
 *   dis/advantage bookkeeping — re-litigate WITH the CAE dump, it may expose Brace).
 * CONTEST-EXEMPT: none — every opposed line above is vs a DEFENSE (gated below) or a fixed DC.
 *
 * ── IRON RULE 2b STATUS (07-24m/n) ────────────────────────────────────────────────────────────
 * The ledger above describes each talent's MECHANIC and stays accurate. What changed is WHERE the
 * behaviour lives. These are now authored rules on their own documents, and their engine branches
 * are deleted — do not re-add a name-keyed case for any of them:
 *   def-tests (`edha-def-test`)  Synchronized Assault · Set at Odds · Turning Point ·
 *                               Grand Deception · Tactical Ploy (+ two payload rules) ·
 *                               Steadfast Challenge (+3) · Valiant Intervention (+2)   [07-24p]
 *   action economy (`edha-cae-grant`)  Fast Talker · Quick Analysis · Trickster's Hand ·
 *                               Cautious Advance · Backstep · Through the Fray ·
 *                               Foresight · Sidestep
 *   combat-timed (`edha-combat-timing`)  Foresight · Sidestep · Practiced Kata
 *                               (`edha-enter-stance` → Vigilant Stance)
 *   stances (`stanceRider` effect + `edha-test-rider`)  all six, see the stance section
 *   next-test (`edha-next-test-mod` target=self)  the four Opportunity adders · Risky Behavior ·
 *                               Overwhelm with Details
 * STILL name-keyed here: none — Field Medicine + Resuscitation were the last two, converted 2bZ
 *   once H17 (`@target.*` formulas) existed; Sharp Eye left 07-25 with H24. ⚑ RESUSCITATION is a
 *   declared whenOwnsTalent UPSELL on Field Medicine's success note (the pass-F exit): its own
 *   document carries no rule; its 3-focus revive cost rides its own activation.
 * ⚑ Vigilant Stance is now OFF the ratchet with an EMPTY document. That is declared, not an
 *   oversight: its Dodge/Reactive-Strike discount is the CAE-NEXT cost-discount class above, which
 *   no handler can express yet. Its text reaches the table on the stance marker (edhaToggleStance
 *   copies the talent's description onto it). Give it a real rule the moment a CAE cost hook lands.
 * ⚑ CALM APPEAL and RESOLUTE STAND are off the ratchet with EMPTY documents too, and this is the
 *   second declared class: the UPGRADE TALENT. Neither has a hook of its own — each exists only to
 *   sharpen its parent's result (Calm Appeal → Steadfast Challenge, Resolute Stand → Valiant
 *   Intervention), and every earlier pass expressed that as an edhaOwnsTalent call on the upgrade's
 *   name inside the parent, i.e. TWO talents name-keyed to automate ONE mechanic. Ben's 07-24p ruling: keep the
 *   reminder and gate it on the document — the parent's success rule carries the rider text with
 *   `whenOwnsTalent: "<the upgrade>"`, which is authored data on a tab Ben can edit, not an engine
 *   branch. Editing the LINE means editing the parent's rule; that is the trade, and it is written
 *   here so nobody reads the empty tab as an oversight. Same treatment for Blue's Absolute Stillness.
 */
// -- Quarry core -------------------------------------------------------------------------------
/* THE QUARRY LEDGER MOVED (2bX): `flags.edha-content.quarryUuid` (a bare uuid STRING) → the H3
 * `quarry` ledger (`lists.quarry`, marker status `quarry`, cap 1, NOT scene-scoped — the quarry
 * follows the creature). Seek Quarry is one H3 place rule on its document; Tagging Shot's armed
 * ranged hit places via the damage-bonus `placeList` field. The 07-24v correction applies: the
 * covenants-style one-line accessor repoint does NOT transfer here because the stored SHAPE
 * differs (string vs entry array) — this adapter is the whole bridge, and every reader
 * (edhaQuarryAdvPreRoll, Cold Eyes, Pack Hunting's requireQuarry) follows it for free.
 * A pre-repoint flat `quarryUuid` on a deployed actor is simply ignored (re-mark once).
 * Pack Hunting converted 07-24x; Seek Quarry + Tagging Shot 2bX. Do NOT re-add a use-hook. */
function edhaQuarryOf(owner) {
  const l = edhaOwnerList(owner, "quarry", "quarry");   // mark-wins reconcile: a GM stripping the icon clears the quarry, as it should
  return l.length ? (l[l.length - 1]?.uuid ?? null) : null;
}
// Advantage on ATTACKS against your quarry ("find and study" rolls stay the table's call — flag it).
/* ⚠ 07-27l: this site NEVER applied, for its whole life — the SECOND instance of the retired
 * `edhaStanceAdvPreRoll` shape (see the advantage-channel note at the top of this file, ~L310).
 * It wrote the NUMBER 1, and the cosmere `AdvantageMode` is a STRING enum
 * (index.js L262-267: none|advantage|disadvantage) — `hasAdvantage` is `=== "advantage"`, so
 * `configureModifiers()` fell through to `d20.number = 1` and every quarry attack rolled a plain
 * 1d20. It also skipped the `configureDialog` wrapper, so even the right value would have been
 * overwritten on any non-fast-forward roll (index.js L3903 assigns options.advantageMode from the
 * dialog result). Both halves are now gated by lint-refs pass 13 + tests/advantage-channel.test.js.
 * The whispered card is new too: this was the only advantage site with no table-visible signal,
 * which is exactly why four bench attacks rolled wrong before anyone noticed. */
function edhaQuarryAdvPreRoll(roll, source, config) {
  try {
    if (roll?.options?._edhaQuarryAdv) return;                 // idempotent (a re-fired pre-roll)
    const actor = edhaD20RollActor(config); if (!actor) return;
    const q = edhaQuarryOf(actor); if (!q) return;
    const ttok = edhaUserTargetToken();
    const t = ttok?.actor ?? null;
    if (!t || t.uuid !== q) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
    roll.options._edhaQuarryAdv = true;
    ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🎯 <strong>Quarry</strong>: ${ttok?.name ?? t.name} is your marked quarry — this attack rolls with <strong>advantage</strong>.</p>` });
  } catch (e) { console.error("Edha Content | quarry advantage failed", e); }
}
for (const cap of ["Attack"]) Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaQuarryAdvPreRoll);
/* Cold Eyes — ON ITS DOCUMENT since 2bZ (iron rule 2b). Its bespoke updateActor hook is gone: the
 * Death defeat watcher already ANNOUNCES the drop, and the talent rides it as `edha-watch`
 * {defeat, scene, payloadTarget: actor, whenOnMyList: quarry} — the own-ledger gate is the one
 * field this conversion added — with H3 {quarry, release} (entry + marker cleared, the re-mark
 * prompt on the watch note) and `edha-focus` {gain 1} as its success payloads.
 * ⚑ THREE deliberate narrowings, benched (2bZ): the defeat kind needs a live→0 CROSSING (the old
 * hook re-fired on every ≤0 write), skips PC-type / summon / Death-Warded quarry, and needs the
 * victim on the map. All three inherit Ben's R2 tree-wide defeat preconditions. */
/* -- Heroic on-hit: edhaHeroicOnHit is GONE (2bX). Its one resident — Tagging Shot's quarry mark —
 * was UNREACHABLE DEAD CODE (it keyed on Tagging Shot itself being the dealing item, and Tagging
 * Shot's damage formula is null, so it never dealt). The card's real shape is the withernext arm:
 * `edha-self-status {tagged}` on use + an armed-self-status `edha-damage-bonus` rule
 * {consumeSelfStatus, weaponOnly, rangedOnly, placeList: quarry} — the marked hit is the PLAYER's
 * ranged weapon attack, exactly as printed. Do not re-add a name-keyed on-hit case. */
// Focus DRAIN with the victim's focus-guard reduction (2bZ — was name-keyed on Wary; the guard is
// a rule on the VICTIM's own document now, so 2bY's Red Shatter drain and every other caller keep
// riding this one path unchanged).
async function edhaDrainFocus(actor, n, source) {
  const foc = actor?.system?.resources?.foc; if (!foc) return;
  let loss = Math.max(0, Number(n) || 0);
  const guard = edhaActorRuleOf(actor, "edha-focus-guard");
  if (guard?.handler?.reduceFormula) {
    const red = Math.max(0, Math.floor(edhaEvalSync(String(guard.handler.reduceFormula), actor.getRollData?.() ?? {})));
    if (red > 0) { loss = Math.max(0, loss - red); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🛡️ <strong>${guard.item.name}</strong>: involuntary focus loss reduced by ${red}.</p>` }); }
  }
  if (!loss) return;
  const cur = Number(foc.value) || 0, next = Math.max(0, cur - loss);
  if (next === cur) return;
  // Usually runs on the damage-applying client (the GM), so a direct write has permission — the
  // Whispered Doubt pattern, tagged so the focus watcher skips it, then the zero-check runs by
  // hand (the 07-05 Predatory Insight lesson). 2bY: a USE-event drain (Red's Shatter Focus) runs
  // on the using player's client against a GM-owned foe, so the unowned case relays through the
  // GM (the retired edhaCrossFocusLoss's set-resource path, folded in here).
  if (!actor.isOwner && !game.user?.isGM) {
    if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online for ${source || "the focus drain"}.`); return; }
    try { game.socket.emit("module.edha-content", { action: "set-resource", payload: { actorUuid: actor.uuid, path: "system.resources.foc.value", value: next } }); } catch (e) { return; }
  } else {
    // #13 moved the path onto edhaResourceWrite and left the options byte-for-byte pending R-72.
    // R-72 ANSWERED 2026-09-06 (Ben (b)): an involuntary drain is NOT a spend — the victim did not
    // activate anything — so the write DECLARES ITSELF BOOKKEEPING. `edhaFocusWatch` still rides
    // alongside it (the 07-05 watcher skip); the two say different things and both are needed.
    try { await edhaResourceWrite(actor, "foc", { value: next }, { edhaFocusWatch: true, ...edhaBookkeepingTag(`${source || "focus drain"} (involuntary drain)`) }); } catch (e) { return; }
  }
  // ANNOUNCE the loss (2026-07-26l, bench run 3 defect 1): this helper was the ONE silent focus
  // write — edhaGainFocus posts a card, the executor's inv/hea branches post cards, and Wary's
  // reduction card even NAMED an "involuntary focus loss" that nothing had declared. Every drain
  // consumer (Whispered Doubt, Red's Shatter Focus, Coercive-family payloads) announces via this
  // line now; it names the RULE's label, never a hard-coded talent.
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧠 <strong>${source || "Focus drain"}</strong>: ${actor.name} loses <strong>${cur - next}</strong> focus${next <= 0 ? " — and is at 0" : ""}.</p>` });
  // ANNOUNCE the zero crossing (07-24r; was a direct call to a Predatory-Insight-shaped helper). This
  // write is tagged, so the updateActor focus watcher deliberately never sees it — which is the whole
  // reason the 07-05 test pass found that a creature emptied BY Whispered Doubt never triggered the
  // regain. The announcement replaces the hand-rolled re-check and names no talent; a watch rule that
  // wants it must set `chain`, because this call can land inside another watcher's payload.
  if (next <= 0 && cur > 0) {
    await edhaDispatchWatchers({ kind: "focus-change", owner: actor, victim: null, skill: null, def: null, ok: null, total: 0 });
  }
}
// Focus-guard status veto (2bZ — was Wary's name-keyed Surprised veto; rule-keyed now, the pass-Y
// shape: the hook stays, what it consults is the actor's own edha-focus-guard rule).
Hooks.on("preCreateActiveEffect", (eff) => {
  try {
    const a = eff?.parent;
    if (!a?.system?.resources) return;
    const guard = edhaActorRuleOf(a, "edha-focus-guard");
    const st = String(guard?.handler?.vetoStatus || "").trim();
    if (!st) return;
    if (!eff?.statuses?.has?.(st) && !(Array.isArray(eff?._source?.statuses) && eff._source.statuses.includes(st))) return;
    const bar = Number(guard.handler.whileFocusAbove) || 0;
    if ((Number(a.system.resources.foc?.value) || 0) > bar) {
      ui.notifications?.info(`Edha: ${guard.item.name} — ${a.name} can't be ${edhaConditionLabel(st) || st} while they have focus.`);
      return false;
    }
  } catch (e) { /* non-fatal */ }
});
/* --- Rousing Presence cluster — CONVERTED 07-24v (iron rule 2b) --------------------------------------
 * Was one `useItem` hook name-gated on "Rousing Presence" whose body then name-checked FIVE more
 * talents. All six now live on Rousing Presence's own document (data/authored/heroic-envoy.json):
 *   Rousing Presence ..... edha-apply-status {status: determined, mark: false}
 *   Lessons in Patience .. edha-focus {gain 1, victim} + whenOwnsTalent  ← the one rider that was
 *                          ever a real mechanic; the other four were honour-system STRINGS
 *   Instill Confidence ... edha-note + whenOwnsTalent
 *   Devoted Presence ..... edha-note + whenOwnsTalent
 *   Stalwart Presence .... edha-note + whenOwnsTalent
 *   Rallying Shout ....... edha-note + whenOwnsTalent
 *
 * UPGRADE-TALENT exit for the five riders (Ben, 07-24t — an empty Events tab is acceptable; the test
 * is editability, not which tab). Their dials live on the PARENT's rules, which is the trade.
 *
 * ⚑ FOUR of the six carry a REMINDER, not a mechanic, and that is unchanged by the conversion —
 * their text was already a string in this card. What the conversion buys is that the string is now
 * editable in Foundry instead of being a template literal in this file. The real mechanics still
 * need payloads nothing has, and they are NOT quietly dropped:
 *   ENGINE_OWNED-pending: Devoted Presence wants a CLEAR-statuses payload (it removes all four of
 *     Prone/Slowed/Stunned/Surprised — it is NOT a pick, and the classification's H6 dependency was
 *     wrong). Stalwart Presence wants an ally-targeted, scene-window defense buff: edha-defense-buff
 *     is self-only (its sweep reads the buffed actor's OWN items), has a single `round-until-turn`
 *     window, and returns after the first match so one actor cannot hold two.
 *   Rallying Shout's real mechanic (the ally's recovery die) is EXPRESSIBLE since 2bZ built H17
 *     (`@target.recoveryDie` on edha-focus) — its reminder note stands until a pass upgrades it.
 *
 * ⚑ One behaviour note carried over deliberately: the printed "until the end of the scene" on
 * Determined was ALREADY fiction (nothing clears it, then or now). Rallying Shout's reminder printed
 * on every use from the 2b migration until R-25 (c) (2026-09-06, item 63): the authored rule now
 * carries `whenTarget: "downed"` (edha-note's generic dial — target at 0 HP or Unconscious), which
 * covers BOTH clauses the card names and no longer prints on a healthy ally. */
/* Galvanize — ON ITS DOCUMENT since 2bZ (iron rule 2b, H17): `edha-focus` {gain, victim,
 * @target.recoveryDie}. The bespoke useItem hook is gone; the rolled die now POSTS (it used to be
 * evaluated and discarded — the player only saw the focus total). Do not re-add a name here. */
// -- Contest gates: vs-defense tests whose effects must ride the RESULT (kill soft laziness) -----
// Each entry: the talent's own roll (skill) is captured; success = total ≥ the target's defense.
const EDHA_HEROIC_DEFTESTS = {
  // Synchronized Assault, Set at Odds and Turning Point moved onto their documents 07-24m (H1 batch
  // 1); Steadfast Challenge and Valiant Intervention followed 07-24p. The last two also retired
  // their UPGRADE riders — Calm Appeal and Resolute Stand had no hook of their own and existed only
  // as an `edhaOwnsTalent` branch inside these two rows; they are now `edha-note` rules on the
  // parent's success event gated `whenOwnsTalent` (Ben's ruling, 07-24p). Their own documents carry
  // no rule; both are declared in the heroic tree-section header.
  // Their disadvantage payload did NOT need H6: edhaPostCalcTestCard was called with a single
  // candidate, so its one button did exactly what `edha-next-test-mod` does directly — the click was
  // an artefact of having no post-test dispatch, and H1 removed the reason for it.
  // Sharp Eye moved onto its document 07-25 (iron rule 2b) once H24 `edha-reveal` existed — it is
  // now `edha-def-test` (per vs cog) on `use` plus `edha-reveal` on `edha-test-success`, which is
  // exactly what this table row was: a gate H1 already owned, and a payload it never did. This
  // table is now EMPTY and the hook below is a no-op kept only so a future gated test has a home;
  // do not re-add rows — author the two rules on the talent instead.
};
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    const g = EDHA_HEROIC_DEFTESTS[item.name]; if (!g || !edhaOwnsTalent(actor, item.name)) return;
    const target = edhaUserTargetActor();
    if (!target) { ui.notifications?.warn(`Edha: ${item.name} — target the creature first, then use it (the roll resolves against their defense).`); return; }
    edhaQueueContest(actor, g.skill, async ({ total }) => {
      const dc = edhaReadDefense(target, g.def);
      const ok = total >= dc;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${item.name}</strong>: ${total} vs ${target.name}'s ${g.def.toUpperCase()} ${dc} — <strong>${ok ? "SUCCESS" : "FAIL"}</strong>.</p>` });
      if (ok) await g.apply(actor, target);
      else if (g.applyFail) await g.applyFail(actor, target);
    });
  } catch (e) { console.error("Edha Content | heroic def-test failed", e); }
});
/* Field Medicine — ON ITS DOCUMENT since 2bZ (iron rule 2b, H1 + H17). `edha-def-test` {med,
 * vs: dc, dc: 15} on use (the fixed-DC self-roll H1 already owned — Grand Deception's shape) plus
 * `edha-focus` {gain, resource: hea, victim, "@target.recoveryDie + @skills.med.rank"} on the
 * success — the TARGET-die half is what H17 built. RESUSCITATION is the whenOwnsTalent UPSELL
 * (the pass-F Siphoned Will exit): its only engine presence was ever a string inside this card,
 * and that string is now an `edha-note` {whenOwnsTalent: "Resuscitation"} rule on Field
 * Medicine's success. ⚑ Resuscitation's own document carries NO rule — editing its line means
 * editing Field Medicine's note rule. Declared here, not an oversight; its 3-focus cost lives on
 * its own activation, so using the talent itself pays the revive. Do not re-add a name here. */
// Opportunity ADDERS, Risky Behavior's Plot Die and Overwhelm with Details' Lore bank all came off
// the engine on 07-24k (iron rule 2b): every one of them was "on use, write a next-test flag on
// MYSELF", which is now `edha-next-test-mod` with target=self plus the opportunity / plotDie /
// formula fields. EDHA_OPP_ADDERS and two bespoke useItem hooks deleted with them.
// HP-floor veto (2bZ — was Resilient Hero's name-keyed hook; rule-keyed now, the pass-Y shape).
// A cleared flag may have been written by the talent's NATIVE long-rest rule, whose OVERRIDE mode
// lands STRINGS — "false"/"0" must read as cleared (the plot-die tolerance precedent, §9n).
function edhaFlagSpent(v) { return !(v === undefined || v === null || v === false || v === 0 || v === "" || v === "false" || v === "0"); }
Hooks.on("preUpdateActor", (actor, changes) => {
  try {
    if (actor?.type !== "character") return;
    const fl = edhaActorRuleOf(actor, "edha-hp-floor");
    if (!fl) return;
    const hea = foundry.utils.getProperty(changes, "system.resources.hea.value");
    if (hea === undefined || hea > 0) return;
    const flagKey = String(fl.handler.spentFlag || "resilientSpent").trim() || "resilientSpent";
    if (edhaFlagSpent(actor.getFlag("edha-content", flagKey))) return;
    const mod = Math.max(1, Math.floor(edhaEvalSync(String(fl.handler.floorFormula || "max(1, @skills.ath.mod)"), actor.getRollData?.() ?? {})) || 1);
    foundry.utils.setProperty(changes, "system.resources.hea.value", mod);
    void actor.setFlag("edha-content", flagKey, true);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>💪 <strong>${fl.item.name}</strong>: instead of dropping, ${actor.name} holds at <strong>${mod}</strong> health (spent until a long rest — auto-clears ⚑; GM fallback: <code>actor.unsetFlag("edha-content","${flagKey}")</code>).</p>` });
  } catch (e) { console.error("Edha Content | HP-floor veto failed", e); }
});
// (Overwhelm with Details moved onto its document 07-24k — see the note above the command-die
// cluster. Its Lore modifier is now the rule's `formula`, resolved against the owner at use.)

/* ── The Calculation card family is GONE (07-24s, iron rule 2b) ────────────────────────────────
 * `edhaPostCalcTestCard` / `edhaCalcTestClick` / `edhaBindCalcButtons` and the whole
 * `cosmere-rpg.useItem` switch that drove them are deleted: every consumer is on its own document.
 *   H6 `edha-prompt-pick` + `edha-next-test-mod`   Pattern Recognition · Probability Cascade ·
 *                                                  Anticipate (source: creatures, the Telepathic
 *                                                  Network is your Blue Attunement Range) ·
 *                                                  Intercept (Foresight)
 *   H6 `edha-prompt-pick` + `edha-triggered-effect` Subtle Suggestion (status, expire: owner)
 *   H1 `edha-def-test` alone                       False Premise
 *
 * FALSE PREMISE IS WORTH THE LINE. Its branch had TWO paths — auto-contest when the target's
 * Cognitive defense could be read, a manual pick card when it could not — and it is the manual path
 * that put it in H6's demand column for four passes. Ben's 07-24r ruling (§9m q9 / 2bI-8) made
 * fail-open H1's standing convention project-wide, which deletes the fallback and leaves clean H1.
 * A talent can leave a handler's demand column because a RULING removed its second path; re-read
 * the call sites of anything filed under a handler you are about to build.
 *
 * Do NOT re-add a card function or a case here. (`edhaPostDisorientCard` died 07-25 with
 * Counterpoint's conversion — H1 `vs: prompt-dc` is BUILT and its fail-open covers the card's case.)
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

