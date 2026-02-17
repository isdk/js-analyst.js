[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / parseAll

# Function: parseAll()

> **parseAll**(`source`, `options?`): [`FunctionInfo`](../classes/FunctionInfo.md)[]

Defined in: [index.ts:82](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/index.ts#L82)

Quickly parses all functions in a source string using a default singleton analyzer.

## Parameters

### source

`string`

The source code string.

### options?

[`ParseOptions`](../interfaces/ParseOptions.md)

Optional parsing configuration.

## Returns

[`FunctionInfo`](../classes/FunctionInfo.md)[]

An array of [FunctionInfo](../classes/FunctionInfo.md) for each detected function.
