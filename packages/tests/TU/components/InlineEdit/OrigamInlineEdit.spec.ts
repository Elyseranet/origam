// Unit tests for <OrigamInlineEdit>
//
// All DOM assertions go through data-cy attributes or CSS classes.
// The exposed API (isEditing, draft, error, isPending) is tested via the
// `wrapper.vm` proxy — VTU 2.x auto-unwraps `defineExpose`d refs from
// `wrapper.vm`, but some properties come through as-is if they are Refs.
// We therefore check via the exposed `edit()` / `cancel()` methods instead
// of the reactive ref values directly for the "isEditing" state; this makes
// the tests resilient to the VTU unwrapping behaviour.
//
// Stubs: OrigamTextField and OrigamTextareaField must propagate @update:model-value,
// @keydown and @blur back to the parent. The data-cy selector on the stub root
// is used to find the edit field in the DOM.

import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import OrigamInlineEdit from '@origam/components/InlineEdit/OrigamInlineEdit.vue'
import { createOrigam } from '@origam/origam'
import { INLINE_EDIT_ACTION } from '@origam/enums'

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const OrigamTextFieldStub = {
    name: 'OrigamTextField',
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'ariaInvalid', 'ariaDescribedby',
        'class', 'hideDetails'],
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
            <slot name="appendInner"/>
        </div>
    `
}

const OrigamTextareaFieldStub = {
    name: 'OrigamTextareaField',
    props: ['modelValue', 'placeholder', 'disabled', 'ariaInvalid', 'ariaDescribedby',
        'class', 'hideDetails'],
    emits: ['update:modelValue', 'keydown', 'blur'],
    template: `
        <div data-cy="origam-inline-edit-textareafield-stub">
            <textarea
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                data-cy="origam-inline-edit-textarea-el"
                @input="$emit('update:modelValue', $event.target.value)"
                @keydown="$emit('keydown', $event)"
                @blur="$emit('blur')"
            />
            <slot name="appendInner"/>
        </div>
    `
}

const OrigamBtnStub = {
    name: 'OrigamBtn',
    props: ['icon', 'disabled', 'size', 'variant', 'color', 'ariaLabel', 'class'],
    emits: ['click', 'mousedown'],
    template: `<button :disabled="disabled" v-bind="$attrs" @click="$emit('click', $event)" @mousedown.prevent="$emit('mousedown', $event)" />`
}

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

const mountInlineEdit = (props: Record<string, unknown> = {}): VueWrapper => {
    return mount(OrigamInlineEdit, {
        attachTo: document.body,
        props: {
            modelValue: 'Initial value',
            ...props
        },
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamTextField: OrigamTextFieldStub,
                OrigamTextareaField: OrigamTextareaFieldStub,
                OrigamBtn: OrigamBtnStub,
                OrigamIcon: { template: '<i />' }
            }
        }
    })
}

// ---------------------------------------------------------------------------
// Tests — display mode
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — display mode (initial state)', () => {
    it('renders data-cy="origam-inline-edit" root element', () => {
        const wrapper = mountInlineEdit()
        expect(wrapper.find('[data-cy="origam-inline-edit"]').exists()).toBe(true)
    })

    it('shows the current modelValue in the display button', () => {
        const wrapper = mountInlineEdit({ modelValue: 'Hello DS' })
        expect(wrapper.find('[data-cy="origam-inline-edit-display"]').text()).toBe('Hello DS')
    })

    it('shows the placeholder when modelValue is empty', () => {
        const wrapper = mountInlineEdit({ modelValue: '', placeholder: 'Click to edit' })
        expect(wrapper.find('[data-cy="origam-inline-edit-display"]').text()).toBe('Click to edit')
    })

    it('does NOT render the text field in display mode', () => {
        const wrapper = mountInlineEdit()
        expect(wrapper.find('[data-cy="origam-inline-edit-textfield-stub"]').exists()).toBe(false)
    })

    it('aria-busy is "false" in idle state', () => {
        const wrapper = mountInlineEdit()
        expect(wrapper.find('[data-cy="origam-inline-edit"]').attributes('aria-busy')).toBe('false')
    })
})

// ---------------------------------------------------------------------------
// Tests — entering edit mode
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — entering edit mode', () => {
    it('switches to edit mode (origam-inline-edit--editing class) when display is clicked', async () => {
        const wrapper = mountInlineEdit()
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).toContain('origam-inline-edit--editing')
    })

    it('the display button is hidden in edit mode', async () => {
        const wrapper = mountInlineEdit()
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        expect(wrapper.find('[data-cy="origam-inline-edit-display"]').exists()).toBe(false)
    })

    it('emits "edit" when entering edit mode', async () => {
        const wrapper = mountInlineEdit()
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        expect(wrapper.emitted('edit')).toBeTruthy()
    })

    it('applies origam-inline-edit--editing class in edit mode', async () => {
        const wrapper = mountInlineEdit()
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).toContain('origam-inline-edit--editing')
    })
})

// ---------------------------------------------------------------------------
// Tests — confirming edit via Enter
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — confirming edit (Enter key)', () => {
    it('emits update:modelValue with the new value on Enter', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'Old', confirmOnEnter: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('New value')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe('New value')
    })

    it('emits "confirm" with the new value on Enter', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'Old', confirmOnEnter: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('Confirmed')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(wrapper.emitted('confirm')![0][0]).toBe('Confirmed')
    })

    it('returns to display mode after confirm (editing class removed)', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'Old' })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('Done')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).not.toContain('origam-inline-edit--editing')
    })
})

// ---------------------------------------------------------------------------
// Tests — cancelling edit via Escape
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — cancelling edit (Escape key)', () => {
    it('returns to display mode on Escape', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'Keep', cancelOnEscape: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Escape' })
        await nextTick()

        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).not.toContain('origam-inline-edit--editing')
    })

    it('emits "cancel" on Escape', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'Keep', cancelOnEscape: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Escape' })
        await nextTick()

        expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('does NOT emit update:modelValue on Escape', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'Original' })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('Changed')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Escape' })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
})

// ---------------------------------------------------------------------------
// Tests — disabled
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — disabled', () => {
    it('does not enter edit mode when disabled=true (no editing class on click)', async () => {
        const wrapper = mountInlineEdit({ disabled: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        // button is native-disabled → event propagation blocked → handleEnterEdit not called
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).not.toContain('origam-inline-edit--editing')
    })

    it('adds origam-inline-edit--disabled class when disabled', () => {
        const wrapper = mountInlineEdit({ disabled: true })
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).toContain('origam-inline-edit--disabled')
    })
})

// ---------------------------------------------------------------------------
// Tests — validation rules
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — validation rule', () => {
    it('shows error and does not emit when a rule fails', async () => {
        const wrapper = mountInlineEdit({
            modelValue: 'ok',
            rules: [(v: string) => v.length >= 5 || 'Min 5 chars']
        })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('hi')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        const errorEl = wrapper.find('[data-cy="origam-inline-edit-error"]')
        expect(errorEl.exists()).toBe(true)
        expect(errorEl.text()).toBe('Min 5 chars')
    })

    it('commits when rule passes', async () => {
        const wrapper = mountInlineEdit({
            modelValue: 'ok',
            rules: [(v: string) => v.length >= 3 || 'Min 3 chars']
        })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('valid text')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('emits validate-error when a rule fails', async () => {
        const wrapper = mountInlineEdit({
            modelValue: 'x',
            rules: [(v: string) => v.length >= 10 || 'Too short']
        })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('abc')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(wrapper.emitted('validate-error')![0][0]).toBe('Too short')
    })
})

// ---------------------------------------------------------------------------
// Tests — trim prop
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — trim prop', () => {
    it('trims whitespace before emitting when trim=true (default)', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'old', trim: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('  trimmed  ')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')![0][0]).toBe('trimmed')
    })

    it('preserves whitespace when trim=false', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'old', trim: false })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('  spaced  ')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')![0][0]).toBe('  spaced  ')
    })
})

// ---------------------------------------------------------------------------
// Tests — multiline mode
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — multiline mode', () => {
    it('adds origam-inline-edit--multiline class when multiline=true', () => {
        const wrapper = mountInlineEdit({ multiline: true })
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).toContain('origam-inline-edit--multiline')
    })

    it('renders the textarea element in edit mode when multiline=true', async () => {
        const wrapper = mountInlineEdit({ multiline: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        expect(wrapper.find('[data-cy="origam-inline-edit-textarea-el"]').exists()).toBe(true)
        expect(wrapper.find('[data-cy="origam-inline-edit-input-el"]').exists()).toBe(false)
    })

    it('does NOT confirm on bare Enter in multiline mode (no Ctrl)', async () => {
        const wrapper = mountInlineEdit({ multiline: true, confirmOnEnter: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-textarea-el"]').setValue('Line1')
        await wrapper.find('[data-cy="origam-inline-edit-textarea-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        // Must still be in editing mode
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).toContain('origam-inline-edit--editing')
        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('confirms on Ctrl+Enter in multiline mode', async () => {
        const wrapper = mountInlineEdit({ multiline: true, confirmOnEnter: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-textarea-el"]').setValue('Multi line text')
        await wrapper.find('[data-cy="origam-inline-edit-textarea-el"]').trigger('keydown', { key: 'Enter', ctrlKey: true })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// Tests — showActions
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — showActions', () => {
    it('renders the edit action button in display mode when showActions=true', () => {
        const wrapper = mountInlineEdit({ showActions: true })
        const btn = wrapper.find(`[data-cy="origam-inline-edit-action-${INLINE_EDIT_ACTION.EDIT}"]`)
        expect(btn.exists()).toBe(true)
    })

    it('renders confirm and cancel buttons in edit mode when showActions=true', async () => {
        const wrapper = mountInlineEdit({ showActions: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        expect(wrapper.find(`[data-cy="origam-inline-edit-action-${INLINE_EDIT_ACTION.CONFIRM}"]`).exists()).toBe(true)
        expect(wrapper.find(`[data-cy="origam-inline-edit-action-${INLINE_EDIT_ACTION.CANCEL}"]`).exists()).toBe(true)
    })

    it('confirm button click commits the draft', async () => {
        const wrapper = mountInlineEdit({ showActions: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('From button')
        await wrapper.find(`[data-cy="origam-inline-edit-action-${INLINE_EDIT_ACTION.CONFIRM}"]`).trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')![0][0]).toBe('From button')
    })

    it('cancel button click discards the draft', async () => {
        const wrapper = mountInlineEdit({ showActions: true })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('Discard me')
        await wrapper.find(`[data-cy="origam-inline-edit-action-${INLINE_EDIT_ACTION.CANCEL}"]`).trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
        expect(wrapper.emitted('cancel')).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// Tests — exposed API (via DOM class state rather than ref inspection)
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — exposed API', () => {
    it('exposed edit() enters editing mode (class appears)', async () => {
        const wrapper = mountInlineEdit()
        const vm = wrapper.vm as unknown as { edit: () => void }
        vm.edit()
        await nextTick()
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).toContain('origam-inline-edit--editing')
    })

    it('exposed cancel() exits editing mode without emitting update:modelValue', async () => {
        const wrapper = mountInlineEdit()
        const vm = wrapper.vm as unknown as { edit: () => void, cancel: () => void }
        vm.edit()
        await nextTick()
        vm.cancel()
        await nextTick()

        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).not.toContain('origam-inline-edit--editing')
        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('exposed confirm() commits current draft and exits editing mode', async () => {
        const wrapper = mountInlineEdit({ modelValue: 'init' })
        const vm = wrapper.vm as unknown as { edit: () => void, confirm: () => void }
        vm.edit()
        await nextTick()
        // Type a new value in the input
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('new value from exposed')
        vm.confirm()
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.find('[data-cy="origam-inline-edit"]').classes()).not.toContain('origam-inline-edit--editing')
    })
})

// ---------------------------------------------------------------------------
// Tests — number modelValue shape preservation
// ---------------------------------------------------------------------------

describe('OrigamInlineEdit — number modelValue', () => {
    it('emits a number when the original modelValue was a number', async () => {
        const wrapper = mountInlineEdit({ modelValue: 42 })
        await wrapper.find('[data-cy="origam-inline-edit-display"]').trigger('click')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').setValue('99')
        await wrapper.find('[data-cy="origam-inline-edit-input-el"]').trigger('keydown', { key: 'Enter' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(typeof emitted![0][0]).toBe('number')
        expect(emitted![0][0]).toBe(99)
    })
})
