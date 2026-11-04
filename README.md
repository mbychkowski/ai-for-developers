# ai-for-developers

Decks and Essays on building software with AI, published as a static site at
<https://mbychkowski.github.io/ai-for-developers/>.

See [GLOSSARY.md](./GLOSSARY.md) for the vocabulary (Deck, Slide, Essay, Topic) and
[docs/adr/](./docs/adr/) for key decisions.

## Develop

Requires Node 22+ and pnpm (`corepack enable`).

```sh
pnpm install
pnpm dev       # http://localhost:4321/ai-for-developers/  (drafts visible)
pnpm build     # static site in dist/  (drafts excluded)
pnpm check     # type-check .astro, .ts, and content frontmatter
```

Pushing to `main` deploys to GitHub Pages via [.github/workflows/deploy.yml](./.github/workflows/deploy.yml).

## Add content

```
src/content/
├── topics.yaml                 # the curated Topic list
├── decks/<deck>/index.mdx      # one folder per Deck, images alongside
└── essays/<essay>.md           # one file per Essay
```

**Topic**: add an entry to `topics.yaml` (`id`, `name`, `description`).

**Essay**: `src/content/essays/<essay>.md`

```md
---
title: Why Your Agent Needs a Spec
description: One-line summary.
published: 2026-11-04
topics: [agentic-engineering]
draft: true # optional; hidden from production builds
---
```

**Deck**: `src/content/decks/<deck>/index.mdx`. Wrap each Slide in `<Slide>`. `Slide`, `Callout`, and
`TwoColumn` are available without imports.

```mdx
---
title: What Is Agentic Engineering?
description: One-line summary.
updated: 2026-11-04
topics: [agentic-engineering]
---

<Slide layout="title">
  # What Is Agentic Engineering?
</Slide>

<Slide>
  ## Why now?
  - Models can **plan**
  <Callout>Agents are teammates, not autocomplete.</Callout>
</Slide>
```

Slide layouts: `default`, `title`, `section`, `statement`. Slides are a fixed 1280×720 canvas; keep body
text at 32px or larger. Link to a Slide with `#n`, e.g. `/decks/<deck>/#3`.
