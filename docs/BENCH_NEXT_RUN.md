# Next bench session — run 22

> **Marathon 3 continues.** Run 21 re-tested **fix pass D** (4 of 5 rows retired — every positive
> AND every load-bearing negative held) and swept the **34-row `# Character-creation wizard v2`** in
> ONE continuous walkthrough: **25 retired, 4 root-caused fails that are really ONE bug, 2 new
> rulings, 0 not-reached.** **29 rows retired total — the best run of the marathon.** Zero world
> drift: 87 actors / 52 tokens / 117 walls, unchanged, no token moved. The engine is hash-verified
> live and the pack-rebuild list is still **EMPTY**.

## Your scope — the re-test sections, **32 🤖**

| Section | Line | 🤖 |
|---|---|---|
| `# Culture items` (07-18k) | 1818 | **3** |
| `# Items-dump tranche` (07-18j) | 1864 | **5** |
| `# Bench 07-18 fixes re-test` (07-18g) | 1909 | **7** |
| `# Currency wiring` (07-18e) | 1962 | **3** |
| `# Adversary pack sync` (07-18b) | 1981 | **7** |
| `# Bench-results fixes` (07-17c) | 2043 | **7** |

Counted from run 21's end state — **count it yourself before you start** and state your scope up
front. **82 🤖 remain in the checklist overall.**

⚠️ **These are six SMALL sections, not one flow.** That is the opposite shape from run 21's wizard,
and it should change how you budget. Run 21 hit 12.5 rows retired per subject created *because the
whole section was one continuous walkthrough over one actor*; these six are independent re-tests of
older fixes across items, currency, culture and adversaries. Expect something closer to run 18's
per-import rate, and **import/create only for the rows you are about to drive** (run 20 fell to 0.62
by batch-importing 9 actors and never driving 4 of them).

**Read the sections' own headers first — several name a deploy step** (`deploy-to-foundry.bat`,
⟳ Sync, ⟳ Sync Adversaries from Pack, or a re-drag). Ben's machine is at the 07-27u build. **Check
DEPLOY STATE and the dates before believing any "wrong text / old behaviour" row** — several of
these date from 07-17/07-18 and a stale *placed copy* is the single most likely explanation, not a
code defect. The 2bAB-9 row is the worked example: run 20 called `rules = 0` an authoring gap when
the pack carried four rules and the placed copy was simply frozen.

## Read before driving

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → **run-21** operating lessons; run 21's block is newest
and overrides older advice. The ones that will cost you a row here:

1. **Verify the deploy BY HASH — and do NOT trust a handed-down "must NOT contain <string>" check.**
   Fix pass D's byte-check named three strings as forbidden; **two of them are present in the shipped
   fix's own comments** (L334, L2017, L3458). A literal reading fails a correct deploy.
2. **`game.combat` is Ben's combat, always.** Anything the engine gates on `game.combat?.started` +
   `edhaCombatantTurnIndex` cannot see a bench combat made `active:false`. That is a **BLOCKED** cell
   with the blocker named, never a fail and never re-filed as ⚑.
3. **The hidden pane throttles `setTimeout` to ~1 s** — a loop with sleeps blows the 30 s budget.
   Batch UI sweeps 3–4 at a time with **no sleeps**, reading state synchronously after each click.
4. **A re-rendering dialog detaches your cached elements every failed submit.** Re-query via a `q()`
   helper each step; drive inputs with `.click()`, not `.checked = true`.
5. **Snapshot unlinked tokens' FLAGS, not just effects/statuses** —
   `canvas.scene.tokens.map(t => [t.id, JSON.stringify(t.actor?.flags?.["edha-content"] ?? {})])`.
   Run 21 could not attribute a `bpHits` value because it only captured effects.
6. **For UI/text rows the DOM is the evidence and beats a screenshot** — computed styles and
   `getBoundingClientRect` settle clipping, overlap, fit and "looks fillable" outright, with no
   visible pane needed. Relevant here: the **currency** section is largely a sheet-widget look/behaviour
   block.

## Known — do NOT re-file these as new

