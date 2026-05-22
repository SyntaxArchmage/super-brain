# Product Requirements Document: Personal Knowledge Base (PKB)

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Product Name   | Super-Brain — Agentic Personal Knowledge Base          |
| Document Type  | Product Requirements Document (PRD)                    |
| Version        | 1.1 (Draft)                                            |
| Status         | Proposed                                               |
| Owner          | Knowledge Engineering Team                             |
| Last Updated   | 2026-05-22                                             |

### Change Log

- **1.1** — Hard constraints adopted: (a) the published artifact is a
  **GitHub Pages** static wiki where every Knowledge Unit is an
  independently readable, narratively-structured, richly-formatted article;
  (b) **every byte of raw material, intermediate output, and index is a
  file inside a single Git repository** — no local-only opaque databases
  may act as the source of truth. Sections §1, §3, §5, §6, §9, §10, §12,
  §13, §14 and the new Appendix A were revised accordingly.
- **1.0** — Initial draft.

---

## 1. Executive Summary

Super-Brain is a single-user Personal Knowledge Base (PKB) whose **single
source of truth is one Git repository** and whose **public surface is a
GitHub Pages static wiki**. It converts heterogeneous raw artifacts — PDFs,
academic papers, photographs of handwritten notes, and presentation slides —
into a coherent, navigable, wiki-style knowledge graph. The transformation
pipeline is driven by an **Agent-Oriented Skills System**: autonomous agents
select and chain fine-grained skills (OCR, layout analysis, summarization,
entity extraction, cross-referencing, citation resolution, metadata
enrichment) to progressively refine raw bytes into structured "Knowledge
Units" that are rendered as interlinked Markdown pages and deployed to
GitHub Pages by GitHub Actions.

Three design invariants flow from these constraints and shape every later
section:

- **Repo-as-database.** All originals (under Git LFS), all derived
  artifacts (text, OCR JSON, embeddings as JSONL/Parquet), all graph edges
  (YAML/JSONL), and all rendered Markdown live in the repo and are
  diffable, reviewable, and reproducible from `git clone` alone.
- **Article-grade output.** Each Knowledge Unit is an autonomous,
  long-form article with title, abstract, narrative body, figures, math,
  inline citations, sidebars, and rich cross-links — not a stub or a
  metadata card.
- **Two-plane reading model.** The main article remains the primary reading
  surface, while a distinct **concept-layer** continuously consolidates
  terminology, aliases, notation, and related concepts into a side reference
  rail rather than scattering half-finished glossary fragments through the
  prose.

The product targets researchers, graduate students, and lifelong learners
who accumulate large volumes of reference material but lack a unified,
queryable, and *visibly interconnected* view of what they have read.

## 2. Problem Statement

Knowledge workers today face three compounding pain points:

1. **Ingestion friction** — raw materials arrive in incompatible formats
   (scanned PDFs, LaTeX preprints, PowerPoint exports, phone photos of
   whiteboards) and require manual transcription before they are searchable.
2. **Synthesis gap** — once ingested, documents remain *isolated islands*.
   Relationships between papers, lecture notes, and slide decks are held only
   in the user's memory.
3. **Discoverability decay** — without an interlinked surface, knowledge
   becomes write-only; users re-read or re-derive content they have already
   captured.

Existing tools address one layer (Notion for notes, Zotero for references,
Obsidian for linking) but none automate the *transformation* from raw artifact
to interlinked knowledge.

## 3. Goals and Non-Goals

### 3.1 Goals (G)

- **G1** Accept manual ingestion of PDF, image (JPG/PNG/HEIC), PPTX, DOCX,
  and Markdown files by **`git add`-ing them into the `raw/` directory** of
  the repository (CLI helper provided; no server required).
- **G2** Reliably extract textual, structural, and visual content from each
  supported format using OCR and layout-aware parsers.
- **G3** Produce **Knowledge Units (KUs)** as **independently readable,
  narratively-structured long-form Markdown articles** (title, abstract,
  sections, figures, math, inline citations, sidebars, related-links
  footer) — *not* metadata stubs.
- **G4** Automatically discover and persist *typed* relationships between
  KUs (cites, extends, contradicts, defines, instance-of, …) as
  **diffable text files** in the repo.
- **G5** Publish the entire graph as a **GitHub Pages** static wiki with
  full-text search, backlinks, graph view, math, and diagrams — built and
  deployed automatically by **GitHub Actions** on every push.
- **G6** Provide a transparent, inspectable **Skill Framework** so the user
  can audit, edit, replay, and extend agent behavior; every skill run is
  reproducible from the committed inputs.
- **G7** Keep the **entire knowledge base portable by `git clone`**: no
  external database, no hidden state, no local-only services required to
  reproduce the published site.
- **G8** Support both **local execution** (developer machine running the
  CLI) and **CI execution** (GitHub Actions running the same CLI), with
  byte-identical outputs for the same inputs and skill versions.

### 3.2 Non-Goals (NG)

- **NG1** Multi-user collaboration with real-time editing. Collaboration,
  if any, happens through standard Git workflows (PRs, branches).
- **NG2** Mobile-native applications (mobile is read-only via GitHub Pages).
- **NG3** Automatic crawling of external sources (RSS, web scraping, email).
  All ingestion is *manual* by design.
- **NG4** Replacing reference managers (Zotero, Mendeley). Super-Brain
  *complements* them by importing exported libraries.
- **NG5** Training custom foundation models. Only fine-tuning of small
  task-specific models is in scope.
- **NG6** **Using any local-only opaque database as the source of truth.**
  SQLite/Chroma/Qdrant/Neo4j may exist *only* as gitignored, fully
  rebuildable local caches; the committed text/JSON/Parquet files are
  authoritative.
- **NG7** Running a long-lived server (FastAPI, daemon, queue broker) as
  part of the user-facing product. The default deployment is **stateless
  CLI + Git + GitHub Actions + GitHub Pages**.

## 4. Target Users and Personas

### 4.1 Persona A — "The Researcher" (primary)

A PhD student in computational biology with ~2,000 PDFs, hundreds of
hand-annotated slide decks, and a notebook of derivations. Wants to ask
"which papers in my library use Method X on Dataset Y?" without manually
tagging anything.

### 4.2 Persona B — "The Lifelong Learner"

A working engineer who reads textbooks, attends conferences, and takes
handwritten notes on a tablet. Wants a personal Wikipedia that grows
automatically as they add new source material to the repo.

### 4.3 Persona C — "The Power User / Tinkerer"

A developer who wants to author custom skills (e.g., a domain-specific
equation extractor) and wire them into the pipeline through a declarative
manifest.

## 5. Scope and Assumptions

- **Single repository**, single user (or a small trusted set of Git
  collaborators). Public or private GitHub repo; GitHub Pages enabled.
- **Storage budget aligned with GitHub limits.** Soft target: ≤ 5 GB of
  Git LFS for `raw/`, ≤ 1 GB of plain Git for derived text/JSON,
  ≤ 1 GB for the rendered site. Users approaching these limits are
  expected to shard into multiple repos (per-topic) or upgrade their LFS
  quota; the tool surfaces a `pkb size` report.
- **Compute budget aligned with GitHub Actions free tier** (2,000 minutes/
  month for private repos; unlimited for public). The pipeline is
  **incremental** — only artifacts whose inputs changed are re-processed.
