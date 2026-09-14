// C7 — `OrigamChartAxis.md` claimed, in two separate places, that
// `showAxis = false` renders NOTHING, "including the grid", and that the
// component then "mounts an empty <g> with no children".
//
// Both statements were false. The template carries TWO independent roots:
//
//   <g v-if="showGrid">  .origam-chart__grid   (data-cy=origam-chart-grid)
//   <g v-if="showAxis">  .origam-chart__axis   (data-cy=origam-chart-axis)
//
// so the four combinations are all reachable, and grid-only rendering — the
// case the doc told consumers to work around with CSS — is simply
// `:show-axis="false" :show-grid="true"`.
//
// This is a DOM-presence assertion, not a computed-style one: `wrapper.find`
// on a `data-cy` is reliable under jsdom (see CLAUDE.md §getComputedStyle).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartAxis from '@origam/components/Chart/OrigamChartAxis.vue'

const PLOT = {x0: 52, y0: 24, x1: 576, y1: 320, cx: 314, cy: 172}

const TICKS = {
    x: [
        {position: 52, label: 'Jan', value: 'Jan'},
        {position: 314, label: 'Feb', value: 'Feb'}
    ],
    y: [
        {position: 320, label: '0', value: 0},
        {position: 24, label: '100', value: 100}
    ]
}

const mountAxis = (showAxis: boolean, showGrid: boolean) => mount(OrigamChartAxis, {
    props: {plot: PLOT, ticks: TICKS, showAxis, showGrid}
})

describe('OrigamChartAxis — showAxis and showGrid are independent', () => {
    it('renders both groups when both flags are true', () => {
        const wrapper = mountAxis(true, true)

        expect(wrapper.find('[data-cy="origam-chart-axis"]').exists()).toBe(true)
        expect(wrapper.find('[data-cy="origam-chart-grid"]').exists()).toBe(true)
    })

    it('renders the grid WITHOUT the axis frame when showAxis is false', () => {
        const wrapper = mountAxis(false, true)

        expect(wrapper.find('[data-cy="origam-chart-axis"]').exists()).toBe(false)
        expect(wrapper.find('[data-cy="origam-chart-grid"]').exists()).toBe(true)
        // and the grid group is NOT empty — one <line> per Y tick
        expect(wrapper.findAll('[data-cy="origam-chart-grid"] line')).toHaveLength(TICKS.y.length)
    })

    it('renders the axis frame WITHOUT the grid when showGrid is false', () => {
        const wrapper = mountAxis(true, false)

        expect(wrapper.find('[data-cy="origam-chart-axis"]').exists()).toBe(true)
        expect(wrapper.find('[data-cy="origam-chart-grid"]').exists()).toBe(false)
    })

    it('renders neither group when both flags are false', () => {
        const wrapper = mountAxis(false, false)

        expect(wrapper.find('[data-cy="origam-chart-axis"]').exists()).toBe(false)
        expect(wrapper.find('[data-cy="origam-chart-grid"]').exists()).toBe(false)
    })

    it('renders the secondary right axis only when showAxis is true', () => {
        const secondaryYTicks = [{position: 100, label: '5', value: 5}]

        const withAxis = mount(OrigamChartAxis, {
            props: {plot: PLOT, ticks: TICKS, showAxis: true, showGrid: false, secondaryYTicks}
        })
        const withoutAxis = mount(OrigamChartAxis, {
            props: {plot: PLOT, ticks: TICKS, showAxis: false, showGrid: true, secondaryYTicks}
        })

        expect(withAxis.find('[data-cy="origam-chart-axis-secondary"]').exists()).toBe(true)
        expect(withoutAxis.find('[data-cy="origam-chart-axis-secondary"]').exists()).toBe(false)
    })
})

describe('OrigamChartAxis — formatters apply to tick.value, never to tick.label', () => {
    it('falls back to String(value), NOT to the pre-formatted tick.label', () => {
        // `label` and `value` deliberately disagree: if the component ever
        // fell back to `label`, the rendered text would read 'LABEL-X'.
        const wrapper = mount(OrigamChartAxis, {
            props: {
                plot: PLOT,
                ticks: {
                    x: [{position: 52, label: 'LABEL-X', value: 'RAW-X'}],
                    y: [{position: 24, label: 'LABEL-Y', value: 42}]
                },
                showAxis: true,
                showGrid: false
            }
        })

        const labels = wrapper.findAll('[data-cy="origam-chart-axis"] text').map(node => node.text())

        expect(labels).toContain('RAW-X')
        expect(labels).toContain('42')
        expect(labels).not.toContain('LABEL-X')
        expect(labels).not.toContain('LABEL-Y')
    })

    it('applies xAxisFormat / yAxisFormat when supplied', () => {
        const wrapper = mount(OrigamChartAxis, {
            props: {
                plot: PLOT,
                ticks: {
                    x: [{position: 52, label: 'Jan', value: 'Jan'}],
                    y: [{position: 24, label: '100', value: 100}]
                },
                showAxis: true,
                showGrid: false,
                xAxisFormat: (v: string | number) => `<${ v }>`,
                yAxisFormat: (v: number) => `$${ v }k`
            }
        })

        const labels = wrapper.findAll('[data-cy="origam-chart-axis"] text').map(node => node.text())

        expect(labels).toContain('<Jan>')
        expect(labels).toContain('$100k')
    })
})
