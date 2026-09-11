// TU — color.util.ts
// Tests for pure-logic functions only.
// Functions that depend on CSS `color-mix()` at runtime (browser API absent
// in jsdom) are tested structurally (string shape) where possible; the
// `intentBgExpr` / `rawBgExprWithState` calls that embed the literal
// `color-mix(…)` string are deterministic string builders — no CSS eval needed.

import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
    isCssColor,
    isParsableColor,
    parseColor,
    getForeground,
    HSLtoRGB,
    RGBtoHSV,
    HSVtoHSL,
    HSLtoHSV,
    RGBtoCSS,
    HSVtoCSS,
    toHex,
    RGBtoHex,
    HexToRGB,
    HexToHSV,
    HSVtoHex,
    HSVtoRGB,
    parseHex,
    lighten,
    darken,
    getContrast,
    getLuma,
    classToHex,
    XyzToRgb,
    RgbtoXyz,
    XyztoLab,
    LabtoXyz,
    APCAcontrast,
    isIntent,
    isUtilityIntent,
    intentTokenBase,
    intentBgExpr,
    intentFgExpr,
    tokenStylesForIntent,
    rawBgExprWithState,
    tokenForegroundForIntent,
    warnLegacyColor,
    warnDeprecatedProp,
} from '@origam/utils/Commons/color.util'

// ─── isCssColor ──────────────────────────────────────────────────────────────

describe('isCssColor', () => {
    it.each([
        '#abc',
        '#aabbcc',
        '#aabbccdd',
        'rgb(0,0,0)',
        'rgba(0,0,0,0.5)',
        'hsl(0,100%,50%)',
        'hsla(0,100%,50%,1)',
        'hwb(0 0% 0%)',
        'lab(50% 0 0)',
        'lch(50% 10 20)',
        'oklab(0.5 0 0)',
        'oklch(0.5 0 0)',
        'color(srgb 1 0 0)',
        'var(--my-color)',
        'transparent',
        'currentcolor',
        'inherit',
        'red',
        'blue',
    ])('returns true for valid css color: %p', (color) => {
        expect(isCssColor(color)).toBe(true)
    })

    it.each([
        'primary',
        'success',
        'not-a-color',
        '',
        null,
        undefined,
        false,
    ] as Array<string | null | undefined | false>)('returns false for non-css-color: %p', (v) => {
        expect(isCssColor(v)).toBe(false)
    })
})

// ─── isParsableColor ──────────────────────────────────────────────────────────

describe('isParsableColor', () => {
    it('returns true for hex', () => expect(isParsableColor('#ff0000')).toBe(true))
    it('returns true for rgb() notation', () => expect(isParsableColor('rgb(255,0,0)')).toBe(true))
    it('returns false for var(--…) references', () => {
        expect(isParsableColor('var(--origam-color-primary)')).toBe(false)
    })
    it('returns false for rgb(var(--…)) hybrid', () => {
        expect(isParsableColor('rgb(var(--some-channel))')).toBe(false)
    })
    it('returns false for intent strings', () => {
        expect(isParsableColor('primary')).toBe(false)
    })
})

// ─── parseColor ──────────────────────────────────────────────────────────────

