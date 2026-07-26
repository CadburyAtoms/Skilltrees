# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless.
Run BENCH RUN 2 (two trees: **White, then Blue**): join as Bench, health-check, then re-run
scripts/bench-setup-console.js once as the idempotency/repair check (zero ⚠ lines expected —
the High Society Contacts collision was fixed in run 1; tokens are already placed, ORIGIN
(2100, 9000), so the script will skip placement). **Read docs/EDHA_BENCH_RUNBOOK.md
"Operating lessons from run 1" before driving anything** — especially: after Combat.create you
must ui.combat.initialize({combat}) and verify game.combat.id, chat is `ol.chat-log`, token
moves need {animate: false} + tokenDoc.reset(), item.use() blocks on the ItemConsumeDialog,
and there are no screenshots when the pane is hidden (record quoted card text + console
asserts instead). The Engine-wide premise rows are retired; 2bAC-1/2 stay ⚑ Ben. Tem parinaem
and Soggy Bottom are untouchable.

Then run the two sections end-to-end:
- **BENCH — White** on Bench — White: move it into the lower-left room; arrange Bench Ally
  One/Two in range and a hostile pair adjacent for the Bulwark reaction rows. Priorities per
  the preamble: 2bR-18 (premise) then 2bR-7. Shield Wall / Interposing Shield / Shared Burden
  / Retributive Guard / Unbreakable Line need controlled damage to allies — the run-1 "Bench
  Maul" pattern (copy a weapon, swap damage type, delete after) plus direct applyDamage both
  work.
- **BENCH — Blue** on Bench — Blue: enemy dummies in Blue Attunement Range — one with a
  written Cognitive defense (Adjacent A/B/Floater) and the **Undefended** adversary fixture
  for the fail-open rows (2bJ-5, 2bF-6; note the runbook's known-limit if the engine reads
  schema defaults on it). Priorities: **2bJ-1 first (first prompt-pick click ever — if the
  button does nothing, stop the Blue section and report)**, then 2bF-3 (first `vs: skill`),
  2bAA-10 (Phantom Barricade — real walls; delete any barrier leftovers), 2bP-2 (the
  out-of-combat silent-free-buff trap).

Caveats: adversary-copy rows (2bR-17, 2bJ-13, 2bAA-9, 2bF-17) depend on the DEPLOY STATE
switches Ben has not confirmed (⟳ Sync Adversaries / re-drag) — if one looks stale, record a
deploy-state note, not a FAIL. Multi-client rows that would displace the Bench cookie stay ⚑
Ben. Do NOT fix run 1's FAIL batch (Shockwave Slam etc.) mid-run — that is a separate
test-pass-fixes session. Record per the skill: passing rows retire with one-line evidence,
fails get dated inline notes, feel/canvas rows stay ⚑. Finish with the dated handoff delta
(next letter after the current top one), dashboard rebuild, gates (`python`, never `python3`;
no `;`-chaining), ONE pushed commit titled `Bench run 2 (White+Blue): X retired on evidence,
Y fails -> test-pass-fixes`, and rewrite docs/BENCH_NEXT_RUN.md with the run-3 prompt
(Black, then Green).
