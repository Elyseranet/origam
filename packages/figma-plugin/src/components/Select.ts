/**
 * Select.ts — Figma component builder for `Origam/Select`.
 *
 * ─── REDUCED MATRIX RATIONALE ───────────────────────────────────────────────
 *
 * Select inherits TextField chrome. Extra visual axis: `open` state (shows
 * dropdown menu below the field).
 *
 *   Row A — variant tour   : (filled|outlined|underlined) × md × default        → 3
 *   Row B — size tour      : outlined × (sm|lg) × default                        → 2
 *   Row C — state tour     : outlined × md × (focus|error|disabled)              → 3
 *   Row D — open state     : outlined × md × open (with dropdown placeholder)    → 1
 *   Total: 3 + 2 + 3 + 1 = 9 frames
 *
 * Pragmatic open-state approach: `open` is a Variant axis with values
 * closed|open rather than a Boolean, so designers can switch it in the panel
 * without hunting a property. This adds 1 frame to each spec where it varies
 * visually (only the outlined/md/default row gets an open twin).
 *
 * Component Properties:
 *   Boolean  : multiple, chips, clearable, searchable, loading
 *   Text     : label ("Label"), placeholder ("Select…"), helper ("")
 *   InstanceSwap: iconChevronSlot
 *
 * Dropdown menu placeholder: a separate auto-layout frame (200×120) with 3
 * placeholder item rows, appended as a child below the field. Its fill is
 * bound to `select.list.background-color` when available.
 *
 * Source: src/components/Select/OrigamSelect.vue (1185 lines — props only consulted).
 * Token: tokens/component/select.json.
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
  sm: { height: 40, paddingInline: 10, fontSize: 12, labelFontSize: 10 },
  md: { height: 48, paddingInline: 12, fontSize: 14, labelFontSize: 12 },
  lg: { height: 56, paddingInline: 14, fontSize: 16, labelFontSize: 14 },
}

const STATE_BG_FALLBACKS: Record<string, { r: number; g: number; b: number; a: number }> = {
  default:  { r: 0.96, g: 0.96, b: 0.96, a: 1 },
  focus:    { r: 0.92, g: 0.92, b: 0.97, a: 1 },
  error:    { r: 0.99, g: 0.93, b: 0.93, a: 1 },
  disabled: { r: 0.93, g: 0.93, b: 0.93, a: 0.5 },
  open:     { r: 0.92, g: 0.92, b: 0.97, a: 1 },
}

const BORDER_FALLBACK       = { r: 0.74, g: 0.74, b: 0.74 }
const BORDER_FOCUS_FALLBACK = { r: 0.11, g: 0.42, b: 0.96 }
const BORDER_ERROR_FALLBACK = { r: 0.89, g: 0.19, b: 0.22 }
const MENU_BG_FALLBACK      = { r: 1,    g: 1,    b: 1    }
const CHEVRON_FALLBACK      = { r: 0.46, g: 0.46, b: 0.46 }
const ITEM_TEXT_FALLBACK    = { r: 0.13, g: 0.13, b: 0.13 }

// ---------------------------------------------------------------------------
// Variant spec
// ---------------------------------------------------------------------------

interface VariantSpec {
  variant: string
  size: string
  state: string
  open: boolean
}

function buildVariantSpecs(): VariantSpec[] {
  const specs: VariantSpec[] = []

  // Row A — variant tour (all variants, md, default, closed)
  for (const variant of ['filled', 'outlined', 'underlined']) {
    specs.push({ variant, size: 'md', state: 'default', open: false })
  }

  // Row B — size tour (outlined, sm + lg, default, closed)
  for (const size of ['sm', 'lg']) {
    specs.push({ variant: 'outlined', size, state: 'default', open: false })
  }

  // Row C — state tour (outlined, md, focus + error + disabled, closed)
  for (const state of ['focus', 'error', 'disabled']) {
    specs.push({ variant: 'outlined', size: 'md', state, open: false })
  }

  // Row D — open state (outlined, md, default, open)
  specs.push({ variant: 'outlined', size: 'md', state: 'open', open: true })

  return specs
}

// ---------------------------------------------------------------------------
// Dropdown menu placeholder
// ---------------------------------------------------------------------------

function buildDropdownMenu(collection: VariableCollection): FrameNode {
  const menu = figma.createFrame()
  menu.name = 'dropdownMenu'
  menu.layoutMode = 'VERTICAL'
  menu.primaryAxisSizingMode = 'FIXED'
  menu.counterAxisSizingMode = 'FIXED'
  menu.resize(280, 120)
  menu.primaryAxisAlignItems = 'MIN'
  menu.counterAxisAlignItems = 'MIN'
  menu.itemSpacing = 0
  menu.paddingTop = 4
  menu.paddingBottom = 4
  menu.paddingLeft = 0
  menu.paddingRight = 0
  menu.cornerRadius = 4
  menu.fills = [{ type: 'SOLID', color: MENU_BG_FALLBACK, opacity: 1 }]
  bindFill(menu, collection, 'select.list.background-color', MENU_BG_FALLBACK)

  const itemLabels = ['Option 1', 'Option 2', 'Option 3']
  for (const label of itemLabels) {
    const row = figma.createFrame()
    row.name = `item_${label}`
    row.layoutMode = 'HORIZONTAL'
    row.primaryAxisSizingMode = 'FIXED'
    row.counterAxisSizingMode = 'FIXED'
    row.resize(280, 36)
    row.primaryAxisAlignItems = 'CENTER'
    row.counterAxisAlignItems = 'CENTER'
    row.paddingLeft = 16
    row.paddingRight = 16
    row.paddingTop = 8
    row.paddingBottom = 8
    row.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]

    const itemText = figma.createText()
    itemText.name = 'itemLabel'
    itemText.characters = label
    itemText.fontSize = 14
    itemText.textAutoResize = 'WIDTH_AND_HEIGHT'
    itemText.fills = [{ type: 'SOLID', color: ITEM_TEXT_FALLBACK, opacity: 1 }]
    bindFill(itemText, collection, 'select.item.color', ITEM_TEXT_FALLBACK)
    row.appendChild(itemText)

    menu.appendChild(row)
  }

  return menu
}

// ---------------------------------------------------------------------------
// Internal variant builder
// ---------------------------------------------------------------------------

async function buildVariantComponent(
  spec: VariantSpec,
  collection: VariableCollection,
): Promise<ComponentNode> {
  const { variant, size, state, open } = spec
  const fb = SIZE_FALLBACKS[size] ?? SIZE_FALLBACKS.md
  const bgFallback = STATE_BG_FALLBACKS[state] ?? STATE_BG_FALLBACKS.default
  const isOutlined = variant === 'outlined'
  const isUnderlined = variant === 'underlined'
  const isError = state === 'error'
  const isFocus = state === 'focus' || open
  const isDisabled = state === 'disabled'

  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
  } catch {
    figma.notify('[Origam] Select: Could not load Inter font.', { error: false })
  }

  ensureTextStyle('Origam/Body/MD', {
    fontSize: 14,
    fontName: { family: 'Inter', style: 'Regular' },
    lineHeight: { unit: 'AUTO' },
    letterSpacing: { unit: 'PERCENT', value: 0 },
  })

  // Encode open as a variant dimension
  const componentName = `variant=${variant}, size=${size}, state=${state}, open=${open}`

  return createComponent(componentName, (node) => {
    // Outer wrapper — field + optional dropdown stacked vertically
    node.layoutMode = 'VERTICAL'
    node.primaryAxisSizingMode = 'AUTO'
    node.counterAxisSizingMode = 'FIXED'
    node.resize(280, fb.height + 20)
    node.primaryAxisAlignItems = 'MIN'
    node.counterAxisAlignItems = 'MIN'
    node.itemSpacing = 2
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
      node.strokes = [{ type: 'SOLID', color: borderFallback, opacity: 1 }]
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

    // Input row
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

    // Value text
    const valueText = figma.createText()
    valueText.name = 'selectedValue'
    valueText.characters = 'Select…'
    valueText.fontSize = fb.fontSize
    valueText.textAutoResize = 'WIDTH_AND_HEIGHT'
    valueText.layoutGrow = 1
    valueText.fills = [{ type: 'SOLID', color: { r: 0.62, g: 0.62, b: 0.62 }, opacity: 1 }]
    bindFill(valueText, collection, 'color.text.placeholder', { r: 0.62, g: 0.62, b: 0.62 })
    inputRow.appendChild(valueText)

    // Chevron icon placeholder
    const chevron = figma.createRectangle()
    chevron.name = 'iconChevronSlot'
    chevron.resize(20, 20)
    chevron.fills = [{ type: 'SOLID', color: CHEVRON_FALLBACK, opacity: 0.6 }]
    bindFill(chevron, collection, 'select.chevron.color', CHEVRON_FALLBACK)
    inputRow.appendChild(chevron)

    node.appendChild(inputRow)

    // Dropdown menu — visible only in open state
    if (open) {
      const menu = buildDropdownMenu(collection)
      node.appendChild(menu)
    }
  })
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function buildSelect(opts: BuildOpts): Promise<ComponentSetNode> {
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
    'Select',
  )

  const set = createComponentSet('Origam/Select', variantNodes, targetPage)

  // ── Component Properties ──────────────────────────────────────────────────
  addBooleanProperty(set, 'multiple',   false)
  addBooleanProperty(set, 'chips',      false)
  addBooleanProperty(set, 'clearable',  false)
  addBooleanProperty(set, 'searchable', false)
  addBooleanProperty(set, 'loading',    false)

  addTextProperty(set, 'label',       'Label')
  addTextProperty(set, 'placeholder', 'Select…')
  addTextProperty(set, 'helper',      '')

  addInstanceSwapProperty(set, 'iconChevronSlot')

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

  figma.notify('[Origam] Select component set created (9 variants).', { timeout: 2000 })

  return set
}
