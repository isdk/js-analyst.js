[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / sliceBlockBody

# Function: sliceBlockBody()

> **sliceBlockBody**(`source`, `blockNode`, `offset`): `string` \| `null`

Defined in: [utils/source.ts:35](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/utils/source.ts#L35)

Extracts the inner content of a BlockStatement, removing the surrounding braces.

## Parameters

### source

`string`

The original source code string.

### blockNode

[`ASTNode`](../interfaces/ASTNode.md)

The BlockStatement AST node.

### offset

`number` = `0`

The character offset used during parsing.

## Returns

`string` \| `null`

The trimmed inner content or null if not a block.