- Latency: ingestion is asynchronous; users tolerate minutes-to-hours per
  batch but expect the deployed Pages site to update within ~5 minutes of
  a push for typical incremental changes.
- The user supplies their own LLM credentials via GitHub Actions secrets
  (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, …) *or* runs a local model
  (Ollama / llama.cpp) when executing the CLI locally before committing.
  The system must degrade gracefully when the LLM is unavailable —
  LLM-dependent skills are skipped and clearly marked "pending" in the
  KU front-matter so the next run can resume.

---

## 6. System Architecture

Super-Brain is structured as **three tiers that all live inside a single
Git repository**. There is no event bus, no daemon, and no opaque local
database in the critical path; the repository's file tree *is* the
data model, the message bus, and the deployment artifact at once. The
tiers are distinguished by directory and by lifecycle, not by host.

```
                       ┌──────────────────────────────────────────────┐
                       │                Git Repository                │
                       │            (the only source of truth)        │
   ┌──────────────┐    │  ┌──────────────┐   ┌──────────────────────┐ │    ┌────────────────┐
   │  Tier 1      │    │  │  Tier 2      │   │  Tier 3              │ │    │ GitHub Pages   │
   │  Raw Layer   │───▶│  │  Derived /   │──▶│  Rendered Wiki Site  │ │───▶│  (public URL)  │
   │  raw/  +LFS  │    │  │  Index Layer │   │  site/  (Quartz out) │ │    │  static HTML   │
   └──────────────┘    │  │  derived/    │   └──────────────────────┘ │    └────────────────┘
                       │  │  content/    │                            │
                       │  │  index/      │                            │
                       │  └──────────────┘                            │
                       └──────────────────────────────────────────────┘
                                          ▲
                                          │  invoked locally OR by
                                          │
                                ┌──────────────────────┐
                                │  pkb CLI (Python)    │
                                │  + Skill Registry    │
                                │  + Planner           │
                                └──────────────────────┘
                                          ▲
                                          │
                                ┌──────────────────────┐
                                │ GitHub Actions       │
                                │  on: push, schedule  │
                                │  → pkb build         │
                                │  → pkb render        │
                                │  → deploy to Pages   │
                                └──────────────────────┘
```

### 6.1 Tier 1 — Raw Layer (`raw/`, Git LFS)

The immutable, lossless record of everything the user has ingested. The
agent layer reads but never mutates this tier.

| Path                              | Tracking         | Contents                                |
| --------------------------------- | ---------------- | --------------------------------------- |
| `raw/papers/<slug>.pdf`           | Git LFS          | Academic papers, books, reports.        |
| `raw/notes/<date>-<slug>.{jpg,heic}` | Git LFS       | Photos of handwritten notes.            |
| `raw/slides/<slug>.pptx`          | Git LFS          | Presentation decks.                     |
| `raw/docs/<slug>.{docx,md}`       | Git (small)      | Other documents.                        |
| `raw/_meta/<slug>.yaml`           | Git (small)      | Optional user-supplied metadata: tags,  |
|                                   |                  | aliases, intended KU title.             |

Binary originals are tracked via **Git LFS** (`.gitattributes` configured
for `*.pdf`, `*.pptx`, `*.docx`, `*.png`, `*.jpg`, `*.heic`). A small text
sidecar `raw/_meta/<slug>.yaml` is plain Git so that *intent* (tags,
title hints) is always diffable even when the binary is not.

### 6.2 Tier 2 — Derived & Index Layer (`derived/`, `content/`, `index/`)

Every output of every skill is a **text or columnar file** committed to
the repo. This is the substantive change from v1.0: there is **no
SQLite catalog, no Chroma store, no in-memory graph DB** acting as the
source of truth. Local databases may exist as gitignored caches under
`.cache/` (see §6.5) but can always be rebuilt from these committed files.

| Path                                       | Format         | Purpose                                            |
| ------------------------------------------ | -------------- | -------------------------------------------------- |
| `derived/<slug>/text.md`                   | Markdown       | Layout-preserving extracted text.                  |
| `derived/<slug>/pages/<n>.png`             | PNG (LFS)      | Rasterized pages for OCR and figure cropping.      |
| `derived/<slug>/ocr.jsonl`                 | JSONL          | Per-line OCR with bboxes + confidence.             |
| `derived/<slug>/layout.json`               | JSON           | Detected blocks: paragraphs, figures, tables.      |
| `derived/<slug>/chunks.jsonl`              | JSONL          | Semantic chunks with offsets.                      |
| `derived/<slug>/figures/<n>.png`           | PNG (LFS)      | Cropped figures referenced by KUs.                 |
| `derived/<slug>/metadata.yaml`             | YAML           | Title, authors, year, venue, DOI, abstract.        |
| `derived/<slug>/skillruns.jsonl`           | JSONL          | Append-only audit log of every skill invocation.   |
| `content/<type>/<slug>.md`                 | Markdown + FM  | **Final Knowledge Unit articles** (see §3 G3).     |
| `index/embeddings/<shard>.parquet`         | Parquet (LFS)  | Chunk-level embeddings, sharded by 10k rows.       |
| `index/edges.jsonl`                        | JSONL          | All typed edges between KUs (one per line).        |
| `index/concepts.yaml`                      | YAML           | Concept node registry + graph metadata.            |
| `index/terminology.yaml`                   | YAML           | Concept-layer registry: preferred labels, aliases, |
|                                            |                | notation, short defs, disambiguation.              |
| `index/backlinks.json`                     | JSON           | Generated; commit optional (small).                |
| `index/search.json`                        | JSON           | Client-side full-text search index (MiniSearch).   |
| `index/graph.json`                         | JSON           | Force-directed graph payload for the wiki.        |

Format choices follow three rules: **YAML when humans will edit it**,
**JSONL when the agent appends incrementally** (one record per line keeps
diffs minimal), and **Parquet (LFS) when payloads are numeric and bulky**
(embeddings, tensors). All formats are open and readable without the tool.

### 6.3 Tier 3 — Rendered Wiki (`site/`)

`site/` holds the static HTML/CSS/JS produced by the static-site generator
(see §9). It is **committed to a separate branch** (`gh-pages`) by the
deploy workflow, not to `main`, so the source repo stays clean. Locally,
`site/` is gitignored on `main`.

| Output (on `gh-pages`)   | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `index.html`             | Landing page with featured KUs and recent activity.  |
| `<type>/<slug>/`         | One directory per KU; `index.html` is the article.   |
| `_assets/`               | Bundled CSS/JS, KaTeX, Mermaid, Cytoscape.           |
| `search.json`            | Copied from `index/search.json`.                     |
| `graph/`                 | Interactive graph view.                              |

### 6.4 The pkb CLI — the only "agent"

A single Python CLI, `pkb`, implements the entire agent layer. It is
**stateless between invocations**; everything it needs is in the repo.
Sub-commands:

| Command           | Effect                                                          |
| ----------------- | --------------------------------------------------------------- |
| `pkb ingest PATH` | Copy file into `raw/`, write `raw/_meta/<slug>.yaml`, stage.    |
| `pkb plan`        | Show the Skill DAG that *would* run; no writes.                 |
| `pkb build`       | Execute all firable skills; writes only under `derived/`,       |
|                   | `content/`, `index/`. Idempotent and incremental.               |
| `pkb review`      | Review suggested edges / merges by writing decisions under      |
|                   | `index/review/`.                                                |
| `pkb render`      | Run the static-site generator into `site/`.                     |
| `pkb doctor`      | Validate the repo, rebuild caches, report orphans.              |
| `pkb size`        | Report Git + LFS footprint vs. configured budgets.              |

