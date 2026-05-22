# MLIR Sample Extraction Plan

## 1. Purpose

This document bridges the gap between:

- the semantic research in docs/MLIR-Research-Notes.md
- the normalized schema in docs/MLIR-Visualization-Data-Model.md
- a future real extractor implementation

The goal is to define concrete sample input and expected normalized output so
that later implementation can be validated against something precise.

Important note:

- The current workspace does not have `mlir-opt` installed.
- This document therefore defines authoritative sample expectations, but does
  not claim to contain executed parser output.

## 2. Sample A: CFG and Block Arguments

This sample is based on the official block example in the MLIR Language
Reference, kept close to the original because it demonstrates:

- function as operation
- entry block arguments
- conditional branch
- block arguments replacing PHI nodes
- value flow across blocks
- terminators

```mlir
func.func @simple(i64, i1) -> i64 {
^bb0(%a: i64, %cond: i1):
  cf.cond_br %cond, ^bb1, ^bb2

^bb1:
  cf.br ^bb3(%a: i64)

^bb2:
  %b = arith.addi %a, %a : i64
  cf.br ^bb3(%b: i64)

^bb3(%c: i64):
  cf.br ^bb4(%c, %a : i64, i64)

^bb4(%d : i64, %e : i64):
  %0 = arith.addi %d, %e : i64
  return %0 : i64
}
```

## 3. Sample A: Expected Structural Extraction

### 3.1 Snapshot Summary

Expected top-level facts:

- one snapshot
- one top-level operation: `func.func`
- one region on the function body
- five blocks: `^bb0`, `^bb1`, `^bb2`, `^bb3`, `^bb4`
- seven operations inside blocks:
  - `cf.cond_br`
  - `cf.br`
  - `arith.addi`
  - `cf.br`
  - `cf.br`
  - `arith.addi`
  - `return`
- seven block arguments or op results as named textual values:
  - `%a`
  - `%cond`
  - `%b`
  - `%c`
  - `%d`
  - `%e`
  - `%0`

Note:

- MLIR textual names are printer-level identifiers and are not guaranteed to be
  persistent semantic IDs.
- The extractor should preserve them as `textual_name` when present, but still
  assign canonical internal IDs.

### 3.2 Expected Containment Tree

```text
func.func @simple
└── region[0] kind=SSACFG
    ├── block ^bb0 args=(%a, %cond)
    │   └── cf.cond_br
    ├── block ^bb1 args=()
    │   └── cf.br
    ├── block ^bb2 args=()
    │   ├── arith.addi
    │   └── cf.br
    ├── block ^bb3 args=(%c)
    │   └── cf.br
    └── block ^bb4 args=(%d, %e)
        ├── arith.addi
        └── return
```

### 3.3 Expected Control-Flow Extraction

Successor relationships:

- `cf.cond_br` in `^bb0` branches to `^bb1` and `^bb2`
- `cf.br` in `^bb1` branches to `^bb3`
- `cf.br` in `^bb2` branches to `^bb3`
- `cf.br` in `^bb3` branches to `^bb4`
- `return` in `^bb4` exits the region

Important modeling rule:

- control-flow edges should connect terminator operations to successor blocks
- branch argument passing should be modeled separately from successor topology

### 3.4 Expected Value Extraction

Value definitions:

- `%a`: block argument 0 of `^bb0`
- `%cond`: block argument 1 of `^bb0`
- `%b`: result 0 of `arith.addi` in `^bb2`
- `%c`: block argument 0 of `^bb3`
- `%d`: block argument 0 of `^bb4`
- `%e`: block argument 1 of `^bb4`
- `%0`: result 0 of `arith.addi` in `^bb4`

Direct operand uses:

- `cf.cond_br` uses `%cond`
- `arith.addi` in `^bb2` uses `%a` twice
- `cf.br` in `^bb1` uses `%a`
- `cf.br` in `^bb2` uses `%b`
- `cf.br` in `^bb3` uses `%c` and `%a`
- `arith.addi` in `^bb4` uses `%d` and `%e`
- `return` uses `%0`

