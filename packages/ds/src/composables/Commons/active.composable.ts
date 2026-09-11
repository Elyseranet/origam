import { computed, ref } from "vue"
import type { ComputedRef } from "vue"

import { useVModel } from "../../composables"
import { IActiveProps, IActiveState } from "../../interfaces"

import { getCurrentInstanceName } from "../../utils"

/**
 * Track the active (pressed / selected) state of the host element AND
 * expose any style override the consumer attached to the `active` prop.
 *
 * `props.active` (or `props[prop]` when the caller binds a different
 * key like `modelValue`) accepts three shapes — mirrors `useHover`:
 *
 *   • `undefined` / `false` →
 *       isActive    : driven by `onActive()` toggle / v-model.
 *       activeState : undefined.
 *
 *   • `true` →
 *       isActive    : FORCED to `true`. (vmodel sync still works for
 *                     downstream emits, but `isActive` won't drop below
 *                     true while the prop is `true`.)
 *       activeState : undefined.
 *
 *   • `IActiveState` (object: `{ color?, bgColor?, border?, rounded?,
 *     elevation?, padding?, margin?, gap?, enabled? }`) →
 *       isActive    : reactive to `onActive()` (UNLESS `enabled: true`
 *                     is set, which forces it on).
 *       activeState : the object itself — consumed by `useStateEffect`.
 *
 * The `prop` argument lets callers bind a non-`active` key (e.g. Badge
 * and BottomNav use `'modelValue'`); the legacy v-model contract is
 * preserved on that key when it's a plain boolean.
 *
 * `activeClass` (legacy prop) still appends an extra class name when
 * the state is engaged — kept for compat with parent customisation.
 */

/*********************************************************
 * useActive
 ********************************************************/
export function useActive (
    props: IActiveProps & Record<string, any>,
    prop = 'active',
    name = getCurrentInstanceName()
) {
    // v-model bridge — kept so callers passing plain booleans
    // (`<BottomNav v-model="open">`) keep their two-way binding.
    // When the prop holds an `IActiveState` object the vmodel still
    // points at that object, but we don't surface it as `isActive` —
    // `isActive` is derived below from `forced` + a local toggle.
    const vmodel = useVModel(props, prop as keyof typeof props)

    /** Configuration object (when the consumer passed one) or undefined. */
    const activeState: ComputedRef<IActiveState | undefined> = computed(() => {
        const v = (props as any)[prop]
        return v && typeof v === 'object' ? v as IActiveState : undefined
    })

    /** True when the state should be locked on regardless of toggles. */
    const forced = computed<boolean>(() => {
        const v = (props as any)[prop]
        if (v === true) return true
        if (v && typeof v === 'object') return v.enabled === true
        return false
    })

    /** Internal toggle — drives `isActive` when the prop is an object
     *  (since vmodel can't toggle a config object) or undefined. */
    const internalToggle = ref(false)

    const isActive = computed<boolean>(() => {
        if (forced.value) return true
        const v = vmodel.value
        if (typeof v === 'boolean') return v
        return internalToggle.value
    })

    const activeClasses = computed(() => {
        const classes: Array<string> = []

        if (isActive.value) {
            classes.push(`${name}--active`)

            if ((props as any).activeClass) {
                classes.push((props as any).activeClass)
            }
        }

        return classes
    })

    const onActive = () => {
        const v = vmodel.value
        if (typeof v === 'boolean' || v === undefined) {
            // Plain-boolean v-model path: flip via the vmodel so the
            // parent gets `update:active`/`update:modelValue` emits.
            vmodel.value = !isActive.value as any
        } else {
            // Object config path: flip an internal toggle (the config
            // object itself stays stable — only the booleanic active
            // state changes).
            internalToggle.value = !internalToggle.value
        }
    }

    return {
        isActive,
        activeState,
        activeClasses,
        onActive
    }
}
