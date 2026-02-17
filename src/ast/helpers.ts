// ============================================================
//  src/ast/helpers.ts — AST Node Predicates & Utilities
// ============================================================

import type { ASTNode } from '../types.js'

// ---------- Type Collections ----------

/** Node types that represent various function forms. */
export const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'MethodDefinition',
  'PropertyDefinition',
  'TSMethodSignature',
  'TSDeclareFunction',
  'VariableDeclarator',
] as const)

/** Node types that represent loops. */
export const LOOP_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
] as const)

/** Node types that represent declarations. */
export const DECLARATION_TYPES = new Set([
  'VariableDeclaration',
  'FunctionDeclaration',
  'ClassDeclaration',
] as const)

// ---------- Type Guards & Predicates ----------

/**
 * Checks if the value is a valid AST node.
 */
export function isNode(value: unknown): value is ASTNode {
  return (
    value != null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as ASTNode).type === 'string'
  )
}

/**
 * Checks if the node is a function or a wrapper containing a function.
 */
export function isFunctionNode(node: unknown): boolean {
  if (!isNode(node)) return false
  const type = node.type
  if (type === 'VariableDeclarator') {
    return isFunctionNode((node as any).init)
  }
  if (type === 'Property' || type === 'PropertyDefinition') {
    return isFunctionNode((node as any).value)
  }
  if (FUNCTION_TYPES.has(type as any)) return true
  return false
}

/**
 * Checks if the node is a loop statement.
 */
export function isLoopNode(node: unknown): boolean {
  return isNode(node) && LOOP_TYPES.has(node.type as any)
}

/**
 * Checks if the node is an identifier, optionally matching a specific name.
 */
export function isIdentifier(node: unknown, name?: string): boolean {
  if (!isNode(node) || node.type !== 'Identifier') return false
  return name === undefined || (node as any).name === name
}

/**
 * Checks if the node is a literal, optionally matching a specific value.
 */
export function isLiteral(node: unknown, value?: unknown): boolean {
  if (!isNode(node) || node.type !== 'Literal') return false
  return value === undefined || (node as any).value === value
}

/**
 * Checks if the node is a member expression, optionally matching object/property names.
 */
export function isMemberExpression(
  node: unknown,
  objName?: string,
  propName?: string
): boolean {
  if (!isNode(node) || node.type !== 'MemberExpression') return false
  const n = node as any
  if (objName !== undefined && !isIdentifier(n.object, objName)) return false
  if (propName !== undefined) {
    if (n.computed) return false
    if (!isIdentifier(n.property, propName)) return false
  }
  return true
}

/**
 * Checks if the node is a call expression, optionally matching the callee name.
 */
export function isCallExpression(node: unknown, calleeName?: string): boolean {
  if (!isNode(node) || node.type !== 'CallExpression') return false
  if (calleeName === undefined) return true
  const callee = (node as any).callee
  if (isIdentifier(callee, calleeName)) return true
  if (
    callee?.type === 'MemberExpression' &&
    isIdentifier(callee.property, calleeName)
  ) {
    return true
  }
  return false
}

/**
 * Checks if the node is a binary expression matching the operator and/or operands.
 */
export function isBinaryExpression(
  node: unknown,
  operator?: string,
  leftName?: string,
  rightName?: string
): boolean {
  if (!isNode(node) || node.type !== 'BinaryExpression') return false
  const n = node as any
  if (operator !== undefined && n.operator !== operator) return false
  if (leftName !== undefined && !isIdentifier(n.left, leftName)) return false
  if (rightName !== undefined && !isIdentifier(n.right, rightName)) return false
  return true
}

/**
 * Checks if the node is an assignment expression, optionally matching the operator.
 */
export function isAssignmentExpression(
  node: unknown,
  operator?: string
): boolean {
  if (!isNode(node) || node.type !== 'AssignmentExpression') return false
  return operator === undefined || (node as any).operator === operator
}

/** Checks if the node is a return statement. */
export function isReturnStatement(node: unknown): boolean {
  return isNode(node) && node.type === 'ReturnStatement'
}

/** Checks if the node is an await expression. */
export function isAwaitExpression(node: unknown): boolean {
  return isNode(node) && node.type === 'AwaitExpression'
}

/** Checks if the node is a yield expression. */
export function isYieldExpression(node: unknown): boolean {
  return isNode(node) && node.type === 'YieldExpression'
}

/** Checks if the node is a throw statement. */
export function isThrowStatement(node: unknown): boolean {
  return isNode(node) && node.type === 'ThrowStatement'
}

/** Checks if the node is a block statement. */
export function isBlockStatement(node: unknown): boolean {
  return isNode(node) && node.type === 'BlockStatement'
}

/** Checks if the node is an arrow function. */
export function isArrowFunction(node: unknown): boolean {
  return isNode(node) && node.type === 'ArrowFunctionExpression'
}

/** Checks if the node is a conditional (ternary) expression. */
export function isConditionalExpression(node: unknown): boolean {
  return isNode(node) && node.type === 'ConditionalExpression'
}

/** Checks if the node is a template literal. */
export function isTemplateLiteral(node: unknown): boolean {
  return isNode(node) && node.type === 'TemplateLiteral'
}

// ---------- Utility Functions ----------

/**
 * Safely gets a deep property from an AST node using a dot-separated path.
 *
 * @param node - The root AST node.
 * @param path - Dot-separated property path (e.g., 'callee.object.name').
 * @returns The value at the path, or undefined if not found.
 *
 * @example
 * nodeGet(node, 'callee.object.name')  // equivalent to node?.callee?.object?.name
 */
export function nodeGet(node: ASTNode, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = node
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

/** Keys to skip during child node traversal. */
const META_KEYS = new Set(['type', 'start', 'end', 'loc', 'range', 'parent'])

/**
 * Returns all direct child AST nodes of a given node.
 *
 * @param node - The parent AST node.
 */
export function getChildren(node: ASTNode): ASTNode[] {
  const children: ASTNode[] = []
  for (const [key, val] of Object.entries(node)) {
    if (META_KEYS.has(key)) continue
    if (Array.isArray(val)) {
      for (const item of val) {
        if (isNode(item)) children.push(item)
      }
    } else if (isNode(val)) {
      children.push(val)
    }
  }
  return children
}
