import { useToggleScope } from '../../composables'

import type { TEventProp, TInnerVal, TVModel } from '../../types'

import { getCurrentInstance, toKebabCase } from '../../utils'

import { computed, nextTick, ref, Ref, toRaw, watch } from 'vue'

/*********************************************************
 * useVModel
 ********************************************************/
export function useVModel<
    Props extends object & { [key in Prop as `onUpdate:${Prop}`]?: TEventProp | undefined },
    Prop extends Extract<keyof Props, string>,
    Inner = Props[Prop],
> (
    props: Props,
    prop: Prop,
    defaultValue?: Props[Prop],
    transformIn: (value?: Props[Prop]) => Inner = (v: any) => v,
    transformOut: (value: Inner) => Props[Prop] = (v: any) => v
): TVModel<Props, Prop, Inner> {
    const vm = getCurrentInstance('useVModel')
    const internal = ref(props[prop] !== undefined ? props[prop] : defaultValue) as Ref<Props[Prop]>
    const kebabProp = toKebabCase(prop)
    const checkKebab = kebabProp !== prop

    // `vm.vnode.props` is `null` when the host component is rendered
    // without ANY props/listeners (e.g. `<my-comp />` with no attributes).
    // Calling `Object.prototype.hasOwnProperty.call(null, key)` throws
    // "Cannot convert undefined or null to object". The `?? {}` fallback
    // mirrors origam's `?.hasOwnProperty(...)` pattern but keeps the
    // prototype-pollution-safe `.call()` form used elsewhere in origam.
    const has = (key: string) => Object.prototype.hasOwnProperty.call(vm.vnode.props ?? {}, key)

    const isControlled = checkKebab
        ? computed(() => {
            void props[prop]
            return (
                (has(prop) || has(kebabProp)) &&
                (has(`onUpdate:${prop}`) || has(`onUpdate:${kebabProp}`))
            )
        })
        : computed(() => {
            void props[prop]
            return has(prop) && has(`onUpdate:${prop}`)
        })

    useToggleScope(() => !isControlled.value, () => {
        watch(() => props[prop], (val) => {
            internal.value = val
        })
    })

    /**
     * True between an emit and the parent's answer.
     *
     * In CONTROLLED mode the getter used to return `props[prop]` and ignore
     * `internal` entirely. Writing the model emits, but the prop only comes
     * back on the parent's next render — so within the current tick a re-read
     * still yielded the PREVIOUS value. Any consumer that writes then reads in
     * the same tick saw its own write vanish.
     *
     * That is not theoretical. `<origam-text-field>` with a mask does exactly
     * this: `handleInput` writes the unmasked value, `useMask` recomputes from
     * the model, and `displayValue` feeds `:value` back to the `<input>`. With
     * a one-tick-late model, Vue rewrote the field with the pre-keystroke value
     * and the typed character was lost — measured at 80 ms between keystrokes,
     * i.e. ordinary human typing (ADR-001).
     *
     * Must be reactive: the getter has to re-evaluate when the flag clears.
     */
    const pendingEmit = ref(false)

    const model = computed({
        get (): any {
            const externalValue = props[prop]

            if (!isControlled.value) return transformIn(internal.value)

            // Optimistic read: until the parent answers, the value this
            // component just wrote is the truthful one.
            return transformIn(pendingEmit.value ? internal.value : externalValue)
        },
        set (internalValue) {
            const newValue = transformOut(internalValue)
            const value = toRaw(isControlled.value ? props[prop] : internal.value)

            if (value === newValue || transformIn(value) === internalValue) {
                return
            }

            internal.value = newValue

            if (isControlled.value) {
                // The optimistic window lasts exactly ONE tick, and that bound
                // is the whole design. A parent is entitled to REFUSE a value —
                // clamp it, normalise it, reject it outright — by simply not
                // updating the prop. Holding the optimistic value until the prop
                // changes would make a refused value stick forever, since no
                // change ever arrives. Clearing on the next tick means the
                // refusal wins at the following render, while still bridging the
                // same-tick read-back gap this exists to close.
                pendingEmit.value = true
                nextTick(() => { pendingEmit.value = false })
            }

            vm?.emit(`update:${prop}`, newValue)
        }
    }) as any as Ref<TInnerVal<Inner>> & { readonly externalValue: Props[Prop] }

    Object.defineProperty(model, 'externalValue', {
        get: () => isControlled.value ? props[prop] : internal.value
    })

    return model
}
