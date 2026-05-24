# Toy Tutorial

This tutorial runs through the implementation of a basic toy language on top of MLIR. The goal of this tutorial is to introduce the concepts of MLIR; in particular, how [dialects](https://mlir.llvm.org/docs/LangRef/#dialects) can help easily support language specific constructs and transformations while still offering an easy path to lower to LLVM or other codegen infrastructure. This tutorial is based on the model of the [LLVM Kaleidoscope Tutorial](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html).

Another good source of introduction is the online [recording](https://www.youtube.com/watch?v=Y4SvqTtOIDk) from the 2020 LLVM Dev Conference ([slides](https://llvm.org/devmtg/2020-09/slides/MLIR_Tutorial.pdf)).

This tutorial assumes you have cloned and built MLIR; if you have not yet done so, see [Getting started with MLIR](https://mlir.llvm.org/getting_started/).

This tutorial is divided in the following chapters:

- [Youtube Channel](https://www.youtube.com/MLIRCompiler)
- [Chapter #1](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-1/): Introduction to the Toy language and the definition of its AST.
- [Chapter #2](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-2/): Traversing the AST to emit a dialect in MLIR, introducing base MLIR concepts. Here we show how to start attaching semantics to our custom operations in MLIR.
- [Chapter #3](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-3/): High-level language-specific optimization using pattern rewriting system.
- [Chapter #4](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-4/): Writing generic dialect-independent transformations with Interfaces. Here we will show how to plug dialect specific information into generic transformations like shape inference and inlining.
- [Chapter #5](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-5/): Partially lowering to lower-level dialects. We'll convert some of our high level language specific semantics towards a generic affine oriented dialect for optimization.
- [Chapter #6](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-6/): Lowering to LLVM and code generation. Here we'll target LLVM IR for code generation, and detail more of the lowering framework.
- [Chapter #7](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-7/): Extending Toy: Adding support for a composite type. We'll demonstrate how to add a custom type to MLIR, and how it fits in the existing pipeline.

The [first chapter](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-1/) will introduce the Toy language and AST.

## Toy Tutorial Docs

- [Chapter 1: Toy Language and AST](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-1/)
- [Chapter 2: Emitting Basic MLIR](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-2/)
- [Chapter 3: High-level Language-Specific Analysis and Transformation](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-3/)
- [Chapter 4: Enabling Generic Transformation with Interfaces](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-4/)
- [Chapter 5: Partial Lowering to Lower-Level Dialects for Optimization](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-5/)
- [Chapter 6: Lowering to LLVM and CodeGeneration](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-6/)
- [Chapter 7: Adding a Composite Type to Toy](https://mlir.llvm.org/docs/Tutorials/Toy/Ch-7/)
