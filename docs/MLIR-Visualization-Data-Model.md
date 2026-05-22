# MLIR Visualization Data Model

## 1. Goal

This document turns the MLIR research note into a concrete data model for later
visualization work. It is intentionally derived from official MLIR semantics,
not from arbitrary UI patterns.

Companion document:

- docs/MLIR-Research-Notes.md

## 2. Design Constraints Derived From MLIR

These constraints come from the official MLIR overview, LangRef, IR structure
tutorial, symbol documentation, and pass management documentation.

1. MLIR is both nested and graph-shaped.
   A correct model must preserve containment and def-use at the same time.
2. Region kind matters.
   `SSACFG` regions and `Graph` regions cannot share one default projection.
3. Block arguments are first-class.
   They are not a cosmetic variant of PHI nodes.
4. Symbol references are distinct from SSA use-def edges.
   They cross scope differently and must stay separate in the model.
5. Pass execution is operation-scoped and nested.
   Transformation history must therefore attach to operation scopes and pass
   manager nesting.
6. Analyses are not passes.
   They need separate modeling if we expose invalidation or reuse.

## 3. Four-Layer Model

To stay stable as the product evolves, the data model should be split into four
layers.

### 3.1 Semantic Layer

The semantic layer stores MLIR entities and relationships that are true for one
snapshot of IR:

- operations
- values
- blocks
- regions
- symbols
- dialects
- types
- attributes
- properties
- semantic edges among them

### 3.2 Snapshot Layer

A snapshot is one concrete state of the IR at one point in time, for example:

- original input IR
- before a pass
- after a pass
- after pipeline failure

The snapshot layer groups semantic entities by capture time and source.

### 3.3 Transformation Layer

The transformation layer stores process information:

- pass managers
- pass runs
- analyses
- timing
- invalidation
- before / after snapshot links

### 3.4 View Layer

The view layer stores derived projections optimized for presentation:

- nesting tree
- def-use graph
- CFG graph
- symbol reference graph
- pass pipeline tree
- dialect distribution summaries

Important rule:

- View-layer objects are projections, not the source of truth.

## 4. Identity Strategy

Identity is the hardest part of any MLIR visualization system.

### 4.1 Snapshot-Local Identity

Within one snapshot, every entity should have a stable local identifier.

Examples:

- operation id
- region id
- block id
- value id
- symbol id

These identifiers only need to be unique within the corpus.

### 4.2 Cross-Snapshot Identity

Across passes, operations may be rewritten, split, folded, erased, or replaced.
The official docs do not guarantee a universal stable identity across pass
runs.

Therefore the model should distinguish:

- `id`: exact entity instance in one snapshot
- `lineage_id`: best-effort continuity across snapshots
- `origin`: how the lineage link was derived

Suggested `origin` values:

- `exact_location_match`
- `symbol_name_match`
- `structural_match`
- `rewrite_inferred`
- `unknown`

Important rule:

- The system must tolerate missing lineage.
- Lineage is a derived hypothesis, not a semantic truth guaranteed by MLIR.

## 5. Canonical Core Schema

The following schemas are language-agnostic. They can be stored as JSON,
materialized into SQLite tables, or projected into graph structures.

### 5.1 Corpus

```json
{
  "corpus_id": "mlir-sample-001",
  "title": "Toy module pipeline",
  "source_kind": "mlir-file",
  "source_path": "examples/toy.mlir",
  "created_at": "2026-05-22T00:00:00Z"
}
```

### 5.2 Snapshot

```json
{
  "snapshot_id": "snap-0003",
  "corpus_id": "mlir-sample-001",
  "kind": "after-pass",
  "label": "after canonicalize",
  "pass_run_id": "passrun-0007",
  "sequence": 3,
  "root_operation_id": "op-0001",
  "text_excerpt": null,
  "source": {
    "capture_mode": "mlir-print-ir-after-all",
    "tool": "mlir-opt"
  }
}
```

### 5.3 Operation

```json
{
  "id": "op-0102",
  "snapshot_id": "snap-0003",
  "lineage_id": "lineage-op-0041",
  "name": "func.call",
  "dialect": "func",
  "display_name": "func.call",
  "parent_block_id": "block-0018",
  "region_ids": [],
  "operand_value_ids": ["value-0310", "value-0311"],
  "result_value_ids": ["value-0312"],
  "successor_block_ids": [],
  "attribute_ids": ["attr-0191"],
  "property_ids": [],
  "traits": [],
  "interfaces": [],
  "is_terminator": false,
  "is_symbol": false,
  "symbol_name": null,
  "symbol_visibility": null,
  "loc": "loc(\"toy.mlir\":12:4)",
  "order_index": 2,
  "generic_form_available": true
}
```

