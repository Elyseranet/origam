/*********************************************************
 * TStateName
 *
 * @description
 * The closed set of state identities `useStateFlag` knows how to drive.
 * Closed on purpose — passing anything else is now a `TS2322` compile
 * error instead of a silently-ignored string, which is the whole point
 * of unifying `useHover` / `useActive` behind a single `state` key
 * instead of two positional `string` parameters that could (and did)
 * swap meaning undetected.
 *
 * @description
 * ⛔ There is deliberately NO generic `TStateProps<S>` mapped-type helper
 * here (an earlier draft had one, generating `IHoverProps`/`IActiveProps`
 * from `TStateProps<'hover'>`/`TStateProps<'active'>`). `vue-tsc --noEmit`
 * accepted it — full TypeScript resolves mapped generics fine — but
 * `@vue/compiler-sfc`'s lightweight macro resolver (used by every
 * `defineProps<T>()` at actual component-compile time, e.g. under
 * Vite/Vitest) does NOT support mapped types reached through an
 * `interface … extends` clause: every one of the ~30 components whose
 * props interface extends `IHoverProps`/`IActiveProps` failed to compile
 * with "Failed to resolve extends base type" (164 spec files red).
 * Caught by running the full unit suite, not by type-check alone — see
 * the task's "don't claim it's fixed" rule. `IHoverProps`/`IActiveProps`
 * are therefore plain `interface` declarations in
 * hover.interface.ts/active.interface.ts, exactly like every other
 * `*Props` interface in this codebase.
 ********************************************************/
export type TStateName = 'hover' | 'active'
