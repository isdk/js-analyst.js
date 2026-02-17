// ============================================================
//  src/parser/auto-adapter.ts — 自动引擎选择 & 多策略解析
// ============================================================

import { AcornAdapter } from './acorn-adapter.js'
import { OxcAdapter } from './oxc-adapter.js'
import type { ParserAdapter } from './adapter.js'
import type { ParseOptions, ParseResult } from '../types.js'

export interface AutoAdapterOptions {
  threshold?: number
}

/**
 * 包装策略：应对不同函数字符串形态
 */
interface WrapStrategy {
  wrap: (s: string) => string
  offset: number
}

const WRAP_STRATEGIES: WrapStrategy[] = [
  { wrap: (s) => s, offset: 0 }, // 直接解析
  { wrap: (s) => `(${s})`, offset: 1 }, // 表达式包裹
  { wrap: (s) => `({${s}})`, offset: 2 }, // 方法简写包裹
  { wrap: (s) => `(class{${s}})`, offset: 7 }, // class 方法包裹
]

export class AutoAdapter {
  readonly acorn: AcornAdapter
  readonly oxc: OxcAdapter
  private readonly threshold: number
  private warmupStarted = false

  constructor(options: AutoAdapterOptions = {}) {
    this.threshold = options.threshold ?? 50 * 1024
    this.acorn = new AcornAdapter()
    this.oxc = new OxcAdapter()
  }

  /**
   * 空闲预热 WASM
   */
  warmup(): void {
    if (this.warmupStarted) return
    this.warmupStarted = true

    const doWarmup = () => {
      this.oxc.init().catch(() => {
        // WASM 加载失败不是致命错误，静默降级到 acorn
      })
    }

    if (typeof globalThis.requestIdleCallback !== 'undefined') {
      globalThis.requestIdleCallback(doWarmup)
    } else {
      setTimeout(doWarmup, 2000)
    }
  }

  /**
   * 根据源码大小和引擎就绪状态选择适配器
   */
  select(source: string, options?: ParseOptions): ParserAdapter {
    if (options?.engine === 'acorn') return this.acorn
    if (options?.engine === 'oxc') return this.oxc

    if (source.length >= this.threshold && this.oxc.ready) {
      return this.oxc
    }
    return this.acorn
  }

  /**
   * 用多种包装策略尝试解析函数源码
   */
  parseFunctionSource(source: string, options: ParseOptions = {}): ParseResult {
    const adapter = this.select(source, options)
    const errors: Error[] = []

    for (const strategy of WRAP_STRATEGIES) {
      try {
        const wrapped = strategy.wrap(source)
        const ast = adapter.parse(wrapped, options)
        return {
          ast,
          offset: strategy.offset,
          engine: adapter.name,
        }
      } catch (err) {
        errors.push(err as Error)
      }
    }

    const msg = [
      'Failed to parse function source.',
      ...errors.map((e, i) => `  Attempt ${i + 1}: ${e.message}`),
    ].join('\n')

    const error = new Error(msg)
    ;(error as any).parseErrors = errors
    throw error
  }
}
