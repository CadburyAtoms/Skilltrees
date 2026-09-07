/* ============================================================================================
 * FATE (Olvarra, deity) tree engine (2026-06-18; iron rule 2b pass 2bX 2026-07-25) — the
 * "Ordained Ground + Snare" zone lifecycle. Colors Green/White; tag prefix "Fate (Olvarra).";
 * build `foundry-build deity` → pack `edha-deity`. 2bX authored rules onto every talent, so the
 * tree now needs a PACK REBUILD + ⟳ Sync. Infra (all generic):
 *   • placed markers → the lists.ordained + lists.snares H3 ledgers (cap = tier; oldest
 *     fizzles), click-placed via edhaPickPoint + a MeasuredTemplate; cleared at scene/combat end
 *     (deleteCombat).
 *   • damage writes  → edhaApplyBurstResults (+ GM socket relay), the proven burst pipeline.
 *   • Snare trigger  → a v13 Region (edha-content.fate-snare behavior) on tokenEnter + tokenMoveIn, so
 *     a foe that PASSES THROUGH the square springs it, not just one that stops; reuses the hazard-Region
 *     machinery (GM-applier gated, player→GM relay to arm/drop it). The green template stays the visual.
 *   • Restrained / the annotate rider's fail status → edhaApplyTimedStatus (auto-expiry,
 *     owner-relative for Restrained / target-relative for the rider), the leyline timed-status pass.
 *   • the annotate rider's opposed test → engine ROLLS the owner's colour DC and ROLLS the foe's
 *     skill (edhaRollOpposedSkill) — the edhaSpeedVsRedProne pattern, NOT a "trust the player" card.
 *   • marks → flags.edha-content.markedBy.<markKey> (the Diagnosed/Omen marked pattern); the bonus
 *     rides the applyDamage PRE-pass when the marked foe takes damage near your zones (no
 *     recursion — it adds to the in-progress single apply, like Pack Pressure).
 *   • turn-start buff→ combatTurnChange: an ally beginning its turn on a legacy marker square gets
 *     +1 all defenses (a self-cleaning flagged AE); the THP upgrade rides the owner's
 *     edha-zone-guard rule (edhaGrantTempHpCross). Action-grants (Aid-at-range, free Strike,
 *     Reactive Strike) post a PROMPT CARD naming who may act — the action itself is taken by hand.
 * MODEL (Ben, 06-18): Attunement Range = EDHA_ATTUNE_FT[Green rank] (zones are Green-placed).
 *
 * ALL NINE TALENTS ARE ON THEIR DOCUMENTS since pass 2bX (07-25). The `EDHA_FATE_TALENTS`
 * takeover set and the seven per-talent use functions are DELETED; the system charges every
 * activation cost, gates are pre-cost vetoes, and every picker cancel REFUNDS (the pass-V/W
 * standard). Behaviour is authored rules in deity-fate.json:
 *   • Ordained Ground / Snare — `edha-zone {kind: ordained / snare}`: click-place a 5 ft marker
 *     square (cap/evict/colour off the rule; a snare's damage formula/type off ITS document).
 *     Snares auto-spring on an enemy entering OR passing through, then are consumed.
 *   • Inevitable Snare — H3 `edha-owner-list {op: annotate}` on the `snares` ledger (the
 *     Sealed-Edict/Pinpoint shape): flags the last un-flagged snare, stamps sourceItemUuid, and
 *     the spring resolver reads the +[T][D] rider off THIS document's damage formula and the
 *     Speed-vs-Green contest off riderSkill/riderColor/riderFailStatus (engine-rolled).
 *   • Bulwark Ground — `edha-zone-guard` (config): thpFormula rides the turn-start pass;
 *     noAdvantage is the DEFENDER-keyed pre-roll injector (the inverse of edha-unseen-ward).
 *   • Hexmark — `edha-snare-react {mode: offer-mark}` (config): the spring sweep posts the offer,
 *     the click writes markedBy.<markKey>, and the applyDamage PRE-pass reads the same rule for
 *     the +tier-keen-near-your-zones rider (edhaMarkedNearZonesBonus).
 *   • Weave the Thread — `edha-zone {kind: link-markers}` (the player PICKS the two squares —
 *     card-is-spec, §9m q11) + `edha-snare-react {mode: prompt, requireLinked}`: the `linked`
 *     annotation finally has a reader (the 30 ft Reactive-Strike prompt on a nearby spring).
 *   • Read the Threads / Foreknown Strike / Thread of Inevitability — `edha-marker-command`
 *     {mode: move / spring-pick / spring-all}, see ENGINE_OWNED below.
 * LEDGERS (§9m q7 — ONE per session): `snares` REPOINTED onto H3 storage (lists.snares) in 2bX;
 *   `ordained` REPOINTED in 2bAA — the SIXTH and LAST ledger, the one that closes the migration.
 *   Both are now flags.edha-content.lists.<key> behind their one-line accessors; there is no flat
 *   `fateOrdained` key any more (the scene cleanup still unsets it as deployed residue).
 * ENGINE_OWNED (declared, rule-keyed — the edha-decree exit shape; each talent's rule is its cue):
 *   • edha-marker-command flows — multi-step card/picker/canvas flows (spring buttons, the
 *     declared-event resolve, the ≤10 ft slide) no rule chain expresses; every dial a field.
 *   • edha-zone kinds ordained/snare/link-markers — the click-place picker, MeasuredTemplate,
 *     trigger Region + GM relays, and the two-square link dialog (§9o: canvas work stays engine).
 * Truly manual (genuine table narrative — declared, not dropped):
 *   • Read the Threads foresight — "learn its intended action/movement": an NPC's intent is not data
 *     anywhere in Foundry, so no hook can ever exist (RECLASSIFIED from backlog → manual, Ben-approved
 *     2026-07-03c); the success posts a card and the GM reveals it.
 *   • Weave the Thread / Thread of Inevitability free Reactive Strike & Strike/Aid grants, Ordained's
 *     Aid-at-range — Foundry has no hook to force another creature's action; each posts a prompt card.
 *   • Thread of Inevitability's "declared event" — a table call; the resolution button springs the zones.
 *   • CONTEST-EXEMPT: none — the only opposed SKILL test (Inevitable Snare's Speed vs your Green) is
 *     engine-rolled via edhaRollOpposedSkill; every other effect is auto-on-trigger or a turn-start buff.
 * ============================================================================================ */

const EDHA_FATE_GREEN_DIE = "(@tier)d(2 * @skills.green.rank + 2)";       // [Tier][Die] on the Green track
const EDHA_FATE_SNARE_DMG = `${EDHA_FATE_GREEN_DIE} + @attr.awa`;         // Snare default: [T][D] + Awareness keen

