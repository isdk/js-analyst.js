// ============================================================
//  src/utils/source.ts — 源码处理工具
// ============================================================

import type { ASTNode } from '../types.js';

/**
 * 按 AST 节点的 start/end 从源码切片
 */
export function sliceNode(source: string, node: ASTNode, offset = 0): string | null {
  if (!source || node.start == null || node.end == null) return null;
  return source.slice(
    (node.start as number) - offset,
    (node.end as number) - offset,
  );
}

/**
 * 提取 BlockStatement 内部内容（去掉 { }）
 */
export function sliceBlockBody(source: string, blockNode: ASTNode, offset = 0): string | null {
  if (!source || blockNode.type !== 'BlockStatement') return null;
  if (blockNode.start == null || blockNode.end == null) return null;
  return source.slice(
    (blockNode.start as number) - offset + 1,
    (blockNode.end as number) - offset - 1,
  ).trim();
}

/**
 * 计算源码行数
 */
export function countLines(source: string): number {
  if (!source) return 0;
  let count = 1;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') count++;
  }
  return count;
}

/**
 * 计算 UTF-8 字节大小
 */
export function byteSize(source: string): number {
  if (!source) return 0;
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(source).length;
  }
  // Node.js fallback
  return Buffer.byteLength(source, 'utf-8');
}

/**
 * 检测源码是否包含 TypeScript 语法特征
 */
export function detectTypeScript(source: string): boolean {
  if (!source) return false;

  const tsPatterns: RegExp[] = [
    /\)\s*:\s*\w+/,                         // 返回类型 ): number
    /\w\s*:\s*(number|string|boolean|any|void|never|unknown|object|bigint|symbol)\b/,
    /\binterface\s+\w+/,                    // interface Foo
    /\btype\s+\w+\s*=/,                     // type Foo =
    /\benum\s+\w+/,                         // enum Foo
    /\bnamespace\s+\w+/,                    // namespace Foo
    /\bdeclare\s+(function|const|let|var|class|interface|type|enum|module|namespace)\b/,
    /<\w+(?:\s*,\s*\w+)*>\s*\(/,            // 泛型调用 <T>(
    /\bas\s+\w+/,                           // 类型断言 as Type
  ];

  return tsPatterns.some(pattern => pattern.test(source));
}

/**
 * 移除单行/块注释（简化版，不处理模板字符串内嵌注释）
 */
export function stripComments(source: string): string {
  let result = '';
  let i = 0;
  const len = source.length;

  while (i < len) {
    const ch = source[i]!;

    // 字符串
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      result += source[i++];
      while (i < len) {
        if (source[i] === '\\') {
          result += source[i++]!;
          if (i < len) result += source[i++]!;
          continue;
        }
        result += source[i]!;
        if (source[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }

    // 单行注释
    if (ch === '/' && source[i + 1] === '/') {
      i += 2;
      while (i < len && source[i] !== '\n') i++;
      continue;
    }

    // 块注释
    if (ch === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < len) {
        if (source[i] === '*' && source[i + 1] === '/') { i += 2; break; }
        i++;
      }
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * 偏移量 → 行列号
 */
export function offsetToLineColumn(
  source: string,
  offset: number,
): { line: number; column: number } {
  let line = 1;
  let column = 0;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') {
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return { line, column };
}
