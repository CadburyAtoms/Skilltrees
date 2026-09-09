// Emit the CROSS-CUT-ONLY workflow, seeded from profiles that already exist on disk.
//
// WHY THIS EXISTS. `review-workflow.js` runs the whole review in one go: 21 tree profiles, two
// adversarial challenge passes each, then thirteen ecosystem analyses and the recommendation
// phases. On 2026-09-09 the first full run completed all 63 profile/challenge agents (780
// corrections applied) and then lost every downstream agent to a session usage limit. Resuming
// the original run would have re-run the 42 challenge agents for nothing, because the CENSUS
// constant they embed had been edited mid-flight to correct the authored-divergence count.
//
// So: this generator reads the 21 finished profiles, inlines a compact digest of them, and emits
// a workflow that starts at the cross-cut phase. It also halves the verification cost — one
// combined adversarial lens per analysis instead of two lenses plus a reconciler — because the
// synthesis is checked against the deterministic censuses by hand anyway.
//
//   node docs/analysis/talent-ecosystem/make-crosscut.js <profilesDir> <dossierDir> <outFile>
//   Workflow({scriptPath: <outFile>})
const fs = require('fs');
const path = require('path');
const PROF = process.argv[2];
const DOS = process.argv[3];
const OUT = process.argv[4];
if (!PROF || !DOS || !OUT) {
  console.error('usage: make-crosscut.js <profilesDir> <dossierDir> <outFile>');
  process.exit(1);
}

const trim = (s, n) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').slice(0, n) : s);
const digest = [];
for (const f of fs.readdirSync(PROF).filter(f => f.endsWith('.json')).sort()) {
  const p = JSON.parse(fs.readFileSync(path.join(PROF, f), 'utf8'));
  const d = p.damageAccounting || {}, s = p.sustainability || {};
  digest.push({
    t: p.atlas + '/' + p.tree,
    id: trim(p.oneLineIdentity, 260),
    ax: (p.axes || []).reduce((o, a) => { o[a.axis] = a.score; return o }, {}),
    dmgN: d.countReal, dmgL: d.earliestDamageLevel, dmgPeak: trim(d.peakDamagePerAction, 130),
    pow: (p.powerByDepth || []).map(b => `${b.band}=${b.rating}`).join(' '),
    load: trim(p.frontOrBackLoaded, 90),
    gated: s.triggerGatedCount, react: s.reactionCount, rounds: trim(s.roundsOfGoodOptions, 150),
    uniq: (p.uniqueOwnership || []).slice(0, 4).map(x => trim(x, 150)),
    gaps: (p.gaps || []).slice(0, 4).map(x => trim(x, 110)),
    weak: (p.weakTalents || []).map(w => w.name).slice(0, 6),
    intent: trim(p.intentDrift && p.intentDrift.verdict, 120),
    isReally: trim(p.intentDrift && p.intentDrift.actuallyIs, 220),
    kw: (p.mechanicalKeywords || []).map(k => `${k.keyword}(${k.role})`),
    hooks: (p.crossTreeHooks || []).slice(0, 5).map(x => trim(x, 130)),
    top: (p.topThree || []).map(x => trim(x, 60)), bot: (p.bottomThree || []).map(x => trim(x, 60)),
  });
}
if (digest.length !== 21) throw new Error(`expected 21 profiles in ${PROF}, found ${digest.length}`);

// The census block is kept in one place — read it out of review-workflow.js so the two scripts
// cannot drift apart.
const src = fs.readFileSync(path.join(__dirname, 'review-workflow.js'), 'utf8');
const grab = (startMarker, endMarker) => {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker, a + startMarker.length);
  if (a < 0 || b < 0) throw new Error(`could not extract ${startMarker} from review-workflow.js`);
  return src.slice(a + startMarker.length, b);
};
const RUBRIC = grab('const RUBRIC = `', '`\n');
const DEPTH_MODEL = grab('const DEPTH_MODEL = `', '`\n');
const CENSUS = grab('const CENSUS = `', '`\n');
const ANALYSES_SRC = grab('const ANALYSES = [', '\n]\n');

