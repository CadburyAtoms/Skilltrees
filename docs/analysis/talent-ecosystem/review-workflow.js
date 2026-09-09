export const meta = {
  name: 'edha-talent-ecosystem-review',
  description: 'Profile all 21 EDHA talent trees, verify each, then cross-cut damage/power/overlap/synergy and recommend',
  phases: [
    { title: 'Profile', detail: 'one agent per tree: capability vector, power curve, intent drift' },
    { title: 'Challenge', detail: 'adversarial re-read of each profile against the raw talent text' },
    { title: 'Cross-cut', detail: 'nine ecosystem-wide analyses over the verified profiles' },
    { title: 'Verify', detail: 'adversarial re-derivation of each cross-cut analysis from raw data' },
    { title: 'Critic', detail: 'completeness critic + ranked problem ledger' },
    { title: 'Options', detail: 'four differently-framed remediation option sets' },
  ],
}

const S = '/tmp/claude-0/-home-user-Skilltrees/e1450cf0-f72c-52b1-810a-47e29acbeb6b/scratchpad/eco'
const DOS = S + '/dossier'
const PROF = S + '/profiles'

const AXES = [
  'damage_direct', 'damage_scaling', 'control', 'debuff', 'protection', 'healing',
  'buff', 'action_economy', 'mobility', 'terrain_zone', 'information',
  'social_influence', 'exploration_utility', 'summons', 'resource_economy',
]

const RUBRIC = `
CAPABILITY AXES — score each 0-5. Use exactly these 15 axis ids, all 15, every time:
  damage_direct       dealing damage to a target (HP or otherwise). 0 = none at all.
  damage_scaling      does its damage/threat keep pace as tier rises and is it repeatable every round?
                      Score 0 if damage_direct is 0.
  control             conditions, action/reaction denial, restrain, stun, immobilise, forced target choice
  debuff              numeric penalties, defence reduction, vulnerability, disadvantage-likes
  protection          damage reduction, shields, temp HP, interception, resistance, damage redirection
  healing             restoring Health, Focus, or Investiture to self or others
  buff                allied bonuses, rerolls, advantage-likes, granting bonuses to rolls
  action_economy      extra/free/granted actions, extra reactions, acting out of turn, Opportunity use
  mobility            movement, teleport, repositioning self or others (yours, not enemy forced movement)
  terrain_zone        areas, hazards, difficult ground, walls, persistent battlefield features
  information         detection, scouting, foreknowledge, prediction, reading intent, knowing a hidden fact
  social_influence    persuasion, command, deception, reputation, out-of-combat leverage over people
  exploration_utility travel, crafting, survival, downtime, non-combat problem solving
  summons             companions, constructs, minions, animated allies
  resource_economy    GENERATING Investiture / Focus / Opportunity for self or party (not spending it)

SCORING RUBRIC (be strict; the point is to discriminate between trees, not to be kind):
  0 = the tree does not do this at all
  1 = one incidental talent, or a rider on something else
  2 = present but minor; you would not pick this tree for it
  3 = a real, usable competency; several talents, at least one good one
  4 = a strength; the tree is one of the better options in the game for this
  5 = a defining pillar; this tree is the reference implementation of this axis

Calibration anchors so 21 agents agree on the scale:
  - A tree with one Reaction that reduces damage once per round scores protection 2, not 4.
  - A tree with a damage rider that only fires on an already-successful attack scores damage_direct 1-2.
  - Reserve 5 for at most two or three axes per tree. Most axes on most trees should be 0-2.
`

const DEPTH_MODEL = `
DEPTH MODEL (already computed for you, in each dossier line):
  depth = how many talents IN THIS TREE you must own before this one is legal. depth 0 = an entry
          you can take with no prior talent in the tree.
  earliest L = earliest character level a PC could hold it. Derived from: 1 talent per level from
          level 1, plus the rank gate (a "Colour 3+" prerequisite is unreachable before level 6,
          because the skill rank cap is 2 up to level 5 and 3 from level 6).
  connections = MANAGED PREREQUISITES, not decoration. Owning any ONE member of a connections
          group satisfies it; separate prose prerequisite groups are ANDed on top.
Structural fact you must account for, not rediscover: heroic paths carry NO leyline-colour rank
gate, so their whole tree is reachable by ~L4-L5. Leyline trees gate their deepest talents behind
rank 3+, i.e. level 6+. Deity trees are 9 talents and require TWO colours at rank 2+.
`

