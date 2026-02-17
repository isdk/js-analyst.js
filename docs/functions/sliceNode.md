[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / sliceNode

# Function: sliceNode()

> **sliceNode**(`source`, `node`, `offset`): `string` \| `null`

Defined in: [utils/source.ts:15](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/utils/source.ts#L15)

Extracts a substring from the source code based on an AST node's boundaries.

## Parameters

### source

`string`

The original source code string.

### node

[`ASTNode`](../interfaces/ASTNode.md)

The AST node to slice.

### offset

`number` = `0`

The character offset used during parsing.

## Returns

`string` \| `null`

The sliced source code or null if information is missing.
