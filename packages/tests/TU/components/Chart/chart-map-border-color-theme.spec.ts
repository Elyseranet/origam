// #411 — `borderColor` on OrigamChartMap defaulted to the hardcoded literal
// `'rgba(0,0,0,0.2)'` and was applied to the country-path `stroke` verbatim,
// with no `resolveColor()` pass. Two consequences:
//
//   1. The value never routed through the intent resolver, so even when a
//      theme's `components['origam-chart-map'].borderColor` DID reach the
//      prop (it always could — `borderColor` was already a declared prop,
//      unlike Select/DatePickerField's chip literals which were child
//      overrides the resolver could never see), an intent name like
//      `'success'` landed straight in `stroke:` as an invalid CSS keyword
//      instead of the resolved `var(--origam-color__…---bg)` expression.
//   2. `lineColor` (the sibling colour prop, flight-routes mode) already
//      went through `resolveColor()` and already defaulted to a `TIntent`
//      (`'primary'`) — `borderColor` was the odd one out in the same file.
//
// Fix: `borderColor` is now typed `TIntent | string` (mirrors `lineColor`),
// defaults to `'neutral'`, and the template reads `resolveColor(borderColor)`
// instead of the bare prop. `resolveColor()` still passes raw CSS strings
// through unchanged (regex-gated: `#`, `rgb`, `hsl`, `var`, …), so a
// consumer's literal `borderColor="#ff00aa"` keeps working exactly as
// before — only the intent path was broken.
//
// These assertions read the LITERAL `style` attribute string Vue wrote
// (`wrapper.attributes('style')`), never `getComputedStyle` — the var()
// expression itself is the thing under test, not its resolved paint, so the
// jsdom `var()` blind spot documented in CLAUDE.md does not apply here.
// Same pattern already used by OrigamSelect's #456 theme spec
// (`border-radius: var(--origam-radius---lg, 12px)`).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamChartMap from '@origam/components/Chart/OrigamChartMap.vue'
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

const EMPTY_SERIES = [{ name: 'GDP', data: [] as Array<{ code: string, value: number }> }]

function firstCountryStyle (wrapper: ReturnType<typeof mount>): string {
    return wrapper.find('.origam-chart__map-country').attributes('style') ?? ''
}

async function mountMapThemed (componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-chart-map': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamChartMap, { props: { series: EMPTY_SERIES, ...props } as never, global: { plugins: [origam] } })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamChartMap — borderColor no longer bypasses resolveColor (#411)', () => {
    it('does NOT hardcode the old literal rgba(0,0,0,0.2) any more', () => {
        const wrapper = mount(OrigamChartMap, { props: { series: EMPTY_SERIES } as never, global: { plugins: [createOrigam()] } })
        expect(firstCountryStyle(wrapper)).not.toContain('rgba(0,0,0,0.2)')
    })

    it('default (no theme, no explicit prop) resolves the \'neutral\' intent to its token expression', () => {
        const wrapper = mount(OrigamChartMap, { props: { series: EMPTY_SERIES } as never, global: { plugins: [createOrigam()] } })
        expect(firstCountryStyle(wrapper)).toContain('stroke: var(--origam-color__action--secondary---bg)')
    })

    it('a theme naming borderColor as an intent reaches the prop AND renders as a resolved token expression (not the raw intent keyword)', async () => {
        const wrapper = await mountMapThemed({ borderColor: 'success' })
        const style = firstCountryStyle(wrapper)
        expect(style).toContain('stroke: var(--origam-color__feedback--success---bg)')
        expect(style).not.toContain('stroke: success')
    })

    it('a different themed intent produces a genuinely different resolved expression — the theme is not a no-op', async () => {
        const neutralWrapper = mount(OrigamChartMap, { props: { series: EMPTY_SERIES } as never, global: { plugins: [createOrigam()] } })
        const dangerWrapper = await mountMapThemed({ borderColor: 'danger' })

        const neutralStyle = firstCountryStyle(neutralWrapper)
        const dangerStyle = firstCountryStyle(dangerWrapper)

        expect(neutralStyle).toContain('stroke: var(--origam-color__action--secondary---bg)')
        expect(dangerStyle).toContain('stroke: var(--origam-color__feedback--danger---bg)')
        expect(dangerStyle).not.toBe(neutralStyle)
    })

    it('an explicitly passed custom CSS string still wins over the theme AND still passes through resolveColor unchanged', async () => {
        const wrapper = await mountMapThemed({ borderColor: 'success' }, { borderColor: 'rgba(10,20,30,0.5)' })
        expect(firstCountryStyle(wrapper)).toContain('stroke: rgba(10, 20, 30, 0.5)')
    })
})
