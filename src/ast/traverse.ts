// ============================================================
//  src/ast/traverse.ts — AST Traversal Utilities
// ============================================================

import type { ASTNode } from '../types.js'
import { isNode, isFunctionNode as isFuncNode } from './helpers.js'

/** A predicate function used to match AST nodes. */
type Predicate = (node: ASTNode) => boolean

/**
 * Performs a depth-first search to find the first node that matches the predicate.
 *
 * @param node - The starting node or value.
 * @param predicate - The condition to match.
 * @returns The first matching node, or null if none found.
 */
export function findFirst(node: unknown, predicate: Predicate): ASTNode | null {
  if (!isNode(node)) return null
  if (predicate(node)) return node

  for (const [key, val] of Object.entries(node)) {
    if (key === 'parent') continue

    if (Array.isArray(val)) {
      for (const item of val) {
        const found = findFirst(item, predicate)
        if (found) return found
      }
    } else if (isNode(val)) {
      const found = findFirst(val, predicate)
      if (found) return found
    }
  }

  return null
}

/**
 * Traverses the AST and returns all nodes that match the predicate.
 *
 * @param node - The starting node or value.
 * @param predicate - The condition to match.
 * @param results - Internal accumulator for results.
 * @returns An array of matching AST nodes.
 */
export function findAll(
  node: unknown,
  predicate: Predicate,
  results: ASTNode[] = []
): ASTNode[] {
  if (!isNode(node)) return results
  if (predicate(node)) results.push(node)

  for (const [key, val] of Object.entries(node)) {
    if (key === 'parent') continue

    if (Array.isArray(val)) {
      for (const item of val) {
        findAll(item, predicate, results)
      }
    } else if (isNode(val)) {
      findAll(val, predicate, results)
    }
  }

  return results
}

/**
 * Traverses the AST within the current function's scope.
 * It stops descending when it encounters a nested function definition.
 *
 * @param node - The starting node.
 * @param predicate - The condition to match.
 * @param owner - The function node that defines the current scope.
 * @param results - Internal accumulator for results.
 * @returns An array of matching nodes within the scope.
 */
export function findInScope(
  node: unknown,
  predicate: Predicate,
  owner: ASTNode,
  results: ASTNode[] = []
): ASTNode[] {
  if (!isNode(node)) return results
  if (predicate(node)) results.push(node)

  // Stop descending when a nested function is found (unless it's the owner)
  if (isFuncNode(node) && node !== owner) return results

  for (const [key, val] of Object.entries(node)) {
    if (key === 'parent') continue

    if (Array.isArray(val)) {
      for (const item of val) {
        findInScope(item, predicate, owner, results)
      }
    } else if (isNode(val)) {
      findInScope(val, predicate, owner, results)
    }
  }

  return results
}

// Re-export from helpers for backward compatibility
export { isFuncNode as isFunctionNode }
