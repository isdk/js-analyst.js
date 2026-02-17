// ============================================================
//  src/parser/oxc-adapter.ts — OXC Parser Adapter
// ============================================================

import { ParserAdapter } from './adapter.js'
import type { ASTNode, ParseOptions } from '../types.js'

/**
 * Interface for the dynamically imported OXC module.
 *
 * OXC is an optional dependency to keep the core package light.
 */
type OxcModule = typeof import('oxc-parser')


/**
 * Parser adapter for the high-performance OXC engine.
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
   * Dynamically loads the OXC module.
   *
   * @throws {Error} If the `oxc-parser` package is not installed or fails to load.
   */
  async init(): Promise<void> {
    if (this.ready) return

    try {
      // Dynamic import to avoid errors if not installed
      this.module = (await import('oxc-parser')) as unknown as OxcModule
      this.ready = true
    } catch (err) {
      this.ready = false
      throw new Error(
        `Failed to initialize oxc-parser. ` +
          `Make sure it is installed: npm install oxc-parser\n` +
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

    const filename =
      options.sourceFilename ?? (options.ts ? 'input.ts' : 'input.js')
    const result = this.module.parseSync(filename, source, {
      sourceType: options.sourceType ?? 'module',
    })

    if (result.errors.length > 0) {
      const first = result.errors[0]!
      const messages = result.errors
        .map((e) => e.codeframe || e.message)
        .join('\n')
      const err = new SyntaxError(messages)

      if (first.labels && first.labels.length > 0) {
        const label = first.labels[0]!
        ;(err as any).pos = label.start
        ;(err as any).loc = {
          start: label.start,
          end: label.end,
        }
      }
      throw err
    }

    return result.program as unknown as ASTNode
  }
}
