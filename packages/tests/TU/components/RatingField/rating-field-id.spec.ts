// Regression for #421 / #381 — a consumer-supplied `id` never reached the
// rendered root of <OrigamRatingField>. Root cause: `const {id, ...} =
// useStyle(ratingFieldStyles)` — the LOCAL `id` returned by useStyle (a
// generated identifier) shadows the `id` PROP of the same name. The
// template's `:id="id"` on <origam-input> therefore bound the generated
// value, never the consumer's — a textbook #381 occurrence (useStyle called
// without its second `() => props.id` argument).
//
// ⚠️ #810 CHANGED WHAT THIS FILE CAN ASSERT.
//
// This spec used to read the consumer id back off `label[for]`. That worked,
// but only because it was measuring the DEFECT #810 removed: the `for`
// pointed at an id NO ELEMENT IN THE DOCUMENT CARRIED (verified in Chromium —
// `document.getElementById('origam-rating-field-v-2')` → `null`), so the
// assertion proved the id had been threaded through the props chain and
// nothing at all about the a11y relation.
//
// The rating now names its GROUP (`role="radiogroup"` + `aria-labelledby`)
// instead of labelling one control, so there is no `label[for]` left to read.
// The #421 / #381 contract is unchanged and is asserted below on the two
// places the consumer id still reaches — both derived from it, so both still
// fail if useStyle re-shadows the prop.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamRatingField from '@origam/components/RatingField/OrigamRatingField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamRatingField — consumer id threads through consistently (#421 / #381)', () => {
    it('derives the group-label id and the messages id from the consumer-supplied id', async () => {
        const wrapper = mount(OrigamRatingField, {
            props: { id: 'my-rating-id', label: 'Rate this' } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        // The group's accessible-name target.
        const labelWrapper = wrapper.find('.origam-rating-field__label')
        expect(labelWrapper.exists()).toBe(true)
        expect(labelWrapper.attributes('id')).toBe('my-rating-id-label')

        // The other consumer of the same id, untouched by #810.
        expect(wrapper.find('#my-rating-id-messages').exists()).toBe(true)

        // And the root points at it — a generated id here would mean useStyle
        // has re-shadowed the prop, which is exactly what #381 was.
        expect(wrapper.attributes('aria-labelledby')).toBe('my-rating-id-label')

        wrapper.unmount()
    })
})
