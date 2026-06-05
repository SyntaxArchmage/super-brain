# Product Requirements Document: Multi-Level Architecture & Face Page

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Product Name   | Super-Brain — Multi-Level Wiki Architecture            |
| Document Type  | Product Requirements Document (PRD)                    |
| Version        | 1.0 (Draft)                                            |
| Status         | Proposed                                               |
| Owner          | Albert                                                 |
| Last Updated   | 2026-06-05                                             |
| Depends On     | PRD-Personal-Knowledge-Base v1.1                       |

### Change Log

- **1.0** — Initial draft. Motivated by the MPV Research project which
  validated that the super-brain wiki framework naturally decomposes into
  independent per-topic wikis, revealing that the current flat architecture
  is one level too shallow for a multi-domain personal knowledge base.

---

## 1. Executive Summary

Super-Brain currently operates as a **single flat wiki** where all
knowledge domains (Compiler Infrastructure, HPC, AI, etc.) share one
taxonomy, one `data.js`, and one concept namespace. The MPV Research
project — a focused single-topic study built by simplifying super-brain's
architecture — demonstrated that **each research topic naturally forms a
complete, self-contained wiki** with its own taxonomy, pages, concepts,
and interactive tooling.

This PRD proposes evolving Super-Brain from a single wiki into a **wiki of
wikis**: a top-level **Face Page** serves as the entry hall for a personal
knowledge base that contains multiple independent **Topic Wikis**, each
structurally identical to the current super-brain site (or mpv-research).

The key insight: **super-brain is not a wiki — it is a container of
wikis**. Each research investigation (MLIR deep-dive, MPV car research,
AI serving survey, etc.) deserves its own isolated namespace, its own
taxonomy, and its own concept layer, while the container provides
cross-topic search, concept linking, and a unified reading experience.

## 2. Problem Statement

### 2.1 Current Pain Points

1. **Monolithic data.js growth** — As more domains are added, the single
   `data.js` file grows unboundedly (~115KB for 11 pages across 5 domains).
   A realistic personal knowledge base with 20+ topics would produce an
   unmanageable megabyte-scale file.

2. **Concept namespace collision** — Concepts from different domains share
   one `WIKI.concepts` object. A "Region" in MLIR (a Block container) has
   nothing to do with a "Region" in a geography topic. The flat namespace
   forces artificial disambiguation.

3. **Taxonomy soup** — A single left-nav taxonomy mixes heterogeneous
   domains. A researcher investigating MPV cars should not see Compiler
   Infrastructure in their sidebar, and vice versa.

4. **No independent evolution** — Adding a page to one topic forces a
   rebuild and potential conflict with all other topics, because they share
   one data file.

5. **Missing entry point** — The current index page is a simple card grid
   within a single wiki. It does not communicate "this is a multi-domain
   personal knowledge base" — it looks like one topic's table of contents.

### 2.2 Validation

The MPV Research project independently validated the architectural
hypothesis:

- Built in < 1 week by stripping super-brain to a single-topic wiki.
- Produced 16 in-depth articles across 9 research dimensions.
- Added domain-specific interactive tools (scorer, radar chart) that would
  have been impossible in a shared-infrastructure wiki.
- Proved that `taxonomy + pages + concepts` is the correct granularity for
  **one topic**, not for the entire knowledge base.

## 3. Goals and Non-Goals

### 3.1 Goals (G)

- **G1** Refactor the repository layout so each research topic is an
  independent directory with its own `data.js`, `app.js`, `styles.css`,
  and `index.html`.

- **G2** Build a **Face Page** — a top-level entry point that presents all
  topics as navigable cards, provides cross-topic search, and allows
  drilling into any topic's full wiki.

- **G3** Extract a **shared wiki framework** (`wiki-framework.js`,
  `wiki-styles.css`) that all topic wikis import, eliminating code
  duplication while allowing per-topic customization.

- **G4** Enable **per-topic interactive tooling** — each topic wiki can
  add domain-specific features (e.g., scorer for MPV, code playground for
  MLIR) without affecting other topics.

- **G5** Support **cross-topic concept referencing** — a global concept
  registry that allows concepts defined in one topic to be referenced from
  another (e.g., "Lowering" appears in both MLIR and Compiler-AI-Infra).

- **G6** Maintain **backward compatibility** — the current site at the
  GitHub Pages URL should continue to work during and after the migration.

- **G7** Support **file-level topic isolation** — changing one topic's
  content should not require modifying files in other topic directories.
  (Note: GitHub Pages deploys the whole repo atomically; true independent
  deployment requires a different hosting model and is a non-goal for v1.)

