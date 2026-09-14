// Unit tests for <OrigamDatePickerField> — useDefaults wiring (issue #242)
//
// Strategy: mount the real component tree (same approach as
// OrigamSelect.spec.ts / OrigamColorPickerField.spec.ts) with createOrigam()
// under a custom theme. OrigamDatePickerField only called withDefaults(),
// never useDefaults() — its own legacy `rounded: true` / `border: true`
// booleans always won, so theme.components['origam-date-picker-field'] was
// a silent no-op. The component forwards its resolved props to the internal
// <origam-text-field> via a template-ref-gated `textFieldProps` computed
// (populates one tick after first mount) — same timing already relied on
// by OrigamSelect / OrigamNumberField / OrigamColorPickerField.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamDatePickerField from '@origam/components/DatePickerField/OrigamDatePickerField.vue'
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

async function mountDatePickerFieldThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-date-picker-field': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamDatePickerField, {
        props: props as never,
        attachTo: document.body,
        global: { plugins: [origam] }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamDatePickerField — useDefaults (theme components wiring)', () => {
    it('renders with class origam-date-picker-field', async () => {
        const wrapper = await mountDatePickerFieldThemed({})
        expect(wrapper.classes()).toContain('origam-date-picker-field')
    })

    it('resolves rounded="lg" from theme.components[\'origam-date-picker-field\'] on the forwarded field surface', async () => {
        const wrapper = await mountDatePickerFieldThemed({ rounded: 'lg' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-lg')
    })

    it('without a theme override, the field falls back to the component\'s own legacy rounded=true (rounded-md chrome)', async () => {
        const wrapper = await mountDatePickerFieldThemed({})
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-md')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountDatePickerFieldThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-sm')
        expect(field.classes()).not.toContain('origam--rounded-lg')
    })
})

// ---------------------------------------------------------------------------
// #411 — the `multiple` mode default chip carried hardcoded RGB literals
// (`bgColor: 'rgba(168, 168, 168, 1)'`, `color: 'rgb(255, 255, 255)'`),
// identical copy-paste to OrigamSelect's pre-#456 defect, bypassing the
// theme regardless of which theme was active. `chipSlotProps` now omits
// both so `<OrigamChip>` resolves its own themed default
// (`--origam-chip---background-color` / `--origam-chip---color`, both
// declared in the token stylesheets).
// ---------------------------------------------------------------------------
describe('OrigamDatePickerField — chip default color is theme-driven, not hardcoded (#411)', () => {
    it('does not force an inline background-color / color on the default chip', async () => {
        const wrapper = await mountDatePickerFieldThemed({}, {
            multiple: true,
            modelValue: [new Date('2024-01-01'), new Date('2024-01-02')]
        })

        const chip = wrapper.find('.origam-chip')
        expect(chip.exists()).toBe(true)

        const style = chip.attributes('style') ?? ''
        expect(style).not.toContain('168, 168, 168')
        expect(style).not.toContain('255, 255, 255')
    })
})
