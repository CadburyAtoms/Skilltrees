# Next bench session

> **Bench run 42 (2026-09-07) drove the whole REBUILD stack the Saturday backlog had been waiting
> for** — items 34a / 34c / 55 / 56 / 57 / 58 / 63 / 67, live in the packs for the first time after
> Ben's morning `deploy-to-foundry.bat`. **38 rows retired on evidence, 8 annotated and left open with
> their blocker named, 1 root-caused defect (with its blast radius counted), 2 new rulings, 1 row-text
> correction**, plus Ben's own 13 dashboard marks recorded. Open 🤖 **58 → 20**; open ⚑ **21 → 10**.
> End-of-run per-actor diff **EMPTY** across all 74 actors; every count back to the start snapshot; no
> `⛔ STOP`; **no deploy owed by this run.**

## Read this first

**→ `docs/handoff-changelog/2026-09.md`, the `2026-09-07 — BENCH RUN 42` delta** — every retirement
with its quoted evidence, the defect's proof-by-mutation, and the deploy-state finding below.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 42"** — **two of these change what you
do before you drive anything.** (1) **A hidden pane freezes PIXI's ticker, so v13 animated token
movement never commits** — every engine slide reads as "the card says N ft and nothing moved" until you
pump `canvas.app.ticker.update()` after the take; run 42 chased a veto, a wall and grid-snapping before
measuring it. (2) **Never leave two tokens of the same actor on the scene** — a duplicate made a push
name a blocker 8,400 px away, which reads exactly like an engine bug. Also: **per-actor sync
(`edha.syncActorTalents` / `edha.syncAdversary`) is the licensed way to close a "REBUILD + ⟳ Sync"
gap**; **`edhaIsTalent` excludes weapons**, so a rule on a weapon document that does nothing is
probably a dispatcher gating on it; the **graze subtotal is `div.dice-subtotal.right`**; and the
**creation wizard's step count is not fixed** (an Ashkar default inserts a diaspora-culture step).
**Runs 41, 40 and 39's lessons still apply in full.**

**→ `EDHA_RULINGS.md`** — **two new, both from run 42's measurements: R-88** (Volatile Strike's
untouched `whenDamageType: "impact"` means a keen sword hit offers nothing while its card promises
"any melee attack") and **R-89** (the `NO NAMEABLE HOOK` comment does **not** survive a ProseMirror
save, so a Foundry edit + extract would silently drop it and fail lint pass 5). **R-86 retires every
row premised on a GM-less table or two GM clients** — do not re-open one. R-56 and R-41/R-42 are
closed by this run's measurements.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED
with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ⛔ 0. STEP ZERO — CHECK THE OWNED COPIES, NOT JUST THE PACK

Run 42's deploy-state finding, and it nearly cost three rows: **Ben's adversary ⟳ Sync had run, his
TALENT ⟳ Sync had not.** All 46 world adversaries carried the new weapon items and senses 10/10, while
every bench PC's *owned* talent copy was still pre-item-58/63/56. Before benching any talent row:

```js
Object.values(actor.items.getName("<talent>").system.events).map(r => r.handler)   // read the FIELD, not the pack
```

If it is stale, call **`edha.syncActorTalents(actor)` on the bench PCs only** (16 actors, ~10 s) — and
say so in the delta. **Never `edha.syncAllCharacters()` / `syncAllAdversaries()`**: those rewrite Ben's
own PCs and campaign adversaries. Ben still owes his own ⟳ Sync Talents click for his two PCs.

## ⭐ 1. OPEN A PLAYER CLIENT AND BURN THE PLAYER BLOCK — it is the densest thing left

`PlayerBench` (id `yF9LHvfhB7otsHYY`) unlocks rows that a GM client provably cannot drive:

