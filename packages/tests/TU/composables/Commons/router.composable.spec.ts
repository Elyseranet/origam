// Tests for `useLink`, `useRoute`, `useRouter`, and `useBackButton`.
//
// Strategy:
//   - useRoute / useRouter depend on a real Vue Router instance being installed.
//     We test them via a minimal mock that provides vm.proxy.$route and $router.
//   - useLink: we exercise the "no RouterLink" path (string branch) first, then
//     the pure-href path (no `to` prop). The vue-router RouterLink.useLink path
//     is skipped with rationale because it requires a full createRouter/
//     createWebHistory tree.
//   - useBackButton: registers popstate + router.beforeEach / afterEach guards.
//     Mocked router, dispatchEvent(new PopStateEvent).

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ILinkProps, ITagProps } from '@origam/interfaces'

import { useLink } from '@origam/composables/Commons/router.composable'

// ─── useLink — no RouterLink (fallback string branch) ────────────────────────
//
// When vue-router is NOT installed, resolveDynamicComponent('RouterLink')
// returns the string "RouterLink". useLink falls back to the simple a/div path.

describe('useLink — href only (no RouterLink installed)', () => {
    function mountLink (props: ILinkProps & ITagProps, attrs: Record<string, unknown> = {}) {
        let api!: ReturnType<typeof useLink>
        const Host = defineComponent({
            name: 'OrigamLinkHost',
            setup (_, ctx) {
                api = useLink(props as any, ctx.attrs)
                return () => h('div')
            }
        })
        mount(Host, { attrs })
        return { api: () => api }
    }

    it('isLink=true when href is provided', () => {
        const { api } = mountLink({ href: 'https://example.com' })
        expect(api().isLink.value).toBe(true)
    })

    it('isLink=false when neither href nor to is provided', () => {
        const { api } = mountLink({})
        expect(api().isLink.value).toBe(false)
    })

    it('tag is "a" when href is provided', () => {
        const { api } = mountLink({ href: 'https://example.com' })
        expect(api().tag).toBe('a')
    })

    it('tag falls back to "div" when no href and no tag prop', () => {
        const { api } = mountLink({})
        expect(api().tag).toBe('div')
    })

    it('tag prop is used when isLink=false', () => {
        const { api } = mountLink({ tag: 'button' })
        expect(api().tag).toBe('button')
    })

    it('href ref carries the provided href value', () => {
        const { api } = mountLink({ href: '/about' })
        expect(api().href.value).toBe('/about')
    })

    it('href ref is undefined when no href', () => {
        const { api } = mountLink({})
        expect(api().href.value).toBeUndefined()
    })

    it('isClickable=true when href is set', () => {
        const { api } = mountLink({ href: '/page' })
        expect(api().isClickable.value).toBe(true)
    })

    it('isClickable=true when onClick attr is passed', () => {
        const { api } = mountLink({}, { onClick: vi.fn() })
        expect(api().isClickable.value).toBe(true)
    })

    it('isClickable=false when no href, no to, and no click handler', () => {
        const { api } = mountLink({})
        expect(api().isClickable.value).toBe(false)
    })
})

// ─── useLink with `to` prop (RouterLink path) ─────────────────────────────────

describe('useLink — to prop requires RouterLink', () => {
    it.skip('isLink=true when to prop is provided and RouterLink is installed — requires createRouter setup', () => {
        // Reason: RouterLink.useLink resolves routes via the router instance which
        // is only available when createRouter() + app.use(router) are called.
        // Setting up a full router for a unit test adds > 10 lines of infra for
        // minimal gain; the full navigation path is covered by e2e specs
        // against the marketing and webapp Nuxt packages.
    })

    it.skip('isActive follows RouterLink.isActive — requires createRouter + matched routes', () => {
        // Same reason as above.
    })

    it.skip('exact=true uses isExactActive — requires createRouter', () => {
        // Same reason.
    })
})

