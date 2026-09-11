// #426 — OrigamChartPyramid was the only component in its family to
// destructure ONLY `marginStyles` / `paddingStyles` from `useMargin` /
// `usePadding` and omit `marginClasses` / `paddingClasses` from
// `rootClasses`. A tokenised `margin="4"` therefore produced no
// `.origam--m-4` utility class at all — dead prop surface, silently
// ignored. Every sibling (e.g. OrigamChartRadar) wires both classes.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

import OrigamChartPyramid from '@origam/components/Chart/OrigamChartPyramid.vue'
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

describe('OrigamChartPyramid — tokenised margin/padding reach the root class list (#426)', () => {
    it('emits .origam--m-4 for a tokenised margin', () => {
        const wrapper = mount(OrigamChartPyramid, {
            props: {series: [{name: 'S', data: [{x: 'A', y: 10}]}], margin: '4'} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(wrapper.classes()).toContain('origam--m-4')
    })

    it('emits .origam--p-2 for a tokenised padding', () => {
        const wrapper = mount(OrigamChartPyramid, {
            props: {series: [{name: 'S', data: [{x: 'A', y: 10}]}], padding: '2'} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(wrapper.classes()).toContain('origam--p-2')
    })
})
