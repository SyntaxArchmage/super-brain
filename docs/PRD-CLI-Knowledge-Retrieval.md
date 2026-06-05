# Product Requirements Document: CLI Knowledge Retrieval & MCP Integration

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Product Name   | Super-Brain CLI (`sb`)                                 |
| Document Type  | Product Requirements Document (PRD)                    |
| Version        | 1.0 (Draft)                                            |
| Status         | Proposed                                               |
| Owner          | Albert                                                 |
| Last Updated   | 2026-06-05                                             |
| Depends On     | PRD-Personal-Knowledge-Base v1.1                               |
| Related To     | PRD-Multi-Level-Architecture v1.0 (optional; CLI works with or without it) |

### Change Log

- **1.0** — Initial draft. The CLI is positioned as the **killer feature**
  that transforms Super-Brain from a passive read-only website into an
  active knowledge retrieval system embedded in the developer's daily
  workflow.

---

## 1. Executive Summary

Super-Brain currently exists only as a GitHub Pages static website. To
read your own knowledge, you must open a browser, navigate to the site,
and visually scan articles. This creates a fundamental friction: **your
knowledge is locked behind a browser tab** instead of being available
where you work — the terminal, the editor, the AI agent session.

This PRD proposes `sb`, a command-line tool that turns the Super-Brain
repository into a **queryable knowledge API**. The CLI reads all topic
wikis' `data.js` files, builds a local search index, and exposes the
knowledge base through commands like `sb search`, `sb query`, `sb ask`.

The strategic extension is **MCP (Model Context Protocol) integration**:
the same retrieval engine is exposed as MCP tools that AI agents in Cursor
(or any MCP-compatible environment) can call during coding sessions. This
creates a loop where:

1. You research a topic and write it into Super-Brain.
2. Your AI coding agent uses that knowledge during your next coding
   session — without you having to copy-paste or explain context.

This is the **digital brain** vision: accumulated knowledge that actively
participates in your work.

## 2. Problem Statement

### 2.1 The Browser-Only Problem

| Situation                                  | Current Workflow                           | Desired Workflow                    |
| ------------------------------------------ | ------------------------------------------ | ----------------------------------- |
| Writing MLIR code, forget ODS syntax       | Open browser → navigate wiki → find page   | `sb query "ODS"` in terminal        |
| Debugging a lowering pass                  | Open browser → search → read article       | `sb context "lowering"` → paste     |
| AI agent coding a compiler pass            | Manually paste knowledge into prompt        | Agent calls `sb_search` MCP tool    |
| Comparing two approaches                   | Open two browser tabs, read both            | `sb compare "PDL" "DRR"`           |
| Starting research on a new topic           | Create files manually, copy template        | `sb new "ev-battery"`              |

### 2.2 The AI Agent Context Gap

Modern coding agents (Cursor, Claude Code, Codex) are powerful but lack
**personal domain knowledge**. They know public documentation, but they
don't know:

- Your specific understanding of a concept.
- Your comparative analysis of two approaches.
- Your research notes and source evidence.
- Your decision rationale from past investigations.

The MCP integration bridges this gap: the agent queries your Super-Brain
as a first-class knowledge source during its reasoning.

## 3. Goals and Non-Goals

### 3.1 Goals (G)

- **G1** Provide a CLI (`sb`) that can search, query, and retrieve
  knowledge from Super-Brain topic wikis entirely offline.
- **G2** Support structured output (plain text, JSON, Markdown) suitable
  for both human reading and programmatic consumption.
- **G3** Expose the retrieval engine as **MCP tools** compatible with
  Cursor, Claude Desktop, and any MCP host.
- **G4** Support **LLM-powered Q&A** (`sb ask`) that uses the knowledge
  base as RAG context and cites source articles.
- **G5** Provide topic management commands (`sb topics`, `sb new`,
  `sb serve`) for everyday workflow.
- **G6** Work with **both** the current single-wiki layout (`site/data.js`)
  and the proposed multi-topic layout (`site/topics/*/data.js`).
  Auto-detects which layout is in use.
- **G7** Install globally via npm (`npm install -g super-brain-cli`) or
  run locally from the repo (`node cli/bin/sb.js`). (The npm scope
  `@super-brain` may be taken; use an unscoped name or a personal scope
  like `@albert-kb/cli`. Verify before publishing.)

### 3.2 Non-Goals (NG)

- **NG1** Write operations — the CLI does not edit `data.js` files. Content
  authoring remains manual or agent-assisted in the editor.
