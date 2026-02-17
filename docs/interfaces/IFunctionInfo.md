[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / IFunctionInfo

# Interface: IFunctionInfo

Defined in: [types.ts:487](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L487)

Interface representing comprehensive information about a function.

## Properties

### body

> `readonly` **body**: [`IBodyInfo`](IBodyInfo.md)

Defined in: [types.ts:517](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L517)

Metadata about the function body.

***

### engine

> `readonly` **engine**: `string`

Defined in: [types.ts:491](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L491)

The name of the engine used to parse this function.

***

### isArrow

> `readonly` **isArrow**: `boolean`

Defined in: [types.ts:505](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L505)

Whether it's an arrow function.

***

### isAsync

> `readonly` **isAsync**: `boolean`

Defined in: [types.ts:501](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L501)

Whether the function is asynchronous.

***

### isDeclaration

> `readonly` **isDeclaration**: `boolean`

Defined in: [types.ts:507](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L507)

Whether it's a function declaration.

***

### isExpression

> `readonly` **isExpression**: `boolean`

Defined in: [types.ts:509](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L509)

Whether it's a function expression.

***

### isGenerator

> `readonly` **isGenerator**: `boolean`

Defined in: [types.ts:503](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L503)

Whether the function is a generator.

***

### isStatic

> `readonly` **isStatic**: `boolean`

Defined in: [types.ts:499](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L499)

Whether the function is a static class method.

***

### kind

> `readonly` **kind**: `FunctionKind`

Defined in: [types.ts:495](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L495)

The functional kind of the function (e.g., 'method').

***

### name

> `readonly` **name**: `string` \| `null`

Defined in: [types.ts:493](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L493)

The name of the function, or null for anonymous functions.

***

### node

> `readonly` **node**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:489](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L489)

The underlying AST node of the function.

***

### paramCount

> `readonly` **paramCount**: `number`

Defined in: [types.ts:513](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L513)

The number of parameters.

***

### params

> `readonly` **params**: [`IParamInfo`](IParamInfo.md)[]

Defined in: [types.ts:511](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L511)

Metadata for each parameter.

***

### returnType

> `readonly` **returnType**: `string` \| `null`

Defined in: [types.ts:515](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L515)

The string representation of the TypeScript return type.

***

### syntax

> `readonly` **syntax**: `FunctionSyntax`

Defined in: [types.ts:497](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L497)

The syntactic form of the function (e.g., 'arrow').

## Methods

### has()

> **has**(`selector`): `boolean`

Defined in: [types.ts:525](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L525)

Checks if any AST nodes match the CSS-like selector within the function scope.

#### Parameters

##### selector

`string`

#### Returns

`boolean`

***

### param()

> **param**(`index`): [`IParamInfo`](IParamInfo.md) \| `null`

Defined in: [types.ts:519](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L519)

Gets parameter info by its index.

#### Parameters

##### index

`number`

#### Returns

[`IParamInfo`](IParamInfo.md) \| `null`

***

### paramByName()

> **paramByName**(`name`): [`IParamInfo`](IParamInfo.md) \| `null`

Defined in: [types.ts:521](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L521)

Gets parameter info by its name.

#### Parameters

##### name

`string`

#### Returns

[`IParamInfo`](IParamInfo.md) \| `null`

***

### query()

> **query**(`selector`): [`ASTNode`](ASTNode.md)[]

Defined in: [types.ts:523](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L523)

Searches for AST nodes matching the CSS-like selector within the function scope.

#### Parameters

##### selector

`string`

#### Returns

[`ASTNode`](ASTNode.md)[]

***

### toJSON()

> **toJSON**(): [`FunctionInfoJSON`](FunctionInfoJSON.md)

Defined in: [types.ts:529](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L529)

Serializes the function info to a plain JSON object.

#### Returns

[`FunctionInfoJSON`](FunctionInfoJSON.md)

***

### verify()

> **verify**(`schema`): [`VerifyResult`](VerifyResult.md)

Defined in: [types.ts:527](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L527)

Verifies the function against a specified schema.

#### Parameters

##### schema

[`VerifySchema`](../type-aliases/VerifySchema.md)

#### Returns

[`VerifyResult`](VerifyResult.md)
