// #490 — OrigamInlineEdit built the `useInlineEdit` options object once, at
// `setup()` time (`{ rules: props.rules, validate: props.validate, trim:
// props.trim, ... }`). `confirm()` read that SAME frozen object on every
// call, so a consumer changing `rules` / `validate` / `trim` AFTER mount
// was silently ignored for the component's whole lifetime.
//
// Proof: mount with permissive props, change them post-mount via
// `setProps`, then exercise `edit()` / `confirm()` and assert the NEW
// validator/trim setting is the one actually enforced.
//
// The `rules` case has its own dedicated sonde already in
// `OrigamInlineEdit.spec.ts` (originally an `it.fails`, un-wrapped once
// this fix landed) — not duplicated here to avoid two specs asserting the
// exact same scenario. This file covers the two siblings the ticket names
// as sharing the same defect: `validate` and `trim`.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import OrigamInlineEdit from '@origam/components/InlineEdit/OrigamInlineEdit.vue'
import { createOrigam } from '@origam/origam'

const OrigamTextFieldStub = {
    name: 'OrigamTextField',
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'ariaInvalid', 'ariaDescribedby', 'class', 'hideDetails'],
    emits: ['update:modelValue', 'keydown', 'blur'],
    template: `
        <div data-cy="origam-inline-edit-textfield-stub">
            <input
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                data-cy="origam-inline-edit-input-el"
                @input="$emit('update:modelValue', $event.target.value)"
                @keydown="$emit('keydown', $event)"
                @blur="$emit('blur')"
            />
        </div>
    `
}

function mountInlineEdit (props: Record<string, unknown> = {}) {
    return mount(OrigamInlineEdit, {
        attachTo: document.body,
        props: { modelValue: 'hello', ...props },
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamTextField: OrigamTextFieldStub,
                OrigamTextareaField: true,
                OrigamIcon: { template: '<i />' }
            }
        }
    })
}

describe('OrigamInlineEdit — validate/trim must be re-read, not frozen at setup (#490)', () => {
    it('a validate() function swapped AFTER mount is the one actually run', async () => {
        const wrapper = mountInlineEdit({ validate: (v: string) => v.length > 0 || 'Required' })

        await wrapper.setProps({ validate: () => 'Always rejected — the NEW validator' })
        await nextTick()

        ;(wrapper.vm as any).edit()
        await nextTick()
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('anything')
        await (wrapper.vm as any).confirm()
        await nextTick()
        await nextTick()

        expect(wrapper.emitted('validate-error')?.[0]).toEqual(['Always rejected — the NEW validator'])
        expect(wrapper.emitted('update:modelValue')).toBeFalsy()

        wrapper.unmount()
    })

    it('trim flipped to false AFTER mount preserves surrounding whitespace on commit', async () => {
        const wrapper = mountInlineEdit({ trim: true })

        await wrapper.setProps({ trim: false })
        await nextTick()

        ;(wrapper.vm as any).edit()
        await nextTick()
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('  padded  ')
        await (wrapper.vm as any).confirm()
        await nextTick()
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['  padded  '])

        wrapper.unmount()
    })
})
