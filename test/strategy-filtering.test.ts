import { describe, it, expect } from 'vitest'
import { AcornAdapter } from '../src/parser/acorn-adapter.js'
import { JSAnalystParseError } from '../src/parser/adapter.js'

describe('parseFunctionSource Strategy Filtering', () => {
  const acorn = new AcornAdapter()

  it('should NOT include method strategies when kind is "function"', () => {
    try {
      // Incomplete function source to trigger error and see details
      acorn.parseFunctionSource('function a() {', { kind: 'function' })
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const strategies = parseError.parseErrors.map(e => e.strategy)
      
      expect(strategies).toContain('Direct')
      expect(strategies).toContain('Expression')
      expect(strategies).toContain('FunctionExpression')
      
      // These should be filtered out
      expect(strategies).not.toContain('Method')
      expect(strategies).not.toContain('ClassMethod')
    }
  })

  it('should NOT include function strategies when kind is "method"', () => {
    try {
      acorn.parseFunctionSource('a() {', { kind: 'method' })
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const strategies = parseError.parseErrors.map(e => e.strategy)
      
      expect(strategies).toContain('Direct')
      expect(strategies).toContain('Expression')
      expect(strategies).toContain('Method')
      expect(strategies).toContain('ClassMethod')
      
      // These should be filtered out
      expect(strategies).not.toContain('FunctionExpression')
      expect(strategies).not.toContain('AsyncGeneratorExpression')
    }
  })
})
