// Tests for `useTheme` composable.
// Covers: persistence, document attribute application, prefers-color-scheme
// resolution, toggle helper, SSR safety.

import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { _resetThemeForTesting, applyModeSync, applyThemeSync, readPersistedMode, readPersistedTheme, useTheme } from '@origam/composables/Theme/theme.composable'

const STORAGE_KEY = 'origam-theme'
const MODE_STORAGE_KEY = 'origam-mode'

function makeHost (cb: (api: ReturnType<typeof useTheme>) => void) {
    return defineComponent({
        setup () {
            const api = useTheme()
            cb(api)
            return () => h('div')
        }
    })
}

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.removeAttribute('data-theme')
        document.documentElement.removeAttribute('data-mode')
        // Clear module-level singletons so each spec re-reads the fresh
        // matchMedia mock and persisted values from scratch.
        _resetThemeForTesting()
        // Reset matchMedia to a controllable mock
        const listeners = new Set<(e: MediaQueryListEvent) => void>()
        // @ts-expect-error - jsdom does not implement matchMedia
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.add(l),
            removeEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.delete(l),
            dispatchEvent: () => true,
            onchange: null,
            addListener: () => {},
            removeListener: () => {}
        }))
    })

    afterEach(() => {
        document.documentElement.removeAttribute('data-theme')
        document.documentElement.removeAttribute('data-mode')
    })

    it('defaults to "auto" when no persisted value exists', () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        expect(captured!.theme.value).toBe('auto')
    })

    it('reads persisted theme from localStorage', () => {
        localStorage.setItem(STORAGE_KEY, 'dark')
        // Force fresh module state by re-importing — singleton behaviour means
        // we observe the snapshot taken at first call. So we read manually.
        expect(readPersistedTheme()).toBe('dark')
    })

    it('applies data-theme attribute on setTheme()', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setTheme('dark')
        await nextTick()
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('removes data-theme when set to "auto"', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setTheme('dark')
        await nextTick()
        captured!.setTheme('auto')
        await nextTick()
        expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    })

    it('persists theme changes to localStorage', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setTheme('dark')
        await nextTick()
        expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    })

    it('toggle() flips light ↔ dark', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setTheme('light')
        await nextTick()
        captured!.toggle()
        expect(captured!.theme.value).toBe('dark')
        captured!.toggle()
        expect(captured!.theme.value).toBe('light')
    })

    it('applyThemeSync writes to document without Vue lifecycle', () => {
        applyThemeSync('dark')
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        applyThemeSync('auto')
        expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    })

    it('supports custom theme strings (e.g. "brand-a")', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setTheme('brand-a')
        await nextTick()
        expect(document.documentElement.getAttribute('data-theme')).toBe('brand-a')
    })

    // ── Mode axis (data-mode) ──────────────────────────────────────────────

    it('defaults mode to "auto" when no persisted value exists', () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        expect(captured!.mode.value).toBe('auto')
    })

    it('applies data-mode attribute on setMode()', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setMode('dark')
        await nextTick()
        expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
    })

    it('keeps data-mode CONCRETE when set to "auto" (resolves via prefers-color-scheme)', async () => {
        // The token matrix has no mode-less fallback, so `data-mode` must
        // always carry a concrete value. With the mock reporting
        // `prefers-color-scheme: dark = false`, "auto" resolves to "light".
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setMode('dark')
        await nextTick()
        captured!.setMode('auto')
        await nextTick()
        expect(document.documentElement.getAttribute('data-mode')).toBe('light')
        expect(captured!.mode.value).toBe('auto')
    })

    it('persists mode changes to localStorage', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setMode('dark')
        await nextTick()
        expect(localStorage.getItem(MODE_STORAGE_KEY)).toBe('dark')
    })

    it('toggleMode() flips light ↔ dark independently of theme', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setMode('light')
        await nextTick()
        captured!.toggleMode()
        expect(captured!.mode.value).toBe('dark')
        captured!.toggleMode()
        expect(captured!.mode.value).toBe('light')
    })

    it('theme and mode axes do not interfere', async () => {
        let captured: ReturnType<typeof useTheme> | null = null
        mount(makeHost(api => { captured = api }))
        captured!.setTheme('brand-a')
        captured!.setMode('dark')
        await nextTick()
        expect(document.documentElement.getAttribute('data-theme')).toBe('brand-a')
        expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
    })

    it('applyModeSync writes a CONCRETE data-mode without Vue lifecycle', () => {
        applyModeSync('dark')
        expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
        // "auto" resolves to a concrete value (light, per the mock) — never removed.
        applyModeSync('auto')
        expect(document.documentElement.getAttribute('data-mode')).toBe('light')
    })

    it('readPersistedMode reads from localStorage', () => {
        localStorage.setItem(MODE_STORAGE_KEY, 'dark')
        expect(readPersistedMode()).toBe('dark')
    })

    // #275 — the singleton must anchor on `globalThis` on the client, not a
    // plain module-level `let`. Root cause: a consuming app can alias the DS
    // Nuxt module to *source* (dev convenience/HMR) while every other DS
    // import resolves to the *compiled* package export — two different files
    // on disk, hence two independent module instances of this file, each
    // with its own module-level singleton. `setTheme()` called through one
    // instance (e.g. the app's UI) never notified the other's watchers (e.g.
    // the Nuxt plugin reassigning `_defaultsRef`), so component PROPS driven
    // by `theme.components` froze on the initial theme while cssVars (plain
    // CSS cascade, unrelated to this module) kept updating live — until a
    // full reload re-seeded both instances from the same cookie.
    describe('#275 — singleton survives module duplication', () => {
        it('anchors the theme/mode refs on globalThis, not a private module scope', () => {
            let captured: ReturnType<typeof useTheme> | null = null
            mount(makeHost(api => { captured = api }))
            captured!.setTheme('brand-a')

            const globalState = (globalThis as unknown as Record<string, { theme?: { value: unknown } }>).__origamThemeSingleton__
            expect(globalState).toBeDefined()
            expect(globalState!.theme?.value).toBe('brand-a')
        })

        it('a second useTheme() call reads the SAME ref a first call already mutated — simulating two module instances reaching the same global anchor', async () => {
            let first: ReturnType<typeof useTheme> | null = null
            let second: ReturnType<typeof useTheme> | null = null

            mount(makeHost(api => { first = api }))
            first!.setTheme('brand-b')
            await nextTick()

            // A fresh `useTheme()` call (as a duplicated module instance would
            // make, unaware of the first) must observe the SAME current value
            // — proving state lives on the shared global anchor, not on a
            // per-module-instance variable that a duplicate would re-init to
            // its own default.
            mount(makeHost(api => { second = api }))
            expect(second!.theme.value).toBe('brand-b')

            // And it must stay live: a change through either handle is visible
            // through the other, exactly the property that was broken when
            // the Nuxt plugin's watcher lived on a desynced instance.
            second!.setTheme('brand-c')
            await nextTick()
            expect(first!.theme.value).toBe('brand-c')
        })
    })
})
