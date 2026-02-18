import { describe, it, expect } from 'vitest'
import { verify } from '../src/index.js'

describe('Fundamental Integration Verification', () => {
  describe('Positional Parameters (Simple)', () => {
    it('should verify parameters using a simple string array', () => {
      const code = 'function add(a: number, b: number) {}'
      const schema: any = {
        params: ['number', 'number']
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify parameters using a top-level array JSON Schema', () => {
      const code = 'function add(a: number, b: string) {}'
      const schema = {
        params: {
          type: 'array',
          items: [
            { type: 'number' },
            { type: 'string' }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Enum Support', () => {
    it('should verify parameter name against an enum', () => {
      const code = 'function set(color: string) {}'
      const schema: any = {
        params: [
          { name: { enum: ['color', 'colour'] } }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify parameter type against an enum', () => {
      const code = 'function set(val: number) {}'
      const schema: any = {
        params: [
          { type: { enum: ['number', 'integer'] } }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Logical NOT', () => {
    it('should verify that a parameter does NOT have a certain type', () => {
      const code = 'function test(a: string) {}'
      const schema = {
        params: [
          { not: { type: 'number' } }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Empty and Partial Constraints', () => {
    it('should pass for empty property schema (just checking existence)', () => {
      const code = 'function test({ a }: { a: any }) {}'
      const schema = {
        params: {
          properties: {
            a: {} // Any constraint on 'a' (just means 'a' must be destructured)
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify flags: isRest, hasDefault, isDestructured', () => {
      const code = 'function test(a = 1, ...extra) {}'
      const schema = {
        params: [
          { hasDefault: true, isDestructured: false },
          { isRest: true, isDestructured: false }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Strict Mode (Extra Properties)', () => {
    it('should fail in strict mode if extra properties are destructured', () => {
      const code = 'function test({ a, b }) {}'
      const schema = {
        strict: true,
        params: {
          properties: {
            a: {}
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].message).toContain('Unexpected property "b"')
    })

    it('should pass in non-strict mode (default) if extra properties are destructured', () => {
      const code = 'function test({ a, b }) {}'
      const schema = {
        params: {
          properties: {
            a: {}
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Nested Logic Combinators', () => {
    it('should verify anyOf inside properties', () => {
      const code = 'function test({ a }: { a: string }) {}'
      const schema = {
        params: {
          properties: {
            a: {
              anyOf: [
                { type: 'string' },
                { type: 'number' }
              ]
            }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify properties inside oneOf', () => {
      const code = 'function test({ a }: { a: string }) {}'
      const schema: any = {
        params: {
          oneOf: [
            { properties: { a: { type: 'string', required: true } } },
            { properties: { b: { type: 'string', required: true } } }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Standard Required Array', () => {
    it('should verify properties using standard required array', () => {
      const code = 'function test({ a }: { a: string }) {}'
      const schema = {
        params: {
          properties: {
            a: { type: 'string' },
            b: { type: 'number' }
          },
          required: ['a']
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Logical Combinators: allOf', () => {
    it('should pass when all constraints in allOf match', () => {
      const code = 'function test(a: number) {}'
      const schema = {
        params: [
          {
            allOf: [
              { name: 'a' },
              { type: 'number' }
            ]
          }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should fail when any constraint in allOf fails', () => {
      const code = 'function test(a: string) {}'
      const schema = {
        params: [
          {
            allOf: [
              { name: 'a' },
              { type: 'number' }
            ]
          }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
    })
  })

  describe('Logical Combinators: anyOf and not', () => {
    it('should fail when no branches in anyOf match', () => {
      const code = 'function test(a: boolean) {}'
      const schema = {
        params: [
          {
            anyOf: [
              { type: 'string' },
              { type: 'number' }
            ]
          }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].message).toContain('none of the $or branches matched')
    })

    it('should fail when NOT constraint matches', () => {
      const code = 'function test(a: string) {}'
      const schema = {
        params: [
          { not: { type: 'string' } }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].message).toContain('should NOT match the $not schema')
    })
  })

  describe('JSON Schema Data Constraints Mapping', () => {
    it('should map "pattern" to RegExp matcher', () => {
      const code = 'function test(email: string) {}'
      const schema: any = {
        params: [
          { type: { pattern: "^string$" } }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })
})
