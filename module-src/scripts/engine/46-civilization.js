/* ============================================================================================
 * CIVILIZATION (Kethane, deity) tree engine (2026-07-02) — Foundations + the Combat Construct.
 * Colors Red/White; tag prefix "Civilization (Kethane)."; build `foundry-build deity` → pack `edha-deity`.
 * Die colors (Ben R0, 07-02: the split across the two branches is MIXED, so the ambiguous rider goes
 * Red): WHITE backs the body — Construct HP + Slam + Siege Cannon (as authored), Magnum Opus's bonus
 * HP, Lay Foundation's Attunement Range, Bonds of Community's THP (= edhaWhiteMod, the Accord helper);
 * RED backs the offense — Bastion's enter-damage + save DC, Magnum's splash + save DC, and Tempered
 * Edge's rider. Reuses existing primitives wholesale — NO side-engine, NO new sidecar table:
 *   • Foundations    = `edha-zone {kind: foundation}` since 2bV (was the pre-standard 06-12
 *     takeover — KEPT byte-alike: gold Drawings, sustain cap, begin-turn defense buff,
 *     refund-on-cancel; the size/colour/cap are rule fields now).
 *     Its stale edha-aoe-template authored event (dead since the takeover) was REMOVED (Ben R2 — the
 *     Death R6/R7 "old wiring" precedent). Magnum upgrades the buff +1→+2 via `civFoundationBonus`.
 *   • Combat Construct = the PRE-STANDARD authored edha-summon spec (audited vs the card — KEPT
 *     byte-identical, Ben R8, incl. the baked Siege Form effect + Siege Cannon). The engine ADDS the
 *     gates the card demands: sustain ONE = using Forge Construct again REPLACES the live Construct
 *     (Ben R1 — dismantle relay `civ-dismantle`, then the native flow reforges).
 *   • dealer riders  → the applyDamage wrapper pre/post-pass (edhaDealerOf), the Green-Instinct
 *     injection shape; defeat signal → the SHARED live→0 HP stamp (Death's preUpdateActor hook) with
 *     a Civilization-only consumer; foe tests → edhaFoeSkillVsColor (the generalized Destruction
 *     Concussive-Yield helper — owner rolls the color DC, the ENGINE rolls each foe, never
 *     trust-the-player); cross-actor → set-flag / toggle-status / burst-apply / move-token relays.
 * Wired here (no longer GM-eyeballed):
 *   • Lay Foundation — ✅ 2bV, rule-driven use (`edha-zone {kind: foundation}`): the placement flow
 *     is the rule's executor; the takeover hook is gone. White range.
 *   • Forge Construct — FULLY ON ITS DOCUMENT since 07-24y (iron rule 2b). The authored edha-summon
 *     spec had been there for months; what held the talent on the ratchet was the 10-line name-keyed
 *     sustain-ONE replace gate, which is now `sustainCap: "1"` + `replaceOldest` read by the generic
 *     edha-summon pre-cost veto. A classification that names a mechanic already on the document is
 *     pointed at the wrong line — this was the worked example.
 *   • Tempered Edge (passive) — ✅ 2bV (`edha-damage-bonus` {require: summon-hits, whenDealerItem,
 *     addTargetDeflect}; the generic sweep, no bespoke rider): +[T][D red]
 *     energy (edhaEvalSync vs the SUMMONER) + the hit is bumped by the target's deflect (the
 *     Pinpoint-Charge ignore-deflect fact). Siege Cannon (ranged) is deliberately excluded.
 *   • Siege Form — ✅ 2bV, rule-driven use (`edha-summon-effect {mode: toggle-baked}`; H21): gates
 *     pre-cost (live Construct, not already sieged), pays 1 Inv via
 *     activation, toggles the BAKED "Siege Form" effect ON; the card's button ends it (Free, toggle
 *     OFF). The spec itself is untouched (Ben R8).
 *   • Arsenal — ✅ 2bV, rule-driven use (`edha-summon-effect {mode: grant}` + a `summonGrantTemplate`
 *     effect on ITS OWN Effects tab, copied onto the Construct): gates pre-cost; use arms
 *     `arsenalActive` on the Construct + an indicator AE ("2 attacks/turn" — cadence TRUSTED, the
 *     Risen Servant precedent). The kill-chase rides the applyDamage POST-pass: the Construct drops
 *     a character live→0 → whispered prompt ("move up to 15 ft + free Strike" — player-executed).
 *   • Bastion — ✅ 2bV, rule-driven use (`edha-zone {kind: fortify}`; enter damage/type off ITS
 *     damage fields): gates pre-cost (≥1 Foundation), pays 2 Inv; each Foundation gains a
 *     fortified Region (`civ-fortify` relay): NATIVE modifyMovementCost walk×2 (Ben R3: the native
 *     behavior is disposition-BLIND — allies see the ×2 too; the GM compensates allied movement by
 *     hand; a disposition-filtered cost function is named backlog) + the NEW `edha-content.fortified`
 *     enter check (tokenEnter/tokenMoveIn, the Fate-Snare shape): an ENEMY entering takes the baked
 *     [T][D red] impact and rolls Agility vs your Red → Slowed until the start of its next turn
 *     (expiry stamped at the CURRENT turn coord — right whenever it entered on its own move; a
 *     forced-move entry off-turn clears early, card-noted). Foundations laid while Bastion holds
 *     come up fortified (Ben R4). The Construct standing in a fortified Foundation wears a +2
 *     all-defenses AE (updateToken sweep, the Walking-Ruin move-watcher shape).
 *   • Trade Routes — ✅ 2bV, rule-driven use (`edha-zone {kind: link}`): gates pre-cost
 *     (≥2 Foundations), pays 1 Inv, click one Foundation
 *     then the other; the pair is linked (`civ-link` relay stamps the drawings + "⇄"). The card's
 *     Teleport button moves the clicking ally's token to the paired square (edhaMoveTokenTo — owner
 *     writes directly, else the move-token relay; Ben R6). Once per turn TRUSTED (card-noted).
 *   • Bonds of Community (Reaction) — ✅ 2bV (`edha-damage-react {action: rally-zone,
 *     requireVictimInMyZone}`; the H25 sweep + click): ANY non-summon creature (PCs/allies COUNT — Ben R5; Death's
 *     PC-skip was a Death-tree ruling) dropping live→0 inside one of your Foundations → whispered
 *     Reaction prompt; Apply grants every standing ally in any of your Foundations Temp HP = your
 *     White mod (edhaGrantTempHpCross, keeps-higher) + advantage on its next attack test
 *     (edhaGrantAdvAttack, the Green primitive). Reaction economy (one/round) TRUSTED.
 *   • Magnum Opus (capstone) — ENGINE_OWNED: the colossus rewrite (HP max override, defense AE,
 *     splash machine) is a summon-actor mutation, keyed on its `edha-summon-effect {mode: transform}`
 *     rule (2bV — no name in code; every dial is a field): gates pre-cost (live Construct,
 *     once/scene via the generic sceneOnce), pays 3 Inv. The Construct becomes a Colossus: +2×[T][D white] HP (value + max override), +2
 *     all-defenses AE, `colossus` flag; its hits SPLASH the talent's [T][D red] energy to each enemy
 *     within 10 ft of the target — the target INCLUDED (Ben R7a) — each rolling Agility vs your Red
 *     → Prone (applyDamage POST-pass + edhaFoeSkillVsColor). Allies in Foundations get the buff
 *     upgrade +1→+2 for the scene (Ben R7b, `civFoundationBonus`). Reach 10 ft is card-noted (no
 *     system reach field — see backlog).
 * Hooks/tools still to build (engine backlog — named, not dropped):
 *   • A real reach field for the Colossus — no cosmere system support; card-noted manual until then.
 * Hooks/tools since built (were backlog — wired 2026-07-04):
 *   • GM summon relay — Forge Construct now materializes via `summon-actor` for players without
 *     actor-create permission (spec baked owner-side; SHARED, wired in edhaSummon).
 *   • Disposition-filtered movement cost — the enemy-cost EXPERIMENT (a ModifyMovementCost subclass
 *     that returns no effect for the owner's side). No-ship-on-failure terms: registration failure
 *     or a wrong resolver name both degrade to Ben R3's shipped-blind behavior. ⚑ bench go/no-go:
 *     ruler ×2 for an enemy, ×1 for an ally, inside a fortified Foundation.
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Arsenal's extra-attack + free-Strike cadence and Bonds' one-Reaction-per-round (action economy
 *     isn't tracked — trusted, card-noted); Trade Routes' once-per-turn teleport cadence (trusted);
 *     Bastion's difficult terrain for ALLIED NPC movement (GM compensates — Ben R3).
 *   • CONTEST-EXEMPT: none — both tests (Bastion, Magnum Opus) are foe-skill-vs-your-Red, ENGINE-
 *     rolled per foe via edhaFoeSkillVsColor; Trade Routes' teleport is willing movement (no test).
 * ============================================================================================ */

