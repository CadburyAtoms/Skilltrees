---
name: build-forge
description: >-
  Design, review or repair a character build in the Edha talent system — a PC's level
  progression, "what should X take next", a whole L2→L10 ladder, an alternate path for an
  existing character, or an NPC adversary's talent list. Use whenever Ben asks what a
  character should take, whether a build is legal, how to spend levels or skill ranks, or
  wants build options laid out. Drives: read the live advancement table and talent data →
  design against the character's actual numbers → validate every gate with
  scripts/validate-build.py → hand off to handout-forge if it needs to be printable.
---

# Build-forge — planning a legal, sharp build in the Edha system

Written 2026-09-09, after a level-up handout shipped with **three picks Foundry would have
refused**. Everything below is either a fact read out of the live data or a trap that cost a
cycle on that build.

**The deliverable is a validated ladder, not a pretty one.** A build that reads well and
cannot be taken is worse than no build at all, because the player only finds out at the table.
`scripts/validate-build.py` is not optional — run it before anything reaches a player.

---

## Phase 0 — Read the character's actual numbers, never the character sheet's vibe

Pull the PC's real stats from Foundry (`bench-run` can join and read them) or from the state
doc, and write down: attributes, every skill rank, HP/focus/Investiture, deflect, and the
talents already held. **Derived modifiers decide the whole build**, and they are
`attribute + rank`:

| Leyline | Tests off | | Resource | Formula |
|---|---|---|---|---|
| White | Willpower | | max health | `10 + Strength` |
| Blue | Intellect | | max focus | `2 + Willpower` |
| Black | Presence | | max Investiture | `2 + max(Awareness, Presence)` |
| Red | Strength | | Attunement Range | by leyline RANK: `0/15/30/60/90/120` ft |
| Green | Awareness | | `[Tier][Die]` | `(tier)d(2 × colour rank + 2)` |

The most valuable single question is usually **"which of this character's stats is their
colour actually keyed to?"** A White character with Willpower 0 has a +2 signature skill; a
Blue character with Intellect 3 has +5. That one fact reshapes every option.

## Phase 1 — The advancement table (from the system, not from memory)

Read it out of `systems/cosmere-rpg/index.js` (`advancement.rules`) if you need to re-confirm.
As of system 2.1.0, levels 1–10:

- **1 talent and 2 skill ranks per level.** Attribute points at levels **3, 6 and 9** only.
- **Max skill rank 2 through level 5, 3 from level 6.**
- **Tier 1 through level 5, tier 2 from level 6.**

**Level 6 is the whole shape of a build.** Tier and rank cap rise in the same step, so a rank-2
colour at tier 1 rolls `1d6` and a rank-3 colour at tier 2 rolls `2d8` — average damage 3.5 → 9.
Plan 2–5 as setup and 6 as the payoff, and mark that row on anything you hand a player.

## Phase 2 — The gates (this is where builds break)

Read prereqs from `data/leyline.json`, `data/cosmere.json`, `data/domain.json`. The requirement
model is `scripts/validate.js`'s, and it has **two** halves:

1. **`connections` are managed prerequisites, not decoration** (iron rule 7). Every entry that
   resolves inside the same tree forms ONE group, satisfied by owning **any** of them.
2. Each **prose** group (split on `;` and `,`, then on ` or `) is its own group. **AND across
   groups.**

⚠️ **The trap that shipped:** `Thorn Field`'s prose prereq is only "Green 2+", but its
`connections` are `["Grasping Vines"]`. A checker reading the string alone passes it; Foundry
refuses it. Three picks shipped this way. **Always read `connections` too.**

Other gate facts worth knowing before you plan:

