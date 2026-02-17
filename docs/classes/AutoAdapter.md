[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / AutoAdapter

# Class: AutoAdapter

Defined in: [parser/auto-adapter.ts:40](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/auto-adapter.ts#L40)

Smart adapter that selects between Acorn and OXC based on source size
and availability. It also handles various source wrapping strategies
to parse code fragments.

## Constructors

### Constructor

> **new AutoAdapter**(`options`): `AutoAdapter`

Defined in: [parser/auto-adapter.ts:51](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/auto-adapter.ts#L51)

#### Parameters

##### options

`AutoAdapterOptions` = `{}`

Configuration for the auto-adapter.

#### Returns

`AutoAdapter`

## Properties

### acorn

> `readonly` **acorn**: [`AcornAdapter`](AcornAdapter.md)

Defined in: [parser/auto-adapter.ts:42](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/auto-adapter.ts#L42)

The Acorn adapter instance.

***

### oxc

> `readonly` **oxc**: [`OxcAdapter`](OxcAdapter.md)

Defined in: [parser/auto-adapter.ts:44](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/auto-adapter.ts#L44)

The OXC adapter instance.

## Methods

### parseFunctionSource()

> **parseFunctionSource**(`source`, `options`): [`ParseResult`](../interfaces/ParseResult.md)

Defined in: [parser/auto-adapter.ts:102](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/auto-adapter.ts#L102)

Attempts to parse the source using multiple wrapping strategies.

#### Parameters

##### source

`string`

The function source or fragment.

##### options

[`ParseOptions`](../interfaces/ParseOptions.md) = `{}`

Parsing configuration.

#### Returns

[`ParseResult`](../interfaces/ParseResult.md)

The parsing result including the AST and applied offset.

#### Throws

If all parsing attempts fail.

***

### select()

> **select**(`source`, `options?`): [`ParserAdapter`](ParserAdapter.md)

Defined in: [parser/auto-adapter.ts:84](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/auto-adapter.ts#L84)

Selects the most appropriate adapter for the given source and options.

#### Parameters

##### source

`string`

The source code to be parsed.

##### options?

[`ParseOptions`](../interfaces/ParseOptions.md)

Optional engine override and other settings.

#### Returns

[`ParserAdapter`](ParserAdapter.md)

***

### warmup()

> **warmup**(): `void`

Defined in: [parser/auto-adapter.ts:61](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/parser/auto-adapter.ts#L61)

Pre-loads the OXC WASM module during idle time to improve
performance for future large-file parses.

#### Returns

`void`
