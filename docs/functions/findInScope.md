[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / findInScope

# Function: findInScope()

> **findInScope**(`node`, `predicate`, `owner`, `results`): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [ast/traverse.ts:80](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/ast/traverse.ts#L80)

Traverses the AST within the current function's scope.
It stops descending when it encounters a nested function definition.

## Parameters

### node

`unknown`

The starting node.

### predicate

`Predicate`

The condition to match.

### owner

[`ASTNode`](../interfaces/ASTNode.md)

The function node that defines the current scope.

### results

[`ASTNode`](../interfaces/ASTNode.md)[] = `[]`

Internal accumulator for results.

## Returns

[`ASTNode`](../interfaces/ASTNode.md)[]

An array of matching nodes within the scope.
