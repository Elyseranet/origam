import type {
    IBorderProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps
} from '../../interfaces'

import type { TColor } from '../../types'

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