const EDHA_CIV_RED_DIE = "(@tier)d(2 * @skills.red.rank + 2)";
// EDHA_CIV_WHITE_DIE retired 07-26 (orphan sweep): Bonds of Community's THP formula is authored data.
// 2bV: the owner's fortify rule (edha-zone {kind: fortify}) — the enter damage bakes off its item.
function edhaCivFortifyRuleOf(owner) {
  for (const { item, handler } of edhaActorRulesOf(owner, "edha-zone")) {
    if (handler.kind === "fortify") return { item, handler };
  }
  return null;
}
function edhaCivIsConstruct(a) { return !!a?.getFlag?.("edha-content", "summon") && String(a?.name || "").startsWith("Combat Construct"); }
function edhaCivSummonerOf(summon) { const id = summon?.getFlag?.("edha-content", "summoner"); return id ? (game.actors?.get(id) ?? null) : null; }
// Point-in-Foundation (the Drawing square) — the containment math of edhaFoundationAtPoint without the
// disposition filter (Bonds/Trade Routes check ownership + disposition themselves).
function edhaCivPointInFoundation(d, x, y) {
  const w = d.shape?.width ?? 0, h = d.shape?.height ?? 0;
  return x >= d.x && x <= d.x + w && y >= d.y && y <= d.y + h;
}
// edhaCivCard moved onto edhaTreeCard(owner, rolls, html, opts) — Job 4, pass 5.3 (call sites below updated directly).

/* Tempered Edge moved onto its document 2bV (iron rule 2b): an `edha-damage-bonus`
 * {require: summon-hits, whenDealerItem, addTargetDeflect} rule — the generic pre-pass sweep is
 * the only path. Do not re-add a bespoke rider. */

/* --- Colossus splash + armed kill-chase — applyDamage POST-pass on a summon's hits ------------------
 * 2bV: keyed on the summoner's `edha-summon-effect` rules and the `colossus` / `summonArmed`
 * flags — no talent names, and it survives a summon rename (the flag, not the prefix, selects). */
