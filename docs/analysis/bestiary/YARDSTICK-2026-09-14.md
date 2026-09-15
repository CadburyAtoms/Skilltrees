# Bestiary yardstick fights — 2026-09-14 (bench run 48)

Three fights on copies of the actual PCs, recorded on `.claude/skills/bestiary-forge/TURN_LEDGER.md`'s
shape (TODO_REPO_HYGIENE item 155; rulings R-134 / R-135). The census measures per HIT; this file
measures per TURN. **Numbers exactly as on the cards, no softening; the graze's Focus charged (1 per
target); world restored** (end-of-run diff empty: 67 actors in and out, every scene's token
signatures identical, Ben's started combat untouched, `Bench Arena` left standing and empty).

**Common header.** Engine `5e9833a9` = HEAD @ `cf85198` (served file hashed CRLF-normalised from
both sides); packs `2026-09-14T23:58:55.686Z` (the agent-run deploy that opened this session);
scene **Bench Arena** (`rtek97ETZ7jKHcmJ`, bench-created under PM-R19, 100 px = 5 ft, `gridDiagonals`
0). Adversaries imported FRESH from `edha-content.edha-adversaries` into `Bench Targets` and placed
as unlinked tokens; PC copies made by `toObject()` from the players' actors (refreshed with ⟳ Sync
Talents first, per PM-R17 — a read, not an edit) into `Bench PCs`, restored to full between fights,
deleted at the end. Turn speeds are stated per fight; a fast turn is two Actions, a slow turn three.

| PC copy | Level | HP | Phy / Cog / Spi | Deflect | Attack | Ranged attack |
|---|---|---|---|---|---|---|
| Ishee (Envoy · Blue · Chaos) | 1 | 11 | 14 / 15 / 13 | 0 | Staff +4, 1d6+4 impact | no |
| Soggy Bottom (Scholar · White · Fate) | 1 | 11 | 13 / 13 / 16 | 0 | Staff +2, 1d6+2 impact | an unequipped Knife (20/60 ft) on the sheet — not used |
| Tem parinaem (Scholar · Green · Knowledge) | 1 | 13 | 16 / 11 / 15 | 0 | Mace +5, 1d6+5 impact | no |

Party HP pool **35**. Note the system adds the weapon skill's modifier to PC damage (`1d6 + 4`,
`1d6 + 5`, `1d6 + 2` on the cards), so a level-1 hit averages 5.5–8.5 — above the ecosystem
critique's "about 10 with Mighty" is not reached, but well above a bare die.

**Action coding.** T = a talent on the sheet (an Action whose value came from a sheet talent — Pack
Hunter riding a Move counts as T; Draw Mana counts as D even though the colour rider fires); D = Draw
Mana or a standard action; N = nothing useful. ⌐ marks a graze.

---

## YARD-1 — Rootling Swarm ×3 (minion pack)

| | |
|---|---|
| Date, bench run | 2026-09-14 (≈20:30 ET), bench run 48 |
| Engine hash served, packs stamp | 5e9833a9 = HEAD; packs 2026-09-14T23:58:55.686Z |
| Scene | Bench Arena |
| Adversaries | Rootling Swarm ×3 (Thalendor Heartwood Bestiary): HP 12, Phy 11 / Cog 8 / Spi 10, Deflect 1, foc 2, Whip and Root +4 1d6+1 impact, Grasping Vines d20+1 Green vs Phy, Territorial Instinct cue. Adversary HP pool 36. |
| PC copies | as above, all full |
| Numbers softened from the card? | none |
| Turn speeds | rootlings fast (2 Actions, act first), PCs slow (3 Actions) |
| Rounds played | 2 — the fight ended in round 2 |

| Round | Enemies on the field | Damage to party (by source, graze ⌐) | Damage to adversaries (by PC) | Focus spent on grazes | Drops / withdrawals |
|---|---|---|---|---|---|
| 1 | 3 | **5** — root3 Whip 3 (Soggy); root2 ⌐2 (Ishee); root1 Grasping Vines nat 1 → FAIL | **19** — Ishee 9 (⌐1 + 8 on root2); Tem 6 (3 on root2, ⌐3 on root1); Soggy 4 (⌐4, ⌐0 on root3) | adversaries 1; PCs 4 | root2 dropped (Tem) |
| 2 | 2 | **16** — root3 5 + 4 (Soggy → 0); root1 4 + 3 (Ishee → 3) | **17** — Ishee 7 + 2 on root1 (drop); Tem 8 on root3 (drop) | 0 | Soggy (PC) down; root1, root3 dropped |
| 3 | 0 | — | — | — | not played |

