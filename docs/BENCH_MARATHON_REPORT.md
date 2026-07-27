# BENCH MARATHON REPORT — 2026-07-26 → 07-27

**Seven bench runs, eight fix passes, 52 commits, one branch (`claude/rule-2b-audit`, then
`claude/heroic-and-tooling`, both pushed).** 190 checklist rows retired on live evidence ·
27 defects found → 26 fixed → 22 re-tested and retired at the table · 5 new build gates ·
engine tests 215 → 298.

Everything below was executed live in your running Foundry as the `Bench` GM user, or verified
in code with a pinned regression test. Where a claim is an inference rather than an observation,
it says so.

**The four things that need YOU are, in order:** §4 the deploy queue (four pack rebuilds) ·
§3 the rulings batch (14 items, defaults marked) · §6 one unrepaired world-hygiene item on your
campaign adversaries · §5 the two-client rows.

---

## 1. Per-section disposition

Retired rows are **removed** from `EDHA_FOUNDRY_TEST_CHECKLIST.md` with their evidence recorded in
the dated handoff delta — that is the checklist convention, so "open" below is what genuinely
remains, not work that failed.

| `# BENCH —` section | Retired this marathon | Still open | of which ⚑ yours | blocked | **runnable** |
|---|---|---|---|---|---|
| Engine-wide & cross-tree | 7 | 16 | 9 | 0 | 7 |
| White (leyline) | — | 4 | 3 | 0 | 1 |
| Blue (leyline) | — | 5 | 4 | 0 | 1 |
| Black (leyline) | — | 5 | 4 | 0 | 1 |
| Red (leyline) | — | 4 | 1 | 0 | 3 |
| Green (leyline) | — | 4 | 2 | 1 | 2 |
| **Destruction** | 14 | 2 | 2 | 1 | 0 |
| **Life** | 2 (+3 fixed→retired) | **0** | 0 | 0 | 0 |
| **Chaos** | 15 | 1 | 1 | 0 | 0 |
| **Fate** | 20 | **0** | 0 | 0 | 0 |
| **Sovereignty** | 8 (whole section) | **0** | 0 | 0 | 0 |
| **Death** | 17 | 2 | 1 | 0 | 1 |
| **Civilization** | 10 | 2 | 1 | 0 | 1 |
| **Power** | 17 (whole section) | **0** | 0 | 0 | 0 |
| **Knowledge** | 12 | 1 | 1 | 0 | 0 |
| **Order** | 17 | 5 | 1 | 0 | 4 |
| **Heroic paths** | 28 (16 run 9 + 12 run 10) | 16 | 4 | 8 | **0** |
| **TOTAL (bench scope)** | **190** | **67** | **34** | **10** | **21** |

**Five sections are now empty**: Life, Fate, Sovereignty, Power, and (bar one ⚑) Chaos and
Knowledge. Every deity tree has been driven end-to-end at least once.

**What is actually left of the marathon's scope is 67 rows, of which 21 are agent-runnable and 10 are
blocked on your rebuilds.** The rest are ⚑ yours by nature — canvas rendering, table feel,
multi-client, "does this look right".

> ✅ **Update (2026-07-27k, bench run 10 — the dedicated Heroic run you asked for).** Heroic is
> **finished as far as the current deploy permits**: 12 more rows retired on evidence, and the
> **20 "runnable" rows in the row above are now 0**. The 16 that remain are not untested — they are
> **blocked**, and mostly by one missing action:
> - **8 rows** wait on **`foundry-build heroic` + ⟳ Sync Talents** (the dead-cosmere-skill-key family
>   fixed in `83c04ea` but never built). A fresh console read this run confirmed every stale key is
>   still in the live pack, so nothing was failed against it. **That single rebuild unblocks all 8.**
> - **4 rows** are ⚑ design calls that are yours alone — every factual half is now proven.
> - **1** is a new engine FAIL found this run (quarry auto-advantage never applies), **1** is blocked
>   behind it, **1** needs a bench-roster change rather than a test (no bench PC owns Probability
>   Net), and **1** is a Blue row parked in the Heroic section.
>   ✅ **The FAIL was fixed the same day (pass 8, `b96a915` — see §2).** Those first two rows now need
>   only **⟳ sync the module + F5**, not the heroic rebuild, so Heroic's runnable count is 0 → **2**.
>
> Heroic's blocked count rising 6 → 8 is not regression: two collapsed spot-rows (Contest-gate,
> Warrior stances) had their remaining runnable items cleared this run, so what is left of each is
> purely the blocked remainder. The bench-scope TOTAL's runnable column falls 41 → 21 for the same
> reason — those rows were done, not deferred.

