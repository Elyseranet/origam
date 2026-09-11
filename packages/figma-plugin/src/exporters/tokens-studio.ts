/**
 * tokens-studio.ts — Phase 7: Tokens Studio JSON exporter.
 *
 * Walks all local Figma Variable collections and variables, groups them by
 * token set (primitive / semantic/{mode} / component/{name}), serialises each
 * variable to DTCG format, then bundles the result as a ZIP using fflate.
 *
 * Return value:
 *   { filename: 'origam-tokens-studio.zip', mimeType: 'application/zip', bytes: Uint8Array }
 */

import { zipSync, strToU8 } from 'fflate'
import { rgbToHex } from '../lib/color'
import type { DTCGType } from '../lib/tokens-types'

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** Serialisable leaf token node for DTCG. */
interface DTCGLeaf {
  $type: DTCGType
  $value: string | number | boolean
  $description?: string
}

/** A recursive DTCG tree where every leaf is a DTCGLeaf. */
type DTCGTree = {
  [key: string]: DTCGTree | DTCGLeaf
}

/** Accumulator for all token sets. Keys are token-set names (e.g. "primitive", "semantic/light"). */
type TokenSetMap = Map<string, DTCGTree>

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

/**
 * Tokens Studio / Figma scopes that indicate "this is a spatial dimension"
 * (i.e. should be serialised as a dimension token like "4px") rather than a
 * bare number.
 */
const DIMENSION_SCOPES: VariableScope[] = [
  'WIDTH_HEIGHT',
  'GAP',
  'CORNER_RADIUS',
  'STROKE_FLOAT',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Figma variable name (slash-separated, e.g. "Color/Neutral/500")
 * to a dot-separated path (e.g. "color.neutral.500").
 */
function varNameToDotPath(name: string): string {
  return name
    .split('/')
    .map((segment) => segment.trim())
    .join('.')
    .toLowerCase()
}

/**
 * Determine the token-set key and the remaining local path from a fully
 * qualified variable name and its collection name.
 *
 * Detection rules:
 *   Collection "Primitive" (or starts with "Primitive")
 *     → set: "primitive", path: var name as dotted segments (all lowercase)
 *   Collection "Semantic" (or starts with "Semantic")
 *     → set: "semantic/{modeName}" (one set per mode)
 *   Collection "Component/{name}" or collection whose name contains "/"
 *     → set: "component/{name}", path: remaining segments
 *   Fallback: use the collection name itself as set key.
 */
function resolveTokenSet(
  collectionName: string,
  variableName: string,
  modeName: string,
): { tokenSet: string; localPath: string[] } {
  const collLower = collectionName.toLowerCase()

  // Split the variable name into path segments
  const segments = variableName.split('/').map((s) => s.trim().toLowerCase())

  // Primitive collection
  if (collLower.startsWith('primitive')) {
    return {
      tokenSet: 'primitive',
      localPath: segments,
    }
  }

  // Semantic collection — one set per mode
  if (collLower.startsWith('semantic')) {
    const modeKey = modeName.toLowerCase().replace(/\s+/g, '-')
    return {
      tokenSet: `semantic/${modeKey}`,
      localPath: segments,
    }
  }

  // Component collection (e.g. "Component/Btn" or just "Btn")
  if (collLower.startsWith('component')) {
    // e.g. "Component/Btn" → component name is "btn"
    const collSegments = collectionName.split('/').map((s) => s.trim().toLowerCase())
    const componentName = collSegments.slice(1).join('/') || segments[0]
    // variable path starts with the component name — keep it as-is
    return {
      tokenSet: `component/${componentName}`,
      localPath: segments,
    }
  }

  // Fallback: treat first path segment as the set, rest as local path.
  // This handles Tokens Studio's flat-collection approach where all variables
  // are stored in one collection grouped by segment hierarchy.
  const firstSegment = segments[0]

  if (firstSegment === 'primitive') {
    return { tokenSet: 'primitive', localPath: segments.slice(1) }
  }

  if (firstSegment === 'semantic') {
    const modeKey = modeName.toLowerCase().replace(/\s+/g, '-')
    return { tokenSet: `semantic/${modeKey}`, localPath: segments.slice(1) }
  }

  if (firstSegment === 'component' && segments.length > 1) {
    const componentName = segments[1]
    return {
      tokenSet: `component/${componentName}`,
      localPath: segments.slice(2).length > 0 ? segments.slice(2) : segments.slice(1),
    }
  }

  // Generic fallback: first segment is set, remainder is local path.
  return {
    tokenSet: collLower,
    localPath: segments,
  }
}

/**
 * Deep-set a value at a dotted path inside a DTCGTree, creating intermediate
 * group nodes as needed.
 */
function deepSet(tree: DTCGTree, path: string[], value: DTCGLeaf): void {
  let node: DTCGTree = tree

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!(key in node)) {
      node[key] = {}
    }
    // Cast: we know intermediate nodes are DTCGTree, not DTCGLeaf
    node = node[key] as DTCGTree
  }

  const leaf = path[path.length - 1]
  node[leaf] = value
}

