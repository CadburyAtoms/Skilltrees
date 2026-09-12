// Every talent that names "advantage" (not "disadvantage"), classified BY HAND — because the
// regex census in resource-economy.js got this wrong twice. The first draft of this review counted
// 45 advantage producers; that number swept in action-enablers (talents granting the Gain Advantage
// ACTION, not an advantage), consumers and deniers, one clause gated on Shardplate (a GM reward
// outside the review's scope fence), and it missed two real producers. The problem ledger
// (run wf_0b59b6ca-5bc, droppedAsArtefact[4]) put the true count at 36; this table is that count,
// written down so it can be checked and so a new or renamed talent fails loudly instead of
// silently drifting the number.
//
// role    producer — grants an advantage to someone
//         enabler  — grants the Gain Advantage ACTION, or an action to use it; not an advantage
//         consumer — keys off an advantage or the Gain Advantage action existing
//         denier   — stops an advantage applying
//         fenced   — the only advantage clause sits outside the scope fence (Shardplate)
// lands   (producers only) where the advantage can land
//         attack — attack tests specifically
//         any    — a generic "next test" / "first test" / "Physical test" that can be an attack
//         no     — a skill test that is never an attack (social, Perception, stealth, Insight, …)
//
// Advantage is ONE binary scalar in the implementation (SYSTEM-PRIMER.md), so redundancy is about
// a second source on the SAME roll. A PC holds one leyline + one heroic path, or one deity tree,
// so the question is which producers one character can own together and point at one attack.
//
//   node docs/analysis/talent-ecosystem/advantage-classify.js <dossierDir>
const fs = require('fs');
const OUT = process.argv[2];
const rows = JSON.parse(fs.readFileSync(OUT + '/all-talents.json', 'utf8'));
const T = r => String(r.authoredDescription || r.description || '').replace(/\s+/g, ' ');

const C = {
  'leyline/Blue|Blue Leyline Attunement': ['producer', 'no', 'next Cognitive test'],
  'leyline/Blue|Calculated Patience': ['producer', 'any', 'first test of a slow turn'],
  'leyline/Blue|Reactive Analysis': ['producer', 'any', 'next test against a character who failed'],
  'leyline/Blue|Anticipate': ['producer', 'no', 'a resistance test against influence'],
  'leyline/Black|Blood Price': ['producer', 'any', 'next Black test (Withering Ray is a Black attack)'],
  'leyline/Black|Predatory Insight': ['producer', 'no', 'next Deception test'],
  'leyline/Red|Red Leyline Attunement': ['producer', 'any', 'next Physical test'],
  'leyline/Red|Flashpoint': ['producer', 'any', 'next Red test this turn'],
  'leyline/Red|Emotional Overload': ['consumer', null, 'reacts to a character gaining an advantage'],
  'leyline/Red|Reckless Gambit': ['producer', 'any', "a character's next test"],
  'leyline/Red|Frenzied Tempo': ['producer', 'no', 'Influence tests on a fast turn'],
  'leyline/Green|Primal Awareness': ['producer', 'no', 'Perception to detect or track'],
  'leyline/Green|Apex Predator': ['producer', 'any', 'all Physical tests while 3+ enemies are in your terrain'],
  "leyline/Green|Predator's Instinct": ['producer', 'no', 'tests to track or locate'],
  'leyline/Green|Pack Hunter': ['producer', 'attack', 'next attack test against a flanked enemy'],
  'leyline/Green|Scent the Weak': ['producer', 'any', 'first test each round against the lowest-HP creature'],
  'leyline/Green|Natural Order': ['denier', null, 'enemies cannot benefit from advantage gained from deception'],
  'heroic/Agent|Quick Analysis': ['enabler', null, 'two actions for Cognitive Gain Advantage'],
  "heroic/Agent|Sleuth's Instincts": ['producer', 'no', 'cognitive tests against a character whose motivation you know'],
  'heroic/Agent|Close the Case': ['producer', 'no', 'a Deduction test to make a target back down'],
  'heroic/Agent|Shadow Step': ['producer', 'no', 'a Thievery test to hide'],
  'heroic/Agent|Fast Talker': ['enabler', null, 'two actions for Spiritual Gain Advantage'],
  "heroic/Agent|Trickster's Hand": ['enabler', null, 'two actions for Physical Gain Advantage'],
  'heroic/Envoy|Well Dressed': ['producer', 'no', 'first Deception, Leadership or Persuasion test'],
  'heroic/Envoy|Practical Demonstration': ['consumer', null, 'triggers on the Gain Advantage action'],
  'heroic/Envoy|Guiding Oration': ['producer', 'any', "an ally's next test against your target (also triggers on Gain Advantage)", true],
  'heroic/Hunter|Seek Quarry': ['producer', 'attack', 'tests to find, attack and study your quarry'],
  'heroic/Hunter|Exploit Weakness': ['producer', 'any', 'Gain Advantage on your quarry without spending an action'],
  'heroic/Hunter|Fatal Thrust': ['producer', 'attack', 'the attack itself — "two advantages", worth one'],
  'heroic/Hunter|Shadowing': ['producer', 'no', "tests to avoid your quarry's notice"],
  "heroic/Hunter|Hunter's Edge": ['producer', 'attack', "your companion's tests against your quarry"],
  'heroic/Leader|Through the Fray': ['enabler', null, 'an ally may Gain Advantage as a reaction'],
  'heroic/Leader|Well Dressed': ['producer', 'no', 'first Deception, Leadership or Persuasion test'],
  'heroic/Scholar|Strategize': ['consumer', null, 'redirects an advantage you gained to an ally'],
  'heroic/Scholar|Keen Insight': ['consumer', null, 'triggers on the Gain Advantage action'],
  'heroic/Scholar|Turning Point': ['producer', 'no', 'a Deduction test against the enemy leader'],
  'heroic/Warrior|Flamestance': ['producer', 'no', 'Intimidation'],
  'heroic/Warrior|Ironstance': ['producer', 'no', 'Insight'],
  'heroic/Warrior|Windstance': ['producer', 'no', 'Agility'],
  'heroic/Warrior|Meteoric Leap': ['fenced', null, 'advantage only "in Shardplate", a GM reward outside the fence'],
  'heroic/Warrior|Cautious Advance': ['enabler', null, 'two actions to Brace or Gain Advantage'],
  "deity/Order|Lawkeeper's Eye": ['producer', 'attack', 'you and allies, attack tests against a character bound by your Edict'],
  'deity/Order|Final Decree': ['producer', 'attack', "each Witness's next attack test"],
  'deity/Civilization|Bonds of Community': ['producer', 'attack', "each ally in a Foundation's next attack test"],
  'deity/Fate|Bulwark Ground': ['denier', null, 'attacks against an ally on Ordained Ground cannot benefit from advantage'],
  'deity/Power|Kneel': ['producer', 'attack', 'your attack tests against a Compelled, Frightened or Weakened character'],
  "deity/Power|Warlord's Advance": ['producer', 'no', 'Presence tests to intimidate, command or lead'],
  'deity/Power|Investiture of Command': ['producer', 'attack', "up to 3 allies' next attack test"],
};