let _edhaCivSplashBusy = false;
function edhaSummonEffectRuleOf(owner, mode, itemId = null) {
  for (const { item, handler: h } of edhaActorRulesOf(owner, "edha-summon-effect")) {
    if ((h.mode || "toggle-baked") !== mode) continue;
    if (itemId && item.id !== itemId) continue;
    return { item, handler: h };
  }
  return itemId ? edhaSummonEffectRuleOf(owner, mode, null) : null;
}
async function edhaCivConstructHitRiders(dealer, target, prevHp) {
  try {
    if (_edhaInTrigger) return;
    const c = dealer?.actor; if (!c?.getFlag?.("edha-content", "summon")) return;
    const owner = edhaCivSummonerOf(c); if (!owner) return;
    // Colossus splash (the transform rule): [radius] ft around the target, target INCLUDED (Ben R7a).
    if (c.getFlag?.("edha-content", "colossus") && !_edhaCivSplashBusy) {
      const dec = edhaSummonEffectRuleOf(owner, "transform");
      const h = dec?.handler;
      const radius = Number(h?.splashRadiusFt) || 0;
      if (dec && radius > 0) {
        const vtok = edhaCasterToken(target);
        if (vtok) {
          const foes = edhaEnemyTokensInCircle(owner, vtok.center.x, vtok.center.y, radius)
            .filter(t => t.actor && (t.actor.system?.resources?.hea?.value ?? 1) > 0);
          if (foes.length) {
            const formula = dec.item.system?.damage?.formula || EDHA_CIV_RED_DIE;
            const dtype = dec.item.system?.damage?.type || "energy";
            const dr = await edhaRollFormula(owner, formula);
            const amt = Math.max(0, Math.floor(dr.total));
            if (amt > 0) {
              _edhaCivSplashBusy = true;
              try {
                const payload = { casterActorUuid: owner.uuid, hits: foes.map(t => ({ actorUuid: t.actor.uuid, amount: amt, type: dtype, heal: false })) };
                if (game.user?.isGM) await edhaApplyBurstResults(payload);
                else game.socket.emit("module.edha-content", { action: "burst-apply", payload });
              } finally { _edhaCivSplashBusy = false; }
              edhaTreeCard(owner, [dr], `<p>🗿 <strong>${dec.item.name}</strong>: the Colossus's blow shakes the ground — <strong>${amt}</strong> ${dtype} to ${foes.map(t => t.name).join(", ")} (within ${radius} ft of ${target.name}).</p>`);
              if (h.splashStatus) {
                const skill = h.splashSaveSkill || "agi";
                await edhaFoeSkillVsColor(owner, foes, { skill,          // 07-27f: the helper localizes — do NOT pass a *.label read
                  color: h.splashSaveColor || "red", sourceName: dec.item.name, icon: "🗿",
                  failText: edhaConditionLabel(h.splashStatus) || h.splashStatus, okText: "stays up",
                  onFail: (t) => edhaToggleStatus(t.actor, h.splashStatus, true) });
              }
            }
          }
        }
      }
    }
    // Armed kill-chase (the grant rule): the summon reduces a character live→0 → whisper the rule's note.
    const armedBy = c.getFlag?.("edha-content", "summonArmed");
    if (armedBy && (Number(prevHp) || 0) > 0 && (Number(target?.system?.resources?.hea?.value) || 0) <= 0) {
      const g = edhaSummonEffectRuleOf(owner, "grant", armedBy);
      if (g?.handler?.onKillNote) edhaTreeCard(owner, null, `<p>⚙️ <strong>${g.item.name}</strong>: ${c.name} reduces ${target.name} to 0 HP — ${g.handler.onKillNote}</p>`, { whisper: true });
    }
  } catch (e) { console.error("Edha Content | Civilization construct riders failed", e); }
}

/* --- Fortify (edha-zone {kind: fortify} — was the Bastion takeover, 2bV) ---------------------------
 * The enter damage + type ride THIS talent's damage fields; the ≥1-Foundation and GM-online gates
 * are pre-cost (the zone-verb veto). `bastionActive` marks "Foundations laid later fortify on
 * placement" (Ben R4) — a flag key, not a name. */
