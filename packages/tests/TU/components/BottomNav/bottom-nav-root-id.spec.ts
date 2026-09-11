// Regression for #381 — `const {id, ...} = useStyle(bottomNavStyles)`
// without `() => props.id`: the generated id shadowed the `id` PROP of the
// same name, so `:id="id"` on the root rendered the generated identifier,
// never the consumer's.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamBottomNav from '@origam/components/BottomNav/OrigamBottomNav.vue'
import { createOrigam } from '@origam/origam'

beforeEachObservers()
function beforeEachObservers () {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
}

describe('OrigamBottomNav — consumer id reaches the root (#381)', () => {
    it('renders the consumer-supplied id on the root, not a generated one', async () => {
        const wrapper = mount(OrigamBottomNav, {
            props: { id: 'my-bottom-nav-id' } as never,
            global: {
                plugins: [createOrigam()],
                stubs: { OrigamTransition: { template: '<slot />' } }
            }
        })
        await nextTick()

        expect(wrapper.find('.origam-bottom-nav').attributes('id')).toBe('my-bottom-nav-id')
        wrapper.unmount()
    })
})
