import { describe, expect, it } from 'vitest'

import type { IChartSecondaryYAxis, IChartSeries } from '@origam/interfaces'

import type { TChartSmoothing, TChartStacking, TChartType } from '@origam/types'

import { useChart } from '@origam/composables/Chart/chart.composable'

function makeOptions (overrides: Partial<{
    type: TChartType
    series: Array<IChartSeries>
    categories: Array<string>
    stacked: boolean
    stacking: TChartStacking
    smoothing: TChartSmoothing
    donutHoleSize: number
    yMin: number
    yMax: number
    secondaryYAxis: IChartSecondaryYAxis
}> = {}) {
    return {
        type: () => overrides.type ?? 'line',
        series: () => overrides.series ?? [],
        categories: () => overrides.categories ?? [],
        stacked: () => overrides.stacked ?? false,
        stacking: () => overrides.stacking ?? 'normal' as TChartStacking,
        smoothing: () => overrides.smoothing ?? 'none' as TChartSmoothing,
        donutHoleSize: () => overrides.donutHoleSize ?? 0,
        colorScheme: () => [],
        yMin: () => overrides.yMin,
        yMax: () => overrides.yMax,
        width: () => 400,
        height: () => 200,
        padding: () => ({ top: 20, right: 20, bottom: 30, left: 40 }),
        secondaryYAxis: overrides.secondaryYAxis ? () => overrides.secondaryYAxis : undefined
    }
}

describe('useChart — viewBox + scales', () => {
    it('formats the SVG viewBox as "0 0 W H"', () => {
        const chart = useChart(makeOptions())
        expect(chart.viewBox.value).toBe('0 0 400 200')
    })

    it('maps the smallest Y value to the bottom of the plot', () => {
        const chart = useChart(makeOptions({
            series: [{ name: 'A', data: [0, 10, 20] }]
        }))
        // Bottom of plot = height (200) - bottom padding (30) = 170
        expect(chart.scales.value.y(0)).toBe(170)
    })

    it('maps the largest Y value above the bottom of the plot', () => {
        const chart = useChart(makeOptions({
            series: [{ name: 'A', data: [0, 50, 100] }]
        }))
        const maxPx = chart.scales.value.y(100)
        expect(maxPx).toBeLessThan(170)
    })

    it('maps categorical X values to indexed positions', () => {
        const chart = useChart(makeOptions({
            categories: ['Jan', 'Feb', 'Mar'],
            series: [{ name: 'A', data: [1, 2, 3] }]
        }))
        const x0 = chart.scales.value.x('Jan', 0, 3)
        const xLast = chart.scales.value.x('Mar', 2, 3)
        expect(x0).toBeLessThan(xLast)
    })
})

describe('useChart — ticks', () => {
    it('emits Y ticks that span the data range', () => {
        const chart = useChart(makeOptions({
            series: [{ name: 'A', data: [0, 10, 20] }]
        }))
        const yTicks = chart.ticks.value.y
        expect(yTicks.length).toBeGreaterThan(2)
        expect(yTicks[0].value).toBeLessThanOrEqual(0)
        expect(yTicks[yTicks.length - 1].value).toBeGreaterThanOrEqual(20)
    })

    it('emits one X tick per category', () => {
        const chart = useChart(makeOptions({
            categories: ['A', 'B', 'C', 'D'],
            series: [{ name: 'S', data: [1, 2, 3, 4] }]
        }))
        expect(chart.ticks.value.x).toHaveLength(4)
    })
})

