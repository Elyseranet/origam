// Regression for #421 — a consumer-supplied `id` never reached the real
// `<input>` rendered by <OrigamPasswordField>. Root cause: the `filterProps`
// call feeding <origam-input> excluded `id`, so OrigamInput invented its own
// (`input-${uid}`) instead of receiving the consumer's — and everything
// downstream (OrigamField, the real <input>) inherits THAT generated value
// via scoped slots, not the consumer's prop.
//
// Full real component tree (no stubs) — the bug lives in prop-forwarding
// between three real components, a hand-rolled stub would hide it exactly
// like the existing OrigamPasswordField.spec.ts stubs currently do.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamPasswordField from '@origam/components/PasswordField/OrigamPasswordField.vue'
import { createOrigam } from '@origam/origam'

beforeEachObservers()

function beforeEachObservers () {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
}

describe('OrigamPasswordField — consumer id reaches the real <input> (#421)', () => {
    it('renders the consumer-supplied id on the real <input>, not a generated one', async () => {
        const wrapper = mount(OrigamPasswordField, {
            props: { id: 'my-password-id' } as never,
            global: { plugins: [createOrigam()] }
        })
        // `inputProps` (feeding <origam-input>) is only resolved once the
        // origamInputRef template ref is assigned — the documented "one-tick
        // delta" (props.composable.ts). Render 1 binds nothing; render 2
        // (next microtask) carries the real forwarded props.
        await nextTick()

        const input = wrapper.find('input[type="password"], input[type="text"]')
        expect(input.exists()).toBe(true)
        expect(input.attributes('id')).toBe('my-password-id')
        wrapper.unmount()
    })
})
