# ai-for-developers

Decks and Essays on building software with AI, published as a static site at
<https://mbychkowski.github.io/ai-for-developers/>.

See [GLOSSARY.md](./GLOSSARY.md) for domain vocabulary (Deck, Slide, Essay, Topic) and
[docs/adr/](./docs/adr/) for architecture decisions.

## Develop

Requires Node 22+ and pnpm (`corepack enable`).

```sh
pnpm install   # install dependencies
pnpm dev       # start local dev server at http://localhost:4321/ai-for-developers/
pnpm build     # build static site in dist/
pnpm test      # run end-to-end Playwright tests against previewed build
pnpm check     # type-check .astro, .ts, and content frontmatter
```

### Playwright Browsers

Playwright browsers are configured to install and run from a user-writable directory (`~/.cache/ms-playwright`), avoiding permission issues with system directories:

```sh
export PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"
pnpm exec playwright install chromium
```

## Content

```
src/content/
├── topics.yaml            # curated Topic list
└── essays/<essay>.md      # Markdown essays
```

- **Topic**: defined in `src/content/topics.yaml` with `name` and `description`.
- **Essay**: markdown file in `src/content/essays/<essay>.md` with frontmatter:
  - `title`: string
  - `description`: string
  - `published`: YYYY-MM-DD
  - `topics`: list of topic IDs (validated against `topics.yaml`)

## CI & Deployment

Pushing to `main` triggers GitHub Actions workflows:
- `.github/workflows/ci.yml`: runs `pnpm check`, `pnpm build`, and `pnpm test` on PRs and pushes to `main`.
- `.github/workflows/deploy.yml`: runs checks, builds, tests, and deploys to GitHub Pages on push to `main`. Deploy is skipped if tests fail.
