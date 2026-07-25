# The remaining migration — PATH BY PATH

**State: 48 talents on the ratchet** (221 at the start 2026-07-24). Split **0 / 7 / 34 / 7**
(bucket 1 / 1b / 2 / 3). **Pass V (07-25) cleared deity/Order (7) AND deity/Civilization (8) —
the third two-path session, and the SECOND LEDGER (`edicts`) repointed onto H3. Shoulder the
Oath re-litigated from its ENGINE_OWNED exit (the 2bU redirect payload existed, inverted).**
Pass U before it cleared Chaos + Power; T cleared Knowledge + Sovereignty; R/S White and Green. Recompute before trusting anything here:

```bash
node scripts/lint-refs.js                      # pass 7 prints the live ratchet count
node scripts/check-2b-classification.js
```

**Rewritten 2026-07-25 on Ben's instruction — "go path by path".** The old version partitioned the
work by *handler* and by *cheapest atom*, and that is what produced sessions converting one talent.
**One path per session. Convert all of it. Build whatever handler it needs, inline.** See SKILL.md.

**Widened 07-25 post-S (Ben): TWO paths per session when both blocking builds are ruled and at
most one ledger is in scope** — proven three times now (T: 93 → 75, U: 75 → 63, V: 63 → 48).
**Next: Death (`remains` — the legacy-flat sixth ledger) or Destruction (`charges`) or Fate
(TWO ledgers — do the takeover and ONE, then stop) or deity/Life (⚠ Apex Form is five
mechanics — whole tree or none); the leyline remainders (Red's Shatter Focus frees the Chaos
Set entirely) fall in passing.**

---

## The paths, largest first

| path | on ratchet | what it needs |
|---|--:|---|
| ~~leyline/Green~~ | **0** | ✅ **CLEAR (pass S, 07-25)** — H2 the zone family (`edha-zone` / `edha-zone-hazard` / `edha-zone-react`) + `edha-adv-attack` + `edha-strike-window` + `edha-damage-bonus` + `edha-unseen-ward` + `edha-heal-react` + `edha-remove-injury` + `edha-suppress-veil`. Natural Order re-litigated and CONVERTED (veil half enforced). Thorn Hedge + the Grove's copy rewired in the ADVERSARY pack. Overgrowth (deity/Life) went with it via `deflectStackMax`. |
| ~~leyline/White~~ | **0** | ✅ **CLEAR (pass R, 07-25)** — H26 `edha-test-react` + H27 `edha-damage-reduce` + H7 `edha-aura` + the small executors (`edha-pulse`, `edha-cleanse`, `edha-move-window`, `edha-designate`, `edha-accord-forge`) + H1 `vs: prompt-dc`. Bound by Word = upgrade-talent exit. |
| **deity/Fate** | 9 | `EDHA_FATE_TALENTS` takeover + the `snares` and `ordained` LEDGERS (two ledgers → do the takeover and one ledger, then stop). `edhaBulwarkNoAdvantage` hosts four in one function. |
| ~~deity/Knowledge~~ | **0** | ✅ **CLEAR (pass T, 07-25)** — H3b as `mode: counter` on H3 + `edha-counter-transfer` + the three arming statuses + the `edha-damage-bonus` counter/armed modes. Takeover + name-keyed dealer passes deleted. |
| ~~deity/Sovereignty~~ | **0** | ✅ **CLEAR (pass T, 07-25)** — H9 `edha-die-step` (+ `edha-die-step-react`, the `die-step` watch kind, `edha-temp-hp` victim). Both bucket-3 pair talents re-litigated to FULL conversions (entry-data couplings). Takeover deleted. |
| ~~deity/Civilization~~ | **0** | ✅ **CLEAR (pass V, 07-25)** — `edha-zone` kinds foundation/fortify/link + **H21 `edha-summon-effect`** (toggle-baked / grant / transform) + the `summon-hits` damage-bonus mode (whenDealerItem, addTargetDeflect) + H25 `rally-zone`/`requireVictimInMyZone`. Magnum Opus = ENGINE-OWNED, rule-keyed. Takeovers deleted. |
| **deity/Death** | 8 | `EDHA_DEATH_TAKEOVER` + the `remains` LEDGER (legacy-flat at `flags.edha-content.remains`; the sixth ledger, which §9o's table omits). |
| **deity/Destruction** | 7 | `EDHA_DESTRUCTION_TALENTS` + the `charges` LEDGER + canvas cleanup. |
| ~~deity/Order~~ | **0** | ✅ **CLEAR (pass V, 07-25)** — the `edicts` LEDGER repointed (uuid-keyed; proh/sealed ride along) + H3 `annotate` (H3ann) + the `prohibition` place mode + H1 `requireTargetOnList` + `list-member-hits`/`oncePerRoundPerDealer` + `edha-redirect` **intercept** + `edha-bound-adv`/`edha-prohibition-resolve`/`edha-decree`. Final Decree = ENGINE-OWNED, rule-keyed. Takeover deleted. Latent `edhaOwnerLedgers` key-vs-marker bug fixed + pinned. |
| ~~deity/Power~~ | **0** | ✅ **CLEAR (pass U, 07-25)** — H13 built + the armed `edha-damage-bonus` riders (`meleeOnly`, `tallyKills`/@tally, onKill/onSurvive) + the `token-move` watch kind + `once: arm-per-target` + `maxTargets` multi-target + `edha-self-status` widenings + `edha-defense-buff` `window: scene` + config-only `edha-redirect`/`edha-test-aura`. Mantle re-litigated to a FULL conversion; the dealer pre/post passes and both dispatches deleted. |
| **deity/Life** | 5 | The `useItem` switch (NOT a takeover, so `use` rules fire today). ⚠️ Multi-mechanic: **Apex Form has five mechanics**. Do the whole tree or none. Overgrowth already converted (pass S). ⚠️ Lifeline measured (pass S): H25 needs `requireLinkedVictim` AND a choose-amount redirect ACTION + its use-side link machinery — not one field. |
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
- **Marker LEDGERS** — six of them (`covenants` + `edicts` done; `remains`, `charges`, `snares`,
  `ordained` remain). ⚠️ **One ledger per session** (§9m q7): a half-migrated ledger silently empties
  a live list at the table. The deliverable of a ledger pass is the **REPOINT**, not the count.
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
requireVictimInMyZone} · `edhaOwnerLedgers(key, status)`** (07-25, pass V) · `edha-note`.

⚠️ **H8 `edha-watch` is a GATE with a stub executor** — 44 talents name it and every one still needs a
separate real payload handler. A `needs` entry naming only a gate is not a satisfiable row.
