# Wiki Refactor Handoff

## 1. Current Task

The current task is no longer "polish the MLIR page".

The real task is:

- refactor the current single-page MLIR dossier into a real multi-page wiki shell,
- preserve the strong article-first reading style,
- move MLIR into the correct role inside the knowledge base,
- make the left side a global collapsible knowledge navigation tree,
- keep the right side as a concept / terminology / contribution layer,
- keep the site deployable through GitHub Pages on `git push`.

## 2. Real Goal

The target product is a static research wiki, not a one-off report page.

The correct product model is:

- left rail: global, collapsible taxonomy navigation for the whole knowledge base,
- center column: one current article page,
- right rail: concept layer, terminology layer, contribution context,
- page graph: many knowledge pages across domains,
- MLIR: both a standalone page and a contributor to many other pages.

Target knowledge scope mentioned by the user:

- compiler
- high-performance computing
- AI
- AI infra
- programming languages

Expected MLIR role inside that system:

- MLIR has its own dedicated page under a compiler infrastructure path,
- MLIR also contributes examples, mechanisms, and implementation practice to many
  other pages,
- MLIR should not dominate the site architecture as if the whole wiki were an
  MLIR dossier.

## 3. What Is Wrong With the Current Implementation

The current deployed site is visually decent but structurally wrong.

Root problems:

1. The site is implemented as one single MLIR dossier page.
2. The left rail is a page-local article map instead of a site-wide navigation tree.
3. The page model is linear (`Raw -> Knowledge -> Visualize -> Contract`) rather
   than a reusable wiki page shell.
4. MLIR is modeled as the main narrative object instead of one node in a much
   larger knowledge graph.
5. The current data model in the frontend is centered on one MLIR report, not on
   reusable entities such as taxonomy pages, article pages, concept pages, and
   cross-page contributions.

In short:

- the current implementation works as a reviewable MLIR showcase,
- it does not work as the real knowledge-base shell the user asked for.

## 4. Repository State

Current branch state when this handoff document was written:

- branch: `main`
- HEAD: `4d320bc`
- remote: `origin/main`
- working tree: clean

Recent commits:

- `4d320bc` Retry Pages deploy
- `3176d7a` Enable Pages in deploy workflow
- `9e9d324` Build MLIR review prototype
- `77f0f7a` Define concept layer and UI blueprint

This means:

- there are no current uncommitted code edits,
- the site is deployed and accessible,
- the next correction has not yet been implemented.

## 5. What Is Already Completed

### 5.1 Documentation already in repo

The following documents exist and are useful inputs for the next implementation:

- `docs/PRD-Personal-Knowledge-Base.md`
- `docs/UI-Design-Blueprint.md`
- `docs/MLIR-Research-Notes.md`
- `docs/MLIR-Visualization-Data-Model.md`
- `docs/MLIR-Sample-Extraction.md`

These should be treated as existing source material, not rewritten blindly.

### 5.2 Frontend already in repo

The current static frontend exists at:

- `site/index.html`
- `site/app.js`
- `site/styles.css`

What it currently is:

- a single-page MLIR dossier,
- with an article-first center column,
- a right-side concept rail,
- MLIR-specific sections and visualization panels.

What it is not:

- not a multi-page wiki shell,
- not a taxonomy-driven site,
- not a cross-domain knowledge system.

### 5.3 Deployment already works

GitHub Pages deployment is already wired through:

- `.github/workflows/deploy-pages.yml`

The public site is live at:

- https://syntaxarchmage.github.io/super-brain/

This deployment path should be preserved.

## 6. Current Half-Done State

This is important because the conversation drift made the status confusing.

### 6.1 What is actually half-done

The real half-done work is conceptual, not code-level.

Half-done conceptual shift:

- the wrongness of the single-page dossier was identified,
- the correct target model was verbally clarified,
- the replacement direction was decided,
- but the actual refactor has not yet landed in code.

### 6.2 What is not half-done

There is no partial local rewrite sitting in the working tree.

Specifically:

- no uncommitted refactor of `site/index.html`
- no uncommitted refactor of `site/app.js`
- no uncommitted refactor of `site/styles.css`

So the current repo state is:

- deployed single-page dossier remains the active implementation,
- planned wiki-shell refactor exists only as clarified intent, not as code.

## 7. Problems Encountered

### 7.1 Product misunderstanding

The main failure was not styling or deployment. It was product-model mismatch.

The implementation path incorrectly assumed:

- "build a polished MLIR page first"

Instead of the correct requirement:

- "build a reusable wiki shell first, then place MLIR correctly inside it"

### 7.2 Repeated loop behavior

The work started looping because the implementation kept improving the wrong
artifact:

- fixing layout,
- fixing deployment,
- refining MLIR presentation,

while the user's real objection was architectural.

### 7.3 Missing intermediate artifact

Before attempting the refactor, an explicit handoff / state document should have
been written earlier. This file exists to correct that omission.

## 8. Acceptance Criteria For The Next Implementation

The next implementation should only be considered correct if all of the
following are true.

### 8.1 Site shell

- The left side is a global collapsible taxonomy navigation tree.
- The navigation is for the whole knowledge base, not for one article.
- The center column renders one current page at a time.
- The right rail is a persistent concept / terminology / contribution layer.

### 8.2 Page model

- The site supports multiple knowledge pages, not one MLIR dossier.
- There is at least one index-like page type and one article-like page type.
- Concept pages are either already implemented or clearly modeled as distinct
  entities.

### 8.3 Taxonomy

- The taxonomy includes the broad domains the user named.
- Compiler is represented as one domain, not the whole site.
- MLIR appears under a compiler infrastructure path, not as the top-level site
  frame.

### 8.4 MLIR placement

- MLIR has its own dedicated page.
- Parser is a separate page.
- The parser page shows how MLIR contributes to parser-adjacent practice instead
  of pretending MLIR is the parser topic itself.
- MLIR contributes to multiple pages through explicit cross-page contribution
  structures.

### 8.5 Deployment

- The refactored site still deploys through GitHub Pages via `git push`.
- Existing Pages workflow remains functional after the refactor.

## 9. Current Todo List

This is the current intended todo list, rewritten clearly.

1. Replace the current single-page dossier shell with a real wiki shell.
2. Redesign frontend data structures around taxonomy pages, article pages,
   concept pages, and contribution links.
3. Build the left collapsible global navigation tree.
4. Build a reusable center-column article page template.
5. Keep the right rail as concept / terminology / contribution context.
6. Reposition MLIR as both a standalone page and a distributed contributor.
7. Add at least a small but real multi-page taxonomy covering the named domains.
8. Validate locally in browser.
9. Redeploy to GitHub Pages.

## 10. Recommended Next Move

The next implementation should start from information architecture, not from
page polish.

Recommended order:

1. define the minimal taxonomy tree and page types,
2. define the frontend data model around pages and contributions,
3. rebuild `site/index.html`, `site/app.js`, and `site/styles.css` around that
   shell,
4. then migrate MLIR into the correct place.

## 11. Files Most Likely To Change Next

The next real refactor will most likely touch:

- `site/index.html`
- `site/app.js`
- `site/styles.css`

The deployment file should probably remain unchanged unless the refactor breaks
the current static artifact path.

## 12. Summary In One Sentence

The repository currently contains a deployed MLIR dossier prototype, but the
real unfinished task is to replace that prototype with a taxonomy-driven,
multi-page wiki shell where MLIR is only one page and one contribution source
inside a much larger knowledge base.