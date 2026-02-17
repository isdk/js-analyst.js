# fn-analyst

> [English](./README.md) | 中文
> 轻量级 JavaScript / TypeScript 函数分析库，支持 JS/WASM 混合解析引擎。

小文件使用 [acorn](https://github.com/acornjs/acorn)（~13KB）即时解析；大文件自动切换到 [oxc-parser](https://github.com/oxc-project/oxc) WASM（~400KB），解析速度提升 20 倍。统一 API，零适配成本。

```
                你的代码
                    │
              ┌─────┴──────┐
              │  Analyzer  │
              └─────┬──────┘
                    │
             ESTree AST（统一格式）
                    │
        ┌───────────┴───────────┐
        │                       │
     < 阈值                   ≥ 阈值
        │                       │
  ┌─────┴──────┐        ┌───────┴────────┐
  │ acorn (JS) │        │ oxc-parser     │
  │ ~13KB      │        │ WASM ~400KB    │
  │ 同步、即时   │        │ 懒加载          │
  └────────────┘        └────────────────┘
```

## 特性

- 🔍 **完整函数分析** — 名称、参数、函数体、返回类型、async/generator/箭头函数检测
- 🛡️ **声明式验证** — 用简洁的 schema 校验函数签名
- 🧩 **TypeScript 支持** — 完整的 TS 类型注解解析，自动检测
- ⚡ **混合解析引擎** — 小文件用 acorn，大文件用 oxc WASM，自动切换
- 🎯 **作用域 AST 查询** — 在函数体内查询，不会泄漏到嵌套函数
- 📦 **轻量** — 仅需 acorn（~13KB）；WASM 可选，按需懒加载
- 🌳 **可 Tree-shake** — ESM + CJS 双格式输出

## 安装

```bash
npm install fn-analyst
```

WASM 引擎（可选，用于大文件加速）：

```bash
npm install @oxc-parser/wasm
```

## 快速开始

### 解析函数

```typescript
import { createAnalyzer } from 'fn-analyst';

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

### 高级过滤

在大型源文件中查找特定类型的函数：

```typescript
// 查找所有 getter
const getters = analyzer.parseAll(source, { kind: 'getter' });

// 查找所有箭头函数
const arrows = analyzer.parseAll(source, { syntax: 'arrow' });

// 查找所有静态方法
const statics = analyzer.parseAll(source).filter(f => f.isStatic);
```

### 解析 TypeScript

```typescript
const fn = analyzer.parse(
  'function add(x: number, y: number): number { return x + y }'
);

fn.param(0).type  // 'number'
fn.param(1).type  // 'number'
fn.returnType     // 'number'
```

TypeScript 会自动检测，也可以手动指定：

```typescript
analyzer.parse(source, { ts: true });
```

### 验证函数

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

### 简写 API

```typescript
import { parse, verify } from 'fn-analyst';

// 快速解析（使用默认单例分析器）
const fn = parse('(a, b) => a + b');

// 快速验证
const result = verify(
  'function add(a, b) { return a + b }',
  { name: 'add', paramCount: 2 }
);
```

---

## API 参考

### `createAnalyzer(options?)`

创建分析器实例。

```typescript
const analyzer = createAnalyzer({
  threshold: 50 * 1024,  // 字节 — 超过此值切换到 WASM（默认 50KB）
  warmup: true,          // 自动在空闲时预加载 WASM（默认 true）
  engine: 'auto',        // 'auto' | 'acorn' | 'oxc'（默认 'auto'）
});
```

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `threshold` | `number` | `51200` | 源码长度（字节）超过此值时使用 WASM |
| `warmup` | `boolean` | `true` | 空闲时预加载 WASM 模块 |
| `engine` | `string` | `'auto'` | `'auto'` 按体积自动切换；`'acorn'` 或 `'oxc'` 强制使用指定引擎 |

---

### `analyzer.parse(input, options?)`

解析单个函数字符串或运行时函数引用，返回 `FunctionInfo`。

```typescript
// 从字符串解析
const fn = analyzer.parse('function add(a, b) { return a + b }');

// 从运行时函数解析
function myFunc(a: number) { return a * 2; }
const fn = analyzer.parse(myFunc);
```

**解析选项：**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ts` | `boolean` | 自动检测 | 强制按 TypeScript 解析 |
| `engine` | `'acorn' \| 'oxc'` | 自动 | 强制本次调用使用指定引擎 |
| `sourceType` | `'script' \| 'module'` | `'script'` | ECMAScript 源码类型 |
| `kind` | `FunctionKind \| FunctionKind[]` | - | 按种类过滤 (`function`, `method`, `getter`, `setter`, `constructor`) |
| `syntax` | `FunctionSyntax \| FunctionSyntax[]` | - | 按语法过滤 (`declaration`, `expression`, `arrow`) |

---

### `analyzer.parseAll(source, options?)`

解析源码中的所有函数，返回 `FunctionInfo[]`。

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

解析并一次性验证。

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

由 `analyzer.parse()` 返回。所有属性都是惰性计算并缓存的。

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| null` | 函数名（匿名函数为 `null`） |
| `kind` | `'function' \| 'method' \| 'getter' \| 'setter' \| 'constructor'` | 逻辑角色 |
| `syntax` | `'declaration' \| 'expression' \| 'arrow'` | 语法形式 |
| `isStatic` | `boolean` | 是否为静态类成员 |
| `isAsync` | `boolean` | 是否 `async` |
| `isGenerator` | `boolean` | 是否生成器函数（`function*`） |
| `isArrow` | `boolean` | 是否箭头函数 |
| `isDeclaration` | `boolean` | 是否函数声明 |
| `isExpression` | `boolean` | 是否函数表达式 |
| `params` | `ParamInfo[]` | 参数列表 |
| `paramCount` | `number` | 参数数量 |
| `returnType` | `string \| null` | TS 返回类型注解 |
| `body` | `BodyInfo` | 函数体信息 |
| `node` | `ASTNode` | 原始 ESTree AST 节点 |
| `engine` | `string` | 使用的解析引擎（`'acorn'` 或 `'oxc'`） |

#### 方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `param(index)` | `ParamInfo \| null` | 按索引获取参数 |
| `paramByName(name)` | `ParamInfo \| null` | 按名称查找参数 |
| `query(selector)` | `ASTNode[]` | 在函数体内查询 AST 节点 |
| `has(selector)` | `boolean` | 函数体内是否包含指定节点类型 |
| `verify(schema)` | `VerifyResult` | 声明式验证 |
| `toJSON()` | `FunctionInfoJSON` | 序列化为普通对象 |

---

### `ParamInfo`

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| null` | 参数名（解构参数为 `null`） |
| `type` | `string \| null` | TS 类型注解字符串 |
| `hasDefault` | `boolean` | 是否有默认值 |
| `isRest` | `boolean` | 是否是剩余参数（`...args`） |
| `isDestructured` | `boolean` | 是否是解构参数 |
| `pattern` | `'object' \| 'array' \| null` | 解构模式 |
| `defaultNode` | `ASTNode \| null` | 默认值 AST 节点 |
| `text` | `string \| null` | 参数的原始源码文本 |

---

### `BodyInfo`

| 属性 / 方法 | 类型 | 说明 |
|-------------|------|------|
| `isBlock` | `boolean` | 块体 `{ ... }` |
| `isExpression` | `boolean` | 表达式体（箭头函数） |
| `statements` | `ASTNode[]` | 语句列表（表达式体会包装为虚拟 `return`） |
| `statementCount` | `number` | 语句数量 |
| `text` | `string \| null` | 函数体的源码文本 |
| `returns` | `ASTNode[]` | 当前作用域内的所有 `return` 语句 |
| `query(selector)` | `ASTNode[]` | 作用域内 AST 查询 |
| `has(selector)` | `boolean` | 作用域内存在性检查 |

---

### 验证 Schema

Schema 是一个声明式对象，描述你期望的函数结构：

```typescript
interface VerifySchema {
  name?: Matcher<string | null>;      // 精确值、正则或函数
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

#### 匹配器

每个字段都支持三种匹配模式：

```typescript
// 精确匹配
{ name: 'add' }

// 正则匹配
{ name: /^get/ }

// 函数断言
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
  has?: string | string[];              // 必须包含这些节点类型
  notHas?: string | string[];           // 必须不包含这些节点类型
  returns?: (helper, node, index) => boolean;   // 验证每个 return
  custom?: (body: BodyInfo) => boolean;         // 自定义检查
}
```

#### ReturnHelper

`returns` 回调接收一个 `ReturnHelper`，让断言写起来更简洁：

```typescript
ret.isBinaryOp('+', 'x', 'y')     // return x + y
ret.isCall('fetch')                // return fetch(...)
ret.isCall()                       // return 任意函数调用(...)
ret.isLiteral(42)                  // return 42
ret.isLiteral()                    // return <任意字面量>
ret.isIdentifier('x')             // return x
ret.isMemberAccess('res', 'json') // return res.json
ret.isTemplateLiteral()           // return `...`
```

#### VerifyResult

```typescript
interface VerifyResult {
  passed: boolean;             // 是否全部通过
  failures: VerifyFailure[];   // 失败项列表
  summary: string;             // 人类可读的摘要
}

