# Next bench session — run 19

> **Marathon 3 continues.** Run 18 (Canticle Plains + Kettavar Tundra) re-tested **fix pass B 3-for-3**,
> retired **all 27** bestiary 🤖 rows on evidence — the first section-pair swept whole — root-caused
> **one new engine defect** with a matched control, and finished with **zero world drift**. The engine
> is hash-verified live and the pack-rebuild list is still **EMPTY**.

## Your scope — 24 rows, one section

**`# W29 Balance-Pass Bestiary`** (checklist ~L2472–2599). Counted, not estimated: **24 🤖, 2 ⚑**.

| Block | 🤖 | Import |
|---|---|---|
| §0 Engine — owner-scan widening (ruling 113) | 1 | **Dirgehound Pack** (re-test of the W28 headline row) |
| §1 Reeve-Owl (Black rival — the judgment kit) | 4 | Reeve-Owl |
| §2 Crownox Ring (White rival ×3 — the wall) | 2 | Crownox Ring |
| §3 Rootling Swarm (Green minion ×3 — the Snare) | 1 | Rootling Swarm |
| §4 Briar-Gone Grove (Green boss — the Closing Arena) | 5 | Briar-Gone Grove |
| §5 Tollbird Flock (Black minion swarm) | 2 | Tollbird Flock |
| §6 Surecat (Blue rival — the foresight duel) | 2 | Surecat |
| §7 Brandram (Red rival — the charge) | 4 | Brandram |
| §8 Tussock-Sow (Green rival, mobile) | 3 | Tussock-Sow |

