/**
 * theme-builder-rounded.util — 4-corner editor (Contrôle 3, `rounded-field.html`).
 *
 * ⚠️ CORRECTION vs the validated wireframe — the wireframe claims the unlinked
 * mode writes independently into `roundedTopLeft` / `roundedTopRight` /
 * `roundedBottomLeft` / `roundedBottomRight` ("ces 4 props existent déjà côté
 * DS, rien à ajouter"). Verified FALSE by reading `useRounded`
 * (`packages/ds/src/composables/Commons/rounded.composable.ts`): those 4 props
 * are declared on `IRoundedProps` but **never read** by the composable — same
 * dead-prop bug class as `borderTop`/`marginTop`/… documented elsewhere in
 * this repo's own wireframes. Wiring the UI to them would silently do
 * nothing (exactly the anti-pattern this repo's CLAUDE.md forbids —
 * "Half-implemented surfaces").
 *
 * The ACTUAL working mechanism (verified in `formatRoundedStylesVar`,
 * `packages/ds/src/utils/Commons/rounded.util.ts`) is a single 4-value CSS
 * string on the `rounded` prop itself, parsed by `BORDER_RADIUS_REGEX`:
 *   values[0] → border-start-start-radius (top-left, LTR)
 *   values[1] → border-start-end-radius   (top-right, LTR)
 *   values[2] → border-end-start-radius   (bottom-left, LTR)
 *   values[3] → border-end-end-radius     (bottom-right, LTR)
 * So BOTH linked and unlinked modes write into the single `rounded` prop —
 * linked as a 1-value string, unlinked as this 4-value TL/TR/BL/BR string.
 * This util only ever targets `rounded`, never the 4 discrete corner props.
 */
import type { IThemeBuilderRoundedCorners } from '~/interfaces/theme-builder.interface'

/** Serialise 4 independent corners (px) into the `rounded` 4-value string (TL/TR/BL/BR). */
export function serializeRoundedCorners (corners: IThemeBuilderRoundedCorners): string {
    return `${corners.topLeft}px ${corners.topRight}px ${corners.bottomLeft}px ${corners.bottomRight}px`
}

/** Serialise a single uniform px value into the `rounded` 1-value string. */
export function serializeRoundedUniform (value: number): string {
    return `${value}px`
}

/** Parse a `rounded` 4-value px string (TL/TR/BL/BR) back into corners. Returns `null` when not a 4-value px string. */
export function parseRoundedCorners (raw: string): IThemeBuilderRoundedCorners | null {
    const parts = raw.trim().split(/\s+/)
    if (parts.length !== 4) return null
    const px = (s: string): number | null => {
        const m = /^(-?\d+(?:\.\d+)?)px$/.exec(s)
        return m && m[1] !== undefined ? Number(m[1]) : null
    }
    const topLeft = px(parts[0] as string)
    const topRight = px(parts[1] as string)
    const bottomLeft = px(parts[2] as string)
    const bottomRight = px(parts[3] as string)
    if (topLeft === null || topRight === null || bottomLeft === null || bottomRight === null) return null
    return { topLeft, topRight, bottomLeft, bottomRight }
}

/** Parse a `rounded` single px value (`'8px'` / `'8'` / `8`). Returns `null` when not a plain length. */
export function parseRoundedUniform (raw: string | number): number | null {
    if (typeof raw === 'number') return raw
    const m = /^(-?\d+(?:\.\d+)?)px$/.exec(raw.trim())
    if (m && m[1] !== undefined) return Number(m[1])
    if (/^-?\d+(?:\.\d+)?$/.test(raw.trim())) return Number(raw.trim())
    return null
}
