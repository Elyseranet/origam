import type { IStateEffectConfig } from '../../interfaces/Commons/state-effect.interface'

/**
 * The closed set of state identities `useStateFlag` knows how to drive.
 * Closed on purpose — passing anything else is now a `TS2322` compile
 * error instead of a silently-ignored string, which is the whole point
 * of unifying `useHover` / `useActive` behind a single `state` key
 * instead of two positional `string` parameters that could (and did)
 * swap meaning undetected.
 */
export type TStateName = 'hover' | 'active'

/**
 * Prop surface contributed for a given state identity `S`:
 *
 *   - `{state}?: boolean | IStateEffectConfig` — the state prop itself
 *     (`hover?`, `active?`).
 *   - `{state}Class?: string` — the legacy extra-class prop
 *     (`hoverClass?`, `activeClass?`).
 *
 * `IHoverProps` / `IActiveProps` are just `TStateProps<'hover'>` /
 * `TStateProps<'active'>` — this is the single source of truth for
 * both, so the two can never drift again.
 */
export type TStateProps<S extends TStateName> =
    { [K in S]?: boolean | IStateEffectConfig } &
    { [K in `${S}Class`]?: string }
