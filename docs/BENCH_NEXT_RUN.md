# Next bench session

> **Bench run 43 (2026-09-07) took the queue to single digits.** Item 84's ENGINE-ONLY fix was
> confirmed live, and the two "no drivable shape" verdicts runs 25/29 left behind were both
> overturned by a staged clone. **10 rows retired on evidence, 3 annotated and left open with their
> blocker named, 2 defects filed with their blast radius counted, 2 new rulings.** Open 🤖 **20 → 10**;
> open ⚑ unchanged at **10**. End-of-run per-actor diff **EMPTY** across all 74 actors; **no deploy
> owed by this run.**

## Read this first

**→ `docs/handoff-changelog/2026-09.md`, the `2026-09-07 — BENCH RUN 43` delta** — every retirement
with its quoted evidence, both corrected root causes, and the world diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 43"** — **three of these change what you
do before you drive anything.** (1) **"No drivable shape" is a claim about the DATA** — copy the rule
onto a scratch talent, move its `event` to one that carries a victim, and the row becomes measurable.
(2) **`await item.rollDamage()` never resolves while the pane is hidden if the roll triggers an engine
move** — fire with `void` and pump CONCURRENTLY; pumping afterwards is too late because control never
returns. (3) **A repo file can be fetched INTO the Foundry page** over a throwaway CORS server on
`127.0.0.1:8099` (`Start-Process node …` from the PowerShell tool) — that is how the 349-line setup
script got into the console without being retyped. Also: `benchClickScene` needs a **pump between the
pointermove and the pointerdown**; `edha-place-hazard` places on the **current target's square**, so
release targets first; a renamed import keeps its **prototypeToken name**; and
`update({"flags.x.y": v}, {recursive:false})` **deletes the sibling keys**. **Runs 42, 41 and 40's
lessons still apply in full.**

**→ `EDHA_RULINGS.md`** — **two new, both blocking work: R-90** (should an adversary's
`edha-triggered-effect` card whisper to the GMs? item 88 is blocked on it) and **R-91** (does R-86
retire the R-62 audience row, or will Ben disconnect `Gamemaster` for one window?). R-86 still retires
every GM-less and two-GM row — do not re-open one.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED
with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ⛔ 0. STEP ZERO — verify the deploy by hash, then check the OWNED copies

Run 43's engine was **`0a677dade62f76ce3ac57509fc25fcfdc22c23b6ee7ff3e9846afb6687e69578`** (`main` @
`1c52cfd`). **Compute it yourself, from both sides**, before the first row:

```bash
tr -d '\r' < module-src/scripts/register-skills.js | sha256sum
curl -s "http://localhost:30000/modules/edha-content/scripts/register-skills.js?cb=$(date +%s)" | tr -d '\r' | sha256sum
```

Then, before benching any talent row, read the OWNED copy's rule fields — not the pack:

```js
Object.values(actor.items.getName("<talent>").system.events).map(r => r.handler.type)
```

`scripts/bench-setup-console.js` calls `edha.syncActorTalents` on all 16 bench PCs as part of its run,
so running the setup script IS step zero. **Never `edha.syncAllCharacters()` / `syncAllAdversaries()`** —
those rewrite Ben's own PCs and campaign adversaries. **Do NOT run `edha.fixPcTokens()`** for the same
reason.

## ⭐ 1. What is actually left — all ten open 🤖 rows, and only two are drivable today

