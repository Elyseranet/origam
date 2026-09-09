// #567 / #395 — the ACCESSIBLE NAME of a chart was hardcoded English.
//
// `chart-i18n-empty-state.spec.ts` fixed the visible empty state and three
// named fallbacks (`?? 'Chart'`, `?? '← Back'`, `?? 'Root'`). It did NOT
// cover the per-variant accessible name, which is a different literal on
// every component:
//
//     const ariaLabel    = computed(() => props.title ?? 'bullet chart')
//     const svgAriaLabel = computed(() => props.title ?? 'bullet chart')
//     const svgTitle     = computed(() => props.title ?? 'bullet chart')
//
// Three computeds x 9 components in the first alphabetical half alone.
// This is precisely the C8 detector's blind spot: a literal placed behind
// an operator (`??`, `||`, `?:`) is invisible to it, so the published count
// is a floor, not a total. The same blindness hid the two full sentences
// OrigamChartLegend announces to screen readers ('hidden, click to show' /
// 'visible, click to hide'), and the `<desc>` sentences every variant emits.
//
// Trap this file is built around, inherited from the sibling spec: under
// `en` a hardcoded English string and its correctly-resolved translation
// are BYTE-IDENTICAL, so an English-only test passes with the bug fully
// present. Every runtime assertion therefore mounts under `fr` AND asserts
// an ABSOLUTE expected value — never merely "differs from" — because a
// difference test also passes on two wrong strings.
//
// The `en` half of each pair pins the English output byte-for-byte, so a
// translation pass cannot silently reword the accessible name.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'

import OrigamChartBoxPlot from '@origam/components/Chart/OrigamChartBoxPlot.vue'
import OrigamChartBullet from '@origam/components/Chart/OrigamChartBullet.vue'
import OrigamChartCandlestick from '@origam/components/Chart/OrigamChartCandlestick.vue'
import OrigamChartGauge from '@origam/components/Chart/OrigamChartGauge.vue'
import OrigamChartHeatmap from '@origam/components/Chart/OrigamChartHeatmap.vue'
import OrigamChartHoneycomb from '@origam/components/Chart/OrigamChartHoneycomb.vue'
import OrigamChartMap from '@origam/components/Chart/OrigamChartMap.vue'
import OrigamChartPareto from '@origam/components/Chart/OrigamChartPareto.vue'
import OrigamChartPictorial from '@origam/components/Chart/OrigamChartPictorial.vue'
import OrigamChartLegend from '@origam/components/Chart/OrigamChartLegend.vue'

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

function mountChart (component: unknown, locale: string | undefined, props: Record<string, unknown>) {
    return mount(component as never, {
        props: props as never,
        global: {plugins: [createOrigam(locale ? {locale: {locale}} : undefined)]}
    })
}

/*********************************************************
 * Static safety net
 *
 * @description
 * The literal must not come back on ANY component of the first
 * alphabetical half, whichever one a future change touches. A runtime
 * test only covers the props it happens to pass; this covers the file.
 ********************************************************/
