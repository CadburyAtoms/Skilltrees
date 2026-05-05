/* Character store. Single character (slot "default"), schema-versioned for roster.

   Aligned to Character_Building_Rules.md (canonical reference, April 2026 audit).

   Budget model: SINGLE POOL.
     totalTalents = 4 + L + count{6,11,16} ≤ L
     Heroic Key, Leyline Key, every L1 pick, every other talent — all consume from the same pool.
     Deity Key grants +1 bonus point that MUST be spent the same level on a deity-path talent.

   Per-talent timing:
     learnedAt[tid] = level at which it was added (default current level on toggle).
     L1 enforcement:
       - Heroic Key & Leyline Key may only have learnedAt === 1.
       - At most 2 non-Key picks may have learnedAt === 1, one per L1 path.

   Persists to localStorage under skilltrees:character:default.

   Public API (window.Character):
     load() / save() / subscribe() / get() / update()
     setLevel/setName/setNotes/setAttribute/setSkill
     setLeylineKey/setHeroicKey/setDeitySkill
     addNarrativeFlag/removeNarrativeFlag/setExpertises
     toggleTalent(tid)/setTalent(tid, learned, atLevel?)
     derive(state, atlases) -> derived bundle (HP, Investiture, Defenses, Focus,
                                Movement, Recovery Die, Senses Range, budget, validations)
*/

const SLOT = 'default';
const STORAGE_KEY = `skilltrees:character:${SLOT}`;
const SCHEMA = 2;

const DEFAULT_ATTRS = { STR: 0, SPD: 0, INT: 0, WIL: 0, AWA: 0, PRE: 0 };

// Per-level cumulative table — Source: Character_Building_Rules.md (Level Progression and Resources)
//   Tier = INT((L-1)/5)+1
//   Max Skill Rank = INT((L-1)/5)+2
//   Attribute Pts = 12 + count{3,6,9,12,15,18}≤L
//   Skill Ranks = 5 + (L-1)*2
//   Talent Pts = 4 + L + count{6,11,16}≤L
const LEVEL_TABLE = [
  // L  tier maxSkill attrPts skillRanks talentPts
  [ 1,  1,    2,       12,       5,         5 ],
  [ 2,  1,    2,       12,       7,         6 ],
  [ 3,  1,    2,       13,       9,         7 ],
  [ 4,  1,    2,       13,      11,         8 ],
  [ 5,  1,    2,       13,      13,         9 ],
  [ 6,  2,    3,       14,      15,        11 ],
  [ 7,  2,    3,       14,      17,        12 ],
  [ 8,  2,    3,       14,      19,        13 ],
  [ 9,  2,    3,       15,      21,        14 ],
  [10,  2,    3,       15,      23,        15 ],
  [11,  3,    4,       15,      25,        17 ],
  [12,  3,    4,       16,      27,        18 ],
  [13,  3,    4,       16,      29,        19 ],
  [14,  3,    4,       16,      31,        20 ],
  [15,  3,    4,       17,      33,        21 ],
  [16,  4,    5,       17,      35,        23 ],
  [17,  4,    5,       17,      37,        24 ],
  [18,  4,    5,       18,      39,        25 ],
  [19,  4,    5,       18,      41,        26 ],
  [20,  4,    5,       18,      43,        27 ],
];

function levelRow(level) {
  const L = Math.max(1, Math.min(20, level | 0));
  return LEVEL_TABLE[L - 1];
}

// Per-deity domain → attribute (Source: Character_Building_Rules.md → Deity domains table)
const DEITY_SKILL_ATTR = {
  Life: 'AWA',          // Anaveth
  Knowledge: 'AWA',     // Gnothis
  Civilization: 'WIL',  // Kethane
  Chaos: 'PRE',         // Maelith
  Death: 'PRE',         // Morrath
  Fate: 'WIL',          // Olvarra
  Destruction: 'STR',   // Razkael
  Order: 'WIL',         // Tessavain
  Power: 'STR',         // Tyrith
  Sovereignty: 'PRE',   // Verdannis
};

// Leyline color skill → attribute
const LEYLINE_SKILL_ATTR = {
  White: 'WIL', Blue: 'INT', Black: 'PRE', Red: 'STR', Green: 'AWA',
};

// Standard skill → attribute (Source: rules doc, Skill→attribute table)
const SKILL_ATTR = {
  Agility: 'SPD',
  Athletics: 'STR',
  'Heavy Weaponry': 'STR',
  'Light Weaponry': 'SPD',
  Stealth: 'SPD',
  Thievery: 'SPD',
  Crafting: 'INT',
  Deduction: 'INT',
  Discipline: 'WIL',
  Intimidation: 'WIL',
  Lore: 'INT',
  Medicine: 'INT',
  Deception: 'PRE',
  Insight: 'AWA',
  Leadership: 'PRE',
  Perception: 'AWA',
  Persuasion: 'PRE',
  Survival: 'AWA',
};

