# MLIR Research Notes for Visualization

## 1. Scope

This document summarizes authoritative MLIR information that is directly useful
for later visualization design and implementation. The goal is not to retell
all of MLIR, but to extract the parts that define:

- what the core entities are,
- how they relate structurally,
- how transformations and pass pipelines operate on them,
- which views are justified by MLIR semantics instead of UI imagination.

## 2. Primary Sources

Official sources used in this round:

- https://mlir.llvm.org/
- https://mlir.llvm.org/docs/LangRef/
- https://mlir.llvm.org/docs/Tutorials/UnderstandingTheIRStructure/
- https://mlir.llvm.org/docs/PassManagement/
- https://mlir.llvm.org/docs/Dialects/
- https://mlir.llvm.org/docs/SymbolsAndSymbolTables/
- https://mlir.llvm.org/getting_started/Glossary/

Derived follow-up artifact:

- docs/MLIR-Visualization-Data-Model.md

## 3. What MLIR Is

MLIR is a reusable and extensible compiler infrastructure built around a
multi-level intermediate representation. According to the official overview, it
is intended to unify several needs in one system: high-level dataflow graphs,
loop and memory transformations, target-specific operations, and staged
lowering toward lower-level representations.

Important non-goal from the official overview:

- MLIR is not trying to replace low-level machine-code generation algorithms
  such as register allocation and instruction scheduling; those remain a better
  fit for lower-level systems such as LLVM.

Practical implication for visualization:

- The visual system should expect MLIR to span multiple abstraction levels in
  one corpus, not one fixed IR level.

## 4. Core Entity Model

### 4.1 Operations and Values

The MLIR Language Reference defines the high-level structure in graph terms:

- nodes are Operations
- edges are Values

A Value is the result of exactly one Operation or one Block Argument.
Each Value has a Type.

An Operation is the central abstraction in MLIR. It may have:

- zero or more operands
- zero or more results
- zero or more successors
- properties
- attributes
- zero or more enclosed regions

Visualization consequence:

- A single operation node needs both graph edges and tree children.
- A pure node-link graph is insufficient, because operations are also nested.

### 4.2 Regions and Blocks

The IR structure tutorial and LangRef agree on the recursive nesting model:

- Operation contains Region(s)
- Region contains Block(s)
- Block contains Operation(s)

A Block is a sequential list of operations. In SSA CFG regions, the last
operation must be a terminator unless the parent op opts out through
`NoTerminator`.

A Region is an ordered list of Blocks. MLIR defines at least two region kinds:

- `SSACFG`: control-flow semantics
- `Graph`: graph-like semantics without control flow

Visualization consequence:

- The nesting view should be a first-class tree view.
- Region kind must be visible, because CFG and Graph regions have different
  layout logic and different meaning of order.

### 4.3 Block Arguments

MLIR uses block arguments instead of PHI operations for control-flow dependent
values. Entry-block arguments also serve as region arguments.

Visualization consequence:

- CFG views should show block arguments as inputs on block boundaries.
- A traditional LLVM-style PHI rendering would misrepresent MLIR.

### 4.4 Dialects

Dialects are MLIR's extension mechanism. A dialect defines a namespace for new:

- operations
- attributes
- types

Multiple dialects can coexist in one module, and conversion between dialects is
explicitly part of the MLIR design.

Visualization consequence:

- Dialect is a first-class grouping dimension.
- Color, filtering, and clustering by dialect are justified.
- Cross-dialect conversion paths are worth representing separately from plain
  def-use edges.

### 4.5 Types, Attributes, and Properties

Types are attached to Values and are open-ended: dialects can define custom
types. Attributes are constant data attached to operations. Properties are
extra data members stored directly on an operation class and can be serialized
as attributes when printing generically.

Important distinction in the LangRef:

- inherent attributes belong to the op semantics itself
- discardable attributes have externally defined semantics and use dialect
  prefixes
- with properties adopted, inherent data can move out of the top-level
  attribute dictionary

Visualization consequence:

