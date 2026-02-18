import { describe, it, expect } from 'vitest'
import { parse, verify } from '../src/index.js'

describe('Enhanced Verification (Recursive & Structured)', () => {
  describe('Parameter Destructuring', () => {
    it('should verify recursive object destructuring', () => {
      const code = 'function test({ a, b: { c } = { c: 1 } }: { a: string, b?: { c: number } }) {}'
      const schema: any = {
        params: {
          properties: {
            a: { type: 'string' },
            b: {
              pattern: 'object',
              properties: {
                c: { type: 'number' }
              },
              hasDefault: true
            }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify array destructuring (items)', () => {
      const code = 'function test([a, b]: [string, number]) {}'
      const schema = {
        params: {
          items: [
            { type: 'string' },
            { type: 'number' }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should fail when required property is missing in destructuring', () => {
      const code = 'function test({ a }: { a: string }) {}'
      const schema = {
        params: {
          properties: {
            a: { type: 'string' },
            b: { type: 'number' }
          },
          required: ['a', 'b']
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures.some(f => f.message.includes('Missing required property: b'))).toBe(true)
    })
  })

  describe('Structured Return Type', () => {
    it('should verify object-like return type', () => {
      const code = 'function test(): { success: boolean, data: string } { return { success: true, data: "" } }'
      const schema = {
        returnType: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'string' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify tuple return type', () => {
      const code = 'function test(): [number, string] { return [1, ""] }'
      const schema = {
        returnType: {
          items: [
            { type: 'number' },
            { type: 'string' }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should fail when return type property is missing', () => {
      const code = 'function test(): { a: number } { return { a: 1 } }'
      const schema = {
        returnType: {
          properties: {
            a: { type: 'number' },
            b: { type: 'string' }
          },
          required: ['a', 'b']
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures.some(f => f.message.includes('Missing required property in return type: b'))).toBe(true)
    })
  })

  describe('Type Normalization', () => {
    it('should normalize integer to number in schemas', () => {
      const code = 'function test(a: number) {}'
      const schema = {
        params: [
          { type: 'integer' }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })
})
