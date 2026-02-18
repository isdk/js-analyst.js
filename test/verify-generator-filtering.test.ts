import { describe, it, expect } from 'vitest'
import { Analyzer } from '../src/core/analyzer.js'
import { JSAnalystParseError } from '../src/parser/adapter.js'

describe('Analyzer.verify generator filtering', () => {
  const analyzer = new Analyzer()

  it('should NOT include generator strategies by default (assumes false)', () => {
    try {
      // No generator hint, should default to skipping generator strategies
      analyzer.verify('function a() { !!! ', { kind: 'function' })
    } catch (err) {
      if (err instanceof JSAnalystParseError) {
        const strategies = err.parseErrors.map(e => e.strategy)
        expect(strategies).not.toContain('GeneratorExpression')
        expect(strategies).not.toContain('AsyncGeneratorExpression')
        // Should have normal function strategies (Direct is generic, FunctionExpression matches kind and default async:false, generator:false)
        expect(strategies).toContain('Direct')
        expect(strategies).toContain('FunctionExpression')
      } else {
        throw err
      }
    }
  })

  it('should ONLY include specific generator strategies when generator is true', () => {
    try {
      // When generator is true, but async is undefined (defaults to false)
      // It should only include GeneratorExpression, not AsyncGeneratorExpression
      analyzer.verify('function a() { !!! ', { kind: 'function', generator: true })
    } catch (err) {
      if (err instanceof JSAnalystParseError) {
        const strategies = err.parseErrors.map(e => e.strategy)
        expect(strategies).toContain('GeneratorExpression')
        expect(strategies).not.toContain('AsyncGeneratorExpression')
        expect(strategies).not.toContain('FunctionExpression')
        expect(strategies).not.toContain('AsyncFunctionExpression')
      } else {
        throw err
      }
    }
  })

  it('should include AsyncGeneratorExpression when both generator and async are true', () => {
    try {
      analyzer.verify('function a() { !!! ', { kind: 'function', generator: true, async: true })
    } catch (err) {
      if (err instanceof JSAnalystParseError) {
        const strategies = err.parseErrors.map(e => e.strategy)
        expect(strategies).toContain('AsyncGeneratorExpression')
        expect(strategies).not.toContain('GeneratorExpression')
        expect(strategies).not.toContain('FunctionExpression')
        expect(strategies).not.toContain('AsyncFunctionExpression')
      } else {
        throw err
      }
    }
  })
})
