import { describe, it, expect } from 'vitest';
import { createAnalyzer } from '../src/index.js';
import { jsParams, tsBasic } from './fixtures.js';

const analyzer = createAnalyzer({ engine: 'acorn' });

describe('JS params', () => {
  it('no params', () => {
    const fn = analyzer.parse(jsParams.noParams);
    expect(fn.paramCount).toBe(0);
  });

  it('multiple params', () => {
    const fn = analyzer.parse(jsParams.multiple);
    expect(fn.paramCount).toBe(3);
    expect(fn.param(0)?.name).toBe('a');
    expect(fn.param(1)?.name).toBe('b');
    expect(fn.param(2)?.name).toBe('c');
  });

  it('default values', () => {
    const fn = analyzer.parse(jsParams.defaultValue);
    expect(fn.param(0)?.hasDefault).toBe(false);
    expect(fn.param(1)?.hasDefault).toBe(true);
    expect(fn.param(1)?.name).toBe('b');
  });

  it('rest params', () => {
    const fn = analyzer.parse(jsParams.rest);
    expect(fn.param(0)?.isRest).toBe(false);
    expect(fn.param(1)?.isRest).toBe(true);
    expect(fn.param(1)?.name).toBe('rest');
  });

  it('object destructuring', () => {
    const fn = analyzer.parse(jsParams.destructObj);
    expect(fn.param(0)?.isDestructured).toBe(true);
    expect(fn.param(0)?.pattern).toBe('object');
    expect(fn.param(0)?.name).toBeNull();
  });

  it('array destructuring', () => {
    const fn = analyzer.parse(jsParams.destructArr);
    expect(fn.param(0)?.isDestructured).toBe(true);
    expect(fn.param(0)?.pattern).toBe('array');
  });

  it('complex mixed params', () => {
    const fn = analyzer.parse(jsParams.complex);
    expect(fn.paramCount).toBe(3);
    expect(fn.param(0)?.name).toBe('a');
    expect(fn.param(1)?.isDestructured).toBe(true);
    expect(fn.param(1)?.hasDefault).toBe(true);
    expect(fn.param(2)?.isRest).toBe(true);
    expect(fn.param(2)?.name).toBe('args');
  });

  it('out of range returns null', () => {
    const fn = analyzer.parse(jsParams.single);
    expect(fn.param(5)).toBeNull();
    expect(fn.param(-1)).toBeNull();
  });

  it('paramByName', () => {
    const fn = analyzer.parse(jsParams.multiple);
    expect(fn.paramByName('b')?.name).toBe('b');
    expect(fn.paramByName('z')).toBeNull();
  });

  it('param text', () => {
    const fn = analyzer.parse(jsParams.defaultValue);
    const text = fn.param(1)?.text;
    expect(text).toContain('b');
    expect(text).toContain('10');
  });
});

describe('TS params', () => {
  it('typed params', () => {
    const fn = analyzer.parse(tsBasic.typed, { ts: true });
    expect(fn.param(0)?.type).toBe('number');
    expect(fn.param(1)?.type).toBe('number');
  });

  it('union type', () => {
    const fn = analyzer.parse(tsBasic.unionType, { ts: true });
    expect(fn.param(0)?.type).toBe('string | number');
  });

  it('array type', () => {
    const fn = analyzer.parse(tsBasic.arrayType, { ts: true });
    expect(fn.param(0)?.type).toBe('number[]');
  });

  it('return type', () => {
    const fn = analyzer.parse(tsBasic.typed, { ts: true });
    expect(fn.returnType).toBe('number');
  });

  it('void return', () => {
    const fn = analyzer.parse(tsBasic.voidReturn, { ts: true });
    expect(fn.returnType).toBe('void');
  });

  it('interface param type', () => {
    const fn = analyzer.parse(tsBasic.interfaceParam, { ts: true });
    expect(fn.param(0)?.type).toBe('User');
    expect(fn.param(1)?.type).toBe('Options');
  });

  it('destructured with type', () => {
    const fn = analyzer.parse('function foo({ name }: User) {}', { ts: true });
    expect(fn.param(0)?.isDestructured).toBe(true);
    expect(fn.param(0)?.type).toBe('User');
  });

  it('auto-detect TS', () => {
    const fn = analyzer.parse(tsBasic.typed); // 不传 ts: true
    expect(fn.param(0)?.type).toBe('number');
  });
});
