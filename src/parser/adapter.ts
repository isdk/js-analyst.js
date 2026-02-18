// ============================================================
//  src/parser/adapter.ts — Parser Adapter Abstract Base
// ============================================================

import type { ASTNode, EngineName, FunctionKind, ParseOptions, ParseResult } from '../types.js'

/**
 * Wrapping strategy for parsing various function forms.
 */
export interface WrapStrategy {
  /** The name of the strategy (e.g., 'Direct', 'Method'). */
  name: string
  /** The wrapping function that transforms the source. */
  wrap: (s: string) => string
  /** The character offset introduced by the wrapping. */
  offset: number
  /** The functional kind associated with this strategy, used for filtering. */
  kind?: FunctionKind
}

export const WRAP_STRATEGIES: WrapStrategy[] = [
  { name: 'Direct', wrap: (s) => s, offset: 0 }, // Direct parse
  { name: 'Expression', wrap: (s) => `(${s})`, offset: 1 }, // Wrapped in parens (expression)
  { name: 'Method', wrap: (s) => `({${s}})`, offset: 2, kind: 'method' }, // Wrapped in object (method shorthand)
  { name: 'ClassMethod', wrap: (s) => `(class{${s}})`, offset: 7, kind: 'method' }, // Wrapped in class (class method)
  { name: 'FunctionExpression', wrap: (s) => `(function(){${s}})`, offset: 12 }, // Wrapped in function expression
  { name: 'AsyncGeneratorExpression', wrap: (s) => `(async function*(){${s}})`, offset: 19 }, // Wrapped in async generator expression
]

/**
 * Detailed error information for a single parsing attempt.
 */
export interface ParseErrorDetail {
  strategy: string
  message: string
  error: Error
  /** The 0-based character offset in the ORIGINAL source. */
  pos: number
  /** The length of the error segment. */
  length: number
}

/**
 * Custom error thrown when function parsing fails across all strategies.
 */
export class JSAnalystParseError extends Error {
  public readonly pos: number
  public readonly length: number
  public readonly strategy: string

  constructor(
    message: string,
    public readonly bestDetail: ParseErrorDetail,
    public readonly parseErrors: ParseErrorDetail[],
  ) {
    super(message)
    this.name = 'JSAnalystParseError'
    this.pos = bestDetail.pos
    this.length = bestDetail.length
    this.strategy = bestDetail.strategy
  }
}

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
   * @throws {JSAnalystParseError} If all parsing attempts fail.
   */
  parseFunctionSource(source: string, options: ParseOptions = {}): ParseResult {
    const details: ParseErrorDetail[] = []
    const requestedKinds = options.kind
      ? Array.isArray(options.kind)
        ? options.kind
        : [options.kind]
      : []

    // Sort strategies: prioritize those matching the requested kind
    const strategies = [...WRAP_STRATEGIES].sort((a, b) => {
      const aMatches = a.kind && requestedKinds.includes(a.kind) ? 1 : 0
      const bMatches = b.kind && requestedKinds.includes(b.kind) ? 1 : 0
      return bMatches - aMatches
    })

    for (const strategy of strategies) {
      try {
        const wrapped = strategy.wrap(source)
        const ast = this.parse(wrapped, options)
        return {
          ast,
          offset: strategy.offset,
          engine: this.name,
        }
      } catch (err) {
        const error = err as any
        const wrappedPos = typeof error.pos === 'number' ? error.pos : 0
        const pos = Math.max(0, wrappedPos - strategy.offset)
        
        let length = 0
        if (error.loc && typeof error.loc.end === 'number' && typeof error.loc.start === 'number') {
          length = error.loc.end - error.loc.start
        } else if (typeof error.raisedAt === 'number') {
          length = Math.max(1, error.raisedAt - wrappedPos)
        } else {
          // Fallback to 1 if we can't determine length but have a pos
          length = 1
        }

        details.push({
          strategy: strategy.name,
          message: error.message,
          error: error as Error,
          pos,
          length,
        })
      }
    }

    // Heuristic: pick the "best" error to show in the main message.
    // 1. If there's an error from a strategy matching requested kind, pick it.
    // 2. Otherwise, prefer the error from 'Direct' or 'Expression' as they are least 'distorted'.
    let bestDetail = details.find((d) => {
      const s = WRAP_STRATEGIES.find((st) => st.name === d.strategy)
      return s?.kind && requestedKinds.includes(s.kind)
    })

    if (!bestDetail) {
      bestDetail =
        details.find((d) => d.strategy === 'Direct') ||
        details.find((d) => d.strategy === 'Expression') ||
        details[0]
    }

    const msg = `Failed to parse function source using engine '${this.name}'. Best guess (${bestDetail.strategy}): ${bestDetail.message}`

    throw new JSAnalystParseError(msg, bestDetail, details)
  }
}
