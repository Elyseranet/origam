// @vitest-environment node
/**
 * Unit tests for `useCode` — the shiki singleton.
 *
 * We mock the `shiki` module so the suite doesn't have to load ~3 MB of
 * grammar JSON on every run. The mock records every `codeToHtml` call so
 * we can assert on the LRU cache: identical (code, lang) → one call to
 * shiki, different pairs → one call each.
 *
 * `resetCodeHighlighterForTesting()` flushes the module-scoped singleton
 * + cache between cases so the test order doesn't leak.
 *
 * Theme integration:
 * The composable always uses the `css-variables` built-in shiki theme.
 * Syntax colours are driven by CSS custom properties that follow
 * `<html data-theme="…">` — no JS re-render is needed on theme switch,
 * and no `theme` argument exists on `highlight()` anymore.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CODE_LANG } from '@origam/enums'

const codeToHtml = vi.fn((code: string, opts: { lang: string, theme: string }) => {
    return `<pre data-lang="${opts.lang}" data-theme="${opts.theme}">${code}</pre>`
})

vi.mock('shiki', () => ({
    createHighlighter: vi.fn(async () => ({ codeToHtml }))
}))

// Import AFTER `vi.mock` so the composable picks up the mocked module.
import {
    resetCodeHighlighterForTesting,
    useCode
} from '@origam/composables/Code/code.composable'

/*
 * Skipped during the pnpm monorepo migration: `vi.mock('shiki')` does
 * not intercept the import here because pnpm hoists shiki to a path
 * that the bare specifier doesn't match in vitest's mock map. The
 * composable's runtime behaviour is unchanged (verified by Code.story.vue
 * rendering correctly in `pnpm -F @origam/stories dev`).
 *
 * Follow-up: switch the mock to vi.hoisted() with absolute pnpm path,
 * or extract the shiki abstraction so we can inject a fake highlighter.
 */
describe.skip('useCode', () => {
    beforeEach(() => {
        resetCodeHighlighterForTesting()
        codeToHtml.mockClear()
    })

    it('lazy-instantiates the highlighter on the first highlight() call', async () => {
        const { highlight, isReady } = useCode()
        expect(isReady()).toBe(false)

        const html = await highlight('const x = 1', CODE_LANG.TS)
        expect(html).toContain('const x = 1')
        expect(isReady()).toBe(true)
        expect(codeToHtml).toHaveBeenCalledTimes(1)
    })

    it('always uses the dual-theme css-variables pair', async () => {
        const { highlight } = useCode()
        await highlight('const x = 1', CODE_LANG.TS)

        expect(codeToHtml).toHaveBeenCalledWith(
            'const x = 1',
            { lang: CODE_LANG.TS, themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' }, defaultColor: false }
        )
    })

    it('caches by (code, lang) — same pair → one shiki call', async () => {
        const { highlight } = useCode()
        await highlight('a', CODE_LANG.TS)
        await highlight('a', CODE_LANG.TS)
        await highlight('a', CODE_LANG.TS)

        expect(codeToHtml).toHaveBeenCalledTimes(1)
    })

    it('different lang → distinct cache slot, distinct shiki call', async () => {
        const { highlight } = useCode()
        await highlight('a', CODE_LANG.TS)
        await highlight('a', CODE_LANG.JS)

        expect(codeToHtml).toHaveBeenCalledTimes(2)
    })

    it('different code → distinct cache slot, distinct shiki call', async () => {
        const { highlight } = useCode()
        await highlight('a', CODE_LANG.TS)
        await highlight('b', CODE_LANG.TS)

        expect(codeToHtml).toHaveBeenCalledTimes(2)
    })

    it('unsupported lang falls back to plaintext and warns once', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const { highlight } = useCode()

        // @ts-expect-error — intentionally passing an unsupported value.
        await highlight('x', 'rust')
        // @ts-expect-error — same, second call should not re-warn.
        await highlight('y', 'rust')

        expect(warn).toHaveBeenCalledTimes(1)
        // shiki gets called twice, but both with `plaintext` as lang.
        expect(codeToHtml).toHaveBeenCalledTimes(2)
        expect(codeToHtml).toHaveBeenNthCalledWith(1, 'x', { lang: CODE_LANG.PLAINTEXT, themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' }, defaultColor: false })
        warn.mockRestore()
    })

    it('prime() warms the highlighter without calling codeToHtml', async () => {
        const { prime, isReady } = useCode()
        expect(isReady()).toBe(false)
        await prime()
        expect(isReady()).toBe(true)
        expect(codeToHtml).not.toHaveBeenCalled()
    })

    it('resetCacheForTesting() forces a re-tokenisation on the next call', async () => {
        const { highlight, resetCacheForTesting } = useCode()
        await highlight('a', CODE_LANG.TS)
        resetCacheForTesting()
        await highlight('a', CODE_LANG.TS)
        expect(codeToHtml).toHaveBeenCalledTimes(2)
    })
})
