import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'

import { useVModel } from './vModel.composable'

import type { IStateFlagOptions, IStateFlagReturn } from '../../interfaces/Commons/state-flag.interface'
import type { IStateEffectConfig } from '../../interfaces/Commons/state-effect.interface'
import type { TStateName } from '../../types/Commons/state-flag.type'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/**
 * `useHover` and `useActive` were the same algorithm written twice: 33 of
 * their 49 lines were byte-identical once the domain word was normalised,
 * and their config types (`IHoverState` / `IActiveState`) were already both
 * aliases of `IStateEffectConfig`. `useStateFlag` is the merge — one
 * implementation, driven by `options.state` (`'hover' | 'active'`).
 *
 * `props.{state}` (or `props[source]` when `source` is set) accepts three
 * shapes:
 *
 *   • `undefined` / `false` →
 *       isOn   : driven by `set()` / `unset()` / `toggle()` (pointer events
 *                or click, depending on what the component wires up).
 *       config : undefined.
 *
 *   • `true` →
 *       isOn   : FORCED to `true` regardless of interaction.
 *       config : undefined.
 *
 *   • `IStateEffectConfig` object →
 *       isOn   : still driven by `set()`/`unset()`/`toggle()` (UNLESS
 *                `enabled: true` is set inside the object, which forces it
 *                on like the bare `true` case).
 *       config : the object itself — consumed by `useStateEffect` to swap
 *                effective values per axis.
 *
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
 */

/*********************************************************
 * useStateFlag
 ********************************************************/
export function useStateFlag<S extends TStateName> (
    props: object,
    options: IStateFlagOptions<S>
): IStateFlagReturn {
    const { state, source = state, name = getCurrentInstanceName() } = options

    // v-model bridge — kept so callers passing plain booleans
    // (`<BottomNav v-model="open">`) keep their two-way binding. When the
    // prop holds a config object the vmodel still points at that object;
    // `isOn` is derived below from `forced` + `internalToggle` instead.
    const vmodel = useVModel(props as Record<string, unknown>, source as never)

    /** Configuration object (when the consumer passed one) or undefined. */
    const config: ComputedRef<IStateEffectConfig | undefined> = computed(() => {
        const v = (props as Record<string, unknown>)[source]
        return v && typeof v === 'object' ? v as IStateEffectConfig : undefined
    })

    /**
     * `true` when the state should be locked on regardless of interaction.
     * Two paths set this: bare `{state} === true`, or
     * `{state} === { enabled: true, … }`.
     */
    const forced = computed<boolean>(() => {
        const v = (props as Record<string, unknown>)[source]

        if (v === true) return true
        if (v && typeof v === 'object') return (v as IStateEffectConfig).enabled === true

        return false
    })

    /** Internal toggle — drives `isOn` when the prop is an object (since
     *  vmodel can't toggle a config object in place) or undefined. */
    const internalToggle = ref(false)

    const isOn = computed<boolean>(() => {
        if (forced.value) return true

        const v = vmodel.value

        if (typeof v === 'boolean') return v

        return internalToggle.value
    })

    // ⛔ TEMPORARY (Phase A only — see CLAUDE.md task brief).
    // `hover` keeps emitting `--hovered` (matches today's output, 0 CSS
    // rules) instead of the styled `--hover` suffix (27 CSS rules) so this
    // migration produces byte-identical classes. Phase B fixes the suffix
    // and deletes this branch.
    const classSuffix = state === 'hover' ? 'hovered' : state

    const classes = computed(() => {
        const list: Array<string> = []

        if (isOn.value) {
            list.push(`${name}--${classSuffix}`)

            const extraClass = (props as Record<string, unknown>)[`${state}Class`]
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

    const toggle = () => {
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
