// ============================================================
//  src/ast/traverse.ts — AST 遍历（不依赖任何解析器）
// ============================================================

import type { ASTNode } from '../types.js';
import { isNode, isFunctionNode as isFuncNode } from './helpers.js';

type Predicate = (node: ASTNode) => boolean;

/**
 * 深度优先查找第一个匹配节点
 */
export function findFirst(node: unknown, predicate: Predicate): ASTNode | null {
  if (!isNode(node)) return null;
  if (predicate(node)) return node;

  for (const [key, val] of Object.entries(node)) {
    if (key === 'parent') continue;

    if (Array.isArray(val)) {
      for (const item of val) {
        const found = findFirst(item, predicate);
        if (found) return found;
      }
    } else if (isNode(val)) {
      const found = findFirst(val, predicate);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 查找所有匹配节点
 */
export function findAll(
  node: unknown,
  predicate: Predicate,
  results: ASTNode[] = [],
): ASTNode[] {
  if (!isNode(node)) return results;
  if (predicate(node)) results.push(node);

  for (const [key, val] of Object.entries(node)) {
    if (key === 'parent') continue;

    if (Array.isArray(val)) {
      for (const item of val) {
        findAll(item, predicate, results);
      }
    } else if (isNode(val)) {
      findAll(val, predicate, results);
    }
  }

  return results;
}

/**
 * 在当前函数作用域内查找（不深入嵌套函数）
 *
 * @param node    - 当前遍历节点
 * @param predicate - 匹配条件
 * @param owner   - 所属函数节点（遇到其他函数节点时停止）
 */
export function findInScope(
  node: unknown,
  predicate: Predicate,
  owner: ASTNode,
  results: ASTNode[] = [],
): ASTNode[] {
  if (!isNode(node)) return results;
  if (predicate(node)) results.push(node);

  // 遇到嵌套函数时停止深入（但 owner 自身不停止）
  if (isFuncNode(node) && node !== owner) return results;

  for (const [key, val] of Object.entries(node)) {
    if (key === 'parent') continue;

    if (Array.isArray(val)) {
      for (const item of val) {
        findInScope(item, predicate, owner, results);
      }
    } else if (isNode(val)) {
      findInScope(val, predicate, owner, results);
    }
  }

  return results;
}

// 重新导出 helpers 中的 isFunctionNode 以保持向后兼容
export { isFuncNode as isFunctionNode };
