---
name: super-brain-knowledge
description: >-
  Query the user's personal Super Brain knowledge base from the CLI.
  Use when the user asks to check their notes, research, or knowledge base,
  or when they mention "super-brain", "my notes", "my research",
  "what do I know about", "check my wiki", or ask domain questions
  that might be answered by their accumulated research.
---

# Super Brain Knowledge Retrieval

The user has a personal knowledge base at `~/workspace/super-brain` with the `sb` CLI installed globally.

## When to Use

- User asks "what do my notes say about X?"
- User asks "check my super-brain for Y"
- User says "what do I know about Z?"
- User is working on a topic covered by their wiki (compiler/MLIR, MPV cars, etc.)
- User needs context from their research for a coding task

## Available Commands

Run from `~/workspace/super-brain` (or any subdirectory — `sb` auto-detects the repo).

### Search (most common)
```bash
cd ~/workspace/super-brain && sb search "<query>" --limit=5
```
Full-text search. Works with English and Chinese. Returns ranked results with snippets.

### Concept Lookup
```bash
cd ~/workspace/super-brain && sb query "<concept-name>"
```
Returns definition, examples, related concepts, sources.

### Compare Two Concepts
```bash
cd ~/workspace/super-brain && sb compare "<concept-A>" "<concept-B>"
```
Side-by-side structural comparison.

### Knowledge Brief (for prompts/docs)
```bash
cd ~/workspace/super-brain && sb context "<subject>" --max-tokens=500 --format=md
```
Concise brief optimized for pasting into prompts or docs.

### List Topics
```bash
cd ~/workspace/super-brain && sb topics
```

### JSON Output
All commands support `--format=json` for structured output:
```bash
cd ~/workspace/super-brain && sb search "MLIR" --format=json --limit=3
```

## Workflow

1. **Search first** — use `sb search` to find relevant articles/concepts
2. **Drill down** — use `sb query` for specific concept details
3. **Synthesize** — use `sb context` to generate a brief for the user or for your own context
4. **Present** — summarize findings, cite source articles by name

## Current Topics

| Topic | Content |
|-------|---------|
| compiler-research | MLIR, lowering pipelines, IR design, type systems, AI compilers, HPC |
| mpv-research | EV MPV car comparison (batteries, chassis, ADAS, safety, pricing) |

## Remote Mode (no local repo needed)

All commands support `--remote <url>` to fetch from GitHub Pages:
```bash
sb search "MLIR" --remote https://syntaxarchmage.github.io/super-brain/
```

Persist the URL so you never need `--remote` again:
```bash
sb config set remote-url https://syntaxarchmage.github.io/super-brain/
```

After this, `sb search "MLIR"` works from anywhere without a local repo.

## Notes

- `sb` requires Node.js 18+
- Local mode: fully offline. Remote mode: fetches from GitHub Pages
- CJK (Chinese) search is supported natively
- Run `sb --help` for full command reference
