[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / IBodyInfo

# Interface: IBodyInfo

Defined in: [types.ts:463](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L463)

Interface representing detailed information about a function body.

## Properties

### isBlock

> `readonly` **isBlock**: `boolean`

Defined in: [types.ts:467](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L467)

Whether the body is a block statement.

***

### isExpression

> `readonly` **isExpression**: `boolean`

Defined in: [types.ts:469](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L469)

Whether the body is a single expression (arrow functions).

***

### node

> `readonly` **node**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:465](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L465)

The AST node of the body (BlockStatement or Expression).

***

### returns

> `readonly` **returns**: [`ASTNode`](ASTNode.md)[]

Defined in: [types.ts:477](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L477)

All return statements found within the body's scope.

***

### statementCount

> `readonly` **statementCount**: `number`

Defined in: [types.ts:473](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L473)

The number of top-level statements.

***

### statements

> `readonly` **statements**: [`ASTNode`](ASTNode.md)[]

Defined in: [types.ts:471](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L471)

The list of top-level statements in the body.

***

### text

> `readonly` **text**: `string` \| `null`

Defined in: [types.ts:475](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L475)

The raw source text of the body.

## Methods

### has()

> **has**(`selector`): `boolean`

Defined in: [types.ts:481](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L481)

Checks if any AST nodes match the CSS-like selector within the body.

#### Parameters

##### selector

`string`

#### Returns

`boolean`

***

### query()

> **query**(`selector`): [`ASTNode`](ASTNode.md)[]

Defined in: [types.ts:479](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L479)

Searches for AST nodes matching the CSS-like selector within the body.

#### Parameters

##### selector

`string`

#### Returns

[`ASTNode`](ASTNode.md)[]
