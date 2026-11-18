// #1308 — same defect as #1247 (Select): the combobox role must live on the
// <input> only, never on the `.origam-field` wrapper <div>.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import axe from 'axe-core'

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

describe.each([
    ['OrigamColorPickerField', OrigamColorPickerField],
    ['OrigamDatePickerField', OrigamDatePickerField]
])('%s — combobox role on the input only (#1308)', (_name, Comp) => {
    afterEach(() => { document.body.innerHTML = '' })

    it('axe: zero violation, a single combobox, carried by the <input>', async () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        // The menu activator ARIA is applied client-side only, so mount for real.
        mount(Comp as never, { props: { label: 'Pick' }, attachTo: host, global: { plugins: [createOrigam()] } })
        await flushPromises()

        const res = await axe.run(host, { runOnly: ['aria-valid-attr-value', 'aria-required-attr', 'aria-allowed-attr'] })
        expect(res.violations.map((v) => v.id)).toEqual([])
        const combos = host.querySelectorAll('[role="combobox"]')
        expect(combos).toHaveLength(1)
        expect(combos[0].tagName).toBe('INPUT')
        expect(combos[0].getAttribute('aria-haspopup')).toBe('dialog')
    })
})
