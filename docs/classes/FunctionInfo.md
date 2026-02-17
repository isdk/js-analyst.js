[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / FunctionInfo

# Class: FunctionInfo

Defined in: [core/function-info.ts:28](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L28)

Implementation of [IFunctionInfo](../interfaces/IFunctionInfo.md) that provides detailed metadata
about a detected function.

This class wraps an AST node and provides high-level getters for
function properties, parameters, and its body.

## Implements

- [`IFunctionInfo`](../interfaces/IFunctionInfo.md)

## Constructors

### Constructor

> **new FunctionInfo**(`node`, `source`, `offset`, `engine`): `FunctionInfo`

Defined in: [core/function-info.ts:52](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L52)

**`Internal`**

Internal constructor for FunctionInfo.

#### Parameters

##### node

[`ASTNode`](../interfaces/ASTNode.md)

The AST node representing the function or its wrapper.

##### source

`string`

The original source code string.

##### offset

`number`

The character offset used during parsing.

##### engine

`string`

The name of the engine used to parse this function.

#### Returns

`FunctionInfo`

## Accessors

### body

#### Get Signature

> **get** **body**(): [`BodyInfo`](BodyInfo.md)

Defined in: [core/function-info.ts:259](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L259)

Metadata about the function body.

##### Returns

[`BodyInfo`](BodyInfo.md)

Metadata about the function body.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`body`](../interfaces/IFunctionInfo.md#body)

***

### engine

#### Get Signature

> **get** **engine**(): `string`

Defined in: [core/function-info.ts:144](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L144)

The name of the engine used to parse this function.

##### Returns

`string`

The name of the engine used to parse this function.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`engine`](../interfaces/IFunctionInfo.md#engine)

***

### isArrow

#### Get Signature

> **get** **isArrow**(): `boolean`

Defined in: [core/function-info.ts:197](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L197)

Whether the function is an arrow function.

##### Returns

`boolean`

Whether it's an arrow function.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`isArrow`](../interfaces/IFunctionInfo.md#isarrow)

***

### isAsync

#### Get Signature

> **get** **isAsync**(): `boolean`

Defined in: [core/function-info.ts:187](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L187)

Whether the function is marked as async.

##### Returns

`boolean`

Whether the function is asynchronous.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`isAsync`](../interfaces/IFunctionInfo.md#isasync)

***

### isDeclaration

#### Get Signature

> **get** **isDeclaration**(): `boolean`

Defined in: [core/function-info.ts:202](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L202)

Whether the function is a declaration.

##### Returns

`boolean`

Whether it's a function declaration.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`isDeclaration`](../interfaces/IFunctionInfo.md#isdeclaration)

***

### isExpression

#### Get Signature

> **get** **isExpression**(): `boolean`

Defined in: [core/function-info.ts:207](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L207)

Whether the function is a function expression.

##### Returns

`boolean`

Whether it's a function expression.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`isExpression`](../interfaces/IFunctionInfo.md#isexpression)

***

### isGenerator

#### Get Signature

> **get** **isGenerator**(): `boolean`

Defined in: [core/function-info.ts:192](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L192)

Whether the function is a generator function.

##### Returns

`boolean`

Whether the function is a generator.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`isGenerator`](../interfaces/IFunctionInfo.md#isgenerator)

***

### isStatic

#### Get Signature

> **get** **isStatic**(): `boolean`

Defined in: [core/function-info.ts:159](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L159)

Whether the function is a static class member.

##### Returns

`boolean`

Whether the function is a static class method.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`isStatic`](../interfaces/IFunctionInfo.md#isstatic)

***

### kind

#### Get Signature

> **get** **kind**(): `FunctionKind`

Defined in: [core/function-info.ts:149](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L149)

The functional kind of the function (e.g., 'method', 'getter').

##### Returns

`FunctionKind`

The functional kind of the function (e.g., 'method').

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`kind`](../interfaces/IFunctionInfo.md#kind)

***

### name

#### Get Signature

> **get** **name**(): `string` \| `null`

Defined in: [core/function-info.ts:169](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L169)

The name of the function.

Returns the identifier for named functions, variable name for assigned
anonymous functions, or the property key for methods.

##### Returns

`string` \| `null`

The name of the function, or null for anonymous functions.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`name`](../interfaces/IFunctionInfo.md#name)

***

### node

#### Get Signature

> **get** **node**(): [`ASTNode`](../interfaces/ASTNode.md)

Defined in: [core/function-info.ts:134](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L134)

The underlying ESTree function node.

##### Returns

[`ASTNode`](../interfaces/ASTNode.md)

The underlying AST node of the function.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`node`](../interfaces/IFunctionInfo.md#node)

***

### paramCount

#### Get Signature

> **get** **paramCount**(): `number`

Defined in: [core/function-info.ts:224](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L224)

The number of parameters defined in the function signature.

##### Returns

`number`

The number of parameters.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`paramCount`](../interfaces/IFunctionInfo.md#paramcount)

***

### params

#### Get Signature

> **get** **params**(): [`ParamInfo`](ParamInfo.md)[]

Defined in: [core/function-info.ts:214](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L214)

A list of metadata for each function parameter.

##### Returns

[`ParamInfo`](ParamInfo.md)[]

Metadata for each parameter.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`params`](../interfaces/IFunctionInfo.md#params)

***

### returnType

#### Get Signature

> **get** **returnType**(): `string` \| `null`

Defined in: [core/function-info.ts:250](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L250)

The string representation of the TypeScript return type.
Returns null if no type annotation is present.

##### Returns

`string` \| `null`

The string representation of the TypeScript return type.

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`returnType`](../interfaces/IFunctionInfo.md#returntype)

***

### syntax

#### Get Signature

> **get** **syntax**(): `FunctionSyntax`

Defined in: [core/function-info.ts:154](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L154)

The syntactic form of the function (e.g., 'declaration', 'arrow').

##### Returns

`FunctionSyntax`

The syntactic form of the function (e.g., 'arrow').

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`syntax`](../interfaces/IFunctionInfo.md#syntax)

***

### wrapper

#### Get Signature

> **get** **wrapper**(): [`ASTNode`](../interfaces/ASTNode.md) \| `null`

Defined in: [core/function-info.ts:139](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L139)

The wrapper node (e.g., MethodDefinition, VariableDeclarator), if any.

##### Returns

[`ASTNode`](../interfaces/ASTNode.md) \| `null`

## Methods

### has()

> **has**(`selector`): `boolean`

Defined in: [core/function-info.ts:285](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L285)

Checks if any AST nodes match the CSS-like selector within the function scope.

#### Parameters

##### selector

`string`

The Esquery selector string.

#### Returns

`boolean`

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`has`](../interfaces/IFunctionInfo.md#has)

***

### param()

> **param**(`index`): [`ParamInfo`](ParamInfo.md) \| `null`

Defined in: [core/function-info.ts:232](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L232)

Gets parameter metadata by its index.

#### Parameters

##### index

`number`

The 0-based parameter index.

#### Returns

[`ParamInfo`](ParamInfo.md) \| `null`

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`param`](../interfaces/IFunctionInfo.md#param)

***

### paramByName()

> **paramByName**(`name`): [`ParamInfo`](ParamInfo.md) \| `null`

Defined in: [core/function-info.ts:240](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L240)

Gets parameter metadata by its name.

#### Parameters

##### name

`string`

The name of the parameter to find.

#### Returns

[`ParamInfo`](ParamInfo.md) \| `null`

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`paramByName`](../interfaces/IFunctionInfo.md#parambyname)

***

### query()

> **query**(`selector`): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [core/function-info.ts:277](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L277)

Searches for AST nodes matching the CSS-like selector within the function scope.

#### Parameters

##### selector

`string`

The Esquery selector string.

#### Returns

[`ASTNode`](../interfaces/ASTNode.md)[]

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`query`](../interfaces/IFunctionInfo.md#query)

***

### toJSON()

> **toJSON**(): [`FunctionInfoJSON`](../interfaces/FunctionInfoJSON.md)

Defined in: [core/function-info.ts:302](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L302)

Serializes the function information to a plain JSON object.

#### Returns

[`FunctionInfoJSON`](../interfaces/FunctionInfoJSON.md)

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`toJSON`](../interfaces/IFunctionInfo.md#tojson)

***

### verify()

> **verify**(`schema`): [`VerifyResult`](../interfaces/VerifyResult.md)

Defined in: [core/function-info.ts:295](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/core/function-info.ts#L295)

Verifies the function against a specified schema.

#### Parameters

##### schema

[`VerifySchema`](../type-aliases/VerifySchema.md)

The validation rules to check.

#### Returns

[`VerifyResult`](../interfaces/VerifyResult.md)

#### Implementation of

[`IFunctionInfo`](../interfaces/IFunctionInfo.md).[`verify`](../interfaces/IFunctionInfo.md#verify)
