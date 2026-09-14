// Regression for #381 — `const {id, ...} = useStyle(badgeContentStyles)`
// without `() => props.id`: the generated id shadowed the `id` PROP of the
// same name, so `:id="id"` on the pill (.origam-badge__badge, NOT the
// component root) rendered the generated identifier, never the consumer's.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamBadge from '@origam/components/Badge/OrigamBadge.vue'
import { createOrigam } from '@origam/origam'

function mountBadge (props: Record<string, unknown> = {}) {
    return mount(OrigamBadge, {
        props: { modelValue: true, ...props } as never,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamTransition: { template: '<slot />' },
                OrigamFade: { template: '<slot />' }
            }
        }
    })
}

describe('OrigamBadge — consumer id reaches the pill (#381)', () => {
    it('renders the consumer-supplied id on .origam-badge__badge, not a generated one', () => {
        const wrapper = mountBadge({ id: 'my-badge-id', content: 3 })

        expect(wrapper.find('.origam-badge__badge').attributes('id')).toBe('my-badge-id')
        wrapper.unmount()
    })
})