function edhaFateGridHalfPx() { const s = canvas?.scene; return (s?.grid?.size || 100) / 2; }
function edhaTokenDocCenter(tok) {
  const c = tok?.object?.center; if (c && c.x != null) return { x: c.x, y: c.y };
  const gs = canvas?.scene?.grid?.size || 100;
  return { x: (tok?.x ?? 0) + ((tok?.width ?? 1) * gs) / 2, y: (tok?.y ?? 0) + ((tok?.height ?? 1) * gs) / 2 };
}
function edhaSameSquare(cx, cy, sq) { return Math.hypot(cx - (sq?.x ?? 0), cy - (sq?.y ?? 0)) < edhaFateGridHalfPx(); }

/* `ordained` REPOINTED onto H3 storage (flags.edha-content.lists.ordained) in 2bAA — the SIXTH
 * and LAST ledger, and the one that closes the rule-2b migration. Same three properties as
 * `snares` just below and `charges` one tree over: entries are POINT-BOUND — no uuid and NO
 * marker status — so H3's mark-wins reconcile fails OPEN on every entry and keeps it (the 2bV
 * covenants convention; there is nothing to pass, and that is correct, not a gap). The scene
 * filter is H3's sceneScoped shape (every entry carries sceneId). The `linked` annotation
 * edhaZoneLinkMarkers writes and edhaLinkedSquareNear reads rides the ENTRY, so it survives the
 * repoint untouched (pinned in tests/). Writes go through edhaSetOwnerList("ordained", …) at
 * each site — [] is a fine stored value (the old unset-when-empty quirk is dropped on purpose:
 * nothing read the unset state and there are NO freebie semantics here). Canvas objects (the
 * white MeasuredTemplate) stay with the placement handler per §9o — the cleanup path is a
 * raw-path hand-edit onto lists.ordained (§9o trap 3). Every reader — Weave's two-square veto,
 * the zone-guard, the turn-start buff sweep — goes through this accessor and follows for free.
 * The legacy edhaGetFateList / edhaSetFateList pair is DELETED with the last flat key. */
const edhaGetOrdained = (o) => edhaOwnerList(o, "ordained");
/* `snares` REPOINTED onto H3 storage (flags.edha-content.lists.snares) in 2bX. Entries are
 * POINT-BOUND — no uuid and NO marker status — so H3's mark-wins reconcile fails OPEN on every
 * entry and keeps it (the 2bV covenants convention; there is nothing to pass, and that is
 * correct, not a gap). The scene filter is H3's sceneScoped shape (every entry carries sceneId).
 * Writes go through edhaSetOwnerList("snares", …) at each site — [] is a fine stored value (the
 * old unset-when-empty quirk is dropped on purpose; there are NO freebie semantics here). Canvas
 * objects (green MeasuredTemplate + trigger Region) stay with the placement/spring handlers per
 * §9o — every cleanup path below is a raw-path hand-edit (§9o trap 3). */
const edhaGetSnares = (o) => edhaOwnerList(o, "snares");

async function edhaFateApplyHits(owner, hits) {
  if (!hits?.length) return;
  const payload = { hits, terrain: null, casterActorUuid: owner.uuid };
  if (game.user?.isGM) await edhaApplyBurstResults(payload);
  else { if (!game.users?.activeGM) ui.notifications?.warn("Edha: a GM must be online to apply the damage."); try { game.socket.emit("module.edha-content", { action: "burst-apply", payload }); } catch (e) {} }
}
// edhaFateCard moved onto edhaTreeCard(owner, rolls, html, opts) — Job 4, pass 5.3 (call sites below updated directly).
// True if any of the owner's Ordained squares OR unsprung Snares lies within `ft` of (cx,cy).
function edhaFateZonesNear(owner, cx, cy, ft) {
  const r = edhaFtToPx(ft);
  return [...edhaGetOrdained(owner), ...edhaGetSnares(owner)].some(z => Math.hypot((z.x ?? 0) - cx, (z.y ?? 0) - cy) <= r);
}
// Nearest living enemy token (of the owner) within `ft` of a point — for spring-in-place triggers.
function edhaFateNearestEnemyAt(owner, x, y, ft) {
  const disp = edhaActorSide(owner);
  const r = edhaFtToPx(ft);
  const cands = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && edhaSideHostile(t.document?.disposition, disp)
    && (t.actor?.system?.resources?.hea?.value ?? 1) > 0 && Math.hypot(t.center.x - x, t.center.y - y) <= r);
  cands.sort((a, b) => Math.hypot(a.center.x - x, a.center.y - y) - Math.hypot(b.center.x - x, b.center.y - y));
  return cands[0]?.actor ?? null;
}

/* --- Snare trigger Region (v13) — a full-cell rectangle whose fate-snare behavior fires on
 * tokenEnter + tokenMoveIn (so a PASS-THROUGH springs it). The green MeasuredTemplate stays the
 * player-visible marker; this invisible Region is purely the trigger. GM creates it; players relay. */
/* R-13 (Ben 2026-09-06 (a)): a snare placed directly UNDER a creature ARMS — it does not spring.
 * v13 delivers `tokenEnter` to a Region for every token already inside it the moment the Region is
 * created, which is indistinguishable at the behavior from a creature walking in, so laying the
 * trap on an occupied square detonated it instantly against the card's own words ("the first enemy
 * to ENTER OR PASS THROUGH it"). Standing somewhere is neither. Bench run 7 narrowed it exactly:
 * placement ADJACENT never insta-sprang, only placement directly under a creature did.
 * The fix is a grandfathered set computed HERE, before the Region exists — every token whose
 * centre is already in the square — and stamped on the behavior. Those tokens are ignored on the
 * enter events; their next MOVE is the pass-through that springs it (`tokenMoveOut` /
 * `tokenMoveWithin`, subscribed for exactly that). */
