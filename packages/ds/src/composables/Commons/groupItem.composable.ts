import type { InjectionKey } from 'vue'
import { computed, inject, onBeforeUnmount, provide, toRef, watch } from 'vue'
import type { IGroupItemProps, IGroupItemProvide, IGroupProvide } from '../../interfaces/Commons/group.interface'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * nextGroupItemId
 *
 * @description
 * Runtime identity of one registered group item — deliberately NOT `getUid()`.
 *
 * The two serve different needs and the difference is worth stating, because
 * the obvious refactor (collapse them back into one) reintroduces a bug:
 *
 *  - `getUid()` produces values that land in the DOM (`id`, `for`,
 *    `aria-controls`, and the `#id { … }` rules `useStyle` injects). Those
 *    MUST agree between the server render and the client hydration, which is
 *    why it derives from the component's position in the tree.
 *  - This id never reaches the DOM. `useGroup` only ever compares it
 *    (`findIndex`, `includes`, `filter`); an item's rendered id is the
 *    separate, component-supplied `domId` field on `IGroupItem`. All that is
 *    required here is uniqueness within the process, so a plain counter is
 *    both sufficient and the cheaper option — and it keeps `IGroupProvide`'s
 *    published `id: number` signature intact.
 *
 * ⛔ It is never reset. A counter that only ever goes up cannot hand the same
 * value to two live items; the previous `getUid.reset()` (called once per SSR
 * request from `createOrigam()`'s `install()`) could, and did — see the
 * duplicate-id case in `getCurrentInstance.util.ts`.
 ********************************************************/
let _groupItemId = 0

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

    const id = _groupItemId++

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
