# Super-Brain UI Design Blueprint

## 1. Design Direction

Super-Brain should feel like a high-density reading environment rather than a
product dashboard. The closest design family is a Gwern-like static knowledge
site: article-first, typography-forward, link-dense, and willing to reveal more
context only when the reader asks for it.

Three decisions govern the entire UI:

- The article page is the primary product surface.
- The concept-layer is a secondary but persistent reference apparatus.
- Discovery tools such as search, MOC pages, and graph views support reading;
  they do not replace it.

## 2. Design Principles

### 2.1 Article First

The central reading column should dominate attention. Everything else exists to
support comprehension: TOC, concept rail, backlinks, provenance, and graph
context.

### 2.2 Semantic Zoom

Readers should be able to move through multiple depths without losing context:
headline, abstract, section headings, concept cards, collapsible detail blocks,
backlink snippets, and then full linked pages.

### 2.3 Concept-Layer, Not Inline Glossary Spam

Terminology should not repeatedly interrupt the article body. Instead, the UI
should expose a concept rail that lets the reader pull definitions, notation,
and related concepts into view only when needed.

### 2.4 Calm Density

The site should be information-dense but visually disciplined. Use strong
margins, explicit hierarchy, high-quality typography, and restrained color.
Avoid dashboard cards, vanity metrics, and decorative chrome.

### 2.5 Explicit Uncertainty

When terminology or concept boundaries are unsettled, the UI should show that.
A concept card may be marked `contested`, `pending review`, or `defined here`.
The interface should not pretend the ontology is cleaner than it is.

### 2.6 Static-First Interaction

All core reading and navigation must work as a static site. Rich behavior such
as previews, popovers, and local graph interactions are enhancements, not hard
requirements for understanding the page.

## 3. Global Information Architecture

| Route | Page Type | Primary Goal |
| ----- | --------- | ------------ |
| `/` | Homepage | Start the reader somewhere sensible |
| `/<type>/<slug>/` | Article page | Read one knowledge unit deeply |
| `/concept/<slug>/` | Concept page | Resolve a term or concept canonically |
| `/moc/<slug>/` | MOC page | Browse a curated topic cluster |
| `/graph/` | Graph page | Explore structure at a distance |
| `/search/` | Search page or modal | Refinding and term lookup |
| `/review/` | Optional private review pages | Curate terminology and edge suggestions |

## 4. Primary Page Models

### 4.1 Homepage

The homepage is a start page, not an analytics panel.

Core sections:

- Site framing: what this knowledge base is about now.
- Featured reading paths: a few deliberate entry points.
- Recent or updated KUs: article cards with concise abstracts.
- Concept domains: major concept clusters or MOCs.
- Utility footer: graph, changelog, about, source repo.

Low-fidelity wireframe:

```text
+--------------------------------------------------------------+
| Super-Brain                                  Search   Graph |
+--------------------------------------------------------------+
| Framing statement / current research question                |
+--------------------------------------------------------------+
| Featured reading paths                                       |
| [Path A] [Path B] [Path C]                                   |
+--------------------------------------------------------------+
| Recent knowledge units                                       |
| - Article A                                                  |
| - Article B                                                  |
| - Slide deck C                                               |
+--------------------------------------------------------------+
| Concept domains / MOCs                                       |
| [Transformers] [Reasoning] [Stats] [Systems]                 |
+--------------------------------------------------------------+
| About | Changelog | Repo | Review (private)                  |
+--------------------------------------------------------------+
```

### 4.2 Article Page

This is the core page template.

Desktop regions:

- Left rail: breadcrumbs and a strong TOC.
- Center column: title, abstract, body, figures, equations, footnotes.
- Right rail: concept rail, small local graph teaser, provenance summary.
- Bottom appendices: backlinks, related concepts, related articles, full
  provenance, link bibliography.

Behavior:

- The concept rail stays visible while reading.
- Clicking a concept expands a card in the rail first.
- A second click or explicit CTA opens the full concept page.
- Footnotes, provenance, and related sections are collapsible by default when
  long.

Low-fidelity wireframe:

```text
+------+------------------------------------------+----------------------+
| TOC  | Title                                    | Concept Layer        |
|      | Abstract                                 | - Self-attention     |
| 1.   |------------------------------------------| - LayerNorm          |
| 2.   | Main article body                        | - Temperature        |
| 3.   | figures / equations / citations          |----------------------|
|      |                                          | Concept card         |
|      |                                          | short def            |
|      |                                          | notation             |
|      |                                          | aliases              |
|      |                                          | related concepts     |
+------+------------------------------------------+----------------------+
| Backlinks | Related Articles | Provenance | Link Bibliography        |
+---------------------------------------------------------------------+
```