- **34b's body half** (`# BENCH — Fleet weapon migration` section). The deploy blocker is GONE and run
  42 proved the refusal is now genuinely exercised — `edhaLootableItems` returns **`[]`** for the
  Cinderhound's body and **`["Bite"]`** for a cache, and a defeated Raider's body now offers **both**
  gear weapons (run 40 saw only the Shortsword). What is left is one card: `edhaLootTryOpen` returns
  early for a GM **by design** (`if (!kind || game.user?.isGM) return false`), so double-click the body
  as the player.
- The whole **`🎮 Player-client window`** section — do those rows in the same window rather than one
  per run. Recipe (runs 36/40, unchanged): `tabs_create` → `navigate` to `/join` → `resize_window`
  1400×900 → `location.reload()` → select `PlayerBench` → Join with a blank password → drive each tab
  by its own `tabId`. **Log BOTH clients out at the end.**

## 2. The hygiene block — 5 console-driven rows, no staging to speak of

`# BENCH — hygiene campaign 2026-08-10`, passes 5.2/5.3: **R-64 ×2** (the `victim` mode on
Gain/Drain Focus, Reveal, Next-Test-Mod; and the H3 annotate/near-victim pick), **R-63** (same-side
checks — auras, Reroll Reaction's "enemies only", the Fate snare), **R-62** (seven audience flips —
read carefully, four widen), **R-61** (a scene mid-flight keeps working on the legacy `detonateUsed`
read). Job 6a is **retired under R-86** — do not re-queue it.

## 3. The combat pair, then the three bestiary singles

**CAE burns** and **Kindle's token-light half** need a combat — run 34's three-line `active:false` +
`ui.combat.initialize({combat})` recipe, and **never activate a bench combat**. ℹ️ A bestiary Kindle
row was retired at run 18 with a live `dim 20, bright 10, animation flame` reading (run 42 saw the same
values off a Cinderhound Bite) — check whether that already answers the row before staging.
Then **Pyre spread by alias**, **Unbreakable Line's ally-drops cue** (its (b) half — the missing `use`
rule — is still unimplemented on both blocks) and **Predator's Due's card audience**.

## 4. After the weapon-cue fix ships: one re-test

The **34c weapon-borne riders** row's cue half is waiting on a one-predicate fix (see the defect
below). When it lands, re-drive Surecat's `The Pounce Already Taken` — apply its damage and read for
*"⏰ The Pounce Already Taken …"*. The rider half of that row is already proven.

