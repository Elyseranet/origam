/**
 * tokens-types.ts — DTCG / Tokens Studio type definitions.
 *
 * Mirrors the structure used in /tokens/ (Tokens Studio JSON, DTCG format).
 * Anchored on tokens/primitive.json and tokens/component/btn.json.
 *
 * - `$value` may be a primitive, an alias string `"{path.to.token}"`, or a
 *   composite object (shadow, border, typography).
 * - We tolerate `$type` being absent on group nodes (only leaf tokens carry it).
 */

// ---------------------------------------------------------------------------
// DTCG token types
// ---------------------------------------------------------------------------

export type DTCGType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'cubicBezier'
  | 'number'
  | 'shadow'
  | 'typography'
  | 'border'
  | 'other'

// ---------------------------------------------------------------------------
// Composite value shapes
// ---------------------------------------------------------------------------

/** DTCG shadow composite — matches Tokens Studio single/multi shadow. */
export interface DTCGShadowValue {
  color: string
  offsetX: string | number
  offsetY: string | number
  blur: string | number
  spread: string | number
  type?: 'dropShadow' | 'innerShadow'
}

/** DTCG border composite. */
export interface DTCGBorderValue {
  color: string
  width: string | number
  style: string
}

/** DTCG typography composite. */
export interface DTCGTypographyValue {
  fontFamily?: string
  fontWeight?: string | number
  fontSize?: string | number
  lineHeight?: string | number
  letterSpacing?: string | number
  paragraphSpacing?: string | number
  textDecoration?: string
  textCase?: string
}

/** DTCG cubicBezier composite — [p1x, p1y, p2x, p2y]. */
export type DTCGCubicBezierValue = [number, number, number, number]

/**
 * The universe of concrete `$value` types.
 * - string covers color hex, dimension, fontFamily, fontWeight (string form),
 *   duration, alias references `"{…}"`, and `other`.
 * - number covers fontWeight (numeric), number tokens.
 * - Composites for shadow, border, typography, cubicBezier.
 * - Arrays for multi-shadow.
 */
export type DTCGTokenValue =
  | string
  | number
  | DTCGShadowValue
  | DTCGShadowValue[]
  | DTCGBorderValue
  | DTCGTypographyValue
  | DTCGCubicBezierValue

// ---------------------------------------------------------------------------
// Core DTCG token interface
// ---------------------------------------------------------------------------

/**
 * A single design token in DTCG format.
 * `$type` is always present on leaf tokens. Group nodes omit it.
 * `$value` is typed broadly to accommodate alias strings, primitives,
 * and composite objects without casting everywhere.
 */
export interface DTCGToken<T extends DTCGTokenValue = DTCGTokenValue> {
  $type: DTCGType
  $value: T
  $description?: string
  /** Tokens Studio extensions (e.g. `{ "studio.set": "primitive" }`). */
  $extensions?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Group and file-level types
// ---------------------------------------------------------------------------

/**
 * A recursive group node. May contain sub-groups or leaf DTCGTokens.
 * This is the structure of each top-level key inside a token file, e.g.
 * `tokens/primitive.json → { color: { neutral: { "0": DTCGToken, … } } }`.
 */
export type DTCGGroup = {
  [k: string]: DTCGGroup | DTCGToken
}

/** Top-level token file — one or more named groups at the root. */
export type DTCGFile = {
  [k: string]: DTCGGroup | DTCGToken
}

// ---------------------------------------------------------------------------
// Tokens Studio metadata / themes (from $metadata.json / $themes.json)
// ---------------------------------------------------------------------------

/** `$metadata.json` — controls which sets are shown and in what order. */
export interface TokensStudioMetadata {
  /**
   * Ordered list of token set names (relative paths without .json extension),
   * e.g. `["primitive", "semantic/light", "component/btn"]`.
   */
  tokenSetOrder: string[]
}

/** Status of a token set within a theme. */
export type TokenSetStatus = 'enabled' | 'disabled' | 'source'

/** `$themes.json` — array of theme definitions. */
export interface TokensStudioTheme {
  /** Unique identifier for the theme, used internally by Tokens Studio. */
  id: string
  /** Human-readable label shown in the Tokens Studio UI. */
  name: string
  /**
   * Map of token set name → status.
   * e.g. `{ "primitive": "enabled", "semantic/light": "enabled" }`.
   */
  selectedTokenSets: Record<string, TokenSetStatus>
  /** Optional free-form metadata bag (Tokens Studio internal). */
  $figmaStyleReferences?: Record<string, string>
  $figmaVariableReferences?: Record<string, string>
}

/** The full `$themes.json` file is an array of theme objects. */
export type TokensStudioThemes = TokensStudioTheme[]

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the given value is a Tokens Studio alias reference,
 * i.e. a string of the form `"{path.to.token}"`.
 *
 * @example
 * isAlias('{color.neutral.0}')  // → true
 * isAlias('#FFFFFF')            // → false
 */
export function isAlias(v: unknown): v is string {
  return typeof v === 'string' && /^\{[^{}]+\}$/.test(v)
}

/**
 * Extract the dotted path from an alias string.
 * @example
 * resolveAliasPath('{color.neutral.0}') // → 'color.neutral.0'
 */
export function resolveAliasPath(alias: string): string {
  return alias.slice(1, -1)
}

/**
 * Type guard — returns `true` when a node in a `DTCGGroup` is a leaf token
 * (has a `$type` property) rather than a nested group.
 */
export function isDTCGToken(node: DTCGGroup | DTCGToken): node is DTCGToken {
  return '$type' in node && typeof (node as DTCGToken).$type === 'string'
}
