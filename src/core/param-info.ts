// ============================================================
//  src/core/param-info.ts — 参数信息封装
// ============================================================

import type {
  ASTNode, IParamInfo, ParamInfoJSON,
  Identifier, TSTypeAnnotationWrapper,
} from '../types.js';
import { tsTypeToString } from '../utils/ts-type.js';
import { sliceNode } from '../utils/source.js';

interface ParsedParam {
  innerNode: ASTNode;
  name: string | null;
  type: string | null;
  hasDefault: boolean;
  defaultNode: ASTNode | null;
  isRest: boolean;
  isDestructured: boolean;
  pattern: 'object' | 'array' | null;
}

export class ParamInfo implements IParamInfo {
  private readonly _node: ASTNode;
  private readonly _source: string;
  private readonly _offset: number;
  private readonly _parsed: ParsedParam;

  constructor(node: ASTNode, source: string, offset: number) {
    this._node = node;
    this._source = source;
    this._offset = offset;
    this._parsed = this._parse(node);
  }

  private _parse(node: ASTNode): ParsedParam {
    const result: ParsedParam = {
      innerNode: node,
      name: null,
      type: null,
      hasDefault: false,
      defaultNode: null,
      isRest: false,
      isDestructured: false,
      pattern: null,
    };

    let inner = node;

    // RestElement: ...args
    if (inner.type === 'RestElement') {
      result.isRest = true;
      inner = (inner as any).argument as ASTNode;
    }

    // AssignmentPattern: x = defaultValue
    if (inner.type === 'AssignmentPattern') {
      result.hasDefault = true;
      result.defaultNode = (inner as any).right as ASTNode;
      inner = (inner as any).left as ASTNode;
    }

    // Identifier: x
    if (inner.type === 'Identifier') {
      const id = inner as unknown as Identifier;
      result.name = id.name;

      const typeAnn = id.typeAnnotation as TSTypeAnnotationWrapper | undefined;
      if (typeAnn?.typeAnnotation) {
        result.type = tsTypeToString(typeAnn.typeAnnotation, this._source, this._offset);
      }
    }
    // ObjectPattern: { a, b }
    else if (inner.type === 'ObjectPattern') {
      result.isDestructured = true;
      result.pattern = 'object';

      const typeAnn = (inner as any).typeAnnotation as TSTypeAnnotationWrapper | undefined;
      if (typeAnn?.typeAnnotation) {
        result.type = tsTypeToString(typeAnn.typeAnnotation, this._source, this._offset);
      }
    }
    // ArrayPattern: [a, b]
    else if (inner.type === 'ArrayPattern') {
      result.isDestructured = true;
      result.pattern = 'array';
    }

    result.innerNode = inner;
    return result;
  }

  get name(): string | null        { return this._parsed.name; }
  get type(): string | null        { return this._parsed.type; }
  get hasDefault(): boolean        { return this._parsed.hasDefault; }
  get isRest(): boolean            { return this._parsed.isRest; }
  get isDestructured(): boolean    { return this._parsed.isDestructured; }
  get pattern(): 'object' | 'array' | null { return this._parsed.pattern; }
  get defaultNode(): ASTNode | null { return this._parsed.defaultNode; }

  get text(): string | null {
    return sliceNode(this._source, this._node, this._offset);
  }

  toJSON(): ParamInfoJSON {
    return {
      name: this.name,
      type: this.type,
      hasDefault: this.hasDefault,
      isRest: this.isRest,
      isDestructured: this.isDestructured,
      pattern: this.pattern,
      text: this.text,
    };
  }
}
