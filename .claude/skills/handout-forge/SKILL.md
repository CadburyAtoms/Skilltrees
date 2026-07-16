---
name: handout-forge
description: Build player-facing handouts (session-zero sheets, primers, reference cards) as designed PDFs in the Skilltrees repo. Use whenever Ben asks for a handout, one-pager, player sheet, printable, "something to give the players", or a redesign of an existing handout ("make a session-zero PDF", "the primer is too much, give me one page", "this needs design work", "make it readable"). Drives the full loop — frame the audience & the reader's deliverable → query the live Foundry data (never write mechanics from memory) → design plan on the house identity → HTML built with Write/Edit only → Chrome-headless render → verify EVERY page's last element survived (screenshot + text extraction, both with known traps) → deliver to the repo folder + SendUserFile → iterate on Ben's design bar. The worked example is EDHA_CAMPAIGN_ONE_PAGER.html/.pdf (built 2026-07-15).
---

# Handout-forge — from "give the players something" to a PDF Ben can print

This skill encodes the workflow that produced `EDHA_CAMPAIGN_ONE_PAGER.pdf` (the two-page
session-zero sheet) and `EDHA_PLAYER_PRIMER.html`. Every rule below was earned by a real
failure during that build:

- **Delivered to nowhere.** The first version went out as a claude.ai artifact only — the page
  didn't load for Ben and nothing existed in the repo folder. Handouts are FILES in the
  Skilltrees folder, sent with SendUserFile; a hosted link is at most a bonus.
- **Invented flavor rejected.** Hand-written "flavor lines" for the leyline colors drifted from
  the real trees and Ben bounced them. Every mechanical claim and every flavor line derives
  from the data (Key talents, specialty names, prereqs) — see Phase 1.
- **Wrong altitude for the moment.** The full primer is great backstory but "session 0 when
  they're learning the entire system, that's too much." A handout is defined by the moment
  it's used and by what the reader must DO afterward — not by how much true lore fits.
- **The blob.** Uniform text weight ("eyes don't know where to look") until the page got
  zones, pills, tables, and ONE loud block.
- **The deliverable whispered.** "The most important thing on the pdf is the very last thing
  on it … It HAS to pull the reader's attention. It has their deliverable in it."
- **Silent clipping, four times.** Fixed-height sheets (`overflow: hidden`) ate the footer,
  the turn pointer, the last table rows, and the closing paragraph — each render looked
  "done" until checked. Phase 4's verification exists because of this.
- **Tooling traps** (each cost a cycle): PowerShell 5.1 mangled the HTML's UTF-8; pypdf raced
  Chrome's file flush and reported 1 page for a 2-page PDF; text-extraction checks failed on
  the `fi` ligature and on `text-transform: uppercase`; and estimating layout heights instead
  of looking at a screenshot burned three fit passes.

The deliverable is a PDF **plus its HTML source, committed together** — the source is the
regeneration path; a PDF alone is a dead end for the next session.

Phases run in order.

---

## Phase 0 — Frame it (audience, moment, spoiler wall, the reader's deliverable)

Before any content, write down four answers (one line each):

1. **Who reads it, and when?** ("Players, handed out 1–2 weeks before session zero.") The
   moment sets the altitude: a pre-session-zero sheet teaches choices; a table reference
   teaches procedure; a primer teaches world.
2. **What must the reader DO after reading?** This is the handout's deliverable, and it goes
   in the LAST block on the LAST page, styled as the single most attention-pulling element
   (see Phase 2). If there's no deliverable, question whether the handout is needed.
3. **Spoiler wall.** Player-safe sources ONLY: `EDHA_PLAYER_PRIMER.md` (already
   spoiler-checked), canon's explicitly player-safe sections, and the talent data itself.
   Cross-check against the current session script's do-NOT-reveal list. Meta statements about
   the campaign's shape ("finding out what is wrong with the world IS the campaign") are fine;
   causes are not. When in doubt, it stays out.
4. **Page budget.** Ask or decide explicitly, and treat it as hard: A4, N pages. Readability
   outranks completeness — when Ben said "one page isn't enough," the fix was a second page,
   not smaller text. If content and budget fight, cut content or raise the budget with Ben;
   never shrink below ~9pt body.

