# Next bench session

> **Weekend marathon, run 3 (bench run 26, 2026-09-05) is done.** It cleared the **leyline scatter** and the
> **Engine-wide** section. **11 rows retired, 2 FAILs with root causes proven by mutation, 1 blocker named.**
> Open queue **69 🤖 → 58 🤖** (⚑ unchanged at **22** — no ⚑ row was touched). No `⛔ STOP`, **no pack rebuild
> owed**, world restored to its start snapshot exactly (id-diff clean over all 74 actors).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-05 — BENCH RUN 26` delta at the top** — every retirement with
its evidence, both FAILs with their proven root causes, the named blocker, and the world-hygiene diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 26"** — the timeout-keeps-running trap (it
manufactured a fake engine double-fire), `canvas.animatePan` never settling with the pane hidden, and the
resource-snapshot trap that re-inflates AE-derived maxes on restore. **Read run 25's and run 24's lessons
too** — the CRLF hash trap, the rate limiter, Investiture max 2, `item.use()` hanging on
`ItemConsumeDialog`, and the one-status ActiveEffect `_id` crash all still apply.

**→ `EDHA_RULINGS.md`** — unchanged by run 26; **no new ruling was raised** (run 26 found no judgment call
that needed one). R-43 is applied and changes live dice math.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED with
the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## 🎉 The per-tree `# BENCH —` block is now EXHAUSTED

This is the milestone run 26 reached, and it changes what the next run should be:

| Section | 🤖 left | Note |
|---|---|---|
| **Engine-wide & cross-tree** | **0** | Cleared. Its 3 remaining rows are all ⚑ Ben (2bAC-1 label legibility, 2bM-1 and the GM summon relay, both gated on a zero-GM window / ruling R-1). |
| White · Blue · Black · Red · Green | **3** | And **all three are blocked on a fix or a scene**, not on bench effort — see below. |
| All ten deity trees | **0** | |
| Heroic paths | **0** | Its 2 remaining rows are ⚑ Ben. |

The three survivors, and why none of them is worth a bench run right now:

- **White — "the other five restored adversary abilities"**: three of four PASS; the fourth
  (**Reeve-Owl / Sovereign of Solitude**) is dead because the BUILT PACK ships the item with zero rules
  while `data/adversaries.json` authors four. **Blocked on a build fix**, then a one-call re-run.
- **Green — "spot-checks"**: two of three PASS; **Spreading Roots** spends the Investiture and grows the
  Drawing but not the Region. **Blocked on the `edhaGrowTerrain` fix**, then a one-flow re-run.
- **Green — 2bS-11 Natural Order**: only the veil half is left and it is **structurally unreachable on the
  Playtest Map** (`darknessLevel 0` + `globalLight` on ⇒ nothing is ever unlit). Needs a bench-created
  scene; the fixture is otherwise identified (Stalker, pack id `l924euoyx3pYFk2T`).

## Hand these two FAILs to `test-pass-fixes` BEFORE the next bench run

Both have their root cause proven, not guessed, so they should be short fixes — and both unblock a
checklist row that a later bench run can then close in one call.

1. **`edhaGrowTerrain` mutates DataModel clones, so Spreading Roots never grows the Region.**
   `foundry.utils.deepClone(region.shapes)` returns `RectangleShapeData` **model instances**; mutating
   `r0.x/.width` does not touch `_source`, so `region.update({shapes})` diffs to nothing — while the Drawing
   update on the next line writes explicit numbers off the mutated live model, so the visual and the
   mechanics disagree. Proven by running both variants in the page: the engine's path left it at 600×600,
   `region.toObject().shapes` grew it to 1200×1200. **Audit the family** — the circle branch has the same
   latent bug.
2. **Reeve-Owl / Sovereign of Solitude builds with `system.events === {}`** while the repo authors four
   rules. Not a stale pack: 6 of 6 sibling items on the same actor built correctly, and five other
   adversaries match their authored counts item-for-item. `statusExpire: "target"` on the Immobilized rule is
   the first suspect for a validation drop that takes the whole `events` object with it — **a lead, not a
   finding.**

## Run 4 — the plan, in order

### 1. `# Adversary ability wiring` — **12 🤖**, and it is the best block left
One theme, and run 26 measured this exact flow as the fastest thing on the bench: import fresh from
`edha-content.edha-adversaries` into the bench folder → raise `foc`/`inv` maxes and values → target a bench
PC's token → `item.use()` → read the card. Four abilities went from cold to recorded in four calls that way.
**Assert the compendium document's `system.events` count against `data/adversaries.json` as you go** — run 26
found one item silently shipping zero rules, and that check costs nothing while you already have the pack open.

### 2. `# 🎮 Player-client window` — **3 🤖**, do them together
These need `PlayerBench` logged in (runbook §6, and run 13's recipe: join Bench in the seed tab first, then
`tabs_create` → `/join` → PlayerBench with a blank password; **resize the new tab and reload**, it opens 0×0).
Burn the whole section in one window rather than one row per run.

### 3. The bestiary tail — **7 🤖** across Goldenport (1), W29 (3), Vorsk (2), Ashkar (1)
Same import-and-use shape as block 1, so it batches naturally after it.

### 4. `# BENCH — hygiene campaign 2026-08-10` — **19 🤖**, but graded (unchanged from run 25's grading)
- **Drivable, just not reached (5):** R-65 **Magnum Opus** · **Pack Share** · **Venom Glands** · **Job 6b**
  (`edhaWriteStatusMark` relay regression) · pass 5.3 **resource spend/gain**.
