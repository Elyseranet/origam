import { ComputedRef, inject, provide, shallowRef } from 'vue'
import { ORIGAM_LIST_KEY } from '../../consts'

/*********************************************************
 * useCreateList
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

/*********************************************************
 * useList
 ********************************************************/
export function useList () {
    return inject(ORIGAM_LIST_KEY, null)
}
