// ============================================================
//  src/core/verify.ts — Declarative Verification Engine
// ============================================================

import type {
  ASTNode,
  IFunctionInfo,
  IReturnHelper,
  VerifySchema,
  ParamSchema,
  BodySchema,
  VerifyResult,
  VerifyFailure,
  Matcher,
} from '../types.js'
import {
  isIdentifier,
  isBinaryExpression,
  isCallExpression,
} from '../ast/helpers.js'

// =================== ReturnHelper ===================

/**
 * Implementation of {@link IReturnHelper} to assist in verifying
 * return statements within a function body.
 *
 * Provides a set of fluent predicate methods for checking common
 * return value patterns.
 */
class ReturnHelper implements IReturnHelper {
  readonly node: ASTNode | null

  /**
   * @param node - The AST node of the return argument.
   */
  constructor(node: ASTNode | null) {
    this.node = node
  }

  /** Checks if the return value is a binary expression with a specific operator. */
  isBinaryOp(operator: string, leftName: string, rightName: string): boolean {
    return isBinaryExpression(this.node, operator, leftName, rightName)
  }

  /** Checks if the return value is a call to a specific function or method. */
  isCall(calleeName?: string): boolean {
    return isCallExpression(this.node, calleeName)
  }

  /** Checks if the return value is a specific literal. */
  isLiteral(value?: unknown): boolean {
    if (this.node?.type !== 'Literal') return false
    return value === undefined || (this.node as any).value === value
  }

  /** Checks if the return value is a specific identifier. */
  isIdentifier(name?: string): boolean {
    return isIdentifier(this.node, name)
  }

  /** Checks if the return value is a member access (e.g., `obj.prop`). */
  isMemberAccess(objName: string, propName: string): boolean {
    const n = this.node
    if (n?.type !== 'MemberExpression') return false
    const obj = (n as any).object
    const prop = (n as any).property
    return isIdentifier(obj, objName) && isIdentifier(prop, propName)
  }

  /** Checks if the return value is a template literal. */
  isTemplateLiteral(): boolean {
    return this.node?.type === 'TemplateLiteral'
  }
}

// =================== Verifier ===================

/**
 * Internal class responsible for executing the verification logic
 * against a given schema.
 */
class Verifier {
  private readonly fn: IFunctionInfo

  /**
   * @param fn - The function info to verify.
   */
  constructor(fn: IFunctionInfo) {
    this.fn = fn
  }

  /**
   * Executes all checks defined in the schema.
   *
   * @param schema - The schema to verify against.
   * @returns The combined result of all verification checks.
   */
  verify(schema: VerifySchema): VerifyResult {
    const failures: VerifyFailure[] = []

    // ---- Base Properties ----
    this.check(failures, 'name', schema.name, this.fn.name)
    this.check(failures, 'kind', schema.kind, this.fn.kind)
    this.check(failures, 'syntax', schema.syntax, this.fn.syntax)
    this.check(failures, 'static', schema.static, this.fn.isStatic)
    this.check(failures, 'async', schema.async, this.fn.isAsync)
    this.check(failures, 'generator', schema.generator, this.fn.isGenerator)
    this.check(failures, 'arrow', schema.arrow, this.fn.isArrow)
    this.check(failures, 'returnType', schema.returnType, this.fn.returnType)
    this.check(failures, 'paramCount', schema.paramCount, this.fn.paramCount)

    // ---- Parameters Verification ----
    if (schema.params !== undefined) {
      this.verifyParams(failures, schema.params)
    }

    // ---- Body Verification ----
    if (schema.body !== undefined) {
      this.verifyBody(failures, schema.body)
    }

    // ---- Custom Global Verification ----
    if (typeof schema.custom === 'function') {
      this.runCustom(failures, 'custom', () => schema.custom!(this.fn))
    }

    const count = failures.length
    return {
      passed: count === 0,
      failures,
      summary:
        count === 0 ? '✅ All checks passed' : `❌ ${count} check(s) failed`,
    }
  }

  // ---- Private Verification Helpers ----

