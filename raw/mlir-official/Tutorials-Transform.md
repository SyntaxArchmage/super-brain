# Transform Dialect Tutorial

MLIR supports declarative specification for controlling compiler transformations via the transform dialect. It allows one to request compiler transformations using compiler IR itself, which can be embedded into the original IR that is being transformed (similarly to pragmas) or supplied separately (similarly to scheduling languages). This tutorial presents the concepts of the MLIR transform dialect and related infrastructure. It will be accompanied by a practical demonstration of three use scenarios:

- [Youtube Channel](https://www.youtube.com/MLIRCompiler)
- Composing Transform dialect operations available in (upstream) MLIR to perform a sequence of optimizing transformations that results in efficient code for an MLIR linear algebra operation.
- Defining new Transform dialect operations and adapting existing transformation code to work with the Transform dialect infrastructure.
- Setting up and using the Transform dialect infrastructure in a downstream out-of-tree project with custom dialects, transformations and passes.

After following the tutorial, one will be able to apply the Transform dialect in their work and extend it when necessary. Basic familiarity with MLIR is a prerequisite. See [Toy tutorial](https://mlir.llvm.org/docs/Tutorials/Toy/) for introduction to MLIR.

The tutorial is divided into the following chapters.

- [Chapter #0](https://mlir.llvm.org/docs/Tutorials/transform/Ch0/): A Primer on "Structured" Linalg Operations
- [Chapter #1](https://mlir.llvm.org/docs/Tutorials/transform/Ch1/): Combining Existing Transformations
- [Chapter #2](https://mlir.llvm.org/docs/Tutorials/transform/Ch2/): Adding a Simple New Transformation Operation
- [Chapter #3](https://mlir.llvm.org/docs/Tutorials/transform/Ch3/): More than Simple Transform Operations
- [Chapter #4](https://mlir.llvm.org/docs/Tutorials/transform/Ch4/): Matching Payload with Transform Operations
- [Chapter H](https://mlir.llvm.org/docs/Tutorials/transform/ChH/): Reproducing Halide Schedule

The code corresponding to this tutorial is located under `mlir/Examples/transform` and the corresponding tests in `mlir/test/Examples/transform`.

## Transform Dialect Tutorial Docs

- [Chapter 0: A Primer on "Structured" Linalg Operations](https://mlir.llvm.org/docs/Tutorials/transform/Ch0/)
- [Chapter 1: Combining Existing Transformations](https://mlir.llvm.org/docs/Tutorials/transform/Ch1/)
- [Chapter 2: Adding a Simple New Transformation Operation](https://mlir.llvm.org/docs/Tutorials/transform/Ch2/)
- [Chapter 3: More than Simple Transform Operations](https://mlir.llvm.org/docs/Tutorials/transform/Ch3/)
- [Chapter 4: Matching Payload with Transform Operations](https://mlir.llvm.org/docs/Tutorials/transform/Ch4/)
- [Chapter H: Reproducing Halide Schedule](https://mlir.llvm.org/docs/Tutorials/transform/ChH/)
