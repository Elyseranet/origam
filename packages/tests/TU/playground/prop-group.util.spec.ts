// Pins the playground lot 2 inspector's prop classification + per-side fold
// mechanism against REAL prop-name lists captured from the runtime metadata
// extractor (`pnpm -F @origam/playground meta:runtime`, `origam` @ develop
// `5835fa025`) — not hand-invented fixtures. `OrigamBtn` (106 props) and
// `OrigamSelect` (161 — the catalogue's largest prop surface, per the lot's
// own PR) are the two components the PR cites measured counts for.
//
// The classification data (`PROP_GROUP_EXACT` / `PROP_GROUP_PREFIX`) is a
// deliberate duplicate of `packages/marketing/src/consts/theme-builder-
// groups.const.ts`'s own table, reproduced here rather than imported — see
// `types/Commons/prop-group.type.ts`'s header for why (marketing is a HOST
// of `@origam/playground`; importing from it would invert the dependency).
// This spec is therefore also the parity check: if the two tables drift,
// the counts below (independently matching marketing's own validated
// numbers for `origam-btn`) are what would catch it.

import { describe, expect, it } from 'vitest'

import { classifyPropGroup, groupAndFoldProps } from '../../../playground/src/utils/Commons/prop-group.util'
import type { IPropDefinition } from '../../../playground/src/interfaces/Catalog/prop-definition.interface'
import { CONTROL_KIND } from '../../../playground/src/enums/Commons/control-kind.enum'
import { METADATA_SOURCE } from '../../../playground/src/enums/Commons/metadata-source.enum'

const toPropDefinitions = (names: string[]): IPropDefinition[] => names.map(name => ({
    name,
    label: name,
    tsType: null,
    runtimeType: null,
    required: false,
    hasFactoryDefault: false,
    control: CONTROL_KIND.TEXT,
    source: METADATA_SOURCE.RUNTIME
}))

