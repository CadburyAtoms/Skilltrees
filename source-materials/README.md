# Source Materials

This folder holds legacy inputs, references, exports, and scratch materials that
were previously kept in `uploads/`.

The live app should not depend on files in this folder. Runtime data belongs in
`data/`, app code belongs in `src/`, and disposable/generated exports should go
outside the repository or under an ignored local folder such as `exports/`.

**`radiant-orders.json` is parked data, not live data.** The nine Knights Radiant order trees
(225 rows) that used to sit in `data/cosmere.json` beside the six Edha heroic paths. Nothing in
the repo ever read them — the build, the primer and the validator all filter that file to the six
paths — so they were parked here on 2026-09-05 (TODO_REPO_HYGIENE #22, ruling PM-R3). The file
carries its own `_note` / `_unpark` header.

**Two files here are superseded skill copies.** `phrasing-verifier-SKILL.md` and
`talent-balance-SKILL.md` predate the repo's `.claude/skills/` folder and have since
diverged from the live versions there. They carry a SUPERSEDED banner; treat them as
history, never as instructions.
