[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / tsTypeToString

# Function: tsTypeToString()

> **tsTypeToString**(`tsNode`, `source?`, `offset?`): `string` \| `null`

Defined in: [utils/ts-type.ts:38](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/utils/ts-type.ts#L38)

Converts a TypeScript AST type node into a human-readable string representation.

## Parameters

### tsNode

The TS type node to convert.

`TSTypeNode` | `null` | `undefined`

### source?

`string`

Optional source code for slicing fallback.

### offset?

`number` = `0`

Optional character offset used during parsing.

## Returns

`string` \| `null`

A readable type string (e.g., 'number', 'Promise<string>', 'string | number'),
         or null if the node is empty.

## Example

```ts
TSNumberKeyword              → 'number'
TSTypeReference(Promise<T>)  → 'Promise<T>'
TSUnionType(string | number) → 'string | number'
TSArrayType(number[])        → 'number[]'
```