function profilePrompt(t) {
  return `You are profiling ONE talent tree from the EDHA homebrew (a Cosmere RPG talent system) so that
21 such profiles can be compared against each other. Rigour and comparability matter more than prose.

READ THESE TWO FILES FIRST, IN FULL:
  ${DOS}/${t.file}          <- every talent in the tree, with full rules text
  ${DOS}/INTENT-${t.atlas}-${t.tree}.md   <- what the designer SAYS this path is

You may also read ${DOS}/all-talents.json if you need to check how another tree words a comparable
effect — but do NOT profile other trees, and do not let another tree's wording change your scores.

${DEPTH_MODEL}
${RUBRIC}

WHAT TO PRODUCE (all fields required):

1. axes — all 15, each with score 0-5 and EVIDENCE: name the specific talents that earn the score.
   An axis scored 3+ with no named talents is a failed profile. An axis scored 0 needs one line
   saying you looked and found nothing.

2. damageAccounting — be forensic, this is the crux of the whole review:
   - every talent in the tree that deals damage of any kind, by name, with its dice expression,
     action cost, depth, and earliest level
   - damage that is CONDITIONAL or a RIDER (only on a hit, only vs a marked target, only once per
     rest) must be flagged as such, not counted as if it were reliable
   - damage MITIGATION ("reduce damage taken") is NOT damage dealt. Do not count it. Say explicitly
     how many talents in this tree only appear to be damage because they mention the word.
   - earliest depth and earliest character level at which this tree can deal ANY damage from its
     own talents
   - a single normalised figure: at the deepest reachable point, roughly how much damage per Action
     spent can this tree produce, expressed in [Tier][Die] units, and how often can it repeat it

3. powerByDepth — one entry per band {depth 0 entries}, {depth 1-2}, {depth 3+}: how strong is the
   tree at that band, rated 1-5, with the exemplar talents that set the rating, and a one-line note
   on whether the tree front-loads or back-loads its power.

4. uniqueOwnership — what does this tree do that you believe NO other tree does, or does best?
   Be concrete and mechanical ("the only source of X"), not thematic ("the best at being clever").

5. gaps — what can a character who has ONLY this tree not do at all? Name the situations where a
   player with this tree sits on their hands.

6. weakTalents — talents you judge to be never-picks or clearly below the curve for their depth,
   with the reason. And overCosted: talents whose cost/action price does not match their effect.

7. intentDrift — extract the specific CLAIMS the intent file makes about this path (each specialty
   gets a promise). For each claim: does the talent set deliver it? cite talents. Then an overall
   verdict: DELIVERS / PARTIAL / DRIFTED, and if drifted, say what the tree actually is instead.

8. mechanicalKeywords — every named mechanical noun or resource this tree introduces, consumes, or
   cares about (e.g. Opportunity, Focus, Investiture, Omen, Charge, marks, Draw Mana riders, a
   condition name, a zone type). This feeds a cross-tree synergy map, so be exhaustinve and exact
   with names. For each: does this tree PRODUCE it, CONSUME it, or both?

9. crossTreeHooks — talents whose value depends on something outside this tree (an ally acting, a
   condition someone else applies, a resource another path generates). These are the synergy seams.

10. topThree / bottomThree — the three talents that best and worst represent the tree's power level.

11. oneLineIdentity — in one sentence, what IS this tree, empirically, from its talents alone,
    written WITHOUT reference to the intent file.

Also write your full profile as JSON to ${PROF}/${t.atlas}-${t.tree}.json before returning.
Tree: ${t.atlas} / ${t.tree}.`
}

const PROFILE_SCHEMA = {
  type: 'object',
  properties: {
    atlas: { type: 'string' }, tree: { type: 'string' },
    oneLineIdentity: { type: 'string' },
    axes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          axis: { type: 'string', enum: AXES },
          score: { type: 'number' },
          evidence: { type: 'string' },
        },
        required: ['axis', 'score', 'evidence'],
      },
    },
    damageAccounting: {
      type: 'object',
      properties: {
        damageTalents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }, dice: { type: 'string' }, action: { type: 'string' },
              depth: { type: 'number' }, earliestLevel: { type: 'number' },
              conditional: { type: 'boolean' }, note: { type: 'string' },
            },
            required: ['name', 'dice', 'action', 'depth', 'earliestLevel', 'conditional'],
          },
        },
        countReal: { type: 'number' },
        countFalsePositiveMitigation: { type: 'number' },
        earliestDamageDepth: { type: 'number' },
        earliestDamageLevel: { type: 'number' },
        peakDamagePerAction: { type: 'string' },
        repeatability: { type: 'string' },
        verdict: { type: 'string' },
      },
      required: ['damageTalents', 'countReal', 'countFalsePositiveMitigation', 'peakDamagePerAction', 'verdict'],
    },
    powerByDepth: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          band: { type: 'string' }, rating: { type: 'number' },
          exemplars: { type: 'string' }, note: { type: 'string' },
        },
        required: ['band', 'rating', 'exemplars'],
      },
    },
    frontOrBackLoaded: { type: 'string' },
    uniqueOwnership: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    weakTalents: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, reason: { type: 'string' } },
        required: ['name', 'reason'],
      },
    },
    intentDrift: {
      type: 'object',
      properties: {
        claims: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              claim: { type: 'string' }, delivered: { type: 'string' }, evidence: { type: 'string' },
            },
            required: ['claim', 'delivered', 'evidence'],
          },
        },
        verdict: { type: 'string' },
        actuallyIs: { type: 'string' },
      },
      required: ['claims', 'verdict'],
    },
    mechanicalKeywords: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          keyword: { type: 'string' }, role: { type: 'string' }, talents: { type: 'string' },
        },
        required: ['keyword', 'role'],
      },
    },
    crossTreeHooks: { type: 'array', items: { type: 'string' } },
    topThree: { type: 'array', items: { type: 'string' } },
    bottomThree: { type: 'array', items: { type: 'string' } },
  },
  required: ['atlas', 'tree', 'oneLineIdentity', 'axes', 'damageAccounting', 'powerByDepth',
    'uniqueOwnership', 'gaps', 'intentDrift', 'mechanicalKeywords'],
}

