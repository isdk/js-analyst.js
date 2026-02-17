// ============================================================
//  src/types.ts — 全局类型定义
// ============================================================

// =================== AST 节点 ===================

/**
 * ESTree AST 节点基础类型
 *
 * 同时兼容 acorn 和 oxc-parser 的输出
 */
export interface ASTNode {
  type: string;
  start?: number;
  end?: number;
  loc?: SourceLocation;
  range?: [number, number];
  [key: string]: unknown;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

// ---- 具体节点类型（按需细化） ----

export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
  typeAnnotation?: TSTypeAnnotationWrapper;
}

export interface FunctionNode extends ASTNode {
  type: 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression';
  id?: Identifier | null;
  params: ASTNode[];
  body: ASTNode;
  async: boolean;
  generator: boolean;
  /** 箭头函数表达式体标记 */
  expression?: boolean;
  returnType?: TSTypeAnnotationWrapper;
}

export interface BlockStatement extends ASTNode {
  type: 'BlockStatement';
  body: ASTNode[];
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  argument: ASTNode | null;
}

export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface CallExpression extends ASTNode {
  type: 'CallExpression';
  callee: ASTNode;
  arguments: ASTNode[];
}

export interface MemberExpression extends ASTNode {
  type: 'MemberExpression';
  object: ASTNode;
  property: ASTNode;
  computed: boolean;
}

export interface Literal extends ASTNode {
  type: 'Literal';
  value: string | number | boolean | null | RegExp;
  raw?: string;
}

export interface RestElement extends ASTNode {
  type: 'RestElement';
  argument: ASTNode;
}

export interface AssignmentPattern extends ASTNode {
  type: 'AssignmentPattern';
  left: ASTNode;
  right: ASTNode;
}

export interface ObjectPattern extends ASTNode {
  type: 'ObjectPattern';
  properties: ASTNode[];
  typeAnnotation?: TSTypeAnnotationWrapper;
}

export interface ArrayPattern extends ASTNode {
  type: 'ArrayPattern';
  elements: (ASTNode | null)[];
}

export interface TemplateLiteral extends ASTNode {
  type: 'TemplateLiteral';
  quasis: ASTNode[];
  expressions: ASTNode[];
}

// ---- TypeScript 类型节点 ----

export interface TSTypeAnnotationWrapper extends ASTNode {
  type: 'TSTypeAnnotation';
  typeAnnotation: TSTypeNode;
}

export interface TSTypeNode extends ASTNode {
  // 基础关键字: TSNumberKeyword, TSStringKeyword 等
  // 复合类型: TSUnionType, TSArrayType, TSTypeReference 等
  typeName?: Identifier;
  types?: TSTypeNode[];
  elementType?: TSTypeNode;
  typeParameters?: { params: TSTypeNode[] };
  literal?: Literal;
}

// =================== 解析器相关 ===================

export type EngineName = 'acorn' | 'oxc';
export type EngineOption = 'auto' | EngineName;

export interface ParseOptions {
  /** 是否按 TypeScript 解析（默认自动检测） */
  ts?: boolean;
  /** 强制指定引擎 */
  engine?: EngineName;
  /** 源码类型 */
  sourceType?: 'script' | 'module';
  /** 源文件名（oxc 用） */
  sourceFilename?: string;
  /** 过滤特定的函数种类 */
  kind?: FunctionKind | FunctionKind[];
  /** 过滤特定的语法结构 */
  syntax?: FunctionSyntax | FunctionSyntax[];
}

export interface ParseResult {
  ast: ASTNode;
  offset: number;
  engine: EngineName;
}

export interface AnalyzerOptions {
  /** WASM 切换阈值（字节），默认 50KB */
  threshold?: number;
  /** 是否自动预热 WASM，默认 true */
  warmup?: boolean;
  /** 引擎选择策略，默认 'auto' */
  engine?: EngineOption;
}

// =================== 验证相关 ===================

/** 匹配器：精确值 | 正则 | 函数断言 */
export type Matcher<T> = T | RegExp | ((value: T) => boolean);

