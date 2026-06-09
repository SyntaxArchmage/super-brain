# AI Inference Infrastructure — Research Notes

## Research Date: 2026-06-08

## Sources

### Primary Papers
- Kwon et al., "Efficient Memory Management for Large Language Model Serving with PagedAttention", SOSP 2023. arXiv:2309.06180
- Zheng et al., "SGLang: Efficient Execution of Structured Language Model Programs", arXiv:2312.07104v2

### Primary Projects
- vLLM: https://github.com/vllm-project/vllm (v0.22.1+)
- SGLang: https://github.com/sgl-project/sglang (v0.5.12)
- Ollama: https://ollama.com / wraps llama.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp

### Reference Articles
- "What is vLLM? The open-source inference server that ate the inference stack" (insightfulaiworld.com, 2026)
- "SGLang: The Complete Guide to High-Performance LLM Inference" (inference.net, 2026)
- Spheron H100 Benchmarks: vLLM vs TensorRT-LLM vs SGLang (spheron.network, 2026)
- "Disaggregated Prefill-Decode: The Architecture Behind Meta's LLM Serving" (jarvislabs.ai)
- Google Cloud Blog: "Five techniques to reach the efficient frontier of LLM inference" (2026)

---

## 1. The LLM Inference Problem Space

LLM inference has two distinct phases with fundamentally different hardware profiles:

### Prefill Phase (Compute-Bound)
- Processes entire input prompt in parallel
- All input tokens computed simultaneously
- High arithmetic intensity — GPU compute is the bottleneck
- Determines Time To First Token (TTFT)

### Decode Phase (Memory-Bound)
- Generates tokens one at a time (autoregressive)
- Each step reads entire KV cache + model weights
- Low arithmetic intensity — memory bandwidth is the bottleneck
- Determines Inter-Token Latency (ITL) and overall throughput

This prefill/decode asymmetry is THE fundamental architectural tension in LLM serving.

---

## 2. KV Cache: The Core Memory Challenge

During inference, for each attention layer, every generated token produces Key and Value vectors that must be cached for all subsequent tokens. This is the KV cache.

### Memory math (illustrative):
- Model: 70B params, 80 layers, 64 heads, head_dim=128, FP16
- KV per token per layer: 2 × 64 × 128 × 2 bytes = 32 KB
- KV per token (all layers): 32 KB × 80 = 2.56 MB
- Sequence of 2048 tokens: 2.56 MB × 2048 = 5.24 GB per request

At 100 concurrent requests: 524 GB of KV cache — far exceeds a single H100's 80GB.

### The waste problem (pre-PagedAttention):
- Static allocation: reserve max_seq_len memory upfront
- Average utilization: only 20-40% of reserved memory actually used
- External fragmentation: freed blocks create unusable gaps
- Result: 60-80% of GPU memory wasted

---

## 3. PagedAttention — The OS Virtual Memory Analogy

### Key Insight
Apply OS virtual memory paging to KV cache management.

### Mechanism
1. **Fixed-size blocks**: KV cache divided into blocks of B tokens (typically B=16)
2. **Block table**: Maps logical block indices → physical GPU memory addresses (like a page table)
3. **Lazy allocation**: Physical blocks allocated only as tokens are generated
4. **Non-contiguous storage**: Blocks can live anywhere in GPU memory
5. **Reference counting**: Enables sharing (beam search, prefix caching) via copy-on-write

### Memory waste reduction
- Before PagedAttention: 60-80% waste
- After PagedAttention: <4% waste (only last partially-filled block)

### Kernel implementation (vLLM csrc/attention/)
- Custom CUDA kernels that compute attention over non-contiguous KV blocks
- Thread blocks iterate over KV blocks via block table indirection
- Key optimization: indirection complexity confined to K/V fetch phase only
- Once QK scores computed, softmax/value accumulation operate on logical positions

### PagedAttention v2
- Partitions KV blocks across multiple GPU thread blocks per (sequence, head)
- Each thread block computes partial QK scores + local softmax statistics
- Lightweight reduction kernel combines partials
- Eliminates bottleneck at long sequence lengths

---

## 4. vLLM — The Production Default

### Architecture (3 core components)
1. **Scheduler**: Continuous batching, priority queuing, preemption support
   - Dynamically inserts/removes requests at token granularity
   - Enforces --max-num-seqs and --max-model-len
   - Preemption: high-priority requests can evict lower-priority KV blocks

2. **Block Manager**: KV cache memory allocator
   - Owns pool of fixed-size physical blocks
   - Reference counting for shared blocks (prefix caching)
   - Reclaims blocks on request completion

