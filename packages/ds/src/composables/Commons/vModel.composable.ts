import { useToggleScope } from './toggleScope.composable'

import { UNSEEDED } from '../../consts/Commons/vmodel.const'

import type { TEventProp, TInnerVal } from '../../types/Commons/commons.type'
import type { TVModel } from '../../types/Commons/v-model.type'

import { toKebabCase } from '../../utils/Commons/commons.util'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

import { computed, MaybeRefOrGetter, ref, Ref, toRaw, toValue, watch } from 'vue'

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
    defaultValue?: MaybeRefOrGetter<Props[Prop] | undefined>,
    transformIn: (value?: Props[Prop]) => Inner = (v: any) => v,
    transformOut: (value: Inner) => Props[Prop] = (v: any) => v
): TVModel<Props, Prop, Inner> {
    const vm = getCurrentInstance('useVModel')

    /*********************************************************
     *  THE UNCONTROLLED SEED IS READ LAZILY, NOT AT SETUP
     *
     *  @description
     *  `useVModel` runs during `setup()`, and Vue runs `setup()` BEFORE the
     *  `beforeCreate` hook where the ADR-005 theme-props resolver patches
     *  `instance.props`.
     *  Seeding this ref with `props[prop]` right here therefore captured the
     *  value a theme had not yet been able to set, and nothing re-read it
     *  afterwards: the watch below only fires on a LATER change, and swapping
     *  a property descriptor is not a reactive change the watcher can see.
     *  So the ref starts UNSEEDED and the seed is taken on first read instead.
     *  Every read goes through `model`, a computed that first evaluates at
     *  render — comfortably after `beforeCreate` — so the themed value lands.
     *  `UNSEEDED` is a symbol rather than `undefined` because `undefined` is a
     *  legitimate model value that must not be mistaken for "never set".
     *  Measured before this changed: a theme setting `modelValue` on Alert or
     *  NumberField, `focused` on any field, or `indeterminate` on Switch,
     *  produced no change in the rendered markup.
     *
     *  `defaultValue` itself accepts `MaybeRefOrGetter` for the same reason
     *  (#448): a caller passing a raw `props.xxx` expression as the THIRD
     *  ARGUMENT evaluates it at the `useVModel(...)` call site — i.e. during
     *  the host's own `setup()`, still before `beforeCreate` — freezing the
     *  pre-theme value forever. Resolving it via `toValue()` HERE, inside
     *  `seed()`, defers that read to first actual access, mirroring the
     *  `useHold` fix for `holdRepeat` / `holdDelay` (#487). Callers pass
     *  `() => props.xxx` to opt in; a plain value still works unchanged.
     ********************************************************/
    const internal = ref(UNSEEDED) as Ref<Props[Prop] | typeof UNSEEDED>
    const seed = () => (props[prop] !== undefined ? props[prop] : toValue(defaultValue)) as Props[Prop]
    const internalValue = () => (internal.value === UNSEEDED ? seed() : internal.value as Props[Prop])
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

            return transformIn(isControlled.value ? externalValue : internalValue())
        },
        set (internalValue_) {
            const newValue = transformOut(internalValue_)
            const value = toRaw(isControlled.value ? props[prop] : internalValue())

            if (value === newValue || transformIn(value) === internalValue_) {
                return
            }

            internal.value = newValue
            vm?.emit(`update:${prop}`, newValue)
        }
    }) as any as Ref<TInnerVal<Inner>> & { readonly externalValue: Props[Prop] }

    Object.defineProperty(model, 'externalValue', {
        get: () => isControlled.value ? props[prop] : internalValue()
    })

    return model
}
