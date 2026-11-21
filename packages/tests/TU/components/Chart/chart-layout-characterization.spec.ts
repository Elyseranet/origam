// #1398 (lot 3) — pins the rendered SVG of the chart layout engines whose
// layout functions were split to lower their cognitive complexity (S3776).
// The snapshot was recorded on the UNREFACTORED code: green before and after
// proves the refactor is behaviour-preserving.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartSankey from '@origam/components/Chart/OrigamChartSankey.vue'
import OrigamChartStreamgraph from '@origam/components/Chart/OrigamChartStreamgraph.vue'
import OrigamChartSunburst from '@origam/components/Chart/OrigamChartSunburst.vue'
import OrigamChartWordCloud from '@origam/components/Chart/OrigamChartWordCloud.vue'
import OrigamChartPictorial from '@origam/components/Chart/OrigamChartPictorial.vue'
import OrigamChartPolar from '@origam/components/Chart/OrigamChartPolar.vue'
import OrigamChartPolarBar from '@origam/components/Chart/OrigamChartPolarBar.vue'
import OrigamChartBullet from '@origam/components/Chart/OrigamChartBullet.vue'
import { createOrigam } from '@origam/origam'

const render = (component: unknown, props: Record<string, unknown>): string => {
    const wrapper = mount(component as never, {
        props: props as never,
        global: { plugins: [ createOrigam() ] }
    })

    return wrapper.html().replace(/origam-[a-z-]*\d{3,}/g, 'ID')
}

const flows = [
    { from: 'A', to: 'C', value: 30 },
    { from: 'A', to: 'D', value: 20, color: 'danger' },
    { from: 'B', to: 'C', value: 15 },
    { from: 'B', to: 'D', value: 25, color: '#ff0080' },
    { from: 'C', to: 'E', value: 45 },
    { from: 'D', to: 'E', value: 10 },
    { from: 'D', to: 'F', value: 35 }
]

const layers = [
    { name: 'Pop', data: [ 420, 480, 510, 460, 440, 490 ] },
    { name: 'Rock', data: [ 320, 300, 280, 310, 350, 0 ] },
    { name: 'Jazz', data: [ 0, 310, 380, 420, 400, 380 ] }
]
const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ]

const tree = [
    { name: 'Eng', value: 50, children: [ { name: 'FE', value: 20 }, { name: 'BE', value: 20, color: 'success' }, { name: 'Ops', value: 10 } ] },
    { name: 'Mkt', value: 30 },
    { name: 'Sales', value: 0.5 },
    { name: 'Hidden', value: 0 }
]

const words = [
    { text: 'AI', value: 100 }, { text: 'Cloud', value: 80 }, { text: 'TypeScript', value: 60 },
    { text: 'Vue', value: 40, color: 'primary' }, { text: 'Design', value: 25 }, { text: 'System', value: 10 },
    { text: 'x', value: 1 }
]

describe('chart layout characterization (#1398 lot 3)', () => {
    it('Sankey', () => {
        expect(render(OrigamChartSankey, { series: [ { name: 'S', data: flows } ], title: 't' })).toMatchSnapshot()
        expect(render(OrigamChartSankey, { series: [ { name: 'S', data: [ { from: 'A', to: 'B', value: 1 }, { from: 'B', to: 'A', value: 1 } ] } ] })).toMatchSnapshot()
    })

    it.each([ 'wiggle', 'silhouette', 'expand', 'zero' ])('Streamgraph %s', (offsetMode) => {
        expect(render(OrigamChartStreamgraph, { series: layers, categories: months, offsetMode })).toMatchSnapshot()
        expect(render(OrigamChartStreamgraph, { series: layers, categories: months, offsetMode, smoothing: 'none' })).toMatchSnapshot()
    })

    it('Sunburst', () => {
        expect(render(OrigamChartSunburst, { series: [ { name: 'B', data: tree } ] })).toMatchSnapshot()
        expect(render(OrigamChartSunburst, { series: [ { name: 'B', data: tree } ], innerRadius: 0, showLabel: false })).toMatchSnapshot()
    })

    it('WordCloud', () => {
        expect(render(OrigamChartWordCloud, { series: [ { name: 'W', data: words } ] })).toMatchSnapshot()
    })

    it.each([
        { mode: 'stack', direction: 'vertical' },
        { mode: 'stack', direction: 'horizontal' },
        { mode: 'fill', direction: 'vertical' }
    ])('Pictorial %o', (extra) => {
        expect(render(OrigamChartPictorial, {
            series: [ { name: 'A', data: [ 65, 25, 10, 0 ] }, { name: 'B', data: [ 30, { x: 'c', y: 12 }, 5, -3 ] } ],
            categories: [ 'a', 'b', 'c', 'd' ],
            iconsPerUnit: 5,
            ...extra
        })).toMatchSnapshot()
    })

    it.each([ 'pie', 'donut' ])('Polar %s', (type) => {
        expect(render(OrigamChartPolar, { type, series: [ { name: 'R', data: [ 120, 80, 60, 45, 25, 0 ] } ], categories: [ 'US', 'FR', 'DE', 'JP', 'BR', 'XX' ] })).toMatchSnapshot()
    })

    it('PolarBar', () => {
        expect(render(OrigamChartPolarBar, { series: [ { name: 'H', data: [ 8, 9, 7, 8, 10, 4, 3, 0 ] } ], categories: [ 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'X' ] })).toMatchSnapshot()
    })

    it('Bullet', () => {
        const series = [
            { name: 'Rev', data: [ { value: 420, target: 500, ranges: [ { to: 200 }, { to: 350 }, { to: 600 } ] } ] },
            { name: 'Mar', data: [ { value: 28, target: 35, ranges: [ { to: 15 }, { to: 25 }, { to: 40 } ] } ] }
        ]
        expect(render(OrigamChartBullet, { series, categories: [ 'Rev', 'Mar' ] })).toMatchSnapshot()
        expect(render(OrigamChartBullet, { series, orientation: 'vertical', xAxisFormat: (v: number) => `${ v }$` })).toMatchSnapshot()
        expect(render(OrigamChartBullet, { series, yAxisFormat: (v: number) => `${ v }y` })).toMatchSnapshot()
    })
})
