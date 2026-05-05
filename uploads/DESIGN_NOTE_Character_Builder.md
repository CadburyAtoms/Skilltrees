# Character Builder — Claude Design Implementation Notes

**Date:** 2026-04-21
**Context:** Excel draft (Edha_Character_Builder.xlsx) exists as a functional prototype. When Claude Design's limit resets, the character builder should be rebuilt as a native HTML/JS application — not by porting the Excel formulas.

## Why Build Fresh (Not Port)

The Excel version uses FILTER() dynamic arrays, INDIRECT() named-range switching, and helper columns to work around Excel's static data-validation model. These are workarounds for platform limitations, not good architecture. The Design version should use native JavaScript for all filtering, validation, and UI logic.

## Key Architecture Decisions for Design

**Talent Dropdown Filtering:**
- In Excel: FILTER() formulas on a hidden Calc sheet generate candidate lists, with a simplified helper column for prerequisite checking. Multi-condition prereqs (semicolons, "or" logic) default to "available" because parsing them in Excel formulas is impractical.
- In Design: Use JavaScript `Array.filter()` directly on the talents.json data. Parse prerequisite strings properly — split on `;` for AND conditions, split on ` or ` for OR conditions, regex match `(\w+)\s+(\d+)\+` for skill-rank requirements, and exact-match against selected talents for talent prerequisites. This is ~20 lines of JS vs. hundreds of cells of helper formulas.

**Skill Rank Tracking:**
- In Excel: Spin buttons require VBA/.xlsm format. Draft uses typed inputs instead.
- In Design: Use `<input type="number">` with min/max attributes, or +/- button components. Trivial in HTML.

**Path Skill Auto-fill:**
- In Excel: VLOOKUP chains to map path selection → attribute index → attribute value for modifier calculation.
- In Design: A simple JS object maps path names to attribute keys. `pathAttrMap["Red"] = "STR"` — one lookup, done.

**Investiture:**
- Formula: `2 + Math.max(awareness, presence)`
- No special handling needed.

**Data Source:**
- Use `talents.json` directly (already in project files under Magic System/)
- The JSON has `atlas`, `path`, `specialty`, `name`, `action`, `cost`, `prerequisites`, `description`, `flavor`, `tags` fields
- Deity talents use deity names as `path` (Anaveth, Gnothis, etc.) with domain as `specialty` (Life, Knowledge, etc.)
- For the builder UI, display domain names as the user-facing deity path identifier
- Deity-to-domain mapping: Anaveth/Life, Gnothis/Knowledge, Kethane/Civilization, Maelith/Chaos, Morrath/Death, Olvarra/Fate, Razkael/Destruction, Tessavain/Order, Tyrith/Power, Verdannis/Sovereignty

## Path-to-Attribute Mapping (for path skills)

Leyline: Red/STR, Blue/INT, White/WIL, Green/AWA, Black/PRE

Deity Domains: Life/AWA, Knowledge/AWA, Civilization/WIL, Chaos/PRE, Death/PRE, Fate/WIL, Destruction/STR, Order/WIL, Power/STR, Sovereignty/PRE

## Prerequisite Parsing Logic (for Design implementation)

```javascript
function checkPrereqs(prereqString, selectedTalents, skillRanks) {
  if (!prereqString) return true;
  
  // Split on semicolons for AND conditions
  const conditions = prereqString.split(';').map(s => s.trim());
  
  return conditions.every(cond => {
    // Check for "or" alternatives
    if (cond.includes(' or ')) {
      const alternatives = cond.split(' or ').map(s => s.trim());
      return alternatives.some(alt => checkSingleCondition(alt, selectedTalents, skillRanks));
    }
    return checkSingleCondition(cond, selectedTalents, skillRanks);
  });
}

function checkSingleCondition(cond, selectedTalents, skillRanks) {
  // Skill rank pattern: "SkillName N+"
  const skillMatch = cond.match(/^(.+?)\s+(\d+)\+$/);
  if (skillMatch) {
    const [, skillName, reqRank] = skillMatch;
    return (skillRanks[skillName] || 0) >= parseInt(reqRank);
  }
  // Talent name check
  return selectedTalents.includes(cond);
}
```

## Character Creation Rules (Edha-specific, differs from Stormlight)

- Level 1: 12 attribute points (none > 3), 5 skill ranks (4 + 1 from heroic), max skill rank 2
- Health: 10 + STR base; +5/level; levels 6/11/16 give (4+STR)/(3+STR)/(2+STR) instead
- Attribute points: +1 at levels 3, 6, 9, 12, 15, 18
- Skill ranks: +2 per level; max rank increases by tier (T1:2, T2:3, T3:4, T4:5)
- Talent points: 5 at level 1 (ancestry + heroic key + heroic add + leyline key + leyline add); +1/level; +1 bonus at levels 6, 11, 16
- 3 blank skill slots filled by leyline/deity path selections
- Investiture: 2 + max(AWA, PRE)
