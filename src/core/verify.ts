// ============================================================
//  src/core/verify.ts — Advanced Declarative Verification Engine
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
  SequenceMatcher,
} from '../types.js'
import {
  evaluateMatcher,
  isMatch,
  matchSequence,
  MatchContext,
} from '../ast/matcher.js'
import { AutoAdapter } from '../parser/auto-adapter.js'

// =================== Parser Singleton ===================

const parser = new AutoAdapter()

/**
 * Parses a code snippet into AST nodes.
 */
function parseSnippet(code: string): ASTNode[] {
  const preparedCode = code.replace(/\.\.\.(?![a-zA-Z_$0-9])/g, '$_any_$')

  try {
    const { ast } = parser.parseFunctionSource(preparedCode, { ts: true })

    let target: any = ast
    if (target.type === 'Program') target = target.body[0]
    if (target?.type === 'ExpressionStatement') target = target.expression
    if (target?.type === 'ParenthesizedExpression') target = target.expression

    if (
      target?.type === 'FunctionExpression' ||
      target?.type === 'FunctionDeclaration' ||
      target?.type === 'ArrowFunctionExpression'
    ) {
      const body = target.body
      if (body.type === 'BlockStatement') return body.body
      return [body]
    }

    if (target?.type === 'BlockStatement') return target.body

    return [target || ast]
  } catch {
    return []
  }
}

/**
 * Helper to parse a full function snippet and extract a schema from it.
 */
function schemaFromSnippet(snippet: string): any {
  try {
    const { ast } = parser.parseFunctionSource(snippet, { ts: true })
    let target: any = ast
    if (target.type === 'Program') target = target.body[0]
    if (target?.type === 'ExpressionStatement') target = target.expression
    if (target?.type === 'ParenthesizedExpression') target = target.expression

    if (
      target?.type === 'FunctionExpression' ||
      target?.type === 'FunctionDeclaration' ||
      target?.type === 'ArrowFunctionExpression'
    ) {
      const schema: any = {}
      if (target.id) schema.name = target.id.name

      if (target.params.length > 0) {
        schema.params = target.params.map((p: any) => ({
          // We use the node itself for deep matching in isMatch via MatchContext
          _node: p,
        }))
      }

      // If body is empty, it means we don't care about body, OR it's truly empty.
      // For convenience, we assume a full function snippet wants to match its body.
      const bodyNodes =
        target.body.type === 'BlockStatement' ? target.body.body : [target.body]
      if (bodyNodes.length > 0) {
        schema.body = { $match: snippet } // The original snippet will be parsed by verifySequence
      }

      return schema
    }
  } catch {
    // If it's not a full function, treat it as a body match
    return { body: snippet }
  }
  return { body: snippet }
}

// =================== ReturnHelper ===================

class ReturnHelper implements IReturnHelper {
  readonly node: ASTNode | null
  constructor(node: ASTNode | null) {
    this.node = node
  }

  isBinaryOp(operator: string, leftName: string, rightName: string): boolean {
    const n = this.node as any
    return (
      n?.type === 'BinaryExpression' &&
      n.operator === operator &&
      n.left?.name === leftName &&
      n.right?.name === rightName
    )
  }

  isCall(calleeName?: string): boolean {
    const n = this.node as any
    if (n?.type !== 'CallExpression') return false
    if (!calleeName) return true
    return (
      n.callee?.name === calleeName || n.callee?.property?.name === calleeName
    )
  }

  isLiteral(value?: unknown): boolean {
    const n = this.node as any
    if (n?.type !== 'Literal') return false
    return value === undefined || n.value === value
  }

  isIdentifier(name?: string): boolean {
    const n = this.node as any
    return n?.type === 'Identifier' && (name === undefined || n.name === name)
  }

  isMemberAccess(objName: string, propName: string): boolean {
    const n = this.node as any
    if (n?.type !== 'MemberExpression') return false
    return n.object?.name === objName && n.property?.name === propName
  }

