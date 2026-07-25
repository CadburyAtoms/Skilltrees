# The remaining migration — PATH BY PATH

**State: 26 talents on the ratchet** (221 at the start 2026-07-24). Split **0 / 5 / 15 / 6**
(bucket 1 / 1b / 2 / 3). **Pass X (07-25) cleared deity/Fate (9) — the two-ledger tree, one
session: takeover retired, the FOURTH LEDGER (`snares`) repointed onto H3 (point-bound entries,
fail-open by design), and `ordained` left cleanly LEGACY behind its accessor (§9m q7 — its
repoint is its own session, PAIRED WITH NOTHING). New: `edha-zone` kinds ordained/snare/
link-markers, `edha-zone-guard`, `edha-snare-react`, `edha-marker-command`, H3ann's
`sourceItemUuid` stamp + rider fields (the Pinpoint correction).** Pass W before it cleared
Death + Life (+ `remains`); V Order + Civilization (+ `edicts`); U Chaos + Power; T Knowledge +
Sovereignty; R/S White and Green. Recompute before trusting anything here:

```bash
node scripts/lint-refs.js                      # pass 7 prints the live ratchet count
node scripts/check-2b-classification.js
```

**Rewritten 2026-07-25 on Ben's instruction — "go path by path".** The old version partitioned the
work by *handler* and by *cheapest atom*, and that is what produced sessions converting one talent.
**One path per session. Convert all of it. Build whatever handler it needs, inline.** See SKILL.md.

**Widened 07-25 post-S (Ben): TWO paths per session when both blocking builds are ruled and at
most one ledger is in scope** — proven five times now (T: 93 → 75, U: 75 → 63, V: 63 → 48,
W: 48 → 35, X: 35 → 26 single-path — Fate's one-ledger cap made it pair badly, as predicted).
**Next: Destruction (`charges`) or Fate's `ordained` repoint (the LAST ledger — pairs with
nothing); the leyline remainders (Red's Shatter Focus frees the Chaos Set entirely, the H17
target-formula trio) fall in passing.**

---

## The paths, largest first

