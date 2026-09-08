# EDHA handoff changelog — index

The dated session deltas that used to sit at the top of `EDHA_FOUNDRY_HANDOFF.md`, one file per
month, newest month first, newest delta first inside each file. Moved verbatim by
`scripts/handoff-split.js` (TODO_REPO_HYGIENE item 19b, ruling PM-R1); this index is regenerated
by the same script — do not hand-edit the table.

**Rule (iron rule 5):** a new delta goes at the TOP of the current month's file, directly under
its marker line — never into `EDHA_FOUNDRY_HANDOFF.md`, which is now the cold-start REFERENCE
alone (what is true today). Insert it as heading, body, blank line — directly under the marker's
own blank line; the heading that was first stays untouched (exactly one blank line sits between
the marker and the first heading, checked by `scripts/lint-changelog.js`, item 100). A new delta
also bumps the count and date range in the month file's header line AND in the table below — the
same gate compares both to the real heading count. A delta's
original commit: `git log -S"<delta title>" --
EDHA_FOUNDRY_HANDOFF.md` (`--follow` cannot track a block that left a file that still exists).

| File | Deltas | Date range |
|---|---|---|
| [`2026-09.md`](2026-09.md) | 116 | 2026-09-04 → 2026-09-08 |
| [`2026-08.md`](2026-08.md) | 1 | 2026-08-10 → 2026-08-10 |
| [`2026-07.md`](2026-07.md) | 42 | 2026-07-01 → 2026-07-28 |
| [`2026-06.md`](2026-06.md) | 18 | 2026-06-11 → 2026-06-17 |

Also here: [`ARCHIVE-header-wall.md`](ARCHIVE-header-wall.md) — the former `HANDOFF_ARCHIVE.md`, the 2026-06-13 → 2026-07-15 one-paragraph "Prior:" summaries that were moved out of the handoff's header wall on 2026-07-06 (item 7). They are condensed duplicates of full deltas in `2026-06.md` / `2026-07.md`, not deltas themselves, so they stay in their own file rather than being bucketed by month.
