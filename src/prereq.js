/* Prereq engine.

   Evaluates a prereq string against a character + global talent context.

   String shapes supported:
     "Athletics 2+"             skill rank
     "STR 3+"                   attribute requirement (alias names supported)
     "White 1+"                 leyline color skill rank
     "Life 2+"                  deity skill rank
     "Healing Light"            talent name (any atlas)
     "A; B"                     A AND B
     "A or B"                   A OR B
     "—" / "-" / ""             no prereqs (auto-pass)

   Returns: { ok: bool, clauses: [{text, ok, kind, narrative?: bool, detail?: string}] }

   Anything unparseable → narrative clause; ok if `character.narrativeFlags` contains the exact text.
*/

const ATTR_ALIASES = {
  STR: 'STR', STRENGTH: 'STR',
  SPD: 'SPD', SPEED: 'SPD',
  INT: 'INT', INTELLECT: 'INT',
  WIL: 'WIL', WILLPOWER: 'WIL',
  AWA: 'AWA', AWARENESS: 'AWA',
  PRE: 'PRE', PRESENCE: 'PRE',
};

// Standard skill list (canonical from Character_Building_Rules.md).
// Color skills (White/Blue/Black/Red/Green) and deity skills are added dynamically.
const STANDARD_SKILLS = [
  'Agility','Athletics','Crafting','Deception','Deduction','Discipline',
  'Heavy Weaponry','Insight','Intimidation','Leadership','Light Weaponry',
  'Lore','Medicine','Perception','Persuasion','Stealth','Survival','Thievery',
];

const LEYLINE_SKILLS = ['White','Blue','Black','Red','Green'];

function getSkillRank(character, skillName, grants) {
  let base = 0;
  if (character && character.skills) {
    const wanted = skillName.toLowerCase();
    for (const k of Object.keys(character.skills)) {
      if (k.toLowerCase() === wanted) { base = character.skills[k] | 0; break; }
    }
  }
  let granted = 0;
  if (grants) {
    const wanted = skillName.toLowerCase();
    for (const k of Object.keys(grants)) {
      if (k.toLowerCase() === wanted) { granted = grants[k] | 0; break; }
    }
  }
  return base + granted;
}

function getAttribute(character, attrKey) {
  if (!character || !character.attributes) return 0;
  return character.attributes[attrKey] | 0;
}

function hasTalent(character, tid) {
  return !!(character && character.learnedTids && character.learnedTids.has && character.learnedTids.has(tid));
}

function hasNarrativeFlag(character, text) {
  if (!character || !character.narrativeFlags) return false;
  const norm = text.trim().toLowerCase();
  for (const f of character.narrativeFlags) {
    if (f.trim().toLowerCase() === norm) return true;
  }
  return false;
}

// Try to parse a single clause; return classification.
function classifyClause(rawText, ctx) {
  const text = rawText.trim();
  if (!text) return null;

  // Skill rank: "<Skill> N+" or "<Skill> rank N" or "<Skill> N"
  const sr = text.match(/^([A-Za-z][A-Za-z\s]*?)\s+(?:rank\s+)?(\d+)\s*\+?$/i);
  if (sr) {
    const word = sr[1].trim();
    const rank = parseInt(sr[2], 10);
    const upper = word.toUpperCase();
    // Attribute?
    if (ATTR_ALIASES[upper]) {
      return { kind: 'attribute', attr: ATTR_ALIASES[upper], rank, text };
    }
    // Skill — match any known skill (standard, leyline, deity)
    const allSkills = [...STANDARD_SKILLS, ...LEYLINE_SKILLS, ...(ctx.deitySkills || [])];
    const match = allSkills.find(s => s.toLowerCase() === word.toLowerCase());
    if (match) {
      const kind = LEYLINE_SKILLS.includes(match) ? 'leyline' :
                   (ctx.deitySkills || []).includes(match) ? 'deity' : 'skill';
      return { kind, skill: match, rank, text };
    }
  }

  // Talent reference: search by name in talent index
  if (ctx.talentByName) {
    const found = ctx.talentByName[text.toLowerCase()];
    if (found) {
      return { kind: 'talent', tid: found.tid, talentName: found.name, atlas: found.atlas, text };
    }
  }

  // Otherwise narrative
  return { kind: 'narrative', text };
}

// Evaluate a clause against a character
function evalClause(clause, character, ctx) {
  switch (clause.kind) {
    case 'attribute':
      return getAttribute(character, clause.attr) >= clause.rank;
    case 'leyline':
    case 'deity':
    case 'skill':
      return getSkillRank(character, clause.skill, ctx && ctx.grants) >= clause.rank;
    case 'talent':
      return hasTalent(character, clause.tid);
    case 'narrative':
      return hasNarrativeFlag(character, clause.text);
    default:
      return false;
  }
}

// Parse a prereq string into a tree of clauses (top-level AND of OR-groups).
// Splitter: ';' = AND, '/' rare,  ',' = AND, ' or ' = OR within a group.
function parsePrereq(rawString, ctx) {
  if (!rawString || /^\s*[-—]\s*$/.test(rawString)) return [];
  // First split on AND separators
  const andParts = rawString.split(/\s*[;,]\s*|\s+and\s+/i).map(s => s.trim()).filter(Boolean);
  // Each AND-part may contain " or " forming an OR-group
  return andParts.map(part => {
    const orParts = part.split(/\s+or\s+/i).map(s => s.trim()).filter(Boolean);
    return orParts.map(p => classifyClause(p, ctx)).filter(Boolean);
  });
}

function evalPrereqs(rawString, character, ctx) {
  const groups = parsePrereq(rawString || '', ctx || {});
  if (!groups.length) return { ok: true, groups: [] };
  let allOk = true;
  const evaluated = groups.map(group => {
    // OR within group: any clause passes -> group passes
    const clauses = group.map(c => ({ ...c, passed: evalClause(c, character, ctx) }));
    const passed = clauses.some(c => c.passed);
    if (!passed) allOk = false;
    return { clauses, passed };
  });
  return { ok: allOk, groups: evaluated };
}

// Build a global talent index for cross-atlas name lookup.
// Pass an array of atlas trees.
function buildTalentIndex(atlases) {
  const byName = {};
  const byTid = {};
  for (const aid of Object.keys(atlases)) {
    const atl = atlases[aid];
    for (const tree of atl.trees) {
      for (const t of tree.talents) {
        const lower = t.name.toLowerCase();
        // Prefer first occurrence; warn on dup
        if (!byName[lower]) {
          byName[lower] = { tid: t.tid, name: t.name, atlas: t.atlas, group: t.group };
        }
        byTid[t.tid] = t;
      }
    }
  }
  return { byName, byTid };
}

window.Prereq = {
  parsePrereq,
  evalPrereqs,
  buildTalentIndex,
  classifyClause,
  evalClause,
  STANDARD_SKILLS,
  LEYLINE_SKILLS,
  ATTR_ALIASES,
};