| path | on ratchet | what it needs |
|---|--:|---|
| ~~leyline/Green~~ | **0** | ✅ **CLEAR (pass S, 07-25)** — H2 the zone family (`edha-zone` / `edha-zone-hazard` / `edha-zone-react`) + `edha-adv-attack` + `edha-strike-window` + `edha-damage-bonus` + `edha-unseen-ward` + `edha-heal-react` + `edha-remove-injury` + `edha-suppress-veil`. Natural Order re-litigated and CONVERTED (veil half enforced). Thorn Hedge + the Grove's copy rewired in the ADVERSARY pack. Overgrowth (deity/Life) went with it via `deflectStackMax`. |
| ~~leyline/White~~ | **0** | ✅ **CLEAR (pass R, 07-25)** — H26 `edha-test-react` + H27 `edha-damage-reduce` + H7 `edha-aura` + the small executors (`edha-pulse`, `edha-cleanse`, `edha-move-window`, `edha-designate`, `edha-accord-forge`) + H1 `vs: prompt-dc`. Bound by Word = upgrade-talent exit. |
| ~~deity/Fate~~ | **0** | ✅ **CLEAR (pass X, 07-25)** — takeover deleted; the `snares` LEDGER repointed (point-bound, fail-open; canvas stays with the placement/spring handlers per §9o); `ordained` LEGACY behind its accessor by design. `edha-zone` {kind: ordained/snare/link-markers} + `edha-zone-guard` + `edha-snare-react` + `edha-marker-command` + H3ann `sourceItemUuid`/`riderFailStatus`. Weave re-litigated (picker built, the `linked` annotation got its first reader). |
| ~~deity/Knowledge~~ | **0** | ✅ **CLEAR (pass T, 07-25)** — H3b as `mode: counter` on H3 + `edha-counter-transfer` + the three arming statuses + the `edha-damage-bonus` counter/armed modes. Takeover + name-keyed dealer passes deleted. |
| ~~deity/Sovereignty~~ | **0** | ✅ **CLEAR (pass T, 07-25)** — H9 `edha-die-step` (+ `edha-die-step-react`, the `die-step` watch kind, `edha-temp-hp` victim). Both bucket-3 pair talents re-litigated to FULL conversions (entry-data couplings). Takeover deleted. |
| ~~deity/Civilization~~ | **0** | ✅ **CLEAR (pass V, 07-25)** — `edha-zone` kinds foundation/fortify/link + **H21 `edha-summon-effect`** (toggle-baked / grant / transform) + the `summon-hits` damage-bonus mode (whenDealerItem, addTargetDeflect) + H25 `rally-zone`/`requireVictimInMyZone`. Magnum Opus = ENGINE-OWNED, rule-keyed. Takeovers deleted. |
| ~~deity/Death~~ | **0** | ✅ **CLEAR (pass W, 07-25)** — takeover deleted; the `remains` LEDGER repointed (freebie = `sceneFreebie` field, "[] ≠ unset" in `edhaOwnerListAvail`); H3 `op: spend`; `edha-ward` / `edha-turn-dot` / `edha-revive` (Raise Dead ENGINE-OWNED, rule-keyed); Withering Touch = damage-bonus fields (`healCutFraction`, `withernext`); Reaper's Harvest = defeat watch (`chain`) + `edha-focus` {inv} + H3 place + sense-reveal; Bone Garden = zone `costList` + hazard `moment: turn-end`; Death Ward = H1 `skipIfAlly` + skill_test activation. |
| **deity/Destruction** | 7 | `EDHA_DESTRUCTION_TALENTS` + the `charges` LEDGER + canvas cleanup. |
| ~~deity/Order~~ | **0** | ✅ **CLEAR (pass V, 07-25)** — the `edicts` LEDGER repointed (uuid-keyed; proh/sealed ride along) + H3 `annotate` (H3ann) + the `prohibition` place mode + H1 `requireTargetOnList` + `list-member-hits`/`oncePerRoundPerDealer` + `edha-redirect` **intercept** + `edha-bound-adv`/`edha-prohibition-resolve`/`edha-decree`. Final Decree = ENGINE-OWNED, rule-keyed. Takeover deleted. Latent `edhaOwnerLedgers` key-vs-marker bug fixed + pinned. |
| ~~deity/Power~~ | **0** | ✅ **CLEAR (pass U, 07-25)** — H13 built + the armed `edha-damage-bonus` riders (`meleeOnly`, `tallyKills`/@tally, onKill/onSurvive) + the `token-move` watch kind + `once: arm-per-target` + `maxTargets` multi-target + `edha-self-status` widenings + `edha-defense-buff` `window: scene` + config-only `edha-redirect`/`edha-test-aura`. Mantle re-litigated to a FULL conversion; the dealer pre/post passes and both dispatches deleted. |
| ~~deity/Life~~ | **0** | ✅ **CLEAR (pass W, 07-25)** — the useItem switch deleted; `edha-mutation` (chooser, riders as fields) + `edha-regen-grant` (Apex Form's FIVE mechanics on one rule; Primal's endOnVitalSpirit/mutationFormula) + `edha-cleanse` {success-damage-roll} (Surgical) + the `edha-redirect` intercept widenings (`watchFlag`/`linkOnUse`/`chooseAmount`/`takeType`/`healFormula` — Lifeline re-litigated OFF pass S's measured H25 build; the choose-amount click already existed). |
| ~~deity/Chaos~~ | **0** | ✅ **CLEAR (pass U, 07-25)** — H1 `targetList` owner-sweep + `vs: none`, H3 `near-victim`/`enemies-range`, H6 `source: effects` (the dispel), `unlessTargetStatus`, config-only `edha-sense-reveal` (the veil table retired). `EDHA_CHAOS_TALENTS` is down to Shatter Focus (RED's talent — converting it frees the Set entirely). |
| leyline/Black · Blue · Red · heroic/* | 18 | Small remainders, mostly bucket-3 declared exits. |

**The 13 bucket-3 declared exits** cut across every path and need **no build** — an `edha-note` cue
rule on the talent plus an `ENGINE_OWNED: <reason>` line in its tree-section header. Take them as you
pass through each path rather than as their own session. ⚠️ Re-litigate each against iron rule 3
first — Dread Presence was "manual by nature" until a `preUpdateToken` veto enforced it, and pass S
re-litigated Natural Order's "narrative scene debuff" exit into a full conversion (the dark-veil
sweep was a nameable hook).

---

## Recurring shapes — find these in every path

The bulk comes from spotting that N talents are one shape. Confirmed so far:

- **A `switch (item.name)` on `useItem` or `preUseItem`** — one per tree. The `preUseItem` ones
  cancel `use()`; see SKILL.md step 2.
- **`edhaCharacterOwnersOf(NAME)` + a generic card poster** — the watcher-offers-a-reaction shape.
  **H25 `edha-damage-react`** for damage triggers; **H26 `edha-test-react`** (built pass R) for
  roll triggers. Both exist now — a new reaction of either shape is authoring, not engine work.
- **Per-tree `edha<Tree>DealerPre/Post` riders** inside the applyDamage wrapper — behaviour that
  fires when you deal damage, not on use. ~20 talents across ~8 trees. Needs the payload cluster:
  pre-damage veto, in-flight reduction, second-hit counter, scene tally, heal-fraction.
- **Marker LEDGERS** — six of them (`covenants` + `edicts` + `remains` + `snares` done; `charges`
  and Fate's `ordained` remain — `ordained` is the LAST and pairs with nothing, its readers already
  run rule-keyed through the legacy accessor). ⚠️ **One ledger per session** (§9m q7): a
  half-migrated ledger silently empties a live list at the table. The deliverable of a ledger pass
  is the **REPOINT**, not the count.
  ⚠️ **A ledger SWEEP must pass the MARKER status** — `edhaOwnerLedgers(key, status)`: the key is
  plural, the marker singular, and the key-as-status default silently empties the sweep (the 2bV
  pinned regression).

## Handlers built, for reuse before you build another

H1 `edha-def-test` (+ `vs: prompt-dc` 07-25) · H3 `edha-owner-list` · H5 `edha-cae-grant` ·
H6 `edha-prompt-pick` · H8 `edha-watch` · H10 `edha-focus` · H11 `edha-enter-stance` ·
H12 `edha-detonate-list` · H15 summon `sustainCap`/`replaceOldest` · H19 `whenSlowTurn` ·
H20 the `edha-draw-mana` event · **H24 `edha-reveal`** (07-25) · **H25 `edha-damage-react`**
(07-25) · **H26 `edha-test-react` · H27 `edha-damage-reduce` · H7 `edha-aura` · `edha-pulse` ·
`edha-cleanse` · `edha-move-window` · `edha-designate` · `edha-accord-forge`** (07-25, pass R) ·
**H2 `edha-zone` · `edha-zone-hazard` · `edha-zone-react` · `edha-adv-attack` ·
`edha-strike-window` · `edha-damage-bonus` · `edha-unseen-ward` · `edha-heal-react` ·
`edha-remove-injury` · `edha-suppress-veil` · `edha-test-rider` {whenEnemiesInMyZone,
unlessDisadvantage} · `edha-overflow-thp` {deflectStackMax}** (07-25, pass S) ·
**H3b `edha-owner-list` {mode: counter} · `edha-counter-transfer` · `edha-damage-bonus`
{armed-self-status, self/ally-hits-counter-bearer, placeCounter} · H9 `edha-die-step` ·
`edha-die-step-react` · the `die-step` watch kind · H1 {targetCounter, oncePerScene,
requireDisposition} · `edha-triggered-effect` {perCounterStatus} · `edha-temp-hp` {victim} ·
`edha-reveal` {counter-bearer} · `edha-note` {rosterColor}** (07-25, pass T) ·
**H3 {op: annotate (H3ann), prohibition} · H1 {requireTargetOnList} · `edha-self-status`
{requireListNonEmpty} · `edha-note` {rosterList} · `edha-damage-bonus` {list-member-hits,
oncePerRoundPerDealer, summon-hits, whenDealerItem, addTargetDeflect} · `edha-redirect`
{direction: intercept} · `edha-bound-adv` · `edha-prohibition-resolve` · `edha-decree` ·
`edha-zone` {kind: foundation/fortify/link} · H21 `edha-summon-effect` · H25 {rally-zone,
requireVictimInMyZone} · `edhaOwnerLedgers(key, status)`** (07-25, pass V) ·
**H3 {op: spend, sceneFreebie} · `edhaOwnerListAvail`/`edhaLedgerSpend` · `edha-ward` ·
`edha-turn-dot` · `edha-revive` · `edha-mutation` · `edha-regen-grant` · `edha-focus`
{resource: inv} · `edha-damage-bonus` {healCutFraction} · H1 {skipIfAlly} · `edha-zone`
{costList} · `edha-zone-hazard` {moment: turn-end} · `edha-cleanse` {success-damage-roll} ·
`edha-redirect` {watchFlag, linkOnUse, chooseAmount, takeType, healFormula}** (07-25, pass W) ·
**`edha-zone` {kind: ordained/snare/link-markers, evict} · `edha-zone-guard` · `edha-snare-react` ·
`edha-marker-command` · H3 annotate {sourceItemUuid stamp, riderFailStatus}** (07-25, pass X) ·
`edha-note`.

⚠️ **H8 `edha-watch` is a GATE with a stub executor** — 44 talents name it and every one still needs a
separate real payload handler. A `needs` entry naming only a gate is not a satisfiable row.
