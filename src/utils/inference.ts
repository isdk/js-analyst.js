import type { ASTNode } from '../types.js'

/**
 * A lightweight type inferencer for JavaScript expressions.
 * Aimed at providing basic type hints when TS annotations are missing.
 */
export function inferType(node: ASTNode | null | undefined): string | null {
  if (!node) return null

  switch (node.type) {
    case 'Literal': {
      const val = (node as any).value
      if (val === null) return 'null'
      return typeof val
    }
    case 'TemplateLiteral':
      return 'string'
    case 'ObjectExpression':
      return 'object'
    case 'ArrayExpression':
      return 'array'
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return 'function'
    case 'ClassExpression':
      return 'class'

    case 'UnaryExpression': {
      const op = (node as any).operator
      if (op === '!') return 'boolean'
      if (op === 'void') return 'undefined'
      if (op === 'typeof') return 'string'
      if (op === '+' || op === '-' || op === '~' || op === 'delete') return 'number'
      return null
    }

    case 'BinaryExpression': {
      const op = (node as any).operator
      if (['==', '!=', '===', '!==', '<', '<=', '>', '>=', 'instanceof', 'in'].includes(op)) {
        return 'boolean'
      }
      if (['-', '*', '/', '%', '**', '&', '|', '^', '<<', '>>', '>>>'].includes(op)) {
        return 'number'
      }
      if (op === '+') {
        // In JS, + can be string or number. For verification purposes, we might return a union or a hint.
        // Given our checkType logic, 'number|string' or just null (any) might work.
        // Let's return null to signify 'any' but avoid false positives.
        return null 
      }
      return null
    }

    case 'LogicalExpression':
      // Logical expressions return one of the operands, so the type is a union of operands.
      // For simplicity, we return null (any).
      return null

    case 'AssignmentExpression':
      return inferType((node as any).right)

    case 'ConditionalExpression': {
      const left = inferType((node as any).consequent)
      const right = inferType((node as any).alternate)
      if (left === right) return left
      return null // Represents a union or unknown
    }

    case 'NewExpression': {
      const callee = (node as any).callee
      if (callee.type === 'Identifier') {
        const name = callee.name
        if (['String', 'Number', 'Boolean'].includes(name)) return name.toLowerCase()
        if (name === 'Array') return 'array'
        if (name === 'Object') return 'object'
        if (name === 'RegExp') return 'regexp'
        if (name === 'Date') return 'date'
        return name // Keep original case for custom classes
      }
      return 'object'
    }

    case 'Identifier':
      // Without symbol table, we can't know the type of an identifier.
      if ((node as any).name === 'undefined') return 'undefined'
      if ((node as any).name === 'NaN' || (node as any).name === 'Infinity') return 'number'
      return null

    default:
      return null
  }
}
