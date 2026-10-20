// #1180 — `lang` is an open string. With a custom `code.highlighter` the DS no
// longer folds an unknown `lang` onto plaintext before the highlighter sees
// it; `createOrigam({ code: { langs } })` sets the list handed to
// `createHighlighter`. Mount-based on purpose, same reasoning as
// `OrigamCode-custom-highlighter.spec.ts` (singleton + real createOrigam wiring).

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import OrigamCode from '@origam/components/Code/OrigamCode.vue'
import { createOrigam } from '@origam/origam'
import { resetCodeHighlighterForTesting } from '@origam/composables/Code/code.composable'
import { SUPPORTED_LANGS } from '@origam/consts/Code/code.const'

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

function makeLoader (served: ReadonlyArray<string>) {
    const codeToHtml = vi.fn((code: string, opts: { lang: string }) => {
        if (!served.includes(opts.lang)) throw new Error(`no grammar for ${opts.lang}`)
        return `<pre><code><span data-fake="1" data-lang="${opts.lang}">${code}</span></code></pre>`
    })
    const createHighlighter = vi.fn(async (_opts: { themes: ReadonlyArray<string>, langs: ReadonlyArray<string> }) => ({codeToHtml}))
    const loader = vi.fn(async () => ({createHighlighter}))
    return {codeToHtml, createHighlighter, loader}
}

describe('OrigamCode — open `lang` (#1180)', () => {
    beforeEach(() => {
        resetCodeHighlighterForTesting()
    })

    it('custom highlighter: a lang outside SUPPORTED_LANGS reaches the highlighter untouched', async () => {
        const {codeToHtml, loader} = makeLoader(['plaintext', 'dockerfile'])
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const wrapper = mount(OrigamCode, {
            props: {lang: 'dockerfile', code: 'FROM node:22'},
            global: {plugins: [createOrigam({code: {highlighter: loader}})]}
        })
        await flushPromises()
        await flushPromises()

        expect(codeToHtml).toHaveBeenCalledTimes(1)
        expect(codeToHtml).toHaveBeenCalledWith('FROM node:22', expect.objectContaining({lang: 'dockerfile'}))
        expect(wrapper.find('.origam-code__code').html()).toContain('data-lang="dockerfile"')
        expect(warn.mock.calls.some(c => String(c[0]).includes('not in the bundled grammar set'))).toBe(false)

        warn.mockRestore()
        wrapper.unmount()
    })

    it('custom highlighter that cannot serve the lang: falls back to plaintext with a dev warning', async () => {
        const {codeToHtml, loader} = makeLoader(['plaintext'])
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const wrapper = mount(OrigamCode, {
            props: {lang: 'dockerfile', code: 'FROM node:22'},
            global: {plugins: [createOrigam({code: {highlighter: loader}})]}
        })
        await flushPromises()
        await flushPromises()

        expect(codeToHtml).toHaveBeenNthCalledWith(1, 'FROM node:22', expect.objectContaining({lang: 'dockerfile'}))
        expect(codeToHtml).toHaveBeenNthCalledWith(2, 'FROM node:22', expect.objectContaining({lang: 'plaintext'}))
        expect(wrapper.find('.origam-code__code').html()).toContain('data-lang="plaintext"')
        expect(warn.mock.calls.some(c => String(c[0]).includes('could not tokenise lang="dockerfile"'))).toBe(true)

        warn.mockRestore()
        wrapper.unmount()
    })

    it('`code.langs` is the list handed to createHighlighter; default is SUPPORTED_LANGS', async () => {
        const custom = makeLoader(['plaintext', 'dockerfile'])
        const w1 = mount(OrigamCode, {
            props: {lang: 'dockerfile', code: 'FROM node:22'},
            global: {plugins: [createOrigam({code: {highlighter: custom.loader, langs: ['plaintext', 'dockerfile']}})]}
        })
        await flushPromises()
        await flushPromises()
        expect(custom.createHighlighter).toHaveBeenCalledTimes(1)
        expect(custom.createHighlighter.mock.calls[0][0].langs).toEqual(['plaintext', 'dockerfile'])
        w1.unmount()

        resetCodeHighlighterForTesting()
        const dflt = makeLoader(['ts'])
        const w2 = mount(OrigamCode, {
            props: {lang: 'ts', code: 'const x = 1'},
            global: {plugins: [createOrigam({code: {highlighter: dflt.loader}})]}
        })
        await flushPromises()
        await flushPromises()
        expect(dflt.createHighlighter.mock.calls[0][0].langs).toEqual([...SUPPORTED_LANGS])
        w2.unmount()
    })

    it('built-in highlighter: a lang listed in `code.langs` is accepted, an unlisted one still falls back', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const w1 = mount(OrigamCode, {
            props: {lang: 'dockerfile', code: 'FROM node:22'},
            global: {plugins: [createOrigam({code: {langs: ['plaintext', 'dockerfile']}})]}
        })
        await (w1.vm as unknown as { rebuild: () => Promise<void> }).rebuild()
        expect(warn.mock.calls.some(c => String(c[0]).includes('not in the bundled grammar set'))).toBe(false)
        expect(w1.find('.origam-code__code').html()).toContain('--shiki-light')
        w1.unmount()

        resetCodeHighlighterForTesting()
        const w2 = mount(OrigamCode, {
            props: {lang: 'dockerfile', code: 'FROM node:22'},
            global: {plugins: [createOrigam()]}
        })
        await (w2.vm as unknown as { rebuild: () => Promise<void> }).rebuild()
        expect(warn.mock.calls.some(c => String(c[0]).includes('lang="dockerfile" is not in the bundled grammar set'))).toBe(true)
        w2.unmount()

        warn.mockRestore()
    })
})
