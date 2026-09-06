# Next bench session

> **Weekend marathon, run 6 (bench run 29, 2026-09-05) is done.** It **proved the three bestiary
> `Unstoppable` canvas halves** and, in doing so, **retracted run 28's root cause** — the blocker was never
> the 2×2 footprint, it was the hidden pane's dead `requestAnimationFrame`. It also closed **both** remaining
> **R-65** rows (each with a corrected subject) and **settled both open R-64 halves permanently** from a data
> sweep rather than another staging attempt. **5 rows left the checklist, 2 more halves closed on rows that
> stay open, 0 engine defects were found.** Open queue **35 🤖 → 31 🤖** (⚑ unchanged at **22** — no ⚑ row was
> touched). No `⛔ STOP`, **no pack rebuild owed**, world restored to its start snapshot **exactly** (field-level
> id-diff empty across all 74 actors, 33 tokens, and both scenes).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-05 — BENCH RUN 29` delta at the top** — the Unstoppable
retraction with its isolating experiment, both R-65 subject corrections, the R-64 sweep, and the world diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 29"** — **the hidden-pane rAF stall is the most
important thing in this file right now**: every *animated* token move silently no-ops, `await doc.update(...)`
still resolves, and a 1×1 fails exactly like a 2×2. Use `animate: false` for staging, or pump
`canvas.app.ticker.update()` in a tight `setTimeout(…, 0)` loop (a `setInterval` is clamped to ~1 Hz in a hidden
page). Also: a whole-object `{recursive: false}` resource restore **does not round-trip** — restore with dotted
paths. **Read runs 27 and 28's lessons too** — the `edha-deal-damage` → `rollDamage()` split, the rule's `event`
field deciding the driver, `toggleStatusEffect` for staging statuses, the crossed `createEmbeddedDocuments` map,
the once-per-round `edha-gm-cue` budget, and the timeout-keeps-running trap all still apply.

**→ `EDHA_RULINGS.md`** — unchanged this run (no new rulings; nothing in run 29 needed Ben's judgment).
**R-69 is VERIFIED GREEN and still ready to move to §K.** R-70 and R-71 still carry their recommended defaults.
R-43 is still applied and still changes live dice math.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED with the
blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## Where the 31 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **Character-creation wizard v2** | 6 | July deploy-state language — re-read against DEPLOY STATE and the live pack first. |
| **pass 5.2** (R-63, Job 6a/6b) | 4 | 1 drivable now (R-63 same-side), 1 needs zero GM clients, 2 need a non-owner client. **Both R-64 rows are now settled** — do not re-queue them. |
| **Bench-results fixes** · **Items-dump** · **Adversary pack sync** | 3 · 3 · 2 | Same July language; check the live pack before driving. |
| **R-65 folded roll formulas** | 2 | **Magnum Opus** (Civilization) and **Pack Share** (Knowledge) — the last two. |
| **pass 5.3** | 2 | R-61's legacy `detonateUsed` (informational only) + R-62's audience flips (zero-GM / second client). |
| Scattered singles (Green, Cinderbrock, Crownox, Brandram's Reckless Advance, manual re-litigation) | 9 | Each needs its own staging. |

## Run 7 — the plan, in order

### 1. **The player-client window — open it ONCE and burn everything that needs it (highest value left)**
Three separate blocks are all waiting on the same one-time setup, and **no run in this marathon has opened it**:
**Job 6b** (pass 5.2 — the GM-**relay** path a non-owner takes; a GM's `actor.isOwner` is always true, so it is
unreachable from `Bench`), **R-62's audience flips** (pass 5.3), and the `# 🎮 Player-client window` section.
Run 13's recipe, in `docs/EDHA_BENCH_RUNBOOK.md` §6: join `Bench` in the `seed` tab first, then `tabs_create` →
`/join` → **PlayerBench**, blank password. ⚠️ **The new tab opens 0×0 — `resize_window` AND then reload**, or its
canvas never initialises. Grant `PlayerBench` OWNER on **bench-folder actors only**, snapshot `ownership` first,
restore at the end, and **log BOTH clients out**. One PC per client is a staging step, not a detail.

