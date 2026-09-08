/* ============================================================================================
 * GREEN / INSTINCT tree engine (2026-06-16) — pack tactics: advantage-granting, focus-fire, forced
 * movement, a strike window. Reusable primitives: `advAttackNext` (advantage on your next attack,
 * a mirror of advTest) and the focus-fire tracker — both generic, both stay ENGINE-OWNED.
 * Wired via contest core (reuses edhaQueueContest / edhaRollOpposedSkill):
 *   • Drive the Prey — Green vs Survival (opposed roll); success → Slowed (timed). Forced move-away
 *     and ally Reactive Strikes are GM-narrated (Manual by nature — no movement/reaction hook).
 * ⚑ IRON RULE 2b (07-24p): ON ITS DOCUMENT — `edha-def-test` `vs: skill` + a Slowed rule on
 *   edha-test-success; the GM-narrated half rides the card note. The Fellstag's "Herding Antlers"
 *   adaptation keeps the engine path below: adversary abilities are a different surface with their
 *   own wiring standard (lint pass 5) and are explicitly out of 2b's scope.
 * IRON RULE 2b (07-25, pass 2bS) — the whole Instinct spine is document-driven now:
 *   • Apex Predator — `edha-test-rider` {mode advantage · whenAttribute str,spd ·
 *     whenEnemiesInMyZone 3 · unlessDisadvantage}; the bespoke pre-roll hook trio is deleted.
 *   • Pack Hunter / Scent the Weak — `edha-adv-attack` rules on their own use events.
 *   • Pack Pressure — `edha-strike-window` (use) + an `edha-damage-bonus` {require: window} rule.
 *   • Coordinated Hunt — `edha-damage-bonus` {require: pack-on-target, min(@hunters, @colorRank)}.
 *   • Packmate's Warning — `edha-unseen-ward` (the 2026-07-04 edhaCanSee injector, now announcing)
 *     + an `edha-note` restating the passive on use.
 *   • Natural Order — `edha-self-status` (clearsight arm) + `edha-suppress-veil` + `edha-note`:
 *     the veil-suppression half is ENFORCED via the dark-veil sweep (re-litigated 07-25 — the
 *     Dread Presence lesson); illusions/deception-advantage stay GM-narrated on the note.
 * Manual by nature (no Foundry hook): Predator's Instinct (track/fear).
 * ============================================================================================ */

