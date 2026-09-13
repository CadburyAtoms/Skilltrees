// balance-turns.js — the per-turn arithmetic behind BALANCE-REVIEW.md (2026-09-13).
//
// Prints, for a set of hand-encoded "lines" (a repeatable turn a tree can run), the expected
// damage-equivalent per turn at three checkpoints. It is a MODEL, not a measurement: every line
// is a reading of the card text, encoded by hand, with the assumptions below. Change an
// assumption and re-run; the report's numbers are this script's output and nothing else.
//
// Usage: node docs/analysis/talent-ecosystem/balance-turns.js
//
// ASSUMPTIONS (the critique's baseline, CRITIQUE.md R-105, extended):
//   • Every hit adds the roller's skill modifier (rank + attribute) to damage (cosmere-rpg 2.1.0).
//   • Checkpoints: L1 = tier 1, colour/weapon rank 2, attribute 2 (mod +4), [Tier][Die] = 1d6.
//                  L5 = tier 1, rank 2, attribute 3 (mod +5; the L3 attribute point), 1d6.
//                  L7 = tier 2, rank 3, attribute 3 (mod +6), [Tier][Die] = 2d8; Draw Mana = 2.
//   • Weapon die d8 (4.5) for every Strike. Hit chance is the same for everyone and is ignored
//     (every line is "damage if it lands"); vital / spirit lines note that they ignore Deflect.
//   • A Slow turn = 3 Actions. A leyline / deity turn that spends Investiture beyond the starting
//     pool must Draw Mana (1 Action → tier Investiture); "steady state" lines include the draw.
//   • Investiture pool at L1 ≈ 4 (2 + max(AWA, PRE)); focus pool ≈ 4–5. Heroic lines cost
//     focus or nothing and are treated as unlimited across a four-round fight unless noted.
//   • Party = the character plus three allies; "party hits per round" = 6 for riders that pay
//     on every party hit.
//   • Control and support lines are NOT converted into damage-equivalents here; the report
//     argues them in prose. This table is the damage lane only.
"use strict";

const CP = {
  L1: { tier: 1, die: 3.5, halfDie: 1.75, mod: 4, draw: 1, mighty: 2, wpn: 4.5 },
  L5: { tier: 1, die: 3.5, halfDie: 1.75, mod: 5, draw: 1, mighty: 2, wpn: 4.5 },
  L7: { tier: 2, die: 9,   halfDie: 4.5,  mod: 6, draw: 2, mighty: 3, wpn: 4.5 },
};

