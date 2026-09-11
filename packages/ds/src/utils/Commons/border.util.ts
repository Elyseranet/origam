import { BORDER_REGEX } from '../../consts'
import type { TColor, TDirectionBoth, TIntent } from '../../types'

import { isEmpty } from './commons.util'
import { isCssColor, isIntent, tokenForegroundForIntent } from './color.util'
import { isGradient } from './gradient.util'

/**
 * Format border styles var.
 *
 * @param values …
 * @param type   …
 */
export function formatBorderStylesVar (values: Array<string>, type: string) {
    const styles = []

    switch (values.length) {
        case 1 :
            styles.push(`border-${type}: ${values[0]}`)
            break
        case 2 :
            styles.push(`border-block-${type}: ${values[0]}`)
            styles.push(`border-inline-${type}: ${values[1]}`)
            break
        case 4 :
            styles.push(`border-block-start-${type}: ${values[0]}`)
            styles.push(`border-block-end-${type}: ${values[2]}`)
            styles.push(`border-inline-start-${type}: ${values[1]}`)
            styles.push(`border-inline-end-${type}: ${values[3]}`)
            break
    }

    return styles
}

/**
 * Parse a single per-side border value (`borderTop` / `borderRight` /
 * `borderBottom` / `borderLeft`, issue #215) into width / style / color
 * facets.
 *
 * Reuses `BORDER_REGEX` — the SAME grammar the global `border` shorthand
 * parses in `useBorder` — so a value like `"2px dashed red"` resolves
 * consistently with what `border="2px dashed red"` would produce. Unlike
 * the global shorthand (which can distribute 1/2/4 values across several
 * positions, see `formatBorderStylesVar`), a per-side value always
 * describes exactly ONE side, so each facet resolves to a single token.
 *
 * Mirrors the global string-parsing defaults in `useBorder`: an omitted
 * style defaults to `solid`, an omitted color defaults to `currentColor`
 * (a bare width alone would otherwise paint nothing — `border-style`
 * defaults to `none` per the CSS spec). Unlike the global path, an
 * entirely unparsable / empty value returns `null` instead of emitting
 * blank declarations — the caller skips emission rather than pushing
 * `border-top-width: ` onto the style array.
 */
export function parseBorderPositionValue (value: string): { width: string, style: string, color: string } | null {
    const match = BORDER_REGEX.exec(value)?.groups
    if (!match) return null

    const width = String(match.width ?? '').trim()
    let style = String(match.style ?? '').trim()
    let color = String(match.color ?? '').trim()

    if (isEmpty(width) && isEmpty(style) && isEmpty(color)) return null

    if (isEmpty(style)) style = 'solid'
    if (isEmpty(color)) color = 'currentColor'

    return {width, style, color}
}

/**
 * Format the width/style/color facets resolved by `parseBorderPositionValue`
 * into PHYSICAL per-side CSS declarations (`border-{position}-{type}`).
 *
 * Deliberately physical (not logical, unlike `formatBorderStylesVar`'s
 * 2/4-value output for the global `border` shorthand) — `borderTop` /
 * `borderRight` / `borderBottom` / `borderLeft` are already named
 * physically on `IBorderProps`, so the emitted CSS property stays
 * physical too: no logical/physical mismatch for the consumer to
 * mentally translate.
 */
export function formatBorderPositionStylesVar (position: TDirectionBoth, facets: { width?: string, style?: string, color?: string }): Array<string> {
    const styles: Array<string> = []

    if (!isEmpty(facets.width)) styles.push(`border-${position}-width: ${facets.width}`)
    if (!isEmpty(facets.style)) styles.push(`border-${position}-style: ${facets.style}`)
    if (!isEmpty(facets.color)) styles.push(`border-${position}-color: ${facets.color}`)

    return styles
}

/**
 * Resolve a {@link TColor} value (semantic intent | raw CSS color |
 * gradient | falsy opt-out) into a single CSS color for a
 * `border-{side}-color` declaration (issue #215's `borderTopColor` /
 * `borderRightColor` / `borderBottomColor` / `borderLeftColor`).
 *
 * A border is a STROKE, not a filled surface — so an intent resolves via
 * `tokenForegroundForIntent`, the SAME token family the `color` prop
 * (foreground-only) uses, rather than a background token.
 *
 * Gradients are NOT supported: native CSS `border-color` has no gradient
 * form (only `border-image` does, which is a different, unrelated CSS
 * property and out of scope for this ticket). A gradient value is
 * silently ignored — this is documented on `IBorderProps` so it's not a
 * silent surprise.
 */
export function resolveBorderSideColor (value: TColor): string | null {
    if (!value) return null
    if (isGradient(value)) return null
    if (isIntent(value as string)) return tokenForegroundForIntent(value as TIntent)
    if (typeof value === 'string' && isCssColor(value)) return value

    return null
}
