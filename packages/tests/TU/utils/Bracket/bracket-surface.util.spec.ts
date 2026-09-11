// TU — bracket-surface.util.ts
// Exports: resolveBracketSurface, resolveBracketForeground, resolveBracketRadius,
//          resolveBracketShadow, resolveBracketBorderWidth, resolveBracketBorderColor,
//          bracketDashArray, bracketSurfaceVars
//
// Pure geometry/CSS helpers — no DOM, no Vue. All branches covered by
// table-driven cases.

import { describe, expect, it } from 'vitest'
import {
    resolveBracketSurface,
    resolveBracketForeground,
    resolveBracketRadius,
    resolveBracketShadow,
    resolveBracketBorderWidth,
    resolveBracketBorderColor,
    bracketDashArray,
    bracketSurfaceVars
} from '@origam/utils/Bracket/bracket-surface.util'

// ------------------------------------------------------------------ //

describe('resolveBracketSurface', () => {
    it('returns null for null/undefined/empty', () => {
        expect(resolveBracketSurface(null)).toBeNull()
        expect(resolveBracketSurface(undefined)).toBeNull()
        expect(resolveBracketSurface('')).toBeNull()
    })

    it('returns "transparent" for "transparent"', () => {
        expect(resolveBracketSurface('transparent')).toBe('transparent')
    })

    it('returns the CSS color verbatim for a valid hex color', () => {
        expect(resolveBracketSurface('#ff0000')).toBe('#ff0000')
    })

    it('returns a CSS variable string for a known intent', () => {
        // An intent like 'primary' produces a var(--origam-…) string via tokenStylesForIntent
        const result = resolveBracketSurface('primary')
        expect(typeof result).toBe('string')
        expect(result).not.toBeNull()
    })

    it('returns null for an unknown non-color, non-intent string', () => {
        expect(resolveBracketSurface('not-a-color-or-intent')).toBeNull()
    })
})

describe('resolveBracketForeground', () => {
    it('returns null for null', () => {
        expect(resolveBracketForeground(null)).toBeNull()
    })

    it('returns "transparent" for "transparent"', () => {
        expect(resolveBracketForeground('transparent')).toBe('transparent')
    })

    it('returns the hex color verbatim for a valid CSS color', () => {
        expect(resolveBracketForeground('#aabbcc')).toBe('#aabbcc')
    })

    it('returns a CSS variable for a known intent', () => {
        const result = resolveBracketForeground('danger')
        expect(typeof result).toBe('string')
        expect(result).not.toBeNull()
    })
})

describe('resolveBracketRadius', () => {
    it.each([
        [null,    null],
        [false,   null],
        [undefined, null]
    ])('returns null for %p', (value, expected) => {
        expect(resolveBracketRadius(value)).toBe(expected)
    })

    it('returns the default md token for an empty string', () => {
        expect(resolveBracketRadius('')).toBe('var(--origam-radius---md)')
    })

    it('returns the default md token for true', () => {
        expect(resolveBracketRadius(true)).toBe('var(--origam-radius---md)')
    })

    it.each([
        ['none', 'var(--origam-radius---none)'],
        ['xs',   'var(--origam-radius---xs)'],
        ['sm',   'var(--origam-radius---sm)'],
        ['md',   'var(--origam-radius---md)'],
        ['lg',   'var(--origam-radius---lg)'],
        ['xl',   'var(--origam-radius---xl)'],
        ['full', 'var(--origam-radius---full)']
    ])('rung "%s" maps to token "%s"', (rung, expected) => {
        expect(resolveBracketRadius(rung)).toBe(expected)
    })

    it.each([
        ['x-small',  'var(--origam-radius---xs)'],
        ['small',    'var(--origam-radius---sm)'],
        ['default',  'var(--origam-radius---md)'],
        ['medium',   'var(--origam-radius---lg)'],
        ['large',    'var(--origam-radius---xl)'],
        ['x-large',  'var(--origam-radius---2xl)']
    ])('named variant "%s" maps to token "%s"', (name, expected) => {
        expect(resolveBracketRadius(name)).toBe(expected)
    })

    it('returns a px string for a numeric value', () => {
        expect(resolveBracketRadius(8)).toBe('8px')
    })

    it('returns a free-form multi-token string verbatim (contains spaces)', () => {
        expect(resolveBracketRadius('4px 8px 4px 8px')).toBe('4px 8px 4px 8px')
    })
})

describe('resolveBracketShadow', () => {
    it.each([
        [null,  null],
        [false, null],
        [undefined, null]
    ])('returns null for %p', (value, expected) => {
        expect(resolveBracketShadow(value)).toBe(expected)
    })

    it('returns the md shadow token for true', () => {
        expect(resolveBracketShadow(true)).toBe('var(--origam-shadow---md)')
    })

    it.each([
        [0,  'var(--origam-shadow---none)'],
        [-1, 'var(--origam-shadow---none)'],
        [1,  'var(--origam-shadow---xs)'],
        [2,  'var(--origam-shadow---xs)'],
        [3,  'var(--origam-shadow---sm)'],
        [4,  'var(--origam-shadow---sm)'],
        [5,  'var(--origam-shadow---md)'],
        [8,  'var(--origam-shadow---md)'],
        [9,  'var(--origam-shadow---lg)'],
        [16, 'var(--origam-shadow---lg)'],
        [17, 'var(--origam-shadow---xl)'],
        [99, 'var(--origam-shadow---xl)']
    ])('numeric elevation %p maps to shadow token %p', (value, expected) => {
        expect(resolveBracketShadow(value)).toBe(expected)
    })

    it.each([
        ['none', 'var(--origam-shadow---none)'],
        ['xs',   'var(--origam-shadow---xs)'],
        ['sm',   'var(--origam-shadow---sm)'],
        ['md',   'var(--origam-shadow---md)'],
        ['lg',   'var(--origam-shadow---lg)'],
        ['xl',   'var(--origam-shadow---xl)']
    ])('string rung "%s" maps to shadow token "%s"', (rung, expected) => {
        expect(resolveBracketShadow(rung)).toBe(expected)
    })

    it('returns a verbatim CSS string for an unknown string value', () => {
        expect(resolveBracketShadow('0 2px 4px rgba(0,0,0,0.2)')).toBe('0 2px 4px rgba(0,0,0,0.2)')
    })
})