function skillAttr(name) {
  if (SKILL_ATTR[name]) return SKILL_ATTR[name];
  if (LEYLINE_SKILL_ATTR[name]) return LEYLINE_SKILL_ATTR[name];
  if (DEITY_SKILL_ATTR[name]) return DEITY_SKILL_ATTR[name];
  return null;
}

function emptyCharacter() {
  return {
    schema: SCHEMA,
    name: '',
    level: 1,
    attributes: { ...DEFAULT_ATTRS },
    skills: {},
    expertises: [],
    narrativeFlags: [],
    notes: '',
    paths: {
      leylineKeyTid: null,
      heroicKeyTid: null,
      deitySkill: null,    // domain name — 'Sovereignty', 'Life', etc.
    },
    learnedTids: [],
    learnedAt: {},          // { tid: level acquired }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return materialize(emptyCharacter());
    const parsed = JSON.parse(raw);
    // Schema migration: schema 1 had no learnedAt; default everyone to L1
    if (parsed.schema === 1) {
      parsed.learnedAt = {};
      for (const tid of parsed.learnedTids || []) parsed.learnedAt[tid] = 1;
      parsed.schema = SCHEMA;
    }
    if (parsed.schema !== SCHEMA) return materialize(emptyCharacter());
    return materialize(parsed);
  } catch {
    return materialize(emptyCharacter());
  }
}
function save(character) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(character)));
}
function materialize(c) {
  return {
    ...c,
    learnedTids: new Set(c.learnedTids || []),
    learnedAt: c.learnedAt || {},
  };
}
function serialize(c) {
  return {
    ...c,
    learnedTids: [...(c.learnedTids || [])],
    learnedAt: c.learnedAt || {},
  };
}

let _state = load();
const _subs = new Set();
function notify() { for (const fn of _subs) fn(_state); }
function subscribe(fn) { _subs.add(fn); return () => _subs.delete(fn); }
function get() { return _state; }
function setState(next) { _state = next; save(_state); notify(); }
function update(patcher) {
  const draft = { ..._state,
    attributes: { ..._state.attributes },
    skills: { ..._state.skills },
    expertises: [..._state.expertises],
    narrativeFlags: [..._state.narrativeFlags],
    paths: { ..._state.paths },
    learnedTids: new Set(_state.learnedTids),
    learnedAt: { ..._state.learnedAt },
  };
  patcher(draft);
  setState(draft);
}

/* --------- Mutators --------- */
function setLevel(L) { update(s => { s.level = Math.max(1, Math.min(20, L | 0)); }); }
function setName(n) { update(s => { s.name = n; }); }
function setNotes(n) { update(s => { s.notes = n; }); }
function setAttribute(attr, val) { update(s => { s.attributes[attr] = Math.max(0, Math.min(10, val | 0)); }); }
function setSkill(name, rank) {
  update(s => {
    if ((rank | 0) <= 0) delete s.skills[name];
    else s.skills[name] = rank | 0;
  });
}
function setLeylineKey(tid) { update(s => { s.paths.leylineKeyTid = tid; }); }
function setHeroicKey(tid)  { update(s => { s.paths.heroicKeyTid  = tid; }); }
function setDeitySkill(skill) { update(s => { s.paths.deitySkill = skill; }); }
function addNarrativeFlag(text) { update(s => { if (!s.narrativeFlags.includes(text)) s.narrativeFlags.push(text); }); }
function removeNarrativeFlag(text) { update(s => { s.narrativeFlags = s.narrativeFlags.filter(f => f !== text); }); }
function setExpertises(arr) { update(s => { s.expertises = arr.slice(); }); }
function toggleTalent(tid, atLevel) {
  update(s => {
    if (s.learnedTids.has(tid)) {
      s.learnedTids.delete(tid);
      delete s.learnedAt[tid];
    } else {
      s.learnedTids.add(tid);
      s.learnedAt[tid] = atLevel != null ? (atLevel | 0) : (s.level | 0);
    }
  });
}
function setTalent(tid, learned, atLevel) {
  update(s => {
    if (learned) {
      s.learnedTids.add(tid);
      if (s.learnedAt[tid] == null) s.learnedAt[tid] = atLevel != null ? (atLevel | 0) : (s.level | 0);
    } else {
      s.learnedTids.delete(tid);
      delete s.learnedAt[tid];
    }
  });
}
function setLearnedAt(tid, atLevel) {
  update(s => { if (s.learnedTids.has(tid)) s.learnedAt[tid] = atLevel | 0; });
}