- **The `edhaDeriveSheetStats` family (run 21's headline).** That engine function (~L16178)
  deliberately adds **+1 to `hea.max.bonus` in memory for every character** and overrides walk rate
  with **20 + 5×SPD**. It is why the wizard preview shows Health 13 where the sheet says 14 and Move
  30 where the sheet says 35, and why a finished PC lands at **13/14 health**. Three checklist rows
  carry it, and **R-54** decides the target number. If a currency/items row trips a health or speed
  number, cite this — do not open a new defect.
- **All six heroic paths ship `linkedSkills: []`** at cosmere-rpg 2.1.0, so the wizard's path-training
  dialog never fires. Filed on its row.
- **The wizard's "Where are you from?" page overflows a 900 px viewport by 125 px** (`max-height:
  none`). Filed.
- **Content-link clicks are not drivable in this harness** — synthetic clicks do not trigger Foundry
  v13's handler (proved with a chat-message control), and with the pane hidden `screenshot`, and thus
  coordinate-clicks, are unavailable.
- **Braced expiry cell (b)** — BLOCKED on `game.combat`, row stays 🤖. Cells (a), (c), (d) pass.
- **R-41** (labelled vs label-free picker map) and **R-42** (five map-picker dead spots) — standing
  rulings; three checklist rows wait on them. Cite, don't re-file.
- **`whenFastTurn` is undrivable** while Ben's campaign combat is active — BLOCKED, blocker named.
- **`rules = 0` is not automatically a failure** — read the pack AND grep the engine first.

## Standing rules (unchanged)

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or
  deactivate a scene **or a combat** (`Combat.create({active:false})` + `combat.update({round,turn})`
  kept Ben's combat untouched through runs 19, 20 **and** 21). Create only in the Edha Bench folders;
  import adversaries fresh as `Bench Adv — <name>`. ⚠️ The engine **auto-renames** placed tokens —
  **resolve tokens by id, always.**
- **Wizard-created PCs land in `Edha PCs` (that is the test) — record the id and DELETE them at the
  end.** Run 21 created 2 and deleted both.
- **Snapshot ids, flags, EFFECTS — and unlinked token actors' flags too.** Compare deep-equal,
  key-sorted. Restore the **whole** flag object.
- **Verify the deploy BY HASH on join.** Run 21's match was
  `c076e410717cd45d931b2929f030948b91dea0330c8c8a737e42c9f8015c474d` (git blob `7990378`, 19250
  lines). **Marker counts in a handed-down brief go stale — the hash does not.**
- **🤖 is your queue; ⚑ is Ben's judgment — never re-file an unrun 🤖 as ⚑.** Out of time → leave it
  🤖 or record it **BLOCKED** with the blocker named.
- **Design/feel/balance questions go to `EDHA_RULINGS.md`** (now **55** standing decisions), never
  into the checklist as a ⚑ row.
- **Only claim what your own logs support**, and label inferences as inferences.
- **Log out at the end without fail** — `game.logOut()`, then confirm `Bench` is selectable on
  `/join`. If you used `PlayerBench`, log **both** out.

## World state you can rely on

- **Adversary world-sync is NOT owed** (run 16 fingerprinted all 46: 0 drift). Do not run
  `edha.syncAllAdversaries()`. ⚠️ But the `# Adversary pack sync` section in your scope is *about*
  that machinery — read its header before assuming which way that cuts.
- Ben's `Gamemaster` client is usually connected and **Bench held `isActiveGM`** in runs 16–21. A
  duplicate card with two GMs is not automatically a defect — **attribute by `userId` first.**
- Ben's campaign combat `BerbNeuXp4iKduef` is live at **round 1**, turn `null`, on the active
  `Playtest Map` (**52 tokens, 117 walls, 87 world actors** — run 21 ended exactly on those numbers).
  Read it, never modify it.
- `PlayerBench` (`yF9LHvfhB7otsHYY`) is passwordless and free; run 21 drove a full player-side
  walkthrough with **zero permission errors**. The `🎮 Player-client window` section is the batch to
  burn down whenever that client is up.
- Bench-folder fixtures carry accumulating residue. Ordinary — do not try to "fix" it.
- ⚠️ Ben's `Stonebound Captain` token still carries the run-19 `trigRound` key, and his
  `Stitchmother` / `Mutated Thrall (2)` tokens carry `bpHits` values of **unproven age** (run 21's
  snapshot gap). Not drift you caused; do not clean them.

## After this section

Once these six are done the remaining 🤖 concentrate in: `# Adversary ability wiring` (**12** — the 9
run 20 never reached plus the run-21 leftovers), `# BENCH — Engine-wide & cross-tree` (**7**), the
four bestiaries (**7** between them), the leyline sections (**11**), `# Heroic paths` (**3**),
`# Character-creation wizard v2` (**9**, of which 3 are ruling-gated and 4 are the fix-family above),
and `# BENCH — Order` (**1**).
