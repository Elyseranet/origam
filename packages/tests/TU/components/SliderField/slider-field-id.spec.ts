// Regression for #421 — a consumer-supplied `id` never reached the real
// <input type="range"> rendered by <OrigamSliderField> (single-thumb mode).
// Same root cause as OrigamPasswordField (#421): the `filterProps` call
// feeding <origam-input> excluded `id`, so OrigamInput invented its own
// instead of receiving the consumer's.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamSliderField — consumer id reaches the real <input type="range"> (#421)', () => {
    it('renders the consumer-supplied id on the real range input, not a generated one', async () => {
        const wrapper = mount(OrigamSliderField, {
            props: { id: 'my-slider-id' } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input.origam-slider-field__input')
        expect(input.exists()).toBe(true)
        expect(input.attributes('id')).toBe('my-slider-id')
        wrapper.unmount()
    })
})
