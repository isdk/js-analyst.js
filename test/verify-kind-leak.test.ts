import { describe, it, expect } from 'vitest'
import { Analyzer } from '../src/core/analyzer.js'
import { JSAnalystParseError } from '../src/parser/adapter.js'

describe('Analyzer.verify kind leak', () => {
  const analyzer = new Analyzer()

  it('should use kind from schema to guide parsing in verify', () => {
    try {
      // 故意写错的函数源码，触发解析错误
      // 如果提取了 kind: 'function'，解析错误中不应该包含 Method 策略
      analyzer.verify('function a() { !!! ', { kind: 'function' })
    } catch (err) {
      if (err instanceof JSAnalystParseError) {
        const strategies = err.parseErrors.map(e => e.strategy)
        // 如果这里包含了 Method，说明 kind 没有传下去
        expect(strategies).not.toContain('Method')
        expect(strategies).not.toContain('ClassMethod')
      } else {
        throw err
      }
    }
  })
})
