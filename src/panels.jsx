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

      {/* Unified Requirements: edges + parsed string clauses in one block.
          A string AND-group containing exactly one talent:Name clause whose
          name matches an edge target is dropped (same semantic as the edge). */}
      {(() => {
        const edges = edgePrereqs || [];
        const groups = (prereqResult && prereqResult.groups) || [];
        const edgeNames = new Set(edges.map(p => (p.name || '').toLowerCase()));
        const filteredGroups = groups.filter(g => {
          if (!g.clauses || g.clauses.length !== 1) return true;
          const c = g.clauses[0];
          if (c.kind !== 'talent') return true;
          return !edgeNames.has((c.talentName || '').toLowerCase());
        });
        if (edges.length === 0 && filteredGroups.length === 0) return null;
        return (
          <div className="prereq-block">
            <span className="label">Requirements</span>
            <div className="prereq-groups">
              {edges.map((p, i) => {
                const got = character && character.learnedTids.has(p.tid);
                return (
                  <div key={`edge-${i}`} className={'prereq-group' + (got ? ' met' : ' unmet')}>
                    <span className={'prereq-chip prereq-talent' + (got ? ' met' : ' unmet')}>
                      {got ? '✓' : '○'} {p.name}
                    </span>
                  </div>
                );
              })}
              {filteredGroups.map((g, gi) => (
                <div key={`grp-${gi}`} className={'prereq-group' + (g.passed ? ' met' : ' unmet')}>
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
        );
      })()}

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
            {canLearn ? 'Learn Talent' : 'Requirements not met'}
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

/* Build Sidebar — appears on the left of the tree view in Build mode.
   Shows the character's current snapshot: level, talent budget, skill ranks,
   and learned talents grouped by atlas/tree. Clicking a talent jumps to its tree. */
function BuildSidebar({ character, atlases, talentIndex, onPickTree, currentTreeId }) {
  if (!character || !atlases) return null;

  const derived = useM_p(
    () => window.Character.derive(character, atlases),
    [character, atlases]
  );

  const autoGranted = useM_p(
    () => window.Character.autoGrantedSkills(character, atlases),
    [character, atlases]
  );

  // Merge explicit ranks + auto-granted, then filter to rank > 0
  const skillRows = useM_p(() => {
    const merged = {};
    for (const [k, v] of Object.entries(character.skills || {})) {
      if ((v | 0) > 0) merged[k] = (merged[k] || 0) + (v | 0);
    }
    for (const [k, v] of Object.entries(autoGranted || {})) {
      merged[k] = (merged[k] || 0) + (v | 0);
    }
    const COLOR_ORDER = { White: 0, Blue: 1, Black: 2, Red: 3, Green: 4 };
    return Object.entries(merged)
      .map(([name, rank]) => ({
        name, rank,
        isLeyline: name in COLOR_ORDER,
        granted: (autoGranted[name] | 0) > 0,
      }))
      .sort((a, b) => {
        if (a.isLeyline !== b.isLeyline) return a.isLeyline ? -1 : 1;
        if (a.isLeyline) return COLOR_ORDER[a.name] - COLOR_ORDER[b.name];
        if (b.rank !== a.rank) return b.rank - a.rank;
        return a.name.localeCompare(b.name);
      });
  }, [character.skills, autoGranted]);

  // Learned talents grouped by atlas → group, sorted by learnedAt level then name.
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
        <div className="rubric build-sidebar-title">Build</div>
        <div className="small-caps muted">Level {character.level}</div>
      </div>

      <div className="build-sidebar-budget">
        <span className={'pill' + (budget.over ? ' warn-pill' : '')}>
          {budget.spent} / {budget.totalAvailable} talents
        </span>
      </div>

      <section className="build-sidebar-section">
        <h4 className="small-caps build-sidebar-h">Skills</h4>
        {skillRows.length === 0 ? (
          <div className="muted build-sidebar-empty">No ranks allocated.</div>
        ) : (
          <ul className="build-sidebar-skills">
            {skillRows.map(s => (
              <li key={s.name} className={'build-sidebar-skill' + (s.isLeyline ? ` ll-${s.name.toLowerCase()}` : '')}>
                <span className="build-sidebar-skill-name">
                  {s.isLeyline && <span className={`mini-pip pip-${s.name.toLowerCase()}`} />}
                  {s.name}
                  {s.granted && <span className="muted" title="Auto-granted from a Key"> ★</span>}
                </span>
                <span className="build-sidebar-skill-rank">{s.rank}</span>
              </li>
            ))}
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
