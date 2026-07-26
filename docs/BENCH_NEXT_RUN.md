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

**⚠️ FIRST: confirm the 07-26j deploy state, because two big fixes landed after run 2 and they
change what you should expect.** Both were run-2 failure families, now fixed in the repo but needing
Ben to pick them up — and they need DIFFERENT actions, so check them separately:

1. **The dice fix (`edhaEvalSync`) — engine-only, needs Ben's sync + F5.** Console-check it before
   trusting any amount: `edha` is loaded, and a passive with a dice amount now produces a real
   number. If Shield Wall on `Bench — White` still reduces nothing, the engine half is NOT live —
   say so and treat every dice-amount row as blocked rather than failing them.
2. **The adversary def-test fix (`advItemDoc`) — needs a PACK REBUILD + ⟳ Sync Adversaries + re-drag.**
   Check `item.system.activation.type` on a fresh pack import: `skill_test` means it is live,
   `utility` means Ben has not rebuilt yet.

**This run has re-test work that is NOT in the Black/Green sections** — 7 rules the 07-26j sweep
restored in other trees, all engine-only (F5). Bench them wherever they fall naturally:
**Pack Pressure** (Green — in your section anyway) · **Tempered Edge** (Civilization) ·
**Withering Touch** (Death, damage bonus only) · **Predatory Strike** (Knowledge) ·
**Warlord's Advance** (Power) · **Crownox Ring**'s Shield Wall + Retributive Guard (adversary).
Each silently dealt/reduced NOTHING before the fix; each should now roll `[Tier][Die]` and print a
real number. ⚑ Green's **Vital Surge** matched the same search but was verified in code as NOT
affected — don't re-test it for this.

**Still open from run 1, genuinely unfixed:** Shockwave Slam's weapon-hit trigger surface. Don't fix
it mid-run.

**The new failure mode to know:** `edhaRollDiceSync` only rolls a bare `NdM`. A formula that cannot
fold to that shape (a kept-dice modifier like `2d20kh`) still evaluates to 0 — deliberately. Nothing
ships in that shape today, but if an amount is silently 0, check its formula's shape first.

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

**Caveats:** multi-client rows that would displace the Bench cookie stay ⚑ Ben. Do NOT fix anything
mid-run — that is `test-pass-fixes` work. Record per the skill: passing rows retire with one-line
evidence, fails get dated inline notes, feel/canvas rows stay ⚑. **Scope your end-of-run cleanup to
an id-diff against your OWN start snapshot** — run 2 swept on the `summon` flag and deleted two
pre-existing run-1 leftovers. One orphan `Combat Construct` token from run 1 is still on the Playtest
Map; leave it for Ben. **Log out at the end** (`game.logOut()`) so the Bench user is free for the
next session.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild, gates
(`python`, never `python3`; no `;`-chaining), ONE pushed commit titled
`Bench run 3 (Black+Green): X retired on evidence, Y fails -> test-pass-fixes`, and rewrite
`docs/BENCH_NEXT_RUN.md` with the run-4 prompt (the deity trees — Destruction, then Death).
