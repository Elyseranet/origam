// #426 — OrigamChartTooltip carried `role="tooltip"` with no `id` and no
// `aria-describedby` link from any of its 18+ trigger elements — an
// orphaned ARIA role the APG explicitly warns against (no benefit to
// assistive tech, potential confusion). Fixed as `aria-hidden="true"`:
// the hovered point/bar/slice trigger already announces the same
// category/value pair via its own `aria-label`, so this floating card is
// purely a decorative visual aid for sighted mouse users.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartTooltip from '@origam/components/Chart/OrigamChartTooltip.vue'
import { createOrigam } from '@origam/origam'

const point = {x: 'A', y: 10, color: '#3b82f6'}
const series = {name: 'Sales', data: [10]}

function mountTooltip (props: Record<string, unknown> = {}) {
    return mount(OrigamChartTooltip, {
        props: {point, series, category: 'A', x: 0, y: 0, ...props} as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamChartTooltip — aria-hidden, not an orphaned role="tooltip" (#426)', () => {
    it('carries aria-hidden="true" when visible', () => {
        const wrapper = mountTooltip()
        expect(wrapper.find('.origam-chart__tooltip').attributes('aria-hidden')).toBe('true')
    })

    it('does not carry role="tooltip" any more', () => {
        const wrapper = mountTooltip()
        expect(wrapper.find('.origam-chart__tooltip').attributes('role')).toBeUndefined()
    })

    it('renders nothing at all when point is null (unrelated to the aria fix, pre-existing behaviour)', () => {
        const wrapper = mountTooltip({point: null})
        expect(wrapper.find('.origam-chart__tooltip').exists()).toBe(false)
    })
})