/**
 * Serialise a Figma VariableValue to a DTCG leaf node.
 *
 * @param value  - the raw value from `variable.valuesByMode[modeId]`
 * @param resolvedType - Figma resolved type of the variable
 * @param scopes       - variable scopes (used for FLOAT → dimension vs number)
 * @param allVariables - full variable list for alias resolution
 */
function serialiseValue(
  value: VariableValue,
  resolvedType: Variable['resolvedType'],
  scopes: VariableScope[],
  allVariables: Variable[],
): DTCGLeaf {
  // ── Alias (VariableAlias) ──────────────────────────────────────────────────
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'type' in value &&
    (value as VariableAlias).type === 'VARIABLE_ALIAS'
  ) {
    const alias = value as VariableAlias
    const referenced = allVariables.find((v) => v.id === alias.id)
    if (referenced) {
      // Convert "Color/Neutral/500" → "{color.neutral.500}"
      const aliasPath = varNameToDotPath(referenced.name)
      return {
        $type: figmaTypeToDTCG(resolvedType, scopes),
        $value: `{${aliasPath}}`,
      }
    }
    // Cannot resolve alias — fall back to a placeholder
    return {
      $type: figmaTypeToDTCG(resolvedType, scopes),
      $value: `{UNRESOLVED_ALIAS}`,
    }
  }

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
      // Use rgbaToHex if alpha is < 1, otherwise rgbToHex
      const hex =
        'a' in rgba && (rgba as RGBA).a < 1
          ? rgbToHexWithAlpha(rgba as RGBA)
          : rgbToHex(rgba as { r: number; g: number; b: number })
      return { $type: 'color', $value: hex }
    }
    // Fallback — string color (e.g. "transparent")
    return { $type: 'color', $value: String(value) }
  }

  // ── FLOAT ─────────────────────────────────────────────────────────────────
  if (resolvedType === 'FLOAT') {
    const n = typeof value === 'number' ? value : parseFloat(String(value))
    const isDimension = scopes.some((s) => DIMENSION_SCOPES.includes(s))
    if (isDimension) {
      return { $type: 'dimension', $value: `${n}px` }
    }
    return { $type: 'number', $value: n }
  }

  // ── STRING ────────────────────────────────────────────────────────────────
  if (resolvedType === 'STRING') {
    return { $type: 'other', $value: String(value) }
  }

  // ── BOOLEAN ───────────────────────────────────────────────────────────────
  if (resolvedType === 'BOOLEAN') {
    return { $type: 'other', $value: Boolean(value) }
  }

  // Generic fallback
  return { $type: 'other', $value: String(value) }
}

/** Map Figma resolvedType to DTCG $type. */
function figmaTypeToDTCG(
  resolvedType: Variable['resolvedType'],
  scopes: VariableScope[],
): DTCGType {
  switch (resolvedType) {
    case 'COLOR':
      return 'color'
    case 'FLOAT': {
      const isDimension = scopes.some((s) => DIMENSION_SCOPES.includes(s))
      return isDimension ? 'dimension' : 'number'
    }
    case 'STRING':
      return 'other'
    case 'BOOLEAN':
      return 'other'
    default:
      return 'other'
  }
}

