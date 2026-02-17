[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / verify

# Function: verify()

> **verify**(`input`, `schema`, `options?`): [`VerifyResult`](../interfaces/VerifyResult.md)

Defined in: [index.ts:106](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/index.ts#L106)

Quickly verifies a function against a schema using a default singleton analyzer.

## Parameters

### input

The source code string or a function reference.

`string` | `Function`

### schema

[`VerifySchema`](../type-aliases/VerifySchema.md)

The validation schema to check against.

### options?

[`ParseOptions`](../interfaces/ParseOptions.md)

Optional parsing configuration.

## Returns

[`VerifyResult`](../interfaces/VerifyResult.md)

The verification result.

## Example

```typescript
const result = verify(
  'function add(a, b) { return a + b }',
  { name: 'add', paramCount: 2 }
);
console.log(result.passed); // true
```
