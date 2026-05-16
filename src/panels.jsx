/* Detail panel + filter bar.  TalentDetail evaluates the prereq string against the live
   character + edge prereqs and shows per-clause pass/fail with a "Mark Cleared" button for
   narrative clauses.

   Edits to a talent (description, cost, etc.) are still supported via TalentEditor.
*/

const { useMemo: useM_p, useState: useS_p, useEffect: useE_p } = React;

function TalentDetail({
  talent, onClose,
  character,                  // live character ref
  edgePrereqs,                // list of prereq talent objects (in-tree)
  prereqResult,               // { ok, groups }
  onToggleLearn,
  editMode, onEdit, origName, hasEdits, onResetTalent, onDeleteTalent,
  onAddNarrativeFlag,
  treeColumns,                // [{ id, label }] available specialty columns for this tree
}) {
  if (!talent) {
    return (
      <div className="detail-placeholder">
        <div>
          <div style={{ fontSize: '2rem', opacity: 0.4, marginBottom: 8 }}>✶</div>
          Select a node to read the talent.
        </div>
      </div>
    );
  }

  if (editMode) {
    return (
      <TalentEditor talent={talent} origName={origName} hasEdits={hasEdits}
        onClose={onClose} onEdit={onEdit} onResetTalent={onResetTalent}
        onDeleteTalent={onDeleteTalent}
        treeColumns={treeColumns} />
    );
  }

  const cost = talent.cost && talent.cost !== '—' && talent.cost !== '-' ? talent.cost : 'No cost';
  const tags = (talent.tags || '').split(/[;,]/).map(t => t.trim()).filter(Boolean);
  const isLearned = !!(character && character.learnedTids.has(talent.tid));
  const edgesMet = !edgePrereqs || edgePrereqs.every(p => character && character.learnedTids.has(p.tid));
  const stringMet = !prereqResult || prereqResult.ok;
  const canLearn = !isLearned && edgesMet && stringMet;

  return (
    <div className="talent-detail fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div className="prereq-path">{talent.atlas} · {talent.group} · {talent.specialty || ''}</div>
          <h3 className="rubric">{talent.name}</h3>
        </div>
        <button className="btn btn-ghost" onClick={onClose} title="Close"
          style={{ padding: '2px 10px', fontSize: '0.9rem' }}>✕</button>
      </div>

      <div className="action-cost" style={{ marginTop: 10 }}>
        <span className="pill">{talent.action || 'Passive'}</span>
        <span className="pill cost">{cost}</span>
        {talent.isKey && <span className="pill key-pill">Key</span>}
      </div>

      {/* In-tree prereq edges */}
      {edgePrereqs && edgePrereqs.length > 0 && (
        <div className="prereq-block">
          <span className="label">In-tree prerequisites</span>
          <div className="prereq-chips">
            {edgePrereqs.map((p, i) => {
              const got = character && character.learnedTids.has(p.tid);
              return (
                <span key={i} className={'prereq-chip prereq-talent' + (got ? ' met' : ' unmet')}>
                  {got ? '✓' : '○'} {p.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Parsed prereq string */}
      {prereqResult && prereqResult.groups && prereqResult.groups.length > 0 && (
        <div className="prereq-block">
          <span className="label">Requirements</span>
          <div className="prereq-groups">
            {prereqResult.groups.map((g, gi) => (
              <div key={gi} className={'prereq-group' + (g.passed ? ' met' : ' unmet')}>
                {g.clauses.map((c, ci) => (
                  <React.Fragment key={ci}>
                    {ci > 0 && <span className="or-conn">or</span>}
                    <PrereqChip clause={c} passed={c.passed}
                      onAddNarrativeFlag={onAddNarrativeFlag} />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="desc">{talent.description}</p>

      {talent.flavor && (
        <div className="flavor">"{talent.flavor}"</div>
      )}

      {tags.length > 0 && (
        <div className="tags">
          {tags.map((t, i) => <span key={i} className="tag-chip">{t}</span>)}
        </div>
      )}

      <div className="learn-row">
        {isLearned ? (
          <button className="btn" onClick={() => onToggleLearn(talent.tid)}>Unlearn</button>
        ) : (
          <button className="btn btn-primary" disabled={!canLearn}
            style={{ opacity: canLearn ? 1 : 0.5, cursor: canLearn ? 'pointer' : 'not-allowed' }}
            onClick={() => onToggleLearn(talent.tid)}>
            {canLearn ? 'Learn Talent' : (edgesMet ? 'Requirements not met' : 'Tree prereqs missing')}
          </button>
        )}
      </div>
    </div>
  );
}

function PrereqChip({ clause, passed, onAddNarrativeFlag }) {
  const cls = 'prereq-chip ' + (passed ? 'met' : 'unmet');
  if (clause.kind === 'attribute') {
    return <span className={cls + ' prereq-stat'}>{passed ? '✓' : '○'} {clause.attr} {clause.rank}+</span>;
  }
  if (clause.kind === 'leyline') {
    return <span className={cls + ' prereq-color pip-' + clause.skill.toLowerCase()}>
      <span className={'color-pip pip-' + clause.skill.toLowerCase()} aria-hidden="true" />
      {clause.skill} {clause.rank}+
    </span>;
  }
  if (clause.kind === 'deity' || clause.kind === 'skill') {
    return <span className={cls}>{passed ? '✓' : '○'} {clause.skill} {clause.rank}+</span>;
  }
  if (clause.kind === 'talent') {
    return <span className={cls + ' prereq-talent'}>{passed ? '✓' : '○'} ↳ {clause.talentName}</span>;
  }
  // narrative
  return (
    <span className={cls + ' prereq-narrative'}>
      ⚐ {clause.text}
      {!passed && onAddNarrativeFlag && (
        <button className="narrative-mark" onClick={() => onAddNarrativeFlag(clause.text)} title="Mark this narrative gate as cleared">
          mark cleared
        </button>
      )}
    </span>
  );
}

const ACTION_OPTIONS = ['Passive', 'Special', 'Free Action', 'Reaction', '1 Action', '2 Actions', '3 Actions'];

function TalentEditor({ talent, origName, hasEdits, onClose, onEdit, onResetTalent, onDeleteTalent, treeColumns }) {
  const [name, setName] = useS_p(talent.name);
  const [action, setAction] = useS_p(talent.action || 'Passive');
  const [cost, setCost] = useS_p(talent.cost || '');
  const [description, setDescription] = useS_p(talent.description || '');
  const [flavor, setFlavor] = useS_p(talent.flavor || '');
  const [prereqs, setPrereqs] = useS_p(talent.prereqs || '');
  const [tagsStr, setTagsStr] = useS_p((talent.tags || '').toString());
  const [specialty, setSpecialty] = useS_p(talent.specialty || '');
  const [specialtyMode, setSpecialtyMode] = useS_p(() => {
    const opts = (treeColumns || []).map(c => c.id);
    const cur = talent.specialty || '';
    return cur && !opts.includes(cur) ? 'custom' : 'select';
  });

  useE_p(() => {
    setName(talent.name);
    setAction(talent.action || 'Passive');
    setCost(talent.cost || '');
    setDescription(talent.description || '');
    setFlavor(talent.flavor || '');
    setPrereqs(talent.prereqs || '');
    setTagsStr((talent.tags || '').toString());
    setSpecialty(talent.specialty || '');
    const opts = (treeColumns || []).map(c => c.id);
    setSpecialtyMode((talent.specialty && !opts.includes(talent.specialty)) ? 'custom' : 'select');
  }, [origName]);

  function commit(patch) { onEdit(patch); }
  function commitSpecialty(value) {
    const v = (value || '').trim();
    if (v === (talent.specialty || '')) return;
    // Update both specialty (display tag) and columnId (which column the talent renders in).
    // Key talents stay in the "key" column regardless.
    const patch = { specialty: v };
    if (!talent.isKey) patch.columnId = v || talent.columnId;
    if (talent.tree && talent.tree !== 'Key') patch.tree = v || talent.tree;
    commit(patch);
  }

  return (
    <div className="talent-detail talent-editor fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div className="prereq-path">
            EDITING · {talent.atlas} · {talent.group}
            {hasEdits && <span style={{ color: 'var(--rubric)', marginLeft: 8 }}>● modified</span>}
          </div>
          <input className="edit-input edit-name rubric" type="text" value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => name !== talent.name && commit({ name })}
            placeholder="Talent name" />
        </div>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '2px 10px', fontSize: '0.9rem' }}>✕</button>
      </div>
      {!talent.isKey && (
        <div className="edit-row">
          <label className="edit-label">Specialty <span style={{ opacity: 0.6 }}>(column / tag)</span></label>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            {specialtyMode === 'select' ? (
              <select className="edit-select" value={specialty} style={{ flex: 1 }}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '__custom__') {
                    setSpecialtyMode('custom');
                    return;
                  }
                  setSpecialty(v);
                  commitSpecialty(v);
                }}>
                {(treeColumns || []).filter(c => c.id !== 'key').map(c => (
                  <option key={c.id} value={c.id}>{c.label || c.id}</option>
                ))}
                {specialty && !(treeColumns || []).some(c => c.id === specialty) && (
                  <option value={specialty}>{specialty} (custom)</option>
                )}
                <option value="__custom__">+ New specialty…</option>
              </select>
            ) : (
              <input className="edit-input" type="text" value={specialty} style={{ flex: 1 }}
                autoFocus
                placeholder="New specialty name"
                onChange={e => setSpecialty(e.target.value)}
                onBlur={() => commitSpecialty(specialty)}
                onKeyDown={e => { if (e.key === 'Enter') { e.target.blur(); } }} />
            )}
            {specialtyMode === 'custom' && (
              <button className="btn btn-ghost" type="button" style={{ padding: '2px 10px', fontSize: '0.85rem' }}
                onClick={() => {
                  setSpecialtyMode('select');
                  setSpecialty(talent.specialty || '');
                }}>
                ↶
              </button>
            )}
          </div>
        </div>
      )}
      <div className="edit-row">
        <label className="edit-label">Action</label>
        <select className="edit-select" value={action}
          onChange={e => { setAction(e.target.value); commit({ action: e.target.value }); }}>
          {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="edit-row">
        <label className="edit-label">Cost</label>
        <input className="edit-input" type="text" value={cost}
          onChange={e => setCost(e.target.value)}
          onBlur={() => cost !== (talent.cost || '') && commit({ cost })} />
      </div>
      <div className="edit-row">
        <label className="edit-label">Prereq string</label>
        <input className="edit-input" type="text" value={prereqs}
          onChange={e => setPrereqs(e.target.value)}
          onBlur={() => prereqs !== (talent.prereqs || '') && commit({ prereqs })}
          placeholder="e.g. Athletics 2+; Heavy 1+ or Champion's Resolve" />
      </div>
      <div className="edit-row">
        <label className="edit-label">Description</label>
        <textarea className="edit-textarea" value={description} rows={4}
          onChange={e => setDescription(e.target.value)}
          onBlur={() => description !== (talent.description || '') && commit({ description })} />
      </div>
      <div className="edit-row">
        <label className="edit-label">Flavor</label>
        <textarea className="edit-textarea edit-flavor" value={flavor} rows={2}
          onChange={e => setFlavor(e.target.value)}
          onBlur={() => flavor !== (talent.flavor || '') && commit({ flavor })} />
      </div>
      <div className="edit-row">
        <label className="edit-label">Tags <span style={{ opacity: 0.6 }}>(semicolon-sep)</span></label>
        <input className="edit-input" type="text" value={tagsStr}
          onChange={e => setTagsStr(e.target.value)}
          onBlur={() => tagsStr !== (talent.tags || '').toString() && commit({ tags: tagsStr })} />
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {hasEdits && (
          <button className="btn btn-ghost" onClick={onResetTalent}>↶ Revert this talent</button>
        )}
        {onDeleteTalent && (
          <button className="btn btn-danger" onClick={() => {
            if (confirm(`Delete "${talent.name}" from this tree? This cannot be undone via the UI (only by clearing all talent edits).`)) {
              onDeleteTalent();
            }
          }}>🗑 Delete talent</button>
        )}
      </div>
    </div>
  );
}

function FilterBar({ search, setSearch }) {
  return (
    <div className="filter-bar parchment">
      <input type="search" placeholder="Search all talents…"
        value={search} onChange={e => setSearch(e.target.value)}
        className="search-input" />
    </div>
  );
}

function BuildSidebar({ character, atlases, talentIndex, onPickTree, currentTreeId }) {
  if (!character || !atlases) return null;

  const Char = window.Character;
  const ATTRS = ['STR','SPD','INT','WIL','AWA','PRE'];

  const derived = useM_p(
    () => Char.derive(character, atlases),
    [character, atlases]
  );

  const autoGranted = useM_p(
    () => Char.autoGrantedSkills(character, atlases),
    [character, atlases]
  );

  const [touchedSkills, setTouchedSkills] = useS_p(() => new Set());
  useE_p(() => { setTouchedSkills(new Set()); }, [currentTreeId]);

  function markTouched(name) {
    setTouchedSkills(prev => {
      if (prev.has(name)) return prev;
      const next = new Set(prev);
      next.add(name);
      return next;
    });
  }

  const skillRows = useM_p(() => {
    const merged = {};
    for (const [k, v] of Object.entries(character.skills || {})) {
      if ((v | 0) > 0) merged[k] = (merged[k] || 0) + (v | 0);
    }
    for (const [k, v] of Object.entries(autoGranted || {})) {
      merged[k] = (merged[k] || 0) + (v | 0);
    }
    for (const name of touchedSkills) {
      if (!(name in merged)) merged[name] = 0;
    }
    const COLOR_ORDER = { White: 0, Blue: 1, Black: 2, Red: 3, Green: 4 };
    return Object.entries(merged)
      .map(([name, rank]) => ({
        name, rank,
        isLeyline: name in COLOR_ORDER,
        granted: (autoGranted[name] | 0) > 0,
        grantedFloor: autoGranted[name] | 0,
      }))
      .sort((a, b) => {
        if (a.isLeyline !== b.isLeyline) return a.isLeyline ? -1 : 1;
        if (a.isLeyline) return COLOR_ORDER[a.name] - COLOR_ORDER[b.name];
        if (b.rank !== a.rank) return b.rank - a.rank;
        return a.name.localeCompare(b.name);
      });
  }, [character.skills, autoGranted, touchedSkills]);

  const attrsSpent = ATTRS.reduce((s, a) => s + (character.attributes[a] | 0), 0);
  const attrBudget = derived.levelRow.attrPoints;
  const skillRanksSpent = Object.entries(character.skills || {}).reduce((s, [, v]) => s + (v | 0), 0);
  const skillBudget = derived.levelRow.skillRanks;
  const maxSkillRank = derived.levelRow.maxSkillRank;

  function bumpAttr(a, dir) {
    const cur = character.attributes[a] | 0;
    const next = cur + dir;
    if (next < 0 || next > 10) return;
    if (dir > 0 && attrsSpent >= attrBudget) return;
    Char.setAttribute(a, next);
  }

  function bumpSkill(name, displayed, grantedFloor, dir) {
    let nextDisplayed = displayed + dir;
    if (nextDisplayed < grantedFloor) nextDisplayed = grantedFloor;
    if (nextDisplayed > maxSkillRank) nextDisplayed = maxSkillRank;
    const nextBase = Math.max(0, nextDisplayed - grantedFloor);
    const currentBase = Math.max(0, displayed - grantedFloor);
    if (dir > 0 && nextBase > currentBase && skillRanksSpent >= skillBudget) return;
    markTouched(name);
    Char.setSkill(name, nextBase);
  }

  const groups = useM_p(() => {
    const byKey = {};
    const ATLAS_ORDER = { heroic: 0, leyline: 1, deity: 2 };
    for (const tid of character.learnedTids) {
      const t = talentIndex && talentIndex.byTid && talentIndex.byTid[tid];
      if (!t) continue;
      const key = `${t.atlas}/${t.group}`;
      if (!byKey[key]) byKey[key] = { atlas: t.atlas, group: t.group, color: t.color, treeId: key, talents: [] };
      byKey[key].talents.push({
        tid: t.tid,
        name: t.name,
        isKey: !!t.isKey,
        atLevel: character.learnedAt[tid] | 0,
      });
    }
    const arr = Object.values(byKey);
    arr.sort((a, b) => {
      const oa = ATLAS_ORDER[a.atlas] ?? 99;
      const ob = ATLAS_ORDER[b.atlas] ?? 99;
      if (oa !== ob) return oa - ob;
      return a.group.localeCompare(b.group);
    });
    for (const g of arr) {
      g.talents.sort((a, b) => {
        if (a.isKey !== b.isKey) return a.isKey ? -1 : 1;
        if (a.atLevel !== b.atLevel) return a.atLevel - b.atLevel;
        return a.name.localeCompare(b.name);
      });
    }
    return arr;
  }, [character.learnedTids, character.learnedAt, talentIndex]);

  const budget = derived.budget;
  const totalLearned = character.learnedTids.size;

  return (
    <aside className="build-sidebar parchment">
      <div className="build-sidebar-head">
        <span className="rubric build-sidebar-title">Build</span>
        <span className="build-sidebar-level-stepper" title="Level">
          <button className="pip-btn pip-btn-mini" onClick={() => Char.setLevel(character.level - 1)}
            disabled={character.level <= 1}>−</button>
          <span className="small-caps muted build-sidebar-level">L{character.level}</span>
          <button className="pip-btn pip-btn-mini" onClick={() => Char.setLevel(character.level + 1)}
            disabled={character.level >= 20}>+</button>
        </span>
        <span className={'build-sidebar-budget' + (budget.over ? ' over' : '')}
          title={`${budget.spent} of ${budget.totalAvailable} talents spent`}>
          {budget.spent}<span className="muted">/{budget.totalAvailable}</span>
        </span>
      </div>

      <section className="build-sidebar-section build-sidebar-attrs-section">
        <h4 className="small-caps build-sidebar-h">
          Attributes <span className="muted">({attrsSpent}/{attrBudget})</span>
        </h4>
        <div className="build-sidebar-attrs">
          {ATTRS.map(a => {
            const v = character.attributes[a] | 0;
            const overBudget = attrsSpent >= attrBudget;
            return (
              <div key={a} className="build-sidebar-attr">
                <button className="pip-btn pip-btn-mini" onClick={() => bumpAttr(a, -1)}
                  disabled={v <= 0} title={`${a} −1`}>−</button>
                <span className="build-sidebar-attr-label small-caps">{a}</span>
                <span className="build-sidebar-attr-val mono">{v}</span>
                <button className="pip-btn pip-btn-mini" onClick={() => bumpAttr(a, +1)}
                  disabled={overBudget || v >= 10}
                  title={overBudget ? 'Attribute budget exhausted' : `${a} +1`}>+</button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="build-sidebar-section">
        <h4 className="small-caps build-sidebar-h">
          Skills <span className="muted">({skillRanksSpent}/{skillBudget})</span>
        </h4>
        {skillRows.length === 0 ? (
          <div className="muted build-sidebar-empty">No ranks allocated.</div>
        ) : (
          <ul className="build-sidebar-skills">
            {skillRows.map(s => {
              const overBudget = skillRanksSpent >= skillBudget;
              const atFloor = s.rank <= s.grantedFloor;
              const atCap = s.rank >= maxSkillRank;
              return (
                <li key={s.name} className={'build-sidebar-skill' + (s.isLeyline ? ` ll-${s.name.toLowerCase()}` : '')}>
                  <span className="build-sidebar-skill-name">
                    {s.isLeyline && <span className={`mini-pip pip-${s.name.toLowerCase()}`} />}
                    {s.name}
                    {s.granted && <span className="muted" title="Auto-granted from a Key"> ★</span>}
                  </span>
                  <span className="build-sidebar-skill-stepper">
                    <button className="pip-btn pip-btn-mini" onClick={() => bumpSkill(s.name, s.rank, s.grantedFloor, -1)}
                      disabled={atFloor}
                      title={atFloor ? (s.granted ? 'Granted minimum' : 'Already at 0') : `${s.name} −1`}>−</button>
                    <span className="build-sidebar-skill-rank">{s.rank}</span>
                    <button className="pip-btn pip-btn-mini" onClick={() => bumpSkill(s.name, s.rank, s.grantedFloor, +1)}
                      disabled={overBudget || atCap}
                      title={atCap ? `At max rank (${maxSkillRank})` : overBudget ? 'Skill-rank budget exhausted' : `${s.name} +1`}>+</button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="build-sidebar-section">
        <h4 className="small-caps build-sidebar-h">
          Learned Talents <span className="muted">({totalLearned})</span>
        </h4>
        {groups.length === 0 ? (
          <div className="muted build-sidebar-empty">Nothing learned yet.</div>
        ) : (
          <div className="build-sidebar-groups">
            {groups.map(g => (
              <div key={g.treeId} className="build-sidebar-group" data-color={g.color}>
                <button
                  className={'build-sidebar-group-head' + (g.treeId === currentTreeId ? ' is-current' : '')}
                  onClick={() => onPickTree && onPickTree(g.treeId)}
                  title={`Open ${g.group} tree`}>
                  <span className={`mini-pip pip-${(g.color || '').toLowerCase()}`} />
                  <span className="build-sidebar-group-name">{g.group}</span>
                  <span className="muted build-sidebar-group-atlas">{g.atlas}</span>
                </button>
                <ul className="build-sidebar-talents">
                  {g.talents.map(t => (
                    <li key={t.tid} className="build-sidebar-talent">
                      <span className="build-sidebar-talent-name">
                        {t.isKey && <span className="pill key-pill build-sidebar-key">Key</span>}
                        {t.name}
                      </span>
                      <span className="muted build-sidebar-talent-level">L{t.atLevel || '?'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

Object.assign(window, { TalentDetail, FilterBar, BuildSidebar });
