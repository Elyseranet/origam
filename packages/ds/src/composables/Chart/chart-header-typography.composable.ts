import { computed } from 'vue'

import type { StyleValue } from 'vue'
import type { ITypographyProps } from '../../interfaces'

import { useTypography } from '../Commons/typography.composable'

/**
 * useChartHeaderTypography — applies the shared `ITypographyProps` surface to a
 * chart's header (title + subtitle) at once.
 *
 * Both the title and subtitle `<text>` of every chart read the GLOBAL
 * `--origam-chart__title---*` / `--origam-chart__subtitle---*` variables (their
 * per-type element classes — `chart-gauge__title`, `chart-cartesian__title`, …
 * — all reference the same shared vars in SCSS). So the returned styles are
 * bound on the chart ROOT element and cascade down to those descendant `<text>`
 * nodes; no per-element binding is needed.
 *
 * Effective props on SVG `<text>`: **fontSize + fontWeight** only (title reads
 * both, subtitle reads font-size). `fontFamily` / `lineHeight` / `letterSpacing`
 * are part of the surface but inert on charts — no SCSS rule reads them, and
 * `line-height` is not even a valid SVG `<text>` property. See the chart
 * typography recipe.
 *
 * @example
 * // in a chart component:
 * const { headerTypographyStyles } = useChartHeaderTypography(props)
 * // template root: :style="[rootStyles, …, headerTypographyStyles]"
 */
export function useChartHeaderTypography (props: ITypographyProps) {
    const { typographyStyles: titleTypographyStyles } = useTypography(props, 'chart__title')
    const { typographyStyles: subtitleTypographyStyles } = useTypography(props, 'chart__subtitle')

    const headerTypographyStyles = computed<StyleValue>(() => [
        titleTypographyStyles.value,
        subtitleTypographyStyles.value
    ])

    return { headerTypographyStyles }
}
