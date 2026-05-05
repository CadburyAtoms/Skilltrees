/* Character store. Single character (slot "default"), schema-versioned for future roster.

   Persists to localStorage under skilltrees:character:default.

   Public API (window.Character):
     load()                                 -> Character
     save(character)
     subscribe(fn)                          -> unsubscribe
     get()                                  -> live ref to current state
     update(patcher)                        -> patcher(state) mutates and saves
     update fns:
       setLevel, setName, setNotes, setAttribute, setSkill,
       setLeylineKey, setHeroicKey, setDeitySkill,
       addNarrativeFlag, removeNarrativeFlag,
       setExpertises,
       toggleTalent(tid)
     derived(state, atlases) -> { hp, investiture, attrPoints, skillRanks, maxSkillRank,
                                   talentBudget: { total, byBucket, spentTotal, spentByBucket } }
*/

const SLOT = 'default';
const STORAGE_KEY = `skilltrees:character:${SLOT}`;
const SCHEMA = 1;

const DEFAULT_ATTRS = { STR: 0, SPD: 0, INT: 0, WIL: 0, AWA: 0, PRE: 0 };

// Per-level cumulative table.
// Columns: maxSkillRank, totalAttrPoints (0-baseline), totalSkillRanks, totalTalents
//   "totalAttrPoints" = total attribute points the character may have spent at this level
//   Formula: 12 + count({3,6,9,12,15,18} ≤ L)
//   Talent formula: 4 + L + count({6,11,16} ≤ L)   (note: +1 bonus at tier-up levels L6/11/16)
// Source: Character_Building_Rules.md
const LEVEL_TABLE = [
  // L  maxSkill  attrPts  skillRanks  talentPts
  [ 1,    2,        12,       5,         5 ],
  [ 2,    2,        12,       7,         6 ],
  [ 3,    2,        13,       9,         7 ],
  [ 4,    2,        13,      11,         8 ],
  [ 5,    2,        13,      13,         9 ],
  [ 6,    3,        14,      15,        11 ],
  [ 7,    3,        14,      17,        12 ],
  [ 8,    3,        14,      19,        13 ],
  [ 9,    3,        15,      21,        14 ],
  [10,    3,        15,      23,        15 ],
  [11,    4,        15,      25,        17 ],
  [12,    4,        16,      27,        18 ],
  [13,    4,        16,      29,        19 ],
  [14,    4,        16,      31,        20 ],
  [15,    4,        17,      33,        21 ],
  [16,    5,        17,      35,        23 ],
  [17,    5,        17,      37,        24 ],
  [18,    5,        18,      39,        25 ],
  [19,    5,        18,      41,        26 ],
  [20,    5,        18,      43,        27 ],
];

function levelRow(level) {
  const L = Math.max(1, Math.min(20, level | 0));
  return LEVEL_TABLE[L - 1];
}

function emptyCharacter() {
  return {
    schema: SCHEMA,
    name: '',
    level: 1,
    attributes: { ...DEFAULT_ATTRS },
    skills: {},                // { skillName: rankInt }
    expertises: [],            // freeform strings
    narrativeFlags: [],        // strings (cleared GM gates)
    notes: '',
    paths: {
      leylineKeyTid: null,     // tid of chosen Leyline Key (locks color + Draw Mana)
      heroicKeyTid:  null,     // tid of chosen Heroic Key
      deitySkill:   null,      // string ('Life', 'Knowledge', etc.) — null if no deity yet
    },
    learnedTids: [],           // array (serialized; loaded as Set in memory)
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return materialize(emptyCharacter());
    const parsed = JSON.parse(raw);
    if (parsed.schema !== SCHEMA) return materialize(emptyCharacter());
    return materialize(parsed);
  } catch {
    return materialize(emptyCharacter());
  }
}
function save(character) {
  const serialized = serialize(character);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
}

function materialize(c) {
  return {
    ...c,
    learnedTids: new Set(c.learnedTids || []),
  };
}
function serialize(c) {
  return {
    ...c,
    learnedTids: [...(c.learnedTids || [])],
  };
}

