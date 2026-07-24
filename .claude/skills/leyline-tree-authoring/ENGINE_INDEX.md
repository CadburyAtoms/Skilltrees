# Engine primitives index (`module-src/scripts/register-skills.js`)

Read this instead of re-scanning the 11,000+-line engine. Find code by **grepping the function name**
(line numbers drift). Helpers are `function` declarations (hoisted) — callable from anywhere.
**Destruction's section is the worked example** for a deity "signature subsystem"; mirror it.

## ⚠️ THIS FILE IS HALF THE VOCABULARY — read `data/native-vocabulary.json` too

Everything below is what the **edha-content module** adds. The **cosmere-rpg system registers its
own event system underneath**, and authored rules may use both. As of system 2.1.0:

| | edha-* | native | total |
|---|--:|--:|--:|
| handler types | 31 | **12** | **43** |
| event types | 10 | **17** | **27** |

Native handlers: `grant-items` · `remove-items` · `modify-attribute` · `set-attribute` ·
`modify-skill-rank` · `set-skill-rank` · `grant-expertises` · `remove-expertises` · `use-item` ·
`update-item` · **`update-actor`** · **`execute-macro`**
Native events: `create` · `update` · `delete` · `add-to-actor` · `remove-from-actor` · `equip` ·
`unequip` · `use` · **`mode-activate`** · **`mode-deactivate`** · `goal-complete` · `goal-progress` ·
**`update-actor`** · **`apply-damage-actor`** · **`apply-injury-actor`** · `short-rest-actor` ·
**`long-rest-actor`**

**THE DIVIDING LINE — this is the useful part. It applies to BOTH handlers and events.**

*Handlers* — native ones write **self/owner** state: `update-actor`'s Target is `parent` or a fixed
`global` UUID, and there is **no native "current user target"**. Anything that must hit *whoever the
player is targeting* needs an edha-* handler, because those read `game.user.targets`. That is why
`edha-next-test-mod` exists and why `update-actor` could never have replaced it.

*Events* — **⚠ native events are owner-scoped too, and this is the half that gets assumed wrong.**
When a hook fires, the system's dispatcher resolves it to **one document** and, for an Actor,
iterates **`actor.items`** — the items of the actor the event happened **to**
(`systems/cosmere-rpg/index.js`, the `Hooks.once('ready')` dispatcher; verified 2026-07-24i).
So a talent's `apply-damage-actor` rule means "**I** was damaged", never "an ally was damaged".
The edha events run through the **same** dispatcher and pick their one document via `transform` —
which is how `edha-on-defeat` redirects from the victim to the killer. That is a cross-actor
*redirection*, still to exactly one actor.

**Neither event system fans out to N observers.** That is why ~47 talents hand-roll
`edhaCharacterOwnersOf("X")` / `edhaOwnersOf("X")` sweeps, and it is the load-bearing reason the
proposed `edha-watch` handler is needed. The existing name-free idiom to copy is
`edhaDarkVeilSweep` (walks tokens → talents → `edhaEventRules`, matching `handler.type`, with no
name literal anywhere).

Before proposing a NEW handler, check whether a native one already covers it — but check the
*scope*, not just the name. On 2026-07-24 `edha-watch` was nearly **built** because the vocabulary
was under-counted, then nearly **cancelled** because `apply-damage-actor` looked like it already did
the job; it does not. The full field list per handler is in `data/native-vocabulary.json`;
regenerate after a system upgrade with `node scripts/dump-native-vocabulary.js` (needs Ben's Foundry
install; not in CI). `lint-refs.js` pass 2 validates BOTH halves, so a typo'd native type now fails
instead of silently doing nothing.

⚠ **`update-actor` Changes write STRINGS.** `getChangeValue` returns `change.value` verbatim in
OVERRIDE/CUSTOM mode; an object only merges in ADD mode, and only when the flag *already* holds an
object. So a native rule cannot write `{skill, source}` into a flag that engine code later reads as
an object — it lands a string. Caught on Reckless Momentum's plot die (audit §9k); the die still
injects but the card's source label is lost. Check the consumer's shape before calling something
natively expressible.