- **NG2** Embedding generation — the CLI uses simple text-based search, not
  vector similarity. (Embedding-based retrieval is a future enhancement.)
- **NG3** Web server for production — `sb serve` is a local dev preview
  only.
- **NG4** Syncing with remote — the CLI works on the local git checkout.
  It does not fetch from GitHub Pages.

---

## 4. Command Reference

### 4.1 Search

```
sb search <query> [--topic=<id>] [--type=page|concept] [--format=text|json|md] [--limit=N]
```

Full-text search across all topics (or a specific topic). Returns ranked
results with context snippets.

**Output (default text):**

```
$ sb search "dialect conversion"

  MLIR Deep Dive / MLIR
  ── Dialect Conversion ──
  The Dialect Conversion framework provides a mechanism for converting
  operations between dialects via ConversionTarget, TypeConverter, and
  ConversionPattern...
  Concepts: DialectConversion · ConversionTarget · TypeConverter
  Score: 94

  MLIR Deep Dive / Lowering Pipelines
  ── Progressive Lowering ──
  ...uses Dialect Conversion to lower from high-level dialects to
  lower-level ones, preserving type safety through TypeConverter...
  Score: 72

2 results across 1 topic (0.03s)
```

**Output (JSON):**

```json
{
  "query": "dialect conversion",
  "results": [
    {
      "topic": "mlir",
      "page": "mlir",
      "title": "MLIR",
      "section": "Dialect Conversion",
      "snippet": "...",
      "score": 94,
      "concepts": ["DialectConversion", "ConversionTarget"]
    }
  ],
  "meta": { "totalResults": 2, "timeMs": 30 }
}
```

### 4.2 Query Concept

```
sb query <concept-name> [--topic=<id>] [--format=text|json|md]
```

Look up a specific concept across all topics. Returns the definition,
examples, related concepts, source articles, and external sources.

**Output:**

```
$ sb query "Region"

  ── Region (MLIR Core Structure) ──
  Topic: MLIR Deep Dive

  An ordered list of Blocks owned by an Operation; semantics are defined
  by the enclosing operation (SSACFG for control-flow, Graph for
  unordered dataflow).

  Examples:
    func.func @f() {
      // This function body is a Region containing one Block
      ^entry:
        return
    }

  Related: Operation · Block · Value · SSACFG · Graph Region
  Appears in: MLIR (core), IR Design Principles
  Sources:
    • MLIR Language Reference — https://mlir.llvm.org/docs/LangRef/
```

### 4.3 Compare

```
sb compare <concept-A> <concept-B> [--format=text|json|md]
```

Side-by-side structural comparison of two concepts. Pulls each concept's
definition, related concepts, and `usedIn` pages from across topics and
renders them in a table. This is a **data-only operation** — it does not
use an LLM. For an intelligent analysis of differences, pipe the output
into `sb ask` (e.g., `sb compare "A" "B" --format=md | sb ask --stdin "which is better for X?"`).


**Output:**

```
$ sb compare "SSACFG Region" "Graph Region"

  ┌─────────────────────────┬──────────────────────────┐
  │ SSACFG Region           │ Graph Region             │
  ├─────────────────────────┼──────────────────────────┤
  │ Ordered blocks with     │ Unordered operations;    │
  │ control-flow edges      │ def-use only semantics   │
  │ (branches, terminators) │ (dataflow graphs)        │
  ├─────────────────────────┼──────────────────────────┤
  │ Used by: func, scf, cf  │ Used by: hw, graph       │
  │ Most common in compilers│ Common in HLS, hardware  │
  └─────────────────────────┴──────────────────────────┘

  Both are Region types in MLIR's recursive nesting model.
```

### 4.4 Context

```
sb context <topic-or-concept> [--max-tokens=N] [--format=text|md]
```

Generate a concise knowledge brief suitable for pasting into an editor,
a PR description, or an AI prompt. Optimized for information density.

`--max-tokens` controls output size. Without an LLM key, the CLI
approximates tokens as `chars / 4` and truncates the article body to fit,
appending the full concept list and source references. With an LLM key
set, `sb context` optionally sends the full text to the LLM for
summarization to the specified length (pass `--summarize` to enable).

**Output:**

```
$ sb context "MLIR lowering" --max-tokens=500

  ## MLIR Lowering (Knowledge Brief)

  Lowering in MLIR is the process of converting operations from
  higher-level dialects to lower-level ones. Key mechanisms:

  1. **Dialect Conversion** — ConversionTarget defines legal ops,
     TypeConverter handles type mapping, ConversionPattern rewrites
     individual ops.
  2. **Progressive lowering** — multi-step: linalg → affine → scf → cf
     → llvm. Each step is a separate pass.
  3. **Full vs Partial** — Full conversion requires all ops to be legal;
     partial allows mixed dialects temporarily.

  Source: Super Brain / MLIR Deep Dive / Lowering Pipelines
```