/* --------- Talent index helper --------- */
function findTalentByTid(atlases, tid) {
  if (!tid) return null;
  for (const aid of Object.keys(atlases)) {
    for (const tree of atlases[aid].trees) {
      for (const t of tree.talents) {
        if (t.tid === tid) return t;
      }
    }
  }
  return null;
}

/* --------- Derived stats per rules doc --------- */

// HP: L1 = 10+STR; +5 each level except tier-up substitutions:
//   L6 += 4+STR, L11 += 3+STR, L16 += 2+STR
// At L7 STR0 -> 39 (matches the doc's checkpoint).
function deriveHP(c) {
  const STR = c.attributes.STR | 0;
  const L = c.level | 0;
  let hp = 10 + STR;
  for (let lvl = 2; lvl <= L; lvl++) {
    if (lvl === 6) hp += 4 + STR;
    else if (lvl === 11) hp += 3 + STR;
    else if (lvl === 16) hp += 2 + STR;
    else hp += 5;
  }
  return hp;
}
function deriveFocus(c) { return 2 + (c.attributes.WIL | 0); }
function deriveInvestiture(c) { return 2 + Math.max(c.attributes.AWA | 0, c.attributes.PRE | 0); }
function deriveDefenses(c) {
  return {
    physical:  10 + (c.attributes.STR | 0) + (c.attributes.SPD | 0),
    cognitive: 10 + (c.attributes.INT | 0) + (c.attributes.WIL | 0),
    spiritual: 10 + (c.attributes.AWA | 0) + (c.attributes.PRE | 0),
  };
}
function deriveMovement(c) { return 20 + (c.attributes.SPD | 0) * 5; }

// Recovery die: 0-1=d4, 2-3=d6, 4-5=d8, 6=d10, 7+=d10 (rules doc table)
function deriveRecoveryDie(c) {
  const w = c.attributes.WIL | 0;
  if (w <= 1) return 'd4';
  if (w <= 3) return 'd6';
  if (w <= 5) return 'd8';
  return 'd10';
}
// Senses range: 0=10, 1=15, 2-3=20, 4=25, 5-6=30 ft
function deriveSensesRange(c) {
  const a = c.attributes.AWA | 0;
  if (a <= 0) return 10;
  if (a === 1) return 15;
  if (a <= 3) return 20;
  if (a === 4) return 25;
  return 30;
}

/* --------- Budget (single pool) --------- */
function deriveBudget(c, atlases) {
  const row = levelRow(c.level);
  const total = row[5];

  // Each learned talent is 1 point. Deity Key grants +1 (must be a deity-path same-level talent).
  const learned = [...c.learnedTids].map(tid => findTalentByTid(atlases, tid)).filter(Boolean);
  const spent = learned.length;

  // Deity Key bonus accounting:
  //   If the PC has any deity Key learned, that level gets +1 to the pool that MUST be spent the same
  //   level on a deity-path talent. We sum across distinct learn levels of deity Keys.
  let deityBonusGranted = 0;
  let deityBonusUsed = 0;
  for (const t of learned) {
    if (t.atlas === 'deity' && t.isKey) {
      deityBonusGranted += 1;
      const lvl = c.learnedAt[t.tid] | 0;
      // Count any other deity-path talent acquired same level on the same deity
      const used = learned.some(x =>
        x.atlas === 'deity' && x.group === t.group && !x.isKey &&
        (c.learnedAt[x.tid] | 0) === lvl
      );
      if (used) deityBonusUsed += 1;
    }
  }
  const totalAvail = total + deityBonusGranted;
  return {
    totalAvailable: totalAvail,
    base: total,
    deityBonusGranted,
    deityBonusUsed,
    spent,
    over: spent > totalAvail,
    underutilized: deityBonusGranted - deityBonusUsed,
  };
}

