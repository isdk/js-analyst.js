# @isdk/js-analyst

> [English](./README.md) | 中文
> 轻量级 JavaScript / TypeScript 函数分析库，支持 JS/WASM 混合解析引擎。

小文件使用 [acorn](https://github.com/acornjs/acorn)（~13KB）即时解析；大文件自动切换到 [oxc-parser](https://github.com/oxc-project/oxc) WASM（~400KB），解析速度提升 20 倍。统一 API，零适配成本。

## 特性

- 🔍 **深度函数分析** — 完整提取名称、参数（解构/默认值）、函数体、返回路径及 TS 类型。
- 🛡️ **结构化验证引擎** —— 原生支持 JSON Schema，包含递归解构、数组项目和逻辑组合器（anyOf、oneOf 等）。
- 🤖 **JS 回退分析** —— 当缺失 TS 注解时，自动分析 `return` 语句并推断表达式类型（如 `a + b`、`!a`、`new Date()`），实现精确的"返回值结构"验证。
- 🛡️ **智能类型匹配** —— 内置类型（如 `Date`, `Array`）支持不区分大小写的逻辑匹配，而自定义类保持严格的大小写敏感，平衡灵活性与严谨性。
- 🛡️ **语义化 Snippet 验证** — 支持直接编写代码片段作为模板进行匹配，自动处理语法等价性。
- 🧩 **TypeScript 完美支持** — 自动检测 TS，支持泛型、联合类型匹配及 `any` 模糊类型通配。
- ⚡ **混合解析引擎** — 智能切换引擎，兼顾启动速度与超大文件处理性能。
- 🎯 **作用域感知** — AST 查询和返回路径分析均具备作用域感知，不会误触嵌套函数。

## 安装

```bash
npm install @isdk/js-analyst
```

---

## 快速开始

### 1. 基础解析

```typescript
import { createAnalyzer, parse, parseAll } from '@isdk/js-analyst';

// 快速解析第一个函数
const fn = parse('const add = (a, b) => a + b');
console.log(fn.name); // 'add'

// 解析文件中的所有函数
const code = `
  function save() {}
  function load() {}
`;
const fns = parseAll(code);
console.log(fns.length); // 2

// 或者使用自定义分析器实例
const analyzer = createAnalyzer({ engine: 'oxc' });
const result = analyzer.parse('export async function* myGen(a: number = 1) {}');
```

### 2. 语义匹配的威力 (Magic Snippets)

这是最强大的验证方式。你可以用一个**模糊的代码模板**去验证一个**具体的实现**，引擎会自动忽略无关的命名差异、空格、括号或声明方式。

```typescript
import { verify } from '@isdk/js-analyst';

// 实际代码：变量名是 a/b，包含 TS 类型，且是箭头函数
const code = 'const add = (a: number, b: number): number => (a + b)';

// 验证模式：
// - 使用 args[0], args[1] 忽略实际变量名
// - 使用 :any 忽略或通配类型限制
// - 即使模式写的是 function 声明，也能匹配 code 里的箭头函数
const pattern = 'function _(args[0]: any, args[1]: any) { return args[0] + args[1] }';

const result = verify(code, pattern);
console.log(result.passed); // ✅ true
```

### 3. JSON Schema 校验

你可以直接使用标准的 JSON Schema 来校验函数的参数结构和返回值。

```typescript
import { verify } from '@isdk/js-analyst';

const code = 'function getWeather({ location, unit = "c" }: { location: string, unit?: string }) {}';

const result = verify(code, {
  params: {
    type: 'object',
    properties: {
      location: { type: 'string', required: true },
      unit: { type: 'string' }
    }
  }
});
```

---

## API 深度参考

### `Analyzer` 配置项

传给 `createAnalyzer(options)` 的参数。

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `engine` | `'auto' \| 'acorn' \| 'oxc'` | `'auto'` | 强制使用特定的解析引擎。 |
| `threshold` | `number` | `50 * 1024` | 自动模式下切换到 WASM (OXC) 的字节大小阈值。 |
| `warmup` | `boolean` | `true` | 是否预热 WASM 引擎以加快首次解析速度。 |

### `FunctionInfo` 对象

由 `analyzer.parse()` 返回，提供函数的全方位元数据。

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| null` | 函数名（自动处理变量赋值、类方法等） |
| `kind` | `string` | 逻辑角色：`function`, `method`, `getter`, `setter`, `constructor` |
| `syntax` | `string` | 语法形式：`declaration`, `expression`, `arrow` |
| `isAsync` | `boolean` | 是否为 `async` |
| `isGenerator` | `boolean` | 是否为生成器函数 `*` |
| `isStatic` | `boolean` | 是否为类静态成员 |
| `paramCount` | `number` | 参数数量 |
| `params` | `ParamInfo[]` | 详细的参数元数据列表 |
| `returnType` | `string \| null` | TypeScript 返回类型注解的字符串表示 |
| `returnTypeNode` | `ASTNode \| null` | 返回类型注解的 AST 节点（用于结构化校验） |
| `body` | `BodyInfo` | 函数体分析工具 |
| `engine` | `string` | 解析该函数所使用的引擎 (`acorn` \| `oxc`) |

**方法:**

- `param(index: number)`: 按索引获取 `ParamInfo`。
- `paramByName(name: string)`: 按名称获取 `ParamInfo`。
- `query(selector: string)`: 在函数作用域内使用 Esquery 查找 AST 节点。
- `has(selector: string)`: 检查作用域内是否存在匹配的选择器。
- `toJSON()`: 导出为纯对象。

### `ParamInfo` 对象

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| null` | 参数名（如果是解构则为 null） |
| `type` | `string \| null` | TS 类型注解 |
| `hasDefault` | `boolean` | 是否有默认值 |
| `isRest` | `boolean` | 是否为剩余参数 (`...args`) |
| `isDestructured` | `boolean` | 是否使用了对象/数组解构 |
| `pattern` | `'object' \| 'array' \| null` | 解构的类型 |
| `properties` | `Record<string, ParamInfo>` | 对象解构中的内部属性元数据（递归） |
| `items` | `ParamInfo[]` | 数组解构中的元素元数据（递归） |
| `text` | `string` | 参数的原始源码文本 |

### `BodyInfo` 对象

| 属性 | 类型 | 说明 |
|------|------|------|
| `statements` | `ASTNode[]` | 函数体内的顶级语句列表 |
| `returns` | `ASTNode[]` | 所有的返回路径节点（作用域感知） |
| `isBlock` | `boolean` | 是否使用 `{}` 花括号包裹 |
| `isExpression` | `boolean` | 是否为单表达式体（常见于箭头函数） |
| `text` | `string` | 函数体内容的原始源码 |

**方法:**

- `query(selector)` / `has(selector)`: 作用域受限的 AST 查询。

---

## 进阶验证语法

### 1. Snippet 占位符详解

在字符串模式中，你可以使用这些占位符来构建通用的验证模板：

| 占位符 | 说明 | 示例 |
|--------|------|------|
| **`args[i]`** | 引用函数的第 i 个参数（支持解构） | `return args[0] + args[1]` |
| **`_`** | 匹配任意**单个** AST 节点 | `console.log(_)` 匹配任何 log 调用 |
| **`...`** | 匹配**零个或多个** AST 节点 | `try { ... } catch(_) { ... }` |
| **类型 `: any`** | 匹配任何 TypeScript 类型 | `(a: any)` 匹配 `(a: string)` 等 |

### 2. 逻辑组合操作符

你可以对任何字段使用逻辑组合：

```typescript
analyzer.verify(code, {
  name: { $or: ['init', 'setup', /^start/] }, // 名字匹配其中之一
  body: {
    $match: [
      'const user = await auth(_)', // 第一步：调用 auth
      '...',                        // 中间可以有任意代码
      'return user.data'            // 最后：返回 user.data
    ],
    $none: ['debugger']             // 且禁止包含调试语句
  }
});
```

### 3. 返回路径集合验证 (`returns`)

自动分析函数内所有的 `return` 路径（包括提前返回）。除了使用匹配器，你还可以使用**自定义回调函数**：

```typescript
analyzer.verify(code, {
  returns: (helper) => {
    // helper 提供了一系列便捷的判定方法
    return helper.isCall('fetch') || helper.isBinaryOp('+', '_', '_');
  }
});
```

### 4. 自定义逻辑钩子 (`custom`)

利用 API 的完整能力进行深度校验：

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

### 5. 严格模式 (`strict`)

默认情况下，引擎会忽略非语义差异。使用 `strict: true` 进行精确的结构匹配：

```typescript
analyzer.verify(code, {
  strict: true,
  body: 'return a+b' // 在严格模式下，将不会匹配 'return (a+b)'
});
```

### 6. JSON Schema 深度支持

校验引擎支持递归的结构化匹配，并兼容 JSON Schema 核心关键字：

- **逻辑组合**: 支持 `anyOf`, `oneOf`, `allOf`, `not`。
- **递归校验**: 自动校验对象解构中的 `properties` 和数组解构中的 `items`。
- **JS 自动回退**: 当缺少 TS 类型注解时，会自动分析函数体中 `return` 语句返回的字面量结构。

**简写语法示例:**

```typescript
verify(code, {
  params: [
    {
      name: 'options',
      properties: {
        id: { type: 'number', required: true }, // 支持在属性内直接写 required: true
        mode: { enum: ['fast', 'slow'] }        // 自动映射为 $or 逻辑匹配
      }
    },
    { type: '...string[]' }                     // 使用 '...' 简写表示剩余参数
  ],
  returnType: {
    oneOf: [
      { type: 'string' },
      { properties: { success: { type: 'boolean' } } }
    ]
  }
});
```

---

## 语义等价性

验证引擎在匹配时会自动忽略以下非语义差异（除非开启 `strict: true`）：

- **包装解包**：`return (a + b)` ≡ `return a + b`；`ExpressionStatement` ≡ `Expression`。
- **控制流等价**：隐式返回 `() => x` ≡ 显式返回 `{ return x }`。
- **声明类型**：`const x = 1` ≡ `let x = 1` ≡ `var x = 1`。
- **属性简写**：`{ x }` ≡ `{ x: x }`。
- **字面量归一化**：`255` ≡ `0xff` ≡ `0b11111111`。
- **TS 类型模糊匹配**：`Promise<any>` 能够匹配 `Promise<string>` 或 `Promise<User>`。

---

## 工具函数 (Utilities)

库中导出了一些底层的工具函数，方便你手动处理 AST 或源码：

| 函数 | 说明 |
|----------|-------------|
| `stripComments(code)` | 移除所有 JS/TS 注释。 |
| `detectTypeScript(code)` | 根据语法推断代码是否为 TypeScript。 |
| `offsetToLineColumn(code, offset)` | 将字符偏移量转换为 `{ line, column }`。 |
| `findInScope(node, test)` | 在尊重函数作用域边界的情况下查找节点。 |
| `tsTypeToString(typeNode)` | 将 TS 类型节点标准化为字符串表示。 |

---

## 场景示例

### 场景：强制执行代码规范

检查所有的 API Handler 是否都进行了鉴权并处理了错误：

```typescript
import { createAnalyzer } from '@isdk/js-analyst';
const analyzer = createAnalyzer();

const result = analyzer.verify(source, {
  async: true,
  body: {
    $match: [
      'const ctx = await authenticate(_)', // 1. 必须先鉴权
      '...',
      'return _'                           // 2. 最终必须有返回
    ],
    $has: ['try { ... } catch (_) { ... }'] // 3. 必须有错误捕获
  }
});
```

## 许可

MIT
