[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / AnalyzerOptions

# Interface: AnalyzerOptions

Defined in: [types.ts:262](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L262)

Configuration options for the [Analyzer](../classes/Analyzer.md) class.

## Properties

### engine?

> `optional` **engine**: [`EngineOption`](../type-aliases/EngineOption.md)

Defined in: [types.ts:277](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L277)

The default engine selection strategy.
Defaults to 'auto'.

***

### threshold?

> `optional` **threshold**: `number`

Defined in: [types.ts:267](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L267)

The threshold (in bytes) to switch to the WASM-based OXC parser.
Defaults to 50KB.

***

### warmup?

> `optional` **warmup**: `boolean`

Defined in: [types.ts:272](https://github.com/isdk/js-analyst.js/blob/027e5871d2475cbea451a45da8230763adb9f33f/src/types.ts#L272)

Whether to automatically warm up the WASM-based parser.
Defaults to true.
