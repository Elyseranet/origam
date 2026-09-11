import {
    BCO,
    BLK_CLMP,
    BLK_THRS,
    CIELAB_FORWARD_TRANSFORM,
    CIELAB_REVERSE_TRANSFORM,
    COLOR_ACTIVE_MIX_PCT,
    COLOR_DELTA_Y_MIN,
    COLOR_HOVER_MIX_PCT,
    COLOR_INTENTS,
    COLOR_MAPPERS,
    COLOR_UTILITY_INTENTS,
    CSS_COLOR_REGEX,
    CSS_NAMED_COLORS,
    GCO,
    LO_CLIP,
    LO_CON_FACTOR,
    LO_CON_OFFSET,
    LO_CON_THRESH,
    MAIN_TRC,
    NORM_BG,
    NORM_TXT,
    RCO,
    REV_BG,
    REV_TXT,
    SCALE_B_O_W,
    SCALE_W_O_B,
    SRGB_FORWARD_MATRIX,
    SRGB_FORWARD_TRANSFORM,
    SRGB_REVERSE_MATRIX,
    SRGB_REVERSE_TRANSFORM
} from '../../consts'

import type { TBgFgRole, TColor, TColorType, THex, THSLA, THSVA, TIntent, TLAB, TRGBA, TXYZ } from '../../types'

// Direct imports from sibling util files (NOT the barrel) to avoid a
// circular `utils/index → color.util → utils/index` chain. The barrel
// cycle worked for the pre-existing exports thanks to ES module live
// bindings, but vitest's module loader (vite-node) returns `undefined`
// for late-added exports under that cycle — caught when the newly-added
// `isIntent` / `isUtilityIntent` helpers landed in this file. Sidestep
// the cycle entirely by importing from the source files directly.
import { chunk, clamp, has, int, padEnd } from './commons.util'
import { consoleWarn } from './console.util'

/**
 * Recognise any string the CSS engine treats as a colour:
 *   - hex (`#abc`, `#aabbcc`, `#aabbccdd`)
 *   - functional notation (`rgb()`, `rgba()`, `hsl()`, `hsla()`,
 *     `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`)
 *   - CSS variable (`var(--…)`)
 *   - one of the 148 named colours OR a CSS-wide keyword
 *     (`transparent`, `currentColor`, `inherit`, …)
 */
