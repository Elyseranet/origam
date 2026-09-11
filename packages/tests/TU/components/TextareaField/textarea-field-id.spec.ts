// Regression for #421 — a consumer-supplied `id` never reached the real
// <textarea> rendered by <OrigamTextareaField>. Same root cause as
// OrigamPasswordField (#421): the `filterProps` call feeding <origam-input>
// excluded `id`, so OrigamInput invented its own instead of receiving the
// consumer's.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamTextareaField from '@origam/components/TextareaField/OrigamTextareaField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamTextareaField — consumer id reaches the real <textarea> (#421)', () => {
    it('renders the consumer-supplied id on the real <textarea>, not a generated one', async () => {
        const wrapper = mount(OrigamTextareaField, {
            props: { id: 'my-textarea-id' } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const textarea = wrapper.find('textarea')
        expect(textarea.exists()).toBe(true)
        expect(textarea.attributes('id')).toBe('my-textarea-id')
        wrapper.unmount()
    })
})
