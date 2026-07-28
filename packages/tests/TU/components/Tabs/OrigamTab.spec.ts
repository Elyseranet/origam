// Unit tests for <OrigamTab> — typography props (ITypographyProps surface
// wired by useTypography with the 'tabs__item' varPrefix).
//
// OrigamTab MUST be mounted inside OrigamTabs (it throws otherwise).
// We reuse the same strategy as OrigamTabs.spec.ts: mount OrigamTabs
// and pass OrigamTab children as slots via h().
//
// OrigamTab binds its computed styles via the inline `:style="tabStyles"`
// attribute on the root element. Since the DOM id is `tabDomId` (not the
// useStyle-generated id), the useStyle scoped-CSS path targets nothing —
// the inline `:style` is the effective mechanism. Assertions read the
// `style` attribute on `[role="tab"]` elements.
//
// SCSS analysis (OrigamTab.vue) — vars with a real visual effect:
//   --origam-tabs__item---font-size      → fontSize ✓
//   --origam-tabs__item---font-weight    → fontWeight ✓
//   --origam-tabs__item---letter-spacing → letterSpacing ✓
//   line-height: 1 is HARDCODED (no var) → lineHeight intentionally omitted.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import OrigamTabs from '@origam/components/Tabs/OrigamTabs.vue'
import OrigamTab from '@origam/components/Tabs/OrigamTab.vue'
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

const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        OrigamDefaultsProvider: { template: '<slot/>' },
        OrigamIcon: { template: '<span/>' }
    }
})

function buildTab (tabProps: Record<string, unknown> = {}) {
    return mount(OrigamTabs, {
        props: { modelValue: 'a' },
        slots: {
            default: () => [h(OrigamTab, { value: 'a', text: 'Tab A', ...tabProps })]
        },
        attachTo: document.body,
        global: makeGlobal()
    })
}

function styleOfTab (tabProps: Record<string, unknown> = {}): string {
    const wrapper = buildTab(tabProps)
    const style = wrapper.find('[role="tab"]').attributes('style') || ''
    wrapper.unmount()
    return style
}

describe('OrigamTab — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        expect(styleOfTab()).not.toContain('--origam-tabs__item---font-size:')
    })

    it('fontSize="xl" sets the font-size var to the xl token', () => {
        expect(styleOfTab({ fontSize: 'xl' })).toContain('--origam-tabs__item---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="xs" sets the font-size var to the xs token', () => {
        expect(styleOfTab({ fontSize: 'xs' })).toContain('--origam-tabs__item---font-size: var(--origam-font__size---xs)')
    })
})

describe('OrigamTab — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        expect(styleOfTab()).not.toContain('--origam-tabs__item---font-weight:')
    })

    it('fontWeight="bold" sets the font-weight var to the bold token (700)', () => {
        expect(styleOfTab({ fontWeight: 'bold' })).toContain('--origam-tabs__item---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="semibold" sets the font-weight var to the semibold token (600)', () => {
        expect(styleOfTab({ fontWeight: 'semibold' })).toContain('--origam-tabs__item---font-weight: var(--origam-font__weight---semibold)')
    })
})

describe('OrigamTab — letterSpacing prop', () => {
    it('emits no letter-spacing override when letterSpacing is unset', () => {
        expect(styleOfTab()).not.toContain('--origam-tabs__item---letter-spacing:')
    })

    it('letterSpacing="widest" sets the letter-spacing var to the widest token', () => {
        expect(styleOfTab({ letterSpacing: 'widest' })).toContain('--origam-tabs__item---letter-spacing: var(--origam-font__letterSpacing---widest)')
    })

    it('letterSpacing="tight" sets the letter-spacing var to the tight token', () => {
        expect(styleOfTab({ letterSpacing: 'tight' })).toContain('--origam-tabs__item---letter-spacing: var(--origam-font__letterSpacing---tight)')
    })
})

// Regression guard for #250: the root `<component :is="…">` used to read a
// bare `tag` in `<script setup>`, which resolves against Vue's raw $props —
// NOT the `useDefaults()` Proxy assigned to the local `props` variable —
// unless written as `props.tag` explicitly. See OrigamTable.vue / #249 for
// the full writeup of this footgun.
describe('OrigamTab — useDefaults (theme components wiring)', () => {
    function buildTabThemed (componentDefaults: Record<string, unknown>, tabProps: Record<string, unknown> = {}) {
        const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-tab': componentDefaults }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
        return mount(OrigamTabs, {
            props: { modelValue: 'a' },
            slots: { default: () => [h(OrigamTab, { value: 'a', text: 'Tab A', ...tabProps })] },
            attachTo: document.body,
            global: {
                plugins: [origam],
                stubs: {
                    OrigamDefaultsProvider: { template: '<slot/>' },
                    OrigamIcon: { template: '<span/>' }
                }
            }
        })
    }

    it('resolves tag="span" from theme.components[\'origam-tab\'] when not passed', () => {
        const wrapper = buildTabThemed({ tag: 'span' })
        expect(wrapper.find('[role="tab"]').element.tagName).toBe('SPAN')
        wrapper.unmount()
    })
})
