/* Character Builder UI — replaces the old "Build" tab.
   Sections: Identity, Attributes, Skills (standard + leyline + deity),
             Paths (Leyline Key, Heroic Key, Deity), Expertises, Narrative Flags,
             Talent Budget readout, Learned Talents summary.
*/

const { useState: useS_b, useEffect: useE_b, useMemo: useM_b } = React;

function useCharacter() {
  const [c, setC] = useS_b(window.Character.get());
  useE_b(() => window.Character.subscribe(setC), []);
  return c;
}

function BuilderPage({ atlases, talentIndex, onOpenTree, lastTree, onReturnToTree }) {
  const character = useCharacter();
  const Char = window.Character;
  const derived = useM_b(() => Char.derive(character, atlases), [character, atlases]);
  const grants = useM_b(() => Char.autoGrantedSkills(character, atlases), [character, atlases]);
  const [spotlightStep, setSpotlightStep] = useS_b(null);

  function handleStepClick(stepId) {
    setSpotlightStep(prev => prev === stepId ? null : stepId);
    const el = document.querySelector(`[data-guide-target="${stepId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function dismissSpotlight() { setSpotlightStep(null); }

  return (
    <div className="builder fade-in">
      {spotlightStep && <div className="builder-scrim" onClick={dismissSpotlight} />}
      {lastTree && onReturnToTree && (
        <div className="builder-backbar">
          <button className="btn btn-ghost"
            onClick={() => onReturnToTree(lastTree.id)}
            title={`Return to ${lastTree.group}`}>
            ← Back to {lastTree.group}
          </button>
        </div>
      )}
      <IdentityCard character={character} derived={derived}
        spotlight={spotlightStep === 'origins'} />
      <div className="builder-grid">
        <div className="builder-col builder-col-left">
          <CreationGuide character={character} derived={derived} atlases={atlases}
            activeStep={spotlightStep} onStepClick={handleStepClick} />
          <div data-guide-target="attributes" className={spotlightStep === 'attributes' ? 'spotlight-active' : ''}>
            <AttributesCard character={character} derived={derived} />
          </div>
          <div data-guide-target="talents" className={spotlightStep === 'talents' ? 'spotlight-active' : ''}>
            <LearnedTalentsCard character={character} atlases={atlases} onOpenTree={onOpenTree} />
          </div>
        </div>
        <div className="builder-col builder-col-right">
          <div data-guide-target="paths" className={spotlightStep === 'paths' ? 'spotlight-active' : ''}>
            <PathsCard character={character} atlases={atlases} />
          </div>
          <div data-guide-target="skills" className={spotlightStep === 'skills' ? 'spotlight-active' : ''}>
            <SkillsCard character={character} derived={derived} grants={grants} atlases={atlases} />
          </div>
          <div data-guide-target="story" className={spotlightStep === 'story' ? 'spotlight-active' : ''}>
            <StoryCard character={character} />
          </div>
          <ExpertisesCard character={character} />
          <NarrativeFlagsCard character={character} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Identity ---------- */
function IdentityCard({ character, derived, spotlight }) {
  const Char = window.Character;
  const { defenses } = derived;
  return (
    <section className={'parchment builder-identity' + (spotlight ? ' spotlight-active' : '')}
      data-guide-target="origins">
      <div className="ident-name-block">
        <label className="field-label small-caps">Character</label>
        <input className="ident-name-input" type="text" value={character.name}
          onChange={e => Char.setName(e.target.value)} placeholder="Unnamed Hero" />
        <div className="ident-name-foot">
          <span className="ident-tier muted small-caps">Tier {derived.levelRow.tier}</span>
          <button
            className="btn btn-ghost btn-tiny ident-reset-btn"
            onClick={() => {
              if (window.confirm('Reset character? This clears all attributes, skills, paths, learned talents, expertises, flags, and notes. Cannot be undone.')) {
                Char.reset();
              }
            }}
            title="Clear all character data and start over">↺ Reset</button>
        </div>
      </div>

      <div className="ident-stats">
        <div className="ident-stat">
          <div className="field-label small-caps">Level</div>
          <div className="level-stepper">
            <button className="pip-btn" onClick={() => Char.setLevel(character.level - 1)} disabled={character.level <= 1}>−</button>
            <div className="level-num rubric">{character.level}</div>
            <button className="pip-btn" onClick={() => Char.setLevel(character.level + 1)} disabled={character.level >= 20}>+</button>
          </div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">HP</div>
          <div className="ident-stat-num rubric">{derived.hp}</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Focus</div>
          <div className="ident-stat-num rubric">{derived.focus}</div>
          <div className="ident-stat-formula muted small-caps">2 + WIL</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Invest.</div>
          <div className="ident-stat-num rubric">{derived.investiture}</div>
          <div className="ident-stat-formula muted small-caps">2 + max(AWA,PRE)</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Phys Def</div>
          <div className="ident-stat-num rubric">{defenses.physical}</div>
          <div className="ident-stat-formula muted small-caps">10+STR+SPD</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Cog Def</div>
          <div className="ident-stat-num rubric">{defenses.cognitive}</div>
          <div className="ident-stat-formula muted small-caps">10+INT+WIL</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Spir Def</div>
          <div className="ident-stat-num rubric">{defenses.spiritual}</div>
          <div className="ident-stat-formula muted small-caps">10+AWA+PRE</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Move</div>
          <div className="ident-stat-num rubric">{derived.movement}</div>
          <div className="ident-stat-formula muted small-caps">ft</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Recov</div>
          <div className="ident-stat-num rubric">{derived.recoveryDie}</div>
          <div className="ident-stat-formula muted small-caps">die</div>
        </div>
        <div className="ident-stat">
          <div className="field-label small-caps">Senses</div>
          <div className="ident-stat-num rubric">{derived.sensesRange}</div>
          <div className="ident-stat-formula muted small-caps">ft</div>
        </div>
      </div>

      <div className="ident-notes">
        <label className="field-label small-caps">Notes</label>
        <textarea className="edit-textarea ident-notes-area" value={character.notes} rows={2}
          onChange={e => Char.setNotes(e.target.value)} placeholder="Concept, backstory, anything…" />
      </div>
    </section>
  );
}

/* ---------- Attributes ---------- */
const ATTR_TOOLTIPS = {
  STR: 'HP (10 + STR at L1), Physical Defense, Heavy Weaponry, Athletics',
  SPD: 'Movement (20 + SPD*5 ft), Physical Defense, Light Weaponry, Agility, Stealth',
  INT: 'Cognitive Defense, Crafting, Deduction, Lore, Medicine',
  WIL: 'Focus (2 + WIL), Recovery Die, Cognitive Defense, Discipline, Intimidation',
  AWA: 'Senses Range, Spiritual Defense, Investiture (if AWA > PRE), Insight, Perception, Survival',
  PRE: 'Spiritual Defense, Investiture (if PRE > AWA), Deception, Leadership, Persuasion',
};

function AttributesCard({ character, derived }) {
  const Char = window.Character;
  const attrs = ['STR','SPD','INT','WIL','AWA','PRE'];
  const spent = attrs.reduce((s, a) => s + (character.attributes[a] | 0), 0);
  const budget = derived.levelRow.attrPoints;

  function bump(a, dir) {
    const cur = character.attributes[a] | 0;
    const next = cur + dir;
    if (next < 0) return;
    if (next > 10) return;
    Char.setAttribute(a, next);
  }

  return (
    <section className="parchment builder-card">
      <div className="card-head">
        <h3 className="rubric">Attributes</h3>
        <div className={'budget-counter small-caps' + (spent > budget ? ' over' : spent === budget ? ' exact' : '')}>
          <span className="budget-counter-nums">{spent} / {budget}</span> spent
        </div>
      </div>
      <div className="attr-row">
        {attrs.map(a => {
          const v = character.attributes[a] | 0;
          const mod = v;
          return (
            <div key={a} className="attr-cell">
              <div className="attr-label small-caps">{a}</div>
              <span className="attr-tip">{ATTR_TOOLTIPS[a]}</span>
              <div className="attr-pip-row">
                <button className="pip-btn" onClick={() => bump(a, -1)} disabled={v <= 0}>−</button>
                <div className="attr-num rubric">{v}</div>
                <button className="pip-btn" onClick={() => bump(a, +1)} disabled={(spent >= budget) || v >= 10}>+</button>
              </div>
              <div className="attr-mod muted">{mod >= 0 ? '+' : ''}{mod}</div>
            </div>
          );
        })}
      </div>
      {spent > budget && (
        <div className="warn">Over budget by {spent - budget}</div>
      )}
    </section>
  );
}

/* ---------- Skills ---------- */
function SkillsCard({ character, derived, grants, atlases }) {
  const Char = window.Character;
  const max = derived.levelRow.maxSkillRank;
  const stdSkills = window.Prereq.STANDARD_SKILLS;

  const leylineRowSkills = new Set(window.Prereq.LEYLINE_SKILLS);

  const deityRowSkills = new Set();
  if (character.paths.deitySkill) deityRowSkills.add(character.paths.deitySkill);

  const totalRanks = Object.entries(character.skills).reduce((s, [k, v]) => s + (v | 0), 0);
  const granted = Object.values(grants).reduce((s, v) => s + v, 0);
  const skillBudget = derived.levelRow.skillRanks;

  function rankOf(skill) { return (character.skills[skill] | 0); }
  function effectiveRank(skill) { return rankOf(skill) + (grants[skill] || 0); }
  function setRank(skill, r) { Char.setSkill(skill, r); }

  function attrFor(skill) {
    return window.SkillAttrMap[skill] || '';
  }

  function row(skill, kind) {
    const base = rankOf(skill);
    const grant = grants[skill] || 0;
    const eff = base + grant;
    const overCap = eff > max;
    const attr = attrFor(skill);
    const attrVal = attr ? (character.attributes[attr] | 0) : null;
    const mod = attrVal != null ? attrVal : null;
    const total = mod != null ? mod + eff : null;
    return (
      <div key={skill} className={'skill-row ' + (kind ? `skill-${kind}` : '')}>
        <div className="skill-name">
          {skill}
          {kind && <span className={'skill-kind small-caps skill-kind-' + kind}>{kind}</span>}
        </div>
        <div className="skill-attr small-caps muted">{attr || ''}</div>
        <div className="skill-rank-pips">
          {[0,1,2,3,4,5].slice(0, max + 1).map(r => {
            const isGranted = r >= 1 && r <= grant;
            const filled = r <= eff;
            const lockedByGrant = r < grant;
            return (
              <button key={r}
                className={'rank-pip'
                  + (filled ? ' filled' : '')
                  + (isGranted ? ' granted' : '')
                  + (r === 0 ? ' rank-zero' : '')}
                onClick={() => setRank(skill, Math.max(0, r - grant))}
                disabled={r > max || lockedByGrant}
                title={isGranted ? `Rank ${r} (granted by Key)` : `Rank ${r}`}>
                {r}
              </button>
            );
          })}
        </div>
        <div className="skill-total mono">
          {total != null ? (total >= 0 ? '+' : '') + total : '—'}
          {overCap && <span className="warn small">over cap</span>}
        </div>
      </div>
    );
  }

  return (
    <section className="parchment builder-card builder-card-wide">
      <div className="card-head">
        <h3 className="rubric">Skills</h3>
        <div className={'budget-counter small-caps' + (totalRanks > skillBudget ? ' over' : totalRanks === skillBudget ? ' exact' : '')}>
          <span className="budget-counter-nums">{totalRanks} / {skillBudget}</span> ranks spent · max rank {max}
          {granted > 0 && <span className="muted"> · +{granted} granted by Keys</span>}
        </div>
      </div>
      <div className="skills-table">
        <div className="skill-row skill-row-head small-caps muted">
          <div>Skill</div><div>Attr</div><div>Rank</div><div>Mod</div>
        </div>
        {stdSkills.map(s => row(s, ''))}
        {[...leylineRowSkills].sort().map(s => row(s, 'leyline'))}
        {[...deityRowSkills].sort().map(s => row(s, 'deity'))}
      </div>
      {totalRanks > skillBudget && <div className="warn">Over budget by {totalRanks - skillBudget}</div>}
    </section>
  );
}

/* ---------- Paths ---------- */
function PathsCard({ character, atlases }) {
  const Char = window.Character;
  const lkTid = character.paths.leylineKeyTid;
  const hkTid = character.paths.heroicKeyTid;

  const lkInfo = Char.findTalentByTid(atlases, lkTid);
  const hkInfo = Char.findTalentByTid(atlases, hkTid);

  const leylineKeys = atlases.leyline.trees.map(tree => tree.talents.find(t => t.isKey)).filter(Boolean);
  const heroicKeys  = atlases.heroic.trees.map(tree => tree.talents.find(t => t.isKey)).filter(Boolean);

  function pickLK(tid) {
    if (lkTid && lkTid !== tid) Char.setTalent(lkTid, false);
    Char.setLeylineKey(tid);
    Char.setTalent(tid, true);
  }
  function pickHK(tid) {
    if (hkTid && hkTid !== tid) Char.setTalent(hkTid, false);
    Char.setHeroicKey(tid);
    Char.setTalent(tid, true);
  }

  return (
    <section className="parchment builder-card builder-card-wide">
      <h3 className="rubric">Paths</h3>

      <div className="path-block">
        <div className="path-head">
          <span className="small-caps">Heroic Key</span>
          {hkInfo && <span className="path-chosen">{hkInfo.name} <span className="muted">· {hkInfo.group}</span></span>}
        </div>
        <div className="path-options">
          {heroicKeys.map(t => (
            <button key={t.tid}
              type="button"
              data-color={t.color}
              className={'path-option' + (t.tid === hkTid ? ' chosen' : '')}
              onClick={() => pickHK(t.tid)}>
              <div className="path-option-name rubric">{t.group}</div>
              <div className="path-option-key small-caps">{t.name}</div>
              <div className="path-option-grant small-caps muted">+1 {window.Atlases.HEROIC_KEY_SKILL[t.group]}</div>
              {t.description && <span className="path-tip">{t.description}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="path-block">
        <div className="path-head">
          <span className="small-caps">Leyline Key</span>
          {lkInfo && <span className="path-chosen">{lkInfo.name} <span className="muted">· {lkInfo.group}</span></span>}
        </div>
        <div className="path-options">
          {leylineKeys.map(t => (
            <button key={t.tid}
              type="button"
              data-color={t.color}
              className={'path-option path-option-color' + (t.tid === lkTid ? ' chosen' : '')}
              onClick={() => pickLK(t.tid)}>
              <span className={'mini-pip pip-' + t.color} aria-hidden="true" />
              <div className="path-option-name rubric">{t.group}</div>
              <div className="path-option-grant small-caps muted">+1 {t.group}</div>
              {t.description && <span className="path-tip">{t.description}</span>}
            </button>
          ))}
        </div>
      </div>

    </section>
  );
}

/* ---------- Creation Guide ---------- */
function CreationGuide({ character, derived, atlases, activeStep, onStepClick }) {
  const attrs = ['STR','SPD','INT','WIL','AWA','PRE'];
  const attrSpent = attrs.reduce((s, a) => s + (character.attributes[a] | 0), 0);
  const attrBudget = derived.levelRow.attrPoints;
  const skillSpent = Object.values(character.skills).reduce((s, v) => s + (v | 0), 0);
  const skillBudget = derived.levelRow.skillRanks;
  const talentCount = character.learnedTids.size;

  const steps = [
    {
      id: 'origins',
      label: 'Origins',
      hint: 'Name your character',
      done: character.name.trim().length > 0,
    },
    {
      id: 'paths',
      label: 'Paths',
      hint: '1 Heroic + 1 Leyline path',
      done: !!character.paths.heroicKeyTid && !!character.paths.leylineKeyTid,
      detail: [
        character.paths.heroicKeyTid ? '✓ Heroic' : '○ Heroic',
        character.paths.leylineKeyTid ? '✓ Leyline' : '○ Leyline',
      ].join('  '),
    },
    {
      id: 'attributes',
      label: 'Attributes',
      hint: `Distribute ${attrBudget} points (max 3 at L1)`,
      done: attrSpent === attrBudget,
      detail: `${attrSpent} / ${attrBudget} spent`,
    },
    {
      id: 'skills',
      label: 'Skills',
      hint: `${skillBudget} ranks (cap ${derived.levelRow.maxSkillRank})`,
      done: skillSpent >= skillBudget,
      detail: `${skillSpent} / ${skillBudget} ranks`,
    },
    {
      id: 'talents',
      label: 'Talents',
      hint: 'Learn talents from your paths',
      done: talentCount > 2,
      detail: `${derived.budget.spent} / ${derived.budget.totalAvailable} points spent`,
    },
    {
      id: 'equipment',
      label: 'Equipment',
      hint: 'Coming soon',
      done: false,
      disabled: true,
    },
    {
      id: 'story',
      label: 'Story',
      hint: 'Purpose, Obstacle & Goals',
      done: (character.purpose || '').trim().length > 0 && (character.obstacle || '').trim().length > 0,
    },
  ];

  // Find the first incomplete, non-disabled step after the latest completed one
  let nextStepId = null;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].done && !steps[i].disabled) {
      const next = steps.slice(i + 1).find(s => !s.done && !s.disabled);
      if (next) nextStepId = next.id;
    }
  }

  const doneCount = steps.filter(s => s.done).length;
  const totalActive = steps.filter(s => !s.disabled).length;

  return (
    <section className={'parchment builder-card guide-card' + (activeStep ? ' guide-card-active' : '')}>
      <div className="card-head">
        <h3 className="rubric">Creation Guide</h3>
        <div className="muted small-caps">{doneCount}/{totalActive}</div>
      </div>
      <ol className="guide-steps">
        {steps.map((step, i) => (
          <li key={step.id}
            className={
              'guide-step'
              + (step.done ? ' done' : '')
              + (step.disabled ? ' disabled' : '')
              + (activeStep === step.id ? ' active' : '')
              + (step.id === nextStepId ? ' guide-step-next' : '')
            }
            onClick={() => !step.disabled && onStepClick(step.id)}
            title={step.disabled ? 'Not yet available' : `Go to: ${step.label}`}>
            <span className="guide-step-num">{step.done ? '✓' : i + 1}</span>
            <div className="guide-step-body">
              <span className="guide-step-label">{step.label}</span>
              <span className="guide-step-hint muted">{step.hint}</span>
              {step.detail && <span className="guide-step-detail small-caps">{step.detail}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Story ---------- */
function StoryCard({ character }) {
  const Char = window.Character;
  return (
    <section className="parchment builder-card">
      <h3 className="rubric">Story</h3>
      <div className="story-fields">
        <div className="story-field">
          <label className="field-label small-caps">Purpose</label>
          <input className="edit-input" type="text" value={character.purpose || ''}
            onChange={e => Char.setPurpose(e.target.value)}
            placeholder="Why does your character adventure?" />
        </div>
        <div className="story-field">
          <label className="field-label small-caps">Obstacle</label>
          <input className="edit-input" type="text" value={character.obstacle || ''}
            onChange={e => Char.setObstacle(e.target.value)}
            placeholder="What holds them back or creates conflict?" />
        </div>
        <div className="story-field">
          <label className="field-label small-caps">Goals</label>
          <textarea className="edit-textarea" rows={2} value={character.goals || ''}
            onChange={e => Char.setGoals(e.target.value)}
            placeholder="1–2 concrete goals for the campaign" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Expertises ---------- */
function ExpertisesCard({ character }) {
  const Char = window.Character;
  const [draft, setDraft] = useS_b('');
  function add() {
    const v = draft.trim();
    if (!v) return;
    Char.setExpertises([...character.expertises, v]);
    setDraft('');
  }
  function remove(i) {
    const next = character.expertises.slice();
    next.splice(i, 1);
    Char.setExpertises(next);
  }
  return (
    <section className="parchment builder-card">
      <h3 className="rubric">Expertises</h3>
      <div className="muted small">Freeform — track expertises granted by talents, ancestry, or training.</div>
      <div className="expertise-list">
        {character.expertises.length === 0 && <div className="muted">No expertises yet.</div>}
        {character.expertises.map((e, i) => (
          <span key={i} className="exp-chip">
            {e}
            <button className="exp-x" onClick={() => remove(i)}>×</button>
          </span>
        ))}
      </div>
      <div className="add-row">
        <input className="edit-input" type="text" value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add expertise…" />
        <button className="btn" onClick={add}>+ Add</button>
      </div>
    </section>
  );
}

/* ---------- Narrative Flags ---------- */
function NarrativeFlagsCard({ character }) {
  const Char = window.Character;
  const [draft, setDraft] = useS_b('');
  function add() {
    const v = draft.trim();
    if (!v) return;
    Char.addNarrativeFlag(v);
    setDraft('');
  }
  return (
    <section className="parchment builder-card">
      <h3 className="rubric">Narrative Flags</h3>
      <div className="muted small">Story conditions met — talents that reference these auto-pass their narrative prereq.</div>
      <div className="flag-list">
        {character.narrativeFlags.length === 0 && <div className="muted">No flags yet. Talents with narrative prereqs offer a "Mark Cleared" button.</div>}
        {character.narrativeFlags.map((f, i) => (
          <span key={i} className="flag-chip">
            ⚐ {f}
            <button className="exp-x" onClick={() => Char.removeNarrativeFlag(f)}>×</button>
          </span>
        ))}
      </div>
      <div className="add-row">
        <input className="edit-input" type="text" value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add flag (e.g. Shardbearer)…" />
        <button className="btn" onClick={add}>+ Add</button>
      </div>
    </section>
  );
}

/* ---------- Learned Talents Summary ---------- */
function LearnedTalentsCard({ character, atlases, onOpenTree }) {
  const learned = useM_b(() => {
    const out = [];
    for (const tid of character.learnedTids) {
      const t = window.Character.findTalentByTid(atlases, tid);
      if (t) out.push(t);
    }
    out.sort((a, b) => (a.atlas + a.group).localeCompare(b.atlas + b.group) || a.name.localeCompare(b.name));
    return out;
  }, [character.learnedTids, atlases]);

  const grouped = {};
  for (const t of learned) {
    const k = `${t.atlas}/${t.group}`;
    (grouped[k] = grouped[k] || []).push(t);
  }

  return (
    <section className="parchment builder-card builder-card-wide">
      <h3 className="rubric">Learned Talents <span className="muted small-caps">({learned.length})</span></h3>
      {learned.length === 0 ? (
        <div className="muted coach-mark">No talents learned yet. Click <strong>"Open"</strong> on a path below to enter its talent tree, then select a node and click <strong>Learn Talent</strong>.</div>
      ) : (
        <div className="learned-grid">
          {Object.entries(grouped).map(([k, ts]) => {
            const [atlas, group] = k.split('/');
            const treeId = `${atlas}/${group}`;
            return (
              <div key={k} className="learned-block" data-color={ts[0].color}>
                <div className="learned-block-head">
                  <span className="rubric">{group}</span>
                  <span className="small-caps muted">{atlas}</span>
                  {onOpenTree && (
                    <button className="btn btn-ghost btn-tiny" onClick={() => onOpenTree(treeId)}>open →</button>
                  )}
                </div>
                <ul className="learned-list">
                  {ts.map(t => {
                    const lvl = character.learnedAt[t.tid];
                    return (
                      <li key={t.tid}>
                        <span className={'mini-pip pip-' + t.color} aria-hidden="true" />
                        <span className="learned-name">{t.name}</span>
                        {t.isKey && <span className="key-badge small-caps">Key</span>}
                        <span className="learned-meta muted small-caps">{t.specialty || t.tree}</span>
                        {lvl != null && <span className="learned-level small-caps muted">L{lvl}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* Skill -> Attribute map (canonical, from rules doc). */
window.SkillAttrMap = {
  // Standard 18
  Agility:        'SPD',
  Athletics:      'STR',
  Crafting:       'INT',
  Deception:      'PRE',
  Deduction:      'INT',
  Discipline:     'WIL',
  'Heavy Weaponry': 'STR',
  Insight:        'AWA',
  Intimidation:   'WIL',
  Leadership:     'PRE',
  'Light Weaponry': 'SPD',
  Lore:           'INT',
  Medicine:       'INT',
  Perception:     'AWA',
  Persuasion:     'PRE',
  Stealth:        'SPD',
  Survival:       'AWA',
  Thievery:       'SPD',
  // Leyline color skills
  White: 'WIL', Blue: 'INT', Black: 'PRE', Red: 'STR', Green: 'AWA',
  // Deity skills (per rules doc)
  Life: 'AWA', Knowledge: 'AWA', Civilization: 'WIL', Chaos: 'PRE',
  Death: 'PRE', Fate: 'WIL', Destruction: 'STR', Order: 'WIL',
  Power: 'STR', Sovereignty: 'PRE',
};

window.BuilderPage = BuilderPage;
