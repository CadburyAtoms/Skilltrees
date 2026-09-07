/* ============================================================================================
 * ORDER (Tessavain, deity) tree engine (2026-07-03) — the LAST of the 15 trees: declare law
 * (Blue Edicts — prohibition → consequence) + keep faith (White Covenants — pacts → protection).
 * Colors Blue/White; tag prefix "Order (Tessavain)."; build `foundry-build deity` → pack `edha-deity`.
 * Die/range colors (Ben R0, 07-03 — the Sovereignty R2 → Knowledge R0 precedent): BLUE backs every
 * Edict-side Attunement Range (Edict placement, Verdict's target, Final Decree's enemy net) and
 * every [Tier][Die] damage payload (all four authored formulas are blue; "+ @attr.int" preserved on
 * Edict + Final Decree ONLY); WHITE backs every Covenant-side range (Covenant proximity, Bear
 * Witness, Shoulder the Oath's reaction range) and the flat "your White" values (= White RANK) —
 * EXCEPT Final Decree's Witness THP die, which is [Tier][Die on WHITE] (a Covenant-side buff, the
 * Sovereign's-Favor precedent, Ben R0/R9). Concord's "your Presence" bakes off the OWNER (the
 * Pack-Share/Death-Mark "your Tier" precedent).
 * NAME COLLISIONS found + root-caused this pass (Ben R10): "Edict" ⊂ Sovereignty's "Edict of the
 * Fallen" and "Concord" ⊂ White's "Concordant Presence" made audit.py's substring silent-card check
 * FALSE-PASS both (100% unwired yet absent from the FAIL list). AUDITOR-side only — engine name
 * matches are exact, nothing misfired at runtime — so the fix is in audit.py (longer-name masking +
 * word boundaries), NOT a rename: "Edict"/"Concord" are load-bearing words in this tree's own cards
 * (unlike the Knowledge capstone, which had nothing referencing it and was renamed).
 * Reuses existing primitives wholesale — NO side-engine, NO new sidecar table:
 * ══ IRON RULE 2b STATUS (07-24u, pass L) — the `covenants` ledger has MIGRATED ═════════════════════
 * `covenants` now lives at `flags.edha-content.lists.covenants`, i.e. where H3 `edha-owner-list`
 * reads and writes. `edhaGetCovenants` is `edhaOwnerList(owner, "covenants", "covenant")` and every
 * reader below goes through it, so there is only ever ONE array — the "ledger in two places at once"
 * failure that made pass H convert zero talents cannot happen here by construction. Entry schema is
 * H3's: {id, uuid, name, talent} — NOT the old {id, allyUuid, allyName}.
 *
 *   ✅ CONVERTED — behaviour on the document (data/authored/deity-order.json). 2bV (07-25) took the
 *   WHOLE TREE off the ratchet: the `edicts` ledger repointed onto H3 (see edhaGetEdicts below) and
 *   the takeover Set is gone — every use flows through the system, costs paid natively, gates
 *   vetoed pre-cost, and cancel-a-dialog REFUNDS (the Trade-Routes convention):
 *      • Covenant     → one `edha-owner-list` place rule + a `covBuffTemplate` effect on its
 *                       Effects tab that the proximity sweep copies (so the +1 is editable).
 *      • Bear Witness → one `edha-triggered-effect` rule, `whenMoment: round-start` +
 *                       `target: list-members`, formula `@skills.white.rank`.
 *      • Edict        → `edha-owner-list` place {prohibition: true} — the picker runs from the
 *                       generic executor, the choice rides the ENTRY, the card carries ⚖ Violated.
 *      • Sealed Edict → `edha-owner-list` {op: annotate} (H3ann, built 2bV) + riderSkill/riderColor
 *                       (the resolver rolls the annotate rider off THIS talent's damage formula).
 *      • Verdict      → H1 `edha-def-test` {requireTargetOnList} + `edha-prohibition-resolve`
 *                       (the shared resolver + the 10 ft Discipline court, both rule-driven).
 *      • Concord      → `edha-self-status` {concord, requireListNonEmpty} + `edha-note`
 *                       {rosterList} + `edha-damage-bonus` {require: list-member-hits,
 *                       oncePerRoundPerDealer} — the dealer pre-pass rider is DELETED.
 *      • Shoulder the Oath → `edha-redirect` {direction: intercept} — the generic intercept
 *                       sweep + click replace the bespoke prompt (re-litigated from its 07-24u
 *                       ENGINE_OWNED exit: the 2bU redirect payload DID exist, inverted).
 *      • Lawkeeper's Eye → `edha-bound-adv` (config) — the advantage injector sweeps rules.
 *   ENGINE_OWNED: Final Decree — the prohibition-picker dialog, the violation watchers and the
 *      batch resolution are a cross-actor multi-step subsystem (rule-3's ENGINE-OWNED class). Its
 *      `edha-decree` rule carries every dial (range, witnesses, THP die, court radius, once/scene)
 *      and the machinery keys on the RULE and the `decree` flag — the name is out of engine code.
 *   ENGINE_OWNED (unchanged, both ledger/rule-keyed, no names): the Covenant proximity-AE sweep,
 *      the Covenant-break damage watch, and the three violation watchers (move / Investiture /
 *      attack) — cross-actor observations with no owning document.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 *   • Edicts + Covenants = the tree's signature lists (the Charge/Remains/Foundation worked
 *     pattern): owner flags `lists.edicts` [{id,uuid,name,talent,proh,sealed}] (H3-owned since
 *     2bV — proh/sealed RIDE ALONG on H3's standard schema) / `lists.covenants`
 *     [{id,uuid,name,talent}] (H3-owned since 07-24u),
 *     cap = tier each, OLDEST FIZZLES past cap (Ben R1/R2); registered `edict` / `covenant` marker
 *     statuses (the harvested/compelled row); everything clears on deleteCombat ("unviolated
 *     Edicts fade at the end of the scene" — scene = the combat, tree convention).
 *   • VIOLATION MODEL (Ben R1): declaring "it took the prohibited action" is VOLITION (the Kneel/
 *     Absolute-Authority manual-clause precedent) — an owner/GM "⚖ Violated" button on the card —
 *     but the engine WATCHES the three canonical prohibitions and PROMPTS: "move from its space"
 *     (the shared preUpdateToken `edhaPrevPos` stamp → updateToken), "activate Investiture" (a
 *     preUpdateActor inv-value stamp → updateActor, the `edhaHea` shape — Investiture spends ARE
 *     detectable, checked before declaring it manual), "attack <chosen ally>" (the Sovereignty
 *     attack-test watcher shape: cosmere-rpg attack/item roll + synced target). Once the button
 *     fires, the CONSEQUENCE is fully engine-resolved.
 *   • defense test  → Verdict rolls Blue through H1 `edha-def-test` vs Cognitive (2bV — was a
 *     takeover) — the Kneel/Killing-Blow dispatch, never trust-the-player.
 *   • opposed skill → Sealed Edict / Verdict's "tests Discipline vs. your Blue" run through
 *     edhaFoeSkillVsColor (skill "dis" — EDHA_SKILL_ATTR gained dis:"wil", verified against
 *     foundry-build.js's own SKILL_ATTR map); NEVER applied on trust.
 *   • damage writes → edhaOrderApplyHits → edhaApplyBurstResults / the burst-apply relay; statuses
 *     → edhaApplyTimedStatus (Disoriented expire:"owner", Weakened expire:"target") / edhaToggleStatus.
 *   • THP/advantage → edhaGrantTempHpCross (keeps-higher, never stacks) + edhaGrantAdvAttack.
 *   • proximity AE  → Covenant's "+1 all defenses while within White range of each other" is a
 *     GM-side watcher-managed AE (the def-buff AE shape; refresh on combatTurnChange + token moves,
 *     debounced — the Civ construct-in-Foundation move-watcher shape). The OWNER wears ONE +1 while
 *     ≥1 partner is in range (pacts don't compound on the same head); an ally covenanted by TWO
 *     different Order PCs wears one +1 per owner (distinct pacts — AEs keyed per owner).
 *   • start of ROUND → Bear Witness needs the pass's ONE new primitive: a round-boundary check on
 *     the existing combatStart/combatTurnChange hooks (everything prior was start-of-YOUR-turn:
 *     Accumulate/Resurgent Growth/Consuming Decay) — extract-ready for future start-of-round cards.
 *   • once-per-round → edhaTriggerAllowed/edhaMarkTriggerUsed (Concord, keyed per ally) +
 *     edhaCoordOPRAllowed/Mark (Shoulder the Oath's Reaction — the Lifeline gate; break-watch spam gate).
 * PRE-STANDARD WIRING: Shoulder the Oath's authored edha-temp-hp event was the documented partial
 * ("the hook grants the targeted ally; apply your own + the damage redirect manually") — REDONE
 * (Ben R4, the Death R6/R7 / Civ R2 / Power R5/R6 process): event removed (deity-order.json
 * events:{}, talent-thp.json row SUPERSEDED), rewired below as the post-damage Reaction card.
 * Wired here (no longer silent — all 9):
 *   • Edict (1 Action, 1 Inv) — ✅ 2bV, rule-driven use (H3 place {prohibition}): synced target in
 *     Blue range (refused pre-cost), picker-cancel REFUNDS,
 *     prohibition picker (move / attack <chosen ally> / activate Investiture / free text) → list
 *     entry + `edict` icon + the card (Violated button; Lawkeeper's GM-reveal line when owned).
 *     Violation: ONE [T][D blue]+Int spirit roll (the item's own formula) + Disoriented until the
 *     start of the owner's next turn; entry consumed; icon cleared unless another Edict/Decree
 *     (any Order owner) still binds the target. Repeat casts on the SAME target are legal
 *     (different prohibitions, each its own entry).
 *   • Covenant (1 Action, 1 Inv) — ✅ ON ITS DOCUMENT since 07-24u (was a TAKEOVER): targeted willing
 *     ALLY (`requireDisposition: ally`), touch ENFORCED (`requireAdjacent` — Ben R2), repeat-with-
 *     same-ally refused pre-cost (`allowDuplicates: false`) → list entry + `covenant` icon + the
 *     proximity AE. All four refusals are H3's preUseItem veto, so "nothing spent" survives the
 *     takeover's retirement. `multiOwner` keeps a second owner's icon alive through a fizzle;
 *     `sceneScoped: false` because the pact follows the ally. Aid at any range within Attunement
 *     Range = carded manual (the Fate Ordained-Ground Aid precedent). "Deliberately attacks the
 *     other" = volition: the dealer pre-pass DETECTS partner-damages-partner and PROMPTS with H3's
 *     generic release button.
 *   • Bear Witness (passive) — ✅ ON ITS DOCUMENT since 07-24u: start of each ROUND, every covenanted
 *     ally within White range gains THP = White rank (keeps-higher, via edhaGrantTempHpCross — the
 *     ledger payload deliberately does NOT use the replacing writer). Allies only — the owner is not
 *     "an ally in a Covenant with you", which `list-members` gets for free by excluding self.
 *   • Shoulder the Oath (Reaction, no cost) — ✅ 2bV (edha-redirect {direction: intercept}; generic
 *     sweep + click): a covenanted ally LOST HP with the owner in
 *     White range → whispered Reaction card (once/round). Click: owner takes floor(D/2) as the SAME
 *     type (edhaRedirected:true — Devoted-Conduit honest), the ally heals back min(D, floor(D/2) +
 *     White), BOTH gain White-rank THP. Damage fully eaten by Temp HP prompts nothing (the Mantle
 *     precedent); D = HP actually lost.
 *   • Lawkeeper's Eye (passive) — ✅ 2bV (`edha-bound-adv` config rule; the injector sweeps rules,
 *     names no talent): a defender-keyed pre-roll injector (the
 *     Bulwark-Ground shape, inverted to GRANT): any attacker of the owner's disposition whose
 *     synced target is Edict/Decree-bound by an owner of this talent attacks with advantage.
 *     "While you can see" = owner-judged (no LOS primitive — carded, named backlog).
 *   • Sealed Edict (Free, 1 Inv) — ✅ 2bV, rule-driven use (H3 {op: annotate}): seals your most
 *     recent unsealed Edict (the
 *     Inevitable-Snare flag-the-last shape; refused pre-cost with none). On that Edict's violation
 *     the engine ALSO rolls the target's Discipline vs your Blue (edhaFoeSkillVsColor); a failure
 *     adds [T][D blue] spirit (its own formula) + Weakened until the end of ITS next turn.
 *   • Verdict (2 Actions, 2 Inv) — ✅ 2bV, rule-driven use (H1 + edha-prohibition-resolve): synced
 *     target must be YOUR Edict-bound (requireTargetOnList) + in Blue range
 *     (refused pre-cost). ONE engine Blue roll vs Cognitive: success → that Edict resolves through
 *     the SAME violation resolver (damage + Disoriented + Sealed rider, consumed), then each OTHER
 *     enemy within 10 ft rolls Discipline vs your Blue — failures take ONE shared [T][D blue]
 *     spirit roll + Disoriented until the start of your next turn. Failure → card, cost spent.
 *   • Concord (2 Actions, 2 Inv) — ✅ 2bV, rule-driven use (edha-self-status `concord` +
 *     list-member-hits damage bonus): refused pre-cost with zero Covenants or already formed
 *     (the `concord` status, scene). Aid-grant Free Action = carded manual. Each covenanted ally's FIRST
 *     damaging hit on an enemy each round gains +owner's Presence, same type as the hit (Ben R8;
 *     the rider rides damage application, so a clean miss leaves it armed for the next hit),
 *     once/round per ally, the owner's own attacks excluded.
 *   • Final Decree (3 Actions, 3 Inv, capstone) — ENGINE-OWNED flow keyed on its `edha-decree` rule
 *     (2bV — no name in code): once/scene (generic sceneOnce), refused pre-cost, picker-cancel
 *     REFUNDS. Prohibition picker; SNAPSHOTS every enemy in Blue range as decree-bound (`edict`
 *     icon, NOT counted vs the Edict cap — "as if bound", not sustained) + every covenanted ally as
 *     a Witness. Watchers prompt; the button fires with the targeted violator: (1) EVERY active
 *     Edict resolves individually — own roll, own target, own Sealed rider, all consumed (Ben R9.1,
 *     the literal reading); (2) ONE shared [T][D white] roll → THP to every Witness (keeps-higher)
 *     + advantage on its next attack test; (3) ONE shared [T][D blue]+Int spirit roll to each enemy
 *     within 10 ft of the violator — violator INCLUDED (the Magnum-Opus R7a precedent); decree ends.
 * Multi-owner / stacking (second-pass checked — the Knowledge R9–R11 lesson): per-owner lists (the
 * shared `edict` icon clears only when NO owner's law still binds); Lawkeeper + Kneel advantage
 * don't compound (advantage is binary); a Verdict resolution and a watcher prompt can't double-fire
 * (the resolver consumes the list entry first — a stale button warns and no-ops); Concord's
 * once-per-round is per-owner-per-ally; Bear Witness / Shoulder THP keep-higher; Final Decree's
 * batch skips already-dead Edict targets (entry still consumed).
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • Line-of-sight for Lawkeeper's "while you can see" — edhaCanSee (hidden target / sight-wall
 *     ray, deterministic on every client) gates the advantage injector; darkness stays GM-judged.
 *   • The voluntary-vs-forced movement stamp — engine movers stamp options.edhaForced via
 *     edhaMoveTokenTo + the move-token relay; the move watcher SKIPS stamped moves (a push is not
 *     "taking the action") and still PROMPT-not-fires on unstamped ones (walks / GM hand-drags).
 *   (Shared/cross-tree backlog is tracked canonically in EDHA_FOUNDRY_HANDOFF.md §9 — consolidated 2026-07-03c.)
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Lawkeeper's Eye's "learn the bound character's intended action" — an NPC's intent is not data
 *     anywhere in Foundry, so no hook can ever exist (RECLASSIFIED from backlog → manual with Fate's
 *     Read the Threads, Ben-approved 2026-07-03c); the Edict card carries the GM-reveal line.
 *   • Covenant/Concord's Aid grants (no hook can take another creature's action — prompt cards);
 *     the ally's "willing"-ness; Edict prohibitions beyond the three canonical kinds (free-text
 *     declarations are watched by no hook — the Violated button covers them).
 *   • CONTEST-EXEMPT: none — every test in this tree is engine-rolled: Verdict's Blue vs Cognitive
 *     via edhaReadDefense, and both Discipline-vs-your-Blue clauses via edhaFoeSkillVsColor ("dis").
 * ============================================================================================ */

