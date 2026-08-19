import type { ComputedRef } from 'vue'
import { inject, provide, shallowRef } from 'vue'
import { ORIGAM_LIST_KEY } from '../../consts'

/*********************************************************
 * useCreateList
 *
 * @description
 * Root of a list — tracks whether any item registered a prepend/append
 * slot (so the list can reserve gutter space consistently across all
 * its items) and provides `ORIGAM_LIST_KEY` for `useList` consumers.
 * Independent from `useList` at the call level (no direct function
 * dependency) — the two only share the `ORIGAM_LIST_KEY`
 * provide/inject contract.
 ********************************************************/
export function useCreateList () {
    const parent = inject(ORIGAM_LIST_KEY, {
        hasPrepend: shallowRef(false),
        updateHasPrepend: () => null,
        hasAppend: shallowRef(false),
        updateHasAppend: () => null
    })

    const data = {
        hasPrepend: shallowRef(false),
        hasAppend: shallowRef(false),
        updateHasPrepend: (value: ComputedRef<boolean>) => {
            if (value) data.hasPrepend.value = value.value
        },
        updateHasAppend: (value: ComputedRef<boolean>) => {
            if (value) data.hasAppend.value = value.value
        }
    }

    provide(ORIGAM_LIST_KEY, data)

    return parent
}