| Round | PC | Action 1 | Action 2 | Action 3 | Note |
|---|---|---|---|---|---|
| 1 | Ishee | T | D | D | Steadfast Challenge 21 vs Spi 10: root2 Disoriented + next test at disadvantage (1 Focus); Staff miss ⌐1 (Deflect ate 1 of the die 2); Staff hit 8 → root2 3/12, bloodied cue |
| 1 | Tem | T | D | D | Move beside root2 + Pack Hunter (1 Inv): "2 hunter(s) gain advantage … against Rootling Swarm (2)"; Mace with advantage (2,6)+5 = 11 vs 11 → root2 drops; Mace miss ⌐3 on root1 |
| 1 | Soggy | D | D | D | Draw Mana (Inv clamped at max; White pulse healed Ishee +1, Soggy +1); Staff miss ⌐4 on root3; Staff miss ⌐0 — die 1, Deflect 1, Focus spent for nothing |
| 2 | Ishee | T | D | D | Rousing Presence → Tem Determined; Staff rolled WITH ADVANTAGE (10,17) → hit 7 on root1 — the Pack Hunter advantage banked "against root2" (dead) was consumed here (see report 3); Staff hit 2 → root1 drops |
| 2 | Tem | T | D | — | Move + Pack Hunter vs root3: "2 hunter(s)" — the second was the DOWNED Soggy adjacent to it; Mace with advantage hit 8 → root3 drops; third Action unused (no enemy left) |
| 2 | Soggy | N | N | N | down at 0 |

**Reading.** T / (T + D + N) — Ishee 2 / 6, Tem 2 / 5, Soggy 0 / 6 (three N down); set total **4 T, 11 D,
3 N** (one Action unused). Damage in per round ÷ 35: **14 % / 46 %**. Damage out per round ÷ 36:
**53 % / 47 %**. Enemies on the field per round: 3 / 2 / 0. A rootling (12 HP, Deflect 1) took
**2–3 damaging PC Actions** to drop, not one; its average landed hit was 4.2 (3, 5, 6, 4, 3), its
grazes 2. All three cues of the block fired (Territorial Instinct once per round per rootling, the
bloodied scatter on each crossing). Round 2's 16 in was two rootlings hitting with 14, 9, 14, 14 on
the d20.

---

## YARD-2 — Mistheron ×2 (rival pair, session 1's fog fight)

| | |
|---|---|
| Date, bench run | 2026-09-14 (≈20:50 ET), bench run 48 |
| Engine hash served, packs stamp | 5e9833a9 = HEAD; packs 2026-09-14T23:58:55.686Z |
| Scene | Bench Arena (no fog: the Seeming is the whole mechanic on a bare grid) |
| Adversaries | Mistheron ×2 (Riverlands Bestiary): HP 20, Phy 12 / Cog 14 / Spi 11, Deflect 1, foc 2, Spearing Beak +5 1d8+2 keen reach 10 ft (+1d6 vs a fooled target), The Seeming (full phantom loop, `edha-illusion-copy`), Fade (Reaction, 1 Focus), Starving Not Fanatic (bloodied → breaks off). Adversary HP pool 40. |
| PC copies | as above, restored to full |
| Numbers softened from the card? | none |
| Turn speeds | birds fast; PCs slow, except Soggy FAST in rounds 2–3 (so Guiding Signal precedes the tests it raises) |
| Rounds played | 3 |

**The row's premise, corrected.** The Mistheron carries the FULL phantom loop (an action item named
`The Seeming` → `edha-illusion-copy`), not the lightweight `edha-ambush-belief` (that is the
Wrongwake / Stillback shape). The Perception tests fire per onlooker when the Seeming is placed,
engine-rolled vs Cog 14, not on the first attack. Both birds raised their Seemings before the combat
opened (their lurking state): bird 1 — Ishee 3 FOOLED, Tem 23 sees through, Soggy 14 sees through;
bird 2 — Tem 4 FOOLED, Ishee 4 FOOLED, Soggy 19 sees through. Each Seeming summoned a
"Mistheron (Illusion)" actor + token (HP 1, defenses 0/0/0) a pace from its bird; the fooled PCs were
played as seeing only the copy.

