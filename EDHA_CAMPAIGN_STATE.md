# Edha Campaign State — the play ledger

**What has HAPPENED, as opposed to what is true.** `EDHA_CAMPAIGN_CANON.md` holds world truth;
this doc holds table truth: what the players know, which threads have moved, how NPCs feel about
the party, and the clocks. Owned by the `.claude/skills/session-forge` (reads first) and
`.claude/skills/session-debrief` (writes after play) workflows. GM truth throughout.

**Status: campaign not yet started.** Session 1 is built and awaiting play
(`EDHA_SESSION_1_SCRIPT.md`).

---

## 1. The party

**All three PCs exist and are built (Ben, 2026-09-09). The build-agnostic constraint is
RETIRED** — session 1 was written before the party landed and still runs for any table, but a
forge run may now write *to these three* rather than around them.

The three Foundry actors are the **players'**, not the bench's: `Temp Name Hannah character`,
`Soggy Bottom`, `Tem Parinaem`. All three are PROTECTED in `scripts/bench-setup-console.js` —
refresh-only via the sheet's own ⟳ Sync Talents button, never written by tooling (PM-R17).
**When a player adds or changes inventory, talents, or expertises, that lands in §1a**, not here.

### PC-1 — `Temp Name Hannah character` ⚑ *(placeholder name — the player has not settled one)*

**Envoy** heroic · **Blue** leyline · **Chaos** deity path. She/her. Expertises: **Law-Singing**,
**Performance**.

From **Canticle**, and **exiled from her home town for seeing things she should not be able to
see** — spirits, hallucinations, presences. She was the local Law-Singer's apprentice before the
exile. **No one in her town had ever attuned Blue before her.** She left to follow the visions
and find out what is happening to her.

*Canon fit, and it is unusually good:* Canticle is **the nation where law binds only when
performed aloud before witnesses** (§5b "The Sounding") — accurate quotation is the highest
courtesy, deliberate misquotation a civil offense, and every caravan hires a **way-witness**, a
licensed junior bard who *is* the law's presence on the road. So a Law-Singer's apprentice who
**sees things that are not there** is not merely odd in Canticle; she is an unreliable witness in
a society whose entire legal epistemology rests on reliable ones. Her exile has teeth. Her
expertises are also the way-witness's job description, which makes travelling with a convoy a
natural fit rather than a contrivance.

- **GM truth — the Fetch has chosen her**, most likely to follow and keep tabs on Soggy Bottom.
  Ben's framing: **the Fetch's influence is *why* she attuned Blue at all**, in a town with no
  Blue in it, and her visions of horror are its doing. She has no idea, and must not learn it here.
- **GM truth — the deity path is mechanical, not devotional.** The player chose **Chaos** because
  they like the Omen mechanics and wanted a Blue/Black character. **Hannah does not worship
  Maelith or Chaos** and should never be played as doing so. (⚑ Ben: note the irony if you want
  it — the pre-infiltration Chaos theology that could damn the Fetch sits in **Canticle's Deep
  Stacks**, her own country's archive, thread §8.6. The Fetch has recruited a girl from the one
  nation holding the evidence against it.)

### PC-2 — `Soggy Bottom`

**Scholar** heroic · **White** leyline · **Fate** deity path. They/them ⚑ *(Ben wrote both "they"
and "his" — settle it whenever.)* Expertises: **Moon-Pool Rites**, **Night-Work**.

Dunked into the **moon-pool in Lunavar's capital** (Moonmere, city-23) and **exiled for it** —
the deepest Lunavite transgression. They have been seeing visions since, with no clear sense of
what they mean but a deep foreboding that **these visions must not come to pass**. Their goal is
to understand them, prevent them, and **return to Lunavar** — as a hero, or not as a hero.