### 2. **R-65's last two — Magnum Opus and Pack Share (2 🤖)**
The family is otherwise finished. **Magnum Opus** (Civilization) needs the Construct's transform HP bonus *and*
its splash damage; **Pack Share** (Knowledge) needs at least one ally to click their damage button. Budget them
separately — each wants its own tree, resources and tokens. Read each rule's `event` out of `data/authored/*.json`
**before** staging (run 28's lesson), and remember run 29's: if a row's named subject does not carry the branch,
grep for the handler that does and find who actually ships it.

### 3. **pass 5.2's R-63 same-side regression (1 🤖, drivable today)**
A regression check on the 12 migrated same-side sites and the 4 enemies-in-range filters: pick 2–3 of an aura
talent (`edha-buff-aura` with `affects: allies`/`enemies`), Reroll Reaction against a marked foe, a Fate snare
stepped on by an ally vs. an enemy, or Reveal Facts / Investiture-of-Command's enemies-in-range button. Ordinary
tokens with normal dispositions — confirm nothing changed. The *unset*-disposition sibling row is a repo-side pin
(`tests/disposition-failclosed.test.js`) unless you can find a token whose disposition genuinely cannot resolve.

### 4. **The four July sections — 14 🤖, and none should be driven cold**
`# Character-creation wizard v2` (6), `# Bench-results fixes` (3), `# Items-dump tranche` (3), `# Adversary pack
sync` (2) all carry deploy-state language from July. **Check DEPLOY STATE and re-read each row against the live
pack first** — several may already be answered by a later deploy (retire on that evidence), and finding one
blocked-on-deploy is cheaper than a staging attempt.

### 5. **The `edha-dark-veil` rows — build the scene (still not started)**
Nothing on the Playtest Map can ever be unlit, so Green 2bS-11's veil half and the Stalker veil auto-toggle are
structurally unreachable there. **A bench-CREATED scene with darkness — viewed, never activated — is the drivable
shape.** Runs 26–29 all deferred it. `Playtest Map (Copy)` has `globalLight.enabled === false` but it is **Ben's**;
create your own and delete it at the end.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**; the bench joins as a GM and Ben's
  `Gamemaster` client has been up through runs 24–29. Record BLOCKED with the blocker named — never re-file as ⚑.
- **Job 6b needs a NON-OWNER**, which a GM can never be. `PlayerBench`, or nothing.
- **Both R-64 halves are SETTLED, not blocked** (run 29). All 9 victim-mode rules — `edha-reveal` ×1 (Sharp Eye),
  `edha-owner-list` ×8 (Chaos ×7, Death ×1) — sit on `edha-test-success`, behind an H1 def-test that resolves its
  own target after the roll. **Do not re-queue them.** They reopen only if a talent ships either handler on an
  event that carries its own victim.
- **`game.combat` is the client's VIEWED combat** — an `active: false` bench combat plus `ui.combat.initialize({combat})`
  satisfies every "needs the active combat" row. **Never activate a bench combat.** Ben's combat still has zero
  combatants, so `edhaCombatEndGuard` is EMPTY and a bench combat delete sweeps world-wide — runs 28 and 29 both
  relied on that and restored cleanly from whole-object snapshots.
- **Observer/rAF-dependent rows are unverifiable on this bench** (run 22), `canvas.animatePan` never settles
  (run 26), and **animated token moves never commit** (run 29) — use `canvas.pan()` and `animate: false`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and declare it.
  The run-23/25 placement recipe (shadow the getter, dispatch `pointerdown` on `#board`, snap to the square
  **centre**) placed a real Mending Aura burst in one call this run.
- **Three tokens on the Playtest Map are ORPHANS** (`Bench — Green`, `Bench — Heroic`, `Bench Target — Floater` —
  their `actorId` resolves to nothing; TODO item 37). **Create a fresh token from the bench actor instead**; never
  repair or delete the orphans, they are pre-existing.
- **TODO item 40 (the roster fix) does NOT need to add a `Mutation` item** — run 29 proved that gap was a name
  mismatch (`Adaptive Mutation`, already present on `Bench — Life`).

## Harness traps — each has already produced or nearly produced a false result

- **An ANIMATED token move is a silent no-op with the pane hidden, and it fooled a whole run.** `await
  doc.update({x,y}, {animate: true})` **resolves** with the token unmoved. Re-issue with `animate: false` before
  concluding anything. (Run 29 — this replaces run 28's 2×2-footprint advice, which was wrong.)
- **Restore `_source` resources with DOTTED PATHS.** A whole-object `{recursive: false}` write silently left
  `inv.max.override` at 2 instead of 4 on three actors (run 29).
- **Read the rule's `event` field, not just its handler config** (run 28's Beacon lesson).
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect` (the CONFIG `_id` match).
- **`edha-deal-damage` → `item.rollDamage()`. `edha-on-hit` / `edha-gm-cue` / `edha-thorns` → `applyDamage(list,
  {edhaSource, originatingItem})`. `edha-damage-rider` → `rollDamage()`.** Wrong driver = a manufactured dead rule.
- **`createEmbeddedDocuments` does not return documents in input order** — Tokens (run 27) *and* Combatants
  (run 28). Build `{actorId, tokenId}` pairs explicitly and read the result back **by name**.
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Run 29 hit three, all with the work already done.
  **Fire the driver in one call and read the result in the next** — never await an animation in the call that
  starts it. Read world state before re-driving.
- **Persist your snapshot to `sessionStorage` before any row that reloads the page** (R-66's F5).
- **Verify the deploy by HASH from BOTH sides.** The served file is LF-only now that `.gitattributes` has landed,
  so raw and normalised hashes agree — keep normalising anyway, and keep pairing it with `decodedBodySize` on the
  original `<script>` entry.
- **Snapshot whole effect OBJECTS and recreate with `{keepId: true}`; restore flags BEFORE effects.**
- **Foundry's socket rate limiter fails silently into your rows.** Space bulk writes ~400 ms apart.
- **`item.use()` never settles while `ItemConsumeDialog` is open** — fire it, then poll for
  `button[data-action="continue"]`, and **read the dialog before clicking it**.
- **Read the notification log before writing FAIL.** "not enough uses left", "not enough actions", the consume
  decline, a pre-cost veto and the rate limiter are all silent no-ops whose only evidence is a notification.
  Wrap `ui.notifications.info/warn/error` in a recorder at the start of the run.

## Standing lessons

- **Refuse to inherit the previous run's blocker — re-derive it.** Run 29's whole yield came from this: three
  rows parked on a footprint theory turned out to be one hidden-pane animation bug, and two rows parked on
  "structurally hard" were settled permanently by a single data sweep.
- **Take the re-test block FIRST, every run.** Four runs running, re-tests measure roughly twice as dense as
  scattered rows, because they share one subject and one actor.
- **Pick the flow by its EVENT, not by its talent.** One heal fired three talents' cards in run 28; one Flame
  Surge detonation retired three rows in run 26.
- **Read the row's rule config out of `data/authored/*.json` before staging** — and now also its `event`, and
  now also **whether the row's named talent is the one that actually carries the branch** (run 29: two rows in
  a row had the wrong subject).
- **A row's own break/staging recipe can be wrong.** Verify it against the source before concluding anything
  from it failing.
- **Only claim what your own logs support, and label inferences as inferences.**
