# Engine primitives index (`module-src/scripts/register-skills.js`)

Read this instead of re-scanning the 11,000+-line engine. Find code by **grepping the function name**
(line numbers drift). Helpers are `function` declarations (hoisted) — callable from anywhere.
**Destruction's section is the worked example** for a deity "signature subsystem"; mirror it.

## Dispatch — how a talent's behavior runs
- **`preUseItem` takeover** — `Hooks.on("cosmere-rpg.preUseItem", ...)` returning **`false`** cancels the
  system's default use (no card, no auto-roll). Use it for click-to-place / fully-custom talents; you
  then pay the cost yourself (`edhaConsumeCost`, refund on cancel). Burst talents + the whole
  Destruction tree do this.
- **`useItem` name-based** — `Hooks.on("cosmere-rpg.useItem", ...)` runs AFTER the default card +
  cost deduction; add riders here (Green Grasping Vines/Territorial Instinct). Don't double-deduct.
- **Native authored-event handlers** — a talent's `events` rule runs its handler (`edha-burst`,
  `edha-place-hazard`, `edha-triggered-effect`, …). `edhaRuleOf(item, type)` reads the first rule of a
  type; `edhaEventRules(item)` lists them.

## Damage / heal application
- **`edhaApplyBurstResults({ hits, terrain, casterActorUuid })`** — the canonical privileged-write path.
  `hits = [{ actorUuid, amount, type, heal }]`. GM applies directly; **players must relay**:
  `game.socket.emit("module.edha-content", { action: "burst-apply", payload })`. `edhaSource` attribution
  flows for Kindle.
- **`edhaCastBurst(item, spec)` / `edhaBurstDetonate(pid)`** — click-to-place AoE template + Detonate card
  (capture-under-template, roll once, apply, optional Athletics-vs-color save, optional terrain).
  `edhaBurstSpecFromCfg(h)` maps a flat `edha-burst` rule → spec.

## Dangerous terrain (Foundry v13 Region + hazard behavior)
- **`edhaDropHazard(owner, scene, shape, formulaRaw, type, color, label)`** (Destruction) — bakes the
  formula vs the owner, then GM-writes or relays (`action:"place-hazard-region"`). `shape` is a Region
  shape: `{type:"circle",x,y,radius}` or `{type:"rectangle",x,y,width,height,rotation}`.
- **`edhaPlaceHazardRegionGM(...)`** — the GM-side Region create + visual. **`edhaPlaceHazard(item,cfg)`**
  is the `edha-place-hazard` handler (circle only).
- **`EdhaHazardRegionBehavior`** (`edha-content.hazard`) — applies `damageFormula`/`damageType` on
  `tokenEnter`/`tokenTurnStart`. **`edhaHazardVisual(...)`** draws the player-visible overlay.
- **Ownership/membership:** Regions carry `flags.edha-content.terrain = {ownerUuid, color}`.
  `edhaOwnedTerrainRegions(owner, scene)`, `edhaPointInRegion(region,x,y)`,
  `edhaTokenInOwnedTerrain(tok, owner)`, `edhaEnemiesInOwnedTerrain(owner)`. No merge/union exists.
- **Square terrain toolkit (07-12f)** — Pyre + Green terrain are Foundation-shaped SQUARES (Regions
  hold multiple `rectangle` shapes). `edhaSnapCellRect(scene,x,y,cells)` (grid-snapped cell rect),
  `edhaSquareVisual(...)`, `edhaGrowTerrainSquareGM(sceneId,regionId,x,y)` (adds ONE adjacent grid
  cell + visual; validates adjacency/coverage), `edhaRemoveTerrain(sceneId,regionId)` (player-safe
  extinguish via the `remove-terrain` relay). `edhaPointInRegion`/`edhaGrowTerrain` handle rects.
  Set Charge hazards stay circles. Pyre spread card whispers GM+owner; the GM click-places.

## Contests — opposed test vs another creature's SKILL (engine rolls the foe)
```js
edhaQueueContest(owner, "<color>", async ({ total }) => {   // captures the owner's NEXT roll total
  const opp = await edhaRollOpposedSkill(target, "ath");    // rolls the foe's skill (1d20 + rank + attr)
  if (total >= opp) await edhaApplyTimedStatus(target, "slowed", { owner, expire: "target" });
});
```
- vs a static **defense**: `edhaReadDefense(actor, "phy"|"cog"|"spi")` (no foe roll needed).
- `edhaPromptDC(title,hint)`, `edhaRewriteOrRelay(...)` for GM-DC / roll-rewrite cases.
- **No owner roll to capture** (a passive that fires on an event)? Roll the DC yourself and roll each
  foe — see `edhaSpeedVsRedProne` (Destruction): `1d20 + @skills.red.mod` DC, each foe rolls Speed.

