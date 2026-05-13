# Edha Character Building Rules

**Status:** Canonical reference. Reflects rules confirmed in the talent-data audit (April 2026). Source files: `Edha_Talent_Data_v2.xlsx`, `Edha_Character_Builder_v2.xlsx`, `Phase_2_World_Foundation/03_How_Magic_Works.txt`, `Edha_Playtest_PCs_v2.md`, `DESIGN_NOTE_Character_Builder.md`.

This document is the authority when these rules disagree with anything else in the project. If a playtest doc, article, or older spreadsheet contradicts this, this wins.

---

## Paths

Every PC has up to four path slots. The four slots are filled differently:

| Slot | Mandatory? | Source | Key talent | Notes |
|---|---|---|---|---|
| Heroic | Yes | One of: Agent, Envoy, Hunter, Leader, Scholar, Warrior | Granted at L1 | 
| Leyline (primary) | Yes | One of: White, Blue, Black, Red, Green | Granted at L1 | 
| Leyline (secondary) | Optional | A second leyline color | Not granted; must be bought | 
| Deity | Optional | One of 10 deity domains | Not granted; must be bought | Skill prereqs apply (see below) |

## Talent budget by level

Talents fill these slots over levels 1–7. The budget is what the PCs v2 doc confirmed:

| Level | Talents added | Notes |
|---|---|---|
| L1 | 5 | Heroic Key (granted) + 1 Heroic pick + Leyline Key (granted) + 1 Leyline pick + 1 free |
| L2 | 1 | free |
| L3 | 1 | free |
| L4 | 1 | free |
| L5 | 1 | free |
| L6 | 2 | free (tier-up bonus at L6) |
| L7 | 1 | free |
| **Total at L7** | **12** | 2 mandatory Keys + 10 other talents |

Beyond L7, the per-level pattern repeats: 1 free per level with bonus picks at tier-up levels (L11, L16). The Builder Reference sheet's `Talent Pts` column is the formal source for any level: `4 + L + count of {6, 11, 16} ≤ L`.

### Level 1 picks

The two L1 picks are:

- **Restricted to non-Key talents** in their respective paths
- **Must be spent at L1 or lost** (no banking)

Specialty subtree categories — Strategist, Surgeon, Conflagration, Coordination, Bulwark, Accord, etc. — are **design groupings**, not selection locks. A player can pick a Strategist talent at L1 and a Surgeon talent at L4; both are Scholar-path talents and both are available as long as their own prerequisites are met.

### Path Keys are L1-only

**Heroic and Leyline Keys can only be taken at L1.** After L1, talents from any path (Heroic, Leyline, or Deity) can be bought with free talent points as long as the talent's own prereqs are met.

**Picking up a non-L1 path's talents does NOT grant that path's Key benefit.** A Red-Leyline PC who buys Green talents still uses Red Leyline Attunement on Draw Mana — they do not get the Green difficult-terrain rider. Cross-path talents work mechanically; the Key effect doesn't transfer.

### Deity is optional

A PC may take a Deity path at any level the deity's skill prerequisites are met. Typical prerequisite shape: 2 ranks each in two leyline-color skills. (See "Path skill attributes" below for which skill goes with which color.)

The Deity Key reads:

> "Gain 1 talent point for use on this path."

That bonus point **must be spent the same level on a deity-path talent or it's lost**. Skipping the Deity saves 1 talent point overall but loses the bonus. So:

- PC with deity → 13 total talents at L7
- PC without deity → 12 total talents at L7

---

## Path → skill attribute mapping

This is the **canonical mapping**. The Builder Reference sheet and `DESIGN_NOTE_Character_Builder.md` agree on it; 

### Leyline colors

| Color | Skill attribute | Draw Mana effect |
|---|---|---|
| Red | STR | Advantage on next Physical test, lose Reaction until next turn |
| Blue | INT | Advantage on next Cognitive test |
| White | WIL | Allies in Attunement Range heal HP equal to your Tier |
| Green | AWA | Create difficult terrain at a chosen point in range |
| Black | PRE | Each enemy in range with no ally within 10 ft becomes Weakened |

### Deity domains