describe('OrigamChart* — no hardcoded accessible name survives (#567)', () => {
    const FIRST_HALF = [
        'OrigamChart', 'OrigamChartAxis', 'OrigamChartBoxPlot', 'OrigamChartBullet',
        'OrigamChartCandlestick', 'OrigamChartCartesian', 'OrigamChartGauge',
        'OrigamChartHeatmap', 'OrigamChartHoneycomb', 'OrigamChartLegend',
        'OrigamChartMap', 'OrigamChartPareto', 'OrigamChartPictorial'
    ]

    // A locale KEY also contains the word "chart" ('origam.chart.zoom.…'),
    // and OrigamChartCartesian legitimately writes `?? 'origam.chart.…'`.
    // Matching on the word alone flags that correct line — the classeur
    // already recorded Cartesian as a C8 false positive for this reason.
    // Excluding dotted keys keeps the guard on prose only.
    it.each(FIRST_HALF)('%s has no `?? \'<kind> chart\'` literal fallback', (name) => {
        const src = readFileSync(path.join(CHART_DIR, `${ name }.vue`), 'utf-8')
        const proseFallbacks = [...src.matchAll(/\?\?\s*'([^']*\bchart\b[^']*)'/gi)]
            .map((m) => m[1])
            .filter((v) => !v.startsWith('origam.'))

        expect(proseFallbacks).toEqual([])
    })

    it.each(FIRST_HALF)('%s builds no English `<desc>` sentence inline', (name) => {
        const src = readFileSync(path.join(CHART_DIR, `${ name }.vue`), 'utf-8')

        // The `<desc>` sentences were template literals assembled in the
        // component ("Box plot with 3 categories."). A translated build
        // reads them from the locale, so no English connective survives.
        expect(src).not.toMatch(/`[^`]*\bwith \$\{/)
        expect(src).not.toMatch(/`Gauge showing/)
    })

    it('OrigamChartLegend announces no hardcoded sentence', () => {
        const src = readFileSync(path.join(CHART_DIR, 'OrigamChartLegend.vue'), 'utf-8')

        expect(src).not.toContain('hidden, click to show')
        expect(src).not.toContain('visible, click to hide')
    })

    it('OrigamChartPareto does not hardcode the cumulative series name', () => {
        const src = readFileSync(path.join(CHART_DIR, 'OrigamChartPareto.vue'), 'utf-8')

        expect(src).not.toContain("'Cumulative %'")
    })
})

/*********************************************************
 * Runtime proof — accessible name follows the active locale
 *
 * @description
 * Absolute expected values on both sides. `fr` proves the string is
 * resolved rather than literal; `en` pins the exact English output so
 * the fix cannot reword what a screen reader already announces.
 ********************************************************/
describe('OrigamChart* — accessible name follows the active locale (#567)', () => {
    const SERIES = [{name: 'S1', data: [1, 2, 3]}]

    const cases: Array<[string, unknown, Record<string, unknown>, string, string]> = [
        ['OrigamChartBoxPlot', OrigamChartBoxPlot, {series: SERIES}, 'box plot chart', 'boîte à moustaches'],
        ['OrigamChartBullet', OrigamChartBullet, {series: SERIES}, 'bullet chart', 'graphique à puce'],
        ['OrigamChartCandlestick', OrigamChartCandlestick, {series: SERIES}, 'candlestick chart', 'graphique en chandeliers'],
        ['OrigamChartHeatmap', OrigamChartHeatmap, {series: SERIES}, 'heatmap chart', 'carte de chaleur'],
        ['OrigamChartHoneycomb', OrigamChartHoneycomb, {series: SERIES}, 'honeycomb chart', 'graphique en nid d\'abeille'],
        ['OrigamChartMap', OrigamChartMap, {series: SERIES}, 'map chart', 'carte'],
        ['OrigamChartPareto', OrigamChartPareto, {series: SERIES}, 'Pareto chart', 'diagramme de Pareto'],
        ['OrigamChartPictorial', OrigamChartPictorial, {series: SERIES}, 'pictorial chart', 'graphique pictural']
    ]

    it.each(cases)('%s root aria-label is English under en', (_n, Component, props, en) => {
        const wrapper = mountChart(Component, undefined, props)

        expect(wrapper.attributes('aria-label')).toBe(en)

        wrapper.unmount()
    })

    it.each(cases)('%s root aria-label is French under fr', (_n, Component, props, en, fr) => {
        const wrapper = mountChart(Component, 'fr', props)

        expect(wrapper.attributes('aria-label')).toBe(fr)
        expect(wrapper.attributes('aria-label')).not.toBe(en)

        wrapper.unmount()
    })

    it.each(cases)('%s svg <title> follows the locale', (_n, Component, props, en, fr) => {
        const wrapper = mountChart(Component, 'fr', props)

        expect(wrapper.find('svg title').text()).toBe(fr)

        wrapper.unmount()
    })

    it('OrigamChartGauge svg <title> follows the locale', () => {
        const en = mountChart(OrigamChartGauge, undefined, {series: SERIES})
        expect(en.find('svg title').text()).toBe('gauge chart')
        en.unmount()

        const fr = mountChart(OrigamChartGauge, 'fr', {series: SERIES})
        expect(fr.find('svg title').text()).toBe('jauge')
        fr.unmount()
    })

    it('a consumer title still wins over the localized default', () => {
        const wrapper = mountChart(OrigamChartBullet, 'fr', {series: SERIES, title: 'Mon titre'})

        expect(wrapper.attributes('aria-label')).toBe('Mon titre')

        wrapper.unmount()
    })
})

/*********************************************************
 * Runtime proof — the `<desc>` sentence
 ********************************************************/
describe('OrigamChart* — svg <desc> follows the active locale (#567)', () => {
    const SERIES = [{name: 'S1', data: [1, 2, 3]}]

    // Heatmap reads `{x, y, value}` points, not a flat number array — a
    // flat array renders the empty state and there is no <desc> to read.
    // Measured, not assumed: the wrong shape produced "Cannot call text on
    // an empty DOMWrapper", which looks exactly like a missing element.
    const HEATMAP = [{
        name: 'S1',
        data: [
            {x: 'a', y: 'x', value: 1}, {x: 'b', y: 'x', value: 2},
            {x: 'a', y: 'y', value: 3}, {x: 'b', y: 'y', value: 4},
            {x: 'a', y: 'z', value: 5}, {x: 'b', y: 'z', value: 6}
        ]
    }]

    it('OrigamChartHeatmap <desc> is localized and carries the real counts', () => {
        const wrapper = mountChart(OrigamChartHeatmap, 'fr', {series: HEATMAP})

        expect(wrapper.find('svg desc').text()).toBe('Carte de chaleur avec 2 colonnes et 3 lignes.')

        wrapper.unmount()
    })

    it('OrigamChartHeatmap <desc> keeps its exact English wording', () => {
        const wrapper = mountChart(OrigamChartHeatmap, undefined, {series: HEATMAP})

        expect(wrapper.find('svg desc').text()).toBe('Heatmap chart with 2 columns and 3 rows.')

        wrapper.unmount()
    })

    // Bullet renders one bullet per SERIES (its `data[0]` must carry both
    // `value` and a non-empty `ranges`), NOT one per data point. Read from
    // the component's own `bullets` computed rather than guessed.
    const bulletSeries = (n: number) => Array.from({length: n}, (_, i) => ({
        name: `S${ i }`,
        data: [{value: 10, target: 12, ranges: [5, 10, 15]}]
    }))

    // The plural pair, proven on a real component rather than only on the
    // adapter: one bullet vs several must select different locale keys.
    it('OrigamChartBullet <desc> selects the singular and plural forms', () => {
        const one = mountChart(OrigamChartBullet, undefined, {series: bulletSeries(1)})
        expect(one.find('svg desc').text()).toBe('Bullet chart with 1 indicator.')
        one.unmount()

        const many = mountChart(OrigamChartBullet, undefined, {series: bulletSeries(2)})
        expect(many.find('svg desc').text()).toBe('Bullet chart with 2 indicators.')
        many.unmount()
    })

    // French and English do NOT agree on zero: CLDR maps 0 to `one` in
    // French and to `other` in English. That divergence is the whole point
    // of routing through Intl.PluralRules instead of `n === 1`, so it is
    // pinned here as an absolute value on both sides.
    it('OrigamChartBullet <desc> pluralizes per locale, including zero', () => {
        const many = mountChart(OrigamChartBullet, 'fr', {series: bulletSeries(2)})
        expect(many.find('svg desc').text()).toBe('Graphique à puce avec 2 indicateurs.')
        many.unmount()

        const zeroFr = mountChart(OrigamChartBullet, 'fr', {series: bulletSeries(0)})
        expect(zeroFr.find('svg desc').text()).toBe('Graphique à puce avec 0 indicateur.')
        zeroFr.unmount()

        const zeroEn = mountChart(OrigamChartBullet, undefined, {series: bulletSeries(0)})
        expect(zeroEn.find('svg desc').text()).toBe('Bullet chart with 0 indicators.')
        zeroEn.unmount()
    })
})

/*********************************************************
 * OrigamChartLegend — #567, the two full sentences
 *
 * @description
 * These are not labels but complete phrases read out to a screen-reader
 * user, and they were invisible to the C8 detector because they sit
 * inside a ternary inside a template literal.
 ********************************************************/
describe('OrigamChartLegend — toggle hint follows the active locale (#567)', () => {
    const items = [
        {series: {name: 'Alpha'}, index: 0, visible: true, color: '#f00'},
        {series: {name: 'Beta'}, index: 1, visible: false, color: '#0f0'}
    ]

    it('announces English hints under en', () => {
        const wrapper = mountChart(OrigamChartLegend, undefined, {items})
        const li = wrapper.findAll('.origam-chart__legend-item')

        expect(li[0].attributes('aria-label')).toBe('Alpha: visible, click to hide')
        expect(li[1].attributes('aria-label')).toBe('Beta: hidden, click to show')

        wrapper.unmount()
    })

    it('announces French hints under fr', () => {
        const wrapper = mountChart(OrigamChartLegend, 'fr', {items})
        const li = wrapper.findAll('.origam-chart__legend-item')

        expect(li[0].attributes('aria-label')).toBe('Alpha: visible, cliquer pour masquer')
        expect(li[1].attributes('aria-label')).toBe('Beta: masqué, cliquer pour afficher')

        wrapper.unmount()
    })
})
