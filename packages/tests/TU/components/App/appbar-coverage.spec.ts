import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { OrigamAppBar } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * OrigamAppBar — coverage for props left untested (#379 §3)
 *
 * @description
 * `density`, `elevation`, `rounded`, `border`, `collapse`, `flat`,
 * `location` and `image` are only forwarded to the internal
 * `<origam-toolbar>` (or resolved into AppBar's own classes) via the
 * template-ref `filterProps` pattern documented in
 * `props.composable.ts` ("one-tick delta") — the FIRST render binds
 * nothing because the template ref isn't assigned yet, and a second,
 * microtask-scheduled render carries the real values. Every assertion
 * here awaits `nextTick()` before reading the DOM to observe the
 * settled (post-microtask) state, matching what a real browser paints.
 ********************************************************/
beforeEach(() => {
    class ResizeObserverStub { observe (): void {} unobserve (): void {} disconnect (): void {} }
    ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub

    class IntersectionObserverStub {
        observe (): void {}
        unobserve (): void {}
        disconnect (): void {}
        takeRecords (): Array<never> { return [] }
    }
    ;(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IntersectionObserverStub
})

const mountBar = (props: Record<string, unknown> = {}) =>
    mount(OrigamAppBar, {
        props: { order: 0, ...props } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })

describe('OrigamAppBar — untested props (#379)', () => {
    it('density="compact" reaches the rendered bar', async () => {
        const wrapper = mountBar({ density: 'compact' })
        await nextTick()

        expect(wrapper.find('.origam-app-bar').classes()).toContain('origam-toolbar--density-compact')
        wrapper.unmount()
    })

    it('elevation reaches the rendered bar (elevated + shadow utility class)', async () => {
        const wrapper = mountBar({ elevation: 'md' })
        await nextTick()

        const classes = wrapper.find('.origam-app-bar').classes()
        expect(classes).toContain('origam-toolbar--elevated')
        expect(classes).toContain('origam--shadow-md')
        wrapper.unmount()
    })

    it('rounded="medium" reaches the rendered bar', async () => {
        const wrapper = mountBar({ rounded: 'medium' })
        await nextTick()

        expect(wrapper.find('.origam-app-bar').classes()).toContain('origam-toolbar--rounded-medium')
        wrapper.unmount()
    })

    it('border reaches the rendered bar', async () => {
        const wrapper = mountBar({ border: true })
        await nextTick()

        const classes = wrapper.find('.origam-app-bar').classes()
        expect(classes).toContain('origam-toolbar--border')
        expect(classes).toContain('origam--border-thin')
        wrapper.unmount()
    })

    it('collapse forces the collapsed modifier on the rendered bar', () => {
        const wrapper = mountBar({ collapse: true })

        expect(wrapper.find('.origam-app-bar').classes()).toContain('origam-toolbar--collapse')
        wrapper.unmount()
    })

    it('flat removes elevation (no --elevated class even with a numeric elevation)', async () => {
        const wrapper = mountBar({ flat: true, elevation: 4 })
        await nextTick()

        expect(wrapper.find('.origam-app-bar').classes()).not.toContain('origam-toolbar--elevated')
        wrapper.unmount()
    })

    it('location="bottom" swaps the position modifier class (default is top)', () => {
        const top = mountBar({})
        const bottom = mountBar({ location: 'bottom' })

        expect(top.find('.origam-app-bar').classes()).toContain('origam-app-bar--top')
        expect(bottom.find('.origam-app-bar').classes()).toContain('origam-app-bar--bottom')
        expect(bottom.find('.origam-app-bar').classes()).not.toContain('origam-app-bar--top')

        top.unmount()
        bottom.unmount()
    })

    it('image renders an origam-img with the given src/alt inside .origam-bar__img', async () => {
        const wrapper = mountBar({ image: { src: 'banner.jpg', alt: 'Banner' } })
        await nextTick()

        const imgWrapper = wrapper.find('.origam-bar__img')
        expect(imgWrapper.exists()).toBe(true)
        expect(imgWrapper.find('img').attributes('src')).toBe('banner.jpg')
        expect(imgWrapper.find('img').attributes('alt')).toBe('Banner')
        wrapper.unmount()
    })

    it('without image prop and without the #img slot, .origam-bar__img is not rendered', () => {
        const wrapper = mountBar({})

        expect(wrapper.find('.origam-bar__img').exists()).toBe(false)
        wrapper.unmount()
    })
})