## Phase 1 — Query the data (mechanics are never written from memory)

The live data is `data/leyline.json`, `data/cosmere.json` (heroic atlas), `data/domain.json`
(deity trees), `data/deity-resources.json` — plus `data/authored/` for card text. Patterns
that worked (python one-liners via the PowerShell tool):

- **Tree/path inventory:** group by `path`/`Path`/`Deity`, print `specialty`/`Specialty`
  sets. This is how you learn there are 6 heroic paths (Agent, Envoy, Hunter, Leader,
  Scholar, Warrior — the Radiant orders in the same file are NOT for player handouts),
  5 leyline colors × 3 specialties + Key, and 10 deity trees.
- **Prereqs:** read them off the entry talents — every deity entry requires
  `[Color1] 2+; [Color2] 2+` (≈ level 4 in play). Print the actual strings; don't trust
  memory ("two ranks in each color" needed the data to pin down *which* colors).
- **Flavor lines:** derive from the tree's Key talent + talent names. Hunter's "mark one
  quarry — track it, study it, end it" is Seek Quarry; White's "your mana mends the line" is
  its Attunement literally healing allies on Draw Mana. If no clean derivation exists, use
  bare specialty names — Ben's explicit fallback. NEVER free-invent (that's how "entropy,
  isolation, dominion" shipped for a color whose real specialties are Isolation ·
  Subjugation · Ritual).
- Field-name gotchas: leyline.json is lowercase (`path`, `specialty`, `description`);
  cosmere.json is capitalized (`Path`, `Specialty`); domain.json uses `Deity`, `Colors`,
  `Prerequisites`, `Talent Name`.

Anything the data can't answer (level math, table rulings) gets stated with a hedge ("~level
4") or asked — never asserted.

## Phase 2 — Design plan (the house identity, then ONE bold element)

Write the token plan before HTML. The established Edha handout identity (reuse it; don't
re-derive):

- **Palette:** ink `#232B24` on white; moss accent `#40684E`; lamp gold `#9A6E2A` (mystery
  hooks + attention accents); panel `#EEF0E7`; callout `#F5F2E7`; hairlines `#C7CDBB`.
  Leyline colors: White `#AEB4A6`, Blue `#4A6E8F`, Black `#3B3542`, Red `#9C4432`, Green
  `#4A7042` — used SEMANTICALLY (a card's top border, a deity's two-color swatch), never as
  decoration.
- **Type:** Palatino stack (`'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif`).
  Body ≥9pt (≥10pt where the budget allows — "an enjoyable read, not one they finish out of
  obligation"). Letterspaced uppercase for eyebrows/labels only.
- **Structure is information:** numbered zone headers (circled numeral + small-caps title +
  italic subtitle + rule) when the zones have a real reading order; pill tags when tiers have
  real rules (`EVERYONE` / `PICK UP TO ONE` / `~LEVEL 4`); ruled tables for anything the
  reader will scan by row (ten nations as prose blocks was "very hard to read"). Subtitles
  match register across zones (one descriptive phrase each — "read this aloud" got bounced
  for breaking pattern).
- **Balance page space by how much Ben cares**, not by word count — leylines get the same
  card treatment as heroic paths ("I worked hard on those leylines, give them some love").
  Color pips must be legible at arm's length (≥3.4mm dots; 6×3mm two-color swatches for
  deity pairs).
- **Exactly one inverted block per document**: the reader's deliverable (solid `#40684E`,
  cream text, gold label + checkbox squares). Everything else stays ink-on-paper so this is
  where the eye lands. If page 1 exists apart from it, page 1's footer points at it.

## Phase 3 — Build (HTML skeleton + the editing rule)

- One `<div class="sheet">` per page: `width: 210mm; height: 296mm; overflow: hidden;
  display: flex; flex-direction: column;` with `page-break-after: always` on all but the
  last, `@page { size: A4; margin: 0; }`, and `-webkit-print-color-adjust: exact` on body.
  296mm (not 297) avoids rounding spill. `margin-top: auto` pins the last block to the page
  bottom — and is also why clipping is silent: an overflowing page pushes it out of the
  hidden region instead of erroring.
