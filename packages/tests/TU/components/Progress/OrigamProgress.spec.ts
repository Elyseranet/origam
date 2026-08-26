// Regression test for issue #434 — `<OrigamProgress>` binds
// `:aria-hidden="!active"`, but `active?: boolean` has NO default in
// `withDefaults()` (only `tag`, `modelValue`, `max`, `thickness`, `size`,
// `label` are seeded). An un-set `active` prop is therefore `undefined`,
// `!active` evaluates to `true`, and the rendered element gets
// `aria-hidden="true"` — a loading indicator hidden from assistive tech
// BY DEFAULT, including the documented basic usage
// `<origam-progress indeterminate />`.
//
// The three family stories all force `active: true` in their init state,
// which is exactly what hid the bug from visual/story-based review.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamProgress from '@origam/components/Progress/OrigamProgress.vue'
import { createOrigam } from '@origam/origam'

function mountWith (props: Record<string, unknown>) {
    return mount(OrigamProgress, {
        props: props as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamProgress — aria-hidden default (#434)', () => {
    it('is NOT aria-hidden when `active` is left unset (documented default usage)', () => {
        const wrapper = mountWith({indeterminate: true})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.exists()).toBe(true)
        expect(el.attributes('aria-hidden')).not.toBe('true')
    })

    it('is NOT aria-hidden with a determinate value and no `active` prop', () => {
        const wrapper = mountWith({modelValue: 42, max: 100})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.attributes('aria-hidden')).not.toBe('true')
    })

    it('is aria-hidden when the consumer explicitly sets active=false', () => {
        const wrapper = mountWith({modelValue: 42, active: false})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.attributes('aria-hidden')).toBe('true')
    })

    it('is NOT aria-hidden when the consumer explicitly sets active=true', () => {
        const wrapper = mountWith({modelValue: 42, active: true})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.attributes('aria-hidden')).not.toBe('true')
    })
})
