# Tree profiles — raw agent output, 2026-09-09

**These are agent outputs, not measurements. No script regenerates them.** Each file is one of the
21 talent-tree profiles from Workflow run **`wf_691be1e4-540`**, exported verbatim from that run's
`result.profiles`:

```
{ run, tree, correctionCount, profile, corrections }
```

* `profile` — the 15-axis capability scores, damage accounting, power by depth, sustainability,
  unique ownership, gaps, weak talents, intent drift, keywords, cross-tree hooks.
* `corrections` — every change the two adversarial challenge passes made to the profile, with the
  field, the old value, the new value and the reason. **780 in total** (31–42 per tree). This is
  the only place they are recorded.

How each profile was made: one agent read the tree's dossier, its path description and both design
guides and wrote the profile; a forensic-recount agent attacked the damage counts, depths, dice and
costs; a comparative agent then checked every "only tree that…" claim against the other twenty.

## Two things to know before trusting a number here

**That run's other phases are not valid.** `wf_691be1e4-540` reports `status: completed`, but its
`logs[]` show all 20 downstream agents — every cross-cut analysis, both critics and all four option
sets — failed on a session usage limit. Only its profiles are real. The cross-cut of record is
`wf_0b59b6ca-5bc`, exported to `../crosscut/`.

**The cross-cut read the on-disk copies of these profiles, which differ in prose for 13 trees.**
The profile agents also wrote their work to scratch files, and `make-crosscut.js` built the
cross-cut's digest from those files, not from this run's return value. Diffed field by field, the
two versions agree on **every axis score and every damage count for all 21 trees**; they differ
only in narrative fields (intent drift, unique ownership, gaps, hooks, weak-talent lists) for
White, Red, Envoy, Agent, Scholar, Chaos, Order, Civilization, Death, Destruction, Fate, Black and
Knowledge. The files here are the run's validated return value, because it is the only source that
carries the corrections. The capability matrix and every census in `../README.md` rest on the
fields the two versions agree on.

**Several profile claims were later corrected.** Profiles were written before the level model was
fixed (43 talents were mis-levelled, 37 of them heroic) and before the cross-cut ran, so any
`earliestLevel`-based reasoning or "only tree" claim in here can be stale. `../README.md` and
`EDHA_RULINGS.md` are the corrected record.