interface VerifyFailure {
  path: string;       // 如 'name'、'params[0].type'、'body.returns[0]'
  expected?: unknown;
  actual?: unknown;
  message: string;
}
```

---

### AST 查询选择器

类似 CSS 的简单选择器语法：

```typescript
fn.query('ReturnStatement')                    // 所有 return 语句
fn.query('Identifier[name="x"]')              // 所有名为 'x' 的标识符
fn.query('BinaryExpression[operator="+"]')     // 所有 + 运算
fn.query('CallExpression')                     // 所有函数调用

fn.has('AwaitExpression')                      // 函数体是否包含 await？
fn.has('YieldExpression')                      // 函数体是否包含 yield？
fn.has('ThrowStatement')                       // 函数体是否有 throw？
```

所有查询都**限定在当前函数作用域**内——不会深入嵌套函数定义。

---

## 使用示例

### 验证 API 处理函数

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

### 验证纯函数

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

### 验证解构参数

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

### 批量分析

```typescript
const source = fs.readFileSync('src/handlers.ts', 'utf-8');
const fns = analyzer.parseAll(source, { ts: true });

// 列出所有 async 函数
const asyncFns = fns.filter(fn => fn.isAsync);
console.log(`找到 ${asyncFns.length} 个 async 函数`);

// 找出参数超过 5 个的函数
const tooManyParams = fns.filter(fn => fn.paramCount > 5);
for (const fn of tooManyParams) {
  console.warn(`${fn.name}：${fn.paramCount} 个参数——建议重构`);
}

