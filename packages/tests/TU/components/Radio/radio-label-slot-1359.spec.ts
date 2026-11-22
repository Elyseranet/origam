// #1359 — the `label` slot of <OrigamRadio> / <OrigamRadioBtn> must receive
// the SelectionControl scope ({ text, color, props: { id, onClick, … } }).
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'

import OrigamRadio from '@origam/components/Radio/OrigamRadio.vue'
import OrigamRadioBtn from '@origam/components/Radio/OrigamRadioBtn.vue'
import { createOrigam } from '@origam/origam'

describe.each([['OrigamRadioBtn', OrigamRadioBtn], ['OrigamRadio', OrigamRadio]])('%s #label slot scope (#1359)', (_n, C) => {
    it('exposes props.id equal to the input id, so the label stays tied to the input', async () => {
        const wrapper = mount(C as any, {
            props: { value: 'a', modelValue: null },
            slots: { label: (s: any) => h('label', { for: s.props.id, 'data-cy': 'lbl' }, 'Custom') },
            global: { plugins: [createOrigam({})] },
            attachTo: document.body
        })
        await nextTick()
        const input = wrapper.find('input')
        const lbl = wrapper.find('[data-cy="lbl"]')
        expect(lbl.exists()).toBe(true)
        expect(input.attributes('id')).toBeTruthy()
        expect(lbl.attributes('for')).toBe(input.attributes('id'))
        wrapper.unmount()
    })
})
