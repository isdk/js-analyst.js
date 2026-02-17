[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / BodyInfo

# Class: BodyInfo

Defined in: [core/body-info.ts:18](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L18)

Implementation of [IBodyInfo](../interfaces/IBodyInfo.md) that provides metadata and analysis
for a function body.

It abstracts the differences between block statements and arrow function
expression bodies, providing a unified interface for statement analysis
and AST querying.

## Implements

- [`IBodyInfo`](../interfaces/IBodyInfo.md)

## Constructors

### Constructor

> **new BodyInfo**(`bodyNode`, `funcNode`, `source`, `offset`): `BodyInfo`

Defined in: [core/body-info.ts:36](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L36)

**`Internal`**

Internal constructor for BodyInfo.

#### Parameters

##### bodyNode

The AST node of the body.

[`ASTNode`](../interfaces/ASTNode.md) | `undefined`

##### funcNode

[`ASTNode`](../interfaces/ASTNode.md)

The parent function node.

##### source

`string`

The original source code string.

##### offset

`number`

The character offset used during parsing.

#### Returns

`BodyInfo`

## Accessors

### isBlock

#### Get Signature

> **get** **isBlock**(): `boolean`

Defined in: [core/body-info.ts:54](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L54)

Whether the body is a block statement (wrapped in braces).

##### Returns

`boolean`

Whether the body is a block statement.

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`isBlock`](../interfaces/IBodyInfo.md#isblock)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: [core/body-info.ts:64](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L64)

Whether the function body is empty (e.g., in some declarations).

##### Returns

`boolean`

***

### isExpression

#### Get Signature

> **get** **isExpression**(): `boolean`

Defined in: [core/body-info.ts:59](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L59)

Whether the body is a single expression (common in arrow functions).

##### Returns

`boolean`

Whether the body is a single expression (arrow functions).

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`isExpression`](../interfaces/IBodyInfo.md#isexpression)

***

### node

#### Get Signature

> **get** **node**(): [`ASTNode`](../interfaces/ASTNode.md)

Defined in: [core/body-info.ts:49](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L49)

The underlying AST node of the body.

##### Returns

[`ASTNode`](../interfaces/ASTNode.md)

The AST node of the body (BlockStatement or Expression).

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`node`](../interfaces/IBodyInfo.md#node)

***

### returns

#### Get Signature

> **get** **returns**(): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [core/body-info.ts:115](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L115)

All return statements found within the current function's scope.

This search is scope-aware and will not include return statements
from nested functions.

##### Returns

[`ASTNode`](../interfaces/ASTNode.md)[]

All return statements found within the body's scope.

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`returns`](../interfaces/IBodyInfo.md#returns)

***

### statementCount

#### Get Signature

> **get** **statementCount**(): `number`

Defined in: [core/body-info.ts:92](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L92)

The number of top-level statements in the body.

##### Returns

`number`

The number of top-level statements.

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`statementCount`](../interfaces/IBodyInfo.md#statementcount)

***

### statements

#### Get Signature

> **get** **statements**(): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [core/body-info.ts:74](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L74)

The list of top-level statements within the body.

For expression bodies, this returns a single virtual `ReturnStatement`
wrapping the expression.

##### Returns

[`ASTNode`](../interfaces/ASTNode.md)[]

The list of top-level statements in the body.

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`statements`](../interfaces/IBodyInfo.md#statements)

***

### text

#### Get Signature

> **get** **text**(): `string` \| `null`

Defined in: [core/body-info.ts:101](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L101)

The raw source text of the function body.

For blocks, it typically includes the content between the braces.

##### Returns

`string` \| `null`

The raw source text of the body.

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`text`](../interfaces/IBodyInfo.md#text)

## Methods

### has()

> **has**(`selector`): `boolean`

Defined in: [core/body-info.ts:153](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L153)

Checks if any AST nodes match the CSS-like selector within the function body.

#### Parameters

##### selector

`string`

The Esquery selector string.

#### Returns

`boolean`

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`has`](../interfaces/IBodyInfo.md#has)

***

### query()

> **query**(`selector`): [`ASTNode`](../interfaces/ASTNode.md)[]

Defined in: [core/body-info.ts:144](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/core/body-info.ts#L144)

Searches for AST nodes matching the CSS-like selector within the function body.

#### Parameters

##### selector

`string`

The Esquery selector string.

#### Returns

[`ASTNode`](../interfaces/ASTNode.md)[]

#### Implementation of

[`IBodyInfo`](../interfaces/IBodyInfo.md).[`query`](../interfaces/IBodyInfo.md#query)
