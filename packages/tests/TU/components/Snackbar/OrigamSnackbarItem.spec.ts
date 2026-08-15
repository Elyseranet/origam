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

// ---------------------------------------------------------------------------
// BUG 2 regression — `icon` is `TIcon | false`, a union whose runtime prop
// type includes `Boolean`. Vue resolves an UNSET prop of that shape to the
// concrete value `false` (never `undefined`), so a naive
// `props.icon === false` check always short-circuited — every instance that
// never touched `icon` silently lost its whole prepend zone, including any
// custom `#prepend` slot. Fixed via `usePassedProps()` (distinguishes
// "explicitly passed `false`" from "not passed") plus decoupling the
// prepend `v-if` from `resolvedIcon` so a custom slot renders on its own
// merits.
// ---------------------------------------------------------------------------
describe('OrigamSnackbarItem — icon / prepend (BUG 2 regression)', () => {
    it('renders the per-intent default icon when icon is left unset', () => {
        const wrapper = mountItem({ intent: 'success' })
        const prepend = wrapper.find('.origam-snackbar-item__prepend')
        expect(prepend.exists()).toBe(true)
        expect(prepend.find('.origam-icon').exists()).toBe(true)
        wrapper.unmount()
    })

    it('suppresses the prepend zone when icon is explicitly passed as false', () => {
        const wrapper = mountItem({ icon: false })
        expect(wrapper.find('.origam-snackbar-item__prepend').exists()).toBe(false)
        wrapper.unmount()
    })

    it('renders a custom #prepend slot even though icon was never passed (default resolves truthy)', () => {
        const wrapper = mount(OrigamSnackbarItem, {
            props: { message: 'Test notification' } as never,
            global: { plugins: [createOrigam()] },
            slots: { prepend: '<span data-cy="custom-prepend">♥</span>' }
        })
        const prepend = wrapper.find('.origam-snackbar-item__prepend')
        expect(prepend.exists()).toBe(true)
        expect(wrapper.find('[data-cy="custom-prepend"]').exists()).toBe(true)
        // The slot content wins over the built-in <origam-icon> fallback.
        expect(prepend.find('.origam-icon').exists()).toBe(false)
        wrapper.unmount()
    })

    it('renders a custom #prepend slot even when icon is explicitly false (slot is not gated by icon)', () => {
        const wrapper = mount(OrigamSnackbarItem, {
            props: { message: 'Test notification', icon: false } as never,
            global: { plugins: [createOrigam()] },
            slots: { prepend: '<span data-cy="custom-prepend">♥</span>' }
        })
        expect(wrapper.find('.origam-snackbar-item__prepend').exists()).toBe(true)
        expect(wrapper.find('[data-cy="custom-prepend"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('respects an explicit icon override', () => {
        const wrapper = mountItem({ icon: 'mdi-heart' })
        const icon = wrapper.find('.origam-snackbar-item__prepend .origam-icon')
        expect(icon.exists()).toBe(true)
        expect(icon.classes()).toContain('mdi-heart')
        wrapper.unmount()
    })
})
