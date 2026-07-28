# Next bench session — run 20

> **Marathon 3 continues.** Run 19 re-tested **fix pass C 4-for-4 across eight drives** (4 deterministic
> tokenless + 4 real phantom-double breaks, because the mechanism is a hook race), then swept
> **`# W29 Balance-Pass Bestiary`: 24 🤖 in, 21 retired, 3 left, zero NOT REACHED.** The engine is
> hash-verified live and the pack-rebuild list is still **EMPTY**.

## Your scope — 27 rows, two sections

| Section | Lines | 🤖 | ⚑ (leave) |
|---|---|---|---|
| **`# Adversary ability wiring`** | ~2150–2480 | **25** | 3 |
| **`# W23 adversary pipeline`** | ~1507–1560 | **2** | 0 |

Counted directly, not inherited — **do the same before you start**, and state your scope up front.

The Adversary-ability-wiring section is the **2bAB-\*** family, and several W29 retirements were
explicitly merged *into* it, so a handful of these rows are the surviving coverage for abilities the
bestiary sections no longer test. Named in the W29 parentheticals: **2bAB-3** (Retributive Guard —
already seen firing at run 19), **2bAB-5** (Whispered Doubt focus-tax), **2bAB-6** (Grasping Vines +
Territorial Instinct), **2bAB-7** (Drive the Prey), **2bAB-9** (Sovereign of Solitude), **2bAB-10**
(Intercept / Forewarned). Those six are the highest-value rows in the section — do not leave them for a
later run.

**W23** is two Corvaine Line-Caller flows: **Guiding Signal** (`edha-designate`, inv 2→1) and
**Ordered Advance** (`edha-move-window`, 2 Actions, inv −1). ⚠️ Import a **fresh** Line-Caller as
`Bench Adv — …`; Ben has three unlinked Corvaine tokens on the map already and resolving by name will
grab one of his.

## Read before driving

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → **run-19** operating lessons; run 19's block is newest and
overrides older advice. The six that will cost you a row if you skip them:

1. **A "no card" negative is worthless unless you prove the once-per-round gate was OPEN first.**
   `edhaTriggerAllowed` reads **`game.combat.round`** — Ben's combat, parked at round **1** — so any
   owner whose `trigRound` already stores `1` is silent for the wrong reason. Compute the key
   (`cue:<item>:<trigger>:<atFraction>:<rangeFt>:<everyNRounds>`), assert `gateOpen` **before and
   after** every negative, and prefer **your own bench import** whose gate you control.
2. **Always pair a negative with a control that makes the same rule FIRE.** Otherwise "no card" is
   indistinguishable from a dead rule.
3. **Stage attackers at disposition −2.** Only 1 and −1 are in use on the map, so −2 keeps a −1 victim
   **Isolated** (`edhaIsIsolated` counts same-disposition adjacents) *and* keeps your `ally-drops`
   traffic off Ben's tokens. Assert `edha.isIsolated()` before any Isolated-gated row —
   **2bAB-6 and 2bAB-9 are both Isolated/status-gated.**
4. **One `item.use()` per `javascript_tool` call.** Two blow the 30 s tool budget; a timeout is not
   evidence of a hang — check `_source` and the chat tail first.
5. **Compute bloodied/threshold crossings AFTER deflect** (`system.deflect.value`, never `.derived`).
6. **Click-to-place** (`edhaPickPoint` / `edhaCastBurst`): pin `canvas.mousePosition` with a
   configurable getter, dispatch a `PointerEvent` on `#board`, then click Detonate. Escape cancels and
   refunds. Run 19's `__pick(x, y)` recipe worked first time on all four placements.

## Known — do NOT re-file these as new

- **R-48's `bySize` rank-scaling family** (now four blocks: Cragdrake Adult, Brandram ×2, Tussock-Sow,
  with the Briar-Gone Grove at rank 3 as the working control). Any adversary card promising a distance
  its `bySize` rule cannot deliver is **this ruling**, not a new defect. Log the instance, move on.
