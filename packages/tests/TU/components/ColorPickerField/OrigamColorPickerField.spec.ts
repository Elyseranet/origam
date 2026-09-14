// Unit tests for <OrigamColorPickerField> — useDefaults wiring (issue #242)
//
// Strategy: mount the real component tree (same approach as
// OrigamSelect.spec.ts / OrigamNumberField.spec.ts) with createOrigam()
// under a custom theme. OrigamColorPickerField only called withDefaults(),
// never useDefaults() — its own legacy `rounded: true` / `border: true`
// booleans always won, so theme.components['origam-color-picker-field']
// was a silent no-op. The component forwards its resolved props to the
// internal <origam-text-field> via a template-ref-gated `textFieldProps`
// computed (populates one tick after first mount) — same timing already
// relied on by OrigamSelect / OrigamNumberField.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamColorPickerField from '@origam/components/ColorPickerField/OrigamColorPickerField.vue'
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

class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

async function mountColorPickerFieldThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-color-picker-field': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamColorPickerField, {
        props: props as never,
        attachTo: document.body,
        global: { plugins: [origam] }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamColorPickerField — useDefaults (theme components wiring)', () => {
    it('renders with class origam-color-picker-field', async () => {
        const wrapper = await mountColorPickerFieldThemed({})
        expect(wrapper.classes()).toContain('origam-color-picker-field')
    })

    it('resolves rounded="lg" from theme.components[\'origam-color-picker-field\'] on the forwarded field surface', async () => {
        const wrapper = await mountColorPickerFieldThemed({ rounded: 'lg' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-lg')
    })

    it('without a theme override, the field falls back to the component\'s own legacy rounded=true (rounded-md chrome)', async () => {
        const wrapper = await mountColorPickerFieldThemed({})
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-md')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountColorPickerFieldThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-sm')
        expect(field.classes()).not.toContain('origam--rounded-lg')
    })
})

// ---------------------------------------------------------------------------
// #665 — `const label` locally declared in <script setup> masked the `label`
// PROP (`IColorPickerFieldProps` -> `ITextFieldProps` -> `IFieldProps.label`,
// field.interface.ts:43). Both `:aria-label` and `:title` on the forwarded
// `<origam-text-field>` read the bare `label` identifier, which Vue resolves
// to the LOCAL computed (`menu.value ? props.closeText : props.openText`)
// rather than the prop — every `<origam-color-picker-field>` announced
// "Open"/"Close" instead of its own `label`, regardless of locale.
//
// Same defect and same correction as OrigamSelect (#622 / PR #656).
//
// Mounted in `fr` on purpose: a regression that swapped the local for
// `props.label` while still reading an English literal would stay green
// against an English assertion.
//
// These assertions read ATTRIBUTES, not computed styles — jsdom is a valid
// tool here (the `getComputedStyle` / `var()` blindness documented in
// CLAUDE.md does not apply to attribute reads).
// ---------------------------------------------------------------------------
describe('OrigamColorPickerField — #665 le nom accessible est le label du champ, pas le libelle du bouton d ouverture', () => {
    it('aria-label et title sur l input refletent props.label (fr)', async () => {
        const wrapper = mount(OrigamColorPickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { label: 'Couleur de marque' } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Couleur de marque')
        expect(input.attributes('title')).toBe('Couleur de marque')
    })

    it('ne regresse pas la locale en (memes assertions)', async () => {
        const wrapper = mount(OrigamColorPickerField, {
            global: { plugins: [createOrigam()] },
            props: { label: 'Brand color' } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Brand color')
        expect(input.attributes('title')).toBe('Brand color')
    })

    it('repli sur openText quand aucun label n est fourni (fr, menu ferme)', async () => {
        const wrapper = mount(OrigamColorPickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: {} as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Ouvrir')
    })

    it('repli sur closeText quand aucun label n est fourni (fr, menu ouvert des le montage)', async () => {
        const wrapper = mount(OrigamColorPickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { menu: true } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Fermer')
    })

    it('props.label gagne sur l etat du menu (le libelle ne change pas a l ouverture)', async () => {
        const wrapper = mount(OrigamColorPickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { label: 'Couleur de marque', menu: true } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Couleur de marque')
    })
})
