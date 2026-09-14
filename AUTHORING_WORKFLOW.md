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
  edha-deity: 1 talent(s) with un-extracted CONTENT edits
    - Withering Touch
    save:  node foundry-extract.js deity
```

Since item 140 (2026-09-14) the same ABORT also fires on a **structural** edit — a tree-node
prerequisite/connection, a talent's folder, or a rename — with a different remedy, because there
is nothing to extract:

```
✗ ABORT — un-extracted Foundry edits would be destroyed by this build (nothing was written):
  edha-deity: 1 structural edit(s) Foundry cannot save
    - Ghostly Walls (prerequisites)
    Structure changes go in the source JSON, full stop — foundry-extract.js does not round-trip this ("The guard" below).
```

So the failure mode that burned you before ("I edit in Foundry, you rebuild, my work is
gone") can't happen silently **for the six authorable fields, or for a talent's name/folder, or
for a tree node's prerequisites/connections** — the builder stops and points you at the fix (or,
for a structural edit, at the fact that there isn't one — see the blind spot below). To
deliberately throw away in-Foundry edits and rebuild from source, pass `--force`
(`deploy-cycle.js`'s equivalent flag is `--force-build`, item 140).

> **⚠️ THE GUARD'S BLIND SPOT — NARROWED 2026-09-14 (item 140; originally documented 2026-07-24).**
> The guard used to compare ONLY `fingerprint(doc)`, computed from the *authorable projection*
> (`img`, `description`, `activation`, `damage`, `events`, `effects`) — a **prerequisite**,
> **connection**, **folder**, or **rename** made in Foundry changed no fingerprint, so the build
> did **not** abort: it reported no un-extracted edits and overwrote the change without a word.
> This is the exact case that bit Ben twice — session 0 (a prerequisite) and again 2026-09-13
> (`Ghostly Walls` / `Adaptive Mutation`, ungated between a ⟳ Sync and an agent-run deploy,
> silently overwritten by that night's rebuild).
>
> **The guard now ALSO fingerprints, per talent, its `name` and `folder`, and, per talent-tree
> node, its `prerequisites` and `connections`** (`structuralOf` / `snapshotDoc` /
> `diffUnextractedEdits` in `scripts/edha-pack-io.js`, shared verbatim by both `foundry-build.js`'s
> own guard and `scripts/deploy-cycle.js`'s PRE-FLIGHT `un-extracted-edits` guard, so the SAME edit
> is caught before Foundry is even closed, not just at the build step). Any of those four changing
> since the last extract/build now ABORTS too, naming the talent and the field.
>
> **What is STILL blind, and why:**
> - **A structural ABORT still has no automatic fix.** `foundry-extract.js` does not, and will
>   not, round-trip prerequisites/connections/folder/name into `data/authored/` — making Foundry
>   the source of truth for structure is exactly what the split table above rejects.
>   **Structure changes go in the source JSON, full stop** — the ABORT message only tells you
>   WHAT to go redo there, same as before item 140.
> - **Node `position`/`size`** (the tree editor's layout) — a GM may legitimately nudge a node
>   without changing what it needs or unlocks; fingerprinting layout would only manufacture false
>   aborts.
> - **`sort`, the `path` item document, and the tree document's `viewBounds`/`background`** — none
>   of those are prerequisites, connections, a talent's name, or its folder; they affect only how
>   the canvas draws, never what a build would silently take away.
> - **The adversaries and items packs** have no baseline/guard concept at all — see their own
>   wiring standards (the W23 pipeline below; `lint-refs.js` pass 5 for adversary abilities).

The guard compares the live pack against a baseline stored **beside the packs it describes**, in
`<module dir>/.baselines/` (moved 2026-07-26c — it used to live in `data/authored/.baselines/`,
shared across every build target, which let a session building into a scratch folder silently
re-stamp the baselines that described YOUR live packs; the first post-migration deploy then
flagged 76 phantom "Foundry edits"). The first build after the move warns "no baseline" once per
pack and proceeds — that is the re-arm. If you ever wipe/move the module, re-arm with
`node scripts/foundry-extract.js baseline`. If a local `data/authored/.baselines/` directory
ever reappears (it's gitignored, so an old machine state can recreate it), it's an orphan from
before the 2026-07-26c move — safe to delete; nothing reads it anymore.

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
     where the call stays yours — or a `noHook` key giving the reason (item 93 / R-89 (a),
     2026-09-07: data, not a prose line — Foundry's editor drops HTML comments on save). A bare
     "GM-run" label fails CI (`lint-refs.js`). The agents write these; what you'll SEE at
     the table is ⏰ cue whispers at thresholds/reactions and auto-applied riders/statuses.
3. **Build:** `node foundry-build.js adversaries` (Foundry closed). A talent ref that
   doesn't resolve is a hard build error. `node validate-adversaries.js` after.
   (`deploy-to-foundry.bat` now includes both.)
4. **In Foundry:** relaunch → the `edha-adversaries` compendium has the folders → drag
   actors to the scene ONCE. After later rebuilds, don't re-drag: click **"⟳ Sync Adversaries
   from Pack"** (Actors sidebar footer, GM — since 07-18b) and every world copy AND its placed
   tokens update in place, keeping position/HP. Renamed copies are treated as customized
   variants and skipped — sync those explicitly from their own sheet's "⟳ Sync from Pack"
   button. Console equivalent: `edha.syncAllAdversaries()`.
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

`data/system-heroic-ids.json` is a tracked snapshot of the cosmere-rpg system's heroic-paths
compendium ids (system talent name → docId) that `foundry-build.js` reads to resolve a prose
prerequisite naming a system talent (e.g. "Composed") to `Compendium.cosmere-rpg.heroic-paths.
Item.<id>` instead of a plain narrative clause. **Re-dump it after a system upgrade** — ids can
change with the compendium — by re-running the console snippet described in the file's own
`_README` against the heroic-paths compendium and overwriting the `heroicIds` map;
`EDHA_HEROIC_IDS` points the build at an alternate path while you're regenerating it.