## Statuses
- **`edhaApplyTimedStatus(target, statusId, { owner, expire })`** — applies + stamps owner/target-relative
  auto-expiry (`expire:"owner"|"target"`). For NON-expiring (e.g. Prone) use **`edhaToggleStatus(target,
  statusId, true)`** (owner→toggle, else socket `toggle-status`).
- **Status ids are core, lowercase:** `prone`, `slowed`, `immobilized`, `restrained`, `stunned`,
  `surprised`. Custom Edha: `weakened`, `diagnosed`, `insight`, `doubledipped` (Double Dip's visible
  scene mark, 07-12 — toggled with the `doubleDipBy` flag, cleared with it at scene end) + the full
  `EDHA_STATUSES` table. Timed set: `EDHA_TIMED_STATUSES = {weakened, immobilized, slowed, noactions,
  noreactions}`.

## Token movement (engine slides/pushes — all stamp `options.edhaForced`)
- **`edhaRunMove(item, cfg)`** — `edha-move` executor: slide the CASTER toward their target
  (`bySize`/`byHalfSpeed`/`distanceFt`; `oncePerTurn`; **`requireTargetIsolated`** gate, 07-12 —
  warn + no move unless the target is Isolated). Consumers: Red movement pilot, **Cruel Step**.
- **`edhaApplyMove(tok, destCenter, maxFt, {gapPx})`** → `edhaComputeMove` (wall-collision clamp) →
  `edhaMoveTokenTo` (owner-direct or GM socket `move-token`). Push AWAY from an arbitrary origin by
  aiming past the victim along origin→victim (see `edhaUnnerveClick`, 07-12 — Unnerving Approach's
  prompt-card push away from YOUR TARGET, not from the caster).
- **Prompt-card pattern** for pick-one-token effects: whispered `.edha-trigger-card` with per-candidate
  buttons carrying uuids in data attrs; a `renderChatMessageHTML` binder wires clicks; disable all
  buttons after one click (Beacon/Unnerve are the worked examples). Shared CSS (edha.css §H) makes
  long button labels wrap — don't inline-style new cards.

## Token movement additions (07-12d)
- **`edhaTokenAtDest(movingTok, center)`** — another visible token occupies the destination?
  `edhaComputeMove(origin, aim, maxFt, movingTok)` backsteps to the last free square when given the
  mover (Ben R2: engine moves never stack; manual drags unpoliced).
- **`edhaMoveTokenTo(tok, center, {teleport:true})`** — v13 `doc.move({action:"displace"})`
  unconstrained teleport (walls ignored, no walk animation); the GM `move-token` relay honors it.
  Plain calls stay walk-animated slides.
- **Adjacency-AE sweep pattern** — `edhaGuardianStanceSweep` (debounced on token create/move/delete):
  GM-side, derives who should carry a positional AE and applies/removes the diff. Reuse for any
  "while adjacent/within X" passive.

## Per-actor persistent state
- Pattern: `actor.getFlag("edha-content", key)` / `setFlag` / `unsetFlag` (examples: `reserve`,
  `afflictions`, `charges`). Clear at scene/combat end: `Hooks.on("deleteCombat", ...)` (see
  `edhaClearCharges`, `edhaClearKindleLights`).
- **`edhaSetEdhaFlag(actor, key, value)`** — the generic write with the GM `set-flag` relay
  (value `null` clears). Use it instead of hand-rolling isOwner/socket splits.
- **`edhaRoundWindowValid(mark, combat)`** — is a `{round, combatId}` window still open? Armed
  out of combat = open until consumed; in combat = that combat's same round only. Pinned in tests/.

## Designate / plot-die / round-window primitives (White Coordination tools — 07-14)
- **`edhaPostDesignateCard(owner, name, {color, note})`** — "designate a character" card: buttons
  for OPPOSING tokens within Attunement Range; click stores `plotDieMark` on the DESIGNATOR
  (`{target, targetName, source, round, combatId}`) via `edhaDesignateClick`. Guiding Signal is
  consumer #1; any "mark an enemy, reward allies engaging it" talent is one call.
- **Mark consumption** rides the plot-die pair (`edhaPlotDiePreRoll`/`Consume`): the first
  SAME-SIDE roller whose user-targets include the marked token gets the Plot Die injected
  (`edhaFindMarkGrant`), and the mark clears (GM relay). Round-scoped by `edhaRoundWindowValid`.