const EDHA_ORDER_BLUE_DIE = "(@tier)d(2 * @skills.blue.rank + 2)";
const EDHA_ORDER_WHITE_DIE = "(@tier)d(2 * @skills.white.rank + 2)";

// edhaOrderCard moved onto edhaTreeCard(owner, rolls, html, opts) — Job 4, pass 5.3 (call sites below updated directly).
function edhaOrderTokenOf(actorUuid) { return (canvas?.tokens?.placeables ?? []).find(t => t.actor?.uuid === actorUuid) ?? null; }
/* THE SECOND LEDGER REPOINT (2bV, the covenants precedent below): `edicts` now lives at
 * flags.edha-content.lists.edicts, where H3 reads AND writes, so there is only ever ONE array.
 * Entry schema is H3's — `uuid`/`name`, with `proh` and `sealed` riding along as extra fields
 * (reconcile-on-read keys on `uuid`, which is why the old `targetUuid` key HAD to be renamed —
 * keeping it would have made the reconciler drop every entry). All readers below go through this
 * accessor; the writers go through edhaSetOwnerList. */
function edhaGetEdicts(owner) { return edhaOwnerList(owner, "edicts", "edict"); }
/* The prohibition-family lookups (2bV) — rule-scans, never names: the talent that PLACES
 * prohibition entries on a ledger (its damage formula backs the violation roll), and the talent
 * that ANNOTATES them (its riderSkill/riderColor + damage formula back the notarize rider). */