### 4.5 Ask (LLM-Powered)

```
sb ask <question> [--model=<model>] [--topic=<id>]
```

Ask a natural-language question. The CLI retrieves relevant context from
the knowledge base, constructs a RAG prompt, and sends it to an LLM. The
response cites source articles.

**Requires:** `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in environment, or
a local Ollama instance running.

**Output:**

```
$ sb ask "Should I use PatternRewriter or DialectConversion for this rewrite?"

  Based on your Super-Brain knowledge base:

  **Use PatternRewriter** when you are rewriting operations within the
  same dialect (same types, just different op patterns). PatternRewriter
  applies greedy pattern matching and does not require a ConversionTarget.

  **Use DialectConversion** when you are converting between dialects —
  especially when types need to change. DialectConversion provides
  TypeConverter for systematic type mapping and ensures all operations in
  the target are legal.

  Summary: If your types stay the same → PatternRewriter (simpler).
  If types change or you're crossing dialect boundaries → DialectConversion.

  Sources:
    • MLIR / Lowering Pipelines — "Progressive Lowering" section
    • MLIR / MLIR — "Dialect Conversion Framework" section
```

### 4.6 Topics

```
sb topics [--sort=name|updated|articles] [--format=text|json]
```

List all research topics with stats.

**Output:**

```
$ sb topics --sort=updated

  Topic              Articles  Concepts  Updated     Status
  ─────────────────  ────────  ────────  ──────────  ──────
  MPV Car Research   16        20+       2026-06-03  Complete
  MLIR Deep Dive     11        33        2026-05-22  Active
  HPC Memory          2         5        2026-05-20  Draft
  AI Serving          2         4        2026-05-18  Draft

  4 topics · 31 articles · 62+ concepts
```

### 4.7 New

```
sb new <topic-id> [--title=<title>] [--lang=en|zh]
```

Scaffold a new research topic with template files.

Creates:

```
site/topics/<topic-id>/
├── index.html          ← pre-configured with topic title
├── data.js             ← template with empty taxonomy/pages/concepts
├── app.js              ← imports wiki-framework.js
├── styles.css          ← imports wiki-styles.css
└── topic-meta.json     ← metadata template
```

### 4.8 Serve

```
sb serve [--topic=<id>] [--port=N]
```

Start a local HTTP server for previewing topics. Without `--topic`,
serves the entire site (Face Page + all topics). With `--topic`, serves
only that topic wiki.

---

## 5. MCP Integration

### 5.1 Architecture

The CLI's retrieval engine is wrapped in an MCP server that exposes
tools to AI agents:

```
┌─────────────────────────┐
│  Cursor / Claude Agent  │
│  (MCP Host)             │
└────────┬────────────────┘
         │ MCP Protocol
         ▼
┌─────────────────────────┐
│  sb MCP Server          │
│  (stdio transport)      │
│                         │
│  Tools:                 │
│   sb_search             │
│   sb_concept            │
│   sb_compare            │
│   sb_context            │
└────────┬────────────────┘
         │ reads
         ▼
