import type {
    IBorderProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps
} from '../../interfaces'

import type { TColor, TFontWeight, TOpacity } from '../../types'

/**
 * Shared shape for state-aware visual overrides (`hover`, `active`).
 *
 * When the consumer passes an OBJECT to the `hover` or `active` prop,
 * its keys override the corresponding resting props ONLY while the
 * state is engaged:
 *
 *     <OrigamCard
 *         bgColor="primary"
 *         :hover="{ bgColor: 'success', border: 'thick', rounded: 'lg' }"
 *     />
 *
 * Resting → bgColor primary, no border, default rounded.
 * On hover → bgColor success, thick border, large rounded.
 *
 * Each axis maps to the property the existing per-axis composable
 * (`useBorder`, `useRounded`, `useElevation`, `usePadding`, `useMargin`,
 * `useColor`) already consumes. `useStateEffect` swaps these inputs
 * reactively per state via `computed`.
 *
 * NOTE: `enabled` exists for the "force-the-state-on AND override
 * styles" case — e.g. a controlled `hover` toggled by parent state
 * that still wants its own colour palette:
 *
 *     <X :hover="{ enabled: forceHover, bgColor: 'success' }" />
 *
 * For the pure force-on case without overrides, pass `hover` as a
 * plain `true` boolean.
 */
export interface IStateEffectConfig {
    /** Force the state on regardless of mouse / pointer events. */
    enabled?: boolean
    /** Foreground (text / icon) colour override while the state is engaged. */
    color?: TColor
    /** Surface background colour override. */
    bgColor?: TColor
    /** Border width / style / direction override. */
    border?: IBorderProps['border']
    /**
     * Border COLOR override, independent of `border` (ADR-005 —
     * `OrigamBtn`'s `outlined` variant preset: `active: { borderColor: … }`,
     * re-expressing the removed `&--variant-outlined &--active {
     * border-color: … }` SCSS, where only the colour changes on selection,
     * not the width/style). Resolved by `useStateEffect` alongside `border`.
     */
    borderColor?: IBorderProps['borderColor']
    /** Corner radius override. */
    rounded?: IRoundedProps['rounded']
    /** Box-shadow elevation override. */
    elevation?: IElevationProps['elevation']
    /** Padding scalar override (paddingTop/Block/Inline NOT supported in state overrides — keep it simple). */
    padding?: IPaddingProps['padding']
    /** Margin scalar override. */
    margin?: IMarginProps['margin']
    /** Gap (flex/grid) override. Components that expose a `gap` prop pick it up. */
    gap?: boolean | number | string
    /**
     * Opacity override (ADR-005 D6 — `OrigamBtn`'s `plain` variant preset:
     * `opacity: '70'`, `hover: { opacity: '100' }`). Resolved by
     * `useStateEffect` exactly like the other axes above.
     */
    opacity?: TOpacity
    /**
     * Font-weight override (ADR-005 — `OrigamBtn`'s `tonal` variant preset:
     * `active: { fontWeight: 'semibold' }`, the props re-expression of the
     * pre-migration `&--variant-tonal &--active { font-weight: 600 }` SCSS).
     * NOT resolved centrally by `useStateEffect` (no shared consumer needs
     * it yet, unlike `opacity`) — typed here only so preset authors can
     * write `active: { fontWeight: … }` and have it type-check; the
     * component that needs it (`OrigamBtn`) reads `activeState.value
     * ?.fontWeight` / `hoverState.value?.fontWeight` directly.
     */
    fontWeight?: TFontWeight
}

/**
 * Hover-state configuration. Same shape as the generic state config —
 * the alias exists so consumer code reads as `IHoverState` (clearer
 * intent than the bare `IStateEffectConfig`).
 */
export type IHoverState = IStateEffectConfig

/**
 * Active-state configuration. Same shape as `IHoverState`.
 */
export type IActiveState = IStateEffectConfig