- The UI should distinguish semantic payload from incidental metadata.
- A flattened "all attributes are the same" inspector is too crude.

### 4.6 Symbols and Symbol Tables

Symbols provide a non-SSA reference mechanism. A symbol is a named operation in
an operation that defines a SymbolTable.

Key facts from the official symbols documentation:

- symbols have a unique `sym_name` in the parent symbol table
- symbols have no SSA results
- symbol references use `SymbolRefAttr`
- nested symbol references are possible, e.g. `@module_symbol::@nested_symbol`
- visibility may be `public`, `private`, or `nested`

Why MLIR uses this:

- it preserves thread-safe compilation across `IsolatedFromAbove` boundaries
- it avoids abusing SSA values for global or cross-scope references

Visualization consequence:

- There should be a symbol-reference layer separate from SSA def-use edges.
- Visibility is a meaningful visual attribute.
- "jump to definition" for symbols is not the same thing as tracing operands.

## 5. Structural Invariants Worth Preserving in the UI

These are not stylistic choices. They are semantic constraints exposed by the
official docs.

### 5.1 Hierarchical Nesting Is Fundamental

MLIR is not just a graph IR. It is recursively nested. Any serious UI needs a
containment model.

Required containment edges:

- operation -> region
- region -> block
- block -> operation

### 5.2 Def-Use Is Also Fundamental

The IR structure tutorial highlights a second relation beyond nesting:

- each operand points to a Value
- each result Value points to user operations

Required semantic edges:

- operation result -> value
- value -> user operation
- block argument -> consuming operation

### 5.3 Control Flow Depends on Region Kind

In `SSACFG` regions:

- order matters inside a block
- successors and terminators matter
- unreachable blocks are semantically removable

In `Graph` regions:

- operation order is not semantically meaningful
- non-terminator ops may be freely reordered
- cycles may exist inside a single block

Visualization consequence:

- A single default graph layout is wrong.
- CFG regions and Graph regions need different visual treatment.

### 5.4 Scoping and Isolation Matter

The LangRef and symbols docs both rely on hierarchical visibility and
`IsolatedFromAbove` constraints.

Visualization consequence:

- Scope boundaries should be visually explicit.
- Readers need to see when a value is locally visible, when a symbol crosses a
  boundary, and when a region introduces a new scope.

## 6. Transformation Model

### 6.1 Passes Operate on Operations

The pass infrastructure is operation-centered. The current unit of execution is
always some current operation.

Important pass invariants from the official docs:

- a pass must not inspect sibling operations unsafely
- a pass must not mutate operations outside the current operation's nest
- a pass must not keep mutable state across invocations of `runOnOperation`
- passes may be copied and run in parallel

Visualization consequence:

- Pass visualizations should anchor to operations, not to whole files only.
- Pass scope needs to be visible: module-level, function-level, nested-op-level.

### 6.2 Pass Managers Are Nested Like the IR

`OpPassManager` instances are anchored to operation nesting levels. Nested pass
managers mirror IR nesting.

Visualization consequence:

- A pass pipeline tree is semantically justified.
- The UI can show pipeline nesting in a tree that parallels IR nesting.

### 6.3 Analyses Are Different From Passes

Analyses are computed on demand, cached, and preserved or invalidated across
passes.

Visualization consequence:

- If later we visualize transformation history, analyses should be treated as a
  separate layer from transforming passes.
- Analysis invalidation is a real event worth exposing.

### 6.4 Official Instrumentation Already Exposes Data

The pass manager supports:

- timing
- IR printing before and after passes
- statistics
- crash / failure reproducers

Important for later implementation:

- `-mlir-timing` can emit timing data
- `-mlir-output-format=json` can emit machine-readable timing trees
- IR dumping flags can capture before / after snapshots for pass stages

This is directly actionable for building a real visualization pipeline.

## 7. Terminology That Matters for Knowledge Processing

