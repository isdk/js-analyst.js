// ============================================================
//  src/parser/auto-adapter.ts — Automatic Engine Selection
// ============================================================

import { AcornAdapter } from './acorn-adapter.js'
import { OxcAdapter } from './oxc-adapter.js'
import type { ParserAdapter } from './adapter.js'
import type { ParseOptions, ParseResult } from '../types.js'

/**
 * Options for the AutoAdapter.
 */
export interface AutoAdapterOptions {
  /** Size threshold in bytes to prefer OXC over Acorn. */
  threshold?: number
}

/**
 * Wrapping strategy for parsing various function forms.
 */
interface WrapStrategy {
  wrap: (s: string) => string
  offset: number
}

const WRAP_STRATEGIES: WrapStrategy[] = [
  { wrap: (s) => s, offset: 0 }, // Direct parse
  { wrap: (s) => `(${s})`, offset: 1 }, // Wrapped in parens (expression)
  { wrap: (s) => `({${s}})`, offset: 2 }, // Wrapped in object (method shorthand)
  { wrap: (s) => `(class{${s}})`, offset: 7 }, // Wrapped in class (class method)
  { wrap: (s) => `(function(){${s}})`, offset: 12 }, // Wrapped in function expression
  { wrap: (s) => `(async function*(){${s}})`, offset: 19 }, // Wrapped in async generator expression
]

/**
 * Smart adapter that selects between Acorn and OXC based on source size
 * and availability. It also handles various source wrapping strategies
 * to parse code fragments.
 */
export class AutoAdapter {
  /** The Acorn adapter instance. */
  readonly acorn: AcornAdapter
  /** The OXC adapter instance. */
  readonly oxc: OxcAdapter
  private readonly threshold: number
  private warmupStarted = false

  /**
   * @param options - Configuration for the auto-adapter.
   */
  constructor(options: AutoAdapterOptions = {}) {
    this.threshold = options.threshold ?? 50 * 1024
    this.acorn = new AcornAdapter()
    this.oxc = new OxcAdapter()
  }

  /**
   * Pre-loads the OXC WASM module during idle time to improve
   * performance for future large-file parses.
   */
  warmup(): void {
    if (this.warmupStarted) return
    this.warmupStarted = true

    const doWarmup = () => {
      this.oxc.init().catch(() => {
        // Silently fail warmup; fall back to Acorn if OXC unavailable
      })
    }

    if (typeof globalThis.requestIdleCallback !== 'undefined') {
      globalThis.requestIdleCallback(doWarmup)
    } else {
      setTimeout(doWarmup, 2000)
    }
  }

  /**
   * Selects the most appropriate adapter for the given source and options.
   *
   * @param source - The source code to be parsed.
   * @param options - Optional engine override and other settings.
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
   * Attempts to parse the source using multiple wrapping strategies.
   *
   * @param source - The function source or fragment.
   * @param options - Parsing configuration.
   * @returns The parsing result including the AST and applied offset.
   * @throws {Error} If all parsing attempts fail.
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
