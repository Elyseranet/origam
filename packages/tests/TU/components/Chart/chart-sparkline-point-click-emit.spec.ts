// Regression coverage for issue #662 / classeur C5 — "les emits declares
// partent-ils reellement, ET un test le prouve-t-il ?" `<OrigamChartSparkline>`
// declares a single emit (`point-click`, chart-sparkline.interface.ts) and it
// WAS wired to real click/keydown handlers (`onPointClick`), but until this
// spec nothing asserted it — the e2e suite (chart-sparkline.spec.ts) never
// touches `point-click` at all. A test that stays green when the emit call
// is deleted proves nothing (cf. root CLAUDE.md "prouve chaque emit par
// mutation" / the Pagination false-positive this campaign already caught),
// so this spec is deliberately built around DOM interactions that reach the
// real `emit('point-click', …)` call in the component's setup(), not a
// hand-built probe.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartSparkline from '@origam/components/Chart/OrigamChartSparkline.vue'
import { createOrigam } from '@origam/origam'

import type { IChartPoint, IChartSeries } from '@origam/interfaces'

const SERIES: Array<IChartSeries> = [
    { name: 'Revenue', data: [3, 7, 2, 9, 5] }
]

function mountSparkline (props: Record<string, unknown> = {}) {
    return mount(OrigamChartSparkline, {
        props: { series: SERIES, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamChartSparkline — point-click emit (#662)', () => {
    it('clicking a column bar emits point-click with the matching IChartPoint', async () => {
        const wrapper = mountSparkline({ type: 'column' })
        const bar1 = wrapper.find('[data-cy="origam-chart-sparkline-bar-1"]')
        expect(bar1.exists()).toBe(true)

        await bar1.trigger('click')

        const emitted = wrapper.emitted('point-click')
        expect(emitted).toHaveLength(1)
        const [point, event] = emitted![0] as [IChartPoint, MouseEvent]
        expect(point.dataIndex).toBe(1)
        expect(point.y).toBe(7)
        expect(event).toBeInstanceOf(MouseEvent)
    })

    it('pressing Enter on a column bar ALSO emits point-click (keyboard activation)', async () => {
        const wrapper = mountSparkline({ type: 'column' })
        const bar0 = wrapper.find('[data-cy="origam-chart-sparkline-bar-0"]')

        await bar0.trigger('keydown.enter')

        const emitted = wrapper.emitted('point-click')
        expect(emitted).toHaveLength(1)
        expect((emitted![0][0] as IChartPoint).dataIndex).toBe(0)
    })

    it('pressing Space on a line-mode marker emits point-click too', async () => {
        const wrapper = mountSparkline({ type: 'line', showMarkers: true })
        const marker2 = wrapper.find('[data-cy="origam-chart-sparkline-marker-2"]')
        expect(marker2.exists()).toBe(true)

        await marker2.trigger('keydown.space')

        const emitted = wrapper.emitted('point-click')
        expect(emitted).toHaveLength(1)
        expect((emitted![0][0] as IChartPoint).dataIndex).toBe(2)
    })

    it('clicking a horizontal bar (type="bar") emits point-click with the right index', async () => {
        const wrapper = mountSparkline({ type: 'bar' })
        const hbar3 = wrapper.find('[data-cy="origam-chart-sparkline-hbar-3"]')
        expect(hbar3.exists()).toBe(true)

        await hbar3.trigger('click')

        const emitted = wrapper.emitted('point-click')
        expect(emitted).toHaveLength(1)
        expect((emitted![0][0] as IChartPoint).dataIndex).toBe(3)
    })
})