// "Advantage on your next attack" flag (Pack Hunter / Scent the Weak), consumed on the next attack.
async function edhaGrantAdvAttack(actor, source) {
  try {
    return await edhaSetEdhaFlag(actor, "advAttackNext", source || true);   // Job 6a: routed through the canonical helper
  } catch (e) { return false; }
}
function edhaAdvAttackPreRoll(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    if (!actor?.getFlag?.("edha-content", "advAttackNext")) return;
    roll.options.advantageMode = "advantage"; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "advantage"; } catch (e) {} return orig(data); };
  } catch (e) { console.error("Edha Content | adv-attack pre-roll failed", e); }
}
function edhaAdvAttackConsume(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config);
    const src = actor?.getFlag?.("edha-content", "advAttackNext"); if (!src) return;
    void actor.unsetFlag("edha-content", "advAttackNext");
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🐾 <strong>${typeof src === "string" ? src : "Pack tactics"}</strong> — advantage spent on this attack.</p>` });
  } catch (e) { console.error("Edha Content | adv-attack consume failed", e); }
}
for (const ctx of ["attack", "item"]) {
  const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1);
  Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaAdvAttackPreRoll);
  Hooks.on(`cosmere-rpg.${ctx}Roll`,    edhaAdvAttackConsume);
}

/* --- Coordinated Hunt — focus-fire tracker (who attacked whom this round; GM-side) ----------------- */
let _edhaFocusFire = { byTarget: {} };   // tokenId -> { round, attackers:Set } — per target, per R-4/#28a
/* R-4/#28a. Two changes, and the second is the one the ruling is about.
 * (a) The round is the TARGET's own combat round on BOTH sides, so a second encounter's clock can
 *     neither roll this ledger over nor answer for it. It is stored PER TARGET for that reason —
 *     one shared `round` field could only ever describe one combat.
 * (b) **No round → no ledger.** "Who attacked whom THIS ROUND" is unanswerable out of combat, and
 *     the old `?? 0` made it answerable-and-permanent: every out-of-combat attack stayed on the
 *     record for the rest of the session, so Coordinated Hunt's advantage never lapsed. */
function edhaRecordFocusFire(attackerTok, targetToks) {
  for (const tt of targetToks) {
    const round = edhaCombatRoundOf(tt?.actor ?? null); if (round == null) continue;
    const e = _edhaFocusFire.byTarget[tt.id];
    if (!e || e.round !== round) _edhaFocusFire.byTarget[tt.id] = { round, attackers: new Set([attackerTok.id]) };
    else e.attackers.add(attackerTok.id);
  }
}
function edhaFocusFireSet(targetTok) {
  const round = edhaCombatRoundOf(targetTok?.actor ?? null); if (round == null) return new Set();
  const e = _edhaFocusFire.byTarget[targetTok?.id];
  return (e && e.round === round) ? e.attackers : new Set();
}
async function edhaFocusFireWatch(roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const roller = edhaD20RollActor(config); if (!roller) return;
    const rtok = edhaCasterToken(roller); if (!rtok) return;
    const targets = edhaTargetsOfRoller(roller); if (targets.length) edhaRecordFocusFire(rtok, targets);
  } catch (e) {}
}
for (const ctx of ["attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaFocusFireWatch);

// Strike window (opened by `edha-strike-window`) — active until the start of the owner's next turn.
// Renamed from the Pack-Pressure-specific `packPressure` flag 07-25 (pass 2bS): the window is a
// generic arm any talent can open, read by `edha-damage-bonus` rules gated `require: window`.
function edhaStrikeWindowActive(actor) {
  const pp = actor?.getFlag?.("edha-content", "strikeWindow");
  const now = edhaTurnSeqOf(actor);   // R-4/#28a: the WINDOW OWNER's combat clock
  if (!pp || now == null) return false;
  return now < edhaTurnSeq(pp.round, pp.turn);
}

/* --- Instinct on-use abilities -------------------------------------------------------------------
 * IRON RULE 2b (07-25, pass 2bS): the name switch is gone. Pack Hunter and Scent the Weak are
 * `edha-adv-attack` rules on their own `use` events (the generic executor below feeds the same
 * advAttackNext pipeline); Pack Pressure is `edha-strike-window` + an `edha-damage-bonus` rule;
 * Packmate's Warning's restatement card and Natural Order's scene card are `edha-note` rules.
 * Only the Fellstag's Herding Antlers keeps an engine path — an ADVERSARY adaptation, a different
 * surface with its own wiring standard (lint pass 5), explicitly out of scope for 2b. */
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    // Drive the Prey moved onto its document 07-24p (iron rule 2b) — `edha-def-test` green vs the
    // foe's Survival + a Slowed rule on edha-test-success. The forced move-away and ally Reactive
    // Strikes stay GM-narrated (no Foundry movement/reaction hook) and ride the H1 card's note.
    // "Herding Antlers" is the Fellstag's ruling-40 ADVERSARY adaptation — a different surface with
    // its own wiring standard (lint pass 5), explicitly out of scope for 2b, so it keeps this path.
    if (item.name === "Herding Antlers" && edhaOwnsTalent(actor, item.name)) {
      const t = target0(), nm = item.name;
      if (!t) {
        ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
          content: `<div class="edha-trigger-card"><p>🐺 <strong>${nm}</strong> — target the enemy and use again to auto-resolve Green vs its Survival (success → Slowed; forced move-away and ally Reactive Strikes are GM-narrated).</p></div>` });
      } else {
        edhaQueueContest(actor, "green", async ({ total }) => {
          const opp = await edhaRollOpposedSkill(t, "sur");
          const success = total >= opp;
          if (success) {
            await edhaApplyTimedStatus(t, "slowed", { owner: actor, expire: "target" });
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🐺 <strong>${nm}</strong>: Green <strong>${total}</strong> ≥ ${t.name}'s Survival <strong>${opp}</strong> — ${t.name} is <strong>Slowed</strong>. It must move away from you on its next turn; allies may make Reactive Strikes if it moves within their reach (GM-narrated).</p>` });
          } else {
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p>🐺 <strong>${nm}</strong>: Green <strong>${total}</strong> &lt; ${t.name}'s Survival <strong>${opp}</strong> — it doesn't break.</p>` });
          }
        });
      }
    }
  } catch (e) { console.error("Edha Content | Instinct use-hook failed", e); }
});

/* --- Unseen-attack ward (`edha-unseen-ward`, 07-25 pass 2bS — was the name-keyed Packmate's
 * Warning injector). Defender-keyed pre-roll injector (the Lawkeeper shape + the Mantle
 * NumericTerm append; was truly-manual until edhaCanSee existed, upgraded 2026-07-04): an attack
 * roll whose synced target is an ally within the rule's range of an owner AND cannot see the
 * attacker (hidden, or a sight-blocking wall) takes −N — the roll-side equivalent of "+N defense
 * against it". The sweep ANNOUNCES (edhaWatchersOfRule); range, amount and the "an ally" self-
 * exclusion ride the document. ⚑ NumericTerm append — same bench caveat as the Mantle aura. */
function edhaUnseenWardPreRoll(roll, source, config) {
  try {
    const attacker = edhaD20RollActor(config); if (!attacker) return;
    const atok = edhaCasterToken(attacker); if (!atok) return;
    const dtok = edhaTargetsOfRoller(attacker)[0]; const da = dtok?.actor; if (!da || da === attacker) return;
    if (edhaCanSee(dtok, atok)) return;                       // the defender SEES the attack — no ward
    for (const { actor: owner, item: tal, handler: h } of edhaWatchersOfRule("edha-unseen-ward")) {
      if (h.excludeSelf !== false && owner === da) continue;  // "an ally" — the owner itself is excluded
      const otok = edhaCasterToken(owner); if (!otok) continue;
      if (!edhaSideSame(otok.document?.disposition, dtok.document?.disposition)) continue;   // "an ally" — unknown side fails CLOSED (R-63)
      if (!edhaTokensWithin(otok, Number(h.rangeFt) || 10).some(x => x.id === dtok.id)) continue;
      const T = foundry.dice?.terms ?? {};
      if (!T.OperatorTerm || !T.NumericTerm) return;
      const amt = Math.max(1, Number(h.amount) || 2);
      roll.terms.push(new T.OperatorTerm({ operator: "-" }), new T.NumericTerm({ number: amt, options: { flavor: `${tal.name} (+${amt} defense)` } }));
      roll._formula = Roll.getFormula(roll.terms);
      break;
    }
  } catch (e) { console.error("Edha Content | unseen-ward pre-roll failed", e); }
}
for (const ctx of ["Attack", "Item"]) Hooks.on(`cosmere-rpg.pre${ctx}Roll`, edhaUnseenWardPreRoll);

/* --- Draw Mana — universal leyline action; rider determined by the owned Leyline Key(s) ---------
 * Canon: "1 Action: recover Investiture equal to your Tier and trigger your leyline color's Attunement
 * rider." The Draw Mana action is granted by every leyline path (foundry-build pathEvents); the
 * per-color effect lives on the Key talent — ON ITS OWN DOCUMENT, every one of them, reached by the
 * `edha-draw-mana` event:
 *   Blue/Red → `edha-next-test-mod`, attribute-gated (07-24y); Red's Reaction reminder = `edha-note`.
 *   White → `edha-pulse` (2bR; + Beacon's `edha-cleanse`).
 *   Green → `edha-zone` (2bS; picker/Region machinery ENGINE-OWNED, spec on the rule).
 *   Black → `edha-pulse` {who: enemies, status weakened, requireIsolated, visibleOnly} (2bZ) — the
 *     LAST name-keyed row. The EDHA_DRAW_MANA table it lived in is DELETED; the 07-05 Isolated
 *     gate, the 07-12 line-of-sight ruling and the 07-12b GM-whispered skip accounting all rode
 *     into the pulse runner as generic fields. Do not re-add a table here. */
async function edhaHealActor(actor, amt) {
  const hea = actor?.system?.resources?.hea; if (!hea) return;
  const max = (hea.max && typeof hea.max === "object") ? hea.max.value : hea.max;
  await edhaResourceWrite(actor, "hea", { value: Math.min(max ?? ((hea.value || 0) + amt), (hea.value || 0) + amt) }, edhaBookkeepingTag("edhaHealActor"));
}
/* The pulse runner (`edha-pulse`, 07-25; enemy side 2bZ): heal or a status to every ally — or
 * enemy — within the colour's Attunement Range. visibleOnly reproduces the 07-12 through-walls
 * ruling with per-skip accounting; cross-actor heals relay to the GM (07-17 playtest: a player
 * doesn't own their allies' actors). ENEMY pulses follow the 07-12b information ruling: the
 * public card accounts only for what the player can SEE (unseen checks run FIRST, so the
 * ally-adjacent count covers only visible enemies), and the hidden/behind-a-wall skips whisper to
 * the GM via edhaPostGmCard — the Black Draw Mana rider's shape, generic now. */
async function edhaRunPulse(item, h) {
  const owner = item?.actor; if (!owner) return;
  const tok = edhaCasterToken(owner); if (!tok) return;
  const ft = edhaAttuneFtColor(owner, h.rangeColor || "white");
  const disp = tok.document?.disposition;
  const enemies = String(h.who || "allies") === "enemies";
  const inRange = edhaTokensInCircle(tok.center.x, tok.center.y, ft, tok.id)
    .filter(t => t.actor && (enemies ? edhaSideHostile(t.document?.disposition, disp) : edhaSideSame(t.document?.disposition, disp)));   // R-63: an unresolvable side is in NEITHER pulse
  const skips = { hidden: 0, wall: 0, ally: 0 };
  let picked = !h.visibleOnly ? inRange : inRange.filter(t => {
    if (t.document?.hidden) { skips.hidden++; return false; }
    if (!edhaCanSee(tok, t)) { skips.wall++; return false; }
    return true;
  });
  if (h.requireIsolated) picked = picked.filter(t => {
    if (!edhaIsIsolated(t.actor, t)) { skips.ally++; return false; }
    return true;
  });
  const note = h.note ? ` <span style="opacity:.85;font-size:.9em">${h.note}</span>` : "";
  /* R-32 (Ben 2026-09-06 (a)): "affected N" was the ambiguous word — it counted the sweep's REACH,
   * not the board's change, so five already-Weakened enemies read "affected 5". Both cards now say
   * "swept" for the reach and carry the newly-changed count beside it when there is one. */
  const gmAccounting = async (applied, newlyNote = "") => {
    if (!enemies || (!skips.hidden && !skips.wall)) return;
    const unseen = [];
    if (skips.hidden) unseen.push(`${skips.hidden} hidden`);
    if (skips.wall) unseen.push(`${skips.wall} behind a wall`);
    // GM-only — MUST be posted by the GM, never authored by the using player (a whisper is
    // visible to its author, so a player would otherwise see these counts on their own screen).
    await edhaPostGmCard(owner, `<p>🕵️ <strong>${item.name}</strong> full sweep for the GM: ${inRange.length} enem${inRange.length === 1 ? "y" : "ies"} in range, swept ${applied}${newlyNote} — also skipped ${unseen.join(", ")} (not shown to the player).</p>`);
  };
  if (String(h.kind || "heal") === "status") {
    const sid = h.statusId; if (!sid) return;
    let applied = 0, newly = 0;
    /* R-32: `applied` is INTENT (every creature the sweep reached and was allowed to write to);
     * `newly` is STATE (how many of those did not already carry the status). The old card reported
     * only the first and called it "affected", which is true of the sweep and false of the board —
     * the difference is invisible exactly when it matters most, a re-pulse that changed nothing.
     * `has` is read BEFORE the toggle, per creature; the relay branch reports its own intent. */
    // Players don't own enemy actors — edhaToggleStatus relays to the GM client when needed.
    for (const t of picked) {
      const had = !!t.actor?.statuses?.has?.(sid);
      try { if (await edhaToggleStatus(t.actor, sid, true)) { applied++; if (!had) newly++; } } catch (e) {}
    }
    if (enemies) {
      const visTotal = picked.length + skips.ally;   // what the player can see
      const skipNote = skips.ally ? ` — skipped ${skips.ally} with an ally adjacent` : "";
      const newlyNote = ` · newly <strong>${edhaConditionLabel(sid)}</strong> ${newly}`;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>☠️ <strong>${item.name}</strong> (${owner.name}): swept ${applied}${newlyNote} — of ${visTotal} enem${visTotal === 1 ? "y" : "ies"} you can see within ${ft} ft${h.requireIsolated ? " (Isolated)" : ""}${skipNote}.${note}</p>` });
      await gmAccounting(applied, newlyNote);
      return;
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>✨ <strong>${item.name}</strong> (${owner.name}): ${picked.length} ally(ies) within range gain <strong>${edhaConditionLabel(sid)}</strong>.${note}</p>` });
    return;
  }
  const amt = Math.max(0, Math.floor(edhaEvalSync(String(h.formula || "@tier"), owner.getRollData())) || 0);
  if (!(amt > 0)) return;
  /* item 68 (fix pass 8): a sweep is the one place where the rolled amount can be right for some
   * targets and wrong for others — each creature carries its OWN mark, so one number for the group
   * cannot be true. Count who actually regained HP, total what landed, and name whoever the mark
   * stopped. "healed N" now means healed, not reached. */
  const self = (h.includeSelf && !enemies) ? 1 : 0;
  const subjects = [...picked.map(a => a.actor), ...(self ? [owner] : [])];   // self is always owned; the cross path adds the heal-cut gate (defect 5)
  let healedCount = 0, delivered = 0; const cutNames = [];
  for (const a of subjects) {
    const got = await edhaCrossHeal(a, amt);
    if (got > 0) { healedCount++; delivered += got; } else cutNames.push(a.name);
  }
  const skipBits = [];
  if (skips.hidden) skipBits.push(`${skips.hidden} hidden`);
  if (skips.wall) skipBits.push(`${skips.wall} behind a wall`);
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<p>🕊️ <strong>${item.name}</strong>: healed ${healedCount} of ${inRange.length + self} ${enemies ? "creature" : "ally(ies)"} for <strong>${delivered}</strong> HP within ${ft} ft${h.visibleOnly ? " (visible)" : ""}${skipBits.length && !enemies ? ` — skipped ${skipBits.join(", ")}` : ""}${cutNames.length ? ` — no healing landed on ${cutNames.join(", ")}` : ""}.${note}</p>` });
  await gmAccounting(picked.length);
}
async function edhaDrawMana(item) {
  try {
    const actor = item?.actor; if (!actor) return;
    const tier = Number(actor.system?.tier) || 1;
    const inv = actor.system?.resources?.inv;
    if (inv) { const max = (inv.max && typeof inv.max === "object") ? inv.max.value : inv.max; await edhaResourceWrite(actor, "inv", { value: Math.min(max ?? ((inv.value || 0) + tier), (inv.value || 0) + tier) }, edhaBookkeepingTag("Draw Mana (recover Investiture)")); }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${actor.name}</strong> Draws Mana — recover ${tier} Investiture.</p>` });
    // …then the document-driven riders (every Key since 2bZ). AFTER the summary card so the
    // recover-Investiture line still reads first; each rule posts its own card.
    await edhaDispatchDrawMana(actor, item);
  } catch (e) { console.error("Edha Content | Draw Mana failed", e); }
}
Hooks.on("cosmere-rpg.useItem", (item) => { try { if (item?.name === "Draw Mana") void edhaDrawMana(item); } catch (e) { console.error("Edha Content | Draw Mana hook failed", e); } });

// Granted-via-path means a character who added their leyline path BEFORE this update won't retroactively
// have Draw Mana. This adds it from the leyline pack (or re-add the leyline path to grant it normally).
async function edhaGrantDrawMana(actor) {
  actor ??= canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
  if (!actor) { ui.notifications?.warn("Edha: select a token to grant Draw Mana."); return; }
  if (actor.items.some(i => i.name === "Draw Mana")) { ui.notifications?.info(`${actor.name} already has Draw Mana.`); return; }
  const pack = game.packs?.get("edha-content.edha-leyline");
  const src = (await pack?.getDocuments?.() ?? []).find(d => d.name === "Draw Mana");
  if (!src) { ui.notifications?.warn("Edha: Draw Mana not in the leyline pack yet (rebuild needed)."); return; }
  await actor.createEmbeddedDocuments("Item", [src.toObject()]);
  ui.notifications?.info(`Edha: granted Draw Mana to ${actor.name}.`);
}

/* --- Lay Foundation (Kethane/Civilization) — full takeover (2026-06-12) ------------------------
 * Canon text: "Spend 1 Investiture and designate a 10 ft square in Attunement Range as a Foundation
 * for the scene. Allies that begin their turn in a Foundation gain +1 to all defenses until the
 * start of their next turn. You may sustain up to your tier Foundations."
 * Playtest problems (2026-06-11): the old edha-aoe-template rule left the system's default use flow
 * running (one click → endless placement until relog) and the Foundation was visual-only.
 * New model: preUseItem takeover (returning false cancels the default flow entirely — exactly ONE
 * placement per use, right-click cancels + refunds). The Foundation itself is a player-visible
 * DRAWING (gold 10 ft square) placed on the primary GM client (players usually lack DRAWING_CREATE),
 * which also enforces the tier sustain cap by crumbling the oldest. Mechanics ride the cosmere
 * activation flags: when a combatant is Activated (= begins its turn), the GM client applies/removes
 * a +1 phy/cog/spi ActiveEffect based on whether its token sits in a friendly Foundation — which is
 * precisely "begin your turn in a Foundation → +1 all defenses until the start of your next turn".
 */
const EDHA_FOUNDATION_HEX = "#e8c060";
function edhaFoundationsOn(scene, casterId = null) {
  return (scene?.drawings ?? []).filter(d => {
    const f = d.getFlag?.("edha-content", "foundation");
    return f && (!casterId || f.casterId === casterId);
  });
}
// The Foundation drawing whose square contains the point (for a same-disposition creature), if any.
function edhaFoundationAtPoint(scene, x, y, disposition) {
  return edhaFoundationsOn(scene).find(d => {
    const f = d.getFlag("edha-content", "foundation");
    if (f.disposition !== undefined && f.disposition !== disposition) return false;
    const w = d.shape?.width ?? 0, h = d.shape?.height ?? 0;
    return x >= d.x && x <= d.x + w && y >= d.y && y <= d.y + h;
  }) ?? null;
}
async function edhaZoneFoundation(item, h) {
  try {
    const actor = item?.actor; const scene = canvas?.scene;
    if (!actor || !scene) return;
    const tok = edhaCasterToken(actor);
    const color = h?.color || edhaTalentColor(item) || "white";
    const rangeFt = Number(h?.rangeFt) > 0 ? Number(h.rangeFt) : (EDHA_ATTUNE_FT[edhaColorRank(actor, color)] || EDHA_ATTUNE_FT[1]);
    // Show Attunement Range while picking the point (same UX as bursts).
    let ring = null;
    if (tok) { try { ring = await edhaDrawCircle(tok.center.x, tok.center.y, rangeFt, EDHA_RANGE_RING_HEX, 0); } catch (e) {} }
    const pt = await edhaPickPoint(`Click the center of the 10 ft Foundation square (right-click to cancel). Attunement Range ${rangeFt} ft.`);
    try { if (ring) await ring.delete(); } catch (e) {}
    if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} cancelled — Investiture refunded.`); return; }
    if (tok) {
      const gs0 = scene.grid?.size || 100, gd0 = scene.grid?.distance || 5;
      const distFt = Math.hypot(pt.x - tok.center.x, pt.y - tok.center.y) / gs0 * gd0;
      if (distFt > rangeFt + gd0 / 2) { edhaRefundCost(item); ui.notifications?.warn(`Edha: that point is ${Math.round(distFt)} ft away — beyond Attunement Range (${rangeFt} ft). Refunded.`); return; }
    }
    const gs = scene.grid?.size || 100, gd = scene.grid?.distance || 5;
    const sqFt = Number(h?.sizeFt) > 0 ? Number(h.sizeFt) : 10;        // the rule's square (Lay Foundation: 10 ft)
    const sizePx = Math.max(gs, Math.round((sqFt / gd) * gs));
    const x = Math.round((pt.x - sizePx / 2) / gs) * gs;               // snap so edges sit on grid lines
    const y = Math.round((pt.y - sizePx / 2) / gs) * gs;
    const payload = {
      sceneId: scene.id, x, y, size: sizePx,
      casterId: actor.id, casterName: actor.name,
      disposition: edhaActorSide(actor),   // R-63: prototypeToken is a real answer; a guessed 1 is not
      maxSustained: edhaListCap(actor, h?.capFormula || "@tier"),
    };
    if (game.user?.isGM) await edhaFoundationPlace(payload);
    else {
      if (!game.users?.activeGM) { edhaRefundCost(item); ui.notifications?.warn("Edha: a GM must be online to place a Foundation. Refunded."); return; }
      game.socket.emit("module.edha-content", { action: "foundation-place", payload });
    }
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p>🧱 <strong>${actor.name}</strong> lays a <strong>Foundation</strong> — allies that begin their turn in it gain <strong>+1 to all defenses</strong> until the start of their next turn (scene; sustains up to ${payload.maxSustained}).</p>`,
    });
  } catch (e) { console.error("Edha Content | zone foundation failed", e); }
}
// GM-side: enforce the tier sustain cap (oldest crumbles), then create the player-visible drawing.
async function edhaFoundationPlace(p) {
  try {
    const scene = game.scenes?.get(p.sceneId); if (!scene) return;
    const existing = edhaFoundationsOn(scene, p.casterId)
      .sort((a, b) => (a.getFlag("edha-content", "foundation")?.ts ?? 0) - (b.getFlag("edha-content", "foundation")?.ts ?? 0));
    const over = existing.length - (Math.max(1, Number(p.maxSustained) || 1) - 1);
    if (over > 0) {
      await scene.deleteEmbeddedDocuments("Drawing", existing.slice(0, over).map(d => d.id));
      ChatMessage.create({ content: `<p>🧱 ${p.casterName}'s oldest Foundation crumbles (sustain cap ${p.maxSustained}).</p>` });
    }
    const [drawing] = await scene.createEmbeddedDocuments("Drawing", [{
      x: p.x, y: p.y,
      shape: { type: "r", width: p.size, height: p.size },
      strokeColor: EDHA_FOUNDATION_HEX, strokeWidth: 4, strokeAlpha: 1,
      fillType: CONST.DRAWING_FILL_TYPES?.SOLID ?? 1, fillColor: EDHA_FOUNDATION_HEX, fillAlpha: 0.15,
      text: "Foundation", fontSize: Math.max(16, Math.round(p.size / 5)), textColor: EDHA_FOUNDATION_HEX, textAlpha: 0.9,
      flags: { "edha-content": { foundation: { casterId: p.casterId, casterName: p.casterName, disposition: p.disposition, ts: Date.now() } } },
    }]);
    // CIVILIZATION / Bastion (Ben R4, 07-02): while Bastion holds, Foundations laid later come up fortified.
    const caster = game.actors?.get(p.casterId);
    if (drawing && caster?.getFlag?.("edha-content", "bastionActive")) {
      // 2bV: the fortifying talent is found by RULE (edha-zone {kind: fortify}), never by name.
      const fort = edhaCivFortifyRuleOf(caster);
      await edhaCivFortifyGM({
        sceneId: scene.id, ownerUuid: caster.uuid, drawingIds: [drawing.id],
        baked: edhaFoldDieMath(Roll.replaceFormulaData(fort?.item.system?.damage?.formula || EDHA_CIV_RED_DIE, caster.getRollData(), { missing: "0" })),
        type: fort?.item.system?.damage?.type || "impact", label: fort?.item.name ?? "", disposition: p.disposition,
      });
    }
  } catch (e) { console.error("Edha Content | foundation place failed", e); }
}
// CIVILIZATION / Bastion: a Foundation drawing that crumbles (sustain cap / GM clear) takes its
// fortified Region along, and any Construct standing there loses the Bastion buff on the next sweep.
Hooks.on("deleteDrawing", async (drawingDoc) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!drawingDoc?.getFlag?.("edha-content", "foundation")) return;
    const scene = drawingDoc.parent; if (!scene) return;
    const dead = (scene.regions ?? []).filter(r => r.getFlag?.("edha-content", "fortified")?.drawingId === drawingDoc.id);
    if (dead.length) await scene.deleteEmbeddedDocuments("Region", dead.map(r => r.id));
    await edhaCivBastionSweep(scene);
  } catch (e) { console.error("Edha Content | fortified-foundation cleanup failed", e); }
});
// The 06-12 takeover is GONE (2bV): the flow above is `edha-zone {kind: foundation}`'s executor —
// exactly ONE placement per use (a rule executor fires once), right-click cancels + refunds. The
// original endless-placement bug belonged to the old edha-aoe-template rule, not to use() itself.
// Ben (pass 3, 07-12): starting combat INSIDE a Foundation gave no bonus until the second turn —
// the activation-flag watcher below only sees flags CHANGING, and nobody's has changed yet at
// combat start. Sweep every combatant then: anyone standing in a Foundation is buffed until their
// first real turn-start re-derives it.
Hooks.on("combatStart", (combat) => {
  try { if (edhaDefBuffGmGate()) for (const c of (combat?.combatants ?? [])) void edhaFoundationTurnStart(c); }
  catch (e) { console.error("Edha Content | foundation combat-start sweep failed", e); }
});
// Mechanics: cosmere "turns" are activation flags (markActivated), not core combat.turn — so a
// combatant beginning its turn surfaces as flags.cosmere-rpg.activated flipping to true.
Hooks.on("updateCombatant", (combatant, changed) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const act = foundry.utils.getProperty(changed, "flags.cosmere-rpg.activated");
    const boss = foundry.utils.getProperty(changed, "flags.cosmere-rpg.bossFastActivated");
    if (act !== true && boss !== true) return;
    void edhaFoundationTurnStart(combatant);
  } catch (e) { console.error("Edha Content | foundation turn-start hook failed", e); }
});
async function edhaFoundationTurnStart(combatant) {
  try {
    const actor = combatant?.actor; const tokDoc = combatant?.token;
    if (!actor || !tokDoc) return;
    const scene = tokDoc.parent; const gs = scene?.grid?.size || 100;
    const cx = tokDoc.x + (tokDoc.width ?? 1) * gs / 2, cy = tokDoc.y + (tokDoc.height ?? 1) * gs / 2;
    const inside = edhaFoundationAtPoint(scene, cx, cy, tokDoc.disposition);
    const existing = actor.effects.filter(e => e.getFlag?.("edha-content", "foundationBuff"));
    // Magnum Opus (Civilization) upgrades the buff to +2 for the scene (Ben R7b, 07-02): read the
    // Foundation's caster; a stale-value buff is recreated so mid-combat upgrades land next turn-start.
    const caster = inside ? game.actors?.get(inside.getFlag("edha-content", "foundation")?.casterId) : null;
    const bonus = Math.max(1, Number(caster?.getFlag?.("edha-content", "civFoundationBonus")) || 1);
    const stale = existing.filter(e => (Number(e.getFlag?.("edha-content", "foundationBuff")?.bonus) || 1) !== bonus);
    if (inside && stale.length) await actor.deleteEmbeddedDocuments("ActiveEffect", stale.map(e => e.id));
    if (inside && (!existing.length || stale.length === existing.length)) {
      await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: `Foundation (+${bonus} defenses)`, img: "icons/tools/smithing/anvil.webp",
        changes: ["phy", "cog", "spi"].map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(bonus), priority: 20 })),
        description: `<p>Began the turn in a Foundation: +${bonus} to all defenses until the start of your next turn.</p>`,
        flags: { "edha-content": { foundationBuff: { bonus } } },
      }]);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🧱 <strong>${actor.name}</strong> begins their turn in a Foundation — +${bonus} to all defenses until the start of their next turn.</p>` });
    } else if (!inside && existing.length) {
      await actor.deleteEmbeddedDocuments("ActiveEffect", existing.map(e => e.id));
    }
  } catch (e) { console.error("Edha Content | foundation turn-start failed", e); }
}
// Cleanup: buffs end with combat; Foundations themselves are scene-long (delete the drawings to clear).
Hooks.on("deleteCombat", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    for (const c of (combat?.combatants ?? [])) {
      const ex = c.actor?.effects?.filter(e => e.getFlag?.("edha-content", "foundationBuff")) ?? [];
      if (ex.length) void c.actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id));
    }
  } catch (e) { console.error("Edha Content | foundation combat cleanup failed", e); }
});

/* --- Investiture max derivation (Edha canon: 2 + max(Awareness, Presence)) --------------------
 * Base cosmere has NO Investiture-max derivation (it's Surge-gated → 0/manual for leyline mages), so
 * players had to set it by hand. We derive it for CHARACTER actors by wrapping prepareDerivedData and
 * writing system.resources.inv.max.value after the system's own prep. Characters always use the canon
 * formula (manual inv overrides on PCs are intentionally ignored); adversaries/NPCs are left untouched.
 */
const _edhaInvPersisted = new Set();   // actor ids whose source inv override we've already persisted this session
function edhaDeriveInvestiture(actor) {
  try {
    if (actor?.type !== "character") return;                 // PCs only; NPC/adversary inv stays manual
    const inv = actor.system?.resources?.inv; if (!inv?.max) return;
    const awa = Number(actor.system?.attributes?.awa?.value) || 0;
    const pre = Number(actor.system?.attributes?.pre?.value) || 0;
    const derived = 2 + Math.max(awa, pre);
    try { inv.max.value = derived; }                                       // plain field: set directly
    catch (e) { try { inv.max.override = derived; inv.max.useOverride = true; } catch (e2) {} }  // DerivedValueField: .value is getter-only → use override
    try { if (typeof inv.value === "number" && inv.value > derived) inv.value = derived; } catch (e) {}  // clamp current
    // PERSIST the override to the actor's SOURCE (once per session): the system's own prepare clamps
    // inv.value against the SOURCE max BEFORE our runtime override applies, so an actor without a
    // persisted source override gets its current Inv clamped to 0 on every prepare (2026-06-11 gotcha).
    try {
      // R-77 (bench run 36, 2026-09-06): this persist is a WORLD WRITE and it was the ONE such site
      // item 12's one-applier consolidation did not reach — it gated on `actor.isOwner` plus a
      // PER-CLIENT Set, so with two GM clients the writer was whichever prepared the actor first
      // (Ben's non-primary `Gamemaster` wrote override 6 on `Bench — Red` while the primary `Bench`
      // wrote 5 on `Bench — Blue`, in one window). NOT edhaDefBuffGmGate() outright: the owner gate
      // exists so a player-owned PC can persist its own max on a table with no GM online (that is
      // what the 2026-06-11 gotcha above is about), and the blunt gate would silently stop doing it.
      // So GMs defer to the primary GM; a non-GM owner still writes. R-77's recommended default,
      // applied pending Ben's veto.
      const src = actor._source?.system?.resources?.inv?.max;
      const mayPersist = !game.user?.isGM || edhaNoOtherActiveGM();
      if (game?.ready && mayPersist && actor.id && src && (!src.useOverride || Number(src.override) !== derived) && !_edhaInvPersisted.has(actor.id) && actor.isOwner) {
        _edhaInvPersisted.add(actor.id);
        setTimeout(() => { actor.update({ "system.resources.inv.max.override": derived, "system.resources.inv.max.useOverride": true }).catch(() => {}); }, 0);
      }
    } catch (e) { /* non-fatal */ }
  } catch (e) { console.error("Edha Content | Investiture derivation failed", e); }
}

/* --- THE EDHA DERIVED-STAT RULES — one source of truth ------------------------------------------
 * `source-materials/legacy-uploads/Character_Building_Rules.md` §Derived stats is canon for these;
 * the cosmere system derives TWO of them differently — Movement and Senses. HP is NOT one of them
 * (the correction R-54 landed, 2026-09-06): `Character_Building_Rules.md` §HP and
 * `Edha_Character_Builder.xlsx` (Character Builder!H22) both give `HP = 10 + STR` at L1,
 * term-for-term the system's own advancement table, so the Edha and system numbers are IDENTICAL.
 * See `docs/ACTOR_STAT_DERIVATION.md` (the per-stat derivation map) before touching any of this.
 * Both the SHEET (edhaDeriveSheetStats, below) and the WIZARD PREVIEW (edhaCwDerivedPreview) read
 * these helpers, because when they each carried their own copy of the arithmetic they drifted in
 * BOTH directions at once — bench run 21 measured preview Health 13 / Move 30 / Senses 10 against
 * sheet 14 / 35 / 5.
 *  • Movement = 20 + SPD·5 ft   (canon; the system's own ladder is ceil(SPD/2) into [20,25,30,40,60,80])
 *  • Senses Range = **the SYSTEM's ladder**, ceil(AWA/2) into [5,10,20,50,100,∞] — NOT an Edha rule
 *    any more. R-56 was reversed 2026-09-07 (item 83); the engine writes nothing, the system's own
 *    `prepareSecondaryDerivedData` owns the sheet number, and `edhaSensesRangeFtFromAwa` is only the
 *    token-stamp / wizard-preview copy of the same ladder. Movement is now the ONE stat Edha still
 *    overrides on the sheet.
 *  • HP = the system's per-level accumulation + EDHA_HP_BONUS
 * EDHA_HP_BONUS was `1` until R-54 answered (c) "remove the +1" — **no level gate anywhere**; the
 * math stays a single constant read from ONE place, so the sheet derivation, the clamp repair and
 * the wizard preview all follow it. Do not re-inline it, and do not re-add a level condition.
 * The June pregens that STORE a manual `hea.max.bonus` keep theirs (the srcHeaBonus guard below
 * skips them) until `edha.migrateDerivations()` strips it. */
const EDHA_HP_BONUS = 0;
function edhaWalkRateFtFromSpd(spd) { return 20 + 5 * (Number(spd) || 0); }

/* --- Edha sheet derivations: HP = system + EDHA_HP_BONUS (0 since R-54); Speed = 20 + 5 × SPD.
 * Senses is NOT here any more — the system's ladder owns it (R-56 reversed, item 83) ----------
 * The Edha reference sheets derive MOVEMENT differently from the cosmere system; the
 * pregens carried per-actor hacks (hea.max.bonus:1 / movement override). Now derived for ALL
 * characters:
 *  • HP: +EDHA_HP_BONUS to hea.max.bonus IN MEMORY — skipped while the actor's SOURCE still carries
 *    a manual bonus (legacy pregens), so nothing double-applies until edha.migrateDerivations()
 *    strips them. Followed by the clamp repair — see the comment on it, it is load-bearing.
 *    ⚠ With the constant at 0 (R-54 (c)) this block is a WRITE OF ZERO and the clamp repair below
 *    is inert by construction (`after > before` can never hold). Both are kept, not deleted: they
 *    are the one place the number lives, and the repair is what makes a non-zero bonus REACHABLE
 *    if the constant ever moves again. Do not "simplify" either away.
 *  • Speed: override = 20 + 5×SPD + (current bonus) — keeps AE speed buffs (Walking Ruin) additive.
 *    Skipped while the actor's SOURCE carries its own movement override (legacy pregens).
 *  • Senses: nothing. The system derives it for every actor type; see the ⛔ note in the body.
 */
function edhaDeriveSheetStats(actor) {
  try {
    if (!actor) return;
    // ⛔ NO SENSES WRITE HERE — deliberately. R-56 was reversed 2026-09-07 (Ben, "Cosmere ladder
    // for everyone" → item 83): Senses Range is the SYSTEM's own ladder for every actor type, and
    // `CommonActorDataModel.prepareSecondaryDerivedData` (cosmere-rpg 2.1.0 index.js:8455-8457,
    // reached by BOTH CharacterActorDataModel — which supers into it at :17628 — and
    // AdversaryActorDataModel at :25877) already wrote `senses.range.derived =
    // awarenessToSensesRange(awa)` a moment ago. So the fix is the ABSENCE of a write: the Edha
    // table override that stood here 07-16c → item 55 is gone, and the system's number survives —
    // including the `value + bonus` reading of AWA the Edha copy never had. A hand-set override,
    // and an adversary block's explicit `senses` (which the build writes as exactly that), still
    // win, because they always did — they sit above `.derived` in the DerivedValueField.
    if (actor.type !== "character") return;   // HP and Speed below are PC-only rules (adversary blocks carry overrides)
    // HP = system + EDHA_HP_BONUS (0 since R-54 — the Edha and system tables agree)
    const heaMax = actor.system?.resources?.hea?.max;
    const srcHeaBonus = Number(actor._source?.system?.resources?.hea?.max?.bonus) || 0;
    if (heaMax && srcHeaBonus === 0) {
      const before = Number(heaMax.value) || 0;
      try { heaMax.bonus = (Number(heaMax.bonus) || 0) + EDHA_HP_BONUS; } catch (e) { /* getter-only safety */ }
      // THE CLAMP REPAIR (bench run 21: "Finish leaves the actor at 13/14", reproduced player-side).
      // The system clamps every resource to its max at the END of prepareSecondaryDerivedData —
      // i.e. BEFORE this wrapper adds the bonus. So a stored 14 was cut to 13 on every prepare and
      // the extra point was unreachable by ANY route (long rest, heal, the wizard's top-up): the
      // sheet read 13/14 forever. Same family as the Investiture source-persist gotcha above.
      // Re-run the clamp the system would have run had it seen our max, starting from _source so
      // nothing is invented — only a point the actor genuinely stores is handed back.
      try {
        const res = actor.system?.resources?.hea;
        const after = Number(heaMax.value) || 0;
        const src = Number(actor._source?.system?.resources?.hea?.value);
        if (res && after > before && Number(res.value) === before && Number.isFinite(src) && src > before) {
          res.value = Math.min(src, after);
        }
      } catch (e) { /* non-fatal */ }
    }
    // Speed = 20 + 5 × SPD. Do NOT fold rate.bonus into the override — the DerivedValueField's
    // value getter adds .bonus ON TOP of the override, so folding it in double-counted every
    // speed AE (07-18 bench: Surefooted's +10 displayed as +20). AE buffs stay additive via the
    // getter itself.
    const rate = actor.system?.movement?.walk?.rate;
    const srcRate = actor._source?.system?.movement?.walk?.rate;
    if (rate && !(srcRate?.useOverride)) {
      const spd = Number(actor.system?.attributes?.spd?.value) || 0;
      try { rate.override = edhaWalkRateFtFromSpd(spd); rate.useOverride = true; } catch (e) { /* non-fatal */ }
    }
  } catch (e) { console.error("Edha Content | sheet-stat derivation failed", e); }
}
// One-time migration: strip the pregens' per-actor HP bonus / movement override so the derivations
// above take over (run once from the console as GM: edha.migrateDerivations()).
async function edhaMigrateDerivations() {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: migration is GM-only."); return; }
  let n = 0;
  for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
    const u = {};
    if ((Number(a._source?.system?.resources?.hea?.max?.bonus) || 0) !== 0) u["system.resources.hea.max.bonus"] = 0;
    if (a._source?.system?.movement?.walk?.rate?.useOverride) u["system.movement.walk.rate.useOverride"] = false;
    if (Object.keys(u).length) { try { await a.update(u); n++; } catch (e) { console.warn(`Edha | migration failed on ${a.name}`, e); } }
  }
  ui.notifications?.info(`Edha: derivation migration done — ${n} character(s) updated (HP/Speed now derived).`);
  return n;
}

