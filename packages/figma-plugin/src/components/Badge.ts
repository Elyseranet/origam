/**
 * Badge.ts — Figma component builder for `Origam/Badge`.
 *
 * ─── REDUCED MATRIX RATIONALE ────────────────────────────────────────────────
 *
 * Full Cartesian: (6 intents × 3 variants × 3 sizes) = 54 frames — too many.
 *
 * Anchor: primary / numeric / md
 *
 *   Row A — intent tour  : (success|warning|danger|info|neutral) × numeric × md   → 5 (primary in anchor)
 *   Row B — variant tour : primary × (dot|text) × md                              → 2 (numeric in anchor)
 *   Row C — size tour    : primary × numeric × (sm|lg)                            → 2 (md in anchor)
 *   Anchor               :                                                          → 1
 *
 * Total: 1 + 5 + 2 + 2 = 10 variant frames.
 *
 * Component Properties (apply to ALL variants):
 *   Boolean : inline (vs floating)
 *   Text    : value (default "5")
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ensureTextStyle } from '../lib/styles'
import {
  createComponent,
  createComponentSet,
  addBooleanProperty,
  addTextProperty,
  bindFill,
  progressEvery,
} from './_shared'
import type { BuildOpts } from './Btn'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

const TOKEN_BASE_BG    = 'badge.badge.background-color'
const TOKEN_BASE_COLOR = 'badge.badge.color'

function bgToken(intent: string): string {
  const intentMap: Record<string, boolean> = {
    success: true, warning: true, danger: true, info: true,
  }
  return intentMap[intent] ? `badge.${intent}.background-color` : TOKEN_BASE_BG
}

function fgToken(intent: string): string {
  const intentMap: Record<string, boolean> = {
    success: true, warning: true, danger: true, info: true,
  }
  return intentMap[intent] ? `badge.${intent}.color` : TOKEN_BASE_COLOR
}

// Fallback colours per intent
const INTENT_FALLBACK_BG: Record<string, { r: number; g: number; b: number }> = {
  primary: { r: 0.11, g: 0.42, b: 0.96 },
  success: { r: 0.13, g: 0.70, b: 0.39 },
  warning: { r: 0.96, g: 0.62, b: 0.10 },
  danger:  { r: 0.89, g: 0.19, b: 0.22 },
  info:    { r: 0.10, g: 0.69, b: 0.96 },
  neutral: { r: 0.50, g: 0.50, b: 0.50 },
}

// Badge pip sizes
const SIZE_DIMS: Record<string, { width: number; height: number; fontSize: number }> = {
  sm: { width: 16, height: 16, fontSize: 10 },
  md: { width: 20, height: 20, fontSize: 11 },
  lg: { width: 24, height: 24, fontSize: 12 },
}

// ---------------------------------------------------------------------------
// Variant builder
// ---------------------------------------------------------------------------

interface BadgeVariantSpec {
  intent:  string
  variant: string
  size:    string
}

async function buildVariantComponent(
  spec: BadgeVariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { intent, variant, size } = spec
  const dims = SIZE_DIMS[size] ?? SIZE_DIMS.md
  const isDot = variant === 'dot'

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    ensureTextStyle('Origam/Label/XS', {
      fontSize: 10,
      fontName: { family: 'Inter', style: 'Medium' },
      lineHeight: { unit: 'AUTO' },
      letterSpacing: { unit: 'PERCENT', value: 0 },
    })
  } catch {
    figma.notify('[Origam] Could not load Inter.', { error: false })
  }

  const componentName = `intent=${intent}, variant=${variant}, size=${size}`

  return createComponent(componentName, (node) => {
    // Outer wrapper: represents the anchored parent + floating badge
    node.layoutMode = 'NONE'
    node.resize(40, 40)
    node.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 }, opacity: 0.3 }]

    // Content placeholder (the element the badge is attached to)
    const content = figma.createRectangle()
    content.name = 'content'
    content.resize(32, 32)
    content.x = 4
    content.y = 4
    content.cornerRadius = 4
    content.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 }, opacity: 1 }]

    // Badge pip
    const pip = figma.createFrame()
    pip.name = 'badge'
    pip.cornerRadius = 999
    pip.clipsContent = true

    const fallbackBg = INTENT_FALLBACK_BG[intent] ?? { r: 0.5, g: 0.5, b: 0.5 }

    if (isDot) {
      const dotSize = size === 'sm' ? 8 : size === 'lg' ? 12 : 10
      pip.resize(dotSize, dotSize)
      pip.fills = [{ type: 'SOLID', color: fallbackBg, opacity: 1 }]
      bindFill(pip, collection, bgToken(intent), fallbackBg)
      pip.x = 32 - dotSize / 2
      pip.y = 0
    } else {
      // numeric or text variant
      pip.layoutMode = 'HORIZONTAL'
      pip.primaryAxisSizingMode = 'AUTO'
      pip.counterAxisSizingMode = 'FIXED'
      pip.resize(pip.width, isDot ? dims.height / 2 : dims.height)
      pip.primaryAxisAlignItems = 'CENTER'
      pip.counterAxisAlignItems = 'CENTER'
      pip.paddingLeft  = 4
      pip.paddingRight = 4

      pip.fills = [{ type: 'SOLID', color: fallbackBg, opacity: 1 }]
      bindFill(pip, collection, bgToken(intent), fallbackBg)

      const valueText = figma.createText()
      valueText.name = 'value'
      valueText.characters = variant === 'text' ? 'NEW' : '5'
      valueText.fontSize = dims.fontSize
      valueText.fontName = { family: 'Inter', style: 'Medium' }
      valueText.textAutoResize = 'WIDTH_AND_HEIGHT'
      valueText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }]
      bindFill(valueText, collection, fgToken(intent), { r: 1, g: 1, b: 1 })

      pip.appendChild(valueText)
      pip.x = 28
      pip.y = -6
    }

    node.appendChild(content)
    node.appendChild(pip)
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

function buildVariantSpecs(): BadgeVariantSpec[] {
  const specs: BadgeVariantSpec[] = []

  // Anchor
  specs.push({ intent: 'primary', variant: 'numeric', size: 'md' })

  // Row A — intent tour (non-primary, numeric, md)
  for (const intent of ['success', 'warning', 'danger', 'info', 'neutral']) {
    specs.push({ intent, variant: 'numeric', size: 'md' })
  }

  // Row B — variant tour (primary, non-numeric, md)
  for (const variant of ['dot', 'text']) {
    specs.push({ intent: 'primary', variant, size: 'md' })
  }

  // Row C — size tour (primary, numeric, non-md)
  for (const size of ['sm', 'lg']) {
    specs.push({ intent: 'primary', variant: 'numeric', size })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildBadge(opts: BuildOpts): Promise<ComponentSetNode> {
  const { targetPage, collection, onProgress } = opts

  const specs = buildVariantSpecs()
  const total = specs.length
  const variantNodes: ComponentNode[] = []

  await progressEvery(
    specs,
    5,
    async (spec, i) => {
      const node = await buildVariantComponent(spec, collection)
      variantNodes.push(node)
      onProgress?.(i + 1, total)
    },
    'Badge',
  )

  const set = createComponentSet('Origam/Badge', variantNodes, targetPage)

  addBooleanProperty(set, 'inline', false)

  addTextProperty(set, 'value', '5')

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

  figma.notify('[Origam] Badge component set created (10 variants).', { timeout: 2000 })

  return set
}