- **GM truth — this is Olvarra.** Stripped and signalling into the jammed moon-pool channel
  (canon §3 "the Lantern", rulings 64–66), she has reached the one mortal who breached the water —
  the campaign's first live line to "the most important eventual ally." She is **greatly
  diminished; vague visions and an exile are the only tools she has.** She does not have the whole
  picture yet; she knows something is wrong and is trying to get *anyone* out into the world to
  look. The reveal must land in the player's hands: **never name Olvarra or the Lantern's true
  nature to them**, and the cult must never learn the moon is Olvarra (ruling 65). Player-safe
  hooks are seeded in `EDHA_PLAYER_PRIMER.md` §Lunavar (the reader-who-enters-the-water folklore).

### PC-3 — `Tem Parinaem`

**Scholar** heroic · **Green** leyline · **Knowledge** deity path. He/him. A **scholar of the
woods, from Thalendor**.

**Thin by design, not by neglect** — the player's actual want was a **STR-based Scholar**, and the
build came first. Ben put him on the Knowledge path with **no deity association at all**; it is a
bookmark, a reminder to **lean Red later**, not a faith. Treat Knowledge as unwritten until the
player says otherwise.

- **He is the party's only Green**, which matters more than it looks: session 1 hands the Green
  PC a free read at Elmsworth's vats, the Wainferry chain-horse, and Withervale, and the whole
  act-1 investigation is a **Green drain**. The mechanical choice landed him on the campaign's
  spine by accident.
- **Session 2's briar grove is his scene** — Thalendor woods, a Green-starved grove-heart, a
  negotiation won by root-warden craft. It is already prepped and pointed straight at him.
- ⚑ **Backstory development is an open item with Ben**, not a blocker. See the state doc's §7 note.

### The party as a shape

**Blue / White / Green. No Black, no Red.** Two Scholars and an Envoy — **no dedicated fighter**,
which is a real scaling input for session 1's ford (run-sheet §3: the squishy/support-heavy
variant is now the default, not a variant). One native (Tem, Thalendor) and two exiles (Hannah
from Canticle, Soggy from Lunavar) — the Khor hire at Elmsworth works for all three unchanged.

**Two of the three are vision-havers with opposed sources**, and neither player knows it: Hannah
was pushed out into the world by **the Fetch corrupting her attunement**, Soggy by **a god trying
to get someone to look**. That symmetry is the campaign's spine sitting inside the party, and the
session where they compare notes and find their visions *disagree* is a beat worth waiting for.

- Location: n/a (session 1 opens at Elmsworth, the head-of-navigation river port, (1036,1359)).

## 1a. Party inventory & wealth

*(Empty — nothing played. `session-debrief` writes this after every session (extraction grid
row 10); `session-forge` reads it when pricing jobs and stocking loot. Division of labor:
mundane kit lives on the Foundry character sheets, THIS section tracks only what a forge run
must know — wealth, story-bearing items, and outstanding payment. Worth denominates in
**copper/silver/gold** (canon §5d, rulings 54–59 — the W25 coinage pass landed 2026-07-18);
food-payment in the deficit nations stays descriptive per ruling 56.)*

**The three actors are the players' own** (`Temp Name Hannah character`, `Soggy Bottom`,
`Tem Parinaem`). **When a player adds or changes inventory, talents learned, or expertises, it
gets noted HERE** (Ben, 2026-09-09) — this section is the repo's record of what the party is
carrying, and a forge run reads it before pricing a job or stocking loot. The sheets stay the
source of truth for the numbers; this is the ledger of what *matters to prep*.

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

- **Know:** (PC-1) they entered a moon-pool — the deepest Lunavite transgression — and surfaced
  *changed*, carrying something they cannot yet articulate; that readers who enter the water are
  quietly retired or vanish.
- **Suspect:** nothing named yet. PC-1 does NOT know a god is speaking, and does NOT know of
  Olvarra, the Lantern's true nature, or the jammed channel — keep this precise as they investigate.

## 3. Threads

