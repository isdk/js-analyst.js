// ============================================================
//  src/core/function-info.ts — 函数信息核心封装
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

export class FunctionInfo implements IFunctionInfo {
  private readonly _node: FunctionNode
  private readonly _wrapper: ASTNode | null
  private readonly _source: string
  private readonly _offset: number
  private readonly _engine: string

  private readonly _kind: FunctionKind
  private readonly _syntax: FunctionSyntax
  private readonly _static: boolean

  // 懒初始化缓存
  private _params?: ParamInfo[]
  private _body?: BodyInfo

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
        // 普通表达式
        break
    }

    return { funcNode, wrapper, kind, syntax, isStatic }
  }

  // ========== 基础属性 ==========

  get node(): ASTNode {
    return this._node
  }
  get wrapper(): ASTNode | null {
    return this._wrapper
  }
  get engine(): string {
    return this._engine
  }
  get kind(): FunctionKind {
    return this._kind
  }
  get syntax(): FunctionSyntax {
    return this._syntax
  }
  get isStatic(): boolean {
    return this._static
  }

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

  get isAsync(): boolean {
    return this._node.async === true
  }
  get isGenerator(): boolean {
    return this._node.generator === true
  }

  get isArrow(): boolean {
    return this._syntax === 'arrow'
  }

  get isDeclaration(): boolean {
    return this._syntax === 'declaration'
  }

  get isExpression(): boolean {
    return this._syntax === 'expression'
  }

  // ========== 参数 ==========

  get params(): ParamInfo[] {
    if (!this._params) {
      this._params = (this._node.params ?? []).map(
        (p) => new ParamInfo(p, this._source, this._offset)
      )
    }
    return this._params
  }

  get paramCount(): number {
    return this.params.length
  }

  param(index: number): ParamInfo | null {
    return this.params[index] ?? null
  }

  paramByName(name: string): ParamInfo | null {
    return this.params.find((p) => p.name === name) ?? null
  }

  // ========== 返回类型 ==========

  get returnType(): string | null {
    const rt = this._node.returnType as TSTypeAnnotationWrapper | undefined
    if (!rt?.typeAnnotation) return null
    return tsTypeToString(rt.typeAnnotation, this._source, this._offset)
  }

  // ========== 函数体 ==========

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

  // ========== 查询 ==========

  query(selector: string): ASTNode[] {
    return this.body.query(selector)
  }

  has(selector: string): boolean {
    return this.body.has(selector)
  }

  // ========== 验证 ==========

  verify(schema: VerifySchema): VerifyResult {
    return createVerifier(this).verify(schema)
  }

  // ========== 序列化 ==========

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
