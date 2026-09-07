/* ============================================================================================
 * SYNCHRONOUS FORMULA & DICE EVALUATION — the [Tier][Die] evaluator, and the most REUSED block
 * in this cross-tree run: bursts, hazards, summons, injuries and every triggered damage/heal
 * payload fold their formula through it.
 *
 * ⚠️ Why SYNCHRONOUS at all, when Foundry's Roll is async: these run inside `preUseItem` and
 * inside applyDamage wrappers, where an `await` yields and the system's own write lands first.
 * edhaRollDiceSync / edhaEvalSync are therefore hand-rolled — and PURE, which is why they are
 * pinned in `tests/`. A fix in here ships with a regression case (iron rule 4).
 * ⚠️ edhaRandomFace draws from CONFIG.Dice.randomUniform (the same source Die#randomFace uses)
 * so a seeded bench session stays faithful; the Math.random fallback exists only for the node
 * test harness, which has no CONFIG.
 * Substitution order matters: edhaSubstRankTier folds @tier/@skills.<colour>.rank FIRST, then
 * edhaTargetFormula folds target-relative terms and the recovery die, then the dice are rolled.
 * Owns: edhaRandomFace · edhaRollDiceSync · edhaEvalSync · edhaRollFormula · edhaSubstRankTier ·
 *   edhaTargetFormula · edhaNormalizeDie · edhaRecoveryDie · edhaConsumeList · edhaConsumeCost ·
 *   edhaPickPlacement.
 * ============================================================================================ */

/* One synchronous die roll, drawn from FOUNDRY's RNG rather than bare Math.random so bench/seeded
 * sessions stay faithful (CONFIG.Dice.randomUniform is the same source Die#randomFace uses). The
 * Math.random fallback is for the node test harness, which has no CONFIG. */
function edhaRandomFace(faces) {
  const n = Math.max(1, Math.floor(Number(faces) || 1));
  try { const u = CONFIG?.Dice?.randomUniform?.(); if (Number.isFinite(u)) return Math.min(n, Math.max(1, Math.ceil(u * n))); } catch (e) {}
  return Math.min(n, Math.max(1, Math.ceil(Math.random() * n)));
}
/* Pure (pinned in tests/): roll every plain `NdM` in an already-FOLDED formula and substitute its
 * total, so a DICE formula can survive a synchronous evaluation.
 *
 * WHY THIS EXISTS (bench run 2, 2026-07-26i — the bug it fixes was live for the whole tracked
 * history): Foundry v13 made DiceTerm NON-deterministic (the dice-fulfillment feature), so
 * `Roll#evaluateSync()` THROWS — "This Roll contains terms that cannot be synchronously evaluated"
 * — on ANY die term. edhaEvalSync's catch then returned 0, and because nearly every caller gates on
 * `amt > 0`, the talent was skipped in SILENCE. It killed Shield Wall, Interposing Shield,
 * Retributive Guard and Devoted Conduit outright. The comment above this helper used to say
 * "flat (non-dice) formula", which described the DAMAGE rather than the intent: the callers have
 * always passed dice ("half [Tier][Die]" is the White tree's whole idiom).
 *
 * Rolling the faces here is faithful, not a shortcut — `Die#randomFace()` is itself synchronous and
 * draws from the same RNG; what v13 made async is fulfillment (manual dice / Dice So Nice), which a
 * passive damage-reduction has no business awaiting anyway. The pre-damage reduce path is
 * documented as synchronous-by-necessity (it mutates the instance list before the system applies
 * it), so making the call sites async was not an option.
 *
 * `rollFace` is injected so the node harness can pin this without Foundry. Anything that is not a
 * bare NdM — a kept-dice modifier like `2d20kh`, say — is deliberately LEFT ALONE: it then fails
 * exactly as it did before rather than being silently mangled into a wrong number. */
