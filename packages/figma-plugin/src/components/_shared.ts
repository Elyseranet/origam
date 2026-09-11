/**
 * _shared.ts — Primitive helpers reused by every component builder.
 *
 * All helpers are defensive: they no-op or return a sensible fallback when
 * Figma API calls fail, rather than throwing. Component builders should still
 * try/catch at the outer level.
 *
 * Design rationale:
 *  - createAutoLayoutFrame  : thin, configurable wrapper around figma.createFrame()
 *  - createComponent        : creates a single COMPONENT node and runs a build fn
 *  - createComponentSet     : wraps a list of COMPONENTs into a ComponentSet via
 *                             combineAsVariants. Variant names must follow Figma's
 *                             "prop=value, prop=value" convention.
 *  - addBooleanProperty     : adds a Boolean Component Property to the set
 *  - addTextProperty        : adds a Text Component Property to the set
 *  - addInstanceSwapProperty: adds an Instance Swap Component Property to the set
 *  - bindFill               : ergonomic wrapper over variables.ts::bindVariableToFill
 *                             that accepts a variable name string
 *  - progressEvery          : calls a notify callback every N frames (pitfall #6)
 */

import {
  findVariableByName,
  bindVariableToFill,
  bindVariableToStroke,
  bindVariableToCornerRadius,
} from '../lib/variables'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AutoLayoutFrameOpts {
  /** 'HORIZONTAL' | 'VERTICAL' | 'NONE' */
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  /** 'FIXED' | 'AUTO' on primary axis */
  primaryAxisSizingMode?: 'FIXED' | 'AUTO'
  /** 'FIXED' | 'AUTO' on counter axis */
  counterAxisSizingMode?: 'FIXED' | 'AUTO'
  /** Gap between children (px) */
  itemSpacing?: number
  /** Uniform padding (px). Overridden by individual sides. */
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  /** Alignment of children on primary axis */
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
  /** Alignment of children on counter axis */
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'
  /** Corner radius (px) */
  cornerRadius?: number
  /** Fixed width (only used when primaryAxisSizingMode or counterAxisSizingMode is FIXED) */
  width?: number
  /** Fixed height */
  height?: number
  /** Clip content to frame bounds */
  clipsContent?: boolean
  /** Fill colour (RGBA 0..1 floats). Defaults to transparent. */
  fills?: Paint[]
  /** Stroke alignment */
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER'
  /** Stroke weight (px) */
  strokeWeight?: number
}

// ---------------------------------------------------------------------------
// Auto-layout frame factory
// ---------------------------------------------------------------------------

/**
 * Create a Frame with auto-layout settings applied in one call.
 * All options are optional; sensible defaults match a horizontal pill button.
 */
export function createAutoLayoutFrame(
  name: string,
  opts: AutoLayoutFrameOpts = {},
): FrameNode {
  const frame = figma.createFrame()
  frame.name = name

  frame.layoutMode = opts.layoutMode ?? 'HORIZONTAL'
  frame.primaryAxisSizingMode = opts.primaryAxisSizingMode ?? 'AUTO'
  frame.counterAxisSizingMode = opts.counterAxisSizingMode ?? 'AUTO'
  frame.itemSpacing = opts.itemSpacing ?? 8
  frame.primaryAxisAlignItems = opts.primaryAxisAlignItems ?? 'CENTER'
  frame.counterAxisAlignItems = opts.counterAxisAlignItems ?? 'CENTER'
  frame.clipsContent = opts.clipsContent ?? false

  const uniformPadding = opts.padding ?? 0
  frame.paddingTop = opts.paddingTop ?? uniformPadding
  frame.paddingRight = opts.paddingRight ?? uniformPadding
  frame.paddingBottom = opts.paddingBottom ?? uniformPadding
  frame.paddingLeft = opts.paddingLeft ?? uniformPadding

  if (opts.cornerRadius !== undefined) {
    frame.cornerRadius = opts.cornerRadius
  }

  if (opts.width !== undefined) frame.resize(opts.width, frame.height)
  if (opts.height !== undefined) frame.resize(frame.width, opts.height)

  if (opts.fills !== undefined) {
    frame.fills = opts.fills
  }

  if (opts.strokeAlign !== undefined) frame.strokeAlign = opts.strokeAlign
  if (opts.strokeWeight !== undefined) frame.strokeWeight = opts.strokeWeight

  return frame
}

// ---------------------------------------------------------------------------
// Component node factory
// ---------------------------------------------------------------------------

/**
 * Create a COMPONENT node named `name`, run `build(node)` to populate it,
 * and return the node. The caller is responsible for positioning and
 * inserting the node into the target page.
 */
export function createComponent(
  name: string,
  build: (node: ComponentNode) => void,
): ComponentNode {
  const component = figma.createComponent()
  component.name = name
  build(component)
  return component
}

// ---------------------------------------------------------------------------
// ComponentSet factory
// ---------------------------------------------------------------------------

/**
 * Wrap a list of COMPONENT nodes into a ComponentSet via Figma's
 * `figma.combineAsVariants`. The set is named and positioned; callers
 * append it to the target page.
 *
 * Variant naming convention expected on each component:
 *   `"prop=value, prop=value"` (Figma's canonical multi-property format).
 */
export function createComponentSet(
  name: string,
  variants: ComponentNode[],
  targetPage: PageNode,
): ComponentSetNode {
  // combineAsVariants needs the nodes to already be on the page (or canvas).
  // Temporarily append them to the target page so the API accepts them.
  for (const v of variants) {
    targetPage.appendChild(v)
  }

  const set = figma.combineAsVariants(variants, targetPage)
  set.name = name

  return set
}

