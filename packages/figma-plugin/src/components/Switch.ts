/**
 * Switch.ts — Figma component builder for `Origam/Switch`.
 *
 * ─── REDUCED MATRIX RATIONALE ───────────────────────────────────────────────
 *
 * Full Cartesian of (3 variants × 3 sizes × 4 intents × 3 values) = 108.
 * We apply the reduced-matrix pattern:
 *
 *   Row A — variant tour : (default|inset|flat) × md × primary × on    → 3
 *   Row B — size tour    : default × (sm|lg) × primary × on            → 2 addl
 *   Row C — intent tour  : default × md × (success|warning|danger) × on → 3 addl
 *   Row D — value tour   : default × md × primary × (off|indeterminate) → 2 addl
 *   Total: 3 + 2 + 3 + 2 = 10 frames
 *
 * Decision on `value`:
 *   3 values (off|on|indeterminate) are exposed as a Variant axis rather than
 *   a Boolean. Rationale: they produce DISTINCT visual states (track bg, thumb
 *   position, aria-checked="mixed"). A Boolean `value` would conflate off/indeterminate.
 *   10 frames stays well under the 15-frame limit.
 *
 * Component Properties:
 *   Boolean : disabled
 *
 * Visual structure per frame:
 *   [track (pill) + thumb (circle inside)] [label text]
 *   Thumb position: left (off/indeterminate), right (on).
 *
 * Token bindings: switch.track.background-color* + switch.thumb.background-color*.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ensureTextStyle } from '../lib/styles'
import {
  createComponent,
  createComponentSet,
  addBooleanProperty,
  bindFill,
  progressEvery,
} from './_shared'

export interface BuildOpts {
  targetPage: PageNode
  collection: VariableCollection
  onProgress?: (current: number, total: number) => void
}

// ---------------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------------

interface SizeFallbacks {
  trackWidth: number
  trackHeight: number
  thumbSize: number
  fontSize: number
  gap: number
}

const SIZE_FALLBACKS: Record<string, SizeFallbacks> = {
  sm: { trackWidth: 36, trackHeight: 20, thumbSize: 16, fontSize: 12, gap: 6  },
  md: { trackWidth: 44, trackHeight: 24, thumbSize: 20, fontSize: 14, gap: 8  },
  lg: { trackWidth: 52, trackHeight: 28, thumbSize: 24, fontSize: 16, gap: 10 },
}

const INTENT_TRACK_ON: Record<string, { r: number; g: number; b: number }> = {
  primary: { r: 0.11, g: 0.42, b: 0.96 },
  success: { r: 0.13, g: 0.70, b: 0.39 },
  warning: { r: 0.96, g: 0.62, b: 0.10 },
  danger:  { r: 0.89, g: 0.19, b: 0.22 },
}

const TRACK_OFF_COLOR  = { r: 0.74, g: 0.74, b: 0.74 }
const THUMB_ON_COLOR   = { r: 1,    g: 1,    b: 1    }
const THUMB_OFF_COLOR  = { r: 1,    g: 1,    b: 1    }
const LABEL_DEFAULT    = { r: 0.13, g: 0.13, b: 0.13 }

// ---------------------------------------------------------------------------
// Variant spec
// ---------------------------------------------------------------------------

type SwitchValue = 'off' | 'on' | 'indeterminate'

interface VariantSpec {
  variant: string
  size: string
  intent: string
  value: SwitchValue
}

function buildVariantSpecs(): VariantSpec[] {
  const specs: VariantSpec[] = []

  // Row A — variant tour (all variants, md, primary, on)
  for (const variant of ['default', 'inset', 'flat']) {
    specs.push({ variant, size: 'md', intent: 'primary', value: 'on' })
  }

  // Row B — size tour (default, sm + lg, primary, on)
  for (const size of ['sm', 'lg']) {
    specs.push({ variant: 'default', size, intent: 'primary', value: 'on' })
  }

  // Row C — intent tour (default, md, non-primary intents, on)
  for (const intent of ['success', 'warning', 'danger']) {
    specs.push({ variant: 'default', size: 'md', intent, value: 'on' })
  }

  // Row D — value tour (default, md, primary, off + indeterminate)
  for (const value of ['off', 'indeterminate'] as SwitchValue[]) {
    specs.push({ variant: 'default', size: 'md', intent: 'primary', value })
  }

  return specs
}

// ---------------------------------------------------------------------------
// Internal variant builder
// ---------------------------------------------------------------------------

async function buildVariantComponent(
  spec: VariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { variant, size, intent, value } = spec
  const fb = SIZE_FALLBACKS[size] ?? SIZE_FALLBACKS.md
  const isOn = value === 'on'
  const isIndeterminate = value === 'indeterminate'

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
  } catch {
    figma.notify('[Origam] Switch: Could not load Inter font.', { error: false })
  }

  ensureTextStyle('Origam/Body/MD', {
    fontSize: 14,
    fontName: { family: 'Inter', style: 'Regular' },
    lineHeight: { unit: 'AUTO' },
    letterSpacing: { unit: 'PERCENT', value: 0 },
  })

  const componentName = `variant=${variant}, size=${size}, intent=${intent}, value=${value}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'HORIZONTAL'
    node.primaryAxisSizingMode = 'AUTO'
    node.counterAxisSizingMode = 'AUTO'
    node.primaryAxisAlignItems = 'CENTER'
    node.counterAxisAlignItems = 'CENTER'
    node.itemSpacing = fb.gap
    node.paddingLeft = 0
    node.paddingRight = 0
    node.paddingTop = 4
    node.paddingBottom = 4
    node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
    node.strokes = []

    // ── Track ─────────────────────────────────────────────────────────────
    const track = figma.createFrame()
    track.name = 'switchTrack'
    track.layoutMode = 'HORIZONTAL'
    track.primaryAxisSizingMode = 'FIXED'
    track.counterAxisSizingMode = 'FIXED'
    track.resize(fb.trackWidth, fb.trackHeight)
    track.cornerRadius = fb.trackHeight / 2 // pill shape
    track.clipsContent = true
    track.primaryAxisAlignItems = isOn ? 'MAX' : 'MIN'
    track.counterAxisAlignItems = 'CENTER'
    track.paddingLeft = 2
    track.paddingRight = 2
    track.paddingTop = 2
    track.paddingBottom = 2
    track.itemSpacing = 0

    // Track background — switches by intent and value
    const trackOnColor = INTENT_TRACK_ON[intent] ?? INTENT_TRACK_ON.primary
    const trackBgColor = isOn ? trackOnColor : TRACK_OFF_COLOR
    track.fills = [{ type: 'SOLID', color: trackBgColor, opacity: 1 }]

    if (isOn) {
      bindFill(track, collection, 'switch.track.background-color-checked', trackOnColor)
    } else {
      bindFill(track, collection, 'switch.track.background-color', TRACK_OFF_COLOR)
    }

    // Variant-specific visual tweaks (inset: border; flat: no shadow)
    if (variant === 'inset') {
      track.strokes = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 0.3 }]
      track.strokeWeight = 1
      track.strokeAlign = 'INSIDE'
    } else {
      track.strokes = []
    }

    // ── Thumb ─────────────────────────────────────────────────────────────
    const thumb = figma.createEllipse()
    thumb.name = 'switchThumb'
    thumb.resize(fb.thumbSize, fb.thumbSize)
    // EllipseNode.fills is typed as readonly in plugin-typings — cast required.
    ;(thumb as unknown as { fills: SolidPaint[] }).fills = [{ type: 'SOLID', color: isOn ? THUMB_ON_COLOR : THUMB_OFF_COLOR, opacity: 1 }]
    bindFill(
      thumb,
      collection,
      isOn ? 'switch.thumb.background-color-checked' : 'switch.thumb.background-color',
      isOn ? THUMB_ON_COLOR : THUMB_OFF_COLOR,
    )
    ;(thumb as unknown as { strokes: Paint[] }).strokes = []

    // Indeterminate: thumb centered — we can't truly center in auto-layout
    // without a spacer trick; set justifyContent to CENTER for that case.
    if (isIndeterminate) {
      track.primaryAxisAlignItems = 'CENTER'
    }

    track.appendChild(thumb)
    node.appendChild(track)

    // ── Label ─────────────────────────────────────────────────────────────
    const labelNode = figma.createText()
    labelNode.name = 'label'
    labelNode.characters = 'Label'
    labelNode.fontSize = fb.fontSize
    labelNode.textAutoResize = 'WIDTH_AND_HEIGHT'
    labelNode.fills = [{ type: 'SOLID', color: LABEL_DEFAULT, opacity: 1 }]
    bindFill(labelNode, collection, 'switch.label.color', LABEL_DEFAULT)

    node.appendChild(labelNode)
  })
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildSwitch(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Switch',
  )

  const set = createComponentSet('Origam/Switch', variantNodes, targetPage)

  // ── Component Properties ──────────────────────────────────────────────────
  addBooleanProperty(set, 'disabled', false)

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

  figma.notify('[Origam] Switch component set created (10 variants).', { timeout: 2000 })

  return set
}
