# Edha — In-Foundry Authoring Workflow ("the keys")

You can now edit talents **directly in Foundry** and have those edits **persist** across
rebuilds. The builder no longer silently overwrites your work — it refuses to.

## The split

| Layer | Source of truth | How you change it |
|---|---|---|
| **Talent content** — description, activation/cost, damage, Effects, Events, icon | **Foundry** | Edit in Foundry, then `extract` |
| **Structure** — tree node layout, edges, prerequisites, folders, path items, Draw Mana, adversaries | Source JSON (`data/leyline.json`, `domain.json`, `cosmere.json`) + the generator | Edit source, then `build` |
| Talent **name** | Source JSON (the name is woven into ids/edges/links) | Rename in source, then `build` |

So: **effects and wording → Foundry. Shape of the tree → source.**

## The loop (per tree, one tree per session)

1. **Edit in Foundry.** Open the talent, change its description / activation / damage /
   add an Active Effect (Effects tab) / add an Event (Events tab). Save.
2. **Close Foundry** (the packs are locked while it runs).
3. **Save your edits to source:**
   ```
   node scripts/foundry-extract.js <Tree>
   ```
   e.g. `Fate`, `Life`, `White`, `Warrior`. (Also accepts `leyline` / `deity` / `heroic`, or `all`.)
   This writes `data/authored/<atlas>-<tree>.json` — a git-tracked snapshot of that tree's talents.
4. **Rebuild the packs** (overlays your saved edits, which win over the generator):
   ```
   node scripts/foundry-build.js deity      # or leyline / heroic / all
   ```
5. **Commit** `data/authored/` in the skilltrees repo so it's permanent.
6. Relaunch Foundry. On a test character, click **⟳ Sync Talents** (budget bar) or run
   `edha.syncNow()` — talents already on an actor are snapshots and need a re-sync to pick
   up rebuilt data.

You can run `extract` with Foundry **open** (it reads a copy). You only need Foundry
**closed** for `build` (it writes).

## The guard (why your work is safe now)

`foundry-build.js` checks every pack before writing. If you changed a talent in Foundry
and **forgot to extract it**, the build **aborts without touching the packs** and tells you:

```
✗ ABORT — un-extracted Foundry edits would be destroyed by this build (nothing was written):
  edha-deity: 1 talent(s)
    - Withering Touch
    save:  node foundry-extract.js deity
```

