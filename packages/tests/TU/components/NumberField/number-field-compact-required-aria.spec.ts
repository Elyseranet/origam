// Regression for #422 — compact NumberField renders its own custom
// role="spinbutton" <input> (not routed through <OrigamField> at all), so
// the central OrigamField `slotProps` fix does not reach it. Fixed locally:
// added `:aria-required="required ? 'true' : undefined"` next to the
// existing aria-valuenow/min/max/valuetext bindings.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamNumberField — compact mode: required reaches aria-required (#422)', () => {
    it('sets aria-required="true" on the compact input when required is true', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { compact: true, required: true } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('[data-cy="numberfield-compact-input"]')
        expect(input.exists()).toBe(true)
        expect(input.attributes('aria-required')).toBe('true')
        wrapper.unmount()
    })

    it('sets no aria-required on the compact input when required is unset', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { compact: true } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('[data-cy="numberfield-compact-input"]')
        expect(input.attributes('aria-required')).toBeUndefined()
        wrapper.unmount()
    })
})
