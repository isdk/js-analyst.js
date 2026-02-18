// ============================================================
//  src/core/function-info.ts — Function Metadata Wrapper
// ============================================================

import type {
  ASTNode,
  FunctionNode,
  IFunctionInfo,
  VerifySchema,
  VerifyResult,
  FunctionInfoJSON,
  TSTypeAnnotationWrapper,
  FunctionKind,
  FunctionSyntax,
} from '../types.js'
import { ParamInfo } from './param-info.js'
import { BodyInfo } from './body-info.js'
import { createVerifier } from './verify.js'
import { tsTypeToString } from '../utils/ts-type.js'

/**
 * Implementation of {@link IFunctionInfo} that provides detailed metadata
 * about a detected function.
 *
 * This class wraps an AST node and provides high-level getters for
 * function properties, parameters, and its body.
 */
export class FunctionInfo implements IFunctionInfo {
  private readonly _node: FunctionNode
  private readonly _wrapper: ASTNode | null
  private readonly _source: string
  private readonly _offset: number
  private readonly _engine: string

  private readonly _kind: FunctionKind
  private readonly _syntax: FunctionSyntax
  private readonly _static: boolean

  // Lazy initialization cache
  private _params?: ParamInfo[]
  private _body?: BodyInfo

  /**
   * Internal constructor for FunctionInfo.
   *
   * @param node - The AST node representing the function or its wrapper.
   * @param source - The original source code string.
   * @param offset - The character offset used during parsing.
   * @param engine - The name of the engine used to parse this function.
   * @internal
   */
  constructor(node: ASTNode, source: string, offset: number, engine: string) {
    this._source = source
    this._offset = offset
    this._engine = engine

    const { funcNode, wrapper, kind, syntax, isStatic } = this._parseNode(node)
    this._node = funcNode as FunctionNode
    this._wrapper = wrapper
    this._kind = kind
    this._syntax = syntax
    this._static = isStatic
  }

  /**
   * Normalizes the function node and extracts its kind and syntax.
   */
  private _parseNode(node: ASTNode): {
    funcNode: ASTNode
    wrapper: ASTNode | null
    kind: FunctionKind
    syntax: FunctionSyntax
    isStatic: boolean
  } {
    let funcNode = node
    let wrapper: ASTNode | null = null
    let kind: FunctionKind = 'function'
    let syntax: FunctionSyntax = 'expression'
    let isStatic = false

    switch (node.type) {
      case 'FunctionDeclaration':
        syntax = 'declaration'
        break
      case 'ArrowFunctionExpression':
        syntax = 'arrow'
        break
      case 'MethodDefinition':
      case 'TSMethodSignature':
        wrapper = node
        funcNode = (node as any).value || node
        kind =
          (node as any).kind === 'constructor'
            ? 'constructor'
            : (node as any).kind === 'get'
              ? 'getter'
              : (node as any).kind === 'set'
                ? 'setter'
                : 'method'
        isStatic = (node as any).static === true
        syntax = this._parseNode(funcNode).syntax
        break
      case 'Property':
      case 'PropertyDefinition':
        wrapper = node
        funcNode = (node as any).value
        kind =
          (node as any).kind === 'get'
            ? 'getter'
            : (node as any).kind === 'set'
              ? 'setter'
              : 'method'
        isStatic = (node as any).static === true
        syntax = this._parseNode(funcNode).syntax
        break
      case 'VariableDeclarator':
        wrapper = node
        funcNode = (node as any).init
        const inner = this._parseNode(funcNode)
        kind = inner.kind
        syntax = inner.syntax
        break
      case 'FunctionExpression':
        // Standard expression
        break
    }

    return { funcNode, wrapper, kind, syntax, isStatic }
  }

  // ========== Base Properties ==========

  /** The underlying ESTree function node. */
  get node(): ASTNode {
    return this._node
  }

  /** The wrapper node (e.g., MethodDefinition, VariableDeclarator), if any. */
  get wrapper(): ASTNode | null {
    return this._wrapper
  }

  /** The name of the engine used to parse this function. */
  get engine(): string {
    return this._engine
  }

  /** The functional kind of the function (e.g., 'method', 'getter'). */
  get kind(): FunctionKind {
    return this._kind
  }

