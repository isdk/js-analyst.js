import { describe, it, expect } from 'vitest';
import { createAnalyzer } from '../src/index.js';
import { jsBody } from './fixtures.js';

const analyzer = createAnalyzer({ engine: 'acorn' });

describe('Body analysis', () => {
  it('empty body', () => {
    const fn = analyzer.parse(jsBody.empty);
    expect(fn.body.isBlock).toBe(true);
    expect(fn.body.statementCount).toBe(0);
    expect(fn.body.returns).toHaveLength(0);
    expect(fn.body.isEmpty).toBe(false); // {} is not empty body (EmptyBody type)
  });

  it('real empty body (TS declaration)', () => {
    const fn = analyzer.parse('declare function foo();', { ts: true });
    expect(fn.body.isEmpty).toBe(true);
    expect(fn.body.returns).toHaveLength(0);
    expect(fn.body.text).toBeNull();
    expect(fn.body.statements).toHaveLength(0);
  });

  it('single return', () => {
    const fn = analyzer.parse(jsBody.singleReturn);
    expect(fn.body.statementCount).toBe(1);
    expect(fn.body.returns).toHaveLength(1);
  });

  it('multi statement', () => {
    const fn = analyzer.parse(jsBody.multiStatement);
    expect(fn.body.statementCount).toBe(2);
    expect(fn.body.returns).toHaveLength(1);
  });

  it('conditional multiple returns', () => {
    const fn = analyzer.parse(jsBody.conditional);
    expect(fn.body.returns).toHaveLength(2);
  });

  it('loop detection', () => {
    const fn = analyzer.parse(jsBody.loop);
    expect(fn.has('ForStatement')).toBe(true);
  });

  it('try-catch', () => {
    const fn = analyzer.parse(jsBody.tryCatch);
    expect(fn.has('TryStatement')).toBe(true);
    expect(fn.body.returns).toHaveLength(2);
  });

  it('nested function returns excluded', () => {
    const fn = analyzer.parse(jsBody.nestedFunc);
    // foo 的 return 只有 `return bar(x)`
    expect(fn.body.returns).toHaveLength(1);
  });

  it('await detection', () => {
    const fn = analyzer.parse(jsBody.withAwait);
    expect(fn.has('AwaitExpression')).toBe(true);
  });

  it('yield detection', () => {
    const fn = analyzer.parse(jsBody.withYield);
    expect(fn.has('YieldExpression')).toBe(true);
  });

  it('throw detection', () => {
    const fn = analyzer.parse(jsBody.throwError);
    expect(fn.has('ThrowStatement')).toBe(true);
    expect(fn.body.returns).toHaveLength(0);
  });

  it('arrow expression body', () => {
    const fn = analyzer.parse(jsBody.objectReturn);
    expect(fn.body.isExpression).toBe(true);
    expect(fn.body.statementCount).toBe(1);
  });

  it('ternary expression body', () => {
    const fn = analyzer.parse(jsBody.ternary);
    const ret = fn.body.returns[0]!;
    expect((ret as any).argument.type).toBe('ConditionalExpression');
  });

  it('body text', () => {
    const fn = analyzer.parse(jsBody.singleReturn);
    expect(fn.body.text).toBe('return x');
  });

  it('template literal detection', () => {
    const fn = analyzer.parse(jsBody.template);
    expect(fn.has('TemplateLiteral')).toBe(true);
  });

  it('string with braces', () => {
    const fn = analyzer.parse(jsBody.stringWithBrace);
    expect(fn.body.returns).toHaveLength(1);
  });
});

describe('Body query', () => {
  it('query by type', () => {
    const fn = analyzer.parse(jsBody.multiStatement);
    expect(fn.query('VariableDeclaration')).toHaveLength(1);
  });

  it('query by type + attr', () => {
    const fn = analyzer.parse('function foo(x) { return x + 1 }');
    const bins = fn.query('BinaryExpression[operator="+"]');
    expect(bins).toHaveLength(1);
  });

  it('query identifiers by name', () => {
    const fn = analyzer.parse('function foo(x) { return x + x }');
    const xs = fn.query('Identifier[name="x"]');
    expect(xs.length).toBeGreaterThanOrEqual(2);
  });

  it('scoped query excludes nested function', () => {
    const fn = analyzer.parse(jsBody.nestedFunc);
    expect(fn.query('ReturnStatement')).toHaveLength(1);
  });
});
