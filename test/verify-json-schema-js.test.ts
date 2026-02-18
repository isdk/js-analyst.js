import { describe, it, expect } from 'vitest'
import { verify } from '../src/index.js'

describe('JavaScript Verification (No Type Annotations)', () => {
  describe('Return Value Analysis (Body Fallback)', () => {
    it('should verify object literal return in standard function', () => {
      const code = 'function get() { return { s: "ok", n: 1 } }'
      const schema = {
        returnType: {
          properties: {
            s: { type: 'string' },
            n: { type: 'number' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify arrow function with expression body', () => {
      const code = 'const get = () => ({ success: true })'
      const schema = {
        returnType: {
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should fail if any return branch does not match', () => {
      const code = `
        function test(b) {
          if (b) return { val: 1 };
          return { val: "wrong" };
        }
      `
      const schema = {
        returnType: {
          properties: {
            val: { type: 'number' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].message).toContain('return values do not satisfy the schema')
    })

    it('should verify multiple return branches matching anyOf', () => {
      const code = `
        function test(b) {
          if (b) return { s: "a" };
          return { n: 1 };
        }
      `
      const schema: any = {
        returnType: {
          anyOf: [
            { properties: { s: { type: 'string' } } },
            { properties: { n: { type: 'number' } } }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Parameter Analysis (No Types)', () => {
    it('should verify nested object destructuring in JS', () => {
      const code = 'function test({ a: { b } }) {}'
      const schema = {
        params: {
          properties: {
            a: {
              properties: {
                b: {} // Just check if 'b' exists in destructuring
              }
            }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify default values in JS destructuring', () => {
      const code = 'function test({ a = 1 } = {}) {}'
      const schema = {
        params: {
          properties: {
            a: { hasDefault: true }
          },
          hasDefault: true
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Mixed Patterns', () => {
    it('should verify positional and destructured parameters in JS', () => {
      const code = 'function test(id, { name }) {}'
      const schema = {
        params: [
          { name: 'id' },
          { properties: { name: {} } }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify parameters and result in JS', () => {
      const code = new String('function main(a, b) {\n  return a + b;\n}\n') as any
      const schema = {
        params: [
          { type: 'number', name: 'a', description: '加数' },
          { type: 'number', name: 'b', description: '被加数' },
        ],
        returnType: {
          type: 'number',
          description: '和'
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should fail in strict mode if types are missing in JS', () => {
      const code = 'function main(a) { return a }'
      const schema = {
        strict: true,
        params: [{ type: 'number', name: 'a' }],
        returnType: { type: 'number' }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures.some(f => f.path === 'params[0].type')).toBe(true)
      expect(result.failures.some(f => f.path === 'returnType.type')).toBe(true)
    })

    it('should verify unary and template expressions in JS returns', () => {
      const code1 = 'function isNot(a) { return !a }'
      expect(verify(code1, { returnType: { type: 'boolean' } }).passed).toBe(true)

      const code2 = 'function greet(name) { return `Hello ${name}` }'
      expect(verify(code2, { returnType: { type: 'string' } }).passed).toBe(true)
    })

    it('should be compatible with both lowercase and uppercase built-in type names', () => {
      const code = 'function now() { return new Date() }'
      // Should match lowercase 'date'
      expect(verify(code, { returnType: { type: 'date' } }).passed).toBe(true)
      // Should also match uppercase 'Date' (JS class name)
      expect(verify(code, { returnType: { type: 'Date' } }).passed).toBe(true)

      const codeTs = 'function add(a: number) {}'
      expect(verify(codeTs, { params: [{ type: 'Number' }] }).passed).toBe(true)
    })

    it('should be case-sensitive for custom class names', () => {
      const code = 'function create() { return new MyService() }'
      // Exact match
      expect(verify(code, { returnType: { type: 'MyService' } }).passed).toBe(true)
      // Case mismatch for custom class should fail
      expect(verify(code, { returnType: { type: 'myservice' } }).passed).toBe(false)
    })

    it('should provide detailed sub-failures for returnType', () => {
      const code = `
        function test(b) {
          if (b) return { val: 1 };
          return { val: "wrong" };
        }
      `
      const schema = {
        returnType: {
          properties: {
            val: { type: 'number' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      // Check for the summary message
      expect(result.failures.some(f => f.message.includes('return values do not satisfy the schema'))).toBe(true)
      // Check for the specific sub-failure
      expect(result.failures.some(f => f.path === 'returnType.properties.val.type' && f.actual === 'string')).toBe(true)
    })
    it('should be case-sensitive for custom class names in parameters', () => {
      const code = 'function handle(req: Request) {}'
      // Exact match
      expect(verify(code, { params: [{ type: 'Request' }] }).passed).toBe(true)
      // Case mismatch for custom class in params should fail
      expect(verify(code, { params: [{ type: 'request' }] }).passed).toBe(false)
    })
  })
})
