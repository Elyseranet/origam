import { convertToUnit } from '../Commons/commons.util'
import { isCssColor, isIntent, tokenForegroundForIntent, tokenStylesForIntent } from '../Commons/color.util'
import { BORDER_LOGICAL_AXIS_MAP, BORDER_POSITION_MAP } from '../../consts/Commons/border.const'
import { ROUNDED_CORNER_MAP } from '../../consts/Commons/spacing.const'

import type { IBracketSurfaceInput } from '../../interfaces/Bracket/bracket-surface.interface'
import type { TBracketBorder, TBracketColor, TBracketElevation, TBracketRounded } from '../../types/Bracket/bracket.type'

export type { IBracketSurfaceInput } from '../../interfaces/Bracket/bracket-surface.interface'

/**
 * Shared resolvers for the Bracket family surface. The match card's
 * background / radius / shadow / border are driven through
 * `--origam-bracket-match---*` CSS custom properties; both `OrigamBracket`
 * (which paints every match from the tree root) and `OrigamBracketMatch`
 * (standalone) resolve their props the same way through here — single
 * source of truth, no per-component duplication.
 *
 * Tokenised intents / rungs resolve to the generated theme vars; custom
 * numbers and CSS values pass through `convertToUnit` (or verbatim).
 */

const ROUNDED_RUNGS = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full']
const SHADOW_RUNGS = ['none', 'xs', 'sm', 'md', 'lg', 'xl']
const NAMED_RADIUS_VARS: Record<string, string> = {
    'x-small': 'var(--origam-radius---xs)',
    'small':   'var(--origam-radius---sm)',
    'default': 'var(--origam-radius---md)',
    'medium':  'var(--origam-radius---lg)',
    'large':   'var(--origam-radius---xl)',
    'x-large': 'var(--origam-radius---2xl)'
}
const BORDER_WIDTH_VARS: Record<string, string> = {
    none: 'var(--origam-border__width---0)',
    thin: 'var(--origam-border__width---thin)',
    thick: 'var(--origam-border__width---2)'
}

/** `bgColor` → the match surface fill. */
export function resolveBracketSurface (value: TBracketColor): string | null {
    if (!value) return null
    if (isIntent(value)) return tokenStylesForIntent(value, 'default')['background-color']
    if (value === 'transparent') return 'transparent'
    if (typeof value === 'string' && isCssColor(value)) return value

    return null
}

/** `color` → text colour on the neutral surface (no auto-contrast). */
export function resolveBracketForeground (value: TBracketColor): string | null {
    if (!value) return null
    if (isIntent(value)) return tokenForegroundForIntent(value)
    if (value === 'transparent') return 'transparent'
    if (typeof value === 'string' && isCssColor(value)) return value

    return null
}

/** `rounded` → `border-radius` (named variant / utility rung / free-form). */
export function resolveBracketRadius (value: TBracketRounded): string | null {
    if (value == null || value === false) return null
    if (typeof value === 'string') {
        if (value in NAMED_RADIUS_VARS) return NAMED_RADIUS_VARS[value]
        if (ROUNDED_RUNGS.includes(value)) return `var(--origam-radius---${value})`
        if (value === '') return 'var(--origam-radius---md)'

        return value.includes(' ') ? value : (convertToUnit(value) ?? value)
    }
    if (value === true) return 'var(--origam-radius---md)'

    return convertToUnit(value) ?? null
}

/** `elevation` → `box-shadow` (numeric ladder bucketised to a shadow rung). */
export function resolveBracketShadow (value: TBracketElevation): string | null {
    if (value == null || value === false) return null
    if (typeof value === 'number') {
        const rung = value <= 0 ? 'none' : value <= 2 ? 'xs' : value <= 4 ? 'sm' : value <= 8 ? 'md' : value <= 16 ? 'lg' : 'xl'

        return `var(--origam-shadow---${rung})`
    }
    if (typeof value === 'string' && SHADOW_RUNGS.includes(value)) return `var(--origam-shadow---${value})`
    if (value === true) return 'var(--origam-shadow---md)'

    return typeof value === 'string' ? value : null
}

