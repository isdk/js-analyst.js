[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / ReturnStatement

# Interface: ReturnStatement

Defined in: [types.ts:94](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L94)

Represents a return statement.

## Extends

- [`ASTNode`](ASTNode.md)

## Indexable

\[`key`: `string`\]: `unknown`

Additional parser-specific extension properties.

## Properties

### argument

> **argument**: [`ASTNode`](ASTNode.md) \| `null`

Defined in: [types.ts:97](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L97)

The expression being returned, or null if returning nothing.

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

> **type**: `"ReturnStatement"`

Defined in: [types.ts:95](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L95)

The type of the AST node (e.g., 'Identifier', 'FunctionDeclaration').

#### Overrides

[`ASTNode`](ASTNode.md).[`type`](ASTNode.md#type)
