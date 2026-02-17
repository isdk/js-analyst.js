// ============================================================
//  src/ast/query.ts — 简易 AST 查询引擎
// ============================================================

import type { ASTNode } from '../types.js';
import { findAll, findInScope } from './traverse.js';

/**
 * 解析后的选择器
 */
interface ParsedSelector {
  type: string;
  attrs: Record<string, string>;
}

/**
 * 解析选择器字符串
 *
 * 支持语法:
 *   - `'ReturnStatement'`                    按类型
 *   - `'Identifier[name="x"]'`              按类型 + 单属性
 *   - `'BinaryExpression[operator="+"]'`     按类型 + 单属性
 *   - `'CallExpression[callee.name="foo"]'`  暂不支持深层属性
 */
function parseSelector(selector: string): ParsedSelector {
  const match = selector.match(/^(\w+)(?:\[(.+)\])?$/);
  if (!match) {
    return { type: selector, attrs: {} };
  }

  const type = match[1]!;
  const attrs: Record<string, string> = {};

  if (match[2]) {
    // 支持多属性: [name="x",operator="+"]
    const attrParts = match[2].split(',');
    for (const part of attrParts) {
      const eqIndex = part.indexOf('=');
      if (eqIndex === -1) continue;
      const key = part.slice(0, eqIndex).trim();
      const val = part.slice(eqIndex + 1).trim().replace(/["']/g, '');
      attrs[key] = val;
    }
  }

  return { type, attrs };
}

/**
 * 构建匹配谓词
 */
function buildPredicate(selector: string): (node: ASTNode) => boolean {
  const { type, attrs } = parseSelector(selector);

  return (node: ASTNode): boolean => {
    if (node.type !== type) return false;
    for (const [key, expected] of Object.entries(attrs)) {
      const actual = (node as Record<string, unknown>)[key];
      if (String(actual) !== expected) return false;
    }
    return true;
  };
}

/**
 * 查询所有匹配节点
 *
 * @param root    - 根节点
 * @param selector - 查询选择器
 * @param scoped  - 是否限制在当前函数作用域
 * @param owner   - 作用域所属函数节点
 */
export function query(
  root: ASTNode,
  selector: string,
  scoped = false,
  owner?: ASTNode,
): ASTNode[] {
  const predicate = buildPredicate(selector);

  if (scoped && owner) {
    return findInScope(root, predicate, owner);
  }
  return findAll(root, predicate);
}

/**
 * 是否存在匹配节点
 */
export function has(
  root: ASTNode,
  selector: string,
  scoped = false,
  owner?: ASTNode,
): boolean {
  return query(root, selector, scoped, owner).length > 0;
}
