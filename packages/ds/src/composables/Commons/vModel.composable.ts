import { useToggleScope } from '../../composables'

import type { TEventProp, TInnerVal, TVModel } from '../../types'

import { getCurrentInstance, toKebabCase } from '../../utils'

import { computed, ref, Ref, toRaw, watch } from 'vue'

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

    const model = computed({
        get (): any {
            const externalValue = props[prop]

            return transformIn(isControlled.value ? externalValue : internal.value)
        },
        set (internalValue) {
            const newValue = transformOut(internalValue)
            const value = toRaw(isControlled.value ? props[prop] : internal.value)

            if (value === newValue || transformIn(value) === internalValue) {
                return
            }

            internal.value = newValue
            vm?.emit(`update:${prop}`, newValue)
        }
    }) as any as Ref<TInnerVal<Inner>> & { readonly externalValue: Props[Prop] }

    Object.defineProperty(model, 'externalValue', {
        get: () => isControlled.value ? props[prop] : internal.value
    })

    return model
}
