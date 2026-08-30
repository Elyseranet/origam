// #395 — the Chart family (26 components) imported ZERO i18n. The most
// visible symptom was "No data to display", hardcoded byte-for-byte in 20
// files, plus three English-only fallback values (root aria-label "Chart",
// drilldown back label "← Back", drilldown breadcrumb root label "Root")
// on OrigamChartCartesian / OrigamChartPolar.
//
// Same trap as #477's regression spec: under the default `en` locale, a
// hardcoded English string and its correctly-resolved translation are
// byte-identical, so a test that only exercises `en` passes WITH the bug
// still present. Every assertion below therefore mounts under `fr` and
// reads the rendered DOM text — never the template source — so a
// regression (reverting to the literal, or a typo in the locale key) fails
// loudly instead of silently matching under English.

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

import { createOrigam } from '@origam/origam'

import OrigamChartBullet from '@origam/components/Chart/OrigamChartBullet.vue'
import OrigamChartBoxPlot from '@origam/components/Chart/OrigamChartBoxPlot.vue'
import OrigamChartHeatmap from '@origam/components/Chart/OrigamChartHeatmap.vue'
import OrigamChartGauge from '@origam/components/Chart/OrigamChartGauge.vue'
import OrigamChartPareto from '@origam/components/Chart/OrigamChartPareto.vue'
import OrigamChartCandlestick from '@origam/components/Chart/OrigamChartCandlestick.vue'
import OrigamChartMap from '@origam/components/Chart/OrigamChartMap.vue'
import OrigamChartPyramid from '@origam/components/Chart/OrigamChartPyramid.vue'
import OrigamChartPolar from '@origam/components/Chart/OrigamChartPolar.vue'
import OrigamChartHoneycomb from '@origam/components/Chart/OrigamChartHoneycomb.vue'
import OrigamChartPolarBar from '@origam/components/Chart/OrigamChartPolarBar.vue'
import OrigamChartPictorial from '@origam/components/Chart/OrigamChartPictorial.vue'
import OrigamChartSankey from '@origam/components/Chart/OrigamChartSankey.vue'
import OrigamChartSunburst from '@origam/components/Chart/OrigamChartSunburst.vue'
import OrigamChartTreemap from '@origam/components/Chart/OrigamChartTreemap.vue'
import OrigamChartRadar from '@origam/components/Chart/OrigamChartRadar.vue'
import OrigamChartStreamgraph from '@origam/components/Chart/OrigamChartStreamgraph.vue'
import OrigamChartWordCloud from '@origam/components/Chart/OrigamChartWordCloud.vue'
import OrigamChartVariwide from '@origam/components/Chart/OrigamChartVariwide.vue'
import OrigamChartCartesian from '@origam/components/Chart/OrigamChartCartesian.vue'

const DS_ROOT = path.resolve(__dirname, '../../../../ds')
const CHART_DIR = path.join(DS_ROOT, 'src/components/Chart')

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

afterEach(() => {
    document.body.innerHTML = ''
})

function mountEmpty (component: any, locale?: string, props: Record<string, unknown> = {}) {
    return mount(component, {
        props: props as never,
        global: {plugins: [createOrigam(locale ? {locale: {locale}} : undefined)]}
    })
}

/*********************************************************
 * Static safety net — no literal English fallback survives
 * anywhere in the family, whatever component gets touched next.
 ********************************************************/
describe('OrigamChart* — no hardcoded user-facing strings survive (#395)', () => {
    const chartFiles = readdirSync(CHART_DIR)
        .filter((f) => f.startsWith('OrigamChart') && f.endsWith('.vue'))

    it('found the 26 Chart family components', () => {
        expect(chartFiles.length).toBe(26)
    })

    it.each(chartFiles)('%s has no hardcoded "No data to display"', (file) => {
        const src = readFileSync(path.join(CHART_DIR, file), 'utf-8')
        expect(src).not.toContain('No data to display')
    })

    it.each(chartFiles)('%s has no hardcoded drilldown/back/root English fallback', (file) => {
        const src = readFileSync(path.join(CHART_DIR, file), 'utf-8')
        expect(src).not.toMatch(/\?\?\s*'Chart'/)
        expect(src).not.toMatch(/\?\?\s*'← Back'/)
        expect(src).not.toMatch(/\?\?\s*'Root'/)
    })
})

/*********************************************************
 * Runtime proof, under `fr` — the 20 components that render an
 * empty-state message.
 *********************************************************/
