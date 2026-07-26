# EDHA Bench Runbook — the agent-driven bench (2026-07-26)

How a Claude session runs the in-Foundry bench itself, through the in-app browser at
`http://localhost:30000`, instead of leaving every row for Ben. Approved by Ben 2026-07-26
("Could you take control of the PC and do the Foundry tests yourself?" — yes, via browser).
Sessions still **cannot launch Foundry** — everything here requires Ben to have it running.

## One-time setup (Ben) — ✅ DONE and join-verified 2026-07-26

- Foundry running on port 30000 with the **edha** world launched.
- A **Gamemaster user named `Bench`** exists with a **BLANK password** (the agent is not
  permitted to type passwords into login fields, ever, even user-supplied ones). Verified: a
  passwordless join as Bench reached the world, GM true, edha-content active, system 2.1.0.
- Ben stays logged in as himself (a user's session is single-login; the dedicated user exists
  so the agent never collides with Ben's). Ben can watch everything live.

## Ben's standing rulings (2026-07-26)

- **Scene:** use the EXISTING **"Playtest Map"** scene (it is the active scene — view it,
  never activate/deactivate). Do NOT create a bench scene. The setup script places tokens
  only when its `PLACE_TOKENS` flag is set, offset from an `ORIGIN` you choose after looking
  at the map for a clear area.
- **Player characters "Tem parinaem" and "Soggy Bottom" are UNTOUCHABLE** — never write to
  them, never target-and-fire effects that write to them, never delete their tokens. The
  setup script hard-throws on their names.

**The next run's paste-ready prompt lives in `docs/BENCH_NEXT_RUN.md`** — each run ends by
rewriting that file for the run after it (run 1 → run 2 = White+Blue, run 3 = Black+Green,
then the deities, Heroic, and the non-tree console-runnable sections).

## Per-run checklist (the agent)

1. **Join:** browser pane → `http://localhost:30000/join` → select **Bench** → Join (no
   password). If Bench shows as already active, STOP and ask Ben to free the session.
2. **Health check** (console via javascript_tool), screenshot as the run header:
   `game.world.id === "edha"`, `game.modules.get("edha-content")?.active`, `!!globalThis.edha`,
   `game.system.version`. Mismatch → stop, report.
3. **Setup:** run `scripts/bench-setup-console.js` in the console. Verify the summary log
   (⚠ lines = talents/paths not found — fix the script, don't improvise). Run it a SECOND time
   and confirm idempotency (no new creations). Then **view** "Playtest Map", find a clear
   area, set `ORIGIN` + `PLACE_TOKENS = true`, and run once more to place the bench tokens.
   Never *activate/deactivate* a scene (it yanks every connected client, including Ben's).
4. **Run order:** `BENCH — Engine-wide` first — if **2bA-7** (the edit-round-trip) fails, stop
   the whole run and report; everything rides on it. Then White → Blue → Black → Red → Green,
   the ten deities, Heroic, then whatever non-tree sections are console-runnable.
5. **Per row:** select the section's bench PC token → target via
   `game.user.targets` API (`token.setTarget(true, {releaseOthers: true})`) → trigger by the
   row's own verb (sheet click for UI rows; `actor.items.getName("X").use()` for mechanics) →
   read the outcome off `#chat-log` (read_page) + assert actor/status state in the console →
   screenshot the card for evidence. Combat-timing rows: create a Combat on the bench scene,
   run it, and **delete that combat afterward**.
6. **Multi-client rows:** a second browser tab as an unused *player* user MAY displace the
   Bench cookie session. If it does: run those rows as a separate player-phase (rejoin as
   Bench after), or leave them ⚑ for Ben's two-client bench. Never join as a user Ben uses.
7. **Recording (per run, one commit):**
   - **PASS (mechanical):** the row is retired — deleted from `EDHA_FOUNDRY_TEST_CHECKLIST.md`
     and named (with its 2b id) in that run's single dated handoff delta, one line of evidence
     each ("card text quoted / status applied and expired / screenshot in session transcript").
   - **FAIL / PARTIAL:** the row stays open with a dated inline observation appended; the
     batch becomes the next `test-pass-fixes` input. Do NOT symptom-patch mid-run.
   - **Feel/design rows, canvas-precision rows** (template placement feel, vision nuance),
     and anything needing Ben's judgment stay ⚑ untouched for Ben.
   - Then: rebuild the dashboard, run the gates, commit (`Bench run N (<tree>): X retired on
     evidence, Y fails -> test-pass-fixes`).
8. **Safety rules (hard):**
   - Only create/modify inside the "Edha Bench" folders. Adversaries needed as targets are
     imported FRESH from the pack into the bench folder — never Ben's placed campaign tokens.
   - No deletion of any pre-existing document; the only combats deleted are bench-created.
   - No world-settings changes, no scene activation, DEPLOY STATE untouched (agent findings
     go in the delta; only Ben advances DEPLOY STATE).
   - Chat spam is accepted (Ben's call, 07-26); end the run noting Ben may flush bench chat.
   - Before/after sweep: snapshot document ids (actors/scenes/combats/macros) at run start and
     end; anything outside the bench folders changed = report it in the delta, prominently.
9. **Pilot rule:** the first run executes ONE tree (Red — smallest live surface, the
   migration's pipe-cleaner talents) end-to-end through recording, delta, dashboard, commit —
   then scale to multi-tree runs.

## Operating lessons from run 1 (2026-07-26h — read before driving Foundry)

- **Combat rows: `game.combat` is the client's VIEWED combat, not the active one.** After
  `Combat.create({active: true})`, call `ui.combat.initialize({combat, render: true})` and
  verify `game.combat.id` matches — otherwise every fast/slow read and watch round-key silently
  consults whatever combat the tracker was already viewing (Ben usually has a campaign combat
  open; this masqueraded as a Breaking Point "stale tally / never re-arms" bug for half of
  run 1). Never modify Ben's combat; only view yours.
- **Foundry v13 selectors:** there is no `#chat-log` — read `ol.chat-log` (step 5's `#chat-log`
  is v12 phrasing).
- **Hidden-pane animation freeze:** when the browser pane isn't displayed, the PIXI ticker never
  runs, so token moves hang mid-animation on the agent's client (document `_source` is correct;
  prepared x/y is stale). Move with `tokDoc.update({x, y}, {animate: false})` and call
  `tokDoc.reset()` after; verify `tok.object.center` before any range-dependent row. Screenshots
  are also unavailable in that state — record quoted card text + console-asserted state instead,
  and say so in the delta.
- **`item.use()` blocks on the ItemConsumeDialog** (cost confirmation): await ~2s, then click
  the dialog's `[data-action=continue]` button via DOM. Damage cards apply via their
  `[data-action=apply-damage]` buttons — the ×1 button applies to the card's stored targets.
- **Path grants auto-open PathItemSheet windows** (one per bench PC on creation) — close them
  (`foundry.applications.instances`) before DOM work.
- **Resource top-ups:** `system.resources.*.max` is a `{derived, override, useOverride, bonus}`
  object — compute the effective max; never write the object back as a value. Prepared
  Investiture on the synthetic bench PCs clamps below the override (cosmetic; refill by writing
  the source value).
- **On-hit rows need an IMPACT and an ENERGY weapon** and the compendium sweep only found keen
  ones — copy the found weapon, swap `system.damage.type`, and delete the copy at cleanup
  (run 1's "Bench Maul" pattern) until the setup script grows damage-type fixtures.
- **The Playtest Map is walled and busy** — pick ORIGIN analytically (per-cell wall+token scan;
  run 1 used (2100, 9000): PC column parked in the far-left corridor col 7, targets inside the
  lower-left room cols 9–16, Isolated at (31, 31)) and move the ACTIVE tree's PC into the room
  for its rows. The scene also carries a Ben-made teleport Region — keep bench tokens out of it.

## Known limits

- The `Bench Target — Undefended` fixture is adversary-typed with only a Physical defense; if
  the engine reads schema defaults as "written" Cognitive/Spiritual, import a pack adversary
  that genuinely lacks them and note it here.
- Wall/vision rows: the Playtest Map has its own walls — use an existing wall where one is
  handy; if a temporary wall must be drawn, delete THAT wall afterward (bench-created, so
  deletion is allowed) and never touch the map's own walls.
- Rows needing a linked PLAYER client (belief loops, whisper visibility) follow §6; when the
  cookie displacement bites, they are ⚑ Ben rows.
