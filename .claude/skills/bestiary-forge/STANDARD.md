# The bestiary statting standard

**What this is.** The one place that says what an Edha adversary block MUST state, where each
number comes from, and which rule decides it. Written 2026-09-14 as step 1 of the bestiary redo
(TODO_REPO_HYGIENE item 121), because item 82 opened with *"find where the bestiary statting
standard lives"* and the answer was nowhere: four skills each held a layer (concepts in
`lore-forge`, wiring in `leyline-tree-authoring`, encounters in `session-forge`, talent lists in
`build-forge`) and the numbers had been set block by block against the old playtest cheatsheet.

**How to read the status of each rule.** Three kinds of sentence live here and they are marked:
**RULED** (a canon ruling or an `EDHA_RULINGS.md` answer decides it — cite it), **MEASURED** (what
the 52 blocks do today, read from `docs/analysis/bestiary/CENSUS.md`, not a target), and
**PENDING R-nnn** (a decision filed for Ben that this standard will absorb once answered). A
PENDING line is never applied to data before the ruling lands. *(2026-09-14 23:23 ET: the eight
rulings this standard was filed with — R-128 … R-135 — were all answered (a) from the phone board
the same night; every PENDING line below is now RULED and says so. `EDHA_RULINGS.md` §K.15.)*

---

## 1. Where a creature comes from (RULED — canon rulings 106, 108, 109; lore-forge Phase 4b)

1. **Geography picks the animal**, the ground picks the default colours, deity attunement balances
   the roster (canon ruling 108, the three-layer derivation). Vorsk, Ashkar and Kettavar's god-pairs
   ARE their ground; Corvaine has no major deity and balances on ground alone.
2. **Count the continental colour ledger before proposing a roster** (canon ruling 106 (a)):
   canon §5c entries and statted blocks by colour, a pair counting ½ to each side. The statted
   half is `CENSUS.md` §3 — never re-count it by hand. *"The ratios don't need to be perfect, but
   it shouldn't be lopsided."* **RULED R-132 (a), canon ruling 164:** the census re-count closed
   ruling 109's second balance pass, the mono-Blue moratorium is LIFTED, and new entries steer
   toward the two lowest colours — Green and White on 2026-09-14 — read live from the census.
3. **A statable's bespoke actions are a KIT of two to four named talents from its own colour
   tree** (canon ruling 106 (b)): list the tree's 25, pick the ones that make the encounter
   *interesting*, name the kit in the concept so Ben approves mechanics-shape and animal together.
4. **Roster target ~4–6 per nation**, at least one apex or rival-tier threat, famine and
   shift-clause arcs derived not invented, scenery-tier entries *named as scenery* (lore-forge
   Phase 4b, Ben 2026-07-19: *"we really need more than two creatures per entire country"*).
5. **Humans use tree talents as written; animals and monsters get adaptations** (canon ruling 40).
   Terrain-scale and diplomacy-scale entries (grove-heart, skein herd, given herds) are per-session
   exceptions designed with Ben, never forced into the Actor mould.
6. **A yes on the animal is never a yes on its numbers** (canon Phase 4c gate, Ben 2026-07-19).

## 2. What every block states

The schema is `data/adversaries.json`'s own `_README` (authoritative for field shapes). This table
is the *standard* — which fields a block must carry and where the value comes from.

