import {
    computed,
    type ComputedRef
} from 'vue'

import {
    CHART_GAUGE_DEFAULT_END_ANGLE,
    CHART_GAUGE_DEFAULT_START_ANGLE,
    CHART_GAUGE_DEFAULT_THICKNESS,
    CHART_GAUGE_MIN_THICKNESS,
    CHART_GAUGE_RADIUS_INSET,
    CHART_GAUGE_RATIO_EPSILON,
    CHART_GAUGE_SPAN_EPSILON
} from '../../consts/Chart/chart-gauge.const'

import type { IChartGaugeGeometry, IUseChartGaugeOptions } from '../../interfaces/Chart/chart-gauge.interface'

import { arcPath } from '../../utils/Chart/path.util'

/**
 * Solid-gauge geometry engine. Given a `value` clamped between
 * `min` and `max`, produces:
 *
 * - `trackPath` — the empty arc behind the indicator (full sweep).
 * - `valuePath` — the filled arc from `min` to `value` (partial sweep).
 * - `valueAngle` — the radian angle of the indicator end (for the
 *   needle / handle if needed later).
 * - `centerX` / `centerY` — pivot point used by the value label.
 * - `outerRadius` / `innerRadius` — sized from the available plot
 *   box minus the gauge thickness.
 *
 * The composable is intentionally framework-agnostic in spirit:
 * inputs are thunks so `<OrigamChartGauge>` can drive it from
 * props OR a Pinia store without re-instantiating.
 */
export const useChartGauge = (options: IUseChartGaugeOptions): {
    geometry: ComputedRef<IChartGaugeGeometry>
} => {
    const geometry = computed<IChartGaugeGeometry>(() => {
        const width = options.width()
        const height = options.height()
        const padding = options.padding()
        const min = options.min()
        const max = options.max()
        const value = options.value()
        const thickness = Math.max(CHART_GAUGE_MIN_THICKNESS, options.thickness?.() ?? CHART_GAUGE_DEFAULT_THICKNESS)
        const startAngle = options.startAngle?.() ?? CHART_GAUGE_DEFAULT_START_ANGLE
        const endAngle = options.endAngle?.() ?? CHART_GAUGE_DEFAULT_END_ANGLE

        const cx = (padding.left + width - padding.right) / 2
        const cy = (padding.top + height - padding.bottom) / 2
        const availableW = width - padding.left - padding.right
        const availableH = height - padding.top - padding.bottom
        const outerR = Math.max(thickness, Math.min(availableW, availableH) / 2 - CHART_GAUGE_RADIUS_INSET)
        const innerR = Math.max(0, outerR - thickness)

        // Normalise value into [0..1] for the partial sweep.
        const span = Math.max(CHART_GAUGE_SPAN_EPSILON, max - min)
        const clamped = Math.max(min, Math.min(max, value))
        const ratio = (clamped - min) / span
        const sweep = endAngle - startAngle
        const valueAngle = startAngle + ratio * sweep

        // Reuse `arcPath` so we get the same SVG d-string format
        // as pie / donut slices. Empty when sweep is zero so the
        // track / value don't paint a degenerate `M0,0` segment.
        const trackD = arcPath(cx, cy, outerR, innerR, startAngle, endAngle)
        const valueD = ratio > CHART_GAUGE_RATIO_EPSILON
            ? arcPath(cx, cy, outerR, innerR, startAngle, valueAngle)
            : ''

        return {
            trackPath: trackD,
            valuePath: valueD,
            valueAngle,
            startAngle,
            endAngle,
            outerRadius: outerR,
            innerRadius: innerR,
            centerX: cx,
            centerY: cy,
            ratio,
            clampedValue: clamped
        }
    })

    return { geometry }
}
