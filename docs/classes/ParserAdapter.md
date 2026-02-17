[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / ParserAdapter

# Abstract Class: ParserAdapter

Defined in: [parser/adapter.ts:13](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L13)

Base class for parser adapters.

All concrete parser implementations (e.g., Acorn, OXC) must extend this class.
This abstraction allows the core logic to remain engine-agnostic.

## Extended by

- [`AcornAdapter`](AcornAdapter.md)
- [`OxcAdapter`](OxcAdapter.md)

## Constructors

### Constructor

> **new ParserAdapter**(`name`): `ParserAdapter`

Defined in: [parser/adapter.ts:22](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L22)

#### Parameters

##### name

[`EngineName`](../type-aliases/EngineName.md)

The unique name of the parsing engine.

#### Returns

`ParserAdapter`

## Properties

### name

> `readonly` **name**: [`EngineName`](../type-aliases/EngineName.md)

Defined in: [parser/adapter.ts:15](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L15)

The name of the parsing engine.

***

### ready

> **ready**: `boolean`

Defined in: [parser/adapter.ts:17](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L17)

Whether the parser is initialized and ready to use.

## Methods

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [parser/adapter.ts:31](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L31)

Asynchronously initializes the parser.
Necessary for WASM-based parsers like OXC.

#### Returns

`Promise`\<`void`\>

***

### initSync()

> **initSync**(): `void`

Defined in: [parser/adapter.ts:39](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L39)

Synchronously initializes the parser.
Used for pure JavaScript parsers like Acorn.

#### Returns

`void`

***

### parse()

> `abstract` **parse**(`source`, `options?`): [`ASTNode`](../interfaces/ASTNode.md)

Defined in: [parser/adapter.ts:50](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/adapter.ts#L50)

Parses the source code and returns the ESTree AST root node.

#### Parameters

##### source

`string`

The source code to parse.

##### options?

[`ParseOptions`](../interfaces/ParseOptions.md)

Optional parsing configuration.

#### Returns

[`ASTNode`](../interfaces/ASTNode.md)

The root node of the parsed AST.