## Where the 20 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **Item 10 batch 2** (I10b2-1…4) | 4 | ⛔ **BLOCKED and re-derived at run 42** — see below. Do not re-attempt. |
| **77-1** (Mantle's unset-side token) | 1 | Aura halves both PASS live; only the unset-side clause is blocked, same cause. |
| **hygiene campaign** (R-61…R-64) | 5 | **The densest console-only block left. Take it.** |
| **Items-dump tranche** | 2 | CAE burns (needs a combat) + Kindle's token-light half. |
| **Adversary pack sync** | 2 | ⛔ **BLOCKED ON BEN** — a *bulk* sync rewrites his campaign actors. ℹ️ Run 42 proved the renamed-copy skip through the **per-actor** path (`{synced:false, reason:"no pack source"}`); the bulk row still wants Ben's click. |
| **Fleet weapon migration (34b/34c)** | 2 | The body half (player client) + the cue half (waiting on the fix). |
| **Bestiary singles** | 4 | Pyre by alias · Unbreakable Line · Reckless Advance/**Unstoppable** (only the fast-turn half is left) · Predator's Due. |

## Known blockers — do not fight these

- ⭐ **No sideless token can exist on this build** — run 42 re-derived it: `disposition: null` at
  create, and `null` / `undefined` / `NaN` at update, all read back **−1 (HOSTILE)**. The fallback
  ("an actor with no token") discriminates nothing either, because such an actor is in no range sweep.
  That blocks **I10b2-1…4** and **77-1's** unset-side clause. `tests/disposition-failclosed.test.js`
  is the proof that holds without a table.
- **The two `# Adversary pack sync` bulk rows need BEN**, not a bench run.
- **`edhaLootTryOpen` refuses a GM by design** — the body-search card is a player-client row, not a bug.
- **Four ORPHAN tokens on the Playtest Map are NOT the bench's** — `The Forgemaster`, `The Demolisher`,
  `PC Tester`, `Cragdrake Whelp Pack (1)`. Zero bench orphans at run 42.
- ℹ️ **The zero-combatant combat `BerbNeuXp4iKduef` is GONE** (the world held **no** combats at run
  42's start, and none at its end). `game.combat` is null again, so "with no combat in the tracker"
  premises are honest once more.
- ℹ️ **A second scene `Playtest Map (Copy)` exists** (30 tokens, 2 drawings, id `lHKcasWQgVezqdzf`).
  Not the bench's; it holds no Bench-PC tokens. Leave it alone — but remember `getActiveTokens()` can
  reach across scenes when you are resolving a token.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs
  included.
- **Observer/rAF-dependent state is stale on this bench** — `canvas.perception.update(...)` plus a
  ticker pump before reading `isVisible`; the Seeming's "no enemy can see the copy yet" is this.

## Harness traps — each has already produced or nearly produced a false result

- ⭐ **A hidden pane means animated token moves never commit.** Pump the ticker. (Run 42.)
- ⭐ **Two tokens of one actor make an engine result unreadable, not merely ambiguous.** (Run 42.)
- ⭐ **A stale OWNED talent copy fails a row the pack already fixed** — read the rule field, then
  `edha.syncActorTalents(actor)` on bench PCs. (Run 42.)
- **An adversary dummy is not an "enemy" of an adversary** — pick the victim by disposition. (42.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire, then read next call. (26–42.)
- **Read the card's own `.dice-formula` NODE, never `msg.rolls[0].formula`**, and sample again ~2 s
  later — the cosmere damage card re-renders asynchronously. (Runs 41, 42.)
- **`game.messages.contents.slice(-1)` lies** whenever a cue or belief card lands after the roll —
  snapshot the id set before the take and diff it. (Run 42.)
- **A watch that "does nothing" may be refusing your victim's actor TYPE** (`defeat` is
  `character`-gated). (Run 41.)
- **An UNLINKED token's actor is not the base actor** — stage and assert through
  `scene.tokens.get(id).actor`. (Run 41.)
- **`refreshDefBuffs()` will TIDY a pre-existing aura effect you did not create** — run 42 lost
  `Guardian Stance (+1 Deflect)` off `Bench — Life` and restored it by cloning the identical effect
  from an actor that still had it. Snapshot effect NAMES, and know that a name alone cannot rebuild.
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **A raw HP `update()` fires no damage-cadence rule** — use `actor.applyDamage(...)`, or the card's
  own `button[data-action="apply-damage"][data-multiplier="1"]`. (Runs 34, 42.)
- **`combat.nextRound()` leaves `turn: null`** — set it with `combat.update({turn: n})`. (Run 41.)
- **Verify the deploy by HASH from BOTH sides.** Run 42's was `609c7e457e2132b4…`.

## Standing lessons

- **Stage each row off the previous row's residue.** Run 42 got item 63's three-way Rallying Shout
  result out of the corpse Withering Touch had just made.
- **Verify a row's named SUBJECT and its own PROBE before staging anything.** Run 42's Volatile Strike
  row needed an *impact* weapon that no bench PC carries; cloning one turned a "doesn't work" into a
  ruling.
- **When a row's NEG is unrunnable with shipped data, CLONE the shipped item and edit the field.**
  (Runs 39, 41, 42 — the staged impact sidesword, the flagged Surecat weapon.)
- **Once a matched control has proven a root cause, write the residual symptom down and move on.**
- **Refuse to inherit the previous run's blocker — re-derive it.** (Run 42 re-derived the disposition
  coercion rather than citing run 38, and that is why the four I10b2 rows can be trusted as blocked.)
- **Read the cards you did not come for.** Runs 31–42 each found something that way.
- **Only claim what your own logs support, and label inferences as inferences.**
