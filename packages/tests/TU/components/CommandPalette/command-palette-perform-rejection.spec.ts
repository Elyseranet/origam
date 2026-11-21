import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import type { ICommand } from '@origam/interfaces'

import OrigamCommandPalette from '@origam/components/CommandPalette/OrigamCommandPalette.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

const flush = async () => {
    for (let i = 0; i < 5; i++) {
        await Promise.resolve()
        await nextTick()
    }
}

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('OrigamCommandPalette — perform() rejection (#1398)', () => {
    it('click: no unhandled rejection, dev warning emitted, palette closes as before', async () => {
        const unhandled = vi.fn()
        process.on('unhandledRejection', unhandled)
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const commands: Array<ICommand> = [{ id: 'boom', label: 'Boom', perform: () => Promise.reject(new Error('nope')) }]
        const wrapper = mount(OrigamCommandPalette, {
            props: { modelValue: true, commands, hotkey: null } as never,
            attachTo: document.body,
            global: { plugins: [createOrigam()] }
        })

        document.querySelector<HTMLElement>('.origam-command-palette__item')!.click()
        await flush()
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(unhandled).not.toHaveBeenCalled()
        expect(warn.mock.calls.some(call => String(call[0]).includes('perform() rejected: Error: nope'))).toBe(true)
        expect(wrapper.emitted('select')).toHaveLength(1)
        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])

        process.off('unhandledRejection', unhandled)
        wrapper.unmount()
    })
})
