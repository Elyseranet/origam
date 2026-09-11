/**
 * TextField.ts — Figma component builder for `Origam/TextField`.
 *
 * ─── REDUCED MATRIX RATIONALE ───────────────────────────────────────────────
 *
 * Full Cartesian of (3 variants × 3 sizes × 5 states) = 45 frames.
 * We keep only the combinations where STYLE differs structurally:
 *
 *   Row A — variant tour   : (filled|outlined|underlined) × md × default → 3
 *   Row B — size tour      : outlined × (sm|md|lg) × default              → 2 addl (md already in A)
 *   Row C — state tour     : outlined × md × (default|focus|error|disabled|readonly) → 4 addl
 *   Total: 3 + 2 + 4 = 9 frames (under the ~15 limit; state matters more than size)
 *
 * Component Properties (apply to ALL variants):
 *   Boolean  : prependIcon, appendIcon, prependInnerIcon, appendInnerIcon,
 *              clearable, loading, floatingLabel
 *   Text     : label ("Label"), placeholder ("Placeholder"), helper (""),
 *              errorMessage (""), prefix (""), suffix ("")
 *   InstanceSwap: iconPrependSlot, iconAppendSlot,
 *                 iconPrependInnerSlot, iconAppendInnerSlot
 *
 * Token coverage: text-field.json tokens are runtime/animation-only
 * (opacity, transition). Visual tokens come from the Field / Input primitives
 * in semantic tokens (surface, border). We bind the best available tokens.
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

// ---------------------------------------------------------------------------
// Public interface (mirrors BuildOpts from Btn.ts)
// ---------------------------------------------------------------------------

export interface BuildOpts {
  targetPage: PageNode
  collection: VariableCollection
  onProgress?: (current: number, total: number) => void
}

// ---------------------------------------------------------------------------
// Fallback values (Vue OrigamTextField / OrigamField defaults)
// ---------------------------------------------------------------------------

interface SizeFallbacks {
  height: number
  paddingInline: number
  fontSize: number
  labelFontSize: number
}

const SIZE_FALLBACKS: Record<string, SizeFallbacks> = {
  sm: { height: 40, paddingInline: 10, fontSize: 12, labelFontSize: 10 },
  md: { height: 48, paddingInline: 12, fontSize: 14, labelFontSize: 12 },
  lg: { height: 56, paddingInline: 14, fontSize: 16, labelFontSize: 14 },
}

const STATE_BG_FALLBACKS: Record<string, { r: number; g: number; b: number; a: number }> = {
  default:  { r: 0.96, g: 0.96, b: 0.96, a: 1 },
  focus:    { r: 0.92, g: 0.92, b: 0.97, a: 1 },
  error:    { r: 0.99, g: 0.93, b: 0.93, a: 1 },
  disabled: { r: 0.93, g: 0.93, b: 0.93, a: 0.5 },
  readonly: { r: 0.96, g: 0.96, b: 0.96, a: 1 },
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

  // Row A — variant tour (all variants, md, default)
  for (const variant of ['filled', 'outlined', 'underlined']) {
    specs.push({ variant, size: 'md', state: 'default' })
  }

  // Row B — size tour (outlined, sm + lg; md already in Row A)
  for (const size of ['sm', 'lg']) {
    specs.push({ variant: 'outlined', size, state: 'default' })
  }

  // Row C — state tour (outlined, md, focus + error + disabled + readonly)
  for (const state of ['focus', 'error', 'disabled', 'readonly']) {
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
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
  } catch {
    figma.notify('[Origam] TextField: Could not load Inter font.', { error: false })
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
    node.resize(280, fb.height + 20) // +20 for floating label area
    node.primaryAxisAlignItems = 'MIN'
    node.counterAxisAlignItems = 'MIN'
    node.itemSpacing = 4
    node.paddingLeft = 0
    node.paddingRight = 0
    node.paddingTop = 0
    node.paddingBottom = 0
    node.cornerRadius = isUnderlined ? 0 : 4
    node.clipsContent = false

    // ── Background fill ───────────────────────────────────────────────────
    const solidBg: SolidPaint = {
      type: 'SOLID',
      color: { r: bgFallback.r, g: bgFallback.g, b: bgFallback.b },
      opacity: bgFallback.a,
    }
    node.fills = [solidBg]

    if (isOutlined || isUnderlined) {
      node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
    }

    // ── Stroke ────────────────────────────────────────────────────────────
    const borderFallback = isError
      ? BORDER_ERROR_FALLBACK
      : isFocus
        ? BORDER_FOCUS_FALLBACK
        : BORDER_FALLBACK

    const strokePaint: SolidPaint = { type: 'SOLID', color: borderFallback, opacity: 1 }

    if (isOutlined) {
      node.strokes = [strokePaint]
      node.strokeWeight = isFocus ? 2 : 1
      node.strokeAlign = 'INSIDE'

      const strokeTokenName = isError
        ? 'color.feedback.danger.border'
        : isFocus
          ? 'color.border.focus'
          : 'color.border.default'
      bindStroke(node, collection, strokeTokenName, borderFallback)
    } else if (isUnderlined) {
      // Only bottom border — approximated as stroke on all sides, weight only visible at bottom
      node.strokes = [strokePaint]
      node.strokeWeight = isFocus ? 2 : 1
      node.strokeAlign = 'INSIDE'
    } else {
      node.strokes = []
    }

    if (isDisabled) {
      node.opacity = 0.5
    }

    // ── Floating label ────────────────────────────────────────────────────
    const floatingLabel = figma.createText()
    floatingLabel.name = 'floatingLabel'
    floatingLabel.characters = 'Label'
    floatingLabel.fontSize = fb.labelFontSize
    floatingLabel.textAutoResize = 'WIDTH_AND_HEIGHT'
    floatingLabel.fills = [{ type: 'SOLID', color: isError ? BORDER_ERROR_FALLBACK : { r: 0.46, g: 0.46, b: 0.46 }, opacity: 1 }]
    bindFill(
      floatingLabel,
      collection,
      isError ? 'color.feedback.danger.fgSubtle' : 'color.text.secondary',
      isError ? { ...BORDER_ERROR_FALLBACK } : { r: 0.46, g: 0.46, b: 0.46 },
    )
    node.appendChild(floatingLabel)

    // ── Input row ─────────────────────────────────────────────────────────
    const inputRow = figma.createFrame()
    inputRow.name = 'inputRow'
    inputRow.layoutMode = 'HORIZONTAL'
    inputRow.primaryAxisSizingMode = 'FIXED'
    inputRow.counterAxisSizingMode = 'FIXED'
    inputRow.resize(280, fb.height)
    inputRow.primaryAxisAlignItems = 'CENTER'
    inputRow.counterAxisAlignItems = 'CENTER'
    inputRow.itemSpacing = 8
    inputRow.paddingLeft = fb.paddingInline
    inputRow.paddingRight = fb.paddingInline
    inputRow.paddingTop = 0
    inputRow.paddingBottom = 0
    inputRow.fills = []
    inputRow.strokes = []

    // icon prepend inner placeholder
    const prependInnerSlot = figma.createRectangle()
    prependInnerSlot.name = 'iconPrependInnerSlot'
    prependInnerSlot.resize(20, 20)
    prependInnerSlot.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }]
    inputRow.appendChild(prependInnerSlot)

    // value text
    const valueText = figma.createText()
    valueText.name = 'placeholder'
    valueText.characters = 'Placeholder text'
    valueText.fontSize = fb.fontSize
    valueText.textAutoResize = 'WIDTH_AND_HEIGHT'
    valueText.layoutGrow = 1
    valueText.fills = [{ type: 'SOLID', color: { r: 0.62, g: 0.62, b: 0.62 }, opacity: 1 }]
    bindFill(valueText, collection, 'color.text.placeholder', { r: 0.62, g: 0.62, b: 0.62 })
    inputRow.appendChild(valueText)

    // icon append inner placeholder
    const appendInnerSlot = figma.createRectangle()
    appendInnerSlot.name = 'iconAppendInnerSlot'
    appendInnerSlot.resize(20, 20)
    appendInnerSlot.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }]
    inputRow.appendChild(appendInnerSlot)

    node.appendChild(inputRow)

    // ── Helper text ───────────────────────────────────────────────────────
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
    bindFill(
      helperText,
      collection,
      isError ? 'color.feedback.danger.fgSubtle' : 'color.text.secondary',
      isError ? { ...BORDER_ERROR_FALLBACK } : { r: 0.46, g: 0.46, b: 0.46 },
    )
    node.appendChild(helperText)
  })
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildTextField(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'TextField',
  )

  const set = createComponentSet('Origam/TextField', variantNodes, targetPage)

  // ── Component Properties ──────────────────────────────────────────────────
  addBooleanProperty(set, 'prependIcon',      false)
  addBooleanProperty(set, 'appendIcon',       false)
  addBooleanProperty(set, 'prependInnerIcon', false)
  addBooleanProperty(set, 'appendInnerIcon',  false)
  addBooleanProperty(set, 'clearable',        false)
  addBooleanProperty(set, 'loading',          false)
  addBooleanProperty(set, 'floatingLabel',    true)

  addTextProperty(set, 'label',        'Label')
  addTextProperty(set, 'placeholder',  'Placeholder')
  addTextProperty(set, 'helper',       '')
  addTextProperty(set, 'errorMessage', '')
  addTextProperty(set, 'prefix',       '')
  addTextProperty(set, 'suffix',       '')

  addInstanceSwapProperty(set, 'iconPrependSlot')
  addInstanceSwapProperty(set, 'iconAppendSlot')
  addInstanceSwapProperty(set, 'iconPrependInnerSlot')
  addInstanceSwapProperty(set, 'iconAppendInnerSlot')

  // Set auto-layout on the ComponentSet wrapper
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

  figma.notify('[Origam] TextField component set created (9 variants).', { timeout: 2000 })

  return set
}
