## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (mbychkowski/ai-for-developers) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.

### Worktrees

Every issue is worked in its own git worktree at `../ai-for-developers.worktrees/issue-NN` on branch `issue-NN/<short-description>`, merged via a PR containing `Closes #N`. Chores (non-ticket work: tooling, CI, docs) use `chore-<desc>` / `chore/<desc>` with the same protocol. `main` is protected; never commit to it directly. See `docs/agents/worktrees.md`.

### Dev environment

Known setup fixes (pnpm via corepack, Playwright browsers path, TypeScript ^6): see `docs/agents/dev-environment.md`.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
