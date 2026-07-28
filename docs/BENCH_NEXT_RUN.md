# Next bench session — run 18

> **Marathon 3 continues.** Run 17 (Goldenport + Ashkar bestiaries) re-tested **fix pass A 5-for-5**,
> retired **18 of 22** bestiary rows on evidence, root-caused **two engine defects**, and finished with
> **zero world drift**. The engine is hash-verified live and the pack-rebuild list is still **EMPTY**.

## Your scope — 27 rows, two bestiaries

| Section | 🤖 rows | Distinct actors to import |
|---|---|---|
| `# Canticle Plains Bestiary` | **13** | Callthief · The False Spring · Dirgehound Pack (**3**) |
| `# Kettavar Tundra Bestiary` | **14** | The Doubled · The Doubled Elder · Cullwolf Pack · The Cull-Alpha (**4**) |

Both sections' "Deploy needed first" blocks were struck 2026-07-27v. **Nothing here is
BLOCKED-ON-DEPLOY.** Each section also carries ⚑ rows (2 and 1) — those are **Ben's**, leave them.

**Seven imports cover twenty-seven rows** — a denser section than run 17's. Import each actor **once**
as `Bench Adv — <name>`, drive every row touching it, then move on. Measured density: run 17 got
**1.4 rows retired per import**, run 16 got 1.2. Budget for a full run.

Three rows are the interesting ones, in this order:
1. **Severance vital-convert** (Cullwolf Pack + Cull-Alpha) — the *first bestiary* use of Severance.
2. **The Seeming full loop** on the Doubled Elder, and **Raking Grasp +1d8 vs a target fooled by
   EITHER ledger** (`edhaTargetFooled` reads the phantom ledger AND the ambush ledger) — run 17 proved
   both ledgers separately, so this is the join.
3. **Walk Out of the White** on **both** `damaged` and `seeming-break` triggers.

## Read before driving

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → **run-17** operating lessons; run 17's block is newest and
overrides older advice. The six that will cost you a row if you skip them:

1. **`applyDamage` is the ONLY path that runs the GM-cue sweep.** A raw `actor.update()` on HP fires
   nothing. And `item.use()` does **not** apply its own damage — use
   `victim.applyDamage([{amount, type}], {edhaSource: dealer, originatingItem: item})`; the explicit
   dealer is what makes `edha-on-hit` dispatch. Never `.pop()` a chat-log apply-damage button.
2. **Patch `Roll#evaluate` read-only to capture formulas.** Belief cards print only the total, so
   "is the modifier real?" is unanswerable from the card. Restore the patch before logging out.
3. **Attribute every card by `speaker` / `userId`, never by capture window.** Two actors' identical
   abilities fire in one window routinely.
4. **`edhaResolveKiller` uses the CONTROLLED token, not the damage dealer** — `Predator's Due` appears
   on **both** the Dirgehound Pack and the Cull-Alpha, so `tok.object.control()` the killer first.
5. **Turn-start events only fire on a FORWARD step** — `combat.update({round: r+1, turn: 0})`. Build the
   bench combat with `scene: null`, and `ui.combat.initialize({combat})` keeps it INACTIVE.
6. **The pane is hidden → `setTimeout` is throttled to ~1 s.** Keep dialog walkers to ~5 iterations and
   put a `Promise.race` timeout around `item.use()`, or a 10-target loop reads as a hang.

Plus one trick that paid for itself in run 17: **drive a once-per-scene ability at MANY fresh targets
instead of clearing one ledger** — ten targets is ten independent rolls in one pass, and it hands you
the fooled *and* un-fooled cases the rider rows need.

## Known defects — do NOT re-file these as new

Run 17 root-caused two; both are in the 2026-07-28 handoff delta and feed test-pass-fixes.

- **`edha-pre-use` has no dispatcher.** The event type is registered against a sentinel hook nothing
  fires, and the only `preUseItem` takeover glue is burst-specific, so an `edha-place-hazard` rule on
  that event is unreachable. Blast radius is **1 ability** (Cinderbrock's Fire the Wrack); everything
  else on `edha-pre-use` is `edha-burst`, which works. **Nothing in Canticle or Kettavar depends on it.**
- **`edha-push` moves 0 ft.** Shockwave Slam's card posts with the right victim and the right gate, but
  `edhaApplyMove(vtok, aim, maxFt, {gapPx: 0, hostile: true})` displaces nothing. **This one DOES reach
  you:** the Dirgehound Pack's **Unnerving Approach** is a push, so expect it to post its card and move
  nobody. Record it as *inheriting the known `edha-push` defect*, not as a new one.

Also carried forward, not a defect: `edhaIsFastTurn` reads `game.combat`, so **`whenFastTurn` is
undrivable** while Ben's campaign combat is active. Record BLOCKED, blocker named, **row stays 🤖**.

## Standing rules (unchanged)

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or
  deactivate a scene or combat. Create only in the Edha Bench folders.
- **Snapshot ids, flags, EFFECTS — and now UNLINKED TOKEN-ACTOR flags.** Run 17 hit zero drift on
  everything `game.actors` covers but could not prove-and-revert a write to Ben's unlinked *token*
  actors, because the snapshot did not include them. Add
  `canvas.scene.tokens.filter(t => !t.actorLink).map(t => [t.id, t.actor.flags])`. Expect this: an
  `ally-drops` cue with `rangeFt: 0` has **no range gate**, so dropping any bench adversary to 0 fires
  it on every same-disposition token on the shared map.
- **Never resolve a token by NAME when duplicates exist** — use the id or `actorId`.
- **Verify the deploy BY HASH on join** (cache-bust fetch → CRLF→LF → SHA-256 vs
  `HEAD:module-src/scripts/register-skills.js`). Run 17's match was
  `894bead5c5a2982af991a0401276bf0eaeefae9e00f5552c4b42d2cd5e8f1b01` (1,452,498 bytes).
- **Design/feel/balance questions go to `EDHA_RULINGS.md`**, never into the checklist as a ⚑ row.
- **Only claim what your own logs support**, and label inferences as inferences.
- **Log out at the end without fail** — `game.logOut()`, then confirm `Bench` is selectable on `/join`.

## World state you can rely on

- **Adversary world-sync is NOT owed** (run 16 fingerprinted all 46 world adversaries against the pack:
  0 drift). Do not run `edha.syncAllAdversaries()`.
- Ben's `Gamemaster` client is usually connected and **Bench held `isActiveGM`** in runs 16 and 17. A
  duplicate card with two GMs is not automatically a defect — attribute by `userId` first.
- Ben's campaign combat `BerbNeuXp4iKduef` is live at round 1. Read it, never modify it.
- Three of Ben's Corvaine token actors carry a run-17 `trigRound["cue:Break:ally-drops:0_5:0:1"] = 1`
  key. Benign and self-clearing when the round advances — **not** a new defect, do not re-file it.

## After Canticle + Kettavar

The remaining bestiary tails are **Corvaine**, **Riverlands** and **Thalendor**. Same import-once
shape, same density. 171 🤖 rows remain in the checklist overall.
