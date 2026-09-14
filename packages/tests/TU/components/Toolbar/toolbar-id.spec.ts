// Regression for #381 — `const {id, ...} = useStyle(barStyles)` without
// `() => props.id`: the generated id shadowed the `id` PROP of the same
// name, so `:id="id"` on the root rendered the generated identifier, never
// the consumer's.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamToolbar from '@origam/components/Toolbar/OrigamToolbar.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamToolbar — consumer id reaches the root (#381)', () => {
    it('renders the consumer-supplied id on the root, not a generated one', () => {
        const wrapper = mount(OrigamToolbar, {
            props: { id: 'my-toolbar-id' } as never,
            global: { plugins: [createOrigam()] }
        })

        expect(wrapper.element.id).toBe('my-toolbar-id')
        wrapper.unmount()
    })
})