- Per-page spacing overrides via a page class (`.p1 { gap: 6.4mm }`) so a sparse page
  breathes instead of pooling whitespace above its pinned footer.
- **Edit the HTML with the Write/Edit tools ONLY.** PowerShell 5.1 `Get-Content`/`Set-Content`
  reads BOM-less UTF-8 as CP-1252 and writes mojibake (every em-dash became `â€”` in one
  regex pass). PowerShell is for running Chrome/python, never for touching the file.
- Source lives in the repo next to its PDF (e.g. `EDHA_CAMPAIGN_ONE_PAGER.html` →
  `EDHA_CAMPAIGN_ONE_PAGER.pdf`), scratch copies are fine during iteration but the committed
  pair is the artifact.

## Phase 4 — Render + verify (the loop that catches silent clipping)

Render both artifacts every cycle (Chrome path: `C:\Program Files\Google\Chrome\Application\chrome.exe`):

```powershell
& $chrome --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$out" $srcUrl
& $chrome --headless --disable-gpu --window-size=794,<1123 × pages> --screenshot="$shot" $srcUrl
Start-Sleep -Milliseconds 800   # pypdf races Chrome's flush; without this it read 1 page of a 2-page PDF
```

Then verify — ALL of these, every cycle:

1. **Page count** via pypdf equals the budget.
2. **The last element of EVERY page** is present. Text-extraction traps: `text-transform:
   uppercase` extracts as UPPERCASE (match case-insensitively), and ligatures break substring
   checks (`find` extracts as `ﬁnd` — pick check-words without fi/fl, e.g. match "trees"
   not "find the trees"). A failed check can be a false negative — confirm against the
   screenshot before "fixing".
3. **LOOK at the tall screenshot** (Read the PNG). This is the step that actually catches
   layout problems: clipped blocks, wrapped headers that should be one line, unbalanced
   columns, whitespace pooling. Do not estimate heights arithmetically — three fit passes
   were wasted on estimates that one screenshot settled.
4. When a page overflows: trim words (filler adjectives, not facts), tighten the spacing
   scale, or move a section to the next page — in that order of preference. Shrinking fonts
   is the last resort and never below the Phase 0 floor.

## Phase 5 — Deliver

- Copy the PDF into the Skilltrees folder (canonical copy) and send it with
  `SendUserFile` (`display: render`). Say exactly what was verified ("2 pages, both
  screenshots checked, last block present on each").
- If a delivery seems stale to Ben ("I see the pre-fix version"), don't rebuild — hash the
  deployed file against the fresh render and extract the changed text from the deployed PDF.
  Same-name chat cards and OneDrive sync lag both present as "old version"; prove which copy
  is current instead of thrashing.

## Phase 6 — Iterate on Ben's design bar

Feedback arrives as reader experience ("eyes don't know where to look", "hard to read",
"doesn't pull attention"). Translate to mechanism — hierarchy, size, contrast, structure —
and fix the mechanism; don't just nudge the named element. Standing rulings from the
2026-07-15 build (apply without re-asking):

- Session-zero framing: ONE talent budget across all atlases; players bring **a nation, a
  reason they left home, and the character they want to play** — a fantasy, not filled
  slots ("I want to shoot bows and make clones and come from the wasteland" = a Blue Hunter
  out of Ashkar). Leylines are "pick up to one" at session zero; deity paths open ~level 4
  (2 ranks in each of the god's two colors).
- Headline claims must be literally true ("the whole campaign in the time it takes to
  shuffle dice" was neither).
- No orphan sections: a zone that only restates rates/frequencies gets folded into the zone
  it supports.

## Phase 7 — Close-out

- Commit the HTML source + PDF together; small themed commits; state "docs/handout only —
  NO engine change, NO pack rebuild, nothing for the bench" where true.
- Run the repo gates before committing (they're cheap and CI runs them anyway).
- Dated delta at the top of `EDHA_FOUNDRY_HANDOFF.md`; new-content approval follows the
  lore gate — handout text drawn from the player primer and talent data is pre-approved
  ground; NEW invented world-content still waits for Ben's yes before it ships.
