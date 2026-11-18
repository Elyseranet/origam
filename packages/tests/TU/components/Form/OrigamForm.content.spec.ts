// OrigamForm — contentDisplay / contentGap (shared IContentProps with OrigamCard).
// jsdom cannot resolve var(), so this pins the inline declaration, the theme channel
// and the prop surface; the rendered layout is asserted in packages/tests/e2e/form.spec.ts.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamForm from '@origam/components/Form/OrigamForm.vue'
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

function mountThemed (componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-form': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    return mount(OrigamForm, { props: props as never, global: { plugins: [origam] } })
}

const style = (w: ReturnType<typeof mountThemed>) => w.find('.origam-form__content').attributes('style') ?? ''

describe('OrigamForm — content wrapper', () => {
    it('declares contentDisplay and contentGap in its runtime props', () => {
        const props = (OrigamForm as unknown as { props: Record<string, unknown> }).props
        expect(Object.keys(props)).toContain('contentDisplay')
        expect(Object.keys(props)).toContain('contentGap')
    })

    it('emits no inline style on the wrapper by default', () => {
        const w = mountThemed({})
        expect(w.find('.origam-form__content').exists()).toBe(true)
        expect(style(w)).toBe('')
    })

    it('paints display and gap inline on the wrapper only', () => {
        const w = mountThemed({}, { contentDisplay: 'grid', contentGap: 16 })
        expect(style(w)).toContain('display: grid')
        expect(style(w)).toContain('gap: 16px')
        expect(w.attributes('style') ?? '').not.toContain('gap')
    })

    it('resolves both from theme.components[\'origam-form\'] and lets props win', () => {
        const themed = mountThemed({ contentDisplay: 'grid', contentGap: '1rem' })
        expect(style(themed)).toContain('display: grid')
        expect(style(themed)).toContain('gap: 1rem')
        expect(style(mountThemed({ contentGap: '1rem' }, { contentGap: '2rem' }))).toContain('gap: 2rem')
    })
})