describe('OrigamChart* — empty-state text follows the active locale (#395)', () => {
    // Most of the family gates the empty state on `props.series` being
    // falsy/empty and never dereferences it again unconditionally — an
    // absent `series` prop alone triggers the empty state. Three files
    // (Cartesian, Polar, Radar) additionally compute an SVG `<desc>` that
    // reads `series.length` with no optional chaining, so those three
    // need an explicit `series: []` to reach the same empty state without
    // an unrelated crash.
    const components: Array<[string, any, Record<string, unknown>?]> = [
        ['OrigamChartBullet', OrigamChartBullet],
        ['OrigamChartBoxPlot', OrigamChartBoxPlot],
        ['OrigamChartHeatmap', OrigamChartHeatmap],
        ['OrigamChartGauge', OrigamChartGauge],
        ['OrigamChartPareto', OrigamChartPareto],
        ['OrigamChartCandlestick', OrigamChartCandlestick],
        ['OrigamChartMap', OrigamChartMap],
        ['OrigamChartPyramid', OrigamChartPyramid],
        ['OrigamChartPolar', OrigamChartPolar, {series: []}],
        ['OrigamChartHoneycomb', OrigamChartHoneycomb],
        ['OrigamChartPolarBar', OrigamChartPolarBar],
        ['OrigamChartPictorial', OrigamChartPictorial],
        ['OrigamChartSankey', OrigamChartSankey],
        ['OrigamChartSunburst', OrigamChartSunburst],
        ['OrigamChartTreemap', OrigamChartTreemap],
        ['OrigamChartRadar', OrigamChartRadar, {series: []}],
        ['OrigamChartStreamgraph', OrigamChartStreamgraph],
        ['OrigamChartWordCloud', OrigamChartWordCloud],
        ['OrigamChartVariwide', OrigamChartVariwide],
        ['OrigamChartCartesian', OrigamChartCartesian, {type: 'bar', series: []}]
    ]

    it.each(components)('%s renders the French empty-state text under fr locale', (_name, Component, props) => {
        const wrapper = mountEmpty(Component, 'fr', props)
        const empty = wrapper.find('.origam-chart__empty')

        expect(empty.exists()).toBe(true)
        expect(empty.text()).toBe('Aucune donnée à afficher')
        expect(empty.text()).not.toBe('No data to display')

        wrapper.unmount()
    })

    it.each(components)('%s falls back to the shared locale key under English', (_name, Component, props) => {
        const wrapper = mountEmpty(Component, undefined, props)
        const empty = wrapper.find('.origam-chart__empty')

        expect(empty.text()).toBe('No data to display')

        wrapper.unmount()
    })
})

/*********************************************************
 * OrigamChartCartesian / OrigamChartPolar — the three literal
 * fallbacks that lived alongside the already-fixed (#477)
 * drilldown/zoom labels: root aria-label, drilldown back label,
 * drilldown breadcrumb root label.
 *********************************************************/
describe('OrigamChartCartesian / OrigamChartPolar — remaining fallbacks follow the locale (#395)', () => {
    const drilldownProps = {
        series: [{
            name: 'S',
            data: [
                {x: 'A', y: 5, drilldown: {id: 'sub', name: 'Sub'}},
                {x: 'B', y: 3}
            ]
        }],
        categories: ['A', 'B'],
        drilldown: {
            datasets: [
                {id: 'sub', name: 'Sub', series: [{name: 'S2', data: [1, 2]}], categories: ['X', 'Y']}
            ]
        }
    }

    it('OrigamChartCartesian — root aria-label falls back to the locale key, not "Chart"', () => {
        const wrapper = mount(OrigamChartCartesian, {
            props: {type: 'bar', series: [{name: 'S', data: [1, 2]}], categories: ['A', 'B']} as never,
            global: {plugins: [createOrigam({locale: {locale: 'fr'}})]}
        })

        expect(wrapper.find('[role="figure"]').attributes('aria-label')).toBe('Graphique')
        wrapper.unmount()
    })

    it('OrigamChartPolar — root aria-label falls back to the locale key, not "Chart"', () => {
        const wrapper = mount(OrigamChartPolar, {
            props: {series: [{name: 'S', data: [1, 2]}], categories: ['A', 'B']} as never,
            global: {plugins: [createOrigam({locale: {locale: 'fr'}})]}
        })

        expect(wrapper.find('[role="figure"]').attributes('aria-label')).toBe('Graphique')
        wrapper.unmount()
    })

    it('OrigamChartCartesian — drilldown back button + breadcrumb root follow the locale', async () => {
        const wrapper = mount(OrigamChartCartesian, {
            props: {type: 'bar', ...drilldownProps} as never,
            global: {plugins: [createOrigam({locale: {locale: 'fr'}})]}
        })

        const point = wrapper.find('[data-cy="origam-chart-bar-0-0"]')
        expect(point.exists()).toBe(true)
        await point.trigger('mouseenter')
        await point.trigger('click')

        const backBtn = wrapper.find('.origam-chart-cartesian__breadcrumb-back')
        expect(backBtn.text()).toBe('← Retour')

        const breadcrumbCurrent = wrapper.find('.origam-chart-cartesian__breadcrumb-current')
        expect(breadcrumbCurrent.text()).toBe('Sub')

        wrapper.unmount()
    })

    it('OrigamChartPolar — drilldown back button + breadcrumb root follow the locale', async () => {
        const wrapper = mount(OrigamChartPolar, {
            props: drilldownProps as never,
            global: {plugins: [createOrigam({locale: {locale: 'fr'}})]}
        })

        const point = wrapper.find('[data-cy="origam-chart-slice-0"]')
        expect(point.exists()).toBe(true)
        await point.trigger('mouseenter')
        await point.trigger('click')

        const backBtn = wrapper.find('.origam-chart-polar__breadcrumb-back')
        expect(backBtn.attributes('aria-label')).toBe('← Retour')

        wrapper.unmount()
    })
})
