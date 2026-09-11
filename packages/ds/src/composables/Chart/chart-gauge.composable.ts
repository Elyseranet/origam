import {
    computed,
    type ComputedRef
} from 'vue'

import type { IChartGaugeGeometry, IUseChartGaugeOptions } from '../../interfaces'

import { arcPath } from '../../utils/Chart/path.util'

/**
 * Default gauge arc sweep — 270 degrees centred on the bottom,
 * mirroring Highcharts' "Solid Gauge" demo. The remaining 90
 * degrees at the bottom stay open so the gauge looks like a
 * speedometer instead of a closed ring.
 */
const DEFAULT_START_ANGLE = -Math.PI * 3 / 4
const DEFAULT_END_ANGLE = Math.PI * 3 / 4
const DEFAULT_THICKNESS = 18

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
        const thickness = Math.max(1, options.thickness?.() ?? DEFAULT_THICKNESS)
        const startAngle = options.startAngle?.() ?? DEFAULT_START_ANGLE
        const endAngle = options.endAngle?.() ?? DEFAULT_END_ANGLE

        const cx = (padding.left + width - padding.right) / 2
        const cy = (padding.top + height - padding.bottom) / 2
        const availableW = width - padding.left - padding.right
        const availableH = height - padding.top - padding.bottom
        const outerR = Math.max(thickness, Math.min(availableW, availableH) / 2 - 4)
        const innerR = Math.max(0, outerR - thickness)

        // Normalise value into [0..1] for the partial sweep.
        const span = Math.max(1e-9, max - min)
        const clamped = Math.max(min, Math.min(max, value))
        const ratio = (clamped - min) / span
        const sweep = endAngle - startAngle
        const valueAngle = startAngle + ratio * sweep

        // Reuse `arcPath` so we get the same SVG d-string format
        // as pie / donut slices. Empty when sweep is zero so the
        // track / value don't paint a degenerate `M0,0` segment.
        const trackD = arcPath(cx, cy, outerR, innerR, startAngle, endAngle)
        const valueD = ratio > 1e-6
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
