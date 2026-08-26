import type { TStateProps } from '../../types/Commons/state-flag.type'

/**
 * The `active` prop accepts three shapes — same grammar as `hover`:
 *
 *   • `undefined` / `false` → `isActive` is driven by interaction
 *     (click / `useVModel(props, 'active')` toggle). Default.
 *
 *   • `true` → `isActive` is FORCED to `true`. Useful for stories,
 *     screenshot tests, or parent-controlled selected states. No visual
 *     override — the state-aware styles fall back to resting tokens.
 *
 *   • `IActiveState` (object) → `isActive` stays reactive to clicks
 *     (unless `enabled: true` is set inside, which forces it on). The
 *     object's keys (`color`, `bgColor`, `border`, `rounded`, `elevation`,
 *     `padding`, `margin`, `gap`) override the resting props ONLY while
 *     the state is engaged.
 *
 * `IActiveProps` is `TStateProps<'active'>` — the single source of truth it
 * shares with `IHoverProps` (`TStateProps<'hover'>`), consumed by the
 * unified `useStateFlag({ state: 'active' })`.
 */
export type IActiveProps = TStateProps<'active'>

/** Emit signature for components that propagate their active state. */
export interface IActiveEmits {
    (e: 'update:active', event: any): void
}