| Domain | Deity | Skill attribute |
|---|---|---|
| Life | Anaveth | AWA |
| Knowledge | Gnothis | AWA |
| Civilization | Kethane | WIL |
| Chaos | Maelith | PRE |
| Death | Morrath | PRE |
| Fate | Olvarra | WIL |
| Destruction | Razkael | STR |
| Order | Tessavain | WIL |
| Power | Tyrith | STR |
| Sovereignty | Verdannis | PRE |

(Verdannis's domain is **Sovereignty**, not "Nature." Older articles used "Nature" — those have been corrected.)

---

## Skill → attribute mapping

| Skill | Attribute | Skill | Attribute |
|---|---|---|---|
| Agility | SPD | Lore | INT |
| Athletics | STR | Medicine | INT |
| Heavy Weaponry | STR | Deception | PRE |
| Light Weaponry | SPD | Insight | AWA |
| Stealth | SPD | Leadership | PRE |
| Thievery | SPD | Perception | AWA |
| Crafting | INT | Persuasion | PRE |
| Deduction | INT | Survival | AWA |
| Discipline | WIL | | |
| Intimidation | WIL | | |

Each leyline color and each deity domain also has a magic-skill of the same name (e.g., the White skill, the Sovereignty skill). Those magic skills use the attributes from the table above.

---

## Derived stats

| Stat | Formula |
|---|---|
| Physical Defense | 10 + STR + SPD |
| Cognitive Defense | 10 + INT + WIL |
| Spiritual Defense | 10 + AWA + PRE |
| Focus | 2 + WIL |
| Investiture | 2 + max(AWA, PRE) — only available if attuned to a leyline |
| Movement | 20 + SPD·5 ft |

### HP

HP is computed by accumulating per-level HP gain. Per-level gain depends on tier:

| Level | HP gain |
|---|---|
| L1 | 10 + STR |
| L2–L5 | +5 |
| L6 | 4 + STR (tier 2 transition) |
| L7–L10 | +5 |
| L11 | 3 + STR (tier 3 transition) |
| L12–L15 | +5 |
| L16 | 2 + STR (tier 4 transition) |
| L17–L20 | +5 |

At L7 with STR 0: HP = 39. With STR included: **HP at L7 = 39 + 2·STR**.

### Recovery Die

| WIL | Die |
|---|---|
| 0–1 | d4 |
| 2–3 | d6 |
| 4–5 | d8 |
| 6 | d10 |
| 7 | d10 |

### Senses Range

| AWA | Range |
|---|---|
| 0 | 10 ft |
| 1 | 15 ft |
| 2–3 | 20 ft |
| 4 | 25 ft |
| 5–6 | 30 ft |

---

## Level progression and resources

| Level | Tier | Max Skill Rank | Attribute Pts | Skill Ranks | Talent Pts |
|---|---|---|---|---|---|
| 1 | 1 | 2 | 12 | 5 | 5 |
| 2 | 1 | 2 | 12 | 7 | 6 |
| 3 | 1 | 2 | 13 | 9 | 7 |
| 4 | 1 | 2 | 13 | 11 | 8 |
| 5 | 1 | 2 | 13 | 13 | 9 |
| 6 | 2 | 3 | 14 | 15 | 11 |
| 7 | 2 | 3 | 14 | 17 | 12 |
| 8 | 2 | 3 | 14 | 19 | 13 |
| 9 | 2 | 3 | 15 | 21 | 14 |
| 10 | 2 | 3 | 15 | 23 | 15 |
| 11 | 3 | 4 | 15 | 25 | 17 |
| 12 | 3 | 4 | 16 | 27 | 18 |
| 13 | 3 | 4 | 16 | 29 | 19 |
| 14 | 3 | 4 | 16 | 31 | 20 |
| 15 | 3 | 4 | 17 | 33 | 21 |
| 16 | 4 | 5 | 17 | 35 | 23 |
| 17 | 4 | 5 | 17 | 37 | 24 |
| 18 | 4 | 5 | 18 | 39 | 25 |
| 19 | 4 | 5 | 18 | 41 | 26 |
| 20 | 4 | 5 | 18 | 43 | 27 |

Underlying formulas:
- Tier = `INT((L-1)/5) + 1`
- Max Skill Rank = `INT((L-1)/5) + 2`
- Attribute Points = `12 + count of {3, 6, 9, 12, 15, 18} ≤ L`
- Skill Ranks = `5 + (L-1) × 2`
- Talent Points = `4 + L + count of {6, 11, 16} ≤ L`

### Leyline Rank Scaling, or [Die], [Size], [Attunement Range]

Many Leyline talents scale with ranks in the given Leyline skill and is referenced in talent descriptions as `[Die]`, `[Size]�, or �[Attunement Range]�:

| Rank | Die | Size | Attunement Range
|---|---|
| 1 | d4 | 2.5 | 15
| 2 | d6 | 5 | 30
| 3 | d8 | 10 | 60
| 4 | d10 | 15 | 90
| 5 | d12 | 20 | 120


`[Tier][Die]` notation in a description means "roll Tier copies of the rank Die." `[Die]` alone means "roll one rank Die."

---

## Leyline magic mechanics

### Drawing Mana

The fundamental magical action. Spend 1 Action to restore Investiture equal to your highest Magic skill Rank. Drawing Mana also fires the color's Attunement effect automatically (see Path table above).


### Specialty trees

Each leyline color has a **Key talent** and **three specialty trees**. The specialty trees are **design groupings** — they organize related talents thematically but do not impose a selection topology. There is no fixed node count, and no capstones. Within a tree, individual talents have their own prerequisites; outside of those prereqs, a player can pick any talent in any specialty tree on any path.

| Color | Specialty trees |
|---|---|
| White | Coordination, Bulwark, Accord |
| Blue | Calculation, Foresight, Illusion |
| Black | Isolation, Subjugation, Ritual |
| Red | Conflagration, Frenzy, Momentum |
| Green | Instinct, Territory, Restoration |

A player is not locked into one specialty tree per color — see "Level 1 specialty picks" above. Specialty names are descriptive of the talent cluster, not selection-restrictive.

### The healing split

Hard rule (from How Magic Works):

- **White** heals distributed and shallow. Restores small HP across multiple allies. **Cannot** remove Injuries.
- **Green** heals single-target and deep. Restores large HP to one creature. **Can** remove Injuries. Cannot AoE heal.

These do not overlap. Don't write a White talent that single-targets deep healing or a Green talent that AoEs.

---

## Damage and defense

Five damage types, split by whether they bypass Deflect:

- **Reduced by Deflect (typically armor):** Impact, Keen, Energy
- **Bypass Deflect:** Vital, Spirit

Vital damage is notably more dangerous against armored targets. Spirit damage similarly bypasses physical mitigation.

Three defenses, attacker chooses based on attack type:

| Defense | Formula |
|---|---|
| Physical | 10 + STR + SPD |
| Cognitive | 10 + INT + WIL |
| Spiritual | 10 + AWA + PRE |

---

## Resources

| Resource | Formula | Notes |
|---|---|---|
| HP | See HP table above | At 0 HP: take an Injury, fall Unconscious |
| Focus | 2 + WIL | Fuels talents and resists Influence. Scarce by design — spending it offensively (especially Black Cognitive) creates real tension. |
| Investiture | 2 + max(AWA, PRE) | Only available if attuned to a leyline tree. Restored by Draw Mana. |

---

## Build checklist (use this to validate any new PC)

1. **Attributes** — sum of attribute points equals the level's budget from the table.
2. **Skills** — total ranks equal the level's Skill Ranks budget; no skill exceeds Max Skill Rank.
4. **L1 keys** — Heroic Key and Leyline Key are present and were taken at L1.
5. **L1 picks** — exactly two non-Key talents picked at L1, one in each L1 path.
6. **Talent count** — equals the Talent Points budget for the level. With deity: budget + 1.
7. **Path coherence** — every talent's prerequisites are satisfied by talents and skill ranks the PC actually has.
10. **Derived stats** — recompute Defenses, HP, Focus, Investiture, Movement, Recovery Die, Senses Range from the formulas and confirm against the sheet.

---

