import { BLOCK, BORDER_LOGICAL_AXIS, INLINE } from '../../enums'

import type { TBorderLogicalAxis, TDirectionBoth } from '../../types'

/**
 * Spacing scale steps mirrored by the global utility classes emitted from
 * the Phase 1 manifest (`.origam--p-0` … `.origam--p-12`,
 * `.origam--m-0` … `.origam--m-12`), each resolving to
 * `var(--origam-space---{step})`.
 *
 * Single source of truth: `usePadding` and `useMargin` both previously
 * declared their own private, character-for-character identical set
 * (`UTILITY_PADDING_SCALE` / `UTILITY_MARGIN_SCALE`). They now share this
 * one — the ladder is a property of the token set, not of either axis.
 *
 * IMPORTANT — the scale is opt-in via the STRING form (`padding="4"`).
 * The NUMBER form keeps its legacy raw-pixel semantics
 * (`padding={4}` → `4px`), so the two are NOT interchangeable.
 */
export const SPACING_SCALE_STEPS: ReadonlyArray<string> = [
    '0', '1', '2', '3', '4', '5', '6', '8', '10', '12'
]

/**
 * Physical-side lookup driving the per-side `padding*` wiring.
 *
 * `IPaddingProps` names its discrete side props PHYSICALLY
 * (`paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft`), so —
 * exactly like `BORDER_POSITION_MAP` does for `IBorderProps` — the emitted
 * CSS property stays physical too (`padding-top`, …). No logical/physical
 * mismatch for the consumer to mentally translate.
 *
 * Note this is deliberately NOT the same distribution as the 4-value
 * `padding` shorthand, which spreads across LOGICAL axes in the DS's
 * Haut/Gauche/Bas/Droite order (see `formatPaddingStylesVar` / issue #216).
 */
export const PADDING_POSITION_MAP: ReadonlyArray<{ side: TDirectionBoth, prop: 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' }> = [
    {side: BLOCK.TOP, prop: 'paddingTop'},
    {side: INLINE.RIGHT, prop: 'paddingRight'},
    {side: BLOCK.BOTTOM, prop: 'paddingBottom'},
    {side: INLINE.LEFT, prop: 'paddingLeft'},
] as const

/**
 * Logical-axis lookup driving `paddingBlock` / `paddingInline` wiring.
 *
 * Mirrors `BORDER_LOGICAL_AXIS_MAP`: these two props are already named
 * LOGICALLY and map straight onto the native CSS logical shorthands
 * `padding-block` / `padding-inline` — the browser resolves start/end per
 * the active writing mode, so they stay RTL-safe for free.
 */
export const PADDING_LOGICAL_AXIS_MAP: ReadonlyArray<{ axis: TBorderLogicalAxis, prop: 'paddingBlock' | 'paddingInline' }> = [
    {axis: BORDER_LOGICAL_AXIS.BLOCK, prop: 'paddingBlock'},
    {axis: BORDER_LOGICAL_AXIS.INLINE, prop: 'paddingInline'},
] as const

/**
 * Physical-side lookup driving the per-side `margin*` wiring.
 * Same contract as {@link PADDING_POSITION_MAP}, one axis over.
 */
export const MARGIN_POSITION_MAP: ReadonlyArray<{ side: TDirectionBoth, prop: 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft' }> = [
    {side: BLOCK.TOP, prop: 'marginTop'},
    {side: INLINE.RIGHT, prop: 'marginRight'},
    {side: BLOCK.BOTTOM, prop: 'marginBottom'},
    {side: INLINE.LEFT, prop: 'marginLeft'},
] as const

/**
 * Logical-axis lookup driving `marginBlock` / `marginInline` wiring.
 * Same contract as {@link PADDING_LOGICAL_AXIS_MAP}, one axis over.
 */
export const MARGIN_LOGICAL_AXIS_MAP: ReadonlyArray<{ axis: TBorderLogicalAxis, prop: 'marginBlock' | 'marginInline' }> = [
    {axis: BORDER_LOGICAL_AXIS.BLOCK, prop: 'marginBlock'},
    {axis: BORDER_LOGICAL_AXIS.INLINE, prop: 'marginInline'},
] as const

/**
 * Per-corner lookup driving the `rounded{Corner}` wiring.
 *
 * `IRoundedProps` names its corners PHYSICALLY (`roundedTopLeft`, …), so
 * the emitted CSS property is the PHYSICAL `border-top-left-radius`
 * family — same rule as `BORDER_POSITION_MAP`. The `rounded` shorthand's
 * 4-value mode emits the LOGICAL family (`border-start-start-radius`, see
 * `formatRoundedStylesVar`); since a physical and a logical corner
 * longhand for the same corner cascade against each other by declaration
 * order, pushing the per-corner declarations LAST makes them win — which
 * is precisely the precedence we want.
 */
export const ROUNDED_CORNER_MAP: ReadonlyArray<{ corner: string, prop: 'roundedTopLeft' | 'roundedTopRight' | 'roundedBottomLeft' | 'roundedBottomRight' }> = [
    {corner: 'top-left', prop: 'roundedTopLeft'},
    {corner: 'top-right', prop: 'roundedTopRight'},
    {corner: 'bottom-left', prop: 'roundedBottomLeft'},
    {corner: 'bottom-right', prop: 'roundedBottomRight'},
] as const

/**
 * Named radius variant → primitive radius token.
 *
 * Hoisted out of `useRounded` (where it was re-created on every call and
 * unreachable from anywhere else) so the per-corner props resolve the
 * named vocabulary through the exact same table as the `rounded`
 * shorthand — `roundedTopLeft="large"` and `rounded="large"` cannot drift.
 *
 * `shaped` / `shaped-invert` are deliberately absent: they are
 * corner-asymmetric by definition and stay owned by each component's
 * scoped SCSS.
 */
export const NAMED_RADIUS_TOKEN: Readonly<Record<string, string>> = {
    'x-small': 'var(--origam-radius---xs, 2px)',
    'small':   'var(--origam-radius---sm, 4px)',
    'default': 'var(--origam-radius---md, 8px)',
    'medium':  'var(--origam-radius---lg, 12px)',
    'large':   'var(--origam-radius---xl, 16px)',
    'x-large': 'var(--origam-radius---2xl, 24px)'
}

/**
 * Utility radius rungs and their hard fallbacks.
 *
 * `none` has NO token (none = 0), so a bare `var(--origam-radius---none)`
 * would be an invalid declaration that gets dropped — and a component's
 * hardcoded default radius would then win (`rounded="none"` looked
 * slightly rounded on Audio). The fallback also protects themes that omit
 * a rung. Hoisted out of `useRounded` for the same reason as
 * {@link NAMED_RADIUS_TOKEN}.
 */
export const UTILITY_RADIUS_FALLBACK: Readonly<Record<string, string>> = {
    none: '0',
    xs:   '2px',
    sm:   '4px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    full: '9999px'
}
