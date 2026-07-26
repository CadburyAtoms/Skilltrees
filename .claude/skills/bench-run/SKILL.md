---
name: bench-run
description: Run the EDHA in-Foundry bench YOURSELF through the in-app browser at localhost:30000 — join as the passwordless GM user "Bench", build/repair the bench roster with scripts/bench-setup-console.js, execute the checklist's `# BENCH —` sections row by row, and record results (PASS rows retire on evidence, FAIL/PARTIAL batches feed test-pass-fixes, feel/canvas rows stay ⚑ for Ben). Use whenever the task is to run, continue, or pilot "the bench", test trees in Foundry directly, or verify migration behaviour live. NOT for triaging Ben's own reported results — that is test-pass-fixes.
---

# Bench-run — the agent-driven Foundry bench

You are about to drive Ben's live Foundry (campaign world **edha**) through the browser pane.
`docs/EDHA_BENCH_RUNBOOK.md` is the full procedure — this skill is the operating loop plus the
rules that keep the campaign world safe. Sessions cannot LAUNCH Foundry; Ben must have it
running (if `http://localhost:30000` doesn't answer, stop and ask).

## Hard rules (before anything else)

1. **Player characters "Tem parinaem" and "Soggy Bottom" are UNTOUCHABLE.** Never write to
   them, never aim an effect that writes to them, never move or delete their tokens.
2. **Never type a password.** The `Bench` user is passwordless by design; if Foundry asks for
   a password anyway, stop and tell Ben — do not enter one.
3. **Never activate/deactivate a scene** (it yanks every connected client). *View* scenes.
4. **Only create/modify inside the "Edha Bench" actor folders.** Adversary targets are
   imported fresh from the pack into the bench folder — never Ben's placed campaign tokens.
   Delete nothing pre-existing; bench-created combats/walls/measured-templates are yours to
   clean up and MUST be cleaned up.
5. **DEPLOY STATE is Ben's** — your findings go in the handoff delta, never there.

## The loop

1. **Join:** browser pane → `http://localhost:30000/join` → select user **Bench** → Join
   (leave password empty). "User already active" → ask Ben to free it, don't force.
2. **Health check** (javascript_tool, screenshot it): `game.world.id === "edha"`,
   `game.user.name === "Bench"` + `isGM`, `game.modules.get("edha-content")?.active`,
   `!!globalThis.edha`, `game.system.version`.
3. **Roster:** paste `scripts/bench-setup-console.js` into the console. Zero ⚠ lines expected
   (⚠ = a talent/path name didn't resolve — fix the script in the repo, commit, don't
   improvise in-world). Re-run to prove idempotency (no new creations). Tokens: view
   **"Playtest Map"**, pick a clear area, set `ORIGIN` + `PLACE_TOKENS = true`, run again.
4. **Run the checklist** (`EDHA_FOUNDRY_TEST_CHECKLIST.md`, the `# BENCH —` sections):
   - Order: **Engine-wide first** — if **2bA-7** (edit-round-trip) fails, STOP the run and
     report; everything rides on it. Then leylines (White→Blue→Black→Red→Green), deities,
     Heroic. First-ever run: **Red only** (the pilot), end-to-end through the commit.
   - Per row: select the bench PC's token → target via
     `token.setTarget(true, {releaseOthers: true})` → trigger by the row's own verb (sheet
     click for UI rows, `actor.items.getName("X").use()` for mechanics) → read `#chat-log`
     (read_page) + assert actor/status/flag state in the console → screenshot the card.
   - Rows needing combat: create a Combat on the viewed scene, run it, delete it after.
   - Multi-client rows: a second tab as an unused player user MAY displace the Bench cookie
     session — if it does, leave those rows ⚑ for Ben rather than fighting it.
5. **Record (one commit per run):**
   - **PASS (mechanical):** delete the row from the checklist; name it (2b id) in ONE dated
     handoff delta with a one-line evidence note each.
   - **FAIL/PARTIAL:** row stays, append a dated inline observation; afterwards run the
     batch through the **test-pass-fixes** skill (root-cause, never symptom-patch mid-run).
   - **Feel/design/canvas-precision rows:** leave ⚑, untouched — they are Ben's.
   - Rebuild the dashboard (`node scripts/build-dashboard.js`), run the gates (`python`, not
     `python3`; never `;`-chain), commit: `Bench run N (<tree>): X retired on evidence,
     Y fails -> test-pass-fixes`. Push.
6. **Sweep:** compare start/end document-id snapshots (actors/scenes/combats/walls); anything
   changed outside the bench folders goes in the delta, prominently. Note for Ben that bench
   chat can be flushed.

## Known traps

- Ben's client shares the world live — token moves and chat are visible to him. Fine; just
  don't touch what isn't yours (rule 1/4).
- The "Bench Target — Undefended" fixture must actually read as HAVING NO Cognitive/Spiritual
  defense for the fail-open rows (2bH-11/2bJ-5/2bF-6); if the engine reads schema defaults,
  import a pack adversary that genuinely lacks them and update the runbook.
- Formulas scale off the ACTOR: bench PCs are level 7, colors rank 3 — if a row's expected
  number assumes different stats, compute the expectation from the actor before calling FAIL.
- A row that fails may be YOUR setup, not the talent — re-read the row's "do" verb (targeted
  first? in range? correct damage type?) before recording anything.