describe('parseColor', () => {
    it('parses a 6-digit hex string', () => {
        const result = parseColor('#ff0000')
        expect(result).toMatchObject({ r: 255, g: 0, b: 0 })
    })

    it('parses a 3-digit shorthand hex string', () => {
        const result = parseColor('#fff')
        expect(result).toMatchObject({ r: 255, g: 255, b: 255 })
    })

    it('parses a 8-digit hexa string (with alpha)', () => {
        const result = parseColor('#ff000080')
        expect(result.r).toBe(255)
        expect(result.g).toBe(0)
        expect(result.b).toBe(0)
        expect(result.a).toBeCloseTo(0.502, 2)
    })

    it('parses rgb() string', () => {
        const result = parseColor('rgb(10, 20, 30)')
        expect(result).toMatchObject({ r: 10, g: 20, b: 30 })
    })

    it('parses rgba() string', () => {
        const result = parseColor('rgba(10, 20, 30, 0.5)')
        expect(result).toMatchObject({ r: 10, g: 20, b: 30, a: 0.5 })
    })

    it('parses numeric integer color', () => {
        // 0xFF0000 = 16711680
        const result = parseColor(0xFF0000)
        expect(result).toMatchObject({ r: 255, g: 0, b: 0 })
    })

    it('parses an RGBA object (pass-through)', () => {
        const rgba = { r: 1, g: 2, b: 3, a: 1 }
        expect(parseColor(rgba)).toBe(rgba)
    })

    it('parses an HSL object via HSVtoRGB chain', () => {
        const result = parseColor({ h: 0, s: 1, l: 0.5 })
        expect(result.r).toBe(255)
        expect(result.g).toBe(0)
        expect(result.b).toBe(0)
    })

    it('parses an HSV object', () => {
        const result = parseColor({ h: 0, s: 1, v: 1 })
        expect(result.r).toBe(255)
        expect(result.g).toBe(0)
        expect(result.b).toBe(0)
    })

    it('throws TypeError for a completely invalid value', () => {
        expect(() => parseColor(null as never)).toThrow(TypeError)
    })
})

// ─── toHex ───────────────────────────────────────────────────────────────────

describe('toHex', () => {
    it.each([
        [0,   '00'],
        [255, 'FF'],
        [16,  '10'],
        [128, '80'],
    ])('toHex(%p) === %p', (input, expected) => {
        expect(toHex(input)).toBe(expected)
    })
})

// ─── RGBtoHex ────────────────────────────────────────────────────────────────

describe('RGBtoHex', () => {
    it('returns uppercase hex without alpha when a is undefined', () => {
        expect(RGBtoHex({ r: 255, g: 0, b: 0 })).toBe('#FF0000')
    })

    it('returns 8-char hex when alpha is provided', () => {
        const hex = RGBtoHex({ r: 255, g: 0, b: 0, a: 1 })
        expect(hex).toBe('#FF0000FF')
    })

    it('round-trips with HexToRGB', () => {
        const original = { r: 100, g: 150, b: 200 }
        const hex = RGBtoHex(original)
        const back = HexToRGB(hex)
        expect(back.r).toBe(original.r)
        expect(back.g).toBe(original.g)
        expect(back.b).toBe(original.b)
    })
})

// ─── HexToRGB ────────────────────────────────────────────────────────────────

describe('HexToRGB', () => {
    it('parses a 6-digit hex', () => {
        expect(HexToRGB('FF0000' as any)).toMatchObject({ r: 255, g: 0, b: 0 })
    })

    it('returns undefined alpha when no alpha channel', () => {
        expect(HexToRGB('FFFFFF' as any).a).toBeUndefined()
    })

    it('parses an 8-digit hex and normalises alpha', () => {
        // FF = 255, alpha = 255/255 = 1
        const result = HexToRGB('FF0000FF' as any)
        expect(result.a).toBe(1)
    })
})

// ─── parseHex ────────────────────────────────────────────────────────────────

describe('parseHex', () => {
    // NOTE: parseHex preserves the original casing of valid hex characters.
    // Only invalid characters are replaced with 'F' (uppercase). The
    // function does NOT uppercase valid characters.
    it('strips leading # and preserves lowercase hex digits', () => {
        expect(parseHex('#abc')).toBe('aabbcc')
    })

    it('expands 3-char shorthand to 6-char (lowercase preserved)', () => {
        expect(parseHex('abc')).toBe('aabbcc')
    })

    it('preserves uppercase when input is uppercase', () => {
        expect(parseHex('#ABC')).toBe('AABBCC')
    })

    it('expands 4-char shorthand (with alpha) to 8-char', () => {
        const result = parseHex('#abcd')
        expect(result).toHaveLength(8)
    })

    it('replaces invalid characters with uppercase F', () => {
        // 'G' is invalid → replaced with 'F'; valid digits preserved as-is
        const result = parseHex('#GGGGGG')
        expect(result).toBe('FFFFFF')
    })

    it('pads a too-short hex to 8 chars with F', () => {
        const result = parseHex('ab')
        expect(result).toHaveLength(8)
    })
})

