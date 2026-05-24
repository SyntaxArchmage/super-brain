const WIKI_CN = {
  "taxonomy": [
    {
      "id": "compiler",
      "label": "编译器基础设施",
      "children": [
        {
          "id": "mlir",
          "label": "MLIR",
          "type": "article"
        },
        {
          "id": "parser-practice",
          "label": "解析器练习",
          "type": "article"
        },
        {
          "id": "lowering-pipelines",
          "label": "降低管道",
          "type": "article"
        }
      ]
    },
    {
      "id": "hpc",
      "label": "高性能计算",
      "children": [
        {
          "id": "parallel-models",
          "label": "并行编程模型",
          "type": "article"
        },
        {
          "id": "memory-hierarchy",
          "label": "内存层次结构",
          "type": "article"
        }
      ]
    },
    {
      "id": "ai",
      "label": "人工智能",
      "children": [
        {
          "id": "transformer-arch",
          "label": "变压器架构",
          "type": "article"
        },
        {
          "id": "training-dynamics",
          "label": "训练动态",
          "type": "article"
        }
      ]
    },
    {
      "id": "ai-infra",
      "label": "人工智能基础设施",
      "children": [
        {
          "id": "serving-systems",
          "label": "服务系统",
          "type": "article"
        },
        {
          "id": "compiler-ai-infra",
          "label": "AI 编译器堆栈",
          "type": "article"
        }
      ]
    },
    {
      "id": "pl",
      "label": "编程语言",
      "children": [
        {
          "id": "type-systems",
          "label": "类型系统",
          "type": "article"
        },
        {
          "id": "ir-design",
          "label": "IR设计原则",
          "type": "article"
        }
      ]
    }
  ],
  "pages": {
    "index": {
      "title": "超级大脑",
      "subtitle": "一个涵盖编译器基础设施、高性能计算、人工智能系统和编程语言理论的个人研究维基。每篇文章都是一个由主要来源支持的综合知识单元。"
    },
    "mlir": {
      "title": "MLIR",
      "subtitle": "一个可重用、可扩展的多级中间表示框架，支持跨抽象级别的编译器构建——从高级计算图到循环优化再到特定于目标的代码生成。",
      "body": "<h2>什么是 MLIR</h2>\n<p>MLIR（多级中间表示）不是编译器，也不是单个 IR。它是通过组织成命名空间方言的操作、类型和属性的共享框架来构建和组合中间表示的基础设施。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">来源证据</div>\n<p>摘自 MLIR 概述：“MLIR 是一种构建可重用和可扩展编译器基础设施的新颖方法。MLIR 旨在解决软件碎片问题，改进异构硬件的编译，显着降低构建特定领域编译器的成本。”</p>\n</div>\n\n<p>关键的架构见解是，编译器通常会构建多个 IR（高级图、循环嵌套、低级机器），这些 IR 无法共享基础设施，因为它们使用不兼容的数据模型。 MLIR 将这些统一在一个元 IR 框架下，其中每个抽象级别都是一种<em>方言</em>，而不是一个单独的系统。</p>\n\n<div类=“分析”>\n<div class=\"an-label\">分析</div>\n<p>这意味着 MLIR 解决了“IR 阻抗不匹配”问题，即在独立 IR 系统之间交叉时发生的信息丢失（例如，TensorFlow 图 → XLA HLO → LLVM IR）。借助 MLIR，所有级别都共存于一个模块中，并且它们之间的转换是显式的、可审核的方言转换。</p>\n</div>\n\n<h2>递归嵌套：核心结构</h2>\n<p>MLIR 的 IR 是<strong>递归嵌套的</strong>。这不是一个装饰细节——它是区分 MLIR 和 LLVM 等平面 IR 的基本结构选择：</p>\n\n<ul>\n<li><strong>操作</strong> — 原子单位；拥有操作数、结果、后继者、属性、性质和零个或多个区域</li>\n<li><strong>Region</strong> — 区块的有序列表；由包含操作（SSACFG 或 Graph）定义的语义</li>\n<li><strong>Block</strong> — 具有类型化块参数的操作的顺序列表；被终结者瞄准</li>\n<li><strong>Value</strong> — 运算结果或块参数；携带类型和默认使用边缘</li>\n</ul>\n\n<div class=\"证据\">\n<div class=\"ev-label\">原始 IR 示例 - 带有块参数的 CFG</div>\n<pre>func.func @simple(i64, i1) -> i64 {\n^bb0(%a: i64, %cond: i1):\n  cf.cond_br %cond, ^bb1, ^bb2\n\n^bb1：\n  参见 br ^bb3(%a: i64)\n\n^bb2：\n  %b = arith.addi %a, %a : i64\n  参见 br ^bb3(%b: i64)\n\n^bb3(%c: i64):\n  参见 br ^bb4(%c, %a : i64, i64)\n\n^bb4(%d：i64，%e：i64)：\n  %0 = arith.addi %d, %e : i64\n  返回%0：i64\n}</前>\n</div>\n\n<div类=“分析”>\n<div class=\"an-label\">结构观察</div>\n<p>请注意，块参数（<code>%c</code>、<code>%d</code>、<code>%e</code>）完全替换了 phi 节点。这不是语法糖——它意味着控制流合并点的数据流在 CFG 拓扑中是显式的，而不是隐藏在特殊的伪指令中。 MLIR 的任何可视化都必须将块参数视为一流的值源。</p>\n</div>\n\n<h3>遍历模型</h3>\n<p>官方IR结构教程将规范遍历定义为：</p>\n<pre>操作→区域→区块→操作（递归）</pre>\n<p>另外，def-use 遍历：</p>\n<pre>值→用户（操作列表）\n运算→操作数（值列表）</pre>\n\n<p>这两个移动轴是独立的。遏制是结构性的（树）； def-use 是语义的（图）。 MLIR 的忠实再现需要同时实现。</p>\n\n<h2>方言：扩展机制</h2>\n<p>方言是操作、类型和属性的命名空间集合。它们是 MLIR 对扩展问题的答案：如何在不分叉编译器的情况下添加特定于域的操作？</p>\n\n<ul>\n<li>多个方言共存于一个模块中 - 一个函数可以同时包含 <code>linalg</code>、<code>scf</code> 和 <code>arith</code> 操作</li>\n<li>方言转换是显式的 - 将 <code>linalg</code> 转换为 <code>scf</code> 的过程是一个定义良好的转换，具有明确的输入/输出契约</li>\n<li>方言可以是上游（在 LLVM 中维护）或树外（特定于项目）</li>\n</ul>\n\n<div类=“注释”>\n<div class=\"note-label\">实际含义</div>\n<p>读取 MLIR 代码时，操作前缀会告诉您哪个方言拥有它：<code>arith.addi</code>（算术）、<code>cf.cond_br</code>（控制流）、<code>func.func</code>（函数语义）。这个命名空间结构是一个有效的过滤和可视化维度。</p>\n</div>\n\n<h2>范围：SSA 主导与符号间接</h2>\n<p>MLIR 将交叉引用语义分为两个系统，因为它们解决不同的问题：</p>\n\n<h3>SSA 值</h3>\n<p>值在其层级主导范围内可见。块 B 中定义的值可在同一区域（对于 SSACFG 区域）内由 B 主导的任何块中使用。这就是我们熟悉的 SSA 模型。</p>\n\n<h3>符号</h3>\n<p>对于无法表示为 SSA 操作数的跨范围引用（例如调用在不同模块区域中定义的函数），MLIR 使用<strong>符号表</strong>。用 <code>Symbol</code> 特征标记的操作存在于符号表操作中，并通过 <code>SymbolRefAttr</code> 引用。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">与官方文档的主要区别</div>\n<p>“符号引用是非 SSA 的。SymbolRefAttr 引用命名操作，而不是 SSA 值。诸如 <code>@module::@nested_func</code> 之类的嵌套引用是合法且有意义的。”</p>\n</div>\n\n<p>这种双重系统的存在是因为模块级实体（函数、全局变量、外部声明）需要能够跨编译阶段生存的稳定名称 - 这是作用域局部且短暂的 SSA 值无法提供的。</p>\n\n<h2>通行证基础设施</h2>\n<p>MLIR 中的传递是<strong>操作范围</strong>的。传递声明其锚定的操作类型（例如，<code>func.func</code>、<code>module</code>），并且不得检查或改变该操作区域树之外的任何内容。</p>\n\n<ul>\n<li>嵌套的 <code>OpPassManager</code> 结构反映了 IR 嵌套 - 您可以在不同的嵌套级别运行不同的通道</li>\n<li>通道管理器已公开通道之间的计时数据 (<code>-mlir-timing</code>) 和 IR 快照 (<code>-mlir-print-ir-after-all</code>)</li>\n<li>这些是未来管道可视化的自然数据源</li>\n</ul>\n\n<div类=“分析”>\n<div class=\"an-label\">设计洞察</div>\n<p>传递是操作范围的事实意味着转换视图应该植根于操作范围，而不是平面时间轴。在 <code>gpu.module</code> 内的嵌套 <code>func.func</code> 上运行的通道具有特定的结构上下文，平面“通道 N 在时间 T 运行”视图将丢失该结构上下文。</p>\n</div>\n\n<h2>为什么 MLIR 在这个知识库中很重要</h2>\n<p>MLIR 不仅仅是一个编译器主题。它几乎与此处跟踪的每个域相交：</p>\n<ul>\n<li><strong>解析器实践</strong> - MLIR 的 ODS 和自定义汇编格式系统是声明式、可扩展解析器生成的工作示例</li>\n<li><strong>人工智能基础设施</strong> - XLA 的 StableHLO、IREE、TVM 和 Triton 均使用 MLIR 方言进行图形到硬件的编译</li>\n<li><strong>IR 设计</strong> - 递归嵌套、可扩展操作和渐进降低是任何 IR 的可重用原则</li>\n<li><strong>HPC</strong> - MLIR 的<code>仿射</code>、<code>scf</code> 和多面体抽象直接针对并行硬件的循环优化</li>\n</ul>"
    },
    "parser-practice": {
      "title": "解析器练习",
      "subtitle": "在可扩展编译器系统中构建解析器的技术和架构模式——从语法驱动的方法到声明性格式规范。",
      "body": "<h2>概述</h2>\n<p>现代编译器基础设施中的解析器实践超出了传统的语法驱动方法。可扩展系统引入了声明性汇编格式，其中解析器是从操作定义生成的，而不是手写的——将问题从“编写解析器”转移到“指定语法”。</p>\n\n<h2>经典解析与声明式解析</h2>\n<p>传统编译器使用手写的递归下降解析器或解析器生成器（yacc、ANTLR）。这些对于固定语言来说效果很好，但在频繁添加新操作的可扩展系统中却成为维护负担。</p>\n\n<p>声明性替代方案 - 以 MLIR 的 ODS（操作定义规范）为例 - 将语法规范与语义定义放在一起：</p>\n\n<pre>// Tablegen ODS 定义生成解析器和打印机\n让 assemblyFormat = [{\n  $lhs `,` $rhs attr-dict `:` 类型($结果)\n}];</pre>\n\n<div类=“分析”>\n<div class=\"an-label\">权衡分析</div>\n<p>声明性格式牺牲了一些语法灵活性来保证正确性：往返不变性（解析∘打印=身份）是通过构造强制执行的。手写解析器可以生成更精美的错误消息，但需要手动往返测试。</p>\n</div>\n\n<h2>关键模式</h2>\n<ul>\n<li><strong>往返不变性</strong> — <code>parse(print(IR)) == IR</code> 是任何 IR 文本格式的基本正确性属性</li>\n<li><strong>自定义程序集</strong> - 当声明性格式不足时，操作会覆盖通用打印机/解析器以获取适合域的语法</li>\n<li><strong>按前缀分派</strong> - 在可扩展系统中，解析器根据操作的命名空间前缀分派到特定于方言的挂钩</li>\n<li><strong>错误恢复</strong> - 生产解析器必须在错误发生后继续，以便在一次调用中报告多个诊断</li>\n</ul>\n\n<h2>MLIR 对解析器实践的贡献</h2>\n<p>MLIR 证明可扩展 IR 的解析器不必是整体的。每种方言都会注册自己的解析钩子，框架根据操作的前缀进行调度。这是应用于 IR 语法的<em>表达式问题</em>的实际实例 - 无需修改现有解析器即可添加新数据类型（操作）。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">架构模式</div>\n<p>当 MLIR 遇到 <code>arith.addi</code> 时，它会找到 <code>arith</code> 方言，查找 <code>addi</code> 操作注册，并委托给该操作的已注册解析器。添加新方言时无需更新中心语法文件。</p>\n</div>"
    },
    "lowering-pipelines": {
      "title": "降低管道",
      "subtitle": "从高级领域抽象到特定目标表示的渐进式、分阶段转换——在每个级别维护抽象边界和转换契约。",
      "body": "<h2>概述</h2>\n<p>降低管道是一系列转换，逐步将 IR 从高级域抽象转向特定于目标的表示。与单次编译不同，<strong>分阶段降低</strong>允许每个级别在提交较低级别的细节之前应用自己的优化。</p>\n\n<div类=“分析”>\n<div class=\"an-label\">为什么分期很重要</div>\n<p>优化取决于级别。平铺矩阵乘法在 linalg 级别（您可以推断访问模式）有意义，但在 arith 级别（您只能看到标量运算）毫无意义。分段确保每个转换都能看到它所需的抽象。</p>\n</div>\n\n<h2>管道词汇</h2>\n<ul>\n<li><strong>转换</strong> - 将操作从一种方言重写为另一种方言，同时保留在 IR 框架内</li>\n<li><strong>翻译</strong> — 跨越从 IR 到外部表示的边界（例如，MLIR → LLVM IR → 机器代码）</li>\n<li><strong>合法化</strong> - 使 IR 符合目标方言的约束（例如，删除目标不支持的操作）</li>\n</ul>\n\n<div class=\"证据\">\n<div class=\"ev-label\">与 MLIR 术语表的区别</div>\n<p>“转换与翻译不同：一个留在 MLIR 内，另一个进入或离开 MLIR。降低描述的是向较低级别但等效的表示的移动。合法化意味着使 IR 符合转换目标。”</p>\n</div>\n\n<h2>管道架构</h2>\n<p>精心设计的下降管道在每个阶段边界都有明确的契约：</p>\n<ul>\n<li><strong>输入契约</strong> - 接受哪些操作/方言</li>\n<li><strong>输出契约</strong> - 生成哪些操作/方言</li>\n<li><strong>保留不变量</strong> - 哪些属性在转换后仍然存在</li>\n<li><strong>建立不变量</strong> - 输出保证了哪些新属性</li>\n</ul>\n\n<p>这种基于契约的思维支持对管道阶段进行独立测试，并允许不同的前端共享后端阶段（例如，TensorFlow 和 JAX 都可以通过相同的 StableHLO → MHLO → Linalg 管道进行降低）。</p>\n\n<h2>常见管道形状</h2>\n<pre>高级图形方言（例如，StableHLO）\n  → 中层结构化控制（例如 linalg、scf）\n    → 低级硬件方言（例如，gpu、spirv）\n      → 转换为外部目标（例如 LLVM IR、PTX）</pre>\n\n<div类=“注释”>\n<div class=\"note-label\">实际观察</div>\n<p>真实的管道很少是线性的。它们通常具有分支（不同的目标）、收敛（多个源降低到同一中级）和反馈循环（暂时提高抽象以实现进一步降低的优化过程）。</p>\n</div>"
    },
    "parallel-models": {
      "title": "并行编程模型",
      "subtitle": "用于表达和管理高性能系统中并发性的抽象——在表达性、性能透明度和硬件可移植性之间进行权衡。",
      "body": "<h2>概述</h2>\n<p>并行编程模型是程序员的意图（“同时做这些事情”）和硬件的现实（核心、缓存、互连、内存控制器）之间的抽象层。模型的选择决定：</p>\n<ul>\n<li>程序员必须明确推理什么</li>\n<li>运行时/编译器隐式处理的内容</li>\n<li>哪些性能特征是可预测的，哪些是令人惊讶的</li>\n</ul>\n\n<h2>模型分类</h2>\n\n<h3>共享内存</h3>\n<p>具有共享地址空间的线程。通过受同步原语（锁、原子、屏障）保护的加载/存储进行通信。示例：pthreads、OpenMP 并行区域、C++ std::thread。</p>\n\n<div类=“分析”>\n<div class=\"an-label\">权衡</div>\n<p>进入门槛低（熟悉的顺序+注释），但隐藏了缓存一致性、错误共享和 NUMA 效应的成本。 “看起来很快”的程序可能会受到内存限制，而无需任何明显的代码级指示器。</p>\n</div>\n\n<h3>消息传递</h3>\n<p>具有单独地址空间的进程之间的显式发送/接收。所有数据共享都是经过深思熟虑的。示例：MPI、Erlang/OTP、CSP 通道。</p>\n\n<h3>数据并行</h3>\n<p>跨数据集合统一应用相同的操作。该模型限制表达能力（没有任意的元素间通信）以换取大规模硬件并行性。示例：SIMD、GPU 内核 (CUDA/OpenCL)、数组语言（APL、NumPy 矢量化运算）。</p>\n\n<h3>基于任务</h3>\n<p>计算表示为具有依赖边的工作单元的 DAG。运行时将任务调度给工作人员，处理负载平衡和数据移动。示例：Intel TBB、Cilk、OpenMP 任务、Dask。</p>\n\n<h3>数据流</h3>\n<p>由数据可用性触发的计算。当所有输入准备就绪时，节点将触发。自然适合流式处理和管道并行性。示例：TensorFlow 的原始执行模型、脉动数组、硬件数据流架构。</p>\n\n<h2>基本面紧张</h2>\n<p>每个模型都会在以下方面进行权衡：</p>\n<ul>\n<li><strong>表现力</strong> - 哪些计算可以自然地表达</li>\n<li><strong>性能透明度</strong> - 程序员是否可以推断成本</li>\n<li><strong>可移植性</strong> - 代码是否可以在不同硬件上高效运行</li>\n</ul>\n\n<div类=“注释”>\n<div class=\"note-label\">开放问题</div>\n<p>没有一个模型能够主宰所有三个维度。当前的实践通常对模型进行分层（例如，节点之间的 MPI + 节点内的 OpenMP + 内核内的 SIMD），接受边界的复杂性，以实现每个级别的最佳硬件利用率。</p>\n</div>"
    },
    "memory-hierarchy": {
      "title": "内存层次结构",
      "subtitle": "了解和利用现代内存系统的分层结构，其中相邻级别之间的延迟差距跨越 10-100 倍，并主导大多数工作负载的性能。",
      "body": "<h2>概述</h2>\n<p>现代系统具有深层存储器 - 寄存器、L1/L2/L3 缓存、本地 DRAM、远程 DRAM (NUMA)、NVMe 和网络存储。设计性能关键型代码时必须考虑到这种层次结构。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">大约延迟阶梯</div>\n<pre>L1 缓存命中：~1 ns（4 个周期）\nL2 缓存命中：~4 ns（12 个周期）\nL3 缓存命中：~12 ns（40 个周期）\nDRAM 访问：~60 ns（200 个周期）\nNVMe SSD：~10,000 纳秒（10 微秒）\n网络 (DC)：~500,000 ns (0.5 ms)</pre>\n</div>\n\n<p>L1 和 DRAM 之间的 60 倍差距意味着“缓存未命中”并不是轻微的低效率 — 它是<em>每次访问速度减慢 60 倍</em>。对于内存限制的工作负载（大多数实际程序都是如此），缓存行为比指令数更能主导性能。</p>\n\n<h2>局部性原则</h2>\n<ul>\n<li><strong>时间局部性</strong> - 最近访问的数据可能很快就会再次被访问。策略：将工作集保留在缓存中，趁热分多次处理数据。</li>\n<li><strong>空间局部性</strong> - 最近访问的数据附近的数据可能很快就会被访问。策略：使用连续布局，顺序迭代，避免指针追逐。</li>\n</ul>\n\n<div类=“分析”>\n<div class=\"an-label\">编译器相关性</div>\n<p>循环平铺（阻塞）是内存层次结构优化的规范编译器转换 - 它重组迭代顺序以将工作集保持在缓存容量内。 MLIR 的仿射方言和多面体分析框架的存在正是为了自动推理和应用这些转换。</p>\n</div>\n\n<h2>缓存架构</h2>\n<ul>\n<li><strong>缓存行</strong> — 数据移动的最小单位（通常为 64 字节）。即使访问 1 个字节也会获取完整的 64B 行。</li>\n<li><strong>关联性</strong> — 确定给定地址可以放置在缓存中的位置。较高的关联性可以减少冲突，但会增加查找延迟。</li>\n<li><strong>预取</strong> - 硬件检测顺序/跨步模式并提前提取行。不规则的访问模式会破坏这一点。</li>\n</ul>\n\n<h2>NUMA 和多套接字</h2>\n<p>在多插槽系统中，“本地”DRAM（连接到当前插槽）比“远程”DRAM（在另一个插槽上）快约 1.5-2 倍。这会产生<em>非均匀内存访问</em> (NUMA)，其中相对于计算的数据放置决定性能。</p>\n\n<div类=“注释”>\n<div class=\"note-label\">实际含义</div>\n<p>在一个 NUMA 节点上分配内存但在另一个节点上运行线程的并行程序会出现带宽下降和更高的延迟 — 通常称为“远程内存访问惩罚”。首次接触分配策略和线程到核心固定是标准缓解措施。</p>\n</div>"
    },
    "transformer-arch": {
      "title": "变压器架构",
      "subtitle": "现代语言模型、视觉模型和多模态系统背后的基于注意力的架构——用序列上的可并行自注意力取代循环。",
      "body": "<h2>概述</h2>\n<p>Transformer 架构（Vaswani 等人，2017 年，“Attention Is All You Need”）用<strong>自注意力</strong>取代循环，作为序列依赖性建模的主要机制。通过并行而不是顺序计算所有成对关系，它实现了训练时并行性并扩展到更大的模型。</p>\n\n<p>它现在是以下方面的基础：</p>\n<ul>\n<li>语言模型：GPT-4、Claude、LLaMA、Gemini</li>\n<li>愿景：ViT、DINO、细分任何事物</li>\n<li>多式联运：CLIP、Flamingo、GPT-4V</li>\n<li>科学：AlphaFold、蛋白质语言模型</li>\n</ul>\n\n<h2>核心组件</h2>\n\n<h3>自我关注</h3>\n<p>对于序列中的每个位置，计算所有其他位置的加权和。权重由学习到的查询键兼容性决定：</p>\n<pre>注意力(Q, K, V) = softmax(QK^T / √d_k) V</pre>\n<p>其中 Q（查询）、K（键）、V（值）是输入的线性投影。</p>\n\n<div类=“分析”>\n<div class=\"an-label\">复杂性影响</div>\n<p>自注意力的序列长度为 O(n²) - 每个位置都会关注其他每个位置。这种二次成本是主要的扩展瓶颈，并推动了对有效注意力变体（稀疏、线性、闪存注意力）的广泛研究。</p>\n</div>\n\n<h3>多头注意力</h3>\n<p>与不同的学习投影并行运行 h 注意力函数、连接输出并再次投影。这使得模型能够同时处理来自不同表示子空间的信息。</p>\n\n<h3>前馈网络</h3>\n<p>位置两层 MLP 在注意力之后独立应用于每个位置。通常将维度扩展 4 倍，然后投影回来：<code>FFN(x) = W2 · GELU(W₁x + b₁) + b2</code></p>\n\n<h3>残差连接+层归一化</h3>\n<p>每个子层（注意力，FFN）都有一个残差跳过连接和归一化。对于深度训练的稳定性，预规范（在子层之前进行规范化）现在是相对于后规范的标准。</p>\n\n<h2>缩放法则</h2>\n<p>Transformers 表现出可预测的扩展：性能随着计算 (C)、数据集大小 (D) 和参数计数 (N) 的幂律而提高。 Chinchilla 缩放法则建议最佳分配按比例平衡参数和数据。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">缩放关系</div>\n<p>损失 ≈ (C/C₀)^{−α}，其中 α ≈ 0.05–0.1，具体取决于域。这种可预测性使得能够规划数十亿美元的训练运行 - 您可以从早期检查点估计最终损失。</p>\n</div>\n\n<h2>自回归生成</h2>\n<p>对于生成（GPT 样式），一次生成一个代币，每个代币都以所有先前的代币为条件。 <strong>KV 缓存</strong>存储过去的键值对，以避免在每个步骤中重新计算整个历史记录的注意力 - 用内存换取计算。</p>\n\n<div类=“注释”>\n<div class=\"note-label\">基础设施影响</div>\n<p>KV 缓存内存随序列长度和批量大小线性增长。对于长上下文模型（128K+ token），KV 缓存可能会超出模型参数的内存占用量。这推动了 PagedAttention (vLLM)、GQA 和 MQA 等创新。</p>\n</div>"
    },
    "training-dynamics": {
      "title": "训练动态",
      "subtitle": "神经网络如何学习：优化景观几何、大规模的涌现能力以及过度参数化系统中出现的令人惊讶的现象。",
      "body": "<h2>概述</h2>\n<p>训练动态涵盖了神经网络在优化过程中的行为 - 如何导航损失景观、内部表示如何形成和重组，以及在大规模过度参数化的情况下如何出现泛化。</p>\n\n<h2>损失景观几何</h2>\n<p>深度网络的损失函数定义了参数空间中的一个表面，其维度等于参数计数（现代模型的维度为数十亿）。主要结构特点：</p>\n<ul>\n<li><strong>鞍点</strong> - 在高维度中主导局部最小值。大多数“卡住”训练是在鞍座上进行的，而不是最低限度的训练。</li>\n<li><strong>平坦最小值</strong> - 损失对参数扰动不敏感的区域。据推测概括性优于尖锐最小值。</li>\n<li><strong>损耗壁垒</strong> - 不同解决方案之间的高损耗脊线。模式连接研究表明，这些通常可以沿着弯曲的路径绕过。</li>\n</ul>\n\n<div类=“分析”>\n<div class=\"an-label\">实际含义</div>\n<p>学习率预热和余弦衰减时间表并不是任意的启发式方法——它们是导航景观几何的策略。预热避免初始化附近急剧损失区域的早期发散；衰减允许在训练后期稳定在平坦最小值。</p>\n</div>\n\n<h2>涌现现象</h2>\n\n<h3>摸索</h3>\n<p>网络首先记住训练数据（实现零训练损失），然后<em>很久</em>突然推广到测试集。这种延迟的泛化表明，即使在训练损失趋于稳定之后，表征也会在内部进行重组。</p>\n\n<h3>相变</h3>\n<p>功能在特定模型比例下突然出现 - 在较小尺寸下不存在，在较大尺寸下出现，并且之间没有平滑插值。示例：情境学习、思维链推理、多语言迁移。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">扩展研究观察</div>\n<p>许多“新兴”能力似乎是测量工件 - 能力是否看起来是新兴的取决于评估指标（像精确匹配这样的不连续指标显示阶段转换；像令牌对数概率这样的连续指标显示平滑改进）。</p>\n</div>\n\n<h2>优化动态</h2>\n<ul>\n<li><strong>Adam 优化器</strong> - 通过第一/第二矩估计自适应每个参数学习率。变压器培训的事实上的标准。</li>\n<li><strong>梯度累积</strong> - 通过在更新之前平均多个前向传递的梯度来模拟更大的批量大小。</li>\n<li><strong>梯度裁剪</strong> - 限制梯度范数，以防止异常批次导致训练不稳定。</li>\n</ul>\n\n<div类=“注释”>\n<div class=\"note-label\">开放研究问题</div>\n<p>为什么过度参数化网络会泛化？经典学习理论预测它们会灾难性地过度适应。 “双下降”现象和 SGD 的隐式正则化部分解释了这一点，但完整的理论仍然难以捉摸。</p>\n</div>"
    },
    "serving-systems": {
      "title": "服务系统",
      "subtitle": "用于在生产规模部署 ML 模型的基础设施 - 管理可变请求负载下的延迟 SLO、吞吐量最大化和内存效率之间的紧张关系。",
      "body": "<h2>概述</h2>\n<p>机器学习服务系统处理推理路径——从接收请求到返回预测。特别是对于 LLM，这涉及管理 KV 缓存、尊重延迟限制的批处理策略以及最大化 GPU 利用率的调度。</p>\n\n<h2>法学硕士服务挑战</h2>\n<p>LLM 推理分为两个阶段，计算特性截然不同：</p>\n<ul>\n<li><strong>预填充</strong> - 并行处理所有输入标记（计算限制，如训练）</li>\n<li><strong>解码</strong> - 一次自回归生成一个令牌（内存带宽限制，低算术强度）</li>\n</ul>\n\n<div类=“分析”>\n<div class=\"an-label\">资源不平衡</div>\n<p>预填充使 GPU 计算饱和；解码几乎不使用它，但读取 KV 缓存会使内存带宽饱和。简单的系统在解码过程中浪费了 GPU 周期。解决方案：将预填充和解码分解到不同的硬件，或者将许多解码请求一起批处理以分摊内存读取。</p>\n</div>\n\n<h2>批处理策略</h2>\n<ul>\n<li><strong>静态批处理</strong> - 固定批处理，所有序列都填充到最大长度。简单但浪费了填充计算。</li>\n<li><strong>动态批处理</strong> — 对某个时间窗口内到达的请求进行分组。利用率更高，但会因等待而增加延迟。</li>\n<li><strong>连续批处理</strong> - 在现有批次完成后将新请求插入到正在运行的批次中。无填充浪费，无批次延迟。</li>\n<li><strong>迭代级调度</strong> - 在每次解码迭代时做出调度决策，从而实现抢占和优先级。</li>\n</ul>\n\n<h2>内存管理</h2>\n<p>对于服务于长上下文的 70B 参数模型，KV 缓存可能超过 GPU 内存中的模型权重。主要创新：</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">PagedAttention (vLLM)</div>\n<p>受操作系统虚拟内存的启发，PagedAttention 将 KV 缓存存储在非连续块（“页面”）中，按需分配并跨并行序列共享页面（例如波束搜索）。消除了在简单实现中浪费 60-80% KV 缓存内存的碎片。</p>\n</div>\n\n<ul>\n<li><strong>分组查询注意力 (GQA)</strong> - 在多个查询头之间共享键值头，通过组因子减少 KV 缓存大小</li>\n<li><strong>KV 缓存量化</strong> — 以较低精度（FP8、INT4）存储缓存的键/值，同时将质量损失降至最低</li>\n<li><strong>前缀缓存</strong> — 在所有请求中共享通用前缀（系统提示）的 KV 缓存</li>\n</ul>\n\n<h2>延迟指标</h2>\n<ul>\n<li><strong>TTFT</strong>（第一个令牌的时间）— 第一个响应令牌出现的速度。由预填充时间主导。</li>\n<li><strong>TPOT</strong>（每个输出令牌的时间）— 生成过程中令牌间的延迟。由解码内存带宽主导。</li>\n<li><strong>吞吐量</strong> — 所有并发请求的总令牌数/秒。通过大批量最大化。</li>\n</ul>\n\n<div类=“注释”>\n<div class=\"note-label\">基本权衡</div>\n<p>TTFT 和吞吐量处于紧张状态。较大的批次可提高吞吐量，但会增加排队时间（损害 TTFT）。生产系统必须根据 SLO 要求进行这种权衡——交互式聊天需要低 TTFT；批处理需要高吞吐量。</p>\n</div>"
    },
    "compiler-ai-infra": {
      "title": "AI 编译器堆栈",
      "subtitle": "编译器基础设施如何实现跨不同硬件的高效 AI 模型执行 - 通过分阶段降低和特定于域的优化来桥接框架级图形和特定于目标的代码。",
      "body": "<h2>概述</h2>\n<p>AI 编译器堆栈将高级模型图（以 PyTorch、JAX、TensorFlow 等框架表示）转换为高效的硬件特定代码（在 GPU、TPU、自定义加速器上运行）。这从根本上来说是一个<em>降低管道</em>问题 - 编译器基础设施解决的挑战相同，但具有特定于域的操作（matmul、卷积、注意力）和特定于目标的约束（张量核心形状、内存层次结构）。</p>\n\n<h2>编译差距</h2>\n<p>框架将计算表达为高级运算符图：</p>\n<pre>y = torch.nn.function.linear(x, 权重, 偏差)\n# 用户写的内容：一行\n\n# 需要什么硬件：平铺矩阵乘法，\n# 内存暂存、寄存器分配、同步</pre>\n\n<div类=“分析”>\n<div class=\"an-label\">为什么这很重要</div>\n<p>框架操作符和硬件指令之间的差距是巨大的。手动优化的内核（cuBLAS、cuDNN）弥补了常见操作的这一差距，但新颖的架构（稀疏注意力、MoE 路由、状态空间模型）需要自定义编译才能实现良好的性能。</p>\n</div>\n\n<h2>主要系统</h2>\n\n<h3>XLA（加速线性代数）</h3>\n<p>Google 的 TensorFlow/JAX 编译器。使用 StableHLO（基于 MLIR）作为输入，内部使用 MHLO，并以 TPU、GPU 和 CPU 为目标。关键优势：跨运营边界的整体程序优化。</p>\n\n<h3>TVM / Apache TVM</h3>\n<p>具有 Relay IR 前端和 TIR (Tensor IR) 后端的与框架无关的编译器。特点是自动调整 - 搜索有效实现的空间以找到特定硬件的最快实现。</p>\n\n<h3>海卫一</h3>\n<p>用于平铺计算的 Python 原生 GPU 内核编译器。程序员使用 Python 编写具有显式平铺注释的内核； Triton 处理内存合并、共享内存分级和指令选择。定制内核的门槛低于 CUDA。</p>\n\n<h3>IREE</h3>\n<p>用于部署机器学习模型的基于 MLIR 的端到端编译器。从高级 MLIR 方言到调度、平铺和矢量化再到本机代码的完整管道。针对 CPU、GPU 和嵌入式加速器。</p>\n\n<h3>torch.compile (PyTorch 2)</h3>\n<p>PyTorch 的 JIT 编译。 TorchDynamo 捕获 Python 执行轨迹； TorchInductor 生成 triton 内核或 C++ 代码。关键创新：无需静态图即可捕获图。</p>\n\n<h2>MLIR 的统一作用</h2>\n<p>MLIR 提供共享基础设施层。 XLA 的 StableHLO、IREE 的完整管道和部分 TVM 使用 MLIR 方言。这种融合意味着理解 MLIR 的设计原则（递归嵌套、方言转换、渐进降低）可以提供对所有这些系统的结构洞察。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">收敛证据</div>\n<p>StableHLO（XLA 的输入格式）是一种 MLIR 方言。 IREE 的整个管道是 MLIR 端到端的。 Torch-MLIR 将 PyTorch 桥接到 MLIR。生态系统正在以 MLIR 作为共享基础，即使不同的系统在更高的抽象级别上做出不同的选择。</p>\n</div>"
    },
    "type-systems": {
      "title": "类型系统",
      "subtitle": "用于对值进行分类、防止错误和实现优化的静态和动态类型规则——从简单的整数/字符串区别到依赖类型编码证明。",
      "body": "<h2>概述</h2>\n<p>类型系统将程序值分类为类别（类型），并强制执行有关不同类型的值如何交互的规则。至少，这可以防止类别错误（将字符串添加到整数）；最多，它可以编码复杂的不变量，使整个类别的错误无法表示。</p>\n\n<h2>基本尺寸</h2>\n<ul>\n<li><strong>静态与动态</strong> - 在编译时（Rust、Haskell）或运行时（Python、JavaScript）检查</li>\n<li><strong>名义与结构</strong> - 按名称（Java、C#）或按形状/结构（TypeScript、OCaml 模块）进行类型标识</li>\n<li><strong>子类型化</strong> — 类型 A 是否可以用于需要类型 B 的地方（协方差、逆变）</li>\n<li><strong>参数多态性</strong> - 对类型参数进行抽象的泛型 (<code>List<T></code>)</li>\n<li><strong>线性/仿射类型</strong> - 仅使用一次（线性）或最多一次（仿射）的值。无需 GC（Rust 的所有权）即可实现资源管理。</li>\n</ul>\n\n<div类=“分析”>\n<div class=\"an-label\">健全性谱</div>\n<p>如果类型良好的程序在运行时不会产生类型错误，那么类型系统就是健全的。大多数实用语言为了方便而牺牲了健全性（Java 的 null、TypeScript 的 any、协变数组）。在大多数情况下，Rust 因在不牺牲人体工程学的情况下保持健全性而闻名。</p>\n</div>\n\n<h2>编译器 IR 中的类型</h2>\n<p>在编译器基础设施中，类型的用途与源语言中的不同 - 它们携带代码生成所需的表示信息：</p>\n<ul>\n<li><code>i64</code> — 64 位整数，适合寄存器</li>\n<li><code>memref<16x16xf32></code> — 指向布局已知的 16×16 浮点缓冲区的指针</li>\n<li><code>tensor<?x256xf16></code> — 值语义中的动态形状张量</li>\n</ul>\n\n<div class=\"证据\">\n<div class=\"ev-label\">MLIR 的可扩展类型</div>\n<p>MLIR 允许每种方言定义自己的类型。张量类型（值语义，无内存布局）与 memref（引用语义，显式布局）共存。从张量降低到 memref 是一个经过深思熟虑的编译步骤——“缓冲”——引入了内存管理。</p>\n</div>\n\n<h2>实际影响</h2>\n<p>更强大的类型系统可以更早地捕获更多错误，但需要更多的程序员努力。现代语言设计的趋势是朝着<em>渐进式</em>（TypeScript、Python 类型提示）和<em>重推理</em>系统（Rust、Kotlin）发展，它们可以提供强有力的保证，而无需过多的注释负担。</p>\n\n<div类=“注释”>\n<div class=\"note-label\">研究前沿</div>\n<p>依赖类型（Idris、Agda、Lean）允许类型依赖于值 - 例如，<code>Vector n a</code>，其中 <code>n</code> 是类型检查时已知的自然数。这使得可以直接在类型系统中编码矩阵维度兼容性、协议状态机和数学证明。代价是：类型推断变得更加困难，错误消息也更加复杂。</p>\n</div>"
    },
    "ir-design": {
      "title": "IR设计原则",
      "subtitle": "设计中间表示时的基本架构选择（粒度、可扩展性、嵌套深度和元数据保存）决定了哪些转换是自然的以及哪些信息可以通过编译。",
      "body": "<h2>概述</h2>\n<p>中间表示（IR）是编译器内部操作的数据结构。它的设计是编译器中最重要的架构决策 - 它决定哪些分析是廉价的，哪些转换是自然的，以及在编译过程中保留或丢弃哪些信息。</p>\n\n<h2>关键设计选择</h2>\n\n<h3>粒度</h3>\n<ul>\n<li><strong>表达式级 (SSA)</strong> — 每个子表达式都有明确的名称和定义点。 LLVM、MLIR。</li>\n<li><strong>语句级</strong> — 对具有显式控制流的命名变量进行操作。三地址码。</li>\n<li><strong>图级</strong> - 作为运算符 DAG 的计算。 TensorFlow、ONNX。</li>\n</ul>\n\n<h3>SSA 表格</h3>\n<p>单一静态赋值：每个值仅定义一次。这个不变量使得数据流分析变得微不足道 - 定义点<em></em>是到达的定义，不需要迭代。</p>\n\n<div class=\"证据\">\n<div class=\"ev-label\">为什么 SSA 有效</div>\n<p>如果没有 SSA，确定“变量 x 的哪个定义达到此用途”需要迭代到固定点。对于 SSA，定义和使用直接相关。这将迭代分析转换为直接图遍历 - 编译器最常见的操作变为每条边 O(1)，而不是 O(n) 迭代。</p>\n</div>\n\n<h3>嵌套结构</h3>\n<ul>\n<li><strong>扁平</strong> — 函数包含基本块的扁平列表。 LLVM 红外。简单，遍历速度快，但必须重建结构信息（循环、区域）。</li>\n<li><strong>递归</strong> — 操作可以包含包含操作的区域。 MLIR。保留结构，但遍历更复杂。</li>\n<li><strong>节点海</strong> - 融合数据和控制流图，没有明确的基本块。 V8 涡轮风扇，格拉尔。允许重新排序，但更难推理调度。</li>\n</ul>\n\n<div类=“分析”>\n<div class=\"an-label\">MLIR 的结构洞察</div>\n<p>平面 IR 破坏了计算成本高昂的结构信息（循环边界、操作范围、区域语义）。 MLIR 的递归嵌套通过构造保留此信息 - 包含区域的 <code>scf.for</code> 操作是循环，而不是必须被识别为循环的分支模式。</p>\n</div>\n\n<h3>可扩展性</h3>\n<ul>\n<li><strong>固定指令集</strong> - LLVM 有大约 60 条指令的封闭集。新的运营必须降低到现有的水平。</li>\n<li><strong>开放操作集</strong> - MLIR 允许通过方言进行任意新操作。领域概念可以直接表示，无需过早降低。</li>\n</ul>\n\n<h2>元数据和来源</h2>\n<p>一个关键但经常被低估的选择：有多少源级信息保留在 IR 中？调试信息、类型注释、优化备注、源位置——所有这些都必须显式保留，因为默认情况下降低是有损的。</p>\n\n<h2>设计权衡</h2>\n<pre>更多结构→更容易分析，更难遍历\n更多可扩展性 → 更具表现力，更难验证\n更多元数据 → 更好的调试、更大的 IR 大小\n更高的抽象→更多的优化机会，更长的管道</pre>\n\n<div类=“注释”>\n<div class=\"note-label\">基本张力</div>\n<p>每个 IR 设计都是对哪些分析和转换最重要的赌注。 LLVM 押注于基于 SSA 的标量优化。 MLIR 押注于跨抽象边界的多级转换。两者都不是普遍更好的——正确的选择取决于您正在编译的内容以及您的目标硬件。</p>\n</div>"
    }
  },
  "concepts": {
    "operation": {
      "name": "手术",
      "role": "核心实体",
      "summary": "中央 MLIR 抽象。拥有操作数、结果、区域、属性。完全可扩展——每种方言都定义了自己的操作。",
      "definition": "操作是 MLIR 的原子构建块。与固定指令 IR（LLVM 有约 60 条指令）不同，MLIR 操作是完全可扩展的——任何方言都可以定义新操作。每个操作都可以拥有操作数（输入值）、结果（输出值）、后继者（分支目标）、属性（编译时常量）、特性（可变元数据）和区域（嵌套 IR）。",
      "examples": "<pre>// 函数操作（拥有带块的区域）\nfunc.func @matmul(%A: memref<16x16xf32>, %B: memref<16x16xf32>) {\n  // 算术运算（产生结果值）\n  %c0 = arith.constant 0.0 : f32\n  // Linalg 操作（拥有定义计算体的区域）\n  linalg.matmul ins(%A, %B : memref<16x16xf32>, memref<16x16xf32>)\n               输出（％C：memref<16x16xf32>）\n  返回\n}</前>\n<p>请注意 <code>func.func</code> 如何包含一个区域，<code>arith.constant</code> 生成一个值，以及 <code>linalg.matmul</code> 如何携带复杂的结构化属性。所有这些都是“操作”——抽象将它们统一起来。</p>"
    },
    "value": {
      "name": "价值",
      "role": "核心实体",
      "summary": "输入 def-use 边缘。操作结果或块参数。仅有一个定义点，但可能有多个用户。",
      "definition": "MLIR 中的值表示类型化的运行时数据。每个值都具有一个定义点（作为运算结果或块参数）和零个或多个用途（作为其他运算的操作数）。这种单一定义属性是 SSA 不变量，它使数据流分析变得微不足道。",
      "examples": "<pre>// %a 是块参数（由块定义）\n^bb0(%a: i64, %cond: i1):\n  // %b 是运算结果（由arith.addi定义）\n  %b = arith.addi %a, %a : i64\n  // ↑ 使用 %a 两次\n  // %b 作为块参数流向分支\n  参见 br ^bb1(%b: i64)\n  // ↑ %b 在这里用作分支参数\n\n^bb1(%c: i64): // %c接收分支传递的值\n  返回 %c : i64</pre>\n<p>块参数完全替换 phi 节点。控制流合并点的数据流在 CFG 拓扑中是明确的 - 没有神奇的“phi 指令”在前驱之间隐式选择。</p>"
    },
    "region": {
      "name": "地区",
      "role": "结构",
      "summary": "操作所拥有的有序块。语义（SSACFG 或图）取决于包含操作，而不是区域本身。",
      "definition": "区域是操作所拥有的块的有序列表。重要的是，区域没有独立的语义——它的含义完全由包含操作决定。 func.func 内的区域的行为类似于 SSACFG（控制流是有意义的）；图重写操作内的区域可能没有排序要求。",
      "examples": "<pre>// SSACFG 区域：顺序和控制流很重要\nfunc.func @example() {\n  ^entry: // ← 该区域的区块 1\n    ...\n    参见 br ^body\n  ^body: // ← 块 2\n    ...\n    cf.cond_br %c, ^然后, ^退出\n  ^然后: // ← 块 3\n    ...\n  ^退出：//←块4\n    返回\n}\n\n// 图形区域：操作没有固有的顺序\n“测试.graph_op”() ({\n  %a = \"test.foo\"() : () -> i32\n  %b = \"test.bar\"() : () -> i32\n  // %a 和 %b 可以按任何顺序执行\n}) : () -> ()</pre>\n<p>UI 必须显示区域类型，因为它会改变排序和控制流箭头是否具有语义意义或仅仅是装饰性的。</p>"
    },
    "block": {
      "name": "堵塞",
      "role": "结构",
      "summary": "带有类型块参数的顺序操作列表。 CFG 终止符目标块。块参数替换 phi 节点。",
      "definition": "块是区域内操作的顺序列表。在 SSACFG 区域中，块就像经典编译器中的基本块 - 它们具有单个入口点和一个将控制转移到后续块的终止符。 MLIR 的关键创新是块参数：通过分支指令传递的类型化参数，消除了对 phi 节点的需要。",
      "examples": "<pre>// 阻止操作中的参数：\n^bb0(%x: i64, %标志: i1):\n  cf.cond_br %flag, ^bb1, ^bb2\n\n^bb1：\n  %a = arith.constant 42 : i64\n  cf.br ^merge(%a: i64) // 将 %a 传递给 ^merge\n\n^bb2：\n  %b = arith.constant 0 : i64\n  cf.br ^merge(%b: i64) // 将 %b 传递给 ^merge\n\n^merge(%result: i64): // 接收传入的内容\n  返回%结果：i64</pre>\n<p>与 LLVM 的 phi 比较：<code>%result = phi i64 [%a, %bb1], [%b, %bb2]</code>。块参数使通过控制流边缘的数据流在分支指令本身中明确且可见。</p>"
    },
    "dialect": {
      "name": "方言",
      "role": "命名空间",
      "summary": "扩展机制将操作、类型、属性分组到命名空间下。多种方言并存；它们之间的转换是显式的。",
      "definition": "Dialect 是 MLIR 对扩展问题的解决方案：如何在不分叉编译器的情况下添加特定于域的操作？每种方言都定义了一个包含操作、类型和属性的名称空间（例如“arith”、“linalg”、“gpu”）。多个方言共存于一个模块中——一个函数可以同时包含 arith、scf 和 linalg 的操作。",
      "examples": "<pre>// 多种方言共存于一个函数中：\nfunc.func @mixed_dialects(%input: 张量<8x8xf32>) -> 张量<8x8xf32> {\n  // 'arith' 方言 — 标量算术\n  %zero = arith.constant 0.0 : f32\n\n  // 'linalg'方言 — 结构化线性代数\n  %filled = linalg.fill ins(%zero: f32) outs(%input: 张量<8x8xf32>)\n\n  // 'scf' 方言 — 结构化控制流\n  %结果 = scf.for %i = %c0 到 %c8 步骤 %c1\n            iter_args(%acc = %filled) -> 张量<8x8xf32> {\n    ...\n    scf.yield %更新：张量<8x8xf32>\n  }\n  返回％结果：张量<8x8xf32>\n}</前>\n<p>关键方言：<code>func</code>（函数）、<code>arith</code>（算术）、<code>cf</code>（控制流）、<code>scf</code>（结构化循环）、<code>memref</code>（内存缓冲区）、<code>tensor</code>（值语义张量）、<code>linalg</code>（线性代数）、 <code>gpu</code>（GPU 操作）、<code>llvm</code>（LLVM IR 降低目标）。</p>"
    },
    "symbol": {
      "name": "象征",
      "role": "范围",
      "summary": "符号表中的命名操作。通过 SymbolRefAttr 进行引用，以实现 SSA 主导无法表达的跨范围访问。",
      "definition": "符号提供了 MLIR 的跨范围引用机制。虽然 SSA 值仅在其主导范围内可见，但符号是命名操作，可以通过 SymbolRefAttr 从任何地方引用。函数、全局变量和模块级实体通常是符号。",
      "examples": "<pre>// @matmul 是一个符号 — 按名称引用，而不是按 SSA 值引用\n模块{\n  // 符号定义：命名函数\n  func.func @matmul(%A: memref<4x4xf32>, %B: memref<4x4xf32>) {\n    ...\n  }\n\n  func.func @caller() {\n    // 符号引用：按名称调用\n    func.call @matmul(%x, %y) : (memref<4x4xf32>, memref<4x4xf32>) -> ()\n    // ^^^^^^^ 这是一个 SymbolRefAttr，而不是一个 SSA 操作数\n\n    // 嵌套符号参考：\n    func.call @library::@helper() : () -> ()\n    // ^^^^^^^^^^^^^^^^^^^^^ 嵌套： module \"library\", func \"helper\"\n  }\n}</前>\n<p>符号的存在是因为模块级实体需要能够跨编译阶段生存的稳定名称。在 MLIR 的设计中，您无法将“函数指针作为 SSA 值传递”——您可以通过符号名称来引用函数。</p>"
    },
    "pass": {
      "name": "经过",
      "role": "转型",
      "summary": "运营范围的转型。嵌套通道管理器镜像 IR 嵌套。不得在锚定范围之外发生变异。",
      "definition": "MLIR 中的传递是对特定操作类型（其“锚点”）进行操作的转换。传递不得检查或改变锚点操作的区域树之外的任何内容。此范围规则支持并行性：独立操作的传递可以同时运行。",
      "examples": "<pre>//传递管道结构（镜像IR嵌套）：\n// mlir-opt input.mlir -pass-pipeline='\n// 内置模块(\n// func.func(\n// 规范化，← 在每个 func.func 上运行\n// cse ← 在每个 func.func 上运行\n// ),\n// 内联，← 在模块上运行\n// func.func(\n// 将 linalg 转换为循环 ← 降低通道\n// )\n// )'\n\n// 嵌套结构的意思是：\n// 1. canonicalize + cse 在每个函数内部运行\n// 2. 在模块级别内联运行（可以看到所有函数）\n// 3. linalg-to-loops 在内联后在每个函数内部运行</pre>\n<p>通道管理器公开时序 (<code>-mlir-timing</code>) 和 IR 快照 (<code>-mlir-print-ir-after-all</code>) - 这些是管道可视化的自然数据源。</p>"
    },
    "lowering": {
      "name": "降低",
      "role": "转型",
      "summary": "向低级抽象的渐进运动。与转换（同一级别）和翻译（离开 MLIR）不同。",
      "definition": "降低是IR从较高抽象层次到较低抽象层次的逐步转变。它不同于转换（在同一抽象级别的方言之间重写）和翻译（完全留下 MLIR 来发出 LLVM IR、机器代码等）。",
      "examples": "<pre>// 将链从高层降低到低层：\n\n// 第 1 级：linalg（结构化计算）\nlinalg.matmul ins(%A, %B) outs(%C)\n\n// ↓ 将 linalg 降低到循环（scf 方言）\n// 第 2 级：scf（结构化控制流）\nscf.for %i = 0 到 N {\n  scf.for %j = 0 到 N {\n    scf.for %k = 0 到 N {\n      %a = memref.load %A[%i, %k]\n      %b = memref.load %B[%k, %j]\n      %c = arith.mulf %a, %b\n      ...\n    }\n  }\n}\n\n// ↓ 将 scf 降低为 cf（非结构化控制流）\n// 第 3 级：cf（基于分支）\n^循环头：\n  cf.cond_br %完成，^退出，^body\n^正文：\n  ...\n  参见 br ^loop_header\n\n// ↓ 转换为 LLVM IR（离开 MLIR）\n// 第 4 级：LLVM IR（外部）\n定义 void @matmul(...) { ... }</pre>"
    },
    "self-attention": {
      "name": "自我关注",
      "role": "机制",
      "summary": "通过学习的查询键兼容性对所有序列位置进行加权聚合。序列长度为 O(n²)。",
      "definition": "对于序列中的每个位置，自注意力计算所有其他位置的加权和。权重（注意力分数）由当前位置的“查询”向量与所有其他位置的“关键”向量之间的兼容性确定。这允许每个令牌直接关注每个其他令牌，无论距离如何。",
      "examples": "<pre>// 注意力计算：\n// Q, K, V ∈ ℝ^(seq_len × d_model)\n\n注意力(Q, K, V) = softmax(QK^T / √d_k) · V\n\n// 对于长度 n=4 的序列：\n// Q·K^T 产生一个 4×4 的注意力矩阵\n// 经过softmax后每行总和为1\n// 第 i 行告诉位置 i 需要注意其他位置的程度\n\n// 多头：并行运行 h 个注意力函数\nMultiHead(Q, K, V) = Concat(head_1, ..., head_h) · W_O\n  其中 head_i = Attention(Q·W_Q_i, K·W_K_i, V·W_V_i)</pre>\n<p>O(n²) 成本来自 QK^T 矩阵乘法 - 每个查询都必须与每个键进行点积。对于序列长度 128K，这意味着每层有 160 亿个注意力分数。</p>"
    },
    "kv cache": {
      "name": "KV缓存",
      "role": "优化",
      "summary": "缓存键值对以实现高效的自回归生成。避免重新计算注意力历史记录。内存随着上下文长度线性增长。",
      "definition": "在自回归生成过程中，每个新令牌都需要关注所有先前的令牌。如果没有缓存，这意味着在每个步骤中重新计算整个历史记录的所有键值投影（总共 O(n²)）。 KV 缓存存储先前计算的键和值张量，因此每个新令牌仅计算自己的 K/V 并重用缓存的历史记录。",
      "examples": "<pre>// 没有 KV 缓存（朴素生成）：\n// 步骤 1：计算 [t1] → 1 KV 对的注意力\n// 步骤 2：计算 [t1, t2] → 2 个 KV 对的注意力（重新计算！）\n// 步骤 3：计算 [t1, t2, t3] → 3 个 KV 对的注意力（重新计算！）\n// 总 KV 计算：1+2+3+...+n = O(n²)\n\n// 使用 KV 缓存：\n// 步骤1：计算K1，V1，缓存它们→缓存：[K1，V1]\n// 步骤2：计算K2,V2，关注cache+new→cache: [K1,V1,K2,V2]\n// 步骤3：计算K3,V3，关注cache+new→cache: [K1,V1,K2,V2,K3,V3]\n// 总 KV 计算：n（线性！）\n\n// 每层的内存消耗：\n// 2 × seq_len × num_heads × head_dim × dtype_bytes\n// 对于 Llama-70B，128K 上下文：\n// 2 × 131072 × 64 × 128 × 2 字节 = 每层约 4 GB\n// × 80 层 = ~320 GB (!) 仅用于 KV 缓存</pre>\n<p>这就是为什么服务长上下文模型需要 PagedAttention（非连续分配）、GQA（共享 KV 头）和 KV 缓存量化 (FP8/INT4) 等技术。</p>"
    },
    "ssa": {
      "name": "SSA",
      "role": "形式",
      "summary": "单一静态分配。每个值只定义一次。对每条边进行 def-use 分析 O(1)。",
      "definition": "单静态赋值是一种 IR 属性，其中每个变量（值）只被赋值一次。这极大地简化了数据流分析：要查找值的定义位置，只需查看其唯一的定义点即可。不需要迭代到固定点，因为到达定义很容易解决。",
      "examples": "<pre>// 非 SSA（传统）：\nx = 1\nx = x + 1 // 哪个“x”？需要到达定义分析\ny = x * 2 // x 到达这里的哪个定义？\n\n// SSA 表格：\nx1 = 1\nx2 = x1 + 1 // 明确：使用 x1，定义 x2\ny1 = x2 * 2 // 明确：使用 x2\n\n// 在控制流合并时，SSA 需要一种机制来选择：\n// LLVM 使用 phi 节点：\n// %x3 = phi [%x1, %bb1], [%x2, %bb2]\n// MLIR 使用块参数：\n// ^merge(%x3: i32): // 从前驱分支接收</pre>\n<p>SSA 转换“哪个定义达到此用途？”从迭代 O(n) 分析到直接 O(1) 指针的问题如下。这就是为什么几乎所有现代编译器 IR 都使用 SSA 形式。</p>"
    },
    "locality": {
      "name": "地点",
      "role": "原则",
      "summary": "决定缓存效率的时间（尽快重用）和空间（附近访问）模式。",
      "definition": "局部性是指程序在任何给定时间都倾向于访问其地址空间的一小部分的原则。时间局部性意味着最近访问的数据可能很快就会再次被访问。空间局部性意味着最近访问的数据附近的数据很可能接下来会被访问。这些模式就是缓存所利用的——如果没有局部性，缓存将毫无用处。",
      "examples": "<pre>// 良好的时间局部性（每次迭代重用“sum”）：\n浮点总和=0；\nfor (int i = 0; i < N; i++)\n  总和+= arr[i];  // 'sum' 保留在寄存器/L1 中\n\n// 良好的空间局部性（顺序访问）：\nfor (int i = 0; i < N; i++)\n  arr[i] *= 2;  // 每次访问比前一次访问+4个字节\n                 // 预取器检测步幅，预取行\n\n// 错误局部性（随机访问）：\nfor (int i = 0; i < N; i++)\n  arr[随机索引[i]] *= 2;  // 缓存几乎错过所有访问\n                                 // 击败预取器</pre>\n<p>循环平铺利用了两者：处理适合缓存的小块（空间），在驱逐之前多次重用它（时间）。这就是 MLIR 仿射方言存在的原因 - 自动推理和优化这些访问模式。</p>"
    },
    "attribute": {
      "name": "属性",
      "role": "核心实体",
      "summary": "附加到操作的编译时常量数据。分为固有的（由操作验证）和可丢弃的（外部附加元数据）。",
      "definition": "属性表示 MLIR 中的常量编译时数据。每个操作都有一个将标识符键映射到属性值的属性字典。操作的语义需要固有属性（例如 arith.cmpi 的比较谓词）。可丢弃属性使用方言前缀名称，并且可以附加/删除而不影响操作语义（例如，gpu.container_module）。 MLIR 正在将固有属性迁移到 Properties — 一种单独的存储机制，在文本 IR 中显示为 <{...}>。",
      "examples": "<pre>// 固有属性（操作所需）：\n％cmp = arith.cmpi“slt”，％a，％b：i64\n// ↑ 谓词是固有属性\n\n// 可丢弃的属性（元数据、可移动）：\nfunc.func @kernel() 属性 {\n  gpu.container_module, // ← 可丢弃的（方言前缀）\n  llvm.linkage = \"internal\" // ← 可丢弃\n} { ... }\n\n// 属性（新语法，替换一些固有的属性）：\n\"test.op\"() <{fruit = \"banana\"}> {discardable_attr = 3} : () -> ()\n// ↑ 属性 ↑ attr 字典</pre>\n<p>区别很重要：固有属性定义操作，可丢弃属性对其进行注释。通过剥离元数据可以安全地删除所有可丢弃的属性。</p>"
    },
    "trait": {
      "name": "特征",
      "role": "机制",
      "summary": "对操作的静态验证约束使通行证能够在不知道每种方言的情况下一般地推理操作。",
      "definition": "特征是描述结构或语义不变量的操作的编译时属性。它们解决了 MLIR 的可扩展性挑战：使用任意操作和任意传递，每个传递无法对每个操作的知识进行硬编码。相反，像IsolatedFromAbove（没有向上的值捕获）或NoTerminator（区域不需要终止符）这样的特征让我们使用抽象属性而不是特定于操作的逻辑来验证和转换IR。",
      "examples": "<pre>//isolatedFromAbove：不能使用外部区域的值\nfunc.func @outer() {\n  %x = arith.constant 42 : i32\n  // 内部区域不能直接使用%x:\n  “isolated_op”（）（{\n    // 由于IsolatedFromAbove，%x 在这里不可用\n    %y = arith.constant 0 : i32\n    “inner.use”(%y) : (i32) -> ()\n  }) : () -> ()\n}\n\n// NoTerminator: 模块体不需要终止符\n模块{\n  func.func @a() { ... }\n  func.func @b() { ... }\n  // 结束时不需要“返回”或分支\n}</前>\n<p>关键特征：<code>IsolatedFromAbove</code>（区域隔离）、<code>SingleBlock</code>（恰好一个块）、<code>NoTerminator</code>（可选终止符）、<code>SymbolTable</code>（包含命名符号）、<code>Commutative</code>（操作数顺序无关）。</p>"
    },
    "interface": {
      "name": "界面",
      "role": "机制",
      "summary": "操作实施的抽象行为契约，使通行证能够跨方言通用地工作。",
      "definition": "接口是特征的动态对应物。虽然特征表达静态属性（在编译时验证），但接口定义操作可以在运行时实现的行为契约。例如，RegionKindInterface 告诉系统某个区域是使用 SSACFG 还是图语义。 InlinedInterface 支持通用内联，无需对每种方言逻辑进行硬编码。这通过将转换逻辑与操作知识解耦来解决 O(ops × Passs) 缩放问题。",
      "examples": "<pre>// 实现 InferTypeOpInterface 的操作：\n// 框架可以自动推断结果类型。\n%result = \"mydialect.add\"(%a, %b) : (张量 <4xf32>, 张量 <4xf32>) -> 张量 <4xf32>\n// ↑ 通过接口从操作数类型推断结果类型\n\n// RegionKindInterface — 声明区域语义：\n// SSACFG：块有终止符，优势适用\n// 图：单块，操作顺序无语义\n\n// 副作用接口——声明记忆效应：\n// 允许死代码消除、重新排序等。\nfunc.func @pure(%x: i32) -> i32 {\n  %y = arith.addi %x, %x : i32 // 无副作用 → 可移动\n  返回%y：i32\n}</前>\n<p>核心接口：<code>RegionKindInterface</code>、<code>InlinedInterface</code>、<code>InferTypeOpInterface</code>、<code>MemoryEffectsOpInterface</code>、<code>SymbolOpInterface</code>。</p>"
    },
    "graph-region": {
      "name": "图形区域",
      "role": "结构",
      "summary": "数据流/并发图的区域类型，其中操作顺序不是语义的，并且值可以形成循环。",
      "definition": "在图形区域中，单个块内的操作没有固有的执行顺序。运行时间或降低决定了调度。值可以引用稍后定义的操作（前向引用），从而启用循环数据流图。这与 SSACFG 区域形成对比，其中块排序和终止符定义控制流。高级 ML 框架图（如 TensorFlow 的）自然映射到图区域。",
      "examples": "<pre>// 图形区域：操作可以循环引用\n“测试.graph_region”() ({\n  %1 = \"op1\"(%1, %3) : (i32, i32) -> (i32) // 使用它自己的结果！\n  %2 = \"op2\"(%1, %3) : (i32, i32) -> (i32)\n  %3 = \"op3\"(%1) : (i32) -> (i32) // 使用后定义\n}) : () -> ()\n\n// 与SSACFG对比：严格支配，无前向参考\nfunc.func @ssacfg() {\n^bb0：\n  %x = arith.constant 1 : i32 // 必须主导所有用途\n  参见 br ^bb1\n^bb1：\n  \"use\"(%x) : (i32) -> () // %x 由于优势而可见\n}</前>\n<p>图形区域当前需要单个块。这可以实现特定于方言的调度，而无需将 CFG 结构强加于固有的并行计算上。</p>"
    },
    "terminator": {
      "name": "终结者",
      "role": "结构",
      "summary": "SSACFG 块中的最后一个操作，用于指定控制流后继者或将控制权返回给父操作。",
      "definition": "在 SSACFG 区域中，每个块必须以终止符操作结束 - 具有 IsTerminator 特征的操作，指定哪些块控制权转移到（后继者）或将值返回到父操作。示例：cf.br（无条件分支）、cf.cond_br（条件）、func.return、scf.yield。终止符将块参数传递给后继者，实现替换 phi 节点的并行复制语义。",
      "examples": "<pre>func.func @terminators(%cond: i1, %val: i64) -> i64 {\n^条目：\n  // cf.cond_br 是一个有两个后继者的终止符\n  cf.cond_br %cond, ^then(%val: i64), ^else(%val: i64)\n\n^然后(%a: i64):\n  %doubled = arith.muli %a, %a : i64\n  // cf.br 是一个有一个后继者的终止符\n  cf.br ^合并（％双倍：i64）\n\n^其他（%b：i64）：\n  参见 br ^合并(%b: i64)\n\n^合并（％结果：i64）：\n  // func.return 是退出函数的终止符\n  返回%结果：i64\n}</前>\n<p><code>NoTerminator</code> 特征使区域免受此要求（例如，<code>module</code> 主体）。没有终止符，就没有控制流——对于声明容器很有用。</p>"
    }
  }
};
