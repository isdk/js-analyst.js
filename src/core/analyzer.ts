// ============================================================
//  src/core/analyzer.ts — Main Analyzer Class
// ============================================================

import type {
  AnalyzerOptions,
  ParseOptions,
  VerifySchema,
  VerifyResult,
  ParseResult,
  ASTNode,
} from '../types.js'
import { AutoAdapter } from '../parser/auto-adapter.js'
import { AcornAdapter } from '../parser/acorn-adapter.js'
import { OxcAdapter } from '../parser/oxc-adapter.js'
import type { ParserAdapter } from '../parser/adapter.js'
import { FunctionInfo } from './function-info.js'
import { findAll, isFunctionNode } from '../ast/traverse.js'

/**
 * Internal bridge to unify different adapter interfaces.
 */
interface AdapterBridge {
  warmup(): Promise<void> | void
  parseFunctionSource(source: string, options: ParseOptions): ParseResult
  getEngineStatus(): { acorn: boolean; oxc: boolean }
}

/**
 * The primary class for analyzing JavaScript and TypeScript code.
 *
 * `Analyzer` handles engine selection (Acorn or high-performance OXC),
 * source code normalization, and provides high-level APIs for extracting
 * and validating function metadata.
 */
export class Analyzer {
  private readonly _bridge: AdapterBridge
  private readonly _options: Required<AnalyzerOptions>

  /**
   * Creates a new Analyzer instance.
   *
   * @param options - Configuration options for the analyzer.
   */
  constructor(options: AnalyzerOptions = {}) {
    this._options = {
      threshold: options.threshold ?? 50 * 1024,
      warmup: options.warmup ?? true,
      engine: options.engine ?? 'auto',
    }

    if (this._options.engine === 'acorn') {
      this._bridge = this._wrapSingle(new AcornAdapter())
    } else if (this._options.engine === 'oxc') {
      this._bridge = this._wrapSingle(new OxcAdapter())
    } else {
      const auto = new AutoAdapter({ threshold: this._options.threshold })
      if (this._options.warmup) auto.warmup()
      this._bridge = this._wrapAuto(auto)
    }
  }

  // ---- Adapter Bridging ----

  private _wrapSingle(adapter: ParserAdapter): AdapterBridge {
    return {
      warmup: () => adapter.init(),
      parseFunctionSource: (source, options) =>
        adapter.parseFunctionSource(source, options),
      getEngineStatus: () => ({
        acorn: adapter.name === 'acorn' && adapter.ready,
        oxc: adapter.name === 'oxc' && adapter.ready,
      }),
    }
  }

  private _wrapAuto(auto: AutoAdapter): AdapterBridge {
    return {
      warmup: () => auto.oxc.init(),
      parseFunctionSource: (source, options) =>
        auto.parseFunctionSource(source, options),
      getEngineStatus: () => ({
        acorn: auto.acorn.ready,
        oxc: auto.oxc.ready,
      }),
    }
  }

  // ============ Public API ============

  /**
   * Parses the input source and returns the first matching function.
   *
   * @param input - The source code string, a function reference, or a code snippet.
   * @param options - Configuration options for parsing and filtering results.
   * @returns A {@link FunctionInfo} instance containing metadata about the detected function.
   * @throws {Error} If no function node is found or if none match the specified filters.
   *
   * @example
   * ```typescript
   * const analyzer = new Analyzer();
   * const fn = analyzer.parse('function add(a, b) { return a + b }');
   * console.log(fn.name);       // 'add'
   * console.log(fn.paramCount); // 2
   * ```
   */
  parse(input: string | Function, options: ParseOptions = {}): FunctionInfo {
    const source =
      typeof input === 'function' ? input.toString() : String(input)
    const isTS = options.ts ?? true

    const { ast, offset, engine } = this._bridge.parseFunctionSource(source, {
      ...options,
      ts: isTS,
      sourceType: options.sourceType ?? 'script',
    })

    const nodes = findAll(ast, isFunctionNode)
    if (nodes.length === 0) {
      throw new Error('No function node found in parsed AST')
    }

    const seenNodes = new Set<ASTNode>()
    for (const node of nodes) {
      if (seenNodes.has(node)) continue
      const info = new FunctionInfo(node, source, offset, engine)
      if (info.node !== node) {
        seenNodes.add(info.node)
      }
      if (this._matchFilters(info, options)) {
        return info
      }
    }

    throw new Error('No function matches the specified filters')
  }

  /**
   * Parses all functions found within the provided source code.
   *
   * @param source - The source code string to analyze.
   * @param options - Configuration options for parsing and filtering.
   * @returns An array of {@link FunctionInfo} for each detected function.
   *
   * @example
   * ```typescript
   * const fns = analyzer.parseAll(fileContent);
   * fns.forEach(fn => console.log(fn.name));
   * ```
   */
  parseAll(source: string, options: ParseOptions = {}): FunctionInfo[] {
    const isTS = options.ts ?? true

    const { ast, offset, engine } = this._bridge.parseFunctionSource(source, {
      ...options,
      ts: isTS,
      sourceType: options.sourceType ?? 'module',
    })

    const nodes = findAll(ast, isFunctionNode)
    const result: FunctionInfo[] = []
    const seenNodes = new Set<ASTNode>()

    for (const node of nodes) {
      if (seenNodes.has(node)) continue
      const info = new FunctionInfo(node, source, offset, engine)
      if (info.node !== node) {
        seenNodes.add(info.node)
      }
      if (this._matchFilters(info, options)) {
        result.push(info)
      }
    }

    return result
  }

  private _matchFilters(info: FunctionInfo, options: ParseOptions): boolean {
    if (options.kind) {
      const kinds = Array.isArray(options.kind) ? options.kind : [options.kind]
      if (!kinds.includes(info.kind)) return false
    }
    if (options.syntax) {
      const syntaxes = Array.isArray(options.syntax)
        ? options.syntax
        : [options.syntax]
      if (!syntaxes.includes(info.syntax)) return false
    }
    return true
  }

  /**
   * Parses and immediately verifies a function against a schema.
   *
   * @param input - The source code or function to verify.
   * @param schema - The verification schema.
   * @param parseOptions - Optional parsing configuration.
   * @returns The verification result.
   */
  verify(
    input: string | Function,
    schema: VerifySchema,
    parseOptions: ParseOptions = {}
  ): VerifyResult {
    return this.parse(input, parseOptions).verify(schema)
  }

  /**
   * Manually warms up the WASM-based parser (OXC).
   */
  async warmup(): Promise<void> {
    await this._bridge.warmup()
  }

  /**
   * Gets the status of available parsing engines.
   */
  get engines(): { acorn: boolean; oxc: boolean } {
    return this._bridge.getEngineStatus()
  }
}
