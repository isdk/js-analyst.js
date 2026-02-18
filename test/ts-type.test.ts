// ============================================================
//  test/ts-type.test.ts — TS 类型转换测试
// ============================================================

import { describe, it, expect } from 'vitest';
import { tsTypeToString } from '../src/utils/ts-type.js';
import type { TSTypeNode } from '../src/types.js';

describe('tsTypeToString', () => {
  const make = (type: string, extra: Record<string, unknown> = {}): TSTypeNode =>
    ({ type, ...extra } as TSTypeNode);

  it('handles all keywords', () => {
    const keywords = [
      ['TSNumberKeyword', 'number'],
      ['TSStringKeyword', 'string'],
      ['TSBooleanKeyword', 'boolean'],
      ['TSAnyKeyword', 'any'],
      ['TSVoidKeyword', 'void'],
      ['TSNullKeyword', 'null'],
      ['TSUndefinedKeyword', 'undefined'],
      ['TSNeverKeyword', 'never'],
      ['TSUnknownKeyword', 'unknown'],
      ['TSBigIntKeyword', 'bigint'],
      ['TSSymbolKeyword', 'symbol'],
      ['TSObjectKeyword', 'object'],
    ];

    for (const [type, expected] of keywords) {
      expect(tsTypeToString(make(type))).toBe(expected);
    }
  });

  it('handles TSTypeReference with multiple parameters', () => {
    const node = make('TSTypeReference', {
      typeName: { type: 'Identifier', name: 'Map' },
      typeParameters: {
        params: [
          make('TSStringKeyword'),
          make('TSNumberKeyword'),
        ]
      }
    });
    expect(tsTypeToString(node)).toBe('Map<string, number>');
  });

  it('handles nested TSTypeReference', () => {
    const node = make('TSTypeReference', {
      typeName: { type: 'Identifier', name: 'Promise' },
      typeParameters: {
        params: [
          make('TSArrayType', { elementType: make('TSStringKeyword') })
        ]
      }
    });
    expect(tsTypeToString(node)).toBe('Promise<string[]>');
  });

  it('handles TSIntersectionType', () => {
    const node = make('TSIntersectionType', {
      types: [
        make('TSTypeReference', { typeName: { type: 'Identifier', name: 'A' } }),
        make('TSTypeReference', { typeName: { type: 'Identifier', name: 'B' } }),
      ]
    });
    expect(tsTypeToString(node)).toBe('A & B');
  });

  it('handles TSTupleType', () => {
    const node = make('TSTupleType', {
      elementTypes: [
        make('TSStringKeyword'),
        make('TSNumberKeyword'),
      ]
    });
    expect(tsTypeToString(node)).toBe('[string, number]');
  });

  it('handles TSFunctionType', () => {
    const node = make('TSFunctionType');
    expect(tsTypeToString(node)).toBe('(...) => ...');
  });

  it('handles TSLiteralType', () => {
    expect(tsTypeToString(make('TSLiteralType', {
      literal: { value: 'hello' }
    }))).toBe('"hello"');

    expect(tsTypeToString(make('TSLiteralType', {
      literal: { raw: '42' }
    }))).toBe('42');
  });

  it('handles TSOptionalType', () => {
    const node = make('TSOptionalType', {
      typeAnnotation: make('TSStringKeyword')
    });
    expect(tsTypeToString(node)).toBe('string?');
  });

  it('falls back to source slice', () => {
    const source = 'type X = SpecialType;';
    const node = make('UnknownType', { start: 9, end: 20 });
    expect(tsTypeToString(node, source)).toBe('SpecialType');
  });

  it('falls back to type name if no source', () => {
    expect(tsTypeToString(make('UnknownType'))).toBe('UnknownType');
  });
});