**Nine imports for twenty-four rows.** Measured density: run 18 **3.9** retired per import, run 17 1.4,
run 16 1.2 — run 18's number came from sections that pile many rows on few actors, and W29 is thinner
(≈2.7). Budget by **rows-per-actor**, not by import count. The 2 ⚑ rows (Crownox "where does a ring
stop being a ring", Tollbird swarm bookkeeping) are **Ben's — leave them**.

The three that will take the longest, in this order:

1. **§0 Dread Presence veto from the Dirgehound Pack** — the ruling-113 owner-scan widening. It was
   DEAD before the widening because the scan skipped adversary owners *and* unlinked token copies, so
   drive it as **its own isolated case**: one owner in range → blocked + toast; a **matched control**
   with every owner parked >100 ft → the identical move succeeds with no toast. (The Doubled Elder's
   copy of this row retired that way at run 14 — reuse the shape, not the result.)
2. **§4 Briar-Gone Grove — 5 rows and three different placement paths** (Draw Mana click-place, engine
   hazard patches, a `edha-burst` Sudden Growth). Every one of those blocks on a canvas click; see the
   pick-point recipe below before you start, or you will lose the run to it.
3. **§7 Brandram — Shockwave Slam again, but at 10 ft.** This is the **other** adversary carrying
   Shockwave Slam. Run 18 proved the one-square geometry exhaustively; Brandram pushes **up to 10 ft =
   two squares**, which is the case that *can* degrade to a partial distance, and its collision is
   **half 1d4**, not 1d6. Do not assume run 18's evidence covers it.

## Read before driving

**→ `docs/EDHA_BENCH_RUNBOOK.md`** — run-1 → **run-18** operating lessons; run 18's block is newest and
overrides older advice. The six that will cost you a row if you skip them:

1. **Never `tokenDoc.update({x, y})` to stage a fixture** — v13 makes it *walk*, wall-constrained, and it
   lands short. Use `tok.move({x, y, action: "displace"}, {animate: false})`.
2. **Click-to-place blocks on `edhaPickPoint`** (`pointerdown` on `#board`, reads `canvas.mousePosition`)
   — and `edhaCastBurst` **consumes the cost first**, so it looks like a silent no-op with **no dialog to
   find**. Pin `canvas.mousePosition` with a configurable getter, dispatch a `PointerEvent`, then click
   Detonate. **Escape cancels every pending picker and refunds.** §3/§4/§8 all need this.
3. **One click per DIALOG** (keep a `Set` of titles) or one attack rolls five times. Match **"Consume N
   Focus?" → Continue** and the boss picker **"Which boss turn…" → Off-turn** as well as Roll — a boss
   raises that picker as soon as any encounter exists, and an unanswered dialog leaves `use()` pending so
   the *next* drive's capture window scoops up the previous ability's cards.
4. **`applyDamage` is the only path that runs the GM-cue sweep**, and `item.use()` does not apply its own
   damage: `victim.applyDamage([{amount, type}], {edhaSource: dealer, originatingItem: item})`.
5. **`edhaResolveKiller` reads the CONTROLLED token** — `tok.object.control()` the killer before any
   on-defeat row. **`edhaIsIsolated` counts same-disposition adjacents** — an attacker on the victim's own
   side makes it un-Isolatable, which silently voids every Isolated-gated row (§1 Sapping Hex, §1 Cruel
   Step, §5 Sapping Hex).
6. **Patch `Roll#evaluate` read-only** to capture formulas — riders and advantage are unprovable from a
   card that prints only a total. Restore it before logging out.

Two tricks that paid for themselves in run 18: **resample a once-per-scene belief by `unsetFlag` on your
own bench import** rather than hunting a cooperative fixture (prove the once-per-scene gate separately
first); and **pick a victim whose Deflect makes the branch visible** — a damage-*type* test on a Deflect-0
actor proves nothing, and a fixed `applyDamage` amount lets the HP delta discriminate with no card-reading.

## Known defects — do NOT re-file these as new

- **`ally-drops` fails OPEN when the victim has no token on canvas at sweep time** (run 18, new). `disp`
  is `undefined`, the same-side filter is skipped, and every cue owner on the scene fires across the
  disposition line — phantom doubles are exactly this case. Full write-up + re-test row is in the
  engine-wide bench section and the 2026-07-28c delta. **It reaches Ben's Corvaine token actors**, so
  snapshot for it. Note that for *normal* kills the filter does work: run 18 measured **0** cross-side
  cards from a disposition-0 victim whose token was present, so parking a victim at a disposition no
  other token shares is still a real mitigation.
- **`whenFastTurn` is undrivable** while Ben's campaign combat is active — `edhaIsFastTurn` reads
  `game.combat`. §7 Brandram's Unstoppable row is likely to hit this. Record **BLOCKED, blocker named,
  row stays 🤖** — a technical blocker never becomes ⚑.
- **Pyre spread card BY ALIAS** (Ashkar §3, Cinderbrock) is **unblocked but unrun** — run 18 confirmed the
  placed Region carries `spreads: true` and `terrain.ownerUuid`, but did not step the Cinderbrock's own
  turn end. It stays 🤖. If you have a spare combat step, it is nearly free.

## Standing rules (unchanged)

- **Tem parinaem and Soggy Bottom are untouchable.** Never type a password. Never activate or deactivate
  a scene or combat (`ui.combat.initialize({combat})` keeps a bench combat INACTIVE; `scene.view()` is
  view-only). Create only in the Edha Bench folders; import adversaries fresh as `Bench Adv — <name>`.
- **Snapshot ids, flags, EFFECTS — and unlinked token actors' flags/effects**
  (`canvas.scene.tokens.filter(t => !t.actorLink)`). Run 18 needed it and used it.
- **Compare flags DEEP-EQUAL, not by `JSON.stringify`** — a rewrite changes key order and reads as false
  drift. Restore the **whole** snapshot flag object; `{recursive: false}` on a sub-path silently strips
  sibling keys (run 18 did this to Ben's Line-Caller and had to repair it).
- **Never resolve a token by NAME when duplicates exist** — use the id or `actorId`.
- **Verify the deploy BY HASH on join** (cache-bust fetch → CRLF→LF → SHA-256 vs
  `HEAD:module-src/scripts/register-skills.js`). Run 18's match was
  `9699fcb8691ebd13c6c3e0907b6bc32bca224c56adc419f9a4cc4f66e3674c12` (1,467,524 bytes). **Marker counts
  in a handed-down brief go stale — the hash does not.**
- **Design/feel/balance questions go to `EDHA_RULINGS.md`**, never into the checklist as a ⚑ row.
- **Only claim what your own logs support**, and label inferences as inferences.
- **Log out at the end without fail** — `game.logOut()`, then confirm `Bench` is selectable on `/join`.

## World state you can rely on

- **Adversary world-sync is NOT owed** (run 16 fingerprinted all 46 world adversaries against the pack:
  0 drift). Do not run `edha.syncAllAdversaries()`.
- Ben's `Gamemaster` client is usually connected and **Bench held `isActiveGM`** in runs 16–18. A
  duplicate card with two GMs is not automatically a defect — attribute by `userId` / `speaker` first.
- Ben's campaign combat `BerbNeuXp4iKduef` is live at round 1, on the active `Playtest Map`. Read it,
  never modify it. `Playtest Map (Copy)` is the spare — safe to **view**, and run 18 left it back at its
  original 30 tokens.
- Five **bench-folder** target fixtures carry accumulating `bpHits` counters. Ordinary bench residue, not
  drift — do not try to "fix" it.

## After W29

The remaining bestiary tails are **Corvaine**, **Riverlands** and **Thalendor**, same import-once shape.
**143 🤖 rows remain in the checklist overall** (measured after run 18's 27 retirements).
