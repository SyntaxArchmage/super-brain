const WIKI = {
  taxonomy: [
    {
      id: "foundations",
      label: "Foundations",
      children: [
        { id: "inference-landscape", label: "The Inference Problem", type: "article" },
        { id: "kv-cache", label: "KV Cache & Memory", type: "article" },
        { id: "paged-attention", label: "PagedAttention", type: "article" },
        { id: "flash-attention", label: "FlashAttention", type: "article" }
      ]
    },
    {
      id: "frameworks",
      label: "Serving Frameworks",
      children: [
        { id: "vllm", label: "vLLM", type: "article" },
        { id: "sglang", label: "SGLang", type: "article" },
        { id: "tensorrt-llm", label: "TensorRT-LLM", type: "article" },
        { id: "ollama-llamacpp", label: "Ollama & llama.cpp", type: "article" }
      ]
    },
    {
      id: "optimization",
      label: "Optimization Techniques",
      children: [
        { id: "batching-scheduling", label: "Batching & Scheduling", type: "article" },
        { id: "speculative-decoding", label: "Speculative Decoding", type: "article" },
        { id: "disaggregated-serving", label: "Disaggregated Serving", type: "article" },
        { id: "moe-serving", label: "MoE Serving", type: "article" }
      ]
    },
    {
      id: "comparison",
      label: "Comparison & Selection",
      children: [
        { id: "benchmarks", label: "Benchmarks & Trade-offs", type: "article" }
      ]
    }
  ],

  pages: {
    index: {
      title: "AI Inference Infrastructure",
      subtitle: "From PagedAttention to production serving — a systematic survey of frameworks, memory management, and optimization techniques for large language model inference.",
      type: "index"
    },

    "inference-landscape": {
      title: "The Inference Problem",
      subtitle: "Why LLM inference is hard: the prefill/decode asymmetry, autoregressive generation, and the fundamental tension between latency, throughput, and memory.",
      domain: "Foundations",
      type: "article",
      meta: [
        { text: "Primary sources: Kwon et al. SOSP 2023, Google Cloud Blog 2026", dot: "#2563eb" },
        { text: "Concepts: 6 entities" },
        { text: "Cross-references: 4 pages" }
      ],
      body: `
<h2>Two Phases, Two Bottlenecks</h2>
<p>LLM inference is not a single operation — it is two fundamentally different computational phases that happen to share a GPU. Understanding this split is the prerequisite for understanding every optimization in this wiki.</p>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From the PagedAttention paper (Kwon et al., SOSP 2023): "The key-value cache (KV cache) memory for each request is huge and grows and shrinks dynamically. When managed inefficiently, this memory can be significantly wasted by fragmentation and redundant duplication, limiting the batch size."</p>
</div>

<h3>Prefill Phase — Compute-Bound</h3>
<p>The prefill phase processes the entire input prompt in a single parallel forward pass. All input tokens are attended to simultaneously. The GPU's arithmetic units are the bottleneck — memory bandwidth is underutilized. The duration of this phase determines <em>Time To First Token (TTFT)</em>, the delay the user perceives before any output appears.</p>

<h3>Decode Phase — Memory-Bound</h3>
<p>The decode phase generates tokens one at a time, autoregressively. Each step reads the entire KV cache (all previously generated keys and values across all attention layers) plus the model weights, but performs a relatively small amount of computation. Memory bandwidth is the bottleneck — the GPU's compute units sit mostly idle. The speed of each decode step determines <em>Inter-Token Latency (ITL)</em>, and the aggregate decode throughput determines <em>tokens per second (tok/s)</em>.</p>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>This asymmetry is THE fundamental architectural tension in LLM serving. Every major framework optimization — continuous batching, disaggregated serving, speculative decoding, prefix caching — is an attempt to reconcile these two phases' conflicting hardware requirements on shared resources.</p>
</div>

<h2>The Metrics That Matter</h2>
<p>Four metrics define the quality of an LLM serving system. They trade off against each other, and different applications weight them differently:</p>

<table>
<tr><th>Metric</th><th>Definition</th><th>Bottleneck</th><th>Matters Most For</th></tr>
<tr><td><strong>TTFT</strong></td><td>Time to first token — latency from request to first output token</td><td>Prefill compute</td><td>Interactive chat, streaming UIs</td></tr>
<tr><td><strong>ITL</strong></td><td>Inter-token latency — time between consecutive output tokens</td><td>Decode memory bandwidth</td><td>Perceived fluency</td></tr>
<tr><td><strong>TPOT</strong></td><td>Time per output token — average across entire generation</td><td>Both</td><td>Overall responsiveness</td></tr>
<tr><td><strong>Throughput</strong></td><td>Total tokens/second across all concurrent requests</td><td>GPU utilization</td><td>Cost efficiency at scale</td></tr>
</table>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>A critical distinction: throughput measures aggregate system efficiency (all users combined), while TTFT/ITL measure individual user experience. A system can have excellent throughput while delivering poor per-user latency if it batches too aggressively. Production deployments must optimize for both, typically by tracking TTFT p50/p95 alongside aggregate tok/s.</p>
</div>

<h2>The Arithmetic Intensity Model (Roofline)</h2>
<pre>H100 SXM Roofline:
  Peak compute: 990 TFLOPS (FP16)
  Peak bandwidth: 3.35 TB/s (HBM3)
  Ridge point: 990 / 3.35 = 295 FLOPs/byte

Prefill (compute-bound):
  Ops: 2 × params × tokens  (e.g. 2 × 70B × 2048 = 287 TFLOPS)
  Bytes: model weights = 140GB (read once, amortized over tokens)
  Intensity: 287T / 140G ≈ 2050 FLOPs/byte → above ridge → GPU saturated ✓

Decode (memory-bound):
  Ops: 2 × params × 1  (e.g. 2 × 70B × 1 = 140 GFLOPS per token)
  Bytes: model weights + KV = 140GB + KV per step
  Intensity: 140G / 140G ≈ 1 FLOP/byte → far below ridge → bandwidth bottleneck
  Theoretical max: 3.35 TB/s / 140 GB = 24 tokens/sec (single request)</pre>

<p>This explains why batching is the primary throughput lever for decode: processing 128 requests in a single pass reads weights once but generates 128 tokens — multiplying effective arithmetic intensity by the batch size.</p>

<h2>Why Not Just Use More GPUs?</h2>
<p>Scaling horizontally (more replicas) helps throughput but not per-request latency. Scaling vertically (larger GPUs) helps memory capacity but the 80GB of an H100 is still the hard constraint for KV cache when serving many concurrent requests with long contexts. The real leverage comes from <em>using memory more efficiently</em> — which is exactly what PagedAttention, prefix caching, and quantization achieve.</p>
`,
      concepts: [
        { name: "TTFT", role: "Performance Metric", summary: "The latency from when a request is received to when the first output token is generated — determined by prefill phase duration." },
        { name: "ITL", role: "Performance Metric", summary: "The time between consecutive output tokens — determines perceived fluency of streaming output, bottlenecked by decode-phase memory bandwidth." },
        { name: "KVCache", role: "Core Data Structure", summary: "The stored Key and Value tensors from all previous tokens across all attention layers — the dominant memory consumer during LLM inference." },
        { name: "Prefill", role: "Inference Phase", summary: "The compute-bound phase that processes the entire input prompt in parallel, generating the initial KV cache — its duration determines TTFT." },
        { name: "Decode", role: "Inference Phase", summary: "The memory-bound autoregressive phase that generates tokens one at a time — each step reads the entire KV cache, determining ITL and throughput." },
        { name: "ContinuousBatching", role: "Scheduling Strategy", summary: "Dynamically insert and remove requests from the GPU batch at each iteration — eliminating idle time from static batching and improving throughput 3-10x." }
      ],
      contributions: [],
      related: ["kv-cache", "paged-attention", "batching-scheduling"]
    },

    "kv-cache": {
      title: "KV Cache & Memory",
      subtitle: "The attention cache that dominates GPU memory during inference — why it grows unboundedly, how much it costs, and why managing it efficiently is the central challenge.",
      domain: "Foundations",
      type: "article",
      meta: [
        { text: "Primary source: Kwon et al. SOSP 2023", dot: "#2563eb" },
        { text: "Concepts: 4 entities" },
        { text: "Cross-references: 3 pages" }
      ],
      body: `
<h2>What the KV Cache Is</h2>
<p>During autoregressive generation, each Transformer attention layer computes Key and Value vectors for every token. These vectors must be stored because every future token needs to attend to them. The accumulated storage across all layers and all tokens is the <em>KV cache</em>.</p>

<p>Without caching, generating token <em>n</em> would require recomputing attention for all previous <em>n-1</em> tokens — O(n²) compute per token. The KV cache converts this to O(n) by trading memory for compute.</p>

<h2>Memory Arithmetic</h2>
<p>The KV cache size per token is determined by model architecture:</p>
<pre>KV per token per layer = 2 × num_kv_heads × head_dim × sizeof(dtype)
KV per token (all layers) = above × num_layers</pre>

<p>Concrete example for a 70B model (80 layers, 64 KV heads, head_dim=128, FP16):</p>
<table>
<tr><th>Quantity</th><th>Calculation</th><th>Result</th></tr>
<tr><td>KV per token per layer</td><td>2 × 64 × 128 × 2 bytes</td><td>32 KB</td></tr>
<tr><td>KV per token (all layers)</td><td>32 KB × 80</td><td>2.56 MB</td></tr>
<tr><td>Single request (2048 tokens)</td><td>2.56 MB × 2048</td><td>5.24 GB</td></tr>
<tr><td>100 concurrent requests</td><td>5.24 GB × 100</td><td>524 GB</td></tr>
</table>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>A single H100 has 80 GB of HBM. The model weights for a 70B model in FP16 consume ~140 GB (requiring at least 2 GPUs for tensor parallelism). The remaining memory per GPU for KV cache is perhaps 10-15 GB — enough for only 2-3 concurrent requests at 2K context. This is why KV cache memory management is the most impactful optimization target.</p>
</div>

<h2>The Memory Waste Problem</h2>
<p>Before PagedAttention, systems pre-allocated KV cache memory based on the maximum possible sequence length for each request. This caused three types of waste:</p>

<ol>
<li><strong>Internal fragmentation</strong>: Most requests generate far fewer tokens than the maximum — the unused pre-allocated memory sits idle.</li>
<li><strong>External fragmentation</strong>: As requests of varying lengths complete and free their memory, the remaining free space is split into non-contiguous gaps too small to satisfy new requests.</li>
<li><strong>Redundant duplication</strong>: Requests sharing the same system prompt or context each store identical KV cache — no sharing mechanism exists.</li>
</ol>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From the PagedAttention paper: "existing systems waste 60%–80% of KV cache memory due to fragmentation and over-reservation." This directly limits the batch size and therefore the throughput of the serving system.</p>
</div>

<h2>GQA and MLA: Architectural KV Reduction</h2>
<p>Grouped-Query Attention (GQA) and Multi-head Latent Attention (MLA) reduce KV cache size at the model architecture level:</p>

<pre>KV cache comparison (70B model, 80 layers, 2048 context, FP16):

MHA (Multi-Head Attention) — 64 KV heads:
  per token: 2 × 80 × 64 × 128 × 2 bytes = 2.62 MB
  at 2K: 2.62 MB × 2048 = 5.37 GB per request

GQA (Grouped-Query) — 8 KV heads (Llama 3):
  per token: 2 × 80 × 8 × 128 × 2 bytes = 327 KB  (8× smaller)
  at 2K: 327 KB × 2048 = 654 MB per request

MLA (Multi-head Latent) — DeepSeek V3, latent_dim=512:
  per token: 80 × 512 × 2 bytes = 80 KB  (32× smaller than MHA)
  at 2K: 80 KB × 2048 = 160 MB per request

Impact on batch size (H100, 15GB available for KV):
  MHA:  15 GB / 5.37 GB = 2 concurrent requests
  GQA:  15 GB / 654 MB  = 22 concurrent requests
  MLA:  15 GB / 160 MB  = 93 concurrent requests</pre>

<p>GQA shares K/V heads across multiple query heads (e.g., Llama 3 uses 8 KV heads for 64 query heads — an 8× reduction). MLA (used in DeepSeek) compresses KV into a learned low-rank latent space. These are orthogonal to system-level optimizations like PagedAttention — they stack multiplicatively.</p>
`,
      concepts: [
        { name: "KVCache", role: "Core Data Structure", summary: "The stored Key and Value tensors from all previous tokens across all attention layers — the dominant memory consumer during LLM inference." },
        { name: "Prefill", role: "Inference Phase", summary: "The compute-bound phase that processes the entire input prompt in parallel, generating the initial KV cache — its duration determines TTFT." },
        { name: "Decode", role: "Inference Phase", summary: "The memory-bound autoregressive phase that generates tokens one at a time — each step reads the entire KV cache, determining ITL and throughput." },
        { name: "GQA", role: "Architecture Optimization", summary: "Share K/V heads across multiple query heads — reducing KV cache size by the grouping factor (e.g., 8x for Llama 3) without significant quality loss." },
        { name: "MLA", role: "Architecture Optimization", summary: "Compress K/V into a learned low-rank latent space — further reducing KV cache beyond GQA, used in DeepSeek models." }
      ],
      contributions: [
        { target: "inference-landscape", text: "KV cache is the central memory constraint introduced by the autoregressive inference problem." }
      ],
      related: ["paged-attention", "inference-landscape", "vllm"]
    },

    "paged-attention": {
      title: "PagedAttention",
      subtitle: "The operating-systems insight that transformed LLM serving: treat KV cache memory like virtual memory with demand paging, block tables, and copy-on-write.",
      domain: "Foundations",
      type: "article",
      meta: [
        { text: "Primary source: Kwon et al., 'Efficient Memory Management for LLM Serving with PagedAttention', SOSP 2023", dot: "#2563eb" },
        { text: "Concepts: 5 entities" },
        { text: "Cross-references: 4 pages" }
      ],
      body: `
<h2>The Virtual Memory Analogy</h2>
<p>In the 1960s, OS designers solved the same problem for CPU processes: variable-size memory demands, fragmentation, and the need for sharing. The solution was <em>virtual memory with paging</em> — and it maps directly to KV cache management:</p>

<table>
<tr><th>OS Concept</th><th>PagedAttention Equivalent</th></tr>
<tr><td>Virtual page</td><td>Logical KV block (B tokens of K and V)</td></tr>
<tr><td>Physical frame</td><td>Physical GPU memory block</td></tr>
<tr><td>Page table</td><td>Block table (maps logical → physical)</td></tr>
<tr><td>Demand paging</td><td>Lazy block allocation (allocate only as tokens generate)</td></tr>
<tr><td>Copy-on-write</td><td>Shared prefix blocks (beam search, prefix caching)</td></tr>
<tr><td>Page replacement</td><td>Block eviction under memory pressure</td></tr>
</table>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From the paper: "PagedAttention allows attention keys and values to be stored in non-contiguous paged memory... inspired by operating systems' virtual memory and paging techniques." Published at SOSP (the premier OS conference), this framing was deliberate — the contribution is applying OS memory management to GPU inference, not inventing a new attention mechanism.</p>
</div>

<h2>How It Works</h2>
<h3>1. Block-Level Allocation</h3>
<p>The KV cache is divided into fixed-size blocks, each holding B tokens worth of K and V vectors (typically B=16). Blocks can live anywhere in GPU memory — they need not be contiguous.</p>

<h3>2. Block Table Indirection</h3>
<p>Each request maintains a block table: a mapping from logical block index to physical block address in GPU memory. When the attention kernel needs KV for token position <em>t</em>, it computes <code>logical_block = t / B</code>, looks up the physical address from the block table, and fetches from that address.</p>

<h3>3. Lazy (On-Demand) Allocation</h3>
<p>Physical blocks are allocated only when a request fills its current block and needs the next one. This eliminates the over-reservation waste of pre-allocating max_seq_len memory upfront.</p>

<h3>4. Copy-on-Write Sharing</h3>
<p>When multiple requests share a prefix (e.g., identical system prompt), their block tables point to the same physical blocks. Only when their outputs diverge are new blocks allocated. Reference counts track sharing, and blocks are freed when the last reference is released.</p>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>The elegance of PagedAttention is that the indirection complexity is confined to a single, well-bounded layer. The block table lookup happens during K/V fetch in the attention kernel. Once QK scores are computed and stored in a logical-position-indexed array, the softmax and value accumulation proceed identically to non-paged attention — completely oblivious to physical block locations. This containment is why PagedAttention adds minimal overhead.</p>
</div>

<h2>The CUDA Kernel</h2>
<p>vLLM implements custom CUDA kernels (<code>csrc/attention/attention_kernels.cu</code>) that compute multi-head attention over paged KV blocks. Key design decisions:</p>

<ul>
<li>Each GPU thread block processes one (sequence, head) pair</li>
<li>Threads within a warp collaborate to fetch K/V from the block table</li>
<li>K tokens within a block are laid out for coalesced memory access</li>
<li>V tokens are transposed (columns = tokens) for efficient dot-product accumulation</li>
<li>Shared memory stores intermediate QK logits</li>
</ul>

<pre>// Simplified PagedAttention kernel logic (pseudocode)
// Full implementation: vllm/csrc/attention/attention_kernels.cu

__global__ void paged_attention_kernel(
    float* __restrict__ out,          // [num_seqs, num_heads, head_size]
    const float* __restrict__ q,      // query vectors
    const float* __restrict__ k_cache, // [num_blocks, block_size, num_kv_heads, head_size]
    const float* __restrict__ v_cache, // [num_blocks, block_size, num_kv_heads, head_size]
    const int* __restrict__ block_tables, // [num_seqs, max_num_blocks]
    const int* __restrict__ seq_lens,
    const float scale)
{
    const int seq_idx = blockIdx.x;
    const int head_idx = blockIdx.y;
    const int num_tokens = seq_lens[seq_idx];

    float qk_max = -INFINITY;
    // Phase 1: compute QK scores across all paged blocks
    for (int block_idx = 0; block_idx &lt; num_tokens / BLOCK_SIZE; block_idx++) {
        int physical_block = block_tables[seq_idx * max_blocks + block_idx];
        // ↑ THIS is the paging indirection: logical → physical
        float* k_block = k_cache + physical_block * block_stride;
        // dot product Q·K for tokens in this block...
    }
    // Phase 2: softmax + weighted sum of V (same paging indirection)
}</pre>

<h3>PagedAttention v2</h3>
<p>For long sequences where KV blocks outnumber a single thread block's capacity, v2 partitions blocks across multiple thread blocks. Each computes partial QK scores and local softmax statistics. A lightweight reduction kernel combines the partials. This eliminates the serial bottleneck at long context lengths.</p>

<h2>Impact</h2>
<p>Memory waste drops from 60–80% to under 4% (only the last partially-filled block per sequence). This directly translates to batch size: at the same GPU memory budget, PagedAttention enables 2–4× more concurrent requests, which translates to 2–4× higher throughput. By 2026, PagedAttention is standard infrastructure in vLLM, SGLang, TensorRT-LLM, and NVIDIA NIM.</p>
`,
      concepts: [
        { name: "PagedAttention", role: "Memory Management Algorithm", summary: "OS-inspired paged memory management for KV cache — fixed-size blocks, block tables, lazy allocation, and copy-on-write sharing reduce memory waste from 60-80% to under 4%." },
        { name: "BlockTable", role: "Data Structure", summary: "Per-request mapping from logical KV block indices to physical GPU memory addresses — the 'page table' of PagedAttention." },
        { name: "KVCache", role: "Core Data Structure", summary: "The stored Key and Value tensors from all previous tokens across all attention layers — the dominant memory consumer during LLM inference." },
        { name: "CopyOnWrite", role: "Memory Optimization", summary: "Sharing physical KV blocks across requests until divergence — borrowed from OS process forking to enable efficient beam search and prefix caching." },
        { name: "BlockManager", role: "System Component", summary: "The KV cache memory allocator in vLLM — owns the physical block pool, tracks reference counts, handles allocation/deallocation/sharing." }
      ],
      contributions: [
        { target: "kv-cache", text: "PagedAttention eliminates KV cache memory waste through virtual-memory-style paging." },
        { target: "inference-landscape", text: "PagedAttention addresses the memory management bottleneck identified in the inference problem analysis." }
      ],
      related: ["kv-cache", "vllm", "sglang", "batching-scheduling"]
    },

    "flash-attention": {
      title: "FlashAttention",
      subtitle: "IO-aware exact attention: tile the computation, fuse into one kernel, never materialize the N×N attention matrix in HBM — achieving 2-4x wallclock speedup with linear memory.",
      domain: "Foundations",
      type: "article",
      meta: [
        { text: "Primary papers: Dao et al. 'FlashAttention' (2022), Dao 'FlashAttention-2' (2023), Shah et al. 'FlashAttention-3' (2024)", dot: "#2563eb" },
        { text: "Concepts: 3 entities" },
        { text: "Cross-references: 3 pages" }
      ],
      body: `
<h2>The Memory Wall Problem in Attention</h2>
<p>Standard attention computes Q·K<sup>T</sup> (an N×N matrix), applies softmax, then multiplies by V. For sequence length N=8192, the intermediate attention matrix has 67 million entries per head — writing and reading this from GPU HBM (high bandwidth memory) dominates the runtime, not the actual arithmetic.</p>

<p>FlashAttention's insight: the bottleneck is <em>memory IO</em>, not compute. GPUs have vastly more compute throughput (e.g., 989 TFLOPS on H100) than memory bandwidth (3.35 TB/s). The goal is to restructure attention so that data stays in fast on-chip SRAM (~20 MB) and avoids round-trips to slow HBM (~80 GB).</p>

<h2>The Algorithm</h2>
<h3>Two Key Techniques</h3>
<ol>
<li><strong>Tiling + Online Softmax</strong>: Divide Q, K, V into blocks that fit in SRAM. Process attention block-by-block, computing partial softmax incrementally using the "online softmax" trick (track running max and sum). Never form the full N×N matrix.</li>
<li><strong>Recomputation</strong>: Don't store the attention matrix in the forward pass. In the backward pass, recompute it from Q, K, V blocks (cheap — it stays in SRAM). This trades FLOPs for memory, but since the bottleneck was memory IO, it's a net win.</li>
</ol>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From the FlashAttention paper (Dao et al., 2022): "Even with the increased FLOPs due to recomputation, our algorithm both runs faster (up to 7.6x on GPT-2) and uses less memory — linear in sequence length — than standard attention, thanks to the massively reduced amount of HBM access."</p>
</div>

<h3>IO Complexity</h3>
<p>FlashAttention requires O(N²d²M⁻¹) HBM accesses where d is head dimension and M is SRAM size. Standard attention requires Ω(Nd + N²). For typical values (d=128, M=~100KB), FlashAttention makes up to 9x fewer HBM accesses. The paper proves this is asymptotically optimal — no exact attention algorithm can do better.</p>

<pre># Using FlashAttention in practice (PyTorch 2.0+)
import torch
from torch.nn.functional import scaled_dot_product_attention

# PyTorch now dispatches to FlashAttention automatically
# when inputs are on CUDA and contiguous
q = torch.randn(batch, heads, seq_len, head_dim, device="cuda", dtype=torch.float16)
k = torch.randn(batch, heads, seq_len, head_dim, device="cuda", dtype=torch.float16)
v = torch.randn(batch, heads, seq_len, head_dim, device="cuda", dtype=torch.float16)

# This automatically uses FlashAttention when available
out = scaled_dot_product_attention(q, k, v, is_causal=True)

# Or use the flash_attn library directly for more control:
from flash_attn import flash_attn_func
out = flash_attn_func(q, k, v, causal=True)  # same result, explicit FlashAttention</pre>

<h2>Evolution</h2>
<table>
<tr><th>Version</th><th>Key Improvement</th><th>Performance</th></tr>
<tr><td>FlashAttention (2022)</td><td>Tiling + online softmax + recomputation</td><td>~124 TFLOPS (A100)</td></tr>
<tr><td>FlashAttention-2 (2023)</td><td>Parallelize over sequence length, better work partitioning</td><td>~350 TFLOPS (A100)</td></tr>
<tr><td>FlashAttention-3 (2024)</td><td>Hopper-specific: WGMMA + TMA + ping-pong scheduling + FP8</td><td>~740 TFLOPS (H100)</td></tr>
</table>

<h3>FlashAttention-3 on Hopper</h3>
<p>FlashAttention-3 exploits H100-specific hardware features:</p>
<ul>
<li><strong>WGMMA</strong> (Warpgroup Matrix-Multiply-Accumulate): Uses 4 warps (128 threads) as a unit for peak Tensor Core throughput</li>
<li><strong>TMA</strong> (Tensor Memory Accelerator): Hardware-accelerated data movement from HBM to SRAM, freeing registers</li>
<li><strong>Ping-pong scheduling</strong>: Two warpgroups alternate — one does GEMM (Q·K<sup>T</sup>) while the other does softmax, overlapping compute and non-Tensor-Core work</li>
<li><strong>FP8 with incoherent processing</strong>: Block-quantize to FP8 for ~2x TFLOPS; use random orthogonal matrices to spread outliers and preserve accuracy</li>
</ul>

<div class="analysis">
<div class="an-label">Analysis</div>
<p><strong>FlashAttention vs PagedAttention</strong>: These solve different problems and are complementary. FlashAttention optimizes <em>how attention is computed</em> (IO-aware tiling within a single attention operation). PagedAttention optimizes <em>how KV cache memory is managed</em> (non-contiguous blocks across requests). Production systems use both simultaneously: vLLM uses FlashAttention as an attention backend while managing KV cache via PagedAttention's block manager. FlashAttention makes each attention call fast; PagedAttention makes memory efficient across requests.</p>
</div>
`,
      concepts: [
        { name: "FlashAttention", role: "Attention Algorithm", summary: "IO-aware exact attention that tiles computation into SRAM-sized blocks, fuses all ops into one kernel, and never materializes the N×N attention matrix — achieving 2-4x speedup with linear memory." },
        { name: "IOAwareness", role: "Design Principle", summary: "Designing algorithms with explicit knowledge of the memory hierarchy — optimizing for data movement (IO) rather than just arithmetic operations (FLOPs)." },
        { name: "Tiling", role: "Computation Technique", summary: "Dividing large matrix operations into SRAM-sized blocks to maximize data reuse in fast cache — the core mechanism enabling FlashAttention's IO efficiency." }
      ],
      contributions: [
        { target: "kv-cache", text: "FlashAttention reduces HBM access for attention computation through IO-aware tiling." },
        { target: "vllm", text: "vLLM uses FlashAttention/FlashInfer as its attention kernel backend." },
        { target: "sglang", text: "SGLang uses FlashInfer (based on FlashAttention principles) for paged attention kernels." }
      ],
      related: ["paged-attention", "kv-cache", "tensorrt-llm"]
    },

    vllm: {
      title: "vLLM",
      subtitle: "The production-default inference engine: PagedAttention-based memory management, continuous batching, and a modular execution stack that defined the LLM serving category.",
      domain: "Serving Frameworks",
      type: "article",
      meta: [
        { text: "Primary source: vLLM project (github.com/vllm-project/vllm), v0.22+", dot: "#2563eb" },
        { text: "Reference: 'What is vLLM? The open-source inference server that ate the inference stack' (2026)", dot: "#10b981" },
        { text: "Concepts: 5 entities" },
        { text: "Cross-references: 5 pages" }
      ],
      body: `
<h2>What vLLM Is</h2>
<p>vLLM is an open-source, high-throughput LLM inference and serving engine built around PagedAttention. Released by UC Berkeley in June 2023, it has become the de facto standard for production open-weight model deployments by 2026 — the inference engine that enterprises self-host and cloud providers use under the hood.</p>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From insightfulaiworld.com (2026): "Two years later, vLLM is the inference server that runs most non-trivial open-weight LLM deployments. It is what enterprises self-host. It is what cloud providers use under the hood. It is, in 2026, the default answer to 'we want to serve an open-weight model in production.'"</p>
</div>

<h2>Architecture: Three Core Components</h2>

<h3>1. Scheduler</h3>
<p>The scheduler decides, every iteration, which requests run next and which wait. It operates at token granularity via continuous batching — new requests enter the running batch as soon as the current iteration completes, without waiting for the entire batch to finish.</p>
<ul>
<li><strong>Priority queuing</strong>: requests ordered by priority, with configurable policies</li>
<li><strong>Preemption</strong>: high-priority arrivals can pause lower-priority requests and evict their KV blocks to free GPU memory</li>
<li><strong>Admission control</strong>: enforces <code>--max-num-seqs</code> and <code>--max-model-len</code> to prevent OOM</li>
</ul>

<h3>2. Block Manager</h3>
<p>The KV cache memory allocator. It owns the pool of fixed-size physical blocks, hands them out to requests on demand, tracks reference counts for shared blocks (prefix caching, beam search), and reclaims blocks when requests complete. This is the direct implementation of the PagedAttention memory model.</p>

<h3>3. Model Executor</h3>
<p>Executes the actual model forward pass. vLLM ships optimized CUDA kernels for the attention path that work with the paged KV layout. For the rest of the model (MLPs, normalization, embeddings), it uses PyTorch with custom optimizations.</p>
<ul>
<li><strong>Attention backends</strong>: FlashAttention, FlashInfer, TRTLLM-GEN, FlashMLA, Triton</li>
<li><strong>GEMM/MoE kernels</strong>: CUTLASS, TRTLLM-GEN, CuTeDSL</li>
<li><strong>Compilation</strong>: torch.compile for automatic kernel generation and graph transformations</li>
<li><strong>Graph capture</strong>: Piecewise and full CUDA/HIP graphs for reduced kernel launch overhead</li>
</ul>

<h2>Key Features (2026)</h2>
<table>
<tr><th>Category</th><th>Features</th></tr>
<tr><td>Memory</td><td>PagedAttention, prefix caching, chunked prefill</td></tr>
<tr><td>Decoding</td><td>Speculative decoding (n-gram, suffix, EAGLE, DFlash), structured output (xgrammar/guidance)</td></tr>
<tr><td>Parallelism</td><td>Tensor, pipeline, data, expert, context parallelism</td></tr>
<tr><td>Quantization</td><td>FP8, MXFP8/MXFP4, NVFP4, INT8, INT4, GPTQ/AWQ, GGUF, compressed-tensors, TorchAO</td></tr>
<tr><td>Serving</td><td>Disaggregated prefill/decode, continuous batching, streaming output</td></tr>
<tr><td>API</td><td>OpenAI-compatible HTTP, Anthropic Messages API, gRPC</td></tr>
<tr><td>Hardware</td><td>NVIDIA (H100/A100/B300), AMD (MI300/MI355), Google TPU, Intel CPU</td></tr>
</table>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>vLLM's strategic advantage is breadth: broadest model support, broadest hardware support, broadest feature set. It is not always the fastest on any single benchmark, but it is the safest default because it rarely fails to work with a given model/hardware/quantization combination. This is the "Linux of LLM serving" — not necessarily the best at anything, but good enough at everything.</p>
</div>

<h2>Production Deployment</h2>
<pre>vllm serve meta-llama/Llama-3.1-70B-Instruct \\
  --tensor-parallel-size 4 \\
  --max-model-len 8192 \\
  --port 8000</pre>
<p>Cold start: ~62 seconds. Horizontal scaling: deploy multiple replicas behind a load balancer with session affinity. Kubernetes: use HPA on custom queue-depth metrics.</p>
`,
      concepts: [
        { name: "vLLM", role: "Serving Framework", summary: "The production-default open-source LLM inference engine — PagedAttention memory management, continuous batching, broadest model/hardware support." },
        { name: "PagedAttention", role: "Memory Management Algorithm", summary: "OS-inspired paged memory management for KV cache — fixed-size blocks, block tables, lazy allocation, and copy-on-write sharing reduce memory waste from 60-80% to under 4%." },
        { name: "BlockManager", role: "System Component", summary: "The KV cache memory allocator in vLLM — owns the physical block pool, tracks reference counts, handles allocation/deallocation/sharing." },
        { name: "ContinuousBatching", role: "Scheduling Strategy", summary: "Dynamically insert and remove requests from the GPU batch at each iteration — eliminating idle time from static batching and improving throughput 3-10x." },
        { name: "Scheduler", role: "System Component", summary: "The component deciding which requests run in each iteration — implements continuous batching, priority, preemption, and admission control." }
      ],
      contributions: [
        { target: "paged-attention", text: "vLLM was built around PagedAttention as its core innovation." }
      ],
      related: ["paged-attention", "sglang", "benchmarks", "batching-scheduling", "disaggregated-serving"]
    },

    sglang: {
      title: "SGLang",
      subtitle: "Structured Generation Language: a Python-embedded frontend with RadixAttention-based runtime that excels at multi-turn, RAG, and agentic workloads through automatic KV cache reuse.",
      domain: "Serving Frameworks",
      type: "article",
      meta: [
        { text: "Primary source: Zheng et al., 'SGLang: Efficient Execution of Structured Language Model Programs', arXiv:2312.07104", dot: "#2563eb" },
        { text: "Reference: sgl-project/sglang GitHub (v0.5.12, 2026)", dot: "#10b981" },
        { text: "Concepts: 5 entities" },
        { text: "Cross-references: 4 pages" }
      ],
      body: `
<h2>What SGLang Is</h2>
<p>SGLang (Structured Generation Language) is a serving framework for LLMs and multimodal models developed by UC Berkeley and LMSYS. It combines a Python-embedded frontend for programming complex generation workflows with a highly optimized backend runtime. The key differentiator is <em>RadixAttention</em> — a radix-tree-based KV cache management system that automatically discovers and reuses shared computation across requests.</p>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From the SGLang paper: "We introduce SGLang, a framework for efficient programming and executing structured language model programs. SGLang significantly improves the throughput and latency of complex LM programs through novel optimizations like RadixAttention, compressed finite state machines, and a language interpreter."</p>
</div>

<h2>Architecture</h2>

<h3>Frontend: Programming Primitives</h3>
<p>SGLang embeds a domain-specific language in Python with primitives for:</p>
<ul>
<li><code>gen</code>: generate text with optional constraints</li>
<li><code>select</code>: choose from a set of options</li>
<li><code>fork</code> / <code>join</code>: parallel prompt execution</li>
<li>Full Python control flow (loops, conditionals, function composition)</li>
</ul>
<p>This enables expressing complex multi-step workflows — RAG pipelines, chain-of-thought, tree-of-thought, agentic tool use — as programs rather than single API calls.</p>

<h3>Backend Runtime (3 Components)</h3>
<ol>
<li><strong>Frontend API Server</strong>: OpenAI-compatible endpoints — existing code works unmodified</li>
<li><strong>Tokenizer Server</strong>: Runs as a separate process to avoid blocking GPU execution</li>
<li><strong>Backend Scheduler</strong>: Manages the radix tree, decides batching, orchestrates GPU execution</li>
</ol>

<h2>Core Innovation: RadixAttention</h2>
<pre># SGLang frontend: programming complex generation workflows
import sglang as sgl

@sgl.function
def multi_turn_chat(s, system_prompt, questions):
    s += sgl.system(system_prompt)    # shared across all turns
    for q in questions:
        s += sgl.user(q)
        s += sgl.assistant(sgl.gen("answer", max_tokens=256))

# Under the hood: the system_prompt KV cache is computed ONCE
# and reused across all subsequent turns via RadixAttention.
# Without RadixAttention: each turn re-computes the system prompt.

# Structured output with compressed FSM:
@sgl.function
def extract_json(s, text):
    s += "Extract structured data:\n" + text
    s += sgl.gen("result", regex=r'\{"name": "[^"]+", "age": \d+\}')
    # FSM compresses deterministic token sequences ('"name": "')
    # into single steps → fewer forward passes for structured output</pre>

<p>RadixAttention stores KV cache in a <em>radix tree</em> — a compressed trie where each node represents a sequence of tokens and its associated KV cache pages. This enables:</p>

<ul>
<li><strong>Automatic prefix detection</strong>: When a new request arrives, the runtime traverses the tree to find the longest matching prefix. No manual configuration — sharing is discovered automatically.</li>
<li><strong>Cache-aware scheduling</strong>: Requests with longer shared prefixes are prioritized (Longest Prefix Match policy), approximating a depth-first traversal that maximizes cache reuse.</li>
<li><strong>Dynamic memory allocation</strong>: Unlike PagedAttention's fixed-size blocks, RadixAttention allocates memory proportional to actual prefix lengths.</li>
</ul>

<div class="analysis">
<div class="an-label">Analysis</div>
<p><strong>RadixAttention vs PagedAttention</strong>: These are complementary concepts at different levels. PagedAttention solves the low-level memory allocation problem (non-contiguous blocks, lazy allocation, reference counting). RadixAttention solves the higher-level cache reuse problem (discovering which prefixes are shared, scheduling to maximize reuse). SGLang actually uses paged memory internally — RadixAttention is the tree index that makes prefix lookup efficient. The real innovation is the combination: a radix tree over paged blocks, with cache-aware scheduling that changes request ordering to amplify reuse.</p>
</div>

<h2>Compressed FSM Decoding</h2>
<p>For structured output (JSON, XML), SGLang analyzes the constraint grammar as a finite-state machine. It then compresses chains of deterministic transitions — runs where only one valid next token exists — into single edges. During decoding, when the FSM enters such a compressed chain, multiple tokens are emitted in a single forward pass rather than one at a time.</p>

<p>This yields both speed (fewer forward passes) and compliance (provably valid output structure).</p>

<h2>Scheduling Policies</h2>
<table>
<tr><th>Policy</th><th>Strategy</th><th>Best For</th></tr>
<tr><td>FCFS</td><td>First Come First Served</td><td>Fairness, diverse prompts</td></tr>
<tr><td>LPM</td><td>Longest Prefix Match first</td><td>Maximizing cache reuse</td></tr>
<tr><td>DFS-weight</td><td>Depth-first with weighting</td><td>Balanced cache + fairness</td></tr>
</table>

<h2>Performance</h2>
<p>On H100 with shared-prefix workloads (the scenario RadixAttention is designed for):</p>
<ul>
<li>29% higher throughput than vLLM (16,215 vs 12,553 tok/s)</li>
<li>2x+ higher output token throughput (893 vs 413 tok/s)</li>
<li>TTFT: 79ms vs vLLM's 103ms</li>
<li>Stable under high concurrency: 30–31 tok/s constant vs vLLM's degradation from 22 to 16 tok/s</li>
</ul>
<p>On unique prompts (no prefix sharing), SGLang and vLLM perform comparably.</p>

<h2>Production Status (2026)</h2>
<p>Deployed on 400,000+ GPUs worldwide (xAI, NVIDIA, AMD, LinkedIn). Cold start: ~58 seconds. Hardware: NVIDIA GB200/B300/H100/A100, AMD MI355/MI300, Intel Xeon, Google TPU, Ascend NPU.</p>
`,
      concepts: [
        { name: "SGLang", role: "Serving Framework", summary: "Structured Generation Language — Python-embedded frontend + RadixAttention runtime that excels at multi-turn, RAG, and agentic workloads via automatic KV cache reuse." },
        { name: "RadixAttention", role: "Cache Management Algorithm", summary: "SGLang's radix-tree-based KV cache index that automatically discovers shared prefixes across requests and reuses their cached computation." },
        { name: "CompressedFSM", role: "Structured Generation", summary: "SGLang's optimization for constrained decoding: collapse deterministic FSM transition chains into single edges, emitting multiple tokens per forward pass." },
        { name: "PrefixCaching", role: "Optimization Technique", summary: "Store and reuse KV cache for shared prompt prefixes across requests — skipping expensive prefill for repeated system prompts or RAG documents." },
        { name: "CacheAwareScheduling", role: "Scheduling Strategy", summary: "Reorder request execution to maximize KV cache reuse — SGLang's LPM policy prioritizes requests with longer shared prefixes in the radix tree." }
      ],
      contributions: [
        { target: "paged-attention", text: "SGLang's RadixAttention extends the paged approach with automatic prefix discovery via radix tree." }
      ],
      related: ["vllm", "paged-attention", "benchmarks", "batching-scheduling"]
    },

    "tensorrt-llm": {
      title: "TensorRT-LLM",
      subtitle: "NVIDIA's compiler-first inference engine: compile models into optimized CUDA engines with graph-level kernel fusion, delivering maximum throughput at the cost of build-time complexity.",
      domain: "Serving Frameworks",
      type: "article",
      meta: [
        { text: "Primary source: NVIDIA TensorRT-LLM documentation and blog (2026)", dot: "#76b900" },
        { text: "Concepts: 3 entities" },
        { text: "Cross-references: 3 pages" }
      ],
      body: `
<h2>What TensorRT-LLM Is</h2>
<p>TensorRT-LLM is NVIDIA's open-source library for compiling and optimizing LLMs for inference on NVIDIA GPUs. Unlike vLLM and SGLang (which interpret models at runtime via PyTorch), TensorRT-LLM uses an <em>ahead-of-time compilation</em> approach: you define your model graph, the TensorRT compiler fuses operations, selects optimal kernels per GPU, and emits a compiled CUDA engine.</p>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From NVIDIA's blog: "The TensorRT compiler can sweep through the graph to choose the best kernel for each operation and available GPU. Crucially, it can also identify patterns in the graph where multiple operations are good candidates for being fused into a single kernel. This reduces the required amount of memory movement and the overhead of launching multiple GPU kernels."</p>
</div>

<h2>The Compilation Model</h2>
<h3>Build Phase (~28 minutes)</h3>
<ol>
<li><strong>Graph construction</strong>: Model layers expressed as TensorRT primitives (Python API)</li>
<li><strong>Kernel selection</strong>: Compiler profiles each operation and selects the fastest kernel for the target GPU</li>
<li><strong>Kernel fusion</strong>: Identifies fusible operation sequences — LayerNorm + MatMul + Bias + Activation → single kernel</li>
<li><strong>Plugin injection</strong>: Complex fusions (FlashAttention) that can't be auto-discovered are injected as hand-optimized plugins</li>
<li><strong>CUDA Graph compilation</strong>: Entire fused graph compiled into a single CUDA Graph for minimal launch overhead</li>
</ol>

<pre>trtllm-build --checkpoint_dir /path/to/model \\
  --output_dir /path/to/engine \\
  --max_batch_size 64 \\
  --gpt_attention_plugin bfloat16 \\
  --gemm_plugin bfloat16</pre>

<h3>Runtime Phase</h3>
<p>The compiled engine loads in ~90 seconds (vs 28-minute build). Subsequent starts reuse the cached engine. The C++ runtime executes the compiled graph with in-flight batching and paged KV caching.</p>

<div class="analysis">
<div class="an-label">Analysis</div>
<p><strong>Compile vs Interpret trade-off</strong>: This mirrors the classic compiler design question. vLLM/SGLang are "interpreters" — flexible, fast iteration, broad compatibility, but leave performance on the table. TensorRT-LLM is a "compiler" — slower setup, less flexible, but extracts maximum hardware-specific performance. At 100 concurrent requests on H100, TensorRT-LLM achieves ~16% higher throughput than vLLM (2,780 vs 2,400 tok/s). Whether this justifies the 28-minute build depends on how frequently you change models.</p>
</div>

<h2>Key Optimizations</h2>
<table>
<tr><th>Optimization</th><th>What It Does</th></tr>
<tr><td>Kernel fusion</td><td>Merge multiple ops into single kernels — reduces memory traffic and launch overhead</td></tr>
<tr><td>CUDA Graph capture</td><td>Entire forward pass as one CUDA Graph — near-zero kernel launch latency</td></tr>
<tr><td>FlashAttention plugin</td><td>Hand-optimized fused attention kernel injected at compile time</td></tr>
<tr><td>FP8 quantization</td><td>Native Hopper/Blackwell FP8 support with calibration</td></tr>
<tr><td>In-flight batching</td><td>Continuous batching at the iteration level (same as vLLM's approach)</td></tr>
<tr><td>Paged KV caching</td><td>PagedAttention for efficient KV cache management</td></tr>
<tr><td>Weight streaming</td><td>Offload model weights to CPU and stream to GPU on demand</td></tr>
</table>

<h2>Triton Inference Server Integration</h2>
<p>TensorRT-LLM integrates with NVIDIA Triton Inference Server via a dedicated backend, providing model management, health checks, metrics, and ensemble pipelines. This is the production deployment path: Triton handles HTTP/gRPC routing while TensorRT-LLM handles model execution.</p>

<h2>When to Choose TensorRT-LLM</h2>
<ul>
<li>Fixed model deployment (don't rotate models frequently)</li>
<li>NVIDIA-only hardware (no AMD/TPU support)</li>
<li>Maximum throughput is the primary goal</li>
<li>Engineering team can absorb the build/debug complexity</li>
<li>Already using NVIDIA Triton infrastructure</li>
</ul>
`,
      concepts: [
        { name: "TensorRTLLM", role: "Serving Framework", summary: "NVIDIA's compiler-first inference engine: ahead-of-time graph compilation with kernel fusion, CUDA Graph capture, and plugin injection for maximum NVIDIA GPU throughput." },
        { name: "KernelFusion", role: "Compiler Optimization", summary: "Merging multiple GPU operations into a single kernel — eliminating intermediate memory writes, reducing launch overhead, and improving memory locality." },
        { name: "CUDAGraph", role: "Runtime Optimization", summary: "Capture an entire sequence of GPU kernel launches into a single graph object — replaying it with near-zero launch overhead, critical for latency-sensitive decode steps." }
      ],
      contributions: [
        { target: "flash-attention", text: "TensorRT-LLM integrates FlashAttention kernels and fuses them with surrounding ops." }
      ],
      related: ["vllm", "benchmarks", "flash-attention"]
    },

    "ollama-llamacpp": {
      title: "Ollama & llama.cpp",
      subtitle: "The local inference stack: llama.cpp provides C++ execution with aggressive quantization, Ollama wraps it with model management and a REST API for developer-friendly local deployment.",
      domain: "Serving Frameworks",
      type: "article",
      meta: [
        { text: "Primary source: llama.cpp (github.com/ggml-org/llama.cpp)", dot: "#2563eb" },
        { text: "Reference: Ollama (ollama.com), GGUF specification", dot: "#10b981" },
        { text: "Concepts: 4 entities" },
        { text: "Cross-references: 2 pages" }
      ],
      body: `
<h2>The Local Inference Stack</h2>
<p>While vLLM and SGLang target production GPU clusters, Ollama and llama.cpp serve a different need: running LLMs on developer workstations, laptops, and edge devices. The relationship is layered:</p>

<ul>
<li><strong>GGML</strong>: low-level tensor computation library (matrix operations, quantized compute kernels)</li>
<li><strong>llama.cpp</strong>: LLM inference engine built on GGML (model loading, KV cache, attention, sampling)</li>
<li><strong>Ollama</strong>: user-friendly wrapper (model registry, lifecycle management, REST API, automatic hardware detection)</li>
</ul>

<p>The core insight: raw token generation speed is identical between Ollama and llama.cpp (same engine). Ollama adds convenience; llama.cpp adds control.</p>

<h2>llama.cpp Architecture</h2>
<h3>Hardware Abstraction</h3>
<p>One codebase, four backends: CPU (AVX2/AVX512), NVIDIA (CUDA), AMD (ROCm/HIP), Apple Silicon (Metal). The same GGUF model files work across all backends — quantized weights are hardware-agnostic.</p>

<h3>Server Architecture</h3>
<p>When serving via HTTP (<code>llama-server</code>), llama.cpp uses a slot-based architecture:</p>
<table>
<tr><th>Component</th><th>Role</th></tr>
<tr><td><code>server_context</code></td><td>Holds llama_context + all active slots (single-threaded event loop)</td></tr>
<tr><td><code>server_slot</code></td><td>One inference sequence — manages a single parallel request</td></tr>
<tr><td><code>server_queue</code></td><td>Thread-safe queue: HTTP workers submit tasks</td></tr>
<tr><td><code>server_response</code></td><td>Thread-safe queue: results returned to HTTP workers</td></tr>
<tr><td><code>server_prompt_checkpoint</code></td><td>KV cache snapshots for prefix reuse (recurrent/SWA models)</td></tr>
</table>

<h3>Router Mode (2026)</h3>
<p>Multiple llama.cpp inference instances behind a single API endpoint. Requests are routed to the appropriate backend based on the requested model — enabling multi-model serving from a single entry point.</p>

<h2>GGUF & Quantization</h2>
<p>GGUF (GGML Unified Format) is the standardized model weight format. It stores quantized weights, model metadata, tokenizer vocabulary, and architecture parameters in a single file.</p>

<table>
<tr><th>Scheme</th><th>Bits/weight</th><th>Size vs FP16</th><th>Quality</th><th>Recommendation</th></tr>
<tr><td>Q4_0</td><td>4-bit</td><td>~4x smaller</td><td>Good</td><td>Budget / constrained memory</td></tr>
<tr><td>Q4_K_M</td><td>4-bit (mixed)</td><td>~4x smaller</td><td>Better</td><td><strong>Default recommendation</strong></td></tr>
<tr><td>Q5_K_M</td><td>5-bit (mixed)</td><td>~3.2x smaller</td><td>Very good</td><td>Quality-focused</td></tr>
<tr><td>Q8_0</td><td>8-bit</td><td>~2x smaller</td><td>Near-lossless</td><td>When VRAM allows</td></tr>
</table>

<p>The "K_M" variants use mixed precision — more important layers (attention) get higher precision while less sensitive layers (MLP) use lower precision. This achieves better quality than uniform quantization at the same average bit-width.</p>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From the llama.cpp README and commit history: the project has grown from a single-file C implementation (March 2023) to a production-grade multi-backend engine. As of 2026, it supports over 80 model architectures, including Llama 3/4, Qwen 2.5, DeepSeek V3/R1, and Gemma 2. GGML achieves near-cuBLAS performance for quantized matmul on NVIDIA GPUs while maintaining cross-platform portability.</p>
</div>

<h2>CPU+GPU Hybrid Inference</h2>
<p>llama.cpp's <code>--n-gpu-layers</code> flag controls how many Transformer layers run on GPU vs CPU. This enables running models larger than GPU VRAM by offloading overflow layers to system RAM — slower but functional. A 70B model that requires 2× H100 in FP16 can run on a single consumer GPU in Q4 with partial CPU offloading.</p>

<h3>Practical Configuration</h3>
<pre># Ollama: automatic GPU detection, no config needed
ollama run llama3:70b-instruct-q4_K_M

# llama.cpp: fine-grained control
./llama-server \
  --model ./llama-3-70b-Q4_K_M.gguf \
  --n-gpu-layers 45    # 45/80 layers on GPU, rest on CPU
  --ctx-size 8192      # context window
  --parallel 4         # 4 concurrent slots
  --flash-attn         # enable Flash Attention (CUDA/Metal)
  --cont-batching      # continuous batching for concurrent reqs
  --port 8080

# Memory estimation for GPU layer offloading:
# 70B Q4_K_M total: ~38GB
# Per layer: ~38GB / 80 layers = ~475MB
# RTX 4090 (24GB): fits ~48 layers → set --n-gpu-layers 48
# Remaining 32 layers: ~15GB in system RAM</pre>

<h2>Performance (Consumer Hardware, 2026)</h2>
<table>
<tr><th>Model</th><th>Hardware</th><th>Quantization</th><th>Speed</th></tr>
<tr><td>8B</td><td>RTX 4090</td><td>Q4_K_M</td><td>~95 tok/s</td></tr>
<tr><td>32B</td><td>RTX 4090</td><td>Q4_K_M</td><td>~34 tok/s</td></tr>
<tr><td>70B</td><td>RTX 4090 + CPU offload</td><td>Q4_K_M</td><td>~8-12 tok/s</td></tr>
</table>

<div class="analysis">
<div class="an-label">Analysis</div>
<p><strong>Ollama vs vLLM/SGLang</strong>: fundamentally different targets. Ollama processes requests sequentially (one at a time) — fine for a single developer. vLLM/SGLang batch hundreds of concurrent requests — required for production serving. Choosing between them is not a performance question but a use-case question: "Am I the only user?" → Ollama. "Am I serving many users?" → vLLM/SGLang.</p>
</div>
`,
      concepts: [
        { name: "Ollama", role: "Local Inference Tool", summary: "User-friendly wrapper around llama.cpp that provides model registry, lifecycle management, REST API, and automatic hardware detection for local LLM deployment." },
        { name: "LlamaCpp", role: "Inference Engine", summary: "C/C++ LLM inference engine supporting CPU/GPU hybrid execution, aggressive quantization (1.5-8 bit), and the GGUF model format — the foundation under Ollama." },
        { name: "GGUF", role: "Model Format", summary: "GGML Unified Format — the standard file format for quantized LLM weights, storing model parameters, metadata, tokenizer, and architecture in a single portable file." },
        { name: "Quantization", role: "Model Optimization", summary: "Reducing model weight precision from FP16/FP32 to lower bit-widths (INT4/INT8/FP8) — trading minimal quality loss for 2-4x memory reduction and faster inference." }
      ],
      contributions: [
        { target: "inference-landscape", text: "Ollama/llama.cpp serves the local inference niche with different trade-offs than production systems." }
      ],
      related: ["benchmarks", "inference-landscape"]
    },

    "batching-scheduling": {
      title: "Batching & Scheduling",
      subtitle: "From static batching to continuous batching with chunked prefill: how modern serving systems keep GPUs saturated by dynamically composing work at the token level.",
      domain: "Optimization Techniques",
      type: "article",
      meta: [
        { text: "Key paper: Yu et al., 'Orca: A Distributed Serving System for Transformer-Based Generative Models', OSDI 2022", dot: "#2563eb" },
        { text: "Concepts: 3 entities" },
        { text: "Cross-references: 3 pages" }
      ],
      body: `
<h2>Static vs Dynamic Batching</h2>
<p>The simplest batching strategy groups incoming requests into fixed-size batches and waits for the entire batch to complete before starting the next one. The problem: requests finish at different times (different output lengths), so the GPU idles while waiting for the slowest request in the batch.</p>

<pre>Static batching (naive):
┌────────────────────────────────────────────┐
│ Req A: ████████████░░░░░░░░░░░  (done at t=12, waits)
│ Req B: ████████████████████████  (done at t=24)
│ Req C: ████████░░░░░░░░░░░░░░░  (done at t=8, waits)
└────────────────────────────────────────────┘
  GPU idle time: 64% (A and C wait for B)

Continuous batching:
┌────────────────────────────────────────────┐
│ Req A: ████████████ → freed, Req D fills slot
│ Req B: ████████████████████████
│ Req C: ████████ → freed, Req E fills slot
│ Req D:             ████████████████
│ Req E:         ████████████████████
└────────────────────────────────────────────┘
  GPU idle time: &lt;5% (slots immediately reused)</pre>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>Yu et al. (ORCA, OSDI 2022): "We propose iteration-level scheduling... where the scheduler can make scheduling decisions after each iteration (i.e., each forward pass)." This insight — that scheduling granularity should match the decode loop, not the request lifecycle — enables the GPU to stay saturated regardless of output length variance.</p>
</div>

<h2>Continuous Batching (Orca)</h2>
<p>Introduced by Orca (OSDI 2022), continuous batching operates at the <em>iteration</em> level rather than the request level. After each forward pass:</p>
<ol>
<li>Completed requests are removed from the batch immediately</li>
<li>New requests from the queue are inserted into the freed slots</li>
<li>The next forward pass runs with the updated batch</li>
</ol>
<p>Result: the GPU never idles waiting for slow requests. Throughput improvement: 3–10× over static batching.</p>

<h3>vLLM Scheduler Configuration</h3>
<pre># vLLM continuous batching parameters
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3-70B \
  --max-num-seqs 256           # max concurrent sequences in batch
  --max-num-batched-tokens 8192 # token budget per iteration
  --max-model-len 8192         # max context length per request
  --scheduling-policy fcfs     # options: fcfs, priority

# Key insight: --max-num-seqs controls max batch size
# At 256 concurrent seqs, each decode iteration processes
# 256 tokens (one per active sequence) in a single forward pass</pre>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>Continuous batching is now table stakes — every production serving framework implements it (vLLM, SGLang, TensorRT-LLM, even llama.cpp's server mode). The innovation shifted to <em>what to batch</em>: prefill tokens vs decode tokens, and whether to interleave them. The scheduler's token budget (<code>--max-num-batched-tokens</code>) is the critical tuning knob: too low wastes GPU compute; too high causes memory pressure and OOM kills.</p>
</div>

<h2>Chunked Prefill</h2>
<p>A long input prompt (thousands of tokens) produces a prefill compute burst that blocks decode steps for all other requests in the batch. Chunked prefill breaks the input into smaller chunks and interleaves prefill chunks with decode steps:</p>

<pre>Without chunked prefill (8K prompt arrives):
┌──────────────────────────────────────────────┐
│ Iter 1-8: [8K prefill monopolizes GPU]        │ ← all decodes STALLED
│ Iter 9+:  [prefill done, decodes resume]      │
└──────────────────────────────────────────────┘
  ITL spike: 8 × iter_time for all in-flight requests

With chunked prefill (chunk_size=512):
┌──────────────────────────────────────────────┐
│ Iter 1: [512 prefill tokens] + [64 decodes]   │
│ Iter 2: [512 prefill tokens] + [64 decodes]   │
│ ...16 iterations to complete 8K prefill...     │
│ Iter 17: [new request decoding] + [64 decodes] │
└──────────────────────────────────────────────┘
  ITL: stable (decodes never stalled)</pre>

<p>This prevents long prefills from causing latency spikes for other users, at the cost of slightly higher TTFT for the new request (16 iters × iter_time vs 8 iters × iter_time).</p>

<h3>SGLang's Approach: Mixed Token Budget</h3>
<pre># SGLang uses a unified token budget approach:
# Each iteration allocates tokens to a mix of prefill + decode
# Budget = max_running_requests × decode_tokens + prefill_chunk

# Example: budget=8192, running_requests=128
# Decode: 128 tokens (one per request)
# Remaining for prefill: 8192 - 128 = 8064 tokens
# → can prefill up to 8064 tokens of new requests per iteration</pre>

<h2>Scheduling Strategies</h2>
<table>
<tr><th>Strategy</th><th>How it works</th><th>Best for</th><th>Framework</th></tr>
<tr><td><strong>FCFS</strong></td><td>Process requests in arrival order</td><td>General fairness</td><td>vLLM default</td></tr>
<tr><td><strong>Shortest Job First</strong></td><td>Prioritize requests with shorter expected output</td><td>Lower avg latency</td><td>Custom</td></tr>
<tr><td><strong>Longest Prefix Match</strong></td><td>Prioritize requests sharing cached prefixes</td><td>Multi-turn chat, RAG</td><td>SGLang</td></tr>
<tr><td><strong>Preemptive priority</strong></td><td>Higher-priority requests can evict lower-priority KV</td><td>SLA compliance</td><td>vLLM</td></tr>
<tr><td><strong>DFS-weight</strong></td><td>Depth-first with weighting for tree-structured generation</td><td>Beam search, parallel sampling</td><td>SGLang</td></tr>
</table>

<h2>Preemption & Memory Pressure</h2>
<p>When GPU memory is exhausted (all KV cache blocks allocated), the scheduler must choose: reject new requests, or evict existing ones. vLLM's preemption mechanism:</p>
<ol>
<li>Sort running requests by priority (or arrival time if equal priority)</li>
<li>Select the lowest-priority request for eviction</li>
<li>Swap its KV cache blocks to CPU memory (if swap space available) or recompute later</li>
<li>Free GPU blocks for the higher-priority request</li>
<li>When the evicted request can resume, swap blocks back from CPU</li>
</ol>

<pre># vLLM preemption config
--preemption-mode swap   # options: swap (to CPU), recompute (redo prefill)
--swap-space 16          # GB of CPU memory for swapped KV cache
# swap is faster for short evictions; recompute is better for long evictions</pre>
`,
      concepts: [
        { name: "ContinuousBatching", role: "Scheduling Strategy", summary: "Dynamically insert and remove requests from the GPU batch at each iteration — eliminating idle time from static batching and improving throughput 3-10x." },
        { name: "ChunkedPrefill", role: "Optimization Technique", summary: "Split long prefill into smaller chunks interleaved with decode steps — preventing long prompts from stalling generation for other requests." },
        { name: "Scheduler", role: "System Component", summary: "The component deciding which requests run in each iteration — implements continuous batching, priority, preemption, and admission control." }
      ],
      contributions: [
        { target: "inference-landscape", text: "Continuous batching solves GPU underutilization during the memory-bound decode phase." },
        { target: "vllm", text: "vLLM implements continuous batching with iteration-level scheduling." },
        { target: "sglang", text: "SGLang implements continuous batching with cache-aware scheduling." }
      ],
      related: ["vllm", "sglang", "inference-landscape"]
    },

    "speculative-decoding": {
      title: "Speculative Decoding",
      subtitle: "Use a small fast model to draft tokens, then verify in parallel with the large model — trading cheap compute for fewer expensive serial steps.",
      domain: "Optimization Techniques",
      type: "article",
      meta: [
        { text: "Key papers: Leviathan et al. 2023, Chen et al. 2023", dot: "#2563eb" },
        { text: "Concepts: 2 entities" },
        { text: "Cross-references: 2 pages" }
      ],
      body: `
<h2>The Problem: Serial Decode</h2>
<p>Autoregressive decoding is inherently serial — each token depends on all previous tokens. The GPU is memory-bound during decode (reading model weights and KV cache), so most compute units sit idle. The bottleneck is not computation but memory bandwidth.</p>

<pre>Standard decode (1 token per forward pass):
┌────────────────────────────────────────────────────┐
│ Step 1: read 140GB weights + KV → generate token 1  │  ~30ms
│ Step 2: read 140GB weights + KV → generate token 2  │  ~30ms
│ Step 3: read 140GB weights + KV → generate token 3  │  ~30ms
│ ...                                                  │
│ Step N: read 140GB weights + KV → generate token N  │  ~30ms
└────────────────────────────────────────────────────┘
Total: N × 30ms, GPU compute utilization: ~5%

Speculative decode (K=4 candidates verified per pass):
┌────────────────────────────────────────────────────┐
│ Draft: generate 4 tokens (8B model)                 │  ~8ms
│ Verify: one forward pass over 4 tokens (70B model)  │  ~35ms
│ Accept: ~3 tokens on average (α≈0.75)               │
└────────────────────────────────────────────────────┘
Total: N/3 × 43ms, effective 2.1× speedup</pre>

<h2>The Insight: Verify Is Cheaper Than Generate</h2>
<p>Verifying whether a sequence of tokens is correct (a single forward pass over multiple tokens) is the same computation as prefill — it's compute-bound and efficient. Only generating tokens one at a time is memory-bound and slow. This asymmetry is the core exploitation:</p>

<table>
<tr><th>Operation</th><th>Tokens/pass</th><th>Bottleneck</th><th>GPU utilization</th></tr>
<tr><td>Decode (generate)</td><td>1</td><td>Memory bandwidth</td><td>~5%</td></tr>
<tr><td>Verify (prefill-like)</td><td>K (e.g., 4)</td><td>Compute</td><td>~60%</td></tr>
</table>

<h2>The Mechanism</h2>
<ol>
<li>A small, fast <em>draft model</em> generates K candidate tokens autoregressively (cheap — small model is fast)</li>
<li>The large <em>target model</em> verifies all K candidates in a single forward pass (efficient — same as prefill)</li>
<li>Accepted tokens (matching target model's distribution) are kept; the sequence is truncated at the first rejection</li>
<li>On average, if the draft model accepts α fraction of tokens, you generate 1/(1-α) tokens per target-model forward pass</li>
</ol>

<h3>Mathematical Guarantee: Lossless</h3>
<p>The acceptance/rejection sampling scheme guarantees that the output distribution is <em>exactly</em> the same as the target model generating alone. If the draft proposes token <em>x</em> at position <em>t</em>:</p>
<pre>Accept with probability: min(1, p_target(x) / p_draft(x))
If rejected: sample from adjusted distribution:
  p_adjusted(x) = max(0, p_target(x) - p_draft(x)) / Z</pre>
<p>This means speculative decoding cannot degrade output quality — only speed is affected.</p>

<h3>vLLM Configuration</h3>
<pre># Draft model speculative decoding
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3-70B-Instruct",
    speculative_model="meta-llama/Llama-3-8B-Instruct",
    num_speculative_tokens=5,     # K=5 candidates per round
    speculative_disable_mqa_scorer=False,
    use_v2_block_manager=True,
)

# N-gram speculation (no draft model needed)
llm = LLM(
    model="meta-llama/Llama-3-70B-Instruct",
    speculative_model="[ngram]",
    num_speculative_tokens=4,
    ngram_prompt_lookup_max=4,    # match up to 4 tokens from context
)

# EAGLE speculation
llm = LLM(
    model="meta-llama/Llama-3-70B-Instruct",
    speculative_model="yuhuili/EAGLE-LLaMA3-Instruct-70B",
    num_speculative_tokens=5,
)</pre>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From Leviathan et al. (ICML 2023): "We present speculative decoding — an algorithm to sample from autoregressive models faster without any changes to the outputs... For a T5-XXL model with 11B parameters, speculative decoding achieves a 2-3× latency improvement." NVIDIA reports up to 3.6× on H100 with well-matched draft models, and 1,000 tok/s per user on Blackwell with Llama 4 Maverick.</p>
</div>

<h2>Variants</h2>
<table>
<tr><th>Variant</th><th>Draft Source</th><th>Acceptance Rate</th><th>Extra Memory</th><th>Best For</th></tr>
<tr><td><strong>Draft model</strong></td><td>Smaller model from same family</td><td>70-85%</td><td>~16GB (8B model)</td><td>General use</td></tr>
<tr><td><strong>N-gram</strong></td><td>Pattern matching on prior context</td><td>30-60%</td><td>0</td><td>Repetitive output (code, lists)</td></tr>
<tr><td><strong>Self-speculative</strong></td><td>Early exit from target model</td><td>50-70%</td><td>0</td><td>Memory-constrained</td></tr>
<tr><td><strong>EAGLE</strong></td><td>Learned draft head on target model</td><td>75-90%</td><td>~1GB</td><td>Best speed/memory ratio</td></tr>
<tr><td><strong>Medusa</strong></td><td>Multiple parallel prediction heads</td><td>60-80%</td><td>~2GB</td><td>Tree-structured generation</td></tr>
</table>

<h3>When NOT to Use Speculative Decoding</h3>
<ul>
<li><strong>Creative/diverse tasks</strong> — low acceptance rate (draft can't predict creative text)</li>
<li><strong>Short outputs</strong> — overhead of draft doesn't amortize</li>
<li><strong>Memory-constrained</strong> — draft model consumes GPU memory that could serve more requests</li>
<li><strong>High batch sizes</strong> — verification forward pass becomes compute-bottlenecked, negating the speedup</li>
</ul>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>Speculative decoding is mathematically lossless — the output distribution is identical to the target model's. The draft model's quality only affects <em>speed</em> (acceptance rate), never <em>accuracy</em>. This is a free lunch in the rare sense: you trade draft-model compute (cheap) for fewer target-model serial steps (expensive). The main engineering challenge is achieving high acceptance rates (>70%) which requires a well-matched draft model. At batch size 1, speculative decoding is nearly always beneficial. At high batch sizes (>32), the verification pass saturates compute and the benefit diminishes — this is why it's primarily a <em>latency</em> optimization, not a throughput optimization.</p>
</div>
`,
      concepts: [
        { name: "SpeculativeDecoding", role: "Optimization Technique", summary: "Draft tokens with a small fast model, verify in parallel with the large model — trading cheap compute for fewer expensive serial steps while maintaining identical output distribution." },
        { name: "DraftModel", role: "Speculative Decoding Component", summary: "The small, fast model in speculative decoding that proposes candidate tokens for the large target model to verify — its acceptance rate determines speedup." }
      ],
      contributions: [
        { target: "inference-landscape", text: "Speculative decoding addresses the sequential decode bottleneck by parallelizing verification." }
      ],
      related: ["inference-landscape", "vllm"]
    },

    "disaggregated-serving": {
      title: "Disaggregated Serving",
      subtitle: "Physically separate prefill (compute-bound) and decode (memory-bound) onto distinct hardware pools — enabling independent scaling and eliminating phase interference.",
      domain: "Optimization Techniques",
      type: "article",
      meta: [
        { text: "Reference: Meta's disaggregated prefill-decode architecture with vLLM (2026)", dot: "#2563eb" },
        { text: "Concepts: 2 entities" },
        { text: "Cross-references: 3 pages" }
      ],
      body: `
<h2>The Interference Problem</h2>
<p>When prefill and decode share the same GPU, they compete for resources. A long prefill (processing a large input prompt) stalls the decode steps for all other in-flight requests. This manifests as latency spikes — users who are mid-generation see their token stream pause while the GPU processes someone else's long prompt.</p>

<pre>Colocated serving — interference pattern:
┌─────────────────────────────────────────────────┐
│ Time →                                           │
│ GPU:  [decode][decode][██ PREFILL 32K ██][decode] │
│                       ↑                          │
│              All 128 active decodes STALLED      │
│              ITL spike: 800ms (normal: 30ms)     │
└─────────────────────────────────────────────────┘

Disaggregated serving — clean separation:
┌─────────────────────────────────────────────────┐
│ Prefill GPU: [██ PREFILL 32K ██][PREFILL 8K]     │
│              (batched for max compute util)       │
│                                                  │
│ Decode GPU:  [decode][decode][decode][decode]...  │
│              (stable 30ms ITL, never interrupted) │
│                     ↕ KV transfer via RDMA       │
└─────────────────────────────────────────────────┘</pre>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>Zhong et al. (DistServe, OSDI 2024): "We find that existing systems suffer from interference between prefill and decoding phases... DistServe disaggregates the two phases to different GPUs, achieving up to 4.48× improvement in serving more requests within the same latency SLO." Meta's internal design doc states: "Prefill operations never block decode. Decode never fragments prefill compute."</p>
</div>

<h2>The Architecture</h2>
<table>
<tr><th>Aspect</th><th>Prefill Worker</th><th>Decode Worker</th></tr>
<tr><td>Bottleneck</td><td>Compute-bound (FLOPS)</td><td>Memory-bandwidth-bound (GB/s)</td></tr>
<tr><td>Optimal batch size</td><td>Large (maximize compute utilization)</td><td>Small (minimize latency per step)</td></tr>
<tr><td>Optimal GPU</td><td>High compute (H100 SXM: 990 TFLOPS)</td><td>High memory BW (H100: 3.35 TB/s HBM3)</td></tr>
<tr><td>Scheduling</td><td>Batch similar-length prompts</td><td>Continuous batching</td></tr>
<tr><td>KV cache lifetime</td><td>Temporary — transfer after prefill</td><td>Persistent — held through generation</td></tr>
<tr><td>Scaling</td><td>Scale with incoming prompt load</td><td>Scale with concurrent generation count</td></tr>
</table>

<h2>The Flow</h2>
<ol>
<li>Request arrives at a router</li>
<li>Router sends to a prefill worker (processes input prompt, generates KV cache)</li>
<li>KV cache is transferred to a decode worker via high-speed interconnect (NVLink, InfiniBand, or RDMA)</li>
<li>Decode worker generates tokens autoregressively, streaming back to user</li>
</ol>

<h3>KV Cache Transfer Budget</h3>
<pre>KV cache size per request (Llama-3-70B, 80 layers, GQA 8 KV heads):
  per token: 2 × 80 × 8 × 128 × 2 bytes (FP16) = 327,680 bytes ≈ 320 KB
  at 2K context:  320 KB × 2048  ≈ 640 MB
  at 8K context:  320 KB × 8192  ≈ 2.5 GB
  at 32K context: 320 KB × 32768 ≈ 10 GB

Transfer latency at different interconnect speeds:
  PCIe 5.0 (64 GB/s):   2.5 GB → 39 ms  (unacceptable TTFT overhead)
  InfiniBand NDR (50 GB/s effective): 2.5 GB → 50 ms
  NVLink (900 GB/s):    2.5 GB → 2.8 ms  (acceptable)
  CXL 3.0 (256 GB/s):   2.5 GB → 10 ms   (emerging option)</pre>

<h3>vLLM Disaggregated Serving Setup</h3>
<pre># Start prefill worker (GPU 0-3, TP=4)
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3-70B \
  --tensor-parallel-size 4 \
  --gpu-memory-utilization 0.85 \
  --role prefill \
  --kv-transfer-config '{"target": "decode-workers:5557"}'

# Start decode worker (GPU 4-7, TP=4)
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3-70B \
  --tensor-parallel-size 4 \
  --gpu-memory-utilization 0.95 \
  --role decode \
  --kv-transfer-config '{"listen": "0.0.0.0:5557"}'</pre>

<h2>Trade-offs</h2>
<p>The critical engineering challenge is KV cache transfer latency. For a 70B model at 8K context, the KV cache is ~2.5 GB per request. Transferring this over the network adds latency to TTFT. High-speed interconnects mitigate this, but the overhead is non-zero.</p>

<h3>When Disaggregation Hurts</h3>
<ul>
<li><strong>Low scale</strong> — if prefill interference is rare (few concurrent requests), the transfer overhead dominates</li>
<li><strong>Long generation</strong> — KV transfer is amortized over output length; short outputs don't amortize</li>
<li><strong>Energy cost</strong> — the transfer itself consumes power; at low load, colocated is more efficient</li>
</ul>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>Patel et al. (arXiv:2601.08833, 2026) show a surprising result: disaggregated serving can increase overall energy consumption by 12–30% compared to colocated serving at moderate load. The benefit is most pronounced at high scale (&gt;1000 concurrent users) where prefill stalls cause cascading latency violations and SLO breaches. The decision boundary: if your P99 ITL exceeds SLO during traffic spikes due to prefill interference, disaggregation pays for itself. Below that, chunked prefill within colocated serving is the simpler, more energy-efficient solution.</p>
</div>

<h2>Status (2026)</h2>
<p>vLLM supports disaggregated prefill/decode natively (v0.6+). Meta is actively co-developing the feature with the vLLM team. SGLang's prefill-decode disaggregation is in active development. Most hyperscale deployments (&gt;10K QPS) at major cloud providers have adopted this pattern. The architecture is converging toward a three-tier model: router → prefill pool → decode pool, with independent autoscaling for each tier based on different metrics (prompt throughput vs. concurrent generations).</p>
`,
      concepts: [
        { name: "DisaggregatedServing", role: "Architecture Pattern", summary: "Physically separate prefill (compute-bound) and decode (memory-bound) onto distinct hardware pools, eliminating phase interference at the cost of KV cache transfer overhead." },
        { name: "PrefillDecodeAsymmetry", role: "Core Concept", summary: "The fundamental architectural tension: prefill is compute-bound (parallel, high arithmetic intensity) while decode is memory-bound (sequential, low arithmetic intensity)." }
      ],
      contributions: [
        { target: "inference-landscape", text: "Disaggregated serving resolves the prefill-decode interference by physical separation." },
        { target: "vllm", text: "vLLM supports disaggregated prefill/decode deployment." }
      ],
      related: ["inference-landscape", "vllm", "batching-scheduling"]
    },

    "moe-serving": {
      title: "MoE Serving",
      subtitle: "Mixture-of-Experts models activate only a fraction of parameters per token — but serving them demands expert parallelism, dynamic load balancing, and all-to-all communication patterns absent from dense models.",
      domain: "Optimization Techniques",
      type: "article",
      meta: [
        { text: "Sources: NVIDIA NVL72 Wide-EP blog, vLLM EP docs, DeepSeek EPLB (2026)", dot: "#2563eb" },
        { text: "Concepts: 3 entities" },
        { text: "Cross-references: 3 pages" }
      ],
      body: `
<h2>Why MoE Changes the Serving Problem</h2>
<p>In a dense Transformer, every token activates every parameter. In a Mixture-of-Experts model, a router network selects a subset of "expert" feed-forward blocks per token (typically 2 out of 64-256 experts). This means:</p>
<ul>
<li><strong>Total parameters</strong> are very large (DeepSeek-V3: 671B) but <strong>active parameters per token</strong> are small (~37B)</li>
<li><strong>Memory</strong> dominates over compute — you must store all experts even though most are idle per-token</li>
<li><strong>Communication patterns</strong> change fundamentally: tokens must be routed to the GPU holding their assigned expert</li>
</ul>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>The MoE serving challenge is fundamentally different from dense model serving. For dense models, tensor parallelism splits every operation across GPUs — the communication pattern is regular and predictable. For MoE models, each token goes to potentially different experts on different GPUs — the communication pattern is data-dependent and irregular. This requires a completely different parallelism strategy: Expert Parallelism (EP).</p>
</div>

<h2>Expert Parallelism (EP)</h2>
<p>Instead of replicating the entire model on each GPU (data parallelism) or splitting every layer across GPUs (tensor parallelism), EP assigns different experts to different GPUs:</p>

<pre>MoE Forward Pass with Expert Parallelism (4 GPUs, 16 experts):
┌─────────────────────────────────────────────────────────┐
│ Step 1: Router decides expert assignments per token      │
│   Token A → Expert 3 (GPU 0)                            │
│   Token B → Expert 7 (GPU 1)                            │
│   Token C → Expert 3 (GPU 0), Expert 12 (GPU 3)        │
│                                                          │
│ Step 2: All-to-All dispatch (tokens → expert GPUs)       │
│   GPU 0 ←──── A, C₁    GPU 1 ←──── B                   │
│   GPU 2 ←──── (none)    GPU 3 ←──── C₂                  │
│                                                          │
│ Step 3: Expert computation (each GPU processes locally)  │
│   GPU 0: Expert_3(A), Expert_3(C₁)                      │
│   GPU 1: Expert_7(B)                                    │
│   GPU 3: Expert_12(C₂)                                  │
│                                                          │
│ Step 4: All-to-All combine (results → original GPUs)    │
│   Results routed back, averaged for multi-expert tokens  │
└─────────────────────────────────────────────────────────┘</pre>

<ol>
<li>Each GPU holds a subset of experts (e.g., 4 experts per GPU with 64 experts across 16 GPUs)</li>
<li>During forward pass, each token's router decision determines which GPU(s) the token must be sent to</li>
<li>An <em>all-to-all</em> communication step routes tokens to their assigned expert GPUs</li>
<li>Experts compute, then results are routed back via another all-to-all</li>
</ol>

<p>Attention layers (non-expert) can still use tensor parallelism or be replicated.</p>

<pre># vLLM Expert Parallel deployment:
vllm serve deepseek-ai/DeepSeek-V3-0324 \\
  --tensor-parallel-size 1 \\
  --data-parallel-size 8 \\
  --enable-expert-parallel</pre>

<h2>The Load Balancing Problem</h2>
<p>In practice, token routing is highly skewed — "hot" experts receive disproportionately many tokens while "cold" experts sit idle. If hot experts cluster on the same GPU, that GPU becomes a bottleneck while others waste capacity.</p>

<h3>Expert Parallel Load Balancer (EPLB)</h3>
<p>EPLB dynamically redistributes expert assignments across GPUs:</p>
<ul>
<li><strong>Monitoring</strong>: Track token counts per expert over a sliding window (default: 1000 steps)</li>
<li><strong>Rebalancing</strong>: Periodically (every 3000 steps) reassign hot experts alongside cold experts across GPUs</li>
<li><strong>Redundant experts</strong>: Replicate the hottest experts onto multiple GPUs so they can serve tokens in parallel</li>
<li><strong>Async transfers</strong>: Weight updates between forward passes using non-blocking copies</li>
</ul>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>From NVIDIA's Wide-EP blog: "EPLB leverages a policy to redistribute hot experts alongside cold experts. This triggers a weight update process, addressed by using a containerized design that allows experts to flow in and out of container allocations without breaking the CUDA graph."</p>
</div>

<h2>Wide Expert Parallelism (NVL72)</h2>
<p>On NVIDIA's GB200 NVL72 rack (72 GPUs with 130 TB/s coherent NVLink), distributing experts across more GPUs reduces per-GPU weight loading and improves GroupGEMM efficiency. Wide-EP configurations achieve up to 1.8x higher per-GPU throughput compared to narrower EP setups, because the all-to-all communication cost is offset by the NVLink bandwidth within the rack.</p>

<h2>Hierarchical vs Global Load Balancing</h2>
<table>
<tr><th>Strategy</th><th>How It Works</th><th>Best For</th></tr>
<tr><td>Hierarchical</td><td>First balance expert groups across nodes, then balance within nodes</td><td>Multi-node with even expert group count</td></tr>
<tr><td>Global</td><td>Replicate and distribute experts globally without node-level structure</td><td>Uneven configurations or single-node</td></tr>
</table>
`,
      concepts: [
        { name: "ExpertParallelism", role: "Parallelism Strategy", summary: "Distribute MoE experts across GPUs — each GPU holds a subset of experts, with all-to-all communication routing tokens to their assigned expert." },
        { name: "EPLB", role: "Load Balancing System", summary: "Dynamic rebalancing of expert-to-GPU assignments based on runtime token routing statistics — replicating hot experts and redistributing to prevent GPU bottlenecks." },
        { name: "MoE", role: "Model Architecture", summary: "Sparse Transformer architecture that routes each token to a subset of expert FFN blocks — achieving large model capacity with much lower per-token compute cost." }
      ],
      contributions: [
        { target: "inference-landscape", text: "MoE serving introduces unique memory/communication challenges beyond standard dense model inference." }
      ],
      related: ["vllm", "inference-landscape", "disaggregated-serving"]
    },

    benchmarks: {
      title: "Benchmarks & Trade-offs",
      subtitle: "H100 performance data across vLLM, SGLang, TensorRT-LLM, and Ollama — plus a decision framework for choosing the right engine for your workload.",
      domain: "Comparison & Selection",
      type: "article",
      meta: [
        { text: "Sources: Spheron H100 benchmarks 2026, multiple comparison guides", dot: "#2563eb" },
        { text: "Concepts: 2 entities" },
        { text: "Cross-references: all framework pages" }
      ],
      body: `
<h2>H100 Benchmark Data (Unique Prompts, 2026)</h2>
<h3>Throughput (tokens/second)</h3>
<table>
<tr><th>Concurrency</th><th>vLLM</th><th>SGLang</th><th>TensorRT-LLM</th></tr>
<tr><td>1</td><td>120</td><td>125</td><td>130</td></tr>
<tr><td>10</td><td>650</td><td>680</td><td>710</td></tr>
<tr><td>50</td><td>1,850</td><td>1,920</td><td>2,100</td></tr>
<tr><td>100</td><td>2,400</td><td>2,460</td><td>2,780</td></tr>
</table>

<h3>TTFT Latency (milliseconds, p50)</h3>
<table>
<tr><th>Concurrency</th><th>vLLM</th><th>SGLang</th><th>TensorRT-LLM</th></tr>
<tr><td>1</td><td>45</td><td>42</td><td>38</td></tr>
<tr><td>10</td><td>120</td><td>112</td><td>105</td></tr>
<tr><td>50</td><td>380</td><td>360</td><td>340</td></tr>
<tr><td>100</td><td>740</td><td>710</td><td>680</td></tr>
</table>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>On unique prompts, the three frameworks perform within ~15% of each other. TensorRT-LLM leads on raw throughput (+16% over vLLM at 100 concurrent), but at the cost of a 28-minute compilation step vs ~60-second cold starts for vLLM/SGLang. The gap narrows at low concurrency and widens at high concurrency — TensorRT-LLM's graph-level optimizations pay off most under load.</p>
</div>

<div class="evidence">
<div class="ev-label">Source evidence</div>
<p>Benchmark data compiled from: (1) vLLM v0.7 documentation benchmarks (2026), (2) SGLang v0.4 release notes with RadixAttention ablation, (3) NVIDIA TensorRT-LLM MLPerf submissions. All numbers measured on single H100 SXM 80GB with Llama-3-70B, input 1024 tokens, output 128 tokens, FP8 quantization. Methodology: sustained load over 60 seconds, metrics averaged after 10s warm-up.</p>
</div>

<h2>Shared-Prefix Workloads</h2>
<p>When requests share context (chat, RAG, agentic), SGLang's RadixAttention advantage materializes:</p>
<ul>
<li>29% higher total throughput (16,215 vs 12,553 tok/s)</li>
<li>2x+ higher output throughput (893 vs 413 tok/s)</li>
<li>TTFT: 79ms vs 103ms</li>
<li>Stable concurrency: SGLang holds 30-31 tok/s vs vLLM's drop from 22→16 tok/s</li>
</ul>
<p>This advantage disappears for unique prompts — RadixAttention's tree has nothing to reuse.</p>

<h2>Decision Matrix</h2>
<table>
<tr><th>If you need...</th><th>Choose</th><th>Why</th></tr>
<tr><td>General production serving</td><td><strong>vLLM</strong></td><td>Broadest model/hardware support, safest default</td></tr>
<tr><td>Multi-turn chat / RAG / agents</td><td><strong>SGLang</strong></td><td>RadixAttention maximizes prefix reuse</td></tr>
<tr><td>Max throughput on NVIDIA</td><td><strong>TensorRT-LLM</strong></td><td>Graph-level optimizations, but hard setup</td></tr>
<tr><td>Local development</td><td><strong>Ollama</strong></td><td>One command, automatic hardware detection</td></tr>
<tr><td>Custom quantization / edge</td><td><strong>llama.cpp</strong></td><td>Fine-grained parameter control, CPU/GPU hybrid</td></tr>
<tr><td>Structured output (JSON)</td><td><strong>SGLang</strong></td><td>Compressed FSM decoding — native and fast</td></tr>
<tr><td>Multi-model serving</td><td><strong>vLLM or llama.cpp router</strong></td><td>Both support multiple models behind one endpoint</td></tr>
</table>

<div class="analysis">
<div class="an-label">Analysis</div>
<p>The most common mistake in engine selection is optimizing for raw throughput when the workload is actually latency-sensitive. A 50ms improvement in TTFT p95 matters more to user experience than a 200 tok/s improvement in aggregate throughput for interactive applications. Always benchmark on YOUR workload, with YOUR model, at YOUR target concurrency — published benchmarks are directional, not definitive.</p>
</div>

<h2>How to Benchmark: Reproducible Methodology</h2>
<pre># Using vLLM's built-in benchmark tool
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3-70B --dtype float16 &

# Run benchmark with controlled parameters
python benchmarks/benchmark_serving.py \
  --backend openai \
  --base-url http://localhost:8000 \
  --model meta-llama/Llama-3-70B \
  --dataset-name sharegpt \
  --num-prompts 1000 \
  --request-rate 10 \     # requests per second (controls concurrency)
  --percentile-metrics ttft,tpot,itl,e2el

# Key output metrics:
# - TTFT (p50, p95, p99): time to first token
# - TPOT (p50, p95, p99): time per output token
# - Request throughput: completed requests/second
# - Token throughput: total output tokens/second</pre>

<h2>Key Metrics Summary</h2>
<table>
<tr><th></th><th>vLLM</th><th>SGLang</th><th>TensorRT-LLM</th><th>Ollama</th></tr>
<tr><td>Cold start</td><td>~62s</td><td>~58s</td><td>~28min</td><td>Instant</td></tr>
<tr><td>Ease of use</td><td>Easy</td><td>Easy</td><td>Hard</td><td>Easiest</td></tr>
<tr><td>Model support</td><td>Broadest</td><td>Broad</td><td>Selective</td><td>Broad (GGUF)</td></tr>
<tr><td>Hardware</td><td>NVIDIA, AMD, TPU+</td><td>NVIDIA, AMD, TPU, NPU</td><td>NVIDIA only</td><td>CPU, any GPU</td></tr>
<tr><td>Concurrent requests</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Sequential</td></tr>
<tr><td>Best scenario</td><td>General</td><td>Shared prefix</td><td>Max perf</td><td>Local dev</td></tr>
</table>
`,
      concepts: [
        { name: "Throughput", role: "Performance Metric", summary: "Total tokens generated per second across all concurrent requests — the aggregate system efficiency metric, distinct from per-user latency." },
        { name: "TTFT", role: "Performance Metric", summary: "The latency from when a request is received to when the first output token is generated — determined by prefill phase duration." }
      ],
      contributions: [
        { target: "vllm", text: "Benchmark data compares vLLM throughput and latency against alternatives." },
        { target: "sglang", text: "Benchmark data compares SGLang throughput and latency against alternatives." },
        { target: "tensorrt-llm", text: "Benchmark data compares TensorRT-LLM peak performance against alternatives." }
      ],
      related: ["vllm", "sglang", "ollama-llamacpp", "inference-landscape"]
    }
  },

  concepts: {
    ttft: {
      name: "TTFT",
      role: "Performance Metric",
      summary: "The latency from when a request is received to when the first output token is generated — determined by prefill phase duration.",
      definition: "TTFT measures the delay a user experiences before seeing any output. It is dominated by the prefill phase: processing the entire input prompt through the model to generate the KV cache. For interactive applications (chat, streaming), TTFT is the most user-perceptible metric. Techniques that reduce TTFT include prefix caching (skip prefill for cached portions), chunked prefill (interleave prefill with decode), and disaggregated serving (dedicate optimized hardware to prefill).",
      examples: `<pre>TTFT — timeline from request to first token:

Request arrives                              First token
      │                                           │
      ▼                                           ▼
──────┬────────────────── PREFILL ─────────────────┬──▶ DECODE
      t₀                                              t₁
      │◀──────────── TTFT = t₁ - t₀ ────────────────▶│

      │ Prompt (2048 tok)                            │ "Hello"
      └─ Compute-bound: parallel attention ──────────┘
         ~120ms on H100 (70B)

// Benchmark TTFT measurement:
// 1. Record timestamp when request arrives
// 2. Record timestamp when first token is emitted
// TTFT = t_first_token - t_request_arrived

// Typical H100 values (2026):
// vLLM:        120ms (p50, 10 concurrent)
// SGLang:      112ms (p50, 10 concurrent)
// TensorRT-LLM: 105ms (p50, 10 concurrent)

// With prefix caching on shared prompts:
// SGLang: 79ms (p50) — 24% faster than uncached</pre>
<p>Track p50 AND p95 separately. At 100 concurrent requests, vLLM p95 TTFT is 1,450ms vs TensorRT-LLM's 1,280ms — the 170ms gap affects perceived responsiveness in interactive applications.</p>`,
      related: ["itl", "prefill", "prefixcaching", "continuousbatching"],
      usedIn: ["inference-landscape", "benchmarks", "vllm", "sglang"],
      sources: [
        { label: "Spheron H100 Benchmarks 2026", url: "https://www.spheron.network/blog/vllm-vs-tensorrt-llm-vs-sglang-benchmarks/" }
      ]
    },
    itl: {
      name: "ITL",
      role: "Performance Metric",
      summary: "The time between consecutive output tokens — determines perceived fluency of streaming output, bottlenecked by decode-phase memory bandwidth.",
      definition: "ITL measures the gap between successive output tokens during autoregressive generation. Unlike TTFT (which is a one-time cost), ITL is experienced continuously by the user throughout generation. It is bottlenecked by memory bandwidth during the decode phase — each step must read the entire model weights and KV cache. Typical H100 values: 6-7ms per token at moderate concurrency. ITL degrades under high batch sizes because more KV caches must be read per decode step.",
      examples: `<pre>ITL — inter-token latency during decode:

Token stream:  "The"    "cat"    "sat"    "on"    "the"
                 │        │        │        │        │
Time (ms):       0       7       14       21       28
                 │◀─ ITL ─▶│◀─ ITL ─▶│◀─ ITL ─▶│
                 ~6-7ms per gap (H100, batch=10)

Each decode step reads full weights + KV cache → memory-bound
  ┌─────────┐   ┌─────────┐   ┌─────────┐
  │ Decode  │──▶│ Decode  │──▶│ Decode  │──▶ ...
  │ 1 token │   │ 1 token │   │ 1 token │
  └─────────┘   └─────────┘   └─────────┘
     ~7ms           ~7ms           ~7ms

// H100 ITL values (2026):
// SGLang:  6.03ms (stable across concurrency)
// vLLM:    7.14ms (varies with concurrency)

// User perception:
// <10ms ITL = imperceptibly smooth streaming
// 10-30ms ITL = acceptable for most chat
// >50ms ITL = noticeable "stuttering"</pre>`,
      related: ["ttft", "decode", "kvcache"],
      usedIn: ["inference-landscape", "benchmarks"],
      sources: [
        { label: "SGLang vs vLLM Comparison 2026", url: "https://localaimaster.com/blog/sglang-vs-vllm-comparison" }
      ]
    },
    kvcache: {
      name: "KVCache",
      role: "Core Data Structure",
      summary: "The stored Key and Value tensors from all previous tokens across all attention layers — the dominant memory consumer during LLM inference.",
      definition: "During autoregressive generation, each attention layer computes Key (K) and Value (V) projection vectors for every token. These are cached so future tokens need not recompute attention over the entire context. The KV cache grows linearly with sequence length and consumes memory proportional to 2 × num_layers × num_kv_heads × head_dim × dtype_size per token. For a 70B model, this is approximately 2.56 MB per token across all layers. Managing this memory efficiently — via PagedAttention, prefix sharing, quantization, and eviction — is the central systems challenge of LLM serving.",
      examples: `<pre>KV Cache — per-token memory layout (70B, 80 layers):

Layer 0:  ┌──K──┬──V──┐  Layer 1:  ┌──K──┬──V──┐       Layer 79:
          │ tok │ tok │            │ tok │ tok │            ...
          └──┬──┴──┬──┘            └──┬──┴──┬──┘
             │     │                  │     │
             ▼     ▼                  ▼     ▼
          32 KB per token per layer (MHA) → 2.56 MB/token total

Sequence growth (2048 tokens):
  tok_0  tok_1  tok_2  ...  tok_2047
   │      │      │            │
   ▼      ▼      ▼            ▼
  ┌──────────────────────────────────┐
  │  KV cache grows linearly → 5.24 GB│
  └──────────────────────────────────┘

// Memory per token (70B, 80 layers, 64 heads, dim=128, FP16):
// Per layer: 2 × 64 × 128 × 2 = 32 KB
// All layers: 32 KB × 80 = 2.56 MB per token

// 2K context: 2.56 MB × 2048 = 5.24 GB per request
// 100 concurrent: 524 GB — far exceeds H100's 80 GB

// GQA reduction (Llama 3: 8 KV heads instead of 64):
// Per layer: 2 × 8 × 128 × 2 = 4 KB (8x reduction)
// All layers: 4 KB × 80 = 320 KB per token</pre>`,
      related: ["pagedattention", "prefill", "decode", "gqa", "mla"],
      usedIn: ["kv-cache", "paged-attention", "vllm", "sglang", "inference-landscape"],
      sources: [
        { label: "PagedAttention paper (Kwon et al., SOSP 2023)", url: "https://arxiv.org/abs/2309.06180" }
      ]
    },
    pagedattention: {
      name: "PagedAttention",
      role: "Memory Management Algorithm",
      summary: "OS-inspired paged memory management for KV cache — fixed-size blocks, block tables, lazy allocation, and copy-on-write sharing reduce memory waste from 60-80% to under 4%.",
      definition: "PagedAttention divides the KV cache into fixed-size blocks (typically 16 tokens), each containing the K and V vectors for those tokens across one attention layer. A block table maps each request's logical block indices to physical GPU memory addresses, analogous to an OS page table. Blocks are allocated lazily (on demand as tokens are generated), freed immediately upon request completion, and can be shared across requests via reference counting (enabling copy-on-write for beam search and prefix caching). Custom CUDA kernels compute attention by iterating over blocks via the block table, confining the indirection to the K/V fetch phase — softmax and value accumulation operate on logical positions, unaware of physical layout.",
      examples: `<pre>PagedAttention block-level memory layout:

Request A (seq_len=45, block_size=16):
  Block table: [logical 0 → phys 7] [logical 1 → phys 2] [logical 2 → phys 14]
                    ↓                     ↓                     ↓
GPU Memory:  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
Block IDs:   │  0  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │ ... │
             │free │free │A[1] │free │free │free │free │A[0] │     │
             └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
                              ↑                              ↑
                    16 tokens of K,V           16 tokens of K,V

// Non-contiguous! Blocks can be anywhere in GPU memory.
// Only 45/48 slots used — waste = 3 tokens (6%) vs 60-80% without paging.

// OS analogy:
// Virtual page       → Logical KV block (index in block table)
// Physical frame     → Physical GPU memory block (actual address)
// Page table         → Block table (per-request mapping)
// Demand paging      → Allocate block only when seq fills current one
// Copy-on-write      → Shared prefix blocks (ref_count > 1)</pre>`,
      related: ["blocktable", "blockmanager", "kvcache", "copyonwrite", "radixattention"],
      usedIn: ["paged-attention", "vllm", "kv-cache", "benchmarks"],
      sources: [
        { label: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180" },
        { label: "vLLM PagedAttention Design Doc", url: "https://docs.vllm.ai/en/v0.22.1/design/paged_attention/" }
      ]
    },
    blocktable: {
      name: "BlockTable",
      role: "Data Structure",
      summary: "Per-request mapping from logical KV block indices to physical GPU memory addresses — the 'page table' of PagedAttention.",
      definition: "Each active request maintains a block table: an array where entry i contains the physical memory address of the block holding KV cache for logical block i. When the attention kernel needs KV for token position t, it computes logical_block = t / block_size, fetches the physical address from block_table[logical_block], and reads K/V from that address. This indirection enables non-contiguous storage (blocks scattered across GPU memory), sharing (multiple block tables pointing to the same physical block), and lazy allocation (entries populated only as blocks are needed).",
      examples: `<pre>Block Table — logical to physical mapping:

Seq A (len=45, block_size=16):
  Logical:  [0] [1] [2]
             ↓   ↓   ↓
  Physical: [7] [2] [14]  (non-contiguous in GPU memory)

GPU HBM:  ┌───┬───┬───┬───┬───┬───┬───┬───┐
           │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │
           │   │   │A[1]│   │   │   │   │A[0]│
           └───┴───┴───┴───┴───┴───┴───┴───┘

Token 35 lookup:  logical_block = 35/16 = 2 → block_table[2] = 0x9100
                  offset = 35 % 16 = 3 → read K,V at phys + 3

// Request A block table (block_size=16):
//   logical[0] → physical addr 0x7F00  (tokens 0-15)
//   logical[1] → physical addr 0x3A00  (tokens 16-31)
//   logical[2] → physical addr 0x9100  (tokens 32-47)
//
// Attention kernel for token 35:
//   logical_block = 35 / 16 = 2
//   physical_addr = block_table[2] = 0x9100
//   offset_in_block = 35 % 16 = 3
//   → read K,V from physical_addr + offset_in_block</pre>`,
      related: ["pagedattention", "blockmanager", "kvcache"],
      usedIn: ["paged-attention", "vllm"],
      sources: [
        { label: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180" }
      ]
    },
    blockmanager: {
      name: "BlockManager",
      role: "System Component",
      summary: "The KV cache memory allocator in vLLM — owns the physical block pool, tracks reference counts, handles allocation/deallocation/sharing.",
      definition: "The Block Manager is vLLM's memory management subsystem, responsible for the lifecycle of all physical KV cache blocks. It pre-allocates a pool of fixed-size blocks at startup (consuming a configured fraction of GPU memory), hands blocks to requests on demand via the Scheduler's instructions, maintains reference counts to enable sharing (prefix caching, beam search), and reclaims blocks when requests complete or are preempted. The Block Manager enforces memory limits — when no free blocks remain, the Scheduler must preempt or reject requests.",
      examples: `<pre>Block Manager — physical block pool lifecycle:

Startup: pre-allocate pool from GPU memory
  ┌─────────────────────────────────────────────┐
  │  FREE POOL (~5,800 blocks on H100 80GB)     │
  │  [0][1][2][3]...[5799]  ref_count=0         │
  └─────────────────────────────────────────────┘
         │ allocate()          │ share()         │ free()
         ▼                     ▼                 ▼
  ┌──────────────┐      ┌──────────────┐   back to pool
  │ Request A    │      │ Request B    │   when ref=0
  │ blocks: 7,2  │◀────▶│ shares blk 7 │   (ref_count--)
  │ ref: 1,1     │      │ ref: 2       │
  └──────────────┘      └──────────────┘
         ▲
         └── Scheduler requests blocks; pool empty → preempt/reject

# vLLM Block Manager — pool sizing at startup
python -m vllm.entrypoints.openai.api_server \\
  --model meta-llama/Llama-3-70B \\
  --gpu-memory-utilization 0.9 \\
  --block-size 16

# H100 80GB, 70B FP16 with TP=2:
#   usable_kv_pool ≈ 72 GB × 0.9 − weights ≈ 15 GB/GPU
#   block_size=16, 80 layers → ~2.56 MB/block
#   num_blocks ≈ 15 GB / 2.56 MB ≈ 5,800 blocks

# Allocation lifecycle:
#   allocate(seq_id)  → pop free block, ref_count[id]=1
#   share(block_id)   → ref_count[id]++
#   free(seq_id)      → ref_count--, return to pool if 0</pre>
<p>When <code>num_free_blocks == 0</code>, the Scheduler must preempt (swap KV to CPU) or reject — Block Manager is the hard memory ceiling.</p>`,
      related: ["pagedattention", "blocktable", "scheduler", "vllm"],
      usedIn: ["paged-attention", "vllm"],
      sources: [
        { label: "vLLM Architecture", url: "https://github.com/vllm-project/vllm" }
      ]
    },
    copyonwrite: {
      name: "CopyOnWrite",
      role: "Memory Optimization",
      summary: "Sharing physical KV blocks across requests until divergence — borrowed from OS process forking to enable efficient beam search and prefix caching.",
      definition: "When multiple requests share a prefix (same system prompt, same RAG document, or beam search branches), their block tables point to the same physical blocks rather than duplicating data. The blocks are marked as shared (reference count > 1). Only when a request needs to write divergent KV data (generating different tokens after the shared prefix) is the shared block copied to a new physical block for that request — hence 'copy-on-write'. This directly parallels Unix fork() semantics where parent and child share memory pages until one writes.",
      examples: `<pre>Copy-on-Write in beam search (4 branches, 2K shared prefix):

Before divergence (all share):
  Block table:   [0][1][2]...[127]   (logical blocks)
                  ↓  ↓  ↓       ↓
  Physical mem:  [A][B][C]...[Z]     ref_count = 4 each
  Branch 0 ──────┘↗ ↗ ↗       ↗
  Branch 1 ──────┘↗ ↗       ↗
  Branch 2 ──────┘↗       ↗
  Branch 3 ──────┘       ↗     (all point to same physical blocks)

After Branch 2 diverges at token 2100:
  Branch 2: block_table[131] → Z' (NEW copy, ref_count=1)
  Others:   block_table[131] → Z  (ref_count drops 4→3)

  Memory saved (70B, 2048-token prefix, 4 beams):
    Without CoW: 4 × 5.24 GB = 20.96 GB (full duplication)
    With CoW:    ~5.5 GB (shared prefix + 4 small divergent tails)
    Savings:     74% less KV memory</pre>`,
      related: ["pagedattention", "blockmanager", "prefixcaching"],
      usedIn: ["paged-attention", "vllm"],
      sources: [
        { label: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180" }
      ]
    },
    radixattention: {
      name: "RadixAttention",
      role: "Cache Management Algorithm",
      summary: "SGLang's radix-tree-based KV cache index that automatically discovers shared prefixes across requests and reuses their cached computation.",
      definition: "RadixAttention organizes all cached KV state in a radix tree (compressed trie) where each node represents a sequence of tokens and its associated KV cache pages. When a new request arrives, the runtime traverses the tree to find the longest matching prefix, reusing those cached KV tensors and only computing attention for the novel suffix. Unlike vLLM's explicit prefix caching (which requires configuration), RadixAttention discovers sharing opportunities automatically. Combined with cache-aware scheduling (Longest Prefix Match policy), it prioritizes requests that maximize cache reuse, approximating a depth-first tree traversal.",
      examples: `<pre>RadixAttention tree structure (SGLang):

                          [root]
                            │
              ┌─────────────┴─────────────┐
              ▼                            ▼
  "You are a helpful..."        "Summarize this doc..."
   (system prompt, 32 tok)       (RAG prefix, 1024 tok)
   KV: blocks 0-1 (CACHED)      KV: blocks 50-113 (CACHED)
              │                            │
    ┌─────────┼──────────┐                 ▼
    ▼         ▼          ▼           "Key findings:"
 "What is  "Explain   "Compare       (new, 6 tok)
  MLIR?"   PagedAttn"  vLLM..."       compute only
 (12 tok)  (15 tok)   (18 tok)
 compute   compute    compute

Request: "You are a helpful... What is vLLM?"
 → Tree traversal finds 32-token prefix match
 → Skip prefill for 32 tokens (reuse cached KV)
 → Only compute 12 new tokens
 → Savings: 73% fewer prefill FLOPs

Impact (H100, multi-turn chat):
  SGLang (RadixAttention): 16,215 tok/s, TTFT 79ms
  vLLM (no prefix tree):   12,553 tok/s, TTFT 103ms (+29%)</pre>`,
      related: ["pagedattention", "prefixcaching", "cacheawarescheduling", "sglang"],
      usedIn: ["sglang", "benchmarks"],
      sources: [
        { label: "SGLang paper (Zheng et al.)", url: "https://arxiv.org/abs/2312.07104" }
      ]
    },
    continuousbatching: {
      name: "ContinuousBatching",
      role: "Scheduling Strategy",
      summary: "Dynamically insert and remove requests from the GPU batch at each iteration — eliminating idle time from static batching and improving throughput 3-10x.",
      definition: "Traditional static batching waits for an entire batch of requests to complete before processing the next batch. Continuous batching (introduced by Orca, OSDI 2022) operates at iteration granularity: after each forward pass, completed requests are ejected and new requests from the queue are admitted. This keeps the GPU saturated regardless of varying output lengths. Every production serving framework now implements continuous batching as table stakes.",
      examples: `<pre>Continuous Batching — iteration-level scheduling:

Time (iterations) →  1   2   3   4   5   6   7   8   9  10  11  12
                   ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
Slot 0:            │ A │ A │ A │ A │ A │ D │ D │ D │ D │ D │ D │ D │
Slot 1:            │ B │ B │ B │ B │ B │ B │ B │ B │ B │ E │ E │ E │
Slot 2:            │ C │ C │ C │ C │ C │ C │ C │ F │ F │ F │ F │ F │
                   └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                                    ↑       ↑           ↑
                              A done,   C done,     B done,
                              D enters  F enters    E enters

// Each slot processes one token per iteration.
// When a request finishes → slot immediately reused.
// GPU never idles waiting for the longest request.

// Result: ~2,400 tok/s on H100 (vs ~240 tok/s with static batching)</pre>
<p>vLLM enables this by default; no flag required — the Scheduler admits/ejects at each decode iteration.</p>`,
      related: ["scheduler", "chunkedprefill", "continuousbatching"],
      usedIn: ["batching-scheduling", "vllm", "sglang", "inference-landscape"],
      sources: [
        { label: "Orca (Yu et al., OSDI 2022)" }
      ]
    },
    prefill: {
      name: "Prefill",
      role: "Inference Phase",
      summary: "The compute-bound phase that processes the entire input prompt in parallel, generating the initial KV cache — its duration determines TTFT.",
      definition: "During prefill, all input tokens are processed simultaneously in a single forward pass. The model computes attention across all input positions, generating Key and Value vectors that are stored in the KV cache for the subsequent decode phase. Prefill is compute-bound because the parallel matrix operations saturate the GPU's arithmetic units. Its duration is proportional to input length and determines TTFT. Optimizations include prefix caching (skip prefill for cached portions), chunked prefill (split into smaller pieces to avoid blocking decode), and disaggregated serving (dedicate high-compute hardware to prefill).",
      examples: `<pre>Prefill — parallel processing of entire prompt:

Input prompt (2048 tokens, processed in ONE forward pass):
  tok_0  tok_1  tok_2  ...  tok_2047
   │      │      │            │
   └──────┴──────┴────────────┘
              │
              ▼
  ┌─────────────────────────────────┐
  │  Parallel attention (all-to-all)│  ← Compute-bound
  │  Generate K,V for every token   │
  └─────────────────────────────────┘
              │
              ▼
  ┌─────────────────────────────────┐
  │  KV Cache populated             │──▶ Ready for decode
  └─────────────────────────────────┘

TTFT ∝ prompt length:  512→~30ms  2048→~120ms  8192→~480ms

// Prefill: parallel attention over all prompt tokens
// Input: 2048 tokens → single forward pass
//
// Arithmetic intensity (70B, seq=2048):
//   FLOPs ≈ 2 × params × seq = 2 × 70B × 2048 ≈ 2.9×10¹⁴
//   Memory read ≈ 140 GB (weights) — compute-bound on H100
//
// TTFT scales ~linearly with prompt length:
//   512 tokens:  ~30ms
//   2048 tokens: ~120ms
//   8192 tokens: ~480ms (without prefix cache)

# vLLM chunked prefill to avoid blocking decode:
--enable-chunked-prefill --max-num-batched-tokens 8192</pre>`,
      related: ["decode", "ttft", "kvcache", "chunkedprefill", "disaggregatedserving"],
      usedIn: ["inference-landscape", "kv-cache", "disaggregated-serving"],
      sources: [
        { label: "Google Cloud Blog: Five LLM Inference Techniques", url: "https://cloud.google.com/blog/topics/developers-practitioners/five-techniques-to-reach-the-efficient-frontier-of-llm-inference" }
      ]
    },
    decode: {
      name: "Decode",
      role: "Inference Phase",
      summary: "The memory-bound autoregressive phase that generates tokens one at a time — each step reads the entire KV cache, determining ITL and throughput.",
      definition: "During decode, tokens are generated sequentially. Each step: (1) compute Q/K/V for the new token, (2) append K/V to the cache, (3) compute attention between the new Q and all cached K/V, (4) run through the rest of the model, (5) sample the next token. The operation is memory-bound because each step reads the full model weights (~140 GB for a 70B model) and all cached K/V, but performs relatively little compute per byte read. GPU compute units are underutilized. Speculative decoding addresses this by batching multiple speculative tokens into a single verification pass.",
      examples: `<pre>Decode — one token per iteration (memory-bound):

Iteration N:  new token "world"
  ┌─────────────┐     ┌──────────────────────────┐
  │ Compute Q   │────▶│ Attend to ALL cached K,V │
  │ for 1 token │     │ (2048 tokens × 80 layers)│
  └─────────────┘     └──────────────────────────┘
         │                        │
         ▼                        ▼
  ┌─────────────┐     Read ~140 GB weights + 5.24 GB KV
  │ Append K,V  │     (SMs ~20% busy, DRAM saturated)
  │ to cache    │
  └─────────────┘
         │
         ▼
     Sample next token → repeat

// Decode step (1 new token, seq_len=2048, 70B FP16):
//
// Per iteration reads:
//   Model weights:  ~140 GB (TP=2: 70 GB/GPU)
//   KV cache:       2.56 MB × 2048 = 5.24 GB
//   Compute:        ~2 × 70B FLOPs (tiny vs 75 GB read)
//
// Arithmetic intensity ≈ 1.9 FLOPs/byte → memory-bound
// H100: 3.35 TB/s bandwidth → ~6-7ms ITL at batch=10
//
// GPU utilization during decode: ~15-25% (SMs idle, DRAM busy)</pre>
<p>Speculative decoding amortizes this: verify 4 draft tokens in one forward pass ≈ 4× effective decode throughput.</p>`,
      related: ["prefill", "itl", "kvcache", "speculativedecoding"],
      usedIn: ["inference-landscape", "kv-cache", "disaggregated-serving"],
      sources: [
        { label: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180" }
      ]
    },
    vllm: {
      name: "vLLM",
      role: "Serving Framework",
      summary: "The production-default open-source LLM inference engine — PagedAttention memory management, continuous batching, broadest model/hardware support.",
      definition: "vLLM (released UC Berkeley, June 2023) is a high-throughput LLM serving engine that introduced PagedAttention for efficient KV cache management. Its architecture comprises a Scheduler (continuous batching, preemption), Block Manager (paged KV cache allocation), and Model Executor (optimized CUDA kernels, torch.compile). By 2026, it supports the broadest set of models, hardware platforms (NVIDIA, AMD, TPU), and features (speculative decoding, disaggregated serving, structured output, multi-parallelism). Cold start: ~62s. OpenAI-compatible API.",
      examples: `<pre>vLLM architecture — core components:

  ┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
  │   API Server │────▶│    Scheduler    │────▶│  Model Executor │
  │  (OpenAI)    │     │ Continuous batch│     │ CUDA kernels    │
  └──────────────┘     │ Preemption      │     │ torch.compile   │
                       └────────┬────────┘     └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Block Manager  │
                       │ PagedAttention  │
                       │ KV block pool   │
                       └─────────────────┘

from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3-70B",
    tensor_parallel_size=2,
    gpu_memory_utilization=0.9,
    enable_prefix_caching=True,
    speculative_model="meta-llama/Llama-3-8B",
    num_speculative_tokens=4,
)

params = SamplingParams(temperature=0.7, max_tokens=256)
outputs = llm.generate(["Explain PagedAttention"], params)

# OpenAI-compatible server:
# python -m vllm.entrypoints.openai.api_server --port 8000
# curl http://localhost:8000/v1/completions -d '{"model":"...","prompt":"Hi"}'</pre>
<p>H100 benchmarks (2026): ~2,400 tok/s throughput, 120ms p50 TTFT, cold start ~62s vs TensorRT-LLM ~90s runtime but ~28min compile.</p>`,
      related: ["pagedattention", "blockmanager", "sglang", "continuousbatching"],
      usedIn: ["vllm", "benchmarks", "paged-attention"],
      sources: [
        { label: "vLLM GitHub", url: "https://github.com/vllm-project/vllm" },
        { label: "Kwon et al., SOSP 2023", url: "https://arxiv.org/abs/2309.06180" }
      ]
    },
    sglang: {
      name: "SGLang",
      role: "Serving Framework",
      summary: "Structured Generation Language — Python-embedded frontend + RadixAttention runtime that excels at multi-turn, RAG, and agentic workloads via automatic KV cache reuse.",
      definition: "SGLang (UC Berkeley/LMSYS) combines a domain-specific frontend language (gen, select, fork, join primitives in Python) with an optimized backend runtime featuring RadixAttention (radix-tree KV cache index for automatic prefix sharing), compressed FSM decoding (fast structured output), and cache-aware scheduling. Deployed on 400K+ GPUs (xAI, NVIDIA, AMD, LinkedIn). 29% higher throughput than vLLM on shared-prefix workloads. Cold start: ~58s.",
      examples: `<pre>SGLang architecture — frontend + RadixAttention runtime:

  ┌─────────────────────────────────────────────────────┐
  │  Python Frontend (gen, select, fork, join)          │
  └────────────────────────┬────────────────────────────┘
                           │
  ┌────────────────────────▼────────────────────────────┐
  │  Runtime Backend                                     │
  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
  │  │RadixAttention│  │Compressed FSM│  │LPM Scheduler│ │
  │  │ (prefix tree)│  │ (JSON/XML)   │  │ (cache-aware)│ │
  │  └──────────────┘  └──────────────┘  └────────────┘ │
  └─────────────────────────────────────────────────────┘

import sglang as sgl

@sgl.function
def multi_turn(s, system_prompt, user_msg):
    s += system_prompt          # cached in RadixAttention tree
    s += user_msg
    s += sgl.gen("response", max_tokens=256)

# Launch runtime with RadixAttention (automatic):
# python -m sglang.launch_server \\
#   --model-path meta-llama/Llama-3-70B \\
#   --port 30000

# Structured output with compressed FSM:
@sgl.function
def gen_json(s, schema):
    s += sgl.gen("out", regex=schema)  # multi-token FSM chains</pre>
<p>Shared-prefix workloads: 16,215 tok/s vs vLLM 12,553 tok/s (+29%). p50 TTFT with cache: 79ms vs 112ms uncached.</p>`,
      related: ["radixattention", "compressedfsm", "vllm", "prefixcaching"],
      usedIn: ["sglang", "benchmarks"],
      sources: [
        { label: "SGLang paper", url: "https://arxiv.org/abs/2312.07104" },
        { label: "SGLang GitHub", url: "https://github.com/sgl-project/sglang" }
      ]
    },
    ollama: {
      name: "Ollama",
      role: "Local Inference Tool",
      summary: "User-friendly wrapper around llama.cpp that provides model registry, lifecycle management, REST API, and automatic hardware detection for local LLM deployment.",
      definition: "Ollama abstracts away the complexity of llama.cpp by providing a model registry (pull/run/list commands), automatic GGUF model management, REST API (compatible with OpenAI client libraries), and hardware auto-detection (CPU/GPU offloading). Token generation speed is identical to raw llama.cpp (same underlying engine). Sequential request processing — one request at a time. Target use case: developer workstations and prototyping, not production serving at scale.",
      examples: `<pre>Ollama — developer-friendly wrapper over llama.cpp:

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  ollama CLI  │────▶│ Model Registry│────▶│  llama.cpp   │
  │ pull/run/list│     │ GGUF auto-dl  │     │  (inference) │
  └──────────────┘     └──────────────┘     └──────────────┘
         │                                           │
         ▼                                           ▼
  ┌──────────────┐                          ┌──────────────┐
  │  REST API    │                          │ CPU/GPU auto │
  │  :11434      │                          │ detection    │
  └──────────────┘                          └──────────────┘
  Sequential: 1 request at a time (no continuous batching)

# Model lifecycle
ollama pull llama3:70b-instruct-q4_K_M   # downloads GGUF (~40 GB)
ollama run llama3:70b-instruct-q4_K_M

# REST API (OpenAI-compatible)
curl http://localhost:11434/api/generate -d '{
  "model": "llama3:70b-instruct-q4_K_M",
  "prompt": "Explain KV cache",
  "stream": true
}'

# Python client
from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
resp = client.chat.completions.create(model="llama3", messages=[...])</pre>
<p>Throughput: ~45 tok/s (M2 Max, 70B Q4) — sequential only. Same tok/s as raw llama.cpp; no continuous batching.</p>`,
      related: ["llamacpp", "gguf", "quantization"],
      usedIn: ["ollama-llamacpp", "benchmarks"],
      sources: [
        { label: "Ollama", url: "https://ollama.com" }
      ]
    },
    llamacpp: {
      name: "LlamaCpp",
      role: "Inference Engine",
      summary: "C/C++ LLM inference engine supporting CPU/GPU hybrid execution, aggressive quantization (1.5-8 bit), and the GGUF model format — the foundation under Ollama.",
      definition: "llama.cpp is a portable LLM inference implementation in C/C++ built on the GGML tensor library. It supports multiple hardware backends (CPU with AVX2/AVX512, NVIDIA CUDA, AMD ROCm/HIP, Apple Metal, Vulkan, SYCL, RISC-V) with the same GGUF model files. Key features: integer quantization from 1.5-bit to 8-bit, CPU+GPU hybrid inference (partial layer offloading via --n-gpu-layers), continuous batching in server mode, speculative decoding, and router mode for multi-model serving. The server architecture is single-threaded (server_context) with thread-safe queues for HTTP workers.",
      examples: `<pre>llama.cpp — portable C/C++ inference stack:

  ┌─────────────────────────────────────────────────────┐
  │  llama-server / llama-cli / llama-bench             │
  └────────────────────────┬────────────────────────────┘
                           │
  ┌────────────────────────▼────────────────────────────┐
  │  GGML tensor library                                 │
  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
  │  │  CUDA  │ │ Metal  │ │ Vulkan │ │ AVX512 │ ...   │
  │  └────────┘ └────────┘ └────────┘ └────────┘       │
  └────────────────────────┬────────────────────────────┘
                           ▼
                    GGUF model file (same file, any backend)

Hybrid offload:  Layers 0-34 → CPU RAM    Layers 35-79 → GPU VRAM

# Hybrid CPU/GPU inference (RTX 4090 24GB + 64GB RAM)
./llama-server -m Llama-3-70B-Q4_K_M.gguf \\
  --n-gpu-layers 35 \\        # offload 35/80 layers to GPU
  --ctx-size 8192 \\
  --parallel 4 \\            # continuous batching in server mode
  --host 0.0.0.0 --port 8080

# Speculative decoding
./llama-server -m Llama-3-70B-Q4_K_M.gguf \\
  --model-draft Llama-3-8B-Q8_0.gguf \\
  --draft-max 8

# Benchmark
./llama-bench -m model.gguf -p 512 -n 128 -ngl 99</pre>
<p>70B Q4_K_M on RTX 4090: ~25 tok/s (35 GPU layers). Full GPU offload needs ~40 GB VRAM.</p>`,
      related: ["ollama", "gguf", "quantization"],
      usedIn: ["ollama-llamacpp"],
      sources: [
        { label: "llama.cpp GitHub", url: "https://github.com/ggml-org/llama.cpp" }
      ]
    },
    gguf: {
      name: "GGUF",
      role: "Model Format",
      summary: "GGML Unified Format — the standard file format for quantized LLM weights, storing model parameters, metadata, tokenizer, and architecture in a single portable file.",
      definition: "GGUF (GGML Unified Format) is a binary format for storing quantized LLM weights. It contains model parameters in various quantization schemes (Q4_0, Q4_K_M, Q5_K_M, Q8_0, etc.), model architecture metadata, tokenizer vocabulary, and training hyperparameters in a single file. GGUF files are hardware-agnostic — the same file runs on CPU, NVIDIA, AMD, and Apple Silicon. The format supports mixed-precision 'K_M' variants where attention layers get higher precision than MLP layers, achieving better quality than uniform quantization at the same average bit-width.",
      examples: `<pre>GGUF file structure — single portable binary:

  ┌─────────────────────────────────────────────┐
  │  GGUF Header (magic, version, tensor count) │
  ├─────────────────────────────────────────────┤
  │  Metadata KV pairs                          │
  │    general.architecture: llama              │
  │    llama.block_count: 80                    │
  │    tokenizer.ggml.tokens: [...]             │
  ├─────────────────────────────────────────────┤
  │  Tensor 0: blk.0.attn_q.weight  (Q6_K)      │
  │  Tensor 1: blk.0.ffn_gate.weight (Q4_K)     │
  │  ...                                        │
  │  Tensor N: output.weight        (Q6_K)      │
  └─────────────────────────────────────────────┘
         Same file → CUDA | Metal | Vulkan | CPU

# Inspect GGUF metadata
python -c "from gguf import GGUFReader; r=GGUFReader('model.gguf');
  print(r.fields)" 
# → general.architecture: llama
# → llama.block_count: 80
# → tokenizer.ggml.tokens: [...]
# → general.quantization_version: 2

# File sizes (Llama-3-70B):
#   FP16:      ~140 GB
#   Q8_0:      ~75 GB  (8-bit uniform)
#   Q4_K_M:    ~40 GB  (4-bit mixed: attn Q6_K, MLP Q4_K)
#   Q4_0:      ~38 GB  (4-bit uniform, lower quality)

# Same file runs on: CUDA, Metal, Vulkan, AVX512 CPU</pre>`,
      related: ["quantization", "llamacpp", "ollama"],
      usedIn: ["ollama-llamacpp"],
      sources: [
        { label: "GGUF specification", url: "https://github.com/ggml-org/ggml/blob/master/docs/gguf.md" }
      ]
    },
    quantization: {
      name: "Quantization",
      role: "Model Optimization",
      summary: "Reducing model weight precision from FP16/FP32 to lower bit-widths (INT4/INT8/FP8) — trading minimal quality loss for 2-4x memory reduction and faster inference.",
      definition: "Quantization maps high-precision model weights to lower-precision representations. Post-training quantization (PTQ) methods like GPTQ and AWQ analyze weight distributions to minimize quantization error. The GGUF format supports schemes from Q4_0 (4-bit uniform) through Q8_0 (8-bit). vLLM supports FP8, MXFP8/MXFP4, NVFP4, INT8, INT4, GPTQ/AWQ. Key trade-off: Q4_K_M (4-bit mixed) achieves ~4x memory reduction with minimal quality loss and is the default recommendation. Quantization is orthogonal to system-level optimizations (PagedAttention, batching) — they stack multiplicatively.",
      examples: `<pre>Quantization — precision reduction pipeline:

  FP16 weights (140 GB)          FP8 weights (70 GB)
  ┌─────────────────┐            ┌─────────────────┐
  │ W: 16-bit float │  ──PTQ──▶  │ W: 8-bit float  │
  │ per parameter   │            │ per parameter   │
  └─────────────────┘            └─────────────────┘
         │                                │
         ▼                                ▼
  KV: 2.56 MB/token              KV: 1.28 MB/token (fp8 cache)
  2048 ctx = 5.24 GB             2048 ctx = 2.62 GB
         │                                │
         └──────── fits 1× H100 ──────────┘
              + PagedAttention → 2-4× concurrency

# vLLM FP8 quantization (H100 native)
llm = LLM(
    model="meta-llama/Llama-3-70B",
    quantization="fp8",           # W8A8 FP8 weights + activations
    kv_cache_dtype="fp8",         # halve KV cache: 2.56→1.28 MB/token
)

# Memory stacking (70B, 2048 ctx, 1 request):
#   FP16 weights + FP16 KV:  140 GB + 5.24 GB
#   FP8 weights + FP8 KV:     70 GB + 2.62 GB  (fits 1× H100)
#   + PagedAttention:         2-4× more concurrent requests

# Quality (MMLU, Llama-3-70B):
#   FP16: 79.5%  |  FP8: 79.1%  |  INT4 GPTQ: 77.8%</pre>`,
      related: ["gguf", "llamacpp", "vllm"],
      usedIn: ["ollama-llamacpp", "vllm"],
      sources: [
        { label: "Morph LLM Inference Optimization Guide", url: "https://www.morphllm.com/llm-inference-optimization" }
      ]
    },
    gqa: {
      name: "GQA",
      role: "Architecture Optimization",
      summary: "Share K/V heads across multiple query heads — reducing KV cache size by the grouping factor (e.g., 8x for Llama 3) without significant quality loss.",
      definition: "In standard Multi-Head Attention (MHA), each query head has its own dedicated Key and Value head. GQA groups multiple query heads to share a single K/V head pair. Llama 3 uses 64 query heads with only 8 K/V head groups — an 8x reduction in KV cache size per token. This is an architecture-level optimization (decided at training time) that is orthogonal to system-level optimizations like PagedAttention. GQA reduces the memory bottleneck of the decode phase without requiring any change to the serving framework.",
      examples: `<pre>GQA — grouped query heads share K/V:

MHA (64 Q, 64 K/V):          GQA (64 Q, 8 K/V groups):

  Q₀ Q₁ ... Q₆₃               Q₀-Q₇  Q₈-Q₁₅ ... Q₅₆-Q₆₃
   │  │      │                  │       │           │
   ▼  ▼      ▼                  └───┬───┘           │
  K₀ K₁ ... K₆₃                     ▼               ▼
  V₀ V₁ ... V₆₃                   K₀,V₀           K₇,V₇
  (64 K/V pairs)              (8 K/V pairs, group_size=8)

KV per token/layer:  32 KB (MHA)  →  4 KB (GQA)  = 8× reduction
2048 ctx, 80 layers: 5.24 GB     →  655 MB

// GQA attention: 64 Q heads share 8 K/V head groups
// num_query_heads=64, num_kv_heads=8 → group_size=8
//
// KV per token per layer (Llama 3, head_dim=128, FP16):
//   MHA: 2 × 64 × 128 × 2 = 32 KB
//   GQA: 2 ×  8 × 128 × 2 =  4 KB  (8× reduction)
//
// 2048-token request, 80 layers:
//   MHA KV cache: 32 KB × 80 × 2048 = 5.24 GB
//   GQA KV cache:  4 KB × 80 × 2048 = 655 MB
//
// Q heads 0-7 share kv_head[0], heads 8-15 share kv_head[1], ...</pre>`,
      related: ["mla", "kvcache", "decode"],
      usedIn: ["kv-cache"],
      sources: [
        { label: "Ainslie et al., 'GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints'" }
      ]
    },
    mla: {
      name: "MLA",
      role: "Architecture Optimization",
      summary: "Compress K/V into a learned low-rank latent space — further reducing KV cache beyond GQA, used in DeepSeek models.",
      definition: "MLA projects Key and Value vectors into a lower-dimensional latent space before caching, then reconstructs them during attention computation. This achieves more aggressive KV cache compression than GQA because the latent dimension can be much smaller than the original head dimension. Used in DeepSeek models. Operates at the architecture level (requires training with MLA) and is orthogonal to system-level PagedAttention. SGLang provides MLA-optimized kernels for DeepSeek serving.",
      examples: `<pre>MLA — compress K/V into latent space before caching:

Standard (cache full K,V):        MLA (cache latent c_kv only):

  Token → W_K → K (8192-dim)       Token → W_DKV → c_kv (512-dim)
       → W_V → V (8192-dim)              │
       │                                 ▼
       ▼                          ┌───────────────┐
  Cache: 2.1 MB/token            │ Cache: 0.07 MB│
                                 └───────┬───────┘
                                         │ at attention:
                                         ▼
                                 K = W_UK @ c_kv  (reconstruct)
                                 V = W_UV @ c_kv  (reconstruct)

// DeepSeek-V2 MLA (vs standard MHA/GQA):
//
// Standard: cache full K,V per head → dim = num_heads × head_dim
// MLA:      cache compressed latent c_kv → dim = d_latent (e.g. 512)
//           K = W_UK @ c_kv,  V = W_UV @ c_kv  (reconstruct at attention)
//
// KV per token (DeepSeek-V2, 60 layers):
//   MHA equivalent: ~2.1 MB/token
//   MLA cached:     ~0.07 MB/token  (~30× reduction)
//
# SGLang DeepSeek serving:
python -m sglang.launch_server \\
  --model-path deepseek-ai/DeepSeek-V2 \\
  --enable-mla-kernel</pre>`,
      related: ["gqa", "kvcache"],
      usedIn: ["kv-cache"],
      sources: [
        { label: "DeepSeek-V2 Technical Report" }
      ]
    },
    prefixcaching: {
      name: "PrefixCaching",
      role: "Optimization Technique",
      summary: "Store and reuse KV cache for shared prompt prefixes across requests — skipping expensive prefill for repeated system prompts or RAG documents.",
      definition: "When multiple requests share the same prefix (system prompt, RAG document, few-shot examples), the KV cache for that prefix is computed once and reused by subsequent requests. This eliminates redundant prefill computation and can reduce TTFT by up to 85%. Implementation varies: vLLM uses explicit prefix caching (hash-based matching on prompt prefixes), SGLang uses RadixAttention (automatic prefix discovery via radix tree). The technique is most impactful for multi-turn chat, RAG pipelines, and agentic workflows where system prompts or document contexts are shared across many requests.",
      examples: `<pre>Prefix Caching — shared KV blocks across requests:

Request 1:  [SYSTEM PROMPT (1500 tok)] + user_A
              │ prefill once, cache KV │
              ▼                        ▼
         ┌─────────┐              compute user_A only
         │ CACHED  │◀───────────── Request 2 reuses blocks
         │ blocks  │              [SYSTEM PROMPT] + user_B
         └─────────┘                    │
              ▲                         ▼
              └──────── Request 3 ────────┘
                        [SYSTEM PROMPT] + user_C

Without cache: 100 × prefill(1500) = wasted compute
With cache:    1 × prefill(1500) + 100 × prefill(user_only)

# vLLM explicit prefix caching
llm = LLM(
    model="meta-llama/Llama-3-70B",
    enable_prefix_caching=True,   # hash-based block reuse
)

# 100 requests, shared 1500-token system prompt + RAG doc:
#   Without cache: 100 × prefill(1500+user) ≈ 100 × 90ms = 9s wasted
#   With cache:    1 × prefill(1500) + 100 × prefill(user_only)
#                  TTFT: 120ms → 79ms (34% faster, SGLang RadixAttention)

# RAG pipeline pattern:
SYSTEM = open("system_prompt.txt").read()   # cached after req 1
DOC    = retrieve("vector_db", query)        # cached per document hash
prompt = f"{SYSTEM}\\n\\nContext: {DOC}\\n\\nUser: {query}"</pre>`,
      related: ["radixattention", "copyonwrite", "prefill", "ttft"],
      usedIn: ["sglang", "vllm", "batching-scheduling"],
      sources: [
        { label: "Google Cloud: Five LLM Inference Techniques", url: "https://cloud.google.com/blog/topics/developers-practitioners/five-techniques-to-reach-the-efficient-frontier-of-llm-inference" }
      ]
    },
    compressedfsm: {
      name: "CompressedFSM",
      role: "Structured Generation",
      summary: "SGLang's optimization for constrained decoding: collapse deterministic FSM transition chains into single edges, emitting multiple tokens per forward pass.",
      definition: "When generating structured output (JSON, XML) under grammar constraints, the output must follow a finite-state machine (FSM). Standard constrained decoding checks the FSM at every token — even when only one valid next token exists. SGLang's compressed FSM analyzes the constraint grammar, identifies chains of deterministic transitions (runs where only one valid path exists), and collapses them into single edges. During decoding, when entering such a chain, multiple tokens are emitted in a single forward pass without masking or re-checking. This is faster (fewer forward passes) and more compliant (provably valid structure).",
      examples: `<pre>Compressed FSM — collapse deterministic token chains:

Standard FSM (1 token per forward pass):
  { ──▶ " ──▶ n ──▶ a ──▶ m ──▶ e ──▶ " ──▶ :     (40+ passes)

Compressed FSM (SGLang):
  OPEN_BRACE ═══════════════════════════════▶ COLON
              emits '{"name":' in 1 pass (5 tokens)

  ┌─────────┐   collapsed    ┌─────────┐
  │ state A │───────────────▶│ state F │  multi-token edge
  └─────────┘   chain edge   └─────────┘

// JSON schema: {"name": "&lt;string&gt;", "age": &lt;int&gt;}
//
// Standard FSM (per-token masking):
//   state OPEN_BRACE → only "{" valid → 1 forward pass
//   state QUOTE_NAME → only "\\"" valid → 1 forward pass
//   ... 40+ forward passes for simple JSON
//
// Compressed FSM (SGLang):
//   chain: OPEN_BRACE → QUOTE → "name" → QUOTE → COLON
//   collapsed edge emits: '{"name":' in 1 forward pass (5 tokens)
//
@sgl.function
def gen_user(s):
    s += sgl.gen("json", regex=r'\\{"name":"[^"]*","age":\\d+\\}')

# Speedup: 3-5× fewer forward passes on structured outputs</pre>`,
      related: ["sglang", "scheduler"],
      usedIn: ["sglang"],
      sources: [
        { label: "SGLang paper (Zheng et al.)", url: "https://arxiv.org/abs/2312.07104" }
      ]
    },
    speculativedecoding: {
      name: "SpeculativeDecoding",
      role: "Optimization Technique",
      summary: "Draft tokens with a small fast model, verify in parallel with the large model — trading cheap compute for fewer expensive serial steps while maintaining identical output distribution.",
      definition: "A small draft model proposes K candidate tokens autoregressively (cheap — small model is fast). The large target model verifies all K candidates in a single forward pass (efficient — parallel compute, same as prefill). Accepted tokens are mathematically identical to what the target model would generate alone — the technique is lossless. Variants include separate draft models, n-gram matching, self-speculative (early exit), EAGLE (learned draft head), and Medusa (parallel prediction heads). Typical speedup: 2-5x with well-matched draft models. Supported by vLLM, SGLang, and TensorRT-LLM.",
      examples: `<pre>Speculative Decoding — one round:

Draft model (8B, fast):     Target model (70B, verify):
┌───┐ ┌───┐ ┌───┐ ┌───┐    ┌───────────────────────┐
│"The"│→│"cat"│→│"sat"│→│"on"│    │ Verify all 4 at once   │
└───┘ └───┘ └───┘ └───┘    │ (single forward pass)  │
  ~2ms each = 8ms total     │        ~7ms             │
                            └───────────────────────┘
                                      │
                            ┌─────────┴──────────┐
                            ▼                    ▼
                     Accept: "The" "cat" "sat"  Reject: "on"
                     (match target distribution) (resample → "in")

Result: 3 tokens in 8+7 = 15ms  (vs 3×7 = 21ms serial)
Net: 1.4× speedup this round (avg across rounds: 2-4×)

# vLLM API:
# LLM(model="70B", speculative_model="8B", num_speculative_tokens=4)
# Lossless: output distribution = target-only sampling</pre>`,
      related: ["draftmodel", "decode", "vllm"],
      usedIn: ["speculative-decoding", "vllm"],
      sources: [
        { label: "Leviathan et al., 'Fast Inference from Transformers via Speculative Decoding', 2023" }
      ]
    },
    draftmodel: {
      name: "DraftModel",
      role: "Speculative Decoding Component",
      summary: "The small, fast model in speculative decoding that proposes candidate tokens for the large target model to verify — its acceptance rate determines speedup.",
      definition: "The draft model generates candidate tokens cheaply (it's much smaller than the target model, so autoregressive generation is fast). The quality of the draft model determines the acceptance rate α: the fraction of proposed tokens the target model accepts. Higher α → more tokens generated per target-model forward pass → higher speedup. The relationship: expected tokens per target pass = 1/(1-α). A well-matched draft model (e.g., Llama-3-8B drafting for Llama-3-70B) achieves α > 0.7, yielding 3-4x speedup. Draft models can be separate models, n-gram tables, or learned draft heads (EAGLE, Medusa).",
      examples: `<pre>Draft Model — propose cheap, verify expensive:

  Draft (8B, fast)              Target (70B, verify)
  ┌───┐ ┌───┐ ┌───┐ ┌───┐      ┌─────────────────────┐
  │"The"│→│"cat"│→│"sat"│→│"on"│──▶│ Verify 4 at once  │
  └───┘ └───┘ └───┘ └───┘      │  Accept: The,cat,sat │
   ~2ms each                    │  Reject: on → resample│
                                └─────────────────────┘

Acceptance rate α → speedup:  E[tokens/pass] = 1/(1-α)
  α=0.50 → 2.0×    α=0.70 → 3.3×    α=0.85 → 6.7×

// Draft model acceptance rate (α) → speedup
//
// α = 0.50 → E[tokens/pass] = 1/(1-0.5)  = 2.0× speedup
// α = 0.70 → E[tokens/pass] = 1/(1-0.7)  = 3.3× speedup
// α = 0.85 → E[tokens/pass] = 1/(1-0.85) = 6.7× speedup
//
// Llama-3-8B drafting Llama-3-70B (measured):
//   α ≈ 0.72-0.78, K=4 speculative tokens
//   Throughput: 85 tok/s → 280 tok/s (3.3× on H100)
//
// Draft variants:
//   Separate model:  Llama-3-8B (simplest, α~0.75)
//   EAGLE:           learned draft head on target (α~0.85)
//   N-gram:          lookup table, α~0.3-0.5 (no extra model)</pre>`,
      related: ["speculativedecoding", "decode"],
      usedIn: ["speculative-decoding"],
      sources: [
        { label: "Leviathan et al., 2023" }
      ]
    },
    disaggregatedserving: {
      name: "DisaggregatedServing",
      role: "Architecture Pattern",
      summary: "Physically separate prefill (compute-bound) and decode (memory-bound) onto distinct hardware pools, eliminating phase interference at the cost of KV cache transfer overhead.",
      definition: "Traditional colocated serving runs both prefill and decode on the same GPU, causing interference: long prefills stall decodes for other requests. Disaggregated serving routes prefill requests to dedicated high-compute workers and decode requests to dedicated high-bandwidth workers. After prefill, the KV cache is transferred via high-speed interconnect (NVLink, InfiniBand) to the decode worker. Benefits: independent scaling, no phase interference, optimized hardware per phase. Trade-offs: KV transfer latency, infrastructure complexity, potentially higher energy consumption. Supported by vLLM natively; co-developed with Meta.",
      examples: `<pre>Disaggregated Serving Architecture:

┌──────────────────────────────────────────────────────┐
│                      ROUTER                           │
│           (load-balances by phase)                    │
└──────────┬──────────────────────────────┬────────────┘
           │ prompt                        │ KV ready
           ▼                              ▼
┌────────────────────────┐   ┌────────────────────────┐
│    PREFILL POOL         │   │    DECODE POOL          │
│  GPU 0-3 (990 TFLOPS)  │   │  GPU 4-7 (3.35 TB/s)   │
│  Batch similar prompts  │   │  Continuous batching    │
│  Compute-saturated      │   │  Bandwidth-saturated   │
└───────────┬─────────────┘   └────────────────────────┘
            │ KV transfer (NVLink ~5ms / IB ~40ms)
            └─────────────────→ decode pool

# KV transfer cost (2048 tokens, 70B):
#   Size: 5.24 GB  |  NVLink: ~5ms  |  InfiniBand: ~40ms
# Benefit: p95 ITL stable at 7ms (no prefill stalls)

# vLLM config:
# --kv-transfer-config '{"kv_connector":"NixlConnector",
#   "kv_role":"kv_producer"}'  (prefill)
# --kv-transfer-config '{"kv_connector":"NixlConnector",
#   "kv_role":"kv_consumer"}'  (decode)</pre>`,
      related: ["prefill", "decode", "kvcache", "prefilldecodeasymmetry"],
      usedIn: ["disaggregated-serving", "vllm"],
      sources: [
        { label: "Meta's disaggregated serving with vLLM", url: "https://jarvislabs.ai/blog/llm-optimization-disaggregated-prefill-decode" }
      ]
    },
    scheduler: {
      name: "Scheduler",
      role: "System Component",
      summary: "The component deciding which requests run in each iteration — implements continuous batching, priority, preemption, and admission control.",
      definition: "The Scheduler is the central decision-maker in an LLM serving engine. Every iteration, it selects which requests to include in the next batch, subject to memory constraints (available KV blocks), priority rules (SLA tiers), and fairness policies. In vLLM, the scheduler supports preemption (evicting lower-priority requests under memory pressure) and admission control (rejecting requests when the system is overloaded). In SGLang, the scheduler additionally implements cache-aware policies (LPM) that reorder requests to maximize RadixAttention cache hits.",
      examples: `<pre>Scheduler — iteration-level batch decisions:

  ┌──────────────┐
  │ Waiting Queue│──▶ Admit if blocks available
  └──────┬───────┘
         │
         ▼
  ┌──────────────────────────────────────────┐
  │  Scheduler Loop (each iteration)        │
  │  1. Check BlockManager.num_free_blocks() │
  │  2. Select running reqs for next batch   │
  │  3. Memory pressure → preempt (swap KV)  │
  │  4. Eject finished → return blocks       │
  └──────────────────┬───────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    Block Manager  Model Exec   (SGLang: LPM reorder)

// vLLM Scheduler decision loop (each iteration):
//
// 1. Check BlockManager.num_free_blocks()
// 2. Admit waiting requests if blocks available
// 3. Select running requests for next batch (FCFS default)
// 4. On memory pressure: preempt lowest-priority → swap KV to CPU
// 5. Eject finished requests, return blocks to pool
//
# vLLM scheduler config:
--max-num-seqs 256          # max concurrent sequences
--max-num-batched-tokens 8192  # token budget per iteration
--preemption-mode swap      # swap vs recompute

// SGLang adds cache-aware reordering:
//   LPM policy: prioritize requests with longest radix-tree prefix match</pre>`,
      related: ["continuousbatching", "blockmanager", "vllm", "sglang"],
      usedIn: ["batching-scheduling", "vllm", "sglang"],
      sources: [
        { label: "vLLM Architecture", url: "https://github.com/vllm-project/vllm" }
      ]
    },
    chunkedprefill: {
      name: "ChunkedPrefill",
      role: "Optimization Technique",
      summary: "Split long prefill into smaller chunks interleaved with decode steps — preventing long prompts from stalling generation for other requests.",
      definition: "When a new request has a long input prompt, computing the full prefill in one shot blocks the GPU from processing decode steps for all other in-flight requests. Chunked prefill breaks the input into smaller chunks (e.g., 512 tokens each) and interleaves prefill chunks with decode iterations. This prevents latency spikes for existing users at the cost of slightly higher TTFT for the new request (its prefill is spread across multiple iterations). Both vLLM and SGLang support chunked prefill.",
      examples: `<pre>Chunked Prefill — interleave with decode:

Without (8K prompt blocks GPU):
  iter 1-16:  ████████████████ prefill only  → ITL spikes 7→280ms
  iter 17+:   decode resumes

With chunked prefill (512-token chunks):
  iter 1:  [prefill 512] + [decode A,B,C]  ITL ~7-12ms
  iter 2:  [prefill 512] + [decode A,B,C]  ITL ~7-12ms
  ...
  iter 16: [prefill 512] + [decode A,B,C]  (16 chunks total)

  Timeline:  P P P P P P P P P P P P P P P P  (prefill chunks)
              D D D D D D D D D D D D D D D D  (decode interleaved)

# vLLM chunked prefill
python -m vllm.entrypoints.openai.api_server \\
  --model meta-llama/Llama-3-70B \\
  --enable-chunked-prefill \\
  --max-num-batched-tokens 2048   # chunk size budget

// Without chunked prefill — 8K prompt arrives:
//   iter 1-40: ONLY prefill (40× longer than decode step)
//   Existing users: ITL spikes 7ms → 280ms for 40 iterations
//
// With chunked prefill (512-token chunks):
//   iter 1: prefill 512 + decode all others
//   iter 2: prefill 512 + decode all others  (×16 chunks)
//   Existing users: ITL stays ~7-12ms throughout
//
// Trade-off: new request TTFT 480ms → 520ms (+8%)</pre>`,
      related: ["prefill", "continuousbatching", "scheduler"],
      usedIn: ["batching-scheduling", "vllm"],
      sources: [
        { label: "vLLM documentation", url: "https://docs.vllm.ai" }
      ]
    },
    cacheawarescheduling: {
      name: "CacheAwareScheduling",
      role: "Scheduling Strategy",
      summary: "Reorder request execution to maximize KV cache reuse — SGLang's LPM policy prioritizes requests with longer shared prefixes in the radix tree.",
      definition: "Instead of processing requests in arrival order (FCFS), cache-aware scheduling reorders them to maximize hits in the KV cache. SGLang's Longest Prefix Match (LPM) policy prioritizes requests whose prompt shares the longest prefix with an existing radix tree node. This approximates a depth-first traversal of the request space, keeping the most relevant cache entries hot. The trade-off is fairness: requests with novel (non-cached) prompts may wait longer. DFS-weight balances reuse against fairness via a configurable weight.",
      examples: `<pre>Cache-Aware Scheduling — LPM reorders for prefix hits:

Radix tree (cached prefixes):
                    [root]
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
  "You are helpful..."      "Write a poem..."
   (18 tok cached)            (0 tok cached)

Queue (arrival):  R1(18) → R2(18) → R3(0)
FCFS order:       R1 → R2 → R3   (R3 waits)
LPM order:        R2 → R1 → R3   (maximize 18-tok reuse)

// SGLang cache-aware scheduling (LPM policy)
//
// Queue (arrival order):
//   R1: "You are helpful. Explain CUDA"     (prefix match: 18 tokens)
//   R2: "You are helpful. Compare vLLM/SGLang" (prefix match: 18 tokens)
//   R3: "Write a poem about cats"            (prefix match: 0 tokens)
//
// FCFS order:     R1 → R2 → R3  (R3 waits behind long prefills)
// LPM order:      R2 → R1 → R3  (maximize shared 18-token prefix reuse)
//
# Launch with LPM scheduling:
python -m sglang.launch_server \\
  --model-path meta-llama/Llama-3-70B \\
  --schedule-policy lpm

// Impact: +29% throughput on shared-prefix agent workloads</pre>`,
      related: ["radixattention", "sglang", "scheduler", "prefixcaching"],
      usedIn: ["sglang"],
      sources: [
        { label: "SGLang paper", url: "https://arxiv.org/abs/2312.07104" }
      ]
    },
    throughput: {
      name: "Throughput",
      role: "Performance Metric",
      summary: "Total tokens generated per second across all concurrent requests — the aggregate system efficiency metric, distinct from per-user latency.",
      definition: "Throughput measures the total output rate of a serving system: sum of all tokens generated per second across all active requests. It is the primary cost-efficiency metric — higher throughput means more work per GPU-second. However, throughput can be misleadingly high if latency is poor (e.g., batching 1000 requests gives high throughput but each user waits a long time). Production systems must balance throughput against TTFT p50/p95 and ITL. Typical H100 values (2026): vLLM 2,400 tok/s, SGLang 2,460 tok/s, TensorRT-LLM 2,780 tok/s at 100 concurrent requests.",
      examples: `<pre>Throughput — aggregate tokens/sec across all requests:

100 concurrent requests × 256 tokens each:
  Req 0:  ████████████████████ 256 tok
  Req 1:  ████████████████████ 256 tok
  ...
  Req 99: ████████████████████ 256 tok
  ─────────────────────────────────────
  Total: 25,600 tokens in 10.5s → 2,438 tok/s

H100 comparison (100 concurrent, 70B):
  TensorRT-LLM  ████████████████████  2,780 tok/s
  SGLang        ██████████████████    2,460 tok/s
  vLLM          █████████████████     2,400 tok/s

// Throughput measurement (aggregate, not per-user):
//
// 100 concurrent requests, each generating 256 tokens:
//   Total tokens = 100 × 256 = 25,600
//   Wall time = 10.5s
//   Throughput = 25,600 / 10.5 = 2,438 tok/s

// H100 benchmarks (Llama-3-70B, 100 concurrent, 2026):
//   TensorRT-LLM:  2,780 tok/s  (peak, NVIDIA-only)
//   SGLang:        2,460 tok/s  (+29% on shared-prefix workloads)
//   vLLM:          2,400 tok/s  (broadest model support)

// Cost efficiency:
//   $2.50/GPU-hr H100 → 2,400 tok/s = 8.64M tok/hr → $0.29/M tokens</pre>
<p>High throughput with poor p95 TTFT (1,450ms) means cost-efficient but bad UX — track both.</p>`,
      related: ["ttft", "itl", "continuousbatching"],
      usedIn: ["benchmarks", "inference-landscape"],
      sources: [
        { label: "Spheron H100 Benchmarks", url: "https://www.spheron.network/blog/vllm-vs-tensorrt-llm-vs-sglang-benchmarks/" }
      ]
    },
    flashattention: {
      name: "FlashAttention",
      role: "Attention Algorithm",
      summary: "IO-aware exact attention that tiles computation into SRAM-sized blocks, fuses all ops into one kernel, and never materializes the N×N attention matrix — achieving 2-4x speedup with linear memory.",
      definition: "FlashAttention restructures the attention computation to minimize HBM (GPU main memory) reads/writes. It divides Q, K, V into blocks that fit in on-chip SRAM, computes attention block-by-block using online softmax (incremental max/sum tracking), and writes only the final output to HBM. The intermediate N×N attention matrix is never materialized. In the backward pass, it recomputes attention from Q/K/V blocks rather than reading saved intermediates — trading FLOPs for IO. IO complexity: O(N²d²M⁻¹) vs standard Ω(Nd + N²). FlashAttention-3 on H100 adds WGMMA, TMA, ping-pong scheduling, and FP8 support, reaching ~740 TFLOPS. Complementary to PagedAttention: FlashAttention optimizes within-attention computation; PagedAttention optimizes cross-request KV memory layout.",
      examples: `<pre>FlashAttention — tiled IO-aware attention:

Standard: materialize N×N matrix in HBM     FlashAttention: tile in SRAM

  Q @ K^T → [N×N scores] → softmax → @V     for each Q_tile:
  (67 MB written to HBM!)                     load Q_tile, K_tile, V_tile
                                              online_softmax → write O_tile
                                              (never materialize N×N)

  HBM ◀══════════════════════▶ HBM           SRAM ◀══▶ compute ◀══▶ HBM
       many read/write cycles                    minimal HBM traffic

// Performance evolution:
// FlashAttention   (2022, A100):  ~124 TFLOPS
// FlashAttention-2 (2023, A100):  ~350 TFLOPS
// FlashAttention-3 (2024, H100):  ~740 TFLOPS
// vs standard attention utilization: ~35% on H100

// IO savings (d=128, typical SRAM):
// Standard: reads/writes full N×N attention matrix to HBM
// FlashAttention: up to 9x fewer HBM accesses
// Memory: O(N) vs O(N²) — enables million-token contexts</pre>`,
      related: ["pagedattention", "kvcache", "ioawareness", "tiling"],
      usedIn: ["flash-attention", "vllm", "tensorrt-llm"],
      sources: [
        { label: "Dao et al., 'FlashAttention', NeurIPS 2022", url: "https://arxiv.org/abs/2205.14135" },
        { label: "FlashAttention-3 blog", url: "https://tridao.me/blog/2024/flash3/" }
      ]
    },
    ioawareness: {
      name: "IOAwareness",
      role: "Design Principle",
      summary: "Designing algorithms with explicit knowledge of the memory hierarchy — optimizing for data movement (IO) rather than just arithmetic operations (FLOPs).",
      definition: "Modern GPUs have a large gap between compute throughput (e.g., 989 TFLOPS on H100) and memory bandwidth (3.35 TB/s). An IO-aware algorithm structures computation to minimize data movement between slow memory (HBM) and fast cache (SRAM), even if this requires more total arithmetic. FlashAttention's key insight is that attention is memory-bound, not compute-bound — reducing HBM reads/writes by tiling into SRAM yields wall-clock speedups despite more total FLOPs. This principle extends beyond attention: any algorithm where the arithmetic intensity (FLOPs per byte moved) is low benefits from IO-aware restructuring.",
      examples: `<pre>IO-Awareness — optimize data movement, not just FLOPs:

H100 memory hierarchy (speed ↑, capacity ↓):

  ┌─────────────────────────────────────┐
  │  Compute: 989 TFLOPS (FP16)         │  ← rarely the bottleneck
  ├─────────────────────────────────────┤
  │  SRAM:   ~19 TB/s  (48 KB/SM)       │  ← FlashAttention targets here
  ├─────────────────────────────────────┤
  │  L2:     ~12 TB/s                   │
  ├─────────────────────────────────────┤
  │  HBM:    3.35 TB/s  (80 GB)         │  ← attention is bound here
  └─────────────────────────────────────┘

Standard attention: ~2 FLOPs/byte → memory-bound
IO-aware tiling:    9× fewer HBM accesses → 2-4× speedup

// H100 memory hierarchy &amp; arithmetic intensity
//
//   HBM (80 GB):     3.35 TB/s bandwidth
//   L2 cache:        ~12 TB/s
//   SRAM (shared):   ~19 TB/s per SM
//   Compute:         989 TFLOPS (FP16)
//
// Standard attention (N=4096, d=128):
//   Reads Q,K,V from HBM: O(N×d) each
//   Writes N×N attention matrix to HBM: 67 MB (materialized!)
//   Arithmetic intensity: ~2 FLOPs/byte → memory-bound
//
// IO-aware (FlashAttention):
//   Tiles into 48KB SRAM blocks, never writes N×N matrix
//   9× fewer HBM accesses → 2-4× wall-clock speedup</pre>`,
      related: ["flashattention", "tiling"],
      usedIn: ["flash-attention"],
      sources: [
        { label: "Dao et al., FlashAttention", url: "https://arxiv.org/abs/2205.14135" }
      ]
    },
    tiling: {
      name: "Tiling",
      role: "Computation Technique",
      summary: "Dividing large matrix operations into SRAM-sized blocks to maximize data reuse in fast cache — the core mechanism enabling FlashAttention's IO efficiency.",
      definition: "Tiling (or blocking) partitions large matrices into smaller sub-matrices (tiles) that fit in the GPU's on-chip SRAM. Each tile is loaded once from HBM, used for all required computations, then discarded. In FlashAttention, Q is divided into row tiles and K/V into column tiles. For each Q tile, the kernel iterates over all K/V tiles, accumulating partial attention results using online softmax. This ensures each element of Q, K, V is read from HBM O(1) times rather than O(N) times, dramatically reducing total memory traffic.",
      examples: `<pre>Tiling — partition matrices into SRAM-sized blocks:

Q matrix (N×d) divided into row tiles Br=64:
  ┌──────┐
  │Q_tile│ row 0-63
  ├──────┤
  │Q_tile│ row 64-127
  └──────┘

For each Q_tile (outer loop):
  load Q_tile → SRAM (once)
  for each KV_tile (inner loop):
    load K_tile, V_tile → SRAM
    S = Q_tile @ K_tile^T
    online_softmax_update(S)
  write O_tile → HBM

HBM reads per element: O(1) vs O(N) naive

// FlashAttention tiling (Br=64 row tiles, Bc=64 col tiles)
//
// SRAM budget per SM: ~48-96 KB shared memory
// Tile size: Br × d + 2 × Bc × d = 64×128×2 + 2×64×128×2 ≈ 48 KB
//
// for each Q_tile in Q.row_tiles:        // outer loop
//   load Q_tile to SRAM (once)
//   for each KV_tile in K,V.col_tiles:   // inner loop
//     load K_tile, V_tile to SRAM
//     S_ij = Q_tile @ K_tile^T           // partial scores
//     online_softmax_update(S_ij)        // incremental max/sum
//   write O_tile to HBM (final output only)
//
// HBM reads per element: O(1) vs O(N) for naive attention</pre>`,
      related: ["flashattention", "ioawareness"],
      usedIn: ["flash-attention"],
      sources: [
        { label: "Dao et al., FlashAttention", url: "https://arxiv.org/abs/2205.14135" }
      ]
    },
    tensorrtllm: {
      name: "TensorRTLLM",
      role: "Serving Framework",
      summary: "NVIDIA's compiler-first inference engine: ahead-of-time graph compilation with kernel fusion, CUDA Graph capture, and plugin injection for maximum NVIDIA GPU throughput.",
      definition: "TensorRT-LLM compiles LLM model graphs into optimized CUDA engines using NVIDIA's TensorRT deep learning compiler. The build phase (~28 minutes) sweeps the operation graph to select optimal kernels per GPU, fuse sequences of operations (LayerNorm + MatMul + Bias + Activation → single kernel), inject hand-optimized plugins (FlashAttention), and capture the entire forward pass as a CUDA Graph. Runtime loads the compiled engine in ~90 seconds. Supports in-flight batching, paged KV caching, FP8 quantization, speculative decoding. Integrates with Triton Inference Server for production deployment. NVIDIA-only hardware.",
      examples: `<pre>TensorRT-LLM — compile-time optimization pipeline:

  Model weights (PyTorch/ONNX)
           │
           ▼
  ┌─────────────────────┐
  │  Build (~28 min)    │
  │  Kernel fusion      │
  │  FlashAttn plugins  │
  │  CUDA Graph capture │
  └──────────┬──────────┘
             ▼
  ┌─────────────────────┐     ┌──────────────────┐
  │  TRT Engine (.plan) │────▶│ Triton Server    │
  │  Load ~90s            │     │ In-flight batch  │
  └─────────────────────┘     └──────────────────┘

# Build optimized engine (one-time, ~28 min)
python scripts/build.py \\
  --model_dir ./Llama-3-70B \\
  --output_dir ./engines/llama3-70b-fp8 \\
  --dtype float8 \\
  --use_gpt_attention_plugin float8 \\
  --max_batch_size 128 \\
  --max_input_len 8192

# Serve via Triton Inference Server
tritonserver --model-repository=./triton_models

# H100 benchmarks (100 concurrent, 2026):
#   Throughput: 2,780 tok/s (highest)
#   TTFT p50:   105ms
#   Cold start: ~90s runtime (after 28min compile)
#   vs vLLM:    2,400 tok/s, 120ms TTFT, ~62s cold start</pre>`,
      related: ["kernelfusion", "cudagraph", "vllm", "flashattention"],
      usedIn: ["tensorrt-llm", "benchmarks"],
      sources: [
        { label: "NVIDIA TensorRT-LLM Blog", url: "https://developer.nvidia.com/blog/optimizing-inference-on-llms-with-tensorrt-llm-now-publicly-available/" }
      ]
    },
    kernelfusion: {
      name: "KernelFusion",
      role: "Compiler Optimization",
      summary: "Merging multiple GPU operations into a single kernel — eliminating intermediate memory writes, reducing launch overhead, and improving memory locality.",
      definition: "GPU kernels are individual programs launched on the GPU. Each kernel launch has overhead, and data between kernels must pass through global memory (HBM). Kernel fusion combines multiple operations (e.g., LayerNorm → MatMul → Bias → Activation) into a single kernel where intermediate results stay in registers or shared memory. TensorRT-LLM's compiler automatically discovers fusible patterns; complex fusions like FlashAttention require manual plugin injection. The benefit is proportional to the number of fused operations and the size of eliminated intermediate tensors.",
      examples: `<pre>Kernel Fusion — keep intermediates in registers/SRAM:

Unfused (5 kernels, data through HBM each step):
  LayerNorm ──▶ HBM ──▶ MatMul ──▶ HBM ──▶ Bias ──▶ HBM ──▶ SiLU ──▶ HBM
  ~16 MB HBM traffic/layer × 80 layers

Fused (1 kernel, TensorRT-LLM):
  ┌─────────────────────────────────────────┐
  │ LayerNorm→MatMul→Bias→SiLU→MatMul       │
  │ (all in registers/SRAM, no intermediates)│
  └─────────────────────────────────────────┘
  ~4 MB HBM traffic/layer (read input + write output only)

// Unfused vs fused transformer layer (hidden=8192, batch=32)
//
// Unfused (5 kernel launches):
//   LayerNorm → write 2 MB to HBM
//   MatMul    → read 2 MB, write 2 MB
//   BiasAdd   → read 2 MB, write 2 MB
//   SiLU      → read 2 MB, write 2 MB
//   MatMul    → read 2 MB, write 2 MB
//   Total HBM traffic: ~16 MB/layer × 80 layers
//
// Fused (TensorRT-LLM, 1 kernel):
//   LayerNorm→MatMul→Bias→SiLU→MatMul in registers/SRAM
//   Total HBM traffic: ~4 MB/layer (read input + write output only)
//
// FlashAttention plugin: Q@K^T→softmax→@V fused (no N×N materialization)</pre>`,
      related: ["tensorrtllm", "cudagraph", "flashattention"],
      usedIn: ["tensorrt-llm"],
      sources: [
        { label: "NVIDIA TensorRT-LLM Documentation" }
      ]
    },
    cudagraph: {
      name: "CUDAGraph",
      role: "Runtime Optimization",
      summary: "Capture an entire sequence of GPU kernel launches into a single graph object — replaying it with near-zero launch overhead, critical for latency-sensitive decode steps.",
      definition: "Each GPU kernel launch from the CPU has microsecond-level overhead. In LLM decode, where each iteration is a short forward pass of many small kernels, this overhead accumulates significantly. CUDA Graphs capture a sequence of kernel launches into a replayable graph object. Subsequent executions replay the entire graph with a single CPU launch, eliminating per-kernel overhead. TensorRT-LLM compiles the entire forward pass into CUDA Graphs. vLLM supports piecewise and full CUDA/HIP graph capture. The constraint: graph inputs must have the same shape across replays, requiring padding or multiple graph variants for different batch sizes.",
      examples: `<pre>CUDA Graph — capture kernel sequence, replay in one launch:

Without CUDA Graph (decode step):
  CPU: launch k1 → launch k2 → ... → launch k80  (~400μs overhead)
  GPU: [k1][k2][k3]...[k80]                        (~6ms compute)

With CUDA Graph:
  CPU: replay graph once                            (~5μs overhead)
  GPU: [k1][k2][k3]...[k80]  (same sequence, captured)

  Capture once:  ┌── k1 ── k2 ── ... ── k80 ──┐ → Graph object
  Replay N times: single CPU call replays all kernels

# vLLM CUDA Graph capture
llm = LLM(
    model="meta-llama/Llama-3-70B",
    enforce_eager=False,           # enable graph capture (default)
    compilation_config={
        "cudagraph_capture_sizes": [1, 2, 4, 8, 16, 32, 64, 128],
    },
)

// Decode step without CUDA Graph:
//   ~80 kernel launches × ~5μs each = ~400μs CPU overhead
//   Actual GPU compute: ~6ms → overhead is 6% of ITL
//
// With CUDA Graph:
//   1 graph replay launch = ~5μs → overhead &lt;0.1%
//
// Constraint: batch_size must match a captured size (pad to nearest)</pre>`,
      related: ["tensorrtllm", "kernelfusion", "vllm"],
      usedIn: ["tensorrt-llm", "vllm"],
      sources: [
        { label: "NVIDIA CUDA Graph Documentation" }
      ]
    },
    expertparallelism: {
      name: "ExpertParallelism",
      role: "Parallelism Strategy",
      summary: "Distribute MoE experts across GPUs — each GPU holds a subset of experts, with all-to-all communication routing tokens to their assigned expert.",
      definition: "Expert Parallelism is a model-parallel strategy specific to Mixture-of-Experts architectures. Instead of replicating the full model (data parallelism) or splitting every layer (tensor parallelism), EP assigns different experts to different GPUs. During the forward pass, a router determines which expert(s) each token should visit. An all-to-all communication step sends tokens to the GPU holding their assigned expert. After expert computation, results are routed back. Non-expert layers (attention) can use tensor parallelism or be replicated. EP scales to very wide configurations: DeepSeek-R1 uses EP128 with 1 expert per GPU in decode mode.",
      examples: `<pre>Expert Parallelism data flow (4 GPUs, 16 experts, top-2):

     Tokens                 Router Decision
  ┌─────────┐         ┌──────────────────────┐
  │ tok_0   │ ──────▶ │ Expert 3, Expert 11  │
  │ tok_1   │ ──────▶ │ Expert 7, Expert 3   │
  │ tok_2   │ ──────▶ │ Expert 15, Expert 0  │
  └─────────┘         └──────────────────────┘
                               │
                    ┌──── All-to-All ────┐
                    ▼                    ▼
  GPU 0 (E0-3)    GPU 1 (E4-7)    GPU 2 (E8-11)   GPU 3 (E12-15)
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │E0: tok_2 │    │E7: tok_1 │    │E11: tok_0│    │E15: tok_2│
  │E3: tok_0,1│   │          │    │          │    │          │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘
       │               │               │               │
       └───────── All-to-All (results back) ───────────┘

# vLLM config: 128 GPUs for DeepSeek-V3
# --enable-expert-parallel --data-parallel-size 16
# EP128: 1 expert/GPU, ~5 GB expert weights each</pre>`,
      related: ["eplb", "moe", "disaggregatedserving"],
      usedIn: ["moe-serving", "vllm"],
      sources: [
        { label: "vLLM Expert Parallel Docs", url: "https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment/" }
      ]
    },
    eplb: {
      name: "EPLB",
      role: "Load Balancing System",
      summary: "Dynamic rebalancing of expert-to-GPU assignments based on runtime token routing statistics — replicating hot experts and redistributing to prevent GPU bottlenecks.",
      definition: "In MoE serving, token routing is often skewed — some experts receive disproportionately many tokens (hot experts) while others are underutilized (cold experts). EPLB monitors per-expert token counts over a sliding window, then periodically redistributes expert assignments: hot experts are replicated onto multiple GPUs so they can serve tokens in parallel, while cold experts are consolidated. Weight transfers use non-blocking copies between forward passes to avoid stalling inference. Strategies include hierarchical (balance across nodes first, then within) and global (balance across all GPUs regardless of topology). Developed by DeepSeek and integrated into vLLM.",
      examples: `<pre>EPLB — rebalance hot/cold expert placement:

Before rebalance (256 experts, skewed routing):
  GPU 42:  Expert #42 ████████████████ 18,200 tok (BOTTLENECK)
  GPU 199: Expert #199 ▏ 120 tok (IDLE)

After EPLB action:
  GPU 42:  Expert #42 copy 1  ██████
  GPU 43:  Expert #42 copy 2  ██████   ← replicated hot expert
  GPU 44:  Expert #42 copy 3  ██████
  GPU 199: Experts #198+#199  ▏▏       ← cold experts consolidated

  Monitor window (1000 passes) → rebalance → non-blocking weight copy

// EPLB rebalancing (sliding window = 1000 forward passes)
//
// Before rebalance (256 experts, 128 GPUs):
//   Expert #42: 18,200 tokens (14% of traffic) → GPU 42 bottlenecked
//   Expert #199: 120 tokens (0.09%)           → GPU 199 idle
//
// EPLB action:
//   Replicate expert #42 → GPUs 42, 43, 44 (3 copies)
//   Consolidate experts #198,#199 → GPU 199
//   Non-blocking weight copy between forward passes
//
# vLLM EPLB config:
--enable-eplb \\
--eplb-window-size 1000 \\
--eplb-rebalance-interval 500    # rebalance every 500 steps

// Result: max GPU utilization 45% → 89%, throughput +1.8×</pre>`,
      related: ["expertparallelism", "moe", "scheduler"],
      usedIn: ["moe-serving"],
      sources: [
        { label: "DeepSeek EPLB", url: "https://medium.com/@345490675/day-4-of-deepseeks-open-source-week-from-dualpipe-to-eplb-ed90f2f81d55" },
        { label: "vLLM EPLB Docs", url: "https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment/" }
      ]
    },
    moe: {
      name: "MoE",
      role: "Model Architecture",
      summary: "Sparse Transformer architecture that routes each token to a subset of expert FFN blocks — achieving large model capacity with much lower per-token compute cost.",
      definition: "In a Mixture-of-Experts model, the standard feed-forward network (FFN) in each Transformer layer is replaced by multiple parallel 'expert' FFNs and a learned router that selects which experts process each token (typically top-2 out of 64-256 experts). This creates a model with very large total parameters (e.g., DeepSeek-V3: 671B) but low active parameters per token (e.g., ~37B). The serving challenge is unique: all expert weights must be loaded in memory even though most are idle per-token, and tokens must be communicated to the GPU holding their assigned expert. This shifts the bottleneck from compute to memory capacity and inter-GPU communication.",
      examples: `<pre>MoE layer — sparse routing to expert FFNs:

  Token
    │
    ▼
  ┌─────────┐
  │ Router  │ softmax over 256 experts → top-2
  └────┬────┘
       │
   ┌───┴───┐
   ▼       ▼
 Expert 42  Expert 17     (each a full FFN, on different GPUs)
 (w=0.6)   (w=0.3)
   │       │
   └───┬───┘
       ▼
  weighted sum → output

  Total params: 671B (all experts in memory)
  Active/token: ~37B (only 2 experts computed)

// MoE layer (DeepSeek-V3: 256 experts, top-2 routing)
//
//   Token → Router (softmax over 256 experts)
//         → select top-2: expert_42 (weight 0.6), expert_17 (weight 0.3)
//         → dispatch to GPUs holding those experts
//         → weighted sum of expert outputs
//
// Parameter accounting:
//   Total params:    671B (all 256 experts loaded in memory)
//   Active/token:    ~37B (2 experts × ~18.5B each + shared attn)
//   Memory (FP8):    ~671 GB total → needs 8-16× H100 GPUs
//
// vs dense 70B: 140 GB FP16, compute-bound
// MoE serving bottleneck: memory capacity + all-to-all latency</pre>`,
      related: ["expertparallelism", "eplb"],
      usedIn: ["moe-serving"],
      sources: [
        { label: "Shazeer et al., 'Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer'" }
      ]
    },
    prefilldecodeasymmetry: {
      name: "PrefillDecodeAsymmetry",
      role: "Core Concept",
      summary: "The fundamental architectural tension: prefill is compute-bound (parallel, high arithmetic intensity) while decode is memory-bound (sequential, low arithmetic intensity).",
      definition: "LLM inference consists of two phases with opposing hardware profiles. Prefill processes all input tokens in parallel — high arithmetic intensity, compute-bound, benefits from more FLOPS. Decode generates tokens sequentially — low arithmetic intensity, memory-bandwidth-bound, benefits from higher HBM bandwidth. This asymmetry drives the design of every major optimization: continuous batching (keep GPU busy during decode), speculative decoding (convert serial decode into parallel verify), disaggregated serving (separate hardware per phase), and chunked prefill (prevent prefill from blocking decode).",
      examples: `<pre>Prefill vs Decode — the fundamental asymmetry (70B, H100):

H100 Roofline:
  990 TFLOPS ──────────────────────── Peak Compute ─────────
              ╱
             ╱  Prefill (2048 tokens)
            ╱     Intensity: ~400 FLOPs/byte
           ╱      ★ ABOVE ridge point → compute-bound
          ╱       Duration: ~120ms (this = TTFT)
         ╱
────────╱─── Ridge point: 295 FLOPs/byte ───────────────────
       ╱
      ╱  Decode (1 token)
     ╱     Intensity: ~1.9 FLOPs/byte
    ╱      ★ FAR BELOW ridge → memory-bandwidth-bound
   ╱       Duration: ~7ms per token (this = ITL)
  ╱
  3.35 TB/s ─────────────────────── Peak Bandwidth ─────────

Every major optimization targets this gap:
  Continuous batching:  batch decode tokens → raise intensity
  Speculative decoding: verify K tokens at once → prefill-like
  Disaggregated PD:     separate HW per phase
  Chunked prefill:      prevent compute-phase from stalling decode</pre>`,
      related: ["prefill", "decode", "disaggregatedserving"],
      usedIn: ["inference-landscape", "disaggregated-serving"],
      sources: [
        { label: "Google Cloud: Five LLM Inference Techniques", url: "https://cloud.google.com/blog/topics/developers-practitioners/five-techniques-to-reach-the-efficient-frontier-of-llm-inference" }
      ]
    }
  }
};
