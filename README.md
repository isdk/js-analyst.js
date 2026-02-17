# @isdk/js-analyst

> English | [中文](./README.cn.md)
> Lightweight JavaScript / TypeScript function analysis library with hybrid JS/WASM parsing.

Small files are parsed instantly with [acorn](https://github.com/acornjs/acorn) (~13KB). Large files automatically switch to [oxc-parser](https://github.com/oxc-project/oxc) WASM (~400KB) for 20x faster parsing. One unified API — zero adaptation cost.

```
                your code
                    │
              ┌─────┴──────┐
              │  Analyzer  │
              └─────┬──────┘
                    │
              ESTree AST (unified)
                    │
        ┌───────────┴───────────┐
        │                       │
   < threshold              ≥ threshold
        │                       │
 ┌──────┴───────┐       ┌───────┴────────┐
 │ acorn (JS)   │       │ oxc-parser     │
 │ ~13KB        │       │ WASM ~400KB    │
 │ sync, instant│       │ lazy-loaded    │
 └──────────────┘       └────────────────┘
```

## Features

- 🔍 **Complete function analysis** — name, params, body, return type, async/generator/arrow detection
- 🛡️ **Declarative verification** — validate function signatures with a simple schema
- 🧩 **TypeScript support** — full TS type annotation parsing with auto-detection
- ⚡ **Hybrid parsing** — acorn for small files, oxc WASM for large files, automatic switching
- 🎯 **Scoped AST queries** — search within a function body without leaking into nested functions
- 📦 **Lightweight** — only acorn (~13KB) required; WASM is optional and lazy-loaded
- 🌳 **Tree-shakable** — ESM + CJS dual output, use only what you need

## Install

```bash
npm install @isdk/js-analyst
```

WASM engine (optional, for large files):

```bash
npm install @oxc-parser/wasm
```

## Quick Start

### Parse a function

```typescript
import { createAnalyzer } from '@isdk/js-analyst';

const analyzer = createAnalyzer();

const fn = analyzer.parse('class A { static async *gen() {} }');

fn.name          // 'gen'
fn.kind          // 'method'
fn.syntax        // 'expression'
fn.isStatic      // true
fn.isAsync       // true
fn.isGenerator   // true
fn.isArrow       // false
fn.paramCount    // 0
```

### Advanced Filtering

Find specific types of functions in a large source file:

```typescript
// Find all getters
const getters = analyzer.parseAll(source, { kind: 'getter' });

// Find all arrow functions
const arrows = analyzer.parseAll(source, { syntax: 'arrow' });

// Find all static methods
const statics = analyzer.parseAll(source).filter(f => f.isStatic);
```

### Parse TypeScript

```typescript
const fn = analyzer.parse(
  'function add(x: number, y: number): number { return x + y }'
);

fn.param(0).type  // 'number'
fn.param(1).type  // 'number'
fn.returnType     // 'number'
```

TypeScript is auto-detected. You can also force it:

```typescript
analyzer.parse(source, { ts: true });
```

### Verify a function

```typescript
const result = fn.verify({
  name: 'add',
  async: false,
  params: [
    { name: 'x', type: 'number' },
    { name: 'y', type: 'number' },
  ],
  returnType: 'number',
  body: {
    statementCount: 1,
    returns: (ret) => ret.isBinaryOp('+', 'x', 'y'),
  },
});

result.passed   // true
result.failures // []
result.summary  // '✅ All checks passed'
```

### Shorthand API

```typescript
import { parse, verify } from '@isdk/js-analyst';

// Quick parse (uses a default singleton analyzer)
const fn = parse('(a, b) => a + b');

// Quick verify
const result = verify(
  'function add(a, b) { return a + b }',
  { name: 'add', paramCount: 2 }
);
```

## API Reference

### `createAnalyzer(options?)`

Creates an analyzer instance.

```typescript
const analyzer = createAnalyzer({
  threshold: 50 * 1024,  // bytes — switch to WASM above this (default: 50KB)
  warmup: true,          // auto-preload WASM during idle (default: true)
  engine: 'auto',        // 'auto' | 'acorn' | 'oxc' (default: 'auto')
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `51200` | Source length in bytes above which WASM is used |
| `warmup` | `boolean` | `true` | Preload WASM module during idle time |
| `engine` | `string` | `'auto'` | `'auto'` switches by size; `'acorn'` or `'oxc'` forces an engine |

---

### `analyzer.parse(input, options?)`

Parse a function string or runtime function reference. Returns a `FunctionInfo`.

```typescript
// From string
const fn = analyzer.parse('function add(a, b) { return a + b }');

// From runtime function
function myFunc(a: number) { return a * 2; }
const fn = analyzer.parse(myFunc);
```

**Parse options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ts` | `boolean` | auto-detect | Force TypeScript parsing |
| `engine` | `'acorn' \| 'oxc'` | auto | Force a specific engine for this call |
| `sourceType` | `'script' \| 'module'` | `'script'` | ECMAScript source type |
| `kind` | `FunctionKind \| FunctionKind[]` | - | Filter by kind (`function`, `method`, `getter`, `setter`, `constructor`) |
| `syntax` | `FunctionSyntax \| FunctionSyntax[]` | - | Filter by syntax (`declaration`, `expression`, `arrow`) |

---

### `analyzer.parseAll(source, options?)`

Parse all functions in a source string. Returns `FunctionInfo[]`.

```typescript
const fns = analyzer.parseAll(`
  function add(a, b) { return a + b }
  const sub = (a, b) => a - b;
  async function fetch(url) { return await get(url) }
`);

fns.length        // 3
fns[0].name       // 'add'
fns[1].isArrow    // true
fns[2].isAsync    // true
```

---

### `analyzer.verify(input, schema, options?)`

Parse and verify in one call.

```typescript
const result = analyzer.verify(
  'async function fetchUser(id: string): Promise<User> { ... }',
  {
    name: 'fetchUser',
    async: true,
    params: [{ name: 'id', type: 'string' }],
    returnType: /^Promise/,
  },
  { ts: true }
);
```

---

### `FunctionInfo`

Returned by `analyzer.parse()`. All properties are lazy-evaluated and cached.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string \| null` | Function name (`null` for anonymous) |
| `kind` | `'function' \| 'method' \| 'getter' \| 'setter' \| 'constructor'` | Logical role |
| `syntax` | `'declaration' \| 'expression' \| 'arrow'` | Syntactic form |
| `isStatic` | `boolean` | Whether it's a static class member |
| `isAsync` | `boolean` | Whether the function is `async` |
| `isGenerator` | `boolean` | Whether the function is a generator (`function*`) |
| `isArrow` | `boolean` | Whether it's an arrow function |
| `isDeclaration` | `boolean` | Whether it's a `FunctionDeclaration` |
| `isExpression` | `boolean` | Whether it's a `FunctionExpression` |
| `params` | `ParamInfo[]` | Parameter list |
| `paramCount` | `number` | Number of parameters |
| `returnType` | `string \| null` | TS return type annotation |
| `body` | `BodyInfo` | Function body information |
| `node` | `ASTNode` | Raw ESTree AST node |
| `engine` | `string` | Which engine parsed this (`'acorn'` or `'oxc'`) |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `param(index)` | `ParamInfo \| null` | Get param by index |
| `paramByName(name)` | `ParamInfo \| null` | Get param by name |
| `query(selector)` | `ASTNode[]` | Query AST nodes in function body |
| `has(selector)` | `boolean` | Check if body contains a node type |
| `verify(schema)` | `VerifyResult` | Run declarative verification |
| `toJSON()` | `FunctionInfoJSON` | Serialize to plain object |

---

### `ParamInfo`

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string \| null` | Parameter name (`null` for destructured) |
| `type` | `string \| null` | TS type annotation string |
| `hasDefault` | `boolean` | Whether it has a default value |
| `isRest` | `boolean` | Whether it's a rest parameter (`...args`) |
| `isDestructured` | `boolean` | Whether it's destructured |
| `pattern` | `'object' \| 'array' \| null` | Destructuring pattern type |
| `defaultNode` | `ASTNode \| null` | Default value AST node |
| `text` | `string \| null` | Raw source text of the parameter |

---

### `BodyInfo`

| Property / Method | Type | Description |
|----------|------|-------------|
| `isBlock` | `boolean` | Block body `{ ... }` |
| `isExpression` | `boolean` | Expression body (arrow) |
| `statements` | `ASTNode[]` | Statement list (expression body wrapped as virtual `return`) |
| `statementCount` | `number` | Number of statements |
| `text` | `string \| null` | Source text of the body |
| `returns` | `ASTNode[]` | All `return` statements in current scope |
| `query(selector)` | `ASTNode[]` | Scoped AST query |
| `has(selector)` | `boolean` | Scoped existence check |

---

### Verify Schema

The schema is a declarative object describing what you expect:

```typescript
interface VerifySchema {
  name?: Matcher<string | null>;      // exact, regex, or function
  kind?: Matcher<FunctionKind>;
  syntax?: Matcher<FunctionSyntax>;
  static?: boolean;
  async?: boolean;
  generator?: boolean;
  arrow?: boolean;
  paramCount?: Matcher<number>;
  params?: ParamSchema[];
  returnType?: Matcher<string | null>;
  body?: BodySchema;
  custom?: (fn: FunctionInfo) => boolean;
}
```

#### Matchers

Every field supports three matching modes:

```typescript
// Exact match
{ name: 'add' }

// Regex match
{ name: /^get/ }

// Function predicate
{ name: (n) => n !== null && n.startsWith('get') }
{ paramCount: (n) => n >= 1 && n <= 3 }
```

#### ParamSchema

```typescript
interface ParamSchema {
  name?: Matcher<string | null>;
  type?: Matcher<string | null>;
  hasDefault?: boolean;
  isRest?: boolean;
  isDestructured?: boolean;
  pattern?: 'object' | 'array' | null;
}
```

#### BodySchema

```typescript
interface BodySchema {
  statementCount?: Matcher<number>;
  has?: string | string[];              // must contain these node types
  notHas?: string | string[];           // must NOT contain these node types
  returns?: (helper, node, index) => boolean;   // validate each return
  custom?: (body: BodyInfo) => boolean;         // custom check
}
```

#### ReturnHelper

The `returns` callback receives a `ReturnHelper` for concise assertions:

```typescript
ret.isBinaryOp('+', 'x', 'y')     // return x + y
ret.isCall('fetch')                // return fetch(...)
ret.isCall()                       // return anyFunction(...)
ret.isLiteral(42)                  // return 42
ret.isLiteral()                    // return <any literal>
ret.isIdentifier('x')             // return x
ret.isMemberAccess('res', 'json') // return res.json
ret.isTemplateLiteral()           // return `...`
```

#### VerifyResult

```typescript
interface VerifyResult {
  passed: boolean;             // true if all checks passed
  failures: VerifyFailure[];   // list of failures
  summary: string;             // human-readable summary
}

interface VerifyFailure {
  path: string;       // e.g. 'name', 'params[0].type', 'body.returns[0]'
  expected?: unknown;
  actual?: unknown;
  message: string;
}
```

---

### AST Query Selectors

Simple CSS-like selectors for AST queries:

```typescript
fn.query('ReturnStatement')                    // all return statements
fn.query('Identifier[name="x"]')              // all identifiers named 'x'
fn.query('BinaryExpression[operator="+"]')     // all + operations
fn.query('CallExpression')                     // all function calls

fn.has('AwaitExpression')                      // does body contain await?
fn.has('YieldExpression')                      // does body contain yield?
fn.has('ThrowStatement')                       // does body throw?
```

All queries are **scoped** to the current function — they do not leak into nested function definitions.

---

## Examples

### Validate an API handler

```typescript
const result = analyzer.verify(
  `async function createUser(
    data: CreateUserInput,
    ctx: Context
  ): Promise<User> {
    const user = await ctx.db.users.create(data);
    return user;
  }`,
  {
    name: 'createUser',
    async: true,
    generator: false,
    paramCount: 2,
    params: [
      { name: 'data', type: 'CreateUserInput' },
      { name: 'ctx', type: 'Context' },
    ],
    returnType: /^Promise/,
    body: {
      has: 'AwaitExpression',
      notHas: 'ThrowStatement',
      returns: (ret) => ret.isIdentifier('user'),
    },
  }
);
```

### Validate a pure function

```typescript
analyzer.verify(
  '(x: number, y: number): number => x + y',
  {
    arrow: true,
    async: false,
    params: [
      { name: 'x', type: 'number' },
      { name: 'y', type: 'number' },
    ],
    returnType: 'number',
    body: {
      returns: (ret) => ret.isBinaryOp('+', 'x', 'y'),
    },
  }
);
```

### Validate destructured params

```typescript
analyzer.verify(
  `function updateUser(
    id: string,
    { name, email, age = 0 }: UpdateFields,
    ...tags: string[]
  ) {
    return db.update(id, { name, email, age, tags });
  }`,
  {
    name: 'updateUser',
    paramCount: 3,
    params: [
      { name: 'id', type: 'string' },
      { isDestructured: true, pattern: 'object', type: 'UpdateFields' },
      { name: 'tags', isRest: true, type: 'string[]' },
    ],
    body: {
      statementCount: 1,
      returns: (ret) => ret.isCall('update'),
    },
  }
);
```

### Batch analysis

```typescript
const source = fs.readFileSync('src/handlers.ts', 'utf-8');
const fns = analyzer.parseAll(source, { ts: true });

// List all async functions
const asyncFns = fns.filter(fn => fn.isAsync);
console.log(`Found ${asyncFns.length} async functions`);

// Find functions with more than 5 params
const tooManyParams = fns.filter(fn => fn.paramCount > 5);
for (const fn of tooManyParams) {
  console.warn(`${fn.name}: ${fn.paramCount} params — consider refactoring`);
}

// Check all functions have return statements
for (const fn of fns) {
  if (fn.body.returns.length === 0 && !fn.isGenerator) {
    console.warn(`${fn.name ?? '(anonymous)'}: no return statement`);
  }
}
```

### Use flexible matchers

```typescript
analyzer.verify(source, {
  // Regex: name must start with 'get' or 'fetch'
  name: /^(get|fetch)/,

  // Function: 1–4 params
  paramCount: (n) => n >= 1 && n <= 4,

  // Function: return type must be a Promise
  returnType: (t) => t !== null && t.startsWith('Promise'),

  body: {
    // No more than 10 statements
    custom: (body) => body.statementCount <= 10,

    // Must not contain console.log
    notHas: 'CallExpression',  // (simplified — for precise check use custom)

    // Custom: no direct throw, all errors should be returned
    custom: (body) => !body.has('ThrowStatement'),
  },
});
```

### Access raw AST

```typescript
const fn = analyzer.parse('function foo(x) { return x * 2 + 1 }');

// Get the raw ESTree AST node
console.log(fn.node.type); // 'FunctionDeclaration'

// Advanced AST queries
const multiplications = fn.query('BinaryExpression[operator="*"]');
console.log(multiplications.length); // 1

// Direct AST node inspection
const ret = fn.body.returns[0];
console.log(ret); // { type: 'ReturnStatement', argument: { type: 'BinaryExpression', ... } }
```

### Force a specific engine

```typescript
// Always use acorn (no WASM dependency)
const analyzer = createAnalyzer({ engine: 'acorn' });

// Always use oxc WASM (must await warmup)
const analyzer = createAnalyzer({ engine: 'oxc' });
await analyzer.warmup();

// Per-call override
analyzer.parse(source, { engine: 'oxc' });
```

---

## How the hybrid engine works

```
Input source string
        │
        ▼
  source.length >= threshold?  ──── No ──→  acorn (JS, sync, instant)
        │                                          │
       Yes                                         │
        │                                          │
  WASM ready?  ──── No ──→  acorn (fallback)       │
        │                                          │
       Yes                                         │
        │                                          │
  oxc-parser (WASM, 20x faster)                    │
        │                                          │
        └──────────────┬───────────────────────────┘
                       │
                 ESTree AST (identical format)
                       │
                 FunctionInfo / verify / query
```

- **WASM is optional**: if `@oxc-parser/wasm` is not installed, acorn handles everything.
- **WASM is lazy-loaded**: it downloads and compiles during browser idle time or after a 2-second delay in Node.js.
- **Graceful fallback**: if WASM fails to load, acorn silently takes over.
- **Both engines output ESTree**: your analysis code never needs to know which engine ran.

---

## Supported function forms

| Form | Example | Supported |
|------|---------|-----------|
| Named declaration | `function add(a, b) {}` | ✅ |
| Anonymous expression | `function(a, b) {}` | ✅ |
| Arrow (block body) | `(a, b) => { return a + b }` | ✅ |
| Arrow (expression body) | `(a, b) => a + b` | ✅ |
| Arrow (single param) | `x => x * 2` | ✅ |
| Arrow (no params) | `() => 42` | ✅ |
| Async function | `async function f() {}` | ✅ |
| Async arrow | `async (x) => await x` | ✅ |
| Generator | `function* g() { yield 1 }` | ✅ |
| Async generator | `async function* ag() {}` | ✅ |
| Method shorthand | `method(a) {}` | ✅ |
| Getter / Setter | `get x() {}` / `set x(v) {}` | ✅ |
| Runtime function | `parse(myFunction)` | ✅ |
| Default params | `function f(a = 1) {}` | ✅ |
| Rest params | `function f(...args) {}` | ✅ |
| Destructured params | `function f({ a, b }) {}` | ✅ |
| TS typed params | `function f(x: number) {}` | ✅ |
| TS return type | `function f(): string {}` | ✅ |
| TS union types | `function f(x: string \| number) {}` | ✅ |
| TS generics | `function f<T>(x: T): T {}` | ✅ |

---

## Project Structure

```
js-analyst/
├── src/
│   ├── index.ts              # Public API
│   ├── types.ts              # All type definitions
│   ├── core/
│   │   ├── analyzer.ts       # Main entry — parse / parseAll / verify
│   │   ├── function-info.ts  # FunctionInfo class
│   │   ├── param-info.ts     # ParamInfo class
│   │   ├── body-info.ts      # BodyInfo class
│   │   └── verify.ts         # Declarative verification engine
│   ├── parser/
│   │   ├── adapter.ts        # Parser adapter interface
│   │   ├── acorn-adapter.ts  # acorn implementation
│   │   ├── oxc-adapter.ts    # oxc WASM implementation
│   │   └── auto-adapter.ts   # Automatic engine selection
│   ├── ast/
│   │   ├── traverse.ts       # findFirst / findAll / findInScope
│   │   ├── query.ts          # CSS-like AST queries
│   │   └── helpers.ts        # Node type guards & utilities
│   └── utils/
│       ├── ts-type.ts        # TS type node → string
│       └── source.ts         # Source text utilities
└── test/
    ├── fixtures.ts
    ├── basic.test.ts
    ├── params.test.ts
    ├── body.test.ts
    ├── verify.test.ts
    └── source-utils.test.ts
```

## License

MIT
