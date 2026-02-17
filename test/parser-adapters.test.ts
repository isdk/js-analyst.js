// ============================================================
//  test/parser-adapters.test.ts — 解析器适配器测试
// ============================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { AutoAdapter } from '../src/parser/auto-adapter.js';
import { AcornAdapter } from '../src/parser/acorn-adapter.js';
import { OxcAdapter } from '../src/parser/oxc-adapter.js';

describe('AcornAdapter', () => {
  const adapter = new AcornAdapter();

  it('should have name "acorn"', () => {
    expect(adapter.name).toBe('acorn');
  });

  it('should parse simple code', () => {
    const ast = adapter.parse('const x = 1;');
    expect(ast.type).toBe('Program');
  });

  it('should throw on syntax error', () => {
    expect(() => adapter.parse('const x = ;')).toThrow(SyntaxError);
  });
});

describe('OxcAdapter', () => {
  const adapter = new OxcAdapter();

  beforeAll(async () => {
    await adapter.init();
  });

  it('should have name "oxc"', () => {
    expect(adapter.name).toBe('oxc');
  });

  it('should parse simple code', () => {
    const ast = adapter.parse('const x = 1;');
    expect(ast.type).toBe('Program');
  });

  it('should parse TS code', () => {
    const ast = adapter.parse('const x: number = 1;', { ts: true });
    expect(ast.type).toBe('Program');
  });

  it('should throw on syntax error', () => {
    expect(() => adapter.parse('const x = ;')).toThrow(SyntaxError);
  });

  it('should throw if not initialized', () => {
    const fresh = new OxcAdapter();
    expect(() => fresh.parse('1')).toThrow(/not initialized/);
  });
});

describe('AutoAdapter', () => {
  it('should select acorn by default for small source', () => {
    const auto = new AutoAdapter({ threshold: 100 });
    const adapter = auto.select('short code');
    expect(adapter.name).toBe('acorn');
  });

  it('should respect engine option', () => {
    const auto = new AutoAdapter();
    expect(auto.select('source', { engine: 'acorn' }).name).toBe('acorn');
    expect(auto.select('source', { engine: 'oxc' }).name).toBe('oxc');
  });

  it('should select oxc for large source if ready', async () => {
    const auto = new AutoAdapter({ threshold: 10 });
    await auto.oxc.init();
    const adapter = auto.select('a very long source code');
    expect(adapter.name).toBe('oxc');
  });

  it('should try multiple strategies in parseFunctionSource', () => {
    const auto = new AutoAdapter();

    // 1. Direct parse
    const res1 = auto.parseFunctionSource('function f(){}');
    expect(res1.offset).toBe(0);

    // 2. Method shorthand
    const res2 = auto.parseFunctionSource('foo() {}');
    expect(res2.offset).toBe(2);

    // 3. Class method
    const res3 = auto.parseFunctionSource('static foo() {}');
    expect(res3.offset).toBe(7);
  });

  it('should throw Error with all attempts if all strategies fail', () => {
    const auto = new AutoAdapter();
    expect(() => auto.parseFunctionSource('!!! invalid !!!')).toThrow(/Failed to parse function source/);
  });

  it('warmup should not crash', () => {
    const auto = new AutoAdapter();
    auto.warmup(); 
    // Just ensure it doesn't throw. 
    // It uses requestIdleCallback or setTimeout internally.
  });
});