- **`edhaPostPlotGrantCard(...)`** — the direct pick-an-ally grant (Concordant Presence). Empty
  sweeps now explain WHY via **`edhaSweepEmptyNote(owner, ft, sameSide)`** (no token on scene /
  nearest candidate + distance) — use it for every in-range card's empty branch (07-12b rule).
- **Ordered Advance window** — `useItem` arms `orderedAdvance` `{round, combatId}`; the
  `updateToken` watcher (initiating client only, skips `edhaForcedMove`) posts the allies-within-
  10-ft card with each ally's **`edhaHalfSpeed(actor)`** (reads `.value` PC / `.override`
  adversary, 2.5-ft floor). Reuse the flag+watcher shape for any "when I move, allies may X".
- **`edhaNextTokenName(proposed, existingNames)`** + the `preCreateToken` renumber hook — core
  `appendNumber` counts by world actorId, so compendium re-drops all land "(1)"; the hook
  re-numbers by NAME pattern on collision. Pure resolver pinned in tests/.

## Targeting / costs / math utils
- `edhaPickPoint(prompt)` → grid-snapped `{x,y}` or null (click-to-place). `edhaTokensInCircle(cx,cy,ft)`,
  `edhaEnemyTokensInCircle(owner,cx,cy,ft)` (Destruction). `edhaCasterToken(actor)`, `edhaColorRank(actor,"red")`.
