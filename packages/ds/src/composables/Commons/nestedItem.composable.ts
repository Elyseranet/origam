import type { Ref } from 'vue'
import { computed, inject, onBeforeUnmount, provide, toRaw } from 'vue'
import { EMPTY_NESTED, ORIGAM_NESTED_KEY } from '../../consts'
import { SELECTED } from '../../enums'
import { getUid } from '../../utils'

/*********************************************************
 * useNestedItem
 *
 * @description
 * Registers a single node (list item, tree node, menu item…) against
 * the nearest `ORIGAM_NESTED_KEY` tree provided by `useNested`.
 * Independent from `useNested` / `useNestedGroupActivator` at the call
 * level (no direct function dependency) — the three only share the
 * `ORIGAM_NESTED_KEY` provide/inject contract.
 ********************************************************/
export function useNestedItem (id: Ref<unknown>, isGroup: boolean) {
    const parent = inject(ORIGAM_NESTED_KEY, EMPTY_NESTED)

    const uidSymbol = Symbol(getUid())
    const computedId = computed(() => id.value !== undefined ? id.value : uidSymbol)

    const item = {
        ...parent,
        id: computedId,
        open: (open: boolean, e: Event) => {
            if (parent?.root) {
                parent.root.open(computedId.value, open, e)
            }
        },
        openOnSelect: (open: boolean, e?: Event) => {
            if (parent?.root) {
                parent.root.openOnSelect(computedId.value, open, e)
            }
        },
        isOpen: computed(() => Boolean(parent?.root?.opened.value.has(computedId.value))),
        parent: computed(() => parent?.root?.parents.value.get(computedId.value)),
        select: (selected: boolean, e?: Event) => {
            if (parent?.root) {
                parent.root.select(computedId.value, selected, e)
            }
        },
        isSelected: computed(() => Boolean(parent?.root?.selected.value.get(toRaw(computedId.value)) === SELECTED.ON)),
        isIndeterminate: computed(() => Boolean(parent?.root?.selected.value.get(computedId.value) === SELECTED.INDETERMINATE)),
        isLeaf: computed(() => Boolean(!parent?.root?.children.value.get(computedId.value))),
        isGroupActivator: parent?.isGroupActivator
    }

    if (!parent?.isGroupActivator) {
        if (parent?.root) {
            parent.root.register(computedId.value, parent?.id.value, isGroup)
        }
    }

    onBeforeUnmount(() => {
        if (!parent?.isGroupActivator) {
            if (parent?.root) {
                parent.root.unregister(computedId.value)
            }
        }
    })

    if (isGroup) {
        provide(ORIGAM_NESTED_KEY, item)
    }

    return item
}
