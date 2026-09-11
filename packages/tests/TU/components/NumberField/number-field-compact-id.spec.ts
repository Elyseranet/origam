// Regression for #421 — in `compact` mode, <OrigamNumberField>'s real
// `<input>` (the text field the user actually types into) bound NO `:id`
// at all. `messagesId` derives correctly from `props.id` (proving the
// internal value is right), but the binding on the real control was simply
// missing — an oversight, not a shadowing/forwarding bug like the other
// #421 occurrences.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamNumberField — compact mode: consumer id reaches the real <input> (#421)', () => {
    it('renders the consumer-supplied id on the real compact input', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { id: 'my-number-field-id', compact: true } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('[data-cy="numberfield-compact-input"]')
        expect(input.exists()).toBe(true)
        expect(input.attributes('id')).toBe('my-number-field-id')
        wrapper.unmount()
    })
})