- `edhaConsumeCost(item)` (reads `activation.consume`; false if can't pay) / `edhaRefundCost(item)`.
- `edhaEvalSync("@tier", rd)` (flat eval), `edhaFtToPx(ft)`, `edhaWhisperIds(owner)`,
  `edhaCharacterOwnersOf(name)`, `edhaOwnsTalent(actor,name)`.
- Consts: `EDHA_SIZE_FT`, `EDHA_ATTUNE_FT` (index = color rank), `EDHA_COLOR_HEX`.
- **`edhaCanSee(viewerTok, targetTok)`** — line of sight: GM-**hidden** target = never seen; else a
  walls-only sight ray (v13's darkness-source + scene-border edges explicitly excluded — bench-probed
  07-12). Deliberately ignores vision RANGE/lighting (senses rules: normal conditions = assumed seen).
  Fails open. With `edha.debug` on it logs WHY a check failed (hidden vs wall). Consumers: Black
  Attunement sweep, Lawkeeper's Eye, Packmate's Warning.

## Chat-card conventions (one-shot buttons, single-target, trigger cards)
- **`edhaMarkCardResolved(messageId, label)`** — stamp a one-shot card resolved ON the message (flag +
  GM relay); a render hook re-disables its buttons and relabels the first, on every client, across
  refreshes. `edhaMessageIdOf(btn)` gets the id inside a click handler. Wired: bursts, Unnerving push,
  trigger cards, the single-target picker. Do NOT wire cards that are re-clickable by design.
- **Single-target gate** — add the talent name to `EDHA_SINGLE_TARGET`; with >1 user target the use
  cancels pre-cost and a whispered picker card retargets + re-uses (Ben R1: prompt, never block).
- **Trigger-card `effect.nextTestMod`** — `{mode, skill, attr}` on a trigger spec arms
  `edhaSetNextTestMod` on click (Flashpoint's enforced advantage). The "Target the creature" line
  only renders when `effect.target` actually reads user targets.
- **`edhaRiderParts(item, actor)`** — damage-rider components as `[{formula, name}]`; `edhaRiderBonus`
  joins them flavor-labeled (`(...)[Talent]`) so rolls/cards name every bonus. Burst cards print the
  full breakdown line.

## Roll-context / rule-id gotchas (07-12f)
- **`edhaTestCtxMatch(appliesTo, rawCtx, sourceHasDamage)`** — the appliesTo gate for
  `edha-test-rider` rules, CASE-NORMALIZED: the system's `config.data.context` is capitalized
  (`'Skill' | 'Attack' | 'Item'`), authored `appliesTo` is lowercase. A raw `===` killed the
  Predatory Patience die on every roll. "attack" also matches a damage-carrying Item roll. Pure;
  pinned in `tests/`.
- **Authored event-rule ids are Foundry `DocumentIdField`s** — EXACTLY 16 alphanumeric chars, or the
  system SILENTLY drops the rule at load (console DataModelValidationError only; the Events tab still
  shows the raw data). Cost Cruel Step + Sudden Growth multiple passes. `lint-refs.js` now gates id
  format + key↔id mismatch.
- **`edhaTidyFormula(str)`** — display normalizer on every `.dice-formula` chat bar: spaces operators,
  drops unmatched `)`, ignores flavor `[labels]`. Fixes the `2d20kh+6)` garble (`Roll.getFormula`
  joins terms with no separators; a stray `)` rides in via the roll dialog's Temporary Bonus).

## Test-debug tracer (edha.debug)
- **`edha.debug(true)`** — every edha handler logs `[EDHA-TEST]` as it fires (hook, handler@regLine,
  args, throws, false-returns, GM-relay socket arrivals). Persists across F5; `edha.debug(false)` stops.
- **`edha.debugSave()`** — downloads the FULL session's tracer lines as a file (in-memory buffer,
  50k lines, timestamped). Use this for test-pass evidence — the browser console only retains the
  last ~1000 lines logged while DevTools is closed, which truncated both 07-12 pass-3 logs.
- **Sweep-transparency convention (07-12b):** an area sweep that FILTERS targets (Draw Mana Black)
  must account for every candidate on its chat card, by skip reason ("skipped 2 hidden, …") — silent
  filtering cost a full bench cycle when hidden tokens gated the Weaken.

## Damage formula convention
`(@tier)d(2 * @skills.<color>.rank + 2)` = **[Tier][Die]**. Bake with
`Roll.replaceFormulaData(formula, actor.getRollData(), { missing: "0" })`. `color:"red"` on a handler
picks the rank/range/tint. Items already carry their formula — read `item.system.damage.formula`.

## Talents on adversaries (W23 pipeline — facts before you wire one)
- **Embeds are ACTION-TYPED TWINS, not talent-type docs** (07-14 pipe-cleaner outcome: the
  adversary sheet's `AdversaryActionsListComponent` renders exactly three sections —
  trait/weapon/action, filtered by `item.type` — so a `talent`-type embed is INVISIBLE on the
  sheet). foundry-build copies the built talent's name/img/description/activation/damage/events/
  effects onto an `action`-type doc (`system.type:"basic"`; the action DataModel carries the same
  Activatable/Damaging/Modality/Events mixins) flagged `edha-content.adversaryTalent: true`.
- **`edhaIsTalent(item)`** is the ownership predicate: `type === "talent"` OR the adversaryTalent
  flag. `edhaOwnsTalent` and every owner/caster item-by-name lookup go through it (pinned in
  `tests/engine-helpers.test.js`). `edhaCountTalents` (PC talent budget) stays type-strict on
  purpose — twins never count. `validate-adversaries.js` hard-fails any talent-TYPED embed.
- **Use-hook automation works as-is**: `preUseItem`/`useItem` name-based handlers key off the item
  name + `edhaOwnsTalent(actor, …)`, both actor-type-agnostic. Flag writes are GM-direct for
  GM-owned actors; `edhaAlliesInAttune` is disposition-based (an adversary's "allies" are its side).
- **Sweep/watcher automation does NOT reach adversaries**: ~20 sites iterate
  `game.actors.filter(a => a.type === "character")` (incl. `edhaCharacterOwnersOf`). A talent whose
  behavior lives in such a sweep is inert on an adversary — audit the talent's engine path BEFORE
  embedding it; extend the specific consumer only when a block actually needs it.
- **Ranks**: talent formulas read `@skills.<color>.rank` — the build writes leyline ranks from
  `leylines` + role (minion 1 / rival 2 / boss 3, ruling 40). Adversary attributes stay 0, so rolled
  color tests run at +rank only (deliberate; revisit per-block).
- **Full leyline economy (ruling 49, Ben 07-14)**: each `leylines` color auto-embeds its
  "<Color> Leyline Attunement" Key (twin) and the actor gets the universal **Draw Mana** action —
  the engine rider (`edhaDrawMana`) is name-triggered and disposition-based, so it runs unchanged
  on adversaries (White heals ITS side, Black weakens the PCs). The `inv` pool DEFAULTS for
  attuned blocks to the PC derivation 2 + max(awa, pre) = 2 (attributes 0); explicit `inv` wins.
- Investiture derivation is PCs-only by design (`register-skills.js` ~L11099) — adversary `inv` is a
  plain override pool from the data file.

## Engine facts (so you don't re-derive them)
- **Ignore deflect** = bump the hit by `Number(target.system.deflect.value)` (applyDamage subtracts
  deflect on energy/impact/keen, so adding it back nets to ignoring it).
- **Construct** = `String(actor.system.customType).toLowerCase() === "construct"`.
- **"Fires when X drops to 0"** = the GM-side defeat hook `Hooks.on("updateActor", ...)` on
  `system.resources.hea.value <= 0` (the defeated-overlay + Combustion Chain both ride it).
- **Multi-client gotcha:** `updateToken`/`updateActor`/socket handlers fire on EVERY client. Any
  Region/damage write must run on ONE applier — gate with
  `if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;` or relay via
  socket. `preUseItem` fires only on the using client (safe to write/relay from there).
