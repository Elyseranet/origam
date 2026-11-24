// Regression for #1383 (constat 2) — without `inheritAttrs: false`, native
// attrs (aria-label, accept) fell through onto the root <div> AND reached
// the real <input type="file"> via inputAttrs.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamFileField — native attrs go to the <input> only (#1383)', () => {
    it.each([false, true])('aria-label / accept are not duplicated on the root (dragndrop=%s)', async (dragndrop) => {
        const wrapper = mount(OrigamFileField, {
            props: { dragndrop } as never,
            attrs: { 'aria-label': 'Upload', accept: '.pdf' },
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input[type="file"]')
        expect(input.attributes('aria-label')).toBe('Upload')
        expect(input.attributes('accept')).toBe('.pdf')
        expect(wrapper.findAll('[aria-label="Upload"]')).toHaveLength(1)
        expect(wrapper.findAll('[accept]')).toHaveLength(1)
        wrapper.unmount()
    })
})