describe('useChart — paths (line)', () => {
    it('emits a path descriptor per visible line series', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B'],
            series: [
                { name: 'S1', data: [1, 2] },
                { name: 'S2', data: [3, 4] }
            ]
        }))
        const linePaths = chart.paths.value.filter((p) => p.kind === 'path')
        expect(linePaths.length).toBeGreaterThanOrEqual(2)
    })

    it('skips hidden series', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B'],
            series: [
                { name: 'S1', data: [1, 2] },
                { name: 'S2', data: [3, 4], visible: false }
            ]
        }))
        const series2Paths = chart.paths.value.filter((p) => p.series.name === 'S2')
        expect(series2Paths).toHaveLength(0)
    })

    it('line series paths have no variant set', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B'],
            series: [{ name: 'S', data: [1, 2] }]
        }))
        const linePaths = chart.paths.value.filter((p) => p.kind === 'path')
        for (const p of linePaths) {
            expect(p.variant).toBeUndefined()
        }
    })
})

describe('useChart — paths (area)', () => {
    it('emits two path descriptors per area series: a fill and a stroke', () => {
        const chart = useChart(makeOptions({
            type: 'area',
            categories: ['A', 'B', 'C'],
            series: [{ name: 'S', data: [1, 2, 3] }]
        }))
        const areaPaths = chart.paths.value.filter((p) => p.kind === 'path')
        expect(areaPaths.length).toBeGreaterThanOrEqual(2)
        const fillPaths = areaPaths.filter((p) => p.variant === 'fill')
        const strokePaths = areaPaths.filter((p) => p.variant === 'stroke')
        expect(fillPaths).toHaveLength(1)
        expect(strokePaths).toHaveLength(1)
    })

    it('fill path closes down to the baseline (contains Z)', () => {
        const chart = useChart(makeOptions({
            type: 'area',
            categories: ['A', 'B'],
            series: [{ name: 'S', data: [5, 10] }]
        }))
        const fillPath = chart.paths.value.find((p) => p.kind === 'path' && p.variant === 'fill')
        expect(fillPath?.d).toBeDefined()
        expect(fillPath!.d!.endsWith('Z')).toBe(true)
    })

    it('stroke path does not close (no trailing Z)', () => {
        const chart = useChart(makeOptions({
            type: 'area',
            categories: ['A', 'B'],
            series: [{ name: 'S', data: [5, 10] }]
        }))
        const strokePath = chart.paths.value.find((p) => p.kind === 'path' && p.variant === 'stroke')
        expect(strokePath?.d).toBeDefined()
        expect(strokePath!.d!.endsWith('Z')).toBe(false)
    })
})

describe('useChart — paths (pie/donut)', () => {
    it('emits one slice per data point for a pie', () => {
        const chart = useChart(makeOptions({
            type: 'pie',
            series: [{ name: 'S', data: [10, 20, 30], type: 'pie' }]
        }))
        expect(chart.paths.value).toHaveLength(3)
        for (const p of chart.paths.value) {
            expect(p.d).toContain('A')
        }
    })

    it('skips zero / negative values from the slice list', () => {
        const chart = useChart(makeOptions({
            type: 'pie',
            series: [{ name: 'S', data: [10, 0, 20, -5], type: 'pie' }]
        }))
        expect(chart.paths.value).toHaveLength(2)
    })

    it('donut paths contain two A commands per slice', () => {
        const chart = useChart(makeOptions({
            type: 'donut',
            donutHoleSize: 0.5,
            series: [{ name: 'S', data: [10, 20], type: 'donut' }]
        }))
        for (const p of chart.paths.value) {
            const arcs = (p.d?.match(/A/g) ?? []).length
            expect(arcs).toBe(2)
        }
    })
})

describe('useChart — paths (bar/column)', () => {
    it('emits one rect per data point for a column chart', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            categories: ['A', 'B', 'C'],
            series: [{ name: 'S', data: [10, 20, 30], type: 'column' }]
        }))
        const rects = chart.paths.value.filter((p) => p.kind === 'rect')
        expect(rects).toHaveLength(3)
    })

    it('stacks columns when stacked=true', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            categories: ['A', 'B'],
            series: [
                { name: 'S1', data: [10, 20], type: 'column' },
                { name: 'S2', data: [5, 15], type: 'column' }
            ]
        }))
        // The two rects at index 0 should share the same X but
        // stack vertically (different Y).
        const s1Rects = chart.paths.value.filter((p) => p.series.name === 'S1' && p.kind === 'rect')
        const s2Rects = chart.paths.value.filter((p) => p.series.name === 'S2' && p.kind === 'rect')
        expect(s1Rects).toHaveLength(2)
        expect(s2Rects).toHaveLength(2)
        // Different Y positions in stacked mode.
        expect(s1Rects[0].rect?.y).not.toBe(s2Rects[0].rect?.y)
    })
})

