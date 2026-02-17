
import { describe, it, expect } from 'vitest';
import { createAnalyzer } from '../src/index.js';

const analyzer = createAnalyzer({ engine: 'acorn' });

describe('Function Kind and Syntax', () => {
  describe('Class methods', () => {
    const classCode = `
      class A {
        constructor(name) { this.name = name; }
        get x() { return 1; }
        set x(v) {}
        foo() {}
        static async bar() {}
        *gen() {}
      }
    `;

    it('should identify constructor', () => {
      const fns = analyzer.parseAll(classCode, { kind: 'constructor' });
      expect(fns).toHaveLength(1);
      expect(fns[0].kind).toBe('constructor');
      expect(fns[0].name).toBe('constructor');
    });

    it('should identify getter', () => {
      const fns = analyzer.parseAll(classCode, { kind: 'getter' });
      expect(fns).toHaveLength(1);
      expect(fns[0].kind).toBe('getter');
      expect(fns[0].name).toBe('x');
    });

    it('should identify setter', () => {
      const fns = analyzer.parseAll(classCode, { kind: 'setter' });
      expect(fns).toHaveLength(1);
      expect(fns[0].kind).toBe('setter');
      expect(fns[0].name).toBe('x');
    });

    it('should identify regular methods', () => {
      const fns = analyzer.parseAll(classCode, { kind: 'method' });
      // foo, bar, gen (constructor, get, set are excluded)
      expect(fns).toHaveLength(3);
      expect(fns.map(f => f.name)).toContain('foo');
      expect(fns.map(f => f.name)).toContain('bar');
      expect(fns.map(f => f.name)).toContain('gen');
    });

    it('should identify static methods', () => {
      const fns = analyzer.parseAll(classCode, { kind: 'method' });
      const staticMethods = fns.filter(f => f.isStatic);
      expect(staticMethods).toHaveLength(1);
      expect(staticMethods[0].name).toBe('bar');
    });
  });

  describe('Object properties', () => {
    const objCode = `
      const obj = {
        get y() { return 2; },
        set y(v) {},
        method() {},
        fn: function() {},
        arrow: () => {}
      }
    `;

    it('should identify getter and setter in object', () => {
      expect(analyzer.parseAll(objCode, { kind: 'getter' })).toHaveLength(1);
      expect(analyzer.parseAll(objCode, { kind: 'setter' })).toHaveLength(1);
    });

    it('should identify all property functions as method kind', () => {
      const methods = analyzer.parseAll(objCode, { kind: 'method' });
      // method(), fn: function(), arrow: () => {}
      expect(methods).toHaveLength(3);
      expect(methods.map(f => f.name)).toContain('method');
      expect(methods.map(f => f.name)).toContain('fn');
      expect(methods.map(f => f.name)).toContain('arrow');
    });

    it('should distinguish syntax within methods', () => {
      const methods = analyzer.parseAll(objCode, { kind: 'method' });
      const arrows = methods.filter(f => f.syntax === 'arrow');
      expect(arrows).toHaveLength(1);
      expect(arrows[0].name).toBe('arrow');

      const expressions = methods.filter(f => f.syntax === 'expression');
      expect(expressions).toHaveLength(2); // method() and fn: function()
    });
  });

  describe('Advanced Scenarios', () => {
    it('should handle private methods in classes', () => {
      const code = 'class A { #privateMethod() {} }';
      const fns = analyzer.parseAll(code);
      expect(fns).toHaveLength(1);
      expect(fns[0].name).toBe('privateMethod');
    });

    it('should handle computed property names', () => {
      const code = 'class A { ["computed" + "Name"]() {} }';
      const fns = analyzer.parseAll(code);
      expect(fns).toHaveLength(1);
      // 对于复杂计算属性，目前可能返回 null 或表达式文本，验证其不崩溃
      expect(fns[0].kind).toBe('method');
    });

    it('should detect nested functions', () => {
      const code = `
        function outer() {
          const inner = () => {
            function deep() {}
          }
        }
      `;
      const fns = analyzer.parseAll(code);
      expect(fns).toHaveLength(3);
      expect(fns.map(f => f.name)).toContain('outer');
      expect(fns.map(f => f.name)).toContain('inner');
      expect(fns.map(f => f.name)).toContain('deep');
    });

    it('should handle TypeScript abstract methods', () => {
      const code = 'abstract class A { abstract foo(): void; }';
      // 注意：abstract 方法可能没有 Body，需确保 parseAll 不崩溃
      const fns = analyzer.parseAll(code, { ts: true });
      expect(fns).toHaveLength(1);
      expect(fns[0].name).toBe('foo');
    });

    it('should handle class field initializers', () => {
      const code = 'class A { field = () => {} }';
      const fns = analyzer.parseAll(code);
      expect(fns).toHaveLength(1);
      expect(fns[0].name).toBe('field');
      expect(fns[0].kind).toBe('method');
      expect(fns[0].syntax).toBe('arrow');
    });

    it('should handle export default functions', () => {
      const code1 = 'export default function named() {}';
      const fn1 = analyzer.parse(code1, { sourceType: 'module' });
      expect(fn1.name).toBe('named');

      const code2 = 'export default () => {}';
      const fn2 = analyzer.parse(code2, { sourceType: 'module' });
      expect(fn2.name).toBeNull();
      expect(fn2.syntax).toBe('arrow');
    });

    it('should handle async generators', () => {
      const code = 'async function* gen() {}';
      const fn = analyzer.parse(code);
      expect(fn.isAsync).toBe(true);
      expect(fn.isGenerator).toBe(true);
    });
  });

  describe('Multi-filtering', () => {
    it('should support multiple kinds', () => {
      const code = 'class A { get x(){} set x(v){} foo(){} }';
      const fns = analyzer.parseAll(code, { kind: ['getter', 'setter'] });
      expect(fns).toHaveLength(2);
    });

    it('should support multiple syntaxes', () => {
      const code = 'function a(){} const b = () => {}';
      const fns = analyzer.parseAll(code, { syntax: ['declaration', 'arrow'] });
      expect(fns).toHaveLength(2);
    });
  });

  describe('Filtering in parse()', () => {
    it('should find the first matching function', () => {
      const code = 'function first() {}; const second = () => {};';
      const fn = analyzer.parse(code, { syntax: 'arrow' });
      expect(fn.name).toBe('second');
    });

    it('should throw if no function matches filters', () => {
      const code = 'function first() {}';
      expect(() => analyzer.parse(code, { kind: 'getter' })).toThrow(/No function/);
    });
  });

  describe('Verification with kind and syntax', () => {
    it('should verify kind', () => {
      const result = analyzer.verify('class A { get x() {} }', { kind: 'getter' });
      expect(result.passed).toBe(true);
    });

    it('should fail verification if kind mismatches', () => {
      const result = analyzer.verify('function x() {}', { kind: 'getter' });
      expect(result.passed).toBe(false);
      expect(result.failures[0].path).toBe('kind');
    });

    it('should verify static status', () => {
      const code = 'class A { static foo() {} }';
      const result = analyzer.verify(code, { static: true, name: 'foo' });
      expect(result.passed).toBe(true);

      const result2 = analyzer.verify('class A { foo() {} }', { static: true });
      expect(result2.passed).toBe(false);
    });
  });
});
