const WIKI_CN = {
  "taxonomy": [
    {
      "id": "foundations",
      "label": "基础",
      "children": [
        {
          "id": "inference-landscape",
          "label": "推理问题",
          "type": "article"
        },
        {
          "id": "kv-cache",
          "label": "KV Cache 与内存",
          "type": "article"
        },
        {
          "id": "paged-attention",
          "label": "PagedAttention",
          "type": "article"
        },
        {
          "id": "flash-attention",
          "label": "FlashAttention",
          "type": "article"
        }
      ]
    },
    {
      "id": "frameworks",
      "label": "Serving 框架",
      "children": [
        {
          "id": "vllm",
          "label": "vLLM",
          "type": "article"
        },
        {
          "id": "sglang",
          "label": "SGLang",
          "type": "article"
        },
        {
          "id": "tensorrt-llm",
          "label": "TensorRT-LLM",
          "type": "article"
        },
        {
          "id": "ollama-llamacpp",
          "label": "Ollama 与 llama.cpp",
          "type": "article"
        }
      ]
    },
    {
      "id": "optimization",
      "label": "优化技术",
      "children": [
        {
          "id": "batching-scheduling",
          "label": "批处理与调度",
          "type": "article"
        },
        {
          "id": "speculative-decoding",
          "label": "Speculative Decoding",
          "type": "article"
        },
        {
          "id": "disaggregated-serving",
          "label": "分离式 Serving",
          "type": "article"
        },
        {
          "id": "moe-serving",
          "label": "MoE Serving",
          "type": "article"
        }
      ]
    },
    {
      "id": "comparison",
      "label": "对比与选型",
      "children": [
        {
          "id": "benchmarks",
          "label": "基准测试与权衡",
          "type": "article"
        }
      ]
    }
  ],
  "pages": {
    "index": {
      "title": "AI 推理基础设施",
      "subtitle": "从 PagedAttention 到生产级 Serving——对大语言模型推理的框架、内存管理与优化技术进行的系统性综述。"
    },
    "inference-landscape": {
      "title": "推理问题",
      "subtitle": "为什么 LLM 推理很难：prefill/decode 不对称、自回归生成，以及延迟、吞吐量与内存之间的根本张力。",
      "body": "<h2>两个阶段，两种瓶颈</h2>\n<p>LLM 推理并非单一运算——它是共享同一块 GPU 的两个计算特性截然不同的阶段。理解这一划分，是理解本维基中每一项优化的前提。</p>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>摘自 PagedAttention 论文（Kwon 等，SOSP 2023）：「每个请求的 key-value cache（KV cache）内存非常庞大，且动态增长与收缩。若管理低效，碎片化与冗余复制会造成显著浪费，从而限制批大小。」</p>\n</div>\n\n<h3>Prefill 阶段——计算受限</h3>\n<p>Prefill 阶段在单次并行前向传播中处理整个输入 prompt。所有输入 token 同时参与 attention。GPU 算术单元成为瓶颈，内存带宽利用率偏低。该阶段耗时决定<em>首 token 时间（TTFT）</em>——用户在看到任何输出前所感知的延迟。</p>\n\n<h3>Decode 阶段——内存受限</h3>\n<p>Decode 阶段自回归地逐 token 生成。每一步需读取整个 KV cache（所有 attention 层中此前生成的 key 与 value）以及模型权重，但计算量相对较小。内存带宽成为瓶颈——GPU 计算单元大多空闲。每步 decode 速度决定<em>Token 间延迟（ITL）</em>，聚合 decode 吞吐量决定<em>每秒 token 数（tok/s）</em>。</p>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>这种不对称性是 LLM serving 中<em>最根本</em>的架构张力。continuous batching、分离式 serving、speculative decoding、prefix caching 等主流框架优化，都是在试图调和这两个阶段在共享资源上的矛盾硬件需求。</p>\n</div>\n\n<h2>关键指标</h2>\n<p>四项指标定义 LLM serving 系统的质量。它们相互权衡，不同应用侧重不同：</p>\n\n<table>\n<tr><th>指标</th><th>定义</th><th>瓶颈</th><th>最适用于</th></tr>\n<tr><td><strong>TTFT</strong></td><td>首 token 时间——从请求到首个输出 token 的延迟</td><td>Prefill 计算</td><td>交互式聊天、流式 UI</td></tr>\n<tr><td><strong>ITL</strong></td><td>Token 间延迟——连续输出 token 之间的时间</td><td>Decode 内存带宽</td><td>感知流畅度</td></tr>\n<tr><td><strong>TPOT</strong></td><td>每输出 token 时间——整段生成的平均值</td><td>两者兼有</td><td>整体响应性</td></tr>\n<tr><td><strong>Throughput</strong></td><td>所有并发请求的总 token/秒</td><td>GPU 利用率</td><td>大规模成本效率</td></tr>\n</table>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>关键区分：throughput 衡量系统聚合效率（所有用户合计），而 TTFT/ITL 衡量单用户体验。若批处理过于激进，系统 throughput 可以很高，但单用户延迟很差。生产部署须同时优化两者，通常需跟踪 TTFT p50/p95 与聚合 tok/s。</p>\n</div>\n\n<h2>算术强度模型（Roofline）</h2>\n<pre>H100 SXM Roofline:\n  Peak compute: 990 TFLOPS (FP16)\n  Peak bandwidth: 3.35 TB/s (HBM3)\n  Ridge point: 990 / 3.35 = 295 FLOPs/byte\n\nPrefill (compute-bound):\n  Ops: 2 × params × tokens  (e.g. 2 × 70B × 2048 = 287 TFLOPS)\n  Bytes: model weights = 140GB (read once, amortized over tokens)\n  Intensity: 287T / 140G ≈ 2050 FLOPs/byte → above ridge → GPU saturated ✓\n\nDecode (memory-bound):\n  Ops: 2 × params × 1  (e.g. 2 × 70B × 1 = 140 GFLOPS per token)\n  Bytes: model weights + KV = 140GB + KV per step\n  Intensity: 140G / 140G ≈ 1 FLOP/byte → far below ridge → bandwidth bottleneck\n  Theoretical max: 3.35 TB/s / 140 GB = 24 tokens/sec (single request)</pre>\n\n<p>这解释了为何 batching 是 decode 吞吐量的主要杠杆：单次前向处理 128 个请求时，权重只读一次却生成 128 个 token——有效算术强度乘以批大小。</p>\n\n<h2>加更多 GPU 就够了吗？</h2>\n<p>水平扩展（更多副本）有助于 throughput，但无法降低单请求延迟。垂直扩展（更大 GPU）增加内存容量，但当大量并发请求携带长上下文时，H100 的 80GB HBM 仍是 KV cache 的硬约束。真正的杠杆在于<em>更高效地使用内存</em>——这正是 PagedAttention、prefix caching 与量化所实现的。</p>"
    },
    "kv-cache": {
      "title": "KV Cache 与内存",
      "subtitle": "推理期间占据 GPU 内存主导的 attention 缓存——为何无限增长、成本几何级、以及高效管理为何是核心挑战。",
      "body": "<h2>KV Cache 是什么</h2>\n<p>在自回归生成中，每个 Transformer attention 层为每个 token 计算 Key 与 Value 向量。这些向量必须保存，因为未来每个 token 都需要 attend 到它们。跨所有层、所有 token 的累积存储即为<em>KV cache</em>。</p>\n\n<p>若不缓存，生成第 <em>n</em> 个 token 需对所有前 <em>n-1</em> 个 token 重新计算 attention——每 token O(n²) 计算。KV cache 以内存换计算，将其降为 O(n)。</p>\n\n<h2>内存算术</h2>\n<p>每 token 的 KV cache 大小由模型架构决定：</p>\n<pre>KV per token per layer = 2 × num_kv_heads × head_dim × sizeof(dtype)\nKV per token (all layers) = above × num_layers</pre>\n\n<p>70B 模型的具体示例（80 层，64 个 KV head，head_dim=128，FP16）：</p>\n<table>\n<tr><th>量</th><th>计算</th><th>结果</th></tr>\n<tr><td>每层每 token KV</td><td>2 × 64 × 128 × 2 bytes</td><td>32 KB</td></tr>\n<tr><td>所有层每 token KV</td><td>32 KB × 80</td><td>2.56 MB</td></tr>\n<tr><td>单请求（2048 token）</td><td>2.56 MB × 2048</td><td>5.24 GB</td></tr>\n<tr><td>100 个并发请求</td><td>5.24 GB × 100</td><td>524 GB</td></tr>\n</table>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>单张 H100 有 80 GB HBM。70B 模型 FP16 权重约 140 GB（至少需 2 张 GPU 做 tensor parallelism）。每张 GPU 剩余给 KV cache 的内存或许只有 10–15 GB——在 2K 上下文下仅够 2–3 个并发请求。因此 KV cache 内存管理是最具影响力的优化目标。</p>\n</div>\n\n<h2>内存浪费问题</h2>\n<p>PagedAttention 之前，系统按每个请求的最大可能序列长度预分配 KV cache 内存，造成三类浪费：</p>\n\n<ol>\n<li><strong>内部碎片</strong>：多数请求生成的 token 远少于上限——未使用的预分配内存闲置。</li>\n<li><strong>外部碎片</strong>：不同长度请求完成并释放内存后，剩余空闲空间被切成无法满足新请求的非连续碎片。</li>\n<li><strong>冗余复制</strong>：共享相同 system prompt 或上下文的请求各自存储相同 KV cache——没有共享机制。</li>\n</ol>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>PagedAttention 论文指出：「现有系统因碎片化与过度预留浪费 60%–80% 的 KV cache 内存。」这直接限制批大小，进而限制 serving 系统吞吐量。</p>\n</div>\n\n<h2>GQA 与 MLA：架构级 KV 缩减</h2>\n<p>Grouped-Query Attention（GQA）与 Multi-head Latent Attention（MLA）在模型架构层面缩减 KV cache 大小：</p>\n\n<pre>KV cache comparison (70B model, 80 layers, 2048 context, FP16):\n\nMHA (Multi-Head Attention) — 64 KV heads:\n  per token: 2 × 80 × 64 × 128 × 2 bytes = 2.62 MB\n  at 2K: 2.62 MB × 2048 = 5.37 GB per request\n\nGQA (Grouped-Query) — 8 KV heads (Llama 3):\n  per token: 2 × 80 × 8 × 128 × 2 bytes = 327 KB  (8× smaller)\n  at 2K: 327 KB × 2048 = 654 MB per request\n\nMLA (Multi-head Latent) — DeepSeek V3, latent_dim=512:\n  per token: 80 × 512 × 2 bytes = 80 KB  (32× smaller than MHA)\n  at 2K: 80 KB × 2048 = 160 MB per request\n\nImpact on batch size (H100, 15GB available for KV):\n  MHA:  15 GB / 5.37 GB = 2 concurrent requests\n  GQA:  15 GB / 654 MB  = 22 concurrent requests\n  MLA:  15 GB / 160 MB  = 93 concurrent requests</pre>\n\n<p>GQA 让多个 query head 共享 K/V head（如 Llama 3 用 8 个 KV head 对应 64 个 query head——8 倍缩减）。MLA（DeepSeek 采用）将 KV 压缩到学习的低秩潜空间。这些与 PagedAttention 等系统级优化正交——可叠加生效。</p>"
    },
    "paged-attention": {
      "title": "PagedAttention",
      "subtitle": "改变 LLM serving 的操作系统洞见：将 KV cache 内存当作带按需分页、块表与 copy-on-write 的虚拟内存来管理。",
      "body": "<h2>虚拟内存类比</h2>\n<p>20 世纪 60 年代，OS 设计者为 CPU 进程解决了同样的问题：可变大小内存需求、碎片化与共享需求。解法是<em>带分页的虚拟内存</em>——直接映射到 KV cache 管理：</p>\n\n<table>\n<tr><th>OS 概念</th><th>PagedAttention 对应</th></tr>\n<tr><td>虚拟页</td><td>逻辑 KV 块（B 个 token 的 K 与 V）</td></tr>\n<tr><td>物理帧</td><td>物理 GPU 内存块</td></tr>\n<tr><td>页表</td><td>块表（逻辑 → 物理映射）</td></tr>\n<tr><td>按需分页</td><td>惰性块分配（仅随 token 生成而分配）</td></tr>\n<tr><td>Copy-on-write</td><td>共享前缀块（beam search、prefix caching）</td></tr>\n<tr><td>页置换</td><td>内存压力下块驱逐</td></tr>\n</table>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>论文写道：「PagedAttention 允许 attention 的 key 与 value 存储在非连续分页内存中……受操作系统虚拟内存与分页技术启发。」发表于 SOSP（顶级 OS 会议），这一 framing 是有意的——贡献在于将 OS 内存管理应用于 GPU 推理，而非发明新 attention 机制。</p>\n</div>\n\n<h2>工作原理</h2>\n<h3>1. 块级分配</h3>\n<p>KV cache 划分为固定大小块，每块容纳 B 个 token 的 K 与 V 向量（通常 B=16）。块可位于 GPU 内存任意位置——无需连续。</p>\n\n<h3>2. 块表间接寻址</h3>\n<p>每个请求维护块表：逻辑块索引到 GPU 物理块地址的映射。attention kernel 需要位置 <em>t</em> 的 KV 时，计算 <code>logical_block = t / B</code>，从块表查物理地址并读取。</p>\n\n<h3>3. 惰性（按需）分配</h3>\n<p>仅当请求填满当前块并需要下一块时才分配物理块。消除按 max_seq_len 预分配造成的过度预留浪费。</p>\n\n<h3>4. Copy-on-Write 共享</h3>\n<p>多个请求共享前缀（如相同 system prompt）时，块表指向相同物理块。仅当输出分叉时才分配新块。引用计数跟踪共享，最后一个引用释放时回收块。</p>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>PagedAttention 的优雅之处在于间接寻址复杂度被限制在单一、边界清晰的层。块表查找发生在 attention kernel 的 K/V 读取阶段。QK 分数计算并写入按逻辑位置索引的数组后，softmax 与 value 累加与非分页 attention 完全相同——对物理块位置无感知。这种封装使 PagedAttention 开销极小。</p>\n</div>\n\n<h2>CUDA Kernel</h2>\n<p>vLLM 实现自定义 CUDA kernel（<code>csrc/attention/attention_kernels.cu</code>），在分页 KV 块上计算多头 attention。关键设计：</p>\n\n<ul>\n<li>每个 GPU thread block 处理一个（序列，head）对</li>\n<li>warp 内线程协作从块表取 K/V</li>\n<li>块内 K token 布局利于合并内存访问</li>\n<li>V token 转置（列 = token）以高效做点积累加</li>\n<li>共享内存存中间 QK logits</li>\n</ul>\n\n<pre>// Simplified PagedAttention kernel logic (pseudocode)\n// Full implementation: vllm/csrc/attention/attention_kernels.cu\n\n__global__ void paged_attention_kernel(\n    float* __restrict__ out,          // [num_seqs, num_heads, head_size]\n    const float* __restrict__ q,      // query vectors\n    const float* __restrict__ k_cache, // [num_blocks, block_size, num_kv_heads, head_size]\n    const float* __restrict__ v_cache, // [num_blocks, block_size, num_kv_heads, head_size]\n    const int* __restrict__ block_tables, // [num_seqs, max_num_blocks]\n    const int* __restrict__ seq_lens,\n    const float scale)\n{\n    const int seq_idx = blockIdx.x;\n    const int head_idx = blockIdx.y;\n    const int num_tokens = seq_lens[seq_idx];\n\n    float qk_max = -INFINITY;\n    // Phase 1: compute QK scores across all paged blocks\n    for (int block_idx = 0; block_idx < num_tokens / BLOCK_SIZE; block_idx++) {\n        int physical_block = block_tables[seq_idx * max_blocks + block_idx];\n        // ↑ THIS is the paging indirection: logical → physical\n        float* k_block = k_cache + physical_block * block_stride;\n        // dot product Q·K for tokens in this block...\n    }\n    // Phase 2: softmax + weighted sum of V (same paging indirection)\n}</pre>\n\n<h3>PagedAttention v2</h3>\n<p>长序列下 KV 块数超过单个 thread block 容量时，v2 将块分区到多个 thread block。各自计算部分 QK 分数与局部 softmax 统计，轻量归约 kernel 合并部分结果。消除长上下文下的串行瓶颈。</p>\n\n<h2>影响</h2>\n<p>内存浪费从 60–80% 降至 4% 以下（仅每序列最后一个未满块）。直接转化为批大小：相同 GPU 内存预算下，PagedAttention 可多承载 2–4× 并发请求，吞吐量相应提升 2–4×。至 2026 年，PagedAttention 已是 vLLM、SGLang、TensorRT-LLM 与 NVIDIA NIM 的标准基础设施。</p>"
    },
    "flash-attention": {
      "title": "FlashAttention",
      "subtitle": "IO 感知的精确 attention：分块计算、融合为单 kernel、永不将 N×N attention 矩阵物化到 HBM——实现 2–4× 墙钟加速与线性内存。",
      "body": "<h2>Attention 中的内存墙问题</h2>\n<p>标准 attention 计算 Q·K<sup>T</sup>（N×N 矩阵）、softmax、再乘 V。序列长度 N=8192 时，中间 attention 矩阵每 head 6700 万项——从 GPU HBM 读写主导运行时间，而非实际算术。</p>\n\n<p>FlashAttention 的洞见：瓶颈是<em>内存 IO</em>，不是计算。GPU 计算吞吐（如 H100 989 TFLOPS）远高于内存带宽（3.35 TB/s）。目标是重构 attention，使数据留在快速片上 SRAM（约 20 MB），避免往返慢速 HBM（约 80 GB）。</p>\n\n<h2>算法</h2>\n<h3>两项关键技术</h3>\n<ol>\n<li><strong>分块 + 在线 Softmax</strong>：将 Q、K、V 切成适合 SRAM 的块。逐块处理 attention，用「在线 softmax」技巧（跟踪运行 max 与 sum）增量计算部分 softmax。永不形成完整 N×N 矩阵。</li>\n<li><strong>重计算</strong>：前向不存 attention 矩阵。反向从 Q、K、V 块重算（便宜——留在 SRAM）。以 FLOPs 换内存，但瓶颈本是内存 IO，净收益为正。</li>\n</ol>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>FlashAttention 论文（Dao 等，2022）：「尽管重计算增加 FLOPs，算法仍更快（GPT-2 上最高 7.6×）且内存更少——序列长度线性——得益于 HBM 访问量的大幅减少。」</p>\n</div>\n\n<h3>IO 复杂度</h3>\n<p>FlashAttention 需 O(N²d²M⁻¹) 次 HBM 访问，d 为 head 维度，M 为 SRAM 大小。标准 attention 需 Ω(Nd + N²)。典型值（d=128，M≈100KB）下，FlashAttention HBM 访问最多少 9 倍。论文证明这在渐近意义上对精确 attention 是最优的。</p>\n\n<pre># Using FlashAttention in practice (PyTorch 2.0+)\nimport torch\nfrom torch.nn.functional import scaled_dot_product_attention\n\n# PyTorch now dispatches to FlashAttention automatically\n# when inputs are on CUDA and contiguous\nq = torch.randn(batch, heads, seq_len, head_dim, device=\"cuda\", dtype=torch.float16)\nk = torch.randn(batch, heads, seq_len, head_dim, device=\"cuda\", dtype=torch.float16)\nv = torch.randn(batch, heads, seq_len, head_dim, device=\"cuda\", dtype=torch.float16)\n\n# This automatically uses FlashAttention when available\nout = scaled_dot_product_attention(q, k, v, is_causal=True)\n\n# Or use the flash_attn library directly for more control:\nfrom flash_attn import flash_attn_func\nout = flash_attn_func(q, k, v, causal=True)  # same result, explicit FlashAttention</pre>\n\n<h2>演进</h2>\n<table>\n<tr><th>版本</th><th>关键改进</th><th>性能</th></tr>\n<tr><td>FlashAttention (2022)</td><td>分块 + 在线 softmax + 重计算</td><td>~124 TFLOPS (A100)</td></tr>\n<tr><td>FlashAttention-2 (2023)</td><td>序列长度并行、更优工作划分</td><td>~350 TFLOPS (A100)</td></tr>\n<tr><td>FlashAttention-3 (2024)</td><td>Hopper 专用：WGMMA + TMA + ping-pong 调度 + FP8</td><td>~740 TFLOPS (H100)</td></tr>\n</table>\n\n<h3>Hopper 上的 FlashAttention-3</h3>\n<p>FlashAttention-3 利用 H100 专用硬件：</p>\n<ul>\n<li><strong>WGMMA</strong>（Warpgroup Matrix-Multiply-Accumulate）：4 个 warp（128 线程）作为单元达到峰值 Tensor Core 吞吐</li>\n<li><strong>TMA</strong>（Tensor Memory Accelerator）：HBM 到 SRAM 的硬件加速数据搬运，释放寄存器</li>\n<li><strong>Ping-pong 调度</strong>：两个 warpgroup 交替——一个做 GEMM（Q·K<sup>T</sup>），另一个做 softmax，重叠计算与非 Tensor Core 工作</li>\n<li><strong>FP8 非相干处理</strong>：块量化到 FP8 获约 2× TFLOPS；随机正交矩阵分散离群值以保持精度</li>\n</ul>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p><strong>FlashAttention vs PagedAttention</strong>：解决不同问题且互补。FlashAttention 优化<em>如何计算 attention</em>（单次 attention 内的 IO 感知分块）。PagedAttention 优化<em>如何管理 KV cache 内存</em>（跨请求的非连续块）。生产系统同时使用：vLLM 用 FlashAttention 作 attention 后端，用 PagedAttention 块管理器管理 KV cache。FlashAttention 让每次 attention 快；PagedAttention 让跨请求内存高效。</p>\n</div>"
    },
    "vllm": {
      "title": "vLLM",
      "subtitle": "生产默认推理引擎：基于 PagedAttention 的内存管理、continuous batching，以及定义 LLM serving 品类的模块化执行栈。",
      "body": "<h2>vLLM 是什么</h2>\n<p>vLLM 是围绕 PagedAttention 构建的开源高吞吐 LLM 推理与 serving 引擎。2023 年 6 月由 UC Berkeley 发布，至 2026 年已成为生产级开源权重模型部署的事实标准——企业自托管与云厂商底层都在用的推理引擎。</p>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>insightfulaiworld.com（2026）：「两年后，vLLM 是运行大多数非平凡开源权重 LLM 部署的推理服务器。企业自托管用它，云厂商底层用它。2026 年，它是『我们要在生产中 serving 开源权重模型』的默认答案。」</p>\n</div>\n\n<h2>架构：三大核心组件</h2>\n\n<h3>1. Scheduler</h3>\n<p>Scheduler 每轮迭代决定哪些请求运行、哪些等待。以 token 粒度通过 continuous batching 运作——当前迭代一结束，新请求即可进入运行批，无需等整批完成。</p>\n<ul>\n<li><strong>优先级队列</strong>：按优先级排序，策略可配置</li>\n<li><strong>抢占</strong>：高优先级到达可暂停低优先级请求并驱逐其 KV 块以释放 GPU 内存</li>\n<li><strong>准入控制</strong>：强制执行 <code>--max-num-seqs</code> 与 <code>--max-model-len</code> 防止 OOM</li>\n</ul>\n\n<h3>2. Block Manager</h3>\n<p>KV cache 内存分配器。拥有固定大小物理块池，按需分配给请求，跟踪共享块引用计数（prefix caching、beam search），请求完成时回收块。这是 PagedAttention 内存模型的直接实现。</p>\n\n<h3>3. Model Executor</h3>\n<p>执行实际模型前向。vLLM 为 attention 路径提供适配分页 KV 布局的优化 CUDA kernel。模型其余部分（MLP、归一化、embedding）用 PyTorch 加自定义优化。</p>\n<ul>\n<li><strong>Attention 后端</strong>：FlashAttention、FlashInfer、TRTLLM-GEN、FlashMLA、Triton</li>\n<li><strong>GEMM/MoE kernel</strong>：CUTLASS、TRTLLM-GEN、CuTeDSL</li>\n<li><strong>编译</strong>：torch.compile 自动 kernel 生成与图变换</li>\n<li><strong>图捕获</strong>：分段与完整 CUDA/HIP graph 降低 kernel 启动开销</li>\n</ul>\n\n<h2>关键特性（2026）</h2>\n<table>\n<tr><th>类别</th><th>特性</th></tr>\n<tr><td>内存</td><td>PagedAttention、prefix caching、chunked prefill</td></tr>\n<tr><td>解码</td><td>Speculative decoding（n-gram、suffix、EAGLE、DFlash）、结构化输出（xgrammar/guidance）</td></tr>\n<tr><td>并行</td><td>Tensor、pipeline、data、expert、context parallelism</td></tr>\n<tr><td>量化</td><td>FP8、MXFP8/MXFP4、NVFP4、INT8、INT4、GPTQ/AWQ、GGUF、compressed-tensors、TorchAO</td></tr>\n<tr><td>Serving</td><td>分离式 prefill/decode、continuous batching、流式输出</td></tr>\n<tr><td>API</td><td>OpenAI 兼容 HTTP、Anthropic Messages API、gRPC</td></tr>\n<tr><td>硬件</td><td>NVIDIA（H100/A100/B300）、AMD（MI300/MI355）、Google TPU、Intel CPU</td></tr>\n</table>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>vLLM 的战略优势是广度：最广模型支持、最广硬件支持、最广特性集。单项 benchmark 未必最快，但是最稳妥的默认——给定模型/硬件/量化组合很少跑不起来。堪称「LLM serving 的 Linux」——未必单项最强，但各方面都够好。</p>\n</div>\n\n<h2>生产部署</h2>\n<pre>vllm serve meta-llama/Llama-3.1-70B-Instruct \\\n  --tensor-parallel-size 4 \\\n  --max-model-len 8192 \\\n  --port 8000</pre>\n<p>冷启动：约 62 秒。水平扩展：多副本 + 负载均衡 + 会话亲和。Kubernetes：用 HPA 基于自定义队列深度指标。</p>"
    },
    "sglang": {
      "title": "SGLang",
      "subtitle": "Structured Generation Language：Python 嵌入式前端 + 基于 RadixAttention 的运行时，通过自动 KV cache 复用在多轮、RAG 与 agent 工作负载上表现突出。",
      "body": "<h2>SGLang 是什么</h2>\n<p>SGLang（Structured Generation Language）是 UC Berkeley 与 LMSYS 开发的 LLM 与多模态 serving 框架。它将用于编程复杂生成工作流的 Python 嵌入式前端与高度优化的后端运行时结合。核心差异是<em>RadixAttention</em>——基于 radix 树的 KV cache 管理系统，自动发现并复用跨请求的共享计算。</p>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>SGLang 论文：「我们提出 SGLang，用于高效编程与执行结构化语言模型程序。SGLang 通过 RadixAttention、压缩有限状态机与语言解释器等新优化，显著提升复杂 LM 程序的吞吐量与延迟。」</p>\n</div>\n\n<h2>架构</h2>\n\n<h3>前端：编程原语</h3>\n<p>SGLang 在 Python 中嵌入 DSL，提供：</p>\n<ul>\n<li><code>gen</code>：生成文本，可选约束</li>\n<li><code>select</code>：从选项集中选择</li>\n<li><code>fork</code> / <code>join</code>：并行 prompt 执行</li>\n<li>完整 Python 控制流（循环、条件、函数组合）</li>\n</ul>\n<p>可表达复杂多步工作流——RAG 管道、chain-of-thought、tree-of-thought、agent 工具调用——以程序而非单次 API 调用呈现。</p>\n\n<h3>后端运行时（3 组件）</h3>\n<ol>\n<li><strong>Frontend API Server</strong>：OpenAI 兼容端点——现有代码无需修改</li>\n<li><strong>Tokenizer Server</strong>：独立进程运行，避免阻塞 GPU 执行</li>\n<li><strong>Backend Scheduler</strong>：管理 radix 树、决定批处理、编排 GPU 执行</li>\n</ol>\n\n<h2>核心创新：RadixAttention</h2>\n<pre># SGLang frontend: programming complex generation workflows\nimport sglang as sgl\n\n@sgl.function\ndef multi_turn_chat(s, system_prompt, questions):\n    s += sgl.system(system_prompt)    # shared across all turns\n    for q in questions:\n        s += sgl.user(q)\n        s += sgl.assistant(sgl.gen(\"answer\", max_tokens=256))\n\n# Under the hood: the system_prompt KV cache is computed ONCE\n# and reused across all subsequent turns via RadixAttention.\n# Without RadixAttention: each turn re-computes the system prompt.\n\n# Structured output with compressed FSM:\n@sgl.function\ndef extract_json(s, text):\n    s += \"Extract structured data:\\n\" + text\n    s += sgl.gen(\"result\", regex=r'{\"name\": \"[^\"]+\", \"age\": \\d+}')\n    # FSM compresses deterministic token sequences ('\"name\": \"')\n    # into single steps → fewer forward passes for structured output</pre>\n\n<p>RadixAttention 将 KV cache 存入<em>radix 树</em>——压缩 trie，每个节点代表一段 token 序列及其 KV cache 页。实现：</p>\n\n<ul>\n<li><strong>自动前缀检测</strong>：新请求到达时遍历树找最长匹配前缀。无需手动配置——自动发现共享。</li>\n<li><strong>缓存感知调度</strong>：优先处理共享前缀更长的请求（Longest Prefix Match 策略），近似深度优先遍历以最大化缓存复用。</li>\n<li><strong>动态内存分配</strong>：不同于 PagedAttention 固定块，RadixAttention 按实际前缀长度分配内存。</li>\n</ul>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p><strong>RadixAttention vs PagedAttention</strong>：不同层次的互补概念。PagedAttention 解决底层内存分配（非连续块、惰性分配、引用计数）。RadixAttention 解决更高层缓存复用（发现哪些前缀共享、调度以最大化复用）。SGLang 内部实际使用分页内存——RadixAttention 是使前缀查找高效的树索引。真正创新是组合：分页块上的 radix 树 + 改变请求顺序以放大复用的缓存感知调度。</p>\n</div>\n\n<h2>压缩 FSM 解码</h2>\n<p>结构化输出（JSON、XML）时，SGLang 将约束语法分析为有限状态机，把确定性转移链——仅有一个合法下一 token 的连续段——压缩为单边。解码进入此类压缩链时，单次前向可发出多个 token，而非逐 token。</p>\n\n<p>既更快（更少前向次数）又更合规（结构可证明合法）。</p>\n\n<h2>调度策略</h2>\n<table>\n<tr><th>策略</th><th>方法</th><th>最适用于</th></tr>\n<tr><td>FCFS</td><td>先来先服务</td><td>公平性、多样 prompt</td></tr>\n<tr><td>LPM</td><td>最长前缀匹配优先</td><td>最大化缓存复用</td></tr>\n<tr><td>DFS-weight</td><td>带权重的深度优先</td><td>缓存与公平平衡</td></tr>\n</table>\n\n<h2>性能</h2>\n<p>H100 上共享前缀工作负载（RadixAttention 设计场景）：</p>\n<ul>\n<li>吞吐量比 vLLM 高 29%（16,215 vs 12,553 tok/s）</li>\n<li>输出 token 吞吐量 2×+（893 vs 413 tok/s）</li>\n<li>TTFT：79ms vs vLLM 103ms</li>\n<li>高并发稳定：30–31 tok/s 恒定 vs vLLM 从 22 降至 16 tok/s</li>\n</ul>\n<p>唯一 prompt（无前缀共享）时，SGLang 与 vLLM 表现相当。</p>\n\n<h2>生产状态（2026）</h2>\n<p>全球 40 万+ GPU 部署（xAI、NVIDIA、AMD、LinkedIn）。冷启动约 58 秒。硬件：NVIDIA GB200/B300/H100/A100、AMD MI355/MI300、Intel Xeon、Google TPU、Ascend NPU。</p>"
    },
    "tensorrt-llm": {
      "title": "TensorRT-LLM",
      "subtitle": "NVIDIA 编译优先推理引擎：将模型编译为带图级 kernel 融合的优化 CUDA engine，以构建时复杂度换取最大吞吐量。",
      "body": "<h2>TensorRT-LLM 是什么</h2>\n<p>TensorRT-LLM 是 NVIDIA 在 NVIDIA GPU 上编译优化 LLM 推理的开源库。与 vLLM、SGLang（运行时通过 PyTorch 解释模型）不同，TensorRT-LLM 采用<em>提前编译</em>：定义模型图，TensorRT 编译器融合算子、为每块 GPU 选最优 kernel，输出编译好的 CUDA engine。</p>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>NVIDIA 博客：「TensorRT 编译器可遍历图，为每个算子与可用 GPU 选择最佳 kernel。关键是识别图中多个算子可融合为单 kernel 的模式。这减少内存搬运与多次 GPU kernel 启动开销。」</p>\n</div>\n\n<h2>编译模型</h2>\n<h3>构建阶段（约 28 分钟）</h3>\n<ol>\n<li><strong>图构建</strong>：用 TensorRT 原语（Python API）表达模型层</li>\n<li><strong>Kernel 选择</strong>：编译器 profile 每个算子，为目标 GPU 选最快 kernel</li>\n<li><strong>Kernel 融合</strong>：识别可融合序列——LayerNorm + MatMul + Bias + Activation → 单 kernel</li>\n<li><strong>Plugin 注入</strong>：无法自动发现的复杂融合（FlashAttention）以手工优化 plugin 注入</li>\n<li><strong>CUDA Graph 编译</strong>：整个融合图编译为单 CUDA Graph，最小化启动开销</li>\n</ol>\n\n<pre>trtllm-build --checkpoint_dir /path/to/model \\\n  --output_dir /path/to/engine \\\n  --max_batch_size 64 \\\n  --gpt_attention_plugin bfloat16 \\\n  --gemm_plugin bfloat16</pre>\n\n<h3>运行时阶段</h3>\n<p>编译 engine 约 90 秒加载（对比 28 分钟构建）。后续启动复用缓存 engine。C++ 运行时执行编译图，配合 in-flight batching 与分页 KV caching。</p>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p><strong>编译 vs 解释权衡</strong>：经典编译器设计问题。vLLM/SGLang 是「解释器」——灵活、迭代快、兼容广，但留有性能空间。TensorRT-LLM 是「编译器」——搭建慢、灵活性低，但榨取硬件特定最大性能。H100 上 100 并发时 TensorRT-LLM 吞吐量比 vLLM 高约 16%（2,780 vs 2,400 tok/s）。是否值得 28 分钟构建，取决于模型更换频率。</p>\n</div>\n\n<h2>关键优化</h2>\n<table>\n<tr><th>优化</th><th>作用</th></tr>\n<tr><td>Kernel 融合</td><td>多算子合并为单 kernel——减少内存流量与启动开销</td></tr>\n<tr><td>CUDA Graph 捕获</td><td>整个前向作为单 CUDA Graph——近零 kernel 启动延迟</td></tr>\n<tr><td>FlashAttention plugin</td><td>编译时注入手工优化融合 attention kernel</td></tr>\n<tr><td>FP8 量化</td><td>原生 Hopper/Blackwell FP8 支持与校准</td></tr>\n<tr><td>In-flight batching</td><td>迭代级 continuous batching（同 vLLM）</td></tr>\n<tr><td>分页 KV caching</td><td>PagedAttention 高效 KV cache 管理</td></tr>\n<tr><td>Weight streaming</td><td>权重卸载到 CPU，按需流式到 GPU</td></tr>\n</table>\n\n<h2>Triton Inference Server 集成</h2>\n<p>TensorRT-LLM 通过专用后端集成 NVIDIA Triton Inference Server，提供模型管理、健康检查、指标与 ensemble 管道。生产路径：Triton 处理 HTTP/gRPC 路由，TensorRT-LLM 执行模型。</p>\n\n<h2>何时选择 TensorRT-LLM</h2>\n<ul>\n<li>固定模型部署（不频繁轮换模型）</li>\n<li>仅 NVIDIA 硬件（无 AMD/TPU 支持）</li>\n<li>最大吞吐量是首要目标</li>\n<li>工程团队能承担构建/调试复杂度</li>\n<li>已使用 NVIDIA Triton 基础设施</li>\n</ul>"
    },
    "ollama-llamacpp": {
      "title": "Ollama 与 llama.cpp",
      "subtitle": "本地推理栈：llama.cpp 提供 C++ 执行与激进量化，Ollama 封装模型管理与 REST API，面向开发者友好的本地部署。",
      "body": "<h2>本地推理栈</h2>\n<p>vLLM 与 SGLang 面向生产 GPU 集群，Ollama 与 llama.cpp 服务另一需求：在开发机、笔记本与边缘设备上运行 LLM。关系分层：</p>\n\n<ul>\n<li><strong>GGML</strong>：底层张量计算库（矩阵运算、量化计算 kernel）</li>\n<li><strong>llama.cpp</strong>：基于 GGML 的 LLM 推理引擎（模型加载、KV cache、attention、采样）</li>\n<li><strong>Ollama</strong>：用户友好封装（模型注册表、生命周期管理、REST API、自动硬件检测）</li>\n</ul>\n\n<p>核心洞见：Ollama 与 llama.cpp 的原始 token 生成速度相同（同一引擎）。Ollama 加便利；llama.cpp 加控制。</p>\n\n<h2>llama.cpp 架构</h2>\n<h3>硬件抽象</h3>\n<p>一套代码，四套后端：CPU（AVX2/AVX512）、NVIDIA（CUDA）、AMD（ROCm/HIP）、Apple Silicon（Metal）。同一 GGUF 模型文件跨后端运行——量化权重与硬件无关。</p>\n\n<h3>Server 架构</h3>\n<p>HTTP serving（<code>llama-server</code>）采用基于 slot 的架构：</p>\n<table>\n<tr><th>组件</th><th>角色</th></tr>\n<tr><td><code>server_context</code></td><td>持有 llama_context + 所有活跃 slot（单线程事件循环）</td></tr>\n<tr><td><code>server_slot</code></td><td>一条推理序列——管理单个并行请求</td></tr>\n<tr><td><code>server_queue</code></td><td>线程安全队列：HTTP worker 提交任务</td></tr>\n<tr><td><code>server_response</code></td><td>线程安全队列：结果返回 HTTP worker</td></tr>\n<tr><td><code>server_prompt_checkpoint</code></td><td>KV cache 快照用于前缀复用（recurrent/SWA 模型）</td></tr>\n</table>\n\n<h3>Router 模式（2026）</h3>\n<p>多个 llama.cpp 推理实例置于单一 API 端点后。按请求模型路由到对应后端——单入口多模型 serving。</p>\n\n<h2>GGUF 与量化</h2>\n<p>GGUF（GGML Unified Format）是标准化模型权重格式。单文件存储量化权重、模型元数据、tokenizer 词表与架构参数。</p>\n\n<table>\n<tr><th>方案</th><th>Bits/weight</th><th>相对 FP16 大小</th><th>质量</th><th>建议</th></tr>\n<tr><td>Q4_0</td><td>4-bit</td><td>约 4× 更小</td><td>良好</td><td>预算/内存受限</td></tr>\n<tr><td>Q4_K_M</td><td>4-bit（混合）</td><td>约 4× 更小</td><td>更好</td><td><strong>默认推荐</strong></td></tr>\n<tr><td>Q5_K_M</td><td>5-bit（混合）</td><td>约 3.2× 更小</td><td>很好</td><td>质量优先</td></tr>\n<tr><td>Q8_0</td><td>8-bit</td><td>约 2× 更小</td><td>近无损</td><td>VRAM 充足时</td></tr>\n</table>\n\n<p>「K_M」变体用混合精度——重要层（attention）更高精度，不敏感层（MLP）更低精度。相同平均位宽下质量优于均匀量化。</p>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>llama.cpp README 与提交历史：项目从单文件 C 实现（2023 年 3 月）成长为生产级多后端引擎。至 2026 年支持 80+ 模型架构，含 Llama 3/4、Qwen 2.5、DeepSeek V3/R1、Gemma 2。GGML 在 NVIDIA GPU 上量化 matmul 近 cuBLAS 性能，同时保持跨平台可移植。</p>\n</div>\n\n<h2>CPU+GPU 混合推理</h2>\n<p>llama.cpp 的 <code>--n-gpu-layers</code> 控制多少 Transformer 层在 GPU vs CPU 运行。可在 GPU VRAM 不足时将溢出层卸载到系统 RAM——更慢但可用。70B 模型 FP16 需 2× H100，Q4 加部分 CPU 卸载可在单张消费级 GPU 上运行。</p>\n\n<h3>实用配置</h3>\n<pre># Ollama: automatic GPU detection, no config needed\nollama run llama3:70b-instruct-q4_K_M\n\n# llama.cpp: fine-grained control\n./llama-server   --model ./llama-3-70b-Q4_K_M.gguf   --n-gpu-layers 45    # 45/80 layers on GPU, rest on CPU\n  --ctx-size 8192      # context window\n  --parallel 4         # 4 concurrent slots\n  --flash-attn         # enable Flash Attention (CUDA/Metal)\n  --cont-batching      # continuous batching for concurrent reqs\n  --port 8080\n\n# Memory estimation for GPU layer offloading:\n# 70B Q4_K_M total: ~38GB\n# Per layer: ~38GB / 80 layers = ~475MB\n# RTX 4090 (24GB): fits ~48 layers → set --n-gpu-layers 48\n# Remaining 32 layers: ~15GB in system RAM</pre>\n\n<h2>性能（消费级硬件，2026）</h2>\n<table>\n<tr><th>模型</th><th>硬件</th><th>量化</th><th>速度</th></tr>\n<tr><td>8B</td><td>RTX 4090</td><td>Q4_K_M</td><td>~95 tok/s</td></tr>\n<tr><td>32B</td><td>RTX 4090</td><td>Q4_K_M</td><td>~34 tok/s</td></tr>\n<tr><td>70B</td><td>RTX 4090 + CPU offload</td><td>Q4_K_M</td><td>~8-12 tok/s</td></tr>\n</table>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p><strong>Ollama vs vLLM/SGLang</strong>：目标根本不同。Ollama 顺序处理请求（一次一个）——单开发者够用。vLLM/SGLang 批处理数百并发——生产 serving 必需。选型不是性能问题而是场景问题：「只有我一个用户？」→ Ollama。「服务很多用户？」→ vLLM/SGLang。</p>\n</div>"
    },
    "batching-scheduling": {
      "title": "批处理与调度",
      "subtitle": "从静态批处理到带 chunked prefill 的 continuous batching：现代 serving 系统如何在 token 级动态组合工作以保持 GPU 饱和。",
      "body": "<h2>静态 vs 动态批处理</h2>\n<p>最简单策略将到达请求组成固定大小批，等整批完成再开下一批。问题：请求完成时间不同（输出长度不同），GPU 在等待最慢请求时空闲。</p>\n\n<pre>Static batching (naive):\n┌────────────────────────────────────────────┐\n│ Req A: ████████████░░░░░░░░░░░  (done at t=12, waits)\n│ Req B: ████████████████████████  (done at t=24)\n│ Req C: ████████░░░░░░░░░░░░░░░  (done at t=8, waits)\n└────────────────────────────────────────────┘\n  GPU idle time: 64% (A and C wait for B)\n\nContinuous batching:\n┌────────────────────────────────────────────┐\n│ Req A: ████████████ → freed, Req D fills slot\n│ Req B: ████████████████████████\n│ Req C: ████████ → freed, Req E fills slot\n│ Req D:             ████████████████\n│ Req E:         ████████████████████\n└────────────────────────────────────────────┘\n  GPU idle time: &lt;5% (slots immediately reused)</pre>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>Yu 等（ORCA，OSDI 2022）：「我们提出迭代级调度……调度器可在每次迭代（即每次前向传播）后做调度决策。」这一洞见——调度粒度应匹配 decode 循环而非请求生命周期——使 GPU 无论输出长度差异如何都能保持饱和。</p>\n</div>\n\n<h2>Continuous Batching（Orca）</h2>\n<p>Orca（OSDI 2022）引入，在<em>迭代</em>级而非请求级运作。每次前向后：</p>\n<ol>\n<li>已完成请求立即移出批</li>\n<li>队列中新请求填入空位</li>\n<li>下一轮前向用更新后的批运行</li>\n</ol>\n<p>结果：GPU 不因等待慢请求而空闲。相对静态批处理吞吐量提升 3–10×。</p>\n\n<h3>vLLM Scheduler 配置</h3>\n<pre># vLLM continuous batching parameters\npython -m vllm.entrypoints.openai.api_server   --model meta-llama/Llama-3-70B   --max-num-seqs 256           # max concurrent sequences in batch\n  --max-num-batched-tokens 8192 # token budget per iteration\n  --max-model-len 8192         # max context length per request\n  --scheduling-policy fcfs     # options: fcfs, priority\n\n# Key insight: --max-num-seqs controls max batch size\n# At 256 concurrent seqs, each decode iteration processes\n# 256 tokens (one per active sequence) in a single forward pass</pre>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>Continuous batching 已是标配——vLLM、SGLang、TensorRT-LLM 乃至 llama.cpp server 模式都实现。创新转向<em>批什么</em>：prefill token vs decode token，是否交错。调度器的 token 预算（<code>--max-num-batched-tokens</code>）是关键调参旋钮：太低浪费 GPU 计算；太高造成内存压力与 OOM。</p>\n</div>\n\n<h2>Chunked Prefill</h2>\n<p>长输入 prompt（数千 token）产生 prefill 计算突发，阻塞批内其他请求的 decode。Chunked prefill 将输入切成小块，与 decode 步交错：</p>\n\n<pre>Without chunked prefill (8K prompt arrives):\n┌──────────────────────────────────────────────┐\n│ Iter 1-8: [8K prefill monopolizes GPU]        │ ← all decodes STALLED\n│ Iter 9+:  [prefill done, decodes resume]      │\n└──────────────────────────────────────────────┘\n  ITL spike: 8 × iter_time for all in-flight requests\n\nWith chunked prefill (chunk_size=512):\n┌──────────────────────────────────────────────┐\n│ Iter 1: [512 prefill tokens] + [64 decodes]   │\n│ Iter 2: [512 prefill tokens] + [64 decodes]   │\n│ ...16 iterations to complete 8K prefill...     │\n│ Iter 17: [new request decoding] + [64 decodes] │\n└──────────────────────────────────────────────┘\n  ITL: stable (decodes never stalled)</pre>\n\n<p>防止长 prefill 给其他用户造成延迟尖峰，代价是新请求 TTFT 略增（16 轮 × iter_time vs 8 轮 × iter_time）。</p>\n\n<h3>SGLang 方案：混合 Token 预算</h3>\n<pre># SGLang uses a unified token budget approach:\n# Each iteration allocates tokens to a mix of prefill + decode\n# Budget = max_running_requests × decode_tokens + prefill_chunk\n\n# Example: budget=8192, running_requests=128\n# Decode: 128 tokens (one per request)\n# Remaining for prefill: 8192 - 128 = 8064 tokens\n# → can prefill up to 8064 tokens of new requests per iteration</pre>\n\n<h2>调度策略</h2>\n<table>\n<tr><th>策略</th><th>做法</th><th>最适用于</th><th>框架</th></tr>\n<tr><td><strong>FCFS</strong></td><td>按到达顺序处理</td><td>通用公平性</td><td>vLLM 默认</td></tr>\n<tr><td><strong>Shortest Job First</strong></td><td>优先预期输出短的请求</td><td>降低平均延迟</td><td>自定义</td></tr>\n<tr><td><strong>Longest Prefix Match</strong></td><td>优先共享缓存前缀的请求</td><td>多轮聊天、RAG</td><td>SGLang</td></tr>\n<tr><td><strong>抢占式优先级</strong></td><td>高优先级可驱逐低优先级 KV</td><td>SLA 合规</td><td>vLLM</td></tr>\n<tr><td><strong>DFS-weight</strong></td><td>带权重的深度优先，用于树状生成</td><td>Beam search、并行采样</td><td>SGLang</td></tr>\n</table>\n\n<h2>抢占与内存压力</h2>\n<p>GPU 内存耗尽（所有 KV cache 块已分配）时，调度器须选择：拒绝新请求，或驱逐现有请求。vLLM 抢占机制：</p>\n<ol>\n<li>按优先级（或同优先级按到达时间）排序运行中请求</li>\n<li>选择最低优先级请求驱逐</li>\n<li>将其 KV cache 块换出到 CPU 内存（若有 swap 空间）或稍后重算</li>\n<li>释放 GPU 块给高优先级请求</li>\n<li>被驱逐请求可恢复时，从 CPU 换回块</li>\n</ol>\n\n<pre># vLLM preemption config\n--preemption-mode swap   # options: swap (to CPU), recompute (redo prefill)\n--swap-space 16          # GB of CPU memory for swapped KV cache\n# swap is faster for short evictions; recompute is better for long evictions</pre>"
    },
    "speculative-decoding": {
      "title": "Speculative Decoding",
      "subtitle": "用小而快的模型起草 token，再用大模型并行验证——用廉价计算换更少昂贵串行步数。",
      "body": "<h2>问题：串行 Decode</h2>\n<p>自回归解码本质串行——每个 token 依赖所有先前 token。Decode 时 GPU 内存受限（读模型权重与 KV cache），计算单元大多空闲。瓶颈不是计算而是内存带宽。</p>\n\n<pre>Standard decode (1 token per forward pass):\n┌────────────────────────────────────────────────────┐\n│ Step 1: read 140GB weights + KV → generate token 1  │  ~30ms\n│ Step 2: read 140GB weights + KV → generate token 2  │  ~30ms\n│ Step 3: read 140GB weights + KV → generate token 3  │  ~30ms\n│ ...                                                  │\n│ Step N: read 140GB weights + KV → generate token N  │  ~30ms\n└────────────────────────────────────────────────────┘\nTotal: N × 30ms, GPU compute utilization: ~5%\n\nSpeculative decode (K=4 candidates verified per pass):\n┌────────────────────────────────────────────────────┐\n│ Draft: generate 4 tokens (8B model)                 │  ~8ms\n│ Verify: one forward pass over 4 tokens (70B model)  │  ~35ms\n│ Accept: ~3 tokens on average (α≈0.75)               │\n└────────────────────────────────────────────────────┘\nTotal: N/3 × 43ms, effective 2.1× speedup</pre>\n\n<h2>洞见：验证比生成便宜</h2>\n<p>验证一串 token 是否正确（对多 token 单次前向）与 prefill 相同计算——计算受限且高效。只有逐 token 生成才内存受限且慢。这种不对称是核心利用点：</p>\n\n<table>\n<tr><th>操作</th><th>Tokens/pass</th><th>瓶颈</th><th>GPU 利用率</th></tr>\n<tr><td>Decode（生成）</td><td>1</td><td>内存带宽</td><td>~5%</td></tr>\n<tr><td>Verify（类 prefill）</td><td>K（如 4）</td><td>计算</td><td>~60%</td></tr>\n</table>\n\n<h2>机制</h2>\n<ol>\n<li>小而快的<em>draft model</em> 自回归生成 K 个候选 token（便宜——小模型快）</li>\n<li>大<em>target model</em> 单次前向验证全部 K 个候选（高效——同 prefill）</li>\n<li>接受的 token（匹配 target 分布）保留；在首次拒绝处截断</li>\n<li>平均若 draft 接受率 α，则每轮 target 前向生成 1/(1-α) 个 token</li>\n</ol>\n\n<h3>数学保证：无损</h3>\n<p>接受/拒绝采样方案保证输出分布与 target model 单独生成<em>完全一致</em>。若 draft 在位置 <em>t</em> 提议 token <em>x</em>：</p>\n<pre>Accept with probability: min(1, p_target(x) / p_draft(x))\nIf rejected: sample from adjusted distribution:\n  p_adjusted(x) = max(0, p_target(x) - p_draft(x)) / Z</pre>\n<p>因此 speculative decoding 不会降低输出质量——只影响速度。</p>\n\n<h3>vLLM 配置</h3>\n<pre># Draft model speculative decoding\nfrom vllm import LLM, SamplingParams\n\nllm = LLM(\n    model=\"meta-llama/Llama-3-70B-Instruct\",\n    speculative_model=\"meta-llama/Llama-3-8B-Instruct\",\n    num_speculative_tokens=5,     # K=5 candidates per round\n    speculative_disable_mqa_scorer=False,\n    use_v2_block_manager=True,\n)\n\n# N-gram speculation (no draft model needed)\nllm = LLM(\n    model=\"meta-llama/Llama-3-70B-Instruct\",\n    speculative_model=\"[ngram]\",\n    num_speculative_tokens=4,\n    ngram_prompt_lookup_max=4,    # match up to 4 tokens from context\n)\n\n# EAGLE speculation\nllm = LLM(\n    model=\"meta-llama/Llama-3-70B-Instruct\",\n    speculative_model=\"yuhuili/EAGLE-LLaMA3-Instruct-70B\",\n    num_speculative_tokens=5,\n)</pre>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>Leviathan 等（ICML 2023）：「我们提出 speculative decoding——在不改变输出的前提下更快采样自回归模型……T5-XXL（11B）上获 2–3× 延迟改善。」NVIDIA 报告 H100 上匹配良好 draft model 最高 3.6×，Blackwell 上 Llama 4 Maverick 每用户 1,000 tok/s。</p>\n</div>\n\n<h2>变体</h2>\n<table>\n<tr><th>变体</th><th>Draft 来源</th><th>接受率</th><th>额外内存</th><th>最适用于</th></tr>\n<tr><td><strong>Draft model</strong></td><td>同族小模型</td><td>70-85%</td><td>~16GB（8B 模型）</td><td>通用</td></tr>\n<tr><td><strong>N-gram</strong></td><td>对先前上下文的模式匹配</td><td>30-60%</td><td>0</td><td>重复输出（代码、列表）</td></tr>\n<tr><td><strong>Self-speculative</strong></td><td>target 模型早退</td><td>50-70%</td><td>0</td><td>内存受限</td></tr>\n<tr><td><strong>EAGLE</strong></td><td>target 上学习的 draft head</td><td>75-90%</td><td>~1GB</td><td>最佳速度/内存比</td></tr>\n<tr><td><strong>Medusa</strong></td><td>多个并行预测 head</td><td>60-80%</td><td>~2GB</td><td>树状生成</td></tr>\n</table>\n\n<h3>何时不应使用 Speculative Decoding</h3>\n<ul>\n<li><strong>创意/多样任务</strong>——接受率低（draft 难预测创意文本）</li>\n<li><strong>短输出</strong>——draft 开销无法摊销</li>\n<li><strong>内存受限</strong>——draft model 占用本可服务更多请求的 GPU 内存</li>\n<li><strong>高批大小</strong>——验证前向变为计算瓶颈，抵消加速</li>\n</ul>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>Speculative decoding 数学上无损——输出分布与 target model 完全一致。draft 质量只影响<em>速度</em>（接受率），不影响<em>精度</em>。罕见意义上的免费午餐：用 draft 计算（便宜）换更少 target 串行步（昂贵）。主要工程挑战是接受率 &gt;70%，需匹配良好的 draft model。批大小 1 时几乎总是有益。高批大小（&gt;32）时验证前向饱和计算，收益减弱——因此主要是<em>延迟</em>优化而非吞吐量优化。</p>\n</div>"
    },
    "disaggregated-serving": {
      "title": "分离式 Serving",
      "subtitle": "将 prefill（计算受限）与 decode（内存受限）物理分离到不同硬件池——独立扩展并消除阶段干扰。",
      "body": "<h2>干扰问题</h2>\n<p>prefill 与 decode 共享 GPU 时竞争资源。长 prefill（大输入 prompt）会阻塞所有在飞请求的 decode。表现为延迟尖峰——生成中的用户 token 流暂停，GPU 在处理他人长 prompt。</p>\n\n<pre>Colocated serving — interference pattern:\n┌─────────────────────────────────────────────────┐\n│ Time →                                           │\n│ GPU:  [decode][decode][██ PREFILL 32K ██][decode] │\n│                       ↑                          │\n│              All 128 active decodes STALLED      │\n│              ITL spike: 800ms (normal: 30ms)     │\n└─────────────────────────────────────────────────┘\n\nDisaggregated serving — clean separation:\n┌─────────────────────────────────────────────────┐\n│ Prefill GPU: [██ PREFILL 32K ██][PREFILL 8K]     │\n│              (batched for max compute util)       │\n│                                                  │\n│ Decode GPU:  [decode][decode][decode][decode]...  │\n│              (stable 30ms ITL, never interrupted) │\n│                     ↕ KV transfer via RDMA       │\n└─────────────────────────────────────────────────┘</pre>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>Zhong 等（DistServe，OSDI 2024）：「我们发现现有系统在 prefill 与 decode 阶段之间存在干扰……DistServe 将两阶段分离到不同 GPU，在相同延迟 SLO 下服务更多请求，最高 4.48× 改善。」Meta 内部设计文档：「Prefill 永不阻塞 decode。Decode 永不碎片化 prefill 计算。」</p>\n</div>\n\n<h2>架构</h2>\n<table>\n<tr><th>方面</th><th>Prefill Worker</th><th>Decode Worker</th></tr>\n<tr><td>瓶颈</td><td>计算受限（FLOPS）</td><td>内存带宽受限（GB/s）</td></tr>\n<tr><td>最优批大小</td><td>大（最大化计算利用）</td><td>小（最小化每步延迟）</td></tr>\n<tr><td>最优 GPU</td><td>高算力（H100 SXM：990 TFLOPS）</td><td>高内存带宽（H100：3.35 TB/s HBM3）</td></tr>\n<tr><td>调度</td><td>批相似长度 prompt</td><td>Continuous batching</td></tr>\n<tr><td>KV cache 生命周期</td><td>临时——prefill 后传输</td><td>持久——贯穿生成</td></tr>\n<tr><td>扩展</td><td>随输入 prompt 负载扩展</td><td>随并发生成数扩展</td></tr>\n</table>\n\n<h2>流程</h2>\n<ol>\n<li>请求到达 router</li>\n<li>Router 发往 prefill worker（处理输入 prompt，生成 KV cache）</li>\n<li>KV cache 经高速互联（NVLink、InfiniBand 或 RDMA）传到 decode worker</li>\n<li>Decode worker 自回归生成 token，流式返回用户</li>\n</ol>\n\n<h3>KV Cache 传输预算</h3>\n<pre>KV cache size per request (Llama-3-70B, 80 layers, GQA 8 KV heads):\n  per token: 2 × 80 × 8 × 128 × 2 bytes (FP16) = 327,680 bytes ≈ 320 KB\n  at 2K context:  320 KB × 2048  ≈ 640 MB\n  at 8K context:  320 KB × 8192  ≈ 2.5 GB\n  at 32K context: 320 KB × 32768 ≈ 10 GB\n\nTransfer latency at different interconnect speeds:\n  PCIe 5.0 (64 GB/s):   2.5 GB → 39 ms  (unacceptable TTFT overhead)\n  InfiniBand NDR (50 GB/s effective): 2.5 GB → 50 ms\n  NVLink (900 GB/s):    2.5 GB → 2.8 ms  (acceptable)\n  CXL 3.0 (256 GB/s):   2.5 GB → 10 ms   (emerging option)</pre>\n\n<h3>vLLM 分离式 Serving 配置</h3>\n<pre># Start prefill worker (GPU 0-3, TP=4)\npython -m vllm.entrypoints.openai.api_server   --model meta-llama/Llama-3-70B   --tensor-parallel-size 4   --gpu-memory-utilization 0.85   --role prefill   --kv-transfer-config '{\"target\": \"decode-workers:5557\"}'\n\n# Start decode worker (GPU 4-7, TP=4)\npython -m vllm.entrypoints.openai.api_server   --model meta-llama/Llama-3-70B   --tensor-parallel-size 4   --gpu-memory-utilization 0.95   --role decode   --kv-transfer-config '{\"listen\": \"0.0.0.0:5557\"}'</pre>\n\n<h2>权衡</h2>\n<p>关键工程挑战是 KV cache 传输延迟。70B 模型 8K 上下文下每请求 KV cache 约 2.5 GB。网络传输增加 TTFT 延迟。高速互联可缓解，但开销非零。</p>\n\n<h3>分离式 Serving 的劣势场景</h3>\n<ul>\n<li><strong>低规模</strong>——若 prefill 干扰罕见（少量并发），传输开销占主导</li>\n<li><strong>长生成</strong>——KV 传输在输出长度上摊销；短输出无法摊销</li>\n<li><strong>能耗</strong>——传输本身耗电；低负载下同机更高效</li>\n</ul>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>Patel 等（arXiv:2601.08833，2026）显示意外结果：中等负载下，相对同机 serving，分离式 serving 可能增加总能耗 12–30%。收益在规模大（&gt;1000 并发用户）且 prefill 阻塞引发级联延迟违反 SLO 时最明显。决策边界：若 P99 ITL 在流量尖峰时因 prefill 干扰超 SLO，分离式 serving 物有所值。低于该阈值，同机 chunked prefill 是更简单、更节能的方案。</p>\n</div>\n\n<h2>状态（2026）</h2>\n<p>vLLM 原生支持分离式 prefill/decode（v0.6+）。Meta 与 vLLM 团队共同开发。SGLang 的 prefill-decode 分离积极开发中。主要云厂商超大规模部署（&gt;10K QPS）已采用该模式。架构趋向三层：router → prefill 池 → decode 池，各层按不同指标（prompt 吞吐量 vs 并发生成数）独立自动扩展。</p>"
    },
    "moe-serving": {
      "title": "MoE Serving",
      "subtitle": "Mixture-of-Experts 模型每 token 仅激活部分参数——但 serving 需要 expert parallelism、动态负载均衡与稠密模型所没有的全对全通信模式。",
      "body": "<h2>MoE 如何改变 Serving 问题</h2>\n<p>稠密 Transformer 中每个 token 激活全部参数。MoE 中路由网络为每 token 选择部分 expert FFN（通常 64–256 个中选 2 个）。意味着：</p>\n<ul>\n<li><strong>总参数量</strong>很大（DeepSeek-V3：671B），但<strong>每 token 激活参数</strong>小（约 37B）</li>\n<li><strong>内存</strong>主导计算——须存储全部 expert，尽管每 token 大多闲置</li>\n<li><strong>通信模式</strong>根本改变：token 须路由到持有对应 expert 的 GPU</li>\n</ul>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>MoE serving 挑战与稠密模型根本不同。稠密模型 tensor parallelism 将每个算子切到多 GPU——通信规律可预测。MoE 每 token 可能去不同 GPU 上的不同 expert——通信数据相关且不规则。需要不同并行策略：Expert Parallelism（EP）。</p>\n</div>\n\n<h2>Expert Parallelism（EP）</h2>\n<p>不在每 GPU 复制整模型（data parallelism），也不将每层切到多 GPU（tensor parallelism），EP 将不同 expert 分配到不同 GPU：</p>\n\n<pre>MoE Forward Pass with Expert Parallelism (4 GPUs, 16 experts):\n┌─────────────────────────────────────────────────────────┐\n│ Step 1: Router decides expert assignments per token      │\n│   Token A → Expert 3 (GPU 0)                            │\n│   Token B → Expert 7 (GPU 1)                            │\n│   Token C → Expert 3 (GPU 0), Expert 12 (GPU 3)        │\n│                                                          │\n│ Step 2: All-to-All dispatch (tokens → expert GPUs)       │\n│   GPU 0 ←──── A, C₁    GPU 1 ←──── B                   │\n│   GPU 2 ←──── (none)    GPU 3 ←──── C₂                  │\n│                                                          │\n│ Step 3: Expert computation (each GPU processes locally)  │\n│   GPU 0: Expert_3(A), Expert_3(C₁)                      │\n│   GPU 1: Expert_7(B)                                    │\n│   GPU 3: Expert_12(C₂)                                  │\n│                                                          │\n│ Step 4: All-to-All combine (results → original GPUs)    │\n│   Results routed back, averaged for multi-expert tokens  │\n└─────────────────────────────────────────────────────────┘</pre>\n\n<ol>\n<li>每 GPU 持部分 expert（如 16 GPU 上 64 expert 每 GPU 4 个）</li>\n<li>前向时路由决定 token 须发往哪些 GPU</li>\n<li><em>All-to-all</em> 通信将 token 路由到 expert GPU</li>\n<li>Expert 计算后，再 all-to-all 传回结果</li>\n</ol>\n\n<p>Attention 层（非 expert）仍可用 tensor parallelism 或复制。</p>\n\n<pre># vLLM Expert Parallel deployment:\nvllm serve deepseek-ai/DeepSeek-V3-0324 \\\n  --tensor-parallel-size 1 \\\n  --data-parallel-size 8 \\\n  --enable-expert-parallel</pre>\n\n<h2>负载均衡问题</h2>\n<p>实践中 token 路由高度偏斜——「热」expert 收到远多 token，「冷」expert 闲置。热 expert 聚于同一 GPU 则该 GPU 成瓶颈，其他浪费容量。</p>\n\n<h3>Expert Parallel Load Balancer（EPLB）</h3>\n<p>EPLB 动态重分配 expert 到 GPU：</p>\n<ul>\n<li><strong>监控</strong>：滑动窗口（默认 1000 步）跟踪每 expert token 数</li>\n<li><strong>再平衡</strong>：定期（每 3000 步）将热 expert 与冷 expert 重排到各 GPU</li>\n<li><strong>冗余 expert</strong>：将最热 expert 复制到多 GPU 并行服务</li>\n<li><strong>异步传输</strong>：前向之间用非阻塞拷贝更新权重</li>\n</ul>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>NVIDIA Wide-EP 博客：「EPLB 用策略将热 expert 与冷 expert 重分布。触发权重更新，通过容器化设计使 expert 在容器分配间流动而不破坏 CUDA graph。」</p>\n</div>\n\n<h2>Wide Expert Parallelism（NVL72）</h2>\n<p>NVIDIA GB200 NVL72 机架（72 GPU、130 TB/s 相干 NVLink）将 expert 分布到更多 GPU，降低每 GPU 权重加载并提升 GroupGEMM 效率。Wide-EP 配置每 GPU 吞吐量可比窄 EP 高 1.8×，机架内 NVLink 带宽抵消 all-to-all 通信成本。</p>\n\n<h2>分层 vs 全局负载均衡</h2>\n<table>\n<tr><th>策略</th><th>做法</th><th>最适用于</th></tr>\n<tr><td>分层</td><td>先在节点间平衡 expert 组，再在节点内平衡</td><td>多节点且 expert 组数均匀</td></tr>\n<tr><td>全局</td><td>无节点结构地全局复制与分布 expert</td><td>不均匀配置或单节点</td></tr>\n</table>"
    },
    "benchmarks": {
      "title": "基准测试与权衡",
      "subtitle": "vLLM、SGLang、TensorRT-LLM、Ollama 在 H100 上的性能数据——以及按工作负载选引擎的决策框架。",
      "body": "<h2>H100 基准数据（唯一 Prompt，2026）</h2>\n<h3>吞吐量（token/秒）</h3>\n<table>\n<tr><th>并发</th><th>vLLM</th><th>SGLang</th><th>TensorRT-LLM</th></tr>\n<tr><td>1</td><td>120</td><td>125</td><td>130</td></tr>\n<tr><td>10</td><td>650</td><td>680</td><td>710</td></tr>\n<tr><td>50</td><td>1,850</td><td>1,920</td><td>2,100</td></tr>\n<tr><td>100</td><td>2,400</td><td>2,460</td><td>2,780</td></tr>\n</table>\n\n<h3>TTFT 延迟（毫秒，p50）</h3>\n<table>\n<tr><th>并发</th><th>vLLM</th><th>SGLang</th><th>TensorRT-LLM</th></tr>\n<tr><td>1</td><td>45</td><td>42</td><td>38</td></tr>\n<tr><td>10</td><td>120</td><td>112</td><td>105</td></tr>\n<tr><td>50</td><td>380</td><td>360</td><td>340</td></tr>\n<tr><td>100</td><td>740</td><td>710</td><td>680</td></tr>\n</table>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>唯一 prompt 下三框架彼此差距约 15% 内。TensorRT-LLM 原始吞吐量领先（100 并发比 vLLM +16%），但需 28 分钟编译 vs vLLM/SGLang 约 60 秒冷启动。低并发差距小，高并发差距大——TensorRT-LLM 图级优化在高负载下收益最大。</p>\n</div>\n\n<div class=\"evidence\">\n<div class=\"ev-label\">来源证据</div>\n<p>基准数据编译自：(1) vLLM v0.7 文档基准（2026），(2) SGLang v0.4 发布说明与 RadixAttention 消融，(3) NVIDIA TensorRT-LLM MLPerf 提交。均在单张 H100 SXM 80GB、Llama-3-70B、输入 1024 token、输出 128 token、FP8 量化下测量。方法：持续负载 60 秒，10 秒预热后取平均。</p>\n</div>\n\n<h2>共享前缀工作负载</h2>\n<p>请求共享上下文（聊天、RAG、agent）时，SGLang RadixAttention 优势显现：</p>\n<ul>\n<li>总吞吐量高 29%（16,215 vs 12,553 tok/s）</li>\n<li>输出吞吐量 2×+（893 vs 413 tok/s）</li>\n<li>TTFT：79ms vs 103ms</li>\n<li>并发稳定：SGLang 维持 30–31 tok/s vs vLLM 从 22→16 tok/s</li>\n</ul>\n<p>唯一 prompt 时优势消失——RadixAttention 树无可复用内容。</p>\n\n<h2>决策矩阵</h2>\n<table>\n<tr><th>若你需要……</th><th>选择</th><th>原因</th></tr>\n<tr><td>通用生产 serving</td><td><strong>vLLM</strong></td><td>最广模型/硬件支持，最稳妥默认</td></tr>\n<tr><td>多轮聊天 / RAG / agent</td><td><strong>SGLang</strong></td><td>RadixAttention 最大化前缀复用</td></tr>\n<tr><td>NVIDIA 上最大吞吐</td><td><strong>TensorRT-LLM</strong></td><td>图级优化，但搭建难</td></tr>\n<tr><td>本地开发</td><td><strong>Ollama</strong></td><td>一条命令，自动硬件检测</td></tr>\n<tr><td>自定义量化 / 边缘</td><td><strong>llama.cpp</strong></td><td>细粒度参数控制，CPU/GPU 混合</td></tr>\n<tr><td>结构化输出（JSON）</td><td><strong>SGLang</strong></td><td>压缩 FSM 解码——原生且快</td></tr>\n<tr><td>多模型 serving</td><td><strong>vLLM 或 llama.cpp router</strong></td><td>均支持单端点多模型</td></tr>\n</table>\n\n<div class=\"analysis\">\n<div class=\"an-label\">分析</div>\n<p>引擎选型最常见错误：工作负载实际延迟敏感却优化 raw 吞吐量。交互应用中 TTFT p95 改善 50ms 比聚合吞吐量 +200 tok/s 更影响体验。务必用<em>你的</em>工作负载、<em>你的</em>模型、<em>你的</em>目标并发 benchmark——公开数据仅供参考。</p>\n</div>\n\n<h2>如何 Benchmark：可复现方法</h2>\n<pre># Using vLLM's built-in benchmark tool\npython -m vllm.entrypoints.openai.api_server   --model meta-llama/Llama-3-70B --dtype float16 &\n\n# Run benchmark with controlled parameters\npython benchmarks/benchmark_serving.py   --backend openai   --base-url http://localhost:8000   --model meta-llama/Llama-3-70B   --dataset-name sharegpt   --num-prompts 1000   --request-rate 10      # requests per second (controls concurrency)\n  --percentile-metrics ttft,tpot,itl,e2el\n\n# Key output metrics:\n# - TTFT (p50, p95, p99): time to first token\n# - TPOT (p50, p95, p99): time per output token\n# - Request throughput: completed requests/second\n# - Token throughput: total output tokens/second</pre>\n\n<h2>关键指标摘要</h2>\n<table>\n<tr><th></th><th>vLLM</th><th>SGLang</th><th>TensorRT-LLM</th><th>Ollama</th></tr>\n<tr><td>冷启动</td><td>~62s</td><td>~58s</td><td>~28min</td><td>即时</td></tr>\n<tr><td>易用性</td><td>简单</td><td>简单</td><td>困难</td><td>最简单</td></tr>\n<tr><td>模型支持</td><td>最广</td><td>广</td><td>选择性</td><td>广（GGUF）</td></tr>\n<tr><td>硬件</td><td>NVIDIA、AMD、TPU+</td><td>NVIDIA、AMD、TPU、NPU</td><td>仅 NVIDIA</td><td>CPU、任意 GPU</td></tr>\n<tr><td>并发请求</td><td>是</td><td>是</td><td>是</td><td>顺序</td></tr>\n<tr><td>最佳场景</td><td>通用</td><td>共享前缀</td><td>最大性能</td><td>本地开发</td></tr>\n</table>"
    }
  },
  "concepts": {
    "ttft": {
      "name": "TTFT",
      "role": "性能指标",
      "summary": "从收到请求到生成首个输出 token 的延迟——由 prefill 阶段时长决定。",
      "definition": "TTFT 衡量用户在看到任何输出前的等待时间。主要由 prefill 主导：将整个输入 prompt 过模型以生成 KV cache。交互应用（聊天、流式）中 TTFT 最易被感知。降低 TTFT 的技术包括 prefix caching（跳过已缓存部分的 prefill）、chunked prefill（与 decode 交错 prefill）、分离式 serving（为 prefill 配置专用优化硬件）。"
    },
    "itl": {
      "name": "ITL",
      "role": "性能指标",
      "summary": "连续输出 token 之间的时间——决定流式输出的感知流畅度，受 decode 阶段内存带宽瓶颈限制。",
      "definition": "ITL 衡量自回归生成过程中连续输出 token 之间的间隔。与一次性成本的 TTFT 不同，ITL 在整个生成过程中持续被用户感受。Decode 阶段内存带宽是瓶颈——每步须读取整个模型权重与 KV cache。典型 H100 值：中等并发下每 token 6–7ms。批大小增大时须读更多 KV cache，ITL 恶化。"
    },
    "kvcache": {
      "name": "KVCache",
      "role": "核心数据结构",
      "summary": "所有先前 token 在所有 attention 层存储的 Key 与 Value 张量——LLM 推理期间 GPU 内存的主要消耗者。",
      "definition": "自回归生成中，每个 attention 层为每个 token 计算 Key（K）与 Value（V）投影向量。缓存它们以免未来 token 对整个上下文重算 attention。KV cache 随序列长度线性增长，每 token 内存约 2 × num_layers × num_kv_heads × head_dim × dtype_size。70B 模型约每 token 2.56 MB。通过 PagedAttention、前缀共享、量化与驱逐高效管理，是 LLM serving 的核心系统挑战。"
    },
    "pagedattention": {
      "name": "PagedAttention",
      "role": "内存管理算法",
      "summary": "受 OS 启发的 KV cache 分页内存管理——固定块、块表、惰性分配与 copy-on-write 共享，将内存浪费从 60–80% 降至 4% 以下。",
      "definition": "PagedAttention 将 KV cache 分为固定大小块（通常 16 token），每块含一层 attention 中这些 token 的 K 与 V。块表将每请求的逻辑块索引映射到 GPU 物理地址，类似 OS 页表。块惰性分配（随 token 生成）、请求完成即释放，可通过引用计数共享（beam search、prefix caching 的 copy-on-write）。自定义 CUDA kernel 经块表迭代计算 attention，间接寻址限于 K/V 读取——softmax 与 value 累加按逻辑位置，不知物理布局。"
    },
    "blocktable": {
      "name": "BlockTable",
      "role": "数据结构",
      "summary": "每请求从逻辑 KV 块索引到 GPU 物理地址的映射——PagedAttention 的「页表」。",
      "definition": "每个活跃请求维护块表：条目 i 为逻辑块 i 的 KV cache 物理内存地址。attention kernel 需要位置 t 的 KV 时，计算 logical_block = t / block_size，从 block_table[logical_block] 取物理地址读取 K/V。间接寻址支持非连续存储（块散布 GPU 内存）、共享（多表指向同块）、惰性分配（仅按需填充条目）。"
    },
    "blockmanager": {
      "name": "BlockManager",
      "role": "系统组件",
      "summary": "vLLM 中的 KV cache 内存分配器——拥有物理块池、跟踪引用计数、处理分配/释放/共享。",
      "definition": "Block Manager 是 vLLM 内存管理子系统，负责所有物理 KV cache 块的生命周期。启动时预分配固定块池（占用配置的 GPU 内存比例），按 Scheduler 指令按需分配给请求，维护引用计数以支持共享（prefix caching、beam search），请求完成或抢占时回收。无空闲块时 Scheduler 须抢占或拒绝请求。"
    },
    "copyonwrite": {
      "name": "CopyOnWrite",
      "role": "内存优化",
      "summary": "在输出分叉前共享物理 KV 块——借自 OS 进程 fork，高效支持 beam search 与 prefix caching。",
      "definition": "多请求共享前缀（相同 system prompt、RAG 文档或 beam search 分支）时，块表指向相同物理块而非复制数据。块标记为共享（引用计数 > 1）。仅当请求须写入分叉 KV（共享前缀后生成不同 token）时，将共享块复制到新物理块——故为 copy-on-write。直接对应 Unix fork() 语义：父子共享内存页直至一方写入。"
    },
    "radixattention": {
      "name": "RadixAttention",
      "role": "缓存管理算法",
      "summary": "SGLang 基于 radix 树的 KV cache 索引，自动发现跨请求共享前缀并复用已缓存计算。",
      "definition": "RadixAttention 将所有缓存 KV 状态组织为 radix 树（压缩 trie），每节点代表一段 token 序列及其 KV cache 页。新请求到达时遍历树找最长匹配前缀，复用缓存 KV 张量，仅对新颖后缀计算 attention。不同于 vLLM 需配置的显式 prefix caching，RadixAttention 自动发现共享。配合缓存感知调度（Longest Prefix Match），优先最大化缓存复用的请求，近似深度优先树遍历。"
    },
    "continuousbatching": {
      "name": "ContinuousBatching",
      "role": "调度策略",
      "summary": "每轮迭代动态插入与移除 GPU 批中的请求——消除静态批处理空闲时间，吞吐量提升 3–10×。",
      "definition": "传统静态批处理等整批请求完成再处理下一批。Continuous batching（Orca，OSDI 2022）在迭代粒度运作：每次前向后立即弹出完成请求、从队列接纳新请求。无论输出长度如何变化都保持 GPU 饱和。现已成为所有生产 serving 框架的标配。"
    },
    "prefill": {
      "name": "Prefill",
      "role": "推理阶段",
      "summary": "并行处理整个输入 prompt 的计算受限阶段，生成初始 KV cache——其时长决定 TTFT。",
      "definition": "Prefill 中所有输入 token 在单次前向中同时处理。模型对所有输入位置计算 attention，生成存入 KV cache 的 Key 与 Value 供后续 decode。Prefill 计算受限，并行矩阵运算饱和 GPU 算术单元。时长与输入长度成正比，决定 TTFT。优化包括 prefix caching（跳过已缓存部分 prefill）、chunked prefill（切成小块避免阻塞 decode）、分离式 serving（高算力硬件专做 prefill）。"
    },
    "decode": {
      "name": "Decode",
      "role": "推理阶段",
      "summary": "内存受限的自回归阶段，逐 token 生成——每步读取整个 KV cache，决定 ITL 与吞吐量。",
      "definition": "Decode 中 token 顺序生成。每步：(1) 为新 token 计算 Q/K/V，(2) 将 K/V 追加到 cache，(3) 新 Q 与所有缓存 K/V 计算 attention，(4) 过模型其余部分，(5) 采样下一 token。内存受限：每步读完整模型权重（70B 约 140 GB）与所有缓存 K/V，但每字节计算量少，GPU 计算单元利用不足。Speculative decoding 将多个推测 token 批入单次验证前向以应对。"
    },
    "vllm": {
      "name": "vLLM",
      "role": "Serving 框架",
      "summary": "生产默认开源 LLM 推理引擎——PagedAttention 内存管理、continuous batching、最广模型/硬件支持。",
      "definition": "vLLM（UC Berkeley，2023 年 6 月）是高吞吐 LLM serving 引擎，以 PagedAttention 高效管理 KV cache 著称。架构含 Scheduler（continuous batching、抢占）、Block Manager（分页 KV cache 分配）、Model Executor（优化 CUDA kernel、torch.compile）。至 2026 年支持最广模型、硬件（NVIDIA、AMD、TPU）与特性（speculative decoding、分离式 serving、结构化输出、多种并行）。冷启动约 62 秒。OpenAI 兼容 API。"
    },
    "sglang": {
      "name": "SGLang",
      "role": "Serving 框架",
      "summary": "Structured Generation Language——Python 嵌入式前端 + RadixAttention 运行时，在多轮、RAG、agent 工作负载上通过自动 KV cache 复用表现突出。",
      "definition": "SGLang（UC Berkeley/LMSYS）将 DSL 前端（Python 中 gen、select、fork、join 原语）与优化后端结合，含 RadixAttention（radix 树 KV cache 索引自动前缀共享）、压缩 FSM 解码（快速结构化输出）、缓存感知调度。全球 40 万+ GPU 部署。共享前缀工作负载上吞吐量比 vLLM 高 29%。冷启动约 58 秒。"
    },
    "ollama": {
      "name": "Ollama",
      "role": "本地推理工具",
      "summary": "llama.cpp 的用户友好封装——提供模型注册表、生命周期管理、REST API 与自动硬件检测，用于本地 LLM 部署。",
      "definition": "Ollama 通过模型注册表（pull/run/list）、自动 GGUF 管理、REST API（兼容 OpenAI 客户端库）、硬件自动检测（CPU/GPU 卸载）简化 llama.cpp。token 生成速度与裸 llama.cpp 相同（同一引擎）。顺序处理请求——一次一个。目标场景：开发工作站与原型，非大规模生产 serving。"
    },
    "llamacpp": {
      "name": "LlamaCpp",
      "role": "推理引擎",
      "summary": "支持 CPU/GPU 混合执行、激进量化（1.5–8 bit）与 GGUF 格式的 C/C++ LLM 推理引擎——Ollama 的底层。",
      "definition": "llama.cpp 是基于 GGML 张量库的可移植 C/C++ LLM 推理实现。多硬件后端（CPU AVX2/AVX512、NVIDIA CUDA、AMD ROCm/HIP、Apple Metal、Vulkan、SYCL、RISC-V）共用 GGUF 文件。特性：1.5–8 bit 整数量化、CPU+GPU 混合（--n-gpu-layers 部分层卸载）、server 模式 continuous batching、speculative decoding、router 模式多模型 serving。Server 为单线程 server_context + HTTP worker 线程安全队列。"
    },
    "gguf": {
      "name": "GGUF",
      "role": "模型格式",
      "summary": "GGML Unified Format——量化 LLM 权重的标准文件格式，单文件存储参数、元数据、tokenizer 与架构。",
      "definition": "GGUF 是存储量化 LLM 权重的二进制格式。含多种量化方案（Q4_0、Q4_K_M、Q5_K_M、Q8_0 等）的模型参数、架构元数据、tokenizer 词表与训练超参。文件硬件无关——同一文件可在 CPU、NVIDIA、AMD、Apple Silicon 运行。支持混合精度「K_M」变体：attention 层更高精度、MLP 更低精度，相同平均位宽下质量优于均匀量化。"
    },
    "quantization": {
      "name": "Quantization",
      "role": "模型优化",
      "summary": "将模型权重从 FP16/FP32 降到低位宽（INT4/INT8/FP8）——以极小质量损失换 2–4× 内存缩减与更快推理。",
      "definition": "量化将高精度权重映射到低精度表示。GPTQ、AWQ 等训练后量化（PTQ）分析权重分布以最小化误差。GGUF 支持 Q4_0 至 Q8_0。vLLM 支持 FP8、MXFP8/MXFP4、NVFP4、INT8、INT4、GPTQ/AWQ。关键权衡：Q4_K_M（4-bit 混合）约 4× 内存缩减且质量损失极小，为默认推荐。量化与 PagedAttention、批处理等系统优化正交——可乘法叠加。"
    },
    "gqa": {
      "name": "GQA",
      "role": "架构优化",
      "summary": "多个 query head 共享 K/V head——按分组因子缩减 KV cache（如 Llama 3 为 8×），质量损失很小。",
      "definition": "标准 Multi-Head Attention（MHA）中每个 query head 有独立 K/V head。GQA 让多 query head 共享一对 K/V head。Llama 3 用 64 query head、8 组 K/V——每 token KV cache 8 倍缩减。训练时决定的架构级优化，与 PagedAttention 等系统优化正交。降低 decode 内存瓶颈，无需改 serving 框架。"
    },
    "mla": {
      "name": "MLA",
      "role": "架构优化",
      "summary": "将 K/V 压缩到学习的低秩潜空间——在 GQA 之外进一步缩减 KV cache，DeepSeek 模型采用。",
      "definition": "MLA 在缓存前将 Key、Value 投影到低维潜空间，attention 时再重建。因潜维度可远小于原 head 维度，压缩比 GQA 更激进。DeepSeek 采用。架构级（须训练 MLA），与 PagedAttention 正交。SGLang 为 DeepSeek serving 提供 MLA 优化 kernel。"
    },
    "prefixcaching": {
      "name": "PrefixCaching",
      "role": "优化技术",
      "summary": "存储并复用跨请求共享 prompt 前缀的 KV cache——跳过重复 system prompt 或 RAG 文档的昂贵 prefill。",
      "definition": "多请求共享相同前缀（system prompt、RAG 文档、few-shot 示例）时，该前缀 KV cache 只算一次，后续请求复用。消除冗余 prefill，TTFT 最高可降 85%。实现各异：vLLM 显式 prefix caching（prompt 前缀哈希匹配），SGLang RadixAttention（radix 树自动发现）。对多轮聊天、RAG、agent 工作流影响最大——system prompt 或文档上下文跨多请求共享。"
    },
    "compressedfsm": {
      "name": "CompressedFSM",
      "role": "结构化生成",
      "summary": "SGLang 约束解码优化：将确定性 FSM 转移链压缩为单边，单次前向发出多个 token。",
      "definition": "生成结构化输出（JSON、XML）须遵循语法约束的有限状态机（FSM）。标准约束解码每 token 检查 FSM，即使仅有一个合法下一 token。SGLang 分析约束语法，识别确定性转移链（仅一条合法路径），压缩为单边。进入此类链时单次前向发出多 token，无需每步 masking 或重检。更快（更少前向）且更合规（结构可证明合法）。"
    },
    "speculativedecoding": {
      "name": "SpeculativeDecoding",
      "role": "优化技术",
      "summary": "用小快模型起草 token，大模型并行验证——用廉价计算换更少昂贵串行步，输出分布与 target 完全一致。",
      "definition": "小 draft model 自回归提出 K 个候选（便宜）。大 target model 单次前向验证全部 K 个（高效，同 prefill）。接受的 token 与 target 单独生成数学一致——技术无损。变体：独立 draft model、n-gram 匹配、self-speculative（早退）、EAGLE（学习 draft head）、Medusa（并行预测 head）。匹配良好 draft 典型加速 2–5×。vLLM、SGLang、TensorRT-LLM 均支持。"
    },
    "draftmodel": {
      "name": "DraftModel",
      "role": "Speculative Decoding 组件",
      "summary": "Speculative decoding 中小而快的模型，为大 target model 提出候选 token——接受率决定加速比。",
      "definition": "Draft model 廉价生成候选 token（远小于 target，自回归快）。质量决定接受率 α：target 接受的比例。α 越高 → 每轮 target 前向生成越多 token → 加速越大。关系：每轮 target 期望 token 数 = 1/(1-α)。匹配良好 draft（如 Llama-3-8B 为 Llama-3-70B 起草）α > 0.7，获 3–4× 加速。可为独立模型、n-gram 表或学习 draft head（EAGLE、Medusa）。"
    },
    "disaggregatedserving": {
      "name": "DisaggregatedServing",
      "role": "架构模式",
      "summary": "将 prefill（计算受限）与 decode（内存受限）物理分离到不同硬件池，消除阶段干扰，代价是 KV cache 传输开销。",
      "definition": "传统同机 serving 在同一 GPU 跑 prefill 与 decode，长 prefill 阻塞其他请求 decode。分离式 serving 将 prefill 路由到高算力 worker、decode 到高带宽 worker。Prefill 后经高速互联（NVLink、InfiniBand）传输 KV cache 到 decode worker。收益：独立扩展、无阶段干扰、每阶段优化硬件。代价：KV 传输延迟、基础设施复杂度、可能更高能耗。vLLM 原生支持；与 Meta 共同开发。"
    },
    "scheduler": {
      "name": "Scheduler",
      "role": "系统组件",
      "summary": "决定每轮哪些请求运行的组件——实现 continuous batching、优先级、抢占与准入控制。",
      "definition": "Scheduler 是 LLM serving 引擎的核心决策者。每轮选择下一批包含哪些请求，受内存约束（可用 KV 块）、优先级（SLA 层级）、公平策略限制。vLLM 支持抢占（内存压力下驱逐低优先级）与准入控制（过载拒绝）。SGLang 额外实现缓存感知策略（LPM），重排请求以最大化 RadixAttention 缓存命中。"
    },
    "chunkedprefill": {
      "name": "ChunkedPrefill",
      "role": "优化技术",
      "summary": "将长 prefill 切成小块与 decode 步交错——防止长 prompt 阻塞其他请求的生成。",
      "definition": "新请求长输入 prompt 若一次性算完 prefill，会阻塞 GPU 处理其他在飞请求的 decode。Chunked prefill 将输入切成小块（如每块 512 token），与 decode 迭代交错。防止现有用户延迟尖峰，代价是新请求 TTFT 略增（prefill 分散到多轮）。vLLM 与 SGLang 均支持。"
    },
    "cacheawarescheduling": {
      "name": "CacheAwareScheduling",
      "role": "调度策略",
      "summary": "重排请求执行以最大化 KV cache 复用——SGLang LPM 策略优先 radix 树中共享前缀更长的请求。",
      "definition": "不按到达顺序（FCFS），缓存感知调度重排以最大化 KV cache 命中。SGLang Longest Prefix Match（LPM）优先 prompt 与现有 radix 树节点共享最长前缀的请求，近似深度优先遍历，保持最相关缓存热。权衡是公平性：无前缀缓存的新 prompt 可能等更久。DFS-weight 用可配置权重平衡复用与公平。"
    },
    "throughput": {
      "name": "Throughput",
      "role": "性能指标",
      "summary": "所有并发请求每秒生成的总 token 数——聚合系统效率指标，与单用户延迟不同。",
      "definition": "Throughput 衡量 serving 系统总输出速率：所有活跃请求每秒生成 token 之和。是主要成本效率指标——越高表示每 GPU 秒做更多工作。但若延迟差，throughput 可能虚高（如批 1000 请求吞吐高但每用户等很久）。生产须平衡 throughput 与 TTFT p50/p95、ITL。典型 H100（2026，100 并发）：vLLM 2,400 tok/s，SGLang 2,460，TensorRT-LLM 2,780 tok/s。"
    },
    "flashattention": {
      "name": "FlashAttention",
      "role": "Attention 算法",
      "summary": "IO 感知的精确 attention：将计算分块到 SRAM 大小、融合为单 kernel、永不物化 N×N attention 矩阵——2–4× 墙钟加速与线性内存。",
      "definition": "FlashAttention 重构 attention 以最小化 HBM 读写。将 Q、K、V 切成适合片上 SRAM 的块，用在线 softmax（增量 max/sum）逐块计算，仅最终输出写 HBM。中间 N×N 矩阵永不物化。反向从 Q/K/V 块重算而非读中间结果——以 FLOPs 换 IO。IO 复杂度 O(N²d²M⁻¹) vs 标准 Ω(Nd + N²)。FlashAttention-3 在 H100 加 WGMMA、TMA、ping-pong 调度与 FP8，约 740 TFLOPS。与 PagedAttention 互补：FlashAttention 优化单次 attention 内计算；PagedAttention 优化跨请求 KV 布局。"
    },
    "ioawareness": {
      "name": "IOAwareness",
      "role": "设计原则",
      "summary": "显式考虑内存层次设计算法——优化数据搬运（IO）而非仅算术（FLOPs）。",
      "definition": "现代 GPU 计算吞吐（如 H100 989 TFLOPS）与内存带宽（3.35 TB/s）差距巨大。IO 感知算法结构化计算以最小化慢内存（HBM）与快缓存（SRAM）间数据移动，即使总算术更多。FlashAttention 洞见：attention 内存受限非计算受限——分块到 SRAM 减少 HBM 读写获墙钟加速，尽管 FLOPs 更多。原则推广到算术强度（每字节 FLOPs）低的任何算法。"
    },
    "tiling": {
      "name": "Tiling",
      "role": "计算技术",
      "summary": "将大矩阵运算切成 SRAM 大小的块以最大化快缓存中的数据复用——FlashAttention IO 效率的核心机制。",
      "definition": "分块（blocking）将大矩阵切成适合 GPU 片上 SRAM 的子矩阵（tile）。每 tile 从 HBM 加载一次，用于所需全部计算后丢弃。FlashAttention 将 Q 分行 tile、K/V 分列 tile。对每个 Q tile，kernel 遍历所有 K/V tile，用在线 softmax 累加部分 attention。确保 Q、K、V 每元素从 HBM 读 O(1) 次而非 O(N) 次，大幅减少总内存流量。"
    },
    "tensorrtllm": {
      "name": "TensorRTLLM",
      "role": "Serving 框架",
      "summary": "NVIDIA 编译优先推理引擎：提前图编译、kernel 融合、CUDA Graph 捕获与 plugin 注入，追求 NVIDIA GPU 最大吞吐量。",
      "definition": "TensorRT-LLM 用 NVIDIA TensorRT 深度学习编译器将 LLM 图编译为优化 CUDA engine。构建阶段（约 28 分钟）遍历算子图为目标 GPU 选最优 kernel、融合算子序列（LayerNorm + MatMul + Bias + Activation → 单 kernel）、注入手工 plugin（FlashAttention）、将整个前向捕获为 CUDA Graph。运行时约 90 秒加载 engine。支持 in-flight batching、分页 KV caching、FP8、speculative decoding。经 Triton Inference Server 生产部署。仅 NVIDIA 硬件。"
    },
    "kernelfusion": {
      "name": "KernelFusion",
      "role": "编译器优化",
      "summary": "将多个 GPU 算子合并为单 kernel——消除中间内存写、减少启动开销、改善内存局部性。",
      "definition": "GPU kernel 是 GPU 上启动的独立程序。每次启动有开销，kernel 间数据须经全局内存（HBM）。Kernel fusion 将多算子（如 LayerNorm → MatMul → Bias → Activation）合并为单 kernel，中间结果留在寄存器或共享内存。TensorRT-LLM 编译器自动发现可融合模式；FlashAttention 等复杂融合需手工 plugin。收益与融合算子数及消除的中间张量大小成正比。"
    },
    "cudagraph": {
      "name": "CUDAGraph",
      "role": "运行时优化",
      "summary": "将整段 GPU kernel 启动序列捕获为单 graph 对象——重放时近零启动开销，对延迟敏感 decode 步关键。",
      "definition": "CPU 每次 GPU kernel 启动有微秒级开销。LLM decode 每轮是含许多小 kernel 的短前向，开销累积显著。CUDA Graph 将 kernel 启动序列捕获为可重放 graph，后续单次 CPU 启动重放整图，消除 per-kernel 开销。TensorRT-LLM 将整个前向编译为 CUDA Graph。vLLM 支持分段与完整 CUDA/HIP graph。约束：重放时输入形状须相同，不同批大小需 padding 或多 graph 变体。"
    },
    "expertparallelism": {
      "name": "ExpertParallelism",
      "role": "并行策略",
      "summary": "将 MoE expert 分布到多 GPU——每 GPU 持部分 expert，all-to-all 通信将 token 路由到对应 expert。",
      "definition": "Expert Parallelism 是 MoE 专用模型并行。非复制整模型（data parallelism）或切每层（tensor parallelism），EP 将不同 expert 分配到不同 GPU。前向时路由决定每 token 访问哪些 expert，all-to-all 将 token 发到持有 expert 的 GPU，计算后再 all-to-all 传回。非 expert 层（attention）仍可用 tensor parallelism 或复制。可极宽扩展：DeepSeek-R1 decode 模式用 EP128，每 GPU 1 expert。"
    },
    "eplb": {
      "name": "EPLB",
      "role": "负载均衡系统",
      "summary": "基于运行时 token 路由统计动态再平衡 expert 到 GPU 的分配——复制热 expert、重分布以防 GPU 瓶颈。",
      "definition": "MoE serving 中 token 路由常偏斜——部分 expert（热）收到远多 token，其他（冷）闲置。EPLB 滑动窗口监控每 expert token 数，定期再分配：热 expert 复制到多 GPU 并行服务，冷 expert 合并。权重传输用前向间非阻塞拷贝避免阻塞推理。策略含分层（先节点间再节点内平衡）与全局（无视拓扑全局平衡）。DeepSeek 开发并集成到 vLLM。"
    },
    "moe": {
      "name": "MoE",
      "role": "模型架构",
      "summary": "稀疏 Transformer 架构，每 token 路由到部分 expert FFN——大容量、低每 token 计算成本。",
      "definition": "MoE 将每层标准 FFN 换为多 parallel expert FFN 与学习路由，为每 token 选处理它的 expert（通常 64–256 个中 top-2）。总参数很大（DeepSeek-V3：671B）但每 token 激活参数小（约 37B）。Serving 挑战独特：须加载全部 expert 权重尽管每 token 大多闲置，token 须通信到持有 expert 的 GPU。瓶颈从计算转向内存容量与 GPU 间通信。"
    },
    "prefilldecodeasymmetry": {
      "name": "PrefillDecodeAsymmetry",
      "role": "核心概念",
      "summary": "根本架构张力：prefill 计算受限（并行、高算术强度），decode 内存受限（串行、低算术强度）。",
      "definition": "LLM 推理两阶段硬件画像相反。Prefill 并行处理全部输入 token——高算术强度、计算受限、受益于更多 FLOPS。Decode 顺序生成 token——低算术强度、内存带宽受限、受益于更高 HBM 带宽。该不对称驱动每项主要优化：continuous batching（decode 期间保持 GPU 忙）、speculative decoding（串行 decode 变并行验证）、分离式 serving（阶段分硬件）、chunked prefill（防止 prefill 阻塞 decode）。"
    }
  }
};
