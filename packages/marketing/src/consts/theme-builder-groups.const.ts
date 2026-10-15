/**
 * THEME_BUILDER_GROUPS — display metadata + filters for the /theming builder.
 *
 * Two derivations are driven from here:
 *
 *  1. NAV CATEGORIES — the component nav (left column) groups every DS
 *     component by its catalog `category` (see COMPONENTS_CATALOG). The
 *     order + icon of each category section come from `THEME_BUILDER_CATEGORY_META`.
 *
 *  2. PROP GROUPS — inside the controls panel (right column) every themable
 *     prop of the active component is bucketed into a typed group (Couleur,
 *     Taille & densité, Forme, Bordure, …).
 *
 * ⛔ The CLASSIFICATION itself — the group ids, their order, the prop-name →
 * group tables and `classifyPropGroup` — is NOT here. It lives once, in
 * `@origam/playground` (`TPropGroupId`, `PROP_GROUP_IDS`, `classifyPropGroup`).
 * This file used to carry a second copy of it (#1141). Only the HOST concerns
 * stay: the i18n label and the MDI icon of each group.
 */
import { PROP_GROUP_IDS } from '@origam/playground/consts'
import type { TPropGroupId } from '@origam/playground/types'

import type {
    IThemeBuilderCategoryMeta,
    IThemeBuilderPropGroupDisplay,
    IThemeBuilderPropGroupMeta
} from '~/interfaces/theme-builder.interface'

/**
 * Prop-group i18n label + MDI icon, keyed by the playground's group id. A
 * `Record` over `TPropGroupId`: a group the playground adds without a label
 * here is a compile error, not a silently missing section.
 */
export const THEME_BUILDER_PROP_GROUP_DISPLAY: Record<TPropGroupId, IThemeBuilderPropGroupDisplay> = {
    color: { labelKey: 'theming.group.color', labelFallback: 'Color', icon: 'mdi-palette-outline' },
    size: { labelKey: 'theming.group.size', labelFallback: 'Size & density', icon: 'mdi-ruler' },
    shape: { labelKey: 'theming.group.shape', labelFallback: 'Shape', icon: 'mdi-rounded-corner' },
    border: { labelKey: 'theming.group.border', labelFallback: 'Border', icon: 'mdi-border-all-variant' },
    elevation: { labelKey: 'theming.group.elevation', labelFallback: 'Elevation', icon: 'mdi-box-shadow' },
    dimension: { labelKey: 'theming.group.dimension', labelFallback: 'Dimensions', icon: 'mdi-arrow-expand-all' },
    spacing: { labelKey: 'theming.group.spacing', labelFallback: 'Spacing', icon: 'mdi-arrow-split-vertical' },
    state: { labelKey: 'theming.group.state', labelFallback: 'States', icon: 'mdi-toggle-switch-outline' },
    icon: { labelKey: 'theming.group.icon', labelFallback: 'Icons', icon: 'mdi-star-outline' },
    link: { labelKey: 'theming.group.link', labelFallback: 'Link & tag', icon: 'mdi-link-variant' },
    layout: { labelKey: 'theming.group.layout', labelFallback: 'Alignment & position', icon: 'mdi-arrow-all' },
    content: { labelKey: 'theming.group.content', labelFallback: 'Content', icon: 'mdi-text' },
    other: { labelKey: 'theming.group.other', labelFallback: 'Other', icon: 'mdi-dots-horizontal' }
}

/**
 * Prop-group sections in the playground's canonical order (`PROP_GROUP_IDS`),
 * each with its host display meta. The builder renders the groups a component
 * actually exposes, in THIS order.
 */
export const THEME_BUILDER_PROP_GROUPS: IThemeBuilderPropGroupMeta[] = PROP_GROUP_IDS.map(id => ({
    id,
    ...THEME_BUILDER_PROP_GROUP_DISPLAY[id]
}))

/**
 * Category section order + i18n labels + icons for the component nav. Mirrors
 * COMPONENTS_CATEGORIES; the builder falls back to a generic meta for any
 * category not listed (so a new DS category never disappears from the nav).
 */
export const THEME_BUILDER_CATEGORY_META: IThemeBuilderCategoryMeta[] = [
    { id: 'Layout & Structure', labelKey: 'theming.category.layout', labelFallback: 'Layout & Structure', icon: 'mdi-page-layout-body' },
    { id: 'Navigation', labelKey: 'theming.category.navigation', labelFallback: 'Navigation', icon: 'mdi-navigation-outline' },
    { id: 'Form & Input', labelKey: 'theming.category.form', labelFallback: 'Form & Input', icon: 'mdi-form-select' },
    { id: 'Data Display', labelKey: 'theming.category.data', labelFallback: 'Data Display', icon: 'mdi-table' },
    { id: 'Feedback & Status', labelKey: 'theming.category.feedback', labelFallback: 'Feedback & Status', icon: 'mdi-message-alert-outline' },
    { id: 'Overlay & Surface', labelKey: 'theming.category.overlay', labelFallback: 'Overlay & Surface', icon: 'mdi-layers-outline' },
    { id: 'Media', labelKey: 'theming.category.media', labelFallback: 'Media', icon: 'mdi-image-outline' },
    { id: 'Utilities & Providers', labelKey: 'theming.category.utilities', labelFallback: 'Utilities & Providers', icon: 'mdi-tools' }
]

/**
 * Type-label fragments that mean "this is a colour value" → render a swatch.
 * Anything else with a scalar type renders a select / text / number / switch.
 */
export const THEME_BUILDER_COLOR_TYPE_HINTS = ['TColor', 'TIntent'] as const

/**
 * Type labels that are NON-themable (data, callbacks, complex objects). A prop
 * whose type label contains any of these fragments is skipped entirely — it is
 * not a visual default a theme can override. This keeps the panel scalar-only,
 * matching the validated UI.
 */
export const THEME_BUILDER_SKIP_TYPE_HINTS = [
    'Array',
    '[]',
    '=>',
    'Record<',
    'Promise',
    'HTMLElement',
    'Element',
    'Event',
    'Date',
    'Function',
    'Component',
    'VNode',
    'I', // interface refs like IBtnProps, IChartSeries — object payloads
    'Map<',
    'Set<'
] as const

/**
 * Prop names that are functionally non-themable regardless of type (data
 * binding, model, identifiers). Skipped from the controls panel.
 */
export const THEME_BUILDER_SKIP_PROPS = [
    'modelValue',
    'value',
    'items',
    'data',
    'id',
    'name',
    'key',
    'ref',
    'rules',
    'modelModifiers'
] as const
