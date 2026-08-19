import type { InjectionKey } from 'vue'
import { computed, inject, onBeforeUnmount, provide, toRef, watch } from 'vue'
import type { IGroupItemProps, IGroupItemProvide, IGroupProvide } from '../../interfaces'
import { getCurrentInstance, getUid } from '../../utils'

/*********************************************************
 * useGroupItem
 *
 * @description
 * Registers a single item (tab, chip, toggle button…) against the
 * nearest `injectKey` group provided by `useGroup`.
 * Independent from `useGroup` at the call level (no direct function
 * dependency) — the two only share the `injectKey` provide/inject
 * contract.
 ********************************************************/
export function useGroupItem (
    props: IGroupItemProps,
    injectKey: InjectionKey<IGroupProvide>,
    required = true
): IGroupItemProvide | null {
    const vm = getCurrentInstance('useGroupItem')

    if (!vm) {
        throw new Error(
            '[Origam] useGroupItem composable must be used inside a component setup function'
        )
    }

    const id = getUid()

    provide(Symbol.for(`${injectKey.description}:id`), id)

    const group = inject(injectKey, null)

    if (!group) {
        if (!required) return group

        throw new Error(`[Origam] Could not find useGroup injection with symbol ${injectKey.description}`)
    }

    const value = toRef(props, 'value')
    const disabled = computed(() => !!(group.disabled.value || props.disabled))

    group.register({
        id,
        value,
        disabled
    }, vm)

    onBeforeUnmount(() => {
        group.unregister(id)
    })

    const isSelected = computed(() => {
        return group.isSelected(id)
    })

    const selectedClass = computed(() => {
        if (isSelected.value) {
            return [group.selectedClass.value ? group.selectedClass.value : props.selectedClass]
        }

        return []
    })

    watch(isSelected, (value) => {
        vm.emit('group:selected', {value})
    })

    return {
        id,
        isSelected,
        toggle: () => group.select(id, !isSelected.value),
        select: (value: boolean) => group.select(id, value),
        selectedClass,
        value,
        disabled,
        group
    }
}