3. **Model Executor**: Forward pass execution
   - Hand-tuned CUDA kernels for paged attention
   - Supports FlashAttention, FlashInfer, TRTLLM-GEN, FlashMLA, Triton backends
   - GEMM/MoE kernels via CUTLASS, CuTeDSL
   - torch.compile for kernel generation + graph transformations

### Key features
- Continuous batching with chunked prefill
- Prefix caching
- Speculative decoding (n-gram, suffix, EAGLE, DFlash)
- Disaggregated prefill/decode
- Tensor/pipeline/data/expert/context parallelism
- Quantization: FP8, MXFP8/MXFP4, NVFP4, INT8, INT4, GPTQ/AWQ, GGUF
- Structured output via xgrammar/guidance
- OpenAI-compatible API + Anthropic Messages API + gRPC

### Production status (2026)
- De facto standard for non-trivial open-weight LLM production deployments
- Used by enterprises and cloud providers
- Cold start: ~62 seconds

---

## 5. SGLang — Structured Generation Optimized

### Architecture
1. **Frontend**: Python-embedded DSL with primitives for gen, select, fork, join
   - Programs complex multi-step generation workflows
   - Compatible with Python control flow

2. **Backend Runtime** (3 sub-components):
   a. Frontend API Server: OpenAI-compatible endpoints
   b. Tokenizer Server: Separate process to avoid blocking GPU
   c. Backend Scheduler: Manages radix tree, batching, GPU execution

