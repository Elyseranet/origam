// Regression for #381 — `const {id, ...} = useStyle(avatarStyles)` without
// `() => props.id`: the generated id shadowed the `id` PROP of the same
// name, so `:id="id"` on the root rendered the generated identifier, never
// the consumer's.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamAvatar from '@origam/components/Avatar/OrigamAvatar.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamAvatar — consumer id reaches the root (#381)', () => {
    it('renders the consumer-supplied id on the root, not a generated one', () => {
        const wrapper = mount(OrigamAvatar, {
            props: { id: 'my-avatar-id' } as never,
            global: { plugins: [createOrigam()] }
        })

        expect(wrapper.element.id).toBe('my-avatar-id')
        wrapper.unmount()
    })
})
