// ============================================================
//  src/types.ts — Global Type Definitions
// ============================================================

// =================== AST Nodes ===================

/**
 * Represents a base ESTree AST node.
 *
 * This interface provides compatibility between different parsers such as
 * Acorn (JavaScript) and OXC (WASM-based high-performance parser).
 */
export interface ASTNode {
  /** The type of the AST node (e.g., 'Identifier', 'FunctionDeclaration'). */
  type: string
  /** The 0-based character offset where the node starts. */
  start?: number
  /** The 0-based character offset where the node ends. */
  end?: number
  /** Detailed line and column information for the node's location in source. */
  loc?: SourceLocation
  /** The [start, end] character range offsets of the node. */
  range?: [number, number]
  /** Additional parser-specific extension properties. */
  [key: string]: unknown
}

/**
 * Represents the source location of an AST node.
 */
export interface SourceLocation {
  /** The starting position of the node. */
  start: Position
  /** The ending position of the node. */
  end: Position
}

/**
 * Represents a position within the source code.
 */
export interface Position {
  /** The 1-based line number. */
  line: number
  /** The 0-based column number. */
  column: number
}

// ---- Concrete Node Types ----

/**
 * Represents an identifier in the AST.
 */
export interface Identifier extends ASTNode {
  type: 'Identifier'
  /** The name of the identifier. */
  name: string
  /** Optional TypeScript type annotation associated with this identifier. */
  typeAnnotation?: TSTypeAnnotationWrapper
}

/**
 * Represents a function-related node (Declaration, Expression, or Arrow).
 */
export interface FunctionNode extends ASTNode {
  type: 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression'
  /** The identifier of the function, or null if anonymous. */
  id?: Identifier | null
  /** The list of function parameters. */
  params: ASTNode[]
  /** The body of the function (BlockStatement or an Expression for arrows). */
  body: ASTNode
  /** Whether the function is marked as async. */
  async: boolean
  /** Whether the function is a generator function. */
  generator: boolean
  /** Whether the function is an arrow function with an expression body. */
  expression?: boolean
  /** Optional TypeScript return type annotation. */
  returnType?: TSTypeAnnotationWrapper
}

/**
 * Represents a block of statements wrapped in braces.
 */
export interface BlockStatement extends ASTNode {
  type: 'BlockStatement'
  /** The array of statements inside the block. */
  body: ASTNode[]
}

/**
 * Represents a return statement.
 */
export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement'
  /** The expression being returned, or null if returning nothing. */
  argument: ASTNode | null
}

/**
 * Represents a binary expression (e.g., a + b).
 */
export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression'
  /** The binary operator (e.g., '+', '-', '===', etc.). */
  operator: string
  /** The left-hand side operand. */
  left: ASTNode
  /** The right-hand side operand. */
  right: ASTNode
}

/**
 * Represents a function or method call expression.
 */
export interface CallExpression extends ASTNode {
  type: 'CallExpression'
  /** The expression being called. */
  callee: ASTNode
  /** The arguments passed to the call. */
  arguments: ASTNode[]
}

/**
 * Represents a member access expression (e.g., obj.prop or obj[prop]).
 */
export interface MemberExpression extends ASTNode {
  type: 'MemberExpression'
  /** The object being accessed. */
  object: ASTNode
  /** The property being accessed. */
  property: ASTNode
  /** Whether the access is computed (e.g., obj[prop]). */
  computed: boolean
}

/**
 * Represents a literal value (string, number, boolean, null, or RegExp).
 */
export interface Literal extends ASTNode {
  type: 'Literal'
  /** The raw value of the literal. */
  value: string | number | boolean | null | RegExp
  /** The original string representation of the literal in source code. */
  raw?: string
}

/**
 * Represents a rest element (e.g., ...args).
 */
export interface RestElement extends ASTNode {
  type: 'RestElement'
  /** The underlying argument of the rest element. */
  argument: ASTNode
}

/**
 * Represents an assignment pattern (e.g., a = 1 in parameters).
 */
export interface AssignmentPattern extends ASTNode {
  type: 'AssignmentPattern'
  /** The left side of the assignment. */
  left: ASTNode
  /** The right side (default value) of the assignment. */
  right: ASTNode
}

/**
 * Represents an object destructuring pattern.
 */
export interface ObjectPattern extends ASTNode {
  type: 'ObjectPattern'
  /** The properties within the object pattern. */
  properties: ASTNode[]
  /** Optional TypeScript type annotation. */
  typeAnnotation?: TSTypeAnnotationWrapper
}

/**
 * Represents an array destructuring pattern.
 */