function edhaFateOccupantsOfSquare(scene, x, y) {
  const gs = scene?.grid?.size || 100;
  // scene.tokens, NOT canvas.tokens.placeables: the GM applier may be looking at another scene
  // (players relay placement through them), and the placeables list would then be the wrong scene's.
  return [...(scene?.tokens ?? [])].filter(td => {
    if (!td?.actor) return false;
    const c = edhaTokenDocCenter(td);
    return Math.abs(c.x - x) < gs / 2 && Math.abs(c.y - y) < gs / 2;
  }).map(td => td.uuid).filter(Boolean);
}
async function edhaFateCreateSnareRegionGM(scene, owner, x, y, snareId) {
  try {
    if (!scene || !owner) return null;
    const gs = scene.grid?.size || 100;
    const armedOver = edhaFateOccupantsOfSquare(scene, x, y);   // R-13: already standing there = armed, not sprung
    const [region] = await scene.createEmbeddedDocuments("Region", [{
      name: `${owner.name} — Snare`, color: EDHA_COLOR_HEX.green || "#5fb04f",
      shapes: [{ type: "rectangle", x: x - gs / 2, y: y - gs / 2, width: gs, height: gs, hole: false }],
      behaviors: [{ type: "edha-content.fate-snare", name: "Snare Trigger", system: { ownerUuid: owner.uuid, snareId, armedOver } }],
      flags: { "edha-content": { fateSnare: true, snareId, owner: owner.uuid } },
    }]);
    return region ?? null;
  } catch (e) { console.error("Edha Content | create snare region failed", e); return null; }
}
async function edhaFateDropSnareRegion(owner, scene, x, y, snareId) {
  if (!scene) return null;
  if (game.user?.isGM) return edhaFateCreateSnareRegionGM(scene, owner, x, y, snareId);
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to arm the Snare's trigger zone."); return null; }
  try { game.socket.emit("module.edha-content", { action: "place-fate-snare", payload: { sceneId: scene.id, ownerUuid: owner.uuid, x, y, snareId } }); } catch (e) {}
  return null;
}
function edhaFateFindSnareRegion(scene, snareId) {
  return (scene?.regions ?? []).find(r => r.getFlag?.("edha-content", "fateSnare") && r.getFlag("edha-content", "snareId") === snareId) ?? null;
}
async function edhaFateDeleteSnareRegion(scene, snareId) {
  try {
    if (!scene) return;
    if (game.user?.isGM) { const r = edhaFateFindSnareRegion(scene, snareId); if (r) await scene.deleteEmbeddedDocuments("Region", [r.id]); return; }
    if (!game.users?.activeGM) return;
    game.socket.emit("module.edha-content", { action: "delete-fate-snare", payload: { sceneId: scene.id, snareId } });
  } catch (e) { console.error("Edha Content | delete snare region failed", e); }
}

/* --- Place a marker square (`edha-zone` kinds "ordained" / "snare", 2bX — was the preUse takeover).
 * ENGINE-OWNED per §9o (picker, MeasuredTemplate, trigger Region, GM relays), keyed on the RULE:
 * the system charges the activation cost and every cancel/out-of-range pick REFUNDS it (the
 * Bone-Garden convention). Cap/evict/colour ride the rule; a snare's damage formula and type ride
 * ITS document. The Attunement-Range gate is new with 2bX — the card always said "in Attunement
 * Range" and the retired takeover never checked it (card-is-spec, §9m q11). */
async function edhaFatePlaceCore(item, h, kind) {
  try {
    const owner = item.actor; if (!owner) return;
    const scene = canvas?.scene;
    if (!scene) { edhaRefundCost(item); ui.notifications?.warn(`Edha: need an active scene for ${item.name} — cost refunded.`); return; }
    const isSnare = kind === "snare";
    const tok = edhaCasterToken(owner);
    const color = h.color || "green";
    const ft = Number(h.rangeFt) > 0 ? Number(h.rangeFt) : (EDHA_ATTUNE_FT[edhaColorRank(owner, color) || 1] || EDHA_ATTUNE_FT[1]);
    const hex = EDHA_COLOR_HEX[isSnare ? "green" : "white"] || "#5fb04f";
    const gd = scene.grid?.distance || 5, gs = scene.grid?.size || 100;
    let ring = null;
    if (tok) { try { ring = await edhaDrawCircle(tok.center.x, tok.center.y, ft, EDHA_RANGE_RING_HEX, 0); } catch (e) {} }
    const pt = await edhaPickPoint(`Click the 5 ft square for ${item.name} (right-click to cancel). Attunement Range ${ft} ft.`);
    try { if (ring) await ring.delete(); } catch (e) {}
    if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return; }
    if (tok && Math.hypot(pt.x - tok.center.x, pt.y - tok.center.y) / gs * gd > ft + gd / 2) {
      edhaRefundCost(item); ui.notifications?.warn(`Edha: that square is beyond Attunement Range (${ft} ft) — cost refunded.`); return;
    }
    const [tpl] = await scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle", x: pt.x, y: pt.y, distance: gd / 2, direction: 0, angle: 0,
      fillColor: hex, borderColor: hex, fillAlpha: 0.12, flags: { "edha-content": { fateMarker: kind, owner: owner.uuid } },
    }]);
    const cap = edhaListCap(owner, h.capFormula || "@tier");
    const entry = { id: foundry.utils.randomID(), sceneId: scene.id, templateId: tpl?.id, x: pt.x, y: pt.y, talent: item.name };
    if (isSnare) { entry.inevitable = false; entry.formula = item.system?.damage?.formula || EDHA_FATE_SNARE_DMG; entry.type = item.system?.damage?.type || "keen"; }
    // Queued RMW (07-26n) — the pick-point already resolved above; fresh read inside the lock.
    let evicted = [];   // R-37(1): hoisted out of the lock so the placement card can NAME what fizzled
    const list = await edhaOwnerListQueue(owner, isSnare ? "snares" : "ordained", async () => {
      const cur = isSnare ? edhaGetSnares(owner) : edhaGetOrdained(owner);
      const res = edhaListPush(foundry.utils.deepClone(cur), entry, { cap, evict: h.evict || "oldest" });
      evicted = res.evicted ?? [];
      for (const drop of res.evicted) {   // canvas cleanup stays here, by hand (§9o trap 3)
        try { void scene.templates?.get(drop.templateId)?.delete()?.catch(() => {}); } catch (e) {}
        if (isSnare && drop) await edhaFateDeleteSnareRegion(scene, drop.id);
      }
      await edhaSetOwnerList(owner, isSnare ? "snares" : "ordained", res.list);   // both H3 ledgers (2bX / 2bAA)
      return res.list;
    });
    if (isSnare) await edhaFateDropSnareRegion(owner, scene, pt.x, pt.y, entry.id);
    const guard = edhaActorRuleOf(owner, "edha-zone-guard");
    const thp = guard?.handler?.thpFormula ? Math.max(0, Math.floor(edhaEvalSync(guard.handler.thpFormula, owner.getRollData()))) : 0;
    /* R-37(1) (Ben 2026-09-06 (a)): at the cap the oldest marker fizzles — and the ONLY sign of it
     * was the "(2/2)" count staying put, which reads like nothing happened. Name what was spent.
     * The eviction is `evict: "oldest"` (the Fate convention, Ben R1), so this is normally one
     * entry; the join covers a cap that shrank between placements. */
    const fizzText = evicted.length
      // "trap" / "Marker square" are the fallbacks the OTHER marker cards already use for an entry
      // with no `talent` stamp — and they are not talent names, which iron rule 2b's lint enforces.
      ? ` The oldest — <strong>${evicted.map(d => d.talent || (isSnare ? "trap" : "Marker square")).join("</strong>, <strong>")}</strong> — ${evicted.length === 1 ? "fizzles" : "fizzle"} to make room.`
      : "";
    edhaTreeCard(owner, null, isSnare
      ? `<p>🪢 <strong>${item.name}</strong> set (${list.length}/${cap}).${fizzText} The first enemy to enter or pass through it springs it: damage + <strong>Restrained</strong>.</p>`
      : `<p>✦ <strong>${item.name}</strong> set (${list.length}/${cap}).${fizzText} Allies beginning their turn on it gain +1 all defenses${thp > 0 ? ` and Temp HP = ${thp} (${guard.item.name})` : ""}, and may Aid at up to 30 ft.</p>`);
  } catch (e) { console.error("Edha Content | Fate place marker failed", e); }
}