// Each line: name, tree, the earliest checkpoint it exists at, a function of the checkpoint
// returning damage per TURN, and a note. `null` = not available at that checkpoint.
const LINES = [
  ["Strike ×3 (no talents)", "baseline", c => 3 * (c.wpn + c.mod), "free"],
  ["Strike ×3 + Mighty", "heroic (any) / Red depth 3", c => 3 * (c.wpn + c.mod + c.mighty), "free, unlimited"],
  ["Warrior: Saltstance, Strike ×3 + Mighty", "heroic/Warrior", c => 3 * (c.wpn + c.mod + c.mighty + c.tier), "free; L3+"],
  ["Warrior: Devastating Blow + Strike + Mighty", "heroic/Warrior", c => c.tier < 2 ? null : (c.wpn + c.mod + 2 * c.mighty + 9) + (c.wpn + c.mod + c.mighty), "L6 (Athletics 3+); 2d8 flat"],
  ["Black: Withering Ray ×3", "leyline/Black", c => 3 * (2 * c.die + c.mod), "vital (ignores Deflect); costs ~half a rank die of HP per cast, no Investiture"],
  ["Red: draw + Searing Bolt ×2 (Kindle)", "leyline/Red", c => 2 * (c.die + c.mod + c.mod), "energy; steady state incl. the draw; Kindle = +Red mod (depth 2)"],
  ["Red: charge Strike (Momentum's Edge + Volatile) + Strike ×2, Mighty", "leyline/Red", c => (c.wpn + c.mod + c.mighty + c.die + c.halfDie) + 2 * (c.wpn + c.mod + c.mighty), "impact; needs a 20 ft approach each turn; 1 Investiture"],
  ["Knowledge: draw + Predatory Strike ×2 at 5 Insight", "deity/Knowledge", c => 2 * (c.wpn + c.mod + 5 * c.die), "vital; 5 Insight from turn 2 on; Accumulate refunds 1/round — sustainable"],
  ["Knowledge: Predatory Strike ×3 at 5 Insight (pool turn)", "deity/Knowledge", c => 3 * (c.wpn + c.mod + 5 * c.die), "vital; burns 3 Investiture — a one-turn spike"],
  ["Knowledge: same, if Insight were capped at 3", "deity/Knowledge (proposal)", c => 2 * (c.wpn + c.mod + 3 * c.die), "the R-120 (a) shape"],
  ["Knowledge: same, if the bonus were Tier per Insight + one [Tier][Die]", "deity/Knowledge (proposal)", c => 2 * (c.wpn + c.mod + c.die + 5 * c.tier), "the R-120 (b) shape"],
  ["Civilization: Construct alone, Tempered Edge + Arsenal", "deity/Civilization", c => 2 * (c.die + c.die), "free after ~4 Investiture of setup; half of it ignores Deflect (Tempered Edge); the disciple's own three Actions are on top"],
  ["Civilization: Construct + the disciple's Strike ×3", "deity/Civilization", c => 2 * (c.die + c.die) + 3 * (c.wpn + c.mod), "the whole turn"],
  ["Power: draw + Warlord's Advance ×2 (+Fury max)", "deity/Power", c => 2 * (c.wpn + c.mod + c.die + 2 * c.tier), "1 Investiture each; no income — the pool runs dry"],
  ["Death: free layer (Decay + Servant + Garden) + Strike ×3", "deity/Death", c => 3 * c.die + 3 * (c.wpn + c.mod), "after two install turns; Cascade is per death, not counted"],
  ["Destruction: draw + Set Charge ×2, two enemies in each radius", "deity/Destruction", c => 2 * 2 * c.die, "energy; no roll, no save; 1 Investiture each, no income"],
  ["Chaos at tier 1: Entropy Strike + Isolating Ruin on the Omen", "deity/Chaos", c => c.tier < 2 ? (c.die + (c.die + 3) * 2) : null, "spirit/vital; ONE Omen at tier 1 (cap = tier); 3 Investiture for one turn"],
  ["Chaos at tier 2: Spreading Omen + Cascade Collapse (2 bearers)", "deity/Chaos", c => c.tier < 2 ? null : 2 * c.die, "spirit; 3 Investiture; + Disoriented on both"],
  ["Green: party riders — Coordinated Hunt on 6 party hits (3 attackers)", "leyline/Green", c => 6 * Math.min(3, c.tier === 1 ? 2 : 3), "free; +N per hit, N = attackers on the target, max = rank"],
  ["Life: Vital Diagnosis tax on 6 party hits", "deity/Life", c => 6 * c.tier, "vital; free for the scene after one Action"],
  ["White: Shield Wall on 4 attacks into two adjacent allies", "leyline/White", c => 4 * c.halfDie, "damage PREVENTED, free; L4"],
  ["Sovereignty: Censure on one enemy (2 attacks, d8 → d6)", "deity/Sovereignty", c => 2 * 1, "damage PREVENTED for 1 Action + 1 Investiture — about one point per enemy attack"],
  ["Sovereignty: R-119 Decree, 3 allies × 3 hits up, 3 enemies × 2 attacks down", "deity/Sovereignty (proposal)", c => 9 * 1 + 6 * 1, "per round for the scene, 2 Actions once — the swing item 106 buys"],
];

const fmt = n => (n == null ? "—" : String(Math.round(n * 10) / 10));
console.log("Damage-equivalent per turn (see assumptions at the top of this file)\n");
console.log("| line | tree | L1 | L5 | L7 | note |");
console.log("|---|---|---|---|---|---|");
for (const [name, tree, f, note] of LINES) {
  console.log(`| ${name} | ${tree} | ${fmt(f(CP.L1))} | ${fmt(f(CP.L5))} | ${fmt(f(CP.L7))} | ${note} |`);
}