async function edhaZoneFortify(item, h) {
  try {
    const owner = item.actor;
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn("Edha: need an active scene to fortify."); return; }
    const founds = edhaFoundationsOn(scene, owner.id);
    if (!founds.length) { ui.notifications?.warn(`Edha: ${item.name} needs at least one active Foundation.`); return; }   // belt — the veto owns pre-cost
    await owner.setFlag("edha-content", "bastionActive", true);   // Ben R4: Foundations laid later fortify on placement
    const payload = {
      sceneId: scene.id, ownerUuid: owner.uuid, drawingIds: founds.map(d => d.id),
      baked: edhaFoldDieMath(Roll.replaceFormulaData(item.system?.damage?.formula || EDHA_CIV_RED_DIE, owner.getRollData(), { missing: "0" })),
      type: item.system?.damage?.type || "impact", label: item.name,
      disposition: edhaActorSide(owner),   // R-63: prototypeToken is a real answer; a guessed 1 is not
    };
    if (game.user?.isGM) await edhaCivFortifyGM(payload);
    else game.socket.emit("module.edha-content", { action: "civ-fortify", payload });
    edhaTreeCard(owner, null, `<p>⛨ <strong>${item.name}</strong>: ${owner.name}'s Foundations grow teeth — for the scene they are <strong>fortified</strong>: enemies treat them as difficult terrain (ruler shows ×2 for everyone — GM compensates allied movement, Ben R3), an enemy ENTERING takes <strong>${payload.baked}</strong> ${payload.type} and rolls Agility vs your Red or is <strong>Slowed</strong> until the start of its next turn, and your Construct standing inside gains <strong>+2 to all defenses</strong>.${h?.note ? ` <span style="opacity:.8">${h.note}</span>` : ""}</p>`);
  } catch (e) { console.error("Edha Content | zone fortify failed", e); }
}
// GM-side: one fortified Region per Foundation drawing (idempotent per drawing).
async function edhaCivFortifyGM(p) {
  try {
    const scene = game.scenes?.get(p.sceneId); if (!scene) return;
    const owner = await edhaResolveActorRef(p.ownerUuid); if (!owner) return;
    // R-63 (item 10, batch 1): the owner's side is baked by edhaActorSide at the cast site and rides the socket as a number.
    // If it did not resolve, do NOT build the region — a Fortified Foundation that cannot tell sides apart damages everyone who enters.
    const ownerSide = edhaNumOr(p.disposition, null);
    if (ownerSide === null) { ui.notifications?.warn("Edha: could not resolve the Foundation owner's side — not fortifying."); return; }
    for (const id of (p.drawingIds || [])) {
      const d = scene.drawings.get(id);
      if (!d?.getFlag?.("edha-content", "foundation")) continue;
      if ((scene.regions ?? []).some(r => r.getFlag?.("edha-content", "fortified")?.drawingId === id)) continue;
      await scene.createEmbeddedDocuments("Region", [{
        name: `${owner.name} — Fortified Foundation`, color: EDHA_COLOR_HEX.red,
        shapes: [{ type: "rectangle", x: d.x, y: d.y, width: d.shape?.width ?? 0, height: d.shape?.height ?? 0, rotation: 0, hole: false }],
        behaviors: [
          // The enemy-cost EXPERIMENT when it registered (allies pass free); else Ben R3's native
          // disposition-blind cost — allies see ×2 too and the GM compensates by hand.
          _edhaEnemyCostRegistered
            ? { type: "edha-content.enemy-cost", name: "Difficult Terrain (enemies only)", system: { difficulties: { walk: 2 }, ownerDisposition: ownerSide } }
            : { type: "modifyMovementCost", name: "Difficult Terrain (enemies — Ben R3)", system: { difficulties: { walk: 2 } } },
          { type: "edha-content.fortified", name: "Fortified (enter)", system: { ownerUuid: p.ownerUuid, disposition: ownerSide, damageFormula: p.baked, damageType: p.type || "impact", sourceLabel: p.label || "" } },
        ],
        flags: { "edha-content": { scope: "scene", fortified: { ownerUuid: p.ownerUuid, drawingId: id, disposition: ownerSide } } },
      }]);
      try { await d.update({ text: "⛨ Foundation (fortified)", strokeColor: EDHA_COLOR_HEX.red }); } catch (e) {}
    }
    await edhaCivBastionSweep(scene);
  } catch (e) { console.error("Edha Content | fortify failed", e); }
}
// The Construct standing in a fortified Foundation of its summoner wears +2 to all defenses.
async function edhaCivBastionSweep(scene) {
  try {
    scene = scene ?? canvas?.scene; if (!scene) return;
    for (const tokDoc of (scene.tokens ?? [])) {
      const a = tokDoc.actor; if (!a || !edhaCivIsConstruct(a)) continue;
      const owner = edhaCivSummonerOf(a); if (!owner) continue;
      const gs = scene.grid?.size || 100;
      const cx = tokDoc.x + (tokDoc.width ?? 1) * gs / 2, cy = tokDoc.y + (tokDoc.height ?? 1) * gs / 2;
      const inside = (scene.regions ?? []).some(r =>
        r.getFlag?.("edha-content", "fortified")?.ownerUuid === owner.uuid && edhaPointInRegion(r, cx, cy));
      const existing = a.effects?.filter(e => e.getFlag?.("edha-content", "civBastionBuff")) ?? [];
      if (inside && !existing.length) {
        await a.createEmbeddedDocuments("ActiveEffect", [{
          name: "Bastion (+2 defenses)", img: "icons/magic/defensive/shield-barrier-blue.webp",
          changes: ["phy", "cog", "spi"].map(k => ({ key: `system.defenses.${k}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "2", priority: 20 })),
          description: "<p>Standing in a fortified Foundation: +2 to all defenses (auto-applied while inside).</p>",
          flags: { "edha-content": { civBastionBuff: true } },
        }]);
      } else if (!inside && existing.length) {
        await a.deleteEmbeddedDocuments("ActiveEffect", existing.map(e => e.id));
      }
    }
  } catch (e) { console.error("Edha Content | Bastion sweep failed", e); }
}
Hooks.on("updateToken", (tokenDoc, changed) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (changed?.x === undefined && changed?.y === undefined) return;
    if (!edhaCivIsConstruct(tokenDoc?.actor)) return;
    void edhaCivBastionSweep(tokenDoc.parent);
  } catch (e) { console.error("Edha Content | Bastion move-watch failed", e); }
});
// The enter check (the Fate-Snare shape): an ENEMY of the Foundation's owner entering (or passing
// through) takes the baked [T][D red] impact and rolls Agility vs the owner's Red → Slowed until the
// start of its next turn. tokenEnter + tokenMoveIn can double-fire on one entry → 1 s debounce.
const _edhaCivEnterGuard = new Map();
class EdhaCivFortifiedRegionBehavior extends foundry.data.regionBehaviors.RegionBehaviorType {
  static defineSchema() {
    const FF = foundry.data.fields;
    return {
      events: this._createEventsField({ events: ["tokenEnter", "tokenMoveIn"], initial: ["tokenEnter", "tokenMoveIn"] }),
      ownerUuid: new FF.StringField({ required: true, initial: "", label: "Foundation owner UUID" }),
      disposition: new FF.NumberField({ required: true, initial: 1, label: "Owner disposition (allies pass free)" }),
      damageFormula: new FF.StringField({ required: true, initial: "1d6", label: "Baked enter damage" }),
      damageType: new FF.StringField({ required: true, initial: "impact", label: "Damage type" }),
      sourceLabel: new FF.StringField({ required: false, initial: "", label: "Named on the save card as", hint: "Baked from the fortifying talent's name (2bV). Blank = 'Fortified Foundation'." }),
    };
  }
  async _handleRegionEvent(event) {
    try {
      if (!edhaNoOtherActiveGM()) return;   // one applier — the PRIMITIVE half on purpose (no isGM: a GM-less table still springs it)
      const tokDoc = event?.data?.token; const actor = tokDoc?.actor; if (!actor) return;
      if ((actor.system?.resources?.hea?.value ?? 1) <= 0) return;
      if (!edhaSideHostile(tokDoc.disposition, this.disposition)) return;   // ENEMIES of the owner only; an unresolvable side on either end fails CLOSED (R-63) and passes free rather than eating the baked damage
      const key = `${this.parent?.id ?? "r"}:${tokDoc.id}`;
      const now = Date.now();
      if (now - (_edhaCivEnterGuard.get(key) || 0) < 1000) return;       // tokenEnter + tokenMoveIn double-fire
      _edhaCivEnterGuard.set(key, now);
      const owner = await edhaResolveActorRef(this.ownerUuid); if (!owner) return;
      const dr = await new Roll(this.damageFormula || "0").evaluate();
      const amt = Math.max(0, Math.floor(dr.total));
      if (amt > 0) {
        _edhaInTrigger = true;
        try { await actor.applyDamage([{ amount: amt, type: this.damageType || "impact" }], { chatMessage: false }); }
        finally { _edhaInTrigger = false; }
      }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), rolls: [dr],
        content: `<p>⛨ <strong>${actor.name}</strong> enters ${owner.name}'s fortified Foundation — takes <strong>${amt}</strong> ${this.damageType || "impact"}.</p>` });
      const tok = tokDoc.object;
      /* 07-27f: `label: "Agility"` was hardcoded here — the one save card that read correctly on
       * bench run 7, which is what made the raw-key family look like a one-talent bug. */
      if (tok) await edhaFoeSkillVsColor(owner, [tok], { skill: "agi", color: "red", sourceName: this.sourceLabel || "Fortified Foundation",
        failText: edhaConditionLabel("slowed"), okText: "keeps pace", icon: "⛨",
        onFail: async (t) => {
          await edhaToggleStatus(t.actor, "slowed", true);
          // "until the start of its next turn": stamp the CURRENT coord — the expiry pass clears it when
          // the pointer advances past this turn (right whenever it entered on its own move; a forced-move
          // entry off-turn clears early — card-noted).
          const combat = edhaInActiveCombat(t.actor);   // R-4/#28a: the SLOWED creature's own combat
          if (combat?.started) {
            const eff = [...(t.actor.effects ?? [])].find(e => e.statuses?.has?.("slowed"));
            if (eff) { try { await eff.setFlag("edha-content", "expireAfter", { round: combat.round, turn: combat.turn }); } catch (e) {} }
          }
        } });
    } catch (e) { console.error("Edha Content | fortified enter check failed", e); }
  }
}

/* --- EXPERIMENT (backlog 9b — Ben-approved timebox, 2026-07-04): disposition-filtered movement cost.
 * Goal: Bastion's fortified Foundations read ×2 walk cost for ENEMIES only (Ben R3 shipped the
 * native modifyMovementCost blind — the GM compensates allied movement by hand). Approach: subclass
 * the NATIVE type and return no terrain effect for tokens on the owner's side. The v13 terrain
 * pipeline could NOT be verified from this session (no Foundry), so the experiment ships
 * belt-and-braces on the no-ship-on-failure terms:
 *   • registration is try/caught and edhaCivFortifyGM uses the custom type ONLY if it registered —
 *     any throw leaves the shipped-blind R3 behavior byte-identical;
 *   • the subclass overrides BOTH plausible effect-resolver names; if neither is the real one, the
 *     inherited native behavior applies to everyone — i.e. exactly today's R3 state, never worse.
 * ⚑ bench (the go/no-go): ruler over a fortified Foundation shows ×2 for an enemy token and ×1 for
 * an allied token. If allies still read ×2, DELETE this block + the enemy-cost branch in
 * edhaCivFortifyGM and the R3 fallback stands (it never left). ------------------------------------ */
let _edhaEnemyCostRegistered = false;
function edhaBuildEnemyCostBehavior() {
  const Base = foundry.data?.regionBehaviors?.ModifyMovementCostRegionBehaviorType;
  if (!Base) return null;
  class EdhaEnemyCostRegionBehavior extends Base {
    static defineSchema() {
      const FF = foundry.data.fields;
      return { ...super.defineSchema(), ownerDisposition: new FF.NumberField({ required: false, initial: 1, label: "Owner disposition (that side passes free)" }) };
    }
    _edhaAllied(token) {
      try { const doc = token?.document ?? token; return (doc?.disposition ?? null) === (Number(this.ownerDisposition) ?? 1); }
      catch (e) { return false; }
    }
    // v13 terrain pipeline — the resolver name is bench-unverified, so cover both candidates; each
    // passes enemies through to the native cost and returns "no effect" for the owner's side.
    _getTerrainEffects(token, ...args) {
      if (this._edhaAllied(token)) return [];
      return super._getTerrainEffects?.(token, ...args) ?? [];
    }
    getTerrainEffects(token, ...args) {
      if (this._edhaAllied(token)) return [];
      return super.getTerrainEffects?.(token, ...args) ?? [];
    }
  }
  return EdhaEnemyCostRegionBehavior;
}

/* --- Link (edha-zone {kind: link} — was the Trade Routes takeover, 2bV) ----------------------------
 * The two-click picker + teleport button stay ENGINE-OWNED (multi-click canvas — the H6 trade);
 * gates are pre-cost (the zone-verb veto) and every cancel path refunds, as it always did. */
async function edhaZoneLink(item, h) {
  try {
    const owner = item.actor;
    const scene = canvas?.scene; if (!scene) { ui.notifications?.warn(`Edha: need an active scene for ${item.name}.`); return; }
    const pick = async (label) => {
      const pt = await edhaPickPoint(`Click inside the ${label} Foundation to link (right-click to cancel).`);
      if (!pt) return null;
      return edhaFoundationsOn(scene, owner.id).find(d => edhaCivPointInFoundation(d, pt.x, pt.y)) ?? false;
    };
    const a = await pick("FIRST");
    if (a === null) { edhaRefundCost(item); ui.notifications?.info(`${item.name} cancelled — Investiture refunded.`); return; }
    if (a === false) { edhaRefundCost(item); ui.notifications?.warn("Edha: that point is not inside one of your Foundations. Refunded."); return; }
    const b = await pick("SECOND");
    if (b === null) { edhaRefundCost(item); ui.notifications?.info("Trade Routes cancelled — Investiture refunded."); return; }
    if (b === false || b.id === a.id) { edhaRefundCost(item); ui.notifications?.warn("Edha: pick a DIFFERENT Foundation of yours for the second end. Refunded."); return; }
    const linkId = foundry.utils.randomID();
    const payload = { sceneId: scene.id, drawingIds: [a.id, b.id], linkId };
    if (game.user?.isGM) await edhaCivLinkGM(payload);
    else game.socket.emit("module.edha-content", { action: "civ-link", payload });
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-burst-card"><p>🛤️ <strong>${item.name}</strong>: two of ${owner.name}'s Foundations are <strong>linked</strong> for the scene — an ally standing in either may teleport to the other as a Free Action, <strong>once per turn</strong> (trusted).${h?.note ? ` <span style="opacity:.8">${h.note}</span>` : ""}</p>`
        + `<button type="button" class="edha-civ-btn" data-edha-action="teleport" data-edha-link="${linkId}" data-edha-scene="${scene.id}">Teleport (stand in a linked Foundation, then click)</button></div>`,
    });
  } catch (e) { console.error("Edha Content | zone link failed", e); }
}
async function edhaCivLinkGM(p) {
  try {
    const scene = game.scenes?.get(p.sceneId); if (!scene) return;
    for (const id of (p.drawingIds || [])) {
      const d = scene.drawings.get(id); if (!d?.getFlag?.("edha-content", "foundation")) continue;
      const text = String(d.text || "Foundation");
      await d.update({ "flags.edha-content.foundation.link": p.linkId, text: text.includes("⇄") ? text : `${text} ⇄` });
    }
  } catch (e) { console.error("Edha Content | foundation link failed", e); }
}
async function edhaCivTeleportClick(ev) {
  try {
    const btn = ev.currentTarget;
    const linkId = btn.dataset.edhaLink, sceneId = btn.dataset.edhaScene;
    if (canvas?.scene?.id !== sceneId) { ui.notifications?.warn("Edha: view the linked Foundations' scene first."); return; }
    const scene = canvas.scene;
    const pair = (scene.drawings ?? []).filter(d => d.getFlag?.("edha-content", "foundation")?.link === linkId);
    if (pair.length !== 2) { ui.notifications?.warn("Edha: that trade route no longer stands (a Foundation crumbled)."); return; }
    const tok = canvas.tokens?.controlled?.[0] ?? (game.user?.character ? edhaCasterToken(game.user.character) : null);
    if (!tok?.actor) { ui.notifications?.warn("Edha: select your token first."); return; }
    if ((tok.actor.system?.resources?.hea?.value ?? 1) <= 0) { ui.notifications?.warn("Edha: the fallen don't walk the roads."); return; }
    const from = pair.find(d => edhaCivPointInFoundation(d, tok.center.x, tok.center.y));
    if (!from) { ui.notifications?.warn("Edha: stand inside one of the linked Foundations first."); return; }
    const disp = from.getFlag("edha-content", "foundation")?.disposition;
    if (disp !== undefined && !edhaSideSame(tok.document?.disposition, disp)) { ui.notifications?.warn("Edha: the linked roads carry allies only."); return; }   // `disp !== undefined` stays: an ABSENT authored field means "no restriction" (ENGINE_INDEX's table). The traveller's own unresolvable side is the failed lookup, and now fails CLOSED.
    const dest = pair.find(d => d.id !== from.id);
    // Ben (pass 3, 07-12): a teleport, not a walk — the traveler CLICKS their arrival point inside the
    // destination Foundation, the token is displaced there (no pathing, no wall snag, no stacking).
    const center = { x: dest.x + (dest.shape?.width ?? 0) / 2, y: dest.y + (dest.shape?.height ?? 0) / 2 };
    let arrive = await edhaPickPoint("Click your arrival point inside the linked Foundation (right-click for its center).");
    if (arrive && !edhaCivPointInFoundation(dest, arrive.x, arrive.y)) { ui.notifications?.warn("Edha: that point is outside the linked Foundation — arriving at its center instead."); arrive = null; }
    arrive ??= center;
    if (edhaTokenAtDest(tok, arrive)) { ui.notifications?.warn("Edha: that square is occupied — pick a clear square."); return; }
    await edhaMoveTokenTo(tok, arrive, { teleport: true });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: tok.actor }),
      content: `<p>🛤️ <strong>${tok.actor.name}</strong> steps through the trade route to the linked Foundation (Free Action — once per turn, trusted).</p>` });
  } catch (e) { edhaClickFailed("trade-route teleport", e); }
}

/* Bonds of Community moved onto its document 2bV (iron rule 2b): an `edha-damage-react`
 * {when: dropped-to-0, action: rally-zone, requireVictimInMyZone} rule — the H25 sweep + click own
 * the prompt and the grant. Do not re-add the bespoke watcher. ⚑ One narrowing, benched: the
 * trigger now rides the applyDamage watcher, so a MANUAL HP edit to 0 no longer prompts. */

/* --- Summon-mode executors (edha-summon-effect, 2bV — were the Siege Form / Arsenal / Magnum Opus
 * takeovers). All gates are pre-cost (the summon-effect veto); the summon is resolved by the
 * generic executor via edhaOwnedSummons and passed in — keyed on the rule's own `summonTalent`
 * field (blank = any of the owner's `summonName` summons), never on the consuming talent's own
 * name, which is what broke all three of them until 07-27f. -------------------------------------- */
async function edhaCivToggleBakedEffect(item, h, c) {
  try {
    const eff = c.effects?.find(e => e.getFlag?.("edha-content", "summonEffect") && e.name === h.effectName);
    if (!eff || !eff.disabled) return;   // belt — the veto owns pre-cost
    await eff.update({ disabled: false });
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: item.actor }),
      content: `<div class="edha-burst-card"><p>🏰 <strong>${item.name}</strong>: ${h.effectName} is active on ${c.name} for the scene.${h.note ? ` <span style="opacity:.8">${h.note}</span>` : ""}</p>`
        + (h.endButtonLabel ? `<button type="button" class="edha-civ-btn" data-edha-action="summon-effect-end" data-edha-construct="${c.uuid}" data-edha-effect="${h.effectName}">${h.endButtonLabel}</button>` : "") + `</div>`,
    });
  } catch (e) { console.error("Edha Content | summon effect toggle failed", e); }
}
async function edhaCivSummonEffectEndClick(ev) {
  try {
    const btn = ev.currentTarget;
    const c = await edhaResolveActorRef(btn.dataset.edhaConstruct);
    if (!c) { ui.notifications?.warn("Edha: that summon is gone."); return; }
    if (!c.isOwner) { ui.notifications?.warn("Edha: only the summon's owner (or the GM) ends this."); return; }
    const eff = c.effects?.find(e => e.getFlag?.("edha-content", "summonEffect") && e.name === btn.dataset.edhaEffect);
    if (!eff || eff.disabled) { ui.notifications?.info("Edha: that effect is not active."); return; }
    await eff.update({ disabled: true });
    btn.disabled = true;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: c }), content: `<p>🏰 <strong>${c.name}</strong> ends ${btn.dataset.edhaEffect} (Free Action).</p>` });
  } catch (e) { edhaClickFailed("summon effect end", e); }
}

