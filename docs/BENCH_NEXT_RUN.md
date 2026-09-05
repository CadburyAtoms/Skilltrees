# Next bench session

> **Weekend marathon, run 1 (bench run 24, 2026-09-05) is done.** First live drive of the
> **2026-08-10 hygiene campaign (R-60..R-67)**. **10 rows retired, 2 defects root-caused, 1 new row
> filed, 2 partials.** Open queue **85 🤖 → 76 🤖** (⚑ unchanged at 22). No `⛔ STOP`, **no pack
> rebuild owed**, world restored to its start snapshot exactly.

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-05 — BENCH RUN 24` delta at the top** — every retirement
with its evidence, both defects with their root cause read out of source, and the world-hygiene diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 24"** — four traps that each cost a row
this run and will cost you one too: Foundry's **socket rate limiter** (silent), bench PCs' **Investiture
max of 2** (silent), **`item.use()` hanging on `ItemConsumeDialog`**, and the **one-status ActiveEffect
`_id` crash**.

**→ `EDHA_RULINGS.md`** — R-1, R-2 and R-4 were answered by Ben on 2026-09-05; R-43 is applied and
changes live dice math.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it
BLOCKED with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a
new ⚑ row.**

## Two corrections for the PM before run 2 is dispatched

1. **"Heroic has 54 🤖 rows" is not true of the current checklist.** `# BENCH — Heroic paths` holds
   exactly **1 🤖** row (and 2 ⚑). It does not need dedicated runs. The counted state is in the table
   below — it was measured off the file, not inherited.
2. **The hygiene campaign is still the biggest and most valuable block: 26 🤖 rows, 21 of them never
   reached.** It is the reason this marathon exists, its 34 rows have never been at a table before this
   run, and the bench roster is now built and warm for exactly those trees. **Recommendation: make run 2
   hygiene part 2, and fold the 11-row leyline scatter into run 3.** The scope written below is the one
   the PM directed; this note exists so the choice is made deliberately.

## Run 2 as directed — the leyline scatter, then Heroic

| Section | 🤖 | Note |
|---|---|---|
| Green (leyline) | 4 | Needs a turn boundary (drivable — run 23 proved `Combat.create({active:false})` + `combat.update({round,turn})` fires `combatTurnChange` with the bench combat) or an **Opportunity** (genuinely awkward) |
| White (leyline) | 3 | |
| Blue (leyline) | 2 | |
| Red (leyline) | 1 | |
| Order (deity) | 1 | |
| Heroic paths | 1 | **not 54** |
| **total** | **12** | |

The roster is already built: `Bench — White/Blue/Black/Red/Green` each carry their whole 25-talent tree,
and `Bench — Red`, `Bench — White`, `Bench — Order`, `Bench Target — Adjacent A/B` already have tokens on
the Playtest Map around (2700–3000, 4500–5100). **Give every PC you drive Investiture and HP before you
touch a row** (see the runbook lesson) — that alone would have saved this run twenty minutes.

## What is left overall: 76 🤖

| Section | 🤖 | Note |
|---|---|---|
| **Hygiene campaign 2026-08-10** | **26** | **The biggest block and the marathon's purpose.** R-65 7 of 8 untouched · pass 5.2 all 7 untouched · pass 5.3 7 left · R-60 has 1 fail + 1 new row |
| Adversary ability wiring | 12 | Clusters on 4 actors (Roek+Raider, Mistheron ×2, Cinderhound, Stalker) |
| Wizard v2 | 6 | Weapon-slot variants; the rest are observer-dependent |
| Green (leyline) | 4 | |
| White · Player-client · Items-dump · Bench-results · W29 | 3 each | Player-client rows need `PlayerBench`; W29's are ruling-gated on R-48 |
| Blue · Engine-wide · Adversary pack sync · Vorsk | 2 each | |
| Red · Order · Heroic · Goldenport · Ashkar | 1 each | |

## Where hygiene part 2 should start (if the PM takes the recommendation)

