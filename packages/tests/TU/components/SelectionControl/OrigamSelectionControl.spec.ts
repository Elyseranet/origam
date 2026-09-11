// Unit tests for <OrigamSelectionControl> — C5 audit (does a declared emit
// really fire, and does a test prove it?).
//
// `OrigamSelectionControlGroup.spec.ts` already covers the GROUP's own
// `update:modelValue` relay, but nothing exercised `OrigamSelectionControl`
// STANDALONE (no enclosing group) — its own `update:modelValue` (via
// `useVModel`) and `click:label` (via `handleClickLabel`) had no test at
// all before this file.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSelectionControl from '@origam/components/SelectionControl/OrigamSelectionControl.vue'
import { createOrigam } from '@origam/origam'

function mountControl (props: Record<string, unknown> = {}) {
    return mount(OrigamSelectionControl, {
        props: { type: 'checkbox', label: 'Accept terms', ...props },
        global: { plugins: [createOrigam({})] }
    })
}

describe('OrigamSelectionControl — update:modelValue (standalone, C5)', () => {
    it('emits update:modelValue with true when the native input is checked', async () => {
        const wrapper = mountControl({ modelValue: false })

        await wrapper.find('input').setValue(true)

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(true)
    })

    it('emits update:modelValue with false when the native input is unchecked', async () => {
        const wrapper = mountControl({ modelValue: true })

        await wrapper.find('input').setValue(false)

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(false)
    })
})

describe('OrigamSelectionControl — click:label (C5)', () => {
    it('emits click:label when the rendered label is clicked', async () => {
        const wrapper = mountControl()

        await wrapper.find('.origam-label').trigger('click')

        expect(wrapper.emitted('click:label')).toBeTruthy()
    })
})
