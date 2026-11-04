# Graph Report - ai-for-developers  (2026-11-04)

## Corpus Check
- 8 files · ~1,801 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 42 nodes · 56 edges · 9 communities (6 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2fc6d8b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AGENTS.md
- README.md
- Domain Docs (docs/agents/domain.md)
- Worktrees
- GLOSSARY.md
- ADR 0001: Astro with React Islands
- GitHub Issue Workflow
- topics.yaml curated Topic list
- Slide

## God Nodes (most connected - your core abstractions)
1. `ADR 0001: Astro with React Islands` - 8 edges
2. `Domain Docs (docs/agents/domain.md)` - 7 edges
3. `Issue Tracker: GitHub (docs/agents/issue-tracker.md)` - 7 edges
4. `Topic` - 5 edges
5. `Worktrees` - 4 edges
6. `Slide` - 4 edges
7. `Deck` - 3 edges
8. `Essay` - 3 edges
9. `topics.yaml curated Topic list` - 3 edges
10. `Wayfinding Operations (/wayfinder)` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Astro Dev Server Background Mode` --conceptually_related_to--> `Astro Framework`  [INFERRED]
  AGENTS.md → docs/adr/0001-astro-with-react-islands.md
- `topics.yaml curated Topic list` --conceptually_related_to--> `Content Collections with Schema-checked Frontmatter`  [INFERRED]
  README.md → docs/adr/0001-astro-with-react-islands.md
- `ADR 0001: Astro with React Islands` --references--> `Essay`  [EXTRACTED]
  docs/adr/0001-astro-with-react-islands.md → GLOSSARY.md
- `ADR 0001: Astro with React Islands` --references--> `Topic`  [EXTRACTED]
  docs/adr/0001-astro-with-react-islands.md → GLOSSARY.md
- `React Islands` --references--> `Slide`  [EXTRACTED]
  docs/adr/0001-astro-with-react-islands.md → GLOSSARY.md

## Hyperedges (group relationships)
- **Content Model Vocabulary (Topic, Deck, Slide, Essay)** — glossary_topic, glossary_deck, glossary_slide, glossary_essay [EXTRACTED 1.00]
- **Astro Content-first Site Architecture** — docs_adr_0001_astro_with_react_islands_astro, docs_adr_0001_astro_with_react_islands_react_islands, docs_adr_0001_astro_with_react_islands_content_collections, readme_mdx_components, readme_topics_yaml [INFERRED 0.85]

## Communities (9 total, 3 thin omitted)

### Community 0 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Astro Dev Server Background Mode, Astro Documentation (docs.astro.build), GitHub Issues Tracker (mbychkowski/ai-for-developers), Astro Framework, gh CLI

### Community 1 - "README.md"
Cohesion: 0.29
Nodes (6): Content Directory Layout (src/content), Draft Content Flag, GitHub Pages Deployment, MDX Deck Components (Slide, Callout, TwoColumn), pnpm / Node 22 Toolchain, Slide Layouts (default, title, section, statement)

### Community 2 - "Domain Docs (docs/agents/domain.md)"
Cohesion: 0.40
Nodes (4): Domain Docs (docs/agents/domain.md), /domain-modeling skill, GLOSSARY-MAP.md (multi-context), Single-context Repo Structure

### Community 3 - "Worktrees"
Cohesion: 0.40
Nodes (4): Lifecycle, Naming, Rules, Worktrees

### Community 4 - "GLOSSARY.md"
Cohesion: 0.83
Nodes (3): Deck, Essay, Topic

### Community 6 - "GitHub Issue Workflow"
Cohesion: 0.32
Nodes (7): Issue Tracker: GitHub (docs/agents/issue-tracker.md), Blocking via Native Issue Dependencies, Frontier Query, Pull Requests as a Triage Surface, Sub-issues, Wayfinder Map Issue, Wayfinding Operations (/wayfinder)

## Knowledge Gaps
- **11 isolated node(s):** `Rejected React-first Frameworks (Next.js, React Router v7, Vike)`, `/domain-modeling skill`, `GLOSSARY-MAP.md (multi-context)`, `Single-context Repo Structure`, `Content Directory Layout (src/content)` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 16 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Issue Tracker: GitHub (docs/agents/issue-tracker.md)` connect `GitHub Issue Workflow` to `AGENTS.md`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `ADR 0001: Astro with React Islands` (e.g. with `Flag ADR Conflicts` and `README.md`) actually correct?**
  _`ADR 0001: Astro with React Islands` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Rejected React-first Frameworks (Next.js, React Router v7, Vike)`, `/domain-modeling skill`, `GLOSSARY-MAP.md (multi-context)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `Domain Docs (docs/agents/domain.md)` connect `Domain Docs (docs/agents/domain.md)` to `AGENTS.md`, `GLOSSARY.md`, `ADR 0001: Astro with React Islands`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Why does `ADR 0001: Astro with React Islands` connect `ADR 0001: Astro with React Islands` to `AGENTS.md`, `README.md`, `GLOSSARY.md`, `topics.yaml curated Topic list`, `Slide`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._