- **`ally-drops` 5-ft cues miss adjacent allies** (R-52 — centre-to-centre, no slack; Large owners
  never reach outside their own footprint).
- **`whenFastTurn` is undrivable** while Ben's campaign combat is active (`edhaIsFastTurn` reads
  `game.combat`). Record **BLOCKED, blocker named, row stays 🤖.**
- **Unbreakable Line has no `use` rule** on either block (W29 §2) — already filed.
- **Stepping a bench combat stamps cue ledgers on Ben's campaign tokens** (`edhaTurnCueSweep` scans the
  whole scene). Expect it, snapshot for it, report it, **do not clean his actors**.
- **Pyre spread card BY ALIAS** (Ashkar §3, Cinderbrock) is still **unblocked but unrun**. Nearly free
  if you have a spare combat step.

## Standing rules (unchanged)

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or
  deactivate a scene or combat (`Combat.create({active: false})` + `combat.update({round, turn})` kept
  Ben's combat untouched all through run 19). Create only in the Edha Bench folders; import adversaries
  fresh as `Bench Adv — <name>`. ⚠️ The engine **auto-renames** placed adversary tokens
  ("Corvaine Raider (3)"), so a `Bench Adv —` actor name does **not** mean a `Bench Adv —` token name:
  **resolve tokens by id, always.**
- **Snapshot ids, flags, EFFECTS — and unlinked token actors'** (`canvas.scene.tokens.filter(t => !t.actorLink)`).
  Compare **deep-equal, key-sorted**, never by `JSON.stringify`. Restore the **whole** flag object.
- **Verify the deploy BY HASH on join** (cache-bust fetch → CRLF→LF → SHA-256 vs
  `HEAD:module-src/scripts/register-skills.js`). Run 19's match was
  `b1bd52c165b8ce0d1b8bc3651f862a6be81795c7adc16aabf7d86abe0bfb01b2` (git blob `c0b0c1e`).
  **Marker counts in a handed-down brief go stale — the hash does not.**
- **🤖 is your queue; ⚑ is Ben's judgment — never re-file an unrun 🤖 as ⚑.** Out of time → leave it
  🤖 or record it **BLOCKED** with the blocker named.
- **Design/feel/balance questions go to `EDHA_RULINGS.md`** (now 54 standing decisions), never into the
  checklist as a ⚑ row.
- **Only claim what your own logs support**, and label inferences as inferences.
- **Log out at the end without fail** — `game.logOut()`, then confirm `Bench` is selectable on `/join`.

## World state you can rely on

- **Adversary world-sync is NOT owed** (run 16 fingerprinted all 46: 0 drift). Do not run
  `edha.syncAllAdversaries()`.
- Ben's `Gamemaster` client is usually connected and **Bench held `isActiveGM`** in runs 16–19. A
  duplicate card with two GMs is not automatically a defect — attribute by `userId` / `speaker` first.
- Ben's campaign combat `BerbNeuXp4iKduef` is live at **round 1**, on the active `Playtest Map`
  (52 tokens, 117 walls, 1 region, 87 world actors — run 19 ended exactly on those numbers). Read it,
  never modify it.
- Bench-folder fixtures carry accumulating `bpHits` counters and occasional leftover statuses.
  Ordinary bench residue — do not try to "fix" it.
- ⚠️ **Ben's `Stonebound Captain` token actor carries a run-19 `trigRound` key**
  (`cue:Reactive Strike:enemy-turn-start:0_5:10:1 → 1`), left in place deliberately and reported in the
  07-28e delta. It is additive and inert once his combat advances. Not drift you caused; do not clean it.

## After these two sections

**121 🤖 rows remain in the checklist overall** (measured after run 19's 21 retirements). The remaining
bestiary tails are **Corvaine**, **Riverlands** and **Thalendor**, same import-once shape.
