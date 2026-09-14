// Why this file exists
// --------------------
// The C7 doc/story audit flagged `replace` on <OrigamCard> as "declared but
// never read" — a story control driving a dead prop. It is NOT dead: Card
// calls vue-router's own `useLink(props)` (link.composable.ts) and invokes
// `link.navigate(event)` on click, and vue-router's `navigate` reads
// `props.replace` to pick between `router.push` and `router.replace`.
//
// The confusion comes from the Histoire sandbox, which installs no router:
// `resolveDynamicComponent('RouterLink')` returns a string there, so
// `useLink` returns early with only `href` and the Link-group controls are
// genuinely inert IN THE STORY. These specs pin the real behaviour with a
// real memory-history router.
//
// Mutation-checked: forcing `replace: false` into the object handed to
// `RouterLink.useLink` turns the second spec red and leaves the first green.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import OrigamCard from '@origam/components/Card/OrigamCard.vue'

const Blank = defineComponent({ render: () => h('div') })

function makeRouter () {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: Blank },
            { path: '/target', component: Blank }
        ]
    })
}

describe('OrigamCard — replace prop reaches vue-router', () => {
    it('uses router.push when replace is false', async () => {
        const router = makeRouter()
        await router.push('/')
        await router.isReady()
        const push = vi.spyOn(router, 'push')
        const replace = vi.spyOn(router, 'replace')

        const w = mount(OrigamCard, {
            props: { to: '/target', replace: false, title: 'x' },
            global: { plugins: [router] }
        })
        await w.trigger('click')
        expect(replace).not.toHaveBeenCalled()
        expect(push).toHaveBeenCalled()
    })

    it('uses router.replace when replace is true', async () => {
        const router = makeRouter()
        await router.push('/')
        await router.isReady()
        const push = vi.spyOn(router, 'push')
        const replace = vi.spyOn(router, 'replace')

        const w = mount(OrigamCard, {
            props: { to: '/target', replace: true, title: 'x' },
            global: { plugins: [router] }
        })
        await w.trigger('click')
        expect(replace).toHaveBeenCalled()
        expect(push).not.toHaveBeenCalled()
    })
})