describe('resolveBracketBorderWidth', () => {
    it.each([
        [null,  null],
        [false, null],
        [undefined, null]
    ])('returns null for %p', (value, expected) => {
        expect(resolveBracketBorderWidth(value)).toBe(expected)
    })

    it('returns thin token for true', () => {
        expect(resolveBracketBorderWidth(true)).toBe('var(--origam-border__width---thin)')
    })

    it('returns thin token for an empty string', () => {
        expect(resolveBracketBorderWidth('')).toBe('var(--origam-border__width---thin)')
    })

    it.each([
        ['none',  'var(--origam-border__width---0)'],
        ['thin',  'var(--origam-border__width---thin)'],
        ['thick', 'var(--origam-border__width---2)']
    ])('keyword "%s" maps to token "%s"', (keyword, expected) => {
        expect(resolveBracketBorderWidth(keyword)).toBe(expected)
    })

    it('returns a px string for a numeric value', () => {
        expect(resolveBracketBorderWidth(3)).toBe('3px')
    })
})

describe('resolveBracketBorderColor', () => {
    it('returns null for null/undefined/empty', () => {
        expect(resolveBracketBorderColor(null)).toBeNull()
        expect(resolveBracketBorderColor(undefined)).toBeNull()
        expect(resolveBracketBorderColor('')).toBeNull()
    })

    it('returns a CSS variable for a known intent', () => {
        const result = resolveBracketBorderColor('primary')
        expect(typeof result).toBe('string')
        expect(result).not.toBeNull()
    })

    it('returns the hex color verbatim', () => {
        expect(resolveBracketBorderColor('#123456')).toBe('#123456')
    })
})

describe('bracketDashArray', () => {
    it('returns empty object for null/undefined', () => {
        expect(bracketDashArray(null)).toEqual({})
        expect(bracketDashArray(undefined)).toEqual({})
    })

    it('returns empty object for "solid"', () => {
        expect(bracketDashArray('solid')).toEqual({})
    })

    it('returns dasharray for "dashed"', () => {
        expect(bracketDashArray('dashed')).toEqual({ dasharray: '8 5' })
    })

    it('returns dasharray + linecap for "dotted"', () => {
        expect(bracketDashArray('dotted')).toEqual({ dasharray: '1 5', linecap: 'round' })
    })
})

describe('bracketSurfaceVars', () => {
    it('returns an empty object when all inputs are falsy', () => {
        expect(bracketSurfaceVars({})).toEqual({})
    })

    it('sets background-color vars for a known bgColor intent', () => {
        const vars = bracketSurfaceVars({ bgColor: 'primary' })
        expect(vars['--origam-bracket-match---background-color']).toBeDefined()
        expect(vars['--origam-bracket-match--hover---background-color']).toBeDefined()
    })

    it('sets border-radius var for a rounded value', () => {
        const vars = bracketSurfaceVars({ rounded: 'md' })
        expect(vars['--origam-bracket-match---border-radius']).toBe('var(--origam-radius---md)')
    })

    it('sets box-shadow var for an elevation number', () => {
        const vars = bracketSurfaceVars({ elevation: 4 })
        expect(vars['--origam-bracket-match---box-shadow']).toBe('var(--origam-shadow---sm)')
    })

    it('sets border-width var for a border keyword', () => {
        const vars = bracketSurfaceVars({ border: 'thin' })
        expect(vars['--origam-bracket-match---border-width']).toBe('var(--origam-border__width---thin)')
    })

    it('sets border-style when provided', () => {
        const vars = bracketSurfaceVars({ borderStyle: 'dashed' })
        expect(vars['--origam-bracket-match---border-style']).toBe('dashed')
    })

    it('does NOT set border-style when borderStyle is not provided', () => {
        const vars = bracketSurfaceVars({ bgColor: '#ff0' })
        expect(vars['--origam-bracket-match---border-style']).toBeUndefined()
    })

    it('sets border-color var for a valid color', () => {
        const vars = bracketSurfaceVars({ borderColor: '#abc' })
        expect(vars['--origam-bracket-match---border-color']).toBe('#abc')
    })

    it('assembles all vars when all inputs are provided', () => {
        const vars = bracketSurfaceVars({
            bgColor: '#ffffff',
            rounded: true,
            elevation: 2,
            border: true,
            borderColor: '#000000',
            borderStyle: 'solid'
        })
        expect(Object.keys(vars).length).toBeGreaterThanOrEqual(4)
    })
})
