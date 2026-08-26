import type { ComputedRef } from 'vue'

import type { TStateName } from '../../types/Commons/state-flag.type'
import type { IStateEffectConfig } from './state-effect.interface'

/**
 * Options for `useStateFlag`.
 *
 * `props` (the object being read) stays a POSITIONAL first argument —
 * it's the one parameter every call site has and it can never be
 * confused with anything else (it's an object, not a string). Every
 * other parameter is named, on purpose: the bug this composable fixes
 * is two positional `string` parameters (`prop`, `name`) that swapped
 * meaning at a call site and nothing — not TS, not lint, not review —
 * noticed. `state` being a closed union (`TStateName`) turns that class
 * of mistake into a `TS2322` compile error instead of a silent runtime
 * drift.
 */
export interface IStateFlagOptions<S extends TStateName> {
    /** Identity: drives the class suffix AND the default `source` prop key. */
    state: S
    /** Prop actually read off `props`. Defaults to `state` (e.g. `'active'`). Set to `'modelValue'` for Alert/BottomNav/Badge. */
    source?: string
    /** Component name used in the emitted class. Defaults to `getCurrentInstanceName()`. */
    name?: string
}

/** Return shape of `useStateFlag` — same surface for `hover` and `active`. */
export interface IStateFlagReturn {
    /** Whether the state is currently engaged (pointer-driven, toggled, or forced). */
    isOn: ComputedRef<boolean>
    /** The `IStateEffectConfig` object when the consumer passed one, else `undefined`. */
    config: ComputedRef<IStateEffectConfig | undefined>
    /** Classes to apply on the host while the state is engaged. */
    classes: ComputedRef<string[]>
    /** Engage the state (mirrors legacy `onMouseenter`). */
    set: () => void
    /** Disengage the state (mirrors legacy `onMouseleave`). */
    unset: () => void
    /** Flip the state (mirrors legacy `onActive`). */
    toggle: () => void
}
