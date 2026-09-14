// #426 — OrigamChartPareto typed `colorScheme` (inherited from
// `IChartBaseProps`) but never read it: every bar always rendered
// `barColor` because `barColor` carries a hard `withDefaults()` default
// ('primary'), so `props.barColor` is never `undefined` and a fallback
// keyed on falsiness could never fire. The doc's own claim — "Colour
// palette when `barColor` is not set" — was therefore never true.
//
// Fix mirrors the established `usePassedProps` shadowing pattern already
// used by `useChartAnimationStyle` (#505) for the exact same shape:
// distinguish "the consumer explicitly passed barColor" from "barColor
// resolved to its static default", and only apply colorScheme when the
// former is false.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

import OrigamChartPareto from '@origam/components/Chart/OrigamChartPareto.vue'
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

const series = [{
    name: 'Defects',
    data: [
        {category: 'A', value: 40},
        {category: 'B', value: 25},
        {category: 'C', value: 15}
    ]
}]

function mountPareto (props: Record<string, unknown>) {
    return mount(OrigamChartPareto, {
        props: {series, ...props} as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamChartPareto — colorScheme (#426)', () => {
    it('every bar shares the same fill when colorScheme is unset (unchanged default behaviour)', () => {
        const wrapper = mountPareto({})
        const bars = wrapper.findAll('.origam-chart-pareto__bar')

        expect(bars.length).toBe(3)
        const fills = bars.map((b) => b.attributes('style'))
        expect(new Set(fills).size).toBe(1)
    })

    it('rotates colorScheme across bars when barColor was not explicitly passed', () => {
        const wrapper = mountPareto({colorScheme: ['#111111', '#222222', '#333333']})
        const bars = wrapper.findAll('.origam-chart-pareto__bar')

        // jsdom normalises hex to rgb() when reading back a `style` attribute.
        expect(bars[0].attributes('style')).toContain('rgb(17, 17, 17)')
        expect(bars[1].attributes('style')).toContain('rgb(34, 34, 34)')
        expect(bars[2].attributes('style')).toContain('rgb(51, 51, 51)')
    })

    it('an explicit barColor still wins over colorScheme', () => {
        const wrapper = mountPareto({colorScheme: ['#111111', '#222222', '#333333'], barColor: '#abcdef'})
        const bars = wrapper.findAll('.origam-chart-pareto__bar')

        for (const bar of bars) {
            expect(bar.attributes('style')).toContain('rgb(171, 205, 239)')
        }
    })
})