  isTemplateLiteral(): boolean {
    return this.node?.type === 'TemplateLiteral'
  }
}

// =================== Verifier ===================

class Verifier {
  private readonly fn: IFunctionInfo
  private ctx!: MatchContext

  constructor(fn: IFunctionInfo) {
    this.fn = fn
  }

  verify(inputSchema: VerifySchema): VerifyResult {
    const failures: VerifyFailure[] = []
    const schema =
      typeof inputSchema === 'string'
        ? schemaFromSnippet(inputSchema)
        : inputSchema

    this.ctx = {
      params: (this.fn as any)._node?.params || [],
      strict: schema.strict ?? false,
    }

    if (schema.name !== undefined)
      this.check(failures, 'name', schema.name, this.fn.name)
    if (schema.kind !== undefined)
      this.check(failures, 'kind', schema.kind, this.fn.kind)
    if (schema.syntax !== undefined)
      this.check(failures, 'syntax', schema.syntax, this.fn.syntax)
    if (schema.static !== undefined)
      this.check(failures, 'static', schema.static, this.fn.isStatic)
    if (schema.async !== undefined)
      this.check(failures, 'async', schema.async, this.fn.isAsync)
    if (schema.generator !== undefined)
      this.check(failures, 'generator', schema.generator, this.fn.isGenerator)
    if (schema.arrow !== undefined)
      this.check(failures, 'arrow', schema.arrow, this.fn.isArrow)
    if (schema.returnType !== undefined)
      this.check(failures, 'returnType', schema.returnType, this.fn.returnType)
    if (schema.paramCount !== undefined)
      this.check(failures, 'paramCount', schema.paramCount, this.fn.paramCount)

    if (schema.params) this.verifyParams(failures, schema.params)
    if (schema.returns) this.verifyReturns(failures, schema.returns)
    if (schema.body !== undefined) {
      if (typeof schema.body === 'string' || Array.isArray(schema.body)) {
        this.verifySequence(failures, 'body', this.fn.body.statements, {
          $match: schema.body,
        })
      } else {
        this.verifyBody(failures, schema.body)
      }
    }

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

  private verifyParams(
    failures: VerifyFailure[],
    schemas: ParamSchema[]
  ): void {
    if (schemas.length !== this.fn.paramCount) {
      failures.push({
        path: 'params.length',
        message: `Expected ${schemas.length} params, got ${this.fn.paramCount}`,
      })
      return
    }

    schemas.forEach((paramSchema, i) => {
      const param = this.fn.param(i)
      if (!param) return
      const prefix = `params[${i}]`

      // If schema has a _node, it's from a snippet, use structural isMatch
      if ((paramSchema as any)._node) {
        if (
          !isMatch((param as any)._node, (paramSchema as any)._node, this.ctx)
        ) {
          failures.push({
            path: prefix,
            message: `Parameter signature mismatch`,
          })
        }
        return
      }

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
    if (schema.statementCount !== undefined)
      this.check(
        failures,
        'body.statementCount',
        schema.statementCount,
        body.statementCount
      )
    this.verifySequence(failures, 'body', body.statements, schema)

    if (schema.has) {
      const selectors = Array.isArray(schema.has) ? schema.has : [schema.has]
      selectors.forEach((sel) => {
        if (!body.has(sel))
          failures.push({
            path: `body.has("${sel}")`,
            message: `Expected selector "${sel}"`,
          })
      })
    }
    if (schema.returns) this.verifyReturns(failures, schema.returns)
    if (typeof schema.custom === 'function')
      this.runCustom(failures, 'body.custom', () => schema.custom!(body))
  }

  private verifyReturns(
    failures: VerifyFailure[],
    schema: BodySchema['returns']
  ): void {
    if (!schema) return
    const body = this.fn.body
    const returnsNodes = body.returns.map((r) => (r as any).argument || null)

    if (typeof schema === 'function') {
      body.returns.forEach((ret, i) => {
        const helper = new ReturnHelper((ret as any).argument)
        try {
          if (schema(helper, ret, i) === false)
            failures.push({
              path: `body.returns[${i}]`,
              message: 'Check failed',
            })
        } catch (e) {
          failures.push({
            path: `body.returns[${i}]`,
            message: (e as Error).message,
          })
        }
      })
    } else {
      const seq: SequenceMatcher =
        typeof schema === 'string' || Array.isArray(schema)
          ? { $all: schema }
          : schema
      this.verifySequence(failures, 'body.returns', returnsNodes, seq)
    }
  }

  private verifySequence(
    failures: VerifyFailure[],
    path: string,
    targets: (ASTNode | null)[],
    schema: SequenceMatcher
  ): void {
    if (schema.$match) {
      const patterns = Array.isArray(schema.$match)
        ? schema.$match
        : [schema.$match]
      const patternNodes = patterns.flatMap((p) =>
        p === '...'
          ? [{ type: 'Identifier', name: '...' } as ASTNode]
          : parseSnippet(p)
      )
      if (!matchSequence(targets, patternNodes, this.ctx)) {
        failures.push({
          path: `${path}.$match`,
          message: `${path}: sequence mismatch`,
        })
      }
    }

    if (schema.$has) {
      const patterns = Array.isArray(schema.$has) ? schema.$has : [schema.$has]
      patterns.forEach((p) => {
        const snippetNodes = parseSnippet(p)
        const found =
          (snippetNodes.length > 0 &&
            targets.some((t) => isMatch(t, snippetNodes[0], this.ctx))) ||
          this.fn.body.has(p)
        if (!found)
          failures.push({
            path: `${path}.$has`,
            message: `Could not find "${p}"`,
          })
      })
    }

    if (schema.$any) {
      const patterns = Array.isArray(schema.$any) ? schema.$any : [schema.$any]
      const patternNodes = patterns.flatMap((p) => parseSnippet(p))
      if (
        !targets.some((t) => patternNodes.some((p) => isMatch(t, p, this.ctx)))
      ) {
        failures.push({ path: `${path}.$any`, message: 'None matched $any' })
      }
    }

    if (schema.$all) {
      const patterns = Array.isArray(schema.$all) ? schema.$all : [schema.$all]
      const patternNodes = patterns.flatMap((p) => parseSnippet(p))
      if (
        !targets.every((t) => patternNodes.some((p) => isMatch(t, p, this.ctx)))
      ) {
        failures.push({ path: `${path}.$all`, message: 'Not all matched $all' })
      }
    }

    if (schema.$none) {
      const patterns = Array.isArray(schema.$none)
        ? schema.$none
        : [schema.$none]
      const patternNodes = patterns.flatMap((p) => parseSnippet(p))
      if (
        targets.some((t) => patternNodes.some((p) => isMatch(t, p, this.ctx)))
      ) {
        failures.push({ path: `${path}.$none`, message: 'Some matched $none' })
      }
    }
  }

  private check<T>(
    failures: VerifyFailure[],
    path: string,
    matcher: Matcher<T> | undefined,
    actual: T
  ): void {
    if (matcher === undefined) return

    // Use isMatch logic for type strings to support 'any' wildcard consistently
    const deepMatch =
      path.endsWith('.type') || path === 'returnType'
        ? (v: any, p: any) => isMatch(v, p, this.ctx)
        : (v: any, p: any) => isMatch(v, p, this.ctx) // Default to isMatch for other deep properties

    if (!evaluateMatcher(actual, matcher, deepMatch)) {
      failures.push({
        path,
        expected: matcher,
        actual,
        message: `${path}: failed`,
      })
    }
  }

  private runCustom(
    failures: VerifyFailure[],
    path: string,
    fn: () => boolean | void
  ): void {
    try {
      if (fn() === false)
        failures.push({ path, message: `${path}: custom check failed` })
    } catch (e) {
      failures.push({ path, message: (e as Error).message })
    }
  }
}

export function createVerifier(fnInfo: IFunctionInfo) {
  return new Verifier(fnInfo)
}
