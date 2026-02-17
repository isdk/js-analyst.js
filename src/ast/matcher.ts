// ============================================================
//  src/ast/matcher.ts — AST Pattern Matching Engine
// ============================================================

import type { ASTNode, Matcher, LogicMatcher } from '../types.js'
import { isNode, isIdentifier } from './helpers.js'
import { tsTypeToString } from '../utils/ts-type.js'

/**
 * Context for matching, including function parameters for `args[i]` resolution.
 */
export interface MatchContext {
  /** The list of parameters from the function being verified. */
  params?: (ASTNode | null)[]
  /** Whether to enable strict mode (e.g., matching variable declaration kind). */
  strict?: boolean
}

/**
 * Core function to check if a target AST node matches a pattern.
 */
export function isMatch(
  target: unknown,
  pattern: unknown,
  context: MatchContext = {}
): boolean {
  if (target === pattern) return true

  // 1. Handle special wildcards and placeholders in pattern
  if (isIdentifier(pattern)) {
    const name = (pattern as any).name
    if (name === '_' || name === '$_any_$') return true
  }

  // Handle explicit ellipsis in pattern
  if (isEllipsis(pattern)) return true

  // Handle TypeScript Type Annotations specially
  if (
    isNode(pattern) &&
    (pattern.type === 'TSTypeAnnotation' || pattern.type.startsWith('TS'))
  ) {
    return matchTsType(target, pattern)
  }

  // Handle args[i] placeholder
  const argIndex = getArgIndex(pattern)
  if (argIndex !== -1 && context.params) {
    let paramNode = context.params[argIndex]
    if (paramNode) {
      if (paramNode.type === 'AssignmentPattern') {
        paramNode = (paramNode as any).left
      } else if (paramNode.type === 'RestElement') {
        paramNode = (paramNode as any).argument
      }

      if (paramNode) {
        if (paramNode.type === 'Identifier') {
          return isIdentifier(target, (paramNode as any).name)
        }
        return isMatch(target, paramNode, context)
      }
    }
  }

  // 2. Handle non-node types
  if (!isNode(target) || !isNode(pattern)) {
    return target === pattern
  }

  // 3. Node type must match (with semantic equivalence)
  if (target.type !== pattern.type) {
    // Unwrappers
    if (target.type === 'ParenthesizedExpression')
      return isMatch((target as any).expression, pattern, context)
    if (pattern.type === 'ParenthesizedExpression')
      return isMatch(target, (pattern as any).expression, context)
    if (target.type === 'ExpressionStatement')
      return isMatch((target as any).expression, pattern, context)
    if (pattern.type === 'ExpressionStatement')
      return isMatch(target, (pattern as any).expression, context)

    // Semantic unwrapping for Returns and Assignments
    if (target.type === 'ReturnStatement' && pattern.type !== 'ReturnStatement')
      return isMatch((target as any).argument, pattern, context)
    if (pattern.type === 'ReturnStatement' && target.type !== 'ReturnStatement')
      return isMatch(target, (pattern as any).argument, context)

    if (
      target.type === 'AssignmentPattern' &&
      pattern.type !== 'AssignmentPattern'
    )
      return isMatch((target as any).left, pattern, context)
    if (
      pattern.type === 'AssignmentPattern' &&
      target.type !== 'AssignmentPattern'
    )
      return isMatch(target, (pattern as any).left, context)

    const isEquivalent =
      (target.type === 'ObjectExpression' &&
        pattern.type === 'ObjectPattern') ||
      (target.type === 'ObjectPattern' &&
        pattern.type === 'ObjectExpression') ||
      (target.type === 'ArrayExpression' && pattern.type === 'ArrayPattern') ||
      (target.type === 'ArrayPattern' && pattern.type === 'ArrayExpression') ||
      (target.type === 'RestElement' && pattern.type === 'SpreadElement') ||
      (target.type === 'SpreadElement' && pattern.type === 'RestElement')

    if (!isEquivalent) return false
  }

  // 4. Deep property comparison
  const keys = Object.keys(pattern)

  for (const key of keys) {
    if (
      [
        'start',
        'end',
        'loc',
        'range',
        'parent',
        'type',
        '_virtual',
        'shorthand',
        'raw',
      ].includes(key)
    )
      continue

    if (
      !context.strict &&
      target.type === 'VariableDeclaration' &&
      key === 'kind'
    )
      continue

    const targetVal = (target as any)[key]
    const patternVal = (pattern as any)[key]

    let matched = false
    if (Array.isArray(patternVal)) {
      matched =
        Array.isArray(targetVal) &&
        matchSequence(targetVal, patternVal, context)
    } else if (isNode(patternVal)) {
      matched = isMatch(targetVal, patternVal, context)
    } else {
      matched = targetVal === patternVal
    }

    if (!matched) return false
  }

  return true
}