So the failure mode that burned you before ("I edit in Foundry, you rebuild, my work is
gone") now **can't happen silently** — the builder stops and points you at the fix. To
deliberately throw away in-Foundry edits and rebuild from source, pass `--force`.

The guard compares the live pack against a per-machine baseline in
`data/authored/.baselines/` (git-ignored). It was armed for all packs on 2026-06-08 via
`node scripts/foundry-extract.js baseline`. If you ever wipe/move the module, re-arm it the
same way.

## Adversaries — the W23 pipeline (script statblock → Actor)

The path an adversary takes to your table, end to end:

1. **Statblock** gets designed/approved (usually in a session script, e.g.
   `EDHA_SESSION_1_SCRIPT.md` §2/§3b).
2. **Entry in `data/adversaries.json`** — schema documented in the file's own `_README`.
   The W23 fields on top of the original stat-line ones:
   - `folder`: which Actor subfolder it lands in (under the "Edha Adversaries" root).
   - `leylines`: attuned colors → skill rank auto-set by role (**minion 1 / rival 2 /
     boss 3**, ruling 40). `skills` overrides, and also carries the block's 2–3 defensive/
     contest skills (never leave those at 0 — opposed PC talents would auto-win).
   - `talents`: tree talents embedded **verbatim** (`"White/Guiding Signal"`). Humans use
     talents as written; animals/monsters get adaptations written as ordinary bespoke
     `items` instead (ruling 40). Talent costs are usually Investiture — give the actor
     an `inv` pool.
   - `events` on bespoke items (**the 07-16 wiring standard**): any ability whose text names
     a trigger ("when…", "first time below…", "on a hit…") ships with event rules — full
     automation where there's no decision to make, a whispered **GM cue card** at minimum
     where the call stays yours — or an explicit `NO NAMEABLE HOOK: <reason>` line. A bare
     "GM-run" label fails CI (`lint-refs.js`). The agents write these; what you'll SEE at
     the table is ⏰ cue whispers at thresholds/reactions and auto-applied riders/statuses.
3. **Build:** `node foundry-build.js adversaries` (Foundry closed). A talent ref that
   doesn't resolve is a hard build error. `node validate-adversaries.js` after.
   (`deploy-to-foundry.bat` now includes both.)
4. **In Foundry:** relaunch → the `edha-adversaries` compendium has the folders → drag
   actors to the scene. Already-placed world copies are snapshots — re-drag after a rebuild
   to pick up changes (there is no ⟳ Sync for adversaries).
5. **Art:** placeholders until you drop files into
   `modules/edha-content/art/adversaries/` — exact filenames per creature in
   `EDHA_ADVERSARY_ART_WISHLIST.md` — then rebuild. The build auto-detects them.

CI guards the data side: `scripts/validate.js` checks every entry's enums, skills ids, and
talent refs on every push.

## Notes & current limits

- **ALL 21 trees are authored (since 2026-06-12).** Every talent's content comes from
  `data/authored/…`, which **wins over the generator AND the side-file tables**
  (`talent-rolls.json`, `talent-triggers.json`, `talent-state.json`, …). A new side-file
  entry for an existing talent is therefore **masked** and does nothing. The side-files are
  bootstrap history now. To change a talent's behavior, either:
  1. **Edit in Foundry** (Events/Effects/Details tabs) → extract → build — the normal loop, or
  2. **Hand-edit `data/authored/<atlas>-<tree>.json` directly** (plain JSON, git-diffable —
     the natural surface for Claude sessions) → build. No extract needed; the build's guard
     only fires on *un-extracted Foundry edits*, which hand edits are not.
- **Custom runtime mechanics** (damage riders, temp HP, summons, bursts, triggered effects,
  status marks/sweeps) are native `system.events` rules on the talent — Events tab, fully
  round-tripped. The generic handlers live in the module's `register-skills.js`. A brand-NEW
  mechanic pattern = a new handler type there (engine work), then a rule on the talent.
- **Active Effect `duration`, `statuses`, and `type` round-trip (since 2026-06-12)** — timed
  buffs and condition-icon effects survive extract. (Projection: `scripts/edha-pack-io.js`
  `authorableEffect`.) Expiry (updated 2026-07-16 — the old "removed by hand" note was stale):
  statuses applied through the engine's timed path (`edhaApplyTimedStatus`, the
  `EDHA_TIMED_STATUSES` auto-stamp set, or a rule's `statusExpire`) carry an `expireAfter`
  stamp and **auto-expire on the combat turn change**. A bare AE that only sets the system
  `duration` field still shows its countdown but is removed by hand.
- If you hit an edge case the tooling can't handle, prompt Claude — that's the cue to add a
  new tool or extend the projection.

## The toolbox (all in `scripts/`, all safe with Foundry open unless noted)

| Tool | What it does |
|---|---|
| `node foundry-extract.js <Tree\|atlas\|all>` | Save in-Foundry edits to `data/authored/` + re-arm the guard |
| `node foundry-build.js <atlas\|all>` | Rebuild packs (**Foundry must be CLOSED**; single scope arg) |
| `node validate-packs.js` | Post-build check: uuids/folders resolve, events+effects counts |
| `node validate-adversaries.js` | Same for the adversary pack incl. baked effect keys |
| `node inspect-pack.js <pack> "<Name>"` or `--group <Tree>` | Print a talent's rules/effects exactly as Foundry loads them |
| `node module-src-sync.js [pull\|push]` | Back up (pull) / restore (push) the module runtime (`register-skills.js`, `module.json`, css, lang) to `module-src/` in this repo — **commit after every engine edit** |
| `deploy-to-foundry.bat` | **The complete deploy button** (double-click with Foundry closed): `git pull` → engine `push` → build leyline+deity+heroic+adversaries → validate (packs + adversaries), on-screen with progress, stops on the first error. Run it before a playtest night whenever there's been work since the last one; then relaunch Foundry + ⟳ Sync. |
| `run-playtest-build.bat` | Build-only subset (deity+heroic build + validate → `scripts/build-log.txt`). **Does NOT push the engine**, so engine-only fixes won't reach the table through this one — prefer `deploy-to-foundry.bat`. |

**Packs live at `modules/edha-content/packs/` — there is no `packs/v3/` anymore** (the 06-11
sandbox split was consolidated 2026-06-12; if you ever see a v3 dir again, something is wrong).