Post-mortem: `EDHA_EDITABILITY_AUDIT.md` §9j (how the vocabulary was missed) and **§9k** (the
re-derived classification, the verified scoping, and the surviving handler set).

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
- **Pyre spread ALIASES (07-20, ruling 98)** — `EDHA_PYRE_SOURCES` (engine const): the spread
  watcher runs any hazard whose `sourceItem` flag is in the list (owner-scoped via
  `sourceOwnerUuid`; the card labels itself by source). A new Pyre-class adaptation = add its
  item name to the list + give the item Pyre's `edha-place-hazard` rule. First alias: the
  Cinderbrock's **Fire the Wrack**.

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
  weapons stay unflagged (equipment, not talents).
- **`edhaIsTalent(item)`** is the ownership predicate: `type === "talent"` OR the adversaryTalent
  flag. `edhaOwnsTalent` and every owner/caster item-by-name lookup go through it (pinned in
  `tests/engine-helpers.test.js`). `edhaCountTalents` (PC talent budget) stays type-strict on
  purpose — twins never count. `validate-adversaries.js` hard-fails any talent-TYPED embed.
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
- **Sweep/watcher automation does NOT reach adversaries** — unless its consumer was widened:
  ~20 sites iterate `game.actors.filter(a => a.type === "character")` (incl.
  `edhaCharacterOwnersOf`). A talent whose behavior lives in such a sweep is inert on an
  adversary — audit the talent's engine path BEFORE embedding it; extend the specific consumer
  only when a block actually needs it. **`edhaOwnersOf(name)` (W29, ruling 113)** is the widened
  scan: characters + adversary owners from BOTH the actor directory and the canvas (unlinked
  compendium-dropped token copies are in no directory — the W28 Dirgehound's Dread Presence
  shipped dead on exactly this). Widened consumers so far: the **Dread Presence** veto, the
  **Shield Wall / Devoted Conduit** pre-reduction (adversary dice at rank ≡ TIER, ruling 107),
  and the **focus watcher** (Whispered Doubt / Coercive Pressure / Predatory Insight). Regression
  cases pinned in `tests/engine-helpers.test.js`. Widen per-consumer, never wholesale.
- **Ranks**: talent formulas read `@skills.<color>.rank` — the build writes leyline ranks from
  `leylines` + role (minion 1 / rival 2 / boss 3, ruling 40). Adversary attributes stay 0, so rolled
  color tests run at +rank only (deliberate; revisit per-block). `edhaColorRank` (W29, ruling 113)
  falls back to **tier** for an adversary color with NO written rank (ruling 107) — embedded
  talents outside the block's `leylines` colors no longer degrade to rank 0 (d2 dice, undefined
  ranges).
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
- **`edha-regen`** (event `edha-apply-watch`; 07-20, ruling 98): engine-APPLIED flat heal at the
  end of the owner's turn — not a cue, a write — clamped by pure **`edhaRegenClamp`** (pinned:
  never while down at hp ≤ 0, never past max, 0 on nonsense), then a whispered GM card showing
  the applied amount. Config: `{amount, note}`. Runs inside `edhaTurnCueSweep` on the same
  one-GM-client gate. First consumer: the Garden Sow's **Nexus-Fed**. Use it for any "regains N
  at turn end" text instead of a gm-cue — decision-free heals should not cue.
- **`whenTargetFooled`** on `edha-damage-rider`: the bonus injects only when the current target
  is taken in by the roller's active seeming (**`edhaTargetFooled`** reads the copy's
  `phantomBelief.fooled` token uuids OR the caster's own `ambushBelief` ledger — see
  `edha-ambush-belief` below; pure decisions **`edhaTargetFooledIn`** / **`edhaAmbushFooledIn`**,
  pinned). First consumer: Spearing Beak's `+1d6[Spearing Beak]`. Any strike-the-believer talent
  is one rule. ⚠ The rider needs a seeming SOURCE on the same actor (an action named `The Seeming`
  or an ambush-belief rule) — without one it never fires; `lint-refs` pass 6 fails it.
