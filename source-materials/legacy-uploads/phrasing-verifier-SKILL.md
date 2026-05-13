---
name: phrasing-verifier
description: >
  Verify and auto-fix talent descriptions in the Edha Talent Browser (or other Edha/Cosmere
  RPG character builder spreadsheets) so they follow the standardized phrasing conventions
  from the official Stormlight RPG rules. Use this skill whenever the user wants to check,
  audit, lint, review, fix, or standardize the wording of talent descriptions for phrasing
  consistency. Also trigger when the user mentions phrasing consistency, style compliance,
  description formatting, or standardizing game-mechanic text across their homebrew talents.
  Even if they just say something like "check my talents", "are my descriptions consistent",
  "I added new talents, do they match the style", or "fix my phrasing", this is the right
  skill.
---

# Talent Description Phrasing Verifier & Auto-Fixer

You are checking and auto-correcting talent descriptions in the Edha RPG talent browser
against the phrasing conventions established by the official Cosmere RPG source material
and confirmed design decisions from playtesting sessions. The goal is to make every custom
talent description read as though it belongs in the same rulebook as the official ones.

## Environment compatibility

This skill is designed to work in **Cowork** and **Claude Code**. It uses standard
Python (json for I/O, re for regex) — no external services, no browser, no CLI-specific
tools, no Excel dependencies.

**The source of truth is `talents-v2.json`**, not an Excel file. All reads and writes
operate on this JSON file.

**Key differences by environment:**
- **Cowork:** Use bash to run Python scripts. File paths use the workspace mount
  (e.g., `/sessions/.../mnt/Worldbuilding/`). Use the Read/Write/Edit file tools
  for the report markdown.
- **Claude Code:** Use bash to run Python scripts. Use standard file paths.

In all environments, the workflow is the same: read the JSON → apply fixes → write
the updated JSON → generate a change log.

---

## Path categories — what's source vs. what gets fixed

The talent database contains talents from several origins, and the skill treats them
differently. The **Data** sheet includes an **Atlas** column that categorizes each talent:

**Source material (never modify — learn from them instead):**
- Atlas value: `heroic` — Heroic paths (Agent, Warrior, Scholar, Leader, Envoy, Hunter)
- Atlas value: `radiant` — Radiant paths (Windrunner, Skybreaker, Dustbringer, etc.)

These come from the official Cosmere RPG rules. Their phrasing is the gold standard.
Even when they do things that might look "inconsistent" (like starting with "You can..."
or omitting trailing periods), those patterns are *valid*. Use them to build your
understanding of acceptable phrasing. **Never edit source-material descriptions.**

**Custom material (check and auto-fix these):**
- Atlas value: `leyline` — Leyline paths (White, Black, Red, Blue, Green)
- Atlas value: `deity` — Deity paths (Death, Chaos, Power, Sovereignty, Life, Destruction,
  Order, Knowledge, Fate, Civilization)

If the Atlas column is missing, fall back to matching on Path name using the lists above.

---

## How to run a verification and auto-fix

### Step 1: Identify the file

The default target is **`talents-v2.json`** in the user's Worldbuilding folder.
This is the living document where edits are made and new talents are added. If the user
specifies a different file, use that instead.

The JSON is a flat array of talent objects with these fields:
`Atlas`, `Path`, `Specialty`, `Name`, `Action`, `Cost`, `Prerequisites`, `Description`

### Step 2: Read the JSON and categorize talents

Use Python's `json` module to load the file. Categorize each talent using the `Atlas`
field into source or custom.

### Step 3: Apply automatic fixes to custom talents

For each custom talent, apply these **deterministic, safe fixes** directly to the
Description cell. These are mechanical text transformations that don't require judgment:

**Auto-fix: Capitalization (Rule 2)**
These are simple find-and-replace operations on the description text:

