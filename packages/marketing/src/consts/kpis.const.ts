import type { CSSProperties } from 'vue'

import type { IKpi } from '~/interfaces/kpi.interface'

/**
 * OrigamDivider opacity override for the KPI hairlines. The divider bakes a
 * 0.12 fade for its default hairline look; the KPI rules must read the sobre
 * border token at full strength. Since the v2.6 DS fix the opacity is exposed
 * as the overridable `--origam-divider---opacity` custom-prop, so we set it
 * via the divider's public `:style` channel instead of a scoped CSS exception.
 */
export const KPIS_RULE_VARS: CSSProperties = {
    '--origam-divider---opacity': '1'
} as CSSProperties

/**
 * Track template forwarded verbatim to <OrigamGrid columns>.
 *
 * `auto-fit` + `minmax` is CSS-first responsive: the 5 KPI columns collapse
 * to fewer per row on narrow viewports with no media query and no
 * `!important` override of the grid's `--origam-grid---template-columns`.
 */
export const KPIS_GRID_COLUMNS = 'repeat(auto-fit, minmax(140px, 1fr))'

export const KPIS: IKpi[] = [
    {
        valueKey: 'home.kpis.components_value',
        valueFallback: '218',
        labelKey: 'home.kpis.components_label',
        labelFallback: 'Components',
    },
    {
        valueKey: 'home.kpis.charts_value',
        valueFallback: '26',
        labelKey: 'home.kpis.charts_label',
        labelFallback: 'Chart primitives',
    },
    {
        valueKey: 'home.kpis.a11y_value',
        valueFallback: '100%',
        labelKey: 'home.kpis.a11y_label',
        labelFallback: 'WCAG 2.1 AA',
    },
    {
        valueKey: 'home.kpis.size_value',
        valueFallback: '<50kb',
        labelKey: 'home.kpis.size_label',
        labelFallback: 'Tree-shakable',
    },
    {
        valueKey: 'home.kpis.license_value',
        valueFallback: 'MIT',
        labelKey: 'home.kpis.license_label',
        labelFallback: 'Open source',
    },
]
