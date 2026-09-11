/**
 * color.spec.ts — Vitest unit tests for color.ts.
 *
 * Runs outside the Figma sandbox (pure functions, no Figma API).
 */
import { describe, expect, it } from 'vitest'

import {
  hexToRgb,
  hexToRgba,
  parseCssColor,
  rgbToHex,
  rgbaToHex,
} from './color.js'

const FLOAT_TOLERANCE = 0.005 // ± 0.5 % precision for 8-bit channel rounding

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------

describe('hexToRgb', () => {
  it('converts #000000 to {r:0, g:0, b:0}', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts #ffffff (mixed case) to {r:1, g:1, b:1}', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 1, g: 1, b: 1 })
  })

  it('converts #FFFFFF to {r:1, g:1, b:1}', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 1, g: 1, b: 1 })
  })

  it('converts shorthand #FFF to {r:1, g:1, b:1}', () => {
    expect(hexToRgb('#FFF')).toEqual({ r: 1, g: 1, b: 1 })
  })

  it('discards alpha from 8-char hex', () => {
    const result = hexToRgb('#80808080')
    expect(result.r).toBeCloseTo(0x80 / 255, 3)
    expect(result.g).toBeCloseTo(0x80 / 255, 3)
    expect(result.b).toBeCloseTo(0x80 / 255, 3)
    expect(Object.keys(result)).not.toContain('a')
  })

  it('throws on missing # prefix', () => {
    expect(() => hexToRgb('FF0000')).toThrow()
  })

  it('throws on invalid hex digits', () => {
    expect(() => hexToRgb('#GGGGGG')).toThrow()
  })

  it('throws on empty string', () => {
    expect(() => hexToRgb('')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// hexToRgba
// ---------------------------------------------------------------------------

describe('hexToRgba', () => {
  it('converts #000000 to {r:0, g:0, b:0, a:1}', () => {
    expect(hexToRgba('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
  })

  it('converts #ffffff to {r:1, g:1, b:1, a:1}', () => {
    expect(hexToRgba('#ffffff')).toEqual({ r: 1, g: 1, b: 1, a: 1 })
  })

  it('converts #80808080 with floating-point tolerance', () => {
    const result = hexToRgba('#80808080')
    const expected = 0x80 / 255
    expect(result.r).toBeCloseTo(expected, 3)
    expect(result.g).toBeCloseTo(expected, 3)
    expect(result.b).toBeCloseTo(expected, 3)
    expect(result.a).toBeCloseTo(expected, 3)
    // Sanity: value is near 0.502
    expect(Math.abs(result.r - 0.502)).toBeLessThan(FLOAT_TOLERANCE)
  })

  it('defaults alpha to 1 for 6-char hex', () => {
    const result = hexToRgba('#808080')
    expect(result.a).toBe(1)
  })

  it('handles shorthand #RGBA', () => {
    const result = hexToRgba('#0000')
    expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 })
  })

  it('throws on invalid input', () => {
    expect(() => hexToRgba('not-a-color')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// rgbToHex
// ---------------------------------------------------------------------------

describe('rgbToHex', () => {
  it('converts {r:0, g:0, b:0} to #000000', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('converts {r:1, g:1, b:1} to #FFFFFF', () => {
    expect(rgbToHex({ r: 1, g: 1, b: 1 })).toBe('#FFFFFF')
  })

  it('round-trips #FF5733', () => {
    const hex = '#FF5733'
    expect(rgbToHex(hexToRgb(hex))).toBe(hex)
  })

  it('clamps values above 1', () => {
    expect(rgbToHex({ r: 2, g: 2, b: 2 })).toBe('#FFFFFF')
  })

  it('clamps values below 0', () => {
    expect(rgbToHex({ r: -1, g: -1, b: -1 })).toBe('#000000')
  })
})

// ---------------------------------------------------------------------------
// rgbaToHex
// ---------------------------------------------------------------------------

describe('rgbaToHex', () => {
  it('returns #RRGGBB when alpha is 1', () => {
    expect(rgbaToHex({ r: 1, g: 1, b: 1, a: 1 })).toBe('#FFFFFF')
  })

  it('returns #RRGGBBAA when alpha < 1', () => {
    const result = rgbaToHex({ r: 0, g: 0, b: 0, a: 0 })
    expect(result).toBe('#00000000')
  })

  it('round-trips #80808080 within 1 LSB', () => {
    const original = '#80808080'
    const rgba = hexToRgba(original)
    const result = rgbaToHex(rgba)
    // Allow ±1 in the last byte due to float rounding (128/255 ≈ 0.5019…)
    expect(result.slice(0, 7)).toBe('#808080')
    const alphaByte = parseInt(result.slice(7, 9), 16)
    expect(Math.abs(alphaByte - 0x80)).toBeLessThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// parseCssColor
// ---------------------------------------------------------------------------

describe('parseCssColor', () => {
  it('parses hex strings', () => {
    expect(parseCssColor('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
  })

  it('parses rgb()', () => {
    const result = parseCssColor('rgb(0, 0, 0)')
    expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 })
  })

  it('parses rgba()', () => {
    const result = parseCssColor('rgba(255, 255, 255, 0.5)')
    expect(result.r).toBeCloseTo(1, 3)
    expect(result.g).toBeCloseTo(1, 3)
    expect(result.b).toBeCloseTo(1, 3)
    expect(result.a).toBeCloseTo(0.5, 3)
  })

  it('parses rgba(0,0,0,0) without spaces', () => {
    const result = parseCssColor('rgba(0,0,0,0)')
    expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 })
  })

  it('throws on hsl (unsupported format)', () => {
    expect(() => parseCssColor('hsl(0, 0%, 0%)')).toThrow()
  })

  it('throws on empty string', () => {
    expect(() => parseCssColor('')).toThrow()
  })
})
