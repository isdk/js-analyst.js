[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / ParseResult

# Interface: ParseResult

Defined in: [types.ts:250](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L250)

The internal result structure of a parse operation.

## Properties

### ast

> **ast**: [`ASTNode`](ASTNode.md)

Defined in: [types.ts:252](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L252)

The root AST node of the parsed source.

***

### engine

> **engine**: [`EngineName`](../type-aliases/EngineName.md)

Defined in: [types.ts:256](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L256)

The name of the engine used for parsing.

***

### offset

> **offset**: `number`

Defined in: [types.ts:254](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/types.ts#L254)

The character offset applied to the source during parsing.
