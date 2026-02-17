// ============================================================
//  test/traverse.test.ts — AST 遍历测试
// ============================================================

import { describe, it, expect } from 'vitest';
import { findFirst, findAll, findInScope } from '../src/ast/traverse.js';
import type { ASTNode } from '../src/types.js';

describe('AST Traversal', () => {
  const tree: ASTNode = {
    type: 'Program',
    body: [
      {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'a' } },
            {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] }
            }
          ]
        }
      },
      { type: 'VariableDeclaration', declarations: [] }
    ]
  } as any;

  it('findFirst should find the first matching node', () => {
    const found = findFirst(tree, n => n.type === 'Identifier');
    expect(found).not.toBeNull();
    expect((found as any).name).toBe('foo');
  });

  it('findFirst should return null if no match', () => {
    expect(findFirst(tree, n => n.type === 'NonExistent')).toBeNull();
  });

  it('findAll should find all matching nodes', () => {
    const found = findAll(tree, n => n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression');
    expect(found).toHaveLength(2);
  });

  it('findInScope should not enter nested functions', () => {
    const mainFunc = tree.body[0] as ASTNode;
    // Inside mainFunc, we have an Identifier 'a' and a nested FunctionExpression
    const ids = findInScope(mainFunc, n => n.type === 'Identifier', mainFunc);
    // Should find 'foo' (from decl id) and 'a', but if we look at the body only:
    const bodyIds = findInScope((mainFunc as any).body, n => n.type === 'Identifier', mainFunc);
    expect(bodyIds.map((n: any) => n.name)).toContain('a');
    
    const allFuncs = findInScope(mainFunc, n => n.type.includes('Function'), mainFunc);
    // Should find mainFunc itself, and the nested FunctionExpression (but not its children)
    expect(allFuncs).toHaveLength(2); 
    // If it's a nested function, findInScope returns results but doesn't recurse.
  });

  it('should handle non-node inputs', () => {
    expect(findFirst(null, () => true)).toBeNull();
    expect(findAll(undefined, () => true)).toEqual([]);
    expect(findInScope(123, () => true, {} as any)).toEqual([]);
  });

  it('should skip parent property to avoid infinite loops', () => {
    const node: any = { type: 'X' };
    node.parent = node;
    const found = findFirst(node, n => n.type === 'Y');
    expect(found).toBeNull(); // Should not hang
  });
});
