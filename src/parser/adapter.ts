// ============================================================
//  src/parser/adapter.ts — Parser Adapter Abstract Base
// ============================================================

import type { ASTNode, EngineName, ParseOptions } from '../types.js'

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
}
