[**@isdk/js-analyst**](../../../../README.md)

***

[@isdk/js-analyst](../../../../globals.md) / [helpers](../README.md) / nodeGet

# Function: nodeGet()

> **nodeGet**(`node`, `path`): `unknown`

Defined in: [ast/helpers.ts:205](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/ast/helpers.ts#L205)

Safely gets a deep property from an AST node using a dot-separated path.

## Parameters

### node

[`ASTNode`](../../../../interfaces/ASTNode.md)

The root AST node.

### path

`string`

Dot-separated property path (e.g., 'callee.object.name').

## Returns

`unknown`

The value at the path, or undefined if not found.

## Example

```ts
nodeGet(node, 'callee.object.name')  // equivalent to node?.callee?.object?.name
```
