[**@isdk/js-analyst**](../README.md)

***

[@isdk/js-analyst](../globals.md) / createAnalyzer

# Function: createAnalyzer()

> **createAnalyzer**(`options?`): [`Analyzer`](../classes/Analyzer.md)

Defined in: [index.ts:36](https://github.com/isdk/js-analyst.js/blob/4edf4218767c639fe7374c900929abd389606f45/src/index.ts#L36)

Creates a new Analyzer instance.

This is the recommended way to instantiate the analyzer with custom options.

## Parameters

### options?

[`AnalyzerOptions`](../interfaces/AnalyzerOptions.md)

Configuration options for the analyzer.

## Returns

[`Analyzer`](../classes/Analyzer.md)

A new [Analyzer](../classes/Analyzer.md) instance.

## Examples

```typescript
const analyzer = createAnalyzer();
const fn = analyzer.parse('function add(a, b) { return a + b }');
console.log(fn.name);       // 'add'
console.log(fn.paramCount); // 2
```

```ts
// Specify a specific engine
const analyzer = createAnalyzer({ engine: 'acorn' });
```

```ts
// Custom WASM switching threshold
const analyzer = createAnalyzer({ threshold: 100 * 1024 });
```
