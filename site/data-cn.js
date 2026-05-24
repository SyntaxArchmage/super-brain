const WIKI_CN = {
  "taxonomy": [
    {
      "id": "compiler",
      "label": "编译器基础设施",
      "children": [
        { "id": "mlir", "label": "MLIR", "type": "article" },
        { "id": "parser-practice", "label": "解析器实践", "type": "article" },
        { "id": "lowering-pipelines", "label": "下降流水线", "type": "article" }
      ]
    },
    {
      "id": "hpc",
      "label": "高性能计算",
      "children": [
        { "id": "parallel-models", "label": "并行编程模型", "type": "article" },
        { "id": "memory-hierarchy", "label": "存储层次结构", "type": "article" }
      ]
    },
    {
      "id": "ai",
      "label": "人工智能",
      "children": [
        { "id": "transformer-arch", "label": "Transformer 架构", "type": "article" },
        { "id": "training-dynamics", "label": "训练动力学", "type": "article" }
      ]
    },
    {
      "id": "ai-infra",
      "label": "AI 基础设施",
      "children": [
        { "id": "serving-systems", "label": "推理服务系统", "type": "article" },
        { "id": "compiler-ai-infra", "label": "AI 编译器栈", "type": "article" }
      ]
    },
    {
      "id": "pl",
      "label": "编程语言",
      "children": [
        { "id": "type-systems", "label": "类型系统", "type": "article" },
        { "id": "ir-design", "label": "IR 设计原则", "type": "article" }
      ]
    }
  ],
  "pages": {
    "index": {
      "title": "超级大脑",
      "subtitle": "一个涵盖编译器基础设施、高性能计算、AI 系统和编程语言理论的个人研究维基。每篇文章都是基于一手资料合成的知识单元。"
    },
    "mlir": {
      "title": "MLIR",
      "subtitle": "一个可复用、可扩展的多级中间表示框架，支持跨抽象层级的编译器构建——从高级计算图到循环优化再到目标特定代码生成。"
    },
    "parser-practice": {
      "title": "解析器实践",
      "subtitle": "可扩展编译器系统中构建解析器的技术与架构模式——从语法驱动方法到声明式格式规范。"
    },
    "lowering-pipelines": {
      "title": "下降流水线",
      "subtitle": "从高级领域抽象到目标特定表示的渐进式分阶段转换——在每一层维护抽象边界和转换契约。"
    },
    "parallel-models": {
      "title": "并行编程模型",
      "subtitle": "表达和管理高性能系统中并发性的抽象——各模型在表达力、性能透明度和硬件可移植性之间进行权衡。"
    },
    "memory-hierarchy": {
      "title": "存储层次结构",
      "subtitle": "理解和利用现代存储系统的分层结构，其中相邻层级间的延迟差距为10-100倍，对大多数工作负载而言主导着性能。"
    },
    "transformer-arch": {
      "title": "Transformer 架构",
      "subtitle": "支撑现代语言模型、视觉模型和多模态系统的基于注意力的架构——以可并行化的自注意力替代循环机制。"
    },
    "training-dynamics": {
      "title": "训练动力学",
      "subtitle": "神经网络如何学习：优化损失面几何、规模涌现能力，以及过参数化系统中出现的令人意外的现象。"
    },
    "serving-systems": {
      "title": "推理服务系统",
      "subtitle": "在生产规模部署ML模型的基础设施——管理延迟SLO、吞吐量最大化与内存效率之间在可变请求负载下的张力。"
    },
    "compiler-ai-infra": {
      "title": "AI 编译器栈",
      "subtitle": "编译器基础设施如何使AI模型在多样化硬件上高效执行——通过分阶段下降和领域特定优化桥接框架级计算图和目标特定代码。"
    },
    "type-systems": {
      "title": "类型系统",
      "subtitle": "在程序执行前静态推理程序行为的形式化框架——约束值的分类和组合规则以排除错误类别。"
    },
    "ir-design": {
      "title": "IR 设计原则",
      "subtitle": "中间表示设计中的核心权衡——选择在何处放置语义边界、如何编码不变式，以及对分析和转换的影响。"
    }
  },
  "concepts": {
    "operation": {
      "name": "操作 (Operation)",
      "role": "核心实体",
      "summary": "MLIR的中心抽象。拥有操作数、结果、区域、属性。完全可扩展——每个方言定义自己的操作。",
      "definition": "Operation是MLIR的原子构建块。与固定指令IR（LLVM有约60条指令）不同，MLIR操作完全可扩展——任何方言都可以定义新操作。每个操作可以拥有操作数（输入值）、结果（输出值）、后继（分支目标）、属性（编译时常量）、属性（可变元数据）和区域（嵌套IR）。"
    },
    "value": {
      "name": "值 (Value)",
      "role": "核心实体",
      "summary": "带类型的def-use边。要么是操作结果，要么是块参数。恰好有一个定义点但可能有多个使用者。",
      "definition": "MLIR中的Value表示带类型的运行时数据。每个值恰好有一个定义点（作为操作结果或块参数）和零个或多个使用（作为其他操作的操作数）。这种单一定义属性是使数据流分析变得简单的SSA不变式。"
    },
    "region": {
      "name": "区域 (Region)",
      "role": "结构体",
      "summary": "由操作拥有的块的有序列表。语义完全由包含操作定义——无独立含义。",
      "definition": "Region是由Operation拥有的Block的有序列表。关键点是：区域没有独立的语义——其含义完全由包含操作决定。func.func内部的区域表现为SSACFG（控制流有意义）；图重写操作内部的区域可能没有顺序要求。"
    },
    "block": {
      "name": "块 (Block)",
      "role": "结构体",
      "summary": "区域内操作的顺序列表。具有类型化的块参数，替代phi节点进行控制流合并。",
      "definition": "Block是区域内操作的顺序列表。在SSACFG区域中，块类似于经典编译器中的基本块——它们有单一入口点和转移控制到后继块的终止符。MLIR的关键创新是块参数：由分支指令传递的类型化参数，消除了对phi节点的需求。"
    },
    "dialect": {
      "name": "方言 (Dialect)",
      "role": "结构体",
      "summary": "MLIR的命名空间扩展机制。每个方言拥有操作、类型和属性。多方言在一个模块中共存。",
      "definition": "Dialect是MLIR对扩展问题的解决方案：如何在不分叉编译器的情况下添加领域特定操作？每个方言定义一个命名空间（如'arith'、'linalg'、'gpu'），包含操作、类型和属性。多个方言在一个模块中共存——一个函数可以同时包含arith、scf和linalg的操作。"
    },
    "symbol": {
      "name": "符号 (Symbol)",
      "role": "链接",
      "summary": "用于跨操作引用的命名实体，无需SSA的def-use边。使模块级链接和延迟绑定成为可能。",
      "definition": "Symbol是在SSA def-use图之外的命名引用机制。函数名是符号；全局变量是符号。它们被通过SymbolRefAttr引用而非Value来引用，使得跨区域引用和模块级链接无需线程化Value穿越所有中间操作。"
    },
    "pass": {
      "name": "Pass",
      "role": "转换机制",
      "summary": "分析或转换IR的单一处理步骤。可以在不同粒度（模块、函数、操作）运行。形成流水线。",
      "definition": "Pass是分析或转换IR的单一处理步骤。Pass可以是：分析pass（计算信息但不修改IR）、转换pass（重写操作）。Pass在特定粒度运行——OperationPass<ModuleOp>处理整个模块；OperationPass<FuncOp>独立处理每个函数。"
    },
    "lowering": {
      "name": "下降 (Lowering)",
      "role": "转换机制",
      "summary": "操作从高级方言转换到低级方言。使用方言转换框架进行渐进式转换。",
      "definition": "Lowering是将操作从高级方言重写为低级方言的操作。MLIR通过DialectConversion框架将此形式化：声明哪些操作是合法的、哪些是非法的，并提供将非法操作重写为合法操作的模式。"
    },
    "self-attention": {
      "name": "自注意力",
      "role": "结构体",
      "summary": "通过学习到的查询-键兼容性计算序列中所有位置对之间加权关系的机制。",
      "definition": "自注意力对序列中每个位置计算其与所有其他位置的加权和。权重由学习到的查询-键兼容性决定：Attention(Q,K,V) = softmax(QK^T/√d_k)V。这允许每个token直接关注其他任何token，实现O(1)信息传播（对比RNN的O(n)）。"
    },
    "kv cache": {
      "name": "KV Cache",
      "role": "优化技术",
      "summary": "通过缓存先前token的键值投影实现自回归推理中避免冗余计算的推理时优化。",
      "definition": "KV Cache存储先前计算的键和值投影，使得每个新的token解码步骤只需计算一个新token的Q/K/V，然后将新的K、V追加到缓存中。这将解码复杂度从O(n²)降低到O(n)，但创建了一个随序列长度线性增长的内存需求。"
    },
    "ssa": {
      "name": "SSA",
      "role": "基础",
      "summary": "每个变量恰好被赋值一次的程序形式。使数据流分析变得简单并启用高效优化。",
      "definition": "静态单赋值（SSA）是一种IR属性，其中每个变量恰好被赋值一次。这使数据流事实直接在def-use边上可见：要找到值的定义，只需跟随其唯一的定义边。SSA通过使信息按常数时间传播而非需要迭代不动点计算来简化大多数编译器分析。"
    },
    "locality": {
      "name": "局部性",
      "role": "结构体",
      "summary": "程序倾向于重复访问同一内存地址（时间局部性）或附近地址（空间局部性）的属性。",
      "definition": "局部性是使缓存层次结构有效的基本属性。时间局部性意味着最近访问的数据可能很快再次被访问。空间局部性意味着附近地址很快会被访问（因为缓存行获取相邻字节）。利用这两种形式是高性能代码的主要设计目标。"
    }
  }
};
