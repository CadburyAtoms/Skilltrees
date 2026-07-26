# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless. Run
BENCH RUN 3 (two trees: **Black, then Green**): join as Bench, health-check, then re-run
`scripts/bench-setup-console.js` once as the idempotency/repair check (zero ⚠ lines expected;
tokens are already placed at ORIGIN (2100, 9000), so it will skip placement). Read
`docs/EDHA_BENCH_RUNBOOK.md` — **both** the run-1 and the run-2 "Operating lessons" — before
driving anything. The load-bearing ones: after `Combat.create` you must
`ui.combat.initialize({combat})` and verify `game.combat.id`; chat is `ol.chat-log`; token moves
need `{animate: false, teleport: true}` plus `tokenDoc.reset()`; `item.use()` blocks on the
ItemConsumeDialog (click `[data-action=continue]`, then `[data-action=submit]` for the roll); there
are no screenshots when the pane is hidden, so record quoted card text + console asserts; and **a
silent handler is usually a dice formula, not a gate** (see below). Tem parinaem and Soggy Bottom
are untouchable.

**Two failure families are already root-caused — do NOT re-diagnose them, just note when a row is a
victim:**

1. **`edhaEvalSync` returns 0 for any DICE formula** under Foundry v13.351 (`evaluateSync()` throws
   on die terms; the catch swallows it), so any rule whose amount formula contains dice and whose
   caller gates on `amt > 0` is silently dead. Black and Green both have candidates — Predatory
   Patience's `+[Die]` rider (2bB-10) and Green's heal/terrain amounts. If a row goes silent,
   substitute a flat amount on the bench actor, confirm the card appears, restore it, and record it
   as a member of this family rather than a new bug.
2. **Non-attack adversary abilities carrying `edha-def-test` never roll** (`advItemDoc` only sets
   `activation.skill` for attacks). Check `item.system.activation.skill` first on Black's adversary
   rows (2bZ-10 Dread Presence copies, 2bJ-14 Dirgehound) and Green's. Import adversaries FRESH from
   the pack as `Bench Adv — <name>` in the bench folder — that removes the DEPLOY-STATE ⟳ Sync
   caveat entirely.

Then run the two sections end-to-end:

* **BENCH — Black on Bench — Black:** move it into the lower-left room; enemies in Black Attunement
  Range with one **Isolated** (that fixture is parked far out at (9300, 9300)), one with its own
  allies within 10 ft, and one driven to 0 focus. Priorities per the preamble: **2bI-1** (the first
  `scope: scene` watch) and **2bI-5** (the chain flag) — if either fails, stop the Black section
  before the rest; the others share that machinery. **2bI-9 is a design question, not a test** —
  leave it ⚑. Also settle the standing question run 1 raised: Whispered Doubt and Coercive Pressure
  fire **out of combat** although the rows say "in combat" (seen again all through run 2) — record
  what you observe; the ruling is Ben's. 2bJ-7's push DIRECTION (away from your TARGET, not from
  you) is the row worth being slow and careful on.
* **BENCH — Green on Bench — Green:** allies in range for the heal rows, enemies for the terrain and
  quarry rows. Run 1 left an open cross-tree report to close here: **Mender's Instinct offered its
  heal-Reaction for a HOSTILE crossing half HP and double-posted** — it reproduced on every damage
  event in run 2's White rows, so it is easy to catch; root-cause the ally gate and the dedup
  together. Watch for the dice-formula family in Green's heal amounts.

**Caveats:** multi-client rows that would displace the Bench cookie stay ⚑ Ben. Do NOT fix run 1's or
run 2's FAIL batches mid-run — the `edhaEvalSync` fix, the `advItemDoc` fix and Shockwave Slam are
all `test-pass-fixes` work, and the two new families are the biggest items in that queue. Record per
the skill: passing rows retire with one-line evidence, fails get dated inline notes, feel/canvas rows
stay ⚑. **Scope your end-of-run cleanup to an id-diff against your OWN start snapshot** — run 2 swept
on the `summon` flag and deleted two pre-existing run-1 leftovers. One orphan `Combat Construct`
token from run 1 is still on the Playtest Map; leave it for Ben.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild, gates
(`python`, never `python3`; no `;`-chaining), ONE pushed commit titled
`Bench run 3 (Black+Green): X retired on evidence, Y fails -> test-pass-fixes`, and rewrite
`docs/BENCH_NEXT_RUN.md` with the run-4 prompt (the deity trees — Destruction, then Death).
