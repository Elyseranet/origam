// #1097 — `pointer-events: none` no longer shields a disabled Btn (it has to
// show `cursor: not-allowed`). A native disabled <button> fires no click by
// itself; a disabled ANCHOR (`to` / `href`) used to be protected by CSS only,
// so `handleClickCapture` now swallows the click. Real memory-history router:
// the Histoire sandbox installs none.
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'

const Blank = defineComponent({ render: () => h('div') })

const makeRouter = () => createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/', component: Blank },
        { path: '/target', component: Blank }
    ]
})

describe('OrigamBtn disabled anchor (#1097)', () => {
    it('a disabled link Btn runs no @click and does not navigate', async () => {
        const router = makeRouter()
        await router.push('/')
        await router.isReady()
        const onClick = vi.fn()
        const wrapper = mount(OrigamBtn, {
            props: { to: '/target', disabled: true, onClick },
            global: { plugins: [router] }
        })

        await wrapper.trigger('click')
        await new Promise(r => setTimeout(r, 0))

        expect(wrapper.element.tagName).toBe('A')
        expect(wrapper.attributes('aria-disabled')).toBe('true')
        expect(onClick).not.toHaveBeenCalled()
        expect(router.currentRoute.value.path).toBe('/')
    })

    it('an enabled link Btn still navigates and runs @click (negative control)', async () => {
        const router = makeRouter()
        await router.push('/')
        await router.isReady()
        const onClick = vi.fn()
        const wrapper = mount(OrigamBtn, {
            props: { to: '/target', onClick },
            global: { plugins: [router] }
        })

        await wrapper.trigger('click')
        await new Promise(r => setTimeout(r, 0))

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(router.currentRoute.value.path).toBe('/target')
    })
})
