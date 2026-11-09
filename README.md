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
├── decks/<deck>/index.mdx # MDX Decks
└── essays/<essay>.md      # Markdown essays
```

- **Topic**: defined in `src/content/topics.yaml` as a curated dictionary keyed by topic ID:
  - `name`: string (display name, e.g. `Agentic Engineering`)
  - `description`: string (concise explanation of the topic scope)
  - Every Deck and Essay must reference at least one valid Topic ID from this list.
- **Essay**: dated prose piece in `src/content/essays/<essay>.md` (or `.mdx`) read as a single scrolling page:
  - Frontmatter:
    - `title`: string
    - `description`: string
    - `published`: YYYY-MM-DD (Essays are dated and published once)
    - `topics`: list of topic IDs (validated against `topics.yaml`)
    - `draft`: boolean (optional, default `false`)
  - Content: written in standard Markdown/MDX with headings, paragraphs, lists, callouts, and code blocks.
- **Deck**: MDX document in `src/content/decks/<deck>/index.mdx` telling a narrative as a sequence of Slides:
  - Frontmatter:
    - `title`: string
    - `description`: string
    - `updated`: YYYY-MM-DD (Decks are evergreen, revised in place)
    - `topics`: list of topic IDs (validated against `topics.yaml`)
    - `draft`: boolean (optional, default `false`)
  - **Slide**: each screen is wrapped in `<Slide>` (fixed 1280×720 canvas, scaled to fit the stage). Body typography defaults to 36px (keep body text at least ~32px) so it remains legible when scaled.
    - Layouts (`layout` prop on `<Slide>`):
      - `default` (or omitted): standard Slide layout with light canvas and dark ink text.
      - `title`: opening Slide of a Deck with dark stage background, radial gradient accents, and display typography.
      - `section`: divider Slide between chapters with accent background and white text.
      - `statement`: centered big idea with large display typography (64px).
  - **Deck Components** (available in MDX without imports):
    - `<Callout tone="accent|neutral">`: highlighted aside with 10px left border. `accent` tone (default) uses the accent color; `neutral` tone uses muted borders.
    - `<TwoColumn>`: side-by-side two-column layout using named slots `<Fragment slot="left">` and `<Fragment slot="right">`.
  - **Slide Deep Links (`#n`)**:
    - Every Slide is addressable via a 1-based index hash fragment, e.g. `/decks/<deck>/#3` links directly to the third Slide.
    - Deep links update the URL hash in the browser address bar during navigation, and opening or sharing a URL with `#n` loads directly to that Slide.

## CI & Deployment

Pushing to `main` triggers GitHub Actions workflows:
- `.github/workflows/ci.yml`: runs `pnpm check`, `pnpm build`, and `pnpm test` on PRs and pushes to `main`.
- `.github/workflows/deploy.yml`: runs checks, builds, tests, and deploys to GitHub Pages on push to `main`. Deploy is skipped if tests fail.
