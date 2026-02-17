// ============================================================
//  src/parser/oxc-adapter.ts — OXC Parser Adapter
// ============================================================

import { ParserAdapter } from './adapter.js'
import type { ASTNode, ParseOptions } from '../types.js'

/**
 * Interface for the dynamically imported OXC WASM module.
 *
 * OXC is an optional dependency to keep the core package light.
 */
interface OxcModule {
  default: () => Promise<void>
  parseSync: (
    source: string,
    options: { sourceFilename?: string; sourceType?: string }
  ) => {
    program: ASTNode
    errors: Array<{ message: string; offset?: number }>
  }
}

/**
 * Parser adapter for the high-performance OXC engine (WASM).
 *
 * OXC is significantly faster than JS-based parsers, making it
 * ideal for large files or batch processing.
 */
export class OxcAdapter extends ParserAdapter {
  private module: OxcModule | null = null

  constructor() {
    super('oxc')
  }

  /**
   * Dynamically loads and initializes the OXC WASM module.
   *
   * @throws {Error} If the `@oxc-parser/wasm` package is not installed or fails to load.
   */
  async init(): Promise<void> {
    if (this.ready) return

    try {
      // Dynamic import to avoid errors if not installed
      this.module = (await import('@oxc-parser/wasm')) as unknown as OxcModule
      if (typeof this.module.default === 'function') {
        await (this.module as any).default()
      }
      this.ready = true
    } catch (err) {
      this.ready = false
      throw new Error(
        `Failed to initialize @oxc-parser/wasm. ` +
          `Make sure it is installed: npm install @oxc-parser/wasm\n` +
          `Original error: ${(err as Error).message}`
      )
    }
  }

  /**
   * Parses the source using the OXC engine.
   *
   * @param source - The source code to parse.
   * @param options - Configuration options.
   * @throws {SyntaxError} If the source code contains syntax errors.
   */
  parse(source: string, options: ParseOptions = {}): ASTNode {
    if (!this.ready || !this.module) {
      throw new Error('OxcAdapter not initialized. Call init() first.')
    }

    const result = this.module.parseSync(source, {
      sourceFilename:
        options.sourceFilename ?? (options.ts ? 'input.ts' : 'input.js'),
      sourceType: options.sourceType ?? 'module',
    })

    if (result.errors.length > 0) {
      const first = result.errors[0]!
      const err = new SyntaxError(first.message)
      ;(err as any).pos = first.offset
      throw err
    }

    return result.program
  }
}
