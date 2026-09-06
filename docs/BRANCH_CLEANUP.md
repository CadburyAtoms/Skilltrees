# Branch cleanup — what can be deleted, with the evidence (2026-09-05)

Written for Ben. **66 remote branches besides `main`.** Verdicts: **62 SAFE to delete**,
**2 for your decision**, **2 KEEP** (they are the only copy of work that queued items re-land).

## Why the list is trustworthy

Main's history was **restarted on 2026-07-28** (root commit `aed1a76`, 103 commits since). Every branch
older than that has **no merge base** with today's main, so GitHub can never merge it and "compare"
shows hundreds of phantom commits — that is why they looked scary. The classification below was
computed, not remembered:

1. **Merge base with main?** Yes → count commits ahead. 0 ahead = merged.
2. **No merge base** → find the pre-restart main (its last tip is `bench-run-20`, `ef716f4`, 2026-07-28,
   which contains 38 of the 56 orphaned tips). A branch whose tip is inside it was **merged before the
   restart** and its work is in the 07-28 snapshot that today's main grew from.
3. **Tip not inside the pre-restart main** → `git cherry` against it (finds squash-merged patches), then
   the branch's own files and delta names were looked up on today's main. The evidence is in the table.

The 18 MB Stormlight PDF (item 2) is unreachable from `main` already; it survives **only** through the
orphaned branches. Deleting them is the history purge. Afterwards: a fresh clone (item 32) or
`git fetch --prune && git gc --prune=now` in the old one; GitHub clears its server copy on its own GC.

## KEEP — source for a queued item (2)

| Branch | Last commit | Why |
|---|---|---|
| `claude/in-app-dashboard-snapshot-ecwudz` | 2026-09-05 `91abcef` | The dashboard-on-the-phone work (Snapshot + Dashboard sections, 743 lines, 3 commits) was **never merged** — it lived only on this branch and on the published artifact. **Item 35** re-lands it; it conflicts with today's `pm-state.js` in five files, so it is a worker's merge, not a click. |
| `claude/section-9h-adversary-items-1c563f` | 2026-07-18 `f6a0435` | PR #103. The only copy of the fleet-weapon migration and the loot caches (chest + body search) — **item 34** re-does them on current main. Deleting this branch auto-closes #103. |

## YOUR CALL (2)

| Branch | Last commit | Why |
|---|---|---|
| `claude/palewater-ford-battle-map-08r3hg` | 2026-07-28 `4208a2e` | One docs-only commit (2026-07-28) adding `docs/BATTLEMAP_PALEWATER_FORD.md` — a drawing brief for the session-1 Ford map. Session 1 is *built, not played*, so it is probably still wanted. Salvage: `git cherry-pick 4208a2e` onto a fresh branch, drop its dashboard/handoff hunks, rebuild. Then delete. |
| `claude/playtest-monitoring-checklist-8lit4b` | 2026-07-09 `59139fa` | One file, `EDHA_PLAYTEST_WATCH.md` (2026-07-09): a glance-sheet for the 07-16 remote-players playtest. That night happened and its four fixes landed (07-17 delta). Nothing on main references it. Recommend delete; keep only if you want the sheet as a template. |

## SAFE to delete (62)