### 3.2 Non-Goals (NG)

- **NG1** Multi-user access control per topic. All topics are in one repo
  owned by one user.
- **NG2** Server-side rendering or dynamic backends. The entire site
  remains static (GitHub Pages).
- **NG3** Automated topic creation from raw materials. Topics are manually
  scaffolded. (Raw data ingestion is covered by the parent PRD.)
- **NG4** Cross-topic page linking (contributions). Each topic wiki is
  authored at a different point in time, and hard-linking pages across
  topics creates stale references that nobody maintains. Cross-topic
  discovery is handled indirectly through the shared concept registry
  (a reader exploring "Lowering" in MLIR can see that the same concept
  exists in Compiler-AI-Infra without a brittle page-to-page link).

---

## 4. Architecture

### 4.1 Current Architecture (v1.x)

```
super-brain/
└── site/
    ├── index.html
    ├── app.js          ← one rendering engine
    ├── styles.css      ← one stylesheet
    ├── data.js         ← ALL domains, ALL pages, ALL concepts
    └── data-cn.js      ← ALL translations
```

Problem: everything in one flat namespace. Adding a topic = editing the
same `data.js`. No isolation.

### 4.2 Proposed Architecture (v2.0)

```
super-brain/
├── site/
│   ├── index.html              ← Face Page entry
│   ├── face.js                 ← Face Page logic
│   ├── face.css                ← Face Page styles
│   └── topics/
│       ├── mlir/               ← Topic Wiki: MLIR
│       │   ├── index.html
│       │   ├── data.js         ← MLIR-only taxonomy, pages, concepts
│       │   ├── app.js          ← imports wiki-framework.js + topic customizations
│       │   └── styles.css      ← imports wiki-styles.css + topic additions
│       ├── mpv-research/       ← Topic Wiki: MPV
│       │   ├── index.html
│       │   ├── data.js
│       │   ├── app.js          ← includes scorer, radar chart
│       │   └── styles.css      ← includes scorer, table styles
│       ├── hpc-memory/
│       ├── ai-serving/
│       └── ...
├── shared/
│   ├── wiki-framework.js       ← Extracted rendering engine
│   ├── wiki-styles.css         ← Extracted base styles
│   └── concepts-global.json    ← Cross-topic concept registry
├── scripts/
│   ├── translate.js
│   └── build-registry.js       ← Builds concepts-global.json from all topics
└── docs/
```

### 4.3 Key Architectural Decisions

**Decision 1: Topics as directories, not separate repos.**

Topics live as subdirectories under `site/topics/`, not as separate
repositories or git submodules. This keeps the deployment simple (one
GitHub Pages site) and allows cross-topic features (global search, concept
linking) to work without cross-repo coordination.

**Decision 2: Shared framework via `<script>` tag (global variable pattern).**

Both super-brain and mpv-research use the `<script src="...">` pattern
with global variables (`WIKI`). This is intentional: it means
`open index.html` works in any browser without a bundler or HTTP server
(no CORS issues from `file://` + ES module imports). The shared framework
follows the same pattern:

```html
<!-- topic index.html -->
<script src="../../shared/wiki-framework.js"></script>
<script src="./data.js"></script>
<script src="./app.js"></script>
```

```javascript
// topic app.js
const engine = WikiEngine.create({
  data: WIKI,
  container: document.getElementById("wiki-shell"),
  features: {
    search: true,
    conceptRail: true,
    contributions: false,  // per-topic toggle
  }
});

// Topic-specific extensions
engine.onNavigate((pageId) => {
  if (pageId === "recommendation") injectRadarSection();
});

engine.start();
```

`WikiEngine` is exposed as a global by `wiki-framework.js`. This allows
each topic to opt into or out of features, and to add domain-specific
behavior without forking the framework.

> **Why not ES modules?** ES module `import` requires an HTTP server
> (browsers block cross-origin `file://` imports). Staying with `<script>`
> tags preserves the zero-build, double-click-to-open simplicity that
> both projects currently enjoy.

**Decision 3: Face Page is a separate application.**

The Face Page is not rendered by the wiki framework — it is its own
lightweight application that reads a **topic registry** (a JSON file
listing all topics with metadata) and renders the entry experience.

**Decision 4: Cross-topic concepts are opt-in references.**

A concept defined in `topics/mlir/data.js` can be referenced from
`topics/compiler-ai/data.js` via a `crossRef` field:

