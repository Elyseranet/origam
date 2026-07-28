// Unit tests for <OrigamLabel> — typography props (the shared ITypographyProps
// surface wired by useTypography with the 'label' varPrefix).
//
// Label binds `:style="labelStyles"` directly on its root element, so assertions
// read the inline `style=""` attribute — same pattern as OrigamTitle.spec.ts.
//
// Label's SCSS reads `--origam-label---font-size / font-weight / line-height /
// letter-spacing`, so fontSize / fontWeight / lineHeight / letterSpacing each have
// a real visual effect. fontFamily emits its var too but Label SCSS has no
// font-family rule — no visual effect; it is intentionally not exercised here.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamLabel from '@origam/components/Label/OrigamLabel.vue'
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

function mountLabel (props: Record<string, unknown> = {}) {
    return mount(OrigamLabel, {
        props: { text: 'Label', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

function styleOf (props: Record<string, unknown> = {}): string {
    return mountLabel(props).find('.origam-label').attributes('style') || ''
}

// Regression guard for #250: the root `<component :is="…">` used to read a
// bare `tag` in `<script setup>`, which resolves against Vue's raw $props —
// NOT the `useDefaults()` Proxy assigned to the local `props` variable —
// unless written as `props.tag` explicitly. See OrigamTable.vue / #249 for
// the full writeup of this footgun.
describe('OrigamLabel — useDefaults (theme components wiring)', () => {
    function mountLabelThemed (componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
        const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-label': componentDefaults }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
        return mount(OrigamLabel, { props: { text: 'Label', ...props } as never, global: { plugins: [origam] } })
    }

    it('resolves tag="span" from theme.components[\'origam-label\'] when not passed', () => {
        const wrapper = mountLabelThemed({ tag: 'span' })
        expect(wrapper.element.tagName).toBe('SPAN')
    })
})

describe('OrigamLabel — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        expect(styleOf()).not.toContain('--origam-label---font-size')
    })

    it('fontSize="xl" sets the font-size var to the xl token', () => {
        expect(styleOf({ fontSize: 'xl' })).toContain('--origam-label---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="xs" sets the font-size var to the xs token', () => {
        expect(styleOf({ fontSize: 'xs' })).toContain('--origam-label---font-size: var(--origam-font__size---xs)')
    })
})

describe('OrigamLabel — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        expect(styleOf()).not.toContain('--origam-label---font-weight')
    })

    it('fontWeight="bold" sets the font-weight var to the bold token', () => {
        expect(styleOf({ fontWeight: 'bold' })).toContain('--origam-label---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="semibold" sets the font-weight var to the semibold token', () => {
        expect(styleOf({ fontWeight: 'semibold' })).toContain('--origam-label---font-weight: var(--origam-font__weight---semibold)')
    })
})

describe('OrigamLabel — lineHeight prop', () => {
    it('emits no line-height override when lineHeight is unset', () => {
        expect(styleOf()).not.toContain('--origam-label---line-height')
    })

    it('lineHeight="relaxed" sets the line-height var to the relaxed token', () => {
        expect(styleOf({ lineHeight: 'relaxed' })).toContain('--origam-label---line-height: var(--origam-font__lineHeight---relaxed)')
    })

    it('lineHeight="tight" sets the line-height var to the tight token', () => {
        expect(styleOf({ lineHeight: 'tight' })).toContain('--origam-label---line-height: var(--origam-font__lineHeight---tight)')
    })
})

describe('OrigamLabel — letterSpacing prop', () => {
    it('emits no letter-spacing override when letterSpacing is unset', () => {
        expect(styleOf()).not.toContain('--origam-label---letter-spacing')
    })

    it('letterSpacing="widest" sets the letter-spacing var to the widest token', () => {
        expect(styleOf({ letterSpacing: 'widest' })).toContain('--origam-label---letter-spacing: var(--origam-font__letterSpacing---widest)')
    })

    it('letterSpacing="wide" sets the letter-spacing var to the wide token', () => {
        expect(styleOf({ letterSpacing: 'wide' })).toContain('--origam-label---letter-spacing: var(--origam-font__letterSpacing---wide)')
    })
})
