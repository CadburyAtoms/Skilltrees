# Next bench session

> **Weekend marathon, run 2 (bench run 25, 2026-09-05) is done.** It re-tested **fix pass 1** and then
> continued the **2026-08-10 hygiene campaign**. **11 rows retired, 4 partials, 1 new row, 1 new ruling
> (R-69).** Open queue **79 🤖 → 69 🤖** (⚑ unchanged at **22** — no ⚑ row was touched). No `⛔ STOP`,
> **no pack rebuild owed**, world restored to its start snapshot exactly (id-diff clean).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-05 — BENCH RUN 25` delta at the top** — every retirement
with its evidence, the four partials with the exact half still open, and the world-hygiene diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 25"** — the CRLF hash trap, the two
SILENT causes of a refused token move (the engine's own Dread Presence veto, and walls), serving the
setup script over HTTP instead of pasting it, and why resource clamps make a correct roll look broken.
**Read run 24's lessons too** — the rate limiter, Investiture max 2, `item.use()` hanging on
`ItemConsumeDialog`, and the one-status ActiveEffect `_id` crash all still apply.

**→ `EDHA_RULINGS.md`** — R-1, R-2, R-4 answered 2026-09-05; R-43 is applied and changes live dice
math; **R-69 is new** (a cancelled picker still burns the once-per-scene stamp).

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it
BLOCKED with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a
new ⚑ row.**

## Run 3 — the leyline scatter, then Engine-wide (the PM's plan, and it is now the right one)

Hygiene was the big block and it is no longer the biggest *per-row* value: what remains there is mostly
rows that need a second client, a GM-free window, or a staging shape this bench cannot make (see
"What is left of hygiene"). The leyline scatter is 12 rows of ordinary talent mechanics on a roster
that is already built and warm.

| Section | 🤖 | Note |
|---|---|---|
| Green (leyline) | 4 | Turn boundaries are drivable — `Combat.create({active:false})` + `combat.update({round,turn})` fires `combatTurnChange` with the bench combat (run 23). **Opportunity**-gated rows are the awkward ones. |
| White (leyline) | 3 | |
| Blue (leyline) | 2 | |
| Red (leyline) | 1 | |
| Order (deity) | 1 | |
| Heroic paths | 1 | |
| **leyline scatter total** | **12** | |
| Engine-wide & cross-tree | 2 | Run these FIRST if you touch them at all — **2bA-7** (edit round-trip) gates everything. One of the two is the `Flame Surge / burst cards` F5 row, which the hygiene **R-66** row settles at the same time. |

**The roster is built and idempotent.** Run 25 re-ran `scripts/bench-setup-console.js` as a real step:
**zero ⚠ lines, zero errors, zero actors created** — 16 PCs + 7 fixtures, each PC carrying its whole
tree (leylines 25 talents, deities 9, Heroic 62), and the ranged-weapon fixture is real
(`Shortbow`, `system.attack.type === "ranged"` — assert it, don't trust the summary).
**5 tokens are placed** on the Playtest Map around (2700–3000, 4500–5100): `Bench — Red`,
`Bench — White`, `Bench — Order`, `Bench Target — Adjacent A`, `Bench Target — Adjacent B`. Three
**orphan** `Bench — *` tokens from the previous marathon are still there (their actors were deleted;
`tok.actor` is null so the engine skips them) — leave them.

⚠️ **Give every PC you drive Investiture and HP before you touch a row**, and raise the receiving
resource's max on any row that asserts "the change matches the roll".

## What is left of hygiene — 19 🤖, and they are NOT all cheap

Run 25 took the eight cheapest. What remains, honestly graded:

- **Drivable, just not reached (5):** R-65's **Magnum Opus** (Civ — needs a Combat Construct summoned
  and transformed), **Pack Share** (Knowledge — needs an ally to click a shared-strike button),
  **Venom Glands** (an adversary bespoke ability), **Job 6b** (`edhaWriteStatusMark` relay regression),
  and pass 5.3's **resource spend/gain** regression. These are the next hygiene rows worth doing.
- **Partly done, with the open half named on the row (4):** R-64 `victim` mode (`edha-reveal` only),
  R-64 CAE/owner-list (an H3 `target: victim` placement only), R-65 Set Charge/Detonate (the
  **ally-heal** `b.heal` configuration only), R-59's eleven buttons (the POSITIVE only — break one
  deliberately).
- **Blocked or awkward (the rest):** Job 6a and R-62's audience rows need **zero GM clients**;
  R-63's unset-disposition row needs a token whose disposition genuinely cannot resolve; R-61's
  remaining polarities and R-66's F5 persistence are doable but fiddly.

**The `edha-reveal` and H3-owner-list halves may not be drivable at all from one client** — every
`target: victim` rule on `edha-test-success` sits behind an H1 def-test that resolves its own target
*after* the roll, so the payload's creature and the canvas selection can never be made to differ. If a
future run confirms that, those halves should be recorded BLOCKED with that blocker named rather than
chased again. The drivable shape is an event that carries its own victim: `edha-on-hit` (drive it with
`actor.applyDamage(list, {edhaSource, originatingItem})`) or an `edha-watch` rule whose `payloadTarget`
is the watched actor.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients** connected; the bench
  joins as a GM and Ben's `Gamemaster` client was up all through run 25. Record BLOCKED with the
  blocker named — never re-file as ⚑.
- **`edhaIsFastTurn` / anything reading `game.combat`** resolves to Ben's live campaign combat. **Never
  activate a bench combat.** Ben's combat still has **zero combatants**, so `edhaCombatEndGuard` is
  EMPTY and a bench combat delete sweeps world-wide. Run 25 relied on exactly that and restored
  everything — but check `game.combats.get(...).combatants.size` before assuming the guard shields
  anything.
- **Observer/rAF-dependent rows are unverifiable on this bench** (run 22). Prove the mechanism by hand
  and record BLOCKED, not FAILED.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter
  (run 23's technique; run 25 used it to place a real Snare and a real Set Charge) and declare it.
- **Token movement can be refused SILENTLY** — `move()` returns `false` with no error. Two causes, both
  real: the engine's **`edha-move-veto`** (a Weakened creature cannot willingly approach a Dread
  Presence bearer, and the map has several), and **walls** (a move can land at an interpolated midpoint
  and stop). `game.paused` is **not** a gate — that was tested and it is not. Record notifications and
  test collisions before planning a row around a move.

## Harness traps — each has already produced or nearly produced a false result

- **Verify the deploy by HASH from BOTH sides, and NORMALISE CRLF.** The installed file is CRLF;
  `git hash-object` normalises it, a raw hash of the served bytes does not (`25bd55fa…` vs
  `9575fba…`). Strip the CR before each LF, then compare `decodedBodySize` of the original `<script>`
  entry against your cache-busted fetch to prove the page runs that code.
- **Foundry's socket rate limiter fails silently into your rows** (run 24). Space bulk writes ~400 ms
  apart; check `read_console_messages({onlyErrors:true})`; ~30 s clears it.
- **Bench PCs have Investiture max 2, target fixtures start at 0 HP** (run 24), and **resource maxes
  clamp** (run 25 — Galvanize rolled 6 and granted 4 because focus max was 4).
- **`item.use()` never settles while `ItemConsumeDialog` is open** (run 24) — fire and poll for
  `button[data-action="continue"]`.
- **A one-status ActiveEffect with no `_id` THROWS** and aborts the whole create batch (run 24).
- **"Cannot consume, not enough uses left"** is another silent no-op class (run 25 — limited-use heroic
  talents). Wrap `ui.notifications.info/warn/error` in a recorder at the start of the run; it is often
  the only evidence.
- **Filter the standing UI apps out of your dialog probe** — `foundry.applications.instances` holds
  ~20 permanent AppV2s and an unfiltered dump buries the one `DialogV2` you want. Sample both AppV2
  instances and `div.app.window-app`.
- **Verify a gate is OPEN before treating silence as evidence** (run 19).
- **Bench PC tokens may already exist** — duplicates made the engine measure range from a token 121 ft
  away (run 20). Resolve tokens by **id or actorId**, never by name.
- **Read `movement.walk.rate.value`, not `.override`**; same family as `system.deflect.value`.
- **Snapshot whole effect OBJECTS, not names** (run 25 restored three pre-existing Covenant effects the
  combat-end sweeps legitimately ate, by recreating them with `{keepId:true}` and their original
  `_id`s). Restore flags by deleting the whole `flags.edha-content` namespace and rewriting the
  snapshot object — never patch a sub-path. **Persist the snapshot to `localStorage`** if any row needs
  an F5.
- In the **built** pack, `system.events` is an OBJECT keyed by rule id with the type at
  `rule.handler.type`; but the combat-timing dispatcher filters on `rule.event`. **Read the consuming
  code before writing the scan.**
- **Delete bench combats LAST** — a `deleteCombat` sweep is unscoped and will clear ledgers you still
  need.
- Chat log is `ol.chat-log` in v13.

## Standing lessons

- **Verify the root cause in code before touching anything**, and **check your own harness before
  reporting a defect.** Run 25 spent four calls on a "broken" token move that was the engine's own
  Dread Presence veto, armed by a Weakened status the run had applied itself two rows earlier.
- **A re-test without its negative control is not a re-test.** Fix pass 1's Apex Form row is only
  decisive because deleting combat A *left B's actor alone* and deleting B *then* paid it out.
- **One flow can retire several halves.** Order's whole remaining R-65 set came off ONE Verdict against
  a Sealed Edict. Read the payload chain before staging three tests.
- **Prefer the family whose failure mode is "silently contributes 0"** — Lifeline's heal-back die was
  worth more than another damage row.
- **Only claim what your own logs support, and label inferences as inferences.**