> ⚠️ **Correction (2026-07-27).** An earlier version of this table said Heroic had **282** open rows
> and put the checklist total at 333. That was a counting error on my side, not a change in the
> data: I split the checklist on `# BENCH —` headers only, so every block that physically follows
> Heroic in the file — the player-client window, the character-creation wizard, the culture/items/
> currency tranches, and eleven bestiary sections — was silently added to Heroic's count. Those 256
> rows are real work, but they are **not** `# BENCH —` rows and were never in this marathon's scope.
> Heroic itself is **26 open rows, 20 of them runnable**. The corrected numbers are above.

### Outside the bench scope (for planning, not for this marathon)

256 further open rows live in non-`# BENCH` sections, the big ones being: the **character-creation
wizard v2** (38 open, 21 runnable), **adversary ability wiring** (27), and eleven **bestiary**
sections (~140 open, but ~130 of those are ⚑ yours). The **player-client window** block is the one
your new passwordless player user unlocks — see §5.

### What was NOT reached, by section (run 9's honest list — your remaining worklist)

- **Leyline leftovers, entirely**: White 2bR-10 · 2bR-17 · Blue 2bF-17, 2bJ-3, 2bAA-8 · Black
  2bI-9, 2bZ-10 · Red 2bA-5 + 2 spot-checks · Green 2bS-11, 2bS-3 + spot-checks (2bS-1 blocked).
- **Deity leftovers**: 2bY-7 · 2bW-1 · 2bV-2/6/8 · 2bL-9/12.
- **Adversary sections, entirely**: 2bAB-1 (blocked) · 2bAB-8 · four NO-NAMEABLE-HOOK confirmations.
- **Engine-wide**: 2bAC-2 · the GM-summon relay · Withering Ray's skill test.
- **In Heroic**: 2bZ-8 (now unblocked), 2bF-13's success branch, 2bE-5's negative, 2bZ-7's
  negative, and the Envoy/Leader/CAE cluster spot-checks. — ✅ **ALL OF THESE WERE DONE by bench
  run 10 on 2026-07-27k**, along with 2bE-4, 2bO-7, 2bC-7, 2bN-3, 2bZ-11 and the orphan-token guard.

Run 9 chose depth over breadth deliberately: root-causing the eight-talent skill-key family was
worth more than touching more rows shallowly. I agree with that call.

### Why Heroic wasn't finished — a scheduling error, not an omission

Heroic *was* in the marathon plan: as one quarter of the single final-sweep run, sharing that run
with the Engine-wide remainder, the adversary sections, and the leyline leftovers. Heroic is 133
talents and had **never been benched at all** before run 9 — giving it a quarter-run when every
deity tree got a half-run was backwards, and run 9 spent most of its budget root-causing the
eight-talent dead-skill-key family instead (the right call in the moment — that family was breaking
talents in three other sections too).

The result: **16 Heroic rows retired, 20 runnable rows still open.** That is roughly one focused
run, not a mega-effort — the "282 rows" figure in the first draft of this report was my counting
error, corrected above.

> ✅ **That focused run happened: bench run 10, 2026-07-27k.** It retired 12 more rows and took
> Heroic's runnable count to **0**. The estimate held — one run was the right size. What is left is
> **16 rows that no agent can move on the current deploy**, half of them waiting on a single
> `foundry-build heroic` + ⟳ Sync Talents. See §1 for the exact breakdown.

The process lesson stands regardless: the instruction said to adjust freely based on what was
actually open, and I followed the given run order instead of counting the sections first. The
`bench-marathon` skill now opens with a "size the run to the section, not the section to the run"
step that requires counting `- [ ]` rows per section, minus ⚑, before scheduling anything.

---

## 2. Every defect: found → fixed → re-tested

27 defects. **26 fixed, 1 works-as-designed, 1 carried unfixed** (Shockwave Slam, found run 1,
before this marathon). 22 have been re-tested and retired at the table; 5 await your deploy.

### Found run 3 (before the marathon), fixed in pass 1, re-tested run 4 — all 8 retired

