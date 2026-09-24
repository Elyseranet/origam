// #411 — `defaultCountryFill` on OrigamChartMap had the SAME defect as
// `borderColor` (fixed alongside it, same PR), one line above it in the
// same `allCountries` computed: applied to `fill` verbatim, no
// `resolveColor()` pass. An intent name is invalid CSS for `fill`, so the
// browser drops the declaration instead of repainting — a theme naming
// `components['origam-chart-map'].defaultCountryFill` made every dataless
// country invisible, not just "always the same grey".
//
// Fix: `defaultCountryFill` is now typed `TIntent | string` and the
// `allCountries` computed reads `resolveColor(props.defaultCountryFill)`.
// The DEFAULT stays the literal `'rgba(0,0,0,0.08)'` — deliberately NOT
// retyped to an intent. That literal is a semi-transparent SCRIM
// composited over whatever `bgColor` the chart itself renders on top of
// (self-adjusts to light/dark and to a custom `bgColor`); `resolveColor()`'s
// intent branch only ever returns a FIXED opaque token expression
// (`var(--origam-color__…---bg)`), which is not the same mechanism and
// would not reproduce the current rendering — moving the default would
// trade an adaptive behaviour for a fixed one, not "move a pixel for
// consistency". See the interface JSDoc for the same reasoning.
//
// Same literal-`style`-attribute-string assertion pattern as the sibling
// `chart-map-border-color-theme.spec.ts` — never `getComputedStyle` under
// jsdom (CLAUDE.md's documented `var()` blind spot).

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

// Every country is dataless here (empty series data), so `allCountries`
// always takes the `defaultCountryFill` branch, never `choroplethColorFor`.
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

describe('OrigamChartMap — defaultCountryFill no longer bypasses resolveColor (#411)', () => {
    it('default (no theme, no explicit prop) keeps the literal scrim unchanged', () => {
        const wrapper = mount(OrigamChartMap, { props: { series: EMPTY_SERIES } as never, global: { plugins: [createOrigam()] } })
        expect(firstCountryStyle(wrapper)).toContain('fill: rgba(0, 0, 0, 0.08)')
    })

    it('a theme naming defaultCountryFill as an intent reaches the prop AND renders as a resolved token expression (not the raw intent keyword)', async () => {
        const wrapper = await mountMapThemed({ defaultCountryFill: 'success' })
        const style = firstCountryStyle(wrapper)
        expect(style).toContain('fill: var(--origam-color__feedback--success---bg)')
        expect(style).not.toContain('fill: success')
    })

    it('a different themed intent produces a genuinely different resolved expression — the theme is not a no-op', async () => {
        const dangerWrapper = await mountMapThemed({ defaultCountryFill: 'danger' })
        const primaryWrapper = await mountMapThemed({ defaultCountryFill: 'primary' })

        const dangerStyle = firstCountryStyle(dangerWrapper)
        const primaryStyle = firstCountryStyle(primaryWrapper)

        expect(dangerStyle).toContain('fill: var(--origam-color__feedback--danger---bg)')
        expect(primaryStyle).toContain('fill: var(--origam-color__action--primary---bg)')
        expect(dangerStyle).not.toBe(primaryStyle)
    })

    it('an explicitly passed custom CSS string still wins over the theme AND still passes through resolveColor unchanged', async () => {
        const wrapper = await mountMapThemed({ defaultCountryFill: 'success' }, { defaultCountryFill: 'rgba(40,50,60,0.5)' })
        expect(firstCountryStyle(wrapper)).toContain('fill: rgba(40, 50, 60, 0.5)')
    })
})
