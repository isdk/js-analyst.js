[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / findAll

# Function: findAll()

> **findAll**(`node`, `predicate`, `results`): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [ast/traverse.ts:47](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/ast/traverse.ts#L47)

Traverses the AST and returns all nodes that match the predicate.

## Parameters

### node

`unknown`

The starting node or value.

### predicate

`Predicate`

The condition to match.

### results

[`ASTNode`](../interfaces/ASTNode.md)[] = `[]`

Internal accumulator for results.

## Returns

[`ASTNode`](../interfaces/ASTNode.md)[]

An array of matching AST nodes.
