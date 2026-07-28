// Unit tests for <OrigamAvatar> — typography props (the shared ITypographyProps
// surface wired by useTypography with the 'avatar' varPrefix).
//
// Avatar applies its computed styles through `useStyle(avatarStyles)`, which
// injects a scoped `<style>` element. The generated CSS string is exposed on
// the instance as `css`, so the assertions read `wrapper.vm.css` instead of
// the element's style attribute (same pattern as OrigamBtn.spec.ts).
//
// Avatar's SCSS reads `--origam-avatar---font-size / font-weight / letter-spacing
// / line-height` on the root element (the four properties that affect the
// initials / text mode). `fontFamily` is part of ITypographyProps but Avatar
// has no `font-family` SCSS rule, so it is intentionally not exercised here
// and not exposed as a story control — see the rollout recipe in
// `typography.composable.ts`.
//
// The avatar is mounted in text mode (text="AP") so the initials surface is
// active — font variables are only meaningful when text is present.

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

function mountAvatar (props: Record<string, unknown> = {}) {
    return mount(OrigamAvatar, {
        props: { text: 'AP', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

function cssOf (props: Record<string, unknown> = {}): string {
    return (mountAvatar(props).vm as unknown as { css: string }).css || ''
}

describe('OrigamAvatar — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        expect(cssOf()).not.toContain('--origam-avatar---font-size:')
    })

    it('fontSize="xl" sets the font-size var to the xl token', () => {
        expect(cssOf({ fontSize: 'xl' })).toContain('--origam-avatar---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="xs" sets the font-size var to the xs token', () => {
        expect(cssOf({ fontSize: 'xs' })).toContain('--origam-avatar---font-size: var(--origam-font__size---xs)')
    })
})

describe('OrigamAvatar — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        expect(cssOf()).not.toContain('--origam-avatar---font-weight:')
    })

    it('fontWeight="bold" sets the font-weight var to the bold token (700)', () => {
        expect(cssOf({ fontWeight: 'bold' })).toContain('--origam-avatar---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="black" sets the font-weight var to the black token (900)', () => {
        expect(cssOf({ fontWeight: 'black' })).toContain('--origam-avatar---font-weight: var(--origam-font__weight---black)')
    })
})

describe('OrigamAvatar — lineHeight prop', () => {
    it('emits no line-height override when lineHeight is unset', () => {
        expect(cssOf()).not.toContain('--origam-avatar---line-height:')
    })

    it('lineHeight="loose" sets the line-height var to the loose token', () => {
        expect(cssOf({ lineHeight: 'loose' })).toContain('--origam-avatar---line-height: var(--origam-font__lineHeight---loose)')
    })
})

describe('OrigamAvatar — letterSpacing prop', () => {
    it('emits no letter-spacing override when letterSpacing is unset', () => {
        expect(cssOf()).not.toContain('--origam-avatar---letter-spacing:')
    })

    it('letterSpacing="widest" sets the letter-spacing var to the widest token', () => {
        expect(cssOf({ letterSpacing: 'widest' })).toContain('--origam-avatar---letter-spacing: var(--origam-font__letterSpacing---widest)')
    })
})

// Regression guard for #250: the root `<component :is="…">` used to read a
// bare `tag` in `<script setup>`, which resolves against Vue's raw $props —
// NOT the `useDefaults()` Proxy assigned to the local `props` variable —
// unless written as `props.tag` explicitly. See OrigamTable.vue / #249 for
// the full writeup of this footgun.
describe('OrigamAvatar — useDefaults (theme components wiring)', () => {
    function mountAvatarThemed (componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
        const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-avatar': componentDefaults }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
        return mount(OrigamAvatar, { props: { text: 'AP', ...props } as never, global: { plugins: [origam] } })
    }

    it('resolves tag="span" from theme.components[\'origam-avatar\'] when not passed', () => {
        const wrapper = mountAvatarThemed({ tag: 'span' })
        expect(wrapper.element.tagName).toBe('SPAN')
    })
})
