[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / CallExpression

# Interface: CallExpression

Defined in: [types.ts:116](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L116)

Represents a function or method call expression.

## Extends

- [`ASTNode`](ASTNode.md)

## Indexable

\[`key`: `string`\]: `unknown`

Additional parser-specific extension properties.

## Properties

### arguments

> **arguments**: [`ASTNode`](ASTNode.md)[]

Defined in: [types.ts:121](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L121)

The arguments passed to the call.

***

### callee

> **callee**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:119](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L119)

The expression being called.

***

### end?

> `optional` **end**: `number`

Defined in: [types.ts:19](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L19)

The 0-based character offset where the node ends.

#### Inherited from

[`ASTNode`](ASTNode.md).[`end`](ASTNode.md#end)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [types.ts:21](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L21)

Detailed line and column information for the node's location in source.

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### range?

> `optional` **range**: \[`number`, `number`\]

Defined in: [types.ts:23](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L23)

The [start, end] character range offsets of the node.

#### Inherited from

[`ASTNode`](ASTNode.md).[`range`](ASTNode.md#range)

***

### start?

> `optional` **start**: `number`

Defined in: [types.ts:17](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L17)

The 0-based character offset where the node starts.

#### Inherited from

[`ASTNode`](ASTNode.md).[`start`](ASTNode.md#start)

***

### type

> **type**: `"CallExpression"`

Defined in: [types.ts:117](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L117)

The type of the AST node (e.g., 'Identifier', 'FunctionDeclaration').

#### Overrides

[`ASTNode`](ASTNode.md).[`type`](ASTNode.md#type)
