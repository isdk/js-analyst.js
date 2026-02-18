import { describe, it, expect } from 'vitest'
import { verify } from '../src/index.js'

describe('Comprehensive Verification Suite', () => {
  describe('Complex Parameter Structures', () => {
    it('should verify mixed parameters: positional, object destructuring, and rest', () => {
      const code = 'function process(id: number, { name, tags }: { name: string, tags: string[] }, ...extra: any[]) {}'
      const schema = {
        params: [
          { type: 'number' },
          {
            isDestructured: true,
            properties: {
              name: { type: 'string' },
              tags: { type: 'string[]' }
            }
          },
          { isRest: true, type: 'any[]' }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify deeply nested destructuring (Array in Object in Array)', () => {
      const code = 'function complex([ { items: [first] } ]: [ { items: [number] } ]) {}'
      const schema: any = {
        params: [
          {
            pattern: 'array',
            items: [
              {
                pattern: 'object',
                properties: {
                  items: {
                    pattern: 'array',
                    items: [ { type: 'number' } ]
                  }
                }
              }
            ]
          }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should handle optional properties and default values in destructuring', () => {
      const code = 'function settings({ theme = "dark", debug }: { theme?: string, debug: boolean }) {}'
      const schema = {
        params: {
          properties: {
            theme: { type: 'string', hasDefault: true },
            debug: { type: 'boolean', hasDefault: false }
          },
          required: ['debug']
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify property aliasing in destructuring', () => {
      const code = 'function test({ a: localA }: { a: number }) {}'
      const schema = {
        params: {
          properties: {
            a: { name: 'localA', type: 'number' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify sparse arrays and rest elements in array destructuring', () => {
      const code = 'function test([ , second, ...rest]: [any, number, ...string[]]) {}'
      const schema = {
        params: {
          items: [
            null, // Skip first
            { name: 'second', type: 'number' },
            { name: 'rest', isRest: true, type: 'string[]' }
          ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should support shorthand "...type" for rest parameters', () => {
      const code = 'function test(...args: number[]) {}'
      const schema = {
        params: [
          { name: 'args', type: '...number[]' }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Complex Return Types', () => {
    it('should verify nested object return type', () => {
      const code = 'function getStatus(): { status: "ok" | "error", info: { code: number } } { return { status: "ok", info: { code: 200 } } }'
      const schema = {
        returnType: {
          properties: {
            status: { type: '"ok" | "error"' },
            info: {
              properties: {
                code: { type: 'number' }
              }
            }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify object return type with union properties', () => {
      const code = 'function get(): { val: string | number } { return { val: 1 } }'
      const schema = {
        returnType: {
          properties: {
            val: { type: 'string | number' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify union return types via string matcher', () => {
      const code = 'function mix(): string | number { return 1 }'
      const schema = {
        returnType: 'string | number'
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })

    it('should verify using JSON Schema anyOf', () => {
      const code = 'function test(a: string) {}'
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
      expect(result.passed).toBe(true)
    })

    it('should verify using JSON Schema oneOf', () => {
      const code = 'function test(a: string) {}'
      const schema = {
        params: [
          {
            oneOf: [
              { type: 'string' },
              { type: 'number' }
            ]
          }
        ]
      }
      let result = verify(code, schema)
      expect(result.passed).toBe(true)
      result = verify('function test(a: number) {}', schema)
      expect(result.passed).toBe(true)
    })

    it('should fail JSON Schema oneOf when no branches match', () => {
      const code = 'function test(a: string) {}'
      const schema = {
        params: [
          {
            oneOf: [
              { type: 'number' },
              { type: 'boolean' }
            ]
          }
        ]
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].path).toBe('params[0]')
      expect(result.failures[0].message).toContain('expected exactly one $oneOf branch to match, but found 0')
    })
  })

  describe('Async and Generator Functions', () => {
    it('should verify async function returning a structured type', () => {
      const code = 'async function fetchData(): Promise<{ data: string }> { return { data: "" } }'
      const schema = {
        async: true,
        returnType: 'Promise<{ data: string }>'
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(true)
    })
  })

  describe('Edge Cases and Errors', () => {
    it('should fail when a property in destructuring has wrong type', () => {
      const code = 'function test({ a }: { a: string }) {}'
      const schema = {
        params: {
          properties: {
            a: { type: 'number' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].path).toBe('params[0].properties.a.type')
    })

    it('should fail when an array element is missing', () => {
      const code = 'function test([a]: [number]) {}'
      const schema = {
        params: {
          items: [ { type: 'number' }, { type: 'string' } ]
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].message).toContain('Missing expected array element at index 1')
    })

    it('should fail when return type property has wrong type', () => {
      const code = 'function test(): { a: number } { return { a: 1 } }'
      const schema = {
        returnType: {
          properties: {
            a: { type: 'string' }
          }
        }
      }
      const result = verify(code, schema)
      expect(result.passed).toBe(false)
      expect(result.failures[0].path).toBe('returnType.properties.a.type')
    })
  })
})
