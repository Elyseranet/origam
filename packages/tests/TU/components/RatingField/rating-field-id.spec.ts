// Regression for #421 / #381 — a consumer-supplied `id` never reached the
// rendered root of <OrigamRatingField>. Root cause: `const {id, ...} =
// useStyle(ratingFieldStyles)` — the LOCAL `id` returned by useStyle (a
// generated identifier) shadows the `id` PROP of the same name. The
// template's `:id="id"` on <origam-input> therefore bound the generated
// value, never the consumer's — a textbook #381 occurrence (useStyle called
// without its second `() => props.id` argument).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamRatingField from '@origam/components/RatingField/OrigamRatingField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamRatingField — consumer id threads through consistently (#421 / #381)', () => {
    it('the <label for> attribute matches the consumer-supplied id, not a generated one', async () => {
        const wrapper = mount(OrigamRatingField, {
            props: { id: 'my-rating-id', label: 'Rate this' } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const label = wrapper.find('label')
        expect(label.exists()).toBe(true)
        expect(label.attributes('for')).toBe('my-rating-id')
        wrapper.unmount()
    })
})