```javascript
concepts: {
  "dialect-conversion": {
    // ... full definition in mlir topic
  }
}

// In compiler-ai topic:
concepts: {
  "dialect-conversion": {
    crossRef: "mlir",  // "See mlir topic for full definition"
    role: "Supporting",
    summary: "..." // brief local summary
  }
}
```

The `build-registry.js` script aggregates all concepts into
`concepts-global.json` for the Face Page's cross-topic search.
This is a **CI optimization**: the Face Page can also dynamically load
each topic's `topic-meta.json` at runtime (slower, but works without
a build step for local development).

---

## 5. Face Page Design

### 5.1 Purpose

The Face Page is the **library entrance hall**. It answers three questions:

1. "What research topics exist in this knowledge base?"
2. "Which topic should I read right now?"
3. "Where is that concept/article I half-remember?"

### 5.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐                                               │
│  │ SB       │  Super Brain — Albert's Research Library       │
│  └──────────┘                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔍 Search across all topics...                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ── Research Topics ──────────────────────────────────────   │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐               │
│  │  MLIR Deep Dive   │  │  MPV Car Research │               │
│  │  ───────────────  │  │  ───────────────  │               │
│  │  11 articles      │  │  16 articles      │               │
│  │  33 concepts      │  │  20+ concepts     │               │
│  │  Updated: May 22  │  │  Updated: Jun 3   │               │
│  │  ████████░░ 80%   │  │  ██████████ 100%  │               │
│  └───────────────────┘  └───────────────────┘               │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐               │
│  │  HPC Memory       │  │  AI Serving       │               │
│  │  ───────────────  │  │  ───────────────  │               │
│  │  2 articles       │  │  2 articles       │               │
│  │  Draft            │  │  Draft            │               │
│  └───────────────────┘  └───────────────────┘               │
│                                                             │
│  ── Shared Concepts ─────────────────────────────────────   │
│  Operation · Dialect · Lowering · Value · Region · ...      │
│                                                             │
│  ── Recent Updates ──────────────────────────────────────   │
│  Jun 3  MPV: Added 充电服务 article                          │
│  May 22 MLIR: Updated Dialect Conversion examples           │
│  May 20 HPC: New Memory Hierarchy draft                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Topic Card Specification

Each topic card displays:

| Field          | Source                                    |
| -------------- | ----------------------------------------- |
| Title          | `topic-meta.json` → `title`               |
| Description    | `topic-meta.json` → `description`         |
| Article count  | Counted from `data.js` pages (non-index)  |
| Concept count  | Counted from `data.js` concepts           |
| Last updated   | Git last-modified date of `data.js`       |
| Completion     | Ratio of defined vs planned pages         |
| Domain color   | `topic-meta.json` → `color`               |

### 5.4 Topic Metadata File

Each topic directory contains a `topic-meta.json`:

```json
{
  "id": "mlir",
  "title": "MLIR Deep Dive",
  "description": "Multi-level intermediate representation framework for compiler construction.",
  "color": "#2563eb",
  "icon": "SB",
  "language": "en",
  "status": "active",
  "tags": ["compiler", "LLVM", "IR", "dialects"]
}
```

### 5.5 Cross-Topic Search

The Face Page provides a unified search that:

1. Loads `concepts-global.json` (aggregated by build script).
2. Indexes all topic data on first search activation.
3. Returns results grouped by topic with relevance scoring.
4. Clicking a result navigates into the topic wiki at the correct page.

### 5.6 Navigation Flow

```
Face Page
  │
  ├── Click topic card ──→ Topic Wiki (full 3-column layout)
  │                            │
  │                            ├── Breadcrumb: "Super Brain / MLIR / Dialects"
  │                            │   ↑ click "Super Brain" returns to Face Page
  │                            │
  │                            └── Full wiki experience (current behavior)
  │
  ├── Search ──→ Cross-topic results
  │               │
  │               └── Click result ──→ Topic Wiki at specific page
  │
  └── Concept cloud ──→ Click concept ──→ Topic Wiki at concept page
```

---

## 6. Migration Plan

### 6.1 Phase 1: Extract Shared Framework (Week 1)

1. Extract `wiki-framework.js` from current `app.js` — the generic
   rendering engine (nav, article, concept rail, search, keyword
   highlighting, concept full-replace).
2. Extract `wiki-styles.css` from current `styles.css` — base design
   tokens and layout.
3. Verify that the current site works identically when importing from
   `shared/`.

