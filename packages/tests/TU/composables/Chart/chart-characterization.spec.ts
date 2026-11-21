import { describe, expect, it } from 'vitest'

import type { IChartSeries } from '@origam/interfaces'
import type { TChartSmoothing, TChartStacking, TChartType } from '@origam/types'

import { useChart } from '@origam/composables/Chart/chart.composable'

/*
 * Characterisation (#1398) — pins the full output of `paths`, `yRange`,
 * `secondaryYRange`, `percentValues` and `ticks` over a matrix of types ×
 * stacking × smoothing × datasets, so refactors of the engine that only
 * reduce its cognitive complexity cannot move a pixel unnoticed.
 */
const TYPES: Array<TChartType> = [
    'line', 'area', 'spline', 'stepped-line', 'bar', 'column', 'scatter', 'radar', 'pie', 'donut'
]

const DATASETS: Record<string, { series: Array<IChartSeries>, categories: Array<string> }> = {
    positive: {
        series: [
            { name: 'A', data: [3, 7, 2, 9, 5] },
            { name: 'B', data: [4, 1, 6, 2, 8], color: 'danger' }
        ],
        categories: ['a', 'b', 'c', 'd', 'e']
    },
    signed: {
        series: [
            { name: 'A', data: [4, -3, 6, -2, 8] },
            { name: 'B', data: [-1, 5, -4, 3, 0] },
            { name: 'C', data: [2, 2, 2], visible: false }
        ],
        categories: []
    },
    points: {
        series: [
            { name: 'P', data: [{ x: 1, y: 2, z: 5 }, { x: 13, y: 4, z: 20 }, { x: 4, y: 9 }, { x: 'k', y: 1 }] },
            { name: 'Q', data: [3, 4, 5] }
        ],
        categories: ['x', 'y']
    },
    secondary: {
        series: [
            { name: 'L', data: [1, 2, 3, 4] },
            { name: 'R', data: [100, 300, 200, 400], yAxis: 1 }
        ],
        categories: ['q1', 'q2', 'q3', 'q4']
    },
    degenerate: {
        series: [{ name: 'Z', data: [0, 0, 0] }, { name: 'E', data: [] }],
        categories: []
    },
    empty: { series: [], categories: [] }
}

const STACKINGS: Array<[boolean, TChartStacking]> = [[false, 'normal'], [true, 'normal'], [true, 'percent']]
const SMOOTHINGS: Array<TChartSmoothing> = ['none', 'monotone', 'curve']

const toPlain = (chart: ReturnType<typeof useChart>) => ({
    paths: chart.paths.value,
    yRange: chart.yRange.value,
    secondaryYRange: chart.secondaryYRange.value,
    percentValues: [...chart.percentValues.value.entries()],
    ticks: chart.ticks.value,
    secondaryTicks: chart.secondaryTicks.value
})

describe('useChart — characterisation matrix (#1398)', () => {
    for (const [dsName, ds] of Object.entries(DATASETS)) {
        for (const type of TYPES) {
            for (const [stacked, stacking] of STACKINGS) {
                for (const smoothing of SMOOTHINGS) {
                    // Smoothing only matters to the line family.
                    if (smoothing !== 'none' && !['line', 'area', 'spline'].includes(type)) continue
                    // Stacking only matters to bar / column / area-ish ranges.
                    if (stacked && !['bar', 'column', 'line', 'area'].includes(type)) continue

                    it(`${dsName} / ${type} / stacked=${stacked}:${stacking} / ${smoothing}`, () => {
                        const chart = useChart({
                            type: () => type,
                            series: () => ds.series,
                            categories: () => ds.categories,
                            stacked: () => stacked,
                            stacking: () => stacking,
                            donutHoleSize: () => 0.5,
                            colorScheme: () => [],
                            smoothing: () => smoothing,
                            yMin: () => undefined,
                            yMax: () => undefined,
                            width: () => 400,
                            height: () => 240,
                            padding: () => ({ top: 20, right: 40, bottom: 30, left: 40 }),
                            hiddenLabels: () => new Set(['b']),
                            secondaryYAxis: () => ({ min: 0, max: 500 })
                        })

                        expect(toPlain(chart)).toMatchSnapshot()
                    })
                }
            }
        }
    }

    it('honours yMin / yMax overrides', () => {
        for (const stacked of [false, true]) {
            const chart = useChart({
                type: () => 'column',
                series: () => DATASETS.signed.series,
                categories: () => [],
                stacked: () => stacked,
                donutHoleSize: () => 0,
                colorScheme: () => ['primary', '#ff0000'],
                smoothing: () => 'none',
                yMin: () => -10,
                yMax: () => 20,
                width: () => 300,
                height: () => 200,
                padding: () => ({ top: 10, right: 10, bottom: 10, left: 10 })
            })
            expect(toPlain(chart)).toMatchSnapshot()
        }
    })
})