The same binary runs locally and inside GitHub Actions. Determinism:
given identical inputs and pinned skill versions, `pkb build` produces a
byte-identical `derived/`, `content/`, and `index/` (modulo timestamps,
which are stored only in `skillruns.jsonl` and excluded from KU hashes).

### 6.5 Local Caches (gitignored, optional, rebuildable)

To accelerate development on large repos, `pkb` may maintain a
**gitignored** `.cache/` directory containing:
- `.cache/chroma/` — a Chroma index loaded from `index/embeddings/*.parquet`.
- `.cache/catalog.sqlite` — derived catalog for fast queries.
- `.cache/llm/` — content-addressed cache of LLM responses.

These caches are **never** consulted by GitHub Actions and **never**
authoritative. `pkb doctor --rebuild-cache` regenerates them from the
committed files in seconds-to-minutes.

### 6.6 Cross-Tier Contracts

- **Repo-as-database.** `git clone <repo> && pkb render` on a clean
  machine reproduces the deployed site exactly.
- **Idempotency.** `pkb build` on an unchanged repo is a no-op.
- **Incremental work.** Each skill declares `inputs` by file path; the
  planner skips a skill if every input's blob SHA matches the
  `skillruns.jsonl` record for that skill+version.
- **Provenance.** Every KU's YAML front-matter carries `sources[]` with
  `(raw_path, page_range, skill_chain, skill_versions)`. The wiki
  renders this as a "How this article was generated" sidebar.
- **Two-plane rendering.** Every non-concept KU may carry `concept_refs[]`
  in front-matter, allowing the renderer to build a concept-layer sidebar
  from `index/terminology.yaml` and `content/concept/` without duplicating
  definitions in the main body.
- **PR-friendly diffs.** Because edges, concepts, and KU bodies are all
  text, a re-run by Actions produces a reviewable diff. Suggested edits
  surface as PRs from the bot, not as silent rewrites.

### 6.7 Deployment Topology

Two execution modes, **same code**:

1. **Local mode** — developer runs `pkb ingest …; pkb plan; pkb build;
  pkb review; pkb render`, previews `site/` locally, then `git push`.
  Useful when working with private LLM keys or large batches.
2. **CI mode** — pushing to `main` triggers
   `.github/workflows/build-and-deploy.yml`, which (a) restores LFS, (b)
   runs `pkb build` with secrets-provided LLM keys, (c) commits any
   updated `derived/`/`content/`/`index/` files back to `main` via a bot
   PR, (d) runs `pkb render`, (e) deploys `site/` to the `gh-pages`
   branch using `actions/deploy-pages`.

The published URL (`https://<user>.github.io/<repo>/`) is the product.

---

## 7. Agent Skill Framework

The Skill Framework is the heart of the system. It is designed around three
principles: **declarative manifests** (skills describe themselves so the
planner does not need hard-coded routing), **typed I/O contracts** (skills
compose like UNIX pipes over structured objects, not opaque blobs), and
**replayable execution** (every run is recorded and can be re-issued).

### 7.1 Skill Definition

A skill is a directory under `skills/<skill_id>/` containing:

- `skill.yaml` — declarative manifest.
- `handler.py` (or any executable) — the implementation.
- `prompts/` — optional Jinja-templated prompts for LLM-backed skills.
- `tests/` — fixtures and expected outputs.

The manifest schema:

```yaml
id: ocr.tesseract               # globally-unique dotted id
version: 1.3.0
description: >
  Run Tesseract OCR on rasterized page images and emit per-page text
  with bounding boxes.
inputs:                         # what the skill consumes
  - kind: blob
    mime: ["image/png", "image/jpeg"]
    selector: "page_images[*]"  # JSONPath over the SkillContext
outputs:                        # what the skill produces (typed)
  - kind: ocr_text
    schema: schemas/ocr_text.json
triggers:                       # when the planner should schedule it
  - on: blob.created
    when: "mime in ['image/png','image/jpeg'] and not has_output('ocr_text')"
requires:                       # other skills whose output must exist first
  - layout.detect@>=0.2
resources:
  cpu: 2
  gpu: optional
  llm: false                    # this skill does NOT call an LLM
timeout_seconds: 300
idempotent: true
```

### 7.2 Skill Lifecycle

```
   planner                worker                  stores
      │   schedule(skill)    │                       │
      │─────────────────────▶│                       │
      │                      │  load SkillContext    │
      │                      │──────────────────────▶│
      │                      │  execute handler      │
      │                      │  emit typed outputs   │
      │                      │──────────────────────▶│
      │   skill.completed    │                       │
      │◀─────────────────────│                       │
      │   re-plan downstream │                       │
```

Each invocation produces a `SkillRun` record `{run_id, skill_id, version,
inputs_sha, outputs_sha, started_at, ended_at, status, logs_uri}`. The wiki
exposes these as an "audit trail" sub-page.

### 7.3 Triggering and Chaining

The planner is **data-driven**, not script-driven. It maintains a working set
of "pending facts" (every output type that exists for every artifact) and
repeatedly evaluates every skill's `when` clause against that set until no
new skill is firable. This produces a DAG per artifact without the user
having to author one.

Skills compose because their `outputs` types match the `inputs.selector`
of later skills. For example, `ocr.tesseract` produces `ocr_text`, which is
consumed by `chunk.semantic`, whose `chunk` output is consumed by
`embed.bge` and `summarize.abstractive` in parallel.

### 7.4 Built-in Skill Catalog (v1.0)

| Skill ID                  | Purpose                                                | LLM |
| ------------------------- | ------------------------------------------------------ | --- |
| `parse.pdf`               | Text + layout extraction from digital PDFs (PyMuPDF)   | no  |
| `parse.pptx`              | Slide text, speaker notes, image extraction            | no  |
| `parse.docx`              | Paragraph + style extraction                           | no  |
| `rasterize.pdf`           | Render PDF pages to PNG for OCR fallback               | no  |
| `ocr.tesseract`           | OCR for scanned PDFs and photos                        | no  |
| `ocr.trocr`               | Handwriting-aware OCR (Microsoft TrOCR)                | no  |
| `layout.detect`           | Detect figures, tables, columns (LayoutParser/Surya)   | no  |
| `chunk.semantic`          | Recursive semantic chunking                            | no  |
| `embed.bge`               | Embed chunks (BGE-M3 or text-embedding-3-small)        | no  |
| `metadata.extract`        | Title, authors, year, venue, DOI                       | yes |
| `citation.resolve`        | Parse bibliography, resolve DOIs via Crossref          | net |
| `summarize.abstractive`   | Per-section and document-level summaries               | yes |
| `entity.extract`          | Named entities + domain concepts                       | yes |
| `concept.canonicalize`    | Map surface forms to canonical concept IDs             | yes |
| `terminology.enrich`      | Grow the concept-layer registry and article-side refs  | yes |
| `relation.crossref`       | Discover typed edges across the KB                     | yes |
| `kb.compose`              | Assemble final Knowledge Unit Markdown                 | yes |
| `wiki.render`             | Invoke static site generator                           | no  |