function edhaProhPlaceRuleOf(owner, key) {
  for (const { item, handler: h } of edhaActorRulesOf(owner, "edha-owner-list")) {
    if (h.prohibition === true && String(h.list || "").trim() === key) return { item, handler: h };
  }
  return null;
}
function edhaProhAnnotateRuleOf(owner, key) {
  for (const { item, handler: h } of edhaActorRulesOf(owner, "edha-owner-list")) {
    if ((h.op || "place") === "annotate" && String(h.list || "").trim() === key) return { item, handler: h };
  }
  return null;
}
/* THE LEDGER REPOINT (07-24u). This one accessor is why the covenants ledger cost a field rename and
 * not a `listPath` schema. H3 stores at flags.edha-content.lists.<key>; Order stored at a FLAT flag,
 * and converting one writer would have put the ledger in two places at once — the rule writing one
 * array while every un-migrated sibling read the other and saw an empty list (audit §9n pass H).
 *
 * Pointing this at edhaOwnerList moves the ledger to where H3 already reads AND writes, and all 12
 * readers below follow for free. There is then only ever ONE array, so the hazard is impossible BY
 * CONSTRUCTION rather than managed by a field. Two things come with it, both wanted:
 *   · the entry schema is H3's — `uuid`/`name`, not `allyUuid`/`allyName` (a pure rename)
 *   · "the mark wins" — an ally who no longer bears the `covenant` status drops off every read, so a
 *     GM clearing the icon by hand does the right thing, which the old flat list never handled.
 * The status id is SINGULAR (`covenant`) while the ledger key is plural, so it must be passed.
 * The accessor itself (edhaGetCovenants) retired 07-26 (the pre-deploy orphan sweep): the last
 * reader went data-keyed, and the one-array-by-construction property lives in the ledger's key,
 * not in the accessor. */
async function edhaOrderApplyHits(owner, hits) {
  if (!hits?.length) return;
  const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
  if (game.user?.isGM) await edhaApplyBurstResults(payload);
  else { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply the damage."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
}

/* --- The shared `edict` bound-marker: set on bind, cleared only when NO owner's law still binds -----
 * 2bV: both sweeps are DATA-keyed now — the ledger for Edicts, the `decree` flag for Final Decree —
 * so they survive a rename and still find an owner who respecced the talent away mid-pact. */
function edhaDecreeOwners() {
  return (game.actors?.filter(a => a.type === "character" && a.getFlag?.("edha-content", "decree")) ?? []);
}
function edhaOrderStillBound(actorUuid) {
  for (const { list } of edhaOwnerLedgers("edicts", "edict"))
    if (list.some(e => e.uuid === actorUuid)) return true;
  for (const owner of edhaDecreeOwners())
    if ((owner.getFlag?.("edha-content", "decree")?.bound ?? []).includes(actorUuid)) return true;
  return false;
}
async function edhaOrderRefreshBoundIcon(target) {
  try {
    if (!target) return;
    const want = edhaOrderStillBound(target.uuid);
    const has = !!target.statuses?.has?.("edict");
    if (want && !has) await edhaToggleStatus(target, "edict", true);
    if (!want && has) await edhaToggleStatus(target, "edict", false);
  } catch (e) {}
}

/* --- The prohibition picker (generic — H3 {prohibition} places + the edha-decree flow): three
 * canonical kinds + free text. ENGINE-OWNED support surface (a dialog is not a rule).
 * DialogV2-FIRST since 07-27d: the Weave link picker's run-6 lesson — an AppV1 window is
 * invisible to the bench harness's DOM sampling and dies with v16's AppV1 removal. This was the
 * only other AppV1 window on a runtime path (Order — unbenched, converted before it bites);
 * the V1 body stays as the fallback. ------------------------------------------------------------- */
const EDHA_ORDER_PROH_LABEL = { move: "move from its space", invest: "activate Investiture" };
function edhaPickProhibition(owner, title) {
  const otok = edhaCasterToken(owner); const disp = otok?.document?.disposition ?? 1;
  const allies = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && t.actor !== owner && (t.document?.disposition ?? 1) === disp);
  const opts = allies.map(t => `<option value="${t.actor.uuid}">${t.name}</option>`).join("");
  const content = `
        <p><label><input type="radio" name="edhaProhKind" value="move" checked> Move from its space</label></p>
        <p><label><input type="radio" name="edhaProhKind" value="attack"> Attack a chosen ally:</label> <select name="edhaProhAlly">${opts || `<option value="">(no allied tokens)</option>`}</select></p>
        <p><label><input type="radio" name="edhaProhKind" value="invest"> Activate Investiture</label></p>
        <p><label><input type="radio" name="edhaProhKind" value="other"> Other:</label> <input type="text" name="edhaProhText" placeholder="describe the prohibited action" style="width:100%"></p>`;
  const readPick = (root) => {
    const kind = root.querySelector("[name=edhaProhKind]:checked")?.value || "other";
    const allyUuid = kind === "attack" ? (root.querySelector("[name=edhaProhAlly]")?.value || null) : null;
    const allyName = allyUuid ? (allies.find(t => t.actor.uuid === allyUuid)?.name ?? "the chosen ally") : null;
    const custom = (root.querySelector("[name=edhaProhText]")?.value || "").trim();
    const text = kind === "attack" ? `attack ${allyName}` : (EDHA_ORDER_PROH_LABEL[kind] || custom || "the declared action");
    return { kind, allyUuid, text };
  };
  return edhaDialogPick({ title: title || "Edict — declare ONE prohibited action", content, buttons: [
    { action: "ok", label: "Declare", default: true, parse: readPick },
    { action: "cancel", label: "Cancel" },
  ] });
}

