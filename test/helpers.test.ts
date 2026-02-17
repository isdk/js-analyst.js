// ============================================================
//  test/helpers.test.ts — AST 辅助函数测试
// ============================================================

import { describe, it, expect } from 'vitest';
import * as helpers from '../src/ast/helpers.js';
import type { ASTNode } from '../src/types.js';

describe('AST Helpers', () => {
  describe('isNode', () => {
    it('should identify valid nodes', () => {
      expect(helpers.isNode({ type: 'Identifier' })).toBe(true);
      expect(helpers.isNode({ type: 'Literal', value: 1 })).toBe(true);
    });

    it('should reject invalid nodes', () => {
      expect(helpers.isNode(null)).toBe(false);
      expect(helpers.isNode(undefined)).toBe(false);
      expect(helpers.isNode('string')).toBe(false);
      expect(helpers.isNode(42)).toBe(false);
      expect(helpers.isNode({})).toBe(false);
      expect(helpers.isNode({ noType: true })).toBe(false);
    });
  });

  describe('isFunctionNode', () => {
    it('should identify function declarations', () => {
      expect(helpers.isFunctionNode({ type: 'FunctionDeclaration' })).toBe(true);
    });

    it('should identify variable declarators with functions', () => {
      expect(helpers.isFunctionNode({
        type: 'VariableDeclarator',
        init: { type: 'ArrowFunctionExpression' }
      })).toBe(true);
    });

    it('should identify properties with functions', () => {
      expect(helpers.isFunctionNode({
        type: 'Property',
        value: { type: 'FunctionExpression' }
      })).toBe(true);
      expect(helpers.isFunctionNode({
        type: 'Property',
        value: { type: 'Literal' } // 递归返回 false 的情况
      })).toBe(false);
      expect(helpers.isFunctionNode({
        type: 'PropertyDefinition',
        value: { type: 'ArrowFunctionExpression' }
      })).toBe(true);
      expect(helpers.isFunctionNode({
        type: 'PropertyDefinition',
        value: null
      })).toBe(false);
    });

    it('should return false for non-function nodes', () => {
      expect(helpers.isFunctionNode({ type: 'Literal' })).toBe(false);
      expect(helpers.isFunctionNode({ type: 'VariableDeclarator', init: null })).toBe(false);
      expect(helpers.isFunctionNode(null)).toBe(false);
    });
  });

  describe('isLoopNode', () => {
    it('should identify loop nodes', () => {
      expect(helpers.isLoopNode({ type: 'ForStatement' })).toBe(true);
      expect(helpers.isLoopNode({ type: 'WhileStatement' })).toBe(true);
      expect(helpers.isLoopNode({ type: 'DoWhileStatement' })).toBe(true);
      expect(helpers.isLoopNode({ type: 'ForInStatement' })).toBe(true);
      expect(helpers.isLoopNode({ type: 'ForOfStatement' })).toBe(true);
    });

    it('should return false for non-loop nodes', () => {
      expect(helpers.isLoopNode({ type: 'IfStatement' })).toBe(false);
    });
  });

  describe('isIdentifier', () => {
    it('should identify identifiers', () => {
      expect(helpers.isIdentifier({ type: 'Identifier', name: 'foo' })).toBe(true);
      expect(helpers.isIdentifier({ type: 'Identifier', name: 'foo' }, 'foo')).toBe(true);
      expect(helpers.isIdentifier({ type: 'Identifier', name: 'foo' }, 'bar')).toBe(false);
    });

    it('should return false for non-identifiers', () => {
      expect(helpers.isIdentifier({ type: 'Literal' })).toBe(false);
    });
  });

  describe('isLiteral', () => {
    it('should identify literals', () => {
      expect(helpers.isLiteral({ type: 'Literal', value: 42 })).toBe(true);
      expect(helpers.isLiteral({ type: 'Literal', value: 42 }, 42)).toBe(true);
      expect(helpers.isLiteral({ type: 'Literal', value: 42 }, 43)).toBe(false);
    });
  });

  describe('isMemberExpression', () => {
    const node = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'log' },
      computed: false,
    };

    it('should identify member expressions', () => {
      expect(helpers.isMemberExpression(node)).toBe(true);
      expect(helpers.isMemberExpression(node, 'console')).toBe(true);
      expect(helpers.isMemberExpression(node, 'console', 'log')).toBe(true);
      expect(helpers.isMemberExpression(node, 'window')).toBe(false);
      expect(helpers.isMemberExpression(node, 'console', 'warn')).toBe(false);
      expect(helpers.isMemberExpression({ type: 'Identifier' })).toBe(false);
    });

    it('should handle computed properties', () => {
      const computedNode = { ...node, computed: true };
      expect(helpers.isMemberExpression(computedNode, 'console', 'log')).toBe(false);
    });
  });

  describe('isCallExpression', () => {
    it('should identify call expressions', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' }
      };
      expect(helpers.isCallExpression(node)).toBe(true);
      expect(helpers.isCallExpression(node, 'foo')).toBe(true);
      expect(helpers.isCallExpression(node, 'bar')).toBe(false);
      expect(helpers.isCallExpression({ type: 'Literal' })).toBe(false);
    });

    it('should identify method calls', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
          computed: false,
        }
      };
      expect(helpers.isCallExpression(node, 'log')).toBe(true);
      expect(helpers.isCallExpression(node, 'warn')).toBe(false);
      expect(helpers.isCallExpression({ type: 'CallExpression', callee: null }, 'log')).toBe(false);
    });
  });

  describe('isBinaryExpression', () => {
    const node = {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Identifier', name: 'a' },
      right: { type: 'Identifier', name: 'b' }
    };

    it('should identify binary expressions', () => {
      expect(helpers.isBinaryExpression(node)).toBe(true);
      expect(helpers.isBinaryExpression(node, '+')).toBe(true);
      expect(helpers.isBinaryExpression(node, '+', 'a')).toBe(true);
      expect(helpers.isBinaryExpression(node, '+', 'a', 'b')).toBe(true);
      expect(helpers.isBinaryExpression(node, '-')).toBe(false);
      expect(helpers.isBinaryExpression(node, '+', 'x')).toBe(false);
      expect(helpers.isBinaryExpression(node, '+', 'a', 'y')).toBe(false);
      expect(helpers.isBinaryExpression({ type: 'Literal' })).toBe(false);
    });
  });

  describe('isAssignmentExpression', () => {
    it('should identify assignment expressions', () => {
      const node = { type: 'AssignmentExpression', operator: '=' };
      expect(helpers.isAssignmentExpression(node)).toBe(true);
      expect(helpers.isAssignmentExpression(node, '=')).toBe(true);
      expect(helpers.isAssignmentExpression(node, '+=')).toBe(false);
      expect(helpers.isAssignmentExpression({ type: 'Literal' })).toBe(false);
    });
  });

  describe('Type Guards', () => {
    it('isReturnStatement', () => {
      expect(helpers.isReturnStatement({ type: 'ReturnStatement' })).toBe(true);
      expect(helpers.isReturnStatement({ type: 'Literal' })).toBe(false);
    });

    it('isAwaitExpression', () => {
      expect(helpers.isAwaitExpression({ type: 'AwaitExpression' })).toBe(true);
      expect(helpers.isAwaitExpression({ type: 'Literal' })).toBe(false);
    });

    it('isYieldExpression', () => {
      expect(helpers.isYieldExpression({ type: 'YieldExpression' })).toBe(true);
      expect(helpers.isYieldExpression({ type: 'Literal' })).toBe(false);
    });

    it('isThrowStatement', () => {
      expect(helpers.isThrowStatement({ type: 'ThrowStatement' })).toBe(true);
      expect(helpers.isThrowStatement({ type: 'Literal' })).toBe(false);
    });

    it('isBlockStatement', () => {
      expect(helpers.isBlockStatement({ type: 'BlockStatement' })).toBe(true);
      expect(helpers.isBlockStatement({ type: 'Literal' })).toBe(false);
    });

    it('isArrowFunction', () => {
      expect(helpers.isArrowFunction({ type: 'ArrowFunctionExpression' })).toBe(true);
      expect(helpers.isArrowFunction({ type: 'Literal' })).toBe(false);
    });

    it('isConditionalExpression', () => {
      expect(helpers.isConditionalExpression({ type: 'ConditionalExpression' })).toBe(true);
      expect(helpers.isConditionalExpression({ type: 'Literal' })).toBe(false);
    });

    it('isTemplateLiteral', () => {
      expect(helpers.isTemplateLiteral({ type: 'TemplateLiteral' })).toBe(true);
      expect(helpers.isTemplateLiteral({ type: 'Literal' })).toBe(false);
    });
  });

  describe('nodeGet', () => {
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'log' }
      }
    } as unknown as ASTNode;

    it('should get nested values', () => {
      expect(helpers.nodeGet(node, 'type')).toBe('CallExpression');
      expect(helpers.nodeGet(node, 'callee.object.name')).toBe('console');
      expect(helpers.nodeGet(node, 'callee.property.name')).toBe('log');
    });

    it('should return undefined for invalid paths', () => {
      expect(helpers.nodeGet(node, 'callee.none.name')).toBeUndefined();
      expect(helpers.nodeGet(node, 'x.y.z')).toBeUndefined();
      expect(helpers.nodeGet(null as any, 'type')).toBeUndefined();
    });
  });

  describe('getChildren', () => {
    it('should return child nodes', () => {
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'foo' },
        consequent: { type: 'BlockStatement', body: [] },
        alternate: null,
      } as unknown as ASTNode;

      const children = helpers.getChildren(node);
      expect(children).toHaveLength(2);
      expect(children).toContain(node.test);
      expect(children).toContain(node.consequent);
    });

    it('should handle array of children with non-node items', () => {
      const node = {
        type: 'BlockStatement',
        body: [
          { type: 'ExpressionStatement' },
          null,
          'string',
          { type: 'ReturnStatement' }
        ]
      } as unknown as ASTNode;

      const children = helpers.getChildren(node);
      expect(children).toHaveLength(2);
    });

    it('should handle single child node and skip metadata keys', () => {
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal' },
        start: 0,
        end: 10
      } as unknown as ASTNode;

      const children = helpers.getChildren(node);
      expect(children).toHaveLength(1);
      expect(children[0].type).toBe('Literal');
    });
  });
});
