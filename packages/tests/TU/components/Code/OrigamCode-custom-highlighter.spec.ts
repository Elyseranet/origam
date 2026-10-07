// Unit tests for `createOrigam({ code: { highlighter } })` — the option that
// lets an app supply its own shiki-compatible module instead of the DS's
// default `import('shiki')`. See `packages/ds/src/composables/Code/code.composable.ts`
// (`loadHighlighter()`) and `packages/docs/components/Code/OrigamCode.md`
// ("Supplying your own highlighter").
//
// Why no `vi.mock('shiki', …)` here, unlike `OrigamCode.spec.ts`: measured
// in this worktree — a fake mounted directly and awaited via the exposed
// `rebuild()` shows the mock is NEVER hit (`shikiCreateHighlighter` stays at
// 0 calls) while the component still ends up `isReady() === true` with real
// `--shiki-light` / `--shiki-dark` token spans in the DOM. The REAL `shiki`
// package (a devDependency a few levels up the workspace) loads instead —
// consistent with `code.composable.spec.ts`'s own `describe.skip` note:
// "`vi.mock('shiki')` does not intercept the import here because pnpm
// hoists shiki to a path the bare specifier doesn't match", compounded by
// `/* @vite-ignore */` telling Vite not to rewrite the specifier at all. A
// decorative mock nobody's code path reaches would be worse than none — the
// "fallback unchanged" case below instead asserts on the REAL shiki output,
// which is a stronger proof anyway (actual tokeniser, actual DOM).
//
// Why this is a component-mount test and not a Playwright/Histoire e2e spec:
// the option is APP-LEVEL (`createOrigam()`), and `useCode()`'s highlighter
// is a page-wide singleton — Histoire installs ONE `createOrigam()` for its
// whole dev server, shared by every story, so there is no way to exercise a
// per-story highlighter override there without either mutating that shared
// setup (touching a file every OTHER story depends on) or fabricating a
// non-canonical Variant for a surface that is not a component prop. What
// this spec DOES verify is real: an actual `<OrigamCode>` mount, the real
// `useCode()` composable, the real `createOrigam()` provide/inject wiring,
// and the real DOM `innerHTML` `paintIntoDom()` writes — none of that is the
// `getComputedStyle()`-under-jsdom trap this repo's CLAUDE.md warns about
// (that trap is specifically about `var()` CSS custom-property resolution;
// nothing here reads a computed style, only plain DOM content set via a JS
// property write). The existing `packages/tests/e2e/code.spec.ts` suite is
// the real-browser regression net for the DEFAULT (no-option) path and is
// unaffected by this change — re-run it after any edit here.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import OrigamCode from '@origam/components/Code/OrigamCode.vue'
import { createOrigam } from '@origam/origam'
import { resetCodeHighlighterForTesting } from '@origam/composables/Code/code.composable'

// jsdom has no `window.matchMedia` — `useTheme()` (invoked inside
// `OrigamCode`) throws without this stub. Same stub as `OrigamCode.spec.ts`.
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

type TRebuildable = { rebuild: () => Promise<void> }

