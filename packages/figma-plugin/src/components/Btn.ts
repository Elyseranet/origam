/**
 * Btn.ts — Figma component builder for `Origam/Btn`.
 *
 * ─── REDUCED MATRIX RATIONALE ───────────────────────────────────────────────
 *
 * Full Cartesian of (7 intents × 5 variants × 5 sizes) = 175 variants.
 * Figma renders all permutations live via Component Properties. We only ship
 * the combinations where STYLE actually differs; everything else the designer
 * switches interactively.
 *
 * Rule for Phase 4 + all subsequent phases (5 & 6):
 *   "Expose intent + variant + size as Variant dims for the canonical
 *    default-size combinations only. Everything else (disabled, loading,
 *    icon presence, rounded, block) is a Component Property (Boolean / Text /
 *    Instance Swap). Keep the Variant count under ~20 per component."
 *
 * Base matrix (16 unique frames after de-dup):
 *   Row A — intent tour   : (primary|secondary|ghost|success|warning|danger|info) × filled × md  → 7 variants
 *   Row B — variant tour  : primary × (filled|tonal|outlined|text|plain) × md                   → 5 variants
 *   Row C — size tour     : primary × filled × (xs|sm|md|lg|xl)                                 → 5 variants
 *   De-dup: "primary,filled,md" is shared by rows A+B+C → subtract 2 duplicates → 7+5+5-2 = 15
 *   (primary/filled/md appears in A, B, and C; we include it once → 7+4+4 = 15)
 *
 * Total: 15 variant frames.
 *
 * Component Properties added to the set (apply to ALL variants):
 *   Boolean  : disabled, loading, iconPrepend, iconAppend, block, rounded
 *   Text     : label (default "Button")
 *   InstanceSwap: iconPrependSlot, iconAppendSlot
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ensureTextStyle } from '../lib/styles'
import {
  createComponent,
  createComponentSet,
  addBooleanProperty,
  addTextProperty,
  addInstanceSwapProperty,
  bindFill,
  bindStroke,
  bindCornerRadius,
  progressEvery,
} from './_shared'

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface BuildOpts {
  targetPage: PageNode
  collection: VariableCollection
  onProgress?: (current: number, total: number) => void
}

// ---------------------------------------------------------------------------
// Token name helpers
// ---------------------------------------------------------------------------

/** Token name for the base background-color (no intent prefix). */
const TOKEN_BASE_BG = 'btn.background-color'
/** Token name for the base foreground color. */
const TOKEN_BASE_FG = 'btn.color'
/** Border-radius token. */
const TOKEN_BORDER_RADIUS = 'btn.border-radius'
/** Outlined border-color token (base). */
const TOKEN_BORDER_COLOR = 'btn.border-color'

/**
 * Resolve the background-color token name for a given intent.
 * Returns the intent-specific path when an intent-specific token exists in
 * btn.json, otherwise falls back to the base token.
 */
function bgTokenName(intent: string): string {
  // Intents with dedicated tokens in tokens/component/btn.json:
  const intentTokens: Record<string, boolean> = {
    primary: true,
    ghost: true,
    success: true,
    warning: true,
    danger: true,
    info: true,
  }
  if (intentTokens[intent]) {
    return `btn.${intent}.background-color`
  }
  // 'secondary' has no dedicated intent token — falls back to base bg
  return TOKEN_BASE_BG
}

/**
 * Resolve the foreground color token name for a given intent.
 */
function fgTokenName(intent: string): string {
  const intentTokens: Record<string, boolean> = {
    primary: true,
    ghost: true,
    success: true,
    warning: true,
    danger: true,
    info: true,
  }
  if (intentTokens[intent]) {
    return `btn.${intent}.color`
  }
  return TOKEN_BASE_FG
}

// ---------------------------------------------------------------------------
// Per-size fallback values (matching Vue OrigamBtn defaults)
// These are used only when a Variable is missing (Tokens Studio not installed).
// ---------------------------------------------------------------------------

interface SizeFallbacks {
  height: number
  paddingInline: number
  fontSize: number
  minWidth: number
}

const SIZE_FALLBACKS: Record<string, SizeFallbacks> = {
  xs: { height: 20, paddingInline: 8,  fontSize: 10, minWidth: 40 },
  sm: { height: 28, paddingInline: 12, fontSize: 12, minWidth: 52 },
  md: { height: 36, paddingInline: 16, fontSize: 14, minWidth: 64 },
  lg: { height: 44, paddingInline: 20, fontSize: 16, minWidth: 72 },
  xl: { height: 52, paddingInline: 24, fontSize: 18, minWidth: 80 },
}