  private verifyParams(
    failures: VerifyFailure[],
    schemas: ParamSchema[]
  ): void {
    if (schemas.length !== this.fn.paramCount) {
      failures.push({
        path: 'params.length',
        expected: schemas.length,
        actual: this.fn.paramCount,
        message: `Expected ${schemas.length} params, got ${this.fn.paramCount}`,
      })
      return
    }

    schemas.forEach((paramSchema, i) => {
      const param = this.fn.param(i)
      if (!param) return

      const prefix = `params[${i}]`
      this.check(failures, `${prefix}.name`, paramSchema.name, param.name)
      this.check(failures, `${prefix}.type`, paramSchema.type, param.type)
      this.check(
        failures,
        `${prefix}.hasDefault`,
        paramSchema.hasDefault,
        param.hasDefault
      )
      this.check(failures, `${prefix}.isRest`, paramSchema.isRest, param.isRest)
      this.check(
        failures,
        `${prefix}.isDestructured`,
        paramSchema.isDestructured,
        param.isDestructured
      )
      this.check(
        failures,
        `${prefix}.pattern`,
        paramSchema.pattern,
        param.pattern
      )
    })
  }

  private verifyBody(failures: VerifyFailure[], schema: BodySchema): void {
    const body = this.fn.body

    this.check(
      failures,
      'body.statementCount',
      schema.statementCount,
      body.statementCount
    )

    // contains (has)
    if (schema.has !== undefined) {
      const selectors = Array.isArray(schema.has) ? schema.has : [schema.has]
      for (const sel of selectors) {
        if (!body.has(sel)) {
          failures.push({
            path: `body.has("${sel}")`,
            expected: true,
            actual: false,
            message: `Expected body to contain ${sel}`,
          })
        }
      }
    }

    // not contains (notHas)
    if (schema.notHas !== undefined) {
      const selectors = Array.isArray(schema.notHas)
        ? schema.notHas
        : [schema.notHas]
      for (const sel of selectors) {
        if (body.has(sel)) {
          failures.push({
            path: `body.notHas("${sel}")`,
            expected: false,
            actual: true,
            message: `Expected body NOT to contain ${sel}`,
          })
        }
      }
    }

    // returns check
    if (typeof schema.returns === 'function') {
      const returns = body.returns
      for (let i = 0; i < returns.length; i++) {
        const ret = returns[i]!
        const argument = (ret as any).argument as ASTNode | null
        const helper = new ReturnHelper(argument)

        try {
          const passed = schema.returns(helper, ret, i)
          if (passed === false) {
            failures.push({
              path: `body.returns[${i}]`,
              message: 'Return value check failed',
            })
          }
        } catch (e) {
          failures.push({
            path: `body.returns[${i}]`,
            message: (e as Error).message,
          })
        }
      }
    }

    // custom body check
    if (typeof schema.custom === 'function') {
      this.runCustom(failures, 'body.custom', () => schema.custom!(body))
    }
  }

  /**
   * Generic matching logic supporting literals, regex, and functions.
   */
  private check<T>(
    failures: VerifyFailure[],
    path: string,
    expected: Matcher<T> | undefined,
    actual: T
  ): void {
    if (expected === undefined) return

    let passed: boolean

    if (typeof expected === 'function') {
      try {
        passed = (expected as (v: T) => boolean)(actual)
      } catch {
        passed = false
      }
    } else if (expected instanceof RegExp) {
      passed = expected.test(String(actual))
    } else {
      passed = actual === expected
    }

    if (!passed) {
      failures.push({
        path,
        expected,
        actual,
        message: `${path}: expected ${String(expected)}, got ${String(actual)}`,
      })
    }
  }

  /** Runs a custom verification predicate. */
  private runCustom(
    failures: VerifyFailure[],
    path: string,
    fn: () => boolean | void
  ): void {
    try {
      const result = fn()
      if (result === false) {
        failures.push({ path, message: `${path}: custom check returned false` })
      }
    } catch (e) {
      failures.push({ path, message: (e as Error).message })
    }
  }
}

// =================== Export ===================

/**
 * Creates a verifier for the given function information.
 *
 * @param fnInfo - The function information to be verified.
 * @returns A verifier instance.
 */
export function createVerifier(fnInfo: IFunctionInfo) {
  return new Verifier(fnInfo)
}