/** `border` → `border-width` (utility keyword / number / boolean). */
export function resolveBracketBorderWidth (value: TBracketBorder): string | null {
    if (value == null || value === false) return null
    if (typeof value === 'string' && value in BORDER_WIDTH_VARS) return BORDER_WIDTH_VARS[value]
    if (value === true || value === '') return 'var(--origam-border__width---thin)'
    if (typeof value === 'number') return convertToUnit(value) ?? null

    return null
}

/** `borderColor` → a colour value (intent → its token, else the CSS value). */
export function resolveBracketBorderColor (value: TBracketColor): string | null {
    if (!value) return null
    if (isIntent(value)) return tokenForegroundForIntent(value)
    if (typeof value === 'string' && isCssColor(value)) return value

    return null
}

/** SVG dash pattern for a connector matching a `border-style`. */
export function bracketDashArray (borderStyle: string | null | undefined): { dasharray?: string; linecap?: string } {
    if (borderStyle === 'dashed') return { dasharray: '8 5' }
    if (borderStyle === 'dotted') return { dasharray: '1 5', linecap: 'round' }

    return {}
}

/**
 * Assemble the `--origam-bracket-match---*` custom properties for a match
 * surface from a prop bag. Used by both `OrigamBracket` (root, all matches)
 * and `OrigamBracketMatch` (standalone).
 */
export function bracketSurfaceVars (input: IBracketSurfaceInput): Record<string, string> {
    const vars: Record<string, string> = {}

    const surface = resolveBracketSurface(input.bgColor)
    if (surface) {
        vars['--origam-bracket-match---background-color'] = surface
        vars['--origam-bracket-match--hover---background-color'] = surface
    }

    const radius = resolveBracketRadius(input.rounded)
    if (radius) vars['--origam-bracket-match---border-radius'] = radius

    const shadow = resolveBracketShadow(input.elevation)
    if (shadow) vars['--origam-bracket-match---box-shadow'] = shadow

    const borderWidth = resolveBracketBorderWidth(input.border)
    if (borderWidth) vars['--origam-bracket-match---border-width'] = borderWidth

    if (input.borderStyle) vars['--origam-bracket-match---border-style'] = input.borderStyle

    const borderColor = resolveBracketBorderColor(input.borderColor)
    if (borderColor) vars['--origam-bracket-match---border-color'] = borderColor

    // ── Per-corner radius ────────────────────────────────────────────
    // Driven off the SAME `ROUNDED_CORNER_MAP` that `useRounded` uses, so
    // the two cannot drift on corner naming or prop spelling.
    ROUNDED_CORNER_MAP.forEach(({corner, prop}) => {
        const resolved = resolveBracketRadius(input[prop])

        if (resolved) vars[`--origam-bracket-match---border-${corner}-radius`] = resolved
    })

    // ── Per-side border width + color ────────────────────────────────
    BORDER_POSITION_MAP.forEach(({side, widthProp, colorProp}) => {
        const width = resolveBracketBorderWidth(input[widthProp as keyof IBracketSurfaceInput] as TBracketBorder)
        if (width) vars[`--origam-bracket-match---border-${side}-width`] = width

        const sideColor = resolveBracketBorderColor(input[colorProp as keyof IBracketSurfaceInput] as TBracketColor)
        if (sideColor) vars[`--origam-bracket-match---border-${side}-color`] = sideColor
    })

    // ── Logical-axis border width ────────────────────────────────────
    BORDER_LOGICAL_AXIS_MAP.forEach(({axis, widthProp}) => {
        const width = resolveBracketBorderWidth(input[widthProp as keyof IBracketSurfaceInput] as TBracketBorder)

        if (width) vars[`--origam-bracket-match---border-${axis}-width`] = width
    })

    return vars
}