### 7.5 Per-File-Type Default Pipelines

```
Digital PDF (text layer present):
  parse.pdf → layout.detect → chunk.semantic → embed.bge
            ↘ metadata.extract → citation.resolve
                                ↘ summarize.abstractive
                                  entity.extract → concept.canonicalize
                                                 → terminology.enrich
                                                 → relation.crossref
                                                 → kb.compose → wiki.render

Scanned PDF / photo of paper:
  rasterize.pdf → ocr.tesseract → layout.detect → (same tail as above)

Handwritten notebook page (image):
  ocr.trocr → chunk.semantic → entity.extract → concept.canonicalize
            → terminology.enrich
            → relation.crossref → kb.compose → wiki.render

PPTX deck:
  parse.pptx → (per-slide) chunk.semantic → embed.bge
             ↘ summarize.abstractive (deck-level)
             ↘ entity.extract → concept.canonicalize → terminology.enrich
                              → relation.crossref → kb.compose
```

### 7.6 Extensibility

Third-party skills are dropped into `skills/` and auto-discovered on startup.
A `pkb skill scaffold <id>` CLI generates a manifest + handler stub. Skills
declare their resource needs so the worker pool can route GPU-bound skills
appropriately. A skill marked `idempotent: false` (e.g., one that calls a
paid API) is opt-in and only invoked on explicit user request.

---

## 8. Knowledge Synthesis

Synthesis is the process by which independent skill outputs are fused into a
**single coherent graph** of Knowledge Units. It runs as a continuous,
incremental process — every newly produced output may trigger re-evaluation
of edges it participates in.

### 8.1 Knowledge Unit (KU) — the atomic page

A KU is the smallest addressable, human-readable artifact in the wiki. It is
defined by:

```yaml
id: ku_01HF6Z...          # ULID
type: paper | concept | note | slide_deck | figure | person | venue
title: "Attention Is All You Need"
slug: attention-is-all-you-need
sources:
  - artifact_sha: 9af3...
    page_range: [1, 11]
    skills: [parse.pdf, metadata.extract]
properties:
  authors: [ku_person_vaswani, ku_person_shazeer, ...]
  year: 2017
  venue: ku_venue_neurips
concept_refs:
  - id: ku_concept_self_attention
    role: core
    first_seen_section: "2. Architecture"
  - id: ku_concept_layernorm
    role: supporting
    first_seen_section: "3. Training"
embedding_ref: vec://chunks/9af3...
edges:
  - {type: cites,     target: ku_paper_bahdanau14}
  - {type: defines,   target: ku_concept_self_attention}
  - {type: uses,      target: ku_concept_layernorm}
content_md: "..."         # rendered into the page body
```

KUs are typed because different types render with different templates (a
`person` KU shows an author bibliography; a `concept` KU shows a definition,
examples, and "appears in" backlinks).

### 8.2 Concept Layer and Terminology

Concepts are not treated merely as one more KU type. They form a distinct,
continuously-improving **concept-layer** that sits above article bodies and
acts as the stable reference apparatus for them.

The concept-layer has three artifacts:

- **Concept KUs** under `content/concept/` — full concept articles with
  definition, derivation or intuition, examples, notation, related concepts,
  and provenance.
- **Terminology registry** in `index/terminology.yaml` — the canonical table
  of preferred labels, aliases, abbreviations, notation variants,
  disambiguation notes, and short definitions.
- **Per-article concept references** in `concept_refs[]` — the subset of
  concepts that should surface in the article's sidebar because they are
  prerequisites, core ideas, or frequently reused terms.

#### 8.2.1 Terminology lifecycle

Each terminology entry moves through an explicit lifecycle so the concept-layer
can improve continuously without pretending that every definition is already
settled:

- `provisional` — newly inferred term or alias; usable in search and internal
  linking, but marked as not yet fully curated.
- `canonical` — preferred label and notation have been reviewed and should be
  used in article sidebars and generated prose.
- `contested` — multiple plausible meanings or notations remain live; the
  sidebar must surface the ambiguity instead of hiding it.
- `deprecated` — alias or notation retained for lookup and redirect, but no
  longer preferred for display.

At minimum, each terminology entry stores: preferred label, aliases,
abbreviations, notation variants, a short definition, disambiguation note,
linked concept KU, source evidence, lifecycle state, and last reviewed commit.

#### 8.2.2 Article-side concept rail

`concept_refs[]` is not a dump of every detected noun phrase. It is a curated,
ranked reading aid for the current article.

- Each ref carries at least `id`, `role`, `first_seen_section`, and
  `confidence`.
- `role` is one of `prerequisite`, `core`, `supporting`, `notation`, or
  `contested`.
- The sidebar shows only the compact rail by default; cards expand on demand.
- A concept card includes: short definition, preferred notation, aliases,
  why it matters in this article, related concepts, "appears in" links, and a
  jump to the full concept KU.
- If the article itself is the best current explanation for a concept, the
  card shows a `defined here` badge; if the terminology is unresolved, it shows
  a `pending review` or `contested` badge instead of feigning certainty.

The rail therefore acts like a Gwern-style scholarly apparatus: always nearby,
rarely intrusive, and deeper only when requested.

#### 8.2.3 Ongoing enhancement and review

`terminology.enrich` continuously proposes improvements instead of rewriting the
registry unilaterally. Typical proposal types are:

- alias merge (`LLM`, `large language model`, `foundation model` overlap),
- notation conflict (`T`, `tau`, or `temperature` in different subdomains),
- concept split (one overloaded term should become two concept KUs),
- concept promotion (a frequently reused term deserves its own concept page),
- glossary demotion (a low-value term should stop occupying sidebar space).

These proposals are written to `index/review/terminology-suggestions.jsonl`.
Accepted decisions update `index/terminology.yaml`, `content/concept/`, and
affected `concept_refs[]`; rejected decisions are retained so the same noisy
suggestion does not recur every run.

Rendering follows a Gwern-like **article-first, semantic-zoom** model:

- On desktop, each article page exposes a right-side **Concept Layer** rail.
  Clicking a concept expands an in-place concept card with the short
  definition, aliases, notation, related concepts, and a link to the full
  concept page.
- On mobile, the same layer becomes a collapsible appendix or drawer rather
  than a persistent rail.
- The main article body remains uninterrupted prose; concept help is pulled
  in on demand instead of forcing hard navigational jumps or repetitive
  inline glossary blocks.

### 8.3 Entity and Concept Resolution

1. **Surface extraction** — `entity.extract` emits raw mentions per chunk
   with offsets and a coarse type guess.
2. **Canonicalization** — `concept.canonicalize` maps mentions to canonical
   IDs using a three-stage pipeline:
   - exact match against the existing concept table and terminology registry,
   - approximate match via embedding similarity (cosine ≥ 0.88) and
     fuzzy string similarity (rapidfuzz ≥ 90),
   - LLM-mediated disambiguation when both signals are ambiguous, with the
     prompt receiving the top-K candidate KUs as context.
3. **Merging** — when canonicalization decides two existing concepts are the
   same, a `merge` operation rewrites edges, archives the loser KU, and
   leaves a redirect stub. Merges are logged and reversible.
4. **Terminology enhancement** — `terminology.enrich` refreshes
   `index/terminology.yaml`, updates short definitions / notation variants /
   aliases, and emits or re-ranks `concept_refs[]` for affected articles so
   the sidebar remains useful as the corpus grows.
