// ============================================================
//  src/core/function-info.ts — 函数信息核心封装
// ============================================================

import type {
  ASTNode, FunctionNode, IFunctionInfo,
  VerifySchema, VerifyResult, FunctionInfoJSON,
  TSTypeAnnotationWrapper,
} from '../types.js';
import { ParamInfo } from './param-info.js';
import { BodyInfo } from './body-info.js';
import { createVerifier } from './verify.js';
import { tsTypeToString } from '../utils/ts-type.js';

export class FunctionInfo implements IFunctionInfo {
  private readonly _node: FunctionNode;
  private readonly _source: string;
  private readonly _offset: number;
  private readonly _engine: string;

  // 懒初始化缓存
  private _params?: ParamInfo[];
  private _body?: BodyInfo;

  constructor(
    funcNode: ASTNode,
    source: string,
    offset: number,
    engine: string,
  ) {
    this._node = funcNode as FunctionNode;
    this._source = source;
    this._offset = offset;
    this._engine = engine;
  }

  // ========== 基础属性 ==========

  get node(): ASTNode       { return this._node; }
  get engine(): string       { return this._engine; }
  get name(): string | null  { return this._node.id?.name ?? null; }
  get isAsync(): boolean     { return this._node.async === true; }
  get isGenerator(): boolean { return this._node.generator === true; }

  get isArrow(): boolean {
    return this._node.type === 'ArrowFunctionExpression';
  }

  get isDeclaration(): boolean {
    return this._node.type === 'FunctionDeclaration';
  }

  get isExpression(): boolean {
    return this._node.type === 'FunctionExpression';
  }

  // ========== 参数 ==========

  get params(): ParamInfo[] {
    if (!this._params) {
      this._params = (this._node.params ?? []).map(
        (p) => new ParamInfo(p, this._source, this._offset),
      );
    }
    return this._params;
  }

  get paramCount(): number {
    return this.params.length;
  }

  param(index: number): ParamInfo | null {
    return this.params[index] ?? null;
  }

  paramByName(name: string): ParamInfo | null {
    return this.params.find((p) => p.name === name) ?? null;
  }

  // ========== 返回类型 ==========

  get returnType(): string | null {
    const rt = this._node.returnType as TSTypeAnnotationWrapper | undefined;
    if (!rt?.typeAnnotation) return null;
    return tsTypeToString(rt.typeAnnotation, this._source, this._offset);
  }

  // ========== 函数体 ==========

  get body(): BodyInfo {
    if (!this._body) {
      this._body = new BodyInfo(
        this._node.body,
        this._node,
        this._source,
        this._offset,
      );
    }
    return this._body;
  }

  // ========== 查询 ==========

  query(selector: string): ASTNode[] {
    return this.body.query(selector);
  }

  has(selector: string): boolean {
    return this.body.has(selector);
  }

  // ========== 验证 ==========

  verify(schema: VerifySchema): VerifyResult {
    return createVerifier(this).verify(schema);
  }

  // ========== 序列化 ==========

  toJSON(): FunctionInfoJSON {
    return {
      name: this.name,
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
    };
  }
}
