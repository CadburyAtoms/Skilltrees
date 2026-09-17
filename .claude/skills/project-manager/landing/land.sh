#!/usr/bin/env bash
# Land a worker PR: merge origin/main into its branch (resolving the bookkeeping files), regenerate,
# gate, push, merge on green CI. usage: bash land.sh <pr-number> <branch>
set -u
PR="$1"; BR="$2"
REPO=/c/dev/Skilltrees; SC="$(dirname "$0")"; W="$TEMP/edha-land-$PR"
cd "$REPO" || exit 1
git fetch -q --prune origin || exit 1
rm -rf "$W"; git worktree prune
git worktree add -q --detach "$W" "origin/$BR" || { echo "worktree add failed"; exit 1; }
cd "$W" || exit 1
echo "== files vs main:"; git diff --stat "origin/main...HEAD" | tail -3
echo "== forbidden surfaces touched:"; git diff --name-only "origin/main...HEAD" | grep -E "^(docs/PM_BOARD.md|EDHA_FOUNDRY_HANDOFF.md)$" || echo none
if git merge --no-commit --no-ff origin/main > "$SC/merge-$PR.log" 2>&1; then
  echo "== merged clean"
else
  echo "== conflicts:"; git diff --name-only --diff-filter=U
  python "$SC/resolve.py" || { echo "RESOLVE FAILED — leaving worktree $W for a manual look"; exit 3; }
fi
# regenerate what is generated
if git diff --name-only origin/main...HEAD | grep -q "^module-src/scripts/engine/"; then node scripts/engine-assemble.js > /dev/null 2>&1 || { echo "engine-assemble failed"; exit 4; }; fi
node scripts/build-player-primer.js > /dev/null 2>&1 || echo "(player-primer rebuild reported an error — the gate will say)"
node scripts/build-canon-codex.js > /dev/null 2>&1 || echo "(canon-codex rebuild reported an error — the gate will say)"
node scripts/build-dashboard.js > /dev/null 2>&1 || { echo "build-dashboard failed"; exit 4; }
git add -A
if git diff --cached --quiet && git diff --quiet; then echo "== nothing to commit (already up to date)"; else
  git commit -q -m "$(printf 'Merge origin/main into %s — bookkeeping conflicts resolved by the PM (both deltas kept, count bumped; generated files regenerated)' "$BR")" || { echo "commit failed"; exit 5; }
fi
node scripts/gates.js > "$SC/gates-$PR.log" 2>&1; G=$?; echo "== gates exit $G ($(grep -E '^PASS ' "$SC/gates-$PR.log" | wc -l) pass)"
if [ "$G" != "0" ]; then grep -E "^(FAIL) " "$SC/gates-$PR.log"; grep -n -A4 "✗" "$SC/gates-$PR.log" | head -20; echo "GATES RED — not pushed; worktree $W kept"; exit 6; fi
git push -q origin "HEAD:$BR" || { echo "push failed"; exit 7; }
SHA=$(git rev-parse HEAD); echo "== pushed $SHA"
cd "$REPO"; git worktree remove --force "$W"; git worktree prune
for i in $(seq 1 30); do s=$(gh pr checks "$PR" --json name,bucket 2>/dev/null); if [ -n "$s" ] && ! echo "$s" | grep -q '"pending"'; then break; fi; sleep 20; done
echo "== checks: $(gh pr checks "$PR" --json name,bucket --jq '.[] | "\(.name): \(.bucket)"' 2>/dev/null | tr '\n' ' ')"
if gh pr checks "$PR" --json bucket --jq 'all(.bucket=="pass")' 2>/dev/null | grep -q true; then
  gh pr merge "$PR" --merge --match-head-commit "$SHA" 2>&1 | tail -1
  git pull -q --ff-only origin main; git branch -D "$BR" > /dev/null 2>&1; git fetch --prune -q origin
  echo "== MERGED #$PR at $(gh pr view "$PR" --json mergedAt --jq .mergedAt); main = $(git log --oneline -1 | cut -c1-7)"
else
  echo "CI NOT GREEN for #$PR — not merged"; exit 8
fi
