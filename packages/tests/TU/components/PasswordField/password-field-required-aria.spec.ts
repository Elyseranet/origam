// Regression for #422 — `required` was declared on IFieldProps (inherited
// via ITextFieldProps) but PasswordField's own `<input>` never received an
// `aria-required` attribute (unlike its sibling OrigamTextField, which
// already wired both `required` and `aria-required` directly). Fixed
// centrally in OrigamField's `slotProps` — PasswordField destructures
// `#default="{class, ref, ...fieldSlotProps}"` and spreads `fieldSlotProps`
// onto its real `<input>`, so the fix lands here with no PasswordField-local
// change needed.
//
// Full real component tree (no stubs) — mirrors password-field-id.spec.ts.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamPasswordField from '@origam/components/PasswordField/OrigamPasswordField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamPasswordField — required reaches aria-required on the real <input> (#422)', () => {
    it('sets aria-required="true" when required is true', async () => {
        const wrapper = mount(OrigamPasswordField, {
            props: { required: true } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input[type="password"], input[type="text"]')
        expect(input.exists()).toBe(true)
        expect(input.attributes('aria-required')).toBe('true')
        wrapper.unmount()
    })

    it('sets no aria-required when required is unset', async () => {
        const wrapper = mount(OrigamPasswordField, {
            props: {} as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input[type="password"], input[type="text"]')
        expect(input.attributes('aria-required')).toBeUndefined()
        wrapper.unmount()
    })
})