5. **Disambiguation review** — when two concepts remain confusable after
  enrichment, the system emits a terminology review item instead of silently
  collapsing them into one label.

### 8.4 Relationship Inference

Edges are introduced by three complementary mechanisms:

- **Structural edges** — derived directly from parsing (a citation in a
  bibliography ⇒ `cites`; a slide labeled "References" ⇒ `cites`; an author
  field ⇒ `authored_by`). These are high-precision and never require an LLM.
- **Semantic edges** — derived from vector neighborhoods. For each chunk,
  the top-K nearest chunks from *other* documents are candidates for a
  `related_to` edge; an LLM classifier upgrades them to a specific type
  (`extends`, `contradicts`, `applies`, `is_example_of`) or rejects them.
- **Concept co-occurrence edges** — when two concept KUs co-occur in the
  same document above a TF-IDF-weighted threshold, a weighted
  `co_occurs_with` edge is added. This is the primary signal for the
  article-side "Related concepts" cluster and for ranking the concept rail.

The full edge vocabulary is closed (defined in `schemas/edge_types.yaml`) so
that the wiki frontend can render each type with an appropriate icon and
verb. The user can add custom edge types via configuration.

### 8.5 Cross-Reference Skill (`relation.crossref`)

This is the workhorse of synthesis. For each new chunk it executes:

```
1. Retrieve top-32 semantically similar chunks from other artifacts.
2. Filter by metadata (same year ± 5, same domain, or shared author).
3. For each surviving candidate pair, build a compact prompt:
     "Chunk A: <text>\nChunk B: <text>\n
      Choose an edge type from {cites, extends, contradicts, applies,
      is_example_of, related_to, none} and justify in <= 25 words."
4. Persist non-'none' results as proposed edges with confidence under
  `index/review/suggested-edges.jsonl`.
5. `pkb review` or a bot-opened PR promotes accepted suggestions into
  `index/edges.jsonl`; rejected suggestions are written to
  `index/review/decisions.jsonl` so they do not resurface blindly.
```

This design keeps the LLM call count bounded (O(K) per new chunk, not
O(N²) across the corpus) and never silently fabricates edges — every edge
has a textual justification stored alongside it.

### 8.6 Deduplication and Versioning

- **Artifact dedup** — SHA-256 of the file content. Re-adding the same
  bytes under `raw/` is a no-op on the next build.
- **Near-duplicate detection** — for papers, MinHash over normalized text;
  for slides, perceptual hash over rendered thumbnails. Near-duplicates are
  merged into a single KU with multiple `sources[]` entries.
- **Versioning** — when a new artifact is detected as a *revised version*
  of an existing one (e.g., arXiv v2 of v1), it is linked via a
  `revision_of` edge and the wiki shows a version selector.

### 8.7 Wiki Graph Construction

After every batch of synthesis, a `wiki.render` skill performs:

1. Topological walk of changed KUs.
2. Markdown emission using Jinja templates keyed by KU `type`.
3. Concept-layer assembly: sort each article's `concept_refs[]` by role,
  first appearance, and centrality; render sidebar cards and mobile appendix
  fallbacks from `index/terminology.yaml`.
4. Backlink index rebuild (`who links to me?`) — O(E) over edges.
5. MOC generation: cluster concept KUs by embedding (HDBSCAN) and emit one
   index page per cluster, named by an LLM-generated label.
6. Global graph JSON for the visual graph view, with node size ∝ in-degree
   and color ∝ KU type.

### 8.8 Quality Controls

- Every LLM-derived field carries a `confidence` score and the source
  prompt+response hash.
- A scheduled **consistency audit** GitHub Action (`audit.consistency`)
  re-checks a random sample of edges and flags drift.
- Users can pin a KU (`pinned: true` in front-matter) to prevent automated
  rewrites; the agent layer treats pinned content as ground truth.

---

## 9. Technical Stack Recommendations

All recommendations must satisfy two v1.1 constraints: **the repository is
authoritative** and **the published product is a GitHub Pages static site**.
Anything stateful that improves local speed must live either as committed
files in the repo or as disposable `.cache/` accelerators.

### 9.1 Document Parsing and OCR

| Concern              | Primary                       | Fallback / Alternative           | Rationale                                                                |
| -------------------- | ----------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Digital PDF parsing  | **PyMuPDF (fitz)**            | pdfplumber, pdfminer.six         | Fastest, preserves layout, MIT-friendly for personal use.                |
| Layout + tables      | **Surya** or **LayoutParser** | unstructured.io                  | Modern transformer layout models; Surya is permissive and CPU-tolerable. |
| Printed OCR          | **Tesseract 5**               | PaddleOCR                        | Ubiquitous, multilingual, easy to package.                               |
| Handwriting OCR      | **TrOCR** (handwritten ckpt)  | Apple Vision (mac), Azure Read   | Best open handwriting accuracy as of 2026.                               |
| PPTX                 | **python-pptx**               | unoconv → PDF → PyMuPDF          | Direct XML access to slide structure and notes.                          |
| DOCX                 | **python-docx**               | pandoc                           | Native paragraph + style traversal.                                      |
| Math / equations     | **pix2tex (LaTeX-OCR)**       | Mathpix API                      | Converts rendered equations back to LaTeX for citation.                  |
| Image preprocessing  | **OpenCV + Pillow**           | scikit-image                     | Deskew, denoise, binarize before OCR.                                    |

### 9.2 LLM Orchestration

| Concern                  | Primary                       | Alternative                       | Rationale                                                                  |
| ------------------------ | ----------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| Agent / skill framework  | **Custom thin core**          | LangGraph, CrewAI                 | The PRD's "skills" model is more deterministic than autonomous-agent libs. |
| LLM provider abstraction | **LiteLLM**                   | OpenAI SDK, Ollama Python client  | Single API across local + cloud; cost/latency telemetry built in.          |
| Prompt templating        | **Jinja2** + pydantic outputs | LangChain prompt templates        | Avoids LangChain's heavy abstraction surface; outputs validated by schema. |
| Structured outputs       | **instructor** (pydantic)     | outlines, guidance                | Enforces JSON schema; auto-retries on parse failure.                       |
| Local LLM runtime        | **Ollama**                    | llama.cpp server, vLLM            | One-line model swap; supports Llama-3.1, Qwen-2.5, Phi-4.                  |
| Embeddings (local)       | **BGE-M3** via sentence-tx    | nomic-embed-text, gte-large       | Best open multilingual retrieval quality at small size.                    |
| Embeddings (cloud)       | OpenAI text-embedding-3-small | Cohere embed-v3                   | Faster bulk ingestion when network is available.                           |

> **Why not LangChain/AutoGPT as the core?** Both are excellent for
> exploratory agents but their non-deterministic control flow conflicts with
> the PRD's "replayable, audit-trail" requirement. We instead implement a
> small (~1k LoC) typed skill planner and use LiteLLM + instructor for the
> LLM-touching bits. LangGraph is acceptable as an alternative if the team
> prefers an established graph runtime; in that case skills become LangGraph
> nodes with the same manifest contract.

### 9.3 Storage and Indexing

