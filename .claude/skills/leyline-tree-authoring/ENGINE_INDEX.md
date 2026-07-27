# Engine primitives index (`module-src/scripts/register-skills.js`)

Read this instead of re-scanning the 11,000+-line engine. Find code by **grepping the function name**
(line numbers drift). Helpers are `function` declarations (hoisted) — callable from anywhere.
**Destruction's section is the worked example** for a deity "signature subsystem"; mirror it.

## ⚠️ THIS FILE IS HALF THE VOCABULARY — read `data/native-vocabulary.json` too

Everything below is what the **edha-content module** adds. The **cosmere-rpg system registers its
own event system underneath**, and authored rules may use both. As of system 2.1.0:

| | edha-* | native | total |
|---|--:|--:|--:|
| handler types | 68 | **12** | **80** |
| event types | 15 | **17** | **32** |

*(Recounted 07-25 pass 2bU — the migration's handler builds had left the old 31/11 numbers far
behind; `grep -c registerItemEventHandlerType` is the live count. `data/native-vocabulary.json` is a
snapshot of the SYSTEM's half and does not change when the module adds one.)*

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
- **`edha-def-test` (H1, 07-24m) — reach for this BEFORE hand-rolling any of the above.** The
  authorable form of the whole "roll a gated test, then do something" shape (45 talents across 17
  trees). One rule on the talent, event `use`: `skill` (the id YOU roll — leyline colours are skill
  ids too), `vs` = `defense` \| `skill` \| `dc`, plus `def` / `targetSkill` / `dc`. It **gates
  only** — the payload goes on sibling rules listening to the new events **`edha-test-success`** /
  **`edha-test-fail`**, and those may use ANY handler (`edhaDispatchTestResult` calls
  `rule.handler.execute`, so it knows no payload type — never hand-list them).
  `requireTarget` / `rangeColor` veto in `preUseItem`, i.e. **before cost** — that is how a
  converted talent keeps the "nothing spent" guarantee a `preUseItem` takeover used to give it,
  without swallowing the card or the player's roll.
  Pure decision **`edhaDefTestOutcome(total, {vs, dc, defValue, oppRoll})`** — pinned in `tests/`;
  it **fails OPEN** on an unreadable bar, matching the ~20 hand-rolled `def == null ? true : …`
  copies it replaced (an adversary with no written defense must not make the talent inert).
- **The payload side of H1 (07-24p).** `edhaDispatchTestResult` passes **`victim` as well as
  `target`**, so a payload rule with `target: "victim"` binds to the creature the TEST resolved
  against — better than `"prompt"`, which re-reads `game.user.targets` and would hit all of them.
  A payload handler **returning `false` stops the remaining rules**, and that is a feature: order
  `[status] → [edha-owner-list op:release] → [damage]` and the damage becomes conditional on the
  release having found something (Chaos's Isolating Pressure/Ruin). No gate field needed.
- **`edha-note` (07-24p)** — post a chat note: `text` (@-refs resolved against the owner),
  `icon`, `whisper: public|owner|gm`, `whenOwnsTalent`. The table-run half of a talent as a
  RULE. This is the cue primitive every declared exit owes its talent — `edha-gm-cue` cannot do it
  (config-only executor, GM-whispered, fixed triggers).
- **`whenOwnsTalent` (07-24p)** on `edha-note` + `edha-triggered-effect`, via the pure gate
  **`edhaRuleOwnsGate(owner, name)`** (pinned in `tests/`). The UPGRADE-TALENT shape: a talent
  that only sharpens another's result carries no rule of its own; the PARENT's rule names it. A name
  in this field is authored data, not engine dispatch — same reasoning as `edha-enter-stance`'s
  `stance`. Consumers: Absolute Stillness, Calm Appeal, Resolute Stand. **The upgrade's document is
  then empty — declare it in the tree-section header** (rule 2b), as Vigilant Stance did.
- vs a static **defense**: `edhaReadDefense(actor, "phy"|"cog"|"spi")` (no foe roll needed).
- `edhaPromptDC(title,hint)`, `edhaRewriteOrRelay(...)` for GM-DC / roll-rewrite cases.
- **No owner roll to capture** (a passive that fires on an event)? Roll the DC yourself and roll each
  foe — see `edhaSpeedVsRedProne` (Destruction): `1d20 + @skills.red.mod` DC, each foe rolls Speed.

## Sustained capped ledgers — H3 `edha-owner-list` (07-24p)
The marker-tree primitive: place a mark on a creature, sustain at most `cap`, clear it when spent.
Six trees hand-rolled this (Omens · Remains · Charges · Snares/Ordained · Edicts/Covenants ·
Insight) and §9o called them byte-identical. **They are not, and the differences are the schema:**
- `evict: "oldest"` (Order/Fate fizzle the oldest — Ben R1) vs `"refuse"` (Chaos declines at cap
  and says so on the card). Averaging these would silently have changed two trees.
- `op: place | release | count`; `list` (the ledger key, also the status id unless `status` is
  set); `capFormula` (usually `@tier`); `target: victim | prompt | self`.
- **`release` returns `false` when the creature was not on the list** — that is the conditional
  idiom above, not an error path.
- Pure core **`edhaListPush(list, entry, {cap, evict})` → `{list, evicted, refused}`** (pinned in
  `tests/`; a cap that COMPUTED to 0/NaN refuses rather than emptying a live ledger).
- **`edhaOwnerListQueue(owner, key, task)` — THE door for any ledger read-modify-write (07-26n,
  bench run 4 defect 2).** Every `lists.*` mutation is an RMW with no Foundry isolation: three
  same-tick defeats ran three concurrent harvest placements that all read the same stored list,
  and the last write won (entries LOST — measured live). The queue serialises per owner+key; the
  task must RE-READ inside itself (queueing only the write fixes nothing). All 16 write sites go
  through it — any new writer MUST too. Two rules, enforced by review: user interaction (dialogs,
  pick-points) stays OUTSIDE the queue, and a queued task never awaits another queued task on the
  same owner+key (deadlock — the reason the executor's `spend` op does not wrap `edhaLedgerSpend`,
  which carries the queue itself). Pinned in `tests/owner-list-race.test.js` (mutation-checked);
  `tests/run.js` runs async tests since the same pass.
- **Membership lives on the mark, order lives in the list, and the mark wins.**
  `edhaOwnerList(owner, key, status)` drops any entry whose creature no longer bears the status, so
  a half-migrated tree (or a GM clearing a status by hand) cannot strand a phantom under the cap.
- **A tree's ledger key MUST be in its deleteCombat scene clear** (07-27b — Chaos's `lists.omens`
  survived combat delete because `edhaClearChaosState` predated the 2bU repoint; the reconcile
  hides a stale entry only while its token resolves, then the fail-open keep is phantom cap
  pressure). The Death clear is the template: statuses on canvas tokens AND directory actors,
  the raw `lists.<key>` unset on characters (§9o trap 3 — hand-edit the key).
- **deleteCombat clears gate on `edhaDefBuffGmGate()`, never raw `isGM`** (07-27b — bench run
  5's Apex Form double injury: two GM clients each ran the Life clear; the raw-isGM family of 15
  hooks was retrofitted). A clear that CREATES documents (the apex injury) also guards against
  overlapping itself (`_edhaLifeClearBusy`) and unsets its trigger flag BEFORE the creating
  round-trip.
- **NOT in scope:** canvas objects (Fate's MeasuredTemplates, Destruction's Regions) stay with the
  placement handlers, and Knowledge's **Insight is a different shape** — a counted SINGLE bearer
  (0–5, transfer clears the old one), not N members. That is the proposed **H3b
  `edha-owner-counter`**; all 9 Knowledge bucket-2 talents want it and nothing else does.
- **Fields added 07-24u with the first ledger migration**, each one a trap that would otherwise have
  shipped silently:
  - **`allowDuplicates`** (default off) — Order's Edicts deliberately allow repeat casts on ONE
    target, each its own entry (Ben, 07-24t: the tree as documented is the SPEC; widen the primitive).
  - **`multiOwner`** (default off) — a marker status belongs to the CREATURE, not to one pact, and
    Order's `covenant`/`edict` icons are shared between owners. Without it one owner's eviction
    strips another owner's icon. Pure core **`edhaListSharedHold(ledgers, uuid, excludeOwnerId)`** +
    the **`edhaOwnerLedgers(key)`** gatherer, pinned in `tests/`; it fails OPEN on a missing uuid
    because the three point-bound ledgers carry none.
  - **`sceneScoped`** (default ON, preserving Charges/Snares) — `place` used to stamp `sceneId`
    unconditionally while Order's readers never scene-filtered, so a converted entry went invisible
    on any other scene. A pact that follows the creature turns it off.
  - **`requireDisposition` / `requireAdjacent`** + the duplicate and cap refusals — H3's **pre-cost
    `preUseItem` veto**, the same move H1 and H12 made, because an executor runs after the system has
    already charged. Restricted to `op: place` + `target: prompt` — the only case where H3 owns the
    gate, and what makes it provably inert for the three shipped Chaos consumers (all `victim`).
  - **`releaseButton`** — a generic `.edha-list-release` chat button keyed on the ledger and the
    ENTRY ID, so Covenant's "Break the Covenant" affordance survived conversion and any ledger gets
    one. Names no talent.
- **⚑ MIGRATING A LEGACY LEDGER: repoint the ACCESSOR, do not build a `listPath` field (07-24u).**
  `Document#getFlag` resolves dotted keys through `getProperty` (`common/abstract/document.mjs:917`)
  and `unsetFlag` splits them itself (`:963`), so pointing one accessor at
  `edhaOwnerList(owner, key, status)` moves a whole tree's ledger and every reader follows for free.
  Verified on `covenants`: 12 readers, zero changes to any of them beyond the entry field names. With
  one array the "ledger in two places at once" hazard is impossible **by construction**.
  - ⚠ **Two things a rule field cannot repoint** — hand-edit them: a raw `getProperty(changes, …)`
    hook, and any `deleteCombat`-style cleanup key list.
  - ⚠⚠ **A hook that inspects `changes` must accept the DOTTED form too.** `setFlag` submits
    `{flags: {"edha-content": {"lists.covenants": …}}}` and `DataModel#updateSource` only expands
    dot-notation found among the change object's **top-level** keys (`common/abstract/data.mjs:447`).
    The nested dotted key therefore survives into the hook, and a plain
    `getProperty(changes, "flags.edha-content.lists.covenants")` reads `undefined`. A flat legacy key
    had no dot, which is why this bites only *after* migration — and it fails silently.

## An ALWAYS-ACTIVE talent can hold no `use` rule — give it an EVENT (`edha-draw-mana`, 07-24y)
`activation.type: "none"` means the system never fires `use`, so the talent's Events tab is not empty
by neglect — **nothing can be put in it.** All five Leyline Attunement Keys and Calculated Patience
were stuck there. Two exits, and which one you need depends on whether a hook already exists:
- **A new event type** when a hook exists but dispatches nothing to documents. `edha-draw-mana` is
  ~5 lines of `registerItemEventType` (sentinel hook) + a sweep inside the existing Draw Mana hook.
  Blue/Red Keys then carry ordinary `edha-next-test-mod` rules.
- **An existing engine-detected event** when the behaviour is a passive rider — Calculated Patience
  needed no new event at all, because `edha-pre-test` already fires from the pre-roll injector.
- **`edhaRulesForEvent(actor, type)`** is the reusable selection: every rule on the actor's talents
  listening for `type`, `order`-sorted within each talent. Split out of the dispatcher so it is
  unit-testable — the dispatch is async and `tests/run.js` is synchronous.
- ⚠ **Retire the old table row in the same commit**, or the rider fires twice. For a single-slot flag
  the second write clobbers the first *with the same value*, so it is invisible at the bench.
- ⚠ **A dispatcher does not always want the GM gate.** `edhaDispatchCombatTiming` has one because a
  grant must land once across clients; Draw Mana fires on the OWNER's client, so copying that gate
  would have made it silently do nothing for players.

## A boolean helper that folds "unknown" into one answer CANNOT be inverted (`whenSlowTurn`, 07-24y)
`edhaIsFastTurn` returns `false` for **three** states — no combat, no combatant, genuinely slow — and
that is safe only because it fails CLOSED (a fast-turn payoff that never fires is inert). Writing
`whenSlowTurn` as `!edhaIsFastTurn(actor)` inverts it into a fail-OPEN bug: advantage on the first
test of every out-of-combat scene, in the one place nobody would connect it to a Blue talent. Hence a
real `edhaIsSlowTurn` that requires a live combatant.
- An **unset** `turnSpeed` in combat IS Slow — the system's getter is `?? TurnSpeed.Slow` and its
  schema `initial` is `"slow"`, while the engine reads the RAW flag, which stays `undefined` until
  the player toggles.
- > **Grep for this shape:** any `!edhaIsX(...)` where `edhaIsX` has an early `return false` for
  > missing state is the same latent bug. Pin both directions in `tests/` — the in-combat half of a
  > naive negation passes, and only the out-of-combat row fails.

## Sustained summons — `sustainCap` / `replaceOldest` on `edha-summon` (07-24y)
A cap formula (blank = uncapped) plus refuse-vs-replace. Two things this build proved, both of which
generalise past summons:
- ⚠⚠ **A field that can REFUSE a use cannot live in the handler's executor.** An executor runs on
  `use`, i.e. **after** the system has charged the cost, and every gate it replaced refuses pre-cost
  ("nothing spent"). It needs a `preUseItem` veto — the same shape H1 / H3 / H12 /
  `edha-next-test-mod` all carry. Check this before costing ANY "just add a field" gate.
- ⚠ **Check that a superlative has data to sort by.** "Replace the OLDEST" was unimplementable:
  nothing stamped a creation time, and the existing lookup used `.find()`, correct only while the cap
  happened to be 1. Hence `summonedAt`.
- **`summonTalent`** ends summon-identity-by-name-prefix (`name.startsWith("Combat Construct")`),
  which silently broke caps and riders on a rename. `edhaSummonIsFrom` / `edhaOwnedSummons` read it,
  with a name fallback for creatures summoned before the flag existed — compared against the rule's
  own **authored** `summonName`, never a literal in engine code. ⚠ `edhaCivIsConstruct` (6 call
  sites) still name-prefixes; not a rule-2b violation (a summon name is not a talent name), just an
  available cleanup.

## Range, target count, and doubling — `edha-next-test-mod` (07-24x)
Ben ruled q13 BUILD IT, so Decisive Command's printed "within 20 ft" is enforced and Authority really
doubles it. Three fields: **`rangeFt`** · **`maxTargets`** · **`doubleIfOwns`** (a talent name that
doubles BOTH at once — exactly what Authority's card says). Vetoed **pre-cost** via `preUseItem`, the
same move H1 / H12 / H3 make, because the talent charges a focus.
- ⚠ The handler resolved exactly **ONE** target before this. "Double the number of allies affected" had
  nowhere to land until it learned to fan out — **check whether a handler can even address N subjects
  before costing a multi-target upgrade.**
- `@owned` / `ownedFrom` (07-24w) is the sibling primitive: a count of owned talents substituted into a
  formula, for a die that scales with how many upgrades you have (nothing in roll data exposes an
  owned-talent count). Talent names in **authored** data are fine — the rule-2b smell is names in
  *engine* code.

## Riding a DAMAGE roll — `appliesTo` (07-24x)
`edha-next-test-mod` was registered on d20 contexts only (`skill` / `attack` / `item`), so any card
promising a bonus on a *damage* roll was promising something impossible. **`appliesTo`**
(test | damage | either) plus a consumption path inside `edhaWrapRollDamage`, where the formula must
land before the roll is evaluated — a post-roll hook is too late.
- ⚠ **Inertness is the risk, not correctness.** Every pre-07-24x mod is implicitly `test`, so a leak
  changes shipped talents silently. Pinned both ways on both callers, including that a **skill-gated mod
  can never match a damage roll** (a damage roll has no skill id, and the skill gate fails closed).
- **`requireQuarry`** is the same shape as `targetUuid` and not interchangeable with it: `targetUuid`
  binds to *your* current target, which for Pack Hunting is the ALLY. The quarry is a third party, so it
  is stamped at grant time and checked against whoever the ROLLER targets.
> **Precedent worth naming:** this is the first pass to settle a card-vs-engine drift by BUILDING the
> card's promise. The 07-12 Withering Ray call went the other way (the card was corrected). Either can
> be right — but "the card is aspirational" should be a decision, not a default.

## Single-target talents — `edha-single-target` (07-24v)
Config-only (the `edha-thorns` shape): the `preUseItem` gate reads the rule, and with ≥2 tokens
targeted it cancels **before cost** and whispers a picker. Retired the name-keyed
`EDHA_SINGLE_TARGET` Set, so adding a single-target talent is authoring a rule.
- One optional `note`, printed on the picker card — it ships with a consumer rather than as a lying UI.
- ⚠ **Verdant Mend's document was completely BARE**, which is why "just add a boolean" had nowhere to
  go: there was no rule on the talent to hold a field. When a classification says "one boolean", check
  that the talent HAS a rule to put it on.

## In a multi-step write, REFUSE before you COMMIT (07-24v)
H3's `place` committed the ledger and *then* marked the creature. With no GM online to mark a target
the player does not own, the mark path returned — leaving an entry whose creature had no status, which
`edhaOwnerList`'s reconcile-on-read then hid **for ever**. Silent three ways at once: the placement
looked like a no-op, the cap never counted it, and junk built up in the flag. It hit every H3 consumer
including the migrated `covenants` ledger.
> **Order the steps so the one that can refuse runs first.** Any handler that writes in more than one
> place has this shape; "commit, then apply" is only safe when the apply cannot fail.

## A debuff handler will happily mark an ALLY — `mark` on `edha-apply-status` (07-24v)
`edha-apply-status` wrote `markedBy.<status>` unconditionally, and the damage post-pass reads that flag
to add the marker owner's bonus damage. Used for a **buff** (Rousing Presence's Determined) it put an
enemy-debuff ownership flag on a friend, on a shared hot read path — harmless only while the bonus
formula happened to be blank. **`mark: false` applies the status without claiming ownership.**
- It also gained **`whenOwnsTalent`** (the upgrade-rider gate every sibling handler has), and its card
  label gained the **native-status fallback term**: `determined` is not in `EDHA_STATUSES`, so the
  two-term lookup printed a bare lowercase id. Mirror `edhaFireTrigger`'s three-term fallback.

## "Registered" is not "usable" — the one-line test before writing `needs: []` (07-24v)
Eight passes over-estimated for a single reason: a classification checked whether a handler type was
**registered**. Name all three of these or it is not ready —
1. **the EXECUTOR** — `edha-heal-cut` and `edha-overflow-thp` are registered with
   `executor: async function () {}`. A config-only handler **cannot be a payload**, only a passive
   read from elsewhere.
2. **the SCHEMA FIELD** — `edha-combat-timing` has no slow-turn moment; `edha-next-test-mod`'s `skill`
   is a scalar compare, so an authored comma-list silently matches nothing. *(That example is now
   HISTORICAL — `skill` was widened to a comma-list on 07-24w. The lesson stands; the instance is
   fixed. Kept because it is the clearest illustration of a gate that silently passes everything.)*
3. **the EVENT** — nothing fires "you paid ritual HP" (Blood Price), and a talent whose
   `activation.type` is `none` can never fire `use` at all, so it can hold no rule on that event (all
   five Leyline Attunements).
> Corollary: **a talent whose classified mechanic is already authored is pointed at the wrong line.**
> Forge Construct's summon spec has been on its document for months; what holds it on the ratchet is a
> sustain-ONE replace gate nobody had costed.

## Ledger-wide payloads — `target: "list-members"` (07-24u)
`edha-triggered-effect` can address **every member of one of your H3 ledgers**, which is the payload
shape the marker trees had no way to express (Bear Witness grants Temp HP to each Covenant ally).
- Fields: **`listName`** (the ledger key) · **`listStatus`** (blank = the ledger name; Order's ledger
  is `covenants` but its marker is `covenant`, so it must be set) · **`rangeColor`** (an Attunement
  Range gate; needs BOTH tokens on the map, as H8's does). Self is always excluded, and downed
  creatures are skipped.
- It reads through `edhaOwnerList`, so it inherits **"the mark wins"** for free.
- ⚠ **`kind: "thp"` fans out ONLY in this mode.** Every other target mode keeps first-target-only and
  the REPLACING writer, unchanged. In this mode the writer is **`edhaGrantTempHpCross`** (keeps the
  higher — Temp HP does not stack) and it relays through the GM for creatures the client does not
  own; a zero amount is silent. All three differences are load-bearing: the obvious generic path
  would have quietly nerfed stacked Temp HP, failed on other players' PCs, and spammed "gains 0".
- Same shape, not yet wired: Final Decree's Witness block, Concord's roster.

## A second moment on `edha-combat-timing` — `round-start` (07-24u)
The dispatcher now fires **`combat-start`** and **`round-start`**. Foundry has no new-round hook, so
the boundary is latched off `combatTurnChange` (`edhaAnnounceRoundStart`), including the
mid-combat-reload guard: a client first seeing a combat already past round 1 **stamps without firing**,
so re-opening the world never double-grants.
> ⚠ **Adding a moment to a shared trigger is a double-fire waiting to happen.** Round 1 *begins* at
> combat start, so every existing consumer would have fired TWICE on the first round. The
> **`whenMoment`** filter lives in the dispatcher, reads the rule's own field and **defaults to
> `combat-start`** — which is what makes the widening provably inert for Foresight, Sidestep and
> Practiced Kata. When you add a value to an existing trigger's vocabulary, check what the EXISTING
> consumers match against, not just that the new one works.

## Observing another document — H8 `edha-watch` (07-24q)
**Reach for this when a talent must react to something it did not do itself.** Neither event system
fans out: the system's dispatcher resolves ONE document and iterates that actor's items, and
`edhaDispatchTestResult` iterates **that ITEM's rules** — so a rule never sees a *sibling talent's*
event, let alone another actor's. That is the gap ~54 name-keyed owner sweeps were filling.
- One config-only rule on event **`edha-watch-rule`**; the payload goes on the SAME two events a
  gated test uses (`edha-test-success` / `edha-test-fail`), so every payload handler works unchanged.
- **`scope`** is the whole design: `self` = another ITEM on your actor (Crown of Thorns riding
  Kneel's test; Extract Thought riding every Deception roll) · `scene` = another ACTOR, filtered by
  `disposition` / `rangeColor` / `rangeFt` / `includeSelf`. **scene's first consumers landed 07-24r**
  (the three Black focus passives + Necrotic Cascade). A range gate now requires BOTH tokens — "within
  your Attunement Range" is unanswerable when either side is off the map.
- **`watch` — the kinds, and how to add one (07-24r).** A new kind is *a schema value plus ONE
  `edhaDispatchWatchers({kind, owner, victim, …})` call at a hook the engine already owns*. Nothing
  in the handler, the filters, the memoized index or the payload dispatch changes. Shipped:

  | kind | announced from | consumers |
  |---|---|---|
  | `test` | `edhaDispatchTestResult` (H1) | Crown of Thorns, Absolute Authority |
  | `skill-roll` | `cosmere-rpg.skillRoll` | Extract Thought |
  | `defeat` | the Death live→0 watcher, **after** its shared preconditions (one applier, not a PC, not a summon, not Death-Warded) | Necrotic Cascade |
  | `focus-change` | `edhaRunFocusWatch` + `edhaDrainFocus`'s zero crossing; `total` = the NEW focus | Whispered Doubt, Coercive Pressure, Predatory Insight |
  | `turn-start` | `edhaAnnounceTurnStart` on `combatTurnChange` / `combatStart`, from ONE client (`edhaDefBuffGmGate`); `total` = the combatant's CURRENT focus | Puppeteer — 07-24s |

  `turn-start` was built **with** Puppeteer, its only reachable consumer, not schema-only. Carrying
  the current focus as `total` is what makes "starts its turn at 0 focus" a plain
  `{whenTotal: at-most, whenTotalValue: 0}` gate with no kind-specific field — the same trick
  `focus-change` uses. The other four talents queued under this kind (Apex Form, Primal
  Regeneration, Consuming Decay, Bear Witness) still need payloads that do not exist.

  Queued and measured in audit §9o: `damage-applied` · `token-move` · `attack-declared`. **Do not
  build one schema-only** — every consumer of those three is blocked on a missing PAYLOAD (a
  pre-damage veto, in-flight damage reduction, a second-hit counter, movement-path mutation), so the
  kind would ship with zero usable consumers. The payload is the work.
- **`payloadTarget`** (victim | actor) — a test has two parties and the payload wants the one it
  resolved AGAINST; `defeat` and `focus-change` have ONE, so `actor` binds the payload to the creature
  that dropped / lost focus. It also keys the `once: round-per-target` budget, or a per-creature limit
  silently degrades to per-round for want of a victim.
- Filters: `watch`, `whenSkill` (comma-list; **colours are skill ids**, so `"black,red"` and `"dec"`
  use one field), `whenVs`, `whenOutcome`, **`whenTotal`** (any | at-most | at-least) + `whenTotalValue`,
  `requireSelfStatus`, `requireTargetStatus`, `once` (no | round | round-per-target).
  - `whenTotal` is TWO fields because the bound that matters is **0** (Predatory Insight's "reaches 0
    focus"), so "unset" can never be spelled as a number. It **fails CLOSED** on an unreadable value —
    the opposite of H1's defense read, because a scene-wide passive firing on a non-fact is worse.
- **`chain`** (default off) — a watcher's payload is normally invisible to the next watcher (Crown's
  spirit damage must not cascade), enforced by a DEPTH guard capped at 2. Turn it on when the caused
  event is genuinely a new one: Predatory Insight is the only rule in the project that sets it, because
  a creature emptied by Whispered Doubt's extra loss must still count (the 07-05 test-pass lesson).
- **`ev.chainBounded` + `edhaWatchEntryLevel(openCount, chainBounded)` (07-27b — bench run 5's
  harvest DISPATCH loss).** The depth guard's counter counts OPEN dispatches, and SIBLING events
  from one payload overlap — the 2nd simultaneous nested kill used to read its sibling's open
  frame as its own ancestry and be dropped at the door. An ANNOUNCE SITE whose kind is
  structurally non-repeating (defeat: live→0 fires once per creature, so its chains cannot loop)
  passes `chainBounded: true` and the dispatch CLAMPS to chain level instead of dropping.
  **Never declare it for a kind that can ping-pong** (focus-change) — the ≥2 drop is what ends
  those loops. The pure entry decision is `edhaWatchEntryLevel` (pinned,
  `tests/watch-dispatch.test.js`, which also drives the real dispatcher through the bench
  interleaving); the loop chain-gates on its LOCAL level, never the shared counter.
- **`vs: "none"`** = the observation itself is the trigger. Otherwise the observed total is compared
  through H1's own `edhaDefTestOutcome` — no second roll, no new comparison code.
- **Silence on a miss is not a field.** Write no `edha-test-fail` rule and a failed watch does
  nothing (Extract Thought). This is why `whenOutcome` describes the OBSERVED test only.
- Pure **`edhaWatchMatches(h, ev)`** + the sweep **`edhaWatchersOfRule(type)`** (memoized; dropped on
  any item/token/actor CUD — deliberately NOT on `updateActor`, which fires on every HP change).
  Both pinned in `tests/`. The sweep is `edhaDarkVeilSweep`'s idiom and names no talent.
- **Announce, don't route.** Engine code that resolves a qualifying test calls
  `edhaDispatchWatchers({kind, owner, victim, skill, def, ok, total})`. That is how Crown of Thorns
  converted while Kneel stayed engine-owned — cut a named-call coupling **at the caller**, and the
  callee converts alone.
- Manual surface: a `.edha-watch-manual` button (data-attrs `watch`/`skill`/`def`) posted from an
  `edha-note` re-announces a test the engine did not resolve. Generic; owner comes from the message
  speaker (an `edha-note` substitutes @-refs before posting, so a `@actorUuid` attribute cannot work).
- **Scene-arming: use a STATUS, not a flag.** Nothing lets a rule write an arbitrary flag, so a flag
  keeps the arming engine-owned. `edha-self-status` {timed: false} writes it, `requireSelfStatus`
  reads it, and it shows on the token. A generic pre-cost veto refuses re-using an already-armed
  talent (any untimed `edha-self-status` rule — no name involved).
- H1 companion field **`requireTargetStatus`** (comma-list, vetoed BEFORE cost) — Absolute
  Authority's compelled/frightened/weakened gate.

## Asking the player — H6 `edha-prompt-pick` (07-24s)
**Reach for this when the card says "choose one" or "you may".** A rule can resolve a test and apply
an effect; it cannot ASK, which is why 31 talents that offer a choice were engine code.
- **The click DISPATCHES BACK.** It fires `edhaDispatchTestResult(owner, item, picked, true, …)`, so
  the payload is the item's own **`edha-test-success`** rules with the PICKED creature as the
  subject. H6 owns no payload vocabulary — every payload handler works on a pick unchanged, the same
  trade H8 makes. Put what happens on a success rule, exactly as for a gated test.
- **`source`** — `confirm` (one accept button; the subject is whatever the trigger already resolved
  against) · `creatures` (one button per creature matching the filters). Sources for a picked
  **status / item / effect** are NOT built: their payload would have to receive the picked THING
  rather than an actor and no payload handler takes one. That is why Beacon of Stability, Surgical
  Precision, Devoted Presence, Reknit Form and Unweaving are still name-keyed. **Build a source with
  its payload, never before it** — the same rule §9o states for the watch kinds.
- Candidate filters: `relativeTo` (self | victim), `rangeColor` / `rangeFt` (**one is required** —
  a pick over the whole scene is never what a card means), `disposition`, `includeSelf`,
  `requireStatus`, `aliveOnly`, `emptyNote`.
  - **`disposition: anchor-ally` / `anchor-enemy` are measured around the ANCHOR, not you.**
    Unnerving Approach pushes an ally OF YOUR TARGET; plain `ally` gets that exactly backwards.
    The anchor is also passed to the payload — that is what `edha-push`'s `awayFrom: anchor` reads.
  - `aliveOnly` **fails OPEN** on an unreadable HP, the opposite of `edhaWatchMatches`' `whenTotal`.
    The failure modes are not symmetric: a scene-wide passive firing on a non-fact is silent, one
    extra name on a whispered card is visible and declinable.
- **`costs`** ("foc:2, inv:1"; a bare name means 1) and **`once: round`** are both spent on the
  **CLICK**, not when the card posts — so a declined offer costs nothing. A cost that does not parse
  to a positive whole number is DROPPED, never defaulted to 0 (a silent 0 is a free reaction that
  looks like a working card).
- **`note`** posts only when the talent carries NO success rules — the table-run case. `{name}` is
  substituted with the creature picked (Puppeteer: "chooses one of {name}'s actions this turn").
- **A pick's payload never re-asks.** `edhaDispatchTestResult` filters `edha-prompt-pick` rules out
  under `ctx.viaPick`, or a prompt posted FROM a success rule (Puppeteer's) would re-post for ever.
  Filtered, not skipped, so `rules.length` still answers "did this talent carry a payload".
- `announce: false` on the dispatch — a pick is not a test, and announcing one would let an
  unfiltered `watch: test` rule fire on every choice anybody makes.
- Pure **`edhaPickAccepts(h, c)`** + **`edhaParseCosts(s)`**, both pinned in `tests/`.

## Bulk detonation — H12 `edha-detonate-list` (07-24s)
Set off every marker you have placed at once. One rule on `use`; the handler reads the ledger from
the engine side, so it needs no legacy-path escape and is **not** coupled to the marker ledger's own
migration.
- `source` is a **choices list of one** (`charges`) on purpose: a free-text flag key would silently
  get an UNFILTERED read (`edhaGetCharges` scene-filters, a bare `getFlag` does not). Adding a marker
  family means adding its accessor, not typing a string.
- `radiusFt` · `bonusFormula` (written as an addition, `" + @attr.int"`) · `ignoreDeflect` ·
  `doubleCaughtFormula` + `doubleCaughtType` (the multi-catch bonus — Cascading Failure's whole
  mechanic) · `oncePerScene` (per item id; cleared with the markers) · `requireNonEmpty`.
- **`mergeTerrain` MERGES NOTHING.** There is no geometry union in the project. It swaps the terrain
  damage formula and prints a GM instruction, which is what the hand-rolled version did too.
- The empty-list and once-per-scene refusals are a **`preUseItem` veto keyed on the rule's presence**,
  because an executor runs after the system has already charged the cost — the same move H1 made.
- ⚠ **It WRAPS two name-keyed branches rather than retiring them**: `edhaResolveCharges`' body still
  hard-codes Pinpoint Charge's extra keen and Concussive Yield's prone rider. Both still need their
  own conversions.

## "Already generic" is about the BODY, not the signature (07-24s)
Two passes in a row costed a build as "just a schema over an existing generic helper" and both were
wrong the same way — `edhaPostCalcTestCard` (H6) and `edhaResolveCharges` (H12) have generic
*signatures* and name-keyed *bodies*. **Before reusing a helper, grep its body for talent names.**
If it contains one, a handler wrapping it inherits the name-key and the ratchet moves less than the
plan says.

## Offering a reaction when someone ROLLS — H26 `edha-test-react` (07-25)
**H25's coord/test-triggered twin, built as predicted — five talents in one handler** (Shared
Conviction, Pillar of Order, Concordant Presence, Voice of Authority, Green's Pack Sense). Someone
rolls; you get a whispered card to spend a resource and react. Config-only: `edhaTestReactWatch`
sweeps the rules on every skill/attack/item roll (GM-gated).

Gates: **`rolls`** (comma-list: which roll hooks) · **`rollerIs`** (`ally`|`enemy`) · **`when`**
(`any` | `complication` | `plausible-fail` = Complication or kept d20 ≤ 10, owner judges ACTUAL
failure) · **`requireSkillTest`** · **`rangeColor`** · **`requireSeen`** (the 07-12 through-walls
ruling) · **`requireTargetInMyTerrain`** (Pack Sense). Spec: **`action`** — `offer` (the
edhaPostCoordReactionCard path; add **`contest`** for Shared Conviction's ask-the-DC boost and
**`modFormula`** for `{mod}`/`{boosted}`), `grant-plot-die` (edhaPostPlotGrantCard, once per
(skill, round)), `disadvantage-reroll` (edhaPostVoiceCard → re-roll kept d20, keep lower, rewrite
the roll card). **`costs`** ("foc:2, inv:1", spent on CLICK) · **`prompt`/`result`/`note`** with
`{roller} {owner} {total} {skill} {mod} {boosted}` (pure fill: `edhaFillReactTemplate`, pinned).

## The White path's other new primitives (07-25, pass R)
- **H27 `edha-damage-reduce`** — config-only, read by the applyDamage PRE-pass: passive reduction
  before the hit lands. `when` (`damaged`|`redirected`) · `requireVictimAdjacent` ·
  `requireAdjacentAllies` (N) · `rangeColor` · `color` + `amountFormula` with **`@colorRank`**
  (skill rank for a PC, ROLE rank for an adversary owner — ruling 122) and `@tier`. First
  qualifying owner per talent wins. Shield Wall · Devoted Conduit.
- **H7 `edha-aura`** — config-only, read by the adjacency sweep: a managed AE on you (+ adjacent
  living allies unless `alsoAllies: false`) while adjacency holds. `key` / `amount` / `label` /
  `img`. Guardian Stance. Legacy `guardianStance` AEs are swept off automatically.
- **`edha-pulse`** — executor: heal (`formula`) or a status (`statusId`) to every ally in
  `rangeColor` Attunement Range; `visibleOnly` reproduces the White Draw-Mana skip accounting;
  `includeSelf`. Collective Resolve (use) · White Leyline Attunement (edha-draw-mana event).
- **`edha-cleanse`** — executor: the Beacon card (one button per ally-condition in range; click
  spends `costs`). Beacon of Stability on the edha-draw-mana event.
- **`edha-move-window`** — executor: arms the round-scoped `moveWindow` FLAG; the updateToken
  watcher posts the allies-within-`rangeFt` half-Speed card on each move. Ordered Advance.
- **`edha-designate`** — executor over the Tool A2 designate-mark primitive. Guiding Signal.
- **`edha-accord-forge`** — the H6 success payload that forges an accord with the picked creature
  (`modFormula` stored on the partner's flag; **`shareModIfOwns`** is the upgrade-talent gate —
  Bound by Word lives HERE, its own document deliberately empty). The accord watcher is selected
  by the FLAG, never a name.
- **H1 `vs: prompt-dc`** — the DC is ASKED FOR when the owner's roll resolves (edhaPromptDC);
  declined = fail-open (§9m q9). Counterpoint (PC) + the Callthief's adversary copy.

## Offering a reaction when someone is hit — H25 `edha-damage-react` (07-25)
**The Bulwark shape, and the template for every "watcher offers a card" family.** An ally near you
takes damage (or drops to 0); you get a whispered card to spend a resource and intervene.

Fields: **`when`** (`damaged` | `dropped-to-0`) · **`action`** (`heal-ally` | `redirect` |
`retaliate` | `revive`) · **`requireAdjacent`** / **`rangeFt`** ·
**`requireAttackerWithinColor`** (needs a hostile attacker inside that colour's Attunement Range —
Retributive Guard) · **`amountFormula`** (owner roll data; **`@dealt`** = the damage that just
landed; dice allowed) · **`capAtDealt`** · **`dcFormula`** (fills `{dc}`; ceilinged, floor 1) ·
**`costResource`/`costValue`** · **`oncePerRound`** · **`prompt`** with `{victim} {attacker} {dealt}
{amount} {dc}`.

Config-only **by design**: `edhaBulwarkReactions` (in the applyDamage wrapper) reads these rules and
posts the card, and `edhaBulwarkClick` already resolves each action off data attributes. Nothing ever
`use`s a reaction talent, so an executor would be wrong.

**Why this converted four talents at once, and what to copy.** The four White Bulwark reactions were
already ONE shape — *watch → gate → amount → action → cost → prompt* — posting through a poster that
was already generic. Only the **selection** (`edhaCharacterOwnersOf(NAME)`) and the **spec** were
hard-coded. So the dispatcher now **announces** (sweeps `edhaWatchersOfRule("edha-damage-react")`)
and the spec rides the document. **When the blocks differ only in values, the values are schema
fields and the handler is mostly deletion.**

⚠️ It appeared in **no** demand column: the four were filed `H8+H6`, both built. What was missing was
the **spec vocabulary**, which is neither a watch nor a prompt. Adding a fifth reaction of this shape
is now authoring, not engine work. **The coord/test-triggered twin was BUILT the next day as H26
`edha-test-react` (see above) and took five talents at once.**

## Telling the player something — H24 `edha-reveal` (07-25)
**Reach for this before hand-rolling another whispered card.** Given a creature and a comma-list of
fact ids, it posts the facts as card text. It is the payload half of scouting: `edha-note` carries
**static** text, so "tell me this creature's numbers" previously had nowhere to live and two talents
sat on the ratchet for want of it and nothing else.

- **`facts`** (comma-list, rendered **in the order authored**) — `hp` · `conditions` · `defenses` ·
  `lowest-attribute` · `lowest-defense` · `below-half`. Unknown ids are skipped, not rendered as junk.
- **`hideDefenses`** (comma-list of `phy`/`cog`/`spi`) subtracts from `defenses`. It is a subtraction
  rather than three fact ids because Studied Mark deliberately withholds Cognitive, and that single
  difference is all that separates its card from Vital Diagnosis's.
- **`separator`** — `"; "` reads as a report (Vital Diagnosis), `" · "` as a menu of things you could
  learn (Sharp Eye). One implementation, two card styles.
- **`target`** — `target` / `victim` / `self`. Use **`victim`** on a test-success or watch payload:
  `edhaDispatchTestResult` passes the victim, and re-reading `game.user.targets` there is the bug.
- **`whisper`** (default **on**) — knowing a thing and announcing it are different acts.
- **`note`** — free text for a table instruction the engine cannot enforce ("pick ONE to learn").

**The pure half is `edhaRevealFacts(target, {facts, hideDefenses})`**, which returns the CLAUSES and
lets the caller join them. Unit-pinned in `tests/reveal.test.js`, including that
**`edhaGnosisRevealLines` is byte-identical** to its pre-07-25 form — it now delegates here, and it
is still called by Studied Mark and The Final Study, so a drift would silently change cards on
talents nobody touched.

⚠️ **Why it was invisible.** Sharp Eye's row read `needs: [H1]` and **H1 was built**, so it counted
as ready in every priority run — while the engine's own comment above it said *"what still needs a
payload H1 cannot supply"*. H1 decides success/failure and owns **no payload vocabulary** (the same
trade H6 and H8 make). **A `needs` entry naming only a gate is not a satisfiable row.**

## The Green path's primitives — H2 the zone family + the pack/heal shapes (07-25, pass 2bS)
Green cleared as five shapes. All sweeps ANNOUNCE (`edhaWatchersOfRule` / the dealer's or healer's
own items); none names a talent.
- **H2 `edha-zone`** — executor: click-to-place a [Size] difficult-terrain square Region within
  Attunement Range (`color` drives tint/ownership/rank scaling; `sizeFt`/`rangeFt` 0 = by rank).
  Picker + Region write + GM relay stay ENGINE-OWNED (`edhaCreateGreenTerrain`/`edhaDropGreenTerrain`).
  Green Leyline Attunement on the `edha-draw-mana` event — **`EDHA_DRAW_MANA` is Black-only now.**
- **`edha-zone-hazard`** — config-only, read by the zone creator off the CREATOR's items: the
  terrain also damages on enter / turn-start (`damageFormula` with `@colorRank`/`@tier`, baked at
  placement; `damageType`; `label` blank = talent name). Thorn Field (PC) + the Fellstag's Thorn
  Hedge + the Briar-Gone Grove's verbatim copy (both in `data/adversaries.json`). `edhaOwnsThorn`
  is DELETED.
- **`edha-zone-react`** — config-only, read on `combatTurnChange`: a creature ends its turn in
  your zone → whispered expand offer (`sizeFt` 0 = by rank, `costInv` spent on the CLICK, one
  offer per owner per round). Spreading Roots.
- **`edha-test-rider` gained two gates** — `whenEnemiesInMyZone` (N living enemies inside terrain
  you created) and `unlessDisadvantage` (never stomp an active disadvantage). Apex Predator is
  {mode advantage · whenAttribute str,spd · both gates}; its bespoke pre-roll trio is deleted.
- **`edha-adv-attack`** — executor over the existing `advAttackNext` pipeline: `to: self|pack`
  (pack = you + allies adjacent to your targeted enemy — Pack Hunter), `vsLowestHp` +
  `rangeColor` + `once: round` (the Scent the Weak scan; the card names the weakest enemy).
- **`edha-strike-window`** — executor: arms the `strikeWindow` flag (renamed from `packPressure` —
  generic) until the start of your next turn; the card text is the rule's editable `note`.
  Read by `edhaStrikeWindowActive`.
- **`edha-damage-bonus`** — config-only, dealer-side applyDamage pre-pass sweep: a bonus instance
  of the attack's own damage type on qualifying hits. `require: window` (Pack Pressure) or
  `pack-on-target` (Coordinated Hunt — `@hunters` = different attackers on the victim this round,
  from the focus-fire tracker); `amountFormula` with `@colorRank`/`@tier`/`@hunters`. A gate is
  REQUIRED — an ungated always-on bonus is `edha-pre-deal-damage`'s job.
- **`edha-unseen-ward`** — config-only, read by the pre-roll injector: an ally within `rangeFt`
  targeted by an attack they can't see (edhaCanSee) → the attack takes −`amount`; `excludeSelf`
  is the "an ally" exclusion. Packmate's Warning.
- **`edha-heal-react`** — config-only, announced from BOTH heal chokepoints via
  `edhaDispatchHealReact(healer, healItem, target, amount, prevHp)` — the healer's OWN rules.
  `whenColor` gates on `edhaTalentColor(healItem)` (the Green gate left the chokepoints). Actions:
  `queue-regrowth` (auto; resolves at the owner's next turn start, `rangeColor` re-check,
  `amountFormula` — Resurgent Growth) · `offer-thp` (below-half gate; cost + roll land on the
  CLICK; `amountLabel` is the card's human formula name — Vital Surge) · `offer-cleanse` (one
  button per present condition from `conditions`; `costNote` stays honour-system — Natural
  Recovery).
- **`edha-remove-injury`** — executor: the injury menu for your target (default self), one button
  per removable injury, `costTemporary`/`costPermanent` spent on the click, death injuries never
  listed. Reknit Form.
- **`edha-suppress-veil` + the `clearsight` status** — Natural Order RE-LITIGATED off the manual
  list (the Dread Presence lesson: the dark-veil sweep IS a nameable hook). Its own
  `edha-self-status` arms `clearsight` for the scene (cleared on deleteCombat); while armed,
  hostile auto dark-veil markers within `rangeColor` Attunement Range stay DOWN
  (`edhaVeilSuppressed` inside `edhaDarkVeilSweep`; a GM's manual toggle is never fought).
  Illusions / deception-advantage ride the talent's `edha-note`.
- **`edha-overflow-thp` gained `deflectStackMax`** — the Deflect-rider discriminator (Overgrowth
  3; Life Surge's identical rule has none and grants none — the pass-M trap resolved as a FIELD,
  exactly as ENGINE_INDEX warned). `edhaOvergrowthDeflectStack(target, label, max)` is
  parameterized; the AE flag key stays `overgrowthDeflect` so pre-07-25 effects still clear.
- **Pure `edhaSubstRankTier(formula, rank, tier)`** — the shared `@colorRank`/`@tier`
  substitution (H27's inline pair extracted); pinned in `tests/engine-helpers.test.js`,
  mutation-checked both ways.

## The FINAL primitives — Blue + the last ledger (07-26, pass 2bAA)
**Ratchet 4 → 0. The rule-2b migration is complete: no talent name is dispatched on in engine
code, and every marker ledger lives under `flags.edha-content.lists.<key>`.**
- **H22 `edha-barrier`** — the engine's FIRST blocks-movement capability. Executor: click-place
  (`edhaPickPlacement`), refuse+refund an OCCUPIED square, summon the HP token at the point, and
  raise a box of four real Foundry **Walls** around it. Walls are GM-create-only, so a player
  relays (`barrier-walls` / `barrier-clear`, the foundation-place shape); walls and summon share
  a `barrierId` because a relayed summon materializes on the GM's client and the caster never
  sees the actor. Fields: `hpFormula`, `sizeFt`, `defensePenalty`, `blocksMovement`,
  `blocksSight` {none|limited|normal}, `rangeColor`/`rangeFt`, `note`. **COVER IS STILL A TABLE
  READ** — `blocksSight` ships `none` deliberately. Lifecycle: the HP-zero branch in the defeated
  sweep (destroyed = walls down, not a skull on a token that still blocks the corridor),
  `deleteActor`/`deleteToken`, and a `deleteCombat` sweep. **Pure `edhaBarrierSegments(x, y,
  sizePx)`** — the four `c` arrays, pinned on the property that matters (the box CLOSES; a
  one-pixel gap is a gap a token walks through), mutation-checked both ways.
- **`edhaPickPlacement(item, {color, rangeFt})`** — the Fate/Bone-Garden placement convention
  factored out: range ring, `edhaPickPoint`, and a **REFUND** on cancel or an out-of-range pick
  (executors run after the system has charged). Returns a snapped CENTRE or null. Reach for this
  before writing another picker.
- **`edha-summon` widenings** — `tokenSizeFt` / `tokenSizeColor` ([Size] off a colour's rank,
  which used to be computed in code) and `placeAt: pick-point` + `rangeColor`/`rangeFt`.
  `edhaSummon` now honours **`at: {x, y}`** (re-centred against the token's own size, since token
  x/y are TOP-LEFT). No summon could be placed at a chosen square before 2bAA — which is why
  every "at a point within Attunement Range" card spawned beside the caster. Four of the six
  spec fields the schema hides stay hidden on purpose: they are per-cast runtime values.
  **`creatureType` (07-26n)** — authorable creature type: blank = the schema default (humanoid);
  `"Construct"` mints `system.type = {id: "custom", custom: "Construct"}` (native ids pass
  through as ids), which is what **`edhaIsConstruct`** — now reading the schema-true
  `system.type`, the old `system.customType` read was a dead field (bench run 4) — and any future
  creature-type gate reads. Forge Construct is the first consumer; a summon minted before the
  rule change keeps its old type until re-forged.
- **`edha-illusion-copy`** — the rule-keyed entry to the phantom belief loop (ENGINE-OWNED
  re-litigated and confirmed: a `Token#isVisible` patch is not a rule chain). Fields: `copyOf`
  {target-or-self|self}, `sourceLabel` (blank = the item's name — stamped as `phantomSource` and
  read back by every card and the fooled-target riders), `hpFormula`, `speed`, `defensePenalty`,
  `beliefDefense`, `beliefSkill`, `rangeColor`. The sweep reads the stamped skill; no talent name
  survives in the flow. Consumers: Phantom Double + BOTH adversary "The Seeming" abilities.
- **`edha-illusion-upkeep`** (config-only; the `combatTurnChange` sweep is its reader) —
  `resource`, `costPer`, `qualifier`, `note`. The pay button carries its DOCUMENT, so the click
  charges what the rule says.
- **`edhaGetOrdained` → `edhaOwnerList(o, "ordained")`** — the SIXTH and last ledger repoint.
  One accessor moved it and all five readers followed for free. `edhaGetFateList` /
  `edhaSetFateList` are DELETED with the last flat marker key.

## The Black + heroic mop-up primitives (07-26, pass 2bZ)
Ratchet 14 → 4 — only Blue's four remained (pass AA cleared them).
- **`edha-ritual-paid` EVENT + `edhaDispatchRitualPaid(actor, item, paid)`** — fired by
  `edhaRitualHpCost` AFTER the health deduction; a Reserve payment (Double Dip) deliberately
  never fires it. `options.paid` carries the amount. The edha-draw-mana shape: sentinel hook,
  knows no payload type.
- **`edha-reserve-bank`** (executor) — banks `options.paid` into Reserve, cap = `capFormula`.
  ALSO the Reserve-user rule key: `edhaReserveCap`, the sheet Reserve bar, the Spend-Investiture
  checkbox and the Double-Dip offer are all `edhaActorRuleOf(actor, "edha-reserve-bank")` now
  (colorRank-black cap fallback for a pre-sync actor). Blood Price's advantage = a plain
  `edha-next-test-mod` {self, advantage, black} on the same event (bloodPriceAdv pipeline deleted;
  the 2bI-4 single-slot caveat applies).
- **H17: pure `edhaTargetFormula(formula, targetData, recoveryDie)`** — `@target.recoveryDie` →
  the die spec, `@target.<path>` → the NUMBER at that path of the target's roll data (0 when
  unreadable), owner refs pass through. Pinned + mutation-checked. Wired into `edha-focus`:
  a formula containing `@target.` resolves against WHO the rule acts on, and a formula with DICE
  is rolled async and the roll POSTED (the Galvanize card fix). `edhaRecoveryDie(actor)` +
  pure `edhaNormalizeDie(raw, fallback)` are the ONE recovery-die path (⚑ the system read is
  still bench-unverified; normalisation pinned).
- **`edha-focus` grew `resource: hea`** — a relay-safe HEAL of the rule's subject
  (edhaCrossHeal); gain-only. Field Medicine's payload.
- **`edha-watch` grew `whenOnMyList` / `whenOnMyListStatus`** — the own-ledger gate: the observed
  subject must be on the WATCHER's ledger (Cold Eyes: the dropped creature is MY quarry). Checked
  in the sweep, not edhaWatchMatches (membership needs the watcher).
- **Config-only veto trio** (iron rule 3 — all three ENFORCED, rule-keyed; the pass-Y shape):
  `edha-focus-guard` {reduceFormula, vetoStatus, whileFocusAbove} read by `edhaDrainFocus` + the
  preCreateActiveEffect veto (Wary); `edha-hp-floor` {floorFormula, spentFlag} read by the
  preUpdateActor veto (Resilient Hero — `edhaFlagSpent` tolerates the native writer's stringly
  values); `edha-move-veto` {moverStatus, rangeColor, rangeFt} read by the preUpdateToken sweep
  (Dread Presence — adversary copies carry their own rule; `edhaOwnersOf`/`edhaWithinAttune`
  DELETED, the W29 pin re-anchored onto `edhaWatchersOfRule`).
- **FIRST authored NATIVE rule** — Resilient Hero's `long-rest-actor` + `update-actor` {target:
  parent, changes: [{key: flags.edha-content.resilientSpent, mode 5, value "false"}]} (⚑ 2bA-9:
  bench-verify the system accepts the shape).
- **`edha-pulse` grew `who: enemies` + `requireIsolated`** — the enemy side runs the 07-12b
  information rule: public card counts only what the player can SEE, hidden/wall skips whisper
  via `edhaPostGmCard`. Black Leyline Attunement's Draw Mana rider; **`EDHA_DRAW_MANA` is
  DELETED** — `edhaDrawMana` is recover-Investiture + dispatch only.

## The Destruction + Red paths' primitives (07-26, pass 2bY)
Both trees to zero; the `charges` ledger repointed (the FIFTH of six — POINT-BOUND entries like
snares, plus a NESTED `trig.targetUuid` the reconcile never sees; H3 fails OPEN by design,
covered by the 2bV/2bX pin). Writes via `edhaSetOwnerList("charges", …)`; unset-on-empty dropped;
canvas + the arm/trigger machinery stay with the placement/detonate handlers (every cleanup a
raw-path hand-edit, incl. `edhaClearCharges` on `lists.charges`). Only Fate's `ordained` remains
legacy. No talent name in code.
- **`edha-zone` grew kinds `charge` / `line`** — `charge`: click-place a detonation marker into
  the `charges` ledger (`edhaSetChargeMarker`): cap/evict/size/range off the rule, blast damage
  off ITS document, the arm card + watchers unchanged; Attunement-Range gate on the pick (NEW —
  card-is-spec); cancel/out-of-range/refused-at-cap REFUNDS. `line`: click-direction line AoE
  (`edhaFaultLine`): length/width/constructMult/save dials as fields, damage off ITS document,
  the foe save engine-rolled via `edhaFoeSkillVsColor`, line hazard dropped; cancel refunds.
  (`edhaSpeedVsRedProne` retired — both callers carry their dials now.)
- **`edha-detonate-react`** (config-only) — the detonation counterpart of edha-snare-react: swept
  by `edhaResolveCharges` after every detonation (it rides Set Charge, Cascading Failure and The
  Unmooring alike); skill/skillLabel/color/failStatus fields, engine-rolled per foe. Concussive
  Yield is the first consumer. The resolver also reads the Pinpoint rider off the entry's
  `sourceItemUuid` (H3ann's stamp) — formula/type off the annotating document, and the H3
  annotate op now reposts the Charges card for the `charges` key and names point-bound entries
  "`<talent> #n`" on the card.
- **`edha-zone-react` grew `when: defeat-in-zone` + `action: ignite-spread`** (with its payload,
  per its own §9o growth rule) — a character drops to 0 HP in the owner's dangerous terrain →
  ignite a zone on the body + the spread card; radius/spread/formula/type fields; swept via
  `edhaWatchersOfRule`; its executor posts the armed reminder on use. Combustion Chain is the
  first consumer.
- **`edha-place-hazard` grew `mode: trail` + `spreads`** — `trail`: using the talent TOGGLES the
  generic `hazardTrail` flag (legacy `walkingRuin` honoured/cleared); the move watcher
  (`edhaTrailRuleOf`) drops patches with the rule's formula/type/colour. `spreads`: stamps the
  placed Region so the end-of-turn spread watcher keys on DATA — `EDHA_PYRE_SOURCES` is deleted;
  Pyre and the Cinderbrock's Fire the Wrack each carry the field.
- **The `damaged` watch kind (H8)** — every real damage application bumps the victim's per-round
  hit counter (`bpHits.<round>`, the legacy key) and announces {kind: damaged, owner: victim,
  total: count}; "struck a 2nd time this round" = `whenTotal: at-least 2` + `once:
  round-per-target` + `payloadTarget: actor`. Breaking Point is the first consumer.
- **`edha-test-rider` grew `unlessSkills`** — a comma-list EXCLUDE (whenSkill is a single
  positive id): "Presence except the five casts" for Frenzied Tempo, where `black` is itself a
  Presence skill.
- **`edha-reroll-react`** — the mark-payoff Reaction, ENGINE-OWNED flow keyed on the rule
  (`edhaRerollReactFlow`): remove your `markStatus` mark from the target, reroll-take-lower its
  most recent test (chat scan + kept-d20 rewrite/relay); pre-cost veto (no marked target =
  nothing spent); rule-keyed auto-prompt with per-rule mute (`promptOff.<item>`, re-armed by a
  real use; legacy `shatterPromptOff` honoured). Deity/Chaos's Shatter Focus is the first
  consumer — leyline/Red's SAME-NAMED talent is `edha-focus {op: drain, target: victim}`, and
  **`edhaDrainFocus` grew the cross-actor set-resource relay** (a use-event drain runs on the
  player's client; `edhaCrossFocusLoss` folded in). Mark helpers status-parameterized:
  `edhaBearsMyMark` / `edhaRemoveMark`.

## The Fate path's primitives (07-25, pass 2bX)
Fate to zero; the `snares` ledger repointed (the FOURTH of six — POINT-BOUND entries, no uuid/no
marker status, H3's reconcile fails OPEN by design, pinned). `fateOrdained` was the LEGACY flat key
behind `edhaGetOrdained` until **pass 2bAA repointed it** (`lists.ordained`, same shape) — there is
no flat marker key left in the engine. No talent name in code.
- **`edha-zone` grew kinds `ordained` / `snare`** — click-place a 5 ft marker square into the
  owner's marker ledger (`edhaFatePlaceCore`): cap/evict/colour off the rule, a snare's damage
  formula/type off ITS document, entry stamped `talent: item.name` (card/AE titles are data).
  Attunement-Range gate on the pick (NEW — card-is-spec); cancel/out-of-range REFUNDS. Snares get
  the trigger Region (`edha-content.fate-snare`, GM-relayed). **And `kind: link-markers`** — the
  player PICKS two of their squares in a dialog (annotated when beyond range) and both gain the
  `linked` annotation; <2 squares vetoed pre-cost; cancel refunds. Pure `edhaLinkedSquareNear`
  (pinned, mutation-checked).
- **H3 `edha-owner-list` annotate grew `sourceItemUuid` (always stamped) + `riderFailStatus`** —
  the Pinpoint correction: a downstream resolver reads the rider's extra die off the annotating
  DOCUMENT's damage formula and the contest off `riderSkill`/`riderColor`/`riderFailStatus`
  (Fate's spring: SPD vs Green → Disoriented, engine-rolled). audit.py `doc_contest` knows this
  second document-carried contest form.
- **`edha-zone-guard`** (config-only) — defender-keyed marker-square protections: `thpFormula`
  read by the legacy-marker turn-start pass, `noAdvantage` by the pre-roll injector
  (`edhaZoneGuardNoAdvantage` — announced via `edhaWatchersOfRule`, the inverse of
  edha-unseen-ward). Bulwark Ground is the first consumer.
- **`edha-snare-react`** (config-only) — swept by the spring resolver (`edhaFateSpringReacts`)
  off the OWNER's items: `offer-mark` posts the mark offer (click writes `markedBy.<markKey>`)
  AND feeds the applyDamage pre-pass rider (`edhaMarkedNearZonesBonus` — bonus/type/nearFt all
  fields; marks with no matching rule pass through, scene cleanup clears mark keys by DATA);
  `prompt` posts the note when the spring is within `nearFt` of a `linked` square. Hexmark +
  Weave the Thread are the first consumers.
- **`edha-marker-command`** — ENGINE-OWNED card flows over the owner's markers, rule-keyed (the
  edha-decree exit shape): `move` (≤maxFt slide, snare Regions move too), `spring-pick` (button
  per unsprung snare, bonus = THIS item's damage formula), `spring-all` (declare + resolve-all +
  rally note; `oncePerScene` via the generic sceneOnce, vetoed pre-cost). Read the Threads /
  Foreknown Strike / Thread of Inevitability are the first consumers.
- **The Hunter stretch: `edha-damage-bonus` grew `rangedOnly`** (meleeOnly's mirror — a
  definitively melee hit stands down without consuming the arm) **+ `placeList` /
  `placeListStatus` / `placeListCapFormula`** — post-apply SUSTAINED-LEDGER placement (mark-first,
  oldest fizzles, follows the creature, fires at +0 bonus on an armed hit; Tagging Shot's quarry
  mark). **The `quarry` ledger repointed**: `quarryUuid` string flag → H3 `lists.quarry` (cap 1,
  new registered `quarry`/`tagged` statuses); `edhaQuarryOf` is the 3-line string→array ADAPTER
  (pinned — the 07-24v "accessor repoint does not transfer" correction), and Cold Eyes' clear is
  a raw-path hand-edit (Cold Eyes itself stays on the ratchet).

## The Death + Life paths' primitives (07-25, pass 2bW)
Both trees to zero; the `remains` ledger repointed (the THIRD of six). No talent name in code.
- **H3 `edha-owner-list` grew `op: spend`** — consume your OLDEST entry as a cost (pop, unmark,
  card): `requireNonEmpty` (pre-cost veto), `confirm` (DialogV2; declining skips, later rules
  still run), and **`sceneFreebie` + `freebieLabel`** — "You begin each scene with 1" as a rule
  field. The freebie lives in **`edhaOwnerListAvail`** (raw-flag UNSET = one spendable freebie;
  any write consumes the unset state — "[] ≠ unset") + **`edhaLedgerSpend`** (the generic
  pop-oldest). Reach for `edhaOwnerListAvail` in any gate/spend path; plain `edhaOwnerList` reads
  [] for unset. `edhaOwnerList` also now guards a missing entry `uuid` (fail OPEN).
- **`edha-ward`** — the lethal-drop ward as a payload rule (Death Ward): writes the `deathWard`
  flag (+ `sourceName`); the applyDamage post-pass check and the defeat watcher's skip were
  always flag-driven and SURVIVED the dismantle. Already-warded / no-GM vetoed pre-cost.
  **H1 grew `skipIfAlly`** — a same-side target resolves as an immediate success, no roll compared.
- **`edha-turn-dot`** — gated apply of a start-of-ITS-turn drain that heals the caster a fraction
  (Consuming Decay): the tick, icon-removal cleanup and scene reset were already flag-driven
  (`decay`, now with `status`/`healFraction`/`sourceName`). Gates vetoed pre-cost.
- **`edha-revive`** — Raise Dead's ENGINE-OWNED flow, rule-keyed (the edha-decree exit shape):
  confirm + burst-apply revive + initiative surgery + auto injury; sceneOnce + target-at-0
  vetoed pre-cost; the optional ledger spend is freebie-aware.
- **`edha-zone` grew `costList`/`costListStatus`** (terrain that consumes a ledger entry —
  Bone Garden; empty vetoed pre-cost, cancel/out-of-range REFUNDS) and **`edha-zone-hazard` grew
  `moment: turn-end`** (ANY creature ending its turn inside — `edhaTurnEndHazardSweep`, the
  generalized Bone-Garden sweep). ⚠ the zone creator now prefers the PLACING item's hazard rule
  over the actor-wide scan (`edhaCreateGreenTerrain(..., sourceItem)` — mixed-tree owners).
- **`edha-focus` grew `resource: inv`** (plain clamped Investiture gain/drain — Reaper's
  Harvest's +1 on a defeat payload; focus keeps Wary/zero-announce). Reaper's watch rule is the
  first **`chain: true`** consumer after Predatory Insight — nested cascade kills still harvest.
- **`edha-damage-bonus` grew `healCutFraction`** — the armed hit also cuts the victim's healing
  (edhaApplyHealCut; "0" = no healing — Withering Touch, the H16 re-litigation: fields, not a
  handler). New `withernext` status (the predprimed shape).
- **`edha-mutation`** — the pick-an-adaptation chooser (Adaptive Mutation): options render from
  the rule's fields (keenFormula / venomFormula / deflectAmount); the click bakes the `mutation`
  flag the (name-free) Life readers consume. One-per-creature-per-scene is ENFORCED (07-27b):
  a `preUseItem` veto refuses an already-mutated target pre-cost, and the click is belted so a
  stale chooser cannot replace the graft.
- **`edha-regen-grant`** — start-of-THEIR-turn regen via the existing lifeRegen resolver (no new
  hook): `endOnVitalSpirit`, `mutationFormula`, and the apex package (`deflect` + `vitalFormula`
  → the `apexForm` flag: doubling + injury-on-end ride it; `sourceName` labels every card).
  Apex Form's FIVE mechanics are one rule.
- **`edha-cleanse` grew `trigger: success-damage-roll` + `conditions`, and `def` (07-27b)** —
  the cleanse card when this talent's own use SUCCEEDS. ⚠ the outcome is ENGINE-decided: the
  system binds NO DC to a skill_test talent's d20 and `roll.options.graze` only marks the twin
  damage fires (it is the ATTACHED graze sub-roll on the main fire — never "the test missed"),
  so the watcher compares the use's captured test (`_edhaLastRoll`, skill-matched) vs the
  target's `def` (default phy) through `edhaDefTestOutcome`. Success → cleanse card; graze →
  whispered no-cleanse note; unreadable/uncaptured → fail-open. (Surgical Precision; the
  name-keyed hook is a generic rule watcher now.)
- **`edha-redirect` {intercept} grew `watchFlag` / `linkOnUse` / `chooseAmount` / `takeType` /
  `healFormula`** (+ blank `rangeColor`) — a SINGLE linked creature instead of a ledger, the
  link written on use, the offer carrying an amount input, damage-type conversion, and a rolled
  heal-back die. Lifeline is one rule. ⚠ the Life scene reset clears the `lifeline` key by NAME
  (raw path — §9o trap 3).

## The Knowledge + Sovereignty paths' primitives — H3b + H9 (07-25, pass 2bT)
Both trees to zero in one session; two ruled builds landed inline (§9m q6 / q1).
- **H3b — `edha-owner-list` `mode: counter`** — the counted SINGLE BEARER: one creature carries
  0..cap points (`capFormula`, Insight = 5); `op: place` SETS the count and transfers the bearer
  (old bearer cleared — Studied Mark's literal text), `add` moves ±`count` (`requireBearerRange`
  = Accumulate's silent range gate), `release` clears ALL and still short-circuits on nothing.
  Engine half: `edhaCounterOn/Set/Add/BearerOf/IsBearer` (generic, keyed on `counters.<key>` +
  the status's `system.count` — ⚑ STILL the bench-verify field, now pinned in
  `tests/counter.test.js` with the rival-owner isolation case). Socket `counter-set`
  (ex `gnosis-set-insight`). Scene-cleared with the `packsight`/`packmind`/`predprimed` arms.
- **`edha-counter-transfer`** — config-only, swept by the live→0 stamp: bearer drops → whispered
  transfer prompt for `fraction`×count to a creature in `rangeColor`; `allyBurst`+`burstFormula`
  = Death Mark's public per-ally strike card (the OWNER's dice). Posters + clicks ENGINE-OWNED.
- **`edha-damage-bonus` grew three require modes + placement** — `armed-self-status`
  (`requireSelfStatus` arm, `consumeSelfStatus` for a next-hit arm, `weaponOnly` — Predatory
  Strike), `self-hits-counter-bearer` (Hunter's Discipline), `ally-hits-counter-bearer` (the
  cross-actor sweep: an ALLY's hit on YOUR bearer within your `color` range while armed — Pack
  Share/The Pack). `@counter` substitutes your count on the victim; `damageType` (blank = match
  the attack); `placeCounter`/`placeOnce: round` queues a POST-apply counter write
  (`edhaDamageBonusPost` drains it — the generic form of the predatory breadcrumb).
- **H1 `edha-def-test` grew** `targetCounter` (the test's target IS your bearer; no-bearer vetoed
  pre-cost — Killing Blow), `oncePerScene` (generic `sceneOnce.<item.id>` stamp, deleteCombat
  sweep) and `requireDisposition` (ally/enemy, pre-cost).
- **`edha-triggered-effect` grew `perCounterStatus`** (ONE roll ×max(count,1) — "per Insight";
  order the counter-release rule AFTER the damage rule) and its damage branch now RELAYS via
  burst-apply when the local client can't write the victim (the heal branch's old move).
- **H9 `edha-die-step`** — executor writing die-step ledger entries: `key` (what `whenKeys` /
  `replaceKeys` match), `steps`/`scope`/`expire`, `target: victim|ally|enemy|pair`
  (`allySteps`/`enemySteps` + shared pairId), `replaceKeys` (Investiture), `oncePerTarget`
  (generic `dieStepOnceBy.<key>.<owner>` stamp on the creature) and `oncePerScene` — all vetoed
  pre-cost. **Couplings travel IN THE ENTRY**: `failThpFormula`/`failThpRange` (Edict's
  failed-attack THP) and `onPairHit: extend-once|no-reactions` (Balance / the capstone — both
  ex-bucket-3 exits, re-litigated to conversions). The GM roll watch reads entries + rules only.
- **`edha-die-step-react`** — config-only, swept by the roll watch: a creature debuffed by YOUR
  `whenKeys` entries fails a test → `recoverInv` (auto on readable failed attacks, owner-click
  card otherwise) + the `reactiveStrike` offer for the attacked ally in `allyRange`. Expose —
  the Calculated Patience shape (Always Active, so no `use` event exists).
- **`edha-watch` grew the `die-step` kind** — H9 announces each placement; the entry KEY travels
  as the skill (Sovereign's Favor: `whenSkill: exalt`, `payloadTarget: victim`), the signed steps
  as the value. **`edha-temp-hp` grew `target: victim`** — written via `edhaGrantTempHpCross`
  (keeps the higher = "does not stack", GM-relayed).

## A talent can be cancelled before its rules ever run (07-24s; ENUMERATED 07-25)
A talent whose name is in a `preUseItem` takeover Set **never fires its `use` event**, so authored
rules on it are silently inert while the Events tab looks perfectly correct. **Removing the name is
step one of converting it** — grep a candidate's name in cancel/takeover Sets, not only in dispatch
branches.

⚠️ **This section used to name only `EDHA_DESTRUCTION_TALENTS` and the burst takeover, which badly
understated it.** Measured 07-25 (audit §9p): there are **19 `preUseItem` hooks in the engine and
EVERY ONE ends in a bare `return false`**. Nine consult a named Set:

| Set | line | tree |
|---|--:|---|
| `EDHA_DESTRUCTION_TALENTS` | L8995 | Destruction |
| `EDHA_CHAOS_TALENTS` | L9961 | Chaos (+ Red's **Shatter Focus**, which lives here) |
| `EDHA_FATE_TALENTS` | L10395 | Fate |
| ~~`EDHA_SOV_TALENTS`~~ | — | Sovereignty — **DELETED pass 2bT (07-25)**, tree clear |
| ~~`EDHA_DEATH_TAKEOVER`~~ | — | Death — **DELETED pass 2bW (07-25)**, tree clear |
| `EDHA_CIV_TAKEOVER` | L11903 | Civilization |
| `EDHA_POWER_TAKEOVER` | L12522 | Power |
| ~~`EDHA_GNOSIS_TAKEOVER`~~ | — | Knowledge — **DELETED pass 2bT (07-25)**, tree clear |
| `EDHA_ORDER_TAKEOVER` | L13865 | Order |

The other ten cancel from inline cases. **Nine of the fifteen trees take over their own talents'
use()**, so "check the takeover Set" is not an edge case — it is the first thing to do before
scheduling any deity tree. **The Set is a better conversion atom than any handler:** dismantling one
frees its whole tree at once.

## Payload dispatchers must ANNOUNCE, not hand-list (07-24s)
Two dispatchers now run **each rule's own executor** instead of a hard-coded list of payload types:
`edhaDispatchTestResult` (since H1) and **`edhaDispatchOnHit`** (fixed this pass). Before the fix an
`edha-focus` or `edha-cae-grant` rule on `edha-on-hit` was **silently inert**, which is the only
reason Feinting Strike stayed name-keyed for two passes after both its halves shipped.
> **If a talent's `needs` are all BUILT and it still cannot move, suspect the dispatcher before the
> primitives.** Hand-listing payload types reproduces the name-keyed mistake one level up.

`edha-push` grew with it: **`sizeColor`** ([Size] off any colour, not always Red), **`awayFrom:
anchor`** (shove away from a third party), and a real **executor**, so a push can be any rule's
payload rather than on-hit only. `edha-cae-grant` gained **`target: "victim"`** — the on-hit path
runs on the damage-applying client, usually the GM, so reading `game.user.targets` burns the wrong
creature's Reaction.

## Involuntary focus — H10 `edha-focus` (07-24r)
`edhaGainFocus` / `edhaDrainFocus` have been generic since the Black tree shipped and simply never
had a handler, so every talent that moved someone's focus did it from a name-keyed branch. This is a
schema over them, nothing more — the helpers keep owning the **Wary** reduction, the max clamp, the
GM relay and the zero-crossing announcement.
- `op` (gain | drain) · `target` (self | victim) · `formula` (resolved against YOUR roll data, so
  `@tier` works) · `whenOwnsTalent` · `label` (name a DIFFERENT talent on the card — Hollow Command's
  rule pays "Siphoned Will").
- **NOT the cost pipeline.** A talent spending its own focus as a cost still does that on its
  activation. This is the involuntary shape only.
- A drain now always passes through Wary, including Whispered Doubt's extra loss, which the
  hand-rolled version bypassed by writing the resource directly (⚑ 2bI-6).

## Next-test riders — what `edha-next-test-mod` grew (07-24r)
The one pipeline; three fields were added so two private duplicates of it could die.
- **`target: "victim"`** — bind to the creature the rule's trigger resolved against or happened to.
  A watch payload has no `game.user.targets` to re-read, so `target`/`self` could not express it.
- **`attr`** (comma-list of attribute ids) — `"int, wil"` IS a Cognitive test. This is the entire
  content of the retired `cogDisadv` flag; `"str, spd"` is the Physical mirror the Red Key already used.
- **`expireEndOfRound`** — stamps the current round; `edhaNextTestMatches(mod, roll, actor, round)`
  drops it once the round moves on. This is what the bespoke `advTest` flag had and this pipeline
  did not, and the only reason a second flag existed.
- **`bindToTarget`** — stamps `targetUuid` from your CURRENT target, so "advantage on your next test
  **against them**" is enforced rather than owner-judged (Reactive Analysis). Nothing targeted → the
  mod stays unbound rather than failing.
- ⚑ `nextTestMod` is a SINGLE flag slot: writing it overwrites any rider already there. Two
  independent debuffs do not stack (2bI-4).

## Splash around a triggering creature — `edha-triggered-effect` `nearAffects` (07-24r)
`target: "near-victim"` catches everyone inside `radius` except you (the victim itself is already
excluded — `edhaTokensWithin` drops the centre token). **`nearAffects`** (all | enemies | allies)
filters that by disposition relative to YOU and skips downed creatures. Default `all` is what every
pre-07-24r consumer did. Necrotic Cascade's corpse detonation is the first `enemies` consumer.

## Statuses
- **`edhaApplyTimedStatus(target, statusId, { owner, expire })`** — applies + stamps owner/target-relative
  auto-expiry (`expire:"owner"|"target"`). For NON-expiring (e.g. Prone) use **`edhaToggleStatus(target,
  statusId, true)`** (owner→toggle, else socket `toggle-status`).
- **Status ids are core, lowercase:** `prone`, `slowed`, `immobilized`, `restrained`, `stunned`,
  `surprised`. Custom Edha: `weakened`, `diagnosed`, `insight`, `doubledipped` (Double Dip's visible
  scene mark — since 07-24p the house `markedBy.doubledipped` shape, read via `edhaMarkOwner`,
  cleared at scene end; the old bespoke `doubleDipBy` flag is gone) + the full
  `EDHA_STATUSES` table. Timed set: `EDHA_TIMED_STATUSES = {weakened, immobilized, slowed, noactions,
  noreactions}`.

## Token movement (engine slides/pushes — all stamp `options.edhaForced`)
- **`edhaRunMove(item, cfg)`** — `edha-move` executor: slide the CASTER toward their target
  (`bySize`/`byHalfSpeed`/`distanceFt`; `oncePerTurn`; **`requireTargetIsolated`** gate, 07-12 —
  warn + no move unless the target is Isolated). Consumers: Red movement pilot, **Cruel Step**.
- **`edhaApplyMove(tok, destCenter, maxFt, {gapPx})`** → `edhaComputeMove` (wall-collision clamp) →
  `edhaMoveTokenTo` (owner-direct or GM socket `move-token`). Push AWAY from an arbitrary origin by
  aiming past the victim along origin→victim (see `edhaUnnerveClick`, 07-12 — Unnerving Approach's
  prompt-card push away from YOUR TARGET, not from the caster). **Straddle guard (2026-07-26l):**
  the collision test ray starts 2px along the travel direction, so a wall the mover's own square
  straddles (center collinear with the line — the degenerate-sweep false stop, bench run 3
  defect 3) never stops the slide; walls ≥3px ahead still block.
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
- **`edhaEvalSync(formula, rd)`** — the synchronous formula evaluator every passive amount goes
  through. **It handles DICE**: it substitutes roll data, folds computed die math
  (`edhaFoldDieMath`), then ROLLS the dice via `edhaRollDiceSync` before evaluating. ⚠️ It did not
  until 2026-07-26j — Foundry v13 made DiceTerm non-deterministic, so `Roll#evaluateSync()` throws
  on any die term, the catch returned **0**, and since callers gate on `amt > 0` the effect was
  skipped **in silence**. That killed Shield Wall, Interposing Shield, Retributive Guard and Devoted
  Conduit for the whole tracked history. If you write a handler that resolves an amount
  synchronously, call this — do not hand-roll `new Roll(...).evaluateSync()`.
- **Pure `edhaRollDiceSync(formula, rollFace?)`** — replaces every bare `NdM` with a rolled total so
  a dice formula survives sync evaluation; `rollFace` is injectable for tests. Anything that is not
  a bare `NdM` (e.g. `2d20kh`) is left ALONE rather than mangled. Pinned in `tests/`.
  `edhaRandomFace(faces)` draws from Foundry's own RNG (`CONFIG.Dice.randomUniform`), not `Math.random`.
- `edhaFtToPx(ft)`, `edhaWhisperIds(owner)`,
  `edhaOwnsTalent(actor,name)`. (`edhaCharacterOwnersOf` deleted 07-26 with the orphan sweep —
  the name-keyed sweeps' entry point; a name-keyed owner scan has no legitimate future consumer.)
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
  cue — a bare 'GM-run' label fails `lint-refs` pass 5 (which reads comment-STRIPPED engine code
  since 07-26: a name in a section-header comment no longer counts as wiring).** ⚠ HANDLER
  REGISTRATION IS LOAD-BEARING: an unregistered handler type is silently dropped by the DataModel
  (same class as a bad rule id) — and so is EVERY FIELD the registered schema doesn't define.
  Since 07-26, `lint-refs` **pass 9** machine-checks every authored/adversary handler object's
  keys against the engine's own schemas (`scripts/handler-schemas.js`) and native
  `schemaFields` — ⚠ native fields are camelCase (`target`, `changes`, `macro.command`); the
  PascalCase names in lang/en.json are LABEL keys and were never fields.
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
  applying client — the Whispered Doubt write pattern). **Announces the loss since 2026-07-26l**
  (it was the one silent focus write — bench run 3 defect 1); drain consumers must NOT post
  their own loss card.
- **Opportunity credit** (`oppCredit` flag) — the four adder talents bank +1 Opportunity on use;
  `edhaOpportunityMenuWatch` cashes it on the next test (menu card names the source). Spenders
  stay `edha-opportunity-option` authored rules (event `edha-opportunity`).
- **`EDHA_STANCE_CHANGES` / `EDHA_STANCE_SKILL_ADV`** — numeric while-in-stance AE changes baked
  into the stance marker + per-stance skill advantage on the pre-roll pipeline; Practiced Kata
  auto-enters Vigilant at combatStart.
- **Resilient Hero** — preUpdateActor HP-floor veto (`resilientSpent` flag, GM clears on long
  rest). **Wary** — preCreateActiveEffect veto on `surprised` while focus > 0.
- **`edha-cae-grant`** (H5, 07-24n) — action-economy as a rule. `kind` action/reaction/**burn-reaction**
  (burn spends the TARGET's), `n`, `target: self|target`, `label` (the tracker shows
  `Edha: <label>`), `whenDeflectBelow` (Sidestep's armour gate; silent no-op above it). Thin wrapper
  over `edhaCaeGrant`, so the no-tracker chat fallback still works. **CAE has no api — the contract
  is the combatant flags, don't re-investigate** (audit §9j).
- **`edha-combat-timing` HAS A DISPATCHER NOW** (07-24n). It was registered on 07-18 and nothing
  ever fired it — every combat-timed passive was a bespoke `combatStart` hook. It now fires each
  such rule at **combat start** on the single GM applier, passing `options.moment` so further
  moments (turn/round start) can be added with a field on the consuming handler. Rule-driven, so
  it reaches adversaries carrying an embedded twin — deliberate, and wider than the
  `type === "character"` hooks it replaced.
  ⚑ **Heuristic this taught us: grep for a registered type with ZERO dispatch sites — it is a
  migration unlock hiding in plain sight.**
- **`edha-enter-stance`** (H11, 07-24n) — put the user into one of their own stance talents;
  `stance` (the talent NAME, as authored data — allowed; 2b forbids names in engine CODE) +
  `unlessStatus` (default `surprised`). No-ops if already in that stance, because
  `edhaToggleStance` would otherwise LEAVE it. Consumer: Practiced Kata on `edha-combat-timing`.
- ⚠ **CAE-NEXT class** (Cosmere Advanced Encounters — installed 07-18, api UNCAPTURED): the
  remaining action/reaction-economy behaviours are queued in §9j #1b with their hook class named.
  The GRANT/BURN half is built (`edha-cae-grant` above); what is still unexpressible is the
  **cost-discount** half (Vigilant Stance's Dodge/Reactive-Strike −1, Stonestance's attack tax) —
  no hook intercepts an action's focus cost. Do NOT mark those manual; do NOT wire them blind.

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

## Pass 2bU (07-25) — the Chaos/Power widenings + three config-only handlers

- **H1 `edha-def-test` `targetList` / `targetListStatus` / `targetListRange`** — the OWNER-SWEEP:
  ONE shared roll, every ledger member gated on its OWN bar, the talent's success/fail rules
  dispatched per member (victim = that member; reuses `edhaEffectTargets`' list-members roster, so
  downed skip + both-tokens range hold). **`vs: "none"`** = no test at all — every subject resolves
  immediately (Unravel Everything's detonation; a `use` on a utility activation has no roll to
  capture). The pre-use veto skips the user-target gates in sweep mode; an EMPTY ledger still
  spends, matching the retired takeovers.
- **H3 `edha-owner-list` place targets `near-victim` (+`nearFt`) / `enemies-range`** — the nearest
  living unmarked enemy within N ft of the victim, auto-picked (`edhaNearestListCandidate`), and
  the nearest-first fill-to-cap over enemies in your Attunement Range. A fill never evicts.
- **H6 `edha-prompt-pick` `source: "effects"`** — the DISPEL: one button per enabled Active Effect
  on the subject; the GM's click DELETES it (`edhaDispelPickClick`, `.edha-dispel-btn`). Built WITH
  its intrinsic payload; success rules are NOT dispatched for a picked effect (no handler takes a
  THING).
- **`edha-triggered-effect` `unlessTargetStatus`** (silent skip, never a stop) and the
  **`maxTargets` multi-target prompt mode** (+`requireDisposition`; rangeColor now filters prompt
  targets too): filters + caps your targets, ONE shared roll, `kind: thp` fans out through
  `edhaGrantTempHpCross`, and a pre-cost veto refuses when nobody qualifies. `edha-adv-attack`
  gained **`to: "targets"`** with the same filters (Investiture of Command's pair of rules).
- **`edha-sense-reveal`** (config-only) — which marker status renders through walls to YOUR client
  (`edhaSenseRevealShows` sweeps rules now; the name-keyed `EDHA_SENSE_REVEALS` table is gone) +
  the optional damage-recovery rider (`edhaSenseRevealOnDamage`: your mark, once/round,
  range-gated). The per-viewer RENDERING stays ENGINE_OWNED.
- **`edha-damage-bonus` grew `meleeOnly`** (a ranged hit stands down WITHOUT consuming the arm),
  **`tallyKills` + `@tally`** (the scene tally: below-half once per victim + kills, hostile
  non-summon NPCs only, per-rule-item flag `bonusTally.<item.id>`, cleared at combat end) and the
  **onKill/onSurvive armed-hit outcome riders** (`onKillThpFormula`/`onKillNote` /
  `onSurviveAdvAttr`/`onSurviveNote` — queued at consume, drained in `edhaDamageBonusPost` where
  the HP crossing is knowable; survivor advantage is target-bound via `edhaSetNextTestMod`).
- **H8 `edha-watch` `watch: "token-move"`** — your movement crossed an other-side living creature's
  space, one event per creature (`edhaAnnounceTokenMove`, GM-side, segment-sampled; built WITH
  Unstoppable Advance) — and **`once: "arm-per-target"`** (once per creature for the LIFETIME of
  the `requireSelfStatus` arm; flag `armOnce.<status>`, cleared when the status drops).
- **`edha-self-status` grew `refuseWhileActive`** (a TIMED arm may refuse instead of refreshing),
  **`oncePerScene`** (the generic sceneOnce stamp — Mantle) and **`immuneStatuses`** (statuses
  landing while armed are shrugged with a card — the generic createActiveEffect watcher).
- **`edha-apply-status` grew timed expiry** (`expire: owner-turn / target-turn` via
  `edhaApplyTimedStatus`) **+ victim binding** (the trigger's victim wins over current targets).
  Kneel's move-toward-or-nothing veto now reads **`markedBy.compelled`** — status-keyed, no name.
- **H13 (the `edha-test-rider` widenings)** — `whenTargetStatus` is a comma-list (pure
  **`edhaStatusCsvMatch`**, pinned in `tests/status-csv.test.js`, blank fails CLOSED) + a
  `rangeColor` both-tokens gate.
- **`edha-defense-buff` `window: "scene"`** — an on-use AE (flag `sceneDefBuff`) cleared by the
  generic deleteCombat sweep (which now also clears `bonusTally` + `armOnce`).
- **`edha-test-aura`** (config-only) — the flat +N-to-all-tests aura around an armed owner
  (`edhaTestAuraApply`, the NumericTerm injector — ⚑ dialog-roll rebuilds, the standing caveat).
- **`edha-redirect`** (config-only) — the damage-redirect spec (budget/range/arming);
  `edhaRedirectPromptSweep` + `edhaRedirectClick` (`.edha-redirect-btn`) stay ENGINE-OWNED and
  name no talent.
- Five arming statuses: `warlord` · `momentum` · `fury` · `unstoppable` · `mantled` (cleared by
  `edhaClearPowerState`, whose flag list is legacy-only now).

## Pass 2bV (07-25) — the edicts repoint, the prohibition family, the zone verbs, H21

- **The `edicts` ledger is H3's** (the second repoint): `edhaGetEdicts = edhaOwnerList(owner,
  "edicts", "edict")`, writers through `edhaSetOwnerList`; entries are `uuid`/`name`-keyed with
  `proh`/`sealed` riding along — reconcile-on-read keys on `uuid`, so a legacy `targetUuid` key
  CANNOT be kept.
- ⚠️ **`edhaOwnerLedgers(key, status)` — always pass the MARKER status.** The key is plural
  (`covenants`), the marker singular (`covenant`), and the key-as-status default makes the
  mark-wins filter drop every resolvable entry — the sweep reads EMPTY (the 2bV pinned
  regression; it had silently killed the covenant proximity AE + break watch since 07-24u).
- **H3 `op: "annotate"` (+`annotateField`)** — flag the most recent un-flagged entry (H3ann:
  Sealed Edict, with Inevitable Snare + Pinpoint Charge waiting). Refused pre-cost when none
  qualifies. **`riderSkill`/`riderColor`** on the annotate rule drive the resolver's notarize
  contest off the annotating talent's own damage formula.
- **H3 `prohibition: true`** (place) — the entry carries a picked prohibition (`edhaPickProhibition`
  stays ENGINE-OWNED); the place card gains the ⚖ Violated button + the **`placeNote` sibling
  sweep** (`edhaListPlaceNotes` — any rule on the owner whose `list` matches advertises a line).
  **Picker-cancel REFUNDS the system-paid cost (`edhaRefundCost`) — the Trade-Routes convention,
  the standard exit from the picker-before-cost trap. NO takeover needed.**
- **The violation subsystem is ledger/rule/flag-keyed** (ENGINE-OWNED, names nothing):
  `edhaProhResolveViolation(owner, key, entryId)` (consume-first), `edhaProhAnnotateRider`,
  `edhaProhPlaceRuleOf`/`edhaProhAnnotateRuleOf` (rule-scans), `edhaDecreeOwners()` (the `decree`
  flag), the three watchers sweep `edhaOwnerLedgers("edicts", "edict")`. The Investiture watcher
  reads the DOTTED change form too.
- **H1 `requireTargetOnList`/`...Status`** — pre-cost: the target must be on YOUR ledger (Verdict).
- **`edha-prohibition-resolve`** (on edha-test-success) — resolve the victim's entry + the court:
  each OTHER enemy in `courtRadiusFt` rolls `courtSkill` vs `courtColor` (engine-rolled); failures
  share ONE roll of THIS talent's damage formula + Disoriented.
- **`edha-decree`** — Final Decree's dials (range, witness ledger, THP die, court radius,
  once/scene); `edhaDecreeUse`/`edhaDecreeResolve` stay ENGINE-OWNED, keyed on the rule.
- **`edha-bound-adv`** (config-only) — advantage for you + allies vs creatures on YOUR ledger
  (± decree-bound), gated on YOUR line of sight; `edhaBoundAdvApply` sweeps rules.
- **`edha-self-status` `requireListNonEmpty`/`requireListStatus`** — an arm over a ledger refuses
  empty (Concord). New `concord` status. **`edha-note` `rosterList`/`rosterListStatus`** — append
  ledger member names.
- **`edha-damage-bonus` `require: "list-member-hits"`** (+`listName`/`listStatus`,
  `oncePerRoundPerDealer` — per-talent-per-dealer budget) and **`require: "summon-hits"`**
  (+`whenDealerItem`, `addTargetDeflect` — the ignore-deflect bump as a second impact instance).
  The cross-actor sweep carries all three cross modes.
- **`edha-redirect` `direction: "intercept"`** (+`watchList`/`watchListStatus`, `takeFraction`,
  `healBonusFormula`, `thpFormula`, `oncePerRound`) — a ledger ally lost HP → the watcher takes
  the fraction, they heal back, both gain THP. `edhaInterceptPromptSweep` + `.edha-intercept-btn`
  stay ENGINE-OWNED. (Shoulder the Oath — its 07-24u "no redirect payload exists" exit died here.)
- **`edha-zone` `kind: terrain | foundation | fortify | link`** (+`capFormula`) — the Foundation
  family as rule executors (`edhaZoneFoundation`/`edhaZoneFortify`/`edhaZoneLink`); the pickers,
  Drawings, Regions and relays stay ENGINE-OWNED; fortify/link refuse pre-cost via the zone-verb
  veto; the fortified-enter save card label is baked data (`sourceLabel`). The fortifying talent
  is found by RULE (`edhaCivFortifyRuleOf`).
- **H21 `edha-summon-effect`** — `toggle-baked` (enable a named baked effect + end button — Siege
  Form; the pre-07-17 Siege-Cannon name shim is RETIRED), `grant` (copy the talent's OWN
  Effects-tab `summonGrantTemplate` onto the summon + `summonArmed` kill-chase — Arsenal),
  `transform` (the ENGINE-OWNED colossus rewrite, every dial a field — Magnum Opus). Lookup =
  `edhaOwnedSummons`; the hit riders key on `colossus`/`summonArmed` + `edhaSummonEffectRuleOf`.
- **H25 `edha-damage-react` `requireVictimInMyZone` + `action: "rally-zone"`** — Bonds of
  Community: fires on ANY side's drop inside your Foundations (summons never), grants THP +
  advantage to every ally standing in them; advantage still lands at 0 Temp HP.

## Test-pass 2026-07-26l (the bench-run-3 eight)

- **`edhaFillName(text, name)`** — THE `{name}` template fill (pure, pinned). Any card text
  carrying the placeholder goes through it; never re-inline the split/join. Both prompt-pick
  paths (offer AND accept note) use it; `edha-prompt-pick`'s `prompt`/`label` hints document
  what `{name}` means on each card.
- **`edhaHealCutInfo(actor)` / `edhaHealCutGate(target, amount)`** — the shared No-Healing /
  Healing-Halved read + gate (strictest mark wins; the gate announces once, naming the mark's
  `byName`). **Any heal path that writes `hea` outside applyDamage MUST call the gate** — the
  standard door is `edhaCrossHeal(actor, amount, {bypassHealCut})`; bypass is ONLY for drop-to-1
  preventions (Death Ward / Raise Dead / Unbreakable Line — whether the block stops stabilization
  is a queued ruling). `edhaHealCutFactor` is now a thin read of the info (applyDamage wrap
  unchanged). Pure selection/arithmetic pinned in tests/.
- **`edha-hp-threshold` grew `rangeColor`** (+ the ally / owner-token-on-scene gates are
  enforced in the sweep): the offer needs the owner ON the scene, the victim's token sharing its
  disposition (unknown fails CLOSED), and — when authored — the ally inside the colour's
  Attunement Range (`edhaAllyInAttune`). `includeSelf` skips the gates. The rule's `note` is ONE
  tight line; blank shows the engine's who-dropped-to-what default (do not paste descriptions).
- **`edhaAttackKind` reads `system.attack.type`** ("melee"/"ranged"; `attack.range.value` as the
  type-less tiebreak) — the cosmere 2.1.0 weapon schema has NO `system.range`. Pinned.
- **Tempered Edge's ignore-deflect is a COMPENSATING instance** — the system's calc line will
  always show "− deflect"; the net equals base + rider. Never adjudicate `addTargetDeflect` off
  the calc line; the rider card states the pre-payment since 07-26l.
