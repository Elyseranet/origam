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
import { INFINITE_SCROLL_MODE, INFINITE_SCROLL_SIDE } from '@origam/enums'

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

function mountInfiniteScroll (props: Record<string, unknown> = {}, locale?: string) {
    return mount(OrigamInfiniteScroll, {
        props: { ...props } as never,
        global: { plugins: [createOrigam(locale ? { locale: { locale } } : undefined)] }
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

describe('OrigamInfiniteScroll — #423 end-side gate (hasStartIntersect vs hasEndIntersect)', () => {
    // Pre-fix: the bottom `__side` div (scoped to INFINITE_SCROLL_SIDE.END —
    // error/empty/loading/loadMore slots) was gated by `v-if="hasStartIntersect"`
    // instead of `hasEndIntersect`. `side` defaults to END, so on the default
    // configuration NEITHER `__side` div rendered any content: the top one is
    // itself gated by `hasStartIntersect` (false for side="end"), and the
    // bottom one inherited the same (wrong) condition.
    it('side="end" (the default) renders the bottom #empty slot content', () => {
        const wrapper = mountInfiniteScroll({ side: INFINITE_SCROLL_SIDE.END })
        const sides = wrapper.findAll('[role="status"]')
        expect(sides).toHaveLength(2)
        expect(sides[1].text()).toContain('No more')
    })

    it('side="end" renders NOTHING in the top #empty slot (start-only content)', () => {
        const wrapper = mountInfiniteScroll({ side: INFINITE_SCROLL_SIDE.END })
        const sides = wrapper.findAll('[role="status"]')
        expect(sides[0].text()).toBe('')
    })

    it('side="start" renders the top #empty slot content, and nothing at the bottom', () => {
        const wrapper = mountInfiniteScroll({ side: INFINITE_SCROLL_SIDE.START })
        const sides = wrapper.findAll('[role="status"]')
        expect(sides[0].text()).toContain('No more')
        expect(sides[1].text()).toBe('')
    })

    it('side="both" renders the #empty slot content on both sides', () => {
        const wrapper = mountInfiniteScroll({ side: INFINITE_SCROLL_SIDE.BOTH })
        const sides = wrapper.findAll('[role="status"]')
        expect(sides[0].text()).toContain('No more')
        expect(sides[1].text()).toContain('No more')
    })
})

describe('OrigamInfiniteScroll — #413/#423 C8 rider: start loadMore button must be translatable', () => {
    // Pre-fix: the start-side default `loadMore` slot content hardcoded
    // `text="Load more"` while the end-side equivalent correctly used
    // `:text="t(loadMoreText)"` — same component, two different rules.
    //
    // Under the default `en` locale a hardcoded English literal and its
    // correctly-resolved translation are byte-identical, so this MUST be
    // exercised under `fr` (same trap documented in
    // chart-i18n-empty-state.spec.ts, #395) — an assertion against `en`
    // alone would pass with the bug still present.
    it('start-side default Load more button follows the fr locale, like the end side', () => {
        const wrapper = mountInfiniteScroll(
            { side: INFINITE_SCROLL_SIDE.START, mode: INFINITE_SCROLL_MODE.MANUAL },
            'fr'
        )
        const button = wrapper.findComponent({ name: 'OrigamBtn' })
        expect(button.exists()).toBe(true)
        expect(button.text()).toBe('Charger plus')
    })

    // Coupled to the #423 gate fix above: pre-fix, side="end" hides the
    // whole bottom `__side` block (wrong `hasStartIntersect` gate), so this
    // button doesn't even exist yet. Post-fix it does, and (unlike the
    // start side) it was already correctly translatable — this pins that
    // the #423 fix doesn't regress the part that was already right.
    it('end-side default Load more button follows the fr locale, once #423 stops hiding it', () => {
        const wrapper = mountInfiniteScroll(
            { side: INFINITE_SCROLL_SIDE.END, mode: INFINITE_SCROLL_MODE.MANUAL },
            'fr'
        )
        const button = wrapper.findComponent({ name: 'OrigamBtn' })
        expect(button.exists()).toBe(true)
        expect(button.text()).toBe('Charger plus')
    })
})