function challengePrompt(p, t) {
  return `You are the adversarial checker for ONE tree profile. Your job is to REFUTE it, not to agree.
A profile that survives you unchanged is rare; assume it contains at least one inflated score, one
miscount, or one claim the text does not support, and go find it.

Read the raw tree yourself, in full, BEFORE reading the profile's claims:
  ${DOS}/${t.file}
  ${DOS}/INTENT-${t.atlas}-${t.tree}.md
Then read the profile under test:
  ${PROF}/${t.atlas}-${t.tree}.json   (also reproduced below)

${DEPTH_MODEL}
${RUBRIC}

ATTACK THESE SPECIFICALLY:
  a) DAMAGE MISCOUNTS in both directions. Did they count damage MITIGATION as damage dealt? Did
     they count a rider on an existing attack as if it were a new damage source? Did they MISS a
     talent that quietly deals damage without using the word "damage" (a condition that ticks, a
     hazard, a summon that attacks, a redirect that sends damage back)? A summon or a hazard that
     deals damage IS this tree dealing damage — check for that.
  b) SCORE INFLATION. Any axis at 4-5 must be defensible against the calibration anchors. Trees
     tend to get scored generously on control and buff. Push back with the actual text.
  c) SCORE DEFLATION. An axis at 0-1 that the tree actually does have — especially resource_economy,
     information, and action_economy, which hide inside riders.
  d) UNIQUE-OWNERSHIP CLAIMS. Check each against ${DOS}/all-talents.json. "The only source of X" is
     usually false. Search the other 20 trees before you let one stand.
  e) INTENT DRIFT. Did they let a thematic word in the intent prose count as delivery? A specialty
     promise is delivered only if talents mechanically do it.
  f) DEPTH/LEVEL ERRORS against the dossier's computed depth and earliest-L values.

Return the CORRECTED profile in full (same shape), plus an explicit list of every correction you
made and why. If you genuinely find nothing wrong with a field, say so — but you must have checked
all 15 axes and every damage claim against the text, and your corrections list must cite text.
Overwrite ${PROF}/${t.atlas}-${t.tree}.json with your corrected version.

PROFILE UNDER TEST:
${JSON.stringify(p)}`
}

const CHALLENGE_SCHEMA = {
  type: 'object',
  properties: {
    corrected: PROFILE_SCHEMA,
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['field', 'from', 'to', 'reason'],
      },
    },
    confidence: { type: 'string' },
  },
  required: ['corrected', 'corrections'],
}

const TREES = [
  { atlas: 'leyline', tree: 'White' }, { atlas: 'leyline', tree: 'Blue' },
  { atlas: 'leyline', tree: 'Black' }, { atlas: 'leyline', tree: 'Red' },
  { atlas: 'leyline', tree: 'Green' },
  { atlas: 'heroic', tree: 'Agent' }, { atlas: 'heroic', tree: 'Envoy' },
  { atlas: 'heroic', tree: 'Hunter' }, { atlas: 'heroic', tree: 'Leader' },
  { atlas: 'heroic', tree: 'Scholar' }, { atlas: 'heroic', tree: 'Warrior' },
  { atlas: 'deity', tree: 'Chaos' }, { atlas: 'deity', tree: 'Order' },
  { atlas: 'deity', tree: 'Civilization' }, { atlas: 'deity', tree: 'Death' },
  { atlas: 'deity', tree: 'Destruction' }, { atlas: 'deity', tree: 'Fate' },
  { atlas: 'deity', tree: 'Power' }, { atlas: 'deity', tree: 'Life' },
  { atlas: 'deity', tree: 'Knowledge' }, { atlas: 'deity', tree: 'Sovereignty' },
].map(t => ({ ...t, file: `${t.atlas}-${t.tree}.md` }))

phase('Profile')
log(`Profiling ${TREES.length} trees, each then adversarially re-checked against its raw text.`)

