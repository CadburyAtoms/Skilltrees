# Sovereignty and the deity outliers — the tree nobody had noticed

> Agent output, 2026-09-09, run `wf_0b59b6ca-5bc`, analysis key `sovereignty`. Raw and
> unedited: the analysis as its agent wrote it, then the adversarial verifier that attacked it.
> Not re-runnable by script. Where the verification disagrees with the analysis, the
> verification is the later and better-checked word — and see `problem-ledger.json` for what
> the ledger kept, dropped, or ranked.

## Analysis

I have everything I need. Writing the analysis.

---

# deity/Sovereignty (Verdannis) — the die-step tree

## 0. Method, and what I checked beyond the brief

Everything below is checked against `dossier/deity-Sovereignty.md`, `dossier/all-talents.json`, and `dossier/SYSTEM-PRIMER.md`. Three claims in the brief turned out to need correction, and I could only find that by reading the **shipped rules** — `data/authored/deity-sovereignty.json` (the talents' own `events`, which is talent data, in scope) and the handler those rules invoke, `module-src/scripts/engine/44-sovereignty.js`. Where I stepped outside the 365 for that, I say so and say what it settles.

The three corrections, up front, because they change the answer:

1. **A die step is not worth "+1 average damage". It is worth +1 average damage *per die in the formula*** — and the engine steps *every* ladder die it finds. The tree's power therefore varies by a factor of **12** depending on which ally you point it at.
2. **White is not a pure toll booth.** It sizes one die (Sovereign's Favor's temp HP) and sets the ally-side Attunement Range. Neither fact appears on any card.
3. **The die step applies to healing rolls too.** The wrapper reads `system.damage.formula`, and heals live in that field with `type: "heal"`. Nobody has noticed this; it needs a ruling.

---

## 1. The nine talents, in full

| # | Talent | Action | Cost | Depth | Earliest L | Gate | What it does |
|---|---|---|---|---|---|---|---|
| 1 | **Censure** | 1 Action | 1 Inv | 0 | **L1** | Black 2+; White 2+ | Test Black vs. Cognitive. Success: target's damage die −1 step (min d4) until the start of your next turn. |
| 2 | **Exalt** | 1 Action | 1 Inv | 0 | **L1** | Black 2+; White 2+ | No test. Willing ally's damage die +1 step (max d12) until the start of your next turn. |
| 3 | **Expose** | Passive | — | 1 | **L2** | Censure | Censured creature fails *a test* → you recover 1 Investiture. Fails an *attack* test → the ally who was the target may make a Reactive Strike. |
| 4 | **Sovereign's Favor** | Passive | — | 1 | **L2** | Exalt | When you use **Exalt**, the ally also gains `[Tier][Die]` temp HP. Non-stacking. |
| 5 | **Decree of Ruin** | 1 Action | 2 Inv | 1 | **L6** | **Black 3+**; Censure | Test Black vs. Cognitive. Success: −1 step **for the scene**. Failure: −1 step for one round. Once per creature per scene. |
| 6 | **Investiture of Authority** | 1 Action | 2 Inv | 1 | **L6** | **White 3+**; Exalt | No test. Ally +1 step **for the scene**, replacing your Exalt on that target. Once per ally per scene. |
| 7 | **Edict of the Fallen** | 2 Actions | 2 Inv | 2 | **L3** | Expose *or* Decree of Ruin | Test Black vs. Spiritual. Success: −2 steps **for the scene**, *attacks only*, and each failed attack test gives every ally in range temp HP = Tier. Failure: −1 step, one round. **No frequency cap.** |
| 8 | **Sovereign's Balance** | 1 Action | 2 Inv | 2 | **L3** | Sovereign's Favor *or* Investiture of Authority | No test. One ally +1 / one enemy −1 for one round; if the ally hits the enemy this round, both extend one round. |
| 9 | **Sovereignty** (capstone) | **3 Actions** | 3 Inv | 3 | **L4** | Sovereign's Balance *or* Edict of the Fallen | No test. Ally +2 / enemy −2 **for the scene**; whenever the ally hits the enemy, the enemy cannot take reactions until the start of its next turn. Once per scene. |

Action-type census re-counted from those nine: **5 × 1 Action, 1 × 2 Actions, 1 × 3 Actions, 2 Passive. Zero Specials, zero Free Actions, zero Reactions.** 78% of the tree costs a full Action or more, against a deity guide target of 25–35% Action. The three action types the guide asks for at 15–20%, 10–15% and ~10% are all at **0%**.

**The tree cannot target its own owner.** Verified in the engine, not inferred: `edhaSovTargets` builds the ally list as `toks.filter(t => t.actor && t.actor !== owner && ...)` — Exalt, Investiture of Authority, Sovereign's Balance and the capstone's elevate half **cannot be pointed at yourself**. `edhaAlliesInAttune` calls `edhaTokensWithin`, which begins `if (t.id === centerTok.id || !t.actor) return false` — so **Edict of the Fallen's temp HP does not include you either**. Of nine talents, exactly one clause benefits the character who paid nine talent slots for them: Expose's Investiture refund. I checked the other nine deity trees; every one has at least one self-affecting talent (Life Surge "may self-target", Covenant's +1 defences applies to you, Mantle of the Aspirant, Reaper's Harvest, Warlord's Advance's temp HP). **Sovereignty is the only tree in the atlas that does nothing for its owner.**

---

## 2. What a die step is actually worth

### 2.1 The arithmetic is exact and small

Ladder: `EDHA_SOV_LADDER = [4, 6, 8, 10, 12]`. Averages 2.5 / 3.5 / 4.5 / 5.5 / 6.5. **One step = exactly +1.0 average per die, at every rung.** No scaling, no curve.

### 2.2 The variable that matters is the *number of dice*, not the step

`edhaSovStepFormula` bakes the formula against the roller and then rewrites **every** ladder die it finds:

```js
const out = baked.replace(/(^|[^A-Za-z_.])d\s*(?:\(([^()]+)\)|(\d+))/gi, ...)
```

So the value of one step is `+1 × N`, where `N` is the die count in whatever the ally rolls. From the 43 authored damage formulas in the atlas, `N` in practice:

| Ally's payload | Formula | N | One step is worth |
|---|---|---|---|
| Any `[Tier][Die]` talent, Tier 1 (L1–5) | `(@tier)d(...)` | 1 | **+1** |
| Any `[Tier][Die]` talent, Tier 2 (L6–10) | `(@tier)d(...)` | 2 | **+2** |
| Warrior, Devastating Blow | `(2 + max(@tier-2,0))d8` | 2 | **+2** |
| Hunter, Deadly Trap | `2d4` | 2 | **+2** (and it sits at the d4 floor, so 4 steps of headroom) |
| Black, Withering Ray, Tier 2 | `(2 * @tier)d(...)` | 4 | **+4** |
| Hunter, Fatal Thrust | `4d4` | 4 | **+4** |
| Warrior, Wit's End, Tier 1 | `4d6` | 4 | **+4** |
| Warrior, Wit's End, Tier 2 | `6d6` | **6** | **+6** |

So the same Exalt is worth **+1** on a Chaos caster at level 2 and **+6** on a Warrior at level 8. The capstone's +2 steps is worth **+2** on the first and **+12** on the second. **No other tree in the 365 has a 12× spread in its own output determined entirely by which ally is standing next to it.** This is not a rounding issue; it is the single largest party-composition dependency in the game, and neither intent source mentions it.

The corollary is the anti-synergy: **flat damage never steps.** `@attr` adders don't step. `deity/Power` Momentum of Victory (`@tier` impact), `heroic/Agent` Cheap Shot (`@scalar.damage.unarmed`), `deity/Knowledge` Pack Share and `deity/Life` Vital Diagnosis (both "+Tier Vital", no die) all get **zero** from this tree. So Sovereignty is worth most beside a Warrior or a Hunter and least beside the two deity trees whose stated job is also "make the party hit harder."

*(One correction to the existing profile here: it claimed a Knowledge/Death ally "deals bonus Vital damage in flat `[Tier][Die]` chunks, so Exalt does little or nothing for them." That is wrong — `[Tier][Die]` **is** a ladder die and it does step. The genuine dead cases are the flat `@tier` riders above.)*

### 2.3 The d4/d12 clamp is the tree's hard ceiling — and it makes its own talents dead

```js
return EDHA_SOV_LADDER[Math.max(0, Math.min(EDHA_SOV_LADDER.length - 1, i + steps))];
```

Silent clamp, no warning. Entries **stack** (Ben R6), but the ladder only has five rungs. Consequences, arithmetically forced:

- **Elevate side.** Scene-long steps available: Investiture of Authority +1, capstone +2 = **+3**. An ally whose base die is d6 (which is every `[Tier][Die]` payload at rank 2, i.e. every leyline/deity ally through L5) is **at the d12 cap from those two talents alone**. Exalt (+1) and Sovereign's Balance (+1) then do **nothing at all** on that ally for the rest of the scene — the step is discarded silently. An ally already rolling d8 (rank 3, L6+) has 2 steps of headroom and the capstone alone exhausts it.
- **Diminish side.** Scene-long steps available: Decree of Ruin −1, Edict of the Fallen −2, capstone −2 = **−5**, against a maximum of 4 rungs of headroom and realistically 1–2. Against an enemy whose attack rolls **d6**, the entire diminish half of the tree — four talents, six Actions, seven Investiture — can never prevent more than **1 point per damage die per hit**, because d6 → d4 is one step and that is the floor. Edict of the Fallen's second step, Decree of Ruin, Censure and the capstone's diminish half are all wasted on that target.

I cannot verify typical adversary damage dice inside the scope fence. **What would settle it:** a histogram of `damage.formula` die faces across `data/adversaries.json`. If most adversary attacks roll d6, the diminish half of this tree is capped at roughly one point per hit no matter how many talents you buy, and that is the most important number in this whole review.

### 2.4 The heal-stepping discovery — a live ruling, not a nitpick

`03-where-an-effect-lives.js:264` wraps `CosmereItem#rollDamage` and passes `this.system?.damage?.formula` to `edhaSovStepOverride`. Heal formulas live in exactly that field — `deity/Life` Life Surge is `{"formula": "(@tier)d(2 * @skills.green.rank + 2) + @attr.awa", "type": "heal"}`. Nothing in the step path checks `type`.

So, as shipped:
- **Exalt steps an ally's healing.** Life Surge goes 1d6 → 1d8. Surgical Precision (`(2 * @tier)d(...)`, N = 4 at Tier 2) under the capstone's +2 goes **4d8 → 4d12, i.e. +8 healing per cast.** That is the single largest number this tree produces anywhere.
- **Censure shrinks an enemy healer's heal dice.**

Every card says "damage die size". Either the text is wrong or the engine is. I would not guess which — it is a design call, and per §5.3 it is arguably the most interesting thing the tree does.

---

## 3. Expected value per Action, and the comparator

### 3.1 The model

Stated so it can be argued with, not hidden. **Model M:** a 5-round combat; a scene-long effect placed in round 1 is live for 5 rounds, placed later for ~4; the buffed ally lands **1.5** damage rolls per round; the diminished enemy lands **1.0**; `P(Black test succeeds) = 0.55`; the ally has 3 rungs of headroom (base d6) and the enemy 2 (base d8). The hit rates and the enemy's base die are the assumptions I cannot check inside the fence; everything else is from the primer or the talent text.

### 3.2 The table

`N` = the ally's die count. Values are points of damage swing.

| Talent | Actions | Inv | EV (N=1) | EV (N=2) | EV (N=4) | **Per Action (N=2)** |
|---|---|---|---|---|---|---|
| **Censure** | 1 | 1 | **0.55** | 0.55 | 0.55 | **0.55** |
| **Exalt** | 1 | 1 | **1.5** | 3.0 | 6.0 | **3.0** |
| Exalt **+ Sovereign's Favor** | 1 | 1 | 1.5 dmg **+ 3.5 tHP** (T1/W2) | 3.0 **+ 9.0 tHP** (T2/W3) | 6.0 + 9.0 | — |
| **Decree of Ruin** (L6) | 1 | 2 | **2.65** | 2.65 | 2.65 | **2.65** |
| **Investiture of Authority** (L6) | 1 | 2 | **6.0** | **12.0** | 24.0 | **12.0** |
| **Edict of the Fallen** (L3) | 2 | 2 | **4.85** | 4.85 | 4.85 | **2.4** |
| **Sovereign's Balance** (L3) | 1 | 2 | **3.75** | 6.0 | 10.5 | **6.0** |
| **Sovereignty** (capstone, L4) | 3 | 3 | **20** | **32** | 56 | **10.7** |

*(Diminish-side EVs use N_enemy = 1 and are capped by headroom — with a d6 enemy, Censure = 0.55, Decree of Ruin = 2.65, Edict = 2.4, and the capstone's diminish half = 0.)*

### 3.3 What this actually says — and it is not what the profile said

The tree is **not** uniformly weak. It is **catastrophically weak at the front and adequate at the back**, and every existing summary has this backwards:

- The **two entries** are the worst Action-for-effect exchange I can find in the atlas. Censure buys **0.55 points of prevented damage** for a full Action, an Investiture (a quarter of a level-1 pool) and a test that can simply fail. Exalt buys **1.5 points** on someone else's sheet for the same price. You are better off taking the standard Strike every character already has.
- **Investiture of Authority is the tree's best per-Action talent (12.0), not "below the curve."** The profile's claim that it "gets relatively *weaker* at the tier break it is gated behind" is **wrong**: at Tier 2 `[Tier][Die]` becomes 2 dice, so one step is worth +2 instead of +1. The step doubles at L6 for every ally whose damage is `[Tier][Die]`. It only fails to scale for a fixed-die weapon.
- **Sovereign's Balance is not overcosted.** It does what both entries do, in **one Action instead of two**, for the same 2 Investiture, **with no test risk on the diminish half**, plus a conditional extension. It strictly dominates using Censure and Exalt in the same round. It is overcosted only against the scene-long talents beside it.
- **The capstone is arithmetically fine and experientially hollow.** 10.7 points per Action across a scene is competitive. But it is once per scene, it costs your entire Slow turn (a Fast turn's 2 Actions literally cannot pay it), and **nothing visible happens when you press it** — no damage number, no condition, no token on the map. That is why every reader has called it thin.
- **Sovereign's Favor carries Exalt, not the reverse.** At Tier 1 / White 2, Exalt's die step is worth 1.5 and Favor's temp HP is worth 3.5. At Tier 2 / White 3 it is 3.0 versus **9.0**. The tree's largest ally-facing payload is a rider bolted to the tree's weakest talent, and — engine-verified — its watch is `whenSkill: "exalt"`, key `exalt` only, so it **does not fire** off Investiture of Authority (key `investiture`), Sovereign's Balance (`balance`) or the capstone (`sovereign`). Exalt therefore never becomes obsolete; it stays a mandatory tax card whose only job is to trigger the Passive above it.
- **Edict of the Fallen's temp-HP drip is much smaller than it reads.** `edhaGrantTempHpCross` **keeps the higher** — temp HP does not stack anywhere in the system. So "each time it fails an attack test, each ally gains Tier temp HP" is really *"top each ally back up to Tier temp HP whenever the enemy misses."* At Tier 1 that is **1 HP per ally per refresh**, and only when the previous grant has already been eaten. Across a whole scene with three allies this is realistically 6–12 HP total, not the 20–40 a naive count gives.

### 3.4 What one Action buys in the other nine deity trees

Same level, same cost, apples to apples. Every one of these is 1 Action + 1 Investiture at L1 unless noted, and `[Tier][Die]` = 1d6 (avg 3.5) at Tier 1 rank 2.

| Tree | Entry | What 1 Action + 1 Investiture buys |
|---|---|---|
| Chaos | Entropy Strike | 1d6 **spirit** (ignores Deflect) + an Omen marker |
| Death | Withering Touch | a weapon attack **plus** 1d6 + WIL **vital**, and the target cannot regain HP |
| Destruction | Set Charge | 1d6 energy to everyone in 10 ft, **no roll, no save**, + scene-long dangerous terrain, detonated on a **Free Action** |
| Knowledge | Predatory Strike | a weapon attack + 1d6 **vital per Insight** on the target |
| Power | Warlord's Advance | a weapon attack + 1d6 impact + kill riders + a social advantage |
| Order | Edict | a **scene-long** prohibition; on violation 1d6 + INT spirit **and Disoriented**; sustain up to Tier |
| Fate | Snare | 1d6 + AWA keen **and Restrained** on the first enemy in; sustain up to Tier |
| Fate | Ordained Ground | **Free Action** — a scene-long square, allies on it get +1 to **all** defences and 30 ft Aid |
| Civilization | Forge Construct | a persistent autonomous attacker **on its own initiative slot** throwing 1d6 impact every round for the scene |
| Civilization | Lay Foundation | **Free Action** — a 10 ft square, allies +1 all defences, scene |
| Life | Life Surge | heal 1d6 + AWA (~5.5–6.5), overflow to temp HP |
| Life | Vital Diagnosis | a full statblock read **and** party-wide +Tier **Vital** on that creature for the scene |
| Death | Reaper's Harvest | **Passive, free** — Investiture back on every death in range, plus Remains |
| **Sovereignty** | **Exalt** | **one ally's damage dice +1 step for one round (+1.5 points)** |
| **Sovereignty** | **Censure** | **a test; on success one enemy's dice −1 step for one round (+0.55 points)** |

The deity guide's principle 1 is *"Fantasy on the first talent — from both entries."* Thematically Sovereignty complies: Censure and Exalt are exact mirrors and they say what the deity is. **Numerically they are an order of magnitude below every other entry in the atlas**, and that gap is the tree's real problem, because a level 1–5 PC holds one to five talents and at least one of them must be an entry.

---

## 4. The dependency audit — what a solo Sovereignty character does

### 4.1 The count

Of nine talents:

| Requirement | Talents |
|---|---|
| Needs a **willing ally** to target at all | Exalt, Investiture of Authority, Sovereign's Balance, Sovereignty (elevate half) — **4**, plus Sovereign's Favor which rides Exalt = **5 of 9 (56%)** |
| Needs the **ally to then land a damage roll** before it means anything | the same 5 |
| Needs the **enemy to land a damage roll** before it means anything | Censure, Decree of Ruin, Edict of the Fallen, Sovereign's Balance, Sovereignty — **5 of 9** |
| Needs the enemy to **fail a test** | Expose (both clauses), Edict's temp-HP clause |
| Needs the **ally to hit the marked enemy** | Sovereign's Balance's extension, Sovereignty's reaction lock |
| Needs the ally to be **the target of the attack**, to still hold their one Reaction, and to spend 1 focus | Expose's Reactive Strike clause (triple-gated) |

**Every one of the nine is mediated.** There is not a single talent whose value is realised at the moment you spend the Action. This is what makes the tree structurally different from the rest of the atlas, and it is what the designer noticed. Compare: Order's Edict also waits for the enemy to act, but its payoff is `[Tier][Die]` + Intellect spirit damage **and** Disoriented — realised whatever the enemy rolls. Power's Kneel applies Compelled, which **removes an Action** regardless of any subsequent die. Sovereignty's states are *doubly* contingent: the roll has to happen **and** it has to hit, and then the payoff is one point per die.

### 4.2 Solo

Fully dead with no allies: **Exalt, Investiture of Authority, Sovereign's Favor** (3 talents, 33% of the tree, and 3 of the 4 talents on the elevate branch).
Half dead: **Sovereign's Balance** (loses the ally half and can never trigger its extension), **Sovereignty** (loses the ally half **and** the reaction lock, which requires "the ally"), **Edict of the Fallen** (loses the temp-HP clause — `edhaAlliesInAttune` excludes you), **Expose** (loses the Reactive Strike clause).
Intact: **Censure**, **Decree of Ruin**, **Edict's** −2 clause, **Expose's** Investiture refund.

**A solo Sovereignty character's entire contribution to a fight is: one enemy's damage dice are 1–2 rungs smaller.** They cannot deal damage, heal, shield, move, control, detect, or escape. They cannot help *themselves* with any of it. Against a d6-damage enemy that contribution is capped at ~1 point per hit. Their offensive option every round is the Strike every character has for free, and their defensive option is nothing.

---

## 5. Sovereignty vs. Blue — the direct comparison

The designer suspects Sovereignty is worse than leyline/Blue. **It is, clearly, on all three named axes.** Here is the case.

### 5.1 Total effect per Action

Blue's levers are **binary state changes on the d20**, not increments on a damage die. Imposing disadvantage moves the expected d20 from 10.5 to **7.175** — and more usefully, it roughly squares the hit probability: an enemy hitting 60% of the time hits **36%** with disadvantage. Against an attack dealing ~6.5, that is **~1.56 damage prevented per attack**. Censure's −1 step on the same attack prevents **1 × 0.6 = 0.6**. **One Blue disadvantage is worth about 2.6 Censures** — and Blue delivers it more cheaply.

| | leyline/Blue | deity/Sovereignty |
|---|---|---|
| Talents costing a full Action or more | **5 of 25 (20%)** — 3 × 1 Action, 2 × 2 Actions | **7 of 9 (78%)** |
| Passive / Special / Free / Reaction | 9 / 5 / 1 / 5 = **20 of 25 (80%)** | 2 / 0 / 0 / 0 = **2 of 9 (22%)** |
| Zero-scoring capability axes (of 15) | **3** (damage_direct, damage_scaling, healing) | **9** (damage, scaling, healing, mobility, terrain, information, social, exploration, summons) |
| Peak axis | 4 on **two** axes (debuff, information), 3s on control / action economy / exploration | 4 on **one** (debuff), then 3 (buff) |

Blue's individual top-end effects are categorically larger than anything Sovereignty owns:
- **Counterspell** (Reaction, 2 focus + 1 Inv, L6) — on a success, **an enemy's talent activation simply fails**. That deletes an entire enemy Action *and* the Investiture they paid. Nothing in Sovereignty comes within an order of magnitude.
- **Ghostly Walls + Absolute Stillness** (L6) — movement rate **0**, plus disadvantage on all Physical tests, plus **cannot take Reactions**. That is three effects at once, one of which Sovereignty's *capstone* delivers as its headline rider.
- **Phantom Barricade** (1 Action, 1 Inv, **L2**) — a scene-long wall with `2[Die]` health that blocks movement and grants cover. Sovereignty scores 0 on terrain_zone; Blue gets a wall at level 2.
- **Probability Cascade** (**Special** — no Action — + Opportunity + 1 Inv): disadvantage on the target's next **two** tests.
- **Forewarned** (depth 0, L1, no cost, no action): **an extra Reaction** when your prediction lands.

### 5.2 Rounds with something to do

**Blue: essentially every round, including on other people's turns.** Five Reactions, five Specials, nine Passives and Forewarned's bonus Reaction mean Blue acts out of turn constantly and its Specials ride free on Actions it was taking anyway. Its Investiture drain (16 of 25 costers, mostly 1 each) against a ~4 pool at 50% Draw Mana uptime is real, but the free half of the tree keeps working when the pool is empty.

**Sovereignty: two to three rounds, then nothing.** Seven of nine spend Investiture (1/1/2/2/2/2/3 = 13 to fire the tree once) against a pool of 2 + max(AWA, PRE) ≈ 4 at L1. Draw Mana returns Tier per Action, so at Tier 1 a 2-Investiture talent costs **two Actions of drawing per one Action of talent — 33% uptime, the worst Action-heavy kit in the system.** Zero Reactions and zero Specials mean it never does anything on anyone else's turn. After the scene-long effects are placed, the character's remaining menu is: Censure for a step that is probably already at the d4 floor, Exalt for a step the ally is probably already capped out of, Draw Mana, or Strike. Expose is the only thing keeping it afloat and it is uncapped (`recoverInv: 1`, no per-round limit, Ben R4) — genuinely the best talent in the tree by structural importance.

### 5.3 Dependence on other characters

**Blue: ~3–4 of 25 talents (12–16%)** need an ally — Phantom Step, Anticipate, and partly Telepathic Network and Phantom Double. Everything else points at an enemy or at the world.
**Sovereignty: 5 of 9 (56%)** need a willing ally, and **9 of 9** need somebody else to roll before anything happens.

### 5.4 Verdict

**Yes — Sovereignty is worse than Blue, and by a wide margin.** Not because Blue is strong (Blue is back-loaded, needs L6 to assemble, and the brief is right that it deals nothing), but because the two trees fail in different registers. **Blue's problem is a missing damage column on an otherwise wide sheet. Sovereignty's problem is that nine of fifteen capability columns are empty and the one it owns is the smallest unit of effect in the system.** Blue has a defining thing at every point in a fight — a Reaction to spend, an enemy to de-rail, a wall to put up, a prediction to cash. Sovereignty has one verb, delivered at full Action cost, whose payoff is one point per die, on somebody else's turn, if they hit.

The one honest counterweight: **per talent slot, Sovereignty's back half is not bad.** Investiture of Authority at 12 points per Action and the capstone at 10.7 beat anything Blue does with an Action. Blue spends whole L6 talent slots on **Composed** (+tier maximum focus) and **Collected** (+2 to two defences). If you own the whole tree at L8 next to a Warrior, Sovereignty is fine. The tree fails specifically at **levels 1–5, at its entries, and in every round after round three** — which is precisely the window this campaign is in.

---

## 6. The White investment — what it costs and what it actually buys

### 6.1 The cost

- **Both entries** require White 2+ (and Black 2+). You cannot own a single talent in this tree without two ranks of White.
- **Investiture of Authority** requires **White 3+**, which is unreachable before **level 6** (rank cap is 2 through L5).
- Full ownership needs Black 3 + White 3 = **6 skill ranks**. At 2 skill ranks per level, that is **three levels' worth of the entire skill budget**, and it buys you the *right to buy talents*, not any talent's effect.

### 6.2 What it returns — and the brief needs one correction

The brief says White "buys nothing but the gate." That is **nearly** right, and the exception is worth recording because it appears on no card:

1. **White sizes exactly one die.** `Sovereign's Favor`'s authored rule is `{"type": "edha-temp-hp", "formula": "(@tier)d(2 * @skills.white.rank + 2)"}` — the temp HP is `[Tier][Die on **White**]`. White 2 → `[Tier]d6`; White 3 → `[Tier]d8`. At Tier 2 that is **2d6 (avg 7.0) vs 2d8 (avg 9.0)**. The third White rank is worth **+2.0 average temp HP per Exalt.**
2. **White sets the ally-side Attunement Range.** The engine header records the ruling explicitly: *"Attunement Range: BLACK rank debuff side, WHITE rank buff/ally side (Ben R2)."* It is implemented in two places — Expose's rule carries `"allyRange": "white"`, and Edict of the Fallen's entry carries `"failThpRange": "white"`. White 2 → 30 ft, White 3 → **60 ft**. That governs who can take Expose's Reactive Strike and who collects Edict's temp HP.
3. **Nothing else.** White is never tested — all three tests in the tree roll **Black** (`Censure` and `Decree of Ruin` vs. Cognitive, `Edict of the Fallen` vs. Spiritual; `activationType: skill_test, skill: black` on those three and only those three; the four elevate talents are `activationType: utility` and roll **nothing at all**). And I confirmed across all 365 that **no deity talent's damage formula reads `@skills.white.rank`** — the only two talents in the atlas that do are leyline/White's own.

**So the third White rank costs one skill rank, is impossible before level 6, and returns +2 average temp HP and 30 extra feet of ally reach.** I could not find a worse rank-for-effect exchange anywhere in the atlas. And a player reading the nine cards has **no way to discover any of it** — every card says "Attunement Range" and "[Tier][Die]" without naming a colour.

### 6.3 The design guide's claim is half false

> *"Black tests for diminish; White tests for elevate. This is the cleanest example of the color-thematic test rule."*

**Falsified.** Three tests exist; all three are Black. The elevate half — Exalt, Investiture of Authority, Sovereign's Balance, Sovereignty — contains **zero tests of any colour**. A character can take every talent in this tree, reach the capstone, and never roll White once. The guide is describing a tree that was designed and not built. It is not a small drift: the guide holds this tree up as the *exemplar* of the rule it most clearly breaks.

---

## 7. Decree — what the tree would be if it existed

### 7.1 The size of the hole

Both intent sources promise the same thing, in the same words:

- Path description: *"drawing both into Decrees — declared laws that hold sway within his reach"*; signature resource *"a declared law projected within a radius: allies inside are elevated, enemies inside are diminished."*
- Deity guide Part 4: *"Homebrew resource: Decree zones (declared laws within a radius)"*, loop *"Diminish target → elevate ally → **bring them into Decree**."*

**It exists in no talent.** All nine effects name one willing ally and/or one creature in Attunement Range — a targeting envelope, not a projected zone; nobody is elevated or diminished by *standing* anywhere. The word survives in one title (`Decree of Ruin`, a single-target Black vs. Cognitive test) and one flavour line. The tags across the tree are `censure, exalt, die_size, scene, temp_hp, buff, debuff, capstone, investiture_recovery, reactive_strike` — **`decree` is not a tag on any talent.**

This breaks deity guide principle 5 (*"homebrew resources should be the spine of the tree... generated by an entry and spent by most of the rest"*) in the strongest possible way: Sovereignty's stated resource is generated by nothing and spent by nothing. It is **the only one of the ten promised signature resources that is name-only** — Omen, Insight, Mutation, Harvested Remain, Charge, Edict, Foundation and Ordained Ground all ship; Power's Bounty is absent but has an unnamed equivalent implemented in Warlord's Fury. Sovereignty's has neither name nor equivalent.

And the aggravation is that **the atlas already knows how to build it, three times over**: Fate's `Ordained Ground` *is* a declared square where allies inside are elevated; Order's `Final Decree` *is* a declared law projected across a radius; Civilization's `Foundation` *is* a persistent zone with ally riders. There is even a naming collision to resolve: Order runs a live **Edict** token economy (3 producers, 1 consumer) and owns a talent called **Final Decree**, while Sovereignty's `Edict of the Fallen` applies no Edict and its Decree does not exist.

### 7.2 What a real Decree would fix

The tree's measured defects and whether a zone answers them:

| Defect | Fixed by Decree? |
|---|---|
| Per-Action rate ~0.55–3.0 points at the entries | **Yes, structurally.** A radius divides the Action cost across every body inside it. One Action affecting three allies and two enemies is a 5× multiplier on the same payload. This is the single biggest available lever. |
| `terrain_zone = 0` | **Yes** — a whole capability axis, going to 4. |
| Useless against multiple enemies (every debuff names one creature) | **Yes.** |
| Nothing to do after round 3 | **Yes** — a zone is a persistent object you reposition, expand and defend; that is a repeatable Action that isn't "spend Investiture to move a die one rung." |
| Missing signature resource, guide principle 5 | **Yes**, by construction. |
| White is a toll booth; the guide's test-split claim is false | **Yes, cleanly.** Decree is the coordination/elevation half — exactly the "lighter colour" the guide's rule of thumb assigns to White. Making White the tested colour for placing and expanding a Decree delivers the guide's own sentence. |
| The "same gesture" promise (currently only at depth 2–3) | **Yes** — the zone *is* the single gesture that raises and lowers simultaneously. |
| **Zero damage, zero healing, zero mobility, zero information, zero out-of-combat** | **No.** A zone does not add any of these. |
| **The payload is still ±1 average damage per die, clamped at d4/d12** | **No** — and this is the one that matters. |

### 7.3 So: is building Decree the fix?

**It is necessary and not sufficient.** A Decree zone whose only payload is the die step is a much bigger delivery system for the smallest payload in the game — and worse, the **clamp gets tighter, not looser**, because a zone that steps everyone inside it will hit the d12 ceiling and d4 floor faster than single-target talents do. To be worth building, the zone needs a payload that is not a die step: the precedents are already there and both are one line — Fate's Ordained Ground gives **+1 to all defences**, Civilization's Foundation gives **+1 to all defences**, Fate's Bulwark Ground adds **temp HP per round and blanks advantage against the ally inside**. A Decree that elevates dice *and* carries a second rider (defences, temp HP, or a movement/reaction tax on enemies inside) is a tree. A Decree that only moves dice is a bigger version of the current problem.

---

## 8. Widening — is any other deity tree the same shape?

The census flags Fate (1 source, 3 amplifiers) and Life (0 sources, 3 source+amp) as the next-lowest. **Neither is the same shape, and in both cases the census reading is misleading.** Read the talent text.

### 8.1 Fate — not an outlier; the census undercounts it

Fate's "3 amplifiers" all amplify **Fate's own Snare**, so the classifier splits one damage engine into a source plus three riders and then reports the source count as 1. What Fate actually holds across nine talents:

- **Real damage with authored formulas — three of them**: `Snare` (`(@tier)d(2*@skills.green.rank+2) + @attr.awa` keen), `Inevitable Snare` (+`[Tier][Die]` keen), `Foreknown Strike` (+`[Tier][Die]` keen). A triggered Snare with Inevitable Snare attached is `2[Tier][Die] + AWA` — at Tier 1 that is 2d6 + AWA, better than most deity entries.
- **Real control**: Restrained on Snare — and it is **untested**, the only unconditional Restrain in all 365. Restrained is movement 0 *plus* disadvantage on everything but escape. Plus Disoriented on Inevitable Snare.
- **Real terrain**: two distinct persistent zone types, `Ordained Ground` (a **Free Action**, ally +1 all defences, 30 ft Aid) and `Snare`, sustained up to Tier each, plus `Bulwark Ground` (temp HP per round **and** attacks against that ally cannot benefit from advantage).
- **Real information**: `Read the Threads` reads the target's declared next action *and* lets you reposition a zone into its path as a Free Action.
- **Real action economy**: `Weave the Thread` gives an ally **Aid as a Free Action once per round** and a **free Reactive Strike** on any Snare trigger; `Foreknown Strike` hands an ally a Free Action to spring your trap; `Thread of Inevitability` gives every ally on Ordained Ground a free Strike or Aid.

Fate scores 3/3/3/5 on damage/control/action-economy/terrain. It has a two-token economy that is the spine of the tree exactly as guide principle 5 asks. **Fate is not built around one narrow rider.** Its real problems (per its profile) are different ones — no self-trigger until depth 2, no healing, no mobility, and a heavy reliance on allies volunteering to stand on squares.

### 8.2 Life — zero damage sources, but it has an independent pillar

Life's `0 SOURCE / 3 SRC+AMP` is technically right and misses the point:

- **The largest healing in the game.** Five heal formulas including `Surgical Precision` at `(2 * @tier)d(2*@skills.green.rank+2)` = **4d8 (avg 18) at Tier 2**, plus a condition removal, for **1 Action and 1 Investiture**. That is an independent effect: it happens when you press it, regardless of what anyone else rolls.
- **A genuine party damage rider**: `Vital Diagnosis` — you *and every ally* deal +Tier **Vital** (Deflect-ignoring) to the Diagnosed creature, for the scene, from a 1-Action / 1-Investiture entry that also reads the target's exact HP, max HP, conditions and both defences.
- **An ongoing damage condition it grants to someone else**: `Adaptive Mutation`'s Venom Glands — melee hits inflict `Afflicted [half [Tier][Die] Vital]`.
- **Protection**: `Overgrowth`'s +1 Deflect stacking to 3, `Apex Form`'s +2 Deflect, `Lifeline`'s damage redirection.
- **Resource generation**: `Prognosis`.

Life has healing at 5 — a defining pillar, and the reference implementation of it. **Life is a full support tree with an independent best-in-class effect.** It is not the same shape.

### 8.3 The count that settles it

Zero-scoring capability axes, out of 15, per the verified profiles:

| Tree | Zeros | Peak axis |
|---|---|---|
| **deity/Sovereignty** | **9** | 4 (debuff) |
| deity/Chaos | 8 | 4 (damage_direct) |
| deity/Destruction | 7 | 5 (damage, terrain) |
| deity/Knowledge, Order, Power | 6 | 5 / 3 / 3 |
| deity/Fate, Civilization | 5 | 5 (terrain) / 5 (summons) |
| deity/Life, Death | 3 | 5 (healing) / 4 |
| leyline/Blue *(for reference)* | **3** | 4 (debuff, information) |
| heroic/Scholar *(for reference)* | 5 | 5 (exploration) |

Chaos is the nearest neighbour on emptiness (8 zeros) but it holds `damage_direct = 4` — an independent pillar; press Entropy Strike and something takes spirit damage. **Sovereignty is the only tree in the atlas with nine empty axes and no independent effect on any of the six it scores.** The designer's read is right, and it is not shared by any other tree.

---

## 9. Recommendations

No talent text, as instructed — mechanics and their consequences only.

### 9.1 The smallest change that gives Sovereignty an independent reason to exist

Two candidates. I would do **A**, and **B** regardless of anything else because it is free.

**A. Give both entries an on-resolution payload, and free Sovereign's Favor's slot.**
Move Sovereign's Favor's temp HP **onto Exalt itself** (it is already `edha-temp-hp` on this tree's own rules — no engine work, one data edit), and give Censure the mirror on a successful test (a small Deflect-ignoring hit sized on Tier, or a condition). Consequences, all computable from §3:
- Exalt goes from **1.5 points** to **1.5 + 3.5 = 5.0** at Tier 1 / White 2, and **3.0 + 9.0 = 12.0** at Tier 2 / White 3 — which puts it inside the band of every other deity entry in §3.4 instead of an order of magnitude below it.
- Censure stops being a null Action: the die step becomes the *rider* and the immediate effect becomes the reason to press it. That satisfies guide principle 1 ("fantasy on the first talent, from both entries") **numerically**, which is currently the only place it fails.
- The tree stops being purely mediated — there is now at least one moment where the Action you spent did something on its own resolution.
- **Sovereign's Favor's slot is freed**, which is where the Decree entry goes in §9.2. Note also that Favor's `whenSkill: "exalt"` binding is what currently forces Exalt to stay a live prerequisite tax forever; folding it removes that too.

**B. Re-type Exalt and Censure from 1 Action to Special.**
Zero new mechanics, zero engine work, one field each. It fixes the tree's worst *measured* defect — 78% Action-costed against a guide target of 25–35%, with Special/Free/Reaction all at 0% against targets of 15–20%/10–15%/10%. The primer is explicit that "a Special is worth materially more than an Action of the same effect size," and it is exactly why Exalt at 1.5 points is a bad trade and Exalt at 1.5 points *for free, riding an Action you were taking anyway* is a good one. This does **not** create an independent effect — it removes the reason the entries are never worth taking. Do it either way.

### 9.2 The strongest change: build Decree as the spine, with White as its colour

Replace the freed slot (and, if you are willing, one of the two entries) with a **Decree zone**, and rebuild the tree around it:

1. **Decree is a declared, persistent, sustained zone** (a radius or square, scene duration, sustain up to Tier — the Ordained Ground / Foundation / Charge pattern the atlas already uses four times), placed **by an entry** and read by most of the rest, per guide principle 5.
2. **The zone is the delivery mechanism for the verb**: allies inside are Exalted, enemies inside are Censured. That makes the path description's "same gesture" the tree's *operating mode* rather than a depth-2 reward, and it divides the tree's Action cost across every body in the radius — the only lever that fixes the per-Action rate without inflating the payload.
3. **The zone tests White.** This is the one place the guide's own claim can be made true. Black stays the diminish colour (three tests, already correct); White becomes the elevate/zone colour. It also converts the White 3+ requirement from a toll booth into a real investment.
4. **The zone carries a second, non-die-step rider** — this is the part I would insist on. Precedent: Ordained Ground's +1 to all defences, Foundation's +1 to all defences, Bulwark Ground's temp HP plus advantage-denial. Without it, Decree is a bigger delivery system for the smallest payload in the game and the d4/d12 clamp bites *harder* in a zone than it does single-target.
5. **The deep nodes become zone upgrades** (move it, expand it, deny reactions inside it, punish leaving it — the "bring them into Decree" loop is a *positional incentive*, which is control the tree currently scores 1 on), and **the capstone projects the Decree to Attunement Range** — the Final Decree shape, but on the die ladder.
6. **Keep Decree of Ruin and Edict of the Fallen as the precision half.** Edict is the best talent in the tree and Decree of Ruin's Black 3+ / L6 gate should probably move; both are fine as the single-target branch opposite the zone branch.

What this fixes, from §7.2: the per-Action rate, terrain_zone 0 → 4, the multi-enemy gap, the "nothing to do after round 3" problem, the only unimplemented signature resource in the atlas, the White toll booth, and the guide's false test-split claim. What it does not fix: zero damage, zero healing, zero mobility, zero information, zero out-of-combat. **If the designer's bar is "every tree is good at something," Decree gets Sovereignty to *good at zones and at arbitrating one fight's damage economy*, which is a real answer. If the bar is "this character has something to do in a round where they are alone," Decree does not reach it and nothing short of giving the tree an independent effect will.**

### 9.3 Three rulings that are free and should happen either way

1. **Does the die step apply to healing?** As shipped it does (§2.4), because the wrapper reads `system.damage.formula` and heals live there. Exalt turns Life Surge from 1d6 into 1d8; the capstone turns Surgical Precision from 4d8 into 4d12, **+8 healing per cast**. That is the largest number the tree produces. Either it is the tree's best-kept secret and should be printed on the cards, or it is a bug and the step path needs a `type !== "heal"` guard. It cannot stay undecided.
2. **Print the colour dependencies on the cards.** Sovereign's Favor's temp HP is `[Tier][Die on **White**]` and the ally-side range is White-sized (Ben R2), and *no card says so*. A player choosing between a third rank of Black and a third rank of White has no information to choose with.
3. **Rule on the Censure marker.** Expose reads `whenKeys: "censure,decree"`, so it fires off Censure and Decree of Ruin but **not** off Edict of the Fallen (key `edict`), Sovereign's Balance (`balance`) or the capstone (`sovereign`) — even though all four carry the `censure` tag and all four apply the same reduction. The card text ("a creature affected by your Censure") does not say which. Every other named marker in the atlas is placed by an explicit clause (Order: "place an Edict"; Fate: "place a Snare"; Knowledge: "place 2 Insight"; Death: "mark the corpse"). This one is implicit, and the implicit reading and the shipped reading disagree.

---

## 10. What I could not settle inside the scope fence

Three numbers are load-bearing and unobtainable from the 365 talents:

1. **The die faces adversaries actually roll.** The entire diminish half's ceiling is `min(steps bought, rungs of headroom)`. If most adversary attacks roll d6, four talents and six Actions of the tree can never prevent more than 1 point per damage die per hit. **What would settle it:** a histogram of die faces in `data/adversaries.json` damage formulas.
2. **Weapon die counts.** For a weapon-striker ally, `N` is the weapon's die count, and the whole §3.2 table doubles or halves on it. `[Tier][Die]` payloads I could compute exactly (`N = Tier`); weapons I could not. **What would settle it:** the system's weapon table in `systems/cosmere-rpg`.
3. **Hit rates.** `P(Black test succeeds) = 0.55` and the landed-roll rates in Model M are assumptions. They shift the absolute numbers but not the comparisons, because every talent in §3.2 and every comparator in §3.4 is exposed to the same rates. **What would settle it:** adversary Cognitive/Spiritual defences and PC attack bonuses at each tier.

None of the three changes the verdict. The gap between Exalt at 1.5 points and Forge Construct at *a persistent autonomous attacker on its own initiative slot*, for the same Action and the same Investiture at the same level, is not a rounding error.

## Adversarial verification

**21 load-bearing claims checked: 7 confirmed, 10 corrected, 4 refuted.**

The analysis is unusually well-sourced and most of its arithmetic survives, but its three headline numbers do not. (1) The "12× party-composition spread" rests on a misread formula: Wit's End is `(4 + max((@tier - 2) * 2, 0))d6` = 4d6 at Tier 1 AND Tier 2, not 6d6 — the max die count anywhere in the L1-10 window is 4, so one step is worth at most +4 and the capstone at most +8, a 4× spread. (2) "Sovereignty does nothing for its owner" and "every one of the nine talents is mediated" are both refuted by the tree's own text: five talents shrink an enemy's damage dice for ALL its damage (including attacks on the owner), and Sovereign's Favor grants [Tier][Die] temp HP (3.5 at Tier 1, 9.0 at Tier 2) on use, with no subsequent roll and no exposure to the d4/d12 clamp — the analysis's own §3.3 and §4.2 say both of these and its §1/§4.1 contradict them. (3) "Worse than Blue by a wide margin, failing specifically at L1-5" inverts the level window: the profiles it cites score power-by-depth Blue 2/3/4 and Sovereignty 2/3/3, Blue's own profile says its kit "does not assemble until level 6", and every Blue effect the analysis holds up (Counterspell, Ghostly Walls, Absolute Stillness, Anticipate, Composed, Collected) is L6-gated. Confirmed and strengthened: the die-size monopoly, the Decree absence, the White-rank dependencies hidden from every card, the comparator table, and the Sovereign's Favor / Expose key-binding bugs. Missed: Investiture of Authority and the capstone compete for the same 2 rungs of headroom on a rank-3 ally, so the analysis's two best EV figures cannot both be collected; and the zero-axis count that carries §5.1 and §8.3 is a 9-talent-vs-25-talent artifact.

### Claims

1. **CORRECTED** — A die step is +1 average damage per die, and the tree's power varies by a factor of 12 depending on the ally — one step is worth +1 on a Tier-1 [Tier][Die] caster and +6 on a Warrior at level 8; the capstone's +2 is worth +2 to +12.
   - Evidence: The ladder arithmetic is exact (EDHA_SOV_LADDER = [4,6,8,10,12], means 2.5/3.5/4.5/5.5/6.5, so one step = +1.0 per die), and the engine's regex does rewrite every ladder die. But the 12× rests on 'Wit's End, Tier 2 = 6d6'. all-talents.json gives Wit's End `(4 + max((@tier - 2) * 2, 0))d6`: at Tier 2, (@tier-2)*2 = 0, so 4d6 — 6d6 arrives only at Tier 3 (level 11+), outside the whole review window. The dossier prose agrees: 'deals an extra 4d6 damage'. Highest N anywhere in the 43 authored formulas within L1-10: Withering Ray at Tier 2 `(2 * @tier)d(...)` = 4, Fatal Thrust 4d4 = 4, Wit's End 4d6 = 4.
   - Corrected: One step = +1.0 average per die. Within levels 1-10 the die count N runs 0 (flat riders: Momentum of Victory `@tier`, Cheap Shot `@scalar.damage.unarmed`, Pack Share and Vital Diagnosis '+Tier') to 4 (Withering Ray at Tier 2, Fatal Thrust, Wit's End). So one step is worth +1 to +4 and the capstone's two steps +2 to +8 — a 4× spread among die-rolling allies and a hard zero against flat-damage allies. Weapon dice may raise N further but the weapon table is out of scope and unknown.
2. **CONFIRMED** — White is not a pure toll booth: it sizes Sovereign's Favor's temp HP ([Tier][Die on White]) and sets the ally-side Attunement Range, and none of it appears on any card.
   - Evidence: data/authored/deity-sovereignty.json, verbatim: Sovereign's Favor carries `{"type": "edha-temp-hp", "formula": "(@tier)d(2 * @skills.white.rank + 2)", "target": "victim"}`; Expose carries `"allyRange": "white"`; Edict of the Fallen carries `"failThpRange": "white"`. The Censure/Decree/Edict test rules all carry `"rangeColor": "black"`. The nine card texts say only '[Tier][Die]' and 'Attunement Range' and name no colour. The +2.0 average temp HP for the third White rank at Tier 2 (2d6 avg 7.0 vs 2d8 avg 9.0) is right.
3. **CORRECTED** — The die step applies to healing rolls as shipped, so Exalt steps an ally's heal dice and the capstone turns Surgical Precision from 4d8 into 4d12 (+8 healing).
   - Evidence: The wrapper text is quoted accurately — 03-where-an-effect-lives.js:264 reads `edhaSovStepOverride(this, options.overrideFormula ?? this.system?.damage?.formula)` with no type check, and heal formulas do live in that field (Life Surge `(@tier)d(2 * @skills.green.rank + 2) + @attr.awa`, type heal). The +8 arithmetic is right (Surgical Precision `(2 * @tier)d(...)` = 4d8 at Tier 2 rank 3; 4 dice × 2 steps). But whether a heal is rolled through `CosmereItem#rollDamage` at all is a fact about the cosmere-rpg system, which the scope fence excludes and which nothing in the 365 settles.
   - Corrected: The Edha step path contains no `type !== "heal"` guard, so IF the system routes heal rolls through CosmereItem#rollDamage the step applies to healing (+8 on Surgical Precision under the capstone). That is a plausible, unverified engine finding, not a demonstrated one; it needs a bench check, not a design ruling first.
4. **CORRECTED** — Action-type census: 5 × 1 Action, 1 × 2 Actions, 1 × 3 Actions, 2 Passive; 78% costs a full Action or more, against a deity guide target of 25-35% Action, with Special / Free / Reaction all at 0% against targets of 15-20% / 10-15% / ~10%.
   - Evidence: The counts are exact against the dossier (Censure, Exalt, Decree of Ruin, Investiture of Authority, Sovereign's Balance = 1 Action; Edict of the Fallen = 2 Actions; Sovereignty = 3 Actions; Expose, Sovereign's Favor = Passive). 7/9 = 77.8%. Zero Specials/Free/Reactions is right and is the sharper finding. But the guide's 25-35% is the ONE-Action bucket alone; its Action + 2-Action + 3-Action buckets sum to ~40-60%.
   - Corrected: Sovereignty is 56% 1-Action, 11% 2-Action, 11% 3-Action, 22% Passive. Against the deity targets that is Action 56% vs 25-35%, action-costed total 78% vs ~40-60%, and Special 0% vs 15-20%, Free 0% vs 10-15%, Reaction 0% vs ~10%. The zero rows are the real finding; the 78%-vs-25-35% framing compares a sum to a single bucket.
5. **REFUTED** — Sovereignty is the only tree in the atlas that does nothing for its owner — of nine talents, exactly one clause (Expose's Investiture refund) benefits the character who paid nine talent slots.
   - Evidence: Censure: 'that creature's damage die size decreases by one step' — all damage, not attacks on allies only (the authored rule confirms `"scope": "all"`). Same for Decree of Ruin, Sovereign's Balance and the capstone; Edict of the Fallen is `"scope": "attack"` but still covers attacks on the owner. So five of nine talents directly reduce damage the owner takes whenever the diminished enemy attacks them, and the capstone's reaction-lock ('the enemy cannot take reactions') helps everyone including the owner. The analysis's own §4.2 lists Censure, Decree of Ruin and Edict's −2 clause as 'Intact' when solo — which is only coherent if they do something for the person casting them.
   - Corrected: Five of the nine talents are self-serving in the ordinary defensive sense: the diminish half is the owner's own damage mitigation. What is true, and is the real finding, is narrower — no Sovereignty talent grants the owner damage, healing, temp HP, movement, an action or a condition; every elevate talent requires a willing ally other than the owner (`t.actor !== owner` in edhaSovTargets), where every other deity tree has at least one self-targeting talent.
6. **REFUTED** — Every one of the nine is mediated; there is not a single talent whose value is realised at the moment you spend the Action.
   - Evidence: Sovereign's Favor: 'When you use Exalt on an ally, they also gain temporary HP equal to [Tier][Die].' That is 1d6 (avg 3.5) at Tier 1 / White 2 and 2d8 (avg 9.0) at Tier 2 / White 3, granted on resolution with no test, no ally roll and no enemy roll. It is also the one payload the d4/d12 clamp cannot touch — the rule is a separate `edha-temp-hp` handler watching the die-step event, so it fires even when the step itself is clamped away. The analysis says as much in §3.3 ('Sovereign's Favor carries Exalt, not the reverse', 9.0 at Tier 2) and then contradicts it in §4.1 and again in §5.2 ('after round three… Exalt for a step the ally is probably already capped out of').
   - Corrected: Eight of nine are mediated. Sovereign's Favor is not: from L2 the tree has a repeatable 1-Action / 1-Investiture grant of [Tier][Die] temp HP that resolves immediately and is immune to the ladder clamp. That is the tree's only unmediated effect and its largest per-Action number at Tier 2.
7. **REFUTED** — Sovereign's Balance strictly dominates using Censure and Exalt in the same round.
   - Evidence: Balance's rule key is `balance`; Sovereign's Favor watches `"whenSkill": "exalt"` and Expose watches `"whenKeys": "censure,decree"` — both verified verbatim in data/authored/deity-sovereignty.json, and both facts are stated elsewhere in the same analysis. So Balance forgoes [Tier][Die] temp HP (3.5-9.0) and Expose's Investiture refund plus its ally Reactive Strike. It is one Action cheaper and test-free; it is not dominant.
   - Corrected: Sovereign's Balance saves an Action and removes the test risk, but it triggers neither Sovereign's Favor nor Expose. For a character holding both Passives, Censure + Exalt is the higher-value pair of Actions; Balance wins only on tempo or when the Passives are not owned.
8. **CORRECTED** — Investiture of Authority is the tree's best per-Action talent (12.0), and the profile's claim that it gets weaker at the tier break is wrong because [Tier][Die] becomes 2 dice at Tier 2.
   - Evidence: The correction to the profile is right: at Tier 2 a [Tier][Die] ally rolls 2 dice, so one step = +2. But at Tier 2 that ally is rank 3 at best, i.e. base d8, and the ladder tops out at d12 — exactly 2 rungs of headroom, which the capstone alone consumes. Investiture of Authority (+1, key `investiture`) and Sovereignty (+2, key `sovereign`) stack as separate entries but their combined +3 is clamped to +2 on the tree's most likely target.
   - Corrected: Investiture of Authority scores 12.0/Action in isolation and the capstone 10.7/Action, but on the same rank-3 [Tier][Die] ally at L6-10 they compete for two rungs and cannot both pay out — the analysis's §3.2 table double-counts the tree's back half. Realising both requires an ally whose base die is d4 or d6 at Tier 2 (a rank-1/rank-2 damage colour), i.e. deliberately buffing the party's worst die.
9. **CORRECTED** — The clamp makes Exalt and Sovereign's Balance dead: an ally whose base die is d6 — every [Tier][Die] payload at rank 2, i.e. every leyline/deity ally through L5 — is at the d12 cap from Investiture of Authority plus the capstone alone.
   - Evidence: Investiture of Authority requires White 3+, which the primer's rank-cap table puts at level 6 — the dossier's own 'earliest L6'. So the scenario cannot exist 'through L5'. In L1-5 the only elevate talents available are Exalt (+1) and Sovereign's Balance (+1) against a d6 ally with three rungs of headroom, so the elevate clamp never binds in the window the analysis identifies as the tree's failure window.
   - Corrected: The elevate clamp bites only at L6+, and then on a d8 (rank-3) ally with exactly two rungs. At L1-5 — the window this campaign is in — elevation is never wasted; the clamp problem is a level-6 problem, and the diminish-side floor (d4) is the one that could bite early, which cannot be settled without adversary dice.
10. **CORRECTED** — One Blue disadvantage is worth about 2.6 Censures, and Blue delivers it more cheaply.
   - Evidence: The arithmetic checks: E[min of 2d20] = 2870/400 = 7.175; 0.6² = 0.36; 0.24 × 6.5 = 1.56; 1.56 / 0.6 = 2.6. 'More cheaply' does not. Blue's five disadvantage talents are all conditional: Pattern Recognition needs you to have already succeeded on a Cognitive test against that character; Intercept needs a Forewarned declaration to land; False Premise needs the enemy to succeed on a Cognitive test AND your Blue test to succeed; Probability Cascade costs an Opportunity Blue generates none of; Absolute Stillness needs Ghostly Walls first and both are L6. Censure is at-will for 1 Action + 1 Investiture + one Black test. Also, one disadvantage taxes one test; Censure taxes every damage die the enemy rolls until your next turn, including area attacks on several allies.
   - Corrected: Per landed instance a Blue disadvantage on an attack prevents roughly 2.6× what a single-die Censure prevents, on the assumed 6.5-damage attack. It is not cheaper — every Blue disadvantage source is trigger-gated or L6 — and it is narrower in coverage. Note the 6.5-damage-per-attack figure is an adversary assumption the scope fence excludes, and the whole comparison inverts if the enemy rolls 2-4 damage dice or attacks more than once a round.
11. **CORRECTED** — Sovereignty is worse than leyline/Blue, clearly and by a wide margin, and it fails specifically at levels 1-5, at its entries, and in every round after round three — precisely the window this campaign is in.
   - Evidence: Breadth is right: Blue scores 4 on two axes and 3 on three more, Sovereignty 4 on one and 3 on one. 'Wide margin' and the level window are not. The verified profiles' own power-by-depth scores are Blue 2 / 3 / 4 and Sovereignty 2 / 3 / 3. Blue's profile states the tree is 'BACK-LOADED… its real kit does not assemble until level 6' with 8 rank-gated talents; every Blue effect the analysis holds up as categorically larger — Counterspell, Ghostly Walls, Absolute Stillness, Anticipate, Composed, Collected — is earliest L6, and Counterspell additionally costs 2 focus in a tree with zero focus regeneration and fires only when a character 'spends Investiture to activate a talent'. Sovereignty at L4-L5 can hold both entries, both Passives, Edict of the Fallen, Sovereign's Balance and the capstone (depth 3, earliest L4). From L2 it also has an uncapped free Investiture regen (Expose) where Blue has none against 16 costers.
   - Corrected: Sovereignty is narrower than Blue and clearly worse at depth 3+ (one axis at 4 versus Blue's two, and nothing comparable to Counterspell or the Ghostly Walls / Absolute Stillness lock). At levels 1-5 the two are close and Blue is the more back-loaded of the two: Blue's teeth are all L6, Sovereignty's capstone is L4, and Sovereignty's Exalt + Sovereign's Favor package at L2 is a repeatable per-Action effect Blue has no equivalent of. The tree's real failure is the single entry Censure in isolation (0.55 points for an Action, an Investiture and a test), not the L1-5 band as a whole.
12. **CONFIRMED** — Blue has 5 of 25 talents costing a full Action or more (20%) and 20 of 25 Passive/Special/Free/Reaction (80%).
   - Evidence: Dossier count: 1 Action = Phantom Barricade, Read Intent, Ghostly Walls; 2 Actions = Phantom Double, Telepathic Network. Passive/∞ = 9 (Calculated Patience, Forewarned, Blue Leyline Attunement, Composed, Collected, Probable Outcome, Baleful, Absolute Stillness, Phantom Step); Special 5, Free 1, Reaction 5. Matches the deterministic census row exactly.
13. **CORRECTED** — Zero-scoring capability axes: Sovereignty 9, Chaos 8, Destruction 7, Knowledge/Order/Power 6, Fate/Civilization 5, Life/Death 3, Blue 3, Scholar 5.
   - Evidence: Every count re-derived from the profile digest and every one is right. But it is used as the headline evidence that Sovereignty is uniquely empty against Blue, and it is not size-normalised: all ten 9-talent deity trees score 3-9 zeros (mean 5.8) while all five 25-talent leyline trees score 2-3 (Black 3, Blue 3, Red 3, White 3, Green 2). A 9-talent tree scoring more zeros than a 25-talent tree is the expected result, not a finding.
   - Corrected: Sovereignty has 9 empty axes, the most in the atlas, but the comparison that carries weight is against the other nine-talent deity trees (3-9, mean 5.8), not against Blue's 25 talents. Against its own weight class Sovereignty is one empty axis worse than Chaos and two worse than Destruction — a real gap, not a categorical one.
14. **CONFIRMED** — Decree exists in no talent: no Sovereignty talent creates a zone or radius, `decree` is not a tag on any talent, and it is the only one of the ten promised signature resources that is name-only.
   - Evidence: Grep of all 365 descriptions plus authored text for 'decree' returns exactly two talents, both by name only: deity/Order's Final Decree and deity/Sovereignty's Decree of Ruin (a single-target Black vs. Cognitive test). Sovereignty's full tag set across nine talents is censure, exalt, die_size, debuff, buff, scene, temp_hp, capstone, investiture_recovery, reactive_strike — no `decree`. Every one of the nine texts names 'a creature in Attunement Range' or 'a willing ally', never a square, radius or aura. Both intent sources promise a projected radius ('allies inside are elevated, enemies inside are diminished'; 'Decree zones (declared laws within a radius)').
15. **CONFIRMED** — Sovereignty is the only tree in the atlas that manipulates damage die size in either direction.
   - Evidence: Grep of all 365 for 'die size' / 'damage die' returns 7 hits and all 7 are Sovereignty (Censure, Exalt, Decree of Ruin, Investiture of Authority, Sovereign's Balance, Edict of the Fallen, Sovereignty). The other two talents in the tree, Expose and Sovereign's Favor, are the riders.
16. **CONFIRMED** — Every other named marker in the atlas is placed by an explicit clause, so Expose's implicit 'affected by your Censure' reading and its shipped `whenKeys: censure,decree` binding disagree.
   - Evidence: Verbatim from all-talents.json: Order's Edict 'place an Edict on a character in Attunement Range'; Fate's Snare 'place a Snare on a 5 ft square'; Fate's Ordained Ground 'designate a 5 ft square … as Ordained Ground'; Knowledge's Studied Mark 'Place 2 Insight on it'; Death's Reaper's Harvest 'mark the corpse as a Harvested Remain'; Destruction's Set Charge 'place a Charge'; Civilization's Lay Foundation 'designate a 10 ft square … as a Foundation'. Sovereignty's Censure never says 'place a Censure', while four other talents carry the `censure` tag and apply the same reduction — Edict of the Fallen (key `edict`), Sovereign's Balance (`balance`) and the capstone (`sovereign`) — none of which Expose sees.
17. **CONFIRMED** — The §3.4 comparator table — what one Action plus one Investiture buys at L1 in the other nine deity trees.
   - Evidence: Every row verified against all-talents.json for action, cost, depth 0 and earliest L1: Entropy Strike, Withering Touch, Set Charge, Predatory Strike, Warlord's Advance, Edict, Snare, Forge Construct, Life Surge, Vital Diagnosis all 1 Action / 1 Investiture / depth 0 / L1; Ordained Ground and Lay Foundation are Free Action / 1 Investiture; Reaper's Harvest is a free Passive. Predatory Strike's '[Tier][Die] per Insight (minimum 1)' and Forge Construct's own-initiative Construct are quoted correctly. This is the strongest comparative evidence in the analysis and it holds.
18. **CORRECTED** — 33% Draw Mana uptime makes Sovereignty the worst Action-heavy kit in the system; seven of nine spend Investiture, 13 to fire the tree once.
   - Evidence: The 13 total (1/1/2/2/2/2/3) and the Tier-1 Draw Mana maths are right. 'Worst in the system' is not: deity/Power spends 15 Investiture across nine talents with zero regeneration (resource-economy.json: Power 0 regen / 9 costers), and Order, Civilization, Destruction and Fate are all 0 regen. Sovereignty is one of only nine Investiture producers in the whole atlas — Expose, a free Passive at L2, with no per-round cap in its text.
   - Corrected: Sovereignty's Investiture burden (13 across seven talents) is heavy but not the heaviest; deity/Power spends 15 with no regeneration at all. Sovereignty's mitigating fact is that its regen (Expose) is free, early and uncapped, which the analysis correctly calls the tree's structural keystone.
19. **CORRECTED** — Edict of the Fallen's temp-HP drip is much smaller than it reads because temp HP keeps the higher rather than stacking — realistically 6-12 HP across a scene, not 20-40.
   - Evidence: The engine claim is accurate — edhaGrantTempHpCross computes `const wins = inc > (held?.value ?? 0); const final = wins ? inc : (held?.value ?? 0);`, and 33-triggered-effect-resolution.js:211 comments 'Temp HP does not stack, it KEEPS THE HIGHER'. But the talent text points the other way: Sovereign's Favor says 'This talent's temporary HP does not stack', a clause that is meaningless if nothing stacks. So the printed rules and the engine disagree, and the analysis reports only the engine side.
   - Corrected: As implemented, Edict's drip tops each ally back up to Tier temp HP rather than accumulating, so the analysis's 6-12 HP estimate stands for the shipped behaviour. But Sovereign's Favor's explicit non-stacking clause implies the printed intent was that other temp HP DOES stack — a text/engine divergence that belongs in the same ruling batch as the two the analysis already filed.
20. **REFUTED** — No other tree in the 365 has a spread in its own output determined entirely by which ally is standing next to it.
   - Evidence: deity/Knowledge's The Pack: 'allies in Attunement Range deal bonus Vital damage equal to your Insight count on attacks against the creature bearing your Insight' — output = (ally attacks) × (Insight, capped at 5), zero solo. Pack Share is the same shape at +Tier. deity/Life's Vital Diagnosis: 'You and allies dealing damage to the Diagnosed creature deal additional Vital damage equal to your Tier' — output = number of party damage instances. deity/Fate's Hexmark: '+[Tier] keen whenever it takes damage from any source' — same. heroic/Leader's Synchronized Assault: 'allies up to your ranks in Leadership gain an Action for an additional Strike', output entirely the allies' Strike damage.
   - Corrected: Sovereignty is one of at least five trees whose output is set by the party around it — with Knowledge's The Pack / Pack Share, Life's Vital Diagnosis, Fate's Hexmark and Leader's Synchronized Assault. What IS distinctive is the direction of the dependency: those four scale with how MANY damage instances the party generates, while Sovereignty scales with how many DICE are in one ally's single formula — which is invisible to the player and stated on no card.
21. **CONFIRMED** — Fate is not the same shape as Sovereignty (the census undercounts it), and Life has an independent best-in-class pillar.
   - Evidence: Fate carries three real damage formulas — Snare `(@tier)d(2 * @skills.green.rank + 2) + @attr.awa` keen, Inevitable Snare and Foreknown Strike both `(@tier)d(...)` keen — plus an untested Restrain, two persistent zone types and a Free-Action zone placement, exactly as claimed. Life carries five heal formulas, the largest being Surgical Precision `(2 * @tier)d(2 * @skills.green.rank + 2)` = 4d8 at Tier 2. One nit: Surgical Precision is earliest L6 and tests Blue vs. Physical, healing '[Tier][Die] only' on a failure, so 'it happens when you press it, regardless of what anyone else rolls' overstates it slightly — the magnitude claim is unaffected.

### What the analysis missed

- Investiture of Authority and the capstone are mutually redundant on a rank-3 [Tier][Die] ally (d8, two rungs to the cap), so the analysis's §3.2 table adds two EVs that cannot both be collected — the sharpest available version of its own clamp finding, and it stops one step short.
- The zero-axis count that carries §5.1 and §8.3 is not normalised for tree size: deity trees are 9 talents and score 3-9 zeros (mean 5.8), leyline trees are 25 and score 2-3. Comparing Sovereignty's 9 to Blue's 3 measures tree size, not emptiness.
- §1's 'does nothing for its owner' and §4.1's 'every one of the nine is mediated' both contradict the analysis's own §3.3 and §4.2. Five talents shrink the dice of any enemy attacking the owner, and Sovereign's Favor's temp HP lands on use.
- Wit's End's formula `(4 + max((@tier - 2) * 2, 0))d6` is flat at 4d6 across Tiers 1 and 2 — exactly the flat-heroic-scaling fact the brief supplied and the analysis applied correctly to Devastating Blow two rows earlier in the same table.
- Blue's disadvantage sources are all trigger-gated (Pattern Recognition needs a prior Cognitive success, Intercept needs Forewarned to land, False Premise needs the enemy to succeed first plus your test, Probability Cascade needs an Opportunity Blue cannot make, Absolute Stillness needs Ghostly Walls and both are L6). The analysis prices them as if at-will and cheaper than Censure.
- Counterspell, the flagship of the Blue-is-better case, costs 2 focus in a tree with zero focus regeneration (Blue's only focus costers are Counterspell, Composed and Baleful) and fires only when a character 'spends Investiture to activate a talent' — inert against any non-Invested adversary.
- Sovereign's Favor's clause 'This talent's temporary HP does not stack' implies that other temp HP does, which contradicts the engine's global keep-the-higher rule. That is a third text/engine divergence and belongs in the §9.3 ruling batch with the other two.
- Censure's reduction is `scope: all` and applies to every damage die the enemy rolls in the window, including area attacks against several allies at once; Model M's N_enemy = 1 and 1.0 damage rolls per round is the most pessimistic possible reading of the tree, and the analysis never runs the multi-instance case it runs for the ally side.
- Deity/Power spends more Investiture with less regeneration (15 across 9 talents, 0 regen) than Sovereignty (13 across 7, with Expose), so 'the worst Action-heavy kit in the system' is unearned.
- The exclusivity claim about party-composition spread was not searched: Knowledge's The Pack and Pack Share, Life's Vital Diagnosis, Fate's Hexmark and Leader's Synchronized Assault all have output set entirely by the allies around them.

### Surviving findings, in priority order

1. Decree is the atlas's only promised signature resource with neither an implementation nor an unnamed equivalent. Grep of all 365 returns 'decree' in exactly two talent names (Order's Final Decree, Sovereignty's Decree of Ruin) and in no zone, radius or aura clause; `decree` is not a tag on any talent; all nine Sovereignty talents target 'a creature in Attunement Range' or 'a willing ally'. Both intent sources promise a projected radius. This breaks deity-guide principle 5 outright and is the single most actionable finding.
2. Sovereignty is the atlas's only die-size tree (7 of 7 'damage die size' hits across 365), and the payload is the smallest unit of effect in the game: +1.0 average per die, N running 0-4 within levels 1-10, clamped to d4-d12. Corrected ceiling: one step is worth +1 to +4, the capstone +2 to +8 — a 4× spread, not 12×, and exactly zero against the four flat-damage riders (Momentum of Victory, Cheap Shot, Pack Share, Vital Diagnosis).
3. Censure alone is the worst Action-for-effect exchange found: 1 Action + 1 Investiture + a Black test, buying ~0.55 points of prevented damage against a single-die enemy, at the same price and level where every other deity entry buys a damage die, a persistent zone, an autonomous attacker, a scene-long prohibition or a full statblock read. The §3.4 comparator table is verified verbatim and is the strongest evidence in the analysis.
4. Investiture of Authority (+1) and the capstone (+2) compete for the same two rungs on the tree's most likely target and cannot both pay out. At L6-10 a [Tier][Die] ally is rank 3 = d8, two steps from the d12 cap; the analysis's two best per-Action figures (12.0 and 10.7) are therefore not additive. NEW — the analysis's own §3.2 table double-counts them.
5. White is charged for and almost never rewarded, but not quite a pure toll booth: `(@tier)d(2 * @skills.white.rank + 2)` sizes Sovereign's Favor's temp HP and `allyRange`/`failThpRange` = white sets the ally-side range. Neither fact appears on any card — every card says '[Tier][Die]' and 'Attunement Range' with no colour — so a player choosing a third rank of Black over White is choosing blind. Print it.
6. Two live marker-binding bugs, both verified verbatim in data/authored/deity-sovereignty.json: Sovereign's Favor watches `"whenSkill": "exalt"` so it does not fire off Investiture of Authority, Sovereign's Balance or the capstone; Expose watches `"whenKeys": "censure,decree"` so it does not fire off Edict of the Fallen, Sovereign's Balance or the capstone, though all three carry the `censure` tag and apply the same reduction. The card texts imply the wider reading in both cases.
7. The tree's one unmediated effect is Sovereign's Favor's [Tier][Die] temp HP — 3.5 at Tier 1 / White 2, 9.0 at Tier 2 / White 3 — granted on use, immune to the ladder clamp, repeatable every round for 1 Action + 1 Investiture from level 2. This REVERSES the analysis's §4.1 and §5.2: the L2+ Exalt package is a real per-Action contribution and the correct target for any buff, which is also why the analysis's own recommendation A (fold Favor's temp HP onto Exalt) is the right smallest change.
8. The elevate clamp is a level-6 problem, not an L1-5 one: Investiture of Authority is White 3+, so through L5 the maximum available elevation is +2 against three rungs of headroom. The clamp that could bite early is the d4 FLOOR on the diminish side, and that cannot be settled inside the fence — a histogram of die faces in data/adversaries.json is the one measurement that would decide whether four talents and six Actions of the diminish half are capped at ~1 point per hit.
9. Sovereignty is narrower than leyline/Blue and worse at depth, but the 'wide margin at L1-5' verdict is inverted. Profile power-by-depth is Blue 2/3/4 vs Sovereignty 2/3/3; Blue's own profile says its kit 'does not assemble until level 6'; every Blue effect cited as categorically larger (Counterspell, Ghostly Walls, Absolute Stillness, Anticipate, Composed, Collected) is L6, while Sovereignty's capstone is L4. The zero-axis headline (9 vs 3) is a 9-talent-vs-25-talent artifact — all ten deity trees score 3-9 zeros, all five leyline trees 2-3.
10. The heal-stepping question is worth a bench check but is not yet a finding: the wrapper at 03-where-an-effect-lives.js:264 reads `system.damage.formula` with no type guard, and heals live in that field — but whether the system rolls heals through CosmereItem#rollDamage is a system fact the scope fence excludes. Verify before ruling.
11. Scope excursions to flag for the designer: the 'cannot target its own owner' finding, the uncapped-Expose finding, the temp-HP-keeps-the-higher finding and the heal-stepping finding all rest on engine source rather than the 365; and §5.1's headline '2.6 Censures' number rests on an assumed 6.5-damage adversary attack, which §10 flags as unobtainable and then uses anyway.