// Singleton state + pub/sub
let _state = load();
const _subs = new Set();
function notify() { for (const fn of _subs) fn(_state); }
function subscribe(fn) { _subs.add(fn); return () => _subs.delete(fn); }
function get() { return _state; }
function setState(next) {
  _state = next;
  save(_state);
  notify();
}
function update(patcher) {
  const draft = { ..._state,
    attributes: { ..._state.attributes },
    skills: { ..._state.skills },
    expertises: [..._state.expertises],
    narrativeFlags: [..._state.narrativeFlags],
    paths: { ..._state.paths },
    learnedTids: new Set(_state.learnedTids),
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
function setHeroicKey(tid)  { update(s => { s.paths.heroicKeyTid = tid; }); }
function setDeitySkill(skill) { update(s => { s.paths.deitySkill = skill; }); }
function addNarrativeFlag(text) { update(s => { if (!s.narrativeFlags.includes(text)) s.narrativeFlags.push(text); }); }
function removeNarrativeFlag(text) { update(s => { s.narrativeFlags = s.narrativeFlags.filter(f => f !== text); }); }
function setExpertises(arr) { update(s => { s.expertises = arr.slice(); }); }
function toggleTalent(tid) {
  update(s => {
    if (s.learnedTids.has(tid)) s.learnedTids.delete(tid);
    else s.learnedTids.add(tid);
  });
}
function setTalent(tid, learned) {
  update(s => {
    if (learned) s.learnedTids.add(tid);
    else s.learnedTids.delete(tid);
  });
}

/* --------- Derived state --------- */

// HP per design note: L1 = 10 + STR; +5/level; substitutions at L6/11/16: 4+STR / 3+STR / 2+STR.
// Interpreting "substitution" as: at those levels, the increment is (4+STR) instead of +5.
function deriveHP(character) {
  const STR = character.attributes.STR | 0;
  const L = character.level | 0;
  let hp = 10 + STR;
  for (let lvl = 2; lvl <= L; lvl++) {
    if (lvl === 6) hp += 4 + STR;
    else if (lvl === 11) hp += 3 + STR;
    else if (lvl === 16) hp += 2 + STR;
    else hp += 5;
  }
  return hp;
}

function deriveInvestiture(character) {
  const AWA = character.attributes.AWA | 0;
  const PRE = character.attributes.PRE | 0;
  return 2 + Math.max(AWA, PRE);
}

// Talent budget: per design note rules.
function deriveBudget(character, atlases) {
  const row = levelRow(character.level);
  const totalTalents = row[4];
  const learnedCount = character.learnedTids.size;

  // Tree-locked bonus pools come from learned Keys.
  // Heroic Key -> +1 in heroic/<path>/* tree
  // Leyline Key -> +1 in leyline/<color>/* tree
  // Deity Key -> +1 in deity/<deity>/* tree (handled when player learns a Deity Key talent)
  const buckets = []; // [{ id, label, source, amount, count, locked: scope-string }]
  buckets.push({ id: 'base', label: 'Base talent points', amount: totalTalents, scope: 'any' });

  function findKeyTalent(tid) {
    if (!tid) return null;
    return findTalentByTid(atlases, tid);
  }

  // Heroic Key bonus
  const hk = findKeyTalent(character.paths.heroicKeyTid);
  if (hk) buckets.push({
    id: 'hkey', label: `Heroic Key (${hk.group}) bonus`, amount: 1,
    scope: `heroic/${hk.group}`,
  });
  // Leyline Key bonus
  const lk = findKeyTalent(character.paths.leylineKeyTid);
  if (lk) buckets.push({
    id: 'lkey', label: `Leyline Key (${lk.group}) bonus`, amount: 1,
    scope: `leyline/${lk.group}`,
  });
  // L1 bonus point — earmarkable but free to anywhere
  buckets.push({ id: 'l1bonus', label: 'Level-1 bonus point', amount: 1, scope: 'any' });

  // Any learned deity Key talent grants +1 in that deity's tree
  for (const tid of character.learnedTids) {
    const t = findTalentByTid(atlases, tid);
    if (t && t.atlas === 'deity' && t.isKey) {
      buckets.push({
        id: `dk-${t.group}`, label: `Deity Key (${t.group}) bonus`, amount: 1,
        scope: `deity/${t.group}`,
      });
    }
  }

  // Now classify learned talents into which bucket they consumed.
  // Strategy: tree-locked buckets fill first against learned talents within their scope;
  // remainder hits the "any" bucket (base + l1bonus).
  const learned = [...character.learnedTids].map(tid => findTalentByTid(atlases, tid)).filter(Boolean);
  const consumed = buckets.map(b => 0);

  // First: spend tree-locked
  for (const t of learned) {
    if (t.atlas === 'leyline' && t.isKey) {
      // Leyline Key chosen at creation = "free" (doesn't consume a bucket directly; it IS the key).
      // But it does need to be marked as the chosen leyline. We don't double-count.
      continue;
    }
    if (t.atlas === 'heroic' && t.isKey) continue;
    if (t.atlas === 'deity' && t.isKey) {
      // Deity Key consumes from the "any" pool when learned (player spends a talent point + skill on Deity).
      // The Key itself does NOT consume the bucket it grants.
      // We'll let it fall to the "any" pool.
    }
    const scopeStr = `${t.atlas}/${t.group}`;
    const bIdx = buckets.findIndex((b, k) => b.scope === scopeStr && consumed[k] < b.amount);
    if (bIdx >= 0) {
      consumed[bIdx]++;
      t._consumedBy = buckets[bIdx].id;
    } else {
      // No matching tree-locked bucket — falls to "any"
      const anyIdx = buckets.findIndex((b, k) => b.scope === 'any' && consumed[k] < b.amount);
      if (anyIdx >= 0) {
        consumed[anyIdx]++;
        t._consumedBy = buckets[anyIdx].id;
      } else {
        t._consumedBy = 'over';
      }
    }
  }

  // Add Keys themselves as freebies (not consuming buckets) — they're separate slots.
  // Total spent = number of non-key learned talents; available = base + l1bonus + tree-locked.
  const nonKeyLearned = learned.filter(t => !t.isKey).length;
  const totalAvailable = buckets.reduce((s, b) => s + b.amount, 0);

  return {
    learnedCount,
    nonKeyLearned,
    totalAvailable,
    over: nonKeyLearned > totalAvailable,
    buckets: buckets.map((b, k) => ({ ...b, spent: consumed[k] })),
  };
}

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

function derive(character, atlases) {
  const row = levelRow(character.level);
  return {
    levelRow: { maxSkillRank: row[1], attrPoints: row[2], skillRanks: row[3], talentPoints: row[4] },
    hp: deriveHP(character),
    investiture: deriveInvestiture(character),
    budget: deriveBudget(character, atlases),
  };
}

/* --------- Auto-grants from chosen Keys --------- */
// These return the *intended* skill ranks granted by Keys (do not auto-write, just report)
function autoGrantedSkills(character, atlases) {
  const grants = {};
  // Leyline Key -> +1 in matching color skill
  const lk = findTalentByTid(atlases, character.paths.leylineKeyTid);
  if (lk) grants[lk.group] = (grants[lk.group] || 0) + 1; // group is 'White' etc., matching skill name
  // Heroic Key -> +1 in matching skill
  const hk = findTalentByTid(atlases, character.paths.heroicKeyTid);
  if (hk && window.Atlases.HEROIC_KEY_SKILL[hk.group]) {
    const sk = window.Atlases.HEROIC_KEY_SKILL[hk.group];
    grants[sk] = (grants[sk] || 0) + 1;
  }
  return grants;
}

window.Character = {
  load, save, subscribe, get, update,
  setLevel, setName, setNotes, setAttribute, setSkill,
  setLeylineKey, setHeroicKey, setDeitySkill,
  addNarrativeFlag, removeNarrativeFlag, setExpertises,
  toggleTalent, setTalent,
  derive, deriveHP, deriveInvestiture, deriveBudget,
  autoGrantedSkills, findTalentByTid,
  emptyCharacter,
  LEVEL_TABLE,
  levelRow,
  STORAGE_KEY,
};
