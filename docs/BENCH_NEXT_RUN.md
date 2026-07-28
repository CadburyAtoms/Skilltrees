# Next bench session — run 23

> **Marathon 3 continues.** Run 22 re-tested **fix pass E** (3 of 4 retired — every positive AND every
> load-bearing negative held; the 4th is BLOCKED by a permanent harness limit, not a defect) and swept
> the **six re-test sections**: **32 🤖 in, 24 retired, 4 not reached**. **27 rows retired total — the
> best run of the marathon.** Zero world drift: 87 actors / 52 tokens / 117 walls, unchanged. The
> engine is hash-verified live and the pack-rebuild list is still **EMPTY**.

## Your scope — **the bench tails, 22 🤖**

| Section | Line | 🤖 |
|---|---|---|
| `# BENCH — Engine-wide & cross-tree` | 341 | **7** |
| `# BENCH — White (leyline)` | 483 | **3** |
| `# BENCH — Blue (leyline)` | 507 | **3** |
| `# BENCH — Red (leyline)` | 575 | **1** |
| `# BENCH — Green (leyline)` | 594 | **4** |
| `# BENCH — Order (Tessavain, deity)` | 1157 | **1** |
| `# BENCH — Heroic paths` | 1237 | **3** |

Counted from run 22's end state — **count it yourself before you start** and state your scope up front.
**55 🤖 remain in the checklist overall.**

⚠️ **Start with Engine-wide, and read its own header first: if `2bA-7` (edit-round-trip) fails, STOP the
run and report.** Everything in every tree rides on it. After that the leylines are the natural order
(White → Blue → Red → Green), then Order, then Heroic.

⚠️ **This is the opposite shape from run 22.** Run 22 hit 13.5 rows per subject because one wizard
walkthrough and one sync click each carried many rows. These 22 are **combat and talent mechanics spread
across seven trees** — closer to run 19's 2.1 per import. **Import/stage only for the rows you are about
to drive** (run 20 fell to 0.62 by batch-importing 9 actors and never driving 4).

## Read before driving

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → **run-22** operating lessons; run 22's block is newest and
overrides older advice. The ones that will cost you a row here:

1. **Read a DerivedValueField's `.value`, never `.override`/`.derived`.** Run 22 read
   `movement.walk.rate.override` and recorded a working +10 speed AE as **+0** — a clean false FAIL. The
   engine writes the Edha value into `override` *and* the getter adds `.bonus` on top. This generalises
   the old `system.deflect.value` rule: **the field you want is always `.value`.** Directly relevant
   here — the leyline and Heroic rows are full of numeric AEs.
2. ⛔ **The pane is `document.hidden`: rAF delivers 0 frames and NO observer ever fires.** Measured in
   run 22 (`ResizeObserver` and `IntersectionObserver` both 0, including their initial observation);
   `tabs_select` does not un-hide it. Any fix triggered by an observer/rAF is **BLOCKED with the blocker
   named**, never FAIL. You can still prove the *mechanism* by invoking its effect by hand.
3. **`game.combat` is Ben's combat, always.** Anything gated on `game.combat?.started` +
   `edhaCombatantTurnIndex` cannot see a bench combat made `active:false`. **BLOCKED**, blocker named —
   never a fail, never re-filed as ⚑. Several Engine-wide rows are combat-shaped, so expect this.
4. **One `use()` per `javascript_tool` call**, with `use({shouldConsume:false, configurable:false})`.
   Two in one call blows the 30 s budget; a timeout is not evidence of a hang.
5. **Verify a once-per-round gate is OPEN before treating silence as evidence** (run 19), and **always
   pair a negative with a control that makes the same rule FIRE**.
6. **`edha-on-hit` and damage riders land on damage APPLICATION, not on the roll** — click the card's
   `button[data-action="apply-damage"]` with the victim controlled.

## Known — do NOT re-file these as new

- **The `edhaDeriveSheetStats` family.** It adds **+1 max HP to every character** (`EDHA_HP_BONUS`) and
  writes Move as `20 + 5×SPD` into `walk.rate.override`. **R-54** decides the number. Cite it; do not
  open a new defect if a health or speed number surprises you.
- **Adversary Senses Range is 5 ft live, not 10.** `edhaDeriveSheetStats` and both `preCreateActor`
  hooks return early for non-characters, so the Edha AWA table is character-only. The **pack** ships
  token sight **10** against a Senses Range of **5** (52/52), and **⟳ Sync pushes the 10**. Fully
  measured into **R-56**; two checklist rows wait on it. Cite, don't re-derive.
- **Content-link clicks are not drivable** — synthetic clicks do not trigger Foundry v13's handler, and
  with the pane hidden `screenshot` (and coordinate clicks) are unavailable.