// 检查所有函数是否有 return 语句
for (const fn of fns) {
  if (fn.body.returns.length === 0 && !fn.isGenerator) {
    console.warn(`${fn.name ?? '（匿名）'}：没有 return 语句`);
  }
}
```

### 灵活匹配器

```typescript
analyzer.verify(source, {
  // 正则：名称必须以 get 或 fetch 开头
  name: /^(get|fetch)/,

  // 函数：1–4 个参数
  paramCount: (n) => n >= 1 && n <= 4,

  // 函数：返回类型必须是 Promise
  returnType: (t) => t !== null && t.startsWith('Promise'),

  body: {
    // 不超过 10 条语句，且不能有 throw
    custom: (body) => body.statementCount <= 10 && !body.has('ThrowStatement'),
  },
});
```

### 访问原始 AST

```typescript
const fn = analyzer.parse('function foo(x) { return x * 2 + 1 }');

// 获取原始 ESTree AST 节点
console.log(fn.node.type); // 'FunctionDeclaration'

// 高级 AST 查询
const multiplications = fn.query('BinaryExpression[operator="*"]');
console.log(multiplications.length); // 1

// 直接检查 AST 节点
const ret = fn.body.returns[0];
console.log(ret); // { type: 'ReturnStatement', argument: { type: 'BinaryExpression', ... } }
```

### 强制指定引擎

```typescript
// 始终使用 acorn（无 WASM 依赖）
const analyzer = createAnalyzer({ engine: 'acorn' });

