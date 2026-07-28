// Unit tests for <OrigamBtnGroup> — #274 (slotDefaults clobbering child
// theme defaults) + #250 (`:is="tag"` bypassing useDefaults).
//
// Strategy: mirrors packages/tests/TU/components/Avatar/avatar-group-defaults.spec.ts
// (the reference fix for the SAME class of bug, #263) and
// packages/tests/TU/components/Alert/OrigamAlert.spec.ts (the reference fix
// for the `:is="tag"` bug, #249).

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import OrigamBtnGroup from '@origam/components/Btn/OrigamBtnGroup.vue'
import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

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

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const ITEMS = [{ text: 'A' }, { text: 'B' }]

const childClass = (props: Record<string, unknown> = {}): string => {
    const wrapper = mount(OrigamBtnGroup, {
        props: { items: ITEMS, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
    return wrapper.find('.origam-btn').attributes('class') ?? ''
}

// ---------------------------------------------------------------------------
// Sanity — explicit props on the group still reach the children (the
// documented "parent provides defaults, child overrides" contract).
// ---------------------------------------------------------------------------
describe('OrigamBtnGroup — density/color/bgColor/size propagation', () => {
    it('propagates density to child buttons', () => {
        const base = childClass({})
        const withProp = childClass({ density: 'comfortable' })
        expect(withProp, `base="${base}" with="${withProp}"`).not.toBe(base)
        expect(withProp).toMatch(/density-comfortable/)
    })

    it('propagates size to child buttons', () => {
        const base = childClass({})
        const withProp = childClass({ size: 'large' })
        expect(withProp, `base="${base}" with="${withProp}"`).not.toBe(base)
        expect(withProp).toMatch(/size-large/)
    })
})

// ---------------------------------------------------------------------------
// #274 — a prop the CONSUMER never passed to `<origam-btn-group>` must NOT
// be forwarded to children, else it silently clobbers an ancestor/theme
// `'origam-btn'` default (`mergeDeep` copies it unconditionally). For
// `hover` / `active` this is not even an `undefined` — both are typed
// `boolean | IHoverState / IActiveState`, so Vue resolves an unset prop to
// the concrete value `false`, never `undefined` — a naive `omitUndefined`
// filter cannot catch it. `usePassedProps` reads `vnode.props` directly, so
// it tells the truth regardless of Vue's boolean coercion.
// ---------------------------------------------------------------------------
describe('OrigamBtnGroup — does NOT clobber ancestor/theme btn defaults (#274)', () => {
    const themeWithBtnDefaults: IOrigamTheme = {
        name: 'glasslike',
        mode: 'light',
        // `density: 'comfortable'` is distinct from OrigamBtnGroup's own
        // baked default (`DENSITY.DEFAULT`), so a pass turns green only if
        // the theme default genuinely survived.
        components: { 'origam-btn': { density: 'comfortable', active: true } },
        vars: {}
    }

    const themedChildClass = (props: Record<string, unknown> = {}): string => {
        const origam = createOrigam({ themes: [themeWithBtnDefaults] })
        origam._defaultsRef.value = origam._activeDefaultsFor('glasslike', 'light')

        const wrapper = mount(OrigamBtnGroup, {
            props: { items: ITEMS, ...props } as never,
            global: { plugins: [origam] }
        })
        return wrapper.find('.origam-btn').attributes('class') ?? ''
    }

    it('preserves the theme `density: "comfortable"` default when the group passes no density prop', () => {
        const cls = themedChildClass()
        expect(cls).toMatch(/origam-btn--density-comfortable\b/)
    })

    it('preserves the theme `active: true` default when the group passes no active prop (boolean-coercion trap)', () => {
        const cls = themedChildClass()
        expect(cls).toMatch(/origam-btn--active\b/)
    })

    it('an EXPLICIT `density="compact"` on the group still overrides the theme default', () => {
        const cls = themedChildClass({ density: 'compact' })
        expect(cls).toMatch(/origam-btn--density-compact\b/)
        expect(cls).not.toMatch(/origam-btn--density-comfortable\b/)
    })

    it('an EXPLICIT `active={false}` on the group still overrides the theme default', () => {
        const cls = themedChildClass({ active: false })
        expect(cls).not.toMatch(/origam-btn--active\b/)
    })
})

// ---------------------------------------------------------------------------
// #274 — `variant` is the ONE deliberate exception: it is forwarded
// UNCONDITIONALLY (not gated on `usePassedProps`), because the group's own
// RESOLVED variant (whether explicitly passed OR resolved from a theme's
// `'origam-btn-group'` defaults) must always reach the children — otherwise
// a themed `<origam-btn-toggle variant="outlined">` gets the right root
// chrome but every child silently stays on 'text', so the active/selected
// segment never fills (no visible selection at all).
// ---------------------------------------------------------------------------
describe('OrigamBtnGroup — deliberate `variant` forwarding for the toggle active segment', () => {
    it('an explicit variant="outlined" on the group reaches the children', () => {
        const cls = childClass({ variant: 'outlined' })
        expect(cls).toMatch(/origam-btn--variant-outlined\b/)
    })

    it('a THEME-resolved group variant (never passed on the tag) still reaches the children, and the active segment fills', () => {
        const themeWithGroupVariant: IOrigamTheme = {
            name: 'toggle-theme',
            mode: 'light',
            // Configured on the GROUP itself, not on 'origam-btn' — this is
            // resolved via `useDefaults(_props)` on OrigamBtnGroup's OWN
            // props, not via `usePassedProps`, so it is NOT gated by
            // whether the consumer wrote `variant=` on `<origam-btn-group>`.
            components: { 'origam-btn-group': { variant: 'outlined' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [themeWithGroupVariant] })
        origam._defaultsRef.value = origam._activeDefaultsFor('toggle-theme', 'light')

        const wrapper = mount(OrigamBtnGroup, {
            props: { items: [{ text: 'A', active: true }, { text: 'B' }] } as never,
            global: { plugins: [origam] }
        })

        const buttons = wrapper.findAll('.origam-btn')
        const activeBtn = buttons.find(b => b.classes().includes('origam-btn--active'))

        expect(activeBtn, `rendered classes: ${buttons.map(b => b.attributes('class')).join(' | ')}`).toBeTruthy()
        expect(activeBtn!.classes()).toContain('origam-btn--variant-outlined')
        expect(activeBtn!.classes()).toContain('origam-btn--active')
    })
})

// ---------------------------------------------------------------------------
// #250 — the root `<component :is="…">` used to read a bare `tag` in
// `<script setup>`, which resolves against Vue's raw $props — NOT the
// `useDefaults()` Proxy assigned to the local `props` variable — unless
// written as `props.tag` explicitly. See OrigamTable.vue / #249 for the
// full writeup of this footgun.
// ---------------------------------------------------------------------------
describe('OrigamBtnGroup — useDefaults (theme components wiring)', () => {
    function mountGroupThemed (componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
        const theme: IOrigamTheme = {
            name: 'brandx',
            mode: 'light',
            components: { 'origam-btn-group': componentDefaults },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
        return mount(OrigamBtnGroup, {
            props: { items: ITEMS, ...props } as never,
            global: { plugins: [origam] }
        })
    }

    it('uses <div> as default root tag', () => {
        const wrapper = mount(OrigamBtnGroup, {
            props: { items: ITEMS } as never,
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.element.tagName).toBe('DIV')
    })

    it('resolves tag="nav" from theme.components[\'origam-btn-group\'] when not passed', () => {
        const wrapper = mountGroupThemed({ tag: 'nav' })
        expect(wrapper.element.tagName).toBe('NAV')
    })
})

// ---------------------------------------------------------------------------
// Sanity — the `<slot name="item">` path (used by e.g. OrigamBtnToggle)
// still resolves the same way as the default `items` path.
// ---------------------------------------------------------------------------
describe('OrigamBtnGroup — slot-driven children', () => {
    it('forwards resolved defaults to children rendered via the default slot', () => {
        const wrapper = mount(OrigamBtnGroup, {
            props: { density: 'comfortable' } as never,
            slots: { default: () => [h(OrigamBtn, { text: 'A' }), h(OrigamBtn, { text: 'B' })] },
            global: { plugins: [createOrigam()] }
        })
        const cls = wrapper.find('.origam-btn').attributes('class') ?? ''
        expect(cls).toMatch(/density-comfortable/)
    })
})
