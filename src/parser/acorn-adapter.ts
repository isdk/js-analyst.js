// ============================================================
//  src/parser/acorn-adapter.ts
// ============================================================

import * as acorn from 'acorn'
import tsPlugin from 'acorn-typescript'
import { ParserAdapter } from './adapter.js'
import type { ASTNode, ParseOptions } from '../types.js'

export class AcornAdapter extends ParserAdapter {
  private readonly jsParser: typeof acorn.Parser
  private readonly tsParser: typeof acorn.Parser

  constructor() {
    super('acorn')
    this.jsParser = acorn.Parser
    this.tsParser = acorn.Parser.extend(tsPlugin() as any)
    this.ready = true // JS 解析器，同步可用
  }

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
