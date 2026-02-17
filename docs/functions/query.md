[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / query

# Function: query()

> **query**(`root`, `selector`, `scoped`, `owner?`): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [ast/query.ts:76](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/ast/query.ts#L76)

Queries the AST for all nodes matching the given selector.

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

The function node defining the scope (required if scoped is true).

## Returns

[`ASTNode`](../interfaces/ASTNode.md)[]

An array of matching AST nodes.
