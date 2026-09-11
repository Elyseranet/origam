// Unit tests for <OrigamListItem> — typography props (the shared
// ITypographyProps surface wired by useTypography with two prefixes:
// 'list-item__title' and 'list-item__subtitle').
//
// OrigamListItem binds `titleTypographyStyles` and `subtitleTypographyStyles`
// directly on the plain <div class="origam-list-item__title"> and
// <div class="origam-list-item__subtitle"> elements as inline `:style`. These
// divs are only rendered when `props.title != null` / `props.subtitle != null`,
// so the mount helpers always pass both. The vars land in the DOM `style`
// attribute — assertions read `.find('.origam-list-item__title').attributes('style')`
// and `.find('.origam-list-item__subtitle').attributes('style')`.
//
// Both surfaces share a single ITypographyProps set:
// fontSize / fontWeight / lineHeight / letterSpacing all have a real visual
// effect (the SCSS reads each var at the root of both &__title and &__subtitle
// without any per-size suffix). fontFamily is not read → not exercised here.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamListItem from '@origam/components/List/OrigamListItem.vue'
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

function mountListItem (props: Record<string, unknown> = {}) {
    return mount(OrigamListItem, {
        props: {
            title: 'Primary text',
            subtitle: 'Secondary text',
            ...props
        } as never,
        global: { plugins: [createOrigam()] }
    })
}

function titleStyleOf (props: Record<string, unknown> = {}): string {
    return mountListItem(props).find('.origam-list-item__title').attributes('style') ?? ''
}

function subtitleStyleOf (props: Record<string, unknown> = {}): string {
    return mountListItem(props).find('.origam-list-item__subtitle').attributes('style') ?? ''
}

// ---------------------------------------------------------------------------
// fontSize — title surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — fontSize prop (title surface)', () => {
    it('emits no font-size override on the title when fontSize is unset', () => {
        expect(titleStyleOf()).not.toContain('--origam-list-item__title---font-size:')
    })

    it('fontSize="xl" sets the font-size var on the title to the xl token', () => {
        expect(titleStyleOf({ fontSize: 'xl' })).toContain(
            '--origam-list-item__title---font-size: var(--origam-font__size---xl)'
        )
    })

    it('fontSize="xs" sets the font-size var on the title to the xs token', () => {
        expect(titleStyleOf({ fontSize: 'xs' })).toContain(
            '--origam-list-item__title---font-size: var(--origam-font__size---xs)'
        )
    })
})

// ---------------------------------------------------------------------------
// fontSize — subtitle surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — fontSize prop (subtitle surface)', () => {
    it('emits no font-size override on the subtitle when fontSize is unset', () => {
        expect(subtitleStyleOf()).not.toContain('--origam-list-item__subtitle---font-size:')
    })

    it('fontSize="xl" sets the font-size var on the subtitle to the xl token', () => {
        expect(subtitleStyleOf({ fontSize: 'xl' })).toContain(
            '--origam-list-item__subtitle---font-size: var(--origam-font__size---xl)'
        )
    })

    it('fontSize="xs" sets the font-size var on the subtitle to the xs token', () => {
        expect(subtitleStyleOf({ fontSize: 'xs' })).toContain(
            '--origam-list-item__subtitle---font-size: var(--origam-font__size---xs)'
        )
    })
})

// ---------------------------------------------------------------------------
// fontWeight — title surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — fontWeight prop (title surface)', () => {
    it('emits no font-weight override on the title when fontWeight is unset', () => {
        expect(titleStyleOf()).not.toContain('--origam-list-item__title---font-weight:')
    })

    it('fontWeight="semibold" sets the font-weight var on the title to the semibold token', () => {
        expect(titleStyleOf({ fontWeight: 'semibold' })).toContain(
            '--origam-list-item__title---font-weight: var(--origam-font__weight---semibold)'
        )
    })

    it('fontWeight="bold" sets the font-weight var on the title to the bold token', () => {
        expect(titleStyleOf({ fontWeight: 'bold' })).toContain(
            '--origam-list-item__title---font-weight: var(--origam-font__weight---bold)'
        )
    })
})

