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

## Notes & current limits

- **Once a tree is authored**, its content comes from `data/authored/…`, not the side-file
  tables (`talent-rolls.json`, `talent-triggers.json`, etc.). Edit that tree in Foundry from
  then on, not the side-files. (Un-authored trees still use the side-files as before.)
- **Custom runtime mechanics** (damage riders, temp HP, summons, AoE templates, triggered
  effects) are emitted as native `system.events` rules on the talent, so they show on the
  **Events tab** and round-trip. The handlers themselves live in `scripts/register-skills.js`.
- **Active Effect duration/type aren't round-tripped yet** — current effects are passive
  transfer buffs (e.g. +Speed). If you need a timed effect, tell Claude and we'll extend the
  projection in `scripts/edha-pack-io.js` (`authorableEffect`).
- If you hit an edge case the tooling can't handle, prompt Claude — that's the cue to add a
  new tool or extend the projection.
