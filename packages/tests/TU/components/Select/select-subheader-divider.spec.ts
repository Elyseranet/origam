// #1426 — `{ type: 'subheader' }` / `{ type: 'divider' }` items are structure:
// no role="option", not selectable, skipped by the arrow keys.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

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

const items = [
    { type: 'subheader', title: 'Automatic' },
    { value: 'a', title: 'Alpha' },
    { type: 'divider' },
    { type: 'subheader', title: 'Manual' },
    { value: 'b', title: 'Beta' }
]

const open = async () => {
    const wrapper = mount(OrigamSelect, {
        props: { items, menu: true } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
    await nextTick(); await nextTick(); await nextTick()
    return wrapper
}

describe('OrigamSelect — subheader / divider items (#1426)', () => {
    afterEach(() => { document.body.innerHTML = '' })

    it('renders only real items as options', async () => {
        await open()
        const options = [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent?.trim())
        expect(options).toEqual(['Alpha', 'Beta'])
        expect(document.querySelectorAll('.origam-list-subheader').length).toBe(2)
        expect(document.querySelectorAll('.origam-divider').length).toBeGreaterThan(0)
    })

    it('arrow keys skip structural rows', async () => {
        const wrapper = await open()
        const input = wrapper.find('input')
        const active = () => document.getElementById(input.attributes('aria-activedescendant') ?? '')?.textContent?.trim()
        await input.trigger('keydown', { key: 'ArrowDown' })
        expect(active()).toBe('Alpha')
        await input.trigger('keydown', { key: 'ArrowDown' })
        expect(active()).toBe('Beta')
        await input.trigger('keydown', { key: 'ArrowDown' })
        expect(active()).toBe('Alpha')
        await input.trigger('keydown', { key: 'ArrowUp' })
        expect(active()).toBe('Beta')
    })
})