/** Convert RGBA (0..1 channels) to #RRGGBBAA or #RRGGBB. */
function rgbToHexWithAlpha(rgba: RGBA): string {
  const base = rgbToHex(rgba)
  if (rgba.a >= 1) return base

  const alphaByte = Math.round(Math.min(1, Math.max(0, rgba.a)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()

  return `${base}${alphaByte}`
}

// ---------------------------------------------------------------------------
// Build $metadata.json and $themes.json payloads
// ---------------------------------------------------------------------------

/**
 * Build a $metadata.json payload from the token sets that were actually found.
 * Order: primitive → semantic/* (sorted) → component/* (sorted).
 */
function buildMetadata(tokenSetKeys: string[]): string {
  const primitive = tokenSetKeys.filter((k) => k === 'primitive')
  const semantic = tokenSetKeys
    .filter((k) => k.startsWith('semantic/'))
    .sort()
  const component = tokenSetKeys
    .filter((k) => k.startsWith('component/'))
    .sort()

  const tokenSetOrder = [...primitive, ...semantic, ...component]

  return JSON.stringify({ tokenSetOrder }, null, 2)
}

/**
 * Build a $themes.json that mirrors the source repo convention:
 *   - "Light" theme: primitive enabled, semantic/light enabled, semantic/dark disabled
 *   - "Dark" theme: primitive enabled, semantic/light disabled, semantic/dark enabled
 *   - All component sets enabled in both themes.
 */
function buildThemes(tokenSetKeys: string[]): string {
  const primitive = tokenSetKeys.filter((k) => k === 'primitive')
  const semantic = tokenSetKeys.filter((k) => k.startsWith('semantic/'))
  const components = tokenSetKeys.filter((k) => k.startsWith('component/'))

  /** Build a selectedTokenSets map for a given theme. */
  function buildSelectedSets(activeSemanticMode: string): Record<string, 'enabled' | 'disabled'> {
    const sets: Record<string, 'enabled' | 'disabled'> = {}

    for (const k of primitive) {
      sets[k] = 'enabled'
    }
    for (const k of semantic) {
      sets[k] = k === activeSemanticMode ? 'enabled' : 'disabled'
    }
    for (const k of components) {
      sets[k] = 'enabled'
    }

    return sets
  }

  // Detect semantic mode names — e.g. "semantic/light" and "semantic/dark"
  const lightMode = semantic.find((s) => s.toLowerCase().includes('light')) ?? semantic[0]
  const darkMode = semantic.find((s) => s.toLowerCase().includes('dark')) ?? semantic[1]

  const themes = []

  if (lightMode !== undefined) {
    themes.push({
      id: 'light',
      name: 'Light',
      selectedTokenSets: buildSelectedSets(lightMode),
    })
  }

  if (darkMode !== undefined && darkMode !== lightMode) {
    themes.push({
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: buildSelectedSets(darkMode),
    })
  }

  return JSON.stringify(themes, null, 2)
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

/**
 * Export all local Figma Variables as a Tokens Studio JSON ZIP.
 *
 * Process:
 *   1. Collect all local variable collections + variables.
 *   2. For each collection × mode, map each variable to its token set and path.
 *   3. Serialise each variable value (raw or alias).
 *   4. Bundle into ZIP with $metadata.json + $themes.json + one JSON per set.
 */
export async function exportTokensStudio(): Promise<{
  filename: string
  mimeType: string
  bytes: Uint8Array
}> {
  const collections = figma.variables.getLocalVariableCollections()
  const allVariables = figma.variables.getLocalVariables()

  if (collections.length === 0) {
    throw new Error(
      'No Variable collections found. Please sync Tokens Studio first.',
    )
  }

  // Map: tokenSetKey → DTCGTree
  const tokenSets: TokenSetMap = new Map()

  for (const collection of collections) {
    const collectionVars = allVariables.filter(
      (v) => v.variableCollectionId === collection.id,
    )

    for (const mode of collection.modes) {
      for (const variable of collectionVars) {
        const rawValue = variable.valuesByMode[mode.modeId]
        if (rawValue === undefined) continue

        const { tokenSet, localPath } = resolveTokenSet(
          collection.name,
          variable.name,
          mode.name,
        )

        // Get or create the tree for this token set
        let tree = tokenSets.get(tokenSet)
        if (tree === undefined) {
          tree = {}
          tokenSets.set(tokenSet, tree)
        }

        if (localPath.length === 0) continue

        const leaf = serialiseValue(
          rawValue,
          variable.resolvedType,
          variable.scopes,
          allVariables,
        )

        deepSet(tree, localPath, leaf)
      }
    }
  }

  // ── Produce ZIP files ────────────────────────────────────────────────────

  const tokenSetKeys = Array.from(tokenSets.keys())

  const files: Record<string, Uint8Array> = {}

  // $metadata.json
  files['$metadata.json'] = strToU8(buildMetadata(tokenSetKeys))

  // $themes.json
  files['$themes.json'] = strToU8(buildThemes(tokenSetKeys))

  // One file per token set (e.g. "primitive.json", "semantic/light.json")
  for (const [key, tree] of tokenSets) {
    const filename = `${key}.json`
    files[filename] = strToU8(JSON.stringify(tree, null, 2))
  }

  // ── Bundle into ZIP ────────────────────────────────────────────────────
  const zipped = zipSync(files, { level: 6 })

  return {
    filename: 'origam-tokens-studio.zip',
    mimeType: 'application/zip',
    bytes: zipped,
  }
}
