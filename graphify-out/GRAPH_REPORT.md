# Graph Report - ai-for-developers  (2026-11-04)

## Corpus Check
- Corpus is ~5,294 words - fits in a single context window. You may not need a graph.

## Summary
- 188 nodes · 289 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Pages and Site Helpers
- Astro Architecture and Domain Docs
- Build Config and Dependencies
- CI Deploy Jobs
- Pages Deploy Workflow
- React Islands (Player, Filter)
- GitHub Issue Workflow
- TypeScript Config
- Package Scripts
- Content Collections Schema
- Favicon Brand Mark
- Callout Component
- Slide Component

## God Nodes (most connected - your core abstractions)
1. `ADR 0001: Astro with React Islands` - 8 edges
2. `Issue Tracker: GitHub (docs/agents/issue-tracker.md)` - 8 edges
3. `Deck: What Is Agentic Engineering?` - 8 edges
4. `url()` - 7 edges
5. `getEssays()` - 7 edges
6. `formatDate()` - 7 edges
7. `Domain Docs (docs/agents/domain.md)` - 7 edges
8. `scripts` - 6 edges
9. `getDecks()` - 6 edges
10. `deploy` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Deck: What Is Agentic Engineering?` --references--> `Slide Layouts (default, title, section, statement)`  [INFERRED]
  src/content/decks/what-is-agentic-engineering/index.mdx → README.md
- `Issue Tracker: GitHub (docs/agents/issue-tracker.md)` --conceptually_related_to--> `Spec as Definition of Done`  [INFERRED]
  docs/agents/issue-tracker.md → src/content/essays/why-your-agent-needs-a-spec.md
- `Astro Dev Server Background Mode` --conceptually_related_to--> `Astro Framework`  [INFERRED]
  AGENTS.md → docs/adr/0001-astro-with-react-islands.md
- `Deck: What Is Agentic Engineering?` --implements--> `Deck`  [INFERRED]
  src/content/decks/what-is-agentic-engineering/index.mdx → GLOSSARY.md
- `Essay: Why Your Agent Needs a Spec` --implements--> `Essay`  [INFERRED]
  src/content/essays/why-your-agent-needs-a-spec.md → GLOSSARY.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Content Model Vocabulary (Topic, Deck, Slide, Essay)** — glossary_topic, glossary_deck, glossary_slide, glossary_essay [EXTRACTED 1.00]
- **Astro Content-first Site Architecture** — docs_adr_0001_astro_with_react_islands_astro, docs_adr_0001_astro_with_react_islands_react_islands, docs_adr_0001_astro_with_react_islands_content_collections, readme_mdx_components, readme_topics_yaml [INFERRED 0.85]
- **Agentic Engineering Guardrails** — src_content_decks_what_is_agentic_engineering_index_guardrails, src_content_essays_why_your_agent_needs_a_spec_spec_as_definition_of_done, src_content_essays_why_your_agent_needs_a_spec_write_spec_first, src_content_decks_what_is_agentic_engineering_index_agents_as_teammates [INFERRED 0.85]

## Communities (13 total, 2 thin omitted)

### Community 0 - "Pages and Site Helpers"
Cohesion: 0.13
Nodes (26): Props, Props, Props, nav, Props, deckUrl(), essayUrl(), formatDate() (+18 more)

### Community 1 - "Astro Architecture and Domain Docs"
Cohesion: 0.09
Nodes (27): Astro Dev Server Background Mode, Astro Documentation (docs.astro.build), ADR 0001: Astro with React Islands, Astro Framework, Content Collections with Schema-checked Frontmatter, Rejected React-first Frameworks (Next.js, React Router v7, Vike), Domain Docs (docs/agents/domain.md), /domain-modeling skill (+19 more)

### Community 2 - "Build Config and Dependencies"
Cohesion: 0.09
Nodes (32): dependencies, astro@^7.4.5, @astrojs/markdown-satteri@^0.4.6, @astrojs/mdx@^8.1.2, @astrojs/react@^7.1.2, react-dom@^19.3.1, tailwindcss@^4.3.4, @tailwindcss/vite@^4.3.4 (+24 more)

### Community 3 - "CI Deploy Jobs"
Cohesion: 0.12
Nodes (18): runs-on, steps, environment, needs, runs-on, steps, name, url (+10 more)

### Community 4 - "Pages Deploy Workflow"
Cohesion: 0.15
Nodes (12): concurrency, cancel-in-progress, group, name, on, push, workflow_dispatch, permissions (+4 more)

### Community 5 - "React Islands (Player, Filter)"
Cohesion: 0.20
Nodes (8): react@^19.3.1, react, DeckPlayer(), indexFromHash(), Props, FilterEssay, FilterTopic, Props

### Community 6 - "GitHub Issue Workflow"
Cohesion: 0.24
Nodes (9): GitHub Issues Tracker (mbychkowski/ai-for-developers), Issue Tracker: GitHub (docs/agents/issue-tracker.md), Blocking via Native Issue Dependencies, Frontier Query, gh CLI, Pull Requests as a Triage Surface, Sub-issues, Wayfinder Map Issue (+1 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.25
Nodes (7): astro/tsconfigs/strict, compilerOptions, jsx, jsxImportSource, exclude, extends, include

### Community 8 - "Package Scripts"
Cohesion: 0.33
Nodes (6): scripts, astro, build, check, dev, preview

### Community 9 - "Content Collections Schema"
Cohesion: 0.33
Nodes (5): collections, decks, essays, topicRefs, topics

### Community 10 - "Favicon Brand Mark"
Cohesion: 0.67
Nodes (3): favicon.svg (site favicon), "AI" Brand Mark (white bold 'AI' on dark navy rounded square), Brand Palette (#1b1f2e dark navy, #f8f7f3 off-white)

## Knowledge Gaps
- **14 isolated node(s):** `astro/tsconfigs/strict`, `Astro Documentation (docs.astro.build)`, `GitHub Pages Deployment`, `Content Directory Layout (src/content)`, `Draft Content Flag` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 70 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React Islands (Player, Filter)` to `Build Config and Dependencies`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `ADR 0001: Astro with React Islands` (e.g. with `Flag ADR Conflicts` and `README.md`) actually correct?**
  _`ADR 0001: Astro with React Islands` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `astro/tsconfigs/strict`, `Astro Documentation (docs.astro.build)`, `GitHub Pages Deployment` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pages and Site Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.1294871794871795 - nodes in this community are weakly interconnected._
- **Why does `astro` connect `Build Config and Dependencies` to `Content Collections Schema`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Deck: What Is Agentic Engineering?` (e.g. with `README.md` and `Deck`) actually correct?**
  _`Deck: What Is Agentic Engineering?` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Astro Architecture and Domain Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.08907563025210084 - nodes in this community are weakly interconnected._