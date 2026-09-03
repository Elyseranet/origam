import {
    computed,
    type ComputedRef,
    ref,
    type Ref
} from 'vue'

import type { IChartAnnotation, IChartAnnotationGeo } from '../../interfaces/Chart/chart-annotation.interface'
import type { IChartPlotBand } from '../../interfaces/Chart/chart-plot-band.interface'
import type { IChartPlotLine } from '../../interfaces/Chart/chart-plot-line.interface'
import type { IChartPoint } from '../../interfaces/Chart/chart-point.interface'
import type { IChartSeries } from '../../interfaces/Chart/chart-series.interface'
import type { IChartLegendItem, IChartPath, IChartScales, IChartTick, IUseChartOptions } from '../../interfaces/Chart/chart.interface'

import type { TChartSmoothing, TChartStacking, TChartType } from '../../types/Chart/chart.type'
import type { TIntent } from '../../types/Commons/intent.type'

import { CHART_SMOOTHING, CHART_STACKING, CHART_TYPE, INTENT } from '../../enums'

import {
    arcPath,
    areaPath,
    linePath,
    monotonePath,
    pathLength as computePathLength,
    steppedPathLength,
    polarToCartesian,
    polygonPath,
    smoothPath,
    steppedPath,
    type TPathPoint
} from '../../utils/Chart/path.util'

import {
    CHART_ANNOTATION_ARROWHEAD_MIN_SIZE,
    CHART_ANNOTATION_ARROWHEAD_PRECISION,
    CHART_ANNOTATION_ARROWHEAD_SPREAD,
    CHART_ANNOTATION_ARROWHEAD_WIDTH_FACTOR,
    CHART_ANNOTATION_DEFAULT_DY,
    CHART_ANNOTATION_DEFAULT_RADIUS,
    CHART_ANNOTATION_DEFAULT_WIDTH,
    CHART_ANNOTATION_LABEL_CHAR_WIDTH,
    CHART_ANNOTATION_LABEL_HEIGHT,
    CHART_ANNOTATION_LABEL_MIN_WIDTH,
    CHART_ANNOTATION_LABEL_PADDING,
    CHART_BAR_SLOT_FILL_RATIO,
    CHART_COLOR_FALLBACK,
    CHART_DASH_ARRAY_DASHED,
    CHART_DASH_ARRAY_DOTTED,
    CHART_DASH_ARRAY_SOLID,
    CHART_DEFAULT_PALETTE,
    CHART_EPSILON,
    CHART_NICE_STEP_LADDER,
    CHART_PERCENT_MAX,
    CHART_PERCENT_MIN,
    CHART_PERCENT_TICK_STEP,
    CHART_PIE_MIN_RADIUS,
    CHART_PIE_RADIUS_INSET,
    CHART_PLOT_BAND_DEFAULT_OPACITY,
    CHART_PLOT_LINE_DEFAULT_WIDTH,
    CHART_PLOT_LINE_LABEL_OFFSET,
    CHART_PLOT_LINE_LABEL_TOP_OFFSET,
    CHART_POINT_MARKER_RADIUS,
    CHART_RADAR_MARKER_RADIUS,
    CHART_RADAR_MIN_RADIUS,
    CHART_RADAR_RADIUS_INSET,
    CHART_SCATTER_DEFAULT_RADIUS,
    CHART_SCATTER_MAX_RADIUS,
    CHART_SCATTER_MIN_RADIUS,
    CHART_SLICE_LABEL_PREFIX,
    CHART_TICK_LABEL_PRECISION_FACTOR,
    CHART_Y_TICK_COUNT
} from '../../consts/Chart/chart.const'

import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

// Every literal this engine used to inline lives in `src/consts/Chart/chart.const.ts`.

/**
 * Resolve a colour string to a usable CSS value.
 *
 * - Raw CSS strings (hex, `rgb()`, `rgba()`, `hsl()`, `hsla()`,
 *   `var(…)`, `currentColor`, `transparent`, gradients) pass through
 *   untouched.
 * - DS intent names (`primary`, `secondary`, `ghost`, `neutral`,
 *   `success`, `warning`, `danger`, `info`) route through
 *   `intentBgExpr()` so the chart picks up the proper token namespace
 *   (`action--*` for action intents, `feedback--*` for feedback
 *   intents). Pre-fix the chart hard-coded `action--{name}---bg`,
 *   which only exists for `primary / secondary / ghost`; every other
 *   intent fell through to the `currentColor` fallback and rendered
 *   as black on light theme.
 * - Anything else (an unknown string) falls back to `currentColor`.
 */