describe('useChart — paths (scatter / radar)', () => {
    it('emits one circle per data point for scatter', () => {
        const chart = useChart(makeOptions({
            type: 'scatter',
            series: [{
                name: 'S',
                data: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }],
                type: 'scatter'
            }]
        }))
        const circles = chart.paths.value.filter((p) => p.kind === 'circle')
        expect(circles).toHaveLength(3)
    })

    it('emits a polygon for radar', () => {
        const chart = useChart(makeOptions({
            type: 'radar',
            categories: ['speed', 'power', 'agility', 'stamina'],
            series: [{ name: 'S', data: [1, 2, 3, 4], type: 'radar' }]
        }))
        const polys = chart.paths.value.filter((p) => p.kind === 'polygon')
        expect(polys).toHaveLength(1)
    })
})

describe('useChart — paths (spline)', () => {
    it('emits a smooth path (contains C commands) for spline', () => {
        const chart = useChart(makeOptions({
            type: 'spline',
            categories: ['A', 'B', 'C', 'D'],
            series: [{ name: 'S', data: [1, 5, 2, 7] }]
        }))
        const splinePath = chart.paths.value.find((p) => p.kind === 'path')
        expect(splinePath?.d).toBeDefined()
        // Spline uses monotone curves -> at least one C command.
        expect(splinePath!.d).toContain('C')
    })

    it('honors explicit smoothing="curve" override on spline', () => {
        const chart = useChart(makeOptions({
            type: 'spline',
            smoothing: 'curve',
            categories: ['A', 'B', 'C'],
            series: [{ name: 'S', data: [1, 5, 2] }]
        }))
        const splinePath = chart.paths.value.find((p) => p.kind === 'path')
        // Still smooth, still contains C commands.
        expect(splinePath!.d).toContain('C')
    })
})

describe('useChart — paths (stepped-line)', () => {
    it('emits horizontal-then-vertical L segments per pair', () => {
        const chart = useChart(makeOptions({
            type: 'stepped-line',
            categories: ['A', 'B', 'C'],
            series: [{ name: 'S', data: [1, 5, 2] }]
        }))
        const stepPath = chart.paths.value.find((p) => p.kind === 'path')
        expect(stepPath?.d).toBeDefined()
        // No C commands in a stepped-line path.
        expect(stepPath!.d).not.toContain('C')
        // 3 points -> 4 L commands (2 per pair).
        const lCount = (stepPath!.d!.match(/L/g) ?? []).length
        expect(lCount).toBe(4)
    })

    it('still emits one circle marker per data point', () => {
        const chart = useChart(makeOptions({
            type: 'stepped-line',
            categories: ['A', 'B', 'C'],
            series: [{ name: 'S', data: [1, 5, 2] }]
        }))
        const circles = chart.paths.value.filter((p) => p.kind === 'circle')
        expect(circles).toHaveLength(3)
    })
})

