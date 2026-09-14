// The damage curve PER TALENT TAKEN — Ben's question on the Knowledge finding (2026-09-13):
// "This is taking every talent in the Knowledge tree, right? … What's the damage curve
// per-talent-taken?" Each row is a tree's damage line at N picks (the cheapest picks that make the
// line work, in prerequisite order), steady state (turn 3+ of a fight), at two tiers. Same
// assumptions as balance-turns.js, with Draw Mana = highest colour rank (R-126 (a)): 2 at tier 1,
// 3 at tier 2 — so a Draw plus two 1-Investiture plays is sustainable from level 1.
//   T1 = tier 1, rank 2 (die 1d6 = 3.5, mod +4, weapon d8 = 4.5, Mighty +2)
//   T2 = tier 2, rank 3 (die 2d8 = 9,   mod +6, weapon d8 = 4.5, Mighty +3)
// "team" = damage the rest of the party gains from the character's picks, 6 party hits a round.
"use strict";
const T = { T1: { die: 3.5, half: 1.75, mod: 4, wpn: 4.5, mighty: 2, tier: 1, draw: 2 },
            T2: { die: 9,   half: 4.5,  mod: 6, wpn: 4.5, mighty: 3, tier: 2, draw: 3 } };
const S = c => c.wpn + c.mod;                       // one plain Strike
const rows = [
  // [tree, picks, which picks, self per turn (fn), team per round (fn), note]
  ["(any)", 0, "none", c => 3 * S(c), () => 0, "the free floor: three Strikes"],
  ["Knowledge (as built)", 1, "Predatory Strike", c => 2 * (S(c) + 5 * c.die), () => 0, "Draw + 2 strikes; its own +1 per hit reaches 5 Insight by turn 2–3"],
  ["Knowledge (as built)", 3, "+ Studied Mark, Accumulate", c => (3 * (S(c) + 5 * c.die) + 2 * (S(c) + 5 * c.die)) / 2, () => 0, "Accumulate's refund lets every other turn be three strikes"],
  ["Knowledge (as built)", 5, "+ Hunter's Discipline, The Pack", c => (3 * (S(c) + 5 * c.die + c.tier) + 2 * (S(c) + 5 * c.die + c.tier)) / 2, c => 6 * 5, "The Pack: every ally hit +Insight (5) vital"],
  ["Knowledge (R-120 (b))", 1, "Predatory Strike", c => 2 * (S(c) + c.die + 5 * c.tier), () => 0, "one die + Tier per Insight"],
  ["Knowledge (R-120 (b))", 3, "+ Studied Mark, Accumulate", c => (3 * (S(c) + c.die + 5 * c.tier) + 2 * (S(c) + c.die + 5 * c.tier)) / 2, () => 0, ""],
  ["Knowledge (R-120 (b))", 5, "+ Hunter's Discipline, The Pack", c => (3 * (S(c) + c.die + 6 * c.tier) + 2 * (S(c) + c.die + 6 * c.tier)) / 2, c => 6 * 5, "the cash-outs keep [Tier][Die] × Insight as the burst"],
  ["Black", 1, "Withering Ray", c => 3 * (2 * c.die + c.mod), () => 0, "vital; costs ~half a die of health per cast, no Investiture"],
  ["Black", 2, "+ Blood Price", c => 3 * (2 * c.die + c.mod) * 1.15, () => 0, "advantage on the next Black test each cast, ~+15% hits"],
  ["Warrior", 2, "Stillstance, Mighty", c => 3 * (S(c) + c.mighty), () => 0, "free, unlimited"],
  ["Warrior", 3, "+ Saltstance", c => 3 * (S(c) + c.mighty + c.tier), () => 0, "free"],
  ["Red", 1, "Searing Bolt", c => 2 * (c.die + c.mod), () => 0, "Draw + 2 bolts, sustainable under R-126 (a)"],
  ["Red", 3, "+ Arc Flash, Kindle", c => 2 * (c.die + 2 * c.mod) + 2 * c.half, () => 0, "Kindle +Red mod on every bolt; the arc adds half a die to a second target"],
  ["Red", 5, "Reckless Advance, Volatile Strike, Momentum's Edge, Mighty (+1 filler)", c => (S(c) + c.mighty + c.die + c.half) + 2 * (S(c) + c.mighty), () => 0, "the charge line, needs a 20 ft approach each turn"],
  ["Civilization", 1, "Forge Construct", c => c.die + 3 * S(c), () => 0, "Construct 1 attack/round + the disciple's own Strikes"],
  ["Civilization", 2, "+ Tempered Edge", c => 2 * c.die + 3 * S(c), () => 0, "(after Ben's cut: still deflected)"],
  ["Civilization", 4, "+ Siege Form, Arsenal", c => 2 * (2 * c.die) + 3 * S(c), () => 0, "two Construct attacks a round, free after setup"],
  ["Death", 4, "Withering Touch, Consuming Decay, Necrotic Cascade, Reaper's Harvest + Risen Servant", c => 2 * c.die + 3 * S(c), () => 0, "decay tick + servant, after two install turns; the cascade is per death"],
  ["Power", 1, "Warlord's Advance", c => 2 * (S(c) + c.die), () => 0, "Draw + 2 advances, sustainable under R-126 (a)"],
  ["Power", 4, "+ Momentum of Victory, Unstoppable Advance, Warlord's Fury", c => 2 * (S(c) + c.die + 2 * c.tier), () => 0, "Fury at its cap"],
  ["Life", 1, "Vital Diagnosis", c => 3 * S(c), c => 6 * c.tier, "the party's +Tier vital on every hit against the mark"],
  ["Green", 3, "Pack Hunter, Predator's Instinct, Coordinated Hunt", c => 3 * S(c), c => 6 * (c.tier === 1 ? 2 : 3), "+N per hit for N attackers on one target, max = rank"],
];
const f = n => String(Math.round(n * 10) / 10);
console.log("| tree | picks | which | self T1 | self T2 | team T1 | team T2 | note |");
console.log("|---|---|---|---|---|---|---|---|");
for (const [tree, n, which, self, team, note] of rows) {
  console.log(`| ${tree} | ${n} | ${which} | ${f(self(T.T1))} | ${f(self(T.T2))} | ${f(team(T.T1))} | ${f(team(T.T2))} | ${note} |`);
}
