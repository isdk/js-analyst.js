[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / AcornAdapter

# Class: AcornAdapter

Defined in: [parser/acorn-adapter.ts:16](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/parser/acorn-adapter.ts#L16)

Parser adapter for the Acorn engine.

This adapter uses the Acorn library and its TypeScript plugin to
provide standard-compliant JavaScript and TypeScript parsing.

## Extends

- [`ParserAdapter`](ParserAdapter.md)

## Constructors

### Constructor

> **new AcornAdapter**(): `AcornAdapter`

Defined in: [parser/acorn-adapter.ts:20](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/parser/acorn-adapter.ts#L20)

#### Returns

`AcornAdapter`

#### Overrides

[`ParserAdapter`](ParserAdapter.md).[`constructor`](ParserAdapter.md#constructor)

## Properties

### name

> `readonly` **name**: [`EngineName`](../type-aliases/EngineName.md)

Defined in: [parser/adapter.ts:15](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/parser/adapter.ts#L15)

The name of the parsing engine.

#### Inherited from

[`ParserAdapter`](ParserAdapter.md).[`name`](ParserAdapter.md#name)

***

### ready

> **ready**: `boolean`

Defined in: [parser/adapter.ts:17](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/parser/adapter.ts#L17)

Whether the parser is initialized and ready to use.

#### Inherited from

[`ParserAdapter`](ParserAdapter.md).[`ready`](ParserAdapter.md#ready)

## Methods

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [parser/adapter.ts:31](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/parser/adapter.ts#L31)

Asynchronously initializes the parser.
Necessary for WASM-based parsers like OXC.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ParserAdapter`](ParserAdapter.md).[`init`](ParserAdapter.md#init)

***

### initSync()

> **initSync**(): `void`

Defined in: [parser/adapter.ts:39](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/parser/adapter.ts#L39)

Synchronously initializes the parser.
Used for pure JavaScript parsers like Acorn.

#### Returns

`void`

#### Inherited from

[`ParserAdapter`](ParserAdapter.md).[`initSync`](ParserAdapter.md#initsync)

***

### parse()

> **parse**(`source`, `options`): [`ASTNode`](../interfaces/ASTNode.md)

Defined in: [parser/acorn-adapter.ts:33](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/parser/acorn-adapter.ts#L33)

Parses the source using Acorn.

#### Parameters

##### source

`string`

The source code to parse.

##### options

[`ParseOptions`](../interfaces/ParseOptions.md) = `{}`

Configuration including TS support and source type.

#### Returns

[`ASTNode`](../interfaces/ASTNode.md)

#### Overrides

[`ParserAdapter`](ParserAdapter.md).[`parse`](ParserAdapter.md#parse)
