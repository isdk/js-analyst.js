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
  properties?: Record<string, ParamInfo>
  items?: (ParamInfo | null)[]
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
   * @param inferredTypeNode - Optional type node inferred from parent destructuring.
   * @internal
   */
  constructor(
    node: ASTNode,
    source: string,
    offset: number,
    inferredTypeNode?: ASTNode
  ) {
    this._node = node
    this._source = source
    this._offset = offset
    this._parsed = this._parse(node, inferredTypeNode)
  }

  /**
   * Parses the parameter node recursively to extract metadata.
   */
  private _parse(node: ASTNode, inferredTypeNode?: ASTNode): ParsedParam {
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
    let currentInferred = inferredTypeNode

    // RestElement: ...args
    if (inner.type === 'RestElement') {
      result.isRest = true
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
      inner = (inner as any).argument as ASTNode
    }

    // AssignmentPattern: x = defaultValue
    if (inner.type === 'AssignmentPattern') {
      result.hasDefault = true
      result.defaultNode = (inner as any).right as ASTNode
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
      inner = (inner as any).left as ASTNode
    }

    // If we have an inferred type node, set the initial type string
    if (currentInferred && !result.type) {
      result.type = tsTypeToString(
        currentInferred as any,
        this._source,
        this._offset
      )
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
    // ObjectPattern: { a, b: c }
    else if (inner.type === 'ObjectPattern') {
      result.isDestructured = true
      result.pattern = 'object'
      result.properties = {}

      const typeAnn = (inner as any).typeAnnotation as
        | TSTypeAnnotationWrapper
        | undefined
      const effectiveTypeNode = typeAnn?.typeAnnotation || currentInferred

      if (typeAnn?.typeAnnotation) {
        result.type = tsTypeToString(
          typeAnn.typeAnnotation,
          this._source,
          this._offset
        )
      }

      const typeProps: Record<string, ASTNode> = {}
      if (effectiveTypeNode?.type === 'TSTypeLiteral') {
        const members = (effectiveTypeNode as any).members || []
        for (const m of members) {
          if (
            (m.type === 'TSPropertySignature' ||
              m.type === 'TSMethodSignature') &&
            m.key?.type === 'Identifier'
          ) {
            typeProps[m.key.name] = m.typeAnnotation?.typeAnnotation || m
          }
        }
      }

      const props = (inner as any).properties as ASTNode[]
      for (const p of props) {
        if (p.type === 'Property') {
          const key = (p as any).key
          const value = (p as any).value
          let keyName: string | null = null

          if (key.type === 'Identifier') {
            keyName = key.name
          } else if (key.type === 'Literal') {
            keyName = String(key.value)
          }

          if (keyName) {
            result.properties[keyName] = new ParamInfo(
              value,
              this._source,
              this._offset,
              typeProps[keyName]
            )
          }
        } else if (p.type === 'RestElement') {
          const restParam = new ParamInfo(p, this._source, this._offset)
          if (restParam.name) {
            result.properties![restParam.name] = restParam
          }
        }
      }
    }
    // ArrayPattern: [a, b]
    else if (inner.type === 'ArrayPattern') {
      result.isDestructured = true
      result.pattern = 'array'

      const typeAnn = (inner as any).typeAnnotation as
        | TSTypeAnnotationWrapper
        | undefined
      const effectiveTypeNode = typeAnn?.typeAnnotation || currentInferred

      if (typeAnn?.typeAnnotation) {
        result.type = tsTypeToString(
          typeAnn.typeAnnotation,
          this._source,
          this._offset
        )
      }

      const typeElements =
        effectiveTypeNode?.type === 'TSTupleType'
          ? (effectiveTypeNode as any).elementTypes || []
          : []

      const elements = (inner as any).elements as (ASTNode | null)[]
      result.items = elements.map((el, i) => {
        if (!el) return null
        return new ParamInfo(el, this._source, this._offset, typeElements[i])
      })
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
   * For object destructuring: metadata for each property.
   */
  get properties(): Record<string, ParamInfo> | undefined {
    return this._parsed.properties
  }

  /**
   * For array destructuring: metadata for each element.
   */
  get items(): (ParamInfo | null)[] | undefined {
    return this._parsed.items
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
    const result: ParamInfoJSON = {
      name: this.name,
      type: this.type,
      hasDefault: this.hasDefault,
      isRest: this.isRest,
      isDestructured: this.isDestructured,
      pattern: this.pattern,
      text: this.text,
    }

    if (this.properties) {
      result.properties = {}
      for (const [key, value] of Object.entries(this.properties)) {
        result.properties[key] = value.toJSON()
      }
    }

    if (this.items) {
      result.items = this.items.map((it) => (it ? it.toJSON() : null))
    }

    return result
  }
}
