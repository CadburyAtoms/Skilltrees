# Next bench session

> **Weekend marathon, run 5 (bench run 28, 2026-09-05) is done.** It verified **item 36's R-69 fix**
> green on all four legs, **settled** the two-`consume` question run 27 filed, cleared **all three**
> long-deployed fix-pass-F re-tests, and closed **six** hygiene rows. **12 rows left the checklist
> (11 retired on evidence + 1 relocated to `EDHA_RULINGS.md`), 0 engine defects were found**, and the
> three bestiary **`Unstoppable`** rows lost **both** of their historic blockers. Open queue
> **47 🤖 → 35 🤖** (⚑ unchanged at **22** — no ⚑ row was touched). No `⛔ STOP`, **no pack rebuild
> owed**, world restored to its start snapshot **exactly** (id-diff clean across 74 actors, 33 tokens
> and every scene collection — flags, whole effect objects and `_source.system.resources` all re-diffed
> to zero).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-05 — BENCH RUN 28` delta at the top** — every retirement
with its evidence, the two row-text corrections, the three unblocked bestiary rows, and the world diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 28"** — read the rule's **`event`** field
before staging; stage statuses with `toggleStatusEffect`, never `createEmbeddedDocuments`; validate a
movement lane with the token's **footprint**, not a centre ray; `edha-deal-damage` needs `rollDamage()`
while `edha-on-hit` needs `applyDamage`. **Read run 27's and run 26's lessons too** — the crossed
`createEmbeddedDocuments` map, the once-per-round `edha-gm-cue` budget, the timeout-keeps-running trap,
`canvas.animatePan` never settling, and the `_source`-resources snapshot rule all still apply.

**→ `EDHA_RULINGS.md`** — **two new rulings this run**, both filed instead of being left as test rows:
**R-70** (a two-resource activation only charges the first unless the second box is ticked — the cause
is one line in the *system's* own dialog; recommended default: leave it alone) and **R-71** (the
system's item-damage card prints the unfolded parenthetical formula; recommended default: fold it at
build time). **R-69 is now marked VERIFIED GREEN and is ready to move to §K.** R-43 is still applied
and still changes live dice math.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED
with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new
⚑ row** — run 28 moved one row out of the checklist for exactly this reason, and it is worth doing
again whenever a row asks Ben to *decide* rather than an agent to *test*.

## Where the 35 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **Bestiary `Unstoppable` ×3** (Brandram, Cragdrake Alpha, Slagbull) | **3** | **The best block left.** Rule PROVEN live; only the canvas half is open, and the blocker is now the harness, not the engine. |
| **R-65 folded roll formulas** | **4** | Set Charge ally-heal half · Magnum Opus · Pack Share · Venom Glands (subject corrected — see below). |
| **pass 5.2** (R-63/R-64, Job 6a/6b) | **6** | 2 structurally hard, 1 needs zero GM clients, 1 needs a non-owner client, 2 drivable. |
| **Character-creation wizard v2** | 6 | July deploy-state language — re-read against DEPLOY STATE first. |
| **Bench-results fixes** · **Items-dump** · **Adversary pack sync** | 3 · 3 · 2 | Same: July language, check the live pack before driving. |
| **pass 5.3** | 2 | R-61's legacy `detonateUsed` (informational only) + R-62's audience flips (zero-GM). |
| Scattered singles (Green, Cinderbrock, Crownox, manual re-litigation) | 6 | Each needs its own staging. |

## Run 6 — the plan, in order

### 1. The three `Unstoppable` rows — **3 🤖, one driver, and they are 90% done**
Run 28 fired the rule for the first time in the project's history and left only the canvas half open.
Everything you need is on each row. The recipe:
`Combat.create({scene, active: false})` → a combatant **built as an explicit `{actorId, tokenId}` pair**
→ `ui.combat.initialize({combat})` → `combat.update({round: 1, turn: 0})` (`edhaCombatantOf` needs
`combat.started`, which is derived) → `combatant.setFlag("cosmere-rpg", "turnSpeed", "fast")` → control
the dealer, target the victim, **`item.rollDamage()`** (NOT `applyDamage` — that fires `edha-on-hit`
and nothing else). Expect *"💨 Unstoppable — … moves 20 ft toward …, ignoring Reactions"* and
`flags.edha-content.oncePerTurn.Unstoppable`.
⚠️ **The one thing to do differently:** all three bearers are **2×2 (600 px) tokens** and run 28's
staging position would not let them move by *any* route (`edhaApplyMove`, `update({x,y})`,
`update(…, {teleport:true})`, `move(…, {action:"displace"})` — all silent no-ops) because the lane had
been validated with a **centre ray**. **Validate the four corners of the footprint along the path, or
stage the row with a 1×1 dealer.** `oncePerTurn` also means one move per turn — step the round between
attempts, and use the second attempt in the same turn as a free negative control.

### 2. `# BENCH — hygiene campaign`'s **R-65 remainder — 4 🤖**
- **Venom Glands — the row's SUBJECT was corrected by run 28, read it before staging.** There is no
  adversary venom roll: `data/adversaries.json` declares the Stitchmother/Mutated-Thrall grafts
  `GM-run — NO NAMEABLE HOOK`. The rolled one is the **Life `Mutation`** adaptation; the assertion is
  that clicking *Venom Glands* on the chooser bakes a real rolled integer into
  `flags["edha-content"].mutation.venom`. ⚠️ **`Bench — Life` carries no `Mutation` item** — grant the
  fixture first (and consider fixing it in `bench-setup-console.js`).
