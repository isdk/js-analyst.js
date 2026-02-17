// ============================================================
//  src/parser/acorn-adapter.ts — Acorn Parser Adapter
// ============================================================

import * as acorn from 'acorn'
import tsPlugin from 'acorn-typescript'
import { ParserAdapter } from './adapter.js'
import type { ASTNode, ParseOptions } from '../types.js'

/**
 * Parser adapter for the Acorn engine.
 *
 * This adapter uses the Acorn library and its TypeScript plugin to
 * provide standard-compliant JavaScript and TypeScript parsing.
 */
export class AcornAdapter extends ParserAdapter {
  private readonly jsParser: typeof acorn.Parser
  private readonly tsParser: typeof acorn.Parser

  constructor() {
    super('acorn')
    this.jsParser = acorn.Parser
    this.tsParser = acorn.Parser.extend(tsPlugin() as any)
    this.ready = true // JS-based parser is immediately ready
  }

  /**
   * Parses the source using Acorn.
   *
   * @param source - The source code to parse.
   * @param options - Configuration including TS support and source type.
   */
  parse(source: string, options: ParseOptions = {}): ASTNode {
    const parser = options.ts ? this.tsParser : this.jsParser

    return parser.parse(source, {
      ecmaVersion: 'latest' as any,
      sourceType: (options.sourceType ??
        'module') as acorn.Options['sourceType'],
      locations: true,
      ranges: true,
    }) as unknown as ASTNode
  }
}