/* --- Spring a Snare (shared by the auto-enter trigger + the marker-command cards) ------------------ */
/* In-flight spring guard (bench run 6, 2026-07-27c — the snare DOUBLE-FIRE): v13 fires tokenEnter
 * AND tokenMoveIn for ONE movement entry (~2 ms apart — the same double-event the Civ fortified
 * Region debounces, see _edhaCivEnterGuard), and the second event's ledger stale-check reads
 * BEFORE the first spring's queued consume lands — so one walk-in posted the card + roll + the
 * Hexmark offer twice (damage applied once: the burst pipeline landed before the twin's).
 * The guard lives ON THE SPRING, not per caller: a snare is a consumable that springs at most
 * once, so every path (Region event, Foreknown click, insta-spring, Thread resolve) shares the
 * same idempotence. Set-based, no time window; once the consume lands the ledger check takes
 * over. edhaSnareSpringGate is the PURE decision (pinned in tests/). */
const _edhaSnareSpringing = new Set();
function edhaSnareSpringGate(inflight, snareId) {
  if (!snareId) return true;                 // defensive: an id-less snare cannot be tracked — let it through
  if (inflight.has(snareId)) return false;   // a spring for this snare is already in flight — drop the twin event
  inflight.add(snareId);
  return true;
}
async function edhaFateSpringSnare(owner, snare, triggerActor, { source = "", bonusFormula = "" } = {}) {
  if (!edhaSnareSpringGate(_edhaSnareSpringing, snare?.id)) return;
  try {
    const scene = canvas?.scene; if (!scene || !snare) return;
    const label = source || snare.talent || "Trap";   // the label is DATA (the placing item's name)
    // consume the snare (drop from the ledger + delete its template) BEFORE applying so it can't
    // re-fire. Ledger write is a raw-path hand-edit onto lists.snares (§9o trap 3). Queued RMW
    // (07-26n): two snares springing in the same tick (a group walk-in) must not resurrect each
    // other — the filter reads inside the per-owner queue.
    await edhaOwnerListQueue(owner, "snares", () => edhaSetOwnerList(owner, "snares", edhaGetSnares(owner).filter(s => s.id !== snare.id)));
    try { void scene.templates?.get(snare.templateId)?.delete()?.catch(() => {}); } catch (e) {}
    await edhaFateDeleteSnareRegion(scene, snare.id);
    if (!triggerActor) { edhaTreeCard(owner, null, `<p>🪢 <strong>${label}</strong> sprang with no creature in the square.</p>`); return; }
    const rd = owner.getRollData();
    const rolls = [];
    const baseRoll = await edhaRollFormula(rd, (snare.formula || EDHA_FATE_SNARE_DMG) + (bonusFormula || ""));
    rolls.push(baseRoll); let amt = Math.max(0, Math.floor(baseRoll.total));
    /* The annotated rider reads its dials off the ANNOTATING DOCUMENT via the entry's
     * sourceItemUuid (2bX — the Pinpoint correction): the extra die is that item's own damage
     * formula (the pre-2bX code rolled the module constant, so editing the talent's damage in
     * Foundry changed nothing — the silent editability bug from the classification), and the
     * contest is its annotate rule's riderSkill / riderColor / riderFailStatus, engine-rolled
     * (iron rule 3 — never trust-the-player). Defaults preserve the shipped behaviour. */
    const srcDoc = snare.inevitable && snare.sourceItemUuid && typeof fromUuidSync === "function" ? fromUuidSync(snare.sourceItemUuid) : null;
    const srcRule = srcDoc ? (edhaEventRules(srcDoc).map(r => r?.handler).find(x => x?.type === "edha-owner-list" && (x.op || "place") === "annotate") ?? null) : null;
    if (snare.inevitable) {
      const extraF = srcDoc?.system?.damage?.formula || EDHA_FATE_GREEN_DIE;
      const ir = await edhaRollFormula(rd, extraF);
      rolls.push(ir); amt += Math.max(0, Math.floor(ir.total));
    }
    await edhaFateApplyHits(owner, [{ actorUuid: triggerActor.uuid, amount: amt, type: snare.type || "keen", heal: false }]);
    await edhaApplyTimedStatus(triggerActor, "restrained", { owner, expire: "owner" });
    let extra = "";
    if (snare.inevitable) {   // the foe's skill vs the owner's colour, engine-rolled → status on a fail
      const cSkill = String(srcRule?.riderSkill || "spd").trim() || "spd";
      const cColor = String(srcRule?.riderColor || "green").trim() || "green";
      const cStatus = String(srcRule?.riderFailStatus || "disoriented").trim() || "disoriented";
      const dcRoll = await new Roll(`1d20 + @skills.${cColor}.mod`, rd).evaluate(); rolls.push(dcRoll);
      const dc = Number(dcRoll.total) || 0;
      const opp = await edhaRollOpposedSkill(triggerActor, cSkill);
      const failed = opp < dc;
      if (failed) await edhaApplyTimedStatus(triggerActor, cStatus, { owner, expire: "target" });
      extra = `<br>${String(cSkill).toUpperCase()} <strong>${opp}</strong> vs your ${cColor} <strong>${dc}</strong> — ${failed ? `<strong>${edhaConditionLabel(cStatus) || cStatus}</strong>` : "resists"}.`;
    }
    edhaTreeCard(owner, rolls, `<p>🪢 <strong>${snare.inevitable ? "Inevitable " : ""}${label}</strong> springs on <strong>${triggerActor.name}</strong>: ${amt} ${snare.type || "keen"} + <strong>Restrained</strong> (until the start of your next turn).${extra}</p>`);
    edhaFateSpringReacts(owner, snare, triggerActor);   // `edha-snare-react` rules sweep (2bX)
  } catch (e) { console.error("Edha Content | Fate spring snare failed", e); }
  finally { if (snare?.id) _edhaSnareSpringing.delete(snare.id); }   // a FAILED spring stays retryable; a done one is off the ledger
}

