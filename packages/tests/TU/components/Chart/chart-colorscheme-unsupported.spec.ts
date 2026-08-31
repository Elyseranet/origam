// #426 — `colorScheme` (inherited from `IChartBaseProps`) is exposed on
// every chart component, but has genuinely NO rendering effect on four of
// them, each for a different reason:
//
//   - OrigamChartBullet      — uniform bar fill (`barColor`) + a dedicated
//                               range palette (`rangeColors`); no per-series
//                               identity a rotating palette could drive.
//   - OrigamChartCandlestick — binary colour model (`bullishColor` /
//                               `bearishColor`).
//   - OrigamChartHeatmap     — continuous two-stop gradient (`colorRange`).
//   - OrigamChartMap         — continuous gradient (choropleth) or a single
//                               `lineColor` (flight-routes); same story.
//
// Population measured by grepping every `OrigamChart*.vue` for `colorScheme`
// (21 files declare it) and checking, file by file, whether `props.colorScheme`
// is actually READ anywhere beyond the `withDefaults()` default. 16 of the 20
// per-type components DO consume it (verified separately — Cartesian / Radar
// / Polar via `useChart`; BoxPlot, Gauge, Honeycomb, Pareto, Pictorial,
// PolarBar, Pyramid, Sankey, Streamgraph, Sunburst, Treemap, Variwide,
// WordCloud each read `props.colorScheme` directly). These 4 do not.
//
// Per the #426 decision: neither wire a fake behaviour (nothing spec'd —
// there's no "rotating palette on a 2-colour model" design) nor remove the
// prop (breaking change) — document + warn once in dev builds instead
// (`useChartUnsupportedProp` → `warnUnsupportedProp`, see
// `chart-prop-warning.composable.spec.ts` for the mechanism itself).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartBullet from '@origam/components/Chart/OrigamChartBullet.vue'
import OrigamChartCandlestick from '@origam/components/Chart/OrigamChartCandlestick.vue'
import OrigamChartHeatmap from '@origam/components/Chart/OrigamChartHeatmap.vue'
import OrigamChartMap from '@origam/components/Chart/OrigamChartMap.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

class ObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('ResizeObserver', ObserverMock)
vi.stubGlobal('IntersectionObserver', ObserverMock)

const bulletSeries = [{
    name: 'Revenue',
    data: [{value: 420, target: 500, ranges: [{to: 200}, {to: 350}, {to: 600}]}]
}]

const candlestickSeries = [{
    name: 'AAPL',
    data: [{date: 'May 1', open: 150.2, high: 153.8, low: 149.5, close: 152.9}]
}]

const heatmapSeries = [{
    name: 'Commits',
    data: [{x: 'Mon', y: '00h', value: 5}]
}]

const mapSeries = [{
    name: 'Population',
    data: [{code: 'FR', value: 67}]
}]

function mountOrigam (component: unknown, props: Record<string, unknown>) {
    return mount(component as never, {
        props: props as never,
        global: {plugins: [createOrigam()]}
    })
}

function colorSchemeWarnings (warn: ReturnType<typeof vi.spyOn>): Array<string> {
    return warn.mock.calls
        .map(([msg]) => msg)
        .filter((msg): msg is string => typeof msg === 'string' && msg.includes('colorScheme'))
}

describe('OrigamChartBullet — colorScheme has no effect (#426)', () => {
    it('does not warn when colorScheme is not passed', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartBullet, {series: bulletSeries})
        expect(colorSchemeWarnings(warn)).toHaveLength(0)
        warn.mockRestore()
    })

    it('warns once naming the component and the uniform-fill / rangeColors reason', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartBullet, {series: bulletSeries, colorScheme: ['#111111', '#222222']})
        mountOrigam(OrigamChartBullet, {series: bulletSeries, colorScheme: ['#111111', '#222222']})
        const warnings = colorSchemeWarnings(warn)
        expect(warnings).toHaveLength(1)
        expect(warnings[0]).toContain('OrigamChartBullet')
        expect(warnings[0]).toContain('barColor')
        expect(warnings[0]).toContain('rangeColors')
        warn.mockRestore()
    })
})

describe('OrigamChartCandlestick — colorScheme has no effect (#426)', () => {
    it('does not warn when colorScheme is not passed', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartCandlestick, {series: candlestickSeries})
        expect(colorSchemeWarnings(warn)).toHaveLength(0)
        warn.mockRestore()
    })

    it('warns once naming the component and the binary bullish/bearish reason', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartCandlestick, {series: candlestickSeries, colorScheme: ['#111111', '#222222']})
        mountOrigam(OrigamChartCandlestick, {series: candlestickSeries, colorScheme: ['#111111', '#222222']})
        const warnings = colorSchemeWarnings(warn)
        expect(warnings).toHaveLength(1)
        expect(warnings[0]).toContain('OrigamChartCandlestick')
        expect(warnings[0]).toContain('binary')
        warn.mockRestore()
    })

    it('candle body fill is identical whether or not colorScheme is passed', () => {
        const withoutScheme = mountOrigam(OrigamChartCandlestick, {series: candlestickSeries})
        const withScheme = mountOrigam(OrigamChartCandlestick, {series: candlestickSeries, colorScheme: ['#111111', '#222222', '#333333']})

        const bodyWithout = withoutScheme.find('.origam-chart-candlestick__body-rect')
        const bodyWith = withScheme.find('.origam-chart-candlestick__body-rect')
        expect(bodyWithout.exists()).toBe(true)
        expect(bodyWith.exists()).toBe(true)
        // The candle fill is driven exclusively by bullishColor/bearishColor —
        // passing colorScheme must not perturb it either way.
        expect(bodyWith.attributes('style')).toBe(bodyWithout.attributes('style'))
    })
})

describe('OrigamChartHeatmap — colorScheme has no effect (#426)', () => {
    it('does not warn when colorScheme is not passed', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartHeatmap, {series: heatmapSeries})
        expect(colorSchemeWarnings(warn)).toHaveLength(0)
        warn.mockRestore()
    })

    it('warns once naming the component and the continuous-gradient reason', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartHeatmap, {series: heatmapSeries, colorScheme: ['#111111', '#222222']})
        mountOrigam(OrigamChartHeatmap, {series: heatmapSeries, colorScheme: ['#111111', '#222222']})
        const warnings = colorSchemeWarnings(warn)
        expect(warnings).toHaveLength(1)
        expect(warnings[0]).toContain('OrigamChartHeatmap')
        expect(warnings[0]).toContain('colorRange')
        warn.mockRestore()
    })
})

describe('OrigamChartMap — colorScheme has no effect (#426)', () => {
    it('does not warn when colorScheme is not passed', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartMap, {series: mapSeries})
        expect(colorSchemeWarnings(warn)).toHaveLength(0)
        warn.mockRestore()
    })

    it('warns once naming the component and the gradient / lineColor reason', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountOrigam(OrigamChartMap, {series: mapSeries, colorScheme: ['#111111', '#222222']})
        mountOrigam(OrigamChartMap, {series: mapSeries, colorScheme: ['#111111', '#222222']})
        const warnings = colorSchemeWarnings(warn)
        expect(warnings).toHaveLength(1)
        expect(warnings[0]).toContain('OrigamChartMap')
        expect(warnings[0]).toContain('colorRange')
        warn.mockRestore()
    })
})
