// ============================================================
//  test/fixtures.ts — 测试用例函数字符串
// ============================================================

// ---- JS 函数 ----

export const jsBasic = {
  named:         'function add(x, y) { return x + y }',
  anonymous:     'function(x, y) { return x + y }',
  arrow:         '(x, y) => x + y',
  arrowBlock:    '(x, y) => { return x + y }',
  arrowSingle:   'x => x * 2',
  arrowNoParam:  '() => 42',
  asyncFunc:     'async function fetchData(url) { return await fetch(url) }',
  asyncArrow:    'async (url) => await fetch(url)',
  generator:     'function* gen(n) { yield n; yield n + 1 }',
  asyncGenerator:'async function* agen(url) { yield await fetch(url) }',
  iife:          '(function(x) { return x + 1 })',
  namedExpr:     '(function myFunc(a) { return a })',
} as const;

export const jsParams = {
  noParams:        'function foo() { return 1 }',
  single:          'function foo(a) { return a }',
  multiple:        'function foo(a, b, c) { return a + b + c }',
  defaultValue:    'function foo(a, b = 10) { return a + b }',
  defaultExpr:     'function foo(a = 1 + 2, b = Math.max(1, 2)) { return a + b }',
  defaultObj:      'function foo(opts = { x: 1, y: 2 }) { return opts }',
  defaultArr:      'function foo(items = [1, 2, 3]) { return items }',
  defaultStr:      'function foo(name = "world") { return name }',
  rest:            'function foo(first, ...rest) { return rest }',
  destructObj:     'function foo({ name, age }) { return name }',
  destructArr:     'function foo([first, second]) { return first }',
  destructDefault: 'function foo({ name = "anon", age = 0 } = {}) { return name }',
  destructNested:  'function foo({ a: { b: [c, d] } }) { return c }',
  complex:         'function foo(a, { b = 1, ...rest } = {}, ...args) { return a }',
} as const;

export const jsBody = {
  empty:           'function foo() {}',
  singleReturn:    'function foo(x) { return x }',
  multiStatement:  'function foo(x) { const y = x * 2; return y + 1 }',
  conditional:     'function foo(x) { if (x > 0) { return x } else { return -x } }',
  loop:            'function foo(n) { let sum = 0; for (let i = 0; i < n; i++) { sum += i } return sum }',
  tryCatch:        'function foo() { try { return doSomething() } catch (e) { return null } }',
  nestedFunc:      'function foo(x) { function bar(y) { return y * 2 } return bar(x) }',
  withAwait:       'async function foo() { const data = await fetch("/api"); return data.json() }',
  withYield:       'function* foo() { yield 1; yield 2; yield 3 }',
  throwError:      'function foo() { throw new Error("fail") }',
  objectReturn:    '(x) => ({ key: x })',
  ternary:         '(x) => x > 0 ? x : -x',
  comma:           '(x) => (console.log(x), x)',
  stringWithBrace: 'function foo() { return "hello}world" }',
  template:        'function foo(name) { return `Hello ${name}!` }',
} as const;

// ---- TypeScript 函数 ----

export const tsBasic = {
  typed:           'function add(x: number, y: number): number { return x + y }',
  anyType:         'function foo(x: any): any { return x }',
  voidReturn:      'function log(msg: string): void { console.log(msg) }',
  unionType:       'function foo(x: string | number): string { return String(x) }',
  genericSimple:   'function identity<T>(x: T): T { return x }',
  optionalParam:   'function foo(x: number, y?: number): number { return x + (y ?? 0) }',
  arrayType:       'function sum(nums: number[]): number { return nums.reduce((a, b) => a + b, 0) }',
  promiseReturn:   'async function fetchUser(id: string): Promise<User> { return await getUser(id) }',
  destructTyped:   'function foo({ name, age }: { name: string; age: number }): string { return name }',
  interfaceParam:  'function process(user: User, options: Options): Result { return handle(user, options) }',
} as const;

// ---- 边界情况 ----

export const edge = {
  minified:  'function a(b,c){return b+c}',
  multiline: `function foo(
    a,
    b,
    c
  ) {
    return a + b + c
  }`,
  withComments: `function foo(
    /* first */ a,
    // second
    b
  ) {
    // body
    return a + b
  }`,
  unicode: 'function π(Δ) { return Δ * 3.14 }',
} as const;
