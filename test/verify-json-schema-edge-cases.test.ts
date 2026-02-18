import { describe, it, expect } from 'vitest'
import { verify } from '../src/index.js'

describe('Edge Case Verification (Extreme Combinations)', () => {
  describe('Deep Logic Nesting', () => {
    it('should verify anyOf nested inside oneOf', () => {
      const code = 'function test(a: string) {}'
      const schema = {
        params: [
          {
            oneOf: [
              { anyOf: [{ type: 'string' }, { type: 'number' }] },
              { type: 'boolean' }
            ]
          }
        ]
      }
      const result = verify(code, schema)
      // Both string and number match the first oneOf branch,
      // but only the first branch matches overall.
      expect(result.passed).toBe(true)
    })
  })

  describe('Extreme Type Propagation', () => {
    it('should propagate types through nested destructuring with default values', () => {
      const code = 'function test({ a: { b } = { b: 1 } }: { a?: { b: number } }) {}'
      const schema = {
        params: {
          properties: {
            a: {
              hasDefault: true,
              properties: {
                b: { type: 'number' }
              }
            }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('ReturnType Logic Combinators', () => {
    it('should verify returnType with oneOf structures', () => {
      const code = 'function get(): { s: string } | { n: number } { return { s: "" } }'
      const schema: any = {
        returnType: {
          oneOf: [
            { properties: { s: { type: 'string', required: true } } },
            { properties: { n: { type: 'number', required: true } } }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify returnType with oneOf structures(js)', () => {
      const code = 'function get() { return { s: "" } }'
      const schema: any = {
        returnType: {
          oneOf: [
            { properties: { s: { type: 'string', required: true } } },
            { properties: { n: { type: 'number', required: true } } }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Object Rest Properties', () => {
    it('should verify rest properties in object destructuring', () => {
      const code = 'function test({ a, ...rest }: { a: number, [k: string]: any }) {}'
      const schema = {
        params: {
          properties: {
            a: { type: 'number' },
            rest: { isRest: true }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Strict Mode Penetration', () => {
    it('should apply strict mode to nested properties', () => {
      const code = 'function test({ a: { b, c } }: { a: { b: number, c: number } }) {}'
      const schema = {
        strict: true,
        params: {
          properties: {
            a: {
              properties: {
                b: { type: 'number' }
                // 'c' is missing in schema, should fail in strict mode
              }
            }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures.some(f => f.message.includes('Unexpected property "c"'))).toBe(true)
    })
  })
})
