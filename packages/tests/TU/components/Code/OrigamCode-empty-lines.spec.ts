// #1216 — a source ending in "\n" must not get a numbered trailing row.
// (The height half of the defect is CSS and is asserted in e2e/code.spec.ts.)
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamCode from '@origam/components/Code/OrigamCode.vue'
import { createOrigam } from '@origam/origam'
import { resetCodeHighlighterForTesting } from '@origam/composables/Code/code.composable'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

type TRebuildable = { rebuild: () => Promise<void> }

describe('OrigamCode — trailing newline (#1216)', () => {
    it('paints one row per source line, none for the final newline', async () => {
        resetCodeHighlighterForTesting()
        const wrapper = mount(OrigamCode, {
            props: { lang: 'ts', code: 'const a = 1\n\nconst b = 2\n', lineNumbers: true },
            global: { plugins: [createOrigam()] }
        })
        await (wrapper.vm as unknown as TRebuildable).rebuild()
        const lines = wrapper.findAll('.origam-code__row').map(r => r.attributes('data-line'))
        expect(lines).toEqual(['1', '2', '3'])
    })
})
