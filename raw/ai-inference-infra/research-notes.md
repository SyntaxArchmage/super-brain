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