| Term | MLIR meaning | Why it matters for visualization |
| ---- | ------------ | -------------------------------- |
| Operation | Core extensible unit of code | Primary node type |
| Value | Edge-like entity defined by op result or block argument | Def-use graph layer |
| Block | Sequential list of operations | CFG grouping unit |
| Region | Ordered list of blocks | Nesting and semantic boundary |
| Dialect | Namespace for ops, attrs, and types | Domain / abstraction grouping |
| Type | Static type carried by a value | Needed in inspectors and edge labels |
| Attribute | Constant data attached to an op | Semantic annotation layer |
| Property | Inherent op data stored directly on op class | Distinguish from discardable attrs |
| Symbol | Named operation in a symbol table | Cross-scope reference layer |
| Symbol table | Scope for named operations | Navigation and visibility model |
| Pass | Transformation or optimization over a current op | Time / stage axis |
| Analysis | Cached computation over an op without modifying it | Secondary pipeline layer |
| Lowering | Higher-level to lower-level equivalent representation | Major semantic transition |
| Conversion | Semantics-preserving transform within MLIR | Cross-dialect transformation axis |
| Translation | Boundary between MLIR and external formats | Import / export boundary |
| Legalization | Make IR conform to a conversion target | Status / goal state in pipelines |

## 8. Minimal Canonical View Model for a Future UI

If we want to stay faithful to the official semantics, a future visualization
system should at minimum model these node and edge kinds.

### 8.1 Node Kinds

- Operation
- Value
- Block
- Region
- Symbol
- Pass run
- Analysis result
- Dialect

### 8.2 Edge Kinds

- `contains`: operation -> region, region -> block, block -> operation
- `defines`: operation -> result value, block -> block argument
- `uses`: value -> operation operand site
- `branches_to`: terminator op -> successor block
- `symbol_ref`: operation -> symbol
- `scheduled_on`: pass run -> current operation
- `nested_pipeline`: pass manager -> nested pass manager
- `converts_to`: op or dialect -> lowered op / target dialect

### 8.3 Essential Views

These views are justified by the docs, not by UI taste:

1. Nesting tree: operation / region / block / operation
2. Def-use graph: values and their users
3. CFG view for SSACFG regions
4. Symbol-reference view across isolated scopes
5. Pass pipeline tree
6. Pass timeline or before/after diff view
7. Dialect distribution or clustering view

## 9. Concrete Data Collection Opportunities

The official docs already point to real extractable artifacts for later use.

### 9.1 IR Snapshot Collection

Use pass instrumentation to collect real IR snapshots:

- before pass
- after pass
- after pass only when changed
- after failure

This can produce stage-by-stage IR histories for later visualization.

### 9.2 Timing Data

Use MLIR timing output in JSON to collect:

- pass tree
- per-pass wall time
- analysis timing
- multithreaded wall vs user time

This enables later pipeline heatmaps or timing overlays.

### 9.3 Symbol and Def-Use Extraction

Parse:

- symbol definitions and `SymbolRefAttr`
- operation results and uses
- block arguments and successor edges

This gives enough data for cross-linked structural and semantic views.

## 10. Design Implications for the Existing Super-Brain Direction

These MLIR facts fit the current concept-layer and article-first design well.

- MLIR has a real, stable terminology surface: operation, region, block, value,
  dialect, symbol, pass, analysis, lowering, conversion, legalization.
- The concept-layer can therefore be grounded in official terminology rather
  than invented labels.
- The article page for MLIR topics should likely use the concept rail heavily,
  because readers repeatedly need quick reminders of terms like `SSACFG`,
  `IsolatedFromAbove`, `SymbolRefAttr`, or `BlockArgument`.
- The graph page should not be one graph. MLIR semantically wants several:
  nesting, def-use, control flow, symbol refs, pass pipeline.

## 11. Suggested Next Research Round

This first pass covered the foundational model. The next useful official topics
for deeper research are:

1. Dialect Conversion
2. PatternRewriter / DRR / PDLL
3. Traits and Interfaces
4. Builtin, Func, CF, SCF, Arith, MemRef, Tensor, Linalg, LLVM dialects
5. Transform dialect

Those areas will let us move from abstract structure into concrete MLIR
workflows and real examples for UI mockups.
