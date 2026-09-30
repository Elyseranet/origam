import type { IBorderProps } from './border.interface'
import type { IElevationProps } from './elevation.interface'
import type { IMarginProps } from './margin.interface'
import type { IOpacityProps } from './opacity.interface'
import type { IPaddingProps } from './padding.interface'
import type { IRoundedProps } from './rounded.interface'

import type { TColor } from '../../types/Commons/color.type'

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
    /*********************************************************
     * borderColor
     *
     * @description
     * Border COLOUR override, independent of the `border` shorthand.
     *
     * @description
     * ⚠️ ADR-005's D6 audit missed this one. It lists `opacity` as the
     * single gap on this interface, having checked the variants that set
     * a border WIDTH; `outlined --active` sets a border-COLOUR, which the
     * `border` shorthand above cannot carry.
     *
     * @description
     * Found by remeasuring D6 rather than by reading it, and recorded
     * here because the ADR's own table is incomplete on this row.
     ********************************************************/
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
    /*********************************************************
     * opacity
     *
     * @description
     * Opacity override. This is the half of `OrigamBtn`'s `plain` variant
     * that a preset could not express.
     *
     * @description
     * `plain` is `opacity: var(--origam-opacity---70)` at rest plus
     * `:hover { opacity: 1 }` — i.e. `{ opacity: 70, hover: { opacity: 100 } }`
     * once this key exists (ADR-005 D6).
     ********************************************************/
    opacity?: IOpacityProps['opacity']
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
