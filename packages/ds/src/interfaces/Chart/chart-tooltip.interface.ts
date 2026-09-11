import type {
    IChartPoint,
    IChartSeries
} from '../../interfaces'

/**
 * Props for `<OrigamChartTooltip>` — the floating card that follows
 * the cursor and shows the current data point. Extracted from the
 * legacy `<OrigamChart>` so every family (cartesian / polar /
 * radar / gauge) can share the same rendering + slot API.
 *
 * Position is driven by the `x` / `y` props (pixels relative to
 * the chart body). The component is pure CSS-positioned; no
 * `popper.js` / no measurement of the floating element.
 */
export interface IChartTooltipProps {
    /**
     * Hovered point payload (denormalised). When `null`, the
     * tooltip is hidden entirely.
     */
    point: IChartPoint | null
    /**
     * Hovered series reference. Companion to `point`. Hidden when
     * `null` even if `point` is set.
     */
    series: IChartSeries | null
    /**
     * Friendly category for the X axis — string when the X axis
     * is categorical, number otherwise.
     */
    category: string | number
    /** Mouse X position relative to the chart body, in pixels. */
    x: number
    /** Mouse Y position relative to the chart body, in pixels. */
    y: number
    /**
     * Formatter applied to the X value shown in the tooltip body.
     * Defaults to `String(value)`.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Formatter applied to the Y value shown in the tooltip body.
     * Defaults to `String(value)`.
     */
    yAxisFormat?: (value: number) => string
}

/**
 * Slot signatures exposed by `<OrigamChartTooltip>`. The default
 * slot replaces the entire body so consumers can render any
 * chip / icon / formatted-currency they need.
 */
export interface IChartTooltipSlots {
    /** Replace the default tooltip body. */
    default?: (bindings: { point: IChartPoint, series: IChartSeries, category: string | number }) => any
}
