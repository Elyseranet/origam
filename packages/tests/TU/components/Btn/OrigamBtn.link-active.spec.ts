// #1125 — a lone Btn with `to` is painted active only on an EXACT route match
// (vue-router `isExactActive` + equal query), never because it is a parent route
// of the current one. An explicit `active` stays the strongest. Real router.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'

const Blank = defineComponent({ render: () => h('div') })

async function mountAt (path: string, props: Record<string, unknown>) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/parent', component: Blank, children: [{ path: 'enfant', component: Blank }] },
            { path: '/x', component: Blank }
        ]
    })
    await router.push(path)
    await router.isReady()

    return mount(OrigamBtn, { props, global: { plugins: [router] } })
}

describe('OrigamBtn link active (#1125)', () => {
    it('to="/parent" on /parent/enfant is NOT active (parent in the matched chain)', async () => {
        const wrapper = await mountAt('/parent/enfant', { to: '/parent' })

        expect(wrapper.classes()).not.toContain('origam-btn--active')
    })

    it('to="/x" on /x is active', async () => {
        const wrapper = await mountAt('/x', { to: '/x' })

        expect(wrapper.classes()).toContain('origam-btn--active')
    })

    it('an explicit `active` wins even when the route does not match', async () => {
        const wrapper = await mountAt('/x', { to: '/parent', active: true })

        expect(wrapper.classes()).toContain('origam-btn--active')
    })

    it('`exact` keeps comparing the query', async () => {
        const wrapper = await mountAt('/x?a=1', { to: '/x?a=2', exact: true })

        expect(wrapper.classes()).not.toContain('origam-btn--active')
    })
})