export interface ArrayPattern extends ASTNode {
  type: 'ArrayPattern'
  /** The elements within the array pattern. */
  elements: (ASTNode | null)[]
}

/**
 * Represents a template literal (e.g., `hello ${name}`).
 */
export interface TemplateLiteral extends ASTNode {
  type: 'TemplateLiteral'
  /** The literal parts of the template. */
  quasis: ASTNode[]
  /** The expressions interpolated into the template. */
  expressions: ASTNode[]
}

// ---- TypeScript Specific Nodes ----

/**
 * Wrapper for TypeScript type annotations.
 */
export interface TSTypeAnnotationWrapper extends ASTNode {
  type: 'TSTypeAnnotation'
  /** The actual type node. */
  typeAnnotation: TSTypeNode
}

/**
 * Represents a TypeScript type node.
 */
export interface TSTypeNode extends ASTNode {
  // Common properties for various TS type nodes
  typeName?: Identifier
  types?: TSTypeNode[]
  elementType?: TSTypeNode
  typeParameters?: { params: TSTypeNode[] }
  literal?: Literal
}

// =================== Parser Configuration ===================

/** Available parsing engines. */
export type EngineName = 'acorn' | 'oxc'
/** Engine selection strategy: 'auto' (default), or a specific engine name. */
export type EngineOption = 'auto' | EngineName

/**
 * Options for the parsing process.
 */
export interface ParseOptions {
  /** Whether to parse as TypeScript. Defaults to true. */
  ts?: boolean
  /** Force the use of a specific parsing engine. */
  engine?: EngineName
  /** The source type: 'script' (default) or 'module'. */
  sourceType?: 'script' | 'module'
  /** The source filename (used by the OXC parser for diagnostics). */
  sourceFilename?: string
  /** Filter results to include only specific kinds of functions. */
  kind?: FunctionKind | FunctionKind[]
  /** Filter results to include only specific function syntaxes. */
  syntax?: FunctionSyntax | FunctionSyntax[]
}

/**
 * The internal result structure of a parse operation.
 */
export interface ParseResult {
  /** The root AST node of the parsed source. */
  ast: ASTNode
  /** The character offset applied to the source during parsing. */
  offset: number
  /** The name of the engine used for parsing. */
  engine: EngineName
}

/**
 * Configuration options for the {@link Analyzer} class.
 */
export interface AnalyzerOptions {
  /**
   * The threshold (in bytes) to switch to the WASM-based OXC parser.
   * Defaults to 50KB.
   */
  threshold?: number
  /**
   * Whether to automatically warm up the WASM-based parser.
   * Defaults to true.
   */
  warmup?: boolean
  /**
   * The default engine selection strategy.
   * Defaults to 'auto'.
   */
  engine?: EngineOption
}

// =================== Verification & Schemas ===================

/**
 * A logical matcher that supports combining multiple conditions.
 */
export interface LogicMatcher<T> {
  /** Matches if any of the provided matchers match. */
  $or?: Matcher<T>[]
  /** Matches if all of the provided matchers match. */
  $and?: Matcher<T>[]
  /** Matches if exactly one of the provided matchers match. */
  $oneOf?: Matcher<T>[]
  /** Matches if the provided matcher does NOT match. */
  $not?: Matcher<T>
}

/**
 * A matcher for values: can be a literal value, a RegExp, a predicate function,
 * or a logical combination of these.
 */
export type Matcher<T> = T | RegExp | ((value: T) => boolean) | LogicMatcher<T>

/**
 * A matcher for a sequence of items (like statements in a body or return values).
 */
export interface SequenceMatcher {
  /**
   * Ordered matching using JS snippets.
   * Supports `...` for skipping elements and `_` for single element wildcards.
   */
  $match?: string | string[]
  /**
   * Unordered "contains" check. Matches if the item(s) exist anywhere in the sequence.
   * Can be JS snippets or esquery selectors.
   */
  $has?: string | string[]
  /** Matches if AT LEAST ONE item in the sequence matches the pattern(s). */
  $any?: string | string[]
  /** Matches if ALL items in the sequence match the pattern(s). */
  $all?: string | string[]
  /** Matches if NO items in the sequence match the pattern(s). */
  $none?: string | string[]
}

/**
 * Schema for verifying a function parameter.
 */
