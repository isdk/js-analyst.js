// ============================================================
//  src/ast/helpers.ts — AST 节点判断 & 工具
// ============================================================

import type { ASTNode } from '../types.js';

// ---------- 类型集合 ----------

export const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'MethodDefinition',
  'PropertyDefinition',
  'TSMethodSignature',
  'TSDeclareFunction',
  'VariableDeclarator',
] as const);

export const LOOP_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
] as const);

export const DECLARATION_TYPES = new Set([
  'VariableDeclaration',
  'FunctionDeclaration',
  'ClassDeclaration',
] as const);

// ---------- 类型守卫 & 判断函数 ----------

export function isNode(value: unknown): value is ASTNode {
  return value != null
    && typeof value === 'object'
    && 'type' in value
    && typeof (value as ASTNode).type === 'string';
}

export function isFunctionNode(node: unknown): boolean {
  if (!isNode(node)) return false;
  const type = node.type;
  if (type === 'VariableDeclarator') {
    return isFunctionNode((node as any).init);
  }
  if (type === 'Property' || type === 'PropertyDefinition') {
    return isFunctionNode((node as any).value);
  }
  if (FUNCTION_TYPES.has(type as any)) return true;
  return false;
}

export function isLoopNode(node: unknown): boolean {
  return isNode(node) && LOOP_TYPES.has(node.type as any);
}

export function isIdentifier(node: unknown, name?: string): boolean {
  if (!isNode(node) || node.type !== 'Identifier') return false;
  return name === undefined || (node as any).name === name;
}

export function isLiteral(node: unknown, value?: unknown): boolean {
  if (!isNode(node) || node.type !== 'Literal') return false;
  return value === undefined || (node as any).value === value;
}

export function isMemberExpression(
  node: unknown,
  objName?: string,
  propName?: string,
): boolean {
  if (!isNode(node) || node.type !== 'MemberExpression') return false;
  const n = node as any;
  if (objName !== undefined && !isIdentifier(n.object, objName)) return false;
  if (propName !== undefined) {
    if (n.computed) return false;
    if (!isIdentifier(n.property, propName)) return false;
  }
  return true;
}

export function isCallExpression(node: unknown, calleeName?: string): boolean {
  if (!isNode(node) || node.type !== 'CallExpression') return false;
  if (calleeName === undefined) return true;
  const callee = (node as any).callee;
  if (isIdentifier(callee, calleeName)) return true;
  if (callee?.type === 'MemberExpression' && isIdentifier(callee.property, calleeName)) {
    return true;
  }
  return false;
}

export function isBinaryExpression(
  node: unknown,
  operator?: string,
  leftName?: string,
  rightName?: string,
): boolean {
  if (!isNode(node) || node.type !== 'BinaryExpression') return false;
  const n = node as any;
  if (operator !== undefined && n.operator !== operator) return false;
  if (leftName !== undefined && !isIdentifier(n.left, leftName)) return false;
  if (rightName !== undefined && !isIdentifier(n.right, rightName)) return false;
  return true;
}

export function isAssignmentExpression(node: unknown, operator?: string): boolean {
  if (!isNode(node) || node.type !== 'AssignmentExpression') return false;
  return operator === undefined || (node as any).operator === operator;
}

export function isReturnStatement(node: unknown): boolean {
  return isNode(node) && node.type === 'ReturnStatement';
}

export function isAwaitExpression(node: unknown): boolean {
  return isNode(node) && node.type === 'AwaitExpression';
}

export function isYieldExpression(node: unknown): boolean {
  return isNode(node) && node.type === 'YieldExpression';
}

export function isThrowStatement(node: unknown): boolean {
  return isNode(node) && node.type === 'ThrowStatement';
}

export function isBlockStatement(node: unknown): boolean {
  return isNode(node) && node.type === 'BlockStatement';
}

export function isArrowFunction(node: unknown): boolean {
  return isNode(node) && node.type === 'ArrowFunctionExpression';
}

export function isConditionalExpression(node: unknown): boolean {
  return isNode(node) && node.type === 'ConditionalExpression';
}

export function isTemplateLiteral(node: unknown): boolean {
  return isNode(node) && node.type === 'TemplateLiteral';
}

// ---------- 工具函数 ----------

/**
 * 安全深层取值
 *
 * @example
 * nodeGet(node, 'callee.object.name')  // node?.callee?.object?.name
 */
export function nodeGet(node: ASTNode, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = node;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** 非元数据的 key（用于遍历子节点时跳过） */
const META_KEYS = new Set(['type', 'start', 'end', 'loc', 'range', 'parent']);

/**
 * 获取节点的所有子 AST 节点
 */
export function getChildren(node: ASTNode): ASTNode[] {
  const children: ASTNode[] = [];
  for (const [key, val] of Object.entries(node)) {
    if (META_KEYS.has(key)) continue;
    if (Array.isArray(val)) {
      for (const item of val) {
        if (isNode(item)) children.push(item);
      }
    } else if (isNode(val)) {
      children.push(val);
    }
  }
  return children;
}
