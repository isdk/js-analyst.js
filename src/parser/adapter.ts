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
  /** The functional kind(s) associated with this strategy, used for filtering. */
  kind?: FunctionKind | FunctionKind[]
  /** Whether this strategy is for async functions. */
  async?: boolean
  /** Whether this strategy is for generator functions. */
  generator?: boolean
}

export const WRAP_STRATEGIES: WrapStrategy[] = [
  { name: 'Direct', wrap: (s) => s, offset: 0 }, // Generic: try for everything
  { name: 'Expression', wrap: (s) => `(${s})`, offset: 1 }, // Generic: try for everything
  {
    name: 'Method',
    wrap: (s) => `({${s}})`,
    offset: 2,
    kind: ['method', 'getter', 'setter', 'constructor'],
  },
  {
    name: 'ClassMethod',
    wrap: (s) => `(class{${s}})`,
    offset: 7,
    kind: ['method', 'getter', 'setter', 'constructor'],
  },
  {
    name: 'FunctionExpression',
    wrap: (s) => `(function(){${s}})`,
    offset: 12,
    kind: 'function',
    async: false,
    generator: false,
  },
  {
    name: 'AsyncFunctionExpression',
    wrap: (s) => `(async function(){${s}})`,
    offset: 18,
    kind: 'function',
    async: true,
    generator: false,
  },
  {
    name: 'GeneratorExpression',
    wrap: (s) => `(function*(){${s}})`,
    offset: 13,
    kind: 'function',
    async: false,
    generator: true,
  },
  {
    name: 'AsyncGeneratorExpression',
    wrap: (s) => `(async function*(){${s}})`,
    offset: 19,
    kind: 'function',
    async: true,
    generator: true,
  },
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
    const requestedKinds = (options.strategyKind || options.kind)
      ? Array.isArray(options.strategyKind || options.kind)
        ? (options.strategyKind || options.kind) as FunctionKind[]
        : [options.strategyKind || options.kind] as FunctionKind[]
      : []

    // 1. Filter and sort strategies based on requested kinds and hints
    let strategies = [...WRAP_STRATEGIES]
    if (requestedKinds.length > 0 || options.strategyAsync !== undefined || options.strategyGenerator !== undefined) {
      // Filter: Keep strategies that match requested kind OR are generic (no kind)
      // AND match async/generator hints if provided
      strategies = strategies.filter((s) => {
        // Filter by kind
        if (requestedKinds.length > 0 && s.kind) {
          const sKinds = Array.isArray(s.kind) ? s.kind : [s.kind]
          if (!sKinds.some((k) => requestedKinds.includes(k))) return false
        }

        // Filter by async
        if (s.async !== undefined) {
          const targetAsync = options.strategyAsync ?? false
          if (s.async !== targetAsync) return false
        }

        // Filter by generator
        if (s.generator !== undefined) {
          const targetGenerator = options.strategyGenerator ?? false
          if (s.generator !== targetGenerator) return false
        }

        return true
      })

      // Sort: Prioritize strategies matching hints
      const isMethodLike = requestedKinds.some((k) =>
        ['method', 'getter', 'setter', 'constructor'].includes(k)
      )

      strategies.sort((a, b) => {
        // Direct strategy always comes first
        if (a.name === 'Direct') return -1
        if (b.name === 'Direct') return 1

        // Kind match score
        const aKindMatch =
          a.kind &&
          (Array.isArray(a.kind)
            ? a.kind.some((k) => requestedKinds.includes(k))
            : requestedKinds.includes(a.kind as FunctionKind))
        const bKindMatch =
          b.kind &&
          (Array.isArray(b.kind)
            ? b.kind.some((k) => requestedKinds.includes(k))
            : requestedKinds.includes(b.kind as FunctionKind))

        // Async/Generator match score
        const aHintMatch = 
          (options.strategyAsync !== undefined && a.async === options.strategyAsync) ||
          (options.strategyGenerator !== undefined && a.generator === options.strategyGenerator)
        const bHintMatch = 
          (options.strategyAsync !== undefined && b.async === options.strategyAsync) ||
          (options.strategyGenerator !== undefined && b.generator === options.strategyGenerator)

        // Prioritize by kind match first if it's method-like
        if (isMethodLike) {
          if (aKindMatch && !bKindMatch) return -1
          if (!aKindMatch && bKindMatch) return 1
        } else {
          // For standard functions, generic strategies (like Expression) are often better 
          // unless a specific hint is given. But Direct is already handled above.
          if (aKindMatch && !bKindMatch) return 1
          if (!aKindMatch && bKindMatch) return -1
        }

        // Then prioritize by hints
        if (aHintMatch && !bHintMatch) return -1
        if (!aHintMatch && bHintMatch) return 1

        return 0
      })
    }

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
        if (
          error.loc &&
          typeof error.loc.end === 'number' &&
          typeof error.loc.start === 'number'
        ) {
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
    // 1. If there's an error from a strategy matching requested kind or hints, pick it.
    // 2. Otherwise, prefer the error from 'Direct' or 'Expression' as they are least 'distorted'.
    let bestDetail = details.find((d) => {
      const s = WRAP_STRATEGIES.find((st) => st.name === d.strategy)
      if (!s) return false
      
      const kindMatch = s.kind && (Array.isArray(s.kind) 
        ? s.kind.some(k => requestedKinds.includes(k))
        : requestedKinds.includes(s.kind as FunctionKind))
      
      const asyncMatch = options.strategyAsync !== undefined && s.async === options.strategyAsync
      const genMatch = options.strategyGenerator !== undefined && s.generator === options.strategyGenerator
      
      return kindMatch || asyncMatch || genMatch
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