- **`edha-ambush-belief`** (event `edha-apply-watch`, on the seeming TRAIT; 07-19 Malcurr audit):
  the LIGHTWEIGHT seeming for ambush predators — no phantom copy, no client veil, just a
  per-target belief ledger. On the owner's first attack (`skill_test` item + a user target)
  against each target per scene, the target rolls Perception (engine-rolled; `perceptionAdvantage`
  = 2d20kh for frayed seemings) vs the owner's `dcFrom` defense (default `cog`); the result writes
  to the OWNER's `ambushBelief` flag (token-actor safe — unlinked tokens keep separate ledgers;
  scene change resets; pure helpers **`edhaAmbushLedgerFor`**/**`edhaAmbushFooledIn`**, pinned).
  GM whisper + per-player truth cards, phantom-sweep style. Consumers: Wrongwake ×2 Thrown Voice,
  Stillback Causeway Seeming, Wasting-Eater Frayed Seeming (advantage). Full phantom loop stays
  the right tool when a copy TOKEN must exist (Mistheron's The Seeming).
- **Renamed-adaptation aliases (07-19)**: ruling-40 beast adaptations of engine talents keep the
  engine automation via aliases, never prose copies — **`edhaOwnsThorn`** (Thorn Field ∨ Thorn
  Hedge; hazard baking + Draw Mana line), the Drive-the-Prey case also matches **Herding
  Antlers** (contest path, card named by `item.name`), and **Sudden Wall** carries Sudden
  Growth's `edha-burst` rule verbatim. Waking Ground = nothing at all: green terrain-on-draw is
  ENGINE-NATIVE via the embedded Key's Draw Mana (`ENGINE-NATIVE VIA` marker, lint-verified).

## Playtest-pass primitives (07-16b — the original-9 wiring)
- **`edha-self-status`** (event `use`): on use, the user gains `statusId` — `timed: true` (default)
  stamps owner-relative expiry, false = until removed. Consumers: Trooper/Captain **Brace** →
  the new **`braced`** status (condition, visible icon; DELIBERATELY not in `EDHA_TIMED_STATUSES`
  so Predictive Ward's permanent baked-AE marker never auto-expires).
- **`edha-next-test-mod`** (event `use`): a next test gains `mode` (advantage/disadvantage) and/or a
  `formula` modifier (Probability Net's `-1d6`), counted. `nextTestMod.formula` injects via the same
  term-concat as test riders, flavor-labeled; a formula-only mod no longer forces disadvantage (the
  mode block is gated).
  **Generalised 07-24k — it is now the whole "modify a next test" family, not just the targeted
  half.** `target: "target" | "self"` (**defaults to `target`**, so every pre-07-24k rule is
  unchanged — that default is the regression risk, not the new fields), plus `plotDie: true`
  (writes `plotDieNext`, the raise-the-stakes injector) and `opportunity: true` (writes `oppCredit`,
  cashed by the Opportunity menu). The `formula` is resolved against the **owner's** roll data at
  use, so a self-mod banks a number rather than an `@`-ref the target pipeline can't evaluate.
  Fields compose — one rule can grant advantage AND a Plot Die AND an Opportunity. This retired
  `EDHA_OPP_ADDERS` and two bespoke `useItem` hooks (Risky Behavior, Overwhelm with Details).
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

## Currency (07-18e — W25 canon §5d, rulings 54/58)
- **`EDHA_CURRENCY` + `edhaRegisterCurrency(phase)`** (after the statuses block) — the ONE
  registered Edha currency `edha` ("Edha Coin"): denominations gold(100)/silver(10)/copper(1,
  base) with `g`/`s`/`c` units, array-ordered gold→silver→copper for sheet readability (ruling
  54: players see c/s/g, never the stroke/seal/charter flavor names — those are description
  text only). Registration = `game.system.api.registerCurrency` when present + a direct
  `CONFIG.COSMERE.currencies` write in the system's own `spheres` shape, idempotent at
  load/init/setup (actor DataModel derives currency fields from the registered set; register
  before schemas build), ready log line. Prices quote in integer copper (bread 1c, day's labor
  10c, sword 200c — anchors in canon §5d). ⚑ bench: denomination display order, spheres-row
  coexistence, pre-existing-actor backfill, icon. Item-level `price.currency: "edha"`
  re-pricing is NOT wired — decide with the fleet weapon migration (§9h).

## Bench-07-18 primitives (07-18g)
- **Stance state machine** (`edhaToggleStance(item)` / `edhaActiveStance(actor)`) — keyed on
  `system.modality === "stance"` (the FIELD, not names — new stances wire themselves). Using a
  stance talent enters it: one marker AE (talent name/img, flag `edha-content.stanceOf`), any
  other stance ends first, using it again leaves. The marker is the queryable state. The system
  ships NO stance machinery; its own stance AEs are inert.
- **`edhaStanceRiderChanges(item)`** (07-24j, iron rule 2b) — a stance's numeric while-active
  riders, read off **the talent's own Effects tab** instead of the retired name-keyed
  `EDHA_STANCE_CHANGES` table. Author ONE ActiveEffect on the stance talent flagged
  `edha-content.stanceRider` with **`transfer: false`** (it must never apply on its own); the
  marker copies its `changes` at enter, so the numbers are editable in Foundry and vanish on
  leave/swap. No rider effect = no numeric rider, which is legitimate (Flame/Iron/Wind). Pure;
  pinned in `tests/engine-helpers.test.js`, mutation-checked.
- **Stance skill advantage is an `edha-test-rider` rule**, not a hook (07-24j). Three fields added
  for it and reusable everywhere: **`mode`** (advantage/disadvantage — `bonusFormula` may now be
  blank, so a rule can be mode-only), **`whenSkill`** (a single skill id; narrower than
  `whenAttribute`, which would sweep in every sibling skill of the same attribute), and
  **`whileStanceActive`** (only while THIS talent's own stance is up). `mode` is also what
  Frenzied Tempo was blocked on.
- ⚠ **FACT (07-24j): the advantage enum is the STRING `"advantage"`/`"disadvantage"`, and you must
  wrap `configureDialog` too.** A dialog roll overwrites `roll.options.advantageMode` from
  `data.skillTest.advantageMode`, so setting only `roll.options` silently loses on any dialog roll.
  The retired `edhaStanceAdvPreRoll` set `= 1` and wrapped neither — stance skill advantage never
  landed. Copy `edhaAdvTestPreRoll`'s two-line shape for any new advantage injector.
- **PC token defaults** (`edhaPcSightShape(actor)` + preCreateActor hook + AWA updateActor
  watcher + `edha.fixPcTokens()`) — new character actors get displayName HOVER(30) and cosmere
  "sense" sight (attenuation 0.1) with range = Senses Range (`edhaSensesRangeFtFromAwa`); the
  watcher (single GM applier) pushes range onto prototype + placed tokens when AWA changes;
  fixPcTokens retrofits existing PCs and their placed tokens.
- ⚠ FACT (07-18g): **never fold a DerivedValueField's `.bonus` into its `.override`** — the
  value getter adds `.bonus` on top of the override, so folding double-counts every AE
  (Surefooted's +10 displayed +20). Set the override to the base derivation only.
- ⚠ FACT (07-18g): **prose prereq names resolve TREE-LOCAL first** in foundry-build
  (classifyToken's localByName) — 28 talent names collide across trees and the global index is
  first-writer-wins.

## Heroic wiring pass (07-18h — the HEROIC PATHS engine section; all 133 talents classified)
- **Quarry core** — `edhaSetQuarry(owner, target)` / `edhaQuarryOf(owner)` (flag `quarryUuid`);
  pre-AttackRoll advantage when the current target IS the quarry; Tagging Shot marks on hit
  (via `edhaHeroicOnHit`); Cold Eyes rides the defeat `updateActor` class (GM applier).
- **`EDHA_HEROIC_DEFTESTS`** — the vs-defense gate table: `{name: {skill, def, apply, applyFail?}}`
  → useItem queues a contest on the talent's own roll, compares vs `edhaReadDefense`, applies
  ONLY on success (kill-soft-laziness for heroic). Add entries, don't write new gates.
- **`edhaCommandDie(actor)`** — d4 + 2 per owned Command upgrade (Confident/Demonstrative/
  Shrewd); Decisive Command + the self-add cards read it.
- **`edhaDrainFocus(actor, n, source)`** — involuntary focus LOSS with Wary's Discipline
  reduction + the Predatory-Insight zero-check; tagged `edhaFocusWatch` (runs on the damage-
  applying client — the Whispered Doubt write pattern).
- **Opportunity credit** (`oppCredit` flag) — the four adder talents bank +1 Opportunity on use;
  `edhaOpportunityMenuWatch` cashes it on the next test (menu card names the source). Spenders
  stay `edha-opportunity-option` authored rules (event `edha-opportunity`).
- **`EDHA_STANCE_CHANGES` / `EDHA_STANCE_SKILL_ADV`** — numeric while-in-stance AE changes baked
  into the stance marker + per-stance skill advantage on the pre-roll pipeline; Practiced Kata
  auto-enters Vigilant at combatStart.
- **Resilient Hero** — preUpdateActor HP-floor veto (`resilientSpent` flag, GM clears on long
  rest). **Wary** — preCreateActiveEffect veto on `surprised` while focus > 0.
- ⚠ **CAE-NEXT class** (Cosmere Advanced Encounters — installed 07-18, api UNCAPTURED): every
  action/reaction-economy behavior is queued in §9j #1b with its hook class named. Do NOT mark
  those manual; do NOT wire them blind — the items dump's CAE section is the gate.

## Character creation (07-18l — §9j #5; the wizard + the kit)
- **`edhaCreationWizard(actor)`** (`edha.creationWizard`) — the guided DialogV2 walkthrough:
  welcome → country → heroic (Key + kit auto) → leyline (Key auto; path grants Draw Mana) →
  deity (skippable) → budget spend → purse + name. Composes existing grants ONLY — culture/path
  items fire their own add-to-actor events; the preCreateItem budget gate stays the enforcement.
  Surfaces: GM "＋ Edha Character" sidebar button (`edha.newCharacter`) + an owner-visible PC
  sheet bar. Partial characters resume via the native sheet; the wizard's re-entry offer is
  **Start over** — a level-1 reset that keeps the actor's level. **Kit backfill (07-19):** the
  heroic "Already chosen" page detects a heroic path with no `kitPath` flag (pre-kit actor, or
  the path dragged by hand) and offers **🎒 Grant the kit** in place; the welcome checklist
  flags the missing kit.
- **`edhaCreationState(actor)`** (pure, pinned) — {culture, heroic, leyline, deity, talents,
  allowed, level, complete} snapshot; drives the welcome checklist, budget counter, and both
  buttons' labels. **`edhaCreationWipeIds(items)`** (pure, pinned) — what Start over deletes:
  talents, paths, culture/ancestry, `kitItem`-stamped gear. Draw Mana leaves via the leyline
  path's remove event; picked origin expertises linger by design.
- **`edhaKeyPickAllowed(level, actorId)`** (pure, pinned) — the budget gate's Key rule: L1
  always, above L1 only while the actor's id is in `globalThis.edhaCreatorWindows` (a per-actor
  SET — several wizards can be open at once, 07-19b; duck-typed `.has` for the vm tests). Set
  for each wizard's run so a restart on a leveled PC can re-pick its two Keys; talent budget
  still enforced. Opening the SAME actor's wizard twice no-ops with a toast.
- **`edhaGrantStartingKit(actor, path, {force})`** (07-18j, fixed + hardened 07-18l) — kit items
  + 5-silver purse from edha-items. The 07-18j version NEVER granted (its docs ARRAY was
  double-wrapped through the one-doc `edhaCreateItemDocs`); now a direct `createEmbeddedDocuments`,
  each item stamped `flags.edha-content.kitItem`, actor flag `kitPath` makes it once-only
  (`{force:true}` re-grants; a creation restart clears the flag and pulls the 5 s back).

## Character creation v2 (07-19p — the bench fixes + Ben's rulings)
- **KEYS ARE PATH-NATIVE.** Every path item's `pathEvents` grant-items rule delivers its Key
  (and Draw Mana on leylines). NOTHING else may grant a Key — the wizard doing so raced the
  async native grant and doubled it (bench 07-19). The wizard only verify-warns ~1.2 s later.
- **`edhaCreatorDialogs(DV2)`** — wraps `DV2.wait`/`DV2.confirm` for a wizard-style flow: the
  current dialog re-fronts itself when a DOCUMENT sheet renders over it (never over dialogs/
  pickers); `.hold()` suspends for deliberate opens (open-tree, browse, content-link clicks);
  `.off()` in the flow's finally. Reach for it for any future multi-step dialog walkthrough.
- **`edha-pick-expertises`** (handler type) — pick-N expertises from the RULE'S OWN entries
  list (`entries` = JSON `[{id,type,label,text}]`, `pickAmount`, optional `title`). Exists
  because the native `grant-expertises pick:true` ignores its authored list and offers the
  system's Rosharan registries (bench 07-19). Serializes multiple picks via
  `globalThis.edhaExpertisePickChain`; `edhaAwaitExpertisePicks()` waits the chain out (the
  wizard's culture step does). Writes the native actor expertise shape. foundry-build emits it
  for every `cultures.json` pickGroup.
- **`edhaCwWireMap(rootEl, sel, nameToId)` / `edhaCwMapData()`** — the Thyrcross map picker:
  SVG polygon overlay over `assets/thyrcross-map.jpg`, hover = name+region tip, click drives
  the select. Data asset `assets/thyrcross-nations.json` is generated by
  `scripts/build-map-picker-asset.js` from THE map truth (thyrcross.map.json) — edit the map
  JSON and rerun, never hand-edit the asset. Both assets are in module-src-sync FILES.
- **`edhaCwStepperDialog(DV2, {title,intro,rows,cur,budget,capFor})`** — shared −/value/+
  budget editor dialog; consumers `edhaCreatorAttrStep` / `edhaCreatorSkillStep` (write
  `system.attributes.<id>.value` / `system.skills.<id>.rank`; warn-not-block when over
  budget). Budget helpers (pure, pinned): `edhaCwAttrBudget` (12 + levels {3,6,9,12,15,18}),
  `edhaCwSkillBudget` (5+(L−1)×2), `edhaCwMaxSkillRank` (INT((L−1)/5)+2) — numbers from the
  legacy Character_Building_Rules.md, ⚑ awaiting Ben's confirm.
- **`edhaCwEnrich(html)`** — enrichHTML for wizard previews (raw `@UUID` text otherwise).
- **Deity faith note** — flavor-only flag `edha-content.faith` (string deity name); shown on
  the welcome checklist + finish card; no mechanics anywhere read it.
- **⚠ DIALOG CONTENT IS SANITIZED (07-19q).** DialogV2 (and chat) string content passes through
  `foundry.utils.cleanHTML` — its tag allowlist has img/div/select/input/button but **NOT
  `<svg>`** (the take-two missing-map root cause). Anything non-allowlisted must be injected
  via script in the render callback (script-added DOM is never sanitized). input keeps
  checked/disabled/name/value/type; the global list keeps class/style/data-*.
- **`edhaCreatorChangeSlot(actor, kind)`** (07-19q) — un-pick ONE creation slot in-wizard: the
  item + every owned talent stamped `flags.edha-content.group === <path name>` (Keys included)
  + kit gear & 5-silver rollback on heroic; native path remove-events overlap harmlessly.
  Wired to the ↺ Change… button on every already-chosen page.
- **`edhaCreatorWeaponPick(actor, DV2)`** (07-19q) — the kit's open weapon slot: lists
  edha-items weapons ≤ 200 copper (conversion rates g=100/s=10/c=1), price·damage·skill rows,
  grants the picked one. Runs after any wizard kit grant.
- **`edhaGrantBasicActions(actor)`** (07-19q) — embeds the system's cosmere-rpg.actions items
  the actor lacks (by name, idempotent). Runs on ＋ Edha Character and every wizard open.
- **⚠ `edhaCleanPackCopy(doc)` — MANDATORY for pack→actor copies (07-19r).** A raw
  `doc.toObject()` keeps the source's `system.relationships`; the system's createItem hook then
  writes contra-links back onto the COMPENDIUM doc → server-rejected write + a null-entry crash
  in its updateItem hook (Ben's wizard-start console errors). Strips relationships + the
  cosmere meta.origin flag. Every wizard grant path uses it; new grant code must too.