// Fallback fill colors per intent (RGBA 0..1) for when Variables are absent.
const INTENT_FALLBACK_BG: Record<string, { r: number; g: number; b: number }> = {
  primary:   { r: 0.11, g: 0.42, b: 0.96 },
  secondary: { r: 0.45, g: 0.45, b: 0.45 },
  ghost:     { r: 1,    g: 1,    b: 1    },
  success:   { r: 0.13, g: 0.70, b: 0.39 },
  warning:   { r: 0.96, g: 0.62, b: 0.10 },
  danger:    { r: 0.89, g: 0.19, b: 0.22 },
  info:      { r: 0.10, g: 0.69, b: 0.96 },
}

// ---------------------------------------------------------------------------
// Internal variant builder
// ---------------------------------------------------------------------------

interface VariantSpec {
  intent: string
  variant: string
  size: string
}

/**
 * Build a single variant COMPONENT node.
 * Naming follows Figma's canonical convention: "intent=primary, variant=filled, size=md"
 */
async function buildVariantComponent(
  spec: VariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { intent, variant, size } = spec
  const fallbacks = SIZE_FALLBACKS[size] ?? SIZE_FALLBACKS.md
  const isOutlined = variant === 'outlined'

  // Ensure a reusable Body/MD text style exists (loads font async in Figma).
  // We can't await font loading inside a strict sync context, so we use a
  // try/catch and fall back to the Figma default font.
  let textStyle: TextStyle | null = null
  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    textStyle = ensureTextStyle('Origam/Body/MD', {
      fontSize: 14,
      fontName: { family: 'Inter', style: 'Medium' },
      lineHeight: { unit: 'AUTO' },
      letterSpacing: { unit: 'PERCENT', value: 1.25 },
    })
  } catch {
    // Font not available in this Figma file — text will use the default.
    figma.notify('[Origam] Could not load Inter/Medium — falling back to default font.', { error: false })
  }

  const componentName = `intent=${intent}, variant=${variant}, size=${size}`

  return createComponent(componentName, (node) => {
    // ── Frame layout ──────────────────────────────────────────────────────
    node.layoutMode = 'HORIZONTAL'
    node.primaryAxisSizingMode = 'AUTO'
    node.counterAxisSizingMode = 'FIXED'
    node.resize(node.width, fallbacks.height)
    node.primaryAxisAlignItems = 'CENTER'
    node.counterAxisAlignItems = 'CENTER'
    node.itemSpacing = 8 // TODO: bind to btn.gap token when it exists
    node.paddingLeft = fallbacks.paddingInline
    node.paddingRight = fallbacks.paddingInline
    node.paddingTop = 0
    node.paddingBottom = 0
    node.cornerRadius = 4 // fallback; overridden by token binding below
    node.clipsContent = true

    // Ensure there is a base SOLID fill before binding the variable.
    const baseFill: SolidPaint = {
      type: 'SOLID',
      color: INTENT_FALLBACK_BG[intent] ?? { r: 0.5, g: 0.5, b: 0.5 },
      opacity: 1,
    }
    node.fills = [baseFill]

    // ── Fill (background) ─────────────────────────────────────────────────
    if (variant === 'text' || variant === 'plain') {
      // Text/plain variants are transparent
      node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
    } else if (variant === 'tonal') {
      // Tonal uses surface overlay — base token
      bindFill(
        node,
        collection,
        'btn.background-color-tonal',
        INTENT_FALLBACK_BG[intent],
      )
    } else {
      // filled, outlined, ghost all use intent bg
      bindFill(
        node,
        collection,
        bgTokenName(intent),
        INTENT_FALLBACK_BG[intent],
      )

      if (variant === 'outlined') {
        // Outlined: transparent fill + stroke
        node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
      }
    }

    // ── Stroke (outlined variant only) ────────────────────────────────────
    if (isOutlined) {
      const strokePaint: SolidPaint = {
        type: 'SOLID',
        color: INTENT_FALLBACK_BG[intent] ?? { r: 0.2, g: 0.2, b: 0.8 },
        opacity: 1,
      }
      node.strokes = [strokePaint]
      node.strokeWeight = 1
      node.strokeAlign = 'INSIDE'
      bindStroke(
        node,
        collection,
        TOKEN_BORDER_COLOR,
        INTENT_FALLBACK_BG[intent],
      )
    } else {
      node.strokes = []
    }

    // ── Corner radius ─────────────────────────────────────────────────────
    bindCornerRadius(node, collection, TOKEN_BORDER_RADIUS)

    // ── Children: [iconPrepend placeholder] [label] [iconAppend placeholder] ─
    // Icon placeholder — a 16×16 rectangle (Instance Swap target)
    const makePlaceholder = (name: string): RectangleNode => {
      const rect = figma.createRectangle()
      rect.name = name
      rect.resize(16, 16)
      rect.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }]
      return rect
    }

    const prependIcon = makePlaceholder('iconPrependSlot')
    const appendIcon = makePlaceholder('iconAppendSlot')

    // Label text node
    const label = figma.createText()
    label.name = 'label'
    label.characters = 'Button'
    label.fontSize = fallbacks.fontSize
    label.textAutoResize = 'WIDTH_AND_HEIGHT'

    if (textStyle) {
      label.textStyleId = textStyle.id
    }

    // Foreground color on the text node
    const fgFallback: SolidPaint = {
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 },
      opacity: 1,
    }
    label.fills = [fgFallback]
    bindFill(label, collection, fgTokenName(intent), { r: 1, g: 1, b: 1 })

    node.appendChild(prependIcon)
    node.appendChild(label)
    node.appendChild(appendIcon)
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

