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
  editMode, onEdit, origName, hasEdits, onResetTalent,
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

function TalentEditor({ talent, origName, hasEdits, onClose, onEdit, onResetTalent, treeColumns }) {
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
      {hasEdits && (
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-ghost" onClick={onResetTalent}>↶ Revert this talent</button>
        </div>
      )}
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

Object.assign(window, { TalentDetail, FilterBar });