| Field | Required? | Comes from | Notes |
|---|---|---|---|
| `role` | yes | the encounter's job: minion / rival / boss | Role is the lever for everything rank-shaped (§3). "Standard" and "Elite" from the old cheatsheet both map to rival. |
| `tier` | yes | the party level band the block is built for | Tier supplies only the dice COUNT (§3). 45 of 52 are tier 1 (MEASURED). |
| `folder` | yes | `"<Nation> <Ground> Bestiary"` (e.g. `Thalendor Heartwood Bestiary`), or a campaign folder (`Session 1 — Palewater Ford`) | **RULED R-130 (a):** every block states one; the nine test-dungeon blocks sit in `Legacy — Playtest Dungeon` and keep building as fixtures. A block that omits it is a mistake, not a choice (the build's fallback folder exists only for that mistake). |
| `size`, `creatureType` / `customType` | yes | the fiction | Large = a 2×2 token (the build). |
| `count` | yes | how many appear in the reference encounter | Informational; the GM drags this many. Minions come in groups. |
| `leylines` | when attuned | the derivation (§1) | Each colour writes a skill rank = role rank (§3), auto-embeds its Key, and the block gets Draw Mana (canon ruling 49). |
| `attributes` | yes, once the block's nation pass re-derives it | the fiction and the role: `{str, spd, int, wil, awa, pre}` | **RULED R-128 (a), 2026-09-14:** the build writes the stated keys (omitted = 0; a block stating none builds exactly as before). AWA gives the darkness-sense radius on the system ladder (5 / 10 / 20 / 50 / 100 ft at ceil(AWA/2)); SPD the walk rate where `movement` is omitted; skill tests roll attribute + rank. **Ben's gloss:** Senses Range is the radius a creature perceives with its primary sense OBSCURED (darkness, dim light) — in a lit room it sees as far as the light goes, same as the PC actors. Values land nation by nation (R-135), never as a bulk batch. **RULED R-137 (Ben, 2026-09-14):** stating attributes ALSO puts the block on the **PC attack model** — see §3 "the attack model". |
| `skills` | when the block rolls | the abilities that roll | **MEASURED:** 41 of 52 carried explicit ranks while attributes were 0 everywhere, so a rank stood in for attribute + rank (Callthief `dec: 4` is above any PC's tier-1 cap). **RULED R-128 (a):** the nation pass re-derives each to attribute + rank keeping the total (rank 4 → attribute 2 + rank 2). **RULED R-137:** on the PC model the weapon skills (`hwp` / `lwp` / `agi`) are real ranks that the attack roll adds — state them like a PC's; a rank above a tier-1 PC's cap is R-94's latitude (the published pack's Bandit carries Intimidation 3 at tier 1), not a mistake, but say why. |
| `defenses` `{phy, cog, spi}` | flat model: yes · PC model: derived | flat model: the role band (§3) + the fiction · PC model: **10 + the attribute pair** (Phy STR+SPD, Cog INT+WIL, Spi AWA+PRE) | **RULED R-139 (a), Ben 2026-09-15:** on the PC model the defenses derive — the system's own rule and the published companions-and-adversaries pack's shape on all 20 of its blocks (no overrides, read live 2026-09-15). The build writes no override for such a block; choose the attributes that derive the numbers you want, and omit `defenses` (a stated pair is accepted only as a restatement — the model gate refuses one that disagrees). A flat-model block keeps stating all three as overrides until its nation pass. |
| `deflect` (+ `deflectTypes`) | when armoured or hided | the fiction | Default types energy / impact / keen. Recorded on the card. |
| `hp` | yes | the role band (§3) | A statted block does not scale with the party (R-48, R-81 (a)). |
| `foc` | when an ability costs Focus | the abilities | R-112 raised The Reckoning 2 → 3 because a pool must be able to pay its own signature cost. Grazes cost 1 Focus per target (SR p.35): a minion with `foc: 1` grazes once per fight. |
| `inv` | when attuned | default 2 + max(AWA, PRE), the PC derivation (2 while a block states no attributes) | Explicit wins. **RULED R-139 (a):** HP, Focus and Investiture STAY STATED on the PC model (the published pack states all three; its Focus happens to equal 2 + WIL on every block, a good default when nothing argues otherwise). The approved blocks state Investiture 2 rather than let AWA raise it. |
| `movement` | **yes — state it** | the fiction; omit only when 25 ft is the intended walk | Item 82's line. **MEASURED:** 46 of 52 state it. |
| `senses` | only when the fiction beats the ladder | the fiction | **RULED R-56 final:** the cosmere ladder `[5, 10, 20, 50, 100, ∞][ceil(AWA/2)]` governs every actor type, so a block with no attributes sees **5 ft in the dark** on sheet and token alike (item 83). **RULED R-128 (a):** the fix is `attributes` (AWA), not a batch of overrides; `senses` stays the fiction override above the ladder (the eyeless grove at 30 ft). **MEASURED:** 1 of 52 states it (Briar-Gone Grove); the other 51 read 5 ft until their nation pass states AWA. |
| `conditionImmunities` | when the fiction says so | canon conditions or `EDHA_STATUSES` ids only | An id that is neither is dropped silently by the build; `CENSUS.md` §7 flags `unknown`. |
| `biography` | yes | GM-facing | What it wants, how it fights, when it withdraws, the **outs** (talk, mercy, surrender), and the tone line ("sad, not evil" where canon says desperate). |
| `items` | yes | §4 | Every gear attack and natural weapon is `kind: "weapon"` (natural ones `alwaysEquipped`) — item 34a/65's model; attack-riding manoeuvres and Investiture attacks stay actions. |
| `talents` | humans, and beasts with an as-written talent | `"Tree/Talent Name"` | No prerequisites or rank gates apply (R-94); `python scripts/validate-build.py --adversaries` prints what the pick costs the players, informational. **MEASURED:** 2 of 52 carry any. **RULED R-131 (a):** one invested human per act-1 nation the party reaches, rival role, a kit of two to four as-written talents from a tree the party does not hold, from canon §5b's named factions — concepts at the lore gate, blocks at the statblock gate, one per nation pass (item 158). |
| `img` | yes | a core-icon placeholder | The build swaps in `art/adversaries/<slug>-portrait.*` / `-token.*` when Ben drops them; add the slugs to `EDHA_ADVERSARY_ART_WISHLIST.md`. |

## 3. Numbers by role

**RULED — the dice.** Adversary leyline rank = ROLE rank, minion 1 / rival 2 / boss 3 (canon
ruling 122, superseding 107's rank ≡ tier; the ruling-123 retro sweep re-derived the older blocks).
`[Die]` = `1d(2·rank+2)` (d4 / d6 / d8), `[Tier][Die]` = `(tier)d(2·rank+2)`, a "+Colour modifier"
term = +rank. `edhaColorRank`'s adversary fallback reads the role map, never tier. State the
resolution in the rule's `description` so the next audit can re-derive it.

**RULED — a statted block does not scale.** A distance or a die on a card is canon for that
block (R-48: `distanceFt: 20`, not `bySize`; R-81 (a) generalised it). Scaling belongs to PCs.

**RULED R-137 (Ben, chat 2026-09-14) — the attack model.** *"Adversaries need to follow the same
rules as the PCs do, that's how the whole system works. They have attributes, they have skill ranks
in relevant skills, they have talents right off the talent trees."* The cosmere system rolls an
adversary's attack exactly as a PC's — `d20 + attribute + skill rank` (`getSkillTestRollData`), the
same modifier appended to the damage (`rollDamage`, the damage skill falling through to the attack
skill), the graze the bare dice (`@damage.dice`) — and the published companions-and-adversaries
pack is written that way on every block: attributes, ranks, dice-only damage, an empty modifier
formula. So a block on the PC model (it states `attributes`) writes its attacks as **dice + the
skill it tests**, and the numbers derive:

| The card prints | Derived as | Stored as |
|---|---|---|
| Attack +N | attribute + rank of the attack skill (+ `attackBonus` only where the block states one AS a bonus) | `attackSkill` (weapons default by range: ranged → `lwp`/SPD, melee → `hwp`/STR), the rank in `skills` |
| Hit 1d8+M | the weapon's dice + attribute + rank — **the same modifier as the attack** | `damage: "1d8"` — dice only |
| Graze 1d8 | the dice | nothing (or a dice-only `graze` override) |

**One skill modifier, not two.** +4 to hit with 1d6+1 is not a PC number (Ishee's Staff is SPD 3 +
Light Weaponry 1 = +4, and 1d6+4). A block on the model cannot keep the July split: choose the
attribute, the rank and the die so the pair lands where R-134's row wants the EXPECTED DAMAGE PER
ATTACK (hit chance × hit EV, grazes charged), and say which row it was read against. A numeric
`attack`, a `skill` override on an attack, or a flat inside an attack's `damage` on a PC-model
block is a gate error (`node scripts/validate-adversary-model.js`, gate `adversary-model` — the
gate July never had; it fails the exact shape PR #388 shipped). The **flat model** — `attack: N`
in the modifier formula, `1d6+N` in the damage — stays legal ONLY on a block that states no
attributes (46 of 53 on 2026-09-15; the census §1 counts them) and builds byte-identically until
its nation pass migrates it. **Why this exists:** R-128's menu said attack modifiers "would not move
under any option"; the seven PR-#388 blocks stated attributes on the flat numbers and rolled STR /
SPD on top of both — a STR 2 Raider's +4 / 1d6+1 Shortsword rolled `1d20 + 2 + 4` and `1d6 + 1 + 2`
on a fresh import (verified live 2026-09-15).

**RULED R-140 (a), Ben 2026-09-15 — R-134's per-hit rows under one modifier.** The rows were
written for the split; with one modifier a d6 minion at +2 hits for 5.5. So the rows are read as
**expected damage per attack, grazes charged** — hit chance × hit EV + miss chance × graze EV,
against the party's Physical 13 / 14 / 16 — which is what the yardstick fights measure: a minion
at most about 4 per attack, a rival about 6, a boss about 8. A block's proposal prints that
number beside its line (the 2026-09-15 gate page is the worked example: the Raider's +2 for
1d6+2 is 4.4 per attack against Phy 14, the approved +4 for 1d6+1 was 4.0).

**RULED R-138 (a), Ben 2026-09-15 — the ¼-per-round line binds the ENCOUNTER, not the card.**
Cards are statted to the per-hit and Actions-to-drop rows; the per-round line is session-forge's
budget (count, turn speed, a boss's terrain Actions, Call the Runners), and each run-sheet says
how its encounter meets it. It sat over target in every round an adversary acted in all three
yardstick fights, and no card-level retune reaches it without breaking the per-hit rows.

**MEASURED — the bands the 52 blocks occupy today** (from `CENSUS.md` §2 @ data `80e12d5b34fc`;
the census is authoritative, this is the snapshot the redo started from):

| Role | Blocks | HP | Phy def | Cog def | Spi def | Deflect | Attack mod | Damage per hit (EV) |
|---|---|---|---|---|---|---|---|---|
| minion | 15 | 6 – 22 (avg 12.1) | 9 – 14 (avg 11.1) | 8 – 14 (avg 10.1) | 8 – 12 (avg 10.9) | 0 – 2 (avg 0.7) | 4 – 5 (avg 4.4) | 3.5 – 7.5 (avg 5) |
| rival | 29 | 14 – 65 (avg 27.5) | 11 – 16 (avg 12.6) | 8 – 18 (avg 11.8) | 9 – 16 (avg 11.3) | 0 – 4 (avg 1.3) | 4 – 8 (avg 5.9) | 3.5 – 13 (avg 7) |
| boss | 8 | 48 – 140 (avg 66) | 13 – 15 (avg 13.9) | 8 – 17 (avg 11.6) | 11 – 17 (avg 12.9) | 1 – 3 (avg 1.9) | 6 – 9 (avg 7.3) | 7.5 – 13 (avg 9.3) |

**RULED R-134 (a), 2026-09-14 — the targets.** The bands above are practice; these are policy,
written against THIS party (Blue / White / Green, two Scholars and an Envoy, no fighter, no armour:
a level-1 PC has `10 + STR` HP and Deflect 0) so a new block's numbers derive from the target
rather than from its neighbours:

| Role | Average hit, at most | PC Actions to drop | Encounter damage in, per round |
|---|---|---|---|
| minion | ⅓ of a level-1 PC's HP (about 4) | one average PC Action | the encounter's expected damage in per round at most **¼ of the party's HP pool** at the "bruise, not wipe" tier |
| rival | ½ (6 to 7) | two or three | (same) |
| boss | ⅔ (8 to 9) | six or more | (same) |

The measured bands sit at or a little above these, so **the yardstick fights (item 155) verify
before any block is retuned — no retune ships on the arithmetic alone.** A new block states which
row it was derived from in its concept proposal.

**MEASURED — the first yardstick set (bench run 48, 2026-09-14; `docs/analysis/bestiary/YARDSTICK-2026-09-14.md`),
read beside the targets above.** Copies of the actual PCs (HP 11 / 11 / 13, Deflect 0, pool 35),
numbers as on the cards, grazes charged:

| Role (fight) | Average landed hit | PC Actions to drop one | Damage in per round ÷ 35 | What decided it |
|---|---|---|---|---|
| minion — Rootling Swarm ×3 | 4.2 (card EV 4.5); grazes 2 | **2–3** (target one) | 14 % · 46 % | 12 HP + Deflect 1 behind Phy 11 is more chassis than a minion's card; the party's Actions, not its damage, is what the block taxes |
| rival — Mistheron ×2 | 12 on fooled targets (EV 9.5 with the rider, 6.5 without); grazes 4–7 | bird 1 bloodied in two and withdrew; bird 2 not dropped in four | 31 % · 37 % · 31 % | the Seeming: the two fooled PCs could not target a real bird all fight; two PCs down by round 3 |
| boss — Briar-Gone Grove | 6.5 (EV 8.5); grazes 10 and 9 | **11** (target six or more) | 37 % · 54 % · 0 % | reach 15 and a 1d10 graze: two grazes dropped an 11-HP PC from full before the third round |

Across the set the sheet filled **15 % of all PC Actions** (21 % of a standing PC's) — 10 T, 37 D,
21 N over 68 Actions, every N a downed PC's turn — and the enemies on the field per round were
3/2/0, 2/1/1, 1/1/1 (R-106's input). **The system's graze is the BASE weapon die only** (the fooled-
target rider die is excluded; `msg.rolls[1].options.graze`), so the graze floor on these cards is a
d6 (minion), d8 (rival) or d10 (boss) per paid miss — a boss graze averages what a minion HIT does.
Read against the targets: hit sizes sit on target for the minion and the boss; **Actions-to-drop is
over target for the minion and on target for the boss; damage in per round is over the ¼ line in
every round an adversary acted except the rootlings' first.** What the retune can touch is HP and
Deflect on the minion chassis and the graze die on the boss weapons; what it cannot is the Seeming.

**Read every damage number per Action, with the graze.** The ecosystem review's largest error was
action semantics (a Slow turn is three Actions), and bench run 44's was forgetting that a graze
costs the attacker 1 Focus per target — charged properly, most minion misses are misses. An
adversary's threat is hits per turn × EV per hit, floored by the grazes its Focus can pay for.

## 4. Wiring (RULED — Ben 2026-07-16 and 2026-07-19; `lint-refs.js` passes 5 and 6)

The engineering standard lives in `leyline-tree-authoring` SKILL.md §"Adversary abilities" and
ENGINE_INDEX §"Talents on adversaries" / §"GM cue cards" — read them before wiring anything. The
points this standard leans on:

- **Every trigger-naming ability carries ONE of:** native automation (`attack` / `damage` / `heal`),
  an `events` rule (full automation where the effect is decision-free, `edha-gm-cue` **at
  minimum** where the call stays at the table), or a `noHook` key giving the reason. A bare
  "GM-run" satisfies nothing.
- **The cue vocabulary is CLOSED.** Author against the dispatch table in that section, never by
  copying a neighbouring block — six dead cues shipped that way in July.
- **MEASURED:** 185 rules on 235 items; 74 are GM cues (28 on an HP line, 17 on hit, 12 on an
  enemy's turn start), 111 are effects, 64 items roll natively, 16 declare `noHook`. **RULED
  R-129 (a):** in each nation pass, a cue whose text names no table decision becomes an effect
  where a hook exists, a cue that names one stays a card, and every rule's `description` is
  labelled `cue — table call: <what>` or `effect — decision-free`, so the next census can count
  the split and a lint can one day check it. Conversions ride the nation's REBUILD; no separate pass.
- **Sole consumers.** `CENSUS.md` §6 lists the handler types only an adversary uses. Check there
  first when a primitive changes.
- **Renamed adaptations.** Reuse the source talent's authored rule shape on the adaptation (Sudden
  Wall carries Sudden Growth's `edha-burst` rule verbatim). An engine name-keyed alias is the
  adversary-surface exception lint pass 7 tolerates (only the Fellstag's Herding Antlers uses it
  today), not the default — and the card must say which engine path runs the ability.

## 5. Gates before a block is shown to Ben

`node scripts/gates.js` (all of it), and specifically: `validate.js` (talent refs resolve, weapon
kinds), `lint-refs.js` pass 5 (no silent manual card) and pass 6 (dispatchable cues),
`node scripts/bestiary-census.js --write` (the report is part of the change — the census test
fails otherwise), and in CI the pack build + `validate-adversaries.js`. For a human block,
`python scripts/validate-build.py --adversaries` to see what the talent list costs the players.
**Diff the census before and after:** did a band move, did the ledger move, did a sole-consumer
appear? Say so in the proposal.

## 6. The gate, the deploy, the bench

- **The statblock gate.** Present the blocks in full; Ben reviews bespoke actions, defenses and
  numbers; only then commit. Never treat a yes on the creature concept as a yes on its numbers.
- **Deploy class.** Data changes = **adversaries REBUILD + ⟳ Sync Adversaries** (scoped since
  R-113: `{folder, actorIds, scenes, dryRun}`; an agent may run it for bench rosters). Engine-only
  = F5 / relaunch. Say which in the commit message and the delta header.
- **Bench rows.** One 🤖 row per new or changed block (drive its rules live), and for a new roster
  a **yardstick fight** on copies of the actual PCs recorded on `TURN_LEDGER.md`. ⚑ is reserved
  for feel and design; a row that asks Ben to *decide* is a ruling, not a row.

## 7. The order of the pass (RULED R-135 (a), 2026-09-14)

Corvaine + the Riverlands → Thalendor → Malcurr → the remaining nations in canon order; each nation
waits only for the rulings it needs (all eight answered); **the first yardstick set — a minion pack,
a rival pair, a boss on copies of the actual PCs — runs BEFORE Corvaine's pass** so the retune has
numbers; the `attributes` line and the cue labels land in the same pass as each nation's content.
Item 156 is the pass; item 155 the fights.