describe('useChart — combination (per-series type override)', () => {
    it('renders mixed primitives when each series sets its own `type`', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            categories: ['Jan', 'Feb', 'Mar'],
            series: [
                { name: 'Volume', data: [10, 20, 30], type: 'column' },
                { name: 'Trend', data: [15, 22, 28], type: 'line' }
            ]
        }))
        const rects = chart.paths.value.filter((p) => p.kind === 'rect')
        const paths = chart.paths.value.filter((p) => p.kind === 'path')
        const circles = chart.paths.value.filter((p) => p.kind === 'circle')

        // Column series emits N rects (one per data point).
        expect(rects).toHaveLength(3)
        // Line series emits 1 path (the polyline).
        expect(paths.length).toBeGreaterThanOrEqual(1)
        // Line series emits N circle markers.
        expect(circles.length).toBeGreaterThanOrEqual(3)
    })

    it('series-level `type` wins over the chart-level `type`', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            categories: ['A', 'B'],
            series: [
                // Chart says 'column' but this series overrides to 'line'.
                { name: 'OnlyLine', data: [1, 2], type: 'line' }
            ]
        }))
        const rects = chart.paths.value.filter((p) => p.kind === 'rect')
        const paths = chart.paths.value.filter((p) => p.kind === 'path')
        // No rect should be emitted — the only series asks for line.
        expect(rects).toHaveLength(0)
        expect(paths.length).toBeGreaterThanOrEqual(1)
    })
})

describe('useChart — legend + hover', () => {
    it('emits one legend entry per series', () => {
        const chart = useChart(makeOptions({
            series: [
                { name: 'A', data: [1] },
                { name: 'B', data: [2] },
                { name: 'C', data: [3] }
            ]
        }))
        expect(chart.legend.value).toHaveLength(3)
    })

    it('reflects visibility in the legend', () => {
        const chart = useChart(makeOptions({
            series: [
                { name: 'A', data: [1] },
                { name: 'B', data: [2], visible: false }
            ]
        }))
        expect(chart.legend.value[0].visible).toBe(true)
        expect(chart.legend.value[1].visible).toBe(false)
    })

    it('updates hover via onPointHover', () => {
        const chart = useChart(makeOptions())
        expect(chart.hover.value).toBeNull()
        chart.onPointHover({
            seriesIndex: 0,
            seriesName: 'S',
            dataIndex: 0,
            x: 'A',
            y: 10,
            color: '#000'
        })
        expect(chart.hover.value).not.toBeNull()
        chart.onPointHover(null)
        expect(chart.hover.value).toBeNull()
    })
})

describe('useChart — stacking=percent mode', () => {
    const PERCENT_SERIES: Array<IChartSeries> = [
        { name: 'S1', data: [30, 20], type: 'column' },
        { name: 'S2', data: [20, 60], type: 'column' },
        { name: 'S3', data: [50, 20], type: 'column' }
    ]

    it('yRange is fixed at 0–100 in percent mode', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            stacking: 'percent',
            categories: ['A', 'B'],
            series: PERCENT_SERIES
        }))
        expect(chart.yRange.value.min).toBe(0)
        expect(chart.yRange.value.max).toBe(100)
    })

    it('percentValues totals to 100 per X index', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            stacking: 'percent',
            categories: ['A', 'B'],
            series: PERCENT_SERIES
        }))
        const pctMap = chart.percentValues.value
        const NUM_SERIES = PERCENT_SERIES.length
        for (let dataIdx = 0; dataIdx < 2; dataIdx++) {
            let total = 0
            for (let si = 0; si < NUM_SERIES; si++) {
                total += pctMap.get(si)?.[dataIdx] ?? 0
            }
            expect(total).toBeCloseTo(100, 5)
        }
    })

    it('Y-axis ticks are fixed at 0, 25, 50, 75, 100 in percent mode', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            stacking: 'percent',
            categories: ['A', 'B'],
            series: PERCENT_SERIES
        }))
        const yTicks = chart.ticks.value.y
        const tickValues = yTicks.map((t) => t.value)
        expect(tickValues).toEqual([0, 25, 50, 75, 100])
    })

    it('Y-axis tick labels use % suffix in percent mode', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            stacking: 'percent',
            categories: ['A', 'B'],
            series: PERCENT_SERIES
        }))
        const yTicks = chart.ticks.value.y
        for (const tick of yTicks) {
            expect(tick.label).toMatch(/%$/)
        }
    })

    it('effectiveStacking returns percent when stacking=percent', () => {
        const chart = useChart(makeOptions({
            stacked: true,
            stacking: 'percent'
        }))
        expect(chart.effectiveStacking.value).toBe('percent')
    })

    it('effectiveStacking defaults to normal when stacking omitted', () => {
        const chart = useChart(makeOptions({ stacked: true }))
        expect(chart.effectiveStacking.value).toBe('normal')
    })

    it('normal stacking keeps yRange based on raw stack totals', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            stacking: 'normal',
            categories: ['A', 'B'],
            series: PERCENT_SERIES
        }))
        expect(chart.yRange.value.max).toBe(100)
        expect(chart.yRange.value.min).toBe(0)
    })

    it('column rects in percent mode all share the full plot height', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            stacking: 'percent',
            categories: ['A'],
            series: [
                { name: 'S1', data: [25], type: 'column' },
                { name: 'S2', data: [75], type: 'column' }
            ]
        }))
        const rects = chart.paths.value.filter((p) => p.kind === 'rect')
        const totalHeight = rects.reduce((acc, r) => acc + (r.rect?.height ?? 0), 0)
        const plotHeight = 200 - 20 - 30
        expect(totalHeight).toBeCloseTo(plotHeight, 0)
    })

    it('percentValues is empty when stacking=normal', () => {
        const chart = useChart(makeOptions({
            type: 'column',
            stacked: true,
            stacking: 'normal',
            categories: ['A', 'B'],
            series: PERCENT_SERIES
        }))
        expect(chart.percentValues.value.size).toBe(0)
    })
})

