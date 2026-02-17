// ============================================================
//  src/utils/source.ts — Source Code Utilities
// ============================================================

import type { ASTNode } from '../types.js'

/**
 * Extracts a substring from the source code based on an AST node's boundaries.
 *
 * @param source - The original source code string.
 * @param node - The AST node to slice.
 * @param offset - The character offset used during parsing.
 * @returns The sliced source code or null if information is missing.
 */
export function sliceNode(
  source: string,
  node: ASTNode,
  offset = 0
): string | null {
  if (!source || node.start == null || node.end == null) return null
  return source.slice(
    (node.start as number) - offset,
    (node.end as number) - offset
  )
}

/**
 * Extracts the inner content of a BlockStatement, removing the surrounding braces.
 *
 * @param source - The original source code string.
 * @param blockNode - The BlockStatement AST node.
 * @param offset - The character offset used during parsing.
 * @returns The trimmed inner content or null if not a block.
 */
export function sliceBlockBody(
  source: string,
  blockNode: ASTNode,
  offset = 0
): string | null {
  if (!source || blockNode.type !== 'BlockStatement') return null
  if (blockNode.start == null || blockNode.end == null) return null
  return source
    .slice(
      (blockNode.start as number) - offset + 1,
      (blockNode.end as number) - offset - 1
    )
    .trim()
}

/**
 * Counts the number of lines in a source string.
 *
 * @param source - The source code string.
 * @returns The total number of lines (1-based).
 */
export function countLines(source: string): number {
  if (!source) return 0
  let count = 1
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') count++
  }
  return count
}

/**
 * Calculates the size of a string in bytes (UTF-8).
 *
 * @param source - The source code string.
 * @returns The size in bytes.
 */
export function byteSize(source: string): number {
  if (!source) return 0
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(source).length
  }
  // Node.js fallback
  return Buffer.byteLength(source, 'utf-8')
}

/**
 * Heuristically detects if a source string contains TypeScript syntax features.
 *
 * @param source - The source code string to analyze.
 * @returns True if TypeScript features are detected.
 */
export function detectTypeScript(source: string): boolean {
  if (!source) return false

  const tsPatterns: RegExp[] = [
    /\)\s*:\s*\w+/, // Return type ): number
    /\w\s*:\s*(number|string|boolean|any|void|never|unknown|object|bigint|symbol)\b/,
    /\binterface\s+\w+/, // interface Foo
    /\btype\s+\w+\s*=/, // type Foo =
    /\benum\s+\w+/, // enum Foo
    /\bnamespace\s+\w+/, // namespace Foo
    /\bdeclare\s+(function|const|let|var|class|interface|type|enum|module|namespace)\b/,
    /<\w+(?:\s*,\s*\w+)*>\s*\(/, // Generic call <T>(
    /\bas\s+\w+/, // Type assertion as Type
  ]

  return tsPatterns.some((pattern) => pattern.test(source))
}

/**
 * Removes single-line and multi-line comments from the source code.
 * Note: This is a simplified version that does not handle comments
 * inside template literals.
 *
 * @param source - The original source code string.
 * @returns The source code with comments stripped.
 */
export function stripComments(source: string): string {
  let result = ''
  let i = 0
  const len = source.length

  while (i < len) {
    const ch = source[i]!

    // Handle strings to avoid stripping "comments" inside them
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch
      result += source[i++]
      while (i < len) {
        if (source[i] === '\\') {
          result += source[i++]!
          if (i < len) result += source[i++]!
          continue
        }
        result += source[i]!
        if (source[i] === quote) {
          i++
          break
        }
        i++
      }
      continue
    }

    // Single-line comments
    if (ch === '/' && source[i + 1] === '/') {
      i += 2
      while (i < len && source[i] !== '\n') i++
      continue
    }

    // Multi-line comments
    if (ch === '/' && source[i + 1] === '*') {
      i += 2
      while (i < len) {
        if (source[i] === '*' && source[i + 1] === '/') {
          i += 2
          break
        }
        i++
      }
      continue
    }

    result += ch
    i++
  }

  return result
}

/**
 * Converts a character offset to line and column numbers.
 *
 * @param source - The original source code string.
 * @param offset - The 0-based character offset.
 * @returns An object containing the 1-based line and 0-based column.
 */
export function offsetToLineColumn(
  source: string,
  offset: number
): { line: number; column: number } {
  let line = 1
  let column = 0
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') {
      line++
      column = 0
    } else {
      column++
    }
  }
  return { line, column }
}
