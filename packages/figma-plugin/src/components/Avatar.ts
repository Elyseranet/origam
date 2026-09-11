/**
 * Avatar.ts — Figma component builder for `Origam/Avatar`.
 *
 * ─── REDUCED MATRIX RATIONALE ────────────────────────────────────────────────
 *
 * Full Cartesian: (3 shapes × 5 sizes × 4 kinds) = 60 frames — too many.
 *
 * Anchor: circle / md / initials
 *
 *   Row A — shape tour : (square|rounded) × md × initials                → 2 (circle/md in anchor)
 *   Row B — size tour  : circle × (xs|sm|lg|xl) × initials               → 4 (md in anchor)
 *   Row C — kind tour  : circle × md × (image|icon|placeholder)          → 3 (initials in anchor)
 *   Anchor itself      :                                                   → 1
 *
 * Total: 1 + 2 + 4 + 3 = 10 variant frames.
 *
 * Component Properties (apply to ALL variants):
 *   Boolean      : withBadge
 *   Text         : initials (default "AB")
 *   InstanceSwap : imageSlot, iconSlot, badgeSlot
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

const TOKEN_BG    = 'avatar.background-color'
const TOKEN_COLOR = 'avatar.color'

const SIZE_PX: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
}

const SHAPE_RADIUS: Record<string, number> = {
  circle:  999,
  square:  0,
  rounded: 8,
}

const KIND_FALLBACK_BG: Record<string, { r: number; g: number; b: number }> = {
  initials:    { r: 0.55, g: 0.55, b: 0.90 },
  image:       { r: 0.80, g: 0.80, b: 0.80 },
  icon:        { r: 0.70, g: 0.70, b: 0.80 },
  placeholder: { r: 0.88, g: 0.88, b: 0.88 },
}

// ---------------------------------------------------------------------------
// Variant builder
// ---------------------------------------------------------------------------

interface AvatarVariantSpec {
  shape: string
  size:  string
  kind:  string
}

async function buildVariantComponent(
  spec: AvatarVariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { shape, size, kind } = spec
  const sizePx = SIZE_PX[size] ?? 40
  const radius = SHAPE_RADIUS[shape] ?? 999

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    ensureTextStyle('Origam/Label/SM', {
      fontSize: 12,
      fontName: { family: 'Inter', style: 'Medium' },
      lineHeight: { unit: 'AUTO' },
      letterSpacing: { unit: 'PERCENT', value: 5 },
    })
  } catch {
    figma.notify('[Origam] Could not load Inter.', { error: false })
  }

  const componentName = `shape=${shape}, size=${size}, kind=${kind}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'NONE'
    node.resize(sizePx, sizePx)
    node.cornerRadius = radius
    node.clipsContent = true

    const fallbackBg = KIND_FALLBACK_BG[kind] ?? { r: 0.88, g: 0.88, b: 0.88 }
    node.fills = [{ type: 'SOLID', color: fallbackBg, opacity: 1 }]
    bindFill(node, collection, TOKEN_BG, fallbackBg)

    if (kind === 'initials') {
      const initials = figma.createText()
      initials.name = 'initials'
      initials.characters = 'AB'
      initials.fontSize = Math.max(10, Math.floor(sizePx * 0.35))
      initials.textAutoResize = 'WIDTH_AND_HEIGHT'
      initials.textAlignHorizontal = 'CENTER'
      initials.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }]
      bindFill(initials, collection, TOKEN_COLOR, { r: 1, g: 1, b: 1 })
      // Rough center
      initials.x = sizePx * 0.2
      initials.y = sizePx * 0.3
      node.appendChild(initials)
    } else {
      // Image, icon or placeholder — use a rectangle slot
      const slot = figma.createRectangle()
      slot.name = `${kind}Slot`
      slot.resize(sizePx, sizePx)
      slot.fills = [{ type: 'SOLID', color: fallbackBg, opacity: kind === 'image' ? 0.8 : 0.4 }]
      node.appendChild(slot)
    }
  })
}

// ---------------------------------------------------------------------------
// Reduced matrix definition
// ---------------------------------------------------------------------------

function buildVariantSpecs(): AvatarVariantSpec[] {
  const specs: AvatarVariantSpec[] = []

  // Anchor
  specs.push({ shape: 'circle', size: 'md', kind: 'initials' })

  // Row A — shape tour (non-circle, md, initials)
  for (const shape of ['square', 'rounded']) {
    specs.push({ shape, size: 'md', kind: 'initials' })
  }

  // Row B — size tour (circle, non-md, initials)
  for (const size of ['xs', 'sm', 'lg', 'xl']) {
    specs.push({ shape: 'circle', size, kind: 'initials' })
  }

  // Row C — kind tour (circle, md, non-initials)
  for (const kind of ['image', 'icon', 'placeholder']) {
    specs.push({ shape: 'circle', size: 'md', kind })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildAvatar(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Avatar',
  )

  const set = createComponentSet('Origam/Avatar', variantNodes, targetPage)

  addBooleanProperty(set, 'withBadge', false)

  addTextProperty(set, 'initials', 'AB')

  addInstanceSwapProperty(set, 'imageSlot')
  addInstanceSwapProperty(set, 'iconSlot')
  addInstanceSwapProperty(set, 'badgeSlot')

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

  figma.notify('[Origam] Avatar component set created (10 variants).', { timeout: 2000 })

  return set
}