- **Set Charge / Detonate's ally-HEAL half** — the damage and DC-save branches are proven (run 25);
  only a heal-configured Detonate is left. Run 25's Snare/Set-Charge placement recipe (pin
  `canvas.mousePosition`, dispatch `pointerdown` on `#board`, snap to the square **centre**) works.
- **Magnum Opus** (Civilization: transform HP bonus + splash) and **Pack Share** (Knowledge) — each
  needs its own tree and resources. Budget them separately.

### 3. `pass 5.2` — **6 🤖, but graded, and two of them are traps**
- **Drivable (2):** R-63's same-side regression check (auras / Reroll Reaction / a Fate snare with a
  normal-disposition token) and Job 6b **only if** a player client is up (see below).
- **Structurally hard (2):** both open R-64 halves (`edha-reveal {target: victim}` and an H3
  `edha-owner-list {target: victim}`) sit behind an H1 def-test that resolves its own target **after**
  the roll, so the payload's creature and the canvas selection **cannot be made to differ** on this
  harness. Run 25 established this and run 28 did not find a way around it. The drivable shape would be
  a rule whose event carries its own victim — if none exists, that is a result to report, not a row to
  re-queue forever.
- **Job 6a — BLOCKED (zero GM clients).** Unchanged.
- ⚠️ **Job 6b cannot be driven from a GM client at all.** Its whole subject is the GM-**relay** path
  taken when a **non-owner** marks a creature they do not own; a GM's `actor.isOwner` is always true, so
  the relay branch is unreachable from `Bench`. It needs `PlayerBench` logged in (runbook §6).

### 4. The player-client window — open it once and burn everything that needs it
`# 🎮 Player-client window` is down to **1 row and it is ⚑**, but **Job 6b** and **R-62's audience
flips** both need a second client, so the window is still worth opening. Run 13's recipe: join `Bench`
in the `seed` tab first, then `tabs_create` → `/join` → **PlayerBench** with a blank password;
**resize the new tab and reload**, it opens 0×0. Grant `PlayerBench` OWNER on bench-folder actors only,
snapshot `ownership` first, restore at the end, and **log BOTH clients out**.

### 5. The four July sections — **14 🤖, and none of them should be driven cold**
`# Character-creation wizard v2` (6), `# Bench-results fixes` (3), `# Items-dump tranche` (3),
`# Adversary pack sync` (2) all carry deploy-state language from July. **Check DEPLOY STATE and re-read
each row against the live pack before driving any of them** — several may already be answered, and one
of them being blocked-on-deploy is a cheaper finding than a staging attempt.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients** connected; the bench
  joins as a GM and Ben's `Gamemaster` client was up all through runs 24–28. Record BLOCKED with the
  blocker named — never re-file as ⚑.
- **Job 6b needs a NON-OWNER**, which a GM can never be. `PlayerBench`, or nothing.
- **Nothing on the Playtest Map can ever be unlit** (`environment.darknessLevel === 0`,
  `environment.globalLight.enabled === true`), so every `edha-dark-veil` row (Green 2bS-11's veil half,
  the Stalker veil auto-toggle) is unreachable there. **A bench-CREATED scene with darkness — viewed,
  never activated — is the drivable shape**, and run 28 did not get to it. There is also a second scene
  in the world, `Playtest Map (Copy)`, with `globalLight.enabled === false`; it is **Ben's**, so create
  your own rather than reconfiguring it.
- **`game.combat` is the client's VIEWED combat** — an `active: false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row, and Ben's combat is
  never touched. **Never activate a bench combat.** Ben's combat still has **zero combatants**, so
  `edhaCombatEndGuard` is EMPTY and a bench combat delete sweeps world-wide — run 28 relied on exactly
  that and restored cleanly from whole-object snapshots.