// ---------------------------------------------------------------------------
// Component Properties helpers
// ---------------------------------------------------------------------------

/**
 * Add a Boolean Component Property to a ComponentSet.
 * No-ops if the property already exists (idempotent on re-run).
 */
export function addBooleanProperty(
  set: ComponentSetNode,
  propName: string,
  defaultValue: boolean,
): void {
  try {
    const existing = set.componentPropertyDefinitions[propName]
    if (existing) return
    set.addComponentProperty(propName, 'BOOLEAN', defaultValue)
  } catch {
    // Property already exists or node doesn't support it.
  }
}

/**
 * Add a Text Component Property to a ComponentSet.
 * No-ops if the property already exists.
 */
export function addTextProperty(
  set: ComponentSetNode,
  propName: string,
  defaultValue: string,
): void {
  try {
    const existing = set.componentPropertyDefinitions[propName]
    if (existing) return
    set.addComponentProperty(propName, 'TEXT', defaultValue)
  } catch {
    // No-op.
  }
}

/**
 * Add an Instance Swap Component Property to a ComponentSet.
 * `defaultInstance` is optional — pass a ComponentNode to pre-fill the slot.
 */
export function addInstanceSwapProperty(
  set: ComponentSetNode,
  propName: string,
  defaultInstance?: ComponentNode,
): void {
  try {
    const existing = set.componentPropertyDefinitions[propName]
    if (existing) return
    set.addComponentProperty(propName, 'INSTANCE_SWAP', defaultInstance?.id ?? '')
  } catch {
    // No-op.
  }
}

// ---------------------------------------------------------------------------
// Variable-binding ergonomic wrappers
// ---------------------------------------------------------------------------

/**
 * Find a variable by name in `collection` and bind it to the first SOLID fill
 * of `node`. When the variable is not found, optionally set a fallback paint.
 *
 * Logs a figma.notify warning for missing variables (pitfall #3 mitigation).
 */
export function bindFill(
  node: SceneNode & { fills: readonly Paint[] | typeof figma.mixed },
  collection: VariableCollection,
  variableName: string,
  fallbackColor?: { r: number; g: number; b: number; a?: number },
): void {
  const variable = findVariableByName(collection, variableName)

  if (!variable) {
    figma.notify(
      `[Origam] Variable not found: "${variableName}". Using fallback.`,
      { error: false },
    )

    if (fallbackColor && node.fills !== figma.mixed) {
      const { r, g, b, a = 1 } = fallbackColor
      const paint: SolidPaint = { type: 'SOLID', color: { r, g, b }, opacity: a }
      ;(node as unknown as { fills: Paint[] }).fills = [paint]
    }
    return
  }

  // Ensure the node has at least one SOLID fill to bind against.
  if (node.fills === figma.mixed) return

  if (node.fills.length === 0 || node.fills[0].type !== 'SOLID') {
    const basePaint: SolidPaint = {
      type: 'SOLID',
      color: { r: 0.9, g: 0.9, b: 0.9 },
      opacity: 1,
    }
    ;(node as unknown as { fills: Paint[] }).fills = [basePaint]
  }

  bindVariableToFill(node, variable)
}

/**
 * Find a variable by name and bind it to the first SOLID stroke of `node`.
 */
export function bindStroke(
  node: SceneNode & { strokes: readonly Paint[] | typeof figma.mixed },
  collection: VariableCollection,
  variableName: string,
  fallbackColor?: { r: number; g: number; b: number; a?: number },
): void {
  const variable = findVariableByName(collection, variableName)

  if (!variable) {
    figma.notify(
      `[Origam] Variable not found: "${variableName}". Using fallback.`,
      { error: false },
    )

    if (fallbackColor && node.strokes !== figma.mixed) {
      const { r, g, b, a = 1 } = fallbackColor
      const paint: SolidPaint = { type: 'SOLID', color: { r, g, b }, opacity: a }
      ;(node as unknown as { strokes: Paint[] }).strokes = [paint]
    }
    return
  }

  if (node.strokes === figma.mixed) return

  if (node.strokes.length === 0 || node.strokes[0].type !== 'SOLID') {
    const basePaint: SolidPaint = {
      type: 'SOLID',
      color: { r: 0.2, g: 0.2, b: 0.8 },
      opacity: 1,
    }
    ;(node as unknown as { strokes: Paint[] }).strokes = [basePaint]
  }

  bindVariableToStroke(node, variable)
}

/**
 * Find a variable by name and bind it to all four corner radii of `node`.
 */
export function bindCornerRadius(
  node: SceneNode,
  collection: VariableCollection,
  variableName: string,
): void {
  const variable = findVariableByName(collection, variableName)
  if (!variable) {
    figma.notify(
      `[Origam] Variable not found: "${variableName}". Corner radius will use hardcoded fallback.`,
      { error: false },
    )
    return
  }
  bindVariableToCornerRadius(node, variable)
}

// ---------------------------------------------------------------------------
// Progress helper (pitfall #6)
// ---------------------------------------------------------------------------

/**
 * Call `callback(index)` for every item in `items`, emitting a `figma.notify`
 * every `every` calls so the UI stays responsive during long batched operations.
 *
 * Usage:
 *   await progressEvery(items, 10, (item, i) => buildVariant(item))
 */
export async function progressEvery<T>(
  items: T[],
  every: number,
  callback: (item: T, index: number) => void | Promise<void>,
  label?: string,
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    await callback(items[i], i)

    if ((i + 1) % every === 0 || i === items.length - 1) {
      const msg = label
        ? `[Origam] ${label}: ${i + 1}/${items.length}`
        : `[Origam] Building variants: ${i + 1}/${items.length}`
      figma.notify(msg, { timeout: 800 })
    }
  }
}