| Concern                    | Primary                              | Alternative                 | Rationale                                                                     |
| -------------------------- | ------------------------------------ | --------------------------- | ----------------------------------------------------------------------------- |
| Canonical storage          | **Git + Git LFS**                    | Multiple topic repos        | The only source of truth must stay diffable, portable, and reviewable.        |
| Human-editable metadata    | **YAML**                             | TOML                        | Front-matter, manifests, and overrides stay readable in PRs.                  |
| Append-heavy records       | **JSONL**                            | NDJSON                      | Skill runs, chunks, and edge proposals append cleanly with minimal diffs.     |
| Numeric / bulky indices    | **Parquet (Git LFS)**                | Arrow IPC, NPZ              | Embeddings and dense numeric payloads stay compact and columnar.              |
| Optional local vector cache| **Chroma under `.cache/`**           | Qdrant, LanceDB             | Fast local nearest-neighbor lookup without becoming authoritative.            |
| Optional local query cache | **DuckDB or SQLite under `.cache/`** | None                        | Speeds local inspection and analytics while preserving repo-first semantics.  |
| Client search index        | **MiniSearch / FlexSearch JSON**     | Lunr                        | Search ships with the static site; no server-side index is required.          |
| Graph payload              | **JSON**                             | GraphML export              | Simple interchange for Cytoscape plus easy debugging in Git diffs.            |

No committed SQLite, Chroma, Qdrant, or graph database files are part of the
product contract. If they exist at all, they are rebuildable local caches only.

### 9.4 Wiki / Frontend Generation

| Concern               | Primary                          | Alternative                     | Rationale                                                                    |
| --------------------- | -------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| Static-site engine    | **Quartz 4**                     | Hugo, MkDocs Material, Astro    | Wikilinks, backlinks, graph pages, and markdown pipelines fit the product.   |
| Reading model         | **Gwern-style article-first layout** | App-shell / dashboard-first UI | The product is read mainly through long-form pages, not a control panel.     |
| Hosting               | **GitHub Pages**                 | Cloudflare Pages                | GitHub Pages is the required published surface in v1.1.                      |
| Build automation      | **GitHub Actions**               | Local-only build                | Same pipeline can run in CI and on a laptop.                                 |
| Content format        | **Markdown + YAML front-matter** | MDX                             | Portable, inspectable, and friendly to bot-generated diffs.                  |
| Concept-layer UI      | **Right-side concept rail + click-to-expand cards** | Inline glossary only | Keeps terminology continuously available without fragmenting the prose.       |
| Client-side search    | **MiniSearch / FlexSearch**      | Lunr                            | Fast browser search without a backing service.                               |
| Graph visualization   | **Cytoscape.js**                 | Sigma.js, D3-force              | Mature filtering and layout support for typed edge graphs.                   |
| Math rendering        | **KaTeX**                        | MathJax                         | Faster static rendering and smaller payloads.                                |
| Diagrams              | **Mermaid**                      | PlantUML                        | Markdown-native authoring with broad ecosystem support.                      |
| Link context          | **Popover previews + collapsible appendices** | Hard page jumps only | Preserves semantic zoom and fits a Gwern-like dense reading experience.      |
| Review surfacing      | **Generated review pages + bot PRs** | Local CLI review only       | Keeps curation compatible with a static site and Git-based workflow.         |

Design fit:

- Prefer a dense but calm reading surface: high-quality typography,
  disciplined margins, strong TOC, backlinks, and concept-layer access.
- Do not drift into a SaaS-style dashboard or card grid as the primary entry.
  The article page is the product.
- Treat the concept-layer like a scholarly apparatus or Gwern-style side
  reference system, not like a second app competing for attention.

The primary page model and route-level IA are specified in Appendix B.

### 9.5 Runtime, Packaging, Ops

| Concern                 | Primary                        | Notes                                                              |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------ |
| Language                | **Python 3.12**                | Core CLI, planners, schemas, and most skills.                      |
| Python package manager  | **uv** (Astral)                | Fast, lockfile-driven environment management.                      |
| Frontend build toolchain| **Node 20 + pnpm**             | Build-time only for Quartz themes, assets, and local preview.      |
| Task runner             | **Justfile or Make**           | Shared entrypoints for `plan`, `build`, `review`, `render`, `doctor`. |
| CI/CD                   | **GitHub Actions**             | Build, review, and deploy workflows; no separate orchestrator.     |
| Testing                 | **pytest + golden files**      | Skill fixtures plus deterministic render checks.                   |
| Lint / format           | **ruff + markdownlint + prettier** | Stable generated diffs and readable author-edited docs.       |
| Observability           | **Structured JSON logs**       | Optional OpenTelemetry export; no always-on telemetry backend.     |
| Containerization        | **Devcontainer / Docker (optional)** | Onboarding convenience, not a product dependency.             |

### 9.6 Reference Stack Summary

```
Ingestion  : git add raw/ + pkb ingest
Parsing    : PyMuPDF, Surya, Tesseract, TrOCR, python-pptx, python-docx
LLM        : LiteLLM → {Ollama (local) | OpenAI | Anthropic}, instructor, Jinja2
Storage    : Git + Git LFS + YAML/JSONL/Parquet; optional .cache/{chroma,duckdb,sqlite}
Orchestrator: pkb CLI + manifest-driven planner + GitHub Actions
Wiki       : Quartz 4 + MiniSearch + Cytoscape.js + KaTeX + Mermaid + GitHub Pages
Packaging  : uv + pnpm + Justfile
```

---

## 10. User Workflow

The end-to-end journey from a file on the user's disk to a published wiki
page is intentionally **manual on ingress**, **reviewable in the middle**,
and **static on egress**.

### 10.1 Happy-Path Sequence

```
User / repo working tree      pkb CLI              Git repo             Actions / Pages
 │ add raw file + meta          │                     │                        │
 │────────────────────────────▶│                     │                        │
 │                             │ plan / build        │                        │
 │                             │ write reviewable    │                        │
 │                             │ outputs             │───────────────────────▶│
 │ review generated diff       │                     │ push / PR              │ render / deploy
 │──────────────────────────────────────────────────────────────────────────▶│
 │ open published wiki                                                         
 │◀──────────────────────────────────────────────────────────────────────────│
```

### 10.2 Detailed Steps

1. **Add source material** — the user either places a file under `raw/`
   directly or runs `pkb ingest PATH`, which copies it into `raw/` and
   creates `raw/_meta/<slug>.yaml`.
2. **Inspect the plan** — `pkb plan` resolves which skills are firable,
   which outputs already exist, and which steps are blocked on OCR, LLM,
   or metadata.
3. **Choose execution mode** — the user can run `pkb build` locally before
   committing, or push only `raw/` plus metadata and let GitHub Actions
   materialize `derived/`, `content/`, and `index/` in a bot PR.
4. **Review generated artifacts** — all substantive outputs land in normal
  files: extracted text, metadata, KU markdown, edge files, terminology
  registry updates, search index, and review queues under `index/review/`.
5. **Curate low-confidence synthesis** — `pkb review` records accept / reject
   decisions for suggested edges, duplicate merges, and any pinned KUs, so
   future re-runs inherit the human decision instead of fighting it.
  The same review pass also resolves terminology suggestions, notation
  conflicts, and concept promotions / splits.
6. **Render the site** — `pkb render` generates `site/`; the user may preview
   it locally with the static-site generator's dev server or any trivial
   static file server.
