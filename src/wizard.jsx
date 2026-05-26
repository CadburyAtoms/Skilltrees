/* Character creation wizard — 4-step guided flow.
   Steps 1-3 render here; step 4 (talents) reuses TreePage in App.jsx.
   Exports: window.WizardPage, window.WizardTalentOverlay
*/

(function () {
  const { useState, useEffect, useMemo } = React;

  const ATTR_INFO = {
    STR: {
      name: 'Strength',
      desc: 'Your physical power, toughness, and athleticism. Represents raw force, constitution, and physical resilience.',
      effects: ['Physical Defense', 'Health', 'Unarmed attack damage die', 'Lifting and Carrying Capacity', 'Strength-based skill modifiers (Athletics, Heavy Weaponry, Red leyline magic tests)'],
    },
    SPD: {
      name: 'Speed',
      desc: 'Your agility, reflexes, and quickness. Governs how fast you move and how deftly you act.',
      effects: ['Physical Defense', 'Movement (20 + SPD×5 ft)', 'Speed-based skill modifiers (Agility, Light Weaponry, Stealth, Thievery)'],
    },
    INT: {
      name: 'Intellect',
      desc: 'Your reasoning, memory, and analytical ability. Governs learned knowledge and deductive thought.',
      effects: ['Cognitive Defense', 'Intellect-based skill modifiers (Crafting, Deduction, Lore, Medicine, Blue leyline magic tests)'],
    },
    WIL: {
      name: 'Willpower',
      desc: 'Your mental fortitude, discipline, and determination. Governs focus and inner resolve.',
      effects: ['Cognitive Defense', 'Focus (2 + WIL)', 'Recovery Die (scales d4–d10 with WIL)', 'Willpower-based skill modifiers (Discipline, Intimidation, White leyline magic tests)'],
    },
    AWA: {
      name: 'Awareness',
      desc: 'Your perceptiveness, intuition, and attunement to the world around you.',
      effects: ['Spiritual Defense', 'Investiture (2 + max of AWA, PRE)', 'Senses Range (10–30 ft)', 'Awareness-based skill modifiers (Insight, Perception, Survival, Green leyline magic tests)'],
    },
    PRE: {
      name: 'Presence',
      desc: 'Your force of personality, charm, and social command. Governs how others perceive and respond to you.',
      effects: ['Spiritual Defense', 'Investiture (2 + max of AWA, PRE)', 'Presence-based skill modifiers (Deception, Leadership, Persuasion, Black leyline magic tests)'],
    },
  };

  const ATTRS = ['STR', 'SPD', 'INT', 'WIL', 'AWA', 'PRE'];

  const SKILL_COLUMNS = [
    ['Agility', 'Athletics', 'Heavy Weaponry', 'Light Weaponry', 'Stealth', 'Thievery', 'Red'],
    ['Crafting', 'Deduction', 'Discipline', 'Intimidation', 'Lore', 'Medicine', 'Blue', 'White'],
    ['Deception', 'Insight', 'Leadership', 'Perception', 'Persuasion', 'Survival', 'Black', 'Green'],
  ];

  const LEYLINE_SKILLS = new Set(['White', 'Blue', 'Black', 'Red', 'Green']);

  function useCharacter() {
    const [c, setC] = useState(window.Character.get());
    useEffect(() => window.Character.subscribe(setC), []);
    return c;
  }

  /* ======================== Progress Bar ======================== */

  function WizardProgress({ step }) {
    const steps = [1, 2, 3, 4];
    const labels = ['Paths', 'Attributes', 'Skills', 'Talents'];
    return (
      <div className="wizard-progress">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className={'wizard-step-line' + (step > s - 1 ? ' done' : '')} />}
            <div className={'wizard-step-dot' + (s === step ? ' active' : s < step ? ' done' : '')}
              title={labels[i]}>
              {s < step ? '✓' : s}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  /* ======================== Step 1: Welcome ======================== */

  function WizardWelcome({ atlases, character }) {
    const Char = window.Character;
    const lkTid = character.paths.leylineKeyTid;
    const hkTid = character.paths.heroicKeyTid;

    const heroicTrees = atlases.heroic.trees;
    const leylineTrees = atlases.leyline.trees;

    const selectedHeroic = hkTid ? heroicTrees.find(t => t.talents[0] && t.talents[0].tid === hkTid) : null;
    const selectedLeyline = lkTid ? leylineTrees.find(t => t.talents[0] && t.talents[0].tid === lkTid) : null;

    function pickHK(tree) {
      const tid = tree.talents[0].tid;
      if (hkTid && hkTid !== tid) Char.setTalent(hkTid, false);
      Char.setHeroicKey(tid);
      Char.setTalent(tid, true);
    }
    function pickLK(tree) {
      const tid = tree.talents[0].tid;
      if (lkTid && lkTid !== tid) Char.setTalent(lkTid, false);
      Char.setLeylineKey(tid);
      Char.setTalent(tid, true);
    }

    function PathDesc({ tree, atlas }) {
      const key = tree.talents[0];
      const lore = window.GroupLore[atlas] && window.GroupLore[atlas][tree.group];
      const startingSkill = atlas === 'heroic'
        ? window.Atlases.HEROIC_KEY_SKILL[tree.group]
        : tree.group;
      return (
        <div className="wizard-desc-panel" data-color={tree.color}>
          {lore && <div>{lore.lore}</div>}
          {lore && <div className="desc-section"><span className="desc-label">Gameplay: </span>{lore.gameplay}</div>}
          <div className="desc-section">
            <span className="desc-label">Specialties: </span>
            <span className="desc-body">{tree.columns.map(c => c.label).join(', ')}</span>
          </div>
          {key && (
            <div className="desc-section">
              <span className="desc-label">Key Talent — {key.name}: </span>
              <span className="desc-body">{key.description}</span>
            </div>
          )}
          <div className="desc-section">
            <span className="desc-label">Starting Skill: </span>
            <span className="desc-body">{startingSkill}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="wizard-card parchment">
        <div className="wizard-intro">
          Welcome to Edha, where the magical leylines shape history, heroes, villains, and
          the stories they tell. In this world, investiture flows through every living thing,
          and the choices you make determine how that power manifests. The plot die is yours
          to roll — fortune favors the bold.
        </div>

        <h2 className="rubric">What is your character's name?</h2>
        <input
          className="wizard-name-input"
          type="text"
          value={character.name}
          onChange={e => Char.setName(e.target.value)}
          placeholder="Enter a name…"
          autoFocus
        />

        <div className="wizard-section-label">
          Characters in Edha are shaped by the paths they choose in life. Choose one
          <strong> Heroic path</strong> to determine your physical and mental prowess, and one
          <strong> Leyline path</strong> to determine your magical affinity.
        </div>

        <div className="wizard-path-grid">
          {heroicTrees.map(tree => (
            <button
              key={tree.id}
              type="button"
              data-color={tree.color}
              className={'wizard-path-btn' + (selectedHeroic === tree ? ' selected' : '')}
              onClick={() => pickHK(tree)}>
              <div className="path-btn-name">{tree.group}</div>
            </button>
          ))}
        </div>

        {selectedHeroic && <PathDesc tree={selectedHeroic} atlas="heroic" />}

        <div style={{ marginTop: 24 }}>
          <div className="wizard-path-grid wizard-path-grid-5">
            {leylineTrees.map(tree => (
              <button
                key={tree.id}
                type="button"
                data-color={tree.color}
                className={'wizard-path-btn' + (selectedLeyline === tree ? ' selected' : '')}
                onClick={() => pickLK(tree)}>
                <span className={'mini-pip pip-' + tree.color} />
                <div className="path-btn-name">{tree.group}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedLeyline && <PathDesc tree={selectedLeyline} atlas="leyline" />}
      </div>
    );
  }

  /* ======================== Step 2: Attributes ======================== */

  function WizardAttributes({ character }) {
    const Char = window.Character;
    const [focused, setFocused] = useState('STR');
    const spent = ATTRS.reduce((s, a) => s + (character.attributes[a] | 0), 0);
    const remaining = 12 - spent;

    function bump(attr, delta) {
      const cur = character.attributes[attr] | 0;
      const next = cur + delta;
      if (next < 0 || next > 3) return;
      if (delta > 0 && remaining <= 0) return;
      Char.setAttribute(attr, next);
    }

    const info = ATTR_INFO[focused];

    return (
      <div className="wizard-card parchment">
        <h2 className="rubric">Attributes</h2>
        <div className="wizard-intro">
          Distribute 12 points across the six attributes. You don't have to put points in
          every attribute, and you can't put more than 3 points into any attribute during
          this step.
        </div>

        <div className={'wizard-budget' + (remaining === 0 ? ' exact' : remaining < 0 ? ' over' : '')}>
          {remaining} point{remaining !== 1 ? 's' : ''} remain
        </div>

        <div className="wizard-attr-grid">
          {ATTRS.map(a => {
            const v = character.attributes[a] | 0;
            return (
              <div key={a}
                className={'wizard-attr-cell' + (focused === a ? ' focused' : '')}
                onClick={() => setFocused(a)}>
                <div className="attr-label">{a}</div>
                <div className="attr-full-name">{ATTR_INFO[a].name}</div>
                <div className="attr-pip-row">
                  <button className="pip-btn" onClick={e => { e.stopPropagation(); bump(a, -1); }} disabled={v <= 0}>{'−'}</button>
                  <div className="attr-num rubric">{v}</div>
                  <button className="pip-btn" onClick={e => { e.stopPropagation(); bump(a, +1); }} disabled={v >= 3 || remaining <= 0}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {info && (
          <div className="wizard-desc-panel">
            <h4 className="rubric">{info.name}</h4>
            <div>{info.desc}</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              {info.effects.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  /* ======================== Step 3: Skills ======================== */

  function WizardSkills({ character, atlases }) {
    const Char = window.Character;
    const grants = useMemo(() => Char.autoGrantedSkills(character, atlases), [character, atlases]);
    const totalRanks = Object.values(character.skills).reduce((s, v) => s + (v | 0), 0);
    const remaining = 4 - totalRanks;

    function skillAttr(skill) {
      return window.SkillAttrMap ? window.SkillAttrMap[skill] || '' : '';
    }

    function setRank(skill, rank) {
      Char.setSkill(skill, rank);
    }

    function SkillRow({ skill }) {
      const base = character.skills[skill] | 0;
      const grant = grants[skill] || 0;
      const isLeyline = LEYLINE_SKILLS.has(skill);
      const attr = skillAttr(skill);

      return (
        <div className={'wizard-skill-row' + (grant > 0 ? ' granted' : '')}>
          <span className="wizard-skill-name">
            {skill}
            {isLeyline && <span className="skill-kind small-caps skill-kind-leyline" style={{ marginLeft: 4 }}>leyline</span>}
          </span>
          <span className="wizard-skill-attr">{attr}</span>
          <div className="wizard-skill-pips">
            {grant > 0 && (
              <span className="rank-pip granted" title="Granted by path">G</span>
            )}
            {[1, 2].map(r => {
              const filled = r <= base;
              const disabled = !filled && remaining <= 0;
              return (
                <button key={r}
                  className={'rank-pip' + (filled ? ' filled' : '')}
                  disabled={disabled}
                  onClick={() => setRank(skill, filled ? r - 1 : r)}
                  title={`Rank ${r}`}>
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="wizard-card parchment">
        <h2 className="rubric">Choose your Skills</h2>
        <div className="wizard-intro">
          The starting paths you chose grant an associated starting skill, granting a free rank
          in that skill. As you play the game, you'll use skills to attempt various tasks. The
          more ranks you have in a skill, the better you are at tests and abilities that use
          that skill. Each skill is also enhanced by the attribute listed next to it on your
          character sheet. This combination of ranks plus attribute score is your
          <strong> skill modifier</strong>, which you add to your test result.
        </div>

        <div className={'wizard-budget' + (remaining === 0 ? ' exact' : remaining < 0 ? ' over' : '')}>
          Distribute {remaining > 0 ? remaining : 0} more rank{remaining !== 1 ? 's' : ''}
          {remaining <= 0 && ' — done!'}
        </div>

        <div className="wizard-skill-grid">
          {SKILL_COLUMNS.map((col, ci) => (
            <div key={ci}>
              {col.map(skill => <SkillRow key={skill} skill={skill} />)}
            </div>
          ))}
        </div>

        <div className="wizard-expertises-placeholder">
          Expertises Coming Soon
        </div>
      </div>
    );
  }

  /* ======================== Wizard Page (steps 1-3) ======================== */

  function WizardPage({ atlases, wizardStep, setWizardStep, onComplete, character }) {
    const canNext1 = character.name.trim() !== '' && character.paths.heroicKeyTid && character.paths.leylineKeyTid;
    const attrSpent = ATTRS.reduce((s, a) => s + (character.attributes[a] | 0), 0);
    const canNext2 = attrSpent === 12;
    const skillRanks = Object.values(character.skills).reduce((s, v) => s + (v | 0), 0);
    const canNext3 = skillRanks >= 4;

    return (
      <div className="wizard fade-in">
        <WizardProgress step={wizardStep} />

        {wizardStep === 1 && <WizardWelcome atlases={atlases} character={character} />}
        {wizardStep === 2 && <WizardAttributes character={character} />}
        {wizardStep === 3 && <WizardSkills character={character} atlases={atlases} />}

        <div className="wizard-nav">
          <div>
            {wizardStep > 1 && (
              <button className="btn btn-ghost" onClick={() => setWizardStep(wizardStep - 1)}>
                {'←'} Back
              </button>
            )}
          </div>
          <div>
            {wizardStep === 1 && (
              <button className="btn" disabled={!canNext1} onClick={() => setWizardStep(2)}>
                Next {'→'}
              </button>
            )}
            {wizardStep === 2 && (
              <button className="btn" disabled={!canNext2} onClick={() => setWizardStep(3)}>
                Next {'→'}
              </button>
            )}
            {wizardStep === 3 && (
              <button className="btn" disabled={!canNext3} onClick={onComplete}>
                Choose Talents {'→'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ======================== Talent Overlay (step 4) ======================== */

  function WizardTalentOverlay({ phase, talentsSpent, onNext, onComplete }) {
    const [popupDismissed, setPopupDismissed] = useState(false);
    const [popupPhase, setPopupPhase] = useState(phase);

    useEffect(() => {
      if (phase !== popupPhase) {
        setPopupDismissed(false);
        setPopupPhase(phase);
      }
    }, [phase]);

    const showNext = (phase === 1 && talentsSpent >= 1) || (phase === 2 && talentsSpent >= 2);

    if (!popupDismissed) {
      let title, body, btnLabel;
      if (phase === 1) {
        title = 'Choose Your Talents';
        body = 'Your Key Talents from both paths are already learned. You have 3 talent points to spend: 1 in your Heroic tree, 1 in your Leyline tree, and 1 anywhere you choose.';
        btnLabel = 'Browse Heroic Tree';
      } else if (phase === 2) {
        title = 'Leyline Talent';
        body = 'Nice pick! Now spend 1 talent point in your Leyline tree.';
        btnLabel = 'Browse Leyline Tree';
      } else {
        title = 'One More Talent';
        body = 'You have 1 talent point remaining. Spend it in any tree you like — Heroic, Leyline, or even Deity.';
        btnLabel = 'Browse Freely';
      }
      return (
        <div className="wizard-talent-popup" onClick={() => setPopupDismissed(true)}>
          <div className="wizard-talent-popup-card parchment" onClick={e => e.stopPropagation()}>
            <h3 className="rubric">{title}</h3>
            <p>{body}</p>
            <button className="btn" onClick={() => setPopupDismissed(true)} style={{ marginTop: 8 }}>
              {btnLabel}
            </button>
          </div>
        </div>
      );
    }

    const phaseLabels = {
      1: 'Heroic Tree',
      2: 'Leyline Tree',
      3: 'Free Pick',
    };

    return (
      <div className="wizard-talent-overlay">
        <div className="overlay-text">
          <div className="overlay-phase">Talent {talentsSpent + 1} of 3 — {phaseLabels[phase]}</div>
          {phase === 1 && !showNext && 'Learn a talent from your Heroic tree.'}
          {phase === 1 && showNext && 'Talent learned! Continue to your Leyline tree.'}
          {phase === 2 && !showNext && 'Learn a talent from your Leyline tree.'}
          {phase === 2 && showNext && 'Talent learned! One more to go — anywhere you like.'}
          {phase === 3 && 'Spend your final talent point in any tree. Use the Atlases menu above to navigate.'}
        </div>
        {showNext && (
          <button className="btn" onClick={onNext}>
            Next {'→'}
          </button>
        )}
      </div>
    );
  }

  window.WizardPage = WizardPage;
  window.WizardTalentOverlay = WizardTalentOverlay;
})();