| Branch | Last commit | Why |
|---|---|---|
| `claude/handout-forge-skill` | 2026-07-15 `fbc8e20` | Was KEEP for PR #93; **item 33** re-landed the handout-forge skill and the session-zero one-pager on main (2026-09-05). PR #93 itself is already closed (ruling PM-R10). Safe to delete. |
| `claude/lucid-tu-36ece3` | 2026-05-11 `44f6d9c` | obsolete: same deleted atlas app; 0 unique patches |
| `claude/festive-wu-b4bbb3` | 2026-05-13 `43ae133` | obsolete: edits the React atlas app (`src/`, `index.html`) that was deleted from the repo |
| `claude/hungry-lewin-9def5e` | 2026-05-14 `4166af3` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/color-consistency-review-p8kt4n` | 2026-06-16 `6493261` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `feat/green-leyline-foundry` | 2026-06-16 `9e99566` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/foundry-wiring-destruction-oxj2cu` | 2026-06-17 `658b913` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/life-deity-tree-wiring-ufu3p3` | 2026-06-17 `f442aab` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/chaos-deity-tree-5qizku` | 2026-06-18 `482f628` | superseded: Void Sense ships on main in a different implementation (14 engine hits, no DetectionMode) |
| `claude/civilization-deity-tree-9n3opg` | 2026-06-19 `f37bcce` | superseded by `civilization-deity-tree-u2dab1` (2026-07-02), which is inside the pre-restart main; the Kethane tree is wired |
| `claude/sovereignty-deity-tree-3ubala` | 2026-07-01 `ab6f1fe` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/civilization-deity-tree-u2dab1` | 2026-07-02 `cb9175b` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/death-deity-tree-wiring-ppmw8k` | 2026-07-02 `f67b0d4` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/power-tyrith-tree-wiring-fdzda6` | 2026-07-02 `b37e6df` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/engine-backlog-consolidation-mq60a1` | 2026-07-03 `d76833c` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/gnothis-knowledge-tree-nglb4l` | 2026-07-03 `9b7bffe` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/order-tessavain-tree-wiring` | 2026-07-03 `443d189` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/backlog-code-review-eda1kv` | 2026-07-04 `8af3779` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/leyline-atlas-cleanup-3yozb0` | 2026-07-06 `21bef2d` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/repo-review-assessment-4xlk98` | 2026-07-06 `3a93aee` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/playtest-talent-verify-16paf1` | 2026-07-09 `6e091f3` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/black-test-pass-fixes` | 2026-07-12 `3dfeb84` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/capture-0705-engine-plus-test-tracer` | 2026-07-12 `bcc2dc5` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/art-format-jpg-default` | 2026-07-15 `03291ab` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/playtest-bugs-fixes-v7qime` | 2026-07-17 `407617f` | content on main: the 2026-07-17 PLAYTEST-2 FIXES delta; Decisive Command in the engine ×7 |
| `claude/adversary-actor-sync-c4064c` | 2026-07-18 `091e1a6` | content on main: the adversary pack-sync (⟳ Sync Adversaries from Pack) is in the handoff ×3 and the deploy flow |
| `claude/blocking-todo-item-61nefu` | 2026-07-18 `ebeb423` | content on main: the 2026-07-18j delta; `data/items.json` carries the re-priced c/s/g items (191 price fields) |
| `claude/character-creation-menu-8gwpud` | 2026-07-18 `351339f` | content on main: the 2026-07-18l delta; `edhaCreatorWindow` in the engine |
| `claude/checklist-consolidation-c4064c` | 2026-07-18 `570b1c8` | every patch is already in the pre-restart main (squash-merged; `git cherry` finds 0 unique) |
| `claude/country-origin-culture-items-gepc1f` | 2026-07-18 `f288273` | content on main: the 2026-07-18k delta; `data/cultures.json` |
| `claude/lunavar-worldbuilding-k6xfbo` | 2026-07-19 `dd68815` | content on main: “closes the Lunavar pass end to end: rulings 62–70” (handoff); Moonmere/Fenholt in canon ×24 |
| `claude/malcurr-lore-forge-ldlngq` | 2026-07-19 `3898603` | content on main: the MALCURR DIVE deltas ×4; rulings 71–80 in canon |
| `claude/pr-115-adversaries-schema-4sbx4v` | 2026-07-19 `9693e39` | content on main: the 2026-07-19n delta; `edha-ambush-belief` in the engine |
| `claude/review-pr-111-b4stot` | 2026-07-19 `0e33c4c` | every patch is already in the pre-restart main (0 unique) |
| `claude/canticle-lore-forge-analysis-xa49x5` | 2026-07-20 `afe9d68` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/cloud-container-deployment-status-xgcfge` | 2026-07-20 `fe5fb02` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/map-changes-impact-wcbqrs` | 2026-07-20 `0397d75` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/vorsk-lore-pass-nky16q` | 2026-07-21 `448b68b` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/kettavar-lore-pass-i3ypy6` | 2026-07-22 `d299433` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/thalendor-region-map-cities-qm124m` | 2026-07-22 `83f0c4b` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/thycross-watershed-hydrology-rdag69` | 2026-07-23 `09fa557` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/foundry-edha-review-qfmjg1` | 2026-07-24 `731879d` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-h8` | 2026-07-24 `93bbdb9` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-migration` | 2026-07-24 `2622c77` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-migration-4bcb91` | 2026-07-24 `d510880` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-migration-a3hr0x` | 2026-07-24 `42342a4` | content on main: `EDHA_RULE_2B_CLASSIFICATION.json` (the 221-talent classification) |
| `claude/rule-2b-u` | 2026-07-25 `c658bfb` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-v-17esrq` | 2026-07-25 `7dc9781` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-w` | 2026-07-25 `244414d` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-h3-8a3076` | 2026-07-26 `322684c` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-y` | 2026-07-26 `8311d63` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-z` | 2026-07-26 `7090a9a` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/heroic-and-tooling` | 2026-07-27 `fae602e` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/rule-2b-audit` | 2026-07-27 `a4de855` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `bench-run-20` | 2026-07-28 `ef716f4` | tip is inside the pre-restart main — merged before the 2026-07-28 restart |
| `claude/mobile-project-dashboard-7kkbuk` | 2026-09-04 `f828224` | merged into today's main (0 commits ahead) |
| `claude/weekend-status-repo-migration-b6w4it` | 2026-09-05 `caed573` | merged into today's main (0 commits ahead) |
| `pm/31-mobile-board-windows` | 2026-09-05 `651df98` | merged into today's main (0 commits ahead) |
| `pm/board-2026-09-05-handoff` | 2026-09-05 `9bb7016` | merged into today's main (0 commits ahead) |
| `pm/board-row-wrap` | 2026-09-05 `942948a` | merged into today's main (0 commits ahead) |
| `pm/deploy-bat-readonly-prompt` | 2026-09-05 `de4c7ce` | merged into today's main (0 commits ahead) |
| `pm/fix-pass-2-run26` | 2026-09-05 `6e363c8` | merged into today's main (0 commits ahead) |

