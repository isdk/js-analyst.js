import type { ParamSchema } from '../types.js'

/**
 * Converts a JSON Schema (or a fragment of one) into the internal ParamSchema format.
 * This handles the mapping of standard JSON Schema keywords to our internal
 * matcher-based format.
 *
 * @param json - The JSON Schema to convert.
 * @returns A normalized ParamSchema.
 */
export function jsonSchemaToParamSchema(json: any): ParamSchema {
  if (!json || typeof json !== 'object') return json

  // If it's already in our internal format (starts with $), keep it but recurse
  const res: any = { ...json }

  // 1. Logic Combinators Mapping
  if (res.anyOf) {
    res.$or = res.anyOf.map((s: any) => jsonSchemaToParamSchema(s))
    delete res.anyOf
  }
  if (res.oneOf) {
    res.$oneOf = res.oneOf.map((s: any) => jsonSchemaToParamSchema(s))
    delete res.oneOf
  }
  if (res.allOf) {
    res.$and = res.allOf.map((s: any) => jsonSchemaToParamSchema(s))
    delete res.allOf
  }
  if (res.not) {
    res.$not = jsonSchemaToParamSchema(res.not)
    delete res.not
  }

  // 2. Type Normalization
  if (typeof res.type === 'string') {
    // Handle '...type' shorthand
    if (res.type.startsWith('...')) {
      res.isRest = true
      res.type = res.type.slice(3)
    }
    // Map JSON Schema 'integer' to 'number'
    if (res.type === 'integer') res.type = 'number'
  }

  // Handle recursive type/name if they are objects (JSON Schema fragments)
  if (res.type && typeof res.type === 'object' && !Array.isArray(res.type)) {
    res.type = jsonSchemaToParamSchema(res.type)
  }
  if (res.name && typeof res.name === 'object' && !Array.isArray(res.name)) {
    res.name = jsonSchemaToParamSchema(res.name)
  }

  // 2.5 Enum Support
  if (Array.isArray(res.enum)) {
    res.$or = res.enum
    delete res.enum
  }

  // 2.6 Pattern Support (Regex)
  if (typeof res.pattern === 'string' && res.isDestructured === undefined) {
    const regexStr = res.pattern
    delete res.pattern
    return new RegExp(regexStr) as any
  }

  // 3. Structural Mapping (Objects & Arrays)
  if (res.properties && res.isDestructured === undefined) {
    res.isDestructured = true
    res.pattern = 'object'
  }
  if (res.items && res.isDestructured === undefined) {
    res.isDestructured = true
    res.pattern = 'array'
  }

  // Recurse into properties
  if (res.properties) {
    const required = res.required || []
    res.properties = Object.fromEntries(
      Object.entries(res.properties).map(([k, v]) => {
        if (v && typeof v === 'object' && (v as any).required === true) {
          if (!required.includes(k)) required.push(k)
          const newV = { ...v as any }
          delete newV.required
          return [k, jsonSchemaToParamSchema(newV)]
        }
        return [k, jsonSchemaToParamSchema(v)]
      })
    )
    if (required.length > 0) res.required = required
  }

  // Recurse into items
  if (res.items) {
    const items = Array.isArray(res.items) ? res.items : [res.items]
    res.items = items.map((it: any) => jsonSchemaToParamSchema(it))
  }

  // Recurse into internal logic matchers if they were already there
  if (res.$or) res.$or = res.$or.map((s: any) => jsonSchemaToParamSchema(s))
  if (res.$and) res.$and = res.$and.map((s: any) => jsonSchemaToParamSchema(s))
  if (res.$oneOf) res.$oneOf = res.$oneOf.map((s: any) => jsonSchemaToParamSchema(s))
  if (res.$not) res.$not = jsonSchemaToParamSchema(res.$not)

  return res
}
