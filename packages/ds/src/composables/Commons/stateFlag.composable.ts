import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'

import { useVModel } from './vModel.composable'

import type { IStateFlagOptions, IStateFlagReturn } from '../../interfaces/Commons/state-flag.interface'
import type { IStateEffectConfig } from '../../interfaces/Commons/state-effect.interface'
import type { TStateName } from '../../types/Commons/state-flag.type'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useStateFlag
 *
 * @description
 * `useHover` and `useActive` were the same algorithm written twice: 33 of
 * their 49 lines were byte-identical once the domain word was normalised,
 * and their config types (`IHoverState` / `IActiveState`) were already both
 * aliases of `IStateEffectConfig`. This is the merge — one implementation,
 * driven by `options.state` (`'hover' | 'active'`).
 *
 * @description
 * `props.{state}` (or `props[source]` when `source` is set) accepts three
 * shapes. `undefined` / `false` → `isOn` is driven by `set()` / `unset()` /
 * `toggle()` (pointer events or click, depending on what the component
 * wires up), `config` is undefined. `true` → `isOn` is FORCED to `true`
 * regardless of interaction, `config` is undefined. An `IStateEffectConfig`
 * object → `isOn` is still driven by `set()`/`unset()`/`toggle()` (UNLESS
 * `enabled: true` is set inside the object, which forces it on like the
 * bare `true` case), `config` is the object itself — consumed by
 * `useStateEffect` to swap effective values per axis.
 *
 * @description
 * ⛔ BUG FIX carried over from this merge (was hover-only): `set()` /
 * `unset()` / `toggle()` now all gate on whether the current value is a
 * config object, and if so flip a local `internalToggle` ref INSTEAD of
 * writing through the v-model. `useActive` already did this (that's where
 * `internalToggle` came from). `useHover` did not: its old `onMouseenter`
 * wrote `vmodel.value = true` unconditionally, which — for a controlled
 * `v-model:hover="{ bgColor: 'success' }"` — emitted `true` back to the
 * parent and destroyed the config object on the FIRST mouseenter (measured:
 * `{ bgColor: 'success' }` → `true`, config lost). Unifying on
 * `useActive`'s gate fixes this by construction; hover consumers get it for
 * free.
 ********************************************************/
export function useStateFlag<S extends TStateName> (
    props: object,
    options: IStateFlagOptions<S>
): IStateFlagReturn {
    const { state, source = state, name = getCurrentInstanceName() } = options

    /*********************************************************
     * vmodel
     *
     * @description
     * v-model bridge — kept so callers passing plain booleans
     * (`<BottomNav v-model="open">`) keep their two-way binding. When the
     * prop holds a config object the vmodel still points at that object;
     * `isOn` is derived below from `forced` + `internalToggle` instead.
     ********************************************************/
    const vmodel = useVModel(props as Record<string, unknown>, source as never)

    /*********************************************************
     * config
     *
     * @description
     * Configuration object (when the consumer passed one) or undefined.
     ********************************************************/
    const config: ComputedRef<IStateEffectConfig | undefined> = computed(() => {
        const v = (props as Record<string, unknown>)[source]
        return v && typeof v === 'object' ? v as IStateEffectConfig : undefined
    })

    /*********************************************************
     * forced
     *
     * @description
     * `true` when the state should be locked on regardless of interaction.
     * Two paths set this: bare `{state} === true`, or
     * `{state} === { enabled: true, … }`.
     ********************************************************/
    const forced = computed<boolean>(() => {
        const v = (props as Record<string, unknown>)[source]

        if (v === true) return true
        if (v && typeof v === 'object') return (v as IStateEffectConfig).enabled === true

        return false
    })

    /*********************************************************
     * internalToggle
     *
     * @description
     * Drives `isOn` when the prop is an object (since vmodel can't toggle a
     * config object in place) or undefined.
     ********************************************************/
    const internalToggle = ref(false)

    const isOn = computed<boolean>(() => {
        if (forced.value) return true

        const v = vmodel.value

        if (typeof v === 'boolean') return v

        return internalToggle.value
    })

    const classes = computed(() => {
        const list: Array<string> = []

        if (isOn.value) {
            list.push(`${name}--${state}`)

            /*********************************************************
             * extraClass
             *
             * @description
             * Written as `(props as any).hoverClass` / `(props as
             * any).activeClass` — NOT a templated `props[`${state}Class`]`
             * access — because the `unconsumed-props` guard's static
             * heuristic (scripts/audit-unconsumed-props.mjs,
             * `scanPropReads`) recognises exactly this `(props as
             * TYPE).literal` cast shape (its own comments say so: "`useActive`
             * reads its legacy `activeClass` exactly like this"). A templated
             * key is invisible to that text-based scan, which turned
             * `hoverClass`/`activeClass` into 30 NEW unconsumed-props
             * violations across the 24 migrated components — caught by
             * running `pnpm -F origam guards`, not by reasoning about it.
             ********************************************************/
            const extraClass = state === 'hover' ? (props as any).hoverClass : (props as any).activeClass
            if (extraClass) list.push(extraClass as string)
        }

        return list
    })

    const set = () => {
        const v = vmodel.value
        if (typeof v === 'boolean' || v === undefined) {
            vmodel.value = true as never
        } else {
            internalToggle.value = true
        }
    }

    const unset = () => {
        const v = vmodel.value
        if (typeof v === 'boolean' || v === undefined) {
            vmodel.value = false as never
        } else {
            internalToggle.value = false
        }
    }

    /*********************************************************
     * toggle
     *
     * @description
     * `force` (absorbed from an in-flight, uncommitted edit to the old
     * `active.composable.ts` — see the commit message for the exact diff):
     * when a BOOLEAN, `toggle` FORCES `internalToggle` to that value and
     * never touches the v-model — no `update:{source}` emit, even when the
     * prop is a plain boolean. This is deliberately NOT folded into
     * `set()`/`unset()`: those mirror `onMouseenter`/`onMouseleave` and MUST
     * keep writing through the v-model for the boolean/undefined case
     * (Phase A requires byte-identical behaviour — `hover=false` then
     * `onMouseenter()` still has to flip `isHover` to `true`, which a
     * vmodel-bypassing `internalToggle` write cannot do, since `isOn` reads
     * the boolean branch first). `toggle()` is the direct unification
     * target of `onActive`, so the force parameter lands there.
     *
     * @description
     * ⛔ The guard is `typeof force === 'boolean'`, NOT `force !== null`.
     * `toggle` (aliased `onActive`/`handleClick`/…) is bound DIRECTLY as a
     * template event handler at several of the 40 migrated call sites
     * (`@click="handleClick"`, `@keydown.enter.prevent="onActive"` — Avatar,
     * Sheet, …) with no wrapping arrow function. Vue calls a
     * bare-identifier handler with the native `Event` as its first
     * argument. A `!== null` guard would treat that Event as a truthy
     * "force" value and skip the real toggle logic entirely — a regression
     * the old zero-parameter `onActive()` could never hit. `typeof force
     * === 'boolean'` only engages for an explicit `toggle(true)` /
     * `toggle(false)` call and lets any accidental non-boolean argument
     * (event, undefined) fall through to the unchanged toggle path.
     ********************************************************/
    const toggle = (force?: boolean | null) => {
        if (typeof force === 'boolean') {
            internalToggle.value = force
            return
        }

        const v = vmodel.value
        if (typeof v === 'boolean' || v === undefined) {
            vmodel.value = !isOn.value as never
        } else {
            internalToggle.value = !internalToggle.value
        }
    }

    return {
        isOn,
        config,
        classes,
        set,
        unset,
        toggle
    }
}
