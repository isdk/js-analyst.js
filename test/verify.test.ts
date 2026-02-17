// ============================================================
//  test/verify.test.ts
// ============================================================

import { describe, it, expect } from 'vitest';
import { createAnalyzer } from '../src/index.js';

const analyzer = createAnalyzer({ engine: 'acorn' });

describe('Verify - basic', () => {
  const src = 'function add(x, y) { return x + y }';

  it('all pass', () => {
    const r = analyzer.verify(src, {
      name: 'add',
      async: false,
      generator: false,
      arrow: false,
      paramCount: 2,
    });
    expect(r.passed).toBe(true);
    expect(r.failures).toHaveLength(0);
  });

  it('wrong name fails', () => {
    const r = analyzer.verify(src, { name: 'subtract' });
    expect(r.passed).toBe(false);
    expect(r.failures[0]?.path).toBe('name');
  });

  it('wrong async fails', () => {
    const r = analyzer.verify(src, { async: true });
    expect(r.passed).toBe(false);
  });

  it('regex matcher', () => {
    expect(analyzer.verify(src, { name: /^add/ }).passed).toBe(true);
    expect(analyzer.verify(src, { name: /^sub/ }).passed).toBe(false);
  });

  it('function matcher', () => {
    const r = analyzer.verify(src, {
      name: (n) => n !== null && n.length <= 5,
      paramCount: (n) => n >= 1 && n <= 3,
    });
    expect(r.passed).toBe(true);
  });

  it('undefined fields are skipped', () => {
    expect(analyzer.verify(src, { name: 'add' }).passed).toBe(true);
  });
});

describe('Verify - params', () => {
  it('param details', () => {
    const r = analyzer.verify('function foo(a, b = 10, ...rest) {}', {
      params: [
        { name: 'a', hasDefault: false, isRest: false },
        { name: 'b', hasDefault: true },
        { name: 'rest', isRest: true },
      ],
    });
    expect(r.passed).toBe(true);
  });

  it('param count mismatch', () => {
    const r = analyzer.verify('function foo(a, b) {}', {
      params: [{ name: 'a' }],
    });
    expect(r.passed).toBe(false);
    expect(r.failures[0]?.path).toBe('params.length');
  });

  it('TS param types', () => {
    const r = analyzer.verify(
      'function add(x: number, y: number): number { return x + y }',
      {
        params: [
          { name: 'x', type: 'number' },
          { name: 'y', type: 'number' },
        ],
        returnType: 'number',
      },
      { ts: true },
    );
    expect(r.passed).toBe(true);
  });

  it('destructured param', () => {
    const r = analyzer.verify('function foo({ name, age }) { return name }', {
      params: [{ isDestructured: true, pattern: 'object' }],
    });
    expect(r.passed).toBe(true);
  });
});

