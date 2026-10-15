// #1103 — SSR theme for a page whose colour mode is NOT pinned.

import { describe, expect, it } from 'vitest'

import { isModePinned, themeToUnpinnedCss } from '@origam/utils/Commons/apply-theme.util'

describe('isModePinned', () => {
    it('is pinned by a light/dark cookie or a light/dark default', () => {
        expect(isModePinned('dark', 'auto')).toBe(true)
        expect(isModePinned(null, 'light')).toBe(true)
    })

    it('is NOT pinned by auto / absent / junk values', () => {
        expect(isModePinned(null, 'auto')).toBe(false)
        expect(isModePinned('auto', 'auto')).toBe(false)
        expect(isModePinned('x', undefined)).toBe(false)
    })
})

describe('themeToUnpinnedCss', () => {
    const vars = { cssVars: { '--origam-x': '1' } }

    it('returns an empty string for a mode-agnostic theme', () => {
        expect(themeToUnpinnedCss({ name: 'b', ...vars })).toBe('')
    })

    it('wraps a named dark block in @media dark, root-only, under :not([data-mode])', () => {
        const css = themeToUnpinnedCss({ name: 'b', mode: 'dark', ...vars })
        expect(css).toContain('@media (prefers-color-scheme: dark)')
        expect(css).toContain(':root:root[data-theme="b"]:not([data-mode])')
        // root-only: no sub-tree form
        expect(css.match(/\[data-theme="b"\]/g)).toHaveLength(1)
        expect(css).toContain('--origam-x: 1;')
    })

    it('wraps a named light block in @media not dark', () => {
        const css = themeToUnpinnedCss({ name: 'b', mode: 'light', ...vars })
        expect(css).toContain('@media not (prefers-color-scheme: dark)')
    })

    it('anchors an unnamed block on html with no data-theme and no data-mode', () => {
        const css = themeToUnpinnedCss({ mode: 'dark', ...vars })
        expect(css).toContain('html:not([data-theme]):not([data-mode])')
    })
})