export function isCssColor (color?: string | null | false): boolean {
    return !!color && (
        /^(#|var\(--|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\()/i.test(color) ||
        CSS_NAMED_COLORS.has(color.toLowerCase())
    )
}

/**
 * Is parsable color.
 *
 * @param color …
 * @returns …
 */
export function isParsableColor (color: string): boolean {
    return isCssColor(color) && !/^((rgb|hsl)a?\()?var\(--/.test(color)
}

/**
 * Parse color.
 *
 * @param color …
 * @returns …
 */
export function parseColor (color: TColorType): TRGBA {
    if (typeof color === 'number') {
        if (isNaN(color) || color < 0 || color > 0xFFFFFF) { // int can't have opacity
            consoleWarn(`'${color}' is not a valid hex color`)
        }

        return {
            r: (color & 0xFF0000) >> 16,
            g: (color & 0xFF00) >> 8,
            b: (color & 0xFF)
        }
    } else if (typeof color === 'string' && CSS_COLOR_REGEX.test(color)) {
        const {groups} = color.match(CSS_COLOR_REGEX)!
        const {fn, values} = groups as { fn: keyof typeof COLOR_MAPPERS, values: string }
        const realValues = values.split(/,\s*/)
            .map(v => {
                if (v.endsWith('%') && ['hsl', 'hsla', 'hsv', 'hsva'].includes(fn)) {
                    return parseFloat(v) / 100
                } else {
                    return parseFloat(v)
                }
            }) as [number, number, number, number?]

        return COLOR_MAPPERS[fn](...realValues)
    } else if (typeof color === 'string') {
        let hex = color.startsWith('#') ? color.slice(1) : color

        if ([3, 4].includes(hex.length)) {
            hex = hex.split('').map(char => char + char).join('')
        } else if (![6, 8].includes(hex.length)) {
            consoleWarn(`'${color}' is not a valid hex(a) color`)
        }

        const integer = int(hex, 16)
        if (isNaN(integer) || integer < 0 || integer > 0xFFFFFFFF) {
            consoleWarn(`'${color}' is not a valid hex(a) color`)
        }

        return HexToRGB(hex as THex)
    } else if (typeof color === 'object') {
        if (has(color, ['r', 'g', 'b'])) {
            return color
        } else if (has(color, ['h', 's', 'l'])) {
            return HSVtoRGB(HSLtoHSV(color))
        } else if (has(color, ['h', 's', 'v'])) {
            return HSVtoRGB(color)
        }
    }

    throw new TypeError(`Invalid color: ${color == null ? color : (String(color) || (color as any).constructor.name)}\nExpected #hex, #hexa, rgb(), rgba(), hsl(), hsla(), object or number`)
}

/**
 * Get foreground.
 *
 * @param color …
 */
export function getForeground (color: TColorType) {
    const blackContrast = Math.abs(APCAcontrast(parseColor(0), parseColor(color)))
    const whiteContrast = Math.abs(APCAcontrast(parseColor(0xffffff), parseColor(color)))

    // Prefer white text if both have an acceptable contrast ratio
    return whiteContrast > Math.min(blackContrast, 50) ? '#fff' : '#000'
}

/**
 * Hs lto rgb.
 *
 * @param hsla …
 * @returns …
 */
export function HSLtoRGB (hsla: THSLA): TRGBA {
    return HSVtoRGB(HSLtoHSV(hsla))
}

/**
 * Rg bto hsv.
 *
 * @param rgba …
 * @returns …
 */
export function RGBtoHSV (rgba: TRGBA): THSVA {
    if (!rgba) return {h: 0, s: 1, v: 1, a: 1}

    const r = rgba.r / 255
    const g = rgba.g / 255
    const b = rgba.b / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    let h = 0

    if (max !== min) {
        if (max === r) {
            h = 60 * (0 + ((g - b) / (max - min)))
        } else if (max === g) {
            h = 60 * (2 + ((b - r) / (max - min)))
        } else if (max === b) {
            h = 60 * (4 + ((r - g) / (max - min)))
        }
    }

    if (h < 0) h = h + 360

    const s = max === 0 ? 0 : (max - min) / max
    const hsv = [h, s, max]

    return {h: hsv[0], s: hsv[1], v: hsv[2], a: rgba.a}
}

/**
 * Hs vto hsl.
 *
 * @param hsva …
 * @returns …
 */
export function HSVtoHSL (hsva: THSVA): THSLA {
    const {h, s, v, a} = hsva

    const l = v - (v * s / 2)

    const sprime = l === 1 || l === 0 ? 0 : (v - l) / Math.min(l, 1 - l)

    return {h, s: sprime, l, a}
}

/**
 * Hs lto hsv.
 *
 * @param hsl …
 * @returns …
 */
export function HSLtoHSV (hsl: THSLA): THSVA {
    const {h, s, l, a} = hsl

    const v = l + s * Math.min(l, 1 - l)

    const sprime = v === 0 ? 0 : 2 - (2 * l / v)

    return {h, s: sprime, v, a}
}

/**
 * Rg bto css.
 *
 * @param options …
 * @returns …
 */
export function RGBtoCSS ({r, g, b, a}: TRGBA): string {
    return a === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`
}

/**
 * Hs vto css.
 *
 * @param hsva …
 * @returns …
 */
export function HSVtoCSS (hsva: THSVA): string {
    return RGBtoCSS(HSVtoRGB(hsva))
}

/**
 * To hex.
 *
 * @param v …
 */
export function toHex (v: number) {
    const h = Math.round(v).toString(16)
    return ('00'.slice(0, 2 - h.length) + h).toUpperCase()
}

/**
 * Rg bto hex.
 *
 * @param options …
 * @returns …
 */
export function RGBtoHex ({r, g, b, a}: TRGBA): THex {
    return `#${[
        toHex(r),
        toHex(g),
        toHex(b),
        a !== undefined ? toHex(Math.round(a * 255)) : ''
    ].join('')}` as THex
}

/**
 * Hex to rgb.
 *
 * @param hex …
 * @returns …
 */
export function HexToRGB (hex: THex): TRGBA {
    hex = parseHex(hex)
    const [r, g, b, a] = chunk(hex, 2).map((c: string) => int(c, 16))
    const alpha = a === undefined ? a : (a / 255)

    return {r, g, b, a: alpha}
}

/**
 * Hex to hsv.
 *
 * @param hex …
 * @returns …
 */
export function HexToHSV (hex: THex): THSVA {
    const rgb = HexToRGB(hex)
    return RGBtoHSV(rgb)
}

/**
 * Hs vto hex.
 *
 * @param hsva …
 * @returns …
 */
export function HSVtoHex (hsva: THSVA): THex {
    return RGBtoHex(HSVtoRGB(hsva))
}

/**
 * Hs vto rgb.
 *
 * @param hsva …
 * @returns …
 */
export function HSVtoRGB (hsva: THSVA): TRGBA {
    const {h, s, v, a} = hsva
    const f = (n: number) => {
        const k = (n + (h / 60)) % 6
        return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    }

    const rgb = [f(5), f(3), f(1)].map(v => Math.round(v * 255))

    return {r: rgb[0], g: rgb[1], b: rgb[2], a}
}

/**
 * Parse hex.
 *
 * @param hex …
 * @returns …
 */
export function parseHex (hex: string): THex {
    if (hex.startsWith('#')) {
        hex = hex.slice(1)
    }

    hex = hex.replace(/([^0-9a-f])/gi, 'F')

    if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(x => x + x).join('')
    }

    if (hex.length !== 6) {
        hex = padEnd(padEnd(hex, 6), 8, 'F')
    }

    return hex as THex
}

/**
 * Lighten.
 *
 * @param value  …
 * @param amount …
 * @returns …
 */
export function lighten (value: TRGBA, amount: number): TRGBA {
    const lab = XyztoLab(RgbtoXyz(value))
    lab[0] = lab[0] + amount * 10

    return XyzToRgb(LabtoXyz(lab))
}

/**
 * Darken.
 *
 * @param value  …
 * @param amount …
 * @returns …
 */
export function darken (value: TRGBA, amount: number): TRGBA {
    const lab = XyztoLab(RgbtoXyz(value))
    lab[0] = lab[0] - amount * 10

    return XyzToRgb(LabtoXyz(lab))
}

/**
 * Get contrast.
 *
 * @param first  …
 * @param second …
 */
export function getContrast (first: TColorType, second: TColorType) {
    const l1 = getLuma(first)
    const l2 = getLuma(second)

    const light = Math.max(l1, l2)
    const dark = Math.min(l1, l2)

    return (light + 0.05) / (dark + 0.05)
}

/**
 * Get luma.
 *
 * @param color …
 */
export function getLuma (color: TColorType) {
    const rgb = parseColor(color)

    return RgbtoXyz(rgb)[1]
}

/**
 * Parse gradient.
 *
 * @param gradient …
 * @param colors   …
 */
export function parseGradient (
    gradient: string,
    colors: Record<string, Record<string, string>>
) {
    return gradient.replace(/([a-z]+(\s[a-z]+-[1-5])?)(?=$|,)/gi, x => {
        return classToHex(x, colors) || x
    }).replace(/(rgba\()#[0-9a-f]+(?=,)/gi, x => {
        return 'rgba(' + Object.values(HexToRGB(parseHex(x.replace(/rgba\(/, '')))).slice(0, 3).join(',')
    })
}

/**
 * Class to hex.
 *
 * @param color  …
 * @param colors …
 * @returns …
 */
export function classToHex (
    color: string,
    colors: Record<string, Record<string, string>>
): string {
    const parts = color.toString().trim().split(' ', 2) as Array<(string | undefined)>
    const colorName = parts[0]
    const colorModifier = parts[1]?.replace(/-/g, '')

    let hexColor = ''
    if (colorName && colorName in colors) {
        if (colorModifier && colorModifier in colors[colorName]) {
            hexColor = colors[colorName][colorModifier]
        } else if ('base' in colors[colorName]) {
            hexColor = colors[colorName].base
        }
    }

    return hexColor
}

/**
 * Xyz to rgb.
 *
 * @param xyz …
 * @returns …
 */
export function XyzToRgb (xyz: TXYZ): TRGBA {
    const rgb: number[] = Array(3)
    const transform = SRGB_FORWARD_TRANSFORM
    const matrix = SRGB_FORWARD_MATRIX

    // Matrix transform, then gamma adjustment
    for (let i = 0; i < 3; ++i) {
        // Rescale back to [0, 255]
        rgb[i] = Math.round(clamp(transform(
            matrix[i][0] * xyz[0] +
            matrix[i][1] * xyz[1] +
            matrix[i][2] * xyz[2]
        )) * 255)
    }

    return {
        r: rgb[0],
        g: rgb[1],
        b: rgb[2]
    }
}

/**
 * Rgbto xyz.
 *
 * @param options …
 * @returns …
 */
export function RgbtoXyz ({r, g, b}: TRGBA): TXYZ {
    const xyz: TXYZ = [0, 0, 0]
    const transform = SRGB_REVERSE_TRANSFORM
    const matrix = SRGB_REVERSE_MATRIX

    // Rescale from [0, 255] to [0, 1] then adjust sRGB gamma to linear RGB
    const rLinear = transform(r / 255)
    const gLinear = transform(g / 255)
    const bLinear = transform(b / 255)

    // Matrix color space transform
    for (let i = 0; i < 3; ++i) {
        xyz[i] = matrix[i][0] * rLinear + matrix[i][1] * gLinear + matrix[i][2] * bLinear
    }

    return xyz
}

/**
 * Xyzto lab.
 *
 * @param xyz …
 * @returns …
 */
export function XyztoLab (xyz: TXYZ): TLAB {
    const transform = CIELAB_FORWARD_TRANSFORM
    const transformedY = transform(xyz[1])

    return [
        116 * transformedY - 16,
        500 * (transform(xyz[0] / 0.95047) - transformedY),
        200 * (transformedY - transform(xyz[2] / 1.08883))
    ]
}

/**
 * Labto xyz.
 *
 * @param lab …
 * @returns …
 */
export function LabtoXyz (lab: TLAB): TXYZ {
    const transform = CIELAB_REVERSE_TRANSFORM
    const Ln = (lab[0] + 16) / 116
    return [
        transform(Ln + lab[1] / 500) * 0.95047,
        transform(Ln),
        transform(Ln - lab[2] / 200) * 1.08883
    ]
}

/**
 * Apc acontrast.
 *
 * @param text       …
 * @param background …
 */
export function APCAcontrast (text: TRGBA, background: TRGBA) {
    // Linearize sRGB
    const Rtxt = (text.r / 255) ** MAIN_TRC
    const Gtxt = (text.g / 255) ** MAIN_TRC
    const Btxt = (text.b / 255) ** MAIN_TRC

    const Rbg = (background.r / 255) ** MAIN_TRC
    const Gbg = (background.g / 255) ** MAIN_TRC
    const Bbg = (background.b / 255) ** MAIN_TRC

    // Apply the standard coefficients and sum to Y
    let Ytxt = (Rtxt * RCO) + (Gtxt * GCO) + (Btxt * BCO)
    let Ybg = (Rbg * RCO) + (Gbg * GCO) + (Bbg * BCO)

    // Soft clamp Y when near black.
    // Now clamping all colors to prevent crossover errors
    if (Ytxt <= BLK_THRS) Ytxt += (BLK_THRS - Ytxt) ** BLK_CLMP
    if (Ybg <= BLK_THRS) Ybg += (BLK_THRS - Ybg) ** BLK_CLMP

    // Return 0 Early for extremely low ∆Y (lint trap #1)
    if (Math.abs(Ybg - Ytxt) < COLOR_DELTA_Y_MIN) return 0.0

    // SAPC CONTRAST

    let outputContrast: number // For weighted final values
    if (Ybg > Ytxt) {
        // For normal polarity, black text on white
        // Calculate the SAPC contrast value and scale

        const SAPC = ((Ybg ** NORM_BG) - (Ytxt ** NORM_TXT)) * SCALE_B_O_W

        // NEW! SAPC SmoothScale™
        // Low Contrast Smooth Scale Rollout to prevent polarity reversal
        // and also a low clip for very low contrasts (lint trap #2)
        // much of this is for very low contrasts, less than 10
        // therefore for most reversing needs, only LO_CON_OFFSET is important
        outputContrast =
            (SAPC < LO_CLIP) ? 0.0
                : (SAPC < LO_CON_THRESH) ? SAPC - SAPC * LO_CON_FACTOR * LO_CON_OFFSET
                    : SAPC - LO_CON_OFFSET
    } else {
        // For reverse polarity, light text on dark
        // WoB should always return negative value.

        const SAPC = ((Ybg ** REV_BG) - (Ytxt ** REV_TXT)) * SCALE_W_O_B

        outputContrast =
            (SAPC > -LO_CLIP) ? 0.0
                : (SAPC > -LO_CON_THRESH) ? SAPC - SAPC * LO_CON_FACTOR * LO_CON_OFFSET
                    : SAPC + LO_CON_OFFSET
    }

    return outputContrast * 100
}

// ════════════════════════════════════════════════════════════════════════════
// Intent / token-cascade helpers (consumed by useColor & useColorEffect)
// ════════════════════════════════════════════════════════════════════════════
// Pure helpers that translate a semantic intent ('primary', 'danger', …) into
// the right CSS token reference. Kept in this util file (NOT inline in the
// composable) per project rule: composables hold ONLY `use*` functions.

/**
 * Type guard: is `v` a known semantic intent?
 */
export function isIntent (v: TColor | TIntent | null | undefined): v is TIntent {
    return typeof v === 'string' && COLOR_INTENTS.has(v)
}

/**
 * Type guard: is `v` an intent for which a global utility class ships
 * (`.origam--bg-<intent>` / `.origam--color-<intent>`)? `ghost` is
 * intentionally excluded — the design system does not ship
 * `.origam--bg-ghost`.
 */
export function isUtilityIntent (v: TColor | TIntent | null | undefined): v is TIntent {
    return typeof v === 'string' && COLOR_UTILITY_INTENTS.has(v)
}

/**
 * Resolve the token-base prefix (BEM block + modifier, without the
 * `--origam-color__` / `---<prop>` envelope) for a given intent.
 * Drives every other helper below:
 *
 *   'neutral'  → 'action--secondary'
 *   'primary'  → 'action--primary'
 *   'success'  → 'feedback--success'
 *   'danger'   → 'feedback--danger'
 *   …
 *
 * Consumed as ``var(--origam-color__${base}---${slot})`` — the BEM
 * grammar matches the rest of the token namespace (`__` between
 * domain and block, `--` between block and modifier, `---` before the
 * property/slot).
 */
export function intentTokenBase (intent: TIntent): string {
    if (intent === 'neutral') return 'action--secondary'
    if (intent === 'success' || intent === 'warning' || intent === 'danger' || intent === 'info') {
        return `feedback--${intent}`
    }
    // primary / secondary / ghost
    return `action--${intent}`
}

/**
 * Emit a state-aware bg expression for an intent:
 *
 *   • `default`  → `var(--…-bg)`
 *   • `hover`    → `var(--…-bgHover, color-mix(in srgb, var(--…-bg), black 20%))`
 *   • `active`   → `var(--…-bgActive, color-mix(in srgb, var(--…-bg), black 30%))`
 *   • `disabled` → `var(--…-bgDisabled)`
 */
export function intentBgExpr (intent: TIntent, role: TBgFgRole): string {
    const base = intentTokenBase(intent)
    const baseVar = `var(--origam-color__${base}---bg)`
    if (role === 'default') return baseVar
    if (role === 'disabled') return `var(--origam-color__${base}---bgDisabled)`
    const pct = role === 'hover' ? COLOR_HOVER_MIX_PCT : COLOR_ACTIVE_MIX_PCT
    const slot = role === 'hover' ? 'bgHover' : 'bgActive'
    return `var(--origam-color__${base}---${slot}, color-mix(in srgb, ${baseVar}, black ${pct}%))`
}

/**
 * Foreground stays the same hue across hover / active by design — we
 * darken the surface around the text, the text itself keeps the
 * WCAG-paired contrast token.
 */
export function intentFgExpr (intent: TIntent, role: TBgFgRole): string {
    const base = intentTokenBase(intent)
    const slot = role === 'disabled' ? 'fgDisabled' : 'fg'
    return `var(--origam-color__${base}---${slot})`
}

/**
 * Build the CSS-vars override map for an intent (foreground + background)
 * for a given interaction state.
 */
export function tokenStylesForIntent (intent: TIntent, role: TBgFgRole = 'default'): Record<string, string> {
    return {
        'background-color': intentBgExpr(intent, role),
        color: intentFgExpr(intent, role),
    }
}

/**
 * Derive a state-aware bg from a raw CSS color value (hex/rgb/etc.) via
 * `color-mix`. Used in the legacy raw-color path so consumers passing
 * `bgColor="#abcdef"` still get a hover/active darken (matches the
 * intent path's behaviour, just without the token cascade).
 */
export function rawBgExprWithState (raw: string, role: TBgFgRole): string {
    if (role === 'default') return raw
    if (role === 'disabled') return raw // veil/opacity handles disabled
    const pct = role === 'hover' ? COLOR_HOVER_MIX_PCT : COLOR_ACTIVE_MIX_PCT
    return `color-mix(in srgb, ${raw}, black ${pct}%)`
}

/**
 * Resolve the **foreground-only** colour for an intent — the token used
 * when the consumer says `color="primary"` and expects the *text itself*
 * to be primary-coloured (no surface implied).
 *
 * This is NOT the same as `tokenStylesForIntent(...).color`:
 *   - That one returns the WCAG-contrasted text colour to put ON TOP of
 *     the matching `bg` token (typically white on a dark surface).
 *   - This helper returns the `fgSubtle` rung — a darker shade of the
 *     intent itself, designed for "coloured text on a light surface".
 *
 * Falls back gracefully on intents without a `fgSubtle` rung
 * (`secondary`, `ghost`, `neutral`).
 */
export function tokenForegroundForIntent (intent: TIntent): string {
    if (intent === 'neutral' || intent === 'secondary') {
        // No fgSubtle — `fg` is already a dark neutral text colour.
        return 'var(--origam-color__action--secondary---fg)'
    }
    if (intent === 'ghost') {
        // ghost.fg is already primary.600 — the intent's own colour.
        return 'var(--origam-color__action--ghost---fg)'
    }
    if (intent === 'success' || intent === 'warning' || intent === 'danger' || intent === 'info') {
        return `var(--origam-color__feedback--${intent}---fgSubtle)`
    }
    // primary → action.primary.fgSubtle (color.primary.700)
    return `var(--origam-color__action--${intent}---fgSubtle)`
}

// ── Legacy raw-color deprecation warning ────────────────────────────────────
// Tracks once-per-(prop, value) so the noisy warning doesn't spam the console.
// Module-scope state is acceptable here because the cache is purely
// runtime book-keeping, not a re-configurable constant.

const _warnedColorKeys = new Set<string>()

/**
 * Warn (once per prop / value) that the consumer passed a raw CSS color
 * to a prop where the design system expects a `TIntent`. Raw color
 * support is deprecated and will be removed in v3.0.0.
 */
export function warnLegacyColor (
    kind: 'color' | 'bgColor' | 'hoverColor' | 'hoverBgColor' | 'activeColor' | 'activeBgColor',
    value: string,
): void {
    if (typeof console === 'undefined') return
    const key = `${kind}::${value}`
    if (_warnedColorKeys.has(key)) return
    _warnedColorKeys.add(key)
    console.warn(
        `[origam] received a raw color for prop "${kind}" (value: ${value}). ` +
        `Pass a TIntent ('primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'ghost' | 'neutral') ` +
        `or use a :style binding for one-off custom colors. Raw color support is deprecated and will be removed in v3.0.0.`
    )
}

// ── Deprecated prop-name alias warning ──────────────────────────────────────
// Same once-per-key cache strategy as `warnLegacyColor` above, but for a
// prop that got RENAMED (not a raw-value deprecation). First user: the
// `bgColor` → `accentColor` migration on accent-only components (see
// ROADMAP.md — "Renommer `bgColor` → `accentColor`"). Reused by any future
// prop rename that needs a non-breaking, warn-once alias.

const _warnedDeprecatedPropKeys = new Set<string>()

/**
 * Warn (once per component / old-prop) that the consumer passed a
 * deprecated prop name where the design system now expects the renamed
 * one. The deprecated prop keeps working (alias) until the removal
 * version.
 */
export function warnDeprecatedProp (
    component: string,
    oldProp: string,
    newProp: string,
    removalVersion = 'v3.0.0',
): void {
    if (typeof console === 'undefined') return
    const key = `${component}::${oldProp}->${newProp}`
    if (_warnedDeprecatedPropKeys.has(key)) return
    _warnedDeprecatedPropKeys.add(key)
    console.warn(
        `[origam] <${component}> prop "${oldProp}" is deprecated — use "${newProp}" instead. ` +
        `"${oldProp}" keeps working as an alias and will be removed in ${removalVersion}.`
    )
}
