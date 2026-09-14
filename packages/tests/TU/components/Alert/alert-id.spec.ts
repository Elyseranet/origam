// Regression for #381 — `const {id, ...} = useStyle(alertStyles)` without
// `() => props.id`: the generated id shadowed the `id` PROP of the same
// name, so `:id="id"` on the root rendered the generated identifier, never
// the consumer's.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamAlert from '@origam/components/Alert/OrigamAlert.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamAlert — consumer id reaches the root (#381)', () => {
    it('renders the consumer-supplied id on the root, not a generated one', () => {
        const wrapper = mount(OrigamAlert, {
            props: { id: 'my-alert-id' } as never,
            global: { plugins: [createOrigam()] }
        })

        expect(wrapper.element.id).toBe('my-alert-id')
        wrapper.unmount()
    })
})
