import type { CSSProperties } from 'vue'

import type { IShowcaseChipItem, IShowcaseTableRow } from '~/interfaces/showcase.interface'

/**
 * Asymmetric showcase grid: 624 | 312 | 312 maquette tracks → 2fr 1fr 1fr in
 * the 1248px-max container (same ratio, responsive). Forwarded verbatim to
 * <OrigamGrid columns>.
 */
export const SHOWCASE_GRID_COLUMNS = '2fr 1fr 1fr'

/**
 * Per-instance OrigamCard token overrides for a showcase widget card.
 *
 * Radius now rides the typed `rounded="var(--origam-radius---md)"` prop
 * (useRounded accepts custom-property refs since the v2.6 DS fix). The
 * padding tokens stay on the per-instance custom-props (the `padding` prop's
 * regex rejects `var(...)`).
 *
 * Fix #285 — `--origam-card---background` used to be forced here to
 * `var(--origam-color__surface---raised, #fafafa)`, an inline override
 * (highest specificity) that silently bypassed whatever the ACTIVE THEME
 * intends for `--origam-card---background` (e.g. glass's dedicated
 * translucent recipe, or ecom's dedicated `#ffffff`/`#2e1b14` card colours —
 * both set `--origam-card---background` directly in their theme object,
 * which this override was shadowing for showcase widgets specifically). On
 * sobre/default the override happened to resolve to the exact same opaque
 * value as the component's own default cascade (`{color.surface.raised}` =
 * `#ffffff`), so removing it is a strict no-op there — verified via
 * computed-style. Removed so every theme's showcase widgets render with
 * that theme's own intended card background, same as any other `origam-card`
 * instance on the site.
 *
 *   shadow         → --origam-shadow---card-elevated (marketing display token)
 *   padding 24px   → --origam-space---6
 */
export const SHOWCASE_WIDGET_RADIUS = 'var(--origam-radius---md, 10px)'

export const SHOWCASE_WIDGET_VARS: CSSProperties = {
    '--origam-card---box-shadow': 'var(--origam-shadow---card-elevated)',
    '--origam-card---padding-block-start': 'var(--origam-space---6, 1.5rem)',
    '--origam-card---padding-block-end': 'var(--origam-space---6, 1.5rem)',
    '--origam-card---padding-inline-start': 'var(--origam-space---6, 1.5rem)',
    '--origam-card---padding-inline-end': 'var(--origam-space---6, 1.5rem)'
} as CSSProperties

/**
 * OrigamTable token overrides for the showcase data-table widget.
 *
 * Applied via inline :style (specificity 1,0,0,0) to win over
 * OrigamTable's density-variant CSS vars (specificity 0,2,0).
 *
 *   header padding  8px / 12px   (compact design, matches maquette)
 *   header bg       transparent  (no surface--overlay grey on th)
 *   header color    secondary    (same as old <table> design)
 *   header border   1px default  (not 2px border-bottom from DS default)
 *   cell padding    8px / 12px
 *   cell border     default      (rgba(0,0,0,0.08)) — not subtle
 */
export const SHOWCASE_TABLE_VARS: CSSProperties = {
    '--origam-table---background-color':                         'transparent',
    '--origam-table__header-cell---background-color':            'transparent',
    '--origam-table__header-cell---color':                       'var(--origam-color__text---secondary, #525252)',
    '--origam-table__header-cell---padding-block':               'var(--origam-space---2, 0.5rem)',
    '--origam-table__header-cell---padding-inline':              'var(--origam-space---3, 0.75rem)',
    '--origam-table__header-cell---border-bottom-width':         '1px',
    '--origam-table__header-cell---border-bottom-color':         'var(--origam-color__border---default, rgba(0, 0, 0, 0.08))',
    '--origam-table__cell---padding-block':                      'var(--origam-space---2, 0.5rem)',
    '--origam-table__cell---padding-inline':                     'var(--origam-space---3, 0.75rem)',
    '--origam-table__cell---border-color':                       'var(--origam-color__border---default, rgba(0, 0, 0, 0.08))',
} as CSSProperties

export const SHOWCASE_TABLE_ROWS: IShowcaseTableRow[] = [
    {
        nameKey: 'home.showcase.data_table.row1_name',
        nameFallback: 'Aurora release',
        ownerKey: 'home.showcase.data_table.row1_owner',
        ownerFallback: 'Arnaud',
        statusKey: 'home.showcase.data_table.row1_status',
        statusFallback: 'Shipped',
        statusIntent: 'success',
    },
    {
        nameKey: 'home.showcase.data_table.row2_name',
        nameFallback: 'Tokens v2',
        ownerKey: 'home.showcase.data_table.row2_owner',
        ownerFallback: 'Léa',
        statusKey: 'home.showcase.data_table.row2_status',
        statusFallback: 'In review',
        statusIntent: 'warning',
    },
    {
        nameKey: 'home.showcase.data_table.row3_name',
        nameFallback: 'A11y audit',
        ownerKey: 'home.showcase.data_table.row3_owner',
        ownerFallback: 'Jade',
        statusKey: 'home.showcase.data_table.row3_status',
        statusFallback: 'Shipped',
        statusIntent: 'success',
    },
    {
        nameKey: 'home.showcase.data_table.row4_name',
        nameFallback: 'Chart engine',
        ownerKey: 'home.showcase.data_table.row4_owner',
        ownerFallback: 'Marc',
        statusKey: 'home.showcase.data_table.row4_status',
        statusFallback: 'Draft',
        statusIntent: 'neutral',
    },
    {
        nameKey: 'home.showcase.data_table.row5_name',
        nameFallback: 'New theme',
        ownerKey: 'home.showcase.data_table.row5_owner',
        ownerFallback: 'Romi',
        statusKey: 'home.showcase.data_table.row5_status',
        statusFallback: 'In review',
        statusIntent: 'warning',
    },
]

export const SHOWCASE_SPARKLINE_DATA = [6, 8, 7, 10, 9, 11, 12, 10, 13, 14, 12, 15]

/**
 * 3 chips shown inline in the Showcase card (matches the maquette).
 * Primary = outline violet, Neutral = outline grey, Success = tinted green.
 * We avoid OrigamChipGroup (slides/scroll) and render them directly in a flex
 * container so they never overflow.
 */
export const SHOWCASE_CHIP_ITEMS: IShowcaseChipItem[] = [
    {
        intent: 'primary',
        labelKey: 'home.showcase.chips.primary',
        labelFallback: 'Primary',
    },
    {
        intent: 'neutral',
        labelKey: 'home.showcase.chips.neutral',
        labelFallback: 'Neutral',
    },
    {
        intent: 'success',
        labelKey: 'home.showcase.chips.success',
        labelFallback: 'Success',
    },
]

export const SHOWCASE_AVATAR_ITEMS = [
    { text: 'AR', bgColor: 'primary' },
    { text: 'LB', bgColor: 'info'    },
    { text: 'JD', bgColor: 'warning' },
    { text: 'MC', bgColor: 'danger'  },
]
