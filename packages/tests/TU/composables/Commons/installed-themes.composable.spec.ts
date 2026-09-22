// Tests for useInstalledThemes() + the createOrigam({ themes }) plural install:
// the distinct installed brands must be provided to the app context, injected
// CSS-var blocks must be scoped per name×mode, and a consumer reads the list
// back through the composable.

import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import { useInstalledThemes } from '@origam/composables/Commons/installed-themes.composable'
import { origamTheme } from '@origam/themes'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

function mountWithOrigam (origamOptions: Parameters<typeof createOrigam>[0], cb: (themes: ReturnType<typeof useInstalledThemes>) => void) {
    const Host = defineComponent({
        setup () {
            cb(useInstalledThemes())
            return () => h('div')
        }
    })
    return mount(Host, { global: { plugins: [createOrigam(origamOptions)] } })
}

describe('createOrigam({ themes }) — plural install', () => {
    it('injects one scoped <style> block per theme object', () => {
        mountWithOrigam({
            themes: [
                { name: 'sobre', mode: 'light', cssVars: { '--origam-color__surface---default': '#fff' } },
                { name: 'sobre', mode: 'dark', cssVars: { '--origam-color__surface---default': '#000' } },
                { name: 'geek', mode: 'dark', cssVars: { '--origam-color__surface---default': '#050a05' } }
            ]
        }, () => {})

        expect(document.getElementById('origam-theme-sobre-light')).not.toBeNull()
        expect(document.getElementById('origam-theme-sobre-dark')).not.toBeNull()
        expect(document.getElementById('origam-theme-geek-dark')).not.toBeNull()
        expect(document.getElementById('origam-theme-sobre-dark')!.textContent)
            .toContain(':root:root[data-theme="sobre"][data-mode="dark"]')
    })

    it('provides the distinct installed brands, read via useInstalledThemes()', () => {
        let captured: ReturnType<typeof useInstalledThemes> | null = null
        mountWithOrigam({
            themes: [
                { name: 'sobre', mode: 'light', cssVars: { '--origam-radius---md': '0.5rem' } },
                { name: 'sobre', mode: 'dark', cssVars: { '--origam-radius---md': '0.5rem' } },
                { name: 'geek', mode: 'dark', cssVars: { '--origam-radius---md': '0.25rem' } }
            ]
        }, (themes) => { captured = themes })

        expect(captured).toEqual([
            { name: 'sobre', modes: ['light', 'dark'], label: 'sobre' },
            { name: 'geek', modes: ['dark'], label: 'geek' }
        ])
    })

    it('surfaces label / swatch metadata for the switcher', () => {
        let captured: ReturnType<typeof useInstalledThemes> | null = null
        mountWithOrigam({
            themes: [
                { name: 'sobre', mode: 'light', label: 'Sobre', swatch: 'linear-gradient(#000,#8b5cf6)', cssVars: { '--origam-radius---md': '0.5rem' } },
                { name: 'sobre', mode: 'dark', cssVars: { '--origam-radius---md': '0.5rem' } }
            ]
        }, (themes) => { captured = themes })

        expect(captured).toEqual([
            { name: 'sobre', modes: ['light', 'dark'], label: 'Sobre', swatch: 'linear-gradient(#000,#8b5cf6)' }
        ])
    })

    it('merges singular `theme` and plural `themes`', () => {
        let captured: ReturnType<typeof useInstalledThemes> | null = null
        mountWithOrigam({
            theme: { name: 'sobre', mode: 'light', cssVars: { '--origam-radius---md': '0.5rem' } },
            themes: [{ name: 'geek', mode: 'dark', cssVars: { '--origam-radius---md': '0.25rem' } }]
        }, (themes) => { captured = themes })

        expect(captured).toEqual([
            { name: 'sobre', modes: ['light'], label: 'sobre' },
            { name: 'geek', modes: ['dark'], label: 'geek' }
        ])
    })

    it('exposes the installed list on the returned instance', () => {
        const origam = createOrigam({
            themes: [{ name: 'sobre', mode: 'light', cssVars: { '--origam-radius---md': '0.5rem' } }]
        })
        expect(origam.themes).toEqual([{ name: 'sobre', modes: ['light'], label: 'sobre' }])
    })
})

// ⛔ #360 (v3.0.0 harvest) — `createOrigam()` used to prefix EVERY install
// with this exact baseline unconditionally, which is what this describe block
// used to be named for ("always injected"). It no longer does: the baseline
// is now injected ONLY when a consumer passes it explicitly. Renamed and
// rewritten to pin the NEW contract rather than delete the coverage — see
// `createOrigam-bare-no-theme-360.spec.ts` for the matching per-component
// (`OrigamAvatar`) functional proof.
describe('origam baseline — explicit opt-in only (#360)', () => {
    it('a bare install injects NO theme at all — no :root block, no [data-mode=dark] block', () => {
        mountWithOrigam({}, () => {})

        expect(document.getElementById('origam-theme')).toBeNull()
        expect(document.getElementById('origam-theme-dark')).toBeNull()
    })

    it('passing origamTheme explicitly injects the root-scoped baseline (:root + [data-mode=dark])', () => {
        // The default identity comes entirely from the injected blocks — no CSS
        // matrix is loaded in jsdom.
        mountWithOrigam({ themes: origamTheme }, () => {})

        // origamLight has no name and no mode → :root, id `origam-theme`.
        const light = document.getElementById('origam-theme')
        expect(light).not.toBeNull()
        expect(light!.textContent).toContain(':root {')
        expect(light!.textContent).toContain('--origam-color__surface---default: #ffffff;')

        // origamDark has no name but mode 'dark' → [data-mode="dark"], id `origam-theme-dark`.
        const dark = document.getElementById('origam-theme-dark')
        expect(dark).not.toBeNull()
        expect(dark!.textContent).toContain('[data-mode="dark"]')
    })

    it('the origam baseline is NOT a selectable brand (name-less → not listed)', () => {
        let captured: ReturnType<typeof useInstalledThemes> | null = null
        mountWithOrigam({ themes: origamTheme }, (themes) => { captured = themes })
        // No named brand supplied → the switcher list is empty; origam is the
        // baseline, not a data-theme option — even when explicitly installed.
        expect(captured).toEqual([])
    })

    it('brands supplied WITHOUT the baseline do NOT get it appended automatically any more', () => {
        mountWithOrigam({ themes: [{ name: 'sobre', mode: 'light', cssVars: { '--origam-color__surface---default': '#fff' } }] }, () => {})
        expect(document.getElementById('origam-theme')).toBeNull()
        expect(document.getElementById('origam-theme-sobre-light')).not.toBeNull()
    })

    it('the baseline can still be combined with brands by listing both explicitly', () => {
        mountWithOrigam({
            themes: [
                ...origamTheme,
                { name: 'sobre', mode: 'light', cssVars: { '--origam-color__surface---default': '#fff' } }
            ]
        }, () => {})
        expect(document.getElementById('origam-theme')).not.toBeNull()
        expect(document.getElementById('origam-theme-sobre-light')).not.toBeNull()
    })
})

describe('useInstalledThemes() — graceful default', () => {

    it('returns an empty array outside any createOrigam app', () => {
        let captured: ReturnType<typeof useInstalledThemes> | null = null
        const Host = defineComponent({
            setup () {
                captured = useInstalledThemes()
                return () => h('div')
            }
        })
        mount(Host)
        expect(captured).toEqual([])
    })
})
