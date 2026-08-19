import type { Ref } from 'vue'
import { inject, provide, toRef } from 'vue'
import { useVModel } from '../../composables'
import { ORIGAM_DATA_TABLE_SORT_KEY } from '../../consts'
import { SORT_DIRECTION } from '../../enums'
import type { IDataTableProvideSort, IDataTableSortItem, IDataTableSortProps, IInternalDataTableHeader } from '../../interfaces'

/*********************************************************
 * createSort
 *
 * @description
 * Reads the `sortBy` / `mustSort` / `multiSort` props into the v-model
 * + refs shape `provideSort` expects. Kept alongside `useSort` /
 * `provideSort` in this file — all three address the same
 * `ORIGAM_DATA_TABLE_SORT_KEY` contract. `useSortedItems` (own file)
 * is the pure item-sorting sibling and does not depend on any of the
 * three.
 ********************************************************/
export function createSort (props: IDataTableSortProps) {
    const sortBy = useVModel(props, 'sortBy', [])
    const mustSort = toRef(props, 'mustSort')
    const multiSort = toRef(props, 'multiSort')

    return {sortBy, mustSort, multiSort}
}

/*********************************************************
 * provideSort
 *
 * @description
 * Provider-side hook: wires `toggleSort` / `isSorted` on top of the
 * `sortBy` / `mustSort` / `multiSort` refs (typically built by
 * `createSort`) and provides `ORIGAM_DATA_TABLE_SORT_KEY` for `useSort`
 * consumers down the tree.
 ********************************************************/
export function provideSort (options: {
    sortBy: Ref<Array<IDataTableSortItem>>
    mustSort: Ref<boolean>
    multiSort: Ref<boolean>
    page?: Ref<number>
}): IDataTableProvideSort {
    const {sortBy, mustSort, multiSort, page} = options

    const toggleSort = (column: IInternalDataTableHeader): void => {
        if (column.key == null) return

        let newSortBy = sortBy.value.map(x => ({...x})) ?? []
        const item = newSortBy.find(x => x.key === column.key)

        if (!item) {
            if (multiSort.value) newSortBy = [...newSortBy, {key: column.key, order: SORT_DIRECTION.ASC}]
            else newSortBy = [{key: column.key, order: SORT_DIRECTION.ASC}]
        } else if (item.order === SORT_DIRECTION.DESC) {
            if (mustSort.value) {
                item.order = SORT_DIRECTION.ASC
            } else {
                newSortBy = newSortBy.filter(x => x.key !== column.key)
            }
        } else {
            item.order = SORT_DIRECTION.DESC
        }

        sortBy.value = newSortBy
        if (page) page.value = 1
    }

    const isSorted = (column: IInternalDataTableHeader): boolean => {
        return !!sortBy.value.find((item) => item.key === column.key)
    }

    const data: IDataTableProvideSort = {sortBy, toggleSort, isSorted}

    provide(ORIGAM_DATA_TABLE_SORT_KEY, data)

    return data
}

/*********************************************************
 * useSort
 *
 * @description
 * Reads the injected sort state provided by `provideSort`.
 * Independent from `useSortedItems` (own file) — that hook sorts a
 * plain items array and never touches this injection.
 ********************************************************/
export function useSort () {
    const data = inject(ORIGAM_DATA_TABLE_SORT_KEY)

    if (!data) throw new Error('Missing sort!')

    return data
}