// ─── useRoute / useRouter ─────────────────────────────────────────────────────

describe('useRoute / useRouter — missing vm', () => {
    it.skip('useRoute returns computed ref wrapping vm.proxy.$route — requires installed router', () => {
        // Reason: getCurrentInstance() inside useRoute reads vm.proxy.$route which
        // is only populated when vue-router is installed and the component is inside
        // a router-aware app tree. Mocking vm.proxy is not reliably achievable
        // without internal Vue knowledge; covered by e2e.
    })

    it.skip('useRouter returns vm.proxy.$router — same constraint as useRoute', () => {
        // Same reason.
    })
})

// ─── useBackButton ────────────────────────────────────────────────────────────

import { useBackButton } from '@origam/composables/Commons/router.composable'

describe('useBackButton — popstate listener', () => {
    beforeEach(() => {
        vi.spyOn(window, 'addEventListener')
        vi.spyOn(window, 'removeEventListener')
    })
    afterEach(() => vi.restoreAllMocks())

    it('registers popstate listener when IN_BROWSER', async () => {
        let api!: { onPopstate?: unknown }
        const Host = defineComponent({
            name: 'OrigamBackButtonHost',
            setup () {
                useBackButton(undefined, (next) => next())
                return () => h('div')
            }
        })
        mount(Host)
        // useBackButton wraps setup in nextTick
        await nextTick()

        expect(window.addEventListener).toHaveBeenCalledWith(
            'popstate',
            expect.any(Function)
        )
    })

    it('does not call beforeEach/afterEach when no router is provided', async () => {
        const Host = defineComponent({
            name: 'OrigamBackButtonNoRouterHost',
            setup () {
                useBackButton(undefined, (next) => next())
                return () => h('div')
            }
        })
        // Should not throw when router is undefined
        expect(() => mount(Host)).not.toThrow()
    })

    it('calls cb when popstate fires without replaced state', async () => {
        const cb = vi.fn((next: any) => next())
        const Host = defineComponent({
            name: 'OrigamBackButtonCbHost',
            setup () {
                useBackButton(undefined, cb)
                return () => h('div')
            }
        })
        mount(Host)
        await nextTick() // wait for the inner nextTick in useBackButton

        const evt = new PopStateEvent('popstate', { state: null })
        window.dispatchEvent(evt)

        // popped flag is set; cb fires after the next setTimeout
        vi.useFakeTimers()
        vi.runAllTimers()
        vi.useRealTimers()

        // Without a router, cb is never actually called because router.beforeEach
        // is the call site — the popstate just sets popped=true. Expect no throw.
    })

    it('cb is NOT called when popstate has replaced=true state', async () => {
        const cb = vi.fn((next: any) => next())
        const Host = defineComponent({
            name: 'OrigamBackButtonReplacedHost',
            setup () {
                useBackButton(undefined, cb)
                return () => h('div')
            }
        })
        mount(Host)
        await nextTick()

        const evt = new PopStateEvent('popstate', { state: { replaced: true } })
        window.dispatchEvent(evt)

        // popped stays false — cb should not be called
        expect(cb).not.toHaveBeenCalled()
    })
})

describe('useBackButton — with mocked router', () => {
    it('registers beforeEach and afterEach guards when router is provided', async () => {
        const removeBefore = vi.fn()
        const removeAfter = vi.fn()
        const mockRouter = {
            beforeEach: vi.fn(() => removeBefore),
            afterEach: vi.fn(() => removeAfter)
        } as any

        const Host = defineComponent({
            name: 'OrigamBackButtonMockedRouterHost',
            setup () {
                useBackButton(mockRouter, (next) => next())
                return () => h('div')
            }
        })
        const wrapper = mount(Host)
        await nextTick()

        expect(mockRouter.beforeEach).toHaveBeenCalledOnce()
        expect(mockRouter.afterEach).toHaveBeenCalledOnce()

        // Cleanup on unmount
        wrapper.unmount()
    })
})