| Round | Enemies on the field | Damage to party (by source, graze ⌐) | Damage to adversaries (by PC) | Focus spent on grazes | Drops / withdrawals |
|---|---|---|---|---|---|
| 1 | 2 | **11** — bird1 ⌐7 (Ishee, fooled); bird2 ⌐4 (Tem, fooled) | **14** — Tem 5 + 6 on bird1; Soggy ⌐3 on bird2 | adversaries 2 (+1 on bird2's Fade); PCs 1 | none; bird1 bloodied 9/20 ("breaks off" cue) |
| 2 | 1 (bird1 withdrew into the fog) | **13** — bird2 Beak hit 13 (Tem → 0; the +1d6 rider showed on the card) | **0** | 0 | Tem (PC) down |
| 3 | 1 | **11** — bird2 Beak hit 11 (Ishee → 0) | **4** — Soggy ⌐4 on bird2 (13/20) | PCs 1; bird2 had 0 Focus (a nat-1 miss stayed a miss) | Ishee (PC) down |

| Round | PC | Action 1 | Action 2 | Action 3 | Note |
|---|---|---|---|---|---|
| 1 | Tem | D | D | D | Move beside bird1 (he sees through it); Mace hit 5 (Fade cue whispered, not taken); Mace hit 6 → bird1 bloodied |
| 1 | Ishee | T | D | D | Rousing Presence → Soggy Determined; Draw Mana (Inv at max; Blue rider banked "next test at advantage"); Move 20 ft out of reach |
| 1 | Soggy | D | D | D | Draw Mana: pulse healed Ishee +1, Tem +1; Move beside bird2; Staff miss ⌐3 → bird2 took Fade (1 Focus) to 10 ft |
| 2 | Soggy (fast) | T | D | — | Guiding Signal: a designation picker card (one button per Mistheron within 30 ft, illusions included) → Mistheron (2); its raise was never used (Tem fell before any test); Draw Mana: healed Ishee +1, Tem +1 |
| 2 | Tem | N | N | N | down at 0 |
| 2 | Ishee | T | D | D | Steadfast Challenge at the COPY she sees: Blue advantage consumed (2d20kh+3 = 16) vs the illusion's SPI 0 — "Mistheron (Illusion) is Disoriented"; the real bird untouched; Move toward the copy; Draw Mana |
| 3 | Soggy (fast) | D | D | — | Move beside bird2; Staff miss ⌐4 |
| 3 | Tem | N | N | N | down |
| 3 | Ishee | N | N | N | dropped before her turn |

**Reading.** T / (T + D + N) — Ishee 2 / 9 (one of the two on an illusion), Soggy 1 / 7, Tem 0 / 9;
set total **3 T, 12 D, 9 N**. Damage in per round ÷ 35: **31 % / 37 % / 31 %**. Damage out per round
÷ 40: **35 % / 0 % / 10 %**. Enemies on the field per round: 2 / 1 / 1. Six Beak attacks: 2 hits (13,
11 — the fooled-target rider in both), 4 misses, of which 2 became grazes (7, 4; the system's graze
is the base 1d8 only, the rider die excluded). Two PCs down by round 3 against a pair that lost one
bird bloodied and left the other at 13/20. The fight is decided by the Seeming: the two fooled PCs
could not target the real bird all fight, and the one who could see it has no ranged attack and was
the first speared.

---

## YARD-3 — Briar-Gone Grove (boss, session 2's grove seed)

| | |
|---|---|
| Date, bench run | 2026-09-14 (≈21:10 ET), bench run 48 |
| Engine hash served, packs stamp | 5e9833a9 = HEAD; packs 2026-09-14T23:58:55.686Z |
| Scene | Bench Arena |
| Adversaries | Briar-Gone Grove ×1 (Thalendor Heartwood Bestiary): boss, large 2×2, HP 60, Phy 14 / Cog 8 / Spi 12, Deflect 2, foc 3, move 5, `senses` 30 (stated — the token read 30), Girdling Bough +6 1d10+3 impact reach 15 ft, Draw Mana → Green rider places a 10 ft difficult-terrain square carrying Thorn Field (`floor((1d8)/2)` keen), Sudden Growth (Special, 1 Focus), Spreading Roots cue, The Madness Slackens cues. **Call the Runners not used** — the yardstick is the boss alone. |
| PC copies | as above, restored to full |
| Numbers softened from the card? | none |
| Turn speeds | everyone slow; the players' slow turns precede the GM's, so the PCs act first each round |
| Rounds played | 3 — the grove went still at round 3, Tem's second Action |

| Round | Enemies on the field | Damage to party (by source, graze ⌐) | Damage to adversaries (by PC) | Focus spent on grazes | Drops / withdrawals |
|---|---|---|---|---|---|
| 1 | 1 | **13** — Bough 4 + 9 (Soggy → 0) | **33** — Tem 9 + 8; Ishee 7; Soggy ⌐4 + 5 → 27/60, bloodied cue | PCs 1 | Soggy (PC) down |
| 2 | 1 | **19** — Bough ⌐10 + ⌐9 (Ishee → 0); plus **3** of Thorn Field on the two DOWNED PCs when Sudden Growth detonated | **17** — Tem 4 + 8; Ishee 5 + ⌐0; and **1 self-inflicted** (its own Thorn Field at its turn start, 3 keen − Deflect 2) | adversaries 2 (+1 on Sudden Growth); PCs 1 | Ishee (PC) down |
| 3 | 1 → 0 | **0** | **9** — Tem 4 + 5 → 0 HP: "it goes still instead of dying" cue | 0 | the grove (goes still) |

| Round | PC | Action 1 | Action 2 | Action 3 | Note |
|---|---|---|---|---|---|
| 1 | Tem | D | D | D | Move adjacent; Mace hit 9; Mace hit 8 |
| 1 | Ishee | D | T | D | Move adjacent; Steadfast Challenge 6 vs Spi 12 FAIL (1 Focus); Staff hit 7 |
| 1 | Soggy | D | D | D | Move adjacent; Staff miss ⌐4; Staff hit 5 → bloodied |
| 2 | Tem | T | D | D | A flank step + Pack Hunter (1 Inv): "1 hunter(s)" — Ishee, adjacent to the 2×2 token, was not counted; Mace with advantage hit 4; Mace hit 8 |
| 2 | Ishee | T | D | D | Rousing Presence → Tem Determined; Staff hit 5; Staff nat 1, ⌐0 (die 1 under Deflect 2) |
| 2 | Soggy | N | N | N | down |
| 3 | Tem | D | D | — | Mace hit 4; Mace hit 5 → 0 HP; third Action unused |
| 3 | Ishee | N | N | N | down |
| 3 | Soggy | N | N | N | down |

**The grove's turns.** Round 1: Draw Mana (+3 Inv, clamped at the pool's 2) — the Green Key prompted
"Click where the 10 ft difficult-terrain square grows"; a real mouse click at the grid vertex between
Tem and Ishee (world 1348, 1100) placed the square at cells 14–15 × 11–12 — one cell right and half a
cell down of the click, under nobody but the grove's own token, which took "1 keen from dangerous
terrain (Thorn Field — Briar-Gone Grove)"; then Bough → Soggy ×2 (hits 18 and 14 vs 13). Round 2: at
its turn start "takes 3 keen from dangerous terrain" (its own square); Sudden Growth (1 Focus) — burst
placed by a click, then the card's Detonate button dropped a second square at cells 13–14 × 11–12
carrying the hazard with `exemptActorUuid` empty; Ishee and Soggy, both at 0 HP, "take 2 keen" and "1
keen"; then Bough → Ishee ×2 (misses 9 and 11 vs 14, both grazed: 1d10 = 10 and 9). Spreading Roots
never applied (no PC started a turn in the briar); Thorn Field's whispered cue fired at the first
hostile turn start of every round whether or not briar existed.