/* Edict's place flow moved onto its document 2bV (iron rule 2b): one `edha-owner-list` place rule
 * with {prohibition: true} — the generic executor runs the picker, stamps `proh` on the entry,
 * posts the ⚖ Violated button and the placeNote lines, and the H3 veto owns every pre-cost gate.
 * Do not re-add a takeover. */

/* --- The violation resolver (shared: the ⚖ Violated button, edha-prohibition-resolve, the decree
 * batch). 2bV: ledger-generic — takes the LIST KEY, reads/writes through H3, finds the placing and
 * annotating talents by RULE-SCAN (edhaProhPlaceRuleOf / edhaProhAnnotateRuleOf), names nothing. -- */
async function edhaProhResolveViolation(owner, key, entryId, { via = "declared violation" } = {}) {
  try {
    // Queued RMW (07-26n): the consume runs against a fresh read inside the per-owner queue.
    const e = await edhaOwnerListQueue(owner, key, async () => {
      const list = foundry.utils.deepClone(edhaOwnerList(owner, key, "edict"));
      const idx = list.findIndex(x => x.id === entryId);
      if (idx < 0) return null;
      const [ent] = list.splice(idx, 1);                      // consume FIRST — a racing second click no-ops
      await edhaSetOwnerList(owner, key, list);
      return ent;
    });
    if (!e) { ui.notifications?.info("Edha: that Edict is no longer active."); return false; }
    const target = await edhaResolveActorRef(e.uuid);
    if (!target) { edhaTreeCard(owner, null, `<p>⚖️ The Edict on ${e.name} resolves — the target is gone; the Edict is consumed.</p>`); return true; }
    const alive = (Number(target.system?.resources?.hea?.value) || 0) > 0;
    const tal = edhaProhPlaceRuleOf(owner, key)?.item;
    const dr = await edhaRollFormula(owner, tal?.system?.damage?.formula || (EDHA_ORDER_BLUE_DIE + " + @attr.int"));
    const amt = Math.max(0, Math.floor(dr.total));
    if (alive && amt > 0) await edhaOrderApplyHits(owner, [{ actorUuid: target.uuid, amount: amt, type: tal?.system?.damage?.type || "spirit", heal: false }]);
    if (alive) await edhaApplyTimedStatus(target, "disoriented", { owner, expire: "owner" });
    edhaTreeCard(owner, [dr], `<p>⚖️ <strong>Edict violated</strong> (${via}) — ${target.name} broke "<em>${e.proh?.text ?? "the declared prohibition"}</em>": <strong>${amt}</strong> spirit + <strong>Disoriented</strong> until the start of ${owner.name}'s next turn. The Edict is consumed.</p>`);
    if (e.sealed && alive) await edhaProhAnnotateRider(owner, key, target);
    await edhaOrderRefreshBoundIcon(target);
    return true;
  } catch (e2) { console.error("Edha Content | violation resolve failed", e2); return false; }
}
// The annotate rider (2bV — was the name-keyed Sealed Edict rider): a `sealed` entry's violation
// also rolls the violator's riderSkill vs the annotating talent's riderColor (engine-rolled, never
// trusted); a failure adds THAT talent's damage formula + Weakened until the end of ITS next turn.
async function edhaProhAnnotateRider(owner, key, target) {
  try {
    const ttok = edhaOrderTokenOf(target.uuid); if (!ttok) return;
    const ann = edhaProhAnnotateRuleOf(owner, key); if (!ann) return;
    const skill = ann.handler.riderSkill || "dis", color = ann.handler.riderColor || "blue";
    await edhaFoeSkillVsColor(owner, [ttok], {
      skill, color, sourceName: ann.item.name, icon: "⚖️",   // 07-27f: the helper localizes the skill id
      failText: "breaks — +[Tier][Die] spirit + Weakened", okText: "holds firm",
      onFail: async (t) => {
        const sr = await edhaRollFormula(owner, ann.item.system?.damage?.formula || EDHA_ORDER_BLUE_DIE);
        const sa = Math.max(0, Math.floor(sr.total));
        if (sa > 0) await edhaOrderApplyHits(owner, [{ actorUuid: t.actor.uuid, amount: sa, type: ann.item.system?.damage?.type || "spirit", heal: false }]);
        await edhaApplyTimedStatus(t.actor, "weakened", { owner, expire: "target" });   // until the end of ITS next turn
        edhaTreeCard(owner, [sr], `<p>⚖️ <strong>${ann.item.name}</strong>: ${t.actor.name} takes an additional <strong>${sa}</strong> spirit and is <strong>Weakened</strong> until the end of its next turn.</p>`);
      },
    });
  } catch (e) { console.error("Edha Content | annotate rider failed", e); }
}

/* Sealed Edict's seal flow moved onto its document 2bV: one `edha-owner-list` {op: annotate} rule
 * (H3ann — built this pass with its first consumer). The pre-cost "no unsealed Edict" refusal is
 * the H3 veto's annotate branch; the rider above reads the SAME rule. Do not re-add a takeover. */

/* --- Covenant — CONVERTED 07-24u (iron rule 2b) -----------------------------------------------------
 * The pact was a preUseItem TAKEOVER (edhaOrderCovenant) plus edhaOrderBreakCovenant and
 * edhaOrderDropCovenantIcon. All three are gone; the talent now carries ONE `edha-owner-list` place
 * rule on `use` (data/authored/deity-order.json), and every dial it used to hard-code is a field on
 * that rule Ben can edit in Foundry:
 *   cap @tier + evict oldest .... the sustain limit (Ben R2)
 *   multiOwner ................. the covenant icon is SHARED between Order PCs, so one owner's fizzle
 *                                must not strip another owner's icon (audit §9o trap 3)
 *   sceneScoped: false ......... the pact follows the ally, not the ground (trap 2)
 *   requireDisposition: ally ... "target the willing ALLY", vetoed BEFORE cost
 *   requireAdjacent ............ "Covenant requires touch", vetoed BEFORE cost
 *   releaseButton .............. "Break the Covenant" — the same affordance, now generic
 * A latent bug went with them: the old fizzle loop kept only the LAST evicted entry, so a cap that
 * dropped by 2+ cleared one icon. edhaListPush reports every eviction. This is a FIX, not a
 * regression (audit §9o).
 *
 * What stays ENGINE_OWNED here, and why: the proximity AE sweep below is a cross-actor state machine
 * driven by token movement, and the break WATCH in edhaOrderDealerPre is a damage observation with no
 * owning document. Both are now keyed on the LEDGER rather than on the talent name, so they name
 * nothing — and the AE's +1 is authored on the talent's Effects tab (see edhaCovBuffChanges). */

/* --- The Covenant proximity AE: +1 all defenses while owner↔ally within White range (GM-side) -------
 * ENGINE_OWNED (the sweep is a cross-actor state machine driven by token movement), but the NUMBER is
 * not. It rides the pass-B `stanceRider` pattern: an ActiveEffect on the talent flagged
 * `edha-content.covBuffTemplate` with `transfer: false` sits on the Effects tab where Ben edits the
 * bonus, never applies by itself, and the sweep copies its changes. Found by FLAG, not by talent name.
 *
 * Falls back to the historic hard-coded +1 when no template is found, which is the deliberate failure
 * mode: Ben's packs are behind `main` until a rebuild + ⟳ Sync, so an un-synced Covenant keeps working
 * rather than silently losing its defenses. */
