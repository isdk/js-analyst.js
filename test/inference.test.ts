import { describe, it, expect } from 'vitest'
import { inferType } from '../src/utils/inference.js'
import { AutoAdapter } from '../src/parser/auto-adapter.js'

const parser = new AutoAdapter()
function parseExpr(code: string) {
  const { ast } = parser.parseFunctionSource(`() => (${code})`, { ts: true })
  let target: any = ast
  if (target.type === 'Program') target = target.body[0]
  if (target?.type === 'ExpressionStatement') target = target.expression
  
  if (target?.type === 'ArrowFunctionExpression') {
    return target.body
  }
  return target
}

describe('Type Inference', () => {
  it('should infer basic literals', () => {
    expect(inferType(parseExpr('1'))).toBe('number')
    expect(inferType(parseExpr('"s"'))).toBe('string')
    expect(inferType(parseExpr('true'))).toBe('boolean')
    expect(inferType(parseExpr('null'))).toBe('null')
  })

  it('should infer template literals', () => {
    expect(inferType(parseExpr('`hello ${name}`'))).toBe('string')
  })

  it('should infer binary expressions', () => {
    expect(inferType(parseExpr('a - b'))).toBe('number')
    expect(inferType(parseExpr('a * b'))).toBe('number')
    expect(inferType(parseExpr('a > b'))).toBe('boolean')
    expect(inferType(parseExpr('a === b'))).toBe('boolean')
    // + is ambiguous in JS, should return null (any)
    expect(inferType(parseExpr('a + b'))).toBe(null)
  })

  it('should infer unary expressions', () => {
    expect(inferType(parseExpr('!a'))).toBe('boolean')
    expect(inferType(parseExpr('+a'))).toBe('number')
    expect(inferType(parseExpr('typeof a'))).toBe('string')
  })

  it('should infer new expressions', () => {
    // In JS, new String() returns an object, but for schema matching, 
    // we use 'string' for convenience as a logical type.
    expect(inferType(parseExpr('new String()'))).toBe('string')
    expect(inferType(parseExpr('new Number()'))).toBe('number')
    expect(inferType(parseExpr('new Date()'))).toBe('date')
    expect(inferType(parseExpr('new MyClass()'))).toBe('MyClass')
  })

  it('should infer special identifiers', () => {
    expect(inferType(parseExpr('undefined'))).toBe('undefined')
    expect(inferType(parseExpr('NaN'))).toBe('number')
    expect(inferType(parseExpr('Infinity'))).toBe('number')
  })

  it('should infer complex expressions', () => {
    expect(inferType(parseExpr('a = 1'))).toBe('number')
    expect(inferType(parseExpr('cond ? "a" : "b"'))).toBe('string')
    expect(inferType(parseExpr('cond ? "a" : 1'))).toBe(null) // Mixed
  })
})