describe('useChart — secondary Y axis (dual scale)', () => {
    const DUAL_SERIES = [
        { name: 'Temperature', data: [5, 10, 20, 23], yAxis: 0 as 0 | 1 },
        { name: 'Rainfall', data: [100, 80, 50, 30], yAxis: 1 as 0 | 1, type: 'column' as const }
    ]

    it('secondaryYRange is computed only from yAxis===1 series', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B', 'C', 'D'],
            series: DUAL_SERIES,
            secondaryYAxis: { min: 0, max: 150 }
        }))
        expect(chart.secondaryYRange.value.min).toBe(0)
        expect(chart.secondaryYRange.value.max).toBe(150)
    })

    it('primary yRange excludes yAxis===1 series', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B', 'C', 'D'],
            series: DUAL_SERIES
        }))
        expect(chart.yRange.value.max).toBeLessThanOrEqual(25)
        expect(chart.yRange.value.max).toBeGreaterThan(0)
    })

    it('secondaryTicks is non-empty when axis-1 series exist', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B', 'C', 'D'],
            series: DUAL_SERIES,
            secondaryYAxis: { min: 0, max: 150 }
        }))
        expect(chart.secondaryTicks.value.length).toBeGreaterThan(0)
    })

    it('secondaryTicks is empty when no series use yAxis===1', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B'],
            series: [{ name: 'S', data: [1, 2] }]
        }))
        expect(chart.secondaryTicks.value).toHaveLength(0)
    })

    it('axis-0 and axis-1 line series project to different Y pixel ranges', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['Jan', 'Feb', 'Mar', 'Apr'],
            series: DUAL_SERIES,
            secondaryYAxis: { min: 0, max: 150 }
        }))
        const tempPaths = chart.paths.value.filter(
            (p) => p.series.name === 'Temperature' && p.kind === 'circle'
        )
        const rainPaths = chart.paths.value.filter(
            (p) => p.series.name === 'Rainfall' && p.kind === 'rect'
        )

        // temperature max (23) on left axis [0..25 approx] should NOT
        // pixel-match rainfall max (100) on right axis [0..150].
        // If they mapped to the same scale they would produce identical cy/y values.
        const tempTopY = Math.min(...tempPaths.map((p) => p.circle!.cy))
        const rainTopY = Math.min(...rainPaths.map((p) => p.rect!.y))

        // Both are inside the plot but at different pixel heights
        expect(tempTopY).not.toBeCloseTo(rainTopY, 0)
    })

    it('secondaryTicks respect explicit min/max overrides', () => {
        const chart = useChart(makeOptions({
            type: 'line',
            categories: ['A', 'B'],
            series: [{ name: 'Rain', data: [10, 20], yAxis: 1 }],
            secondaryYAxis: { min: 0, max: 200 }
        }))
        const ticks = chart.secondaryTicks.value
        const tickValues = ticks.map((t) => Number(t.value))
        expect(Math.min(...tickValues)).toBeGreaterThanOrEqual(0)
        expect(Math.max(...tickValues)).toBeLessThanOrEqual(200)
    })
})

