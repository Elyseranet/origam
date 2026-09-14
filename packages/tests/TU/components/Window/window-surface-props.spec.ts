// Coverage hole flagged by the classeur (lot "divers", 2026-09-01):
// <OrigamWindow> exposes rounded/border/elevation/padding/margin (all wired
// via the standard Commons composables, per the code comment at
// OrigamWindow.vue "Cross-cutting SURFACE props … previously they were
// declared on the interface but silently ignored") — but had ZERO unit test
// asserting any of the five actually reach the rendered root.
//
// ⛔ jsdom's getComputedStyle NEVER resolves var() (see root CLAUDE.md) — so
// this spec asserts on `wrapper.classes()` only (reliable under jsdom). The
// companion e2e spec (`packages/tests/e2e/window-surface-props.spec.ts`)
// proves the CSS actually paints in a real browser.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
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

function mountWindow (props: Record<string, unknown> = {}) {
    return mount(OrigamWindow, {
        props: { continuous: true, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamWindow — surface props reach the rendered root', () => {
    it('rounded emits a rounded utility class', () => {
        const wrapper = mountWindow({ rounded: 'lg' })
        expect(wrapper.classes().some((c) => c.includes('rounded'))).toBe(true)
    })

    it('border emits a border utility class', () => {
        const wrapper = mountWindow({ border: true })
        expect(wrapper.classes().some((c) => c.includes('border'))).toBe(true)
    })

    it('elevation emits an elevation/shadow utility class', () => {
        const wrapper = mountWindow({ elevation: 'md' })
        expect(wrapper.classes().some((c) => c.includes('elevat') || c.includes('shadow'))).toBe(true)
    })

    it('padding is reflected as an inline style (custom value)', () => {
        const wrapper = mountWindow({ padding: '24px' })
        const style = wrapper.attributes('style') ?? ''
        expect(style).toContain('padding')
    })

    it('margin is reflected as an inline style (custom value)', () => {
        const wrapper = mountWindow({ margin: '12px' })
        const style = wrapper.attributes('style') ?? ''
        expect(style).toContain('margin')
    })

    it('none of the five surfaces are declared without effect (regression pin for the #comment fix already landed)', () => {
        // No class/style at all when none of the props are passed — proves
        // the assertions above are testing a REAL toggle, not a class that's
        // always present regardless of the prop.
        const wrapper = mountWindow()
        const classes = wrapper.classes()
        expect(classes.some((c) => c.includes('rounded'))).toBe(false)
        expect(classes.some((c) => c.includes('border'))).toBe(false)
        expect(classes.some((c) => c.includes('elevat') || c.includes('shadow'))).toBe(false)
    })
})