// Captured verbatim from `.metadata/runtime.json` (`OrigamBtn.props` keys),
// `origam` @ develop `5835fa025` — 106 entries, `class` / `style` included
// (attribute pass-throughs, both land in `other`).
const BTN_PROP_NAMES = ['flat', 'icon', 'block', 'slim', 'stacked', 'text', 'status', 'statusIconPosition', 'id', 'class', 'style', 'color', 'bgColor', 'border', 'borderTop', 'borderLeft', 'borderBottom', 'borderRight', 'borderBlock', 'borderInline', 'borderInlineStart', 'borderInlineEnd', 'borderBlockStart', 'borderBlockEnd', 'borderColor', 'borderStyle', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderInlineStartColor', 'borderInlineEndColor', 'borderBlockStartColor', 'borderBlockEndColor', 'density', 'height', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'width', 'elevation', 'rounded', 'roundedTopRight', 'roundedTopLeft', 'roundedBottomLeft', 'roundedBottomRight', 'roundedStartStart', 'roundedStartEnd', 'roundedEndStart', 'roundedEndEnd', 'tag', 'size', 'href', 'replace', 'to', 'exact', 'ripple', 'loading', 'loadingText', 'position', 'top', 'bottom', 'left', 'right', 'location', 'value', 'disabled', 'selectedClass', 'padding', 'paddingTop', 'paddingLeft', 'paddingBottom', 'paddingRight', 'paddingBlock', 'paddingInline', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBlockStart', 'paddingBlockEnd', 'margin', 'marginTop', 'marginLeft', 'marginBottom', 'marginRight', 'marginBlock', 'marginInline', 'marginInlineStart', 'marginInlineEnd', 'marginBlockStart', 'marginBlockEnd', 'appendAvatar', 'appendIcon', 'prependAvatar', 'prependIcon', 'prependAriaLabel', 'appendAriaLabel', 'hover', 'hoverClass', 'active', 'activeClass', 'variant', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']

// Captured the same way, `OrigamSelect.props` keys — 161 entries, the
// catalogue's largest prop surface.
const SELECT_PROP_NAMES = ['chips', 'closableChips', 'hideNoData', 'hideSelected', 'listProps', 'menu', 'menuIcon', 'menuProps', 'chipProps', 'multiple', 'noDataText', 'openOnClear', 'autocomplete', 'autoSelectFirst', 'clearOnSelect', 'divider', 'search', 'closeText', 'openText', 'id', 'class', 'style', 'color', 'bgColor', 'autofocus', 'counter', 'counterValue', 'placeholder', 'persistentPlaceholder', 'persistentCounter', 'role', 'type', 'modelModifiers', 'mask', 'density', 'centerAffix', 'dirty', 'disabled', 'error', 'inline', 'label', 'prefix', 'suffix', 'persistentClear', 'singleLine', 'required', 'loading', 'loadingText', 'tag', 'appendInnerAvatar', 'appendInnerIcon', 'prependInnerAvatar', 'prependInnerIcon', 'clearIcon', 'clearable', 'prependInnerAriaLabel', 'appendInnerAriaLabel', 'border', 'borderTop', 'borderLeft', 'borderBottom', 'borderRight', 'borderBlock', 'borderInline', 'borderInlineStart', 'borderInlineEnd', 'borderBlockStart', 'borderBlockEnd', 'borderColor', 'borderStyle', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderInlineStartColor', 'borderInlineEndColor', 'borderBlockStartColor', 'borderBlockEndColor', 'focused', 'text', 'floating', 'name', 'margin', 'marginTop', 'marginLeft', 'marginBottom', 'marginRight', 'marginBlock', 'marginInline', 'marginInlineStart', 'marginInlineEnd', 'marginBlockStart', 'marginBlockEnd', 'padding', 'paddingTop', 'paddingLeft', 'paddingBottom', 'paddingRight', 'paddingBlock', 'paddingInline', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBlockStart', 'paddingBlockEnd', 'rounded', 'roundedTopRight', 'roundedTopLeft', 'roundedBottomLeft', 'roundedBottomRight', 'roundedStartStart', 'roundedStartEnd', 'roundedEndStart', 'roundedEndEnd', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'active', 'activeClass', 'variant', 'elevation', 'size', 'hideDetails', 'hideSpinButtons', 'hint', 'persistentHint', 'messages', 'height', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'width', 'direction', 'errorMessages', 'maxErrors', 'readonly', 'rules', 'modelValue', 'validateOn', 'validationValue', 'appendAvatar', 'appendIcon', 'prependAvatar', 'prependIcon', 'prependAriaLabel', 'appendAriaLabel', 'items', 'itemTitle', 'itemValue', 'itemChildren', 'itemProps', 'returnObject', 'valueComparator', 'transition', 'customFilter', 'customKeyFilter', 'filterKeys', 'filterMode', 'noFilter', 'eager']

describe('classifyPropGroup', () => {
    it('classifies exact names', () => {
        expect(classifyPropGroup('variant')).toBe('color')
        expect(classifyPropGroup('density')).toBe('size')
        expect(classifyPropGroup('rounded')).toBe('shape')
        expect(classifyPropGroup('border')).toBe('border')
        expect(classifyPropGroup('elevation')).toBe('elevation')
        expect(classifyPropGroup('height')).toBe('dimension')
        expect(classifyPropGroup('padding')).toBe('spacing')
        expect(classifyPropGroup('disabled')).toBe('state')
        expect(classifyPropGroup('icon')).toBe('icon')
        expect(classifyPropGroup('href')).toBe('link')
        expect(classifyPropGroup('align')).toBe('layout')
    })

    it('falls back to "other" for an unknown name, never dropping it', () => {
        expect(classifyPropGroup('whateverThisIs')).toBe('other')
    })

    it('⛔ never folds top/right/bottom/left under position — they classify to "other", not "layout"', () => {
        // The fold table's own guard rule: `position` is `layout`, but its
        // CSS-inset-named siblings are NOT declared as its declinations in
        // `PROP_SIDE_FOLDS` — exactly because they classify differently.
        expect(classifyPropGroup('position')).toBe('layout')
        expect(classifyPropGroup('top')).toBe('other')
        expect(classifyPropGroup('right')).toBe('other')
        expect(classifyPropGroup('bottom')).toBe('other')
        expect(classifyPropGroup('left')).toBe('other')
    })
})

describe('groupAndFoldProps — OrigamBtn (106 real props)', () => {
    const groups = groupAndFoldProps(toPropDefinitions(BTN_PROP_NAMES))

    it('partitions every prop exactly once, matching the 12 non-empty groups the PR measured', () => {
        const byId = Object.fromEntries(groups.map(g => [g.id, g.totalCount]))

        expect(byId).toEqual({
            color: 4, size: 2, shape: 9, border: 21, elevation: 2, dimension: 6,
            spacing: 22, state: 7, icon: 4, link: 3, layout: 2, other: 24
        })
        expect(groups.map(g => g.id)).not.toContain('content')
        expect(groups.reduce((sum, g) => sum + g.totalCount, 0)).toBe(BTN_PROP_NAMES.length)
    })

    it('folds exactly the 6 roots (border/rounded/padding/margin/height/width), 54 rows at rest / 52 folded', () => {
        const restingRows = groups.reduce((sum, g) => sum + g.rows.length, 0)
        const foldedCount = groups.reduce((sum, g) => sum + g.foldedCount, 0)
        const foldRoots = groups.flatMap(g => g.rows.filter(r => r.fold).map(r => r.definition.name)).sort()

        expect(restingRows).toBe(54)
        expect(foldedCount).toBe(52)
        expect(restingRows + foldedCount).toBe(BTN_PROP_NAMES.length)
        expect(foldRoots).toEqual(['border', 'height', 'margin', 'padding', 'rounded', 'width'])
    })

    it('never folds top/right/bottom/left — they stay flat rows inside "other"', () => {
        const other = groups.find(g => g.id === 'other')!
        const otherRowNames = other.rows.map(r => r.definition.name)

        expect(otherRowNames).toEqual(expect.arrayContaining(['top', 'right', 'bottom', 'left']))
        expect(other.rows.find(r => r.fold)).toBeUndefined()
    })

    it('the border fold carries exactly its 20 declinations across 5 labelled axes', () => {
        const border = groups.find(g => g.id === 'border')!
        const row = border.rows.find(r => r.definition.name === 'border')!

        expect(row.fold!.definitions).toHaveLength(20)
        expect(row.fold!.axes.map(a => a.label)).toEqual([
            'Largeur — côtés physiques',
            'Largeur — axes et côtés logiques',
            'Trait',
            'Couleur — côtés physiques',
            'Couleur — côtés logiques'
        ])
    })
})

describe('groupAndFoldProps — OrigamSelect (161 real props, the catalogue\'s largest)', () => {
    const groups = groupAndFoldProps(toPropDefinitions(SELECT_PROP_NAMES))

    it('partitions all 161 props, folds the same 52 declinations as Btn (same 6 roots)', () => {
        const restingRows = groups.reduce((sum, g) => sum + g.rows.length, 0)
        const foldedCount = groups.reduce((sum, g) => sum + g.foldedCount, 0)

        expect(groups.reduce((sum, g) => sum + g.totalCount, 0)).toBe(SELECT_PROP_NAMES.length)
        expect(restingRows).toBe(109)
        expect(foldedCount).toBe(52)
        expect(restingRows + foldedCount).toBe(SELECT_PROP_NAMES.length)
    })
})

describe('groupAndFoldProps — edge cases', () => {
    it('an empty prop list yields zero groups', () => {
        expect(groupAndFoldProps([])).toEqual([])
    })

    it('a root with none of its declinations present renders as a plain row, no fold', () => {
        const groups = groupAndFoldProps(toPropDefinitions(['rounded']))
        const shape = groups.find(g => g.id === 'shape')!

        expect(shape.rows).toHaveLength(1)
        expect(shape.rows[0].fold).toBeUndefined()
        expect(shape.foldedCount).toBe(0)
    })
})