| Block | 🤖 | State |
|---|---|---|
| **Item 10 batch 2** (I10b2-1…4) | 4 | ⛔ **BLOCKED — no sideless token can exist on this build.** Re-derived at runs 38 and 42. **Do not re-attempt.** See §3. |
| **77-1** (Mantle's unset-side clause) | 1 | ⛔ Same cause. Both aura directions PASS (run 42); only the unset-side clause is blocked. See §3. |
| **Adversary pack sync** (2 bulk rows) | 2 | ⛔ **BLOCKED ON BEN** — a *bulk* sync rewrites his campaign actors. The per-actor path is already proven (run 42). |
| **R-62 audience flips** | 1 | ⛔ **BLOCKED, exactly** — the world has only two GM users and both are necessarily connected during a bench run. **Waiting on R-91.** |
| **Predator's Due on-defeat** | 1 | ❌ Heal passes, whisper fails. **Waiting on item 88 / R-90**, then one re-drive. |
| **Unbreakable Line (b)** | 1 | ❌ No `use` rule ships on either block. **Waiting on item 89** (REBUILD + ⟳ Sync), then one re-drive. |

**So a run-44 bench has no queue of its own until a fix lands.** That is the honest read, and it is
what §2 is for.

## 2. What run 44 should actually do

**Do not open Foundry to burn ten rows — there are none to burn.** Pick one of these instead, in order:

1. **If item 88 (R-90) or item 89 has shipped**, this IS a bench run: re-drive **Predator's Due**
   (control the Alpha's token — `edhaResolveKiller` reads `canvas.tokens.controlled` — take a
   `character` to 0, read the card's `whisper` array) and/or **Unbreakable Line (b)** (use the item on
   both blocks and check a real contest-core test posts instead of an empty card). Both are single-row
   runs; do them together if both fixes are live.
2. **Otherwise, sweep the ⚑ column for mis-marked rows.** Ten ⚑ rows remain and the marker split
   (2026-07-27w) has been re-litigated twice since some of them were written. Any row that asks for a
   *measurement* rather than a *judgment* is a 🤖 an agent can drive today. This is cheap, needs no
   table, and has found work every time it was done.
3. **Otherwise, tell the PM the bench queue is drained** and let the compute go to the fix lanes. A
   bench run with nothing to measure is not a bench run.

## 3. Known blockers — do not fight these

- ⭐ **No sideless token can exist on this build.** `disposition: null` at create, and `null` /
  `undefined` / `NaN` at update, all read back **−1 (HOSTILE)**; `prototypeToken.disposition` does the
  same. The fallback ("an actor with no token") discriminates nothing, because such an actor is in no
  range sweep. That blocks **I10b2-1…4** and **77-1's** unset-side clause.
  `tests/disposition-failclosed.test.js` is the proof that holds without a table. **Runs 38 and 42
  both re-derived this independently — a third re-derivation is not a good use of a run.** Run 43's
  view, offered to the PM rather than acted on: these five clauses are **harness-only** and should be
  retired as such, with the repo-side test standing as the record. **Ben's call, not a bench run's.**
  ✅ **Done by item 90 (2026-09-07, PR #282)** — all five retired in `EDHA_FOUNDRY_TEST_CHECKLIST.md`.
- **The two `# Adversary pack sync` bulk rows need BEN**, not a bench run.
- **R-62 needs Ben to disconnect `Gamemaster` for one window**, or R-91 answered (a).
- **`edhaLootTryOpen` refuses a GM by design** — but 34b is now RETIRED, driven from `PlayerBench`.
- **Four ORPHAN tokens on the Playtest Map are NOT the bench's** — `The Forgemaster`, `The Demolisher`,
  `PC Tester`, `Cragdrake Whelp Pack (1)`. Zero bench orphans at runs 42 and 43.
- ℹ️ **The Playtest Map carries ONE pre-existing Region** (`riEaXCZAKeUgN8dU`, name "Region", no
  `edha-content` flags, shape at 5381,6038). It is not the bench's; leave it. Any *other* Region you
  see is yours and must be gone by the end of the run.
- ℹ️ **A second scene `Playtest Map (Copy)` exists** (30 tokens, 2 drawings, id `lHKcasWQgVezqdzf`).
  Not the bench's — but `getActiveTokens()` can reach across scenes when resolving a token.
- **Observer/rAF-dependent state is stale on this bench** — `canvas.perception.update(...)` plus a
  ticker pump before reading `isVisible`.

## 4. Harness traps — each has already produced or nearly produced a false result

- ⭐ **A hidden pane means animated token moves never commit — AND an `await` on a roll that triggers
  one never returns.** Pump the ticker, concurrently. (Runs 42, 43.)
- ⭐ **A hidden tab throttles `setTimeout`**, so a 50 ms-step pump runs ~20× its nominal time. (43.)
- ⭐ **Two tokens of one actor make an engine result unreadable, not merely ambiguous.** (42.)
- ⭐ **A stale OWNED talent copy fails a row the pack already fixed** — read the rule field, then
  `edha.syncActorTalents(actor)` on bench PCs. (42.)
- **`update({"flags.a.b": v}, {recursive: false})` deletes the sibling keys; `setFlag` cannot delete
  one either — use `{"flags.a.b.-=key": null}`.** (43.)
- **`item.update({"system.events": obj})` is a no-op for handler fields — use the dotted path**, and
  read the real rule KEYS first (a clone keeps the source's keys). (43.)
- **Release `game.user.targets` before any click-to-place row** — `edha-place-hazard` uses the target's
  square. (43.)
- **A renamed import keeps its prototypeToken name.** Resolve by id. (43.)
- **An adversary dummy is not an "enemy" of an adversary** — pick the victim by disposition. (42.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire, then read next call. (26–43.)
- **Read the card's own `.dice-formula` NODE, never `msg.rolls[0].formula`**, and sample again ~2 s
  later. (41, 42.)
- **`game.messages.contents.slice(-1)` lies** whenever a cue or belief card lands after the roll —
  snapshot the id set before the take and diff it. (42.)
- **A watch that "does nothing" may be refusing your victim's actor TYPE** (`defeat` is
  `character`-gated). (41.)
- **An UNLINKED token's actor is not the base actor** — stage and assert through
  `scene.tokens.get(id).actor`. (41.)
- **`refreshDefBuffs()` will TIDY a pre-existing aura effect you did not create.** Snapshot effect
  NAMES, and know that a name alone cannot rebuild one. (42.)
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (28.)
- **A raw HP `update()` fires no damage-cadence rule** — use `actor.applyDamage(...)`. And
  `item.rollDamage({})` posts a message with **no** apply-damage buttons. (34, 42, 43.)
- **`combat.nextRound()` leaves `turn: null`** — set it with `combat.update({turn: n})`. (41.)
- **Verify the deploy by HASH from BOTH sides.** Run 43's was `0a677dade62f…`.

## 5. Standing lessons

- **Stage each row off the previous row's residue.** Run 43 got R-64's seven-talent corroboration free
  out of one Feinting Strike hit it had staged for something else.
- **Ask which EVENT would make an "unreachable" handler reachable, then clone the rule onto it.** (43.)
- **When a row's NEG is unrunnable with shipped data, CLONE the shipped item and edit the field.**
  (39, 41, 42, 43.)
- **Refuse to inherit the previous run's blocker — re-derive it.** Run 43 re-derived R-62's blocker to
  an exact count of GM users, which is what turned it into an answerable ruling.
- **Correct the previous run's root cause when the evidence says so, and say that you did.** Run 43
  overturned run 16's `edhaWhisperIds` diagnosis and run 29's sweep count.
- **Read the cards you did not come for.** Runs 31–43 each found something that way.
- **Only claim what your own logs support, and label inferences as inferences.**