describe('Verify - body', () => {
  it('statement count', () => {
    const r = analyzer.verify('function foo(x) { const y = x * 2; return y }', {
      body: { statementCount: 2 },
    });
    expect(r.passed).toBe(true);
  });

  it('has / notHas', () => {
    const r = analyzer.verify('async function foo() { await bar() }', {
      body: { has: 'AwaitExpression', notHas: 'YieldExpression' },
    });
    expect(r.passed).toBe(true);
  });

  it('has array', () => {
    const r = analyzer.verify(
      'async function foo() { const x = await bar(); return x }',
      { body: { has: ['AwaitExpression', 'ReturnStatement'] } },
    );
    expect(r.passed).toBe(true);
  });

  it('return binary op', () => {
    const r = analyzer.verify('function add(x, y) { return x + y }', {
      body: { returns: (ret) => ret.isBinaryOp('+', 'x', 'y') },
    });
    expect(r.passed).toBe(true);
  });

  it('return wrong op fails', () => {
    const r = analyzer.verify('function add(x, y) { return x + y }', {
      body: { returns: (ret) => ret.isBinaryOp('-', 'x', 'y') },
    });
    expect(r.passed).toBe(false);
  });

  it('return call', () => {
    const r = analyzer.verify('function foo() { return bar() }', {
      body: { returns: (ret) => ret.isCall('bar') },
    });
    expect(r.passed).toBe(true);
  });

  it('return literal', () => {
    const r = analyzer.verify('function foo() { return 42 }', {
      body: { returns: (ret) => ret.isLiteral(42) },
    });
    expect(r.passed).toBe(true);
  });

  it('return identifier', () => {
    const r = analyzer.verify('function foo(x) { return x }', {
      body: { returns: (ret) => ret.isIdentifier('x') },
    });
    expect(r.passed).toBe(true);
  });

  it('return member access', () => {
    const r = analyzer.verify('function foo(obj) { return obj.prop }', {
      body: { returns: (ret) => ret.isMemberAccess('obj', 'prop') },
    });
    expect(r.passed).toBe(true);
  });

  it('return template literal', () => {
    const r = analyzer.verify('function foo(x) { return `hello ${x}` }', {
      body: { returns: (ret) => ret.isTemplateLiteral() },
    });
    expect(r.passed).toBe(true);
  });

  it('body custom', () => {
    const r = analyzer.verify('function foo() { a(); b(); return 1 }', {
      body: { custom: (body) => body.statementCount <= 5 },
    });
    expect(r.passed).toBe(true);
  });
});

describe('Verify - custom', () => {
  it('top-level custom pass', () => {
    const r = analyzer.verify(
      'async function fetch(id) { return await get(id) }',
      {
        custom: (fn) => fn.isAsync && fn.paramCount === 1 && fn.has('AwaitExpression'),
      },
    );
    expect(r.passed).toBe(true);
  });

  it('top-level custom fail', () => {
    const r = analyzer.verify('function foo() {}', { custom: () => false });
    expect(r.passed).toBe(false);
    expect(r.failures[0]?.path).toBe('custom');
  });
});

describe('Verify - complete add scenario', () => {
  it('JS version', () => {
    const r = analyzer.verify('function add(x, y) { return x + y }', {
      name: 'add',
      async: false,
      generator: false,
      arrow: false,
      paramCount: 2,
      params: [
        { name: 'x', hasDefault: false, isRest: false, isDestructured: false },
        { name: 'y', hasDefault: false, isRest: false, isDestructured: false },
      ],
      body: {
        statementCount: 1,
        has: 'ReturnStatement',
        notHas: ['AwaitExpression', 'YieldExpression', 'ThrowStatement'],
        returns: (ret) => ret.isBinaryOp('+', 'x', 'y'),
      },
    });
    expect(r.passed).toBe(true);
    expect(r.summary).toContain('passed');
  });

  it('TS version', () => {
    const r = analyzer.verify(
      'function add(x: number, y: number): number { return x + y }',
      {
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
      },
      { ts: true },
    );
    expect(r.passed).toBe(true);
  });
});

describe('Verify - failure summary', () => {
  it('meaningful failure output', () => {
    const r = analyzer.verify('function foo(a) { return a }', {
      name: 'bar',
      paramCount: 2,
      body: { 
        returns: (ret) => ret.isLiteral(42),
        has: 'AwaitExpression',
        custom: () => false,
      },
      params: [{ name: 'x' }],
      custom: () => { throw new Error('custom error'); }
    });
    expect(r.passed).toBe(false);
    expect(r.failures.length).toBeGreaterThanOrEqual(4);
    expect(r.summary).toContain('failed');

    for (const f of r.failures) {
      expect(f.path).toBeTruthy();
      expect(f.message).toBeTruthy();
    }
  });

  it('fails with regex matcher', () => {
    const r = analyzer.verify('function foo() {}', { name: /bar/ });
    expect(r.passed).toBe(false);
  });

  it('fails with custom predicate throwing error', () => {
    const r = analyzer.verify('function foo() {}', { 
      name: () => { throw new Error('fail'); } 
    });
    expect(r.passed).toBe(false);
  });
});
