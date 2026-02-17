[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / has

# Function: has()

> **has**(`root`, `selector`, `scoped`, `owner?`): `boolean`

Defined in: [ast/query.ts:99](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/ast/query.ts#L99)

Checks if the AST contains any nodes matching the given selector.

## Parameters

### root

[`ASTNode`](../interfaces/ASTNode.md)

The root node to start searching from.

### selector

`string`

The CSS-like selector string.

### scoped

`boolean` = `false`

Whether to limit search to the current function scope.

### owner?

[`ASTNode`](../interfaces/ASTNode.md)

The function node defining the scope.

## Returns

`boolean`

True if at least one match is found.
