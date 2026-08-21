// Regression for #381 — `const {id, ...} = useStyle(panelsStyles)` without
// `() => props.id`: the generated id shadowed the `id` PROP of the same
// name, so `:id="id"` on the root rendered the generated identifier, never
// the consumer's.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamTabPanels from '@origam/components/Tabs/OrigamTabPanels.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamTabPanels — consumer id reaches the root (#381)', () => {
    it('renders the consumer-supplied id on the root, not a generated one', () => {
        const wrapper = mount(OrigamTabPanels, {
            props: { id: 'my-tab-panels-id' } as never,
            global: { plugins: [createOrigam()] }
        })

        expect(wrapper.element.id).toBe('my-tab-panels-id')
        wrapper.unmount()
    })
})