- **Every deity tree needs BOTH its colours at rank 2+.** A character has one *attunement* but
  buys ranks in a second colour — that is intended (the session-zero sheet says "2 ranks in each
  color"). It is a real cost: 2 skill ranks minimum, sometimes 3.
- **Narrative prereqs exist and are GM calls** — eight of them, including "Patron in high
  society", "a companion", "Title granting you command of 5+ people". They are not blockers, but
  say so on the sheet so the player asks.
- **Names collide across trees.** `Collected` exists in **five** trees, `Hardy` in several,
  `Shatter Focus` in two. Always name the tree *and* specialty.
- **A chain can be longer than it looks.** `Mending Aura` reads "White 2+" but sits behind
  Concordant Presence → Beacon of Stability → Ordered Advance — four picks deep.

## Phase 3 — Design with the character's grain, not against it

Good builds in this system come from three questions, in order:

1. **What is this character's best number, and what talent tree rolls it?** The strongest find
   on the 2026-09-09 pass was that an Envoy's best skill (Blue +5) has **no attack talents at
   all** — but the Chaos deity tree *tests Blue*, so one skill rank turned her best stat into
   her offense.
2. **What does the tree pay in, rank or modifier?** Check the authored formula, not the card.
   `[Tier][Die]` scales off **rank**; a `+ Attribute` rider is separate. A tree whose dice ride a
   colour you will never raise is a trap.
3. **What does this character never have to roll?** The best builds dodge a bad stat instead of
   paying to fix it. Order's `Edict` is a *placement, not a test* — it cannot miss. Sovereignty
   tests Black (Presence-keyed). Fate's damage adds Awareness. Look for the tree that routes
   around the dump stat.

Also worth checking every time: **is the character's equipped weapon on a skill they have?**
A Mace is Light Weaponry; a rank-2 Heavy Weaponry character swinging one is worse than their
fists. And **vital/spirit damage ignores deflect** — decisive against armoured enemies.

## Phase 4 — Validate. Always.

```bash
python scripts/validate-build.py <spec.json>      # a character ladder
python scripts/validate-build.py                  # self-test: docs/levelup-builds.json
python scripts/validate-build.py --adversaries    # every adversary's talent list
```

It checks connections + prose gates at the level taken, the ≤2-ranks-per-level budget, the rank
cap for that level, no-op purchases (a "rank" the character already has — this shipped too), and
ambiguous names. Narrative prereqs are reported as GATE lines, not failures. **A build is not
finished until this prints PASS.**

Spec shape is in the script's docstring. Keep validated builds in `docs/levelup-builds.json` so
the self-test doubles as a regression fixture.

## Phase 5 — Adversaries

Adversaries differ in three ways:

- **Colour rank comes from ROLE, not from skill ranks:** `minion 1, rival 2, boss 3`
  (`ROLE_LEYLINE_RANK`, `scripts/foundry-build.js`). A minion with `leylines: ["white"]` has
  White 1 — so a talent needing White 2+ is out of reach at that role.
- **Talents are listed as `"Tree/Talent Name"`** in `data/adversaries.json`, and the build
  auto-embeds each colour's Key.
- **Prereqs and rank requirements do NOT apply to adversaries (R-94).** Ben, 2026-09-09:
  *"I'm fine with adversaries skipping around on talent trees and rank requirements."* Nothing in
  the repo enforces them — `scripts/validate.js` only checks that a talent ref RESOLVES — and that
  is deliberate. **Do not "fix" an adversary to make its talents legal.** `--adversaries` still
  lists off-tree picks, because it tells you what a statblock costs the players: a minion holding
  something a PC would need two picks and a rank-2 skill to reach is stronger than its role
  advertises. That may be exactly the intent. Role is the lever if it isn't (minion 1 / rival 2 /
  boss 3).

Bespoke adversary abilities (not tree talents) are a different surface with their own wiring
standard — see `leyline-tree-authoring` §"Adversary abilities" and `lint-refs.js` pass 5.

## Phase 6 — Card text vs engine formula

When a talent's text names a quantity as **"your \<Colour\>"**, check the authored formula before
you build around it — the two have drifted:

| Formula | Means | Card should say |
|---|---|---|
| `@skills.<colour>.rank` | rank only | "your **ranks in** \<Colour\>" |
| `@skills.<colour>.mod` | attribute + rank | "your \<Colour\>" |
| `@skills.<colour>.rank + @attr.<attr>` | also the modifier | "your \<Colour\>" |

Ben's ruling, 2026-09-09: **where the engine pays rank, the card is what gets reworded** — the
code is right. That pass found four talents phrasing a quantity as "your \<Colour\>"; two were
correct (`Kindle`, `Bonds of Community` — both resolve the modifier) and two were reworded
(`Bear Witness`, `Shoulder the Oath` — both resolve rank). The canon convention everywhere else
is the unambiguous **"your ranks in X"**, used in 21+ talents.

## Phase 7 — If it has to be printable

Hand off to **`handout-forge`** — it owns the page design, the render loop, and the
verification that catches silent clipping. Do not re-derive that; this skill stops at a
validated ladder plus the framing prose (spine, what-each-level-buys, the one big lever).

`EDHA_LEVELUP_GUIDES.html` is the worked example: nine pages, three build options per PC,
generated from `docs/levelup-builds.json` so every talent's text is pulled verbatim from the
atlas data at build time rather than retyped.

## Close-out

Dated delta at the top of the current month's `docs/handoff-changelog/2026-MM.md`; run
`node scripts/gates.js`. A change to a talent's **text** is an authored change — say
**"pack rebuild + ⟳ Sync"** in the commit message and the delta (iron rule 1), and update
BOTH the authored overlay and the source prose in `data/domain.json` / `leyline.json` /
`cosmere.json`.
