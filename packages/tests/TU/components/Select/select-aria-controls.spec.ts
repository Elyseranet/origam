// #1225 — the combobox input must carry `aria-controls` (required by
// WAI-ARIA 1.2) even while the menu is closed, hence in the SSR HTML.
// The id must be the one of the `role="listbox"` once the menu is open.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import axe from 'axe-core'

import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})
vi.stubGlobal('IntersectionObserver', class {
    observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); takeRecords = vi.fn(() => [])
})

const makeApp = () => {
    const app = createSSRApp({ render: () => h(OrigamSelect, { items: ['a', 'b'], label: 'Edition' } as never) })
    app.use(createOrigam())
    return app
}

describe('OrigamSelect — aria-controls on the closed combobox (#1225)', () => {
    afterEach(() => { document.body.innerHTML = '' })

    it('SSR HTML carries aria-controls + aria-expanded="false", and hydration keeps them', async () => {
        const html = await renderToString(makeApp())
        const host = document.createElement('div')
        host.innerHTML = html
        document.body.appendChild(host)

        const ssrInput = host.querySelector('input[role="combobox"]')!
        expect(ssrInput.getAttribute('aria-expanded')).toBe('false')
        const id = ssrInput.getAttribute('aria-controls')
        expect(id).toMatch(/^origam-select-listbox-/)

        makeApp().mount(host)
        await nextTick()
        const input = host.querySelector('input[role="combobox"]')!
        expect(input.getAttribute('aria-expanded')).toBe('false')
        expect(input.getAttribute('aria-controls')).toBe(id)
    })

    it('axe does not flag the closed combobox', async () => {
        const host = document.createElement('div')
        host.innerHTML = await renderToString(makeApp())
        document.body.appendChild(host)
        const res = await axe.run(host, { runOnly: ['aria-valid-attr-value', 'aria-required-attr', 'aria-allowed-attr'] })
        // The duplicated role="combobox" on the field wrapper <div> is a separate,
        // pre-existing defect (#1247) — this test scopes to the input of #1225.
        const onInput = res.violations.filter((v) => v.nodes.some((n) => n.target.join(' ').includes('input')))
        expect(onInput.map((v) => v.id)).toEqual([])
    })

    it('open menu: aria-controls equals the id of the role="listbox" in the DOM', async () => {
        const wrapper = mount(OrigamSelect, {
            props: { items: ['a', 'b'], menu: true } as never,
            attachTo: document.body,
            global: { plugins: [createOrigam()] }
        })
        await nextTick(); await nextTick()
        const input = wrapper.find('input[role="combobox"]')
        expect(input.attributes('aria-expanded')).toBe('true')
        const id = input.attributes('aria-controls')!
        const listbox = document.getElementById(id)
        expect(listbox).not.toBeNull()
        expect(listbox!.getAttribute('role')).toBe('listbox')
        wrapper.unmount()
    })
})
