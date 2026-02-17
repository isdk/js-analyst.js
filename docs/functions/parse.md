[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / parse

# Function: parse()

> **parse**(`input`, `options?`): [`FunctionInfo`](../classes/FunctionInfo.md)

Defined in: [index.ts:68](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/index.ts#L68)

Quickly parses a function using a default singleton analyzer.

## Parameters

### input

The source code string or a function reference.

`string` | `Function`

### options?

[`ParseOptions`](../interfaces/ParseOptions.md)

Optional parsing configuration.

## Returns

[`FunctionInfo`](../classes/FunctionInfo.md)

Metadata for the detected function.

## Example

```typescript
const fn = parse('(a, b) => a + b');
console.log(fn.isArrow); // true
```
