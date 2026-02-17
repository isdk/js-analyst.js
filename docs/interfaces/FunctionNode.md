[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / FunctionNode

# Interface: FunctionNode

Defined in: [types.ts:64](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L64)

Represents a function-related node (Declaration, Expression, or Arrow).

## Extends

- [`ASTNode`](ASTNode.md)

## Indexable

\[`key`: `string`\]: `unknown`

Additional parser-specific extension properties.

## Properties

### async

> **async**: `boolean`

Defined in: [types.ts:73](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L73)

Whether the function is marked as async.

***

### body

> **body**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:71](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L71)

The body of the function (BlockStatement or an Expression for arrows).

***

### end?

> `optional` **end**: `number`

Defined in: [types.ts:19](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L19)

The 0-based character offset where the node ends.

#### Inherited from

[`ASTNode`](ASTNode.md).[`end`](ASTNode.md#end)

***

### expression?

> `optional` **expression**: `boolean`

Defined in: [types.ts:77](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L77)

Whether the function is an arrow function with an expression body.

***

### generator

> **generator**: `boolean`

Defined in: [types.ts:75](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L75)

Whether the function is a generator function.

***

### id?

> `optional` **id**: [`Identifier`](Identifier.md) \| `null`

Defined in: [types.ts:67](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L67)

The identifier of the function, or null if anonymous.

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [types.ts:21](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L21)

Detailed line and column information for the node's location in source.

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### params

> **params**: [`ASTNode`](ASTNode.md)[]

Defined in: [types.ts:69](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L69)

The list of function parameters.

***

### range?

> `optional` **range**: \[`number`, `number`\]

Defined in: [types.ts:23](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L23)

The [start, end] character range offsets of the node.

#### Inherited from

[`ASTNode`](ASTNode.md).[`range`](ASTNode.md#range)

***

### returnType?

> `optional` **returnType**: `TSTypeAnnotationWrapper`

Defined in: [types.ts:79](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L79)

Optional TypeScript return type annotation.

***

### start?

> `optional` **start**: `number`

Defined in: [types.ts:17](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L17)

The 0-based character offset where the node starts.

#### Inherited from

[`ASTNode`](ASTNode.md).[`start`](ASTNode.md#start)

***

### type

> **type**: `"FunctionDeclaration"` \| `"FunctionExpression"` \| `"ArrowFunctionExpression"`

Defined in: [types.ts:65](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L65)

The type of the AST node (e.g., 'Identifier', 'FunctionDeclaration').

#### Overrides

[`ASTNode`](ASTNode.md).[`type`](ASTNode.md#type)
