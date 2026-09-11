// Regression for #381 — `const {id, ...} = useStyle(appStyles)` without
// `() => props.id`: the generated id shadowed the `id` PROP of the same
// name, so `:id="id"` on the root <origam-layout> rendered the generated
// identifier, never the consumer's.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamApp from '@origam/components/App/OrigamApp.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamApp — consumer id reaches the root (#381)', () => {
    it('renders the consumer-supplied id on the root, not a generated one', () => {
        const wrapper = mount(OrigamApp, {
            props: { id: 'my-app-id' } as never,
            global: { plugins: [createOrigam()] }
        })

        expect(wrapper.element.id).toBe('my-app-id')
        wrapper.unmount()
    })
})
