// ============================================================
//  src/core/analyzer.ts — Analyzer 主类
// ============================================================

import type {
  AnalyzerOptions, ParseOptions,
  VerifySchema, VerifyResult, ParseResult,
} from '../types.js';
import { AutoAdapter } from '../parser/auto-adapter.js';
import { AcornAdapter } from '../parser/acorn-adapter.js';
import { OxcAdapter } from '../parser/oxc-adapter.js';
import type { ParserAdapter } from '../parser/adapter.js';
import { FunctionInfo } from './function-info.js';
import { findFirst, findAll, isFunctionNode } from '../ast/traverse.js';
import { detectTypeScript } from '../utils/source.js';

/**
 * 兼容 AutoAdapter 接口的包装
 */
interface AdapterBridge {
  warmup(): Promise<void> | void;
  parseFunctionSource(source: string, options: ParseOptions): ParseResult;
  getEngineStatus(): { acorn: boolean; oxc: boolean };
}

export class Analyzer {
  private readonly _bridge: AdapterBridge;
  private readonly _options: Required<AnalyzerOptions>;

  constructor(options: AnalyzerOptions = {}) {
    this._options = {
      threshold: options.threshold ?? 50 * 1024,
      warmup: options.warmup ?? true,
      engine: options.engine ?? 'auto',
    };

    if (this._options.engine === 'acorn') {
      this._bridge = this._wrapSingle(new AcornAdapter());
    } else if (this._options.engine === 'oxc') {
      this._bridge = this._wrapSingle(new OxcAdapter());
    } else {
      const auto = new AutoAdapter({ threshold: this._options.threshold });
      if (this._options.warmup) auto.warmup();
      this._bridge = this._wrapAuto(auto);
    }
  }

  // ---- 适配器桥接 ----

  private _wrapSingle(adapter: ParserAdapter): AdapterBridge {
    return {
      warmup: () => adapter.init(),
      parseFunctionSource: (source, options) =>
        this._tryParse(adapter, source, options),
      getEngineStatus: () => ({
        acorn: adapter.name === 'acorn' && adapter.ready,
        oxc: adapter.name === 'oxc' && adapter.ready,
      }),
    };
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
    };
  }

  /**
   * 多种包装策略尝试解析
   */
  private _tryParse(
    adapter: ParserAdapter,
    source: string,
    options: ParseOptions,
  ): ParseResult {
    const strategies = [
      { wrap: (s: string) => s,                 offset: 0 },
      { wrap: (s: string) => `(${s})`,          offset: 1 },
      { wrap: (s: string) => `({${s}})`,        offset: 2 },
      { wrap: (s: string) => `(class{${s}})`,   offset: 7 },
    ];

    const errors: Error[] = [];

    for (const { wrap, offset } of strategies) {
      try {
        const ast = adapter.parse(wrap(source), options);
        return { ast, offset, engine: adapter.name };
      } catch (e) {
        errors.push(e as Error);
      }
    }

    const msg = [
      'Failed to parse function source.',
      ...errors.map((e, i) => `  Attempt ${i + 1}: ${e.message}`),
    ].join('\n');

    const err = new Error(msg);
    (err as any).parseErrors = errors;
    throw err;
  }

  // ============ 公开 API ============

  /**
   * 解析单个函数
   *
   * @example
   * const fn = analyzer.parse('function add(a, b) { return a + b }');
   * fn.name       // 'add'
   * fn.paramCount // 2
   */
  parse(input: string | Function, options: ParseOptions = {}): FunctionInfo {
    const source = typeof input === 'function' ? input.toString() : String(input);
    const isTS = options.ts ?? detectTypeScript(source);

    const { ast, offset, engine } = this._bridge.parseFunctionSource(
      source,
      { ...options, ts: isTS, sourceType: options.sourceType ?? 'script' },
    );

    const nodes = findAll(ast, isFunctionNode);
    if (nodes.length === 0) {
      throw new Error('No function node found in parsed AST');
    }

    const seenNodes = new Set<ASTNode>();
    for (const node of nodes) {
      if (seenNodes.has(node)) continue;
      const info = new FunctionInfo(node, source, offset, engine);
      if (info.node !== node) {
        seenNodes.add(info.node);
      }
      if (this._matchFilters(info, options)) {
        return info;
      }
    }

    throw new Error('No function matches the specified filters');
  }

  /**
   * 解析源码中的所有函数
   *
   * @example
   * const fns = analyzer.parseAll(fileContent);
   * fns.forEach(fn => console.log(fn.name));
   */
  parseAll(source: string, options: ParseOptions = {}): FunctionInfo[] {
    const isTS = options.ts ?? detectTypeScript(source);

    const { ast, offset, engine } = this._bridge.parseFunctionSource(
      source,
      { ...options, ts: isTS, sourceType: options.sourceType ?? 'module' },
    );

    const nodes = findAll(ast, isFunctionNode);
    const result: FunctionInfo[] = [];
    const seenNodes = new Set<ASTNode>();

    for (const node of nodes) {
      if (seenNodes.has(node)) continue;
      const info = new FunctionInfo(node, source, offset, engine);
      if (info.node !== node) {
        seenNodes.add(info.node);
      }
      if (this._matchFilters(info, options)) {
        result.push(info);
      }
    }

    return result;
  }

  private _matchFilters(info: FunctionInfo, options: ParseOptions): boolean {
    if (options.kind) {
      const kinds = Array.isArray(options.kind) ? options.kind : [options.kind];
      if (!kinds.includes(info.kind)) return false;
    }
    if (options.syntax) {
      const syntaxes = Array.isArray(options.syntax) ? options.syntax : [options.syntax];
      if (!syntaxes.includes(info.syntax)) return false;
    }
    return true;
  }

  /**
   * 解析并立即验证
   *
   * @example
   * const result = analyzer.verify(
   *   'function add(a, b) { return a + b }',
   *   { name: 'add', paramCount: 2 }
   * );
   * result.passed // true
   */
  verify(
    input: string | Function,
    schema: VerifySchema,
    parseOptions: ParseOptions = {},
  ): VerifyResult {
    return this.parse(input, parseOptions).verify(schema);
  }

  /** 手动预热 WASM */
  async warmup(): Promise<void> {
    await this._bridge.warmup();
  }

  /** 当前可用引擎 */
  get engines(): { acorn: boolean; oxc: boolean } {
    return this._bridge.getEngineStatus();
  }
}
