/**
 * Card.ts — Figma component builder for `Origam/Card`.
 *
 * ─── REDUCED MATRIX RATIONALE ────────────────────────────────────────────────
 *
 * Full Cartesian: (4 variants × 3 densities) = 12 frames.
 * We keep all 12 — the matrix is already small enough to ship in full.
 *
 * Axes:
 *   variant  : elevated | flat | outlined | tonal
 *   density  : compact | default | comfortable
 *
 * Total: 12 variant frames.
 *
 * Component Properties added to the set (apply to ALL variants):
 *   Boolean      : hover, clickable, withImage, withActions
 *   Text         : title (default "Card Title"), subtitle (default "Subtitle"), body (default "Body text")
 *   InstanceSwap : imageSlot, actionsSlot
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
import type { BuildOpts } from './Btn'

// ---------------------------------------------------------------------------
// Token name helpers
// ---------------------------------------------------------------------------

const TOKEN_BG        = 'card.background'
const TOKEN_COLOR     = 'card.color'
const TOKEN_BORDER    = 'card.border-color'
const TOKEN_RADIUS    = 'card.border-radius-rounded'

// Fallback colours per variant
const VARIANT_FALLBACK_BG: Record<string, { r: number; g: number; b: number }> = {
  elevated:  { r: 1,    g: 1,    b: 1    },
  flat:      { r: 0.97, g: 0.97, b: 0.97 },
  outlined:  { r: 1,    g: 1,    b: 1    },
  tonal:     { r: 0.93, g: 0.93, b: 0.97 },
}

// Density → vertical padding
const DENSITY_PADDING: Record<string, number> = {
  compact:      8,
  default:     16,
  comfortable: 24,
}

// ---------------------------------------------------------------------------
// Internal variant builder
// ---------------------------------------------------------------------------

interface CardVariantSpec {
  variant: string
  density: string
}

async function buildVariantComponent(
  spec: CardVariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { variant, density } = spec
  const verticalPadding = DENSITY_PADDING[density] ?? 16
  const isOutlined = variant === 'outlined'

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    ensureTextStyle('Origam/Body/MD', {
      fontSize: 14,
      fontName: { family: 'Inter', style: 'Regular' },
      lineHeight: { unit: 'AUTO' },
      letterSpacing: { unit: 'PERCENT', value: 0 },
    })
  } catch {
    figma.notify('[Origam] Could not load Inter — falling back to default font.', { error: false })
  }

  const componentName = `variant=${variant}, density=${density}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'VERTICAL'
    node.primaryAxisSizingMode = 'AUTO'
    node.counterAxisSizingMode = 'FIXED'
    node.resize(280, node.height)
    node.primaryAxisAlignItems = 'MIN'
    node.counterAxisAlignItems = 'MIN'
    node.itemSpacing = 8
    node.paddingLeft = 16
    node.paddingRight = 16
    node.paddingTop = verticalPadding
    node.paddingBottom = verticalPadding
    node.cornerRadius = 8
    node.clipsContent = true

    // Background fill
    const fallbackBg = VARIANT_FALLBACK_BG[variant] ?? { r: 1, g: 1, b: 1 }
    node.fills = [{ type: 'SOLID', color: fallbackBg, opacity: 1 }]

    if (variant === 'tonal') {
      bindFill(node, collection, 'card.background', fallbackBg)
    } else if (variant === 'flat') {
      node.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 }, opacity: 1 }]
      bindFill(node, collection, TOKEN_BG, fallbackBg)
    } else {
      bindFill(node, collection, TOKEN_BG, fallbackBg)
    }

    // Stroke for outlined variant
    if (isOutlined) {
      node.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 }, opacity: 1 }]
      node.strokeWeight = 1
      node.strokeAlign = 'INSIDE'
      bindStroke(node, collection, TOKEN_BORDER, { r: 0.8, g: 0.8, b: 0.8 })
    } else {
      node.strokes = []
    }

    // Elevated variant — simulate with a note (shadow not directly bindable)
    if (variant === 'elevated') {
      // Corner radius bound to token
      bindCornerRadius(node, collection, TOKEN_RADIUS)
    }

    // Title text
    const title = figma.createText()
    title.name = 'title'
    title.characters = 'Card Title'
    title.fontSize = 16
    title.textAutoResize = 'WIDTH_AND_HEIGHT'
    title.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 }, opacity: 1 }]
    bindFill(title, collection, TOKEN_COLOR, { r: 0.1, g: 0.1, b: 0.1 })

    // Subtitle text
    const subtitle = figma.createText()
    subtitle.name = 'subtitle'
    subtitle.characters = 'Subtitle'
    subtitle.fontSize = 12
    subtitle.textAutoResize = 'WIDTH_AND_HEIGHT'
    subtitle.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 }, opacity: 1 }]

    // Body text
    const body = figma.createText()
    body.name = 'body'
    body.characters = 'Body text for this card component'
    body.fontSize = 14
    body.textAutoResize = 'WIDTH_AND_HEIGHT'
    body.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 }, opacity: 1 }]

    // Image placeholder (hidden by default via withImage boolean)
    const imagePlaceholder = figma.createRectangle()
    imagePlaceholder.name = 'imageSlot'
    imagePlaceholder.resize(280, 160)
    imagePlaceholder.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 }, opacity: 1 }]

    // Actions placeholder
    const actionsPlaceholder = figma.createRectangle()
    actionsPlaceholder.name = 'actionsSlot'
    actionsPlaceholder.resize(120, 36)
    actionsPlaceholder.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }]

    node.appendChild(imagePlaceholder)
    node.appendChild(title)
    node.appendChild(subtitle)
    node.appendChild(body)
    node.appendChild(actionsPlaceholder)
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

function buildVariantSpecs(): CardVariantSpec[] {
  const variants  = ['elevated', 'flat', 'outlined', 'tonal']
  const densities = ['compact', 'default', 'comfortable']
  const specs: CardVariantSpec[] = []
  for (const variant of variants) {
    for (const density of densities) {
      specs.push({ variant, density })
    }
  }
  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildCard(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Card',
  )

  const set = createComponentSet('Origam/Card', variantNodes, targetPage)

  addBooleanProperty(set, 'hover',       false)
  addBooleanProperty(set, 'clickable',   false)
  addBooleanProperty(set, 'withImage',   false)
  addBooleanProperty(set, 'withActions', false)

  addTextProperty(set, 'title',    'Card Title')
  addTextProperty(set, 'subtitle', 'Subtitle')
  addTextProperty(set, 'body',     'Body text')

  addInstanceSwapProperty(set, 'imageSlot')
  addInstanceSwapProperty(set, 'actionsSlot')

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

  figma.notify('[Origam] Card component set created (12 variants).', { timeout: 2000 })

  return set
}