┌─────────────────────────┐
│  site/topics/*/data.js  │
│  (local filesystem)     │
└─────────────────────────┘
```

### 5.2 MCP Tool Definitions

**`sb_search`**

```json
{
  "name": "sb_search",
  "description": "Search the user's personal knowledge base (Super-Brain) for articles and concepts related to a query. Returns ranked results with context snippets.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search query" },
      "topic": { "type": "string", "description": "Optional: limit to a specific topic ID" },
      "limit": { "type": "number", "description": "Max results (default 5)" }
    },
    "required": ["query"]
  }
}
```

**`sb_concept`**

```json
{
  "name": "sb_concept",
  "description": "Look up a specific concept in the user's knowledge base. Returns definition, examples, related concepts, and source articles.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Concept name to look up" },
      "topic": { "type": "string", "description": "Optional: limit to a specific topic" }
    },
    "required": ["name"]
  }
}
```

**`sb_compare`**

```json
{
  "name": "sb_compare",
  "description": "Compare two concepts or approaches using the user's accumulated research notes.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "a": { "type": "string", "description": "First concept or term" },
      "b": { "type": "string", "description": "Second concept or term" }
    },
    "required": ["a", "b"]
  }
}
```

**`sb_context`**

```json
{
  "name": "sb_context",
  "description": "Generate a concise knowledge brief from the user's research, optimized for inclusion in prompts or documentation.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "subject": { "type": "string", "description": "The subject to generate context for (a concept name, article title, or free-text query)" },
      "topic": { "type": "string", "description": "Optional: limit to a specific topic ID" },
      "maxTokens": { "type": "number", "description": "Approximate max tokens (default 500)" }
    },
    "required": ["subject"]
  }
}
```

### 5.3 MCP Server Configuration

The MCP server is configured in Cursor via `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "super-brain": {
      "command": "sb",
      "args": ["mcp-serve"],
      "cwd": "/path/to/super-brain"
    }
  }
}
```

Or as a Cursor skill that auto-discovers the Super-Brain repo:

```yaml
# ~/.cursor/skills/super-brain-knowledge/SKILL.md
# Triggered when user says "check my super-brain" or
# "what do my notes say about X"
```

### 5.4 Usage Examples

**In Cursor chat:**

```
User: "I'm writing a lowering pass from linalg to affine.
       Check my super-brain for the right approach."

Agent: [calls sb_context with topic="MLIR lowering"]
       [calls sb_concept with name="DialectConversion"]

       Based on your Super-Brain knowledge base, you should use
       DialectConversion because you're crossing dialect boundaries
       (linalg → affine). Here's the pattern from your notes:
       ...
```

**In Cursor CLI:**

```bash
# Quick reference while coding
sb query "ConversionTarget" | less

# Generate context for a PR description
sb context "MLIR bytecode format" --format=md >> pr-body.md

# Search before starting new research
sb search "quantization" --format=json | jq '.results[].title'
```

---

## 6. Technical Design

### 6.1 Technology Stack

| Component          | Choice                | Rationale                              |
| ------------------ | --------------------- | -------------------------------------- |
| Language           | Node.js (ESM)         | Matches data.js format; no build step  |
| CLI framework      | Commander.js           | Lightweight, well-known                |
| Search engine      | MiniSearch (in-memory) | Same as planned for web; fast, small   |
| Output formatting  | chalk + cli-table3     | Terminal colors and table rendering    |
| MCP server         | @modelcontextprotocol/sdk | Official MCP SDK                   |
| LLM integration    | openai / @anthropic-ai/sdk | For `sb ask` command             |
| Package manager    | npm                   | Global install via npm                 |

### 6.2 Data Loading

The CLI loads topic data by evaluating each `data.js` file in a sandboxed
context:

```javascript
import { readFileSync } from "fs";
import { createContext, Script } from "vm";

function loadTopicData(dataJsPath) {
  const code = readFileSync(dataJsPath, "utf-8");
  const ctx = createContext({});
  const script = new Script(code);
  script.runInContext(ctx);
  return ctx.WIKI;
}
```

This approach:
- Requires no build step or transpilation.
- Works with the exact same `data.js` format used by the browser.
- Isolates each topic's data (no global namespace collision).

### 6.3 HTML → Plain Text

The `body` field in `data.js` contains HTML markup (`<h2>`, `<p>`,
`<div class="evidence">`, etc.). The CLI must strip HTML for terminal
display and for feeding clean text into the search index and RAG prompts.

Strategy: use a lightweight approach — regex strip (`/<[^>]+>/g`) for
the search index and terminal output. For `sb context` and `sb ask`
where structure matters, use a minimal HTML parser (e.g., `htmlparser2`)
to preserve headings, lists, and code blocks as Markdown.

### 6.4 Search Index

On first run (or when data changes), the CLI builds a MiniSearch index
from all topics and caches it at `.cache/search-index.json`:

```javascript
import MiniSearch from "minisearch";

const index = new MiniSearch({
  fields: ["title", "subtitle", "body", "conceptNames"],
  storeFields: ["title", "topic", "pageId", "type"],
  searchOptions: {
    boost: { title: 3, conceptNames: 2 },
    fuzzy: 0.2,
    prefix: true
  }
});
```

Cache invalidation: compare `data.js` file mtimes against cached index
timestamp.

### 6.5 LLM Integration (`sb ask`)

```
User question
    │
    ▼
sb search (top 5 results)
    │
    ▼
Build RAG prompt:
  "You are an assistant with access to the user's personal
   knowledge base. Answer based ONLY on the following context.
   Cite source articles.
   
   Context:
   [search result 1: title, body excerpt]
   [search result 2: title, body excerpt]
   ...
   
   Question: {user question}"
    │
    ▼
LLM API call (OpenAI / Anthropic / Ollama)
    │
    ▼
Format response with source citations
```

### 6.6 Project Structure

```
cli/
├── package.json
├── bin/
│   └── sb.js               ← CLI entry point
├── src/
│   ├── commands/
│   │   ├── search.js
│   │   ├── query.js
│   │   ├── compare.js
│   │   ├── context.js
│   │   ├── ask.js
│   │   ├── topics.js
│   │   ├── new.js
│   │   └── serve.js
│   ├── core/
│   │   ├── loader.js        ← Load data.js files
│   │   ├── indexer.js        ← Build MiniSearch index
│   │   ├── formatter.js      ← Text/JSON/Markdown output
│   │   └── config.js         ← Repo path detection
│   ├── mcp/
│   │   ├── server.js         ← MCP server implementation
│   │   └── tools.js          ← Tool definitions
│   └── llm/
│       ├── provider.js       ← OpenAI/Anthropic/Ollama abstraction
│       └── prompts.js        ← RAG prompt templates
└── templates/
    └── topic/                ← Template for `sb new`
        ├── index.html
        ├── data.js
        ├── app.js
        ├── styles.css
        └── topic-meta.json
```

---

## 7. Milestones

| Phase  | Theme                     | Deliverables                                            | Duration |
| ------ | ------------------------- | ------------------------------------------------------- | -------- |
| **P1** | Core CLI                  | `sb search`, `sb query`, `sb topics`, data loading      | 1 week   |
| **P2** | Extended CLI              | `sb compare`, `sb context`, `sb new`, `sb serve`        | 1 week   |
| **P3** | MCP Integration           | MCP server, `sb_search`/`sb_concept`/`sb_context` tools | 1 week   |
| **P4** | LLM-Powered Q&A           | `sb ask` with RAG, multi-provider support               | 1 week   |
| **P5** | Polish & Distribution     | npm package, documentation, Cursor skill, tests         | 1 week   |

---

## 8. Non-Functional Requirements

| ID    | Category         | Requirement                                                       |
| ----- | ---------------- | ----------------------------------------------------------------- |
| NFR1  | Performance      | `sb search` returns results in < 100ms for 50 topics.             |
| NFR2  | Portability      | Works on macOS, Linux, Windows (Node.js 18+).                     |
| NFR3  | Offline          | All commands except `sb ask` work fully offline.                  |
| NFR4  | Privacy          | No data leaves the machine except `sb ask` (explicit LLM calls).  |
| NFR5  | Zero config      | Auto-detects super-brain repo by walking up from cwd.             |
| NFR6  | Graceful fallback| Missing LLM key → `sb ask` prints helpful error, other cmds work.|

---

## 9. Risks and Mitigations

| Risk                                           | Mitigation                                           |
| ---------------------------------------------- | ---------------------------------------------------- |
| data.js format changes break the CLI loader    | Version-check the WIKI object structure at load time. |
| MiniSearch defaults to whitespace tokenization, which fails on CJK text | Use MiniSearch's custom `tokenize` option with `Intl.Segmenter` (Node 16+ natively supports Chinese word segmentation). Fall back to jieba-wasm if `Intl.Segmenter` is unavailable. |
| LLM hallucination despite RAG context          | Strict "cite only from provided context" prompt + source attribution. |
| MCP protocol changes break integration         | Pin @modelcontextprotocol/sdk version; watch for breaking changes. |
| Users forget to update CLI after adding topics | Cache invalidation based on file mtime; warn on stale index. |

---

## 10. Future Enhancements (Out of Scope for v1)

- **Embedding-based search** — use local embeddings (BGE-M3 via
  transformers.js or Ollama) for semantic similarity search alongside
  keyword search.
- **Write commands** — `sb add-concept`, `sb add-page` to create content
  from the CLI.
- **Watch mode** — `sb watch` monitors data.js changes and auto-rebuilds
  the search index.
- **Cursor Rule integration** — auto-generate Cursor rules from
  Super-Brain concepts so the agent always has your knowledge in context.
- **Export** — `sb export --format=anki` to generate Anki flashcards from
  concepts for spaced repetition learning.

---

## 11. Success Criteria

- [ ] `sb search "MLIR"` returns relevant results from the terminal.
- [ ] `sb query "Region"` shows the full concept with definition and examples.
- [ ] `sb ask "What is dialect conversion?"` returns an accurate, cited answer.
- [ ] Cursor agent can call `sb_search` MCP tool during a coding session.
- [ ] `sb new "test-topic"` creates a working topic scaffold.
- [ ] Total install + first query takes < 30 seconds.