### Core Innovation: RadixAttention
- Stores KV cache in a radix tree data structure
- Automatic prefix matching and sharing across requests
- Dynamic allocation (vs vLLM's fixed-size blocks)
- Cache-aware scheduling: prioritizes requests with longer shared prefixes
- Eviction policies: LRU, LFU, FIFO, MRU, FILO, priority-based

### RadixAttention vs PagedAttention
- PagedAttention: fixed-size blocks, explicit prefix caching configuration
- RadixAttention: dynamic tree structure, automatic prefix discovery
- RadixAttention advantage: multi-turn chat, RAG, agentic workflows (shared context)
- RadixAttention limitation: no benefit for unique prompts

### Compressed FSM Decoding
- Analyzes finite-state machine for structured output constraints
- Collapses chains of singular transitions into single edge
- Multiple tokens decoded in one forward pass when only one valid path exists
- Faster + more compliant JSON/XML generation

### Scheduling Policies
- FCFS (First Come First Served)
- LPM (Longest Prefix Match)
- DFS-weight (depth-first with weighting)

### Parallelism
- Tensor, Pipeline, Data, Expert parallelism
- Multi-LoRA batching

### Performance (H100 benchmarks, shared prefix workloads)
- 29% higher throughput than vLLM (16,215 vs 12,553 tok/s)
- 2x+ higher output token throughput
- TTFT: 79ms vs vLLM's 103ms
- Stable under high concurrency (30-31 tok/s constant vs vLLM's 22→16 drop)

### Production status (2026)
- 400,000+ GPUs worldwide (xAI, NVIDIA, AMD, LinkedIn)
- Cold start: ~58 seconds
- Supports NVIDIA GB200/B300/H100/A100, AMD MI355/MI300, Intel Xeon, Google TPU, Ascend NPU

---

## 6. Ollama + llama.cpp — Local Inference Stack

### Architecture
- Ollama: user-friendly wrapper (model registry, lifecycle management, REST API)
- llama.cpp: C/C++ inference engine (the actual execution runtime)
- GGML: tensor computation library inside llama.cpp
- GGUF: standardized model weight format for quantized models

### llama.cpp capabilities
- Hardware: CPU (AVX2/AVX512), NVIDIA (CUDA), AMD (ROCm/HIP), Apple (Metal), RISC-V, Vulkan, SYCL
- Quantization: 1.5-bit to 8-bit integer
- CPU+GPU hybrid inference (partial layer offloading)
- Continuous batching (in server mode)
- Speculative decoding
- Router mode (multiple models behind single endpoint)

### llama.cpp server architecture
- server_context: holds llama_context + all active slots (single-threaded)
- server_slot: abstraction over individual inference sequences
- server_routes: HTTP middleware (JSON parsing, request routing)
- server_queue: thread-safe task queue (HTTP workers → server_context)
- server_response: thread-safe result queue (server_context → HTTP workers)
- server_prompt_checkpoint: KV cache snapshots for prefix reuse

### GGUF Quantization trade-offs
| Scheme | Size reduction | Quality | Recommended |
|--------|---------------|---------|-------------|
| Q4_0   | ~4x           | Good    | Budget      |
| Q4_K_M | ~4x           | Better  | Default     |
| Q5_K_M | ~3.2x         | Very good | Quality-focused |
| Q8_0   | ~2x           | Near-lossless | When VRAM allows |

### Performance (consumer hardware)
- 8B model on RTX 4090: ~95 tok/s
- 32B model on RTX 4090: ~34 tok/s
- Ollama vs raw llama.cpp: identical token generation speed; llama.cpp with tuned flags 10-20% faster

### Ollama vs vLLM/SGLang
- Ollama: sequential processing (one request at a time by default)
- vLLM/SGLang: concurrent batching (many requests simultaneously)
- Ollama target: developer workstation, prototyping
- vLLM/SGLang target: production serving at scale

---

## 6b. FlashAttention — IO-Aware Exact Attention

### Source
- Dao et al., "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", NeurIPS 2022. arXiv:2205.14135
- Dao, "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning", 2023. arXiv:2307.08691
- Shah et al., "FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision", 2024. arXiv:2407.08691

### Core Insight
Standard attention writes O(N²) intermediate results to HBM. FlashAttention restructures the computation to keep everything in SRAM (on-chip), reducing HBM reads/writes from O(N²) to O(N).

### Mechanism
1. **Tiling**: Split Q, K, V into blocks that fit in SRAM
2. **Online softmax**: Compute softmax incrementally per block without materializing full N×N matrix
3. **Recomputation**: On backward pass, recompute attention from Q,K,V in SRAM rather than storing the N×N matrix

### IO Complexity
- Standard attention: O(N² d) HBM accesses (reads/writes the N×N attention matrix)
- FlashAttention: O(N² d² / M) HBM accesses (where M = SRAM size)
- Typical speedup: 2-4x wall-clock, exact results (not approximate)

### FlashAttention-2 improvements
- Better work partitioning across warps within a thread block
- Reduces non-matmul FLOPs (masking, softmax) relative to matmul FLOPs
- Achieves 50-73% of theoretical max FLOPS on A100 (vs 25-40% for FA1)

### FlashAttention-3 improvements (Hopper architecture)
- Exploits asynchronous execution (warp-specialization: producer/consumer warps)
- Uses Tensor Memory Accelerator (TMA) for async data movement
- FP8 quantization for further speed with low precision
- Achieves 740 TFLOPS on H100 (close to theoretical max)

### Relationship to inference
- FlashAttention is used in prefill phase (compute-bound, benefits from FLOPS)
- During decode (single token), attention is inherently memory-bound — FlashAttention helps less
- All major frameworks (vLLM, SGLang, TensorRT-LLM) use FlashAttention or FlashInfer as their attention backend
- FlashInfer (used by SGLang) extends the tiling approach to paged KV cache

---

## 6c. TensorRT-LLM — NVIDIA's Optimized Stack

### Source
- NVIDIA TensorRT-LLM documentation: https://nvidia.github.io/TensorRT-LLM/
- NVIDIA blog: "Optimizing Inference on Large Language Models with NVIDIA TensorRT-LLM" (2024)
- Spheron benchmarks (2026): vLLM vs TensorRT-LLM vs SGLang

### Architecture
1. **Graph compiler**: Converts model definition into optimized execution graph
   - Layer fusion: combines multiple ops into single CUDA kernels
   - Kernel auto-tuning: selects fastest kernel variant for each op + hardware combo
   - Quantization integration: FP8/INT8/INT4 calibration baked into graph
2. **Runtime**: Executes compiled graph with:
   - CUDA Graphs: eliminates kernel launch overhead by capturing entire decode step
   - In-flight batching: similar to continuous batching but at CUDA graph level
   - Multi-GPU: tensor parallelism, pipeline parallelism, expert parallelism
3. **Triton integration**: TensorRT-LLM can use Triton Inference Server as frontend

### Key differentiators from vLLM/SGLang
- Compile-time optimization (ahead-of-time vs JIT)
- Deeper NVIDIA hardware integration (cuBLAS, CUTLASS, CUDA Graphs)
- Higher peak performance but much longer setup time (~28 min cold start vs ~60s)
- Narrower hardware support (NVIDIA only)
- More complex deployment (model compilation step required)

### When to choose TensorRT-LLM
- Maximum throughput on NVIDIA hardware is the priority
- Stable model (not switching models frequently — compilation is expensive)
- Latency-critical applications where 10-15% improvement matters
- Large-scale deployments where efficiency gains amortize setup complexity

---

## 6d. Speculative Decoding

### Source
- Leviathan et al., "Fast Inference from Transformers via Speculative Decoding", ICML 2023. arXiv:2211.17192
- Chen et al., "Accelerating Large Language Model Decoding with Speculative Sampling", 2023. arXiv:2302.01318
- vLLM docs: speculative decoding support (n-gram, draft model, EAGLE, Medusa)

### Core Insight
Decode is slow because it's sequential (one token at a time). But verifying multiple tokens in parallel is fast (it's just a prefill-like forward pass). Speculative decoding exploits this asymmetry.

### Mechanism
1. **Draft model** (small, fast) generates K candidate tokens cheaply
2. **Target model** (large) verifies all K tokens in one parallel forward pass
3. **Accept/reject**: tokens accepted from left-to-right until first rejection
4. **Guarantee**: output distribution is identical to target model alone (no quality loss)

### Acceptance rate determines speedup
- If draft model matches target well → most tokens accepted → near K× speedup
- If draft model diverges → frequent rejections → overhead without gain
- Typical speedup: 2-3x on well-matched pairs

### Variants in production (2026)
- **N-gram speculation**: use existing KV cache to predict next tokens (no draft model needed)
- **EAGLE**: trained draft heads that predict next-token embedding directly
- **Medusa**: multiple prediction heads on target model itself (no separate model)
- **Suffix decoding**: match from prompt/context (good for repetitive outputs)

### Limitations
- Requires extra memory for draft model
- Speedup varies wildly by task (code generation: high acceptance; creative writing: low)
- Verification step has overhead even when all tokens accepted

---

## 6e. Continuous Batching & Scheduling

### Source
- Yu et al., "ORCA: A Distributed Serving System for Transformer-Based Generative Models", OSDI 2022
- Kwon et al., SOSP 2023 (vLLM paper describes continuous batching integration)
- vLLM / SGLang scheduler documentation

### The problem with static batching
- All requests padded to max_seq_len → wasted compute on padding tokens
- Entire batch waits for longest sequence to finish → GPU idle when short sequences complete
- Cannot insert new requests until entire batch is done

### Continuous batching (iteration-level scheduling)
1. After each decode iteration, check for completed/new requests
2. Remove completed sequences immediately (free their KV cache)
3. Insert waiting requests into available slots
4. Each token generation step can have a different batch composition

### Result
- No padding waste
- No waiting for slowest request
- GPU utilization stays high (slots immediately refilled)
- Typical improvement: 3-10x throughput vs static batching

### Chunked Prefill
Problem: Long prompt prefills block the scheduler (no decode happens during prefill)
Solution: Split prefill into chunks, interleave with decode steps of other requests
Trade-off: Slightly higher TTFT for the prefilling request, much better ITL for decode requests

### Scheduling policies
- FCFS (First Come First Served): fair but not optimal for cache reuse
- Longest Prefix Match (SGLang): prioritize requests sharing cached prefixes
- Priority scheduling: SLO-aware, can preempt low-priority requests
- vLLM preemption: when memory pressure hits, evict low-priority KV cache to CPU/swap

---

## 6f. MoE Serving — Expert Parallelism

### Source
- Shazeer et al., "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer", ICLR 2017
- DeepSeek-V3 technical report (2024): 671B total params, 37B active
- DeepSeek EPLB (Expert-Parallel Load Balancing): https://github.com/deepseek-ai/eplb
- vLLM Expert Parallel documentation

### What makes MoE serving unique
- Total params >> active params (e.g., DeepSeek-V3: 671B total, 37B active per token)
- All expert weights must be loaded in memory even though most are idle per token
- Tokens must be routed to the GPU holding their assigned expert
- Bottleneck shifts from compute to memory capacity + inter-GPU communication

### Expert Parallelism
- Distribute experts across GPUs (each GPU holds a subset of experts)
- All-to-all communication: send tokens to the GPU holding their expert
- Each GPU processes only the tokens routed to its local experts
- Return results via another all-to-all

### The load balancing problem
- Real workloads have skewed expert popularity (some experts receive 5-10x more tokens)
- Naive distribution → hot GPUs stall the batch
- EPLB (Expert-Parallel Load Balancing): replicate popular experts on multiple GPUs
  - Monitors routing statistics
  - Dynamically adjusts expert placement
  - Balances compute load across all GPUs

### Memory challenge
- DeepSeek-V3 on 8×H100: 671B params × 2 bytes = 1.34 TB (barely fits 8×80GB HBM)
- Expert weights dominate memory (256 experts × param_size_per_expert)
- Offloading cold experts to CPU/NVMe is one approach but adds latency

---

## 7. Inference Optimization Technique Stack

### System-Level Optimizations
| Technique | What it reduces | Typical improvement |
|-----------|----------------|---------------------|
| Continuous Batching | GPU idle time | 3-10x throughput |
| PagedAttention | KV cache memory waste | Up to 24x throughput |
| Speculative Decoding | Decode latency | 2-5x speed |
| Prefix Caching | Redundant prefill compute | 80-90% latency on cached |
| Disaggregated Serving | Prefill-decode interference | Independent scaling |
| Chunked Prefill | Memory spikes during long prefills | Smoother memory usage |

### Model-Level Optimizations
| Technique | What it reduces | Typical improvement |
|-----------|----------------|---------------------|
| Quantization | Memory per parameter | 2-4x memory, ~50% cost |
| GQA/MQA | KV cache size | 8x less KV memory |
| MLA (Multi-head Latent Attention) | KV cache size | Further compression |
| Pruning | Model parameters | Variable |
| Distillation | Model size | Variable |

### Application-Level Optimizations
| Technique | What it reduces | Typical improvement |
|-----------|----------------|---------------------|
| Context Compaction | Input tokens | 50-70% token reduction |
| Prompt Caching | Redundant prefill | 80-90% latency |
| Model Routing | Cost per request | 2-5x savings |

---

## 8. Comparative Benchmarks (H100 80GB, 2026)

### Throughput (unique prompts, tokens/second)
| Concurrency | vLLM | SGLang | TensorRT-LLM |
|-------------|------|--------|--------------|
| 1           | 120  | 125    | 130          |
| 10          | 650  | 680    | 710          |
| 50          | 1,850| 1,920  | 2,100        |
| 100         | 2,400| 2,460  | 2,780        |

### TTFT p50 (ms)
| Concurrency | vLLM | SGLang | TensorRT-LLM |
|-------------|------|--------|--------------|
| 1           | 45   | 42     | 38           |
| 10          | 120  | 112    | 105          |
| 50          | 380  | 360    | 340          |
| 100         | 740  | 710    | 680          |

### Decision Matrix
| Criterion | vLLM | SGLang | TensorRT-LLM | Ollama |
|-----------|------|--------|--------------|--------|
| Best for | General production | Shared-prefix workloads | Max NVIDIA perf | Local dev |
| Ease of use | Easy | Easy | Hard | Easiest |
| Model support | Broadest | Broad | Selective | Broad (GGUF) |
| Hardware | NVIDIA, AMD, TPU+ | NVIDIA, AMD, TPU, NPU | NVIDIA only | CPU, any GPU |
| Cold start | ~62s | ~58s | ~28min | Instant |
| Structured output | Via xgrammar | Native (compressed FSM) | Via plugin | Basic |
| Concurrent requests | Yes | Yes | Yes | Sequential |

---

## 9. Disaggregated Prefill-Decode

### The problem
Running prefill and decode on the same GPU causes interference:
- Long prefill stalls decode steps for other requests
- Different optimal batch sizes and hardware requirements

### The solution
Physically separate phases onto distinct worker pools:
- Prefill workers: high-compute GPUs (H100), large batches
- Decode workers: high-memory-bandwidth GPUs, small batches, continuous batching
- KV cache transfer via high-speed interconnect (NVLink, InfiniBand)

### Status (2026)
- vLLM: supports disaggregated prefill/decode
- Meta: actively developing with vLLM team
- Trade-off: KV cache transfer overhead vs separation benefit
- Research shows: higher energy consumption than colocated serving in some configs

---

## 10. Key Relationships to Compiler Research

### PagedAttention ↔ OS Virtual Memory
- Direct analogy: page table = block table, virtual page = logical block, physical frame = physical block
- Copy-on-write for shared prefixes ≈ CoW for forked processes

### Attention Kernels ↔ GPU Programming
- Custom CUDA kernels with careful memory coalescing
- Shared memory vs global memory hierarchy
- Thread block / warp organization for attention computation

### Disaggregated Serving ↔ Distributed Systems
- Prefill/decode separation ≈ pipeline parallelism
- KV cache migration ≈ state transfer in distributed systems

### Structured Generation ↔ Compiler Theory
- FSM-based constrained decoding ≈ DFA-guided parsing
- SGLang's compressed FSM ≈ NFA→DFA minimization
- Grammar-guided generation ≈ parser-directed synthesis
