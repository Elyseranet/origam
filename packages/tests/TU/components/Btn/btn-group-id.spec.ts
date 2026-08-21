// Regression for #381 — `const {id, ...} = useStyle(btnGroupStyles)` without
// `() => props.id`: the generated id shadowed the `id` PROP of the same
// name, so `:id="id"` on the root rendered the generated identifier, never
// the consumer's.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamBtnGroup from '@origam/components/Btn/OrigamBtnGroup.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamBtnGroup — consumer id reaches the root (#381)', () => {
    it('renders the consumer-supplied id on the root, not a generated one', () => {
        const wrapper = mount(OrigamBtnGroup, {
            props: { id: 'my-btn-group-id' } as never,
            global: { plugins: [createOrigam()] }
        })

        expect(wrapper.element.id).toBe('my-btn-group-id')
        wrapper.unmount()
    })
})
