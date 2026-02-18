// ============================================================
//  src/parser/adapter.ts — Parser Adapter Abstract Base
// ============================================================

import type { ASTNode, EngineName, ParseOptions, ParseResult } from '../types.js'

/**
 * Wrapping strategy for parsing various function forms.
 */
export interface WrapStrategy {
  wrap: (s: string) => string
  offset: number
}

export const WRAP_STRATEGIES: WrapStrategy[] = [
  { wrap: (s) => s, offset: 0 }, // Direct parse
  { wrap: (s) => `(${s})`, offset: 1 }, // Wrapped in parens (expression)
  { wrap: (s) => `({${s}})`, offset: 2 }, // Wrapped in object (method shorthand)
  { wrap: (s) => `(class{${s}})`, offset: 7 }, // Wrapped in class (class method)
  { wrap: (s) => `(function(){${s}})`, offset: 12 }, // Wrapped in function expression
  { wrap: (s) => `(async function*(){${s}})`, offset: 19 }, // Wrapped in async generator expression
]

/**
 * Base class for parser adapters.
 *
 * All concrete parser implementations (e.g., Acorn, OXC) must extend this class.
 * This abstraction allows the core logic to remain engine-agnostic.
 */
export abstract class ParserAdapter {
  /** The name of the parsing engine. */
  readonly name: EngineName
  /** Whether the parser is initialized and ready to use. */
  ready: boolean

  /**
   * @param name - The unique name of the parsing engine.
   */
  constructor(name: EngineName) {
    this.name = name
    this.ready = false
  }

  /**
   * Asynchronously initializes the parser.
   * Necessary for WASM-based parsers like OXC.
   */
  async init(): Promise<void> {
    this.ready = true
  }

  /**
   * Synchronously initializes the parser.
   * Used for pure JavaScript parsers like Acorn.
   */
  initSync(): void {
    this.ready = true
  }

  /**
   * Parses the source code and returns the ESTree AST root node.
   *
   * @param source - The source code to parse.
   * @param options - Optional parsing configuration.
   * @returns The root node of the parsed AST.
   */
  abstract parse(source: string, options?: ParseOptions): ASTNode

  /**
   * Attempts to parse the source using multiple wrapping strategies.
   *
   * @param source - The function source or fragment.
   * @param options - Parsing configuration.
   * @returns The parsing result including the AST and applied offset.
   * @throws {Error} If all parsing attempts fail.
   */
  parseFunctionSource(source: string, options: ParseOptions = {}): ParseResult {
    const errors: Error[] = []

    for (const strategy of WRAP_STRATEGIES) {
      try {
        const wrapped = strategy.wrap(source)
        const ast = this.parse(wrapped, options)
        return {
          ast,
          offset: strategy.offset,
          engine: this.name,
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
