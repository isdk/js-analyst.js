// ============================================================
//  test/basic.test.ts
// ============================================================

import { describe, it, expect } from 'vitest';
import { createAnalyzer } from '../src/index.js';
import { jsBasic, edge } from './fixtures.js';

const analyzer = createAnalyzer({ engine: 'acorn' });

describe('Basic function parsing', () => {
  it('should parse named function', () => {
    const fn = analyzer.parse(jsBasic.named);
    expect(fn.name).toBe('add');
    expect(fn.isAsync).toBe(false);
    expect(fn.isGenerator).toBe(false);
    expect(fn.isArrow).toBe(false);
    expect(fn.isDeclaration).toBe(true);
    expect(fn.paramCount).toBe(2);
  });

  it('should parse anonymous function', () => {
    const fn = analyzer.parse(jsBasic.anonymous);
    expect(fn.name).toBeNull();
    expect(fn.isDeclaration).toBe(false);
  });

  it('should parse arrow expression body', () => {
    const fn = analyzer.parse(jsBasic.arrow);
    expect(fn.isArrow).toBe(true);
    expect(fn.body.isExpression).toBe(true);
    expect(fn.paramCount).toBe(2);
  });

  it('should parse arrow block body', () => {
    const fn = analyzer.parse(jsBasic.arrowBlock);
    expect(fn.isArrow).toBe(true);
    expect(fn.body.isBlock).toBe(true);
  });

  it('should parse single param arrow', () => {
    const fn = analyzer.parse(jsBasic.arrowSingle);
    expect(fn.isArrow).toBe(true);
    expect(fn.paramCount).toBe(1);
    expect(fn.param(0)?.name).toBe('x');
  });

  it('should parse no-param arrow', () => {
    const fn = analyzer.parse(jsBasic.arrowNoParam);
    expect(fn.paramCount).toBe(0);
  });

  it('should parse async function', () => {
    const fn = analyzer.parse(jsBasic.asyncFunc);
    expect(fn.isAsync).toBe(true);
    expect(fn.name).toBe('fetchData');
  });

  it('should parse async arrow', () => {
    const fn = analyzer.parse(jsBasic.asyncArrow);
    expect(fn.isAsync).toBe(true);
    expect(fn.isArrow).toBe(true);
  });

  it('should parse generator', () => {
    const fn = analyzer.parse(jsBasic.generator);
    expect(fn.isGenerator).toBe(true);
    expect(fn.name).toBe('gen');
  });

  it('should parse async generator', () => {
    const fn = analyzer.parse(jsBasic.asyncGenerator);
    expect(fn.isAsync).toBe(true);
    expect(fn.isGenerator).toBe(true);
  });

  it('should parse runtime function', () => {
    function myFunc(a: number, b: number) { return a - b; }
    const fn = analyzer.parse(myFunc);
    expect(fn.name).toBe('myFunc');
    expect(fn.paramCount).toBe(2);
  });

  it('should parse runtime arrow', () => {
    const myArrow = (a: number) => a * 2;
    const fn = analyzer.parse(myArrow);
    expect(fn.isArrow).toBe(true);
  });
});

describe('Edge cases', () => {
  it('should parse minified', () => {
    const fn = analyzer.parse(edge.minified);
    expect(fn.name).toBe('a');
    expect(fn.paramCount).toBe(2);
  });

  it('should parse multiline', () => {
    const fn = analyzer.parse(edge.multiline);
    expect(fn.paramCount).toBe(3);
  });

  it('should parse with comments', () => {
    const fn = analyzer.parse(edge.withComments);
    expect(fn.param(0)?.name).toBe('a');
    expect(fn.param(1)?.name).toBe('b');
  });

  it('should parse unicode identifiers', () => {
    const fn = analyzer.parse(edge.unicode);
    expect(fn.name).toBe('π');
    expect(fn.param(0)?.name).toBe('Δ');
  });

  it('should throw on invalid input', () => {
    expect(() => analyzer.parse('not a function')).toThrow();
  });

  it('should throw when no function found', () => {
    expect(() => analyzer.parse('const x = 42;')).toThrow(/No function/);
  });
});

describe('toJSON', () => {
  it('should serialize correctly', () => {
    const fn = analyzer.parse(jsBasic.named);
    const json = fn.toJSON();

    expect(json).toMatchObject({
      name: 'add',
      type: 'FunctionDeclaration',
      async: false,
      generator: false,
      arrow: false,
      bodyType: 'block',
      statementCount: 1,
      engine: 'acorn',
    });
    expect(json.params).toHaveLength(2);
  });
});