### 5.4 Region

```json
{
  "id": "region-0009",
  "snapshot_id": "snap-0003",
  "parent_operation_id": "op-0020",
  "kind": "SSACFG",
  "block_ids": ["block-0015", "block-0016"],
  "order_index": 0,
  "isolated_from_above": false
}
```

### 5.5 Block

```json
{
  "id": "block-0015",
  "snapshot_id": "snap-0003",
  "parent_region_id": "region-0009",
  "argument_value_ids": ["value-0201", "value-0202"],
  "operation_ids": ["op-0098", "op-0099", "op-0100"],
  "label": "^bb0",
  "order_index": 0
}
```

### 5.6 Value

```json
{
  "id": "value-0312",
  "snapshot_id": "snap-0003",
  "kind": "op_result",
  "type_id": "type-0048",
  "owner_operation_id": "op-0102",
  "owner_block_id": null,
  "result_index": 0,
  "argument_index": null,
  "use_sites": [
    {
      "user_operation_id": "op-0105",
      "operand_index": 1
    }
  ]
}
```

For block arguments:

```json
{
  "id": "value-0201",
  "snapshot_id": "snap-0003",
  "kind": "block_argument",
  "type_id": "type-0019",
  "owner_operation_id": null,
  "owner_block_id": "block-0015",
  "result_index": null,
  "argument_index": 0,
  "use_sites": []
}
```

### 5.7 Type

```json
{
  "id": "type-0048",
  "snapshot_id": "snap-0003",
  "dialect": null,
  "mnemonic": "i32",
  "assembly": "i32"
}
```

### 5.8 Attribute

```json
{
  "id": "attr-0191",
  "snapshot_id": "snap-0003",
  "owner_operation_id": "op-0102",
  "name": "callee",
  "dialect_prefix": null,
  "kind": "inherent",
  "value_assembly": "@foo"
}
```

Suggested `kind` values:

- `inherent`
- `discardable`
- `unknown`

### 5.9 Property

```json
{
  "id": "prop-0004",
  "snapshot_id": "snap-0003",
  "owner_operation_id": "op-0041",
  "name": "someProperty",
  "value_assembly": "..."
}
```

### 5.10 Symbol

```json
{
  "id": "symbol-0003",
  "snapshot_id": "snap-0003",
  "defining_operation_id": "op-0020",
  "symbol_name": "foo",
  "visibility": "private",
  "parent_symbol_table_operation_id": "op-0001",
  "is_declaration": false
}
```

### 5.11 Dialect

```json
{
  "id": "dialect-func",
  "snapshot_id": "snap-0003",
  "name": "func",
  "operation_ids": ["op-0020", "op-0102"],
  "type_ids": [],
  "attribute_ids": []
}
```

## 6. Canonical Edge Schema

Even if data is stored in normalized tables, the model should explicitly define
semantic edge types.

```json
{
  "id": "edge-0011",
  "snapshot_id": "snap-0003",
  "kind": "uses",
  "from_id": "value-0312",
  "to_id": "op-0105",
  "payload": {
    "operand_index": 1
  }
}
```

Required edge kinds:

- `contains_operation_region`
- `contains_region_block`
- `contains_block_operation`
- `defines_result`
- `defines_block_argument`
- `uses`
- `branches_to`
- `symbol_ref`
- `has_attribute`
- `has_property`
- `typed_as`
- `belongs_to_dialect`

## 7. Symbol Reference Schema

Symbol references should not be hidden inside a generic attribute blob if we
intend to visualize them.

```json
{
  "id": "symref-0005",
  "snapshot_id": "snap-0003",
  "user_operation_id": "op-0102",
  "attribute_name": "callee",
  "path": ["module_symbol", "nested_symbol"],
  "target_symbol_id": "symbol-0009",
  "resolution_scope_operation_id": "op-0001"
}
```

This explicit object makes it easy to build:

- symbol navigation,
- symbol dependency graphs,
- scope-aware reference explanations.

## 8. Transformation Schema

### 8.1 Pass Manager

```json
{
  "id": "pm-0002",
  "corpus_id": "mlir-sample-001",
  "anchor_op_name": "func.func",
  "parent_pass_manager_id": "pm-0001",
  "nesting_depth": 1,
  "text_pipeline": "func.func(canonicalize,cse)"
}
```

### 8.2 Pass Run

