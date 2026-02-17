[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / Analyzer

# Class: Analyzer

Defined in: [core/analyzer.ts:37](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/analyzer.ts#L37)

The primary class for analyzing JavaScript and TypeScript code.

`Analyzer` handles engine selection (Acorn or high-performance OXC),
source code normalization, and provides high-level APIs for extracting
and validating function metadata.

## Constructors

### Constructor

> **new Analyzer**(`options`): `Analyzer`

Defined in: [core/analyzer.ts:46](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/analyzer.ts#L46)

Creates a new Analyzer instance.

#### Parameters

##### options

[`AnalyzerOptions`](../interfaces/AnalyzerOptions.md) = `{}`

Configuration options for the analyzer.

#### Returns

`Analyzer`

## Accessors

### engines

#### Get Signature

> **get** **engines**(): `object`

Defined in: [core/analyzer.ts:255](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/analyzer.ts#L255)

Gets the status of available parsing engines.

##### Returns

`object`

###### acorn

> **acorn**: `boolean`

###### oxc

> **oxc**: `boolean`

## Methods

### parse()

> **parse**(`input`, `options`): [`FunctionInfo`](FunctionInfo.md)

Defined in: [core/analyzer.ts:144](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/analyzer.ts#L144)

Parses the input source and returns the first matching function.

#### Parameters

##### input

The source code string, a function reference, or a code snippet.

`string` | `Function`

##### options

[`ParseOptions`](../interfaces/ParseOptions.md) = `{}`

Configuration options for parsing and filtering results.

#### Returns

[`FunctionInfo`](FunctionInfo.md)

A [FunctionInfo](FunctionInfo.md) instance containing metadata about the detected function.

#### Throws

If no function node is found or if none match the specified filters.

#### Example

```typescript
const analyzer = new Analyzer();
const fn = analyzer.parse('function add(a, b) { return a + b }');
console.log(fn.name);       // 'add'
console.log(fn.paramCount); // 2
```

***

### parseAll()

> **parseAll**(`source`, `options`): [`FunctionInfo`](FunctionInfo.md)[]

Defined in: [core/analyzer.ts:188](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/analyzer.ts#L188)

Parses all functions found within the provided source code.

#### Parameters

##### source

`string`

The source code string to analyze.

##### options

[`ParseOptions`](../interfaces/ParseOptions.md) = `{}`

Configuration options for parsing and filtering.

#### Returns

[`FunctionInfo`](FunctionInfo.md)[]

An array of [FunctionInfo](FunctionInfo.md) for each detected function.

#### Example

```typescript
const fns = analyzer.parseAll(fileContent);
fns.forEach(fn => console.log(fn.name));
```

***

### verify()

> **verify**(`input`, `schema`, `parseOptions`): [`VerifyResult`](../interfaces/VerifyResult.md)

Defined in: [core/analyzer.ts:237](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/analyzer.ts#L237)

Parses and immediately verifies a function against a schema.

#### Parameters

##### input

The source code or function to verify.

`string` | `Function`

##### schema

[`VerifySchema`](../type-aliases/VerifySchema.md)

The verification schema.

##### parseOptions

[`ParseOptions`](../interfaces/ParseOptions.md) = `{}`

Optional parsing configuration.

#### Returns

[`VerifyResult`](../interfaces/VerifyResult.md)

The verification result.

***

### warmup()

> **warmup**(): `Promise`\<`void`\>

Defined in: [core/analyzer.ts:248](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/analyzer.ts#L248)

Manually warms up the WASM-based parser (OXC).

#### Returns

`Promise`\<`void`\>
