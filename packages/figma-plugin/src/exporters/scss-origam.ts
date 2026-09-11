/**
 * scss-origam.ts — Phase 8: SCSS Origam exporter.
 *
 * Walks all local Figma Variable collections + modes, resolves every variable
 * to the canonical Origam CSS variable name (mirroring the
 * `origam/name/css` transform in `scripts/build-tokens.mjs`), and emits a
 * single `_origam.semantic.scss` file with theme-scoped blocks.
 *
 * Output shape (mirrors the SD-generated `_light.scss` + `_dark.scss`):
 *
 *   :root,
 *   [data-theme="light"] {
 *     --origam-color__surface---default: #ffffff;
 *     --origam-btn---bg: #ffffff;
 *     --origam-btn--primary---bg: #7c3aed;
 *   }
 *
 *   [data-theme="dark"] {
 *     --origam-color__surface---default: #0a0a0a;
 *   }
 *
 * Naming convention — exactly the BEM-style grammar resolved by
 * `origam/name/css`:
 *
 *   primitive (length 2): `--origam-[domain]---[rank]`
 *   primitive (length 3): `--origam-[domain]__[scale]---[rank]`
 *   semantic  (length 3): `--origam-[domain]__[block]---[property]`
 *   semantic  (length 4): `--origam-[domain]__[block]--[modifier]---[property]`
 *   component:            `--origam-[block]---[prop]`
 *                         `--origam-[block]--[state]---[prop]`
 *                         `--origam-[block]__[child]---[prop]`
 *
 *   primitive.color.neutral.0      → --origam-color__neutral---0
 *   primitive.space.4              → --origam-space---4
 *   semantic.color.surface.default → --origam-color__surface---default
 *   semantic.color.action.primary.bg → --origam-color__action--primary---bg
 *   component.btn.bg               → --origam-btn---bg
 *   component.btn.success.bg       → --origam-btn--success---bg
 *
 * Aliases (a Variable bound to another Variable) are FLATTENED to their
 * concrete value — SCSS doesn't natively support `var()` references at output
 * time, so we follow the alias chain and emit the resolved primitive value.
 * This matches Style Dictionary's `outputReferences: false` setting.
 */

import { rgbToHex } from '../lib/color'

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** A single CSS-variable declaration ready for emission. */
interface CssDecl {
  /** The full CSS variable name (without leading `--`). */
  name: string
  /** Already-stringified value (`#ffffff`, `4px`, `rgba(0, 0, 0, 0)`). */
  value: string
}

// ---------------------------------------------------------------------------
// Constants — mirror `origam/name/css` in scripts/tokens.config.mjs
// ---------------------------------------------------------------------------

/**
 * Recognised intent / state segments for component tokens. Matches the
 * `intentStates` Set in the SD transform. When the SECOND segment of a
 * component token path is one of these, it's emitted with the
 * `--origam-{block}--{state}---{prop}` pattern (double + triple tiret).
 */
const INTENT_STATES: ReadonlySet<string> = new Set([
  'primary',
  'secondary',
  'ghost',
  'success',
  'warning',
  'danger',
  'info',
  'selected',
])

/** Variable scopes that imply the value should be rendered with `px`. */
const DIMENSION_SCOPES: ReadonlySet<VariableScope> = new Set<VariableScope>([
  'WIDTH_HEIGHT',
  'GAP',
  'CORNER_RADIUS',
  'STROKE_FLOAT',
])

// ---------------------------------------------------------------------------
// Path resolution — Figma Variable name → CSS variable name
// ---------------------------------------------------------------------------

/**
 * Build the CSS variable name (without leading `--`) for a Figma variable,
 * given its collection name and its full hierarchical name.
 *
 * Reproduces the `origam/name/css` transform exactly — BEM-style grammar
 * everywhere:
 *   - primitive (length 2): `origam-{domain}---{rank}`
 *   - primitive (length 3): `origam-{domain}__{scale}---{rank}`
 *   - semantic  (length 3): `origam-{domain}__{block}---{property}`
 *   - semantic  (length 4): `origam-{domain}__{block}--{modifier}---{property}`
 *   - component.{block}.{intentOrState}.{prop} → `origam-{block}--{state}---{prop}`
 *   - component.{block}.{prop}                 → `origam-{block}---{prop}`
 */

/** Mirror of the build-tokens.mjs primitive/semantic name builder. */
function buildBemName(path: string[]): string {
  if (path.length === 2) return `origam-${path[0]}---${path[1]}`
  if (path.length === 3) return `origam-${path[0]}__${path[1]}---${path[2]}`
  if (path.length === 4) return `origam-${path[0]}__${path[1]}--${path[2]}---${path[3]}`
  // Fallback for unexpected depth — single-dash join surfaces a name pattern
  // collision early instead of silent emission.
  return `origam-${path.join('-')}`
}