// ---------------------------------------------------------------------------
// fontWeight — subtitle surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — fontWeight prop (subtitle surface)', () => {
    it('emits no font-weight override on the subtitle when fontWeight is unset', () => {
        expect(subtitleStyleOf()).not.toContain('--origam-list-item__subtitle---font-weight:')
    })

    it('fontWeight="semibold" sets the font-weight var on the subtitle to the semibold token', () => {
        expect(subtitleStyleOf({ fontWeight: 'semibold' })).toContain(
            '--origam-list-item__subtitle---font-weight: var(--origam-font__weight---semibold)'
        )
    })

    it('fontWeight="bold" sets the font-weight var on the subtitle to the bold token', () => {
        expect(subtitleStyleOf({ fontWeight: 'bold' })).toContain(
            '--origam-list-item__subtitle---font-weight: var(--origam-font__weight---bold)'
        )
    })
})

// ---------------------------------------------------------------------------
// lineHeight — title surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — lineHeight prop (title surface)', () => {
    it('emits no line-height override on the title when lineHeight is unset', () => {
        expect(titleStyleOf()).not.toContain('--origam-list-item__title---line-height:')
    })

    it('lineHeight="relaxed" sets the line-height var on the title to the relaxed token', () => {
        expect(titleStyleOf({ lineHeight: 'relaxed' })).toContain(
            '--origam-list-item__title---line-height: var(--origam-font__lineHeight---relaxed)'
        )
    })

    it('lineHeight="tight" sets the line-height var on the title to the tight token', () => {
        expect(titleStyleOf({ lineHeight: 'tight' })).toContain(
            '--origam-list-item__title---line-height: var(--origam-font__lineHeight---tight)'
        )
    })
})

// ---------------------------------------------------------------------------
// lineHeight — subtitle surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — lineHeight prop (subtitle surface)', () => {
    it('emits no line-height override on the subtitle when lineHeight is unset', () => {
        expect(subtitleStyleOf()).not.toContain('--origam-list-item__subtitle---line-height:')
    })

    it('lineHeight="relaxed" sets the line-height var on the subtitle to the relaxed token', () => {
        expect(subtitleStyleOf({ lineHeight: 'relaxed' })).toContain(
            '--origam-list-item__subtitle---line-height: var(--origam-font__lineHeight---relaxed)'
        )
    })

    it('lineHeight="tight" sets the line-height var on the subtitle to the tight token', () => {
        expect(subtitleStyleOf({ lineHeight: 'tight' })).toContain(
            '--origam-list-item__subtitle---line-height: var(--origam-font__lineHeight---tight)'
        )
    })
})

// ---------------------------------------------------------------------------
// letterSpacing — title surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — letterSpacing prop (title surface)', () => {
    it('emits no letter-spacing override on the title when letterSpacing is unset', () => {
        expect(titleStyleOf()).not.toContain('--origam-list-item__title---letter-spacing:')
    })

    it('letterSpacing="wide" sets the letter-spacing var on the title to the wide token', () => {
        expect(titleStyleOf({ letterSpacing: 'wide' })).toContain(
            '--origam-list-item__title---letter-spacing: var(--origam-font__letterSpacing---wide)'
        )
    })

    it('letterSpacing="tight" sets the letter-spacing var on the title to the tight token', () => {
        expect(titleStyleOf({ letterSpacing: 'tight' })).toContain(
            '--origam-list-item__title---letter-spacing: var(--origam-font__letterSpacing---tight)'
        )
    })
})

// ---------------------------------------------------------------------------
// letterSpacing — subtitle surface
// ---------------------------------------------------------------------------

describe('OrigamListItem — letterSpacing prop (subtitle surface)', () => {
    it('emits no letter-spacing override on the subtitle when letterSpacing is unset', () => {
        expect(subtitleStyleOf()).not.toContain('--origam-list-item__subtitle---letter-spacing:')
    })

    it('letterSpacing="wide" sets the letter-spacing var on the subtitle to the wide token', () => {
        expect(subtitleStyleOf({ letterSpacing: 'wide' })).toContain(
            '--origam-list-item__subtitle---letter-spacing: var(--origam-font__letterSpacing---wide)'
        )
    })

    it('letterSpacing="tight" sets the letter-spacing var on the subtitle to the tight token', () => {
        expect(subtitleStyleOf({ letterSpacing: 'tight' })).toContain(
            '--origam-list-item__subtitle---letter-spacing: var(--origam-font__letterSpacing---tight)'
        )
    })
})
