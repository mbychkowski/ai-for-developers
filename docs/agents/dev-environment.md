# Dev environment

Known setup problems on this machine and their fixes. Run these once per session/worktree as needed.

## pnpm is not installed globally

The repo pins pnpm via `packageManager` in `package.json`. Enable the corepack shim in a user-writable directory that is already on `PATH`:

```bash
corepack enable --install-directory ~/.local/bin pnpm
pnpm --version
```

Don't use `/tmp` for the shim; it disappears on reboot.

## Playwright can't install browsers (`EACCES` on `/opt/playwright`)

The environment sets `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright`, which isn't writable. Point it at a user cache directory:

```bash
export PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"
pnpm exec playwright install chromium
```

Set the same variable when running the tests locally.

## TypeScript must stay on ^6

`astro check` (`pnpm check`) does not support TypeScript 7 yet and fails with "does not currently support TypeScript 7.0". Keep `typescript` at `^6` until `@astrojs/check` supports 7.

## graphify-out/ is local only

`graphify-out/` is git-ignored. The graphify git hooks rebuild it after commits and checkouts. In a fresh worktree, run `graphify update .` to build it.
