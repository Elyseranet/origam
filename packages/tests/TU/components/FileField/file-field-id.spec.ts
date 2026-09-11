// Regression for #421 — a consumer-supplied `id` never reached the real
// <input type="file"> rendered by <OrigamFileField> (non-dropzone / default
// mode). Same root cause as OrigamPasswordField (#421): the `filterProps`
// call feeding <origam-input> excluded `id`, so OrigamInput invented its own
// instead of receiving the consumer's.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamFileField — consumer id reaches the real <input type="file"> (#421)', () => {
    it('renders the consumer-supplied id on the real file input, not a generated one', async () => {
        const wrapper = mount(OrigamFileField, {
            props: { id: 'my-file-field-id' } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input[type="file"]')
        expect(input.exists()).toBe(true)
        expect(input.attributes('id')).toBe('my-file-field-id')
        wrapper.unmount()
    })
})