1. **pass 5.2's R-64 rows (3).** Real behaviour fixes, and the cheapest live shape available:
   `Bench — Black`'s **Predatory Patience** carries `edha-on-hit → edha-triggered-effect
   {whenTargetStatus: "weakened", target: "self"}` — the row's own named example, already on the roster.
2. **R-65's remaining 7.** All ride ONE choke point, `edhaRollFormula`, and run 24 proved the fold works
   there on two distinct formulas (`2d8` and `2d8 + 2`, both from `(@tier)d(2 * @skills.<c>.rank + 2)`
   shapes). Each row is now "does THIS family reach the shared helper" — pick the cheapest driver per
   family rather than staging the flagship Set Charge → Detonate flow first.
3. **pass 5.3's R-66 F5-persistence row** — it settles the Engine-wide `Flame Surge / burst cards` row at
   the same time. Persist your start snapshot to `localStorage` first (run 23's lesson); run 24 did and
   it is still there under `edhaBenchSnap_run1`.

## Known blockers — do not fight these

- **Job 6a (pass 5.2) and 2bM-1** need **zero GM clients connected**; the bench joins as a GM and Ben's
  is up. Record BLOCKED with the blocker named — never re-file as ⚑.
- **R-62's audience rows** need a GM logged OUT while a player client fires the card. Same blocker.
- **`edhaIsFastTurn` / anything reading `game.combat`** resolves to Ben's live campaign combat.
  **Never activate a bench combat.** ⚠️ New this run: Ben's combat currently has **zero combatants**, so
  `edhaCombatEndGuard` is EMPTY and a bench combat delete sweeps his actors too. Nothing was lost (run 24
  diffed and restored), but check `game.combats.get(...).combatants.size` before assuming the guard shields
  anything.
- **Observer/rAF-dependent rows are unverifiable on this bench** (run 22: 0 animation frames in 2.7 s,
  0 ResizeObserver callbacks). Prove the mechanism by hand and record BLOCKED, not FAILED.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden, so `edhaPickPoint` cannot be driven
  by synthetic pointer events — shadow just that getter and declare it (run 23).

## Harness traps — each has already produced or nearly produced a false result

- **The socket rate limiter fails silently into your rows** (run 24). A talent that produces no card, no
  notification and no console error may be a discarded write, not a dead talent. Check
  `read_console_messages({onlyErrors:true})`; wait ~30 s; space bulk writes ~400 ms apart.
- **Bench PCs have Investiture max 2 and target fixtures have 0 HP** (run 24). Both make correct talents
  look broken, with no diagnostic anywhere.
- **`item.use()` never settles while `ItemConsumeDialog` is open** (run 24) — fire-and-poll.
- **A one-status ActiveEffect with no `_id` throws and aborts the whole create batch** (run 24).
- **Verify a deploy by HASH, and prove the RUNNING code** — compare the original `<script>` resource
  entry's `decodedBodySize` against your cache-busted fetch (run 24).
- **Verify a gate is OPEN before treating silence as evidence** (run 19).
- **Bench PC tokens may already exist on the map** — duplicates made the engine measure range from a
  token 121 ft away (run 20).
- **Read `movement.walk.rate.value`, not `.override`**; same family as `system.deflect.value`.
- **Snapshot whole effect OBJECTS, not names**, include unlinked token actors *and their flags*, and
  **persist it outside the page** if any row needs an F5.
- **When reverting a flag, restore the whole snapshot object** — `{recursive:false}` on a sub-path strips
  siblings.
- In the **built** pack, `system.events` is an OBJECT keyed by rule id with the type at
  `rule.handler.type`; but the combat-timing dispatcher filters on `rule.event`. **Read the consuming code
  before writing the scan.**
- **Delete bench combats LAST** — a `deleteCombat` sweep is unscoped and will clear ledgers you still need.
- Chat log is `ol.chat-log` in v13.

## Standing lessons

- **Verify the root cause in code before touching anything.** Run 24's two defects were both confirmed by
  reading source (`edhaSceneReset`'s busy key; Foundry's `DialogV2#_onSubmit`) before being written down.
- **A re-test without its negative control is not a re-test.** Run 24's Fate row is only decisive because
  the marker template *survived* the first delete and *died* on the second.
- **Check your own harness before reporting a defect.** Three "silent no-ops" this run were the consume
  dialog, an Investiture max of 2, and the rate limiter — none were the talent.
- **Only claim what your own logs support, and label inferences as inferences.**
