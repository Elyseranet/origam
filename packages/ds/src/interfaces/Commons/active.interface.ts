import type { IStateEffectConfig } from './state-effect.interface'

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
 *   • `IStateEffectConfig` (object) → `isActive` stays reactive to clicks
 *     (unless `enabled: true` is set inside, which forces it on). The
 *     object's keys (`color`, `bgColor`, `border`, `rounded`, `elevation`,
 *     `padding`, `margin`, `gap`) override the resting props ONLY while
 *     the state is engaged.
 *
 * `IActiveProps` shares the exact same shape as `IHoverProps` (see
 * hover.interface.ts for why both stay plain `interface` declarations
 * instead of a shared generic mapped-type alias), consumed by the unified
 * `useStateFlag({ state: 'active' })`.
 */
export interface IActiveProps {
    active?: boolean | IStateEffectConfig
    activeClass?: string
}

/** Emit signature for components that propagate their active state. */
export interface IActiveEmits {
    (e: 'update:active', event: any): void
}