const profiled = await pipeline(
  TREES,
  t => agent(profilePrompt(t), {
    label: `profile:${t.atlas}/${t.tree}`, phase: 'Profile', schema: PROFILE_SCHEMA, effort: 'high',
  }),
  (p, t) => p ? agent(challengePrompt(p, t), {
    label: `challenge:${t.atlas}/${t.tree}`, phase: 'Challenge', schema: CHALLENGE_SCHEMA, effort: 'high',
  }).then(c => ({ tree: t, profile: (c && c.corrected) || p, corrections: (c && c.corrections) || [] }))
    : null,
)

const PROFILES = profiled.filter(Boolean)
log(`${PROFILES.length}/${TREES.length} profiles survived. ${PROFILES.reduce((n, p) => n + p.corrections.length, 0)} corrections applied by the challenge pass.`)
if (PROFILES.length < TREES.length) {
  log(`DROPPED: ${TREES.filter(t => !PROFILES.some(p => p.tree.tree === t.tree && p.tree.atlas === t.atlas)).map(t => t.atlas + '/' + t.tree).join(', ')}`)
}

// Compact digest so cross-cut agents share one frame without re-reading 21 files.
const digest = PROFILES.map(p => ({
  atlas: p.profile.atlas, tree: p.profile.tree,
  identity: p.profile.oneLineIdentity,
  axes: (p.profile.axes || []).reduce((o, a) => { o[a.axis] = a.score; return o }, {}),
  dmg: {
    n: p.profile.damageAccounting && p.profile.damageAccounting.countReal,
    earliestL: p.profile.damageAccounting && p.profile.damageAccounting.earliestDamageLevel,
    peak: p.profile.damageAccounting && p.profile.damageAccounting.peakDamagePerAction,
    verdict: p.profile.damageAccounting && p.profile.damageAccounting.verdict,
  },
  power: (p.profile.powerByDepth || []).map(b => `${b.band}=${b.rating}`).join(' '),
  loaded: p.profile.frontOrBackLoaded,
  unique: p.profile.uniqueOwnership,
  gaps: p.profile.gaps,
  intent: p.profile.intentDrift && p.profile.intentDrift.verdict,
  actuallyIs: p.profile.intentDrift && p.profile.intentDrift.actuallyIs,
  keywords: (p.profile.mechanicalKeywords || []).map(k => `${k.keyword}(${k.role})`),
  hooks: p.profile.crossTreeHooks,
}))
const DIGEST = JSON.stringify(digest)

const SHARED = `
You are one of nine ecosystem-wide analysts on the EDHA talent system (a Cosmere RPG homebrew).
21 trees, 365 talents: 5 leyline colours (25 each), 6 heroic paths (25 each), 10 deity domains
(9 each). Every tree has already been profiled and adversarially re-checked.

YOUR SOURCES, in order of authority:
  1. RAW TALENT TEXT — ${DOS}/<atlas>-<Tree>.md (21 files) and ${DOS}/all-talents.json.
     This is ground truth. Any claim you make that matters must be checkable here.
  2. VERIFIED PROFILES — ${PROF}/<atlas>-<Tree>.json (full detail), digest inline below.
  3. STATED INTENT — ${DOS}/INTENT-<atlas>-<Tree>.md.
Go back to the raw text whenever a number is load-bearing. Do not build a conclusion out of
profile scores alone; the scores are a map, the talent text is the territory.

${DEPTH_MODEL}
${RUBRIC}

WHY THIS REVIEW IS HAPPENING (the user's actual words): a pre-session-one review of PC capabilities
showed two characters in paths with NO damage talents — White and Blue. That was originally part of
the design, but the intent was that EVERY TREE IS GOOD AT SOMETHING. If it turns out that Scholar
and Blue "do the same thing", the design needs re-evaluating. The user has ruled that adding damage
to Blue and/or White IS on the table as an outcome — do not assume the no-damage identity is fixed.

Scope ruling: the 365 talents ONLY. Adversaries, PC build ladders, and system-native talents are
explicitly OUT of scope for this pass — do not go read them and do not condition findings on them.

Be specific and falsifiable. "Blue feels weak" is worthless; "Blue's only damage-adjacent talent is
X at depth x, which requires an ally to have already done Y" is useful. Name talents. Give numbers.
Where you are uncertain, say so and say what would settle it.

PROFILE DIGEST (21 trees):
${DIGEST}
`

