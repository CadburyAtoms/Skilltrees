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

## The illusion belief loop (Blue Illusion tools — 07-14o; Phantom Double + The Seeming)
- **`edhaCastPhantomDouble(caster, dup, {source})`** — the whole loop: clears the old copy (max 1),
  summons a 1-HP twin ADJACENT to `dup`'s token (`edhaSummon` specs `anchorTok` + `disposition` —
  a hostile caster's copy is hostile-side), bakes the caster's **Cognitive defense** into the
  copy's flags (`phantomDC`/`phantomOf`/`phantomSource`). Any "decoy/illusory duplicate" talent
  is one call.
- **`edhaPhantomBeliefSweep(copyTokenDoc)`** — runs on the ACTIVE GM's client via `createToken`
  (summons can materialize through the GM relay): every enemy that CAN SEE the copy rolls
  Perception vs the baked DC; per-observer fooled/saw persists on `phantomBelief`; GM card with
  **`edha-illusion-retest`** button (late viewers roll incrementally); players whispered their own
  truth; public card = counts.
- **THE CLIENT VEIL** — true per-viewer visibility (Ben's table: one PC per computer): a
  `Token#isVisible` getter wrap (init-time, proto-chain walk, fail-open) filters each PLAYER
  client through the belief flag — fooled clients don't render the ORIGINAL, seer clients don't
  render the COPY, the GM renders everything; no token document is ever hidden. Pure decision
  **`edhaPhantomVeilHides(belief, ownedUuids, tokUuid, origUuid, copyTokUuid)`** (pinned in
  tests/); belief writes + copy deletion fire `canvas.perception.update` on every client. The
  copy's token wears the original's PLAIN name (`edhaSummon` `tokenName` spec — the actor name
  keeps "(Illusion)" for the GM directory). Reach for the veil for ANY future
  what-each-side-believes mechanic.
- **Break** — copy death (HP-sync) or deletion (`deleteActor`/`deleteToken`, `_edhaPhantomRestored`
  guard) announces; the veil dies with the copy's flags. No advantage rider (dropped, Ben 07-14).

## Targeting / costs / math utils
- `edhaPickPoint(prompt)` → grid-snapped `{x,y}` or null (click-to-place). `edhaTokensInCircle(cx,cy,ft)`,
  `edhaEnemyTokensInCircle(owner,cx,cy,ft)` (Destruction). `edhaCasterToken(actor)`, `edhaColorRank(actor,"red")`.
- `edhaConsumeCost(item)` (reads `activation.consume`; false if can't pay) / `edhaRefundCost(item)`.
- `edhaEvalSync("@tier", rd)` (flat eval), `edhaFtToPx(ft)`, `edhaWhisperIds(owner)`,
  `edhaCharacterOwnersOf(name)`, `edhaOwnsTalent(actor,name)`.
- Consts: `EDHA_SIZE_FT`, `EDHA_ATTUNE_FT` (index = color rank), `EDHA_COLOR_HEX`.
- **`edhaCanSee(viewerTok, targetTok)`** — line of sight: GM-**hidden** target = never seen; a
  walls-only sight ray (v13's darkness-source + scene-border edges excluded — bench-probed 07-12);
  and THE SIGHT RULE (Ben 07-16c, supersedes R4's GM-judged clause): an UNLIT target is seen only
  within the viewer's Senses Range. Fails open; `edha.debug` logs WHY (hidden / wall / darkness).
  Consumers: Black Attunement sweep, Lawkeeper's Eye, Packmate's Warning, the belief sweep.
- **`edhaPointIlluminated(x, y)`** — is a scene point lit? Global light at/below its darkness
  threshold, darkness < 0.5 (⚑ feel dial), or inside any active light polygon (ambient + token
  emitters). Fails open (lit). Also drives `edha-dark-veil`.
- **`edhaSensesRangeFt(actor)` / `edhaSensesRangeFtFromAwa(awa)`** — Senses Range ft: the system's
  derived value when present, else the AWA table (0→10 · 1→15 · 2–3→20 · 4→25 · 5+→30; pinned).
  The build writes adversary token `sight.range` from it (per-block `senses` field wins) — Foundry
  natively renders lit areas beyond sight.range, so token vision IS the rule with no module code.
- **The aggro ledger** — every damaging item roll records the attacker TOKEN's last target
  (`aggro` flag, post-roll so an attack never counts itself; cleared at combat end). Solves the
  "GM owns every adversary, targeting is per-user" problem. **`edha-pack-advantage`** (sentinel):
  attacking a creature a LIVING same-item packmate last attacked → advantage injected pre-roll,
  whispered card names the packmate. Pack Tactics = consumer #1; any pack/mob block is one rule.
- **`edha-dark-veil`** (sentinel; `effectName`): the named marker AE auto-enables while the
  owner's token stands unlit, releases when lit; a MANUAL toggle (cover) is never fought
  (autoVeil flag discriminates). Stalker Veil = consumer #1.
- **`edhaSenseRevealShows(tok)`** — the client-veil wrap's force-SHOW half: tokens bearing a
  status in `EDHA_SENSE_REVEALS` render to clients owning the paired talent (Void Sense → omen,
  Reaper's Harvest → harvested) through walls/fog; GM-hidden always wins. Add a pair to the
  table for any future sense-through mechanic.
- **`edhaHostileMove`** — pushes/pulls AGAINST volition stamp `options.edhaHostileMove` (threaded
  edhaRunPush/Unnerve → edhaApplyMove `{hostile}` → edhaMoveTokenTo → the move-token relay);
  willing engine slides stamp only `edhaForced`. Dense Tissue's immunity vetoes on it — reach for
  the same stamp for any future forced-movement immunity.
- **Kneel enforcement** — `kneelBy` stamp + a preUpdateToken veto: while Compelled, only
  distance-closing willing moves pass (stamp dies with the status). The pattern for any
  "may only move toward X" compulsion.
- **Set Charge trigger arms** — the arm card writes `trig {kind, targetUuid}` onto the charge
  record; updateToken + applyDamage watchers whisper a Detonate prompt (same `edha-charge-btn`
  machinery); one prompt per arm; "enter" checks move ENDPOINTS only.

## Chat-card conventions (one-shot buttons, single-target, trigger cards)
- **`edhaMarkCardResolved(messageId, label)`** — stamp a one-shot card resolved ON the message (flag +
  GM relay); a render hook re-disables its buttons and relabels the first, on every client, across
  refreshes. `edhaMessageIdOf(btn)` gets the id inside a click handler. Wired: bursts, Unnerving push,
  trigger cards, the single-target picker. Do NOT wire cards that are re-clickable by design.
- **`edhaPostGmCard(actor, htmlContent)`** — post a GM-ONLY whispered card that must never reach a
  player. A whisper is ALWAYS visible to its author, so a card a player authored would show them
  exactly what it means to hide; this creates it on the GM client instead (direct if we're the GM,
  else the `gm-card` socket relay; no GM online → nothing posted). Reach for it whenever engine code
  that runs on the USING client (Draw Mana, any name-based useItem hook) needs to tell the GM
  something the player must not see. First consumer: Black Draw Mana's behind-a-wall / hidden sweep.
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
  **Bespoke `adv.items` abilities (trait/action kinds) carry the SAME flag since 07-16** —
  weapons stay unflagged (equipment, not talents). Since the 07-18 fleet migration, every gear
  attack and natural weapon is a weapon-KIND item (native target + test-defense; natural weapons
  `alwaysEquipped`); summon attacks (Construct Slam, Siege Cannon) build the same way.
- **`edhaIsTalent(item)`** is the ownership predicate: `type === "talent"` OR the adversaryTalent
  flag. `edhaOwnsTalent` and every owner/caster item-by-name lookup go through it (pinned in
  `tests/engine-helpers.test.js`). `edhaCountTalents` (PC talent budget) stays type-strict on
  purpose — twins never count. `validate-adversaries.js` hard-fails any talent-TYPED embed.
- **`edhaRuleBearer(item)`** (07-18, the fleet weapon migration) is the HARVEST predicate:
  `edhaIsTalent(item)` OR any weapon-type item. The passive-rule harvest loops that read rules
  from an actor's co-items — `edhaRiderParts` (damage riders) and `edhaLightSpecFor` (Kindle
  light) — gate on THIS, because migrated attacks (Spearing Beak's whenTargetFooled +1d6, Bite's
  light rider, Scalpel-Strike's whenTargetStatus +4) carry their rules ON the weapon, and weapons
  are deliberately NOT adversaryTalent-flagged. Any NEW harvest-style loop must use it too, or
  weapon-borne riders die silently (pinned in tests). Name-keyed useItem automation still goes
  through `edhaIsTalent` — a weapon needing that is a design smell to surface, not silently flag.
- **`edhaAttackKind(item)`** (melee/ranged discriminator) reads: the `attackKind` flag stamp →
  a weapon's **`system.attack.type`** (dump-verified DataModel field, stamped on every built
  adversary/summon weapon — DEFINITIVE, the old ⚑ range-shape guess retired 07-18) → a legacy
  range-shaped fallback → null = owner-judged.
- **Every talent gate goes through `edhaIsTalent` — enforced by lint** (07-16; The Seeming's
  engine case was UNREACHABLE for two days behind a raw `item.type !== "talent"` useItem gate).
  All useItem/preUseItem hook gates AND the authored-rule iterators (test-riders, damage-riders,
  on-hit, opportunities, rally, def-buffs) are flag-aware; `lint-refs.js` pass 4 FAILS any new
  raw talent-type comparison unless the line carries a `type-strict: <reason>` marker (budget /
  pack scans / ⟳ Sync are the deliberate strict sites). Flag writes are GM-direct for GM-owned
  actors; `edhaAlliesInAttune` is disposition-based (an adversary's "allies" are its side).
- **Bespoke abilities carry native event rules** (07-16): author a SIMPLIFIED array on the
  adversaries.json item — `"events": [{event, handler, description?}]` — and the build mints the
  DataModel map with deterministic 16-char `fid()` ids (never hand-author ids or the map form).
  Same edha-* vocabulary as PC talents; lint-refs cross-checks adversary handler types/kinds/
  statusIds against the engine, and adversary ability names join the resolvable-name universe.
  **This is how adversary ability text becomes hooks instead of rotting as prose.**
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
- **Adversary pack sync (07-18b) — the per-deploy re-drag is retired**: `edhaSyncAllAdversaries()`
  (GM; the "⟳ Sync Adversaries from Pack" button in the Actors-sidebar footer, or `edha.
  syncAllAdversaries()`) + `edhaSyncAdversaryActor(actor)` (the sheet's "⟳ Sync from Pack" bar).
  Re-pulls a world adversary from the edha-adversaries pack IN PLACE, keeping its actor id so
  placed tokens stay attached (position/HP/deltas kept): pack-built items (edha-content-flagged or
  source-colliding) delete + re-create with their deterministic `fid` ids (token-delta references
  keep resolving; hand-added items survive — pure decision **`edhaAdvSyncPlan`**, pinned),
  `system`+`prototypeToken` replace WHOLESALE (recursive:false), and the prototype's token-level
  fields (texture/sight/disposition/bars/size) PUSH onto every placed token — vision/art changes
  land without re-placing. Match: `_stats.compendiumSource` → name (both stable — build ids are
  deterministic). Bulk skips RENAMED world copies (customized variants; their sheet button syncs
  explicitly). Deploy notes now say "⟳ Sync Adversaries" where they used to say "re-drag".

## GM cue cards (07-16 — adversary reactions/morale at their named hooks)
- **`edha-gm-cue`** (event `edha-apply-watch`; on-hit cues ride event `edha-on-hit`): a whispered
  GM reminder card the moment a nameable trigger crosses — the decision (reaction cost, morale,
  movement) stays at the table. Triggers: `"damaged"` · `"hp-below"` `{atFraction}` (crossing
  maxHp×fraction on THIS write; `0` = the drop; pure decision **`edhaCueCrossed`**, pinned) ·
  `"ally-drops"` `{rangeFt}` (same-side creature hit 0; 0/absent = whole scene) ·
  `"seeming-break"` (dispatched from the phantom restore path) · `"on-hit"` (item-specific, via
  `edhaDispatchOnHit`) · `"enemy-turn-start"` `{rangeFt}` (a hostile starts its turn in range —
  Reactive Strike; per-ACTION cues would spam) · `"turn-end"` `{everyNRounds}` (end of the
  owner's own turn on matching rounds — Glyph Pulse). Turn triggers ride `combatTurnChange`,
  one GM client (`edhaTurnCueSweep`). `oncePerRound` defaults ON (the `trigRound` gate). Author
  the cost into the `note` ("Reaction, 1 Focus — …"). Consumers: Fade, Break ×2, Cover Their
  Retreat, Press the Line, morale traits, Reactive Strike, Glyph Pulse, Phase 2, Devastating
  Blow's margin-Prone, Stalker Fade. **Iron-rule-3 corollary: text that names a hook gets a
  cue — a bare 'GM-run' label fails `lint-refs` pass 5.** ⚠ HANDLER REGISTRATION IS LOAD-BEARING:
  an unregistered handler type is silently dropped by the DataModel (same class as a bad rule id).
- **`whenTargetFooled`** on `edha-damage-rider`: the bonus injects only when the current target
  is taken in by the roller's active seeming (**`edhaTargetFooled`** reads the copy's
  `phantomBelief.fooled` token uuids; pure decision **`edhaTargetFooledIn`**, pinned). First
  consumer: Spearing Beak's `+1d6[Spearing Beak]`. Any strike-the-believer talent is one rule.

## Playtest-pass primitives (07-16b — the original-9 wiring)
- **`edha-self-status`** (event `use`): on use, the user gains `statusId` — `timed: true` (default)
  stamps owner-relative expiry, false = until removed. Consumers: Trooper/Captain **Brace** →
  the new **`braced`** status (condition, visible icon; DELIBERATELY not in `EDHA_TIMED_STATUSES`
  so Predictive Ward's permanent baked-AE marker never auto-expires).
- **`edha-next-test-mod`** (event `use`): the current user-target's next test gains `mode`
  (advantage/disadvantage) and/or a `formula` modifier (Probability Net's `-1d6`), counted.
  `nextTestMod.formula` injects via the same term-concat as test riders, flavor-labeled; a
  formula-only mod no longer forces disadvantage (the mode block is gated).
- **`edha-thorns`** (sentinel on `edha-apply-watch`): melee/adjacent attackers who damage the
  owner take the splash automatically — rolled, applied with `{edhaThorns: true}` chain guard.
  Consumer: Cinder Coat. `edhaTokenGapFt(a, b)` is the shared center-distance helper.
- **`statusExpire`** (`"owner"`/`"target"`) on `edha-triggered-effect` kind `status`: timed stamp
  instead of a permanent toggle. Consumer: Frost Lance (Slowed until the TARGET's next turn ends).
- **`diagrammed`** status: the Stitchmother's Vital Diagram mark — applied on use via
  `edha-apply-status`, read by Scalpel-Strike's `whenTargetStatus` +4 rider. Scene-long, GM-cleared.
- **Suture Cradle watcher** (name-keyed): use with a target → cradle flag on the cradler
  (token-actor safe); every hit the target takes auto-rolls the cradler's Discipline vs
  DC 10 + damage (contest core) — keep or the cradle ends. Cleared on combat end.
- **Per-token phantom ownership**: copies carry `phantomCasterTok`; `edhaPhantomOwnedBy` (pure,
  pinned) keys clear-on-recast / `edhaTargetFooled` / the seeming-break cue by CASTER TOKEN, with
  actor-id fallback — two unlinked Mistherons sharing a world actor each own their own seeming.

## Bench-results-pass primitives (07-17c)
- **`edhaSetUserTargets(tokens)`** — set the local user's targets. Foundry v13 REMOVED
  `User#updateTokenTargets`; this wraps `Token#setTarget` (first token releases the old set,
  empty list clears). EVERY engine retarget goes through it — never call a core targeting API
  directly again. Consumers: the single-target picker, the AoE burst capture.
- **DamageRoll graze-clone guard** (patched at ready on the registered class): system 2.1.0
  builds a graze roll from `@damage.dice` (a clone stripped of non-dice terms) and
  `replaceDieResults` copies BY INDEX from the full hit roll — an engine-INJECTED rider die
  overran the clone and the TypeError killed `use()` silently. The guard copies only into dice
  that exist; the rider (a hit bonus) stays out of graze. ⚠ FACT: anything that ADDS dice to a
  damage formula at roll time is safe ONLY because of this guard — keep it when upgrading.
- **`requiresSummonEffect`** (flag, stamped from an extra summon item's spec `requiresEffect`):
  generic preUseItem gate — the item only fires while the named baked summonEffect is toggled
  ON (warning toast, nothing spent). First consumer: Siege Cannon needs "Siege Form" (plus a
  name shim for pre-flag owned specs).
- **Summon `displayName`** — `edhaSummon` spec key; defaults OWNER_HOVER (20) for all summons,
  phantom copies pass the DUPLICATED token's own mode through.
- ⚠ **Schema-strip gotcha (3rd sighting):** a handler-config field used by the engine MUST be
  declared in the handler type's registered schema — authored-but-undeclared fields are silently
  stripped at document load (whenTargetFooled, 07-17c). Grep the registration, not just the reader.
- ⚠ **World-actor accumulation:** every compendium drag creates ANOTHER world actor; stale
  siblings linger in the sidebar looking identical (5 Corvaine Raiders by 07-17). "Old behavior"
  on an adversary sheet = check WHICH world actor before believing the report.

## Loot (07-18e — cache tokens + downed-adversary search; §9h, Ben-approved)
- **`edha.createLootCache(name)`** (GM console/macro) mints a flagged (`edha-content.lootCache`)
  adversary-type actor in a "Loot Caches" folder with a LINKED chest token — the GM stocks it by
  dragging items onto its sheet, places the token over the painted chest. Linked = the placed
  token always mirrors the stocked actor; one cache actor per chest.
- **Double-click intercept** (`Token#_onClickLeft2` wrap, walk-the-proto like the phantom veil):
  a PLAYER double-clicking a cache token or a DEFEATED adversary (HP ≤ 0) within
  `EDHA_LOOT_REACH_FT` (5 ft edge gap, nearest owned token) gets a whispered contents card
  (player + GMs) instead of the permission-blocked sheet. GM double-click always falls through
  to the sheet — that's how caches get stocked. Out of reach / empty → toast, no card.
- **`edhaLootableItems(items, {cache})`** (PURE, pinned): weapon/equipment/loot types only;
  a body keeps `alwaysEquipped` natural weapons; traits/actions/talents are never loot.
  **`edhaLootSourceKind(actor)`** (PURE, pinned): "cache" (flag wins) | "body" (defeated
  adversary) | null — downed PCs are never lootable.
- **`loot-take` socket action → `edhaLootTakeGM`**: the GM client is the SINGLE WRITER — it
  re-checks the item still exists on the source (the double-loot guard: second click on the same
  blade finds it gone and posts a GM whisper), deletes it there, creates it on the taker
  (selected owned token's actor, else assigned character) with adversary provenance flags shed
  and equipped/alwaysEquipped cleared, then posts the public "X takes Y from Z" card. Buttons
  carry payload in `data-edha-*` (cross-client rule); adversary `ownership.default` stays 0.
- **Ignore deflect** = bump the hit by `Number(target.system.deflect.value)` (applyDamage subtracts
  deflect on energy/impact/keen, so adding it back nets to ignoring it).
- **Construct** = `String(actor.system.customType).toLowerCase() === "construct"`.
- **"Fires when X drops to 0"** = the GM-side defeat hook `Hooks.on("updateActor", ...)` on
  `system.resources.hea.value <= 0` (the defeated-overlay + Combustion Chain both ride it).
- **Multi-client gotcha:** `updateToken`/`updateActor`/socket handlers fire on EVERY client. Any
  Region/damage write must run on ONE applier — gate with
  `if (!game.user?.isGM || (game.users?.activeGM && !game.users.activeGM.isSelf)) return;` or relay via
  socket. `preUseItem` fires only on the using client (safe to write/relay from there).