const resolveColor = (raw: TIntent | string | undefined): string => {
    if (!raw) return CHART_COLOR_FALLBACK
    // Raw CSS values — hex, rgb, hsl, named keywords, gradients, var().
    if (/^(#|rgb|hsl|var|currentColor|transparent|linear-gradient|radial-gradient|conic-gradient)/i.test(raw)) {
        return raw
    }
    // DS intent → route through the canonical helper so feedback
    // intents (success / warning / danger / info) resolve to their
    // `feedback--*---bg` tokens rather than the non-existent
    // `action--success---bg`.
    if (isIntent(raw)) {
        return intentBgExpr(raw, 'default')
    }
    return CHART_COLOR_FALLBACK
}

/**
 * Resolve a dash pattern to an SVG `stroke-dasharray` value.
 */
const dashArray = (dash: IChartPlotLine['dash']): string => {
    if (dash === 'dotted') return CHART_DASH_ARRAY_DOTTED
    if (dash === 'solid') return CHART_DASH_ARRAY_SOLID
    return CHART_DASH_ARRAY_DASHED
}

/**
 * Resolve a categorical X value (string label or numeric index) to
 * a pixel position using the category list.
 */
const resolveCategoryX = (
    value: number | string,
    categories: Array<string>,
    plotX0: number,
    plotX1: number
): number => {
    const idx = typeof value === 'string'
        ? categories.indexOf(value)
        : value
    const slots = Math.max(1, categories.length)
    if (slots === 1) return (plotX0 + plotX1) / 2
    const clamped = Math.max(0, Math.min(slots - 1, idx))
    return plotX0 + (clamped / (slots - 1)) * (plotX1 - plotX0)
}

/**
 * Compute geometry for a single plot band. Returns an object with
 * SVG rect attributes and label positioning, or `null` when the
 * band falls entirely outside the plot.
 */
export const computePlotBandGeometry = (
    band: IChartPlotBand,
    scales: IChartScales,
    categories: Array<string>,
    plotX0: number,
    plotX1: number,
    plotY0: number,
    plotY1: number
): {
    x: number
    y: number
    width: number
    height: number
    fill: string
    opacity: number
    label: string | undefined
    labelX: number
    labelY: number
    labelColor: string
} | null => {
    const axis = band.axis ?? 'y'
    const fill = resolveColor(band.color ?? INTENT.WARNING)
    const opacity = band.opacity ?? CHART_PLOT_BAND_DEFAULT_OPACITY
    const labelColor = resolveColor(band.labelColor ?? undefined)

    if (axis === 'y') {
        const fromPx = scales.y(Number(band.from))
        const toPx = scales.y(Number(band.to))
        const top = Math.min(fromPx, toPx)
        const bot = Math.max(fromPx, toPx)
        const clampedTop = Math.max(plotY0, Math.min(plotY1, top))
        const clampedBot = Math.max(plotY0, Math.min(plotY1, bot))
        const h = clampedBot - clampedTop
        if (h <= 0) return null
        return {
            x: plotX0,
            y: clampedTop,
            width: plotX1 - plotX0,
            height: h,
            fill,
            opacity,
            label: band.label,
            labelX: (plotX0 + plotX1) / 2,
            labelY: clampedTop + h / 2,
            labelColor
        }
    }

    const fromPx = resolveCategoryX(band.from, categories, plotX0, plotX1)
    const toPx = resolveCategoryX(band.to, categories, plotX0, plotX1)
    const left = Math.min(fromPx, toPx)
    const right = Math.max(fromPx, toPx)
    const clampedLeft = Math.max(plotX0, Math.min(plotX1, left))
    const clampedRight = Math.max(plotX0, Math.min(plotX1, right))
    const w = clampedRight - clampedLeft
    if (w <= 0) return null
    return {
        x: clampedLeft,
        y: plotY0,
        width: w,
        height: plotY1 - plotY0,
        fill,
        opacity,
        label: band.label,
        labelX: clampedLeft + w / 2,
        labelY: (plotY0 + plotY1) / 2,
        labelColor
    }
}

/**
 * Compute geometry for a single plot line. Returns an object with
 * SVG line attributes and label positioning, or `null` when the
 * line falls outside the plot.
 */
export const computePlotLineGeometry = (
    line: IChartPlotLine,
    scales: IChartScales,
    categories: Array<string>,
    plotX0: number,
    plotX1: number,
    plotY0: number,
    plotY1: number
): {
    x1: number
    y1: number
    x2: number
    y2: number
    stroke: string
    strokeWidth: number
    strokeDasharray: string
    label: string | undefined
    labelX: number
    labelY: number
    labelAnchor: string
} | null => {
    const axis = line.axis ?? 'y'
    const stroke = resolveColor(line.color ?? INTENT.DANGER)
    const strokeWidth = line.width ?? CHART_PLOT_LINE_DEFAULT_WIDTH
    const strokeDasharray = dashArray(line.dash)

    if (axis === 'y') {
        const py = scales.y(Number(line.value))
        if (py < plotY0 || py > plotY1) return null
        const isRight = (line.labelAlign ?? 'right') === 'right'
        return {
            x1: plotX0,
            y1: py,
            x2: plotX1,
            y2: py,
            stroke,
            strokeWidth,
            strokeDasharray,
            label: line.label,
            labelX: isRight ? plotX1 : plotX0,
            labelY: py - CHART_PLOT_LINE_LABEL_OFFSET,
            labelAnchor: isRight ? 'end' : 'start'
        }
    }

    const px = resolveCategoryX(line.value, categories, plotX0, plotX1)
    if (px < plotX0 || px > plotX1) return null
    return {
        x1: px,
        y1: plotY0,
        x2: px,
        y2: plotY1,
        stroke,
        strokeWidth,
        strokeDasharray,
        label: line.label,
        labelX: px + CHART_PLOT_LINE_LABEL_OFFSET,
        labelY: plotY0 + CHART_PLOT_LINE_LABEL_TOP_OFFSET,
        labelAnchor: 'start'
    }
}

/**
 * Arrowhead polygon string. Returns an SVG `polygon` `points`
 * attribute value for a filled triangle at `(hx, hy)` pointing in
 * the direction from `(tx, ty)` toward `(hx, hy)`. Size is `size`
 * SVG units.
 */
const arrowheadPoints = (tx: number, ty: number, hx: number, hy: number, size: number): string => {
    const angle = Math.atan2(hy - ty, hx - tx)
    const spread = CHART_ANNOTATION_ARROWHEAD_SPREAD
    const left = angle + Math.PI - spread
    const right = angle + Math.PI + spread
    const lx = hx + size * Math.cos(left)
    const ly = hy + size * Math.sin(left)
    const rx = hx + size * Math.cos(right)
    const ry = hy + size * Math.sin(right)
    const p = CHART_ANNOTATION_ARROWHEAD_PRECISION
    return `${hx.toFixed(p)},${hy.toFixed(p)} ${lx.toFixed(p)},${ly.toFixed(p)} ${rx.toFixed(p)},${ry.toFixed(p)}`
}

/**
 * Project a single `IChartAnnotation` into pixel space using the
 * chart's X/Y scales and the current category list.
 *
 * Returns `null` when required coordinates cannot be resolved
 * (e.g. a category string that doesn't exist in the list).
 */
export const computeAnnotationGeometry = (
    anno: IChartAnnotation,
    scales: IChartScales,
    categories: Array<string>,
    categoryCount: number
): IChartAnnotationGeo | null => {
    const stroke = resolveColor(anno.color ?? INTENT.PRIMARY)
    const strokeWidth = anno.width ?? CHART_ANNOTATION_DEFAULT_WIDTH
    const dx = anno.dx ?? 0
    const dy = anno.dy ?? CHART_ANNOTATION_DEFAULT_DY
    const radius = anno.radius ?? CHART_ANNOTATION_DEFAULT_RADIUS

    const ax = scales.x(anno.x, typeof anno.x === 'number' ? anno.x : categories.indexOf(anno.x), categoryCount)
    const ay = scales.y(anno.y)

    const bxRaw = anno.x2 !== undefined ? anno.x2 : anno.x
    const byRaw = anno.y2 !== undefined ? anno.y2 : anno.y
    const bx = scales.x(bxRaw, typeof bxRaw === 'number' ? bxRaw : categories.indexOf(bxRaw), categoryCount)
    const by = scales.y(byRaw)

    if (!Number.isFinite(ax) || !Number.isFinite(ay)) return null

    const base: IChartAnnotationGeo = {
        kind: anno.kind,
        stroke,
        strokeWidth,
        ax,
        ay,
        bx: Number.isFinite(bx) ? bx : ax,
        by: Number.isFinite(by) ? by : ay,
        dx,
        dy,
        radius,
        text: anno.text
    }

    if (anno.kind === 'arrow') {
        const size = Math.max(
            CHART_ANNOTATION_ARROWHEAD_MIN_SIZE,
            strokeWidth * CHART_ANNOTATION_ARROWHEAD_WIDTH_FACTOR
        )
        return {
            ...base,
            arrowPoints: arrowheadPoints(ax, ay, base.bx, base.by, size)
        }
    }

    if (anno.kind === 'label') {
        const text = anno.text ?? ''
        const charWidth = CHART_ANNOTATION_LABEL_CHAR_WIDTH
        const padding = CHART_ANNOTATION_LABEL_PADDING
        const boxW = Math.max(
            CHART_ANNOTATION_LABEL_MIN_WIDTH,
            text.length * charWidth + padding * 2
        )
        const boxH = CHART_ANNOTATION_LABEL_HEIGHT
        const calloutX = ax + dx - boxW / 2
        const calloutY = ay + dy - boxH
        return {
            ...base,
            callout: { x: calloutX, y: calloutY, width: boxW, height: boxH },
            leaderEnd: { x: ax + dx, y: calloutY + boxH }
        }
    }

    return base
}

/**
 * Normalise a series' data array into pure `[x, y]` pairs, where
 * `x` is either the numeric value (object form) or the data index
 * (number form). Categorical `x` strings are mapped to their
 * `categories` index later by the X scale.
 */
const toPoints = (series: IChartSeries): Array<{ x: number | string, y: number, z?: number, dataIndex: number }> => {
    if (!series.data?.length) return []
    return series.data.map((entry, i) => {
        if (typeof entry === 'number') {
            return { x: i, y: entry, dataIndex: i }
        }
        return { x: entry.x, y: entry.y, z: entry.z, dataIndex: i }
    })
}

/**
 * Aggregate min / max across every visible series. Stacked charts
 * sum the per-index Y values instead of taking the per-series max
 * — otherwise the top of the stack falls off the plot.
 *
 * In `'percent'` stacking mode the Y range is fixed at `0 → 100`;
 * yMin / yMax overrides are intentionally ignored so the axis
 * stays canonical.
 */
const computeYRange = (
    series: Array<IChartSeries>,
    stacked: boolean,
    stacking: TChartStacking,
    yMinOverride?: number,
    yMaxOverride?: number
): { min: number, max: number } => {
    const visible = series.filter((s) => s.visible !== false)
    if (!visible.length) return { min: 0, max: 1 }

    if (stacked && stacking === CHART_STACKING.PERCENT) {
        return { min: CHART_PERCENT_MIN, max: CHART_PERCENT_MAX }
    }

    if (stacked) {
        const dataLengths = visible.map((s) => s.data.length)
        const maxLength = Math.max(...dataLengths)
        let stackMax = 0
        let stackMin = 0
        for (let i = 0; i < maxLength; i++) {
            let positive = 0
            let negative = 0
            for (const s of visible) {
                const entry = s.data[i]
                const y = typeof entry === 'number' ? entry : entry?.y ?? 0
                if (y >= 0) positive += y
                else negative += y
            }
            stackMax = Math.max(stackMax, positive)
            stackMin = Math.min(stackMin, negative)
        }
        return {
            min: yMinOverride ?? stackMin,
            max: yMaxOverride ?? stackMax
        }
    }

    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    for (const s of visible) {
        for (const entry of s.data) {
            const y = typeof entry === 'number' ? entry : entry.y
            if (y < min) min = y
            if (y > max) max = y
        }
    }
    if (!Number.isFinite(min)) min = 0
    if (!Number.isFinite(max)) max = 1
    if (min === max) {
        // Degenerate range — pad so the line doesn't sit on the axis.
        max = min + 1
    }
    return {
        min: yMinOverride ?? Math.min(0, min),
        max: yMaxOverride ?? max
    }
}

/**
 * Round a numeric range so the ticks land on whole / decimal /
 * power-of-ten increments instead of arbitrary floats. Classic
 * D3-style "nice" algorithm distilled to ~20 lines.
 */
const niceStep = (range: number, count: number): number => {
    if (range <= 0 || count <= 0) return 1
    const rough = range / count
    const pow10 = Math.pow(10, Math.floor(Math.log10(rough)))
    const norm = rough / pow10
    const rung = CHART_NICE_STEP_LADDER.find(({ below }) => norm < below)
        ?? CHART_NICE_STEP_LADDER[CHART_NICE_STEP_LADDER.length - 1]
    return rung.step * pow10
}

/**
 * Stateless chart engine. Produces every render-time descriptor
 * `<OrigamChart>` needs:
 *
 * - `viewBox` — pre-formatted SVG attribute string.
 * - `scales.x|y` — pure pixel-mapping functions.
 * - `paths` — array of `<path>`/`<rect>`/`<circle>` descriptors,
 *   one entry per series for line/area/radar/pie/donut, one entry
 *   per data point for bar/column/scatter.
 * - `ticks` — gridline + axis-label positions.
 * - `legend` — pre-resolved legend entries.
 * - `hover`, `onPointHover` — interactive state shared between
 *   the data points and the tooltip teleport.
 *
 * Every getter is a `() => …` thunk so the composable can be driven
 * from props *or* a Pinia store without re-instantiation.
 */
export const useChart = (options: IUseChartOptions) => {
    const hover: Ref<IChartPoint | null> = ref(null)

    const padding = computed(() => options.padding())
    const width = computed(() => options.width())
    const height = computed(() => options.height())

    /**
     * `viewBox` attribute. The chart always paints into `0 0 W H`
     * so the consumer can resize via CSS without redrawing.
     */
    const viewBox: ComputedRef<string> = computed(
        () => `0 0 ${width.value} ${height.value}`
    )

    /**
     * Pixel coordinates of the plotting area's four corners. The
     * chart paddings let labels breathe outside the plot.
     */
    const plot = computed(() => {
        const pad = padding.value
        return {
            x0: pad.left,
            y0: pad.top,
            x1: width.value - pad.right,
            y1: height.value - pad.bottom,
            cx: (pad.left + width.value - pad.right) / 2,
            cy: (pad.top + height.value - pad.bottom) / 2
        }
    })

    /**
     * Effective stacking mode. `'percent'` is only active when
     * both `stacked=true` AND `stacking='percent'` are set. The
     * `stacking` option is optional on `IUseChartOptions` (backward
     * compatibility) so we default to `'normal'`.
     */
    const effectiveStacking = computed<TChartStacking>(() =>
        options.stacking?.() ?? CHART_STACKING.NORMAL
    )

    const yRange = computed(() =>
        computeYRange(
            options.series().filter((s) => (s.yAxis ?? 0) === 0),
            options.stacked(),
            effectiveStacking.value,
            options.yMin(),
            options.yMax()
        )
    )

    /**
     * Y range for the secondary (right-hand) axis. Aggregates only
     * series with `yAxis === 1`. Falls back to `{ min: 0, max: 1 }`
     * when no such series exists or when no `secondaryYAxis` option
     * is provided.
     */
    const secondaryYRange = computed((): { min: number, max: number } => {
        const secondary = options.secondaryYAxis?.()
        const axis1Series = options.series().filter((s) => (s.yAxis ?? 0) === 1 && s.visible !== false)
        if (!axis1Series.length && !secondary) return { min: 0, max: 1 }
        return computeYRange(
            axis1Series,
            false,
            CHART_STACKING.NORMAL,
            secondary?.min,
            secondary?.max
        )
    })

    const categories = computed(() => options.categories())

    /**
     * Pixel-mapping helpers. Both functions clamp the inputs to the
     * plot bounds — a value outside the data range can't escape the
     * chart frame.
     */
    const scales: ComputedRef<IChartScales> = computed(() => {
        const { x0, x1, y0, y1 } = plot.value
        const { min, max } = yRange.value
        const cats = categories.value
        const yPxPerUnit = (y1 - y0) / Math.max(CHART_EPSILON, max - min)

        const x = (value: number | string, dataIndex?: number, categoryCount?: number): number => {
            // 1. Numeric x — linear scale 0..count-1.
            if (typeof value === 'number' && !cats.length) {
                const count = categoryCount ?? Math.max(1, dataIndex ?? 0)
                if (count <= 1) return x0
                return x0 + (value / (count - 1)) * (x1 - x0)
            }
            // 2. Categorical x — index lookup.
            const idx = typeof value === 'string'
                ? cats.indexOf(value)
                : dataIndex ?? 0
            const slots = Math.max(1, cats.length || (categoryCount ?? 1))
            if (slots === 1) return (x0 + x1) / 2
            return x0 + (idx / (slots - 1)) * (x1 - x0)
        }

        const y = (value: number): number => {
            const px = y1 - (value - min) * yPxPerUnit
            // Clamp so out-of-range values stay inside the frame.
            if (px < y0) return y0
            if (px > y1) return y1
            return px
        }

        return { x, y }
    })

    /**
     * Secondary (right-hand) Y pixel mapper. Returns the same
     * signature as `scales.value.y` but projects against
     * `secondaryYRange` instead of `yRange`.
     */
    const scaleY1 = computed(() => {
        const { y0, y1 } = plot.value
        const { min, max } = secondaryYRange.value
        const yPxPerUnit = (y1 - y0) / Math.max(CHART_EPSILON, max - min)
        return (value: number): number => {
            const px = y1 - (value - min) * yPxPerUnit
            if (px < y0) return y0
            if (px > y1) return y1
            return px
        }
    })

    /**
     * Y / X gridline + label descriptors.
     *
     * The bar (horizontal) chart swaps the role of each axis:
     *   - categorical axis (Jan, Feb, …) runs along Y (one entry per
     *     data slot, top-to-bottom)
     *   - value axis (0, 10, 20, …) runs along X (`niceStep`-rounded)
     *
     * Every other cartesian / radar / polar topology uses the standard
     * orientation (categories along X, values along Y).
     *
     * We detect the bar mode by looking at the chart-level type AND
     * any per-series override — a single bar series anywhere in the
     * input is enough to flip the orientation (mix-charts with bar
     * are rare but legal).
     */
    const ticks: ComputedRef<{ x: Array<IChartTick>, y: Array<IChartTick> }> = computed(() => {
        const isPercentMode = options.stacked() && effectiveStacking.value === CHART_STACKING.PERCENT

        let niceMin: number
        let niceMax: number
        let step: number

        if (isPercentMode) {
            niceMin = CHART_PERCENT_MIN
            niceMax = CHART_PERCENT_MAX
            step = CHART_PERCENT_TICK_STEP
        } else {
            const { min, max } = yRange.value
            step = niceStep(max - min, CHART_Y_TICK_COUNT)
            niceMin = Math.floor(min / step) * step
            niceMax = Math.ceil(max / step) * step
        }

        const cats = categories.value
        const allSeries = options.series()
        const isBarMode = options.type() === CHART_TYPE.BAR || allSeries.some((s) => s.type === CHART_TYPE.BAR)

        // Value-axis tick descriptors — position depends on orientation:
        //   bar (horizontal) → along X using `scales.x` interpolated value mapping
        //   everything else  → along Y using `scales.y`
        const valueTicks: Array<IChartTick> = []
        for (let v = niceMin; v <= niceMax + CHART_EPSILON; v += step) {
            const label = isPercentMode
                ? `${Math.round(v)}%`
                : String(Math.round(v * CHART_TICK_LABEL_PRECISION_FACTOR) / CHART_TICK_LABEL_PRECISION_FACTOR)
            valueTicks.push({
                value: v,
                label,
                position: isBarMode
                    ? (() => {
                        const { x0, x1 } = plot.value
                        const range = Math.max(CHART_EPSILON, niceMax - niceMin)
                        const ratio = (v - niceMin) / range
                        return x0 + ratio * (x1 - x0)
                    })()
                    : scales.value.y(v)
            })
        }

        // Categorical tick descriptors — same role flip:
        //   bar (horizontal) → along Y, slot-centred (band scale)
        //   everything else  → along X, edge-to-edge mapping via scales.x
        const categoryTicks: Array<IChartTick> = cats.length
            ? cats.map((cat, i) => ({
                value: cat,
                label: cat,
                position: isBarMode
                    ? (() => {
                        const { y0, y1 } = plot.value
                        const slotPx = (y1 - y0) / Math.max(1, cats.length)
                        return y0 + (i + 0.5) * slotPx
                    })()
                    : scales.value.x(cat, i, cats.length)
            }))
            : []

        return isBarMode
            ? { x: valueTicks, y: categoryTicks }
            : { x: categoryTicks, y: valueTicks }
    })

    /**
     * Tick descriptors for the secondary (right-hand) Y axis. Only
     * populated when `secondaryYAxis` is configured OR at least one
     * visible series carries `yAxis === 1`. Bar mode is excluded —
     * the horizontal bar family flips the axes so a secondary Y axis
     * doesn't make sense in that orientation.
     */
    const secondaryTicks: ComputedRef<Array<IChartTick>> = computed(() => {
        const secondary = options.secondaryYAxis?.()
        const axis1Series = options.series().filter((s) => (s.yAxis ?? 0) === 1 && s.visible !== false)
        const allSeries = options.series()
        const isBarMode = options.type() === CHART_TYPE.BAR || allSeries.some((s) => s.type === CHART_TYPE.BAR)

        if (isBarMode) return []
        if (!secondary && !axis1Series.length) return []

        const { min, max } = secondaryYRange.value
        const step = niceStep(max - min, CHART_Y_TICK_COUNT)
        const niceMin = Math.floor(min / step) * step
        const niceMax = Math.ceil(max / step) * step
        const out: Array<IChartTick> = []
        for (let v = niceMin; v <= niceMax + CHART_EPSILON; v += step) {
            out.push({
                value: v,
                label: String(Math.round(v * CHART_TICK_LABEL_PRECISION_FACTOR) / CHART_TICK_LABEL_PRECISION_FACTOR),
                position: scaleY1.value(v)
            })
        }
        return out
    })

    /**
     * Resolves the per-series colour: explicit `color` wins,
     * otherwise cycle through the configured palette.
     */
    const colorFor = (series: IChartSeries, index: number): string => {
        if (series.color) return resolveColor(series.color)
        const scheme = options.colorScheme()
        const palette = scheme.length ? scheme : CHART_DEFAULT_PALETTE
        return resolveColor(palette[index % palette.length])
    }

    /**
     * Pre-resolved legend entries. Two shapes:
     *
     *   1. **Single pie / donut series** → one legend entry per slice
     *      (category). Each entry's `series` reference points to the
     *      ONE pie series so the consumer still has the original data
     *      handle; the `name` displayed comes from `categories[i]`
     *      (legend renderer reads `series.name`). Each slice gets its
     *      colour from the palette, matching the ring's category
     *      partitioning.
     *
     *   2. **Anything else** (multi-pie-series → concentric rings,
     *      cartesian, radar, gauge) → one legend entry per SERIES,
     *      coloured from the per-series `colorFor()` resolver.
     *
     * Toggling either shape flips a `visible` flag the parent shell
     * tracks via `hiddenSeries: Set<string>` (keyed by display name).
     */
    const legend: ComputedRef<Array<IChartLegendItem>> = computed(() => {
        const allSeries = options.series()
        const pieSeriesList = allSeries.filter((s) => effectiveType(s) === CHART_TYPE.PIE || effectiveType(s) === CHART_TYPE.DONUT)
        const cats = options.categories()
        const scheme = options.colorScheme().length ? options.colorScheme() : CHART_DEFAULT_PALETTE
        const hidden = options.hiddenLabels?.() ?? new Set<string>()

        // Single-series pie / donut → expose each slice as a legend
        // entry so the consumer can address slices by category name.
        // The synthetic series wrapper carries the slice label as
        // `name` so the legend renderer + the shell's hidden-set
        // lookup work uniformly across all chart families.
        if (pieSeriesList.length === 1 && pieSeriesList[0].data.length > 1) {
            const s = pieSeriesList[0]
            const data = s.data as Array<number | { x: number | string, y: number }>
            return data.map((entry, i) => {
                const label = cats[i] ?? (typeof entry === 'object' && entry !== null ? String(entry.x) : `${ CHART_SLICE_LABEL_PREFIX } ${ i + 1 }`)
                const labelStr = String(label)
                const sliceSeries: IChartSeries = {
                    ...s,
                    name: labelStr,
                    data: [entry] as unknown as IChartSeries['data'],
                    visible: !hidden.has(labelStr)
                }
                return {
                    series: sliceSeries,
                    index: i,
                    color: s.color ? resolveColor(s.color) : resolveColor(scheme[i % scheme.length]),
                    visible: !hidden.has(labelStr)
                }
            })
        }

        // Default: one entry per series.
        return allSeries.map((series, index) => ({
            series,
            index,
            color: colorFor(series, index),
            visible: series.visible !== false
        }))
    })

    /**
     * Number of categories — used by the per-series effective type
     * helper to compute the bar slot width.
     */
    const slotCount = computed(() => {
        const cats = categories.value
        if (cats.length) return cats.length
        let max = 0
        for (const s of options.series()) {
            if (s.data.length > max) max = s.data.length
        }
        return Math.max(1, max)
    })

    /**
     * Per-series "effective type" lookup — falls back to the
     * global `options.type()` when the series omits its own.
     */
    const effectiveType = (series: IChartSeries): TChartType =>
        series.type ?? options.type()

    /**
     * Per-series, per-data-index stacked offset. Bar / column
     * charts use this when `stacked = true` to slide the rect up
     * by the cumulative height of the previous visible series.
     *
     * In `'percent'` mode offsets and rendered values are expressed
     * as percentage points (0–100) rather than raw data units, so
     * each column fills the full plot height (0 → 100 %).
     */
    const stackOffsets = computed<Map<number, Array<number>>>(() => {
        const offsets = new Map<number, Array<number>>()
        if (!options.stacked()) return offsets

        const isPercent = effectiveStacking.value === CHART_STACKING.PERCENT

        const visible = options.series()
            .map((s, i) => ({ s, i }))
            .filter(({ s }) => s.visible !== false)

        const length = Math.max(...visible.map(({ s }) => s.data.length), 0)

        if (isPercent) {
            for (let dataIdx = 0; dataIdx < length; dataIdx++) {
                let total = 0
                for (const { s } of visible) {
                    const entry = s.data[dataIdx]
                    const y = typeof entry === 'number' ? entry : entry?.y ?? 0
                    if (y > 0) total += y
                }
                const safeTot = total || 1
                let runningPct = 0
                for (const { s, i } of visible) {
                    const entry = s.data[dataIdx]
                    const y = typeof entry === 'number' ? entry : entry?.y ?? 0
                    if (!offsets.has(i)) offsets.set(i, [])
                    offsets.get(i)![dataIdx] = runningPct
                    if (y > 0) runningPct += (y / safeTot) * CHART_PERCENT_MAX
                }
            }
        } else {
            for (let dataIdx = 0; dataIdx < length; dataIdx++) {
                let runningPositive = 0
                let runningNegative = 0
                for (const { s, i } of visible) {
                    const entry = s.data[dataIdx]
                    const y = typeof entry === 'number' ? entry : entry?.y ?? 0
                    if (!offsets.has(i)) offsets.set(i, [])
                    offsets.get(i)![dataIdx] = y >= 0 ? runningPositive : runningNegative
                    if (y >= 0) runningPositive += y
                    else runningNegative += y
                }
            }
        }
        return offsets
    })

    /**
     * Per-series, per-data-index percentage of the column total.
     * Populated only when `stacking='percent'`. Used by the tooltip
     * to show the share alongside the raw value.
     */
    const percentValues = computed<Map<number, Array<number>>>(() => {
        const pctMap = new Map<number, Array<number>>()
        if (!options.stacked() || effectiveStacking.value !== CHART_STACKING.PERCENT) return pctMap

        const visible = options.series()
            .map((s, i) => ({ s, i }))
            .filter(({ s }) => s.visible !== false)

        const length = Math.max(...visible.map(({ s }) => s.data.length), 0)
        for (let dataIdx = 0; dataIdx < length; dataIdx++) {
            let total = 0
            for (const { s } of visible) {
                const entry = s.data[dataIdx]
                const y = typeof entry === 'number' ? entry : entry?.y ?? 0
                if (y > 0) total += y
            }
            const safeTot = total || 1
            for (const { s, i } of visible) {
                const entry = s.data[dataIdx]
                const y = typeof entry === 'number' ? entry : entry?.y ?? 0
                if (!pctMap.has(i)) pctMap.set(i, [])
                pctMap.get(i)![dataIdx] = y > 0 ? (y / safeTot) * CHART_PERCENT_MAX : 0
            }
        }
        return pctMap
    })

    /**
     * Heart of the engine. One render descriptor per visible
     * series (or per data point for charts that emit one shape
     * per value).
     */
    const paths: ComputedRef<Array<IChartPath>> = computed(() => {
        const out: Array<IChartPath> = []
        const series = options.series()
        const cats = categories.value
        const { x0, x1, y0, y1, cx, cy } = plot.value
        const smoothing = options.smoothing()

        const pieSeriesList = series.filter((s) => effectiveType(s) === CHART_TYPE.PIE || effectiveType(s) === CHART_TYPE.DONUT)
        if (pieSeriesList.length > 0) {
            /*
             * Pie / donut path generator. Two rendering modes:
             *
             *   1. **Single series → classic pie / donut** — one series
             *      with N data points produces N slices, one per data
             *      point. Categories drive the slice colours so the
             *      legend can address each slice by its X label.
             *
             *   2. **Multi-series → concentric rings** — each series
             *      becomes its own ring, stacked from the centre out:
             *      series[0] = innermost band, series[N-1] = outermost.
             *      Inside each ring, the same `categories` drive the
             *      angular partitioning so a given category occupies
             *      the SAME colour across all rings. Each ring's
             *      angular sweep is proportional to its OWN series
             *      total, so the user can compare distribution shapes
             *      at a glance.
             *
             * For donut, the global `innerR = outerR * donutHoleSize`
             * is preserved (central hole). The remaining annulus
             * `[innerR..outerR]` is divided into N equal bands.
             */
            const outerR = Math.max(
                CHART_PIE_MIN_RADIUS,
                Math.min(x1 - x0, y1 - y0) / 2 - CHART_PIE_RADIUS_INSET
            )
            const isDonut = effectiveType(pieSeriesList[0]) === CHART_TYPE.DONUT
            const baseInner = isDonut ? outerR * options.donutHoleSize() : 0
            const scheme = options.colorScheme().length ? options.colorScheme() : CHART_DEFAULT_PALETTE
            const visibleSeries = pieSeriesList.filter((s) => s.visible !== false)

            if (visibleSeries.length === 0) return out

            const bandThickness = (outerR - baseInner) / visibleSeries.length
            const hidden = options.hiddenLabels?.() ?? new Set<string>()
            const cats = options.categories()
            const isSingleRing = visibleSeries.length === 1

            // Single source of truth for category colours — categories
            // across rings share the colour so the user instantly sees
            // which slice corresponds to which category at every depth.
            const categoryColor = (dataIdx: number, fallbackSeries: IChartSeries): string => {
                if (fallbackSeries.color) return resolveColor(fallbackSeries.color)
                return resolveColor(scheme[dataIdx % scheme.length])
            }

            const labelFor = (i: number, entry: number | { x: number | string, y: number } | undefined): string => {
                if (cats[i] != null) return String(cats[i])
                if (entry != null && typeof entry === 'object') return String(entry.x)
                return `${ CHART_SLICE_LABEL_PREFIX } ${ i + 1 }`
            }

            for (let ringIdx = 0; ringIdx < visibleSeries.length; ringIdx++) {
                const s = visibleSeries[ringIdx]
                const ringInner = baseInner + bandThickness * ringIdx
                const ringOuter = baseInner + bandThickness * (ringIdx + 1)

                const data = s.data as Array<number | { x: number | string, y: number }>

                // Compute ring total AFTER skipping per-label hidden slices
                // — only relevant for the single-ring mode where the
                // legend addresses slices by category name. In multi-ring
                // mode the legend addresses entire rings (series.visible
                // already filtered them above), so `hidden` only matters
                // for the single-ring case.
                const ringTotal = data.reduce<number>((acc, entry, i) => {
                    if (isSingleRing && hidden.has(labelFor(i, entry))) return acc
                    const v = typeof entry === 'number' ? entry : (entry?.y ?? 0)
                    return acc + (Number.isFinite(v) && v > 0 ? v : 0)
                }, 0)
                if (ringTotal === 0) continue

                let angle = 0
                for (let i = 0; i < data.length; i++) {
                    const entry = data[i]
                    if (isSingleRing && hidden.has(labelFor(i, entry))) continue
                    const v = typeof entry === 'number' ? entry : (entry?.y ?? 0)
                    if (!Number.isFinite(v) || v <= 0) continue
                    const sweep = (v / ringTotal) * Math.PI * 2
                    const endAngle = angle + sweep
                    out.push({
                        seriesIndex: series.indexOf(s),
                        kind: 'path',
                        d: arcPath(cx, cy, ringOuter, ringInner, angle, endAngle),
                        color: categoryColor(i, s),
                        series: s,
                        dataIndex: i
                    })
                    angle = endAngle
                }
            }
            return out
        }

        // Cartesian / radar generators.
        for (let seriesIdx = 0; seriesIdx < series.length; seriesIdx++) {
            const s = series[seriesIdx]
            if (s.visible === false) continue
            const color = colorFor(s, seriesIdx)
            const kind = effectiveType(s)
            const normalised = toPoints(s)

            // Resolve the Y-mapping function for this series.
            // Series assigned to axis 1 use the secondary right-hand scale;
            // all others project against the primary left scale.
            const seriesAxisIndex = s.yAxis ?? 0
            const yFn = seriesAxisIndex === 1 ? scaleY1.value : scales.value.y
            const seriesRange = seriesAxisIndex === 1 ? secondaryYRange.value : yRange.value
            const seriesBaseline = yFn(Math.max(0, seriesRange.min))

            if (
                kind === CHART_TYPE.LINE
                || kind === CHART_TYPE.AREA
                || kind === CHART_TYPE.SPLINE
                || kind === CHART_TYPE.STEPPED_LINE
            ) {
                const pts: Array<TPathPoint> = normalised.map((p) => [
                    scales.value.x(p.x, p.dataIndex, slotCount.value),
                    yFn(p.y)
                ])

                // Resolve the actual stroke generator per topology.
                // `spline` defaults to monotone smoothing unless the
                // consumer explicitly picks another mode. `stepped-line`
                // is its own topology (no smoothing applies).
                const effectiveSmoothing: TChartSmoothing =
                    kind === CHART_TYPE.SPLINE && smoothing === CHART_SMOOTHING.NONE
                        ? CHART_SMOOTHING.MONOTONE
                        : smoothing

                let dLine: string
                let areaMode: boolean | 'monotone' | 'stepped' = false
                if (kind === CHART_TYPE.STEPPED_LINE) {
                    dLine = steppedPath(pts)
                    areaMode = 'stepped'
                } else if (effectiveSmoothing === CHART_SMOOTHING.MONOTONE) {
                    dLine = monotonePath(pts)
                    areaMode = 'monotone'
                } else if (effectiveSmoothing === CHART_SMOOTHING.CURVE) {
                    dLine = smoothPath(pts)
                    areaMode = true
                } else {
                    dLine = linePath(pts)
                    areaMode = false
                }

                /*
             * Length policy per topology. The animation reveals the
             * stroke via `stroke-dasharray: length; dashoffset: length`
             * → 0, so under-counting the length truncates the visible
             * portion of the stroke (the stepped-line tail-cut bug).
             * `stepped-line` uses the Manhattan helper because its
             * `d` includes both horizontal AND vertical legs.
             */
            const length = kind === CHART_TYPE.STEPPED_LINE
                ? steppedPathLength(pts)
                : computePathLength(pts)

                if (kind === CHART_TYPE.AREA) {
                    out.push({
                        seriesIndex: seriesIdx,
                        kind: 'path',
                        d: areaPath(pts, seriesBaseline, areaMode),
                        color,
                        series: s,
                        pathLength: length,
                        variant: 'fill'
                    })
                }

                out.push({
                    seriesIndex: seriesIdx,
                    kind: 'path',
                    d: dLine,
                    color,
                    series: s,
                    pathLength: length,
                    variant: kind === CHART_TYPE.AREA ? 'stroke' : undefined
                })

                // Emit one descriptor per data point — `<circle>` markers
                // and the hover hit zones.
                {
                    for (let dataIdx = 0; dataIdx < pts.length; dataIdx++) {
                        out.push({
                            seriesIndex: seriesIdx,
                            kind: 'circle',
                            circle: {
                                cx: pts[dataIdx][0],
                                cy: pts[dataIdx][1],
                                r: CHART_POINT_MARKER_RADIUS
                            },
                            color,
                            series: s,
                            dataIndex: dataIdx
                        })
                    }
                }
                continue
            }

            if (kind === CHART_TYPE.BAR || kind === CHART_TYPE.COLUMN) {
                const visibleCount = series.filter((other) => other.visible !== false).length
                const groupCount = slotCount.value
                const slotPx = kind === CHART_TYPE.COLUMN
                    ? (x1 - x0) / Math.max(1, groupCount)
                    : (y1 - y0) / Math.max(1, groupCount)
                const stacked = options.stacked()
                const isPercent = stacked && effectiveStacking.value === CHART_STACKING.PERCENT
                const visibleIdxInGroup = series
                    .slice(0, seriesIdx)
                    .filter((other) => other.visible !== false).length
                const stackOff = stackOffsets.value.get(seriesIdx) ?? []

                // Horizontal-bar X scale: linear projection of the
                // numeric Y range onto the plot's X span. `yRange`
                // already absorbs `yMin`/`yMax` overrides + stacked
                // accumulation so we just normalise into [0..1].
                const horizRange = yRange.value
                const horizSpan = Math.max(CHART_EPSILON, horizRange.max - horizRange.min)
                const xValuePx = (v: number): number => {
                    const ratio = (v - horizRange.min) / horizSpan
                    const px = x0 + ratio * (x1 - x0)
                    if (px < x0) return x0
                    if (px > x1) return x1
                    return px
                }

                for (let dataIdx = 0; dataIdx < normalised.length; dataIdx++) {
                    const p = normalised[dataIdx]

                    // In percent mode, convert the raw data value to
                    // its percentage share of the column total at this
                    // data index. `stackOffsets` stores percent offsets
                    // so we must use matching percent units here.
                    const renderY = isPercent
                        ? (percentValues.value.get(seriesIdx)?.[dataIdx] ?? 0)
                        : p.y

                    if (kind === CHART_TYPE.COLUMN) {
                        /*
                         * Column slots use the "band" scale (each slot
                         * occupies `slotPx` of the plot, centred on its
                         * midpoint), NOT the edge-to-edge `idx / (slots-1)`
                         * mapping used by `scales.x` for line / scatter /
                         * spline. Without this the first column for
                         * `dataIdx=0` would be centred on `x0` (the Y-axis)
                         * and half of it would overflow to the LEFT of the
                         * axis — the user-reported "column over the axis"
                         * symptom on the leftmost (Jan) bar.
                         */
                        const centerX = x0 + (dataIdx + 0.5) * slotPx
                        const barWidth = stacked
                            ? slotPx * CHART_BAR_SLOT_FILL_RATIO
                            : (slotPx * CHART_BAR_SLOT_FILL_RATIO) / Math.max(1, visibleCount)
                        const left = stacked
                            ? centerX - barWidth / 2
                            : centerX - (slotPx * CHART_BAR_SLOT_FILL_RATIO) / 2 + visibleIdxInGroup * barWidth
                        const offset = stacked ? stackOff[dataIdx] ?? 0 : 0
                        const top = yFn(renderY + offset)
                        const base = yFn(offset)
                        out.push({
                            seriesIndex: seriesIdx,
                            kind: 'rect',
                            rect: {
                                x: left,
                                y: Math.min(top, base),
                                width: barWidth,
                                height: Math.abs(base - top)
                            },
                            color,
                            series: s,
                            dataIndex: dataIdx
                        })
                    } else {
                        // Horizontal bar — categorical axis runs along
                        // Y (top-to-bottom), value axis runs along X.
                        // Same "band" centring as column: slot centred
                        // on its midpoint, not on edge-to-edge spaced.
                        const slots = Math.max(1, groupCount)
                        const slotCenterY = slots === 1
                            ? (y0 + y1) / 2
                            : y0 + (dataIdx + 0.5) * slotPx
                        const barHeight = stacked
                            ? slotPx * CHART_BAR_SLOT_FILL_RATIO
                            : (slotPx * CHART_BAR_SLOT_FILL_RATIO) / Math.max(1, visibleCount)
                        const top = stacked
                            ? slotCenterY - barHeight / 2
                            : slotCenterY - (slotPx * CHART_BAR_SLOT_FILL_RATIO) / 2 + visibleIdxInGroup * barHeight
                        const offset = stacked ? stackOff[dataIdx] ?? 0 : 0
                        const rightPx = xValuePx(renderY + offset)
                        const basePx = xValuePx(offset)
                        out.push({
                            seriesIndex: seriesIdx,
                            kind: 'rect',
                            rect: {
                                x: Math.min(rightPx, basePx),
                                y: top,
                                width: Math.abs(rightPx - basePx),
                                height: barHeight
                            },
                            color,
                            series: s,
                            dataIndex: dataIdx
                        })
                    }
                }
                continue
            }

            if (kind === CHART_TYPE.SCATTER) {
                /*
                 * Scatter — (x, y) dots with optional `z` third
                 * dimension that drives the dot RADIUS (bubble-style
                 * variant of the standard scatter plot).
                 *
                 *   - X scale: linear projection of the data's X range
                 *     onto the plot. Pre-fix this routed through
                 *     `scales.x` which treats numeric values as
                 *     "0..count-1 indices into the slot grid", and
                 *     scatter X values can exceed the data count
                 *     freely. A series with `x: 13` over a 6-point
                 *     fixture landed at `13 / 5 = 2.6 × plotWidth` past
                 *     `x0` — outside the SVG. The local `xPx()` mapping
                 *     scopes the range to the actual data span across
                 *     ALL visible scatter series so cohorts share the
                 *     horizontal axis.
                 *
                 *   - Radius: if a point carries `z`, scale it linearly
                 *     into `[MIN_R..MAX_R]` from the global Z range
                 *     (across visible scatter series). When no point
                 *     in the chart has `z`, all dots keep the default
                 *     fixed radius — standard scatter behaviour.
                 */
                const scatterSeries = series.filter((other) => effectiveType(other) === CHART_TYPE.SCATTER && other.visible !== false)
                let xMin = Infinity
                let xMax = -Infinity
                let zMin = Infinity
                let zMax = -Infinity
                let hasZ = false
                for (const sp of scatterSeries) {
                    for (const entry of sp.data) {
                        const xv = typeof entry === 'number' ? entry : entry.x
                        const x = typeof xv === 'number' ? xv : 0
                        if (x < xMin) xMin = x
                        if (x > xMax) xMax = x
                        if (typeof entry !== 'number' && typeof entry.z === 'number' && Number.isFinite(entry.z)) {
                            hasZ = true
                            if (entry.z < zMin) zMin = entry.z
                            if (entry.z > zMax) zMax = entry.z
                        }
                    }
                }
                const xSpan = Math.max(CHART_EPSILON, xMax - xMin)
                const xPx = (v: number): number => {
                    const ratio = (v - xMin) / xSpan
                    const px = x0 + ratio * (x1 - x0)
                    if (px < x0) return x0
                    if (px > x1) return x1
                    return px
                }
                const zSpan = Math.max(CHART_EPSILON, zMax - zMin)
                const radiusFor = (z: number | undefined): number => {
                    if (!hasZ || typeof z !== 'number' || !Number.isFinite(z)) return CHART_SCATTER_DEFAULT_RADIUS
                    const ratio = zSpan === 0 ? 0.5 : (z - zMin) / zSpan
                    return CHART_SCATTER_MIN_RADIUS + ratio * (CHART_SCATTER_MAX_RADIUS - CHART_SCATTER_MIN_RADIUS)
                }

                for (let dataIdx = 0; dataIdx < normalised.length; dataIdx++) {
                    const p = normalised[dataIdx]
                    const cxRaw = typeof p.x === 'number' ? p.x : Number(p.x)
                    out.push({
                        seriesIndex: seriesIdx,
                        kind: 'circle',
                        circle: {
                            cx: xPx(Number.isFinite(cxRaw) ? cxRaw : 0),
                            cy: yFn(p.y),
                            r: radiusFor(p.z)
                        },
                        color,
                        series: s,
                        dataIndex: dataIdx
                    })
                }
                continue
            }

            if (kind === CHART_TYPE.RADAR) {
                const axes = Math.max(cats.length, normalised.length)
                if (!axes) continue
                const radius = Math.max(
                    CHART_RADAR_MIN_RADIUS,
                    Math.min(x1 - x0, y1 - y0) / 2 - CHART_RADAR_RADIUS_INSET
                )
                const pts: Array<TPathPoint> = normalised.map((p, i) => {
                    const yRangeSize = Math.max(CHART_EPSILON, yRange.value.max - yRange.value.min)
                    const ratio = (p.y - yRange.value.min) / yRangeSize
                    const angle = (i / axes) * Math.PI * 2
                    return polarToCartesian(cx, cy, radius * ratio, angle)
                })
                out.push({
                    seriesIndex: seriesIdx,
                    kind: 'polygon',
                    d: polygonPath(pts),
                    color,
                    series: s
                })
                // Point markers on each axis.
                for (let i = 0; i < pts.length; i++) {
                    out.push({
                        seriesIndex: seriesIdx,
                        kind: 'circle',
                        circle: { cx: pts[i][0], cy: pts[i][1], r: CHART_RADAR_MARKER_RADIUS },
                        color,
                        series: s,
                        dataIndex: i
                    })
                }
            }
        }

        return out
    })

    /**
     * Bridge between the rendered shape and the tooltip / event
     * pipeline. Components call this when a point gains hover or
     * focus; pass `null` on leave.
     */
    const onPointHover = (point: IChartPoint | null): void => {
        hover.value = point
    }

    return {
        viewBox,
        scales,
        ticks,
        secondaryTicks,
        paths,
        legend,
        hover,
        onPointHover,
        plot,
        yRange,
        secondaryYRange,
        slotCount,
        colorFor,
        effectiveType,
        effectiveStacking,
        percentValues
    }
}
