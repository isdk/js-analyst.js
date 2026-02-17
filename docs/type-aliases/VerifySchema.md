[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / VerifySchema

# Type Alias: VerifySchema

> **VerifySchema** = \{ `arrow?`: `boolean`; `async?`: `boolean`; `body?`: `string` \| `string`[] \| [`BodySchema`](../interfaces/BodySchema.md); `custom?`: (`fn`) => `boolean`; `generator?`: `boolean`; `kind?`: [`Matcher`](Matcher.md)\<`FunctionKind`\>; `name?`: [`Matcher`](Matcher.md)\<`string` \| `null`\>; `paramCount?`: [`Matcher`](Matcher.md)\<`number`\>; `params?`: [`ParamSchema`](../interfaces/ParamSchema.md)[]; `returns?`: [`BodySchema`](../interfaces/BodySchema.md)\[`"returns"`\]; `returnType?`: [`Matcher`](Matcher.md)\<`string` \| `null`\>; `static?`: `boolean`; `strict?`: `boolean`; `syntax?`: [`Matcher`](Matcher.md)\<`FunctionSyntax`\>; \} \| `string`

Defined in: [types.ts:364](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L364)

Comprehensive schema for verifying a function.
Can be a structured object or a JS/TS snippet string.

## Type Declaration

\{ `arrow?`: `boolean`; `async?`: `boolean`; `body?`: `string` \| `string`[] \| [`BodySchema`](../interfaces/BodySchema.md); `custom?`: (`fn`) => `boolean`; `generator?`: `boolean`; `kind?`: [`Matcher`](Matcher.md)\<`FunctionKind`\>; `name?`: [`Matcher`](Matcher.md)\<`string` \| `null`\>; `paramCount?`: [`Matcher`](Matcher.md)\<`number`\>; `params?`: [`ParamSchema`](../interfaces/ParamSchema.md)[]; `returns?`: [`BodySchema`](../interfaces/BodySchema.md)\[`"returns"`\]; `returnType?`: [`Matcher`](Matcher.md)\<`string` \| `null`\>; `static?`: `boolean`; `strict?`: `boolean`; `syntax?`: [`Matcher`](Matcher.md)\<`FunctionSyntax`\>; \}

### arrow?

> `optional` **arrow**: `boolean`

Whether the function is an arrow function.

### async?

> `optional` **async**: `boolean`

Whether the function is async.

### body?

> `optional` **body**: `string` \| `string`[] \| [`BodySchema`](../interfaces/BodySchema.md)

Verification schema for the function body.

### custom()?

> `optional` **custom**: (`fn`) => `boolean`

Custom verification function for the entire function info.

#### Parameters

##### fn

[`IFunctionInfo`](../interfaces/IFunctionInfo.md)

#### Returns

`boolean`

### generator?

> `optional` **generator**: `boolean`

Whether the function is a generator.

### kind?

> `optional` **kind**: [`Matcher`](Matcher.md)\<`FunctionKind`\>

Matcher for the function kind (e.g., 'method').

### name?

> `optional` **name**: [`Matcher`](Matcher.md)\<`string` \| `null`\>

Matcher for the function name.

### paramCount?

> `optional` **paramCount**: [`Matcher`](Matcher.md)\<`number`\>

Matcher for the number of parameters.

### params?

> `optional` **params**: [`ParamSchema`](../interfaces/ParamSchema.md)[]

Verification schemas for individual parameters.

### returns?

> `optional` **returns**: [`BodySchema`](../interfaces/BodySchema.md)\[`"returns"`\]

Custom validation for return statements (shortcut for body.returns).

### returnType?

> `optional` **returnType**: [`Matcher`](Matcher.md)\<`string` \| `null`\>

Matcher for the return type (string representation).

### static?

> `optional` **static**: `boolean`

Whether the function is a static method.

### strict?

> `optional` **strict**: `boolean`

Whether to enable strict matching (e.g., matching variable declaration kind).

### syntax?

> `optional` **syntax**: [`Matcher`](Matcher.md)\<`FunctionSyntax`\>

Matcher for the function syntax (e.g., 'arrow').

`string`