```python
import re

def auto_fix_description(desc):
    fixed = desc

    # --- Lowercase fixes ---

    # Fix "Focus" → "focus" (but not "Focused" which is a condition name)
    fixed = re.sub(r'\bFocus\b(?!ed)', 'focus', fixed)
    # Restore "focus" at start of sentence
    fixed = re.sub(r'(?<=\. )focus', 'Focus', fixed)
    fixed = re.sub(r'^focus', 'Focus', fixed)

    # Fix "Tier" → "tier" (but not inside bracket notation [Tier])
    fixed = re.sub(r'(?<!\[)\bTier\b(?!\])', 'tier', fixed)
    fixed = re.sub(r'(?<=\. )tier', 'Tier', fixed)
    fixed = re.sub(r'^tier', 'Tier', fixed)

    # Fix "Advantage" → "advantage" (but not "Gain Advantage" action name)
    fixed = re.sub(r'(?<!Gain )\bAdvantage\b', 'advantage', fixed)

    # Fix "Disadvantage" → "disadvantage"
    fixed = re.sub(r'\bDisadvantage\b', 'disadvantage', fixed)

    # Fix "Defenses" → "defenses" (generic use; specific defense types stay capitalized)
    fixed = re.sub(r'\bDefenses\b(?! Against)', 'defenses', fixed)

    # Damage types are always lowercase
    for dtype in ['Energy', 'Impact', 'Keen', 'Vital', 'Spirit']:
        # Only lowercase when followed by "damage" to avoid other uses
        fixed = re.sub(rf'\b{dtype}\b(?= damage)', dtype.lower(), fixed)

    # Fix "health" capitalization (HP is acceptable shorthand; "health" lowercase)
    fixed = re.sub(r'\bHealth\b(?! equal| to)', 'health', fixed)

    # --- Phrasing fixes (Rule 3) ---

    # Fix "gain Advantage" / "gain advantage" → "gain an advantage"
    fixed = re.sub(r'\bgain [Aa]dvantage\b', 'gain an advantage', fixed)

    # Fix "costs X focus" → "spend X focus"
    fixed = re.sub(r'costs?\s+(\d+)\s+focus', r'spend \1 focus', fixed)

    # Fix "during this scene" → "for the scene"
    fixed = re.sub(r'during this scene', 'for the scene', fixed, flags=re.IGNORECASE)

    # Fix "for the duration of the scene" → "for the scene"
    fixed = re.sub(r'for the duration of the scene', 'for the scene', fixed, flags=re.IGNORECASE)

    # Fix "suffer X damage" → "take X damage"
    fixed = re.sub(r'\bsuffers?\s+', 'takes ', fixed, flags=re.IGNORECASE)
    # Restore sentence-start capitalization
    fixed = re.sub(r'^takes ', 'Takes ', fixed)

    # Fix "take disadvantage" → "have disadvantage" (disadvantage is a state, not received)
    fixed = re.sub(r'\btakes? disadvantage\b', 'has disadvantage', fixed, flags=re.IGNORECASE)

    # Fix "until the end of the scene" → "for the scene"
    fixed = re.sub(r'until the end of the scene', 'for the scene', fixed, flags=re.IGNORECASE)

    return fixed
```

Apply this function to every custom talent description.

### Step 4: Write the updated JSON file

Write the modified talent list back to `talents-v2.json` using `json.dump` with
`indent=2` and `ensure_ascii=False`. Use the same filename — this is the user's
working document and they want it updated in place. Only the `Description` field of
custom talents should be modified.

### Step 5: Generate a change log

After fixing, produce a markdown change log showing what was changed:

```
# Phrasing Auto-Fix Change Log

**File:** Edha_Talent_Browser.xlsx
**Date:** [today]

## Summary
- Custom talents scanned: X
- Descriptions auto-fixed: Y
- Unchanged: Z
- Items needing manual review: N

## Changes Applied

### [Path] / [Specialty] — [Talent Name]
**Before:** [original description]
**After:** [fixed description]
**Fixes:** [list of rules applied]

## Manual Review Needed

[Items that require judgment]

## Shared-Name Mismatches

[Talents sharing names with source material but different descriptions]
```

Save the change log as a `.md` file in the user's Worldbuilding folder.

### Step 6: Flag items needing manual review

Some issues can't be auto-fixed because they require judgment:

- **Rule 1 (Imperative voice):** Descriptions starting with bare "You" (not "You can...")
- **Rule 4 (Flavor text):** Descriptions containing narrative language in the Description
  field (flavor belongs in the Flavor field, not Description)
- **Shared-name mismatches:** Custom talents with the same name as source talents but
  different descriptions