async function edhaCivTransformSummon(item, h, c) {
  try {
    const owner = item.actor;
    if (h.oncePerScene !== false) await edhaStampSceneOnce(owner, item);
    if (Number(h.zoneBuffUpgrade) > 0) await owner.setFlag("edha-content", "civFoundationBonus", Number(h.zoneBuffUpgrade));   // Ben R7b
    let bonusHp = 0, dr = null;
    if (h.hpBonusFormula) {
      dr = await edhaRollFormula(owner, h.hpBonusFormula);
      bonusHp = Math.max(0, Math.floor(dr.total));
    }
    const hea = c.system?.resources?.hea;
    const curMax = Number(hea?.max?.value ?? hea?.max?.override) || 0;
    if (bonusHp > 0) await edhaResourceWrite(c, "hea", {
      "max.override": curMax + bonusHp, "max.useOverride": true,
      value: (Number(hea?.value) || 0) + bonusHp,
    }, edhaBookkeepingTag(`${item.name} (Colossus max-HP override)`));
    await c.setFlag("edha-content", "colossus", true);
    if (Number(h.defBonus) > 0) await c.createEmbeddedDocuments("ActiveEffect", [{
      name: `Colossus (${item.name})`, img: "icons/creatures/magical/construct-golem-stone-blue.webp",
      changes: ["phy", "cog", "spi"].map(k => ({ key: `system.defenses.${k}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(h.defBonus), priority: 20 })),
      description: `<p>Colossus for the scene: +${h.defBonus} to all defenses; <strong>reach 10 ft</strong> (manual — no system reach field); its attacks splash this talent's damage formula to each enemy within ${Number(h.splashRadiusFt) || 0} ft of the target, who roll ${edhaSkillLabel(h.splashSaveSkill || "agi")} vs the summoner's ${h.splashSaveColor || "red"} or gain ${edhaConditionLabel(h.splashStatus || "prone")} (engine-rolled).</p>`,
      flags: { "edha-content": { civColossus: true } },
    }]);
    edhaTreeCard(owner, dr ? [dr] : null, `<p>🗿 <strong>${item.name}</strong>: ${c.name} transforms into a <strong>Colossus</strong> — +<strong>${bonusHp}</strong> HP, +${Number(h.defBonus) || 0} to all defenses, reach 10 ft (manual), splashing attacks (engine-rolled).${Number(h.zoneBuffUpgrade) > 0 ? ` Allies in your Foundations now gain <strong>+${h.zoneBuffUpgrade}</strong> to all defenses at their turn start (upgraded for the scene).` : ""}${h.note ? ` <span style="opacity:.8">${h.note}</span>` : ""} <span style="opacity:.8">(Once per scene.)</span></p>`);
  } catch (e) { console.error("Edha Content | summon transform failed", e); }
}

async function edhaCivGrantSummonEffect(item, h, c) {
  try {
    const owner = item.actor;
    await c.setFlag("edha-content", "summonArmed", item.id);
    /* The indicator AE comes from THIS talent's Effects tab (transfer: false, flagged
     * `summonGrantTemplate`) — the covBuffTemplate precedent, so Ben edits it in Foundry. */
    const tpl = (item.effects ?? []).find(e => e.getFlag?.("edha-content", "summonGrantTemplate"));
    if (tpl && !c.effects?.some(e => e.getFlag?.("edha-content", "summonGranted"))) {
      await c.createEmbeddedDocuments("ActiveEffect", [{
        name: tpl.name, img: tpl.img, changes: (tpl.changes ?? []).map(x => ({ key: x.key, mode: x.mode, value: x.value })),
        description: tpl.description, transfer: false,
        flags: { "edha-content": { summonGranted: item.id } },
      }]);
    }
    edhaTreeCard(owner, null, `<p>⚙️ <strong>${item.name}</strong>: ${c.name} is armed for the scene.${h.note ? ` <span style="opacity:.8">${h.note}</span>` : ""}</p>`);
  } catch (e) { console.error("Edha Content | summon grant failed", e); }
}

/* --- Summon dismissal (GM side) — generic despite the name: it deletes ANY actor flagged `summon`.
 * Reached from the socket relay and from the generic edha-summon sustain-cap veto. ------------------ */
async function edhaCivDismantleGM(actorId) {
  try {
    const a = game.actors?.get(actorId); if (!a?.getFlag?.("edha-content", "summon")) return;
    await edhaDeleteActorWithTokens(a);   // token-FIRST; the last-token cleanup owns the actor delete
  } catch (e) { console.error("Edha Content | dismantle failed", e); }
}

/* The Civilization takeover Set is GONE (2bV). Every use flows through the system: costs paid
 * natively, gates vetoed pre-cost (the zone-verb + summon-effect vetoes), and every picker cancel
 * refunds. Forge Construct's sustain-ONE reforge has been authored data since 07-24y. Do not
 * re-add a takeover — a name in a cancel Set silently inert-s every authored rule on the talent. */

/* --- Chat buttons + player→GM relays ----------------------------------------------------------------- */
// Button binding: EDHA_CARD_BUTTONS["edha-civ-btn"] (Job 1, pass 5.3, end of file — one class,
// dispatched by data-edha-action to edhaCivTeleportClick / edhaCivSummonEffectEndClick).
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      try {
        if (!edhaDefBuffGmGate()) return;
        if (data?.action === "civ-fortify") { await edhaCivFortifyGM(data.payload || {}); return; }
        if (data?.action === "civ-link") { await edhaCivLinkGM(data.payload || {}); return; }
        if (data?.action === "civ-dismantle") { await edhaCivDismantleGM(data.payload?.actorId); return; }
      } catch (e) { console.error("Edha Content | Civilization relay failed", e); }
    });
  } catch (e) {}
});

/* --- Scene cleanup (deleteCombat): the Civilization scene state resets ------------------------------- */
// R-60: both populations (characters-only for the PC flags, actors-flagged-"summon" for the
// Construct flags/effects) widen to edhaSceneReset's wide dedup. The PC flags are harmless to
// attempt-unset universally (a summon never carries them); the summon-specific flags/effects stay
// gated INSIDE extra on the "summon" flag so a non-summon actor's document is never touched for
// keys it was never going to have — flag-keyed, not name-prefix-keyed (2bV): any summon qualifies.
async function edhaClearCivState(endedCombat) {
  await edhaSceneReset(endedCombat, {
    key: "civ",
    flags: ["bastionActive", "magnumUsed", "civFoundationBonus"],
    extra: async (a) => {
      if (!a.getFlag?.("edha-content", "summon")) return;
      for (const key of ["arsenalActive", "summonArmed", "colossus"]) {   // arsenalActive = legacy pre-2bV state
        try { await a.unsetFlag("edha-content", key); } catch (e) {}
      }
      const fx = a.effects?.filter(e => e.getFlag?.("edha-content", "civBastionBuff") || e.getFlag?.("edha-content", "civArsenal") || e.getFlag?.("edha-content", "civColossus") || e.getFlag?.("edha-content", "summonGranted")) ?? [];
      if (fx.length) { try { await a.deleteEmbeddedDocuments("ActiveEffect", fx.map(e => e.id)); } catch (e) {} }
    },
  });
  // Fortified Regions + Foundation links ride the Drawings and follow the terrain convention
  // (persist until the GM clears the map) — deleting a Foundation drawing takes its Region along.
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

