// ============================================================
//  src/core/body-info.ts — Function Body Metadata Wrapper
// ============================================================

import type { ASTNode, IBodyInfo, BlockStatement } from '../types.js'
import { findInScope } from '../ast/traverse.js'
import { query as astQuery, has as astHas } from '../ast/query.js'
import { sliceNode, sliceBlockBody } from '../utils/source.js'

/**
 * Implementation of {@link IBodyInfo} that provides metadata and analysis
 * for a function body.
 *
 * It abstracts the differences between block statements and arrow function
 * expression bodies, providing a unified interface for statement analysis
 * and AST querying.
 */
export class BodyInfo implements IBodyInfo {
  private readonly _node: ASTNode
  private readonly _funcNode: ASTNode
  private readonly _source: string
  private readonly _offset: number

  // Cache
  private _returns?: ASTNode[]

  /**
   * Internal constructor for BodyInfo.
   *
   * @param bodyNode - The AST node of the body.
   * @param funcNode - The parent function node.
   * @param source - The original source code string.
   * @param offset - The character offset used during parsing.
   * @internal
   */
  constructor(
    bodyNode: ASTNode | undefined,
    funcNode: ASTNode,
    source: string,
    offset: number
  ) {
    this._node = bodyNode || ({ type: 'EmptyBody' } as any)
    this._funcNode = funcNode
    this._source = source
    this._offset = offset
  }

  /** The underlying AST node of the body. */
  get node(): ASTNode {
    return this._node
  }

  /** Whether the body is a block statement (wrapped in braces). */
  get isBlock(): boolean {
    return this._node.type === 'BlockStatement'
  }

  /** Whether the body is a single expression (common in arrow functions). */
  get isExpression(): boolean {
    return this._node.type !== 'EmptyBody' && !this.isBlock
  }

  /** Whether the function body is empty (e.g., in some declarations). */
  get isEmpty(): boolean {
    return this._node.type === 'EmptyBody'
  }

  /**
   * The list of top-level statements within the body.
   *
   * For expression bodies, this returns a single virtual `ReturnStatement`
   * wrapping the expression.
   */
  get statements(): ASTNode[] {
    if (this.isEmpty) return []
    if (this.isBlock) {
      return (this._node as unknown as BlockStatement).body
    }
    // Arrow function expression body, wrapped as a virtual return
    return [
      {
        type: 'ReturnStatement',
        argument: this._node,
        _virtual: true,
        start: this._node.start,
        end: this._node.end,
      } as ASTNode,
    ]
  }

  /** The number of top-level statements in the body. */
  get statementCount(): number {
    return this.statements.length
  }

  /**
   * The raw source text of the function body.
   *
   * For blocks, it typically includes the content between the braces.
   */
  get text(): string | null {
    if (this.isEmpty) return null
    if (this.isBlock) {
      return sliceBlockBody(this._source, this._node, this._offset)
    }
    return sliceNode(this._source, this._node, this._offset)
  }

  /**
   * All return statements found within the current function's scope.
   *
   * This search is scope-aware and will not include return statements
   * from nested functions.
   */
  get returns(): ASTNode[] {
    if (!this._returns) {
      if (this.isEmpty) {
        this._returns = []
      } else if (this.isExpression) {
        // Expression body is an implicit return
        this._returns = [
          {
            type: 'ReturnStatement',
            argument: this._node,
            _virtual: true,
          } as ASTNode,
        ]
      } else {
        this._returns = findInScope(
          this._node,
          (n) => n.type === 'ReturnStatement',
          this._funcNode
        )
      }
    }
    return this._returns
  }

  /**
   * Searches for AST nodes matching the CSS-like selector within the function body.
   *
   * @param selector - The Esquery selector string.
   */
  query(selector: string): ASTNode[] {
    return astQuery(this._node, selector, true, this._funcNode)
  }

  /**
   * Checks if any AST nodes match the CSS-like selector within the function body.
   *
   * @param selector - The Esquery selector string.
   */
  has(selector: string): boolean {
    return astHas(this._node, selector, true, this._funcNode)
  }
}