/* --- `edha-snare-react` sweep (2bX — was the name-keyed Hexmark offer and Weave's never-wired
 * Reactive-Strike grant): what the OWNER's talents do when one of their snares springs. Config-only
 * rules, every dial a field, swept off the documents — the sweep names no talent.
 *   mode "offer-mark" — post the mark offer (the Diagnosed/Omen marked pattern); the click writes
 *     markedBy.<markKey>, and the applyDamage PRE-pass below reads the SAME rule for the
 *     damage-near-your-zones rider.
 *   mode "prompt"     — post the rule's note when the spring lies within nearFt of a LINKED legacy
 *     marker square (requireLinked — the `linked` annotation edhaZoneLinkMarkers writes, which
 *     finally gives that field its reader; pre-2bX it had one write and zero reads). */
function edhaFateSpringReacts(owner, snare, triggerActor) {
  try {
    for (const { item: tal, handler: h } of edhaActorRulesOf(owner, "edha-snare-react")) {
        if ((h.mode || "offer-mark") === "offer-mark") {
          if (!triggerActor) continue;
          const amt = Math.max(0, Math.floor(edhaEvalSync(h.bonusFormula || "@tier", owner.getRollData())));
          ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<div class="edha-trigger-card"><p>🎯 <strong>${tal.name}</strong> (Reaction) — mark <strong>${triggerActor.name}</strong>? For the scene it takes +${amt} ${h.bonusType || "keen"} whenever it takes damage within ${Number(h.nearFt) || 10} ft of your marker squares.</p>`
              + `<button type="button" class="edha-mark-offer" data-owner="${owner.uuid}" data-target="${triggerActor.uuid}" data-item="${tal.uuid}">${tal.name}: mark ${triggerActor.name}</button></div>` });
        } else if (h.mode === "prompt") {
          if (h.requireLinked === true && !edhaLinkedSquareNear(edhaGetOrdained(owner), snare.x, snare.y, edhaFtToPx(Number(h.nearFt) || 30))) continue;
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
            content: `<div class="edha-trigger-card"><p>🪢 <strong>${tal.name}</strong>: ${h.note || "a linked-square reaction is available (see the talent)."}</p></div>` });
        }
    }
  } catch (e) { console.error("Edha Content | snare-react sweep failed", e); }
}
// PURE (pinned in tests/): any `linked` marker entry within rPx of (x, y)?
function edhaLinkedSquareNear(list, x, y, rPx) {
  return (Array.isArray(list) ? list : []).some(m => m && m.linked === true && Math.hypot((m.x ?? 0) - x, (m.y ?? 0) - y) <= rPx);
}
async function edhaFateApplyMark(owner, target, tal, h) {
  if (!owner || !target) return;
  const markKey = String(h?.markKey || "hexmark").trim() || "hexmark";
  await edhaSetEdhaFlag(target, `markedBy.${markKey}`, { actorId: owner.id });   // Job 6: edhaSetActorFlagCross retired
  const amt = Math.max(0, Math.floor(edhaEvalSync(h?.bonusFormula || "@tier", owner.getRollData())));
  edhaTreeCard(owner, null, `<p>🎯 <strong>${tal?.name ?? "Mark"}</strong> on <strong>${target.name}</strong> — +${amt} ${h?.bonusType || "keen"} near your marker squares (this scene).</p>`);
}
/* applyDamage PRE-pass rider (2bX — was the name-keyed edhaFateHexmarkIncoming): the victim's
 * markedBy flags name their owners; an owner's `edha-snare-react` offer-mark rule with the matching
 * markKey carries the bonus, the type and the near-zones radius. Adds to the in-progress single
 * apply, no recursion (the Pack Pressure shape). Marks whose key matches no rule are skipped, so
 * the other trees' markedBy families pass through untouched. */
function edhaMarkedNearZonesBonus(target, list) {
  try {
    const marks = target?.flags?.["edha-content"]?.markedBy; if (!marks) return;
    if (!list?.some(i => Number(i?.amount) > 0 && i?.type && i.type !== "heal")) return;
    const ttok = edhaCasterToken(target);
    if (!ttok?.center) return;
    for (const [markKey, mk] of Object.entries(marks)) {
      const owner = mk?.actorId ? game.actors?.get(mk.actorId) : null; if (!owner) continue;
      let rule = null;
      for (const { item: tal, handler: h } of edhaActorRulesOf(owner, "edha-snare-react")) {
        if ((h.mode || "offer-mark") === "offer-mark" && String(h.markKey || "hexmark") === markKey) { rule = { item: tal, handler: h }; break; }
      }
      if (!rule) continue;
      if (!edhaFateZonesNear(owner, ttok.center.x, ttok.center.y, Number(rule.handler.nearFt) || 10)) continue;
      const bonus = Math.max(0, Math.floor(edhaEvalSync(rule.handler.bonusFormula || "@tier", owner.getRollData())));
      if (bonus > 0) { list.push({ amount: bonus, type: rule.handler.bonusType || "keen" }); ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎯 <strong>${rule.item.name}</strong> (${owner.name}): +${bonus} ${rule.handler.bonusType || "keen"} to ${target.name} near your marker squares.</p>` }); }
    }
  } catch (e) { console.error("Edha Content | marked-near-zones rider failed", e); }
}

/* --- `edha-marker-command` (2bX) — ENGINE-OWNED card flows over your placed markers, keyed on the
 * RULE (the edha-decree exit shape): pickers, canvas moves and spring buttons are multi-step flows
 * no rule chain expresses, so the flow stays engine code and the rule carries every dial. The
 * system charges the cost; oncePerScene is vetoed pre-cost (generic sceneOnce stamp).
 *   mode "move"        — slide one marker ≤ maxFt (Read the Threads; the foresight GM-reveal line
 *                        rides the card as the rule's note — the Ben-approved manual half, 07-03c).
 *   mode "spring-pick" — a button per unsprung snare; the clicked spring adds THIS item's own
 *                        damage formula as a bonus (Foreknown Strike — the bonus was a hard-coded
 *                        module constant pre-2bX; the write-only fateForeknown flag is dropped,
 *                        nothing ever read it).
 *   mode "spring-all"  — declare card; the resolve button springs every unsprung snare and posts
 *                        the rally note (Thread of Inevitability). */
