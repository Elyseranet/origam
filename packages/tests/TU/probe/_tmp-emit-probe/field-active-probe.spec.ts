import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'

import OrigamField from '@origam/components/Field/OrigamField.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

describe('PROBE — does OrigamField actually emit update:active at runtime?', () => {
    it('emits update:active when focus toggles isActive via useStateFlag', async () => {
        const wrapper = mount(OrigamField, {
            props: { label: 'Test label' },
            slots: {
                default: (slotProps: any) => h('input', {
                    class: 'origam-field__input',
                    onFocus: slotProps.onFocus,
                    onBlur: slotProps.onBlur
                })
            },
            global: { plugins: [createOrigam()] },
            attrs: {
                'onUpdate:active': () => {}
            }
        })

        const input = wrapper.find('input')
        await input.trigger('focus')
        await nextTick()
        await input.trigger('blur')
        await nextTick()

        console.log('emitted update:active =', wrapper.emitted('update:active'))
        console.log('emitted update:focused =', wrapper.emitted('update:focused'))

        expect(wrapper.emitted('update:active')).toBeTruthy()
    })

    it('emits update:modelValue at any point? (probe only)', async () => {
        const wrapper = mount(OrigamField, {
            props: { label: 'Test label', modelValue: '' } as never,
            slots: {
                default: () => h('input', { class: 'origam-field__input' })
            },
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        console.log('emitted update:modelValue =', wrapper.emitted('update:modelValue'))
    })
})
