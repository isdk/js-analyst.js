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
  isLogicMatcher,
} from '../ast/matcher.js'
import { AutoAdapter } from '../parser/auto-adapter.js'
import { jsonSchemaToParamSchema } from './schema-converter.js'
import { tsTypeToString } from '../utils/ts-type.js'

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
    if (schema.returnType !== undefined) {
      if (
        typeof schema.returnType === 'object' &&
        !(schema.returnType instanceof RegExp) &&
        !isLogicMatcher(schema.returnType)
      ) {
        this.verifyReturnTypeDetail(
          failures,
          'returnType',
          this.fn.returnTypeNode,
          jsonSchemaToParamSchema(schema.returnType)
        )
      } else {
        this.checkType(
          failures,
          'returnType',
          schema.returnType as any,
          this.fn.returnType,
          this.fn.returnTypeNode?.type === 'TSTypeLiteral',
          this.fn.returnTypeNode?.type === 'TSTupleType'
        )
      }
    }
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
    schemasInput: ParamSchema[] | ParamSchema
  ): void {
    let schemas: ParamSchema[]

    // Normalize: if a single object is passed...
    if (schemasInput && !Array.isArray(schemasInput)) {
      const s = schemasInput as any
      // If it's a JSON Schema describing the whole parameter list (type: array)
      if (s.type === 'array' && s.items && Array.isArray(s.items)) {
        schemas = s.items
      } else {
        // Otherwise, treat it as the first parameter's schema (destructuring)
        schemas = [schemasInput]
      }
    } else {
      schemas = (schemasInput as ParamSchema[]) || []
    }

    // Further normalize each schema if it's JSON Schema style
    schemas = schemas.map((s) => jsonSchemaToParamSchema(s))

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
      this.verifyParamDetail(failures, prefix, param, paramSchema)
    })
  }

  private verifyReturnTypeDetail(
    failures: VerifyFailure[],
    path: string,
    typeNode: ASTNode | null,
    schema: ParamSchema
  ): void {
    if (!typeNode) {
      // Fallback for JS: check actual return statements in the body
      const returnNodes = (this.fn.body.returns || [])
        .map((r) => (r as any).argument)
        .filter((n) => n !== undefined)

      if (returnNodes.length === 0) {
        failures.push({
          path,
          message: 'Missing return type annotation and no return statements found',
        })
        return
      }

      const results = returnNodes.map((node) => {
        const subFailures: VerifyFailure[] = []
        this.verifyReturnTypeDetail(subFailures, path, node, schema)
        return subFailures.length === 0
      })

      if (!results.every((r: boolean) => r)) {
        failures.push({
          path,
          message: `${path}: some return values do not satisfy the schema`,
        })
      }
      return
    }

    // Try whole match first
    const wholeFailures: VerifyFailure[] = []
    this.verifyReturnTypeBase(wholeFailures, path, typeNode, schema)
    if (wholeFailures.length === 0) return

    // If failed, and it's a union, try distributive check
    if (typeNode.type === 'TSUnionType') {
      const types = (typeNode as any).types || []
      const results = types.map((t: any) => {
        const subFailures: VerifyFailure[] = []
        this.verifyReturnTypeDetail(subFailures, path, t, schema)
        return subFailures.length === 0
      })

      if (results.every((r: boolean) => r)) {
        return // All members match, we are good
      }
    }

    // If still failed, report the original whole match failures
    failures.push(...wholeFailures)
  }

  private verifyReturnTypeBase(
    failures: VerifyFailure[],
    path: string,
    typeNode: ASTNode,
    schema: ParamSchema
  ): void {

    // 1. Handle logical combinators
    // ... rest of the logic remains same, but we'll update helpers
    if (schema.$or) {
      const passed = schema.$or.some((sub) => {
        const subFailures: VerifyFailure[] = []
        this.verifyReturnTypeDetail(subFailures, path, typeNode, sub)
        return subFailures.length === 0
      })
      if (!passed)
        failures.push({
          path,
          message: `${path}: none of the $or branches matched`,
        })
      return
    }
    if (schema.$oneOf) {
      const matches = schema.$oneOf.filter((sub) => {
        const subFailures: VerifyFailure[] = []
        this.verifyReturnTypeDetail(subFailures, path, typeNode, sub)
        return subFailures.length === 0
      })
      if (matches.length !== 1)
        failures.push({
          path,
          message: `${path}: expected exactly one $oneOf branch to match, but found ${matches.length}`,
        })
      return
    }
    if (schema.$and) {
      for (const sub of schema.$and)
        this.verifyReturnTypeDetail(failures, path, typeNode, sub)
      return
    }
    if (schema.$not) {
      const subFailures: VerifyFailure[] = []
      this.verifyReturnTypeDetail(subFailures, path, typeNode, schema.$not)
      if (subFailures.length === 0)
        failures.push({
          path,
          message: `${path}: should NOT match the $not schema`,
        })
      return
    }

    // 2. Base matching
    let actualType: string | null = null
    let hasObject = false
    let hasArray = false

    if (typeNode.type.startsWith('TS')) {
      actualType = tsTypeToString(typeNode as any)
      hasObject =
        typeNode.type === 'TSTypeLiteral' ||
        (typeNode.type === 'TSUnionType' &&
          (typeNode as any).types?.some((t: any) => t.type === 'TSTypeLiteral'))
      hasArray =
        typeNode.type === 'TSTupleType' ||
        (typeNode.type === 'TSUnionType' &&
          (typeNode as any).types?.some((t: any) => t.type === 'TSTupleType'))
    } else {
      // Expression node (JS)
      if (typeNode.type === 'ObjectExpression') {
        actualType = 'object'
        hasObject = true
      } else if (typeNode.type === 'ArrayExpression') {
        actualType = 'array'
        hasArray = true
      } else if (typeNode.type === 'Literal') {
        const val = (typeNode as any).value
        actualType = val === null ? 'null' : typeof val
      } else if (typeNode.type === 'Identifier') {
        actualType = (typeNode as any).name
      }
    }

    this.checkType(
      failures,
      `${path}.type`,
      schema.type,
      actualType,
      hasObject,
      hasArray
    )

    // Verify properties (Interface or Type literal)
    if (schema.properties) {
      const actualProps = this.extractTypeProperties(typeNode)
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        const subTypeNode = actualProps[key]
        if (!subTypeNode) {
          if (schema.required?.includes(key)) {
            failures.push({
              path: `${path}.properties.${key}`,
              message: `Missing required property in return type: ${key}`,
            })
          }
        } else {
          this.verifyReturnTypeDetail(
            failures,
            `${path}.properties.${key}`,
            subTypeNode,
            subSchema
          )
        }
      }
    }

    // Verify items (Tuple type)
    if (schema.items) {
      const actualItems = this.extractTypeItems(typeNode)
      schema.items.forEach((subSchema, i) => {
        if (!subSchema) return
        const subTypeNode = actualItems[i]
        if (!subTypeNode) {
          failures.push({
            path: `${path}.items[${i}]`,
            message: `Missing expected tuple element at index ${i} in return type`,
          })
        } else {
          this.verifyReturnTypeDetail(
            failures,
            `${path}.items[${i}]`,
            subTypeNode,
            subSchema
          )
        }
      })
    }
  }

  private extractTypeProperties(node: ASTNode): Record<string, ASTNode> {
    const props: Record<string, ASTNode> = {}
    if (node.type === 'TSTypeLiteral') {
      const members = (node as any).members || []
      for (const m of members) {
        if (
          (m.type === 'TSPropertySignature' ||
            m.type === 'TSMethodSignature') &&
          m.key?.type === 'Identifier'
        ) {
          props[m.key.name] = m.typeAnnotation?.typeAnnotation || m
        }
      }
    } else if (node.type === 'ObjectExpression') {
      const properties = (node as any).properties || []
      for (const p of properties) {
        if (p.type === 'Property' && p.key.type === 'Identifier') {
          props[p.key.name] = p.value
        }
      }
    }
    return props
  }

  private extractTypeItems(node: ASTNode): ASTNode[] {
    if (node.type === 'TSTupleType') {
      return (node as any).elementTypes || []
    } else if (node.type === 'ArrayExpression') {
      return (node as any).elements || []
    }
    return []
  }

  private verifyParamDetail(
    failures: VerifyFailure[],
    path: string,
    param: any, // IParamInfo
    schema: ParamSchema
  ): void {
    // 1. Handle logical combinators
    if (schema.$or) {
      const passed = schema.$or.some((sub) => {
        const subFailures: VerifyFailure[] = []
        this.verifyParamDetail(subFailures, path, param, sub)
        return subFailures.length === 0
      })
      if (!passed)
        failures.push({
          path,
          message: `${path}: none of the $or branches matched`,
        })
      return
    }
    if (schema.$oneOf) {
      const matches = schema.$oneOf.filter((sub) => {
        const subFailures: VerifyFailure[] = []
        this.verifyParamDetail(subFailures, path, param, sub)
        return subFailures.length === 0
      })
      if (matches.length !== 1)
        failures.push({
          path,
          message: `${path}: expected exactly one $oneOf branch to match, but found ${matches.length}`,
        })
      return
    }
    if (schema.$and) {
      for (const sub of schema.$and)
        this.verifyParamDetail(failures, path, param, sub)
      return
    }
    if (schema.$not) {
      const subFailures: VerifyFailure[] = []
      this.verifyParamDetail(subFailures, path, param, schema.$not)
      if (subFailures.length === 0)
        failures.push({
          path,
          message: `${path}: should NOT match the $not schema`,
        })
      return
    }

    // 2. Base structural matching
    // If schema has a _node, it's from a snippet, use structural isMatch
    if ((schema as any)._node) {
      if (!isMatch((param as any)._node, (schema as any)._node, this.ctx)) {
        failures.push({
          path,
          message: `Parameter signature mismatch`,
        })
      }
      return
    }

    this.check(failures, `${path}.name`, schema.name, param.name)

    this.checkType(
      failures,
      `${path}.type`,
      schema.type,
      param.type,
      param.pattern === 'object',
      param.pattern === 'array'
    )

    this.check(
      failures,
      `${path}.hasDefault`,
      schema.hasDefault,
      param.hasDefault
    )
    this.check(failures, `${path}.isRest`, schema.isRest, param.isRest)
    this.check(
      failures,
      `${path}.isDestructured`,
      schema.isDestructured,
      param.isDestructured
    )
    this.check(failures, `${path}.pattern`, schema.pattern, param.pattern)

    // Verify properties (Object destructuring)
    if (schema.properties) {
      if (param.pattern !== 'object') {
        failures.push({
          path: `${path}.properties`,
          message: `Expected object destructuring, but got ${param.pattern || 'none'}`,
        })
      } else {
        // Strict check: no extra properties
        if (this.ctx.strict) {
          const schemaKeys = Object.keys(schema.properties)
          const actualKeys = Object.keys(param.properties || {})
          for (const key of actualKeys) {
            if (!schemaKeys.includes(key)) {
              failures.push({
                path: `${path}.properties`,
                message: `Unexpected property "${key}" in strict mode`,
              })
            }
          }
        }

        for (const [key, subSchema] of Object.entries(schema.properties)) {
          const subParam = param.properties?.[key]
          if (!subParam) {
            // Check if it's required
            if (schema.required?.includes(key)) {
              failures.push({
                path: `${path}.properties.${key}`,
                message: `Missing required property: ${key}`,
              })
            }
          } else {
            this.verifyParamDetail(
              failures,
              `${path}.properties.${key}`,
              subParam,
              subSchema
            )
          }
        }
      }
    }

    // Verify required (additional check for missing fields in required list not in properties)
    if (schema.required && param.pattern === 'object') {
      for (const key of schema.required) {
        if (!param.properties?.[key]) {
          if (!schema.properties?.[key]) {
            // Only report if not already reported by properties loop
            failures.push({
              path: `${path}.required.${key}`,
              message: `Missing required property: ${key}`,
            })
          }
        }
      }
    }

    // Verify items (Array destructuring)
    if (schema.items) {
      if (param.pattern !== 'array') {
        failures.push({
          path: `${path}.items`,
          message: `Expected array destructuring, but got ${param.pattern || 'none'}`,
        })
      } else {
        schema.items.forEach((subSchema, i) => {
          if (!subSchema) return
          const subParam = param.items?.[i]
          if (!subParam) {
            failures.push({
              path: `${path}.items[${i}]`,
              message: `Missing expected array element at index ${i}`,
            })
          } else {
            this.verifyParamDetail(
              failures,
              `${path}.items[${i}]`,
              subParam,
              subSchema
            )
          }
        })
      }
    }
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

  private checkType(
    failures: VerifyFailure[],
    path: string,
    matcher: Matcher<string | null> | undefined,
    actual: string | null,
    isObject?: boolean,
    isArray?: boolean
  ): void {
    if (matcher === undefined) return

    const deepMatch = (v: any, p: any) => isMatch(v, p, this.ctx)

    // 1. Try direct match using evaluateMatcher
    if (evaluateMatcher(actual, matcher, deepMatch)) {
      return
    }

    // 2. Try semantic match for JSON Schema keywords (object/array)
    if (isObject && evaluateMatcher('object', matcher, deepMatch)) {
      return
    }
    if (isArray && evaluateMatcher('array', matcher, deepMatch)) {
      return
    }

    // 3. If everything fails, report failure
    failures.push({
      path,
      expected: matcher,
      actual,
      message: `${path}: failed`,
    })
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
