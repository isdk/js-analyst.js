**@isdk/js-analyst**

***

# @isdk/js-analyst

> English | [中文](_media/README.cn.md)
> Lightweight JavaScript / TypeScript function analysis library with hybrid JS/WASM parsing.

Small files are parsed instantly with [acorn](https://github.com/acornjs/acorn) (~13KB). Large files automatically switch to [oxc-parser](https://github.com/oxc-project/oxc) WASM (~400KB) for 20x faster parsing. One unified API — zero adaptation cost.

## Features

- 🔍 **Complete Function Analysis** — Extract name, params (destructuring/defaults), body, return paths, and TS types.
- 🛡️ **Semantic Snippet Verification** — Write code snippets as validation rules. Matches logic instead of strings.
- 🧩 **First-class TypeScript Support** — Generic types, union types, and `any` wildcard matching.
- ⚡ **Hybrid Parsing Engine** — Seamlessly switches between engines for optimal performance.
- 🎯 **Scope-Aware Analysis** — AST queries and return path analysis are strictly limited to the function's own scope.

## Install

```bash
npm install @isdk/js-analyst
```

---

## Quick Start

### 1. Basic Analysis

```typescript
import { createAnalyzer, parse, parseAll } from '@isdk/js-analyst';

// Quick parse the first function
const fn = parse('const add = (a, b) => a + b');
console.log(fn.name); // 'add'

// Parse all functions in a file
const code = `
  function save() {}
  function load() {}
`;
const fns = parseAll(code);
console.log(fns.length); // 2

// Or use a custom analyzer instance
const analyzer = createAnalyzer({ engine: 'oxc' });
const result = analyzer.parse('export async function* myGen(a: number = 1) {}');
```

### 2. Magic Snippet Matching (Power of Semantic)

This is the most powerful way to verify code. Use a **fuzzy code template** to match a **concrete implementation**. The engine automatically ignores irrelevant naming differences, spacing, brackets, or declaration styles.

```typescript
import { verify } from '@isdk/js-analyst';

// Actual code: uses specific names, TS types, and arrow syntax
const code = 'const add = (a: number, b: number): number => (a + b)';

// Validation pattern:
// - Uses args[0], args[1] to ignore actual parameter names
// - Uses :any to wildcard the type constraints
// - Matches even though it's written as a standard function declaration
const pattern = 'function _(args[0]: any, args[1]: any) { return args[0] + args[1] }';

const result = verify(code, pattern);
console.log(result.passed); // ✅ true
```

---

## API Reference

### `Analyzer` Options

Passed to `createAnalyzer(options)`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `engine` | `'auto' \| 'acorn' \| 'oxc'` | `'auto'` | Force a specific parser engine. |
| `threshold` | `number` | `50 * 1024` | Byte size threshold to switch to WASM (OXC) in auto mode. |
| `warmup` | `boolean` | `true` | Pre-initialize WASM engine for faster first parse. |

### `FunctionInfo` Object

Returned by `analyzer.parse()`. Provides comprehensive metadata.

| Property | Type | Description |
|------|------|------|
| `name` | `string \| null` | Function name (handles assignments & methods) |
| `kind` | `string` | `function`, `method`, `getter`, `setter`, `constructor` |
| `syntax` | `string` | `declaration`, `expression`, `arrow` |
| `isAsync` | `boolean` | `true` if `async` |
| `isGenerator` | `boolean` | `true` if generator `*` |
| `isStatic` | `boolean` | `true` if class static member |
| `paramCount` | `number` | Number of parameters |
| `params` | `ParamInfo[]` | Detailed parameter metadata |
| `returnType` | `string \| null` | TS return type annotation string |
| `body` | `BodyInfo` | Tools for function body analysis |
| `engine` | `string` | Engine used for this function (`acorn` \| `oxc`) |

**Methods:**

- `param(index: number)`: Get `ParamInfo` by index.
- `paramByName(name: string)`: Get `ParamInfo` by name.
- `query(selector: string)`: Find AST nodes in scope using Esquery.
- `has(selector: string)`: Check if selector exists in scope.
- `toJSON()`: Export to plain object.

### `ParamInfo` Object

| Property | Type | Description |
|------|------|------|
| `name` | `string \| null` | Parameter name (null if destructured) |
| `type` | `string \| null` | TS type annotation |
| `hasDefault` | `boolean` | Has default value |
| `isRest` | `boolean` | Is rest parameter (`...args`) |
| `isDestructured` | `boolean` | Is object/array destructuring |
| `pattern` | `'object' \| 'array' \| null` | Destructuring type |
| `text` | `string` | Raw source of the parameter |

### `BodyInfo` Object

| Property | Type | Description |
|------|------|------|
| `statements` | `ASTNode[]` | Top-level statements in the body |
| `returns` | `ASTNode[]` | All scope-aware return paths |
| `isBlock` | `boolean` | Uses `{}` braces |
| `isExpression` | `boolean` | Single expression (arrow functions) |
| `text` | `string` | Raw source of the body content |

**Methods:**

- `query(selector)` / `has(selector)`: Scoped AST querying.

---

## Advanced Verification Syntax

`analyzer.verify(code, schema)` supports a powerful query-like language.

### 1. Snippet Placeholders

In snippet strings, use these symbols to build generic templates:

| Placeholder | Description | Example |
|--------|------|------|
| **`args[i]`** | Refers to the i-th parameter (supports destructuring) | `return args[0] + args[1]` |
| **`_`** | Matches any **single** AST node | `console.log(_)` matches any log call |
| **`...`** | Matches **zero or more** AST nodes | `try { ... } catch(_) { ... }` |
| **`: any`** | Type wildcard | `(a: any)` matches `(a: string)`, etc. |

### 2. Logic Operators

Combine multiple matching conditions using logic operators:

```typescript
analyzer.verify(code, {
  name: { $or: ['init', 'setup', /^start/] }, // Match any of these
  body: {
    $match: [
      'const user = await auth(_)', // Step 1: call auth
      '...',                        // Any statements in between
      'return user.data'            // Finally: return user.data
    ],
    $none: ['debugger']             // Must NOT contain debugger
  }
});
```

### 3. Return Path Set Verification (`returns`)

Automatically analyzes all `return` paths, including nested branches. You can use matchers or a **custom callback**:

```typescript
analyzer.verify(code, {
  returns: (helper) => {
    // helper provides convenient checks
    return helper.isCall('fetch') || helper.isBinaryOp('+', '_', '_');
  }
});
```

### 4. Custom Logic Hooks

Perform deep validation using the full power of the API:

```typescript
analyzer.verify(code, {
  custom: (fn) => {
    return fn.paramCount > 0 && fn.body.has('VariableDeclaration');
  },
  body: {
    custom: (body) => body.statementCount < 10
  }
});
```

### 5. Strict Mode

By default, the engine ignores non-semantic differences. Use `strict: true` for exact structural matching:

```typescript
analyzer.verify(code, {
  strict: true,
  body: 'return a+b' // Will NOT match 'return (a+b)' in strict mode
});
```

---

## Semantic Equivalence

The engine automatically ignores non-semantic differences (unless `strict: true`):

- **Wrapping**: `return (a + b)` ≡ `return a + b`; `ExpressionStatement` ≡ `Expression`.
- **Implicit Returns**: `() => x` ≡ `{ return x }`.
- **Declaration Kinds**: `const x = 1` ≡ `let x = 1` ≡ `var x = 1`.
- **Property Shorthand**: `{ x }` ≡ `{ x: x }`.
- **Literal Normalization**: `255` ≡ `0xff` ≡ `0b11111111`.
- **TS Wildcards**: `Promise<any>` matches `Promise<string>` or `Promise<User>`.

---

## Utilities

The library exports several low-level utilities for manual AST or source processing:

| Function | Description |
|----------|-------------|
| `stripComments(code)` | Remove all JS/TS comments. |
| `detectTypeScript(code)` | Guess if code is TS based on syntax. |
| `offsetToLineColumn(code, offset)` | Convert character offset to `{ line, column }`. |
| `findInScope(node, test)` | Find nodes while respecting function scope boundaries. |
| `tsTypeToString(typeNode)` | Normalize TS type nodes to string representation. |

---

## Examples

### Scenario: Enforcing Security Policies

Check if all API handlers perform authentication and have error handling:

```typescript
import { createAnalyzer } from '@isdk/js-analyst';
const analyzer = createAnalyzer();

const result = analyzer.verify(source, {
  async: true,
  body: {
    $match: [
      'const ctx = await authenticate(_)', // Must auth first
      '...',
      'return _'                           // Must return something
    ],
    $has: ['try { ... } catch (_) { ... }'] // Must have error handling
  }
});
```

## License

MIT
