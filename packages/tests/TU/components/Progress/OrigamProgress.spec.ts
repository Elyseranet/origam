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
//
// Updated for #500: `aria-hidden` (like the rest of the ARIA contract) now
// lives on the concrete `OrigamProgressCircular` / `OrigamProgressLinear`
// component `<OrigamProgress>` delegates to, driven by ITS OWN `active`
// prop — forwarded from the wrapper via the template-ref `filterProps`
// pattern documented in `useProps` (props.composable.ts). That forwarding
// needs one tick (the ref is `undefined` on the very first render), a
// deliberate, measured, invisible-to-real-users tradeoff shared by 68 call
// sites in this codebase — see `OrigamProgressLinear.spec.ts`'s own
// `await nextTick()` for the identical pattern. A synchronous assertion
// right after `mount()` would instead observe the CHILD's own default
// (`active: true`), not the wrapper's configured value.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamProgress from '@origam/components/Progress/OrigamProgress.vue'
import { createOrigam } from '@origam/origam'

async function mountWith (props: Record<string, unknown>) {
    const wrapper = mount(OrigamProgress, {
        props: props as never,
        global: {plugins: [createOrigam()]}
    })

    await nextTick()

    return wrapper
}

describe('OrigamProgress — aria-hidden default (#434)', () => {
    it('is NOT aria-hidden when `active` is left unset (documented default usage)', async () => {
        const wrapper = await mountWith({indeterminate: true})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.exists()).toBe(true)
        expect(el.attributes('aria-hidden')).not.toBe('true')
    })

    it('is NOT aria-hidden with a determinate value and no `active` prop', async () => {
        const wrapper = await mountWith({modelValue: 42, max: 100})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.attributes('aria-hidden')).not.toBe('true')
    })

    it('is aria-hidden when the consumer explicitly sets active=false', async () => {
        const wrapper = await mountWith({modelValue: 42, active: false})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.attributes('aria-hidden')).toBe('true')
    })

    it('is NOT aria-hidden when the consumer explicitly sets active=true', async () => {
        const wrapper = await mountWith({modelValue: 42, active: true})

        const el = wrapper.find('[role="progressbar"]')
        expect(el.attributes('aria-hidden')).not.toBe('true')
    })
})
