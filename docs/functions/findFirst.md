[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / findFirst

# Function: findFirst()

> **findFirst**(`node`, `predicate`): [`ASTNode`](../interfaces/ASTNode.md) \| `null`

Defined in: [ast/traverse.ts:18](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/ast/traverse.ts#L18)

Performs a depth-first search to find the first node that matches the predicate.

## Parameters

### node

`unknown`

The starting node or value.

### predicate

`Predicate`

The condition to match.

## Returns

[`ASTNode`](../interfaces/ASTNode.md) \| `null`

The first matching node, or null if none found.
