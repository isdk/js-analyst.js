[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / findAll

# Function: findAll()

> **findAll**(`node`, `predicate`, `results`): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [ast/traverse.ts:47](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/ast/traverse.ts#L47)

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
