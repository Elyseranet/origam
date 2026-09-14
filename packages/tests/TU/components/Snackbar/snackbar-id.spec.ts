// Regression for #381 — `const {id, ...} = useStyle(snackbarStyles)` without
// `() => props.id`: the generated id shadowed the `id` PROP of the same
// name, so `:id="id"` on <origam-overlay> rendered the generated
// identifier, never the consumer's. Full real component tree (no
// OrigamOverlay stub) — the existing OrigamSnackbar.spec.ts stub doesn't
// declare/bind `id` at all and would hide this bug exactly like it hid it
// before this fix.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamSnackbar from '@origam/components/Snackbar/OrigamSnackbar.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

describe('OrigamSnackbar — consumer id reaches the overlay (#381)', () => {
    it('renders the consumer-supplied id on the overlay root, not a generated one', async () => {
        const wrapper = mount(OrigamSnackbar, {
            props: { id: 'my-snackbar-id', modelValue: true, text: 'Notification' } as never,
            attachTo: document.body,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        expect(document.getElementById('my-snackbar-id')).not.toBeNull()
        wrapper.unmount()
    })
})
