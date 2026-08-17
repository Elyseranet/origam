import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamBottomNav, OrigamBtn, OrigamDefaultsProvider } from '@origam/components'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const ITEMS = [{ text: 'A' }, { text: 'B' }]

// Regression coverage for #263, applied to `<origam-bottom-nav>`.
//
// The component pushes its own visual-token props into the `'origam-btn'`
// slot defaults it provides to the buttons it renders. Forwarding a prop the
// consumer never set is not harmless: `mergeDeep` (used by
// `provideDefaults`/`useDefaults` to combine this map with an ancestor/theme
// `'origam-btn'` entry) copies it unconditionally and silently overwrites the
// theme default.
//
// A plain `undefined` filter cannot catch it either: `color` / `bgColor` are
// `TColor`, which includes `false`, and `hover` / `active` are
// `boolean | IHoverState / IActiveState` — so Vue's boolean-prop coercion
// resolves each UNSET prop to the concrete value `false`, never to
// `undefined`. `usePassedProps` reads `vnode.props` directly and therefore
// tells the truth regardless of the coercion.

const themedNavBtnClass = (props: Record<string, unknown> = {}): string => {
    const theme: IOrigamTheme = {
        name: 'navtest',
        mode: 'light',
        components: { 'origam-btn': { color: 'success', density: 'comfortable' } },
        vars: {}
    }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('navtest', 'light')

    const wrapper = mount(OrigamBottomNav, {
        props: { items: ITEMS, ...props } as never,
        global: { plugins: [origam] }
    })
    return wrapper.find('.origam-btn').attributes('class') ?? ''
}

const themedSoloBtnClass = (): string => {
    const theme: IOrigamTheme = {
        name: 'navtest-solo',
        mode: 'light',
        components: { 'origam-btn': { color: 'success', density: 'comfortable' } },
        vars: {}
    }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('navtest-solo', 'light')

    return mount(OrigamBtn, { global: { plugins: [origam] } })
        .find('.origam-btn').attributes('class') ?? ''
}

describe('OrigamBottomNav — does NOT clobber ancestor/theme btn defaults (#263)', () => {
    it('preserves the theme `color: "success"` default when the nav passes no color prop', () => {
        const cls = themedNavBtnClass()
        expect(cls, `rendered: "${cls}"`).toMatch(/origam--color-success\b/)
    })

    it('preserves the theme `density: "comfortable"` default when the nav passes no density prop', () => {
        const cls = themedNavBtnClass()
        expect(cls, `rendered: "${cls}"`).toMatch(/origam-btn--density-comfortable\b/)
    })

    it('a nav-wrapped button resolves the same theme defaults as a standalone button', () => {
        const solo = themedSoloBtnClass()
        const nav = themedNavBtnClass()
        // The nav adds its own BEM child class; every OTHER token class must match.
        const strip = (c: string) => c.split(/\s+/).filter(Boolean).filter(t => t !== 'origam-bottom-nav__btn').sort().join(' ')
        expect(strip(nav), `solo="${solo}" nav="${nav}"`).toBe(strip(solo))
    })

    it('an EXPLICIT `color` on the nav still reaches the buttons', () => {
        const cls = themedNavBtnClass({ color: 'warning' })
        expect(cls, `rendered: "${cls}"`).toMatch(/origam--color-warning\b/)
    })

    it('forwards no key the consumer never passed', () => {
        const wrapper = mount(OrigamBottomNav, {
            props: { items: ITEMS } as never,
            global: { plugins: [createOrigam()] }
        })
        const forwarded = wrapper.findComponent(OrigamDefaultsProvider).props('defaults') as Record<string, Record<string, unknown>>
        expect(Object.keys(forwarded['origam-btn'] ?? {}), JSON.stringify(forwarded)).toEqual([])
    })
})