async function edhaMarkerCommand(item, h) {
  try {
    const owner = item.actor; if (!owner) return;
    const mode = h.mode || "move";
    if (mode === "spring-all") {
      if (h.oncePerScene === true) await edhaStampSceneOnce(owner, item);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-trigger-card"><p>🪧 <strong>${item.name}</strong> — ${h.note || "declare the event that will come to pass. When it does, click to resolve:"}</p><button type="button" class="edha-fate-thread" data-owner="${owner.uuid}" data-item="${item.uuid}">The event occurs — resolve</button></div>` });
      return;
    }
    if (mode === "spring-pick") {
      const sn = edhaGetSnares(owner);
      const btns = sn.map((s, i) => `<button type="button" class="edha-fate-springsnare" data-owner="${owner.uuid}" data-item="${item.uuid}" data-snare="${s.id}">Spring ${s.talent || "trap"} #${i + 1}${s.inevitable ? " ⛓️" : ""}</button>`).join(" ");
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-burst-card"><p>🪡 <strong>${item.name}</strong> (this scene): ${h.note || "spring one of your unsprung traps:"}</p>${btns || `<p style="opacity:.8">(nothing to spring)</p>`}</div>` });
      return;
    }
    // mode "move"
    const target = edhaUserTargetActor();
    const maxFt = Number(h.maxFt) || 10;
    const markers = [...edhaGetOrdained(owner).map((m, i) => ({ key: "ordained", id: m.id, label: `${m.talent || "Marker"} #${i + 1}` })),
                     ...edhaGetSnares(owner).map((m, i) => ({ key: "snares", id: m.id, label: `${m.talent || "Trap"} #${i + 1}` }))];
    const btns = markers.map(m => `<button type="button" class="edha-fate-reposition" data-owner="${owner.uuid}" data-key="${m.key}" data-id="${m.id}" data-ft="${maxFt}">Move ${m.label} ≤${maxFt} ft</button>`).join(" ");
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🧵 <strong>${item.name}</strong>${target ? ` — ${target.name}` : ""}: ${h.note || "you may slide one marker square:"}</p>${btns || `<p style="opacity:.8">(no active markers to move)</p>`}</div>` });
  } catch (e) { console.error("Edha Content | marker-command failed", e); }
}
async function edhaFateReposition(owner, key, id, maxFt) {
  const isSnare = key === "snares";
  if (!edhaOwnerList(owner, key).some(x => x.id === id)) { ui.notifications?.info("That marker is gone."); return; }
  const pt = await edhaPickPoint(`Click the new square (≤${Number(maxFt) || 10} ft — range is owner-judged).`);
  if (!pt) return;
  // Queued RMW (07-26n): the pick above stays outside the lock; the entry is re-found inside it
  // (a spring may have consumed it while the pick was open — the fresh read notices).
  await edhaOwnerListQueue(owner, key, async () => {
    const list = foundry.utils.deepClone(edhaOwnerList(owner, key));   // both keys are H3 ledgers (2bAA)
    const m = list.find(x => x.id === id); if (!m) { ui.notifications?.info("That marker is gone."); return; }
    m.x = pt.x; m.y = pt.y;
    try { await canvas?.scene?.templates?.get(m.templateId)?.update({ x: pt.x, y: pt.y }); } catch (e) {}
    if (isSnare) { await edhaFateDeleteSnareRegion(canvas?.scene, id); await edhaFateDropSnareRegion(owner, canvas?.scene, pt.x, pt.y, id); }
    await edhaSetOwnerList(owner, key, list);   // raw path, either ledger (§9o trap 3)
    edhaTreeCard(owner, null, `<p>🧵 Marker slid into place.</p>`);
  });
}
async function edhaFateSpringFromCard(owner, snareId, bonusFormula, source) {
  const snare = edhaGetSnares(owner).find(s => s.id === snareId);
  if (!snare) { ui.notifications?.info("That trap is already sprung."); return; }
  await edhaFateSpringSnare(owner, snare, edhaFateNearestEnemyAt(owner, snare.x, snare.y, 5), { source, bonusFormula });
}
async function edhaFateThreadResolve(owner, item) {
  for (const s of [...edhaGetSnares(owner)]) await edhaFateSpringSnare(owner, s, edhaFateNearestEnemyAt(owner, s.x, s.y, 5), { source: item?.name || "" });
  const n = edhaGetOrdained(owner).length;
  edhaTreeCard(owner, null, `<p>🪧 <strong>${item?.name || "The declared event"}</strong> resolves — every unsprung trap has sprung, and each of your ${n} marker-square ally(ies) may make a free Strike or Aid against the nearest enemy within 30 ft (GM/players execute).</p>`);
}

/* --- `edha-zone {kind: link-markers}` (2bX — was the Weave takeover). The card is the SPEC
 * (§9m q11): the player CHOOSES the two squares — the retired code silently took the two most
 * recent, with no picker and no range check (the drift the classification named). The dialog
 * offers every active legacy marker square and annotates the ones beyond Attunement Range (the
 * range stays owner-judged, as it was); cancel REFUNDS. Writes the `linked` annotation that the
 * `edha-snare-react` prompt gate reads. The two-active-squares gate is vetoed pre-cost.
 *
 * DialogV2-FIRST since 07-27d (bench run 6, 2bX-8 attempt): the reported "post-cost silent
 * no-op" was NOT an engine failure — a live repro (use → consume → 2 Inv → picker) rendered the
 * dialog on the current engine. This was the engine's only AppV1 window on a runtime path
 * (`div.app.window-app`, no `<dialog>` element), which the run-6 DOM sampling missed — the
 * picker sat open and unanswered, which also explains the swallowed cost (cancel refunds; a
 * reload orphans it). Converted to DialogV2 (the edhaPromptDC idiom) so the bench harness sees
 * it AND the flow survives the v16 AppV1 removal; the V1 body stays as the fallback. */
async function edhaZoneLinkMarkers(item, h) {
  try {
    const owner = item.actor; if (!owner) return;
    const ord = foundry.utils.deepClone(edhaGetOrdained(owner));
    if (ord.length < 2) { edhaRefundCost(item); ui.notifications?.warn(`Edha: ${item.name} needs two active marker squares — cost refunded.`); return; }
    const tok = edhaCasterToken(owner);
    const ft = EDHA_ATTUNE_FT[edhaColorRank(owner, h.color || "green") || 1] || EDHA_ATTUNE_FT[1];
    const gd = canvas?.scene?.grid?.distance || 5, gs = canvas?.scene?.grid?.size || 100;
    const opts = ord.map((m, i) => {
      const dist = tok ? Math.hypot((m.x ?? 0) - tok.center.x, (m.y ?? 0) - tok.center.y) / gs * gd : null;
      const far = dist != null && dist > ft + gd / 2;
      return `<option value="${m.id}">${m.talent || "Marker"} #${i + 1}${far ? " (beyond Attunement Range)" : ""}</option>`;
    });
    const content = `<p>Choose TWO of your marker squares (Attunement Range ${ft} ft — owner-judged):</p>
          <p><select name="edhaLinkA">${opts.join("")}</select></p>
          <p><select name="edhaLinkB">${[...opts.slice(1), opts[0]].join("")}</select></p>`;
    const picked = await edhaDialogPick({ title: `${item.name} — link two squares`, content, buttons: [
      { action: "ok", label: "Link", default: true, parse: (root) => [root.querySelector("[name=edhaLinkA]")?.value, root.querySelector("[name=edhaLinkB]")?.value] },
      { action: "cancel", label: "Cancel" },
    ] });
    if (!picked || !picked[0] || !picked[1] || picked[0] === picked[1]) {
      edhaRefundCost(item);
      ui.notifications?.info(`${item.name} ${picked ? "needs two DIFFERENT squares" : "canceled"} — cost refunded.`);
      return;
    }
    // Queued RMW (07-26n): the dialog above stays outside the lock; the picked ids are re-found
    // against a FRESH read inside it (an eviction may have consumed one while the dialog was open).
    await edhaOwnerListQueue(owner, "ordained", async () => {
      const fresh = foundry.utils.deepClone(edhaGetOrdained(owner));
      for (const id of picked) { const m = fresh.find(x => x.id === id); if (m) m.linked = true; }
      await edhaSetOwnerList(owner, "ordained", fresh);   // the 2bAA repoint — `linked` rides the entries
    });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>🪢 <strong>${item.name}</strong> (this scene): the chosen squares are linked. ${h.note || "GM/players execute the granted actions."}</p></div>` });
  } catch (e) { console.error("Edha Content | link-markers failed", e); }
}

/* --- Ordained Ground turn-start buff (+1 all defenses; Bulwark Temp HP; Aid-at-range grant) -------- */
async function edhaFateRemoveOrdainedBuff(actor) {
  const ex = actor?.effects?.filter(e => e.getFlag?.("edha-content", "fateOrdainedBuff")) ?? [];
  if (ex.length) { try { await actor.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id)); } catch (e) {} }
}
async function edhaFateApplyOrdainedBuff(actor, label) {
  if (actor.effects?.find(e => e.getFlag?.("edha-content", "fateOrdainedBuff"))) return;
  const changes = ["phy", "cog", "spi"].map(d => ({ key: `system.defenses.${d}.bonus`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1", priority: 20 }));
  const name = label || "Marker square";   // DATA — the placing talent's name, stamped on the entry (2bX)
  try {
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name, img: "icons/magic/time/hourglass-tilted-glowing-gold.webp", changes,
      description: `<p>+1 to all defenses until the start of your next turn (${name}).</p>`,
      flags: { "edha-content": { fateOrdainedBuff: true } },
    }]);
  } catch (e) { console.error("Edha Content | Ordained buff apply failed", e); }
}
async function edhaFateTurnStart(combat) {
  try {
    if (!combat?.started) return;
    const tok = combat.combatant?.token; if (!tok) return;
    const ally = tok.actor; if (!ally) return;
    await edhaFateRemoveOrdainedBuff(ally);   // expire last round's buff at the start of this actor's turn
    const c = edhaTokenDocCenter(tok);
    const adisp = tok.disposition;
    let buffed = false;
    for (const owner of (game.actors?.filter(a => a.type === "character") ?? [])) {
      const squares = edhaGetOrdained(owner); if (!squares.length) continue;
      const otok = edhaCasterToken(owner);
      if (otok && !edhaSideSame(otok.document?.disposition, adisp)) continue;   // allies only — unknown side fails CLOSED (R-63)
      const onSq = squares.find(sq => edhaSameSquare(c.x, c.y, sq)); if (!onSq) continue;
      if (!buffed) { await edhaFateApplyOrdainedBuff(ally, onSq.talent); buffed = true; }
      // The THP upgrade is DATA (2bX): the owner's `edha-zone-guard` rule carries the formula —
      // was `edhaOwnsTalent(owner, "Bulwark Ground")`, rule 2b's exact smell.
      const guard = edhaActorRuleOf(owner, "edha-zone-guard");
      const thp = guard?.handler?.thpFormula ? Math.max(0, Math.floor(edhaEvalSync(guard.handler.thpFormula, owner.getRollData()))) : 0;
      if (thp > 0) await edhaGrantTempHpCross(ally, thp, guard.item.name);
      /* R-37(3) (Ben 2026-09-06 (a)): the card's headline is the ORDAINED-placing talent, so an
       * unattributed ", Temp HP 2" credited the Temp HP to the wrong document — the grant comes
       * from the owner's `edha-zone-guard` rule, and edhaGrantTempHpCross already stores THAT
       * talent as the THP source (R-36). Name it here too, exactly as the placement card does. */
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>✦ <strong>${onSq.talent || "Marker square"}</strong> (${owner.name}): ${ally.name} begins its turn ordained — +1 all defenses${thp > 0 ? `, Temp HP ${thp} (${guard.item.name})` : ""}, and may take the Aid action at up to 30 ft (execute by hand).</p>` });
    }
  } catch (e) { console.error("Edha Content | Fate turn-start failed", e); }
}
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaFateTurnStart(combat); });
Hooks.on("combatStart", (combat) => { if (edhaDefBuffGmGate()) void edhaFateTurnStart(combat); });

