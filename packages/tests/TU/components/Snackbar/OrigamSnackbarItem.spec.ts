// Unit tests for <OrigamSnackbarItem> — typography props surface (ITypographyProps).
//
// OrigamSnackbarItem is a plain component (no Teleport, no useStyle injection).
// typographyStyles are bound as an inline `:style` attribute on the root element,
// so assertions read wrapper.find('.origam-snackbar-item').attributes('style').
// This is the same pattern as OrigamTooltip.spec.ts (inline style via BEM surface).
//
// SCSS audit result — only ONE prop has a real visual effect:
//   fontSize → --origam-snackbar-item---font-size (read at root level, default 0.875rem)
//
// fontWeight, lineHeight, letterSpacing each emit their CSS var via ITypographyProps
// but the root SCSS has no corresponding rule:
//   - fontWeight  → scoped to __title (600) and __message (400) with their own
//                   namespaced vars; a single useTypography('snackbar-item') cannot
//                   address those sub-surfaces.
//   - lineHeight  → root uses hardcoded `line-height: 1.4`, not a CSS var.
//   - letterSpacing → no SCSS rule on the item.
// These props are typed and emit their var but are not exercised in this spec —
// see the rollout recipe in `typography.composable.ts`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSnackbarItem from '@origam/components/Snackbar/OrigamSnackbarItem.vue'
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

function mountItem (props: Record<string, unknown> = {}) {
    return mount(OrigamSnackbarItem, {
        props: { message: 'Test notification', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

// ---------------------------------------------------------------------------
// fontSize
// ---------------------------------------------------------------------------
describe('OrigamSnackbarItem — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        const wrapper = mountItem()
        const style = wrapper.find('.origam-snackbar-item').attributes('style') || ''
        expect(style).not.toContain('--origam-snackbar-item---font-size')
        wrapper.unmount()
    })

    it('fontSize="xl" sets --origam-snackbar-item---font-size to the xl token', () => {
        const wrapper = mountItem({ fontSize: 'xl' })
        const style = wrapper.find('.origam-snackbar-item').attributes('style') || ''
        expect(style).toContain('--origam-snackbar-item---font-size: var(--origam-font__size---xl)')
        wrapper.unmount()
    })

    it('fontSize="sm" sets --origam-snackbar-item---font-size to the sm token', () => {
        const wrapper = mountItem({ fontSize: 'sm' })
        const style = wrapper.find('.origam-snackbar-item').attributes('style') || ''
        expect(style).toContain('--origam-snackbar-item---font-size: var(--origam-font__size---sm)')
        wrapper.unmount()
    })
})