export interface ParamSchema {
  /** Matcher for the parameter name. */
  name?: Matcher<string | null>
  /** Matcher for the parameter's TypeScript type (string representation). */
  type?: Matcher<string | null>
  /** Whether the parameter has a default value. */
  hasDefault?: boolean
  /** Whether the parameter is a rest element (...args). */
  isRest?: boolean
  /** Whether the parameter uses destructuring (object or array). */
  isDestructured?: boolean
  /** The destructuring pattern type. */
  pattern?: 'object' | 'array' | null
  /**
   * For object destructuring: schemas for individual properties.
   * Maps the property key (not the local variable name) to its schema.
   */
  properties?: Record<string, ParamSchema>
  /** For object destructuring: list of required property keys. */
  required?: string[]
  /**
   * For array destructuring: schemas for individual elements in order.
   */
  items?: (ParamSchema | null)[]

  /** Logical combinators (JSON Schema style) */
  anyOf?: ParamSchema[]
  oneOf?: ParamSchema[]
  allOf?: ParamSchema[]
  not?: ParamSchema

  /** Logical combinators (Internal style) */
  $or?: ParamSchema[]
  $oneOf?: ParamSchema[]
  $and?: ParamSchema[]
  $not?: ParamSchema
}

/**
 * Schema for verifying a function body.
 */
export interface BodySchema extends SequenceMatcher {
  /** Matcher for the number of statements in the body. */
  statementCount?: Matcher<number>
  /** CSS-like selector(s) that must exist in the body. (Legacy support) */
  has?: string | string[]
  /** CSS-like selector(s) that must NOT exist in the body. (Legacy support) */
  notHas?: string | string[]
  /** Custom validation for return statements. */
  returns?:
    | string
    | string[]
    | SequenceMatcher
    | ((helper: IReturnHelper, node: ASTNode, index: number) => boolean)
  /** Custom verification function for the body. */
  custom?: (body: IBodyInfo) => boolean
}

/**
 * Comprehensive schema for verifying a function.
 * Can be a structured object or a JS/TS snippet string.
 */
export type VerifySchema =
  | {
      /** Matcher for the function name. */
      name?: Matcher<string | null>
      /** Matcher for the function kind (e.g., 'method'). */
      kind?: Matcher<FunctionKind>
      /** Matcher for the function syntax (e.g., 'arrow'). */
      syntax?: Matcher<FunctionSyntax>
      /** Whether the function is a static method. */
      static?: boolean
      /** Whether the function is async. */
      async?: boolean
      /** Whether the function is a generator. */
      generator?: boolean
      /** Whether the function is an arrow function. */
      arrow?: boolean
      /** Matcher for the number of parameters. */
      paramCount?: Matcher<number>
      /**
       * Verification schemas for individual parameters.
       * Can be an array of schemas (positional), or a single object (JSON Schema
       * representing the first parameter's destructuring).
       */
      params?: ParamSchema[] | ParamSchema
      /** Matcher for the return type (string representation) or a structured schema. */
      returnType?: Matcher<string | null> | ParamSchema
      /** Whether to enable strict matching (e.g., matching variable declaration kind). */
      strict?: boolean
      /** Custom validation for return statements (shortcut for body.returns). */
      returns?: BodySchema['returns']
      /** Verification schema for the function body. */
      body?: string | string[] | BodySchema
      /** Custom verification function for the entire function info. */
      custom?: (fn: IFunctionInfo) => boolean
    }
  | string

/**
 * Details of a verification failure.
 */
export interface VerifyFailure {
  /** The JSON path to the failed property. */
  path: string
  /** The expected value or matcher description. */
  expected?: unknown
  /** The actual value found. */
  actual?: unknown
  /** A human-readable error message. */
  message: string
}

/**
 * Result of a verification operation.
 */
export interface VerifyResult {
  /** Whether the verification passed. */
  passed: boolean
  /** A list of failures if passed is false. */
  failures: VerifyFailure[]
  /** A summary string describing the overall result. */
  summary: string
}

// =================== Information Interfaces ===================

/** The functional kind of the function. */
export type FunctionKind =
  | 'function'
  | 'method'
  | 'getter'
  | 'setter'
  | 'constructor'

/** The syntactic form of the function. */
export type FunctionSyntax = 'declaration' | 'expression' | 'arrow'

/**
 * Interface representing detailed information about a function parameter.
 */
export interface IParamInfo {
  /** The parameter name, or null if it's a destructured pattern without a simple identifier. */
  readonly name: string | null
  /** The string representation of the parameter's TypeScript type. */
  readonly type: string | null
  /** Whether the parameter has a default value. */
  readonly hasDefault: boolean
  /** Whether this is a rest parameter (...args). */
  readonly isRest: boolean
  /** Whether the parameter uses destructuring. */
  readonly isDestructured: boolean
  /** The type of destructuring pattern used. */
  readonly pattern: 'object' | 'array' | null
  /** The AST node representing the default value, if any. */
  readonly defaultNode: ASTNode | null
  /** The raw source text of the parameter. */
  readonly text: string | null
  /** Serializes the parameter info to a plain JSON object. */
  toJSON(): ParamInfoJSON
}

