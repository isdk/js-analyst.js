// ============================================================
//  src/utils/ts-type.ts — TS 类型节点 → 可读字符串
// ============================================================

import type { TSTypeNode } from '../types.js';

const KEYWORD_MAP: Record<string, string> = {
  TSNumberKeyword:    'number',
  TSStringKeyword:    'string',
  TSBooleanKeyword:   'boolean',
  TSAnyKeyword:       'any',
  TSVoidKeyword:      'void',
  TSNullKeyword:      'null',
  TSUndefinedKeyword: 'undefined',
  TSNeverKeyword:     'never',
  TSUnknownKeyword:   'unknown',
  TSBigIntKeyword:    'bigint',
  TSSymbolKeyword:    'symbol',
  TSObjectKeyword:    'object',
};

/**
 * 将 TS AST 类型节点转为可读的类型字符串
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
  offset = 0,
): string | null {
  if (!tsNode) return null;

  // 基础关键字
  const keyword = KEYWORD_MAP[tsNode.type];
  if (keyword) return keyword;

  // 类型引用: Promise, Array, User, Map<K, V> 等
  if (tsNode.type === 'TSTypeReference') {
    const name = tsNode.typeName?.name
      ?? (tsNode.typeName as any)?.right?.name
      ?? 'unknown';

    const typeParams = tsNode.typeParameters?.params;
    if (typeParams?.length) {
      const args = typeParams
        .map(t => tsTypeToString(t, source, offset))
        .join(', ');
      return `${name}<${args}>`;
    }
    return name;
  }

  // 数组: number[]
  if (tsNode.type === 'TSArrayType') {
    const el = tsTypeToString(tsNode.elementType!, source, offset);
    return `${el}[]`;
  }

  // 联合: string | number
  if (tsNode.type === 'TSUnionType' && tsNode.types) {
    return tsNode.types
      .map(t => tsTypeToString(t, source, offset))
      .join(' | ');
  }

  // 交叉: A & B
  if (tsNode.type === 'TSIntersectionType' && tsNode.types) {
    return tsNode.types
      .map(t => tsTypeToString(t, source, offset))
      .join(' & ');
  }

  // 元组: [string, number]
  if (tsNode.type === 'TSTupleType') {
    const elements = (tsNode as any).elementTypes as TSTypeNode[] | undefined;
    if (elements) {
      const els = elements.map(t => tsTypeToString(t, source, offset));
      return `[${els.join(', ')}]`;
    }
  }

  // 函数类型: (x: number) => string
  if (tsNode.type === 'TSFunctionType') {
    return '(...) => ...';
  }

  // 字面量类型: 'hello' | 42 | true
  if (tsNode.type === 'TSLiteralType') {
    const lit = tsNode.literal;
    return String(lit?.value ?? lit?.raw ?? 'unknown');
  }

  // 可选类型: string | undefined
  if (tsNode.type === 'TSOptionalType') {
    return tsTypeToString((tsNode as any).typeAnnotation, source, offset) + '?';
  }

  // 兜底：从源码切片
  if (source && tsNode.start != null && tsNode.end != null) {
    return source.slice(tsNode.start - offset, tsNode.end - offset);
  }

  return tsNode.type;
}