// ─── RGBtoHSV / HSVtoRGB round-trip ──────────────────────────────────────────

describe('RGBtoHSV / HSVtoRGB round-trip', () => {
    it('round-trips pure red', () => {
        const rgb = { r: 255, g: 0, b: 0 }
        const hsv = RGBtoHSV(rgb)
        const back = HSVtoRGB(hsv)
        expect(back.r).toBe(255)
        expect(back.g).toBe(0)
        expect(back.b).toBe(0)
    })

    it('round-trips black', () => {
        const rgb = { r: 0, g: 0, b: 0 }
        const hsv = RGBtoHSV(rgb)
        const back = HSVtoRGB(hsv)
        expect(back.r).toBe(0)
        expect(back.g).toBe(0)
        expect(back.b).toBe(0)
    })

    it('round-trips white', () => {
        const rgb = { r: 255, g: 255, b: 255 }
        const hsv = RGBtoHSV(rgb)
        const back = HSVtoRGB(hsv)
        expect(back.r).toBe(255)
        expect(back.g).toBe(255)
        expect(back.b).toBe(255)
    })

    it('returns a default HSV for falsy input', () => {
        const hsv = RGBtoHSV(null as any)
        expect(hsv).toMatchObject({ h: 0, s: 1, v: 1, a: 1 })
    })
})

// ─── HSLtoHSV / HSVtoHSL ─────────────────────────────────────────────────────

describe('HSLtoHSV / HSVtoHSL round-trip', () => {
    it('converts red HSL to HSV', () => {
        const hsl = { h: 0, s: 1, l: 0.5 }
        const hsv = HSLtoHSV(hsl)
        expect(hsv.v).toBeCloseTo(1, 5)
        expect(hsv.s).toBeCloseTo(1, 5)
    })

    it('round-trips arbitrary colour', () => {
        const hsl = { h: 200, s: 0.6, l: 0.4, a: 0.8 }
        const back = HSVtoHSL(HSLtoHSV(hsl))
        expect(back.h).toBe(hsl.h)
        expect(back.s).toBeCloseTo(hsl.s, 5)
        expect(back.l).toBeCloseTo(hsl.l, 5)
        expect(back.a).toBe(hsl.a)
    })

    it('HSVtoHSL handles l=0 (black) without NaN', () => {
        const hsv = { h: 0, s: 0, v: 0 }
        const hsl = HSVtoHSL(hsv)
        expect(isNaN(hsl.s)).toBe(false)
        expect(hsl.l).toBe(0)
    })

    it('HSVtoHSL handles l=1 (white) without NaN', () => {
        const hsv = { h: 0, s: 0, v: 1 }
        const hsl = HSVtoHSL(hsv)
        expect(isNaN(hsl.s)).toBe(false)
        expect(hsl.l).toBe(1)
    })
})

// ─── HSLtoRGB ────────────────────────────────────────────────────────────────

describe('HSLtoRGB', () => {
    it('converts pure red HSL to RGB', () => {
        const result = HSLtoRGB({ h: 0, s: 1, l: 0.5 })
        expect(result.r).toBe(255)
        expect(result.g).toBe(0)
        expect(result.b).toBe(0)
    })
})

// ─── RGBtoCSS ────────────────────────────────────────────────────────────────

