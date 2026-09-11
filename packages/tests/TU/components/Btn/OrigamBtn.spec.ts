// Unit tests for <OrigamBtn> — typography props (the shared ITypographyProps
// surface wired by useTypography with the 'btn' varPrefix).
//
// Btn applies its computed styles through `useStyle(btnStyles)`, which injects
// a scoped `<style>` element rather than an inline `style=""` attribute. The
// generated CSS string is exposed on the instance as `css`, so the assertions
// read `wrapper.vm.css` instead of the element's style attribute.
//
// Btn's SCSS reads `--origam-btn---font-size / font-weight / letter-spacing /
// line-height`, so fontSize / fontWeight / letterSpacing / lineHeight each have
// a real visual effect. `fontFamily` emits its var too but Btn has no
// `font-family` SCSS rule, so it is intentionally not exercised here (and not
// exposed as a story control) — see the rollout recipe in
// `typography.composable.ts`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
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

function mountBtn (props: Record<string, unknown> = {}) {
    return mount(OrigamBtn, {
        props: { text: 'Button', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

function cssOf (props: Record<string, unknown> = {}): string {
    return (mountBtn(props).vm as unknown as { css: string }).css || ''
}

describe('OrigamBtn — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        expect(cssOf()).not.toContain('--origam-btn---font-size:')
    })

    it('fontSize="xl" sets the font-size var to the xl token', () => {
        expect(cssOf({ fontSize: 'xl' })).toContain('--origam-btn---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="xs" sets the font-size var to the xs token', () => {
        expect(cssOf({ fontSize: 'xs' })).toContain('--origam-btn---font-size: var(--origam-font__size---xs)')
    })
})

describe('OrigamBtn — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        expect(cssOf()).not.toContain('--origam-btn---font-weight:')
    })

    it('fontWeight="bold" sets the font-weight var to the bold token (700)', () => {
        expect(cssOf({ fontWeight: 'bold' })).toContain('--origam-btn---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="black" sets the font-weight var to the black token (900)', () => {
        expect(cssOf({ fontWeight: 'black' })).toContain('--origam-btn---font-weight: var(--origam-font__weight---black)')
    })
})

describe('OrigamBtn — lineHeight prop', () => {
    it('emits no line-height override when lineHeight is unset', () => {
        expect(cssOf()).not.toContain('--origam-btn---line-height:')
    })

    it('lineHeight="loose" sets the line-height var to the loose token', () => {
        expect(cssOf({ lineHeight: 'loose' })).toContain('--origam-btn---line-height: var(--origam-font__lineHeight---loose)')
    })
})

describe('OrigamBtn — letterSpacing prop', () => {
    it('emits no letter-spacing override when letterSpacing is unset', () => {
        expect(cssOf()).not.toContain('--origam-btn---letter-spacing:')
    })

    it('letterSpacing="widest" sets the letter-spacing var to the widest token', () => {
        expect(cssOf({ letterSpacing: 'widest' })).toContain('--origam-btn---letter-spacing: var(--origam-font__letterSpacing---widest)')
    })
})
