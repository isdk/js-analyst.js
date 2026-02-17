// ============================================================
//  src/ast/query.ts — Simple AST Query Engine
// ============================================================

import type { ASTNode } from '../types.js'
import { findAll, findInScope } from './traverse.js'

/**
 * Represents a parsed selector.
 */
interface ParsedSelector {
  type: string
  attrs: Record<string, string>
}

/**
 * Parses a CSS-like selector string for AST nodes.
 *
 * Currently supports:
 *   - `'ReturnStatement'`                    (by type)
 *   - `'Identifier[name="x"]'`              (by type + single attribute)
 *   - `'BinaryExpression[operator="+"]'`     (by type + single attribute)
 */
function parseSelector(selector: string): ParsedSelector {
  const match = selector.match(/^(\w+)(?:\[(.+)\])?$/)
  if (!match) {
    return { type: selector, attrs: {} }
  }

  const type = match[1]!
  const attrs: Record<string, string> = {}

  if (match[2]) {
    // Support multiple attributes: [name="x",operator="+"]
    const attrParts = match[2].split(',')
    for (const part of attrParts) {
      const eqIndex = part.indexOf('=')
      if (eqIndex === -1) continue
      const key = part.slice(0, eqIndex).trim()
      const val = part
        .slice(eqIndex + 1)
        .trim()
        .replace(/["']/g, '')
      attrs[key] = val
    }
  }

  return { type, attrs }
}

/**
 * Builds a predicate function from a selector string.
 */
function buildPredicate(selector: string): (node: ASTNode) => boolean {
  const { type, attrs } = parseSelector(selector)

  return (node: ASTNode): boolean => {
    if (node.type !== type) return false
    for (const [key, expected] of Object.entries(attrs)) {
      const actual = (node as Record<string, unknown>)[key]
      if (String(actual) !== expected) return false
    }
    return true
  }
}

/**
 * Queries the AST for all nodes matching the given selector.
 *
 * @param root - The root node to start searching from.
 * @param selector - The CSS-like selector string.
 * @param scoped - Whether to limit search to the current function scope.
 * @param owner - The function node defining the scope (required if scoped is true).
 * @returns An array of matching AST nodes.
 */
export function query(
  root: ASTNode,
  selector: string,
  scoped = false,
  owner?: ASTNode
): ASTNode[] {
  const predicate = buildPredicate(selector)

  if (scoped && owner) {
    return findInScope(root, predicate, owner)
  }
  return findAll(root, predicate)
}

/**
 * Checks if the AST contains any nodes matching the given selector.
 *
 * @param root - The root node to start searching from.
 * @param selector - The CSS-like selector string.
 * @param scoped - Whether to limit search to the current function scope.
 * @param owner - The function node defining the scope.
 * @returns True if at least one match is found.
 */
export function has(
  root: ASTNode,
  selector: string,
  scoped = false,
  owner?: ASTNode
): boolean {
  return query(root, selector, scoped, owner).length > 0
}
