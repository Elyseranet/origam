import type { ComputedRef } from 'vue'
import { computed, inject, provide, shallowRef } from 'vue'
import { ORIGAM_LIST_KEY } from '../../consts/List/list.const'
import { LIST_ITEM_ROLE } from '../../enums/List/list-item.enum'

import type { TListItemRole } from '../../types/List/list-item.type'

/*********************************************************
 * useCreateList
 *
 * @description
 * Root of a list — tracks whether any item registered a prepend/append
 * slot (so the list can reserve gutter space consistently across all
 * its items), publishes the ARIA role its rows must carry, and provides
 * `ORIGAM_LIST_KEY` for `useList` consumers. Independent from `useList`
 * at the call level (no direct function dependency) — the two only
 * share the `ORIGAM_LIST_KEY` provide/inject contract.
 *
 * @param itemRole
 * The row role for the list being created, passed ONLY by the component
 * that owns the mode (`<OrigamList>`). Every other caller —
 * `<OrigamListChildren>`, which re-provides a scope for its own rows —
 * omits it and INHERITS the role its ancestor list published. Without
 * that inheritance a nested renderer would silently reset every row of
 * a `listbox` back to `listitem`.
 *
 * @description
 * The published `itemRole` stays a lazy `computed` on both branches: the
 * mode derives from props, and ADR-005 writes theme-resolved props AFTER
 * `setup()`. Resolving it eagerly here would snapshot the pre-theme
 * value, and nothing would warn.
 ********************************************************/
export function useCreateList (itemRole?: ComputedRef<TListItemRole>) {
    const parent = inject(ORIGAM_LIST_KEY, {
        hasPrepend: shallowRef(false),
        updateHasPrepend: () => null,
        hasAppend: shallowRef(false),
        updateHasAppend: () => null,
        itemRole: computed<TListItemRole>(() => LIST_ITEM_ROLE.LISTITEM)
    })

    const data = {
        hasPrepend: shallowRef(false),
        hasAppend: shallowRef(false),
        updateHasPrepend: (value: ComputedRef<boolean>) => {
            if (value) data.hasPrepend.value = value.value
        },
        updateHasAppend: (value: ComputedRef<boolean>) => {
            if (value) data.hasAppend.value = value.value
        },
        itemRole: computed<TListItemRole>(() => itemRole ? itemRole.value : parent.itemRole.value)
    }

    provide(ORIGAM_LIST_KEY, data)

    return parent
}