| Defect | Root cause (verified in code, not re-derived) | Commit | Re-test |
|---|---|---|---|
| Whispered Doubt posted no card | `edhaDrainFocus` was the one silent focus write — every other resource branch announced | `b3d1652` | ✅ run 4 |
| Puppeteer printed literal `{name}` | Only the accept path substituted; the offer path never did | `933f24f` | ✅ run 4 |
| Cruel Step mis-stopped on a straddled wall | **Not** the bench's corner-origin hypothesis — the origin *is* the token centre (verified in v13 source). Real cause: sweep-collision degeneracy at a collinear origin | `8a212b8` | ✅ run 4, both probes |
| Mender's Instinct offered on hostile crossings, world-wide, with the full description | Three separate gaps: no disposition gate, a `game.actors` world-wide sweep, and a `note` that pasted the description | `b713e01` | ✅ engine halves run 4; card/range needs the leyline rebuild |
| "No Healing" didn't block rule-driven heals | The mark guarded `applyDamage` only; every direct `hea` write bypassed it | `f1aa75d` | ✅ run 4 |
| Herding Antlers dead on the Fellstag | **Not** a builder miss — the ability had no `events` block at all, so the 07-26j promotion correctly skipped it | `8917cbb` | ⏳ needs adversaries rebuild |
| `edhaAttackKind` read a stripped field | `system.range` doesn't exist on cosmere 2.1.0 weapons; the discriminator is `system.attack.type` | `be6b16d` | ✅ run 4 |
| Tempered Edge's ignore-deflect | **Works as designed** — the calc line always shows "− deflect"; the net is right. Card now explains the pre-payment | `44a10ab` | ✅ run 4, by NET |

### Found run 4, fixed in pass 2

| Defect | Root cause | Commit | Re-test |
|---|---|---|---|
| `edhaIsConstruct` dead field (Fault Line ×3 inert) | `system.customType` doesn't exist; type lives at `system.type.{id,custom}`. Also: Forge Construct minted its summon as `humanoid` | `1974fe6` | ⏳ needs deity rebuild + re-forge |
| Remains ledger lost entries under multi-drop AoE | Unserialised read-modify-write; last write wins. Fixed at the shared level (`edhaOwnerListQueue`) across **all 16** ledger write sites | `468f27e` | ✅ run 5 |
| Flame Surge rolled 0 on both bosses | The ability had `events` but no `damage` block in `adversaries.json` | `7daa2da` | ⏳ needs adversaries rebuild |

### Found run 5, fixed in pass 3

