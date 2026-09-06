---
name: bench-run
description: Run the EDHA in-Foundry bench YOURSELF through the in-app browser at localhost:30000 — join as the passwordless GM user "Bench", build/repair the bench roster with scripts/bench-setup-console.js, execute the checklist's `# BENCH —` sections row by row, and record results (PASS rows retire on evidence, FAIL/PARTIAL batches feed test-pass-fixes, 🤖 rows are YOUR queue, ⚑ rows are Ben's judgment and you leave them alone). Use whenever the task is to run, continue, or pilot "the bench", test trees in Foundry directly, or verify migration behaviour live. NOT for triaging Ben's own reported results — that is test-pass-fixes.
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
4. **The WHOLE Playtest Map scene is the bench's** (widened 2026-09-06, Ben, phone, via the relay
   session, verbatim: "Feel free to remove that combat — the entire scene is for your use at this
   point" — was "only create/modify inside the 'Edha Bench' actor folders"). Adversary targets are
   still imported fresh from the pack into the bench folder. The zero-combatant combat
   `BerbNeuXp4iKduef` may be deleted by the next run — record it in the run's world diff as
   authorised. Bench-created combats/walls/measured-templates are still yours to clean up and MUST
   be cleaned up when they are NOT part of the licensed scene cleanup above. The two PC actor
   **documents** (Tem parinaem, Soggy Bottom, hard rule 1) keep their hard guard unchanged — only
   their **tokens on the Playtest Map scene** fall under this new licence, never the actor
   documents themselves. (**R-8**, `EDHA_RULINGS.md`) Bench setups keep rosters to the actors
   under test — do not widen a roster beyond what the run's checklist section needs.
5. **DEPLOY STATE is Ben's** — your findings go in the handoff delta, never there.
6. **Snapshot ids, flags AND EFFECTS before creating anything, and delete only what the
   snapshot proves you created.** A run that snapshotted ids and flags but not effects swept
   four pre-existing statuses off Ben's campaign adversaries and could only restore two — the
   log couldn't say which duplicate token had held the rest.
7. **Never resolve a token by NAME when duplicates can exist** — use the id or `actorId`. A run
   grabbed `tokens.find(t => t.name === "Combat Construct")` and moved a year-old orphan
   instead of its own summon.
8. **Only claim what your own logs support, and label inferences as inferences.** A run
   reported an orphan token as cleaned up, was asked how it knew, and had to retract — its
   snapshot had only captured ids. The retraction then had to be chased into two documents
   that had already repeated it.

## The loop

1. **Join:** browser pane → `http://localhost:30000/join` → select user **Bench** → Join
   (leave password empty). "User already active" → ask Ben to free it, don't force.
2. **Health check** (javascript_tool, screenshot it): `game.world.id === "edha"`,
   `game.user.name === "Bench"` + `isGM`, `game.modules.get("edha-content")?.active`,
   `!!globalThis.edha`, `game.system.version`.
2b. **Verify the deploy BY HASH, never by counting markers.** Fetch the served
   `register-skills.js` cache-busted, normalise CRLF→LF, SHA-256 it, and compare against
   `git rev-parse HEAD:module-src/scripts/register-skills.js`'s content. Marker *counts* in a
   handed-down prompt go stale within one run — one run was handed "expect 3" for a symbol
   that had become 4 and would have failed a good deploy. If the hash differs, record the
   affected rows **NOT-DEPLOYED**; never fail a fix's rows against an engine that predates it.
3. **Roster:** paste `scripts/bench-setup-console.js` into the console. Zero ⚠ lines expected
   (⚠ = a talent/path name didn't resolve — fix the script in the repo, commit, don't
   improvise in-world). Re-run to prove idempotency (no new creations). Tokens: view
   **"Playtest Map"**, pick a clear area, set `ORIGIN` + `PLACE_TOKENS = true`, run again.
4. **Run the checklist** (`EDHA_FOUNDRY_TEST_CHECKLIST.md`, the `# BENCH —` sections):
   - **Which rows are yours — this is the whole point of the two markers (split 2026-07-27w):**
     **🤖 = that is your queue. ⚑ = leave it, it is Ben's judgment.** A row with no marker is
     repo-side and settled. ⚑ used to mean "could not self-verify (no Foundry here)", which stopped
     being the same thing as "only Ben can do this" the day this skill existed — a five-run marathon
     skipped ~201 drivable rows on the old wording. **Never re-file a row as ⚑ because you could not
     get to it**; leave it 🤖, or record it BLOCKED with the blocker named.
   - Order: **Engine-wide first** — if **2bA-7** (edit-round-trip) fails, STOP the run and
     report; everything rides on it. Then leylines (White→Blue→Black→Red→Green), deities,
     Heroic. First-ever run: **Red only** (the pilot), end-to-end through the commit.
   - Per row: select the bench PC's token → target via
     `token.setTarget(true, {releaseOthers: true})` → trigger by the row's own verb (sheet
     click for UI rows, `actor.items.getName("X").use()` for mechanics) → read `#chat-log`
     (read_page) + assert actor/status/flag state in the console → screenshot the card.
   - Rows needing combat: create a Combat on the viewed scene, run it, delete it after.
   - Multi-client rows: see the section below.