### 6.2 Phase 2: Restructure Topics (Week 1–2)

1. Create `site/topics/` directory.
2. Move current MLIR/HPC/AI content into `site/topics/mlir/`,
   `site/topics/hpc/`, etc., each with its own `data.js`.
3. Split the monolithic `data.js` into per-topic files.
4. Create `topic-meta.json` for each topic.
5. Verify each topic wiki renders independently.

### 6.3 Phase 3: Build Face Page (Week 2–3)

1. Implement `face.js` — topic card grid, search, concept cloud.
2. Implement `face.css` — responsive Face Page styling.
3. Build `scripts/build-registry.js` — aggregates topic metadata and
   concepts into a registry for the Face Page.
4. Update `index.html` to serve the Face Page.
5. Add navigation: topic card click → topic wiki, breadcrumb back.

### 6.4 Phase 4: Polish (Week 3)

1. Cross-topic concept references.
2. Deploy and verify on GitHub Pages.
3. Update CI workflows (deploy-pages, translate).
   - **Translation:** `translate.yml` should discover all topic `data.js`
     files via glob (`site/topics/*/data.js`) and translate each
     independently to its own `data-cn.js`. Topics may opt out of
     translation via a `"translate": false` flag in `topic-meta.json`.
4. Update README and documentation.

---

## 7. Data Model Changes

### 7.1 Topic Registry (`site/topic-registry.json`)

Generated by `build-registry.js`, consumed by the Face Page:

```json
{
  "topics": [
    {
      "id": "mlir",
      "title": "MLIR Deep Dive",
      "description": "...",
      "color": "#2563eb",
      "articleCount": 11,
      "conceptCount": 33,
      "lastUpdated": "2026-05-22",
      "completion": 0.8,
      "path": "topics/mlir/"
    }
  ],
  "globalConcepts": {
    "operation": { "definedIn": ["mlir"], "referencedIn": ["compiler-ai"] },
    "lowering":  { "definedIn": ["mlir"], "referencedIn": ["compiler-ai", "hpc"] }
  }
}
```

### 7.2 Per-Topic data.js (unchanged structure)

Each topic's `data.js` retains the exact same `WIKI` object structure:

```javascript
const WIKI = {
  taxonomy: [ ... ],
  pages: { ... },
  concepts: { ... }
};
```

No changes to the data model within a topic. This ensures mpv-research
can be dropped in as-is.

### 7.3 Cross-Topic Concept Reference (new)

```javascript
// In compiler-ai/data.js
concepts: {
  "dialect-conversion": {
    crossRef: "mlir",
    name: "Dialect Conversion",
    role: "Framework",
    summary: "See MLIR topic for full treatment.",
    linkText: "Full article in MLIR →"
  }
}
```

The wiki framework renders cross-references with a link to the source
topic.

---

## 8. Non-Functional Requirements

| ID    | Category         | Requirement                                                    |
| ----- | ---------------- | -------------------------------------------------------------- |
| NFR1  | Performance      | Face Page loads in < 1s. Individual topic wikis unchanged.     |
| NFR2  | Portability      | Each topic wiki works via `open index.html` (no build step). The Face Page requires a simple HTTP server (e.g. `python -m http.server`) because it dynamically loads topic metadata. |
| NFR3  | Scalability      | Supports 50+ topics without degradation.                       |
| NFR4  | Backward compat  | All existing URLs continue to work via redirects.              |
| NFR5  | Independence     | Each topic can be developed and previewed in isolation.         |
| NFR6  | Simplicity       | Adding a new topic = copy template + edit `data.js` + add entry to `topic-registry.json`. |

---

## 9. Risks

| Risk                                          | Mitigation                                                |
| --------------------------------------------- | --------------------------------------------------------- |
| Shared framework changes break individual topics | Semantic versioning on wiki-framework.js; per-topic integration tests. |
| Cross-topic concept registry becomes stale    | CI build step regenerates registry on every push.          |
| Face Page search becomes slow with many topics | Lazy-load topic data on search activation; limit index size. |
| Migration breaks existing GitHub Pages URLs    | 301 redirects from old paths to new topic paths.           |

---

## 10. Success Criteria

- [ ] Current content renders identically in the new architecture.
- [ ] MPV Research can be migrated into `site/topics/mpv-research/` with
      minimal changes (HTML script paths only; `data.js` untouched).
- [ ] A new topic can be scaffolded in < 5 minutes.
- [ ] Cross-topic search returns relevant results from all topics.
- [ ] Face Page loads and is usable on mobile.
