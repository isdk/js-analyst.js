[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / MemberExpression

# Interface: MemberExpression

Defined in: [types.ts:127](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L127)

Represents a member access expression (e.g., obj.prop or obj[prop]).

## Extends

- [`ASTNode`](ASTNode.md)

## Indexable

\[`key`: `string`\]: `unknown`

Additional parser-specific extension properties.

## Properties

### computed

> **computed**: `boolean`

Defined in: [types.ts:134](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L134)

Whether the access is computed (e.g., obj[prop]).

***

### end?

> `optional` **end**: `number`

Defined in: [types.ts:19](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L19)

The 0-based character offset where the node ends.

#### Inherited from

[`ASTNode`](ASTNode.md).[`end`](ASTNode.md#end)

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [types.ts:21](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L21)

Detailed line and column information for the node's location in source.

#### Inherited from

[`ASTNode`](ASTNode.md).[`loc`](ASTNode.md#loc)

***

### object

> **object**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:130](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L130)

The object being accessed.

***

### property

> **property**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:132](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L132)

The property being accessed.

***

### range?

> `optional` **range**: \[`number`, `number`\]

Defined in: [types.ts:23](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L23)

The [start, end] character range offsets of the node.

#### Inherited from

[`ASTNode`](ASTNode.md).[`range`](ASTNode.md#range)

***

### start?

> `optional` **start**: `number`

Defined in: [types.ts:17](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L17)

The 0-based character offset where the node starts.

#### Inherited from

[`ASTNode`](ASTNode.md).[`start`](ASTNode.md#start)

***

### type

> **type**: `"MemberExpression"`

Defined in: [types.ts:128](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L128)

The type of the AST node (e.g., 'Identifier', 'FunctionDeclaration').

#### Overrides

[`ASTNode`](ASTNode.md).[`type`](ASTNode.md#type)