  /** The syntactic form of the function (e.g., 'declaration', 'arrow'). */
  get syntax(): FunctionSyntax {
    return this._syntax
  }

  /** Whether the function is a static class member. */
  get isStatic(): boolean {
    return this._static
  }

  /**
   * The name of the function.
   *
   * Returns the identifier for named functions, variable name for assigned
   * anonymous functions, or the property key for methods.
   */
  get name(): string | null {
    if (this._node.id) return this._node.id.name
    if (this._wrapper) {
      if (this._wrapper.type === 'VariableDeclarator') {
        const id = (this._wrapper as any).id
        if (id.type === 'Identifier') return id.name
      }
      const key = (this._wrapper as any).key
      if (key) {
        if (key.type === 'Identifier' || key.type === 'PrivateIdentifier')
          return key.name
        if (key.type === 'Literal') return String(key.value)
      }
    }
    return null
  }

  /** Whether the function is marked as async. */
  get isAsync(): boolean {
    return this._node.async === true
  }

  /** Whether the function is a generator function. */
  get isGenerator(): boolean {
    return this._node.generator === true
  }

  /** Whether the function is an arrow function. */
  get isArrow(): boolean {
    return this._syntax === 'arrow'
  }

  /** Whether the function is a declaration. */
  get isDeclaration(): boolean {
    return this._syntax === 'declaration'
  }

  /** Whether the function is a function expression. */
  get isExpression(): boolean {
    return this._syntax === 'expression'
  }

  // ========== Parameters ==========

  /** A list of metadata for each function parameter. */
  get params(): ParamInfo[] {
    if (!this._params) {
      this._params = (this._node.params ?? []).map(
        (p) => new ParamInfo(p, this._source, this._offset)
      )
    }
    return this._params
  }

  /** The number of parameters defined in the function signature. */
  get paramCount(): number {
    return this.params.length
  }

  /**
   * Gets parameter metadata by its index.
   * @param index - The 0-based parameter index.
   */
  param(index: number): ParamInfo | null {
    return this.params[index] ?? null
  }

  /**
   * Gets parameter metadata by its name.
   * @param name - The name of the parameter to find.
   */
  paramByName(name: string): ParamInfo | null {
    return this.params.find((p) => p.name === name) ?? null
  }

  // ========== Return Type ==========

  /**
   * The string representation of the TypeScript return type.
   * Returns null if no type annotation is present.
   */
  get returnType(): string | null {
    const rt = this.returnTypeNode
    if (!rt) return null
    return tsTypeToString(rt as any, this._source, this._offset)
  }

  /**
   * The AST node representing the return type annotation.
   */
  get returnTypeNode(): ASTNode | null {
    const rt = this._node.returnType as TSTypeAnnotationWrapper | undefined
    return rt?.typeAnnotation ?? null
  }

  // ========== Body ==========

  /** Metadata about the function body. */
  get body(): BodyInfo {
    if (!this._body) {
      this._body = new BodyInfo(
        this._node.body,
        this._node,
        this._source,
        this._offset
      )
    }
    return this._body
  }

  // ========== Querying ==========

  /**
   * Searches for AST nodes matching the CSS-like selector within the function scope.
   * @param selector - The Esquery selector string.
   */
  query(selector: string): ASTNode[] {
    return this.body.query(selector)
  }

  /**
   * Checks if any AST nodes match the CSS-like selector within the function scope.
   * @param selector - The Esquery selector string.
   */
  has(selector: string): boolean {
    return this.body.has(selector)
  }

  // ========== Verification ==========

  /**
   * Verifies the function against a specified schema.
   * @param schema - The validation rules to check.
   */
  verify(schema: VerifySchema): VerifyResult {
    return createVerifier(this).verify(schema)
  }

  // ========== Serialization ==========

  /** Serializes the function information to a plain JSON object. */
  toJSON(): FunctionInfoJSON {
    return {
      name: this.name,
      kind: this._kind,
      syntax: this._syntax,
      static: this._static,
      type: this._node.type,
      async: this.isAsync,
      generator: this.isGenerator,
      arrow: this.isArrow,
      params: this.params.map((p) => p.toJSON()),
      returnType: this.returnType,
      body: this.body.text,
      bodyType: this.body.isExpression ? 'expression' : 'block',
      statementCount: this.body.statementCount,
      engine: this._engine,
    }
  }
}
