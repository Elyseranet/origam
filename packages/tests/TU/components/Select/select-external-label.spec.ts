// #1251 — without a `label` prop, the input must NOT carry an aria-label /
// title fallback ("Ouvrir"): it outranks an external <label for> in the
// accessible-name computation. Same pattern on ColorPickerField / DatePickerField.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import axe from 'axe-core'

import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import OrigamColorPickerField from '@origam/components/ColorPickerField/OrigamColorPickerField.vue'
import OrigamDatePickerField from '@origam/components/DatePickerField/OrigamDatePickerField.vue'
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

const CASES = [
    ['OrigamSelect', OrigamSelect, { items: ['a', 'b'] }],
    ['OrigamColorPickerField', OrigamColorPickerField, {}],
    ['OrigamDatePickerField', OrigamDatePickerField, {}]
] as const

describe.each(CASES)('%s — external <label for> names the input (#1251)', (_name, Comp, extra) => {
    afterEach(() => { document.body.innerHTML = '' })

    const mountWithExternalLabel = async () => {
        const host = document.createElement('div')
        host.innerHTML = '<label for="ext-1251">Pays</label>'
        document.body.appendChild(host)
        const wrapper = mount(Comp as never, {
            props: { id: 'ext-1251', ...extra } as never,
            attachTo: host,
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] }
        })
        await nextTick()
        return { host, wrapper }
    }

    it('no aria-label / title fallback on the input, accessible name = external label', async () => {
        const { host, wrapper } = await mountWithExternalLabel()
        const input = host.querySelector('input#ext-1251') as HTMLInputElement
        expect(input.hasAttribute('aria-label')).toBe(false)
        expect(input.hasAttribute('title')).toBe(false)
        ;(axe as any)._tree = (axe as any).utils.getFlattenedTree(document.documentElement)
        expect((axe as any).commons.text.accessibleText(input)).toBe('Pays')
        const res = await axe.run(host, { runOnly: ['label', 'aria-input-field-name'] })
        expect(res.violations.map((v) => v.id)).toEqual([])
        wrapper.unmount()
    })

    it('with a label prop the aria-label / title are unchanged', async () => {
        const wrapper = mount(Comp as never, {
            props: { label: 'Pays', ...extra } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Pays')
        expect(input.attributes('title')).toBe('Pays')
    })
})

