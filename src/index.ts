import { Analyzer } from './core/analyzer.js'
import type {
  AnalyzerOptions,
  ParseOptions,
  VerifySchema,
  VerifyResult,
} from './types.js'
import type { FunctionInfo } from './core/function-info.js'

// =================== 工厂函数 ===================

/**
 * 创建分析器实例（推荐用法）
 *
 * @example
 * const analyzer = createAnalyzer();
 * const fn = analyzer.parse('function add(a, b) { return a + b }');
 * console.log(fn.name);       // 'add'
 * console.log(fn.paramCount); // 2
 *
 * @example
 * // 指定引擎
 * const analyzer = createAnalyzer({ engine: 'acorn' });
 *
 * @example
 * // 自定义 WASM 切换阈值
 * const analyzer = createAnalyzer({ threshold: 100 * 1024 });
 */
export function createAnalyzer(options?: AnalyzerOptions): Analyzer {
  return new Analyzer(options)
}

// =================== 便捷快速调用 ===================

let _default: Analyzer | null = null

function getDefault(): Analyzer {
  if (!_default) {
    _default = new Analyzer({ warmup: true })
  }
  return _default
}

/**
 * 快速解析（使用默认单例分析器）
 *
 * @example
 * const fn = parse('(a, b) => a + b');
 * fn.isArrow // true
 */
export function parse(
  input: string | Function,
  options?: ParseOptions
): FunctionInfo {
  return getDefault().parse(input, options)
}

/**
 * 快速解析所有函数
 */
export function parseAll(
  source: string,
  options?: ParseOptions
): FunctionInfo[] {
  return getDefault().parseAll(source, options)
}

/**
 * 快速验证
 *
 * @example
 * const result = verify(
 *   'function add(a, b) { return a + b }',
 *   { name: 'add', paramCount: 2 }
 * );
 * result.passed // true
 */
export function verify(
  input: string | Function,
  schema: VerifySchema,
  options?: ParseOptions
): VerifyResult {
  return getDefault().verify(input, schema, options)
}

// =================== 类 & 核心导出 ===================

export { Analyzer } from './core/analyzer.js'
export { FunctionInfo } from './core/function-info.js'
export { ParamInfo } from './core/param-info.js'
export { BodyInfo } from './core/body-info.js'
export { createVerifier } from './core/verify.js'

// =================== 解析器适配器 ===================

export { ParserAdapter } from './parser/adapter.js'
export { AcornAdapter } from './parser/acorn-adapter.js'
export { OxcAdapter } from './parser/oxc-adapter.js'
export { AutoAdapter } from './parser/auto-adapter.js'

// =================== AST 工具 ===================

export {
  findFirst,
  findAll,
  findInScope,
  isFunctionNode,
} from './ast/traverse.js'
export { query, has } from './ast/query.js'
export * as helpers from './ast/helpers.js'

// =================== 工具函数 ===================

export { tsTypeToString } from './utils/ts-type.js'
export {
  sliceNode,
  sliceBlockBody,
  detectTypeScript,
  countLines,
  byteSize,
  stripComments,
  offsetToLineColumn,
} from './utils/source.js'

// =================== 类型导出 ===================

export type {
  // AST
  ASTNode,
  FunctionNode,
  Identifier,
  BlockStatement,
  ReturnStatement,
  BinaryExpression,
  CallExpression,
  MemberExpression,
  Literal,
  SourceLocation,
  Position,

  // 配置
  AnalyzerOptions,
  ParseOptions,
  ParseResult,
  EngineName,
  EngineOption,

  // 验证
  VerifySchema,
  ParamSchema,
  BodySchema,
  VerifyResult,
  VerifyFailure,
  Matcher,

  // 接口
  IFunctionInfo,
  IParamInfo,
  IBodyInfo,
  IReturnHelper,

  // JSON
  FunctionInfoJSON,
  ParamInfoJSON,
} from './types.js'
