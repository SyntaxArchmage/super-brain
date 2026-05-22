const SECTION_LINKS = [
  { id: "intro", label: "Entry" },
  { id: "raw", label: "Raw Material" },
  { id: "knowledge", label: "Knowledge Cut" },
  { id: "concept-layer", label: "Concept Layer" },
  { id: "visualize", label: "Structural Lenses" },
  { id: "contract", label: "Data Contract" },
  { id: "limits", label: "Limits and Deploy" }
];

const DOSSIER = {
  metrics: [
    { value: "7", label: "official sources" },
    { value: "14", label: "persistent concepts and terms" },
    { value: "5", label: "structural visualization lenses" },
    { value: "3", label: "derived MLIR artifacts in repo" }
  ],
  sampleIR: `func.func @simple(i64, i1) -> i64 {
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
}`,
  sources: [
    {
      title: "MLIR Overview",
      role: "Foundation",
      url: "https://mlir.llvm.org/",
      focus: "What MLIR is for and what it is not trying to replace.",
      facts: [
        "MLIR is a reusable, extensible multi-level IR framework.",
        "It is designed to span high-level graphs, loop transforms, and staged lowering.",
        "Low-level machine-code algorithms remain a better fit for LLVM-level infrastructure."
      ]
    },
    {
      title: "Language Reference",
      role: "Semantic core",
      url: "https://mlir.llvm.org/docs/LangRef/",
      focus: "Operations, values, blocks, regions, types, attributes, properties.",
      facts: [
        "Operations are the central abstraction and may own operands, results, successors, attributes, properties, and regions.",
        "Values are defined either by operation results or block arguments.",
        "Regions come in SSACFG and Graph forms, which changes the meaning of order and flow."
      ]
    },
    {
      title: "Understanding the IR Structure",
      role: "Traversal evidence",
      url: "https://mlir.llvm.org/docs/Tutorials/UnderstandingTheIRStructure/",
      focus: "Recursive nesting and def-use traversal APIs.",
      facts: [
        "The tutorial walks the IR as Operation -> Region -> Block -> Operation.",
        "It separately traces Value users and defining operations.",
        "This directly justifies separate containment and def-use views."
      ]
    },
    {
      title: "Pass Management",
      role: "Transformation scope",
      url: "https://mlir.llvm.org/docs/PassManagement/",
      focus: "Operation-scoped passes, nested pass managers, timing and IR capture.",
      facts: [
        "Passes execute on a current operation and must not mutate outside that nest.",
        "Nested OpPassManager structure mirrors IR nesting.",
        "Timing and IR printing already expose future visualization inputs."
      ]
    },
    {
      title: "Dialects",
      role: "Namespace layer",
      url: "https://mlir.llvm.org/docs/Dialects/",
      focus: "Dialect namespaces for operations, attributes, and types.",
      facts: [
        "Dialects are MLIR's extension mechanism.",
        "Multiple dialects co-exist in one module.",
        "Dialect boundaries are a valid grouping and filtering dimension."
      ]
    },
    {
      title: "Symbols and Symbol Tables",
      role: "Cross-scope references",
      url: "https://mlir.llvm.org/docs/SymbolsAndSymbolTables/",
      focus: "SymbolRefAttr, visibility, nested references, IsolatedFromAbove rationale.",
      facts: [
        "Symbols are named operations inside symbol tables.",
        "Symbol references are non-SSA and use SymbolRefAttr.",
        "Nested references such as @module_symbol::@nested_symbol are legal and meaningful."
      ]
    },
    {
      title: "Glossary",
      role: "Terminology boundary",
      url: "https://mlir.llvm.org/getting_started/Glossary/",
      focus: "Lowering, conversion, translation, legalization, terminator, module.",
      facts: [
        "Conversion is distinct from translation: one stays inside MLIR, the other crosses into or out of MLIR.",
        "Lowering describes movement toward a lower-level but equivalent representation.",
        "Legalization means making IR conform to a conversion target."
      ]
    }
  ],
  knowledgeCards: [
    {
      title: "Recursive nesting is not optional",
      text: "MLIR is not just a graph of operations. The official traversal model is recursively nested and any faithful UI needs containment edges alongside graph edges.",
      bullets: [
        "Operation owns Region",
        "Region owns Block",
        "Block owns ordered Operations"
      ]
    },
    {
      title: "Values are their own semantic layer",
      text: "Values are not just labels on lines. They are first-class carriers of type and use-def structure, and block arguments are part of the same value story.",
      bullets: [
        "op result -> Value",
        "block argument -> Value",
        "Value -> user operation"
      ]
    },
    {
      title: "Scope is split between SSA visibility and symbols",
      text: "The symbol system exists precisely because cross-scope access cannot always be represented as direct SSA use. That difference must remain visible in the UI.",
      bullets: [
        "hierarchical dominance for Values",
        "SymbolRefAttr for non-SSA links",
        "visibility: public, private, nested"
      ]
    },
    {
      title: "Pass structure mirrors operation structure",
      text: "Passes are operation-scoped and nested pass managers follow operation nesting. That means transformation views should be rooted in operation scopes, not only in files or timelines.",
      bullets: [
        "current operation matters",
        "nested OpPassManager matters",
        "timing and IR snapshots are future data feeds"
      ]
    }
  ],
  relationships: [
    {
      title: "Containment chain",
      arrow: "Operation -> Region -> Block -> Operation",
      text: "This is the backbone of the dossier. Every other lens hangs off this structure rather than replacing it."
    },
    {
      title: "Def-use chain",
      arrow: "Operation result -> Value -> user Operation",
      text: "Values connect the producer side and consumer side. A visualization that skips Value as a node loses MLIR's actual semantics."
    },
    {
      title: "CFG transfer",
      arrow: "Terminator -> successor Block",
      text: "Control flow is block-local and terminator-driven in SSACFG regions. Branch argument passing rides on top of that topology."
    },
    {
      title: "Symbol indirection",
      arrow: "SymbolRefAttr -> Symbol -> SymbolTable",
      text: "Cross-scope references need their own layer because symbol resolution is not the same as tracing operands or results."
    },
    {
      title: "Pass anchoring",
      arrow: "Pass run -> current Operation",
      text: "A pass run is meaningful only relative to the operation nest it is allowed to inspect and mutate."
    },
    {
      title: "Pipeline nesting",
      arrow: "Pass manager -> nested Pass manager",
      text: "Pass pipelines are not flat lists by default; MLIR's pass infrastructure already exposes the nested tree we should later visualize."
    }
  ],
  conceptClusters: [
    {
      kicker: "Core entities",
      title: "IR building blocks",
      text: "These are the persistent semantic units that all later views and summaries depend on.",
      items: ["Operation", "Value", "Region", "Block", "Dialect"]
    },
    {
      kicker: "Scope and references",
      title: "Visibility machinery",
      text: "MLIR uses both hierarchical dominance and symbol indirection. Readers need both in reach while inspecting examples.",
      items: ["BlockArgument", "Symbol", "SymbolRefAttr", "SymbolTable", "IsolatedFromAbove"]
    },
    {
      kicker: "Transformation",
      title: "How IR changes over time",
      text: "Transformation vocabulary is not merely editorial. It defines what a future pipeline view must encode and distinguish.",
      items: ["Pass", "Analysis", "Lowering", "Conversion", "Legalization"]
    }
  ],
  concepts: [
    {
      id: "operation",
      name: "Operation",
      category: "Core entity",
      summary: "The central MLIR abstraction; owns operands, results, successors, attributes, properties, and regions.",
      definition: "Operations are MLIR's fully extensible building blocks. They can represent function definitions, calls, loops, target instructions, or custom domain constructs.",
      importance: "A correct UI cannot flatten operations into a single node type without also showing their nested regions and multiple semantic attachments.",
      views: ["Containment", "Def-use", "CFG", "Pass scope"],
      badges: ["official", "core", "view-critical"],
      sources: [
        { label: "LangRef / Operations", url: "https://mlir.llvm.org/docs/LangRef/#operations" },
        { label: "Glossary / Operation", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    {
      id: "value",
      name: "Value",
      category: "Core entity",
      summary: "A typed result of one operation or one block argument.",
      definition: "In MLIR's high-level structure, operations act like nodes and values act like edges. Each value has exactly one defining source but potentially many users.",
      importance: "This is why the def-use lens shows values explicitly instead of treating them as labels floating between operation cards.",
      views: ["Def-use", "CFG"],
      badges: ["official", "core", "typed"],
      sources: [
        { label: "LangRef / High-Level Structure", url: "https://mlir.llvm.org/docs/LangRef/#high-level-structure" },
        { label: "IR Structure / Def-use Chains", url: "https://mlir.llvm.org/docs/Tutorials/UnderstandingTheIRStructure/" }
      ]
    },
    {
      id: "region",
      name: "Region",
      category: "Structure",
      summary: "An ordered list of MLIR blocks whose semantics are defined by the containing operation.",
      definition: "A region has no independent name or type. It exists only as a contained body on an operation, and the containing operation determines whether the region behaves like SSACFG or Graph.",
      importance: "The UI must show region kind because it changes whether order and control flow are semantically meaningful.",
      views: ["Containment", "CFG"],
      badges: ["official", "scope", "order-sensitive"],
      sources: [
        { label: "LangRef / Regions", url: "https://mlir.llvm.org/docs/LangRef/#regions" }
      ]
    },
    {
      id: "block",
      name: "Block",
      category: "Structure",
      summary: "A sequential list of operations, with optional block arguments and successor semantics in SSACFG regions.",
      definition: "Blocks are the unit that control-flow terminators target. In SSACFG regions they behave like basic blocks, and block arguments stand in for traditional PHI machinery.",
      importance: "Every CFG lens here is block-first because that matches the MLIR definition instead of importing LLVM-specific visual assumptions.",
      views: ["Containment", "CFG"],
      badges: ["official", "cfg", "ordered"],
      sources: [
        { label: "LangRef / Blocks", url: "https://mlir.llvm.org/docs/LangRef/#blocks" },
        { label: "Glossary / Block", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    {
      id: "dialect",
      name: "Dialect",
      category: "Namespace",
      summary: "The namespace mechanism MLIR uses to define operations, attributes, and types.",
      definition: "Dialects make MLIR extensible without breaking the single meta-IR frame. Multiple dialects can live inside one module and be transformed between one another.",
      importance: "Dialect is a valid grouping dimension for clustering, filtering, and color assignment in later larger corpora.",
      views: ["Containment", "Contract"],
      badges: ["official", "grouping", "extensibility"],
      sources: [
        { label: "LangRef / Dialects", url: "https://mlir.llvm.org/docs/LangRef/#dialects" },
        { label: "Dialects index", url: "https://mlir.llvm.org/docs/Dialects/" }
      ]
    },
    {
      id: "symbol",
      name: "Symbol",
      category: "Scope",
      summary: "A named operation inside a symbol table, referenced through SymbolRefAttr rather than SSA operands.",
      definition: "Symbols provide a non-SSA mechanism for cross-scope references, especially across IsolatedFromAbove boundaries where raw SSA visibility is intentionally constrained.",
      importance: "The prototype therefore gives symbols their own view instead of folding them into ordinary operand edges.",
      views: ["Symbols", "Contract"],
      badges: ["official", "scope", "non-ssa"],
      sources: [
        { label: "Symbols and Symbol Tables", url: "https://mlir.llvm.org/docs/SymbolsAndSymbolTables/" }
      ]
    },
    {
      id: "pass",
      name: "Pass",
      category: "Transformation",
      summary: "A transformation or optimization that runs on a current operation.",
      definition: "MLIR passes are operation-scoped. They may be nested and copied for parallel execution, and they cannot mutate outside the current operation's nest.",
      importance: "Pass views should anchor to operation scope and nesting instead of pretending the pipeline is just a global list of steps.",
      views: ["Pass scope", "Contract"],
      badges: ["official", "transform", "scoped"],
      sources: [
        { label: "Pass Management", url: "https://mlir.llvm.org/docs/PassManagement/" }
      ]
    },
    {
      id: "analysis",
      name: "Analysis",
      category: "Transformation",
      summary: "A computed, reusable, invalidatable result attached to an operation scope rather than a mutating pass.",
      definition: "Analyses are computed on demand, cached, and preserved or invalidated across passes. They belong to the transformation story but are semantically distinct from passes.",
      importance: "A future pipeline UI should distinguish analysis computation and invalidation from the passes that modify IR.",
      views: ["Pass scope", "Contract"],
      badges: ["official", "transform", "derived"],
      sources: [
        { label: "Pass Management / Analysis Management", url: "https://mlir.llvm.org/docs/PassManagement/" }
      ]
    }
  ],
  terms: [
    {
      id: "block-argument",
      name: "BlockArgument",
      category: "Term",
      summary: "A block-owned value that replaces PHI-style value merging in SSACFG regions.",
      definition: "Entry-block arguments also act as region arguments, while arguments on non-entry blocks receive values from branch-like terminators.",
      importance: "Without this term in reach, MLIR CFG diagrams become misleadingly LLVM-like.",
      views: ["CFG", "Def-use"],
      badges: ["official", "cfg", "term"],
      sources: [
        { label: "LangRef / Blocks", url: "https://mlir.llvm.org/docs/LangRef/#blocks" }
      ]
    },
    {
      id: "ssacfg",
      name: "SSACFG",
      category: "Region kind",
      summary: "A region kind where operations execute sequentially and terminators specify successor blocks.",
      definition: "In SSACFG regions, order inside a block matters, control enters through the entry block, and non-listed blocks are unreachable by definition.",
      importance: "This term determines whether a CFG lens is semantically valid for a given region.",
      views: ["CFG"],
      badges: ["official", "region-kind", "term"],
      sources: [
        { label: "LangRef / Control Flow and SSACFG Regions", url: "https://mlir.llvm.org/docs/LangRef/#control-flow-and-ssacfg-regions" }
      ]
    },
    {
      id: "graph-region",
      name: "Graph region",
      category: "Region kind",
      summary: "A graph-like region kind where order is not semantically meaningful and cyclic relationships may exist.",
      definition: "Graph regions are appropriate for concurrent or graph-shaped semantics and are currently limited to one block in MLIR.",
      importance: "It is the reason the dossier refuses to use one default layout for all regions.",
      views: ["Containment"],
      badges: ["official", "region-kind", "term"],
      sources: [
        { label: "LangRef / Graph Regions", url: "https://mlir.llvm.org/docs/LangRef/#graph-regions" }
      ]
    },
    {
      id: "symbol-ref-attr",
      name: "SymbolRefAttr",
      category: "Reference",
      summary: "The attribute form used to reference symbols by name, including nested symbol paths.",
      definition: "SymbolRefAttr may point to a symbol in the nearest enclosing symbol table or traverse nested symbol table scopes through a multi-part path.",
      importance: "The symbol lens is built on explicit symbol-reference objects for exactly this reason.",
      views: ["Symbols", "Contract"],
      badges: ["official", "non-ssa", "term"],
      sources: [
        { label: "Symbols and Symbol Tables / Referencing a Symbol", url: "https://mlir.llvm.org/docs/SymbolsAndSymbolTables/" }
      ]
    },
    {
      id: "isolated-from-above",
      name: "IsolatedFromAbove",
      category: "Scope rule",
      summary: "A trait that restricts directly accessing values defined in containing regions.",
      definition: "This restriction supports thread-safe compilation and is one of the reasons the symbol system exists for cross-boundary references.",
      importance: "The scope story in MLIR is wrong if this rule remains invisible.",
      views: ["Symbols", "Containment"],
      badges: ["official", "scope", "term"],
      sources: [
        { label: "LangRef / Value Scoping", url: "https://mlir.llvm.org/docs/LangRef/#value-scoping" },
        { label: "Symbols and Symbol Tables", url: "https://mlir.llvm.org/docs/SymbolsAndSymbolTables/" }
      ]
    },
    {
      id: "lowering",
      name: "Lowering",
      category: "Transformation term",
      summary: "Transforming a higher-level representation into a lower-level but semantically equivalent one.",
      definition: "MLIR commonly performs lowering through dialect conversion and staged legalization.",
      importance: "This term should not be conflated with every transformation; it marks a specific direction in abstraction level.",
      views: ["Pass scope"],
      badges: ["official", "transform", "term"],
      sources: [
        { label: "Glossary / Lowering", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    {
      id: "conversion",
      name: "Conversion",
      category: "Transformation term",
      summary: "A semantics-preserving transform within MLIR, either across dialects or within one dialect.",
      definition: "Conversion stays inside MLIR and is therefore distinct from translation to or from an external representation.",
      importance: "This boundary matters when later visualizing transformation stages and import-export edges.",
      views: ["Pass scope"],
      badges: ["official", "transform", "term"],
      sources: [
        { label: "Glossary / Conversion", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    {
      id: "translation",
      name: "Translation",
      category: "Transformation term",
      summary: "Crossing between MLIR and an external representation.",
      definition: "Importing into MLIR and exporting out of MLIR both count as translation, not conversion.",
      importance: "This keeps repository-native MLIR transforms separate from boundary-crossing steps.",
      views: ["Pass scope"],
      badges: ["official", "boundary", "term"],
      sources: [
        { label: "Glossary / Translation", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    {
      id: "legalization",
      name: "Legalization",
      category: "Transformation term",
      summary: "Reaching a representation that satisfies the legality requirements of a conversion target.",
      definition: "Legalization describes the state reached by conversion, not just the existence of a rewrite rule.",
      importance: "A future pipeline UI can use it as a state or goal label rather than as a vague synonym for lowering.",
      views: ["Pass scope"],
      badges: ["official", "transform", "term"],
      sources: [
        { label: "Glossary / Legalization", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    {
      id: "terminator",
      name: "Terminator operation",
      category: "Control flow",
      summary: "An operation that must terminate a block in control-flow regions unless the owning op opts out.",
      definition: "Branches and returns are terminators. In SSACFG regions they define successor topology or exit behavior.",
      importance: "CFG edges should originate from terminators, not from blocks as an undifferentiated unit.",
      views: ["CFG"],
      badges: ["official", "cfg", "term"],
      sources: [
        { label: "Glossary / Terminator operation", url: "https://mlir.llvm.org/getting_started/Glossary/" },
        { label: "LangRef / Blocks", url: "https://mlir.llvm.org/docs/LangRef/#blocks" }
      ]
    }
  ],
  lenses: [
    {
      id: "containment",
      label: "Containment",
      title: "Recursive containment is the base map",
      intro: "The first lens keeps the official MLIR nesting visible as its own structure instead of collapsing everything into a flat graph.",
      type: "tree",
      chips: ["Sample A / function body", "official block model", "SSACFG region"],
      notes: [
        {
          title: "Why this lens exists",
          body: "The IR structure tutorial literally traverses Operation, Region, and Block separately. The UI mirrors that instead of hiding containment behind a generic tree widget."
        },
        {
          title: "What to notice",
          body: "The region node carries the semantic label SSACFG, and block arguments stay attached to blocks rather than becoming pseudo-operations."
        }
      ],
      tree: {
        label: "func.func @simple",
        tag: "Operation",
        children: [
          {
            label: "region[0] / SSACFG",
            tag: "Region",
            children: [
              { label: "^bb0 (%a, %cond)", tag: "Block", children: [{ label: "cf.cond_br", tag: "Operation" }] },
              { label: "^bb1", tag: "Block", children: [{ label: "cf.br", tag: "Operation" }] },
              {
                label: "^bb2",
                tag: "Block",
                children: [
                  { label: "arith.addi -> %b", tag: "Operation" },
                  { label: "cf.br", tag: "Operation" }
                ]
              },
              { label: "^bb3 (%c)", tag: "Block", children: [{ label: "cf.br", tag: "Operation" }] },
              {
                label: "^bb4 (%d, %e)",
                tag: "Block",
                children: [
                  { label: "arith.addi -> %0", tag: "Operation" },
                  { label: "return", tag: "Operation" }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      id: "cfg",
      label: "CFG",
      title: "Control flow is terminator-driven",
      intro: "This view shows the same sample as a control-flow lens. Branch argument passing is surfaced in edge labels, but topology still originates from terminators and successor blocks.",
      type: "graph",
      chips: ["block arguments", "successor edges", "terminators only"],
      notes: [
        {
          title: "Why the edge labels matter",
          body: "The label on each edge captures the values passed into successor block arguments. That keeps MLIR's PHI-free design legible without inventing a PHI node layer."
        },
        {
          title: "Why blocks stay visible",
          body: "In SSACFG regions, blocks are the correct control-flow unit. A node-link graph over individual ops would obscure branch structure."
        }
      ],
      graph: {
        width: 900,
        height: 360,
        nodes: [
          { id: "bb0", x: 340, y: 24, w: 210, h: 72, title: "^bb0", subtitle: "args: %a, %cond | cf.cond_br", tone: "alt" },
          { id: "bb1", x: 110, y: 138, w: 180, h: 68, title: "^bb1", subtitle: "cf.br", tone: "default" },
          { id: "bb2", x: 570, y: 138, w: 210, h: 86, title: "^bb2", subtitle: "arith.addi -> %b | cf.br", tone: "accent" },
          { id: "bb3", x: 340, y: 258, w: 210, h: 72, title: "^bb3", subtitle: "args: %c | cf.br", tone: "default" },
          { id: "bb4", x: 340, y: 448, w: 230, h: 88, title: "^bb4", subtitle: "args: %d, %e | addi -> %0 | return", tone: "alt" }
        ],
        edges: [
          { from: "bb0", to: "bb1", label: "if true", fromAnchor: "bottom-left", toAnchor: "top" },
          { from: "bb0", to: "bb2", label: "if false", fromAnchor: "bottom-right", toAnchor: "top" },
          { from: "bb1", to: "bb3", label: "pass %a", fromAnchor: "bottom-right", toAnchor: "left" },
          { from: "bb2", to: "bb3", label: "pass %b", fromAnchor: "bottom-left", toAnchor: "right" },
          { from: "bb3", to: "bb4", label: "pass %c, %a", fromAnchor: "bottom", toAnchor: "top" }
        ]
      }
    },
    {
      id: "defuse",
      label: "Def-Use",
      title: "Values are explicit, not implied",
      intro: "The def-use lens keeps Values visible as their own nodes so the reader can inspect who defines them and who consumes them.",
      type: "graph",
      chips: ["Value as node", "typed edges", "focused slice"],
      notes: [
        {
          title: "Why value nodes are shown",
          body: "The tutorial explicitly traverses users through Value objects. This lens follows that semantic boundary instead of drawing direct op-to-op data arrows."
        },
        {
          title: "Focused rather than exhaustive",
          body: "The graph zooms in on the values that actually travel across blocks in the sample. Full modules would need filtering and collapse rules."
        }
      ],
      graph: {
        width: 940,
        height: 360,
        nodes: [
          { id: "a", x: 24, y: 96, w: 140, h: 58, title: "%a", subtitle: "BlockArgument | i64", tone: "alt" },
          { id: "cond", x: 24, y: 198, w: 160, h: 58, title: "%cond", subtitle: "BlockArgument | i1", tone: "alt" },
          { id: "condbr", x: 246, y: 188, w: 190, h: 68, title: "cf.cond_br", subtitle: "uses %cond", tone: "default" },
          { id: "addi-b", x: 246, y: 74, w: 200, h: 72, title: "arith.addi", subtitle: "uses %a, %a", tone: "accent" },
          { id: "b", x: 520, y: 84, w: 150, h: 58, title: "%b", subtitle: "op result | i64", tone: "alt" },
          { id: "br-b", x: 728, y: 84, w: 170, h: 68, title: "cf.br", subtitle: "passes %b", tone: "default" },
          { id: "c", x: 520, y: 222, w: 150, h: 58, title: "%c", subtitle: "BlockArgument | i64", tone: "alt" },
          { id: "br-ca", x: 728, y: 210, w: 170, h: 78, title: "cf.br", subtitle: "passes %c and %a", tone: "default" },
          { id: "ret", x: 728, y: 324, w: 170, h: 58, title: "return", subtitle: "uses %0", tone: "default" }
        ],
        edges: [
          { from: "cond", to: "condbr", label: "operand 0", fromAnchor: "right", toAnchor: "left" },
          { from: "a", to: "addi-b", label: "operand 0/1", fromAnchor: "right", toAnchor: "left" },
          { from: "addi-b", to: "b", label: "defines", fromAnchor: "right", toAnchor: "left" },
          { from: "b", to: "br-b", label: "operand 0", fromAnchor: "right", toAnchor: "left" },
          { from: "br-b", to: "c", label: "binds to ^bb3(%c)", fromAnchor: "bottom-left", toAnchor: "top" },
          { from: "c", to: "br-ca", label: "operand 0", fromAnchor: "right", toAnchor: "left" },
          { from: "a", to: "br-ca", label: "operand 1", fromAnchor: "bottom-right", toAnchor: "top-left", style: "dashed" }
        ]
      }
    },
    {
      id: "symbols",
      label: "Symbols",
      title: "Symbol references are a separate semantic channel",
      intro: "This lens uses the official symbol examples to show why symbol references cannot be collapsed into ordinary SSA edges.",
      type: "graph",
      chips: ["SymbolRefAttr", "nested path", "scope-aware"],
      notes: [
        {
          title: "Why not draw these as Value edges",
          body: "Symbol references resolve through symbol tables, not through operand dominance. That is why the model stores explicit symbol-reference objects."
        },
        {
          title: "What nested paths mean",
          body: "A nested path such as @module_symbol::@nested_symbol expresses a resolution walk through parent symbol tables, not a chain of SSA producers."
        }
      ],
      graph: {
        width: 940,
        height: 360,
        nodes: [
          { id: "root", x: 330, y: 18, w: 220, h: 60, title: "root symbol table", subtitle: "top-level scope", tone: "alt" },
          { id: "symbol", x: 80, y: 126, w: 190, h: 64, title: "func.func @symbol", subtitle: "Symbol", tone: "accent" },
          { id: "module", x: 350, y: 126, w: 210, h: 64, title: "module @module_symbol", subtitle: "SymbolTable + Symbol", tone: "accent" },
          { id: "nested", x: 650, y: 126, w: 210, h: 64, title: "func.func @nested_symbol", subtitle: "nested Symbol", tone: "accent" },
          { id: "user1", x: 110, y: 270, w: 170, h: 58, title: "foo.user", subtitle: "uses [@symbol]", tone: "default" },
          { id: "user2", x: 610, y: 270, w: 230, h: 58, title: "foo.user", subtitle: "uses [@module_symbol::@nested_symbol]", tone: "default" }
        ],
        edges: [
          { from: "root", to: "symbol", label: "contains", fromAnchor: "bottom-left", toAnchor: "top" },
          { from: "root", to: "module", label: "contains", fromAnchor: "bottom", toAnchor: "top" },
          { from: "module", to: "nested", label: "contains", fromAnchor: "right", toAnchor: "left" },
          { from: "user1", to: "symbol", label: "SymbolRefAttr", fromAnchor: "top", toAnchor: "bottom", style: "dashed" },
          { from: "user2", to: "nested", label: "nested SymbolRefAttr", fromAnchor: "top", toAnchor: "bottom", style: "dashed" }
        ]
      }
    },
    {
      id: "pipeline",
      label: "Pass scope",
      title: "Pass scope and snapshots belong in the same story",
      intro: "The current environment lacks live mlir-opt capture, so this lens shows the schema-backed structure that a future runtime trace should populate: pass managers, pass runs, and before/after snapshots.",
      type: "graph",
      chips: ["schema-backed", "nested pass manager", "runtime capture pending"],
      notes: [
        {
          title: "What is grounded already",
          body: "Passes are operation-scoped, nested pass managers mirror IR nesting, and timing plus IR printing are available in official pass infrastructure."
        },
        {
          title: "What remains to capture",
          body: "Actual timing values, before/after snapshots, and lineage confidence must come from tool output once mlir-opt or equivalent capture is available."
        }
      ],
      graph: {
        width: 940,
        height: 360,
        nodes: [
          { id: "pm0", x: 52, y: 100, w: 200, h: 64, title: "OpPassManager", subtitle: "anchor: builtin.module", tone: "alt" },
          { id: "pm1", x: 318, y: 100, w: 220, h: 64, title: "nested OpPassManager", subtitle: "anchor: func.func", tone: "alt" },
          { id: "canon", x: 610, y: 46, w: 170, h: 58, title: "canonicalize", subtitle: "PassRun", tone: "accent" },
          { id: "cse", x: 610, y: 148, w: 170, h: 58, title: "cse", subtitle: "PassRun", tone: "accent" },
          { id: "snap-before", x: 610, y: 258, w: 190, h: 58, title: "snap-0002", subtitle: "before-pass snapshot", tone: "default" },
          { id: "snap-after", x: 610, y: 344, w: 190, h: 58, title: "snap-0003", subtitle: "after-pass snapshot", tone: "default" },
          { id: "func", x: 318, y: 258, w: 200, h: 58, title: "func.func @simple", subtitle: "current operation scope", tone: "default" }
        ],
        edges: [
          { from: "pm0", to: "pm1", label: "nested_pipeline", fromAnchor: "right", toAnchor: "left" },
          { from: "pm1", to: "canon", label: "schedule", fromAnchor: "right", toAnchor: "left" },
          { from: "pm1", to: "cse", label: "schedule", fromAnchor: "right", toAnchor: "left" },
          { from: "canon", to: "func", label: "scheduled_on", fromAnchor: "left", toAnchor: "top-right", style: "dashed" },
          { from: "canon", to: "snap-before", label: "before_snapshot", fromAnchor: "bottom", toAnchor: "top" },
          { from: "canon", to: "snap-after", label: "after_snapshot", fromAnchor: "bottom-right", toAnchor: "left", style: "dashed" }
        ]
      }
    }
  ],
  schemaCards: [
    {
      title: "Snapshot",
      kind: "Capture layer",
      summary: "One concrete IR state at one point in time.",
      fields: ["snapshot_id", "kind", "sequence", "root_operation_id", "source.capture_mode"],
      preview: {
        snapshot_id: "snap-0003",
        kind: "after-pass",
        sequence: 3,
        root_operation_id: "op-0001"
      }
    },
    {
      title: "Operation",
      kind: "Semantic entity",
      summary: "The central normalized record for executable or declarative IR units.",
      fields: ["name", "dialect", "operand_value_ids", "result_value_ids", "region_ids", "successor_block_ids"],
      preview: {
        id: "op-bb0-cond-br",
        name: "cf.cond_br",
        dialect: "cf",
        operand_value_ids: ["value-bb0-arg1"],
        successor_block_ids: ["block-bb1", "block-bb2"]
      }
    },
    {
      title: "Value",
      kind: "Semantic entity",
      summary: "A typed result or block argument with explicit ownership and use sites.",
      fields: ["kind", "type_id", "owner_operation_id", "owner_block_id", "use_sites"],
      preview: {
        id: "value-b-result",
        kind: "op_result",
        owner_operation_id: "op-bb2-addi",
        type_id: "type-i64"
      }
    },
    {
      title: "SymbolRef",
      kind: "Reference layer",
      summary: "An explicit object for symbol lookup paths and their resolution scope.",
      fields: ["user_operation_id", "attribute_name", "path", "target_symbol_id", "resolution_scope_operation_id"],
      preview: {
        id: "symref-foo-user-2",
        path: ["module_symbol", "nested_symbol"],
        target_symbol_id: "symbol-nested-symbol"
      }
    },
    {
      title: "PassRun",
      kind: "Transformation event",
      summary: "One pass invocation attached to an operation scope and linked snapshots.",
      fields: ["pass_name", "anchor_operation_name", "target_operation_id", "before_snapshot_id", "after_snapshot_id", "changed"],
      preview: {
        id: "passrun-0007",
        pass_name: "canonicalize",
        anchor_operation_name: "func.func",
        changed: true
      }
    },
    {
      title: "View projection",
      kind: "Presentation layer",
      summary: "A derived structure optimized for one reading lens, not the source of truth.",
      fields: ["view_id", "kind", "snapshot_id", "edge_kinds", "focus ids"],
      preview: {
        view_id: "cfg-region-0009",
        kind: "cfg",
        snapshot_id: "snap-0003",
        edge_kinds: ["branches_to"]
      }
    }
  ],
  limits: [
    {
      title: "Grounded already",
      text: "The current prototype is anchored in official MLIR sources, a normalized schema, and sample extraction expectations. The containment, CFG, def-use, and symbol lenses are therefore source-backed rather than ornamental.",
      items: ["official source summaries", "sample A and B extraction contract", "normalized entity and edge model"]
    },
    {
      title: "Still pending real tool capture",
      text: "The runtime transformation layer is schema-backed but not populated with live trace output because this environment does not provide mlir-opt.",
      items: ["timing JSON", "before/after IR capture", "cross-snapshot lineage confidence"]
    },
    {
      title: "Why the site is static",
      text: "This repository's product direction is reviewable, Git-first, and GitHub Pages deployable. The UI therefore reads local data artifacts directly instead of depending on a server.",
      items: ["zero-build publishing", "git push deployment", "no runtime backend requirement"]
    },
    {
      title: "What to review first",
      text: "The most important review questions are about fit, not polish: does the article-first layout feel right, does the concept rail help, and do the lenses reflect MLIR semantics rather than generic graph UI habits?",
      items: ["reading rhythm", "concept-layer usefulness", "visualization fidelity"]
    }
  ]
};

let railMode = "concepts";
let activeRailId = DOSSIER.concepts[0].id;
let activeLensId = DOSSIER.lenses[0].id;

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

function currentRailItems() {
  return railMode === "concepts" ? DOSSIER.concepts : DOSSIER.terms;
}

function findRailItemById(id) {
  return currentRailItems().find((item) => item.id === id);
}

function renderSectionNav() {
  const nav = document.getElementById("section-nav");
  nav.innerHTML = SECTION_LINKS.map(
    (section) =>
      `<a class="section-link" href="#${section.id}" data-section-link="${section.id}">${section.label}</a>`
  ).join("");
}

function renderMetrics() {
  const container = document.getElementById("metrics-band");
  container.innerHTML = DOSSIER.metrics
    .map(
      (metric) => `
        <div class="metric-card">
          <p class="mini-label">Measured</p>
          <strong>${metric.value}</strong>
          <span>${metric.label}</span>
        </div>
      `
    )
    .join("");
}

function renderSources() {
  const container = document.getElementById("source-grid");
  container.innerHTML = DOSSIER.sources
    .map(
      (source) => `
        <section class="source-card">
          <p class="source-role">${source.role}</p>
          <h3>${source.title}</h3>
          <div class="source-meta">
            <p>${source.focus}</p>
          </div>
          <ul class="fact-list">
            ${source.facts.map((fact) => `<li>${fact}</li>`).join("")}
          </ul>
          <a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">Open official source</a>
        </section>
      `
    )
    .join("");

  const sample = document.getElementById("sample-ir");
  sample.textContent = DOSSIER.sampleIR;
}

function renderKnowledge() {
  const knowledge = document.getElementById("knowledge-grid");
  knowledge.innerHTML = DOSSIER.knowledgeCards
    .map(
      (card) => `
        <section class="knowledge-card">
          <p class="mini-label">Synthesis</p>
          <h3>${card.title}</h3>
          <p>${card.text}</p>
          <ul class="fact-list">
            ${card.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
          </ul>
        </section>
      `
    )
    .join("");

  const relationships = document.getElementById("relationship-board");
  relationships.innerHTML = DOSSIER.relationships
    .map(
      (entry) => `
        <section class="relationship-card">
          <p class="mini-label">Relation</p>
          <h3>${entry.title}</h3>
          <p class="relationship-arrow">${entry.arrow}</p>
          <p>${entry.text}</p>
        </section>
      `
    )
    .join("");
}

function renderConceptClusters() {
  const container = document.getElementById("concept-clusters");
  container.innerHTML = DOSSIER.conceptClusters
    .map(
      (cluster) => `
        <section class="cluster-card">
          <p class="cluster-kicker">${cluster.kicker}</p>
          <h3>${cluster.title}</h3>
          <p>${cluster.text}</p>
          <ul class="cluster-list">
            ${cluster.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </section>
      `
    )
    .join("");
}

function renderRailList() {
  const query = document.getElementById("rail-search").value.trim().toLowerCase();
  const items = currentRailItems().filter((item) => {
    const haystack = `${item.name} ${item.summary} ${item.category} ${item.badges.join(" ")}`.toLowerCase();
    return haystack.includes(query);
  });

  if (!items.length) {
    activeRailId = null;
    document.getElementById("rail-list").innerHTML = `<div class="detail-card"><p>No matching items in this rail mode.</p></div>`;
    document.getElementById("rail-detail").innerHTML = "";
    return;
  }

  if (!items.some((item) => item.id === activeRailId)) {
    activeRailId = items[0].id;
  }

  document.getElementById("rail-list").innerHTML = items
    .map(
      (item) => `
        <button class="rail-item ${item.id === activeRailId ? "is-active" : ""}" data-rail-item="${item.id}">
          <div class="rail-item-title">
            <span>${item.name}</span>
            <span class="detail-badge">${item.category}</span>
          </div>
          <p>${item.summary}</p>
        </button>
      `
    )
    .join("");

  renderRailDetail();
}

function renderRailDetail() {
  const item = findRailItemById(activeRailId);
  const detail = document.getElementById("rail-detail");

  if (!item) {
    detail.innerHTML = "";
    return;
  }

  detail.innerHTML = `
    <section class="detail-card">
      <p class="rail-kicker">${railMode === "concepts" ? "Concept card" : "Terminology card"}</p>
      <h3>${item.name}</h3>
      <div class="detail-badges">
        ${item.badges.map((badge) => `<span class="detail-badge">${badge}</span>`).join("")}
      </div>
      <p>${item.definition}</p>
      <p><strong>Why it matters:</strong> ${item.importance}</p>
      <div class="detail-badges">
        ${item.views.map((view) => `<span class="cluster-chip">${view}</span>`).join("")}
      </div>
      <ul class="detail-links">
        ${item.sources
          .map((source) => `<li><a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a></li>`)
          .join("")}
      </ul>
    </section>
  `;
}

function renderVizTabs() {
  const tabs = document.getElementById("viz-tabs");
  tabs.innerHTML = DOSSIER.lenses
    .map(
      (lens) => `
        <button class="viz-tab ${lens.id === activeLensId ? "is-active" : ""}" data-viz-tab="${lens.id}" role="tab">
          ${lens.label}
        </button>
      `
    )
    .join("");
}

function renderTree(node) {
  const children = node.children && node.children.length
    ? `<div class="tree-children">${node.children.map((child) => renderTree(child)).join("")}</div>`
    : "";

  return `
    <div class="tree-view">
      <div class="tree-node">
        <span class="node-tag">${node.tag}</span>
        <span class="tree-label">${node.label}</span>
      </div>
      ${children}
    </div>
  `;
}

function anchorPoint(node, anchor) {
  const midX = node.x + node.w / 2;
  const midY = node.y + node.h / 2;
  switch (anchor) {
    case "top":
      return { x: midX, y: node.y };
    case "bottom":
      return { x: midX, y: node.y + node.h };
    case "left":
      return { x: node.x, y: midY };
    case "right":
      return { x: node.x + node.w, y: midY };
    case "top-left":
      return { x: node.x + 28, y: node.y };
    case "top-right":
      return { x: node.x + node.w - 28, y: node.y };
    case "bottom-left":
      return { x: node.x + 28, y: node.y + node.h };
    case "bottom-right":
      return { x: node.x + node.w - 28, y: node.y + node.h };
    default:
      return { x: midX, y: midY };
  }
}

function buildPath(fromPoint, toPoint) {
  const deltaX = Math.abs(toPoint.x - fromPoint.x);
  const deltaY = Math.abs(toPoint.y - fromPoint.y);
  const curve = Math.max(40, Math.min(120, Math.max(deltaX, deltaY) * 0.35));

  if (deltaY > deltaX) {
    return `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x} ${fromPoint.y + curve}, ${toPoint.x} ${toPoint.y - curve}, ${toPoint.x} ${toPoint.y}`;
  }

  return `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x + curve} ${fromPoint.y}, ${toPoint.x - curve} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
}

function renderGraph(graph) {
  const nodeMap = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));
  const edgesSvg = graph.edges
    .map((edge) => {
      const fromNode = nodeMap[edge.from];
      const toNode = nodeMap[edge.to];
      const fromPoint = anchorPoint(fromNode, edge.fromAnchor || "right");
      const toPoint = anchorPoint(toNode, edge.toAnchor || "left");
      const labelX = (fromPoint.x + toPoint.x) / 2;
      const labelY = (fromPoint.y + toPoint.y) / 2 - 8;
      return `
        <path class="edge-line ${edge.style === "dashed" ? "dashed" : ""}" d="${buildPath(fromPoint, toPoint)}" marker-end="url(#arrow)" />
        ${edge.label ? `<text class="edge-label" x="${labelX}" y="${labelY}">${escapeHtml(edge.label)}</text>` : ""}
      `;
    })
    .join("");

  const nodesSvg = graph.nodes
    .map((node) => {
      const toneClass = node.tone === "accent" ? "accent" : node.tone === "alt" ? "alt" : "";
      return `
        <g>
          <rect class="node-rect ${toneClass}" x="${node.x}" y="${node.y}" rx="20" ry="20" width="${node.w}" height="${node.h}" />
          <text class="node-title" x="${node.x + 16}" y="${node.y + 26}">${escapeHtml(node.title)}</text>
          <text class="node-subtitle" x="${node.x + 16}" y="${node.y + 48}">${escapeHtml(node.subtitle)}</text>
        </g>
      `;
    })
    .join("");

  return `
    <div class="graph-frame">
      <svg class="graph-svg" viewBox="0 0 ${graph.width} ${graph.height}" aria-hidden="true">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(54, 70, 78, 0.72)"></path>
          </marker>
        </defs>
        ${edgesSvg}
        ${nodesSvg}
      </svg>
    </div>
  `;
}

function renderLens() {
  const lens = DOSSIER.lenses.find((item) => item.id === activeLensId);
  const container = document.getElementById("viz-panel");
  if (!lens) return;

  const diagram = lens.type === "tree" ? `<div class="lens-diagram">${renderTree(lens.tree)}</div>` : renderGraph(lens.graph);

  container.innerHTML = `
    <div class="lens-layout">
      <div>
        <div class="lens-header">
          <div class="lens-title">
            <p class="viz-kicker">${lens.label}</p>
            <h3 class="viz-title">${lens.title}</h3>
            <p class="lens-intro">${lens.intro}</p>
          </div>
          <div class="graph-meta">
            ${lens.chips.map((chip) => `<span class="meta-chip">${chip}</span>`).join("")}
          </div>
        </div>
        ${diagram}
      </div>
      <div class="lens-notes">
        ${lens.notes
          .map(
            (note) => `
              <section class="note-card">
                <strong>${note.title}</strong>
                <p>${note.body}</p>
              </section>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSchema() {
  const container = document.getElementById("schema-grid");
  container.innerHTML = DOSSIER.schemaCards
    .map(
      (card) => `
        <section class="schema-card">
          <p class="schema-kind">${card.kind}</p>
          <h3>${card.title}</h3>
          <p>${card.summary}</p>
          <ul class="schema-field-list">
            ${card.fields.map((field) => `<li>${field}</li>`).join("")}
          </ul>
          <pre class="json-preview">${escapeHtml(prettyJson(card.preview))}</pre>
        </section>
      `
    )
    .join("");
}

function renderLimits() {
  const container = document.getElementById("limits-grid");
  container.innerHTML = DOSSIER.limits
    .map(
      (item) => `
        <section class="limit-card">
          <p class="mini-label">Boundary</p>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
          <ul class="limit-list">
            ${item.items.map((entry) => `<li>${entry}</li>`).join("")}
          </ul>
        </section>
      `
    )
    .join("");
}

function wireRailEvents() {
  document.querySelectorAll(".rail-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      railMode = button.dataset.railMode;
      const items = currentRailItems();
      activeRailId = items[0].id;
      document.querySelectorAll(".rail-toggle").forEach((toggle) => {
        toggle.classList.toggle("is-active", toggle === button);
      });
      renderRailList();
    });
  });

  document.getElementById("rail-search").addEventListener("input", renderRailList);

  document.getElementById("rail-list").addEventListener("click", (event) => {
    const item = event.target.closest("[data-rail-item]");
    if (!item) return;
    activeRailId = item.dataset.railItem;
    renderRailList();
  });
}

function wireVizEvents() {
  document.getElementById("viz-tabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-viz-tab]");
    if (!tab) return;
    activeLensId = tab.dataset.vizTab;
    renderVizTabs();
    renderLens();
  });
}

function wireStageRibbon() {
  document.querySelectorAll(".stage-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const target = document.getElementById(pill.dataset.stageTarget);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function updateActiveNavigation() {
  const sections = SECTION_LINKS.map((section) => document.getElementById(section.id)).filter(Boolean);
  const viewportAnchor = window.innerHeight * 0.25;
  let activeSection = sections[0];
  let minDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const distance = Math.abs(section.getBoundingClientRect().top - viewportAnchor);
    if (distance < minDistance) {
      minDistance = distance;
      activeSection = section;
    }
  });

  if (!activeSection) return;

  document.querySelectorAll(".section-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.sectionLink === activeSection.id);
  });

  const stageMap = {
    intro: "raw",
    raw: "raw",
    knowledge: "knowledge",
    "concept-layer": "knowledge",
    visualize: "visualize",
    contract: "contract",
    limits: "contract"
  };

  const activeStage = stageMap[activeSection.id];
  document.querySelectorAll(".stage-pill").forEach((pill) => {
    pill.classList.toggle("is-active", pill.dataset.stageTarget === activeStage);
  });
}

function init() {
  renderSectionNav();
  renderMetrics();
  renderSources();
  renderKnowledge();
  renderConceptClusters();
  renderRailList();
  renderVizTabs();
  renderLens();
  renderSchema();
  renderLimits();

  wireRailEvents();
  wireVizEvents();
  wireStageRibbon();
  updateActiveNavigation();

  window.addEventListener("scroll", updateActiveNavigation, { passive: true });
  window.addEventListener("resize", updateActiveNavigation);
}

init();