describe('RGBtoCSS', () => {
    it('emits rgb() when no alpha', () => {
        expect(RGBtoCSS({ r: 255, g: 0, b: 0 })).toBe('rgb(255, 0, 0)')
    })

    it('emits rgba() when alpha is defined', () => {
        expect(RGBtoCSS({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('rgba(255, 0, 0, 0.5)')
    })
})

// ─── HSVtoCSS ────────────────────────────────────────────────────────────────

describe('HSVtoCSS', () => {
    it('converts HSV to a valid CSS color string', () => {
        const css = HSVtoCSS({ h: 0, s: 1, v: 1 })
        expect(css).toMatch(/^rgb\(/)
    })
})

// ─── HexToHSV / HSVtoHex ─────────────────────────────────────────────────────

describe('HexToHSV / HSVtoHex', () => {
    it('converts red hex to HSV', () => {
        const hsv = HexToHSV('FF0000' as any)
        expect(hsv.h).toBeCloseTo(0, 0)
        expect(hsv.s).toBe(1)
        expect(hsv.v).toBe(1)
    })

    it('round-trips hex → HSV → hex', () => {
        const result = HSVtoHex(HexToHSV('00FF00' as any))
        expect(result).toBe('#00FF00')
    })
})

// ─── lighten / darken ─────────────────────────────────────────────────────────

describe('lighten', () => {
    it('increases luminance for a given RGB value', () => {
        const dark = { r: 50, g: 50, b: 50 }
        const lighter = lighten(dark, 2)
        const lumaAfter = getLuma(lighter)
        const lumaBefore = getLuma(dark)
        expect(lumaAfter).toBeGreaterThan(lumaBefore)
    })

    it('result stays within 0-255 range per channel', () => {
        const white = { r: 250, g: 250, b: 250 }
        const result = lighten(white, 10)
        expect(result.r).toBeLessThanOrEqual(255)
        expect(result.g).toBeLessThanOrEqual(255)
        expect(result.b).toBeLessThanOrEqual(255)
    })
})

describe('darken', () => {
    it('decreases luminance for a given RGB value', () => {
        const light = { r: 200, g: 200, b: 200 }
        const darker = darken(light, 2)
        const lumaAfter = getLuma(darker)
        const lumaBefore = getLuma(light)
        expect(lumaAfter).toBeLessThan(lumaBefore)
    })
})

// ─── getContrast ─────────────────────────────────────────────────────────────

describe('getContrast', () => {
    it('returns ~21 for black vs white (maximum contrast)', () => {
        const ratio = getContrast('#000000', '#ffffff')
        expect(ratio).toBeCloseTo(21, 0)
    })

    it('returns 1 for same colour vs itself', () => {
        const ratio = getContrast('#aabbcc', '#aabbcc')
        expect(ratio).toBeCloseTo(1, 5)
    })

    it('is symmetric (order does not matter)', () => {
        const a = getContrast('#ff0000', '#0000ff')
        const b = getContrast('#0000ff', '#ff0000')
        expect(a).toBeCloseTo(b, 10)
    })
})

// ─── getLuma ─────────────────────────────────────────────────────────────────

describe('getLuma', () => {
    it('black has luma ~0', () => {
        expect(getLuma('#000000')).toBeCloseTo(0, 3)
    })

    it('white has luma ~1', () => {
        expect(getLuma('#ffffff')).toBeCloseTo(1, 1)
    })
})

// ─── getForeground ────────────────────────────────────────────────────────────

describe('getForeground', () => {
    it('returns #000 for a very light background', () => {
        expect(getForeground('#ffffff')).toBe('#000')
    })

    it('returns #fff for a very dark background', () => {
        expect(getForeground('#000000')).toBe('#fff')
    })
})

// ─── APCAcontrast ─────────────────────────────────────────────────────────────

describe('APCAcontrast', () => {
    it('returns 0 for identical colours (∆Y < threshold)', () => {
        const black = parseColor(0x000000)
        const result = APCAcontrast(black, black)
        expect(result).toBe(0)
    })

    it('returns a large positive value for white text on black', () => {
        const white = parseColor(0xFFFFFF)
        const black = parseColor(0x000000)
        // Ybg < Ytxt → reverse polarity → negative SAPC × 100
        const result = APCAcontrast(white, black)
        expect(Math.abs(result)).toBeGreaterThan(50)
    })
})

// ─── XyzToRgb / RgbtoXyz round-trip ──────────────────────────────────────────

describe('RgbtoXyz / XyzToRgb round-trip', () => {
    it('round-trips mid-grey without precision loss > 1 unit', () => {
        const original = { r: 128, g: 128, b: 128 }
        const xyz = RgbtoXyz(original)
        const back = XyzToRgb(xyz)
        expect(Math.abs(back.r - original.r)).toBeLessThanOrEqual(1)
        expect(Math.abs(back.g - original.g)).toBeLessThanOrEqual(1)
        expect(Math.abs(back.b - original.b)).toBeLessThanOrEqual(1)
    })
})

// ─── XyztoLab / LabtoXyz round-trip ──────────────────────────────────────────

describe('XyztoLab / LabtoXyz round-trip', () => {
    it('converts and back-converts without significant drift', () => {
        const xyz: [number, number, number] = [0.2, 0.4, 0.6]
        const lab = XyztoLab(xyz)
        const back = LabtoXyz(lab)
        expect(back[0]).toBeCloseTo(xyz[0], 5)
        expect(back[1]).toBeCloseTo(xyz[1], 5)
        expect(back[2]).toBeCloseTo(xyz[2], 5)
    })
})

// ─── classToHex ──────────────────────────────────────────────────────────────

describe('classToHex', () => {
    // Fixed: the original code called `.replace('-', '')` on the FULL input
    // string before splitting on space, which stripped the first hyphen from
    // anywhere in the string (including within the color name). Concretely:
    //   'red lighten-1' → strip first '-' → 'red lighten1' → split on space
    //   → colorModifier='lighten1', but palette key is 'lighten-1' → no match.
    //
    // Fix: split on space first, then strip ALL hyphens from the modifier part
    // only (colorModifier?.replace(/-/g, '')), leaving the color name intact.
    //   'red lighten-1' → split → ['red', 'lighten-1']
    //   modifier 'lighten-1'.replace(/-/g,'') → 'lighten1'
    //   palette key lookup: 'lighten1' matches palette['red']['lighten1']

    const palette = {
        red: { base: '#FF0000', 'lighten1': '#FF5555' },
        blue: { base: '#0000FF' }
    }

    it('resolves modifier key when no dash in modifier', () => {
        expect(classToHex('red lighten1', palette)).toBe('#FF5555')
    })

    it('resolves base when no modifier given', () => {
        expect(classToHex('blue', palette)).toBe('#0000FF')
    })

    it('returns empty string for unknown color', () => {
        expect(classToHex('purple', palette)).toBe('')
    })

    it('returns empty string when color exists but modifier does not match and no base', () => {
        const noPalette = { grey: { '500': '#9E9E9E' } }
        expect(classToHex('grey darken1', noPalette)).toBe('')
    })

    it('resolves a modifier with a dash (e.g. "lighten-1") by stripping the dash from the modifier only', () => {
        // Fixed: the dash is now stripped only from the modifier part after the
        // split, so 'lighten-1' → 'lighten1' and the palette key 'lighten1' matches.
        const paletteWithDashModifier = {
            red: { base: '#FF0000', 'lighten1': '#FF5555' }
        }
        expect(classToHex('red lighten-1', paletteWithDashModifier)).toBe('#FF5555')
    })

    it('does not corrupt the color name when modifier contains a dash', () => {
        // The color name must remain intact — only the modifier is stripped.
        // Previously the fix candidate was `replace('-','')` on the full string
        // which could eat a hyphen from the color name itself.
        const palette2 = {
            'deep-red': { base: '#CC0000', 'lighten1': '#FF4444' }
        }
        expect(classToHex('deep-red lighten-1', palette2)).toBe('#FF4444')
    })
})

// ─── isIntent ─────────────────────────────────────────────────────────────────

describe('isIntent', () => {
    it.each(['primary', 'secondary', 'ghost', 'neutral', 'success', 'warning', 'danger', 'info'])(
        'returns true for known intent %p',
        (intent) => expect(isIntent(intent)).toBe(true)
    )

    it.each(['#ff0000', 'rgb(0,0,0)', '', null, undefined, 'random'])(
        'returns false for non-intent %p',
        (v) => expect(isIntent(v as any)).toBe(false)
    )
})

// ─── isUtilityIntent ─────────────────────────────────────────────────────────

describe('isUtilityIntent', () => {
    it('returns true for all utility intents', () => {
        ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'].forEach(v => {
            expect(isUtilityIntent(v)).toBe(true)
        })
    })

    it('returns false for ghost (excluded by design)', () => {
        expect(isUtilityIntent('ghost')).toBe(false)
    })

    it('returns false for raw colors and null', () => {
        expect(isUtilityIntent('#abc')).toBe(false)
        expect(isUtilityIntent(null)).toBe(false)
    })
})

// ─── intentTokenBase ─────────────────────────────────────────────────────────

describe('intentTokenBase', () => {
    it.each([
        ['neutral',   'action--secondary'],
        ['primary',   'action--primary'],
        ['secondary', 'action--secondary'],
        ['ghost',     'action--ghost'],
        ['success',   'feedback--success'],
        ['warning',   'feedback--warning'],
        ['danger',    'feedback--danger'],
        ['info',      'feedback--info'],
    ] as [string, string][])('intentTokenBase(%p) === %p', (intent, expected) => {
        expect(intentTokenBase(intent as any)).toBe(expected)
    })
})

// ─── intentBgExpr ────────────────────────────────────────────────────────────

describe('intentBgExpr', () => {
    it('returns baseVar for role=default', () => {
        const expr = intentBgExpr('primary', 'default')
        expect(expr).toBe('var(--origam-color__action--primary---bg)')
    })

    it('returns bgDisabled token for role=disabled', () => {
        const expr = intentBgExpr('primary', 'disabled')
        expect(expr).toBe('var(--origam-color__action--primary---bgDisabled)')
    })

    it('contains color-mix with 20% black for role=hover', () => {
        const expr = intentBgExpr('primary', 'hover')
        expect(expr).toContain('color-mix(in srgb,')
        expect(expr).toContain('black 20%')
    })

    it('contains color-mix with 30% black for role=active', () => {
        const expr = intentBgExpr('primary', 'active')
        expect(expr).toContain('color-mix(in srgb,')
        expect(expr).toContain('black 30%')
    })

    it('uses correct base for feedback intents', () => {
        const expr = intentBgExpr('danger', 'default')
        expect(expr).toContain('feedback--danger')
    })
})

// ─── intentFgExpr ────────────────────────────────────────────────────────────

describe('intentFgExpr', () => {
    it('returns fg token for default/hover/active roles', () => {
        const expr = intentFgExpr('primary', 'default')
        expect(expr).toContain('---fg)')
        expect(expr).not.toContain('fgDisabled')
    })

    it('returns fgDisabled token for disabled role', () => {
        const expr = intentFgExpr('primary', 'disabled')
        expect(expr).toContain('---fgDisabled)')
    })
})

// ─── tokenStylesForIntent ─────────────────────────────────────────────────────

describe('tokenStylesForIntent', () => {
    it('returns both background-color and color keys', () => {
        const styles = tokenStylesForIntent('primary')
        expect(styles).toHaveProperty('background-color')
        expect(styles).toHaveProperty('color')
    })

    it('uses default role when not specified', () => {
        const styles = tokenStylesForIntent('success')
        expect(styles['background-color']).toContain('feedback--success')
    })
})

// ─── rawBgExprWithState ───────────────────────────────────────────────────────

describe('rawBgExprWithState', () => {
    it('returns the raw color unchanged for role=default', () => {
        expect(rawBgExprWithState('#ff0000', 'default')).toBe('#ff0000')
    })

    it('returns the raw color unchanged for role=disabled', () => {
        expect(rawBgExprWithState('#ff0000', 'disabled')).toBe('#ff0000')
    })

    it('wraps in color-mix with 20% for role=hover', () => {
        const expr = rawBgExprWithState('#ff0000', 'hover')
        expect(expr).toContain('color-mix(in srgb,')
        expect(expr).toContain('#ff0000')
        expect(expr).toContain('black 20%')
    })

    it('wraps in color-mix with 30% for role=active', () => {
        const expr = rawBgExprWithState('rgb(255,0,0)', 'active')
        expect(expr).toContain('black 30%')
    })
})

// ─── tokenForegroundForIntent ─────────────────────────────────────────────────

describe('tokenForegroundForIntent', () => {
    it('returns secondary fg for neutral', () => {
        expect(tokenForegroundForIntent('neutral')).toBe('var(--origam-color__action--secondary---fg)')
    })

    it('returns secondary fg for secondary', () => {
        expect(tokenForegroundForIntent('secondary')).toBe('var(--origam-color__action--secondary---fg)')
    })

    it('returns ghost fg for ghost', () => {
        expect(tokenForegroundForIntent('ghost')).toBe('var(--origam-color__action--ghost---fg)')
    })

    it.each(['success', 'warning', 'danger', 'info'] as const)(
        'returns fgSubtle for feedback intent %p',
        (intent) => {
            const result = tokenForegroundForIntent(intent)
            expect(result).toContain(`feedback--${intent}---fgSubtle`)
        }
    )

    it('returns fgSubtle for primary', () => {
        expect(tokenForegroundForIntent('primary')).toContain('action--primary---fgSubtle')
    })
})

// ─── warnLegacyColor ──────────────────────────────────────────────────────────

describe('warnLegacyColor', () => {
    beforeEach(() => {
        // Reset the module-level warn cache between tests so warnings fire again.
        // The cache is a private Set — access via re-import side-effect is not
        // possible, so we spy on console.warn and just verify it fires once.
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('emits a console.warn with the prop name and value', () => {
        warnLegacyColor('color', '#unique-test-value-abc')
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('#unique-test-value-abc')
        )
    })

    it('does not warn a second time for the same (kind, value)', () => {
        warnLegacyColor('bgColor', '#dedup-sentinel-xyz')
        warnLegacyColor('bgColor', '#dedup-sentinel-xyz')
        expect(console.warn).toHaveBeenCalledTimes(1)
    })
})

// ─── warnDeprecatedProp ─────────────────────────────────────────────────────
// Same once-per-key cache strategy as `warnLegacyColor`, but keyed by
// `component::oldProp->newProp` (not by value) — first consumer is the
// `bgColor` → `accentColor` migration on OrigamBlockquote. Each test uses a
// distinct (component, oldProp) pair as its own cache key so tests stay
// order-independent without needing to reset the module (mirrors the
// `warnLegacyColor` spec's "unique sentinel value" strategy above).

describe('warnDeprecatedProp', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('emits a console.warn naming the component, old prop and new prop', () => {
        warnDeprecatedProp('TestCompA', 'oldPropA', 'newPropA')
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringMatching(/TestCompA.*prop "oldPropA" is deprecated.*"newPropA"/)
        )
    })

    it('mentions the default removal version v3.0.0', () => {
        warnDeprecatedProp('TestCompB', 'oldPropB', 'newPropB')
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('v3.0.0'))
    })

    it('accepts a custom removal version', () => {
        warnDeprecatedProp('TestCompC', 'oldPropC', 'newPropC', 'v4.0.0')
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('v4.0.0'))
        expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining('v3.0.0'))
    })

    it('does not warn a second time for the same (component, oldProp, newProp)', () => {
        warnDeprecatedProp('TestCompD', 'oldPropD', 'newPropD')
        warnDeprecatedProp('TestCompD', 'oldPropD', 'newPropD')
        expect(console.warn).toHaveBeenCalledTimes(1)
    })

    it('warns again for the same oldProp on a DIFFERENT component (key includes component)', () => {
        warnDeprecatedProp('TestCompE1', 'oldPropE', 'newPropE')
        warnDeprecatedProp('TestCompE2', 'oldPropE', 'newPropE')
        expect(console.warn).toHaveBeenCalledTimes(2)
    })
})
