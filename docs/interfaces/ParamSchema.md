[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / ParamSchema

# Interface: ParamSchema

Defined in: [types.ts:325](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L325)

Schema for verifying a function parameter.

## Properties

### hasDefault?

> `optional` **hasDefault**: `boolean`

Defined in: [types.ts:331](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L331)

Whether the parameter has a default value.

***

### isDestructured?

> `optional` **isDestructured**: `boolean`

Defined in: [types.ts:335](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L335)

Whether the parameter uses destructuring (object or array).

***

### isRest?

> `optional` **isRest**: `boolean`

Defined in: [types.ts:333](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L333)

Whether the parameter is a rest element (...args).

***

### name?

> `optional` **name**: [`Matcher`](../type-aliases/Matcher.md)\<`string` \| `null`\>

Defined in: [types.ts:327](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L327)

Matcher for the parameter name.

***

### pattern?

> `optional` **pattern**: `"object"` \| `"array"` \| `null`

Defined in: [types.ts:337](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L337)

The destructuring pattern type.

***

### type?

> `optional` **type**: [`Matcher`](../type-aliases/Matcher.md)\<`string` \| `null`\>

Defined in: [types.ts:329](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L329)

Matcher for the parameter's TypeScript type (string representation).