Mobile adaptation:

- TOC becomes a collapsible top section.
- Concept rail becomes a drawer or lower-page appendix.
- Bottom appendices remain stacked below the body.

### 4.3 Concept Page

Concept pages are compact canonical nodes, not toy glossary entries.

Core sections:

- Preferred label and lifecycle state.
- One-sentence short definition.
- Quick facts: aliases, notation, domain, related concepts.
- Main explanation: intuition, derivation, examples, counterexamples.
- Usage: where it appears, which articles define it, which articles use it.
- Relationship block: parent, siblings, confusions, competing formulations.
- Footer: backlinks, terminology history, provenance.

Low-fidelity wireframe:

```text
+--------------------------------------------------------------+
| Self-Attention                         canonical   notation A |
+--------------------------------------------------------------+
| Short definition                                              |
+-------------------------------+------------------------------+
| Main explanation              | Quick facts                  |
| intuition / derivation        | aliases                      |
| examples / diagrams           | notation                     |
| counterexamples               | parent / sibling concepts    |
+-------------------------------+------------------------------+
| Appears in | Defined in | Related concepts | Backlinks        |
+--------------------------------------------------------------+
| Provenance / terminology history                              |
+--------------------------------------------------------------+
```

### 4.4 Search Surface

Search must serve both article lookup and concept lookup.

Result rules:

- Mix article and concept results in one ranked list.
- Use visual distinction between concept hits and article hits.
- Show short definitions for concept hits inline.
- Allow filters for KU type, concept state, source type, and domain.
- Support jump-to-section for article results when a concept match is strong.

Low-fidelity wireframe:

```text
+--------------------------------------------------------------+
| Search: [ transformer temperature ]      Filters  Sort       |
+--------------------------------------------------------------+
| Concept result                                                  |
| Temperature                                                   |
| short definition...                                           |
| aliases / notation / related concepts                         |
+--------------------------------------------------------------+
| Article result                                                  |
| Attention Is All You Need                                     |
| matching section snippet...                                   |
+--------------------------------------------------------------+
```

### 4.5 Graph Page

The graph is a secondary exploration tool. It should never become the only way
to understand the site.

Structure:

- Large graph canvas.
- Persistent detail panel for the selected node.
- Filters by KU type, domain, edge type, and review state.
- Easy jump back into article or concept pages.

Low-fidelity wireframe:

```text
+-----------------------------------------+----------------------+
| Graph canvas                            | Selected node        |
|                                         | title                |
|    o---o---o                            | short definition     |
|      \   /                              | neighbors            |
|       o-o                               | jump to article      |
|                                         | jump to concept      |
+-----------------------------------------+----------------------+
| Filters: KU type | edge type | domain | state                  |
+---------------------------------------------------------------+
```

## 5. Concept-Layer Component Spec

### 5.1 Concept Rail States

Each concept reference shown in the rail should be labeled by role and state.

Roles:

- `prerequisite`
- `core`
- `supporting`
- `notation`
- `contested`

States:

- `defined here`
- `canonical`
- `pending review`
- `contested`
- `deprecated alias`

### 5.2 Concept Card Contents

A concept card should include:

- short definition
- preferred notation
- aliases / abbreviations
- why this concept matters in the current article
- related concepts
- appears-in count or links
- CTA to open the full concept page

### 5.3 Interaction Rules

- First interaction opens the card locally.
- Second interaction navigates to the full concept page.
- Hover previews are optional on desktop.
- On touch devices, use explicit open / close gestures.
- Never cover the main reading column with a large modal unless the user asks.

## 6. Typography and Visual Language

The visual system should fit the content density.

Recommendations:

- Use a strong serif for article text and a restrained sans for UI chrome.
- Prefer neutral or warm paper-like backgrounds over bright white or heavy dark
  mode by default.
- Use color sparingly to encode state, not to decorate the page.
- Treat spacing and rule lines as structural tools.
- Make links, citations, and sidebar labels precise and legible rather than
  flashy.

## 7. What To Avoid

- SaaS dashboards as the default home or article layout.
- Oversized hero sections that push the article below the fold.
- Card grids replacing rich article excerpts.
- Glossary popups that duplicate half the article body.
- Graph canvases that become the main homepage attraction.
- Aggressive color coding that overwhelms typography.

## 8. Delivery Sequence

Recommended implementation order:

1. Article page template
2. Concept rail and concept card behavior
3. Concept page template
4. Search surface
5. Homepage curation blocks
6. Graph page refinement
7. Review pages for terminology and edge suggestions
