[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / OxcAdapter

# Class: OxcAdapter

Defined in: [parser/oxc-adapter.ts:22](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/oxc-adapter.ts#L22)

Parser adapter for the high-performance OXC engine.

OXC is significantly faster than JS-based parsers, making it
ideal for large files or batch processing.

## Extends

- [`ParserAdapter`](ParserAdapter.md)

## Constructors

### Constructor

> **new OxcAdapter**(): `OxcAdapter`

Defined in: [parser/oxc-adapter.ts:25](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/oxc-adapter.ts#L25)

#### Returns

`OxcAdapter`

#### Overrides

[`ParserAdapter`](ParserAdapter.md).[`constructor`](ParserAdapter.md#constructor)

## Properties

### name

> `readonly` **name**: [`EngineName`](../type-aliases/EngineName.md)

Defined in: [parser/adapter.ts:15](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L15)

The name of the parsing engine.

#### Inherited from

[`ParserAdapter`](ParserAdapter.md).[`name`](ParserAdapter.md#name)

***

### ready

> **ready**: `boolean`

Defined in: [parser/adapter.ts:17](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L17)

Whether the parser is initialized and ready to use.

#### Inherited from

[`ParserAdapter`](ParserAdapter.md).[`ready`](ParserAdapter.md#ready)

## Methods

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [parser/oxc-adapter.ts:34](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/oxc-adapter.ts#L34)

Dynamically loads the OXC module.

#### Returns

`Promise`\<`void`\>

#### Throws

If the `oxc-parser` package is not installed or fails to load.

#### Overrides

[`ParserAdapter`](ParserAdapter.md).[`init`](ParserAdapter.md#init)

***

### initSync()

> **initSync**(): `void`

Defined in: [parser/adapter.ts:39](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L39)

Synchronously initializes the parser.
Used for pure JavaScript parsers like Acorn.

#### Returns

`void`

#### Inherited from

[`ParserAdapter`](ParserAdapter.md).[`initSync`](ParserAdapter.md#initsync)

***

### parse()

> **parse**(`source`, `options`): [`ASTNode`](../interfaces/ASTNode.md)

Defined in: [parser/oxc-adapter.ts:58](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/oxc-adapter.ts#L58)

Parses the source using the OXC engine.

#### Parameters

##### source

`string`

The source code to parse.

##### options

[`ParseOptions`](../interfaces/ParseOptions.md) = `{}`

Configuration options.

#### Returns

[`ASTNode`](../interfaces/ASTNode.md)

#### Throws

If the source code contains syntax errors.

#### Overrides

[`ParserAdapter`](ParserAdapter.md).[`parse`](ParserAdapter.md#parse)