- **Observer/rAF-dependent rows are unverifiable on this bench** (run 22), and **`canvas.animatePan`
  never settles** with the pane hidden (run 26) — use `canvas.pan()`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and
  declare it.
- **Three tokens on the Playtest Map are ORPHANS** (`Bench — Green`, `Bench — Heroic`,
  `Bench Target — Floater` — their `actorId` resolves to nothing; TODO item 37). **Create a fresh token
  from the bench actor instead**; never repair or delete the orphans, they are pre-existing.
- **Token movement can be refused SILENTLY**, and run 28 added a new cause to the list: a **wide
  footprint** (2×2 = 600 px) clipping walls a centre-ray collision test does not see. The other known
  causes are the engine's `edha-move-veto` (Dread Presence vs a Weakened creature), plain walls, and
  interpolated midpoints. **If the token is yours, delete it and re-create it at the destination.**

## Harness traps — each has already produced or nearly produced a false result

- **Read the rule's `event` field, not just its handler config.** Beacon of Stability's handler says
  `trigger: "use"` but its rule's **event** is `edha-draw-mana`; `item.use()` spends the cost and posts
  nothing, which reads exactly like a dead talent.
- **Never stage a status with `createEmbeddedDocuments`.** The engine's sweeps clear via
  `toggleStatusEffect`, which matches the CONFIG status's fixed `_id` — a hand-made effect survives
  every sweep while `a.statuses.has(st)` stays true, and it reads as a broken sweep.
- **`edha-deal-damage` → `item.rollDamage()`. `edha-on-hit` / `edha-gm-cue` / `edha-thorns` →
  `applyDamage(list, {edhaSource, originatingItem})`. `edha-damage-rider` → `rollDamage()`.** Wrong
  driver = a manufactured dead-rule reading.
- **`createEmbeddedDocuments` does not return documents in input order** — for Tokens (run 27) *and*
  Combatants (run 28). Build `{actorId, tokenId}` pairs explicitly and read the result back by name.
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Run 28 hit three, and in all three the
  useful work had already completed — **read the world state before re-driving**, then re-establish
  cleanly. Cap dialog-polling loops by wall clock, and budget ~6 s per `item.use()`.
- **Persist your snapshot to `sessionStorage` before any row that reloads the page** (R-66's F5). Page
  globals do not survive; ~52 KB of snapshot does.
- **Verify the deploy by HASH from BOTH sides.** As of run 28 the served file is **LF-only** (zero CR
  bytes) now that `.gitattributes` has landed, so a raw hash and a normalised hash agree — but keep
  normalising, and keep pairing it with `decodedBodySize` on the original `<script>` entry.
- **Snapshot `_source.system.resources`, not the derived object**; snapshot whole effect **objects**
  and recreate with `{keepId: true}`; **restore flags BEFORE effects**. Run 28 followed all three and
  got the first completely empty id-diff of the marathon.
- **Foundry's socket rate limiter fails silently into your rows.** Space bulk writes ~400 ms apart.
- **`item.use()` never settles while `ItemConsumeDialog` is open** — fire it, then poll for
  `button[data-action="continue"]`. **And read the dialog before clicking it** — that is how run 28
  settled the two-`consume` question.
- **Read the notification log before writing FAIL.** "not enough uses left", "not enough actions", the
  consume decline, a pre-cost veto and the rate limiter are all silent no-ops whose only evidence is a
  notification. Wrap `ui.notifications.info/warn/error` in a recorder at the start of the run.
- **Serve `scripts/bench-setup-console.js` over a throwaway `127.0.0.1:8099` and inject it as a classic
  `<script>`.** Kill the server at the end.

## Standing lessons

- **Take the re-test block FIRST, every run.** Three runs in a row have now measured re-tests as roughly
  twice as dense as scattered rows, because they share one subject and one actor.
- **Pick the flow by its EVENT, not by its talent.** One heal fired three talents' cards in run 28; one
  Flame Surge detonation retired three rows in run 26.
- **Read the row's rule config out of `data/authored/*.json` before staging** — and now also its
  `event`. Half the "blockers" in the checklist are stale cost notes or the wrong driver.
- **Re-read every row parked on an old blocker.** Run 27's `game.combat` correction and a fixed
  `edhaSpeedFt` between them unblocked three rows that had been dead since run 16.
- **A row's own break/staging recipe can be wrong.** Two rows this run described a break that cannot
  throw and a bench PC that does not own the talent. Verify the recipe against the source before
  concluding anything from it failing.
- **Only claim what your own logs support, and label inferences as inferences.**
