# The remaining migration — PATH BY PATH

**State: 124 talents on the ratchet** (221 at the start 2026-07-24). Split **0 / 18 / 89 / 17**
(bucket 1 / 1b / 2 / 3). Recompute before trusting anything here:

```bash
node scripts/lint-refs.js                      # pass 7 prints the live ratchet count
node scripts/check-2b-classification.js
```

**Rewritten 2026-07-25 on Ben's instruction — "go path by path".** The old version partitioned the
work by *handler* and by *cheapest atom*, and that is what produced sessions converting one talent.
**One path per session. Convert all of it. Build whatever handler it needs, inline.** See SKILL.md.

---

## The paths, largest first

| path | on ratchet | what it needs |
|---|--:|---|
| **leyline/Green** | 15 | H2 `edha-zone` (terrain/thorn regions) + H8 range sweeps + the Green heal-riders. Several presumed auras are really watchers — read the block, don't assume. |
| **leyline/White** | 15 | ⬇ **4 already converted 07-25 via H25.** The rest: the `edhaCoordWatch` / `edhaAccordWatchSkill` **coord-reaction** family (Shared Conviction, Pillar of Order, Concordant Presence, Collective Resolve, Counterpoint) is ONE shape and `edhaPostCoordReactionCard` is already generic — the same trade H25 made. Then Guiding Signal / Ordered Advance / Devoted Conduit. |
| **deity/Fate** | 9 | `EDHA_FATE_TALENTS` takeover + the `snares` and `ordained` LEDGERS (two ledgers → do the takeover and one ledger, then stop). `edhaBulwarkNoAdvantage` hosts four in one function. |
| **deity/Knowledge** | 9 | **H3b** — `edha-owner-counter` as a MODE on H3 (§9m q6, ruled). Insight is a *counted single bearer*. + `EDHA_GNOSIS_TAKEOVER`. ⚠️ Predatory Strike has a dealer-side half in `edhaGnosisDealerPre/Post`. |
| **deity/Sovereignty** | 9 | **H9** `edha-die-step` (§9m q1, ruled BUILD IT) + `EDHA_SOV_TALENTS`. `edhaSovRollWatch` hosts three in one function. ⚠️ Expose is `activation.type: none`. |
| **deity/Civilization** | 8 | `EDHA_CIV_TAKEOVER` + the Construct riders in the applyDamage wrapper. |
| **deity/Death** | 8 | `EDHA_DEATH_TAKEOVER` + the `remains` LEDGER (legacy-flat at `flags.edha-content.remains`; the sixth ledger, which §9o's table omits). |
| **deity/Destruction** | 7 | `EDHA_DESTRUCTION_TALENTS` + the `charges` LEDGER + canvas cleanup. |
| **deity/Order** | 7 | `EDHA_ORDER_TAKEOVER` + the `edicts` LEDGER (cheapest ledger — `allowDuplicates` and `multiOwner` both shipped with `covenants`). |
| **deity/Power** | 7 | `EDHA_POWER_TAKEOVER` + `edhaPowerDealerPre/Post` (applyDamage riders) + the redirect-click family. |
| **deity/Life** | 6 | The `useItem` switch (NOT a takeover, so `use` rules fire today). ⚠️ Multi-mechanic: **Apex Form has five mechanics**. Do the whole tree or none. |
| **deity/Chaos** | 5 | `EDHA_CHAOS_TALENTS` + H8 range sweeps. Ledger already repointed. |
| leyline/Black · Blue · Red · heroic/* | 18 | Small remainders, mostly bucket-3 declared exits. |

**The 17 bucket-3 declared exits** cut across every path and need **no build** — an `edha-note` cue
rule on the talent plus an `ENGINE_OWNED: <reason>` line in its tree-section header. Take them as you
pass through each path rather than as their own session. ⚠️ Re-litigate each against iron rule 3
first — Dread Presence was "manual by nature" until a `preUpdateToken` veto enforced it.

---

## Recurring shapes — find these in every path

The bulk comes from spotting that N talents are one shape. Confirmed so far:

- **A `switch (item.name)` on `useItem` or `preUseItem`** — one per tree. The `preUseItem` ones
  cancel `use()`; see SKILL.md step 2.
- **`edhaCharacterOwnersOf(NAME)` + a generic card poster** — the watcher-offers-a-reaction shape.
  **This is H25 `edha-damage-react`** for damage triggers; the **coord/test-triggered** twin
  (`edhaPostCoordReactionCard`) is the same trade and is the next one to build.
- **Per-tree `edha<Tree>DealerPre/Post` riders** inside the applyDamage wrapper — behaviour that
  fires when you deal damage, not on use. ~20 talents across ~8 trees. Needs the payload cluster:
  pre-damage veto, in-flight reduction, second-hit counter, scene tally, heal-fraction.
- **Marker LEDGERS** — six of them (`covenants` done; `edicts`, `remains`, `charges`, `snares`,
  `ordained` remain). ⚠️ **One ledger per session** (§9m q7): a half-migrated ledger silently empties
  a live list at the table. The deliverable of a ledger pass is the **REPOINT**, not the count.

## Handlers built, for reuse before you build another

H1 `edha-def-test` · H3 `edha-owner-list` · H5 `edha-cae-grant` · H6 `edha-prompt-pick` ·
H8 `edha-watch` · H10 `edha-focus` · H11 `edha-enter-stance` · H12 `edha-detonate-list` ·
H15 summon `sustainCap`/`replaceOldest` · H19 `whenSlowTurn` · H20 the `edha-draw-mana` event ·
**H24 `edha-reveal`** (07-25) · **H25 `edha-damage-react`** (07-25) · `edha-note`.

⚠️ **H8 `edha-watch` is a GATE with a stub executor** — 44 talents name it and every one still needs a
separate real payload handler. A `needs` entry naming only a gate is not a satisfiable row.