/* --- Token sight defaults (07-18 bench: new "Test Warrior" had a hidden name + short sight) ------
 * Foundry's blank prototype token (displayName NONE, sight range 0) is wrong for Edha actors: the
 * sight model (07-16c) gives every creature its Senses Range, and a PC's name should read on
 * hover. NEW actors of ANY type get sight enabled in the cosmere "sense" vision mode (attenuation
 * 0.1 — the exact shape the world PCs and the adversary pack builds carry), range = Senses Range
 * from the SYSTEM's ladder (R-56 reversed 2026-09-07, item 83 — one rule for PCs and adversaries;
 * this was the Edha table from 07-18 to item 55/83). New CHARACTERS additionally get displayName HOVER(30); adversaries keep Foundry's
 * default (the pack's OWNER_HOVER(20) is set by the build, and a blank-created adversary should not
 * leak its name to players on hover). Pack-built and imported actors already carry a sight range
 * and are left alone. An updateActor watcher keeps the range in step when AWA changes (prototype +
 * placed tokens, single GM applier, every actor type). `edha.fixPcTokens()` retrofits EXISTING
 * characters and their placed tokens; existing adversaries are re-stamped by the pack sync.
 */
function edhaPcSightShape(actor) {
  // AWA read as value + bonus (edhaAwaForSenses), the way the system's own derivation reads it —
  // otherwise an AE that adds AWA moves the SHEET's Senses Range and leaves the token behind.
  return { enabled: true, range: edhaSensesRangeFtFromAwa(edhaAwaForSenses(actor)), visionMode: "sense", attenuation: 0.1 };
}
Hooks.on("preCreateActor", (doc, data) => {
  try {
    if (data?.prototypeToken?.sight?.range) return; // imported/duplicated/pack-built actors keep their own config
    const proto = { sight: edhaPcSightShape(doc) };
    if (doc.type === "character") proto.displayName = 30;
    doc.updateSource({ prototypeToken: proto });
  } catch (e) { console.error("Edha Content | token sight defaults failed", e); }
});
Hooks.on("updateActor", (actor, changes) => {
  try {
    if (changes?.system?.attributes?.awa === undefined) return;
    if (!edhaDefBuffGmGate()) return; // ONE applier (§10)
    const range = edhaPcSightShape(actor).range;
    void actor.update({ "prototypeToken.sight.range": range });
    for (const sc of game.scenes ?? []) {
      const toks = sc.tokens?.filter?.(t => t.actorId === actor.id) ?? [];
      if (toks.length) void sc.updateEmbeddedDocuments("Token", toks.map(t => ({ _id: t.id, "sight.range": range })));
    }
  } catch (e) { console.error("Edha Content | sight-range sync failed", e); }
});
async function edhaFixPcTokens() {
  if (!game.user?.isGM) { ui.notifications?.warn("Edha: PC token fix is GM-only."); return; }
  let n = 0;
  for (const a of (game.actors?.filter(x => x.type === "character") ?? [])) {
    const sight = edhaPcSightShape(a);
    try { await a.update({ "prototypeToken.displayName": 30, "prototypeToken.sight": sight }); n++; } catch (e) { console.warn(`Edha | token fix failed on ${a.name}`, e); }
    for (const sc of game.scenes ?? []) {
      const toks = sc.tokens?.filter?.(t => t.actorId === a.id) ?? [];
      if (toks.length) { try { await sc.updateEmbeddedDocuments("Token", toks.map(t => ({ _id: t.id, displayName: 30, sight }))); } catch (e) {} }
    }
  }
  ui.notifications?.info(`Edha: PC token defaults applied to ${n} character(s) (+ placed tokens).`);
  return n;
}
Hooks.once("ready", () => {
  const ActorCls = CONFIG.Actor?.documentClass;
  if (!ActorCls?.prototype?.prepareDerivedData) { console.warn("Edha Content | Actor#prepareDerivedData not found — Investiture derivation not wired."); return; }
  if (game.modules.get("lib-wrapper")?.active && globalThis.libWrapper) {
    libWrapper.register("edha-content", "CONFIG.Actor.documentClass.prototype.prepareDerivedData",
      function (wrapped, ...args) { const r = wrapped(...args); edhaDeriveInvestiture(this); edhaDeriveSheetStats(this); return r; }, "WRAPPER");
    console.log("Edha Content | Edha derivations (Investiture, HP+1, Speed) wired via libWrapper.");
  } else {
    const orig = ActorCls.prototype.prepareDerivedData;
    ActorCls.prototype.prepareDerivedData = function (...args) { const r = orig.apply(this, args); edhaDeriveInvestiture(this); edhaDeriveSheetStats(this); return r; };
    console.log("Edha Content | Edha derivations (Investiture, HP+1, Speed) wired via prototype patch.");
  }
  // Refresh already-loaded actors so the new max shows immediately.
  // ⚠️ reset(), NOT prepareData() — this line was the 64 ↔ 57 max-HP flip (bench run 36).
  // A bare `prepareData()` re-runs the prepare pipeline over ALREADY-DERIVED data: DataModel#reset
  // is what re-initialises fields from `_source` (`reset() { this._initialize(); }`, and
  // ClientDocument#_initialize ends in `_safePrepareData()`); prepareData does not reset anything.
  // cosmere-rpg moves `applyActiveEffects()` OUT of prepareEmbeddedDocuments and INTO
  // prepareDerivedData on purpose (so AE changes can read derived values), and ActiveEffect#_applyAdd
  // reads the CURRENT value — so a second bare prepare applies every ADD-mode change a SECOND time.
  // `Bench — White`'s `Hardy - Max HP` (ADD `@level`, 7 at level 7) read `hea.max.bonus` = 8 + 7 + 7
  // = 22 → max **64**, where the correct single application is 8 + 7 = 15 → max **57**. Nothing is
  // persisted, so the actor snapped back to 57 the next time a real update re-initialised it — the
  // "flip", and why there was no residue. It hit EVERY character carrying ANY ADD-mode effect, on
  // EVERY client, at world load; Hardy was only how the bench noticed.
  // Every actor, not just characters (widened at item 55). Kept at that scope after item 83 removed
  // the senses write: the sweep is a re-prepare, and an adversary prepared before this wrapper
  // installed should re-render from the same pipeline everything else runs. Nothing here writes
  // senses any more — the system's own derivation gives every actor the ladder on the next prepare,
  // which is why an existing PC needs only an F5 for the SHEET number. Its stored TOKEN sight.range
  // is persisted data and does NOT move here — `edha.fixPcTokens()` or an AWA edit re-stamps it.
  for (const a of (game.actors ?? [])) { try { a.reset(); a.sheet?.rendered && a.sheet.render(false); } catch (e) {} }
});

