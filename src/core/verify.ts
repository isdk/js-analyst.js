// ============================================================
//  src/core/verify.ts — 声明式验证引擎
// ============================================================

import type {
  ASTNode, IFunctionInfo, IReturnHelper,
  VerifySchema, ParamSchema, BodySchema,
  VerifyResult, VerifyFailure, Matcher,
} from '../types.js';
import { isIdentifier, isBinaryExpression, isCallExpression } from '../ast/helpers.js';

// =================== ReturnHelper ===================

/**
 * Return 语句辅助判断工具
 * 让验证 schema 中的 returns 回调写起来更简洁
 */
class ReturnHelper implements IReturnHelper {
  readonly node: ASTNode | null;

  constructor(node: ASTNode | null) {
    this.node = node;
  }

  isBinaryOp(operator: string, leftName: string, rightName: string): boolean {
    return isBinaryExpression(this.node, operator, leftName, rightName);
  }

  isCall(calleeName?: string): boolean {
    return isCallExpression(this.node, calleeName);
  }

  isLiteral(value?: unknown): boolean {
    if (this.node?.type !== 'Literal') return false;
    return value === undefined || (this.node as any).value === value;
  }

  isIdentifier(name?: string): boolean {
    return isIdentifier(this.node, name);
  }

  isMemberAccess(objName: string, propName: string): boolean {
    const n = this.node;
    if (n?.type !== 'MemberExpression') return false;
    const obj = (n as any).object;
    const prop = (n as any).property;
    return isIdentifier(obj, objName) && isIdentifier(prop, propName);
  }

  isTemplateLiteral(): boolean {
    return this.node?.type === 'TemplateLiteral';
  }
}

// =================== Verifier ===================

class Verifier {
  private readonly fn: IFunctionInfo;

  constructor(fn: IFunctionInfo) {
    this.fn = fn;
  }

  verify(schema: VerifySchema): VerifyResult {
    const failures: VerifyFailure[] = [];

    // ---- 基本属性 ----
    this.check(failures, 'name',       schema.name,       this.fn.name);
    this.check(failures, 'async',      schema.async,      this.fn.isAsync);
    this.check(failures, 'generator',  schema.generator,  this.fn.isGenerator);
    this.check(failures, 'arrow',      schema.arrow,      this.fn.isArrow);
    this.check(failures, 'returnType', schema.returnType,  this.fn.returnType);
    this.check(failures, 'paramCount', schema.paramCount,  this.fn.paramCount);

    // ---- 逐个参数验证 ----
    if (schema.params !== undefined) {
      this.verifyParams(failures, schema.params);
    }

    // ---- 函数体验证 ----
    if (schema.body !== undefined) {
      this.verifyBody(failures, schema.body);
    }

    // ---- 自定义整体验证 ----
    if (typeof schema.custom === 'function') {
      this.runCustom(failures, 'custom', () => schema.custom!(this.fn));
    }

    const count = failures.length;
    return {
      passed: count === 0,
      failures,
      summary: count === 0
        ? '✅ All checks passed'
        : `❌ ${count} check(s) failed`,
    };
  }

  // ---- 参数验证 ----

  private verifyParams(failures: VerifyFailure[], schemas: ParamSchema[]): void {
    if (schemas.length !== this.fn.paramCount) {
      failures.push({
        path: 'params.length',
        expected: schemas.length,
        actual: this.fn.paramCount,
        message: `Expected ${schemas.length} params, got ${this.fn.paramCount}`,
      });
      return;
    }

    schemas.forEach((paramSchema, i) => {
      const param = this.fn.param(i);
      if (!param) return;

      const prefix = `params[${i}]`;
      this.check(failures, `${prefix}.name`,           paramSchema.name,           param.name);
      this.check(failures, `${prefix}.type`,           paramSchema.type,           param.type);
      this.check(failures, `${prefix}.hasDefault`,     paramSchema.hasDefault,     param.hasDefault);
      this.check(failures, `${prefix}.isRest`,         paramSchema.isRest,         param.isRest);
      this.check(failures, `${prefix}.isDestructured`, paramSchema.isDestructured, param.isDestructured);
      this.check(failures, `${prefix}.pattern`,        paramSchema.pattern,        param.pattern);
    });
  }

  // ---- 函数体验证 ----

  private verifyBody(failures: VerifyFailure[], schema: BodySchema): void {
    const body = this.fn.body;

    this.check(failures, 'body.statementCount', schema.statementCount, body.statementCount);

    // has
    if (schema.has !== undefined) {
      const selectors = Array.isArray(schema.has) ? schema.has : [schema.has];
      for (const sel of selectors) {
        if (!body.has(sel)) {
          failures.push({
            path: `body.has("${sel}")`,
            expected: true,
            actual: false,
            message: `Expected body to contain ${sel}`,
          });
        }
      }
    }

    // notHas
    if (schema.notHas !== undefined) {
      const selectors = Array.isArray(schema.notHas) ? schema.notHas : [schema.notHas];
      for (const sel of selectors) {
        if (body.has(sel)) {
          failures.push({
            path: `body.notHas("${sel}")`,
            expected: false,
            actual: true,
            message: `Expected body NOT to contain ${sel}`,
          });
        }
      }
    }

    // returns
    if (typeof schema.returns === 'function') {
      const returns = body.returns;
      for (let i = 0; i < returns.length; i++) {
        const ret = returns[i]!;
        const argument = (ret as any).argument as ASTNode | null;
        const helper = new ReturnHelper(argument);

        try {
          const passed = schema.returns(helper, ret, i);
          if (passed === false) {
            failures.push({
              path: `body.returns[${i}]`,
              message: 'Return value check failed',
            });
          }
        } catch (e) {
          failures.push({
            path: `body.returns[${i}]`,
            message: (e as Error).message,
          });
        }
      }
    }

    // custom
    if (typeof schema.custom === 'function') {
      this.runCustom(failures, 'body.custom', () => schema.custom!(body));
    }
  }

  // ---- 通用匹配 ----

  /**
   * 通用匹配：支持精确值 / 正则 / 函数断言
   * expected 为 undefined 时跳过检查
   */
  private check<T>(
    failures: VerifyFailure[],
    path: string,
    expected: Matcher<T> | undefined,
    actual: T,
  ): void {
    if (expected === undefined) return;

    let passed: boolean;

    if (typeof expected === 'function') {
      try {
        passed = (expected as (v: T) => boolean)(actual);
      } catch {
        passed = false;
      }
    } else if (expected instanceof RegExp) {
      passed = expected.test(String(actual));
    } else {
      passed = actual === expected;
    }

    if (!passed) {
      failures.push({
        path,
        expected,
        actual,
        message: `${path}: expected ${String(expected)}, got ${String(actual)}`,
      });
    }
  }

  /** 执行自定义验证函数 */
  private runCustom(
    failures: VerifyFailure[],
    path: string,
    fn: () => boolean | void,
  ): void {
    try {
      const result = fn();
      if (result === false) {
        failures.push({ path, message: `${path}: custom check returned false` });
      }
    } catch (e) {
      failures.push({ path, message: (e as Error).message });
    }
  }
}

// =================== 导出 ===================

export function createVerifier(fnInfo: IFunctionInfo) {
  return new Verifier(fnInfo);
}
