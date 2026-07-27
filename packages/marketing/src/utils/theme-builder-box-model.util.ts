/**
 * theme-builder-box-model.util — Padding / Margin box-model editor
 * (Contrôle 6, `padding-margin-field.html`).
 *
 * ⚠️ ORDER — 4-value serialisation is [top, left, bottom, right], NOT the CSS
 * clockwise convention (`top right bottom left`). Verified against the real
 * DS parsers:
 *   `formatPaddingStylesVar` / `formatMarginStylesVar`
 *   (`packages/ds/src/utils/Commons/{padding,margin}.util.ts`) read
 *   `values[0]` → block-start (top), `values[1]` → inline-start (left),
 *   `values[2]` → block-end (bottom), `values[3]` → inline-end (right).
 * Swapping left/right here would silently invert the two — exactly the trap
 * called out in the wireframe's Constat 4. Every function below is unit
 * tested against this exact order in `packages/tests/TU/theme-builder-box-model.util.spec.ts`.
 *
 * ⚠️ AXIS (2-value / "Vertical / Horizontal") mode is verified functional
 * for `padding` (`formatPaddingStylesVar` handles `case 2`) but BROKEN for
 * `margin` (`formatMarginStylesVar` has no `case 2` — a `margin="8px 16px"`
 * string matches `MARGIN_REGEX` but produces zero styles, silent no-op).
 * `serializeBoxModelAxis` still computes the string (pure function, axis-
 * agnostic) — the UI layer (`useThemeBuilderBoxModelControl`) is the one that
 * disables the axis mode for margin, not this util.
 */
import { THEME_BUILDER_SPACING_SCALE, THEME_BUILDER_SPACING_SCALE_PX } from '~/consts/theme-builder-controls.const'
import type { IThemeBuilderBoxModelEdges, IThemeBuilderBoxModelState } from '~/interfaces/theme-builder.interface'

/** Whether a raw prop value is one of the utility scale digits (`'0'…'12'`). */
export function isThemeBuilderSpacingScale (value: unknown): value is string {
    return typeof value === 'string' && THEME_BUILDER_SPACING_SCALE.includes(value)
}

/**
 * Serialise 4 independent edge values (px) into the DS "Aucun lien" string.
 * Order is [top, left, bottom, right] — see module doc.
 */
export function serializeBoxModelUnlinked (edges: IThemeBuilderBoxModelEdges): string {
    return `${edges.top}px ${edges.left}px ${edges.bottom}px ${edges.right}px`
}

/** Serialise a Vertical/Horizontal pair (px) into the DS 2-value string. */
export function serializeBoxModelAxis (vertical: number, horizontal: number): string {
    return `${vertical}px ${horizontal}px`
}

/** Serialise a single uniform px value into the DS 1-value string. */
export function serializeBoxModelUniform (value: number): string {
    return `${value}px`
}

/**
 * Parse a `PADDING_REGEX`/`MARGIN_REGEX`-shaped CSS length string (1, 2 or 4
 * space-separated values, e.g. `'16px'`, `'12px 24px'`, `'0px 0px 24px 0px'`)
 * back into edge values for the editor. Returns `null` when the string
 * doesn't parse as 1/2/4 plain px lengths (never guesses).
 */
export function parseBoxModelString (raw: string): IThemeBuilderBoxModelState | null {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const parts = trimmed.split(/\s+/)
    const px = (s: string): number | null => {
        const m = /^(-?\d+(?:\.\d+)?)px$/.exec(s)
        return m && m[1] !== undefined ? Number(m[1]) : null
    }

    if (parts.length === 1) {
        const v = px(parts[0] as string)
        if (v === null) return null
        return { mode: 'linked', edges: { top: v, left: v, bottom: v, right: v } }
    }
    if (parts.length === 2) {
        const v = px(parts[0] as string)
        const h = px(parts[1] as string)
        if (v === null || h === null) return null
        return { mode: 'axis', edges: { top: v, bottom: v, left: h, right: h } }
    }
    if (parts.length === 4) {
        const top = px(parts[0] as string)
        const left = px(parts[1] as string)
        const bottom = px(parts[2] as string)
        const right = px(parts[3] as string)
        if (top === null || left === null || bottom === null || right === null) return null
        return { mode: 'unlinked', edges: { top, left, bottom, right } }
    }
    return null
}

/**
 * Resolve the CURRENT prop value (scale digit, DS raw px string, or
 * undefined/inherited) into a starting editor state. Never throws — falls
 * back to an all-zero "linked" state so the editor always has a sane seed.
 */
export function resolveBoxModelState (rawValue: unknown): IThemeBuilderBoxModelState {
    if (isThemeBuilderSpacingScale(rawValue)) {
        const px = THEME_BUILDER_SPACING_SCALE_PX[rawValue] ?? 0
        return { mode: 'linked', edges: { top: px, left: px, bottom: px, right: px } }
    }
    if (typeof rawValue === 'string') {
        const parsed = parseBoxModelString(rawValue)
        if (parsed) return parsed
    }
    return { mode: 'linked', edges: { top: 0, left: 0, bottom: 0, right: 0 } }
}

/** Serialise an editor state back into the exact string `setProp` should write. */
export function serializeBoxModelState (state: IThemeBuilderBoxModelState): string {
    const { mode, edges } = state
    if (mode === 'linked') return serializeBoxModelUniform(edges.top)
    if (mode === 'axis') return serializeBoxModelAxis(edges.top, edges.left)
    return serializeBoxModelUnlinked(edges)
}
