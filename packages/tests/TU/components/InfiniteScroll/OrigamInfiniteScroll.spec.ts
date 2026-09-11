// Unit tests for <OrigamInfiniteScroll> — typography surface.
//
// The __side element (role="status") reads:
//   font-size: var(--origam-infinite-scroll__loader---font-size, 0.875rem)
//
// useTypography(props, 'infinite-scroll__loader') is bound on both __side
// divs. Only fontSize has a real visual effect; the SCSS has no rule for
// font-weight / font-family / line-height / letter-spacing on this surface.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamInfiniteScroll from '@origam/components/InfiniteScroll/OrigamInfiniteScroll.vue'
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

// jsdom does not provide a working IntersectionObserver — `new
// IntersectionObserver().observe()` throws ("observe is not a function") at
// mount, surfacing as an async unhandled rejection that vitest attributes to
// whichever test is running, producing flaky failures unrelated to the
// typography surface under test. Stub it so the observer is inert.
class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

function mountInfiniteScroll (props: Record<string, unknown> = {}) {
    return mount(OrigamInfiniteScroll, {
        props: { ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamInfiniteScroll — fontSize prop (BEM-child: __loader surface)', () => {
    it('emits no font-size override when fontSize is unset', () => {
        const wrapper = mountInfiniteScroll()
        const side = wrapper.find('[role="status"]')
        const style = side.attributes('style') || ''
        expect(style).not.toContain('--origam-infinite-scroll__loader---font-size')
    })

    it('fontSize="lg" → --origam-infinite-scroll__loader---font-size: var(--origam-font__size---lg)', () => {
        const wrapper = mountInfiniteScroll({ fontSize: 'lg' })
        const side = wrapper.find('[role="status"]')
        const style = side.attributes('style') || ''
        expect(style).toContain('--origam-infinite-scroll__loader---font-size: var(--origam-font__size---lg)')
    })

    it('fontSize="xs" → --origam-infinite-scroll__loader---font-size: var(--origam-font__size---xs)', () => {
        const wrapper = mountInfiniteScroll({ fontSize: 'xs' })
        const side = wrapper.find('[role="status"]')
        const style = side.attributes('style') || ''
        expect(style).toContain('--origam-infinite-scroll__loader---font-size: var(--origam-font__size---xs)')
    })

    it('fontSize="2xl" → --origam-infinite-scroll__loader---font-size: var(--origam-font__size---2xl)', () => {
        const wrapper = mountInfiniteScroll({ fontSize: '2xl' })
        const side = wrapper.find('[role="status"]')
        const style = side.attributes('style') || ''
        expect(style).toContain('--origam-infinite-scroll__loader---font-size: var(--origam-font__size---2xl)')
    })
})
