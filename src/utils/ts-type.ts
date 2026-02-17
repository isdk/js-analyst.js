// ============================================================
//  src/utils/ts-type.ts — TS Type Node to Readable String
// ============================================================

import type { TSTypeNode } from '../types.js'

/** Map of TS type node types to their readable keyword representations. */
const KEYWORD_MAP: Record<string, string> = {
  TSNumberKeyword: 'number',
  TSStringKeyword: 'string',
  TSBooleanKeyword: 'boolean',
  TSAnyKeyword: 'any',
  TSVoidKeyword: 'void',
  TSNullKeyword: 'null',
  TSUndefinedKeyword: 'undefined',
  TSNeverKeyword: 'never',
  TSUnknownKeyword: 'unknown',
  TSBigIntKeyword: 'bigint',
  TSSymbolKeyword: 'symbol',
  TSObjectKeyword: 'object',
}

/**
 * Converts a TypeScript AST type node into a human-readable string representation.
 *
 * @param tsNode - The TS type node to convert.
 * @param source - Optional source code for slicing fallback.
 * @param offset - Optional character offset used during parsing.
 * @returns A readable type string (e.g., 'number', 'Promise<string>', 'string | number'),
 *          or null if the node is empty.
 *
 * @example
 * TSNumberKeyword              → 'number'
 * TSTypeReference(Promise<T>)  → 'Promise<T>'
 * TSUnionType(string | number) → 'string | number'
 * TSArrayType(number[])        → 'number[]'
 */
export function tsTypeToString(
  tsNode: TSTypeNode | null | undefined,
  source?: string,
  offset = 0
): string | null {
  if (!tsNode) return null

  // Base Keywords
  const keyword = KEYWORD_MAP[tsNode.type]
  if (keyword) return keyword

  // Type References: Promise, Array, User, Map<K, V>, etc.
  if (tsNode.type === 'TSTypeReference') {
    const name =
      tsNode.typeName?.name ??
      (tsNode.typeName as any)?.right?.name ??
      'unknown'

    const typeParams = tsNode.typeParameters?.params
    if (typeParams?.length) {
      const args = typeParams
        .map((t) => tsTypeToString(t, source, offset))
        .join(', ')
      return `${name}<${args}>`
    }
    return name
  }

  // Arrays: number[]
  if (tsNode.type === 'TSArrayType') {
    const el = tsTypeToString(tsNode.elementType!, source, offset)
    return `${el}[]`
  }

  // Unions: string | number
  if (tsNode.type === 'TSUnionType' && tsNode.types) {
    return tsNode.types
      .map((t) => tsTypeToString(t, source, offset))
      .join(' | ')
  }

  // Intersections: A & B
  if (tsNode.type === 'TSIntersectionType' && tsNode.types) {
    return tsNode.types
      .map((t) => tsTypeToString(t, source, offset))
      .join(' & ')
  }

  // Tuples: [string, number]
  if (tsNode.type === 'TSTupleType') {
    const elements = (tsNode as any).elementTypes as TSTypeNode[] | undefined
    if (elements) {
      const els = elements.map((t) => tsTypeToString(t, source, offset))
      return `[${els.join(', ')}]`
    }
  }

  // Function Types: (x: number) => string
  if (tsNode.type === 'TSFunctionType') {
    return '(...) => ...'
  }

  // Literal Types: 'hello' | 42 | true
  if (tsNode.type === 'TSLiteralType') {
    const lit = tsNode.literal
    return String(lit?.value ?? lit?.raw ?? 'unknown')
  }

  // Optional Types: string | undefined
  if (tsNode.type === 'TSOptionalType') {
    return tsTypeToString((tsNode as any).typeAnnotation, source, offset) + '?'
  }

  // Fallback: Slice from source if available
  if (source && tsNode.start != null && tsNode.end != null) {
    return source.slice(tsNode.start - offset, tsNode.end - offset)
  }

  return tsNode.type
}
