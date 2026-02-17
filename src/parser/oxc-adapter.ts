// ============================================================
//  src/parser/oxc-adapter.ts
// ============================================================

import { ParserAdapter } from './adapter.js';
import type { ASTNode, ParseOptions } from '../types.js';

/**
 * oxc-parser WASM 模块的动态导入类型
 *
 * 因为 @oxc-parser/wasm 是 optionalDependency，
 * 我们不能在顶层 import，需要动态导入。
 */
interface OxcModule {
  default: () => Promise<void>;
  parseSync: (
    source: string,
    options: { sourceFilename?: string; sourceType?: string },
  ) => {
    program: ASTNode;
    errors: Array<{ message: string; offset?: number }>;
  };
}

export class OxcAdapter extends ParserAdapter {
  private module: OxcModule | null = null;

  constructor() {
    super('oxc');
  }

  async init(): Promise<void> {
    if (this.ready) return;

    try {
      // 动态导入，避免在未安装时报错
      this.module = await import('@oxc-parser/wasm') as unknown as OxcModule;
      await this.module.default();
      this.ready = true;
    } catch (err) {
      this.ready = false;
      throw new Error(
        `Failed to initialize @oxc-parser/wasm. ` +
        `Make sure it is installed: npm install @oxc-parser/wasm\n` +
        `Original error: ${(err as Error).message}`,
      );
    }
  }

  parse(source: string, options: ParseOptions = {}): ASTNode {
    if (!this.ready || !this.module) {
      throw new Error('OxcAdapter not initialized. Call init() first.');
    }

    const result = this.module.parseSync(source, {
      sourceFilename: options.sourceFilename
        ?? (options.ts ? 'input.ts' : 'input.js'),
      sourceType: options.sourceType ?? 'module',
    });

    if (result.errors.length > 0) {
      const first = result.errors[0]!;
      const err = new SyntaxError(first.message);
      (err as any).pos = first.offset;
      throw err;
    }

    return result.program;
  }
}
