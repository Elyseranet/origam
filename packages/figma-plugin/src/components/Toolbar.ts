/**
 * Toolbar.ts — Figma component builder for `Origam/Toolbar`.
 *
 * ─── REDUCED MATRIX RATIONALE ────────────────────────────────────────────────
 *
 * Full Cartesian: (3 variants × 3 densities) = 9 frames.
 *
 * Anchor: default / default
 *
 *   Row A — variant tour  : (dense|prominent) × default density           → 2 (default in anchor)
 *   Row B — density tour  : default variant × (compact|comfortable)       → 2 (default in anchor)
 *   Anchor                :                                                 → 1
 *
 * Total: 1 + 2 + 2 = 5 variant frames.
 *
 * Component Properties (apply to ALL variants):
 *   Boolean      : flat, floating, withExtension
 *   Text         : title (default "Page Title")
 *   InstanceSwap : prependSlot, actionsSlot, appendSlot
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
  progressEvery,
} from './_shared'
import type { BuildOpts } from './Btn'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

const TOKEN_BG    = 'toolbar.background'
const TOKEN_COLOR = 'toolbar.color'

const FALLBACK_BG: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 }
const FALLBACK_FG: { r: number; g: number; b: number } = { r: 0.1, g: 0.1, b: 0.1 }

// Toolbar height per variant
const VARIANT_HEIGHT: Record<string, number> = {
  default:   64,
  dense:     48,
  prominent: 128,
}

// Density vertical padding modifier
const DENSITY_PADDING: Record<string, number> = {
  compact:      4,
  default:      8,
  comfortable: 16,
}

// ---------------------------------------------------------------------------
// Variant builder
// ---------------------------------------------------------------------------

interface ToolbarVariantSpec {
  variant: string
  density: string
}

async function buildVariantComponent(
  spec: ToolbarVariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { variant, density } = spec
  const height  = VARIANT_HEIGHT[variant] ?? 64
  const padding = DENSITY_PADDING[density] ?? 8

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    ensureTextStyle('Origam/Title/MD', {
      fontSize: 18,
      fontName: { family: 'Inter', style: 'Regular' },
      lineHeight: { unit: 'AUTO' },
      letterSpacing: { unit: 'PERCENT', value: 0 },
    })
  } catch {
    figma.notify('[Origam] Could not load Inter.', { error: false })
  }

  const componentName = `variant=${variant}, density=${density}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'HORIZONTAL'
    node.primaryAxisSizingMode = 'FIXED'
    node.counterAxisSizingMode = 'FIXED'
    node.resize(600, height)
    node.primaryAxisAlignItems = 'SPACE_BETWEEN'
    node.counterAxisAlignItems = 'CENTER'
    node.itemSpacing = 8
    node.paddingLeft  = 16
    node.paddingRight = 16
    node.paddingTop   = padding
    node.paddingBottom = padding
    node.clipsContent = true

    node.fills = [{ type: 'SOLID', color: FALLBACK_BG, opacity: 1 }]
    bindFill(node, collection, TOKEN_BG, FALLBACK_BG)

    // Prepend (nav icon placeholder)
    const prependSlot = figma.createRectangle()
    prependSlot.name = 'prependSlot'
    prependSlot.resize(24, 24)
    prependSlot.fills = [{ type: 'SOLID', color: FALLBACK_FG, opacity: 0.7 }]

    // Title
    const titleNode = figma.createText()
    titleNode.name = 'title'
    titleNode.characters = 'Page Title'
    titleNode.fontSize = variant === 'prominent' ? 22 : 18
    titleNode.fontName = { family: 'Inter', style: variant === 'prominent' ? 'Medium' : 'Regular' }
    titleNode.textAutoResize = 'WIDTH_AND_HEIGHT'
    titleNode.fills = [{ type: 'SOLID', color: FALLBACK_FG, opacity: 1 }]
    bindFill(titleNode, collection, TOKEN_COLOR, FALLBACK_FG)

    // Actions placeholder (row of icon buttons)
    const actionsSlot = figma.createFrame()
    actionsSlot.name = 'actionsSlot'
    actionsSlot.layoutMode = 'HORIZONTAL'
    actionsSlot.primaryAxisSizingMode = 'AUTO'
    actionsSlot.counterAxisSizingMode = 'AUTO'
    actionsSlot.itemSpacing = 8
    actionsSlot.fills = []

    for (let i = 0; i < 3; i++) {
      const iconRect = figma.createRectangle()
      iconRect.name = `actionIcon${i + 1}`
      iconRect.resize(24, 24)
      iconRect.fills = [{ type: 'SOLID', color: FALLBACK_FG, opacity: 0.7 }]
      actionsSlot.appendChild(iconRect)
    }

    // Append (overflow slot)
    const appendSlot = figma.createRectangle()
    appendSlot.name = 'appendSlot'
    appendSlot.resize(24, 24)
    appendSlot.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }]

    node.appendChild(prependSlot)
    node.appendChild(titleNode)
    node.appendChild(actionsSlot)
    node.appendChild(appendSlot)
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

function buildVariantSpecs(): ToolbarVariantSpec[] {
  const specs: ToolbarVariantSpec[] = []

  // Anchor
  specs.push({ variant: 'default', density: 'default' })

  // Row A — variant tour (non-default variants, default density)
  for (const variant of ['dense', 'prominent']) {
    specs.push({ variant, density: 'default' })
  }

  // Row B — density tour (default variant, non-default densities)
  for (const density of ['compact', 'comfortable']) {
    specs.push({ variant: 'default', density })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildToolbar(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Toolbar',
  )

  const set = createComponentSet('Origam/Toolbar', variantNodes, targetPage)

  addBooleanProperty(set, 'flat',          false)
  addBooleanProperty(set, 'floating',      false)
  addBooleanProperty(set, 'withExtension', false)

  addTextProperty(set, 'title', 'Page Title')

  addInstanceSwapProperty(set, 'prependSlot')
  addInstanceSwapProperty(set, 'actionsSlot')
  addInstanceSwapProperty(set, 'appendSlot')

  set.layoutMode = 'VERTICAL'
  set.primaryAxisSizingMode = 'AUTO'
  set.counterAxisSizingMode = 'AUTO'
  set.itemSpacing = 16
  set.paddingTop = 16
  set.paddingRight = 16
  set.paddingBottom = 16
  set.paddingLeft = 16

  figma.notify('[Origam] Toolbar component set created (5 variants).', { timeout: 2000 })

  return set
}
