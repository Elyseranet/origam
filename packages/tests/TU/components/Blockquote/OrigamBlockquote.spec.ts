// Unit tests for <OrigamBlockquote> — typography props (the shared ITypographyProps
// surface wired by useTypography with the 'blockquote' varPrefix).
//
// Blockquote binds its computed styles directly via a :style array on the root
// element — no useStyle() intermediary. Typography vars therefore land in the
// element's inline style="" attribute, so assertions read `.attributes('style')`.
//
// Props with a real visual effect (SCSS reads the generated var via the
// --origam-blockquote---resolved-* fallback chain): fontFamily, fontSize,
// fontWeight, lineHeight. letterSpacing is NOT exposed — the component SCSS
// has no letter-spacing rule for the blockquote — see the rollout recipe in
// typography.composable.ts.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamBlockquote } from '@origam/components'
import { createOrigam } from '@origam/origam'

function mountBq (props: Record<string, unknown> = {}) {
    return mount(OrigamBlockquote, {
        props: props as never,
        slots: { default: () => 'Talk is cheap.' },
        global: { plugins: [createOrigam()] }
    })
}

function styleOf (props: Record<string, unknown> = {}): string {
    return mountBq(props).find('.origam-blockquote').attributes('style') ?? ''
}

describe('OrigamBlockquote — fontFamily prop', () => {
    it('emits no font-family override when fontFamily is unset', () => {
        expect(styleOf()).not.toContain('--origam-blockquote---font-family:')
    })

    it('fontFamily="mono" sets the font-family var to the mono token', () => {
        expect(styleOf({ fontFamily: 'mono' })).toContain('--origam-blockquote---font-family: var(--origam-font__family---mono)')
    })

    it('fontFamily="serif" sets the font-family var to the serif token', () => {
        expect(styleOf({ fontFamily: 'serif' })).toContain('--origam-blockquote---font-family: var(--origam-font__family---serif)')
    })
})

describe('OrigamBlockquote — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        expect(styleOf()).not.toContain('--origam-blockquote---font-size:')
    })

    it('fontSize="xl" sets the font-size var to the xl token', () => {
        expect(styleOf({ fontSize: 'xl' })).toContain('--origam-blockquote---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="sm" sets the font-size var to the sm token', () => {
        expect(styleOf({ fontSize: 'sm' })).toContain('--origam-blockquote---font-size: var(--origam-font__size---sm)')
    })
})

describe('OrigamBlockquote — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        expect(styleOf()).not.toContain('--origam-blockquote---font-weight:')
    })

    it('fontWeight="bold" sets the font-weight var to the bold token', () => {
        expect(styleOf({ fontWeight: 'bold' })).toContain('--origam-blockquote---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="semibold" sets the font-weight var to the semibold token', () => {
        expect(styleOf({ fontWeight: 'semibold' })).toContain('--origam-blockquote---font-weight: var(--origam-font__weight---semibold)')
    })
})

describe('OrigamBlockquote — lineHeight prop', () => {
    it('emits no line-height override when lineHeight is unset', () => {
        expect(styleOf()).not.toContain('--origam-blockquote---line-height:')
    })

    it('lineHeight="loose" sets the line-height var to the loose token', () => {
        expect(styleOf({ lineHeight: 'loose' })).toContain('--origam-blockquote---line-height: var(--origam-font__lineHeight---loose)')
    })

    it('lineHeight="tight" sets the line-height var to the tight token', () => {
        expect(styleOf({ lineHeight: 'tight' })).toContain('--origam-blockquote---line-height: var(--origam-font__lineHeight---tight)')
    })
})
