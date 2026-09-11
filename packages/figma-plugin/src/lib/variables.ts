/**
 * variables.ts — Figma Variables API wrappers.
 *
 * These helpers are stubs for Phase 4+ component builders. Every function is
 * defensive: returns null / no-ops rather than throwing on missing data,
 * unless explicitly documented otherwise.
 *
 * Figma Variable naming: Tokens Studio creates variables with `/` separators
 * (e.g. "Color/Surface/Default"). Origam tokens use `.` notation
 * ("color.surface.default"). Both are supported throughout.
 */

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

/**
 * Convert a dotted path to a slash path and normalise casing for comparison.
 * e.g. `"color.surface.default"` → `"color/surface/default"`
 */
function normalisePath(path: string): string {
  return path.replace(/\./g, '/').toLowerCase()
}

/**
 * Normalise a Figma variable name for comparison.
 * e.g. `"Color/Surface/Default"` → `"color/surface/default"`
 */
function normaliseVariableName(name: string): string {
  return name.toLowerCase()
}

// ---------------------------------------------------------------------------
// Collection helpers
// ---------------------------------------------------------------------------

/**
 * Find a Figma `VariableCollection` by name (case-insensitive).
 * Returns `null` if not found.
 */
export function findCollection(name: string): VariableCollection | null {
  const needle = name.toLowerCase()

  try {
    const collections = figma.variables.getLocalVariableCollections()
    return (
      collections.find(
        (c) => c.name.toLowerCase() === needle,
      ) ?? null
    )
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Variable lookup
// ---------------------------------------------------------------------------

/**
 * Find a variable within a collection by dotted or slash path.
 *
 * Tokens Studio exposes variables with `/` separators in Figma. This helper
 * accepts both `"color.surface.default"` and `"Color/Surface/Default"`.
 *
 * Returns `null` if not found.
 */
export function findVariableByName(
  collection: VariableCollection,
  path: string,
): Variable | null {
  const needle = normalisePath(path)

  try {
    for (const id of collection.variableIds) {
      const variable = figma.variables.getVariableById(id)
      if (!variable) continue
      if (normaliseVariableName(variable.name) === needle) {
        return variable
      }
    }
    return null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Value retrieval
// ---------------------------------------------------------------------------

/**
 * Get the resolved value of a variable for a given mode.
 * Defaults to the collection's first (default) mode when `modeId` is omitted.
 *
 * Returns `undefined` when the variable or mode is not found — callers
 * should guard accordingly.
 */
export function getVariableValue(
  variable: Variable,
  modeId?: string,
): VariableValue | undefined {
  try {
    const effectiveModeId =
      modeId ?? Object.keys(variable.valuesByMode)[0]

    if (!effectiveModeId) return undefined
    return variable.valuesByMode[effectiveModeId]
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Paint binding helpers
// ---------------------------------------------------------------------------

/**
 * Replace the first SOLID fill on a node with one bound to a Figma Variable.
 * No-ops when the node has no fills, fills are mixed, or the variable is
 * incompatible with a fill paint.
 */
export function bindVariableToFill(
  node: SceneNode & { fills: readonly Paint[] | typeof figma.mixed },
  variable: Variable,
  _modeId?: string,
): void {
  if (node.fills === figma.mixed) return

  const fills = [...node.fills]
  const solidIndex = fills.findIndex((p) => p.type === 'SOLID')

  if (solidIndex === -1) return

  const solid = fills[solidIndex] as SolidPaint

  try {
    const bound = figma.variables.setBoundVariableForPaint(
      solid,
      'color',
      variable,
    )
    fills[solidIndex] = bound
    // The Figma plugin typings mark fills as `readonly Paint[]` on the node
    // type, but at runtime the setter is supported. We must cast to assign.
    // TODO: revisit when @figma/plugin-typings exposes a mutable fills setter.
    ;(node as unknown as { fills: Paint[] }).fills = fills
  } catch {
    // Variable type mismatch or unsupported node — silently no-op.
  }
}

/**
 * Replace the first SOLID stroke on a node with one bound to a Figma Variable.
 * Symmetric to `bindVariableToFill`.
 */
export function bindVariableToStroke(
  node: SceneNode & { strokes: readonly Paint[] | typeof figma.mixed },
  variable: Variable,
  _modeId?: string,
): void {
  if (node.strokes === figma.mixed) return

  const strokes = [...node.strokes]
  const solidIndex = strokes.findIndex((p) => p.type === 'SOLID')

  if (solidIndex === -1) return

  const solid = strokes[solidIndex] as SolidPaint

  try {
    const bound = figma.variables.setBoundVariableForPaint(
      solid,
      'color',
      variable,
    )
    strokes[solidIndex] = bound
    // Same as fills: cast required to assign to the readonly-typed strokes.
    // TODO: revisit when @figma/plugin-typings exposes a mutable strokes setter.
    ;(node as unknown as { strokes: Paint[] }).strokes = strokes
  } catch {
    // Silently no-op.
  }
}

// ---------------------------------------------------------------------------
// Corner radius binding
// ---------------------------------------------------------------------------

type CornerRadiusField =
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'

/** Minimal interface for nodes that support variable binding on fields. */
interface BindableNode {
  setBoundVariable(field: VariableBindableNodeField, variable: Variable | null): void
}

/**
 * Bind a Figma Variable to all four corner radii of a node that supports them.
 * Skips corners whose `setBoundVariable` call fails (e.g. type mismatch).
 */
export function bindVariableToCornerRadius(
  node: SceneNode,
  variable: Variable,
): void {
  const bindable = node as unknown as Partial<BindableNode>
  if (typeof bindable.setBoundVariable !== 'function') return

  const corners: CornerRadiusField[] = [
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius',
  ]

  for (const corner of corners) {
    try {
      bindable.setBoundVariable(corner, variable)
    } catch {
      // No-op — node may not support independent corner radii.
    }
  }
}