/**
 * Interface representing detailed information about a function body.
 */
export interface IBodyInfo {
  /** The AST node of the body (BlockStatement or Expression). */
  readonly node: ASTNode
  /** Whether the body is a block statement. */
  readonly isBlock: boolean
  /** Whether the body is a single expression (arrow functions). */
  readonly isExpression: boolean
  /** The list of top-level statements in the body. */
  readonly statements: ASTNode[]
  /** The number of top-level statements. */
  readonly statementCount: number
  /** The raw source text of the body. */
  readonly text: string | null
  /** All return statements found within the body's scope. */
  readonly returns: ASTNode[]
  /** Searches for AST nodes matching the CSS-like selector within the body. */
  query(selector: string): ASTNode[]
  /** Checks if any AST nodes match the CSS-like selector within the body. */
  has(selector: string): boolean
}

/**
 * Interface representing comprehensive information about a function.
 */
export interface IFunctionInfo {
  /** The underlying AST node of the function. */
  readonly node: ASTNode
  /** The name of the engine used to parse this function. */
  readonly engine: string
  /** The name of the function, or null for anonymous functions. */
  readonly name: string | null
  /** The functional kind of the function (e.g., 'method'). */
  readonly kind: FunctionKind
  /** The syntactic form of the function (e.g., 'arrow'). */
  readonly syntax: FunctionSyntax
  /** Whether the function is a static class method. */
  readonly isStatic: boolean
  /** Whether the function is asynchronous. */
  readonly isAsync: boolean
  /** Whether the function is a generator. */
  readonly isGenerator: boolean
  /** Whether it's an arrow function. */
  readonly isArrow: boolean
  /** Whether it's a function declaration. */
  readonly isDeclaration: boolean
  /** Whether it's a function expression. */
  readonly isExpression: boolean
  /** Metadata for each parameter. */
  readonly params: IParamInfo[]
  /** The number of parameters. */
  readonly paramCount: number
  /** The string representation of the TypeScript return type. */
  readonly returnType: string | null
  /** The AST node representing the return type annotation. */
  readonly returnTypeNode: ASTNode | null
  /** Metadata about the function body. */
  readonly body: IBodyInfo
  /** Gets parameter info by its index. */
  param(index: number): IParamInfo | null
  /** Gets parameter info by its name. */
  paramByName(name: string): IParamInfo | null
  /** Searches for AST nodes matching the CSS-like selector within the function scope. */
  query(selector: string): ASTNode[]
  /** Checks if any AST nodes match the CSS-like selector within the function scope. */
  has(selector: string): boolean
  /** Verifies the function against a specified schema. */
  verify(schema: VerifySchema): VerifyResult
  /** Serializes the function info to a plain JSON object. */
  toJSON(): FunctionInfoJSON
}

/**
 * Helper interface for verifying return values in a function body.
 */
export interface IReturnHelper {
  /** The AST node being returned. */
  readonly node: ASTNode | null
  /** Checks if the return value is a binary operation with the given operator and operand names. */
  isBinaryOp(operator: string, leftName: string, rightName: string): boolean
  /** Checks if the return value is a call to a specific function. */
  isCall(calleeName?: string): boolean
  /** Checks if the return value is a specific literal value. */
  isLiteral(value?: unknown): boolean
  /** Checks if the return value is a specific identifier. */
  isIdentifier(name?: string): boolean
  /** Checks if the return value is a member access (e.g., obj.prop). */
  isMemberAccess(objName: string, propName: string): boolean
  /** Checks if the return value is a template literal. */
  isTemplateLiteral(): boolean
}

// =================== Serialization ===================

/**
 * Plain JSON representation of parameter information.
 */
export interface ParamInfoJSON {
  name: string | null
  type: string | null
  hasDefault: boolean
  isRest: boolean
  isDestructured: boolean
  pattern: 'object' | 'array' | null
  text: string | null
  properties?: Record<string, ParamInfoJSON>
  items?: (ParamInfoJSON | null)[]
}

/**
 * Plain JSON representation of function information.
 */
export interface FunctionInfoJSON {
  name: string | null
  kind: FunctionKind
  syntax: FunctionSyntax
  static: boolean
  type: string
  async: boolean
  generator: boolean
  arrow: boolean
  params: ParamInfoJSON[]
  returnType: string | null
  body: string | null
  bodyType: 'block' | 'expression'
  statementCount: number
  engine: string
}