---

## Style Reference

### Rule 1: Imperative voice preferred (manual review)

Source material most commonly uses imperative mood. "You can..." is acceptable. Bare
"You" + verb where imperative would be more concise gets flagged for manual review.

### Rule 2: Game term capitalization

**Always capitalized (conditions):** Prone, Stunned, Slowed, Empowered, Focused,
Disoriented, Weakened, Surprised, Determined, Restrained, Frightened, Compelled,
Afflicted, Injured

**Always capitalized (mechanics):** Opportunity, Complication, Reaction, Strike, Aid,
Dodge, Brace, Reactive Strike, Gain Advantage, Draw Mana, Attunement Range, Investiture,
Stormlight, Deflect, Plot Die

**Always capitalized (attributes):** Strength, Speed, Willpower, Intelligence, Presence,
Awareness

**Always capitalized (defense types):** Physical, Cognitive, Spiritual (when used as
defense types, e.g. "Cognitive defense", "Spiritual Defense")

**Always lowercase:** focus, advantage, disadvantage, tier (outside bracket notation),
health, defenses (generic), energy, impact, keen, vital, spirit (damage types),
slow turn, fast turn, free action

**Bracket notation (preserve capitalization):** `[Tier]`, `[Die]`, `[Size]`

### Rule 3: Standard phrasing patterns (auto-fixed)

| Fix | Before | After |
|-----|--------|-------|
| Advantage phrasing | "gain Advantage" | "gain an advantage" |
| Focus spending | "costs X focus" | "spend X focus" |
| Scene duration | "during this scene" | "for the scene" |
| Scene duration | "for the duration of the scene" | "for the scene" |
| Scene duration | "until the end of the scene" | "for the scene" |
| Damage receipt | "suffer X damage" | "take X damage" |
| Disadvantage state | "take disadvantage" | "have disadvantage" |

### Rule 4: No flavor text in Description (manual review)

Metaphors, sensory language, and narrative prose belong in the Flavor field. Flag
descriptions containing these for manual review. Mechanical in-world references
(e.g. "Speak the Third Ideal") are fine.

### Rule 5: Cost-in-description is intentional

The Cost field drives the UI node display. The Description must also contain the cost
so the talent is self-contained when looked up. Having cost in both fields is correct
and should NOT be flagged.

### Rule 6: "Special" action type

"Special" means the talent has a conditional trigger — "if X happens, you may pay the
cost to activate." The cost belongs in the Description as part of the conditional clause.
Do not flag this pattern.

### Rule 7: Test structure

The standard phrasing for skill tests against defenses is:
> "test [Skill] vs. [Defense] defense"
or
> "test [Skill] against [creature]'s [Defense] defense"

Blue skill tests (Cognitive) test against Cognitive defense.
Influence tests test against Spiritual or Cognitive defense depending on context.
Physical tests test against Physical defense.

Flag deviations from this structure.

### Rule 8: Opportunity spend format

Opportunity-spend talents should follow this structure:
> "Spend an Opportunity and [cost] to [effect]."

Flag talents that use Opportunity as a cost but don't follow this structure.

### Rule 9: Persistent effect duration

Effects lasting until destroyed should read:
> "for the scene or until destroyed"

Effects lasting a round should read:
> "until the end of your next turn" or "until the start of your next turn"

### Rule 10: Homebrew notation consistency

`[Die]`, `[Tier]`, `[Size]` — check these are used consistently with no spaces between
tokens (e.g. `[Tier][Die]` not `[Tier] [Die]`). Flag inconsistencies.

---

## Edge cases

- **"When you..." openers**: Valid. Only note if an entire specialty uses this exclusively.
- **HP vs health**: HP is the preferred abbreviation. "health" lowercase is also acceptable.
  Note inconsistency within the same path.
- **"creatures" vs "characters"**: Both are used in source material. Do not auto-fix.
- **Shared-name talents**: Flag for manual review with side-by-side comparison.
- **"[Tier]" in bracket notation**: Preserve capitalization — this is notation, not the
  word "tier."

---

## What NOT to touch

- Any source-material (heroic/radiant) descriptions
- Game balance
- Any field other than `Description`
- JSON structure, field names, or ordering
