import type { ComputedRef } from 'vue'

import type { TStateName } from '../../types/Commons/state-flag.type'
import type { IStateEffectConfig } from './state-effect.interface'

/*********************************************************
 * IStateFlagOptions
 *
 * @description
 * Options for `useStateFlag`. `props` (the object being read) stays a
 * POSITIONAL first argument on the composable itself — it's the one
 * parameter every call site has and it can never be confused with
 * anything else (it's an object, not a string). Every option here is
 * named, on purpose: the bug this composable fixes is two positional
 * `string` parameters (`prop`, `name`) that swapped meaning at a call site
 * and nothing — not TS, not lint, not review — noticed. `state` being a
 * closed union (`TStateName`) turns that class of mistake into a
 * `TS2322` compile error instead of a silent runtime drift.
 *
 * @description
 * `state` — identity: drives the class suffix AND the default `source`
 * prop key.
 * `source` — prop actually read off `props`. Defaults to `state` (e.g.
 * `'active'`). Set to `'modelValue'` for Alert/BottomNav/Badge.
 * `name` — component name used in the emitted class. Defaults to
 * `getCurrentInstanceName()`.
 ********************************************************/
export interface IStateFlagOptions<S extends TStateName> {
    state: S
    source?: string
    name?: string
}

/*********************************************************
 * IStateFlagReturn
 *
 * @description
 * Return shape of `useStateFlag` — same surface for `hover` and `active`.
 * `isOn` — whether the state is currently engaged (pointer-driven,
 * toggled, or forced). `config` — the `IStateEffectConfig` object when the
 * consumer passed one, else `undefined`. `classes` — classes to apply on
 * the host while the state is engaged.
 *
 * @description
 * `set` engages the state (mirrors legacy `onMouseenter`). `unset`
 * disengages it (mirrors legacy `onMouseleave`). Both always write
 * through the v-model for a boolean/undefined value — required so a
 * plain `v-model:hover`/`v-model:active` keeps emitting.
 *
 * @description
 * `toggle` flips the state (mirrors legacy `onActive`). With no argument,
 * it toggles exactly like before (v-model write for boolean/undefined,
 * internal flip for a config object). With `force` (`true`/`false`), it
 * FORCES `internalToggle` to that value and never touches the v-model —
 * no `update:{source}` emit, even for a plain boolean prop.
 ********************************************************/
export interface IStateFlagReturn {
    isOn: ComputedRef<boolean>
    config: ComputedRef<IStateEffectConfig | undefined>
    classes: ComputedRef<string[]>
    set: () => void
    unset: () => void
    toggle: (force?: boolean | null) => void
}
