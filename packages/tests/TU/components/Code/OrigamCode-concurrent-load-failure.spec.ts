// #1189 — two <OrigamCode> mounted in the same tick while the highlighter import
// is in flight and REJECTS: every instance must degrade to plain code.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import OrigamCode from '@origam/components/Code/OrigamCode.vue'
import { createOrigam } from '@origam/origam'
import { resetCodeHighlighterForTesting, useCode } from '@origam/composables/Code/code.composable'

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

function failingLoader () {
    return vi.fn(async () => {
        await new Promise((r) => setTimeout(r, 5))
        throw new Error('Failed to resolve module specifier')
    })
}

describe('OrigamCode — concurrent highlighter load failure (#1189)', () => {
    beforeEach(() => {
        resetCodeHighlighterForTesting()
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('two concurrent highlight() calls both receive the plain fallback, no rejection', async () => {
        const loader = failingLoader()
        const plugin = createOrigam({ code: { highlighter: loader } })
        const results: string[] = []
        const errors: unknown[] = []
        const hosts = [0, 1].map(() => mount({
            setup () {
                const { highlight } = useCode()
                highlight('a < b', 'ts').then((h) => results.push(h), (e) => errors.push(e))
                return () => null
            }
        }, { global: { plugins: [plugin] } }))
        await new Promise((r) => setTimeout(r, 30))
        await flushPromises()
        expect(errors).toEqual([])
        expect(results).toEqual(['a &lt; b', 'a &lt; b'])
        expect(loader).toHaveBeenCalledTimes(1)
        hosts.forEach((h) => h.unmount())
    })

    it('two OrigamCode mounted in the same tick are both painted', async () => {
        const plugins = [createOrigam({ code: { highlighter: failingLoader() } })]
        const a = mount(OrigamCode, { props: { lang: 'ts', code: 'const a = 1' }, global: { plugins } })
        const b = mount(OrigamCode, { props: { lang: 'ts', code: 'const b = 2' }, global: { plugins } })
        await new Promise((r) => setTimeout(r, 30))
        await flushPromises()
        expect(a.find('.origam-code__code').text()).toContain('const a = 1')
        expect(b.find('.origam-code__code').text()).toContain('const b = 2')
        a.unmount()
        b.unmount()
    })
})
