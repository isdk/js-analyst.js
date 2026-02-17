// ============================================================
//  src/core/param-info.ts — Parameter Metadata Wrapper
// ============================================================

import type {
  ASTNode,
  IParamInfo,
  ParamInfoJSON,
  Identifier,
  TSTypeAnnotationWrapper,
} from '../types.js'
import { tsTypeToString } from '../utils/ts-type.js'
import { sliceNode } from '../utils/source.js'

/**
 * Internal interface for parsed parameter data.
 */
interface ParsedParam {
  innerNode: ASTNode
  name: string | null
  type: string | null
  hasDefault: boolean
  defaultNode: ASTNode | null
  isRest: boolean
  isDestructured: boolean
  pattern: 'object' | 'array' | null
}

/**
 * Implementation of {@link IParamInfo} that provides metadata about
 * a function parameter.
 *
 * This class handles various parameter patterns including simple identifiers,
 * rest elements, default values, and destructuring (objects/arrays).
 */
export class ParamInfo implements IParamInfo {
  private readonly _node: ASTNode
  private readonly _source: string
  private readonly _offset: number
  private readonly _parsed: ParsedParam

  /**
   * Internal constructor for ParamInfo.
   *
   * @param node - The AST node representing the parameter.
   * @param source - The original source code string.
   * @param offset - The character offset used during parsing.
   * @internal
   */
  constructor(node: ASTNode, source: string, offset: number) {
    this._node = node
    this._source = source
    this._offset = offset
    this._parsed = this._parse(node)
  }

  /**
   * Parses the parameter node recursively to extract metadata.
   */
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
    }

    let inner = node

    // RestElement: ...args
    if (inner.type === 'RestElement') {
      result.isRest = true
      inner = (inner as any).argument as ASTNode
    }

    // AssignmentPattern: x = defaultValue
    if (inner.type === 'AssignmentPattern') {
      result.hasDefault = true
      result.defaultNode = (inner as any).right as ASTNode
      inner = (inner as any).left as ASTNode
    }

    // Identifier: x
    if (inner.type === 'Identifier') {
      const id = inner as unknown as Identifier
      result.name = id.name

      const typeAnn = id.typeAnnotation as TSTypeAnnotationWrapper | undefined
      if (typeAnn?.typeAnnotation) {
        result.type = tsTypeToString(
          typeAnn.typeAnnotation,
          this._source,
          this._offset
        )
      }
    }
    // ObjectPattern: { a, b }
    else if (inner.type === 'ObjectPattern') {
      result.isDestructured = true
      result.pattern = 'object'

      const typeAnn = (inner as any).typeAnnotation as
        | TSTypeAnnotationWrapper
        | undefined
      if (typeAnn?.typeAnnotation) {
        result.type = tsTypeToString(
          typeAnn.typeAnnotation,
          this._source,
          this._offset
        )
      }
    }
    // ArrayPattern: [a, b]
    else if (inner.type === 'ArrayPattern') {
      result.isDestructured = true
      result.pattern = 'array'
    }

    result.innerNode = inner
    return result
  }

  /**
   * The name of the parameter.
   * Returns null if the parameter is a destructuring pattern without a simple name.
   */
  get name(): string | null {
    return this._parsed.name
  }

  /**
   * The string representation of the TypeScript type annotation.
   * Returns null if no type is explicitly defined.
   */
  get type(): string | null {
    return this._parsed.type
  }

  /** Whether the parameter has a default value (AssignmentPattern). */
  get hasDefault(): boolean {
    return this._parsed.hasDefault
  }

  /** Whether the parameter is a rest element (e.g., ...args). */
  get isRest(): boolean {
    return this._parsed.isRest
  }

  /** Whether the parameter uses object or array destructuring. */
  get isDestructured(): boolean {
    return this._parsed.isDestructured
  }

  /** The specific destructuring pattern used ('object' or 'array'). */
  get pattern(): 'object' | 'array' | null {
    return this._parsed.pattern
  }

  /** The AST node representing the default value, if any. */
  get defaultNode(): ASTNode | null {
    return this._parsed.defaultNode
  }

  /** The raw source text of the parameter. */
  get text(): string | null {
    return sliceNode(this._source, this._node, this._offset)
  }

  /** Serializes the parameter info to a plain JSON object. */
  toJSON(): ParamInfoJSON {
    return {
      name: this.name,
      type: this.type,
      hasDefault: this.hasDefault,
      isRest: this.isRest,
      isDestructured: this.isDestructured,
      pattern: this.pattern,
      text: this.text,
    }
  }
}