/* --- `edha-zone-guard` noAdvantage injector (2bX — was the name-keyed Bulwark Ground block):
 * attacks against an ally standing on the rule owner's legacy marker squares can't benefit from
 * advantage. The INVERSE of the advantage pre-roll pipelines (edhaTestRiderApply, and the exact
 * inverse of edha-unseen-ward): it keys off the DEFENDER — the attacker's synced target
 * (edhaTargetsOfRoller), not the roller. Any "advantage" on the incoming attack is neutralized to
 * none; disadvantage is left untouched (the card removes a benefit, it never grants one). The GM
 * can still re-toggle in the dialog (same override philosophy as Weakened). Attack/item rolls only
 * — skill tests aren't attacks. The sweep ANNOUNCES (edhaWatchersOfRule), so it names no talent.
 * NOTE (pass-F caller/callee lesson): this block also hosts the legacy-marker turn-start pass
 * above, which is Ordained Ground's logic — the guard rule is only the THP + no-adv upgrades. */
function edhaTokenOnAnyOrdained(owner, tok) {
  return !!tok?.center && edhaGetOrdained(owner).some(sq => edhaSameSquare(tok.center.x, tok.center.y, sq));
}
function edhaZoneGuardOf(tok) {
  if (!tok?.actor) return null;
  for (const { actor: owner, item: tal, handler: h } of edhaWatchersOfRule("edha-zone-guard")) {
    if (h.noAdvantage !== true) continue;
    if (!edhaGetOrdained(owner).length) continue;
    // R-63: Number.isFinite fail-closed, via edhaSameDisposition — 🤖 bench row.
    const ally = tok.actor === owner || edhaSameDisposition(owner, tok);   // the protected creature is the owner's ally (or the owner)
    if (ally && edhaTokenOnAnyOrdained(owner, tok)) return { owner, item: tal };
  }
  return null;
}
function edhaZoneGuardNoAdvantage(roll, source, config) {
  try {
    if (roll?.options?._edhaBulwarkNoAdv) return;                       // idempotent (a re-fired pre-roll)
    if (roll?.options?.advantageMode !== "advantage") return;           // only NEUTRALIZE advantage — never grant or stomp disadvantage
    const attacker = edhaD20RollActor(config); if (!attacker) return;
    const targets = edhaTargetsOfRoller(attacker);
    const guarded = targets.find(t => edhaZoneGuardOf(t)); if (!guarded) return;
    const g = edhaZoneGuardOf(guarded);
    roll.options.advantageMode = "none"; roll.options._edhaBulwarkNoAdv = true; roll.configureModifiers?.();
    const orig = roll.configureDialog?.bind(roll);
    if (orig) roll.configureDialog = async (data) => { try { data ??= {}; data.skillTest ??= {}; data.skillTest.advantageMode = "none"; } catch (e) {} return orig(data); };
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: g.owner }), content: `<p>✦ <strong>${g.item.name}</strong> (${g.owner.name}): ${guarded.name ?? "the target"} stands on a guarded marker square — this attack can't benefit from advantage.</p>` });
  } catch (e) { console.error("Edha Content | zone-guard no-advantage pre-roll failed", e); }
}
for (const ctx of ["attack", "item"]) { const cap = ctx.charAt(0).toUpperCase() + ctx.slice(1); Hooks.on(`cosmere-rpg.pre${cap}Roll`, edhaZoneGuardNoAdvantage); }

