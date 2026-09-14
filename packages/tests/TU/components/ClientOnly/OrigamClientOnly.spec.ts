// Why this file exists
// --------------------
// <OrigamClientOnly> has exactly one job: render a DIFFERENT branch on the
// server than on the mounted client. Nothing pinned that. The pre-mount
// branch is the whole point of the component and it is invisible in a
// browser (one frame), so it is asserted here through `renderToString`
// rather than through Playwright.
//
// The doc previously claimed the props were declared inline in the SFC;
// they come from `IClientOnlyProps`. These specs pin the resulting
// behaviour, not the declaration site.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'

import OrigamClientOnly from '@origam/components/ClientOnly/OrigamClientOnly.vue'

function ssr (props: Record<string, unknown>, slots: Record<string, () => unknown> = {}) {
    const app = createSSRApp({
        render: () => h(OrigamClientOnly, props, {
            default: () => h('span', { class: 'client-side' }, 'mounted'),
            ...slots
        })
    })

    return renderToString(app)
}

describe('OrigamClientOnly — server branch', () => {
    it('renders nothing when neither placeholderTag nor #fallback is given', async () => {
        const html = await ssr({})

        expect(html).not.toContain('client-side')
        expect(html.replace(/<!--[\s\S]*?-->/g, '').trim()).toBe('')
    })

    it('renders the placeholderTag element, aria-hidden, when set', async () => {
        const html = await ssr({ placeholderTag: 'div', placeholderClass: 'ph' })

        expect(html).not.toContain('client-side')
        expect(html).toContain('<div')
        expect(html).toContain('class="ph"')
        expect(html).toContain('aria-hidden="true"')
    })

    it('prefers the #fallback slot over placeholderTag', async () => {
        const html = await ssr(
            { placeholderTag: 'div', placeholderClass: 'ph' },
            { fallback: () => h('p', { class: 'fb' }, 'waiting') }
        )

        expect(html).toContain('class="fb"')
        expect(html).not.toContain('class="ph"')
        expect(html).not.toContain('client-side')
    })
})

describe('OrigamClientOnly — mounted branch', () => {
    it('shows the fallback on the first paint, then swaps on the next tick', async () => {
        const wrapper = mount(OrigamClientOnly, {
            props: { placeholderTag: 'div', placeholderClass: 'ph' },
            slots: {
                default: '<span class="client-side">mounted</span>',
                fallback: '<p class="fb">waiting</p>'
            }
        })

        // `onMounted` flips the ref, but the re-render is queued — the
        // fallback is still in the DOM at this point. This is exactly why
        // the branch is invisible-but-real in a browser.
        expect(wrapper.find('.fb').exists()).toBe(true)
        expect(wrapper.find('.client-side').exists()).toBe(false)

        await nextTick()

        expect(wrapper.find('.client-side').exists()).toBe(true)
        expect(wrapper.find('.fb').exists()).toBe(false)
        expect(wrapper.find('.ph').exists()).toBe(false)
    })
})