## The commands

From any terminal in the repo (Git Bash, cmd, or PowerShell — all three accept this form). Each
line is one batch; a branch that is already gone just prints “remote ref does not exist” and the
rest of the batch still deletes. **The KEEP and YOUR CALL branches are not in these lines.**

```
git push origin --delete claude/lucid-tu-36ece3 claude/festive-wu-b4bbb3 claude/hungry-lewin-9def5e claude/color-consistency-review-p8kt4n feat/green-leyline-foundry claude/foundry-wiring-destruction-oxj2cu claude/life-deity-tree-wiring-ufu3p3 claude/chaos-deity-tree-5qizku claude/civilization-deity-tree-9n3opg claude/sovereignty-deity-tree-3ubala claude/civilization-deity-tree-u2dab1 claude/death-deity-tree-wiring-ppmw8k

git push origin --delete claude/power-tyrith-tree-wiring-fdzda6 claude/engine-backlog-consolidation-mq60a1 claude/gnothis-knowledge-tree-nglb4l claude/order-tessavain-tree-wiring claude/backlog-code-review-eda1kv claude/leyline-atlas-cleanup-3yozb0 claude/repo-review-assessment-4xlk98 claude/playtest-talent-verify-16paf1 claude/black-test-pass-fixes claude/capture-0705-engine-plus-test-tracer claude/art-format-jpg-default claude/playtest-bugs-fixes-v7qime

git push origin --delete claude/adversary-actor-sync-c4064c claude/blocking-todo-item-61nefu claude/character-creation-menu-8gwpud claude/checklist-consolidation-c4064c claude/country-origin-culture-items-gepc1f claude/lunavar-worldbuilding-k6xfbo claude/malcurr-lore-forge-ldlngq claude/pr-115-adversaries-schema-4sbx4v claude/review-pr-111-b4stot claude/canticle-lore-forge-analysis-xa49x5 claude/cloud-container-deployment-status-xgcfge claude/map-changes-impact-wcbqrs

git push origin --delete claude/vorsk-lore-pass-nky16q claude/kettavar-lore-pass-i3ypy6 claude/thalendor-region-map-cities-qm124m claude/thycross-watershed-hydrology-rdag69 claude/foundry-edha-review-qfmjg1 claude/rule-2b-h8 claude/rule-2b-migration claude/rule-2b-migration-4bcb91 claude/rule-2b-migration-a3hr0x claude/rule-2b-u claude/rule-2b-v-17esrq claude/rule-2b-w

git push origin --delete claude/rule-2b-h3-8a3076 claude/rule-2b-y claude/rule-2b-z claude/heroic-and-tooling claude/rule-2b-audit bench-run-20 claude/mobile-project-dashboard-7kkbuk claude/weekend-status-repo-migration-b6w4it pm/31-mobile-board-windows pm/board-2026-09-05-handoff pm/board-row-wrap pm/deploy-bat-readonly-prompt

git push origin --delete pm/fix-pass-2-run26 claude/handout-forge-skill
```

GitHub's *Branches* page (`…/Skilltrees/branches/stale`) works too, one click each. PR #93 is
already closed (ruling PM-R10, item 33 re-landed its content). After deleting, PR #103 stays
open until you close it or delete its KEEP branch once item 34 has landed.

*Generated by the 2026-09-05 PM session from `git` on the repo's own refs; `docs/BRANCH_CLEANUP.md` is the tracked copy.*
