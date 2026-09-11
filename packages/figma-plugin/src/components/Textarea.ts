/**
 * Textarea.ts — Figma component builder for `Origam/Textarea`.
 *
 * ─── REDUCED MATRIX RATIONALE ───────────────────────────────────────────────
 *
 * Extends TextField shape. Same variant/size/state axes:
 *   Row A — variant tour   : (filled|outlined|underlined) × md × default → 3
 *   Row B — size tour      : outlined × (sm|lg) × default                → 2
 *   Row C — state tour     : outlined × md × (focus|error|disabled)      → 3
 *   Total: 3 + 2 + 3 = 8 frames
 *
 * Textarea-specific differences vs TextField:
 *   - Multi-line body (taller frame, ~80px default instead of 48px).
 *   - Boolean `autoGrow`, `noResize`.
 *   - Text property `rows` (default "3" — Figma doesn't support numeric props).
 *   - Resize grip indicator at bottom-right when noResize=false.
 *
 * tokens: textarea-field.json covers textarea/grip opacity tokens only;
 * visual surface tokens come from semantic layer.
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

export interface BuildOpts {
  targetPage: PageNode
  collection: VariableCollection
  onProgress?: (current: number, total: number) => void
}

// ---------------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------------

interface SizeFallbacks {
  height: number
  paddingInline: number
  fontSize: number
  labelFontSize: number
}

const SIZE_FALLBACKS: Record<string, SizeFallbacks> = {
  sm: { height: 72,  paddingInline: 10, fontSize: 12, labelFontSize: 10 },
  md: { height: 96,  paddingInline: 12, fontSize: 14, labelFontSize: 12 },
  lg: { height: 120, paddingInline: 14, fontSize: 16, labelFontSize: 14 },
}

const STATE_BG_FALLBACKS: Record<string, { r: number; g: number; b: number; a: number }> = {
  default:  { r: 0.96, g: 0.96, b: 0.96, a: 1 },
  focus:    { r: 0.92, g: 0.92, b: 0.97, a: 1 },
  error:    { r: 0.99, g: 0.93, b: 0.93, a: 1 },
  disabled: { r: 0.93, g: 0.93, b: 0.93, a: 0.5 },
}

const BORDER_FALLBACK = { r: 0.74, g: 0.74, b: 0.74 }
const BORDER_FOCUS_FALLBACK = { r: 0.11, g: 0.42, b: 0.96 }
const BORDER_ERROR_FALLBACK = { r: 0.89, g: 0.19, b: 0.22 }

// ---------------------------------------------------------------------------
// Variant spec
// ---------------------------------------------------------------------------

interface VariantSpec {
  variant: string
  size: string
  state: string
}

function buildVariantSpecs(): VariantSpec[] {
  const specs: VariantSpec[] = []

  // Row A — variant tour
  for (const variant of ['filled', 'outlined', 'underlined']) {
    specs.push({ variant, size: 'md', state: 'default' })
  }

  // Row B — size tour (outlined, sm + lg)
  for (const size of ['sm', 'lg']) {
    specs.push({ variant: 'outlined', size, state: 'default' })
  }

  // Row C — state tour (outlined, md, focus + error + disabled)
  for (const state of ['focus', 'error', 'disabled']) {
    specs.push({ variant: 'outlined', size: 'md', state })
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
  const { variant, size, state } = spec
  const fb = SIZE_FALLBACKS[size] ?? SIZE_FALLBACKS.md
  const bgFallback = STATE_BG_FALLBACKS[state] ?? STATE_BG_FALLBACKS.default
  const isOutlined = variant === 'outlined'
  const isUnderlined = variant === 'underlined'
  const isError = state === 'error'
  const isFocus = state === 'focus'
  const isDisabled = state === 'disabled'

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
  } catch {
    figma.notify('[Origam] Textarea: Could not load Inter font.', { error: false })
  }

  ensureTextStyle('Origam/Body/MD', {
    fontSize: 14,
    fontName: { family: 'Inter', style: 'Regular' },
    lineHeight: { unit: 'AUTO' },
    letterSpacing: { unit: 'PERCENT', value: 0 },
  })

  const componentName = `variant=${variant}, size=${size}, state=${state}`

  return createComponent(componentName, (node) => {
    node.layoutMode = 'VERTICAL'
    node.primaryAxisSizingMode = 'FIXED'
    node.counterAxisSizingMode = 'FIXED'
    node.resize(280, fb.height + 24)
    node.primaryAxisAlignItems = 'MIN'
    node.counterAxisAlignItems = 'MIN'
    node.itemSpacing = 4
    node.paddingLeft = 0
    node.paddingRight = 0
    node.paddingTop = 0
    node.paddingBottom = 0
    node.cornerRadius = isUnderlined ? 0 : 4
    node.clipsContent = false

    // Background
    if (isOutlined || isUnderlined) {
      node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
    } else {
      node.fills = [{
        type: 'SOLID',
        color: { r: bgFallback.r, g: bgFallback.g, b: bgFallback.b },
        opacity: bgFallback.a,
      }]
    }

    // Stroke
    const borderFallback = isError
      ? BORDER_ERROR_FALLBACK
      : isFocus
        ? BORDER_FOCUS_FALLBACK
        : BORDER_FALLBACK

    if (isOutlined || isUnderlined) {
      const strokePaint: SolidPaint = { type: 'SOLID', color: borderFallback, opacity: 1 }
      node.strokes = [strokePaint]
      node.strokeWeight = isFocus ? 2 : 1
      node.strokeAlign = 'INSIDE'
      const strokeToken = isError
        ? 'color.feedback.danger.border'
        : isFocus
          ? 'color.border.focus'
          : 'color.border.default'
      bindStroke(node, collection, strokeToken, borderFallback)
    } else {
      node.strokes = []
    }

    if (isDisabled) {
      node.opacity = 0.5
    }

    // Floating label
    const floatingLabel = figma.createText()
    floatingLabel.name = 'floatingLabel'
    floatingLabel.characters = 'Label'
    floatingLabel.fontSize = fb.labelFontSize
    floatingLabel.textAutoResize = 'WIDTH_AND_HEIGHT'
    floatingLabel.fills = [{
      type: 'SOLID',
      color: isError ? BORDER_ERROR_FALLBACK : { r: 0.46, g: 0.46, b: 0.46 },
      opacity: 1,
    }]
    node.appendChild(floatingLabel)

    // Textarea body area
    const bodyArea = figma.createFrame()
    bodyArea.name = 'textareaBody'
    bodyArea.layoutMode = 'VERTICAL'
    bodyArea.primaryAxisSizingMode = 'FIXED'
    bodyArea.counterAxisSizingMode = 'FIXED'
    bodyArea.resize(280, fb.height)
    bodyArea.primaryAxisAlignItems = 'MIN'
    bodyArea.counterAxisAlignItems = 'MIN'
    bodyArea.paddingLeft = fb.paddingInline
    bodyArea.paddingRight = fb.paddingInline
    bodyArea.paddingTop = 8
    bodyArea.paddingBottom = 8
    bodyArea.fills = []
    bodyArea.strokes = []
    bodyArea.itemSpacing = 0

    const valueText = figma.createText()
    valueText.name = 'textareaContent'
    valueText.characters = 'Textarea content...'
    valueText.fontSize = fb.fontSize
    valueText.textAutoResize = 'WIDTH_AND_HEIGHT'
    valueText.fills = [{ type: 'SOLID', color: { r: 0.62, g: 0.62, b: 0.62 }, opacity: 1 }]
    bindFill(valueText, collection, 'color.text.placeholder', { r: 0.62, g: 0.62, b: 0.62 })
    bodyArea.appendChild(valueText)

    // Resize grip (bottom-right indicator) — represented as a small rect
    const grip = figma.createRectangle()
    grip.name = 'resizeGrip'
    grip.resize(9, 9)
    // Position it at bottom-right corner (absolute)
    grip.fills = [{ type: 'SOLID', color: { r: 0.74, g: 0.74, b: 0.74 }, opacity: 0.26 }]
    // We bind grip border-color token as the grip fill color approximation
    bindFill(grip, collection, 'color.border.subtle', { r: 0.74, g: 0.74, b: 0.74, a: 0.26 })
    bodyArea.appendChild(grip)

    node.appendChild(bodyArea)

    // Helper text
    const helperText = figma.createText()
    helperText.name = 'helperText'
    helperText.characters = isError ? 'Error message' : 'Helper text'
    helperText.fontSize = 11
    helperText.textAutoResize = 'WIDTH_AND_HEIGHT'
    helperText.fills = [{
      type: 'SOLID',
      color: isError ? BORDER_ERROR_FALLBACK : { r: 0.46, g: 0.46, b: 0.46 },
      opacity: 1,
    }]
    node.appendChild(helperText)
  })
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildTextarea(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Textarea',
  )

  const set = createComponentSet('Origam/Textarea', variantNodes, targetPage)

  // ── Component Properties ──────────────────────────────────────────────────
  // Inherited from TextField
  addBooleanProperty(set, 'prependIcon',      false)
  addBooleanProperty(set, 'appendIcon',       false)
  addBooleanProperty(set, 'prependInnerIcon', false)
  addBooleanProperty(set, 'appendInnerIcon',  false)
  addBooleanProperty(set, 'clearable',        false)
  addBooleanProperty(set, 'loading',          false)
  addBooleanProperty(set, 'floatingLabel',    true)

  // Textarea-specific
  addBooleanProperty(set, 'autoGrow',  false)
  addBooleanProperty(set, 'noResize',  false)

  addTextProperty(set, 'label',        'Label')
  addTextProperty(set, 'placeholder',  'Placeholder')
  addTextProperty(set, 'helper',       '')
  addTextProperty(set, 'errorMessage', '')
  addTextProperty(set, 'rows',         '3') // Figma has no numeric component property

  addInstanceSwapProperty(set, 'iconPrependSlot')
  addInstanceSwapProperty(set, 'iconAppendSlot')
  addInstanceSwapProperty(set, 'iconPrependInnerSlot')
  addInstanceSwapProperty(set, 'iconAppendInnerSlot')

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

  figma.notify('[Origam] Textarea component set created (8 variants).', { timeout: 2000 })

  return set
}
