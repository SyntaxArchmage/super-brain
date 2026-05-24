Data Layout Modeling - MLIR

# Data Layout Modeling

Data layout information allows the compiler to answer questions related to how a value of a particular type is stored in memory. For example, the size of a value or its address alignment requirements. It enables, among others, the generation of various linear memory addressing schemes for containers of abstract types and deeper reasoning about vectors.

The data layout subsystem is designed to scale to MLIR's open type and operation system. At the top level, it consists of:

- [Youtube Channel](https://www.youtube.com/MLIRCompiler)
- attribute interfaces that can be implemented by concrete data layout specifications;
- type interfaces that should be implemented by types subject to data layout;
- operation interfaces that must be implemented by operations that can serve as data layout scopes (e.g., modules);
- and dialect interfaces for data layout properties unrelated to specific types.

Built-in types are handled specially to decrease the overall query cost. Similarly, built-in`ModuleOp` supports data layouts without going through the interface.

## Usage ¶

### Scoping ¶

Following MLIR's nested structure, data layout properties are scoped to regions belonging to either operations that implement the`DataLayoutOpInterface` or`ModuleOp` operations. Such scoping operations partially control the data layout properties and may have attributes that affect them, typically organized in a data layout specification.

Types may have a different data layout in different scopes, including scopes that are nested in other scopes such as modules contained in other modules. At the same time, within the given scope excluding any nested scope, a given type has fixed data layout properties. Types are also expected to have a default, "natural" data layout in case they are used outside of any operation that provides data layout scope for them. This ensures that data layout queries always have a valid result.

### Compatibility and Transformations ¶

The information necessary to compute layout properties can be combined from nested scopes. For example, an outer scope can define layout properties for a subset of types while inner scopes define them for a disjoint subset, or scopes can progressively relax alignment requirements on a type. This mechanism is supported by the notion of data layout compatibility: the layout defined in a nested scope is expected to be compatible with that of the outer scope. MLIR does not prescribe what compatibility means for particular ops and types but provides hooks for them to provide target- and type-specific checks. For example, one may want to only allow relaxation of alignment constraints (i.e., smaller alignment) in nested modules or, alternatively, one may require nested modules to fully redefine all constraints of the outer scope.

Data layout compatibility is also relevant during IR transformation. Any transformation that affects the data layout scoping operation is expected to maintain data layout compatibility. It is under responsibility of the transformation to ensure it is indeed the case.

### Queries ¶

Data layout property queries can be performed on the special object –`DataLayout`– which can be created for the given scoping operation. These objects allow one to interface with the data layout infrastructure and query properties of given types in the scope of the object. The signature of`DataLayout` class is as follows.

```
class DataLayout {
public:
  explicit DataLayout(DataLayoutOpInterface scope);

  llvm::TypeSize getTypeSize(Type type) const;
  llvm::TypeSize getTypeSizeInBits(Type type) const;
  uint64_t getTypeABIAlignment(Type type) const;
  uint64_t getTypePreferredAlignment(Type type) const;
  std::optional<uint64_t> getTypeIndexBitwidth(Type type) const;
};
```

The user can construct the`DataLayout` object for the scope of interest. Since the data layout properties are fixed in the scope, they will be computed only once upon first request and cached for further use. Therefore,`DataLayout(op.getParentOfType ()).getTypeSize(type)` is considered an anti-pattern since it discards the cache after use. Because of caching, a`DataLayout` object returns valid results as long as the data layout properties of enclosing scopes remain the same, that is, as long as none of the ancestor operations are modified in a way that affects data layout. After such a modification, the user is expected to create a fresh`DataLayout` object. To aid with this,`DataLayout` asserts that the scope remains identical if MLIR is compiled with assertions enabled.

## Custom Implementations ¶

Extensibility of the data layout modeling is provided through a set of MLIR [Interfaces](https://mlir.llvm.org/docs/Interfaces/).

### Data Layout Specifications ¶

Data layout specification is an [attribute](https://mlir.llvm.org/docs/LangRef/#attributes) that is conceptually a collection of key-value pairs called data layout specification entries. Data layout specification attributes implement the`DataLayoutSpecInterface`, described below. Each entry is itself an attribute that implements the`DataLayoutEntryInterface`. Entries have a key, either a`Type` or a`StringAttr`, and a value. Keys are used to associate entries with specific types or dialects: when handling a data layout properties request, a type or a dialect can only see the specification entries relevant to them and must go through the supplied`DataLayout` object for any recursive query. This supports and enforces better composability because types cannot (and should not) understand layout details of other types. Entry values are arbitrary attributes, specific to the type.

For example, a data layout specification may be an actual list of pairs with simple custom syntax resembling the following:

```
#my_dialect.layout_spec<
  #my_dialect.layout_entry<!my_dialect.type, size=42>,
  #my_dialect.layout_entry<"my_dialect.endianness", "little">,
  #my_dialect.layout_entry<!my_dialect.vector, prefer_large_alignment>>
```

The exact details of the specification and entry attributes, as well as their syntax, are up to implementations.

We use the notion of type class throughout the data layout subsystem. It corresponds to the C++ class of the given type, e.g.,`IntegerType` for built-in integers. MLIR does not have a mechanism to represent type classes in the IR. Instead, data layout entries contain specific instances of a type class, for example,`IntegerType{signedness=signless, bitwidth=8}`(or`i8` in the IR) or`IntegerType{signedness=unsigned, bitwidth=32}`(or`ui32` in the IR). When handling a data layout property query, a type class will be supplied with all entries with keys belonging to this type class. For example,`IntegerType` will see the entries for`i8`,`si16` and`ui32`, but will not see those for`f32` or`memref `(neither will`MemRefType` see the entry for`i32`). This allows for type-specific "interpolation" behavior where a type class can compute data layout properties of any specific type instance given properties of other instances. Using integers as an example again, their alignment could be computed by taking that of the closest from above integer type with power-of-two bitwidth.

## DLTIQueryInterface (DLTIQueryInterface) ¶

Attribute interface exposing querying-mechanism for key-value associations.

The central feature of DLTI attributes is to allow looking up values at keys. This interface represent the core functionality to do so - as such most DLTI attributes should be implementing this interface.

Note that as the`query` method returns an attribute, this attribute can be recursively queried when it also implements this interface.

### Methods: ¶

#### query ¶

```
::mlir::FailureOr<::mlir::Attribute> query(::mlir::DataLayoutEntryKey key);
```

Returns the attribute associated with the key.

NOTE: This method must be implemented by the user.

## DataLayoutEntryInterface (DataLayoutEntryInterface) ¶

Attribute interface describing an entry in a data layout specification.

A data layout specification entry is a key-value pair. Its key is either a type, when the entry is related to a type or a class of types, or an identifier, when it is not.`DataLayoutEntryKey` is an alias allowing one to use both key types. Its value is an arbitrary attribute that is interpreted either by the type for type keys or by the dialect containing the identifier for identifier keys. The interface provides a hook that can be used by specific implementations to delegate the verification of attribute fitness for a particular key to the relevant type or dialect.

### Methods: ¶

#### getKey ¶

```
::mlir::DataLayoutEntryKey getKey();
```

Returns the key of the this layout entry.

NOTE: This method must be implemented by the user.

#### getValue ¶

```
::mlir::Attribute getValue();
```

Returns the value of this layout entry.

NOTE: This method must be implemented by the user.

#### verifyEntry ¶

```
::llvm::LogicalResult verifyEntry(::mlir::Location loc);
```

Checks that the entry is well-formed, reports errors at the provided location.

NOTE: This method must be implemented by the user.

## DataLayoutSpecInterface (DataLayoutSpecInterface) ¶

Attribute interface describing a data layout specification.

A data layout specification is seen as a sequence of entries, each of which is an attribute implementing the data layout entry interface. It assumes a contiguous underlying storage for entries. The interface provides a hook for implementations to verify the well-formedness of the specification, with a default implementation that verifies the absence of entries with duplicate keys and the well-formedness of each individual entry before dispatching to the type or dialect the entry is associated with.

Data layout specifications may need to be combined in case they appear on nested operations subject to layout, or to ensure the validity of layout modification. Concrete specification attributes must implement the corresponding hook.

### Methods: ¶

#### combineWith ¶

```
::mlir::DataLayoutSpecInterface combineWith(::llvm::ArrayRef<::mlir::DataLayoutSpecInterface> specs);
```

Combines the current layout with the given list of layouts, provided from the outermost (oldest) to the innermost (newest). Returns null on failure.

NOTE: This method must be implemented by the user.

#### getEntries ¶

```
::mlir::DataLayoutEntryListRef getEntries();
```

Returns the list of layout entries.

NOTE: This method must be implemented by the user.

#### getEndiannessIdentifier ¶

```
::mlir::StringAttr getEndiannessIdentifier(::mlir::MLIRContext *context);
```

Returns the endianness identifier.

NOTE: This method must be implemented by the user.

#### getDefaultMemorySpaceIdentifier ¶

```
::mlir::StringAttr getDefaultMemorySpaceIdentifier(::mlir::MLIRContext *context);
```

Returns the default memory space identifier.

NOTE: This method must be implemented by the user.

#### getAllocaMemorySpaceIdentifier ¶

```
::mlir::StringAttr getAllocaMemorySpaceIdentifier(::mlir::MLIRContext *context);
```

Returns the alloca memory space identifier.

NOTE: This method must be implemented by the user.

#### getProgramMemorySpaceIdentifier ¶

```
::mlir::StringAttr getProgramMemorySpaceIdentifier(::mlir::MLIRContext *context);
```

Returns the program memory space identifier.

NOTE: This method must be implemented by the user.

#### getGlobalMemorySpaceIdentifier ¶

```
::mlir::StringAttr getGlobalMemorySpaceIdentifier(::mlir::MLIRContext *context);
```

Returns the global memory space identifier.

NOTE: This method must be implemented by the user.

#### getManglingModeIdentifier ¶

```
::mlir::StringAttr getManglingModeIdentifier(::mlir::MLIRContext *context);
```

Returns the mangling mode identifier.

NOTE: This method must be implemented by the user.

#### getStackAlignmentIdentifier ¶

```
::mlir::StringAttr getStackAlignmentIdentifier(::mlir::MLIRContext *context);
```

Returns the stack alignment identifier.

NOTE: This method must be implemented by the user.

#### getFunctionPointerAlignmentIdentifier ¶

```
::mlir::StringAttr getFunctionPointerAlignmentIdentifier(::mlir::MLIRContext *context);
```

Returns the function pointer alignment identifier.

NOTE: This method must be implemented by the user.

#### getLegalIntWidthsIdentifier ¶

```
::mlir::StringAttr getLegalIntWidthsIdentifier(::mlir::MLIRContext *context);
```

Returns the legal int widths identifier.

NOTE: This method must be implemented by the user.

#### getSpecForType ¶

```
::mlir::DataLayoutEntryList getSpecForType(::mlir::TypeID type);
```

Returns a copy of the entries related to a specific type class regardles of type parameters.

NOTE: This method must be implemented by the user.

#### getSpecForIdentifier ¶

```
::mlir::DataLayoutEntryInterface getSpecForIdentifier(::mlir::StringAttr identifier);
```

Returns the entry related to the given identifier, if present.

NOTE: This method must be implemented by the user.

#### verifySpec ¶

```
::llvm::LogicalResult verifySpec(::mlir::Location loc);
```

Verifies the validity of the specification and reports any errors at the given location.

NOTE: This method must be implemented by the user.

## TargetDeviceSpecInterface (TargetDeviceSpecInterface) ¶

Attribute interface describing a target device description specification.

A target device description specification is a list of device properties (key) and their values for a specific device. The device is identified using "device_id" (as a key and ui32 value) and "device_type" key which must have a string value. Both "device_id" and "device_type" are mandatory keys. As an example, L1 cache size could be a device property, and its value would be a device specific size.

A target device description specification is attached to a module as a module level attribute.

### Methods: ¶

#### getEntries ¶

```
::mlir::DataLayoutEntryListRef getEntries();
```

Returns the list of layout entries.

NOTE: This method must be implemented by the user.

#### getSpecForIdentifier ¶

```
::mlir::DataLayoutEntryInterface getSpecForIdentifier(::mlir::StringAttr identifier);
```

Returns the entry related to the given identifier, if present.

NOTE: This method must be implemented by the user.

#### verifyEntry ¶

```
::llvm::LogicalResult verifyEntry(::mlir::Location loc);
```

Checks that the entry is well-formed, reports errors at the provided location.

NOTE: This method must be implemented by the user.

## TargetSystemSpecInterface (TargetSystemSpecInterface) ¶

Attribute interface describing a target system description specification.

A target system description specification is a list of target device specifications, with one device specification for a device in the system. As such, a target system description specification allows specifying a heterogenous system, with devices of different types (e.g., CPU, GPU, etc.)

The only requirement on a valid target system description specification is that the "device_id" in every target device description specification needs to be unique. This is because, ultimately, this "device_id" is used by the user to query a value of a device property.

### Methods: ¶

#### getEntries ¶

```
::llvm::ArrayRef<DataLayoutEntryInterface> getEntries();
```

Returns the list of layout entries.

NOTE: This method must be implemented by the user.

#### getDeviceSpecForDeviceID ¶

```
std::optional<::mlir::TargetDeviceSpecInterface> getDeviceSpecForDeviceID(StringAttr deviceID);
```

Returns the device description spec for given device ID

NOTE: This method must be implemented by the user.

#### verifySpec ¶

```
::llvm::LogicalResult verifySpec(::mlir::Location loc);
```

Verifies the validity of the specification and reports any errors at the given location.

NOTE: This method must be implemented by the user.

### Data Layout Scoping Operations ¶

Operations that define a scope for data layout queries, and that can be used to create a`DataLayout` object, are expected to implement the`DataLayoutOpInterface`. Such ops must provide at least a way of obtaining the data layout specification. The specification need not be necessarily attached to the operation as an attribute and may be constructed on-the-fly; it is only fetched once per`DataLayout` object and cached. Such ops may also provide custom handlers for data layout queries that provide results without forwarding the queries down to specific types or post-processing the results returned by types in target- or scope-specific ways. These custom handlers make it possible for scoping operations to (re)define data layout properties for types without having to modify the types themselves, e.g., when types are defined in another dialect.

## DataLayoutOpInterface (DataLayoutOpInterface) ¶

Interface for operations that can have a data layout specification attached.

The`DataLayout` object, which can be used for data layout queries, can be constructed for such operations. The absence of a data layout specification must be handled without failing.

Concrete operations must implement the hook returning the data layout specification. They may optionally override the methods used in data layout queries, default implementations of which provide predefined answers for built-in types and dispatch to the type interface for all other types. These methods must be idempotent, that is return the same result on repeated queries with the same parameters. They are declared static and therefore have no access to the operation or its attributes. Instead, they receive a list of data layout entries relevant to the request. The entries are known to have passed the spec and entry verifier.

### Methods: ¶

#### getDataLayoutSpec ¶

```
::mlir::DataLayoutSpecInterface getDataLayoutSpec();
```

Returns the data layout specification for this op, or null if it does not exist.

NOTE: This method must be implemented by the user.

#### getTargetSystemSpec ¶

```
::mlir::TargetSystemSpecInterface getTargetSystemSpec();
```

Returns the target system desc specification for this op, or null if it does not exist.

NOTE: This method must be implemented by the user.

#### getTypeSize ¶

```
static ::llvm::TypeSize getTypeSize(::mlir::Type type, const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the size of the given type computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getTypeSizeInBits ¶

```
static ::llvm::TypeSize getTypeSizeInBits(::mlir::Type type, const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the size of the given type in bits computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getTypeABIAlignment ¶

```
static uint64_t getTypeABIAlignment(::mlir::Type type, const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the alignment required by the ABI for the given type computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getTypePreferredAlignment ¶

```
static uint64_t getTypePreferredAlignment(::mlir::Type type, const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the alignment preferred by the given type computed using the relevant entries. The data layoutobject can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getIndexBitwidth ¶

```
static std::optional<uint64_t> getIndexBitwidth(::mlir::Type type, const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the bitwidth that should be used when performing index computations for the type computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getEndianness ¶

```
static ::mlir::Attribute getEndianness(::mlir::DataLayoutEntryInterface entry);
```

Returns the endianness used by the ABI computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getDefaultMemorySpace ¶

```
static ::mlir::Attribute getDefaultMemorySpace(::mlir::DataLayoutEntryInterface entry);
```

Returns the memory space used by the ABI computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getAllocaMemorySpace ¶

```
static ::mlir::Attribute getAllocaMemorySpace(::mlir::DataLayoutEntryInterface entry);
```

Returns the memory space used by the ABI computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getManglingMode ¶

```
static ::mlir::Attribute getManglingMode(::mlir::DataLayoutEntryInterface entry);
```

Returns the mangling mode computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getProgramMemorySpace ¶

```
static ::mlir::Attribute getProgramMemorySpace(::mlir::DataLayoutEntryInterface entry);
```

Returns the memory space used by the ABI computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getGlobalMemorySpace ¶

```
static ::mlir::Attribute getGlobalMemorySpace(::mlir::DataLayoutEntryInterface entry);
```

Returns the memory space used by the ABI computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getStackAlignment ¶

```
static uint64_t getStackAlignment(::mlir::DataLayoutEntryInterface entry);
```

Returns the natural stack alignment in bits computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getFunctionPointerAlignment ¶

```
static Attribute getFunctionPointerAlignment(::mlir::DataLayoutEntryInterface entry);
```

Returns the function pointer alignment in bits computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getLegalIntWidths ¶

```
static Attribute getLegalIntWidths(::mlir::DataLayoutEntryInterface entry);
```

Returns the legal int widths, each width in bits computed using the relevant entries. The data layout object can be used for recursive queries.

NOTE: This method must be implemented by the user.

#### getDevicePropertyValue ¶

```
static std::optional<Attribute> getDevicePropertyValue(::mlir::DataLayoutEntryInterface entry);
```

Returns the value of the property, if the property is defined. Otherwise, it returns std::nullopt.

NOTE: This method must be implemented by the user.

### Types with Data Layout ¶

Type classes that intend to handle data layout queries themselves are expected to implement the`DataLayoutTypeInterface`. This interface provides overridable hooks for each data layout query. Each of these hooks is supplied with the type instance, a`DataLayout` object suitable for recursive queries, and a list of data layout queries relevant for the type class. It is expected to provide a valid result even if the list of entries is empty. These hooks do not have access to the operation in the scope of which the query is handled and should use the supplied entries instead.

## DataLayoutTypeInterface (DataLayoutTypeInterface) ¶

Interface for types subject to data layout.

Types willing to be supported by the data layout subsystem should implement this interface by providing implementations of functions querying their size, required and preferred alignment. Each of these functions accepts as arguments a data layout object that can be used to perform recursive queries in the same scope, and a list of data layout entries relevant to this type. Specifically, the entries are those that have as key any instance of the same type class as the current type. For example, if IntegerType had implemented this interface, it would have received the entries with keys i1, i2, i8, etc. regardless of the bitwidth of this type. This mechanism allows types to "interpolate" the results in a type-specific way instead of listing all possible types in the specification.

The list of entries may be empty, in which case the type must provide a reasonable default value. The entries in the list are known to have passed the spec and the entry verifiers, as well as the type-specified verifier if provided.

In case of nested layout specs or spec changes, the type can override a hook indicating whether the outer (old) and the inner (new) spec are compatible.

### Methods: ¶

#### getTypeSize ¶

```
::llvm::TypeSize getTypeSize(const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the size of this type in bytes.

NOTE: This method must be implemented by the user.

#### getTypeSizeInBits ¶

```
::llvm::TypeSize getTypeSizeInBits(const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the size of this type in bits.

NOTE: This method must be implemented by the user.

#### getABIAlignment ¶

```
uint64_t getABIAlignment(const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the ABI-required alignment for this type, in bytes

NOTE: This method must be implemented by the user.

#### getPreferredAlignment ¶

```
uint64_t getPreferredAlignment(const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the preferred alignment for this type, in bytes.

NOTE: This method must be implemented by the user.

#### getIndexBitwidth ¶

```
std::optional<uint64_t> getIndexBitwidth(const ::mlir::DataLayout &dataLayout, ::mlir::DataLayoutEntryListRef params);
```

Returns the bitwidth that should be used when performing index computations for the given pointer-like type. If the type is not a pointer-like type, returns std::nullopt.

NOTE: This method must be implemented by the user.

#### areCompatible ¶

```
bool areCompatible(::mlir::DataLayoutEntryListRef oldLayout, ::mlir::DataLayoutEntryListRef newLayout, ::mlir::DataLayoutSpecInterface newSpec, const ::mlir::DataLayoutIdentifiedEntryMap&identified);
```

Returns true if the two lists of entries are compatible, that is, that`newLayout` spec entries can be nested in an op with`oldLayout` spec entries.`newSpec` and`identified` areprovided to further query data from the combined spec, e.g.,the default address space. TODO: Revisit this method oncehttps://github.com/llvm/llvm-project/issues/130321 gets solved

NOTE: This method must be implemented by the user.

#### verifyEntries ¶

```
::llvm::LogicalResult verifyEntries(::mlir::DataLayoutEntryListRef entries, ::mlir::Location loc);
```

Verifies that the given list of entries is valid for this type.

NOTE: This method must be implemented by the user.

### Dialects with Data Layout Identifiers ¶

For data layout entries that are not related to a particular type class, the key of the entry is an Identifier that belongs to some dialect. In this case, the dialect is expected to implement the`DataLayoutDialectInterface`. This dialect provides hooks for verifying the validity of the entry value attributes and for and the compatibility of nested entries.

### Bits and Bytes ¶

Two versions of hooks are provided for sizes: in bits and in bytes. The version in bytes has a default implementation that derives the size in bytes by rounding up the result of division of the size in bits by 8. Types exclusively targeting architectures with different assumptions can override this. Operations can redefine this for all types, providing scoped versions for cases of byte sizes other than eight without having to modify types, including built-in types.

### Query Dispatch ¶

The overall flow of a data layout property query is as follows.

1. The user constructs a`DataLayout` at the given scope. The constructor fetches the data layout specification and combines it with those of enclosing scopes (layouts are expected to be compatible).
2. The user calls`DataLayout::query(Type ty)`.
3. If`DataLayout` has a cached response, this response is returned immediately.
4. Otherwise, the query is handed down by`DataLayout` to the closest layout scoping operation. If it implements`DataLayoutOpInterface`, then the query is forwarded to`DataLayoutOpInterface::query(ty, *this, relevantEntries)` where the relevant entries are computed as described above. If it does not implement`DataLayoutOpInterface`, it must be a`ModuleOp`, and the query is forwarded to`DataLayoutTypeInterface::query(dataLayout, relevantEntries)` after casting`ty` to the type interface.
5. Unless the`query` hook is reimplemented by the op interface, the query is handled further down to`DataLayoutTypeInterface::query(dataLayout, relevantEntries)` after casting`ty` to the type interface. If the type does not implement the interface, an unrecoverable fatal error is produced.
6. The type is expected to always provide the response, which is returned up the call stack and cached by the`DataLayout.`

## Default Implementation ¶

The default implementation of the data layout interfaces directly handles queries for a subset of built-in types.

### Built-in Modules ¶

Built-in`ModuleOp` allows at most one attribute that implements`DataLayoutSpecInterface`. It does not implement the entire interface for efficiency and layering reasons. Instead,`DataLayout` can be constructed for`ModuleOp` and handles modules transparently alongside other operations that implement the interface.

### Built-in Types ¶

The following describes the default properties of built-in types.

The size of built-in integers and floats in bytes is computed as`ceildiv(bitwidth, 8)`. The ABI alignment of integer types with bitwidth below 64 and of the float types is the closest from above power-of-two number of bytes. The ABI alignment of integer types with bitwidth 64 and above is 4 bytes (32 bits).

The size of built-in vectors is computed by first rounding their number of elements in the innermost dimension to the closest power-of-two from above, then getting the total number of elements, and finally multiplying it with the element size. For example,`vector<3xi32>` and`vector<4xi32>` have the same size. So do`vector<2x3xf32>` and`vector<2x4xf32>`, but`vector<3x4xf32>` and`vector<4x4xf32>` have different sizes. The ABI and preferred alignment of vector types is computed by taking the innermost dimension of the vector, rounding it up to the closest power-of-two, taking a product of that with element size in bytes, and rounding the result up again to the closest power-of-two.

Note: these values are selected for consistency with the [default data layout in LLVM](https://llvm.org/docs/LangRef.html#data-layout), which MLIR assumed until the introduction of proper data layout modeling, and with the [modeling of n-D vectors](https://mlir.llvm.org/docs/Dialects/Vector/#deeperdive). They may change in the future.

#### index type ¶

Index type is an integer type used for target-specific size information in, e.g.,`memref` operations. Its data layout is parameterized by a single integer data layout entry that specifies its bitwidth. For example,

```
module attributes { dlti.dl_spec = #dlti.dl_spec<
  #dlti.dl_entry<index, 32>
>} {}
```

specifies that`index` has 32 bits and index computations should be performed using 32-bit precision as well. All other layout properties of`index` match those of the integer type with the same bitwidth defined above.

In absence of the corresponding entry,`index` is assumed to be a 64-bit integer.

#### complex type ¶

By default complex type is treated like a 2 element structure of its given element type. This is to say that each of its elements are aligned to their preferred alignment, the entire complex type is also aligned to this preference, and the complex type size includes the possible padding between elements to enforce alignment.

### Byte Size ¶

The default data layout assumes 8-bit bytes.

### DLTI Dialect ¶

The [DLTI](https://mlir.llvm.org/docs/Dialects/DLTIDialect/) dialect provides the attributes implementing`DataLayoutSpecInterface` and`DataLayoutEntryInterface`, as well as a dialect attribute that can be used to attach the specification to a given operation. The verifier of this attribute triggers those of the specification and checks the compatibility of nested specifications.
