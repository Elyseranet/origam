// Regression coverage for issue #684 — critere C4 (ADR-005).
//
// `OrigamInfiniteScrollIntersect` used to unwrap its computed
// `observerOptions.value` ONCE, synchronously in the body of `setup()`,
// before handing it to `useIntersectionObserver`. `beforeCreate` (where the
// theme-props-resolver patches `props.margin` from `theme.components`,
// ADR-005) fires AFTER `setup()` has already run — so a theme naming
// `origam-infinite-scroll-intersect.margin` could never reach the observer:
// the value was already frozen by the time the resolver wrote it.
//
// The fix (intersectionObserver.composable.ts) makes `useIntersectionObserver`
// consume `options` through a reactive `watch(() => toValue(options), …)`
// instead of a one-shot unwrap, recreating the native `IntersectionObserver`
// whenever the resolved options change — which includes the moment the
// theme resolver writes the themed `margin` right after `setup()` returns.
//
// Proven by mutation: reverting the composable/component fix (passing
// `observerOptions.value` instead of `observerOptions`) makes the
// "themed margin reaches the observer" assertion below fail — see the
// component report for the red-before-green run.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamInfiniteScrollIntersect from '@origam/components/InfiniteScroll/OrigamInfiniteScrollIntersect.vue'

// ─── stub IntersectionObserver, recording every constructor call ────────────

let constructorCalls: Array<IntersectionObserverInit | undefined>

function installIntersectionObserverStub () {
    constructorCalls = []

    class StubIO {
        constructor (_cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            constructorCalls.push(options)
        }
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', StubIO)
}

const THEME: IOrigamTheme = {
    name: 'infinite-scroll-margin-theme',
    mode: 'light',
    components: {
        'origam-infinite-scroll-intersect': { margin: '128px' }
    },
    vars: {}
}

describe('OrigamInfiniteScrollIntersect — theme.components["origam-infinite-scroll-intersect"].margin (#684, C4)', () => {
    beforeEach(installIntersectionObserverStub)
    afterEach(() => {
        vi.unstubAllGlobals()
        document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
    })

    it('reaches the observer with the raw prop when no theme names it (negative control)', async () => {
        const rootRef = document.createElement('div')
        const wrapper = mount(OrigamInfiniteScrollIntersect, {
            props: { rootRef, side: 'bottom' }
        })
        await nextTick()
        await nextTick()

        const lastCall = constructorCalls.at(-1)
        expect(lastCall?.rootMargin).toBeUndefined()

        wrapper.unmount()
    })

    it('an explicit prop still wins over the theme (explicit > theme, ADR-005 contract)', async () => {
        const origam = createOrigam({ themes: [THEME] })
        origam._defaultsRef.value = origam._activeDefaultsFor('infinite-scroll-margin-theme', 'light')

        const rootRef = document.createElement('div')
        const wrapper = mount(OrigamInfiniteScrollIntersect, {
            global: { plugins: [origam] },
            props: { rootRef, side: 'bottom', margin: '4px' }
        })
        await nextTick()
        await nextTick()

        const lastCall = constructorCalls.at(-1)
        expect(lastCall?.rootMargin).toBe('4px')

        wrapper.unmount()
    })

    it('a theme naming margin DOES reach the native IntersectionObserver (the actual gap, #684)', async () => {
        const origam = createOrigam({ themes: [THEME] })
        origam._defaultsRef.value = origam._activeDefaultsFor('infinite-scroll-margin-theme', 'light')

        const rootRef = document.createElement('div')
        const wrapper = mount(OrigamInfiniteScrollIntersect, {
            global: { plugins: [origam] },
            props: { rootRef, side: 'bottom' }
        })
        await nextTick()
        await nextTick()

        const lastCall = constructorCalls.at(-1)
        expect(lastCall?.rootMargin).toBe('128px')

        wrapper.unmount()
    })
})