/** Matches TypeScript type nodes by their string representation. */
function matchTsType(target: unknown, pattern: unknown): boolean {
  if (!isNode(pattern)) return false

  const patternNode =
    pattern.type === 'TSTypeAnnotation'
      ? (pattern as any).typeAnnotation
      : pattern
  const targetNode =
    isNode(target) && target.type === 'TSTypeAnnotation'
      ? (target as any).typeAnnotation
      : target

  const patternStr = tsTypeToString(patternNode)
  if (!patternStr || patternStr === 'any') return true

  const targetStr = isNode(targetNode)
    ? tsTypeToString(targetNode)
    : String(target)
  if (targetStr === patternStr) return true

  if (patternStr.includes('any')) {
    const regex = new RegExp(
      '^' +
        patternStr
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/any/g, '.*') +
        '$'
    )
    return regex.test(targetStr || '')
  }

  return false
}

/** Extracts the argument index from an args[i] placeholder node. */
function getArgIndex(node: unknown): number {
  if (!isNode(node)) return -1
  if (node.type === 'Identifier') {
    const m = (node as any).name.match(/^args\[(\d+)\]$/)
    return m ? parseInt(m[1], 10) : -1
  }
  if (node.type === 'MemberExpression') {
    const n = node as any
    if (
      n.computed &&
      isIdentifier(n.object, 'args') &&
      n.property.type === 'Literal'
    ) {
      return typeof n.property.value === 'number' ? n.property.value : -1
    }
  }
  return -1
}

/**
 * Matches a sequence of nodes, supporting the `...` wildcard.
 */
export function matchSequence(
  targets: unknown[],
  patterns: unknown[],
  context: MatchContext = {}
): boolean {
  let tIdx = 0
  let pIdx = 0

  while (pIdx < patterns.length) {
    const p = patterns[pIdx]

    if (isEllipsis(p)) {
      if (pIdx === patterns.length - 1) return true
      const nextP = patterns[pIdx + 1]
      for (let i = tIdx; i < targets.length; i++) {
        if (isMatch(targets[i], nextP, context)) {
          if (
            matchSequence(targets.slice(i), patterns.slice(pIdx + 1), context)
          )
            return true
        }
      }
      return false
    }

    if (tIdx >= targets.length || !isMatch(targets[tIdx], p, context))
      return false

    tIdx++
    pIdx++
  }

  return tIdx === targets.length
}

function isEllipsis(node: unknown): boolean {
  if (!isNode(node)) return false
  if (node.type === 'Identifier') {
    const name = (node as any).name
    return name === '...' || name === '$_any_$'
  }
  if (node.type === 'SpreadElement' && isEllipsis((node as any).argument))
    return true
  if (
    node.type === 'ExpressionStatement' &&
    isEllipsis((node as any).expression)
  )
    return true
  return false
}

/**
 * Evaluates a generic Matcher.
 */
export function evaluateMatcher<T>(
  value: T,
  matcher: Matcher<T>,
  deepMatch?: (v: T, p: any) => boolean
): boolean {
  if (matcher === undefined) return true
  if (typeof matcher === 'function') {
    try {
      return (matcher as (v: T) => boolean)(value)
    } catch {
      return false
    }
  }
  if (matcher instanceof RegExp) return matcher.test(String(value))
  if (isLogicMatcher(matcher)) {
    const m = matcher as LogicMatcher<T>
    if (m.$or)
      return m.$or.some((sub) => evaluateMatcher(value, sub, deepMatch))
    if (m.$and)
      return m.$and.every((sub) => evaluateMatcher(value, sub, deepMatch))
    if (m.$not) return !evaluateMatcher(value, m.$not, deepMatch)
    return true
  }
  if (deepMatch && (typeof matcher === 'string' || isNode(matcher)))
    return deepMatch(value, matcher)
  return value === matcher
}

function isLogicMatcher(m: any): m is LogicMatcher<any> {
  return (
    m && typeof m === 'object' && ('$or' in m || '$and' in m || '$not' in m)
  )
}