**Reading.** T / (T + D + N) — Tem 1 / 8, Ishee 2 / 9, Soggy 0 / 9; set total **3 T, 14 D, 9 N**.
Damage in per round ÷ 35: **37 % / 54 % (+9 % on the downed) / 0 %**. Damage out per round ÷ 60:
**55 % / 28 % / 15 %**. Enemies on the field: 1 / 1 / 1 → 0. **PC Actions to drop the boss: 11
damaging attack Actions** (13 attack Actions counting the two ⌐0 grazes) across three rounds — R-134's
"six or more" holds with room. The boss's six Bough attacks: 4 hits (4, 9, then two grazes of 10 and
9 that dropped an 11-HP PC from full), i.e. a boss graze is a whole 1d10.

---

## The set, read against R-134 and the census

| Role (fight) | Average landed hit (card EV) | PC Actions to drop one | Encounter damage in per round, ÷ 35 (target ≤ 25 %) | Verdict |
|---|---|---|---|---|
| minion — Rootling Swarm (YARD-1) | 4.2 measured (4.5 EV); grazes 2 | **2–3** (target: one) | 14 % · 46 % | hit size on target; too many Actions to drop — 12 HP + Deflect 1 behind Phy 11 is a rival's chassis on a minion's card |
| rival — Mistheron (YARD-2) | 12 measured on fooled targets (9.5 EV with the rider, 6.5 without); grazes 4–7 | bird1 bloodied in 2, withdrew; bird2 not dropped in 4 | 31 % · 37 % · 31 % | over target every round; the Seeming, not the numbers, is the lever — fooled PCs cannot answer at all |
| boss — Briar-Gone Grove (YARD-3) | 6.5 measured (8.5 EV); grazes 10, 9 | **11** (target: six or more) | 37 % · 54 % · 0 % | Actions-to-drop on target; damage in over target both rounds it acted — two grazes at 1d10 each equal a PC |

Across the set: **10 T, 37 D, 21 N** over 68 recorded PC Actions — the sheet fills **15 %** of all
Actions and **21 %** of the Actions taken by a PC who was still standing; every N is a downed PC's
turn. Enemies on the field per round for R-106: 3/2/0, 2/1/1, 1/1/1. Structural findings went to
`test-pass-fixes` as TODO_REPO_HYGIENE items 161–164 (the dated delta names them); R-136 asks the
one judgment call the set raised (what a fooled PC's contest resolves against).