Important modeling rule:

- The extractor should preserve operand uses exactly as written.
- Any later "value flow across CFG" projection should be derived on top, not
  baked into the canonical model.

## 4. Sample A: Expected Normalized Objects

The following examples show how the sample should land in the schema defined in
docs/MLIR-Visualization-Data-Model.md.

### 4.1 Function Operation

```json
{
  "id": "op-func-simple",
  "snapshot_id": "snap-simple-001",
  "lineage_id": "lineage-func-simple",
  "name": "func.func",
  "dialect": "func",
  "display_name": "func.func",
  "parent_block_id": null,
  "region_ids": ["region-func-simple-0"],
  "operand_value_ids": [],
  "result_value_ids": [],
  "successor_block_ids": [],
  "attribute_ids": [],
  "property_ids": [],
  "traits": [],
  "interfaces": [],
  "is_terminator": false,
  "is_symbol": true,
  "symbol_name": "simple",
  "symbol_visibility": null,
  "loc": null,
  "order_index": 0,
  "generic_form_available": true,
  "textual_name": "@simple"
}
```

### 4.2 Region

```json
{
  "id": "region-func-simple-0",
  "snapshot_id": "snap-simple-001",
  "parent_operation_id": "op-func-simple",
  "kind": "SSACFG",
  "block_ids": [
    "block-bb0",
    "block-bb1",
    "block-bb2",
    "block-bb3",
    "block-bb4"
  ],
  "order_index": 0,
  "isolated_from_above": true
}
```

Note:

- In practice, whether `isolated_from_above` is attached should come from the
  owning op traits rather than being guessed from syntax alone.

### 4.3 Block `^bb3`

```json
{
  "id": "block-bb3",
  "snapshot_id": "snap-simple-001",
  "parent_region_id": "region-func-simple-0",
  "argument_value_ids": ["value-bb3-arg0"],
  "operation_ids": ["op-bb3-br"],
  "label": "^bb3",
  "order_index": 3
}
```

### 4.4 Block Argument `%c`

```json
{
  "id": "value-bb3-arg0",
  "snapshot_id": "snap-simple-001",
  "kind": "block_argument",
  "type_id": "type-i64",
  "owner_operation_id": null,
  "owner_block_id": "block-bb3",
  "result_index": null,
  "argument_index": 0,
  "use_sites": [
    {
      "user_operation_id": "op-bb3-br",
      "operand_index": 0
    }
  ],
  "textual_name": "%c"
}
```

### 4.5 `arith.addi` Result `%b`

```json
{
  "id": "value-b-result",
  "snapshot_id": "snap-simple-001",
  "kind": "op_result",
  "type_id": "type-i64",
  "owner_operation_id": "op-bb2-addi",
  "owner_block_id": null,
  "result_index": 0,
  "argument_index": null,
  "use_sites": [
    {
      "user_operation_id": "op-bb2-br",
      "operand_index": 0
    }
  ],
  "textual_name": "%b"
}
```

### 4.6 `cf.cond_br`

```json
{
  "id": "op-bb0-cond-br",
  "snapshot_id": "snap-simple-001",
  "lineage_id": "lineage-op-bb0-cond-br",
  "name": "cf.cond_br",
  "dialect": "cf",
  "display_name": "cf.cond_br",
  "parent_block_id": "block-bb0",
  "region_ids": [],
  "operand_value_ids": ["value-bb0-arg1"],
  "result_value_ids": [],
  "successor_block_ids": ["block-bb1", "block-bb2"],
  "attribute_ids": [],
  "property_ids": [],
  "traits": [],
  "interfaces": [],
  "is_terminator": true,
  "is_symbol": false,
  "symbol_name": null,
  "symbol_visibility": null,
  "loc": null,
  "order_index": 0,
  "generic_form_available": true
}
```

