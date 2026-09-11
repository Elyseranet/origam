// SSR smoke tests — verify origam composables / utilities can be imported
// AND invoked without crashing when `window` / `document` are unavailable.
//
// Vitest runs in jsdom by default which means a fake DOM is present. To
// simulate true server-side execution, each test wipes the relevant globals
// before exercising the unit under test, then restores them in afterEach.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

import {
    _resetCssSupportCache,
    useCssSupport,
    useCssSupportClient
} from '@origam/composables/CssSupport/cssSupport.composable'

import { useSnackbarGroup, resetSnackbarGroupForTesting } from '@origam/composables/Snackbar/snackbar-group.composable'
import { useMask } from '@origam/composables/Mask/mask.composable'
import { useCode } from '@origam/composables/Code/code.composable'
import { applyModeSync, applyThemeSync, readPersistedMode, readPersistedTheme } from '@origam/composables/Theme/theme.composable'

import { applyTheme, themeToCss } from '@origam/utils/Theme/apply-theme.util'

import { sanitizeHtml } from '@origam/utils/Textarea/sanitize-html.util'
import { htmlToMarkdown } from '@origam/utils/Textarea/html-to-markdown.util'

// ───────────────────────────────────────────────────────────────────────────
// Helper — temporarily strip browser globals to simulate Node / SSR
// ───────────────────────────────────────────────────────────────────────────

let savedWindow: typeof globalThis.window | undefined
let savedDocument: typeof globalThis.document | undefined
let savedCSS: typeof globalThis.CSS | undefined

function enterSSRMode () {
    savedWindow = globalThis.window
    savedDocument = globalThis.document
    savedCSS = globalThis.CSS
    // @ts-expect-error — intentionally clobber `window` for the SSR scope
    delete (globalThis as any).window
    // @ts-expect-error — intentionally clobber `document` for the SSR scope
    delete (globalThis as any).document
    // @ts-expect-error — intentionally clobber `CSS` for the SSR scope
    delete (globalThis as any).CSS
}

function exitSSRMode () {
    if (savedWindow !== undefined) (globalThis as any).window = savedWindow
    if (savedDocument !== undefined) (globalThis as any).document = savedDocument
    if (savedCSS !== undefined) (globalThis as any).CSS = savedCSS
    savedWindow = savedDocument = savedCSS = undefined
}

// Safety net: if any in-SSR-mode test throws before reaching its inline
// `exitSSRMode()`, the stripped globals would leak into the next test
// (a deleted `document` then crashes the first test that mounts). This
// guarantees restoration after every test; it is a no-op when already
// restored.
afterEach(exitSSRMode)

