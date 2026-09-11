import { intentBgExpr, isIntent, tokenForegroundForIntent } from '../Commons/color.util'

import type { TColor, TRounded } from '../../types'

/**
 * Mapping table from the canonical `IRoundedProps` taxonomy
 * (`x-small` … `x-large`, plus `shaped[-invert]`) to a per-module
 * corner radius expressed in **module units** ([0, 0.5]). 0 paints
 * strict squares, 0.5 paints circles — anything in between softens
 * the modules without breaking scanner tolerance.
 */
const ROUNDED_TO_CORNER: Readonly<Record<string, number>> = {
    'x-small': 0.10,
    'small': 0.18,
    'default': 0.25,
    'medium': 0.30,
    'large': 0.40,
    'x-large': 0.50,
    'shaped': 0.25,
    'shaped-invert': 0.25
}

/**
 * Transform a DS-shaped colour (intent, raw CSS, `currentColor`,
 * `transparent`, undefined) into a literal CSS string ready to drop
 * inside an SVG `fill=""` attribute.
 *
 *   • `TIntent` (e.g. `'primary'`, `'success'`) → CSS variable
 *     reference (`var(--origam-color__action--primary---fg)`) so the
 *     module colour follows the active theme automatically.
 *   • Raw CSS (`'#abc123'`, `'rgb(0,0,0)'`, `'currentColor'`) → passed
 *     through verbatim.
 *   • `undefined` / `null` / empty → falls back to `fallback`.
 *
 * `role` decides which token slot of the intent is read — and the
 * mapping matches the rest of the DS semantics for `color="primary"`
 * / `bgColor="primary"` on text + surface elements:
 *
 *   • `'foreground'` → the intent's OWN paint (via
 *     `tokenForegroundForIntent`, i.e. `fgSubtle` for primary /
 *     feedback intents, `secondary.fg` for neutral / secondary).
 *     Matches how `useColor` resolves `color="primary"` on any text
 *     element: the text is painted primary itself, NOT its
 *     white-on-dark contrast.
 *   • `'background'` → the intent's `bg` slot (the actual surface
 *     paint, e.g. primary's main violet) — same channel
 *     `bgColor="primary"` uses on Card / Btn / Chip.
 *
 * This means `qrCodeProps.color="primary"` paints PURPLE modules,
 * exactly as a consumer reading "make the modules primary" would
 * expect — not the contrast white-on-primary pairing that
 * `intentFgExpr` returns.
 */
export function resolveQrColor (
    value: TColor | undefined | null,
    role: 'foreground' | 'background',
    fallback: string
): string {
    if (value === null || value === undefined || value === '') return fallback
    if (isIntent(value)) {
        return role === 'foreground'
            ? tokenForegroundForIntent(value)
            : intentBgExpr(value, 'default')
    }
    return String(value)
}

/**
 * Transform a DS-shaped rounded value (`TRounded` named rung, raw
 * number, boolean, or string) into the per-module corner radius the
 * QR encoder expects — a number in **module units** ([0, 0.5]).
 *
 *   • `'x-small'` … `'x-large'` → looked up in `ROUNDED_TO_CORNER`
 *     (0.10 … 0.50 module units, picked so each rung paints a
 *     visibly distinct module shape).
 *   • `true` → 0.50 (legacy "fully rounded" alias).
 *   • `false` / `''` / `null` / `undefined` → 0 (strict squares).
 *   • `number` → clamped to `[0, 0.5]`.
 *   • CSS dimension (`'4px'`, `'0.25rem'`, …) → 0 (modules speak
 *     module units, not pixels — pixel input falls back to
 *     squares instead of silently misbehaving).
 */
export function resolveQrCornerRadius (
    value: TRounded | number | boolean | string | null | undefined
): number {
    if (value === undefined || value === null || value === false || value === '') return 0
    if (value === true) return 0.5
    if (typeof value === 'number') return Math.max(0, Math.min(0.5, value))
    if (typeof value === 'string' && value in ROUNDED_TO_CORNER) {
        return ROUNDED_TO_CORNER[value]
    }
    return 0
}
