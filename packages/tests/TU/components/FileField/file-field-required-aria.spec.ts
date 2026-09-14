// Regression for #422 — same fix as PasswordField/TextField: `required` was
// declared on IFieldProps but never reached `aria-required` on the real
// <input type="file">. Fixed centrally in OrigamField's `slotProps`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamFileField — required reaches aria-required on the real <input type="file"> (#422)', () => {
    it('sets aria-required="true" when required is true', async () => {
        const wrapper = mount(OrigamFileField, {
            props: { required: true } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input[type="file"]')
        expect(input.exists()).toBe(true)
        expect(input.attributes('aria-required')).toBe('true')
        wrapper.unmount()
    })

    it('sets no aria-required when required is unset', async () => {
        const wrapper = mount(OrigamFileField, {
            props: {} as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input[type="file"]')
        expect(input.attributes('aria-required')).toBeUndefined()
        wrapper.unmount()
    })
})
