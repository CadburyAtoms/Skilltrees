# Next bench session — run 17

> **Marathon 3 is under way.** Run 16 (Lunavar + Malcurr + Vorsk bestiaries) retired **18 of 23**
> rows on evidence, root-caused **three engine defects**, and finished with **zero world drift**.
> Nothing is blocked on a deploy: the engine is hash-verified live and the pack-rebuild list is
> still **EMPTY**.

## Your scope — 22 rows, two bestiaries

| Section | 🤖 rows | Distinct actors to import |
|---|---|---|
| `# Goldenport Coast Bestiary` (checklist ~L2227) | **11** | The Garden Sow · Cinderbrock · Cold-Fire Cinderbrock · Keelshadow (**4**) |
| `# Ashkar Mesas Bestiary` (checklist ~L2604) | **11** | The Reckoning · The Slagbull · Hazewyrm Whelp Pack · Hazewyrm Adult · Hazewyrm Elder (**5**) |

Both sections' "Deploy needed first" blocks were struck 2026-07-27v. **Nothing here is
BLOCKED-ON-DEPLOY.**

**Nine imports cover twenty-two rows.** Import each actor **once**, fresh from the pack as
`Bench Adv — <name>`, and drive every row that touches it before moving on. Run 16 measured the real
density at **~1.2 rows retired per import** — the older "4.5 rows per drag" figure is optimistic;
budget accordingly.

## Read before driving

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → **run-16** operating lessons. Run 16's block is the
newest and overrides older advice. The five that will cost you a row if you skip them:

1. **`edhaResolveKiller` uses the CONTROLLED token, not the damage dealer** — any on-defeat row needs
   `tok.object.control()` on the killer. (The Reckoning and the Slagbull both have on-defeat shapes.)
2. **Turn-start events only fire on a FORWARD step** — `combat.update({round: r+1, turn: 0})`, never
   a backward `{turn}`. `nextTurn()` leaves `turn: null` under Advanced Encounters.
3. **`whenFastTurn` is undrivable from a bench combat** while Ben's campaign combat is active —
   `edhaIsFastTurn` reads `game.combat`. Record BLOCKED, blocker named, **row stays 🤖**.
   ⚠️ **The Slagbull's Unstoppable is exactly this case** — see the known defect below before you
   spend time on it.
4. **Walk ANY `dialog[open]`**, matching `roll|continue|yes|ok` — consume-resource confirms block
   `item.use()` and are not `dialog.roll-configuration`.
5. **A formula that can roll 0 needs samples** — `floor(1d6/2)` and friends return silently on 0.

## Known defects — do NOT re-file these as new

Run 16 root-caused three; all are in the 2026-07-27x handoff delta and feed test-pass-fixes.
If a Goldenport/Ashkar row depends on one, it will fail for a reason already understood:

- **Ambush-belief ledger unreadable** (dotted-UUID flag key expansion) → `whenTargetFooled` riders
  never fire and the once-per-scene guard never holds. Any seeming/ambush block inherits this.
- **Object-as-scalar reads (2 sites).** `edhaSpeedFt` returns **0**, so every `edha-move {byHalfSpeed}`
  moves **0 ft** — this hits **The Slagbull / Unstoppable** directly. And `edhaAmbushBeliefTest`
  rolls `1d20 + 0` instead of the target's Perception.
- **Two `hp-below` cues on one item share a once-per-round key**, so the lower threshold never fires.
  Check any block whose morale trait carries two thresholds.

## Standing rules (unchanged)

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or
  deactivate a scene or combat. Create only in the Edha Bench folders.
- **Snapshot ids, flags AND EFFECTS before creating anything**; clean up by id-diff against your own
  snapshot. Runs 11–16 all hit zero drift — match them.
- **Never resolve a token by NAME when duplicates exist** — use the id or `actorId`.
- **Verify the deploy BY HASH on join** (cache-bust fetch → CRLF→LF → SHA-256 vs
  `HEAD:module-src/scripts/register-skills.js`). Run 16's match was
  `3c53a42ad233f5808ae5b6c86c038daf0115bbae073751c64a2a4ac06c9f27ea`.
- **Design/feel/balance questions go to `EDHA_RULINGS.md`** (now 48 entries), never into the
  checklist as a ⚑ row.
- **Only claim what your own logs support**, and label inferences as inferences.
- **Log out at the end without fail** — `game.logOut()`, then confirm `Bench` is selectable on
  `/join`.

## World state you can rely on

- **Adversary world-sync is NOT owed.** Run 16 fingerprinted all 46 world adversaries against their
  pack source (item names, damage formula/type, activation type/skill, every rule's handler type):
  **0 drift**. Do not run `edha.syncAllAdversaries()` — it touches Ben's campaign actors and is not
  authorised.
- Ben's `Gamemaster` client is usually connected and **Bench held `isActiveGM`** in run 16. A
  duplicate card with two GMs is not automatically a defect — attribute by `userId` first.
- Ben's campaign combat `BerbNeuXp4iKduef` is live at round 1. Read it, never modify it.

## After Goldenport + Ashkar

The remaining bestiary sections are **Canticle Plains** (~L2287) and **Kettavar Tundra** (~L2659),
then the Corvaine/Riverlands/Thalendor tails. Same import-once shape, same density.