const named = rows.filter(r => /(?<!dis)advantage/i.test(T(r)));
const keyOf = r => r.atlas + '/' + r.tree + '|' + r.name;
const seen = new Set(named.map(keyOf));
let bad = 0;
for (const r of named) {
  if (!C[keyOf(r)]) { console.log('!! UNCLASSIFIED — names advantage but has no row: ' + keyOf(r) + '  | ' + T(r).slice(0, 140)); bad++; }
}
for (const k of Object.keys(C)) {
  if (!seen.has(k)) { console.log('!! STALE ROW — classified but no longer names advantage (renamed or reworded?): ' + k); bad++; }
}

const by = role => Object.entries(C).filter(([, v]) => v[0] === role);
const producers = by('producer');
const treesOf = list => [...new Set(list.map(([k]) => k.split('|')[0]))];
const lands = l => producers.filter(([, v]) => v[1] === l);
const consumers = by('consumer'), deniers = by('denier'), enablers = by('enabler'), fenced = by('fenced');
const alsoConsumes = producers.filter(([, v]) => v[3]);

console.log('ADVANTAGE — every talent that names it, classified by hand');
console.log('');
console.log('  talents naming "advantage":   ' + named.length);
console.log('  producers:                    ' + producers.length + ' across ' + treesOf(producers).length + ' trees');
console.log('    land on attack tests:       ' + lands('attack').length + '   (attack-specific)');
console.log('    can land on an attack:      ' + (lands('attack').length + lands('any').length)
  + '   (attack-specific + a generic "next test" that can be an attack)');
console.log('    never an attack:            ' + lands('no').length);
console.log('  enablers (the ACTION, not an advantage): ' + enablers.length + ' — ' + enablers.map(([k]) => k.split('|')[1]).join(', '));
console.log('  consumers:                    ' + (consumers.length + alsoConsumes.length) + ' (' + consumers.map(([k]) => k.split('|')[1]).concat(alsoConsumes.map(([k]) => k.split('|')[1] + '*')).join(', ') + ')');
console.log('  deniers:                      ' + deniers.length + ' — ' + deniers.map(([k]) => k.split('|')[1]).join(', '));
console.log('  outside the scope fence:      ' + fenced.length + ' — ' + fenced.map(([k]) => k.split('|')[1]).join(', '));
console.log('  (* also a producer)');
console.log('');
console.log('=== producers that can land on an attack roll, by tree ===');
const atk = producers.filter(([, v]) => v[1] !== 'no');
const perTree = {};
for (const [k, v] of atk) (perTree[k.split('|')[0]] ||= []).push(k.split('|')[1] + ' [' + v[1] + ']');
for (const [t, v] of Object.entries(perTree)) console.log('  ' + t.padEnd(20) + String(v.length).padStart(2) + '  ' + v.join(', '));
console.log('');
console.log('Same-roll redundancy needs two producers ONE character owns, pointed at the SAME roll by the');
console.log('SAME roller. Read the rows above against that, not against the raw producer count.');
if (bad) { console.log(''); console.log(bad + ' classification problem(s) — fix the table before trusting any count.'); process.exitCode = 1; }