### 4.7 Canonical Edges

Representative edges:

```json
[
  {
    "id": "edge-contains-r0-b0",
    "snapshot_id": "snap-simple-001",
    "kind": "contains_region_block",
    "from_id": "region-func-simple-0",
    "to_id": "block-bb0",
    "payload": {"order_index": 0}
  },
  {
    "id": "edge-bb2-addi-def-b",
    "snapshot_id": "snap-simple-001",
    "kind": "defines_result",
    "from_id": "op-bb2-addi",
    "to_id": "value-b-result",
    "payload": {"result_index": 0}
  },
  {
    "id": "edge-bb2-br-uses-b",
    "snapshot_id": "snap-simple-001",
    "kind": "uses",
    "from_id": "value-b-result",
    "to_id": "op-bb2-br",
    "payload": {"operand_index": 0}
  },
  {
    "id": "edge-bb0-condbr-to-bb1",
    "snapshot_id": "snap-simple-001",
    "kind": "branches_to",
    "from_id": "op-bb0-cond-br",
    "to_id": "block-bb1",
    "payload": {"successor_index": 0}
  }
]
```

## 5. Sample B: Symbol References

This sample is based on the official symbols documentation and is included
because symbol links are semantically different from SSA use-def chains.

```mlir
func.func @symbol()
"foo.user"() {uses = [@symbol]} : () -> ()

module @module_symbol {
  func.func @nested_symbol()
}

"foo.user"() {uses = [@module_symbol::@nested_symbol]} : () -> ()
```

## 6. Sample B: Expected Symbol Extraction

### 6.1 Symbol Definitions

Expected symbols:

- symbol `@symbol` defined by a `func.func`
- symbol `@module_symbol` defined by a `module`
- symbol `@nested_symbol` defined inside the symbol table of `@module_symbol`

### 6.2 Symbol References

Expected symbol-reference objects:

```json
[
  {
    "id": "symref-foo-user-1",
    "snapshot_id": "snap-symbol-001",
    "user_operation_id": "op-foo-user-1",
    "attribute_name": "uses",
    "path": ["symbol"],
    "target_symbol_id": "symbol-symbol",
    "resolution_scope_operation_id": "op-root"
  },
  {
    "id": "symref-foo-user-2",
    "snapshot_id": "snap-symbol-001",
    "user_operation_id": "op-foo-user-2",
    "attribute_name": "uses",
    "path": ["module_symbol", "nested_symbol"],
    "target_symbol_id": "symbol-nested-symbol",
    "resolution_scope_operation_id": "op-root"
  }
]
```

Important modeling rule:

- A symbol reference should not be modeled as a `uses` edge from a Value.
- It is a separate relation with its own scoping and resolution semantics.

## 7. Extractor Validation Rules

A future extractor implementation should pass these checks on the samples above.

1. Every block label becomes exactly one block object.
2. Every block argument becomes exactly one value object with kind
   `block_argument`.
3. Every operation result becomes exactly one value object with kind `op_result`.
4. Every operand site is preserved as an explicit use.
5. Every terminator successor becomes an explicit `branches_to` edge.
6. Every symbol definition becomes a symbol object, not just an op attribute.
7. Every `SymbolRefAttr` path becomes an explicit symbol-reference object.
8. Region order and block order are preserved.
9. Textual identifiers are preserved as optional presentation fields, not reused
   as canonical IDs.

## 8. Recommended Next Implementation Step

Because the environment currently lacks `mlir-opt`, the best next engineering
step is:

1. choose a parser entry point for textual MLIR
2. implement extraction for Sample A only
3. emit normalized JSON matching docs/MLIR-Visualization-Data-Model.md
4. verify the output against this document
5. then add Sample B symbol extraction

That keeps the first prototype tightly scoped while still covering the semantic
areas most important for visualization.