| Defect | Root cause | Commit | Re-test |
|---|---|---|---|
| Adaptive Mutation had no once-per-creature gate | The card's clause was enforced nowhere | `484bfec` | ✅ run 6 |
| Apex Form minted TWO injuries at scene end | **Not** the suspected double-moment — two GM clients each ran the clear. The raw-`isGM` gate was retrofitted across all 15 deleteCombat hooks | `bbac2e2` | ✅ run 6, under two GM clients |
| Surgical Precision's graze branch unreachable | `options.graze` never meant "missed" — it holds the graze sub-roll | `3ce6d26` | ❌ still failed → attempt 2 below |
| 2nd+ simultaneous nested kill never harvested | **Not** the suspected `_edhaCascadeBusy` (doesn't exist) — the dispatch depth counter conflated siblings with ancestry | `3f7ad4b` | ✅ run 6 |
| Chaos had no scene-end sweep (triaged from a "ruling") | The sweep existed but predated the ledger repoint | `cad4d1f` | ❌ half failed → attempt 2 below |

### Found run 6, fixed in pass 4 — including both second attempts

| Defect | Root cause | Commit | Re-test |
|---|---|---|---|
| Surgical Precision, **attempt 2** | **Not a race** — the system rolls a skill_test talent's *damage before its test*, so the decider always read one behind. Deterministic | `c4d8f71` | ✅ run 7, both paths |
| Chaos sweep, **attempt 2** | **Not a bail — an abort.** The only deleteCombat clear with unguarded per-actor awaits; one rejection killed the ledger unset and both later loops | `cb333f2` | ✅ run 7, zero warns |
| Snare spring double-fired on every entry | v13 fires `tokenEnter` **and** `tokenMoveIn` for one entry — the same double-event Civ already debounced privately | `b3f66a1` | ✅ run 7, five paths |
| Weave the Thread "swallowed 2 Inv" | **Not an engine bug.** A live repro showed the picker rendering — it was the engine's only AppV1 window, invisible to the bench's V2-tuned DOM sampling. Converted to DialogV2 | `92aad9c` | ✅ run 7; **2bX-9 unblocked and passed** |
| `tempHp` survived every scene reset | It had a getter, setter, absorption hook, socket relay — and no scene clear anywhere | `b31e234` | ✅ run 7 |

### Found run 7, fixed in pass 5

| Defect | Root cause | Commit | Re-test |
|---|---|---|---|
| Siege Form / Arsenal / Magnum Opus never saw a forged Construct | The veto passed the *consuming* talent's name into a *forger*-identity lookup — only legacy un-stamped summons worked, the inverse of intent | `976f595` | ✅ run 8, against a normally-stamped Construct |
| Raw i18n keys on cards | **A nine-site family**, not the two sightings. `CONFIG.COSMERE.*.label` holds raw keys; EDHA's own statuses carry English, so only native ids ever showed it. Run 7's "Bastion has a working path" was wrong — Bastion *hardcodes* the literal | `c406391` | ✅ run 8, all 7 cards + the authored-override negative |

### Found run 8, fixed in pass 6

| Defect | Root cause | Commit | Re-test |
|---|---|---|---|
| **The whole counter economy wrote a dead field** | `ActiveEffectDataModel`'s schema is exactly `isStackable` + `stacks`. Writes to `system.count` resolved with no error and were dropped; every read was 0. Blast radius: seven Knowledge rows plus any `@counter` in any tree | `f604d1f` | ✅ run 9, all six re-opened rows |
| Two more dead fields the new gate found | `bench-setup-console.js` read the same dead `system.range.value` — **no bench PC had a ranged weapon in any of the first eight runs**, silently. `foundry-build.js` wrote six keys the TalentItemDataModel drops (inert) | `7dda01a` | ✅ run 9 — Shortbow on all 16 PCs, unblocking 2bX-16 |

### Found run 9, fixed in pass 7 — **two re-tested at run 10, two still await the heroic rebuild**

| Defect | Root cause | Commit | Re-test |
|---|---|---|---|
| **Eight talents wired to cosmere skill ids that don't exist** | `itm`/`per`/`ldr` aren't skills. A contest compares against the id the player actually rolled, so a dead id waits forever; `@skills.<id>.rank` substitutes to 0. Flamestance *never worked*, and now has a cause | `83c04ea` | ⏳ needs heroic rebuild — a run-10 console read confirmed every stale key is still in the live pack |
| An attribute contest rolled a bare d20 | `spd` wasn't a data bug — `edhaRollOpposedSkill` skipped both terms for an attribute id, so a "tests Speed" card rolled nothing | `b2de5b4` | ⏳ needs heroic rebuild |
| CAE grant write-race | Same race as the H3 one, on a path that never went through the queue | `2a87c4d` | ✅ run 10 — three groups from one combat start, then two-in-one-tick |
| Pack Hunting double-dipped | **Not** an `appliesTo` failure — it declares `either` correctly. It *applies* at `pre<Ctx>Roll` but *consumes* at `<ctx>Roll`, and a Strike rolls damage inside that window | `7e414d8` | ✅ run 10 — one card, one roll, flag consumed once |

### Found run 10, fixed in pass 8

| Defect | Root cause | Commit | Re-test |
|---|---|---|---|
| **Quarry auto-advantage has never once applied** | Two mistakes at one site, both re-derived from the installed system rather than from the report. `AdvantageMode` is a **string** enum and `hasAdvantage` is `=== "advantage"`, so the number `1` made `configureModifiers()` leave a plain `1d20` — while still reading back as `advantageMode: 1`, which is why the bench's probe saw "advantage is set" and the dice disagreed. And `preRoll` fires *before* `configureDialog`, which reassigns `options.advantageMode` from its own result, so the missing wrapper would have dropped even the correct value on any dialog roll. **The family sweep says ONE**: nine advantage sites in the engine, eight already correct on both counts — worth stating, because the raw-i18n and dead-field sweeps each turned two sightings into nine and three. It is the *second instance of the shape* though (the retired `edhaStanceAdvPreRoll` was the first), and the engine comment claiming that one's regression was "pinned in tests/" was false — nothing in `tests/` mentioned `advantageMode` | `b96a915` | ⏳ needs ⟳ sync + F5 (engine-only) — un-blocks 2bX-17 too |

### Carried, unfixed

- **Shockwave Slam's weapon-hit trigger surface** — found run 1, before this marathon, never
  root-caused. The only defect that outlived the whole marathon.

### Five gates built (worth more than the individual fixes)

The marathon hit the same *shape* of bug four times — code writing or reading something the cosmere
system does not actually define, failing silently every time. Rather than fix each one and move on:

- **lint-refs pass 11** — validates engine `system.*` writes against the system's real schemas, in
  all three syntactic forms. Mutation-verified against all four historic writes.
- **lint-refs pass 12** — validates every authored skill/attribute/status/damage-type/defense id
  against the system's vocabulary *plus* EDHA's own (parsed live out of the engine, so registering
  a new status never means editing the linter). With the data fix reverted it reports exactly the
  eight original sites.
- **lint-refs pass 10** (pass 5) — fails the build on any raw `*.label` read.
- **lint-refs pass 13** — the same disease one step over: an authored value whose NAME resolves but
  whose *shape* is wrong for the channel it lands in. `edha-test-rider` passes its `mode` straight
  into `roll.options.advantageMode` unnarrowed, so `mode: "adv"` typed on the Events tab is
  byte-for-byte the run-10 defect; on `edha-next-test-mod` a typo is worse than inert, because the
  engine normalises anything non-`advantage` to disadvantage and therefore **inverts** the rule.
  Mutation-verified against a planted value.
- **`tests/advantage-channel.test.js`** — the engine half of the same family: every
  `.advantageMode =` site must write the string enum *and* wrap `configureDialog`, with both
  historic instances held fixed. Mutation-verified: restoring `= 1` fails three of its six cases.
  Deliberately a test rather than a sixth lint pass — the split mirrors pass 11 / `dead-field.test.js`,
  and two gates for one check is two things to keep in sync.

---

## 3. THE RULINGS BATCH — one menu, your call

Nothing here was decided silently except where marked **APPLIED**, and those are flagged because
the card was unambiguous (card-is-spec is this project's established convention). Veto any of them.

### A. The big one: out-of-combat scope (recommended default marked)

Every run saw this; the characterization is now complete:

- Any focus decrease counts as a spend — **including your own GM bookkeeping edits**.
- Every rule-owner **on the scene** watches everything (a parked campaign token armed a bench
  talent from 45 ft away, unplayed).
- An adversary's own ability cost is taxed by enemy watches.
- HP-threshold watches went **world-wide, off-scene** (fixed — owners now need a scene token).
- Out of combat, **per-round ledgers never reset** (in combat the round boundary cleans correctly).
- Restrained "until your next turn" never expires out of combat.
- **Final Decree bound five of your placed playtest adversaries** alongside the four bench targets —
  the loudest instance found.

> **Recommended default:** gate scene/turn-keyed watches on an ACTIVE combat containing the owner,
> and tag engine bookkeeping writes so GM edits don't read as spends. **Your ruling.**

### B. Scope and width

1. **Fault Line spares allies** — the card says "Each character in the line", the engine catches
   enemies only. Same question for every `kind: line` zone.
2. **Edict's Temp HP rider swept "17 ally(ies)"** — width is per-design, but worth a look.
3. **Roster cross-talk** — the 15 always-armed bench PCs' watches fire scene-wide and interleave
   with every row (Devoted Conduit once ate Lifeline's own 3 spirit). *Recommended default: park
   non-active bench PCs' watches — a bench-setup convention, not an engine change.* Related: your
   campaign Corvaine adversaries' "Break" cards fire on bench victim drops.

### C. Mechanics

4. **Does "cannot regain HP" stop drop-to-1 stabilization?** Death Ward, Raise Dead and
   Unbreakable Line are all consistently ungated today.
5. **A fully-blocked heal still spends the click's cost** (1 Inv, heals 0) — GM refund, or a
   pre-click veto?
6. **A raised creature that was itself harvested stays a Remain** — should Raise Dead clear the
   target's own marker and ledger entry?
7. **Snare placement *under* a creature insta-springs** vs the card's "enter or pass through".
   *Recommended default: arm, don't spring.* Note run 7 narrowed this: **adjacent** placement does
   *not* spring, which is what finally made Foreknown Strike's rider observable.
8. **Mutation riders fire on a nat-1 graze** — intended?
9. **2bI-3's card text stays enemies-only** (verified live) — widen the engine instead?

### D. Cosmetic / feel

10. **Walking Ruin has no token indicator**, unlike every other scene-arm (Cascade Armed, Crowned,
    `withernext`, `warlord`).
11. **Unweaving lists the Omen marker itself** as a dispellable effect button.
12. **Temp HP source relabelling** — Investiture of Command and Bear Witness both relabel
    `tempHp.source` on a no-op keep, so a surviving 6 from Final Decree ends up credited elsewhere.
13. Ordained eviction is unverbalized · Inevitable's card grammar · Bulwark's THP attribution.

### E. Applied as defaults (veto if you disagree)

14. **APPLIED — The Pack's placement no longer requires `amt > 0`.** The card reads unconditional
    and `+@counter` is legitimately 0 whenever the marker is cleared from the token HUD while the
    bearer pointer survives. Only The Pack changes behaviour.
15. **APPLIED — Confident Command's `per` is Persuasion**, decided by its card text ("Intimidation,
    Leadership, or **Persuasion**"). Sharp Eye's `per` is Perception — the same dead id resolved
    *differently* in two talents, which is why they couldn't be swept together.
16. **APPLIED — a "tests Speed" card means the attribute.** The card is canon, so the engine moved
    to support attribute contests. ⚠️ **This changes live dice math**: Concussive Yield and
    Inevitable Snare now add the target's Speed where they previously added nothing. Worth one
    balance look.

### Also flagged

- **Rank-3 Black Attunement Range measured at 60 ft** — staging had assumed 30.
- **Run 6's 2bX-5 PASS was recorded over a broken roll** (its "SPD 3" was a bare d20). Its other
  halves stand; the contest half is worth re-reading after the deploy.

---

## 4. YOUR DEPLOY QUEUE — in this order, Foundry CLOSED

The engine is already live on your machine: I synced `module-src/scripts/register-skills.js` after
every fix pass and hash-verified each time (five deploys, no drift — your live copy had no hand
edits this whole marathon). **All engine fixes through 07-27j are on disk.**

**1. Relaunch Foundry (or F5)** — picks up the last engine sync. Byte-check if you want certainty:
`edhaContestAttrFor`, `edhaNextModClaimOk`, `edhaOwnerListQueue(c, key`.

**2. `foundry-build heroic` + ⟳ Sync Talents** ⭐ NEW, and the biggest single unlock — it fixes
seven of the eight dead-skill-key talents, including Flamestance, which has never worked.

**3. `foundry-build leyline` + ⟳ Sync Talents** — carried since run 5. Mender's Instinct's tight
card text + its green range gate.

**4. `foundry-build deity` + ⟳ Sync Talents + RE-FORGE the Construct** — carried since run 5. The
`creatureType: "Construct"` mint (Fault Line's ×3) and Surgical Precision's cosmetic rule text.
An already-standing Construct keeps its old humanoid type until re-forged.

**5. `foundry-build adversaries` + ⟳ Sync Adversaries + re-drag the Fellstag + re-import BOTH
bosses** — carried since run 5. Herding Antlers (0 events) and Flame Surge (`damage.formula: null`).

**Then re-test, in this order:** the eight skill-key talents (2bE-4, 2bJ-12, 2bO-7, 2bN-2, 2bB-4,
2bQ-4, 2bM-6, 2bZ-8 — all annotated in the checklist) · Mender's card + range · Fault Line's
Constructs ×3 · Herding Antlers · Flame Surge (2bAB-1) · the three unverified engine fixes from
pass 7 (2bAD-1, 2bAD-2, the CAE grant, Pack Hunting).

**Before any ranged row:** re-run `scripts/bench-setup-console.js` and confirm
`weapon.system.attack.type === "ranged"` — the Shortbow only exists since run 9.

---

## 5. Two-client ⚑ list (need a second logged-in client)

| Row | What it needs |
|---|---|
| **2bR-10 Devoted Conduit** | Two White characters — it deliberately never reduces the redirect the owner took themselves. The shared evaluator is proven; only the staging remains. |
| **2bL-7 Covenant's shared icon** | Two Order PCs covenanting the *same* ally, then one breaking. Getting it wrong strips the second player's marker silently — it's why the rule carries `multiOwner`. |
| **Illusion belief loop** (Blue, ~2bF-17 cluster) | A real player client; the belief loop can't be driven from one GM. |
| **2bAA-8 / 2bAC-1 / 2bAC-2** | Second-client and screenshot rows. |
| **2bW-13 Apex Form** | Already ✅ **passed** under two GM clients in run 6 — recorded here because that's the only reason it was provable. |

**Ben is adding a passwordless player user for the next marathon (2026-07-27).** That unlocks the
whole `🎮 Player-client window` block, which is the batch to burn down in one sitting rather than a
row at a time. The `bench-run` skill now carries the two-client procedure: open a second browser-pane
tab, join as the player there, drive each tab by its own `tabId` — and log **both** clients out at
the end, because a held player slot blocks the next run exactly like a held Bench slot.

Worth knowing: the *two-GM* rows are a different shape and are already provable whenever your own
Gamemaster client is connected. Apex Form's double-injury bug was found that way, and its fix
verified the same way.

---

## 6. World hygiene

### CLOSED — the campaign-adversary effects (Ben, 2026-07-27)

Run 8's end-of-run status sweep removed four statuses that pre-dated it from adversaries on the
Playtest Map (two `Weakened` restored; one `Weakened` among two Cinderhounds and one `Prone` among
three Mutated Thralls left unrestored, because the sweep log couldn't say which duplicate held them).

**Ben's call: no action needed — that map is a stale one that isn't in use.** Recorded here only so
the process lesson isn't lost with it: that run snapshotted ids and flags but **not effects**, which
is why it couldn't undo its own sweep. The runbook and the bench-run skill now require an effect
snapshot, and run 9 closed with an **exactly zero effect diff** — 8 created, 8 removed, nothing
pre-existing touched.

### Everything else is clean

- **Cleanup id-diffs ended exactly empty on all six runs.** Run 9's was the strictest: every
  document count identical to start (87/2/1/42/8/53/117/1/0), all 23 roster tokens at their exact
  start coordinates, **Tem parinaem and Soggy Bottom verified untouched** (HP 3 and 6, zero
  effects). Your campaign combat `BerbNeuXp4iKduef` was never opened.
- **Run 7 self-reported and repaired** one event: it resolved a token by name and moved the run-1
  orphan `Combat Construct` from (7500,4800) to (5700,11400), then restored it and verified. The
  runbook now forbids name-resolution when duplicates exist.
- **The run-1 orphan `Combat Construct` token is still on the Playtest Map**, left for you. Note:
  its `actorId` points at a *deleted* actor, so no summon lookup can ever find it — 2bP-9 can never
  replace it and it isn't testable. Run 4 claimed it had been cleaned up; that claim was **retracted**
  (its start snapshot only captured ids, so it couldn't support the claim).
- **`Bench Ally — One` carries three stale flags** (`bpHits`, `accord`, `coordRound`) that predate
  run 5 and survived every sweep. Harmless; left deliberately.
- **Pack enumeration prints 10 CosmereItem validation warnings** (`canticle`/`kettavar`/`corvaine`/
  `sylvaneth`/`goldenport`/`thalendor`/`malcurr`/`lunavar`/`ashkar`/`vorsk` "is not a valid choice")
  — pre-existing world noise, not ours.
- **Bench chat is heavy** — roughly 700+ messages across six runs. **Safe to flush.**
- Recorded, deliberately not fixed: `topLevelKeys` in `handler-schemas.js` drops *quoted* object
  keys. It can only ever add a false positive to lint passes 11/12, never hide a real one, and
  changing a parser three passes depend on with no bench run left to catch a regression was the
  wrong trade.

---

## 7. Notes on method (why some of this took two attempts)

Four of the marathon's root causes **contradicted the bench's own labelled inference**, and in each
case the fix that would have followed the inference would have been wrong:

- Cruel Step's ray origin was already the token centre — the "corner-based origin" fix would have
  been a no-op on a real degeneracy.
- Apex Form's double injury was two GM *clients*, not a double *moment* — the suspected fix would
  have left it broken whenever you were logged in.
- Surgical Precision was a fixed ordering, not a race — which is why attempt 1 (a better capture)
  failed and attempt 2 (decide at the right moment) worked.
- Weave the Thread wasn't broken at all; the harness couldn't see an AppV1 window.

That is the argument for keeping the "verify the root cause in code before touching anything" step
even when a bench report sounds confident. Both second attempts landed because the second pass went
back to the source (the installed cosmere system, the v13 collision code) instead of iterating on
the first guess.

---

*Report generated by the orchestrating session at the end of the marathon. Every commit referenced
is on `claude/rule-2b-audit` and pushed. Gates were run individually before every commit — `python`
never `python3`, no `;`-chaining, no piping through `tail`.*
