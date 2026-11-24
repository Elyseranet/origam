// #1087 — a <button> only accepts phrasing content. The `line` loader goes through
// OrigamProgressLinear, whose bars used to be <div>s.
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import OrigamProgressLinear from '@origam/components/Progress/OrigamProgressLinear.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

const FLOW = ['DIV', 'P', 'UL', 'OL', 'LI', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV', 'TABLE', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
const flowIn = (el: Element) => Array.from(el.querySelectorAll('*')).filter(n => FLOW.includes(n.tagName)).map(n => n.tagName + '.' + n.className)

describe('OrigamBtn loading — content model (#1087)', () => {
    it.each([{ type: 'line' }, { type: 'circular' }])('loading=%j: no flow element inside the <button>', async (loading) => {
        const wrapper = mount(OrigamBtn, {
            props: { text: 'Save', loading } as never,
            global: { plugins: [createOrigam()] }
        })
        await flushPromises()
        expect(wrapper.element.tagName).toBe('BUTTON')
        expect(flowIn(wrapper.element)).toEqual([])
    })

    it('OrigamProgressLinear keeps a determinate and an indeterminate bar', () => {
        const det = mount(OrigamProgressLinear, { props: { modelValue: 40 } as never, global: { plugins: [createOrigam()] } })
        const ind = mount(OrigamProgressLinear, { props: { indeterminate: true } as never, global: { plugins: [createOrigam()] } })
        expect(det.findAll('.origam-progress__bar')).toHaveLength(1)
        expect(ind.findAll('.origam-progress__bar')).toHaveLength(2)
    })
})
