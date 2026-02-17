// ============================================================
//  test/analyzer-extra.test.ts — Analyzer 类进阶测试
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import { createAnalyzer } from '../src/index.js';

describe('Analyzer Extra', () => {
  it('should use explicit acorn engine', () => {
    const analyzer = createAnalyzer({ engine: 'acorn' });
    expect(analyzer.engines.acorn).toBe(true);
    const fn = analyzer.parse('function foo(){}');
    expect(fn.engine).toBe('acorn');
  });

  it('should use explicit oxc engine', async () => {
    const analyzer = createAnalyzer({ engine: 'oxc' });
    await analyzer.warmup();
    expect(analyzer.engines.oxc).toBe(true);
    const fn = analyzer.parse('function foo(){}');
    expect(fn.engine).toBe('oxc');
  });

  it('should support parseAll', () => {
    const analyzer = createAnalyzer();
    const code = `
      function a() {}
      const b = () => {}
      class X {
        m() {}
      }
    `;
    const fns = analyzer.parseAll(code);
    expect(fns.length).toBeGreaterThanOrEqual(3);
    const names = fns.map(f => f.name);
    expect(names).toContain('a');
    expect(names).toContain('b');
    expect(names).toContain('m');
  });

  it('should filter by kind', () => {
    const analyzer = createAnalyzer();
    const code = 'class X { constructor(){} get foo(){} set foo(v){} m(){} }';
    
    const ctors = analyzer.parseAll(code, { kind: 'constructor' });
    expect(ctors).toHaveLength(1);
    expect(ctors[0].kind).toBe('constructor');

    const getters = analyzer.parseAll(code, { kind: 'getter' });
    expect(getters).toHaveLength(1);
    expect(getters[0].kind).toBe('getter');

    const multiKinds = analyzer.parseAll(code, { kind: ['getter', 'setter'] });
    expect(multiKinds).toHaveLength(2);
  });

  it('should filter by syntax', () => {
    const analyzer = createAnalyzer();
    const code = 'function a(){}; const b = function(){}; const c = () => {}';
    
    const decls = analyzer.parseAll(code, { syntax: 'declaration' });
    expect(decls).toHaveLength(1);
    expect(decls[0].name).toBe('a');

    const exprs = analyzer.parseAll(code, { syntax: ['expression', 'arrow'] });
    expect(exprs).toHaveLength(2);
  });

  it('should throw error when no function matches filters', () => {
    const analyzer = createAnalyzer();
    expect(() => analyzer.parse('function a(){}', { kind: 'getter' }))
      .toThrow(/No function matches the specified filters/);
  });

  it('should handle runtime function objects with custom toString', () => {
    const analyzer = createAnalyzer();
    const fn = () => 1;
    // Some environments might have weird toString, though usually it's fine
    const info = analyzer.parse(fn);
    expect(info.isArrow).toBe(true);
  });

  it('warmup should initialize engines', async () => {
    const analyzer = createAnalyzer({ engine: 'auto' });
    await analyzer.warmup();
    expect(analyzer.engines.acorn).toBe(true);
    expect(analyzer.engines.oxc).toBe(true);
  });

  it('should handle TS declare function (empty body)', () => {
    const analyzer = createAnalyzer();
    const code = 'declare function foo(x: number): string;';
    const fn = analyzer.parse(code, { ts: true });
    expect(fn.name).toBe('foo');
    expect(fn.body.isEmpty).toBe(true);
    expect(fn.body.statements).toHaveLength(0);
    expect(fn.body.returns).toHaveLength(0);
    expect(fn.body.text).toBeNull();
  });

  it('should handle Property and MethodDefinition correctly', () => {
    const analyzer = createAnalyzer();
    const code = 'const obj = { get x() { return 1 }, set x(v) {} };';
    const fns = analyzer.parseAll(code);
    const getter = fns.find(f => f.kind === 'getter');
    const setter = fns.find(f => f.kind === 'setter');
    expect(getter?.name).toBe('x');
    expect(setter?.name).toBe('x');
  });

  it('should handle PrivateIdentifier in names', () => {
    const analyzer = createAnalyzer();
    const code = 'class A { #foo() {} }';
    const fn = analyzer.parse(code);
    expect(fn.name).toBe('foo');
  });

  it('should handle array pattern in params', () => {
    const analyzer = createAnalyzer();
    const code = 'function foo([a, b]) {}';
    const fn = analyzer.parse(code);
    expect(fn.param(0)?.isDestructured).toBe(true);
    expect(fn.param(0)?.pattern).toBe('array');
  });

  it('should handle full serialization via toJSON', () => {
    const analyzer = createAnalyzer();
    const code = 'async function* foo(a, {b} = {}) { return a + b }';
    const fn = analyzer.parse(code);
    const json = fn.toJSON();
    expect(json.async).toBe(true);
    expect(json.generator).toBe(true);
    expect(json.params).toHaveLength(2);
    expect(json.params[1].isDestructured).toBe(true);
    expect(json.params[1].hasDefault).toBe(true);
  });

  it('should return null for returnType when missing', () => {
    const analyzer = createAnalyzer();
    const code = 'function foo() {}';
    const fn = analyzer.parse(code);
    expect(fn.returnType).toBeNull();
  });

  it('should correctly report async and generator flags', () => {
    const analyzer = createAnalyzer();
    const fn1 = analyzer.parse('async function a(){}');
    const fn2 = analyzer.parse('function* b(){}');
    expect(fn1.isAsync).toBe(true);
    expect(fn2.isGenerator).toBe(true);
  });

  it('should cover matchFilters failure for array of kinds', () => {
    const analyzer = createAnalyzer();
    const code = 'function a() {}';
    const results = analyzer.parseAll(code, { kind: ['method', 'getter'] });
    expect(results).toHaveLength(0);
  });
});

