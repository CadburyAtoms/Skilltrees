# Turn ledger — recording a yardstick fight

The ecosystem critique (`docs/analysis/talent-ecosystem/CRITIQUE.md`, 2026-09-12) named the one
measurement that would most change a decision: *for every PC turn, record which of the three
Actions went to (i) a talent on the sheet, (ii) Draw Mana or a standard action, (iii) nothing
useful.* That number is what R-96 guessed at from a talent count, and it hands R-106 its
enemies-per-encounter input and R-134 its per-role targets. Bench run 44 (2026-09-09) played
three rounds of the Palewater ford this way on copies of the real PCs and found the fight
overshooting for two structural reasons — no ranged attack on the party, and grazes flooring
damage every round — neither of them a statblock. That is the kind of finding a ledger produces
and a card read cannot.

A yardstick fight is a `bench-run` job: 🤖, on copies of the three PCs (never the players'
actors — `scripts/bench-setup-console.js` protects them), on a licensed scene, world restored
afterwards. Record one fight per file section below; three fights make a set (a minion pack, a
rival pair, a boss). Charge the graze's Focus.

## Fight header

| | |
|---|---|
| Date, bench run | |
| Engine hash served, packs stamp (from DEPLOY STATE) | |
| Scene | |
| Adversaries (block × count, folder) | |
| PC copies (level, HP, Phy/Cog/Spi, Deflect, ranged attack yes/no) | |
| Numbers softened from the card? (say which, and why) | |
| Rounds played | |

## Per round

| Round | Enemies on the field | Damage to party (by source, graze marked ⌐) | Damage to adversaries (by PC) | Focus spent on grazes | Drops / withdrawals |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

## Per PC turn — the three Actions

Code each Action: **T** = a talent on the sheet, **D** = Draw Mana or a standard action (Strike,
Move, Brace…), **N** = nothing useful (no target, no resource, no idea). Twenty rows per PC over a
set is the sample the critique asked for.

| Round | PC | Action 1 | Action 2 | Action 3 | Note (what the talent did, or why nothing) |
|---|---|---|---|---|---|
| 1 | | | | | |

## Reading it

- **Share of Actions a sheet fills** = T / (T + D + N) per PC. The review's R-96 premise.
- **Damage in per round ÷ party HP pool** and **damage out per round ÷ adversary HP pool** — the
  two numbers R-134's targets are written in. Bench run 44's ford: 18 in, 7 out, over three rounds.
- **Enemies on the field per round** — R-106's missing input.
- Anything structural (no ranged attack, a floor of graze damage, a cue that never fired) goes to
  `test-pass-fixes` as a report, not into a ruling.
