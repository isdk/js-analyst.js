[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / ASTNode

# Interface: ASTNode

Defined in: [types.ts:13](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L13)

Represents a base ESTree AST node.

This interface provides compatibility between different parsers such as
Acorn (JavaScript) and OXC (WASM-based high-performance parser).

## Extended by

- [`FunctionNode`](FunctionNode.md)
- [`Identifier`](Identifier.md)
- [`BlockStatement`](BlockStatement.md)
- [`ReturnStatement`](ReturnStatement.md)
- [`BinaryExpression`](BinaryExpression.md)
- [`CallExpression`](CallExpression.md)
- [`MemberExpression`](MemberExpression.md)
- [`Literal`](Literal.md)

## Indexable

\[`key`: `string`\]: `unknown`

Additional parser-specific extension properties.

## Properties

### end?

> `optional` **end**: `number`

Defined in: [types.ts:19](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L19)

The 0-based character offset where the node ends.

***

### loc?

> `optional` **loc**: [`SourceLocation`](SourceLocation.md)

Defined in: [types.ts:21](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L21)

Detailed line and column information for the node's location in source.

***

### range?

> `optional` **range**: \[`number`, `number`\]

Defined in: [types.ts:23](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L23)

The [start, end] character range offsets of the node.

***

### start?

> `optional` **start**: `number`

Defined in: [types.ts:17](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L17)

The 0-based character offset where the node starts.

***

### type

> **type**: `string`

Defined in: [types.ts:15](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L15)

The type of the AST node (e.g., 'Identifier', 'FunctionDeclaration').