function toCssVariableName(collectionName: string, variableName: string): string | null {
  const collLower = collectionName.toLowerCase()
  const segments = variableName
    .split('/')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)

  if (segments.length === 0) return null

  // Determine the namespace from the collection name. Tokens Studio creates
  // either one collection per token set (e.g. "Primitive", "Semantic",
  // "Component/Btn") OR one flat collection — the `resolveTokenSet` logic
  // mirrors `tokens-studio.ts::resolveTokenSet` for consistency.

  // 1. Primitive collection
  if (collLower.startsWith('primitive') || segments[0] === 'primitive') {
    const path = segments[0] === 'primitive' ? segments.slice(1) : segments
    if (path.length === 0) return null
    return buildBemName(path)
  }

  // 2. Semantic collection
  if (collLower.startsWith('semantic') || segments[0] === 'semantic') {
    const path = segments[0] === 'semantic' ? segments.slice(1) : segments
    if (path.length === 0) return null
    return buildBemName(path)
  }

  // 3. Component collection — needs the BEM-like double/triple tiret.
  //    The `block` is either:
  //      - the suffix of the collection name (`Component/Btn` → `btn`)
  //      - the first segment of the variable name when collection is flat
  let block: string
  let rest: string[]
  if (collLower.startsWith('component')) {
    const collSegments = collectionName.split('/').map((s) => s.trim().toLowerCase())
    block = collSegments[1] ?? segments[0]
    rest = segments[0] === block ? segments.slice(1) : segments
  } else if (segments[0] === 'component' && segments.length >= 2) {
    block = segments[1]
    rest = segments.slice(2)
  } else {
    // Fallback — assume flat collection where the FIRST segment is the
    // block name (e.g. `Btn/Bg` directly).
    block = segments[0]
    rest = segments.slice(1)
  }

  if (!block) return null

  if (rest.length === 0) {
    // Just the block name with no prop — unusual, but emit as `origam-{block}---`
    return `origam-${block}---`
  }

  // intent/state + prop pattern — `origam-{block}--{state}---{prop}`
  if (rest.length >= 2 && INTENT_STATES.has(rest[0])) {
    const state = rest[0]
    const prop = rest.slice(1).join('-')
    return `origam-${block}--${state}---${prop}`
  }

  // plain block + prop — `origam-{block}---{prop}`
  return `origam-${block}---${rest.join('-')}`
}

// ---------------------------------------------------------------------------
// Value resolution — Figma VariableValue → CSS string
// ---------------------------------------------------------------------------

/**
 * Resolve a possibly-aliased VariableValue down to a concrete value, walking
 * the alias chain. Returns null if the chain is broken or cycles.
 */
function resolveAlias(
  value: VariableValue,
  modeId: string,
  allVariables: Variable[],
  seen: Set<string> = new Set(),
): { value: VariableValue; resolvedType: Variable['resolvedType']; scopes: VariableScope[] } | null {
  // Not an alias — return as-is. Caller already knows the source variable's
  // resolvedType / scopes; we return a sentinel telling them to use the
  // ORIGINAL variable's metadata.
  if (
    value === null ||
    typeof value !== 'object' ||
    !('type' in value) ||
    (value as VariableAlias).type !== 'VARIABLE_ALIAS'
  ) {
    // Sentinel — we don't have a referenced variable, so the caller's
    // metadata wins. This is signalled by an empty scopes array; the
    // caller falls back to its own.
    return null
  }

  const alias = value as VariableAlias
  if (seen.has(alias.id)) return null // cycle guard
  seen.add(alias.id)

  const referenced = allVariables.find((v) => v.id === alias.id)
  if (!referenced) return null

  // Follow the chain — pick the value for THIS modeId if present, else the
  // referenced variable's default mode.
  const refValue =
    referenced.valuesByMode[modeId] ??
    referenced.valuesByMode[Object.keys(referenced.valuesByMode)[0] ?? '']

  if (refValue === undefined) return null

  // Recurse to flatten further aliases.
  const next = resolveAlias(refValue, modeId, allVariables, seen)
  if (next) return next

  return {
    value: refValue,
    resolvedType: referenced.resolvedType,
    scopes: referenced.scopes,
  }
}

/**
 * Convert a resolved (non-alias) VariableValue to its SCSS-ready string.
 */
