#!/usr/bin/env node
/* scripts/lib/changelog-rules.js — the changelog "shape" shared by the gate and the generator
 * (TODO_REPO_HYGIENE item 102).
 *
 * WHY THIS EXISTS. Item 100 (PR #311, 2026-09-08) hand-edited every `docs/handoff-changelog/
 * 2026-MM.md` and `README.md` to put exactly one blank line between the marker and the first
 * delta heading, and added a rule sentence about it to both files' prose — but never taught
 * `scripts/handoff-split.js`'s templates the same thing. Its `monthHeader()` / `readmeText()`
 * kept their own copy of the marker literal and their own (now stale) prose, so the very next
 * re-run — the next delta that lands in `EDHA_FOUNDRY_HANDOFF.md` by mistake, or a new month
 * starting — would have silently reverted item 100's fix and failed `lint-changelog.js` on the
 * result. `scripts/lint-changelog.js` also kept its own separate copy of the marker literal.
 *
 * Both scripts require this file instead of hard-coding their own copy, so the marker string and
 * the rule prose live in exactly one place and cannot drift apart from each other again:
 *   - `lint-changelog.js` uses MARKER to find the line it gates.
 *   - `handoff-split.js` uses MARKER plus the rule-line arrays to build the exact text that
 *     satisfies that gate, every time it regenerates a month file or the README.
 *
 * The two line arrays below are byte-identical to what ships in the real files today (verified
 * by the idempotence proof in the item-102 PR body: `node scripts/handoff-split.js` produces no
 * diff on this repo). `tests/handoff-split.test.js` pins a fixture against both.
 */
"use strict";

// The literal marker line. Every month file carries exactly one; the required blank line and the
// first delta heading sit directly below it.
const MARKER = "<!-- handoff-split: dated deltas begin below this line, verbatim, newest first -->";

// The rule bullet item 100 added to every month file's list, inserted verbatim between the
// "A new delta goes at the TOP..." bullet and the "Finding a delta's original commit..." bullet.
const MONTH_INSERT_RULE_LINES = [
  "- **Insert it as heading, body, blank line** — directly under the marker's blank line; the",
  "  heading that was first stays untouched. Exactly one blank line sits between the marker and the",
  "  first heading. **Adding a delta also means +1 to this file's header count (and its date range)",
  "  and to its row in `README.md`** — `scripts/lint-changelog.js` fails otherwise.",
];

// The README's own phrasing of the "Rule (iron rule 5)" paragraph, worded for a paragraph rather
// than a bullet list, as item 100 wrote it into docs/handoff-changelog/README.md.
const README_RULE_LINES = [
  "**Rule (iron rule 5):** a new delta goes at the TOP of the current month's file, directly under",
  "its marker line — never into `EDHA_FOUNDRY_HANDOFF.md`, which is now the cold-start REFERENCE",
  "alone (what is true today). Insert it as heading, body, blank line — directly under the marker's",
  "own blank line; the heading that was first stays untouched (exactly one blank line sits between",
  "the marker and the first heading, checked by `scripts/lint-changelog.js`, item 100). A new delta",
  "also bumps the count and date range in the month file's header line AND in the table below — the",
  "same gate compares both to the real heading count. A delta's",
  'original commit: `git log -S"<delta title>" --',
  "EDHA_FOUNDRY_HANDOFF.md` (`--follow` cannot track a block that left a file that still exists).",
];

module.exports = { MARKER, MONTH_INSERT_RULE_LINES, README_RULE_LINES };