/* --- Snare auto-trigger: handled by the edha-content.fate-snare Region behavior (above) on
 * tokenEnter + tokenMoveIn, so a foe that walks THROUGH the square springs it — not just one that
 * stops. The Region is armed at placement (edhaFateDropSnareRegion) and dropped on spring/scene-end. */

/* --- Fate chat-card buttons (every button carries its DOCUMENT — no constants, no names) ----------- */
// Button binding: EDHA_CARD_BUTTONS["edha-mark-offer"], ["edha-fate-reposition"],
// ["edha-fate-springsnare"], ["edha-fate-thread"] (Job 1, pass 5.3, end of file — the click bodies
// moved there too, since they were inline; all four GAIN an R-59 outer catch they didn't have before).

/* The `EDHA_FATE_TALENTS` preUseItem TAKEOVER is GONE (2bX — iron rule 2b): the system charges
 * every activation cost, the gates ride the generic pre-cost vetoes (H3 annotate, the zone-verb
 * link-markers gate, the marker-command sceneOnce), and every picker cancel refunds. Do NOT re-add
 * a takeover, and do not re-add the seven names. Bulwark Ground and Hexmark stay config-only. */

// Clear Fate markers / flags / buffs at scene/combat end (GM-side), like the Charge/Chaos state.
// R-60: the ledger/legacy-flag pass widens from characters-only to edhaSceneReset's wide dedup; the
// markedBy sweep widens from canvas-tokens-only to the same population (an off-scene hexmark bearer
// now clears too). markKeys is computed ONCE, outside the per-actor applier, then closed over by
// `extra` — it depends on scanning every actor's talents, not on which actor is being swept.
async function edhaClearFateState(endedCombat) {
  try {
    // Marks are cleared by DATA: any markedBy key that some `edha-snare-react` offer-mark rule
    // names is scene-scoped and dies here (was a hard-coded markedBy.hexmark unset).
    const markKeys = new Set();
    for (const a0 of (game.actors ?? [])) for (const { handler: h } of edhaActorRulesOf(a0, "edha-snare-react")) {
      if ((h.mode || "offer-mark") === "offer-mark") markKeys.add(String(h.markKey || "hexmark").trim() || "hexmark");
    }
    await edhaSceneReset(endedCombat, {
      key: "fate",
      // ⚠ raw path (§9o trap 3): BOTH repointed ledger keys are hand-edited here — a repoint does
      // NOT update the sweeps, and a missed key silently leaves a live list at the table. The four
      // flat keys are pre-repoint / pre-2bX residue, kept so a mid-scene actor doesn't keep a fossil.
      flags: ["lists.ordained", "lists.snares", "fateOrdained", "fateSnares", "fateForeknown", "fateThreadUsed"],
      extra: async (a) => {
        await edhaFateRemoveOrdainedBuff(a);
        const mb = a.flags?.["edha-content"]?.markedBy; if (!mb) return;
        for (const k of Object.keys(mb)) if (markKeys.has(k)) { try { await a.unsetFlag("edha-content", `markedBy.${k}`); } catch (e) {} }
      },
    });
    // Un-attributable world props (no owner on the template/Region) — see the charges sweep.
    const guard = edhaCombatEndGuard(endedCombat);
    if (!guard.size) for (const scene of game.scenes ?? []) {
      const stale = (scene.templates ?? []).filter(t => t.getFlag?.("edha-content", "fateMarker"));
      if (stale.length) await scene.deleteEmbeddedDocuments("MeasuredTemplate", stale.map(t => t.id));
      const staleRgn = (scene.regions ?? []).filter(r => r.getFlag?.("edha-content", "fateSnare"));
      if (staleRgn.length) await scene.deleteEmbeddedDocuments("Region", staleRgn.map(r => r.id));
    }
  } catch (e) { console.error("Edha Content | clear Fate state failed", e); }
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

