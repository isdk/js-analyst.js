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
  })
})
