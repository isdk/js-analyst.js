[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / IParamInfo

# Interface: IParamInfo

Defined in: [types.ts:439](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L439)

Interface representing detailed information about a function parameter.

## Properties

### defaultNode

> `readonly` **defaultNode**: [`ASTNode`](ASTNode.md) \| `null`

Defined in: [types.ts:453](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L453)

The AST node representing the default value, if any.

***

### hasDefault

> `readonly` **hasDefault**: `boolean`

Defined in: [types.ts:445](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L445)

Whether the parameter has a default value.

***

### isDestructured

> `readonly` **isDestructured**: `boolean`

Defined in: [types.ts:449](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L449)

Whether the parameter uses destructuring.

***

### isRest

> `readonly` **isRest**: `boolean`

Defined in: [types.ts:447](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L447)

Whether this is a rest parameter (...args).

***

### name

> `readonly` **name**: `string` \| `null`

Defined in: [types.ts:441](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L441)

The parameter name, or null if it's a destructured pattern without a simple identifier.

***

### pattern

> `readonly` **pattern**: `"object"` \| `"array"` \| `null`

Defined in: [types.ts:451](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L451)

The type of destructuring pattern used.

***

### text

> `readonly` **text**: `string` \| `null`

Defined in: [types.ts:455](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L455)

The raw source text of the parameter.

***

### type

> `readonly` **type**: `string` \| `null`

Defined in: [types.ts:443](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L443)

The string representation of the parameter's TypeScript type.

## Methods

### toJSON()

> **toJSON**(): [`ParamInfoJSON`](ParamInfoJSON.md)

Defined in: [types.ts:457](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L457)

Serializes the parameter info to a plain JSON object.

#### Returns

[`ParamInfoJSON`](ParamInfoJSON.md)