/* --- Apply-damage targeting: make the chat Apply buttons follow TARGETS ONLY -------------------
 * History: default 0 (SelectedOnly) broke AoE (Apply ignored targets). We then used 4 (Prioritise
 * Targeted), but its fallback-to-selected meant a player with NO target and their own token selected
 * damaged THEMSELVES (2026-06-11 playtest: Searing Bolt self-hits, all players). Now force
 * 1 (TargetedOnly): no target → Apply does nothing. GM workflow note: target (T) tokens before
 * clicking Apply — selecting them no longer counts. AoE still works (it auto-TARGETS caught tokens). */
Hooks.once("ready", async () => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier — a world setting, not a per-client one
    const cur = game.settings.get("cosmere-rpg", "applyButtonsTo");
    if (cur !== 1) {
      await game.settings.set("cosmere-rpg", "applyButtonsTo", 1);   // Targeted Only — no self-hit fallback
      ui.notifications?.info("Edha: set 'Apply damage/healing to' → Targeted Only (no fallback to your selected token).");
      console.log(`Edha Content | applyButtonsTo ${cur} → 1 (Targeted Only).`);
    }
  } catch (e) { console.warn("Edha Content | could not set applyButtonsTo", e); }
});
async function edhaFixSettings() {
  try { await game.settings.set("cosmere-rpg", "applyButtonsTo", 1); ui.notifications?.info("Edha: 'Apply damage/healing to' = Targeted Only."); }
  catch (e) { ui.notifications?.warn("Edha: couldn't set applyButtonsTo (GM only)."); }
}

// Testing helper: clear an actor's once-per-round trigger locks without advancing a combat round.
async function edhaResetTriggers(actor) {
  actor ??= canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
  if (!actor) { ui.notifications?.warn("Edha: select a token to reset its triggers."); return; }
  try { await actor.unsetFlag("edha-content", "trigRound"); ui.notifications?.info(`Edha: reset once-per-round triggers on ${actor.name}.`); }
  catch (e) { console.error("Edha Content | resetTriggers failed", e); }
}