function edhaRollDiceSync(formula, rollFace = edhaRandomFace) {
  return String(formula ?? "").replace(/(?<![\w.@])(\d*)d(\d+)(?![\w.])/g, (m, n, f) => {
    const count = Math.floor(Number(n === "" ? 1 : n));
    const faces = Math.floor(Number(f));
    if (!Number.isFinite(count) || !Number.isFinite(faces) || count < 0 || faces < 1) return m;
    if (count === 0) return "0";
    if (count > 100) return m;                       // runaway guard: leave it to fail loudly
    let total = 0;
    for (let i = 0; i < count; i++) total += rollFace(faces);
    return String(total);
  });
}
// Evaluate a formula like "@skills.red.mod" — or "floor((@tier)d(2 * @colorRank + 2) / 2)" — to a
// number against roll data. Dice are folded (computed faces → plain NdM) then ROLLED synchronously;
// see edhaRollDiceSync for why that is necessary under v13.
function edhaEvalSync(formula, rd) {
  try {
    const subbed = Roll.replaceFormulaData(String(formula ?? "0"), rd, { missing: "0" });
    const r = new Roll(edhaRollDiceSync(edhaFoldDieMath(subbed)));
    r.evaluateSync();
    return Number(r.total) || 0;
  } catch (e) { return 0; }
}
/* R-65 (hygiene campaign 2026-08-10): the ONE async formula-roll path every damage/heal/DC roll now
 * shares. Before this, only 2 of 22 `new Roll(Roll.replaceFormulaData(...))` evaluate sites folded
 * computed die math (edhaFoldDieMath) before rolling — the rest reached Foundry's Roll with the
 * documented [Tier][Die] convention, e.g. "(@tier)d(2 * @colorRank + 2)", still UNRESOLVED after
 * @-ref substitution: Roll has no arithmetic-inside-dice-notation support, so the die term silently
 * failed. The smoking gun was two adjacent lines: a heal branch that didn't fold sitting eight lines
 * above its damage twin that did. `actorOrRd` accepts either an actor (`.getRollData()` is called
 * once) or an already-resolved roll-data object (several call sites already had one in scope as
 * `rd` and should keep passing that, not re-derive it). Returns the evaluated Roll — `.total`,
 * `.dice`, `.toMessage()` all behave exactly as the inline `new Roll(...).evaluate()` they replace. */
async function edhaRollFormula(actorOrRd, formula) {
  const rd = (actorOrRd && typeof actorOrRd.getRollData === "function") ? actorOrRd.getRollData() : (actorOrRd || {});
  const baked = Roll.replaceFormulaData(String(formula ?? "0"), rd, { missing: "0" });
  const roll = new Roll(edhaFoldDieMath(baked));
  await roll.evaluate();
  return roll;
}
// Pure (pinned in tests/): resolve the two Edha-vocabulary refs the system's roll data cannot —
// @colorRank (skill rank for a PC, ROLE rank for an adversary owner — ruling 122) and @tier.
// Callers pass the already-resolved numbers; anything else in the formula stays for roll data.
function edhaSubstRankTier(formula, rank, tier) {
  return String(formula ?? "").replace(/@colorRank\b/g, String(rank)).replace(/@tier\b/g, String(tier));
}
/* H17 (2bZ) — the TARGET-scoped formula resolver. Every @-ref in the project resolves against the
 * OWNER's roll data, which is why "the TARGET's recovery die" spent four passes engine-owned
 * (Galvanize, Field Medicine — audit §9c). PURE (pinned in tests/): `@target.recoveryDie` becomes
 * the die spec passed in; any other `@target.<path>` becomes the NUMBER at that path of the
 * target's roll data, 0 when unreadable — the smaller-heal direction, never a crash. Owner-scoped
 * refs pass through untouched for the Roll to resolve. Self-contained path walk on purpose: it
 * must run in the node test harness with no foundry.utils. */
function edhaTargetFormula(formula, targetData, recoveryDie) {
  let f = String(formula ?? "");
  f = f.replace(/@target\.recoveryDie\b/g, String(recoveryDie || "0"));
  f = f.replace(/@target\.([a-zA-Z0-9_.]+)/g, (m, p) => {
    let v = targetData;
    for (const k of p.split(".")) { if (v === undefined || v === null) break; v = v?.[k]; }
    const n = Number(v);
    return Number.isFinite(n) ? String(n) : "0";
  });
  return f;
}
/* The recovery-die read, ONE path (2bZ — it was duplicated inline in two heroic hooks, both ⚑).
 * Normalisation is pure + pinned (tests/); the READ itself stays ⚑ BENCH-UNVERIFIED: nothing in
 * this repo can confirm where cosmere-rpg 2.1.0 stores the die (`system.recovery.die[.value]`)
 * without the live install. The d8 default mirrors the retired inline code — and unlike it, an
 * object-shaped die field now degrades to the default instead of feeding "[object Object]" to
 * the Roll parser. */
