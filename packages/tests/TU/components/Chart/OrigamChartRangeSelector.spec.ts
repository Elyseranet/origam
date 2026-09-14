// #403 — OrigamChartRangeSelector had no story, no doc, and (per the
// ticket) had never had a real component-level test either: the audit
// tool that first scanned it produced 11 confident "prop alive" verdicts
// for props it doesn't even have, because Vue's HTML attribute
// fallthrough painted them onto the root <nav> as raw attributes and the
// tool never cross-checked against `Comp.props`. This spec exercises the
// REAL prop surface (`IChartRangeSelectorProps`) end to end.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartRangeSelector from '@origam/components/Chart/OrigamChartRangeSelector.vue'
import { createOrigam } from '@origam/origam'

const BUTTONS = [
    {label: '1w', count: 7},
    {label: '1m', count: 30},
    {label: 'half', fraction: 0.5},
    {label: 'all', fraction: 1},
    {label: 'no-window'}
]

function mountSelector (props: Record<string, unknown>) {
    return mount(OrigamChartRangeSelector, {
        props: {buttons: BUTTONS, dataLength: 100, activeIndex: -1, ...props} as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamChartRangeSelector — real prop/emit surface (#403)', () => {
    it('renders exactly one button per entry, in order, with its label', () => {
        const wrapper = mountSelector({})
        const buttons = wrapper.findAll('button')

        expect(buttons.length).toBe(BUTTONS.length)
        expect(buttons.map((b) => b.text())).toEqual(['1w', '1m', 'half', 'all', 'no-window'])
    })

    it('marks the button at activeIndex with aria-pressed=true, all others false', () => {
        const wrapper = mountSelector({activeIndex: 2})
        const buttons = wrapper.findAll('button')

        buttons.forEach((b, i) => {
            expect(b.attributes('aria-pressed')).toBe(i === 2 ? 'true' : 'false')
        })
        expect(buttons[2].classes()).toContain('origam-chart-range-selector__btn--active')
    })

    it('activeIndex=-1 leaves every button unpressed', () => {
        const wrapper = mountSelector({activeIndex: -1})
        const buttons = wrapper.findAll('button')

        buttons.forEach((b) => expect(b.attributes('aria-pressed')).toBe('false'))
    })

    it('a "count" button emits the last N categories as [start, end]', async () => {
        const wrapper = mountSelector({dataLength: 100})
        await wrapper.findAll('button')[0].trigger('click') // 1w = count: 7

        const emitted = wrapper.emitted('select')
        expect(emitted).toHaveLength(1)
        expect(emitted![0]).toEqual([0, 93, 99])
    })

    it('a "fraction" button emits a window proportional to dataLength', async () => {
        const wrapper = mountSelector({dataLength: 100})
        await wrapper.findAll('button')[2].trigger('click') // half = fraction: 0.5

        expect(wrapper.emitted('select')![0]).toEqual([2, 50, 99])
    })

    it('fraction: 1 ("all") always spans the full range', async () => {
        const wrapper = mountSelector({dataLength: 365})
        await wrapper.findAll('button')[3].trigger('click')

        expect(wrapper.emitted('select')![0]).toEqual([3, 0, 364])
    })

    it('a button with neither count nor fraction selects the full range too', async () => {
        const wrapper = mountSelector({dataLength: 42})
        await wrapper.findAll('button')[4].trigger('click')

        expect(wrapper.emitted('select')![0]).toEqual([4, 0, 41])
    })

    it('dataLength=0 makes every click a no-op (no emit)', async () => {
        const wrapper = mountSelector({dataLength: 0})
        await wrapper.findAll('button')[0].trigger('click')

        expect(wrapper.emitted('select')).toBeUndefined()
    })

    it('is keyboard-reachable — native <button> elements need no extra wiring', () => {
        const wrapper = mountSelector({})
        wrapper.findAll('button').forEach((b) => {
            expect(b.attributes('type')).toBe('button')
            expect(b.attributes('tabindex')).not.toBe('-1')
        })
    })
})