// 始终使用 oxc WASM（需要先预热）
const analyzer = createAnalyzer({ engine: 'oxc' });
await analyzer.warmup();

// 单次调用覆盖
analyzer.parse(source, { engine: 'oxc' });
```

---

## 混合引擎工作原理

```
输入源码字符串
      │
      ▼
源码长度 >= 阈值?  ──── 否 ──→  acorn（JS，同步，即时）
      │                                │
     是                                │
      │                                │
WASM 就绪?  ──── 否 ──→  acorn（降级兜底） │
      │                                │
     是                                │
      │                                │
 oxc-parser（WASM，快 20 倍）            │
      │                                │
      └──────────────┬─────────────────┘
                     │
              ESTree AST（格式完全一致）
                     │
              FunctionInfo / verify / query
```

- **WASM 是可选的**：如果没有安装 `@oxc-parser/wasm`，acorn 处理一切。
- **WASM 是懒加载的**：在浏览器空闲时或 Node.js 中延迟 2 秒后自动下载编译。
- **优雅降级**：如果 WASM 加载失败，acorn 静默接管。
- **两个引擎输出 ESTree**：你的分析代码永远不需要关心底层用了哪个引擎。

---

## 支持的函数形式

| 形式 | 示例 | 支持 |
|------|------|------|
| 具名声明 | `function add(a, b) {}` | ✅ |
| 匿名表达式 | `function(a, b) {}` | ✅ |
| 箭头函数（块体） | `(a, b) => { return a + b }` | ✅ |
| 箭头函数（表达式体） | `(a, b) => a + b` | ✅ |
| 箭头函数（单参数） | `x => x * 2` | ✅ |
| 箭头函数（无参数） | `() => 42` | ✅ |
| async 函数 | `async function f() {}` | ✅ |
| async 箭头 | `async (x) => await x` | ✅ |
| 生成器函数 | `function* g() { yield 1 }` | ✅ |
| async 生成器 | `async function* ag() {}` | ✅ |
| 方法简写 | `method(a) {}` | ✅ |
| getter / setter | `get x() {}` / `set x(v) {}` | ✅ |
| 运行时函数 | `parse(myFunction)` | ✅ |
| 默认参数 | `function f(a = 1) {}` | ✅ |
| 剩余参数 | `function f(...args) {}` | ✅ |
| 解构参数 | `function f({ a, b }) {}` | ✅ |
| TS 类型参数 | `function f(x: number) {}` | ✅ |
| TS 返回类型 | `function f(): string {}` | ✅ |
| TS 联合类型 | `function f(x: string \| number) {}` | ✅ |
| TS 泛型 | `function f<T>(x: T): T {}` | ✅ |

---

## 项目结构

```
fn-analyst/
├── src/
│   ├── index.ts              # 公开 API
│   ├── types.ts              # 所有类型定义
│   ├── core/
│   │   ├── analyzer.ts       # 主入口
│   │   ├── function-info.ts  # FunctionInfo 类
│   │   ├── param-info.ts     # ParamInfo 类
│   │   ├── body-info.ts      # BodyInfo 类
│   │   └── verify.ts         # 声明式验证引擎
│   ├── parser/
│   │   ├── adapter.ts        # 解析器适配器接口
│   │   ├── acorn-adapter.ts  # acorn 实现
│   │   ├── oxc-adapter.ts    # oxc WASM 实现
│   │   └── auto-adapter.ts   # 自动引擎选择
│   ├── ast/
│   │   ├── traverse.ts       # findFirst / findAll / findInScope
│   │   ├── query.ts          # 类 CSS 的 AST 查询
│   │   └── helpers.ts        # 节点类型守卫
│   └── utils/
│       ├── ts-type.ts        # TS 类型 → 字符串
│       └── source.ts         # 源码工具
└── test/
    ├── fixtures.ts
    ├── basic.test.ts
    ├── params.test.ts
    ├── body.test.ts
    ├── verify.test.ts
    └── source-utils.test.ts
```

## 许可

MIT