/* --------- Validation: timing rules --------- */
function deriveValidations(c, atlases) {
  const issues = [];
  const learned = [...c.learnedTids].map(tid => findTalentByTid(atlases, tid)).filter(Boolean);

  // Heroic & Leyline Keys must be present and at L1
  const hk = learned.find(t => t.atlas === 'heroic' && t.isKey);
  const lk = learned.find(t => t.atlas === 'leyline' && t.isKey);
  if (!hk) issues.push({ kind: 'missing-key', text: 'Heroic Key not chosen.', severity: 'error' });
  else if ((c.learnedAt[hk.tid] | 0) !== 1) issues.push({ kind: 'late-key', text: `Heroic Key (${hk.group}) was acquired at L${c.learnedAt[hk.tid]}, not L1. Path Keys are L1-only.`, severity: 'error' });
  if (!lk) issues.push({ kind: 'missing-key', text: 'Leyline Key not chosen.', severity: 'error' });
  else if ((c.learnedAt[lk.tid] | 0) !== 1) issues.push({ kind: 'late-key', text: `Leyline Key (${lk.group}) was acquired at L${c.learnedAt[lk.tid]}, not L1. Path Keys are L1-only.`, severity: 'error' });

  // L1 picks: at most 2 non-Key picks at L1, ideally one in heroic + one in leyline path.
  const l1NonKey = learned.filter(t => !t.isKey && (c.learnedAt[t.tid] | 0) === 1);
  if (l1NonKey.length > 2) {
    issues.push({ kind: 'l1-overflow', text: `${l1NonKey.length} non-Key talents acquired at L1 (max 2).`, severity: 'error' });
  }
  // Each L1 pick should be in its respective path (heroic or leyline). If both keys are present:
  if (hk && lk) {
    const expectHeroic = l1NonKey.find(t => t.atlas === 'heroic' && t.group === hk.group);
    const expectLeyline = l1NonKey.find(t => t.atlas === 'leyline' && t.group === lk.group);
    if (l1NonKey.length === 2 && (!expectHeroic || !expectLeyline)) {
      issues.push({ kind: 'l1-path-mismatch',
        text: 'L1 picks should be one Heroic-path talent and one Leyline-path talent (matching your chosen Keys).',
        severity: 'warn' });
    }
  }

  // Deity Key bonus must be spent same level on a deity-path talent
  for (const t of learned) {
    if (t.atlas === 'deity' && t.isKey) {
      const lvl = c.learnedAt[t.tid] | 0;
      const used = learned.some(x =>
        x.atlas === 'deity' && x.group === t.group && !x.isKey &&
        (c.learnedAt[x.tid] | 0) === lvl
      );
      if (!used) issues.push({
        kind: 'deity-bonus-unspent',
        text: `Deity Key (${t.group}) bonus point taken at L${lvl} but no other ${t.group} talent picked the same level — bonus is lost.`,
        severity: 'warn',
      });
    }
  }

  // Deity prereq soft-warn: 2 ranks each in two leyline-color skills
  if (c.paths.deitySkill) {
    const leylineRanks = ['White','Blue','Black','Red','Green'].map(s => c.skills[s] | 0);
    const meets = leylineRanks.filter(r => r >= 2).length;
    if (meets < 2) {
      issues.push({
        kind: 'deity-prereq',
        text: `Deity path (${c.paths.deitySkill}) typically requires rank 2+ in two leyline color skills. Currently ${meets} met.`,
        severity: 'warn',
      });
    }
  }

  return issues;
}

/* --------- Auto-grants from Keys --------- */
function autoGrantedSkills(c, atlases) {
  const grants = {};
  const lk = findTalentByTid(atlases, c.paths.leylineKeyTid);
  if (lk) grants[lk.group] = (grants[lk.group] || 0) + 1;
  const hk = findTalentByTid(atlases, c.paths.heroicKeyTid);
  if (hk && window.Atlases.HEROIC_KEY_SKILL[hk.group]) {
    const sk = window.Atlases.HEROIC_KEY_SKILL[hk.group];
    grants[sk] = (grants[sk] || 0) + 1;
  }
  return grants;
}

/* --------- Rolled-up derive() --------- */
function derive(c, atlases) {
  const row = levelRow(c.level);
  return {
    levelRow: { tier: row[1], maxSkillRank: row[2], attrPoints: row[3], skillRanks: row[4], talentPoints: row[5] },
    hp: deriveHP(c),
    focus: deriveFocus(c),
    investiture: deriveInvestiture(c),
    defenses: deriveDefenses(c),
    movement: deriveMovement(c),
    recoveryDie: deriveRecoveryDie(c),
    sensesRange: deriveSensesRange(c),
    budget: deriveBudget(c, atlases),
    validations: deriveValidations(c, atlases),
  };
}

window.Character = {
  load, save, subscribe, get, update,
  setLevel, setName, setNotes, setAttribute, setSkill,
  setLeylineKey, setHeroicKey, setDeitySkill,
  addNarrativeFlag, removeNarrativeFlag, setExpertises,
  toggleTalent, setTalent, setLearnedAt,
  derive, deriveHP, deriveFocus, deriveInvestiture, deriveDefenses,
  deriveMovement, deriveRecoveryDie, deriveSensesRange, deriveBudget, deriveValidations,
  autoGrantedSkills, findTalentByTid,
  emptyCharacter,
  LEVEL_TABLE,
  levelRow,
  STORAGE_KEY,
  SKILL_ATTR, LEYLINE_SKILL_ATTR, DEITY_SKILL_ATTR, skillAttr,
};
