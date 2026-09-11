// Unit tests for <OrigamRadioBtn> — C5 audit (does a declared emit really
// fire, and does a test prove it?). No spec file existed for this
// component at all before this one.
//
// `update:modelValue` fires via `useVModel(props, 'modelValue')`.
// `click:label` is RELAYED from the nested `<origam-selection-control>`'s
// own `click:label` emit (`@click:label="handleClickLabel"` in the
// template, `handleClickLabel` re-emitting with the captured `emits`).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamRadioBtn from '@origam/components/Radio/OrigamRadioBtn.vue'
import { createOrigam } from '@origam/origam'

async function mountRadio (props: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamRadioBtn, {
        props: { label: 'Option A', value: 'a', ...props },
        global: { plugins: [createOrigam({})] }
    })
    // `controlProps` (forwarding `value` etc. to the nested
    // `<origam-selection-control>`) is resolved through a template-ref
    // `filterProps()` call — undefined on the FIRST synchronous render (see
    // `props.composable.ts`'s "one-tick transient" note). Wait a tick so the
    // forwarded `value` actually lands before interacting.
    await nextTick()
    return wrapper
}

describe('OrigamRadioBtn — update:modelValue (C5)', () => {
    it('emits update:modelValue with the radio value when the native input is checked', async () => {
        const wrapper = await mountRadio({ modelValue: null })

        await wrapper.find('input').setValue(true)

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe('a')
    })
})

describe('OrigamRadioBtn — click:label relay (C5)', () => {
    it('emits click:label when the rendered label is clicked', async () => {
        const wrapper = await mountRadio()

        await wrapper.find('.origam-label').trigger('click')

        expect(wrapper.emitted('click:label')).toBeTruthy()
    })
})
