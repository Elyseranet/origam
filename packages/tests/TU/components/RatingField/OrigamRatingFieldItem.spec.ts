// Unit tests for <OrigamRatingFieldItem> — C5 audit (does a declared emit
// really fire, and does a test prove it?).
//
// `OrigamRatingField.spec.ts` STUBS OUT `<OrigamRatingFieldItem>` entirely
// (`OrigamRatingFieldItemStub`, records clicks on the stub only) — the real
// component's own `click` / `mouseenter` / `mouseleave` relay from the
// nested `<origam-btn>` was never exercised by any test before this file.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamRatingFieldItem from '@origam/components/RatingField/OrigamRatingFieldItem.vue'
import { createOrigam } from '@origam/origam'

function mountItem (props: Record<string, unknown> = {}) {
    return mount(OrigamRatingFieldItem, {
        props: { value: 3, name: 'rating', length: 5, ...props },
        global: { plugins: [createOrigam({})] }
    })
}

describe('OrigamRatingFieldItem — click / mouseenter / mouseleave (C5)', () => {
    it('emits click when the inner star button is clicked', async () => {
        const wrapper = mountItem()

        await wrapper.find('.origam-btn').trigger('click')

        expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('emits mouseenter when the pointer enters the inner star button', async () => {
        const wrapper = mountItem()

        await wrapper.find('.origam-btn').trigger('mouseenter')

        expect(wrapper.emitted('mouseenter')).toBeTruthy()
    })

    it('emits mouseleave when the pointer leaves the inner star button', async () => {
        const wrapper = mountItem()

        await wrapper.find('.origam-btn').trigger('mouseleave')

        expect(wrapper.emitted('mouseleave')).toBeTruthy()
    })
})
