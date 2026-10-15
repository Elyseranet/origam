// #1100 — `contentDisplay` prop and `hover` typed as IHoverProps.
//
// jsdom cannot resolve var() (see CLAUDE.md), so this pins the INLINE
// declaration, the theme channel and the prop surface; the rendered layout
// is asserted in packages/tests/e2e/card.spec.ts.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamCard from '@origam/components/Card/OrigamCard.vue'
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

function mountThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-card': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    return mount(OrigamCard, { props: props as never, global: { plugins: [origam] } })
}

describe('OrigamCard — contentDisplay (#1100)', () => {
    it('declares contentDisplay and an object-capable hover in its runtime props', () => {
        const props = (OrigamCard as unknown as { props: Record<string, unknown> }).props
        expect(Object.keys(props)).toContain('contentDisplay')
        expect(Object.keys(props)).toContain('hover')
        expect(Object.keys(props)).toContain('hoverClass')
    })

    it('emits no inline display on the wrapper by default', () => {
        const wrapper = mountThemed({})
        const content = wrapper.find('.origam-card__content')
        expect(content.exists()).toBe(true)
        expect(content.attributes('style') ?? '').not.toContain('display')
    })

    it('contentDisplay="contents" paints display: contents inline on the wrapper only', () => {
        const wrapper = mountThemed({}, { contentDisplay: 'contents' })
        expect(wrapper.find('.origam-card__content').attributes('style')).toContain('display: contents')
        expect(wrapper.attributes('style') ?? '').not.toContain('card__content')
    })

    it('resolves contentDisplay from theme.components[\'origam-card\'] when not passed', () => {
        const wrapper = mountThemed({ contentDisplay: 'contents' })
        expect(wrapper.find('.origam-card__content').attributes('style')).toContain('display: contents')
    })

    it('an explicit contentDisplay beats the theme', () => {
        const wrapper = mountThemed({ contentDisplay: 'contents' }, { contentDisplay: 'grid' })
        expect(wrapper.find('.origam-card__content').attributes('style')).toContain('display: grid')
    })

    it('accepts an object for hover', () => {
        const wrapper = mountThemed({ flat: false }, { hover: { borderColor: 'danger' } })
        expect(wrapper.classes()).toContain('origam-card')
    })
})