5. **Record (one commit per run):**
   - **PASS (mechanical):** delete the row from the checklist; name it (2b id) in ONE dated
     handoff delta with a one-line evidence note each.
   - **FAIL/PARTIAL:** row stays, append a dated inline observation; afterwards run the
     batch through the **test-pass-fixes** skill (root-cause, never symptom-patch mid-run).
   - **⚑ rows (feel / design / balance / a ruling):** leave them untouched — they are Ben's
     judgment, not a test you can run. Do **not** convert a 🤖 row you ran out of time for into a ⚑.
   - **A new row you write gets a marker deliberately:** 🤖 if it needs a table and an agent could
     drive it (most of them), ⚑ only if settling it needs a human at the table. A judgment call you
     surface goes to `EDHA_RULINGS.md`, not into the checklist as a test row.
   - Rebuild the dashboard (`node scripts/build-dashboard.js`), run the gates (`python`, not
     `python3`; never `;`-chain), commit: `Bench run N (<tree>): X retired on evidence,
     Y fails -> test-pass-fixes`. Push.
6. **Sweep:** compare start/end document-id snapshots (actors/scenes/combats/walls); anything
   changed outside the bench folders goes in the delta, prominently. Note for Ben that bench
   chat can be flushed.
7. **Log out — always the last in-world act:** `game.logOut()` in the console, then confirm
   the join screen lists Bench as selectable again. Ending a session without this HOLDS the
   Bench slot and the next session cannot join (run 1 did it; Ben had to ask).

## Multi-client rows — the player user is named **`PlayerBench`** (id `yF9LHvfhB7otsHYY`)

Some rows are unprovable from one client because the mechanic is *about* two clients. Ben added a
passwordless player user for exactly this. Two shapes, and they need different setups:

- **Two GM appliers** — "does this fire once or twice when two GMs are connected?" These are already
  provable whenever **Ben's own Gamemaster client is connected**, which it usually is. Apex Form's
  double-injury bug was found *because* two GM clients were live, and its fix was verified the same
  way. Note in the row which clients were connected; a single-client pass proves nothing here.
- **Genuine player-perspective rows** — the illusion belief loop, Covenant's shared icon across two
  owners, Devoted Conduit's two-White staging. These need the player user actually logged in.

Driving the second client (the run-13 recipe — full procedure in `docs/EDHA_BENCH_RUNBOOK.md` §6):
join **`Bench`** in the `seed` tab first, then `tabs_create` → `navigate` to `/join` → select
**`PlayerBench`** → Join with a **blank password**, and drive each tab by its own `tabId`. Never join
as `Gamemaster`, `Amertron`, `Laustarr` or `Spidercam` — those are Ben's and his players'.

- ⚠️ **The new tab opens at 0×0, so its canvas never initialises.** `resize_window` **and then
  reload** — run 10's lesson applies to the second tab too.
- **Verify Bench survived**, from Bench's own socket. **Run 13 measured NO displacement** (Bench +
  Gamemaster + PlayerBench all active at once). Keep this as a caution, not an expectation; if it
  ever does bite, that row is recorded **BLOCKED with the blocker named** rather than being fought —
  it stays 🤖 (a technical blocker is not a judgment call, so it never becomes ⚑).
- **Grant `PlayerBench` OWNER on bench-folder actors only**, snapshot `ownership` first, restore at
  the end.
- **One PC per client is a staging step, not a detail.** If PlayerBench owns many PCs, a belief
  ledger holding both a fooled and a seer observer resolves to "sees through" and you are testing
  the wrong thing. Narrow to a single PC per direction.
- **Log out BOTH clients** at the end. A held player slot blocks the next run exactly like a held
  Bench slot.

The checklist's `🎮 Player-client window` section is the batch to burn down while a player client is
up — do those rows together rather than one per run.

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
- **A row that fails may be YOUR HARNESS.** Weave the Thread was reported as a silent post-cost
  no-op that swallowed 2 Investiture; the picker was rendering the whole time, in the engine's one
  AppV1 window (`div.app.window-app`, no `<dialog>` element), invisible to V2-tuned DOM sampling.
  Before recording "nothing happened", check `ui.notifications` for a live prompt and sample for
  BOTH dialog shapes.
- **The bench roster can be broken in ways no row tests.** `bench-setup-console.js` read a dead
  weapon field for eight runs, so no bench PC had a ranged weapon and every rangedOnly row was
  quietly unrunnable — with only a warning nobody read. Re-run the setup script as a real step, and
  assert the fixtures it claims to have made (e.g. `weapon.system.attack.type === "ranged"`) rather
  than trusting its summary.
- The full operating-lesson list (v13 movement, dialog driving, chat rendering with a hidden pane,
  resource clamps, honest console damage) lives in `docs/EDHA_BENCH_RUNBOOK.md`, newest run first.
  **Read the newest two runs' lessons before driving anything** — they override older advice.
