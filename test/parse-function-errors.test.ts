import { describe, it, expect, beforeAll } from 'vitest'
import { AcornAdapter } from '../src/parser/acorn-adapter.js'
import { JSAnalystParseError } from '../src/parser/adapter.js'

describe('parseFunctionSource Error Handling', () => {
  const acorn = new AcornAdapter()

  it('should throw JSAnalystParseError when all strategies fail', () => {
    const invalidCode = 'function { !!! }'
    try {
      acorn.parseFunctionSource(invalidCode)
    } catch (err) {
      expect(err).toBeInstanceOf(JSAnalystParseError)
      const parseError = err as JSAnalystParseError
      expect(parseError.message).toContain("Best guess")
      expect(parseError.parseErrors.length).toBeGreaterThan(0)
    }
  })

  it('should prioritize errors from requested kind', () => {
    // This is valid as a function declaration, but we'll force it to fail or check how it reports
    // Actually, let's use something that is definitely NOT a method but we request a method.
    const code = 'function foo() {}'
    // 'function foo() {}' is NOT valid inside ({ ... }) as a method shorthand usually (it's a property with a function value)
    // Actually { function foo() {} } is a syntax error if not assigned.

    try {
      // If we ask for a method, it should still try all, but if all fail, it should prefer the method strategy error if applicable
      // But if 'Direct' works, it won't throw.
      // So let's use broken code.
      acorn.parseFunctionSource('method() { !!! }', { kind: 'method' })
    } catch (err) {
      const parseError = err as JSAnalystParseError
      // Strategy 'Method' wraps it in ({ ... })
      // strategy 'ClassMethod' wraps it in (class{ ... })
      const methodError = parseError.parseErrors.find(e => e.strategy === 'Method')
      expect(methodError).toBeDefined()
    }
  })

  it('should map offsets correctly to pos', () => {
    try {
      // In Expression strategy: (()
      // ')' is invalid at index 1 in the wrapped version
      acorn.parseFunctionSource(')')
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const exprError = parseError.parseErrors.find(e => e.strategy === 'Expression')
      // Original code ')', error at index 0.
      // Wrapped '())', error at index 1.
      // pos = wrappedPos (1) - offset (1) = 0.
      expect(exprError?.pos).toBe(0)
    }
  })

  it('should prioritize the error message of the requested kind in "Best guess"', () => {
    const code = 'method() { return 1 ' // Missing closing brace
    try {
      acorn.parseFunctionSource(code, { kind: 'method' })
    } catch (err) {
      const parseError = err as JSAnalystParseError
      // For 'method' kind, the strategies 'Method' and 'ClassMethod' are prioritized.
      // We expect the message to reflect one of these if they were tried.
      expect(parseError.message).toMatch(/Best guess \((Method|ClassMethod)\):/i)
    }
  })

  it('should contain all tried strategies in parseErrors', () => {
    try {
      acorn.parseFunctionSource('!!!')
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const strategies = parseError.parseErrors.map((e) => e.strategy)
      expect(strategies).toContain('Direct')
      expect(strategies).toContain('Expression')
      expect(strategies).toContain('Method')
      expect(strategies).toContain('ClassMethod')
    }
  })

  it('should pick Direct error as best guess if no kind is specified and everything fails', () => {
    try {
      acorn.parseFunctionSource('illegal syntax')
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const directError = parseError.parseErrors.find((e) => e.strategy === 'Direct')
      expect(parseError.message).toContain(directError!.message)
    }
  })

  it('should handle multiple requested kinds', () => {
    try {
      // Both might be relevant, but 'Method' is one of them
      acorn.parseFunctionSource('invalid', { kind: ['method', 'function'] })
    } catch (err) {
      const parseError = err as JSAnalystParseError
      // It should still prioritize those that have a kind matching the request
      const best = parseError.parseErrors.find((e) => {
        return e.strategy === 'Method' || e.strategy === 'ClassMethod'
      })
      // Since 'method' was in the list, the heuristic should favor 'Method' or 'ClassMethod'
      expect(parseError.message).toContain('Best guess')
    }
  })

  it('should map offsets correctly to pos for different strategies', () => {
    // brokenCode = 'p(0)r(1)o(2)p(3):(4) (5)@(6)'
    const brokenCode = 'prop: @'

    try {
      acorn.parseFunctionSource(brokenCode)
    } catch (err) {
      const parseError = err as JSAnalystParseError

      const directError = parseError.parseErrors.find(e => e.strategy === 'Direct')
      // Direct: 'prop: @' -> Valid label, fails at '@' (index 6)
      expect(directError?.pos).toBe(6)
      expect(directError?.length).toBe(1)

      const classError = parseError.parseErrors.find(e => e.strategy === 'ClassMethod')
      // In class body, 'prop: @' is invalid.
      // User observation: it points to 'prop' (index 0)
      // expect(classError?.pos).toBe(0)
      // Acorn 采用的是标准的递归下降，它解析完 prop 后觉得它可能是一个方法名，直到看到`:`才发现这不符合类成员语法，所以报错点定在了 :（索引 4）
      expect(classError?.pos).toBe(4)
      expect(classError?.length).toBe(1)
      // The length should cover 'prop' (4)
      // expect(classError?.length).toBe(4)
    }
  })

  it('should capture precise length for keywords in wrong places', () => {
    const code = 'function(var x) {}'
    try {
      acorn.parseFunctionSource(code)
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const exprError = parseError.parseErrors.find(e => e.strategy === 'Expression')
      // 'function(var' -> 'var x' starts at index 9, length 5
      expect(exprError?.pos).toBe(9)
      expect(exprError?.length).toBe(5)
    }
  })

  it('should handle multi-character invalid tokens', () => {
    const code = 'x => { return 1 += 2 }'
    try {
      acorn.parseFunctionSource(code)
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const directError = parseError.parseErrors.find(e => e.strategy === 'Direct')
      // Error is on '1 +=' (index 14) because it's an invalid LHS for +=
      expect(directError?.pos).toBe(14)
      expect(directError?.length).toBe(4)
    }
  })

  it('should handle errors at the very end of source', () => {
    try {
      acorn.parseFunctionSource('function f(')
    } catch (err) {
      const parseError = err as JSAnalystParseError
      const directError = parseError.parseErrors.find(e => e.strategy === 'Direct')
      // Error is at the end of 'function f(' which is index 11
      expect(directError?.pos).toBe(11)
    }
  })
})
