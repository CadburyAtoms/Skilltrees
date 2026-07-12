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

## Per-actor persistent state
- Pattern: `actor.getFlag("edha-content", key)` / `setFlag` / `unsetFlag` (examples: `reserve`,
  `afflictions`, `charges`). Clear at scene/combat end: `Hooks.on("deleteCombat", ...)` (see
  `edhaClearCharges`, `edhaClearKindleLights`).

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
