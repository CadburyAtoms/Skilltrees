# Edha Campaign State — the play ledger

**What has HAPPENED, as opposed to what is true.** `EDHA_CAMPAIGN_CANON.md` holds world truth;
this doc holds table truth: what the players know, which threads have moved, how NPCs feel about
the party, and the clocks. Owned by the `.claude/skills/session-forge` (reads first) and
`.claude/skills/session-debrief` (writes after play) workflows. GM truth throughout.

**Status: campaign not yet started.** Session 1 is built and awaiting play
(`EDHA_SESSION_1_SCRIPT.md`).

---

## 1. The party

- **3 players**; builds, origins, and names **unknown** (not yet created). Everything stays
  build-agnostic until this section fills in.
- Location: n/a (session 1 opens at Elmsworth, the head-of-navigation river port, (1290,1470)).

## 1a. Party inventory & wealth

*(Empty — nothing played. `session-debrief` writes this after every session (extraction grid
row 10); `session-forge` reads it when pricing jobs and stocking loot. Division of labor:
mundane kit lives on the Foundry character sheets, THIS section tracks only what a forge run
must know — wealth, story-bearing items, and outstanding payment. Worth stays descriptive —
⚑ no currency canon yet (TODO_WORLDBUILDING W25); re-denominate when the coinage pass lands.)*

- **Wealth:** —
- **Notable items:** — *(gear with a story, a clue, or a mechanic attached — the
  Malcurr-stamped-blade class of object; note who carries it.)*
- **Owed / promised:** — *(payment promised but not delivered, debts, favors with material
  value — session 1's grain-escort pay in food/passage papers lands here if the run ends
  before it's handed over.)*

## 2. What the players KNOW vs. SUSPECT

*(Empty — nothing played. The assembly-rule reveal structure (canon §2) depends on this section
staying precise: **know** = shown on screen or told outright; **suspect** = theorized at the
table. The Fetch reveal must happen in the players' hands, so track both lists verbatim.)*

- **Know:** —
- **Suspect:** —

## 3. Threads

| # | Thread (canon §8) | Status | Last moved | Notes |
|---|---|---|---|---|
| 1 | Gnothis — where; what answers the Warlock | live, untouched | — | Session 1 plants the Malcurr-gear clue (feeds this via the Warlock's funding). |
| 2 | Razkael's location/state | live, untouched | — | Breadcrumb: Commander Isra Vael (Vorsk). |
| 3 | How Morrath was sealed | live, untouched | — | The campaign spine; players don't yet know a god is missing. |
| 4 | Lunavar's moon cult | live, untouched | — | |
| 5 | The Immortal Triplets' silence | live, untouched | — | |
| 6 | Canticle's archives | live, untouched | — | Pre-infiltration Chaos theology; assembly piece. |
| 7 | The Fetch's origin | live, untouched | — | GM-only. |
| 8 | The Black Altar — what it is; first breach | live, untouched | — | Session 1 seeds it via Gramma Ashmark's folklore; act-1 finale site. |

## 4. Clocks

| Clock | Now | Ticks when | Source |
|---|---|---|---|
| **Black Altar soul-pool** | ~2 years filling; nearing FIRST overflow | act-1 finale = first breach; pools everywhere by act 3 | canon §1a |
| **Tyrith's coup** | winding up | act-2 spine; the false-villain arc | canon §2/§3 |
| **Verdannis's Green drain** | ongoing; Thalendor famine acute | until he finds the wound or is stopped | canon §3, ruling 2 |
| **The war / Corvaine raids** | active on the Palewater border | escalates as Malcurr funding continues | canon §5 |
| **The Investiture drain** | generational, background | margins only — whispers, not proof | canon §1a, ruling 16 |

## 5. NPC dispositions

*(None met. Session-1 cast staged in `EDHA_SESSION_1_SCRIPT.md` §1: Marshal Vareth Khor (canon),
⚑ Fenn, Wick, Sgt. Roek, Keeper Harrow, Gramma Ashmark, Elder Joskin.)*

## 6. Session log

| # | Title | Status | One-line |
|---|---|---|---|
| 1 | The Harvest That Won't Die | **built + reviewed (2026-07-14), not played** | Escort three grain barges 12 days down the Palewater; river beats days 2–6 (wrong catch, tollbirds, skeindeer); ambush at the raiders' ford day 8–9; mistheron fog attack day 10–11; the hook lands at Withervale day 12. |

## 7. Next session

**Session 1 is ready pending Ben's ⚑ batch** (run-sheet §10): placeholder names (Roek,
Ashmark, Joskin, Sorrel, ⚑ Warden Selm), battle-map art (Palewater shallows, Withervale),
and the **required W23 adversary tooling round** (script stats → adversaries.json →
foundry-build → the edha-adversaries Actor folder with working talents; deliverable "deploy
and refresh, the folder is ready"), capitals from the 29 city markers. *(The Harrow beat was resolved 2026-07-13 — mercy-plot cut; the 2026-07-14 review
round added the river beats, the mistheron fight, strict ruling-34 rot, the writ ambush, and
the §7 hooks table.)*

**Session-2 prep starts from the run-sheet's §7 hooks table.** The **briar-gone shrine-grove**
(seeded at Withervale) is the prepped soft opener — rootling skirmishes + a root-warden-craft
negotiation; it needs a gazetteer siting + warden name at prep time. The other live shapes:
north (Malcurr gear / the writ / Roek contact — political) or south (the drain gradient toward
the Crossing).

**Character creation (2026-07-13):** the players build PCs next. Hand out
**`EDHA_PLAYER_PRIMER.md`** (player-safe nations/faiths/naming guide, spoiler-checked against
the session-1 do-NOT-reveal wall; GM culture blocks in canon §5b). When the party exists,
fill §1 above and retire the build-agnostic constraint.
