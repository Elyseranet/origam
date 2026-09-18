// #819 — `OrigamAvatar` derives its foreground from an intent `bgColor`
// instead of trusting a fixed/legacy `color` verbatim.
//
// Root cause (measured in browser, see #819 PR description): brand themes
// commonly pin `origam-avatar`'s `color` to ONE token (e.g.
// `action--primary---fgSubtle`), but `bgColor` is the one prop Avatar
// consumers routinely vary PER INSTANCE. `useStateEffect`'s existing
// "color-clash" swap only engages when BOTH `color` and `bgColor` are the
// SAME recognised intent — it left a fixed literal/legacy `color` untouched
// against a DIFFERENT intent `bgColor`, which is exactly the shape that
// measured 1.25:1-1.86:1 in the browser (invisible text).
//
// These assertions read the literal CSS text `useStyle` injects (`wrapper.
// vm.css`, same pattern as OrigamAvatar.spec.ts) — no `var()` resolution
// involved, so this is safe under jsdom (see CLAUDE.md, §jsdom/#398): we are
// asserting on the STRING the component computes, not on a resolved colour.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamAvatar from '@origam/components/Avatar/OrigamAvatar.vue'
import { createOrigam } from '@origam/origam'

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

function cssOf (props: Record<string, unknown> = {}): string {
    const wrapper = mount(OrigamAvatar, {
        props: { text: 'AP', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
    return (wrapper.vm as unknown as { css: string }).css || ''
}

describe('OrigamAvatar — #819 foreground derives from an intent bgColor', () => {
    it('a fixed legacy `color` is OVERRIDDEN by the bgColor intent\'s own audited pairing', () => {
        const css = cssOf({ bgColor: 'primary', color: 'var(--origam-color__action--secondary---fgSubtle)' })
        expect(css).toContain('color: var(--origam-color__action--primary---fg)')
        expect(css).not.toContain('color: var(--origam-color__action--secondary---fgSubtle)')
    })

    it('a fixed hex `color` is OVERRIDDEN the same way (any custom fg, not only var())', () => {
        const css = cssOf({ bgColor: 'warning', color: '#eaddff' })
        expect(css).toContain('color: var(--origam-color__feedback--warning---fg)')
        expect(css).not.toContain('color: #eaddff')
    })

    it('two DELIBERATE intents (color also a recognised intent) are left to useStateEffect, untouched', () => {
        const css = cssOf({ bgColor: 'ghost', color: 'primary' })
        // useStateEffect's own resolution for a non-clashing two-intent combo
        // (tokenForegroundForIntent, NOT tokenStylesForIntent — a different
        // rung, see color.util.ts) — not this fix's concern, just confirming
        // the guard does not fire and useStateEffect's own value survives.
        expect(css).toContain('color: var(--origam-color__action--primary---fgSubtle)')
    })

    it('no explicit `color`: recomputes the IDENTICAL token useStateEffect already falls back to (no-op)', () => {
        const withOverride = cssOf({ bgColor: 'success' })
        const bare = cssOf({ bgColor: 'success' })
        expect(withOverride).toBe(bare)
        expect(withOverride).toContain('color: var(--origam-color__feedback--success---fg)')
    })

    it('`bgColor="ghost"` is EXCLUDED — its bg role is transparent, not a themed fill, and overriding it would swap the fixed literal for a WORSE pairing on at least one shipped theme (measured: ecom/light ghost 5.93:1 -> 4.43:1)', () => {
        const css = cssOf({ bgColor: 'ghost', color: 'var(--origam-color__action--primary---fgSubtle)' })
        expect(css).toContain('color: var(--origam-color__action--primary---fgSubtle)')
    })

    it('a CUSTOM (non-intent) bgColor is left untouched — no audited pairing exists to derive from', () => {
        const css = cssOf({ bgColor: '#123456', color: '#eaddff' })
        expect(css).toContain('color: #eaddff')
    })
})