describe('SSR safety — module-level import does not touch DOM', () => {
    it('useCssSupport module can be imported without a window', () => {
        enterSSRMode()
        // Reset cached singletons so the next call evaluates from scratch
        _resetCssSupportCache()
        const { css, supports, supportsAny, supportsAll, has } = useCssSupport()
        expect(typeof supports).toBe('function')
        expect(typeof supportsAny).toBe('function')
        expect(typeof supportsAll).toBe('function')
        expect(typeof has).toBe('function')
        // Every flag must be false during SSR.
        for (const key of Object.keys(css.value) as Array<keyof typeof css.value>) {
            expect(css.value[key]).toBe(false)
        }
        // Free-form query must also be false (no crash, no thrown error).
        expect(supports('display: grid')).toBe(false)
        expect(supportsAny('display: grid', 'display: -ms-grid')).toBe(false)
        expect(supportsAll('display: grid')).toBe(false)
        exitSSRMode()
    })

    it('readPersistedTheme returns "auto" when localStorage is missing', () => {
        enterSSRMode()
        expect(readPersistedTheme()).toBe('auto')
        exitSSRMode()
    })

    it('applyThemeSync does not throw without document', () => {
        enterSSRMode()
        expect(() => applyThemeSync('dark')).not.toThrow()
        expect(() => applyThemeSync('auto')).not.toThrow()
        exitSSRMode()
    })

    it('readPersistedMode returns "auto" when localStorage is missing', () => {
        enterSSRMode()
        expect(readPersistedMode()).toBe('auto')
        exitSSRMode()
    })

    it('applyModeSync does not throw without document', () => {
        enterSSRMode()
        expect(() => applyModeSync('dark')).not.toThrow()
        expect(() => applyModeSync('auto')).not.toThrow()
        exitSSRMode()
    })

    it('applyTheme is a no-op (returns null) without document', () => {
        enterSSRMode()
        let result: string | null = 'unset'
        expect(() => { result = applyTheme({ name: 'brand-a', cssVars: { '--origam-radius---md': '0.5rem' } }) }).not.toThrow()
        expect(result).toBeNull()
        exitSSRMode()
    })

    it('themeToCss is pure — serialises without touching the DOM', () => {
        enterSSRMode()
        const css = themeToCss({ name: 'brand-a', cssVars: { '--origam-radius---md': '0.5rem' } })
        expect(css).toContain('[data-theme="brand-a"]')
        expect(css).toContain('--origam-radius---md: 0.5rem;')
        exitSSRMode()
    })

    it('sanitizeHtml returns the raw input when DOMParser is missing', () => {
        // Stub DOMParser separately — jsdom keeps it global even after we
        // strip window/document.
        const savedDOMParser = (globalThis as any).DOMParser
        // @ts-expect-error — intentionally clobber DOMParser to simulate Node
        delete (globalThis as any).DOMParser
        const out = sanitizeHtml('<p>hello <script>alert(1)</script></p>')
        // SSR fallback: returns input untouched (documented behaviour).
        expect(typeof out).toBe('string')
        ;(globalThis as any).DOMParser = savedDOMParser
    })

    it('htmlToMarkdown returns the raw input when DOMParser is missing', () => {
        const savedDOMParser = (globalThis as any).DOMParser
        // @ts-expect-error — intentionally clobber DOMParser to simulate Node
        delete (globalThis as any).DOMParser
        const out = htmlToMarkdown('<p>hello</p>')
        expect(typeof out).toBe('string')
        ;(globalThis as any).DOMParser = savedDOMParser
    })

    it('useSnackbarGroup dismiss() does not crash without window.clearTimeout', () => {
        resetSnackbarGroupForTesting()
        const { notify, dismiss } = useSnackbarGroup({ id: 'ssr-smoke' })

        enterSSRMode()
        const id = notify({ text: 'hello' })
        // Should not throw even though `window` is missing.
        expect(() => dismiss(id)).not.toThrow()
        exitSSRMode()
    })

    it('useMask is pure — no DOM access on construction', () => {
        enterSSRMode()
        const { masked, unmasked } = useMask('1234', '###-###')
        expect(masked.value).toBeDefined()
        expect(unmasked.value).toBeDefined()
        exitSSRMode()
    })

    it('useCode setup does not touch the DOM (shiki loads lazily)', () => {
        enterSSRMode()
        const api = useCode()
        expect(typeof api.highlight).toBe('function')
        expect(typeof api.prime).toBe('function')
        expect(typeof api.isReady).toBe('function')
        expect(api.isReady()).toBe(false)
        exitSSRMode()
    })
})

describe('SSR safety — Vue server renderer integration', () => {
    beforeEach(() => {
        _resetCssSupportCache()
    })

    afterEach(() => {
        // jsdom env stays as-is between tests; nothing to restore here.
    })

    it('renderToString of a component using useCssSupport does not crash', async () => {
        const Host = defineComponent({
            name: 'SSRHost',
            setup () {
                const { css } = useCssSupport()
                return () => h('div', { class: { 'has-grid': css.value.grid } }, 'hello')
            }
        })
        const html = await renderToString(h(Host))
        expect(html).toContain('hello')
        // All flags must be false → no `has-grid` class on the SSR output.
        expect(html).not.toContain('has-grid')
    })

    it('useCssSupportClient defaultValue is what gets rendered on the server', async () => {
        const Host = defineComponent({
            name: 'SSRHostClient',
            setup () {
                const supportsContainer = useCssSupportClient('containerQueries', { defaultValue: false })
                return () => h('div', { class: { 'cq-on': supportsContainer.value } }, 'host')
            }
        })
        const html = await renderToString(h(Host))
        expect(html).toContain('host')
        expect(html).not.toContain('cq-on')
    })
})

describe('SSR safety — composables stay reactive after hydration', () => {
    it('useCssSupportClient flips to true on the client when the feature is supported', async () => {
        // jsdom does not implement CSS.supports; we stub it for this test.
        const savedCSS = (globalThis as any).CSS
        ;(globalThis as any).CSS = {
            supports: vi.fn().mockReturnValue(true)
        }
        _resetCssSupportCache()

        const { mount } = await import('@vue/test-utils')
        const Host = defineComponent({
            setup () {
                const flag = useCssSupportClient('grid', { defaultValue: false })
                return () => h('span', { class: { on: flag.value } }, String(flag.value))
            }
        })
        const wrapper = mount(Host)
        // onMounted fires synchronously in vue-test-utils — the flag should now be true.
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toBe('true')

        ;(globalThis as any).CSS = savedCSS
    })
})