describe('OrigamCode — createOrigam({ code: { highlighter } })', () => {
    beforeEach(() => {
        // `useCode()`'s highlighter is a MODULE-SCOPED singleton (every
        // `<OrigamCode>` on a page shares one). Without this reset, the
        // first test in this file to mount wins the singleton for every
        // test after it, regardless of which `createOrigam()` config the
        // later tests install.
        resetCodeHighlighterForTesting()
    })

    it('fallback unchanged — no `code` option set still goes through the default `import(\'shiki\')` path', async () => {
        const wrapper = mount(OrigamCode, {
            props: {lang: 'ts', code: 'const x = 1'},
            global: {plugins: [createOrigam()]}
        })

        // `rebuild()` is exposed via `defineExpose` precisely so a test can
        // await the WHOLE async chain deterministically, including the real
        // dynamic import — `flushPromises()` alone is not enough ticks for
        // it (measured: it leaves `isReady()` at `false` and an empty
        // `<code>`).
        await (wrapper.vm as unknown as TRebuildable).rebuild()

        const html = wrapper.find('.origam-code__code').html()
        expect(html).toContain('const')
        // Real shiki's dual-theme output — proves actual tokenisation
        // happened, not an escaped-plaintext fallback.
        expect(html).toContain('--shiki-light')
        expect(html).toContain('--shiki-dark')

        wrapper.unmount()
    })

    it('a supplied highlighter is actually used, and the DS never calls it its own `shiki`', async () => {
        const fakeCodeToHtml = vi.fn((code: string, opts: { lang: string }) =>
            // The marker lives INSIDE the `<code>…</code>` capture —
            // `paintIntoDom()` extracts ONLY that inner content (see
            // `OrigamCode.vue`), so anything on the outer `<pre>` or on the
            // `<code>` tag's own attributes is discarded by design and would
            // never reach the DOM either way.
            `<pre><code><span data-fake-highlighter="1" data-lang="${opts.lang}">${code}</span></code></pre>`)
        const fakeCreateHighlighter = vi.fn(async () => ({codeToHtml: fakeCodeToHtml}))
        // The loader shape `createOrigam({ code: { highlighter } })` expects —
        // a function resolving to a module exposing ONLY `createHighlighter`,
        // matching `TShikiModule` / the ticket's "shiki-lite" contract.
        const fakeLoader = vi.fn(async () => ({createHighlighter: fakeCreateHighlighter}))

        const wrapper = mount(OrigamCode, {
            props: {lang: 'ts', code: 'const y = 2'},
            global: {plugins: [createOrigam({code: {highlighter: fakeLoader}})]}
        })
        // NOT a manual `rebuild()` call here: `onMounted()` already fired one
        // (fire-and-forget), and calling it again concurrently — before that
        // first call's `highlight()` has had a chance to populate the LRU
        // cache — doubles every call count below. The fake promises resolve
        // in microtasks (no real I/O), so a couple of `flushPromises()`
        // rounds is enough, unlike the real-shiki case in the test above.
        await flushPromises()
        await flushPromises()

        // The loader ran, and the fake highlighter it resolved to is what
        // produced the HTML.
        expect(fakeLoader).toHaveBeenCalledTimes(1)
        expect(fakeCreateHighlighter).toHaveBeenCalledTimes(1)
        expect(fakeCodeToHtml).toHaveBeenCalledTimes(1)

        const html = wrapper.find('.origam-code__code').html()
        expect(html).toContain('data-fake-highlighter="1"')
        expect(html).toContain('const y = 2')
        expect(html).toContain('data-lang="ts"')
        // And real shiki's own dual-theme markers are absent — the fake's
        // output, not shiki's, reached the DOM.
        expect(html).not.toContain('--shiki-light')

        wrapper.unmount()
    })

    it('a supplied highlighter that throws for a lang it does not embed degrades to plaintext, not a crash', async () => {
        // Mirrors the production report: a lighter module (`shiki/core` + a
        // subset of langs) resolves fine via `createHighlighter`, but
        // `codeToHtml` throws for a lang outside that subset.
        const fakeCodeToHtml = vi.fn((code: string, opts: { lang: string }) => {
            if (opts.lang === 'yaml') throw new Error('lang "yaml" is not embedded in this lite bundle')

            return `<pre><code><span data-fake-highlighter="1" data-lang="${opts.lang}">${code}</span></code></pre>`
        })
        const fakeLoader = vi.fn(async () => ({
            createHighlighter: vi.fn(async () => ({codeToHtml: fakeCodeToHtml}))
        }))

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const wrapper = mount(OrigamCode, {
            props: {lang: 'yaml', code: 'key: value'},
            global: {plugins: [createOrigam({code: {highlighter: fakeLoader}})]}
        })
        await flushPromises()
        await flushPromises()

        // First call (yaml) threw, caught by `highlight()`; second call
        // (plaintext) is the fallback retry on the SAME injected highlighter.
        expect(fakeCodeToHtml).toHaveBeenCalledTimes(2)
        expect(fakeCodeToHtml).toHaveBeenNthCalledWith(1, 'key: value', expect.objectContaining({lang: 'yaml'}))
        expect(fakeCodeToHtml).toHaveBeenNthCalledWith(2, 'key: value', expect.objectContaining({lang: 'plaintext'}))

        const html = wrapper.find('.origam-code__code').html()
        expect(html).toContain('data-fake-highlighter="1"')
        expect(html).toContain('data-lang="plaintext"')
        expect(html).toContain('key: value')

        // The page did not break — the root + scroller + code surface are
        // still there.
        expect(wrapper.find('.origam-code').exists()).toBe(true)

        warn.mockRestore()
        wrapper.unmount()
    })
})
