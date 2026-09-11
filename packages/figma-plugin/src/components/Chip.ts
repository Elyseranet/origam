/**
 * Chip.ts — Figma component builder for `Origam/Chip`.
 *
 * ─── REDUCED MATRIX RATIONALE ────────────────────────────────────────────────
 *
 * Full Cartesian: (6 intents × 3 variants × 3 sizes) = 54 frames — too many.
 *
 * Reduced rows (de-dup shared anchor primary/filled/md):
 *   Row A — intent tour  : (neutral|primary|success|warning|danger|info) × filled × md  → 6
 *   Row B — variant tour : primary × (tonal|outlined) × md                              → 2 (filled/md in Row A)
 *   Row C — size tour    : primary × filled × (sm|lg)                                   → 2 (md in Row A)
 *
 * Total: 6 + 2 + 2 = 10 variant frames.
 *
 * Component Properties (apply to ALL variants):
 *   Boolean      : closable, selected, disabled, withAvatar, withIcon
 *   Text         : label (default "Chip")
 *   InstanceSwap : avatarSlot, iconSlot
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

const TOKEN_BASE_BG     = 'chip.background-color'
const TOKEN_BASE_COLOR  = 'chip.color'
const TOKEN_BORDER      = 'chip.outlined.border-color'

function bgToken(intent: string): string {
  const intentMap: Record<string, boolean> = {
    success: true, warning: true, danger: true, info: true,
  }
  return intentMap[intent] ? `chip.${intent}.background-color` : TOKEN_BASE_BG
}

function fgToken(intent: string): string {
  const intentMap: Record<string, boolean> = {
    success: true, warning: true, danger: true, info: true,
  }
  return intentMap[intent] ? `chip.${intent}.color` : TOKEN_BASE_COLOR
}

// Fallback colours per intent
const INTENT_FALLBACK_BG: Record<string, { r: number; g: number; b: number }> = {
  neutral: { r: 0.88, g: 0.88, b: 0.88 },
  primary: { r: 0.11, g: 0.42, b: 0.96 },
  success: { r: 0.88, g: 0.97, b: 0.91 },
  warning: { r: 1.00, g: 0.95, b: 0.84 },
  danger:  { r: 0.98, g: 0.88, b: 0.88 },
  info:    { r: 0.85, g: 0.95, b: 1.00 },
}

// Fallback height per size
const SIZE_HEIGHT: Record<string, number> = {
  sm: 24,
  md: 32,
  lg: 40,
}

const SIZE_PADDING: Record<string, number> = {
  sm: 8,
  md: 12,
  lg: 16,
}

// ---------------------------------------------------------------------------
// Variant builder
// ---------------------------------------------------------------------------

interface ChipVariantSpec {
  intent:  string
  variant: string
  size:    string
}

async function buildVariantComponent(
  spec: ChipVariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { intent, variant, size } = spec
  const height  = SIZE_HEIGHT[size]  ?? 32
  const padding = SIZE_PADDING[size] ?? 12

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    ensureTextStyle('Origam/Body/SM', {
      fontSize: 12,
      fontName: { family: 'Inter', style: 'Regular' },
      lineHeight: { unit: 'AUTO' },
      letterSpacing: { unit: 'PERCENT', value: 0 },
    })
  } catch {
    figma.notify('[Origam] Could not load Inter.', { error: false })
  }

  const componentName = `intent=${intent}, variant=${variant}, size=${size}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'HORIZONTAL'
    node.primaryAxisSizingMode = 'AUTO'
    node.counterAxisSizingMode = 'FIXED'
    node.resize(node.width, height)
    node.primaryAxisAlignItems = 'CENTER'
    node.counterAxisAlignItems = 'CENTER'
    node.itemSpacing = 4
    node.paddingLeft  = padding
    node.paddingRight = padding
    node.paddingTop   = 0
    node.paddingBottom = 0
    node.cornerRadius = 999
    node.clipsContent = true

    const fallbackBg = INTENT_FALLBACK_BG[intent] ?? { r: 0.88, g: 0.88, b: 0.88 }

    if (variant === 'outlined') {
      node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
      node.strokes = [{ type: 'SOLID', color: fallbackBg, opacity: 1 }]
      node.strokeWeight = 1
      node.strokeAlign = 'INSIDE'
      bindStroke(node, collection, TOKEN_BORDER, fallbackBg)
    } else if (variant === 'tonal') {
      node.fills = [{ type: 'SOLID', color: fallbackBg, opacity: 0.4 }]
      bindFill(node, collection, bgToken(intent), fallbackBg)
      node.strokes = []
    } else {
      // filled
      node.fills = [{ type: 'SOLID', color: fallbackBg, opacity: 1 }]
      bindFill(node, collection, bgToken(intent), fallbackBg)
      node.strokes = []
    }

    const label = figma.createText()
    label.name = 'label'
    label.characters = 'Chip'
    label.fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12
    label.textAutoResize = 'WIDTH_AND_HEIGHT'
    const fgFallback = { r: variant === 'outlined' ? fallbackBg.r : 1, g: variant === 'outlined' ? fallbackBg.g : 1, b: variant === 'outlined' ? fallbackBg.b : 1 }
    label.fills = [{ type: 'SOLID', color: fgFallback, opacity: 1 }]
    bindFill(label, collection, fgToken(intent), fgFallback)

    node.appendChild(label)
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

function buildVariantSpecs(): ChipVariantSpec[] {
  const specs: ChipVariantSpec[] = []

  // Row A — intent tour (all intents, filled, md)
  for (const intent of ['neutral', 'primary', 'success', 'warning', 'danger', 'info']) {
    specs.push({ intent, variant: 'filled', size: 'md' })
  }

  // Row B — variant tour (primary, non-filled variants, md)
  for (const variant of ['tonal', 'outlined']) {
    specs.push({ intent: 'primary', variant, size: 'md' })
  }

  // Row C — size tour (primary, filled, non-md sizes)
  for (const size of ['sm', 'lg']) {
    specs.push({ intent: 'primary', variant: 'filled', size })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildChip(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Chip',
  )

  const set = createComponentSet('Origam/Chip', variantNodes, targetPage)

  addBooleanProperty(set, 'closable',   false)
  addBooleanProperty(set, 'selected',   false)
  addBooleanProperty(set, 'disabled',   false)
  addBooleanProperty(set, 'withAvatar', false)
  addBooleanProperty(set, 'withIcon',   false)

  addTextProperty(set, 'label', 'Chip')

  addInstanceSwapProperty(set, 'avatarSlot')
  addInstanceSwapProperty(set, 'iconSlot')

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

  figma.notify('[Origam] Chip component set created (10 variants).', { timeout: 2000 })

  return set
}