function valueToCssString(
  value: VariableValue,
  resolvedType: Variable['resolvedType'],
  scopes: VariableScope[],
): string {
  // ── COLOR ──────────────────────────────────────────────────────────────────
  if (resolvedType === 'COLOR') {
    if (
      value !== null &&
      typeof value === 'object' &&
      'r' in value &&
      'g' in value &&
      'b' in value
    ) {
      const rgba = value as RGBA
      const a = 'a' in rgba && typeof rgba.a === 'number' ? rgba.a : 1

      // Match the SD output: rgba(...) for non-opaque, lowercase #hex for
      // opaque. Fully transparent emits as `rgba(0, 0, 0, 0)` like the
      // current SD tokens.
      if (a < 1) {
        const r = Math.round(rgba.r * 255)
        const g = Math.round(rgba.g * 255)
        const b = Math.round(rgba.b * 255)
        return `rgba(${r}, ${g}, ${b}, ${a})`
      }

      return rgbToHex({ r: rgba.r, g: rgba.g, b: rgba.b }).toLowerCase()
    }
    return String(value)
  }

  // ── FLOAT (number / dimension) ─────────────────────────────────────────────
  if (resolvedType === 'FLOAT') {
    const n = typeof value === 'number' ? value : parseFloat(String(value))
    const isDimension = scopes.some((s) => DIMENSION_SCOPES.has(s))
    return isDimension ? `${n}px` : String(n)
  }

  // ── STRING / BOOLEAN ──────────────────────────────────────────────────────
  if (resolvedType === 'STRING') {
    return String(value)
  }
  if (resolvedType === 'BOOLEAN') {
    return value ? 'true' : 'false'
  }

  return String(value)
}

// ---------------------------------------------------------------------------
// Theme detection
// ---------------------------------------------------------------------------

/**
 * Map a mode name to a theme bucket. Light goes into the `:root` block,
 * dark into the `[data-theme="dark"]` block.
 */
function modeToTheme(modeName: string): 'light' | 'dark' | null {
  const m = modeName.toLowerCase()
  if (m === 'light' || m === 'default' || m === 'mode 1' || m === '') return 'light'
  if (m === 'dark') return 'dark'
  // Brand themes (e.g. "Brand A") are NOT emitted in v1 — return null and
  // the caller skips them. The brief's roadmap mentions adding semantic/brand-*
  // sets later; that's a v2 concern.
  return null
}

// ---------------------------------------------------------------------------
// Main exporter
// ---------------------------------------------------------------------------

export async function exportScssOrigam(): Promise<{
  filename: string
  mimeType: string
  bytes: Uint8Array
}> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const allVariables = await figma.variables.getLocalVariablesAsync()

  // Buckets — alphabetical sort applied at emission time (matches SD output).
  const lightDecls = new Map<string, CssDecl>()
  const darkDecls = new Map<string, CssDecl>()

  for (const collection of collections) {
    for (const mode of collection.modes) {
      const theme = modeToTheme(mode.name)
      if (theme === null) continue // skip brand modes for v1

      for (const variableId of collection.variableIds) {
        const variable = allVariables.find((v) => v.id === variableId)
        if (!variable) continue

        const cssName = toCssVariableName(collection.name, variable.name)
        if (!cssName) continue

        const rawValue = variable.valuesByMode[mode.modeId]
        if (rawValue === undefined) continue

        // Flatten aliases.
        const resolved = resolveAlias(rawValue, mode.modeId, allVariables)
        const value = resolved?.value ?? rawValue
        const resolvedType = resolved?.resolvedType ?? variable.resolvedType
        const scopes = resolved?.scopes ?? variable.scopes

        const cssValue = valueToCssString(value, resolvedType, scopes)
        const decl: CssDecl = { name: cssName, value: cssValue }

        if (theme === 'light') lightDecls.set(cssName, decl)
        else darkDecls.set(cssName, decl)
      }
    }
  }

  // ── Emission ─────────────────────────────────────────────────────────────
  const sortByName = (a: CssDecl, b: CssDecl) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0

  const renderBlock = (selector: string, decls: CssDecl[]): string => {
    if (decls.length === 0) return ''
    const lines = decls
      .slice()
      .sort(sortByName)
      .map((d) => `  --${d.name}: ${d.value};`)
      .join('\n')
    return `${selector} {\n${lines}\n}\n`
  }

  const header =
    `/* origam tokens — _origam.semantic.scss\n` +
    ` * Auto-generated by Origam DS Sync (Figma plugin) on ${new Date().toISOString()}.\n` +
    ` * Aliases are flattened to concrete values (matches \`outputReferences: false\`).\n` +
    ` */\n\n`

  const lightBlock = renderBlock(':root,\n[data-theme="light"]', Array.from(lightDecls.values()))
  const darkBlock = renderBlock('[data-theme="dark"]', Array.from(darkDecls.values()))

  const scss = header + lightBlock + (lightBlock && darkBlock ? '\n' : '') + darkBlock

  // Encode as UTF-8 bytes.
  const bytes = new TextEncoder().encode(scss)

  return {
    filename: '_origam.semantic.scss',
    mimeType: 'text/scss',
    bytes,
  }
}
