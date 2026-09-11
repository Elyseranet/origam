import type { IDataTableSortItem, IInternalDataTableHeader } from '../../interfaces'

import type { InjectionKey, Ref } from 'vue'

export const ORIGAM_DATA_TABLE_SORT_KEY: InjectionKey<{
    sortBy: Ref<Array<IDataTableSortItem>>
    toggleSort: (column: IInternalDataTableHeader) => void
    isSorted: (column: IInternalDataTableHeader) => boolean
}> = Symbol.for('origam:data-table-sort')