7. **Commit and push** — reviewed source files on `main` become the canonical
   state. GitHub Actions replays the same build, deploys `site/` to
   `gh-pages`, and updates bot-authored review PRs when needed.
8. **Browse and iterate** — the published Pages site supports article reading,
  search, backlinks, graph navigation, provenance inspection, and a clickable
  concept-layer sidebar; any corrections are made by editing repo files and
  rebuilding.

### 10.3 Failure and Recovery UX

- Failed skills append structured error records to `derived/<slug>/skillruns.jsonl`
  and to a build report under `.reports/`; failures are visible in Git diffs
  and CI logs instead of a transient UI.
- Retries are explicit: rerun `pkb build` locally or re-trigger the GitHub
  Actions workflow for the affected commit.
- If the LLM provider is unavailable, non-LLM steps still complete and the
  remaining work is marked `pending` in KU front-matter or review files so a
  later run can resume without guesswork.
- `pkb doctor` validates Git LFS availability, schema versions, orphaned
  derived files, stale review decisions, and rebuildable local caches.
- Writes must be atomic: interrupted runs may leave a failed report, but they
  must not leave half-written authoritative files on `main`.

---

## 11. Data Model Summary

| File / Entity                    | Key fields                                                                 |
| -------------------------------- | -------------------------------------------------------------------------- |
| `raw/_meta/<slug>.yaml`          | slug, raw_path, sha256, mime, tags[], aliases[], ingest_commit             |
| `derived/<slug>/skillruns.jsonl` | run_id, skill_id, version, inputs_sha, outputs_sha, status, started_at     |
| `derived/<slug>/chunks.jsonl`    | chunk_id, artifact_slug, page, offsets, text, embedding_ref, source_span   |
| `derived/<slug>/metadata.yaml`   | title, authors, year, venue, identifiers, abstract                          |
| `content/<type>/<slug>.md`       | id, type, title, slug, sources[], concept_refs[{id, role, first_seen_section, confidence}], pinned, pending_skills[], body |
| `index/edges.jsonl`              | src_ku, dst_ku, type, confidence, justification, provenance, status         |
| `index/concepts.yaml`            | concept_id, ku_ref, cluster, centrality, status                              |
| `index/terminology.yaml`         | term_id, preferred_label, aliases[], notation[], short_def, disambiguation, state, concept_ref, source_evidence[] |
| `index/review/terminology-suggestions.jsonl` | proposal_id, term_id, suggestion_kind, candidate_labels[], candidate_concepts[], rationale, reviewer_decision |
| `index/review/*.jsonl`           | proposal_id, kind, target, suggestion, confidence, reviewer_decision        |
| `.reports/build/<stamp>.json`    | commit_sha, changed_paths, warnings[], failures[], rendered_site_hash       |

---

## 12. Non-Functional Requirements

| ID    | Category            | Requirement                                                                                 |
| ----- | ------------------- | ------------------------------------------------------------------------------------------- |
| NFR1  | Performance         | `pkb build` processes a 20-page digital PDF end-to-end in < 90 s on a 2024 laptop (CPU only). |
| NFR2  | Performance         | Incremental `pkb render` after one changed KU completes in < 30 s locally and < 2 min in CI.   |
| NFR3  | Scalability         | One repo supports roughly 5k raw artifacts / 50k KUs while staying within declared Git + LFS budgets. |
| NFR4  | Reliability         | Builds are crash-safe through temp-file + atomic-rename semantics; authoritative files are never partially written. |
| NFR5  | Determinism         | Same commit, skill versions, and model pins produce byte-identical `derived/`, `content/`, and `index/` outputs except audit timestamps. |
| NFR6  | Privacy             | Default local mode sends zero bytes off-host; cloud LLM use requires explicit env-vars or GitHub secrets. |
| NFR7  | Portability         | `git clone` plus locked toolchains reproduces the build without hidden services or databases. |
| NFR8  | Auditability        | 100% of KU content is traceable to `(raw_path, page_range, skill_chain, skill_versions)`.     |
| NFR9  | Reviewability       | Incremental runs must emit stable ordering and schema-valid files so PRs stay human-reviewable. |
| NFR10 | Accessibility       | The published GitHub Pages site passes WCAG 2.1 AA on the default theme.                      |
| NFR11 | Internationalization| OCR, embeddings, prompts, and search handle English + CJK at minimum.                         |
| NFR12 | Operability         | `pkb doctor` detects missing LFS objects, schema drift, orphaned derived files, and stale caches. |
| NFR13 | Reading UX          | Desktop article pages expose a concept-layer sidebar without displacing the primary reading column; mobile falls back to a drawer or appendix. |

---

## 13. Milestones / Roadmap

| Phase  | Theme                            | Key Deliverables                                                                                 |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| **M0** | Repo Skeleton (Week 1–2)         | `raw/`, `derived/`, `content/`, `index/` layout; Git LFS rules; schemas; `pkb ingest`; `pkb plan`. |
| **M1** | Parse + OCR (Week 3–4)           | `parse.pdf`, `parse.pptx`, `parse.docx`, `rasterize.pdf`, `ocr.tesseract`, golden-file tests.     |
| **M2** | Composition (Week 5–6)           | `metadata.extract`, `citation.resolve`, `summarize.abstractive`, `kb.compose`, provenance sidebars. |
| **M3** | Synthesis + Review (Week 7–8)    | `chunk.semantic`, `embed.bge`, `entity.extract`, `concept.canonicalize`, `terminology.enrich`, `relation.crossref`, `index/review/`, `pkb review`. |
| **M4** | Render + Publish (Week 9)        | Quartz templates, concept-layer sidebar / popovers, search/graph payloads, local preview, GitHub Pages deploy, bot PR workflow.     |
| **M5** | Curation + Advanced Extraction (Week 10) | `ocr.trocr`, math OCR, duplicate / merge flow, pinned KUs, review-page surfacing.          |
| **M6** | Hardening (Week 11–12)           | Deterministic builds, size budgets, `pkb doctor`, onboarding docs, recovery drills, v1.0 release. |

---

## 14. Risks and Open Questions

| ID  | Risk                                                          | Mitigation                                                                       |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| R1  | LLM-derived edges create noisy diff churn or spurious links.  | Pin model versions, store justifications, gate low-confidence results through review files. |
| R2  | OCR quality on handwriting and equations is highly variable.  | Support correction files, preserve human overrides, and keep source images nearby for audit. |
| R3  | Git + LFS growth exceeds GitHub quotas on large corpora.      | `pkb size`, shard-by-domain guidance, and pruning rules for oversized intermediates. |
| R4  | Client-side search and graph payloads become too large.       | Shard indices, lazy-load graph neighborhoods, and cap default graph scope.       |
| R5  | Merge conflicts in generated files slow Git workflows.        | Deterministic emit order, stable formatting, and bot-assisted rebase / regeneration. |
| R6  | Skill API churn breaks third-party skills.                    | Semver on the skill API, schema versioning, and deprecation warnings.            |
| R7  | Local model quality is insufficient for relation inference.   | Cloud-LLM opt-in path plus conservative fallback edge types such as `related_to`. |
| R8  | Terminology drifts into duplicate or noisy concept cards.     | Canonical IDs, alias history, terminology review suggestions, and manual pinning of preferred labels. |

**Open questions:**
- Should CI write generated `derived/` / `content/` / `index/` files directly to
  `main`, or always route them through a bot-authored PR?
