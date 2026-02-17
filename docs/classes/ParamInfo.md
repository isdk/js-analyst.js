[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / ParamInfo

# Class: ParamInfo

Defined in: [core/param-info.ts:36](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L36)

Implementation of [IParamInfo](../interfaces/IParamInfo.md) that provides metadata about
a function parameter.

This class handles various parameter patterns including simple identifiers,
rest elements, default values, and destructuring (objects/arrays).

## Implements

- [`IParamInfo`](../interfaces/IParamInfo.md)

## Constructors

### Constructor

> **new ParamInfo**(`node`, `source`, `offset`): `ParamInfo`

Defined in: [core/param-info.ts:50](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L50)

**`Internal`**

Internal constructor for ParamInfo.

#### Parameters

##### node

[`ASTNode`](../interfaces/ASTNode.md)

The AST node representing the parameter.

##### source

`string`

The original source code string.

##### offset

`number`

The character offset used during parsing.

#### Returns

`ParamInfo`

## Accessors

### defaultNode

#### Get Signature

> **get** **defaultNode**(): [`ASTNode`](../interfaces/ASTNode.md) \| `null`

Defined in: [core/param-info.ts:164](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L164)

The AST node representing the default value, if any.

##### Returns

[`ASTNode`](../interfaces/ASTNode.md) \| `null`

The AST node representing the default value, if any.

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`defaultNode`](../interfaces/IParamInfo.md#defaultnode)

***

### hasDefault

#### Get Signature

> **get** **hasDefault**(): `boolean`

Defined in: [core/param-info.ts:144](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L144)

Whether the parameter has a default value (AssignmentPattern).

##### Returns

`boolean`

Whether the parameter has a default value.

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`hasDefault`](../interfaces/IParamInfo.md#hasdefault)

***

### isDestructured

#### Get Signature

> **get** **isDestructured**(): `boolean`

Defined in: [core/param-info.ts:154](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L154)

Whether the parameter uses object or array destructuring.

##### Returns

`boolean`

Whether the parameter uses destructuring.

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`isDestructured`](../interfaces/IParamInfo.md#isdestructured)

***

### isRest

#### Get Signature

> **get** **isRest**(): `boolean`

Defined in: [core/param-info.ts:149](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L149)

Whether the parameter is a rest element (e.g., ...args).

##### Returns

`boolean`

Whether this is a rest parameter (...args).

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`isRest`](../interfaces/IParamInfo.md#isrest)

***

### name

#### Get Signature

> **get** **name**(): `string` \| `null`

Defined in: [core/param-info.ts:131](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L131)

The name of the parameter.
Returns null if the parameter is a destructuring pattern without a simple name.

##### Returns

`string` \| `null`

The parameter name, or null if it's a destructured pattern without a simple identifier.

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`name`](../interfaces/IParamInfo.md#name)

***

### pattern

#### Get Signature

> **get** **pattern**(): `"object"` \| `"array"` \| `null`

Defined in: [core/param-info.ts:159](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L159)

The specific destructuring pattern used ('object' or 'array').

##### Returns

`"object"` \| `"array"` \| `null`

The type of destructuring pattern used.

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`pattern`](../interfaces/IParamInfo.md#pattern)

***

### text

#### Get Signature

> **get** **text**(): `string` \| `null`

Defined in: [core/param-info.ts:169](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L169)

The raw source text of the parameter.

##### Returns

`string` \| `null`

The raw source text of the parameter.

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`text`](../interfaces/IParamInfo.md#text)

***

### type

#### Get Signature

> **get** **type**(): `string` \| `null`

Defined in: [core/param-info.ts:139](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L139)

The string representation of the TypeScript type annotation.
Returns null if no type is explicitly defined.

##### Returns

`string` \| `null`

The string representation of the parameter's TypeScript type.

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`type`](../interfaces/IParamInfo.md#type)

## Methods

### toJSON()

> **toJSON**(): [`ParamInfoJSON`](../interfaces/ParamInfoJSON.md)

Defined in: [core/param-info.ts:174](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/param-info.ts#L174)

Serializes the parameter info to a plain JSON object.

#### Returns

[`ParamInfoJSON`](../interfaces/ParamInfoJSON.md)

#### Implementation of

[`IParamInfo`](../interfaces/IParamInfo.md).[`toJSON`](../interfaces/IParamInfo.md#tojson)
