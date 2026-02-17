# @isdk/js-analyst

> English | [中文](./README.cn.md)
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
import { createAnalyzer } from '@isdk/js-analyst';

const analyzer = createAnalyzer();
const fn = analyzer.parse('export async function* myGen(a: number = 1) {}');

console.log(fn.name);        // 'myGen'
console.log(fn.isAsync);     // true
console.log(fn.isGenerator); // true
console.log(fn.syntax);      // 'declaration'
```

### 2. Semantic Snippet Matching

The most powerful way to verify. Use a **fuzzy "template"** to match a **concrete implementation**. It automatically ignores differences in naming, spacing, and syntax forms (e.g., arrow vs. declaration).

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

### `FunctionInfo` Object

Returned by `analyzer.parse()`. Provides comprehensive metadata.

| Property | Type | Description |
|------|------|------|
| `name` | `string \| null` | Function name (auto-handles anonymous assigned functions) |
| `kind` | `string` | Role: `function`, `method`, `getter`, `setter`, `constructor` |
| `syntax` | `string` | Form: `declaration`, `expression`, `arrow` |
| `isAsync` | `boolean` | Has `async` keyword |
| `isGenerator` | `boolean` | Has generator `*` |
| `isArrow` | `boolean` | Is arrow function |
| `isStatic` | `boolean` | Is static class member |
| `paramCount` | `number` | Number of defined parameters |
| `params` | `ParamInfo[]` | List of parameter metadata |
| `returnType` | `string \| null` | String representation of TS return type |
| `body` | `BodyInfo` | Tools for function body analysis |

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

Automatically analyzes all `return` paths, including nested branches:

```typescript
analyzer.verify(code, {
  returns: {
    $any: ['args[0]', 'null'], // At least one path returns param 0 or null
    $not: 'undefined'          // No path should explicitly return undefined
  }
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