import {
    computeAnnotationGeometry,
    computePlotBandGeometry,
    computePlotLineGeometry
} from '@origam/composables/Chart/chart.composable'

const PLOT_CATS = ['Jan', 'Feb', 'Mar', 'Jun']
const PLOT_X0 = 40
const PLOT_X1 = 360
const PLOT_Y0 = 20
const PLOT_Y1 = 170

const makePlotScales = () => ({
    x: (v: number | string): number => {
        const idx = typeof v === 'string' ? PLOT_CATS.indexOf(v) : Number(v)
        const slots = PLOT_CATS.length
        return PLOT_X0 + (idx / (slots - 1)) * (PLOT_X1 - PLOT_X0)
    },
    y: (v: number): number => {
        return PLOT_Y1 - ((v / 60) * (PLOT_Y1 - PLOT_Y0))
    }
})

describe('computePlotBandGeometry — Y-axis bands', () => {
    const scales = makePlotScales()

    it('returns a rect spanning full plot width for a Y-axis band', () => {
        const geo = computePlotBandGeometry(
            { axis: 'y', from: 20, to: 40, color: 'success', opacity: 0.15 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo).not.toBeNull()
        expect(geo!.x).toBe(PLOT_X0)
        expect(geo!.width).toBe(PLOT_X1 - PLOT_X0)
        expect(geo!.height).toBeGreaterThan(0)
    })

    it('top of band is above the bottom for from < to in axis units', () => {
        const geo = computePlotBandGeometry(
            { axis: 'y', from: 10, to: 30 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo).not.toBeNull()
        expect(geo!.y + geo!.height).toBeGreaterThan(geo!.y)
    })

    it('returns null when band is entirely above the plot (values > yMax)', () => {
        const geo = computePlotBandGeometry(
            { axis: 'y', from: 70, to: 90 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo).toBeNull()
    })

    it('correctly places the label centre inside the band', () => {
        const geo = computePlotBandGeometry(
            { axis: 'y', from: 20, to: 40, label: 'Target' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.label).toBe('Target')
        expect(geo!.labelX).toBe((PLOT_X0 + PLOT_X1) / 2)
        expect(geo!.labelY).toBeCloseTo(geo!.y + geo!.height / 2, 1)
    })

    it('resolves intent color string to a CSS var expression for fill', () => {
        const geo = computePlotBandGeometry(
            { axis: 'y', from: 10, to: 20, color: 'danger' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.fill).toContain('var(')
    })

    it('uses default opacity 0.15 when not specified', () => {
        const geo = computePlotBandGeometry(
            { axis: 'y', from: 10, to: 20 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.opacity).toBe(0.15)
    })

    it('respects custom opacity', () => {
        const geo = computePlotBandGeometry(
            { axis: 'y', from: 10, to: 20, opacity: 0.4 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.opacity).toBe(0.4)
    })
})

describe('computePlotBandGeometry — X-axis bands', () => {
    const scales = makePlotScales()

    it('returns a rect spanning full plot height for an X-axis band', () => {
        const geo = computePlotBandGeometry(
            { axis: 'x', from: 'Jan', to: 'Feb' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo).not.toBeNull()
        expect(geo!.y).toBe(PLOT_Y0)
        expect(geo!.height).toBe(PLOT_Y1 - PLOT_Y0)
        expect(geo!.width).toBeGreaterThan(0)
    })

    it('Jan–Mar band is wider than Jan–Feb band', () => {
        const geo12 = computePlotBandGeometry(
            { axis: 'x', from: 'Jan', to: 'Feb' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        const geo13 = computePlotBandGeometry(
            { axis: 'x', from: 'Jan', to: 'Mar' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo13!.width).toBeGreaterThan(geo12!.width)
    })
})

describe('computePlotLineGeometry — Y-axis lines', () => {
    const scales = makePlotScales()

    it('returns a horizontal line across the full plot width', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 30 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo).not.toBeNull()
        expect(geo!.x1).toBe(PLOT_X0)
        expect(geo!.x2).toBe(PLOT_X1)
        expect(geo!.y1).toBe(geo!.y2)
    })

    it('returns null when the Y value maps outside the plot', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 999 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo).toBeNull()
    })

    it('solid dash resolves to "none"', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 30, dash: 'solid' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.strokeDasharray).toBe('none')
    })

    it('dashed dash resolves to a non-empty pattern', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 30, dash: 'dashed' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.strokeDasharray).not.toBe('none')
        expect(geo!.strokeDasharray.length).toBeGreaterThan(0)
    })

    it('dotted and dashed produce different patterns', () => {
        const geoDashed = computePlotLineGeometry(
            { axis: 'y', value: 30, dash: 'dashed' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        const geoDotted = computePlotLineGeometry(
            { axis: 'y', value: 30, dash: 'dotted' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geoDashed!.strokeDasharray).not.toBe(geoDotted!.strokeDasharray)
    })

    it('labelAlign=right places label at right edge', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 30, label: 'Avg', labelAlign: 'right' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.labelX).toBe(PLOT_X1)
        expect(geo!.labelAnchor).toBe('end')
    })

    it('labelAlign=left places label at left edge', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 30, label: 'Avg', labelAlign: 'left' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.labelX).toBe(PLOT_X0)
        expect(geo!.labelAnchor).toBe('start')
    })

    it('default stroke width is 1.5', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 30 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.strokeWidth).toBe(1.5)
    })

    it('custom stroke width is respected', () => {
        const geo = computePlotLineGeometry(
            { axis: 'y', value: 30, width: 3 },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo!.strokeWidth).toBe(3)
    })
})