- **R-41 / R-42** (map picker) and **R-54 / R-55 / R-56** — standing rulings; several rows wait on them.
- **`rules = 0` is not automatically a failure** — read the pack AND grep the engine first. ⚠️ The built
  shape keys `system.events` by rule id with the type at **`rule.handler.type`**; a `rule.type` scan
  returns a vacuous 0/0.
- **A talent name may exist in several trees.** Hardy ×4, Surefooted ×3, Combat Training ×2 in the
  heroic pack alone — resolve by id, and check `system.path` before assuming which copy you have.

## Standing rules (unchanged)

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or deactivate
  a scene **or a combat** (`Combat.create({active:false})` + `combat.update({round,turn})` kept Ben's
  combat untouched through runs 19–22). Create only in the Edha Bench folders; import adversaries fresh
  as `Bench Adv — <name>`. ⚠️ The engine **auto-renames** placed tokens — **resolve tokens by id,
  always** (run 22 met a pre-existing `Mistheron (1)` beside its own auto-renamed `Mistheron (2)`).
- ⚠️ **Bench PC tokens ALREADY EXIST on the map.** Never create a second one — `move({action:"displace"})`
  the existing one. `edhaCasterToken()` resolves `actor.getActiveTokens()[0]`, so a duplicate makes a
  correct range filter look dead.
- **Snapshot ids, flags, EFFECTS — and unlinked token actors' flags too.** ⚠️ **New from run 22: capture
  whole effect OBJECTS (`e.toObject()`), not just names** — run 22 could report two bench PCs losing an
  `edha-aura` effect but could not restore it. Restore the **whole** flag object (run 22 restored
  `Bench — White` byte-exact, 378 → 378 chars).
- **Verify the deploy BY HASH on join.** Run 22's match was
  `2e34ea72f151ee47ef2f7c3d12e3e9af4a19b076a943ae9bbdf3c7407870ed99` (git blob `9346245`, 19389 lines).
  **Marker counts in a handed-down brief go stale — the hash does not**, and a "must NOT contain
  <string>" line is a hint that fails correct deploys when the fix quotes old code in its comments.
- **🤖 is your queue; ⚑ is Ben's judgment — never re-file an unrun 🤖 as ⚑.** Out of time → leave it 🤖,
  or record it **BLOCKED** with the blocker named.
- **Design/feel/balance questions go to `EDHA_RULINGS.md`** (now **56** standing decisions), never into
  the checklist as a ⚑ row.
- **Only claim what your own logs support**, and label inferences as inferences.
- **Log out at the end without fail** — `game.logOut()`, then confirm `Bench` is selectable on `/join`.
  If you used `PlayerBench`, log **both** out.

## World state you can rely on

- Ben's `Gamemaster` client is usually connected and **Bench held `isActiveGM`** in runs 16–22. A
  duplicate card with two GMs is not automatically a defect — **attribute by `userId` first.**
- Ben's campaign combat `BerbNeuXp4iKduef` is live at **round 1**, turn `null`, on the active
  `Playtest Map` (**52 tokens, 117 walls, 87 world actors** — run 22 ended exactly on those numbers).
  Read it, never modify it.
- **Adversary world-sync is NOT owed** (run 16: 46 fingerprinted, 0 drift; run 22 re-confirmed the
  four Corvaine Raiders are current). Do not run `edha.syncAllAdversaries()` without authorisation —
  two `# Adversary pack sync` rows are still waiting on exactly that authorisation.
- `PlayerBench` (`yF9LHvfhB7otsHYY`) is passwordless and free. The `🎮 Player-client window` section is
  the batch to burn down whenever that client is up.
- Bench-folder fixtures carry accumulating residue. Ordinary — do not try to "fix" it. ⚠️ Specifically:
  `Bench — Heroic` carries a pre-existing `Determined` effect, a `bpHits` flag and a `quarry` list;
  `Bench — Blue` and `Bench — White` are currently **without** their "Guardian Stance (+1 Deflect)"
  aura (White owns the stance and is not in it) — that is run-22 residue, already reported, not new
  drift and not yours to chase.
- ⚠️ Ben's `Stonebound Captain` token still carries the run-19 `trigRound` key, and his `Stitchmother` /
  `Mutated Thrall (2)` tokens carry `bpHits` values of unproven age. Not drift you caused; do not clean.

## After this section

Once the tails are done the remaining 🤖 concentrate in: `# Adversary ability wiring` (**12**), the four
bestiaries (**7** between them), `# Character-creation wizard v2` (**6** — of which 3 are ruling-gated
and 1 is the harness-blocked ResizeObserver row), `# Items-dump tranche` (**3**), `# Bench-results
fixes` (**3**), and `# Adversary pack sync` (**2**, both needing bulk-sync authorisation).