const ANALYSES = [
  {
    key: 'damage-distribution',
    title: 'Damage distribution across all 21 trees',
    prompt: `Build the complete damage picture of the ecosystem.
 - Rank all 21 trees by damage capability, showing for each: count of genuinely damaging talents,
   earliest depth and level at which the tree deals any damage, peak damage per Action at the
   deepest band, and repeatability.
 - Normalise. Compare like with like: a 2-Action nova is not two 1-Action strikes. Express in
   [Tier][Die] per Action where you can, and say where the notation makes that impossible.
 - Identify the tiers of damage-havers: who are the primary damage dealers, who are secondary, who
   is incidental, who is zero. Give the boundaries numerically, not by feel.
 - Deity trees have only 9 talents each — normalise per-talent as well as per-tree so the two are
   not confused.
 - Call out the specific asymmetry the user found: quantify exactly how far Blue and White sit from
   the rest, and whether they are outliers or the low end of a smooth continuum.
 - Check whether the trees with no damage compensate with a measurably larger budget elsewhere, or
   whether they are simply smaller in total effect. This is the key question: is "no damage" PAID
   FOR, or is it a hole?`,
  },
  {
    key: 'leyline-vs-heroic',
    title: 'Leyline vs heroic power parity at comparable points',
    prompt: `Answer: do heroic paths and leyline paths feel similar in power at similar points along the tree?
 - Compare band by band: depth 0 entries, depth 1-2, depth 3+. And by earliest character level,
   which is the comparison a player actually experiences.
 - The structural asymmetry is the crux: heroic paths carry no colour rank gate, so their whole
   25-talent tree is reachable by roughly L4-L5, while leyline trees lock their deepest talents
   behind rank 3+, i.e. L6+. Work out what that does to the felt power curve on both sides.
   Does a heroic character peak earlier and then flatten? Does a leyline character spend levels 1-5
   weaker in exchange for a stronger 6+?
 - Are leyline entry talents (which come with a Draw Mana rider) worth more or less than heroic
   entry talents? Quantify.
 - Rank all 11 of these trees against each other on power-at-L3, power-at-L5, power-at-L8.
 - Say plainly where the mismatch is worst and which specific talents cause it.`,
  },
  {
    key: 'deity-parity',
    title: 'Deity-vs-deity parity',
    prompt: `Answer: do the 10 deity paths feel similar in power to each other?
 - All 10 have exactly 9 talents and a two-colour rank-2+ gate, so they are the cleanest
   apples-to-apples comparison in the system. Exploit that.
 - Rank all 10. For each: total effect budget, damage, the strength of its entry talents, the
   strength of its capstone, and whether its 9 talents form a coherent package or a grab bag.
 - Identify the strongest and weakest by a margin you can defend with talent text.
 - Check the two-colour gate: is the gate priced consistently? Does a deity whose two colours are
   both commonly-taken cost less in practice than one requiring an off-colour investment?
 - Check for a deity whose 9 talents are simply a worse version of a leyline tree's 25.
 - Do the deity trees deliver a distinct fantasy each, or do several converge?`,
  },
  {
    key: 'overlap-matrix',
    title: 'Redundancy and overlap across all 21 trees',
    prompt: `Build the overlap matrix: which trees do the same thing as which other trees?
 - For every pair worth mentioning, score overlap and justify it MECHANICALLY, not thematically.
   Two trees that both "help allies" are not overlapping; two trees that both grant a reroll on a
   failed test with the same trigger are.
 - Rank the worst offenders. The user has specifically flagged Blue vs Scholar — treat that pair
   rigorously but do NOT privilege it; if a worse pair exists, say so and show it.
 - For each high-overlap pair, answer: is this redundancy (both do it, neither better) or is one
   strictly dominated (one does it and more)? Strict domination is the more serious finding.
 - Also find the inverse: trees whose capabilities NOTHING else covers. Which axes are single-
   sourced across the whole system? A single-sourced axis is a fragility if that tree is weak.
 - Report the per-axis census: for each of the 15 axes, which trees score 4-5, which 3, and how
   many trees have any presence at all. An axis with 12 trees at 3+ is a commodity; an axis with
   one is a monopoly.`,
  },
  {
    key: 'blue-vs-scholar',
    title: 'Blue vs Scholar head-to-head (the trigger question)',
    prompt: `This is the specific question that started the review: DO BLUE AND SCHOLAR DO THE SAME THING?
 - Read both trees' 25 talents in full, side by side, from the raw dossiers. Do not answer from
   profiles.
 - Build a talent-by-talent correspondence table: for each Blue talent, the nearest Scholar
   equivalent and how close it is; then the reverse. Quantify what fraction of each tree has a
   near-twin in the other.
 - Separate three different findings that get confused: (a) same fantasy, different mechanics;
   (b) different fantasy, same mechanics; (c) genuinely the same. Only (c) is a design problem,
   and (b) is the one that actually bites players.
 - Then widen by exactly one step: does White have the same problem with Leader (or with anything
   else)? The user asked about Blue/Scholar but the finding was Blue AND White.
 - Deliver a verdict with a confidence level: SAME / OVERLAPPING-BUT-DISTINCT / DISTINCT, and the
   two or three specific talents that most drive your verdict either way.
 - If they overlap, say precisely WHERE the seam should be — what should Blue own that Scholar must
   not, and vice versa — grounded in what each tree already has that the other lacks.`,
  },
  {
    key: 'synergy-map',
    title: 'Cross-path synergy map',
    prompt: `Answer: are there synergies between paths, and if so where?
 - Build the mechanical-keyword graph. Every named resource, condition, marker, or zone
   (Investiture, Focus, Opportunity, Draw Mana riders, Omen, Charge, Harvested Remain, Snare,
   Ordained Ground, marks, conditions by name, hazards) — which trees PRODUCE it, which CONSUME it.
   A producer with no consumer outside its own tree is a closed loop, not a synergy.
 - Identify the genuine cross-path combos: pairs or triples of trees that are meaningfully stronger
   together than apart, with the specific talents that make it work.
 - Deity trees gate on two colours, which is a designed synergy. Check whether the deity trees
   actually reward the two colours they gate on, or merely tax them. A deity tree that requires
   Blue 2+ and Black 2+ but whose talents never interact with anything Blue or Black does is a
   toll booth, not a synergy.
 - Find the DEAD SEAMS: trees that share nothing with anything, and pairs that ought to combine
   by fiction but do not combine mechanically.
 - Check for anti-synergy: talents that actively conflict, or that compete for the same resource
   so hard that taking both is worse than taking either.
 - Rank the synergy seams by how much they'd change a real character.`,
  },
  {
    key: 'intent-drift',
    title: 'Intent vs. reality drift ledger across all 21 trees',
    prompt: `Build the drift ledger: for each of the 21 trees, what it SAYS it is vs. what it IS.
 - Read every INTENT-*.md file and every dossier. The intent files make specialty-by-specialty
   promises; hold each to account against talent text.
 - Classify each tree DELIVERS / PARTIAL / DRIFTED and for the drifted ones state what the tree
   actually is.
 - Distinguish two failure modes that need different fixes: the tree UNDERDELIVERS its stated
   identity (fix the talents), or the tree delivers something COHERENT BUT DIFFERENT from what it
   says (fix the prose, or accept the new identity).
 - Find the promises that appear in more than one tree's intent prose — if two paths promise the
   same fantasy in words, the overlap problem starts in the design docs, not the talents.
 - Specifically test the design principle the user stated: "every tree is good at something."
   Go tree by tree and name the something, with evidence. Flag any tree where you cannot name it,
   or where the something is owned more convincingly by another tree.`,
  },
  {
    key: 'nondamage-viability',
    title: 'Can a no-damage path contribute? White and Blue in combat, tier by tier',
    prompt: `The user's design intent was that damage is optional because every tree is good at SOMETHING.
Test that claim empirically for the two zero-damage trees.
 - For White and for Blue separately: enumerate what a character with only that tree can actually
   DO on their turn in a fight, at level 1-2, at 3-5, and at 6+. Turn by turn. What do they spend
   their Actions on? How many rounds can they sustain it given Investiture and Focus costs?
 - Compare against what a Red or Warrior character does with the same Actions. The comparison that
   matters is not total value, it is: does the no-damage player have something to DO every round,
   and does it visibly change the fight?
 - Resource ceiling check: several White/Blue talents cost Investiture or Focus. Work out how many
   rounds of meaningful contribution the resource pool actually supports at each tier. A tree whose
   good options run dry in round 2 is a different problem from one that has no good options.
 - Reaction dependency: how much of White's and Blue's power requires an enemy to do a specific
   thing first? A tree that only acts in response is hostage to the GM's choices.
 - Then answer the user's live question directly, with a recommendation: should Blue and/or White
   GET damage? Argue both sides. If yes, say what kind (which specialty, what depth, what shape)
   so it does not break the identity. If no, say what must change instead so the no-damage identity
   pays for itself.
 - Note the finding from a crude first pass that White's damage-word hits are mostly damage
   MITIGATION, not damage dealt — verify or refute that.`,
  },
  {
    key: 'good-at-something',
    title: 'The uniqueness ledger — is every tree good at something?',
    prompt: `The design principle under test: EVERY TREE IS GOOD AT SOMETHING.
 - For each of the 21 trees, name the ONE thing it is best in the system at, and prove it by
   showing that the runner-up tree does it worse, with talent text from both.
 - Where a tree's best thing is also another tree's best thing, resolve the tie: who actually wins,
   and by how much? The loser of a tie has no "something" and that is the finding.
 - Produce the failure list: trees where you could NOT establish a defensible "something". For each,
   say whether the problem is (a) too little total power, (b) power spread too thin across axes,
   (c) power concentrated on an axis someone else owns better, or (d) power on an axis that does
   not matter often enough to notice.
 - Then rank all 21 trees by overall power. Be willing to say a tree is simply weaker than another;
   hedged rankings are useless here. Give the ranking a stated basis and show your working for the
   top three and bottom three.
 - Finally: which trees would you warn a player away from at a session-zero table, and why?`,
  },
]

