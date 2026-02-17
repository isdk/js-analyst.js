// ============================================================
//  src/parser/adapter.ts — 解析器适配器抽象基类
// ============================================================

import type { ASTNode, EngineName, ParseOptions } from '../types.js';

/**
 * 解析器适配器接口
 *
 * 所有具体解析器（acorn / oxc）都实现此接口，
 * 上层代码只依赖此抽象，不依赖具体实现。
 */
export abstract class ParserAdapter {
  readonly name: EngineName;
  ready: boolean;

  constructor(name: EngineName) {
    this.name = name;
    this.ready = false;
  }

  /** 异步初始化（WASM 解析器需要） */
  async init(): Promise<void> {
    this.ready = true;
  }

  /** 同步初始化（JS 解析器） */
  initSync(): void {
    this.ready = true;
  }

  /** 解析源码，返回 ESTree AST 根节点 */
  abstract parse(source: string, options?: ParseOptions): ASTNode;
}
