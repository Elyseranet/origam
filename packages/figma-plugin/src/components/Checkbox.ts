/**
 * Checkbox.ts — Figma component builder for `Origam/Checkbox`.
 *
 * ─── REDUCED MATRIX RATIONALE ───────────────────────────────────────────────
 *
 * Full Cartesian: size (sm|md|lg) × value (unchecked|checked|indeterminate) = 9.
 * This is already ≤15, so we ship all 9 as Variant frames — no deduplication.
 *
 *   3 sizes × 3 values = 9 frames.
 *
 * Component Properties (apply across all variants):
 *   Boolean : error, disabled
 *   Text    : label ("Label")
 *
 * Visual structure per frame:
 *   [checkbox box 20×20] [label text]
 *   The box is a rectangle with fill + stroke. The checkmark / dash is
 *   represented as a text node (✓ or —) inside the box.
 *
 * Token bindings: checkbox.input.background-color* + border-color* + icon.color*.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ensureTextStyle } from '../lib/styles'
import {
  createComponent,
  createComponentSet,
  addBooleanProperty,
  addTextProperty,
  bindFill,
  bindStroke,
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
  boxSize: number
  fontSize: number
  gap: number
}

const SIZE_FALLBACKS: Record<string, SizeFallbacks> = {
  sm: { boxSize: 16, fontSize: 12, gap: 6 },
  md: { boxSize: 20, fontSize: 14, gap: 8 },
  lg: { boxSize: 24, fontSize: 16, gap: 10 },
}

const BG_UNCHECKED    = { r: 1,    g: 1,    b: 1    }
const BG_CHECKED      = { r: 0.11, g: 0.42, b: 0.96 }
const BG_INTERMEDIATE = { r: 0.11, g: 0.42, b: 0.96 }
const BORDER_DEFAULT  = { r: 0.74, g: 0.74, b: 0.74 }
const BORDER_CHECKED  = { r: 0.11, g: 0.42, b: 0.96 }
const ICON_ON_COLOR   = { r: 1,    g: 1,    b: 1    }
const LABEL_DEFAULT   = { r: 0.13, g: 0.13, b: 0.13 }

// ---------------------------------------------------------------------------
// Variant spec
// ---------------------------------------------------------------------------

type CheckboxValue = 'unchecked' | 'checked' | 'indeterminate'

interface VariantSpec {
  size: string
  value: CheckboxValue
}

function buildVariantSpecs(): VariantSpec[] {
  const specs: VariantSpec[] = []
  for (const size of ['sm', 'md', 'lg']) {
    for (const value of ['unchecked', 'checked', 'indeterminate'] as CheckboxValue[]) {
      specs.push({ size, value })
    }
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
  const { size, value } = spec
  const fb = SIZE_FALLBACKS[size] ?? SIZE_FALLBACKS.md

  const isChecked      = value === 'checked'
  const isIndeterminate = value === 'indeterminate'
  const isOff          = value === 'unchecked'

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
  } catch {
    figma.notify('[Origam] Checkbox: Could not load Inter font.', { error: false })
  }

  ensureTextStyle('Origam/Body/MD', {
    fontSize: 14,
    fontName: { family: 'Inter', style: 'Regular' },
    lineHeight: { unit: 'AUTO' },
    letterSpacing: { unit: 'PERCENT', value: 0 },
  })

  const componentName = `size=${size}, value=${value}`

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

    // ── Checkbox box ──────────────────────────────────────────────────────
    const box = figma.createFrame()
    box.name = 'checkboxBox'
    box.layoutMode = 'HORIZONTAL'
    box.primaryAxisSizingMode = 'FIXED'
    box.counterAxisSizingMode = 'FIXED'
    box.resize(fb.boxSize, fb.boxSize)
    box.primaryAxisAlignItems = 'CENTER'
    box.counterAxisAlignItems = 'CENTER'
    box.cornerRadius = 3
    box.clipsContent = true
    box.itemSpacing = 0
    box.paddingLeft = 0
    box.paddingRight = 0
    box.paddingTop = 0
    box.paddingBottom = 0

    // Fill
    if (isChecked || isIndeterminate) {
      const bgColor = isChecked ? BG_CHECKED : BG_INTERMEDIATE
      box.fills = [{ type: 'SOLID', color: bgColor, opacity: 1 }]
      bindFill(
        box,
        collection,
        isChecked
          ? 'checkbox.input.background-color-checked'
          : 'checkbox.input.background-color-indeterminate',
        bgColor,
      )
    } else {
      box.fills = [{ type: 'SOLID', color: BG_UNCHECKED, opacity: 1 }]
      bindFill(box, collection, 'checkbox.input.background-color', BG_UNCHECKED)
    }

    // Stroke
    const borderColor = (isChecked || isIndeterminate) ? BORDER_CHECKED : BORDER_DEFAULT
    box.strokes = [{ type: 'SOLID', color: borderColor, opacity: 1 }]
    box.strokeWeight = 2
    box.strokeAlign = 'INSIDE'
    bindStroke(
      box,
      collection,
      (isChecked || isIndeterminate)
        ? 'checkbox.input.border-color-checked'
        : 'checkbox.input.border-color',
      borderColor,
    )

    // Checkmark / dash icon (text node)
    if (!isOff) {
      const icon = figma.createText()
      icon.name = 'checkIcon'
      icon.characters = isChecked ? '✓' : '—'
      icon.fontSize = Math.max(10, fb.boxSize - 6)
      icon.textAutoResize = 'WIDTH_AND_HEIGHT'
      icon.fills = [{ type: 'SOLID', color: ICON_ON_COLOR, opacity: 1 }]
      bindFill(icon, collection, 'checkbox.icon.color', ICON_ON_COLOR)
      box.appendChild(icon)
    }

    node.appendChild(box)

    // ── Label ─────────────────────────────────────────────────────────────
    const labelNode = figma.createText()
    labelNode.name = 'label'
    labelNode.characters = 'Label'
    labelNode.fontSize = fb.fontSize
    labelNode.textAutoResize = 'WIDTH_AND_HEIGHT'
    labelNode.fills = [{ type: 'SOLID', color: LABEL_DEFAULT, opacity: 1 }]
    bindFill(labelNode, collection, 'checkbox.label.color', LABEL_DEFAULT)

    node.appendChild(labelNode)
  })
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildCheckbox(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Checkbox',
  )

  const set = createComponentSet('Origam/Checkbox', variantNodes, targetPage)

  // ── Component Properties ──────────────────────────────────────────────────
  addBooleanProperty(set, 'error',    false)
  addBooleanProperty(set, 'disabled', false)

  addTextProperty(set, 'label', 'Label')

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

  figma.notify('[Origam] Checkbox component set created (9 variants).', { timeout: 2000 })

  return set
}