phase('Cross-cut')
log('Nine ecosystem-wide analyses, each then adversarially re-derived from raw talent text.')

function verifyPrompt(a, result) {
  return `You are the adversarial verifier for one ecosystem analysis of the EDHA talent system. Your job is
to REFUTE its load-bearing claims by going back to the raw talent text, not to summarise it.

${SHARED}

THE ANALYSIS UNDER TEST — "${a.title}":
${JSON.stringify(result).slice(0, 60000)}

HOW TO ATTACK IT:
 - Pick every claim that a recommendation would rest on. For each, go to
   ${DOS}/<atlas>-<Tree>.md or ${DOS}/all-talents.json and check it against the actual words.
 - Damage claims: re-derive the counts yourself. Miscounting damage mitigation as damage dealt,
   and missing damage delivered by summons/hazards/conditions, are the two known failure modes.
 - Comparative claims ("X is stronger than Y", "nothing else does Z"): these are where analyses
   are wrong most often. Check the other 20 trees before letting an exclusivity claim stand.
 - Numeric claims: recompute. Depth and earliest-level values are in the dossiers; do not accept
   a stated number without checking it.
 - Look for the OPPOSITE conclusion. If the analysis says two trees overlap, build the strongest
   case that they do not, then say which case is better and why.
 - Default to REFUTED when the evidence is thin. A claim that cannot be checked against talent
   text is not a finding.

Return: a verdict per load-bearing claim (CONFIRMED / CORRECTED / REFUTED) with the text that
settles it, the corrected version of any claim you corrected, anything the analysis MISSED that
its own remit should have caught, and a final list of the claims that survived, in priority order.`
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    analysisKey: { type: 'string' },
    claims: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          verdict: { type: 'string', enum: ['CONFIRMED', 'CORRECTED', 'REFUTED'] },
          evidence: { type: 'string' },
          correctedClaim: { type: 'string' },
        },
        required: ['claim', 'verdict', 'evidence'],
      },
    },
    missed: { type: 'array', items: { type: 'string' } },
    survivingFindings: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['analysisKey', 'claims', 'survivingFindings', 'summary'],
}