export interface ParamSchema {
  name?: Matcher<string | null>;
  type?: Matcher<string | null>;
  hasDefault?: boolean;
  isRest?: boolean;
  isDestructured?: boolean;
  pattern?: 'object' | 'array' | null;
}

export interface BodySchema {
  statementCount?: Matcher<number>;
  has?: string | string[];
  notHas?: string | string[];
  returns?: (helper: IReturnHelper, node: ASTNode, index: number) => boolean;
  custom?: (body: IBodyInfo) => boolean;
}

export interface VerifySchema {
  name?: Matcher<string | null>;
  kind?: Matcher<FunctionKind>;
  syntax?: Matcher<FunctionSyntax>;
  static?: boolean;
  async?: boolean;
  generator?: boolean;
  arrow?: boolean;
  paramCount?: Matcher<number>;
  params?: ParamSchema[];
  returnType?: Matcher<string | null>;
  body?: BodySchema;
  custom?: (fn: IFunctionInfo) => boolean;
}

export interface VerifyFailure {
  path: string;
  expected?: unknown;
  actual?: unknown;
  message: string;
}

export interface VerifyResult {
  passed: boolean;
  failures: VerifyFailure[];
  summary: string;
}

// =================== 信息类接口 ===================

export type FunctionKind = 'function' | 'method' | 'getter' | 'setter' | 'constructor';
export type FunctionSyntax = 'declaration' | 'expression' | 'arrow';

export interface IParamInfo {
  readonly name: string | null;
  readonly type: string | null;
  readonly hasDefault: boolean;
  readonly isRest: boolean;
  readonly isDestructured: boolean;
  readonly pattern: 'object' | 'array' | null;
  readonly defaultNode: ASTNode | null;
  readonly text: string | null;
  toJSON(): ParamInfoJSON;
}

export interface IBodyInfo {
  readonly node: ASTNode;
  readonly isBlock: boolean;
  readonly isExpression: boolean;
  readonly statements: ASTNode[];
  readonly statementCount: number;
  readonly text: string | null;
  readonly returns: ASTNode[];
  query(selector: string): ASTNode[];
  has(selector: string): boolean;
}

export interface IFunctionInfo {
  readonly node: ASTNode;
  readonly engine: string;
  readonly name: string | null;
  readonly kind: FunctionKind;
  readonly syntax: FunctionSyntax;
  readonly isStatic: boolean;
  readonly isAsync: boolean;
  readonly isGenerator: boolean;
  readonly isArrow: boolean;
  readonly isDeclaration: boolean;
  readonly isExpression: boolean;
  readonly params: IParamInfo[];
  readonly paramCount: number;
  readonly returnType: string | null;
  readonly body: IBodyInfo;
  param(index: number): IParamInfo | null;
  paramByName(name: string): IParamInfo | null;
  query(selector: string): ASTNode[];
  has(selector: string): boolean;
  verify(schema: VerifySchema): VerifyResult;
  toJSON(): FunctionInfoJSON;
}

export interface IReturnHelper {
  readonly node: ASTNode | null;
  isBinaryOp(operator: string, leftName: string, rightName: string): boolean;
  isCall(calleeName?: string): boolean;
  isLiteral(value?: unknown): boolean;
  isIdentifier(name?: string): boolean;
  isMemberAccess(objName: string, propName: string): boolean;
  isTemplateLiteral(): boolean;
}

// =================== 序列化 ===================

export interface ParamInfoJSON {
  name: string | null;
  type: string | null;
  hasDefault: boolean;
  isRest: boolean;
  isDestructured: boolean;
  pattern: 'object' | 'array' | null;
  text: string | null;
}

export interface FunctionInfoJSON {
  name: string | null;
  kind: FunctionKind;
  syntax: FunctionSyntax;
  static: boolean;
  type: string;
  async: boolean;
  generator: boolean;
  arrow: boolean;
  params: ParamInfoJSON[];
  returnType: string | null;
  body: string | null;
  bodyType: 'block' | 'expression';
  statementCount: number;
  engine: string;
}