function edhaNormalizeDie(raw, fallback = "1d8") {
  const s = String(raw ?? "").trim().toLowerCase();
  if (/^d\d+$/.test(s)) return `1${s}`;
  if (/^\d+d\d+$/.test(s)) return s;
  return fallback;
}
function edhaRecoveryDie(actor) {
  return edhaNormalizeDie(actor?.system?.recovery?.die?.value ?? actor?.system?.recovery?.die);   // ⚑ recovery-die path unverified in Foundry
}
function edhaConsumeList(item) {
  return (item?.system?.activation?.consume || []).filter(c => c?.type === "resource" && c.resource)
    .map(c => ({ resource: c.resource, amount: Number(c.value?.min ?? c.value?.actual ?? c.value ?? 0) || 0 }))
    .filter(c => c.amount > 0);
}
// Deduct the talent's activation cost; returns false (and warns) if the actor can't pay.
function edhaConsumeCost(item) {
  try {
    const actor = item?.actor; const list = edhaConsumeList(item);
    for (const c of list) {
      const cur = Number(foundry.utils.getProperty(actor, `system.resources.${c.resource}.value`)) || 0;
      if (cur < c.amount) { ui.notifications?.warn(`Edha: ${actor.name} needs ${c.amount} ${EDHA_RES_LABEL[c.resource] || c.resource} for ${item.name}.`); return false; }
    }
    const updates = {};
    for (const c of list) {
      const cur = Number(foundry.utils.getProperty(actor, `system.resources.${c.resource}.value`)) || 0;
      updates[`system.resources.${c.resource}.value`] = Math.max(0, cur - c.amount);
    }
    // #28b: the takeover path's activation cost is a spend as much as edhaSpendResource's is.
    if (Object.keys(updates).length) actor.update(updates, edhaSpendTag("edhaConsumeCost"));
    return true;
  } catch (e) { console.error("Edha Content | burst consume failed", e); return true; }
}
/* Click-place a summon/barrier within Attunement Range (2bAA) — the Fate/Bone-Garden convention
 * factored out: range ring, picker, and a REFUND on cancel or an out-of-range pick, because the
 * system has already charged the cost by the time an executor runs. Returns a grid-snapped CENTRE
 * {x, y} or null, in which case the caller has already been warned and refunded. `color` blank and
 * `rangeFt` 0 means no range gate at all — place anywhere on the scene. */
async function edhaPickPlacement(item, { color = "", rangeFt = 0 } = {}) {
  const owner = item?.actor; const scene = canvas?.scene;
  if (!owner) return null;
  if (!scene) { edhaRefundCost(item); ui.notifications?.warn(`Edha: need an active scene for ${item.name} — cost refunded.`); return null; }
  const tok = edhaCasterToken(owner);
  const ft = Number(rangeFt) > 0 ? Number(rangeFt)
    : (color ? (EDHA_ATTUNE_FT[edhaColorRank(owner, color) || 1] || EDHA_ATTUNE_FT[1]) : 0);
  const gd = scene.grid?.distance || 5, gs = scene.grid?.size || 100;
  let ring = null;
  if (tok && ft > 0) { try { ring = await edhaDrawCircle(tok.center.x, tok.center.y, ft, EDHA_RANGE_RING_HEX, 0); } catch (e) {} }
  const pt = await edhaPickPoint(`Click the square for ${item.name} (right-click to cancel).${ft > 0 ? ` Attunement Range ${ft} ft.` : ""}`);
  try { if (ring) await ring.delete(); } catch (e) {}
  if (!pt) { edhaRefundCost(item); ui.notifications?.info(`${item.name} canceled — cost refunded.`); return null; }
  if (ft > 0 && tok && Math.hypot(pt.x - tok.center.x, pt.y - tok.center.y) / gs * gd > ft + gd / 2) {
    edhaRefundCost(item); ui.notifications?.warn(`Edha: that square is beyond Attunement Range (${ft} ft) — cost refunded.`); return null;
  }
  return pt;
}
