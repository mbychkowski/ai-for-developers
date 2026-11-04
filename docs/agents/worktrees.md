# Worktrees

Every issue is implemented in its own git worktree. `main` stays clean; one issue = one worktree = one branch = one PR.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Worktree directory | `../ai-for-developers.worktrees/issue-NN` (two-digit padding; three digits from #100) | `../ai-for-developers.worktrees/issue-02` |
| Branch | `issue-NN/<kebab-description>` (2–4 words) | `issue-02/essay-tracer` |
| PR title | `#N: <ticket title>` | `#2: Tracer Essay end to end` |
| PR body | Must contain `Closes #N` (see the `pr` skill) | |

Worktrees live **outside** the repo so `tsconfig.json`'s `**/*`, Astro, and graphify don't scan them.

## Lifecycle

```bash
# 1. Start: branch from latest main
git fetch origin
git worktree add ../ai-for-developers.worktrees/issue-02 -b issue-02/essay-tracer origin/main
cd ../ai-for-developers.worktrees/issue-02
pnpm install

# 2. Work: commit on the issue branch, then push and open a PR
git push -u origin issue-02/essay-tracer
gh pr create --base main --title "#2: Tracer Essay end to end" --body-file <body.md>   # body contains "Closes #2"

# 3. Finish: after the PR merges
cd /path/to/ai-for-developers
git worktree remove ../ai-for-developers.worktrees/issue-02
git branch -d issue-02/essay-tracer
git fetch --prune
```

## Rules

- Never implement an issue directly on `main` or in the primary checkout.
- Blocked issues (see native "blocked by" links) start only after their blockers are merged; branch from the updated `origin/main`.
- Unblocked siblings (e.g. #3, #4, #5 after #2) may run in parallel worktrees.
- Dev servers in parallel worktrees need distinct ports: `astro dev --background --port 43NN`.
- `git worktree list` shows active worktrees; `git worktree prune` cleans stale entries.