const crosscut = await pipeline(
  ANALYSES,
  a => agent(`${SHARED}\n\nYOUR ANALYSIS — ${a.title}:\n${a.prompt}\n\nReturn a thorough written analysis. Structure it however the question demands, but every substantive claim must name talents and give numbers. Length is not a constraint; completeness and checkability are.`,
    { label: `analyse:${a.key}`, phase: 'Cross-cut', effort: 'high' }),
  (r, a) => r ? agent(verifyPrompt(a, r), {
    label: `verify:${a.key}`, phase: 'Verify', schema: VERIFY_SCHEMA, effort: 'high',
  }).then(v => ({ key: a.key, title: a.title, analysis: r, verification: v })) : null,
)

const CROSS = crosscut.filter(Boolean)
log(`${CROSS.length}/${ANALYSES.length} analyses verified.`)

phase('Critic')
const criticInput = CROSS.map(c => ({
  key: c.key, title: c.title,
  surviving: c.verification && c.verification.survivingFindings,
  refuted: c.verification && (c.verification.claims || []).filter(x => x.verdict === 'REFUTED').map(x => x.claim),
  missed: c.verification && c.verification.missed,
  summary: c.verification && c.verification.summary,
}))

const critic = await agent(`${SHARED}

Nine analyses have run and been adversarially verified. You are the COMPLETENESS CRITIC and you
also build the ranked problem ledger that the remediation work will be based on.

VERIFIED OUTPUT SO FAR:
${JSON.stringify(criticInput).slice(0, 90000)}

PART 1 — what is MISSING? Ask:
 - Which of the user's four questions is least well answered by what came back?
   (damage distribution between trees / heroic-vs-leyline parity at similar points / deity-vs-deity
   parity / synergies between paths — plus the live decision on Blue and White damage.)
 - What analysis modality was never run? What talent-level fact was asserted but never checked?
 - Are there findings the nine analyses could not see because each was scoped to one question?
   Cross-analysis contradictions are especially valuable — find every place two analyses disagree
   and say which is right, from the talent text.
 - Is there a structural problem in the system that nobody was asked to look for? Look for it now.

PART 2 — the PROBLEM LEDGER. Rank every real problem, most serious first. For each:
 - a one-line statement of the problem
 - the evidence that establishes it (talents, numbers)
 - severity: does this change play at the table, and at what level range?
 - blast radius: how many trees/characters it touches
 - whether it is a DESIGN problem (the intent is wrong), an IMPLEMENTATION problem (the intent is
   right, the talents don't deliver), or a DOCUMENTATION problem (the talents are right, the prose
   lies)
 - whether fixing it requires a ruling from the designer or has a determinable right answer
Drop anything you cannot support from talent text. A short, true ledger beats a long, padded one.`,
  { label: 'completeness-critic', phase: 'Critic', effort: 'high', schema: {
    type: 'object',
    properties: {
      missing: { type: 'array', items: { type: 'string' } },
      contradictions: {
        type: 'array',
        items: {
          type: 'object',
          properties: { between: { type: 'string' }, disagreement: { type: 'string' }, resolution: { type: 'string' } },
          required: ['between', 'disagreement', 'resolution'],
        },
      },
      newStructuralFinding: { type: 'string' },
      problemLedger: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            rank: { type: 'number' }, problem: { type: 'string' }, evidence: { type: 'string' },
            severity: { type: 'string' }, blastRadius: { type: 'string' },
            kind: { type: 'string', enum: ['DESIGN', 'IMPLEMENTATION', 'DOCUMENTATION'] },
            needsRuling: { type: 'boolean' },
          },
          required: ['rank', 'problem', 'evidence', 'severity', 'kind', 'needsRuling'],
        },
      },
    },
    required: ['missing', 'problemLedger'],
  } })