describe('computePlotLineGeometry — X-axis lines', () => {
    const scales = makePlotScales()

    it('returns a vertical line across the full plot height', () => {
        const geo = computePlotLineGeometry(
            { axis: 'x', value: 'Jun' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(geo).not.toBeNull()
        expect(geo!.y1).toBe(PLOT_Y0)
        expect(geo!.y2).toBe(PLOT_Y1)
        expect(geo!.x1).toBe(geo!.x2)
    })

    it('resolves the correct pixel X: Jun > Jan', () => {
        const junGeo = computePlotLineGeometry(
            { axis: 'x', value: 'Jun' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        const janGeo = computePlotLineGeometry(
            { axis: 'x', value: 'Jan' },
            scales, PLOT_CATS, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1
        )
        expect(junGeo!.x1).toBeGreaterThan(janGeo!.x1)
    })
})

describe('computeAnnotationGeometry', () => {
    const cats = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const categoryCount = cats.length

    const scales = {
        x: (v: number | string, dataIndex?: number, _catCount?: number): number => {
            const idx = typeof v === 'string' ? cats.indexOf(v) : (dataIndex ?? Number(v))
            const slots = cats.length
            return PLOT_X0 + (idx / (slots - 1)) * (PLOT_X1 - PLOT_X0)
        },
        y: (v: number): number => {
            return PLOT_Y1 - ((v / 60) * (PLOT_Y1 - PLOT_Y0))
        }
    }

    it('returns null for an unresolvable x coordinate', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'arrow', x: NaN as unknown as number, y: 20 },
            scales, cats, categoryCount
        )
        expect(geo).toBeNull()
    })

    it('arrow — ax/ay map to the tail data coordinate', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'arrow', x: 'Jan', y: 0, x2: 'Dec', y2: 60, color: 'primary', width: 2 },
            scales, cats, categoryCount
        )
        expect(geo).not.toBeNull()
        expect(geo!.kind).toBe('arrow')
        expect(geo!.ax).toBe(PLOT_X0)
        expect(geo!.bx).toBeCloseTo(PLOT_X1, 0)
    })

    it('arrow — arrowPoints is a non-empty string', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'arrow', x: 'Jan', y: 10, x2: 'Jun', y2: 30 },
            scales, cats, categoryCount
        )
        expect(typeof geo!.arrowPoints).toBe('string')
        expect(geo!.arrowPoints!.length).toBeGreaterThan(0)
    })

    it('arrow — head is to the right of tail when x2 > x', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'arrow', x: 'Jan', y: 10, x2: 'Jun', y2: 30 },
            scales, cats, categoryCount
        )
        expect(geo!.bx).toBeGreaterThan(geo!.ax)
    })

    it('label — callout and leaderEnd are populated', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'label', x: 'Mar', y: 22, text: 'Launch', color: 'primary' },
            scales, cats, categoryCount
        )
        expect(geo).not.toBeNull()
        expect(geo!.callout).toBeDefined()
        expect(geo!.leaderEnd).toBeDefined()
        expect(geo!.callout!.width).toBeGreaterThan(0)
        expect(geo!.callout!.height).toBeGreaterThan(0)
    })

    it('label — callout box is wider for longer text', () => {
        const short = computeAnnotationGeometry(
            { kind: 'label', x: 'Mar', y: 22, text: 'Hi' },
            scales, cats, categoryCount
        )
        const long = computeAnnotationGeometry(
            { kind: 'label', x: 'Mar', y: 22, text: 'A very long annotation label text' },
            scales, cats, categoryCount
        )
        expect(long!.callout!.width).toBeGreaterThan(short!.callout!.width)
    })

    it('circle — radius defaults to 12', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'circle', x: 'Jul', y: 28 },
            scales, cats, categoryCount
        )
        expect(geo!.radius).toBe(12)
    })

    it('circle — custom radius is preserved', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'circle', x: 'Jul', y: 28, radius: 20 },
            scales, cats, categoryCount
        )
        expect(geo!.radius).toBe(20)
    })

    it('circle — ax/ay are centred on the data point', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'circle', x: 'Jan', y: 0 },
            scales, cats, categoryCount
        )
        expect(geo!.ax).toBe(PLOT_X0)
        expect(geo!.ay).toBe(PLOT_Y1)
    })

    it('bracket — ax maps to left, bx to right', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'bracket', x: 'Jan', y: 36, x2: 'Jun', y2: 36 },
            scales, cats, categoryCount
        )
        expect(geo!.ax).toBeLessThan(geo!.bx)
    })

    it('bracket — stroke colour resolves from intent', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'bracket', x: 'Jan', y: 36, x2: 'Jun', y2: 36, color: 'success' },
            scales, cats, categoryCount
        )
        expect(geo!.stroke).toMatch(/var\(--origam/)
    })

    it('default dx is 0 and dy is -14 when not specified', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'circle', x: 'Jan', y: 0 },
            scales, cats, categoryCount
        )
        expect(geo!.dx).toBe(0)
        expect(geo!.dy).toBe(-14)
    })

    it('custom dx/dy override defaults', () => {
        const geo = computeAnnotationGeometry(
            { kind: 'circle', x: 'Jan', y: 0, dx: 10, dy: -30 },
            scales, cats, categoryCount
        )
        expect(geo!.dx).toBe(10)
        expect(geo!.dy).toBe(-30)
    })
})