function edhaCovBuffTemplate(owner) {
  try {
    for (const it of (owner?.items ?? [])) {
      if (!edhaIsTalent(it)) continue;
      const eff = (it.effects ?? []).find(e => e.getFlag?.("edha-content", "covBuffTemplate"));
      if (eff && (eff.changes ?? []).length) return eff;
    }
  } catch (e) {}
  return null;
}
function edhaOrderCovBuffSpec(owner, ownerName, ownerId) {
  const tpl = edhaCovBuffTemplate(owner);
  const changes = tpl
    ? (tpl.changes ?? []).map(c => ({ key: c.key, mode: c.mode ?? CONST.ACTIVE_EFFECT_MODES.ADD, value: c.value, priority: 20 }))
    : ["phy", "cog", "spi"].map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1", priority: 20 }));
  return {
    name: `Covenant (${ownerName})`, img: tpl?.img || "icons/svg/aura.svg",
    changes,
    description: tpl?.description || `<p>+1 to all defenses while within Attunement Range (White) of your Covenant partner (Order engine — auto-managed, do not toggle by hand).</p>`,
    flags: { "edha-content": { covBuff: ownerId } },
  };
}
async function edhaOrderRefreshCovenantBuffs() {
  try {
    if (!edhaDefBuffGmGate()) return;
    // Desired state: actorUuid → Set(ownerId). The owner wears ONE +1 while ≥1 partner is in range;
    // an ally covenanted by two different Order PCs wears one +1 per owner (distinct pacts).
    const want = new Map();
    const add = (uuid, oid) => { if (!want.has(uuid)) want.set(uuid, new Set()); want.get(uuid).add(oid); };
    // The sweep is LEDGER-keyed (07-24u), so it names no talent — and it keeps working for an owner
    // who holds a live pact but has respecced the talent away, which the talent scan did not.
    for (const { owner, list } of edhaOwnerLedgers("covenants", "covenant")) {
      const otok = edhaCasterToken(owner); if (!otok) continue;
      const ft = edhaAttuneFtColor(owner, "white");
      let any = false;
      for (const c of list) {
        const atok = edhaOrderTokenOf(c.uuid); if (!atok) continue;
        if (!edhaTokensWithin(otok, ft).some(t => t.id === atok.id)) continue;
        add(c.uuid, owner.id); any = true;
      }
      if (any) add(owner.uuid, owner.id);
    }
    for (const tok of (canvas?.tokens?.placeables ?? [])) {
      const a = tok.actor; if (!a) continue;
      const wantSet = want.get(a.uuid) ?? new Set();
      const have = (a.effects ?? []).filter(e => e.getFlag?.("edha-content", "covBuff"));
      const stale = have.filter(e => !wantSet.has(e.getFlag("edha-content", "covBuff")));
      if (stale.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", stale.map(e => e.id)); } catch (e) {} }
      const haveIds = new Set(have.map(e => e.getFlag("edha-content", "covBuff")));
      for (const oid of wantSet) {
        if (haveIds.has(oid)) continue;
        const owner = game.actors?.get(oid);
        try { await a.createEmbeddedDocuments("ActiveEffect", [edhaOrderCovBuffSpec(owner, owner?.name ?? "?", oid)]); } catch (e) {}
      }
    }
  } catch (e) { console.error("Edha Content | Covenant proximity refresh failed", e); }
}
let _edhaOrderCovTimer = null;
function edhaOrderCovenantRefreshSoon() {
  try {
    if (_edhaOrderCovTimer) clearTimeout(_edhaOrderCovTimer);
    _edhaOrderCovTimer = setTimeout(() => { _edhaOrderCovTimer = null; void edhaOrderRefreshCovenantBuffs(); }, 250);
  } catch (e) {}
}
Hooks.on("combatTurnChange", () => { if (edhaDefBuffGmGate()) edhaOrderCovenantRefreshSoon(); });
Hooks.on("updateToken", (tokenDoc, changed) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (changed?.x === undefined && changed?.y === undefined) return;
    edhaOrderCovenantRefreshSoon();
  } catch (e) {}
});
Hooks.on("updateActor", (actor, changes) => {   // a player's covenant create/break lands GM-side via this
  try {
    if (!edhaDefBuffGmGate()) return;
    /* RAW PATH — no rule field repoints this (audit §9o trap 3): it is what makes a *player's*
     * covenant write reach the GM's AE sweep, and it had to be hand-edited with the accessor.
     *
     * ⚠ BOTH SHAPES, and the reason is a Foundry detail worth writing down. setFlag submits
     * `{flags: {"edha-content": {"lists.covenants": …}}}` — a dotted key NESTED one level down — and
     * `DataModel#updateSource` only expands dot-notation when it finds a dot among the change
     * object's TOP-LEVEL keys (data.mjs:447). The top-level key here is "flags", so the expansion is
     * skipped and the dotted key survives into this hook. A plain
     * getProperty(changes, "flags.edha-content.lists.covenants") therefore reads undefined and the
     * refresh never fires — a silently stale +1 AE. The old flat "covenants" key had no dot at all,
     * which is why the pre-repoint code got away with the single lookup. */
    const fl = changes?.flags?.["edha-content"];
    if (!fl || (fl["lists.covenants"] === undefined && fl.lists?.covenants === undefined)) return;
    edhaOrderCovenantRefreshSoon();
  } catch (e) {}
});

/* --- Bear Witness — CONVERTED 07-24u (iron rule 2b) -------------------------------------------------
 * Was `edhaOrderRoundTick` plus its own three combat hooks and its own round-boundary latch. All of
 * it is gone: the talent carries ONE `edha-triggered-effect` rule on `edha-combat-timing` with
 * `whenMoment: "round-start"` and `target: "list-members"`, and the round latch is now the generic
 * `edhaAnnounceRoundStart` (reload guard included, copied from here).
 *
 * The THP amount was `edhaColorRank(owner, "white")` in code and is now the rule's `formula`
 * (`@skills.white.rank`), so Ben can retune it in Foundry — which was the point.
 *
 * One narrowing and one widening, both benched: the trigger now requires the owner to be a COMBATANT
 * (the combat-timing dispatcher iterates combatants; the old owner scan did not), and members are no
 * longer disposition-filtered at grant time — Covenant's place rule already enforces "willing ALLY"
 * before the entry exists, so a partner who later turns hostile keeps their pact rather than silently
 * dropping out of it. */

/* Shoulder the Oath moved onto its document 2bV (iron rule 2b): one `edha-redirect`
 * {direction: intercept} rule — the generic intercept sweep + click (Power section) replace the
 * bespoke prompt and the `shoulder` button. Do not re-add either. */

/* --- Bound-target advantage — attack tests vs a rule owner's ledger-bound synced target ------------
 * 2bV: rule-driven (`edha-bound-adv` — Lawkeeper's Eye's shape). The injector machinery stays
 * ENGINE-OWNED (a defender-keyed pre-roll rewrite is not a rule); the sweep reads rules and names
 * no talent. The `edict` status stays the fast path; the RULE decides whose law counts. */
