[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / IReturnHelper

# Interface: IReturnHelper

Defined in: [types.ts:535](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L535)

Helper interface for verifying return values in a function body.

## Properties

### node

> `readonly` **node**: [`ASTNode`](ASTNode.md) \| `null`

Defined in: [types.ts:537](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L537)

The AST node being returned.

## Methods

### isBinaryOp()

> **isBinaryOp**(`operator`, `leftName`, `rightName`): `boolean`

Defined in: [types.ts:539](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L539)

Checks if the return value is a binary operation with the given operator and operand names.

#### Parameters

##### operator

`string`

##### leftName

`string`

##### rightName

`string`

#### Returns

`boolean`

***

### isCall()

> **isCall**(`calleeName?`): `boolean`

Defined in: [types.ts:541](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L541)

Checks if the return value is a call to a specific function.

#### Parameters

##### calleeName?

`string`

#### Returns

`boolean`

***

### isIdentifier()

> **isIdentifier**(`name?`): `boolean`

Defined in: [types.ts:545](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L545)

Checks if the return value is a specific identifier.

#### Parameters

##### name?

`string`

#### Returns

`boolean`

***

### isLiteral()

> **isLiteral**(`value?`): `boolean`

Defined in: [types.ts:543](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L543)

Checks if the return value is a specific literal value.

#### Parameters

##### value?

`unknown`

#### Returns

`boolean`

***

### isMemberAccess()

> **isMemberAccess**(`objName`, `propName`): `boolean`

Defined in: [types.ts:547](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L547)

Checks if the return value is a member access (e.g., obj.prop).

#### Parameters

##### objName

`string`

##### propName

`string`

#### Returns

`boolean`

***

### isTemplateLiteral()

> **isTemplateLiteral**(): `boolean`

Defined in: [types.ts:549](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L549)

Checks if the return value is a template literal.

#### Returns

`boolean`
