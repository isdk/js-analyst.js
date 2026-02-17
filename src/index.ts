import { Analyzer } from './core/analyzer.js'
import type {
  AnalyzerOptions,
  ParseOptions,
  VerifySchema,
  VerifyResult,
} from './types.js'
import type { FunctionInfo } from './core/function-info.js'

// =================== Factory Functions ===================

/**
 * Creates a new Analyzer instance.
 *
 * This is the recommended way to instantiate the analyzer with custom options.
 *
 * @param options - Configuration options for the analyzer.
 * @returns A new {@link Analyzer} instance.
 *
 * @example
 * ```typescript
 * const analyzer = createAnalyzer();
 * const fn = analyzer.parse('function add(a, b) { return a + b }');
 * console.log(fn.name);       // 'add'
 * console.log(fn.paramCount); // 2
 * ```
 *
 * @example
 * // Specify a specific engine
 * const analyzer = createAnalyzer({ engine: 'acorn' });
 *
 * @example
 * // Custom WASM switching threshold
 * const analyzer = createAnalyzer({ threshold: 100 * 1024 });
 */
export function createAnalyzer(options?: AnalyzerOptions): Analyzer {
  return new Analyzer(options)
}

// =================== Quick Convenience APIs ===================

let _default: Analyzer | null = null

/**
 * Gets the default singleton Analyzer instance.
 * @internal
 */
function getDefault(): Analyzer {
  if (!_default) {
    _default = new Analyzer({ warmup: true })
  }
  return _default
}

/**
 * Quickly parses a function using a default singleton analyzer.
 *
 * @param input - The source code string or a function reference.
 * @param options - Optional parsing configuration.
 * @returns Metadata for the detected function.
 *
 * @example
 * ```typescript
 * const fn = parse('(a, b) => a + b');
 * console.log(fn.isArrow); // true
 * ```
 */
export function parse(
  input: string | Function,
  options?: ParseOptions
): FunctionInfo {
  return getDefault().parse(input, options)
}

/**
 * Quickly parses all functions in a source string using a default singleton analyzer.
 *
 * @param source - The source code string.
 * @param options - Optional parsing configuration.
 * @returns An array of {@link FunctionInfo} for each detected function.
 */
export function parseAll(
  source: string,
  options?: ParseOptions
): FunctionInfo[] {
  return getDefault().parseAll(source, options)
}

/**
 * Quickly verifies a function against a schema using a default singleton analyzer.
 *
 * @param input - The source code string or a function reference.
 * @param schema - The validation schema to check against.
 * @param options - Optional parsing configuration.
 * @returns The verification result.
 *
 * @example
 * ```typescript
 * const result = verify(
 *   'function add(a, b) { return a + b }',
 *   { name: 'add', paramCount: 2 }
 * );
 * console.log(result.passed); // true
 * ```
 */
export function verify(
  input: string | Function,
  schema: VerifySchema,
  options?: ParseOptions
): VerifyResult {
  return getDefault().verify(input, schema, options)
}

// =================== Core Classes & Exports ===================

export { Analyzer } from './core/analyzer.js'
export { FunctionInfo } from './core/function-info.js'
export { ParamInfo } from './core/param-info.js'
export { BodyInfo } from './core/body-info.js'
export { createVerifier } from './core/verify.js'

// =================== Parser Adapters ===================

export { ParserAdapter } from './parser/adapter.js'
export { AcornAdapter } from './parser/acorn-adapter.js'
export { OxcAdapter } from './parser/oxc-adapter.js'
export { AutoAdapter } from './parser/auto-adapter.js'

// =================== AST Utilities ===================

export {
  findFirst,
  findAll,
  findInScope,
  isFunctionNode,
} from './ast/traverse.js'
export { query, has } from './ast/query.js'
export * as helpers from './ast/helpers.js'

// =================== Utility Functions ===================

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

// =================== Type Exports ===================

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

  // Config
  AnalyzerOptions,
  ParseOptions,
  ParseResult,
  EngineName,
  EngineOption,

  // Verification
  VerifySchema,
  ParamSchema,
  BodySchema,
  VerifyResult,
  VerifyFailure,
  Matcher,

  // Interfaces
  IFunctionInfo,
  IParamInfo,
  IBodyInfo,
  IReturnHelper,

  // JSON
  FunctionInfoJSON,
  ParamInfoJSON,
} from './types.js'
