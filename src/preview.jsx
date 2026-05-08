/* preview.jsx — pre-save diff preview modal.

   Shown by App.jsx autoSave BEFORE writing to disk. Runs the merge in dry-run
   mode, displays a per-tree summary of what will change (field edits, layout
   moves, edge wirings, renames, phrasing autofixes) plus any validation
   errors/warnings, and offers Confirm / Cancel.

   This converts surprise saves into rejectable proposals, which is the only
   reliable defense against silent partial-save bugs (like the rowTreeId bug
   that shipped before this).

   Public API:
     window.SavePreview = ({ open, merged, report, phrasing, applyStats, validation, onConfirm, onCancel }) => <Modal/>
*/

(function () {
  const { useState } = React;

  function StatLine({ label, n, kind }) {
    if (!n) return null;
    return (
      <span className={'preview-stat preview-stat-' + (kind || 'info')}>
        <strong>{n}</strong> {label}
      </span>
    );
  }

  function SavePreview({ open, merged, report, phrasing, applyStats, validation, onConfirm, onCancel }) {
    const [confirming, setConfirming] = useState(false);

    if (!open) return null;

    const trees = (report && report.trees) || [];
    const renames = (report && report.renames) || [];
    const fixedPhrasing = (phrasing || []).filter(p => p.changed).length;
    const flaggedPhrasing = (phrasing || []).filter(p => p.flags && p.flags.length).length;
    const stats = applyStats || { rowsTouched: 0, rowsUnmatched: 0, changesByTree: {} };
    const errs = (validation && validation.errors) || [];
    const warns = (validation && validation.warnings) || [];

    // Detect the silent-partial-save anti-pattern: localStorage had pending
    // edits, but the merge didn't actually apply any field/layout/conn change.
    const totalChanges = Object.values(stats.changesByTree || {}).reduce((s, v) => s + (v.fields || 0) + (v.layout || 0) + (v.conns || 0), 0);
    const hadPending = trees.length > 0;
    const droppedSilently = hadPending && totalChanges === 0;

    return (
      <div className="promote-overlay" onClick={onCancel}>
        <div className="parchment promote-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
          <div className="promote-head">
            <div>
              <div className="small-caps muted">Confirm save</div>
              <h2 className="rubric">Review changes before writing</h2>
            </div>
            <button className="btn btn-ghost" onClick={onCancel} title="Cancel — your edits stay in this browser">✕</button>
          </div>

          {droppedSilently && (
            <div className="preview-warn-banner" style={{
              padding: '10px 14px', background: '#3a1a1a', color: '#f6efdf',
              border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #c87070',
              marginBottom: 12, borderRadius: 4
            }}>
              <strong>Heads up:</strong> you have pending edits in this browser, but the merge produced no row-level changes.
              That usually means a tree-id mismatch — your edits will be discarded if you confirm. Cancel and report this.
            </div>
          )}

          {errs.length > 0 && (
            <div className="preview-warn-banner" style={{
              padding: '10px 14px', background: '#3a1a1a', color: '#f6efdf',
              border: '1px solid rgba(255,255,255,0.12)', borderLeft: '3px solid #c87070',
              marginBottom: 12, borderRadius: 4
            }}>
              <strong>{errs.length} validation error{errs.length === 1 ? '' : 's'}.</strong> Save blocked. See details below.
            </div>
          )}

          <section className="promote-section">
            <h3 className="rubric">Summary</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
              <StatLine n={trees.length} label="trees with edits" kind="ok" />
              <StatLine n={renames.length} label="renames" kind="info" />
              <StatLine n={fixedPhrasing} label="phrasing fixed" kind="info" />
              <StatLine n={flaggedPhrasing} label="flagged" kind="warn" />
              <StatLine n={stats.rowsTouched} label="source rows matched" kind="info" />
              <StatLine n={stats.rowsUnmatched} label="rows unmatched" kind={stats.rowsUnmatched > 0 ? 'warn' : 'info'} />
              <StatLine n={errs.length} label="errors" kind="err" />
              <StatLine n={warns.length} label="warnings" kind="warn" />
            </div>
          </section>

          {trees.length > 0 && (
            <section className="promote-section">
              <h3 className="rubric">By tree</h3>
              <ul className="promote-tree-list">
                {trees.map(t => {
                  const ch = (stats.changesByTree && stats.changesByTree[t.treeId]) || { fields: 0, layout: 0, conns: 0 };
                  const noChanges = ch.fields === 0 && ch.layout === 0 && ch.conns === 0;
                  return (
                    <li key={t.treeId} className="promote-tree-row">
                      <span className="rubric">{t.label}</span>
                      <span className="muted small-caps" style={{ marginLeft: 8 }}>
                        {ch.fields} field · {ch.layout} layout · {ch.conns} edge
                        {noChanges && <span style={{ color: '#c87070' }}> — no changes applied (mismatch?)</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {renames.length > 0 && (
            <section className="promote-section">
              <h3 className="rubric">Renames ({renames.length})</h3>
              <ul className="promote-rename-list">
                {renames.map((r, i) => (
                  <li key={i}>
                    <span className="muted small-caps">{r.treeLabel}</span>
                    <div><span className="rubric">{r.oldName}</span> <span className="muted">→</span> <span className="rubric">{r.newName}</span></div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {errs.length > 0 && (
            <section className="promote-section">
              <h3 className="rubric" style={{ color: '#c87070' }}>Errors</h3>
              <ul className="promote-rename-list">
                {errs.slice(0, 30).map((e, i) => (
                  <li key={i}>
                    <span className="muted small-caps">{e.file}{e.idx >= 0 ? ` · row ${e.idx}` : ''}{e.name ? ` · ${e.name}` : ''}</span>
                    <div>{e.msg}</div>
                  </li>
                ))}
                {errs.length > 30 && <li className="muted">…and {errs.length - 30} more.</li>}
              </ul>
            </section>
          )}

          {warns.length > 0 && (
            <section className="promote-section">
              <h3 className="rubric">Warnings</h3>
              <ul className="promote-rename-list">
                {warns.slice(0, 12).map((w, i) => (
                  <li key={i}>
                    <span className="muted small-caps">{w.file}{w.idx >= 0 ? ` · row ${w.idx}` : ''}{w.name ? ` · ${w.name}` : ''}</span>
                    <div>{w.msg}</div>
                  </li>
                ))}
                {warns.length > 12 && <li className="muted">…and {warns.length - 12} more.</li>}
              </ul>
            </section>
          )}

          <section className="promote-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={onCancel} disabled={confirming}>Cancel</button>
            <button
              className="btn"
              disabled={confirming || errs.length > 0}
              onClick={async () => { setConfirming(true); try { await onConfirm(); } finally { setConfirming(false); } }}
              title={errs.length > 0 ? 'Fix validation errors first' : 'Write merged JSON to disk'}
            >
              {confirming ? 'Saving…' : '✓ Confirm save'}
            </button>
          </section>
        </div>
      </div>
    );
  }

  if (typeof window !== 'undefined') {
    window.SavePreview = SavePreview;
  }
})();