phase('Options')
const LEDGER = JSON.stringify(critic && critic.problemLedger || [])
const FRAMES = [
  { key: 'minimal', frame: `MINIMAL CHANGE. Assume the designer wants to ship, not to redesign. What is the smallest set of edits — ideally fewer than a dozen talents touched — that resolves the top problems? Prefer retuning an existing talent over writing a new one, and prefer changing one talent that sits at a chokepoint over changing five leaves. Be explicit about what you deliberately leave broken and why it can wait.` },
  { key: 'identity', frame: `IDENTITY FIRST. Start from the question "what should each tree BE?" and let the talent changes follow. If two trees overlap, the fix is to sharpen both identities, not to nerf one. Say what each affected tree should uniquely own, then what has to change for it to own that. Take the intent prose seriously as a design artifact — where it is right and the talents are wrong, fix the talents; where the prose is the problem, rewrite the promise. You may propose moving a talent from one tree to another.` },
  { key: 'systemic', frame: `SYSTEMIC. Assume the individual talents are symptoms. Look for the structural cause: the rank-gate asymmetry between heroic and leyline, the two-colour deity toll, the 25-vs-9 talent budget, the way damage is priced against control, the action-economy currency. Propose changes at the level of the SYSTEM's rules rather than the talent list, and show how each one dissolves several ledger items at once. Name the risks — systemic changes have blast radius.` },
  { key: 'player', frame: `PLAYER EXPERIENCE FIRST. Start from the table. Two real players are sitting in White and Blue with no damage talents at session one. What is their turn-by-turn experience at levels 1-5, and what is the minimum that makes each of them feel powerful and distinct? Judge every proposal by whether it changes what a player DOES on their turn, not by whether it balances a spreadsheet. Explicitly address the felt experience of "I have nothing to do this round" and of "my thing is the same as their thing".` },
]

const options = await parallel(FRAMES.map(f => () => agent(`${SHARED}

The review is complete and verified. Here is the ranked PROBLEM LEDGER:
${LEDGER}

And the critic's completeness findings:
${JSON.stringify({ missing: critic && critic.missing, contradictions: critic && critic.contradictions, structural: critic && critic.newStructuralFinding }).slice(0, 20000)}

YOUR REMIT — produce a remediation option set under ONE framing, and commit to it fully:
${f.frame}

The designer has ruled: adding damage to Blue and/or White is ON THE TABLE. Do not treat the
no-damage identity as fixed, but do not assume damage is the answer either — argue it.

Do NOT write finished talent text; this pass stops at recommendations. For each proposal give:
 - what changes, concretely enough that someone could implement it without asking you a question
 - which ledger items it resolves
 - what it costs (which trees get weaker, what breaks, what has to be retested)
 - a confidence level and what would change your mind
 - whether it needs a designer ruling or is determinable
Rank your proposals. End with the single change you would make first if you could only make one.`,
  { label: `options:${f.key}`, phase: 'Options', effort: 'high', schema: {
    type: 'object',
    properties: {
      frame: { type: 'string' },
      proposals: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            rank: { type: 'number' }, title: { type: 'string' }, change: { type: 'string' },
            resolves: { type: 'string' }, cost: { type: 'string' },
            confidence: { type: 'string' }, needsRuling: { type: 'boolean' },
          },
          required: ['rank', 'title', 'change', 'resolves', 'cost', 'confidence', 'needsRuling'],
        },
      },
      singleFirstChange: { type: 'string' },
      argumentOnBlueWhiteDamage: { type: 'string' },
    },
    required: ['frame', 'proposals', 'singleFirstChange', 'argumentOnBlueWhiteDamage'],
  } })))

log('Review complete.')
return {
  profileCount: PROFILES.length,
  correctionCount: PROFILES.reduce((n, p) => n + p.corrections.length, 0),
  profiles: PROFILES.map(p => ({ tree: p.profile.atlas + '/' + p.profile.tree, profile: p.profile, corrections: p.corrections })),
  analyses: CROSS,
  critic,
  options: options.filter(Boolean),
}
