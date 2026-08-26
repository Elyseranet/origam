import { useToggleScope } from './toggleScope.composable'
import { GLOBAL_STACK, ORIGAM_STACK_KEY } from '../../consts/Commons/stack.const'
import type { IStackProvide } from '../../interfaces/Commons/stack.interface'

import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

import { computed, inject, onScopeDispose, provide, reactive, readonly, Ref, shallowRef, toRaw, watchEffect } from 'vue'

/*********************************************************
 * useStack
 *
 * @description
 * ⛔ ADR-005 — `disableGlobalStack` used to arrive as a plain `boolean`
 * (`props.disableGlobalStack`, read once by the caller's setup() body). A
 * value set via `theme.components['origam-overlay'].disableGlobalStack`
 * is only patched onto `instance.props` in the `beforeCreate` hook the
 * theme-props-resolver installs — a read taken before that hook runs (a
 * plain top-level `const`) can never see it.
 *
 * @description
 * Accepting a `Ref` and re-reading `.value` only inside the reactive
 * scopes below (the toggle-scope callback, the watchEffect) defers every
 * read to render time — same fix shape as `useLink`/`useVModel` under the
 * same issue. `createStackEntry` is a `computed` for the same reason: it
 * must not snapshot `disableGlobalStack` either.
 ********************************************************/
export function useStack (
    isActive: Readonly<Ref<boolean>>,
    zIndex: Readonly<Ref<string | number>>,
    disableGlobalStack: Readonly<Ref<boolean>>
) {
    const vm = getCurrentInstance('useStack')
    const createStackEntry = computed(() => !disableGlobalStack.value)

    const parent = inject(ORIGAM_STACK_KEY, undefined)
    const stack: IStackProvide = reactive({
        activeChildren: new Set<number>()
    })
    provide(ORIGAM_STACK_KEY, stack)

    const _zIndex = shallowRef(+zIndex.value)
    useToggleScope(isActive, () => {
        const lastZIndex = GLOBAL_STACK.at(-1)?.[1]
        _zIndex.value = lastZIndex ? lastZIndex + 10 : +zIndex.value

        if (createStackEntry.value) {
            GLOBAL_STACK.push([vm.uid, _zIndex.value])
        }

        parent?.activeChildren.add(vm.uid)

        onScopeDispose(() => {
            if (createStackEntry.value) {
                const idx = toRaw(GLOBAL_STACK).findIndex(v => v[0] === vm.uid)
                GLOBAL_STACK.splice(idx, 1)
            }

            parent?.activeChildren.delete(vm.uid)
        })
    })

    const globalTop = shallowRef(true)

    watchEffect(() => {
        if (!createStackEntry.value) return

        const _isTop = GLOBAL_STACK.at(-1)?.[0] === vm.uid
        setTimeout(() => globalTop.value = _isTop)
    })

    const localTop = computed(() => !stack.activeChildren.size)

    return {
        globalTop: readonly(globalTop),
        localTop,
        stackStyles: computed(() => ({zIndex: _zIndex.value}))
    }
}
