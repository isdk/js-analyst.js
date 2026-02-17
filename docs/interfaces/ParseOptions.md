[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / ParseOptions

# Interface: ParseOptions

Defined in: [types.ts:232](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L232)

Options for the parsing process.

## Properties

### engine?

> `optional` **engine**: [`EngineName`](../type-aliases/EngineName.md)

Defined in: [types.ts:236](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L236)

Force the use of a specific parsing engine.

***

### kind?

> `optional` **kind**: `FunctionKind` \| `FunctionKind`[]

Defined in: [types.ts:242](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L242)

Filter results to include only specific kinds of functions.

***

### sourceFilename?

> `optional` **sourceFilename**: `string`

Defined in: [types.ts:240](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L240)

The source filename (used by the OXC parser for diagnostics).

***

### sourceType?

> `optional` **sourceType**: `"script"` \| `"module"`

Defined in: [types.ts:238](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L238)

The source type: 'script' (default) or 'module'.

***

### syntax?

> `optional` **syntax**: `FunctionSyntax` \| `FunctionSyntax`[]

Defined in: [types.ts:244](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L244)

Filter results to include only specific function syntaxes.

***

### ts?

> `optional` **ts**: `boolean`

Defined in: [types.ts:234](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L234)

Whether to parse as TypeScript. If omitted, detection is automatic.
