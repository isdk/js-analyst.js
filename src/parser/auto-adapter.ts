// ============================================================
//  src/parser/auto-adapter.ts — Automatic Engine Selection
// ============================================================

import { AcornAdapter } from './acorn-adapter.js'
import { OxcAdapter } from './oxc-adapter.js'
import { ParserAdapter } from './adapter.js'
import type { ASTNode, ParseOptions, ParseResult } from '../types.js'

/**
 * Options for the AutoAdapter.
 */
export interface AutoAdapterOptions {
  /** Size threshold in bytes to prefer OXC over Acorn. */
  threshold?: number
}

/**
 * Smart adapter that selects between Acorn and OXC based on source size
 * and availability. It also handles various source wrapping strategies
 * to parse code fragments.
 */
export class AutoAdapter extends ParserAdapter {
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
    super('auto')
    this.threshold = options.threshold ?? 50 * 1024
    this.acorn = new AcornAdapter()
    this.oxc = new OxcAdapter()
    this.ready = true // Auto-adapter is ready since it can always fall back to Acorn
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

    if (source.length >= this.threshold && this._isOxcReady()) {
      return this.oxc
    }
    return this.acorn
  }

  private _isOxcReady(): boolean {
    // OXC needs both initialization and being enabled
    return this.oxc.ready
  }

  /**
   * Parses the source code using the automatically selected engine.
   */
  parse(source: string, options?: ParseOptions): ASTNode {
    return this.select(source, options).parse(source, options)
  }

  /**
   * Attempts to parse the source using multiple wrapping strategies.
   * Delegating to the selected adapter.
   */
  override parseFunctionSource(
    source: string,
    options: ParseOptions = {}
  ): ParseResult {
    return this.select(source, options).parseFunctionSource(source, options)
  }
}
