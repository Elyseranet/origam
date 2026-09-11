/**
 * Dialog.ts — Figma component builder for `Origam/Dialog`.
 *
 * ─── REDUCED MATRIX RATIONALE ────────────────────────────────────────────────
 *
 * Full Cartesian: (5 sizes × 3 variants) = 15 frames.
 *
 * Anchor: md / default
 *
 *   Row A — size tour    : (sm|lg|xl|fullscreen) × default                → 4 (md in anchor)
 *   Row B — variant tour : md × (confirmation|fullscreen)                 → 2 (default in anchor)
 *   Anchor               :                                                  → 1
 *
 * Total: 1 + 4 + 2 = 7 variant frames.
 *
 * Component Properties (apply to ALL variants):
 *   Boolean      : withIcon, persistent, scrollable
 *   Text         : title (default "Dialog title"), body (default "Dialog body content")
 *   InstanceSwap : iconSlot, bodySlot, actionsSlot
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

const TOKEN_BG     = 'dialog.background'
const TOKEN_COLOR  = 'dialog.color'
const TOKEN_RADIUS = 'dialog.border-radius'

const FALLBACK_BG: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 }
const FALLBACK_FG: { r: number; g: number; b: number } = { r: 0.1, g: 0.1, b: 0.1 }

// Dialog width per size
const SIZE_WIDTH: Record<string, number> = {
  sm:         360,
  md:         480,
  lg:         600,
  xl:         840,
  fullscreen: 800,
}

// ---------------------------------------------------------------------------
// Variant builder
// ---------------------------------------------------------------------------

interface DialogVariantSpec {
  size:    string
  variant: string
}

async function buildVariantComponent(
  spec: DialogVariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { size, variant } = spec
  const width = SIZE_WIDTH[size] ?? 480
  const isFullscreen = size === 'fullscreen' || variant === 'fullscreen'

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

  const componentName = `size=${size}, variant=${variant}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'VERTICAL'
    node.primaryAxisSizingMode = 'AUTO'
    node.counterAxisSizingMode = 'FIXED'
    node.resize(width, node.height)
    node.primaryAxisAlignItems = 'MIN'
    node.counterAxisAlignItems = 'MIN'
    node.itemSpacing = 0
    node.cornerRadius = isFullscreen ? 0 : 8
    node.clipsContent = true

    node.fills = [{ type: 'SOLID', color: FALLBACK_BG, opacity: 1 }]
    bindFill(node, collection, TOKEN_BG, FALLBACK_BG)

    if (!isFullscreen) {
      bindFill(node, collection, TOKEN_RADIUS, FALLBACK_BG) // corner radius would need bindCornerRadius; skip — handled via fallback
    }

    // ── Header ─────────────────────────────────────────────────────────────
    const header = figma.createFrame()
    header.name = 'header'
    header.layoutMode = 'HORIZONTAL'
    header.primaryAxisSizingMode = 'FIXED'
    header.counterAxisSizingMode = 'AUTO'
    header.resize(width, header.height)
    header.primaryAxisAlignItems = 'CENTER'
    header.counterAxisAlignItems = 'CENTER'
    header.itemSpacing = 12
    header.paddingLeft  = 24
    header.paddingRight = 24
    header.paddingTop   = 16
    header.paddingBottom = 16
    header.fills = []
    header.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 }, opacity: 1 }]
    header.strokeWeight = 1
    header.strokeAlign = 'INSIDE'
    header.strokes = [] // border only on bottom — Figma doesn't support individual side strokes on frame natively; omit

    const titleNode = figma.createText()
    titleNode.name = 'title'
    titleNode.characters = 'Dialog title'
    titleNode.fontSize = 18
    titleNode.fontName = { family: 'Inter', style: 'Medium' }
    titleNode.textAutoResize = 'WIDTH_AND_HEIGHT'
    titleNode.fills = [{ type: 'SOLID', color: FALLBACK_FG, opacity: 1 }]
    bindFill(titleNode, collection, TOKEN_COLOR, FALLBACK_FG)

    // Icon placeholder in header
    const iconSlot = figma.createRectangle()
    iconSlot.name = 'iconSlot'
    iconSlot.resize(24, 24)
    iconSlot.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }]

    header.appendChild(iconSlot)
    header.appendChild(titleNode)

    // ── Body ───────────────────────────────────────────────────────────────
    const bodyFrame = figma.createFrame()
    bodyFrame.name = 'bodySlot'
    bodyFrame.layoutMode = 'VERTICAL'
    bodyFrame.primaryAxisSizingMode = 'AUTO'
    bodyFrame.counterAxisSizingMode = 'FIXED'
    bodyFrame.resize(width, bodyFrame.height)
    bodyFrame.paddingLeft  = 24
    bodyFrame.paddingRight = 24
    bodyFrame.paddingTop   = 16
    bodyFrame.paddingBottom = 16
    bodyFrame.fills = []

    const bodyText = figma.createText()
    bodyText.name = 'body'
    bodyText.characters = 'Dialog body content goes here. It can span multiple lines as needed.'
    bodyText.fontSize = 14
    bodyText.fontName = { family: 'Inter', style: 'Regular' }
    bodyText.textAutoResize = 'HEIGHT'
    bodyText.resize(width - 48, bodyText.height)
    bodyText.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 }, opacity: 1 }]

    bodyFrame.appendChild(bodyText)

    // ── Actions ────────────────────────────────────────────────────────────
    const actionsFrame = figma.createFrame()
    actionsFrame.name = 'actionsSlot'
    actionsFrame.layoutMode = 'HORIZONTAL'
    actionsFrame.primaryAxisSizingMode = 'FIXED'
    actionsFrame.counterAxisSizingMode = 'AUTO'
    actionsFrame.resize(width, actionsFrame.height)
    actionsFrame.primaryAxisAlignItems = 'MAX'
    actionsFrame.counterAxisAlignItems = 'CENTER'
    actionsFrame.itemSpacing = 8
    actionsFrame.paddingLeft  = 24
    actionsFrame.paddingRight = 24
    actionsFrame.paddingTop   = 16
    actionsFrame.paddingBottom = 16
    actionsFrame.fills = []

    const cancelRect = figma.createRectangle()
    cancelRect.name = 'cancelAction'
    cancelRect.resize(80, 36)
    cancelRect.cornerRadius = 4
    cancelRect.fills = [{ type: 'SOLID', color: { r: 0.88, g: 0.88, b: 0.88 }, opacity: 1 }]

    const confirmRect = figma.createRectangle()
    confirmRect.name = 'confirmAction'
    confirmRect.resize(80, 36)
    confirmRect.cornerRadius = 4
    confirmRect.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.42, b: 0.96 }, opacity: 1 }]

    actionsFrame.appendChild(cancelRect)
    actionsFrame.appendChild(confirmRect)

    node.appendChild(header)
    node.appendChild(bodyFrame)
    node.appendChild(actionsFrame)
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

function buildVariantSpecs(): DialogVariantSpec[] {
  const specs: DialogVariantSpec[] = []

  // Anchor
  specs.push({ size: 'md', variant: 'default' })

  // Row A — size tour (non-md, default)
  for (const size of ['sm', 'lg', 'xl', 'fullscreen']) {
    specs.push({ size, variant: 'default' })
  }

  // Row B — variant tour (md, non-default)
  for (const variant of ['confirmation', 'fullscreen']) {
    specs.push({ size: 'md', variant })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildDialog(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Dialog',
  )

  const set = createComponentSet('Origam/Dialog', variantNodes, targetPage)

  addBooleanProperty(set, 'withIcon',   false)
  addBooleanProperty(set, 'persistent', false)
  addBooleanProperty(set, 'scrollable', false)

  addTextProperty(set, 'title', 'Dialog title')
  addTextProperty(set, 'body',  'Dialog body content')

  addInstanceSwapProperty(set, 'iconSlot')
  addInstanceSwapProperty(set, 'bodySlot')
  addInstanceSwapProperty(set, 'actionsSlot')

  set.layoutMode = 'HORIZONTAL'
  set.primaryAxisSizingMode = 'AUTO'
  set.counterAxisSizingMode = 'AUTO'
  set.itemSpacing = 24
  set.paddingTop = 24
  set.paddingRight = 24
  set.paddingBottom = 24
  set.paddingLeft = 24
  set.layoutWrap = 'WRAP'
  set.counterAxisSpacing = 24

  figma.notify('[Origam] Dialog component set created (7 variants).', { timeout: 2000 })

  return set
}