```json
{
  "id": "passrun-0007",
  "corpus_id": "mlir-sample-001",
  "pass_manager_id": "pm-0002",
  "pass_name": "canonicalize",
  "anchor_operation_name": "func.func",
  "target_operation_id": "op-0020",
  "sequence": 7,
  "status": "success",
  "before_snapshot_id": "snap-0002",
  "after_snapshot_id": "snap-0003",
  "timing": {
    "wall_ms": 1.84,
    "user_ms": 1.77
  },
  "statistics": {},
  "changed": true
}
```

### 8.3 Analysis Event

```json
{
  "id": "analysis-0010",
  "corpus_id": "mlir-sample-001",
  "analysis_name": "DominanceInfo",
  "operation_id": "op-0020",
  "snapshot_id": "snap-0003",
  "state": "computed"
}
```

Suggested `state` values:

- `computed`
- `reused`
- `invalidated`

### 8.4 Rewrite / Lineage Event

```json
{
  "id": "rewrite-0003",
  "corpus_id": "mlir-sample-001",
  "pass_run_id": "passrun-0007",
  "before_entity_ids": ["op-0090"],
  "after_entity_ids": ["op-0102"],
  "kind": "replace",
  "confidence": 0.71,
  "origin": "structural_match"
}
```

This event is optional but valuable if we want step-by-step transformation
stories instead of only snapshot diffs.

## 9. View Projection Schemas

The same semantic model should drive multiple projections.

### 9.1 Nesting Tree Projection

```json
{
  "view_id": "tree-snap-0003",
  "snapshot_id": "snap-0003",
  "root_id": "op-0001",
  "kind": "nesting_tree"
}
```

Node rendering rules:

- operation nodes show op name, dialect, result arity, region count
- region nodes show region kind
- block nodes show block label and argument list

### 9.2 Def-Use Projection

```json
{
  "view_id": "defuse-snap-0003",
  "snapshot_id": "snap-0003",
  "kind": "def_use_graph",
  "focus_value_ids": ["value-0312"],
  "edge_kinds": ["defines_result", "uses"]
}
```

### 9.3 CFG Projection

```json
{
  "view_id": "cfg-region-0009",
  "snapshot_id": "snap-0003",
  "kind": "cfg",
  "region_id": "region-0009",
  "edge_kinds": ["branches_to"]
}
```

Only valid for `SSACFG` regions.

### 9.4 Symbol Projection

```json
{
  "view_id": "symbols-snap-0003",
  "snapshot_id": "snap-0003",
  "kind": "symbol_graph",
  "edge_kinds": ["symbol_ref"]
}
```

### 9.5 Pass Pipeline Projection

```json
{
  "view_id": "pipeline-001",
  "corpus_id": "mlir-sample-001",
  "kind": "pass_pipeline",
  "root_pass_manager_id": "pm-0001"
}
```

### 9.6 Pass History Projection

```json
{
  "view_id": "history-op-0020",
  "corpus_id": "mlir-sample-001",
  "kind": "operation_history",
  "focus_lineage_id": "lineage-op-0041"
}
```

## 10. Extraction Pipeline

A future implementation should build data in this order.

1. Capture raw IR snapshots.
2. Parse structural entities: operations, regions, blocks, values.
3. Extract semantic relations: contains, uses, successors.
4. Extract symbol definitions and symbol references.
5. Extract dialect membership, types, attributes, properties.
6. Capture pass managers, pass runs, timing, and analyses.
7. Derive lineage links across snapshots.
8. Materialize projection-specific indexes.

Important rule:

- Later UI code should consume the normalized model first and only then build
  projection caches.

## 11. What Should Stay Out of the Core Model

To avoid premature lock-in, these should not be hard-coded into the canonical
schema yet:

- pixel coordinates for graph layouts
- UI-specific collapse / expand state
- user annotations
- theme colors
- article-level prose summaries
- concept-layer cards unrelated to the actual IR instance

Those belong in adjacent layers, not the MLIR semantic core.

## 12. Recommended First Implementation Slice

If we want the smallest high-value end-to-end prototype, the first slice should
support:

1. one input MLIR file
2. one parsed snapshot
3. operation / region / block / value extraction
4. def-use edges
5. symbol references
6. one nesting-tree view
7. one def-use graph view

That slice is sufficient to validate whether the data model matches real MLIR
without yet taking on pass history or lineage.

## 13. Open Questions

These are the main issues still requiring deeper research or experimentation.

1. How should we extract stable-enough cross-snapshot lineage for rewritten ops?
2. Should custom assembly and generic assembly both be stored for each op?
3. How much trait and interface metadata should be normalized eagerly?
4. Should dialect docs be indexed so UI inspectors can deep-link to op docs?
5. How should source locations be normalized across imported or generated IR?
