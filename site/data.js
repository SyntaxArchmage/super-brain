const WIKI = {
  taxonomy: [
    {
      id: "compiler",
      label: "Compiler Infrastructure",
      children: [
        { id: "mlir", label: "MLIR", type: "article" },
        { id: "parser-practice", label: "Parser Practice", type: "article" },
        { id: "lowering-pipelines", label: "Lowering Pipelines", type: "article" }
      ]
    },
    {
      id: "hpc",
      label: "High-Performance Computing",
      children: [
        { id: "parallel-models", label: "Parallel Programming Models", type: "article" },
        { id: "memory-hierarchy", label: "Memory Hierarchy", type: "article" }
      ]
    },
    {
      id: "ai",
      label: "Artificial Intelligence",
      children: [
        { id: "transformer-arch", label: "Transformer Architecture", type: "article" },
        { id: "training-dynamics", label: "Training Dynamics", type: "article" }
      ]
    },
    {
      id: "ai-infra",
      label: "AI Infrastructure",
      children: [
        { id: "serving-systems", label: "Serving Systems", type: "article" },
        { id: "compiler-ai-infra", label: "Compiler Stacks for AI", type: "article" }
      ]
    },
    {
      id: "pl",
      label: "Programming Languages",
      children: [
        { id: "type-systems", label: "Type Systems", type: "article" },
        { id: "ir-design", label: "IR Design Principles", type: "article" }
      ]
    }
  ],

  pages: {
    index: {
      title: "Super Brain",
      subtitle: "A personal research wiki spanning compiler infrastructure, high-performance computing, AI systems, and programming language theory. Each article is a synthesized knowledge unit backed by primary sources.",
      type: "index"
    },

    mlir: {
      title: "MLIR",
      subtitle: "A reusable, extensible multi-level intermediate representation framework that enables compiler construction across abstraction levels — from high-level computation graphs through loop optimizations to target-specific code generation.",
      domain: "Compiler Infrastructure",
      type: "article",
      meta: [
        { text: "Primary sources: 7 official documents", dot: "#2563eb" },
        { text: "Concepts: 8 entities" },
        { text: "Cross-references: 4 pages" }
      ],
      body: `
<h2>What MLIR Is</h2>
<p>MLIR (Multi-Level Intermediate Representation) is not a compiler and not a single IR. It is <em>infrastructure for building and composing intermediate representations</em> via a shared framework of operations, types, and attributes organized into namespaced dialects.</p>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From the MLIR Overview: "MLIR is a novel approach to building reusable and extensible compiler infrastructure. MLIR aims to address software fragmentation, improve compilation for heterogeneous hardware, significantly reduce the cost of building domain-specific compilers."</p>
</div>

<p>The key architectural insight is that compilers typically build multiple IRs (high-level graph, loop-nest, low-level machine) that cannot share infrastructure because they use incompatible data models. MLIR unifies these under one meta-IR framework where each abstraction level is a <em>dialect</em> rather than a separate system.</p>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>This means MLIR solves the "IR impedance mismatch" problem — information loss that occurs when crossing between independent IR systems (e.g., TensorFlow graph → XLA HLO → LLVM IR). With MLIR, all levels coexist in one module and transformations between them are explicit, auditable dialect conversions.</p>
</div>

<h2>Recursive Nesting: The Core Structure</h2>
<p>MLIR's IR is <strong>recursively nested</strong>. This is not a cosmetic detail — it is the foundational structural choice that distinguishes MLIR from flat IRs like LLVM:</p>

<ul>
<li><strong>Operation</strong> — the atomic unit; owns operands, results, successors, attributes, properties, and zero or more regions</li>
<li><strong>Region</strong> — an ordered list of blocks; semantics defined by the containing operation (SSACFG or Graph)</li>
<li><strong>Block</strong> — a sequential list of operations with typed block arguments; targeted by terminators</li>
<li><strong>Value</strong> — either an operation result or a block argument; carries type and def-use edges</li>
</ul>

<div class="evidence">
<div class="ev-label">Raw IR example — CFG with block arguments</div>
<pre>func.func @simple(i64, i1) -> i64 {
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
}</pre>
</div>

<div class="analysis">
<div class="an-label">Structural observation</div>
<p>Note that block arguments (<code>%c</code>, <code>%d</code>, <code>%e</code>) replace phi nodes entirely. This is not syntactic sugar — it means data flow at control-flow merge points is explicit in the CFG topology rather than hidden in special pseudo-instructions. Any visualization of MLIR must treat block arguments as first-class value sources.</p>
</div>

<h3>The traversal model</h3>
<p>The official IR structure tutorial defines the canonical traversal as:</p>
<pre>Operation → Region → Block → Operation (recurse)</pre>
<p>And separately, the def-use traversal:</p>
<pre>Value → users (Operation list)
Operation → operands (Value list)</pre>

<p>These two traversal axes are independent. Containment is structural (tree); def-use is semantic (graph). A faithful representation of MLIR needs both simultaneously.</p>

<h2>Dialects: The Extension Mechanism</h2>
<p>Dialects are namespaced collections of operations, types, and attributes. They are MLIR's answer to the extension problem: how do you add domain-specific operations without forking the compiler?</p>

<ul>
<li>Multiple dialects coexist in one module — a function can contain <code>linalg</code>, <code>scf</code>, and <code>arith</code> operations simultaneously</li>
<li>Dialect conversion is explicit — a pass that converts <code>linalg</code> to <code>scf</code> is a well-defined transformation with clear input/output contracts</li>
<li>Dialects can be upstream (maintained in LLVM) or out-of-tree (project-specific)</li>
</ul>

<div class="note">
<div class="note-label">Practical implication</div>
<p>When reading MLIR code, the operation prefix tells you which dialect owns it: <code>arith.addi</code> (arithmetic), <code>cf.cond_br</code> (control flow), <code>func.func</code> (function semantics). This namespace structure is a valid filtering and visualization dimension.</p>
</div>

<h2>Scope: SSA Dominance vs Symbol Indirection</h2>
<p>MLIR splits cross-reference semantics into two systems because they solve different problems:</p>

<h3>SSA values</h3>
<p>Values are visible within their hierarchical dominance scope. A value defined in block B is usable in any block dominated by B within the same region (for SSACFG regions). This is the familiar SSA model.</p>

<h3>Symbols</h3>
<p>For cross-scope references that cannot be expressed as SSA operands — such as calling a function defined in a different module region — MLIR uses <strong>symbol tables</strong>. Operations marked with the <code>Symbol</code> trait live inside symbol table operations, and are referenced via <code>SymbolRefAttr</code>.</p>

<div class="evidence">
<div class="ev-label">Key distinction from official docs</div>
<p>"Symbol references are non-SSA. A SymbolRefAttr refers to a named operation, not to an SSA value. Nested references such as <code>@module::@nested_func</code> are legal and meaningful."</p>
</div>

<p>This dual system exists because module-level entities (functions, global variables, external declarations) need stable names that survive across compilation stages — something SSA values, which are scope-local and ephemeral, cannot provide.</p>

<h2>Pass Infrastructure</h2>
<p>Passes in MLIR are <strong>operation-scoped</strong>. A pass declares which operation type it anchors on (e.g., <code>func.func</code>, <code>module</code>) and must not inspect or mutate anything outside that operation's region tree.</p>

<ul>
<li>Nested <code>OpPassManager</code> structure mirrors IR nesting — you can run different passes at different nesting levels</li>
<li>The pass manager already exposes timing data (<code>-mlir-timing</code>) and IR snapshots between passes (<code>-mlir-print-ir-after-all</code>)</li>
<li>These are the natural data feeds for future pipeline visualization</li>
</ul>

<div class="analysis">
<div class="an-label">Design insight</div>
<p>The fact that passes are operation-scoped means transformation views should be rooted in operation scopes, not in flat timelines. A pass running on a nested <code>func.func</code> inside a <code>gpu.module</code> has a specific structural context that a flat "pass N ran at time T" view would lose.</p>
</div>

<h2>Why MLIR Matters Across This Knowledge Base</h2>
<p>MLIR is not just a compiler topic. It intersects nearly every domain tracked here:</p>
<ul>
<li><strong>Parser practice</strong> — MLIR's ODS and custom assembly format system is a working example of declarative, extensible parser generation</li>
<li><strong>AI infrastructure</strong> — XLA's StableHLO, IREE, TVM, and Triton all use MLIR dialects for graph-to-hardware compilation</li>
<li><strong>IR design</strong> — recursive nesting, extensible operations, and progressive lowering are reusable principles for any IR</li>
<li><strong>HPC</strong> — MLIR's <code>affine</code>, <code>scf</code>, and polyhedral abstractions directly target loop optimization for parallel hardware</li>
</ul>
`,
      concepts: [
        { name: "Operation", role: "Core entity", summary: "Central MLIR abstraction. Owns operands, results, regions, attributes. Fully extensible — each dialect defines its own operations." },
        { name: "Value", role: "Core entity", summary: "Typed def-use edge. Either an operation result or block argument. Has exactly one definition point but potentially many users." },
        { name: "Region", role: "Structure", summary: "Ordered blocks owned by an operation. Semantics (SSACFG or Graph) depend on the containing operation, not the region itself." },
        { name: "Block", role: "Structure", summary: "Sequential operation list with typed block arguments. CFG terminators target blocks. Block arguments replace phi nodes." },
        { name: "Dialect", role: "Namespace", summary: "Extension mechanism grouping operations, types, attributes under a namespace. Multiple dialects coexist; conversion between them is explicit." },
        { name: "Symbol", role: "Scope", summary: "Named operation in a symbol table. Referenced via SymbolRefAttr for cross-scope access that SSA dominance cannot express." },
        { name: "Pass", role: "Transformation", summary: "Operation-scoped transformation. Nested pass managers mirror IR nesting. Must not mutate outside anchor scope." },
        { name: "Lowering", role: "Transformation", summary: "Progressive movement toward lower abstraction. Distinct from conversion (same level) and translation (leaving MLIR)." }
      ],
      contributions: [
        { target: "parser-practice", text: "MLIR's ODS and custom assembly format system demonstrates declarative, extensible parser generation — each dialect registers parsing hooks dispatched by operation prefix." },
        { target: "compiler-ai-infra", text: "MLIR provides the shared infrastructure layer for XLA (StableHLO), IREE, TVM, and Triton — all use MLIR dialects for graph-to-hardware compilation." },
        { target: "ir-design", text: "Recursive nesting, extensible operations, and progressive lowering via dialects are foundational IR design principles demonstrated at production scale." },
        { target: "lowering-pipelines", text: "MLIR's pass infrastructure, dialect conversion framework, and nested OpPassManager define the modern staged lowering pipeline model." }
      ]
    },

    "parser-practice": {
      title: "Parser Practice",
      subtitle: "Techniques and architectural patterns for building parsers in extensible compiler systems — from grammar-driven approaches to declarative format specifications.",
      domain: "Compiler Infrastructure",
      type: "article",
      meta: [
        { text: "Concepts: 3 entities" },
        { text: "Incoming: MLIR" }
      ],
      body: `
<h2>Overview</h2>
<p>Parser practice in modern compiler infrastructure extends beyond traditional grammar-driven approaches. Extensible systems introduce declarative assembly formats where the parser is <em>generated from operation definitions</em> rather than handwritten — shifting the problem from "write a parser" to "specify a syntax."</p>

<h2>Classical vs. Declarative Parsing</h2>
<p>Traditional compilers use handwritten recursive-descent parsers or parser generators (yacc, ANTLR). These work well for fixed languages but become maintenance burdens in extensible systems where new operations are added frequently.</p>

<p>The declarative alternative — exemplified by MLIR's ODS (Operation Definition Specification) — co-locates syntax specification with semantic definitions:</p>

<pre>// Tablegen ODS definition generates both parser and printer
let assemblyFormat = [{
  $lhs \`,\` $rhs attr-dict \`:\` type($result)
}];</pre>

<div class="analysis">
<div class="an-label">Trade-off analysis</div>
<p>Declarative formats sacrifice some syntactic flexibility for correctness guarantees: round-trip invariance (parse ∘ print = identity) is enforced by construction. Handwritten parsers can produce more polished error messages but require manual round-trip testing.</p>
</div>

<h2>Key Patterns</h2>
<ul>
<li><strong>Round-trip invariance</strong> — <code>parse(print(IR)) == IR</code> is the fundamental correctness property for any IR textual format</li>
<li><strong>Custom assembly</strong> — operations override the generic printer/parser for domain-appropriate syntax when the declarative format is insufficient</li>
<li><strong>Dispatch by prefix</strong> — in extensible systems, the parser dispatches to dialect-specific hooks based on the operation's namespace prefix</li>
<li><strong>Error recovery</strong> — production parsers must continue after errors to report multiple diagnostics in one invocation</li>
</ul>

<h2>MLIR's Contribution to Parser Practice</h2>
<p>MLIR demonstrates that parsers for extensible IRs need not be monolithic. Each dialect registers its own parsing hooks, and the framework dispatches based on the operation's prefix. This is a practical instance of the <em>expression problem</em> applied to IR syntax — new data types (operations) can be added without modifying the existing parser.</p>

<div class="evidence">
<div class="ev-label">Architectural pattern</div>
<p>When MLIR encounters <code>arith.addi</code>, it finds the <code>arith</code> dialect, looks up the <code>addi</code> operation registration, and delegates to that operation's registered parser. No central grammar file needs updating when a new dialect is added.</p>
</div>
`,
      concepts: [
        { name: "Assembly Format", role: "Pattern", summary: "Declarative syntax specification co-located with operation semantics. Generates parser and printer from one source." },
        { name: "Round-trip", role: "Invariant", summary: "parse(print(IR)) == IR. Fundamental correctness property ensuring textual format is lossless." },
        { name: "ODS", role: "Framework", summary: "Operation Definition Specification. Tablegen-based declarative system generating C++ for operations, types, and their parsers." }
      ],
      contributions: []
    },

    "lowering-pipelines": {
      title: "Lowering Pipelines",
      subtitle: "Progressive, staged transformation from high-level domain abstractions toward target-specific representations — maintaining abstraction boundaries and transformation contracts at each level.",
      domain: "Compiler Infrastructure",
      type: "article",
      meta: [
        { text: "Concepts: 3 entities" },
        { text: "Incoming: MLIR" }
      ],
      body: `
<h2>Overview</h2>
<p>A lowering pipeline is a sequence of transformations that progressively moves IR from high-level domain abstractions toward target-specific representations. Unlike single-shot compilation, <strong>staged lowering</strong> allows each level to apply its own optimizations before committing to lower-level details.</p>

<div class="analysis">
<div class="an-label">Why staging matters</div>
<p>Optimizations are level-dependent. Tiling a matrix multiply makes sense at the <code>linalg</code> level (where you can reason about access patterns) but is meaningless at the <code>arith</code> level (where you only see scalar operations). Staging ensures each transformation sees the abstraction it needs.</p>
</div>

<h2>Pipeline Vocabulary</h2>
<ul>
<li><strong>Conversion</strong> — rewriting operations from one dialect to another while staying inside the IR framework</li>
<li><strong>Translation</strong> — crossing the boundary from the IR into an external representation (e.g., MLIR → LLVM IR → machine code)</li>
<li><strong>Legalization</strong> — making IR conform to a target dialect's constraints (e.g., removing operations the target doesn't support)</li>
</ul>

<div class="evidence">
<div class="ev-label">Distinction from MLIR glossary</div>
<p>"Conversion is distinct from translation: one stays inside MLIR, the other crosses into or out of MLIR. Lowering describes movement toward a lower-level but equivalent representation. Legalization means making IR conform to a conversion target."</p>
</div>

<h2>Pipeline Architecture</h2>
<p>A well-designed lowering pipeline has clear contracts at each stage boundary:</p>
<ul>
<li><strong>Input contract</strong> — which operations/dialects are accepted</li>
<li><strong>Output contract</strong> — which operations/dialects are produced</li>
<li><strong>Invariants preserved</strong> — what properties survive the transformation</li>
<li><strong>Invariants established</strong> — what new properties the output guarantees</li>
</ul>

<p>This contract-based thinking enables independent testing of pipeline stages and allows different frontends to share backend stages (e.g., both TensorFlow and JAX can lower through the same StableHLO → MHLO → Linalg pipeline).</p>

<h2>Common Pipeline Shapes</h2>
<pre>High-level graph dialect (e.g., StableHLO)
  → Mid-level structured control (e.g., linalg, scf)
    → Low-level hardware dialect (e.g., gpu, spirv)
      → Translation to external target (e.g., LLVM IR, PTX)</pre>

<div class="note">
<div class="note-label">Practical observation</div>
<p>Real pipelines are rarely linear. They often have branching (different targets), convergence (multiple sources lowering to the same mid-level), and feedback loops (optimization passes that temporarily raise abstraction to enable further lowering).</p>
</div>
`,
      concepts: [
        { name: "Conversion", role: "Transform", summary: "Dialect-to-dialect rewriting within the IR framework. Stays inside MLIR. Has clear input/output dialect contracts." },
        { name: "Translation", role: "Transform", summary: "Crossing the IR boundary into external representations (e.g., MLIR → LLVM IR). Terminal stage of a pipeline." },
        { name: "Legalization", role: "Transform", summary: "Conforming IR to target dialect constraints by replacing unsupported operations with supported equivalents." }
      ],
      contributions: []
    },

    "parallel-models": {
      title: "Parallel Programming Models",
      subtitle: "Abstractions for expressing and managing concurrency in high-performance systems — each trading off between expressiveness, performance transparency, and hardware portability.",
      domain: "High-Performance Computing",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" }
      ],
      body: `
<h2>Overview</h2>
<p>A parallel programming model is an abstraction layer between the programmer's intent ("do these things concurrently") and the hardware's reality (cores, caches, interconnects, memory controllers). The choice of model determines:</p>
<ul>
<li>What the programmer must reason about explicitly</li>
<li>What the runtime/compiler handles implicitly</li>
<li>What performance characteristics are predictable vs. surprising</li>
</ul>

<h2>Model Taxonomy</h2>

<h3>Shared memory</h3>
<p>Threads with shared address space. Communication via loads/stores protected by synchronization primitives (locks, atomics, barriers). Examples: pthreads, OpenMP parallel regions, C++ std::thread.</p>

<div class="analysis">
<div class="an-label">Trade-off</div>
<p>Low barrier to entry (familiar sequential + annotations) but hides the cost of cache coherence, false sharing, and NUMA effects. Programs that "look fast" can be memory-bound without any obvious code-level indicator.</p>
</div>

<h3>Message passing</h3>
<p>Explicit send/receive between processes with separate address spaces. All data sharing is deliberate. Examples: MPI, Erlang/OTP, CSP channels.</p>

<h3>Data-parallel</h3>
<p>Same operation applied uniformly across data collections. The model constrains expressiveness (no arbitrary inter-element communication) in exchange for massive hardware parallelism. Examples: SIMD, GPU kernels (CUDA/OpenCL), array languages (APL, NumPy vectorized ops).</p>

<h3>Task-based</h3>
<p>Computation expressed as a DAG of work units with dependency edges. The runtime schedules tasks onto workers, handling load balancing and data movement. Examples: Intel TBB, Cilk, OpenMP tasks, Dask.</p>

<h3>Dataflow</h3>
<p>Computation triggered by data availability. Nodes fire when all inputs are ready. Natural fit for streaming and pipeline parallelism. Examples: TensorFlow's original execution model, systolic arrays, hardware dataflow architectures.</p>

<h2>Fundamental Tensions</h2>
<p>Every model trades off between:</p>
<ul>
<li><strong>Expressiveness</strong> — what computations can be naturally expressed</li>
<li><strong>Performance transparency</strong> — whether the programmer can reason about costs</li>
<li><strong>Portability</strong> — whether code runs efficiently across different hardware</li>
</ul>

<div class="note">
<div class="note-label">Open question</div>
<p>No model dominates all three dimensions. Current practice often layers models (e.g., MPI between nodes + OpenMP within nodes + SIMD within cores), accepting complexity at boundaries for optimal hardware utilization at each level.</p>
</div>
`,
      concepts: [
        { name: "Data parallelism", role: "Model", summary: "Same operation applied uniformly across collections. Trades expressiveness for massive hardware parallelism. SIMD, GPU kernels, array operations." },
        { name: "Task graph", role: "Model", summary: "DAG of work units with dependency edges. Runtime handles scheduling and load balancing. Flexible but harder to reason about cache behavior." }
      ],
      contributions: []
    },

    "memory-hierarchy": {
      title: "Memory Hierarchy",
      subtitle: "Understanding and exploiting the layered structure of modern memory systems, where the latency gap between adjacent levels spans 10-100x and dominates performance for most workloads.",
      domain: "High-Performance Computing",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" }
      ],
      body: `
<h2>Overview</h2>
<p>Modern systems have deeply layered memory — registers, L1/L2/L3 caches, local DRAM, remote DRAM (NUMA), NVMe, and network storage. Performance-critical code must be designed with this hierarchy in mind.</p>

<div class="evidence">
<div class="ev-label">Approximate latency ladder</div>
<pre>L1 cache hit:        ~1 ns    (4 cycles)
L2 cache hit:        ~4 ns    (12 cycles)
L3 cache hit:       ~12 ns    (40 cycles)
DRAM access:        ~60 ns    (200 cycles)
NVMe SSD:       ~10,000 ns    (10 μs)
Network (DC):  ~500,000 ns    (0.5 ms)</pre>
</div>

<p>The 60x gap between L1 and DRAM means a "cache miss" is not a minor inefficiency — it is a <em>60x slowdown per access</em>. For memory-bound workloads (which most real programs are), cache behavior dominates performance more than instruction count.</p>

<h2>Locality Principles</h2>
<ul>
<li><strong>Temporal locality</strong> — recently accessed data will likely be accessed again soon. Strategy: keep working set in cache, process data in multiple passes while hot.</li>
<li><strong>Spatial locality</strong> — data near recently accessed data will likely be accessed soon. Strategy: use contiguous layouts, iterate sequentially, avoid pointer chasing.</li>
</ul>

<div class="analysis">
<div class="an-label">Compiler relevance</div>
<p>Loop tiling (blocking) is the canonical compiler transformation for memory hierarchy optimization — it restructures iteration order to keep working sets within cache capacity. MLIR's <code>affine</code> dialect and polyhedral analysis frameworks exist precisely to reason about and apply these transformations automatically.</p>
</div>

<h2>Cache Architecture</h2>
<ul>
<li><strong>Cache line</strong> — the minimum unit of data movement (typically 64 bytes). Even accessing 1 byte fetches the full 64B line.</li>
<li><strong>Associativity</strong> — determines where a given address can be placed in cache. Higher associativity reduces conflicts but increases lookup latency.</li>
<li><strong>Prefetching</strong> — hardware detects sequential/strided patterns and fetches lines ahead of demand. Irregular access patterns defeat this.</li>
</ul>

<h2>NUMA and Multi-Socket</h2>
<p>In multi-socket systems, "local" DRAM (attached to the current socket) is ~1.5-2x faster than "remote" DRAM (on another socket). This creates <em>non-uniform memory access</em> (NUMA) where data placement relative to computation determines performance.</p>

<div class="note">
<div class="note-label">Practical implication</div>
<p>A parallel program that allocates memory on one NUMA node but runs threads on another will see degraded bandwidth and higher latency — often called "remote memory access penalty." First-touch allocation policy and thread-to-core pinning are standard mitigations.</p>
</div>
`,
      concepts: [
        { name: "Locality", role: "Principle", summary: "Temporal (reuse soon) and spatial (access nearby) patterns that determine cache efficiency. The fundamental optimization axis for memory-bound code." },
        { name: "Cache line", role: "Hardware", summary: "64-byte minimum transfer unit between cache levels. Even 1-byte access fetches full line. Determines the cost granularity of memory operations." }
      ],
      contributions: []
    },

    "transformer-arch": {
      title: "Transformer Architecture",
      subtitle: "The attention-based architecture underlying modern language models, vision models, and multimodal systems — replacing recurrence with parallelizable self-attention over sequences.",
      domain: "Artificial Intelligence",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" }
      ],
      body: `
<h2>Overview</h2>
<p>The Transformer architecture (Vaswani et al., 2017, "Attention Is All You Need") replaced recurrence with <strong>self-attention</strong> as the primary mechanism for modeling sequence dependencies. By computing all pairwise relationships in parallel rather than sequentially, it enabled both training-time parallelism and scaling to vastly larger models.</p>

<p>It is now the foundation for:</p>
<ul>
<li>Language models: GPT-4, Claude, LLaMA, Gemini</li>
<li>Vision: ViT, DINO, Segment Anything</li>
<li>Multimodal: CLIP, Flamingo, GPT-4V</li>
<li>Scientific: AlphaFold, protein language models</li>
</ul>

<h2>Core Components</h2>

<h3>Self-attention</h3>
<p>For each position in a sequence, compute a weighted sum over all other positions. Weights are determined by learned query-key compatibility:</p>
<pre>Attention(Q, K, V) = softmax(QK^T / √d_k) V</pre>
<p>where Q (queries), K (keys), V (values) are linear projections of the input.</p>

<div class="analysis">
<div class="an-label">Complexity implications</div>
<p>Self-attention is O(n²) in sequence length — every position attends to every other position. This quadratic cost is the primary scaling bottleneck and has driven extensive research into efficient attention variants (sparse, linear, flash attention).</p>
</div>

<h3>Multi-head attention</h3>
<p>Run h attention functions in parallel with different learned projections, concatenate outputs, and project again. This allows the model to attend to information from different representation subspaces simultaneously.</p>

<h3>Feed-forward networks</h3>
<p>Position-wise two-layer MLP applied independently to each position after attention. Typically expands dimensionality 4x then projects back: <code>FFN(x) = W₂ · GELU(W₁x + b₁) + b₂</code></p>

<h3>Residual connections + layer normalization</h3>
<p>Every sub-layer (attention, FFN) has a residual skip connection and normalization. Pre-norm (normalize before the sub-layer) is now standard over post-norm for training stability at depth.</p>

<h2>Scaling Laws</h2>
<p>Transformers exhibit predictable scaling: performance improves as a power law of compute (C), dataset size (D), and parameter count (N). The Chinchilla scaling laws suggest optimal allocation balances parameters and data proportionally.</p>

<div class="evidence">
<div class="ev-label">Scaling relationship</div>
<p>Loss ≈ (C/C₀)^{−α} where α ≈ 0.05–0.1 depending on the domain. This predictability is what enables planning multi-billion-dollar training runs — you can estimate final loss from early checkpoints.</p>
</div>

<h2>Autoregressive Generation</h2>
<p>For generation (GPT-style), tokens are produced one at a time, each conditioned on all previous tokens. The <strong>KV cache</strong> stores past key-value pairs to avoid recomputing attention over the full history at each step — trading memory for compute.</p>

<div class="note">
<div class="note-label">Infrastructure implication</div>
<p>KV cache memory grows linearly with sequence length and batch size. For long-context models (128K+ tokens), KV cache can exceed the model parameters in memory footprint. This drives innovations like PagedAttention (vLLM), GQA, and MQA.</p>
</div>
`,
      concepts: [
        { name: "Self-attention", role: "Mechanism", summary: "Weighted aggregation over all sequence positions via learned query-key compatibility. O(n²) in sequence length. The core computational primitive of transformers." },
        { name: "KV cache", role: "Optimization", summary: "Cached key-value pairs for efficient autoregressive generation. Avoids recomputing attention history. Memory grows linearly with context length." }
      ],
      contributions: []
    },

    "training-dynamics": {
      title: "Training Dynamics",
      subtitle: "How neural networks learn: optimization landscape geometry, emergent capabilities at scale, and the surprising phenomena that arise in overparameterized systems.",
      domain: "Artificial Intelligence",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" }
      ],
      body: `
<h2>Overview</h2>
<p>Training dynamics encompasses the behavior of neural networks during optimization — how loss landscapes are navigated, how internal representations form and reorganize, and how generalization emerges despite massive overparameterization.</p>

<h2>Loss Landscape Geometry</h2>
<p>The loss function of a deep network defines a surface in parameter space with dimension equal to the parameter count (billions of dimensions for modern models). Key structural features:</p>
<ul>
<li><strong>Saddle points</strong> — dominate over local minima in high dimensions. Most "stuck" training is at saddles, not minima.</li>
<li><strong>Flat minima</strong> — regions where the loss is insensitive to parameter perturbations. Conjectured to generalize better than sharp minima.</li>
<li><strong>Loss barriers</strong> — high-loss ridges between different solutions. Mode connectivity research shows these can often be circumvented along curved paths.</li>
</ul>

<div class="analysis">
<div class="an-label">Practical implication</div>
<p>Learning rate warmup and cosine decay schedules are not arbitrary heuristics — they are strategies for navigating landscape geometry. Warmup avoids early divergence in sharp loss regions near initialization; decay allows settling into flat minima late in training.</p>
</div>

<h2>Emergent Phenomena</h2>

<h3>Grokking</h3>
<p>A network first memorizes training data (achieves zero training loss) then <em>much later</em> suddenly generalizes to the test set. This delayed generalization suggests that representations reorganize internally even after training loss has plateaued.</p>

<h3>Phase transitions</h3>
<p>Capabilities appear abruptly at specific model scales — absent at smaller sizes, present at larger sizes, with no smooth interpolation between. Examples: in-context learning, chain-of-thought reasoning, multilingual transfer.</p>

<div class="evidence">
<div class="ev-label">Observation from scaling research</div>
<p>Many "emergent" abilities appear to be measurement artifacts — whether an ability looks emergent depends on the evaluation metric (discontinuous metrics like exact-match show phase transitions; continuous metrics like token log-probability show smooth improvement).</p>
</div>

<h2>Optimization Dynamics</h2>
<ul>
<li><strong>Adam optimizer</strong> — adaptive per-parameter learning rates via first/second moment estimates. De facto standard for transformer training.</li>
<li><strong>Gradient accumulation</strong> — simulates larger batch sizes by averaging gradients across multiple forward passes before updating.</li>
<li><strong>Gradient clipping</strong> — caps gradient norm to prevent training instability from outlier batches.</li>
</ul>

<div class="note">
<div class="note-label">Open research question</div>
<p>Why do overparameterized networks generalize at all? Classical learning theory predicts they should overfit catastrophically. The "double descent" phenomenon and implicit regularization of SGD partially explain this, but a complete theory remains elusive.</p>
</div>
`,
      concepts: [
        { name: "Loss landscape", role: "Theory", summary: "Geometry of the objective function over parameter space. Saddle points dominate in high dimensions. Flat minima conjectured to generalize better." },
        { name: "Emergence", role: "Phenomenon", summary: "Capabilities appearing abruptly at scale. Whether truly discontinuous or a measurement artifact of discrete evaluation metrics is debated." }
      ],
      contributions: []
    },

    "serving-systems": {
      title: "Serving Systems",
      subtitle: "Infrastructure for deploying ML models at production scale — managing the tension between latency SLOs, throughput maximization, and memory efficiency under variable request loads.",
      domain: "AI Infrastructure",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" }
      ],
      body: `
<h2>Overview</h2>
<p>ML serving systems handle the inference path — from receiving a request to returning a prediction. For LLMs specifically, this involves managing KV cache memory, batching strategies that respect latency constraints, and scheduling that maximizes GPU utilization.</p>

<h2>The LLM Serving Challenge</h2>
<p>LLM inference has two phases with very different compute characteristics:</p>
<ul>
<li><strong>Prefill</strong> — process all input tokens in parallel (compute-bound, like training)</li>
<li><strong>Decode</strong> — generate tokens one at a time autoregressively (memory-bandwidth-bound, low arithmetic intensity)</li>
</ul>

<div class="analysis">
<div class="an-label">Resource imbalance</div>
<p>Prefill saturates GPU compute; decode barely uses it but saturates memory bandwidth reading KV cache. Naive systems waste GPU cycles during decode. Solutions: disaggregate prefill and decode to different hardware, or batch many decode requests together to amortize memory reads.</p>
</div>

<h2>Batching Strategies</h2>
<ul>
<li><strong>Static batching</strong> — fixed batch, all sequences padded to max length. Simple but wastes compute on padding.</li>
<li><strong>Dynamic batching</strong> — group requests arriving within a time window. Better utilization but adds latency from waiting.</li>
<li><strong>Continuous batching</strong> — insert new requests into running batches as existing ones complete. No padding waste, no batching delay.</li>
<li><strong>Iteration-level scheduling</strong> — make scheduling decisions at each decode iteration, enabling preemption and priority.</li>
</ul>

<h2>Memory Management</h2>
<p>For a 70B parameter model serving long contexts, KV cache can exceed model weights in GPU memory. Key innovations:</p>

<div class="evidence">
<div class="ev-label">PagedAttention (vLLM)</div>
<p>Inspired by OS virtual memory, PagedAttention stores KV cache in non-contiguous blocks ("pages"), allocating on demand and sharing pages across parallel sequences (e.g., beam search). Eliminates fragmentation that wastes 60-80% of KV cache memory in naive implementations.</p>
</div>

<ul>
<li><strong>Grouped-Query Attention (GQA)</strong> — share key-value heads across multiple query heads, reducing KV cache size by the group factor</li>
<li><strong>KV cache quantization</strong> — store cached keys/values in lower precision (FP8, INT4) with minimal quality loss</li>
<li><strong>Prefix caching</strong> — share KV cache for common prefixes (system prompts) across all requests</li>
</ul>

<h2>Latency Metrics</h2>
<ul>
<li><strong>TTFT</strong> (Time To First Token) — how quickly the first response token appears. Dominated by prefill time.</li>
<li><strong>TPOT</strong> (Time Per Output Token) — inter-token latency during generation. Dominated by decode memory bandwidth.</li>
<li><strong>Throughput</strong> — total tokens/second across all concurrent requests. Maximized by large batch sizes.</li>
</ul>

<div class="note">
<div class="note-label">Fundamental trade-off</div>
<p>TTFT and throughput are in tension. Larger batches improve throughput but increase queue time (hurting TTFT). Production systems must navigate this trade-off based on SLO requirements — interactive chat needs low TTFT; batch processing needs high throughput.</p>
</div>
`,
      concepts: [
        { name: "Continuous batching", role: "Technique", summary: "Insert new requests into running batches as existing sequences complete. Eliminates padding waste and batching delay. Standard in modern LLM serving." },
        { name: "PagedAttention", role: "System", summary: "Virtual-memory-inspired KV cache management. Non-contiguous block allocation eliminates fragmentation. Enables prefix sharing and on-demand allocation." }
      ],
      contributions: []
    },

    "compiler-ai-infra": {
      title: "Compiler Stacks for AI",
      subtitle: "How compiler infrastructure enables efficient AI model execution across diverse hardware — bridging framework-level graphs and target-specific code through staged lowering and domain-specific optimizations.",
      domain: "AI Infrastructure",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" },
        { text: "Incoming: MLIR" }
      ],
      body: `
<h2>Overview</h2>
<p>AI compiler stacks transform high-level model graphs (expressed in frameworks like PyTorch, JAX, TensorFlow) into efficient hardware-specific code (running on GPUs, TPUs, custom accelerators). This is fundamentally a <em>lowering pipeline</em> problem — the same challenge compiler infrastructure addresses, but with domain-specific operations (matmul, convolution, attention) and target-specific constraints (tensor core shapes, memory hierarchy).</p>

<h2>The Compilation Gap</h2>
<p>Frameworks express computations as high-level operator graphs:</p>
<pre>y = torch.nn.functional.linear(x, weight, bias)
# What the user writes: one line

# What hardware needs: tiled matrix multiply,
# memory staging, register allocation, synchronization</pre>

<div class="analysis">
<div class="an-label">Why this matters</div>
<p>The gap between framework operator and hardware instruction is enormous. Hand-optimized kernels (cuBLAS, cuDNN) close this gap for common operations, but novel architectures (sparse attention, MoE routing, state-space models) require custom compilation to achieve good performance.</p>
</div>

<h2>Major Systems</h2>

<h3>XLA (Accelerated Linear Algebra)</h3>
<p>Google's compiler for TensorFlow/JAX. Uses StableHLO (MLIR-based) as input, MHLO internally, and targets TPUs, GPUs, and CPUs. Key strength: whole-program optimization across operation boundaries.</p>

<h3>TVM / Apache TVM</h3>
<p>Framework-agnostic compiler with Relay IR frontend and TIR (Tensor IR) backend. Distinguished by auto-tuning — searching the space of valid implementations to find the fastest for specific hardware.</p>

<h3>Triton</h3>
<p>Python-native GPU kernel compiler for tiled computations. Programmers write kernels in Python with explicit tiling annotations; Triton handles memory coalescing, shared memory staging, and instruction selection. Lower barrier than CUDA for custom kernels.</p>

<h3>IREE</h3>
<p>End-to-end MLIR-based compiler for deploying ML models. Full pipeline from high-level MLIR dialects through scheduling, tiling, and vectorization to native code. Targets CPUs, GPUs, and embedded accelerators.</p>

<h3>torch.compile (PyTorch 2)</h3>
<p>JIT compilation for PyTorch. TorchDynamo captures Python execution traces; TorchInductor generates triton kernels or C++ code. Key innovation: graph capture without requiring static graphs.</p>

<h2>MLIR's Unifying Role</h2>
<p>MLIR provides the shared infrastructure layer. XLA's StableHLO, IREE's full pipeline, and parts of TVM use MLIR dialects. This convergence means understanding MLIR's design principles (recursive nesting, dialect conversion, progressive lowering) gives structural insight into all these systems.</p>

<div class="evidence">
<div class="ev-label">Convergence evidence</div>
<p>StableHLO (XLA's input format) is an MLIR dialect. IREE's entire pipeline is MLIR end-to-end. Torch-MLIR bridges PyTorch to MLIR. The ecosystem is converging on MLIR as the shared substrate, even as different systems make different choices at higher abstraction levels.</p>
</div>
`,
      concepts: [
        { name: "Graph lowering", role: "Process", summary: "Transforming framework-level operator graphs into schedulable, fusable, tileable operations. The first stage of AI compilation." },
        { name: "Operator fusion", role: "Optimization", summary: "Combining adjacent operations to reduce memory traffic (avoid writing/reading intermediate tensors). Often the single largest performance win." }
      ],
      contributions: []
    },

    "type-systems": {
      title: "Type Systems",
      subtitle: "Static and dynamic type disciplines for classifying values, preventing errors, and enabling optimizations — from simple integer/string distinctions to dependent types encoding proofs.",
      domain: "Programming Languages",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" }
      ],
      body: `
<h2>Overview</h2>
<p>A type system classifies program values into categories (types) and enforces rules about how values of different types can interact. At minimum, this prevents category errors (adding a string to an integer); at maximum, it can encode complex invariants that make entire classes of bugs unrepresentable.</p>

<h2>Fundamental Dimensions</h2>
<ul>
<li><strong>Static vs. dynamic</strong> — checked at compile time (Rust, Haskell) or runtime (Python, JavaScript)</li>
<li><strong>Nominal vs. structural</strong> — type identity by name (Java, C#) or by shape/structure (TypeScript, OCaml modules)</li>
<li><strong>Subtyping</strong> — whether type A can be used where type B is expected (covariance, contravariance)</li>
<li><strong>Parametric polymorphism</strong> — generics that abstract over type parameters (<code>List&lt;T&gt;</code>)</li>
<li><strong>Linear/affine types</strong> — values used exactly once (linear) or at most once (affine). Enables resource management without GC (Rust's ownership).</li>
</ul>

<div class="analysis">
<div class="an-label">The soundness spectrum</div>
<p>A type system is <em>sound</em> if well-typed programs cannot produce type errors at runtime. Most practical languages sacrifice soundness for convenience (Java's null, TypeScript's any, covariant arrays). Rust is notable for maintaining soundness without sacrificing ergonomics in most cases.</p>
</div>

<h2>Types in Compiler IRs</h2>
<p>In compiler infrastructure, types serve a different purpose than in source languages — they carry <em>representation information</em> needed for code generation:</p>
<ul>
<li><code>i64</code> — 64-bit integer, fits in a register</li>
<li><code>memref&lt;16x16xf32&gt;</code> — pointer to a 16×16 float buffer with known layout</li>
<li><code>tensor&lt;?x256xf16&gt;</code> — dynamically-shaped tensor in value semantics</li>
</ul>

<div class="evidence">
<div class="ev-label">MLIR's extensible types</div>
<p>MLIR allows each dialect to define its own types. The <code>tensor</code> type (value semantics, no memory layout) coexists with <code>memref</code> (reference semantics, explicit layout). Lowering from tensor to memref is a deliberate compilation step — "bufferization" — that introduces memory management.</p>
</div>

<h2>Practical Impact</h2>
<p>Stronger type systems catch more errors earlier but require more programmer effort. The trend in modern language design is toward <em>gradual typing</em> (TypeScript, Python type hints) and <em>inference-heavy</em> systems (Rust, Kotlin) that provide strong guarantees without excessive annotation burden.</p>

<div class="note">
<div class="note-label">Research frontier</div>
<p>Dependent types (Idris, Agda, Lean) allow types to depend on values — e.g., <code>Vector n a</code> where <code>n</code> is a natural number known at type-check time. This enables encoding matrix dimension compatibility, protocol state machines, and mathematical proofs directly in the type system. The cost: significantly harder type inference and more complex error messages.</p>
</div>
`,
      concepts: [
        { name: "Type inference", role: "Mechanism", summary: "Automatically deducing types from usage context without explicit annotations. Hindley-Milner (ML family) vs. local inference (Rust, Kotlin, Swift)." },
        { name: "Soundness", role: "Property", summary: "Well-typed programs cannot produce type errors at runtime. The gold standard for type system correctness. Sacrificed by most practical languages." }
      ],
      contributions: []
    },

    "ir-design": {
      title: "IR Design Principles",
      subtitle: "Foundational architectural choices in designing intermediate representations — granularity, extensibility, nesting depth, and metadata preservation determine what transformations are natural and what information survives compilation.",
      domain: "Programming Languages",
      type: "article",
      meta: [
        { text: "Concepts: 2 entities" },
        { text: "Incoming: MLIR" }
      ],
      body: `
<h2>Overview</h2>
<p>An intermediate representation (IR) is the data structure a compiler manipulates internally. Its design is the most consequential architectural decision in a compiler — it determines which analyses are cheap, which transformations are natural, and what information is preserved or discarded during compilation.</p>

<h2>Key Design Choices</h2>

<h3>Granularity</h3>
<ul>
<li><strong>Expression-level (SSA)</strong> — each subexpression has an explicit name and definition point. LLVM, MLIR.</li>
<li><strong>Statement-level</strong> — operations on named variables with explicit control flow. Three-address code.</li>
<li><strong>Graph-level</strong> — computation as a DAG of operators. TensorFlow, ONNX.</li>
</ul>

<h3>SSA form</h3>
<p>Single Static Assignment: each value is defined exactly once. This invariant makes dataflow analysis trivial — the definition point <em>is</em> the reaching definition, no iteration needed.</p>

<div class="evidence">
<div class="ev-label">Why SSA works</div>
<p>Without SSA, determining "which definition of variable x reaches this use" requires iterating to a fixed point. With SSA, definition and use are directly linked. This converts an iterative analysis into a direct graph traversal — the compiler's most common operation becomes O(1) per edge instead of O(n) iterations.</p>
</div>

<h3>Nesting structure</h3>
<ul>
<li><strong>Flat</strong> — functions contain a flat list of basic blocks. LLVM IR. Simple, fast to traverse, but structural information (loops, regions) must be reconstructed.</li>
<li><strong>Recursive</strong> — operations can contain regions which contain operations. MLIR. Preserves structure but more complex traversal.</li>
<li><strong>Sea-of-nodes</strong> — fused data and control flow graph without explicit basic blocks. V8 TurboFan, Graal. Enables reordering but harder to reason about scheduling.</li>
</ul>

<div class="analysis">
<div class="an-label">MLIR's structural insight</div>
<p>Flat IRs destroy structural information that was expensive to compute (loop boundaries, operation scoping, region semantics). MLIR's recursive nesting preserves this information by construction — a <code>scf.for</code> operation containing a region IS the loop, not a pattern of branches that must be recognized as a loop.</p>
</div>

<h3>Extensibility</h3>
<ul>
<li><strong>Fixed instruction set</strong> — LLVM has a closed set of ~60 instructions. New operations must be lowered to existing ones.</li>
<li><strong>Open operation set</strong> — MLIR allows arbitrary new operations via dialects. Domain concepts can be represented directly without premature lowering.</li>
</ul>

<h2>Metadata and Provenance</h2>
<p>A critical but often-undervalued choice: how much source-level information survives into the IR? Debug info, type annotations, optimization remarks, source locations — all must be explicitly preserved because lowering is lossy by default.</p>

<h2>Design Trade-offs</h2>
<pre>More structure → easier analysis, harder traversal
More extensibility → more expressive, harder to verify
More metadata → better debugging, larger IR size
Higher abstraction → more optimization opportunities, longer pipeline</pre>

<div class="note">
<div class="note-label">The fundamental tension</div>
<p>Every IR design is a bet on which analyses and transformations will be most important. LLVM bet on SSA-based scalar optimizations. MLIR bet on multi-level transformations across abstraction boundaries. Neither is universally better — the right choice depends on what you're compiling and what hardware you're targeting.</p>
</div>
`,
      concepts: [
        { name: "SSA", role: "Form", summary: "Single Static Assignment. Each value defined exactly once. Makes def-use analysis O(1) per edge. The foundation of modern compiler IRs." },
        { name: "Sea of nodes", role: "Form", summary: "Fused data/control flow graph without explicit basic blocks. Enables aggressive reordering but complicates scheduling and debugging." }
      ],
      contributions: []
    }
  },

  concepts: {
    operation: {
      name: "Operation",
      role: "Core entity",
      summary: "Central MLIR abstraction. Owns operands, results, regions, attributes. Fully extensible — each dialect defines its own operations.",
      definition: "An Operation is the atomic building block of MLIR. Unlike fixed-instruction IRs (LLVM has ~60 instructions), MLIR operations are fully extensible — any dialect can define new operations. Each operation can own operands (input values), results (output values), successors (branch targets), attributes (compile-time constants), properties (mutable metadata), and regions (nested IR).",
      examples: `<pre>// A function operation (owns a region with blocks)
func.func @matmul(%A: memref<16x16xf32>, %B: memref<16x16xf32>) {
  // Arithmetic operation (produces a result value)
  %c0 = arith.constant 0.0 : f32
  // Linalg operation (owns a region defining the computation body)
  linalg.matmul ins(%A, %B : memref<16x16xf32>, memref<16x16xf32>)
               outs(%C : memref<16x16xf32>)
  return
}</pre>
<p>Notice how <code>func.func</code> contains a region, <code>arith.constant</code> produces a value, and <code>linalg.matmul</code> carries complex structured attributes. All are "operations" — the abstraction unifies them.</p>`,
      related: ["Value", "Region", "Block", "Dialect"],
      usedIn: ["mlir", "ir-design", "compiler-ai-infra"],
      sources: [
        { label: "MLIR LangRef — Operations", url: "https://mlir.llvm.org/docs/LangRef/#operations" },
        { label: "MLIR Glossary", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    value: {
      name: "Value",
      role: "Core entity",
      summary: "Typed def-use edge. Either an operation result or block argument. Has exactly one definition point but potentially many users.",
      definition: "A Value in MLIR represents a typed runtime datum. Every value has exactly one point of definition (either as an operation result or a block argument) and zero or more uses (as operands to other operations). This single-definition property is the SSA invariant that makes dataflow analysis trivial.",
      examples: `<pre>// %a is a block argument (defined by the block)
^bb0(%a: i64, %cond: i1):
  // %b is an operation result (defined by arith.addi)
  %b = arith.addi %a, %a : i64
  //     ↑ uses %a twice
  // %b flows to the branch as a block argument
  cf.br ^bb1(%b: i64)
  //         ↑ %b is used here as a branch argument

^bb1(%c: i64):  // %c receives the value passed by the branch
  return %c : i64</pre>
<p>Block arguments replace phi nodes entirely. Data flow at control-flow merge points is explicit in the CFG topology — there's no magic "phi instruction" that implicitly selects between predecessors.</p>`,
      related: ["Operation", "Block", "SSA"],
      usedIn: ["mlir", "ir-design"],
      sources: [
        { label: "MLIR LangRef — High-Level Structure", url: "https://mlir.llvm.org/docs/LangRef/#high-level-structure" },
        { label: "IR Structure Tutorial — Def-Use", url: "https://mlir.llvm.org/docs/Tutorials/UnderstandingTheIRStructure/" }
      ]
    },
    region: {
      name: "Region",
      role: "Structure",
      summary: "Ordered blocks owned by an operation. Semantics (SSACFG or Graph) depend on the containing operation, not the region itself.",
      definition: "A Region is an ordered list of Blocks owned by an Operation. Critically, a region has no independent semantics — its meaning is entirely determined by the containing operation. A region inside func.func behaves like an SSACFG (control flow is meaningful); a region inside a graph-rewriting operation may have no ordering requirement.",
      examples: `<pre>// SSACFG region: order and control flow matter
func.func @example() {
  ^entry:      // ← Block 1 of the region
    ...
    cf.br ^body
  ^body:       // ← Block 2
    ...
    cf.cond_br %c, ^then, ^exit
  ^then:       // ← Block 3
    ...
  ^exit:       // ← Block 4
    return
}

// Graph region: operations have no inherent order
"test.graph_op"() ({
  %a = "test.foo"() : () -> i32
  %b = "test.bar"() : () -> i32
  // %a and %b may execute in any order
}) : () -> ()</pre>
<p>The UI must show region kind because it changes whether ordering and control-flow arrows are semantically meaningful or merely cosmetic.</p>`,
      related: ["Operation", "Block", "Dialect"],
      usedIn: ["mlir", "ir-design"],
      sources: [
        { label: "MLIR LangRef — Regions", url: "https://mlir.llvm.org/docs/LangRef/#regions" }
      ]
    },
    block: {
      name: "Block",
      role: "Structure",
      summary: "Sequential operation list with typed block arguments. CFG terminators target blocks. Block arguments replace phi nodes.",
      definition: "A Block is a sequential list of operations within a region. In SSACFG regions, blocks are like basic blocks in classical compilers — they have a single entry point and a terminator that transfers control to successor blocks. MLIR's key innovation is block arguments: typed parameters passed by branch instructions, eliminating the need for phi nodes.",
      examples: `<pre>// Block arguments in action:
^bb0(%x: i64, %flag: i1):
  cf.cond_br %flag, ^bb1, ^bb2

^bb1:
  %a = arith.constant 42 : i64
  cf.br ^merge(%a: i64)    // passes %a to ^merge

^bb2:
  %b = arith.constant 0 : i64
  cf.br ^merge(%b: i64)    // passes %b to ^merge

^merge(%result: i64):      // receives whichever was passed
  return %result : i64</pre>
<p>Compare with LLVM's phi: <code>%result = phi i64 [%a, %bb1], [%b, %bb2]</code>. Block arguments make the data flow through control-flow edges explicit and visible in the branch instruction itself.</p>`,
      related: ["Region", "Value", "Operation"],
      usedIn: ["mlir"],
      sources: [
        { label: "MLIR LangRef — Blocks", url: "https://mlir.llvm.org/docs/LangRef/#blocks" }
      ]
    },
    dialect: {
      name: "Dialect",
      role: "Namespace",
      summary: "Extension mechanism grouping operations, types, attributes under a namespace. Multiple dialects coexist; conversion between them is explicit.",
      definition: "A Dialect is MLIR's solution to the extension problem: how do you add domain-specific operations without forking the compiler? Each dialect defines a namespace (e.g., 'arith', 'linalg', 'gpu') containing operations, types, and attributes. Multiple dialects coexist in one module — a function can contain operations from arith, scf, and linalg simultaneously.",
      examples: `<pre>// Multiple dialects coexisting in one function:
func.func @mixed_dialects(%input: tensor<8x8xf32>) -> tensor<8x8xf32> {
  // 'arith' dialect — scalar arithmetic
  %zero = arith.constant 0.0 : f32

  // 'linalg' dialect — structured linear algebra
  %filled = linalg.fill ins(%zero: f32) outs(%input: tensor<8x8xf32>)

  // 'scf' dialect — structured control flow
  %result = scf.for %i = %c0 to %c8 step %c1
            iter_args(%acc = %filled) -> tensor<8x8xf32> {
    ...
    scf.yield %updated : tensor<8x8xf32>
  }
  return %result : tensor<8x8xf32>
}</pre>
<p>Key dialects: <code>func</code> (functions), <code>arith</code> (arithmetic), <code>cf</code> (control flow), <code>scf</code> (structured loops), <code>memref</code> (memory buffers), <code>tensor</code> (value-semantics tensors), <code>linalg</code> (linear algebra), <code>gpu</code> (GPU operations), <code>llvm</code> (LLVM IR lowering target).</p>`,
      related: ["Operation", "Conversion", "Lowering"],
      usedIn: ["mlir", "compiler-ai-infra", "lowering-pipelines"],
      sources: [
        { label: "MLIR Dialects Index", url: "https://mlir.llvm.org/docs/Dialects/" },
        { label: "MLIR LangRef — Dialects", url: "https://mlir.llvm.org/docs/LangRef/#dialects" }
      ]
    },
    symbol: {
      name: "Symbol",
      role: "Scope",
      summary: "Named operation in a symbol table. Referenced via SymbolRefAttr for cross-scope access that SSA dominance cannot express.",
      definition: "Symbols provide MLIR's mechanism for cross-scope references. While SSA values are only visible within their dominance scope, symbols are named operations that can be referenced from anywhere via SymbolRefAttr. Functions, globals, and module-level entities are typically symbols.",
      examples: `<pre>// @matmul is a Symbol — referenced by name, not by SSA value
module {
  // Symbol definition: a named function
  func.func @matmul(%A: memref<4x4xf32>, %B: memref<4x4xf32>) {
    ...
  }

  func.func @caller() {
    // Symbol reference: calling by name
    func.call @matmul(%x, %y) : (memref<4x4xf32>, memref<4x4xf32>) -> ()
    //        ^^^^^^^ This is a SymbolRefAttr, not an SSA operand

    // Nested symbol reference:
    func.call @library::@helper() : () -> ()
    //        ^^^^^^^^^^^^^^^^^^^ nested: module "library", func "helper"
  }
}</pre>
<p>Symbols exist because module-level entities need stable names that survive across compilation stages. You can't pass a "function pointer as SSA value" in MLIR's design — you reference functions by their symbol name.</p>`,
      related: ["Operation", "Value"],
      usedIn: ["mlir"],
      sources: [
        { label: "Symbols and Symbol Tables", url: "https://mlir.llvm.org/docs/SymbolsAndSymbolTables/" }
      ]
    },
    pass: {
      name: "Pass",
      role: "Transformation",
      summary: "Operation-scoped transformation. Nested pass managers mirror IR nesting. Must not mutate outside anchor scope.",
      definition: "A Pass in MLIR is a transformation that operates on a specific operation type (its 'anchor'). Passes must not inspect or mutate anything outside the anchor operation's region tree. This scoping rule enables parallelism: passes on independent operations can run concurrently.",
      examples: `<pre>// Pass pipeline structure (mirrors IR nesting):
// mlir-opt input.mlir -pass-pipeline='
//   builtin.module(
//     func.func(
//       canonicalize,    ← runs on each func.func
//       cse              ← runs on each func.func
//     ),
//     inline,            ← runs on the module
//     func.func(
//       convert-linalg-to-loops  ← lowering pass
//     )
//   )'

// The nested structure means:
// 1. canonicalize + cse run inside each function
// 2. inline runs at module level (can see all functions)
// 3. linalg-to-loops runs inside each function after inlining</pre>
<p>The pass manager exposes timing (<code>-mlir-timing</code>) and IR snapshots (<code>-mlir-print-ir-after-all</code>) — these are the natural data feeds for pipeline visualization.</p>`,
      related: ["Operation", "Lowering", "Conversion"],
      usedIn: ["mlir", "lowering-pipelines"],
      sources: [
        { label: "Pass Management", url: "https://mlir.llvm.org/docs/PassManagement/" }
      ]
    },
    lowering: {
      name: "Lowering",
      role: "Transformation",
      summary: "Progressive movement toward lower abstraction. Distinct from conversion (same level) and translation (leaving MLIR).",
      definition: "Lowering is the progressive transformation of IR from higher to lower abstraction levels. It is distinct from conversion (rewriting between dialects at the same abstraction level) and translation (leaving MLIR entirely to emit LLVM IR, machine code, etc.).",
      examples: `<pre>// Lowering chain from high-level to low-level:

// Level 1: linalg (structured computation)
linalg.matmul ins(%A, %B) outs(%C)

// ↓ lower linalg to loops (scf dialect)
// Level 2: scf (structured control flow)
scf.for %i = 0 to N {
  scf.for %j = 0 to N {
    scf.for %k = 0 to N {
      %a = memref.load %A[%i, %k]
      %b = memref.load %B[%k, %j]
      %c = arith.mulf %a, %b
      ...
    }
  }
}

// ↓ lower scf to cf (unstructured control flow)
// Level 3: cf (branch-based)
^loop_header:
  cf.cond_br %done, ^exit, ^body
^body:
  ...
  cf.br ^loop_header

// ↓ translate to LLVM IR (leaving MLIR)
// Level 4: LLVM IR (external)
define void @matmul(...) { ... }</pre>`,
      related: ["Pass", "Conversion", "Dialect"],
      usedIn: ["mlir", "lowering-pipelines", "compiler-ai-infra"],
      sources: [
        { label: "MLIR Glossary — Lowering", url: "https://mlir.llvm.org/getting_started/Glossary/" }
      ]
    },
    "self-attention": {
      name: "Self-attention",
      role: "Mechanism",
      summary: "Weighted aggregation over all sequence positions via learned query-key compatibility. O(n²) in sequence length.",
      definition: "Self-attention computes, for each position in a sequence, a weighted sum over all other positions. The weights (attention scores) are determined by the compatibility between a 'query' vector at the current position and 'key' vectors at all other positions. This allows every token to directly attend to every other token regardless of distance.",
      examples: `<pre>// Attention computation:
// Q, K, V ∈ ℝ^(seq_len × d_model)

Attention(Q, K, V) = softmax(QK^T / √d_k) · V

// For a sequence of length n=4:
//   Q·K^T produces a 4×4 attention matrix
//   Each row sums to 1 after softmax
//   Row i tells position i how much to attend to each other position

// Multi-head: run h attention functions in parallel
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) · W_O
  where head_i = Attention(Q·W_Q_i, K·W_K_i, V·W_V_i)</pre>
<p>The O(n²) cost comes from the QK^T matrix multiplication — every query must dot-product with every key. For sequence length 128K, this means 16 billion attention scores per layer.</p>`,
      related: ["KV cache", "Transformer"],
      usedIn: ["transformer-arch", "serving-systems"],
      sources: [
        { label: "Attention Is All You Need (2017)", url: "https://arxiv.org/abs/1706.03762" }
      ]
    },
    "kv cache": {
      name: "KV cache",
      role: "Optimization",
      summary: "Cached key-value pairs for efficient autoregressive generation. Avoids recomputing attention history. Memory grows linearly with context length.",
      definition: "During autoregressive generation, each new token needs to attend to all previous tokens. Without caching, this means recomputing all key-value projections for the entire history at each step (O(n²) total). The KV cache stores previously computed key and value tensors, so each new token only computes its own K/V and reuses the cached history.",
      examples: `<pre>// Without KV cache (naive generation):
// Step 1: compute attention over [t1]           → 1 KV pair
// Step 2: compute attention over [t1, t2]       → 2 KV pairs (recomputed!)
// Step 3: compute attention over [t1, t2, t3]   → 3 KV pairs (recomputed!)
// Total KV computations: 1+2+3+...+n = O(n²)

// With KV cache:
// Step 1: compute K1,V1, cache them             → cache: [K1,V1]
// Step 2: compute K2,V2, attend to cache+new    → cache: [K1,V1,K2,V2]
// Step 3: compute K3,V3, attend to cache+new    → cache: [K1,V1,K2,V2,K3,V3]
// Total KV computations: n (linear!)

// Memory cost per layer:
// 2 × seq_len × num_heads × head_dim × dtype_bytes
// For Llama-70B, 128K context:
//   2 × 131072 × 64 × 128 × 2 bytes = ~4 GB per layer
//   × 80 layers = ~320 GB (!) for KV cache alone</pre>
<p>This is why serving long-context models requires techniques like PagedAttention (non-contiguous allocation), GQA (shared KV heads), and KV cache quantization (FP8/INT4).</p>`,
      related: ["Self-attention", "PagedAttention", "Continuous batching"],
      usedIn: ["transformer-arch", "serving-systems"],
      sources: [
        { label: "Efficient Inference — KV Caching", url: "https://arxiv.org/abs/2211.05102" }
      ]
    },
    ssa: {
      name: "SSA",
      role: "Form",
      summary: "Single Static Assignment. Each value defined exactly once. Makes def-use analysis O(1) per edge.",
      definition: "Single Static Assignment is an IR property where each variable (value) is assigned exactly once. This simplifies dataflow analysis dramatically: to find where a value is defined, just look at its unique definition point. No iteration to a fixed point is needed because reaching definitions are trivially resolved.",
      examples: `<pre>// Non-SSA (traditional):
x = 1
x = x + 1    // Which 'x'? Need reaching-definition analysis
y = x * 2    // Which definition of x reaches here?

// SSA form:
x1 = 1
x2 = x1 + 1  // Unambiguous: uses x1, defines x2
y1 = x2 * 2  // Unambiguous: uses x2

// At control-flow merges, SSA needs a mechanism to select:
// LLVM uses phi nodes:
//   %x3 = phi [%x1, %bb1], [%x2, %bb2]
// MLIR uses block arguments:
//   ^merge(%x3: i32):  // receives from predecessor's branch</pre>
<p>SSA converts the "which definition reaches this use?" question from an iterative O(n) analysis into a direct O(1) pointer follow. This is why virtually all modern compiler IRs use SSA form.</p>`,
      related: ["Value", "Block", "Operation"],
      usedIn: ["mlir", "ir-design"],
      sources: [
        { label: "SSA — Wikipedia", url: "https://en.wikipedia.org/wiki/Static_single-assignment_form" }
      ]
    },
    locality: {
      name: "Locality",
      role: "Principle",
      summary: "Temporal (reuse soon) and spatial (access nearby) patterns that determine cache efficiency.",
      definition: "Locality is the principle that programs tend to access a small subset of their address space at any given time. Temporal locality means recently accessed data will likely be accessed again soon. Spatial locality means data near recently accessed data will likely be accessed next. These patterns are what caches exploit — without locality, caches would be useless.",
      examples: `<pre>// Good temporal locality (reuses 'sum' every iteration):
float sum = 0;
for (int i = 0; i < N; i++)
  sum += arr[i];  // 'sum' stays in register/L1

// Good spatial locality (sequential access):
for (int i = 0; i < N; i++)
  arr[i] *= 2;  // Each access is +4 bytes from previous
                 // Prefetcher detects stride, pre-fetches lines

// BAD locality (random access):
for (int i = 0; i < N; i++)
  arr[random_indices[i]] *= 2;  // Cache miss nearly every access
                                 // Defeats prefetcher</pre>
<p>Loop tiling exploits both: process a small block that fits in cache (spatial), reuse it multiple times before eviction (temporal). This is why MLIR's affine dialect exists — to reason about and optimize these access patterns automatically.</p>`,
      related: ["Cache line", "Memory Hierarchy"],
      usedIn: ["memory-hierarchy"],
      sources: []
    }
  }
};
