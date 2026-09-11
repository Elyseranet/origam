// Regression coverage for #474 — the `origam.carousel.aria_label.delimiter`
// locale string ("Carousel slide {0} of {1}") was translated (en + fr) but
// never read anywhere in <OrigamWindow>: no live region announced the
// active-slide change to assistive tech, only the (correctly labelled)
// prev/next buttons existed. `role="region"` / `aria-roledescription="carousel"`
// were also entirely absent from the root.
//
// This spec mounts a REAL 3-item window (not a stub, and UNCONTROLLED — no
// `modelValue`/`@update:modelValue` round-trip to fake — since OrigamWindow
// manages its own selection state internally when nothing listens for the
// update) so `group.items` / `activeIndex` are the genuine computed values.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
import OrigamWindowItem from '@origam/components/Window/OrigamWindowItem.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

function mountThreeSlides (props: Record<string, unknown> = {}) {
    return mount(OrigamWindow, {
        props: { continuous: true, ...props } as never,
        global: {
            plugins: [createOrigam()],
            components: { OrigamWindowItem }
        },
        slots: {
            default: `
                <origam-window-item :value="1">Slide 1</origam-window-item>
                <origam-window-item :value="2">Slide 2</origam-window-item>
                <origam-window-item :value="3">Slide 3</origam-window-item>
            `
        }
    })
}

describe('OrigamWindow — #474 carousel region + live-region slide announcement', () => {
    it('carries role="region" and aria-roledescription="carousel" on the root', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        const root = wrapper.find('.origam-window')
        expect(root.attributes('role')).toBe('region')
        expect(root.attributes('aria-roledescription')).toBe('carousel')
    })

    it('renders a role="status" aria-live="polite" live region announcing "Carousel slide 1 of 3" on mount', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        const live = wrapper.find('.origam-window__live-region')
        expect(live.exists()).toBe(true)
        expect(live.attributes('role')).toBe('status')
        expect(live.attributes('aria-live')).toBe('polite')
        expect(live.text()).toBe('Carousel slide 1 of 3')
    })

    it('updates the live region to "Carousel slide 2 of 3" after clicking next', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        await wrapper.find('.origam-window__next').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 2 of 3')
    })

    it('updates the live region to "Carousel slide 3 of 3" after clicking next twice', async () => {
        const wrapper = mountThreeSlides()
        await wrapper.vm.$nextTick()
        await wrapper.find('.origam-window__next').trigger('click')
        await wrapper.vm.$nextTick()
        await wrapper.find('.origam-window__next').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 3 of 3')
    })

    it('updates the live region back down after clicking prev', async () => {
        const wrapper = mountThreeSlides({ modelValue: 2 })
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 2 of 3')
        await wrapper.find('.origam-window__prev').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.origam-window__live-region').text()).toBe('Carousel slide 1 of 3')
    })
})