function edhaBoundAdvApply(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    const t = edhaTargetsOfRoller(actor)[0]; const ta = t?.actor; if (!ta || ta === actor) return;
    if (!ta.statuses?.has?.("edict")) return;                 // fast path: bound by no one
    const atok = edhaCasterToken(actor); if (!atok) return;
    for (const w of edhaWatchersOfRule("edha-bound-adv")) {
      const h = w.handler, owner = w.actor;
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if (!edhaSideSame(atok.document?.disposition, otok.document?.disposition)) continue;   // "you and your allies" — unknown side fails CLOSED (R-63)
      const key = String(h.list || "").trim(); if (!key) continue;
      const bound = edhaOwnerList(owner, key, String(h.listStatus || key).trim()).some(e => e.uuid === ta.uuid)
        || (h.includeDecree === true && (owner.getFlag?.("edha-content", "decree")?.bound ?? []).includes(ta.uuid));
      if (!bound) continue;
      if (h.requireLos !== false && !edhaCanSee(otok, t)) continue;   // "while you can see it" — wall LOS (edhaCanSee)
      roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
      const orig = roll.configureDialog?.bind(roll);
      if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
      return;
    }
  } catch (e) { console.error("Edha Content | bound-advantage pre-roll failed", e); }
}
for (const ctx of ["Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${ctx}Roll`, edhaBoundAdvApply);

/* Verdict moved onto its document 2bV (iron rule 2b): H1 `edha-def-test` {skill: blue, vs:
 * defense/cog, requireTargetOnList: edicts} + an `edha-prohibition-resolve` success payload (the
 * shared resolver + the Discipline court, both rule-driven). Do not re-add a takeover. */

/* Concord moved onto its document 2bV (iron rule 2b): `edha-self-status` {concord,
 * requireListNonEmpty: covenants} + `edha-note` {rosterList} on use, and the first-attack Presence
 * rider is an `edha-damage-bonus` {require: list-member-hits, oncePerRoundPerDealer} rule — the
 * generic pre-pass sweep is the only path. Do not re-add the dealer-pre rider. */

/* --- The dealer PRE-pass: the Covenant-break watch (ledger-keyed, cross-actor observation) ----------
 * ⚠ This function used to host TWO things: Concord's first-attack rider AND this watch. Only the
 * Concord half retired in 2bV (it is an `edha-damage-bonus` rule now) — deleting the whole hook
 * would have deleted the break watch, a DIFFERENT mechanic's only presence (LESSONS §3). */
function edhaOrderDealerPre(dealer, target, list) {
  try {
    if (_edhaInTrigger) return;
    const da = dealer?.actor; if (!da?.getFlag || da === target) return;
    if (!list.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;
    /* Covenant break — "deliberately attacks" is a table call: DETECT partner-damages-partner, PROMPT.
     * ENGINE_OWNED (07-24u): a cross-actor damage observation with no owning document. The break
     * itself is NOT engine-owned any more — the button is H3's generic `.edha-list-release`, keyed on
     * the ledger and the entry id, so this watch names no talent and the pact's own rule owns the
     * release. Ledger-keyed sweep for the same reason. */
    for (const { owner, list: covs } of edhaOwnerLedgers("covenants", "covenant")) {
      for (const c of covs) {
        const pair = (da === owner && target.uuid === c.uuid) || (da.uuid === c.uuid && target === owner);
        if (!pair) continue;
        if (!edhaCoordOPRAllowed(owner, "CovenantWatch", c.id)) continue;  // one prompt per pact per round
        void edhaCoordOPRMark(owner, "CovenantWatch", c.id);
        ChatMessage.create({
          whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
          content: `<div class="edha-trigger-card"><p>🤝 <strong>Covenant watch</strong>: ${da.name} damaged ${target.name} — if that was a DELIBERATE attack, the Covenant ends (owner-judged; incidental/area damage may not count).</p>`
            + `<button type="button" class="edha-list-release" data-owner="${owner.uuid}" data-list="covenants" data-status="covenant" data-entry="${c.id}" data-multi="1">It was deliberate — break the Covenant</button></div>`,
        });
      }
    }
  } catch (e) { console.error("Edha Content | Order dealer pre-pass failed", e); }
}

/* --- The violation watchers: detect the three canonical prohibitions, PROMPT (never auto-fire) ------ */
const _edhaOrderPrompted = new Map();   // "<ownerId>:<edictId|decree>:<kind>[:<actorId>]" → round tag / ts
function edhaOrderPromptGate(key) {
  const round = game.combat?.round;
  const prev = _edhaOrderPrompted.get(key);
  if (round != null) {
    if (prev === `r${round}`) return false;
    _edhaOrderPrompted.set(key, `r${round}`); return true;
  }
  const now = Date.now();
  if (typeof prev === "number" && now - prev < 30000) return false;
  _edhaOrderPrompted.set(key, now); return true;
}
function edhaOrderPromptViolation(owner, { edictId = null, decree = false, prohText = "", what = "" }) {
  // The card names the LIVE talent (rule-scan, rename-safe); "Law"/"Decree" are only fallbacks.
  const srcName = decree ? (edhaDecreeRuleOf(owner)?.item?.name ?? "Decree") : (edhaProhPlaceRuleOf(owner, "edicts")?.item?.name ?? "Law");
  const btn = decree
    ? `<button type="button" class="edha-order-btn" data-edha-action="decree-violated" data-edha-owner="${owner.uuid}">⚖ It violated the Decree — resolve (target the violator first)</button>`
    : `<button type="button" class="edha-order-btn" data-edha-action="violated" data-edha-owner="${owner.uuid}" data-edha-list="edicts" data-edha-edict="${edictId}">⚖ It violated the Edict — resolve</button>`;
  ChatMessage.create({
    whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>⚖️ <strong>${srcName} watch</strong>: ${what} — if that was VOLUNTARY (forced movement/compulsion doesn't count), it just violated "<em>${prohText}</em>".</p>${btn}</div>`,
  });
}
// (a) "move from its space" — rides the shared preUpdateToken edhaPrevPos stamp. Engine-forced
// slides (edha-push, edhaMoveTokenTo — options.edhaForced) are definitively NOT voluntary, so they
// don't even prompt; unstamped moves (walks, GM hand-drags) stay ambiguous → the prompt fires.
Hooks.on("updateToken", (tokenDoc, changed, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!edhaPrevTokenPos(options)) return;                            // the SHARED stamp (fix pass 3)
    if (options?.edhaForced) return;
    const mover = tokenDoc?.actor; if (!mover) return;
    void edhaOrderMoveWatch(mover);
  } catch (e) {}
});
async function edhaOrderMoveWatch(mover) {
  try {
    for (const { owner, list } of edhaOwnerLedgers("edicts", "edict")) {   // data-keyed (2bV): the ledger, not a name
      for (const e of list) {
        if (e.uuid !== mover.uuid || e.proh?.kind !== "move") continue;
        if (!edhaOrderPromptGate(`${owner.id}:${e.id}:move`)) continue;
        edhaOrderPromptViolation(owner, { edictId: e.id, prohText: e.proh.text, what: `<strong>${mover.name}</strong> moved from its space` });
      }
    }
    for (const owner of edhaDecreeOwners()) {
      const d = owner.getFlag?.("edha-content", "decree");
      if (!d || d.proh?.kind !== "move" || !d.bound?.includes(mover.uuid)) continue;
      if (!edhaOrderPromptGate(`${owner.id}:decree:move:${mover.id}`)) continue;
      edhaOrderPromptViolation(owner, { decree: true, prohText: d.proh.text, what: `<strong>${mover.name}</strong> (Decree-bound) moved from its space` });
    }
  } catch (e) { console.error("Edha Content | Order move watch failed", e); }
}
// (b) "activate Investiture" — an inv-value stamp (the edhaHea shape); only a SPEND (decrease) counts.
Hooks.on("preUpdateActor", (actor, changes, options) => {
  try {
    /* BOTH FORMS (2bV — the dotted-key lesson from the covenants migration, ENGINE_INDEX): a
     * preUpdate hook sees the change object AS SUBMITTED, and engine writers submit
     * `{"system.resources.inv.value": N}` with the dot at top level — which getProperty alone
     * cannot see. Missing it silently skipped every engine-driven Investiture spend. */
    const ni = foundry.utils.getProperty(changes, "system.resources.inv.value")
      ?? changes?.["system.resources.inv.value"]
      ?? changes?.["system.resources.inv"]?.value;
    if (ni === undefined) return;
    options.edhaOrderInv = { old: Number(actor.system?.resources?.inv?.value) || 0, new: Number(ni) || 0 };
  } catch (e) {}
});
Hooks.on("updateActor", (actor, changes, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const iv = options?.edhaOrderInv;
    if (!iv || iv.new >= iv.old) return;
    // R-4 / #28b: the Edict says "activate Investiture" — a GM writing a number on the sheet did
    // not activate anything, so the violation prompt needs the same positive signal as the focus
    // watch. A wired ability's cost goes through edhaSpendResource and still counts.
    if (!edhaIsSpend(actor, "inv", options, iv.old, iv.new)) return;
    void edhaOrderInvestWatch(actor);
  } catch (e) {}
});
async function edhaOrderInvestWatch(spender) {
  try {
    for (const { owner, list } of edhaOwnerLedgers("edicts", "edict")) {
      for (const e of list) {
        if (e.uuid !== spender.uuid || e.proh?.kind !== "invest") continue;
        if (!edhaOrderPromptGate(`${owner.id}:${e.id}:invest`)) continue;
        edhaOrderPromptViolation(owner, { edictId: e.id, prohText: e.proh.text, what: `<strong>${spender.name}</strong> spent Investiture` });
      }
    }
    for (const owner of edhaDecreeOwners()) {
      const d = owner.getFlag?.("edha-content", "decree");
      if (!d || d.proh?.kind !== "invest" || !d.bound?.includes(spender.uuid)) continue;
      if (!edhaOrderPromptGate(`${owner.id}:decree:invest:${spender.id}`)) continue;
      edhaOrderPromptViolation(owner, { decree: true, prohText: d.proh.text, what: `<strong>${spender.name}</strong> (Decree-bound) spent Investiture` });
    }
  } catch (e) { console.error("Edha Content | Order Investiture watch failed", e); }
}
// (c) "attack <chosen ally>" — the Sovereignty roll-watch shape (attack/item test + synced target).
async function edhaOrderAttackWatch(ctx, roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const ta = edhaTargetsOfRoller(roller)[0]?.actor ?? null;
    for (const { owner, list } of edhaOwnerLedgers("edicts", "edict")) {
      for (const e of list) {
        if (e.uuid !== roller.uuid || e.proh?.kind !== "attack") continue;
        if (e.proh.allyUuid && (!ta || ta.uuid !== e.proh.allyUuid)) continue;   // attacked someone else (or unknown) — no prompt
        if (!edhaOrderPromptGate(`${owner.id}:${e.id}:attack`)) continue;
        edhaOrderPromptViolation(owner, { edictId: e.id, prohText: e.proh.text, what: `<strong>${roller.name}</strong> made an attack${ta ? ` on <strong>${ta.name}</strong>` : ""}` });
      }
    }
    for (const owner of edhaDecreeOwners()) {
      const d = owner.getFlag?.("edha-content", "decree");
      if (!d || d.proh?.kind !== "attack" || !d.bound?.includes(roller.uuid)) continue;
      if (d.proh.allyUuid && (!ta || ta.uuid !== d.proh.allyUuid)) continue;
      if (!edhaOrderPromptGate(`${owner.id}:decree:attack:${roller.id}`)) continue;
      edhaOrderPromptViolation(owner, { decree: true, prohText: d.proh.text, what: `<strong>${roller.name}</strong> (Decree-bound) attacked${ta ? ` <strong>${ta.name}</strong>` : ""}` });
    }
  } catch (e) { console.error("Edha Content | Order attack watch failed", e); }
}
for (const ctx of ["attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, (r, s, c) => edhaOrderAttackWatch(ctx, r, s, c));

/* --- The DECREE — a scene-wide prohibition over every enemy in range (ENGINE-OWNED flow) -----------
 * 2bV: keyed on the talent's `edha-decree` rule (the Void-Sense exit shape) — the picker dialog,
 * the frozen Witness snapshot and the batch resolution are a cross-actor multi-step subsystem
 * (rule-3's ENGINE-OWNED class), but every dial lives on the RULE and the flow reads the ITEM's
 * damage formula, so no talent name remains in code. Pre-cost gates ride the veto (see the
 * edha-decree veto with the other pre-use gates); the system pays the cost and a picker-cancel
 * REFUNDS (the Trade-Routes convention).
 *
 * R-69 (Ben, 2026-09-05 — "stamp only after a successful pick"): the sceneOnce stamp used to run
 * on the FIRST line of this function, before the prohibition picker opened. A Cancel then refunded
 * the Investiture (bench run 25: 4 → 1 → 4, no card, no `decree` flag) but left
 * `sceneOnce.<itemId> === true` — the scene's only use spent on a dialog that never resolved. The
 * stamp now sits AFTER the `if (!proh)` refund guard, so cost and use agree: a cancel costs nothing
 * and burns nothing. The VETO's polarity is untouched (R-61: a repeat is still refused BEFORE the
 * system charges, in the `edha-decree` preUseItem hook) — R-69 is about a CANCELLED PICK only.
 * The invariant is pinned generically in tests/picker-cancel-stamp.test.js: no function may reach
 * an `edhaRefundCost(...)` cancel guard with an `edhaStampSceneOnce(...)` already behind it. */
async function edhaDecreeUse(item, h) {
  try {
    const owner = item.actor; if (!owner) return;
    const otok = edhaCasterToken(owner);
    const ft = edhaAttuneFtColor(owner, h.rangeColor || "blue");
    const foes = edhaTokensWithin(otok, ft).filter(t => t.actor && edhaDisposHostile(owner, t.actor)   // R-63 🤖 bench row
      && (Number(t.actor.system?.resources?.hea?.value) || 0) > 0);
    const proh = await edhaPickProhibition(owner, `${item.name} — name ONE prohibited action (binds every enemy in range)`);
    if (!proh) { edhaRefundCost(item); ui.notifications?.info(`${item.name} cancelled — cost refunded.`); return; }
    if (h.oncePerScene !== false) await edhaStampSceneOnce(owner, item);   // R-69: AFTER the pick (a cancel burns nothing). Polarity matches this rule's OWN veto (R-61).
    const wKey = String(h.witnessList || "").trim();
    const witnesses = wKey ? edhaOwnerList(owner, wKey, String(h.witnessListStatus || wKey).trim()).map(c => ({ uuid: c.uuid, name: c.name })) : [];
    await owner.setFlag("edha-content", "decree", { proh, bound: foes.map(t => t.actor.uuid), witnesses, itemId: item.id });
    for (const t of foes) void edhaToggleStatus(t.actor, "edict", true);
    edhaTreeCard(owner, null,
      `<p>⚖️ <strong>${item.name.toUpperCase()}</strong> — ${owner.name} speaks the law: every enemy in Attunement Range (${foes.map(t => t.name).join(", ")}) must not <strong>${proh.text}</strong>.`
      + (witnesses.length ? ` Witnesses: ${witnesses.map(w => w.name).join(", ")}.` : " (No Covenant allies stand Witness.)")
      + `</p><p>The FIRST violation: every active Edict triggers, every Witness gains [Tier][Die] Temp HP + advantage on its next attack test, and each enemy within ${Number(h.courtRadiusFt) || 10} ft of the violator takes [Tier][Die]+Int spirit.</p>`
      + `<button type="button" class="edha-order-btn" data-edha-action="decree-violated" data-edha-owner="${owner.uuid}">⚖ Violated — resolve (target the violator first)</button>`);
  } catch (e) { console.error("Edha Content | decree use failed", e); }
}
// The rule that armed the decree (2bV): itemId first, rule-scan fallback — never a name.
function edhaDecreeRuleOf(owner, itemId = null) {
  for (const { item, handler } of edhaActorRulesOf(owner, "edha-decree")) {
    if (itemId && item.id !== itemId) continue;
    return { item, handler };
  }
  return itemId ? edhaDecreeRuleOf(owner, null) : null;
}
async function edhaDecreeResolve(owner, violator) {
  try {
    const d = owner.getFlag?.("edha-content", "decree");
    if (!d) { ui.notifications?.info("Edha: no active Decree."); return; }
    if (!d.bound?.includes(violator.uuid)) { ui.notifications?.warn(`Edha: ${violator.name} is not bound by the Decree — target the violator.`); return; }
    await owner.unsetFlag("edha-content", "decree");          // consume FIRST — a racing second click no-ops
    const dec = edhaDecreeRuleOf(owner, d.itemId ?? null);
    const h = dec?.handler ?? {};
    for (const e of [...edhaGetEdicts(owner)]) await edhaProhResolveViolation(owner, "edicts", e.id, { via: dec?.item?.name ?? "the Decree" });
    const rolls = [];
    let wLine = "no Witnesses stood";
    if (d.witnesses?.length) {                                // ONE shared [T][D white] roll (Ben R0/R9)
      const wr = await edhaRollFormula(owner, h.witnessThpFormula || EDHA_ORDER_WHITE_DIE);
      rolls.push(wr);
      const thp = Math.max(0, Math.floor(wr.total));
      const names = [];
      for (const w of d.witnesses) {
        const a = await edhaResolveActorRef(w.uuid); if (!a) continue;
        if (thp > 0) await edhaGrantTempHpCross(a, thp, dec?.item?.name ?? "the Decree");
        await edhaGrantAdvAttack(a, dec?.item?.name ?? "the Decree");
        names.push(a.name);
      }
      if (names.length) wLine = `${names.join(", ")} gain <strong>${thp}</strong> Temp HP + advantage on their next attack test`;
    }
    const tal = dec?.item;                                    // ONE shared [T][D blue]+Int roll, violator INCLUDED (R9/Magnum R7a)
    const dr = await edhaRollFormula(owner, tal?.system?.damage?.formula || (EDHA_ORDER_BLUE_DIE + " + @attr.int"));
    rolls.push(dr);
    const amt = Math.max(0, Math.floor(dr.total));
    const vtok = edhaOrderTokenOf(violator.uuid);
    let hitNames = [];
    if (vtok && amt > 0) {
      const foes = edhaEnemyTokensInCircle(owner, vtok.center.x, vtok.center.y, Number(h.courtRadiusFt) || 10);
      await edhaOrderApplyHits(owner, foes.map(t => ({ actorUuid: t.actor.uuid, amount: amt, type: tal?.system?.damage?.type || "spirit", heal: false })));
      hitNames = foes.map(t => t.name);
    }
    for (const uuid of (d.bound ?? [])) {                     // decree binding ends — clear icons where no real Edict remains
      const a = await edhaResolveActorRef(uuid);
      if (a) await edhaOrderRefreshBoundIcon(a);
    }
    edhaTreeCard(owner, rolls,
      `<p>⚖️ <strong>${(tal?.name ?? "The Decree").toUpperCase()}</strong> — <strong>${violator.name}</strong> broke the law ("<em>${d.proh?.text}</em>"): every active Edict has triggered; ${wLine}; ${hitNames.length ? `${hitNames.join(", ")} take <strong>${amt}</strong> spirit (within ${Number(h.courtRadiusFt) || 10} ft of the violator, violator included)` : "no enemies stood within reach of the violator"}. The Decree is spent.</p>`);
  } catch (e) { console.error("Edha Content | decree resolve failed", e); }
}

/* The Order takeover Set is GONE (2bV). Every use flows through the system: costs paid natively,
 * gates vetoed pre-cost by the generic handler vetoes, and the two pre-cost dialogs (the
 * prohibition picker, the decree picker) refund on cancel. Do not re-add a takeover — a name in a
 * cancel Set silently inert-s every authored rule on the talent (ENGINE_INDEX). */

/* --- Chat buttons (generic: entry-id + ledger-key data attributes, no talent names) ---------------- */
async function edhaOrderBtnClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner); if (!owner) return;
    if (!owner.isOwner && !game.user?.isGM) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) resolves this."); return; }
    const action = ds.edhaAction;
    if (action === "violated") {
      btn.disabled = true;
      const ok = await edhaProhResolveViolation(owner, ds.edhaList || "edicts", ds.edhaEdict, { via: "declared violation" });
      btn.textContent = ok ? "⚖ resolved" : "⚖ (already gone)";
    } else if (action === "decree-violated") {
      const violator = edhaUserTargetActor();
      if (!violator) { ui.notifications?.warn("Edha: target the violator, then click."); return; }
      btn.disabled = true;
      await edhaDecreeResolve(owner, violator);
      btn.textContent = "⚖ resolved";
    }
    // `break-covenant` retired 07-24u (H3's generic `.edha-list-release`); `shoulder` retired 2bV
    // (the generic `.edha-intercept-btn` — edha-redirect {direction: intercept}).
  } catch (e) { edhaClickFailed("Order button", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-order-btn"] (Job 1, pass 5.3, end of file).

/* --- Scene cleanup (deleteCombat): the whole Order state resets --------------------------------------- */
// ⛑ THE ROW edhaCombatEndGuard WAS BUILT FOR: run 23 watched a bench combat delete take Ben's
// still-live actor's covenant ledger with it — edhaSceneReset's cross-combat guard (R-58) still
// applies per actor. R-60: the ledger/legacy-flag pass (characters-only) and the statuses/covBuff
// pass (tokens-only) both widen to the one deduped population. `_edhaOrderPrompted.clear()` is a
// scene-wide reset of a local Set, not per-actor, so it stays a bespoke top-level statement.
async function edhaClearOrderState(endedCombat) {
  try {
    await edhaSceneReset(endedCombat, {
      key: "order",
      // `lists.covenants` — the second raw path the accessor repoint could not reach (§9o trap 3).
      // unsetFlag resolves a dotted key, so this deletes the ledger and leaves the `lists` object.
      // "edicts"/"concordActive"/"finalDecreeUsed" are LEGACY keys (pre-2bV state on Ben's actors);
      // the live state is lists.edicts / the `concord` status / the generic sceneOnce stamp.
      flags: ["edicts", "lists.edicts", "lists.covenants", "concordActive", "finalDecreeUsed", "decree"],
      statuses: ["edict", "covenant", "concord"],
      extra: async (a) => {
        const buffs = (a.effects ?? []).filter(e => e.getFlag?.("edha-content", "covBuff"));
        if (buffs.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", buffs.map(e => e.id)); } catch (e) {} }
      },
    });
    _edhaOrderPrompted.clear();
  } catch (e) { console.error("Edha Content | clear Order state failed", e); }
}

/* R-60: the eleven byte-identical `Hooks.on("deleteCombat", (combat) => { try { if
 * (edhaDefBuffGmGate()) void edhaClearXState(combat); } catch (e) {} }); // one applier (07-27b)`
 * registrations (Kindle Lights + the ten families above) collapse to ONE hook that gates once, then
 * fires every family. Each family function still gates again internally (edhaSceneReset's own
 * edhaDefBuffGmGate() check) — cheap, and it means a family function stays safe to call directly
 * (tests call e.g. edhaClearChaosState() with no combat argument at all). Kindle Lights sweeps
 * TokenDocuments across every scene, not actor flags/statuses, so it is NOT an edhaSceneReset family
 * — it keeps its own body untouched and just joins the shared table. */
const EDHA_SCENE_RESET_FAMILIES = [
  edhaClearKindleLights,
  edhaClearCharges,
  edhaClearLifeState,
  edhaClearChaosState,
  edhaClearFateState,
  edhaClearSovState,
  edhaClearDeathState,
  edhaClearCivState,
  edhaClearPowerState,
  edhaClearCounterState,
  edhaClearOrderState,
];
Hooks.on("deleteCombat", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier (07-27b) — gated ONCE for the whole table
    for (const fn of EDHA_SCENE_RESET_FAMILIES) void fn(combat);
  } catch (e) {}
});