const script = `export const meta = {
  name: 'edha-ecosystem-crosscut',
  description: 'Thirteen ecosystem analyses over 21 already-verified EDHA tree profiles, each adversarially checked, then a ranked problem ledger and four framings of the fix',
  phases: [
    { title: 'Cross-cut', detail: 'thirteen ecosystem-wide analyses over the verified profiles' },
    { title: 'Verify', detail: 'adversarial re-derivation of each analysis from raw talent text' },
    { title: 'Critic', detail: 'completeness critic + defence advocate + ranked problem ledger' },
    { title: 'Options', detail: 'four differently-framed remediation option sets' },
  ],
}

const DOS = ${JSON.stringify(DOS)}
const PROF = ${JSON.stringify(PROF)}

const RUBRIC = \`${RUBRIC.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`
const DEPTH_MODEL = \`${DEPTH_MODEL.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`
const CENSUS = \`${CENSUS.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{DOS\}/g, '${DOS}').replace(/\$\{(?!DOS\})/g, '\\${')}\`

// The 21 tree profiles are DONE: each was written by a dedicated agent, then attacked twice —
// once by a forensic recount lens and once by a comparative lens that checked every exclusivity
// claim against the other twenty trees. 780 corrections were applied. This digest is a summary;
// the full profile for any tree is at \${PROF}/<atlas>-<Tree>.json and you should read it whenever
// a tree is load-bearing for your answer.
const DIGEST = ${JSON.stringify(JSON.stringify(digest))}

const SHARED = \`
You are one of thirteen ecosystem-wide analysts on the EDHA talent system (a Cosmere RPG homebrew).
21 trees, 365 talents: 5 leyline colours (25 each), 6 heroic paths (25 each), 10 deity domains
(9 each). Every tree has already been profiled and adversarially re-checked twice.

YOUR SOURCES, in order of authority:
  1. RAW TALENT TEXT — \${DOS}/<atlas>-<Tree>.md (21 files) and \${DOS}/all-talents.json.
     This is ground truth. Any claim you make that matters must be checkable here.
  2. SYSTEM-PRIMER — \${DOS}/SYSTEM-PRIMER.md. READ IT FIRST. It carries the action economy, the
     resource maths, the tier/rank table, and the fact that advantage AND disadvantage are one
     binary scalar in the implementation. A power judgment made without it is guesswork.
  3. THE DETERMINISTIC CENSUS below, plus \${DOS}/advantage-ledger.md and
     \${DOS}/resource-economy.json.
  4. VERIFIED PROFILES — \${PROF}/<atlas>-<Tree>.json (full detail), digest inline below.
  5. STATED INTENT, two sources that do not always agree:
     \${DOS}/INTENT-<atlas>-<Tree>.md      — the in-world path description a player reads
     \${DOS}/DESIGN-GUIDE-CLAIMS.md        — the two design standards, verbatim, with hard
       numeric targets and per-colour/per-deity key mechanics. Where the two intent sources
       disagree, say so: the overlap problem may start in the design docs.
Go back to the raw text whenever a number is load-bearing. Do not build a conclusion out of
profile scores alone; the scores are a map, the talent text is the territory.

\${DEPTH_MODEL}
\${RUBRIC}
\${CENSUS}

WHY THIS REVIEW IS HAPPENING (the designer's actual words): a pre-session-one review of PC
capabilities showed two characters in paths with NO damage talents — White and Blue. That was
originally part of the design, but the intent was that EVERY TREE IS GOOD AT SOMETHING. If it turns
out that Scholar and Blue "do the same thing", the design needs re-evaluating. The designer has
ruled that adding damage to Blue and/or White IS on the table as an outcome — do not assume the
no-damage identity is fixed, and do not assume damage is the answer either.

The designer's four questions, in his words:
  1. What's the damage distribution between trees?
  2. Do heroic paths and leyline paths feel similar in power at similar points along the tree?
  3. Do Deity paths feel similar in power to each other?
  4. Are there synergies between paths? If so, where?

Findings already established deterministically, which you should USE rather than re-derive, and
CHALLENGE if the talent text disagrees:
 - Three trees deal no damage, confirmed by two independent measures (prose classifier AND the
   authored Foundry roll formulas): leyline/Blue, heroic/Scholar, deity/Sovereignty. White has
   exactly one (Retributive Guard). deity/Life has none either but carries the five largest heal
   formulas in the game — an independent effect, which Sovereignty has not.
 - Sovereignty's promised signature resource **Decree** (a radius/zone in BOTH intent sources)
   exists in no talent; all nine are single-target. Power's **Bounty** is named in no talent.
   Chaos's Omen exists but its stated source (forcing Complications) does not. And the leyline
   guide calls plot-die manipulation "Blue's capstone identity" — Blue has zero plot-die talents
   and heroic/Agent has six, including the exact effect the guide reserves for Blue.
 - Advantage and disadvantage are ONE binary scalar (the engine boolean-ORs multiple sources), so
   Blue's five disadvantage talents largely do one talent's work, and the game's 45
   advantage-granting talents are far less additive than their count suggests.
 - Heroic damage formulas are FLAT across tiers 1 and 2 (levels 1-10): Devastating Blow is 2d8 at
   level 2 and still 2d8 at level 10. Leyline/deity [Tier][Die] goes 1d6 -> 2d8 at level 6.
 - Nine of ten deity trees charge for a colour they never test; five get nothing from it at all
   (Order, Civilization, Fate white 2+; Knowledge green 3+; Sovereignty white 3+) and four of
   those five are WHITE.
 - 41 of 365 talent slots (11%) are a talent that also exists in another tree. heroic/Scholar is
   40% downtime — 10 of 25 talents do nothing once initiative is rolled.
 - leyline/Red's Momentum's Edge references \\\`@movement.walk.rate\\\`, a DerivedValueField OBJECT, so
   the rider probably delivers nothing; and if it resolved it would be ~30, against 1-4 for every
   other damage rider in the game.

Scope ruling: the 365 talents ONLY. Adversaries, PC build ladders, and the system's own native
talent compendium are explicitly OUT — do not read them and do not condition findings on them.
Where a question genuinely cannot be settled inside that fence, say so and say what would settle it.

Be specific and falsifiable. "Blue feels weak" is worthless; "Blue's only damage-adjacent talent is
X at depth x, which requires an ally to have already done Y" is useful. Name talents. Give numbers.
Where you are uncertain, say so and say what would settle it.

PROFILE DIGEST (21 trees, verified):
\${DIGEST}
\`

const ANALYSES = [${ANALYSES_SRC}
]

phase('Cross-cut')
log(\`\${ANALYSES.length} ecosystem-wide analyses over 21 verified profiles, each then adversarially re-derived from raw talent text.\`)

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

function verifyPrompt(a, result) {
  return \`You are the adversarial verifier for one ecosystem analysis of the EDHA talent system. Your job is
to REFUTE its load-bearing claims by going back to the raw talent text, not to summarise it.

\${SHARED}

THE ANALYSIS UNDER TEST — "\${a.title}":
\${JSON.stringify(result).slice(0, 90000)}

ATTACK IT ON BOTH AXES — arithmetic and comparison:
 - NUMBERS AND TEXT. Recompute every numeric claim: damage counts, percentages, fractions, depth
   and earliest-level values, dice expressions. Remember [Tier][Die] is 1d6 at Tier 1 rank 2 and
   2d8 at Tier 2 rank 3. Check every quotation is verbatim and says what the analysis says it
   says. The two known damage failure modes are counting MITIGATION as damage dealt and missing
   damage delivered by a summon, hazard, zone or Afflicted tick — check both directions.
 - COMPARISON AND EXCLUSIVITY. "X is stronger than Y", "nothing else does Z", "the only source
   of": these are where analyses are wrong most often. Search the other 20 trees in
   \${DOS}/all-talents.json before letting any exclusivity claim stand; downgrade to "one of N"
   with the names.
 - THE OPPOSITE CASE. For the analysis's single most load-bearing conclusion, build the strongest
   case for the opposite conclusion from talent text, then say which case is better and why. If
   the opposite case is better, say so plainly.
 - SCOPE. Flag any finding that quietly depends on adversaries, PC build ladders or system-native
   talents, all of which are out of scope.
 - Default to REFUTED when the evidence is thin. A claim that cannot be checked against talent
   text is not a finding.

Return a verdict per load-bearing claim (CONFIRMED / CORRECTED / REFUTED) with the text that
settles it, the corrected version of anything you corrected, what the analysis missed that its own
remit should have caught, and the surviving findings in priority order.\`
}

const crosscut = await pipeline(
  ANALYSES,
  a => agent(\`\${SHARED}

YOUR ANALYSIS — \${a.title}:
\${a.prompt}

Return a thorough written analysis. Structure it however the question demands, but every
substantive claim must name talents and give numbers. Length is not a constraint; completeness and
checkability are.\`,
    { label: \`analyse:\${a.key}\`, phase: 'Cross-cut', effort: 'high' }),
  (r, a) => r ? agent(verifyPrompt(a, r), {
    label: \`verify:\${a.key}\`, phase: 'Verify', schema: VERIFY_SCHEMA, effort: 'high',
  }).then(v => ({ key: a.key, title: a.title, analysis: r, verification: v })) : null,
)

const CROSS = crosscut.filter(Boolean)
log(\`\${CROSS.length}/\${ANALYSES.length} analyses verified.\`)
if (CROSS.length < ANALYSES.length) {
  log(\`DROPPED: \${ANALYSES.filter(a => !CROSS.some(c => c.key === a.key)).map(a => a.key).join(', ')}\`)
}

phase('Critic')
const CRITIC_INPUT = JSON.stringify(CROSS.map(c => ({
  key: c.key, title: c.title,
  surviving: c.verification && c.verification.survivingFindings,
  refuted: c.verification && (c.verification.claims || []).filter(x => x.verdict === 'REFUTED').map(x => x.claim),
  missed: c.verification && c.verification.missed,
  summary: c.verification && c.verification.summary,
}))).slice(0, 120000)

const [completeness, defence] = await parallel([
  () => agent(\`\${SHARED}

Thirteen analyses have run and each has been adversarially verified. You are the COMPLETENESS CRITIC.

VERIFIED OUTPUT SO FAR:
\${CRITIC_INPUT}

What is MISSING? Ask:
 - Which of the designer's four questions is least well answered by what came back? (damage
   distribution / heroic-vs-leyline parity at similar points / deity-vs-deity parity / synergies
   between paths — plus the live decision on Blue and White damage, and the position on
   Sovereignty he asked for.)
 - What analysis modality was never run? What talent-level fact was asserted but never checked?
 - Cross-analysis contradictions are especially valuable — find every place two analyses disagree
   and say which is right, from the talent text.
 - Is there a structural problem in the system that nobody was asked to look for? Look for it now.
 - Which surviving findings still rest on the regex census rather than on talent text?\`,
    { label: 'completeness-critic', phase: 'Critic', effort: 'high', schema: {
      type: 'object',
      properties: {
        missing: { type: 'array', items: { type: 'string' } },
        contradictions: { type: 'array', items: { type: 'object', properties: {
          between: { type: 'string' }, disagreement: { type: 'string' }, resolution: { type: 'string' },
        }, required: ['between', 'disagreement', 'resolution'] } },
        newStructuralFinding: { type: 'string' },
        unsupportedFindings: { type: 'array', items: { type: 'string' } },
      },
      required: ['missing'],
    } }),
  () => agent(\`\${SHARED}

Thirteen analyses have run, all of them looking for problems. You are the DEFENCE ADVOCATE, and
your job is the opposite: build the strongest honest case that the design is WORKING AS INTENDED
and that the apparent problems are either intentional, priced, or artefacts of how they were
measured.

VERIFIED OUTPUT SO FAR:
\${CRITIC_INPUT}

Specifically:
 - Which "problems" are the design doing what it says? The designer wrote that leyline mages are
   deliberately human-scale, that colour identities have hard boundaries, and that damage was
   optional by intent. Which findings are just those decisions being observed?
 - Which findings are artefacts of measurement — a regex, a scoring rubric, an axis that does not
   fit an atlas, a comparison between things that are not comparable?
 - Which findings are true but would never be noticed at a table? Rank by whether a player feels it.
 - Where would a proposed fix make things WORSE? Name the specific risk.
 - Is there a reading of Blue, White or Sovereignty under which each is fine as it is? Make that
   case as strongly as the text allows, then say honestly whether you believe it.
Do not be contrarian for its own sake. Where a finding is real and serious, concede it plainly — a
defence that concedes nothing is worthless.\`,
    { label: 'defence-advocate', phase: 'Critic', effort: 'high', schema: {
      type: 'object',
      properties: {
        intentional: { type: 'array', items: { type: 'string' } },
        measurementArtefacts: { type: 'array', items: { type: 'string' } },
        trueButInvisible: { type: 'array', items: { type: 'string' } },
        fixRisks: { type: 'array', items: { type: 'string' } },
        caseForBlueWhiteSovereigntyAsIs: { type: 'string' },
        concessions: { type: 'array', items: { type: 'string' } },
      },
      required: ['intentional', 'measurementArtefacts', 'fixRisks', 'concessions'],
    } }),
])

const critic = await agent(\`\${SHARED}

All analyses are complete and verified, and have been reviewed by both a completeness critic and a
defence advocate. Build the RANKED PROBLEM LEDGER the remediation work will rest on.

VERIFIED ANALYSES:
\${CRITIC_INPUT}

COMPLETENESS CRITIC:
\${JSON.stringify(completeness).slice(0, 40000)}

DEFENCE ADVOCATE:
\${JSON.stringify(defence).slice(0, 40000)}

Rank every real problem, most serious first. For each:
 - a one-line statement of the problem
 - the evidence that establishes it (talents, numbers)
 - severity: does this change play at the table, and at what level range?
 - blast radius: how many trees/characters it touches
 - DESIGN (the intent is wrong) / IMPLEMENTATION (the intent is right, the talents don't deliver)
   / DOCUMENTATION (the talents are right, the prose lies)
 - whether fixing it needs a designer ruling or has a determinable right answer
 - the defence advocate's strongest objection, and whether it survives
Drop anything you cannot support from talent text, and drop anything shown to be a measurement
artefact. A short, true ledger beats a long, padded one.\`,
  { label: 'problem-ledger', phase: 'Critic', effort: 'high', schema: {
    type: 'object',
    properties: {
      problemLedger: { type: 'array', items: { type: 'object', properties: {
        rank: { type: 'number' }, problem: { type: 'string' }, evidence: { type: 'string' },
        severity: { type: 'string' }, blastRadius: { type: 'string' },
        kind: { type: 'string', enum: ['DESIGN', 'IMPLEMENTATION', 'DOCUMENTATION'] },
        needsRuling: { type: 'boolean' },
        objection: { type: 'string' }, objectionSurvives: { type: 'boolean' },
      }, required: ['rank', 'problem', 'evidence', 'severity', 'kind', 'needsRuling'] } },
      droppedAsArtefact: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
    },
    required: ['problemLedger'],
  } })

phase('Options')
const LEDGER = JSON.stringify(critic && critic.problemLedger || [])
const FRAMES = [
  { key: 'minimal', frame: \`MINIMAL CHANGE. Assume the designer wants to ship, not to redesign. What is the smallest set of edits — ideally fewer than a dozen talents touched — that resolves the top problems? Prefer retuning an existing talent over writing a new one, and prefer changing one talent at a chokepoint over five leaves. Be explicit about what you deliberately leave broken and why it can wait. Session one has not happened yet, so a change made now costs nothing in continuity.\` },
  { key: 'identity', frame: \`IDENTITY FIRST. Start from "what should each tree BE?" and let the talent changes follow. If two trees overlap, the fix is to sharpen both identities, not to nerf one. Say what each affected tree should uniquely own, then what has to change for it to own that. Take the intent prose seriously as a design artefact — where it is right and the talents are wrong, fix the talents; where the prose is the problem, rewrite the promise. You may propose moving a talent from one tree to another.\` },
  { key: 'systemic', frame: \`SYSTEMIC. Assume individual talents are symptoms. Look for the structural cause: the rank-gate asymmetry between heroic and leyline, the L6 double-step, the two-colour deity toll, the 25-vs-9 talent budget, the binary advantage/disadvantage scalar that makes 45 talents partly redundant, the Investiture pool Blue and White cannot refill, the way damage is priced against control. Propose changes at the level of the SYSTEM's rules rather than the talent list, and show how each dissolves several ledger items at once. Name the risks — and say which proposals need an ENGINE change rather than a data edit.\` },
  { key: 'player', frame: \`PLAYER EXPERIENCE FIRST. Start from the table. Two real players are sitting in White and Blue with no damage talents at session one, which has not been played yet. What is their turn-by-turn experience at levels 1-5, and what is the minimum that makes each feel powerful and distinct? Judge every proposal by whether it changes what a player DOES on their turn, not by whether it balances a spreadsheet. Address the felt experience of "I have nothing to do this round" and of "my thing is the same as their thing". Include Sovereignty even though no PC is in it — a player could pick it.\` },
]

const options = await parallel(FRAMES.map(f => () => agent(\`\${SHARED}

The review is complete and verified. Here is the ranked PROBLEM LEDGER:
\${LEDGER}

The completeness critic's findings and the defence advocate's objections:
\${JSON.stringify({ missing: completeness && completeness.missing, contradictions: completeness && completeness.contradictions, structural: completeness && completeness.newStructuralFinding, defence }).slice(0, 40000)}

YOUR REMIT — produce a remediation option set under ONE framing, and commit to it fully:
\${f.frame}

The designer has ruled: adding damage to Blue and/or White is ON THE TABLE. Do not treat the
no-damage identity as fixed, but do not assume damage is the answer either — argue it.

Do NOT write finished talent text; this pass stops at recommendations. For each proposal give:
 - what changes, concretely enough that someone could implement it without asking you a question
 - which ledger items it resolves
 - what it costs (which trees get weaker, what breaks, what has to be retested)
 - whether it is a data edit (authored JSON + pack rebuild) or an engine change
 - a confidence level and what would change your mind
 - whether it needs a designer ruling or is determinable
Rank your proposals. End with the single change you would make first if you could only make one,
and an explicit argued position on whether Blue and/or White should get damage.\`,
  { label: \`options:\${f.key}\`, phase: 'Options', effort: 'high', schema: {
    type: 'object',
    properties: {
      frame: { type: 'string' },
      proposals: { type: 'array', items: { type: 'object', properties: {
        rank: { type: 'number' }, title: { type: 'string' }, change: { type: 'string' },
        resolves: { type: 'string' }, cost: { type: 'string' }, surface: { type: 'string' },
        confidence: { type: 'string' }, needsRuling: { type: 'boolean' },
      }, required: ['rank', 'title', 'change', 'resolves', 'cost', 'confidence', 'needsRuling'] } },
      singleFirstChange: { type: 'string' },
      argumentOnBlueWhiteDamage: { type: 'string' },
      argumentOnSovereignty: { type: 'string' },
    },
    required: ['frame', 'proposals', 'singleFirstChange', 'argumentOnBlueWhiteDamage'],
  } })))

log('Cross-cut complete.')
return { analyses: CROSS, completeness, defence, critic, options: options.filter(Boolean) }
`;

fs.writeFileSync(OUT, script);
console.log(`wrote ${OUT} — ${script.length} chars, ${digest.length} profiles inlined`);
