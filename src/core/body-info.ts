// ============================================================
//  src/core/body-info.ts — 函数体信息封装
// ============================================================

import type { ASTNode, IBodyInfo, BlockStatement } from '../types.js';
import { findInScope } from '../ast/traverse.js';
import { query as astQuery, has as astHas } from '../ast/query.js';
import { sliceNode, sliceBlockBody } from '../utils/source.js';

export class BodyInfo implements IBodyInfo {
  private readonly _node: ASTNode;
  private readonly _funcNode: ASTNode;
  private readonly _source: string;
  private readonly _offset: number;

  // 缓存
  private _returns?: ASTNode[];

  constructor(
    bodyNode: ASTNode,
    funcNode: ASTNode,
    source: string,
    offset: number,
  ) {
    this._node = bodyNode;
    this._funcNode = funcNode;
    this._source = source;
    this._offset = offset;
  }

  get node(): ASTNode {
    return this._node;
  }

  get isBlock(): boolean {
    return this._node.type === 'BlockStatement';
  }

  get isExpression(): boolean {
    return !this.isBlock;
  }

  /**
   * 语句列表
   *
   * - 块体: 直接返回 BlockStatement.body
   * - 表达式体: 包装成虚拟 ReturnStatement
   */
  get statements(): ASTNode[] {
    if (this.isBlock) {
      return (this._node as unknown as BlockStatement).body;
    }
    // 箭头函数表达式体，包装成虚拟 return
    return [{
      type: 'ReturnStatement',
      argument: this._node,
      _virtual: true,
      start: this._node.start,
      end: this._node.end,
    } as ASTNode];
  }

  get statementCount(): number {
    return this.statements.length;
  }

  /**
   * 函数体源码文本
   */
  get text(): string | null {
    if (this.isBlock) {
      return sliceBlockBody(this._source, this._node, this._offset);
    }
    return sliceNode(this._source, this._node, this._offset);
  }

  /**
   * 当前函数作用域内的所有 return 语句
   *
   * 不包含嵌套函数内的 return
   */
  get returns(): ASTNode[] {
    if (!this._returns) {
      if (this.isExpression) {
        // 表达式体就是一个隐式 return
        this._returns = [{
          type: 'ReturnStatement',
          argument: this._node,
          _virtual: true,
        } as ASTNode];
      } else {
        this._returns = findInScope(
          this._node,
          (n) => n.type === 'ReturnStatement',
          this._funcNode,
        );
      }
    }
    return this._returns;
  }

  /**
   * 在当前函数作用域内查询
   */
  query(selector: string): ASTNode[] {
    return astQuery(this._node, selector, true, this._funcNode);
  }

  /**
   * 在当前函数作用域内是否包含
   */
  has(selector: string): boolean {
    return astHas(this._node, selector, true, this._funcNode);
  }
}