/**
 * Build the reduced 15-variant matrix.
 * See module-level comment for rationale.
 *
 *   Row A (intent tour, filled, md):   7 variants
 *   Row B (primary, variant tour, md): 4 additional variants (skip primary/filled/md already in A)
 *   Row C (primary, filled, size tour): 4 additional variants (skip md already in A)
 *   Total: 7 + 4 + 4 = 15
 */
function buildVariantSpecs(): VariantSpec[] {
  const intents = ['primary', 'secondary', 'ghost', 'success', 'warning', 'danger', 'info']
  const variants = ['filled', 'tonal', 'outlined', 'text', 'plain']
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl']

  const specs: VariantSpec[] = []

  // Row A — intent tour (all intents, filled, md)
  for (const intent of intents) {
    specs.push({ intent, variant: 'filled', size: 'md' })
  }

  // Row B — variant tour (primary, all variants except filled which is in Row A, md)
  for (const variant of variants) {
    if (variant === 'filled') continue // already in Row A as primary/filled/md
    specs.push({ intent: 'primary', variant, size: 'md' })
  }

  // Row C — size tour (primary, filled, all sizes except md which is in Row A)
  for (const size of sizes) {
    if (size === 'md') continue // already in Row A as primary/filled/md
    specs.push({ intent: 'primary', variant: 'filled', size })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Build the `Origam/Btn` ComponentSet on `targetPage`.
 * Returns the created ComponentSetNode.
 */
export async function buildBtn(opts: BuildOpts): Promise<ComponentSetNode> {
  const { targetPage, collection, onProgress } = opts

  const specs = buildVariantSpecs()
  const total = specs.length
  const variantNodes: ComponentNode[] = []

  // Build each variant, notifying progress every 5 frames.
  await progressEvery(
    specs,
    5,
    async (spec, i) => {
      const node = await buildVariantComponent(spec, collection)
      variantNodes.push(node)
      onProgress?.(i + 1, total)
    },
    'Btn',
  )

  // Combine into a ComponentSet.
  const set = createComponentSet('Origam/Btn', variantNodes, targetPage)

  // ── Component Properties ─────────────────────────────────────────────────
  addBooleanProperty(set, 'disabled',    false)
  addBooleanProperty(set, 'loading',     false)
  addBooleanProperty(set, 'iconPrepend', false)
  addBooleanProperty(set, 'iconAppend',  false)
  addBooleanProperty(set, 'block',       false)
  addBooleanProperty(set, 'rounded',     false)

  addTextProperty(set, 'label', 'Button')

  addInstanceSwapProperty(set, 'iconPrependSlot')
  addInstanceSwapProperty(set, 'iconAppendSlot')

  // Auto-layout the set itself so variants are organised in a grid.
  set.layoutMode = 'HORIZONTAL'
  set.primaryAxisSizingMode = 'AUTO'
  set.counterAxisSizingMode = 'AUTO'
  set.itemSpacing = 16
  set.paddingTop = 16
  set.paddingRight = 16
  set.paddingBottom = 16
  set.paddingLeft = 16
  set.layoutWrap = 'WRAP'
  set.counterAxisSpacing = 16

  figma.notify('[Origam] Btn component set created (15 variants).', { timeout: 2000 })

  return set
}
