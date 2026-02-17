# @isdk/js-analyst

> [English](./README.md) | 中文
> 轻量级 JavaScript / TypeScript 函数分析库，支持 JS/WASM 混合解析引擎。

小文件使用 [acorn](https://github.com/acornjs/acorn)（~13KB）即时解析；大文件自动切换到 [oxc-parser](https://github.com/oxc-project/oxc) WASM（~400KB），解析速度提升 20 倍。统一 API，零适配成本。

## 特性

- 🔍 **深度函数 analysis** — 完整提取名称、参数（解构/默认值）、函数体、返回路径及 TS 类型。
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
import { createAnalyzer } from '@isdk/js-analyst';

const analyzer = createAnalyzer();
const fn = analyzer.parse('export async function* myGen(a: number = 1) {}');

console.log(fn.name);        // 'myGen'
console.log(fn.isAsync);     // true
console.log(fn.isGenerator); // true
console.log(fn.syntax);      // 'declaration'
```

### 2. 全函数语义匹配 (Snippet Schema)

这是最强大的验证方式。你可以用一个**模糊的“代码模板”**去验证一个**具体的实现**，引擎会自动忽略无关的命名差异、空格、括号或声明方式。

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

---

## API 深度参考

### `FunctionInfo` 对象

由 `analyzer.parse()` 返回，提供函数的全方位元数据。

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| null` | 函数名（匿名函数或赋值给变量的匿名函数会自动处理） |
| `kind` | `string` | 逻辑角色：`function`, `method`, `getter`, `setter`, `constructor` |
| `syntax` | `string` | 语法形式：`declaration`, `expression`, `arrow` |
| `isAsync` | `boolean` | 是否带有 `async` 关键字 |
| `isGenerator` | `boolean` | 是否为生成器函数（带有 `*`） |
| `isArrow` | `boolean` | 是否为箭头函数 |
| `isStatic` | `boolean` | 是否为类静态成员 |
| `paramCount` | `number` | 定义的参数数量 |
| `params` | `ParamInfo[]` | 详细的参数元数据列表 |
| `returnType` | `string \| null` | TypeScript 返回类型注解的字符串表示 |
| `body` | `BodyInfo` | 函数体分析工具 |

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

自动分析函数内所有的 `return` 路径（包括提前返回）：

```typescript
analyzer.verify(code, {
  returns: {
    $any: ['args[0]', 'null'], // 必须至少有一个路径返回参数 0 或 null
    $not: 'undefined'          // 任何路径都不能显式返回 undefined
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
