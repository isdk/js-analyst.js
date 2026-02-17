// ============================================================
//  test/source-utils.test.ts — 工具函数测试
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  detectTypeScript,
  countLines,
  stripComments,
  offsetToLineColumn,
  byteSize,
} from '../src/utils/source.js';
import { tsTypeToString } from '../src/utils/ts-type.js';
import { query, has } from '../src/ast/query.js';
import { findAll, findInScope } from '../src/ast/traverse.js';
import type { TSTypeNode } from '../src/types.js';

describe('AST Query - Edge Cases', () => {
  it('handles invalid selector format', () => {
    const node = { type: 'Identifier', name: 'x' } as any;
    // 非法格式应回退到按类型匹配
    expect(query(node, '!!!')).toHaveLength(0);
  });

  it('handles attribute without equals sign', () => {
    const node = { type: 'Identifier', name: 'x' } as any;
    // [name] 这种没有 = 的属性应该被忽略
    expect(query(node, 'Identifier[name]')).toHaveLength(1);
  });

  it('has function', () => {
    const node = { type: 'Identifier', name: 'x' } as any;
    expect(has(node, 'Identifier')).toBe(true);
    expect(has(node, 'Literal')).toBe(false);
  });

  it('multiple attributes in selector', () => {
    const node = { type: 'BinaryExpression', operator: '+', left: {} } as any;
    expect(query(node, 'BinaryExpression[operator="+"]')).toHaveLength(1);
    expect(query(node, 'BinaryExpression[operator="-"]')).toHaveLength(0);
  });
});

describe('Traversal - Parent Skip', () => {
  it('findAll should skip parent property', () => {
    const node: any = { type: 'X', child: { type: 'Y' } };
    node.child.parent = node;
    const results = findAll(node, () => true);
    expect(results.length).toBe(2);
  });

  it('findInScope should skip parent property', () => {
    const node: any = { type: 'X', child: { type: 'Y' } };
    node.child.parent = node;
    const results = findInScope(node, () => true, node);
    expect(results.length).toBe(2);
  });
});

describe('byteSize', () => {
  it('measures ASCII', () => expect(byteSize('abc')).toBe(3));
  it('measures Unicode', () => expect(byteSize('π')).toBe(2));
  it('empty string', () => expect(byteSize('')).toBe(0));

  it('works when TextEncoder is missing', () => {
    const originalTextEncoder = global.TextEncoder;
    // @ts-ignore
    delete global.TextEncoder;
    expect(byteSize('abc')).toBe(3);
    global.TextEncoder = originalTextEncoder;
  });
});

describe('detectTypeScript', () => {
  it('detects typed params', () => {
    expect(detectTypeScript('function foo(x: number) {}')).toBe(true);
  });

  it('detects interface', () => {
    expect(detectTypeScript('interface Foo { bar: string }')).toBe(true);
  });

  it('detects type alias', () => {
    expect(detectTypeScript('type ID = string | number')).toBe(true);
  });

  it('returns false for plain JS', () => {
    expect(detectTypeScript('function foo(x) { return x }')).toBe(false);
  });

  it('returns false for empty', () => {
    expect(detectTypeScript('')).toBe(false);
  });
});

describe('countLines', () => {
  it('single line', () => expect(countLines('hello')).toBe(1));
  it('multi line', () => expect(countLines('a\nb\nc')).toBe(3));
  it('empty', () => expect(countLines('')).toBe(0));
  it('trailing newline', () => expect(countLines('a\n')).toBe(2));
});

describe('stripComments', () => {
  it('removes single-line comments', () => {
    expect(stripComments('a // comment\nb')).toBe('a \nb');
  });

  it('removes block comments', () => {
    expect(stripComments('a /* block */ b')).toBe('a  b');
  });

  it('preserves strings with //', () => {
    expect(stripComments('"hello // world"')).toBe('"hello // world"');
  });

  it('handles nested-like comments', () => {
    expect(stripComments('/* a // b */ c')).toBe(' c');
  });
});

describe('offsetToLineColumn', () => {
  it('first char', () => {
    expect(offsetToLineColumn('hello', 0)).toEqual({ line: 1, column: 0 });
  });

  it('after newline', () => {
    expect(offsetToLineColumn('ab\ncd', 3)).toEqual({ line: 2, column: 0 });
  });
});

describe('tsTypeToString', () => {
  const make = (type: string, extra: Record<string, unknown> = {}): TSTypeNode =>
    ({ type, ...extra } as TSTypeNode);

  it('keywords', () => {
    expect(tsTypeToString(make('TSNumberKeyword'))).toBe('number');
    expect(tsTypeToString(make('TSStringKeyword'))).toBe('string');
    expect(tsTypeToString(make('TSBooleanKeyword'))).toBe('boolean');
    expect(tsTypeToString(make('TSAnyKeyword'))).toBe('any');
    expect(tsTypeToString(make('TSVoidKeyword'))).toBe('void');
  });

  it('null input', () => {
    expect(tsTypeToString(null)).toBeNull();
    expect(tsTypeToString(undefined)).toBeNull();
  });

  it('type reference', () => {
    const node = make('TSTypeReference', {
      typeName: { type: 'Identifier', name: 'Promise' },
    });
    expect(tsTypeToString(node)).toBe('Promise');
  });

  it('array type', () => {
    const node = make('TSArrayType', {
      elementType: make('TSNumberKeyword'),
    });
    expect(tsTypeToString(node)).toBe('number[]');
  });

  it('union type', () => {
    const node = make('TSUnionType', {
      types: [make('TSStringKeyword'), make('TSNumberKeyword')],
    });
    expect(tsTypeToString(node)).toBe('string | number');
  });
});
