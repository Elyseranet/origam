// #1448 — hasPrependInner / hasAppendInner / hasClear must follow a slot toggled AFTER the first render.
// Consumers of useAdjacentInner: Field, TextField, TextareaField, PasswordField, FileField, NumberField (via TextField).
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamField from '@origam/components/Field/OrigamField.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
})

const host = (Cmp: object) => {
    const withSlot = ref(true)
    const Host = defineComponent({
        setup: () => () => h(Cmp, null, withSlot.value
            ? { prependInner: () => h('i', { class: 'x' }), appendInner: () => h('i', { class: 'y' }) }
            : {})
    })
    return { withSlot, wrapper: mount(Host, { global: { plugins: [createOrigam()] } }) }
}

describe.each([['OrigamField', OrigamField], ['OrigamTextField', OrigamTextField]])('%s (#1448)', (_n, Cmp) => {
    it('drops and restores the prepend/append-inner zones when the slot toggles at runtime', async () => {
        const { withSlot, wrapper } = host(Cmp)
        expect(wrapper.findAll('.origam-field__prepend-inner')).toHaveLength(1)
        expect(wrapper.findAll('.origam-field__append-inner')).toHaveLength(1)
        withSlot.value = false
        await nextTick()
        expect(wrapper.findAll('.origam-field__prepend-inner')).toHaveLength(0)
        expect(wrapper.findAll('.origam-field__append-inner')).toHaveLength(0)
        withSlot.value = true
        await nextTick()
        expect(wrapper.findAll('.origam-field__prepend-inner')).toHaveLength(1)
    })
})