- **Partly done, open half named on the row (4):** R-64 `victim` mode · R-64 CAE/owner-list · R-65 Set
  Charge/Detonate (**ally-heal** only) · R-59's eleven buttons (POSITIVE only).
- **Blocked or awkward (the rest):** Job 6a and R-62's audience rows need **zero GM clients**; R-63's
  unset-disposition row needs a token whose disposition cannot resolve; R-61's polarities and R-66's F5
  persistence are fiddly. ⚠️ **R-66's F5 half is now largely answered incidentally** — run 26 did a real F5
  and all three stamped cards came back disabled with their labels intact.

### 5. Not worth queuing until something changes
`# Character-creation wizard v2` (6 🤖), `# Items-dump tranche` (3), `# Adversary pack sync` (2) and
`# Bench-results fixes` (3) all carry deploy-state language from July. **Check DEPLOY STATE and re-read each
row against the live pack before driving any of them** — several may already be answered or may be
blocked-on-deploy.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients** connected; the bench joins
  as a GM and Ben's `Gamemaster` client was up all through run 26. Record BLOCKED with the blocker named —
  never re-file as ⚑.
- **Nothing on the Playtest Map can ever be unlit** (`environment.darknessLevel === 0`,
  `environment.globalLight.enabled === true`), so every `edha-dark-veil` row is unreachable there. A
  bench-created scene is the drivable shape; changing Ben's scene config is not.
- **`edhaIsFastTurn` / anything reading `game.combat`** resolves to Ben's live campaign combat. **Never
  activate a bench combat.** Ben's combat still has **zero combatants**, so `edhaCombatEndGuard` is EMPTY and
  a bench combat delete sweeps world-wide — run 26 relied on exactly that (it is how 2bS-11's combat-end
  clear was driven) and restored the three Covenant effects it ate from whole-object snapshots.
- **Observer/rAF-dependent rows are unverifiable on this bench** (run 22), and **`canvas.animatePan` never
  settles** with the pane hidden (run 26) — use `canvas.pan()`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and declare
  it. Run 26 used it for four separate pickers with no trouble.
- **Token movement can be refused SILENTLY** — `move()`/`update({x,y})` returns without error. Causes seen:
  the engine's `edha-move-veto` (Dread Presence vs a Weakened creature), walls, and interpolated midpoints.
  **If the token is yours, delete it and re-create it at the destination** — one call, no diagnosis.

## Harness traps — each has already produced or nearly produced a false result

- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** It keeps running in the page and can fire a
  second copy of everything after the hang — run 26 read that as an engine double-fire for four calls. After
  any timeout, re-establish state and re-drive cleanly before recording anything.
- **Verify the deploy by HASH from BOTH sides, and NORMALISE CRLF.** `git hash-object` normalises; a raw
  hash of the served bytes does not (`25bd55fa…` vs `9575fba…`). Pair it with `decodedBodySize` on the
  original `<script>` entry to prove the page runs that code.
- **Snapshot `_source.system.resources`, not the derived object**, or a restore writes AE-derived values into
  `_source` and `prepareDerivedData` adds the AE contribution a second time. Also snapshot
  `flags.edha-content.tempHp` — Bench — White carries a pre-existing `{source:"Final Decree", value:7}`.
- **Snapshot whole effect OBJECTS, not names**, and recreate with `{keepId: true}` and the original `_id`.
  **Restore flags BEFORE effects** — a watcher-managed AE (Covenant's proximity effect) is removed again if
  its ledger is momentarily empty.
- **Foundry's socket rate limiter fails silently into your rows.** Space bulk writes ~400 ms apart; check
  `read_console_messages({onlyErrors:true})`; ~30 s clears it.
- **Bench PCs have Investiture max 2 and the max clamps at 4**; target fixtures start low. Raise the
  RECEIVING resource's max on any row whose assertion is "the change matches the roll".
- **`item.use()` never settles while `ItemConsumeDialog` is open** — fire it, then poll for
  `button[data-action="continue"]`. Same for `RollConfigurationDialog` → `button[data-action="submit"]`.
- **A one-status ActiveEffect with no `_id` THROWS** and aborts the whole create batch.
- **Read the notification log before writing FAIL** — "not enough uses left", "not enough actions", the
  consume decline and the rate limiter are all silent no-ops whose only evidence is a notification. Wrap
  `ui.notifications.info/warn/error` in a recorder at the start of the run.
- **Filter the standing UI apps out of your dialog probe**, and sample both AppV2 instances and
  `div.app.window-app`.
- **Chat log is `ol.chat-log` in v13**; card buttons are reachable as
  `document.querySelector('[data-message-id="…"] button.<class>')`.
- **Serve `scripts/bench-setup-console.js` over a throwaway `127.0.0.1:8099` and inject it as a classic
  `<script>`** rather than pasting 17 KB. Kill the server at the end.

## Standing lessons

- **Read the row's rule config out of `data/authored/*.json` before staging.** Two rows retired this run had
  been parked for a year on "needs an Opportunity, which cannot be forced" — in both the Opportunity is
  honour-system prompt text and the only real cost is a resource. One grep, two rows.
- **Pick the flow by its EVENT, not by its talent.** One Flame Surge detonation retired three rows.
- **When a row names adversary behaviour, grep `data/adversaries.json` for who can actually stage it** — and
  when nobody can, that is a result to report, not a row to re-queue.
- **Compare the COMPENDIUM document, not your imported copy, before blaming a build.**
- **Only claim what your own logs support, and label inferences as inferences.**