| # | Thread (canon §8) | Status | Last moved | Notes |
|---|---|---|---|---|
| 1 | Gnothis — where; what answers the Warlock | live, untouched | — | Session 1 plants the Malcurr-gear clue (feeds this via the Warlock's funding). |
| 2 | Razkael's location/state | live, untouched | — | Breadcrumb: Commander Isra Vael (Vorsk). |
| 3 | How Morrath was sealed | live, untouched | — | The campaign spine; players don't yet know a god is missing. |
| 4 | Lunavar's moon cult | **live — PC-1's spine** | 2026-07-23 | PC-1 is Olvarra's unwitting mortal contact (GM); the Olvarra-ally arc (canon §3) may open through this PC rather than through the temple pool at large. |
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
Fenn, Wick, **Ferry-Serjeant Ordis Kell** (§2b), Sgt. Roek, Keeper Harrow, Gramma Ashmark, Elder
Joskin — all names CONFIRMED, Ben 2026-07-16 and 2026-09-09 (Kell). **No ⚑ names remain in the
session-1 sheet.**)*

## 6. Session log

| # | Title | Status | One-line |
|---|---|---|---|
| 1 | The Harvest That Won't Die | **built, reviewed, and session-forge refreshed 2026-09-09 — not played** | Escort three grain barges **13 days** down the Palewater; river beats days 1–4; the **Wainferry/Wainscross ferry stop day 5** (ruling 163 — the chain-toll and the paymaster writ); beats days 6–8; ambush at the raiders' ford **day 9**; mistheron fog attack **day 11–12**; the hook lands at Withervale **day 13**. |

**Published GM scripts** — the read-at-the-table artifacts (session-forge Phase 11). **Revising a session republishes to its existing URL**; publishing without it makes a second artifact and Ben's link goes stale.

| # | GM script |
|---|---|
| 1 | https://claude.ai/code/artifact/9db5c439-01fe-459d-9539-151279764afd |

## 7. Next session

**Session 1 is ready to run. One ⚑ remains, and it is art.** The **W23
adversary tooling round is DONE**: the bestiary folders (script stats → `data/adversaries.json` →
`foundry-build` → the edha-adversaries Actor folder with working talents) shipped in July 2026 and
have been bench-tested through September (see `EDHA_FOUNDRY_TEST_CHECKLIST.md`'s bestiary
sections). The **capitals are DONE**: `source-materials/maps/thyrcross.map.json` carries 35
cities, 5 of them capital-tagged (Maelstrand, Kragmoot, Goldenport, and the Ashkar pair
Raskeld/Kaelmouth). The **battle-map art** (Palewater shallows, Withervale) is still Ben's ⚑,
whenever he gets to it.

**The session-forge refresh RAN on 2026-09-09** (Ben: *"rerun the session forge for session
one"*), and it closed everything else — including ruling 154's day-5 ferry stop, which had been
the last open content piece. It re-measured every leg on the current trace and found the run-sheet
had drifted from both the map and the pack: the journey said "twelve days" in five places against
ruling 84's thirteen, the Black Altar seed still carried a pre-redraw coordinate, and the
Mistheron's Seeming was still written as an always-on trait when the bench-verified actor spends an
Action on it. All fixed, gates green. The **day-5 stop is built** (run-sheet §2b, canon ruling
163): Ben took the **"Ferry Law"** shape, named the towns **Wainferry / Wainscross**, and declined
the burying-ground variant so it would not steal Withervale's thunder — the wasting appears there
only as a working horse with a collar-sore that will not close. **Nothing is owed from Ben now
except the two battle maps.** What session 1 needs next is a table, not a session.

*(Settled 2026-07-16: ALL placeholder names confirmed — Roek, Ashmark, Joskin, Sorrel,
Warden Selm — and the bruising-not-lethal statblock tuning approved.)* *(The Harrow beat was resolved 2026-07-13 — mercy-plot cut; the 2026-07-14 review
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
