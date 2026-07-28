# Next bench session

> **Marathon 3 is complete** (2026-07-27/28) — 8 bench runs, 6 fix passes, 36 commits.
> **Bench queue 210 🤖 → 51. Ben's list 227 ⚑ → 22.** No `⛔ STOP`, and **no pack rebuild is owed**.

## Read this first

**→ [`docs/BENCH_MARATHON_3_REPORT.md`](BENCH_MARATHON_3_REPORT.md)** — disposition, every defect
found → fixed → re-tested with commit refs, the gates built and declined, world hygiene, and the nine
wrong claims caught before shipping.

**→ [`EDHA_RULINGS.md`](../EDHA_RULINGS.md)** — 59 standing decisions. **Read §I first**: R-43 is
applied and changes live dice math.

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → run-23 operating lessons.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it
BLOCKED with the blocker named. Marathon 2 skipped ~201 drivable rows because the old wording said
"⚑ rows stay ⚑ Ben's"; that instruction is gone from both bench skills and must not come back.
**Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## Ben's queue

**⟟ Sync the module + F5.** That is the whole list. All 19 marathon-3 fixes are engine-only and already
synced; your client needs the refresh. Two rows retire on that alone.

The single queued data item — **Unbreakable Line has no `use` rule** — waits on its ruling, not on you.

## What is left: 51 🤖

| Section | 🤖 | Note |
|---|---|---|
| Adversary ability wiring | 12 | **Best target.** Run 20 ran out of runway; clusters on 4 actors (Roek+Raider, Mistheron ×2, Cinderhound, Stalker) |
| Wizard v2 | 6 | Weapon-slot variants for Agent/Envoy/Hunter/Leader; the rest are observer-dependent |
| Green (leyline) | 4 | Needs a turn boundary (drivable) or an **Opportunity** (genuinely awkward) |
| Engine-wide · White · Bench-results · Player-client | 3 each | Player-client rows need `PlayerBench` and are *rendering* checks |
| W29 · Items-dump | 3 each | W29's are ruling-gated on R-48 |
| Blue · Adversary pack sync · Vorsk | 2 each | |
| Red · Order · Heroic · Goldenport · Ashkar | 1 each | |

**Start with adversary ability wiring.** Highest count, cheapest per row, and the four actors behind it
are already identified.

### Known blockers — do not fight these

- **2bM-1 (H3 ordering)** needs **zero GM clients connected**; the bench joins as a GM and Ben's is up.
- **Anything reading `edhaIsFastTurn`** resolves via `game.combat` = Ben's live campaign combat.
  **Never activate a bench combat** — it would deactivate his.
- **Observer/rAF-dependent rows are unverifiable on this bench.** Run 22 measured **0 animation frames
  in 2.7 s and 0 ResizeObserver callbacks** — the pane is `document.hidden`. Prove the mechanism by
  hand and record BLOCKED, not FAILED.
- **The four dead-prereq rows are answered, not open**: the tree view is a PIXI canvas whose
  `isTalentAvailable` short-circuits on `hasTalent()` before prerequisites are consulted. There is no
  warning state to observe. Retirable.

## Harness traps — each has already produced or nearly produced a false result

- **Verify a gate is OPEN before treating silence as evidence** (run 19 nearly proved the once-per-round
  gate instead of the filter under test).
- **Bench PC tokens already exist on the map** — creating duplicates made the engine measure range from
  a token 121 ft away (run 20).
- **Geometry can make correct behaviour look broken** — a one-square push is all-or-nothing by
  construction; a 31 px shortfall is v13's wall-constrained walk.
- **Read `movement.walk.rate.value`, not `.override`** — the getter adds `.bonus` on top, so a working
  +10 reads as +0. Same family as "read `system.deflect.value`, never `.derived`".
- **An item cloned from a compendium is NOT hand-added** — it carries `_stats.compendiumSource`, so a
  sync correctly replaces it.
- Bench PCs carry a **10 ft sight range**; a token's **prepared** position reads stale while the ticker
  is parked (read `_source`).
- **Snapshot whole effect OBJECTS, not names**, and include unlinked token actors *and their flags* —
  two runs could not attribute a change because of exactly this gap.
- **When reverting a flag, restore the whole snapshot object** — `{recursive: false}` on a sub-path
  strips siblings.
- In the **built** pack, `system.events` is an OBJECT keyed by rule id with the type at
  **`rule.handler.type`** — a `rule.type` scan returns a vacuous 0/0.
- A **per-name** scan over-counts: seven adversaries carry an ability called "Predatory Patience".
- **`grep -c` counts LINES, not occurrences**, and a byte-check clause means "outside comments".
- Chat log is `ol.chat-log` in v13.

## Standing lessons

- **Verify the root cause in code before touching anything.** Nine confident claims were wrong on
  inspection this marathon; two would have produced a false PASS, one would have cost a needless pack
  rebuild, and one was a "regression" whose causal chain turned out byte-identical.
- **Verify a deploy by HASH, never by counting markers.**
- **A re-test without its negative control is not a re-test.** The negatives caught more real problems
  than the positives did — an `id`-only dedupe that collapses three actors into one, a health fix that
  would have healed wounded PCs on reload, a status fix that would have expired hand-toggled markers.
- **Check your own harness before reporting a defect.**
- **A checked-in test that cannot fail proves nothing** — two were green while their feature was dead,
  and two more were inert on Ben's CRLF checkout while CI stayed green.
- **Provenance, not shape, decides whether a guard is wrong.**
