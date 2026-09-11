/**
 * Alert.ts — Figma component builder for `Origam/Alert`.
 *
 * ─── REDUCED MATRIX RATIONALE ────────────────────────────────────────────────
 *
 * Full Cartesian: (5 intents × 3 variants) = 15 frames.
 *
 * Anchor: info / tonal
 *
 *   Row A — intent tour  : (success|warning|danger|neutral) × tonal       → 4 (info/tonal in anchor)
 *   Row B — variant tour : info × (filled|outlined)                        → 2 (tonal in anchor)
 *   Anchor               :                                                  → 1
 *
 * Total: 1 + 4 + 2 = 7 variant frames.
 *
 * Component Properties (apply to ALL variants):
 *   Boolean      : closable, withIcon, withActions
 *   Text         : title (default "Alert title"), message (default "Alert message")
 *   InstanceSwap : iconSlot, actionsSlot
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
  progressEvery,
} from './_shared'
import type { BuildOpts } from './Btn'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

// Intent-specific bg/fg tokens in alert.json (tonal path = bgSubtle / fgSubtle)
function bgToken(intent: string, variant: string): string {
  if (intent === 'neutral') return 'alert.background-color'
  const key = variant === 'filled' ? 'bg' : 'bg-subtle'
  return `alert.${intent}.${key}`
}

function fgToken(intent: string, variant: string): string {
  if (intent === 'neutral') return 'alert.color'
  const key = variant === 'filled' ? 'fg' : 'fg-subtle'
  return `alert.${intent}.${key}`
}

function borderToken(intent: string): string {
  if (intent === 'neutral') return 'alert.border-color'
  return `alert.${intent}.border`
}

// Fallback colours per intent
const INTENT_FALLBACK_BG: Record<string, { r: number; g: number; b: number }> = {
  info:    { r: 0.85, g: 0.95, b: 1.00 },
  success: { r: 0.88, g: 0.97, b: 0.91 },
  warning: { r: 1.00, g: 0.95, b: 0.84 },
  danger:  { r: 0.98, g: 0.88, b: 0.88 },
  neutral: { r: 0.95, g: 0.95, b: 0.95 },
}

const INTENT_FALLBACK_FG: Record<string, { r: number; g: number; b: number }> = {
  info:    { r: 0.05, g: 0.35, b: 0.80 },
  success: { r: 0.05, g: 0.55, b: 0.25 },
  warning: { r: 0.70, g: 0.40, b: 0.00 },
  danger:  { r: 0.75, g: 0.10, b: 0.10 },
  neutral: { r: 0.20, g: 0.20, b: 0.20 },
}

// ---------------------------------------------------------------------------
// Variant builder
// ---------------------------------------------------------------------------

interface AlertVariantSpec {
  intent:  string
  variant: string
}

async function buildVariantComponent(
  spec: AlertVariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { intent, variant } = spec

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
    figma.notify('[Origam] Could not load Inter.', { error: false })
  }

  const componentName = `intent=${intent}, variant=${variant}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'HORIZONTAL'
    node.primaryAxisSizingMode = 'FIXED'
    node.counterAxisSizingMode = 'AUTO'
    node.resize(480, node.height)
    node.primaryAxisAlignItems = 'MIN'
    node.counterAxisAlignItems = 'CENTER'
    node.itemSpacing = 16
    node.paddingLeft  = 16
    node.paddingRight = 16
    node.paddingTop   = 16
    node.paddingBottom = 16
    node.cornerRadius = 4
    node.clipsContent = true

    const fallbackBg = INTENT_FALLBACK_BG[intent] ?? { r: 0.95, g: 0.95, b: 0.95 }
    const fallbackFg = INTENT_FALLBACK_FG[intent] ?? { r: 0.2, g: 0.2, b: 0.2 }

    if (variant === 'filled') {
      node.fills = [{ type: 'SOLID', color: INTENT_FALLBACK_FG[intent] ?? fallbackBg, opacity: 1 }]
      bindFill(node, collection, bgToken(intent, 'filled'), fallbackFg)
      node.strokes = []
    } else if (variant === 'outlined') {
      node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
      node.strokes = [{ type: 'SOLID', color: fallbackFg, opacity: 1 }]
      node.strokeWeight = 1
      node.strokeAlign = 'INSIDE'
      bindStroke(node, collection, borderToken(intent), fallbackFg)
    } else {
      // tonal (default)
      node.fills = [{ type: 'SOLID', color: fallbackBg, opacity: 1 }]
      bindFill(node, collection, bgToken(intent, 'tonal'), fallbackBg)
      node.strokes = []
    }

    // Icon placeholder
    const iconSlot = figma.createRectangle()
    iconSlot.name = 'iconSlot'
    iconSlot.resize(20, 20)
    iconSlot.fills = [{ type: 'SOLID', color: fallbackFg, opacity: 0.8 }]

    // Content column
    const content = figma.createFrame()
    content.name = 'content'
    content.layoutMode = 'VERTICAL'
    content.primaryAxisSizingMode = 'AUTO'
    content.counterAxisSizingMode = 'AUTO'
    content.itemSpacing = 4
    content.fills = []

    const titleNode = figma.createText()
    titleNode.name = 'title'
    titleNode.characters = 'Alert title'
    titleNode.fontSize = 14
    titleNode.fontName = { family: 'Inter', style: 'Medium' }
    titleNode.textAutoResize = 'WIDTH_AND_HEIGHT'
    titleNode.fills = [{ type: 'SOLID', color: fallbackFg, opacity: 1 }]
    bindFill(titleNode, collection, fgToken(intent, variant), fallbackFg)

    const messageNode = figma.createText()
    messageNode.name = 'message'
    messageNode.characters = 'Alert message describing the situation.'
    messageNode.fontSize = 14
    messageNode.fontName = { family: 'Inter', style: 'Regular' }
    messageNode.textAutoResize = 'WIDTH_AND_HEIGHT'
    messageNode.fills = [{ type: 'SOLID', color: fallbackFg, opacity: 0.8 }]

    content.appendChild(titleNode)
    content.appendChild(messageNode)

    // Actions placeholder
    const actionsSlot = figma.createRectangle()
    actionsSlot.name = 'actionsSlot'
    actionsSlot.resize(80, 32)
    actionsSlot.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }]

    node.appendChild(iconSlot)
    node.appendChild(content)
    node.appendChild(actionsSlot)
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

function buildVariantSpecs(): AlertVariantSpec[] {
  const specs: AlertVariantSpec[] = []

  // Anchor
  specs.push({ intent: 'info', variant: 'tonal' })

  // Row A — intent tour (non-info intents, tonal)
  for (const intent of ['success', 'warning', 'danger', 'neutral']) {
    specs.push({ intent, variant: 'tonal' })
  }

  // Row B — variant tour (info, non-tonal variants)
  for (const variant of ['filled', 'outlined']) {
    specs.push({ intent: 'info', variant })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildAlert(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Alert',
  )

  const set = createComponentSet('Origam/Alert', variantNodes, targetPage)

  addBooleanProperty(set, 'closable',    false)
  addBooleanProperty(set, 'withIcon',    true)
  addBooleanProperty(set, 'withActions', false)

  addTextProperty(set, 'title',   'Alert title')
  addTextProperty(set, 'message', 'Alert message')

  addInstanceSwapProperty(set, 'iconSlot')
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

  figma.notify('[Origam] Alert component set created (7 variants).', { timeout: 2000 })

  return set
}
