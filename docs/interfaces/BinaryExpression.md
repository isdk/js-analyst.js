[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / BinaryExpression

# Interface: BinaryExpression

Defined in: [types.ts:103](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L103)

Represents a binary expression (e.g., a + b).

## Extends

- [`ASTNode`](ASTNode.md)

## Indexable

\[`key`: `string`\]: `unknown`

Additional parser-specific extension properties.

## Properties

### end?

> `optional` **end**: `number`

Defined in: [types.ts:19](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L19)

The 0-based character offset where the node ends.

#### Inherited from

[`ASTNode`](ASTNode.md).[`end`](ASTNode.md#end)

***

### left

> **left**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:108](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L108)

The left-hand side operand.

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [types.ts:21](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L21)

Detailed line and column information for the node's location in source.

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### operator

> **operator**: `string`

Defined in: [types.ts:106](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L106)

The binary operator (e.g., '+', '-', '===', etc.).

***

### range?

> `optional` **range**: \[`number`, `number`\]

Defined in: [types.ts:23](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L23)

The [start, end] character range offsets of the node.

#### Inherited from

[`ASTNode`](ASTNode.md).[`range`](ASTNode.md#range)

***

### right

> **right**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:110](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L110)

The right-hand side operand.

***

### start?

> `optional` **start**: `number`

Defined in: [types.ts:17](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L17)

The 0-based character offset where the node starts.

#### Inherited from

[`ASTNode`](ASTNode.md).[`start`](ASTNode.md#start)

***

### type

> **type**: `"BinaryExpression"`

Defined in: [types.ts:104](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L104)

The type of the AST node (e.g., 'Identifier', 'FunctionDeclaration').

#### Overrides

[`ASTNode`](ASTNode.md).[`type`](ASTNode.md#type)