- When a corpus exceeds the single-repo budget, should sharding happen by domain,
  by time, or by a separate shared-concepts repo?
- Should low-confidence review queues live only in CLI tooling, or also be
  rendered as read-only review pages on GitHub Pages?

---

## 15. Glossary

- **Artifact** — an immutable original file committed under `raw/`.
- **Derived file** — any extracted or synthesized file committed under
  `derived/`, `content/`, or `index/`.
- **Git LFS** — Git's large-file transport used for raw binaries and heavy
  derived assets such as page images or embedding shards.
- **Concept-layer** — the independent terminology and concept reference layer
  that supports article sidebars, popovers, and concept pages.
- **Knowledge Unit (KU)** — an atomic, typed, addressable wiki article.
- **MOC** — Map of Content; an index page that groups related KUs.
- **Provenance** — the explicit `(raw_path, page_range, skill_chain,
  skill_versions)` trail attached to a generated claim or article.
- **Review queue** — proposed edges, merges, or overrides stored in repo
  files pending a human decision.
- **Terminology registry** — the canonical YAML registry of preferred labels,
  aliases, notation, disambiguation, and short definitions for concepts.
- **Skill** — a self-describing, typed unit of processing work.
- **Skill DAG** — the directed acyclic graph of skills the planner derives
  for a given artifact.
- **Synthesis** — the process of merging skill outputs into a coherent
  graph of KUs and typed edges.
- **PKB** — Personal Knowledge Base.

---

## Appendix A. Recommended Repository Layout

```text
.
├── .github/
│   └── workflows/
│       ├── build-and-deploy.yml
│       └── consistency-audit.yml
├── raw/
│   ├── papers/
│   ├── notes/
│   ├── slides/
│   ├── docs/
│   └── _meta/
├── derived/
│   └── <artifact-slug>/
│       ├── text.md
│       ├── ocr.jsonl
│       ├── layout.json
│       ├── chunks.jsonl
│       ├── metadata.yaml
│       └── skillruns.jsonl
├── content/
│   ├── paper/
│   ├── concept/
│   ├── note/
│   └── slide_deck/
├── index/
│   ├── concepts.yaml
│   ├── terminology.yaml
│   ├── edges.jsonl
│   ├── graph.json
│   ├── search.json
│   ├── embeddings/
│   └── review/
├── skills/
├── docs/
├── site/              # local render output; ignored on main
└── .cache/            # local rebuildable caches; ignored
```

Branch model:

- `main` stores raw inputs, derived outputs, KU markdown, indices, schemas,
  skills, and workflows.
- `gh-pages` stores only the rendered static site.
- `.cache/` and local preview artifacts never participate in the published
  source-of-truth contract.

---

## Appendix B. Information Architecture and Page Model

The IA should reflect one governing rule: **readers arrive primarily to read an
article, then branch outward into concepts, backlinks, and graph context as
needed**. The site should therefore feel closer to Gwern or a richly-linked
scholarly essay collection than to a workspace dashboard.

Detailed wireframes, panel contents, and interaction rules live in
`docs/UI-Design-Blueprint.md`; this appendix keeps only the product-level page
model.

### B.1 Primary Routes

| Route / Page Type           | Purpose                                                  | Primary regions                                                           |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `/`                         | Entry page; orient the reader and offer starting points. | Featured KUs, topic clusters, recent additions, reading paths.            |
| `/<type>/<slug>/`           | Default KU article page.                                 | Article body, TOC, concept-layer rail, provenance, backlinks, related.    |
| `/concept/<slug>/`          | Full concept page.                                       | Definition block, notation/aliases, concept essay, appears-in, graph.     |
| `/moc/<slug>/`              | Topic / cluster landing page.                            | Intro essay, grouped concept/article links, curated reading sequence.      |
| `/search/` or search modal  | Fast discovery surface.                                  | Query box, ranked results, type filters, concept quick definitions.        |
| `/graph/`                   | Global graph exploration.                                | Graph canvas, filters, selected-node detail panel, jump-to-article links.  |
| `/review/`                  | Optional private/static review surface.                  | Terminology suggestions, edge suggestions, merge proposals, decision links. |

### B.2 Homepage IA

The homepage is not a KPI dashboard. It is a **starting-point page**.

Desktop structure:

- Header: site identity, search trigger, one-line framing of the PKB.
- Lead block: a short editorial introduction or currently important question.
- Featured reading paths: 3–6 manually or algorithmically surfaced entry
  points such as "transformers", "reasoning", or "statistics foundations".
- Recent / updated KUs: article-first list with concise abstracts.
- Concept clusters: a quieter secondary section exposing major concept domains.
- Footer utilities: changelog, about, graph, index pages.

The homepage should help a cold reader begin somewhere sensible, but it should
never compete with article pages as the primary experience.

### B.3 Article Page Layout

The article page is the core template for papers, notes, slide decks, and most
knowledge-writing outputs.

Desktop layout:

- Left rail: breadcrumbs plus a strong table of contents.
- Center column: title, abstract, article body, figures, equations, footnotes,
  collapsible detail blocks.
- Right rail: concept-layer rail, local graph teaser, provenance summary.
- Lower appendices: backlinks, related articles, related concepts, full
  provenance / source chain, link bibliography.

Behavioral rules:

- The main column must remain readable without interacting with any sidebar.
- Clicking a concept in the right rail expands context locally instead of
  ejecting the reader from the article.
- Hover or preview affordances should reveal context quickly, but the page must
  still degrade gracefully when previews are unavailable.
- Dense supporting material belongs in collapsible appendices rather than in a
  second app shell.

Mobile layout:

- The center column becomes the whole page width.
- TOC and concept-layer move into drawers or collapsible sections.
- Backlinks, provenance, and related concept blocks remain below the article.

### B.4 Concept Page Layout

Concept pages are not ordinary glossary entries. They are compact but serious
knowledge nodes.

Recommended structure:

- Header: preferred label, lifecycle state, one-sentence definition.
- Quick facts panel: aliases, notation, domain, parent concept, sibling concepts.
- Body: explanation, derivation or intuition, examples, counterexamples,
  diagrams, citations.
- Usage section: where this concept appears, which KUs define it, which KUs use it.
- Relationship section: prerequisites, related concepts, frequent confusions,
  contradictory or competing formulations when relevant.
- Footer apparatus: backlinks, provenance, terminology history, review state.

Concept pages should read as canonical reference nodes, while the sidebar cards
remain the fast-access form of the same layer.

### B.5 Search and Discovery Surfaces

Search should support two dominant intents:

- "take me to the article I probably mean"
- "help me remember the concept / term / notation I half-remember"

Therefore the search surface should:

- mix article and concept results in one ranked list,
- visually distinguish concept hits from long-form article hits,
- show short concept definitions inline in the result preview,
- allow filtering by KU type, concept state, and source type,
- let the reader jump directly either to the full concept page or to the first
  article section where the concept matters.

### B.6 Graph and MOC Pages

The graph page is a secondary discovery tool, not the main reading surface.

- Global graph page: canvas first, but always paired with a textual detail
  panel for the currently selected node.
- Local graph widget on article pages: a small teaser, not a full takeover.
- MOC pages: editorially useful curated indices that can provide a better
  starting point than raw graph topology.

If graph exploration and article reading ever conflict, article reading wins.
