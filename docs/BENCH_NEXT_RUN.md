# Next bench session — run 21

> **Marathon 3 continues.** Run 20 drove the never-benched **`# Adversary ability wiring`** block for
> the first time: **26 🤖 in, 13 retired, `# W23` retired WHOLE, 4 root-caused fails, 9 not reached.**
> Three NEW engine defects, each with a named line. **Zero world drift — not one write to Ben's
> actors.** The engine is hash-verified live and the pack-rebuild list is still **EMPTY**.

## Your scope — `# Character-creation wizard v2`, 34 🤖

| Section | Lines | 🤖 |
|---|---|---|
| **`# Character-creation wizard v2`** (2026-07-19p) | 1580–1812 | **34** |

Counted from run 20's end state — **count it yourself before you start** and state your scope up front.

⚠️ **This section is NOT 34 independent setups. It is ONE continuous sheet walkthrough.** Nearly every
row is a step in a single wizard flow — open it, pick ancestry, pick culture (the pick-2 change), pick
a path, take the starting kit, land on a finished sheet — and the later rows only exist *because* the
earlier ones ran. Budget it as **one long drive with 34 assertions**, not as 34 imports. That inverts
run 20's failure mode (speculative batch-importing, 0.62 retired/import): here there is essentially
**one subject**, so the density ceiling is high if you keep the wizard open and assert as you go.

Practical consequence: **do not restart the wizard between rows** unless a row demands a fresh start.
Re-driving from step 1 for each assertion is how this section becomes a five-run slog. Record the
sheet/actor id you create once and keep asserting against it.

## Read before driving

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → **run-20** operating lessons; run 20's block is newest
and overrides older advice. The five that will cost you a row if you skip them:

1. **The bench PC tokens ALREADY EXIST on the map — never create a duplicate, move the existing one.**
   `edhaCasterToken()` takes `actor.getActiveTokens()[0]`, which is the pre-existing token, not
   yours. Run 20 lost four calls to this and nearly filed a correct filter as broken.
2. **Drive with `use({shouldConsume:false, configurable:false})`.** It skips the "— Consume Resource"
   dialog and the roll dialog, so a drive is deterministic and fits the 30 s budget. Only take the
   real cost path when a row asserts a cost, and click that dialog in a **separate** call.
3. **`edha-on-hit` / mutation riders land on damage APPLICATION.** Click the card's
   `button[data-action="apply-damage"]`; rolling alone proves nothing.
4. **Search the whole chat log by ability name before recording ANY negative** — a cue can fire at
   combat creation, before your capture window exists — and read the owner's `trigRound` to see
   whether it already fired. The gate reads **Ben's** `game.combat.round`, parked at **1**.
5. **`nextTurn()` no-ops on an unstarted combat.** Step with `combat.update({round, turn})`.

For a wizard section specifically: the engine's dialogs are **AppV1** (`div.app.window-app`, no
`<dialog>` element) as often as AppV2 — sample for **both** shapes, and check `ui.notifications`
before ever writing "nothing happened".

## Known — do NOT re-file these as new

- **The three run-20 engine defects**, all filed and inline in the checklist: `edhaReknitClick`'s
  falsy-zero cost (`|| 2`), `edhaSutureCradleCheck`'s object-identity holder dedupe (double-fires for
  every unlinked token), and **`braced` missing from `EDHA_TIMED_STATUSES`** (so any
  `edha-self-status timed:true` on `braced` never expires). If a wizard row trips the braced one,
  cite it.
- **2bAB-9 Sovereign of Solitude ships an empty document** (`rules=0 effects=0`, engine mentions are
  comments only) — a known authoring gap, already filed.
- **R-48's `bySize` rank-scaling family** and **R-52's `ally-drops` 5-ft centre-to-centre gap** —
  standing rulings. Log the instance, move on.
- **`whenFastTurn` is undrivable** while Ben's campaign combat is active. Record **BLOCKED, blocker
  named, row stays 🤖.**
- **`rules=0` is not automatically a failure** — read the pack AND grep the engine before calling it
  one. Suture Cradle's 0 rules are correct (legitimately name-keyed at L3357); Sovereign of
  Solitude's 0 rules are a gap. The difference is whether a code branch exists.

## Standing rules (unchanged)

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or
  deactivate a scene or combat (`Combat.create({active:false})` + `combat.update({round,turn})` kept
  Ben's combat untouched through runs 19 **and** 20). Create only in the Edha Bench folders; import
  adversaries fresh as `Bench Adv — <name>`. ⚠️ The engine **auto-renames** placed tokens, so a
  `Bench Adv —` actor does **not** mean a `Bench Adv —` token: **resolve tokens by id, always.**
- **Snapshot ids, flags, EFFECTS — and unlinked token actors'**
  (`canvas.scene.tokens.filter(t => !t.actorLink)`). Compare **deep-equal, key-sorted**, never by
  `JSON.stringify`. Restore the **whole** flag object.
- **Verify the deploy BY HASH on join** (cache-bust fetch → CRLF→LF → SHA-256 vs
  `HEAD:module-src/scripts/register-skills.js`). Run 20's match was
  `b1bd52c165b8ce0d1b8bc3651f862a6be81795c7adc16aabf7d86abe0bfb01b2` (git blob `c0b0c1e`).
  **Marker counts in a handed-down brief go stale — the hash does not.**
- **🤖 is your queue; ⚑ is Ben's judgment — never re-file an unrun 🤖 as ⚑.** Out of time → leave it
  🤖 or record it **BLOCKED** with the blocker named.
- **Design/feel/balance questions go to `EDHA_RULINGS.md`**, never into the checklist as a ⚑ row.
- **Only claim what your own logs support**, and label inferences as inferences.
- **Log out at the end without fail** — `game.logOut()`, then confirm `Bench` is selectable on `/join`.

## World state you can rely on

- **Adversary world-sync is NOT owed** (run 16 fingerprinted all 46: 0 drift). Do not run
  `edha.syncAllAdversaries()`.
- Ben's `Gamemaster` client is usually connected and **Bench held `isActiveGM`** in runs 16–20. A
  duplicate card with two GMs is not automatically a defect — **attribute by `userId` first.** Run 20
  found a genuine double-fire precisely *because* both cards came from the same user id.
- Ben's campaign combat `BerbNeuXp4iKduef` is live at **round 1**, turn `null`, on the active
  `Playtest Map` (**52 tokens, 117 walls, 87 world actors** — run 20 ended exactly on those numbers).
  Read it, never modify it.
- Bench-folder fixtures carry accumulating residue (run 20 left Bench — Green at 25 HP / 3 focus and
  Bench — Black at 3 focus). Ordinary — do not try to "fix" it.
- ⚠️ **Ben's `Stonebound Captain` token actor still carries the run-19 `trigRound` key**
  (`cue:Reactive Strike:enemy-turn-start:0_5:10:1 → 1`). Left in place deliberately, reported in the
  07-28e delta, and **unchanged by run 20**. Not drift you caused; do not clean it.

## After this section

**108 🤖 rows remain in the checklist overall** (measured after run 20's 13 retirements). The
`# Adversary ability wiring` block still holds **13**: the 9 run 20 never reached (Cover Their Retreat,
Press the Line, Morale cues, Per-bird seemings, Cinder Coat, Bite sheds light, Stalker Fade,
Devastating Blow, Veil auto-toggle) plus the 4 carrying root-caused fails. The 9 not-reached are
cheap and cluster on **four** actors — Roek+Raider, Mistheron ×2, Cinderhound, Stalker — so they are
a strong high-density follow-up once the wizard is done.
