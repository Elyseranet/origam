import type { IPropSideFoldAxis } from '../../interfaces/Commons/prop-side-fold.interface'
import type { TPropGroupId } from '../../types/Commons/prop-group.type'

/*********************************************************
 * PROP_GROUP_IDS
 *
 * @description
 * Display order of the 13 groups. Anchored on the DS Commons prop
 * interfaces, same taxonomy `packages/marketing/src/consts/theme-builder-groups.const.ts`
 * already validated (`classifyPropGroup` there) — reproduced here rather
 * than invented. Measured on `OrigamBtn` (106 props, develop @ `5835fa025`):
 * color 4 · size 2 · shape 9 · border 21 · elevation 2 · dimension 6 ·
 * spacing 22 · state 7 · icon 4 · link 3 · layout 2 · content 0 · other 24.
 * `content` is the one group Btn never fills — a host renders 12 groups for
 * it, not 13.
 ********************************************************/
export const PROP_GROUP_IDS: TPropGroupId[] = [
    'color', 'size', 'shape', 'border', 'elevation', 'dimension',
    'spacing', 'state', 'icon', 'link', 'layout', 'content', 'other'
]

/**
 * Exact prop-name → group map. See `PROP_GROUP_IDS` above for provenance.
 */
export const PROP_GROUP_EXACT: Record<string, TPropGroupId> = {
    color: 'color',
    accentColor: 'color',
    bgColor: 'color',
    backgroundColor: 'color',
    variant: 'color',
    size: 'size',
    density: 'size',
    rounded: 'shape',
    roundedTopRight: 'shape',
    roundedTopLeft: 'shape',
    roundedBottomLeft: 'shape',
    roundedBottomRight: 'shape',
    tile: 'shape',
    border: 'border',
    borderTop: 'border',
    borderLeft: 'border',
    borderBottom: 'border',
    borderRight: 'border',
    borderBlock: 'border',
    borderInline: 'border',
    borderColor: 'border',
    borderStyle: 'border',
    elevation: 'elevation',
    flat: 'elevation',
    height: 'dimension',
    maxHeight: 'dimension',
    maxWidth: 'dimension',
    minHeight: 'dimension',
    minWidth: 'dimension',
    width: 'dimension',
    aspectRatio: 'dimension',
    margin: 'spacing',
    marginTop: 'spacing',
    marginLeft: 'spacing',
    marginBottom: 'spacing',
    marginRight: 'spacing',
    marginBlock: 'spacing',
    marginInline: 'spacing',
    padding: 'spacing',
    paddingTop: 'spacing',
    paddingLeft: 'spacing',
    paddingBottom: 'spacing',
    paddingRight: 'spacing',
    paddingBlock: 'spacing',
    paddingInline: 'spacing',
    disabled: 'state',
    readonly: 'state',
    loading: 'state',
    active: 'state',
    selected: 'state',
    indeterminate: 'state',
    error: 'state',
    block: 'state',
    slim: 'state',
    stacked: 'state',
    ripple: 'state',
    icon: 'icon',
    prependIcon: 'icon',
    appendIcon: 'icon',
    prependInnerIcon: 'icon',
    appendInnerIcon: 'icon',
    closeIcon: 'icon',
    statusIcon: 'icon',
    statusIconPosition: 'icon',
    tag: 'link',
    href: 'link',
    to: 'link',
    target: 'link',
    align: 'layout',
    justify: 'layout',
    position: 'layout',
    location: 'layout',
    origin: 'layout',
    direction: 'layout',
    status: 'color',
    type: 'color'
}

/**
 * Prefix-based fallbacks for prop families not enumerated above (logical
 * declinations, responsive align/justify variants, min/max dimension…).
 */
export const PROP_GROUP_PREFIX: Array<{ prefix: string; group: TPropGroupId }> = [
    { prefix: 'rounded', group: 'shape' },
    { prefix: 'border', group: 'border' },
    { prefix: 'margin', group: 'spacing' },
    { prefix: 'padding', group: 'spacing' },
    { prefix: 'align', group: 'layout' },
    { prefix: 'justify', group: 'layout' },
    { prefix: 'min', group: 'dimension' },
    { prefix: 'max', group: 'dimension' }
]

/*********************************************************
 * PROP_SIDE_FOLDS
 *
 * @description
 * The per-side / per-corner collapse, orthogonal to the group taxonomy
 * above. Each ROOT prop (`border`, `rounded`, `padding`, `margin`, `height`,
 * `width`) folds a fixed set of its own declinations under one row.
 *
 * @description
 * ⛔ A fold must never cross a group boundary. `top` / `right` / `bottom` /
 * `left` classify to `other` (no root named `position` or `layout` owns
 * them), so they are NOT listed here under any root — folding them under
 * `position` (which IS `layout`) would silently move four props from
 * `other` into `layout`. `foldPropRowsForGroup` (prop-group.util.ts) asserts
 * this at runtime for every entry below: it throws rather than silently
 * drop a declination into the wrong group's row count.
 ********************************************************/
export const PROP_SIDE_FOLDS: Record<string, IPropSideFoldAxis[]> = {
    border: [
        { label: 'Largeur — côtés physiques', names: ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'] },
        {
            label: 'Largeur — axes et côtés logiques',
            names: ['borderBlock', 'borderInline', 'borderBlockStart', 'borderBlockEnd', 'borderInlineStart', 'borderInlineEnd']
        },
        { label: 'Trait', names: ['borderColor', 'borderStyle'] },
        {
            label: 'Couleur — côtés physiques',
            names: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor']
        },
        {
            label: 'Couleur — côtés logiques',
            names: ['borderBlockStartColor', 'borderBlockEndColor', 'borderInlineStartColor', 'borderInlineEndColor']
        }
    ],
    rounded: [
        { label: 'Coins physiques', names: ['roundedTopLeft', 'roundedTopRight', 'roundedBottomRight', 'roundedBottomLeft'] },
        { label: 'Coins logiques', names: ['roundedStartStart', 'roundedStartEnd', 'roundedEndStart', 'roundedEndEnd'] }
    ],
    padding: [
        { label: 'Côtés physiques', names: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] },
        {
            label: 'Axes et côtés logiques',
            names: ['paddingBlock', 'paddingInline', 'paddingBlockStart', 'paddingBlockEnd', 'paddingInlineStart', 'paddingInlineEnd']
        }
    ],
    margin: [
        { label: 'Côtés physiques', names: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] },
        {
            label: 'Axes et côtés logiques',
            names: ['marginBlock', 'marginInline', 'marginBlockStart', 'marginBlockEnd', 'marginInlineStart', 'marginInlineEnd']
        }
    ],
    height: [{ label: 'Bornes', names: ['minHeight', 'maxHeight'] }],
    width: [{ label: 'Bornes', names: ['minWidth', 'maxWidth'] }]
}
